#!/usr/bin/env bash
# GROUP: fast
# Tip denetimi — halka sınırının 3. katmanı (§3.6 · FAZ-1.1).
#
# `tsc -b` yalnız tip hatası aramaz: project reference grafiğini de doğrular.
# Bir paket `references` listesinde olmayan bir paketi import ederse derleme düşer.
# ESLint atlatılabilir (eslint-disable), depcruise atlatılabilir (config), derleyici
# atlatılamaz — bu yüzden üçüncü katman derleyicidir.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

TSC="$ROOT/node_modules/.bin/tsc"
[ -x "$TSC" ] || { echo "✗ typescript kurulu değil — 'pnpm install' çalıştır"; exit 1; }

out="$("$TSC" -b 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  printf '%s\n' "$out"
  exit 1
fi

# Kapı boş geçmesin: en az bir proje gerçekten derlenmiş olmalı.
n=$(find packages apps -maxdepth 2 -name tsconfig.json 2>/dev/null | wc -l)
[ "$n" -gt 0 ] || { echo "✗ derlenecek hiçbir TS projesi yok — kapı boş geçiyor"; exit 1; }

echo "  $n TS projesi derlendi"
