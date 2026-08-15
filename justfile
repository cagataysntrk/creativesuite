# Upcytech Creative Suite — tek CLI girişi.
# Kural: pnpm/node doğrudan çağrılmaz. Her şey buradan geçer, böylece
# "yerelde yeşil, CI'da kırmızı" yapısal olarak imkânsız olur.

set shell := ["bash", "scripts/sh.sh"]
set dotenv-load := false

# Kapı betikleri burada; just, git hook'ları ve zamanlanmış işler AYNI betiği çağırır.
gates_dir := "scripts/gates"

# ── varsayılan: ne yapabileceğini göster ─────────────────────────────────────
default:
    @just --list --unsorted

# ── günlük döngü ─────────────────────────────────────────────────────────────

# Kuru çalıştırma planı: DAG + maliyet aralığı. HİÇBİR ŞEY HARCAMAZ (R-47)
# Hattı UÇTAN UCA koşar — para HARCAYABİLİR (plan harcamaz)
uret *args:
    @./node_modules/.bin/tsc -b && node scripts/uret.mjs {{args}}

plan *args:
    @./node_modules/.bin/tsc -b && node scripts/plan.mjs {{args}}

# Turun 1-2. adımı: DURUM.md oku, aktif adımın okuması gereken her şeyi getir
tur:
    @bash scripts/tur.sh

# Hızlı kapı: commit öncesi. Biçim + tip + lint + ucuz kapılar
check:
    @just gates fast

# Tam doğrulama: her kapı + testler + golden. Faz kapanışında ve bir ay sonra
verify:
    @just gates all
    @just golden

# ── kapılar ──────────────────────────────────────────────────────────────────

# Kapı grubunu çalıştır: fast | all
gates group="fast":
    @bash scripts/run-gates.sh {{group}}

# Tek kapıyı çalıştır — hata ayıklarken
gate name:
    @if [ -f {{gates_dir}}/{{name}}.sh ]; then bash {{gates_dir}}/{{name}}.sh; else node {{gates_dir}}/{{name}}.mjs; fi

# Hangi kapılar var
gates-list:
    @ls -1 {{gates_dir}}/*.sh {{gates_dir}}/*.mjs 2>/dev/null | xargs -rn1 basename | sed 's/\.\(sh\|mjs\)$//' || echo "(henüz kapı yok)"

# ── test ─────────────────────────────────────────────────────────────────────

test *args:
    @./node_modules/.bin/vitest run {{args}}

# Golden-file testleri: commit edilen golden JSON METRİKTİR, piksel değil
golden:
    @./node_modules/.bin/tsc -b && node scripts/golden.mjs


# Kaydet: kapı → stage → commit → push → KANITLA. Tek darboğaz (R-05).
# Mesajı stdin'den alır:  just save <<'EOF' ... EOF
save file="-" *paths:
    @bash scripts/save.sh {{file}} {{paths}}

# ── bakım ────────────────────────────────────────────────────────────────────

fmt:
    @./node_modules/.bin/prettier --write . --log-level warn && echo "✓ biçimlendirildi"

# Marka token'larını derle: CSS + Tailwind teması + brand-facts.json (§4.1)
tokens:
    @./node_modules/.bin/tsc -b && node scripts/tokens.mjs

# İNSANIN onay komutu: draft → active (§5.4 · R-14). Agent bunu ÇAĞIRMAZ.
# Bir ÇALIŞTIRMAYI onayla/reddet — insan kapısı kararı (§4c). İnsan çalıştırır.
onay *args:
    @./node_modules/.bin/tsc -b && node scripts/onay.mjs {{args}}

# Bir corpus KAYDINI onayla — draft → active (R-14). İnsan çalıştırır.
onayla *yollar:
    @./node_modules/.bin/tsc -b && node scripts/onayla.mjs {{yollar}}

# Keşif planı — op listesi basar, HİÇBİR ŞEY yazmaz (§4.4)
discovery alt='plan' *args:
    @./node_modules/.bin/tsc -b && node scripts/discovery.mjs '{{alt}}' {{args}}

# Türetilmiş indeksi sıfırdan kur. derived/runs'a DOKUNMAZ (D-38)
# Argümansız: gerçek corpus → gerçek indeks. Argümanlı: fixture'a karşı kanıt koşusu.
reindex kok='corpus' db='derived/index/suite.db':
    @./node_modules/.bin/tsc -b && node scripts/reindex.mjs '{{kok}}' '{{db}}'

# Haftalık sağlık raporu. Rapor yazar, HİÇBİR ŞEYİ DEĞİŞTİRMEZ
doctor:
    @bash scripts/doctor.sh

# Araç zinciri kontrolü + bağımlılıklar
setup:
    @bash scripts/setup.sh

# Üretilmiş JSON şemaları — kaynak Zod, çıktı commit'li (§3.2)
schemas:
    @./node_modules/.bin/tsc -b && node scripts/gen-schemas.mjs

# Üretilmiş belgeler (sağlayıcı kataloğu, şema referansı, CLI referansı)
docs:
    @./node_modules/.bin/tsc -b && node scripts/docs-uret.mjs

