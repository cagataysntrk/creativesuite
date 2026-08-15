#!/usr/bin/env bash
# GROUP: fast
# Sentetik veri sınırı — KVKK (§15 · FAZ-1.10).
#
# Test verisi git'e girer ve SONSUZA KADAR orada kalır. Bir kez commit'lenen gerçek
# kişi verisi, dosya silinse bile geçmişte durur; KVKK açısından silme talebi teknik
# olarak karşılanamaz hâle gelir. Bu yüzden sınır commit ANINDA çekilir, sonradan değil.
#
# İki şey denetlenir:
#   1. `test/fixtures/` altındaki her dosya `synthetic` işareti taşır — unutulmuş bir
#      "geçici olarak gerçek veri koydum" dosyası sessizce kalamaz.
#   2. Hiçbir fixture veya cassette gerçek görünümlü PII/secret taşımaz.
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

DIR="test/fixtures"
[ -d "$DIR" ] || { echo "  ($DIR yok — fixture doğmadı)"; exit 0; }

fail=0
n=0

while IFS= read -r f; do
  n=$((n + 1))

  # 1. sentetik işareti
  if ! grep -qE '"synthetic"[[:space:]]*:[[:space:]]*true|^synthetic:[[:space:]]*true' "$f"; then
    echo "✗ $f — 'synthetic: true' işareti yok (§15)"
    fail=1
  fi

  # 2a. example.com/.org dışı e-posta
  #
  # ⚠ `grep -q` BU BORUDA KULLANILAMAZ. `-q` ilk eşleşmede çıkar, yukarıdaki grep
  # SIGPIPE alır ve `set -o pipefail` boru durumunu 141 yapar — koşul sessizce
  # YANLIŞ olur ve kapı yeşil raporlar. 2026-08-15'te tam olarak bu yaşandı:
  # gerçek bir e-posta adresi kapıdan geçti (R-70'in kabuk tuzağının ikinci yüzü).
  yabanci="$(grep -oEi '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "$f" 2>/dev/null |
    grep -vEi '@(example\.(com|org|net)|ornek\.test)$' || true)"
  if [ -n "$yabanci" ]; then
    echo "✗ $f — example.com dışı e-posta adresi (KVKK): $yabanci"
    fail=1
  fi

  # 2b. Türkiye telefon biçimleri
  if grep -qE '(\+90|0090)[[:space:]-]?5[0-9]{2}|05[0-9]{2}[[:space:]-]?[0-9]{3}[[:space:]-]?[0-9]{2}' "$f"; then
    echo "✗ $f — telefon numarası gibi görünen dizi (KVKK)"
    fail=1
  fi

  # 2c. TCKN (11 hane) / VKN (10 hane) biçimli çıplak sayı.
  # uuid ve ISO tarih içindeki rakamlar kelime sınırıyla elenir.
  if grep -qE '(^|[^0-9A-Za-z_-])[0-9]{10,11}([^0-9A-Za-z_-]|$)' "$f"; then
    echo "✗ $f — TCKN/VKN biçimli sayı (KVKK)"
    fail=1
  fi
done < <(find "$DIR" -type f)

if [ "$n" -eq 0 ]; then
  echo "✗ $DIR boş — kapı boş geçiyor"
  exit 1
fi

# 3. cassette'lerde secret
CASS="test/cassettes"
c=0
if [ -d "$CASS" ]; then
  c=$(find "$CASS" -type f | wc -l)
  pat='(sk-[A-Za-z0-9_-]{20,}|sk_(live|test)_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,}|fal-[A-Za-z0-9-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)'

  # Aynı SIGPIPE tuzağı: `| head | grep -q` boruyu erken kapatır. Sonuç değişkene alınır.
  sizan="$(grep -rlEI "$pat" "$CASS" 2>/dev/null || true)"
  if [ -n "$sizan" ]; then
    echo "✗ cassette'te redakte edilmemiş secret — kayıt anında redaksiyon çalışmamış"
    printf '%s\n' "$sizan" | sed 's/^/    /'
    fail=1
  fi

  authsiz="$(grep -rlEI '"authorization"[[:space:]]*:[[:space:]]*"(Bearer|Basic)[^"]' "$CASS" 2>/dev/null || true)"
  if [ -n "$authsiz" ]; then
    echo "✗ cassette'te redakte edilmemiş Authorization başlığı"
    printf '%s\n' "$authsiz" | sed 's/^/    /'
    fail=1
  fi
fi

[ "$fail" -eq 0 ] || exit 1
echo "  $n fixture sentetik · $c cassette temiz"
