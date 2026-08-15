#!/usr/bin/env bash
# Tek kaydetme darboğazı: kapı → stage → commit → push → KANITLA.
#
# Neden var: kabuk && zinciri ve heredoc sonrası komutlar yalan söylüyor.
# 2026-08-15'te üç kez reddedilen bir commit "✓ başarılı" diye raporlandı (R-70).
# Hatırlamaya güvenmek işe yaramadı; darboğaz işe yarar.
#
# Kullanım: just save "<commit mesajı dosyası veya - ile stdin>"
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

msg_file="${1:--}"

echo "── kapılar ──"
if ! bash scripts/run-gates.sh fast; then
  echo; echo "✗ KAPI KIRMIZI — commit yok (LOOP§C)"; exit 1
fi

before=$(git rev-list --count HEAD 2>/dev/null || echo 0)
git add -A
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
echo "✓ commit $before → $after · push edilmemiş: $unpushed · ağaç: $(git status --porcelain | wc -l)"
git log --oneline -1
