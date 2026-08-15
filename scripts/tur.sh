#!/usr/bin/env bash
# Turun 1-2. adımı: DURUM.md'yi oku, sıradaki adımın okuması gerekenleri getir.
# Bağlamsız bir agent "şimdi ne yapmalıyım" sorusunu SADECE bu çıktıdan cevaplayabilmeli.
set -uo pipefail

# ⚠ LC_ALL=C ZORUNLU. `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe
# collation'a göre çözülür ve `[A-Za-z]` aralığı `i`/`I` çevresinde KIRILIR:
#   $ LANG=tr_TR.UTF-8 grep -oE "[a-z.]+@[a-z.]+" <<< "ahmet.yilmaz@dokumsanayi.com.tr"
#   lmaz@dokumsanay          ← "yilmaz"ın başı ve "sanayi"nin sonu düştü
# Yani desen eşleşiyormuş gibi görünür ama YARIM eşleşir; kapı da yeşil raporlar.
# 2026-08-15'te bu, gerçek bir e-posta adresinin KVKK kapısından geçmesine yol açtı.
# Bu, `'i'.toUpperCase()` → `I` hatasının (R-21) kabuk seviyesindeki kardeşidir.
export LC_ALL=C
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1
adim="$(sed -n 's/^siradaki_adim: *//p' DURUM.md | head -1)"

# Faz numarası ADIMDAN türetilir, `aktif_faz` alanından DEĞİL.
# Gerekçe: D-53'ten beri sıradaki adım başka bir fazdan gelebiliyor (0.C.x kapıları
# FAZ 1 kodunu bekliyor). 2026-08-15'te `aktif_faz: 0` iken `siradaki_adim: 1.7` idi
# ve `just tur` FAZ-0.md'yi açıp adımı BULAMADI — bağlamı sıfırlanmış bir agent
# "böyle bir adım yok" görüp yanlış işe başlardı. Adım numarası fazı zaten taşıyor.
faz="${adim%%.*}"
etiket="$(sed -n 's/^aktif_faz: *//p' DURUM.md | head -1)"
echo "════ TUR · adım $adim (FAZ $faz) · açık faz: $etiket ════"
echo
echo "── bloke adımlar ──"
sed -n '/^bloke:/,/^deneme_sayaci:/p' DURUM.md | sed '$d' | sed 's/^/  /'
echo
f="docs/fazlar/FAZ-$faz.md"
if [ -f "$f" ]; then
  echo "── adım $adim ($f) ──"
  awk -v a="## $adim " 'index($0,a)==1{p=1} p&&/^## /&&index($0,a)!=1&&NR>1{if(seen)exit} index($0,a)==1{seen=1} p' "$f"
else
  echo "── $f henüz yok (FAZ-0.B.8a'da gelecek) ──"
  echo "   şimdilik plan dosyasındaki faz haritasını kullan"
fi
