#!/usr/bin/env bash
# GROUP: fast
# Dönem bütünlüğü (§4.3 · D-30 · FAZ-2.6).
#
# Her `era.yaml` için bir `git tag era/<slug>` olmak zorunda. Etiketsiz dönem, git
# geçmişinde tutamağı olmayan bir dönemdir: "o günkü ağacı ver" sorusu cevapsız kalır
# ve dönem modeli üç ucuz parçadan ikisine iner.
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
set -euo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1
node scripts/era-kontrol.mjs
