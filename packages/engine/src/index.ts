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
  type StepResult,
  type CallOutcome,
  type EngineDeps,
} from './scheduler.js'

// Bağlam birleştirme (§5.3 · FAZ-2.3)
export {
  estimateTokens,
  assembleContext,
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
