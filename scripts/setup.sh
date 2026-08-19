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

# ── üretim önkoşulları (FAZ-16.5) ────────────────────────────────────────────
#
# ⚠ ⚠ **ARAÇ ZİNCİRİ TAM OLMASI ÜRETEBİLDİĞİN ANLAMINA GELMİYOR.** Bu bölüm eksikti
# ve eksikliği belgede YAZIYORDU: `local-rembg` sağlayıcısının yorumu "`just setup`
# yeniden kurar" diyor, oysa setup `.venv-gorsel`e hiç dokunmuyordu. Temiz bir klonda
# `node`, `pnpm`, `sops` hepsi ✓ görünüyor ve ilk `just uret` yine düşüyordu.
#
# ⚠ Kurulan şey UCUZ olanlar; 1 GB'lık RMBG modeli indirilmiyor, ADIYLA bildiriliyor.
# Bir kurulum betiğinin sessizce gigabayt indirmesi, kullanıcının vermediği bir karar.
echo
echo "── üretim önkoşulları ──"
eksik=0
bildir() { printf '  %-22s %s\n' "$1" "$2"; }

if [ -d node_modules ]; then bildir "bağımlılıklar" "✓"
else bildir "bağımlılıklar" "✗ kuruluyor…"; pnpm install --frozen-lockfile || eksik=1; fi

if [ -d "$HOME/.cache/ms-playwright" ] && ls "$HOME/.cache/ms-playwright" | grep -q chromium; then
  bildir "Chromium (render)" "✓"
else
  bildir "Chromium (render)" "✗ kuruluyor…"
  ./node_modules/.bin/playwright install chromium || eksik=1
fi

if [ -x .venv-gorsel/bin/python ]; then bildir "arka plan silici" "✓"
else
  bildir "arka plan silici" "✗ kuruluyor…"
  python3 -m venv .venv-gorsel && .venv-gorsel/bin/pip -q install "rembg[cpu]" pillow || {
    bildir "arka plan silici" "✗ kurulamadı — python3-venv gerekiyor: sudo apt install python3-venv"
    eksik=1
  }
fi

# ⚠ Model 1,02 GB ve ilk kullanımda kendiliğinden iniyor; burada yalnız DURUM bildirilir.
if [ -d "$HOME/.rembg/models" ] && [ -n "$(ls -A "$HOME/.rembg/models" 2>/dev/null)" ]; then
  bildir "RMBG modeli" "✓"
else
  bildir "RMBG modeli" "⚠ yok — ilk koşuda ~1 GB inecek (normaldir)"
fi

# ⚠ Secret DEĞERİ hiçbir zaman yazdırılmıyor; yalnız çözülebiliyor mu diye bakılıyor.
if [ -f secrets/secrets.enc.yaml ]; then
  if sops -d secrets/secrets.enc.yaml >/dev/null 2>&1; then bildir "secret anahtarı" "✓"
  else bildir "secret anahtarı" "✗ çözülemiyor — age anahtarını ~/.config/sops/age/keys.txt konumuna koy"; eksik=1; fi
else
  bildir "secret dosyası" "⚠ secrets/secrets.enc.yaml yok — görsel üreten hatlar koşmaz"
fi

for m in brand/*/; do
  ad="$(basename "$m")"
  if [ -f "$m/derived-tokens/tokens.css" ]; then bildir "marka: $ad" "✓"
  else bildir "marka: $ad" "✗ türetilmiş token yok — just tokens"; eksik=1; fi
done

if [ -n "$(ls -A corpus 2>/dev/null)" ]; then bildir "corpus" "✓"
else bildir "corpus" "⚠ boş — bilgi seçimi zayıf kalır"; fi

echo
if [ $eksik -eq 0 ]; then
  # ⚠ ⚠ **ARAÇ VE BELGE AYNI ŞEYİ SÖYLEMELİ.** README ve SKILLS.md paneli öne aldı
  # (başlatma, kapı onayı ve canlı izleme tek yerden) ama bu satır hâlâ CLI'yi
  # gösteriyordu. Bir depoyu klonlayan insan, aracın SON SATIRINI izler — belgeyi
  # değil. İki yer ayrıştığında kazanan, gözünün önündeki satırdır.
  echo "✓ üretime hazır — sonraki adım:"
  echo "    just dev        # panel: http://localhost:5173 — tür seç, başlat, onayla"
  echo
  echo "  komut satırını tercih edersen:"
  echo "    sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel \"<konu>\"'"
  echo "    sops exec-env secrets/secrets.enc.yaml 'just uret instagram-karosel --konu-sec'"
else
  echo "✗ üretim önkoşulları eksik — yukarıdaki satırları çöz"
  exit 1
fi
