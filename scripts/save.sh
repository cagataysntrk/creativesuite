#!/usr/bin/env bash
# Tek kaydetme darboğazı: kapı → stage → commit → push → KANITLA.
#
# Neden var: kabuk && zinciri ve heredoc sonrası komutlar yalan söylüyor.
# 2026-08-15'te üç kez reddedilen bir commit "✓ başarılı" diye raporlandı (R-70).
# Hatırlamaya güvenmek işe yaramadı; darboğaz işe yarar.
#
# Kullanım: just save [msg_dosyası|-] [yol...]
#   Yol verilirse YALNIZ o yollar stage'lenir. Gerekçe: R-76, `KURALLAR.md`
#   değişikliğini ayrı tipte bir commit'e zorluyor — tek commit'e her şeyi atan bir
#   darboğaz, o kuralı uygulanamaz yapar. Darboğaz hâlâ tek; sadece kapsamı seçilebilir.
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

msg_file="${1:--}"
shift || true
paths=("$@")

echo "── kapılar ──"
if ! bash scripts/run-gates.sh fast; then
  echo; echo "✗ KAPI KIRMIZI — commit yok (LOOP§C)"; exit 1
fi

before=$(git rev-list --count HEAD 2>/dev/null || echo 0)
if [ ${#paths[@]} -eq 0 ]; then
  git add -A
else
  git add -A -- "${paths[@]}"
fi
if git diff --cached --quiet; then
  echo "· değişiklik yok, commit atlandı"; exit 0
fi

if [ "$msg_file" = "-" ]; then git commit -q -F -; else git commit -q -F "$msg_file"; fi
rc=$?
after=$(git rev-list --count HEAD 2>/dev/null || echo 0)

if [ "$rc" -ne 0 ] || [ "$after" -eq "$before" ]; then
  echo; echo "✗ COMMIT BAŞARISIZ (rc=$rc, commit sayısı $before → $after)"
  echo "  çalışma ağacı hâlâ kirli:"; git status --short | sed 's/^/    /'
  exit 1
fi

if ! git push -q origin HEAD 2>/dev/null; then
  echo "⚠ commit tamam ama PUSH BAŞARISIZ — yasa 12 (git clone ile kurtarma) geçersiz"
  exit 1
fi

unpushed=$(git rev-list --count '@{u}'..HEAD 2>/dev/null || echo "?")
echo
kalan=$(git status --porcelain | wc -l)
echo "✓ commit $before → $after · push edilmemiş: $unpushed · ağaç: $kalan"
[ ${#paths[@]} -eq 0 ] || echo "  (seçmeli commit — $kalan dosya bilinçli olarak dışarıda)"
git log --oneline -1
