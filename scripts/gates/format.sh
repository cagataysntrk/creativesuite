#!/usr/bin/env bash
# GROUP: fast
# Biçim — prettier --check (FAZ-0.C.1).
#
# Neden kapı: bu repodaki kodun çoğunu bir agent yazıyor. Biçim tutarsızlığı diff'i
# gürültüye boğar ve gürültülü diff okunmayan diff'tir — "agent önerir, insan uygular"
# (§5.4) yalnız diff gerçekten okunabildiği sürece bir güvenlik hikâyesidir.
#
# Belgeler ve `secrets/` KAPSAM DIŞI (.prettierignore): nesir yeniden akıtılırsa satır
# tavanları anlamsızlaşır, şifreli dosya yeniden biçimlendirilirse MAC bozulur ve bir
# daha açılmaz. 2026-08-15'te prettier tam olarak bunu yaptı; ignore listesi o yüzden var.
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

PRETTIER="$ROOT/node_modules/.bin/prettier"
[ -x "$PRETTIER" ] || { echo "✗ prettier kurulu değil — 'pnpm install' çalıştır"; exit 1; }

# Şifreli secret'ların kapsam dışı KALDIĞINI doğrula. Bu satır silinirse kapı,
# koruması gereken dosyayı bozan araca dönüşür.
grep -q '^secrets/$' .prettierignore || {
  echo "✗ .prettierignore 'secrets/' satırını kaybetmiş — prettier şifreli dosyayı bozar"
  exit 1
}

out="$("$PRETTIER" --check . 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  printf '%s\n' "$out"
  echo "  → düzeltmek için: just fmt"
  exit 1
fi

n=$("$PRETTIER" --list-different . >/dev/null 2>&1; find packages apps scripts -name '*.ts' -o -name '*.mjs' 2>/dev/null | wc -l)
echo "  biçim temiz ($n kaynak dosya kapsamda)"
