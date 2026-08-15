#!/usr/bin/env bash
# GROUP: fast
# Tema katmanı zorlaması (§12.2, §12.3, §12.4, §12.7 · FAZ-4.1b).
#
# `theme.css` ELLE yazılır — yani bir sonraki düzenleme onu sessizce bozabilir.
# Tasarım sisteminin kuralları yorumda yazıyorsa kural değil, temennidir.
#
# Kapı BEŞ şey arar, hepsi CSS'te mekanik olarak görünür:
#   1. `box-shadow`            — gölge yasak, tek istisna [data-elevation='overlay']
#   2. `font-weight: 700+`     — konsolda kalın yasak
#   3. ölçek dışı px boşluk    — 4px temel birim, yalnız 4/8/12/16/24/32
#   4. `prefers-color-scheme`  — tema anahtarı YAPISAL olarak yok
#   5. >320ms geçiş            — hareket tavanı
set -euo pipefail

# R-77: LANG=tr_TR.UTF-8 altında POSIX karakter sınıfları Türkçe collation'a göre
# çözülür ve `[a-z]` aralığı `i`/`I` çevresinde kırılır — desen YARIM eşleşir ve
# kapı yeşil raporlar.
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# Tema kaynakları: elle yazılan CSS. Üretilmiş `derived-tokens/` HARİÇ — orayı
# `tokens` kapısı denetler ve iki kapının aynı dosyaya iki farklı kural uygulaması,
# birinin diğerini görmeden gevşetilmesi demektir.
DOSYALAR=$(find packages apps -name '*.css' -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null || true)
if [ -z "$DOSYALAR" ]; then
  echo "✗ hiç tema CSS'i bulunamadı — kapı boş geçiyor"
  exit 1
fi

hata=0
bildir() {
  echo "  ✗ $1"
  hata=1
}

for f in $DOSYALAR; do
  # ── 1. gölge yasağı ────────────────────────────────────────────────────────
  # İstisna KURAL BLOĞUNA bağlı, dosyaya değil: `[data-elevation='overlay']`
  # seçicisinden sonraki ilk `}`e kadar. "Bu dosyada gölge serbest" demek,
  # yasağı ilk gerçek ihtiyaçta esnetmek olurdu.
  golge=$(awk "
    /\[data-elevation='overlay'\]/ { muaf = 1 }
    muaf && /^\}/                  { muaf = 0; next }
    !muaf && /box-shadow/          { print FILENAME \":\" FNR }
  " "$f")
  if [ -n "$golge" ]; then
    while IFS= read -r satir; do
      bildir "$satir  box-shadow — gölge YASAK (§12.4). Yükseklik = arka plan basamağı + pah çizgisi."
    done <<< "$golge"
  fi

  # ── 2. konsolda 700+ ağırlık ───────────────────────────────────────────────
  agirlik=$(grep -nE 'font-weight:[[:space:]]*(700|800|900|bold)' "$f" || true)
  if [ -n "$agirlik" ]; then
    while IFS= read -r satir; do
      bildir "$f:${satir%%:*}  ağırlık 700+ — konsolda YASAK (§12.2). Ölçek: 400/450/500/550/650."
    done <<< "$agirlik"
  fi

  # ── 3. ölçek dışı boşluk ───────────────────────────────────────────────────
  # Yalnız boşluk özelliklerinde px değeri aranır. `1px` kenarlık ve `2px` yarıçap
  # boşluk DEĞİLDİR ve ölçeğe tabi değildir — yanlış pozitif de bir hatadır.
  # ⚠ Desen satır BAŞINA bağlanamaz: `.x { padding: 5px; }` tek satırlık bir kuraldır
  # ve ilk sürüm onu kaçırdı — kapı yeşil raporladı. Bir CSS özelliği satırın
  # herhangi bir yerinde başlayabilir; anchor `^` değil, sınır karakteridir.
  bosluk=$(grep -nE '(^|[;{[:space:]])(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|inline|block))?(-(start|end))?:[^;}]*[0-9]+px' "$f" || true)
  if [ -n "$bosluk" ]; then
    while IFS= read -r satir; do
      no="${satir%%:*}"
      degerler=$(printf '%s' "$satir" | grep -oE '[0-9]+px' | tr -d 'px')
      for d in $degerler; do
        case "$d" in
          0 | 4 | 8 | 12 | 16 | 24 | 32) ;;
          *) bildir "$f:$no  ${d}px ölçek dışı — 4px temel birim, yalnız 4/8/12/16/24/32 (§12.3)." ;;
        esac
      done
    done <<< "$bosluk"
  fi

  # ── 4. tema anahtarı ───────────────────────────────────────────────────────
  # `prefers-reduced-motion` MEŞRU (§12.7) ve bu desene takılmaz — yalnız
  # `prefers-color-scheme` aranıyor.
  tema=$(grep -n 'prefers-color-scheme' "$f" || true)
  if [ -n "$tema" ]; then
    while IFS= read -r satir; do
      bildir "$f:${satir%%:*}  prefers-color-scheme — tema anahtarı YAPISAL olarak yok (§12.4). Yüzey bağlamı bir ROTA'dır."
    done <<< "$tema"
  fi

  # ── 5. hareket süresi ──────────────────────────────────────────────────────
  # 320ms tavanı (§12.7). `s` cinsinden yazılanlar da: 0.5s = 500ms.
  #
  # ⚠ İlk sürüm `bc` kullanıyordu ve HER ZAMAN 0 hesaplıyordu: `printf '%s'`
  # sondaki satır sonunu basmıyor, `bc` ise ifadeyi sonlandırmak için onu istiyor.
  # Sonuç sessiz bir "syntax error" ve `|| echo 0` ile yutulan bir hata — kapı
  # 500ms'lik bir geçişi yeşil geçirdi. Aritmetik kabuğun kendisinde: bir
  # bağımlılık, yanlış kullanıldığında 40 satır koddan daha kırılgandır (R-75).
  sure=$(grep -noE '[0-9]+(\.[0-9]+)?m?s[^a-zA-Z-]' "$f" || true)
  if [ -n "$sure" ]; then
    while IFS= read -r satir; do
      no="${satir%%:*}"
      deger="${satir#*:}"
      deger="${deger%%[!0-9.ms]*}"
      case "$deger" in
        *ms)
          ms="${deger%ms}"
          ms="${ms%%.*}"
          ;;
        *s)
          sn="${deger%s}"
          tam="${sn%%.*}"
          kesir="${sn#*.}"
          [ "$kesir" = "$sn" ] && kesir=0
          kesir="$(printf '%s000' "$kesir" | cut -c1-3)"
          ms=$((tam * 1000 + 10#$kesir))
          ;;
        *) continue ;;
      esac
      if [ "$ms" -gt 320 ]; then
        bildir "$f:$no  ${deger} — hareket 320ms'yi geçemez (§12.7)."
      fi
    done <<< "$sure"
  fi
done

if [ "$hata" -eq 1 ]; then
  echo ""
  echo "tema katmanı ihlali — kural §12'de, düzeltme CSS'te"
  exit 1
fi

n=$(printf '%s\n' "$DOSYALAR" | grep -c . || true)
echo "  $n tema dosyası · gölge yasağı · 700 ağırlık · 4px ölçek · tema anahtarı · 320ms tavanı"
