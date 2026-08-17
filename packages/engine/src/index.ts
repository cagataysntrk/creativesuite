// Ring 2 — ENGINE. Zamanlama, retry, bütçe, maliyet defteri (§8.5).
// Alt halkaların hepsini görür; ui ve apps'i görmez.
import type { PackageIdentity } from '@suite/contracts'
import { IDENTITY as kernel } from '@suite/kernel'
import { IDENTITY as registry } from '@suite/registry'
import { IDENTITY as corpus } from '@suite/corpus'
import { IDENTITY as providers } from '@suite/providers'
import { IDENTITY as render } from '@suite/render'

export const IDENTITY: PackageIdentity = { name: '@suite/engine', ring: 'engine' }

/** Motorun bağlı olduğu halkalar — project reference zincirinin canlı kanıtı. */
export const WIRED: readonly PackageIdentity[] = [kernel, registry, corpus, providers, render]

export {
  decideRetry,
  parseRetryAfter,
  DEFAULT_RETRY,
  type RetryPolicy,
  type RetryDecision,
} from './retry.js'

export {
  CircuitBreaker,
  breakerKey,
  DEFAULT_BREAKER,
  type BreakerState,
  type BreakerConfig,
} from './breaker.js'

export {
  initLedger,
  reserve,
  settle,
  reopen,
  getEntry,
  runTotals,
  LEDGER_MIGRATIONS,
  type ChargeStatus,
  type LedgerEntry,
  type RunTotals,
} from './cost/ledger.js'

export {
  lease,
  settleLease,
  emptyBudget,
  refusalMessage,
  type BudgetCaps,
  type BudgetState,
  type BudgetRefusal,
  type LeaseResult,
} from './budget.js'

export { idempotencyKey, digest, type IdempotencyInput } from './idempotency.js'

export {
  plan,
  formatPlan,
  type PlanInput,
  type PlanReport,
  type PlanResult,
  type PlanError,
  type PlannedStep,
} from './plan.js'

export { runVerb, type VerbCallResult } from './run-verb.js'

export {
  runStep,
  runScope,
  type StepSpec,
  type StepCall,
  type StepCallContext,
  type StepResult,
  type CallOutcome,
  type EngineDeps,
} from './scheduler.js'

// Bağlam birleştirme (§5.3 · FAZ-2.3)
export {
  estimateTokens,
  assembleContext,
  type AssembleOptions,
  formatContext,
  type CandidateRecord,
  type ContextManifest,
  type IncludedRecord,
  type SectionManifest,
} from './context/index.js'

// Keşif motoru (§4.4 · FAZ-2.7). `formatPlan` adı çakışıyor: pipeline planı ile
// keşif planı ayrı şeylerdir ve ikisi de "plan" adını hak ediyor.
export {
  buildPlan as buildDiscoveryPlan,
  formatPlan as formatDiscoveryPlan,
  type DiscoveryMode,
  type DiscoveryOp,
  type DiscoveryPlan,
  type OpKind,
  type OpReason,
  columnOf,
  byColumn,
  COLUMN_LABELS,
  type ReconcileColumn,
  type ExistingRecord,
  type CandidateRecord as DiscoveryCandidate,
} from './discovery/index.js'

export {
  parseLedger,
  appendLine as appendDecision,
  suppression,
  skipSignature,
  unchanged,
  type DecisionEntry,
  type DecisionKind,
  type StickyLedger,
  type Suppression,
  type SkipSignatureInput,
  applyPlan,
  formatApply,
  reviewOps,
  type ApplyOutcome,
  type ApplyReport,
  type OpContent,
} from './discovery/index.js'

// Fiil gövdelerinin motora bağlandığı yer (§3.10 · FAZ-3.1)
export { resolveVerb, type VerbImplementations } from './verbs/registry.js'

export { evaluateFormula, type FormulaError, type FormulaResult } from './router/formula.js'
export {
  route,
  totalEstimate,
  pricingFromDescriptor,
  type CapabilityRequest,
  type ProviderPricing,
  type Prefer,
  type Priced,
  type Rejected,
  type RejectionReason,
  type RoutingDecision,
} from './router/route.js'
export { rejectionMessage } from './router/reasons.js'
export { displayTry, displayUsd, type RateSnapshot } from './router/rate.js'

export {
  providerCall,
  DEFAULT_POLL,
  type PollPolicy,
  type ProviderCallDeps,
} from './provider-call.js'

export {
  RateLimiter,
  DEFAULT_BUCKET,
  OKUMA_PUANI,
  YAZMA_PUANI,
  bucketKey,
  rateLimitError,
  type BucketConfig,
  type RateDecision,
} from './ratelimit.js'

// İçerik-adresli varlık deposu (§3.5 · D-118).
//
// **Neden `corpus` değil `engine`:** `derived/blobs` bir corpus kaydı değil, bir
// çalıştırma çıktısıdır. `corpus-yazici` darboğazı `packages/corpus/src/**` altındaki
// HER yazmayı reddediyor — haklı olarak: orada ikinci bir yazma yolu, onay kuyruğunu
// atlayan bir yoldur. Blob yazıcısı corpus'a hiç dokunmuyor ve motor zaten
// `derived/runs` ile maliyet defterini yazıyor; doğru komşu burası.
export {
  storeBlob,
  readBlobMeta,
  verifyBlob,
  blobPath,
  metaPath,
  GIT_SIZE_LIMIT,
  type BlobRef,
  type BlobMeta,
  type DeliverableRef,
  type BlobDefect,
  type StoreInput,
  type StoreResult,
} from './blobs.js'

export {
  writeManifest,
  readManifest,
  writeFrozenPlan,
  readFrozenPlan,
  canPublish,
  costVariance,
  knowledgeCommit,
  runOutputDir,
  type WriteInput,
  type WriteResult,
  type CostVariance,
  defterReplacer,
} from './manifest-writer.js'

export { runPipeline, formatRun, type RunInput, type RunReport } from './run.js'
export { toManifestEntries } from './context/assemble.js'

// Strateji sağlığı — kapı ile pano AYNI kuralları çağırır (FAZ-4.16).
export {
  stratejiSagligi,
  kanitReferansi,
  sayisalIddiaVar,
  govdedenAlan,
  YASAK_TERIMLER,
  type Bulgu,
  type BulguTuru,
  type SaglikGirdisi,
  type StratejiSagligi,
} from './saglik/strateji.js'

export {
  doktorRaporu,
  doktorMetni,
  type DoktorAlani,
  type DoktorBulgusu,
  type DoktorGirdisi,
  type DoktorRaporu,
} from './saglik/doktor.js'

export {
  resolveBody,
  selectBody,
  composeBody,
  ingestBody,
  publishBody,
  YAYIN_YETENEGI,
  proposeBody,
  renderBody,
  validateBody,
  type PublishBodyDeps,
  generateBody,
  type BodyInput,
  type SelectDeps,
  type ComposeDeps,
  type IngestDeps,
  type RenderDeps,
  type ValidateDeps,
  type GenerateDeps,
} from './verbs/bodies.js'

// Plan dondurma — onaylanan plan ile koşan plan AYNI olmak zorunda (R-07).
export {
  freezePlan,
  planStale,
  staleMessage,
  launchBlocks,
  blockMessage,
  type FrozenPlan,
  type FrozenStep,
  type FreezeInput,
  type StaleCheck,
  type StaleReason,
  type LaunchBlock,
} from './plan/freeze.js'

// `prospect-deck` zinciri (FAZ-6.9). YENİ KURAL YAZMAZ — beş kapının sırasını kurar ve
// ilk hatada durur; her kural kendi sahibinde yaşıyor.
export {
  DECK_KAPI_SIRASI,
  prospectDeckZinciri,
  type DeckKapisi,
  type ProspectDeckInput,
  type ProspectDeckSonucu,
} from './prospect-deck.js'

// Koşu künyesi — manifest'ten ÖNCE yazılır; kesintiye uğramış koşu künyesiz koşudan
// ayırt edilebilsin diye (FAZ-7.1 denetimi).
export { tasarla, VARSAYILAN_AILE, type TasarlaGirdisi } from './plan/tasarla.js'
// ⚠ Katalog merkezli seçim (D-268). `tasarla` hâlâ burada çünkü slayt-başına yol henüz
// emekli değil (FAZ-15.9); iki seçici bir arada duruyor ve bu GEÇİCİ bir durum.
export {
  icerikSekli,
  sablonSec,
  type IcerikSekli,
  type SablonPuani,
  type SablonSecimi,
  type SecimKosullari,
} from './plan/sablon-sec.js'
export {
  uyarla,
  uyarlamaIstemi,
  type Uyarlama,
  type UyarlamaKarti,
  type UyarlamaSonucu,
} from './plan/sablon-uyarla.js'
export { readRunStub, stubPath, writeRunStub, type RunStub } from './manifest-writer.js'

// Yayın defteri (FAZ-7.4). TÜRETİLEMEZ (D-38): silinirse yayın durur, boş sayılmaz.
export {
  appendPublished,
  initLedgerFile,
  ledgerPath,
  lookupPublished,
  readLedger,
  type LedgerError,
  type LedgerResult,
  type PublishedEntry,
} from './publish-ledger.js'

// Insight defteri — türetilemez ölçüm (§13 · D-220 · FAZ-7.8).
export {
  INSIGHT_UFKU_GUN,
  appendInsight,
  bosluklar,
  insightAnahtari,
  insightLedgerPath,
  insightTazeligi,
  readInsights,
  type Bosluk,
  type InsightHatasi,
  type InsightSatiri,
  type InsightSonucu,
  type TazelikRaporu,
  type YazmaSonucu,
} from './insight-ledger.js'

// Performans panosu ve geri besleme (§13, §11.2 · FAZ-7.9).
export {
  PENCERE_GUN,
  durumMesaji as performansDurumMesaji,
  hookOnerisi,
  pencereDurumu,
  performansPanosu,
  type HookOnerisi,
  type PanoGirdisi,
  type PerformansPanosu,
  type PerformansSatiri,
  type SiralamaDurumu,
} from './performans.js'

// Reklam varyant matrisi — diklik OFAT'la ölçülür (§10 · D-4 · FAZ-8.1).
export {
  matrisDenetle,
  matrisHataMesaji,
  varyantSayisi,
  varyantUret,
  type Eksen,
  type MatrisGirdisi,
  type MatrisHatasi,
  type MatrisModu,
  type Varyant,
} from './matris.js'

// Proaktif katman — öneri, üretim değildir (§10 · D-10 · FAZ-8.5).
export {
  BOS_TAKVIM_GUN,
  ONERI_TAVANI,
  haftalikOneriler,
  oneriMesaji,
  type Oneri,
  type OneriGirdisi,
  type OneriKanidi,
  type OneriSonucu,
} from './proactive/oneri.js'

// Uyum iddiasının kapsamı hattan okunur — sabit değil (§11.3 · D-232 · FAZ-8.3).
export {
  uyumKapsami,
  taranacakPrompt,
  GORSEL_YETENEK_ONEKLERI,
  type UyumKapsami,
} from './uyum-kapsami.js'

// Varyant genişletme — plan ve koşu AYNI genişletmeyi okur (§10 · D-240 · FAZ-8.1b).
export {
  varyantlaGenislet,
  kosumSayilari,
  VARYANT_AYRAC,
  type GenisletmeSonucu,
} from './varyant-genislet.js'

// `GENERATE`in metin girdisi ve çıktısı — prompt kaynağı + `{lines}` normalizasyonu.
export {
  icerikPromptu,
  gorselBriefPromptu,
  metneCevir,
  duzMetin,
  type PromptGirdisi,
  type PromptKaydi,
} from './metin-akisi.js'
// Görsel yargı — `image.critique` (FAZ-10.5 · D-256)
export {
  yargiPromptu,
  yargiyaCevir,
  bulguSatiri,
  YARGI_KATEGORILERI,
  YARGI_SIDDETLERI,
  type YargiBulgusu,
  type YargiSonucu,
  type YargiGirdisi,
  type YargiKategorisi,
  type YargiSiddeti,
} from './gorsel-yargi.js'
export {
  PUAN_TAVANI,
  TASARIM_KATEGORILERI,
  tasarimYargiPromptu,
  tasarimYargisinaCevir,
  toplamPuan,
  ayniAralikta,
} from './tasarim-yargi.js'
export type { TasarimKategorisi, TasarimPuani, TasarimYargisi } from './tasarim-yargi.js'
