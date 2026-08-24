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

1. **Zeminler gerçekten düz** ve bu **kendi aletimle doğrulandı**: on kapağın modal RGB
   kaplaması **%67,7–%92,3** (medyan ~85). **On şablon, dört renk** — `#040404` `#fafafa`
   `#0e0e0e` `#141414`. Ajanın sayısı birebir çıktı.
2. **Kapanışlar setin en boş kareleri** (`sahne` %2,1 · `donen` %3,3 · `memphis` %3,5 ·
   `dizin` %4,7; hedef ≥%12). Karoselin tepe yapması gereken yerde sistem düz çiziyor.
3. **Şablon farkı KATALOGDA var, RENDER'DA yok** — "tam kaplama fotoğraf", "dev hayalet
   rakam", "geometrik leke", "kemer dizisi": dördü de çizilmiyor. Yasa 13'ün (D-268)
   yarısı uygulanmıyor: şablon seçiliyor, şablonun KONSEPTİ çizilmiyor.
4. **Akış taşıyıcısı fiilen yok.** İkisi çalışıyor, ikisi siyah üstüne siyah, **ikisi
   (`donen` · `memphis`) yüzeyi tam kesim yerinde çevirip sürekliliği AKTİF olarak
   kırıyor.** R-87 VARLIK ölçüyor, GÖRÜNÜRLÜK ölçmüyor: *teknik yeşil, algısal kırmızı.*
5. **Kapak kilidi:** on kartın **dokuzunda** aynı açılış hamlesi; **45 slaydın 34'ünde**
   sol kenar %6,0–6,7; dinamik aralık ~**6:1**, hepsi skalanın ortasında.

⚠ **İki bulgu uygulanmadan ÖNCE doğrulanacak:** (a) "elle çizilmiş U hâlâ render'da"
panorama için ESKİMİŞ — ama `static.ts:748` hâlâ `markaKilidi()` çağırıyor; (b) ölçüm
defteri `alanSiniri` ΔL 0,165 diyor, `akan-alan` kapağı %67,7 tek renk. **Önce ölç.**

⚠ **"Dört şablonda aynı antika kronometre" bulgusu GEÇERSİZ** — ızgara aynı iki koşu
görselini döndürüyor; kusur ölçüm düzeneğimde. Asıl soru: `briefTemeli` (19.8).

---

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

### 19.4 — ZEMİN VE YÜZEY    [ ]    ← gren BİTTİ, yüzey aileleri kaldı
**GREN ✅** — koşulsuz, luminansa bağlı, JPEG'ten sağ çıkıyor. Tam ölçüm defterde
(`docs/kurallar/OLCUMLER.md` → FAZ-19.4).
- Zincirin **on ikinci kopukluğu:** `zeminDokusu` ve `ustDoku` alanları yazılmış,
  üretim yolunda **hiçbir üreticileri yoktu**. `.ust-gren` + `.ust-vinyet` artık koşulsuz.
- Gren **kartların ÜSTÜNDE** olmak zorunda: `zeminDokusu` opak kartın altında kalıyor.
  *Film greni sahnenin değil FİLMİN özelliğidir.*
- **Kip de luminansın fonksiyonu:** uçlarda (`L<0,14` · `L>0,85`) `soft-light` çarpacak
  bir şey bulamıyor — kâğıt şablonlarında düz blokların **%87'si σ<0,5**, yani JPEG onu
  tamamen siliyordu. Uçlarda `normal` @0,10.
- **Sonuç:** tam modal kaplama %67,6–%90,7 → **%8,8–%17,1** (tavan %40 ✅). Düz blok
  medyan σ 2,26–3,85; **JPEG q=90 sonrası 1,62–3,61.** On kapak, sıfır kusur, BAKILDI.
- ⚠ **Bedel ve o bedel FİZİK:** `#040404`→`#111111`, `#fafafa`→`#eeeeee`. Siyahın ALTINA
  dither edilemez; zemini uçtan çıkarmak 19.6'nın işi.
- ⚠ **4.5'teki çelişki ÇÖZÜLDÜ ve cevap ikisi de değildi: BİRİM farkıydı.** ΔL 0,165
  kaydı doğru; ama kontrast oranında o yalnız **1,32:1**. Token açıklığı ile WCAG
  kontrastı iki AYRI birim, biri ötekini garanti etmiyor.

**TAŞIYICI ✅ (kısmen)** — `kavis` 1,16:1 → **1,66:1**, `akan-alan` 1,32:1 → **2,65:1**.
`yuzeyAdimi()` adımı zeminin KENDİ metin renginden türetiyor: koyu şablonda yukarı,
kâğıt şablonda aşağı. Sabit token iki kutupta birden doğru olamaz.
⚠ Nötr rampanın gölgede ara adımı YOK (`ink-850` 0,270 → `ink-650` 0,485) — 19.6'nın işi.
⚠ **KALAN:** `veri-hikayesi` köşegeni 2 → 6 px ve magenta; `karsilastirma` sınır çizgisi.

**KALAN:** beş yüzey ailesi (kâğıt · taş · beton · fırçalanmış çelik · halftone) ·
ışık kaynağı katmanı · JPEG q=90'ın yayın yoluna bağlanması · şablon şablon zemin
reçeteleri (`seamless-arastirma-2026-08.md` `B`).

### 19.5 — TİPOGRAFİ    [ ]
Archivo (`wdth 62–125`) · Big Shoulders (+Stencil) · Martian Mono · Literata · Young Serif
gelir; Jakarta · Montserrat · JetBrains · Source Serif gider. ⚠ **`IBM Plex` DENENMEZ** —
`latn/TRK` yok, ölçüldü. Satır aralığı 1.0 → **1.18–1.24** (Türkçe satır kutusunun İKİ ucu
da dolu), `locl`+`tnum` açılır, optik hizalama, aksana ağırlık telafisi.
**Dördüncü ve beşinci ses:** `--punto-rakam` (240–360 px, yalnız rakam) ve `--punto-not`
(13–15 px mono). ⚠ **Bu adım 19.7'nin kapanış kartından ÖNCE gelir** — sırası ölçümle
kanıtlandı: imzayı rakamdan önce eklemek yarım bir kapanış üretti.

### 19.6 — RENK    [ ]
Cusp-takipli rampa (`C ≤ maxC(L)×0.85`) · **iki nötr rampa** (sıcak kâğıt h=75 / soğuk
çelik h=250 — saf 0-kroma biter) · beş palet token'a girer · marka mavisi üstüne beyaz
metin yasak (4.07 < 4.5) · **aksan disiplini** dört rol (`vurgu` ≤2, `yok` ≥1).
*Tek mavi anı işe yarayan şey nadirliğidir.*

### 19.7 — KOMPOZİSYON VE SEAMLESS AKIŞ    [ ]
Kapak kilidini kır (`blok-yerlesimi`, hiçbir durum ikiden fazla) · slayda ROL ver (üç sol
pay, üç başlık ölçeği, üç dikey hiza; **art arda iki slayt aynı üçlüyü kullanamaz**) ·
**z-sırası sözleşmesi** + taşıyıcı metin kutusunun 24 px dışına maskelenir (kutular
düzen provasından, D-347) · `bant-ok` `z4`→`z3`, **özne şeridi KESSİN** · taşıyıcıyı
görünür kıl (≥1,6:1, değer adımı %6→%14) · **yüzeyi kesimden ayır** (`donen`+`memphis`
dönüşü slayt merkezine) · sürekliliği **VERİYE bağla** · orta kuşağı doldur · R-87
ölçülebilir olur · **marka işareti karosel başına TAM İKİ KEZ** (künye şeridindeki 20 px
logo kalkar — imza değil duvar kâğıdı) · **KAPANIŞ KARTI iskeleti KIRAR** (varış · tek
iddia 300–360 px · güzergâh · imza + tek eylem · ton kırılması · mürekkep ≥%12).

### 19.8 — GÖRSEL DİLİ VE YÜZEY ZANAATI    [ ]
**"Kutu değil yüzey"** altı kuralı: `border-radius` 0 ya da ≥28 px · saf renk yok · düz
gölge yok (iki katman) · kenar bozma yalnız dekoratif ögede ve `scale ≤ 4` (aksanlar
önce ölür) · **seed'li düzensizlik** (rastgele değil — Yasa 11) · **eşit aralık yasak**.
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
D27: `sus-metni-kesiyor` süsün GÖRSELİ kesmesini ölçmüyor. D26: prova durduruyor ama
düzeltmiyor, tur açılmalı.

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

## 6 · İLK BEŞ İŞ — en yüksek görsel kazanç, sırayla

| # | iş | nerede | neden ilk | adım |
|---|---|---|---|---|
| 1 | ✅ **Greni koşulsuz aç, luminansa bağla** | `zemin.ts` + `panorama.ts` | **BİTTİ:** %85 düz alan → %8,8–17,1; JPEG sonrası σ 1,62–3,61 | 19.4 |
| 2 | ◐ **Taşıyıcıyı görünür kıl** | `kavis` ✅ 1,66:1 · `akan-alan` ✅ 2,65:1 · `veri-hikayesi` köşegen KALDI | seamless'ın çalışmadığı üç şablon **kompozisyon değişmeden** çalışır | 19.4 |
| 3 | **Yüzeyi kesimden ayır** | `donen` · `memphis` degrade duraklarının yeri | bu ikisi bugün sürekliliği **aktif olarak kırıyor** | 19.7 |
| 4 | **Fontları değiştir ve şablona ata** | `font-getir.mjs` + `fonts.ts` `YUZLER` | *"bilgisayar fontu"* şikâyetinin doğrudan cevabı | 19.5 |
| 5 | **Z-sırası + taşıyıcı maskesi** | `panorama.ts` | *"çizgiler yazıyı kesiyor"*u kökten bitirir; ölçüm altyapısı **zaten var** | 19.7 |

**Her işin sonunda:** çiz → **BAK** → ölç → `just check`. **Kanıtsız "bitti" yok.**

---

## 7 · EKSİK KALAN

- **Kaynaklı sektör referansı** (TOMRA, Sandvik, Trumpf…) — paralel ajan dönmedi.
- **Tuval 3:4 gerçek yüklemeyle doğrulanmadı.** Tasarım hamlesi (taşıyıcı yükü 1080×1350
  merkez bandında) riski sıfırlıyor ama teyit edilmedi.
- **`alanSiniri` çelişkisi** — 19.4'ün ilk işi.
