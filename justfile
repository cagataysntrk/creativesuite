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

# Turun 1-2. adımı: DURUM.md oku, aktif adımın okuması gereken her şeyi getir
tur:
    @bash scripts/tur.sh

# Hızlı kapı: commit öncesi. Biçim + tip + lint + ucuz kapılar
check:
    @just gates fast

# Tam doğrulama: her kapı + testler + golden. Faz kapanışında ve bir ay sonra
verify:
    @just gates all
    @just test
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
    @echo "(FAZ-1.10'da Vitest gelecek)" {{args}}

# Golden-file testleri: commit edilen golden JSON METRİKTİR, piksel değil
golden:
    @echo "(FAZ-3.2'de tipografi golden'ı gelecek)"

# Kaydet: kapı → stage → commit → push → KANITLA. Tek darboğaz (R-05).
# Mesajı stdin'den alır:  just save <<'EOF' ... EOF
save file="-":
    @bash scripts/save.sh {{file}}

# ── bakım ────────────────────────────────────────────────────────────────────

fmt:
    @echo "(FAZ-0.C.1'de prettier gelecek)"

# Türetilmiş indeksi sıfırdan kur. derived/runs'a DOKUNMAZ (D-38)
reindex:
    @echo "(FAZ-1.6'da gelecek)"

# Haftalık sağlık raporu. Rapor yazar, HİÇBİR ŞEYİ DEĞİŞTİRMEZ
doctor:
    @bash scripts/doctor.sh

# Araç zinciri kontrolü + bağımlılıklar
setup:
    @bash scripts/setup.sh

# Üretilmiş belgeler (sağlayıcı kataloğu, şema referansı, CLI referansı)
docs:
    @echo "(FAZ-0.B.2c'de gelecek)"

