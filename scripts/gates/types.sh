#!/usr/bin/env bash
# GROUP: fast
# Tip denetimi — halka sınırının 3. katmanı (§3.6 · FAZ-1.1).
#
# `tsc -b` yalnız tip hatası aramaz: project reference grafiğini de doğrular.
# Bir paket `references` listesinde olmayan bir paketi import ederse derleme düşer.
# ESLint atlatılabilir (eslint-disable), depcruise atlatılabilir (config), derleyici
# atlatılamaz — bu yüzden üçüncü katman derleyicidir.
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

TSC="$ROOT/node_modules/.bin/tsc"
[ -x "$TSC" ] || { echo "✗ typescript kurulu değil — 'pnpm install' çalıştır"; exit 1; }

out="$("$TSC" -b 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  printf '%s\n' "$out"
  exit 1
fi

# Test dosyaları composite build'in DIŞINDA (dist'e .test.js yazılmaz) — ama tip
# denetimsiz kalamazlar. vitest esbuild ile transpile eder ve tipe HİÇ bakmaz; yanlış
# tipte bir fixture sessizce kabul edilir ve "test geçti" denir.
out="$("$TSC" -p tsconfig.test.json 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  echo "── test dosyaları ──"
  printf '%s\n' "$out"
  exit 1
fi

# Kapı boş geçmesin: en az bir proje gerçekten derlenmiş olmalı.
n=$(find packages apps -maxdepth 2 -name tsconfig.json 2>/dev/null | wc -l)
[ "$n" -gt 0 ] || { echo "✗ derlenecek hiçbir TS projesi yok — kapı boş geçiyor"; exit 1; }

t=$(find packages apps -name "*.test.ts" 2>/dev/null | wc -l)
echo "  $n TS projesi + $t test dosyası tip denetimli"
