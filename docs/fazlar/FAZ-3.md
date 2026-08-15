# FAZ 3 — Görsel üretim hattı uçtan uca ★

**Amaç:** Sistem gerçek bir carousel üretsin, sen onaylayasın, elle paylaşasın.
**Yöneten kararlar:** D-2, D-13, D-21, D-22, D-23, D-24, D-32
**Ön koşul:** FAZ 2 kapalı
**Çıkış kriteri:** Gerçek bir carousel üretildi ve onaylandı · QA skorları, maliyet ve
dönem damgası manifest'te · golden tipografi testi yeşil ve **fontu bozunca kırmızı**

---

## 3.1 — `COMPOSE` (saf) + `RENDER` mode:static    [x] 2026-08-15

📖 §7.1 · R-30 · D-21, D-24
🔗 FAZ-2.10
🛠 `COMPOSE` saftır ve **belge modeli** üretir; `RENDER` Playwright + React şablon + token
   CSS + gömülü fontla PNG basar. **`RENDER` `RecordEnvelope` GÖRMEZ**, yalnız belge
   modelini — varlığa özgü veriye yasal yol `SELECT → unsealAttributes → COMPOSE` (§3.2).
   Chromium'u başlatan tek yer `packages/render/src/browser.ts` (§3.8).
📁 `packages/render/src/browser.ts` · `packages/kernel/src/verbs/compose.ts`
✅ `just test static` → 8 test · gerçek Chromium **1080×1350 PNG** üretti (boyut PNG'nin
   IHDR başlığından okundu, Playwright'ın kendi iddiasından değil) · gerçek marka
   token'larıyla render edildi ve gözle doğrulandı: Türkçe glifler eksiksiz, başlık
   **küçülmeden iki satıra bölündü** · `just test registry` → 6 test
🧪 Üçü de koşuldu: zarfı `renderStatic`e geçir → `error TS2345: Argument of type
   'RecordEnvelope' is not assignable to parameter of type 'DocumentModel'` (grep değil,
   TİP) · ikinci `chromium.launch()` → `chokepoints` kırmızı · `metered: false` gövde
   enjekte et → `VERB_CONTRACT_MISMATCH`, bütçe kapısı atlanamıyor
   ⚠ Marka fontu henüz yok (V-02): render DejaVu Sans ile koşuyor ve Türkçe glifleri
   eksiksiz veriyor. Golden metrik (FAZ-3.2) fonta bağlı kalmaya devam ediyor
💾 `feat(render): COMPOSE ve statik RENDER` · `Refs: FAZ-3.1 · §7.1`

## 3.2 — Golden-file tipografi testi (JSON metrik)    [x] 2026-08-15

📖 §7.2, §15 · R-31 · 🔗 FAZ-1.10b
🛠 `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` her şablon boyutunda render edilir. **Commit edilen golden bir
   PNG DEĞİL, JSON metriktir**: glyph kutuları, satır sayısı, ilerleme genişliği, font
   ailesi, `notdef` sayısı = 0. Piksel referansı içerik-adresli depoda, sha256 ile anılır.
📁 `packages/render/src/golden/` · `test/golden/*.metrics.json`
✅ `just golden` gerçek metrik üretiyor · `notdef` = 0
🧪 **Fontu kasten boz** (yanlış ada yönlendir) → metrik değişiyor, build DÜŞÜYOR.
   Konteyner içinde sessiz glyph fallback bu sistemin bozuk varlık üretmesinin en muhtemel
   yolu ve metrik onu pikselden güvenilir yakalar (antialiasing gürültüsü yok).
💾 `feat(render): golden tipografi metrikleri` · `Refs: FAZ-3.2 · §7.2`

## 3.3 — Kapalı `LayoutEnum`, taşma otomatik böler    [x] 2026-08-15

📖 §7.1 · R-23
🔗 3.1
🛠 Dört başlangıç düzeni, kapalı birleşim. **Taşma otomatik BÖLER, asla küçültmez** —
   tipi küçültmek Türkçe metinde okunabilirliği bitirir ve sorunu gizler (§12.3).
📁 `packages/render/src/layout/`
✅ `just test layout` → 11 test · gerçek render ile kanıt: taşan içerik **iki slayda**
   bölündü ve ikinci slayt AYNI puntoyla basıldı (`1080×1350 · 2 blok` + `· 1 blok`) ·
   dört düzenin dördü de sonlanıyor, her blok TAM OLARAK bir slaytta
🧪 Sahte-yerelleştirme yerine GERÇEK uzun Türkçe metin: taşıyor ve sebebi yazılı
   (`başlık bütçesi aşıldı (76/68 karakter)`) · **dönen yapıda ÖLÇEK alanı YOK** —
   kural, yazılmayan alanla zorlanıyor: imza bir çarpan taşısaydı biri onu kullanırdı ·
   tek başına sığmayan blok kendi slaydına konup `oversized` İŞARETLENİYOR (sessizce
   kırpmak ve küçültmek yasak olan iki şey; üçüncü yol açıkça işaretlemek)
💾 `feat(render): kapalı düzen kümesi ve taşma bölme` · `Refs: FAZ-3.3 · §7.1`

## 3.4 — Sağlayıcı tanımlayıcısı ve içe aktarıcı    [x] 2026-08-15

📖 §8.1, §8.4 · R-42, R-43 · V-04
🔗 FAZ-1.14
🛠 `registry/providers/*.provider.yaml` tanımlayıcıları; adaptör sözleşmesi FAZ-1.14'te
   donduruldu. fal/OpenRouter OpenAPI içe aktarıcı **ve elle yazma yedeği** — **V-04 burada
   kapanır** (fal'ın endpoint başına OpenAPI URL'i belgelenmiş public arayüz mü).
   Fiyat anlık görüntüleri `registry/providers/_pricing/` altında, değişmez ve commit'li.
📁 `registry/providers/*.provider.yaml` · `packages/providers/src/import.ts`
✅ `just gate providers` her tanımlayıcıyı sözleşmeye karşı doğruluyor
🧪 `estimate()`'i `async` yap → **derleme hatası** (R-42) · sağlayıcı SDK tipini dışa sızdır
   → `rings`/lint kırmızı (R-43)
💾 `feat(providers): tanımlayıcı formatı ve içe aktarıcı` · `Refs: FAZ-3.4 · §8.1`

## 3.5 — Yetenek yönlendiricisi ve bütçe kapıları    [x] 2026-08-15

📖 §8.2, §8.3 · R-40 · D-2, D-17, D-32
🔗 3.4
🛠 ~300 satır, tablo tabanlı: **filtrele** (yetenek + tipli kısıt + enabled) → **fiyatla**
   (QuickJS'te maliyet formülü, 10 ms deadline, USD→TRY günlük TCMB anlık görüntüsü) →
   **skorla** (kalite/maliyet/gecikme, `prefer:` ağırlıklı) → **yedek zinciri** →
   **kaydet**: kazananı VE **her kaybedeni gerekçesiyle** manifest'e (§13).
   Tavanlar UI'dan ayarlanır; tahminin üst sınırı tavanı aşarsa Başlat **kilitlenir**.
📁 `packages/engine/src/router/`
✅ `just plan` gerçek aralık ve seçilen sağlayıcıyı basıyor · kaybedenler manifest'te
🧪 Bütçe tavanını aşan çalıştırma dene → Başlat kilitli, gerekçe **Türkçe** ·
   pipeline'a model adı yaz → `registry` kapısı kırmızı (R-40)
💾 `feat(engine): yetenek yönlendiricisi ve bütçe kapıları` · `Refs: FAZ-3.5 · §8.2`

## 3.6 — Retry, idempotency, rate limit bağlanması    [x] 2026-08-15

📖 §8.5, §8.6 · R-44, R-45
🔗 3.5
🛠 FAZ-1.12'deki motor gerçek sağlayıcılara bağlanır: devre kesici `(providerId,
   capability)` anahtarıyla canlı, idempotency anahtarı her üretim çağrısında,
   `Retry-After` başlığı okunur. **Webhook YOK** — yerel makine NAT arkasında; uzun işler
   jitter'lı polling ile izlenir ve iş tutamağı `derived/runs/` altında kalıcıdır.
📁 `packages/engine/src/scheduler.ts` (FAZ-1.12 üstüne genişletilir)
✅ `just test provider-contract` yeşil · **ağ kapalıyken koşuyor** — msw handler'sız
   sunucu + `request:start` sayacı: yutulmuş bir `fetch` bile yakalanıyor (D-104).
   ⚠ Cassette KULLANILMIYOR: cassette kayıtlı bir yanıtı oynatır, bu test ise hiçbir
   isteğin YAPILMADIĞINI iddia eder. İkisi farklı şeyler; cassette'ler gerçek sağlayıcı
   yanıtları kaydedilince (V-16) anlamlı olacak.
🧪 Bir işi SIGKILL ile kes → yeniden başlatınca kaldığı yerden devam, **çift ücret yok**
💾 `feat(engine): retry ve idempotency sağlayıcılara bağlandı` · `Refs: FAZ-3.6 · §8.5`

## 3.7 — `GENERATE` yeteneği `"image.generate"`    [ ] BLOKE: V-16

📖 §7.3, §8.2 · R-20 · D-2
🔗 3.5
🛠 **İki şerit, sözleşmede donmuş** (`free` | `premium`); `free` içinde ucuz/orta model
   seçimi yönlendiricinin işi, üçüncü şerit değil. **Her prompt'ta "no text, no lettering"**
   (R-20): Ideogram kendi dokümanında aksanlı Latin'i render edemeyebileceğini kabul ediyor.
📁 `packages/providers/src/image/`
✅ İki şerit de görsel üretiyor · üretilen görselde metin YOK
🧪 Prompt'a Türkçe metin isteği koy → `buildImagePrompt` REDDEDİYOR
   (`packages/providers/src/image/prompt.ts`; `lexicon` kapısı prompt taramaz —
   o pipeline KISITLARINI tarar, D-143). Ayrıca `no_text: false` yazmayı dene →
   `lexicon` kapısı kırmızı.
💾 `feat(providers): image.generate iki şeritli` · `Refs: FAZ-3.7 · §7.3`

## 3.8 — Marka LoRA    [ ]

📖 §7.3 · D-17
🔗 3.7 · 🔴 ~$3 harcar
🛠 fal krea-2-trainer ile marka LoRA'sı. Rapordaki en yüksek kaldıraçlı üç dolar.
   Eğitim girdisi ve çıktısı `derived/runs/` altında; hangi görsellerle eğitildiği kayıtlı.
📁 `registry/providers/_lora/` · `derived/runs/<run_id>/lora/`
✅ LoRA'lı ve LoRA'sız aynı brief → yan yana karşılaştırma, fark ölçülebilir
🧪 Bütçe tavanı $3'ün altındayken eğitimi başlat → reddediliyor
💾 `feat(providers): marka LoRA eğitimi` · `Refs: FAZ-3.8 · §7.3`

## 3.9 — Marka QA: ΔE, palet, CLIP, güvenli alan    [x] 2026-08-15

📖 §11.1, §12 · D-22
🔗 3.7
🛠 ΔE2000 (kendi implementasyonumuz, D-109) · palet payı · metin kaplama · en-boy sapması.
   Sonuç **rozet değil TOLERANS OKUMASI**: `ΔE 2.4 / limit 5.0` sana kenara ne kadar yakın
   olduğunu söyler, "✓ uygun" hiçbir şey söylemez (§12).
   ⚠ **CLIP brief uyumu, estetik skor ve Tesseract güvenli-alan FAZ 9'a ERTELENDİ**
   (D-147): üçü de model tabanlı yargı ve bu adım deterministik ölçüme dayanıyor.
   `culori`/`node-vibrant` de düştü — kendi ΔE'miz bağımsız referans veriyle doğrulandı
   (D-109), `sharp`/`tesseract` yerine Chromium kullanıldı (D-110).
📁 `packages/render/src/qa/`
✅ `just test qa` yeşil · her metrik limit karşısında sayı döndürüyor
🧪 Palet dışı renk oranı limiti aşan görsel ver → **SINIR DIŞI** işaretleniyor
💾 `feat(render): marka QA tolerans okumaları` · `Refs: FAZ-3.9 · §11.1`

## 3.10 — Deterministik lexicon linter    [x] 2026-08-15

📖 §11.2, §11.4 · R-32, R-35 · D-22
🛠 Modele "bu marka uygun mu" **sorulmaz** — listeye bakılır: yasak terim, kaynaksız
   sayısal iddia, token dışı hex, eksik alt-text, locale-naif Türkçe casing.
   Sorulan model neredeyse her şeye evet der.
📁 `packages/render/src/lexicon/`
✅ `just gate lexicon` yeşil · yasak terim içeren metin yayınlanamıyor
🧪 Kaynaksız sayı yaz ("1.247 ilan") → `claim_source` eksik diye reddediliyor (R-32)
💾 `feat(render): deterministik lexicon linter` · `Refs: FAZ-3.10 · §11.2`

## 3.11 — Uyum kapısı ve PNG damgası    [x] 2026-08-15

📖 §11.3 · R-33 · D-23
🛠 `containsSyntheticPerson=false` **kod seviyesinde iddia** (tip `false` literali:
   `true` yazan bir iddia DERLENMEZ) · `aiGenerated` işareti · **kendi PNG `iTXt`
   damgamız** — ExifTool düşürüldü (D-115): kurulu değil ve gözetimsiz bir çalıştırmada
   var olduğu varsayılan bir sistem ikilisi, §16'nın vaadiyle bağdaşmıyor.
   Reklam Yönetmeliği Md. 27/12, 1 Ağu 2026'dan yürürlükte.
   ⚠ Damga **IPTC değil**, `Upcytech:*` özel anahtarlarıdır. Md. 27/12 ifşasının
   platformlarca makine-okunur olması ayrı bir iş ve FAZ 7'ye ait (V-17).
📁 `packages/render/src/compliance/`
✅ `just gate compliance` yeşil · her varlık `Upcytech:*` damgası taşıyor
🧪 Sentetik insan içeren varlığı onaylamayı dene → **kod seviyesinde** bloklanıyor
💾 `feat(render): uyum kapısı ve IPTC damgası` · `Refs: FAZ-3.11 · §11.3`

## 3.12 — Varlık CAS ve R2 senkronu    [x] 2026-08-15

📖 §3.5 · R-64 · D-38
🛠 `derived/blobs/<ab>/<sha256>.<ext>` içerik-adresli + `<sha256>.meta.json` sidecar.
   R2 senkronu ~60 satır. **512KB üstü dosya git'e girmez** (R-64); Git LFS kullanılmaz.
📁 `packages/engine/src/blobs.ts` · `derived/blobs/<ab>/` (D-118)
✅ `just gate repo-hygiene` yeşil · varlık byte'ları git'te değil
🧪 512KB üstü dosyayı commit'lemeyi dene → engelleniyor
💾 `feat(corpus): içerik-adresli varlık deposu` · `Refs: FAZ-3.12 · §3.5`

## 3.13 — Run manifest yazıcı    [x] 2026-08-15

📖 §13 · R-11 · D-38
🔗 FAZ-1.9
🛠 FAZ-1.9'daki sözleşme gerçek çalıştırmalara bağlanır: `knowledgeCommitSha`, dönem
   damgası, tahmini vs gerçek maliyet, kaybeden sağlayıcılar. `derived/runs/` **silinmez**.
📁 `packages/engine/src/manifest-writer.ts`
✅ Her üretilmiş varlığın manifest'i var ve `inspectManifest()` temiz
🧪 Manifest'siz varlık yayınlamayı dene → reddediliyor
💾 `feat(engine): run manifest yazıcı` · `Refs: FAZ-3.13 · §13`

## 3.14 — `instagram-post` + `instagram-carousel` uçtan uca ★    [ ] BLOKE: FAZ-2.9

📖 §10 · D-13
🔗 3.9, 3.13
🛠 CLI'dan uçtan uca: bağlam → metin → görsel → kompozit → render → QA → onay kuyruğu.
   **Fazın yıldızı bu adım.**
📁 `registry/pipelines/instagram-post.pipeline.yaml` · `…-carousel.pipeline.yaml`
✅ Gerçek bir carousel üretildi; QA skorları, maliyet ve dönem damgası manifest'te
🧪 Bütçe tavanını aşan bir carousel dene → Başlat kilitli
💾 `feat(cli): instagram-post ve carousel uçtan uca` · `Refs: FAZ-3.14 · §10`

## 3.15 — `linkedin-post`    [x] 2026-08-15

📖 §10, §9.1
🔗 3.14
🛠 Aynı motor, farklı spec: ≤5MB kalite merdiveni. Platform ölçüleri `sourceUrl` +
   `verifiedAt` ile kod olarak tutulur (§9.1).
📁 `registry/pipelines/linkedin-post.pipeline.yaml`
✅ LinkedIn spec'ine uyan görsel üretiliyor · boyut sınırı aşılmıyor
🧪 5MB üstü çıktı üret → kalite merdiveni devreye giriyor, sessizce yayınlanmıyor
💾 `feat(cli): linkedin-post` · `Refs: FAZ-3.15 · §10`
