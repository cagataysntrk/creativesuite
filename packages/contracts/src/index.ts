// Ring -1 — CONTRACTS. Bu paket HİÇBİR ŞEY import etmez (§3.1).
// `package.json` → `dependencies` YOK; halka sınırının en dış katmanı budur.

export type { RingName, PackageIdentity } from './identity.js'
export { RING_ORDER, IDENTITY } from './identity.js'

export type {
  Brand,
  RunId,
  JobId,
  RecordId,
  AssetId,
  BrandId,
  EraId,
  StepId,
  ProviderId,
  ChannelId,
  PipelineId,
  EntityTypeId,
  CorrelationId,
  IdKind,
} from './brand.js'
export { ID_PREFIXES } from './brand.js'

export type { Currency, Money, MoneyRange } from './money.js'
export { MICROS_PER_USD, usd, ZERO_USD, addMoney, scaleMoney } from './money.js'

export type { Ok, Err, Result } from './result.js'
export { ok, err, isOk, isErr, mapOk } from './result.js'

export type { Islev, RitimOranlari, YayBulgusu } from './senaryo.js'

export type {
  AileAdi,
  OgePolitikasi,
  PlanKusuru,
  Secim,
  SlaytPolitikasi,
  TasarimPlani,
} from './tasarim-plani.js'
export { OGE_POLITIKALARI, planGecerli, planKusurlari } from './tasarim-plani.js'

export type { BantTarifi, GorselIhtiyaci, KatalogSablonu } from './katalog.js'
export {
  KATALOG,
  VERI_HIKAYESI,
  AKAN_ALAN,
  SAHNE,
  MEMPHIS,
  DONEN,
  EDITORYAL,
  kullanilabilirSablonlar,
  sablonBul,
} from './katalog.js'
export type { Bolge, CizgiDili, Iskelet, IskeletKusuru, TipoIliskisi } from './iskelet.js'
export { iskeletKusurlari } from './iskelet.js'
export type {
  AileKimligi,
  AileProfili,
  AileKusuru,
  Yerlesim,
  AlanSemasi,
  SinirBicimi,
  HayaletBicimi,
} from './aile.js'
export {
  AILELER,
  TEMEL_AILE,
  AKICI_AILE,
  MEMPHIS_AILE,
  GECE_AILE,
  DONEN_AILE,
  EDITORYAL_AILE,
  KESIT_AILE,
  IZGARA_AILE,
  SINIR_BICIMLERI,
  HAYALET_BICIMLERI,
  aileBul,
  aileKusurlari,
} from './aile.js'
export {
  ISLEVLER,
  VARSAYILAN_RITIM,
  GOVDE_TAVANI,
  islevTavanlari,
  yay,
  slaytIslevi,
  yayTalimati,
  yayiDogrula,
} from './senaryo.js'

export type { ErrorKind, AppError } from './errors.js'
export { ERROR_KINDS } from './errors.js'

export type {
  OpaqueAttributes,
  RecordKind,
  RecordZone,
  RecordStatus,
  SourceKind,
  RecordSource,
  RecordScope,
  Timestamp,
  RecordEnvelope,
} from './envelope.js'
export { RECORD_KINDS, RECORD_ZONES, RECORD_STATUSES, SOURCE_KINDS } from './envelope.js'

export type { VerbName, EffectClass, VerbSpec, VerbTable, CostEvent, VerbPlan } from './verbs.js'
export { VERBS, EFFECT_CLASSES } from './verbs.js'

// Türkçe metin primitifleri — sunucu ve tarayıcı AYNI katlamayı kullanır (D-165).
export {
  upper,
  lower,
  sentenceCase,
  asciiLower,
  asciiUpper,
  foldForSearch,
  slug,
  syllables,
  softHyphenate,
} from './text-tr.js'

// Tolerans okuması — ölçen (render) ile gösteren (ui) ortak sözlüğü (D-175).
export type { ToleranceStatus, ToleranceReading, QaReport } from './tolerance.js'

// Platform yerleşim spec'i — ölçen (render) ile gösteren (ui) ortak sözlüğü (D-176).
export type { KaroselTuvali, Placement, SafeArea, SafeBand } from './placement.js'
// Karosel tuvali TEK sözleşme sabiti (R-91): `1350` altı ayrı dosyada kopyalanmıştı.
export { TUVAL_3_4, TUVAL_4_5, VARSAYILAN_TUVAL } from './placement.js'
// Yayın platformları ve GERÇEK sınırları — araştırıldı, uydurulmadı (madde 3).
export {
  MUZIK_KURALI,
  PLATFORMLAR,
  kusurEngelliyorMu,
  platformBul,
  platformDenetle,
  type PlatformId,
  type PlatformKusuru,
  type PlatformSiniri,
} from './platform.js'
// İçerik kipi: üretilenin NEREDEN geldiği — firma kaydı mı, genel bilgi mi (madde 7).
export { ICERIK_KIPLERI, icerikKipiCozumle, kipTarifi, type IcerikKipi } from './icerik-kipi.js'
// Görüntü ölçüsü BAYTTAN okunuyor — beyandan değil (madde 8).
export { goruntuOlcusu, type GoruntuOlcusu } from './goruntu-olcu.js'

// Keşif planı — motor ile inceleme ekranı ortak sözlüğü (D-177).
export type {
  OpKind,
  OpReason,
  ReconcileColumn,
  DiscoveryOpView,
  HaltedRecord,
} from './discovery.js'
export { LAYOUTS, type LayoutName } from './layout.js'
