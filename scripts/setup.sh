#!/usr/bin/env bash
# Araç zinciri kontrolü. Eksik olanı SÖYLER, sessizce devam etmez.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1
miss=0
need() {
  printf '  %-10s ' "$1"
  if command -v "$1" >/dev/null 2>&1; then printf '✓ %s\n' "$(${2:-true} 2>&1 | head -1)"
  else printf '✗ EKSİK — %s\n' "$3"; miss=1; fi
}
echo "── araç zinciri ──"
need node   "node -v"        "nvm install 22"
need pnpm   "pnpm -v"        "corepack enable && corepack prepare pnpm@latest --activate"
need just   "just --version" "cargo install just  (veya apt)"
need git    "git --version"  "apt install git"
need ffmpeg "ffmpeg -version" "sudo apt-get install -y ffmpeg"
need xvfb-run "xvfb-run --help" "sudo apt-get install -y xvfb"
need sops   "sops --version"  "github.com/getsops/sops sürümlerinden binary"
need age    "age --version"   "sudo apt-get install -y age"
echo
node -e 'const m=process.versions.node.split(".")[0]; if(m!=="22"){console.error("  ✗ Node major "+m+", 22 olmalı (.nvmrc)");process.exit(1)}' || miss=1
[ $miss -eq 0 ] && echo "✓ araç zinciri tam" || { echo; echo "✗ eksikler var — yukarıdaki komutları çalıştır"; exit 1; }

# ── git kancaları (§14 · FAZ-8.7) ────────────────────────────────────────────
#
# ⚠ **Bunu hiçbir betik kurmuyordu.** Kancalar bu makinede bir kez elle
# ayarlanmıştı; temiz bir klonda `core.hooksPath` BOŞ kalıyor ve **tüm commit
# kapıları sessizce devre dışı** oluyordu — `commit-msg` çalışmıyor, AI imzası
# yasağı (R-61) ve iki commit sınıfı (R-60) hiç görülmüyor.
#
# Geri yükleme tatbikatı buldu (FAZ-8.7): kurtarılmış bir depoda ilk commit,
# kuralları hiç görmeden geçerdi. `repo-hygiene` kapısı bunu yakalıyor ama kapı
# ancak `just check` koşulursa konuşur; kancayı kurmak `just setup`un işi.
if [ -d .githooks ]; then
  mevcut="$(git config --get core.hooksPath || echo '')"
  if [ "$mevcut" != ".githooks" ]; then
    git config core.hooksPath .githooks
    echo "✓ git kancaları kuruldu (core.hooksPath=.githooks)"
  else
    echo "✓ git kancaları zaten kurulu"
  fi
else
  echo "⚠ .githooks dizini YOK — commit kapıları kurulamıyor"
fi
