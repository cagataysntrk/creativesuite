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

# Push edilmemiş commit: yasa 12'nin (§16) sessiz düşmanı. `git clone` ile kurtarma,
# yalnız uzak depo güncelse çalışır. 2026-08-15'te 24 commit push edilmemiş kalmıştı
# çünkü `just save` yerine doğrudan `git commit` kullanılmıştı (D-151).
unpushed=$(git rev-list --count '@{u}'..HEAD 2>/dev/null || echo "?")
if [ "$unpushed" = "?" ]; then
  echo "⚠ push     : upstream YOK — 'git clone' ile kurtarma İMKÂNSIZ (yasa 12)"
elif [ "$unpushed" -gt 0 ]; then
  echo "⚠ push     : $unpushed commit uzakta YOK — 'git clone' onları kaçırır (yasa 12)"
else
  echo "push     : güncel"
fi
echo "kapılar  : $(ls -1 scripts/gates/*.sh scripts/gates/*.mjs 2>/dev/null | wc -l | tr -d ' ') adet"
echo "aktif faz: $(sed -n 's/^aktif_faz: *//p' DURUM.md 2>/dev/null | head -1 || echo '?')"
echo "sıradaki : $(sed -n 's/^siradaki_adim: *//p' DURUM.md 2>/dev/null | head -1 || echo '?')"

# ⚠ Bloke sayısı `bloke: ["2.9", "3.2"]` satırından okunur. İlk sürüm `^  - adim:`
# arıyordu — DURUM.md'nin HİÇ sahip olmadığı bir biçim. Yani doctor her zaman "bloke: 0"
# diyordu ve bir ay sonra dönen kullanıcıya "engel yok" raporluyordu. Sağlık raporunun
# yalan söylemesi, sağlık raporu olmamasından kötüdür.
bloke_satiri="$(sed -n 's/^bloke: *\[\(.*\)\]$/\1/p' DURUM.md 2>/dev/null | head -1)"
if [ -z "$bloke_satiri" ]; then
  echo "bloke    : 0"
else
  bloke_temiz="$(echo "$bloke_satiri" | tr -d '\"' | tr -d "'" | tr ',' ' ')"
  n=0
  for b in $bloke_temiz; do n=$((n + 1)); done
  echo "bloke    : $n  ($(echo "$bloke_temiz" | tr -s ' '))"
fi

# Commit'lenmemiş çalıştırma defteri: `derived/runs` türetilemez (R-52) ve
# commit'lenmeden duran bir çalıştırma, bir `git clean` uzaklıkta kaybolur.
kayit_disi="$(git status --porcelain derived/runs 2>/dev/null | wc -l | tr -d ' ')"
[ "$kayit_disi" -gt 0 ] && echo "⚠ defter   : $kayit_disi commit'lenmemiş çalıştırma girdisi (R-52: silinmez, yedeklenir)"

# ── ÖKSÜZ çalıştırma: varlık var, manifest YOK ──────────────────────────────
# "Manifest'siz çıktı bir hatadır" (§13). `writeManifest` kusurlu bir manifesti
# YAZMAZ — doğru davranış — ama üretilmiş slaytlar diskte öksüz kalır: defterde
# izi olmayan bir varlık, kimin ürettiği ve neye mal olduğu bilinmeyen bir varlıktır.
# Doctor RAPOR EDER, silmez: `derived/runs` silinmez (R-52) ve otomatik temizlik,
# bir ay sonra dönen kullanıcıya ne olduğunu gizler.
oksuz=0
oksuz_liste=""
for d in derived/runs/*/; do
  [ -d "$d" ] || continue
  if [ ! -f "$d/manifest.json" ]; then
    n=$(find "$d" -name '*.png' -o -name '*.jpg' 2>/dev/null | wc -l | tr -d ' ')
    if [ "$n" -gt 0 ]; then
      oksuz=$((oksuz + 1))
      oksuz_liste="$oksuz_liste $(basename "$d")($n)"
    fi
  fi
done
[ "$oksuz" -gt 0 ] && echo "⚠ öksüz    : $oksuz çalıştırmada varlık VAR manifest YOK —$oksuz_liste"

echo
echo "── tazelik (§8.7 · §9.1) ──"
node scripts/tazelik.mjs 2>/dev/null || echo "  (tazelik raporu üretilemedi — 'just check' çalıştır)"

echo
echo "(kayıt tazeliği ve %20 maliyet sapması FAZ-8.4'te eklenecek)"
