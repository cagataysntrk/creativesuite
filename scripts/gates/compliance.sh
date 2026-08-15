#!/usr/bin/env bash
# GROUP: fast
# Uyum kapısı — sentetik insan yasağı ve IPTC damgası (§11.3 · R-33 · FAZ-3.11).
#
# Reklam Yönetmeliği Md. 27/12, 1 Ağu 2026'dan yürürlükte: onay ima eden yapay insan
# üretilemez. Kapı iki şey sorar: iddia kurulabiliyor mu ve varlık damgalı mı.
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
set -euo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1
node scripts/compliance-kontrol.mjs
