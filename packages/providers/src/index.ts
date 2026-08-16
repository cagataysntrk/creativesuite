// Ring 1 — PROVIDERS. Sağlayıcı adaptörleri (§8.4).
import type { PackageIdentity } from '@suite/contracts'

export const IDENTITY: PackageIdentity = { name: '@suite/providers', ring: 'providers' }

export type {
  Lane,
  CapabilityDecl,
  ProviderInput,
  ValidatedInput,
  JobHandle,
  JobStatus,
  ProviderContext,
  ProviderAdapter,
} from './types.js'

export { claudeCode } from './claude-code.js'
// Ham liste DIŞA AÇILMAZ (§3.8). Açılsaydı her paket kendi sağlayıcı kümesini
// kurabilirdi ve o küme yönlendiriciyi de maliyet defterini de atlardı. Dışarıya
// yalnız erişimciler açılır — kapı bu satırı bir kez zaten yakaladı.
export { candidatesFor, adapterById, allCapabilities, type Candidate } from './registry.js'

export {
  parseDescriptor,
  loadDescriptors,
  type DescriptorCapability,
  type DescriptorError,
  type DescriptorResult,
  type ProviderDescriptor,
  descriptorDigests,
} from './descriptor.js'
export {
  importOpenApi,
  draftToYaml,
  type ImportedDraft,
  type ImportError,
  type ImportResult,
} from './import.js'

// `NO_TEXT_SUFFIX` BİLEREK dışa açılmıyor: dışarıdan ihtiyaç duyulan şey kurucudur
// (`buildImagePrompt`), ham ek değil. Sabiti dağıtmak, onu ikinci bir yerde
// birleştirmeyi kolaylaştırır — `gorsel-prompt-kurucu` darboğazının önlediği şey tam bu.
export {
  buildImagePrompt,
  hasNoTextSuffix,
  type ImagePrompt,
  type PromptRefusal,
} from './image/prompt.js'
export {
  ASPECTS,
  ASPECT_PIXELS,
  IMAGE_CAPABILITY,
  assertNoTextSuffix,
  imageCapability,
  rangeFromUnit,
  validateImageInput,
  type Aspect,
} from './image/lanes.js'
export { cloudflareImage } from './image/cloudflare.js'
export { falImage, FAL_UNIT_MICROS, FAL_UNIT_USD } from './image/fal.js'

// INGEST araştırma şelalesi (FAZ-6.5). Sınır `@suite/kernel/ingest/boundary`ta ve
// ikinci bir sınır YAZILMADI — iki sınır, birinin bir gün gevşemesi demektir.
export {
  SELALE,
  YASAKLI_KAYNAK,
  canFetch,
  planWaterfall,
  type IngestSource,
  type SourceKind,
  type SourceRefusal,
  type SourceState,
  type WaterfallPlan,
} from './ingest/waterfall.js'
export {
  buildProvenance,
  isProvenanceError,
  provenanceJson,
  quarantinePaths,
  verifyProvenance,
  type Provenance,
  type ProvenanceError,
  type ProvenanceInput,
} from './ingest/provenance.js'
export {
  fetchSource,
  htmlToText,
  isIngestFailure,
  slugFor,
  type FetchInput,
  type IngestArtifact,
  type IngestFailure,
} from './ingest/fetch.js'

// Yayınlama — TEK yayıncı (FAZ-7.2). Sıra tipe gömülü: dört kapı zorunlu parametre.
export {
  ALT_MAX,
  REQUIRED_SCOPES,
  YENILEME_PAYI_GUN,
  needsRefresh,
  publish,
  refusalMessage,
  type LedgerEntry,
  type PublishAsset,
  type PublishDeps,
  type PublishRefusal,
  type PublishRequest,
  type PublishSuccess,
  type PublishingLimit,
  type TokenState,
} from './publish.js'
