#!/usr/bin/env bash
# `just dev` — API ve SPA'yı BİRLİKTE kaldırır, birlikte indirir (FAZ-4.2b).
#
# İkisini ayrı terminalde çalıştırmak, birini kapatıp diğerini açık unutmayı davet eder;
# açık kalan sunucu SQLite handle'ını tutar ve bir sonraki `just dev` kilitli bir
# veritabanıyla karşılaşır. Tek giriş, tek çıkış.
set -uo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

PORT="${SUITE_PORT:-5177}"
export SUITE_PORT="$PORT"

node scripts/sunucu.mjs &
API_PID=$!

( cd apps/ui && "$ROOT/node_modules/.bin/vite" ) &
VITE_PID=$!

# Biri ölürse diğeri de ölür: yarım ayakta bir sistem, "çalışıyor" sanılan bir sistemdir.
kapat() {
  kill "$API_PID" "$VITE_PID" 2>/dev/null
  wait "$API_PID" "$VITE_PID" 2>/dev/null
  exit 0
}
trap kapat INT TERM

wait -n "$API_PID" "$VITE_PID"
kapat
