// Ring 0 — KERNEL. Sabit kavramlar ve dokuz fiil (§3.10). Yalnız contracts'a bakar.
import type { PackageIdentity } from '@suite/contracts'

export const IDENTITY: PackageIdentity = { name: '@suite/kernel', ring: 'kernel' }

export {
  RecordEnvelopeSchema,
  RecordSourceSchema,
  RecordScopeSchema,
  envelopeJsonSchema,
  TIP_SEMAYA_UYUYOR,
  SEMADA_FAZLA_ALAN_YOK,
  SEMADA_EKSIK_ALAN_YOK,
} from './schema/envelope.js'

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
} from './text/case.js'

export { panic, InvariantViolation } from './errors/panic.js'
export { makeError, type MakeErrorInput } from './errors/make.js'
export {
  classify,
  assertNever,
  policyMatchesError,
  allKindsClassified,
  withCost,
  type BackoffKind,
  type ErrorPolicy,
} from './errors/classify.js'
export { chainOf, formatChain, rootCause, fromUnknown, type ChainLink } from './errors/chain.js'

export { SCHEMA_REGISTRY } from './schema/registry.js'
export type { SchemaEntry } from './schema/registry.js'
