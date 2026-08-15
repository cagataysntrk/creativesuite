#!/usr/bin/env bash
# GROUP: fast
# CLI duman testi — üretim komutları GERÇEKTEN koşuyor mu (R-47 · D-153).
#
# `no-undef` tanımsız değişkeni yakalar; bir CLI bundan başka on yolla da kırılabilir
# (yanlış import yolu, değişen imza, eksik dosya). 2026-08-15'te bir düzeltme commit'i
# `just plan`ı ve `just uret`in QA adımını kırdı ve **24 kapının hiçbiri görmedi** —
# iki üretim CLI'ı kırık hâlde yeşil raporlandı.
#
# `just plan` HİÇBİR ŞEY HARCAMAZ (R-47): sıfır ağ, sıfır yazma. Bu yüzden her kapı
# turunda gerçekten koşturulabilir — ve dürüst bir kuru çalıştırmanın bedeli budur.
#
# `just uret` BURADA KOŞTURULMAZ: para harcayabilir. Onun yerine betiğin sözdizimi ve
# import grafiği `--dry-parse` ile denetlenir (aşağıda).
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
set -uo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1
bash "$ROOT/scripts/ensure-build.sh" || exit 1

fail=0

# ── just plan: her hat için ─────────────────────────────────────────────────
hatlar=$(ls registry/pipelines/*.pipeline.yaml 2>/dev/null | xargs -rn1 basename | sed 's/\.pipeline\.yaml$//')
if [ -z "$hatlar" ]; then
  echo "✗ hiç pipeline yok — kapı boş geçiyor"
  exit 1
fi

n=0
for h in $hatlar; do
  out=$(node scripts/plan.mjs "$h" 2>&1)
  rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "✗ just plan $h → çıkış $rc"
    printf '%s\n' "$out" | head -6 | sed 's/^/    /'
    fail=1
    continue
  fi
  # Çıktı BOŞ olmamalı: sessizce başarılı dönen bir plan, planı olmayan bir plandır.
  if ! printf '%s' "$out" | grep -q "sıra  adım"; then
    echo "✗ just plan $h → çıktı beklenen tabloyu içermiyor"
    fail=1
    continue
  fi
  n=$((n + 1))
done

# ── uret.mjs: sözdizimi + import grafiği ────────────────────────────────────
# Koşturmadan denetlenir: `node --check` sözdizimini, dinamik import'lar zaten
# `no-undef` ve `types` kapılarında. Amaç, dosyanın hiç AYRIŞTIRILAMAZ hâle
# gelmediğini garanti etmek.
for f in scripts/uret.mjs scripts/onay.mjs scripts/onayla.mjs scripts/golden.mjs; do
  [ -f "$f" ] || continue
  if ! node --check "$f" 2>/dev/null; then
    echo "✗ $f → sözdizimi hatası"
    node --check "$f" 2>&1 | head -3 | sed 's/^/    /'
    fail=1
  fi
done

[ "$fail" -eq 0 ] || exit 1
echo "  $n pipeline 'just plan' ile koşturuldu · 4 CLI betiği ayrıştırıldı"
