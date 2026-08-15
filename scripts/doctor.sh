#!/usr/bin/env bash
# Haftalık sağlık raporu. RAPOR YAZAR, HİÇBİR ŞEYİ DEĞİŞTİRMEZ.
# Gözetimsiz otomatik düzeltme, ihmal edilen sistemlerin çürüme yoludur.
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
echo "── doctor · $(date +%F) ──"
echo "git      : $(git log --oneline -1 2>/dev/null || echo yok)"
echo "temiz mi : $([ -z "$(git status --porcelain)" ] && echo evet || echo HAYIR)"
echo "kapılar  : $(ls -1 scripts/gates/*.sh scripts/gates/*.mjs 2>/dev/null | wc -l | tr -d ' ') adet"
echo "aktif faz: $(sed -n 's/^aktif_faz: *//p' DURUM.md 2>/dev/null | head -1 || echo '?')"
echo "bloke    : $(grep -c '^  - adim:' DURUM.md 2>/dev/null || echo 0)"
echo
echo "(sağlayıcı fiyat drift'i ve kayıt tazeliği FAZ-8.4'te eklenecek)"
