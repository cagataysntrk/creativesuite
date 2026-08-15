export {
  buildPlan,
  formatPlan,
  type DiscoveryMode,
  type DiscoveryOp,
  type DiscoveryPlan,
  type OpKind,
  type ExistingRecord,
  type CandidateRecord,
  type CandidateField,
} from './plan.js'

export {
  parseLedger,
  appendLine,
  suppression,
  type DecisionEntry,
  type DecisionKind,
  type StickyLedger,
  type Suppression,
} from './decisions.js'

export { skipSignature, unchanged, type SkipSignatureInput } from './idempotent.js'

export {
  applyPlan,
  formatApply,
  reviewOps,
  type ApplyOutcome,
  type ApplyReport,
  type OpContent,
} from './apply.js'
