#!/usr/bin/env bash
# GROUP: fast
# dependency-cruiser — halka sınırının 2. katmanı + döngü yasağı (§3.6 · FAZ-1.1).
#
# ESLint tek dosyaya bakar, bu grafiğe bakar. Fark döngüde ortaya çıkar: a→b→c→a
# zincirinin hiçbir adımı tek başına kural ihlal etmez, zincir eder. Klasör kapsamı
# da denetlenir — modül seviyesinde temiz görünen iki paket klasör seviyesinde
# birbirine kilitlenmiş olabilir.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

DC="$ROOT/node_modules/.bin/depcruise"
[ -x "$DC" ] || { echo "✗ dependency-cruiser kurulu değil — 'pnpm install' çalıştır"; exit 1; }

out="$("$DC" --config .dependency-cruiser.mjs packages apps 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  printf '%s\n' "$out"
  exit 1
fi

# Kapı boş geçmesin: grafik gerçekten kurulmuş ve paketler arası kenar görülmüş olmalı.
# "0 dependencies cruised" yeşil raporlar ama hiçbir şey denetlememiştir.
deps=$(printf '%s' "$out" | sed -n 's/.*, \([0-9]\{1,\}\) dependencies cruised.*/\1/p' | head -1)
if [ -z "${deps:-}" ] || [ "$deps" -lt 1 ]; then
  echo "✗ depcruise hiçbir bağımlılık görmedi — kapı boş geçiyor"
  printf '%s\n' "$out"
  exit 1
fi

printf '%s\n' "$out" | tail -1
