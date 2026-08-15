#!/usr/bin/env bash
# GROUP: fast
# Sağlayıcı tanımlayıcıları sözleşmeye uyuyor mu (§8.1 · §8.4 · R-42, R-43, R-51).
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
set -euo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1
node scripts/providers-kontrol.mjs
