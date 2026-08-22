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

# ⚠ ⚠ **SUNUCU ANAHTARSIZ KALKIYORDU VE PANELDEKİ "Başlat" BU YÜZDEN KİLİTLİYDİ.**
# Ücretli adımların sağlayıcısı çözülemeyince tahmin EKSİK kalıyor, eksik tahminle onay
# verilemiyor (freeze.ts · §8.3) — yani panel kurulu ama üretim başlatılamaz durumdaydı.
# Belirti "düğme bozuk" gibi görünüyordu; sebep sunucunun ortamıydı.
#
# Kabuk KENDİNİ sops altında yeniden çağırıyor: çocuklar ortamı doğal yoldan devralıyor
# ve mevcut öldürme mantığı olduğu gibi kalıyor. Anahtar yoksa (depoyu yeni klonlayan
# takım arkadaşı) düşüş SESSİZ DEĞİL — ne olduğu ve neyin çalışmayacağı yazılıyor.
if [ "${SUITE_SIRLAR:-}" != "acik" ] && [ -f secrets/secrets.enc.yaml ] && command -v sops >/dev/null 2>&1; then
  if SUITE_SIRLAR=acik sops exec-env secrets/secrets.enc.yaml "bash '$ROOT/scripts/dev.sh'"; then
    exit 0
  fi
  echo "uyarı: sops anahtarları çözemedi — sunucu ANAHTARSIZ kalkıyor." >&2
  echo "       ücretli adımlar fiyatlanamayacak ve panelde Başlat kilitli kalacak." >&2
fi

PORT="${SUITE_PORT:-5177}"
export SUITE_PORT="$PORT"

node scripts/sunucu.mjs &
API_PID=$!

( cd apps/ui && "$ROOT/node_modules/.bin/vite" ) &
VITE_PID=$!

# ⚠ ⚠ **DÜZENLEYİCİ DE BURADAN KALKIYOR — üç süreç TEK komut.** Depo sahibi: *"5173
# çalışıyor ama 4321 yani editör çalışmıyor, bunlar ikisi tek gibi çalışmalı."* Haklı:
# panelden *"bu koşuyu editörde aç"* bağlantısı 4321'e gidiyor ve o port kapalıysa
# bağlantı ölü bir düğme oluyor. Ayrı komutla kaldırmayı hatırlamak bir kullanıcı
# görevi değil, bir tasarım hatasıdır.
#
# ⚠ Derleme burada BİR KEZ yapılıyor: `just duzenle` kendi `tsc -b`sini koşuyordu ve iki
# derleme aynı `dist`e yazarken birbirini ezebiliyor. Sunucu zaten derlenmiş dist'i
# okuyor; düzenleyici de öyle.
node scripts/duzenleyici.mjs &
EDITOR_PID=$!

# Biri ölürse diğeri de ölür: yarım ayakta bir sistem, "çalışıyor" sanılan bir sistemdir.
kapat() {
  kill "$API_PID" "$VITE_PID" "$EDITOR_PID" 2>/dev/null
  wait "$API_PID" "$VITE_PID" "$EDITOR_PID" 2>/dev/null
  exit 0
}
trap kapat INT TERM

wait -n "$API_PID" "$VITE_PID" "$EDITOR_PID"
kapat
