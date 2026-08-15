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
