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

> **Tam envanter:** `docs/referans/yetenek-envanteri.md` ·
> `docs/research/10-arac-envanteri...`. Bu faz o envanterin ⛔/🟡 satırlarını kapatıyor.
>
> ⚠ **İki lisans tuzağı:** BRIA RMBG **CC BY-NC**, Potrace **GPL** — ikisi de giremez.
> ⚠ **Canvas'a metin çizilmez:** metin raster olduğu an `notdef` sayımı ve Türkçe kapıları
> KÖR olur — R-20'nin veri görselleştirmedeki karşılığı (ECharts/Chart.js bu yüzden elendi).

---

## 12.1 — Tipografi katman stilleri: Photoshop'un tamamı, canlı metinle    [x] 2026-08-17

📖 §7.2, §12.2 · R-20, R-30
🔗 —
🛠 Photoshop katman stillerinin tamamının CSS/SVG karşılığı, **kapalı bir dağarcık** olarak:

**Karşılıklar:** Stroke→`-webkit-text-stroke` · Shadow/Glow→`text-shadow` · Overlay→
`background-clip: text` · Knockout→`mix-blend-mode: difference` · Warp→SVG `textPath` ·
OpenType→`font-feature-settings` · Vurgu şeridi→`background` degrade.

📁 `packages/render/src/sablon-tipo.ts` + `sablon-tipo.test.ts` · `static.ts` ·
   `packages/engine/src/metin-akisi.ts`
✅ ⚠ **Efekt SLAYT ROLÜNE göre seçiliyor, serbestçe değil.** Photoshop'ta her efekt her
   metne uygulanabilir; bir MARKA sisteminde uygulanamaz. "Hepsi mümkün" ile "hepsi aynı
   anda" arasındaki fark, tasarım ile şablon arasındaki farktır.
   ⚠ **R-20 KORUNUYOR:** hiçbir efekt metni görsele çevirmiyor; `background-clip: text`
   bile canlı metin bırakır. Kontrast (T4) her efektten SONRA ölçülür.
   ⚠ ⚠ **BU AİLEDE ÜÇÜ KAPALI, sebepleri ayrı:** **degrade** — kontrast metriği tek renk
   ölçüyor, en açık durak kontrastını kaybedebilir ve ölçüm göremez (açmak ölçümün EN KÖTÜ
   durağı bulmasını ister). **gölge** — referansların dördü de düz. **knockout** — çözdüğü
   sorun bu ailede YOK, metin eğri sınırını hiç geçmiyor (`column_in_band`).
   ⚠ **AÇIK OLAN İKİSİ:** OpenType (`dlig` kapalı — Türkçe'de `fi` bağı `fı` ile karışır)
   ve vurgu şeridi.
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
🛠 Kapalı işlem dağarcığı, hepsi Chromium: `filter` · `feColorMatrix` (duotone ✓) ·
   `feTurbulence` (grain ✓) · `feConvolveMatrix` · `feComponentTransfer` ·
   `mix-blend-mode` · `mask-image` · `clip-path` (✓) · `backdrop-filter` · 3B `transform`.
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

## 12.4 — Panoramik süreklilik: karosel TEK şey görünsün    [x] 2026-08-17

📖 §7.1 · D-254
🔗 12.2
🛠 Referans örnek 2'nin taşıyıcı dili: bir öge slaytlar arasında **akıyor** — eğri devam
   ediyor, renk alanı kayıyor, bir şekil kareyi terk edip diğerinde beliriyor. Karoselin
   "tek şey" görünmesini sağlayan en güçlü teknik. Şu an her slayt bağımsız çiziliyor.
📁 `packages/render/src/sablon-susleme.ts` · `packages/contracts/src/aile.ts`
✅ ⚠ **Süreklilik SLAYT SIRASINA bağlı, içeriğe değil.** `k.index / k.total` ile faz
   hesaplanır; içerikten türerse bir cümle değiştiğinde tüm karosel kayar.
   ⚠ **Instagram slaytları BİTİŞİK GÖRÜNMEZ** — aralarında boşluk ve kaydırma var. Yani
   piksel-mükemmel devam DEĞİL, **ima edilen devam** hedefleniyor: eğrinin çıkış açısı
   sonrakinin giriş açısıyla uyumlu. Gerçek bitişiklik varsayımı yanlış çıktı verir.
   ⚠ Kapak ve kapanış **çapa**: ikisi de tam kompozisyon, akışın ucu değil.
   ⚠ ⚠ **AKAN ŞEY ZEMİN DEĞİL SÜSLEME.** Eğrinin dolgu tarafı her slaytta yer değiştiriyor
   (ritim bilerek böyle); zeminin monoton akması bu aileyle ÇELİŞİR.
   ⚠ **İlk deneme okumadı, ikincide öncül sorgulandı.** Kenarda yarım halka: matematik
   doğruydu (N'nin sağı y=45, N+1'in solu y=45) ama BAKINCA birleşmiyordu — aradaki boşlukta
   ikiye bölünen daire iki yarım daire gibi duruyor. Göz devamı **şekli tamamlayarak değil
   YÖNÜ izleyerek** kuruyor; yön veren `yay` eklendi (dağarcığın altıncısı — bir karar).
   ⚠ **Kapak VE kapanış çapa:** kapanış yay alıyordu, yani olmayan bir sonrakine işaret
   ediyordu; navigasyon orada zaten `‹‹ başa` diyor.
   ⚠ ⚠ **ÜÇÜNCÜ KAPALI YETENEK İKİNCİ AİLEYİ DOĞURDU.** Panorama `temel`de kapalı (o
   ailenin dili düz), tıpkı vinyet ve degrade gibi. Üç kapalı yetenek biriktiğinde ortaya
   çıkan şey eksik bir aile değil, İKİNCİ bir ailedir: `AKICI_AILE` (referans örnek 1'in
   karşılığı) panoramayı, yoğun süslemeyi ve farklı ritmi birlikte kullanıyor.
🧪 6 test: yön ögesi · kapanış çapa · `temel`de kapalı · `akici`de açık · garanti katmanı
   iki ailede de YOK · geçiş yüksekliği deterministik.
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
   ⚠ **KARŞILAŞTIRMA yapıldı:** sayı istemiyor ve gerçekten farklı — akış bir SIRA, bu bir
   KARŞITLIK. Üretim yolu bağlı: prompt → `karsilastirmayiAyir` → `compare` → `compareHtml`.
   Akış varsa konmuyor. Tek taraflı olan REDDEDİLİYOR (iki savunma): o bir listedir.
   Lexicon her metnini tarıyor — R-32 buradan da geçiyor.
   ⚠ **TEK SOL KENAR — bakınca bulundu.** Oluk yalnız paragrafa veriliyordu; bloklar 54 px
   solda başlıyordu. Artık tüm içeriğe ve TEK bir değerden geliyor.
🧪 4 test: iki taraf çiziliyor · tek taraflı reddediliyor · SONRA marka aksanlı · kaçırma.
💾 `feat(render): veri ogeleri dagarcigi` · `Refs: FAZ-12.5 · §7.1`

## 12.6 — Marka işareti: yerleşim, boşluk kuralı, filigran    [x] 2026-08-17

📖 §4.3 · D-252
🔗 —
🛠 Marka işareti şu an **hiç yok** — yalnız metin kulbu var. Logo, boşluk kuralı
   (clearspace), en küçük boy ve izinli yerleşimler kapalı bir kural kümesi olarak.
📁 `packages/render/src/marka-isareti.ts` + testi · `static.ts`
✅ ⚠ Boşluk kuralı işaretin KENDİ ölçüsünden türetilir (klasik: harf yüksekliği kadar),
   sabit piksel değil — 1:1 ve 9:16'da sabit piksel farklı görünür.
   ⚠ Logo süsleme DEĞİLDİR: her slayta değil, kapak ve kapanışa.
   ⚠ ⚠ **ÜÇÜNCÜ YAKLAŞIMDA ÖNCÜL DEĞİŞTİ.** İlk iki deneme akan eğrinin minyatürüydü:
   *"imza eğridir, öyleyse işaret de eğri olmalı."* Yanlış olan **"öyleyse"** — eğri
   1080 px'te imza, 30 px'te çizgi; iki büküm o karede ayırt edilemiyor ve işaret dilim
   gibi duruyordu. Bu ölçekte okuyan tek şey harf formu: mürekkep kare, oyulmuş "U".
   ⚠ **Yeni varlık YOK:** marka fontu zaten gömülü (D-252); SVG eklemek ağdan indirme +
   lisans + §16 sınavı demekti.
   ⚠ **Harf `text` olarak duruyor, `path`e çevrilmiyor:** canlı metin kalınca glif ölçümü
   ve `notdef` sayımı işareti de kapsıyor — font düşerse kapı görür (R-20 ailesi).
🧪 6 test: boşluk işaretin kendi ölçüsünden · en küçük boy · harf canlı metin · erişilebilir
   ad · yalnız kapak/kapanışta · kilit birlikte.
💾 `feat(render): marka isareti yerlesimi` · `Refs: FAZ-12.6 · §4.3`

## 12.7 — Kompozisyon ailesi: kapalı garanti, AÇIK aile    [x] 2026-08-17

📖 §7.1 · D-254, D-261
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
   `kontrastEsigi`, `chromaTavani`, `kelimeButcesi` ALANLARI YOK — denetlenecek alan yoksa
   gevşetilecek kural da yok. En ucuz zorlama budur.
   ⚠ **Parametreler BELGEYE giriyor, render PLANDAN okuyor.** Süsleme yoğunluğu render'da
   SABİTTİ ve plan da 0.25 diyordu: ikisi TESADÜFEN aynıydı — kelime tavanıyla aynı hata.
   ⚠ **Değerler uydurulmadı:** vinyet 0 (0.1'de amber alan 215→229 arası değişiyordu),
   degrade kapalı (aynı ölçüm), süsleme 0.25 (yoğun tarama kâğıt alanda kalabalıktı),
   tipo efektleri yalnız `vurgu`+`kontur` (referansların dördü de düz tipografi).
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
🛠 Şu an her alan DÜZ renk. `linear/radial/conic-gradient` · mesh (katmanlı radyal) ·
   grenli degrade (üstüne `feTurbulence` — bantlaşmayı gizler).
   ⚠ `temel` ailede kapalı; `akici` ailesi isteyebilir.
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
