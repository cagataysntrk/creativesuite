#!/usr/bin/env bash
# GROUP: fast
# Üretilmiş belge sapması (§8.7 · R-65 · FAZ-0.B.2c).
#
# `just docs` çalıştırılır ve `git diff` BOŞ olmalı. Boş değilse ya üreteç değişmiş ve
# belge tazelenmemiş, ya belge elle düzenlenmiş. İkisi de aynı sonucu verir: belge,
# kaynağının söylemediği bir şey söyler.
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
set -uo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1

# ⚠ `cesitlilik-defteri.md` FAZ-13.4'te eklendi ama listeye yazılmamıştı: üreteç ÜÇ
# dosya yazıyordu, kapı İKİSİNİ denetliyordu — dosyanın kendi başlığındaki "elle düzenleme
# kaybolur (R-65)" iddiasını zorlayan hiçbir şey yoktu (bağımsız doğrulama, bulgu 12).
HEDEFLER="docs/referans/saglayicilar.md docs/referans/pipelinelar.md docs/referans/cesitlilik-defteri.md"

# ⚠ ÖNCE yedekle. İlk sürüm doğrudan `just docs` koşuyordu ve elle yapılmış bir
# düzenlemeyi SESSİZCE siliyordu: sonra `git diff` boş çıkıyor ve kapı yeşil raporluyordu.
# Kapı işi yok etmemeli, BİLDİRMELİ — ihlal testi bunu gösterdi.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for h in $HEDEFLER; do
  [ -f "$h" ] && cp "$h" "$tmp/$(basename "$h")"
done

node scripts/docs-uret.mjs >/dev/null || { echo "✗ just docs başarısız"; exit 1; }

fail=0
for h in $HEDEFLER; do
  # Kapı BOŞ GEÇMESİN: üretilen dosya gerçekten var olmalı.
  if [ ! -s "$h" ]; then
    echo "✗ $h üretilmedi veya boş — kapı boş geçiyor"
    fail=1
    continue
  fi
  yedek="$tmp/$(basename "$h")"
  if [ ! -f "$yedek" ] || ! cmp -s "$yedek" "$h"; then
    echo "✗ üretilmiş belge SAPMIŞ: $h"
    echo "   çalışma ağacındaki hâli üreteciyle uyuşmuyordu — ya elle düzenlendi (R-65),"
    echo "   ya kaynak değişti ve belge tazelenmedi. Dosya şimdi TAZELENDİ."
    echo "   yapılacak: git add $h"
    fail=1
    continue
  fi
  # İkinci kontrol: çalışma ağacında güncel ama INDEKSTE eski olabilir.
  if ! git diff --quiet -- "$h"; then
    echo "✗ üretilmiş belge indekse alınmamış: $h"
    git --no-pager diff --stat -- "$h"
    fail=1
  fi
done

[ "$fail" -eq 0 ] || exit 1
echo "  $(echo "$HEDEFLER" | wc -w) üretilmiş belge üreteciyle uyumlu"
