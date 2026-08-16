#!/usr/bin/env bash
# GROUP: fast
# Belge satır tavanları — tek otorite (FAZ-0.C.9).
# Gerekçe: agent'ın her turda okuduğu dosyalar şişerse bağlam yanar ve kimse okumaz.
# Şişen bir CLAUDE.md, olmayan bir CLAUDE.md'den kötüdür: okunmadığı hâlde okunmuş sayılır.
set -uo pipefail

# ⚠ LC_ALL=C ZORUNLU. `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe
# collation'a göre çözülür ve `[A-Za-z]` aralığı `i`/`I` çevresinde KIRILIR:
#   $ LANG=tr_TR.UTF-8 grep -oE "[a-z.]+@[a-z.]+" <<< "ahmet.yilmaz@dokumsanayi.com.tr"
#   lmaz@dokumsanay          ← "yilmaz"ın başı ve "sanayi"nin sonu düştü
# Yani desen eşleşiyormuş gibi görünür ama YARIM eşleşir; kapı da yeşil raporlar.
# 2026-08-15'te bu, gerçek bir e-posta adresinin KVKK kapısından geçmesine yol açtı.
# Bu, `'i'.toUpperCase()` → `I` hatasının (R-21) kabuk seviyesindeki kardeşidir.
export LC_ALL=C
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 1

# dosya:tavan
LIMITS="
CLAUDE.md:200
KURALLAR.md:400
KARARLAR.md:600
DURUM.md:120
docs/ANAYASA.md:1400
docs/LOOP.md:300
"

fail=0
while IFS=: read -r f limit; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  if [ "$n" -gt "$limit" ]; then
    echo "$f: $n satır, tavan $limit"
    fail=1
  fi
done <<< "$LIMITS"

# ── ANAYASA ALT BÖLÜM tavanı (R-63 · D-230) ──────────────────────────────────
#
# **Okuma maliyeti alt bölümün boyudur, belgenin değil.** Atıflar `§3.4` biçiminde
# veriliyor ve `just tur` o alt bölümü getiriyor; toplam satır sayısı yanlış birimi
# ölçüyordu. Bugün en büyük alt bölüm 38 satır (§7.6) — 60 tavanı bugünkü gerçekliğe
# yakın ve gelecek şişmeyi gerçekten sınırlıyor.
#
# ⚠ Sınır bir sonraki `###` VEYA `##` başlığıdır. Yalnız `###` sayılsaydı son alt
# bölüm dosya sonuna kadar uzar ve §12.9 28 satır yerine 215 görünürdü — ölçüm
# aracının kendisi yanlış alarm verirdi.
ALT_TAVAN=60
if [ -f docs/ANAYASA.md ]; then
  awk -v tavan="$ALT_TAVAN" '
    /^#{2,3} §/ {
      if (bas ~ /^### /) {
        boy = NR - bas_no
        if (boy > tavan) { printf "docs/ANAYASA.md: %s — %d satir, alt bolum tavani %d\n", bas, boy, tavan; hata = 1 }
      }
      bas = $0; bas_no = NR
    }
    END {
      if (bas ~ /^### /) {
        boy = NR - bas_no + 1
        if (boy > tavan) { printf "docs/ANAYASA.md: %s — %d satir, alt bolum tavani %d\n", bas, boy, tavan; hata = 1 }
      }
      exit hata
    }
  ' docs/ANAYASA.md || fail=1
fi

# Faz dosyaları ve yol-kapsamlı kurallar
for f in docs/fazlar/FAZ-*.md; do
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  [ "$n" -le 250 ] || { echo "$f: $n satır, tavan 250"; fail=1; }
done
for f in .claude/rules/*.md; do
  [ -f "$f" ] || continue
  n=$(wc -l < "$f" | tr -d ' ')
  [ "$n" -le 120 ] || { echo "$f: $n satır, tavan 120"; fail=1; }
done

exit $fail
