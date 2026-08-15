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
} from '@suite/contracts'

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
  type StepStatus,
  type ContextManifestEntry,
  type RunManifest,
  type ManifestDefect,
  type CostSummary,
  RUNS_DIR,
  runDir,
  manifestPath,
  planPath,
  publishedLedgerPath,
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

export { spawnProcess, commandExists, type SpawnOptions, type SpawnResult } from './proc/spawn.js'

export { readEnv, envFlag } from './config/env.js'

export {
  compile,
  toForm,
  toTypeScript,
  toLlmSchema,
  toSqliteDdl,
  type Projections,
  type FormProjection,
} from './projection/compile.js'
export {
  validateSchema,
  FORBIDDEN_KEYWORDS,
  type SchemaNode,
  type EntityTypeSchema,
  type CompileError,
  type CompileResult,
} from './projection/types.js'

export { log, setSink, type LogEvent, type LogLevel, type Sink } from './log.js'
export { fromFileUrl, moduleDir, repoRootFrom, underRoot } from './paths.js'

export { SCHEMA_REGISTRY } from './schema/registry.js'
export type { SchemaEntry } from './schema/registry.js'

// `untrusted_input` sınırı (§14 · R-50 · FAZ-2.3b)
export {
  quarantineDir,
  untrustedSection,
  ingestGate,
  type UntrustedDocument,
  type IngestGateInput,
  type IngestGateDecision,
} from './ingest/boundary.js'

// Git — TEK çağırıcı (§3.8 · §5.4 · FAZ-2.4). `commit` YOK: onay insanın eylemidir.
export {
  headSha,
  currentBranch,
  isClean,
  changedPaths,
  fileHistory,
  isIgnored,
  type GitOptions,
  type GitFailure,
  type GitResult,
} from './git.js'

// Dönem modeli ve varlık damgası (§4.3 · R-11 · FAZ-2.6)
export {
  eraDir,
  eraManifestPath,
  currentEraPath,
  eraTag,
  lineagePath,
  validateEra,
  validateStamp,
  type EraManifest,
  type EraStatus,
  type EraError,
  type EraResult,
  type AssetStamp,
} from './era.js'

// Belge modeli — `RENDER`ın gördüğü tek şey (§7.1 · FAZ-3.1)
export {
  validateDocument,
  type Block,
  type BlockType,
  type DocError,
  type DocResult,
  type DocumentKind,
  type DocumentModel,
  type ImageBlock,
} from './doc/model.js'

// Tek HTTP istemcisi (§3.8). Barrel'dan açılıyor ki Ring 1 sağlayıcıları kendi
// `fetch`ini yazmak zorunda kalmasın — ikinci bir istemci çevrimdışı modu yalan yapar.
export { httpFetch, type HttpRequest } from './net/http.js'
