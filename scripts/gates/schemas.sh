#!/usr/bin/env bash
# GROUP: fast
# Üretilmiş JSON şemaları güncel mi (§3.2 · FAZ-1.2).
#
# Zod değişip `schemas/` güncellenmezse, commit'li şema sessizce YALAN söyler: editör
# autocomplete'i ve dış doğrulayıcılar artık var olmayan bir zarfı anlatır.
#
# Kapı çalışma ağacını DEĞİŞTİRMEZ: geçici bir dizine üretip commit'li hâliyle
# karşılaştırır. Kendi kendini düzelten bir kapı, hiçbir zaman kırmızı olmayan kapıdır.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

[ -f "packages/kernel/dist/index.js" ] || {
  echo "✗ packages/kernel derlenmemiş — önce 'just gate types'"
  exit 1
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if ! out="$(node scripts/gen-schemas.mjs "$TMP" 2>&1)"; then
  printf '%s\n' "$out"
  exit 1
fi

# Boş geçme koruması: üreteç hiçbir şey yazmadıysa diff de boş çıkar ve kapı yeşil olur.
produced=$(find "$TMP" -name '*.schema.json' | wc -l)
[ "$produced" -gt 0 ] || { echo "✗ üreteç hiçbir şema yazmadı — kapı boş geçiyor"; exit 1; }

if ! diff -ru "$ROOT/schemas" "$TMP" >/dev/null 2>&1; then
  echo "✗ schemas/ güncel değil — Zod değişmiş ama şema üretilmemiş"
  diff -ru "$ROOT/schemas" "$TMP" | head -40
  echo "  → düzeltmek için: just schemas"
  exit 1
fi

echo "  $produced şema güncel"
