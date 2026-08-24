# Seamless karosel — ARAŞTIRMA ve ÖLÇÜM raporları

⚠ **Bu dosya ajan raporlarının BİREBİR KOPYASIDIR.** Yeniden yazılmadı, özetlenmedi —
bağlam sıfırlansa da tam metin burada durur. Her rapor kendi başlığı altında.

⚠ Raporların ağırlık merkezi **ölçüm**: font denetimi 62–68 aile üzerinde `cmap`/`GSUB`
okunarak, gren ve bantlanma bu deponun kendi Chromium'unda piksel bazında render edilip
ölçülerek, renkler OKLCH→sRGB dönüşümü hesaplanarak üretildi. İddia değil, çalıştırılmış
kod.


---

## RAPOR 1 — Bağımsız seamless araştırması (aşama 1)

The parallel research returned. I now have everything — let me compile.

---

# Upcytech Karosel — Tasarım Araştırması

Aşağıdakilerin çoğu **ölçüldü**, iddia edilmedi. Font denetimi 62 aile üzerinde `cmap`/`GSUB` okunarak, gren ve bantlanma değerleri projenin kendi Chromium'unda (playwright 1.56.1) render edilip piksel bazında ölçülerek, renk değerleri OKLCH→sRGB dönüşümü kodla hesaplanarak üretildi.

## 0. Önce iki uyarı

**A. Tuval oranı riski — doğrulanması gerek.** Son commit 3:4 (1080×1440) tuvale geçmiş. Kaynaklar çelişiyor: [Buffer](https://buffer.com/resources/instagram-image-size/) 3:4'ü *grid kırpma referansı* sayıyor ve karosel için yükleme oranlarını 1:1 / 4:5 / 1.91:1 olarak veriyor; birkaç SEO kaynağı 2026'da 3:4'ün native olduğunu iddia ediyor. Karosel native 3:4 kabul etmiyorsa Instagram kırpar ve **kesintisizlik bozulur** — panorama dilimleri artık hizalanmaz. Gerçek bir yüklemeyle doğrulayın. Bu arada güvenli hamle: taşıyıcı içeriği 1080×1440'ın **4:5 orta bandına** (üst/alt 45px pay) sığdırmak. R-88'in 80px'i bunu zaten karşılıyor — mevcut kural sizi koruyor.

**B. Türkçe için "iyi görünüyor" bir test değildir.** Aşağıda hem font hem de efekt tarafında, Latin metinde tamamen sağlıklı görünüp Türkçe'de sessizce bozulan iki ayrı hata modu ölçüldü.

---

## 1. SEAMLESS AKIŞ MANTIĞI

Kesintisizlik bir *arka plan* özelliği değil, **her kesimin ayrı ayrı** özelliği — R-87 bunu zaten doğru kurmuş. Akış kuran beş mekanizma:

| # | Mekanizma | Nasıl çalışır | Upcytech karşılığı |
|---|---|---|---|
| 1 | **Tek uzun fotoğraf** | Panorama kesilir; göz kesimi "devam" diye okur | Ayıklama hattının yatay traveling çekimi |
| 2 | **Kesim-aşan öge ("swipe magnet")** | Kesimin üstüne kasten ilginç bir şey konur: kırpılmış başlık, ok, yarım kalan nesne | R-87'nin taşıyıcısı — ama *süsten değil içerikten* türemeli (D-268) |
| 3 | **Tipografik cümle** | Bir cümle slaytlara bölünür; her slayt gramatik olarak eksiktir | "Hattın %3'ü kayıp / demek ayda 40 ton / demek yılda bir vardiya" |
| 4 | **Işık gradyanı** | Tek yönlü ışık panoramayı boydan boya kateder; her slayt farklı bir aydınlanma evresi | Gece vardiyası anlatısı için birebir |
| 5 | **Nesnenin hareketi / tekrar + sapma** | Aynı öge tekrar eder, tek bir yerde sapar | Gursky mantığı: 200 aynı bant, tek sapma anlamı taşır |

**Kaynaklar:** [zaps.design — "swipe magnet"](https://zaps.design/blog/seamless-instagram-carousel-guide) · [attentionclaw — görsel süreklilik](https://www.attentionclaw.com/blog/carousel-design-principles-guide) · [postplanify](https://postplanify.com/blog/instagram-carousel-guide)

Sürekliliği **tek başına arka plan taşıyamaz.** attentionclaw'ın kuralı: zemini, düzeni ve metin konumunu sabit tut, *yalnız içerik değişsin*; görsel değişimi ancak kasıtlı vurgu için (kanca ve CTA slaytı) harca.

**Ölçülmüş ek:** panorama üstüne uygulanan gren, 6480×1440'a kadar bozulmadan taşınıyor (dilim σ'ları 2.05 / 1.82 / 1.55 — Chromium sessiz bir filtre küçültmesi yapmıyor). Ama **gren katmanı tüm panoramaya tek parça uygulanmalı**; slayt başına ayrı `::after` verilirse doku fazı her kesimde sıfırlanır ve kesim görünür hale gelir.

---

## 2. ZEMİN ZANAATI — ölçülmüş değerler

### 2.1 Önce kötü haber: JPEG kalitesini yükseltmek bantlanmayı ÇÖZMÜYOR

1080×1440 koyu mavi gradyanda (bandın en acımasız hali) ölçüm — "bant%" = sütun profilinde düz plato oranı:

| Kurulum | bant% | seviye | KB |
|---|---|---|---|
| grensiz q=75 | 95.1% | 46 | 43 |
| grensiz q=82 | 94.9% | 50 | 44 |
| grensiz q=90 | 96.2% | 43 | 47 |
| **grensiz q=95** | **95.9%** | **45** | **55** |

q=75'ten q=95'e çıkmak %28 dosya büyüklüğü ödetiyor ve **hiçbir şey düzeltmiyor**. Bant kodekte değil, 8-bit kaynakta.

### 2.2 Tek çözüm gren — ve eşiği var

| Gren σ | q=82 | q=90 | q=95 |
|---|---|---|---|
| 0.5 | 93.8% | 68.9% | 43.6% |
| 1.0 | 58.5% | 39.4% | 33.3% |
| 1.5 | 31.5% | 27.9% | 21.3% |
| **2.0** | 22.7% | **20.1%** (172KB) | 16.7% |
| 3.0 | 14.5% | 12.0% | 11.3% |

σ=0.5'te JPEG greni **siliyor** (q=82'de hâlâ %93.8 düz) — eşik altı yüksek frekansı DCT atıyor. **Tavsiye: σ≈2.0, q=90.**

### 2.3 Doğru feTurbulence reçetesi — alfayı sabitlemezseniz gri perde

Standart reçete (`feTurbulence` + `saturate(0)`) alfa kanalını da gürültülü bırakıyor; sonuç ortalama luminansı **+9** kaldırıyor (siyahlar ölüyor). Düzeltme: alfayı 1'e sabitle.

```css
/* GREN — panoramanın TAMAMINA tek katman */
.panorama::after{
  content:''; position:absolute; inset:0; pointer-events:none;
  background-image:url("data:image/svg+xml,\
%3Csvg xmlns='http://www.w3.org/2000/svg'%3E\
%3Cfilter id='n' color-interpolation-filters='sRGB'%3E\
%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E\
%3CfeColorMatrix type='saturate' values='0'/%3E\
%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='1'/%3E%3C/feComponentTransfer%3E\
%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:256px 256px;
  mix-blend-mode:soft-light;
  opacity:var(--gren-op);
}
```

Ölçülmüş sonuç (zemin rgb(28,38,66)): `soft-light @ 0.25` → **σ=2.06, luminans kayması yalnız +0.49**. Perde yok, hedef σ tutuyor.

### 2.4 ⚠ Sessiz arıza: tam sayı `baseFrequency` = SIFIR gren

| baseFrequency | 0.5 | 0.99 | **1** | 1.01 | 1.5 | **2** |
|---|---|---|---|---|---|---|
| σ | 4.10 | 4.10 | **0.000** | 4.11 | 4.12 | **0.000** |

`baseFrequency='1'` ya da `'2'` **tamamen düz** çıktı veriyor — Perlin kafesi piksel ızgarasıyla birebir hizalanıp sıfır örnekliyor. Hata vermez, uyarmaz; gren yok olur. R-85'in ("CSS tanımsız `var()` için hata VERMEZ") tam kardeşi — **kapı yazmaya değer.**

Ayrıca: σ tüm tam-sayı-olmayan frekanslarda ~4.10 sabit. Yani **`baseFrequency` tane BOYUTUNU belirler, ŞİDDETİNİ değil** — şiddet yalnız `opacity`'den gelir. Temiz ayrım.

### 2.5 ⚠ Gren opaklığı yüzey parlaklığına göre ÖLÇEKLENMELİ

`soft-light` gölgelerde çöküyor — yani bandın en çok olduğu yerde gren en az:

| zemin L | 8 | 16 | 24 | 32 | 48 | 64 | 96 | 128 | 180 | 230 |
|---|---|---|---|---|---|---|---|---|---|---|
| soft-light .25 | **0.70** | 1.23 | 1.63 | 1.94 | 2.31 | 2.53 | 2.71 | 2.62 | 2.00 | 0.83 |
| overlay .25 | 0.51 | 0.77 | 1.12 | 1.46 | 2.16 | 2.87 | 4.30 | 5.72 | 3.35 | 1.18 |
| normal .12 | 2.87 | 2.87 | 2.87 | 2.87 | 2.87 | 2.87 | 2.87 | 2.87 | 2.87 | 2.87 |

`normal` düz ama gri perde ödetiyor. Doğru çözüm — **opaklığı yüzey L'sine göre ayarla:**

| Yüzey L | soft-light opacity | elde edilen σ | luminans kayması |
|---|---|---|---|
| < 20 (çok koyu) | **0.70** | 1.90 | +0.7 |
| 20–40 | 0.40 | 1.93–3.09 | +0.8 |
| 40–140 (orta) | **0.25** | 2.06–2.71 | +0.5 |
| > 180 (açık) | 0.35–0.40 | ~2.0 | +1.5 |

Yani `--gren-op` bir sabit değil, **yüzey token'ının fonksiyonu** olmalı.

### 2.6 Yüzey aileleri — Chromium'da doğrulandı

| Yüzey | reçete | ölçülen σ | yatay/dikey doku |
|---|---|---|---|
| `kagit` | `#EAE7E3` + noise(1.2,4) 256px + noise(0.02,5) 700px, ikisi soft-light | 4.06 | 0.98 (izotropik) |
| `beton` | `#7E7A74` + noise(0.9,4) overlay + noise(0.012,6) 900px multiply | 14.88 | 0.97 |
| `celik` | `#585E65` + noise(**`0.004 0.9`**,3), `background-size:100% 256px`, soft-light | 11.07 | **0.02** ← güçlü yatay |
| `buzlu` | radial-gradient + noise(0.85,4) soft-light | 29.99 | 1.02 |

`celik`'in sırrı **anizotropik baseFrequency**: `'0.004 0.9'` (x çok düşük, y yüksek) fırçalanmış metalin yönlü izini veriyor — ölçülen yatay/dikey oranı 0.02, yani neredeyse saf yatay.

**Halftone — saf CSS, Chromium'da çalışıyor:**

```css
.halftone{
  background-image:
    radial-gradient(circle at 50% 50%, #000 0 46%, #fff 54% 100%),
    var(--kaynak);
  background-size:8px 8px, 100% 100%;
  background-blend-mode:overlay;
  filter:blur(0.6px) contrast(20) grayscale(1);
}
```

Ölçüm: piksellerin **%96.9'u** uçlara itiliyor (referans %34.4) — gerçek ikili halftone, nokta boyutu parlaklıkla değişiyor. `background-size` nokta aralığını (4–12px), `contrast()` sertliği belirliyor: `contrast(8)` → 114 seviye (yumuşak, dither), `contrast(40)` → 22 seviye (sert, gazete).

**Kaynaklar:** [Codrops — feTurbulence ile doku](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/) · [CSS-Tricks — Grainy Gradients](https://css-tricks.com/grainy-gradients/) · [MDN feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence) · [Codrops — duotone/feComponentTransfer](https://tympanus.net/codrops/2019/02/05/svg-filter-effects-duotone-images-with-fecomponenttransfer/) · [utilitybend — SVG filtreleri](https://utilitybend.com/blog/revisiting-svg-filters-my-forgotten-powerhouse-for-duotones-noise-and-other-effects) · [Risograph.css](https://osmanyy.com/projects/risograph-css/) · [Risograph referansı](https://chrislemke.github.io/website_designs/designs/Risograph.html) · [Una Kravets — vignettes](https://una.im/vignettes)

---

## 3. TİPOGRAFİ — 62 aile denetlendi

Projenin Inter'i elediği sınav yeniden kuruldu (`cmap` 15 Türkçe kod noktası + `Ş`U+015E ≠ `Ș`U+0218 + `GSUB` `latn/TRK`). Denetleyici önce mevcut dördü ve Inter'i doğru sınıflandırarak kalibre edildi — **Inter `latn/TRK YOK` çıktı, depo kaydıyla birebir.** Google Fonts eski-UA uçları tek `@font-face`, `unicode-range`siz **tam** font döndürüyor; sonuçlar alt küme yanıltması değil.

### ⛔ ELENENLER

| Aile | Sebep |
|---|---|
| **Stardos Stencil** | `ğ Ğ İ ş Ş` **YOK** — 10/15. Tofu çizer. |
| **Allerta Stencil** | `ğ Ğ İ ş Ş` **YOK** — 10/15 |
| **Share Tech Mono** | `ğ Ğ İ ş Ş` **YOK** — 10/15 |
| **IBM Plex Sans / Mono / Serif / Sans Condensed** | 15/15 ama **`latn/TRK` YOK** — hem Google hem `github.com/IBM/plex` upstream sürümünde. Sanayi işi için en bariz tercih, Inter'le aynı kapıdan eleniyor. |
| Fraunces, Newsreader, Roboto Slab, Space Mono, DM Mono, Archivo Black, Teko, Khand, Anonymous Pro, Overused Grotesk | `latn/TRK` yok (Inter sınıfı) |

### ✅ GEÇENLER — sekiz öneri

Hepsi **15/15 + `Ş`≠`Ș` + `latn/TRK` VAR + `locl` VAR**, hepsi OFL.

| # | Aile | Eksenler (ikiliden doğrulandı) | Neden bu iş | Kaynak |
|---|---|---|---|---|
| 1 | **Archivo** | `wght 100..900` **`wdth 62..125`** | Omnibus-Type, grotesk. **Tek aile hem normal hem condensed hem expanded** — projenin D-296'da vazgeçtiği genişlik ekseni, Türkçesi tam bir ailede geri geliyor. Bu listedeki en önemli isim. | [Google Fonts](https://fonts.google.com/specimen/Archivo) |
| 2 | **Big Shoulders** | `wght 100..900` `opsz 10..72` | Chicago'nun **belediye yazı karakteri** (XO Type Co). Demiryolu işaretlerinden türetilmiş condensed American Gothic — "iş için yapılmış harfler". Sanayi karakteri hakiki, dekoratif değil. | [xotype.co](https://xotype.co/2020/07/14/building-big-shoulders/) · [bigshoulders.me](https://bigshoulders.me/) |
| 3 | **Big Shoulders Stencil** | `wght 100..900` `opsz 10..72` | **Aynı ailenin stencil kesimi** — Türkçesi tam çalışan tek stencil. Diğer üç stencil `ğşİ` yokluğundan elendi. Kasa/konteyner şablonlaması için. | [Google Fonts](https://fonts.google.com/specimen/Big+Shoulders+Stencil) |
| 4 | **Martian Mono** | `wght 100..800` **`wdth 75..113`** | Teknik mono, genişlik ekseni olan nadir mono. Ölçüm etiketi, seri no, veri bloğu için. | [Google Fonts](https://fonts.google.com/specimen/Martian+Mono) |
| 5 | **Azeret Mono** | `wght 100..900` | Displaay kesimi; JetBrains Mono'dan çok daha karakterli, "yazılım aracı" değil "endüstriyel belge" okur. | [Google Fonts](https://fonts.google.com/specimen/Azeret+Mono) |
| 6 | **Roboto Serif** | `wght 100..900` `opsz 8..144` **`wdth 50..150`** `GRAD -50..100` | Dört eksen. Mekanik/editoryal serif; `opsz` ile hem 8px etiket hem 144px kapak başlığı tek dosyadan. Source Serif 4'ün yerine çok daha geniş bir manevra alanı. | [Google Fonts](https://fonts.google.com/specimen/Roboto+Serif) |
| 7 | **Anybody** | `wght 100..900` **`wdth 50..150`** | Ekstrem genişlik aralığı — Eksen 3 (ölçek ailesi) için kasıtlı deformasyon aracı. | [Google Fonts](https://fonts.google.com/specimen/Anybody) |
| 8 | **Mona Sans** | `wght 200..900` **`wdth 75..125`** `opsz 0..100` | GitHub, OFL. Google dışı ama tam geçti. Nötr-endüstriyel grotesk, üç eksen. | [github/mona-sans](https://github.com/github/mona-sans) |

**Yedekler (aynı sınavdan geçti):** Zilla Slab (Mozilla, mekanik slab), Young Serif, Chivo/Chivo Mono, Public Sans (USWDS), Schibsted Grotesk, Space Grotesk, Saira Condensed / Extra Condensed, Barlow Condensed, League Gothic (`wdth 75..100`), Geist / Geist Mono, Instrument Sans/Serif, Literata (`opsz 7..72`), Fragment Mono, Sometype Mono, Hubot Sans (`wdth 80..120`).

> **Not:** `latn/TRK` yokluğu bugün görünür kusur doğurmayabilir — deponuzun Inter için yazdığı gerekçe aynen geçerli. Ama listenin üstündeki sekiz aile bu bedeli ödemenizi gerektirmiyor.

---

## 4. HTML/CSS GÖRÜNÜMÜNDEN KURTULMA

### Neden "kodla çizilmiş" duruyor — teşhis

925studios ve DEV'in analizleri artı sizin çıktınıza bakınca, sebepler şunlar: [AI Slop rehberi](https://www.925studios.co/blog/ai-slop-web-design-guide) · [DEV — AI görünümünü düzeltmek](https://dev.to/alanwest/how-to-fix-the-ai-generated-look-in-your-frontend-1ahh)

1. **Sıfır doku** — saf `#RRGGBB` zemin gerçek dünyada yoktur
2. **Matematiksel mükemmel eğri** — `border-radius` her köşede aynı
3. **Eşit aralık** — her boşluk 8'in katı; ritim yok, ızgara var
4. **Düz gölge** — tek `box-shadow`, tek yön, sıfır renk sıcaklığı
5. **Dikey yığın** — full-width bölümler, ortalanmış içerik
6. **Mor-mavi gradyan** — 925studios'un "1 numaralı ele veren işaret"i
7. **Simetri** — asimetri bir karar gerektirir, varsayılan değildir

### Düzensizlik enjeksiyonu — somut değerler

Determinist ama düzensiz: `run_id`'den tohumlanmış bir PRNG kullanın (Yasa 11 — yeniden üretilebilirlik korunur).

```
döndürme       : ±0.15° … ±0.4°   (0.4° üstü "eğri kondu" okur)
konum kayması  : ±2 … ±5 px
boşluk jitter  : temel × (0.94 … 1.06)   — 8'in katı ritmini kırar
optik hiza     : yuvarlak/köşeli harf başları için ±1.5px manuel taşırma
köşe yarıçapı  : SIFIR ya da >32px — 4–12px arası tam olarak "bootstrap" bandı
gölge          : iki katman — sıcak yakın (0 1px 2px), soğuk uzak (0 12px 32px)
```

### Kenar aşındırma — ⚠ Türkçe'ye özgü tuzak

`feDisplacementMap` ile letterpress/serigrafi kenarı. **Ölçülmüş sınır:**

```html
<filter id="asindir" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

| scale | sonuç (test dizesi `ÖLÇÜM HATTI ŞĞİ`) |
|---|---|
| **3–4** | ✅ Kenarlar baskı gibi; **Ö Ç Ü ı Ş Ğ İ hepsi sağlam** |
| 6 | sınırda |
| **12** | ⛔ Ö'nün umlaut noktaları eriyor, Ğ'nin breve'i deforme, İ'nin noktası dağılıyor |

Kritik olan şu: **scale=12'de Latin harfler hâlâ iyi görünüyor.** `MEASUREMENT LINE` yazıp bakan biri bu ayarı onaylar ve Türkçesi bozuk yayınlar. **Aksan işaretleri taban harflerden ÖNCE ölür** — küçük ve izole oldukları için. Kenar efekti testleri her zaman `ÖLÇÜM HATTI ŞĞİ` ile yapılmalı.

### Katman mantığı — riso/overprint

Gerçek mürekkep hissi düz renkle değil, **üst üste basılan katmanla** gelir:

```css
.murekkep-a{ background:var(--accent); mix-blend-mode:multiply; }
.murekkep-b{ background:var(--signal); mix-blend-mode:multiply;
             transform:translate(2px,-1px); }  /* misregistration 1–4px */
```

Riso referansı: kayıt kayması gerçekte 3mm'ye kadar çıkıyor; web'de **1–4px** doğru ölçek. Halftone noktası **4–8px** — üstü dikkat dağıtıyor.

---

## 5. TEMA ÇEŞİTLİLİĞİ — beş eksen

*(Bu bölüm ve 6–7, paralel yürütülen ikinci araştırmadan; kaynaklar aşağıda.)*

Temel ilke — **kenarları tasarla, ortayı değil.** Sabit kalanı ve esneyebileni ayrı ayrı tanımla.

**Kanonik kanıt: Marber Grid (Penguin Crime, 1961).** Sabit: bant sistemi, oranlar (üst başlık bölgesi üç bant, görsel alan üçte ikiden biraz fazla), sola dayalı tip, seri rengi. Değişken: yalnızca görsel. → [Eye Magazine](https://www.eyemagazine.com/feature/article/penguin-crime-text-in-full)

| Eksen | Değişen | SABİT kalan | Değerler |
|---|---|---|---|
| **1 · Yüzey** | doku haritası, grain, vignette, kenar | grid, tip ailesi, kenar boşluğu, künye | `kagit` / `beton` / `celik` / `cam` — vignette 0.04–0.28, grain op. §2.5 tablosundan |
| **2 · Işık** | anahtar seviyesi, ışık yönü | renk rolleri, kontrast eşikleri | `high-key` (zemin L .95–.98) / `low-key` (.16–.25) / `raking` (.30–.40, 12–18° tek yön) / `flat` |
| **3 · Ölçek** | konuya mesafe, tip tavanı | ölçek **oranı**, grid modülü, ölçü bandı | `makro` (görsel %35–45, H1 96–120px) / `orta` (%50–60, 72–88) / `genis` (%65–78, 56–68) / `tam-kanama` (%100, 120–160 ters kontrast) |
| **4 · Renk rolü rotasyonu** | hangi renk yüzeyi sahiplenir | rol SAYISI (7) ve ilişkileri | `ink-on-paper` / `blue-field` / `signal-led` / `mono` |
| **5 · Yoğunluk** | slayt başına bilgi birimi | min. tip 28px, min. kenar 64px | `seyrek` (boşluk ≥%55) / `orta` (%38–48) / `yogun` (%22–32) |

Kırpma ayrı bir alt-eksen: `inset` / `bleed-1` / `bleed-2` / `cross`. D-268 zaten `cross`'u zorunlu kılıyor — **eksen olarak formalize edin.**

**Değişmezler (10 şablonun tamamında):** grid modülü ve kenar tabanı · tip ölçeği **oranı** (boyut değil) · marka mavisinin min %2 alanla mevcudiyeti · 7 renk rolü ve kontrast eşikleri · künye konumu · kesim-aşan öge kuralı.

**Referanslar:** [Pentagram — MIT Media Lab](https://www.pentagram.com/work/mit-media-lab) (tek 7×7 grid, 23 araştırma grubu) · [Blue Note / Reid Miles](https://en.wikipedia.org/wiki/Album_covers_of_Blue_Note_Records) (350 kapak, tek kimlik) · [ECM](https://eyemagazine.com/feature/article/think-of-your-ears-as-eyes) · [Field Notes](https://fieldnotesbrand.com/products/autumn-trilogy) (format sabit, yalnız kâğıt değişir) · [Müller-Brockmann Musica Viva](https://socks-studio.com/2016/11/30/joseph-muller-brockmann-musica-viva-posters-for-the-zurich-tonhalle/) · [Frontify/TBI — esnek sistemler](https://the-brandidentity.com/insight/itll-flex-but-will-it-break-with-frontify-we-explore-how-to-build-foolproof-flexible-systems) · [Umicore — Variations](https://brand.umicore.com/en/umicore-brand/variations/)

---

## 6. RENK — hesaplanmış, tahmin değil

### 6.1 Marka renginizin gerçek konumu

`oklch(0.600 0.206 262)` = **`#3577F9`**, sRGB içinde — ama **tavanın %95'inde** (L=0.600, h=262'de maks kroma **0.217**). Headroom yalnız 0.011.

### 6.2 ⚠ Sabit kroma rampası SESSİZCE kırpıyor

h=262'de L'ye göre maksimum kroma:

| L | 0.15 | 0.20 | 0.30 | 0.40 | 0.50 | 0.60 | 0.70 | 0.80 | 0.90 |
|---|---|---|---|---|---|---|---|---|---|
| maks C | 0.112 | 0.107 | 0.144 | 0.188 | **0.233** | 0.217 | 0.157 | 0.101 | 0.048 |
| C=0.206 içeride mi | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

C=0.206'yı **yalnız L=0.50–0.60 taşıyabiliyor.** Token sistemi L'yi gezdirip kromayı sabit tutarsa 10 basamağın 8'i kırpılır — ve kırpma **hue kaydırır**: L=0.15'te `#0F0061` çıkıyor, bu marka mavisi değil mor. R-85 sınıfı sessiz arıza.

### 6.3 Cusp-takipli rampalar (hepsi sRGB içinde, `C = maxC(L) × 0.85`)

```css
--mavi-100 : oklch(0.160 0.101 262);  /* #000337 */
--mavi-200 : oklch(0.240 0.102 262);  /* #021A4E */
--mavi-300 : oklch(0.320 0.130 262);  /* #072C73 */
--mavi-400 : oklch(0.420 0.167 262);  /* #1244A6 */
--mavi-500 : oklch(0.520 0.206 262);  /* #1C5DDD */
--mavi-600 : oklch(0.600 0.185 262);  /* #3E79ED  ← marka */
--mavi-700 : oklch(0.680 0.143 262);  /* #6696F0 */
--mavi-800 : oklch(0.760 0.104 262);  /* #8DB1F4 */
--mavi-900 : oklch(0.850 0.063 262);  /* #B8CFF8 */
--mavi-1000: oklch(0.930 0.029 262);  /* #DEE8FC */
```

**Nötr "sıfır kroma" DEĞİLDİR** — 0.004–0.014 arası bir sıcaklık taşır:

```css
/* SICAK (kâğıt/beton) h=75 */        /* SOĞUK (çelik/ölçüm) h=250 */
--kum-200 : oklch(0.200 0.007 75);    --celik-200 : oklch(0.200 0.010 250);  /* #13161A */
--kum-500 : oklch(0.480 0.010 75);    --celik-500 : oklch(0.480 0.014 250);  /* #585E65 */
--kum-900 : oklch(0.880 0.006 75);    --celik-900 : oklch(0.880 0.007 250);  /* #D4D8DC */
--kum-1000: oklch(0.950 0.004 75);    --celik-1000: oklch(0.950 0.004 250);  /* #ECEFF1 */
```

### 6.4 ⚠ Marka mavisi üzerine BEYAZ metin AA'yı geçmiyor

`#3577F9` üzerine beyaz = **4.07** (gövde için 4.5 gerekir). Siyah = 5.16. Mavi zeminde beyaz gövde metni istiyorsanız `--mavi-500` (`#1C5DDD`) ya da daha koyuya inin.

Doğrulanmış çiftler: koyu zemin/ak mürekkep **15.95** · koyu zemin/marka mavi **4.83** · açık kum/koyu mürekkep **14.72** · koyu zemin/sinyal amber **9.70**.

### 6.5 Sinyal renkleri ICAT EDİLMESİN — ISO 3864 / RAL

Hedef kitlenizin fabrika zemininde her gün gördüğü renkler:

| Anlam | RAL | hex | OKLCH |
|---|---|---|---|
| UYARI | 1003 Signal Yellow | `#F9A900` | `oklch(0.793 0.167 75)` |
| WARNING | 2010 Signal Orange | `#D05D29` | `oklch(0.614 0.159 42)` |
| DANGER | 3001 Signal Red | `#9B2423` | `oklch(0.456 0.155 26)` |
| ZORUNLU | 5005 Signal Blue | `#005387` | `oklch(0.428 0.110 246)` |
| GÜVENLİ | 6032 Signal Green | `#237F52` | `oklch(0.531 0.111 157)` |

**Gamut gerçeği:** L=0.60'ta turuncu (h=55) maks kroma 0.149, sarı (h=95) 0.124 — mavinin 0.217'sine **asla** ulaşamaz. Sinyali maviyle "eşit doygunlukta" yapmaya çalışmayın; **L'de yükseltin.**

### 6.6 Beş palet (kontrastlar doğrulandı)

**1 · DÖKÜMHANE** — düşük anahtar, gece döküm atölyesi
`bg oklch(0.180 0.022 262)` #0c121b · `surface` #19212e · `ink` #eff2f7 · `muted` #868c99 · `line` #2f3849 · `accent` #5088f2 · `signal` #f0772d
bg/ink **16.74** · bg/accent 5.50 · bg/signal 6.60. ⚠ accent↔signal kontrastı yalnız **1.20** — asla üst üste, yan yana.

**2 · ATÖLYE KÂĞIDI** — yüksek anahtar sıcak kâğıt, split-complementary
`bg oklch(0.968 0.008 85)` #f7f4ee · `ink` #201c14 · `muted` #747067 · `line` #dad4c7 · `accent` #1e59cd · `signal` #a43520
bg/ink **15.46** · bg/accent 5.68. Nötr rampa kasten **sıcak** (h=85), maviye zıtlık.

**3 · TEMİZ ODA** — optik ayıklama, sensör, kalibrasyon
`bg oklch(0.972 0.006 250)` #f3f6fa · `ink` #1e262f · `accent` #245fd4 · `signal` #e3c23b
bg/ink **14.11**. ⚠ Sinyal sarısı açık zeminde **1.61** — metin olamaz. Yalnız dolgu, üstüne ink (**8.77** ✅), üstüne beyaz **yasak** (1.74).

**4 · GECE VARDİYASI** — sodyum lambası; marka mavisi rolü tersine döner
`bg oklch(0.165 0.014 70)` #120d08 · `ink` #f0ece5 · `accent` (sodyum) #eba941 · `signal` (marka mavisi) #4c87f8
bg/ink **16.41** · bg/accent **9.46**. Mavi "sahip" değil "vurgu" — hue tam 262'de kaldığı için aile hissi bozulmuyor. 10 şablonun 1–2'sinde.

**5 · OKSİT/BAKIR** — geri dönüşüm hammaddesi, oksitlenmiş metal
`bg oklch(0.940 0.012 60)` #f1e9e3 · `ink` #201710 · `accent` #396bcc · `signal` #c45f2b
bg/ink **14.69**. ⚠ accent 4.22 / signal 3.49 — yalnız ≥24px bold veya grafik öge; gövde için accent'i `oklch(0.480 0.170 262)`'ye indirin.

**Aile garantisi matematiksel:** beş palette `accent` hue'su sabit **262**, `signal` hue'su ISO uyarı bandında (26–95). Değişen yalnız L ve C.

**Kaynaklar:** [Evil Martians — OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) · [W3C CSS Color 4 — Gamut Mapping](https://www.w3.org/TR/css-color-4/#gamut-mapping) (OKLCh'de 1 JND = **0.02**) · [Radix — 12 basamak rol tanımı](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) · [Radix — nötr eşleştirme](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) · [ISO 3864](https://handwiki.org/wiki/ISO_3864) · [Kollmorgen — güvenlik renkleri](https://www.kollmorgen.com/en-us/developer-network/safety-colors)

> **P3 kullanmayın.** Instagram JPEG'i sRGB'ye dönüyor. OKLCH'in kazancı burada geniş gamut değil, **öngörülebilir L** ve otomatik palet üretimi.

---

## 7. SANAYİ/B2B GÖRSEL DİLİ

### En yakın eşleşme: TOMRA

[One TOMRA — Solidarity of Unbridled Labour](https://solidarityofunbridledlabour.com/projects/one-tomra/) · [tomra.com](https://www.tomra.com/). Bağlam birebir sizinki: satın almalar sonrası Food/Mining/**Recycling**/Collections bölümlerini tek markada birleştirme.

**Çalınacak spesifik hamle — daire çerçeve aygıtı.** TOMRA fotoğrafı dikdörtgen kutuda göstermiyor; **dairesel maske** içinde gösteriyor. Bu tek geometrik kısıt, birbirinden tamamen farklı fotoğrafları (dağ manzarası, makine detayı, insan) tek aileye bağlıyor. **Karosel karşılığı:** görsel maskesi bir "aygıt" olsun (daire / kesik köşe / ölçüm parantezi) ve **10 şablonda değişmesin.** Fotoğraf değişir, çerçeve değişmez.

### Altı referans ve hamleleri

| Referans | Çalınacak hamle |
|---|---|
| **[Hydro / Snøhetta](https://www.snohetta.com/projects/hydro)** | Palet **malzemeden** türetilmiş: alüminyum grisi, boksit kırmızısı, hidroelektrik mavisi. Ana marka rengi "Hydro Blue" = `#444D55` — **kroma 0.018**, neredeyse akromatik. Bir malzeme markasının "marka mavisi" bir slate grisi olabiliyor. → Upcytech'in malzemesi *ayrıştırılmış akım*: PET mavisi, alüminyum grisi, HDPE süt beyazı. |
| **[Arup / Pentagram](https://www.pentagram.com/work/arup)** | Tek marka rengi + sadeleştirilmiş tipografi = katı çerçeve; içeride zengin görsel dünya serbest. → Tipografi ve künyeyi taş gibi sabitleyin, tüm varyasyon bütçesini yüzey/ışık/ölçek eksenlerine harcayın. |
| **[Bernd & Hilla Becher](https://www.tate.org.uk/art/artists/bernd-becher-and-hilla-becher-718)** | Fotoğrafik parametreleri **kilitle**, konuyu serbest bırak: cepheden bakış, perspektif kontrolü (paralel çizgiler korunur), optik seçimiyle **benzer nesneler benzer boyutta**, S/B. → Kesintisizliği üslupla değil sabit çekim parametreleriyle kurun. Görsel brief prompt'una yazılabilir sözleşme: `frontal, eye-level, no perspective distortion, diffuse light, consistent apparent scale`. |
| **[Edward Burtynsky](https://www.edwardburtynsky.com/about/statement)** | Zaten sizin sektörünüz ("geri dönüşüm sahaları, maden atıkları, rafineriler"). Hamle: **ölçek + detay aynı karede** — ne salt makro (bağlam kaybolur), ne salt geniş hol (anlam kaybolur). Tekrar eden dokunun içinde tek ölçek anahtarı (insan, palet, konteyner). |
| **[Brass Hands / Helix-DB](https://the-brandidentity.com/project/brass-hands-frames-helix-dbs-ai-infrastructure-as-industrial-machinery)** | Yanık turuncu / nötr kum / koyu kahve — "oksitlenmiş metal"; kurucu: *"altyapı markalaşmasına hâkim olan maviden anında ayrışma."* Görsel dil montaj hatları, barkodlar, terminal çıktılarından türetilmiş. → **Etiket/veri bloğu katmanı**: küçük monospace etiketler, ölçüm birimleri, seri no formatı. Üretim maliyeti sıfır, "mühendislik markası" sinyali anında. |
| **[Bloomberg Businessweek / Karlssonwilker](https://karlssonwilker.com/case-study/bloomberg-businessweek)** | Stil kılavuzu bir parametre listesi: renk hiyerarşisi, **raster yüzdeleri**, **çizgi kalınlıkları**, satır aralığı, **projeksiyon açıları**. → Karoselin bir slaydı hep veri slaydı olsun, parametreleri kilitli: tek çizgi kalınlığı seti (1/2/4px), tek raster seti (%15/%35/%70), tek projeksiyon açısı (izometrik 30° **veya** düz cephe — karışmaz). |

### Muamele repertuarı

| Muamele | Ne zaman | Parametre |
|---|---|---|
| Makro detay | hassasiyet iddiası | f/4–f/8, konu %60+ kare |
| Geniş hol (Gursky) | kapasite iddiası | yükseltilmiş bakış, ufuk %38, tekrar + tek sapma |
| Yalayan ışık | doku/malzeme | tek yön, 12–18°, sert gölge |
| Duotone | seri tutarlılığı, stok kırma | shadow=`ink`, highlight=`accent`/`signal`, kontrast +25% |
| Yüksek kontrast S/B | tipoloji ızgarası | grain 0.04 |
| Aşırı kırpma | jenerikten kaçış | konu 2 kenardan taşar |
| Şematik overlay | ölçüm/veri | tek çizgi seti, tek açı, monospace etiket |

### Stok görünümünden kaçış — yasaklı liste

1. Baret + tablet + makineyi işaret eden gülümseyen ikili
2. Bulanık robot kolu önünde odakta operatör
3. **Mavi tonlamalı "dijital dönüşüm" HUD overlay'i** — parlayan altıgen, devre şeması, IoT ikonu, bağlantı çizgisi
4. Dişli çark + devre kartı kolajı
5. Kaynak kıvılcımına karşı işçi silüeti
6. Drone tesis çekimi + altın saat + lens flare
7. El sıkışma / cam toplantı odası
8. Yeşil yaprak + fabrika bacası kolajı

| Klişe | Yerine |
|---|---|
| Baretli işaret eden ikili | Kalibrasyon vidasını çeviren tek elin makrosu, yalayan ışık, yüz yok |
| HUD/altıgen overlay | Gerçek arayüz ekran görüntüsünün aşırı kırpımı + monospace annotasyon |
| Drone tesis çekimi | Becher tipolojisi: 4 makine, aynı cephe, aynı ölçek, ızgara |
| Kıvılcım silüeti | Duotone: shadow=ink, highlight=sinyal turuncu — %100 grafik, %0 dram |
| Yeşil yaprak | Ayrıştırılmış akımın flat-lay'i: PET/alüminyum/HDPE ayrı, tepeden, ölçüm etiketli |

**Tek cümlelik kural:** Bir kare stok fotoğrafa benziyorsa çözüm başka fotoğraf bulmak değil — **kırpmayı sertleştir, tonlamayı ikiye indir, üzerine ölçüm koy.**

[Boagworld](https://boagworld.com/design/stock-photography/) · [Down With Design](https://www.downwithdesign.com/inspiration/10-biggest-stock-photography-cliches/)

---

## Mühendis için uygulama sırası

1. **Kapı yaz: tam sayı `baseFrequency` yasak.** Sessizce sıfır gren üretiyor (§2.4). R-85'in kardeşi.
2. **Kapı yaz: sabit kroma rampası yasak** — `C ≤ maxC(L) × 0.85` zorlansın (§6.2). Kırpma hue kaydırıyor.
3. **Kapı yaz: kontrast eşikleri** — `bg/ink ≥ 12`, `bg/muted ≥ 4.0`, `bg/accent ≥ 4.5` (gövde) / `≥ 3.0` (≥24px bold). `#3577F9` üstüne beyaz gövde metni (**4.07**) reddedilmeli.
4. **`--gren-op`'u sabit değil, yüzey L'sinin fonksiyonu yap** (§2.5 tablosu). Gren tüm panoramaya **tek katman**.
5. **JPEG kalitesini q=90'da sabitle** ve bantlanmayı grenle çöz — kaliteyi yükseltmek işe yaramıyor (§2.1).
6. **Kenar efekti testlerini `ÖLÇÜM HATTI ŞĞİ` ile yap**, `scale ≤ 4` (§4). Latin metinle test etmek bozuk Türkçe yayınlatır.
7. **Font kararı:** Archivo (`wdth 62..125`) tek başına grotesk+condensed+expanded ihtiyacını karşılıyor ve D-296'da vazgeçilen genişlik eksenini Türkçesi tam olarak geri getiriyor. Başlık için Big Shoulders, stencil gerekirse Big Shoulders Stencil. **IBM Plex'i düşünmeyin — Inter'le aynı kapıdan eleniyor.**
8. **Kataloğa beş eksen alanı ekle:** `yuzey` · `isik` · `olcek` · `renk-rolu` · `yogunluk`. 4×4×4×4×3 = 768 kombinasyon; 10 şablona 10 açıkça seçilmiş kombinasyon ata.
9. **Tuval oranını gerçek yüklemeyle doğrula** (§0.A).

Denetim betikleri `/tmp`'de bırakıldı: `font-turkce-denetim.mjs` (cmap+GSUB+TRK), `bant-olcum.py`, `gren-kalibre2.mjs`, `oklch.py`/`rampa.py`. Kalıcı hale getirilecekse `docs/kurallar/OLCUMLER.md` defterine bağlanmaları uygun olur — hepsi o dosyanın istediği türden, tekrar üretilebilir ölçüm.

---

## RAPOR 2 — Paralel araştırma (renk · tema · B2B görsel dili)

# Upcytech Karosel Tasarım Araştırması — Üç Eksen

Aşağıdaki bulguların tamamı kaynak URL'li. Renk değerleri tahmin değil: OKLCH→sRGB dönüşümü ve sRGB gamut sınırları kodla hesaplandı, kontrast oranları doğrulandı.

---

# A. TEMA VARYASYON EKSENLERİ — "Aynı aile, farklı his"

## Temel ilke: kenarları tasarla, ortayı değil

Frontify/The Brand Identity'nin esnek sistem incelemesi tam olarak bunu söylüyor: sabit kalanı (marka rengi, birincil yazı karakteri, logo davranışı) ve esneyebileni (kompozisyon, kırpma, tip ölçeği) ayrı ayrı tanımla — kural özgürlük getirir, kısıt değil.
→ https://the-brandidentity.com/insight/itll-flex-but-will-it-break-with-frontify-we-explore-how-to-build-foolproof-flexible-systems

Umicore bunu yayınlanmış marka kılavuzunda ayrı bir "Variations" bölümü olarak kurumsallaştırmış: kurallar herkese uygulanır, istisnalar açıkça listelenir.
→ https://brand.umicore.com/en/umicore-brand/variations/

**Kanonik kanıt — Marber Grid (Penguin Crime, 1961).** Romek Marber'ın önerisi bir varyasyon ekseni tasarımının ders kitabı örneği. Rick Poynor'ın Eye Magazine analizine göre Marber "neyin korunacağının ve neyin değişeceğinin dikkatli bir analizine" dayandı: seri rengi (yeşil) korundu ama tazelendi, yatay bantlama korundu; görsel alanın **üçte ikisinden biraz fazlasını**, üst başlık bölgesi **üç bant** (kolofon/seri adı/fiyat — başlık — yazar adı), tip sola dayalı. Yani sabit: bant sistemi + oranlar + renk kodu. Değişken: görsel.
→ https://www.eyemagazine.com/feature/article/penguin-crime-text-in-full
→ https://designmuseum.org/penguin-books

---

## EKSEN 1 — YÜZEY AİLESİ (Surface / Material)

**Değişen:** zemin malzemesinin fiziksel karakteri — doku haritası, grain yoğunluğu, vignette gücü, kenar davranışı.
**SABİT KALAN:** grid, tipografi ailesi ve tip ölçeği oranı, kenar boşlukları, logo konumu, baseline.

Gerçek örnek — **Brass Hands / Helix-DB**: paleti "yanık turuncu, nötr kum, koyu kahve" üzerine kurmuşlar, çünkü bu tonlar "oksitlenmiş metal ve imalat yüzeyleri gibi" hissettiriyor. Kurucu Kyle Anthony Miller: *"Bu renkler fiziksel hissettiriyor."* Ayrıca bilinçli olarak "altyapı markalarına hâkim olan maviden anında ayrışma" sağlıyor.
→ https://the-brandidentity.com/project/brass-hands-frames-helix-dbs-ai-infrastructure-as-industrial-machinery

Gerçek örnek — **Field Notes**: format ve iç spesifikasyon **tamamen sabit**; her edisyonda sadece kapak kâğıdı ve iç çizgi tipi değişiyor (Autumn Trilogy: Mohawk Via serisinden "Warm Red", "Safety Yellow", "Scarlet", vellum finish).
→ https://fieldnotesbrand.com/products/autumn-trilogy
→ https://en.wikipedia.org/wiki/Field_Notes

**Uygulanabilir parametre aralıkları (10 şablon için 4 yüzey ailesi):**

| Yüzey | grain opacity | grain size | vignette | kenar |
|---|---|---|---|---|
| `kagit` (atölye kâğıdı) | 0.045–0.07 | 1.2–1.8 px | 0.08–0.14 | soft, 0 radius |
| `beton` | 0.08–0.12 | 2.5–4 px | 0.18–0.28 | keskin, 0 radius |
| `celik` (fırçalanmış) | 0.03–0.05 (yönlü, 0°) | 0.8–1.2 px | 0.10–0.18 | 1px hairline çerçeve |
| `cam` (temiz oda) | 0.00–0.02 | — | 0.04–0.08 | 1px %8 opak iç çizgi |

Vignette gücü 0.1–0.4 bandını aşmasın; 0.4 üstü "Instagram filtresi" okur.

---

## EKSEN 2 — IŞIK AİLESİ (Light)

**Değişen:** anahtar (key) seviyesi ve ışık yönü — high-key / low-key / raking (yalayan) / flat.
**SABİT KALAN:** tipografi rengi rolleri (ink/muted ilişkisi), kontrast eşikleri, görselin kompozisyondaki alanı.

Gerçek örnek — **Bernd & Hilla Becher tipolojileri.** Bu, bir "seri"nin nasıl tutarlı kaldığının en saf mühendislik modeli. Her kare için sabitlenen parametreler: her zaman "objektif" cepheden bakış; monorail kameranın perspektif kontrolüyle **paralel çizgiler korunur**; 90mm–600mm arası optik seçimiyle **benzer nesneler benzer boyutta görünür**; siyah-beyaz — çünkü renk üç boyutlu hacmi okumayı bozuyor. Değişken olan tek şey: konu. Sunum: ızgara.
→ https://en.wikipedia.org/wiki/Bernd_and_Hilla_Becher
→ https://www.tate.org.uk/art/artists/bernd-becher-and-hilla-becher-718

Gerçek örnek — **ECM Records.** Eye Magazine: "minimalist sans-serif tipografi + rüya benzeri siyah-beyaz fotoğraf" — 25 yıl boyunca trendleri yok sayarak tek bir görsel kimlik ve üslup sürdürüldü. Sanat yönetmenleri Barbara Wojirsch ve Dieter Rehm sabit temaları takip etti: "yalnızlık ve güzellik", Eicher'in deyimiyle "iç manzara".
→ https://eyemagazine.com/feature/article/think-of-your-ears-as-eyes

**Parametreler:**

| Işık ailesi | zemin L (oklch) | ink L | görsel exposure bias | gölge sertliği |
|---|---|---|---|---|
| `high-key` | 0.95–0.98 | 0.21–0.27 | +0.15 EV, siyah nokta 0.08'e kaldırılır | yumuşak |
| `low-key` | 0.16–0.25 | 0.94–0.96 | −0.20 EV, beyaz nokta 0.92'ye indirilir | sert |
| `raking` | 0.30–0.40 | 0.95 | kontrast +25%, tek yönlü gradient 12–18° | çok sert |
| `flat` | 0.88–0.92 | 0.24 | kontrast −15%, düz | yok |

---

## EKSEN 3 — ÖLÇEK AİLESİ (Scale / Crop logic)

**Değişen:** konuya olan mesafe (makro detay ↔ geniş hol) ve buna eşlik eden tip ölçeği tavanı.
**SABİT KALAN:** ölçek **oranı** (ör. 1.25 veya 1.333), grid modülü, satır uzunluğu tavanı.

Gerçek örnek — **Bloomberg Businessweek + Karlssonwilker.** Karlssonwilker'ın teslim ettiği stil kılavuzu tam da bir parametre listesi: *"renk hiyerarşisi ve raster yüzdelerinden çizgi kalınlıklarına, satır aralığına ve projeksiyon açılarına kadar"* sistemleştirilmiş. Turley'in yaklaşımı ise "grid kırılmak için vardır — grafikler, diyagramlar ve fotoğraflar tarafından".
→ https://karlssonwilker.com/case-study/bloomberg-businessweek
→ https://www.itsnicethat.com/news/bloomberg-businessweek-redesign-rob-vargas-creative-director-160617
→ https://commercialtype.com/custom/bloomberg_businessweek

Gerçek örnek — **MIT Media Lab / Pentagram.** Aynı **7×7 grid** kullanılarak ML monogramı üretildi ve **aynı grid** 23 araştırma grubunun her birine genişletildi. Sabit: grid. Değişken: içindeki form.
→ https://www.pentagram.com/work/mit-media-lab

**Parametreler (1080×1440 tuval için):**

| Ölçek | görsel doluluk | H1 boyutu | grid sütun | konu mesafesi |
|---|---|---|---|---|
| `makro` | %35–45 | 96–120 px | 6 sütun | detay, ≤20cm |
| `orta` | %50–60 | 72–88 px | 8 sütun | makine gövdesi |
| `genis` | %65–78 | 56–68 px | 12 sütun | hat/hol |
| `tam-kanama` | %100 (bleed) | 120–160 px, ters kontrast | 6 sütun | atmosfer |

Kırpma mantığı ayrı bir alt-eksen: `inset` (kenar boşluğu korunur) / `bleed-one-edge` (tek kenardan taşar) / `gutter-crossing` (kesintisiz karosel için slayt sınırını aşan öge). Sizin D-268 kararınız zaten üçüncüsünü zorunlu kılıyor — bunu bir eksen olarak formalize edin: her şablon `crop: inset|bleed-1|bleed-2|cross` alsın.

---

## EKSEN 4 — RENK ROLÜ ROTASYONU (Color role, tema değil)

**Değişen:** hangi renk *yüzeyi sahiplenir* — zemin mavi mi, mürekkep mi, yoksa sadece aksan mı?
**SABİT KALAN:** rollerin sayısı ve ilişkisi (bg / surface / ink / muted / line / accent / signal — hep 7 rol), kontrast eşikleri.

Gerçek örnek — **Blue Note / Reid Miles.** Miles 11 yılda ~350 kapak tasarladı. Sabit kalan: format, Francis Wolff'un seans fotoğrafları, duotone/tint mantığı, Bauhaus-İsviçre disiplini. Değişken: yazı karakteri, harf büyüklüğü karışımları, asimetri, tint rengi. Sonuç: 350 farklı kapak, tek kimlik.
→ https://en.wikipedia.org/wiki/Album_covers_of_Blue_Note_Records

Gerçek örnek — **Arup / Pentagram.** "Cesur ve monolitik": yeniden çizilmiş logotype, **tek marka rengi** ve sadeleştirilmiş tipografi — bu güçlü çerçevenin *içinde* zengin bir illüstrasyon ve fotoğraf dünyası serbest bırakılıyor. Siyah, mühendislik hassasiyetini ve endüstriyel kapasiteyi taşıyor.
→ https://www.pentagram.com/work/arup

Gerçek örnek — **Müller-Brockmann, Musica Viva / Zürich Tonhalle (1950'ler–70'ler).** Onlarca afiş, tek seri. Sabit: Akzidenz-Grotesk, grid tabanlı kompozisyon, monokromatik disiplin. Değişken: geometrik konstrüksiyon ve renk çifti.
→ https://socks-studio.com/2016/11/30/joseph-muller-brockmann-musica-viva-posters-for-the-zurich-tonhalle/
→ https://collections.vam.ac.uk/item/O110243/musica-viva-poster-josef-muller-brockmann/

**Parametre:** her şablon bir `renk-rolu` alır — `ink-on-paper` (mavi sadece aksan) / `blue-field` (mavi zemin, beyaz mürekkep) / `signal-led` (aksan sinyal rengi, mavi geri çekilir) / `mono` (yalnız nötr rampa, mavi tek bir 4px çizgide). Bu tek başına 10 şablonu ikiye katlar.

---

## EKSEN 5 — YOĞUNLUK (Density)

**Değişen:** slayt başına bilgi birimi sayısı, boşluk oranı.
**SABİT KALAN:** minimum tip boyutu, minimum kenar boşluğu, satır uzunluğu.

Dieter Rams'ın Vitsœ'de yayınlanan on ilkesinden ikisi bunu doğrudan yönetir: "İyi tasarım mümkün olduğunca az tasarımdır" ve "İyi tasarım anlaşılırdır".
→ https://www.vitsoe.com/us/about/good-design

**Parametreler:** `seyrek` (1 iddia + 1 rakam, boşluk ≥%55) / `orta` (2–3 birim, boşluk %38–48) / `yogun` (4–6 birim + tablo/annotasyon katmanı, boşluk %22–32). Minimum tip 28px, minimum kenar 64px — hiçbir yoğunlukta ihlal edilmez.

---

## Değişmezler listesi (10 şablonun tamamında)

Bunlar hiçbir eksende oynamaz — aile hissini bunlar taşır:
1. Grid modülü ve kenar boşluğu tabanı
2. Yazı karakteri ailesi ve tip ölçeği **oranı** (boyut değil, oran)
3. Marka mavisinin *bir yerde* mevcut olması (min %2 alan)
4. Rol sayısı (7 renk rolü) ve kontrast eşikleri
5. Logo/künye konumu ve boyutu
6. Kesintisiz karosel için kesim-aşan öge kuralı

---

# B. RENK — Tek marka mavisine hapsolmadan uyum

## B.1 Marka renginizin gerçek konumu (hesaplanmış)

`oklch(0.600 0.206 262)` = **`#3577f9`** — sRGB içinde, ama sınıra çok yakın.

**Kritik mühendislik bulgusu — chroma cusp:**

```
H=262 için sRGB'de maksimum chroma, L'ye göre:
  L=0.35  maxC=0.163
  L=0.45  maxC=0.209
  L=0.50  maxC=0.232
  L=0.55  maxC=0.249   <-- CUSP (tepe)
  L=0.60  maxC=0.217   <-- markanız burada, C=0.206 (headroom sadece 0.011)
  L=0.70  maxC=0.157
  L=0.80  maxC=0.101
  L=0.90  maxC=0.048
```

Yani markanız cusp'ın **üstünde** oturuyor ve tavanın %95'ini kullanıyor. Sonuç: **L'yi 0.60'ın üzerine çıkarırken chroma'yı düşürmezseniz kırpılırsınız.** Bu, Evil Martians'ın anlattığı "her hue'nun farklı maksimum chroma'sı var, seçicideki delikler bu yüzden" olgusunun sizin özel sayınız.
→ https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
→ https://oklch.com/

Karşılaştırma, L=0.60'ta hue'ya göre maxC: H=30 → 0.241, H=48 → 0.164, H=75 → 0.127, H=95 → 0.123, H=205 → 0.103, H=262 → 0.217, H=300 → 0.258. **Turuncu ve sarı, mavinin doygunluğuna asla ulaşamaz.** Bu yüzden sinyal turuncusunu maviyle "eşit doygunlukta" yapmaya çalışmayın; onun yerine L'de yükseltin.

## B.2 Sabit chroma vs daraltılmış chroma rampası (hesaplanmış)

**Sabit chroma başarısız oluyor.** C=0.09, H=262 ile 12 basamak denendiğinde:

```
L=0.98  C=0.090  -> KIRPILDI (maxC=0.009)
L=0.95  C=0.090  -> KIRPILDI (maxC=0.024)
L=0.90  C=0.090  -> KIRPILDI (maxC=0.048)
L=0.82  C=0.090  -> KIRPILDI (maxC=0.090, tam sınırda)
L=0.72 ... L=0.24 -> OK
L=0.18  C=0.090  -> KIRPILDI (maxC=0.086)
L=0.13  C=0.090  -> KIRPILDI (maxC=0.066)
```

Yani sabit chroma rampası 12 basamağın **5'ini** kırpıyor ve uçlarda hue kayması üretiyor.

**Önerilen daraltılmış (tapered) rampa — hepsi sRGB içinde:**

| # | oklch | hex | rol (Radix mantığı) |
|---|---|---|---|
| 1 | `oklch(0.980 0.008 262)` | `#f5f9fe` | uygulama zemini |
| 2 | `oklch(0.950 0.016 262)` | `#e9effa` | ince yüzey |
| 3 | `oklch(0.900 0.032 262)` | `#d3dff4` | bileşen zemini |
| 4 | `oklch(0.820 0.058 262)` | `#b0c5eb` | hover |
| 5 | `oklch(0.720 0.090 262)` | `#86a5de` | seçili |
| 6 | `oklch(0.620 0.140 262)` | `#5684da` | ince kenarlık |
| 7 | `oklch(0.550 0.200 262)` | `#2867e4` | **solid — cusp, en saf** |
| 8 | `oklch(0.480 0.190 262)` | `#1853c6` | solid hover |
| 9 | `oklch(0.400 0.160 262)` | `#0f3f9c` | güçlü kenarlık |
| 10 | `oklch(0.320 0.120 262)` | `#0c2d6f` | düşük kontrast metin |
| 11 | `oklch(0.240 0.085 262)` | `#071c47` | yüksek kontrast metin |
| 12 | `oklch(0.160 0.050 262)` | `#030c22` | koyu zemin |

Radix'in 12 basamaklı rol tanımı bu haritanın gerekçesi: 1–2 zemin, 3–5 bileşen zemini (normal/hover/pressed), 9–10 solid (9 "en yüksek chroma, en saf basamak"), 11–12 metin (Lc 60 ve Lc 90 APCA garantili).
→ https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale

**Kritik uyarı — marka mavisi üzerine metin:** `#3577f9` üzerine **beyaz metin kontrastı yalnızca 4.07** (WCAG AA gövde metni için 4.5 gerekir), siyah metin 5.16. Yani birincil mavi zeminde beyaz gövde metni **kullanmayın**; ya basamak 8'e (`#1853c6`) inin ya da metni siyah yapın.

## B.3 Gamut ve P3

CSS Color 4'ün resmî gamut eşleme algoritması: OKLCh'de ikili arama + local MINDE, `deltaEOK` ile. **OKLCh'de bir JND = 0.02.** Bu, "ne kadar kırparsam fark edilmez" sorusunun sayısal cevabı — kırpılmış ve kırpılmamış renk arasındaki deltaEOK 0.02'nin altındaysa kırpma güvenlidir.
→ https://www.w3.org/TR/css-color-4/#gamut-mapping
→ https://culorijs.org/api/#gamut-mapping

P3 için Evil Martians'ın önerdiği desen (headless Chromium'da da geçerli):
```css
.accent { background: oklch(0.55 0.200 262); }          /* sRGB güvenli */
@media (color-gamut: p3) {
  .accent { background: oklch(0.55 0.260 262); }        /* P3'te daha canlı */
}
```
Ama Instagram JPEG'i sRGB'ye dönüyor — sizin hattınızda **P3 kullanmayın**, sRGB'de kalın. OKLCH'in kazancı burada P3 değil, **öngörülebilir L** ve otomatik palet üretimi.

## B.4 Nötr rampanın sıcaklığı — asıl ayar düğmesi

Radix altı gri sunuyor: `gray` (saf), `mauve` (mor), `slate` (mavi), `sage` (yeşil), `olive` (lime), `sand` (sarı). İki strateji var:
- **Doğal eşleştirme:** aksan hue'suna en yakın hue ile doyurulmuş griyi seç → daha renkli ve uyumlu his. Mavi 262 için → `slate`.
- **Karşıt eşleştirme:** kasıtlı olarak zıt sıcaklıkta gri seç → mavi daha "soğuk teknoloji", gri daha "malzeme" okur.
→ https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette

Refactoring UI'ın kuralı: saf siyahtan başlamayın, çok koyu bir griden başlayıp beyaza doğru düzenli adımlarla çıkın; 8–10 gri tonu gerekir.
→ https://www.refactoringui.com/previews/building-your-color-palette

**Pratik: nötr rampanın chroma'sı 0.006–0.028 arasında kalsın.** Bu aralık tek başına bakıldığında görünmez ama büyük bir zemin yüzeyi olarak kullanıldığında net bir sıcaklık okur. `sıcak` için H=60–90, `soğuk` için H=240–260, `nötr` için C=0.

**Sektörel kanıt — Hydro (Snøhetta).** Dünyanın en büyük alüminyum üreticilerinden birinin **birincil marka rengi neredeyse akromatik**:

| Hydro rengi | hex | OKLCH (hesaplandı) |
|---|---|---|
| Hydro Blue (ana renk!) | `#444D55` | `oklch(0.415 0.018 245)` |
| Hydro Light Blue | `#768692` | `oklch(0.611 0.026 240)` |
| Hydro Aluminium | `#8C8C8C` | `oklch(0.640 0.000 90)` |

Chroma **0.018**. Bir mühendislik/malzeme markası için "marka mavisi" bir slate grisi olabiliyor. Palet gerekçesi: alüminyum grisi, boksit kırmızısı ve hidroelektriğe atfen su mavisi tonları.
→ https://www.hydro.com/en/global/media/brand-center/core-elements/brand-colors/
→ https://www.snohetta.com/projects/hydro

## B.5 Endüstriyel sinyal aksanları — ISO 3864 / RAL, OKLCH'e çevrilmiş

SaaS pastel yerine **standartlaşmış makine emniyet renkleri** kullanın. Bunlar sizin hedef kitlenizin fabrika zemininde her gün gördüğü renkler; hem meşru hem ayırt edici. Hesaplanmış:

| Anlam | RAL | hex | OKLCH |
|---|---|---|---|
| UYARI (CAUTION) | 1003 Signal Yellow | `#F9A900` | `oklch(0.793 0.167 75)` |
| WARNING (orta risk) | 2010 Signal Orange | `#D05D29` | `oklch(0.614 0.159 42)` |
| DANGER (yüksek risk) | 3001 Signal Red | `#9B2423` | `oklch(0.456 0.155 26)` |
| ZORUNLU | 5005 Signal Blue | `#005387` | `oklch(0.428 0.110 246)` |
| GÜVENLİ DURUM | 6032 Signal Green | `#237F52` | `oklch(0.531 0.111 157)` |
| Zemin/sembol | 9003 Signal White | `#ECECE7` | `oklch(0.942 0.007 107)` |
| Sembol | 9004 Signal Black | `#2B2B2C` | `oklch(0.289 0.002 286)` |

→ https://handwiki.org/wiki/ISO_3864
→ https://www.kollmorgen.com/en-us/developer-network/safety-colors

Renk uyumu teorisi tarafı (analog / split-complementary / triadic tanımları ve nedenleri):
→ https://www.interaction-design.org/literature/topics/color-harmony

---

## B.6 BEŞ SOMUT PALET (hepsi sRGB içinde, kontrastlar doğrulandı)

### 1. DÖKÜMHANE (Foundry) — düşük anahtar, gece döküm atölyesi
*Ruh: ağır, sıcaksız, erimiş metal sinyali. Teknik derinlik, gece vardiyası, "makine çalışıyor" anlatısı.*

| Rol | OKLCH | hex |
|---|---|---|
| bg | `oklch(0.180 0.022 262)` | `#0c121b` |
| surface | `oklch(0.245 0.028 262)` | `#19212e` |
| ink | `oklch(0.960 0.008 262)` | `#eff2f7` |
| muted | `oklch(0.640 0.020 262)` | `#868c99` |
| line | `oklch(0.340 0.032 262)` | `#2f3849` |
| accent (marka) | `oklch(0.640 0.170 262)` | `#5088f2` |
| signal | `oklch(0.700 0.170 48)` | `#f0772d` |

Kontrast: bg/ink **16.74**, bg/muted 5.57, bg/accent 5.50, bg/signal 6.60. Hepsi AA üstü.
**Uyarı:** accent ile signal'in birbirine kontrastı sadece 1.20 — ikisini asla üst üste (biri metin, diğeri zemin) kullanmayın; yan yana kullanın.

### 2. ATÖLYE KÂĞIDI (Shop Paper) — yüksek anahtar sıcak kâğıt
*Ruh: teknik doküman, ölçüm raporu, mühendis defteri. Split-complementary: mavi mürekkep + oksit kırmızısı.*

| Rol | OKLCH | hex |
|---|---|---|
| bg | `oklch(0.968 0.008 85)` | `#f7f4ee` |
| surface | `oklch(0.930 0.014 85)` | `#ece7de` |
| ink | `oklch(0.230 0.016 85)` | `#201c14` |
| muted | `oklch(0.545 0.014 85)` | `#747067` |
| line | `oklch(0.870 0.018 85)` | `#dad4c7` |
| accent (marka) | `oklch(0.500 0.190 262)` | `#1e59cd` |
| signal | `oklch(0.490 0.150 33)` | `#a43520` |

Kontrast: bg/ink **15.46**, bg/muted 4.49, bg/accent 5.68, bg/signal 6.15.
Not: nötr rampa **sıcak** (H=85, sarı yönlü) — marka mavisi karşısında kasıtlı sıcaklık zıtlığı.

### 3. TEMİZ ODA (Clean Room) — soğuk yüksek anahtar
*Ruh: optik ayıklama, sensör, kalibrasyon, laboratuvar. Sodyum sarısı sinyal.*

| Rol | OKLCH | hex |
|---|---|---|
| bg | `oklch(0.972 0.006 250)` | `#f3f6fa` |
| surface | `oklch(0.935 0.011 250)` | `#e4eaf1` |
| ink | `oklch(0.265 0.020 250)` | `#1e262f` |
| muted | `oklch(0.560 0.016 250)` | `#6e757e` |
| line | `oklch(0.880 0.016 250)` | `#d0d9e2` |
| accent (marka) | `oklch(0.520 0.190 262)` | `#245fd4` |
| signal | `oklch(0.820 0.150 95)` | `#e3c23b` |

Kontrast: bg/ink **14.11**, bg/muted 4.30, bg/accent 5.29.
**Kritik kural:** signal sarısının açık zemine kontrastı **1.61** — metin rengi olarak kullanılamaz. Yalnızca **dolgu** olarak, üzerine ink konarak: `#e3c23b` üzerine `#1e262f` = **8.77** (güvenli). Üzerine beyaz = 1.74 (**yasak**).

### 4. GECE VARDİYASI (Sodium) — sodyum lambası hâkim
*Ruh: gece tesisi, sodyum buhar aydınlatması, "hat 7/24 dönüyor". Burada marka mavisi rolü tersine döner: sıcak amber hâkim, mavi soğuk karşı-ışık.*

| Rol | OKLCH | hex |
|---|---|---|
| bg | `oklch(0.165 0.014 70)` | `#120d08` |
| surface | `oklch(0.225 0.018 70)` | `#211a13` |
| ink | `oklch(0.945 0.010 80)` | `#f0ece5` |
| muted | `oklch(0.610 0.022 70)` | `#8c8175` |
| line | `oklch(0.320 0.024 70)` | `#3b3126` |
| accent (sodyum) | `oklch(0.780 0.140 75)` | `#eba941` |
| signal (marka mavisi) | `oklch(0.640 0.180 262)` | `#4c87f8` |

Kontrast: bg/ink **16.41**, bg/muted 5.07, bg/accent **9.46**, bg/signal 5.64.
Bu palet marka mavisini "sahip" olmaktan çıkarıp "vurgu" yapıyor — 10 şablonun 1–2'sinde kullanın, aile hissi kaybolmaz çünkü hue tam olarak 262'de kalıyor.

### 5. OKSİT / BAKIR (Oxide) — malzeme paleti
*Ruh: geri dönüşüm hammaddesi, oksitlenmiş metal, hurda. Brass Hands'in Helix-DB'de yaptığı hamlenin sizin hue'nuza uyarlanmış hâli — "altyapı mavisi"nden ayrışma.*

| Rol | OKLCH | hex |
|---|---|---|
| bg | `oklch(0.940 0.012 60)` | `#f1e9e3` |
| surface | `oklch(0.895 0.020 60)` | `#e7dad0` |
| ink | `oklch(0.215 0.020 60)` | `#201710` |
| muted | `oklch(0.530 0.020 60)` | `#756960` |
| line | `oklch(0.830 0.026 60)` | `#d5c4b7` |
| accent (marka) | `oklch(0.545 0.160 262)` | `#396bcc` |
| signal (yanık turuncu) | `oklch(0.600 0.145 45)` | `#c45f2b` |

Kontrast: bg/ink **14.69**, bg/muted 4.44, bg/accent 4.22, bg/signal 3.49.
**Uyarı:** accent 4.22 ve signal 3.49 — bunlar **yalnızca büyük tip (≥24px bold) veya grafik ögesi** için. Gövde metni için accent'i `oklch(0.480 0.170 262)`'ye indirin.

**Palet mühendislik kuralı:** Beş paletin hepsinde `signal` hue'su 26–95 aralığında (ISO 3864 uyarı bandı), `accent` hue'su sabit **262**. Değişen tek şey L ve C. Bu, "aynı aile" garantisini matematiksel olarak sağlar.

---

# C. ENDÜSTRİYEL / B2B GÖRSEL DİL

## C.1 En yakın eşleşme: TOMRA

**TOMRA "The Beauty of Transformation" — Solidarity of Unbridled Labour (2023–24)**
→ https://solidarityofunbridledlabour.com/projects/one-tomra/
→ https://www.tomra.com/

Kapsam: marka daldırma ve araştırma, marka stratejisi ve tasarım, logo ve kimlik programı, **yaratıcı platform tasarımı**, stratejik mesajlaşma, reklam kampanyası konsepti, deneyimsel tasarım, motion graphics, dijital tasarım — marka kitabı ve animasyonlar dahil. Bağlam sizinkiyle birebir: bir dizi satın alma sonrası Food / Mining / Recycling / Collections bölümlerini "One TOMRA" altında birleştirme ihtiyacı.

**Çalınacak spesifik hamle:** **Daire çerçeve aygıtı.** TOMRA fotoğrafı dikdörtgen kutuda göstermiyor — dairesel bir maske içinde gösteriyor ve mesaj (`Making Every Resource Count`) daireyle birlikte yerleşiyor. Bu tek geometrik kısıt, birbirinden tamamen farklı fotoğrafları (dağ manzarası, çocuğunu öpen ebeveyn, makine detayı) tek bir aileye bağlıyor. **Sizin karoselinizde karşılığı:** görsel maskesi bir "aygıt" olsun (daire, kesik köşe dikdörtgen, ya da ölçüm parantezi) ve 10 şablonda **değişmesin**. Fotoğraf değişir, çerçeve değişmez.

İkincil, sektör içi karşılaştırma noktaları — makine "aile fotoğrafı" mantığı ve MWIR/karbon-siyahı ayıklama gibi teknik ürün hikâyeleri:
→ https://www.sesotec.com/emea/en
→ https://www.tomra.com/waste-metal-recycling

## C.2 Altı+ isimli referans ve çalınacak hamleleri

### 1. Hydro / Snøhetta (2018) — malzemeden türeyen palet
→ https://www.snohetta.com/projects/hydro
→ https://old.snohetta.com/projects/400-new-visual-identity-for-hydro
→ https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_hydro_by_snohetta.php

**Hamle:** Palet ve sembol **malzemeden** türetilmiş, soyut markalama dilinden değil: alüminyum grisi, boksit kırmızısı, hidroelektrik suyunun mavileri; daire = alüminyum külçesi. Tipografi: Ivar Hydro (Letters from Sweden, Göran Söderström), iki optik ağırlıkta — **Display başlıklar, Text gövde** — destek yazı karakteri Arial (sistem fontu, evrensel erişim).
→ https://www.hydro.com/en/global/media/brand-center/core-elements/typography/

**Sizin için:** Upcytech'in malzemesi *ayrıştırılmış akım* — paletiniz PET mavisi, alüminyum grisi, karışık atık kahvesi, HDPE'nin süt beyazından türeyebilir. "Marka mavisi + gri" değil, "malzeme + ölçüm".

### 2. Arup / Pentagram — güçlü çerçeve, serbest iç
→ https://www.pentagram.com/work/arup

**Hamle:** Logotype yeniden çizildi, **tek** marka rengi, sadeleştirilmiş tipografi. Bu katı çerçeve, içeride zengin bir illüstrasyon ve fotoğraf dünyasına izin veriyor. Siyah, mühendislik hassasiyeti ve endüstriyel kapasite sinyali.

**Sizin için:** 10 şablonun tipografisi ve künyesi taş gibi sabit olsun; tüm varyasyon bütçesini görsel/yüzey/ışık eksenlerine harcayın.

### 3. Bernd & Hilla Becher — tipoloji yöntemi
→ https://en.wikipedia.org/wiki/Bernd_and_Hilla_Becher
→ https://www.tate.org.uk/art/artists/bernd-becher-and-hilla-becher-718

**Hamle:** Fotoğrafik parametreleri **kilitle**, konuyu serbest bırak. Cepheden "objektif" bakış; monorail kamerayla perspektif kontrolü → paralel çizgiler her karede korunuyor; 90mm–600mm optik seçimiyle farklı mesafelerdeki nesneler **aynı görünür boyutta**; siyah-beyaz (renk hacim okumasını bozduğu için). Sunum ızgarada — *Anonyme Skulpturen*.

**Sizin için:** Bu, "kesintisiz karosel"in fotoğraf tarafındaki tam karşılığı. Slaytlar arası süreklilik illüzyonunu üslupla değil, **sabit çekim parametreleriyle** kurun: aynı ufuk yüksekliği, aynı odak uzaklığı ekvivalenti, aynı beyaz dengesi, aynı siyah nokta. Görsel modeli için bu, prompt'a yazılabilir bir sözleşme: `frontal, eye-level, no perspective distortion, overcast/diffuse light, subject centred, consistent apparent scale`.

### 4. Edward Burtynsky — "artık manzara"
→ https://www.edwardburtynsky.com/about/statement
→ https://www.edwardburtynsky.com/projects/photographs/china

**Hamle:** Sanatçı ifadesi doğrudan bir sanat yönetim brief'i: *"detay ve ölçek bakımından zengin, ama anlamı açık uçlu konular arıyorum. Geri dönüşüm sahaları, maden atıkları, taş ocakları ve rafineriler — normal deneyimimizin dışında kalan ama çıktısından her gün pay aldığımız yerler."* Çekicilik ile itilme, baştan çıkarma ile korku arasında bir diyalog.

**Sizin için:** "Geri dönüşüm sahası" zaten Burtynsky'nin konusu — sektör görselliğinin en yüksek referansı sizin sektörünüzde. Çalınacak spesifik şey: **ölçek + detay aynı karede.** Ne salt makro (bağlam kaybolur), ne salt geniş hol (anlam kaybolur). Tekrar eden bir dokunun içinde tek bir ölçek anahtarı (insan, palet, konteyner).

### 5. Andreas Gursky — yükseltilmiş bakış, inşa edilmiş ölçek
→ https://en.wikipedia.org/wiki/Andreas_Gursky

**Hamle:** Yüksekten, panoramik, büyük ölçekli renk; metodik gözlem ile **dijital konstrüksiyon** birleşiyor — "fotoğraflanan öznelerden daha büyük mekânların sanatı". Düsseldorf Okulu.

**Sizin için:** 1080×1440 dikey formatta bunun karşılığı, çok geniş tek tuvalde tasarlayıp dilimlemek (sizin panorama yaklaşımınız). Gursky'nin dersi: **tekrar bir kompozisyon aracıdır.** Ayıklama hattının 200 aynı bandı, tek bir sapmayla anlam kazanır.

### 6. Brass Hands / Helix-DB (2026) — "altyapı mavisi"nden kaçış
→ https://the-brandidentity.com/project/brass-hands-frames-helix-dbs-ai-infrastructure-as-industrial-machinery

**Hamle:** Palet yanık turuncu / nötr kum / koyu kahve — "oksitlenmiş metal ve imalat yüzeyleri". Kurucu: *"Altyapı markalaşmasına hâkim olan maviden anında ayrışma sağlıyor. Aynı zamanda materyalite getiriyor — bu renkler fiziksel hissettiriyor."* Görsel dil sistem düşüncesinden türetilmiş: **montaj hatları, barkodlar, terminal çıktıları, doğrusal veri yapıları**. Giyim "merchandise" değil "ekipman" gibi okuyor — kol tipografisi, veri blokları, etiketleme. Yazı karakteri: Saans (Displaay).

**Sizin için:** En doğrudan çalınabilir katman **etiket/veri bloğu dili**: küçük monospace etiketler, ölçüm birimleri, seri numarası formatı, barkod benzeri işaretler. Bu, üretim maliyeti sıfır olan ama "bu bir mühendislik markası" sinyalini anında veren bir katman.

### 7. Alek Blik + General Proxy / Sage Geosystems — start-up'tan "endüstriyel güç"e
→ https://the-brandidentity.com/project/alek-blik-transforms-an-energy-start-up-into-an-industrial-powerhouse-brand

**Hamle:** Brief birebir sizin durumunuz: *"Sage'i yükselen bir start-up'tan olgun, pazara hazır, yeni bir kategori tanımlayan bir enerji şirketine konumlandırmak — enerji devlerinin ve devlet ortaklarının karşısında gerçek teknik ağırlık taşıyabilecek bir marka."* Kimliğin bileşenleri (TBI etiketleri): siyah / mavi / gri / kırmızı, minimalist, **ikonlar + linework**, **monospace + sans-serif**, kaplamalı kâğıt ve metal.

**Sizin için:** Monospace + linework + ikon üçlüsü, B2B endüstriyel "teknik ağırlık" için tekrarlanan ve çalışan bir reçete.

### 8. Bloomberg Businessweek / Karlssonwilker — fotoğrafın üstüne veri
→ https://karlssonwilker.com/case-study/bloomberg-businessweek

**Hamle:** Enformasyonu "net, basit, doğrudan ama sayfada cesur ve heykelsi bir varlık" olarak ele alan bir sistem; ardından **kapsamlı bir stil kılavuzu** (renk hiyerarşisi, raster yüzdeleri, çizgi kalınlıkları, satır aralığı, projeksiyon açıları) ve ekibin aylarca eğitimi. Turley'in kendi ifadesiyle "derginin düz, granüler brief'i" ile Karlssonwilker'ın kavramsal gücü iyi bir eşleşmeydi.

**Sizin için:** Karoselin bir slaydı **her zaman** veri slaydı olsun ve bu slaydın parametreleri kilitli olsun: tek bir çizgi kalınlığı seti (1 / 2 / 4 px), tek bir raster yüzdesi seti (%15 / %35 / %70), tek bir projeksiyon açısı (izometrik 30° veya düz cephe — ikisi karışmaz).

### 9. Studio FAX / TMPL — endüstriyel formun tipografiye çevrilmesi
→ https://the-brandidentity.com/project/studio-fax-develops-industrial-identity-system-london-based-design-studio-tmpl

**Hamle:** Radim Peško'nun Union grotesk'i seçildi çünkü "asli konturları TMPL'nin tasarım yaklaşımı ve formlarıyla uyumluydu"; iki renkli, sekiz sayfalık broşür; galvanizli çelik ve çam gibi sert kullanımlı malzemelerin, tek renk finişlerin biçimsel dili.

**Sizin için:** **İki renkli baskı kısıtı**, karosel için harika bir varyasyon ekseni — bir şablon ailesi kendini yalnızca 2 mürekkeple sınırlasın (ink + accent, gri yok). Bu anında "bu bir üretim dokümanı" hissi verir.

### 10. thyssenkrupp / Loved — çelik markasının sadeleşmesi
→ https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_thyssenkrupp_done_in_house.php
→ https://www.red-dot.org/project/thyssenkrupp-brandfactory-14810

**Hamle:** "brandfactory" adlı online portal, kurumsal tasarımın tüm görsel anahtar ögelerini (logo, yazı karakteri, kurumsal renkler) **pratik örneklerle** gösteriyor — tedarikçiler ve çalışanlar için tek kaynak. Red Dot ödüllü.

**Sizin için:** Şablon kataloğunuzun (`packages/contracts/src/katalog.ts`) tam olarak bunun kod karşılığı olması gerekiyor: kural + **çalışan örnek** bir arada.

### 11. Sandvik (2024) — Red Dot, "teknoloji markası" kategorisi
→ https://www.home.sandvik/en/news-and-media/news/2024/09/sandvik-new-brand-identity-wins-the-red-dot-award/

**Hamle:** Logo **1962 Sandvik logosundan** ilham alıyor — mirasa saygı; yeni bir sembol kurumsal amacın taşıyıcısı olarak tanıtıldı. Üç temel: proaktif ortaklıklar, ileri görüşlü çözümler, sürdürülebilir ilerleme.

**Sizin için:** "Yeni" değil "sürekli" görünmek, endüstriyel B2B'de daha yüksek güven sinyali. Tarih/arşiv referansı bir varyasyon ekseni olabilir.

---

## C.3 Makine / malzeme / ölçüm nasıl çekilir ve işlenir

Yukarıdaki referanslardan çıkan somut muamele repertuarı:

| Muamele | Ne zaman | Parametre |
|---|---|---|
| **Makro detay** (bıçak ağzı, sensör lensi, ayrıştırılmış granül) | ürün/hassasiyet iddiası | f/4–f/8, alan derinliği sığ, konu %60+ kare |
| **Geniş hol** (Gursky) | kapasite/ölçek iddiası | yükseltilmiş bakış, ufuk %38 hattında, tekrar + tek sapma |
| **Yalayan ışık (raking)** | doku/malzeme iddiası | tek yönlü, 12–18° geliş açısı, gölgeler sert |
| **Düşük anahtar** | gece vardiyası, süreklilik | siyah nokta 0.02, beyaz nokta 0.92, ana konu tek highlight |
| **Yüksek anahtar** | temizlik/hassasiyet/laboratuvar | siyah nokta 0.08'e kaldırılır, gölge yok |
| **Duotone** | seri tutarlılığı, stok görünümü kırma | 2 renk: shadow = `ink`, highlight = `accent` ya da `signal`; kontrast +25% |
| **Yüksek kontrast S/B** (Becher) | tipoloji/ızgara slaytı | renk hacim okumasını bozduğu için S/B; grain 0.04 |
| **Aşırı kırpma** | jenerik görüntüden kaçış | konu kare dışına 2 kenardan taşar |
| **Şematik overlay / annotasyon** | ölçüm, veri iddiası | tek çizgi kalınlığı seti, tek projeksiyon açısı, monospace etiket |
| **Blueprint / teknik çizim hibriti** | mühendislik güveni | fotoğrafın %40'ı çizime dönüşür, geçiş sert kesme |
| **Malzeme flat-lay** | hammadde/akım anlatısı | tepeden 90°, difüz ışık, ızgara yerleşim (Becher mantığı) |

Duotone'un teknik gerekçesi: yalnızca iki renkle çalıştığınız için kaynak fotoğrafta güçlü kontrast ve yapı olmalı, kontrastı yükseltmek en kritik adım; makro ve makine konularında dokuyu ve detayı öne çıkarmakta özellikle etkili.
→ https://www.adobe.com/creativecloud/photography/discover/duotone-effect.html
→ https://99designs.com/blog/trends/duotone-design/

---

## C.4 Stok fotoğraf görüntüsünden kaçınma — klişelerin adı

Genel klişe literatürü (sahte gülümseme, mankene benzeyen pozlar, abartılı jestler, sahnelenmiş "gerçeklik") sanayi görselliğinde şu spesifik biçimlerde ortaya çıkıyor:
→ https://boagworld.com/design/stock-photography/
→ https://www.downwithdesign.com/inspiration/10-biggest-stock-photography-cliches/
→ https://www.format.com/magazine/resources/photography/authentic-stock-photos-creatives
→ https://www.databirdjournal.com/posts/beyond-the-cliche-how-to-avoid-overused-stock-photos-in-your-marketing-materials

**Yasaklı liste (endüstriyel B2B'ye özgü):**
1. Baret + tablet + makineyi işaret eden iki kişi, kameraya dönük gülümseme
2. Bulanık CNC/robot kolu önünde odakta gülümseyen operatör
3. Mavi tonlamalı "dijital dönüşüm" HUD overlay'i — parlayan altıgenler, devre şeması, IoT ikonları, bağlantı çizgileri
4. Dişli çark + devre kartı kolajı
5. Kıvılcım/kaynak ışığına karşı işçi silüeti
6. Anonim tesisin drone çekimi, altın saat ışığı, lens flare
7. El sıkışma, ekip "high five", cam toplantı odası
8. "Sürdürülebilirlik" için yeşil yaprak + fabrika bacası kolajı

**Alternatifler — hangisi neyin yerine geçer:**

| Klişe | Yerine |
|---|---|
| Baretli işaret eden ikili | Ellerin makro çekimi: kalibrasyon vidasını çeviren tek el, yalayan ışık, yüz yok |
| HUD/altıgen overlay | Gerçek arayüz ekran görüntüsünün aşırı kırpımı + monospace annotasyon |
| Drone tesis çekimi | Becher tipolojisi: 4 makine, aynı cephe, aynı ölçek, ızgara |
| Kıvılcım silüeti | Duotone: shadow=ink, highlight=signal turuncu; %100 grafik, %0 dram |
| Yeşil yaprak kolajı | Ayrıştırılmış akımın flat-lay'i — PET, alüminyum, HDPE ayrı ayrı, tepeden, ölçüm etiketli |
| Stok yüz | Grain 0.05–0.08 + aşırı kırpma + annotasyon katmanı; "belge" hissi verir, "reklam" değil |

**Tek cümlelik kural:** Bir kare stok fotoğrafa benziyorsa, çözüm başka bir fotoğraf bulmak değil — **kırpmayı sertleştirmek, tonlamayı ikiye indirmek ve üzerine ölçüm koymak**.

---

# Uygulama özeti — mühendis için

1. **Şablon kataloğuna 5 eksen alanı ekleyin:** `yuzey` (kagit|beton|celik|cam), `isik` (high-key|low-key|raking|flat), `olcek` (makro|orta|genis|tam-kanama), `renk-rolu` (ink-on-paper|blue-field|signal-led|mono), `yogunluk` (seyrek|orta|yogun). 4×4×4×4×3 = 768 kombinasyon; 10 şablona 10 farklı, açıkça seçilmiş kombinasyon atayın.
2. **Değişmezleri kodda kilitleyin:** grid modülü, tip ölçeği oranı, kenar boşluğu, künye konumu, görsel maskesi (TOMRA dairesi mantığı), 7 renk rolü.
3. **Renk token'larını B.2'deki daraltılmış rampadan üretin**, sabit chroma'dan değil — sabit chroma 12 basamağın 5'ini kırpıyor.
4. **Kontrast kapısı ekleyin:** `bg/ink ≥ 12`, `bg/muted ≥ 4.0`, `bg/accent ≥ 4.5` (gövde metni için) veya `≥ 3.0` (≥24px bold için). Marka mavisi `#3577f9` üzerine beyaz metin (4.07) reddedilmeli.
5. **Sinyal renkleri ISO 3864 / RAL'den gelsin** — icat edilmesin.
6. **Görsel brief prompt'una Becher sözleşmesini yazın:** cephe, göz hizası, perspektif bozulması yok, difüz ışık, tutarlı görünür ölçek. Süreklilik böyle kurulur, filtreyle değil.

---

## Tüm kaynaklar

**Renk / OKLCH:** [Evil Martians — OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) · [Evil Martians — OKLCH ekosistemi](https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools) · [oklch.com](https://oklch.com/) · [oklch.fyi](https://oklch.fyi/) · [W3C CSS Color 4 — Gamut Mapping](https://www.w3.org/TR/css-color-4/#gamut-mapping) · [culori API](https://culorijs.org/api/#gamut-mapping) · [Radix — Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) · [Radix — Composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) · [Refactoring UI — Building Your Color Palette](https://www.refactoringui.com/previews/building-your-color-palette) · [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) · [IxDF — Color Harmony](https://www.interaction-design.org/literature/topics/color-harmony) · [ISO 3864](https://handwiki.org/wiki/ISO_3864) · [Kollmorgen — Safety Colors](https://www.kollmorgen.com/en-us/developer-network/safety-colors) · [Adobe — duotone](https://www.adobe.com/creativecloud/photography/discover/duotone-effect.html) · [99designs — duotone](https://99designs.com/blog/trends/duotone-design/)

**Sistem / varyasyon:** [Eye — Penguin crime (Marber grid)](https://www.eyemagazine.com/feature/article/penguin-crime-text-in-full) · [Design Museum — Penguin Books](https://designmuseum.org/penguin-books) · [Pentagram — MIT Media Lab](https://www.pentagram.com/work/mit-media-lab) · [Pentagram — Arup](https://www.pentagram.com/work/arup) · [Eye — ECM sleeves](https://eyemagazine.com/feature/article/think-of-your-ears-as-eyes) · [Wikipedia — Blue Note album covers](https://en.wikipedia.org/wiki/Album_covers_of_Blue_Note_Records) · [Karlssonwilker — Bloomberg Businessweek](https://karlssonwilker.com/case-study/bloomberg-businessweek) · [It's Nice That — Businessweek redesign](https://www.itsnicethat.com/news/bloomberg-businessweek-redesign-rob-vargas-creative-director-160617) · [Commercial Type — Businessweek](https://commercialtype.com/custom/bloomberg_businessweek) · [Field Notes — Autumn Trilogy](https://fieldnotesbrand.com/products/autumn-trilogy) · [Wikipedia — Field Notes](https://en.wikipedia.org/wiki/Field_Notes) · [SOCKS — Müller-Brockmann Musica Viva](https://socks-studio.com/2016/11/30/joseph-muller-brockmann-musica-viva-posters-for-the-zurich-tonhalle/) · [V&A — Musica Viva](https://collections.vam.ac.uk/item/O110243/musica-viva-poster-josef-muller-brockmann/) · [Vitsœ — Rams'ın on ilkesi](https://www.vitsoe.com/us/about/good-design) · [TBI/Frontify — esnek sistemler](https://the-brandidentity.com/insight/itll-flex-but-will-it-break-with-frontify-we-explore-how-to-build-foolproof-flexible-systems) · [Umicore — Variations](https://brand.umicore.com/en/umicore-brand/variations/)

**Endüstriyel görsel dil:** [Solidarity — One TOMRA](https://solidarityofunbridledlabour.com/projects/one-tomra/) · [TOMRA](https://www.tomra.com/) · [TOMRA Recycling](https://www.tomra.com/waste-metal-recycling) · [Snøhetta — Hydro](https://www.snohetta.com/projects/hydro) · [Snøhetta (arşiv) — Hydro](https://old.snohetta.com/projects/400-new-visual-identity-for-hydro) · [Brand New — Hydro](https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_hydro_by_snohetta.php) · [Hydro — Brand colors](https://www.hydro.com/en/global/media/brand-center/core-elements/brand-colors/) · [Hydro — Typography](https://www.hydro.com/en/global/media/brand-center/core-elements/typography/) · [Wikipedia — Bernd & Hilla Becher](https://en.wikipedia.org/wiki/Bernd_and_Hilla_Becher) · [Tate — Bechers](https://www.tate.org.uk/art/artists/bernd-becher-and-hilla-becher-718) · [Burtynsky — Statement](https://www.edwardburtynsky.com/about/statement) · [Burtynsky — China](https://www.edwardburtynsky.com/projects/photographs/china) · [Wikipedia — Andreas Gursky](https://en.wikipedia.org/wiki/Andreas_Gursky) · [TBI — Brass Hands / Helix-DB](https://the-brandidentity.com/project/brass-hands-frames-helix-dbs-ai-infrastructure-as-industrial-machinery) · [TBI — Alek Blik / Sage Geosystems](https://the-brandidentity.com/project/alek-blik-transforms-an-energy-start-up-into-an-industrial-powerhouse-brand) · [TBI — Studio FAX / TMPL](https://the-brandidentity.com/project/studio-fax-develops-industrial-identity-system-london-based-design-studio-tmpl) · [Brand New — thyssenkrupp](https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_thyssenkrupp_done_in_house.php) · [Red Dot — thyssenkrupp brandfactory](https://www.red-dot.org/project/thyssenkrupp-brandfactory-14810) · [Sandvik — Red Dot 2024](https://www.home.sandvik/en/news-and-media/news/2024/09/sandvik-new-brand-identity-wins-the-red-dot-award/) · [Sesotec](https://www.sesotec.com/emea/en) · [Redwood Materials](https://www.redwoodmaterials.com/) · [Hexagon](https://www.hexagon.com/) · [TRUMPF](https://www.trumpf.com/en_INT/) · [Brand New — endüstriyel etiket arşivi](https://www.underconsideration.com/brandnew/archives/tag/industrial)

**Stok klişeleri:** [Boagworld](https://boagworld.com/design/stock-photography/) · [Down With Design](https://www.downwithdesign.com/inspiration/10-biggest-stock-photography-cliches/) · [Format](https://www.format.com/magazine/resources/photography/authentic-stock-photos-creatives) · [Databird](https://www.databirdjournal.com/posts/beyond-the-cliche-how-to-avoid-overused-stock-photos-in-your-marketing-materials)







AŞAMA 2 — REÇETE

0. ÖLÇÜLEN TANI (iddia değil, sayı)

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────┐
│              Bulgu              │                                                              Ölçüm                                                              │        Nerede        │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────┤
│ Zeminler gerçekten düz          │ On kapağın %67,7–%92,3'ü tek bir RGB değeri (±2). Medyan ~%85                                                                   │ derived/izgara/*.png │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────┤
│ On şablon, üç zemin             │ Modal renkler yalnız #040404 · #FAFAFA · #0E0E0E · #141414                                                                      │ aynı                 │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────┤
│ Gren hiç uygulanmadı            │ zeminCss greni yalnız degrade varsa ekliyor (degradeVar, zemin.ts:168). Degrade yasağı bugüne dek yürürlükteydi → on şablonun   │ zemin.ts:164-170     │
│                                 │ hiçbirinde gren YOK                                                                                                             │                      │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────┤
│ ustDoku ölü kod                 │ panorama.ts'te bağlı (1313, 1523-1531) ama ustDoku: hiçbir yerde set edilmiyor                                                  │ grep: 0 sonuç        │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────┤
│ Katalog zaten on ayrı konsept   │ "Editoryal — tam kaplama fotoğraf" → render: beyaz zemin + minik nesne. "Akan alan — dev hayalet rakam" → yok. "Memphis —       │ katalog.ts vs render │
│ tarif ediyor                    │ geometrik leke" → yok. "Kavis — kemer dizisi" → görünmez                                                                        │                      │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────┤
│ Akış taşıyıcısı fiilen yok      │ veri-hikayesi (köşegen) ve sahne (nesne) çalışıyor; akan-alan+kavis taşıyıcısı siyah üstüne siyah (görünmez); donen+memphis     │ panoramalar          │
│                                 │ yüzeyi tam kesim yerinde çevirip sürekliliği AKTİF olarak kırıyor                                                               │                      │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────┤
│ Elle çizilmiş "U" hâlâ          │ donen s4, memphis s6, sahne s4, dizin s4                                                                                        │ panoramalar          │
│ render'da                       │                                                                                                                                 │                      │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────┘

Şablonlar birbirine benzemiyor çünkü tembel — ortak iskelet şablonun kendi konseptini eziyor. Her şablon: — ETİKET + tek mavi kelimeli başlık + küçük gövde + künye şeridi. Katalog farkı yazmış, render'cı uygulamıyor.

---

0.1 ÖLÇÜLEN TEKNİK SABİTLER (reçetelerin dayanağı)

Bunları Chromium'da ve JPEG kodlayıcıda ölçtüm, kaynaktan almadım:

① Gren alfası sabitlenmezse zemin grileşiyor. Çıplak feTurbulence'ın alfa kanalı da gürültülü → ortalama luminansı +9 çekiyor (kara perde kaybı). <feFuncA type='discrete' tableValues='1'/> eklenince kayma +0,5'e düşüyor, sigma aynı kalıyor.

② baseFrequency ASLA tam sayı olmayacak. Ölçüm: 0.99→σ 4,10 · 1→σ 0,000 · 1.01→σ 4,11 · **2→σ 0,000**. Tam sayıda Perlin kafesi piksel ızgarasına oturuyor ve gren **sessizce tamamen ölüyor**. Mevcut kod 0.82` kullanıyor — güvenli, ama korumasız (R-85 sınıfı bir tuzak).

③ Gren genliğini opacity belirliyor, baseFrequency değil. Tüm tam-sayı-olmayan frekanslarda σ sabit ~4,10; frekans yalnız tane boyutunu değiştiriyor.

④ ⚠ overlay gren koyu zeminde JPEG'te YOK OLUYOR — bu, GREN_GUCU=26 kararını düzeltiyor.

σ, zemin luminansına göre (ölçüm):

┌────────────────┬──────┬──────┬──────┬──────┬───────┬───────┐
│     blend      │ L=8  │ L=16 │ L=32 │ L=64 │ L=128 │ L=230 │
├────────────────┼──────┼──────┼──────┼──────┼───────┼───────┤
│ soft-light .25 │ 0,70 │ 1,23 │ 1,94 │ 2,53 │ 2,62  │ 0,83  │
├────────────────┼──────┼──────┼──────┼──────┼───────┼───────┤
│ overlay .25    │ 0,51 │ 0,77 │ 1,46 │ 2,87 │ 5,72  │ 1,18  │
├────────────────┼──────┼──────┼──────┼──────┼───────┼───────┤
│ normal .12     │ 2,87 │ 2,87 │ 2,87 │ 2,87 │ 2,87  │ 2,87  │
└────────────────┴──────┴──────┴──────┴──────┴───────┴───────┘

Ve JPEG eşiği (1080×1440, düşük kontrastlı koyu degrade, düz plato oranı):

┌─────────┬───────┬───────┬───────┬───────┐
│         │ q=75  │ q=82  │ q=90  │ q=95  │
├─────────┼───────┼───────┼───────┼───────┤
│ grensiz │ %95,1 │ %94,9 │ %96,2 │ %95,9 │
├─────────┼───────┼───────┼───────┼───────┤
│ σ=0,5   │ —     │ %93,8 │ %68,9 │ %43,6 │
├─────────┼───────┼───────┼───────┼───────┤
│ σ=1,5   │ —     │ %31,5 │ %27,9 │ %21,3 │
├─────────┼───────┼───────┼───────┼───────┤
│ σ=2,0   │ —     │ %22,7 │ %20,1 │ %16,7 │
└─────────┴───────┴───────┴───────┴───────┘

İki sonuç:
- JPEG kalitesini yükseltmek bantlanmayı ÇÖZMÜYOR (q75→q95: %95,1→%95,9, +%28 dosya, sıfır kazanç). Bant 8-bit kaynakta, kodlayıcıda değil.
- σ<1,0 gren JPEG tarafından siliniyor. Depodaki overlay+26 reçetesi #040404 zemininde σ≈0,5 üretir → q82'de tamamen yok olur. Depodaki ölçüm PNG alanında sütun sayarak yapılmış, kodlayıcıdan geçirilmemiş. Kayıt yanlış değil, eksik.

⑤ Doğru kural: gren opaklığı yüzey luminansıyla TERS ölçekler.

┌─────────────────┬────────────┬─────────┬──────┬─────────────┐
│     Yüzey L     │   blend    │ opacity │  σ   │ lum kayması │
├─────────────────┼────────────┼─────────┼──────┼─────────────┤
│ < 20 (mürekkep) │ soft-light │ 0,70    │ 1,90 │ +0,7        │
├─────────────────┼────────────┼─────────┼──────┼─────────────┤
│ 20–60 (koyu)    │ soft-light │ 0,40    │ 2,60 │ +0,8        │
├─────────────────┼────────────┼─────────┼──────┼─────────────┤
│ 60–140 (orta)   │ soft-light │ 0,25    │ 2,06 │ +0,5        │
├─────────────────┼────────────┼─────────┼──────┼─────────────┤
│ > 180 (kâğıt)   │ soft-light │ 0,35    │ ~2,0 │ +0,7        │
└─────────────────┴────────────┴─────────┴──────┴─────────────┘

⑥ Kenar bozmada Türkçe ilk kırılan. feDisplacementMap bf=0.05 numOctaves=3: scale≤3-4 → letterpress kenarı, Ö Ç Ü ı Ş Ğ İ sağlam. scale≥8 → aksanlar eriyor, Latin harfler hâlâ iyi görünüyor. Latin-only göz testi bunu geçirir, Türkçe bozuk gider. Test dizesi zorunlu: ÖLÇÜM HATTI ŞĞİ.

⑦ Halftone saf CSS'te çalışıyor (Chromium'da doğrulandı): nokta ızgarası + background-blend-mode: overlay + filter: contrast(N). contrast(8)→yumuşak (139 seviye), contrast(40)→gazete (22 seviye). Adım 4–12 px = tram sıklığı. Piksellerin %97'si ikili — gerçek halftone davranışı.

⑧ Fırçalanmış metal = anizotropik frekans. baseFrequency='0.004 0.9' → yatay/dikey doku oranı 0,02 (ölçüldü). Tek değerle bu imkânsız.

⑨ Gren panorama ölçeğinde bozulmuyor. 6480×1440'ta σ uçtan uca 1,55–2,05 (sapma degradenin kendisinden, filtre bozulmasından değil). Chromium sessizce düşürmüyor.

---

0.2 FONT — ÖLÇÜLEREK ELENDİ

Depo Inter'i latn/TRK yokluğundan elemişti. Aynı sınavı 70 adaya uyguladım (TTF indirildi, cmap 15 Türkçe kod noktası, Ş(U+015E)≠Ș(U+0218), GSUB'ta latn/TRK). Denetleyici depodaki dört aileyi ve Inter'i birebir doğruladı.

⚠ IBM Plex ailesinin TAMAMI eleniyor — Sans, Mono, Serif, Sans Condensed: latn/TRK yok. Upstream IBM deposundan da doğrulandı, Google paketleme sorunu değil. Sanayi işi için en bariz tercih ve kullanılamaz.

Sert eleme (ğ Ğ İ ş Ş glifi YOK — tofu basar): Stardos Stencil, Allerta Stencil, Share Tech Mono.

latn/TRK yok (eler): IBM Plex ×4, Fraunces, Newsreader, Roboto Slab, Space Mono, DM Mono, Archivo Black, Teko, Khand, Anonymous Pro.

GEÇEN ve önerilen çekirdek altı (hepsi 15/15 · Ş≠Ș · latn/TRK VAR · locl VAR · OFL):

┌──────────────────┬──────────────────────────┬─────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│       Aile       │  Eksenler (binary'den    │          Rolü           │                                                  Neden bu iş                                                   │
│                  │       doğrulandı)        │                         │                                                                                                                │
├──────────────────┼──────────────────────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Archivo          │ wdth 62–125 · wght       │ Evrensel gövde+etiket   │ Depo genişlik eksenini bilinçli bırakmıştı (D-317: sistemde yok). Archivo'da GERÇEK wdth var ve Türkçe tam.    │
│                  │ 100–900                  │                         │ Jakarta+Montserrat'ın ikisini tek ailede kapatıyor                                                             │
├──────────────────┼──────────────────────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Big Shoulders    │ opsz 10–72 · wght        │ Sanayi display, hayalet │ Chicago belediye yüzü; demiryolu işaretlerinden türetilmiş. Gerçek sanayi soyağacı, "web fontu" değil          │
│                  │ 100–900                  │  rakam                  │                                                                                                                │
├──────────────────┼──────────────────────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Big Shoulders    │ opsz 10–72 · wght        │ Şablon/stencil aksan    │ Aynı ailenin stencil kesimi — çeşitlilik marka dışına çıkmadan                                                 │
│ Stencil          │ 100–900                  │                         │                                                                                                                │
├──────────────────┼──────────────────────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Martian Mono     │ wdth 75–112,5 · wght     │ Veri, ölçü, panel       │ JetBrains'in yerine: genişlik ekseniyle dar sütunda sıkışabiliyor                                              │
│                  │ 100–800                  │                         │                                                                                                                │
├──────────────────┼──────────────────────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Literata         │ opsz 7–72 · wght 200–900 │ Editoryal serif         │ Source Serif'in yerine; opsz başlık/gövde ayrımını tek dosyada verir                                           │
├──────────────────┼──────────────────────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Young Serif      │ statik                   │ Anıtsal display serif   │ alinti için; ağır, taş kesimi karakteri                                                                        │
└──────────────────┴──────────────────────────┴─────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Yedekler (geçti, gerekirse): Instrument Serif, Schibsted Grotesk, Anybody (wdth 50–150), Space Grotesk, Zilla Slab, Azeret Mono, Saira Condensed, Mona Sans (wdth 75–125, Google dışı, OFL).

---

0.3 PALET — GAMUT DENETİMİNDEN GEÇMİŞ

Mevcut tokenlar aslında doğru kurulmuş: mavi rampası cusp'ı takip ediyor (her L'de maks kromanın %94–95'i). Bir uyarı: --ramp-signal-warn maksın %99'unda — yuvarlama/renk yönetimi farkında kırpılır, oklch(0.72 0.140 75)'e çekin.

Sorun kromada değil repertuarda: mavi + nötr + üç sinyal. Nötrler saf 0-kroma (marka-ink) — sıcaklık taşımıyor.

⚠ Sabit kroma ile rampa üretmeyin. h=262'de maks kroma: L=0,15→0,112 · L=0,30→0,144 · L=0,50→0,233 · L=0,80→0,101 · L=0,90→0,048. C=0.206'yı L rampasında sabit tutarsanız 0,50–0,60 dışındaki her ton sessizce kırpılır ve rengi kayar (L=0,15'te mora düşüyor: #0F0061).

Beş palet — hepsi hesaplandı, kontrast oranları doğrulandı:

/* P1 MÜREKKEP+MAVİ — mavi ÖZNE */
--m-taban: oklch(0.160 0.101 262);  /* #000337 */
--m-yuzey: oklch(0.240 0.102 262);  /* #021A4E */
--m-mavi : oklch(0.600 0.185 262);  /* #3E79ED */
--m-murekkep: oklch(0.930 0.029 262); /* #DEE8FC */
/* #000337/#DEE8FC = 15,95:1 · #000337/#3577F9 = 4,83:1 (gövde OK) */

/* P2 ÇELİK+BAKIR — mavi yalnız KILCAL ÇİZGİ */
--c-taban: oklch(0.200 0.010 250);  /* #13161A */
--c-yuzey: oklch(0.280 0.012 250);  /* #25292F */
--c-bakir: oklch(0.580 0.146 45);   /* #BE5822 */
--c-murekkep: oklch(0.880 0.007 250); /* #D4D8DC */

/* P3 KÂĞIT+OKSİT — mavi YOK */
--k-taban: oklch(0.950 0.004 75);   /* #F0EEEB  sıcak kâğıt, #FAFAFA değil */
--k-yuzey: oklch(0.880 0.006 75);   /* #DAD7D3 */
--k-oksit: oklch(0.520 0.174 32);   /* #B8321B */
--k-murekkep: oklch(0.200 0.007 75); /* #181613 */
/* #EAE7E3/#13161A = 14,72:1 */

/* P4 BETON+AMBER */
--b-taban: oklch(0.380 0.009 75);   /* #45423D */
--b-yuzey: oklch(0.480 0.010 75);   /* #615D57 */
--b-amber: oklch(0.780 0.140 80);   /* #E7AC39 */
--b-murekkep: oklch(0.140 0.006 75); /* #0B0907 */
/* koyu zemin/amber = 9,70:1 */

/* P5 GECE+MAGENTA — ölçüm aksanı */
--g-taban: oklch(0.140 0.008 250);  /* #07090C */
--g-yuzey: oklch(0.200 0.010 250);  /* #13161A */
--g-magenta: oklch(0.600 0.221 350); /* #D82E92 */
--g-mavi-kil: oklch(0.530 0.220 262); /* kılcal çizgi */

Nötr ısı kuralı: nötr "sıfır kroma" DEĞİLDİR. Kâğıt tarafı h=75 · C 0,004–0,010 (sıcak); çelik tarafı h=250 · C 0,008–0,014 (soğuk). Saf oklch(L 0 0) ekrandaki en ölü yüzeydir — mevcut marka-ink rampası tam olarak bu.

---

A. ON ŞABLON, ON TEMA

Beş eksen: yüzey · ışık · ölçek · renk rolü · yoğunluk. Sabit tutulan: ızgara, güvenli alan (R-88), künye şeridi geometrisi, gövde ailesi (Archivo). Değişen: aşağıdaki her sütun.

┌─────┬───────────────┬─────────┬──────────────────────────┬──────────────────────┬────────────────────────┬──────────────────────┬─────────────┬────────────────────────────────────────┐
│  #  │    Şablon     │  TEMA   │          Yüzey           │         Işık         │         Ölçek          │      Renk rolü       │  Yoğunluk   │            Akışı NE taşıyor            │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 1   │ akan-alan     │ DÖKÜM   │ Dökme mürekkep alanı     │ Soldan alçak sıyırma │ Dev hayalet rakam      │ P1 · mavi=ÖZNE       │ Seyrek      │ İki alanın eğri sınırı — 6 slayt       │
│     │               │         │                          │                      │ (1400 px)              │                      │             │ boyunca yükselir                       │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 2   │ veri-hikayesi │ EĞRİ    │ Mavi kopya ızgara        │ Düz, gölgesiz        │ Panel yoğun, tipografi │ P5 · magenta=BUGÜN   │ Yoğun       │ Yükselen köşegen — ölçünün ilerlemesi  │
│     │               │         │ (blueprint)              │                      │  küçük                 │ noktası              │             │                                        │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 3   │ sahne         │ VİTRİN  │ Derin mürekkep + temas   │ Tek sert key,        │ Nesne kahraman         │ P1 · neredeyse tek   │ Çok seyrek  │ Tek nesne — döner, büyür, kesimi aşar  │
│     │               │         │ zemini                   │ sol-üst 35°          │ (kadrajın %70'i)       │ renk                 │             │                                        │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 4   │ editoryal     │ KÂĞIT   │ Sıcak kâğıt, gerçek doku │ Yumuşak difüz +      │ Minik tipografi ↔ tam  │ P3 · mavi YOK, oksit │ Aşırı       │ Tam kaplama fotoğraf kaydırması        │
│     │               │         │                          │ vinyet               │ kaplama foto           │                      │ boşluk      │                                        │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 5   │ donen         │ DEVİR   │ Alternan — ama kesimde   │ Dönen ışık yönü      │ Daire maske büyüyor    │ P1↔P3 geçişli        │ Orta        │ Büyüyen daire + yüzeyin slayt          │
│     │               │         │ değil                    │                      │                        │                      │             │ ORTASINDA dönmesi                      │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 6   │ alinti        │ MERMER  │ Açık taş, ince gren      │ Sağ-üstten sıyırma,  │ Dev serif (240 px)     │ P3 · mavi=kılcal     │ Anıtsal     │ Sözün kendi satırı kesimde kırılır     │
│     │               │         │                          │ uzun gölge           │                        │                      │ seyrek      │                                        │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 7   │ memphis       │ TEZGÂH  │ Parlak kâğıt + halftone  │ Düz, gölgesiz        │ Değişken geometrik     │ P3+P4 · üç renk riso │ Kalabalık   │ Geometrik lekeler — yarısı bu slaytta, │
│     │               │         │ bloklar                  │                      │ lekeler                │                      │             │  yarısı öteki                          │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 8   │ kavis         │ KEMER   │ Beton                    │ Alttan (kemer karnı) │ Dar+ağır tipografi     │ P4 · amber           │ Ağır        │ Kemer dizisi — periyot 1,5 slayt, her  │
│     │               │         │                          │                      │                        │                      │             │ kesim kemer ORTASINA düşer             │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 9   │ karsilastirma │ EŞİK    │ Bölünmüş: mat ↔ parlak   │ Sert bölünme çizgisi │ Panel çifti            │ P2 · oksit=ÖNCE,     │ Orta        │ Tek yönlü alan süpürmesi               │
│     │               │         │                          │                      │                        │ mavi=SONRA           │             │                                        │
├─────┼───────────────┼─────────┼──────────────────────────┼──────────────────────┼────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 10  │ dizin         │ FİHRİST │ Sıcak defter/milimetrik  │ Düz                  │ Dev hayalet rakam +    │ P2 · bakır           │ Yoğun liste │ Elle çizilmiş oklar — bu slaytta       │
│     │               │         │                          │                      │ mono liste             │                      │             │ başlar, ötekinde iner                  │
└─────┴───────────────┴─────────┴──────────────────────────┴──────────────────────┴────────────────────────┴──────────────────────┴─────────────┴────────────────────────────────────────┘

Ailelik neyden okunuyor: aynı ızgara, aynı güvenli alan, aynı gövde ailesi (Archivo), aynı künye geometrisi, aynı gren yasası. Farklılık yüzey·ışık·ölçek·renk·yoğunlukta — kompozisyon sözleşmesinde değil.

---

B. ŞABLON ŞABLON REÇETE

Ortak kısaltma: GREN(L) = §0.1⑤ tablosundaki opaklık.

---

1 · akan-alan — DÖKÜM

Zemin. İki alan, aralarında eğri sınır. Üst alan --m-taban oklch(0.160 0.101 262), alt alan --m-yuzey oklch(0.240 0.102 262). İkisi arasındaki kontrast ≥ 1,6:1 olmak zorunda — bugün #040404 vs #0A0A0A, yani görünmez; taşıyıcı bu yüzden iş yapmıyor.
background:
  url(gren) ,
  radial-gradient(160% 120% at 18% -10%, oklch(0.30 0.11 262) 0%, transparent 62%),
  var(--alan-egri) ,
  var(--m-taban);
background-blend-mode: soft-light, screen, normal, normal;
/* gren: soft-light, opacity .70  (L≈16) */
Üstüne vinyet: radial-gradient(120% 95% at 50% 42%, transparent 45%, rgb(0 0 0 / .38) 100%).

Tipografi. Başlık Archivo wght 700 wdth 95 96 px / 0,96 satır / -1.5% harf aralığı. Gövde Archivo wght 400 40 px / 1,45. Etiket Archivo wdth 75 wght 600 20 px +8% versal.
Hayalet rakam: Big Shoulders wght 100 opsz 72, 1400 px, color: oklch(0.30 0.11 262), opacity .5, metnin ARKASINDA (z-index:0), alt kenardan taşar.

Akış taşıyıcısı. Eğri sınır: 01de y=%78'den başlar, 06da y=%46'ya çıkar — monoton yükselen, sinüs değil. Her kesimde eğrinin y farkı ≥ 40 px olsun ki göz devamı yakalasın.
Kesim yerleri. Hayalet rakam kesimi aşacak şekilde konumlanır (rakamın %35'i bu slaytta, %65'i sonrakinde).
Görsel brief'i. Görsel YOK — bu şablon saf tipografi + alan. (Bugün de öyle; doğru olan bu.)
Palet. P1.

---

2 · veri-hikayesi — EĞRİ

Zemin. Mavi kopya ızgarası — düz renk değil.
background:
  url(gren),
  repeating-linear-gradient(0deg, oklch(0.30 0.02 250 / .5) 0 1px, transparent 1px 60px),
  repeating-linear-gradient(90deg, oklch(0.30 0.02 250 / .5) 0 1px, transparent 1px 60px),
  radial-gradient(140% 100% at 75% 0%, oklch(0.26 0.03 250) 0%, transparent 70%),
  var(--g-taban);
background-blend-mode: soft-light, normal, normal, screen, normal;
/* gren: soft-light, opacity .70 (L≈14) */
Izgara 60 px = ölçü ızgarasının kendisi; 12 px'lik ince alt ızgara eklenmeyecek (JPEG'te moire yapar).

Tipografi. Başlık Archivo wght 600 76 px. Panel etiketleri ve tüm sayılar Martian Mono wdth 87.5 wght 500 22 px +4%. Büyük sayılar (48%) Martian Mono wght 700 92 px.
Akış taşıyıcısı. Yükselen köşegen — kalınlaştır: 2 px → 6 px, ve rengi --g-magenta yap. Bugün mavi ve 2 px; markanın geri kalanıyla karışıyor. Magenta olunca "ölçülen eğri" kimliği kazanır.
⚠ Köşegen panellerin ARKASINDAN geçecek (z-index: 0, paneller z-index: 2) ve panelin çevresinde 20 px'lik maske boşluğu bırakacak:
.panel { --pay: 20px;
  mask: radial-gradient(circle, #000 0 0) /* panel kutusu */; }
.kosegen { mask-image: url(#panel-delikleri); } /* panel dikdörtgenleri çıkarılır */
Kesim yerleri. Köşegen her kesimi farklı yükseklikte geçer (01/02: y=%62, 05/06: y=%28) — kesimde y farkı sabit ~%7.
Görsel brief'i. Fotoğraf yok; veri panelleri. Paneller §C.4'teki "kutu değil yüzey" işleminden geçer.
Palet. P5.

---

3 · sahne — VİTRİN

Zemin. Derin mürekkep + temas zemini. Nesne uçmayacak.
background:
  url(gren),
  radial-gradient(90% 55% at 50% 96%, oklch(0.26 0.01 250) 0%, transparent 70%), /* zemin düzlemi */
  radial-gradient(120% 90% at 22% 8%, oklch(0.24 0.012 250) 0%, transparent 65%), /* key ışık */
  var(--g-yuzey);
background-blend-mode: soft-light, screen, screen, normal;
/* gren: soft-light, opacity .70 */
Tipografi. Başlık Literata opsz 60 wght 400 84 px (editoryal, zarif — nesnenin karşısında sessiz durur). Gövde Archivo 38 px. Alt yazı Martian Mono 20 px.
Akış taşıyıcısı. Tek nesne. Slayt 1'de kadrajın %70'i, sağa doğru küçülerek 4'te %30. Her kesimde nesnenin bir parçası iki slaytta birden. Nesne 01→04 arası 8° döner (aynı fotoğrafın farklı açısı istenir, aynısı değil).
Kesim yerleri. Nesne gövdesi kesimi dik keser — kesimde nesnenin en geniş yeri olsun, en ince yeri değil.
Görsel brief'i. "Tek bir sanayi ölçüm cihazı, üç çeyrek açı, düz siyah zemin, tek sert key ışık sol-üst 35°, sert gölge, arka plan silinebilir olacak. Makro değil orta plan; cihazın kadranı okunaklı. Stok kurgu YOK — atölye tezgâhında duran, kullanılmış, üstünde iz olan bir cihaz."
Zorunlu işlemler: temas-golgesi (yeni açıldı — bu şablonun can damarı), tema-uyum, keskinlik.
Palet. P1, neredeyse tek renk; mavi yalnız bir kelimede.

---

4 · editoryal — KÂĞIT

Katalog "tam kaplama fotoğraf" diyor; render beyaz zemine minik nesne koyuyor. Reçete katalogla hizalanıyor.

Zemin. Gerçek kâğıt — #FAFAFA değil.
background:
  url(gren-ince),          /* baseFrequency 1.2, numOctaves 4 */
  url(gren-uzundalga),     /* baseFrequency 0.02, numOctaves 5 — leke */
  var(--k-taban);          /* oklch(0.950 0.004 75) = #F0EEEB */
background-size: 256px 256px, 700px 700px, 100% 100%;
background-blend-mode: soft-light, soft-light, normal;
/* gren: opacity .35 (L≈240) */
Doğrulandı: bu reçete σ=4,06 sıcak kâğıt dokusu veriyor, yönsüz (yatay/dikey oranı 0,98).
Üstüne çok hafif vinyet: radial-gradient(130% 110% at 50% 45%, transparent 55%, oklch(0.72 0.008 75 / .22) 100%).

Tipografi. Başlık Literata opsz 72 wght 300 56 px (minik — tema bu). Gövde Literata opsz 12 wght 400 34 px. Etiket Archivo wdth 70 wght 700 18 px +12% versal.
Akış taşıyıcısı. Tam kaplama fotoğraf dört slaydı kat eder — 4320×1440 tek fotoğraf, dilimlenir. Tipografi fotoğrafın üstünde, mix-blend-mode YOK (Türkçe okunurluğu riske atmaz), bunun yerine fotoğrafın metin bölgesi §C.5 "yerel karartma" ile hazırlanır.
Kesim yerleri. Fotoğrafın kendisi taşıyıcı — kesim yeri serbest, ama kesime yüz/kadran gibi tanınan bir öge denk gelmeyecek.
Görsel brief'i. "Tek panoramik kare: üretim hattının yan görünüşü, 4:1'e yakın çok geniş kadraj. Yandan gelen pencere ışığı, toz zerreleri görünür. Yüksek anahtarlı değil — orta ton. İnsan varsa yalnız el/kol, yüz yok (R-27 · Md. 27/12). Görüntünün sol %30'u sakin (tipografi oraya oturacak)."
Palet. P3 — mavi hiç yok. Tek aksan oksit #B8321B, yalnız etiket çizgisinde. Bu şablon paletten çıkışın kanıtı olacak.

---

5 · donen — DEVİR

En kritik düzeltme: bugün yüzey tam kesim yerinde dönüyor (s1 koyu, s2 açık) — bu sürekliliği yok ediyor, seamless'ın tersi.

Zemin. Yüzey slayt ortasında döner, kesimde değil.
/* Panorama boyunca tek yatay degrade — geçişler slayt MERKEZLERİNDE */
background:
  url(gren),
  linear-gradient(90deg,
    var(--m-taban)  0%,   var(--m-taban)  12%,
    var(--k-taban) 38%,   var(--k-taban) 62%,
    var(--m-taban) 88%,   var(--m-taban) 100%);
background-blend-mode: soft-light, normal;
Geçiş bölgeleri 12–38% ve 62–88% arası, yani kesim çizgileri (25%, 50%, 75%) hep bir geçişin ORTASINDA — kaydırırken renk akıyor, çarpmıyor.
⚠ Gren opaklığı bu şablonda konuma bağlı: koyu uçta 0,70, açık uçta 0,35. Tek değer kullanılamaz (§0.1⑤).

Tipografi. Başlık Schibsted Grotesk wght 700 80 px. Gövde Archivo 38 px. Rakam Big Shoulders wght 200 opsz 72 520 px, hayalet.
Akış taşıyıcısı. Büyüyen daire maske. Çap: s1 380 px → s4 900 px, merkezi her slaytta 90 px sağa kayar. Daire kesimi aşar.
Görsel brief'i. Aynı ürün, dört farklı ölçek; daire maske içinde. duotone işlemi zemin rengine göre (--m-taban tarafında mavi duotone, --k-taban tarafında oksit duotone).
Palet. P1 ↔ P3 geçişli.

---

6 · alinti — MERMER

Zemin. Açık taş — kâğıttan farkı: daha büyük tane + uzun gölge.
background:
  url(gren),                /* bf 0.9, oct 4 */
  url(gren-bulut),          /* bf 0.012, oct 6 — damar */
  linear-gradient(165deg, oklch(0.96 0.004 75) 0%, oklch(0.90 0.006 75) 100%),
  var(--k-taban);
background-blend-mode: soft-light, multiply, normal, normal;
/* gren: opacity .35 */
Tipografi. Young Serif, tek ağırlık, 240 px, satır 0,92, -2%. Bu şablonun tamamı tek tipografik jest. Atıf Archivo wdth 75 wght 500 22 px versal.
Akış taşıyıcısı. İki katmanlı: (a) sözün kendi satırları — söz üç slayda cümle olarak bölünür, kesim bir kelimenin ortasına değil ama bir ibarenin ortasına gelir; (b) alttaki koyu kama, s1'de %88'den s3'te %64'e yükselir. Kama kenarı sert değil: 3 px'lik feDisplacementMap (bf 0.05, scale 3) ile taş kesimi kenarı.
Kesim yerleri. Kesimde daima bir kelime yarıda — bu şablonda kasıtlı ve tek "swipe magnet".
Görsel brief'i. Görsel yok.
Palet. P3, mavi yalnız 1 px'lik kılcal çizgide.

---

7 · memphis — TEZGÂH

Katalog "geometrik leke dili" diyor, render'da hiç şekil yok. Reçete şekilleri geri getiriyor.

Zemin. Parlak kâğıt + halftone bloklar (§0.1⑦ doğrulanmış reçetesi).
.halftone-blok {
  background-image:
    radial-gradient(circle at 50% 50%, #000 0 46%, #fff 54% 100%),
    var(--leke-degrade);
  background-size: 8px 8px, 100% 100%;
  background-blend-mode: overlay;
  filter: contrast(20) grayscale(1);   /* 20 → ~41 seviye, gazete tramı */
}
Taban --k-taban, gren soft-light .35.
Tipografi. Başlık Anybody wdth 125 wght 700 78 px (genişletilmiş, oyuncu). Gövde Archivo 36 px. Aksan Big Shoulders Stencil wght 500 28 px versal.
Akış taşıyıcısı. Geometrik lekeler kesimi paylaşır. Kural: her kesimde tam bir şekil, %40/%60 oranında iki slayda bölünmüş olacak. Şekiller: daire (halftone), çeyrek kemer (düz oksit), üç çizgili tarama (amber).
Kesim yerleri. Şeklin kesimi geçtiği yer şeklin en geniş yeri.
Görsel brief'i. Kesik özne, küçük (kadrajın %22'si), her slaytta farklı nesne — bugün altı kez aynı nesne var, filigran gibi duruyor.
Palet. P3 + P4 — üç mürekkep riso: oksit #B8321B, amber #E7AC39, mürekkep #181613. Mavi yok.

---

8 · kavis — KEMER

Zemin. Beton (ölçülmüş reçete, σ=14,9).
background:
  url(gren),               /* bf 0.9, oct 4 */
  url(gren-bulut),         /* bf 0.012, oct 6 */
  var(--b-yuzey);          /* oklch(0.480 0.010 75) */
background-size: 256px 256px, 900px 900px, 100%;
background-blend-mode: overlay, multiply, normal;
/* gren: soft-light .25  (L≈100) */
Tipografi. Katalog "dar ve ağır" diyor — bugün öyle değil. Big Shoulders wght 800 opsz 72 132 px, satır 0,88, -1%. Gövde Archivo wdth 88 wght 400 36 px.
Akış taşıyıcısı. Kemer dizisi. ⚠ Periyot = 1,5 slayt (1620 px), 1 slayt değil. Böylece kesim çizgileri kemer tepesine değil, sırayla karın–tepe–karın'a düşer ve göz her kesimde farklı bir kemer evresi görür. Kemer yüksekliği 520 px, rengi --b-taban, üstünde alttan gelen ışık: radial-gradient(60% 40% at 50% 100%, oklch(0.62 0.02 75 / .5), transparent 70%).
Kesim yerleri. Kemer eğrisi kesimi geçer; kemer ayağı asla kesime denk gelmez.
Görsel brief'i. İsteğe bağlı; varsa kemerin karnına oturur, temas gölgesiyle.
Palet. P4 — amber aksan.

---

9 · karsilastirma — EŞİK

Zemin. İki farklı YÜZEY, iki farklı renk değil — fark malzemede.
/* ÖNCE tarafı: mat, dokulu, soğuk */
.once { background: url(gren) , var(--c-yuzey);
        background-blend-mode: soft-light, normal; }  /* gren .40 */
/* SONRA tarafı: temiz, hafif parlak, ışık alan */
.sonra { background:
   url(gren),
   radial-gradient(100% 80% at 70% 20%, oklch(0.34 0.03 250) 0%, transparent 65%),
   var(--c-taban);
   background-blend-mode: soft-light, screen, normal; }  /* gren .70 */
Tipografi. Başlık Archivo wdth 70 wght 800 88 px (dar+ağır, karşıtlık için). Sayılar Martian Mono wght 700 96 px. Etiket Archivo wdth 75 wght 600 20 px.
Akış taşıyıcısı. Tek yönlü alan süpürmesi — sınır s1'de %92'den s4'te %18'e iner, hep aynı yönde. Sınır çizgisi 4 px --c-bakir.
⚠ Bugün bu köşegen 48% / 23% sayılarını kesiyor. Çözüm §C.5: taşıyıcı metnin arkasına alınır ve metin kutusunun 24 px dışına maskelenir.
Görsel brief'i. İki kare: aynı malzeme, önce kirli/karışık — sonra ayrışmış/temiz. Aynı ışık, aynı açı, aynı mesafe. Fark yalnız maddede olsun.
Palet. P2 — oksit=ÖNCE, mavi=SONRA. İki renk anlam taşır, süs değil.

---

10 · dizin — FİHRİST

Zemin. Sıcak milimetrik defter.
background:
  url(gren),
  repeating-linear-gradient(0deg, oklch(0.30 0.008 75 / .45) 0 1px, transparent 1px 48px),
  repeating-linear-gradient(90deg, oklch(0.30 0.008 75 / .30) 0 1px, transparent 1px 48px),
  var(--c-taban);
background-blend-mode: soft-light, normal, normal, normal;
/* gren: soft-light .70 */
Tipografi. Başlık Archivo wght 600 76 px. Liste Martian Mono wdth 87.5 wght 400 26 px, satır 1,7. Hayalet kelime Big Shoulders Stencil wght 400 380 px, opacity .16.
Akış taşıyıcısı. Elle çizilmiş oklar — perfect-freehand zaten bağımlılık (panorama.ts:33, kullanılıyor). Bugünkü sorun konturların rastgele yüzmesi. Kural: her ok bir maddeden başlar, kesimi geçer, sonraki maddenin numarasına iner. Ok kalınlığı size: 14, thinning: 0.6, streamline: 0.4. Renk --c-bakir.
Kesim yerleri. Ok kesimi 45–60° açıyla geçer; dik veya yatay geçmez (dik geçen çizgi kesim çizgisiyle karışır).
Görsel brief'i. Görsel yok ya da çok küçük.
Palet. P2.

---

C. ORTAK ALTYAPI (kod düzeyi)

C.1 Gren — tek doğru üretici

zemin.ts:120'yi değiştir:

export const grenKatmani = (guc: number): string => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>` +
    `<filter id='g' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' seed='7' stitchTiles='stitch'/>` +
    `<feColorMatrix type='saturate' values='0'/>` +
    // ⚠ ALFA SABİTLENİYOR: yoksa gren zemini +9 luminans griye çeker (ölçüldü).
    `<feComponentTransfer><feFuncA type='discrete' tableValues='1'/></feComponentTransfer>` +
    `</filter>` +
    `<rect width='180' height='180' filter='url(%23g)'/></svg>`
  return `url("data:image/svg+xml,${svg.replace(/#/g,'%23').replace(/"/g,"'")}")`
}
Opaklık artık SVG'de değil CSS'te (background katmanının kendi opaklığıyla), çünkü luminansa göre değişmek zorunda:

/** Gren opaklığı yüzey luminansıyla TERS ölçekler — ölçüldü (§0.1⑤). */
export const grenOpakligi = (yuzeyL: number): number =>
  yuzeyL < 0.20 ? 0.70 : yuzeyL < 0.35 ? 0.40 : yuzeyL < 0.62 ? 0.25 : 0.35

Ve koşulu kaldır: gren degradeVar'a bağlı olmayacak. Düz zemin greni EN ÇOK isteyen zemindir.
const hepsi = [grenKatmani(), ...katmanlar]   // koşulsuz

Koruma (R-85 sınıfı): baseFrequency tam sayı olamaz — kapı ekle.
if (Number.isInteger(Number(bf))) throw new Error('baseFrequency tam sayı: gren SESSİZCE ölür')

Blend: overlay → soft-light. Gerekçe kayda geçmeli: overlay koyu zeminde σ 0,51–0,77 üretiyor, JPEG q82 onu siliyor (%93,8 düz plato). soft-light + luminansa bağlı opaklık σ≈2,0 tutuyor ve bant %95→%20'ye iniyor.

C.2 JPEG kalitesi

q=90. Ölçüm: q75→q95 arası grensiz hiçbir kazanç yok (%95,1→%95,9); gren varken q82→q90 anlamlı (%22,7→%20,1), q90→q95 değil (%16,7, +%88 dosya). q=90 + σ=2,0 = 172 KB, %20 plato.

C.3 Vinyet ve ışık — panoramanın TAMAMINA

zemin.ts:79'daki uyarı doğru ve korunmalı: slayt başına vinyet her kesimde bir halka üretir. Işık da öyle.
/* panorama.after — tek örtü, 6480 px boyunca */
.panorama::after{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(120% 95% at 50% 42%, transparent 52%, rgb(0 0 0 / .34) 100%);
}
Her şablon vinyet gücünü kendi belirler (0,18 kâğıt · 0,34 mürekkep · 0,26 beton).

C.4 "Kutu değil yüzey" — HTML görünümünden çıkış

Her panel/çip/kart için, sırayla:
1. border-radius ya 0 ya ≥28 px. 4–12 px arası tam olarak "bootstrap kartı" bandıdır.
2. Saf renk yok. Her panel zemini en az iki katman: taban + soft-light gren + 1 px'lik iç ışık inset 0 1px 0 rgb(255 255 255 / .06).
3. Düz gölge yok. Tek box-shadow yerine iki katman: 0 1px 2px rgb(0 0 0/.30), 0 12px 40px -8px rgb(0 0 0/.45).
4. Kenar bozma (yalnız dekoratif ögelerde, metinde DEĞİL):
   filter: url(#kenar) · feTurbulence bf=0.05 oct=3 + feDisplacementMap scale=3.
   ⚠ scale 4'ü geçemez — Türkçe aksanları eriyor (ölçüldü). Metne uygulanacaksa test dizesi ÖLÇÜM HATTI ŞĞİ.
5. Düzensizlik enjeksiyonu. Her tekrar eden ögeye seed'li sapma: rotate(calc(var(--i) * 0.14deg - 0.2deg)), konum ±3 px, opaklık ±0.04. Rastgele değil — seed'den türetilmiş, çıktı yeniden üretilebilir kalsın (Yasa 11).
6. Eşit aralık yasak. Panel dizisinde boşluklar 1 : 1.15 : 0.9 gibi ölçekle; mükemmel eşitlik kodun imzasıdır.

C.5 Z-sırası — "çizgiler yazıyı kesiyor"un tek çözümü

Sabit katman sözleşmesi:
z 0  — zemin + doku + gren
z 1  — AKIŞ TAŞIYICISI (eğri, köşegen, kemer, kama, ok)
z 2  — görsel (kesik özne) + temas gölgesi
z 3  — yerel karartma/aydınlatma (metin okunurluk yastığı)
z 4  — metin (başlık, gövde, etiket)
z 5  — künye şeridi + marka işareti
Kural: taşıyıcı asla z 4'ün üstüne çıkmaz. Ama "altta olmak" yetmiyor — çizgi metnin arkasından geçerken de okumayı bozar. İki ek zorunluluk:

(a) Taşıyıcı, metin kutusunun 24 px dışına maskelenir.
.tasiyici{
  mask-image:
    linear-gradient(#000 0 0),                    /* her yer görünür */
    var(--metin-kutulari);                        /* metin bölgeleri çıkarılır */
  mask-composite: subtract;
}
--metin-kutuları, düzen provasının zaten ölçtüğü kutulardan üretilir (duzen-provasi, D-347) — yeni ölçüm gerekmez.

(b) z 3 okunurluk yastığı. Metin bir görselin ya da parlak alanın üstündeyse, metnin arkasına yumuşak yerel karartma konur (kutu değil, elips):
.yastik{ background: radial-gradient(120% 140% at 30% 50%,
          rgb(0 0 0 / .55) 0%, rgb(0 0 0 / .28) 55%, transparent 78%);
         filter: blur(28px); }
Bu, R-84'ün (%12 çakışma tavanı) yerine geçmez — onu karşılanabilir kılar.

C.6 Marka işareti — şikâyet 1'in cevabı

Elle çizilmiş "U" tamamen kalkar. Yalnız brand/brd_upcytech/logo/isaret-{koyu,acik}.png.

Kural — karosel başına tam iki kez:

┌─────────────────────────────────────────┬────────────────────────────────┬───────────────────┐
│                 Nerede                  │              Boy               │        Rol        │
├─────────────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ Slayt 1, sağ üst, güvenli alanın içinde │ 32 px yükseklik                │ Sahiplik. Sessiz. │
├─────────────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ Son slayt, kapanış jesti                │ 112 px yükseklik, optik hizalı │ İmza.             │
└─────────────────────────────────────────┴────────────────────────────────┴───────────────────┘

Künye şeridindeki 20 px'lik logo imza DEĞİL, duvar kâğıdıdır — her slaytta tekrar ettiği için gözden düşer ve 60 px'lik bandı harcar. Kaldırılacak. Künye şeridi yalnız üç şey taşır: bölüm adı · veri kaynağı · 03 / 06 sayacı. (Sayaç zaten KROM, R-88'e girmiyor.)

Zemin koyuysa isaret-acik.png, açıksa isaret-koyu.png — zeminTabani() zaten bu bilgiyi veriyor.

C.7 Kesintisizlik denetimi

R-87 zaten "her kesimde taşıyıcı" diyor. Ölçülebilir hale getir: kesim çizgisinin ±40 px şeridinde, z 1 veya z 2 katmanından en az bir ögenin piksel kaplaması ≥ %12 olacak. Bugün kavis ve akan-alan bu kapıdan geçiyor ama taşıyıcı görünmez olduğu için işe yaramıyor — ikinci koşul: taşıyıcı ile zemin arasındaki kontrast ≥ 1,6:1.

C.8 3:4 riski

Tuval 1080×1440 (3:4), ama üretim blob'ları hâlâ 1080×1350 (4:5). Kaynaklar 2026 için çelişiyor: Buffer 3:4'ü yalnız ızgara kırpma referansı sayıyor, taşıyıcı seçenekleri 1:1/4:5/1.91:1 diyor; başka kaynaklar 3:4'ü yerel yükleme boyu ilan ediyor. Gerçek bir yüklemeyle doğrulanmadan güvenmeyin.
Riski sıfırlayan tasarım hamlesi: taşıyıcı yükü olan her şey 1080×1350 merkez bandında kalsın (üst/alt 45 px pay). R-88 zaten 80 px istiyor — bugünkü güvenli alan her iki sonuçta da yeterli. Ek iş yok, yalnız bilinçli olun.

---

D. İLK BEŞ İŞ (en yüksek görsel kazanç, sırayla)

1 · Greni koşulsuz aç ve luminansa bağla. (§C.1)
Tek dosya (zemin.ts), üç değişiklik: alfa sabitle · degradeVar koşulunu kaldır · overlay→soft-light + grenOpakligi(). Bu tek iş on kapağın %85'lik düz alanını bitirir. Ölçülebilir kabul: modal renk kaplaması ≤%40, en uzun sabit bant ≤10 px.

2 · Taşıyıcıyı görünür kıl. akan-alan ve kavis'te taşıyıcı/zemin kontrastı 1,6:1'e çıkar; veri-hikayesi köşegenini 2→6 px ve magenta yap. Seamless'ın çalışmadığı üç şablon böylece çalışmaya başlar — kompozisyonu değiştirmeden.

3 · Yüzeyi kesimden ayır. donen ve memphis'te yüzey dönüşünü kesim çizgisinden slayt merkezine taşı (§B-5). Bugün bu iki şablon sürekliliği aktif olarak kırıyor; düzeltmesi yalnız degrade duraklarının yeri.

4 · Fontları değiştir ve şablona ata. Archivo + Big Shoulders(+Stencil) + Martian Mono + Literata + Young Serif. Jakarta/Montserrat/JetBrains/Source Serif çıkar. ⚠ IBM Plex'i denemeyin — latn/TRK yok, ölçüldü. font-getir.mjs'in aile listesi ve fonts.ts'in YUZLER dizisi güncellenir; latin + latin-ext ikilisi kuralı aynen korunur.

5 · Z-sırası sözleşmesi + taşıyıcı maskesi. (§C.5) "Çizgiler yazıyı kesiyor" şikâyetini kökten bitirir ve karsilastirma'daki sayı çakışmasını çözer. Maske kutuları duzen-provasi'nin zaten ürettiği ölçümlerden gelir — yeni ölçüm altyapısı gerekmez.

---

Not

Tema/renk/sanayi-görsel-dili başlıkları için paralel bir araştırma ajanı başlatmıştım; dönmedi, o üç başlığı kendim kapattım (§0.3 paletleri, A tablosu, B'deki görsel brief'leri). Kaynaklı sektör referansı (TOMRA, Sandvik, Trumpf vb.) hâlâ eksik — istersen o başlığı ayrıca çıkarayım.

Ölçüm betikleri /tmp altında duruyor ve yeniden koşturulabilir: font-turkce-denetim.mjs (Türkçe font sınavı) · bant-olcum.py (JPEG bant) · gren-kalibre2.mjs (gren σ kalibrasyonu) · oklch.py + rampa.py (gamut/palet). Bunlar docs/kurallar/OLCUMLER.md'ye taşınmaya değer — hepsi bir kuralın sayısını üretiyor.