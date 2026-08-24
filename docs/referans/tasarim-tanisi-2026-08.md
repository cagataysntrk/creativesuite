# Tasarım tanısı ve uygulama reçetesi — 2026-08

> **FAZ-19'un ölçüm ve değer defteri.** Faz dosyası (`docs/fazlar/FAZ-19.md`) NE
> yapılacağını sırasıyla söyler; burası **hangi değerle ve neden** olduğunu tutar.
> İkisi birlikte okunur — faz dosyası her turda, bu belge adımı uygularken.
>
> Kaynaklar: `docs/referans/seamless-arastirma-2026-08.md` (üç ajan çıktısının birebir
> kopyası; satır 985'ten sonrası AŞAMA 2 REÇETE) · `docs/referans/tasarim-denetimi-2026-08.md`
> (dört denetim) · kendi ölçümlerim.

---

## 4 · TANI — ölçülen, iddia değil

### 4.1 Zeminler gerçekten düz — KENDİ ALETİMLE DOĞRULANDI

`derived/izgara/*.png`, modal RGB'nin ±2 komşuluğundaki piksel oranı:

| şablon | modal | kaplama | | şablon | modal | kaplama |
|---|---|---|---|---|---|---|
| `akan-alan` | `#040404` | **%67,7** | | `karsilastirma` | `#040404` | %77,8 |
| `editoryal` | `#fafafa` | %75,4 | | `kavis` | `#040404` | %77,0 |
| `veri-hikayesi` | `#141414` | %83,1 | | `donen` | `#040404` | %87,0 |
| `alinti` | `#fafafa` | %87,6 | | `memphis` | `#fafafa` | %88,2 |
| `sahne` | `#141414` | %89,3 | | `dizin` | `#0e0e0e` | **%92,3** |

**On şablon, dört renk.** Medyan %85. Ajanın sayısı bağımsız aletle birebir çıktı — bu
satır bir iddia değil, iki kez ölçülmüş bir olgudur.

⚠ Siyah **ölü değil** (`0.105` doğru seçim; saf `#000` JPEG'de blok kırardı). Sorun
siyahın değeri değil, **tek değer olması.**

### 4.2 Slayt başına mürekkep oranı — kapanışlar setin en boş kareleri

Denetçinin sayıları **kendi aletimle doğrulandı** (ikinci ölçü, aynı sonuç):

| şablon | slayt başına % | kapanış |
|---|---|---|
| `akan-alan` | 28,9 · 37,4 · 35,4 · 43,7 · 33,7 · 42,4 | 42,4 — tek yoğun set |
| `karsilastirma` | 17,7 · 24,6 · 38,4 · 48,7 | 48,7 — artan, doğru yön |
| `alinti` | 12 · 19,2 · 26,6 | 26,6 — artan |
| `editoryal` | 22,7 · 21,4 · **2,4** · 22 | 22 — 3. slayt çöküyor |
| `veri-hikayesi` | 4,7 · 8,5 · 6,9 · 6,9 · 9,5 · 6,9 | 6,9 — baştan sona düşük |
| `donen` | 7,1 · 8,7 · 12,7 · **3,3** | ⚠ kapanış en boş |
| `memphis` | 7,8 · 4,2 · 9 · **3,5** · 8,6 · 3,5 | ⚠ kapanış en boş |
| `dizin` | 8,6 · 4,7 · 5,3 · **4,7** | ⚠ kapanış en boş |
| `sahne` | 6,2 · 4,7 · 3,8 · **2,1** | ⚠ setin en boş karesi |
| `kavis` | 3,6 · 5,6 · 5,2 · 4,5 | baştan sona sönük (~%4 kontrast) |

> *"Karoselin tepe yapması gereken yerde sistem düz çiziyor — 'içerik bitti' diyor,
> 'vardık' demiyor."*

⚠ ⚠ **İMZA DENENDİ, ÖLÇÜLDÜ, YETMEDİ — ve sıranın neden bağlayıcı olduğunun kanıtı bu.**
Dört şablona marka kilidi + tek çağrı eklendi: `sahne` 2,1→**2,8** · `donen` 3,3→**3,9** ·
`memphis` 3,5→**4,3** · `dizin` 4,7→**5,3**. Hedef %12. Üç kusurla birlikte geri alındı:
(1) kilit etiketi kutunun dışına taşıyor, (2) kilit ile çağrı arasında hiyerarşi yok,
(3) üst blok ile imza arasında ~600 px ölü kuşak. **Sebep:** denetçinin kapanış tarifinde
ağırlığı **300–360 px cap-height'lik tek rakam** taşıyor. `--punto-rakam` sesi kurulmadan
kapanış tamamlanamaz. **İmzayı rakamdan ÖNCE eklemek yarım bir kapanış üretti.**

### 4.3 Kapı adayı olan teknik sabitler

1. **Tam sayı `baseFrequency` = SIFIR gren.** `bf=1` → σ 0.000, `bf=0.99` → 4.10,
   `bf=2` → σ 0.000. Perlin kafesi piksel kafesiyle hizalanıp sıfır örnekliyor. Hata
   vermez, **sessizce ölür.** Mevcut kod `0.82` — güvenli ama korumasız. **R-85'in kardeşi.**
2. **Sabit kroma rampası sessizce kırpar ve HUE KAYDIRIR.** `h=262`'de maks kroma:
   L=0,15 → 0,112 · L=0,30 → 0,144 · L=0,50 → 0,233 · L=0,80 → 0,101 · L=0,90 → 0,048.
   `C=0.206` yalnız L=0,50–0,60'ta sığıyor; L=0,15'te çıkan renk **mor** (`#0F0061`).
   Kroma cusp'ı takip etmeli: `C ≤ maxC(L)×0.85`.
   ⚠ `--ramp-signal-warn` maksın %99'unda → `oklch(0.72 0.140 75)`e çekilecek.
3. **JPEG kalitesi bantlanmayı ÇÖZMÜYOR.** Grensiz: q=75 → %95,1 düz plato; q=95 → %95,9,
   +%28 dosya, **sıfır kazanç.** Bant 8-bit kaynakta, kodlayıcıda değil. Tek çözüm gren:
   σ≈2,0 + q=90 → **%20,1**. (q=90 → q=95 kazancı %16,7 ama dosya +%88 — almıyoruz.)
4. **Gren opaklığı yüzey L'sinin FONKSİYONU olmalı** (hepsi `soft-light`):
   L<20 → 0,70 · 20–60 → 0,40 · 60–140 → 0,25 · >180 → 0,35.
5. **`overlay` gren koyu zeminde JPEG'te YOK OLUYOR.** `#040404` üstünde `overlay`+26
   σ≈0,5 üretir, q=82 onu tamamen siler. **`GREN_GUCU=26` kararı bu ölçümle düzeltiliyor:**
   depodaki ölçüm PNG alanında sütun sayarak yapılmış, kodlayıcıdan geçirilmemiş —
   **yanlış değil, EKSİK.**
6. **Gren alfası sabitlenmezse luminans +9 kalkıyor** (gri perde, siyahlar ölür).
   `feComponentTransfer` + `feFuncA type="discrete" tableValues="1"` → kayma +0,5.
7. **Gren panoramanın TAMAMINA tek katman.** Dilim başına verilirse doku fazı her kesimde
   sıfırlanır ve kesim görünür olur. 6480×1440'ta σ uçtan uca 1,55–2,05 — Chromium
   panorama ölçeğinde filtreyi sessizce düşürmüyor.
8. **`feDisplacementMap` scale ≤ 4.** `bf=0.05 numOctaves=3` ile scale≤3–4 letterpress
   kenarı verir; scale≥8'de `Ö` umlautu, `Ğ` breve'i, `İ` noktası **erirken Latin harfler
   hâlâ iyi görünüyor.** Latin-only göz testi bunu geçirir, Türkçe bozuk gider.
   Zorunlu test dizesi: `ÖLÇÜM HATTI ŞĞİ`.
9. **Font — 70 aday ölçüldü.** `IBM Plex` ailesinin TAMAMI (Sans/Mono/Serif/Sans
   Condensed) `latn/TRK` YOK — Inter'le aynı kapıdan eleniyor, upstream IBM deposundan da
   doğrulandı. `Stardos/Allerta Stencil`, `Share Tech Mono` → `ğ Ğ İ ş Ş` glifi HİÇ YOK
   (tofu basar). Ayrıca elenen: Fraunces · Newsreader · Roboto Slab · Space Mono ·
   DM Mono · Archivo Black · Teko · Khand · Anonymous Pro.
10. **Marka mavisi üstüne beyaz metin 4.07** — AA gövde eşiği 4,5. Geçmiyor.
11. **Anizotropik gren** `baseFrequency='0.004 0.9'` → fırçalanmış çelik (yatay/dikey
    oranı 0,02). Tek değerle imkânsız. Yüzey aileleri: kagit σ4,06 · beton σ14,88 ·
    celik σ11,07 · buzlu σ29,99.
12. **Halftone saf CSS ile çalışıyor** (Chromium'da doğrulandı) — piksellerin %97'si
    ikili. Nokta ızgarası + `background-blend-mode: overlay` + `filter: contrast(N)`.
    Adım 4–12 px = tram sıklığı; `contrast(8)` yumuşak (139 seviye), `contrast(40)`
    gazete (22 seviye).
13. **TOMRA'nın daire çerçeve aygıtı:** fotoğraf değişir, **çerçeve değişmez** — farklı
    fotoğrafları tek aileye bağlayan tek geometrik kısıt.
14. ⚠ **AÇIK RİSK: tuval 3:4 karosel için DOĞRULANMADI.** Kaynaklar 2026 için çelişiyor;
    Buffer 3:4'ü yalnız ızgara kırpma referansı sayıyor, taşıyıcı seçenekleri 1:1/4:5/
    1.91:1 diyor. **Riski sıfırlayan tasarım hamlesi:** taşıyıcı yükü olan her şey
    1080×1350 merkez bandında kalsın (üst/alt 45 px pay). R-88'in 80 px payı her iki
    senaryoda yeterli — ek iş yok, yalnız bilinçli olmak gerek. Gerçek yüklemeyle teyit.

### 4.4 Şablon farkı KATALOGDA var, RENDER'DA yok

| Katalog ne diyor | Render ne veriyor |
|---|---|
| `editoryal` — "tam kaplama fotoğraf" | beyaz zemin + minik nesne |
| `akan-alan` — "dev hayalet rakam" | yok |
| `memphis` — "geometrik leke dili" | hiç şekil yok |
| `kavis` — "kemer dizisi" | görünmez (siyah üstüne siyah) |

**Sebep tembellik değil, ortak iskelet:** her şablon aynı kalıba düşüyor — ETİKET + tek
mavi kelimeli başlık + küçük gövde + künye şeridi. Katalog farkı yazmış, render uygulamıyor.
**Bu Yasa 13'ün (D-268) yarısının uygulanmaması demektir:** şablon seçiliyor ama şablonun
KONSEPTİ çizilmiyor.

### 4.5 Akış taşıyıcısı fiilen yok — ikisi sürekliliği AKTİF olarak kırıyor

| şablon | taşıyıcı durumu |
|---|---|
| `veri-hikayesi` | ✅ köşegen çalışıyor — ama 2 px ve mavi, markanın geri kalanıyla karışıyor |
| `sahne` | ✅ nesne çalışıyor |
| `akan-alan` · `kavis` | ⚠ taşıyıcı VAR ama siyah üstüne siyah — R-87'den geçiyor, göz görmüyor |
| `donen` · `memphis` | ⛔ yüzeyi **tam kesim yerinde** çeviriyor — seamless'ın TERSİ |

`kavis` kemerleri: `#0a0a0a` üstüne `#1a1a1a` ≈ **%4 kontrast** — JPEG sıkıştırması
öldürür. Şablonun tek yapısal fikri görünmüyor.

⚠ **R-87 kapısı bu yüzden yetersiz:** VARLIK ölçüyor, GÖRÜNÜRLÜK ölçmüyor.
*"Teknik yeşil, algısal kırmızı."* Reçete `C.7` ikinci koşulu getiriyor:
taşıyıcı/zemin kontrastı ≥ **1,6:1**. Denetçi aynı şeyi değer adımı olarak yazıyor:
**%6 → ≥%14.**

⚠ **Ölçüm defteriyle çelişki — 19.4'te ÖNCE ÇÖZÜLECEK.** `docs/kurallar/OLCUMLER.md`
`alanSiniri`nin `ink-1000`/`ink-850`e çekildiğini ve ΔL 0,165 olduğunu kaydediyor; ama
`akan-alan` kapağının %67,7'si tek bir `#040404`. İkisi birden doğru olamaz: ya düzeltme
`akan-alan`a ulaşmadı, ya ΔL token uzayında büyük ama kontrast ORANINDA 1,6:1'in altında.
**Önce ölçülecek, sonra dokunulacak.**

### 4.6 Ölü kod, yanlış z-sırası, eskimiş bulgu

- **Şalterleri inik mekanizmalar** (zanaat denetçisinin kök sebebi):

  | mekanizma | nerede | durum |
  |---|---|---|
  | `temas-golgesi` · `tema-uyum` · `matlama` | `gorsel-islem.ts` | ✅ **19.2'de AÇILDI** |
  | `ustDoku` (gren + vinyet) | `panorama.ts:537, 1313, 1523-1531` | ⛔ hiçbir yerde set edilmiyor |
  | `grenKatmani()` | `zemin.ts:120` | ⚠ yalnız `degradeVar` iken çağrılıyor → hiç |

- ⚠ **`ustDoku` bir unutma değil bir KARAR.** D-319'da emekli edildi ve
  `katalog-kabul.test.ts:82` onun **yokluğunu iddia ediyor**. Diriltmek D-319'a dönmeyi
  gerektirir — sessizce açılamaz. (19.4'te ya D-319 gerekçesiyle yeniden açılır, ya
  yerine `.panorama::after` tek örtüsü geçer. İkincisi tercih ediliyor: `C.3` de onu diyor.)
- ⚠ **Mavi şeridin z-sırası YANLIŞ:** `bant-ok` öznenin ÜSTÜNDEN geçiyor (`.gorsel`
  `z-index: 4`, şerit onun üstünde). Üstten geçen çizgi "bağlantı" değil **fosforlu kalem
  lekesi** okunuyor. Şerit `z-index: 3`'e inecek, **özne onu KESSİN** — kesilen çizgi
  derinlik kurar.
- ⚠ **"Elle çizilmiş U hâlâ render'da" bulgusu PANORAMA İÇİN ESKİMİŞ.** Ajanın gördüğü
  panoramalar `markaKilidi()` çıkarılmadan önce üretilmişti; bugün `panorama.ts`te yalnız
  bir yorum satırı kaldı. **Ama `static.ts:748` hâlâ `markaKilidi()` çağırıyor** — statik
  yol canlıysa şikâyet orada duruyor. 19.7'de taze render'la doğrulanacak.
- ⚠ **"Dört şablonda aynı antika kronometre" bulgusu GEÇERSİZ** — ızgara aynı iki koşu
  görselini bütün şablonlarda döndürüyor; kusur ölçüm düzeneğimde. Görseller her koşuda
  konuya göre yeniden üretiliyor. **Asıl soru şablonun hangi görseli İSTEYECEĞİ:**
  `briefTemeli` (19.8).
- **Küçük ama görünür:** `dizin`de renkli emoji (⚖️) — monokrom sistemde tam renkli glif,
  `ikonSvg` zaten var · `karsilastirma` bar rayları eşit değil (873/871/901 px) · tarama
  deseni semantiği TERS: "tahmin" barı ölçülmüş barlardan daha ağır okunuyor.

---

## 5 · TASARIM YARGISI — gözün gördüğü, ölçünün göremediği

> *"Bu, iyi kurulmuş bir SİSTEM ama henüz bir TASARIM değil."*

### 5.1 Kapaklar — beş hastalık

1. **Kapak kilidi.** On kartın **dokuzunda** aynı açılış hamlesi: 65 px'te mavi tire + mono
   üst başlık, altında Display başlık, altında gri gövde. Aynı x, aynı y, aynı punto bandı.
   *"Ayrım yerleşimden gelir"* iddiası **kapakta tutmuyor** — ayrım alt yarıdaki süse
   devredilmiş, o da sistemin en görünmez katmanı.
2. **Dinamik aralık dar.** En büyük öge ile en küçüğü arasında ~**6:1** ve her şey
   skalanın ortasında. Hiçbir yerde *devasa*, hiçbir yerde *fısıltı* yok. **Editoryal etki
   tam olarak bu iki ucun aynı sayfada bulunmasından doğar.**
3. **Aksan dokuya dönüşmüş.** Mavi on kartta da aynı sözdizimsel yerde (serif satırın
   içinde bir-iki kelime). **Her kartta aynı yerde duran aksan, aksan değildir.**
4. **Ölü orta.** Üst blok ile alt süs birbirinden habersiz; aradaki ~400 px şekillenmemiş.
   Sayfalar **nizami** boşluk kullanıyor, *gerilimli* boşluk değil.
5. **Değer adımı görünmüyor.** Taşıyıcı alanlar ~%6 parlaklık farkıyla çiziliyor; telefon
   parlaklığı %50'de yoklar. **Sürekliliği taşıyan şey okuyucunun göremediği şey.**

### 5.2 Şablon şablon — en güçlü / en zayıf (kapak)

| şablon | en güçlü | en zayıf |
|---|---|---|
| `akan-alan` | başlık ragı iyi kırılmış | eğri EDİLGEN: hiçbir şeyi kırpmıyor, hiçbir taban ona oturmuyor; gövde–eğri arası 220 px şekilsiz |
| `alinti` | setin tek gerçek editoryal anı | **atıfsız alıntı** (pull-quote'un yapısı iddia→atıf); siyah kama künye şeridine TEĞET |
| `dizin` | mavi ray + numaralı madde: tek bilgi tasarımı refleksi | alt yarıda üç alâkasız öge kavga ediyor; mavi hap hiçbir şeye bağlanmıyor; hayalet %5 opaklıkta — ne görünmez ne okunur |
| `donen` | nesne ölçek çizgisi üstünde duruyor | **iki kompozisyon mantığı tek kartta**; alt yazı öksüz; siyah üstünde siyah nesne kesik görünmüyor |
| `editoryal` | setin tek gerçek figür/zemin ilişkisi | fotoğraf kendi yarısını doldurmuyor, sol altta beyaz çentik; metin sütunu hiçbir şeyle hizalı değil |
| `karsilastirma` | **taralı bar** = en zeki tek fikir | barlar başlığı yeniyor; üç bar neredeyse AYNI uzunlukta — "karşılaştırma" hiçbir şey karşılaştırmıyor |
| `kavis` | en sıkı rag; motif kavramla uyumlu | setin **en boş** kartı; iki yay rastgele kesilmiş — ritim ≥3 vuruş ister. **Form içeriği YALANLIYOR** |
| `memphis` | açık yüzey nefes veriyor | setteki tek **bozuk** görsel: hâle, havada bağlantısız parçalar. Adı Memphis ama ortada Memphis yok |
| `sahne` | en sinematik kompozisyon | **kırpma yanlış yerden**; siluet siyahta eriyor; ölçü çizgisi künye şeridine 30 px |
| `veri-hikayesi` | yıl hapları iyi süreklilik fikri | **grafik başlığı YALANLIYOR** — "iki katına çıkan" derken çizgi ~4°. Bu zevk değil **ARGÜMAN** hatası |

### 5.3 İç slaytlar — *"kaydırdığınızda hiçbir şey olmuyor"*

- **45 slaydın 34'ünde** metin bloğunun sol kenarı **%6,0–%6,7** arasında. Bir karosel
  boyunca yatay kompozisyon kare genişliğinin **%0,7'sinden az** değişiyor. Bu bir şablon
  değil bir **FORM**: içerik alanlara dolduruluyor, göz kaydırdığını fark etmiyor.
- **Süreklilik teknik olarak gerçek ama ANLAMSIZ:** eğri/kemer/kama kesimi gerçekten
  aşıyor, ama hiçbirinin üstünde bir şey durmuyor, hiçbiri bir sayıya bağlı değil.
  **Süreklilik duvar kâğıdı olarak kuruluyor, kanıt olarak değil.**
- **Ölü kuşak bir kalıp:** `veri-hikayesi` 2-3-4'te boşluk **y=%47,6**'da başlıyor —
  virgülden sonrası dahil aynı. `memphis` 3-4-5-6'da **%35,2**. Ritim değil, kalıp.
- **Şablonlar birbirini tekrar ediyor:** aynı 48/23 çifti hem `karsilastirma` 4'te hem
  `veri-hikayesi` 3'te, aynı boyda.
- **Meta metin:** *"Göz üçüncü karede düzeni öğreniyor"* — şablon kendinden bahsediyor.

### 5.4 Panorama olarak bakınca (seamless — tasarımın gerçek birimi)

- **`akan-alan` (6480×1440):** Altı kart yan yana dizilmiş, panorama olarak tasarlanmamış.
  Altı başlık aynı yükseklikte, altı gövde aynı hizada — **tek yatay bant**. Dalga alt
  yarıyı kaplıyor ve hiçbir şey taşımıyor.
- **`veri-hikayesi` (6480×1440):** Setin **en zengin** işi — altı slaytta da gerçek veri
  paneli. Ama panorama **iki yatay şerit**: altı başlık üstte, altı panel altta. Eğri
  "iki katına çıkma"yı göstermiyor; yıl pulları eğriye değmiyor — eksen değil lejant.
- **`karsilastirma` (4320×1440):** **Setin tek gerçek panoramik jesti** — köşegen 4320 px
  boyunca tek hareketle süpürüyor. Ama o köşegen BOŞ alanı süpürüyor.
- **`sahne`:** İki "olay", iki "boşluk". Ortadaki kesimde yalnız saç teli ölçek çizgisi.
- **`dizin`:** Üç mavi "ok" aslında **üç aynı leke** — başsız uçsuz, hiçbirini hiçbir şeye
  bağlamıyor. **Dizin hiçbir yerde bir arada görünmüyor.**
- **`editoryal`:** 3. slaytta görsel yok; ritim *nesne → nesne → boşluk → nesne*.
  Kesilmiş karede fark edilmiyor, **panoramada delik apaçık.**

### 5.5 EKSİK ÜÇ ARKETİP — hiç yazılmamış şablonlar

- **Kapanış / imza kartı.** Hiçbir şablon bir karoseli BİTİRMEK için tasarlanmamış. Marka
  işareti display ölçekte, tek satır teklif, tek temas satırı, **ters yüzey**. Bugün
  markalama işini 20 px'lik künye şeridi yapıyor — o bir altbilgi, imza değil.
- **Kanıt / vaka kartı.** B2B sanayide en ikna edici varlık: tesis · hat · dönem · yöntem ·
  sonuç · **kaynak satırı**. `claim_source` zaten Yasa 8 ama onu TASARLANMIŞ bir öge
  olarak çizen şablon yok; uyum dipnotu olarak duruyor.
- **Şema / anatomi kartı.** Mekanizmayı açıklayan kart yok: sensör hattın neresinde, ne
  nereye akıyor. Vaadi *"hattınızı ölçülebilir yapıyoruz"* olan bir şirkette eksik olan tam
  bu — ve **stok görünümlü bir kesikle taklit edilemeyen tek arketip.**

---

## 6 · REÇETE — on şablon, on tema

Beş eksen: **yüzey · ışık · ölçek · renk rolü · yoğunluk.** Sabit tutulan: ızgara, güvenli
alan (R-88), künye şeridi geometrisi, gövde ailesi (Archivo), gren yasası. **Ailelik
bunlardan okunur — kompozisyon sözleşmesinden değil.**

| # | şablon | TEMA | yüzey | ışık | ölçek | palet | yoğunluk | akışı NE taşıyor |
|---|---|---|---|---|---|---|---|---|
| 1 | `akan-alan` | DÖKÜM | dökme mürekkep alanı | soldan alçak sıyırma | dev hayalet rakam 1400 px | P1 mavi=ÖZNE | seyrek | iki alanın eğri sınırı — 6 slaytta yükselir |
| 2 | `veri-hikayesi` | EĞRİ | mavi kopya ızgara | düz, gölgesiz | panel yoğun, tipografi küçük | P5 magenta=BUGÜN | yoğun | yükselen köşegen — ölçünün ilerlemesi |
| 3 | `sahne` | VİTRİN | derin mürekkep + temas zemini | tek sert key, sol-üst 35° | nesne kahraman (%70) | P1 tek renk | çok seyrek | tek nesne: döner, küçülür, kesimi aşar |
| 4 | `editoryal` | KÂĞIT | sıcak kâğıt, gerçek doku | yumuşak difüz + vinyet | minik tipografi ↔ tam kaplama foto | P3 **mavi YOK** | aşırı boşluk | 4320 px tek fotoğrafın kayması |
| 5 | `donen` | DEVİR | alternan — **ama kesimde değil** | dönen ışık yönü | büyüyen daire maske | P1↔P3 | orta | daire + yüzeyin slayt ORTASINDA dönmesi |
| 6 | `alinti` | MERMER | açık taş, ince gren | sağ-üstten sıyırma, uzun gölge | dev serif 240 px | P3 mavi=kılcal | anıtsal seyrek | sözün kendi satırı kesimde kırılır |
| 7 | `memphis` | TEZGÂH | parlak kâğıt + halftone blok | düz, gölgesiz | değişken geometrik leke | P3+P4 riso | kalabalık | leke: yarısı bu slaytta, yarısı ötekinde |
| 8 | `kavis` | KEMER | beton | alttan (kemer karnı) | dar+ağır tipografi | P4 amber | ağır | kemer dizisi, periyot **1,5 slayt** |
| 9 | `karsilastirma` | EŞİK | bölünmüş: mat ↔ parlak | sert bölünme çizgisi | panel çifti | P2 oksit=ÖNCE mavi=SONRA | orta | tek yönlü alan süpürmesi |
| 10 | `dizin` | FİHRİST | sıcak milimetrik defter | düz | dev hayalet rakam + mono liste | P2 bakır | yoğun liste | elle çizilmiş oklar, kesimi geçer |

**Şablon şablon TAM reçete** — zemin CSS'i değerleriyle, tipografi (aile + punto + aralık),
akış taşıyıcısı, kesim yerleri, görsel brief'i, palet — `seamless-arastirma-2026-08.md`
`B` bölümünde. **Buraya kopyalanmadı; tek kaynak orasıdır** ve uygulanırken oradan okunur.

**Beş palet** (`0.3`, gamut denetimli, kontrastları doğrulanmış):
`P1` mürekkep+mavi (mavi=ÖZNE) · `P2` çelik+bakır (mavi yalnız kılcal çizgi) ·
`P3` kâğıt+oksit (**mavi YOK** — paletten çıkışın kanıtı) · `P4` beton+amber ·
`P5` gece+magenta (ölçüm aksanı).

⚠ **Nötr "sıfır kroma" DEĞİLDİR.** Kâğıt tarafı h=75 · C 0,004–0,010 (sıcak); çelik tarafı
h=250 · C 0,008–0,014 (soğuk). Saf `oklch(L 0 0)` ekrandaki **en ölü yüzeydir** — mevcut
`marka-ink` rampası tam olarak budur. Kâğıt `#FAFAFA` değil `#F0EEEB` olacak.

---


---

# UYGULAMA REÇETESİ — adım adım

### 19.1 — Tasarım denetimi: DÖRT KATMAN    [x]
Kompozisyon (kapaklar) ✅ · anlatı (45 iç slayt) ✅ · zanaat/finiş ✅ · seamless panorama ✅
⚠ **İlk üç brifi ben yanlış yazdım** — hepsinde kompozisyon/hiyerarşi sordum, zanaatı
sormadım; ve üçünde de kesilmiş kare verdim, seamless tuval vermedim.
⚠ **Şerit üretecim bozuktu ve denetçi yakaladı:** verdiğim on dosyanın hepsi tek kareydi;
denetçi 45 slaydı kendisi render edip ölçtü. **Bozuk bir aletle yapılan denetim, denetim
değildir. Denetimin kalitesi brifin kalitesidir.**

### 19.2 — Bağımsız araştırma    [x]
`seamless-arastirma-2026-08.md` RAPOR 1 + RAPOR 2 — birebir kopya, yeniden yazılmadı.
Ayrıca bu adımda **sekiz ailenin görsel işlemleri açıldı** (bkz. 2).

### 19.3 — TATBİK reçetesi    [x]
`seamless-arastirma-2026-08.md` AŞAMA 2. Ölçülen tanı + teknik sabitler + font elemesi +
beş palet + on tema + şablon şablon reçete + ortak altyapı + ilk beş iş. Brif diskte:
`scratchpad/asama2-brief.md`.
⚠ Reçetenin bir bulgusu ESKİMİŞ (elle çizilmiş "U" — 4.6), biri ölçüm defteriyle
ÇELİŞİYOR (`alanSiniri` kontrastı — 4.5). İkisi de uygulanmadan önce doğrulanacak.

---

### 19.4 — ZEMİN VE YÜZEY    [ ]    ← **SIRADAKİ**
Kaynak: reçete `C.1` · `C.2` · `C.3` · `B`'nin her şablon zemin bloğu · zanaat denetimi.

1. **`grenKatmani()` tek doğru üretici olsun** (`zemin.ts:120`): alfa
   `feFuncA discrete tableValues='1'` ile sabitlenir, `numOctaves=4`, `seed=7`,
   `stitchTiles='stitch'`, `color-interpolation-filters='sRGB'`.
2. **`degradeVar` koşulu KALKAR** (`zemin.ts:168`) — gren koşulsuz.
   *Düz zemin greni EN ÇOK isteyen zemindir.*
3. **`overlay` → `soft-light`**, opaklık `grenOpakligi(yuzeyL)` fonksiyonundan (4.3/4).
   Gerekçe kayda geçer: `overlay` koyu zeminde JPEG'te siliniyor (4.3/5).
4. **Gren panoramaya TEK katman** (4.3/7), slayt başına değil.
5. **Vinyet ve ışık da panoramanın TAMAMINA** (`C.3`): `.panorama::after`, tek örtü.
   `zemin.ts:79`daki uyarı doğru ve korunur — slayt başına vinyet her kesimde halka üretir.
   Şablon başına güç: kâğıt 0,18 · beton 0,26 · mürekkep 0,34.
   ⚠ Bu, `ustDoku`yu diriltmeden aynı işi yapar — D-319'a dönmeye gerek kalmaz (4.6).
6. **JPEG q=90** (`C.2`). σ≈2,0 + q=90 = 172 KB, %20 plato.
7. **Yüzey aileleri**: kâğıt (ince gren `bf 1.2 oct 4` + uzun dalga `bf 0.02 oct 5`) ·
   taş (damar `bf 0.012 oct 6`, `multiply`) · beton · fırçalanmış çelik (anizotropik
   `bf='0.004 0.9'`) · halftone (nokta ızgarası + `contrast(20)`).
8. **Çelişki önce çözülür:** `alanSiniri` ΔL 0,165 kaydı ile `akan-alan`ın `#040404`
   düzlüğü karşılaştırılır (4.5). Ölç, sonra dokun.

**Kabul (ölçülebilir):** modal renk kaplaması **≤%40**, en uzun sabit bant **≤10 px** —
4.1 tablosu yeniden ölçülür ve on satırın onu da geçer.
**Kanıt:** aynı aletle yeniden ölçüm + panoramaya **BAKMA** + panelden bakma (`LOOP§H`).

### 19.5 — TİPOGRAFİ    [ ]
Kaynak: reçete `0.2` · `B`'nin tipografi blokları · zanaat denetimi.

**Aile değişimi** — `font-getir.mjs` aile listesi + `fonts.ts` `YUZLER` dizisi:

| gelen | eksenler (binary'den doğrulandı) | rolü | giden |
|---|---|---|---|
| **Archivo** | `wdth 62–125` · `wght 100–900` | evrensel gövde + etiket | Plus Jakarta Sans **ve** Montserrat (ikisini tek ailede kapatıyor) |
| **Big Shoulders** | `opsz 10–72` · `wght 100–900` | sanayi display, hayalet rakam | — |
| **Big Shoulders Stencil** | `opsz 10–72` | şablon/stencil aksan | — |
| **Martian Mono** | `wdth 75–112,5` · `wght 100–800` | veri, ölçü, panel | JetBrains Mono |
| **Literata** | `opsz 7–72` · `wght 200–900` | editoryal serif | Source Serif 4 |
| **Young Serif** | statik | anıtsal display (`alinti`) | — |

⚠ **`IBM Plex` DENENMEYECEK** — `latn/TRK` yok, ölçüldü (4.3/9). Sanayi işi için en bariz
tercih ve kullanılamaz. **`latin` + `latin-ext` ikilisi kuralı aynen korunur.**
Yedekler: Instrument Serif · Schibsted Grotesk · Anybody (`wdth 50–150`) · Space Grotesk ·
Zilla Slab · Azeret Mono · Saira Condensed · Mona Sans.

**Zanaat ayarları** (font seçimi doğruydu, ayarlar amatördü):
- **Satır aralığı Türkçe için yanlış.** `aile.ts`'de sekiz ailenin tabanı **1.0**'dan
  başlıyor. Latin display'de normal, **Türkçede değil**: Türkçe hem üstte (İ Ö Ü ğ) hem
  altta (Ş Ç ş ç g y p j) çıkıntı taşır — satır kutusunun İKİ ucu da dolu. Ölçülen
  çarpışmalar: `sahne` "göstermekle" `g` ↔ "başlar" `b`; `alinti` "şeyi" `ş` ↔
  "iyileştiremezsin" nokta ~10 px. **1.0 → 1.18 · 1.05 → 1.20 · 1.1 → 1.22 · kapak serif 1.24.**
- **`locl` kapalı.** `OPENTYPE_CSS = "kern" 1, "liga" 1, "calt" 1` — `lang="tr"` tek başına
  yetmiyor. `fi` ligatürü bağlanınca **noktalı i'nin noktası kaybolur** ve Türkçede
  `fi` ≠ `fı`. `"locl" 1, "tnum" 1` eklenecek.
- **Rakamlar oransal** — künye `01 / 04` kaydırırken zıplıyor. `tabular-nums` şart.
- **Optik hizalama yok:** yuvarlak glif (`O Ö C Ç G S Ş 0`) satır başında içeri kaçmış
  görünüyor → `margin-left: -0.018em`; tırnak için `-0.055em`.
- **Aksanlı kelime optik olarak İNCE** (koyu zeminde düşük luminanslı renk daha az yayılır)
  → aksana `font-weight` +25 ya da `text-stroke: 0.35px`.

**Dördüncü ve beşinci ses — dinamik aralığı 6:1'den açan şey** (5.1/2):
- `--punto-rakam` ~**240–360 px**, yalnız rakam/sıra/yıl/yüzde, **asla cümle içinde**.
- `--punto-not` ~**13–15 px mono**, kenar boşluğunda atıf/açıklama.
⚠ **Bu adım 19.7'nin kapanış kartından ÖNCE gelir** — sırası ölçümle kanıtlandı (4.2).

### 19.6 — RENK    [ ]
Kaynak: reçete `0.3`.
- Cusp-takipli rampalar: `C ≤ maxC(L)×0.85` — sabit kroma rampası biter (4.3/2).
- **İki nötr rampa:** sıcak kâğıt `h=75` (C 0,004–0,010) / soğuk çelik `h=250`
  (C 0,008–0,014). Saf 0-kroma nötr biter.
- Beş palet token'a girer; `--ramp-signal-warn` → `oklch(0.72 0.140 75)`.
- **Marka mavisi üstüne beyaz metin yasak** (4.07 < 4.5).
- **Aksan disiplini — dört rol:** `vurgu` · `alan` (≥%20 mavi alan, üstünde oyulmuş beyaz
  tipografi) · `isaret` (tek küçük işaret) · `yok`. Bir karoselde `vurgu` ≤2 kez,
  `yok` ≥1 kez. *Tek mavi anı işe yarayan şey **nadirliğidir**.*

### 19.7 — KOMPOZİSYON VE SEAMLESS AKIŞ    [ ]
Kaynak: reçete `B` taşıyıcı/kesim blokları · `C.5` · `C.6` · `C.7` · iki denetim.

1. **Kapak kilidini kır** — `blok-yerlesimi` şablon değişkeni: `ust-sol` · `alt-sol` ·
   `orta-sag` · `tam-genislik` · `zemin-ustu`. **Hiçbir durum ikiden fazla tekrarlanmaz.**
   *Göz ilk 300 ms'de siluet okur, süs okumaz.* En acil: `akan-alan` · `kavis` ·
   `veri-hikayesi` · `dizin`.
2. **Sabit iskeleti kır — slayda ROL ver.** En az üç sol pay (%6/%26/%50), üç başlık ölçeği
   (tam/0,72/0,45), üç dikey hizalama. **Art arda iki slayt aynı üçlüye sahip olamaz.**
   Tek kural, setin en büyük hastalığını bitirir (5.3).
3. **Z-sırası sözleşmesi** (`C.5`) — *"çizgiler yazıyı kesiyor"un tek çözümü*:
   `z0` zemin+doku+gren · `z1` **akış taşıyıcısı** · `z2` görsel + temas gölgesi ·
   `z3` okunurluk yastığı · `z4` metin · `z5` künye + marka işareti.
   Taşıyıcı asla `z4`ün üstüne çıkmaz **ve** metin kutusunun **24 px dışına maskelenir**.
   ⚠ Maske kutuları **düzen provasının zaten ölçtüğü** kutulardan gelir (D-347) — yeni
   ölçüm altyapısı gerekmez.
   ⚠ `bant-ok` `z-index: 4`ten `3`e iner: **özne şeridi KESSİN** (4.6).
4. **Okunurluk yastığı** (`z3`): kutu değil elips, `blur(28px)`,
   `radial-gradient(120% 140% at 30% 50%, rgb(0 0 0/.55), rgb(0 0 0/.28) 55%, transparent 78%)`.
   R-84'ün %12 çakışma tavanının yerine geçmez — **onu karşılanabilir kılar.**
5. **Taşıyıcı süs olmaktan çıksın.** Üç ilişkiden **biri ZORUNLU**: (a) bir taban çizgisi
   teğetinde oturur, (b) bir ögeyi kırpar/maskeler, (c) durak sistemi taşır.
   *Hiçbir ögenin tanımadığı şekil arka plandır; arka plan süreklilik taşıyamaz.*
6. **Taşıyıcıyı GÖRÜNÜR kıl.** `akan-alan` ve `kavis`te taşıyıcı/zemin kontrastı ≥**1,6:1**
   (değer adımı %6 → ≥%14); `veri-hikayesi` köşegeni **2 → 6 px ve magenta** (4.5).
7. **Yüzeyi kesimden ayır.** `donen` ve `memphis`te dönüş kesim çizgisinden **slayt
   merkezine** taşınır. `donen` için tek yatay degrade; geçiş bölgeleri %12–38 ve %62–88 —
   kesimler (%25/%50/%75) hep bir geçişin ORTASINDA. ⚠ Gren opaklığı bu şablonda konuma
   bağlı: koyu uçta 0,70, açık uçta 0,35.
8. **Sürekliliği VERİYE bağla.** Eğrinin i. slayttaki yüksekliği o adımın sayısı olsun;
   kilometre etiketi eğrinin ÜSTÜNDE dursun. `kavis`te 13 kemer ↔ 13 vafel karesi x
   ekseninde hizalansın. **Geometri iddianın KANITI olsun.**
9. **Orta kuşağı doldur.** Panolar y≈%75'ten **%45–60**'a insin ve sürekli ögeye **DEĞSİN**.
   Kapı: art arda iki slaytta en uzun boş bandın başlangıç y'si %8'den yakın olamaz.
10. **R-87 ölçülebilir hale gelir** (`C.7`): kesimin ±40 px şeridinde `z1`/`z2`den en az bir
    ögenin piksel kaplaması ≥%12 **VE** taşıyıcı/zemin kontrastı ≥1,6:1.
11. **Marka işareti — karosel başına TAM İKİ KEZ** (`C.6`): slayt 1 sağ üst **32 px**
    (sahiplik, sessiz) + son slayt kapanış jesti **112 px** (imza). Zemin koyuysa
    `isaret-acik.png`, açıksa `isaret-koyu.png` — `zeminTabani()` bunu zaten biliyor.
    ⚠ **Künye şeridindeki 20 px logo KALKAR:** her slaytta tekrar ettiği için imza değil
    **duvar kâğıdı** ve 60 px'lik bandı harcıyor. Şerit yalnız üç şey taşır: bölüm adı ·
    veri kaynağı · `03 / 06` sayacı. `static.ts:748`deki `markaKilidi()` çağrısı da kapanır.
12. **KAPANIŞ KARTI — iskeleti kullanmaz, KIRAR.** Şerit yok, üç satır başlık yok, alt
    pano yok:
    - `y %0–28` **Varış.** Sürekli öge burada BİTER: tanımlı bir uçta durur, ucu dolu
      daireyle işaretlenir, oradan sağ kenara yatay kural.
    - `y %30–56` **Tek iddia.** Karoselin tek sayısı, cap-height **300–360 px**
      (`--punto-rakam`). Altında TEK satır 24 px: neyi ölçtüğü + `claim_source` (§11.4).
    - `y %58–74` **Güzergâh.** Önceki karelerin şerit etiketleri mini dizin, hepsi eşit sönük.
    - `y %78–92` **İmza + TEK eylem.** Marka işareti gerçek boyda, tek satır tek çağrı.
      İkinci seçenek yok.
    - **Ton kırılması tam bu karede** — parmak kaydırınca ton değişir: fiziksel *"vardık"*.
    - **Taban: kapanış karesinin mürekkep oranı ≥ %12.** Bu tek eşik dört şablonu birden
      düzeltir (4.2).

### 19.8 — GÖRSEL DİLİ VE YÜZEY ZANAATI    [ ]
Kaynak: reçete `B` görsel brief'leri · `C.4` · zanaat denetimi.

**"Kutu değil yüzey"** (`C.4`) — HTML görünümünden çıkışın altı kuralı:
1. `border-radius` ya **0** ya **≥28 px**. 4–12 px arası tam olarak "bootstrap kartı" bandı.
2. **Saf renk yok.** Her panel: taban + `soft-light` gren + 1 px iç ışık
   `inset 0 1px 0 rgb(255 255 255 / .06)`.
3. **Düz gölge yok.** İki katman:
   `0 1px 2px rgb(0 0 0/.30), 0 12px 40px -8px rgb(0 0 0/.45)`.
4. **Kenar bozma yalnız dekoratif ögede, metinde ASLA.** `feTurbulence bf=0.05 oct=3` +
   `feDisplacementMap scale=3`; **scale 4'ü geçemez** (4.3/8).
5. **Düzensizlik enjeksiyonu** — seed'li sapma:
   `rotate(calc(var(--i) * 0.14deg - 0.2deg))`, konum ±3 px, opaklık ±0,04.
   **Rastgele DEĞİL, seed'den türemiş** — çıktı yeniden üretilebilir kalır (Yasa 11).
6. **Eşit aralık yasak.** Boşluklar 1 : 1,15 : 0,9 — *mükemmel eşitlik kodun imzasıdır.*

**Kesik özne — retoucher'ın üç müdahalesi:**
1. ✅ `temas-golgesi` + `matlama` + `tema-uyum` sekiz ailede AÇILDI (19.2). Kalan:
   `.gorsel.kesik` altına ambient occlusion — `ellipse 46% 3.5%`, `rgba(0,0,0,0.55)`,
   `blur 26px`. ⚠ **Temas gölgesi dar-koyu, AO geniş-yumuşak: ikisi farklı iştir.**
2. **Kenar dekontaminasyonu:** `feMorphology erode radius=0.8` + alfada `blur 0.5` —
   rembg'nin beyaz saçağı ve kopuk maske adaları temizlenir.
3. **Işık yönü sabitlensin** (prompt'ta sol üst 35°) ve **kareler arası kutup tutarlılığı**
   ölçülsün: destedeki karelerin p50 luması ±25'ten fazla ayrılıyorsa kapı kırmızı.
   Bugün R-96 yalnız özne-zemin ayrışmasına bakıyor, kareler arası tutarlılığa bakmıyor.

**`briefTemeli` yenilenir — antika kadran EMEKLİ.** Yeni brief ailesi: malzemenin kendisi
(kırık/granül/balya/talaş) makroda · makine yüzeyi 1:1 · kumanda üstünde el · hat ölçekte.
Şablona özel: `sahne` *"atölye tezgâhında duran, kullanılmış, üstünde iz olan cihaz — stok
kurgu YOK"* · `editoryal` 4:1 panoramik tek kare, sol %30 sakin · `karsilastirma` aynı
ışık/açı/mesafe, fark **yalnız maddede** · `memphis` her slaytta FARKLI nesne.
**İnsan varsa yalnız el/kol, yüz yok** — R-33 (`sentetik-insan-yok`). Ayrıca TOMRA daire çerçeve aygıtı (4.3/13):
fotoğraf değişir, çerçeve değişmez.

**Küçük ama görünür:** renkli emoji → `ikonSvg` · bar rayları eşitlensin ·
tarama deseni semantiği düzeltilsin (en zayıf veri en çok bağırmasın).

### 19.9 — EKSİK ÜÇ ARKETİP    [ ]
`kapanis` (19.7/12'de tasarlandı, burada kataloğa girer) · `kanit` (tesis · hat · dönem ·
yöntem · sonuç · kaynak satırı — Yasa 8 tasarlanmış öge olarak) · `sema` (mekanizma
anatomisi — stok görselle taklit edilemeyen tek arketip). Katalog on üç şablona çıkar.

### 19.10 — YENİ KAPILAR    [ ]
Numaralar kural yazılırken verilir (`docs/kurallar/TASARIM.md`):
- `baseFrequency` tam sayı yasağı (4.3/1) — **sessiz arıza kapısı, R-85 sınıfı**
- kroma cusp zorlaması `C ≤ maxC(L)×0.85` (4.3/2)
- kontrast eşikleri: metin/zemin AA + **taşıyıcı/zemin ≥1,6:1** (4.5)
- kenar efekti Türkçe testi — zorunlu dize `ÖLÇÜM HATTI ŞĞİ` (4.3/8)
- font denetimi: `cmap` 15 kod noktası + `Ş`≠`Ș` + `latn/TRK` + `locl` (4.3/9)
- modal renk kaplaması ≤%40 · en uzun sabit bant ≤10 px (19.4 kabulü kapıya döner)
- kapanış karesi mürekkep oranı ≥%12 (4.2)
- art arda iki slayt aynı (sol pay · başlık ölçeği · dikey hiza) üçlüsünü kullanamaz (19.7/2)

⚠ **Her kapı, kasten ihlal edilip kırmızıya döndüğü GÖRÜLMEDEN yazılmış sayılmaz.**

### 19.11 — Kapı borçları (D26 · D27)    [ ]
D27: `sus-metni-kesiyor` süsün GÖRSELİ kesmesini ölçmüyor. D26: prova durduruyor ama
düzeltmiyor, tur açılmalı.

### 19.12 — Sistem temizliği    [ ]
163 koşu · 80 kapıda · 67 durdu · 12 kusurlu manifest · 252 slaytın **189'u karantinada**.
⚠ **SİLME YOK** (Yasa 11) — `ele` mekanizması. Kusurlu 12 manifest elenmeden ÖNCE neden
kusurlu oldukları yazılır.

### 19.13 — Üç tanıtım karoseli, PANELDEN    [ ]
Kim · ne yapar · vizyon. Panelden başlatılır, kapılar panelden geçilir. Üçü yan yana bir
aile okunmalı ama **üç ayrı tema** kullanacak — aynı şablona yığılmayacak.

### 19.14 — Dokuz karosel    [ ]
Ürün · iş · önem · süreç · kanıt · SSS · karşılaştırma · rehber · çağrı. Şablon dağılımı
ölçülür — on iki karosel tek şablona yığılmaz.

### 19.15 — Dur ve depo sahibini bekle    [ ]
⛔ **YAYIN YAPILMAZ.**

---

