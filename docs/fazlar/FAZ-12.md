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
> ⚠ **İki lisans tuzağı:** BRIA RMBG **CC BY-NC**, Potrace **GPL** — ikisi de giremez.
>
> ⚠ **Canvas'a metin çizilmez.** ECharts/Chart.js bu yüzden reddedildi: metin raster olduğu
> an `notdef` sayımı ve Türkçe kapıları KÖR olur — R-20'nin veri görselleştirmedeki karşılığı.

---

## 12.1 — Tipografi katman stilleri: Photoshop'un tamamı, canlı metinle    [x] 2026-08-17

📖 §7.2, §12.2 · R-20, R-30
🔗 —
🛠 Photoshop katman stillerinin tamamının CSS/SVG karşılığı, **kapalı bir dağarcık** olarak:

**Karşılıklar:** Stroke→`-webkit-text-stroke` · Shadow/Glow→`text-shadow` ·
Gradient/Pattern Overlay→`background-clip: text` · Bevel→çift gölge · Knockout→
`mix-blend-mode: difference` · Warp→SVG `textPath` · Değişken eksen→`font-variation-settings` ·
OpenType→`font-feature-settings` · Vurgu şeridi→eğik `background`.

📁 `packages/render/src/sablon-tipo.ts` + `sablon-tipo.test.ts` · `static.ts` ·
   `packages/engine/src/metin-akisi.ts`
✅ ⚠ **Efekt SLAYT ROLÜNE göre seçiliyor, serbestçe değil.** Photoshop'ta her efekt her
   metne uygulanabilir; bir MARKA sisteminde uygulanamaz. "Hepsi mümkün" ile "hepsi aynı
   anda" arasındaki fark, tasarım ile şablon arasındaki farktır.
   ⚠ **R-20 KORUNUYOR:** hiçbir efekt metni görsele çevirmiyor. `background-clip: text`
   bile canlı metin bırakır — glif ölçümü ve Türkçe kapıları çalışmaya devam eder.
   ⚠ Kontrast (T4) her efektten SONRA ölçülür: degradeyle dolan başlık zeminle kontrastını
   kaybedebilir ve o an okunmaz olur.
   ⚠ ⚠ **BU AİLEDE ÜÇÜ KAPALI ve her birinin sebebi ayrı yazılı** — vinyette olduğu gibi
   (D-262 ailesi), yetenek duruyor ve parametrik:
   **degrade** kontrast metriği tek renk üstünden ölçüyor, en açık durak zeminle
   kontrastını kaybedebilir ve ölçüm göremez; açılması ölçümün EN KÖTÜ durağı bulmasını
   gerektirir — bir adım, bir CSS satırı değil.
   **gölge** referans örneklerin dördünde de yok, bu ailenin dili düz.
   **knockout** ise çözdüğü sorun bu ailede YOK: metin hiçbir zaman eğri sınırını geçmiyor
   (`column_in_band` değişmezi zorluyor).
   ⚠ **AÇIK OLAN İKİSİ ve neden onlar:** OpenType (`kern`/`liga`/`calt`; `dlig` kapalı —
   Türkçe'de `fi` bağı `fı` ile karışır) ve **vurgu şeridi**.
   ⚠ **Vurgu, karoselin en büyük tipografik eksiğiydi:** her satır aynı ağırlıkta
   okunuyordu. Prompt satır başına EN FAZLA bir ifade istiyor.
   ⚠ **İlk sürüm BAKINCA yetersiz çıktı:** yalnız renk değiştiriyordu, fark ayırt
   edilemiyordu. Fosforlu kalem deseni glifin ALT yarısında, kontrastı düşürmüyor.
🧪 6 test: `**x**` → `<strong>` ve metin GÖRSELE DÖNMÜYOR · kaçırma önce işaretleme sonra
   (enjeksiyon yok) · açgözlü değil · şerit gerçekten şerit · `dlig` kapalı.
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

## 12.3 — Türkçe tipografik ritim: heceleme, yaslama, temel ızgara    [x] 2026-08-17

📖 §7.2 · R-21, R-23, R-30
🔗 —
🛠 Türkçe eklemeli bir dil: `taşıyabileceğimizin` 19 karakter ve **bölünemiyor**.
   ⚠ ⚠ **ZİNCİR KOPUK — kod ZATEN VAR:** `packages/contracts/src/text-tr.ts` içinde
   `syllables()` ve `softHyphenate()` yazılı ve testli. Render katmanı bunları **hiç
   çağırmıyor.** Bu, `chart`/`diagram` ve `tasarimOlc` ile aynı sınıf: modül var, test
   yeşil, kapı yeşil, üretim yolu sıfır kullanıyor (D-261). Bu adımın işi yeni kod yazmak
   değil, **var olanı bağlamak** ve `hyphens: auto` + `lang="tr"` ile birleştirmek.
   Ayrıca **temel ızgara**: dikey ritim şu an rastgele, `line-height` katları oturtulur.
📁 `packages/render/src/static.ts` · `packages/render/src/heceleme.test.ts`
✅ ⚠ ⚠ **`hyphens: auto` KULLANILMADI — ve bu bilinçli.** Chromium'un otomatik hecelemesi
   bir sözlük gerektiriyor; Türkçe için garantisi yok ve **olmadığında sessizce hiçbir şey
   yapmaz.** Sessiz yokluk bu sistemin en sevmediği hata biçimi (font fallback'i,
   ölçülmeyen okuma, çağrılmayan modül — hepsi aynı aile). `softHyphenate` U+00AD basıyor
   ve tarayıcı onu her koşulda onurlandırıyor. `lang="tr"` yine de basılıyor.
   ⚠ **Yalnız GÖVDE, başlık DEĞİL.** Başlık 64 px display yüzüyle çiziliyor; bölünen bir
   kelime kompozisyonu bozar ve referansların hiçbirinde bölünmüş başlık yok. Başlık zaten
   8 kelimeyle sınırlı ve ölçülmüş bir puntoda sığıyor.
   ⚠ **Belge modeli DEĞİŞMİYOR:** tire yalnız render anında. Eşik 12 harf — editöryel
   parametre, ölçüm değil (D-262).
   ⚠ **Temel ızgara bu adımda YAPILMADI** — dikey ritim FAZ-13.1'in (optik merkez, boşluk
   ölçeği) parçası ve orada bir arada ele alınması doğru. Burada iddia edilmiyor.
🧪 5 test: uzun kelime tire alıyor · kısa kelime almıyor · BAŞLIK bölünmüyor · `lang="tr"`
   basılıyor · belge modeli temiz kalıyor.
   ⚠ Kod ZATEN VARDI (`contracts/src/text-tr.ts`, testli) ve üretim yolu **hiç
   çağırmıyordu** — bu projede yedinci zincir kopukluğu (D-261).
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

## 12.5 — Veri görselleştirme: karşılaştırma (sayı istemeyen tek öge)    [x] 2026-08-17

📖 §7.1, §11.4 · R-32
🔗 —
🛠 Beş öge planlanmıştı; **biri yapıldı, üçü R-32 arkasında bekliyor, biri elendi.**
📁 `packages/render/src/charts/karsilastirma.ts` + testi · `packages/kernel/src/doc/model.ts` ·
   `packages/engine/src/metin-akisi.ts` · `packages/engine/src/verbs/bodies.ts`
✅ ⚠ ⚠ **HALKA, KPI ve İLERLEME YAZILMADI — ve bu bir eksiklik değil, bir karar.** Üçü de
   bir orana ya da sayıya dayanıyor; R-32 kaynaksız sayısal iddiayı yasaklıyor ve
   `icerikPromptu` zaten *"hiçbir sayısal iddia yazma"* diyor. Yani üretim yolları BUGÜN
   KAPALI. Onları yazmak, çağıranı olmayan makine kurmak olurdu — bu projede yedi kez
   tekrarlayan hata (D-261). Corpus'a `claim_source`lu sayı geldiği gün açılırlar.
   ⚠ **ZAMAN ÇİZELGESİ ELENDİ:** akış diyagramı zaten dikey, sıralı, etiket+ayrıntılı bir
   dizi çiziyor. İkincisi aynı şeklin ikinci uygulaması olurdu (R-05'in çizim karşılığı).
   ⚠ **KARŞILAŞTIRMA yapıldı çünkü hem sayı istemiyor hem GERÇEKTEN farklı:** akış bir
   SIRA anlatır (adım → adım), karşılaştırma bir KARŞITLIK kurar (bugün → olması gereken).
   ⚠ **ÜRETİM YOLU BAĞLI:** prompt bölümü → `karsilastirmayiAyir` → `compare` bloğu →
   `compareHtml`. Akış varsa karşılaştırma konmuyor: aynı slaytta iki veri ögesi kalabalık.
   ⚠ Tek taraflı karşılaştırma REDDEDİLİYOR (`validateDocument` + çizici, iki savunma):
   tek taraflı bir karşılaştırma karşılaştırma değil bir listedir.
   ⚠ Metin SVG/DOM'da; canvas yasak. Lexicon karşılaştırmanın HER metnini tarıyor — R-32
   buradan da geçiyor.
   ⚠ **TEK SOL KENAR — bakınca bulundu.** Oluk yalnız paragrafa veriliyordu; bloklar 54 px
   solda başlıyordu. Artık tüm içeriğe ve TEK bir değerden geliyor.
🧪 4 test: iki taraf çiziliyor · tek taraflı reddediliyor · SONRA marka aksanlı · kaçırma.
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

## 12.7 — Kompozisyon ailesi: kapalı garanti, AÇIK aile    [x] 2026-08-17

📖 §7.1 · D-254, D-261
🔗 12.1, 12.2, 12.4
🛠 *"Tek çeşidi yok, binlerce çeşidi var."* D-254 kapalı bir düzen enum'u kurdu ve bu doğru;
   ama kapalı olan **garanti katmanı** (okunabilirlik, kontrast, güvenli alan, marka), açık
   olan **kompozisyon ailesi**. Bir aile = düzen + efekt profili + doku + süsleme yoğunluğu +
   panorama fazı. Aileler veriyle tanımlanır, kodla değil; garanti katmanı hepsini süzer.
📁 `packages/contracts/src/aile.ts` + testi · `packages/kernel/src/doc/model.ts` ·
   `packages/engine/src/plan/tasarla.ts` · `packages/render/src/sablon-susleme.ts`
✅ ⚠ **Aile ESTETİK seçer, GÜVENLİK değil.** Bir aile güvenli alanı, kontrast eşiğini ya da
   chroma tavanını gevşetemez — bunlar ailenin dışında ve üstünde kalır. Aksi hâlde "yeni
   aile" her kısıtı delmenin yolu olur.
   ⚠ Aile seçimi İÇERİKTEN: veri yoğun konu → veri ailesi; anlatı → tipografik aile.
   Rastgele seçilirse golden test kurulamaz.
   ⚠ ⚠ **ZORLAMA BİR DENETİM DEĞİL, YOKLUK.** `AileProfili`de `guvenliAlan`,
   `kontrastEsigi`, `chromaTavani`, `kelimeButcesi` ALANLARI YOK. Denetlenecek alan yoksa
   gevşetilecek kural da yok — en ucuz zorlama budur ve testi bunu doğruluyor.
   ⚠ **Aile parametreleri BELGEYE giriyor ve render onları PLANDAN okuyor.** Süsleme
   yoğunluğu bugüne kadar `sablon-susleme.ts`te SABİTTİ ve plan da 0.25 diyordu: ikisi
   TESADÜFEN aynıydı. Kelime tavanının prompt ile ölçümde ayrı yaşamasıyla aynı hata —
   biri değişse öbürü sessizce eski kalırdı. Artık tek kaynak.
   ⚠ **Değerler uydurulmadı:** vinyet 0 (0.1'de amber alan 215→229 arası değişiyordu),
   degrade kapalı (aynı ölçüm), süsleme 0.25 (yoğun tarama kâğıt alanda kalabalıktı),
   tipo efektleri yalnız `vurgu`+`kontur` (referansların dördü de düz tipografi).
   ⚠ **Kayıtta TEK aile var ve bu dürüst hâl:** ikinci aileyi bir referans talep etmeden
   yazmak, kullanıcısı olmayan çeşitlilik üretmek olurdu. `docs/referans/ornekler/` beş
   ayrı aile gösteriyor; ikincisi FAZ-13'ten sonra ölçülerek açılır.
🧪 6 test: garanti alanları ailede YOK · yalnız estetik alanlar · ölçülen değerler ·
   kapalı efektler açık değil · geçersiz aralık yakalanıyor · aile VERİ.
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
