# ANAYASA

> Sistemin tek referansı. **Baştan sona okunmaz** — faz dosyasındaki 📖 satırı
> hangi bölümü okuyacağını söyler. Bölüm numaraları kalıcıdır: bir bölüm silinmez,
> `(kaldırıldı → §X.Y)` işaretiyle bırakılır ki eski atıflar kırılmasın.
>
> Durum: §1–§7 dolu. §8–§19 iskelet, 0.B.2c–0.B.2d'de dolacak.

## §1 Amaç, kapsam, işletim modeli {#section-1}

### Ne için var

Upcytech'in marka, ürün ve strateji bilgisinin **tek doğruluk kaynağı**; üstünde
ajans işlerini agentic pipeline'larla üreten yerel bir komuta merkezi.

Çözdüğü sorun: her içerik üretimi sıfırdan başlıyor, marka tutarlılığı kişisel
hafızaya bağlı, hiçbir şey ölçülmüyor, ve şirket konum değiştirirken (geri dönüşüm →
imalata AI/ML çözümleri) eski kimlik her yerde yaşamaya devam ediyor.

### Ne yapmaz

Ürün değildir, satılmayacaktır. Çok kiracılılık yok, müşteri koltuğu yok, public API
yok. Bunları öngören her yapı bir düzine bağımlılığın lisans hesabını değiştirir ve
bu ay gerçekten ihtiyaç duyulan şeyi hiç bitirmemenin en hızlı yoludur (→ §17).

### İşletim modeli: üç kapı

**Kural: UI işletir, Claude Code genişletir.** Üçü de aynı dokuz fiile, aynı corpus'a
ve aynı run manifest'ine açılır — iki ayrı sistem değil, üç ayrı giriş.

| Kapı | Ne için | Ne için **değil** |
|---|---|---|
| Komuta merkezi | Rutin üretim, onay, karşılaştırma, takvim, maliyet | Yeni pipeline yazmak, keşif |
| Claude Code | Yeni yetenek: pipeline, sağlayıcı, varlık tipi, corpus'a bilgi | Rutin üretim — UI daha hızlı ve maliyeti önden gösteriyor |
| Telegram | Yalnız onay / red / gerekçe | Üretim başlatmak |

Yeni yetenek **repodan girer**, rutin üretim **UI'dan akar**. Claude Code bir pipeline
YAML'ı yazar → `just validate` → `just plan` (hiçbir şey harcamaz) → insan diff'i
inceler → commit → o andan itibaren UI'da görünür.

### Kaynak vs çıktı

Kalıcı varlık MP4 veya PNG değildir. `demos/<ürün>/` altındaki üçlü (Playwright akışı,
`timeline.json`, `narration.tr.json`) kaynaktır; MP4 build çıktısıdır. Aynı ilke
`carousel.ir.json`, `deck.ir.json`, `storyboard.ir.json` için de geçerli: benzer bir iş
geldiğinde LLM'i yeniden çalıştırmak yerine IR kopyalanıp düzenlenir — hem ucuz hem
tutarlı. Yirmi deck sonra bu, maliyetin çoğunu ortadan kaldırır.

### Başarı ölçütü

"Instagram postu hazırla" dendiğinde sistem açıları önerir, insan seçer, markaya uygun
görseli ve Türkçe metni üretir, spec ve marka QA'sından geçirir, onay kuyruğuna koyar —
ve bunu **bir yıl sonra tamamen farklı bir marka ve ürün setiyle de** aynı şekilde yapar.

## §2 Değişmez ilkeler {#section-2}

On iki yasa. Tartışılmaz. Değişecekse önce burada, sonra `KURALLAR.md`'de, en son kodda —
ve asla kırmızı bir kapıyı geçmek için (R-76).

1. **Kernel `attributes` okumaz.** Zarf tek sözleşmedir. → §3.2
2. **Agent önerir, insan uygular.** Onay = git commit. → §5.4
3. **Görsel modeline Türkçe metin çizdirilmez.** → §7.2
4. **Tek render motoru.** İkinci CSS alt kümesi = ikinci Türkçe hata modu. → §7.1
5. **Bedava ve premium çıktı tipografide aynıdır.** Şeritler kelime ve resim satın alır,
   tasarım değil. → §8.2
6. **Model ID'si pipeline'da yer almaz.** Yetenek iste, yönlendirici seçsin. → §8.1
7. **Her varlık üretim anında marka + dönem damgası alır.** → §4.3
8. **Kaynaksız sayısal iddia yayınlanamaz.** → §11.4
9. **Onay ima eden yapay insan üretilmez.** → §11.3
10. **Emeklilik silme değildir.** → §5.1
11. **Türetilmiş her şey yeniden üretilebilir** — ama `derived/runs` türetilmiş
    DEĞİLDİR ve silinmez. → §3.5
12. **Bir ay ihmal edilse de çalışır.** Hiçbir daemon doğruluk tutmaz; kurtarma
    `git clone` + `cat`. → §16

**Neden yasa, kural değil:** bunların her biri, ihlal edildiğinde *sessizce* bozar.
Kernel `attributes` okursa sistem çalışmaya devam eder — ta ki şirket dönüşmek isteyene
kadar. Damga eksikse hiçbir şey patlamaz — ta ki bir varlığın hangi dönemden olduğu
sorulana kadar, ki o an eşleşme çoktan kaybolmuştur.

## §3 Sistem mimarisi {#section-3}

### §3.1 Dört halka {#section-3-1}

```
Ring -1  CONTRACTS   packages/contracts — hiçbir şey import etmez, herkes onu eder
Ring  0  KERNEL      packages/kernel — sabit, yılda ~4 değişir. 10 kavram, 9 fiil
Ring  1  REGISTRY    registry/*.yaml + brand/ — kullanıcı çalışma anında düzenler
Ring  2  CORPUS      corpus/ + content/ — markdown + frontmatter, kayıt başına dosya
Ring  3  DERIVED     derived/index (silinebilir) · derived/runs (SİLİNMEZ) · blobs · ingest
```

Import yönü tek yönlüdür ve **üç mekanizma birden** zorlar: ESLint bölgeleri,
dependency-cruiser (modül *ve* klasör kapsamında döngü), TS project references.
Biri atlatılabilir, üçü birlikte atlatılamaz (R-03).

`brand/` Ring 1'dir (kullanıcının düzenlediği yapılandırma), `content/` Ring 2'dir
(corpus'un üretilmiş kardeşi). Beşinci halka açılmadı — beşinci halka, dört halkanın
tek değerini, import yönünün mekanik zorlanabilirliğini sulandırırdı (D-50).

### §3.2 Kayıt zarfı {#section-3-2}

Her kayıt bir dosyadır. Frontmatter iki bölgeye ayrılır ve **sınır mutlaktır**:

**Zarf — sistemin bildiği, kernel okur.** `id` (uuidv7, ön ekli) · `brand_id` · `type` ·
`schema_version` · `kind` (dna|ledger) · `zone` (generated|human|imported) · `status`
(draft|active|pinned|superseded|retired) · `locale` · `era_id` · `created_at` ·
`valid_at`/`invalid_at`/`expired_at` (bi-temporal) · `re_verify_by` · `supersedes[]` /
`superseded_by` · `confidence` · `approved_by`/`approved_at` · `source{kind,ref,quote}` ·
`scope{channels,verticals,personas}` · `tags[]` · `context_weight` · `x_signature`.

**`attributes` — kullanıcının tanımladığı, kernel'e KAPALI.** Tipe özgü her alan burada.

**Neden bu ayrım her şeyi taşır:** zarf alanları yaşam döngüsü ve köken verisidir, alan
şeması değil. Retrieval yüklemi `era_id`, `status`, geçerlilik tarihlerini okumak
zorunda; bunlar `attributes` altında olsaydı yüklem kendi yasasını çiğnerdi (D-41).

**Üç katmanlı zorlama:** `OpaqueAttributes` markası `record.attributes.x`'i **derleme
hatası** yapar · ESLint `no-restricted-syntax` yakalar · grep + **Proxy tuzağı**
(`attributes`'ı fırlatan bir kayıt dokuz fiilden geçirilir). Grep destructuring ile
atlatılır; Proxy atlatılmaz.

**Varlığa özgü veriye yasal yol:** `SELECT` kaydı çeker → `packages/registry/src/
attributes.ts#unsealAttributes` (bunu yapan tek dosya) açar → `COMPOSE` (saf) belge
modelini üretir → `RENDER` yalnız belge modelini görür, `RecordEnvelope`'ı asla.

### §3.3 Şema profili {#section-3-3}
İzin verilen JSON Schema 2020-12 alt kümesi. Yasaklananlar ve neden.

### §3.4 Projeksiyon derleyicisi {#section-3-4}
Tek şema → form + TS tipi + katı LLM şeması + SQLite DDL.

### §3.5 Türetilmiş indeks {#section-3-5}

Ring 3 üçe ayrılır ve **ikisi aynı şey değildir**:

| Yol | Türetilebilir mi | Git | Kayıp maliyeti |
|---|---|---|---|
| `derived/index/` | evet — `just reindex` saniyeler | ignore | rahatsızlık |
| `derived/runs/` | **HAYIR** | **commit'li, yedeklenir** | kalıcı veri kaybı |
| `derived/blobs/` | hayır, ama içerik-adresli | ignore + nesne deposu | yeniden üretim maliyeti |
| `derived/ingest/` | evet (yeniden çekilir) | ignore | rahatsızlık |

`derived/runs/` corpus'tan üretilemez: bir çalıştırmanın ne kadara mal olduğu, hangi
sağlayıcıya ne gönderildiği ve insanın hangi kararı verdiği başka hiçbir yerde yazmıyor.
`repo-hygiene` kapısı `git check-ignore derived/runs` eşleşirse hata verir — bu, en
kolay yapılan ve en pahalı hatadır.

### §3.6 Bağımlılık yönü ve modül sınırları {#section-3-6}
Halka sınırlarının mekanik zorlaması: lint bölgeleri, dependency-cruiser, project references.

### §3.7 Durum makineleri {#section-3-7}

Dört yaşam döngüsü, hepsi ayrık birleşim (discriminated union) olarak. XState **değil** —
kalıcı anlık görüntü kütüphane sürümüne bağlanmasın diye.

```
RUN     kuyrukta → planlanıyor → onay bekliyor → çalışıyor → başarılı | hata | iptal
ASSET   taslak → qa-geçti → onaylandı → yayınlandı → emekli
RECORD  draft → active → pinned | superseded | retired
JOB     hazır → alındı → çalışıyor → bitti | başarısız | iptal
```

**Onay bir fiil değil, bir durum geçişidir.** `human.approve` diye bir fiil yok; onay
`RUN`'ın `onay bekliyor → çalışıyor` geçişidir ve insanın git commit'iyle olur.
Yan etkisi olmayan şey fiil olmamalı (D-35).

### §3.8 "Tam olarak bir tane olmalı" listesi {#section-3-8}

`chokepoints.json` bu listeyi tutar ve **lint yapılandırmasını üretir** — satır eklemek
zorlamayı otomatik getirir.

corpus yazıcı · git çağıran · retrieval yüklemi · maliyet defteri · secret okuyucu ·
SQLite handle · Chromium başlatan · alt süreç · HTTP istemcisi · saat · RNG · id üreteci ·
yol çözücü · frontmatter ayrıştırıcı · yapılandırma çözücü · manifest yazıcı · hata
taksonomisi · geçiş uygulayıcı · iş kuyruğu · logger · sağlayıcı çağırıcı · kanal
yayıncısı · plan dondurucu · **kaydetme (`just save`)**

**Neden her biri:** iki saat replay'i bozar. İki HTTP istemcisi çevrimdışı modu yalan
yapar. İki frontmatter ayrıştırıcı bir dosyayı indekste geçerli, pipeline'da geçersiz
yapar. İki kaydetme yolu — biri kapıyı atlar.

`just save` bu listeye 2026-08-15'te eklendi: kabuk `&&` zinciri ve heredoc sonrası
komutlar üç kez reddedilen bir commit'i "başarılı" raporladı. Hatırlamaya güvenmek işe
yaramadı; darboğaz işe yaradı (R-70).

### §3.9 Kanonik adlar {#section-3-9}
Aynı şeyin tek adı. Yanlış varyantlar `citations` kapısında hata verir.

### §3.10 Dokuz fiil ve yan etki sınıfları {#section-3-10}
RESOLVE · SELECT · COMPOSE · GENERATE · RENDER · VALIDATE · PROPOSE · PUBLISH · INGEST.
Yetenek adı ≠ fiil adı.

## §4 Marka sistemi {#section-4}

### §4.1 Token mimarisi {#section-4-1}
### §4.2 Çok markalılık ve kalıtım {#section-4-2}

`brand_id` zarfta birinci sınıf sistem alanıdır ve retrieval yükleminin **ilk**
koşuludur. Dönemler markaya göre: `brand/<brand_id>/current`, `brand/<brand_id>/eras/`.

`(brand_id, era_id)` bir **çalıştırma parametresidir**, dosyadan okunan global durum
değil. Bu ayrım tasarımın taşıyıcısı: tek satırlık bir `brand/current` ile ya markalar
aynı anda yaşayamaz (Upcytech kuyruğu dima'ya kayar), ya `era_id='*'` verilir ve dima
konumlandırması her Upcytech deck'ine sızar. İkisi de "asla sızmaz" vaadini çürütür.

Token kalıtımı: alt marka ana markadan devralır, gerektiği kadar ezer. Kanal bağlamaları
da markaya göre — Upcytech'in LinkedIn'i ile dima'nın Instagram'ı ayrı hesaplar.
### §4.3 Dönem (era) modeli {#section-4-3}

Era üç ucuz şeyden ibaret: `brand/<brand_id>/eras/<slug>/era.yaml` (değişmez manifest +
commit SHA) · `brand/<brand_id>/current` (aktif dönem) · `git tag era/<slug>`.

**Dönem klasörü YOK.** Corpus dönem başına kopyalanmaz. Sebep işlevsel: kopyalama,
regenerasyonu "dosya ekleme"ye çevirir ve `git diff` yan yana gösteremez — inceleme
ölür, insan hepsini kabul eder, yönetişim tiyatroya döner (D-30).

Regenerasyon **aynı yolları** yeniden yazar, branch ve worktree'de. `git diff` gerçek
satır bazlı inceleme verir.

**Varlık damgası — geri alınamaz olan tek şey.** Her varlık üretim anında `brand_id` +
`era_id` + `kit_version` + `definition_digest` + `context_manifest` + `source_run_id`
alır. Sonradan retrofit **imkânsızdır**: eşleşme kaybolur. Bu, tasarımdaki en pahalı
hata ve ilk gün önlemesi bedava. İlk hafta tek dönem varken alan gereksiz görünür —
tam da bu yüzden atlanır.
### §4.4 Yeniden üretim motoru {#section-4-4}

Marka DNA'sı tek seferlik bir dosya değil, **yeniden çalıştırılabilir motordur** (D-6).
Beş komut:

```
suite discovery plan   --era <slug> --mode merge|mirror --trigger <enum>
suite discovery review <run_id>
suite discovery apply  --plan runs/<id>/plan.json
suite era mint  <slug> --from <run_id>
suite era retire <slug>
```

`merge` sadece ekler (güvenli aylık tazeleme, varsayılan). `mirror` silmeler dahil tam
yeniden üretim — "hepsini baştan yap" düğmesi.

**Idempotent atlama zorunlu altyapıdır, optimizasyon değil.** `(input_hashes,
prompt_hash, model_id, temperature, seed, retrieval_snapshot)` değişmemişse o bölüm
atlanır. Bu olmadan LLM her koşuda değişmemiş metni yeniden yazar, 900 opsiyonluk
incelenemez bir plan çıkar, insan hepsini kabul eder — ve "insan inceledi" güvencesi
sahte olur.

**Üretilmiş vs elle düzenlenmiş:** `zone: generated` kayıtlar `x_signature` taşır. İmza
sağlamsa üzerine yazılır; **imza kırıksa çalıştırma durur** ve düzenlemenin
`zone: human` kaydına terfi ettirilmesi istenir.
### §4.5 Sticky karar defteri {#section-4-5}

`brand/<brand_id>/decisions.jsonl` — reddedilen her değişikliğin `(json_pointer, hash)`
kaydı. Sonraki çalıştırmada aynı öneri gelirse "bunu daha önce reddettin" diye katlanmış
gelir; `pin` işaretli alanlar plana hiç girmez.

**Neden bu bileşen kritik:** onsuz dördüncü yeniden üretimde aynı 200 kararı yeniden
vermek gerekir ve insan sistemi terk eder. Kopyalanacak bir üst örneği yok — Letta,
Mem0, Cognee hepsi LLM'e yazma yetkisi verip insana sonradan inceleme rolü bırakıyor;
burada tam tersi.
### §4.6 Dönem geçişi ve içerik denetimi {#section-4-6}

Geri dönüşüm geçmişi **yük değil kanıttır**. Her `proof_asset` üç alan taşır:
`era_of_origin` · `generalisation_note` · `transfer_confidence`
(`direct | analogous | illustrative_only`).

Geri dönüşüm sonucu asla silinmez ve asla imalat sonucu gibi sunulmaz — agent'ın
kelimesi kelimesine tekrarlaması gereken açık bir aktarım argümanıyla **daha zor bir
vaka** olarak sunulur. Lint kuralı: önceki dönemden kanıt kullanan ve
`generalisation_note` taşımayan hiçbir varlık yayınlanamaz.

`suite era retire` üç şey yapar: dönemi `sunset` işaretler · lineage map üretir (emekli
claim id'leri, token adları, ürün adları → yerine geçenler) · **content-audit** çıkarır:
o dönemden hâlâ canlı olan her yayınlanmış varlık, `güncelle | arşivle | tarih olarak
bırak` diye sınıflanır. Kanonik yüzeyler (site, ana deck) sert geçiş tarihi alır; sosyal
arşiv kendi dönemine etiketli kalır.

## §5 Bilgi ve hafıza {#section-5}

### §5.1 Corpus {#section-5-1}
### §5.2 Retrieval yüklemi {#section-5-2}

Kodda **tek** yerde. Bu sorgu, "agent'ların bildiği şey"in tanımıdır:

```sql
WHERE brand_id = :brand
  AND (era_id  = :era OR era_id = '*')
  AND status IN ('active','pinned')
  AND expired_at IS NULL
  AND (invalid_at IS NULL OR invalid_at > :as_of)
  AND (valid_at   IS NULL OR valid_at  <= :as_of)
```

`:as_of` sayesinde geçmişe dönük denetim bir **parametre**, bir özellik değil. Emekliye
ayrılmış 2024 geri dönüşüm konumlandırması 2026 imalat deck'ine asla sızamaz; 2024'te
üretilmiş bir varlık ise kendi dönemine karşı hâlâ doğru çözülür.

Yüklem `SystemRecord` (attributes'sız projeksiyon) üzerinde derlenir — `attributes`
üzerinde derlenseydi §2'nin 1. yasasını kendi içinde çiğnerdi.
### §5.3 Bağlam tarifleri {#section-5-3}
Bölüm başına token bütçesi + bağlam manifesti.
### §5.4 Öneri → onay yolu {#section-5-4}

**Agent yalnız `corpus.propose()` çağırabilir.** Öneri `status: draft`, `zone: generated`,
`source.kind: inference` olarak iner ve retrieval yükleminin `status IN ('active','pinned')`
koşulu yüzünden **görünmez**. Yani agent'ın yazdığı hiçbir şey, insan onaylamadan
üretimi etkileyemez.

Onay: `approved_by`/`approved_at` damgalar, `status: active` yapar, commit eder.

Tekil öneri çalışma ağacına draft olarak iner; toplu regenerasyon branch'e gider. Bu
ayrım sık durumu ucuz, tehlikeli durumu incelenebilir tutar.

**Çelişki tespiti her öneride çalışır:** aynı `(type, scope)` yuvasında FTS5 yakın-kopya
araması + ucuz bir LLM sınıflandırıcı (`entails | contradicts | unrelated`).
`contradicts` **asla otomatik çözülmez** — iki iddiayı, iki kaynağı, iki tarihi ve iki
güveni yan yana koyan bir tahkim maddesi açar: eskiyi tut / yeniyi al / ikisini farklı
kapsamlarda tut.
### §5.5 Çelişki tahkimi {#section-5-5}
### §5.6 Türkçe arama {#section-5-6}

FTS5'in Türkçe stemmer'ı **yok**. Tek indeksle "ölçüm" araması "ölçümlerinizi" bulamaz —
eklemeli dilde kök arama çalışmaz.

Çözüm iki indeks + birleştirme: `unicode61 remove_diacritics 2` (ı/İ/ş/ğ/ç/ö/ü'yü
normalleştirir) **paralel** `trigram` indeksi (eklemeli morfolojiyi yakalar), sonuçlar
reciprocal rank ile birleşir (`1/(60+rank)`), `claim` alanı `body`'den ağır tartılır.

**Vektör yok** — ~2000 kayıt VE çapraz dil geri çağırma sancısı başlayana kadar.
Başladığında FTS5 top-50 üzerinde **yeniden sıralayıcı** olur, birincil arayıcı değil:
birinci aşama açıklanabilir kalmalı ("SKDM eşleşti, bm25 8.4"). Açıklanabilirlik
burada gerçek gereksinim, geri çağırma değil.

## §6 Strateji modeli {#section-6}

Yedi varlık tipi. **Bu yediden fazlası, on gerçek varlık yayınlanana ve bir iş
kapanana kadar açılmaz** (→ §16).

| Tip | Ne tutar | Kritik alan |
|---|---|---|
| `positioning` | Dunford'un beş bileşeni, normalleştirilmiş | `competitive_alternatives` — statüko rakip olarak sayılmalı |
| `messaging` | Mesaj evi: çatı iddia + destek sütunları | her sütun bir `proof_asset`'e bağlı |
| `icp` | İdeal müşteri profili + **diskalifiye edenler** | `disqualifiers` boşsa profil işe yaramaz |
| `persona` | Karar verici, farkındalık ve sofistikasyon seviyesiyle | `awareness_stage` (Schwartz) |
| `proof_asset` | Kanıt: vaka, ölçüm, referans, sertifika | `era_of_origin` + `transfer_confidence` |
| `competitor` | Rakip ve karşı-konumlandırma | `category` — aynı kategoride mi |
| `offer` | Hizmet hattı, fiyat anlatısı | TRY, tarihli |

Her biri zarfı taşır; tipe özgü alanlar `attributes` altında ve kullanıcı çalışma anında
genişletebilir (§3.3).

**Strateji dürüst kalmalı.** Konumlandırmanın yanlış olduğunu gösteren sinyaller
`Strategy Health` ekranında izlenir: statükoya kaybedilen işlerin payı, satış döngüsü
uzunluğu, iskonto derinliği, prospect'lerin kategori terimini kendiliğinden kullanıp
kullanmadığı. Bunlar tahmin değil, ölçüm.

## §7 Üretim {#section-7}

### §7.1 Render mimarisi {#section-7-1}

**Tek motor: headless Chromium.** Üç yüzey, aynı font yükleme yolu, aynı hata modu.

| Yüzey | Araç | Çıktı |
|---|---|---|
| Statik (post, carousel, reklam) | Playwright `page.screenshot()` | PNG/JPG |
| Döküman / deck | Playwright `page.pdf()` | PDF, düzleştirilmiş |
| Hareket | HyperFrames (Apache 2.0) | MP4 |

HyperFrames de headless Chrome + FFmpeg kullanıyor — üçü aynı motoru paylaşıyor.

**Satori reddedildi.** Ligature, kerning ve WOFF2 desteği yok. Hızlıydı (sub-100ms) ama
ayda ~50 varlıkta 700ms hiçbir şey ifade etmiyor; ikinci bir CSS alt kümesi ise ikinci
bir Türkçe tipografi hata modu demek (D-24).

**Renderer'ı sahiplenmek bir tercih değil, tezin kendisi:** bedava ve premium çıktı
tipografide, yerleşimde ve token'larda **byte-byte aynı** olmalı. Şeritler daha iyi
kelime ve daha iyi resim satın alır, daha iyi tasarım değil. Gamma/Canva/Presenton gibi
hazır üreticiler prospect'e giden hiçbir şeye dokunmaz — müşteriler o çıktıyı görür
görmez tanıyor ve "size özel yazılım yaparız" iddiasını çürütüyor (D-21).

Taşma **otomatik böler, asla küçültmez**. Sığdırmak için tipi küçültmek, makine üretimi
kreatifin bir numaralı görsel işaretidir.
### §7.2 Türkçe tipografi kapıları {#section-7-2}

**Hiçbir görsel modeline Türkçe metin çizdirilmez.** Her üretim prompt'u "no text, no
lettering" taşır; metin gerçek fontla kompozit edilir. Gerekçe belge: Ideogram kendi
dokümanında aksanlı Latin'in "hiç render edilmeyebileceğini" kabul ediyor, Google ise
in-image metin için dil listesi yayınlamıyor.

**Golden dosya bir PNG değil, JSON metriktir**: glyph kutuları, satır sayısı, ilerleme
genişliği, font ailesi, `notdef` sayısı = 0. Piksel referansı içerik-adresli depoda
durur ve sha256 ile anılır. İki kazanç: git'e binary girmez, ve metrik antialiasing
gürültüsünden etkilenmez.

Kanıt dizesi: `İstanbul'da yazılım çözümleri: ığüşöç ĞÜŞÖÇ`. Her şablon boyutunda
render edilir. **Konteyner içinde sessiz glyph fallback, bu sistemin bozuk varlık
üretmesinin en muhtemel yoludur** — ve hiçbir hata vermez, sadece yanlış görünür.

`.toUpperCase()` yalnız `kernel/src/text/case.ts`'de ve `toLocaleUpperCase('tr')` ile.
`'i'.toUpperCase()` → `I`, olması gereken `İ`. Ekran görüntüsünde tipo gibi görünür,
bug gibi değil — bu yüzden üretime kadar yaşar.
### §7.3 Görsel üretimi ve marka LoRA {#section-7-3}
### §7.4 Hareket katmanı {#section-7-4}

**HyperFrames** (heygen-com/hyperframes, Apache 2.0). HTML yazılır, video render edilir.

Remotion reddedildi: ücretsiz lisansı "individuals and companies up to three people"
diyor; Upcytech LinkedIn'de 6 çalışan gösteriyor. Company License gerekir. Revideo (MIT)
belgelenmiş yedek — hareket katmanı motor-bağımsız tasarlanır ki lisans şartı değişirse
rewrite değil swap olsun (D-25).

HyperFrames'in getirdikleri: hazır Claude Code skill'leri (`/hyperframes`,
`/website-to-hyperframes`, `/short-form-video`) · `frame.md` — tasarım sistemini kamera
bağlamına çeviren katman, token mimarimize doğrudan oturuyor · `/media-use` medya OS'u
(BGM, SFX, ikon, ses, LUT çözümleme + TTS/transkript/arka plan silme).

Build adımı yok — `index.html` olduğu gibi oynar. Agent'a devir düz HTML dosyasıdır,
JSX projesi değil.
### §7.5 Ses, altyazı, müzik {#section-7-5}
### §7.6 Deck ve döküman {#section-7-6}
### §7.7 Demo yakalama {#section-7-7}

Xvfb + headed Chromium 1920×1080 (`--force-device-scale-factor=2`) +
`ffmpeg -f x11grab -framerate 60 -draw_mouse 0`. Gerçek imleç kaydedilmez — daha iyisi
çizilir.

**Asıl numara:** Playwright script'i her tıklama hedefinin sınırlayıcı kutusunu ve zaman
damgasını `timeline.json`'a yazar. Yani **tıklama niyeti piksel oluşmadan önce
bilinir**. Her açık kaynak ekran kaydedici bunu kaydedilmiş fare izinden *çıkarmak*
zorunda; burada zaten veri olarak var. Zoom hedefleri, bölüm işaretleri ve otomatik
kırpma bundan deterministik olarak türer.

Bu yüzden otomatik klipleyiciler (OpusClip, Klap, Vizard) kullanılmaz: konuşma enerjisi
ve yüz takibiyle "ilginç an" arıyorlar; sessiz bir ekran kaydında hiçbir şey bulamazlar.
Bizde bölüm işaretleri zaten yazılı.

`ffmpeg zoompan` kullanılmaz — iç hesaplamayı tamsayıya yuvarlıyor ve yavaş zoom'da
görünür basamak yapıyor; premium demoyu amatörden ayıran şey tam olarak bu. Zoom
hareket katmanında, float hassasiyetiyle yapılır.

## §8 Sağlayıcılar {#section-8}

### §8.1 Tanımlayıcı formatı {#section-8-1}
### §8.2 Yetenek yönlendiricisi {#section-8-2}
Filtrele → fiyatla → skorla → yedek → **kaybedenleri de kaydet**.
### §8.3 Maliyet ve bütçe {#section-8-3}
Para = bigint USD mikro (D-36). Tavan UI'dan ayarlanır (D-17).
### §8.4 Adaptör sözleşmesi {#section-8-4}
`estimate` senkron ve saf. Sağlayıcı yanıt şekli sınırı geçemez.
### §8.5 Yeniden deneme, idempotency, rate limit {#section-8-5}
Devre kesici 5 ardışık hata, `(providerId, capability)` anahtarlı.
### §8.6 Hata taksonomisi {#section-8-6}
Kapalı birleşim. Her hata harcanan parayı taşır.
### §8.7 Sağlayıcı kataloğu {#section-8-7}
**ÜRETİLMİŞ** — `docs/referans/saglayicilar.md`. Elle yazılmaz.

## §9 Kanallar {#section-9}

### §9.1 Platform spec tablosu {#section-9-1}
Her satır `sourceUrl` + `verifiedAt` taşır. Üç aylık drift denetçisi.
### §9.2 Meta adaptörü {#section-9-2}
Kendi işletmen için App Review gerekmiyor. Token 60 günde ölür.
### §9.3 LinkedIn adaptörü {#section-9-3}
Döküman postu en yüksek etkileşimli format; hiçbir aggregator vermiyor.
### §9.4 Onay yüzeyleri {#section-9-4}
PC · Tailscale · Telegram.

## §10 Pipeline kataloğu {#section-10}

Dokuz iş: adım şeması, insan kapıları, çıktılar, maliyet. **ÜRETİLMİŞ** kısmı
`docs/referans/pipelinelar.md`.

## §11 Kalite ve uyum {#section-11}

### §11.1 Marka QA {#section-11-1}
Rozet değil tolerans okuması: ΔE limit karşısında ölçüm.
### §11.2 Deterministik lexicon linter {#section-11-2}
Modele "bu marka uygun mu" diye sormak işe yaramaz; yasak terim listesi yarar.
### §11.3 Hukuki kapılar {#section-11-3}
Reklam Yönetmeliği Md. 27/12 · KVKK · EU AI Act Md. 50.
### §11.4 Kaynaksız iddia yasağı {#section-11-4}
`claim_source` olmadan sayı yayınlanmaz.

## §12 Komuta merkezi tasarım sistemi {#section-12}

### §12.1 Renk {#section-12-1}
İzleme kabini tezi: kabuk marka-nötr, ekrandaki tek renkli şey iş.
### §12.2 Tipografi {#section-12-2}
Ölçülen her şey mono ve tabular. Türkçe %20-30 uzun.
### §12.3 Boşluk ve yoğunluk {#section-12-3}
### §12.4 Kabuk ↔ yüzey modeli {#section-12-4}
Stüdyo bir rota, modal değil.
### §12.5 Klavye haritası {#section-12-5}
Komut paleti birincil navigasyon, kısayol değil.
### §12.6 Durum matrisi {#section-12-6}
Yedi durum. Bayat içerik soldurulmaz. Hata toast değil.
### §12.7 Hareket {#section-12-7}
Altı şey animasyonlanır, hiçbiri 320ms'yi geçmez.
### §12.8 Erişilebilirlik {#section-12-8}
### §12.9 Ekranlar {#section-12-9}

## §13 Gözlemlenebilirlik {#section-13}

Run manifest sözleşmesi · maliyet defteri · `rerun` (donmuş plan) vs `replay` (bugünün tanımı).

## §14 Güvenlik {#section-14}

Prompt injection sınırı (`untrusted_input`) · sandbox katmanları · secret yönetimi (SOPS+age).

## §15 Test stratejisi {#section-15}

Golden-file · kontrat testleri · cassette · LLM değerlendirme · her ücretli fiil dry-run edilebilir.

## §16 Riskler ve azaltmalar {#section-16}

En büyüğü: aşırı mühendislik. Üç ay strateji CMS'i yazıp imalatçılarla sıfır hafta konuşmak.

## §17 Reddedilenler {#section-17}

~60 araç ve yaklaşım, her biri gerekçesiyle. Reddedilmiş bir karara atıf vermek hata.

## §18 Açık kalemler {#section-18}

`V-nn` doğrulama borçları. Her biri bir faz adımına bağlı.

## §19 Araştırma eki {#section-19}

`docs/research/` — 45 agent çıktısı, damıtılmış. Baştan sona okunmaz, `ctx_search` ile sorgulanır.
Ham transkript `~/.claude/projects/.../subagents/workflows/` altında.
