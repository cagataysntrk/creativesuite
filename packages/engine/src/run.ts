// Boru hattı koşturucusu — uçtan uca çalıştırma (§10, §13 · FAZ-3.14).
//
// **Motor beş şeyi BİR KEZ yapar** ve dokuz fiil de aynı yoldan geçer (`scheduler.ts`):
// bütçe kiralama → devre kesici → hız sınırı → idempotency → çağrı → defter kapatma.
// Bu dosya onun üstüne DAG yürüyüşünü, adım kayıtlarını ve manifest yazımını koyar.
//
// **Fiil gövdeleri ENJEKTE edilir, burada tanımlanmaz.** `RENDER` Chromium'a dokunur ve
// o kod `packages/render`ta; `GENERATE` sağlayıcıya dokunur ve o kod `packages/providers`ta.
// Motor gövdeyi görmez, yalnız sözleşmeyi (`resolveVerb`) doğrular.
//
// **Başarısız bir çalıştırma da bir ÇALIŞTIRMADIR.** Manifest her hâlükârda yazılır:
// yarıda kalan bir hattın ne kadar harcadığı ve nerede durduğu, başarılı bir hattınki
// kadar önemli — hatta daha önemli, çünkü tekrar denenecek olan odur.

import type {
  AppError,
  BrandId,
  CorrelationId,
  EraId,
  Money,
  RunId,
  StepId,
  VerbName,
} from '@suite/contracts'
import { ZERO_USD, usd, type Result } from '@suite/contracts'
import {
  asciiLower,
  makeError,
  systemClock,
  systemRng,
  type Clock,
  type Db,
  type ProviderCandidate,
  type Rng,
  type ContextManifestEntry,
  type HumanDecision,
  type RunManifest,
  type StepRecord,
  type Verb,
  type VerbContext,
  type VerbOutput,
} from '@suite/kernel'
import { topoOrder, type Pipeline, type PipelineStep } from '@suite/registry'
import { varyantlaGenislet } from './varyant-genislet.js'
import { CircuitBreaker } from './breaker.js'
import * as budget from './budget.js'
import { RateLimiter } from './ratelimit.js'
import { adimCiktisiniOku, adimCiktisiniYazDurum, type BaytDeposu } from './adim-ciktisi.js'
import { readStepBytes, storeStepBytes } from './blobs.js'
import { join } from 'node:path'
import { runOutputDir } from './manifest-writer.js'
import { runStep, type CallOutcome, type StepSpec } from './scheduler.js'
import { runVerb } from './run-verb.js'
import { resolveVerb, type VerbImplementations } from './verbs/registry.js'
import { route, type ProviderPricing, type RoutingDecision } from './router/route.js'
import { rejectionMessage } from './router/reasons.js'
import {
  writeFrozenPlan,
  writeManifest,
  writeRunStub,
  type WriteResult,
} from './manifest-writer.js'
import { digest, idempotencyKey } from './idempotency.js'
import type { FrozenPlan } from './plan/freeze.js'

export interface RunInput {
  readonly repoRoot: string
  readonly pipeline: Pipeline
  readonly runId: RunId
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly verbs: VerbImplementations
  readonly pricing: Readonly<Record<string, ProviderPricing>>
  readonly candidatesFor: (
    capability: string,
    env: Readonly<Record<string, string>>
  ) => readonly {
    readonly providerId: string
    readonly title: string
    readonly lanes: readonly ('free' | 'premium')[]
    readonly available: boolean
    readonly unavailableReason: string | null
  }[]
  readonly env: Readonly<Record<string, string>>
  /**
   * Çalıştırma parametreleri — her adımın kısıtlarına EKLENİR.
   *
   * Pipeline kısıtları **sözleşmedir** (bu hat neyi nasıl yapar); çalıştırma
   * parametreleri **örnektir** (bu sefer hangi konu, hangi şerit). Ayrım şart:
   * konuyu pipeline'a yazmak, her konu için ayrı bir YAML demekti.
   *
   * ⚠ Parametre kısıtı EZEMEZ. Pipeline `no_text: true` diyorsa çalıştırma anında
   * `false`a çevrilemez — R-20 bir çalıştırma tercihi değil, bir yasadır.
   */
  readonly params?: Readonly<Record<string, string | number | boolean>>
  readonly caps: budget.BudgetCaps
  readonly db: Db
  readonly clock?: Clock
  readonly rng?: Rng
  readonly limiter?: RateLimiter
  /**
   * Devre kesici. Verilmezse çalıştırma başına bir tane kurulur — ama **adım başına
   * ASLA**: adım başına taze bir kesici, 5 ardışık hata eşiğine hiç ulaşamaz (D-135).
   * Çağıran birden fazla çalıştırma arasında paylaşmak isteyebilir.
   */
  readonly breaker?: CircuitBreaker
  /**
   * İnsanın verdiği kapı kararları (§4c · §13).
   *
   * Bir kapı için `approved` bir karar varsa hat o kapıdan GEÇER; yoksa DURUR.
   * `decisions: []` sabit koduydu ve kapı kalıcı bir duvardı: onay mekanizması
   * olmadan hiçbir çalıştırma tamamlanamazdı (D-145).
   *
   * ⚠ Kararları AGENT üretemez. `just onay` insanın klavyesinden çalışır ve manifest'e
   * yazar; motor yalnız yazılmış olanı OKUR. Bu ayrım R-14'ün çalıştırma tarafındaki
   * karşılığı.
   */
  readonly decisions?: readonly HumanDecision[]
  /**
   * Enjekte edilen bağlamın manifesti (§5.3 · §13).
   *
   * İlk sürümde `context: []` sabit koduydu ve `assembleContext` üretim yolunda hiç
   * çağrılmıyordu: "bu çıktı neden böyle" sorusunun cevabı hiçbir yerde yoktu (D-146).
   * Çağıran `toManifestEntries()` ile üretip verir; motor onu manifest'e AYNEN yazar.
   */
  readonly context?: readonly ContextManifestEntry[]
  /**
   * Devam edilen çalıştırmanın ÖNCEKİ manifest'i (§13 · D-154).
   *
   * Verilirse: `createdAt` korunur ve önceki adım kayıtları BİRLEŞTİRİLİR — bu koşuda
   * yeniden koşmayan adımların kaydı kaybolmaz. Üzerine yazmak, "manifest bir
   * çalıştırmanın TEK kanıtıdır" (§13) ve "`derived/runs` türetilemez" (D-38) ile
   * çelişirdi: yeniden üretilemeyen bir kanıt siliniyor.
   */
  /**
   * Onaylanmış DONMUŞ plan (§8.3 · R-07 · FAZ-4.6b).
   *
   * Verilirse motor **yeniden yönlendirme YAPMAZ**: donmuş adımın sağlayıcısı ve
   * donmuş maliyeti kullanılır. Sebep tek cümle: insanın onayladığı plan ile koşan
   * plan aynı olmak zorunda. Yeniden çözseydik, onay ile çalıştırma arasında biri
   * `registry/providers/`de fiyat güncellediğinde onaylanmayan bir şey koşardı ve
   * fark ancak fatura gelince görülürdü.
   *
   * **Dünya değiştiyse bu bir HATA değil, bir bilgidir** (`planStale`): plan yine
   * donmuş hâliyle koşar, değişiklik operatöre bildirilir.
   */
  readonly frozen?: FrozenPlan | null
  readonly previous?: RunManifest | null
  readonly signal?: AbortSignal
  /** Test bunu 0 yapar; üretimde gerçekten bekler. */
  readonly sleep?: (ms: number, signal: AbortSignal) => Promise<void>
  /**
   * Canlı iz — adım başlarken/biterken çağrılır.
   *
   * ⚠ Motor `console`a DOKUNMAZ: kütüphane kodu nereye yazacağına karar veremez
   * (CLI stdout'a, sunucu dosyaya, test hiçbir yere). Çağıran verir.
   */
  readonly iz?: (satir: string) => void
}

export interface RunReport {
  readonly runId: RunId
  readonly manifest: RunManifest
  readonly manifestWrite: WriteResult
  /** Hangi adımda durdu — `null` ise hat sonuna kadar koştu. */
  readonly stoppedAt: StepId | null
  readonly errors: readonly { readonly stepId: StepId; readonly error: AppError }[]
  /** İnsan kapısına dayandı mı — onay bir yan etki değil, bir KAPIDIR (§4c). */
  readonly awaitingGate: string | null
  readonly budget: budget.BudgetState
  readonly outputs: Readonly<Record<string, unknown>>
}

/**
 * Adım **isteğe bağlı** mı: başarısızlığı hattı durdurmaz.
 *
 * Somut gerekçe: bir carousel'in arka plan görseli üretilemezse slayt düz zeminle
 * render edilir ve bu **meşru bir çıktıdır** — "bedava ve premium çıktı tipografide
 * aynıdır" (§8.2) vaadi zaten görselin taşıyıcı olmadığını söylüyor. Zorunlu saymak,
 * anahtarı olmayan bir kurulumda hattın hiç koşmaması demekti.
 *
 * ⚠ İsteğe bağlılık pipeline'da AÇIKÇA yazılır; motor tahmin etmez.
 */
const isteğeBagli = (s: PipelineStep): boolean => s.constraints['optional'] === true

/**
 * Dış metin sınırının KENDİ kapısı (§14 · R-50).
 *
 * Ayrı bir ad taşıması şart: "yayınla" onayı ile "dış metin okundu, harcamaya izin
 * veriyorum" onayı iki ayrı karardır ve birini diğerinin yerine saymak, sınırı
 * kullanıcının hiç görmediği bir onayla açardı.
 */
export const UNTRUSTED_GATE = 'untrusted-input'

/**
 * Defterin taşıdığı adım-çıktısı anahtarları — **BEYAZ LİSTE ve dışa açık.**
 *
 * ⚠ **Dışa açık olması bir testin şartı, bir kolaylık değil.** Bu liste beş kez eksik
 * kaldı ve her seferinde belirti aynıydı: üretilen veri deftere hiç girmiyor, kimse fark
 * etmiyor, ancak GERÇEK bir koşunun manifest'ine bakınca çıkıyor (D-216 · D-261 ailesi).
 * Liste sınanabilir olmazsa altıncı kez eksik kalır.
 */
export const DEFTER_ANAHTARLARI: readonly string[] = [
  // ── elle yüklenen görsel (FAZ-17.3) ────────────────────────────────────
  //
  // ⚠ Üçü de KÜÇÜK ve KARAR taşıyor: hangi dosya kullanıldı, üretim mi yükleme mi,
  // ve ifşa gerekiyor mu. `yapayZeka` doğrudan Md. 50 kararının girdisi — defterde
  // olmazsa "bu karosel neden ifşasız yayınlandı" sorusu cevapsız kalırdı.
  'elleYuklendi',
  'yapayZeka',
  'dosya',
  // ⚠ İnsanın metin onayında yaptığı düzenleme — kanıt: bu metni model mi yazdı insan
  // mı. `oncekiSatirlar` da defterde: kanıt silinmiyor, ekleniyor (D-38).
  'elleDuzenlendi',
  'oncekiSatirlar',
  // ⚠ ⚠ Katalog merkezli yol (FAZ-15.9): bu anahtarlar deftere girmezse hangi şablonun
  // seçildiği ve render'ın ölçtüğü kusurların ne olduğu KAYBOLUR — koşu sonradan
  // denetlenemez hâle gelir. `sablonId` özellikle kritik: "bu karosel neden böyle"
  // sorusunun tek cevabı o.
  'sablonId',
  // ⚠ ⚠ **DÜZEN PROVASI DEFTERE GİRİYOR (D-347).** Prova geçtiyse bunun kaydı, "bu
  // koşunun düzeni görsel harcamasından ÖNCE ölçüldü mü" sorusunun tek cevabı. Kayıtsız
  // bir prova, koşmamış bir provadan ayırt edilemez — ve `defter-anahtarlari` kapısı bu
  // anahtarı ilk yazıldığı anda yakaladı: gövde üretiyordu, defter sessizce eliyordu.
  // Bu dosyanın kendi yorumunun saydığı sınıfın bir tekrarı daha, bu kez kapı önce davrandı.
  'provaGecti',
  // ⚠ Konusuz başlatmada konuyu AGENT seçiyor (`konu-sec`). Seçilen konu ve gerekçesi
  // deftere girmezse "bu karosel neden bu konuda" sorusunun cevabı hiçbir yerde
  // yazmaz — ve `islenmisKonular` bir daha aynı konuyu eleyemez.
  'konu',
  'gerekce',
  // ⚠ Kusur LİSTESİ de deftere giriyor: sayı "kaç" der, liste "hangi" der. Düzeltme
  // turunun işe yarayıp yaramadığı ancak iki render'ın listeleri karşılaştırılarak
  // görülüyor — sayı tek başına bunu söyleyemez.
  'kusurlar',
  // İfşa ÖLÇÜMÜ deftere giriyor: yayın kapısı buna dayanıyor ve "ölçüldü mü" sorusu
  // sonradan sorulamaz hâle gelmemeli (§11.3).
  'ifsaGorunur',
  'uyarilar',
  'kusurSayisi',
  'bulgular',
  'gecti',
  'slaytSayisi',
  'panoramaGenisligi',
  'qa',
  'slides',
  'count',
  'rung',
  'bytes',
  'format',
  'width',
  'height',
  // PDF yolu (FAZ-6.1, 6.3)
  'deck',
  'document',
  'pages',
  'flattened',
  'quality',
  'oversizedPages',
  // dedektörlerin OKUDUĞU anahtarlar (FAZ-6.6, 6.7, 6.8) — bu üçü manifest'e
  // girmezse üç kural sonsuza kadar sessiz kalır
  'fetchedAt',
  'sourceRef',
  // ⚠ `capture` eksikti: RENDER'ın çekim dalı `{capture:{...}}` döndürüyor ve manifest
  // özeti onu eliyordu — yani "her ekran görüntüsü gerçek bir çekime bağlanıyor"
  // iddiasının defterde karşılığı yoktu (2. doğrulama turu, bulgu 8).
  'capture',
  'personalizationFields',
  'productShots',
  // INGEST raporu (FAZ-6.5): kaç kaynak hazır, kaçı bloke
  'sourcesReady',
  'sourcesBlocked',
  'quarantinePath',
  // zincir (FAZ-6.9)
  'chain',
  'chainGates',
  // ⚠ **TASARIM PLANI (FAZ-14.2) ve ATLAMA (FAZ-14.3).** Plan bu listede olmadığı
  // sürece deftere HİÇ girmiyordu — yani "kararlar gerekçesiyle yazılı" iddiası
  // yanlıştı ve bunu ancak GERÇEK bir koşunun manifest'ine bakınca gördüm. Testim
  // `composeBody`nin dönüş değerini sınıyordu, defteri değil: modülü test edip
  // zinciri test etmemenin (D-261) bu fazdaki dördüncü tekrarı.
  'tasarimPlani',
  // Slayt digest'leri: defterdeki işaretçiyi doğrulanabilir yapan tek alan (D-263).
  'digests',
  'atlandi',
  // ⚠ ⚠ **YARGI ÇIKTILARI (FAZ-10.5 · 13.5) — beşinci tekrar.** Gerçek bir koşunun
  // manifest'ine bakınca çıktı: `gorsel-yargi` ve `tasarim-yargi` adımları `ok`
  // dönüyordu ama `output: null` yazıyordu. Yani kusur bulguları da estetik puanlar da
  // deftere HİÇ girmiyordu — her koşuda üretiliyor, her koşuda kayboluyordu.
  // 13.5'in bütün amacı çıktının zaman içinde KARŞILAŞTIRILABİLİR olması; kaydedilmeyen
  // bir puan bir ölçüm değil, bir anlık histir. Bu listenin kendi yorumu zaten
  // *"eksik bir beyaz liste sessiz bir körlüktür"* diyordu ve aynı hata tekrarladı.
  'puanlar',
  'toplam',
  'bulgular',
  'reddedilen',
  'sebep',
  // ⚠ ⚠ **RİTİM ÖLÇÜMÜ (FAZ-16.8) — ALTINCI TEKRAR.** Ölçüm yazıldı, birim testi ve
  // dikiş testi yeşildi, gerçek koşuda alanlar defterde HİÇ görünmedi: bu beyaz liste
  // onları sessizce atıyordu. Yukarıdaki blok aynı hatanın beşinci tekrarını anlatıyor
  // ve *"eksik bir beyaz liste sessiz bir körlüktür"* diyor — o cümle yazılıyken bile
  // liste bir sonraki alanı elemeye hazırdı. Bir çıktı alanı eklerken bu listeye de
  // eklemek, o alanın var olmasının PARÇASIDIR.
  'ritimHedefi',
  'ritimTuttu',
  'ritimOlculemedi',
  // ⚠ ⚠ **BUNLARI `defter-anahtarlari` KAPISI BULDU — altı tekrarın yedinci, sekizinci…
  // tarafı.** Kapı yazılır yazılmaz on tane daha sessizce elenen alan çıktı ve
  // içlerinde YAYIN KANITI vardı: `published` (kanal id'si), `proposedAt`,
  // `quotaBefore`. Yayınlanmış bir varlığın kanal id'sinin defterde olmaması,
  // R-46'nın (körlemesine tekrar yok, önce mutabakat) dayanacağı kaydın hiç
  // yazılmaması demekti.
  'published',
  'proposed',
  'proposedAt',
  'quotaBefore',
  'irKullanildi',
  'brandId',
  'domain',
  // ⚠ ⚠ **`lines` OLMADAN METİN KAPISI ANLAMSIZ — ve bunu ilk gerçek kapı koşusu
  // gösterdi.** Hat `metin-onayi`nda durdu, insan "onayla" diyecekti ve ONAYLAYACAĞI
  // METİN DEFTERDE YOKTU. Bir kapı, kararın dayanağını taşımıyorsa kapı değil bir
  // gecikmedir. Satırlar kısa ve sayılı; yük değil kanıt.
  'lines',
  // ⚠ ⚠ **YAYIN SAATİ ÖNERİSİ (FAZ-17.3).** Öneri deftere girmezse insanın onay
  // ekranında gördüğü gerekçe hiçbir yerde yazmaz — ve "bu saat neden seçildi"
  // sorusu, tam da kaynağı olması gereken yerde cevapsız kalır (Yasa 8).
  // ⚠ `veri-yok` dalı da yazılıyor: öneri YAPILMADIĞININ kaydı, yapılanın kaydı
  // kadar önemli. Sessiz bir susma, ölçülmemiş bir hesabı "ölçüldü" gibi gösterir.
  'yayinSaati',
  // ⚠ İnsanın SEÇTİĞİ yayın anı — `published` "oldu" der, bu alan "kararlaştırıldı"
  // der. İkisi ayrı sorular ve ikincisi yalnız burada yazılı.
  'plannedAt',
] as const

/**
 * Adım çıktısının manifest'e girecek ÖZETİ — beyaz listeye göre.
 *
 * Ölçülebilir ve kısa olanı taşır. Belge modelini ya da byte'ları taşımaz: manifest bir
 * defterdir, bir depo değil (byte'lar `derived/blobs`ta, §3.5).
 */
const ozetle = (data: unknown): Readonly<Record<string, unknown>> | null => {
  if (data === null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const cikti: Record<string, unknown> = {}
  for (const anahtar of DEFTER_ANAHTARLARI) {
    if (o[anahtar] !== undefined) cikti[anahtar] = o[anahtar]
  }
  return Object.keys(cikti).length > 0 ? cikti : null
}

const hata = (
  code: string,
  correlationId: CorrelationId,
  detay: Readonly<Record<string, unknown>>
): AppError =>
  makeError({
    kind: 'internal',
    code,
    userMessageKey: `error.run.${asciiLower(code)}`,
    correlationId,
    details: detay,
  })

/**
 * Hattı uçtan uca koşar.
 *
 * Sıra `topoOrder` ile: bağımlılıklar önce. Paralellik YOK ve bu bilinçli — bir carousel
 * hattı sekiz adım ve paralellik kazancı, iki adımın aynı son 10 kuruşu ayrı ayrı
 * "uygun" görmesi riskine değmez (bütçe kiralaması bunu zaten engelliyor ama karmaşıklık
 * kalırdı). FAZ 5'te uzun render'lar için yeniden değerlendirilir.
 */
export const runPipeline = async (input: RunInput): Promise<RunReport> => {
  const clock = input.clock ?? systemClock
  const rng = input.rng ?? systemRng
  const signal = input.signal ?? new AbortController().signal

  // ── varyant genişletmesi (§10 · D-240 · FAZ-8.1b) ─────────────────────────
  //
  // ⚠ **Koşu tek varyant üretiyordu** oysa `plan()` yedisini fiyatlıyordu: tahmin
  // dürüsttü, üretim değildi. Genişletme `plan()` ile AYNI fonksiyondan geliyor —
  // iki ayrı hesap bir gün ayrışır ve o gün kullanıcı yedinin parasını onaylayıp
  // bir tane alır.
  //
  // Genişletme burada, `topoOrder`dan ÖNCE: sıra genişletilmiş DAG'a göre kurulmalı,
  // yoksa varyant kopyaları hiç koşmaz.
  const genisletme = varyantlaGenislet(input.pipeline)
  const kosanHat = genisletme.pipeline
  const sira = topoOrder(kosanHat)
  const adimlar = new Map(kosanHat.steps.map((s) => [s.id, s]))

  // ⚠ Devre kesici çalıştırma başına BİR KEZ kurulur. İlk yazımda her adımda
  // `new CircuitBreaker()` çağrılıyordu: durum adım başına taze kalıyor, eşik 5 ardışık
  // hata ve tek adımda en fazla 3 deneme olduğu için kesici **yapısal olarak hiç
  // açılamıyordu** (D-135). Enjekte edilebilir: çağıran çalıştırmalar arası paylaşabilir.
  const breaker = input.breaker ?? new CircuitBreaker()

  // ── adım baytı: defterde ADRES, `derived/blobs`ta byte (D20) ───────────────
  //
  // ⚠ ⚠ **BU OLMADAN `tasarim-onayi` BİR ŞEY İFADE ETMİYORDU.** Görsel çıktısı gömülü
  // byte taşıdığı için deftere yazılmıyordu; her sürdürmede `gorsel-uret` yeniden
  // koşuyor, BAŞKA bir görsel üretiyor ve insanın onayladığı slaytlar yayına giden
  // slaytlar olmuyordu. Ölçüldü: girdi özeti sabit (`39a8c02e`), çıktı her geçişte
  // farklı (`2c1d3c70` → `c642914f`).
  const baytDeposu: BaytDeposu = {
    yaz: (base64) =>
      storeStepBytes(join(input.repoRoot, 'derived/blobs'), Buffer.from(base64, 'base64')),
    oku: (adres) => {
      const b = readStepBytes(join(input.repoRoot, 'derived/blobs'), adres)
      return b === null ? null : b.toString('base64')
    },
  }

  // Defterin "ücretsiz kaydı yeniden koş" dalı BUNU soruyor: çıktı diskte mi?
  // Duruyorsa çağrıyı tekrarlamak israf — aşağı akış zaten diskten okuyor (D-247).
  const ciktiVar = (_runId: RunId, stepId: string): boolean =>
    adimCiktisiniOku(runOutputDir(input.repoRoot, input.runId), stepId, baytDeposu) !== null

  // ── künye: koşunun DOĞUM kaydı, adımlardan ÖNCE ───────────────────────────
  //
  // Manifest en sonda yazılıyor ve bu doğru — maliyet ancak koşu bitince bilinir. Ama
  // süreç ortada ölürse (SIGKILL, elektrik) diskte varlıklar kalır, manifest kalmaz ve
  // `just doctor` haklı olarak "kimin ürettiği bilinmiyor" der. Künye o boşluğu
  // kapatıyor: yalnız kimlik taşır, maliyet ya da adım kaydı TAŞIMAZ — henüz
  // bilinmiyorlar ve bilinmeyeni yazmak uydurmaktır.
  writeRunStub(input.repoRoot, {
    runId: input.runId,
    brandId: String(input.brandId),
    eraId: String(input.eraId),
    pipeline: input.pipeline.id,
    createdAt: input.previous?.createdAt ?? clock.nowIso(),
    corpusCommit: input.corpusCommit,
    registryCommit: input.registryCommit,
  })

  const kayitlar: StepRecord[] = []
  const hatalar: { stepId: StepId; error: AppError }[] = []
  const ciktilar: Record<string, unknown> = {}

  // ── §14 sınırının girdisi ──────────────────────────────────────────────────
  //
  // Bu koşuda karantinaya inen dış belgeler. `ingestGate` yalnız SAYILARINA ve
  // alan adlarına bakıyor (metni okumuyor) — sınır konumsaldır, içeriğe bakmaz.
  const tazeDisBelgeler: { domain: string; sourceRef: string; fetchedAt: string; text: string }[] =
    []
  // İnsan **DIŞ METİN sınırını** açıkça onayladı mı (§14).
  //
  // ⚠ İlk sürüm `decisions.some(d => d.decision === 'approved')` yazıyordu — yani
  // hattın SONUNDAKİ `insan-onayi` kapısına verilen onay, `ingestGate`i de açıyordu.
  // Oysa bunlar iki farklı karar: "bu çıktıyı yayınla" ile "bu dış metni okuduktan
  // sonra para harcamana izin veriyorum" aynı şey değil (2. doğrulama turu, bulgu 15).
  //
  // Sınır kendi kapısını ister: `untrusted-input`. Başka bir kapının onayı onu açmaz.
  const insanOnayVerdi = (input.decisions ?? []).some(
    (d) => d.gate === UNTRUSTED_GATE && d.decision === 'approved'
  )
  let bState = budget.emptyBudget(input.caps)
  let durduguYer: StepId | null = null
  let bekleyenKapi: string | null = null

  for (const id of sira) {
    const ham = adimlar.get(id)
    if (ham === undefined) continue
    // Parametreler ÖNCE, kısıtlar SONRA: pipeline kısıtı her zaman kazanır.
    const s: PipelineStep = {
      ...ham,
      constraints: { ...(input.params ?? {}), ...ham.constraints },
    }
    const stepId = id as StepId
    const correlationId = `cor_${input.runId}_${id}` as CorrelationId

    // ⚠ ⚠ **ADIM BAŞLARKEN KONUŞUYOR — sonunda değil.** Özet tablo yalnız çalıştırma
    // BİTİNCE basılıyordu; dakikalarca süren bir koşuda hattın nerede olduğunu
    // öğrenmenin hiçbir yolu yoktu ve asılan bir adım "sistem donmuş" gibi
    // görünüyordu. Gerçek bir asılma bu satır olmadığı için on beş dakika teşhis
    // edilemedi. Satır alt sürecin stdout'una gidiyor; sunucu onu canlı olarak
    // `derived/runs/<id>/calistirma.log` dosyasına akıtıyor.
    // ⚠ ⚠ **ANAHTAR İZE BASILIYOR — çünkü tahminle aranmayacak kadar önemli.**
    // Ölçüldü: her kapı onayından sonra TÜM hat yeniden koşuyor; defterde her adım
    // için birden çok satır var, yani `idempotencyKey` geçişten geçişe KAYIYOR ve
    // "bu iş yapıldı" bilgisi kayboluyor. Anahtarın hangi adımda değiştiğini görmenin
    // tek dürüst yolu onu yazmak; `params` ve `corpusCommit` ölçülüp elendi.
    // Girdi özetinin ilk sekiz karakteri: iki geçişte farklıysa adım yeniden koşar.
    const izGirdi = digest(id, JSON.stringify(ciktilar[s.needs[0] ?? ''] ?? null)).slice(0, 8)
    input.iz?.(`▶ ${id} [${izGirdi}]`)

    // ── insan kapısı: onay bir yan etki değil, bir KAPIDIR (§4c) ───────────
    if (s.gate !== null) {
      const karar = (input.decisions ?? []).find((d) => d.gate === s.gate)
      if (karar === undefined) {
        // Karar YOK: hat durur. Kapıyı otomatik geçmek, "agent önerir insan uygular"
        // (§5.4) yasasının tek mekanik karşılığını silmek olurdu.
        bekleyenKapi = s.gate
        durduguYer = stepId
        break
      }
      if (karar.decision === 'rejected') {
        // Red de bir karardır ve gerekçesi KALICIDIR: sonraki çalıştırmaya negatif
        // kısıt olarak girer (§12.9). Sessizce "durdu" demek gerekçeyi kaybederdi.
        hatalar.push({
          stepId,
          error: hata('GATE_REJECTED', correlationId, {
            gate: s.gate,
            note: karar.note,
            at: karar.at,
          }),
        })
        durduguYer = stepId
        break
      }
      // Onaylandı: kapı GEÇİLDİ ve karar manifest'e yazılacak. Adımın kendisi
      // (`PROPOSE`) normal akışta koşmaya devam eder.
    }

    const verbAdi = s.verb as VerbName
    const cozum = resolveVerb(verbAdi, input.verbs, correlationId)
    if (!cozum.ok) {
      hatalar.push({ stepId, error: cozum.error })
      durduguYer = stepId
      break
    }
    const verb: Verb = cozum.value

    // ── yönlendirme: hangi sağlayıcı, kaybedenler gerekçesiyle (§8.2) ──────
    // Donmuş planda bu adımın kararı varsa yönlendirici HİÇ ÇAĞRILMAZ (R-07).
    // Çağırıp sonucu karşılaştırmak da yeterli olmazdı: karşılaştırma "farklı çıktı,
    // ne yapayım" sorusunu doğurur ve tek doğru cevap zaten donmuş olanı kullanmaktır.
    const donmusAdim = (input.frozen?.steps ?? []).find((f) => f.stepId === stepId) ?? null
    const donmusKarar =
      donmusAdim === null || donmusAdim.providerId === null
        ? null
        : {
            providerId: donmusAdim.providerId,
            title: donmusAdim.providerId,
            cost: donmusAdim.estimatedCost,
            confidence: donmusAdim.confidence ?? ('amber' as const),
            quality: 0,
            latencySeconds: null,
            score: 0,
          }

    const adaylar =
      s.capability === null || donmusKarar !== null
        ? []
        : input.candidatesFor(s.capability, input.env)
    const yonlendirme: RoutingDecision | null =
      donmusKarar !== null
        ? { winner: donmusKarar, rejected: [], fallbacks: [] }
        : s.capability === null || adaylar.length === 0
          ? null
          : route(
              {
                capability: s.capability,
                lane: s.constraints['lane'] === 'premium' ? 'premium' : 'free',
                constraints: Object.fromEntries(
                  Object.entries(s.constraints).filter(
                    (e): e is [string, string | number | boolean] =>
                      typeof e[1] === 'string' ||
                      typeof e[1] === 'number' ||
                      typeof e[1] === 'boolean'
                  )
                ),
                params: Object.fromEntries(
                  Object.entries(s.constraints).filter(
                    (e): e is [string, number] => typeof e[1] === 'number'
                  )
                ),
                prefer: 'cost',
                maxCost:
                  typeof s.constraints['max_cost_usd_micros'] === 'number'
                    ? usd(BigInt(Math.trunc(s.constraints['max_cost_usd_micros'])))
                    : null,
              },
              adaylar,
              input.pricing
            )

    const kazanan = yonlendirme?.winner ?? null
    const tahmin = kazanan?.cost ?? { low: ZERO_USD, high: ZERO_USD }
    const baslangic = clock.nowIso()

    const ctx: VerbContext = {
      runId: input.runId,
      stepId,
      brandId: input.brandId,
      eraId: input.eraId,
      correlationId,
      clock,
      rng,
      ...(input.signal === undefined ? {} : { signal: input.signal }),
    }

    // ── fiil çağrısının TEK yolu (§14 · R-50 · D-216) ──────────────────────
    //
    // ⚠ **`runPipeline` `verb.run`u DOĞRUDAN çağırıyordu** ve bu iki sözleşmeyi birden
    // atlıyordu: `ingestGate` (taze dış metin varken metered fiil insan onayı ister) ve
    // `validateVerbOutput` (metered fiil `CostEvent`siz geçemez). İkisi de yazılmış,
    // test edilmiş ve üretimde hiç koşmamıştı — `runVerb`ün KENDİSİ D-69'da aynı hatayı
    // kapatmak için yazılmıştı ve bir seviye yukarıda tekrar edilmişti (FAZ-6 denetimi).
    const fiiliCagir = async (v: Verb, girdi: unknown): Promise<Result<VerbOutput, AppError>> => {
      const r = await runVerb(v, ctx, girdi, {
        freshDocuments: tazeDisBelgeler,
        humanApproved: insanOnayVerdi,
      })
      return r.ok ? { ok: true, value: r.value.output } : { ok: false, error: r.error }
    }

    // ⚠ ⚠ **DEFTERDEN OYNATILAN ADIMIN KAYDI, ÖNCEKİ KAYITTIR.** Bu geçişte çağrı
    // yapılmadı: sağlayıcı da maliyet de bu geçişte doğmadı, ÖNCEKİ geçişte doğdu.
    // Boş bir kayıt yazmak manifest doğrulayıcısını haklı olarak kızdırıyordu
    // (`no_selected_provider`, `metered_step_without_cost`) ve sonuç manifestin HİÇ
    // yazılmaması oluyordu — düzeltmenin kendisi, kanıtı yok ediyordu.
    const oncekiKayit = (input.previous?.steps ?? []).find((k) => String(k.stepId) === id) ?? null
    let defterdenSaglayicisiz = false

    // Metered fiiller motorun tam yolundan geçer; metered olmayanlar doğrudan koşar.
    // Ayrım gövdede değil SÖZLEŞMEDE: `verb.metered` kernel'in dediğidir (R-04).
    let sonuc: {
      readonly ok: boolean
      readonly outcome: CallOutcome | null
      readonly error: AppError | null
    }

    if (verb.metered && s.capability === null) {
      // **Yerel metered adım.** `RENDER` para harcamaz ama kaynak harcar ve süre de bir
      // maliyettir (§8.3) — o yüzden metered. Ama yönlendirilemez: `R-30` tek render
      // motoru diyor ve bir motoru "seçmek", ikinci bir motorun var olabileceğini
      // varsayar. Yönlendirici dışarıdaki sağlayıcılar içindir; Chromium içeride.
      const r = await runStep(
        {
          db: input.db,
          breaker,
          clock,
          rng,
          ...(input.limiter === undefined ? {} : { limiter: input.limiter }),
          ...(input.sleep === undefined ? {} : { sleep: input.sleep }),
          ciktiVar,
        },
        {
          runId: input.runId,
          stepId,
          verb: verbAdi,
          capability: 'local',
          providerId: 'local',
          metered: true,
          idempotencyKey: idempotencyKey({
            runId: input.runId,
            stepId: id,
            verb: verbAdi,
            capability: 'local',
            providerId: 'local',
            model: null,
            seed: null,
            params: s.constraints,
            corpusCommit: input.corpusCommit,
            inputDigest: digest(id, JSON.stringify(ciktilar[s.needs[0] ?? ''] ?? null)),
          }),
          estimateHigh: ZERO_USD,
        },
        bState,
        async () => {
          const o = await fiiliCagir(verb, {
            constraints: s.constraints,
            inputs: ciktilar,
            ...(s.capability === null ? {} : { capability: s.capability }),
            needs: s.needs,
          })
          return o.ok
            ? {
                ok: true as const,
                value: {
                  amount: o.value.costs.reduce<Money>(
                    (t, c) => usd(t.micros + c.amount.micros),
                    ZERO_USD
                  ),
                  chargeStatus: 'not-charged' as const,
                  externalId: null,
                  data: o.value.data,
                },
              }
            : { ok: false as const, error: o.error }
        },
        correlationId,
        signal
      )
      bState = r.budget
      sonuc = { ok: r.error === null, outcome: r.outcome, error: r.error }
    } else if (verb.metered) {
      if (kazanan === null && ciktiVar(input.runId, stepId)) {
        defterdenSaglayicisiz = true
        // ⚠ ⚠ **ANAHTARSIZ SÜRDÜRME, ÜRETİLMİŞ GÖRSELLERİ SİLİYORDU.** Ölçüldü
        // (`run_01a02989`): panelden onaylanıp sürdürülen bir koşuda dört `gorsel-uret`
        // adımı da `NO_PROVIDER` ile düştü — `sops exec-env` olmadan Cloudflare
        // "yerel önkoşul sağlanmadı" diyor. Adımlar `optional` olduğu için hat DEVAM
        // etti, `COMPOSE` görselsiz bir belge kurdu ve `RENDER` onu yeniden çizdi:
        // insanın onayladığı kesik özneler yerine dört YER TUTUCU. Bir sürdürme,
        // tamamlanmış bir işi bozdu.
        //
        // ⚠ **Çağrılacak bir şey yoktu ki sağlayıcı gereksin.** Adımın çıktısı
        // `derived/runs/<run>/steps/<adim>.json` içinde ve byte'ları
        // `derived/blobs`ta duruyor; yönlendirici yalnız YENİ bir çağrı için gerekli.
        // Sağlayıcı yokluğunu "çıktı yok" saymak, defterin var olma sebebini
        // yok saymaktı.
        //
        // ⚠ Sıra önemli: kontrol `NO_PROVIDER`ın ÖNÜNDE. Sonrasında olsaydı hata
        // zaten üretilmiş, adım `failed` yazılmış olurdu.
        input.iz?.(`  ↺ ${id}: sağlayıcı yok ama çıktı DEFTERDE — yeniden üretilmiyor`)
        sonuc = { ok: true, outcome: null, error: null }
      } else if (kazanan === null) {
        // Sağlayıcı seçilemedi ve defterde de çıktı yok. Sessizce atlamak yasak: eleme
        // gerekçeleri hatanın içinde taşınıyor ki kullanıcı "anahtarı tanımla" ile
        // "bu yeteneği kimse yapmıyor" arasındaki farkı görebilsin.
        const gerekce = (yonlendirme?.rejected ?? []).map(
          (r) => `${r.providerId}: ${rejectionMessage(r.reason)}`
        )
        sonuc = {
          ok: false,
          outcome: null,
          error: hata('NO_PROVIDER', correlationId, {
            capability: s.capability,
            rejected: gerekce,
          }),
        }
      } else {
        const spec: StepSpec = {
          runId: input.runId,
          stepId,
          verb: verbAdi,
          capability: s.capability ?? '',
          providerId: kazanan.providerId,
          metered: true,
          idempotencyKey: idempotencyKey({
            runId: input.runId,
            stepId: id,
            verb: verbAdi,
            capability: s.capability ?? '',
            providerId: kazanan.providerId,
            model: null,
            seed: null,
            params: s.constraints,
            corpusCommit: input.corpusCommit,
            inputDigest: digest(id, JSON.stringify(ciktilar[s.needs[0] ?? ''] ?? null)),
          }),
          estimateHigh: tahmin.high,
        }
        const r = await runStep(
          {
            db: input.db,
            breaker,
            clock,
            rng,
            ...(input.limiter === undefined ? {} : { limiter: input.limiter }),
            ...(input.sleep === undefined ? {} : { sleep: input.sleep }),
            ciktiVar,
          },
          spec,
          bState,
          async (c) => {
            // Seçilen sağlayıcı ve motorun tutamak köprüsü gövdeye AKTARILIR.
            // Aktarılmasaydı gövde hangi sağlayıcının kazandığını bilemez ve
            // `providerCall`ı kuramazdı — B8'in kökü buydu (D-141).
            let tutamak: string | null = null
            const o = await fiiliCagir(verb, {
              constraints: s.constraints,
              inputs: ciktilar,
              // Yetenek adımın verisi — gövde kurulumundan değil buradan gelir (D-241).
              ...(s.capability === null ? {} : { capability: s.capability }),
              needs: s.needs,
              providerId: kazanan.providerId,
              noteHandle: (id: string) => {
                tutamak = id
                c.noteHandle(id)
              },
              resumeExternalId: c.resumeExternalId,
            })
            return o.ok
              ? {
                  ok: true as const,
                  value: {
                    amount: o.value.costs.reduce<Money>(
                      (t, c2) => usd(t.micros + c2.amount.micros),
                      ZERO_USD
                    ),
                    chargeStatus: 'charged' as const,
                    externalId: tutamak,
                    data: o.value.data,
                  },
                }
              : { ok: false as const, error: o.error }
          },
          correlationId,
          signal
        )
        bState = r.budget
        sonuc = { ok: r.error === null, outcome: r.outcome, error: r.error }
      }
    } else {
      const o = await fiiliCagir(verb, {
        constraints: s.constraints,
        inputs: ciktilar,
        ...(s.capability === null ? {} : { capability: s.capability }),
        needs: s.needs,
      })
      sonuc = o.ok
        ? {
            ok: true,
            outcome: {
              amount: ZERO_USD,
              chargeStatus: 'not-charged',
              externalId: null,
              data: o.value.data,
            },
            error: null,
          }
        : { ok: false, outcome: null, error: o.error }
    }

    const adaylarKaydi: ProviderCandidate[] = [
      ...(kazanan === null
        ? []
        : [
            {
              providerId: kazanan.providerId,
              capability: s.capability ?? '',
              selected: true,
              rejectionReason: null,
              estimatedCost: kazanan.cost,
            },
          ]),
      ...(yonlendirme?.rejected ?? []).map((r) => ({
        providerId: r.providerId,
        capability: s.capability ?? '',
        selected: false,
        rejectionReason: rejectionMessage(r.reason),
        estimatedCost: null,
      })),
    ]

    // ⚠ ⚠ **DEFTERDEN OYNATILAN ADIMIN ÇIKTISI MANİFESTE `null` GİRİYORDU.** Ücretsiz
    // bir adım defterden oynatıldığında `outcome.data` `null` dönüyor (doğru: çağrı
    // yapılmadı) ve kayıt o `null`ı yazıyordu. Manifest her geçişte YENİDEN yazıldığı
    // için son geçiş, önceki geçişin yazdığı gerçek çıktıyı SİLİYORDU.
    //
    // Ölçülen sonuç: `konu-sec` çıktısı manifeste `null` düştü → `islenmisKonular`
    // manifestten okuyor → seçilen konu hiç "işlenmiş" sayılmadı → aday listesinde
    // KALDI → bir sonraki koşu aynı konuyu seçti. Depo sahibinin ilk şikâyeti buydu:
    // *"hep aynı konuyu seçiyor"*. Çeşitlilik mekanizmasının kör noktası, bu turda
    // eklenen defterden-oynatma düzeltmesinin yan etkisiydi.
    //
    // Etkin çıktı ARTIK KAYITTAN ÖNCE hesaplanıyor: taze varsa o, yoksa diskteki.
    const diskYolu = runOutputDir(input.repoRoot, input.runId)
    const tazeCikti = sonuc.ok ? (sonuc.outcome?.data ?? null) : null
    let etkinCikti: unknown = tazeCikti
    if (sonuc.ok && tazeCikti === null) {
      etkinCikti = adimCiktisiniOku(diskYolu, id, baytDeposu)
      if (etkinCikti !== null) input.iz?.(`  ↺ ${id} çıktısı defterden okundu`)
    }

    kayitlar.push({
      stepId,
      verb: verbAdi,
      // ⚠ **ÜÇ durum, üç anlam** (FAZ-14.5). `atlandi` taşıyan bir çıktı, adımın
      // KOŞTUĞUNU ama işini YAPMADIĞINI söylüyor — plan yuva açmadıysa görsel brief'i
      // üretilmez ve bu bir başarı da değildir, bir hata da. `ok` demek defterde
      // "brief üretildi" yalanı bırakırdı; `failed` demek doğru bir kararı hata
      // gibi gösterirdi. `StepStatus` bu üçlüyü kernel'de zaten taşıyordu (§13);
      // eksik olan onu ÜRETEN yoldu.
      // ⚠ Defterden oynatıldı ama ÖNCEKİ KAYIT YOKSA (manifest kayıp, defter duruyor)
      // `ok` demek "bu geçişte sağlayıcı seçildi ve ödendi" iddiası olurdu; `skipped`
      // dürüst olanı: adım koştu, çağrı yapılmadı, çıktı defterden geldi.
      status: sonuc.ok
        ? defterdenSaglayicisiz && oncekiKayit === null
          ? 'skipped'
          : (sonuc.outcome?.data as { atlandi?: unknown } | null)?.atlandi === true
            ? 'skipped'
            : 'ok'
        : 'failed',
      lane: s.constraints['lane'] === 'premium' ? 'premium' : 'free',
      capability: s.capability,
      providerId:
        kazanan?.providerId ?? (defterdenSaglayicisiz ? (oncekiKayit?.providerId ?? null) : null),
      model: null,
      seed: null,
      params: s.constraints,
      estimatedCost: tahmin,
      // **Gerçek maliyet tahminden KOPYALANMAZ** (§8.3). Adım koşmadıysa `null`.
      actualCost:
        sonuc.outcome?.amount ?? (defterdenSaglayicisiz ? (oncekiKayit?.actualCost ?? null) : null),
      candidates:
        defterdenSaglayicisiz && oncekiKayit !== null ? oncekiKayit.candidates : adaylarKaydi,
      startedAt: baslangic,
      finishedAt: clock.nowIso(),
      // **Adım çıktısının ÖZETİ manifest'e girer** (D-136). İlk sürümde QA raporu
      // yalnız konsola basılıyordu; "QA skorları manifest'te" çıkış kriteri
      // karşılanmıyordu ve altı ay sonra "bu görsel hangi ölçümlerle geçti"
      // sorusunun cevabı hiçbir yerde yoktu.
      // Tam çıktı DEĞİL özet: bir belge modelini manifest'e gömmek dosyayı şişirir ve
      // `git diff`i okunamaz yapar. Özet, ölçülebilir olanı taşır.
      output: ozetle(etkinCikti ?? null),
      // ⚠ Yalnız başarısızlıkta ve yalnız ÜÇ ALAN: `details` sağlayıcı gövdesi ya da
      // prompt parçası taşıyabilir ve defter git'e giriyor (§3.5 · §14).
      ...(sonuc.ok
        ? {}
        : {
            error: {
              kind: String((sonuc as { error?: { kind?: unknown } }).error?.kind ?? 'unknown'),
              code: String((sonuc as { error?: { code?: unknown } }).error?.code ?? 'UNKNOWN'),
              message: String(
                (sonuc as { error?: { userMessageKey?: unknown } }).error?.userMessageKey ?? ''
              ),
            },
          }),
    })

    if (sonuc.ok) {
      // ⚠ ⚠ **DEFTERDEN OYNATILAN ADIMIN ÇIKTISI DİSKTEN GELİYOR.** Ücretli bir adım
      // ikinci kez koşulduğunda maliyet defteri "bu iş bitti" deyip çağrıyı atlıyor ve
      // `data: null` dönüyor — doğru davranış, çift ödeme olmasın. Ama çıktı da yok
      // oluyordu ve aşağı akış boş kalıyordu: insan `metin-onayi`ni onaylıyor, hat
      // `--devam` ile sürüyor ve `bilgi-sec` `MISSING_TOPIC` ile düşüyordu — agent'ın
      // seçtiği konu buharlaşmıştı. Aynı sebeple `sablon-uyarla` daha önce
      // `ADAPTATION_UNPARSEABLE` vermişti. **Her kapı, arkasındaki zinciri sessizce
      // kesiyordu.**
      //
      // Defterin işi ÖDEMEYİ tekrarlamamak; işin SONUCUNU unutmak değil.
      if (tazeCikti === null) {
        ciktilar[id] = etkinCikti
      } else {
        ciktilar[id] = tazeCikti
        // ⚠ ÇIKTI özeti de basılıyor: girdi özeti "hangi adımdan sonra kaydı"
        // sorusunu cevapladı ama "kimin çıktısı değişti" sorusunu cevaplayamadı.
        // İki geçişte aynı adımın çıktı özeti farklıysa kararsızlık ORADA.
        input.iz?.(`  ↳ ${id} çıktı [${digest(id, JSON.stringify(tazeCikti)).slice(0, 8)}]`)
        // ⚠ **"Atlandı" bir hata DEĞİL.** Gömülü byte taşıyan çıktı bilerek
        // yazılmıyor (byte `derived/blobs`ta, adım sürdürmede yeniden koşuyor);
        // onu uyarı olarak basmak, doğru olmayan bir alarm üretir ve gürültülü
        // uyarı okunmaz olur. Yalnız GERÇEK başarısızlık uyarıyor.
        if (adimCiktisiniYazDurum(diskYolu, id, tazeCikti, baytDeposu) === 'yazilamadi') {
          input.iz?.(`  ⚠ ${id} çıktısı diske YAZILAMADI — tekrar oynatmada kaybolur`)
        }
      }
      // Dış metin karantinaya indiyse §14 sınırı BUNDAN SONRAKİ metered fiiller için
      // devreye girer: taze dış metin varken insan onayı olmadan para harcanamaz,
      // yayın yapılamaz. Sınır fiil ÇALIŞMADAN ÖNCE sorulur (`runVerb`).
      const d = ciktilar[id] as {
        fetchedAt?: unknown
        sourceRef?: unknown
        domain?: unknown
      } | null
      if (d !== null && typeof d?.fetchedAt === 'string') {
        tazeDisBelgeler.push({
          domain: typeof d.domain === 'string' ? d.domain : 'bilinmiyor',
          sourceRef: typeof d.sourceRef === 'string' ? d.sourceRef : 'bilinmiyor',
          fetchedAt: d.fetchedAt,
          // Metin karantinada, DİSKTE. Sınır onu okumaz — konumsaldır, içeriğe bakmaz
          // (nötrleştirme kasten yok: atlatılan bir filtre olmayan filtreden kötüdür).
          text: '',
        })
      }
      continue
    }

    if (sonuc.error !== null) hatalar.push({ stepId, error: sonuc.error })
    if (!isteğeBagli(s)) {
      durduguYer = stepId
      break
    }
    // İsteğe bağlı adım düştü: kayıt tutuldu, hata listelendi, hat DEVAM ediyor.
    ciktilar[id] = null
  }

  // Adım kayıtları BİRLEŞTİRİLİR: bu koşuda yeniden koşmayan adımların önceki kaydı
  // korunur. Sıra önceki manifest'in sırasını izler; yeni adımlar sona eklenir.
  const oncekiAdimlar = input.previous?.steps ?? []
  const yeniIds = new Set(kayitlar.map((k) => String(k.stepId)))
  const birlesik: StepRecord[] = [
    ...oncekiAdimlar.filter((o) => !yeniIds.has(String(o.stepId))),
    ...kayitlar,
  ]

  const manifest: RunManifest = {
    runId: input.runId,
    brandId: input.brandId,
    eraId: input.eraId,
    pipeline: input.pipeline.id,
    corpusCommit: input.corpusCommit,
    registryCommit: input.registryCommit,
    // İlk çalıştırmanın zamanı KORUNUR: `createdAt` çalıştırmanın doğum anıdır,
    // son denemenin değil.
    createdAt: input.previous?.createdAt ?? clock.nowIso(),
    steps: birlesik,
    decisions: input.decisions ?? [],
    context: input.context ?? [],
    contextRetentionDays: 90,
    // Nerede ve NEDEN durduğu manifeste yazılır: süreç bittiğinde rapor nesnesi
    // kaybolur, manifest kalır — ve onay kuyruğu diskten okur (FAZ-4.7).
    awaitingGate: bekleyenKapi,
    stoppedAt: durduguYer,
  }

  // Manifest HER HÂLÜKÂRDA yazılır: yarıda kalan bir hattın ne kadar harcadığı ve
  // nerede durduğu, başarılı bir hattınki kadar önemli.
  const yazim = writeManifest({ repoRoot: input.repoRoot, manifest })

  // **Donmuş plan da diske düşer** (FAZ-4.15). Manifest "ne oldu"yu yazar; onay anındaki
  // KARAR (hangi sağlayıcı, hangi kısıt, hangi seed, hangi kayıt kümesi) yalnız burada
  // kalıcılaşır. Yazmasaydık `rerun` düğmesi sessizce `replay`e dönerdi — kararı değil,
  // bugünün tanımını tekrarlardı — ve ekran bunu bilemezdi.
  if (input.frozen !== undefined && input.frozen !== null) {
    writeFrozenPlan(input.repoRoot, input.frozen)
  }

  return {
    runId: input.runId,
    manifest,
    manifestWrite: yazim,
    stoppedAt: durduguYer,
    errors: hatalar,
    awaitingGate: bekleyenKapi,
    budget: bState,
    outputs: ciktilar,
  }
}

/** Rapor özeti — CLI bunu basar. */
export const formatRun = (r: RunReport): string => {
  const satirlar: string[] = []
  satirlar.push(`  çalıştırma ${r.runId}  ·  ${r.manifest.pipeline}`)
  satirlar.push('')
  for (const s of r.manifest.steps) {
    const h = r.errors.find((e) => e.stepId === s.stepId)
    const isaret = h === undefined ? '✓' : '✗'
    const tutar =
      s.actualCost === null ? '—' : `$${(Number(s.actualCost.micros) / 1_000_000).toFixed(4)}`
    satirlar.push(
      `  ${isaret} ${String(s.stepId).padEnd(14)} ${s.verb.padEnd(9)} ` +
        `${(s.providerId ?? '—').padEnd(22)} ${tutar}`
    )
    if (h !== undefined) {
      satirlar.push(
        `      ${h.error.code}${h.error.details === undefined ? '' : `: ${JSON.stringify(h.error.details)}`}`
      )
    }
  }
  satirlar.push('')
  if (r.awaitingGate !== null) {
    satirlar.push(`  ⏸ insan kapısında durdu: ${r.awaitingGate} — onay bir kapıdır (§4c)`)
  } else if (r.stoppedAt !== null) {
    satirlar.push(`  ✗ ${r.stoppedAt} adımında durdu`)
  } else {
    satirlar.push('  ✓ hat sonuna kadar koştu')
  }
  satirlar.push(
    r.manifestWrite.ok
      ? `  manifest: ${r.manifestWrite.path}`
      : `  ✗ manifest YAZILAMADI: ${r.manifestWrite.defects.map((d) => d.kind).join(', ')}`
  )
  return satirlar.join('\n')
}
