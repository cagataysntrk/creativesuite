# FAZ 12 — Photoshop'suz kudret: efektler, ritim, süreklilik

**Amaç:** Chromium'un zaten sahip olduğu ama **hiç bağlanmamış** tasarım kudretini bağlamak.
Ölçüldü ve utandırıcı: render katmanında `object-fit` DIŞINDA hiçbir görsel işleme çağrısı
yoktu. Photoshop'un katman stillerinin ve filtrelerinin neredeyse tamamı standart, bedava
ve kurulumsuz duruyor.
**Yöneten kararlar:** D-252, D-254, D-261
**Ön koşul:** FAZ-11 görsel dili (dağarcık, yuva, ikon) yerinde
**Çıkış kriteri:** Bir karosel, kaynak fotoğraf olmadan, yalnız tipografi · efekt · doku ·
veri ögesiyle **profesyonel ajans işi** görünümünde çıkabiliyor; 20 ardışık kabul koşusu
bu dille geçiyor.

> **Tam envanter:** `docs/research/10-arac-envanteri--kurulacaklar-lisanslar-ve-tuzaklar.md`
> ve `docs/referans/yetenek-envanteri.md`. Bu faz o envanterin ⛔/🟡 satırlarını kapatıyor.
>
> ⚠ **İki lisans tuzağı kayda geçti:** BRIA RMBG-2.0 **CC BY-NC** (ticari YASAK, ve zaten
> MIT olan BiRefNet üstüne kurulu), Potrace **GPL** (copyleft). İkisi de "en iyi araç"
> listelerinin başında; ikisi de bu ürüne giremez.
>
> ⚠ **Sert ilke — canvas'a metin çizilmez.** ECharts/Chart.js gibi canvas tabanlı kütüphaneler
> tam da bu yüzden reddedildi: metin raster olduğu an `notdef` sayımı, kontrast ölçümü ve
> Türkçe kapıları KÖR olur. R-20'nin veri görselleştirmedeki karşılığı.

---

## 12.1 — Tipografi katman stilleri: Photoshop'un tamamı, canlı metinle    [ ]

📖 §7.2, §12.2 · R-20, R-30
🔗 —
🛠 Photoshop katman stillerinin tamamının CSS/SVG karşılığı, **kapalı bir dağarcık** olarak:

| Photoshop | Karşılığı | Durum |
|---|---|---|
| Stroke | `-webkit-text-stroke` | ✅ hayalet rakam |
| Drop / Inner Shadow | `text-shadow` · `drop-shadow()` | yeni |
| Outer / Inner Glow | çok katmanlı bulanık gölge | yeni |
| Gradient Overlay | `background-clip: text` + degrade | yeni |
| Pattern / Image Overlay | `background-clip: text` + görsel | yeni |
| Bevel & Emboss | iki yönlü gölge çifti | yeni |
| Knockout | `mix-blend-mode: difference` | yeni |
| Warp Text | SVG `textPath` | yeni |
| Değişken eksenler | `font-variation-settings` | ✅ Archivo |
| OpenType (ligatür, alternatif) | `font-feature-settings` | yeni |
| Vurgu şeridi | eğik `background` | yeni |

📁 `packages/render/src/sablon-tipo.ts` · `static.ts`
✅ ⚠ **Efekt SLAYT ROLÜNE göre seçiliyor, serbestçe değil.** Photoshop'ta her efekt her
   metne uygulanabilir; bir MARKA sisteminde uygulanamaz. "Hepsi mümkün" ile "hepsi aynı
   anda" arasındaki fark, tasarım ile şablon arasındaki farktır.
   ⚠ **R-20 KORUNUYOR:** hiçbir efekt metni görsele çevirmiyor. `background-clip: text`
   bile canlı metin bırakır — glif ölçümü ve Türkçe kapıları çalışmaya devam eder.
   ⚠ Kontrast (T4) her efektten SONRA ölçülür: degradeyle dolan başlık zeminle kontrastını
   kaybedebilir ve o an okunmaz olur.
🧪 Kontrastı düşüren efekt uygula → `tasarim` kırmızı. `background-clip: text` uygulanmış
   başlıkta glif ölçümü hâlâ çalışıyor (metin görsele dönmedi).
💾 `feat(render): tipografi efekt dagarcigi` · `Refs: FAZ-12.1 · §7.2`

## 12.2 — Raster işleme ilkelleri: filtre, karışım, maske    [ ]

📖 §7.1, §12.1 · R-30
🔗 12.1
🛠 Görsel ve alanlara uygulanan kapalı işlem dağarcığı — hepsi Chromium, sıfır kurulum:
   `filter` (blur · brightness · contrast · saturate · hue-rotate · sepia) ·
   `feColorMatrix` (duotone) · `feTurbulence` (grain) · `feConvolveMatrix` (keskinleştirme) ·
   `feComponentTransfer` (posterize/halftone) · `mix-blend-mode` (16 kip) ·
   `mask-image` (alfa/degrade maskesi) · `clip-path` (şekil maskesi) ·
   `backdrop-filter` (cam etkisi) · 3B `transform` (perspektif).
📁 `packages/render/src/gorsel-islem.ts`
✅ ⚠ **İşlemler ADLANDIRILMIŞ ve KAPALI** — `filter: <serbest string>` değil.
   `duotone` · `yumusat` · `grenli` · `derinlik` · `cam` gibi ROL adları. Serbest CSS
   dizesi kabul edilirse sağlayıcı çıktısı doğrudan stile sızar ve marka garantisi biter.
   ⚠ Her işlem sonrası kontrast ve palet METRİKLERİ yeniden ölçülür (D-258 istisnası
   dışında): `saturate(2)` chroma tavanını (§12.1) delebilir.
🧪 Chroma tavanını aşan bir filtre uygula → `kalite` kırmızı. Serbest CSS dizesi geçir →
   derleme hatası.
💾 `feat(render): raster islem dagarcigi` · `Refs: FAZ-12.2 · §7.1`

## 12.3 — Türkçe tipografik ritim: heceleme, yaslama, temel ızgara    [ ]

📖 §7.2 · R-21, R-23, R-30
🔗 —
🛠 Türkçe eklemeli bir dil: `taşıyabileceğimizin` 19 karakter ve **bölünemiyor**. Şu an
   satır sonları göz kararı; `hyphens: auto` + `lang="tr"` Chromium'un Türkçe heceleme
   sözlüğünü açar. Ayrıca **temel ızgara**: dikey ritim şu an rastgele, `line-height`
   katları bir ızgaraya oturtulur.
📁 `packages/render/src/sablon-parametre.ts` · `static.ts`
✅ ⚠ **`hyphens: auto` TEK BAŞINA yetmez** — `lang="tr"` olmadan Chromium İngilizce
   kurallarıyla böler ve `ta-şıyabileceğimizin` yerine yanlış yerden keser. İkisi birlikte.
   ⚠ Heceleme, punto ölçümünü GEÇERSİZ KILMAZ ama gevşetir: FAZ-10'da band %69–78 ölçülmüştü
   çünkü kelime bölünemiyordu. Heceleme açılınca **ölçüm TEKRARLANIR** — eski sayı yeni
   davranışı temsil etmiyor.
   ⚠ Tire karakteri: Türkçe satır sonu tiresi `-` (U+002D), tırnak değil.
🧪 `lang` özniteliğini kaldır → heceleme testi kırmızı. Izgara dışı `line-height` → `tasarim` kırmızı.
💾 `feat(render): turkce heceleme ve temel izgara` · `Refs: FAZ-12.3 · §7.2`

## 12.4 — Panoramik süreklilik: karosel TEK şey görünsün    [ ]

📖 §7.1 · D-254
🔗 12.2
🛠 Referans örnek 2'nin taşıyıcı dili: bir öge slaytlar arasında **akıyor** — eğri devam
   ediyor, renk alanı kayıyor, bir şekil kareyi terk edip diğerinde beliriyor. Karoselin
   "tek şey" görünmesini sağlayan en güçlü teknik. Şu an her slayt bağımsız çiziliyor.
📁 `packages/render/src/sablon-panorama.ts`
✅ ⚠ **Süreklilik SLAYT SIRASINA bağlı, içeriğe değil.** `k.index / k.total` ile faz
   hesaplanır; içerikten türerse bir cümle değiştiğinde tüm karosel kayar.
   ⚠ **Instagram slaytları BİTİŞİK GÖRÜNMEZ** — aralarında boşluk ve kaydırma var. Yani
   piksel-mükemmel devam DEĞİL, **ima edilen devam** hedefleniyor: eğrinin çıkış açısı
   sonrakinin giriş açısıyla uyumlu. Gerçek bitişiklik varsayımı yanlış çıktı verir.
   ⚠ Kapak ve kapanış **çapa**: ikisi de tam kompozisyon, akışın ucu değil.
🧪 Slayt sırasını karıştır → süreklilik testi kırmızı (faz artık monoton değil).
💾 `feat(render): panoramik sureklilik` · `Refs: FAZ-12.4 · §7.1`

## 12.5 — Veri görselleştirme dağarcığı: beş yeni öge    [ ]

📖 §7.1, §11.4 · R-32
🔗 —
🛠 `chart.ts` yalnız çubuk/çizgi biliyor. Karosel dilinde asıl kullanılanlar eksik:
   **halka** (tek oran) · **zaman çizelgesi** (süreç) · **karşılaştırma** (önce/sonra) ·
   **KPI karosu** (tek büyük sayı + bağlam) · **ilerleme** (hedefe mesafe).
📁 `packages/render/src/veri-ogeleri.ts` · `packages/engine/src/verbs/bodies.ts`
✅ ⚠ **ÜRETİM YOLU BAĞLANMADAN adım kapanmaz.** `chart` ve `diagram` repoda yazılıydı,
   testliydi, kapıları yeşildi ve üretim hattı SIFIR tane üretiyordu (D-261). Kabul ölçütü
   modülün varlığı değil, **gerçek bir koşuda çıkmış olması.**
   ⚠ **R-32 geçerli:** her sayı `claim_source` ister. Kaynaksız KPI karosu YAYINLANAMAZ —
   bu ögeler kaynak zorunluluğunu delmenin yolu değil, ona tabi.
   ⚠ Metin SVG'de kalır; canvas kullanılmaz (bkz. faz başlığı).
🧪 Kaynaksız bir KPI karosu üret → `citations`/`kalite` kırmızı.
💾 `feat(render): veri ogeleri dagarcigi` · `Refs: FAZ-12.5 · §7.1`

## 12.6 — Marka işareti: yerleşim, boşluk kuralı, filigran    [ ]

📖 §4.3 · D-252
🔗 —
🛠 Marka işareti şu an **hiç yok** — yalnız metin kulbu var. Logo, boşluk kuralı
   (clearspace), en küçük boy ve izinli yerleşimler kapalı bir kural kümesi olarak.
📁 `packages/render/src/marka-isareti.ts`
✅ ⚠ Boşluk kuralı işaretin KENDİ ölçüsünden türetilir (klasik: harf yüksekliği kadar),
   sabit piksel değil — 1:1 ve 9:16'da sabit piksel farklı görünür.
   ⚠ Logo süsleme DEĞİLDİR: her slayta değil, kapak ve kapanışa.
🧪 Boşluk kuralını ihlal eden yerleşim → `tasarim` kırmızı.
💾 `feat(render): marka isareti yerlesimi` · `Refs: FAZ-12.6 · §4.3`

## 12.7 — Kompozisyon ailesi: kapalı garanti, AÇIK aile    [ ]

📖 §7.1 · D-254, D-261
🔗 12.1, 12.2, 12.4
🛠 *"Tek çeşidi yok, binlerce çeşidi var."* D-254 kapalı bir düzen enum'u kurdu ve bu doğru;
   ama kapalı olan **garanti katmanı** (okunabilirlik, kontrast, güvenli alan, marka), açık
   olan **kompozisyon ailesi**. Bir aile = düzen + efekt profili + doku + süsleme yoğunluğu +
   panorama fazı. Aileler veriyle tanımlanır, kodla değil; garanti katmanı hepsini süzer.
📁 `packages/render/src/kompozisyon-ailesi.ts` · `brand/` altında aile tanımları
✅ ⚠ **Aile ESTETİK seçer, GÜVENLİK değil.** Bir aile güvenli alanı, kontrast eşiğini ya da
   chroma tavanını gevşetemez — bunlar ailenin dışında ve üstünde kalır. Aksi hâlde "yeni
   aile" her kısıtı delmenin yolu olur.
   ⚠ Aile seçimi İÇERİKTEN: veri yoğun konu → veri ailesi; anlatı → tipografik aile.
   Rastgele seçilirse golden test kurulamaz.
🧪 Güvenli alanı gevşeten bir aile tanımla → derleme hatası (garanti alanları ailede yok).
💾 `feat(render): kompozisyon ailesi` · `Refs: FAZ-12.7 · §7.1`

## 12.8 — Piksel boru hattı: `sharp` ve yerel raster işlemleri    [ ] BLOKE:karar

📖 §7.1, §16
🔗 12.2
🛠 Chromium'un yapamadığı üç şey: gerçek yeniden örnekleme (Lanczos), format/EXIF
   temizliği, ve **model çıktısını büyütme** (üretim 1024², karosel 1080²).
   Adaylar: `sharp` (Apache-2.0, libvips LGPL — değiştirilmemiş sunucu kullanımı uygun) ·
   Real-ESRGAN (BSD-3) · BiRefNet (MIT) · VTracer (MIT).
📁 —
✅ ⚠ **KARAR GEREKİYOR:** bu adım ilk kez model ağırlığı indirmeyi getiriyor. §16 ile
   sınanmalı — *bir ay ihmal edilse de çalışır, kurtarma `git clone` + `cat`*. Ağırlık
   varlık deposunda (D-248, içerik-adresli) mi, yoksa isteğe bağlı bir yetenek mi?
   ⚠ **Lisans tuzakları kayıtlı:** BRIA RMBG **CC BY-NC** → yasak; Potrace **GPL** → yasak.
   MIT/BSD karşılıkları var, onlar kullanılacak.
💾 —

## 12.9 — Degrade ve renk geçişi yüzeyleri    [ ]

📖 §12.1, §7.1 · D-253
🔗 12.2
🛠 Şu an her alan DÜZ renk. Degrade, çağdaş karosel dilinin en görünür estetik kaldıracı ve
   Chromium'da bedava: `linear-gradient` · `radial-gradient` · `conic-gradient` ·
   **mesh degrade** (üst üste bindirilmiş yumuşak radyal katmanlar) · **grenli degrade**
   (degradenin üstüne `feTurbulence` — bantlaşmayı gizler ve pahalı görünür).
📁 `packages/render/src/sablon-degrade.ts`
✅ ⚠ **Degrade CHROMA TAVANINA tabidir (§12.1, D-253).** Ölçüm yüzey kapsamlı: bir degrade
   ortalamada tavanı geçmese de tek bir durağı geçebilir — **her durak ayrı ölçülür.**
   ⚠ Degrade rampadan türer, serbest renk çifti değil: `--ramp-amber-40 → --ramp-amber-70`.
   İki serbest renk arası geçiş marka dışına çıkar ve palet metriği bunu ancak sonradan görür.
   ⚠ **8-bit bantlaşma gerçek bir kusurdur** — 1080px'de düşük kontrastlı degrade şeritlenir.
   Gren katmanı süs değil, düzeltmedir.
🧪 Rampa dışı bir durak tanımla → derleme hatası. Tavanı aşan durak → `kalite` kırmızı.
💾 `feat(render): degrade yuzeyleri` · `Refs: FAZ-12.9 · §12.1`

## 12.10 — Şekil cebri ve şekilli metin akışı    [ ]

📖 §7.1, §7.2 · R-30
🔗 12.2
🛠 İki eksik: (a) **boole işlemleri** — birleşim/fark/kesişim, `clipPath` + `mask` +
   `feComposite` ile; kontur dağarcığı (`stroke-dasharray/linecap/linejoin`, değişken
   kalınlık). (b) **`shape-outside`** — metin bir şeklin ETRAFINDA akar. InDesign sınıfı bir
   yetenek, Chromium'da standart, bizde hiç kullanılmıyor: metin hep dikdörtgen kutuda.
📁 `packages/render/src/sekil-cebri.ts` · `static.ts`
✅ ⚠ **`shape-outside` güvenli alanı GENİŞLETMEZ.** Metin eğrinin etrafından akabilir ama
   band sınırı (%69–78) hâlâ geçerli — akış, sınırı delmenin yolu değil, sınır içinde daha
   iyi kullanmanın yolu. Aksi hâlde FAZ-10'da üç kez düzelttiğim taşma sınıfı geri gelir.
   ⚠ **Türkçe kelime bölünemiyor** (§7.2): dar bir akış koridoru `taşıyabileceğimizin`i
   sığdıramaz. Koridor genişliği en uzun kelimenin ölçülen genişliğinden KÜÇÜK olamaz —
   bu bir tercih değil, ölçülmüş bir alt sınır.
🧪 En uzun kelimeden dar bir akış koridoru tanımla → `tasarim` kırmızı (taşma).
💾 `feat(render): sekil cebri ve akis` · `Refs: FAZ-12.10 · §7.1`
