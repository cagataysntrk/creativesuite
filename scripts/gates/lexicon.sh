#!/usr/bin/env bash
# GROUP: fast
# Lexicon linter — dönem-aşırı kanıt aktarımı (§4.6 · R-32 · FAZ-2.12).
#
# Corpus'taki her `proof_asset` kaydını denetler: eski dönemden gelen bir kanıt
# `generalisation_note` ve `transfer_confidence` taşımak zorunda. Geri dönüşüm sonucu
# ne silinir ne de imalat sonucu gibi sunulur — üçüncü yol argümanla sunmaktır.
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
set -euo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1
node scripts/lexicon.mjs
