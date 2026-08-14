#!/usr/bin/env bash
# just'ın kabuğu. Her recipe'yi .nvmrc'deki Node ile çalıştırır.
# Gerekçe: just taze bir kabukta çalışır, nvm yüklü değildir. Bu olmadan döngü
# her turda Node 20 ile çalışır ve engines kontrolü sessizce yanlış sürümü görür.
set -uo pipefail
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
  nvm use >/dev/null 2>&1 || true
fi
eval "$1"
