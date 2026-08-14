#!/usr/bin/env bash
# Haftalık sağlık raporu. RAPOR YAZAR, HİÇBİR ŞEYİ DEĞİŞTİRMEZ.
# Gözetimsiz otomatik düzeltme, ihmal edilen sistemlerin çürüme yoludur.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1
echo "── doctor · $(date +%F) ──"
echo "git      : $(git log --oneline -1 2>/dev/null || echo yok)"
echo "temiz mi : $([ -z "$(git status --porcelain)" ] && echo evet || echo HAYIR)"
echo "kapılar  : $(ls -1 scripts/gates/*.sh 2>/dev/null | wc -l | tr -d ' ') adet"
echo "aktif faz: $(sed -n 's/^aktif_faz: *//p' DURUM.md 2>/dev/null | head -1 || echo '?')"
echo "bloke    : $(grep -c '^  - adim:' DURUM.md 2>/dev/null || echo 0)"
echo
echo "(sağlayıcı fiyat drift'i ve kayıt tazeliği FAZ-8.4'te eklenecek)"
