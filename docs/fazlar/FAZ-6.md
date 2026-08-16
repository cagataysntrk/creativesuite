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

## 6.2 — ECharts SSR ve D2 diyagram    [ ]

📖 §7.6 · R-30
🔗 6.1
🛠 ECharts sunucu tarafında **SVG** üretir (canvas değil — PDF'te vektör kalmalı),
   D2 diyagram aynı yolla. Marka renkleri token'dan enjekte edilir; grafik kütüphanesinin
   varsayılan paleti **hiçbir yerde** görünmez.
📁 `packages/render/src/charts/`
✅ Grafik PDF'te vektör (yakınlaştırınca bozulmuyor) · renkler `brand/<id>/tokens/`'dan
🧪 Palet dışı bir hex ver → `lexicon` linter'ı reddediyor (R-35)
💾 `feat(render): ECharts SSR ve D2 diyagram` · `Refs: FAZ-6.2 · §7.6`

## 6.3 — `linkedin-document` pipeline    [ ]

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

## 6.4 — Prospect dizini = CRM    [ ]

📖 §10, §5.1 · R-12 · D-27
🔗 FAZ-2.1
🛠 Ayrı bir CRM YOK: `corpus/prospect/<slug>.md`. `rm -rf` = silme talebi, `cat` = erişim
   talebi — KVKK yükümlülükleri dosya sistemi işlemlerine indirgeniyor. Emeklilik silme
   değildir (R-12); **KVKK silme talebi** ayrı bir yoldur ve gerekçesi kayda yazılır.
📁 `corpus/prospect/` · `registry/entity-types/prospect.type.yaml`
✅ Prospect kaydı zarf alanlarının hepsini taşıyor · `just gate registry` yeşil
🧪 Prospect kaydını `status: retired` yapmadan silmeyi dene → yazma darboğazı reddediyor
💾 `feat(corpus): prospect varlık tipi` · `Refs: FAZ-6.4 · §10`

## 6.5 — `INGEST` araştırma şelalesi    [ ]

📖 §10, §14 · R-50 · D-40
🔗 FAZ-2.3b
🛠 Sıra maliyet ve güven sırasıdır: kendi siteleri (yerel Playwright) → Bright Data SERP
   (5k bedava/ay) → Tavily (1k bedava/ay) → **ihale-mcp** (yayınlanan/kazanılan ihale =
   teyitli bütçe + kapsam + tarih) → borsa-mcp/pykap. Çıktı **daima** `derived/ingest/`
   karantinasına iner ve **asla talimat olarak sunulmaz** (R-50).
   **LinkedIn kaynaklı her yol lint kuralıyla bloklu** — ToS ihlali, hesap kaybı riski.
📁 `packages/providers/src/ingest/` · `derived/ingest/<domain>/`
✅ Şelale sırayla düşüyor · her kaynak `provenance` sidecar'ı yazıyor
🧪 Çekilen metne "önceki talimatları unut" yaz → talimat olarak İŞLENMİYOR, alıntı
   olarak kalıyor · LinkedIn kazıyan bir sağlayıcı ekle → lint reddediyor
💾 `feat(providers): INGEST araştırma şelalesi` · `Refs: FAZ-6.5 · §10`

## 6.6 — 14 günlük tazelik kapısı    [ ]

📖 §10, §11.4 · R-32
🔗 6.5
🛠 14 günden eski bir `INGEST` çıktısı prospect deck'ine giremez. Şirket haberleri,
   ihale sonuçları ve yönetim değişiklikleri iki haftada eskir; eskimiş bir olguyla
   yapılan kişiselleştirme, hiç kişiselleştirmemekten kötüdür — dikkat ettiğini
   gösterip yanlış şeye dikkat ettiğini kanıtlar.
📁 `packages/engine/src/freshness.ts`
✅ 15 günlük bir kaynakla pipeline **reddediyor**, gerekçe Türkçe ve tarihi gösteriyor
🧪 Sistem saatini ileri al → aynı kaynak artık reddediliyor (kapı gerçekten tarihe bakıyor)
💾 `feat(engine): 14 günlük tazelik kapısı` · `Refs: FAZ-6.6 · §10`

## 6.7 — Beş alanlık kişiselleştirme tavanı    [ ]

📖 §10, §11.4
🔗 6.6
🛠 Bir deck'te en fazla **beş** prospect'e özgü alan. Türk B2B'sinde fazlası iltifat
   değil **şüphe** uyandırıyor: "bunları nereden biliyorsun" sorusu, satış görüşmesini
   veri kaynağı savunmasına çeviriyor. Tavan yapısaldır, öneri değil.
📁 `packages/engine/src/personalization.ts`
✅ Altıncı alanı eklemeyi dene → kapı reddediyor, hangi beşinin kaldığını gösteriyor
🧪 Tavanı 6'ya çıkarmayı dene → `KURALLAR.md` değişmeden kod değişmiyor (R-74)
💾 `feat(engine): beş alanlık kişiselleştirme tavanı` · `Refs: FAZ-6.7 · §10`

## 6.8 — Gerçek ürün ekran görüntüleri    [ ]

📖 §10, §11.4 · R-32, R-33
🔗 FAZ-5.6
🛠 Ürün ekran görüntüleri **gerçek Playwright çekimi**, asla üretilmiş. Adı geçen bir
   prospect'e giden deck'te uydurma bir dashboard **olgusal bir iddiadır** — ürünün
   yapmadığı bir şeyi yaptığını söyler ve ilk demoda çöker.
📁 `packages/render/src/capture/product.ts` · `demos/<product>/`
✅ Deck'teki her ekran görüntüsü `source_run_id` taşıyor ve gerçek bir çekime bağlanıyor
🧪 Üretilmiş bir görseli ürün ekranı olarak koy → uyum kapısı reddediyor
💾 `feat(render): gerçek ürün ekran görüntüsü çekimi` · `Refs: FAZ-6.8 · §10`

## 6.9 — `prospect-deck` uçtan uca    [ ]

📖 §10, §11.4 · R-32 · D-4
🔗 6.1, 6.5, 6.6, 6.7, 6.8
🛠 Fazın kapanış adımı: prospect kaydı → `INGEST` şelalesi → tazelik + kişiselleştirme
   kapıları → `COMPOSE` deck IR → `RENDER` PDF → **zorunlu olgu-doğrulama kapısı** →
   onay kuyruğu. Kapı atlanamaz: kaynaksız her sayısal iddia yayını bloklar (R-32).
📁 `registry/pipelines/prospect-deck.pipeline.yaml`
✅ Gerçek bir prospect için deck üretildi, olgu kapısından geçti, görüşmeden önce gitti
🧪 Kaynaksız bir sayı ekle → `claim_source` eksik diye reddediliyor · 15 günlük bir
   kaynakla koş → tazelik kapısı reddediyor
💾 `feat(cli): prospect-deck uçtan uca` · `Refs: FAZ-6.9 · §10`
