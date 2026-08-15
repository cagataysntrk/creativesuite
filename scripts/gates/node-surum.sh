#!/usr/bin/env bash
# GROUP: fast
# Node sürümü kapısı (FAZ-0.A.2 · R-77).
#
# **Yanlış Node sürümü testleri kırmaz — SESSİZCE ÇALIŞTIRMAZ.**
#
# 2026-08-16'da kabuk Node 20'ye düştü. `better-sqlite3` başka bir ABI için derlenmişti
# ve `require` anında SIGSEGV verdi. Sonuç: sekiz test dosyası hiç koşmadı ve vitest
# bunu "Errors 8" diye tek satırda bildirdi — "Test Files 56 passed" satırının hemen
# yanında. 144 test kayboldu, çıktı yeşile çok benziyordu.
#
# Bir kapı bunu yakalamalı çünkü belirti yanıltıcı: hata testin İÇİNDE görünmüyor,
# koşucunun altyapısında. `.nvmrc` ve `engines` niyeti yazar; zorlayan budur.

set -euo pipefail
export LC_ALL=C

asgari=22

if ! command -v node >/dev/null 2>&1; then
  echo "✗ node bulunamadı"
  exit 1
fi

surum=$(node -v)
ana=${surum#v}
ana=${ana%%.*}

if [ "$ana" -lt "$asgari" ]; then
  echo "✗ node $surum — en az v${asgari} gerekli (.nvmrc)"
  echo "  Sebep: yerel modüller (better-sqlite3) başka bir ABI için derlendi;"
  echo "  yanlış sürümde testler başarısız OLMAZ, hiç koşmaz (SIGSEGV)."
  echo "  Çözüm:  nvm use   (repo kökünde .nvmrc okunur)"
  exit 1
fi

# Beyan ile gerçeği de karşılaştır: `.nvmrc` bir dilek değil, bir sözleşme.
if [ -f .nvmrc ]; then
  istenen=$(tr -d ' v\n' < .nvmrc)
  istenen=${istenen%%.*}
  if [ -n "$istenen" ] && [ "$ana" -lt "$istenen" ]; then
    echo "✗ node $surum, .nvmrc v${istenen} istiyor"
    exit 1
  fi
fi

# Yerel modül GERÇEKTEN yükleniyor mu — sürüm numarası doğru olup modül yine de
# bozuk olabilir (yeniden derlenmemiş bağımlılık). Numaraya bakıp geçmek, kapının
# koruduğunu sandığı şeyi korumaması olurdu.
# Çözüm pnpm workspace'inde paketten yapılır: `better-sqlite3` kökün değil
# `packages/kernel`in bağımlılığı ve kökten `require` etmek "bulunamadı" der —
# bozuk modül ile yanlış dizin aynı hatayı verirdi.
if ! (cd packages/kernel && node -e "require('better-sqlite3')") >/dev/null 2>&1; then
  echo "✗ better-sqlite3 yüklenemiyor (node $surum) — 'pnpm rebuild better-sqlite3'"
  exit 1
fi

echo "✓ node-surum: $surum · better-sqlite3 yükleniyor"
