# FAZ 19 — Tasarım fazı: nizamiden ETKİLEYİCİYE

**Amaç:** On şablon kurallara uygun ve `just izgara` sıfır kusur veriyor. Bu faz onu
**tasarım** olarak yükseltir. Sonra sistem temizlenir ve on iki karosel **panelden**
üretilerek sistemin çalıştığı kanıtlanır.

**Yöneten kararlar:** D-318 (degrade — KAPSAMI DEĞİŞTİ, aşağı bak) · D-319 · D-347 ·
D-348 (tuval 3:4) · R-107 · `LOOP§H` (panelden bak) · Yasa 11 (koşu defteri silinmez)

---

## 0 · DEPO SAHİBİNİN TALEBİ — bağlam sıfırlansa da bu kalır

Birikmiş ve kalıcı istekler. Hepsi bağlayıcı:

- **Döngü:** `/loop`, tur başına en fazla 70 sn. Commit'te durma. *"Ben PC başında değilim."*
- **Kanıtsız "bitti" yok.** Doğrulama komutu çalıştırılır, gerçek çıktı gösterilir.
- **BAKARAK kontrol.** *"Görmeden iş yapmam."* Her değişiklik çizilir ve GÖRÜLÜR.
- **Kural değil ESTETİK.** *"İş artık sistematik kural değil, estetik ve tasarımsal
  design gözü."* Sıfır kusur iyi tasarım demek değil.
- **Boş alan kuralla ölçülmez.** *"Boş alan aşırı doludur aslında, güzeldir"* — sayıyla
  estetik kovalanmaz. Ölçüm teşhis içindir, yargı gözdedir.
- **PC/HTML-CSS görünümü YASAK.** *"Kareler kutucuklar ögeler html css gibi çünkü öyle."*
- **Gerekirse kütüphane kur, hazır görsel al, webden araştır.** PS seviyesi için elzem.
- **Şablonlar birbirinin aynısı olmayacak** — on şablona on ayrı tema.
- **Marka renk/font zorunluluğu YOK.** Uyumlu olmak aynısını kullanmak değil; mevcut
  fontlar zaten web fontu, estetik ve etkileyici olan aranır.
- **YAYIN YOK.** `yayinla` adımına geçilmez; kalan tüm kapılar agent tarafından geçilebilir.
- **BULGU → BELGE → FAZ SIRASI.** Bulgu görülür görülmez düzeltmeye başlanmaz.
- **Panelden kontrol ŞART** (`LOOP§H`): Playwright ile `#/gecmis`, Üret, Varlıklar.
- **Denetim ajanına SEAMLESS tuval verilir**, yalnız dilimlenmiş kare değil.
- **Ajanı kaybetme:** rapor gelir gelmez sıradaki brif gönderilir; brifler diske yazılır.
- **Sıra:** şablonlar mükemmelleşecek → sistem/geçmiş temizliği → panelden 3 tanıtım
  karoseli → 9 karosel daha → **dur ve depo sahibini bekle**.

---

## 1 · HANGİ BELGE NEREDE — önce bunlar okunur

| Belge | İçinde ne var |
|---|---|
| `docs/referans/seamless-arastirma-2026-08.md` | **İki ajan raporunun BİREBİR KOPYASI** (976 satır). Ölçülmüş gren/bant/font/renk değerleri, font denetimi (68 aile), OKLCH rampaları, seamless akış mekanizmaları, B2B görsel dili. **Kopya — yeniden yazılmadı.** |
| `docs/referans/tasarim-denetimi-2026-08.md` | **Dört denetim** (330 satır): kompozisyon (kapaklar) · anlatı (45 iç slayt) · zanaat/finiş (PS üstadı) · seamless panorama (kendi incelemem) |
| `docs/kurallar/TASARIM.md` | R-83…R-113 — karosel render kuralları |
| `docs/kurallar/OLCUMLER.md` | Ölçüm defteri: bir kuralın sayısı NEREDEN geldi |
| `docs/BORCLAR.md` | D24 · D25 · D26 · D27 açık borçlar |
| `DURUM.md` | Makine-okunur durum + son kanıt + sıradaki iş |

---

## 2 · YAPILDI — bu oturumda tamamlananlar

- **Tuval 1080×1440 (3:4)** — D-348. Ölçüldü sonra yapıldı: on şablon 1350 ve 1440'ta
  ayrı ayrı denetlendi, ikisinde de sıfır kusur. 2184 testin yalnız biri kırıldı (eski
  kararı kodlayan test). Bütçe tavanındaki kusur **36 → 24**.
- **Görsel işlemleri AÇILDI** — sekiz ailenin sekizi de `['keskinlik','duotone']`
  kullanıyordu; `matlama` · `tema-uyum` · `temas-golgesi` yazılmış, test edilmiş,
  dokümante edilmiş ama **çağıranı yoktu**. Açıldı: kesik özneler artık tonal olarak
  sahneye oturuyor. **Bugünkü en büyük görsel kazanç, tek satır.**
- **Gerçek logo** — kapanışta `markaKilidi()`'nin elle çizdiği "U" harfi vardı;
  `brand/brd_upcytech/logo/isaret-{koyu,acik}.png` dururken. Değiştirildi.
- **Düzen provası** (D-347) üretim yolunda: `duzen-provasi` adımı, `gorsel-brief`in dördü
  de ona bağlı — düzen sığmadan tek görsel üretilmiyor.
- **JPEG damgası** (`stampJpeg`/`stampAsset`) — hat JPEG'e geçtiğinden beri
  `gorsel-yargi`da ölüyordu. Düzeltildi, gerçek koşuda doğrulandı.
- **Emekli hat kapatıldı** — `instagram-carousel` üç yerden birden (CLI exit 1, CLI
  menüsü, `/api/calistir` muhafızı).
- **`LOOP§H`** — panelden bakmak artık kural.
- **`kavis` kemer 5 → 13** (12 YANLIŞTI: N 4'e bölünürse kesim kemer SINIRINA düşer).
- **Kapanış kartı GERİ ALINDI** — faz sırası dışında eklenmişti, `donen`de gerileme
  üretti. Mekanizma kodda duruyor, uygulaması sırası gelince.

---

## 3 · DEGRADE YASAĞI — KAPSAM DEĞİŞTİ

Depo sahibi açık yetki verdi: *"tam izin tam yetki serbestsin bu malca kuralları
aşabilirsin tasarım konusunda."*

> **Süs degradesi** bir yüzeyi *renklendirir.* **Optik degrade** bir *ışık kaynağını, bir
> teması ya da bir mesafeyi* tarif eder. Gölge, vinyet, ambient occlusion — bunlar
> dekorasyon değil **fizik**.

**Serbest:** temas gölgesi · vinyet · ışık kaynağı · tonal düşüş.
**Hâlâ istenmiyor:** marka rengiyle yıkanmış atmosferik tint (süs degradesi).
**Dört kısıt:** (1) renksiz — yalnız siyah/beyaz alfa; (2) gren zorunlu (σ≥1.5);
(3) karede en çok iki optik degrade; (4) doğrusal degrade yalnız `alanSiniri` için.

---

## 4 · ARAŞTIRMANIN EN KRİTİK ÖLÇÜLMÜŞ BULGULARI

Tam metin `seamless-arastirma-2026-08.md`'de. Burada yalnız kapı adayları:

1. **Tam sayı `baseFrequency` = SIFIR gren.** `bf=1` → σ 0.000, `bf=0.99` → 4.10. Perlin
   kafesi piksel kafesiyle hizalanıp sıfır örnekliyor. Hata vermez. **R-85'in kardeşi.**
2. **Sabit kroma rampası sessizce kırpar ve HUE KAYDIRIR.** Marka mavisi
   `oklch(0.600 0.206 262)` gamut tavanının %95'inde; C=0.206 yalnız L=0.50–0.60'ta
   sığıyor. L=0.15'te çıkan renk **mor**. Kroma cusp'ı takip etmeli: `C ≤ maxC(L)×0.85`.
3. **JPEG kalitesi bantlanmayı ÇÖZMÜYOR.** q=75 → %95,1 düz; q=95 → %95,9 düz, +%28
   dosya. Tek çözüm gren: **σ≈2.0, q=90** → %20,1.
4. **Gren opaklığı yüzey L'sinin FONKSİYONU olmalı.** `soft-light` gölgede çöküyor:
   L=8'de σ 0.70 — bant tam orada. Tablo: L<20 → 0.70 · 20–40 → 0.40 · 40–140 → 0.25 ·
   >180 → 0.35.
5. **Gren alfası sabitlenmezse luminans +9 kalkıyor** (gri perde, siyahlar ölür).
   `feComponentTransfer` + `feFuncA type="discrete" tableValues="1"`.
6. **Gren panoramanın TAMAMINA tek katman.** Dilim başına verilirse doku fazı her kesimde
   sıfırlanır ve kesim görünür olur. (256 px döşeme 1080'e tam bölünmüyor — bu İYİ.)
7. **`feDisplacementMap` scale ≤ 4.** scale≥8'de `Ö` umlautu, `Ğ` breve'i, `İ` noktası
   ölüyor — **Latin harfler hâlâ iyi görünürken.** Kenar testleri `ÖLÇÜM HATTI ŞĞİ` ile.
8. **Font:** `IBM Plex` (tüm kesimler) `latn/TRK` YOK — Inter'le aynı kapıdan eleniyor.
   `Stardos/Allerta Stencil`, `Share Tech Mono` → `ğ Ğ İ ş Ş` HİÇ YOK (10/15, tofu).
   **Geçenler:** Archivo (`wdth 62..125` — vazgeçilen genişlik ekseni geri geliyor) ·
   Big Shoulders · Big Shoulders Stencil · Mona Sans · Martian Mono · Azeret Mono ·
   Anybody · Zilla Slab · Young Serif · Roboto Serif · Instrument Serif.
9. **Marka mavisi üstüne beyaz metin 4.07** — AA gövde eşiği 4.5. Geçmiyor.
10. **Anizotropik gren** `baseFrequency='0.004 0.9'` → fırçalanmış çelik (yatay/dikey
    oranı 0.02). Yüzey aileleri ölçüldü: kagit σ4.06 · beton σ14.88 · celik σ11.07 ·
    buzlu σ29.99.
11. **Halftone saf CSS ile çalışıyor** — piksellerin %96,9'u uçlara itiliyor.
    `background-size` nokta aralığı (4–12px), `contrast()` sertlik (8–40).
12. **TOMRA'nın daire çerçeve aygıtı:** fotoğraf değişir, **çerçeve değişmez** — farklı
    fotoğrafları tek aileye bağlayan tek geometrik kısıt.
13. ⚠ **AÇIK RİSK: tuval 3:4 karosel için DOĞRULANMADI.** Kaynaklar çelişiyor; Buffer
    3:4'ü ızgara kırpma referansı sayıyor. R-88'in 80 px payı her iki senaryoda yeterli
    ama **gerçek bir yüklemeyle teyit edilmeli** — yanlışsa dilimler kayar.

---

## 5 · ADIMLAR

### 19.1 — Tasarım denetimi: DÖRT KATMAN    [x]
Kompozisyon (kapaklar) ✅ · anlatı (45 iç slayt) ✅ · zanaat/finiş ✅ · seamless panorama ✅
⚠ **İlk üç brifi ben yanlış yazdım** — hepsinde kompozisyon/hiyerarşi sordum, zanaatı
sormadım; ve üçünde de kesilmiş kare verdim, seamless tuval vermedim. **Denetimin
kalitesi brifin kalitesidir.**

### 19.2 — Bağımsız araştırma    [x]
`seamless-arastirma-2026-08.md` — iki rapor, birebir kopya.

### 19.3 — TATBİK reçetesi    [ ] ⏳ ajanda
Araştırma bizim tasarımlarımıza uygulanıyor. Brif: `scratchpad/asama2-brief.md`.
Beklenen çıktı: on şablon × on tema tablosu · şablon şablon reçete (zemin değerleriyle,
tipografi, akış taşıyıcısı, kesim yerleri, görsel brief'i, palet) · ortak altyapı · ilk beş iş.

### 19.4 — Zemin ve yüzey    [ ]
Gren katmanı (panoramaya tek katman, opaklık yüzey L'sine bağlı) · vinyet · ışık kaynağı ·
yüzey aileleri (kagit/beton/celik/buzlu). ⚠ `ustDoku` ve `grenKatmani()` yazılmış, **hiç
çağrılmıyor**.

### 19.5 — Tipografi    [ ]
Archivo + Big Shoulders + Martian Mono; Türkçe satır aralığı 1.0 → 1.18–1.24; `locl` ve
`tnum` açılsın; optik hizalama (yuvarlak glif `-0.018em`); aksanlı kelimeye ağırlık telafisi.

### 19.6 — Renk    [ ]
Cusp-takipli rampalar · iki nötr rampa (sıcak kum h=75 / soğuk çelik h=250) · beş palet ·
ISO 3864 sinyal renkleri.

### 19.7 — Kompozisyon ve seamless akış    [ ]
Sabit iskeleti kır (45 slaydın 34'ünde sol kenar %6,0–6,7) · her kesimde **iki** taşıyıcı
(biri geometrik, biri anlamsal) · taşıyıcıyı VERİYE bağla · kapanış kartı.

### 19.8 — Görsel dili    [ ]
Duotone birleştirici · kenar dekontaminasyonu · ışık yönü sabitlenmesi · stok klişelerinden
kaçış · `briefTemeli` yenilenmesi.

### 19.9 — Yeni kapılar    [ ]
`baseFrequency` tam sayı yasağı · kroma cusp zorlaması · kontrast eşikleri · kenar efekti
Türkçe testi · font denetimi (`cmap` + `Ş`≠`Ș` + `latn/TRK`).

### 19.10 — Kapı borçları (D26 · D27)    [ ]
D27: `sus-metni-kesiyor` süsün GÖRSELİ kesmesini ölçmüyor. D26: prova durduruyor ama
düzeltmiyor, tur açılmalı.

### 19.11 — Sistem temizliği    [ ]
163 koşu · 80 kapıda · 67 durdu · 12 kusurlu manifest · 252 slaytın **189'u karantinada**.
⚠ **SİLME YOK** (Yasa 11) — `ele` mekanizması. Kusurlu 12 manifest elenmeden ÖNCE neden
kusurlu oldukları yazılır.

### 19.12 — Üç tanıtım karoseli, PANELDEN    [ ]
Kim · ne yapar · vizyon. Panelden başlatılır, kapılar panelden geçilir. Üçü yan yana bir
aile okunmalı.

### 19.13 — Dokuz karosel    [ ]
Ürün · iş · önem · süreç · kanıt · SSS · karşılaştırma · rehber · çağrı. Şablon dağılımı
ölçülür — on iki karosel tek şablona yığılmaz.

### 19.14 — Dur ve depo sahibini bekle    [ ]
⛔ **YAYIN YAPILMAZ.**

---

## 6 · SIRADAKİ İŞ

**Aşama-2 tatbik raporu bekleniyor** (ajan `adf83dbed1f37401e`, brif diskte). Geldiğinde:
1. Raporu **kopyala** (yeniden yazma) → `seamless-arastirma-2026-08.md`'ye RAPOR 3 olarak.
2. Reçeteyi 19.4–19.8 adımlarına dağıt.
3. En yüksek görsel kazançtan başla, her değişikliği **çiz ve BAK**.
