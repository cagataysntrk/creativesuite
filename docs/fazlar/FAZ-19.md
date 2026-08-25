# FAZ 19 — Tasarım fazı: nizamiden ETKİLEYİCİYE

**Amaç:** On şablon kurallara uygun ve `just izgara` sıfır kusur veriyor. Bu faz onu
**tasarım** olarak yükseltir: Photoshop seviyesinde yüzey, gerçek ışık, gerçek tipografi
zanaatı — **HTML-CSS görünümünden çıkış.** Sonra sistem temizlenir ve on iki karosel
**panelden** üretilerek sistemin çalıştığı kanıtlanır.

**Yöneten kararlar:** D-318 (degrade — KAPSAMI DEĞİŞTİ, bkz. 3) · D-319 · D-347 · D-348
(tuval 3:4) · R-107 · `LOOP§H` (panelden bak) · Yasa 11 · Yasa 13 (D-268)

> **Tek cümlelik teşhis** (zanaat denetçisi): *"Yazılım çıktısı. Ve bunu söyleten şey
> kompozisyon değil — kompozisyon aslında düzgün. Söyleten şey **hiçbir yüzeyin bir ışık
> kaynağı bilmemesi.**"* On karede tek gölge yok, tek tonal düşüş yok, tek gren tanesi yok.

---

## 0 · DEPO SAHİBİNİN TALEBİ — bağlam sıfırlansa da bu kalır

- **Döngü:** `/loop`, tur başına en fazla 70 sn. Commit'te durma. *"Ben PC başında değilim."*
- **Kanıtsız "bitti" yok.** Doğrulama komutu çalıştırılır, gerçek çıktı gösterilir.
- **BAKARAK kontrol.** *"Görmeden iş yapmam."* Her değişiklik çizilir ve GÖRÜLÜR.
- **Kural değil ESTETİK.** *"Estetik ve tasarımsal design gözü."* Sıfır kusur ≠ iyi tasarım.
- **Boş alan kuralla ölçülmez.** Ölçüm teşhis içindir, yargı gözdedir.
- **PC/HTML-CSS görünümü YASAK.** *"Kareler kutucuklar ögeler html css gibi çünkü öyle."*
- **Gerekirse kütüphane kur, hazır görsel al, webden araştır.** PS seviyesi için elzem.
- **Şablonlar birbirinin aynısı olmayacak** — on şablona on ayrı tema.
- **Marka renk/font zorunluluğu YOK.** Uyumlu olmak aynısını kullanmak değil.
- **YAYIN YOK.** `yayinla` adımına geçilmez; kalan tüm kapılar agent tarafından geçilebilir.
- **BULGU → BELGE → FAZ SIRASI.** Bulgu görülür görülmez düzeltmeye başlanmaz.
- **Panelden kontrol ŞART** (`LOOP§H`): Playwright ile `#/gecmis`, Üret, Varlıklar.
- **Denetim ajanına SEAMLESS tuval verilir**, dilimlenmiş kare değil. *"Biz önce seamless
  tam yatay üretip onu kırpıyoruz."*
- **Ajanı kaybetme:** rapor gelir gelmez sıradaki brif gönderilir, brifler diske yazılır.
  **Raporu KOPYALA, yeniden yazma** — yazmak bağlamı yakar ve kanıtı bozar.
- **Sıra:** şablonlar mükemmelleşecek → sistem/geçmiş temizliği → panelden 3 tanıtım
  karoseli → 9 karosel daha → **dur ve depo sahibini bekle**.

---

## 1 · HANGİ BELGE NEREDE — önce bunlar okunur

| Belge | İçinde ne var |
|---|---|
| **`docs/referans/tasarim-tanisi-2026-08.md`** | **Bu fazın değer defteri.** Ölçülen tanı · tasarım yargısı (dört denetimin özü) · on tema tablosu · **adım adım uygulama reçetesi** (19.4–19.9 tam değerleriyle). Faz dosyası NE der, orası HANGİ DEĞERLE der. |
| `docs/referans/seamless-arastirma-2026-08.md` | Üç ajan çıktısının **BİREBİR KOPYASI** (1554 satır). Satır 985'ten sonrası **AŞAMA 2 — REÇETE**: `0` tanı · `0.1` teknik sabitler · `0.2` font · `0.3` palet · `A` on tema · `B` şablon şablon reçete · `C.1`–`C.8` ortak altyapı · `D` ilk beş iş. |
| `docs/referans/tasarim-denetimi-2026-08.md` | **Dört denetim**: kapak kompozisyonu · 45 iç slaydın anlatısı · zanaat/finiş (PS üstadı) · seamless panorama. |
| `docs/kurallar/TASARIM.md` · `OLCUMLER.md` | R-83…R-113 · bir kuralın sayısı NEREDEN geldi |
| `docs/BORCLAR.md` · `DURUM.md` | D24 · D25 · D26 · D27 · makine-okunur durum |

---

## 2 · YAPILDI

- **Tuval 1080×1440 (3:4)** — D-348. Ölçüldü sonra yapıldı; 2184 testin yalnız biri
  kırıldı (eski kararı kodlayan test). Bütçe tavanındaki kusur **36 → 24**.
- **Görsel işlemleri AÇILDI** — sekiz ailenin sekizi de `['keskinlik','duotone']`
  kullanıyordu; `matlama` · `tema-uyum` · `temas-golgesi` yazılmış, test edilmiş ama
  **çağıranı yoktu**. **Bugünkü en büyük görsel kazanç, tek satır.**
- **Gerçek logo** — elle çizilmiş "U" panoramadan çıktı; `isaret-{koyu,acik}.png` geldi.
- **Düzen provası** (D-347) hatta: düzen sığmadan tek görsel üretilmiyor.
- **JPEG damgası** — hat JPEG'e geçtiğinden beri `gorsel-yargi`da ölüyordu; düzeltildi.
- **Emekli hat kapatıldı** — `instagram-carousel` üç yerden birden.
- **`kavis` kemer 5 → 13** (12 YANLIŞTI: N 4'e bölünürse kesim kemer SINIRINA düşer).
- **Atıf kapısı** birebir kopyalanan raporu doğrulayamıyordu; **belgenin kendi ilan ettiği**
  `ATIF-KAPISI: HARİCİ KOPYA` işareti eklendi, atlanan dosya adıyla bildiriliyor.
- **Kapanış kartı GERİ ALINDI** — ve geri almak DOĞRUYDU: ölçüm imzanın tek başına
  yetmediğini gösterdi (`tasarim-tanisi` 4.2). Uygulaması 19.7'de, `--punto-rakam`'dan sonra.

---

## 3 · DEGRADE YASAĞI — KAPSAM DEĞİŞTİ

Depo sahibi açık yetki verdi: *"tam izin tam yetki serbestsin bu malca kuralları
aşabilirsin tasarım konusunda."*

> **Süs degradesi** bir yüzeyi *renklendirir.* **Optik degrade** bir *ışık kaynağını, bir
> teması ya da bir mesafeyi* tarif eder. Gölge, vinyet, ambient occlusion — bunlar
> dekorasyon değil **fizik**.

**Serbest:** temas gölgesi · vinyet · ışık kaynağı · tonal düşüş.
**Hâlâ istenmiyor:** marka rengiyle yıkanmış atmosferik tint.
**Dört kısıt:** (1) renksiz — yalnız siyah/beyaz alfa; (2) gren zorunlu (σ≥1.5);
(3) karede en çok iki optik degrade; (4) doğrusal degrade yalnız `alanSiniri` için.

⚠ **Yasağın gizli bedeli:** `zeminCss` greni **yalnız degrade varsa** ekliyor
(`zemin.ts:168`, `degradeVar`). Degrade yasaklıyken bu koşul hiç sağlanmadı — **on
şablonun hiçbirinde gren yok.** Yasak, kendisini telafi edecek tek mekanizmayı da
kapatmış. Zanaat denetçisi aynı yere bağımsız vardı: yasak bir SEMPTOMU tedavi ediyordu,
hastalık grensizlikti.

---

## 4 · TANI — beş cümle, tamamı `tasarim-tanisi-2026-08.md`'de

1. **Zeminler düz** — on kapağın modal RGB kaplaması %67,7–%92,3, on şablon DÖRT renk.
   Kendi aletimle doğrulandı. → ✅ 19.4
2. **Kapanışlar setin en boş kareleri** (`sahne` %2,1 · `donen` %3,3; hedef ≥%12) —
   tepe yapacağı yerde sistem düz çiziyor. → 19.7 kapanış kartı
3. **Şablon farkı KATALOGDA var, RENDER'DA yok** — "tam kaplama fotoğraf", "dev hayalet
   rakam", "geometrik leke", "kemer dizisi" çizilmiyor. Yasa 13'ün (D-268) yarısı
   uygulanmıyor. → yüzey aileleri ✅, kalanı 19.7/19.8
4. **Akış taşıyıcısı fiilen yok** — ikisi çalışıyor, ikisi siyah üstüne siyah, ikisi
   sürekliliği AKTİF kırıyor. R-87 VARLIK ölçüyor, GÖRÜNÜRLÜK ölçmüyor. → ✅ 19.4 + 19.7
5. **Kapak kilidi** — on kartın dokuzunda aynı açılış; 45 slaydın 34'ünde sol kenar
   %6,0–6,7; dinamik aralık ~6:1. → 19.7 `blok-yerlesimi`

⚠ **Doğrulanacak:** "elle çizilmiş U" bulgusu panorama için ESKİMİŞ ama `static.ts:748`
hâlâ `markaKilidi()` çağırıyor. ⚠ **"Aynı antika kronometre" GEÇERSİZ** — ızgara aynı iki
koşu görselini döndürüyor; asıl soru `briefTemeli` (19.8).
## 5 · ADIMLAR

Her adımın **tam değerleri** `docs/referans/tasarim-tanisi-2026-08.md` → *UYGULAMA
REÇETESİ*'nde; şablon şablon zemin CSS'i `seamless-arastirma-2026-08.md` `B`'de.

### 19.1 — Tasarım denetimi: DÖRT KATMAN    [x]
Kapak · 45 iç slayt · zanaat/finiş · seamless panorama.
⚠ **İlk üç brifi ben yanlış yazdım** (kompozisyon sordum, zanaat sormadım; kesilmiş kare
verdim, seamless tuval vermedim) ve **şerit üretecim bozuktu, denetçi yakaladı.**
*Bozuk bir aletle yapılan denetim, denetim değildir. Denetimin kalitesi brifin kalitesidir.*

### 19.2 — Bağımsız araştırma    [x]
RAPOR 1 + RAPOR 2 birebir kopya. Bu adımda sekiz ailenin görsel işlemleri açıldı.

### 19.3 — TATBİK reçetesi    [x]
AŞAMA 2: ölçülen tanı · teknik sabitler · font elemesi · beş palet · on tema · şablon
şablon reçete · ortak altyapı · ilk beş iş. Brif: `scratchpad/asama2-brief.md`.

### 19.4 — ZEMİN VE YÜZEY    [x]
**GREN ✅** koşulsuz, luminansa bağlı, JPEG'ten sağ çıkıyor. Ölçüm: `OLCUMLER.md`.
Zincirin **on ikinci kopukluğu:** `zeminDokusu`/`ustDoku` yazılmış, üreticileri yoktu.
- Gren **kartların ÜSTÜNDE**: `zeminDokusu` opak kartın altında kalıyor. *Film greni
  sahnenin değil FİLMİN özelliğidir.*
- **Kip de luminansın fonksiyonu:** kâğıtta düz blokların **%87'si σ<0,5**; `normal` @0,10.
- **Sonuç:** modal kaplama %67,6–%90,7 → **%8,8–%17,1**; σ 2,26–3,85, q=90'da 1,62–3,61.

**TAŞIYICI ✅** — `kavis` 1,16:1 → **1,66:1**, `akan-alan` 1,32:1 → **2,65:1**.
`yuzeyAdimi()` zeminin KENDİ metin renginden türetiyor; sabit token iki kutupta olmaz.

⚠ ⚠ **REÇETENİN SIRASI YANLIŞ ÇIKTI — ÖLÇÜMLE.** Eğri görünür yapılınca
`sus-metni-kesiyor` kırmızı döndü: eğri `ustBaslik` kutusunun **%99,3'ünün** arkasından
geçiyormuş. Görünür taşıyıcı, metin kutusu maskesi kurulmadan çizilemez → **5. İŞ 3.
SIRAYA ALINDI.**

**✅ 5. İŞ BİTTİ, iki engel de kalktı.** `metinMaskesi()` bant KONTURLARINI metin
kutularından deliyor (dolgu delinmez — delik zeminin renginde dikdörtgen bırakır); çizgi
**6 px**, dolgu `yuzeyAdimi(26)` (L 0,3506 / zemin 0,14, en kötü ΔL 0,60). `karsilastirma`
sınırı da görünür (ΔL 0,165 · eşik 0,06). ⚠ Aynı sınıf üç kusur daha: **kapılar · denetim
· aile merceği** üretimin düzenini ölçmüyordu; üçü de artık üç sayfa adımını koşuyor.

**BEŞ YÜZEY AİLESİ ✅** — kapalı dağarcık, her biri bir şablonda: `kagit`(editoryal) ·
`tas`(alinti) · `beton`(kavis) · `celik`(karsilastirma) · `halftone`(memphis). σ: düz 2,26
· kâğıt 4,72 · taş 5,10 · beton 5,00 · halftone 10,00 · **çelik 0,69** (tek yönlü).
⚠ `tas`/`beton` σ'da ayrılmıyor — ayrımın yeri RENK (19.6).
⚠ İki deneme geri çevrildi: tam kaplama `contrast(20)` R-96'yı kırdı, düzenli fırça izi
yasaklı "html css deseni" üretti.

**✅ ÜÇ KALEM DE KAPANDI.** **Işık:** `tip: 'isik'` tanımlıydı, on şablonun SIFIRI
istiyordu (13. zincir kopukluğu); `.ust-isik` kartların üstünde, α eşikten geriye
hesaplandı (tahmin ΔL 0,028 = görünmez → 0,061). **JPEG:** kalite dört yerdeydi, tek yere
toplandı (92 · taban 90) ve kapıya bağlandı. **Zemin reçeteleri:** atıf yanlıştı, doğru
bölüm **A/Eksen 1**; grain ölçülüydü, **vinyet malzemeye bağlandı** (kâğıt 0,11 · çelik
0,14 · taş 0,20 · beton 0,23), **kenar sütunu reddedildi** — kart başına çerçeve kesimi
GÖRÜNÜR yapar.

### 19.5 — TİPOGRAFİ    [ ]    ← aile + satır aralığı + optik hiza BİTTİ
**✅ Archivo** (gövde + bölüm başlığı, `wdth 62–125`) · **Literata** (kapak serifi, wght
400) · **Martian Mono**. `scripts/font-denetim.mjs` raporun HER elemesini bağımsız üretti:
`IBM Plex`/`Inter` `latn/TRK` YOK, `Stardos`/`Share Tech` 10/15. ⚠ **Big Shoulders
evrensel bölüm başlığı OLAMADI** — dar poster yüzü dar sütunda hiyerarşiyi tersine
çeviriyor. Stencil + Young Serif ölçüldü, geçti, **çağrı yeri yok diye girmedi**.
**✅ Satır aralığı 1,18** — mürekkep ölçüldü: `sahne` **−4 px** (biniyordu) → **+17 px**.
**✅ `locl`+`tnum`** · **✅ Optik hizalama** (pay bloğa değil YIĞINA, `em` değil PİKSEL).
**KALAN:** aksana ağırlık telafisi, şablon şablon tipografi.
**Dördüncü ve beşinci ses:** `--punto-rakam` (240–360 px, yalnız rakam) ve `--punto-not`
(13–15 px mono). ⚠ **Bu adım 19.7'nin kapanış kartından ÖNCE gelir** — sırası ölçümle
kanıtlandı: imzayı rakamdan önce eklemek yarım bir kapanış üretti.

### 19.6 — RENK    [ ]
Cusp-takipli rampa (`C ≤ maxC(L)×0.85`) · **iki nötr rampa** (sıcak kâğıt h=75 / soğuk
çelik h=250 — saf 0-kroma biter) · beş palet token'a girer · marka mavisi üstüne beyaz
metin yasak (4.07 < 4.5) · **aksan disiplini** dört rol (`vurgu` ≤2, `yok` ≥1).
*Tek mavi anı işe yarayan şey nadirliğidir.*

### 19.7 — KOMPOZİSYON VE SEAMLESS AKIŞ    [ ]
Kapak kilidini kır (`blok-yerlesimi`) · slayda ROL ver (üç sol pay, üç başlık ölçeği, üç
dikey hiza; **art arda iki slayt aynı üçlüyü kullanamaz**) · **z-sırası sözleşmesi ✅**
(zemin 0 · taşıyıcı 1 · leke 2 · durak 3 · gren 4 · görsel 5 · vinyet 6 · metin 7;
`.bant-ok` 5→1, **özne şeridi KESİYOR**) · ⚠ **KALAN:** yastık ölçümde ÇÜRÜDÜ (%9,2 →
%9,2; `blur(26px)` 69 px'lik kutuyu yarı saydam yapıyor + hale + R-81) — doğru çözüm
maske ve o CSS kuralı değil, `duzenProvasi` ölçümünü render'a taşıyan ADIM · **yüzey
kesimden ÇIKTI ✅** (dönüş kartın son %30'unda; merkez OLAMAZ, metin kutbu kart
zemininden türüyor) · **künye şeridi artık PANORAMANIN ✅** — asıl dikişi o atıyordu:
yüzey 3–24'e inince şerit hâlâ **636** · sürekliliği **VERİYE bağla** · orta kuşağı doldur
· R-87 ölçülebilir olur · **marka işareti karosel başına TAM İKİ KEZ** (künye şeridindeki 20 px
logo kalkar — imza değil duvar kâğıdı) · **KAPANIŞ KARTI iskeleti KIRAR** (varış · tek
iddia 300–360 px · güzergâh · imza · ton kırılması · mürekkep ≥%12).

### 19.8 — GÖRSEL DİLİ VE YÜZEY ZANAATI    [ ]
**"Kutu değil yüzey"** altı kuralı: `border-radius` 0 ya da ≥28 px (✅ etiket çipi) · saf
renk yok · düz gölge yok · kenar bozma yalnız dekoratif ögede, `scale ≤ 4` · **seed'li
düzensizlik** (rastgele değil — Yasa 11) · **eşit aralık yasak**.
Kesik özne: AO + kenar dekontaminasyonu + ışık yönü sabitlenmesi + kareler arası kutup
tutarlılığı. `briefTemeli` yenilenir, antika kadran EMEKLİ. İnsan varsa yalnız el/kol,
yüz yok — R-33.

### 19.9 — EKSİK ÜÇ ARKETİP    [ ]
`kapanis` · `kanit` (tesis · hat · dönem · yöntem · sonuç · kaynak satırı — R-32'yi
tasarlanmış öge yapar) · `sema` (mekanizma anatomisi — **stok görselle taklit edilemeyen
tek arketip**). Katalog on üçe çıkar.

### 19.10 — YENİ KAPILAR    [ ]
`baseFrequency` tam sayı yasağı (sessiz arıza, R-85 sınıfı) · kroma cusp zorlaması ·
kontrast eşikleri (metin AA + taşıyıcı ≥1,6:1) · kenar efekti Türkçe testi (`ÖLÇÜM HATTI
ŞĞİ`) · font denetimi (`cmap` + `Ş`≠`Ș` + `latn/TRK` + `locl`) · modal kaplama ≤%40 ·
kapanış mürekkebi ≥%12 · art arda iki slayt aynı üçlüyü kullanamaz.
⚠ **Her kapı, kasten ihlal edilip kırmızıya döndüğü GÖRÜLMEDEN yazılmış sayılmaz.**

### 19.11 — Kapı borçları (D26 · D27)    [ ]
D27: `sus-metni-kesiyor` süsün GÖRSELİ kesmesini ölçmüyor. D26: prova durduruyor, düzeltmiyor.

### 19.12 — Sistem temizliği    [ ]
163 koşu · 80 kapıda · 67 durdu · 12 kusurlu manifest · 252 slaydın **189'u karantinada**.
⚠ **SİLME YOK** (Yasa 11) — `ele` mekanizması; kusurlu 12 manifest elenmeden ÖNCE neden
kusurlu oldukları yazılır.

### 19.13 — Üç tanıtım karoseli, PANELDEN    [ ]
Kim · ne yapar · vizyon. Panelden başlatılır, kapılar panelden geçilir. Üçü bir aile
okunmalı ama **üç ayrı tema** kullanmalı.

### 19.14 — Dokuz karosel    [ ]
Ürün · iş · önem · süreç · kanıt · SSS · karşılaştırma · rehber · çağrı. Şablon dağılımı
ölçülür — on iki karosel tek şablona yığılmaz.

### 19.15 — Dur ve depo sahibini bekle    [ ]    ⛔ **YAYIN YAPILMAZ.**

---

## 6 · İŞ SIRASI

Beş iş ve **ölçümle iki kez değişen sırası**: `tasarim-tanisi-2026-08.md` → *İŞ SIRASI*.
**Bitti:** ① gren ② taşıyıcı (kısmen) ③ yüzey+şerit dikişi ④ fontlar.
**Bekliyor:** ⑤ taşıyıcı maskesi — `duzenProvasi` ölçümünü render'a taşıyan adım.
**Her işin sonunda:** çiz → **BAK** → ölç → `just check`. **Kanıtsız "bitti" yok.**

---

## 7 · EKSİK KALAN

- **Kaynaklı sektör referansı** (TOMRA, Sandvik, Trumpf…) — paralel ajan dönmedi.
- **Tuval 3:4 gerçek yüklemeyle doğrulanmadı** — taşıyıcı yükü 1080×1350 merkez bandındaysa risk sıfır. (`alanSiniri` çelişkisi ✅ çözüldü: birim farkı.)
