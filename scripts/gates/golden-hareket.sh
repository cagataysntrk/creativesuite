#!/usr/bin/env bash
# GROUP: all
# Hareket katmanının tarayıcısı tipografiyi bozmuyor (R-30 · R-31 · D-194 · FAZ-5.1).
#
# `GROUP: all` — iki Chromium başlatıyor ve saniyeler sürüyor; `just check`in hızlı
# turuna koymak, her commit'i yavaşlatıp kapının kapatılmasına yol açardı.
set -euo pipefail
export LC_ALL=C
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1
node scripts/golden-hareket.mjs
