#!/usr/bin/env bash
# `dist/` okuyan her kapı bunu ÖNCE çağırır (D-67).
#
# 2026-08-15: `schemas` kapısı `packages/kernel/dist/index.js`'ten şema üretiyordu ve
# `run-gates.sh` `.sh` kapılarını ALFABETİK koşturduğu için `schemas` (s), dist'i
# yeniden derleyen `types`'tan (t) ÖNCE çalışıyordu. Sonuç: Zod'da tip-nötr bir
# değişiklik yapıp `schemas/`'i üretmeden tam `just check`'ten 17/17 YEŞİL geçmek.
# Kapının kendi başlığındaki "commit'li şema sessizce YALAN söyler" senaryosu
# tam olarak mümkündü.
#
# Ders: bir kapının doğruluğu BAŞKA bir kapının çalışma sırasına bağlı olamaz.
# `tsc -b` artımlıdır; ikinci çağrı milisaniyeler sürer, bedeli yok.
set -uo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

TSC="$ROOT/node_modules/.bin/tsc"
[ -x "$TSC" ] || { echo "✗ typescript kurulu değil"; exit 1; }

out="$("$TSC" -b 2>&1)"
rc=$?
if [ "$rc" -ne 0 ]; then
  echo "✗ derleme başarısız — kapı bayat dist üstünde ÇALIŞMAZ:"
  printf '%s\n' "$out"
  exit 1
fi
