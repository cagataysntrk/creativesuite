#!/usr/bin/env bash
# GROUP: all
#
# ⚠ ⚠ **TEST KAPISI `fast`TAN `all`A ALINDI — DEPO SAHİBİNİN KARARI.** Pre-commit her
# commit'te bütün paketi koşuyordu ve bu dakikalar sürüyor: bir commit için üç-beş
# dakika beklemek, küçük adımlarla çalışmayı imkânsız kılıyor. Sahibi: *"precommit
# testlerini zorunlu yapma, sadece istediğimde yaparız, bu işi baltalıyor — zaten bu
# testleri geliştirirken çalıştırıyoruz."*
#
# ⚠ **KAPI KALDIRILMADI, YERİ DEĞİŞTİ.** `all` grubu `just verify` ve push öncesi
# koşuyor; yani testler hâlâ zorunlu, sadece HER COMMIT'te değil. Yapısal kapılar
# (biçim, tip, commit-msg, sızıntı, darboğaz) `fast`ta kaldı çünkü onlar saniyeler
# sürüyor ve yakaladıkları şey geri alınamaz (§14).
# ⚠ Tek tek koşmak için: `just gate tests`
# Vitest — tek koşucu (§15 · FAZ-1.10).
#
# Kapı boş geçmesin diye İKİ eşik var: en az bir test dosyası ve en az bir geçen test.
# Sıfır testle "0 passed" raporlayan bir koşucu yeşil çıkış kodu verir — ve o gün
# `just check` hiçbir şey kanıtlamayan bir tören hâline gelir.
#
# Uzun/kapsamlı test turu burada KOŞMAZ (LOOP§B.4). Bu paket saniyeler sürmeli;
# dakikalar süren bir commit kapısı, atlanan bir commit kapısıdır.
set -uo pipefail

# ⚠ LC_ALL=C ZORUNLU. `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe
# collation'a göre çözülür ve `[A-Za-z]` aralığı `i`/`I` çevresinde KIRILIR:
#   $ LANG=tr_TR.UTF-8 grep -oE "[a-z.]+@[a-z.]+" <<< "ahmet.yilmaz@dokumsanayi.com.tr"
#   lmaz@dokumsanay          ← "yilmaz"ın başı ve "sanayi"nin sonu düştü
# Yani desen eşleşiyormuş gibi görünür ama YARIM eşleşir; kapı da yeşil raporlar.
# 2026-08-15'te bu, gerçek bir e-posta adresinin KVKK kapısından geçmesine yol açtı.
# Bu, `'i'.toUpperCase()` → `I` hatasının (R-21) kabuk seviyesindeki kardeşidir.
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

VITEST="$ROOT/node_modules/.bin/vitest"
[ -x "$VITEST" ] || { echo "✗ vitest kurulu değil — 'pnpm install' çalıştır"; exit 1; }

dosya=$(find packages apps -name '*.test.ts' 2>/dev/null | wc -l)
if [ "$dosya" -lt 1 ]; then
  echo "✗ hiç test dosyası yok — kapı boş geçiyor"
  exit 1
fi

out="$("$VITEST" run 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  printf '%s\n' "$out"
  exit 1
fi

gecen=$(printf '%s' "$out" | sed -n 's/.*Tests[[:space:]]*\([0-9]\{1,\}\) passed.*/\1/p' | head -1)
if [ -z "${gecen:-}" ] || [ "$gecen" -lt 1 ]; then
  echo "✗ hiçbir test koşmadı — koşucu yeşil raporluyor ama iş yapmıyor"
  printf '%s\n' "$out" | tail -10
  exit 1
fi

echo "  $dosya dosya · $gecen test geçti"
