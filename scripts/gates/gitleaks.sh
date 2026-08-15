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

# ⚠ LC_ALL=C ZORUNLU. `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe
# collation'a göre çözülür ve `[A-Za-z]` aralığı `i`/`I` çevresinde KIRILIR:
#   $ LANG=tr_TR.UTF-8 grep -oE "[a-z.]+@[a-z.]+" <<< "ahmet.yilmaz@dokumsanayi.com.tr"
#   lmaz@dokumsanay          ← "yilmaz"ın başı ve "sanayi"nin sonu düştü
# Yani desen eşleşiyormuş gibi görünür ama YARIM eşleşir; kapı da yeşil raporlar.
# 2026-08-15'te bu, gerçek bir e-posta adresinin KVKK kapısından geçmesine yol açtı.
# Bu, `'i'.toUpperCase()` → `I` hatasının (R-21) kabuk seviyesindeki kardeşidir.
export LC_ALL=C

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
