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
  runStep,
  runScope,
  type StepSpec,
  type StepCall,
  type StepResult,
  type CallOutcome,
  type EngineDeps,
} from './scheduler.js'
