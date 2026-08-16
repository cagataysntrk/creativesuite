# FAZ 6 — Deck, döküman, prospect

**Amaç:** Gerçek bir görüşme öncesi gerçek bir prospect'e özel deck teslim edildi.
**Yöneten kararlar:** D-4, D-21, D-24, D-40
**Ön koşul:** FAZ 5 kapalı
**Çıkış kriteri:** Adı geçen gerçek bir şirkete özel deck üretildi, olgu-doğrulama
kapısından geçti ve görüşmeden önce gönderildi · deck'teki her sayısal iddia
`claim_source` taşıyor · uydurma ekran görüntüsü YOK

---

## 6.1 — Deck IR ve `page.pdf()`    [x] 2026-08-16

📖 §7.6, §7.1 · R-30 · D-21, D-24
🔗 FAZ-3.1
🛠 Kapalı `LayoutEnum` + React sayfa şablonları → Playwright `page.pdf()`. **Üçüncü
   renderer YOK** (R-30): deck aynı Chromium'u, aynı fontu, aynı token'ları kullanır.
   `deck.ir.json` **kaynaktır**, PDF build çıktısıdır — benzer bir deck geldiğinde
   LLM yeniden koşturulmaz, IR kopyalanıp düzenlenir.
📁 `packages/render/src/deck/` · `registry/pipelines/deck.pipeline.yaml`
✅ `deck.pdf` üretiliyor, düzleştirilmiş, metin seçilebilir · golden tipografi metriği
   deck boyutunda da yeşil
🧪 Gamma/Presenton gibi hazır bir üretici bağlamayı dene → `chokepoints` reddediyor
   (D-21: prospect'e giden hiçbir şeye dokunmaz)
💾 `feat(render): deck IR ve PDF çıktısı` · `Refs: FAZ-6.1 · §7.6`

## 6.2 — Grafik ve diyagram (SSR, vektör)    [x] 2026-08-16

📖 §7.6 · R-30
🔗 6.1
🛠 Grafik sunucu tarafında **SVG** üretir (canvas değil — PDF'te vektör kalmalı),
   diyagram aynı yolla. Marka renkleri token'dan enjekte edilir; hazır bir kütüphanenin
   varsayılan paleti **hiçbir yerde** görünmez.
   ⚠ **ECharts ve D2 ölçülüp REDDEDİLDİ** (D-209, D-210): ikisi de metin genişliğini
   kendi tahmin ediyor ve Türkçe'de %83'e varan sapma veriyor. Geometri SVG, metin HTML.
📁 `packages/render/src/charts/`
✅ Grafik PDF'te vektör (yakınlaştırınca bozulmuyor) · renkler `brand/<id>/tokens/`'dan
🧪 Palet dışı bir hex ver → `lexicon` linter'ı reddediyor (R-35)
💾 `feat(render): ECharts SSR ve D2 diyagram` · `Refs: FAZ-6.2 · §7.6`

## 6.3 — `linkedin-document` pipeline    [x] 2026-08-16

📖 §10, §9.3 · R-11
🔗 6.1
🛠 Düzleştirilmiş PDF, ≤10 sayfa. **Veri bağlama anlık görüntülenir**: Mart'ta paylaşılan
   doküman Haziran'da hâlâ Mart rakamını gösterir. Canlı bağlama, geçmişte paylaşılmış
   bir belgeyi sessizce değiştirir — yayınlanmış bir iddiayı geriye dönük değiştirmek
   düzeltme değil, tahrifattır.
📁 `registry/pipelines/linkedin-document.pipeline.yaml`
✅ ≤10 sayfa · LinkedIn döküman yükleme spec'ini geçiyor · veri damgası sayfada görünür
🧪 Kaynak kaydı değiştir, dokümanı yeniden aç → **eski değer** duruyor
💾 `feat(cli): linkedin-document pipeline` · `Refs: FAZ-6.3 · §10`

## 6.4 — Prospect dizini = CRM    [x] 2026-08-16

📖 §10, §5.1 · R-12 · D-27
🔗 FAZ-2.1
🛠 Ayrı bir CRM YOK: `corpus/prospect/<slug>.md`. Erişim talebi bir okuma, silme talebi
   `kvkkErasure` — KVKK yükümlülükleri dosya sistemi işlemlerine iniyor. Emeklilik silme
   değildir (R-12); **KVKK silme talebi** ayrı bir yoldur ve gerekçesi kayda yazılır.
   ⚠ **Silme DOSYAYI silmiyor** (D-212): kişisel alanlar silinir, kişisel veri taşımayan
   bir mezar taşı kalır. Düz dosya silme hem köken zincirini koparır hem de silmenin
   yapıldığına dair kanıtı yok eder — KVKK'da gösteremediğin şey yapılmamıştır.
📁 corpus/prospect dizini (henüz kayıt yok — V-25) · `registry/entity-types/prospect.type.yaml`
✅ Prospect kaydı zarf alanlarının hepsini taşıyor · `just gate registry` yeşil
🧪 Üç ihlal: corpus paketine dosya silme çağrısı ekle → `corpus-silici` reddediyor ·
   gerekçesiz `kvkkErasure` çağır → reddediyor · aydınlatmasız kişisel veri taşıyan
   prospect kaydı yaz → `prospect-kvkk` reddediyor
💾 `feat(corpus): prospect varlık tipi` · `Refs: FAZ-6.4 · §10`

## 6.5 — `INGEST` araştırma şelalesi    [x] 2026-08-16

📖 §10, §14 · R-50 · D-40
🔗 FAZ-2.3b
🛠 Sıra maliyet ve güven sırasıdır: kendi siteleri (**tek HTTP istemcisi — tarayıcı YOK**,
   D-213: `INGEST` bir tarayıcı açsaydı prospect sitesinin JavaScript'ini çalıştırırdı ve
   §14 sınırının altını oyardı) → Bright Data SERP
   (5k bedava/ay) → Tavily (1k bedava/ay) → **ihale-mcp** (yayınlanan/kazanılan ihale =
   teyitli bütçe + kapsam + tarih) → borsa-mcp/pykap. Çıktı **daima** `derived/ingest/`
   karantinasına iner ve **asla talimat olarak sunulmaz** (R-50).
   **LinkedIn kaynaklı her yol lint kuralıyla bloklu** — ToS ihlali, hesap kaybı riski.
📁 `packages/providers/src/ingest/` · `derived/ingest/<domain>/`
✅ Şelale PLANI sırayla düşüyor (`planWaterfall`: hazır/bloke ayrımı raporlanıyor) ·
   `own-site` kaynağı gerçekten çekiyor ve `provenance` sidecar'ı yazıyor
   ⚠ **İddia daraltıldı** (2. doğrulama turu): ilk hâli "şelale sırayla düşüyor"
   diyordu ama `ingestBody` yalnız `own-site`ı çağırıyor — dört uzak kaynağın
   ADAPTÖRÜ YAZILMAMIŞ, yalnız tanımlayıcı tablosu var. Bu V-24 anahtar blokajının
   arkasına saklanmış bir TEKNİK eksikti; `6.5b`nin "kalan iş yalnız bağlantı"
   ifadesi de düzeltildi.
🧪 Çekilen metne "önceki talimatları unut" yaz → talimat olarak İŞLENMİYOR, alıntı
   olarak kalıyor · LinkedIn kazıyan bir sağlayıcı ekle → lint reddediyor
💾 `feat(providers): INGEST araştırma şelalesi` · `Refs: FAZ-6.5 · §10`

## 6.5b — Şelaleye gerçek kaynakları bağla    [ ] BLOKE:insan (V-24)

📖 §10 · R-50
🔗 6.5
🛠 Dört kaynak anahtarsız: `BRIGHTDATA_API_KEY` · `TAVILY_API_KEY` · `IHALE_MCP_URL` ·
   `BORSA_MCP_URL`. **Kalan iş yalnız bağlantı DEĞİL** (2. doğrulama turu): dört
   kaynağın ADAPTÖRÜ de yazılmamış ve `ingestBody` şelale üzerinde iterasyon yapmıyor —
   tek `own-site` çağrısı var. Anahtar geldiğinde yazılacak: dört adaptör + fallback
   döngüsü (bir kaynak boş dönerse sıradakine geç, hepsi raporlanır).
   Karantina, sidecar ve enjeksiyon sınırı yazıldı ve gerçek HTTP çekimiyle doğrulandı;
   anahtarsız kaynak sessizce atlanmıyor, `bloke` işaretleniyor.
✅ `planWaterfall(process.env)` dört kaynağı da `hazir` gösteriyor · her biri gerçek bir
   çekim yapıp `derived/ingest/<domain>/` altına metin + sidecar yazıyor
🧪 Bir anahtarı `doldurulacak` yap → kaynak `bloke` düşüyor, sessizce atlanmıyor
💾 `feat(providers): şelale kaynaklarını bağla` · `Refs: FAZ-6.5b · §10`

## 6.6 — 14 günlük tazelik kapısı    [x] 2026-08-16

📖 §10, §11.4 · R-32
🔗 6.5
🛠 14 günden eski bir `INGEST` çıktısı prospect deck'ine giremez. Şirket haberleri,
   ihale sonuçları ve yönetim değişiklikleri iki haftada eskir; eskimiş bir olguyla
   yapılan kişiselleştirme, hiç kişiselleştirmemekten kötüdür — dikkat ettiğini
   gösterip yanlış şeye dikkat ettiğini kanıtlar.
📁 `packages/kernel/src/freshness.ts` (kernel'de: `inspectManifest` onu çağırıyor)
✅ 15 günlük bir kaynakla pipeline **reddediyor**, gerekçe Türkçe ve tarihi gösteriyor
🧪 Sistem saatini ileri al → aynı kaynak artık reddediliyor (kapı gerçekten tarihe bakıyor)
   ⚠ Saat GERÇEKTEN ileri alınmıyor: karşılaştırma tarihi bir parametre ve kapı
   çalıştırmanın kendi `createdAt`ine bakıyor (R-06). Hem deterministik hem daha güçlü —
   replay yıllar sonra da aynı cevabı veriyor.
   ⚠ Asıl sınav **bağlanma**: `isPublishable` bayat kaynakta `false` dönüyor. Fonksiyonun
   doğru cevap vermesi yetmez, çağıran olması gerekir (D-182'nin dersi).
💾 `feat(engine): 14 günlük tazelik kapısı` · `Refs: FAZ-6.6 · §10`

## 6.7 — Beş alanlık kişiselleştirme tavanı    [x] 2026-08-16

📖 §10, §11.4
🔗 6.6
🛠 Bir deck'te en fazla **beş** prospect'e özgü alan. Türk B2B'sinde fazlası iltifat
   değil **şüphe** uyandırıyor: "bunları nereden biliyorsun" sorusu, satış görüşmesini
   veri kaynağı savunmasına çeviriyor. Tavan yapısaldır, öneri değil.
📁 `packages/kernel/src/personalization.ts` (kernel'de: `inspectManifest` onu çağırıyor)
✅ Altıncı alanı eklemeyi dene → kapı reddediyor, hangi beşinin kaldığını gösteriyor
🧪 Tavanı 6'ya çıkarmayı dene → `kisisellestirme` kapısı AYRIŞMA diye reddediyor
   ⚠ Tavan sayısı koda YAZILMIYOR, `KURALLAR.md` R-36'dan **okunuyor** (D-214): kapı iki
   değeri karşılaştırıyor. Yani kuralı değiştirmenin tek yolu önce kural kitabıdır (R-74).
   ⚠ İkinci bir tanım da yakalanıyor — kapı sabit dosya listesi değil, tüm kaynağı tarıyor.
💾 `feat(engine): beş alanlık kişiselleştirme tavanı` · `Refs: FAZ-6.7 · §10`

## 6.8 — Gerçek ürün ekran görüntüleri    [x] 2026-08-16

📖 §10, §11.4 · R-32, R-33
🔗 FAZ-5.6
🛠 Ürün ekran görüntüleri **gerçek Playwright çekimi**, asla üretilmiş. Adı geçen bir
   prospect'e giden deck'te uydurma bir dashboard **olgusal bir iddiadır** — ürünün
   yapmadığı bir şeyi yaptığını söyler ve ilk demoda çöker.
📁 `packages/render/src/capture/product.ts` · `demos/<product>/`
✅ Deck'teki her ekran görüntüsü `source_run_id` taşıyor ve gerçek bir çekime bağlanıyor
🧪 Üretilmiş bir görseli ürün ekranı olarak koy → uyum kapısı reddediyor
   ⚠ Mekanizma yeni bir bayrak DEĞİL, dördüncü bir **dayanak**: `product_capture`
   (`captureRunId` + `demoRef` zorunlu). `aiGenerated: true` ile birlikte iddia
   edilemiyor — ikisi birden doğruysa biri yalandır ve sistem hangisi olduğunu bilemez,
   o yüzden iddia hiç KURULMUYOR.
   ⚠ Kural iki yerde uygulanıyor ama TEK: üretim anında `assertCompliance`, yayın anında
   `inspectManifest` → `fabricated_product_shot`.
💾 `feat(render): gerçek ürün ekran görüntüsü çekimi` · `Refs: FAZ-6.8 · §10`

## 6.9 — `prospect-deck` zinciri    [x] 2026-08-16

📖 §10, §11.4 · R-32 · D-4
🔗 6.1, 6.5, 6.6, 6.7, 6.8
🛠 Fazın kapanış adımı: prospect kaydı → `INGEST` şelalesi → tazelik + kişiselleştirme
   kapıları → `COMPOSE` deck IR → `RENDER` PDF → **zorunlu olgu-doğrulama kapısı** →
   onay kuyruğu. Kapı atlanamaz: kaynaksız her sayısal iddia yayını bloklar (R-32).
📁 `registry/pipelines/prospect-deck.pipeline.yaml` · `packages/engine/src/prospect-deck.ts`
✅ Zincir beş kapıyı SIRAYLA koşuyor ve ilk hatada duruyor; gerçek çekim + grafik taşıyan
   bir deck uçtan uca PDF'e kadar gidiyor
🧪 Kaynaksız bir sayı ekle → `lexicon` kapısında duruyor · 15 günlük bir kaynakla koş →
   `tazelik` kapısında duruyor (ikisi birden varsa TAZELİK konuşur: ucuz olan önce)
   ⚠ Zincir YENİ KURAL YAZMIYOR — beş kapının sahibi ayrı dosyalarda; burada olan tek
   şey sıra ve ilk hatada durma. Altıncı bir gerçek yazılsaydı diğer beşiyle ayrışırdı.
💾 `feat(engine): prospect-deck zinciri` · `Refs: FAZ-6.9 · §10`

## 6.9b — Gerçek prospect'e deck teslimi    [ ] BLOKE:insan (V-25)

📖 §10, §11.4 · R-32 · D-4
🔗 6.9, 2.9
🛠 Fazın gerçek çıkış kriteri: **adı geçen gerçek bir şirkete** özel deck üretilir, olgu
   kapısından geçer ve görüşmeden ÖNCE gönderilir. Sistem bunu kendi başına yapamaz:
   gerçek bir prospect kaydı insan girdisidir ve uydurulmuş bir şirket, doğruluk
   kaynağına giren bir kurgudur (D-212).
📁 `corpus/prospect/<slug>.md`
✅ Gerçek bir prospect için deck üretildi, olgu kapısından geçti, görüşmeden önce gitti
🧪 Aynı deck'i ikinci kez üret → aynı IR'dan aynı PDF çıkıyor (rerun ≠ replay)
💾 `<özet>` + `Run:` / `Actor:` / `Kind:` (çalıştırma commit'i)

## 6.10 — Denetim bulgularını ÜRETİM YOLUNA bağla    [x] 2026-08-16

📖 §10, §13 · R-70 · D-216, D-182
🔗 6.1–6.9
🛠 Kapanış turunun bulgusu tek sınıfta: **kod yazıldı, üretim yolunda çağıranı yok.**
   Dokuz adımın kodu gerçek ve testli; eksik olan bağlanma. Alt maddeler engeli en çok
   kaldırandan sıralı ve her biri kendi kanıtını üretir.

| # | Bulgu | Durum |
|---|---|---|
| 2 | `deck`/`prospect-deck` plan aşamasında sağlayıcısız (`max_chars` kademesi) | [x] 2026-08-16 |
| 7 | `chart` CSS'i statik yolda gömülmüyor — üretim PNG'sinde bozuk | [x] 2026-08-16 |
| 1 | RENDER gövdesi `format: pdf` kısıtını okumuyor | [x] `%PDF-` ölçüldü |
| 5 | dedektörleri besleyen yok — asıl sebep `ozetle()` beyaz listesiydi | [x] |
| 3 | zincir VALIDATE'te koşmuyor; `chain:` kısıtını kimse okumuyor | [x] |
| 9 | `runVerb` atlanıyor → `ingestGate` (R-50) hiç koşmuyor | [x] |
| 4 | `INGEST` fiil gövdesi yok | [x] |
| 6 | `captureProductShot` sıfır çağıran | [x] |
| 8 | `role: 'product_screenshot'` okuyanı yok — artık `productShots`ın KAYNAĞI | [x] |
| 10 | `renderLinkedinDocument` sıfır çağıran | [x] |
| 11 | `diagram` blok tipi `DocumentModel`de yok | [x] |
| 12 | `kvkkErasure`ın insan girişi yok → `just kvkk-sil` | [x] |

📁 `packages/engine/src/verbs/bodies.ts` · `scripts/uret.mjs` · `packages/engine/src/run.ts`
✅ `just uret deck` gerçek bir PDF üretiyor ve manifest onu gösteriyor · üç dedektör
   gerçek bir manifest'te tetikleniyor · `prospectDeckZinciri`nin üretim çağıranı var
🧪 Her bulgu için: bağlantıyı KALDIR → kapı ya da test kırmızıya dönüyor
   ⚠ **Arada bir tasarım çelişkisi çıktı:** `writeManifest` politika kusurlu manifesti
   HİÇ yazmıyordu — yani kuralı çiğneyen koşu defterden tamamen kayboluyordu. Kusurlar
   ikiye ayrıldı: **biçim** kusuru yazmayı engeller, **politika** kusuru deftere yazılır
   ve yayını `isPublishable` bloklar. İhlalin kaydı olmaması ihlalden kötüdür (D-38).
💾 `fix(engine): <bulgu> üretim yoluna bağlandı` · `Refs: FAZ-6.10 · §13`

