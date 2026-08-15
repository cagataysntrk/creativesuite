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

export { systemClock, fixedClock, manualClock, type Clock, type Millis } from './time/clock.js'
export { systemRng, seededRng, type Rng } from './rng.js'
export { uuidv7, newId, hasKind, stripPrefix } from './ids.js'
export { openDb, migrate, schemaVersion, setSchemaVersion, type Db, type Migration } from './db.js'
export {
  TRANSITIONS,
  transition,
  canTransition,
  isTerminal,
  statesOf,
  type MachineName,
  type StateOf,
  type NextOf,
} from './fsm/machines.js'
export {
  QUEUE_MIGRATIONS,
  enqueue,
  lease,
  setState,
  retryOrFail,
  getJob,
  countByState,
  type Job,
  type JobState,
} from './queue.js'

export {
  inspectManifest,
  isPublishable,
  costSummary,
  type Lane,
  type ProviderCandidate,
  type HumanDecision,
  type StepRecord,
  type ContextManifestEntry,
  type RunManifest,
  type ManifestDefect,
  type CostSummary,
} from './manifest.js'

export {
  notImplemented,
  validateVerbOutput,
  ZERO_RANGE,
  type Verb,
  type VerbContext,
  type VerbOutput,
} from './verbs/types.js'
export {
  VERB_TABLE,
  EFFECT_OF,
  METERED_OF,
  getVerb,
  fingerprint,
  type VerbFingerprint,
} from './verbs/table.js'

export { parseYaml, stringifyYaml, type YamlParseResult } from './yaml.js'

export { SCHEMA_REGISTRY } from './schema/registry.js'
export type { SchemaEntry } from './schema/registry.js'
