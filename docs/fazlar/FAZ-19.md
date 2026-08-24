# FAZ 19 — Tasarım fazı: nizamiden ETKİLEYİCİYE

**Amaç:** On şablon kurallara uygun ve sıfır kusurlu. Bu faz onu **tasarım** olarak
yükseltir: tipografi, zemin, yüzey, hiyerarşi, ritim. Sonra sistem temizlenir ve on iki
karosel **panelden** üretilerek kanıt alınır.

**Yöneten kararlar:** D-318 (degrade/glow emekli) · D-319 (yüzey adımı + hairline) ·
D-347 · D-348 · R-107 (aile ölçülebilir) · `LOOP§H` (panelden bak)

> ⚠ ⚠ **BU FAZ KURAL FAZI DEĞİL.** Kurallara uygunluk zaten ölçülüyor ve `just izgara`
> sıfır kusur veriyor. **Sıfır kusur, iyi tasarım demek değildir.** Buradaki ölçüt
> tasarımcı yargısı: hiyerarşi kuruluyor mu, göz nereye gidiyor, yüzey bir şey söylüyor
> mu, sistem ödül alabilecek bir editoryal dil mi?
>
> ⚠ **Kural yazmak burada AMAÇ DEĞİL, araçtır.** Bir estetik karar tekrarlanabilir hâle
> gelmişse kurala bağlanır; gelmemişse bağlanmaz. Ölçemediğim bir şeye kural yazmaktansa
> **bakarak** karar verip gerekçesini yazmak yeğdir (bu depoda üç kez böyle yapıldı).
>
> ⚠ **YAYIN BU FAZIN DIŞINDA.** Karoseller üretilir, kapıları geçilir, yayınlanmaz.
> ⚠ **Sıra bağlayıcı:** tasarım bitmeden temizlik, temizlik bitmeden üretim yok.

---

## 19.1 — Tasarım uzmanı denetimi: dışarıdan bir GÖZ    [ ]

📖 `docs/referans/arastirma-2026-08.md`
🛠 Kıdemli editoryal/marka tasarımcısı gözüyle on şablon tek tek eleştirilir. İstenen şey
   kural uygunluğu DEĞİL: hiyerarşi, ağırlık dağılımı, yüzey dili, ritim, "neye benziyor".
✅ Çıktı: şablon başına **en güçlü** ve **en zayıf** yan · sistem düzeyinde öncelikli
   müdahale listesi · eksik arketipler
✅ Eleştiri **somut** olmalı: *"boşluk kötü"* değil, *"başlık ile figür aynı görsel
   ağırlıkta, göz nereye gideceğini bilmiyor"*
⚠ Övgü çıktı sayılmaz; en sert madde en değerli maddedir

## 19.2 — Tipografi: ölçek, ağırlık, ritim    [ ]

🔗 19.1
🛠 Dört aile (Display · Baslik · Metin · Mono) var ama **kullanımları** denetlenmedi.
   Bakılacaklar: başlık/gövde kontrast oranı, satır aralığı Türkçe aksanda, ölçü bandı,
   vurgu kelimesinin yeri ve sıklığı, üst etiketin ağırlığı.
✅ Her değişiklik ÖNCESİ/SONRASI yan yana konur ve BAKILIR
⚠ `satirAraligi` ayarı sonucu ÖNGÖRMÜYOR (ölçüldü): sıkışmayı karşılaşan aksan çifti
   belirliyor. Bu yüzden burada ölçü değil GÖZ karar verir → `docs/kurallar/OLCUMLER.md`

## 19.3 — Zemin ve yüzey: siyah bir dikdörtgen tasarım değildir    [ ]

🔗 19.1
🛠 Bugün zeminler düz. D-318 degradeyi ve glow'u emekli etti, D-319 dili *"yüzey adımı +
   1 px hairline"* diye yazdı — ama şablonların çoğunda **yüzey hiç yok**: tek düz alan.
✅ Yüzey adımı, kenar ışığı, kâğıt/mürekkep ayrımı, alan sınırı gibi araçlarla her
   şablonun zemini bir ŞEY söyler hâle gelir
⚠ Degrade/glow YASAK olmaya devam ediyor — çözüm atmosfer değil KATMANLANMA

## 19.4 — Kompozisyon: hiyerarşi ve iç slaytlar    [ ]

🔗 19.1
🛠 Bugüne kadar hep KAPAKLARA bakıldı. İç slaytlar tek tek çizilir ve bakılır; bilinen
   ilk hedef `sahne` 2. slayt (metin ortada asılı, sağı ve altı boş).
✅ Her zayıf slaytta: gözün gittiği yer belirlenir, ağırlık yeniden dağıtılır
✅ Boşluk KASITLI ise öyle yazılır — "sonra bakarız" boşluğu kusurdur

## 19.5 — Görsel dili: kesik özne nasıl yerleşir    [ ]

🔗 19.1
🛠 Kesik özneler bugün "yapıştırılmış" durabiliyor: ölçek, kırpma, temas gölgesi, zeminle
   ton uyumu ve kesim üstü konum birlikte denetlenir.
✅ Özne kompozisyonun PARÇASI mı yoksa üstüne konmuş bir nesne mi — bakılarak karar verilir

## 19.6 — Referans araştırması ve eksik arketipler    [ ]

🔗 19.1
🛠 On şablonun kapsamadığı arketipler araştırılır (web + eldeki araştırma).
✅ Öneri = kaynak + kompozisyon iddiası + sürekliliği nasıl kuracağı
⏭ Yeni şablon eklemek şart değil; on yetiyorsa gerekçesi yazılır

## 19.7 — Kapı körlükleri kapanır (D26 · D27)    [ ]

📖 `docs/BORCLAR.md`
🛠 **D27:** `sus-metni-kesiyor` süsün GÖRSELİ kesmesini ölçmüyor (`sahne`nin yayları
   öznenin %10'unu kesiyordu, denetim sessizdi).
🛠 **D26:** prova sığmayan düzeni durduruyor ama düzeltmiyor; tur açılır.
✅ İkisi de KASTEN ihlal edilir ve kırmızı döndüğü görülür

## 19.8 — Sistem temizliği: enkaz ELENİR, defter SİLİNMEZ    [ ]

📖 §3.5 · Yasa 11
🛠 163 koşu: 80 kapıda, 67 durdu, **12 kusurlu manifest**. Panelin `ele` mekanizmasıyla.
✅ ⚠ **SİLME YOK.** `elendi.json` yazılır, koşu listeden kalkar, kayıt yerinde kalır
✅ 12 kusurlu manifest elenmeden ÖNCE neden kusurlu oldukları yazılır
🧪 Panel `#/gecmis` açılır ve BAKILIR

## 19.9 — Üç tanıtım karoseli, PANELDEN    [ ]

📖 `LOOP§H` · §13
🔗 19.2 · 19.3 · 19.4 · 19.5 · 19.8
🛠 Firma tanıtımı: **kim** · **ne yapar** · **vizyon/nasıl çalışır**. Panelden başlatılır,
   kapılar panelden geçilir.
✅ Üçü YAN YANA: tek ızgarada **bir aile** okunmalı (R-107)
💾 çalıştırma commit'i

## 19.10 — Dokuz karosel: ürün · iş · önem    [ ]

🔗 19.9
🛠 Ürün tanıtımı, işin anlatımı, neden önemli, süreç, kanıt/vaka, sık soru, karşılaştırma,
   adım adım rehber, çağrı.
✅ Şablon dağılımı ÖLÇÜLÜR — on iki karosel tek şablona yığılmaz
✅ On iki karosel tek ızgarada: aile okunuyor, tekrar yok
💾 çalıştırma commit'leri (defterler TEK commit'te)

## 19.11 — Kapanış: dur ve depo sahibini bekle    [ ]

🔗 19.10
✅ `just verify` yeşil · `just izgara` sıfır kusur · panel açılıp BAKILDI
⛔ **YAYIN YAPILMAZ** — depo sahibinin kararı (Yasa 2)
