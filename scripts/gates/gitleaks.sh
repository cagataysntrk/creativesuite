#!/usr/bin/env bash
# GROUP: all
# gitleaks — geçmiş + çalışma ağacı secret taraması (FAZ-0.C.10).
#
# `repo-hygiene` bizim kendi desen listemizdir: hızlı, dar, bildiğimiz anahtar biçimlerini
# yakalar. Bu kapı onun tamamlayıcısıdır: ~150 hazır kural + entropi analizi, yani
# AKLIMIZA GELMEYEN anahtar biçimlerini yakalar. İkisi farklı hata sınıfı içindir —
# biri "unuttuğumuz sağlayıcı", diğeri "yanlış yazdığımız desen" (D-49).
#
# GROUP: all çünkü git geçmişini tarar; commit öncesi değil, push öncesi ve faz kapanışında.
# `--redact`: bulunan secret log'a BASILMAZ. Sızıntıyı raporlarken ikinci kez sızdırmak
# bu kapının yapabileceği en aptalca şey olurdu.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

GL="$(command -v gitleaks || echo "$HOME/.local/bin/gitleaks")"
[ -x "$GL" ] || { echo "✗ gitleaks kurulu değil — FAZ-0.C.10, ~/.local/bin/gitleaks"; exit 1; }

fail=0

# 1) Çalışma ağacı — henüz commit'lenmemiş sızıntı
if ! out="$("$GL" dir . --redact --no-banner --exit-code 1 2>&1)"; then
  echo "── çalışma ağacı ──"; printf '%s\n' "$out"; fail=1
fi

# 2) Git geçmişi — bir kez commit'lenmiş secret, sonradan silinse bile oradadır
if ! out="$("$GL" git . --redact --no-banner --exit-code 1 2>&1)"; then
  echo "── git geçmişi ──"; printf '%s\n' "$out"; fail=1
fi

[ "$fail" -eq 0 ] || exit 1

commits=$(git rev-list --count HEAD 2>/dev/null || echo 0)
echo "  temiz · $commits commit + çalışma ağacı tarandı"
