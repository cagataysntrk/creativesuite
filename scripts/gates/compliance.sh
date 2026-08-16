#!/usr/bin/env bash
# GROUP: fast
# Uyum kapısı — sentetik insan yasağı ve IPTC damgası (§11.3 · R-33 · FAZ-3.11).
#
# Reklam Yönetmeliği Md. 27/12, 1 Ağu 2026'dan yürürlükte: onay ima eden yapay insan
# üretilemez. Kapı iki şey sorar: iddia kurulabiliyor mu ve varlık damgalı mı.
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır
set -euo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/ensure-build.sh" || exit 1

# ── `aiGenerated` SABİT yazılamaz (D-232) ────────────────────────────────────
#
# Üretim yolu `aiGenerated: false` diye sabit geçiyordu ve yanındaki yorum "bu hatta
# görsel model çağrısı YOK" diyordu. FAZ 8'de `ad-creative-set` hattı
# `capability: image.generate` ile geldi — yorum yanlış oldu, hiçbir şey kırmızıya
# dönmedi ve üç katman aşağıda Md. 50 ifşa kapısı sessizce kapandı.
#
# Karar hattan okunmak ZORUNDA. Sabit bir literal, hangi değeri taşırsa taşısın,
# hattın ne yaptığını bilmeyen bir iddiadır.
if grep -nE "aiGenerated:\s*(true|false)" scripts/uret.mjs | grep -vE '^\s*[0-9]+:\s*(//|\*)' ; then
  echo "✗ scripts/uret.mjs: aiGenerated SABİT yazılmış — karar hattan okunmalı (uyumKapsami, D-232)"
  exit 1
fi
if ! grep -q "uyumKapsami(cozum.value)" scripts/uret.mjs; then
  echo "✗ scripts/uret.mjs uyumKapsami() çağırmıyor — modül var, üretim yolu onu görmüyor"
  exit 1
fi

node scripts/compliance-kontrol.mjs
