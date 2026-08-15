#!/usr/bin/env bash
# GROUP: fast
# Depo hijyeni — geri alması pahalı olan hataları commit'ten ÖNCE yakalar.
set -uo pipefail

# ⚠ LC_ALL=C ZORUNLU. `LANG=tr_TR.UTF-8` altında POSIX karakter sınıfları Türkçe
# collation'a göre çözülür ve `[A-Za-z]` aralığı `i`/`I` çevresinde KIRILIR:
#   $ LANG=tr_TR.UTF-8 grep -oE "[a-z.]+@[a-z.]+" <<< "ahmet.yilmaz@dokumsanayi.com.tr"
#   lmaz@dokumsanay          ← "yilmaz"ın başı ve "sanayi"nin sonu düştü
# Yani desen eşleşiyormuş gibi görünür ama YARIM eşleşir; kapı da yeşil raporlar.
# 2026-08-15'te bu, gerçek bir e-posta adresinin KVKK kapısından geçmesine yol açtı.
# Bu, `'i'.toUpperCase()` → `I` hatasının (R-21) kabuk seviyesindeki kardeşidir.
export LC_ALL=C
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 1

fail=0
say() { echo "$1"; fail=1; }

# ── 1. derived/runs ignore EDİLMEMELİ (D-38) ─────────────────────────────────
# Çalıştırma defteri corpus'tan türetilemez. Yanlışlıkla ignore edilirse bir
# çalıştırmanın maliyeti ve hangi sağlayıcıya ne gittiği KALICI olarak kaybolur.
# ⚠ `git check-ignore` VAR OLMAYAN bir dizin için daima "eşleşmedi" der: `derived/runs/`
# deseni sondaki eğik çizgi yüzünden yalnız dizinlerle eşleşir ve git, olmayan bir yolun
# dizin olduğunu bilemez. Koruma bu yüzden dizin doğana kadar BOŞTA dönüyordu (D-68).
# Üç kontrol birlikte: dizin var mı, kendisi ignore'lu mu, altındaki dosya izleniyor mu.
if [ ! -d derived/runs ]; then
  say "derived/runs dizini yok — D-38 koruması boşta döner, .gitkeep ile var olmalı"
elif git check-ignore -q --no-index derived/runs || git check-ignore -q --no-index derived/runs/.gitkeep; then
  say "derived/runs ignore ediliyor — D-38 ihlali, çalıştırma defteri türetilemez"
elif ! git ls-files --error-unmatch derived/runs/.gitkeep >/dev/null 2>&1; then
  say "derived/runs/.gitkeep izlenmiyor — dizinin git'te var olduğu KANITLANAMIYOR"
fi

# ── 2. Düz metin secret commit'lenmemeli ─────────────────────────────────────
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  say ".env git'te izleniyor — düz metin secret commit'lenmez"
fi
if git ls-files | grep -qE '\.(pem|p12|pfx)$'; then
  say "özel anahtar dosyası izleniyor"
fi

# ── 2b. Secret DESENİ içerikte de aranmalı ───────────────────────────────────
# Uzantıya bakmak yetmez: içinde sk-... olan bir config.json .env değildir ama
# aynı zarardadır. (Denetim bulgusu 2026-08-14.)
# sk- ailesinde TİRE ve ALT ÇİZGİ olabilir: gerçek Anthropic anahtarı sk-ant-api03-...
# İlk desen [A-Za-z0-9]{20,} idi ve tam da en muhtemel biçimi kaçırıyordu.
# (İhlal testi 2026-08-14'te yakaladı — kapı yazıldığı gün kördü.)
pat='(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AIza[0-9A-Za-z_-]{30,}|fal-[A-Za-z0-9-]{20,})'
hits="$(git grep -InE "$pat" -- ':!docs/research' ':!scripts/gates/repo-hygiene.sh' 2>/dev/null | head -5)"
if [ -n "$hits" ]; then
  say "izlenen dosyada secret deseni:"
  echo "$hits" | sed 's/^/  /'
fi

# ── 3. Git geçmişinde AI atıf imzası olmamalı (D-34) ─────────────────────────
# commit-msg kapısı ileriye dönük korur; bu, geçmişte kaçan var mı diye bakar.
if git log --format='%B' 2>/dev/null | grep -qiE 'co-authored-by:[[:space:]]*claude|generated with claude|noreply@anthropic\.com'; then
  say "git geçmişinde AI atıf imzası var — D-34 ihlali"
fi

# ── 4. hooksPath doğru bağlı olmalı ──────────────────────────────────────────
hp="$(git config core.hooksPath || true)"
if [ "$hp" != ".githooks" ]; then
  say "core.hooksPath='$hp' — '.githooks' olmalı, yoksa commit kapısı devre dışı"
fi
if [ ! -x .githooks/commit-msg ]; then
  say ".githooks/commit-msg çalıştırılabilir değil — kapı sessizce atlanır"
fi

# ── 5. Büyük dosya git'e girmemeli (Git LFS yok, içerik-adresli depo kullanılır)
big="$(git ls-files -z 2>/dev/null | xargs -0 -r du -k 2>/dev/null | awk '$1>512{print "  "$2" ("$1"KB)"}')"
if [ -n "$big" ]; then
  say "512KB üstü izlenen dosya var — varlık byte'ları derived/blobs'a gider:"
  echo "$big"
fi

# ── 6. Kabuk kapıları locale-bağımsız olmalı (R-77) ──────────────────────────
# `LANG=tr_TR.UTF-8` altında POSIX `[A-Za-z]` sınıfı `i`/`I` çevresinde kırılır ve
# desen YARIM eşleşir — kapı yeşil raporlarken hiçbir şey korumaz. Bu kontrol olmadan
# bir sonraki kapı aynı tuzağa hatırlanmadığı için düşer.
eksik=""
for s in scripts/gates/*.sh scripts/run-gates.sh scripts/save.sh .githooks/commit-msg \
  .githooks/pre-commit .githooks/pre-push; do
  [ -f "$s" ] || continue
  grep -q '^export LC_ALL=C$' "$s" || eksik="$eksik $s"
done
if [ -n "$eksik" ]; then
  say "R-77: 'export LC_ALL=C' eksik —$eksik"
fi

exit $fail
