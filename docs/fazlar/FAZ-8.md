# FAZ 8 — Reklam, uyum, proaktiflik

**Amaç:** Sistem kendi başına haftalık plan öneriyor, sen onaylıyorsun.
**Yöneten kararlar:** D-10, D-23, D-33
**Ön koşul:** FAZ 7 kapalı
**Çıkış kriteri:** Haftalık öneri kuyruğu çalışıyor · sentetik insan içeren varlık kod
seviyesinde bloklanıyor · **geri yükleme tatbikatı yapıldı**: repo + blob + secret'lar
boş bir diske geri yüklendi ve orada `just verify` yeşil verdi

---

## 8.1 — `ad-creative-set` ve H/C/V matrisi    [x] 2026-08-16

📖 §10, §7.1 · D-4
🔗 FAZ-3.14
🛠 Dik matris: **hook × copy × visual**. Tek kompozisyondan çok yerleşim (feed · story ·
   reel). Değişkenler dik olmazsa hangi öğenin çalıştığı ölçülemez — üç varyantı birden
   değiştiren bir test hiçbir şey öğretmez.
📁 `registry/pipelines/ad-creative-set.pipeline.yaml` · `packages/engine/src/matris.ts` ·
   `scripts/gates/matris.mjs`
✅ Varyantlar **eksenlerden TÜRETİLİYOR**, elle yazılmıyor (`varyantUret`): iki eksenli
   bir sapma doğamıyor. 3 eksen × 3 düzey → **7 varyant** (ölçüldü), tam ızgara 27.
   `just plan ad-creative-set` → `varyant matrisi: ofat · 7 varyant`, ücretli adımlar
   `ü×7` (D-228 — çözücü bloğu düşürüyordu, çarpan üretimde YOKTU).
   ⚠ **Kriter değişti (D-225, R-74):** "3×3 matris" diyordu; araştırma tam çapraz
   çarpımı yalnız Meta `asset_feed_spec` için ayırıyor — orada H+C+V bileşenleri
   yüklenir ve kombinasyonu **sunucu** kurar, H×C×V kreatif render EDİLMEZ. Öğrenme
   tasarımı **OFAT**: dört kat daha ucuz, aynı bilgi.
🧪 İki ekseni aynı anda değiştiren varyant elle tanımlandı → kapı **kırmızı**, ölçüldü:
   `✗ temelden 2 eksende ayrılıyor (hook, copy) — fark hangi eksene ait, ATFEDİLEMEZ`
   `✗ 2 varyant, mod 'ofat' 7 bekliyor — maliyet tahmini bu sayıyı çarpan alıyor`
   ⚠ `full` modda iki eksenli farklılık **hata değildir** — kombinatoryal tasarımın
   tanımı budur; OFAT kuralını oraya uygulamak geçerli bir seti reddederdi.
💾 `feat(cli): ad-creative-set matrisi` · `Refs: FAZ-8.1 · §10`

## 8.1b — Varyant genişletme çalışma zamanında    [ ]

📖 §10, §13 · D-225, D-228
🔗 8.1
🛠 `plan()` yedi varyant fiyatlıyor, `runPipeline` tek varyant koşuyor. Ücretli adımlar
   varyant başına, koordinat (`hook`/`copy`/`visual`) kısıtlara girmeli; manifest her
   varyantı ayrı adım olarak taşımalı.
📁 `packages/engine/src/run.ts` · `packages/engine/src/manifest-writer.ts`
✅ `just uret ad-creative-set` yedi varlık üretiyor, manifest yedi koordinat taşıyor;
   üretilen sayı `report.varyantSayisi` ile birebir
🧪 Manifest'ten bir varyantı düş → koşu **eksik** raporluyor, "bitti" demiyor
💾 `feat(engine): varyant genişletme` · `Refs: FAZ-8.1b · §10`

## 8.2 — Reklam metni linter'ı    [x] 2026-08-16

📖 §11.2 · R-35
🔗 FAZ-3.10
🛠 Meta'nın **kişisel özellik kuralı** B2B lead-gen'de en sık **sessiz red** sebebi ve
   deterministik olarak lint edilebilir: "sen"li varsayım, sağlık/finans/etnik ima,
   hedef kitleye özellik atfetme. Sessiz red, sebebini söylemeyen bir reddir — bu yüzden
   kapı bizde, onlarda değil.
📁 `packages/render/src/lexicon/reklam.ts` (mevcut lexicon altyapısı — ayrı bir lint
   dizini açmak ikinci bir paralel sistem olurdu)
✅ `uret.mjs` reklam hattında her metin bloğunu geçiriyor; ret gerekçesi **çözümü de
   söylüyor** — sebebini söylemeyen bir ret, sessiz reddin bizdeki kopyası olurdu.
🧪 `"Borçlarınızdan kurtulun"` → **reddediliyor** (11 test).
   ⚠ **Asıl incelik: saf ikinci şahıs YASAK DEĞİL.** "Demoyu izleyin" meşru; yasak
   olan ikinci şahsın **kişisel özellikle kesişmesi**. Yalnız ikinci şahsa bakan bir
   linter her reklamı reddeder ve ilk haftada kapatılır.
   ⚠ **İki gerçek hata yakalandı ve düzeltildi:** (1) `iniz\b` deseni
   `borçlarınız**dan**`ı kaçırıyordu — Türkçe eklemeli, iyelikten sonra durum eki
   gelir; kelime sonuna çapalanan bir ek deseni en tipik cümleyi kaçırır.
   (2) `kurt` (köken) **`kurtul`**un içinde eşleşiyordu: `foldForSearch` `Kürt` ile
   `kurtul-`u aynı dizeye düşürüyor. Katlamanın yok ettiği ayrımlar (`kurt`, `kilo`,
   `sakat`, `zarar`) listeden **çıkarıldı** ve sebebi yazıldı — kaçırmak, her cümlede
   ateşleyip kapatılmaktan iyidir.
   ⚠ **%20 metin kaplama UYARI, red DEĞİL:** Meta bu kuralı artık uygulamıyor;
   blocker yapmak geçerli reklamları reddetmek olurdu. Ölçülmediyse denetim ATLANIR
   (D-175) — `undefined`ı "eşik altı" saymak temiz göstermek olurdu.
💾 `feat(render): reklam metni linter'ı` · `Refs: FAZ-8.2 · §11.2`

## 8.3 — Compliance Panel    [x] 2026-08-16

📖 §11.3 · R-33 · D-23
🔗 FAZ-3.11
🛠 `containsSyntheticPerson=false` **kod seviyesinde iddia** (Reklam Yönetmeliği Md.
   27/12, 1 Ağu 2026'dan yürürlükte) + EU AI Act Md. 50 ifşası. **C2PA ertelendi**:
   imza zinciri kanal dönüşümlerinde kopuyor ve kopuk imza, imzasızdan kötü — doğrulama
   yapıldığını sandırıyor.
📁 `apps/server/src/uyum-uc.ts` · `apps/ui/src/UyumPanosu.tsx` (iddia tipi ve damga
   FAZ-3.11'de kurulmuştu; bu adım **zinciri kapattı**)
✅ Panel rozet değil okuma veriyor: dayanak adı · "beyan" · "ifşa eksik" · "ölçülemedi".
   ⚠ **Zincir SON HALKADA kopuktu:** `disclosureRequired` hesaplanıyor ve IPTC'ye
   damgalanıyordu ama **hiçbir yayın kapısı ona bakmıyordu**. Artık `publish()`in
   2b. kapısı — alt-text'in yanında ve aynı sebeple: yayınlanmış bir postun ifşası
   sonradan eklenemez.
🧪 İfşa gerekli + damga yok → **yayın DURUYOR** · görünür katman yok → **DURUYOR** ·
   uyum kaydı hiç yok → **ifşa GEREKLİ varsayılıyor ve duruyor** (alan eklemeyi unutan
   bir üretici kapıyı sessizce kapatamaz) · muafiyet kapsamında → damga ARANMIYOR.
   ⚠ **Muafiyet dar okunmamalı:** boyutlandırma, kırpma, renk düzeltme ve olay
   değiştirmeyen arka plan düzenlemesi ifşa tetiklemiyor — her varlığa ifşa şeridi
   koymak kuralı olmadığı yere taşımak olurdu.
   ⚠ Panoda **"uyumlu işaretle" düğmesi yok**: dayanaksız iddia bir tıklamaya inerdi.
💾 `feat(render): compliance panel ve AI ifşası` · `Refs: FAZ-8.3 · §11.3`

## 8.4 — Haftalık `just doctor`    [x] 2026-08-16

📖 §16, §13 · R-70
🔗 FAZ-4.17
🛠 Sağlayıcı fiyat drift'i · `re_verify_by` geçmiş kayıtlar · %20 üstü bütçe sapması ·
   indeks/corpus ayrışması. **Rapor yazar, HİÇBİR ŞEYİ DEĞİŞTİRMEZ**: otomatik düzeltme,
   bir ay sonra dönen kullanıcıdan ne olduğunu gizler ve ilke 12'yi çürütür.
📁 `scripts/doctor.sh` · `scripts/doktor.mjs`
✅ `just doctor` rapor basıyor ve **hiçbir dosya yazmıyor**; `just doctor --json`
   makine-okunur çıktı veriyor — **yönlendirmeyi kullanıcı yapar, betik yazmaz.**
   ⚠ **"Son çalışma damgası" bilinçli olarak YOK.** Yazılsaydı iki şey birden
   bozulurdu: (1) betik salt-okur olmaktan çıkardı, (2) o damga bir doğruluk kaynağı
   olurdu ve silindiğinde sistem "hiç koşmadı" ile "damga kayboldu"yu ayırt edemezdi.
   **Haftalık tetik bir ALARM SAATİDİR** (kullanıcının kendi `crontab` satırı),
   doğruluk kaynağı değil — 12. yasa: hiçbir daemon doğruluk tutmaz. Kurulumu komut
   YAPMAZ, yalnız satırı basar: kullanıcının makinesine izinsiz iş yazılmaz.
🧪 Doctor'a `writeFileSync` ekle → `doctor-salt-okur` **kırmızı**, ölçüldü:
   `✗ scripts/doktor.mjs: doctor yolunda YAZMA çağrısı — 72:writeFileSync(...)`
💾 `feat(cli): haftalık doctor raporu` · `Refs: FAZ-8.4 · §16`
   (faz dosyası `scripts` kapsamı öneriyordu; `commit-msg` kapısının izinli listesinde
   yok ve kapı haklı — kapsam paket adıdır, dizin adı değil.)

## 8.5 — Proaktif katman    [x] 2026-08-16

📖 §10 · D-10
🔗 7.9, 8.4
🛠 D-10'un ikinci kademesi açılıyor: haftalık içerik önerisi, boş takvim uyarısı,
   mevzuat değişiminden içerik fırsatı. **Öneri, üretim değildir** — hiçbir öneri
   metered fiil ateşlemez, hepsi onay kuyruğuna düşer (R-14).
📁 `packages/engine/src/proactive/oneri.ts` · `scripts/oneri.mjs`
✅ `just oneri` ölçüldü: `15 gündür yayın yok (son: 2026-08-01) — takvim boş` +
   `→ just uret instagram-post`. Ağ yok, model yok, yazma yok.
🧪 **Öneri ÇALIŞTIRILABİLİR bir şey taşımıyor** — tipte ne fonksiyon var ne handle;
   "öneriyi çalıştır" çağrısı YAZILAMAZ (test bunu alan alan doğruluyor). `--calistir`
   bayrağı yok ve olmayacak: eklemek her zaman makul görünür, eklendiği gün sistem
   kendi kendine para harcamaya başlar.
   ⚠ **İki mekanik gürültü freni** (D-10 "kademeli"nin mekanik hâli): (1) **gözlemsiz
   öneri kurulamıyor** — `kanit` zorunlu ve serbest metin değil, "şu konuda içerik
   üret" tipi genel fikirler bu tipte İFADE EDİLEMİYOR; (2) **haftalık tavan 3** —
   fazlası liste olur, liste okunmaz; düşenler sessizce kırpılmıyor, sayısı bildiriliyor.
   ⚠ Defter okunamıyorsa öneri ÜRETİLMİYOR: bilinmeyen bir dünyaya tavsiye vermek,
   tavsiye değil tahmindir. "Hiç yayın yok" ile "uzun süredir yayın yok" da AYRI
   kanıt türleri — ilkinde ölçüm penceresi hiç açılmamıştır (D-220).
💾 `feat(engine): proaktif haftalık öneri katmanı` · `Refs: FAZ-8.5 · §10`

## 8.6 — KVKK metinleri (hukukçu)    [ ] BLOKE:insan (V-10)

📖 §11.3 · V-10
🔗 6.4
🛠 Türk hukukçudan **aydınlatma + açık rıza** metinleri, sayısal performans iddialarının
   Reklam Kurulu açısından durumu, sınır ötesi veri aktarımı beyanı. **LLM'e yazdırma:**
   KVKK 2026/347 geri dönüştürülmüş şablonları açıkça cezalandırıyor. V-10 burada kapanır.
📁 `docs/hukuk/HUKUKCUYA-SORULAR.md` (metin YOK, **soru listesi** var —
   sistemin gerçekte hangi veriyi nerede tuttuğu tablosu + yedi somut soru)
✅ Metinler hukukçu onayıyla repoda, tarih ve kaynak damgalı · V-10 🔴 kalktı
🧪 LLM üretimi bir KVKK metnini `zone: human` diye işaretlemeyi dene → imza kapısı reddediyor
💾 `docs(hukuk): KVKK aydınlatma ve açık rıza metinleri` · `Refs: FAZ-8.6 · §11.3`

## 8.7 — Yedekleme ve geri yükleme tatbikatı    [x] 2026-08-16

📖 §14, §16 · R-52, R-70 · D-38
🔗 FAZ-7.8
🛠 **Denenmemiş yedek, yedek değildir.** Repo + blob deposu + secret'lar **ayrı bir diske**
   geri yüklenir ve orada `just verify` yeşil verir. `derived/runs/` türetilemez (D-38,
   R-52) — kurtarma senaryosunun asıl sınadığı şey odur; indeks zaten yeniden kurulur.
📁 `scripts/yedek.mjs` · `scripts/yedek-tatbikat.sh` · `docs/RUNBOOK.md`
✅ `just yedek-tatbikat` GERÇEKTEN clone ediyor ve klonda `just check` koşturuyor —
   simülasyon değil, kurtarma yolunun kendisi.
   ⚠ **TATBİKAT GERÇEK BİR KUSUR BULDU** ve ilk koşuda kırmızı döndü:
   `✗ pnpm install BAŞARISIZ — klon kendi kendine ayakta duramıyor`
   (`ERR_PNPM_IGNORED_BUILDS`). Build-script onayları **geliştirici makinesinde**
   yaşıyordu, repoda değil — yani kurulum yalnız BU makinede çalışıyordu. Onaylar
   `package.json` → `pnpm.onlyBuiltDependencies` altına yazıldı.
   **Denenmemiş bir yedeğin gizlediği şey tam olarak budur:** her şey yolunda
   görünür, ta ki gerçekten kurtarmaya çalışana kadar.
🧪 Tatbikat clone ile GELMEYENLERİ ayrı ayrı bildiriyor ve sessizce "tamam" demiyor:
   `⚠ age anahtarı GELMEDİ — repoda değil` · `✓ derived/runs geldi (türetilemez
   defter korundu)` · `derived/blobs` gitignore'lu, ayrı yedek şart.
💾 `feat(scripts): yedekleme ve geri yükleme tatbikatı` · `Refs: FAZ-8.7 · §14`

## 8.8 — Secret rotasyon ve sızıntı müdahalesi    [x] 2026-08-16

📖 §14 · R-51
🔗 8.7
🛠 Hangi anahtar nereden döner, sızıntıda **ilk 10 dakikada** ne yapılır — yazılı,
   sıralı, kişi bağımsız. Sızıntı anında prosedürü düşünmek, prosedürü uygulamamaktır.
   `KARARLAR.md`'de kayıtlı, yılda bir tatbik edilir.
📁 `docs/RUNBOOK.md` · `scripts/gates/secret-rotasyon.mjs`
✅ Rotasyon tablosu **kodla senkron** — `secret-rotasyon` kapısı zorluyor: kodda
   `readEnv`/`process.env` ile okunan her anahtar tabloda bir satır taşımak zorunda.
   **17 anahtar** kapsandı ve kapı beş tanesini ben yazmadan buldu.
   ⚠ **Sır olmayanlar da tabloda** (`CF_ACCOUNT_ID`, `SUITE_PORT`…): listede olmayan
   bir anahtar, "unutulmuş" ile "sır değil" arasında ayırt edilemez.
🧪 Yeni bir `process.env` okuması ekle → kapı **kırmızı**, ölçüldü:
   `✗ YENI_GIZLI_ANAHTAR kodda okunuyor ama RUNBOOK rotasyon tablosunda YOK`
   ⚠ Kapı ilk sürümünde **kendi yorum satırındaki örneği** gerçek anahtar sandı —
   `chart.js` darboğazının kendi modülünü yakalamasıyla aynı sınıf. Yorumlar
   çıkarıldı: bir kapı kendi belgesiyle kandırılmamalı.
   ⚠ **Gerçek rotasyon `8.8b`de** (V-27): anahtar yokken "döndürdüm" demek ölçüm değil.
💾 `docs(docs): secret rotasyon ve sızıntı müdahale prosedürü` · `Refs: FAZ-8.8 · §14`

## 8.8b — Gerçek anahtar rotasyonu    [ ] BLOKE:insan (V-27)

📖 §14 · R-51
🔗 8.8, 7.5b
🛠 Prosedür, tablo ve kapsam kapısı yazıldı ve **ölçüldü**; kalan iş gerçek bir
   anahtarı gerçekten döndürmek. Anahtar yokken "döndürdüm" demek ölçüm değildir.
✅ Bir anahtar döndürüldü → yeni anahtarla çalışıyor, **eski anahtar reddediliyor**
🧪 Eski anahtarla çağrı dene → sağlayıcı reddediyor (iptal gerçekten işlemiş)
💾 `<özet>` + `Run:` / `Actor:` / `Kind:` (çalıştırma commit'i)

## 8.3b — Damgalama sırası: yayın koşu İÇİNDE, damga SONRA    [ ] BLOKE:teknik

📖 §11.3, §13 · D-227
🔗 8.3, 7.2b
🛠 `uret.mjs` damgayı ve blob'u tüm koşu bittikten SONRA basıyor; `PUBLISH` koşunun
   İÇİNDE. Yani `stamped: true` yayın anında hiçbir zaman doğru olamaz ve ifşa kapısı
   **fail-closed** davranıyor (doğru davranış, ama gerçek yayını engelliyor).
✅ Damgalama `RENDER` sonrası, `PUBLISH` öncesi koşuyor — sıra manifest'te görünüyor
🧪 Damgasız bir varlıkla yayın dene → **hâlâ** bloklanıyor (kapı gevşetilmedi)
💾 `<tip>(engine): damgalama sırası` · `Refs: FAZ-8.3b · §11.3`

## 8.9 — Yerel MCP yüzeyi    [x] 2026-08-16

📖 §3.8, §14 · D-33
🔗 FAZ-4.2
🛠 Hono sunucusu `corpus.search/get/propose` ve aktif çalıştırmayı MCP olarak açar;
   Claude Code, UI'ın gördüğü **aynı** projeyi görür. **Aday karar (D-33)**: burada
   karara bağlanır. Yazma yolu MCP'de de `propose`dur — ikinci bir yazma kapısı,
   R-14'ün tek güvenlik hikâyesini bozar.
📁 `apps/server/src/mcp/araclar.ts`
✅ **D-33 karara bağlandı → D-226: KABUL, ama dar.** Üç araç: `corpus_search` ·
   `corpus_get` · `corpus_propose`. MCP'nin eklediği şey dosya okumak DEĞİL —
   retrieval yüklemi (emekli kayıt görünmez), Türkçe FTS5 araması, ve imzalı
   `draft` yazma yolu. Üçü de `grep` ile elde edilemez.
🧪 MCP'den `status: active` yaz → **reddediliyor** (`zone` ve `x_signature` de).
   ⚠ **Sessizce silinmiyor, REDDEDİLİYOR:** silmek çağıranın "active yazdım"
   sanmasına yol açardı. Sessiz düzeltme, öğrenilmeyen bir kuraldır.
   ⚠ `derived/ingest/` **ASLA açılmıyor** (R-50): karantina metni talimat olarak
   sunulamaz; bir araç onu döndürseydi prospect'in sitesindeki bir cümle modele
   komut olarak ulaşırdı.
   ⚠ İndeks yoksa **503 + "arama KOŞMADI"** — boş liste dönmek corpus'un boş
   olduğunu söylerdi (D-175). Yüklemden geçmeyen kayıt "bulunamadı" sayılıyor,
   "var ama göremezsin" değil.
   ⚠ **Kapsam dürüstlüğü:** taşıma katmanı minimal (HTTP+JSON); tam MCP el sıkışması
   ve SSE taşıması YAZILMADI ve bu D-226'da açıkça yazılı.
💾 `feat(server): yerel MCP yüzeyi` · `Refs: FAZ-8.9 · §3.8`
