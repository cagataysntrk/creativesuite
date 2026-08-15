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

hedef="docs/referans/saglayicilar.md"

# ⚠ ÖNCE yedekle. İlk sürüm doğrudan `just docs` koşuyordu ve elle yapılmış bir
# düzenlemeyi SESSİZCE siliyordu: sonra `git diff` boş çıkıyor ve kapı yeşil raporluyordu.
# Kapı işi yok etmemeli, BİLDİRMELİ — ihlal testi bunu gösterdi.
onceki=""
[ -f "$hedef" ] && onceki="$(cat "$hedef")"

node scripts/docs-uret.mjs >/dev/null || { echo "✗ just docs başarısız"; exit 1; }

# Kapı BOŞ GEÇMESİN: üretilen dosya gerçekten var olmalı.
[ -s "$hedef" ] || { echo "✗ $hedef üretilmedi veya boş — kapı boş geçiyor"; exit 1; }

sonraki="$(cat "$hedef")"
if [ "$onceki" != "$sonraki" ]; then
  echo "✗ üretilmiş belge SAPMIŞ: $hedef"
  echo "   çalışma ağacındaki hâli üreteciyle uyuşmuyordu — ya elle düzenlendi (R-65),"
  echo "   ya kaynak değişti ve belge tazelenmedi. Dosya şimdi TAZELENDİ."
  echo "   yapılacak: git add $hedef"
  exit 1
fi

# İkinci kontrol: dosya çalışma ağacında güncel ama INDEKSTE eski olabilir.
if ! git diff --quiet -- "$hedef"; then
  echo "✗ üretilmiş belge indekse alınmamış: $hedef"
  echo "   düzeltmek için: git add $hedef"
  git --no-pager diff --stat -- "$hedef"
  exit 1
fi

echo "  $hedef üreteciyle uyumlu"
