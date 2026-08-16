# ANAYASA

> Sistemin tek referansı. **Baştan sona okunmaz** — faz dosyasındaki 📖 satırı
> hangi bölümü okuyacağını söyler. Bölüm numaraları kalıcıdır: bir bölüm silinmez,
> `(kaldırıldı → §X.Y)` işaretiyle bırakılır ki eski atıflar kırılmasın.
>
> Durum: **tam.** §1–§19 dolu. Üretilmiş bölümler (§8.7, §10) `just docs` ile tazelenir.

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

Ring 1'deki her varlık tipi **JSON Schema 2020-12** yazar — ama tamamını değil. İzin
verilen alt küme `registry/PROFILE.md`de tanımlıdır ve `registry` kapısı zorlar.

**Neden alt küme:** tek şema DÖRT hedefe derlenir (§3.4) — rjsf formu · TypeScript tipi ·
katı LLM şeması · SQLite DDL. Tam JSON Schema'nın ifade gücü bu dördünde eşit değil:
rjsf `if/then/else`i kısmen destekler ve desteklemediğinde **form sessizce yanlış alan
gösterir**; LLM yapılandırılmış çıktısı `oneOf`/`not`/`patternProperties` kabul etmez ve
şema reddedilince model serbest metin döndürür, pipeline "geçerli" sanıp devam eder;
DDL için bir alanın tipi tek olmak zorundadır.

Yani **profil dışı bir anahtar, dört projeksiyondan en az birini SESSİZCE bozar** — ve
sessiz bozulma bu sistemin en pahalı hata sınıfıdır: çıktı üretilir, kimse fark etmez.

Yasak anahtarlar: `oneOf` · `not` · `if`/`then`/`else` · `patternProperties` ·
`unevaluatedProperties` · `$dynamicRef`. Tam liste ve her biri için ne kullanılacağı
`registry/PROFILE.md`de; burada tekrar edilmez (iki liste zamanla ayrışır).

**Şema değişikliği corpus'a karşı KURU ÇALIŞTIRILIR.** Bir alanı zorunlu yapmak, o alanı
taşımayan her kaydı geçersiz kılar; editör kaydetmeden önce kaç kaydın kırılacağını
SAYIYLA söyler ve codemod'suz yıkıcı değişikliği reddeder (§12.9).

### §3.4 Projeksiyon derleyicisi {#section-3-4}
Tek şema → form + TS tipi + katı LLM şeması + SQLite DDL.

Dört çıktının **tek kaynağı** vardır: varlık tipi şeması. Elle yazılan bir form ile elle
yazılan bir SQLite DDL'i bir gün ayrışır ve ayrıştığı gün kayıt indekste geçerli,
pipeline'da geçersiz olur (R-05).

Katı LLM şeması ayrı bir üretimdir çünkü sağlayıcıların yapılandırılmış çıktı alt kümesi
JSON Schema'nın tamamını kabul etmiyor; derleyici **daha katı olana** yazılmıştır (V-05).
`registry/PROFILE.md` izin verilen alt kümeyi tanımlar ve profil dışına çıkan bir şema
derlenmez — projeksiyonun çalışmadığını üretim anında öğrenmek yerine.

Her tip için CI'da **snapshot testi** var: şema değişince dört projeksiyonun dördü de
diff'te görünür. Üçünün değişip birinin unutulması, bu testin var olma sebebi.

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

```
contracts ← kernel ← {registry, corpus, providers, render} ← engine ← {server, cli}
ui → contracts (yalnız)
```

**Dört mekanizma, dördü de bağımsız:**
1. ESLint `import-x/no-restricted-paths` — bölge tanımları
2. `dependency-cruiser` — modül **ve** klasör kapsamında döngü yasağı
3. TypeScript project references — derleme düzeyinde
4. `pnpm hoist: false` — **dosya sistemi** düzeyinde phantom bağımlılık yok

Dördüncüsü en sinsi vakayı yakalar: `package.json`ında yazmadığı bir paketi import eden
bir modül, hoisting sayesinde geliştirme makinesinde çalışır ve temiz bir kurulumda düşer.
**Yalnız bu makinede çalışan şey, çalışmıyor demektir** (FAZ-8.7).

**Kardeş yasağı:** aynı katmandaki paketler birbirini import etmez. `corpus` ile
`providers` kardeştir; birinin diğerine ihtiyacı varsa ya ortak parça `kernel`e iner ya da
bağımlılık `engine`de kurulur. Bu yasak `matris:` bloğunda somutlaştı: şekil çözümü
`registry`de, tasarım yargısı `engine`de kaldı (D-228).

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

| Kavram | Kanonik | Yanlış varyant |
|---|---|---|
| Anayasa | `docs/ANAYASA.md` | ~~`docs/00-ANAYASA.md`~~ |
| Yol haritası | `docs/fazlar/FAZ-N.md` | ~~tek dosyalık yol haritası~~ |
| Türetilmiş indeks | `derived/index/` | ~~`.suite/index.db`~~ |
| Çalıştırma defteri | `derived/runs/` | ~~kök `runs/`~~ |
| Varlık byte'ları | `derived/blobs/` | ~~kök `assets/`~~ |
| Yayın defteri | `derived/runs/published.ndjson` | ~~`ledger/published.jsonl`~~ |
| Insight defteri | `derived/runs/insights.ndjson` | ~~SQLite tablosu~~ (D-220) |
| Marka verisi | `brand/<brand_id>/…` | ~~tek marka kökü~~ |
| CLI | `just <recipe>` | ~~`pnpm …`~~, ~~`suite …`~~ |
| Kimlik | uuidv7, ön ekli (`run_`, `job_`) | ~~ULID~~ |

**Ad değil, adres.** Bağlamsız bir agent yanlış varyantı arar ve bulamayınca işin
yapılmadığını sanır; `citations` kapısı bu yüzden yanlış varyantı **hata** sayıyor.

### §3.10 Dokuz fiil ve yan etki sınıfları {#section-3-10}
RESOLVE · SELECT · COMPOSE · GENERATE · RENDER · VALIDATE · PROPOSE · PUBLISH · INGEST.
Yetenek adı ≠ fiil adı.

| Fiil | Yan etki sınıfı | Metered | Tek yapabildiği |
|---|---|---|---|
| `RESOLVE` | read-registry | — | tarif + registry → adım DAG'ı |
| `SELECT` | read-corpus | — | retrieval yüklemiyle kayıt seçer |
| `COMPOSE` | **pure** | — | belge modeli üretir; **hiç I/O yok** |
| `GENERATE` | network-model | ✓ | **model çağıran tek fiil** |
| `RENDER` | browser | ✓ | **Chromium/FFmpeg'e dokunan tek fiil** |
| `VALIDATE` | read-corpus | — | QA, lint, spec, uyum kapıları |
| `PROPOSE` | write-tree | — | **çalışma ağacına yazan tek fiil** |
| `PUBLISH` | network-channel | ✓ | **kanal API'si çağıran tek fiil** |
| `INGEST` | network-source | ✓ | **dış kaynak çeken tek fiil** |

Sözleşme `packages/kernel/verbs.json`'da **sabitlenmiştir**; sapma iki yönde de hata
(R-02). Gövdeler sözleşmeyi **değiştiremez**: `resolveVerb` her çağrıda `effectClass` ve
`metered` uyumunu doğrular. Gövdenin `metered: false` demesi bütçe kapısını atlatabilseydi,
çalıştırma öncesi maliyet tahmini yalan olurdu.

**Bir fiilin var olması, çalıştırılabilir olduğu anlamına gelmez.** Zincirin yedi halkası
var — modül · gövde · fiil haritası · **hat adımı** · kapı · **şekil** · **çözücü** — ve
altısı sırayla kaçtı (D-216 · D-222 · D-224 · D-227 · D-228). `fiil-haritasi` kapısı iki
soruyu birden sorar: gövde üretim haritasında bağlı mı, ve o fiili çağıran en az bir hat
var mı.

## §4 Marka sistemi {#section-4}

### §4.1 Token mimarisi {#section-4-1}

**Üç kademe, tek yön.** Kaynak `brand/<brand_id>/tokens/*.tokens.json` (DTCG şekilli,
kendi Zod şemamızla doğrulanır); derleyici `packages/registry/src/tokens.ts`.

| Kademe | Ne | Kime referans verebilir |
|---|---|---|
| `ramp.*` | ham OKLCH rampalar | hiç kimseye — yaprak değerler |
| `role.*` | anlamsal roller (`role.bg`, `role.text-muted`) | yalnız `ramp.*` |
| `comp.*` | bileşen token'ları (`comp.status-bar-bg`) | yalnız `role.*` |

Yön **zorlanır**: `comp` → `ramp` atlaması derleme hatasıdır (`tier_violation`).
Atlamaya izin verseydik yüzey değiştirmek bileşenleri tek tek gezmek olurdu ve
"iki yüzey" vaadi ilk düzenlemede çökerdi.

**CSS `var()` basar, çözülmüş değeri DEĞİL** (D-160). İlk sürüm `comp` token'larını
düz değere derliyordu (`--comp-status-bar-bg: oklch(0.21 …)`); o hâlde yüzey rolü
değiştiğinde bileşen ESKİ rengi taşımaya devam ediyordu — iki yüzey yapısal olarak
imkânsızdı. Artık `--comp-status-bar-bg: var(--role-surface)`.

**İki yüzey, tema anahtarı YOK** (§12.4): `console.tokens.json` kalıcı koyu,
`studio.surface.tokens.json` kalıcı açık. Stüdyo **yalnız 2. kademe rolleri** yeniden
tanımlar; rampalar ve bileşen token'ları aynıdır. Yüzey rengi değiştirir, yapıyı değil —
ikincisi iki tasarım sistemi demektir ve biri bakımsız kalır.

**Türetilenler `brand/<brand_id>/derived-tokens/` altında ve ÜRETİLMİŞTİR** (R-65):
`tokens.css` (kabuk), `tailwind-theme.ts`, `brand-facts.json` (prompt'a enjeksiyon),
`frame.md` (hareket katmanının kamera bağlamı, §7.4). Elle düzenleme üreteç koşunca
kaybolur; `docs-drift` kapısı sürüklenmeyi yakalar.

**Token'lar çalışma anında servis edilir** (`/api/tokens.css`), derlemeye gömülmez:
statik import tek markayı ikiliye kaynak yapardı ve D-39'un çok markalılık ekseni
çökerdi.

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

**Ayrı bir hafıza altsistemi YOK.** "Hafıza kartı" `corpus/`ta bir kayıt, "agent'ların
bildiği her şey" o dizin üzerinde filtreli bir tablodur; ikinci bir depo iki gerçek
yaratır ve biri sessizce bayatlar.

**Kayıt başına bir dosya:** `corpus/<entity_type>/<slug>.md` — YAML frontmatter + markdown
gövde. Dosya olmasının üç sonucu var: satır bazlı `git diff`, `git log --follow` ile olgu
geçmişi, ve kurtarmanın `git clone` + `cat` olması (§16).

**Zarf sistemin, gövde kullanıcının.** Frontmatter alanları (`brand_id`, `era_id`,
`status`, `zone`, geçerlilik tarihleri, `x_signature`…) **sabit sistem alanlarıdır**,
kernel okur (§3.2 · D-41); kullanıcının tanımladığı her şey `attributes` altında ve
kernel'e kapalı — tek yasal yol `SELECT` → `unsealAttributes` → `COMPOSE`'dur.

**Yazma tek darboğazdan geçer** (§5.4 · R-14): agent `corpus.propose()` ile `status:
draft` yazar, draft'lar retrieval'a **görünmez**, onay bir git commit'idir.

**Emeklilik silme değildir** (R-12): `expired_at` + `superseded_by` yazılır, dosya kalır,
`:as_of` geçmişe dönük denetimi bir sorgu parametresine indirir. **KVKK silme talebi AYRI
bir yoldur** — dosya gerçekten silinir, gerekçesi kayda yazılır; ikisini karıştırmak ya
yükümlülüğü ya denetlenebilirliği kaybettirir. **Prospect dizini bu yüzden bir CRM'dir**
(FAZ-6.4): kayıt, geçmiş, kaynak alıntısı, erişim ve silme zaten burada. Gerçek prospect
verisi **fixture'a asla girmez** (§15).

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

Bir tarif, prompt'a hangi bilginin **hangi bölümde ve hangi bütçeyle** gireceğini söyler.
Bütçe bölüm başınadır, toplam değil: tek bir havuz olsaydı uzun bir persona kaydı
konumlandırma bölümünü tamamen dışarı iter ve bunu kimse görmezdi.

**Her dahil edilen kayıt bir GEREKÇE taşır.** `reason` alanı süs değil: bağlam
manifesti (§13) altı ay sonra "bu deck neden böyle dedi" sorusunun tek cevabıdır ve
"seçildi" diye bir gerekçe o soruyu cevaplamaz.

**Seçilmeyen de kaydedilir.** Bütçeye sığmayan kayıt, sığmadığı gerekçesiyle manifest'e
girer — yönlendiricinin kaybedenleri kaydetmesiyle (§8.2) aynı ilke: görünmeyen bir
eleme, denetlenemeyen bir elemedir.

**Elle daraltma bir KARARDIR.** Operatör Context Preview'da (§12.9) bir kartı kapatırsa
bu manifest'e yazılır; yazılmazsa aynı girdiyle iki farklı çıktı üretilir ve farkın
sebebi hiçbir yerde durmaz — replay (§13) o an yalan söyler.

`untrusted_input` bölümü AYRIDIR ve asla talimat olarak sunulmaz (§14, R-50).
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

İki kayıt aynı şeyi farklı söylüyorsa sistem **ikisini de saklar ve çelişkiyi işaretler** —
birini seçmez. Otomatik seçim, seçimin yapıldığını gizler.

**Tespit iki aşamalı:** FTS5 yakın-kopya taraması aday çiftleri bulur (ucuz, deterministik),
sonra bir sınıflandırıcı çifti üç kovadan birine koyar: **aynı şey** (yineleme, biri
emekliye ayrılır) · **çelişki** (tahkim kuyruğuna) · **ilgisiz** (yanlış pozitif).

Tahkimi **insan** yapar ve kararı bir kayıt olur: kazanan `active` kalır, kaybeden
`superseded_by` ile bağlanır ve **silinmez** (10. yasa). Altı ay sonra "neden bu rakam
değişti" sorusunun cevabı zincirin kendisidir.

**Sessiz çelişki en pahalı hâlidir:** iki farklı deck'te iki farklı sayı, ikisi de "onaylı"
görünür ve ilk fark ediliş yeri prospect'in sorusudur.

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

**Türkçe metin görsel modeline çizdirilmez** (3. yasa, R-20). Her prompt "no text, no
lettering" taşır ve metin gerçek fontla kompozit edilir. Sebep tercih değil olgu: Ideogram
kendi dokümanında aksanlı Latin'i "hiç render edemeyebileceğini" kabul ediyor ve `İ`/`ı`
çifti en sık bozulan yer.

**İki şerit, tek tipografi** (5. yasa): şeritler kelime ve resim satın alır, tasarım değil.
Bedava şerit ucuz bir modelden görsel alır; kompozisyon, tipografi, güvenli alan ve QA
**aynı** hattan geçer.

**Marka LoRA** (~$3, fal krea-2-trainer): rapordaki en yüksek kaldıraçlı harcama. Bir LoRA
marka görsel dilini modele öğretir ve her çağrıda prompt'a onlarca kelime yazmaktan ucuzdur.
**Ama zorunlu değil:** LoRA'sız hat da çalışır ve LoRA'nın eskimesi bir bakım borcudur —
marka dili değişince yeniden eğitilir.

Model ID'si **pipeline'da yer almaz** (6. yasa): yetenek istenir, yönlendirici seçer.

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

**Dört seslendirme şeridi, dördü de UI'dan seçilebilir** (D-18). Şerit bir kalite
tercihi değil, bir LİSANS ve MAHREMİYET tercihidir — bu yüzden seçim çalıştırma anında
insanın, varsayılan bir modelin değil.

| Şerit | Ne | Sınır |
|---|---|---|
| kendi kaydın | dosya girdisi — **fiil değil** | en iyi sonuç, en çok emek |
| Chatterbox Multilingual V3 | yerel klon, MIT, 500M | 6 GB VRAM'de koşar; kalite bulut kadar değil |
| Gemini TTS | bedava şerit | kota sağlayıcıdan; ölçülmüyorsa `null` (D-175) |
| ElevenLabs | premium şerit | **bedava katmanının TİCARİ lisansı YOK** (§17) |

Kendi kaydın bir FİİL DEĞİLDİR: dosya girdisi olarak gelir. Fiil saymak, "ses üret"
adımının bazen ağ çağırıp bazen çağırmaması demekti ve maliyet tahmini yalan olurdu
(§3.10).

**Altyazıda insan transkript kapısı ATLANAMAZ.** Türkçe WER %10–25: on kelimede bir
hata, bir markanın kendi videosunda kabul edilemez. Zincir: Groq whisper-large-v3 ya da
yerel whisper.cpp → kelime bazlı zamanlama → `.ass` karaoke altyazı. Otomatik kabul
YOKTUR; operatör transkripti diff olarak görür ve onaylar (FAZ-5.5).

**Reddedilenler ve sebepleri** (§17): XTTS-v2 (CPML, şirket dağıldı) · F5-TTS
ağırlıkları (CC BY-NC) · ElevenLabs bedava katmanı ticari kullanımda. Lisans bir
dipnot değil: ticari lisansı olmayan bir sesle üretilmiş bir prospect videosu,
geri alınamaz bir yayındır.
### §7.6 Deck ve döküman {#section-7-6}

**Aynı Chromium, `page.pdf()`** (R-30 · D-24). Deck ve döküman ayrı bir motor
kullanmaz: ikinci bir CSS alt kümesi, ikinci bir Türkçe tipografi hata modudur. Statik
görselle deck arasındaki tek fark çağrılan API — `screenshot()` yerine `pdf()`.

**Deck IR bir KAYNAK, çıktı değil** (§4c). `deck.ir.json` git'te yaşar, PDF build
çıktısıdır; benzer bir deck geldiğinde LLM'i yeniden çalıştırmak yerine IR kopyalanıp
düzenlenir. **Kapalı `LayoutEnum`:** serbest düzen her deck'te farklı bir tipografi
demektir ve marka tutarlılığı kişisel hafızaya geri döner. Taşma **böler, küçültmez**
(§7.1 · R-23); en-boy ekseninde de aynı kural (FAZ-5.9).

**Düzleştirme KANALA aittir, PDF'e değil.**

| Çıktı | Metin katmanı | Neden |
|---|---|---|
| prospect deck'i (6.1) | **seçilebilir** | okunan, kopyalanan, alıntılanan bir belge; metni kilitlemek okuyucuya zarar verir |
| LinkedIn dökümanı (6.3) | **düzleştirilmiş** | LinkedIn'in kendi görüntüleyicisi metin katmanlı PDF'lerde satır kırılmalarını bozuyor |

"PDF hep düzleştirilir" deseydik deck'i gereksiz yere sakat bırakırdık: düzleştirme bir
maliyettir ve yalnız onu gerektiren kanalda ödenir. **İkinci araç da gerektirmedi**
(D-211): sayfalar aynı Chromium'da JPEG'e çevrilip yine aynı Chromium'da tek PDF'e
basılıyor; ghostscript/qpdf ikinci bir renk profili ve font gömme yolu getirirdi.
Ölçüldü: deck'te `pdftotext` metni tam veriyor, dökümanda boş. **Ödenen bedel beyan
edilir** — ekran okuyucu düzleşmiş sayfada hiçbir şey bulamaz, o yüzden her görüntü sayfa
metninden türetilen bir `alt` taşır.

**Grafik ve diyagram: geometri SVG, metin HTML** (D-209, D-210). Hazır kütüphaneler
sunucuda tuval bulamayınca metin genişliğini **kendi tahmin eder** — ECharts SSR
Türkçe'de %83,4'e varan sapma veriyordu ve o tahminle "sığmayanı gizle" kararı alınıyor,
yani sığan etiket gizleniyor (**Satori'yi reddeden gerekçe**, D-24). Bizde SVG yalnız
geometri taşır, her etiketi Chromium yerleştirir; grafik PDF'te **vektör** kalır ve rengi
yalnız rol token'ından gelir. `metin-olcen-grafik-kutuphanesi` darboğazı dönüşü engeller.

**Veri bağlama ANLIK GÖRÜNTÜLENİR** (FAZ-6.3): Mart'ta paylaşılan bir döküman Haziran'da
hâlâ Mart rakamını gösterir; canlı bağlanan bir grafik geçmişte paylaşılmış bir belgeyi
sessizce değiştirir ve o belge artık kimsenin onaylamadığı bir şeydir. IR bu yüzden
corpus'a referans değil **değer** taşır.
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

Bir sağlayıcı, YAML bir tanımlayıcıdır: kimlik · yetenek etiketleri · maliyet formülü ·
kısıt tipleri · uç nokta şekli · `enabled`. **Kod değil veri** — yeni sağlayıcı eklemek kod
yazmayı gerektirmiyor; gerektirseydi yönlendirici (§8.2) bir kod tabanına bakardı, bir
tabloya değil.

**Secret'lar tanımlayıcıda YOK.** `auth_env:` yalnız değişkenin ADINI taşır ve değer
`sops exec-env` üzerinden ortama iner (R-51). Tanımlayıcı git'te durur; anahtar durmaz.
`secret-rotasyon` kapısı bu satırları da okuyor — bir anahtar hangi dosya biçiminde
tanımlandığına göre korunmuyorsa, korunmuyor demektir (D-227 ailesi).

**Maliyet formülü QuickJS'te, 10ms deadline ile** çalışır: sağlayıcı fiyatlaması keyfi bir
ifade olabilir ama keyfi kod çalıştırmak bir güvenlik deliğidir. `estimate()` **senkron ve
ağsız** (R-42) — dönüş tipi `async`'i derleme hatası yapar, çünkü çalıştırma öncesi maliyet
ancak ağ gerektirmiyorsa dürüsttür.

**Fiyat anlık görüntüleri değişmez ve commit'lidir** (`registry/providers/_pricing/`).
Sağlayıcı fiyatı değiştirdiğinde eski çalıştırmanın maliyeti yeniden hesaplanmaz — geçmiş,
bugünün fiyatıyla anlatılmaz.

### §8.2 Yetenek yönlendiricisi {#section-8-2}

Pipeline adımı **yetenek + kısıt** ister, model adı değil:
`video.text2video · aspect 9:16 · ≤6sn · ≤0.15 USD · prefer: cost`

Beş aşama, ~300 satır, tablo tabanlı:

1. **Filtrele** — yetenek etiketi + tipli kısıt + `enabled` + dönemin izin listesi
2. **Fiyatla** — maliyet formülü **kapalı aritmetik dilbilgisinde** (D-101: döngü
   söylenemediği için deadline gerekmiyor); 
   bütçe kısıtı **USD mikro** üzerinden, TRY yalnız görüntüde (D-36)
3. **Skorla** — kalite / maliyet / gecikme, adımın `prefer:` alanına göre ağırlıklı
4. **Yedek zinciri** — hata veya zaman aşımında sıralı
5. **Kaydet** — kazananı **ve her kaybedeni red gerekçesiyle** run manifest'ine

Beşinci aşama yönlendirmeyi sihirden yönetişime çevirir: altı ay sonra "neden bu model
seçildi" sorusunun cevabı manifest'te yazılı.

Bugün hiçbir açık kaynak sistem "Türkçe seslendirmeli 9:16 video, 30sn altı, 5 TL altı"
sorusunu cevaplamıyor. OpenRouter'ın `max_price`'ı milyon-token başına ve yalnız metin;
LiteLLM etiketleri anlamsız string. Bu boşluk gerçek farklılaştırıcı ve bir yıl sonra
okunabilir kalacak kadar küçük.
### §8.3 Maliyet ve bütçe {#section-8-3}

Para `{ micros: bigint, currency: "USD" }`. Float yok, kuruş yok: görsel başına $0.0035
minor-unit'te hassasiyet kaybeder ve float'ta zaten toplanamaz.

**Çalıştırma öncesi tahmin bir aralıktır, tek sayı değil** — güven noktasıyla: yeşil
(birim başına kesin medya fiyatı), amber (aralıklı token tahmini), kırmızı (saniye
başına GPU, fiyatlanamaz). Duvar saati de gösterilir; 6GB'lık bir laptopta **zaman da
bir maliyettir** ve para modeli onu görünür kılmalı.

Tavanlar UI'dan ayarlanır (D-17): aylık · çalıştırma başına · pipeline başına.
Tahminin üst sınırı tavanı aşıyorsa Başlat **kilitlenir** ve gerekçe Türkçe gösterilir.

Gerçekleşen maliyet tahminden **kopyalanmaz**; sağlayıcı bildirmiyorsa `chargeStatus`
`unreported` olur. `possibly-charged` durumu da vardır — bilmediğimizi bilmek,
bilmediğimizi tahmin etmekten iyidir.
### §8.4 Adaptör sözleşmesi {#section-8-4}

Her sağlayıcı tam olarak şunu uygular ve başka hiçbir şey dışa açmaz:

```
capabilities()  → yetenek tanımlayıcıları
validate(input) → ValidatedInput | AppError
estimate(vi)    → CostEstimate     ← SENKRON ve saf; dönüş tipi `async`'i derleme hatası yapar
start(vi, ctx)  → JobHandle        ← idempotency anahtarı zorunlu
status(handle)  → JobStatus
cancel(handle)
actualCost(terminal) → Money | null
```

`estimate()`'in senkron olması bir stil tercihi değil: çalıştırma öncesi maliyet ancak
ağ gerektirmiyorsa dürüsttür. Ağ çağrısı gerektiren bir tahmin, tahmin değil ön-çağrıdır.

**Sağlayıcı SDK tipi, yanıt nesnesi veya string enum'u adaptör sınırını geçemez.** Bu
kategoride ölüm oranı yüksek: Proxycurl kapandı, Crunchbase Basic API kaldırıldı, Google
CSE sunuluyor. Sınırı geçen bir tip, sağlayıcı öldüğünde şablona kadar sızan bir
refactor demektir.

`ArtifactRef`'te **URL alanı yoktur, tasarım gereği**: sağlayıcı çıktı URL'leri süresi
dolar (Google üretilen videoyu 2 günde siliyor). Byte'lar aynı istek döngüsünde indirilir.
### §8.5 Yeniden deneme, idempotency, rate limit {#section-8-5}

**Yeniden denenir:** 429, 5xx, ağ hatası. **Asla denenmez:** 4xx doğrulama, içerik
politikası reddi, yetersiz bakiye. Üstel geri çekilme + tam jitter.

**Devre kesici 5 ardışık hatada açılır**, `(providerId, capability)` anahtarlı. 3
seçilmedi çünkü 3-denemelik retry sınırıyla çakışır ve tek mantıksal çağrıda kesiciyi
attırır.

**Idempotency anahtarı** deterministiktir: girdi + model + parametreler + seed + bilgi
ağacı commit'i. Çökme sonrası yeniden başlatma çift ücret veya çift yayın üretmez.

**Yayın asla körlemesine tekrar edilmez** — önce okuma ile mutabakat. Meta yinelenen
gönderimde *mevcut* ID'yi döndürür; yerel defterle karşılaştırılmazsa 3 varlık
üretildiği hâlde 20 üretildiği sanılır.

Yerel makine NAT arkasında ve public ingress yok — **webhook çoğunlukla kullanılamaz**.
Uzun işler jitter'lı polling ile izlenir; iş tutamağı `derived/runs/` altında kalıcıdır,
böylece laptop kapanıp açılsa da iş kaldığı yerden sürer.
### §8.6 Hata taksonomisi {#section-8-6}

Kapalı ayrık birleşim: `config` · `validation` · `not_found` · `conflict` ·
`provider_auth` · `provider_rate_limit` · `provider_quota` · `provider_unavailable` ·
`provider_bad_response` · `content_rejected` · `budget_exceeded` · `timeout` ·
`cancelled` · `render_failed` · `subprocess_failed` · `io` · `internal`.

Her hata **`costIncurred` taşır**: 3 görsel ürettikten sonra gelen bir 429 yine de para
harcadı. Bunu taşımayan bir hata modeli, maliyet defterini sessizce eksik bırakır.

`userMessageKey` İngilizce bir enum anahtarıdır; Türkçe karşılık yalnız UI kataloğunda.
Türkçe hiçbir zaman bir tanımlayıcıya, log anahtarına veya kernel'in fırlattığı bir
hataya girmez (D-37).

`classify()` toplam fonksiyondur — yeni bir `ErrorKind` eklenip sınıflandırma
güncellenmezse `tsc` kırmızıya döner. Hata sınıflandırması unutulabilecek bir şey olmamalı.
### §8.7 Sağlayıcı kataloğu {#section-8-7}

**ÜRETİLMİŞ.** `just docs` → `docs/referans/saglayicilar.md`, kaynak
`registry/providers/*.yaml`. Elle yazılmaz; `docs-drift` kapısı sapmayı yakalar (R-65).

Araştırma külliyatı (1000+ araç, fiyat, lisans, verdict) `docs/research/` altında ve
`ctx_search` ile sorgulanır — baştan sona okunmaz.

**Fiyat anlık görüntüleri değişmezdir:** `registry/providers/_pricing/<sağlayıcı>-<tarih>.json`,
commit'li. Bir çalıştırmanın maliyeti hangi fiyat listesine göre hesaplandı sorusu altı
ay sonra da cevaplanabilmeli. UI, anlık görüntü 60 günden eskiyse uyarı rozeti gösterir —
yoksa "çalıştırma öncesi maliyet" vaadi sessizce kurguya döner.

## §9 Kanallar {#section-9}

### §9.1 Platform spec tablosu {#section-9-1}

Ölçüler **kod olarak** tutulur (`packages/specs/placements.ts`), her satır `sourceUrl` +
`verifiedAt` taşır. Üç aylık bir iş kaynakları yeniden çeker ve diff'ler.

**Neden bu kadar titiz:** platform ölçüleri sessizce değişiyor. Meta feed'i 1:1'den
4:5'e taşıdı ve şimdi Instagram feed videosunda bile 9:16 öneriyor. Tolerans da
platforma göre farklı — Instagram ±%1, Facebook ±%3, LinkedIn ±%5. "Yeterince yakın"
bir yeniden boyutlandırma Facebook'tan geçip Instagram'dan **reddedilir**.

Güvenli alanlar yapısaldır, sonradan doğrulanan bir şey değil: Reels'te üst %14, alt %35,
yanlar %6 — 1080×1920'lik bir masterda 950×979'luk kullanılabilir bant kalır. İçerik
kutusu bu koordinatlarda tanımlanır ki başlık UI chrome'un altına düşemesin.
### §9.2 Meta adaptörü {#section-9-2}

IG feed / carousel / Reels / Stories + Threads. **App Review gerekmiyor** — Meta'nın
kendi dokümantasyonu, uygulama yalnız sahip olunan bir işletmeye hizmet ediyorsa
incelemeyi "gerekli değil" sayıyor. Bu, ekosistemdeki en yaygın yanlış inanış ve
Instagram'ı bizim için self-servis yapan şey.

**Token 60 günde ölür ve sessizce ölür.** Yenileme işi yayın hattından **önce** kurulur
ve başarısızlığı bloklayıcıdır, uyarı değil.

Her yayından önce `content_publishing_limit` sorgulanır (24 saatte sınırlı gönderi).
Token-bucket rate limiter uploader'dan **önce** gelir: okuma 1 puan, yazma 3 puan.
### §9.3 LinkedIn adaptörü {#section-9-3}

`w_member_social` ile kişisel profil: metin, görsel **ve döküman** postu.

Döküman postu (PDF carousel) LinkedIn'in en yüksek etkileşimli formatı ve **hiçbir
aggregator bunu vermiyor** (Ayrshare, Buffer, Postiz hepsi soyutlayıp kaybediyor) —
kendi adaptörümüzün asıl gerekçesi bu.

**İki medya tipi, iki ayrı limit — karıştırmak pahalı:** GÖRSEL 5MB (Meta'nın
30MB'ının altı kat altında), DÖKÜMAN **300 sayfa · 100MB**. Döküman sınırını 5MB
sanmak, 40MB'lık meşru bir deck'i reddeder ve hata "LinkedIn kabul etmedi" gibi
görünür. Meta'ya ayarlanmış tek bir export hattı da LinkedIn'in reddedeceği görselleri
sessizce üretir. Editoryal tavanımız **10 sayfa**: platform sınırı değil, karar.

Sürüm sabiti pinlenir, üç ayda bir kontrol edilir; LinkedIn sürümleri takvimle emekli.
### §9.4 Onay yüzeyleri {#section-9-4}

Üçü de aynı onay kuyruğuna bakar:

- **Yerel PC** — tam UI, klavye odaklı, zengin QA paneli
- **Tailscale** — telefondan tam UI, özel ağ üzerinden; public internete açılmaz
- **Telegram botu** — yalnız onay/red/gerekçe, inline klavye

Telegram bacağı ~20 satır ve **çalışan bir sistemle masadan uzakken tıkanan bir sistem
arasındaki fark** o kadar. Red gerekçesi her üç yüzeyde de kalıcıdır ve sonraki
çalıştırmaya negatif kısıt olarak enjekte edilir.

## §10 Pipeline kataloğu {#section-10}

Dokuz iş. Adım şeması, insan kapıları, çıktılar ve maliyet **üretilmiş** kısımda:
`docs/referans/pipelinelar.md`, kaynak `registry/pipelines/*.yaml`.

| Pipeline | Kurulduğu faz |
|---|---|
| `instagram-post`, `instagram-carousel` | FAZ-3.14 |
| `linkedin-post` | FAZ-3.15 |
| `demo-video` | FAZ-5.7 |
| `reels` | FAZ-5.8 |
| `explainer-video` | FAZ-5.9 |
| `linkedin-document` | FAZ-6.3 |
| `prospect-deck` | FAZ-6.9 |
| `ad-creative-set` | FAZ-8.1 |

**Ortak insan kapıları** — hepsinde aynı sırada:

`G0` çalıştırma öncesi (şerit + maliyet aralığı + duvar saati) · `G1` yapı/açı (en ucuz
düzeltme noktası — görsel üretilmeden önce) · `G2` Türkçe metin (diacritics kapısı
geçtikten sonra; doğrulayıcı imlayı yakalar, tonu yalnız insan) · `G3` görsel
(contact sheet + QA skorkartı) · `G4` yayın.

Video pipeline'larında ek bir `G2b` transkript kapısı vardır ve **atlanamaz**: Türkçe
ASR hata oranı %10–25, makine altyazısını otomatik yayınlamak seçenek değil.

**En pahalı kapı `G1`'dir.** Yanlış anlatıyı görsel üretildikten sonra yakalamak, önce
yakalamaktan on kat pahalı.

## §11 Kalite ve uyum {#section-11}

### §11.1 Marka QA {#section-11-1}

Bedava katman her varlıkta, her zaman: culori ΔE2000 (marka token'larına karşı) ·
node-vibrant palet payı · transformers.js CLIP brief uyumu · LAION estetik skoru ·
Tesseract kelime kutularıyla güvenli alan ve metin kaplama. Hepsi yerel, süreç içi.

Premium katman yalnız prospect'e giden ve ücretli medyaya gidecek varlıklarda: bir VLM
rubrik yargıcı (~$0.006/görsel), marka kılavuzu önbellekli prefix'te.

**Sonuç rozet değil, tolerans okumasıdır.** "Marka uyumu ✓" hiçbir şey söylemez;
**ΔE 2.4 / limit 5.0** kenara ne kadar yakın olunduğunu söyler. Aynı mantık her yerde:
maliyet bir yetenek grafiği (eksen 0 → bütçe tavanı, tahmin bandı, gerçek dolgu, tavan
etiketli spec-limit), ETA bir p20–p80 bandı, kota bir doluluk göstergesi.

**QA kapısı aşırı-uyum riski taşır:** periyodik olarak neyin *reddedildiğine* bakılmalı,
yalnız neyin geçtiğine değil. Aksi hâlde sistem güvenli, birbirine benzer, düşük
kontrastlı kreatifi seçmeye başlar ve kimse fark etmez.
### §11.2 Deterministik lexicon linter {#section-11-2}

**Modele "bu marka uygun mu" diye sorulmaz.** Sorulan model neredeyse her şeye evet der.
Liste bakar: yasak terim (`registry/lexicon/tr.lexicon.yaml`) · token dışı hex ·
`claim_source`'suz sayısal iddia · eksik alt-text · locale-naif casing · prospect tüzel
adında büyük harf hatası · Meta kişisel-özellik kuralını tetikleyen ikinci tekil yapılar
(`KOBİ sahibi misiniz?` → `KOBİ'ler için…`) · nitelenmemiş üstünlük iddiaları.

Meta'nın kişisel-özellik kuralı B2B lead-gen metninde **en sık sessiz red sebebi** ve
kolayca lint edilebilir. Reddedilen reklam sebebini söylemiyor; linter söylüyor.

Gözetimsiz zamanlamayı güvenli kılan bileşen budur ve satın alınamaz — markanın kendi
sözlüğünden doğar.
### §11.3 Hukuki kapılar {#section-11-3}

**Reklam Yönetmeliği Md. 27/12** (1 Ağu 2026'dan yürürlükte): onay ima eden yapay insan
üretilemez. `containsSyntheticPerson=false` iddiası olmayan varlık onaylanamaz. Sentetik
müşteri referansı, klonlanmış müşteri sesi, avatar testimonial — hepsi yasak. Adı geçen
bir prospect'e giden deck'te AI ile üretilmiş bir "müşteri", tam olarak yasaklanan desen.

**EU AI Act Md. 50** (2 Ağu 2026'dan uygulanabilir): AB kitlesine giden üretilmiş
içerikte ifşa katmanı. Kayda değer istisna: yeniden boyutlandırma, kırpma, renk düzeltme
ve olayı değiştirmeyen arka plan düzenlemeleri ifşa tetiklemiyor — reframe/retouch
hattımız kapsam dışı.

**KVKK:** prospect verisi için amaç-bazlı hukuki dayanak ve saklama tarihi zorunlu.
Aydınlatma ve açık rıza metinleri **LLM'e yazdırılmaz** — 2026/347 kararı geri
dönüştürülmüş şablonları açıkça cezalandırıyor; hukukçuya bir kez yazdırılır (V-10).

Prospect dizini dosya sisteminden **tek komutla silinir**, `cat` ile okunur: silme ve
erişim talebi birer satır. Hiçbir CRM'in veremeyeceği avantaj.
### §11.4 Kaynaksız iddia yasağı {#section-11-4}

Sayısal iddia içeren hiçbir metin `claim_source` olmadan yayınlanamaz. Kaynak bir
`proof_asset` kaydına işaret eder; onun da `era_of_origin` ve `transfer_confidence`
alanları vardır.

Kural somut bir mirasa karşı yazıldı: eski sitede "1.247 İlan", "892 Satıcı",
"2.456 Eşleşme", "1.234.567 ton CO2" gibi **desenli yer tutucular** duruyor. Hiçbiri
gerçek değil. Yeni kreatife taşınmaları, sistemin ilk gününde uydurma sayı yayınlaması
demek olurdu.

Ürün ekran görüntüleri de bu kapsamda: adı geçen bir prospect'e giden deck'te üretilmiş
bir dashboard **estetik tercih değil, olgusal iddiadır**. Gerçek Playwright çekimi zorunlu.

## §12 Komuta merkezi tasarım sistemi {#section-12}

### §12.1 Renk {#section-12-1}

**Tez: komuta merkezi bir izleme kabinidir.** Baskı ve fotoğrafta renk yargısı nötr gri
çevrede yapılır (ISO 3664) çünkü renkli bir çevre yargılanan renge yalan söyletir. Sistem
çok markalı: bugün Upcytech, yarın dima, öbür gün bilinmeyen bir marka. Aracın kendi
rengi işin rengiyle kavga ederse hiçbir marka dürüst görünmez.

Bu yüzden **kabuk marka-nötr enstrüman grisidir; ekrandaki tek renkli şey iştir.**

İki renk bağlamı, `data-surface` üzerinde: `console` kalıcı koyu, `studio` kalıcı açık.
**Tema anahtarı yok** — `prefers-color-scheme` yapısal olarak yok sayılır. Toggle token
matrisini ikiye katlar ve ikinci tema asla bakımlanmaz.

Üç kademe token: ham OKLCH rampalar (bileşen dokunmaz) → anlamsal roller (yüzey bağlamına
göre) → bileşen token'ları (yalnız 2. kademeye referans).

**Chroma alana göre sınırlı** (ISA-101 yüksek performanslı HMI): %25'ten büyük dolgu
C ≤ 0.02 · kenarlık ≤ 0.04 · metin ≤ 0.06 · yalnız %4'ten küçük sinyal alanları ≤ 0.16.
**Renk anormallik demektir** — her yerde renk varsa hiçbir yerde uyarı yoktur.

Gölge yok: yükseklik arka plan basamağı + pah çizgisiyle. Kontrast CI'da **hesaplanır**,
göze bakılmaz — OKLCH L, WCAG luminance değildir.
### §12.2 Tipografi {#section-12-2}

**Ölçülen her şey mono ve tabular.** Maliyet, ΔE, süre, boyut, token, kota, yüzde —
hepsi `tabular-nums slashed-zero`, birim kardeş `<span>`'de 0.85em. Prose ve etiketler
grotesk. Tek kural enstrüman metaforunu taşır ve tabloda göz taramasını hızlandırır.

Dokuz boyut, 11px mikrodan 36px mono okumaya. Ağırlık 400/450/500/550/650 — **konsolda
700 yasak**. Sayı biçimi `Intl.NumberFormat('tr-TR')`.

**Türkçe kısıtı yapısaldır.** Her etiket İngilizcesinden %20–30 uzun. Hiçbir etiket,
düğme, sekme veya tablo başlığı sabit genişlik alamaz; düğme `min-inline-size: 96px`;
tablo başlığı 40px (iki satır). CI'da **+%30 sahte-yerelleştirme** turu zorunlu.

İçerik sığmıyorsa **tip küçültülmez, satır gevşer**.
### §12.3 Boşluk ve yoğunluk {#section-12-3}

**Temel birim 4px.** Konsolda yalnız 1/2/3/4/6/8 adımları (4·8·12·16·24·32px) kullanılır;
5 ve 7 yoktur. Kapalı bir ölçek, "biraz daha boşluk" kararını her seferinde yeniden
vermeyi imkânsız kılar — ve o karar her seferinde farklı verilirse hizalama diye bir şey
kalmaz.

Satır yükseklikleri 28/32/40px, **varsayılan 28**. Bu bir tablo aracıdır: bir ekranda
kaç satır göründüğü, kaç tıklama gerektiğini belirler.

**İçerik sığmıyorsa tip küçültülmez, satır gevşer.** Küçültme Türkçe'de iki kat
cezalıdır: metin zaten %20–30 uzun ve `ğ ü ş i` çıkıntıları küçük punto da okunaksızdır.

**Yarıçap 2px.** `--radius-full` yalnız 8px durum noktası için — yuvarlak köşe bir
enstrümanda süs değil, dokunulabilirlik sinyalidir ve her yerde kullanılırsa sinyal olmaz.

### §12.4 Kabuk ↔ yüzey modeli {#section-12-4}

İki yüzey bağlamı, `data-surface` özniteliğinde: **`console` kalıcı koyu** (veri tarama,
karar verme), **`studio` kalıcı açık** (görsel yargılama). Aralarında geçiş bir tema
anahtarı DEĞİL, bir **rota** değişimidir — stüdyoya girmek bir yere gitmektir.

**Stüdyo levhası her zaman koyu çerçeve içindedir**, dört yandan en az 12px koyu boşlukla.
Sebebi §12.1'in aynısı: açık bir levha koyu çevre olmadan yargılanırsa göz çevreye adapte
olur ve levhadaki renk yalan söyler.

**`prefers-color-scheme` yapısal olarak yok sayılır.** İşletim sisteminin tercihine uymak,
kalibre edilmiş bir izleme kabininin duvarını kullanıcının ruh hâline göre boyamaktır.

**Gölge yasak.** Yükseklik iki şeyle ifade edilir: arka plan basamağı (`bg` → `surface`)
ve pah çizgisi (üst kenar `--line-edge`, diğer üçü `--line-hair`). Tek istisna
`[data-elevation="overlay"]`. Gölge koyu yüzeyde ya görünmez ya kirli bir bulanıklıktır;
basamak ve çizgi ikisi de ölçülebilir.

**Modal üç şeyle sınırlı:** komut paleti, geri alınamaz eylem onayı, sağlayıcı kimlik
girişi. Dördüncüsü eklenirse `<dialog>` bir kaçış deliğine döner ve yüzey modeli çöker.
### §12.5 Klavye haritası {#section-12-5}

**⌘K birincil navigasyondur, kısayol değil.** Menü ağacı yok: her pipeline, her ekran ve
her çalıştırma paletten açılır. Sebep pratik — pipeline'lar registry'den gelir ve
kullanıcı çalışma anında yenisini ekler (D-11); elle bakımlanan bir menü ilk yeni
pipeline'da bayatlar.

**Onay kuyruğu tek elle çalışır:** `j`/`k` gezinme · `a` onayla · `e` düzenle ·
`r` reddet (gerekçe ZORUNLU) · `p` sabitle. Kuyruk bir gözden geçirme aracıdır ve fare
her varlıkta eli klavyeden koparır.

**İptal her zaman görünür ve etkin** — menüde değil, devre dışı değil, onay arkasında
değil. Çalışan bir işi durduramamak, para harcayan bir sistemde kabul edilemez.

**Fareye hiç dokunmadan uçtan uca** bir çalıştırma FAZ 4'ün çıkış kriteridir: ⌘K →
pipeline seç → başlat → onayla. Odak halkası bu yüzden kalın ve her zaman görünür
(§12.7'nin beyaz listesindeki altı şeyden biri).
### §12.6 Durum matrisi {#section-12-6}

Yedi durum, ayrık birleşim olarak: `empty` · `loading` · `streaming` · `ready` ·
`stale` · `error` · `success`. Biri unutulursa derlenmez.

**Bayat içerik soldurulmaz.** Tam opaklık, tam etkileşim; bayatlık üst kenarda taralı
çizgi + mono zaman damgası + `Yenile` eylemiyle bildirilir. Solduran arayüzde operatör
"devre dışı" okur, indekse güvenmeyi bırakır ve corpus'u elle tarar — yani türetilmiş
indeksin var olma sebebini iptal eder.

**Hata toast değildir**, içeriğin olacağı yerde durur: bir cümle Türkçe açıklama,
katlanmış `<details>` içinde makine detayı, kopyalanabilir korelasyon id'si, **tek**
birincil kurtarma eylemi. 6 dakikalık render 5. dakikada patlar ve operatör başka
penceredeyse toast kaybolur; geri döndüğünde boş bir yüzey bulur.

**Yükleme 200ms'den önce gösterilmez**, gösterilince en az 400ms durur. Skeleton gerçek
satır yüksekliğinde ve **parıltısız**. Belirsiz spinner yalnız az önce basılan düğmede.

Kullanıcının baktığı yüzey **asla otomatik yenilenmez**. Onaylamaya bir tuş kala satır
yeniden sıralanırsa yanlış kayıt onaylanır — ve burada onay, doğruluk kaynağına yapılan
bir git commit'idir.
### §12.7 Hareket {#section-12-7}

**Beyaz liste, kara liste değil.** Yalnız altı şey animasyonlanır ve hiçbiri 320ms'yi
geçmez: yüzey geçişi · `<dialog>` açılışı · satır vurgusu · durum noktası geçişi ·
ilerleme rayı ilerlemesi · odak halkası. Yedincisi eklenecekse önce bu liste değişir.

**Yasaklar açık:** sayı animasyonu (ölçüm okunurken oynayan rakam yanlış okunur),
liste yeniden sıralama (operatör onaya bir tuş kala satır kayarsa yanlış kayıt onaylanır),
skeleton parıltısı, hover ölçekleme, grafik çizilme animasyonu.

Sebep enstrüman metaforunun kendisi: bir ölçü aleti hareket ederse ölçüm değişmiştir.
Süsleme amaçlı hareket, her seferinde "bir şey mi oldu?" sorusunu sordurur ve gerçekten
bir şey olduğunda o soru artık sorulmaz.

`prefers-reduced-motion: reduce` altında altısı da süreyi 0'a çeker — kaldırılmaz,
**anında** olur; kaybolan bir geçiş, olmayan bir geri bildirimdir.
### §12.8 Erişilebilirlik {#section-12-8}

**Durum rengi tek başına anlam taşımaz.** Her durum göstergesi **glyph + renk + metin**
taşır (alarm yönetimi kuralı). Renk körü bir operatör, soluk bir ekran ya da bir ekran
görüntüsü — üçünde de renk kaybolur, metin kalmalı.

**Kontrast:** normal metin 4.5:1, büyük metin (≥24px ya da ≥18.66px kalın) 3:1. Kreatif
yüzeylerdeki koyu gradyanlarda APCA (Lc ≥60) daha iyi öngörüyor; ikisi birden ölçülür ve
düşük olan kazanır.

**Klavye birincil, fare ikincil.** ⌘K paleti navigasyonun kendisi; her ekran fareye
dokunmadan açılabilir ve onay kuyruğu `j/k/a/e/r/p` ile sürülür. Bir eylem yalnız fareyle
erişilebilirse, o eylem erişilebilir değildir.

**Hareket beyaz listeli ve hiçbiri 320ms'yi geçmiyor** (§12.7); `prefers-reduced-motion`
altında liste tamamen kapanır — azaltılmış hareket bir tercih değil, bir gerekliliktir.

**Odak görünür ve asla kaldırılmaz:** `outline: none` yasak, odak halkası pah çizgisiyle
çakışmayacak şekilde 2px offset alır.

**Ekran okuyucu için tablo:** ölçüm tabloları `<th scope>` taşır ve tolerans okuması
`aria-label` ile sayıyı **birimiyle** okur — "2.4" değil, "ΔE 2.4, limit 5.0".

### §12.9 Ekranlar {#section-12-9}

Ekranlar bir menüde değil, **⌘K paletinde** yaşar (§12.5). Aşağıdaki liste bir navigasyon
yapısı değil, bir **kapsam beyanı**: bunlar yapılacak, fazlası değil.

| # | Ekran | Tek işi |
|---|---|---|
| 1 | Corpus Browser | Filtreli tablo; düzenleme `propose()` açar, **doğrudan yazmaz** (R-14) |
| 2 | Record Detail | Kaynak alıntısı, `git log --follow` zaman çizgisi, **ters indeks**: bu kaydın etkilediği her varlık |
| 3 | Context Preview | Bölüm başına token çubuğu, tam prompt metni, kart başına "neden dahil edildi" |
| 4 | Run Launcher | Şemadan üretilmiş tipli form, şerit seçimi, maliyet **aralığı** + güven noktası |
| 5 | Approval Queue | Klavye odaklı (`j/k/a/e/r/p`); red gerekçesi kalıcı ve sonraki çalıştırmaya negatif kısıt |
| 6 | Placement Preview | Gerçek platform chrome'u, güvenli alan overlay'i |
| 7 | Discovery / Reconciliation | Dört sütun: DEĞİŞMEDİ / DEĞİŞTİ / ÇELİŞTİ / YENİ |
| 8 | Schema Editor | Kaydetmeden önce **tüm corpus'a karşı kuru çalıştırma**; kaç kaydın kırılacağını sayıyla söyler |
| 9 | Cost & Budget | Tahmin vs gerçek, canlı kota sayaçları, fiyat anlık görüntüsü yaşı |
| 10 | Asset Library | FTS5 arama, "premium üretildi ama hiç yayınlanmadı" filtresi, **Reuse** birinci sınıf eylem |
| 11 | Run History | Her manifest bir zaman çizgisi; `rerun` (donmuş plan) ve `replay` (bugünün tanımı) AYRI düğmeler |

**Ortak kurallar:** kart yerine **satır** (yoğunluk tablo lehine) · boş durum bir eylem
daveti, illüstrasyon değil · bayat içerik soldurulmaz, **bildirilir** (§12.6) · her ekran
klavyeyle tam çalışır (§12.5) · ölçülen her sayı mono ve tabular (§12.2).

**`rerun` ile `replay` ayrımı ekranda YAZILI olmak zorunda:** rerun donmuş planı tekrar
koşar (aynı model, aynı seed, aynı bağlam), replay bugünün tanımıyla koşar. İkisini tek
düğmeye toplamak, "geçen ayki deck'i yeniden üret" diyen kullanıcıya sessizce başka bir
şey vermektir — ve fark ancak iki çıktıyı yan yana koyunca görülür.

## §13 Gözlemlenebilirlik {#section-13}

**Langfuse yok, MLflow yok, W&B yok.** Self-host'ları Postgres + ClickHouse demek —
tam da ihmal edilince çürüyen altyapı. Git'teki run manifest'i grep'lenebilir,
diff'lenebilir, sunucusuz ve zaten gereken maliyet denetim izini de veriyor.

**Manifest sözleşmesi** — her çalıştırma şunları taşır: `brand_id` · `era_id` · **bilgi
ağacı commit SHA'sı** · adım başına şerit/model/seed/parametre · tahmini vs gerçek
maliyet · her insan kararı · seçilen sağlayıcı **ve her kaybeden, red gerekçesiyle** ·
enjekte edilen bağlamın manifest'i.

Commit SHA'sı replay'i gerçek yapan alandır: prompt'lar haftalık değişen dosyalardan
derleniyor, o yüzden "aynı girdiyle tekrar çalıştır" ancak aynı ağaçta anlamlı.

**İki ayrı düğme, karıştırılmaz:**
- `rerun` — donmuş planı çalıştırır. Aynı sağlayıcı, aynı parametre, aynı bağlam.
- `replay` — aynı girdileri **bugünün tanımıyla** çalıştırır ve sapmayı gösterir.

UI açıkça yazar: **`rerun` kararı tekrarlar, eseri değil.** Medya uçlarının çoğu
deterministik değil ve seed bile sunmuyor; bu uyuşmazlığı bug sanan kullanıcı diğer
her şeye olan güvenini kaybeder.

**Manifest'siz çıktı bir hatadır** — kapı üretimi reddeder.

## §14 Güvenlik {#section-14}

Tek kullanıcılı bir sistemde gerçek tehdit kararlı bir saldırgan değil; **kendi
agent'ının hata yapması** ve **kazınan bir prospect sayfasından gelen talimat**.

### Prompt injection sınırı

`INGEST` dışarıdan çektiği her metni `derived/ingest/<domain>/` altına indirir ve
bağlama **ayrı, açıkça sınırlandırılmış bir `untrusted_input` bölümü** olarak girer.
Asla talimat gibi sunulmaz.

**Sert kural:** taze dış metin içeren bir turda `PUBLISH` ve hiçbir metered fiil
(`GENERATE`, `RENDER`, `INGEST`) insan onayı olmadan ateşlenemez. Prospect
kişiselleştirmesi tam da bu yüzden en riskli akış: agent bir prospect sitesini okuyor ve
aynı turda para harcayıp yayın yapabiliyor olsaydı, bu bir sızdırma ve aşırı harcama
yolu olurdu.

### Sandbox

**Maliyet formülleri kapalı bir aritmetik dilbilgisinde** (D-101): sayı, tanımlayıcı,
`+ - * /`, parantez, `min/max/ceil/floor`. Başka hiçbir şey. Döngü, atama, özellik
erişimi ve fonksiyon tanımı **dilbilgisinde yok** — QuickJS'te bunlar "verilmediği için"
yoktu, burada **söylenemedikleri için** yok. Döngü yazılamadığı için deadline'a da gerek
kalmıyor; deadline gerektiren bir tasarım, deadline'ın kaçırılabileceğini kabul eder.
Hesap sabit noktalı `bigint` üzerinde (R-41) ve tanımsız değişken hatadır, `NaN` değil.
Blast radius bir yanlış sayı.

Şablonlar (formül değil, gerçek kod çalıştıran yüzeyler) hâlâ bir sandbox gerektirir ve
o karar FAZ-4'e aittir; kapalı dilbilgisi orada yetmez.

Ağ gerektiren kullanıcı betikleri **Deno alt sürecinde**, pipeline'ın bildirdiği egress
host'ları `--allow-net=<host>` olarak. `--allow-run` ve `--allow-ffi` asla verilmez —
Deno'nun kendi dokümanı bunları `--allow-all` saymayı öneriyor. `node:vm` kullanılmaz;
kendi dokümanı güvenlik sınırı olmadığını yazıyor.

### Secret

**SOPS + age.** Değerler şifreli, **anahtar adları düz** — bu kasıtlı: `git diff` hangi
anahtarın eklendiğini/silindiğini gösterir, değerini göstermez.

Erişim yalnız `sops exec-env`. **`direnv` kullanılmaz**: gözetimsiz bir gece render'ında
kabuk kancası yoktur. Tanımlayıcılarda yalnız `${ENV_ADI}` dolaylaması.

`repo-hygiene` kapısı hem uzantıya hem **içeriğe** bakar. Desen ilk yazıldığında
`sk-[A-Za-z0-9]{20,}` idi ve gerçek Anthropic anahtarını tirede durduğu için kaçırıyordu;
kapı yazıldığı gün kördü ve yalnız ihlal testi ortaya çıkardı (D-49).

## §15 Test stratejisi {#section-15}

Çıktıların çoğu deterministik değil; strateji bunu kabul edip **deterministik olan her
şeyi sıkıca** test etmek üzerine kurulu.

| Katman | Ne | Nasıl |
|---|---|---|
| Birim | Saf fonksiyonlar: yönlendirici skorlama, maliyet formülü, Türkçe primitifler, projeksiyon derleyicisi, spec doğrulayıcılar | Vitest, gerçek assertion |
| Kontrat | Sağlayıcı adaptörleri | Kaydedilmiş cassette + msw (tek kesici) |
| Golden | Tipografi, şablon yerleşimi, deck sayfaları | **JSON metrik**, piksel değil |
| Değerlendirme | LLM çıktısı | Deterministik iddialar: şema geçerliliği, karakter sınırı, yasak terim yokluğu, diacritic bütünlüğü, `claim_source` varlığı |

**LLM'e "bu iyi mi" diye sorulmaz.** LLM-as-judge zayıf; şema geçerliliği ve yasak terim
listesi güçlü.

**Agentic katman fiil sınırında mock'lanır.** DAG, yönlendirici kararları, insan kapısı
geçişleri ve manifest içeriği test edilir — nesir değil.

**Tek HTTP kesici: msw.** İki dispatcher birbiriyle kavga eder ve "tek başına geçer,
paket içinde düşer" tipi flake üretir.

**Fixture'da gerçek prospect verisi asla bulunmaz** (KVKK). Sentetik corpus, sentetik
marka, sentetik prospect.

**Pahalı işlemin testi `plan`'dır.** Her metered fiilin kuru ikizi vardır: sıfır ağ,
sıfır yazma. Kuru ikizi olmayan bir fiil `plan`'ı yalancı yapar.

## §16 Riskler ve azaltmalar {#section-16}

**1 — Aşırı mühendislik. En büyük risk bu.** Tek kişilik bir şirket üç ay strateji CMS'i
yazıp imalatçılarla sıfır hafta konuşabilir.
*Azaltma:* on gerçek varlık yayınlanana ve bir iş kapanana kadar yedi strateji tipinin
ötesine geçilmez. `x_signature`, üç yollu merge, probe bake-off ve karar defteri **ilk
yeniden üretim gerçekten acıtana kadar** eklenmez.

**2 — Kernel sızıntısı.** Bir renderer'da `record.attributes.headline` yazmak zararsız
görünür; altı ay sonra kırk yerde Türkçe bir başlık varsayılır ve şirket dönüşemez.
*Azaltma:* derleme hatası + lint + Proxy tuzağı, ilk commit'ten itibaren.

**3 — Regenerasyon gürültüsü.** LLM her koşuda değişmemiş metni yeniden yazar; 900
opsiyonluk plan incelenemez, insan hepsini kabul eder ve yönetişim tiyatroya döner.
*Azaltma:* girdi-hash'li atlama zorunlu altyapıdır.

**4 — Mevzuat çürümesi.** On sekiz ayda CBAM iki kez, CSRD iki kez, TSRS bir kez
değişti. Eski eşiği söyleyen bir varlık yalnız bayat değil, **itibar zedeleyicidir** —
karşısındaki uyum sorumlusu kontrol eder.
*Azaltma:* `regulation` kayıtlarında `re_verify_by` zorunlu; süresi geçince o kaydı
kullanan varlıklar için hedefli regenerasyon önerilir.

**5 — Yeşil ama boş doğrulama.** `just verify` üç bileşenden ikisi stub'ken de yeşil
verir. Yeşilin kendisi kanıt değildir.
*Azaltma:* her BLOCKING kapı kasten ihlal edilerek kabul edilir (R-71); faz kapanışında
bağımsız doğrulama agent'ı.

**6 — Sahte tik.** Kriter karşılanmadan tiklemek. 2026-08-15'te iki kez oldu ve ikisini
de doğrulama agent'ı yakaladı.
*Azaltma:* `LOOP§D` + kanıt-önce disiplini + `just save` darboğazı.

**7 — Bir aylık ihmal.** Hiçbir daemon doğruluk tutmaz. Kurtarma `git clone` + `cat`;
`just verify` sıfırdan her şeyi yeniden kurar. Haftalık `doctor` **rapor yazar, hiçbir
şeyi değiştirmez** — gözetimsiz otomatik düzeltme, ihmal edilen sistemlerin çürüme yolu.

## §17 Reddedilenler {#section-17}

Tam liste ve gerekçeler `docs/research/` altında. Reddedilmiş bir `D-nn`'e atıf vermek
`citations` kapısında **hatadır** — geçersiz gerekçeye dayanmak, gerekçesiz olmaktan
kötüdür çünkü sağlam görünür.

**Altyapı:** Postgres · Langfuse · Temporal/Trigger.dev/Inngest · LiteLLM proxy ·
vektör DB · DVC · Git LFS · Turborepo/Nx (ilk gün) · n8n/Windmill/Dify · her agent
framework'ü (LangGraph/CrewAI/Mastra) · ayrı DAM · ayrı BI aracı · CRM.

**Kreatif:** Satori (Türkçe tipografi riski) · Canva Connect (Enterprise kapılı) ·
Gamma/Presenton/hazır deck üreticileri · Midjourney (API yok, ToS otomasyonu yasaklıyor) ·
otomatik klipleyiciler · ffmpeg `zoompan` · Playwright `recordVideo`.

**Lisans tuzakları:** FLUX.2 [dev] self-host (ticari değil) · XTTS-v2 (CPML, şirket
dağıldı) · F5-TTS ağırlıkları (CC BY-NC) · Bria RMBG (CC BY-NC, MIT rembg içinde paketli —
yanlışlıkla seçilmesi kolay) · ElevenLabs bedava katmanı (ticari lisans **yok**) ·
Kokoro (Türkçe yok).

**Kanallar:** TikTok (denetim headless pipeline'ın yapısal olarak geçemeyeceği şeyler
istiyor) · X (link içeren postta $0.20) · Pinterest (Trial'da Pin'leri yalnız siz
görürsünüz) · Reddit (en yüksek deplatform riski).

**Ölü/ölmekte:** Imagen 4 · gpt-image-1 · OpenAI Sora Videos API · Proxycurl ·
Crunchbase Basic API · Google CSE · Flowise · GitHub Models.

**Kapsam:** çok kiracılılık · müşteri koltuğu · white-label · public API.

## §18 Açık kalemler {#section-18}

`KARARLAR.md` sonunda `V-nn` olarak durur. **Her borç bir faz adımına bağlıdır** —
bağlanmamış borç, unutulmuş borçtur.

Doğrulanmamış bir sayı koda gömülmez; 🔴 işaretli her şey burada kalır ve kapanınca
tarih + kanıtla kapatılır.

Denetim tasfiyesi: üç düşman denetçinin 75 bulgusunun tamamı `docs/denetim-tasfiye.md`'de
karara bağlandı — uygulandı, reddedildi veya `V-nn` olarak ertelendi. **Sessizce düşen
bulgu yok.**

## §19 Araştırma eki {#section-19}

`docs/research/` — altı dalgada 45 agent çıktısı, damıtılmış markdown. 1000'den fazla
araç, model ve proje incelendi; fiyat, lisans ve karar (ADOPT/TRIAL/HOLD/AVOID) ile.

**Baştan sona okunmaz.** `ctx_search` ile sorgulanır veya ilgili dosya açılır.
`docs/research/README.md` dizini taşır.

Ham transkript (26 MB, her araç çağrısı ve çekilen her sayfa)
`~/.claude/projects/.../subagents/workflows/` altında kalır — git'e girmez, çünkü
`repo-hygiene` 512KB üstünü zaten bloklar ve varlık byte'ları içerik-adresli depoya aittir.

**Bir agent'ın neden öyle dediğini** öğrenmek gerektiğinde bakılacak yer ham transkripttir;
**ne dediğini** öğrenmek için damıtılmış hâli yeter.
