# Tasarım denetimi — 2026-08-24

Kıdemli editoryal/marka tasarımcısı gözüyle on şablonun **kapak** karelerinin eleştirisi.
Kural denetimi DEĞİL: `just izgara` sıfır kusur veriyor ve bu belge tam olarak *"sıfır
kusur iyi tasarım demek değil"*in ne anlama geldiğini yazıyor.

⚠ Denetim **kapaklara** bakıldı; iç slaytlar görülmedi. Kesimden kesime ne olduğu
ayrıca denetlenecek (FAZ-19.4).

---

## Genel yargı

> *"Bu, iyi kurulmuş bir SİSTEM ama henüz bir TASARIM değil."*

- **Kapak kilidi:** on kartın dokuzunda aynı açılış hamlesi — 65 px'te mavi tire + mono
  üst başlık, altında Display başlık, altında gri gövde. Aynı x, aynı y, aynı punto
  bandı. Yani *"ayrım yerleşimden gelir"* iddiası **kapakta tutmuyor**; ayrım alt
  yarıdaki süse devredilmiş, o da sistemin en görünmez katmanı.
- **Dinamik aralık dar:** en büyük öge ile en küçüğü arasında ~6:1 ve her şey skalanın
  ortasında. Hiçbir yerde *devasa*, hiçbir yerde *fısıltı* yok. Editoryal etki tam olarak
  bu iki ucun aynı sayfada bulunmasından doğar.
- **Aksan dokuya dönüşmüş:** mavi on kartta da aynı sözdizimsel yerde (serif satırın
  içinde bir-iki kelime). Her kartta aynı yerde duran aksan, aksan değildir.
- **Fotoğraf en zayıf katman:** dört şablonda **aynı antika pirinç kronometre**; kadran
  rakamları anlamsız, kenarlar hâleli, `memphis`te havada başıboş parçalar. Metafor da
  yanlış: saatçilik nostaljisi ≠ enstrümante sanayi hattı.
- **Ölü orta:** üst blok ile alt süs birbirinden habersiz; aradaki ~400 px şekillenmemiş.
  Sayfalar **nizami** boşluk kullanıyor, *gerilimli* boşluk değil.
- **Değer adımı görünmüyor:** taşıyıcı alanlar ~%6 parlaklık farkıyla çiziliyor; telefon
  parlaklığı %50'de yoklar. Sürekliliği taşıyan şey okuyucunun göremediği şey.

---

## Şablon şablon (en güçlü / en zayıf)

| şablon | en güçlü | en zayıf |
|---|---|---|
| `akan-alan` | başlık ragı iyi kırılmış | eğri EDİLGEN: hiçbir şeyi kırpmıyor, hiçbir taban ona oturmuyor; gövde ile eğri arası 220 px şekilsiz |
| `alinti` | setin tek gerçek editoryal anı; ölçüyü sonuna kadar dolduruyor | **atıfsız alıntı** — pull-quote'un yapısı iddia→atıf'tır; ayrıca siyah kama künye şeridine TEĞET (en çirkin birleşme) |
| `dizin` | mavi ray + numaralı madde: tek gerçek bilgi tasarımı refleksi | alt yarıda üç alâkasız öge kavga ediyor; mavi hap hiçbir şeye bağlanmıyor ve en gürültülü öge; hayalet %5 opaklıkta (ne görünmez ne okunur) |
| `donen` | nesne ölçek çizgisi üstünde duruyor — en sağlam süreklilik fikri | **iki kompozisyon mantığı tek kartta**: sola dayalı blok + ortalanmış nesne, eksenler hizasız; alt yazı öksüz; siyah üstünde siyah nesne kesik görünmüyor |
| `editoryal` | setin tek gerçek figür/zemin ilişkisi — ötekiler buna bakarak yargılanmalı | fotoğraf kendi yarısını doldurmuyor, sol altta beyaz çentik (maskeleme hatası gibi); metin sütunu y≈460'ta hiçbir şeyle hizalı değil |
| `karsilastirma` | **taralı bar** = en zeki tek fikir; dürüstlüğü görsel konvansiyona çevirmiş | barlar başlığı yeniyor (%100 kroma, ~1800 px²); üç bar neredeyse AYNI uzunlukta — "karşılaştırma" hiçbir şey karşılaştırmıyor |
| `kavis` | en sıkı rag; motif kavramla uyumlu | setin **en boş** kartı (y 480→1050 hiçbir şey); iki yay rastgele kesilmiş, "ritim" değil "iki tepe" — ritim ≥3 vuruş ister. Form içeriği YALANLIYOR |
| `memphis` | açık yüzey nefes veriyor | setteki tek **bozuk** görsel: hâle, havada bağlantısız parçalar, biri zemin çizgisinin ALTINDA. Adı Memphis ama ortada Memphis yok |
| `sahne` | en sinematik kompozisyon; köşegen çalışıyor | **kırpma yanlış yerden** — en ıvır zıvır donanımdan kesiyor; siluet siyahta eriyor; ölçü çizgisi künye şeridine 30 px |
| `veri-hikayesi` | yıl hapları iyi süreklilik fikri | **grafik başlığı YALANLIYOR** — "iki katına çıkan" derken çizgi ~4°; bu zevk değil ARGÜMAN hatası. Haplar UI filtre çipi gibi |

---

## Beş müdahale (öncelik sırasıyla)

1. **Kapak kilidini kır** — `blok-yerlesimi` şablon değişkeni: `ust-sol` · `alt-sol` ·
   `orta-sag` · `tam-genislik` · `zemin-ustu`. Hiçbir durum ikiden fazla tekrarlanmaz.
   *Neden:* göz ilk 300 ms'de **siluet** okur, süs okumaz. Kompozisyon bedava ve anında
   on farklı siluet üretir. En acil: `akan-alan` · `kavis` · `veri-hikayesi` · `dizin`.
2. **Dördüncü ve beşinci ses** — `--punto-rakam` (~240–360 px, yalnız rakam/sıra/yıl/yüzde,
   asla cümle içinde) ve `--punto-not` (~13–15 px mono, kenar boşluğunda atıf/açıklama).
   Ayrıca **aksan farkında optik satır aralığı** (Display'de metrik leading yetmiyor).
   *Neden:* dinamik aralık ~6:1 ve ortada; etki eşzamanlı uçlardan doğar.
3. **Taşıyıcı süs olmaktan çıksın** — üç ilişkiden biri ZORUNLU: (a) bir taban çizgisi
   teğetinde oturur, (b) bir ögeyi kırpar/maskeler, (c) durak sistemi taşır. Değer adımı
   %6 → **≥%14**. *Neden:* hiçbir ögenin tanımadığı şekil arka plandır; arka plan
   süreklilik taşıyamaz — R-87 teknik yeşil, algısal kırmızı.
4. **Görsel yönetimi** — antika kadran EMEKLİ; yeni brief ailesi: malzemenin kendisi
   (kırık/granül/balya/talaş) makroda, makine yüzeyi 1:1, kumanda üstünde el, hat ölçekte.
   Koyu zeminde her kesik öznenin arkasına **değer plakası** ya da kenar ayrımı.
   *Neden:* fotoğraf, okuyucunun *"bu gerçek bir şirket mi"* sorusunu sorduğu katman.
5. **Aksan disiplini** — dört rol: `vurgu` · `alan` (≥%20 mavi alan, üstünde oyulmuş
   beyaz tipografi) · `isaret` (tek küçük işaret) · `yok`. Bir karoselde `vurgu` ≤2 kez,
   `yok` ≥1 kez. *Neden:* tek mavi anı işe yaratan şey **nadirliğidir**.

---

## Eksik üç arketip

- **Kapanış / imza kartı.** Hiçbir şablon bir karoseli BİTİRMEK için tasarlanmamış.
  Marka işareti display ölçekte, tek satır teklif, tek temas satırı, **ters yüzey**.
  Bugün markalama işini 20 px'lik künye şeridi yapıyor — o bir altbilgi, imza değil.
- **Kanıt / vaka kartı.** B2B sanayide en ikna edici varlık: tesis · hat · dönem · yöntem
  · sonuç · **kaynak satırı**. `claim_source` zaten Yasa 8 ama onu TASARLANMIŞ bir öge
  olarak çizen şablon yok; uyum dipnotu olarak duruyor.
- **Şema / anatomi kartı.** Mekanizmayı açıklayan kart yok: sensör hattın neresinde, ne
  nereye akıyor. Vaadi *"hattınızı ölçülebilir yapıyoruz"* olan bir şirkette eksik olan
  tam bu — ve stok görünümlü bir kesikle taklit edilemeyen tek arketip.

---

# İkinci denetim — İÇ SLAYTLAR (45 slayt)

⚠ ⚠ **ŞERİT ÜRETECİM BOZUKTU ve denetçi yakaladı.** Verdiğim on dosyanın hepsi tek
kareydi (her şablonun yalnız 1. slaydı); denetçi 45 slaydı kendisi yeniden render edip
ölçtü. **Bozuk bir aletle yapılan denetim, denetim değildir** — bu oturumda aletin
altıncı yalanı ve ilk kez bozuk veriyi başkasına verdim.

## Genel

> *"Kaydırdığınızda hiçbir şey olmuyor."*

- **45 slaydın 34'ünde** metin bloğunun sol kenarı **%6,0–%6,7** arasında. Bir karosel
  boyunca yatay kompozisyon kare genişliğinin **%0,7'sinden az** değişiyor. Bu bir şablon
  değil bir **FORM**: içerik alanlara dolduruluyor, göz kaydırdığını fark etmiyor.
- **Süreklilik teknik olarak gerçek ama ANLAMSIZ:** eğri/kemer/kama kesimi gerçekten
  aşıyor, ama hiçbirinin üstünde bir şey durmuyor, hiçbiri bir sayıya bağlı değil.
  Süreklilik **duvar kâğıdı** olarak kuruluyor, kanıt olarak değil.
- **Ölü kuşak bir kalıp:** `veri-hikayesi` 2-3-4'te boşluk **y=%47,6**'da başlıyor —
  virgülden sonrası dahil aynı. `memphis` 3-4-5-6'da **%35,2**. Ritim değil, kalıp.
- **KAPANIŞ EN BOŞ KARE:** `sahne-04` %2,4 · `donen-04` %3,4 · `memphis-06` %3,3 ·
  `dizin-04` %4,5 mürekkep. Karoselin tepe yapması gereken yerde sistem düz çiziyor —
  *"içerik bitti"* diyor, *"vardık"* demiyor.
- `kavis` kemerleri **#0a0a0a üstüne #1a1a1a ≈ %4 kontrast**: JPEG sıkıştırması öldürür.
  Şablonun tek yapısal fikri görünmüyor.
- **Şablonlar birbirini tekrar ediyor:** aynı 48/23 çifti hem `karsilastirma` 4'te hem
  `veri-hikayesi` 3'te, aynı boyda.
- **Meta metin:** *"Göz üçüncü karede düzeni öğreniyor"* — şablon kendinden bahsediyor.

## En zayıf slaytlar

| şablon | en zayıf | sebep |
|---|---|---|
| `veri-hikayesi` | 5 | çubuk paneli 2. slaytınkinin aynısı; kilometre etiketleri eğriye DEĞMİYOR |
| `akan-alan` | 2–6 tek slayt gibi | altı karede SIFIR bilgi ögesi; "beş şart" deniyor, 01–05 hiçbir yerde yok |
| `sahne` | 4 | %2,38 mürekkep — setin en boşu; y%93 ölçek çizgisi cetveli KESİYOR |
| `memphis` | 4 | %3,87; altı slaytta iki fotoğraf, hep alt-orta hep aynı ölçekte; 6'da ton kırılıyor ama düzen aynı |
| `donen` | 4 | koyu kapanışta koyu nesne eriyor; 3. slayt 1'in aynı fotoğrafı; ölçek çizgisi gövdeyi kesiyor |
| `editoryal` | 3 | %2,46, görselsiz — **yükleme hatası gibi**; görsel zikzağı bozuluyor (sol/sağ/—/sağ) |
| `kavis` | 3 | kemerler yalnız süs; vafel ızgarası havada asılı; 13 kemer ↔ 13 kare kafiyesi HİÇ gösterilmiyor |
| `alinti` | 3 | 2'nin birebir iskeleti; kama **tırmanırken kesiliyor**; alıntı KİME ait belli değil |
| `karsilastirma` | 3 / 4 | 48 ile 23 **aynı puntoda yan yana** — eşit ağırlıkta iki rakam karşılaştırma değil LİSTEDİR |
| `dizin` | 2 | dört adımlık dizin her karede TEK satır gösteriyor; ok başsız-uçsuz, yön okunmuyor |

## Beş müdahale

1. **Sabit iskeleti kır — slayda ROL ver.** En az üç sol pay (%6/%26/%50), üç başlık
   ölçeği (tam/0,72/0,45), üç dikey hizalama. **Art arda iki slayt aynı üçlüye sahip
   olamaz.** Tek kural, setin en büyük hastalığını bitirir.
2. **Süreklilik ögesini VERİYE bağla.** Eğrinin i. slayttaki yüksekliği o adımın sayısı
   olsun; kilometre etiketi eğrinin ÜSTÜNDE dursun. `kavis`te 13 kemer ↔ 13 vafel karesi
   x ekseninde hizalansın. Geometri iddianın KANITI olsun.
3. **Orta kuşağı doldur.** Panolar y≈%75'ten %45–60'a insin ve sürekli ögeye DEĞSİN.
   Kapı: art arda iki slaytta en uzun boş bandın başlangıç y'si %8'den yakın olamaz.
4. **Panoyu süsten bilgiye çevir.** `dizin` dört maddenin DÖRDÜNÜ göstersin (üçü sönük,
   biri yanık). `karsilastirma` 48/23'ü ÖLÇEKLİ versin. `veri-hikayesi` 5. slaydın paneli
   tekrar — tipi değişsin ya da slayt silinsin.
5. **Yapısal ögelere kontrast tabanı; çakışanı sil.** Görünmeyen yapı, yapı değildir.
   Ölçek şeridi görselin siluetiyle çakışıyorsa o slaytta çizilmesin. Meta metinler
   temizlensin.

## Kapanış slaytı — somut tarif

Kapanış **iskeleti kullanmaz, KIRAR.** Şerit yok, üç satır başlık yok, alt pano yok.

- **y %0–28 · Varış.** Sürekli öge burada BİTER: tanımlı bir uçta durur, ucu dolu daireyle
  işaretlenir, oradan sağ kenara yatay kural. (`alinti`de kama tırmanırken kesiliyor —
  tam tersi.)
- **y %30–56 · Tek iddia.** Karoselin tek sayısı, cap-height ~300–360 px. Altında TEK
  satır 24 px: neyi ölçtüğü + `claim_source` (§11.4 zaten şart koşuyor).
- **y %58–74 · Güzergâh.** Önceki karelerin şerit etiketleri mini dizin olarak, hepsi eşit
  sönük — "yolun tamamını bir arada gör". Kapanışa özel.
- **y %78–92 · İmza + TEK eylem.** Marka işareti gerçek boyda (12 px ayak metni değil),
  tek satır tek çağrı. İkinci seçenek yok.
- **Ton kırılması** tam bu karede: parmak kaydırınca ton değişir — fiziksel "vardık".
- **Taban: kapanış karesinin mürekkep oranı ≥ %12.** Bugün dördü de kendi karoselinin en
  boş karesi. Bu tek eşik dört şablonu birden düzeltir.

---

# Bağımsız ölçüm — slayt başına mürekkep oranı

Denetçinin kapanış sayıları **kendi aletimle doğrulandı** (ikinci bir ölçü, aynı sonuç):

| şablon | slayt başına % | kapanış | not |
|---|---|---|---|
| `akan-alan` | 28,9 · 37,4 · 35,4 · 43,7 · 33,7 · 42,4 | 42,4 | tek yoğun set |
| `karsilastirma` | 17,7 · 24,6 · 38,4 · 48,7 | 48,7 | artan — doğru yön |
| `alinti` | 12 · 19,2 · 26,6 | 26,6 | artan |
| `editoryal` | 22,7 · 21,4 · **2,4** · 22 | 22 | 3. slayt çöküyor |
| `veri-hikayesi` | 4,7 · 8,5 · 6,9 · 6,9 · 9,5 · 6,9 | 6,9 | baştan sona düşük |
| `donen` | 7,1 · 8,7 · 12,7 · **3,3** | 3,3 | ⚠ kapanış en boş |
| `memphis` | 7,8 · 4,2 · 9 · **3,5** · 8,6 · 3,5 | 3,5 | ⚠ kapanış en boş |
| `dizin` | 8,6 · 4,7 · 5,3 · **4,7** | 4,7 | ⚠ kapanış en boş |
| `sahne` | 6,2 · 4,7 · 3,8 · **2,1** | 2,1 | ⚠ setin en boş karesi |
| `kavis` | 3,6 · 5,6 · 5,2 · 4,5 | 4,5 | baştan sona sönük (~%4 kontrast) |

⚠ **`editoryal` 3. slayt %2,4** — denetçinin *"yükleme hatası gibi duruyor"* dediği kare;
bağımsız ölçüm doğruladı.

## Açık kusur: kapanış imzası eklendi ama YETMEDİ ve KUSURLU

Kapanış kartlarına marka kilidi + tek çağrı eklendi (dört şablon). Ölçüm: `sahne`
2,1 → **2,8** · `donen` 3,3 → **3,9** · `memphis` 3,5 → **4,3** · `dizin` 4,7 → **5,3**.
Hedef %12; **yetmedi.**

Çizildi ve BAKILDI — üç kusur:
1. Marka kilidinin `Upcytech` etiketi kutunun **dışına taşıyor** ve sağa kayıyor
   (`markaKilidi` ölçü/hizalama hatası).
2. Kilit ile çağrı satırı arasında hiyerarşi yok — ikisi de "orta ağırlık".
3. Üst blok ile imza arasında **~600 px ölü kuşak**; imza boşluğu kapatmıyor.

**Sebep:** denetçinin kapanış tarifinde asıl ağırlığı **300–360 px cap-height'lik tek
rakam** taşıyor. İmza tek başına o boşluğu dolduramaz — `--punto-rakam` sesi kurulmadan
kapanış tamamlanamaz. Bu, müdahale sırasının neden bağlayıcı olduğunun kanıtı: imzayı
rakamdan ÖNCE eklemek, yarım bir kapanış üretti.

---

# Üçüncü denetim — ZANAAT / FİNİŞ (Photoshop üstadı gözü)

> *"Yazılım çıktısı. Ve bunu söyleten şey kompozisyon değil — kompozisyon aslında düzgün.
> Söyleten şey **hiçbir yüzeyin bir ışık kaynağı bilmemesi.**"*

**On karede tek bir gölge yok. Tek bir tonal düşüş yok. Tek bir gren tanesi yok.**

## KÖK SEBEP: aletler yazılmış, ŞALTERLERİ İNİK

| Mekanizma | Nerede | Durum |
|---|---|---|
| `temas-golgesi` | `gorsel-islem.ts:188` | yazılmış, dokümante, **hiçbir aile çağırmıyor** |
| `tema-uyum` (renk derecelendirme) | `gorsel-islem.ts` | yazılmış, **kapalı** |
| `matlama` (luma anahtarı) | `gorsel-islem.ts` | yazılmış, **kapalı** |
| `ustDoku` (gren + vinyet) | `panorama.ts:1517-1525` | **hiç çağıranı yok** |
| `grenKatmani()` | `zemin.ts:120-127` | yazılmış, kullanılmıyor |

**Doğrulandı:** `packages/contracts/src/aile.ts` — sekiz ailenin sekizi de
`gorselIslemleri: ['keskinlik', 'duotone']`. Yani *"kesik özne havada duruyor"* sorununun
çözümü kodda hazır ve şalter inik.

⚠ `zemin.ts:175-183`'te gren gücünün ölçüm defteri ZATEN var: grensiz en uzun bant
**36 px**, `overlay` grenle **8 px**, `normal` ile 3 px. Yani doğru değer ölçülmüş,
kullanılmamış.

## Zemin — bugün tek düz dolgu

`#0E0E0E` kart `#1C1C1C` + 1 px hairline. Siyah **ölü değil** (0.105 doğru seçim, saf
`#000` JPEG'de blok kırardı) — sorun siyahın değeri değil, **tek değer olması**.

Önerilen dört katman: taban dolgu · ışık kaynağı (`radial-gradient ellipse 70% 55% at
72% 38%`, `screen`, 0.055→0.018→0) · vinyet (merkez %52'ye kadar şeffaf, kenarda 0.38) ·
gren (`grenKatmani(3.5)`, `overlay`, kartların **ÜSTÜNDE** — altta duran gren her opak
yüzeyde yok olur).

## Tipografi zanaatı — font seçimi DOĞRU, ayarlar amatör

- **Satır aralığı Türkçe için yanlış.** `aile.ts`'de sekiz ailenin tabanı **1.0**'dan
  başlıyor. Latin display'de normal, **Türkçede değil**: Türkçe hem üstte (İ Ö Ü ğ) hem
  altta (Ş Ç ş ç, g y p j) çıkıntı taşır — satır kutusunun İKİ ucu da dolu.
  Ölçülen çarpışmalar: `sahne` "göstermekle" `g` ↔ "başlar" `b`; `alinti` "şeyi" `ş` ↔
  "iyileştiremezsin" `i` noktaları ~10 px; üretim slayt 03'te `ş` ↔ `ö` iç içe.
  **Öneri: 1.0 → 1.18 · 1.05 → 1.20 · 1.1 → 1.22 · kapak serif 1.24.**
- **`locl` kapalı.** `OPENTYPE_CSS = "kern" 1, "liga" 1, "calt" 1` — `locl` yok ve
  `lang="tr"` tek başına yetmiyor. `fi` ligatürü bağlanınca **noktalı i'nin noktası
  kaybolur** ve Türkçede `fi` ≠ `fı`. Öneri: `"locl" 1, "tnum" 1` eklensin.
- **Rakamlar oransal** — künye `01 / 04` kaydırırken zıplıyor. `tabular-nums` şart.
- **Optik hizalama yok:** yuvarlak glif (`O Ö C Ç G S Ş 0`) satır başında içeri kaçmış
  görünüyor. Öneri: `margin-left: -0.018em`, tırnak için `-0.055em`.
- **Aksanlı kelime optik olarak İNCE** görünüyor (koyu zeminde düşük luminanslı renk daha
  az yayılır). Öneri: aksana `font-weight` +25 ya da `text-stroke: 0.35px`.

## Kesik özne — retoucher'ın ilk üç müdahalesi

1. `temas-golgesi` + `matlama` + `tema-uyum`'u sekiz ailede AÇ (tek satır) + `.gorsel.kesik`
   altına ambient occlusion (`ellipse 46% 3.5%`, `rgba(0,0,0,0.55)`, blur 26 px).
   **Temas gölgesi dar-koyu, AO geniş-yumuşak: ikisi farklı iştir.**
2. Kenar dekontaminasyonu: `feMorphology erode radius=0.8` + alfada `blur 0.5` — rembg'nin
   beyaz saçağı ve kopuk maske adaları temizlenir.
3. **Işık yönü sabitlensin** (prompt'ta sol üst 35°) ve kareler arası kutup tutarlılığı
   ölçülsün: desteki karelerin p50 luması ±25'ten fazla ayrılıyorsa kapı kırmızı. Bugün
   R-96 yalnız özne-zemin ayrışmasına bakıyor, **kareler arası tutarlılığa bakmıyor.**

⚠ **Mavi şeridin z-sırası YANLIŞ:** `bant-ok` öznenin ÜSTÜNDEN geçiyor (`.gorsel`
`z-index: 4`, şerit onun üstünde). Üstten geçen çizgi "bağlantı" değil **fosforlu kalem
lekesi** okunuyor. Şerit `z-index: 3`'e insin, özne onu KESSİN — kesilen çizgi derinlik
kurar.

## Degrade yasağı — karar doğru, KAPSAMI yanlış

> **Süs degradesi** bir yüzeyi *renklendirir.* **Optik degrade** bir *ışık kaynağını, bir
> teması ya da bir mesafeyi* tarif eder.

Gölge bir degradedir. Vinyet bir degradedir. AO bir degradedir. Bunlar dekorasyon değil
**fizik**. D-318 süs degradesini haklı olarak kesti ama fiziği de kapattı — karelerin
havada durmasının sebebi bu.

**Üç ada açılsın, gerisi kapalı kalsın:** temas gölgesi · vinyet · ışık kaynağı.
Dört zorunlu kısıt: (1) **renksiz** — yalnız siyah/beyaz alfa, marka rengiyle degrade YOK;
(2) **gren zorunlu** (`≥3`) — `#1C1C1C → #0E0E0E` sadece ΔL 0.06, grensiz bantlanır ve
**degrade yasağının gerçek sebebi büyük ihtimalle buydu**; (3) karede en çok **iki** optik
degrade; (4) doğrusal degrade yalnız `alanSiniri` için.

## Küçük ama görünür

- `dizin`de **renkli emoji** (⚖️) — monokrom sistemde tam renkli glif. `ikonSvg` zaten var.
- `karsilastirma` bar rayları eşit değil (873 / 871 / 901 px).
- Tarama deseni semantiği TERS: "tahmin" barı ölçülmüş barlardan görsel olarak **daha ağır**
  okunuyor — en zayıf veri en çok bağırıyor.

---

# Dördüncü denetim — SEAMLESS PANORAMA (kendi incelemem)

⚠ Zanaat denetçisine seamless soruları gönderildi ama **ajan öldü, cevap gelmedi.** Altı
panorama elle incelendi.

- **`akan-alan` (6480×1440):** Altı kart yan yana dizilmiş, panorama olarak tasarlanmamış.
  Altı başlık aynı yükseklikte, altı gövde aynı hizada — **tek yatay bant**. Dalga alt
  yarıyı kaplıyor ve hiçbir şey taşımıyor; iki tepesi altı slayda yayıldığı için slayt
  başına düşen şey neredeyse düz çizgi. "Beş şart" deniyor, 01–05 hiçbir yerde yok.
- **`editoryal` (4320×1440):** 3. slaytta görsel yok; ritim *nesne → nesne → boşluk →
  nesne*. Kesilmiş karede fark edilmiyor, panoramada delik apaçık.
- **`dizin` (4320×1440):** Üç mavi "ok" aslında **üç aynı leke** — aynı şekil, aynı uzunluk,
  başsız uçsuz, hiçbirini hiçbir şeye bağlamıyor ve kesimleri anlamlı aşmıyor. "Sıra"
  satırları üç ayrı yükseklikte (y≈425 / 308 / 390), 4. slayt formatı bırakıyor. **Dizin
  hiçbir yerde bir arada görünmüyor.**
- **`karsilastirma` (4320×1440):** **Setin tek gerçek panoramik jesti** — köşegen alan
  sınırı 4320 px boyunca tek hareketle süpürüyor, değer adımı görünür. Ama o köşegen BOŞ
  alanı süpürüyor: çubuk paneli yalnız 1. slaytta, 2-3'ün alt yarısı bomboş.
- **`sahne` (4320×1440):** İki "olay", iki "boşluk". Nesneler 1↔2 ve 3↔4 kesimlerini aşıyor,
  ortadaki kesimde yalnız saç teli ölçek çizgisi — panoramada görünmüyor. ⚠ 4. slaydın
  metni ötekiler kadraj ortasındayken TEPEYE fırlamış: kapanış bloğunun `margin-top:auto`'su
  içeriği ayırmış — kasıtlı varyasyon değil, **yan etki**.
- **`veri-hikayesi` (6480×1440):** Setin **en zengin** işi — altı slaytta da gerçek veri
  paneli. Ama panorama **iki yatay şerit**: altı başlık üst bantta, altı panel alt bantta.
  Ve eğri "iki katına çıkma"yı göstermiyor; 6480 px boyunca hafif bir rampa. Yıl pulları
  eğriye değmiyor — eksen değil lejant.

⚠ ⚠ **GÖRSEL AYNILIĞI ŞABLON KUSURU DEĞİL — ÖLÇÜM DÜZENEĞİMİN KUSURU.** Izgara aynı iki
koşu görselini bütün şablonlarda döndürüyor. İlk denetimin *"dört şablonda aynı antika
kronometre"* bulgusu bu yüzden **geçersiz**. Görseller her koşuda konuya göre yeniden
üretiliyor; asıl soru şablonun hangi görseli İSTEYECEĞİ, yani `briefTemeli`.
