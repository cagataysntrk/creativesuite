#!/usr/bin/env bash
# GROUP: fast
# ESLint — halka sınırının 1. katmanı (§3.6 · FAZ-1.1).
#
# Kural tablosu `rings.config.mjs`'ten gelir; kural adı `no-restricted-imports` ve
# PAKET ADINA bakar, çözümlenmiş yola değil. Gerekçe eslint.config.js'te yazılı:
# çözümleme gerektiren bir kural, çözemediğinde sessizce yeşil kalır.
set -uo pipefail

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
