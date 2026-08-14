# PLAN — ARŞİV

> **Bu dosya donmuştur.** FAZ 0'ın kaynağı olan onaylı plan; git'ten değişim
> takibi için repoda tutulur.
>
> **Yaşayan belgeler bunlar değil.** Tek doğru `docs/ANAYASA.md` ve
> `docs/fazlar/FAZ-N.md` dosyalarıdır (D-15). Bir çelişki olursa onlar kazanır.
> İkinci bir yaşayan liste tutmak, kaçınılmaz olarak bayatlayan bir kaynak yaratır.
>
> Kopyalandı: 2026-08-14

---

# Upcytech Creative Suite — Uygulama Planı

Araştırma temeli: 3 dalga · 31 agent · ~3.4M token · 2117 araç çağrısı · 1000+ araç/model/proje
incelendi. Ham çıktılar Faz 0'da `docs/research/` altına kopyalanacak.

---

## 1. Context — neden bunu yapıyoruz

Upcytech (UPCYTECH TEKNOLOJİ A.Ş., kuruluş 3 Tem 2025, İTÜ Tasarım ve Prototip Merkezi)
**konum değiştiriyor**: geri dönüşüm sektörüne odaklı bir yazılımcıdan, imalat sektörüne
AI/ML destekli verimlilik, sürdürülebilirlik, finans, yönetim, sektör istihbaratı ve
raporlama çözümleri üreten bir **özel çözümler + SaaS evine**. Ürün hattı değişken: `dima`
(şirket beyni) gibi kendi markası olacak ürünler var, daha fazlası gelecek, ve bir gün
şirketin tamamı yeniden tanımlanabilir.

Bugün marka, ürün ve strateji bilgisi dağınık; her içerik sıfırdan üretiliyor; marka
tutarlılığı kişisel hafızaya bağlı; hiçbir şey ölçülmüyor. Dış dünyada hâlâ önceki girişim
(UpcyMarket) görünüyor ve pazarlama ~7 aydır sessiz (§3b).

**Hedef:** Git repo'sunu tek doğruluk kaynağı yapan, üstünde yerel bir komuta merkezi
çalışan, ajans işlerini agentic pipeline'larla üreten uçtan uca bir sistem — bugünkü markaya
veya bugünkü ürün listesine **sabitlenmemiş**, şeması ve içeriği çalışma anında
değiştirilebilir.

**Başarı ölçütü:** "Instagram postu hazırla" dediğinde sistem açıları önerir, sen seçersin,
markaya uygun görseli ve Türkçe metni üretir, spec ve marka QA'sından geçirir, onay
kuyruğuna koyar — ve bunu bir yıl sonra tamamen farklı bir marka ve ürün setiyle de aynı
şekilde yapar.

---

## 2. Kesinleşmiş kararlar (decision log)

| # | Karar | Seçim | Gerekçe |
|---|---|---|---|
| D1 | Sistem şekli | Git repo + **yerel** komuta merkezi | Sunucu maliyeti yok, veri sende, git = bedava sürümleme |
| D2 | Maliyet modeli | **Çift şerit** — her adım bedava/premium, çalıştırma anında seçilir, maliyet önceden gösterilir | Kullanıcı ikisini de seçebilmek istiyor |
| D3 | Yayınlama | **Kademeli**: onay kuyruğu → API otomasyonu. *Meta App Review kendi işletmen için gerekli değil* — ramp hızlı | Sistem onay beklemesin, ama engel de sandığımız kadar büyük değil |
| D4 | Öncelikli çıktılar | IG (post/carousel/Reels), LinkedIn (post/döküman/video), şirkete özel deck, görüşme öncesi demo video, tanıtım + reklam | Kullanıcının açık talebi |
| D5 | Bilgi tabanı doldurma | Önce taslak, sonra boşluklar için röportaj | En kaliteli sonuç, orta efor |
| D6 | Marka/DNA üretimi | **Yeniden çalıştırılabilir + sürümlü motor**, tek seferlik dosya değil | "1 yıl sonra sıfırdan kurabileyim" |
| D7 | UI yönü | **Hibrit** — koyu/yoğun kabuk + ferah tam-ekran kreatif yüzeyler | Her işe doğru yüzey |
| D8 | Agent motoru | **Hibrit** — orkestrasyon TypeScript, akıl gerektiren adımlar headless Claude Code | Mevcut abonelik kullanılır, deterministik kısımlar ucuz ve test edilebilir |
| D9 | Marka mimarisi | **Çok markalı, çok dikeyli — baştan** | `dima` ve gelecek ürün markaları |
| D10 | Proaktiflik | **Kademeli** — önce komutla, sonra haftalık öneri | Erken proaktiflik gürültü yaratır |
| D11 | Şema felsefesi | Varlık tipleri ve alanlar **veri**, kod değil | "Bugünkü ürünler üstüne sistem kurmak hatalı olur" |
| D12 | Hafıza yönetimi | Her şey görülebilir, düzeltilebilir, sabitlenebilir, emekliye ayrılabilir | "Tüm memory ve kaynakları istediğim gibi yönetebilmeliyim" |
| D13 | İlk pipeline | **Medya çekirdeği önce** — görsel motoru → IG post + carousel uçtan uca | "En önemlisi görsel ve video işleri, gerisi kolay" |
| D14 | Dil | İçerik/doküman **Türkçe**, kod/şema **İngilizce** | Araçlar İngilizce anahtarlarla daha iyi çalışıyor |
| D15 | Anayasa | `docs/ANAYASA.md` (§ numaralı) + `docs/fazlar/FAZ-0..9.md` (§ referanslı adımlar) + `docs/research/` | Geliştirme boyunca tek referans. Ayrı bir yol-haritası dosyası **yok** — faz dosyaları o işi görüyor, ikinci bir liste kaçınılmaz olarak bayatlar |
| D16 | Gizlilik | **Kısıt yok** — ürün satılmayacak, bedava katmanlar her yerde açık | "SaaS yapmıyoruz, biz kullanacağız" |
| D17 | Bütçe tavanı | Sabit sayı yok — **UI'dan ayarlanır** (aylık / çalıştırma / pipeline bazında) | "Tavanı manuel istediğim gibi belirleyebilelim" |
| D18 | Seslendirme | **Tüm şeritler açık**: kendi kaydın · klonlanmış sesin · bedava TTS · premium TTS | "Çok esnek olsun, 360 derece" |
| D19 | Erişim | **Üçü birden**: yerel PC + Tailscale + Telegram botu | "pc + tailscale + telegram hepsi olsun" |
| D20 | Tasarım ilkesi | **360 derece esneklik** — hiçbir karar koda gömülmez | Kullanıcının en güçlü tekrarlanan talebi |
| D21 | Renderer sahipliği | Üç yüzey de **bizim**; hazır üretici (Gamma/Canva/Presenton) prospect'e giden hiçbir şeye dokunmaz | Bedava/premium çıktı tipografide aynı olmalı; hazır araç çıktısı "size özel yazılım yaparız" iddiasını çürütür |
| D22 | Türkçe sert kapıları | Görsel modeline Türkçe metin çizdirilmez · diacritics doğrulayıcı bloklar · `tr-text` çıplak `.toUpperCase()` yasağı | Ideogram aksanlı Latin'i render edemeyebileceğini kabul ediyor; JS'de `I/ı` locale hatası sessiz |
| D23 | Uyum kapısı | `containsSyntheticPerson=false` kod seviyesinde iddia | Reklam Yönetmeliği Md. 27/12, 1 Ağu 2026'dan yürürlükte |
| **D24** | **Render motoru** | **TEK motor: headless Chromium.** Statik → Playwright screenshot · deck/PDF → `page.pdf()` · hareket → HyperFrames (o da Chrome+FFmpeg). **Satori reddedildi** | İkinci CSS alt kümesi = ikinci Türkçe tipografi hata modu. Satori'de ligature/kerning/WOFF2 yok. Tek motor = tek hata modu |
| **D25** | **Hareket katmanı** | **HyperFrames (Apache 2.0)**. Remotion reddedildi: ücretsiz lisansı ≤3 çalışan, siz 6 kişisiniz. Revideo (MIT) belgelenmiş yedek | Lisans + agent-yerli HTML yazımı + hazır Claude skill'leri + `frame.md` + `/media-use` |
| **D26** | **Komuta merkezi** | **Vite + React + Tailwind + shadcn + Hono API**. Next.js reddedildi | Uzun süren alt süreçler (Chromium/ffmpeg), `chokidar` registry izleme, SSE — App Router'da hepsi zorlama; SEO ihtiyacı yok; App Router churn "bir ay ihmal edilse de çalışsın" ilkesine düşman |
| **D27** | **Depolama** | Dosyalar = doğruluk. **SQLite (better-sqlite3 + FTS5) = gitignore'lu, yeniden üretilebilir indeks.** Postgres yok, vektör DB yok | Tek kullanıcı; indeks türetilebilir olduğu için şema değişimi veri kaybı değil, rahatsızlık |
| **D28** | **İş kuyruğu** | SQLite tablosu + süreç-içi worker. pg-boss/Temporal/Trigger.dev yok | Yerel render'lar alt süreç, dağıtık iş akışı değil |
| **D29** | **Mimari** | **Dört halka**: Kernel (TS, sabit) · Registry (YAML, kullanıcı) · Corpus (md+frontmatter) · Derived (gitignore) | D11/D20'yi teknik olarak mümkün kılan tek yapı |
| **D30** | **Dönem modeli** | Era = **git tag + manifest + kayıtta `era_id`**. Dönem klasörü YOK | Klasör kopyalama regenerasyonu "ekleme" yapar, `git diff` yan yana gösteremez → inceleme ölür |
| **D31** | **Yazma yetkisi** | **Agent önerir (`status: draft`, branch), sadece sen uygularsın (= git commit)** | Kendi kendini değiştiren config'in tek güvenlik hikâyesi |
| **D32** | **Sağlayıcı seçimi** | Pipeline'lar **yetenek** ister, model ID'si değil. Sağlayıcılar YAML tanımlayıcı + maliyet formülü | Model ID'si pipeline'da = sağlayıcı öldüğü gün kırılan varsayım |
| **D33** | **Yerel MCP yüzeyi** *(aday)* | Hono sunucusu `corpus.search/get/propose` ve aktif çalıştırmayı MCP olarak açar; Claude Code, UI'ın gördüğü aynı projeyi görür. FAZ-8.9'da karara bağlanır | Palmier Pro deseni: uygulama yerel MCP açar, agent aynı projeyi düzenler. Bizde Hono sunucusu zaten var, ek altyapı gerekmiyor |
| **D34** | **Repo görünürlüğü ve commit imzası** | Repo **kalıcı olarak private**. Commit mesajlarında **Claude/AI atıf footer'ı yasak** — `Co-Authored-By: Claude`, `Generated with`, `🤖` ve türevleri. `commit-msg` hook'u zorlar (FAZ-0.C.7) | Repo kurumsal strateji, prospect verisi ve anahtar desenleri taşıyor. İmza kuralı kullanıcının açık talimatı ve varsayılan davranışı ezer |
| **D35** | **Dokuz fiil, tek yan etki** | `RESOLVE · SELECT · COMPOSE · GENERATE · RENDER · VALIDATE · PROPOSE · PUBLISH · INGEST` (dokuzuncusu D-40). Her fiil tek yan etki sınıfı. `image/video/tts.generate` ayrımı **iptal** (yetenek alanında zaten kodlu), `human.approve` fiil değil durum geçişi, `script.run` **kaldırıldı** | `RENDER` sessizce LLM çağırabilseydi maliyet tahmini yalan olurdu. Aynı imza → motor zamanlama/retry/maliyet/replay'i bir kez yazar. `script.run` kapatılamayan güvenlik deliğiydi |
| **D36** | **Para birimi** | `bigint` **USD mikro-birim** (1.000.000n = $1.00). Kuruş/cent değil, float hiç değil. TRY yalnızca raporda, sabitlenmiş TCMB anlık görüntüsüyle | Görsel başına $0.0035 gibi fiyatlar minor-unit'te hassasiyet kaybediyor; float'ta zaten toplanamıyor |
| **D37** | **Belge dili** | ANAYASA · KURALLAR · KARARLAR · DURUM · FAZ dosyaları · CLAUDE.md **Türkçe**. İngilizce kalanlar: tanımlayıcılar, şema anahtarları, log olay adları, enum değerleri, dosya adları, commit tipleri, hata `code` alanları | Sentez "dokümanlar İngilizce olsun" dedi — **reddedildi**. Belgeleri kullanıcı okuyacak. Gerçek hata Türkçe'nin *enum değerine* sızmasıdır, nesre değil; `docs-language` kapısı buna göre ters çevrildi |
| **D38** | **Ring 3 ikiye ayrılır** | `derived/index` silinip yeniden kurulabilir · `derived/runs` **türetilemez**, append-only, yedeklenir · `derived/blobs` içerik-adresli | Çalıştırma defteri corpus'tan üretilemez; bir çalıştırmanın maliyeti ve hangi sağlayıcıya ne gönderildiği başka yerde yazmıyor |
| **D39** | **`brand_id` birinci sınıf eksen** | Zarfta sistem alanı · `brand/<brand_id>/…` · retrieval yükleminde ilk koşul · `(brand_id, era_id)` çalıştırma parametresi, dosyadan okunan global durum değil · kanal bağlamaları markaya göre | Denetim bulgusu: D-9 çok markalılık iddia ediyordu ama marka ekseni **hiç yoktu**. Tek satırlık `brand/current` ile ya markalar aynı anda yaşayamaz ya da birbirine sızar |
| **D40** | **Dokuzuncu fiil: `INGEST`** | Yan etki sınıfı `network-source`. Dış kaynak (prospect sitesi, SERP, MCP) çeken tek fiil; çıktısı daima karantinalı `untrusted_input`'a düşer. Metered | Prospect araştırma şelalesi hiçbir fiile eşlenmiyordu. Kaçak giren I/O ne maliyetlenir, ne zaman aşımına uğrar, ne karantinaya alınır |
| **D41** | **Zarf = sistem alanı** | Zarfın 20+ alanı (`brand_id`, `era_id`, `status`, `zone`, geçerlilik tarihleri, `confidence`, `scope`, `x_signature`…) **sabit sistem alanlarıdır**, kernel okur. Kullanıcının tanımladığı her şey `attributes` altında ve kernel'e kapalı | Retrieval yüklemi bu alanları okumak zorunda; `attributes` altında olsalardı yüklem kendi yasasını çiğnerdi |
| **D42** | **Açık kalemler `V-nn`** | Doğrulama borçları `R-01…` değil **`V-01…`** ile numaralanır | `R-nn` zaten KURALLAR kuralı demek; aynı ön ek iki hedefe işaret ederse atıf kapısı yanlış belgeyi doğrular |

---

## 3. Ortam tespiti (doğrulandı)

```
GPU     NVIDIA RTX 3050 6GB Laptop (driver 580.173.02) + Intel UHD
CPU     20 çekirdek · RAM 38 GB (23 müsait) · Disk 436 GB boş
node    v20.20.0   pnpm 10.12.1   python 3.12.3   uv 0.12.3   docker 29.1.3   git 2.43.0
ffmpeg  KURULU DEĞİL  ← Faz 0 blokerı (HyperFrames zorunlu kılıyor)
xvfb    KURULU DEĞİL  ← Faz 4 blokerı (demo video yakalama)
font    Marka fontu kurulu değil ← Faz 0 blokerı
```

**6 GB VRAM'in anlamı:** yerelde kahraman görsel/video üretimi yok. Yerelde bedava
çalışacaklar: Türkçe TTS (Chatterbox Multilingual V3, MIT, 500M), Whisper altyazı,
arka plan silme (BiRefNet), upscale, akıllı kırpma, OCR tabanlı QA. Kahraman üretim
buluttaki bedava katmanlar + premium sağlayıcılarda.

**Node 20 uyarısı:** araştırma Node 22 LTS öneriyor; HyperFrames Node 20+ istiyor.
Faz 0'da Node 22'ye çıkılacak.

---

## 3b. Marka teşhisi (upcytech.com adli incelemesi — doğrulandı)

Faz 1'in neden bir **marka kararı** fazı olduğunun kanıtı:

- **Tüzel kimlik:** UPCYTECH TEKNOLOJİ A.Ş., 3 Tem 2025, NACE 461401, İTÜ Tasarım ve
  Prototip Merkezi, Sarıyer. App Store `artistName` bağımsız doğruluyor.
- **Kuruluş tarihi üç yerde çelişiyor:** sicil 3 Tem 2025 · LinkedIn 2022 · upcymarket.com
  "2021'den beri". Sadece sicil belgeli.
- **Dış kimlik hâlâ UpcyMarket:** GitHub bio, X bio, en eski alan adı plastik geri dönüşüm
  + blockchain anlatıyor. LinkedIn şirket logosu dosyası hâlâ `upcymarket_logo`.
- **~7 ay sessizlik:** Ara 2025–Oca 2026'da ~10 postluk seri, sonra hiçbir şey.
  `@upcytechcom` 53 takipçi / 18 post. (`instagram.com/upcytech` sizin değil.)
- **Sıfır üçüncü taraf doğrulaması:** basın, startups.watch, Webrazzi, T3 dizini,
  KOSGEB/TÜBİTAK — hiçbirinde kayıt yok.
- **Ürünler:** `upcy365.com` kapalı. Gerçek altyapısı çalışan tek ürün **UpcyMan**
  (`api.upcyman.com` canlı NestJS). `upcyendeks.com` + `upcydigital.com` hiç tescil
  edilmemiş, ama sitede o ürünler için 10 KB cilalı metin var.
- **Görsel çelişki:** `#0091FF` · `#C0C0C0` · `#8B5CF6` üçü de ana renk gibi. 5 ilişkisiz
  alt marka logosu.
- **Uydurma metrikler:** "1.247 İlan", "892 Satıcı", "1.234.567 ton CO2" — desenli yer
  tutucular. Hiçbiri yeni kreatife taşınmayacak; `claim_source`'suz sayısal iddia bloklanır.
- **Çalışan sayısı 6** → Remotion ücretsiz lisansı ≤3 kişi → D25.

**Araştırma hijyeni notu:** araştırma agent'ları `akis-main` reposuna da baktı
(talimat gelmeden önce başlamışlardı). Oradan gelen marka dili, token ve ürün içeriği
tasarıma **taşınmıyor** — hepsi Faz 1 marka keşif motorundan yeniden türetilecek.

---

## 4. Mimari

### 4.1 Dört halka

```
Ring -1 CONTRACTS   packages/contracts — hiçbir şey import etmez, herkes onu import eder
                    Result · Brand'li id'ler · Money · RecordEnvelope · AppError · 8 fiil imzası

Ring 0  KERNEL      packages/kernel — TypeScript, sadece geliştirici, yılda ~4 değişir
                    Sabit kavramlar (10) · Sabit fiiller (8), her biri TEK yan etki sınıfı

Ring 1  REGISTRY    packages/registry + registry/ — YAML, git'te, SEN çalışma anında düzenlersin
                    entity-types/ · pipelines/ · providers/ · channels/ · recipes/ ·
                    lexicon/ · models.yaml · migrations/

Ring 2  CORPUS      corpus/ — markdown + YAML frontmatter, kayıt başına bir dosya
                    Olgular, konumlandırma, personalar, prospect'ler, kanıtlar

Ring 3  DERIVED     derived/index  → SQLite/FTS5, gitignore, silinip yeniden kurulabilir
                    derived/runs   → çalıştırma defteri, iş tutamakları, manifest'ler
                                     ⚠ TÜRETİLEBİLİR DEĞİL. Append-only, yedeklenir.
                    derived/blobs  → içerik-adresli varlık byte'ları
```

**Ring 3 ikiye ayrılır** — araştırmacılar bu konuda çelişti ve karar şu: indeks silinebilir,
**çalıştırma defteri silinemez.** Corpus'tan türetilemez; bir çalıştırmanın ne kadara mal
olduğu ve hangi sağlayıcıya ne gönderildiği başka hiçbir yerde yazmıyor.

### 4.1b Sekiz fiil — her biri tek yan etki sınıfı

| Fiil | Yan etki sınıfı | Yapabildiği tek şey |
|---|---|---|
| `RESOLVE` | read-registry | Tarif + registry'yi çözer, adım DAG'ını üretir |
| `SELECT` | read-corpus | Retrieval yüklemiyle kayıt seçer |
| `COMPOSE` | **pure** | Kayıtları belge modeline dönüştürür — hiç I/O yok |
| `GENERATE` | network-model | **Model çağıran tek fiil** |
| `RENDER` | browser | **Chromium/FFmpeg'e dokunan tek fiil** |
| `VALIDATE` | read-corpus | QA, lint, spec ve uyum kapıları |
| `PROPOSE` | write-tree | **Çalışma ağacına yazan tek fiil** (branch + commit) |
| `PUBLISH` | network-channel | **Kanal API'si çağıran tek fiil** |
| `INGEST` | network-source | **Dış kaynak çeken tek fiil** — prospect sitesi, rakip sayfası, arama API'si, MCP kaynağı. Çıktısı **daima** karantinalı `untrusted_input` bölümüne düşer |

**Dokuzuncu fiil neden eklendi (D-40):** denetim, prospect araştırma şelalesinin
(FAZ-6.5: kendi siteleri → SERP → Tavily → ihale-mcp) **hiçbir fiile eşlenmediğini** buldu.
Model çağrısı değil (`GENERATE`), kanal çağrısı değil (`PUBLISH`), corpus okuma değil
(`SELECT`). Sekiz fiille kalmak, bu I/O'yu bir yerlere kaçak sokmak demekti — ve kaçak
giren I/O ne maliyetlenir, ne zaman aşımına uğrar, ne de karantinaya alınır.
**Dürüst kapsamlı dokuz fiil, kaçak delikli sekizden iyidir.**

**Yetenek adı ≠ fiil adı.** `image.generate`, `video.text2video`, `audio.tts` bunlar
`CapabilityName` **değerleridir**, fiil değil. Hepsi `GENERATE` fiiliyle çalışır.
Faz adımlarında fiil adı geçtiğinde büyük harfle yazılır (`GENERATE`), yetenek adı
geçtiğinde tırnak içinde küçük harfle (`"image.generate"`). `verbs` kapısı bu karışıklığı
yakalar.

Bu, önceki taslağımdaki `image.generate` / `video.generate` / `tts.generate` ayrımını
**iptal eder**: ayrım zaten *yetenek* alanında kodlu (D-32), fiil seviyesinde tekrar etmek
gereksiz. `human.approve` fiil değil, **çalıştırma durum geçişi** — onay bir yan etki değil,
bir kapı. `script.run` tamamen kaldırıldı: keyfi kod çalıştırma, kapatılamayan bir güvenlik
deliğiydi.

**Neden önemli:** `RENDER` sessizce bir LLM çağırabilseydi, çalıştırma öncesi gösterdiğimiz
maliyet tahmini yalan olurdu ve çevrimdışı şerit sessizce bozulurdu. Sekizinin de **aynı
imzayı** taşıması, motorun zamanlama, yeniden deneme, maliyet ve replay'i bir kez yazmasını
sağlıyor.

Her fiilin bir de **kuru çalıştırma ikizi** var (`VerbPlanFn`): sıfır ağ, sıfır yazma.
`just plan`'ı dürüst yapan şey bu.

**Değişmez kural:** **hiçbir fiil** `attributes` okumaz — istisna yok. Zarf tek sözleşmedir.
**Şirketin tamamen dönüşebilmesini sağlayan mekanizma budur.**

> ⚠ Denetim düzeltmesi: burada önce "(render hariç)" muafiyeti vardı. **Silindi** — yasayı
> en çok çiğneyecek fiili muaf tutuyordu. Kapının tek yetkili tanımı `FAZ-0.C.3`'tür;
> burası onu tekrar etmez, ona atıf verir.

**Varlığa özgü veriye yasal yol:** `SELECT` kaydı corpus'tan çeker →
`packages/registry/src/attributes.ts#unsealAttributes` (bunu yapan **tek** dosya) açar →
`COMPOSE` (saf) **belge modelini** üretir → `RENDER` yalnızca belge modelini görür,
`RecordEnvelope`'ı asla. Şablon ve token girdileri plan anında çözülür.

### 4.1a Zarf alanları kernel'e AÇIK, `attributes` KAPALI

Denetim şu çelişkiyi yakaladı: §4.2 zarfta 20+ alan sayıyor, sözleşme 10 alan donduruyor,
ve retrieval yüklemi (`era_id`, `status`, `expired_at`…) bunları okumak zorunda. Eğer bu
alanlar `attributes` altındaysa **yüklem yasayı çiğniyor** ve Proxy tuzağı patlıyor.

**Karar (D-41):** zarf alanları **sabit sistem alanlarıdır** — yaşam döngüsü ve köken
verisidir, alan şeması değil. `RecordEnvelopeBase` bunları taşır ve kernel okuyabilir.
Kullanıcının tanımladığı her şey `attributes` altındadır ve kernel'e kapalıdır.
Sınır nettir: **zarf = sistemin bildiği · `attributes` = kullanıcının tanımladığı.**

### 4.2 Sabit kayıt zarfı

Her kaydın frontmatter'ı bu 20+ alanı taşır; `attributes` altı %100 senin.

`id`(uuidv7, ön ekli) · **`brand_id`** · `type` · `schema_version` · `kind`(dna|ledger) · `zone`(generated|human|imported) ·
`status`(draft|active|pinned|retired|superseded) · `locale` · `era_id` · `created_at` ·
`valid_at` / `invalid_at` / `expired_at` (bi-temporal) · `re_verify_by` (çürüme tarihi) ·
`supersedes[]` / `superseded_by` · `confidence` · `approved_by` / `approved_at` ·
`source{kind,ref,quote}` · `scope{channels,verticals,personas}` · `tags[]` ·
`context_weight` · `x_signature` (üretilmiş kayıtlarda)

### 4.3 Üç renderer, tek motor (D24)

| Yüzey | Araç | Çıktı |
|---|---|---|
| Statik (post, carousel, reklam) | Playwright `page.screenshot()` — React/HTML şablon, token CSS | PNG/JPG |
| Döküman / deck | Playwright `page.pdf()` | PDF (düzleştirilmiş, LinkedIn uyumlu) |
| Hareket | **HyperFrames** (headless Chrome + FFmpeg) | MP4 |

Üçü de aynı Chromium'u, aynı fontları, aynı token'ları kullanır. Tek font yükleme yolu,
tek hata modu. **Golden-file testi:** `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` her şablon boyutunda render edilir.
**Commit edilen golden bir PNG değil, JSON metriktir** (glyph kutuları, satır sayısı,
ilerleme genişliği, font ailesi, `notdef` sayısı = 0). Piksel referansı içerik-adresli
depoda durur ve sha256 ile anılır. Metrik değişirse build düşer — konteyner içinde sessiz
glyph fallback, bu sistemin bozuk varlık üretmesinin en muhtemel yolu ve **metrik onu
pikselden daha güvenilir yakalar** (antialiasing gürültüsü yok).

### 4.4 Yetenek yönlendiricisi (~300 satır, tablo tabanlı)

Pipeline adımı **yetenek + kısıt** ister:
`video.text2video · aspect 9:16 · ≤6sn · ≤4.00 TL · prefer: cost`

Yönlendirici: **filtrele** (yetenek etiketi + tipli kısıt + enabled) → **fiyatla**
(QuickJS'te maliyet formülü, 10ms deadline, USD→TRY günlük TCMB kuru) → **skorla**
(kalite / maliyet / gecikme, `prefer:` ağırlıklı) → **yedek zincir** → **kaydet**
(kazananı VE her kaybedeni gerekçesiyle run manifest'ine).

Son adım yönlendirmeyi sihirden yönetişime çevirir. Bugün hiçbir açık kaynak sistem
"Türkçe seslendirmeli 9:16 video, 30sn altı, 5 TL altı" sorusunu cevaplamıyor.

### 4.5 Bilgi ve hafıza

Ayrı bir hafıza altsistemi **yok**. "Hafıza kartı" = corpus'ta `type: fact` kaydı.
"Agent'ların bildiği her şeyi göster" = `corpus/` üzerinde filtreli tablo.

**Retrieval yüklemi — kodda tek bir yerde:**
```sql
WHERE brand_id = :brand                               -- D-39: marka birinci sınıf eksen
  AND (era_id  = :era OR era_id = '*')
  AND status IN ('active','pinned')
  AND expired_at IS NULL
  AND (invalid_at IS NULL OR invalid_at > :as_of)
  AND (valid_at   IS NULL OR valid_at  <= :as_of)
```
`:as_of` sayesinde geçmişe dönük denetim bir parametre. Emekliye ayrılmış 2024 geri dönüşüm
konumlandırması 2026 imalat deck'ine **asla** sızamaz.

**`brand_id` — denetimin bulduğu en büyük delik (D-39).** Plan boyunca `grep brand_id`
sıfır sonuç veriyordu: D-9 "çok markalı, baştan" diyor ama tek marka ekseni `era_id` ve
tek satırlık `brand/current` idi. Somut çöküş: Upcytech aktifken bir `dima` postu üretmek
istediğinde ya `brand/current`'ı yeniden yazacaktın — global değişken durum, kuyruktaki her
Upcytech çalıştırması sessizce dima'ya kayar — ya da dima kayıtlarına `era_id = '*'` verecektin,
o zaman dima konumlandırması **her** Upcytech deck'ine sızardı. Yani §4.5'in "asla sızmaz"
vaadi çok markalılıkla birlikte çöküyordu.

Düzeltme:
- `brand_id` zarfta **birinci sınıf sistem alanı**
- Dönemler markaya göre: `brand/<brand_id>/current` · `brand/<brand_id>/eras/<slug>/era.yaml`
- `(brand_id, era_id)` **çalıştırma parametresi** ve plana dondurulur — dosyadan okunan
  global durum değil. Bu, §4.6'nın "birden fazla aday dönem aynı anda" vaadini de
  gerçekten mümkün kılar (tek satırlık `current` ile imkânsızdı)
- Kanal bağlamaları markaya göre: `brand/<brand_id>/channels.yaml` — Upcytech'in LinkedIn'i
  ile dima'nın Instagram'ı ayrı hesaplar
- Varlıklar üretim anında `brand_id` **ve** `era_id` damgası alır (retrofit imkânsız)

Türkçe arama: FTS5 `unicode61 remove_diacritics 2` + paralel `trigram` indeksi, reciprocal
rank ile birleştirme — Türkçe'nin FTS5 stemmer'ı yok ve eklemeli yapı ("ölçüm" ↛
"ölçümlerinizi") tek indeksle çözülmüyor.

**Vektör yok** — ~2000 kayıt VE çapraz dil geri çağırma sancısı başlayana kadar.
Başladığında FTS5 top-50 üzerinde **yeniden sıralayıcı** olur, birincil arayıcı değil.

### 4.6 Dönem (era) ve yeniden üretim (D6, D30)

Era üç ucuz şeyden ibaret: `brand/eras/<slug>/era.yaml` (değişmez manifest + commit SHA) +
`brand/current` (tek satır, aktif dönem) + `git tag era/<slug>`.

Beş komutluk sözleşme:
```
suite discovery plan   --era <slug> --mode merge|mirror --trigger <enum>
suite discovery review <run_id>            # diff UI'ı açar
suite discovery apply  --plan runs/<id>/plan.json
suite era mint  <slug> --from <run_id>
suite era retire <slug>
```

- Regenerasyon **branch'te + git worktree'de** çalışır, **aynı yolları** yeniden yazar →
  `git diff` gerçek satır bazlı inceleme verir.
- `mode: merge` (sadece ekleme, güvenli aylık tazeleme, varsayılan) / `mode: mirror`
  (silmeler dahil tam yeniden üretim = "hepsini baştan yap" düğmesi).
- **Idempotent atlama zorunlu altyapı:** `(input_hashes, prompt_hash, model_id, temperature,
  seed, retrieval_snapshot)` değişmemişse o bölüm atlanır. Bu olmadan 900 opsiyonluk
  incelenemez bir plan çıkar, sen hepsini kabul edersin, yönetişim tiyatroya döner.
- **Sticky karar defteri** (`brand/decisions.jsonl`): daha önce reddettiğin bir op tekrar
  gelirse "bunu daha önce reddettin" diye katlanmış gelir; `pin` işaretli alanlar plana hiç
  girmez. Bu bileşenin dünyada kopyalanacak bir örneği yok ve dördüncü çalıştırmada
  sistemi terk etmeni engelleyen şey bu.
- **Üretilmiş vs elle düzenlenmiş:** `zone: generated` kayıtlar `x_signature` taşır. İmza
  sağlamsa üzerine yaz; **imza kırıksa çalıştırmayı durdur** ve düzenlemeni `zone: human`
  kaydına terfi ettirmeni iste.
- **Aday dönemler:** birden fazla era aynı anda `status: candidate` durabilir. `brand/probes/`
  bir kez sabit bir set tanımlar (5 IG postu, 3 LinkedIn postu, 1 deck, 1 reklam seti);
  her adayın altında aynı set render edilip yan yana karşılaştırılır. Golden-file bake-off,
  A/B altyapısı yok.
- **Varlıklar üretim anında damgalanır:** `era_id` · `kit_version` · `definition_digest` ·
  `context_manifest` · `source_run_id`. **Sonradan retrofit imkânsız** — bu, tasarımdaki
  en pahalı hata ve ilk gün önlemesi bedava.

### 4.7 Geri dönüşüm geçmişi: yük değil, kanıt

Her `proof_asset` kaydı `era_of_origin` + `generalisation_note` + `transfer_confidence`
(`direct | analogous | illustrative_only`) taşır. Geri dönüşüm sonucu asla silinmez ve asla
imalat sonucu gibi sunulmaz — agent'ın kelimesi kelimesine tekrarlaması gereken açık bir
aktarım argümanıyla *daha zor bir vaka* olarak sunulur. Lint kuralı: önceki dönemden kanıt
kullanan ve `generalisation_note` taşımayan hiçbir varlık yayınlanamaz.

---

## 4b. Komuta merkezi — tasarım yönü

> Sayısal token'lar ve ölçekler Dalga 4 doğrulamasıyla §12'ye yazılacak. Burası **yön
> kararı** — neden böyle göründüğü.

### Tez: komuta merkezi bir **izleme kabini**dir

Baskı ve fotoğrafta renk yargısı nötr gri bir çevrede yapılır (ISO 3664 izleme koşulları).
Sebebi basit: renkli bir çevre, yargıladığın rengi yalan söyletir. Bu sistem **çok markalı**
(D9) — bugün Upcytech, yarın `dima`, öbür gün bilinmeyen bir marka. Aracın kendi rengi
işin rengiyle kavga ederse hiçbir marka dürüst görünmez.

Bu yüzden **kabuk kasıtlı olarak marka-nötr enstrüman grisidir.** Ekrandaki tek renkli şey
iştir. Kullanıcının seçtiği hibrit yön (D7) buradan teknik gerekçesini alıyor: veri
tararken koyu nötr kabuk, görsel yargılarken açık nötr izleme yüzeyi — ışıklı masa gibi.

Bu, "koyu tema + parlak aksan" varsayılanının reddi. Aksan rengi kabukta **yok**; sadece
markanın kendi token'ı kreatif yüzeyde görünür.

### Görsel sözlük: metroloji, AI-startup değil

Müşteri imalat sektörüne hassas ölçüm ve verimlilik yazılımı üretiyor. Arayüzün dili de
oradan gelir: **tolerans bantları, kontrol limitleri, kalibrasyon, uygunluk sertifikası,
parça takip kartı (traveler).** Kontrol odası ve atölye terminali; SaaS dashboard'u değil.

### İmza öğesi: her varlık, hattan çıkan ölçülmüş bir parçadır

Sistemin akılda kalacak tek şeyi bu olacak, gerisi sessiz kalacak.

Marka QA'sı rozet göstermez — **tolerans okuması** gösterir. "Marka uyumu ✓" demek
hiçbir şey söylemez; **ΔE 2.4 / limit 5.0** sana kenara ne kadar yakın olduğunu söyler.

```
  ΔE 2000        2.4 ├──────●─────┼─────────┤  limit 5.0      ✓ tolerans içi
  metin kaplama   18% ├────────●──┼─────────┤  uyarı 20%      ✓
  en-boy 4:5    +0.3% ├─────●─────┼─────────┤  limit ±1.0%    ✓
  palet dışı renk 22% ├───────────┼───●─────┤  limit 15%      ✗ SINIR DIŞI
```

Aynı mantık her yerde: maliyet tahmini bir **aralık + güven noktası**, tek sayı değil.
Bedava kota bir **doluluk göstergesi**, "1000 kredi" yazısı değil. Çalıştırma ilerlemesi
bir **istasyon zinciri** — parça takip kartı gibi, her istasyonda damgalanır.

Bu hem işlevsel olarak rozetlerden üstün, hem müşterinin kendi dünyasından geliyor, hem de
başka hiçbir araca benzemiyor.

### Tipografi kuralı: ölçülen her şey mono ve tabular

Maliyet, ΔE, süre, boyut, token sayısı, kota, yüzde — **hepsi** dar aralıklı, tabular
rakamlı, sıfırı çizgili bir mono ile. Prose ve etiketler grotesk ile. Bu, tek bir kuralla
enstrüman metaforunu taşır ve tabloda göz taramasını hızlandırır.

**Türkçe kısıtı yapısal, dipnot değil:** her etiket ve düğme İngilizce karşılığından
~%20 uzun. Genişlik ölçüleri Türkçe metne göre belirlenir, İngilizce'ye göre değil.
Font latin-ext taşımak zorunda; kanıt dizesi `ığüşöç ĞÜŞÖÇ İstanbul`.

### Kalıcı makine durumu şeridi

Alt kenarda, her zaman görünür, tek satır: aktif çalıştırma · biriken maliyet (canlı) ·
bekleyen onay sayısı · en yakın kota sınırı. Toast değil, köşede rozet değil — **kalıcı
enstrüman okuması.** Alınan risk bu; makinenin durumunu bilmek için hiçbir yere tıklaman
gerekmiyor.

### Neden varsayılan shadcn'e benzemeyecek

- Aksan rengi kabukta yok; renk yalnızca işte ve durum sinyallerinde
- Gölge yok — koyu yüzeyde yükseklik **kenarlık ve ton** ile ifade edilir
- Rozet yerine tolerans okuması
- Kart yerine satır; yoğunluk tablo lehine
- Boş durum illüstrasyonu yok — boş ekran bir eylem daveti, bir çizim sergisi değil
- İkon seti teknik: ölçü, gösterge, istasyon; yuvarlak "sparkle" AI ikonografisi yok

### Ölçü kararları — **üretildi ve arşivlendi**, FAZ-0.B.2'de §12'ye yazılacak

Dalga 4 bunları gerçek sayılarla teslim etti (41 UI kuralı, 33'ü BLOCKING). Öne çıkanlar,
hepsi arşivde tam hâliyle duruyor:

- **İki renk bağlamı, tema anahtarı yok.** `[data-surface="console"]` kalıcı koyu,
  `[data-surface="studio"]` kalıcı açık; her biri yalnızca 2. kademe token'ları ve
  `color-scheme`'i yeniden tanımlar. Stüdyo levhası her zaman koyu çerçeve içinde,
  dört yandan en az 12px koyu boşlukla. `prefers-color-scheme` **yapısal olarak** yok sayılır.
- **Üç kademe token.** 1: ham OKLCH rampalar (bileşen asla dokunmaz) · 2: anlamsal roller,
  yüzey bağlamına göre · 3: bileşen token'ları, yalnızca 2'ye referans.
- **Chroma alana göre sınırlı.** Ekranın %25'inden büyük dolgu C ≤ 0.02 · kenarlık ≤ 0.04 ·
  metin ≤ 0.06 · yalnızca %4'ten küçük sinyal alanları ≤ 0.16. Konsol nötrleri hue 250.
- **Gölge yasak** — yükseklik arka plan basamağı + pah çizgisi (üst kenar `--line-edge`,
  diğer üçü `--line-hair`). Tek istisna: `[data-elevation="overlay"]`.
- **Dokuz tip boyutu**, 11px mikro'dan 36px mono okumaya. Ağırlık 400/450/500/550/650;
  **konsolda 700 yasak**. Ölçülen her sayı `tabular-nums slashed-zero`, birim kardeş
  `<span>`'de 0.85em. Sayı biçimi `Intl.NumberFormat('tr-TR')`.
- **Türkçe genişleme yapısal:** hiçbir etiket/düğme/sekme sabit genişlik alamaz; düğme
  `min-inline-size: 96px`; tablo başlığı 40px (iki satır), 28px değil; CI'da **+%30
  sahte-yerelleştirme** turu zorunlu.
- **Yoğunluk:** 4px temel birim, konsolda yalnızca 1/2/3/4/6/8 adımları; satır 28/32/40px,
  varsayılan 28. İçerik sığmıyorsa **tip küçültülmez, satır gevşer**.
- **Stüdyo bir rota, modal değil.** `<dialog>.showModal()` yalnızca üç şey için: komut
  paleti, geri alınamaz eylem onayı, sağlayıcı kimlik girişi.
- **Hareket beyaz listesi:** yalnızca altı şey animasyonlanır, hiçbiri 320ms'yi geçmez.
  Sayı animasyonu, liste yeniden sıralama, skeleton parıltısı, hover ölçekleme,
  grafik çizilme — **hepsi yasak**.
- **Çalıştırma göstergesi:** ilerleme çubuğu değil, **adım rayı**; ETA tek sayı değil
  **p20–p80 bandı**; maliyet **yetenek grafiği** (eksen 0 → bütçe tavanı, tahmin bandı gri,
  gerçek dolu, tavan etiketli spec-limit çizgisi).
- **İptal her zaman görünür ve etkin**, menüde değil, devre dışı değil, onay arkasında değil.
- **Bayat içerik soldurulmaz** — tam opaklık, tam etkileşim; bayatlık üst kenarda taralı
  çizgi + mono zaman damgası + `Yenile` eylemiyle bildirilir.
- **Hata toast değil**, içeriğin olacağı yerde, tek birincil kurtarma eylemi ve
  kopyalanabilir korelasyon id'siyle.
- **Yarıçap 2px**, shadcn'in 0.625rem'i değil; `--radius-full` yalnızca 8px durum noktası için.
- **Durum rengi tek başına anlam taşımaz** — glyph + renk + metin, her zaman (alarm yönetimi kuralı).

---

## 4c. İşletim modeli — sistem günlük hayatta nasıl kullanılır

> Bu bölüm `docs/ANAYASA.md` §1'e girer. Mimarinin değil, **kullanımın** sözleşmesi.

### Kural: UI işletir, Claude Code genişletir

Üç kapı var, hepsi **aynı** 8 fiile, aynı corpus'a ve aynı run manifest'ine açılır.
İki ayrı sistem değil — iki ayrı giriş.

| Kapı | Ne için | Ne için **değil** |
|---|---|---|
| **Komuta merkezi (UI)** | Rutin üretim. Var olan bir pipeline'ı, var olan bir varlık üstünde çalıştırmak. Onay, karşılaştırma, takvim, maliyet, analitik. | Yeni pipeline yazmak, yeni varlık tipi tanımlamak, keşif |
| **Claude Code (repo içinde)** | Yeni yetenek. Yeni pipeline, yeni sağlayıcı, yeni varlık tipi, corpus'a yeni bilgi, keşif ve serbest brief. | Rutin üretim — UI daha hızlı ve maliyeti önden gösteriyor |
| **Telegram** | Sadece onay / red / gerekçe. Masadan uzaktayken kuyruğun tıkanmaması için. | Üretim başlatmak, karar değiştirmek |

### Somut akış: "haber takibi uygulaması için tanıtım videosu"

**Durum A — ürün corpus'ta kayıtlı, pipeline var.** Repoyu açmıyorsun.

```
⌘K → demo-video
  ↓ tipli form (şemadan üretilmiş): ürün=haber-takip · amaç=tanıtım · süre · kanal
  ↓ şerit seçimi (toplu + adım bazında ezme)
  ↓ maliyet ARALIĞI + duvar saati tahmini görünür        ← Başlat burada kilitlenebilir
  ↓ istasyon zinciri: bağlam → senaryo → yakalama → ses → altyazı → kurgu → QA
      G1 bölüm sırası          ← sen
      G2 Türkçe anlatı metni   ← sen
      G2b transkript diff      ← sen, atlanamaz
      G3 tam izleme            ← sen
  ↓ onay kuyruğu → yayın
```

**Durum B — ürün sistemde yok.** Claude Code'da başlarsın:
`corpus.propose()` ile ürün kaydı taslağı açılır → sen onaylarsın (= git commit) →
sonra Durum A'ya düşer.

**Durum C — pipeline'ın yapmadığı bir şey istiyorsun** (*"ekran kaydı yerine animasyon"*):
Claude Code yeni pipeline YAML'ı yazar → `just validate` → `just plan` (hiçbir şey
harcamaz) → diff'i incelersin → commit → **o andan itibaren UI'da görünür ve ⌘K'dan
çalışır.** Yetenek repodan girer, üretim UI'dan akar.

### Bir kerelik iş vs tekrar eden iş

Demo videosu için asıl kalıcı varlık MP4 değil, **`demos/haber-takip/` altındaki üçlü**:
`demo-script.ts` (Playwright akışı) · `timeline.json` (tıklama hedefleri, bölüm işaretleri) ·
`narration.tr.json` (bölüm başına Türkçe anlatı). Bunlar bir kez Claude Code'da yazılır,
git'te durur. Sonraki her video **metni düzenleyip yeniden render** ederek üretilir —
yeniden kayıt yapılmaz. Ürün arayüzü değiştiğinde script güncellenir, video otomatik tazelenir.

Aynı ilke her yerde geçerli: `carousel.ir.json`, `deck.ir.json`, `storyboard.ir.json` —
hepsi **kaynak**, çıktı değil. Benzer bir iş geldiğinde LLM'i yeniden çalıştırmak yerine
IR'ı kopyalayıp düzenlemek hem ucuz hem tutarlı.

---

## 5. Repo yapısı

```
creativesuite/
├─ docs/
│  ├─ ANAYASA.md                 # §1–§19 ana referans (FAZ 0 çıktısı)
│  ├─ LOOP.md                    # LOOP§A…LOOP§G döngü protokolü
│  ├─ fazlar/FAZ-0..9.md         # adımlar · § referansları · ✅ kriterleri · tikler
│  ├─ referans/                  # ÜRETİLMİŞ: sağlayıcılar, pipeline'lar, şema, CLI, çapa listesi
│  ├─ kararlar/ARSIV-<yyyy>.md   # kapanmış kararlar (aktif defter KARARLAR.md'de kalır)
│  └─ research/                  # 4 dalganın ham çıktıları, kaynak olarak
├─ CLAUDE.md                     # tek elle yazılan talimat dosyası (AGENTS.md yoksa symlink)
├─ KURALLAR.md · KARARLAR.md · DURUM.md
├─ .claude/
│  ├─ rules/                     # yol-kapsamlı: sadece eşleşen dosyaya dokununca yüklenir
│  │  ├─ corpus-editing.md       #   paths: ["corpus/**"]
│  │  ├─ turkish-copy.md         #   paths: ["corpus/**","content/**"]
│  │  ├─ registry.md             #   paths: ["registry/**"]
│  │  └─ compliance.md           #   paths: ["kernel/src/guard/**"]
│  ├─ skills/                    # çıktı tipi başına bir skill, her biri <5000 token
│  └─ agents/                    # pipeline-author (isolation: worktree), brand-discovery
├─ packages/                     # pnpm workspace — her halka bir paket, TS project references
│  ├─ contracts/                 # RING -1 — hiçbir şey import etmez
│  │  └─ src/index.ts            #   Result · Brand · Money · RecordEnvelope · AppError · VerbTable
│  ├─ kernel/                    # RING 0 — sabit
│  │  ├─ src/verbs/*.ts          #   tam olarak 8, her biri {plan, run}
│  │  ├─ src/projection/*.ts     #   tek şema → form + TS + katı LLM şeması + SQLite DDL
│  │  ├─ src/router/*.ts         #   ~300 satır, tablo tabanlı yetenek yönlendiricisi
│  │  ├─ src/text/case.ts        #   Türkçe case dönüşümüne izin verilen TEK dosya
│  │  ├─ src/time/clock.ts       #   now() — Date'e izin verilen TEK yer
│  │  ├─ src/{ids,rng,paths}.ts  #   uuidv7 · seed'li rng · AbsPath basan tek yer
│  │  └─ src/errors/*.ts         #   throw'a izin verilen TEK yer
│  ├─ registry/src/attributes.ts #   unsealAttributes — attributes'ı açan TEK dosya
│  ├─ corpus/ providers/ render/ #   Ring 1-2 uygulamaları
│  ├─ engine/                    #   zamanlama, retry, maliyet defteri, replay
│  └─ ui/                        #   paylaşılan React bileşenleri (node:* yasak)
├─ apps/
│  ├─ ui/                        # Vite + React + Tailwind + shadcn (SPA)
│  ├─ server/                    # Hono — API, SSE, chokidar, alt süreçler
│  └─ cli/                       # suite komutları
├─ scripts/gates/*.sh|*.ts       # her kapı bir betik; just, lefthook ve CI aynısını çağırır
├─ chokepoints.json              # "tam olarak bir tane olmalı" listesi → lint üretir
├─ registry/                     # RING 1 — SENİN alanın
│  ├─ PROFILE.md                 # izin verilen JSON Schema alt kümesi
│  ├─ entity-types/*.type.yaml
│  ├─ pipelines/*.pipeline.yaml
│  ├─ providers/*.provider.yaml
│  ├─ channels/*.channel.yaml
│  ├─ recipes/*.recipe.yaml
│  ├─ lexicon/{tr,en}.lexicon.yaml
│  ├─ models.yaml                # görev sınıfı → model + bütçe
│  └─ migrations/<type>/NNNN-*.ts
├─ brand/
│  ├─ POLICY.md                  # sürümleme politikası
│  ├─ current                    # tek satır: aktif dönem
│  ├─ eras/<slug>/era.yaml
│  ├─ lineage/<from>__<to>.map.json
│  ├─ decisions.jsonl            # sticky karar defteri
│  ├─ probes/*.probe.yaml
│  ├─ tokens/*.tokens.json       # DTCG şekilli, kendi Zod şemamızla doğrulanır
│  └─ assets/{logo,fonts}/       # küçük, kalıcı, düz git
├─ corpus/<entity_type>/<slug>.md
├─ motion/                       # HyperFrames kompozisyonları
│  ├─ frame.md                   # tasarım sistemi, kamera bağlamına çevrilmiş
│  └─ <composition>/index.html
├─ demos/<product>/{demo-script.ts,timeline.json,narration.tr.json}
├─ content/<yyyy-mm>/<slug>/
├─ assets/<yyyy>/<mm>/<ab>/<sha256>.<ext> + <sha256>.meta.json
├─ schemas/*.schema.json         # üretilmiş + commit'li (editör autocomplete + CI)
├─ registry/providers/_pricing/  # sağlayıcı fiyat anlık görüntüleri, değişmez, commit'li
├─ derived/                      # RING 3 — kanonik adlar (§7.0b)
│  ├─ index/                     #   SQLite/FTS5 — GITIGNORE, silinip yeniden kurulur
│  ├─ runs/<run_id>/             #   manifest · context · plan · steps · published.ndjson
│  │                             #   ⚠ TÜRETİLEMEZ. Commit'li, yedeklenir. (D-38)
│  ├─ blobs/<ab>/<sha256>.<ext>  #   içerik-adresli varlık byte'ları + .meta.json sidecar
│  └─ ingest/<domain>/           #   INGEST çıktısı — karantinalı, asla talimat değil (D-40)
└─ secrets/secrets.enc.yaml      # SOPS + age — erişim yalnızca `sops exec-env`, direnv YOK
```

---

## 6. Belge sistemi

**Tasarım kısıtı: dağınık olmayacak.** Kökte 4 dosya, `docs/` altında 3 tür. Fazlası yok.
Ayrı bir ADR dizini **yok** — `KARARLAR.md` o işi görüyor.

### 6.1 Kök dosyalar — agent'ın sürekli okuduğu katman

| Dosya | Ne | Tavan | Kim yazar |
|---|---|---|---|
| `CLAUDE.md` | Agent giriş noktası. 12 değişmez yasa **satır içi**, gerisi işaretçi. Compact protokolü. Okuma sırası. | İnsan |
| `KURALLAR.md` | Zorlanabilir kural kitabı. `R-01`…`R-nn`, alana göre gruplu. Her kural: kural · neden · nasıl zorlanıyor · şiddet. İhlal bunu referans verir. | İnsan |
| `KARARLAR.md` | Karar defteri. Döngünün özerk aldığı **her** karar: tarih · karar · gerekçe · alternatif · geri alma maliyeti. Sonunda `V-nn` doğrulama borçları. | Döngü + insan |
| `DURUM.md` | Canlı durum + döngünün makine-okunur durum bloğu. **Her turda** güncellenir. | Döngü |

**Satır tavanları tek yerde:** `FAZ-0.C.9`. Burada tekrar edilmez — denetim, tavanların
üç ayrı yerde üç farklı sayıyla yazıldığını buldu. `KARARLAR.md` append-only olduğu için
tavanı **yapısal** çözülür: aktif defter 600 satırda kalır, kapanmış kararlar
`docs/kararlar/ARSIV-<yyyy>.md`'ye devredilir ve `citations` kapısı her `D-nn`'in ikisinden
**tam olarak birinde** çözüldüğünü doğrular.

### 6.2 `docs/` — hedefli okunan referans katmanı

| Yol | Ne | Nasıl okunur |
|---|---|---|
| `docs/ANAYASA.md` | § numaralı ana referans. Tüm araştırma damıtılmış. Büyük. | **Asla baştan sona okunmaz** — sadece 📖 § referansıyla |
| `docs/LOOP.md` | Döngü protokolü (§6.4) | Tur başında değil, sadece protokol değişince |
| `docs/fazlar/FAZ-N.md` | Faz başına bir dosya: adımlar · 📖 § referansları · ✅ kabul kriterleri · tikler | Aktif faz dosyası her turda |
| `docs/research/` | 4 dalganın ham çıktıları. Kaynak malzeme. | Asla bütün okunmaz; `ctx_search` ile sorgulanır |

`.claude/rules/*.md` — yol-kapsamlı kurallar. Belge değil, harness mekaniği: sadece
eşleşen dosyaya dokunulduğunda yüklenir, bağlam ucuz kalır.

### 6.3 `docs/ANAYASA.md` bölüm haritası

Faz dosyaları bu numaralara atıf verir. **Numaralar kalıcıdır** — bölüm silinmez,
`(kaldırıldı → §X.Y)` işaretiyle bırakılır ki eski referanslar kırılmasın.

| § | Bölüm |
|---|---|
| §1 | Amaç, kapsam, başarı ölçütleri |
| §2 | **Değişmez ilkeler** — ihlal edilemez 12 yasa |
| §3 | Sistem mimarisi: §3.1 dört halka · §3.2 kayıt zarfı (sistem alanları) · §3.3 şema profili · §3.4 projeksiyon derleyicisi · §3.5 türetilmiş indeks · §3.6 bağımlılık yönü ve modül sınırları · §3.7 durum makineleri · §3.8 "tam olarak bir tane olmalı" listesi · **§3.9 kanonik adlar tablosu** · **§3.10 dokuz fiil ve yan etki sınıfları** |
| §4 | Marka sistemi: §4.1 token mimarisi · §4.2 çok markalılık + kalıtım · §4.3 dönem modeli · §4.4 yeniden üretim motoru · §4.5 sticky karar defteri · §4.6 dönem geçişi ve içerik denetimi |
| §5 | Bilgi ve hafıza: §5.1 corpus · §5.2 retrieval yüklemi · §5.3 bağlam tarifleri · §5.4 öneri→onay · §5.5 çelişki tahkimi · §5.6 Türkçe arama |
| §6 | Strateji modeli — konumlandırma, mesaj evi, ICP, persona, kanıt, rakip, teklif şemaları (tam alan listesi) |
| §7 | Üretim: §7.1 render mimarisi · §7.2 Türkçe tipografi kapıları · §7.3 görsel + marka LoRA · §7.4 hareket (HyperFrames) · §7.5 ses/altyazı/müzik · §7.6 deck + döküman · §7.7 demo yakalama |
| §8 | Sağlayıcılar: §8.1 tanımlayıcı formatı · §8.2 yetenek yönlendiricisi · §8.3 maliyet + bütçe · §8.4 adaptör sözleşmesi · §8.5 yeniden deneme, idempotency, rate limit · §8.6 hata taksonomisi · §8.7 **tam sağlayıcı kataloğu** |
| §9 | Kanallar: §9.1 platform spec tablosu · §9.2 Meta adaptörü · §9.3 LinkedIn adaptörü · §9.4 onay yüzeyleri (PC · Tailscale · Telegram) |
| §10 | **Pipeline kataloğu** — 9 iş için adım adım şema, insan kapıları, çıktılar, maliyet |
| §11 | Kalite ve uyum: §11.1 marka QA · §11.2 deterministik lexicon linter · §11.3 hukuki kapılar · §11.4 kaynaksız iddia yasağı |
| §12 | **Komuta merkezi tasarım sistemi**: §12.1 renk (OKLCH token mimarisi) · §12.2 tipografi ölçeği · §12.3 boşluk ve yoğunluk · §12.4 kabuk↔yüzey modeli · §12.5 klavye haritası · §12.6 durum matrisi · §12.7 hareket · §12.8 erişilebilirlik · §12.9 11 ekran |
| §13 | Gözlemlenebilirlik: run manifest sözleşmesi, maliyet defteri, rerun vs replay |
| §14 | Güvenlik: prompt injection sınırı, sandbox katmanları, secret yönetimi |
| §15 | **Test stratejisi**: golden-file, kontrat testleri, kayıt/replay, LLM değerlendirme, dry-run kuralı |
| §16 | Riskler ve azaltmalar |
| §17 | **Reddedilenler** — ~60 araç/yaklaşım, her biri gerekçesiyle |
| §18 | Açık kalemler ve doğrulama borçları (🔴 listesi) |
| §19 | Araştırma eki — `docs/research/` dizini ve nasıl sorgulanacağı |

### 6.4 Döngü protokolü (`docs/LOOP.md`)

Proje `/loop` **dinamik modunda** geliştirilir. Kullanıcının verdiği protokol aynen
benimsenir; bu projeye özgü eklerle:

**Kesin kurallar**
1. **Wakeup her zaman ≤70 saniye**, istisnasız, her turda ilan edilir
2. **Durmak yok** — fazlar bitince doğrulama/denetim turlarına geçilir; sadece kullanıcı durdurur
3. **Karar sorulmaz** — en makul analizle karar verilir, `KARARLAR.md`'ye tarihli ve gerekçeli yazılır. Tam yetki, **ama kolaya kaçma yetkisi değil**
4. **Körleme iş yasak** — önce araştır → oku → kontrol et → sonra geliştir
5. **"Bitti" tek başına yeterli değil** — bağımsız doğrulama agent'ı çalıştırılır

**Tur anatomisi**
```
1. ARAŞTIR   Faz dosyasındaki 📖 § referanslarını docs/ANAYASA.md'den HEDEFLİ oku
             KURALLAR.md'de ilgili R kuralını doğrula
2. KOD OKU   İlgili mevcut kodu oku — tekrar yazma, yeniden kullan
3. GELİŞTİR  Kurallara uyarak. Küçük, tam, test edilebilir parça
4. DOĞRULA   Nokta atışı test. ⛔ Uzun/kapsamlı test turda YAPILMAZ
5. KABUL     Faz dosyasındaki ✅ kriterini kontrol et. Karşılanmadıysa adım BİTMEZ
6. KAYDET    Faz dosyasında tikle + tarih → DURUM.md güncelle → commit
7. PLANLA    ScheduleWakeup(70s) + sonraki adımı ilan et
```

**Turda yapılmaz**
- ⛔ Bir turda birden fazla faz adımı bitirmeye çalışmak
- ⛔ Kabul kriteri karşılanmadan tiklemek
- ⛔ `just check` kırmızıyken commit
- ⛔ Kuralı `KURALLAR.md`'de değiştirmeden koda farklı yazmak
- ⛔ Doğrulanmamış bir sayıyı koda gömmek — 🔴 işaretli her şey `KARARLAR.md`'de

**Faz kapanış protokolü** — tiklemeden önce:
1. Her ✅ maddesi için **somut kanıt** üret (komut çıktısı, test sonucu, dosya varlığı)
2. **Bağımsız doğrulama agent'ı**: *"FAZ-N'in her kabul kriterini `docs/fazlar/FAZ-N.md`'den oku, kodda ve repoda gerçekten karşılandığını doğrula, karşılanmayanları ve yarım kalanları listele. Kabul etme eğiliminde olma — kanıt ara."*
3. Agent temiz derse faz kapanır; aksi halde eksikler tur listesine eklenir
4. **Tam kapsamlı test paketi FAZ 5 sonunda** çalıştırılır — o zaman, ondan önce değil

**Bağlam sıfırlanmasına dayanıklılık**
- `DURUM.md` her turda güncellenir
- Faz dosyasındaki tikler anlık durumdur
- Yarım iş bırakılmaz — bir adım ya biter ya başlamaz
- Commit mesajı `Refs: FAZ-N.adım · §bölüm` taşır → `git log` tek başına yol haritası
- Compact sonrası ilk iş: `CLAUDE.md` §"BAĞLAM COMPACT'LENDİYSE" protokolü

**Tur çıktısı formatı** — kısa: ne yapıldı (adım no + tek cümle) · ne doğrulandı (somut
kanıt) · ne bulundu (sürpriz/karar) · sırada ne var (adım no) · wakeup 70 sn ilanı.
Uzun anlatım yok.

**`LOOP§G` — bir adım başarısız olduğunda** (unattended çalışma için zorunlu)

Döngü durmaz ama **aynı duvara üç kez koşmaz.** Başarısızlık sayacı `DURUM.md`'de tutulur.

| Deneme | Ne yapılır |
|---|---|
| 1 | Hatayı oku, kök nedeni bul, düzelt, tekrar dene. Aynı tur. |
| 2 | Yaklaşımı **değiştir**. Aynı çözümü tekrar denemek yasak. `KARARLAR.md`'ye "1. yaklaşım neden başarısız" yazılır. |
| 3 | Adım **BLOKE** işaretlenir. `DURUM.md`'ye engel + denenen iki yaklaşım + gereken karar yazılır. Döngü **sonraki bağımsız adıma** geçer. |
| — | Bloke adımlar biriktikçe her turda biri yeniden denenir; ikisi de aynı fazdaysa faz kapanmaz. |

**Kesin kurallar:**
- ⛔ Testi zayıflatarak geçirmek — kural ihlali, geri alınır
- ⛔ Kapıyı `--no-verify` ile atlamak — hiçbir koşulda
- ⛔ Bloke adımı "tamam" diye tiklemek
- ✅ Bir adım bloke olduğunda **iş bitmez**; sıradaki bağımsız adım alınır
- ✅ Aynı fazda üç adım birden bloke olursa **döngü durur ve kullanıcıya sorar** — bu, "durmak yok" kuralının tek istisnası, çünkü üç bloke adım plan hatasına işaret eder

**Kırmızı kapı ile commit yok.** `just check` kırmızıysa tur commit'siz biter, `DURUM.md`
güncellenir, sonraki tur oradan devam eder. Yarım iş bırakılmaz — bir adım ya biter,
ya başlamaz, ya bloke işaretlenir.

---

## 7. Faz haritası

### 7.0 Atıf sözlüğü — tek anlamlı, CI ile zorlanır

Bağlam sıfırlandığında geliştirmenin bozulmamasının tek garantisi **belirsizliği olmayan
atıf**. Beş ön ek, beş hedef, çakışma yok:

| Ön ek | Hedef | Örnek |
|---|---|---|
| `§N` / `§N.M` | **Yalnızca** `docs/ANAYASA.md` bölümü | `§7.2` = Türkçe tipografi kapıları |
| `R-nn` | `KURALLAR.md` kuralı — **başka hiçbir şey** | `R-14` |
| `D-nn` | `KARARLAR.md` kararı | `D-25` = hareket katmanı HyperFrames |
| `V-nn` | **Doğrulama borcu** (🔴 açık kalem), `KARARLAR.md` sonunda | `V-03` = rjsf spike |
| `FAZ-N.x` | Faz adımı | `FAZ-3.14` |
| `LOOP§X` | `docs/LOOP.md` bölümü | `LOOP§D` = faz kapanış protokolü |

> ⚠ Denetim düzeltmesi: açık kalemler önce `R-01…R-11` diye numaralanmıştı; bu `R-nn`
> ile çakışıyordu. **`V-nn`'e taşındı.** Aynı ön ek iki şeye işaret ederse atıf kapısı
> yanlış hedefi doğrular ve sessizce yanlış belge okunur.

### 7.0b Kanonik adlar — tek otorite

Denetim, aynı şeyin plan boyunca 3-4 farklı adla anıldığını buldu. Bağlamsız bir agent
için bu, var olmayan bir dosyayı aramak demek. **Aşağıdaki tablo tek doğrudur; başka her
yerdeki ad yanlıştır ve düzeltilir.**

| Kavram | Kanonik ad | Yanlış varyantlar (kullanma) |
|---|---|---|
| Anayasa dokümanı | `docs/ANAYASA.md` | ~~`docs/00-ANAYASA.md`~~ |
| Yol haritası | `docs/fazlar/FAZ-N.md` (ayrı dosyalar) | ~~`docs/01-YOL-HARITASI.md`~~ |
| Türetilmiş indeks | `derived/index/` | ~~`.suite/index.db`~~ |
| Çalıştırma defteri | `derived/runs/` | ~~kök `runs/`~~ |
| Varlık byte'ları | `derived/blobs/` | ~~kök `assets/`~~ |
| Yayın defteri | `derived/runs/published.ndjson` | ~~kök `ledger/published.jsonl`~~ |
| Marka verisi | `brand/<brand_id>/…` | ~~kök `brand/` (tek marka varsayımı)~~ |
| CLI | `just <recipe>` (tek giriş) | ~~`suite …`~~, ~~`pnpm …` doğrudan~~ |
| Kimlik üreteci | **uuidv7**, ön ekli (`run_`, `job_`) | ~~ULID~~ |
| Doğrulama komutu | `just verify` | ~~`pnpm verify`~~, ~~`suite verify`~~ |

**Kanonik kaynak:** bu tablo FAZ-0.B.2'de `§3.9` olarak ANAYASA'ya girer ve
`citations` kapısı yanlış varyantları **hata** olarak yakalar.

**CI kapısı (FAZ-0.C.6):** her `§` atıfı ANAYASA'da var olmalı; her `R-nn` KURALLAR'da;
her `D-nn` KARARLAR'da; her `FAZ-N.x` ilgili faz dosyasında. Bulunmayan atıf build'i düşürür.
`§` işareti bu plan dosyasının kendi bölümleri için **kullanılmaz** — plan, FAZ 0 bitince
`docs/ANAYASA.md` + `docs/fazlar/` ikilisine devrolur ve arşive kalkar.

### 7.1 Faz dosyası şablonu — `docs/fazlar/FAZ-N.md`

FAZ-0.B.8 dokuz dosyanın hepsini bu şablonla üretir. **Şablon dışı adım yazılamaz.**

```markdown
# FAZ N — <başlık>

**Amaç:** <tek cümle>
**Yöneten kararlar:** D-24, D-25, D-27          ← neden böyle yapıyoruz
**Ön koşul:** FAZ N-1 kapalı                    ← bağımlılık
**Çıkış kriteri:** <tek cümle, ölçülebilir>

---

## N.x — <adım başlığı>          [ ] / [x] 2026-08-20

📖 **Oku:** §7.2, §11.2 · R-08, R-31 · D-22
🔗 **Bağımlı:** N.y (önce bitmeli)
🛠 **Yap:** <2-4 cümle, somut. Hangi dosya, hangi fonksiyon, hangi davranış.>
✅ **Kabul:** <çalıştırılabilir komut + beklenen çıktı. "Çalışıyor" yazmak yasak.>
🧪 **İhlal testi:** <kuralı kasten çiğne, kırmızıya döndüğünü gör> (kapı adımlarında zorunlu)
💾 **Commit:** `feat(kernel): <özet>` + `Refs: FAZ-N.x · §7.2`
```

**Adım büyüklüğü kuralı:** bir adım **tek bir döngü turunda** bitmeli. Bitmiyorsa adım
değil, alt-fazdır — bölünür. Bir turda birden fazla adım denenmez (LOOP§C).

### 7.2 Karar kapsama matrisi

Her taşıyıcı karar en az bir adımda hayata geçer. FAZ-0.B.8 bu matrisi faz dosyalarının
`Yöneten kararlar` alanına dağıtır ve CI eşleşmeyi doğrular.

| Karar | Hayata geçtiği adım(lar) |
|---|---|
| D-1 repo + yerel merkez | 0.A.1, 4.2 |
| D-2 çift şerit | 3.5, 3.7, 4.6 |
| D-3 kademeli yayınlama | 4.7, 7.2, 7.3 |
| D-4 öncelikli çıktılar | 3.14, 3.15, 5.7, 5.8, 5.9, 6.3, 6.9, 8.1 |
| D-5 taslak + röportaj | 2.9 |
| D-6 yeniden çalıştırılabilir DNA | 2.7, 2.8 |
| D-7 hibrit UI | 4.1, 4.2 |
| D-8 hibrit agent motoru | 1.9, 3.14 |
| D-9 çok markalılık | 2.11 |
| D-10 kademeli proaktiflik | 8.5 |
| D-11 şema = veri | 1.3, 1.4, 4.11 |
| D-12 hafıza yönetimi | 2.2, 4.3, 4.4, 4.5 |
| D-13 medya çekirdeği önce | FAZ 3 bütünü |
| D-14 dil ayrımı | 0.C.4, 1.5 |
| D-15 anayasa | 0.B.2, 0.B.8 |
| D-16 gizlilik kısıtı yok | 3.5 (şerit kilidi yok) |
| D-17 ayarlanabilir tavan | 3.5, 4.12 |
| D-18 esnek seslendirme | 5.4 |
| D-19 üç erişim yüzeyi | 4.13 |
| D-20 360° esneklik | 1.3, 1.4, 4.11, 3.4 |
| D-21 renderer sahipliği | 3.1, 6.1 |
| D-22 Türkçe sert kapıları | 0.C.4, 1.5, 3.2, 3.7 |
| D-23 sentetik insan yasağı | 3.11, 8.3 |
| D-24 tek render motoru | 3.1, 5.1, 6.1 |
| D-25 HyperFrames | 0.D.3, 5.1 |
| D-26 Vite + Hono | 4.2 |
| D-27 dosya=doğruluk, SQLite=indeks | 1.6 |
| D-28 SQLite kuyruk | 1.8 |
| D-29 dört halka | 0.C.2, 1.1 |
| D-30 era = git tag | 2.6 |
| D-31 agent önerir, insan uygular | 2.4, 4.7 |
| D-32 yetenek bazlı seçim | 3.4, 3.5 |
| D-33 yerel MCP yüzeyi (aday) | 8.9 |
| D-34 private repo + imzasız commit | 0.A.1b, 0.A.1c, 0.C.7 |
| D-35 dokuz fiil, tek yan etki | 0.C.11, 1.1, 1.11 |
| D-39 `brand_id` birinci sınıf eksen | 1.1b, 2.2, 2.6, 2.11, 7.7 |
| D-40 dokuzuncu fiil `INGEST` | 1.11, 2.3b, 6.5 |
| D-41 zarf = sistem alanı | 1.1b, 1.2, 2.2 |
| D-42 açık kalemler `V-nn` | 0.B.5, 0.C.6 |
| D-36 para = USD mikro bigint | 1.7, 3.5 |
| D-37 belge dili | 0.B.2, 0.C.5 |
| D-38 Ring 3 ikiye ayrılır | 1.6, 1.9, 8.7 |

---

**Kural: bir adıma başlamadan önce `📖 Oku` satırındaki her şeyi oku.** Detaylı adımlar,
✅ kriterleri ve tikler `docs/fazlar/FAZ-N.md` dosyalarında; burada faz sözleşmesi var.

---

### FAZ 0 — ÖN HAZIRLIK: belgeler, kurallar, ortam, döngü

**Özellik kodu yazılmaz — altyapı kodu yazılır.** Ayrım net: hiçbir pipeline, hiçbir fiil
gövdesi, hiçbir ekran. Ama kapıların kendisi koddur (`scripts/gates/*`, `packages/contracts`
içindeki `OpaqueAttributes` markası, ESLint kuralları) ve FAZ 0'da yazılır — bir kapı,
kodu olmadan "kasten ihlal edilerek" test edilemez.

Amaç: temel sağlam olsun, başlayınca hiçbir şey tartışılmasın.

**0.A — Ortam ve araç zinciri**
| # | İş | ✅ Kanıt |
|---|---|---|
| 0.A.1 | **İlk iş.** `git init` + `main` dalı · `.gitignore` (`derived/index/`, `derived/blobs/`, `derived/ingest/`, `node_modules/`, `.env*`, `*.output` — **`derived/runs/` ignore EDİLMEZ**, D-38) · minimal `README.md` · `user.name`/`user.email` repo-yerel ayarı · ilk commit | `git log --oneline` tek commit · `git status` temiz · `git branch --show-current` → `main` |
| 0.A.1b | **GitHub private repo** — `gh repo create <ad> --private --source=. --remote=origin` ve ilk push. Repo **asla public olmayacak**; kurumsal bilgi, prospect verisi ve API anahtarı deseni taşıyor | `gh repo view --json visibility` → `PRIVATE` · `git remote -v` → origin var |
| 0.A.1c | **Commit imza kuralı** — commit mesajlarında **Claude/AI atıf footer'ı yasak**: `Co-Authored-By: Claude`, `Generated with`, `🤖` ve türevleri. Mesaj formatı: `<tip>(<kapsam>): <özet>` + boş satır + `Refs: FAZ-N.x · §bölüm`. Bu kural `commit-msg` hook'una yazılır (0.C.7) | Footer içeren bir commit dene → hook reddediyor |
| 0.A.2 | Node 22 LTS'e geçiş (nvm/fnm), pnpm workspace iskeleti | `node -v` → v22.x · `pnpm -v` |
| 0.A.3 | `ffmpeg` + `xvfb` kurulumu | `ffmpeg -version` ve `xvfb-run --help` çıktı veriyor |
| 0.A.4 | `just` kurulumu + `justfile`: `check · verify · gates · gate <ad> · tur · plan · reindex · doctor · fmt · test · golden · docs · setup`. **`just` tek CLI girişidir** — `pnpm`/`suite` doğrudan çağrılmaz | `just gates-list` en az bir kapı listeliyor · `just check` **boş geçmiyor**: kasten bozuk bir dosya koy → kırmızı |
| 0.A.5 | **latin-ext marka fontu** lisansla + `brand/assets/fonts/` altına sabitle | Kanıt dizesi render'ı: `İstanbul'da yazılım çözümleri: ığüşöç ĞÜŞÖÇ` doğru |
| 0.A.6 | **SOPS + age**, `secrets/secrets.enc.yaml`. Erişim yalnızca `sops exec-env` üzerinden; tanımlayıcılarda `${ENV_ADI}` dolaylaması. **`direnv` kullanılmaz** — kural kitabı açıkça yasakladı: gözetimsiz bir 03:00 render'ında kabuk kancası yoktur | `sops exec-env secrets/secrets.enc.yaml 'env \| grep -c _KEY'` > 0 · repoda düz metin anahtar yok (`gitleaks` temiz) · `.env` dosyası **yok** |
| 0.A.7 | `npx hyperframes doctor` | Eksik bildirmiyor |

**0.B — Belge temeli** (§6)
| # | İş | ✅ Kanıt |
|---|---|---|
| 0.B.1 | 4 dalganın ham çıktılarını `~/.claude/arastirma-arsivi/2026-08-14/` arşivinden `docs/research/` altına kopyala + `ctx_index`'e ver. **Arşiv kaynağı:** `task-ciktilari/` = damıtılmış yapılandırılmış sonuçlar, `transkriptler/` = 26 MB tam agent kaydı (her araç çağrısı, her çekilen sayfa) | `ctx_search` ham araştırmadan sonuç döndürüyor; `docs/research/` altında dört dalganın da çıktısı var |
| 0.B.2a | **`docs/ANAYASA.md` iskeleti** — §1–§19 başlıkları + kararlaştırılmış çapa id'leri (`{#section-4-3}`) + her bölümün bir cümlelik amacı. İçerik henüz yok, **çapa şeması kilitli** | Ondokuz `## §` başlığı var, hepsinin çapası benzersiz · `citations` kapısı bu çapalara çözülüyor |
| 0.B.2b | **ANAYASA §1–§7** — amaç, değişmez ilkeler, mimari, marka sistemi, bilgi/hafıza, strateji modeli, üretim | Bu yedi bölümde TBD yok · her biri arşivden en az bir kaynağa atıf veriyor |
| 0.B.2c | **ANAYASA §8–§13** — sağlayıcılar (kataloğu **üretilmiş**: `docs/referans/saglayicilar.md` YAML'dan), kanallar, pipeline kataloğu, kalite/uyum, tasarım sistemi, gözlemlenebilirlik | §8.7 elle yazılmaz, `just docs` üretir · `docs-drift` kapısı yeşil |
| 0.B.2d | **ANAYASA §14–§19** — güvenlik, test stratejisi, riskler, reddedilenler, açık kalemler (V-nn), araştırma eki | `grep -rn "TBD\|TODO" docs/ANAYASA.md` boş · `wc -l` ≤1200 |
| 0.B.3 | **`KURALLAR.md`** — R1…Rn, alan bazlı, her kural zorlama mekanizmasıyla | Her BLOCKING kural bir komut/lint kuralı adı taşıyor |
| 0.B.4 | **`CLAUDE.md`** — 12 yasa satır içi, işaretçiler, okuma sırası, compact protokolü | ≤200 satır (CI zorlar) |
| 0.B.5 | **`KARARLAR.md`** — **D-1…D-42** (§2'nin tamamı) + `V-01…V-11` doğrulama borçları | `grep -c '^## D-' KARARLAR.md` = §2'deki karar sayısı (mekanik eşitlik testi) · her V bir faz adımına bağlı |
| 0.B.6 | **`DURUM.md`** — başlangıç durumu + döngünün okuyacağı alanlar: aktif faz · sıradaki adım · bloke adımlar · başarısızlık sayaçları · son doğrulama kanıtı | Döngü `DURUM.md`'yi okuyup sıradaki adımı **tek başına** bulabiliyor |
| 0.B.7 | **`docs/LOOP.md`** — `LOOP§A`…**`LOOP§G`** bölümlü (G = başarısızlık protokolü) | Yedi bölüm etiketli; `LOOP§D` faz kapanışı, `LOOP§G` başarısızlık |
| 0.B.8a | **`docs/fazlar/FAZ-0.md` ve `FAZ-1.md`** — §7.1 şablonuyla, tam. Diğer sekiz faz **başlık + amaç + çıkış kriteri** iskeletiyle | İki dosya tam, sekizi iskelet · `citations` kapısı `FAZ-0.x`/`FAZ-1.x` atıflarını çözüyor |
| 0.B.8b | **`FAZ-2.md` ve `FAZ-3.md`** tam | Her adımın ✅'sı çalıştırılabilir komut · "çalışıyor" yazan kriter yok (grep ile kanıtla) |
| 0.B.8c | **`FAZ-4..9.md`** tam | Aynı · toplam adım sayısı §7 faz haritasıyla eşleşiyor |

> **Neden bölündü:** denetim, tek bir adımın on dosya ve ~136 adım üretmesini "kılık
> değiştirmiş epik" olarak işaretledi. Bir adım tek turda bitmeli (§7.1); bitmiyorsa
> `LOOP§G` onu üçüncü denemede bloke eder ve faz hiç kapanmaz. Sonraki fazların dosyaları
> ancak o faza yaklaşırken tam yazılır — erken yazılan detay zaten bayatlar.
| 0.B.9 | `.claude/rules/*.md` yol-kapsamlı kurallar + `.claude/skills/` iskeleti | Kural dosyaları `paths:` taşıyor |
| 0.B.10 | **Denetim bulgularının tasfiyesi** — üç düşman denetçinin 75 bulgusu arşivde (`wf_d0fcaf4e-349`). 26 BLOCKER plana işlendi; kalan 49 MAJOR/MINOR **tek tek** ele alınır: her biri ya bir faz adımına dönüşür, ya `KARARLAR.md`'de gerekçesiyle reddedilir. Sessizce düşen bulgu olmaz | Her bulgu için bir satır: uygulandı (adım no) \| reddedildi (D-nn) \| ertelendi (V-nn). Toplam = 75 |

**0.C — Kural zorlama altyapısı** (§3.6, §15)
| # | İş | ✅ Kanıt |
|---|---|---|
**İlke:** her kapı `scripts/gates/<ad>.sh|.ts` altında **tek bir betik**. `just gate <ad>`,
`lefthook.yml` ve haftalık iş **aynı betiği** çağırır — "yerelde yeşil, CI'da kırmızı"
yapısal olarak imkânsız. Kapı mantığı YAML'da yaşamaz.

| # | İş | ✅ Kanıt / ihlal testi |
|---|---|---|
| 0.C.1 | `tsconfig.base.json` katı: `strict · noUncheckedIndexedAccess · exactOptionalPropertyTypes · noImplicitOverride · noPropertyAccessFromIndexSignature · isolatedModules · verbatimModuleSyntax · erasableSyntaxOnly`. **TypeScript 7'ye geçilmez** — typescript-eslint peer aralığı kabul edene kadar (sessizce tüm tip-farkında kuralları kapatır, CI yeşil kalır) | `just check` yeşil · `tsconfig-drift` kapısı bir paketin bayrağı zayıflatmasını yakalıyor |
| 0.C.2 | **Halka sınırı** — ESLint `import-x/no-restricted-paths` bölgeleri + `depcruise` (modül **ve** klasör kapsamında döngü yasağı) + TS project references | Kasten yanlış halka import'u → üçü de kırmızı |
| 0.C.3 | **Kernel saflık kapısı — üç katman.** (1) `OpaqueAttributes` markası `record.attributes.x`'i **derleme hatası** yapar (2) ESLint `no-restricted-syntax` (3) `rg` grep + **Proxy tuzağı**: `attributes`'ı fırlatan bir Proxy olan kayıt sekiz fiilden geçirilir | Grep destructuring ile atlatılabilir, **Proxy atlatılamaz** — ikisini de kasten dene |
| 0.C.4 | **`turkish-case` kapısı** — `.toUpperCase()`/`.toLowerCase()` yalnızca `kernel/src/text/case.ts`'de, o da `toLocaleUpperCase('tr')` ile | `'i'.toUpperCase()` → `I` (yanlış, `İ` olmalı); kasten yaz → kırmızı |
| 0.C.5 | **`docs-language` kapısı (ters çevrilmiş, D-37)** — Türkçe'nin *tanımlayıcı, şema anahtarı, log olay adı, enum değeri, dosya adı, hata `code`* alanlarına sızmasını yakalar. **Belge nesri Türkçe kalır** | `code: "SAĞLAYICI_HATASI"` yaz → kırmızı; ANAYASA'daki Türkçe paragraf → yeşil |
| 0.C.6 | **`citations` kapısı** — her `§N` / `R-nn` / `D-nn` / `FAZ-N.x` hedefine çözülür. Ayrıca: **reddedilmiş** bir `D-nn`'e atıf, linksiz "bkz. 4.3", tombstone'suz silinmiş çapa → hepsi hata | Var olmayan §'ya referans ver → kırmızı · reddedilmiş karara atıf ver → kırmızı |
| 0.C.7 | **`commit-msg` hook'u — iki commit sınıfı.** *Geliştirme commit'i* (`packages/**`, `apps/**`, `scripts/**`, `docs/**`): `<tip>(<kapsam>)` + `Refs: FAZ-N.x · §bölüm` zorunlu. *Çalıştırma commit'i* (yalnız `corpus/**`, `brand/**`, `derived/runs/**`): `Run: <run_id>` + `Actor: human\|agent` + `Kind: propose\|approve\|discovery-apply` zorunlu, `Refs:` **yasak**. Her ikisinde: AI atıf footer'ı yasak, konu ≤72 karakter | Beş kasten ihlal → beşi de reddediliyor. **Özellikle:** UI'dan yapılan bir onay commit'i (D-31) `Refs:` olmadan geçebiliyor — yoksa onay kuyruğu ilk günden kilitlenir |
| 0.C.8 | **`chokepoints.json`** — "tam olarak bir tane olmalı" listesi (git çağıran · SQLite handle · Chromium başlatan · alt süreç · `fetch` · saat · RNG · id üreteci · secret okuyucu · corpus yazıcı · retrieval yüklemi · maliyet defteri…). Dosya **lint'i üretir** | Listeye satır ekle → zorlaması kendiliğinden gelsin · ikinci bir `chromium.launch()` yaz → kırmızı |
| 0.C.9 | **`docs-size`** tavanları: `CLAUDE.md` 200 · `KURALLAR.md` 400 · `KARARLAR.md` 600 · `DURUM.md` 120 · `ANAYASA.md` 1200 · `FAZ-N.md` 250 · `.claude/rules/*.md` 120 | Tavanı aş → kırmızı |
| 0.C.10 | `secretlint` + `gitleaks` · `lefthook` (pre-commit hızlı/staged, pre-push tam) | Sahte anahtar commit'le → engellendi |
| 0.C.11 | **`verbs` kapısı** — sekiz fiil listesi `packages/kernel/verbs.json`'a sabitlenir; sapma iki yönde de hata. Dokuzuncu fiil aynı commit'te bir `D-nn` girdisi gerektirir | Dokuzuncu fiil ekle → kırmızı |

**0.D — Doğrulama borçlarının kapatılması** (§18)
| # | İş | ✅ Kanıt |
|---|---|---|
| 0.D.1 | **Bake-off #1 (~$5)** — 10 Türkçe brief × 4 görsel modeli, metinsiz üretim kalitesi | Kazanan `registry/models.yaml`'a yazılmış, kanıt `docs/research/bakeoff/` |
| 0.D.2 | **Bake-off #2 (~$2)** — 500 kelimelik Türkçe metin × 4 TTS (biri yerel Chatterbox) | Kazanan yazılmış, ses dosyaları saklanmış |
| 0.D.3 | Remotion Creators koltuk fiyatını tarayıcıdan doğrula → HyperFrames kararını teyit | `KARARLAR.md`'de 🔴 kalkmış |
| 0.D.4 | rjsf'nin JSON Schema 2020-12 kapsaması — tek varlık tipi ile spike | Form render oluyor veya profil daraltıldı |
| 0.D.5 | fal endpoint-başına OpenAPI URL'i gerçekten çalışıyor mu | Çalışıyorsa içe aktarıcı, çalışmıyorsa elle tanımlayıcı yolu |

**0.E — Döngü kurulumu** (denetim: *"hiçbir adım döngünün kendisini kurmuyor"*)

Bu blok olmadan FAZ 0 biter ama **döngü başlayamaz.**

| # | İş | ✅ Kanıt |
|---|---|---|
| 0.E.1 | **`DURUM.md` sözleşmesi** — döngünün her turda okuyup yazacağı alanlar makine-okunur bir blok halinde: `aktif_faz` · `siradaki_adim` · `bloke[]` · `deneme_sayaci{}` · `son_kanit` | Bir betik `DURUM.md`'den sıradaki adımı ayrıştırabiliyor; bağlamsız bir agent "şimdi ne yapmalıyım" sorusunu **sadece** bu dosyadan cevaplıyor |
| 0.E.2 | **Tur açılış yordamı** — `just tur` : `DURUM.md` oku → aktif faz dosyasını aç → sıradaki adımın `📖 Oku` satırındaki her hedefi getir → ekrana bas. Turun 1-2. adımını (ARAŞTIR + KOD OKU) tek komuta indirir | `just tur` çalıştır → ANAYASA bölümleri, R kuralları ve D kararları toplu geliyor |
| 0.E.3 | **Doğrulama agent'ı tanımı** — `.claude/agents/faz-dogrulayici.md`. `LOOP§D`'deki prompt bir dize değil, çalıştırılabilir bir agent tanımı olmalı; yoksa faz kapanışı öz-onaya döner | Agent'ı FAZ 0'ın kendisine karşı çalıştır → eksikleri listeliyor (temiz demiyor, çünkü FAZ 0 henüz bitmedi) |
| 0.E.4 | **Compact protokolü** — `CLAUDE.md` §"BAĞLAM COMPACT'LENDİYSE": oku sırası `DURUM.md` → aktif `FAZ-N.md` → `just tur`. Üç dosya, başka hiçbir şey | Bağlamı kasten sıfırla, protokolü izle, doğru adımda devam edebildiğini gör |
| 0.E.5 | **İlk döngü provası** — `/loop` dinamik modda üç tur çalıştır (FAZ 0'ın kalan adımlarında). Her tur: bir adım · kanıt · tik · `DURUM.md` · commit · 70 sn wakeup | Üç tur `git log`'da `Refs: FAZ-0.x` ile görünüyor · `DURUM.md` üç kez güncellenmiş · hiçbir tur iki adım denememiş |

**FAZ 0 çıkış kriteri** — hepsi birden:
- `just check` ve `just verify` yeşil
- Repo private, `origin` bağlı, `main` dalında en az bir commit
- Dört kök belge (`CLAUDE.md` ≤200 satır · `KURALLAR.md` · `KARARLAR.md` · `DURUM.md`) tam
- `docs/ANAYASA.md` §1–§19 dolu, TBD yok
- `docs/fazlar/FAZ-0..9.md` on dosya, her adım altı alanlı, her ✅ çalıştırılabilir komut
- Her BLOCKING kural **kasten ihlal edilerek** test edilmiş (en az sekiz ihlal testi)
- Her 🔴 ya kapanmış ya bir faz adımına bağlanmış
- Atıf bütünlüğü kapısı yeşil: kırık `§` / `R-` / `D-` / `FAZ-` atfı yok

**Bağımsız doğrulama agent'ı temiz demeden faz kapanmaz** (`LOOP§D`).

---

### FAZ 1 — Kurulum: iskelet, şema, çekirdek primitifler → §3

| # | İş | § |
|---|---|---|
| 1.1 | pnpm workspace + TS project references: `packages/{contracts,kernel,registry,corpus,providers,render,engine,ui}` + `apps/{ui,server,cli}`. Halka sınırları **ilk günden** lint'li | §3.1, §3.6 |
| 1.1b | **`packages/contracts`** — `Result` · `Brand`'li id'ler · `Money` (bigint USD mikro) · `RecordEnvelope` + `OpaqueAttributes` · `AppError` taksonomisi · `VerbTable`. Hiçbir şey import etmez | §3.2, §8.6 |
| 1.2 | Kayıt zarfı + Zod şeması + `schemas/*.schema.json` üretimi | §3.2 |
| 1.3 | `registry/PROFILE.md` — kısıtlı JSON Schema 2020-12 profili | §3.3 |
| 1.4 | **Projeksiyon derleyicisi** — tek şema → form + TS tipi + katı LLM şeması + SQLite DDL; her tip için CI snapshot testi | §3.4 |
| 1.5 | `kernel/src/tr/` — locale-güvenli case/slug/fold/hyphenate + diacritics kapısı | §7.2 |
| 1.6 | Corpus okuma/yazma **tek darboğaz** + `derived/index/` (FTS5 unicode61 + trigram + RRF). `derived/runs/` ayrı ve **silinmez** (D-38) | §3.5, §5.6 |
| 1.7 | Hata taksonomisi + `Result` sözleşmesi + AbortSignal disiplini + kök nedeni koruyan `Error.cause` zinciri | §8.6 |
| 1.8 | SQLite iş kuyruğu + süreç-içi worker + dört durum makinesi (run · asset · record · job) | §3.7 |
| 1.9 | Run manifest sözleşmesi + bağlam anlık görüntüsü saklama politikası (🔴 R-11 burada kapanır) | §13 |
| 1.10 | **Test altyapısı** — Vitest (tek koşucu), golden-file harness (font sabitli Chromium; commit edilen golden **JSON metrik**, piksel referansı içerik-adresli depoda), msw (tek HTTP kesici), sentetik fixture corpus + marka + prospect. **Gerçek prospect verisi fixture'a asla girmez (KVKK)** | §15 |
| 1.11 | **Sekiz fiilin iskeleti** — her fiil `{name, effectClass, metered, plan, run}` olarak `packages/kernel/src/verbs/`'te. `plan` (kuru ikiz, sıfır ağ/yazma) ve `run` ayrı. `verbs.json` sabitlenir, `verbs` kapısı bağlanır | §3.7, §8.4 |
| 1.12 | **Motor** (`packages/engine`) — adım zamanlama, retry sınıflandırması, devre kesici (5 ardışık hata, `(providerId, capability)` anahtarlı), bütçe kiralama, maliyet defteri yazımı (tek nokta), iptal yayılımı | §8.5, §13 |
| 1.13 | `just plan` — hiçbir şey harcamadan DAG + seçilen sağlayıcı + maliyet aralığı + enjekte edilecek bağlam basar. **Her ücretli fiil dry-run edilebilir olmak zorunda** | §15, §8.3 |

**Çıkış:** Hiçbir üretim yok ama çekirdek ayakta, sekiz fiil tanımlı, motor çalışıyor,
test edilebilir ve dry-run dürüst.

### FAZ 2 — Bilgi çekirdeği + marka DNA motoru → §4, §5, §6

| # | İş | § |
|---|---|---|
| 2.1 | 7 strateji varlık tipi: positioning · messaging · icp · persona · proof_asset · competitor · offer | §6 |
| 2.2 | Retrieval yüklemi — kodda **tek yerde**; `:as_of` ile noktasal denetim | §5.2, §3.8 |
| 2.3 | Bağlam tarifleri + bölüm başına token bütçesi + **bağlam manifesti** | §5.3 |
| 2.3b | **`untrusted_input` sınırı** — `INGEST`'in çektiği her metin (prospect sitesi, rakip sayfası, haber) `derived/ingest/<domain>/` altına iner, ayrı ve açıkça sınırlandırılmış bir bağlam bölümüne girer, **asla talimat olarak sunulmaz**. Taze dış metin içeren bir turda `PUBLISH` ve hiçbir metered fiil (`GENERATE`, `RENDER`, `INGEST`) insan onayı olmadan ateşlenemez | §14 |
| 2.4 | `corpus.propose()` — agent yazma darboğazı; draft'lar retrieval'a görünmez | §5.4 |
| 2.5 | Çelişki tespiti (FTS5 yakın-kopya + LLM sınıflandırıcı) + tahkim kuyruğu | §5.5 |
| 2.6 | Era modeli: `era.yaml` · `brand/current` · git tag · lineage map · varlık damgası | §4.3 |
| 2.7 | **Marka DNA keşif motoru** — `suite discovery plan/review/apply`, worktree + branch + diff | §4.4 |
| 2.8 | Sticky karar defteri + `x_signature` + **idempotent atlama** (ikinci çalıştırma 0 op üretmeli) | §4.5 |
| 2.9 | **İlk keşif çalıştırması** — kamuya açık her şeyden taslak; sonra SADECE dışarıdan bilinemeyecekler için röportaj (D5) | §4.4, §6 |
| 2.10 | Token mimarisi: `tokens.json` → Style Dictionary → CSS · Tailwind teması · `frame.md` · `brand-facts.json` (prompt'a enjeksiyon) | §4.1 |
| 2.11 | Çok markalılık: Upcytech ana + `dima` alt marka, token kalıtımı | §4.2 |
| 2.12 | Geri dönüşüm geçmişi kanıta çevriliyor: `era_of_origin` + `generalisation_note` + `transfer_confidence` + lint kuralı | §4.6 |

**Çıkış:** Şirketin bugün ne olduğu **kayıtlı ve onaylanmış**. Bir yıl sonra
`suite discovery plan --mode mirror` ile tamamı yeniden üretilebilir.

### FAZ 3 — Görsel üretim hattı uçtan uca → §7.1–7.3, §8, §11 ★ D13

| # | İş | § |
|---|---|---|
| 3.1 | **`COMPOSE`** (saf, belge modeli üretir) + **`RENDER` `mode:"static"`** (Playwright + React şablon + token CSS + gömülü font). `RENDER` `RecordEnvelope` görmez, yalnız belge modelini | §7.1 |
| 3.2 | **Golden-file tipografi testi** — `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` her boyutta, piksel farkında build düşer | §7.2, §15 |
| 3.3 | Kapalı `LayoutEnum` + 4 başlangıç düzeni; taşma **otomatik böler**, asla küçültmez | §7.1 |
| 3.4 | Sağlayıcı tanımlayıcı formatı + adaptör sözleşmesi + fal/OpenRouter OpenAPI içe aktarıcı + elle yazma yedeği | §8.1, §8.4 |
| 3.5 | **Yetenek yönlendiricisi** + QuickJS maliyet formülü + TCMB kuru + bütçe kapıları (D17: UI'dan ayarlanır) | §8.2, §8.3 |
| 3.6 | Yeniden deneme / idempotency / rate limit disiplini + hata taksonomisi bağlanması | §8.5, §8.6 |
| 3.7 | **`GENERATE`** yeteneği `"image.generate"` ile. **İki şerit** (sözleşmede donmuş: `free` \| `premium`); `free` içinde ucuz/orta model seçimi **yönlendiricinin** işi, üçüncü bir şerit değil. Bedava: Cloudflare Workers AI · premium: gemini-3-pro-image / FLUX.2 flex. **Her prompt'ta "no text, no lettering"** | §7.3, §8.2 |
| 3.8 | **Marka LoRA ($3, fal krea-2-trainer)** — rapordaki en yüksek kaldıraçlı 3 dolar | §7.3 |
| 3.9 | Marka QA: culori ΔE2000 · node-vibrant palet payı · CLIP brief uyumu · estetik skor · Tesseract güvenli-alan | §11.1 |
| 3.10 | **Deterministik lexicon linter** — yasak terim, kaynaksız sayısal iddia, token dışı hex, eksik alt-text, locale-naif Türkçe casing | §11.2 |
| 3.11 | Uyum kapısı: `containsSyntheticPerson=false` · `aiGenerated` · ExifTool IPTC damgası | §11.3 |
| 3.12 | Varlık CAS + `<sha256>.meta.json` sidecar + R2 senkronu (~60 satır) | §3.5 |
| 3.13 | Run manifest yazıcı — `knowledgeCommitSha`, era damgası, tahmini vs gerçek maliyet | §13 |
| 3.14 | **`instagram-post` + `instagram-carousel` pipeline'ları uçtan uca** (CLI'dan) | §10 |
| 3.15 | `linkedin-post` — aynı motor, farklı spec (≤5MB kalite merdiveni) | §10 |

**Çıkış:** ★ **Sistem gerçek bir carousel üretti, sen onayladın, elle paylaştın.**
Tez kanıtlandı: tek renderer, iki şerit, aynı tipografi.

### FAZ 4 — Komuta merkezi → §12

Sıra kasıtlı: pipeline'ların neyi göstermesi gerektiğini ancak şimdi biliyorsun.

| # | Ekran | § |
|---|---|---|
| 4.1 | Tasarım sistemi katmanı: OKLCH nötr rampa, tip ölçeği, boşluk skalası, kabuk↔yüzey modeli, hareket süreleri | §12.1–12.4, §12.7 |
| 4.2 | Vite + React + Tailwind + shadcn + Hono + SSE iskeleti; ⌘K palet **birincil navigasyon**; kalıcı makine durumu şeridi | §12.5 |
| 4.3 | **Corpus Browser** — filtreli tablo, satır içi düzenleme→commit, toplu pin/emeklilik | §12.9 |
| 4.4 | **Record Detail** — kaynak alıntısı, `git log --follow` zaman çizgisi, supersedes zinciri, **ters indeks: bu kaydın etkilediği her varlık** | §12.9 |
| 4.5 | **Context Preview** — bölüm başına token çubuğu, tam prompt metni, kart başına "neden dahil edildi", canlı aç/kapa | §5.3, §12.9 |
| 4.6 | **Run Launcher** — tipli girdi formu (şemadan), şerit seçimi, maliyet **aralığı** + güven noktası, duvar saati tahmini | §8.3, §12.9 |
| 4.7 | **Approval Queue** — klavye odaklı (j/k/a/e/r/p); red gerekçesi kalıcı ve sonraki çalıştırmaya negatif kısıt olarak enjekte edilir; son kabul edilen 5-10 varlık referans olarak geçer | §12.5, §12.9 |
| 4.8 | **Tolerans okuması bileşeni** — imza öğesi (§4b): ΔE, kaplama, en-boy, palet payı; rozet değil, limit karşısında ölçüm | §11.1, §12.9 |
| 4.9 | **Placement Preview** — gerçek platform chrome simülasyonu (Reels %14/%35/%6 güvenli alan overlay'i) | §9.1, §12.9 |
| 4.10 | **Discovery / Reconciliation** — 4 sütun: DEĞİŞMEDİ / DEĞİŞTİ / ÇELİŞTİ / YENİ | §4.4, §12.9 |
| 4.11 | **Schema Editor** — yasak anahtar kelime fiziksel olarak yazılamaz; kaydetmeden önce **tüm corpus'a karşı dry-run**, kaç kaydın kırılacağını sayıyla söyler, codemod'suz yıkıcı değişikliği reddeder | §3.3, §12.9 |
| 4.12 | **Cost & Budget** — tahmin vs gerçek, canlı bedava kota sayaçları, fiyat anlık görüntüsü yaşı uyarısı, **UI'dan ayarlanabilir tavanlar (D17)** | §8.3, §12.9 |
| 4.13 | Tailscale erişimi + **Telegram onay botu** (inline klavye) — D19'un üç yüzeyi tamam | §9.4 |
| 4.14 | Asset Library (FTS5 arama, "premium üretildi ama hiç yayınlanmadı" filtresi, **Reuse** birinci sınıf eylem) | §12.9 |
| 4.15 | **Run History / Provenance Browser** — her manifest zaman çizgisi olarak: girdiler, bilgi ağacı commit SHA'sı, adım başına şerit ve model, seed, tahmini vs gerçek, insan kararları. `rerun` (donmuş plan) ve `replay` (bugünün tanımı) ayrı düğmeler; UI **açıkça** "rerun kararı tekrarlar, eseri değil" der | §13, §12.9 |
| 4.16 | **Strategy Health** — aktif dönemin lint panosu: kaynaksız iddia, birimsiz değer temaları, süresi geçmiş kanıtlar, `generalisation_note`'suz dönem-aşırı kanıt, `re_verify_by` geçmiş mevzuat kaydı, yasak sözlük terimi | §11, §12.9 |
| 4.17 | **Doctor ekranı** — bir ay ihmalden sonra açılacak ilk ekran: sağlayıcı fiyat/şema drift'i, emekliye ayrılacak modeller, süresi geçmiş kayıtlar, %20 üstü maliyet sapması, indeks/corpus ayrışması. **Rapor yazar, hiçbir şeyi değiştirmez** | §13, §12.9 |

**Çıkış:** Sistem, kullanmaya devam edeceğin kadar keyifli. Bu, hayatta kalmasının
gerçek belirleyicisi.

### FAZ 5 — Hareket katmanı → §7.4, §7.5, §7.7

| # | İş | § |
|---|---|---|
| 5.1 | HyperFrames kurulumu + Claude skill'leri (`npx hyperframes skills update`) | §7.4 |
| 5.2 | `motion/frame.md` — marka token'ları kamera bağlamına çevrilmiş | §7.4, §4.1 |
| 5.3 | Marka hareket kütüphanesi: intro/outro, lower-third, `ZoomToTarget`, `SyntheticCursor`, `ClickRipple`, `BrowserChrome` | §7.4 |
| 5.4 | Ses: **`GENERATE`** yeteneği `"audio.tts"` ile — kendi kaydın (dosya girdisi, fiil değil) · Chatterbox klonu (yerel, MIT) · Gemini TTS (bedava şerit) · ElevenLabs (premium şerit). **Dördü de UI'da seçilebilir (D-18)** | §7.5 |
| 5.5 | Altyazı: Groq whisper-large-v3 / yerel whisper.cpp → kelime bazlı zamanlama → `.ass` karaoke altyazı. **Zorunlu insan transkript kapısı** (Türkçe WER %10-25) | §7.5 |
| 5.6 | **Demo yakalama:** Xvfb + headed Chromium 1920×1080 + `ffmpeg -f x11grab -framerate 60 -draw_mouse 0`. Playwright script `timeline.json` yazar — tıklama hedefleri **piksel oluşmadan önce** bilinir | §7.7 |
| 5.7 | `demo-video` pipeline — demo bir **sürümlü artefakt**, MP4 sadece build çıktısı | §10 |
| 5.8 | `reels` — demo bölüm işaretlerinden **deterministik** türetme. Otomatik klipleyici YOK (konuşma enerjisiyle çalışır, sessiz ekran kaydında işe yaramaz) | §10 |
| 5.9 | `explainer-video` — aynı hareket kütüphanesi, çok en-boy render | §10 |
| 5.10 | **Tam kapsamlı test paketi** — döngü protokolünün öngördüğü tek geniş test turu (`LOOP§D.4`); FAZ-1.10'da kurulan altyapı burada tam koşar | §15 |

**Çıkış:** Görüşme öncesi gönderebileceğin gerçek bir demo videosu, kendi sesinle.
Tam test paketi burada çalıştırılır — daha önce değil.

### FAZ 6 — Deck, döküman, prospect → §7.6, §10

| # | İş | § |
|---|---|---|
| 6.1 | Deck IR (kapalı LayoutEnum) + React sayfa şablonları + `page.pdf()` | §7.6 |
| 6.2 | ECharts SSR (SVG) + D2 diyagram, marka renkleri enjekte | §7.6 |
| 6.3 | `linkedin-document` — düzleştirilmiş PDF, ≤10 sayfa, veri bağlama **anlık görüntülenir** (Mart'ta paylaşılan doküman Haziran'da hâlâ Mart rakamını gösterir) | §10 |
| 6.4 | Prospect dizini = CRM. `rm -rf` = silme talebi, `cat` = erişim talebi | §10 |
| 6.5 | Araştırma şelalesi: kendi siteleri (yerel Playwright) → Bright Data SERP (5k bedava/ay) → Tavily (1k bedava/ay) → **ihale-mcp** (yayınlanan/kazanılan ihale = teyitli bütçe + kapsam + tarih) → borsa-mcp/pykap. **LinkedIn kaynaklı her yol lint kuralıyla bloklu** | §10 |
| 6.6 | 14 günlük tazelik kapısı + kaynak provenance sidecar'ı | §10 |
| 6.7 | **5 alanlık kişiselleştirme tavanı** — fazlası Türk B2B'sinde şüphe uyandırıyor, iltifat değil | §10 |
| 6.8 | Ürün ekran görüntüleri **gerçek Playwright çekimi**, asla üretilmiş. Adı geçen bir prospect'e giden deck'te uydurma dashboard olgusal bir iddiadır | §10, §11.4 |
| 6.9 | `prospect-deck` uçtan uca + zorunlu olgu-doğrulama kapısı | §10 |

**Çıkış:** Gerçek bir görüşme öncesi gerçek bir prospect'e özel deck teslim edildi.

### FAZ 7 — Yayınlama ve analitik → §9, §13

| # | İş | § |
|---|---|---|
| 7.1 | Platform spec tablosu kod olarak (`sourceUrl` + `verifiedAt` her satırda) + üç aylık drift denetçisi | §9.1 |
| 7.2 | **Meta adaptörü** — IG feed/carousel/Reels/Stories + Threads. Kendi işletmen için App Review gerekmiyor. `content_publishing_limit` her yayından önce; token yenileme işi **ilk gün** kurulur | §9.2 |
| 7.3 | **LinkedIn adaptörü** — `w_member_social`; metin, görsel VE **döküman** postu (en yüksek etkileşimli format, hiçbir aggregator vermez) | §9.3 |
| 7.4 | Token-bucket rate limiter uploader'dan **önce**; Meta yinelenen gönderimde mevcut ID'yi döndürür — yerel defterle karşılaştır | §8.5, §9.2 |
| 7.5 | **OAuth kurulumu** — Meta uygulaması (kendi işletmen, App Review gerekmiyor) + LinkedIn "Share on LinkedIn" (3-legged OAuth). Her ikisinin kapsamları `KARARLAR.md`'de kayıtlı | §9.2, §9.3 |
| 7.6 | **Token yenileme işi — ilk gün kurulur.** Meta uzun ömürlü token 60 günde ölür; yenileme işi yayın hattından önce çalışır ve başarısızlığı sessiz değil, bloklayıcıdır | §9.2 |
| 7.7 | **Publish Queue & Channel Status ekranı** — zamanlanan/giden içerik, kanal başına operasyonel durum: Meta tier ve oran bütçesi, LinkedIn sürüm sabiti ve üç aylık yeniden kontrol hatırlatıcısı, token son kullanma tarihi | §9.4, §12.9 |
| 7.8 | Günlük insight anlık görüntüleri → SQLite. **İlk postla birlikte başlat** — IG hesap insight'ları 90 günde kayboluyor ve backfill endpoint'i yok | §13 |
| 7.9 | Performans panosu: kazanan hook'lar `corpus/`a geri akar, yorum dili müşteri-sesi kaydı olur, lexicon her ıskalamada sıkılaşır | §13, §11.2 |

**Çıkış:** Tek tıkla yayın + ilk performans verisi akıyor + kanal sağlığı görünür.

### FAZ 8 — Reklam, uyum, proaktiflik (sürekli) → §10, §11, §16

| # | İş | § |
|---|---|---|
| 8.1 | `ad-creative-set` — dik hook/copy/visual matrisi, tek kompozisyondan çok yerleşim | §10 |
| 8.2 | Reklam metni linter'ı — Meta kişisel-özellik kuralı B2B lead-gen'de en sık sessiz red sebebi ve kolayca lint edilebilir | §11.2 |
| 8.3 | Compliance Panel + C2PA (ertelendi) + EU AI Act Md. 50 ifşası | §11.3 |
| 8.4 | Haftalık `suite doctor` — sağlayıcı fiyat drift'i, `re_verify_by` geçmiş kayıtlar, bütçe sapması. **Rapor yazar, hiçbir şeyi değiştirmez** | §16 |
| 8.5 | Proaktif katman açılır: haftalık içerik önerisi, boş takvim uyarısı, mevzuat değişiminden içerik fırsatı (D10) | §10 |
| 8.6 | Türk hukukçudan KVKK aydınlatma + açık rıza metinleri. **LLM'e yazdırma** — KVKK 2026/347 geri dönüştürülmüş şablonları açıkça cezalandırıyor | §11.3 |
| 8.7 | **Yedekleme ve geri yükleme tatbikatı** — repo + R2 + secret'lar ayrı bir diske geri yüklenir ve `just verify` orada yeşil verir. Denenmemiş yedek, yedek değildir | §14 |
| 8.8 | **Secret rotasyon ve sızıntı müdahale prosedürü** — hangi anahtar nereden döner, sızıntıda ilk 10 dakikada ne yapılır. `KARARLAR.md`'de yazılı, yılda bir tatbik edilir | §14 |
| 8.9 | **Yerel MCP yüzeyi** (aday, D-33) — Hono sunucusu `corpus.search/get/propose` ve aktif çalıştırmayı MCP olarak açar; Claude Code, UI'ın gördüğü aynı projeyi görür. Palmier Pro deseninden alındı | §3.8, §14 |

**Çıkış:** Sistem kendi başına haftalık plan öneriyor, sen onaylıyorsun.

---

### FAZ 9 — Sürekli denetim (bitiş yok)

Döngü durmaz (`LOOP§A.2`). Sekiz faz kapandıktan sonra turlar denetim moduna geçer;
her tur aşağıdakilerden **birini** ilerletir ve `DURUM.md`'ye yazar.

| # | Tur tipi | Ne arar |
|---|---|---|
| 9.1 | Spec drift turu | Platform ölçüleri, sağlayıcı fiyatları, model emeklilikleri — `verifiedAt` üç aydan eskiyse yenile |
| 9.2 | Kural uyum turu | `KURALLAR.md`'deki her BLOCKING kuralın zorlaması hâlâ çalışıyor mu — **kasten ihlal ederek** doğrula |
| 9.3 | Bilgi tazeliği turu | `re_verify_by` geçmiş kayıtlar, süresi dolmuş kanıtlar, çelişki kuyruğu |
| 9.4 | Maliyet turu | Tahmin vs gerçek sapması >%20 olan sağlayıcılar, kullanılmayan premium varlıklar |
| 9.5 | Ölü kod / bağımlılık turu | Kullanılmayan sağlayıcı tanımlayıcıları, ölü şablonlar, lisansı değişmiş bağımlılıklar |
| 9.6 | Kapsam turu | Araştırmada olup sistemde olmayan yetenek var mı — `docs/research/` `ctx_search` ile taranır |

**Çıkış kriteri yok.** Bu faz kullanıcı açıkça durdurana kadar sürer.

---

## 8. Değişmez ilkeler (§2 taslağı)

1. **Kernel `attributes` okumaz.** CI grep'i bunu zorlar.
2. **Agent önerir, sen uygularsın.** Onay = git commit.
3. **Görsel modeline Türkçe metin çizdirilmez.** Metinsiz üret, gerçek fontla kompozit et.
4. **Tek render motoru.** İkinci CSS alt kümesi = ikinci Türkçe hata modu.
5. **Bedava ve premium çıktı tipografide aynıdır.** Şeritler kelime ve resim satın alır, tasarım değil.
6. **Model ID'si pipeline'da yer almaz.** Yetenek iste, yönlendirici seçsin.
7. **Her varlık üretim anında dönem damgası alır.** Sonradan retrofit imkânsız.
8. **Kaynaksız sayısal iddia yayınlanamaz.** `claim_source` zorunlu.
9. **Onay ima eden yapay insan üretilmez.** Md. 27/12.
10. **Emeklilik silme değildir.** `expired_at` + `superseded_by`, dosya kalır.
11. **Türetilmiş her şey yeniden üretilebilir.** İndeks kaybı veri kaybı değildir.
12. **Bir ay ihmal edilse de çalışır.** Hiçbir daemon doğruluk tutmaz; kurtarma `git clone` + `cat`.

---

## 9. Doğrulama

Her fazın sonunda çalıştırılacak, kanıt üretmeden "bitti" denmez.

**Doğrulama felsefesi: her kapı kasten ihlal edilerek test edilir.** Yeşil bir test,
gerçekten koruduğunu kanıtlamaz; kırmızıya döndüğünü görmek kanıtlar.

**FAZ 0 — ön hazırlık**
- `node -v` → v22.x · `ffmpeg -version` · `xvfb-run --help` · `just check` yeşil
- `npx hyperframes doctor` → eksik yok
- `fc-list | grep -i <marka-fontu>` → kurulu; `İstanbul'da yazılım çözümleri: ığüşöç ĞÜŞÖÇ` doğru render ediliyor
- `docs/ANAYASA.md` §1–§19 dolu; `grep -rn "TBD\|TODO" docs/ANAYASA.md` boş
- `wc -l CLAUDE.md` ≤200; dört kök belge mevcut
- **İhlal testleri:** `record.attributes.foo` yaz → CI kırmızı · `"ı".toUpperCase()` yaz → lint kırmızı · yanlış halka import'u → lint kırmızı · sahte anahtar commit → engellendi · `Refs:` olmayan commit → reddedildi · var olmayan §'ya referans → CI kırmızı
- Bake-off çıktıları `docs/research/bakeoff/`, kazananlar `registry/models.yaml`'da
- **Bağımsız doğrulama agent'ı temiz raporu**

**FAZ 1 — kurulum**
- `just check` + `just verify` yeşil
- `just test projection` — her varlık tipi için 4 projeksiyon snapshot'ı eşleşiyor
- `just reindex` sıfırdan indeksi saniyeler içinde kuruyor
- Türkçe arama: "ölçüm" → "ölçümlerinizi" buluyor (trigram + RRF çalışıyor)
- `just plan` hiçbir şey harcamadan DAG basıyor; **ağ kablosunu çek → yine çalışıyor**
- Cassette katmanı: bir sağlayıcı çağrısını kaydet, tekrar oynat, **secret'ın kasette olmadığını gözle doğrula**
- Fixture corpus'ta gerçek prospect adı geçmiyor (`grep` ile kanıtla)
- Bir işi yarıda kes (SIGKILL) → yeniden başlatınca kaldığı yerden devam ediyor, çift ücret yok

**FAZ 2 — bilgi çekirdeği + marka DNA**
- Her corpus kaydı kendi tipine karşı geçerli
- `suite discovery plan --mode merge` **ikinci kez** çalıştırıldığında **0 op** üretiyor
- Şema editöründe bir alanı zorunlu yapmayı dene → kaç kaydın kırılacağını sayıyla söyleyip reddediyor
- `x_signature` kırık bir dosyayla regenerasyon dene → çalıştırma **duruyor**
- Emekliye ayrılmış bir dönem kaydını çağır → retrieval yüklemi getirmiyor

**FAZ 3 — görsel hattı ★**
- Golden-file tipografi testi yeşil; **fontu kasten boz → kırmızıya döndüğünü gör**
- `suite plan instagram-carousel --topic <konu>` hiçbir şey harcamadan DAG + sağlayıcı + TL aralığı basıyor
- Gerçek bir carousel üret → QA skorları, maliyet, era damgası `runs/<id>/manifest.json`'da
- Lexicon linter'ını yasak terimle test et → yayın bloklanıyor
- Kaynaksız sayı içeren metin yaz → `claim_source` eksik diye reddediliyor
- Bütçe tavanını aşan bir çalıştırma dene → Başlat kilitli, gerekçe Türkçe

**FAZ 4 — komuta merkezi**
- Tailscale üzerinden telefondan onay kuyruğuna gir, bir varlık onayla
- Telegram botundan bir varlığı reddet → gerekçe `brand/decisions.jsonl`'a düşüyor
- Context Preview'da bir kartı kapat → token çubuğu canlı düşüyor, override manifest'e yazılıyor
- Record Detail'de bir olguyu düzelt → o olgunun etkilediği varlıklar listeleniyor
- Klavyeyle uçtan uca: ⌘K → pipeline seç → çalıştır → onayla, fareye hiç dokunmadan

**FAZ 5 — hareket**
- `hyperframes render` 1080×1920 çıktı; `ffprobe` h264/yuv420p/aac doğruluyor
- Güvenli alan overlay'li contact sheet'te başlık hiçbir yerde UI chrome altında değil
- Demo yakalama: `timeline.json` tıklama hedefleriyle dolu, zoom'lar hedeflere oturuyor
- Türkçe altyazı transkript kapısı gerçekten bloklıyor (atlanamıyor)
- **Tam kapsamlı test paketi** — protokolün öngördüğü tek geniş tur

**FAZ 6 — deck / prospect**
- `deck.pdf` düzleştirilmiş; LinkedIn döküman yükleme spec'ini geçiyor
- 14 günlük tazelik kapısını eski bir kaynakla test et → pipeline reddediyor
- LinkedIn kaynaklı bir sağlayıcı eklemeyi dene → lint kuralı bloklıyor
- 5 alan üstü kişiselleştirme dene → kapı reddediyor

**FAZ 7 — yayınlama**
- Meta'ya tek test postu; `content_publishing_limit` yayından **önce** sorgulanıyor
- Aynı postu iki kez gönder → yerel defter yinelemeyi yakalıyor (Meta mevcut ID'yi döndürür, "başardım" sanma)
- Token yenileme işini elle tetikle → yeni token yazılıyor; **sahte süresi dolmuş token ile dene → yayın bloklanıyor, sessizce geçmiyor**
- Publish Queue ekranı token son kullanma tarihini ve oran bütçesini gösteriyor
- Insight snapshot işi çalışıyor, ilk satırlar SQLite'ta

**FAZ 8 — reklam / uyum**
- Sentetik insan içeren varlık onaylamayı dene → kod seviyesinde bloklanıyor
- Meta kişisel-özellik kuralını ihlal eden metin yaz → linter yakalıyor
- `suite doctor` rapor yazıyor, **hiçbir şeyi değiştirmiyor**
- **Geri yükleme tatbikatı:** repo + R2 + secret'lar boş bir dizine geri yüklenir, orada `just verify` yeşil verir

**FAZ 9 — sürekli denetim**
- Her denetim turu `DURUM.md`'ye bir satır ve `KARARLAR.md`'ye (gerekiyorsa) bir karar bırakır
- Kural uyum turunda her BLOCKING kural **kasten ihlal edilerek** doğrulanır — yeşil test yeterli değil
- Kapsam turu `docs/research/` üzerinde `ctx_search` ile çalışır; sistemde karşılığı olmayan yetenek bulunursa yeni faz adımı açılır

**Kalıcı sağlık testi:** sistemi dört hafta hiç açma, sonra `suite verify` çalıştır.
İndeks sıfırdan kurulup her kayıt geçerli çıkıyorsa sistem sağlıklı.

---

## 10. Açık kalemler / doğrulama borçları (§18)

Bunlar planı bloklamıyor; ilgili fazda kapatılacak. Her kalem `KARARLAR.md` sonunda 🔴
ile durur; kapanınca tarih ve kanıtla kapatılır. **Ön ek `V-`** (D-42).

| 🔴 | Kalem | Kapanacağı adım |
|---|---|---|
| V-01 | Remotion Creators koltuk fiyatı (JS widget) — HyperFrames kararını teyit için | 0.D.3 |
| V-02 | Hangi latin-ext font lisanslanacak — marka kararı, FAZ 2 keşfiyle bağlantılı | 0.A.5 → FAZ 2 |
| V-03 | rjsf'nin JSON Schema 2020-12 kapsaması — kısıtlı profil bunu atlatmak için tasarlandı, yine de spike ile doğrula | 0.D.4 |
| V-04 | fal'ın endpoint başına OpenAPI URL'i belgelenmiş public arayüz mü — elle tanımlayıcı yedeği her hâlükârda zorunlu | 0.D.5 → 3.4 |
| V-05 | Anthropic'in yapılandırılmış çıktı alt kümesi OpenAI'ninkiyle aynı mı — derleyici daha katı olana yazıldı, CI'da gerçek çağrıyla doğrula | 1.4 |
| V-06 | `dima` ürün mü modül mü; "dima by Upcytech" onaylı-marka modeli doğru mu — yanlış karar sonradan MAJOR sürüm değişikliği | 2.11 |
| V-07 | Era 1'in dikeyi hangisi — kanıt otomotiv tedarik/Bursa'yı işaret ediyor ama bu üçüncü taraf verisinden çıkarım, senin gerçek pipeline'ından değil. Hipotez olarak tohumla, 10 gerçek satış görüşmesinden sonra üzerine yaz | 2.9 |
| V-08 | Kuruluş tarihi çelişkisi (sicil 3 Tem 2025 · LinkedIn 2022 · site "2021'den beri") — tek doğruya bağlan | 2.9 |
| V-09 | KAP resmî REST API şartları ticari kullanıma uygun mu (şartlar PDF'i "Hizmete Özel") | 6.5 |
| V-10 | Türk hukukçu — KVKK aydınlatma/açık rıza metinleri, sayısal performans iddialarının Reklam Kurulu açısından durumu, sınır ötesi veri aktarımı beyanı | 8.6 |
| V-11 | Run bağlam anlık görüntülerinin saklama süresi — manifest sonsuza, bağlam N gün. N ilk yüz çalıştırmadan **önce** belirlenir | 1.9 |

---

## 11. Bilinçli olarak yapmayacaklarımız (§16 özeti)

Tam liste ve gerekçeler anayasada. En kritik olanlar:

**Altyapı:** Postgres · Langfuse · Temporal/Trigger.dev/Inngest · LiteLLM proxy · vektör DB ·
DVC · Git LFS · Turborepo/Nx (ilk gün) · n8n/Windmill/Dify/Langflow · herhangi bir agent
framework'ü (LangGraph/CrewAI/Mastra) · ayrı DAM · ayrı BI aracı

**Kreatif:** Satori (Türkçe tipografi riski) · Canva Connect (Enterprise kapılı) ·
Gamma/Presenton/hazır deck üreticileri (prospect'e giden hiçbir şeye) · Midjourney (API yok,
ToS otomasyonu yasaklıyor) · otomatik klipleyiciler · ffmpeg `zoompan` (tamsayıya
yuvarlıyor, yavaş zoom'da görünür basamak yapıyor) · Playwright `recordVideo` (sessizce
800×800 WebM'e düşüyor)

**Lisans tuzakları:** FLUX.2 [dev] self-host (ticari değil) · XTTS-v2 (CPML, şirket
dağıldı) · F5-TTS ağırlıkları (CC BY-NC) · Bria RMBG (CC BY-NC, MIT rembg içinde paketli,
yanlışlıkla seçilmesi kolay) · ElevenLabs bedava katmanı (ticari lisans YOK)

**Kanallar:** TikTok (denetim headless pipeline'ın yapısal olarak geçemeyeceği şeyler
istiyor) · X (link içeren postta $0.20) · Pinterest (Trial'da Pin'leri sadece sen
görüyorsun) · Reddit (en yüksek deplatform riski)

**Ölü/ölmekte:** Imagen 4 (17 Ağu 2026) · gpt-image-1 (23 Eki 2026) · OpenAI Sora Videos API
(24 Eyl 2026) · Proxycurl (kapandı) · Crunchbase Basic API · Google CSE (1 Oca 2027) ·
Flowise (arşivlendi 13 Ağu 2026) · GitHub Models (30 Tem 2026)

**Kapsam:** çok kiracılılık · müşteri koltukları · white-label · public API · bunu ürün
yapmayı öngören hiçbir yapı. Bir düzine bağımlılığın lisans hesabını değiştirir ve bu ay
gerçekten ihtiyacın olan şeyi hiç bitirmemenin en hızlı yoludur.

---

## 12. En büyük risk

Araştırmanın kendi ifadesiyle: **"Bu projenin başarısız olmasının en muhtemel yolu aşırı
mühendisliktir."** Tek kişilik bir şirket üç ay strateji CMS'i yazıp imalatçılarla sıfır
hafta konuşabilir.

**Sert kural:** 10 gerçek varlık yayınlanana kadar 7 strateji varlık tipinin ötesine
geçilmez. `SignedSource`, 3-yollu merge, probe bake-off ve karar defteri **ilk yeniden
üretim gerçekten acıtana kadar** eklenmez.

Faz 2'nin sonunda elinde gerçek bir carousel olmalı. Olmuyorsa sıralama yanlış.
