#!/usr/bin/env bash
# Hook'ların ORTAK yüklemleri — commit sınıfı ve koşu kimliği.
#
# ⚠ ⚠ **BU DOSYA, AYNI KURALIN İKİ HOOK'TA YAZILMASINI ÖNLEMEK İÇİN VAR.** `commit-msg`
# commit sınıfını yollardan belirliyor; `prepare-commit-msg` künyeyi doldurmak için AYNI
# soruyu sormak zorunda. İkisine ayrı ayrı yazmak, bu deponun en sık tekrar eden
# hatasıydı: aynı kural iki yerde, biri düzeltilir öteki unutulur (sıralama dokuz kez,
# yayın durumu üç kez böyle ayrıştı). Sınıflandırma değişirse TEK yerde değişir.
#
# ⚠ `set -euo pipefail` çağıranın işi: bir kaynak dosyası çağıranın kabuk ayarlarını
# değiştirmemeli.

# ⚠ LC_ALL=C ZORUNLU — gerekçe `commit-msg` başında yazılı (Türkçe collation
# `[A-Za-z]` aralığını `i`/`I` çevresinde kırıyor ve desen YARIM eşleşiyor).
export LC_ALL=C

# Bu commit YALNIZ çalıştırma yollarına mı dokunuyor?
#
# `0` = evet (çalıştırma sınıfı) · `1` = hayır (geliştirme sınıfı).
# ⚠ Dosya YOKSA geliştirme sayılıyor: boş bir commit'e künye istemek anlamsız.
calistirma_commiti_mi() {
  local dosyalar f
  dosyalar="$(git diff --cached --name-only || true)"
  [ -n "$dosyalar" ] || return 1
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    case "$f" in
      corpus/*|brand/*|derived/runs/*) ;;
      *) return 1 ;;
    esac
  done <<< "$dosyalar"
  return 0
}

# Bu commit'in DOKUNDUĞU koşu kimlikleri — yollardan okunuyor, uydurulmuyor.
#
# ⚠ ⚠ **BU BİR OLGU, BİR TAHMİN DEĞİL.** `Run:` satırı elle yazıldığında yanlış
# yazılabilir; yoldan okunduğunda commit'in gerçekten dokunduğu koşuyu gösterir.
# `corpus/` ya da `brand/` dışında hiçbir koşu yoksa çıktı BOŞ olur ve çağıran
# uydurmak yerine susar.
kosu_kimlikleri() {
  git diff --cached --name-only \
    | grep -oE '^derived/runs/run_[A-Za-z0-9_-]+' \
    | sed 's|^derived/runs/||' \
    | sort -u
}

# Commit'i yazan İNSAN mı AGENT mı — TESPİT, varsayım değil.
#
# ⚠ ⚠ **`Actor` UYDURULMAZ.** Claude Code kabuğa `CLAUDECODE` değişkenini koyuyor;
# IDE'den ya da düz terminalden atılan commit'te o değişken yok. Sabit `human` yazmak,
# agent'in yazdığı bir defter satırına insan imzası atmak olurdu — ve bu depoda defterin
# var olma sebebi tam olarak *"altı ay sonra bunu kim yaptı"* sorusuna cevap vermek.
#
# ⚠ Agent zaten künyeyi KENDİ yazıyor (`-F` ile tam mesaj); bu tespit yalnız eksik
# kalırsa devreye giriyor — yani bir güvenlik ağı, bir kolaylık değil.
commit_aktoru() {
  if [ -n "${CLAUDECODE:-}" ]; then printf 'agent'; else printf 'human'; fi
}
