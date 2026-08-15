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
