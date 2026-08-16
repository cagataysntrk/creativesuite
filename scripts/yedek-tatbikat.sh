#!/usr/bin/env bash
# GERİ YÜKLEME TATBİKATI (§14, §16 · D-38 · FAZ-8.7).
#
# **Denenmemiş yedek, yedek değildir.** Bu betik gerçekten yapar: boş bir dizine
# `git clone`, sonra orada `just verify`. Simülasyon değil — kurtarma yolunun kendisi.
#
# **Neyi kanıtlar:** clone edilen ağacın kendi kendine ayakta durduğunu.
# **Neyi KANITLAMAZ ve söyler:** `derived/blobs/` gelmedi (gitignore'lu) ve `age`
# anahtarı gelmedi (repoda değil). Bu ikisi ayrı yedekten gelir; tatbikat onların
# EKSİK olduğunu görünür kılar — sessizce "tamam" demez.
#
# R-77: LANG=tr_TR.UTF-8 altında POSIX sınıfları kırılır.
set -uo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HEDEF="${1:-}"
if [ -z "$HEDEF" ]; then
  HEDEF="$(mktemp -d -t suite-tatbikat-XXXXXX)"
  echo "· hedef verilmedi, geçici dizin: $HEDEF"
fi

echo "── geri yükleme tatbikatı ──"
echo "  kaynak : $ROOT"
echo "  hedef  : $HEDEF"
echo ""

# ── 1. clone ────────────────────────────────────────────────────────────────
# `origin`den değil YEREL depodan clone: uzak depo erişilemezse tatbikat da
# koşamazdı ve o zaman ölçtüğümüz şey ağ olurdu, yedek değil. Uzağın güncelliği
# `just yedek` denetiminin işi.
if ! git clone --quiet "$ROOT" "$HEDEF/repo" 2>/dev/null; then
  echo "✗ clone BAŞARISIZ — kurtarma yolu kırık (12. yasa)"
  exit 1
fi
echo "✓ clone tamam"

# ── 2. clone ile GELMEYENLER ────────────────────────────────────────────────
#
# Asıl bulgu burası. "git clone yeter" varsayımı tam burada kırılır ve kırıldığını
# ancak eski bir varlığı açmaya çalışırken fark edersin.
eksik=0
if [ -d "$ROOT/derived/blobs" ] && [ -n "$(ls -A "$ROOT/derived/blobs" 2>/dev/null)" ]; then
  if [ ! -d "$HEDEF/repo/derived/blobs" ] || [ -z "$(ls -A "$HEDEF/repo/derived/blobs" 2>/dev/null)" ]; then
    echo "⚠ derived/blobs GELMEDİ — gitignore'lu; ayrı yedekten gelmeli"
    eksik=$((eksik + 1))
  fi
fi
if [ -f "$ROOT/secrets/secrets.enc.yaml" ]; then
  echo "⚠ age anahtarı GELMEDİ — repoda değil, ayrı kasadan gelmeli (sops çözülemez)"
  eksik=$((eksik + 1))
fi

# `derived/runs/` GELMELİ: türetilemez ve ignore edilmiyor (D-38, R-52).
if [ -d "$ROOT/derived/runs" ]; then
  if [ ! -d "$HEDEF/repo/derived/runs" ]; then
    echo "✗ derived/runs GELMEDİ — TÜRETİLEMEZ defter kayboldu (D-38)"
    eksik=$((eksik + 1))
  else
    echo "✓ derived/runs geldi (türetilemez defter korundu)"
  fi
fi

# ── 3. klonda doğrulama ─────────────────────────────────────────────────────
echo ""
echo "── klonda kurulum ve doğrulama ──"
cd "$HEDEF/repo" || exit 1
# ⚠ Tatbikat, RUNBOOK'un kendisini izlemek zorunda. İlk sürüm yalnız `pnpm install`
# + `just check` koşuyordu ve iki adımı atlıyordu; sonuç kırmızıydı ama sebebi
# "kurtarma bozuk" değil "tatbikat eksik"ti. **Kendi prosedürünü izlemeyen bir
# tatbikat, prosedürü değil kendini sınar.**
if ! pnpm install --frozen-lockfile --silent >/dev/null 2>&1; then
  echo "✗ pnpm install BAŞARISIZ — klon kendi kendine ayakta duramıyor"
  exit 1
fi
echo "✓ bağımlılıklar kuruldu"

# `just setup` git kancalarını kurar. **Temiz bir klonda kancalar YOKTUR** ve bu
# sessiz bir boşluktur: commit kapıları devre dışıyken yapılan bir commit, kuralları
# hiç görmeden geçer. Kurtarma sonrası ilk iş bu.
if ! just setup >/dev/null 2>&1; then
  echo "✗ just setup BAŞARISIZ — git kancaları kurulamadı, commit kapıları DEVRE DIŞI"
  exit 1
fi
echo "✓ kancalar kuruldu (commit kapıları aktif)"

# `derived/index` gitignore'lu ve clone ile GELMEZ — gelmemesi de doğru (11. yasa).
# Ama gelmediği için yeniden kurulmalı; kurulmazsa bağlam çözümü çalışmaz.
if ! just reindex >/dev/null 2>&1; then
  echo "✗ just reindex BAŞARISIZ — türetilmiş indeks kurulamıyor (11. yasa çürür)"
  exit 1
fi
echo "✓ indeks sıfırdan kuruldu"

if just check >/dev/null 2>&1; then
  echo "✓ just check YEŞİL — klon kendi kendine doğrulanıyor"
else
  echo "✗ just check KIRMIZI — geri yüklenen ağaç doğrulanamıyor"
  exit 1
fi

echo ""
if [ "$eksik" -gt 0 ]; then
  echo "⚠ TATBİKAT KISMİ: $eksik parça clone ile gelmedi ve ayrı yedekten gelmeli."
  echo "  Klon ayakta duruyor ama yedek TAM DEĞİL — bunu bilmek, bilmemekten iyidir."
  exit 0
fi
echo "✓ tatbikat tamam: klon ayakta ve doğrulanıyor"
