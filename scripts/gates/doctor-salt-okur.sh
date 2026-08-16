#!/usr/bin/env bash
# GROUP: fast
# Doctor SALT OKURDUR (§13, §16 · FAZ-4.17).
#
# **Rapor eder, hiçbir şeyi değiştirmez.** Bu bir üslup kuralı değil, 12. yasanın
# doğrudan sonucu: bir ay ihmal edilmiş bir sistemde otomatik düzeltme, dönen kullanıcıya
# NE OLDUĞUNU gizler — ve gizlenen şey tam da öğrenmesi gereken şeydir. "Doctor 14 öksüz
# varlığı temizledi" satırı, o 14 varlığın neden öksüz kaldığı sorusunu yok eder.
#
# Kural yorumla korunamaz: "düzelt" düğmesi eklemek her zaman makul görünür ve tam da
# bu yüzden bir gün eklenir. Kapı, doctor yoluna giren her dosyada yazma çağrısı arar.
#
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır.
set -euo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# ⚠ `scripts/doctor.sh` LİSTEDE YOKTU (2. doğrulama turu, M-2) — ve o, `just doctor`ın
# GİRİŞİDİR. Kapı üç dosyayı denetleyip "doctor salt okur" diyordu; giriş betiğine
# `echo … > dosya` eklemek kapıyı yeşil bırakıyordu. Bir kapının yeşili, baktığı yerin
# doğru olduğunu göstermez — dördüncü kez aynı sınıf (D-232 ailesi).
DOSYALAR=(
  "scripts/doctor.sh"
  "packages/engine/src/saglik/doktor.ts"
  "apps/ui/src/Doktor.tsx"
  "scripts/doktor.mjs"
)

# Yazma / silme / taşıma çağrıları. `readFileSync` ve `readdirSync` eşleşmez: desen
# `write`, `append`, `rm`, `unlink`, `mkdir`, `rename`, `truncate` fiillerini arıyor.
YAZMA='\b(writeFileSync|appendFileSync|rmSync|unlinkSync|mkdirSync|renameSync|truncateSync|copyFileSync|createWriteStream|writeFile|rm -rf)\b'
# Ağa çıkan ya da durum değiştiren komutlar: `git commit`, `git checkout`, POST/PUT/DELETE.
DEGISTIREN='git (commit|add|checkout|reset|clean|push|rm)|method: *.(POST|PUT|DELETE|PATCH)|app\.(post|put|delete|patch)\('

hata=0
for f in "${DOSYALAR[@]}"; do
  if [ ! -f "$f" ]; then
    echo "✗ $f yok — kapı denetleyecek dosya bulamıyor, koruma sıfır"
    hata=1
    continue
  fi
  # Yorum satırları HARİÇ: bu dosyalar kuralı ANLATIYOR ve anlatım yasak dizeler içeriyor
  # (`doctor.sh` içindeki bir yorum yüzünden `chokepoints` kapısı bir kez yanlış alarm
  # vermişti — yanlış pozitif de bir hatadır).
  govde=$(grep -vE '^\s*(//|#|\*|/\*)' "$f" || true)

  if echo "$govde" | grep -nE "$YAZMA" >/dev/null 2>&1; then
    echo "✗ $f: doctor yolunda YAZMA çağrısı —"
    echo "$govde" | grep -nE "$YAZMA" | sed 's/^/    /'
    echo "    Doctor rapor eder, değiştirmez: otomatik düzeltme ne olduğunu gizler (§16)."
    hata=1
  fi
  # ── kabuk YAZMA biçimleri ────────────────────────────────────────────────
  #
  # ⚠ `YAZMA` deseni Node fiillerini arıyor ve `.sh` girişinde KÖR kalıyordu:
  # `echo "kirlet" > dosya` eklemek kapıyı yeşil bırakıyordu. Yönlendirme ve
  # dosya-değiştiren kabuk fiilleri de yazmadır.
  #
  # `/dev/null`, `>&1`, `>&2` HARİÇ: bunlar çıktı susturma, durum değiştirme değil.
  # Yanlış pozitif de bir hatadır.
  if [[ "$f" == *.sh ]]; then
    KABUK_YAZMA='(^|[^0-9&])>>?[[:space:]]*("|'"'"')?[^&|>[:space:]]|\b(tee|touch|mkdir|cp|mv|sed -i|truncate)\b'
    temiz=$(echo "$govde" | grep -vE '>[[:space:]]*(/dev/null|&[12])' || true)
    if echo "$temiz" | grep -nE "$KABUK_YAZMA" >/dev/null 2>&1; then
      echo "✗ $f: doctor girişinde KABUK YAZMASI —"
      echo "$temiz" | grep -nE "$KABUK_YAZMA" | sed 's/^/    /'
      echo "    Doctor rapor eder, değiştirmez (§16). Yönlendirme de yazmadır."
      hata=1
    fi
  fi

  if echo "$govde" | grep -nE "$DEGISTIREN" >/dev/null 2>&1; then
    echo "✗ $f: doctor yolunda durum DEĞİŞTİREN çağrı —"
    echo "$govde" | grep -nE "$DEGISTIREN" | sed 's/^/    /'
    hata=1
  fi
done

# Doctor ucu GET olmak zorunda: POST bir "düzelt" eyleminin doğal evi.
if grep -nE "app\.(post|put|delete|patch)\('/api/doktor" apps/server/src/sunucu.ts >/dev/null 2>&1; then
  echo "✗ /api/doktor GET DEĞİL — durum değiştiren bir doctor ucu, doctor değildir"
  hata=1
fi

[ "$hata" -eq 1 ] && exit 1
echo "✓ doctor-salt-okur: ${#DOSYALAR[@]} dosya · yazma yok · durum değiştiren çağrı yok"
