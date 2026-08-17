# FAZ 12 — Photoshop'suz kudret: efektler, ritim, süreklilik

**Amaç:** Chromium'un zaten sahip olduğu ama **hiç bağlanmamış** tasarım kudretini bağlamak.
Ölçüldü: render katmanında `object-fit` DIŞINDA hiçbir görsel işleme çağrısı yoktu.
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
   ⚠ **AÇIK İKİSİ:** OpenType (`dlig` kapalı — `fi` bağı `fı` ile karışır) ve vurgu şeridi.
   ⚠ **İlk sürüm BAKINCA yetersiz çıktı:** yalnız renk değiştiriyordu. Fosforlu kalem
   deseni glifin ALT yarısında — vurgu, karoselin en büyük tipografik eksiğiydi.
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
🛠 Türkçe eklemeli: `taşıyabileceğimizin` 19 karakter ve **bölünemiyor**.
   ⚠ ⚠ **ZİNCİR KOPUK — kod ZATEN VAR:** `contracts/src/text-tr.ts` (`syllables`,
   `softHyphenate`) yazılı ve testli, render **hiç çağırmıyor** (D-261). İş yeni kod
   yazmak değil, var olanı bağlamak.
📁 `packages/render/src/static.ts` · `packages/render/src/heceleme.test.ts`
✅ ⚠ ⚠ **`hyphens: auto` KULLANILMADI — ve bu bilinçli.** Chromium'un otomatik hecelemesi
   bir sözlük gerektiriyor; Türkçe için garantisi yok ve **olmadığında sessizce hiçbir şey
   yapmaz.** Sessiz yokluk bu sistemin en sevmediği hata biçimi (font fallback'i,
   ölçülmeyen okuma, çağrılmayan modül — hepsi aynı aile). `softHyphenate` U+00AD basıyor
   ve tarayıcı onu her koşulda onurlandırıyor. `lang="tr"` yine de basılıyor.
   ⚠ **Yalnız GÖVDE, başlık DEĞİL.** Başlık 64 px display yüzüyle çiziliyor; bölünen bir
   kelime kompozisyonu bozar ve referansların hiçbirinde bölünmüş başlık yok. Başlık zaten
   8 kelimeyle sınırlı ve ölçülmüş bir puntoda sığıyor.
   ⚠ **Belge modeli DEĞİŞMİYOR:** tire yalnız render anında. Eşik 12 harf (D-262).
   ⚠ **Temel ızgara YAPILMADI** — dikey ritim FAZ-13.1'in parçası, orada ele alınacak.
🧪 5 test: uzun kelime tire alıyor · kısa almıyor · BAŞLIK bölünmüyor · `lang="tr"`
   basılıyor · belge modeli temiz kalıyor. Yedinci zincir kopukluğuydu (D-261).
💾 `feat(render): turkce heceleme ve temel izgara` · `Refs: FAZ-12.3 · §7.2`

## 12.4 — Panoramik süreklilik: karosel TEK şey görünsün    [x] 2026-08-17

📖 §7.1 · D-254
🔗 12.2
🛠 Referans örnek 2'nin taşıyıcı dili: bir öge slaytlar arasında **akıyor**. Karoselin
   "tek şey" görünmesini sağlayan en güçlü teknik.
📁 `packages/render/src/sablon-susleme.ts` · `packages/contracts/src/aile.ts`
✅ ⚠ **Süreklilik SLAYT SIRASINA bağlı, içeriğe değil.** `k.index / k.total` ile faz
   hesaplanır; içerikten türerse bir cümle değiştiğinde tüm karosel kayar.
   ⚠ **Instagram slaytları BİTİŞİK GÖRÜNMEZ** — aralarında boşluk ve kaydırma var. Yani
   piksel-mükemmel devam DEĞİL, **ima edilen devam** hedefleniyor: eğrinin çıkış açısı
   sonrakinin giriş açısıyla uyumlu. Gerçek bitişiklik varsayımı yanlış çıktı verir.
   ⚠ Kapak ve kapanış **çapa**: ikisi de tam kompozisyon, akışın ucu değil.
   ⚠ ⚠ **AKAN ŞEY ZEMİN DEĞİL SÜSLEME.** Eğrinin dolgu tarafı her slaytta yer değiştiriyor
   (ritim bilerek böyle); zeminin monoton akması bu aileyle ÇELİŞİR.
   ⚠ **İki deneme tutmayınca öncül sorgulandı.** Kenarda yarım halka: matematik doğruydu
   (y=45 iki yanda) ama BAKINCA birleşmiyordu — boşlukta bölünen daire iki yarım daire gibi
   duruyor. Göz devamı **şekli tamamlayarak değil YÖNÜ izleyerek** kuruyor; `yay` eklendi.
   ⚠ **Kapanış da çapa:** yay alıyordu, yani olmayan bir sonrakine işaret ediyordu.
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
✅ ⚠ ⚠ **HALKA, KPI ve İLERLEME YAZILMADI — eksiklik değil, karar.** Üçü de sayıya
   dayanıyor; R-32 kaynaksız sayıyı yasaklıyor ve prompt zaten yazdırmıyor, yani üretim
   yolları KAPALI. Yazmak çağıranı olmayan makine kurmak olurdu (D-261). Corpus'a
   `claim_source`lu sayı geldiği gün açılırlar.
   ⚠ **ZAMAN ÇİZELGESİ ELENDİ:** akış diyagramı zaten dikey, sıralı, etiket+ayrıntılı bir
   dizi çiziyor. İkincisi aynı şeklin ikinci uygulaması olurdu (R-05'in çizim karşılığı).
   ⚠ **KARŞILAŞTIRMA yapıldı:** akış bir SIRA, bu bir KARŞITLIK. Yol bağlı: prompt →
   `karsilastirmayiAyir` → `compare` → `compareHtml`. Tek taraflı olan REDDEDİLİYOR.
   ⚠ **TEK SOL KENAR — bakınca bulundu.** Oluk yalnız paragrafa veriliyordu; bloklar 54 px
   solda başlıyordu. Artık tüm içeriğe ve TEK bir değerden geliyor.
🧪 4 test: iki taraf çiziliyor · tek taraflı reddediliyor · SONRA marka aksanlı · kaçırma.
💾 `feat(render): veri ogeleri dagarcigi` · `Refs: FAZ-12.5 · §7.1`

## 12.6 — Marka işareti: yerleşim, boşluk kuralı, filigran    [x] 2026-08-17

📖 §4.3 · D-252
🔗 —
🛠 Marka işareti **hiç yok** — yalnız metin kulbu. Logo, boşluk kuralı, en küçük boy.
📁 `packages/render/src/marka-isareti.ts` + testi · `static.ts`
✅ ⚠ Boşluk kuralı işaretin KENDİ ölçüsünden türetilir (klasik: harf yüksekliği kadar),
   sabit piksel değil — 1:1 ve 9:16'da sabit piksel farklı görünür.
   ⚠ Logo süsleme DEĞİLDİR: her slayta değil, kapak ve kapanışa.
   ⚠ ⚠ **ÜÇÜNCÜ YAKLAŞIMDA ÖNCÜL DEĞİŞTİ.** İlk iki deneme eğrinin minyatürüydü: *"imza
   eğridir, öyleyse işaret de eğri"* — yanlış olan **"öyleyse"**. Eğri 1080 px'te imza,
   30 px'te çizgi. O ölçekte okuyan tek şey harf formu: mürekkep kare, oyulmuş "U".
   ⚠ **Yeni varlık YOK:** font zaten gömülü (D-252); SVG = indirme + lisans + §16 sınavı.
   ⚠ **Harf `text`, `path` değil:** canlı metinde glif ölçümü işareti de kapsıyor (R-20).
🧪 6 test: boşluk işaretin kendi ölçüsünden · en küçük boy · harf canlı metin · erişilebilir
   ad · yalnız kapak/kapanışta · kilit birlikte.
💾 `feat(render): marka isareti yerlesimi` · `Refs: FAZ-12.6 · §4.3`

## 12.7 — Kompozisyon ailesi: kapalı garanti, AÇIK aile    [x] 2026-08-17

📖 §7.1 · D-254, D-261
🛠 *"Tek çeşidi yok, binlerce çeşidi var."* Kapalı olan **garanti katmanı**, açık olan
   **kompozisyon ailesi**: düzen + efekt profili + doku + süsleme + panorama. Aileler
   veriyle tanımlanır, kodla değil; garanti katmanı hepsini süzer.
📁 `packages/contracts/src/aile.ts` + testi · `packages/kernel/src/doc/model.ts` ·
   `packages/engine/src/plan/tasarla.ts` · `packages/render/src/sablon-susleme.ts`
✅ ⚠ **Aile ESTETİK seçer, GÜVENLİK değil** — yoksa "yeni aile" her kısıtı delmenin yolu
   olur. Seçim İÇERİKTEN; rastgele olsaydı golden test kurulamazdı.
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
🛠 Chromium'un yapamadığı üç şey: Lanczos yeniden örnekleme, format/EXIF temizliği,
   **model çıktısını büyütme** (üretim 1024², karosel 1080²). Adaylar: `sharp`
   (Apache-2.0) · Real-ESRGAN (BSD-3) · BiRefNet (MIT) · VTracer (MIT).
📁 —
✅ ⚠ **KARAR GEREKİYOR:** bu adım ilk kez model ağırlığı indirmeyi getiriyor. §16 ile
   sınanmalı — *bir ay ihmal edilse de çalışır, kurtarma `git clone` + `cat`*. Ağırlık
   varlık deposunda (D-248, içerik-adresli) mi, yoksa isteğe bağlı bir yetenek mi?
   ⚠ **Lisans tuzakları kayıtlı:** BRIA RMBG **CC BY-NC** → yasak; Potrace **GPL** → yasak.
   MIT/BSD karşılıkları var, onlar kullanılacak.
💾 —

## 12.9 — Degrade ve renk geçişi yüzeyleri    [x] 2026-08-17

📖 §12.1, §7.1 · D-253
🔗 12.2
🛠 Şu an her alan DÜZ renk. `linear/radial/conic-gradient` · mesh (katmanlı radyal) ·
   grenli degrade (üstüne `feTurbulence` — bantlaşmayı gizler).
   ⚠ `temel` ailede kapalı; `akici` ailesi isteyebilir.
📁 `packages/render/src/sablon-degrade.ts`
✅ ⚠ ⚠ **TAVAN AYRI ÖLÇÜMLE DEĞİL KURGUYLA korunuyor — plandaki "her durak ölçülür"
   maddesi gereksiz çıktı.** Tavanı `ui-tema` kapısı zaten RAMPA üstünden zorluyor; durak
   tipi `RampaTokeni` olunca tavanı aşan durak TEMSİL EDİLEMEZ. İkinci ölçüm, ikinci
   doğruluk kaynağı olurdu (aile garantisi ve yuvasız görselle aynı ilke).
   ⚠ ⚠ **ASIL KUSUR duraklarda değil, durakların YERİNDEYDİ:** ilk sürüm `static.ts`te
   SABİT amber çifti yazıyordu ve dolgu rengi slayta göre dönüyor — kâğıt alan render'da
   AMBER çıktı. Metrik göremezdi; **bakınca görüldü.** Çift artık `alanRolleri`de,
   `karsiAlan`ın yanında: `motif`in türetilme dersi (aynı dosya) degradede tekrarlandı.
   ⚠ **Kâğıt alan DÜZ ve kararı RAMPA veriyor:** rampada tek kâğıt durağı var, ikincisini
   icat etmek bir render modülünün markaya renk eklemesi olurdu. `null` eksiklik değil karar.
   ⚠ Ölçüldü: dolgu 233,182,36 → 220,167,16 (derinlik okunuyor, alan çamurlaşmıyor);
   kâğıt ve mürekkep zemin bit-bit aynı kaldı. `akici` ailede AÇIK, `temel`de kapalı.
   ⚠ CSS üreteci YAZILMADI: dolgu bir `<div>` değil SVG `<path>`, ve kullanıcısı olmayan
   ikinci bir üretici sessizce eskir.
🧪 5 test + ihlal turu: `[KAGIT]` çiftine bir amber rampası verildi → kırmızı, geri alındı
   → yeşil. Testler üretilen dizgeyi değil ROLDEN TÜREMEYİ zorluyor.
💾 `feat(render): degrade yuzeyleri` · `Refs: FAZ-12.9 · §12.1`

## 12.10 — Şekil cebri ve şekilli metin akışı    [x] 2026-08-17

📖 §7.1, §7.2 · R-30
🔗 12.2
🛠 İki eksik: (a) **boole işlemleri** — birleşim/fark/kesişim, `clipPath` + `mask` +
   `feComposite` ile; kontur dağarcığı (`stroke-dasharray/linecap/linejoin`, değişken
   kalınlık). (b) **`shape-outside`** — metin bir şeklin ETRAFINDA akar. InDesign sınıfı bir
   yetenek, Chromium'da standart, bizde hiç kullanılmıyor: metin hep dikdörtgen kutuda.
📁 `packages/render/src/sekil-cebri.ts` + testi · `sablon.ts` · `static.ts` ·
   `tasarim-olcum.ts` · `scripts/gates/tasarim.mjs`
✅ ⚠ ⚠ **`shape-outside` YAZILMADI — yapısal, tercih değil.** (1) `float` bir flex
   ögesinde YOK SAYILIR ve `.icerik` bir flex sütunu. (2) `polygon()` float'ın kendi
   kutusuna göre; kutu eğriyle aynı y-aralığını kaplamazsa poligon EZİLİR ve garanti
   geometrik kurgudan bir ARGÜMANA döner. (3) Y-aralığı ancak `flex-start` yaslamada
   belirli — gramerdeki dört düzenin **hiçbiri** `flex-start` değil. Yazılsaydı:
   tüketicisi olmayan yetenek + zayıflamış garanti. Şart bir CSS numarası değil, dikey
   yerleşimin yeniden tasarımı. Boole dağarcığının kalanı da aynı sebeple yok.
   ⚠ ⚠ **AMA ADIMIN AMACI TESLİM EDİLDİ — "sınır içinde daha iyi yerleşmek".** Sütun
   artık O SLAYTIN eğrisinden türüyor: küresel %62 beş slaytın EN KÖTÜSÜYDÜ ve dördünde
   yer israf ediyordu. İçerik genişliği 582 → 606 → 630 → 655 → 679 px; ilk slayt
   değişmiyor (en kötü olan oydu). Punto tavanı ve maske çapı da bundan türüyor.
   ⚠ **Zarf PATH'TEN okunuyor, formülden değil.** `merkez - genlik` yazsaydım eğriye
   daha içeride bir kontrol noktası eklendiğinde sayı sessizce yalan olurdu — bir yorum
   bir zorlama değildir. Zarf eğriyi girdi alıyor. Kübik Bézier dışbükey zarfını aşmaz;
   zarf gerçek eğriden GENİŞ, yani yanılma yönü güvenli.
   ⚠ ⚠ **`column_in_band` KENDİ KENDİNİ ölçüyordu.** Sütun da eğri de aynı sabitlerden
   geliyordu; işaret hep aynıydı, okuma hiçbir girdide kırmızıya DÖNEMEZDİ. Şimdi ikisi
   de artefakttan: `kolonPx` DOM'daki `.icerik` kutusu, `egriPx` aynı HTML'e basılmış
   `<path>`ın zarfı — ayrı kod yolları, ayrışma görünür.
   ⚠ `floor` kullanılıyor (`round` değil): sütun tam nefes kadar geride TÜRETİLDİĞİ için
   doğru değer tam 0 ve okuma sınırın üstünde oturuyor; 0.3 px'lik `getBoundingClientRect`
   gürültüsü kapıyı kırmızıya çevirirdi. **Flaky kapı kırmızıdır** (R-80).
🧪 6 test + ihlal turu: sütun 6 puan genişletildi → beş slaytta da `column_in_band`
   64 px ile SINIR DIŞI (eski sürüm bu ihlalde YEŞİL kalıyordu), geri alındı → yeşil.
💾 `feat(render): sekil cebri ve akis` · `Refs: FAZ-12.10 · §7.1`
