# FAZ 19 — Tasarım fazı: nizamiden ETKİLEYİCİYE

**Amaç:** On şablon kurallara uygun ve `just izgara` sıfır kusur veriyor. Bu faz onu
**tasarım** olarak yükseltir: Photoshop seviyesinde yüzey, gerçek ışık, gerçek tipografi
zanaatı — **HTML-CSS görünümünden çıkış.** Sonra sistem temizlenir ve on iki karosel
**panelden** üretilerek sistemin çalıştığı kanıtlanır.

**Yöneten kararlar:** D-318 (degrade — KAPSAMI DEĞİŞTİ, bkz. §3) · D-319 · D-347 · D-348
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
- **Denetim ajanına SEAMLESS tuval verilir**, dilimlenmiş kare değil.
- **Ajanı kaybetme:** rapor gelir gelmez sıradaki brif gönderilir. **Raporu KOPYALA.**
- **Sıra:** şablonlar mükemmelleşecek → sistem/geçmiş temizliği → panelden 3 tanıtım karoseli
  → 9 karosel daha → **dur ve depo sahibini bekle**.

---

## 1 · BELGELER — ve içindeki numaralandırma tuzağı

| Belge | İçinde ne var |
|---|---|
| **`referans/seamless-arastirma-2026-08.md` satır 985+** | **AŞAMA 2 — REÇETE, uygulamanın kaynağı.** `0.1` ölçülen teknik sabitler · `0.2` font elemesi · `0.3` beş palet · **`A` on şablon on tema** · **`B` ŞABLON ŞABLON REÇETE** (her şablonun zemin CSS'i · tipografisi · taşıyıcısı · kesim kuralı · görsel brief'i · paleti) · `C.1–C.8` ortak altyapı · `D` ilk beş iş |
| `referans/tasarim-denetimi-2026-08.md` | **Dört denetim:** kapak kompozisyonu · 45 iç slaydın anlatısı · zanaat/finiş (PS üstadı) · seamless panorama. Her birinin sonunda **beş müdahale** ve kapanış kartının somut tarifi |
| `referans/tasarim-tanisi-2026-08.md` · `kurallar/TASARIM.md` · `kurallar/OLCUMLER.md` | Fazın değer defteri (ölçülen tanı · on tema · adım adım değerler) · R-83…R-113 · bir kuralın sayısı NEREDEN geldi |

⚠ ⚠ **AYNI DOSYADA İKİ AYRI `A`/`B`/`C` VAR ve bu bir tur kaybettirdi.** RAPOR 2'nin
(satır ~430) `A`sı tema eksenleri, **`B`si RENK**. AŞAMA 2'nin (satır 985+) `A`sı on tema
tablosu, **`B`si şablon şablon reçete**. *"Reçetenin B bölümü"* HER ZAMAN AŞAMA 2'nin
B'sidir. Yanlış B okunup *"atıf yanlış"* denildi ve 19.4 erken tiklendi; düzeltme ve
bedeli `OLCUMLER.md`de.

---

## 2 · TANI — beş cümle, hepsi ölçülü

1. **Zeminler düz** — modal RGB kaplaması %67,7–%92,3; on şablon DÖRT renk. → ✅ 19.4
2. **Kapanışlar setin EN BOŞ kareleri** (`sahne` %2,1 · `donen` %3,3 · `memphis` %3,5 ·
   `dizin` %4,7; hedef ≥%12) — tepe yapacağı yerde sistem düz çiziyor. → ✅ kart iskeleti
   kuruldu, mürekkep eşiği 19.7
3. **Şablon farkı KATALOGDA var, RENDER'DA yok** — "dev hayalet rakam", "geometrik leke",
   "kemer dizisi", "tam kaplama fotoğraf" çizilmiyor. Yasa 13'ün (D-268) yarısı
   uygulanmıyor. → yüzey ✅ · tipografi 19.5 · renk 19.6 · taşıyıcı 19.7 · görsel 19.8
4. **Akış taşıyıcısı fiilen yok** — R-87 VARLIK ölçüyor, GÖRÜNÜRLÜK ölçmüyor. → ✅ 19.4
5. **Kapak kilidi** — on kartın dokuzunda aynı açılış; 45 slaydın 34'ünde sol kenar
   %6,0–6,7; dinamik aralık ~6:1. Karosel boyunca yatay kompozisyon kare genişliğinin
   **%0,7'sinden az** değişiyor: bu bir şablon değil bir FORM. → 19.7 `blok-yerlesimi`

**Tanının dışında yapıldı:** tuval 1080×1440 (D-348) · sekiz ailenin görsel işlemleri
açıldı (yazılmıştı, çağıranı yoktu — en büyük görsel kazanç, tek satır) · gerçek logo ·
düzen provası (D-347) · JPEG damgası · emekli hat · `kavis` kemer 5→13 · atıf kapısı.

## 3 · DEGRADE YASAĞI — KAPSAM DEĞİŞTİ

> **Süs degradesi** bir yüzeyi *renklendirir.* **Optik degrade** bir *ışık kaynağını, bir
> teması ya da bir mesafeyi* tarif eder. Gölge, vinyet, AO — dekorasyon değil **fizik**.

**Serbest:** temas gölgesi · vinyet · ışık kaynağı · tonal düşüş. **İstenmiyor:** marka
rengiyle yıkanmış tint. **Dört kısıt:** renksiz (yalnız siyah/beyaz alfa) · gren zorunlu
(σ≥1,5) · karede en çok iki optik degrade · doğrusal degrade yalnız `alanSiniri` için.
⚠ **Yasağın gizli bedeli:** `zeminCss` greni yalnız degrade varsa ekliyordu; yasak
yürürlükteyken koşul hiç sağlanmadı → **on şablonun hiçbirinde gren yoktu.** Yasak,
kendisini telafi edecek tek mekanizmayı da kapatmıştı. Hastalık grensizlikti.

## 4 · ON ŞABLON, ON TEMA — reçete `A`, uygulamanın haritası

Sabit kalan: ızgara · güvenli alan (R-88) · künye geometrisi · gövde ailesi (Archivo) ·
tip ölçeği **oranı** · yedi renk rolü · marka mavisinin min %2 alanla varlığı.

| # | şablon | TEMA | yüzey | ışık | palet | akışı NE taşıyor |
|---|---|---|---|---|---|---|
| 1 | `akan-alan` | DÖKÜM | dökme mürekkep alanı | soldan alçak sıyırma | P1 mavi=ÖZNE | iki alanın eğri sınırı, 6 slaytta %78→%46 |
| 2 | `veri-hikayesi` | EĞRİ | **mavi kopya ızgara 60 px** | düz, gölgesiz | P5 magenta=BUGÜN | yükselen köşegen — ölçünün ilerlemesi |
| 3 | `sahne` | VİTRİN | derin mürekkep + temas zemini | tek sert key sol-üst 35° | P1 tek renk | tek nesne: döner, büyür, kesimi aşar |
| 4 | `editoryal` | KÂĞIT | sıcak kâğıt, gerçek doku | yumuşak difüz + vinyet | P3 mavi YOK | tam kaplama fotoğraf, 4320 px tek kare |
| 5 | `donen` | DEVİR | alternan — kesimde DEĞİL | dönen ışık yönü | P1↔P3 geçişli | büyüyen daire 380→900 px |
| 6 | `alinti` | MERMER | açık taş, ince gren | sağ-üstten sıyırma | P3 mavi=kılcal | sözün satırı kesimde kırılır + kama %88→%64 |
| 7 | `memphis` | TEZGÂH | parlak kâğıt + halftone blok | düz, gölgesiz | P3+P4 üç renk riso | geometrik lekeler, her kesimde %40/%60 |
| 8 | `kavis` | KEMER | beton | alttan, kemer karnı | P4 amber | kemer dizisi, **periyot 1,5 slayt** |
| 9 | `karsilastirma` | EŞİK | bölünmüş mat ↔ parlak | sert bölünme çizgisi | P2 oksit=ÖNCE mavi=SONRA | tek yönlü alan süpürmesi %92→%18 |
| 10 | `dizin` | FİHRİST | **sıcak milimetrik 48 px** | düz | P2 bakır | elle çizilmiş oklar, 45–60° kesim geçişi |

## 5 · ADIMLAR — tam değerler reçetenin `B` (şablon şablon) ve `C.1–C.8` (ortak altyapı)
bölümlerinde; bu dosya NE yapılacağını ve hangi kararın verildiğini söyler.

### 19.1 — Tasarım denetimi: DÖRT KATMAN    [x]
Kapak · 45 iç slayt · zanaat/finiş · seamless panorama. ⚠ **İlk üç brifi ben yanlış yazdım,
şerit üretecim bozuktu ve denetçi yakaladı.** *Denetimin kalitesi brifin kalitesidir.*

### 19.2 — Bağımsız araştırma    [x]
RAPOR 1 + RAPOR 2 birebir kopya; sekiz ailenin görsel işlemleri bu adımda açıldı.

### 19.3 — TATBİK reçetesi    [x]
AŞAMA 2 alındı. Brif: `scratchpad/asama2-brief.md`.

### 19.4 — ZEMİN VE YÜZEY    [x]
**GREN ✅** koşulsuz, luminansa bağlı, JPEG'ten sağ çıkıyor. Zincirin **12. kopukluğu:**
`zeminDokusu`/`ustDoku` yazılmış, üreticileri yoktu. Gren **kartların ÜSTÜNDE** (opak kart
altındakini yutar); kip de luminansın fonksiyonu. Modal kaplama %67,6–%90,7 → **%8,8–%17,1**.
**TAŞIYICI ✅** `kavis` 1,16:1 → **1,66:1**, `akan-alan` 1,32:1 → **2,65:1**.
**BEŞ YÜZEY AİLESİ ✅** `kagit`(editoryal) · `tas`(alinti) · `beton`(kavis) ·
`celik`(karsilastirma) · `halftone`(memphis); σ 2,26–10,00.
**IŞIK ✅** `tip: 'isik'` tanımlı, on şablonun SIFIRI istiyordu (13. kopukluk); α eşikten
geriye hesaplandı (tahmin ΔL 0,028 = görünmez → 0,061).
**VİNYET ✅ MALZEMEYE BAĞLI** kâğıt 0,11 · halftone 0,12 · çelik 0,14 · taş 0,20 ·
beton 0,23. **Kenar sütunu REDDEDİLDİ:** kart başına çerçeve kesim çizgisini GÖRÜNÜR yapar.
**JPEG ✅** kalite dört yerdeydi, tek yere toplandı (92 · ölçülen taban 90), kapıya bağlandı.
**ÇİZGİLİ ZEMİN ✅ — 14. zincir kopukluğu.** `tip: 'tarama'` yazılıydı, çağıranı yoktu.
İki yeni aile: `kopya`(veri-hikayesi, 60 px, iki eksen eşit) · `defter`(dizin, 48 px,
yatay baskın). ⚠ **Çizilmek yetmedi: ilk sürüm ΔL 0,002 ölçtü** — kurallar `.ust-gren`e
konmuştu ve `soft-light` gölgelerde çöküyor. *Gren FİLMİN özelliğidir, çizgi MÜREKKEPTİR.*
Ayrı `.ust-cizgi`, `normal` kip: 0,082 / 0,089 · çizgisiz kontrol `kavis` **0,005**.

### 19.5 — TİPOGRAFİ    [x]
**✅ Archivo** (gövde, `wdth 62–125`) · **Literata** (kapak serifi) · **Martian Mono**.
`scripts/font-denetim.mjs` raporun HER elemesini bağımsız üretti: `IBM Plex`/`Inter`
`latn/TRK` YOK, `Stardos`/`Share Tech` 10/15.
**✅ Satır aralığı 1,18** (mürekkep ölçüldü: `sahne` −4 px biniyordu → +17 px) ·
**✅ `locl`+`tnum`** · **✅ Optik hizalama** (pay bloğa değil YIĞINA, `em` değil PİKSEL).

**KALAN üç kalem:**
1. **Dördüncü ve beşinci ses** — `--punto-rakam` (240–360 px, yalnız rakam/yıl/yüzde, asla
   cümle içinde) ve `--punto-not` (13–15 px mono, kenarda atıf). *Neden:* dinamik aralık
   ~6:1 ve her şey skalanın ortasında; editoryal etki **iki ucun aynı sayfada** olmasından
   doğar. ⚠ Bu, 19.7'nin kapanış kartından ÖNCE gelir — sırası ölçümle kanıtlandı: imzayı
   rakamdan önce eklemek yarım bir kapanış üretti (2,1→2,8; hedef 12).
2. **ŞABLON ŞABLON TİPOGRAFİ** (reçete `B`). ⚠ **Hayalet rakam yüzü TERS:** bugün
   Martian Mono **wght 700** — bir mono yüzün en ağır kesimi. Reçete Big Shoulders
   **100–200** istiyor. *700 ağırlığındaki hayalet, hayalet değil duvardır.*
   ⚠ **Big Shoulders YANLIŞ ROL için reddedilmişti:** "evrensel bölüm başlığı olamaz"
   ölçümü doğru, ama reçetenin verdiği rol bölüm başlığı değil — **hayalet rakam**
   (okunurluk alakasız) ve `kavis`in 132 px ağır display başlığı. Çağrı yeri artık VAR.
   **Karar:** üç yüz kurulur — Big Shoulders · Big Shoulders Stencil · Young Serif (üçü de
   Türkçe sınavından ölçülerek geçti). `Anybody` ve `Schibsted Grotesk` KURULMAZ önce
   ÖLÇÜLÜR: Archivo'nun `wdth 62–125` ekseni ikisinin işini görüyorsa aile eklenmez.
3. **✅ AKSAN TELAFİSİ ÇÜRÜDÜ** — hastalık x-yüksekliği bandında **%0,0**, çare **%8–13**:
   çare hastalıktan on kat büyük, uygulanmadı. **✅ İKİ UÇ kapısı** (kapak ≥220 px devasa ·
   ≤20 px fısıltı · dev ses RAKAMDIR, cümle değil). **✅ GENİŞLİK EKSENİ İKİ YÖNE** —
   `karsilastirma` 88 · `memphis` 125 · `kavis` gövde 88; `akan-alan` 95 VERİLMEDİ
   (ölçüldü: %4,6, görünürlük eşiğinin altı). ⚠ **KALAN BORÇ:** `alinti` atfı hâlâ gövde
   sesinde; ayrı atıf yuvası bir SÖZLEŞME değişikliği (→ 19.9).

### 19.6 — RENK    [ ]
Cusp-takipli rampa (`C ≤ maxC(L)×0,85`) — sabit kroma h=262'de 12 basamağın 5'ini
sessizce kırpıyor ve kırpma **hue kaydırıyor** (L=0,15'te `#0F0061`, mor). **İki nötr
rampa:** sıcak kâğıt h=75 · soğuk çelik h=250 — saf 0-kroma ekrandaki en ölü yüzeydir.
**Beş palet token'a girer** (P1 mürekkep+mavi · P2 çelik+bakır · P3 kâğıt+oksit ·
P4 beton+amber · P5 gece+magenta) ve §4 tablosundaki şablona atanır. **Marka mavisi
üstüne beyaz gövde metni YASAK** (4,07 < 4,5) — `--mavi-500`e in ya da metni siyah yap.
**Sinyal renkleri ICAT EDİLMEZ:** ISO 3864 / RAL. **Aksan disiplini** dört rol
(`vurgu` ≤2 · `alan` ≥%20 mavi alan + oyulmuş beyaz · `isaret` · `yok` ≥1).
*Tek mavi anı işe yarayan şey nadirliğidir.*

### 19.7 — KOMPOZİSYON VE SEAMLESS AKIŞ    [ ]
- **Kapak kilidini kır** — beş yerleşimden hiçbiri ikiden fazla. *Göz 300 ms'de siluet okur.*
- **Slayda ROL ver ✅** — 36/45 slayt %5,7-5,9'daydı, üstleri %8,2 (`yerlesim` BELGEDEYDİ).
  `kolon`a `orta` + karta `dikey`: **36/45 → 22/45.** Üçüncü konum sabit yüzde OLAMADI,
  şablonun kendi iki ucunun ortası. Kural *"art arda tekrarlama"*. → `slayt-rolu`
- **Aksana ROL ver ✅** — `alan`/`yok` hiç yoktu, on destede de vurgu AYNI iki slayttaydı.
  `alan` = üst bant dolu, başlık kartın zeminine oyulmuş; alana yalnız BAŞLIK girer (marka
  mavisi + beyaz 4,07 < 4,5). → `aksan-rolu`
- **Sürekliliği VERİYE bağla** — eğri yüksekliği o adımın sayısı, `kavis`te 13 kemer ↔ 13
  vafel karesi. *Geometri iddianın KANITI olsun.*
- **Orta kuşağı doldur** — panolar %75'ten %45–60'a insin ve sürekli ögeye DEĞSİN.
- **Alan sınırı dev rakamı KESMEZ ✅** — dördü de kesiyordu; tek boşluk %36-45, %40'ta düzleşti.
- **z-sırası ✅** zemin 0 · taşıyıcı 1 · leke 2 · durak 3 · gren 4 · görsel 5 · vinyet 6 · metin 7; `.bant-ok` 5→1, özne şeridi KESİYOR · yüzey kesimden ÇIKTI ✅ · künye ✅
- ⚠ **Okunurluk yastığı ÇÜRÜDÜ** (%9,2 → %9,2). Çözüm CSS değil, `duzenProvasi` ölçümünü
  render'a taşıyan ADIM: taşıyıcı metin kutusunun 24 px dışına maskelenir (`C.5`).
- **Marka işareti karosel başına TAM İKİ KEZ** — slayt 1 sağ üst 32 px, son slayt 112 px;
  künye şeridindeki 20 px logo KALKAR (imza değil duvar kâğıdı).
- **KAPANIŞ KARTI iskeleti KIRAR** — %0–28 varış (sürekli öge BİTER) · %30–56 tek iddia
  (cap 300–360 px + `claim_source`) · %58–74 güzergâh · %78–92 imza + TEK eylem · ton
  kırılması tam bu karede · mürekkep ≥%12.

### 19.8 — GÖRSEL DİLİ VE YÜZEY ZANAATI    [ ]
**"Kutu değil yüzey" altı kuralı (`C.4`):** `border-radius` 0 ya da ≥28 px (4–12 px tam
olarak "bootstrap kartı" bandı) · saf renk yok (taban + soft-light gren + 1 px iç ışık) ·
düz gölge yok (iki katman: sıcak yakın + soğuk uzak) · kenar bozma yalnız dekoratif ögede
**`scale ≤ 4`** (üstünde Türkçe aksanları eriyor, Latin harfler hâlâ iyi görünür) ·
**seed'li düzensizlik** (rastgele değil — Yasa 11) · **eşit aralık yasak** (1 : 1,15 : 0,9).
**Kesik özne:** AO (geniş-yumuşak) + temas gölgesi (dar-koyu) — *ikisi farklı iştir* ·
kenar dekontaminasyonu (`feMorphology erode 0.8` + alfada `blur 0.5`) · ışık yönü prompt'ta
sabit (sol üst 35°) · **kareler arası kutup tutarlılığı** (p50 luma ±25); R-96 bugün yalnız
özne-zemin ayrışmasına bakıyor.
**`briefTemeli` yenilenir, antika kadran EMEKLİ.** Becher sözleşmesi prompt'a yazılır:
cephe · göz hizası · perspektif bozulması yok · difüz ışık · tutarlı görünür ölçek. Yasaklı
stok listesi sekiz madde (baret+tablet · HUD altıgen · dişli+devre · kıvılcım silüeti ·
drone+altın saat · el sıkışma · yeşil yaprak). İnsan varsa yalnız el/kol, yüz yok — R-33.

### 19.9 — EKSİK ÜÇ ARKETİP    [ ]
`kapanis` · `kanit` (tesis · hat · dönem · yöntem · sonuç · **kaynak satırı** — R-32'yi uyum
dipnotu olmaktan çıkarıp TASARLANMIŞ öge yapar) · `sema` (mekanizma anatomisi: sensör hattın
neresinde, ne nereye akıyor — **stok görselle taklit edilemeyen tek arketip**). Katalog 13'e.

### 19.10 — YENİ KAPILAR    [ ]
`baseFrequency` tam sayı yasağı (sessiz arıza: 1→σ 0,000; R-85 sınıfı) · kroma cusp
zorlaması · kontrast eşikleri (`bg/ink ≥12` · `bg/muted ≥4,0` · `bg/accent ≥4,5` gövde /
`≥3,0` ≥24 px bold) · kenar efekti Türkçe testi (`ÖLÇÜM HATTI ŞĞİ`) · font denetimi
(`cmap` + `Ş`≠`Ș` + `latn/TRK` + `locl`) · modal kaplama ≤%40 · kapanış mürekkebi ≥%12 ·
art arda iki slayt aynı üçlüyü kullanamaz · **kesintisizlik `C.7`:** kesim çizgisinin
±40 px şeridinde z1/z2 kaplaması ≥%12 **ve** taşıyıcı/zemin kontrastı ≥1,6:1.
⚠ **Her kapı, kasten ihlal edilip kırmızıya döndüğü GÖRÜLMEDEN yazılmış sayılmaz** —
payı da ölçülür; 0,014 puanlık bir kırmızı hiçbir şey söylemez.

### 19.11 — Kapı borçları (D26 · D27)    [ ]
D27: `sus-metni-kesiyor` süsün GÖRSELİ kesmesini ölçmüyor. D26: prova durduruyor, düzeltmiyor.

### 19.12 — Sistem temizliği    [ ]
163 koşu · 80 kapıda · 67 durdu · 12 kusurlu manifest · 252 slaydın **189'u karantinada**.
⚠ **SİLME YOK** (Yasa 11) — `ele`; kusurlu 12 manifest elenmeden ÖNCE neden kusurlu
oldukları yazılır.

### 19.13 — Üç tanıtım karoseli, PANELDEN    [ ]
Kim · ne yapar · vizyon. Panelden başlatılır, kapılar panelden geçilir. Üçü bir aile
okunmalı ama **üç ayrı tema** kullanmalı.

### 19.14 — Dokuz karosel    [ ]
Ürün · iş · önem · süreç · kanıt · SSS · karşılaştırma · rehber · çağrı. On iki karosel
tek şablona yığılmaz.

### 19.15 — Dur ve depo sahibini bekle    [ ]    ⛔ **YAYIN YAPILMAZ.**

---

## 6 · EKSİK KALAN

- **Kaynaklı sektör referansı** (TOMRA, Sandvik, Trumpf…) — paralel ajan dönmedi; reçetenin
  kendi notu da bunu açık borç sayıyor.
- **Tuval 3:4 gerçek yüklemeyle doğrulanmadı** (`C.8`). Riski sıfırlayan hamle: taşıyıcı yükü
  1080×1350 merkez bandında kalsın; R-88'in 80 px'i zaten karşılıyor.
- **`memphis` p90 119/120** — mercek ödünç özneyle ölçüyor, şablon kusuru DEĞİL.
