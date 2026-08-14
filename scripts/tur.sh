#!/usr/bin/env bash
# Turun 1-2. adımı: DURUM.md'yi oku, sıradaki adımın okuması gerekenleri getir.
# Bağlamsız bir agent "şimdi ne yapmalıyım" sorusunu SADECE bu çıktıdan cevaplayabilmeli.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1
faz="$(sed -n 's/^aktif_faz: *//p' DURUM.md | head -1)"
adim="$(sed -n 's/^siradaki_adim: *//p' DURUM.md | head -1)"
echo "════ TUR · FAZ $faz · adım $adim ════"
echo
echo "── bloke adımlar ──"
sed -n '/^bloke:/,/^deneme_sayaci:/p' DURUM.md | sed '$d' | sed 's/^/  /'
echo
f="docs/fazlar/FAZ-$faz.md"
if [ -f "$f" ]; then
  echo "── adım $adim ($f) ──"
  awk -v a="## $adim " 'index($0,a)==1{p=1} p&&/^## /&&index($0,a)!=1&&NR>1{if(seen)exit} index($0,a)==1{seen=1} p' "$f"
else
  echo "── $f henüz yok (FAZ-0.B.8'de gelecek) ──"
  echo "   şimdilik plan dosyasındaki faz haritasını kullan"
fi
