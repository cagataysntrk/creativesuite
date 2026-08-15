#!/usr/bin/env bash
# GROUP: fast
# Token kademe zorlaması ve üretilmiş dosya tazeliği (§4.1 · §12.1 · R-65).
#
# Üç kademe (ramp → role → comp) MEKANİK olarak zorlanır: bileşenin ham rampaya
# bağlanması, markayı değiştirdiğinde o bileşenin eski renkte kalması demektir ve bu
# hata çalışma zamanında değil GÖZLE fark edilir — yani fark edilmez.
set -euo pipefail
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1
node scripts/tokens.mjs --check
