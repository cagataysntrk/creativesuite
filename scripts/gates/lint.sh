#!/usr/bin/env bash
# GROUP: fast
# ESLint — halka sınırının 1. katmanı (§3.6 · FAZ-1.1).
#
# Kural tablosu `rings.config.mjs`'ten gelir; kural adı `no-restricted-imports` ve
# PAKET ADINA bakar, çözümlenmiş yola değil. Gerekçe eslint.config.js'te yazılı:
# çözümleme gerektiren bir kural, çözemediğinde sessizce yeşil kalır.
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

ESLINT="$ROOT/node_modules/.bin/eslint"
[ -x "$ESLINT" ] || { echo "✗ eslint kurulu değil — 'pnpm install' çalıştır"; exit 1; }

# Kapı boş geçmesin: yapılandırma gerçekten dosya eşlemeli.
n=$("$ESLINT" --no-warn-ignored . --format json 2>/dev/null | node -e \
  'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).length)}catch{console.log(0)}})')
if [ "${n:-0}" -lt 1 ]; then
  echo "✗ ESLint hiçbir dosyaya bakmadı — 'ignores' fazla geniş, kapı boş geçiyor"
  exit 1
fi

out="$("$ESLINT" . 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  printf '%s\n' "$out"
  exit 1
fi

echo "  $n dosya denetlendi"
