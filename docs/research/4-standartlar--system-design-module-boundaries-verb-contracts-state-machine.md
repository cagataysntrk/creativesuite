# System design: module boundaries, verb contracts, state machines, data flow chokepoints, idempotency, concurrency, config layering, observability, failure isolation, extension seams — for the Upcytech agentic Creative Suite (Node 22 / TS / pnpm workspaces / Hono / Vite-React / better-sqlite3 / Playwright).

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Özet

This rulebook makes the four-ring architecture mechanically true rather than aspirational. The core idea: rings become pnpm workspace packages with a strict acyclic import order (`contracts ← kernel ← {registry, corpus, providers, render} ← derived ← engine ← server ← cli`, with `ui → contracts` only), enforced three ways at once — `import/no-restricted-paths` zones in flat ESLint config, a `dependency-cruiser` 18.x `forbidden` ruleset (which also catches `node_modules` edges ESLint zones cannot express), and TypeScript project references (`composite: true` + `tsc -b`), which make an illegal import a *build* failure, not just a lint failure.

The second law is capability chokepoints. Beyond ring direction, exactly one file may perform each dangerous effect: one corpus writer, one git committer, one retrieval predicate, one cost ledger, one secrets reader, one SQLite handle, one Chromium launcher, one process spawner, one clock, one id factory, one RNG, one network egress, one manifest writer, one config resolver. These are enforced by pointing `dependency-cruiser` at the *package name* (`better-sqlite3`, `playwright`, `node:child_process`) with a `pathNot` exemption for the single blessed file — a rule that cannot be worked around by adding a re-export.

The eight verbs are defined as **effect classes**, not as features: RESOLVE, SELECT, COMPOSE, GENERATE, RENDER, VALIDATE, PROPOSE, PUBLISH. A new verb is warranted only when a genuinely new external boundary appears; every other "we need X" is data (a registry YAML recipe, entity-type, provider descriptor, or check). A CI test asserts the verb union has exactly 8 members.

State machines are hand-rolled discriminated unions over table-driven transition maps, not XState. Persisted state must be human-diffable in markdown frontmatter and stable in SQLite across library upgrades; four machines with ≤7 states each do not repay a runtime dependency whose persisted-snapshot shape is library-versioned. XState v5 (5.32.5 stable; v6 is alpha only) stays HOLD with a named revisit trigger.

Finally: idempotency comes from freezing everything at plan time into a `planHash` including the corpus commit SHA, so a replay can never silently use a newer brand version; concurrency is bounded by explicit pools with git and SQLite serialized; and every output that exists without a manifest is defined as a bug.


### Kurallar (48)

#### `ring-import-direction` · BLOCKING

Each ring is a pnpm workspace package and imports strictly downward: `@suite/contracts` imports nothing internal; `@suite/kernel` imports only contracts; `@suite/registry`, `@suite/corpus`, `@suite/providers`, `@suite/render` import only kernel + contracts; `@suite/derived` imports kernel/corpus/contracts; `@suite/engine` imports all of the above; `@suite/server` imports engine + contracts; `@suite/cli` imports server + engine; `@suite/ui` imports `@suite/contracts` and nothing else.

- **Neden:** Without a mechanical direction, Ring 0 acquires a dependency on Ring 3 within weeks (kernel needs 'just one' FTS query), the gitignored derived index stops being rebuildable, and the kernel can no longer be reasoned about or tested offline.
- **Zorlama:** Flat ESLint config, `eslint-plugin-import` `import/no-restricted-paths`:
```js
"import/no-restricted-paths": ["error", { basePath: ".", zones: [
  { target: "./packages/kernel",   from: "./packages", except: ["./kernel","./contracts"], message: "Ring 0 kernel may only import @suite/contracts." },
  { target: "./packages/contracts",from: "./packages", except: ["./contracts"], message: "contracts is a leaf." },
  { target: "./packages/registry",from: "./packages", except: ["./registry","./kernel","./contracts"] },
  { target: "./packages/corpus",  from: "./packages", except: ["./corpus","./kernel","./contracts"] },
  { target: "./packages/derived", from: "./packages", except: ["./derived","./corpus","./kernel","./contracts"] },
  { target: "./packages/ui",      from: "./packages", except: ["./ui","./contracts"], message: "UI talks to the server over HTTP; it may only import @suite/contracts." }
]}]
```
PLUS `dependency-cruiser@18` `.dependency-cruiser.cjs` forbidden rule `kernel-is-a-leaf` (`from: {path:"^packages/kernel/src"}, to:{path:"^packages/(registry|corpus|derived|render|providers|engine|server|ui|cli)/"}`), run in CI as `pnpm dlx depcruise packages --config .dependency-cruiser.cjs`.

#### `ts-project-references` · BLOCKING

Every package sets `"composite": true`, `"declaration": true`, `"declarationMap": true` and lists its legal dependencies in `references`; the repo root has a solution `tsconfig.json` with `"files": []` and `references` to every package; the only sanctioned build command is `tsc -b`.

- **Neden:** Lint rules are advisory to the type checker — a developer can silence ESLint and still compile. Project references make an out-of-ring import a hard compile error ('cannot find module') because the referencing project's .d.ts outputs are simply not on the path.
- **Zorlama:** CI step `pnpm exec tsc -b --force` must pass; a script `scripts/check-refs.ts` asserts that for every package, `tsconfig.json#references` is exactly the set of `package.json#dependencies` matching `@suite/*`, and fails on drift. `composite` requires `declaration` and that every implementation file is matched by `include`/`files` (TypeScript handbook, Project References).

#### `no-cycles` · BLOCKING

No import cycle is permitted at module scope or at folder scope, anywhere under `packages/`.

- **Neden:** A single cycle destroys the incremental build, makes `tsc -b` topological ordering impossible, and turns 'which ring owns this?' into an unanswerable question.
- **Zorlama:** `dependency-cruiser` forbidden rules: `{ name:"no-circular", severity:"error", from:{}, to:{circular:true} }` and a second copy with `scope: "folder"` (folder scope catches `main/index.ts → utl/helper.ts → main/utl.ts`, which is not a module-level cycle). Run in the same CI step as ring-import-direction.

#### `no-deep-cross-package-imports` · BLOCKING

Cross-package imports use the package name and its declared `exports` subpaths only (`@suite/kernel`, `@suite/kernel/verbs`); relative paths that escape a package root (`../../corpus/src/...`) are forbidden, and every internal dependency is declared as `"@suite/x": "workspace:*"`.

- **Neden:** Deep relative imports bypass every boundary check above (both ESLint zones and dependency-cruiser rules are written against package roots, but a `../../` path also bypasses the package `exports` map that defines the public surface). It also silently creates phantom dependencies that break when a package is extracted.
- **Zorlama:** `"import/no-relative-packages": "error"` plus a CI grep: `grep -rnE "from ['\"](\\.\\./){2,}" packages/*/src && exit 1`. pnpm's default isolated `node_modules` layout already prevents importing an undeclared dependency, so an omitted `workspace:*` entry fails at build time.

#### `kernel-never-reads-attributes` · BLOCKING

No file under `packages/kernel/src/` may reference the identifier `attributes` on a record, index into `record.attributes`, or accept a type parameter resolved from user-defined entity-type fields; the kernel's view of a record is exactly its ~10 fixed system fields.

- **Neden:** This is the inviolable already-decided law. The moment kernel branches on a user attribute, the registry stops being data and becomes a coupled schema — every YAML edit becomes a potential kernel bug and Ring 1 loses its runtime-editability.
- **Zorlama:** CI script: `grep -rnE '\\battributes\\b' packages/kernel/src/ && exit 1`, with the sole allowance being the type declaration `readonly attributes: Readonly<Record<string, unknown>>` in `packages/contracts/src/record.ts` (kernel may pass it through, never read it). Back it with a type-level guard: kernel functions take `SystemRecord` (a type that structurally omits `attributes`), and the omission is asserted in a type test using `expectTypeOf<SystemRecord>().not.toHaveProperty('attributes')`.

#### `ui-is-node-free` · BLOCKING

`packages/ui` must not import any `node:` builtin, any Node-only package (`better-sqlite3`, `playwright`, `simple-git`, `fs-extra`), or `@suite/kernel`; it consumes typed DTOs from `@suite/contracts` and reaches the system only through the Hono HTTP API.

- **Neden:** A single accidental `node:path` import in the SPA breaks the Vite build in a way that is usually 'fixed' by adding a polyfill, which then permanently welds the browser bundle to server internals and lets UI code read the corpus directly.
- **Zorlama:** In the `packages/ui/**` ESLint block: `"no-restricted-imports": ["error", { patterns: [{ group: ["node:*","better-sqlite3","playwright","playwright-core","@suite/kernel","@suite/derived"], message: "UI is browser-only; go through the API." }] }]`. `packages/ui/tsconfig.json` sets `"types": []` and omits `@types/node`, so any Node global also fails `tsc -b`.

#### `registry-is-data-not-code` · BLOCKING

Nothing under `registry/` may be executable: no JS/TS files, no YAML tags that construct objects, no template expressions that call functions. Registry YAML is loaded with a safe-schema parser and validated against a Zod schema before any other code sees it.

- **Neden:** The whole point of Ring 1 is that the user edits it at runtime without a deploy. If registry files can execute, editing them is a code change with code-change risk, and a malformed edit takes the process down instead of producing a validation error.
- **Zorlama:** CI: `find registry -type f ! -name '*.yaml' ! -name '*.yml' | grep . && exit 1`. Loader uses `yaml`'s core schema with custom tags disabled and validates with `zod@4` in `packages/registry/src/load.ts`; a unit test feeds every file in `registry/**` through the schema and asserts zero throws.

#### `exactly-eight-verbs` · BLOCKING

The kernel exposes exactly eight verbs and no more: RESOLVE, SELECT, COMPOSE, GENERATE, RENDER, VALIDATE, PROPOSE, PUBLISH. They are the sole members of the `Verb` union in `packages/kernel/src/verbs/index.ts`.

- **Neden:** Verb count is the single best proxy for kernel surface area. Every added verb is a new thing that must be scheduled, costed, retried, logged, replayed and shown in the UI — the combinatorial cost is 8x, not 1x.
- **Zorlama:** `packages/kernel/test/verbs.test.ts`: `assert.equal(Object.keys(VERBS).length, 8)` and a snapshot test of the sorted verb names, run under `node --test`. Any PR changing that snapshot fails until the snapshot is updated, which forces the ADR in `new-verb-requires-adr`.

#### `verb-effect-classes` · BLOCKING

Each verb owns exactly one effect class and may perform no other: RESOLVE = read Ring 1 + config, no network, no writes. SELECT = read Ring 2/3, no network, no writes. COMPOSE = pure function of (selected records, recipe) → document model. GENERATE = the only verb permitted to call a model provider. RENDER = the only verb permitted to touch the browser pool or FFmpeg. VALIDATE = read-only, no network. PROPOSE = the only verb permitted to write into the working tree / create draft records and assets. PUBLISH = the only verb permitted to call a channel API.

- **Neden:** Effect classes are what make offline mode, cost accounting, replay and blast-radius reasoning tractable. If RENDER could quietly call an LLM, the cost estimate shown before the run is a lie and the offline lane silently breaks.
- **Zorlama:** `dependency-cruiser` forbidden rules keyed on verb directories, e.g.
```js
{ name:"only-generate-hits-providers", severity:"error",
  from:{ path:"^packages/kernel/src/verbs/", pathNot:"^packages/kernel/src/verbs/generate/" },
  to:{ path:"^packages/providers/" } },
{ name:"only-render-launches-chromium", severity:"error",
  from:{ path:"^packages/", pathNot:"^packages/render/src/browser-pool\\.ts$" },
  to:{ path:"node_modules/(playwright|playwright-core)" } },
{ name:"only-propose-writes", severity:"error",
  from:{ path:"^packages/kernel/src/verbs/", pathNot:"^packages/kernel/src/verbs/propose/" },
  to:{ path:"^packages/corpus/src/writer" } }
```

#### `verb-signature` · BLOCKING

Every verb has the identical signature `(<input>: VerbInput<TParams>, ctx: VerbContext) => Promise<Result<VerbOutput, AppError>>`, where `VerbInput` carries `{ runId, stepId, params, frozen }` and `VerbOutput` carries `{ artifacts: ArtifactRef[], costEvents: CostEvent[], facts: Record<string, JsonValue> }`. Verbs never throw for expected failure and never read ambient state (no `process.env`, no `Date.now()`, no `Math.random()`, no direct `fs`).

- **Neden:** A uniform signature is what lets the engine schedule, retry, cancel, cost and replay all eight verbs with one code path. Ambient reads are what make a run non-replayable.
- **Zorlama:** Type-level: `packages/kernel/src/verbs/index.ts` declares `const VERBS: Record<VerbName, VerbFn>` so a wrong signature fails `tsc -b`. Ambient reads: ESLint `no-restricted-globals` for `Math.random`/`Date` inside `packages/kernel/src/verbs/**` plus dependency-cruiser rules forbidding those directories from reaching `node:fs`, `node:child_process` and `packages/kernel/src/secrets/`. `eslint no-throw-literal` plus CI grep `grep -rn 'throw new' packages/kernel/src/verbs/ && exit 1`.

#### `verb-progress-and-cost-contract` · BLOCKING

A verb reports progress only through `ctx.progress({ done, total, label })` (label is an English enum key, never a formatted Turkish string) and reports cost only by returning `costEvents: CostEvent[]` in its output — never by writing to the ledger itself. `CostEvent` is `{ providerId, capability, lane: 'free'|'premium', units: Record<string, number>, estimatedMinor: number, actualMinor: number|null, currency: 'TRY'|'USD' }`.

- **Neden:** If verbs write cost directly, a failed or cancelled step leaves half-recorded cost, and there is no single place to enforce budget caps. Returning cost as data means the engine records it in exactly one transaction alongside the step's terminal state.
- **Zorlama:** `dependency-cruiser`: `{ from:{path:"^packages/kernel/src/verbs/"}, to:{path:"^packages/kernel/src/cost/ledger"} }` is forbidden. The `VerbOutput` type makes `costEvents` required (use `[]` explicitly). A unit test asserts that for every verb with `effectClass: 'metered'` (GENERATE, RENDER, PUBLISH) a run with a stubbed provider produces at least one CostEvent.

#### `new-verb-requires-adr` · BLOCKING

A ninth verb may be added only if it introduces a genuinely new external boundary (a new class of side effect on the outside world) that none of the eight covers. If the need can be expressed as a new entity-type, recipe, provider descriptor, channel, template or check, it is DATA and a verb must not be added. Any verb-count change requires an ADR in `docs/adr/` answering, in order: (1) which of the 8 effect classes could host this, and why not; (2) what new external boundary it crosses; (3) what its replay semantics are.

- **Neden:** Every real pressure to add a verb in a content system ('we need a TRANSLATE verb', 'we need a SCHEDULE verb', 'we need a RESIZE verb') is actually a recipe step with different params. Without a written test, the eight becomes fourteen in a year and Ring 0 stops being fixed.
- **Zorlama:** The verb-count snapshot test (see `exactly-eight-verbs`) fails; CI job `adr-required` fails when `packages/kernel/src/verbs/index.ts` changes without a new file under `docs/adr/` in the same PR (`git diff --name-only origin/main...HEAD`).

#### `state-is-a-transition-table` · BLOCKING

Each of the four lifecycles is a `const` transition table of shape `Record<State, Partial<Record<Event, { to: State; actor: Actor; persists: readonly string[] }>>>` living in one file per machine under `packages/kernel/src/state/`. Transitions are applied only by `applyTransition(machine, current, event, actor)`; no code anywhere assigns a status field directly.

- **Neden:** Scattered `record.status = 'approved'` assignments are how illegal states appear (published assets that were never qa-passed, superseded records with no successor). A table makes the legal graph readable in one screen and diffable in review.
- **Zorlama:** CI grep: `grep -rnE "\\.(status|state)\\s*=" packages/ --include=*.ts | grep -v 'packages/kernel/src/state/apply.ts' && exit 1`. `applyTransition` returns `Result<State, IllegalTransition>` and its exhaustiveness is checked by a `never` assertion in the default branch, so an unhandled state fails `tsc -b`.

#### `run-lifecycle` · BLOCKING

RUN states are exactly `queued | planning | awaiting-approval | executing | succeeded | failed | cancelled`. Legal transitions: queued→planning (engine); planning→awaiting-approval (engine, after plan is frozen and cost estimated); planning→failed (engine); awaiting-approval→executing (HUMAN only); awaiting-approval→cancelled (human or budget-cap guard); executing→succeeded|failed (engine); executing→cancelled (human); queued→cancelled (human). `succeeded`, `failed`, `cancelled` are terminal — a 'rerun' is a new runId. Persisted at planning→awaiting-approval: the full frozen plan, planHash, corpusCommit, registryCommit, effectiveConfig with provenance, cost estimate per step and total. Persisted at each executing step boundary: step status, timings, input/output hashes, attempts, actual cost.

- **Neden:** awaiting-approval is the architectural expression of 'agents propose, humans apply'. Making it a distinct state (rather than a boolean flag) means the engine physically cannot spend money before a human transition, and the budget cap has one place to intervene.
- **Zorlama:** The transition table's `actor` field is `'human'` for awaiting-approval→executing; `applyTransition` rejects any engine-actor call. Integration test `run-fsm.test.ts` enumerates all 49 (state, event) pairs and asserts exactly the legal set succeeds. HTTP: the Hono route that triggers execution is the only route mounted behind the `requireHumanActor` middleware.

#### `asset-lifecycle` · BLOCKING

ASSET states are exactly `draft | qa-passed | approved | published | retired`. Legal transitions: draft→qa-passed (engine, only on a VALIDATE verdict with zero blocking findings); qa-passed→draft (engine, on any content edit — the verdict is invalidated); qa-passed→approved (HUMAN, = a git commit); approved→published (PUBLISH verb, records the channel permalink); approved→retired, published→retired, draft→retired (human). There is no draft→approved edge and no qa-passed→published edge.

- **Neden:** The missing edges are the rule. Without them, a rushed evening ships an unvalidated Instagram carousel with a broken safe zone, and nobody can reconstruct whether QA ever ran.
- **Zorlama:** Transition table + `applyTransition`. Additionally `packages/kernel/src/verbs/publish/` asserts `asset.state === 'approved'` and returns `Err(NotApproved)` otherwise; a test asserts PUBLISH rejects each of the other four states. The qa-passed→draft invalidation is triggered by comparing the asset's `contentHash` to the hash recorded on the verdict.

#### `record-lifecycle` · BLOCKING

RECORD states are exactly `draft | active | pinned | superseded | retired`. Legal transitions: draft→active (HUMAN, = a git commit); active→pinned and pinned→active (human); active|pinned→superseded (human, and the transition MUST carry a `supersededBy` record id that exists and is `active`); any→retired (human). `superseded` and `retired` records are excluded from SELECT by default; `pinned` records are always included by SELECT regardless of relevance score.

- **Neden:** `pinned` is the escape hatch that makes retrieval trustworthy without a vector DB — the human forces the brand spine into every run. `supersededBy` being mandatory is what prevents the corpus from accumulating orphaned truth with no forward pointer.
- **Zorlama:** Zod frontmatter schema: `z.discriminatedUnion('state', [...])` where the `superseded` variant requires `supersededBy: z.string()`. A corpus-integrity CI script resolves every `supersededBy` and fails on dangling or non-active targets. Because all four state changes are human-actor, the derived index rebuild recomputes state purely from committed frontmatter.

#### `job-queue-lifecycle` · BLOCKING

The SQLite `jobs` table uses states `pending | leased | running | done | error | dead | cancelled` with columns `(id TEXT PRIMARY KEY, run_id, step_id, state, lease_owner, lease_expires_at, attempts, max_attempts, next_attempt_at, payload_json, error_json, created_at, updated_at)`. Legal transitions: pending→leased (worker, conditional UPDATE); leased→running (worker); leased→pending (lease reaper, when `lease_expires_at < now`); running→done; running→error; error→pending (retry, when `attempts < max_attempts`, with `next_attempt_at = now + backoff`); error→dead (when `attempts >= max_attempts`); pending|leased|running→cancelled (human, via the RUN cancel).

- **Neden:** A lease with an expiry (rather than a plain 'running' flag) is what makes the queue survive a killed process. Without a reaper, one `SIGKILL` during a render leaves a job wedged in `running` forever with no way to distinguish it from a live one.
- **Zorlama:** Claiming is a single conditional statement — `UPDATE jobs SET state='leased', lease_owner=?, lease_expires_at=?, attempts=attempts+1 WHERE id=(SELECT id FROM jobs WHERE state='pending' AND next_attempt_at<=? ORDER BY created_at LIMIT 1) RETURNING *` — wrapped in `db.transaction(fn).immediate()` (better-sqlite3 `BEGIN IMMEDIATE`). A `CHECK (state IN (...))` constraint on the column; a test that kills the worker mid-job and asserts the reaper returns it to `pending`.

#### `hand-rolled-fsm-not-xstate` · BLOCKING

All four lifecycles are hand-rolled discriminated unions over transition tables. XState is HOLD. Revisit only if a machine acquires nested/parallel states, history states, or long-running invoked actors with their own retry policies — record that trigger in `docs/adr/0003-state-machines.md`.

- **Neden:** Four machines with ≤7 flat states each, whose persisted form must be a human-diffable string in markdown frontmatter and a stable TEXT column in SQLite, do not repay a runtime dependency. XState's value (actor model, invoked services, inspector) is real but its persisted-snapshot shape is library-versioned — adopting it couples years of committed corpus frontmatter and queue rows to a library upgrade path. XState v5 is currently 5.32.5 and a v6 alpha is already published, which makes that coupling a live risk rather than a theoretical one.
- **Zorlama:** ADR recorded; `dependency-cruiser` `forbidden` rule `{ name:"no-fsm-lib", severity:"error", from:{path:"^packages/"}, to:{path:"node_modules/(xstate|@xstate|robot3|javascript-state-machine)"} }`. Reviewer checklist item on any PR adding a state.

#### `every-transition-emits-an-event` · BLOCKING

Every successful transition on every machine appends one immutable row to `events(id, ts, run_id, entity_type, entity_id, from_state, to_state, event, actor, actor_kind, payload_json)` in the derived DB, and — for RECORD and ASSET — the same fact is expressed in the git commit that carries it (commit trailer `Suite-Transition: <entity>:<id> <from>-><to>`).

- **Neden:** Ring 3 is gitignored and rebuildable, so the derived events table can be lost. Putting the human-actor transitions in commit trailers means the authoritative history survives an index wipe and is reconstructible by `git log`.
- **Zorlama:** `applyTransition` writes the event row in the same `db.transaction()` as the state change; there is no code path that updates state without it (single function, see `state-is-a-transition-table`). CI: the index-rebuild test drops the DB, replays `git log --format=%(trailers)`, and asserts the reconstructed RECORD/ASSET states equal the states in frontmatter.

#### `single-corpus-writer` · BLOCKING

`packages/corpus/src/writer.ts` is the only module in the repo that may write, rename or delete anything under `corpus/`, `assets/` or `templates/`. It is also the only module that may import `node:fs`/`node:fs/promises` for writing. Every write goes through `writeRecord(ref, frontmatter, body)` which validates against the entity-type schema, canonicalises YAML key order, writes to a temp file and `rename()`s into place.

- **Neden:** One writer is what makes the corpus's on-disk invariants (one record per file, valid frontmatter, deterministic key order, atomic replacement) actually hold. Scattered writes produce half-written files during a crash and noisy diffs from reordered YAML keys.
- **Zorlama:** `dependency-cruiser`: `{ name:"one-corpus-writer", severity:"error", from:{ path:"^packages/", pathNot:"^packages/corpus/src/writer\\.ts$" }, to:{ path:"node_modules/(fs-extra|write-file-atomic)|^node:fs" } }` (with `options.doNotFollow` not excluding builtins, i.e. `options.moduleSystems` includes core). Plus CI grep `grep -rn "writeFile\\|rename\\|rmSync\\|unlink" packages --include=*.ts | grep -v 'corpus/src/writer.ts' && exit 1`.

#### `single-git-committer` · BLOCKING

`packages/corpus/src/git.ts` is the only module that may invoke git. It exposes exactly `openWorktree(runId, commitish)`, `stage(paths)`, `commit(message, trailers)`, `currentCommit()`, `closeWorktree(runId)`. No other file may spawn `git` or import a git library.

- **Neden:** Git is the APPLY mechanism and therefore the security boundary of 'agents propose, humans apply'. Two modules shelling out to git concurrently in the same worktree contend on `.git/index.lock` and, worse, one run's `git add -A` stages the other run's files into the wrong commit.
- **Zorlama:** `dependency-cruiser` forbids `node:child_process` and `simple-git` from every path except `^packages/corpus/src/git\\.ts$`. CI grep for the literal `'git '` in spawn arguments outside that file.

#### `single-retrieval-predicate` · BLOCKING

The decision 'which records are in scope for this step' lives in exactly one function, `packages/kernel/src/retrieval/predicate.ts#buildPredicate(scope): RetrievalPredicate`, which returns a declarative object; `@suite/derived` compiles that object to SQL/FTS5 and `@suite/corpus` can evaluate the same object in-memory over parsed files. No SQL literal containing record filtering may exist outside `packages/derived/src/queries/`.

- **Neden:** Retrieval quality is the whole product. If the predicate is duplicated (once in SQL for the UI browser, once in TS for the pipeline), the content an agent sees drifts from the content the human reviewed, and every 'why did it use the old positioning?' bug becomes unanswerable.
- **Zorlama:** CI grep: `grep -rniE "(SELECT .* FROM records|MATCH )" packages --include=*.ts | grep -v 'packages/derived/src/queries/' && exit 1`. A property test runs the same `RetrievalPredicate` through both the SQL compiler and the in-memory evaluator over a fixture corpus and asserts identical id sets — this also guarantees the offline fallback path stays honest.

#### `single-cost-ledger` · BLOCKING

`packages/kernel/src/cost/ledger.ts` is the only module that inserts into `cost_events`, and `packages/kernel/src/cost/estimate.ts` is the only module that evaluates a provider descriptor's cost formula. Estimation and actualisation use the same formula function; the estimate is stored on the plan, the actual on the step.

- **Neden:** 'Cost estimate shown before the run' is a promise to the user. If estimation and actualisation use different code, the estimate is systematically wrong in a direction nobody notices until the bill arrives, and budget caps become decorative.
- **Zorlama:** `dependency-cruiser` rule allowing `to: {path:"^packages/kernel/src/cost/ledger"}` only `from: {path:"^packages/engine/src/record-step\\.ts$"}`. A test asserts `estimate(desc, units) === actual(desc, units)` for identical unit vectors across every descriptor in `registry/providers/**`. CI grep for `INSERT INTO cost_events` outside `ledger.ts`.

#### `single-secret-reader` · BLOCKING

`packages/kernel/src/secrets/index.ts` is the only module that may read `process.env` for credentials; it exposes `getSecret(ref: SecretRef): Result<Secret, MissingSecret>` where `Secret` is an opaque branded type whose `toString()`/`toJSON()` return `'[redacted]'`. Provider descriptors reference secrets by name (`apiKeyEnv: OPENAI_API_KEY`), never by value, and secrets never enter a plan, a manifest, a log line or the derived DB.

- **Neden:** A single `console.log(config)` in a run that later gets committed as part of a manifest leaks an API key into git history permanently — and this repo commits its own outputs by design.
- **Zorlama:** ESLint `no-restricted-globals`/`no-restricted-properties` for `process.env` outside `packages/kernel/src/secrets/**` and `packages/*/src/config/env.ts`. The branded type's `toJSON` makes `JSON.stringify` safe by construction; a test asserts `JSON.stringify({k: secret})` contains `[redacted]`. Pre-commit hook runs a secret scanner over the staged diff, including `derived/`-copied manifests.

#### `the-exactly-one-registry` · BLOCKING

Maintain `docs/CHOKEPOINTS.md` as the authoritative list of things there must be exactly one of, and keep it in sync with a machine-readable `chokepoints.json` that CI enforces. The list is: (1) corpus writer, (2) git invoker, (3) retrieval predicate, (4) cost estimator+ledger, (5) secrets reader, (6) SQLite handle, (7) Chromium launcher, (8) FFmpeg/child-process spawner, (9) outbound HTTP client, (10) clock, (11) id factory (UUIDv7), (12) RNG (seeded), (13) path resolver (name→absolute path), (14) YAML/frontmatter parser+validator, (15) config resolver, (16) manifest writer, (17) error taxonomy, (18) transition applier, (19) job queue, (20) logger, (21) provider invoker, (22) channel publisher, (23) plan freezer/hasher.

- **Neden:** Every one of these, when duplicated, produces a class of bug that is invisible in review and expensive in production: two clocks make replay non-deterministic; two HTTP clients make offline mode a lie; two path resolvers let a run write outside the repo; two parsers make a file valid in the indexer and invalid in the pipeline.
- **Zorlama:** `chokepoints.json` maps each chokepoint to `{ allowedFile, forbiddenTargets[] }`; `scripts/check-chokepoints.ts` generates the corresponding `dependency-cruiser` forbidden rules at build time and CI runs `depcruise` against the generated config, so adding a chokepoint to the doc automatically adds its enforcement. A test asserts every entry in `chokepoints.json` resolves to an existing file.

#### `one-clock-one-rng-one-id` · BLOCKING

Time comes only from `kernel/src/time/clock.ts#now()`, randomness only from `kernel/src/rng.ts#rng(seed)`, ids only from `kernel/src/ids.ts#newId(prefix)` which returns a prefixed UUIDv7 (`run_0192...`). The run's seed is frozen into the plan; `Date`, `Date.now`, `Math.random` and `crypto.randomUUID` are banned outside those three files.

- **Neden:** Replay is impossible if a verb can read the wall clock or unseeded randomness. UUIDv7 specifically because it is time-ordered and sorts correctly as opaque raw bytes (RFC 9562 §5.7, §6.11), which makes the SQLite job queue's `ORDER BY id` index-friendly without a separate sequence column.
- **Zorlama:** ESLint `no-restricted-globals: ["error", "Date"]` scoped to `packages/kernel/src/verbs/**` and `packages/engine/**`, plus `no-restricted-properties` for `Math.random` and `crypto.randomUUID`; exemption blocks for the three blessed files. Use `uuid@14`'s `v7()`. A determinism test runs the same plan twice with a stubbed provider and asserts byte-identical outputs.

#### `plan-freeze-list` · BLOCKING

At the planning→awaiting-approval transition the plan is frozen and must contain, at minimum: `corpusCommit` (SHA), `registryCommit` (SHA), `kernelVersion`, the resolved step DAG, for each step the resolved `providerId` + `modelId` + `providerDescriptorHash` + `lane`, all resolved params after config layering, the RNG seed, the selected record ids WITH their content hashes, the template paths WITH their content hashes, and the per-step and total cost estimate. Nothing in this list may be re-resolved at execution time.

- **Neden:** 'Pipelines request capabilities, never model ids' is a plan-time rule, not an execution-time rule. If capability→model resolution happens during execution, the run that a human approved at 40 TRY can execute against a different, more expensive model, and the replay of a run can silently use a model that did not exist when it was approved.
- **Zorlama:** `FrozenPlan` is a Zod schema with all fields required and `.strict()`; `VerbContext` exposes `frozen: FrozenPlan` and does NOT expose the registry loader, the provider resolver or the config resolver — enforced by `dependency-cruiser` forbidding `packages/kernel/src/verbs/**` → `packages/registry/**` and → `packages/kernel/src/config/resolve`. A test asserts `Object.isFrozen` deep over the plan object.

#### `plan-hash-is-the-identity` · BLOCKING

`planHash = sha256(canonicalJson(frozenPlan minus {runId, createdAt}))`. Two runs with the same planHash must produce identical outputs for the deterministic verbs (RESOLVE, SELECT, COMPOSE, RENDER, VALIDATE); step outputs are content-addressed in `derived/cas/<sha256>` and a replay with a matching planHash reuses cached step outputs instead of re-spending.

- **Neden:** This is what makes iteration affordable: changing one slide of a deck re-renders one step, not the whole premium-lane pipeline. It also turns 'is this reproducible?' into a hash comparison rather than an argument.
- **Zorlama:** `canonicalJson` sorts keys and rejects `undefined`/`NaN`/`Infinity`; a test asserts key-order independence. A replay test executes a fixture plan twice and asserts the second run performs zero provider calls and zero renders (assert on the stubbed provider's call count).

#### `replay-pins-brand-version` · BLOCKING

A replay checks out `frozenPlan.corpusCommit` into a dedicated git worktree and reads the corpus from there. If the user asks to replay 'at current HEAD', that is a NEW run with a NEW planHash, and the UI must first show a diff listing every selected record whose content hash changed between `corpusCommit` and HEAD. A run may never silently execute against a corpus state other than the one in its plan.

- **Neden:** The corpus IS the brand. Silent replay against a moved HEAD produces a deck that looks like last quarter's approved deck but quotes this quarter's unapproved positioning — the single most damaging failure mode this system can have, because it is invisible in the output.
- **Zorlama:** The SELECT verb receives a worktree path from `frozen.corpusCommit` only; `packages/corpus/src/git.ts#openWorktree` throws if asked for a commitish not present in the plan. Integration test: freeze a plan, mutate a selected record, commit, replay, assert the run either reproduces the old content or refuses with `CorpusMoved` — never produces new content under the old runId. Every manifest records `corpusCommit`, and a CI check asserts `manifest.corpusCommit === plan.corpusCommit`.

#### `git-writes-serialised-worktree-per-run` · BLOCKING

Every run that touches the working tree gets its own `git worktree` under `derived/worktrees/<runId>`; commits and any ref update are serialised through one in-process async mutex in `packages/corpus/src/git.ts` plus a `proper-lockfile` lock on `.git/suite.lock` for cross-process safety. `git add -A` and `git add .` are forbidden — only explicit path lists.

- **Neden:** Worktrees give each run its own `HEAD` and `index` (git-worktree docs: 'sharing everything except per-worktree files such as HEAD, index'), which removes index.lock contention. What worktrees do NOT isolate is the object store and refs, so branch creation and commits still race — hence the mutex. And `git add -A` in a shared tree is how one run commits another run's half-written draft.
- **Zorlama:** CI grep: `grep -rnE "add\\s+(-A|\\.)" packages/corpus/src/git.ts && exit 1`. All exported git functions in that module are wrapped by a single `withGitLock()` higher-order function; a test asserts that calling `commit()` twice concurrently serialises (instrumented via a counter). Worktree cleanup runs in a `finally` and a startup reaper prunes `derived/worktrees/*` for terminal runs.

#### `sqlite-single-writer-off-the-event-loop` · BLOCKING

`packages/derived/src/db.ts` opens the one and only `better-sqlite3` handle, sets `journal_mode = WAL` and `busy_timeout = 5000` at open, wraps every multi-statement write in `db.transaction(fn).immediate()`, and runs inside a dedicated worker thread or the queue-worker process — never inside the Hono request handler. Any single statement expected to exceed 5ms must be paginated.

- **Neden:** better-sqlite3 is synchronous by design; a full FTS5 rebuild executed in the Hono process freezes the API and the SPA's run queue for the duration. `BEGIN IMMEDIATE` acquires the write lock up front, avoiding the SQLITE_BUSY-on-upgrade deadlock pattern; the 5000ms default busy timeout otherwise silently manifests as random 'database is locked' errors under parallel steps.
- **Zorlama:** `dependency-cruiser`: `{ name:"one-sqlite-handle", severity:"error", from:{path:"^packages/", pathNot:"^packages/derived/src/db\\.ts$"}, to:{path:"node_modules/better-sqlite3"} }` and `{ from:{path:"^packages/server/src/routes/"}, to:{path:"^packages/derived/src/db"} }` forbidden (routes go through the worker RPC). A test asserts `db.pragma('journal_mode')` returns `wal` and that `db.transaction(...).immediate` is used, via a lint grep for bare `db.transaction(` without `.immediate()`/`.deferred()`.

#### `bounded-parallelism-pools` · BLOCKING

Parallelism is expressed only as named `p-queue` instances declared in one file, `packages/engine/src/pools.ts`: `providerPool` (concurrency from config, default 4, per-provider sub-queues), `renderPool` (concurrency 2, guards BrowserContexts), `ffmpegPool` (concurrency = max(1, cores/2)), `gitQueue` (concurrency 1), `dbQueue` (concurrency 1). No verb may create a promise fan-out (`Promise.all` over unbounded work) outside a pool.

- **Neden:** Unbounded `Promise.all` over 40 carousel slides launches 40 Chromium contexts and OOMs a laptop, or hits a provider rate limit and burns the premium-lane budget on retries. Named pools make the concurrency budget one grep away.
- **Zorlama:** ESLint custom restriction / CI grep: `grep -rn "Promise.all" packages/kernel packages/engine --include=*.ts | grep -v 'pools.ts' && exit 1` (allow `Promise.allSettled` only inside pools). Pool concurrencies are read from the resolved config and printed in the pre-run effective-config table.

#### `one-chromium-many-contexts` · BLOCKING

`packages/render/src/browser-pool.ts` is the only file that calls `chromium.launch()`; it keeps at most one browser process per profile, hands out `BrowserContext`s (never shared pages), and always closes the context in a `finally`. Screenshot, `page.pdf()` and HyperFrames motion rendering all go through it. `page.emulateMedia()` is set explicitly before `page.pdf()`.

- **Neden:** Launching a browser per render is the dominant cost of a deck run and the dominant source of zombie processes. Contexts give per-render isolation of cookies/storage without the launch cost. `page.pdf()` renders with print CSS media by default (Playwright docs), so a deck authored for screen silently loses its background colours unless media is emulated deliberately.
- **Zorlama:** `dependency-cruiser` `only-chromium-launcher` rule (see `verb-effect-classes`). A test asserts that rendering 10 pages results in exactly 1 `launch()` call and 10 `newContext()`/`close()` pairs, and that the process count returns to baseline afterwards.

#### `config-precedence` · BLOCKING

Effective config is the merge of exactly four layers, lowest to highest: (1) kernel defaults in `packages/kernel/src/config/defaults.ts` (typed constants, the only place a default value may be written); (2) registry YAML under `registry/` (committed, user-editable at runtime); (3) user overrides in `.suite/config.local.yaml` (gitignored, machine-local); (4) run-time overrides supplied with the run request (CLI flags or the UI run form), which apply to that run only and are recorded in the plan. Merging is deep for objects, replace-not-concat for arrays. Secrets are NOT a config layer — they are resolved separately by reference.

- **Neden:** Four unordered sources of truth is how 'why did it use the free lane?' becomes a 30-minute investigation. Replace-not-concat for arrays because concat semantics make it impossible to remove a default provider from a lane.
- **Zorlama:** `packages/kernel/src/config/resolve.ts#resolveConfig(layers): { value: Config, provenance: Record<KeyPath, LayerName> }` is the only merge implementation; `dependency-cruiser` forbids any other module from importing `defaults.ts` or the YAML loader. A test asserts precedence for a representative key across all four layers and asserts array replacement.

#### `effective-config-shown-before-run` · BLOCKING

The awaiting-approval screen must show, before the human approves: the resolved lane per step, the resolved provider and model per step, the cost estimate per step and total with currency, the remaining budget under the applicable cap, and a provenance table listing every config key whose effective value did NOT come from defaults, with the layer that set it. Approval is disabled while the estimate is stale relative to the planHash.

- **Neden:** An approval gate that shows a spinner and a button is not a gate. The provenance table is what catches 'my local override from three weeks ago is silently forcing premium'.
- **Zorlama:** The Hono endpoint returns `FrozenPlan` + `provenance` and the SPA renders it from a single component; a Playwright UI test asserts the presence of the provenance table and that the approve button is disabled when `planHash !== estimate.planHash`. A backend test asserts the endpoint never returns a plan with `provenance` omitted (required field in the DTO).

#### `manifest-or-it-is-a-bug` · BLOCKING

Every artifact produced by any run has a manifest, and an output file that exists without a manifest entry referencing its sha256 is a bug, not a feature. `derived/runs/<runId>/manifest.json` must contain: `runId`, `planHash`, `corpusCommit`, `registryCommit`, `kernelVersion`, `startedAt`/`endedAt`, `lane`, `effectiveConfig` + `provenance`, `inputs[]` (record id + contentHash), `steps[]` (`stepId`, `verb`, `state`, timings, `attempts`, `providerId`, `modelId`, `inputHashes`, `outputHashes`, `costEstimateMinor`, `costActualMinor`), `outputs[]` (`path`, `sha256`, `bytes`, `mime`), `totals`, `errors[]`. When an asset is APPLIED (committed), a trimmed copy of its manifest is committed beside it.

- **Neden:** Six months from now the only question that matters about a published Instagram post is 'which brand records and which model produced this, and did QA pass?'. Without a committed manifest that question is unanswerable and the repo stops being a source of truth.
- **Zorlama:** `packages/kernel/src/manifest/write.ts` is the single writer (chokepoint #16) and the PROPOSE verb returns `Err(NoManifest)` if any produced artifact lacks an entry. CI script `scripts/check-manifests.ts` walks every committed file under `assets/` and fails if there is no sibling `*.manifest.json` whose `sha256` matches the file. Manifest shape is a Zod schema with `.strict()`.

#### `structured-logs-and-correlation` · BLOCKING

All logs are NDJSON on stdout via the single logger in `packages/kernel/src/log.ts` (pino 10.x). Every line carries `ts`, `level`, `event` (a stable snake_case English key from a closed enum), `runId`, `stepId`, `verb` when applicable. Correlation ids propagate via one `AsyncLocalStorage` store `{ runId, stepId, traceId }`; no function takes a `runId` parameter purely for logging. `console.log` is banned outside `packages/cli/src/render/`. Log keys and event names are English; Turkish text may appear only inside a `msg` or payload field, never as a key or enum value.

- **Neden:** Grepping a run's full history across the API process, the queue worker and the render pool is only possible if every line shares a correlation id. AsyncLocalStorage is Stability 2 (Stable) in Node and is the correct mechanism; threading runId manually through 8 verbs guarantees it gets dropped somewhere.
- **Zorlama:** ESLint `no-console: ["error", { allow: [] }]` with an override for the CLI renderer. A test asserts every emitted line parses as JSON and contains `runId` when emitted inside `als.run()`. CI grep for non-ASCII characters in the event-name enum: `grep -P '[^\\x00-\\x7F]' packages/kernel/src/log-events.ts && exit 1`.

#### `provider-failure-isolation` · BLOCKING

Every provider call goes through `packages/providers/src/invoke.ts`, which applies a per-provider circuit breaker (open after 3 consecutive failures, half-open after 60s), a per-provider timeout from the descriptor, and bounded retries with jittered backoff only for classified-retryable errors. On open circuit the engine falls back to the next provider that satisfies the same capability WITHIN THE SAME LANE; it must never silently fall back from premium to free or from free to premium.

- **Neden:** One provider having a bad afternoon must degrade one capability, not stop content production. Silent cross-lane fallback is worse than failing: a free-lane fallback produces visibly worse creative that ships under a premium approval, and a premium fallback spends money the human did not approve.
- **Zorlama:** `invoke.ts` is the sole importer of the HTTP client (dependency-cruiser chokepoint #9 and #21). A test asserts that with all same-lane providers open, the step fails with `NoProviderAvailable` rather than crossing lanes, and that the failure is recorded in the manifest with the breaker state. Lane is a required, non-defaulted field on the resolution call so omitting it fails `tsc -b`.

#### `quarantine-not-crash` · BLOCKING

A malformed record, a malformed registry file or an unparseable template never throws out of the loader. `parseRecord` returns `Result<Record, ParseError>`; the index rebuild collects failures into a `quarantine` table `(path, error, ts)`, excludes those files from SELECT, completes successfully, and the UI shows a persistent 'Corpus health: N quarantined' banner listing path and error. Registry validation failures block only the pipelines that reference the broken file.

- **Neden:** One typo in one of hundreds of markdown files must not make the whole command center unusable — that is the failure mode that makes people stop trusting the tool and go back to Notion. Equally, silently skipping bad files is how brand records disappear from retrieval without anyone noticing.
- **Zorlama:** `no-throw-literal` plus CI grep `grep -rn 'throw new' packages/corpus/src packages/registry/src | grep -v '/errors/' && exit 1`. A test seeds a fixture corpus with one file containing invalid YAML and asserts: rebuild exits 0, the good records are indexed, the bad one is in `quarantine`, and `GET /health/corpus` reports it.

#### `render-fails-loud` · BLOCKING

Every RENDER attaches listeners for `pageerror`, `console` (level error) and `requestfailed` before navigation, and fails the step on any of them. The render page runs with network egress restricted to `file://` and an explicit allowlist via `page.route()`; a template requesting an unlisted host fails the step. On failure the step attaches the template path, the last 50 console lines and a full-page screenshot to the manifest.

- **Neden:** A broken template's normal failure mode is a silently blank or half-styled image that looks plausible in a thumbnail and ships. Turning a page error into a step failure is the only way a headless renderer can be trusted unattended. The egress allowlist also enforces the offline guarantee — a template pulling a Google Font is an invisible network dependency.
- **Zorlama:** The listener attachment lives in `browser-pool.ts#withPage()`, which is the only way to obtain a `Page` (see `one-chromium-many-contexts`), so it cannot be forgotten. A test renders a fixture template that throws in script and asserts the step is `failed` with a screenshot artifact in the manifest.

#### `offline-degradation-contract` · BLOCKING

With no network, the following MUST work end to end: index rebuild, browse/search the corpus, RESOLVE, SELECT, COMPOSE, RENDER, VALIDATE, PROPOSE, and the whole UI. Only GENERATE and PUBLISH may require network. A pipeline consisting solely of the six offline verbs must be marked `offline: true` in its recipe and must be runnable with the machine in airplane mode.

- **Neden:** Rendering decks and running QA on a plane or a flaky Turkish mobile connection is a real working mode for a 6-person company, and it is also the cleanest possible test that the effect-class boundaries are real.
- **Zorlama:** A CI job `test:offline` runs the recipe fixtures marked `offline: true` under a network-blocking harness (undici `MockAgent` with `disableNetConnect()`, plus `NODE_OPTIONS` interception) and fails on any attempted connection. Fonts, icons and CSS are vendored under `templates/assets/` — a CI grep forbids `https://` in any file under `templates/`.

#### `new-job-type-zero-kernel-diff` · BLOCKING

Adding a new creative job type is a data change with exactly these steps and zero kernel edits: (1) add or extend an entity-type YAML in `registry/entity-types/`; (2) add `registry/recipes/<job>.yaml` declaring the step DAG as (verb, params, requiredCapability, lane); (3) add an HTML template under `templates/<job>/` with English class/data keys and Turkish content bound from record fields; (4) add declarative QA checks in `registry/checks/<job>.yaml`; (5) add a channel descriptor in `registry/channels/` if the destination is new; (6) run `pnpm suite:validate` (schema-validates every touched YAML) then `pnpm suite:plan <recipe> --dry-run` and inspect the effective config and cost estimate; (7) commit. The PR must contain zero changes under `packages/`.

- **Neden:** This is the payoff for every other rule in this document. If adding 'LinkedIn carousel, Turkish, 6 slides' requires a kernel change, the four-ring architecture bought nothing and the kernel will accrete one special case per job type until it is unmaintainable.
- **Zorlama:** CI job `no-kernel-diff-for-content`: if `git diff --name-only origin/main...HEAD` touches `registry/`, `templates/` or `corpus/` AND also touches `packages/kernel/src/`, the job fails unless the PR body contains an `ADR:` reference. A scaffolding command `pnpm suite:new-job <name>` generates the five files so the path of least resistance is the legal one.

#### `error-taxonomy-single-source` · BLOCKING

All errors are values of the closed union `AppError` defined in `packages/kernel/src/errors/index.ts`, each with `{ kind, code, retryable: boolean, userMessageKey, cause? }`. `throw` is reserved for programmer error (invariant violations) and is permitted only inside `packages/kernel/src/errors/invariant.ts`. Exported I/O functions return `Result<T, AppError>`.

- **Neden:** Retry policy, circuit-breaker classification, UI messaging and manifest error recording all need to branch on error identity. String matching on `err.message` is how a provider rate-limit gets classified as a permanent failure and a run dies at 90%.
- **Zorlama:** `eslint no-throw-literal` plus CI grep `grep -rn 'throw new' packages/*/src | grep -v '/errors/' && exit 1`. `AppError` is a discriminated union so `switch (err.kind)` gets `never`-exhaustiveness checking; a `default: assertNever(err)` in the retry classifier makes an unhandled error kind a `tsc -b` failure.

#### `one-path-resolver` · BLOCKING

`packages/kernel/src/paths.ts` is the only module that converts a logical name (record id, asset ref, template name, run id) into an absolute filesystem path; it resolves against the repo root and returns `Err(PathEscape)` for any result outside it. Raw string concatenation of paths and `path.join` on user-supplied segments are banned elsewhere.

- **Neden:** Record ids and asset names originate in user-edited YAML and agent output. A single `path.join(root, record.id)` where `id` contains `../` lets a proposal write outside the repo — and this system runs pipelines unattended on the maintainer's laptop.
- **Zorlama:** ESLint `no-restricted-imports` blocks `node:path` outside `paths.ts` and the build tooling. A property test feeds `../`, absolute paths, null bytes and Unicode normalisation variants and asserts `Err(PathEscape)`. Record ids are additionally constrained by a Zod regex `/^[a-z0-9][a-z0-9-]{1,63}$/`.

#### `derived-is-provably-rebuildable` · BLOCKING

`derived/` is gitignored in full and must be reconstructible from `corpus/` + `registry/` + git history by a single command `pnpm suite:reindex --from-scratch`. No fact may exist only in `derived/`: cost events, run manifests and event rows are mirrored to `derived/runs/<runId>/` as files, and any manifest belonging to an applied output is committed.

- **Neden:** Ring 3 being rebuildable is what allows aggressive schema changes to the index without migrations — a huge simplification for a solo maintainer. The moment one authoritative fact lives only in SQLite, that freedom is gone and you have inherited a migration problem you explicitly chose SQLite-as-cache to avoid.
- **Zorlama:** CI job `test:rebuild`: delete `derived/`, run `pnpm suite:reindex --from-scratch`, then run the full offline test suite and assert it passes. A second assertion compares record/asset counts and a checksum of the record-state projection before and after.

#### `api-dto-boundary` · BLOCKING

The Hono API's request and response types are defined once in `packages/contracts` as Zod schemas; the server validates input with them and the SPA imports the inferred types. Kernel domain types (`SystemRecord`, `FrozenPlan` internals, `AppError` causes) are never serialised directly to the UI — there is an explicit mapping function per endpoint.

- **Neden:** Serialising domain objects makes every internal rename a breaking UI change and leaks fields (paths, secrets refs, provider internals) that the browser should never see. One schema module also means the SPA cannot drift from the API.
- **Zorlama:** `dependency-cruiser` forbids `packages/ui/**` → anything but `packages/contracts`; the server's route handlers are wrapped by `@hono/zod-validator`-style middleware bound to the contracts schemas. A test asserts every route in the router has an associated request and response schema (route table is data, iterated in the test).

#### `budget-cap-is-a-guard-not-a-warning` · BLOCKING

Budget caps (per-run, per-day, per-month, per-lane) are evaluated at the planning→awaiting-approval transition against the estimate AND re-evaluated before each metered step against actual spend so far. Exceeding a cap transitions the RUN to `cancelled` with `reason: budget-cap`; it never logs a warning and continues.

- **Neden:** An estimate that turns out low mid-run (retries, a longer video than expected) is exactly when a cap needs to bite. A warning-only cap is not a cap.
- **Zorlama:** The check lives in `packages/engine/src/record-step.ts`, the same single place that writes to the cost ledger, so it cannot be bypassed. Test: a fixture provider that reports 10x its estimated cost causes the run to cancel at the cap with the partial outputs preserved and the manifest written.

#### `adr-for-structural-change` · BLOCKING

Any change to the ring graph, the verb set, a state machine's state set, the chokepoint list, or the config layer set requires a numbered ADR in `docs/adr/NNNN-*.md` with Context / Decision / Consequences / Revisit-trigger, referenced from the PR.

- **Neden:** This system is maintained by one person. The reason a boundary exists is only recoverable from writing; without ADRs, in eighteen months the boundaries will be eroded by a future self who no longer remembers what they were protecting against.
- **Zorlama:** CI job `adr-required` compares `git diff --name-only origin/main...HEAD` against a list of structural paths (`packages/kernel/src/verbs/index.ts`, `packages/kernel/src/state/*.ts`, `chokepoints.json`, `packages/kernel/src/config/defaults.ts`, every `tsconfig.json#references`) and fails when any is touched without a new `docs/adr/` file in the same diff.



### Kalemler (16)

| Ad | Tür | Ne | Erişim | Maliyet | Karar |
|---|---|---|---|---|---|
| eslint-plugin-import (import/no-restricted-paths) |  | ESLint rule that forbids imports from `from` directories into `target` directories via a `zones` array, with `except` and `basePath` options. |  |  | ADOPT — it is the closest thing to a native 'architecture zones' rule and it operates on your real directory layout with per-zone custom `message`. |
| dependency-cruiser |  | Standalone dependency validator with a `forbidden`/`allowed`/`required` ruleset over `from`/`to` conditions including `path`, `pathNot`, `circular`, `via`, `orphan`, `reachable`, `moreUnstable`, `depe |  |  | ADOPT — this is the primary enforcement engine for both ring direction and the chokepoint list; it is the only tool listed that can forbid a node_modules edge from everywhere except one file. |
| TypeScript project references |  | `composite: true` + `references[]` + `tsc -b` build orchestration that gives each package its own compilation unit and .d.ts output. |  |  | ADOPT — makes an out-of-ring import a compile error, which is a strictly stronger guarantee than a lint error. |
| eslint-plugin-boundaries |  | ESLint plugin that classifies files into named element types by pattern and then allows/denies dependencies between those types. |  |  | TRIAL — a good fit if you later want intra-package layering (e.g. verbs vs adapters vs pure) that directory zones express awkwardly. |
| XState |  | Statechart library with actors, invoked services, hierarchical/parallel states and persisted snapshots. |  |  | HOLD — do not adopt for this system; hand-rolled discriminated-union transition tables are the right call at four flat machines with ≤7 states each. |
| better-sqlite3 |  | Synchronous SQLite driver for Node; `db.pragma()`, `db.transaction(fn)` with `.deferred()`/`.immediate()`/`.exclusive()` variants. |  |  | ADOPT (already decided) — but treat its synchronicity as an architectural constraint, not an implementation detail. |
| Playwright (page.pdf, BrowserContext) |  | The single render engine: `chromium.launch()` once, `browser.newContext()` per render, `page.screenshot()` for static, `page.pdf()` for docs and decks. |  |  | ADOPT (already decided) — with a mandatory single-launcher chokepoint and mandatory page-error listeners. |
| uuid (v7) |  | RFC 9562 UUID generation including `uuid.v7()` — 'Generate a version 7 (Unix Epoch time-based) UUID'. |  |  | ADOPT for all system ids (runId, stepId, jobId, eventId). |
| Node AsyncLocalStorage |  | Built-in async context propagation (`node:async_hooks`), used to carry `{ runId, stepId, traceId }` through the whole call graph without threading parameters. |  |  | ADOPT — this is the correct mechanism for correlation ids; no dependency needed. |
| pino |  | NDJSON structured logger. |  |  | ADOPT as the single logger behind `kernel/src/log.ts`, wrapped so the rest of the code never imports it directly. |
| p-queue |  | Promise queue with concurrency control and priorities. |  |  | ADOPT for the named pools (provider, render, ffmpeg, git=1, db=1). |
| proper-lockfile |  | Inter-process and inter-machine lockfile utility. |  |  | TRIAL — needed only if the CLI and the server can run concurrently on the same repo, which they will the first time you run a pipeline from the terminal while the UI is open. |
| Zod |  | TypeScript-first schema validation used for registry YAML, record frontmatter, FrozenPlan, manifests and API DTOs. |  |  | ADOPT — it is the mechanism that makes 'registry is data' and 'manifest is a contract' enforceable rather than aspirational. |
| Hono |  | Web-standards HTTP framework for the local API server. |  |  | ADOPT (already decided). |
| pnpm workspaces |  | Monorepo package management with `workspace:*` protocol and an isolated (non-hoisted) node_modules layout. |  |  | ADOPT (already decided) — and lean on the isolated layout as a free boundary enforcer. |
| git worktree |  | Multiple working trees on one repository, one per run. |  |  | ADOPT — one worktree per run under `derived/worktrees/<runId>` is the correct isolation unit for agentic proposals. |

<details><summary>Notlar</summary>

**eslint-plugin-import (import/no-restricted-paths)** — Verified schema: `zones[]` with `target`, `from`, optional `except` and `message`, plus top-level `basePath`. `except` semantics follow `from`: glob patterns if `from` uses globs, directories otherwise. Best for ring-to-ring rules; it cannot express 'nobody but this file may import better-sqlite3' because that target is a node_module — use dependency-cruiser for those.

**dependency-cruiser** — Version 18.2.0, `engines.node: ^22||^24||>=26` — clean fit for Node 22. Key verified features for this rulebook: `circular` with `scope: "folder"` (catches folder-level cycles that are not module-level cycles); `moreUnstable` for the stable-dependencies principle; `--ignore-known` for baselining existing violations so you can turn rules on today and fix incrementally; `extends` for sharing a base config across the workspace.

**TypeScript project references** — Verified: `composite` forces `declaration: true`, defaults `rootDir` to the tsconfig's directory, and requires every implementation file to be matched by `include`/`files`. Use a root 'solution' tsconfig with `files: []` and references to every package. Enable `declarationMap` so cross-package Go-to-Definition lands in source. Caveat from the docs: `tsc` will not build dependencies unless invoked with `--build`, so make `tsc -b` the only sanctioned build command.

**eslint-plugin-boundaries** — Version 7.2.0. Overlaps heavily with `import/no-restricted-paths` for the ring-level rules; do not run all three ring enforcers at once or you will maintain three copies of the same graph. Recommended split: `import/no-restricted-paths` for rings, dependency-cruiser for node_modules chokepoints and cycles, `boundaries` only if intra-package layering becomes a real problem.

**XState** — Latest stable on npm is 5.32.5 and the docs site is already advertising a v6 alpha. The disqualifier is persistence: RECORD and ASSET states live in committed markdown frontmatter and must stay human-diffable and stable for years, and JOB state lives in SQLite columns you want to query directly — coupling either to a library-versioned snapshot format is a bad trade for a solo maintainer. Revisit trigger to write into the ADR: the first machine that needs parallel regions, history states, or invoked long-running actors with their own retry policy.

**better-sqlite3** — Verified: the API is fully synchronous; the docs warn 'Transaction functions do not work with async functions … it's generally a very bad idea to keep a transaction open across event loop ticks'; the default busy timeout is 5000ms before SQLITE_BUSY. The performance doc recommends `db.pragma('journal_mode = WAL')` and notes WAL defaults to `synchronous = NORMAL` (SQLITE_DEFAULT_WAL_SYNCHRONOUS=1) which trades a slight durability loss for speed — override with `synchronous = FULL` if you decide the derived index should survive a power cut, though since Ring 3 is rebuildable, NORMAL is the correct choice here. Also flagged: checkpoint starvation in multi-process setups, so run `wal_checkpoint(RESTART)` on a schedule if the -wal file grows.

**Playwright (page.pdf, BrowserContext)** — Verified from the docs: 'page.pdf() generates a pdf of the page with print css media. To generate a pdf with screen media, call page.emulateMedia() before calling page.pdf()'. This bites hard for decks authored with screen backgrounds — set `emulateMedia({ media: 'screen' })` explicitly in the render wrapper and assert it in a test. Also documented: headless mode does not support navigating TO a PDF document (irrelevant for generation, relevant if you ever want to screenshot a PDF).

**uuid (v7)** — Package version 14.0.1, description 'RFC9562 UUIDs'. RFC 9562 (May 2024) §5.7 defines UUIDv7 as time-ordered from the Unix Epoch millisecond timestamp, and §6.11 states UUIDv6/v7 'sort as opaque raw bytes without the need for parsing or introspection' — which is exactly what you want for `ORDER BY id` on the SQLite job queue. Note Node's built-in `crypto.randomUUID()` is v4 (not time-ordered), so it is not a substitute.

**Node AsyncLocalStorage** — Verified stability: 'Stability: 2 - Stable' (stable since v16.4.0). Use `als.run(store, fn)` at the run and step boundaries; prefer it over `enterWith`, which affects the entire remaining synchronous execution and leaks context in a long-lived server process.

**pino** — Version 10.3.1, 'super fast, all natural json logger'. Wrap it rather than using it directly so the required fields (`event`, `runId`, `stepId`) can be enforced by the wrapper's type signature and so swapping it later is a one-file change. Pair with `pino-pretty` in the CLI only.

**p-queue** — Version 9.3.3, 'Promise queue with concurrency control'; supports concurrency and priority, requires Node 20+, ESM-only with bundled types. ESM-only matters: your packages must be `"type": "module"`. Declaring `gitQueue` and `dbQueue` with concurrency 1 makes serialisation a visible config value rather than an implicit assumption.

**proper-lockfile** — Version 4.1.2. In-process mutexes do not protect against two Node processes touching the same git repo. Use it for `.git/suite.lock` around commit/ref operations and around the SQLite writer if you ever open the DB from two processes. Stale-lock handling is its main value over a naive `mkdir` lock.

**Zod** — Version 4.4.3. Use `.strict()` everywhere so an unexpected key in a hand-edited YAML file is an error rather than silently ignored — this is the single highest-value setting for a system whose config is edited by hand. Use `z.discriminatedUnion('state', ...)` for the RECORD lifecycle so `superseded` can require `supersededBy`.

**Hono** — Version 4.13.2, 'Web framework built on Web Standards'. Relevant rule interaction: because better-sqlite3 is synchronous, Hono handlers must not touch the DB directly — route them through the queue-worker/worker-thread RPC, or a single slow FTS query freezes every open SPA tab.

**pnpm workspaces** — Docs are versioned for pnpm 11 & 12 as of this check. The default non-hoisted node_modules means a package can only import what is in its own package.json — undeclared cross-package imports fail at resolution time with no lint rule required. Combine with `pnpm -F @suite/kernel test` for per-ring CI jobs so a kernel test cannot accidentally depend on Ring 3 fixtures.

**git worktree** — Verified from the docs: a linked worktree shares 'everything except per-worktree files such as HEAD, index'. That per-worktree index is exactly what removes `.git/index.lock` contention between concurrent runs and makes `git add <explicit paths>` safe. What it does NOT isolate is the object store and refs, so branch creation and commit still need serialising — that is why the rulebook keeps a single git mutex on top. Clean up with `git worktree remove`; add a startup reaper because a killed process leaves worktrees behind.

</details>


### Doğrulanmamış

- The exact behaviour of concurrent `git commit` across multiple linked worktrees — I verified from git-worktree docs that HEAD and index are per-worktree, but I did not verify from primary sources which lock files (`.git/refs/**.lock`, `packed-refs.lock`, `logs/HEAD`) are contended during simultaneous commits on different branches. The rulebook therefore serialises all git writes conservatively. Verify against the git source or `git help worktree` / `git help update-ref` before relaxing.
- Whether `page.pdf()` is Chromium-only and headless-only in current Playwright. The docs page I fetched states the print-media behaviour verbatim but did not state a browser or headless restriction in the section retrieved. Historically it was Chromium-headless-only; confirm on https://playwright.dev/docs/api/class-page#page-pdf before relying on it in a non-Chromium context.
- HyperFrames (Apache-2.0, HTML-authored motion rendering via Chrome + FFmpeg) — I did not fetch its repository or docs this session, so its API surface, concurrency characteristics, and whether it launches its own Chrome (which would violate the single-Chromium-launcher chokepoint) are unverified. This matters: if HyperFrames launches its own browser, the `only-chromium-launcher` dependency-cruiser rule needs an explicit second allowed file, or HyperFrames must be run behind the same pool.
- pnpm `catalog:` / catalogs for centralising dependency versions across the workspace — I did not verify the feature name, minimum pnpm version, or syntax from the pnpm docs this session. The pnpm workspaces page I indexed is versioned for 'pnpm 11 & 12'. Verify at https://pnpm.io/catalogs before adopting.
- Exact ESLint flat-config wiring for `eslint-plugin-import` under ESLint 9/10 (the plugin's flat-config export name and whether `importPlugin.flatConfigs.recommended` is the current entry point). The rule name and options schema for `import/no-restricted-paths` are verified; the config-plumbing around it is not. Some teams use `eslint-plugin-import-x` instead for better flat-config/TS support — worth evaluating.
- Whether `dependency-cruiser`'s `to.path` matching against core Node builtins (`^node:fs`) works exactly as written in my example rules. Its `dependencyTypes` includes a `core` type, so the more reliable formulation may be `to: { dependencyTypes: ['core'], path: '^fs$|^node:fs' }`. Verify against the rules-reference `dependencyTypes` section before committing the config.
- The claim that pnpm's default isolated node_modules fully prevents phantom dependencies — this is true for the default `node-linker=isolated` layout but is defeated by `shamefully-hoist`, `hoist-pattern`, or `node-linker=hoisted`. Confirm your `.npmrc` does not enable any of these.
- Node 22-specific behaviour of `node --test` (test runner maturity, `--experimental-test-coverage` status, glob support for test file selection) — I assumed `node --test` is a suitable CI runner but did not verify its Node 22 feature set. If it falls short, Vitest is the obvious substitute and does not change any rule in this document.
- The Turkish dotted/dotless-I casing hazard I cite in the antipatterns is a well-known Unicode/ICU behaviour but I did not verify it from a primary source (Unicode SpecialCasing.txt or ECMA-402) this session. It is cited as a rationale for ASCII identifiers, not as the basis for any enforcement mechanism.


### Anti-desenler

- The kernel 'temporarily' reads a user attribute to special-case one entity type. It shows up as an `if (record.attributes.platform === 'instagram')` in a verb, usually added at 23:00 to ship something. Within a month there are five, the registry can no longer be edited without a kernel change, and the CI grep gets an eslint-disable comment. Detection: the `attributes` grep is the single most important CI check in the repo — never allow an inline disable for it.
- Verb creep disguised as helpers. Nobody adds a ninth verb; instead `COMPOSE` grows a `mode: 'translate' | 'resize' | 'schedule'` param and becomes a second dispatcher. Symptom: a switch statement inside a verb whose branches have different effect classes (one of them makes a network call). Detection: any verb file that imports the provider client is a boundary violation even though the verb count is still 8.
- Capability resolution leaking into execution time. It looks harmless — the engine resolves 'text-generation-premium' lazily when the step runs so it can pick a healthy provider. The consequence is that the cost estimate the human approved is not the cost incurred, and a replay six months later picks a model that did not exist at plan time. This is the most likely single cause of a wrong-but-plausible output in this whole design.
- Silent lane crossing under provider failure. The premium provider is down, the fallback logic picks the free one 'so the run doesn't fail', and a client-facing deck ships with free-lane imagery under a premium approval. It never appears in logs as an error. The rule that prevents it is: fallback within a lane only, and `NoProviderAvailable` is an acceptable outcome.
- Replay against moved HEAD. The user clicks 'run again' on last month's LinkedIn campaign; the corpus has since been updated with new positioning; the output is subtly different but the run looks identical in the UI. This is invisible in review because the output is still well-formed and on-brand-looking. The mitigation (pin corpusCommit, force a new runId and show a record diff for HEAD replays) must be built before the first replay feature ships, not after.
- better-sqlite3 executed on the Hono event loop. Everything is fine at 200 records. At 5000 records with FTS5 the reindex or a broad MATCH query blocks the process for seconds; the SPA's run queue freezes, the user clicks the button again, and now there are two runs. It presents as 'the UI is laggy', not as a database problem, so it gets misdiagnosed as a React issue for a week.
- Parallel git operations in one worktree. Two runs proposing simultaneously: one `git add -A` stages the other's half-written draft, or both hit `.git/index.lock` and one fails with an error message that reads like corruption. The insidious version is the successful one — a commit that contains another run's files, which passes CI and is only noticed when someone reads the diff months later.
- Unbounded Promise.all over renders. A 40-slide deck or a batch of 30 Instagram variants fans out to 40 concurrent Chromium contexts, the laptop swaps, renders time out, retries fire, and the premium-lane budget is consumed by retries of a job that never had a chance. Symptom: the machine's fans, not an error message.
- Chromium zombie processes. A render throws before `context.close()`, the `finally` is missing on one code path, and after a week of use there are 30 orphaned Chromium processes holding 12GB. Because launching happens in one file, this is trivially preventable — but only if that file is genuinely the only launcher.
- The derived index acquiring an authoritative fact. Someone stores 'approved by' or a cost total only in SQLite because it is convenient. The next schema change wipes `derived/` and the fact is gone forever. The tell is any `INSERT` whose data has no corresponding file under `derived/runs/` or `corpus/`.
- Config layers growing a fifth source. An env var starts controlling behaviour (not just secrets), or a `--profile` flag reads a file not in the four layers. Then 'which lane did it use?' requires reading three files and one shell history. The provenance table in the approval screen is the early-warning system: the moment a key's provenance reads 'unknown', a layer has escaped.
- Outputs without manifests, accumulating quietly. The first ten are from a debug script someone ran with `--no-manifest`. Six months later nobody can tell which committed assets were produced by a real pipeline and which were dragged in by hand, and the repo's claim to be a source of truth is dead. The CI walk over committed assets must be added on day one, when it passes trivially.
- Turkish leaking into keys, enum values, filenames or log event names. It starts with one `durum: 'onaylandı'` in a YAML file. Then sorting breaks, greps miss it, `İ`/`i` casing bites on Turkish locale (`'I'.toLowerCase()` is not `'i'` under tr-TR), and a state comparison silently fails. Content is Turkish; identifiers are ASCII English — with a non-ASCII CI grep over schema key files and enum modules.
- Quarantine that nobody looks at. Bad records are correctly excluded from SELECT and correctly logged, but the banner is dismissible and gets dismissed. Three brand records silently drop out of every run for two months. The banner must be persistent and the count must appear in the pre-run effective-config panel, next to the record count the run will actually use.
- Baselining dependency-cruiser violations and never draining the baseline. `--ignore-known` is the right way to adopt the rules on an existing tree, but a baseline that grows is just a disabled ruleset. Rule of thumb: the known-violations file may only shrink; CI compares its line count against main.
