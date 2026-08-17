# Kreatif üretim yetenek envanteri — Photoshop'suz, eksiksiz

> **Neden bu dosya var:** yetenekleri tek tek saymak, her hatırlatmada bir tane daha
> eklemek demekti. Bu envanter TAMAMINI listeliyor; eksik olan burada **eksik** yazıyor.
>
> Ölçüldü ve utandırıcı: render katmanında `object-fit` DIŞINDA hiçbir görsel işleme
> kullanılmıyordu. Chromium bunların neredeyse tamamını standart veriyor ve tek render
> motoru yasası (R-30) sayesinde hepsi TEK yerde toplanıyor — ikinci bir motor, ikinci
> bir hata modu olurdu.

**Durum sütunu:** ✅ kullanılıyor · 🟡 mümkün, bağlanmamış · ⛔ yeni makine gerekir

---

## 1. Raster / fotoğraf işleme

| Yetenek | Karşılığı | Durum |
|---|---|---|
| Şekil maskesi | `clip-path` | 🟡 → FAZ-11.4 |
| Alfa / degrade maskesi | `mask-image` | 🟡 |
| Kırpma ve odak noktası | `object-fit` + `object-position` | ✅ kısmen |
| Duotone / marka tonlaması | `feColorMatrix` | 🟡 → FAZ-11.7 |
| Doygunluk, parlaklık, kontrast, hue | `filter` | 🟡 |
| Karışım kipleri (16 kip) | `mix-blend-mode` | 🟡 |
| Bulanıklık (gauss) | `filter: blur()` | 🟡 → FAZ-11.8 |
| Hareket / radyal bulanıklık | SVG `feGaussianBlur` + `feOffset` | 🟡 |
| Keskinleştirme | `feConvolveMatrix` | 🟡 |
| Grain / gürültü / doku | `feTurbulence` | 🟡 → FAZ-11.8 |
| Vinyet | `radial-gradient` bindirme | 🟡 → FAZ-11.8 |
| Gölge / parıltı | `filter: drop-shadow()` | 🟡 |
| Perspektif / eğme / döndürme | CSS `transform` 3B | 🟡 |
| Halftone / posterize / dither | `feComponentTransfer` + desen | 🟡 |
| Katman kompozisyonu | z-index katmanları | ✅ |
| Arka plan silme | BiRefNet (MIT) | ⛔ → FAZ-11.5 |
| Upscale | Real-ESRGAN | ⛔ → FAZ-11.9 |
| Akıllı kırpma (belirginlik) | belirginlik haritası | ⛔ → FAZ-11.9 |

## 2. Vektör / şekil

| Yetenek | Karşılığı | Durum |
|---|---|---|
| Temel şekiller | SVG `rect/circle/path/polygon` | ✅ FAZ-11.2 |
| Akan eğri (Bézier) | SVG `path` | ✅ D-254 |
| Blob üretimi | sabit kontrol noktalı `path` | ✅ FAZ-11.2 |
| Kontur: kalınlık, uç, birleşim, kesik | `stroke-*` | ✅ kısmen |
| Desenler (nokta/çizgi/ızgara/tarama) | SVG `pattern` | ✅ FAZ-11.2 |
| Şekil morfu | `path` interpolasyonu | 🟡 (hareket için) |
| **Boole işlemleri** (birleşim/fark/kesişim) | `clipPath` + `mask` + `feComposite` | ⛔ → FAZ-12.10 |
| **Degrade** (doğrusal/radyal/konik) | CSS + SVG | ⛔ → FAZ-12.9 |
| **Mesh degrade / grenli degrade** | katmanlı radyal + `feTurbulence` | ⛔ → FAZ-12.9 |

## 3. Tipografi — Photoshop katman stilleri

| Photoshop | Karşılığı | Durum |
|---|---|---|
| Stroke (kontur) | `-webkit-text-stroke` | ✅ hayalet rakam |
| Drop / Inner Shadow | `text-shadow` | 🟡 → FAZ-11.10 |
| Outer / Inner Glow | çok katmanlı bulanık gölge | 🟡 |
| Gradient Overlay | `background-clip: text` | 🟡 |
| Pattern / Image Overlay | `background-clip: text` + görsel | 🟡 |
| Bevel & Emboss | iki yönlü gölge çifti | 🟡 |
| Knockout / ters metin | `mix-blend-mode: difference` | 🟡 |
| Eğri üstünde metin (Warp) | SVG `textPath` | 🟡 |
| Değişken eksenler | `font-variation-settings` | ✅ Archivo genişlik |
| OpenType özellikleri (ligatür, alternatif) | `font-feature-settings` | 🟡 |
| Tabular / slashed-zero rakam | `font-variant-numeric` | ✅ sayaç |
| Harf/kelime aralığı, satır yüksekliği | CSS | ✅ |
| **Türkçe heceleme** | `softHyphenate`/`syllables` **KOD VAR** — render'a bağlı DEĞİL | ⛔ → FAZ-12.3 |
| Optik kenar hizalama | negatif kenar boşluğu | 🟡 → FAZ-12.3 |
| **Şekil etrafında metin akışı** | `shape-outside` | ⛔ → FAZ-12.10 |
| Vurgu şeridi (marker) | eğik `background` | 🟡 |

## 4. Yerleşim ve kompozisyon

| Yetenek | Durum |
|---|---|
| Kapalı düzen enum'u (4 düzen) | ✅ D-254 |
| Düzenden kompozisyon (punto, yaslama, süs) | ✅ FAZ-10.4b |
| Güvenli alan ve kenar payı | ✅ ölçülü |
| Çok en-boy (1:1 · 4:5 · 9:16) | ✅ FAZ-5.9 |
| Taşma BÖLER, küçültmez | ✅ R-30 |
| **Panoramik / slaytlar arası süreklilik** | ⛔ **EKSİK** — referans örnek 2'nin dili |
| Temel ızgara (baseline grid) | ⛔ **EKSİK** |
| Z-katmanları | ✅ |
| **Çok katmanlı kompozit/montaj** (maske + karışım + opaklık) | ⛔ → FAZ-13.2 |
| **Görsel ağırlık ve denge momenti** | ⛔ → FAZ-13.1 |
| **Optik merkez** (geometrik değil) | ⛔ → FAZ-13.1 |
| **Boşluk ölçeği** (kapalı, keyfî piksel değil) | ⛔ → FAZ-13.1 |
| **Göz yolu / akış yönü** | ⛔ → FAZ-13.1 |

## 5. Renk

| Yetenek | Durum |
|---|---|
| OKLCH rampalar, üç kademe token | ✅ §12.1 |
| Yüzey kapsamlı rol çözümü | ✅ D-260 |
| Chroma tavanı (alan kapsamlı) | ✅ D-253 |
| Kontrast ölçümü (WCAG) | ✅ FAZ-10.3 |
| ΔE2000 palet uyumu | ✅ |
| Duotone eşleme | 🟡 → FAZ-11.7 |
| **Vektörleştirip markaya yeniden boyama** | ⛔ → FAZ-13.3 (VTracer MIT) |
| Erişilebilirlik: renk tek başına anlam taşımaz | ✅ §12.1 |

## 6. Veri görselleştirme

| Yetenek | Durum |
|---|---|
| Akış diyagramı | ✅ FAZ-11.1 |
| Çubuk / çizgi grafik | 🟡 kod VAR, R-32 kaynak bekliyor |
| Halka / pasta | ⛔ **EKSİK** |
| Zaman çizelgesi | ⛔ **EKSİK** |
| Karşılaştırma tablosu (önce/sonra) | ⛔ **EKSİK** |
| KPI / istatistik karosu | ⛔ **EKSİK** |
| İlerleme / gösterge | ⛔ **EKSİK** |
| Tolerans okuması bileşeni | ✅ §4b imza ögesi |

## 7. Varlıklar

| Yetenek | Durum |
|---|---|
| Gömülü marka fontu (latin-ext) | ✅ D-252 |
| Gömülü ikon seti | ⛔ → FAZ-11.3 (Lucide ISC) |
| **İllüstrasyon kütüphanesi** (CC0 modüler) | ⛔ → FAZ-11.10 |
| Logo yerleşimi ve boşluk kuralı | ⛔ **EKSİK** |
| Filigran / kulp | ✅ kulp var |
| İçerik-adresli varlık deposu | ✅ D-248 |

## 8. Kalite ve doğrulama

| Yetenek | Durum |
|---|---|
| Glif metriği, `notdef` sayımı | ✅ golden |
| Kontrast, kaplama, palet, en-boy | ✅ FAZ-10.3 |
| Çakışma tespiti (rakam ↔ şerit) | ✅ |
| Görsel yargı (sınırlayıcı kutulu) | ✅ D-256 |
| Kelime bütçesi (blok türüne göre) | ✅ D-260 |
| Panoramik süreklilik denetimi | ⛔ → FAZ-12.4 |
| **Tasarım eleştirisi** (`design.critique`) | ⛔ → FAZ-13.5 |
| **Çeşitlilik parmak izi** | ⛔ → FAZ-13.4 |
| **Kör kabul** (referansla aynı sınıf mı) | ⛔ → FAZ-13.6 |
| Erişilebilir alt metin (`alt_tr` ≤125) | ✅ **R-34 — zaten zorunlu** |

---

## Kapsam haritası — her ⛔ bir adıma düşüyor mu

**Evet.** Denetim yapıldı; kapsanmayan satır kalmadı.

| Faz | Kapattığı eksikler |
|---|---|
| **FAZ-11** görsellik dili | 11.3 ikon · 11.4 fotoğraf yuvası · 11.5 kesik özne · 11.6 görsel→görsel · 11.7 duotone · 11.8 doku/derinlik · 11.9 yerel raster · **11.10 illüstrasyon** |
| **FAZ-12** Photoshop'suz kudret | 12.1 tipografi stilleri · 12.2 raster ilkelleri · 12.3 Türkçe heceleme + ızgara · 12.4 panorama · 12.5 veri ögeleri · 12.6 marka işareti · 12.7 kompozisyon ailesi · 12.8 piksel boru hattı · **12.9 degrade** · **12.10 şekil cebri + `shape-outside`** |
| **FAZ-13** estetik yargı | 13.1 kompozisyon ilkeleri · 13.2 kompozit/montaj · 13.3 vektörleştirme · 13.4 çeşitlilik · 13.5 tasarım eleştirisi · 13.6 kör kabul |

⚠ **Denetimde çıkan asıl boşluk envanterde HİÇ yoktu:** *estetiği kim yargılıyor?* Kudret
listesi (filtre, efekt, degrade) uzundu ama hepsi ARAÇ. Bir karosel her metriği geçip yine
de çirkin olabilir — çünkü ölçtüklerimiz kusurun YOKLUĞU, güzelliğin VARLIĞI değil.
FAZ-13 bu yüzden var ve bu yüzden ayrı: `kalite` kapısı *kabul edilemezi* eler, FAZ-13
*iyiyi* arar. Karıştırılırsa ya kapı öznel olur ya estetik zorunlu.

⚠ **Denetimde ÇÜRÜTÜLEN bir iddia:** "alt metin eksik" yazmıştım — yanlış. **R-34** Türkçe
`alt_tr` (≤125 karakter) olmayan görselin yayınlanmasını zaten engelliyor. Aynı denetimde
hattın kendisi de sanılandan olgun çıktı: `instagram-post` on bir adımlı, DAG'lı, yetenek
tabanlı, insan onay kapılı ve her koşuda `donmus-plan.json` yazıyor. **Envanter çıkarırken
"yok" demek, "var mı diye bakmak"tan kolaydır** — ikisi karıştırılırsa plan var olanı
yeniden inşa eder.

⚠ **İkinci boşluk:** *"binlerce çeşit"* ölçülmeden iddia edilemez. Ölçülmeyen çeşitlilik
kendi lehimize yorumlanır — kabul sayacının yorumlanabildiği gibi (FAZ-10.7).
