# Sözleşmeler ve kapılar

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.


### Açık sorular

- HyperFrames launches its own Chrome or not — unverified by every researcher. If it does, the `only-chromium-launcher` chokepoint needs a second allowed file (`packages/render/src/hyperframes.ts`) and the render pool must wrap it, otherwise gate 6 either fails permanently or is quietly weakened. Resolve before FAZ-4 by reading its source, not its README.
- Where the run ledger actually lives. `derived/` is gitignored and provably rebuildable, but cost history and provider job handles are NOT derivable from corpus+registry — so `just reindex` must delete only `*.sqlite*` while `just reindex-drill` deletes everything. That makes `derived/` two things with two different guarantees. Cleaner alternative: move the ledger to `derived/runs/` and gitignore it but back it up separately, or make applied-run manifests committed (already the rule) and treat unapplied run cost as genuinely disposable. Needs a D-nn.
- TypeScript pin. The TS researcher says pin `6.0.3` because `typescript-eslint@8.67.0` declares `typescript: >=4.8.4 <6.1.0` and TS 7 (native Go) drops the JS compiler API that typed linting needs — which would silently switch `no-floating-promises` off. That is a hard dependency on one lint rule; confirm the peer range from the installed package before writing it into KARARLAR.md, and add gate 23's peer-mismatch check on day one so the failure mode is loud.
- Node 22 vs 24. Node 22 is Maintenance LTS as of 2026-08; `better-sqlite3` is a native addon compiled against a specific ABI, so the migration is a dated decision, not drift. Needs a D-nn with a calendar date, plus the `--experimental-strip-types`-free floor (`>=22.18.0`) written into `engines`.
- Golden strategy split. I ruled JSON metrics blocking and pixel diffs nightly-container-only, which means a genuine colour regression that does not move any box geometry (e.g. brand navy rendering as near-black through a colour-profile change) is caught a day late, not at push. Acceptable for a 6-person company; revisit if it ever ships to a client.
- The `verifiedAt`/`verifyEvery` frontmatter stamp for volatile external facts (prices, IG safe zones, API behaviours) has no home in the fixed doc tree — ANAYASA and FAZ files are not fact sheets, and `docs/research/` is deliberately frozen. Probably the right answer is that volatile facts live only in `registry/**` YAML with a `verified_at` key and are surfaced through `docs/referans/`, making the doc-level stamp unnecessary. Confirm before FAZ-2.
- Turkish calque linting via Vale needs a Turkish rule set that does not exist; only regex `substitution` rules work (Vale's NLP checks are English-only). Generating those rules from `registry/lexicon.yaml#forbidden_tr` is sound but unproven at scale — budget a spike, and keep it WARN until it has caught something real.


### TypeScript sözleşmeleri

/**
 * packages/contracts/src/index.ts
 *
 * Ring "-1". The ONLY package every other ring may import, and it imports nothing.
 * Compiles under tsconfig.base.json:
 *   strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride,
 *   noPropertyAccessFromIndexSignature, isolatedModules, verbatimModuleSyntax,
 *   erasableSyntaxOnly (=> no `enum`, no `namespace`, no parameter properties), target es2024.
 *
 * Citations: docs/ANAYASA.md section-3 (rings), section-6 (verbs), section-9 (cost),
 * section-12 (errors); KURALLAR.md R-01..R-08; KARARLAR.md D-03, D-07, D-11.
 */

/* ══════════════════════════ 1. Result ══════════════════════════
 * R-04: every exported function that performs I/O returns Result. `throw` is reserved
 * for programmer error and is legal only in this file and packages/kernel/src/errors/.
 */

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}
export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok;
}
export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return !r.ok;
}

/** Exhaustiveness guard. The ONLY sanctioned `throw` in contracts. */
export function assertNever(x: never, hint = "unreachable"): never {
  throw new Error(`${hint}: ${JSON.stringify(x)}`);
}

/* ══════════════════════════ 2. Brands & scalars ══════════════════════════
 * R-05: identifiers are never bare `string`. Brands are minted only by a parser.
 */

declare const BRAND: unique symbol;
export type Brand<T, B extends string> = T & { readonly [BRAND]: B };

export type RunId = Brand<string, "RunId">; // uuidv7, prefixed "run_"
export type StepId = Brand<string, "StepId">;
export type JobId = Brand<string, "JobId">;
export type RecordId = Brand<string, "RecordId">; // /^[a-z0-9][a-z0-9-]{1,63}$/
export type AssetId = Brand<string, "AssetId">;
export type ProviderId = Brand<string, "ProviderId">;
export type ChannelId = Brand<string, "ChannelId">;
export type RecipeId = Brand<string, "RecipeId">;
export type TemplateId = Brand<string, "TemplateId">;
export type EntityTypeId = Brand<string, "EntityTypeId">;
export type CapabilityName = Brand<string, "CapabilityName">; // e.g. "image.generate"
export type PromptTemplateId = Brand<string, "PromptTemplateId">;
export type Sha256 = Brand<string, "Sha256">; // 64 lowercase hex
export type PlanHash = Brand<string, "PlanHash">;
export type GitCommit = Brand<string, "GitCommit">; // 40 lowercase hex
export type IdempotencyKey = Brand<string, "IdempotencyKey">; // "ck1_" + 32 base32
export type Locale = Brand<string, "Locale">; // BCP-47, "tr-TR" | "en-US"
export type EpochMs = Brand<number, "EpochMs">;
export type AbsPath = Brand<string, "AbsPath">; // only kernel/src/paths.ts mints these

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [k: string]: JsonValue };

/**
 * D-11: money is integer USD MICRO-units in bigint (1_000_000n === $1.00), never float,
 * never cents — per-image prices like $0.0035 lose precision in minor units.
 * TRY appears only in reports, priced from a pinned TCMB snapshot (`FxSnapshotId`).
 */
export interface Money {
  readonly micros: bigint;
  readonly currency: "USD";
}
export type FxSnapshotId = Brand<string, "FxSnapshotId">;
export const ZERO_USD: Money = { micros: 0n, currency: "USD" };

export const LANES = ["free", "premium"] as const;
export type Lane = (typeof LANES)[number];

/* ══════════════════════════ 3. RecordEnvelope + attributes accessor ══════════════════════════
 * R-01 (inviolable): kernel code NEVER reads record.attributes.
 * Enforced in three layers: (1) this opaque brand makes `record.attributes.x` a COMPILE error,
 * (2) eslint no-restricted-syntax on MemberExpression[property.name='attributes'] in kernel,
 * (3) `just gate kernel-purity` greps packages/kernel/src for /\battributes\b/.
 */

declare const ATTRIBUTES_BRAND: unique symbol;

/** Structurally empty and un-indexable. There is nothing you can legally read off it. */
export type OpaqueAttributes = { readonly [ATTRIBUTES_BRAND]: never };

export const RECORD_STATES = ["draft", "active", "pinned", "superseded", "retired"] as const;
export type RecordState = (typeof RECORD_STATES)[number];

/** The ~10 fixed system fields. This shape is frozen; growth happens in `attributes`. */
interface RecordEnvelopeBase {
  readonly id: RecordId;
  readonly entityType: EntityTypeId;
  readonly title: string; // Turkish content, NFC-normalised
  readonly locale: Locale;
  readonly path: AbsPath; // one record per file
  readonly contentHash: Sha256; // sha256(NFC frontmatter-canonical + body)
  readonly createdAt: EpochMs;
  readonly updatedAt: EpochMs;
  readonly tags: readonly string[]; // ASCII kebab-case
  readonly body: string; // Turkish markdown
  /** Ring 1-defined user fields. Opaque to Rings 0 and 3. */
  readonly attributes: OpaqueAttributes;
}

/** `superseded` MUST carry a forward pointer — modelled in the type, not in a comment. */
export type RecordEnvelope =
  | (RecordEnvelopeBase & { readonly state: Exclude<RecordState, "superseded"> })
  | (RecordEnvelopeBase & { readonly state: "superseded"; readonly supersededBy: RecordId });

/**
 * The ONE accessor. Lives at packages/registry/src/attributes.ts (chokepoint #24) and is
 * the only file in the repo permitted to import this symbol —
 * dependency-cruiser rule `one-attributes-accessor` forbids every other path.
 * The `as unknown as` is the single sanctioned assertion in Ring 1.
 */
export function unsealAttributes(record: RecordEnvelope): Readonly<Record<string, unknown>> {
  // UNSAFE: deliberate re-widening of the opaque brand. Registry-only. See R-01 / D-03.
  return record.attributes as unknown as Readonly<Record<string, unknown>>;
}

/** Kernel-facing projection: `attributes` is not merely opaque, it is absent. */
export type SystemRecord = Omit<RecordEnvelope, "attributes">;
export function toSystemRecord(r: RecordEnvelope): SystemRecord {
  const { attributes: _unused, ...system } = r;
  void _unused;
  return system;
}

/* ══════════════════════════ 4. Error taxonomy ══════════════════════════
 * R-06: closed discriminated union. `userMessageKey` is an English enum key; the Turkish
 * copy lives in the SPA catalogue only — Turkish never enters an identifier, a log key
 * or an error thrown by the kernel (D-07).
 */

export const ERROR_KINDS = [
  "config",
  "validation",
  "not_found",
  "conflict",
  "provider_auth",
  "provider_rate_limit",
  "provider_quota",
  "provider_unavailable",
  "provider_bad_response",
  "content_rejected",
  "budget_exceeded",
  "timeout",
  "cancelled",
  "render_failed",
  "subprocess_failed",
  "io",
  "internal",
] as const;
export type ErrorKind = (typeof ERROR_KINDS)[number];

export type UserMessageKey = Brand<string, "UserMessageKey">; // key into apps/ui/src/i18n/tr.ts

export interface AppError {
  readonly kind: ErrorKind;
  /** Stable machine code, e.g. "PROVIDER_429", "CORPUS_MOVED", "PATH_ESCAPE". */
  readonly code: string;
  /** English. For logs and the debug pane only. */
  readonly message: string;
  /** Resolved to Turkish by the SPA. Never a Turkish literal in kernel source. */
  readonly userMessageKey: UserMessageKey;
  readonly retryable: boolean;
  readonly retryAfterMs?: number;
  /** Money already spent when this failed — a 429 after 3 images still cost money. */
  readonly costIncurred: Money;
  readonly providerId?: ProviderId;
  /** Verbatim provider text, for the debug pane. Never parsed, never matched on. */
  readonly providerMessage?: string;
  readonly cause?: unknown; // always the original Error; never String(e)
}

/** Retry classification is a total function over the closed union (R-06). */
export type RetryClass = "retry" | "reconcile" | "terminal";
export function classify(e: AppError): RetryClass {
  switch (e.kind) {
    case "provider_rate_limit":
    case "provider_unavailable":
    case "timeout":
      return e.retryable ? "retry" : "reconcile";
    case "io":
    case "subprocess_failed":
      return "retry";
    case "config":
    case "validation":
    case "not_found":
    case "conflict":
    case "provider_auth":
    case "provider_quota":
    case "provider_bad_response":
    case "content_rejected":
    case "budget_exceeded":
    case "cancelled":
    case "render_failed":
    case "internal":
      return "terminal";
    default:
      return assertNever(e.kind, "unhandled ErrorKind");
  }
}

/* ══════════════════════════ 5. Cost ══════════════════════════ */

export interface CostUnit {
  readonly name: string; // "image", "second", "input_token" — ASCII, closed per capability
  readonly quantity: number; // integer
}

export interface CostEstimate {
  readonly providerId: ProviderId;
  readonly capability: CapabilityName;
  readonly lane: Lane;
  /** Bump on any formula edit; the manifest records it so old runs stay explicable. */
  readonly formulaVersion: string;
  /** registry/providers/_pricing/<provider>-<YYYY-MM-DD>.json — immutable, committed. */
  readonly pricingSnapshotId: string;
  readonly units: readonly CostUnit[];
  readonly amount: Money;
  /** Worst case shown next to `amount` in the approval screen; caps are checked on this. */
  readonly upperBound: Money;
  readonly confidence: "exact" | "bounded" | "unknown";
}

export type ChargeStatus = "estimated" | "reported" | "unreported" | "possibly-charged";

/** Verbs RETURN cost events; only engine/src/record-step.ts writes the ledger (chokepoint #4). */
export interface CostEvent {
  readonly stepId: StepId;
  readonly idempotencyKey: IdempotencyKey;
  readonly estimate: CostEstimate;
  /** null when the provider reports no usage — NEVER copied from the estimate. */
  readonly actual: Money | null;
  readonly chargeStatus: ChargeStatus;
  readonly deltaRatio: number | null;
}

export interface BudgetLease {
  readonly leaseId: Brand<string, "LeaseId">;
  readonly reserved: Money;
  readonly capRemaining: Money;
  readonly state: "leased" | "released";
}

/* ══════════════════════════ 6. Provider adapter port ══════════════════════════
 * R-02: every one of the ~20 integrations implements exactly this and exports nothing else.
 * No provider SDK type, response object or string enum may appear in any return value.
 */

export interface CapabilityDescriptor {
  readonly capability: CapabilityName;
  readonly lane: Lane;
  readonly durationClass: "fast" | "medium" | "slow";
  readonly timeoutMs: number; // required, 1_000..600_000 — no "infinite" default
  readonly maxDurationMs: number; // <= 1_800_000
  readonly supportsSeed: boolean;
  readonly reproducibility: "none" | "best_effort" | "deterministic";
  readonly constraints: {
    readonly aspectRatios?: readonly `${number}:${number}`[];
    readonly maxDurationSec?: number;
    readonly maxInputBytes?: number;
    readonly languages?: readonly Locale[];
    readonly outputMimeTypes?: readonly string[];
    readonly maxConcurrency?: number;
  };
}

/** Pipelines request THIS. They never name a provider or a model id (D-03). */
export interface CapabilityRequest {
  readonly capability: CapabilityName;
  readonly lane: Lane;
  readonly constraints: CapabilityDescriptor["constraints"];
  /** Explicit sampling — a missing temperature is a validation error, not a provider default. */
  readonly sampling?: { readonly temperature: number; readonly topP?: number; readonly seed?: number };
}

/** Minted by validate(); start()/estimate() accept nothing else. */
export type ValidatedInput<T> = Brand<{ readonly value: T }, "ValidatedInput">;

export interface CallContext {
  readonly runId: RunId;
  readonly stepId: StepId;
  readonly signal: AbortSignal; // AbortSignal.any([caller, AbortSignal.timeout(timeoutMs)])
  readonly deadlineAt: EpochMs; // absolute, persisted — never a live setTimeout
  readonly idempotencyKey: IdempotencyKey;
  readonly budget: BudgetLease; // must be "leased" before the first byte leaves
  readonly now: () => EpochMs;
}

export interface JobHandle {
  readonly jobId: JobId;
  readonly providerId: ProviderId;
  readonly externalId: string;
  readonly apiVersion: string;
  readonly submittedAt: EpochMs;
  readonly nextPollAt: EpochMs;
  readonly deadlineAt: EpochMs;
  readonly idempotencyKey: IdempotencyKey;
}

/** No URL field, by construction: provider output URLs expire, bytes are downloaded (R-07). */
export interface ArtifactRef {
  readonly sha256: Sha256;
  readonly bytes: number;
  readonly mime: string;
  readonly localPath: AbsPath; // derived/blobs/<sha256>
  readonly width?: number;
  readonly height?: number;
  readonly durationMs?: number;
}

export type JobStatus<TOut> =
  | { readonly state: "queued"; readonly handle: JobHandle }
  | { readonly state: "running"; readonly handle: JobHandle; readonly progress?: number }
  | {
      readonly state: "succeeded";
      readonly handle: JobHandle;
      readonly output: TOut;
      readonly artifacts: readonly ArtifactRef[];
      readonly usage: JsonValue | null;
    }
  | { readonly state: "failed"; readonly handle: JobHandle; readonly error: AppError }
  | { readonly state: "cancelled"; readonly handle: JobHandle };

export interface ProviderAdapter<TIn = unknown, TOut = unknown> {
  readonly id: ProviderId;
  /** Pinned, sent on every request. "latest" is forbidden. */
  readonly apiVersion: string;
  capabilities(): readonly CapabilityDescriptor[];
  validate(input: TIn, req: CapabilityRequest): Result<ValidatedInput<TIn>, AppError>;
  /** SYNCHRONOUS and pure — the return type makes `async` a compile error (R-03). */
  estimate(input: ValidatedInput<TIn>, req: CapabilityRequest): Result<CostEstimate, AppError>;
  start(input: ValidatedInput<TIn>, ctx: CallContext): Promise<Result<JobHandle, AppError>>;
  status(handle: JobHandle, ctx: CallContext): Promise<Result<JobStatus<TOut>, AppError>>;
  cancel(handle: JobHandle, ctx: CallContext): Promise<Result<void, AppError>>;
  /** Parsed from the provider's own usage payload. null => chargeStatus "unreported". */
  actualCost(terminal: JobStatus<TOut>): Result<Money | null, AppError>;
}

/** PUBLISH targets add reconcile-by-read: publish is never blind-retried (R-08). */
export interface ChannelAdapter<TIn = unknown, TOut = unknown> extends ProviderAdapter<TIn, TOut> {
  readonly channelId: ChannelId;
  reconcile(
    handle: JobHandle,
    ctx: CallContext,
  ): Promise<Result<{ readonly published: boolean; readonly permalink?: string }, AppError>>;
}

/* ══════════════════════════ 7. The eight verbs ══════════════════════════
 * D-01: exactly eight, forever. `just gate verbs` asserts the union has 8 members and
 * snapshots the sorted names; changing it requires a D-nn entry in KARARLAR.md.
 */

export const VERB_NAMES = [
  "RESOLVE",
  "SELECT",
  "COMPOSE",
  "GENERATE",
  "RENDER",
  "VALIDATE",
  "PROPOSE",
  "PUBLISH",
] as const;
export type VerbName = (typeof VERB_NAMES)[number];

export type EffectClass =
  | "pure" // no I/O at all
  | "read-registry"
  | "read-corpus"
  | "network-model" // GENERATE only
  | "browser" // RENDER only
  | "write-tree" // PROPOSE only
  | "network-channel"; // PUBLISH only

export const VERB_EFFECT: { readonly [K in VerbName]: EffectClass } = {
  RESOLVE: "read-registry",
  SELECT: "read-corpus",
  COMPOSE: "pure",
  GENERATE: "network-model",
  RENDER: "browser",
  VALIDATE: "read-corpus",
  PROPOSE: "write-tree",
  PUBLISH: "network-channel",
};

/** Metered verbs must return >= 1 CostEvent; a test asserts this per verb. */
export const METERED_VERBS = ["GENERATE", "RENDER", "PUBLISH"] as const;
export type MeteredVerb = (typeof METERED_VERBS)[number];

/** Everything a verb is allowed to know. Note the absences: no registry loader, no config
 *  resolver, no provider resolver, no fs, no env, no Date, no Math.random. */
export interface VerbContext {
  readonly runId: RunId;
  readonly stepId: StepId;
  readonly signal: AbortSignal;
  readonly frozen: FrozenPlan; // the ONLY source of resolved providers/models/params
  readonly worktree: AbsPath; // checkout of frozen.corpusCommit — never HEAD
  readonly budget: BudgetLease;
  readonly now: () => EpochMs; // kernel/src/time/clock.ts
  readonly random: () => number; // seeded from frozen.seed
  readonly newId: (prefix: string) => string; // uuidv7
  /** `label` is an English enum key, never a formatted Turkish string. */
  readonly progress: (p: { readonly done: number; readonly total: number; readonly label: string }) => void;
  readonly log: (event: string, fields?: Readonly<Record<string, JsonValue>>) => void;
}

export interface VerbInput<TParams> {
  readonly runId: RunId;
  readonly stepId: StepId;
  readonly params: TParams;
  readonly inputHashes: readonly Sha256[];
}

export interface VerbOutput<TFacts extends Readonly<Record<string, JsonValue>>> {
  readonly artifacts: readonly ArtifactRef[];
  readonly costEvents: readonly CostEvent[]; // required; pass [] explicitly
  readonly facts: TFacts;
  readonly outputHashes: readonly Sha256[];
}

/* ---- per-verb params & facts (the eight signatures) ---- */

export interface RetrievalPredicate {
  readonly entityTypes: readonly EntityTypeId[];
  readonly tagsAll: readonly string[];
  readonly tagsAny: readonly string[];
  readonly states: readonly RecordState[]; // superseded/retired excluded by default
  readonly fts?: string;
  readonly limit: number;
  readonly includePinned: true; // pinned records always survive scoring
}

export interface ResolveParams { readonly recipeId: RecipeId; readonly overrides: Readonly<Record<string, JsonValue>> }
export interface ResolveFacts { readonly provenance: Readonly<Record<string, JsonValue>>; readonly stepCount: number; readonly [k: string]: JsonValue }

export interface SelectParams { readonly predicate: RetrievalPredicate }
export interface SelectFacts { readonly recordIds: readonly string[]; readonly quarantined: number; readonly [k: string]: JsonValue }

export interface ComposeParams { readonly templateId: TemplateId; readonly recordIds: readonly RecordId[] }
export interface ComposeFacts { readonly documentModelHash: string; readonly blocks: number; readonly [k: string]: JsonValue }

export interface GenerateParams { readonly request: CapabilityRequest; readonly promptTemplateId: PromptTemplateId; readonly vars: Readonly<Record<string, string>> }
export interface GenerateFacts { readonly providerId: string; readonly attempts: number; readonly reproducibility: string; readonly [k: string]: JsonValue }

export interface RenderParams { readonly mode: "static" | "document" | "motion"; readonly templatePath: AbsPath; readonly viewport: { readonly width: number; readonly height: number; readonly deviceScaleFactor: number } }
export interface RenderFacts { readonly pages: number; readonly fontsLoaded: true; readonly [k: string]: JsonValue }

export interface ValidateParams { readonly checkSetId: string; readonly targets: readonly AssetId[] }
export interface ValidateFacts { readonly blocking: number; readonly advisory: number; readonly verdictHash: string; readonly [k: string]: JsonValue }

export interface ProposeParams { readonly branch: string; readonly writeSet: readonly string[] }
export interface ProposeFacts { readonly commit: string; readonly files: number; readonly [k: string]: JsonValue }

export interface PublishParams { readonly channelId: ChannelId; readonly assetId: AssetId; readonly scheduleAt?: EpochMs }
export interface PublishFacts { readonly permalink: string; readonly externalId: string; readonly [k: string]: JsonValue }

export interface VerbIO {
  RESOLVE: { params: ResolveParams; facts: ResolveFacts };
  SELECT: { params: SelectParams; facts: SelectFacts };
  COMPOSE: { params: ComposeParams; facts: ComposeFacts };
  GENERATE: { params: GenerateParams; facts: GenerateFacts };
  RENDER: { params: RenderParams; facts: RenderFacts };
  VALIDATE: { params: ValidateParams; facts: ValidateFacts };
  PROPOSE: { params: ProposeParams; facts: ProposeFacts };
  PUBLISH: { params: PublishParams; facts: PublishFacts };
}

/** The one signature all eight share, so the engine schedules/retries/costs/replays once. */
export type VerbFn<K extends VerbName> = (
  input: VerbInput<VerbIO[K]["params"]>,
  ctx: VerbContext,
) => Promise<Result<VerbOutput<VerbIO[K]["facts"]>, AppError>>;

/** Dry-run twin. Zero network, zero writes — this is what makes `just plan` honest. */
export type VerbPlanFn<K extends VerbName> = (
  input: VerbInput<VerbIO[K]["params"]>,
  ctx: Omit<VerbContext, "progress">,
) => Result<StepPlan, AppError>;

export interface VerbModule<K extends VerbName> {
  readonly name: K;
  readonly effectClass: EffectClass;
  readonly metered: K extends MeteredVerb ? true : false;
  readonly plan: VerbPlanFn<K>;
  readonly run: VerbFn<K>;
}

/** A wrong signature or a ninth key is a `tsc -b` failure, not a review comment. */
export type VerbTable = { readonly [K in VerbName]: VerbModule<K> };

/* ══════════════════════════ 8. Plan, steps, manifest ══════════════════════════ */

export interface StepPlan {
  readonly stepId: StepId;
  readonly verb: VerbName;
  readonly dependsOn: readonly StepId[];
  readonly lane: Lane;
  readonly providerId: ProviderId | null; // null for offline verbs
  readonly modelRef: string | null; // resolved at PLAN time, never at execution time
  readonly providerDescriptorHash: Sha256;
  readonly params: JsonValue; // fully resolved after config layering
  readonly estimate: CostEstimate | null;
  readonly idempotencyKey: IdempotencyKey | null;
}

/** Frozen at planning -> awaiting-approval. Nothing here is re-resolved at execution. */
export interface FrozenPlan {
  readonly runId: RunId;
  readonly planHash: PlanHash; // sha256(canonicalJson(plan minus {runId, createdAt}))
  readonly recipeId: RecipeId;
  readonly corpusCommit: GitCommit; // replay pins the brand version (D-05)
  readonly registryCommit: GitCommit;
  readonly kernelVersion: string;
  readonly seed: number;
  readonly offline: boolean;
  readonly steps: readonly StepPlan[];
  readonly selected: readonly { readonly id: RecordId; readonly contentHash: Sha256 }[];
  readonly templates: readonly { readonly id: TemplateId; readonly contentHash: Sha256 }[];
  readonly effectiveConfig: Readonly<Record<string, JsonValue>>;
  /** key path -> which of the 4 layers set it. Rendered in the approval screen. */
  readonly provenance: Readonly<Record<string, "defaults" | "registry" | "local" | "run">>;
  readonly totalEstimate: CostEstimate;
  readonly createdAt: EpochMs;
}

export const RUN_STATES = [
  "queued",
  "planning",
  "awaiting-approval",
  "executing",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export type RunState = (typeof RUN_STATES)[number];

export const ASSET_STATES = ["draft", "qa-passed", "approved", "published", "retired"] as const;
export type AssetState = (typeof ASSET_STATES)[number];

export type Actor =
  | { readonly kind: "human"; readonly name: string; readonly email: string }
  | { readonly kind: "engine" }
  | { readonly kind: "agent"; readonly agentId: string; readonly version: string };

export interface StepRecord {
  readonly stepId: StepId;
  readonly verb: VerbName;
  readonly state: "pending" | "running" | "done" | "error" | "dead" | "cancelled";
  readonly attempts: number;
  readonly startedAt: EpochMs | null;
  readonly endedAt: EpochMs | null;
  readonly providerId: ProviderId | null;
  readonly modelRef: string | null;
  readonly inputHashes: readonly Sha256[];
  readonly outputHashes: readonly Sha256[];
  readonly costEvents: readonly CostEvent[];
  readonly error: AppError | null;
}

/** "An output that exists without a manifest entry is a bug" (section-14). */
export interface RunManifest {
  readonly schemaVersion: 1;
  readonly runId: RunId;
  readonly planHash: PlanHash;
  readonly corpusCommit: GitCommit;
  readonly registryCommit: GitCommit;
  readonly kernelVersion: string;
  readonly recipeId: RecipeId;
  readonly lane: Lane;
  readonly state: RunState;
  readonly actor: Actor;
  readonly startedAt: EpochMs;
  readonly endedAt: EpochMs | null;
  readonly effectiveConfig: FrozenPlan["effectiveConfig"];
  readonly provenance: FrozenPlan["provenance"];
  readonly inputs: readonly { readonly id: RecordId; readonly contentHash: Sha256 }[];
  readonly promptHashes: readonly { readonly id: PromptTemplateId; readonly hash: Sha256; readonly version: string }[];
  readonly steps: readonly StepRecord[];
  readonly outputs: readonly ArtifactRef[];
  readonly totals: {
    readonly estimated: Money;
    readonly actual: Money;
    readonly fxSnapshotId: FxSnapshotId | null;
  };
  readonly errors: readonly AppError[];
}



### CI kapıları

## Gate table

Every gate is a POSIX script at `scripts/gates/<name>.sh` (or a `node scripts/gates/<name>.ts`
file — Node 22.18+ strips types natively, so no build step). `just gate <name>` and
`lefthook.yml` and `.github/workflows/weekly.yml` all invoke the *same script*, so
"green locally, red in CI" is structurally impossible. No gate logic may live in YAML —
`gate:no-yaml-logic` enforces that.

`R` column: **B** = blocking (exit non-zero stops the commit/push/apply), **W** = warn only.

| # | gate | exact command | when | R | what it catches |
|---|---|---|---|---|---|
| 1 | `fmt` | `pnpm exec prettier --check {staged_files}` (lefthook `stage_fixed: true`); full: `pnpm exec prettier --check .` | pre-commit (staged) + pre-push | B | Unformatted TS/MD/YAML; reformat noise inside content diffs |
| 2 | `typecheck` | `pnpm gen:types && pnpm exec tsc -b --force --pretty false` | pre-push + weekly | B | Every ring violation expressible as a missing project reference; `any` leakage; wrong verb signature; `attributes` read through the opaque brand |
| 3 | `tsconfig-drift` | `node scripts/gates/tsconfig-drift.ts` | pre-push | B | A package weakening a flag from `tsconfig.base.json` (allowlist: `module`, `moduleResolution`, `lib`, `jsx`, `outDir`, `rootDir`, `types`, `noEmit`, `composite`) |
| 4 | `lint` | `pnpm exec eslint . --max-warnings=0` (ESLint 10 flat config, `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked`, `parserOptions.projectService: true`) | pre-commit (staged files) + pre-push (whole repo) | B | `@typescript-eslint/no-floating-promises`, `no-misused-promises`, `no-explicit-any`, `no-non-null-assertion`, `ban-ts-comment`, `switch-exhaustiveness-check`, `consistent-type-imports`, `no-console`, `import-x/no-cycle`, `import-x/no-default-export` |
| 5 | `ring-boundaries` | `pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err` | pre-push + weekly | B | Ring-direction violations ESLint zones cannot express (`node_modules` edges), module **and** folder-scope cycles (`{circular:true, scope:"folder"}`), `no-fsm-lib`. Paired lint rule id: `import-x/no-restricted-paths` (zones per ring) + `no-restricted-imports` (`@suite/*/src/*`, `@suite/*/dist/*`, `node:*` in `apps/ui`) |
| 6 | `chokepoints` | `node scripts/gates/chokepoints.ts && pnpm exec depcruise packages --config .derived/depcruise.chokepoints.cjs --output-type err` | pre-push | B | A second `better-sqlite3` handle, `chromium.launch()`, `node:child_process`, `node:fs` writer, `process.env` reader, git invoker, `fetch` caller, clock, RNG, id factory. Generated from `chokepoints.json`, so adding a row to the doc adds its enforcement |
| 7 | **`kernel-purity`** | `rg -n --type ts -e '\battributes\b' packages/kernel/src && exit 1 \|\| true` — plus `pnpm vitest run tests/unit/kernel/attribute-firewall.test.ts` (record whose `attributes` is a throwing `Proxy`, pushed through all 8 verbs) | pre-commit + pre-push + apply | B | **R-01.** The grep is defeated by destructuring/aliasing; the Proxy tripwire is not. `eslint-disable` on this rule is itself banned by gate 27 |
| 8 | `verbs` | `node scripts/gates/verbs.ts` (imports built kernel entrypoint, asserts `Object.keys(VERBS).sort()` deep-equals `packages/kernel/verbs.json` and `.length === 8`) | pre-push + apply | B | A ninth verb; a renamed verb; verb creep via a re-export |
| 9 | `schemas` | `pnpm gen:schemas && git diff --exit-code -- schemas/` | pre-push + agent-branch | B | Committed JSON Schemas drifting from the Zod source. The committed schemas are what power `# yaml-language-server: $schema=` in the editor and validation on a fresh clone |
| 10 | `registry` | `pnpm exec ajv validate -c ajv-formats --spec=draft2020 -s schemas/provider.schema.json -d 'registry/providers/*.yaml' --strict=true --all-errors` (repeated per entity kind by the script) | pre-commit (staged) + pre-push | B | Malformed provider/recipe/channel/check/entity-type YAML; a `rateLimits` entry missing `capacity`; a descriptor missing `timeoutMs`/`maxDurationMs`/`reproducibility`/`pricing_snapshot`; any executable file under `registry/` |
| 11 | **`corpus`** | `node scripts/gates/corpus.ts` | pre-commit (staged records) + pre-push | B | Frontmatter failing its entity-type schema; a `superseded` record with a dangling or non-`active` `supersededBy`; non-NFC Turkish text; a record body referencing a deleted record; >1 record per file |
| 12 | `citations` | `node scripts/gates/citations.ts` | pre-commit + pre-push | B | **Citation integrity.** Extracts every `section-N`, `section-N-M`, `R-nn`, `D-nn`, `FAZ-N.x` token from all tracked `*.md` and `*.ts` comments and resolves it against `docs/ANAYASA.md` anchors (`{#section-4-3}`), `KURALLAR.md` id column, `KARARLAR.md` id column, `docs/fazlar/FAZ-N.md` step anchors. Also fails on: a reference to a `reddedildi` (rejected) D-nn, a bare `bkz. 4.3` with no link, and an anchor deleted without a tombstone in `docs/referans/anchors.json` |
| 13 | `links` | `pnpm exec lychee --config lychee.toml .` (`offline = true`, `include_fragments = "full"`, `exclude_path = ["derived/","docs/research/"]`) | pre-push | B | Broken internal links and fragments. External URLs run in the weekly job with `offline = false --accept-timeouts`, **non-blocking** |
| 14 | `docs-size` | `node scripts/gates/doc-size.ts` (ceiling table hardcoded; see docTree) | pre-commit + pre-push | B | **CLAUDE.md > 200 lines**, KURALLAR.md > 400, KARARLAR.md > 600, DURUM.md > 120, ANAYASA.md > 1200, FAZ-N.md > 250, `.claude/rules/*.md` > 120, `SKILL.md` > 500 |
| 15 | `docs-drift` | `pnpm docs:generate && git diff --exit-code -- docs/referans/ THIRD-PARTY.md` | pre-push + weekly | B | `docs/referans/*.md` (providers, pipelines, capabilities, schema, cli, glossary, chokepoints) drifting from its source YAML/TS. Generator exits non-zero if a pipeline YAML contains a `model:` key |
| 16 | `docs-lint` | `pnpm exec markdownlint-cli2 "**/*.md" "#node_modules" "#derived" "#docs/research"` | pre-commit (staged) | B | MD001, MD024 `siblings_only`, MD034, MD042, MD047, MD051, MD013 `line_length:120 tables:false code_blocks:false` |
| 17 | `docs-language` | `rg -n --pcre2 '[ğşıçöüĞŞİÇÖÜ]' -g 'docs/**/*.md' -g 'CLAUDE.md' -g '.claude/**/*.md' \| rg -v '^\S+:\d+:\s*(>|`)' && exit 1 \|\| true` (script version strips fenced blocks and `<!-- lang:tr -->` lines) | pre-push | B | Turkish leaking into instruction files, schema keys, log event names, enum values, filenames. Content is Turkish; identifiers and docs are English |
| 18 | **`turkish-case`** | `rg -n --type ts -e '\.to(Upper\|Lower)Case\(\s*\)' packages apps \| rg -v 'packages/kernel/src/text/case\.ts' && exit 1 \|\| true` | pre-commit + pre-push | B | **The `İ`/`ı` bug.** `'i'.toUpperCase()` is `I` not `İ`; `'I'.toLowerCase()` is `i` not `ı`. Only `kernel/src/text/case.ts` may transform case, and only via `toLocaleUpperCase('tr')`/`toLocaleLowerCase('tr')`. Lint rule id: `no-restricted-syntax` selector `CallExpression[callee.property.name=/^to(Upper\|Lower)Case$/]` scoped to `packages/**` and `apps/**` |
| 19 | `paths` | `git ls-files -z \| tr '\0' '\n' \| LC_ALL=C grep -vE '^[a-z0-9][a-z0-9._/-]*$' && exit 1 \|\| true` | pre-commit | B | Non-ASCII / uppercase tracked paths — NFC-vs-NFD duplicates in `git status`, broken `grep -i`, locale-dependent globbing |
| 20 | **`secrets`** | pre-commit: `gitleaks git --staged --no-banner --redact --exit-code 1`; weekly: `gitleaks git --no-banner --redact --exit-code 1` (full history) + `node scripts/gates/sops.ts` | pre-commit + weekly | B | A provider key in a registry YAML, a manifest, a test cassette or a golden. `sops.ts` additionally asserts every file under `secrets/` carries a `sops.mac` field and that no `registry/providers/*.yaml` has a `key:`/`token:`/`secret:` with a non-`*_ENV` value |
| 21 | `pii` | `node scripts/gates/pii.ts` | pre-commit + pre-push | B | **KVKK.** Real e-mail domains, Turkish mobiles outside the reserved `+90 555 000 00 00` range, 11-digit TCKN-shaped strings with a valid checksum, IBANs — anywhere under `tests/`, `corpus/`, `assets/`, `docs/` |
| 22 | **`licenses`** | `pnpm licenses list --json --prod \| node scripts/gates/licenses.mjs && pnpm docs:generate && git diff --exit-code -- THIRD-PARTY.md` | pre-push + weekly | B | Any SPDX id outside `MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, CC0-1.0, Unlicense, Python-2.0`, or `null`/`UNLICENSED`. Also regenerates HyperFrames' Apache-2.0 NOTICE block in `THIRD-PARTY.md` |
| 23 | `deps` | `pnpm install --frozen-lockfile --offline && git diff --exit-code -- pnpm-lock.yaml && pnpm exec syncpack lint && pnpm exec knip` | pre-push + weekly | B | A caret range, a non-`catalog:` reference, a lockfile that regenerates differently, a declared-but-unused dependency, a `typescript`/`typescript-eslint` peer mismatch that would silently switch typed linting **off** |
| 24 | `blob-size` | `git diff --cached --name-only --diff-filter=AM -z \| xargs -0r -I{} sh -c 'test $(git cat-file -s $(git rev-parse :{})) -le 524288 \|\| { echo "too large: {}"; exit 1; }'` + reject any staged `*.png/jpg/webp/mp4/mov/wav/pdf/psd/zip` outside `brand/` | pre-commit | B | An agent writing a render into `corpus/` instead of `assets/objects/`. This is the last cheap moment — after the commit, only a history rewrite removes it |
| 25 | `no-tracked-derived` | `test -z "$(git ls-files derived/ assets/objects/)"` | pre-commit | B | The FTS5 index or asset bytes becoming tracked; Ring 3 stopping being disposable |
| 26 | **`projections`** | `CI=true pnpm exec vitest run --project unit tests/unit/projection` (`toMatchFileSnapshot` against `tests/unit/projection/__golden__/*.json`) | pre-push | B | A change to the record→projection compiler, the run-manifest shape, or the retrieval predicate compiler. `CI=true` makes Vitest refuse to *write* snapshots and fail on mismatched, missing **and obsolete** ones |
| 27 | **`typography`** | `CI=true TZ=Europe/Istanbul LANG=tr_TR.UTF-8 pnpm exec vitest run --project golden tests/golden/typography` | pre-push | B | **Golden-file typography.** Compares a JSON metrics snapshot (resolved font family, computed font-size/line-height, per-line box geometry, glyph count, overflow flags, safe-zone intersection) — **not pixels**. Ruling: PNG pixel goldens would violate the no-binaries-in-git rule and break on every Chromium bump, so pixel diffing lives only in the nightly container lane (gate 33) and never blocks a commit. Updating a metrics golden requires a commit whose message contains `GOLDEN-UPDATE: <reason>` |
| 28 | `safe-zone` | `pnpm exec vitest run --project golden tests/golden/safe-zone` | pre-push | B | A CTA drifting under the Instagram/LinkedIn UI overlay. Numeric DOM-geometry assertion against `registry/channels/*.yaml`, which a pixel diff cannot express |
| 29 | `test` | `pnpm exec vitest run --project unit --project contract --coverage` | pre-push | B | Unit + adapter-contract lanes. Coverage thresholds are glob-scoped to `packages/kernel/src/**` and `packages/registry/src/validate/**` (lines 90 / functions 90 / branches 80), `coverage.thresholds.autoUpdate: false`; no global threshold key may exist |
| 30 | `no-egress` | `CS_ALLOW_NETWORK=0 pnpm exec vitest run --project unit --project contract` with `server.listen({ onUnhandledRequest: 'error' })` in `tests/setup/msw.ts` | pre-push | B | A test quietly hitting a real paid endpoint. msw's default is `'warn'` — this makes it fatal. A meta-test fetches `https://example.invalid` and asserts rejection |
| 31 | `offline` | `pnpm exec vitest run --project agentic tests/agentic/offline` with undici `MockAgent().disableNetConnect()` | pre-push | B | An `offline: true` recipe that secretly needs the network; a template pulling a Google Font (`rg -n 'https://' templates/ && exit 1`) |
| 32 | `manifests` | `node scripts/gates/manifests.ts` | pre-push + apply | B | A committed file under `assets/` with no sidecar whose `sha256` matches it; a sidecar with no `run_id`; an output that exists without a manifest |
| 33 | `no-snapshot-update` | `rg -n -- '--update-snapshots\|vitest .*-u\b\|--update\b' .github/workflows/ scripts/ package.json justfile && exit 1 \|\| true` | pre-commit + weekly | B | Blind baseline updates by CI or by an agent. Accepting a new visual truth is an **apply**, not a proposal |
| 34 | `linear-history` | `test -z "$(git rev-list --merges main)"` + `git for-each-ref --format='%(refname:short)' refs/heads \| grep -Ev '^(main\|agent/\|human/)' && exit 1 \|\| true` | pre-push | B | A merge commit on `main`; a `develop`/`release/*` branch; a reused agent branch |
| 35 | **`commit-msg`** | `node scripts/gates/commit-msg.mjs "$1"` (lefthook `commit-msg` job) — internally: `pnpm exec commitlint --edit "$1"`, then the two regexes below | commit-msg | B | See breakdown ↓ |
| 36 | `apply-gate` | `node scripts/gates/apply-gate.mjs "$1"` | commit-msg on `main` | B | A commit on `main` without an `Applied-By: <name> <email>` trailer, or carrying `Proposed-By: agent`. Agents physically cannot land on `main` |
| 37 | `audit` | `bash scripts/gates/audit.sh` — replays the whole pre-commit set over `git diff audit/last-verified..HEAD` | pre-push + weekly | B | A `--no-verify` bypass. Not preventable client-side, so it is *detected*; the `audit/last-verified` tag moves only on success |
| 38 | `pricing-immutable` | `test -z "$(git diff --diff-filter=M --name-only origin/main...HEAD -- registry/providers/_pricing/)"` | pre-push | B | An edited pricing snapshot silently re-pricing last quarter's cost report. Snapshots may be **added**, never modified |
| 39 | `rebuild` (drill) | `rm -rf derived node_modules && pnpm install --frozen-lockfile && just reindex && just gates` with provider base URLs pointed at an unreachable host | monthly (scheduled) | B | Ring 3 having quietly acquired an authoritative fact. An untested rebuild is not a derived artifact |
| 40 | `live` | `pnpm exec vitest run --project live` (each test wrapped in `withBudget(maxCostMinorUnits, fn)`) | nightly (scheduled) | W → B on budget breach | Cassette rot: a provider renamed a field and every contract test still passes against a 2-year-old recording. Never runs on push; the nightly job aborts on the first budget breach |
| 41 | `judges` | `pnpm exec promptfoo eval -c evals/ --no-cache --output .derived/evals/$(date -I).json` | nightly (scheduled) | **W, never B** | Prompt-quality regressions. Ruling: `llm-rubric`/`g-eval`/`factuality` results are recorded as metrics and may open a review item, but must **never** fail a build — a red build caused by a grader's mood trains you to ignore the build. Only the deterministic assertions (`is-json`, char-cap, banned-terms, diacritic-integrity, `claim_source`) are blocking, and they run in gate 29 |
| 42 | `doctor` | `bash scripts/doctor.sh` | after any absence > 2 weeks; weekly | B | Orphan worktrees, stale agent branches, a garbage-collected pnpm store, pricing snapshots older than 90 days, `git fsck` damage, missing `extensions.worktreeConfig`/`rerere.enabled` |

### Gate 35 breakdown — the commit-msg hook

Three checks, in order, all in `scripts/gates/commit-msg.mjs`:

1. **Conventional Commits 1.0.0**, via `commitlint.config.ts`:
   - `type-enum`: `feat, fix, docs, refactor, perf, test, build, ci, chore, revert, corpus, registry`
     (`style` removed — formatting is automatic; `corpus` and `registry` added so
     `git log --grep '^corpus'` answers "what did we learn about the brand this month")
   - `scope-empty: [2,'never']`, `scope-enum: [2,'always', ['kernel','registry','corpus','derived','api','ui','render','providers','pipelines','channels','recipes','ops','repo','docs']]`
   - `header-max-length: [2,'always',72]`, subject in **English**
   - `git log --format=%s <range> | LC_ALL=C grep -P '[^\x00-\x7F]'` must be empty

2. **`Refs:` line required** — every commit, no exception:
   ```
   grep -qE '^Refs: (section-(1[0-9]|[1-9])(-[0-9]+)?|R-[0-9]{2}|D-[0-9]{2}|FAZ-[0-9](\.[0-9]+)?)(, (section-(1[0-9]|[1-9])(-[0-9]+)?|R-[0-9]{2}|D-[0-9]{2}|FAZ-[0-9](\.[0-9]+)?))*$' "$1"
   ```
   Each token is then resolved by gate 12's resolver, so `Refs: R-99` fails even though it
   matches the regex. Commits touching `corpus/**` or an asset sidecar must additionally
   carry `Run-Id: <26-char Crockford base32 ULID>` matching the agent branch name.

3. **AI attribution footer banned** — the repo is permanently private and commit history is
   the audit trail; a machine byline in the Author/trailer position destroys the
   `Proposed-By` / `Applied-By` distinction that the whole propose/apply model rests on:
   ```
   grep -qiE 'co-authored-by:.*(claude|anthropic)|generated with .*(claude|claude code)|noreply@anthropic\.com|🤖' "$1" && exit 1
   ```
   Machine authorship is recorded *only* in the structured trailer block
   (`Run-Id`, `Agent: <id>@<version>`, `Model: <capability>/<lane>`, `Cost-Usd`, `Proposed-By: agent`).

### Hook wiring (`lefthook.yml`, `min_version: "1.10.0"`, `assert_lefthook_installed: true`)

| hook | budget | jobs |
|---|---|---|
| `pre-commit` | **< 5 s**, `parallel: true`, staged-scoped | 1, 4(staged), 7, 11(staged), 12, 14, 16, 17→wired at push, 19, 20, 21, 24, 25, 33, `branch-name`, `commit-shape` |
| `commit-msg` | < 200 ms | 35, 36 |
| `pre-push` | **< 3 min**, `parallel: true` | `just gates` = 2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,22,23,26,27,28,29,30,31,32,34,37,38 |
| agent branches (`only: [{ref: 'agent/*'}]`) | < 20 s | pre-commit set + 9 + 11 only. What must be true of a *proposal* is that it is well-formed and schema-valid; what must be true of an *apply* is everything |
| `scripts/apply.sh` (human apply on `main`) | — | full `just gates` **before** creating the squash commit; refuses to commit on any failure |
| `.github/workflows/weekly.yml` | clean-machine smoke | `pnpm install --frozen-lockfile && just gates` only. It is never the sole enforcement of any rule — the laptop is the gate of record |



### Belge ağacı

## Ruling first

Three researcher proposals are **rejected** here, because the fixed project shape wins:

1. **Diátaxis (`docs/{tutorial,how-to,reference,explanation,decisions}/`) is rejected.**
   The taxonomy is already given: ANAYASA (explanation) / FAZ (plan) / LOOP (procedure) /
   referans (generated reference). A second taxonomy on top of it would give every fact two
   possible homes, which is the exact failure Diátaxis exists to prevent.
2. **`docs/adr/` and `docs/decisions/NNNN-*.md` (MADR) are rejected.** Decisions are `D-nn`
   rows in `KARARLAR.md` — that is what the citation notation commits to, and one
   append-only file is cheaper for a solo maintainer to keep honest than 60 loose files.
   MADR's *content* discipline survives: every D-nn carries Bağlam / Seçenekler / Karar /
   Sonuçlar / Yeniden-değerlendirme-tetiği.
3. **`AGENTS.md` as the primary entrypoint is rejected.** `CLAUDE.md` is the entrypoint;
   `AGENTS.md` is a committed **symlink** to it, so other agent runtimes work with zero
   duplication and zero drift (`test -L AGENTS.md` in `gate:docs-size`).

Exactly one directory is **added** to the fixed list: `docs/referans/` (generated, committed).
It exists because an agent must be able to read the provider catalogue and the schema surface
without running a build, and because committing it makes the drift gate possible.

```
.
├── CLAUDE.md
├── AGENTS.md -> CLAUDE.md          (symlink, 0 lines of its own)
├── KURALLAR.md
├── KARARLAR.md
├── DURUM.md
├── THIRD-PARTY.md                  (GENERATED)
├── justfile
├── chokepoints.json
├── docs/
│   ├── ANAYASA.md
│   ├── LOOP.md
│   ├── fazlar/FAZ-0.md … FAZ-9.md
│   ├── referans/                   (GENERATED, committed)
│   │   ├── providers.md
│   │   ├── pipelines.md
│   │   ├── capabilities.md
│   │   ├── sema.md
│   │   ├── cli.md
│   │   ├── sozluk.md
│   │   ├── chokepoints.md
│   │   └── anchors.json
│   ├── runbook/
│   │   ├── sizinti.md
│   │   ├── yeniden-kur.md
│   │   └── donus.md
│   └── research/YYYY-MM-DD-<domain>.md   (FROZEN)
├── .claude/
│   ├── rules/<topic>.md
│   └── skills/<name>/SKILL.md
├── schemas/*.schema.json           (GENERATED, committed)
└── registry/lexicon.yaml           (source of docs/referans/sozluk.md)
```

### Root files

| file | purpose | audience | ceiling | update trigger |
|---|---|---|---|---|
| `CLAUDE.md` | The agent contract. Build/test/lint commands (`just` recipes only), the four rings in one paragraph each, the 8 verbs by name, the propose-vs-apply law, the citation notation, and **pointers**. No brand copy, no Turkish, no model ids, no prices, no directory listings the agent can `ls` for itself. | agent (loaded every session) | **200 lines** — gate 14 | A `just` recipe is added/renamed, a ring boundary moves, or the propose/apply flow changes. Never for content |
| `AGENTS.md` | Symlink to `CLAUDE.md` so non-Claude runtimes load the same file. | agent | n/a | Never |
| `KURALLAR.md` | The rule register: `R-nn \| kural \| neden \| zorlayıcı (gate id) \| şiddet`. One row per rule, every BLOCKING row naming the exact command/lint-rule-id from the gate table. This is the file a gate failure message links to. | both | **400 lines** | A gate is added, removed or has its severity changed. Every edit is a `docs(repo):` commit citing the R-nn |
| `KARARLAR.md` | The decision register, **append-only**: `D-nn`, `durum` (`önerildi\|kabul\|red\|kullanımdan-kaldırıldı\|yerine-geçildi`), `tarih`, Bağlam / Seçenekler / Karar / Sonuçlar / Yeniden-değerlendirme-tetiği. Once `kabul`, only the `durum` line and an appended `D-mm tarafından yerine geçildi` link may change. | both | **600 lines**; split to `docs/kararlar/D-nn.md` with `KARARLAR.md` as the pointer index at 500 | One of the mandatory triggers: a verb added/removed, a runtime dependency added to `packages/kernel`, a ring boundary changed, a render mode changed, the free/premium lane contract changed, a capability name added, a chokepoint added/removed, a config layer added. `gate:adr-required` fails the push otherwise |
| `DURUM.md` | Where the project actually is *today*: current FAZ, what is green, what is red, the three next actions, open blockers, last drill dates. Overwritten, never appended — history is in git. Replaces a CHANGELOG entirely (a per-commit changelog on a solo repo is churn that creates a conflict on every agent branch). | human first, agent second | **120 lines** | End of every working session, and by `just doctor` which rewrites the drill-date block automatically |
| `THIRD-PARTY.md` | GENERATED. Dependency licence table + HyperFrames' Apache-2.0 NOTICE obligations. | legal / human | n/a (generated) | `just gates` gate 22 regenerates it; drift = build failure |

### `docs/`

| file | purpose | audience | ceiling | update trigger |
|---|---|---|---|---|
| `docs/ANAYASA.md` | The constitution. 19 numbered sections, each heading carrying an **explicit stable anchor**: `## 4. Sağlayıcılar {#section-4}`, `### 4.3 Maliyet formülleri {#section-4-3}`. Auto-slugs are never linked to; an anchor, once committed, is immutable and its removal requires a tombstone row in `docs/referans/anchors.json`. This is the file every `section-N` citation resolves against. | both | **1200 lines**; over that, split to `docs/anayasa/section-NN.md` keeping `ANAYASA.md` as the pointer index (every child listed once with a one-line "read this when…") | A `D-nn` is accepted that changes an invariant. The ANAYASA is edited *after* the decision, citing it: every section ends with the `D-nn` list that produced it |
| `docs/LOOP.md` | The working loop, as a procedure: plan → propose → review → apply → publish, with the exact `just` recipe at each step, the gate that guards each transition, and what to do when a gate is red. The one doc read while doing, not while thinking. | both | **200 lines** | A `just` recipe or a hook stage changes |
| `docs/fazlar/FAZ-0.md … FAZ-9.md` | Ten phase plans. Steps are `### FAZ-3.2 <başlık> {#faz-3-2}` headings — that anchor is what `FAZ-N.x` citations resolve to. Each step: hedef, çıktı (a file path or a green gate), kabul kriteri (a command that exits 0), and the `section-N`/`R-nn`/`D-nn` it serves. No step may restate a constitutional rule in its own words — it links. | both | **250 lines each** | A step is completed (checkbox + the commit SHA), or the plan changes. FAZ-0..N-1 become read-only once `DURUM.md` moves past them |
| `docs/referans/*.md` | GENERATED. Line 1 of every file is exactly `<!-- ÜRETİLMİŞ DOSYA — ELLE DÜZENLEME. Kaynak: <glob>. Yeniden üret: just docs -->`. `providers.md` (capabilities, cost formula, lane, descriptor path), `pipelines.md` (requested **capabilities** — the generator exits non-zero if it finds a `model:` key), `capabilities.md`, `sema.md` (from the emitted JSON Schemas, must cover every `registry/entity-types/*.yaml`), `cli.md` (introspected from the command registry; every command needs `description` + ≥1 `example`), `sozluk.md` (from `registry/lexicon.yaml`: en / tr / definition / `forbidden_tr` calques), `chokepoints.md` (from `chokepoints.json`), `anchors.json` (anchor set + tombstones). | agent primarily | exempt — read by search, not by load | Its source changes. Gate 15 (`just docs && git diff --exit-code -- docs/referans/`) makes drift a build failure. Never hand-edited; `gate:generated-banner` asserts line 1 |
| `docs/runbook/sizinti.md` | Leak / history-rewrite runbook, with literal commands: rotate the credential **at the provider first**, then `git clone --no-local . /tmp/rewrite && git filter-repo --path <leaked> --invert-paths`, then discard every worktree, re-add the remote, force-push. Never `filter-branch`, never an interactive rebase, never on your only copy. | human | 150 | A quarterly drill run against a scratch clone; or a real incident |
| `docs/runbook/yeniden-kur.md` | The monthly Ring-3-is-disposable drill and what to do when it fails. | human | 150 | Monthly drill result |
| `docs/runbook/donus.md` | The return-from-absence checklist that `just doctor` implements, in prose, for when `just doctor` itself is what is broken. | human | 150 | `scripts/doctor.sh` changes (its output format is snapshot-tested so the checklist cannot silently lose a step) |
| `docs/research/YYYY-MM-DD-<domain>.md` | **Frozen** research output, dated at the top, never edited after commit. Excluded from markdownlint, lychee, the citation resolver and the language gate (it may contain model ids, prices, dated facts — that is what makes it evidence). Included in the secret and PII scans. | human, occasionally | none | Append a new dated file. Superseding a finding means writing a `D-nn`, not editing the research |

### `.claude/`

| file | purpose | audience | ceiling | update trigger |
|---|---|---|---|---|
| `.claude/rules/<topic>.md` | Path-scoped instructions with `paths:` frontmatter globs (`packages/kernel/**/*.ts`, `templates/**`, `corpus/**`). Loads only when the agent touches matching files, so kernel invariants cost zero tokens during a Tailwind tweak. Expected set: `kernel.md`, `registry.md`, `corpus.md`, `render.md`, `providers.md`, `commit.md`. | agent (conditional) | **120 lines each** | The rule it scopes changes. Anything applying repo-wide belongs in `CLAUDE.md`, not here |
| `.claude/skills/<name>/SKILL.md` | Repeatable **procedures** only (how to render a deck, how to run the safe-zone inspector, how to add a job type). Facts are referenced by registry path, never copied — a copied cost formula is the fastest rot vector in the repo. `name` ≤64 chars, lowercase/hyphen, identical to the parent directory; `description` ≤1024 chars saying both *what* and *when*; references exactly one level deep under `references/`. | agent (conditional) | **500 lines** | The procedure changes. `gate:skills` greps for provider names, model ids, price literals and Turkish brand strings and fails with a pointer to the registry path to reference instead |

### The two exemptions, stated explicitly

- **Generated files are committed** (`schemas/*.schema.json`, `docs/referans/**`, `THIRD-PARTY.md`)
  even though Ring 3 is gitignored, because three consumers need them without a build: the
  YAML language server in the editor, a fresh clone's validator, and code review. The drift
  gate is what stops that exemption from becoming rot.
- **Generated TypeScript is not committed** (`derived/types/**`), because the committed JSON
  Schema is already the source of truth and a second artifact would drift; `just check` and
  `just verify` both run `pnpm gen:types` first, offline and deterministically.



### justfile

```just
# justfile — the only entrypoint a human or an agent needs.
#
# Every recipe delegates to scripts/, never inlines logic, so lefthook, the weekly
# GitHub Action and this file execute byte-identical checks (KURALLAR.md R-31).
# Requires: just >= 1.36, pnpm 11.21.0 (pinned via packageManager), Node >= 22.18 < 23.
#
# Refs: docs/LOOP.md, section-17, R-30..R-42

set shell := ["bash", "-euo", "pipefail", "-c"]
set positional-arguments := true
set dotenv-load := false

export TZ := "Europe/Istanbul"
export LANG := "tr_TR.UTF-8"
export CS_ROOT := justfile_directory()
export NODE_OPTIONS := "--max-old-space-size=2048"

# Show every recipe, grouped, in the order written.
default:
    @just --list --unsorted

# ═══════════════════════════ the daily loop ═══════════════════════════

# Fast feedback while working. Staged-scope where it can be. Target: < 30 s.
[group('loop')]
check:
    pnpm exec prettier --check .
    pnpm gen:types
    pnpm exec tsc -b --pretty false
    pnpm exec eslint . --max-warnings=0
    pnpm exec vitest run --project unit

# The full truth set. This is what an agent branch must pass before a human sees the diff,
# and what scripts/apply.sh runs before creating the squash commit. Target: < 3 min.
[group('loop')]
verify: gates test golden
    @echo "✓ verify green — safe to apply"

# Format and auto-fix everything fixable, then re-stage.
[group('loop')]
fmt:
    pnpm exec prettier --write .
    pnpm exec eslint . --fix
    pnpm exec markdownlint-cli2 --fix "**/*.md" "#node_modules" "#derived" "#docs/research"

# ═══════════════════════════ gates ═══════════════════════════

# Run every gate. Identical to the pre-push hook and to the weekly clean-machine job.
[group('gates')]
gates:
    bash scripts/gates/all.sh

# Run one gate by name, e.g. `just gate kernel-purity`. Tab-complete from scripts/gates/.
[group('gates')]
gate name:
    bash "scripts/gates/{{name}}.sh"

# List every gate with its severity and hook stage (generated from scripts/gates/*.sh headers).
[group('gates')]
gates-list:
    @node scripts/gates/list.ts

# The three checks that are never allowed to be skipped, isolated for fast iteration.
[group('gates')]
purity:
    bash scripts/gates/kernel-purity.sh
    bash scripts/gates/verbs.sh
    bash scripts/gates/ring-boundaries.sh

# ═══════════════════════════ tests ═══════════════════════════

# Run a test lane: unit | contract | golden | agentic | live. Default: unit + contract.
[group('test')]
test lane="default":
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{lane}}" in
      default)  CS_ALLOW_NETWORK=0 pnpm exec vitest run --project unit --project contract --coverage ;;
      live)     echo "live lane is nightly-only and costs money: just live" >&2; exit 1 ;;
      *)        CS_ALLOW_NETWORK=0 pnpm exec vitest run --project "{{lane}}" ;;
    esac

# Watch the unit lane. The only lane fast and hermetic enough to run on save.
[group('test')]
watch:
    CS_ALLOW_NETWORK=0 pnpm exec vitest --project unit

# Nightly, budget-capped, hits real providers. Never run from a hook.
[group('test')]
live:
    pnpm exec vitest run --project live --reporter=json --outputFile=.derived/live/$(date -I).json

# ═══════════════════════════ goldens ═══════════════════════════

# Typography + safe-zone metric goldens (JSON, not pixels). CI=true so Vitest refuses to write.
[group('golden')]
golden:
    CI=true pnpm exec vitest run --project golden

# Regenerate metric goldens INSIDE the pinned render container, write a side-by-side
# contact sheet to .derived/golden-review/, and remind the human of the required trailer.
# Never callable by an agent: scripts/gates/no-snapshot-update.sh bans --update anywhere else.
[group('golden')]
golden-update reason:
    #!/usr/bin/env bash
    set -euo pipefail
    test -n "{{reason}}" || { echo "reason required" >&2; exit 1; }
    docker run --rm -v "$CS_ROOT:/w" -w /w \
      -e TZ -e LANG -e CI=false \
      "$(cat .render-image)" \
      pnpm exec vitest run --project golden --update
    node scripts/render/contact-sheet.ts .derived/golden-review
    echo
    echo "Review .derived/golden-review/index.html, then commit with:"
    echo "  GOLDEN-UPDATE: {{reason}}"

# ═══════════════════════════ run a pipeline ═══════════════════════════

# Pre-flight a recipe: validate, resolve every capability, price both lanes, check the cap.
# Zero network, zero writes. Exit codes: 10 schema, 11 resolution, 12 budget, 13 stale plan.
[group('run')]
plan recipe *FLAGS:
    pnpm exec cs plan "{{recipe}}" {{FLAGS}}

# Execute an approved plan by its planHash. Refuses if corpus/registry/prompt hashes moved.
[group('run')]
run plan-hash *FLAGS:
    pnpm exec cs run --plan "{{plan-hash}}" {{FLAGS}}

# Squash-apply an agent proposal. Runs `just verify` first and refuses to commit on failure.
[group('run')]
apply branch:
    bash scripts/apply.sh "{{branch}}"

# Scaffold a new creative job type as DATA: entity-type, recipe, template, checks, channel.
# The resulting PR must contain zero changes under packages/.
[group('run')]
new-job name:
    pnpm exec cs new-job "{{name}}"

# ═══════════════════════════ derived ring ═══════════════════════════

# Rebuild Ring 3 from Rings 1+2 and git history. Deletes only *.sqlite* — the run ledger
# and handles under derived/runs/ are NOT derivable from the corpus and are never touched.
[group('derived')]
reindex *FLAGS:
    pnpm exec cs reindex --from-scratch {{FLAGS}}

# Prove Ring 3 is disposable. Monthly drill; runs with provider hosts unreachable.
[group('derived')]
reindex-drill:
    bash scripts/drills/rebuild.sh

# ═══════════════════════════ docs ═══════════════════════════

# Regenerate every generated doc + schema + THIRD-PARTY.md.
[group('docs')]
docs:
    pnpm gen:schemas
    pnpm docs:generate

# Everything documentation, in one command, in dependency order.
[group('docs')]
docs-check: docs
    git diff --exit-code -- docs/referans/ schemas/ THIRD-PARTY.md
    node scripts/gates/doc-size.ts
    node scripts/gates/citations.ts
    node scripts/gates/agent-docs.ts
    node scripts/gates/skills.ts
    pnpm exec markdownlint-cli2 "**/*.md" "#node_modules" "#derived" "#docs/research"
    pnpm exec cspell "**/*.md" --no-progress
    pnpm exec vale corpus/
    pnpm exec lychee --config lychee.toml .

# Report what has rotted: overdue verifiedAt stamps, D-nn stuck in `önerildi` > 30 days,
# runbooks untouched > 180 days. Warns in every commit; fails when > 30 days overdue.
[group('docs')]
docs-doctor:
    node scripts/docs/doctor.ts

# ═══════════════════════════ health ═══════════════════════════

# Run this after any absence longer than two weeks, BEFORE touching anything.
# git fsck → worktree prune → stale-branch report → frozen install → gates →
# object-store re-hash → pricing-snapshot staleness. Prints a pass/fail table, exits non-zero.
[group('health')]
doctor:
    bash scripts/doctor.sh

# Weekly housekeeping: prune agent branches > 14 days, prune worktrees, full-history
# gitleaks, repo-size budget, licence refresh, pricing-snapshot refresh proposal.
[group('health')]
maintain:
    bash scripts/maintain.sh

# What is this repo costing? Reads derived/runs/*/manifest.json, prices TRY from the
# pinned TCMB snapshot, never re-prices history with today's rate.
[group('health')]
cost period="30d":
    pnpm exec cs cost --period "{{period}}"

# ═══════════════════════════ bootstrap ═══════════════════════════

# Fresh clone → working repo. Idempotent.
[group('setup')]
setup:
    corepack enable
    pnpm install --frozen-lockfile
    pnpm exec lefthook install
    git config extensions.worktreeConfig true
    git config core.precomposeunicode true
    git config rerere.enabled true
    git config rerere.autoupdate true
    pnpm exec playwright install --with-deps chromium
    just reindex
    just doctor
```

