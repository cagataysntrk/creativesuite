# Integration engineering for the Upcytech Creative Suite: provider adapter contracts, idempotency, retry/backoff, outbound rate limiting, long-running job polling on a NAT'd laptop, timeouts/cancellation, secrets, cost accounting, error taxonomy, and API version drift — across ~20 third-party image/video/TTS/STT/search/crawl/social-publishing APIs.

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Özet

This rulebook treats every third-party API as hostile, slow and occasionally lying about what it charged. The load-bearing idea is a single frozen Ring 0 port — `ProviderAdapter` with `capabilities()`, `validate()`, `estimate()` (pure, no network, no clock), `start()`, `status()`, `cancel()`, `actualCost()` — and an absolute prohibition on provider response shapes crossing that boundary. Adapters own the SDK, the Zod parse, the retry loop and the raw-JSON dump; the kernel and pipelines see only kernel types. Pipelines request capabilities plus constraints and the resolver matches descriptors; a no-match is a plan-time `ValidationFailed`, never a runtime surprise.

Idempotency is derived, not random: `sha256(canonicalJson({providerId, apiVersion, modelRef, sortedParams incl. seed, sorted input blob digests, knowledgeSha, lane}))`. It excludes time, run id and attempt number, so a retry after a crash recomputes bit-identically and hits the ledger before it hits the network. The ledger is an append-only fsync'd NDJSON journal that survives `rebuild` — SQLite/FTS5 is only an index over it, because run state is not derivable from Ring 2.

Retry numbers come from primary sources: full jitter `random(0,1) × min(20_000ms, base × 2^retry)` with base 50 ms transient / 1000 ms throttling and a 500-token retry quota costing 14 (transient) / 5 (throttling) per retry (AWS SDK retry behavior, 2026 update); 3 attempts max and retries capped at 10% of the trailing 2 minutes of requests (Google SRE, *Handling Overload*). 429 sets a provider-wide `blockedUntil` from `Retry-After`, not a per-call sleep. Publishing is the one place retries are banned outright: Instagram's two-step container→`media_publish` flow has no idempotency key, so a crash between the 200 and the ledger write must be resolved by a reconcile read, never a re-POST. Polling uses absolute epoch deadlines and a resume sweep so a closed laptop detaches rather than orphans. Secrets: SOPS+age, one binary, offline, no subscription. Money: integer USD micro-units, TCMB `today.xml` for TRY reporting, never repriced.


### Kurallar (46)

#### `adapter-port-frozen` · BLOCKING

Every provider integration MUST implement exactly the Ring 0 `ProviderAdapter<I,O>` port — `id`, `apiVersion`, `capabilities()`, `validate()`, `estimate()`, `start()`, `status()`, `cancel()`, `actualCost()` — and export nothing else from its package entrypoint.

- **Neden:** Twenty providers with twenty bespoke shapes means every pipeline grows provider-specific branches and the kernel's 8 verbs rot into 40.
- **Zorlama:** `kernel/src/ports/provider.ts` is the only definition; each adapter ends with `export default impl satisfies ProviderAdapter<In, Out>`. CI runs `scripts/check-adapter-surface.ts` which imports every `packages/adapters/*/src/index.ts`, asserts the export set equals `['default']`, and typechecks against the port.

#### `no-provider-shape-escapes` · BLOCKING

A provider SDK type, raw response object, or provider-specific string enum MUST NEVER appear in a value returned from an adapter; every response is parsed by a Zod schema in `<adapter>/src/wire.ts` and mapped to kernel types in `<adapter>/src/map.ts` before returning.

- **Neden:** One leaked `FalQueueStatus` union forces every downstream consumer to know fal's vocabulary, and the day fal renames `IN_QUEUE` the whole suite breaks instead of one file.
- **Zorlama:** eslint `import/no-restricted-paths` zones: `packages/kernel/**` and `packages/pipelines/**` may not import from `packages/adapters/*/src/wire.ts` or any provider SDK package; plus `@typescript-eslint/no-unsafe-return` and `no-explicit-any` set to error in `packages/adapters/**`. CI greps adapter `package.json` dependency lists against the kernel's.

#### `estimate-is-pure` · BLOCKING

`estimate()` MUST be synchronous and pure: no `fetch`, no `Date.now()`, no `fs`, no `crypto.randomUUID()`, no reading `process.env`.

- **Neden:** The cost estimate is shown in the UI before the user commits a run; if it can hit the network it can hang the confirm dialog or silently charge for a probe call.
- **Zorlama:** `test/purity.spec.ts` runs every adapter's `estimate()` inside a vitest environment where `globalThis.fetch`, `Date.now` and `node:fs` are stubbed to throw, with `vi.useFakeTimers()`; any throw fails CI. Return type is declared `CostEstimate` (not `Promise<CostEstimate>`) so async is a type error.

#### `capabilities-declared-not-guessed` · BLOCKING

Adapters MUST declare `CapabilityDescriptor[]` with explicit `constraints` (`aspectRatios`, `maxDurationSec`, `maxInputBytes`, `languages` as BCP-47, `outputMimeTypes`, `maxConcurrency`) and a `lane` of `'free' | 'premium'`; pipelines request a capability plus required constraints and NEVER name a provider or model id.

- **Neden:** Hardcoding `model: 'flux-pro-1.1'` in a pipeline makes the free lane impossible and turns a provider outage into a code change.
- **Zorlama:** CI grep: no string literal matching a known model-id pattern (`/\b(gpt|claude|flux|veo|sora|eleven|whisper)[-_a-z0-9.]*\b/i`) may appear under `packages/pipelines/**` or `registry/pipelines/**`. Resolver unit test asserts `resolve(capabilityRequest)` returns `Err(ValidationFailed)` when no descriptor satisfies the constraints.

#### `resolution-happens-at-plan-time` · BLOCKING

Capability→adapter resolution MUST run during plan construction, before any network call or budget lease, and an unmatched request MUST fail the whole run with `ValidationFailed` naming the unsatisfied constraint.

- **Neden:** Discovering at minute 7 of a 9-step video pipeline that no provider does 9:16 at 12 seconds wastes the six paid steps already run.
- **Zorlama:** `runQueue.plan()` returns `Result<ResolvedPlan, ValidationFailed>` and `runQueue.execute()` only accepts `ResolvedPlan`; test asserts `execute` is unreachable with an unresolved plan (nominal branded type `ResolvedPlan`).

#### `idempotency-key-formula` · BLOCKING

The idempotency key MUST be `'ck1_' + base32(sha256(canonicalJson({providerId, capability, apiVersion, modelRef, params, inputDigests, knowledgeSha, lane}))).slice(0,32)` where `params` is key-sorted with nulls dropped and the seed included, `inputDigests` is the sorted sha256 of every input blob, and `knowledgeSha` is `git rev-parse HEAD` of the corpus at plan time.

- **Neden:** A random key regenerated after a crash defeats the entire mechanism; including a timestamp or attempt number does the same thing more subtly.
- **Zorlama:** `kernel/src/idempotency.ts` is the only producer. Unit test asserts key stability across two processes and across `Date.now()` mutation, and asserts the key CHANGES when seed, any input byte, or `knowledgeSha` changes. CI grep bans `randomUUID`, `Date.now`, `attempt` inside that file.

#### `ledger-before-network` · BLOCKING

An `intent` ledger record containing the idempotency key, provider id, estimate and deadline MUST be appended and `fsync`'d to `.derived/runs/ledger.ndjson` BEFORE the first byte of the request leaves the process; the `handle` record carrying the provider's `externalId` MUST be appended within the same call, before `start()` returns.

- **Neden:** Power loss between the HTTP 200 and the local write is the exact window that produces an unbilled-but-charged job or a duplicate post.
- **Zorlama:** The HTTP client in `kernel/src/http.ts` refuses to dispatch unless `ctx.ledger.intentWritten === true`; integration test kills the process with SIGKILL between intent and dispatch (via a test hook) and asserts the restart sweep finds the orphan.

#### `ledger-survives-rebuild` · BLOCKING

`.derived/runs/ledger.ndjson` and `.derived/runs/handles/` are gitignored but MUST NOT be deleted by `pnpm rebuild-index`; only the SQLite/FTS5 file is rebuildable, and it is rebuilt FROM the journal.

- **Neden:** Ring 3 is defined as rebuildable-from-Ring-2, but run state and cost history are not derivable from the corpus — a naive `rm -rf .derived` would destroy the only record of what was charged.
- **Zorlama:** `scripts/rebuild-index.ts` deletes only `*.sqlite*`; CI test asserts running it twice leaves `ledger.ndjson` byte-identical. A `postinstall` check warns if `ledger.ndjson` has no backup entry in the local restic/rsync config.

#### `idempotency-hit-short-circuits` · BLOCKING

`start()` MUST consult the ledger by idempotency key first and, on a terminal-success hit, return the stored `JobHandle` without any network call; on a non-terminal hit it MUST resume polling the stored `externalId` rather than submitting again.

- **Neden:** Re-running a pipeline after fixing step 9 must not re-pay for steps 1-8.
- **Zorlama:** Conformance suite case `duplicate-key-returns-same-handle`: two `start()` calls with identical input, asserted with an undici `MockAgent` that registers exactly one intercept and `assertNoPendingInterceptors()` after.

#### `forward-idempotency-key` · BLOCKING

When a provider supports a client idempotency header (Stripe-style `Idempotency-Key`, OpenAI, Replicate), the adapter MUST send our computed key verbatim; the key MUST be ≤255 characters and MUST NOT contain corpus text, filenames, or anything personal.

- **Neden:** Stripe stores the first response body and status for a key and replays it — including 500s — which converts an ambiguous network failure into a definite answer.
- **Zorlama:** `wire.ts` header builder is shared; test asserts header presence and `length <= 255`. CI grep bans template literals interpolating record titles into the key. Reference: https://docs.stripe.com/api/idempotent_requests (keys pruned after ≥24h, V4 UUID recommended, params compared and mismatch errors).

#### `publish-never-blind-retries` · BLOCKING

A social publish call MUST NEVER be retried on an ambiguous failure (timeout, connection reset, 5xx after the request body was sent); the runner MUST instead enter `reconcile` state and resolve the outcome by reading the channel back.

- **Neden:** Instagram publishing is two calls — `POST /{ig-user-id}/media` then `POST /{ig-user-id}/media_publish` — and `media_publish` accepts no idempotency key. A socket reset after Meta processed the publish, followed by a naive retry, produces two identical posts on the client's feed. This has to be a rule, not a hope.
- **Zorlama:** `kernel/src/http.ts` takes `retryPolicy: 'safe' | 'never'` and the channel adapters' publish path is typed to require `'never'`. CI grep: `retryPolicy: 'safe'` may not appear in any file under `packages/adapters/*/src/publish.ts`.

#### `reconcile-by-read` · BLOCKING

Every channel adapter MUST implement `reconcile(intent, since): Promise<Result<PublishOutcome, AppError>>` that lists the channel's recent posts (Instagram: `GET /{ig-user-id}/media` filtered by `timestamp >= intent.submittedAt`; LinkedIn: the `x-restli-id` returned on 201, else `GET /rest/posts?author=...`) and matches against a fingerprint of the payload stored in the intent record.

- **Neden:** Reconciliation is the only correct answer to an ambiguous write against an API with no idempotency key.
- **Zorlama:** The `ChannelAdapter` interface makes `reconcile` non-optional; conformance suite case `crash-mid-publish` asserts reconcile returns `AlreadyPublished` with the external post id and that no second POST intercept is consumed.

#### `retry-classification-table` · BLOCKING

Retry ONLY: HTTP 408, 425, 429, 500, 502, 503, 504, and Node network errors `ECONNRESET`, `ECONNREFUSED`, `EPIPE`, `ETIMEDOUT`, `EAI_AGAIN`, `UND_ERR_CONNECT_TIMEOUT`, `UND_ERR_SOCKET`. NEVER retry: 400, 401, 402, 403, 404, 409, 413, 415, 422, any content-policy rejection regardless of status, and any insufficient-funds error.

- **Neden:** Retrying a content-policy rejection burns the retry budget and can flag the account; retrying a 402 cannot succeed by definition.
- **Zorlama:** `kernel/src/retry/classify.ts` is a total function over a closed `ErrorClass` union with an exhaustiveness `never` check; table-driven test covers all listed codes. eslint `no-restricted-syntax` bans `catch` blocks that call the http client recursively outside `kernel/src/retry/`.

#### `full-jitter-backoff` · BLOCKING

Backoff MUST be full jitter: `delay = random(0,1) × min(20_000ms, base × 2^retry)` with `base = 50ms` for transient errors and `base = 1000ms` for throttling errors, `retry` starting at 0.

- **Neden:** Equal jitter does more work and takes longer; no jitter creates a thundering herd from the retry loop plus the poll loop hitting the same provider.
- **Zorlama:** `kernel/src/retry/backoff.ts` implements exactly this; test asserts the 10th transient retry is capped at 20 000 ms and that 1000 samples have mean ≈ half the cap. Sources: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ (`sleep = random(0, min(cap, base * 2 ** attempt))`) and https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html (base 50 ms / 1000 ms, 20 s cap).

#### `retry-attempt-cap` · BLOCKING

A logical provider call gets at most 3 attempts total (1 initial + 2 retries). The run queue may re-enqueue a failed step at most once, and only after explicit human confirmation.

- **Neden:** Google SRE: "If a request has already failed three times, we let the failure bubble up to the caller." Beyond that, retries just move the failure later and cost more.
- **Zorlama:** `maxAttempts` is a constant `3` in `kernel/src/retry/policy.ts`, not configurable per provider; CI grep bans `maxAttempts:` outside that file. Sources: https://sre.google/sre-book/handling-overload/.

#### `retry-token-budget` · BLOCKING

Each provider client MUST hold a 500-token retry quota: a transient retry costs 14 tokens, a throttling retry costs 5, a success after a retry restores that retry's cost, a first-try success restores 1. At zero tokens the client returns the error immediately without retrying. Independently, retries MUST NOT exceed 10% of that provider's requests in the trailing 2 minutes.

- **Neden:** Without a budget, a provider outage turns into 3× the traffic at exactly the moment the provider is least able to serve it, and the local run queue stalls on retries that cannot succeed.
- **Zorlama:** `kernel/src/retry/quota.ts`; unit test drives 100 sustained transient failures and asserts retries stop. Sources: https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html (500 tokens, 14/5 costs, 1 restored on clean success) and https://sre.google/sre-book/handling-overload/ ("A request will only be retried as long as this ratio is below 10%", two-minute history window).

#### `retry-single-layer` · BLOCKING

Retry logic MUST exist in exactly one place — `kernel/src/retry/` used by `kernel/src/http.ts`. Adapters, pipelines, the run queue and the UI MUST NOT contain retry loops, and provider SDKs MUST be constructed with their own retries disabled (`maxRetries: 0` / equivalent).

- **Neden:** Retries at 3 layers multiply to 27 requests for one logical call, blowing the provider's quota and the budget cap simultaneously.
- **Zorlama:** CI grep for `for`/`while` bodies containing `await` and a `catch` in `packages/adapters/**` fails review; a required `wire.ts` constructor test asserts each SDK client is built with retries disabled. `import/no-restricted-paths` prevents importing `retry/` outside `kernel/src/http.ts`.

#### `circuit-breaker-per-capability` · BLOCKING

Maintain a circuit breaker keyed by `(providerId, capability)`: open after 5 consecutive `ProviderUnavailable` or when the retry quota reaches zero; stay open 30 s; half-open admits exactly 1 probe; close after 2 consecutive successes. An open circuit MUST make the resolver prefer the next-ranked adapter for that capability rather than failing the run.

- **Neden:** Keying the breaker on the provider alone takes down TTS because image generation is broken; keying on capability lets the free lane absorb a premium-lane outage.
- **Zorlama:** `kernel/src/retry/breaker.ts` with a state-machine test covering all transitions; the run-queue UI renders breaker state so an open circuit is visible, not silent.

#### `token-bucket-outbound` · BLOCKING

All outbound calls MUST pass through a per-`(providerId, limitScope)` token bucket declared in the Ring 1 descriptor as `rateLimits: [{scope, capacity, refillPerSec, weight}]`; use a leaky bucket only where the provider documents a strict no-burst rate, and mark it `shape: leaky` in the descriptor.

- **Neden:** These APIs publish quotas over a window and permit bursts; a leaky bucket wastes the burst allowance and makes a 40-asset carousel run 4× longer than it needs to.
- **Zorlama:** `kernel/src/limiter.ts` is the only place `fetch` is called from; eslint `no-restricted-globals` bans bare `fetch` everywhere except that file. Descriptor schema validation (Zod) rejects a `rateLimits` entry missing `capacity` or `refillPerSec`.

#### `weighted-call-cost` · BLOCKING

The descriptor MUST express per-call bucket cost as a weight map (e.g. `weight: {read: 1, write: 3}`) and the adapter MUST tag every request `read` or `write`; the limiter deducts the weighted amount, never a flat 1.

- **Neden:** Meta-family APIs price writes far above reads, so a flat-1 bucket lets a publish burst sail past the local limiter and hit a server-side throttle that locks the account for tens of minutes.
- **Zorlama:** The `ProviderRequest` type requires `kind: 'read' | 'write'`; Zod descriptor schema requires a `weight` map with at least a `read` and `write` entry. Test asserts a `write` deducts `weight.write`.

#### `retry-after-blocks-provider` · BLOCKING

On 429 or 503 the adapter MUST parse `Retry-After` (delay-seconds or HTTP-date) and set `bucket.blockedUntil = now + delay` for the WHOLE provider scope, so every queued call waits; the local backoff delay is then `max(computedBackoff, blockedUntil - now)`.

- **Neden:** Sleeping only the failing call means the other 11 queued calls immediately hit the same 429 and burn the retry budget in under a second.
- **Zorlama:** `kernel/src/limiter.ts` exposes `blockUntil()`; conformance case `429-with-retry-after` uses `MockAgent` returning `Retry-After: 30` and asserts no request is dispatched for 30 s (fake timers). Sources: RFC 9110 §10.2.3 (Retry-After: HTTP-date or delay-seconds), RFC 6585 §4 (429 "MAY include a Retry-After header").

#### `meta-usage-headers` · BLOCKING

Meta-family adapters MUST parse `X-App-Usage` and `X-Business-Use-Case-Usage` on every response and hard-block the provider bucket when any of `call_count`, `total_cputime`, `total_time` reaches 90, using `estimated_time_to_regain_access` (minutes) as `blockedUntil` when present.

- **Neden:** Meta throttles at 100 on any of those three counters and the lockout is measured in minutes to an hour; discovering it via error code 4/17/32/613 or 80002 is discovering it too late.
- **Zorlama:** `packages/adapters/meta/src/usage.ts` with a Zod schema for both headers; test asserts blocking at 90 and correct `blockedUntil` from `estimated_time_to_regain_access`. Source: https://developers.facebook.com/docs/graph-api/overview/rate-limiting/.

#### `ig-publishing-quota-precheck` · BLOCKING

Before every Instagram publish the adapter MUST call `GET /{ig-user-id}/content_publishing_limit` and refuse with `QuotaExceeded` if `quota_usage >= 90`, reserving headroom; the Instagram BUC budget is `4800 × impressions` calls per rolling 24 hours and the publishing cap is 100 API-published posts per rolling 24 hours (a carousel counts as one).

- **Neden:** Hitting the publishing cap mid-campaign leaves a half-published carousel set and no way to finish for up to 24 hours.
- **Zorlama:** Publish path is typed to require a fresh `PublishingQuota` (≤60 s old) as an argument; test asserts refusal at 90/100. Source: https://developers.facebook.com/docs/instagram-platform/content-publishing and https://developers.facebook.com/docs/instagram-platform/overview ("Calls within 24 hours = 4800 * Number of Impressions").

#### `poll-schedule-declared` · BLOCKING

Descriptors MUST declare a `durationClass` of `fast` (<5 s), `medium` (5–120 s) or `slow` (2–10 min) with a poll schedule `delay_n = clamp(base × 1.5^n, base, cap) × (0.8 + random()×0.4)`, where `(base, cap)` is `(1s, 5s)` / `(2s, 15s)` / `(5s, 30s)`; a server-supplied `pollAfterMs` or `Retry-After` always overrides.

- **Neden:** Polling a 10-minute video render every second wastes 600 read calls of the provider's quota; polling a 3-second TTS every 30 seconds makes the UI feel broken.
- **Zorlama:** Zod descriptor schema requires `durationClass`; `kernel/src/poll.ts` is the only poller and takes the class from the descriptor. Test asserts ±20% jitter and monotonic growth to the cap. For Instagram containers specifically, the schedule is pinned to once per minute for at most 5 minutes per Meta's guidance.

#### `absolute-deadlines-not-timers` · BLOCKING

Every deadline MUST be stored as an absolute epoch-milliseconds value in the persisted handle (`deadlineAt`, `nextPollAt`), never as a `setTimeout` duration held only in memory.

- **Neden:** Closing the laptop suspends the process; on wake, a `setTimeout(30_000)` scheduled two hours ago fires immediately or never, and every in-flight job either stampedes the provider or hangs forever.
- **Zorlama:** `JobHandle` Zod schema types these as `.int().positive()` epoch ms; CI grep bans `setTimeout(` inside `packages/adapters/**` and requires `poll.ts` to compute sleeps as `nextPollAt - Date.now()`.

#### `suspend-gap-detection` · BLOCKING

The poller MUST record `lastTickAt` each iteration and, when `Date.now() - lastTickAt > 2 × expectedSleep`, emit a `suspend_gap` ledger event and force one immediate status poll for every non-terminal job before resuming normal scheduling.

- **Neden:** After a lid-close the true state of every remote job is unknown; assuming the old schedule still holds is how a finished 10-minute render sits unclaimed until its output URL expires.
- **Zorlama:** `kernel/src/poll.ts` unit test advances the fake clock by 2 hours mid-loop and asserts one immediate poll per open handle plus one `suspend_gap` event.

#### `resume-sweep-on-start` · BLOCKING

On process start the runner MUST read `.derived/runs/handles/` for all non-terminal handles and re-enter the poll loop for each; on SIGINT/SIGTERM it MUST mark open handles `detached` and exit WITHOUT calling `cancel()` on the provider.

- **Neden:** Cancelling on shutdown throws away work already paid for; a laptop reboot should cost zero money.
- **Zorlama:** Integration test: start a job against `MockAgent`, SIGKILL the runner, restart, assert the job reaches `succeeded` with no second `start()` intercept consumed. Shutdown handler is in `kernel/src/lifecycle.ts` and is grep-asserted to contain no `cancel(`.

#### `max-job-duration` · BLOCKING

Every job carries `maxDurationMs` from the descriptor (default 15 min, hard ceiling 30 min); on expiry the runner MUST call `cancel()`, record `Timeout`, and mark the cost record `chargeStatus: 'possibly-charged'`.

- **Neden:** A stuck provider job that never reaches a terminal state pins a queue slot forever, and quietly assuming it was free understates spend.
- **Zorlama:** Zod descriptor schema requires `maxDurationMs` with `.max(1_800_000)`; conformance case `timeout` asserts `cancel()` was invoked and the ledger row carries `possibly-charged`.

#### `abortsignal-all-the-way-down` · BLOCKING

Every async adapter method MUST accept `ctx: CallContext` carrying an `AbortSignal` and pass it into `fetch`/SDK calls as `AbortSignal.any([ctx.signal, AbortSignal.timeout(perCallMs)])`; per-call HTTP timeouts MUST be explicit (default 30 s for control-plane calls, 300 s for uploads) — never rely on a runtime default.

- **Neden:** Without a signal, cancelling a run leaves the HTTP request and its retry loop running, still spending money and still writing to the ledger after the user pressed Escape.
- **Zorlama:** The `ProviderAdapter` port types every async method's second parameter as `CallContext`; eslint `no-restricted-syntax` flags `fetch(` calls whose options object lacks a `signal` property. `AbortSignal.any` and `AbortSignal.timeout` are available in Node 22 (added v20.3.0 / v17.3.0 respectively).

#### `child-process-group-kill` · BLOCKING

Chromium (Playwright) and ffmpeg MUST be spawned with `{ detached: true }`, registered in `.derived/run/pids.json` before the first await, and terminated with `process.kill(-pid, 'SIGTERM')` followed by `process.kill(-pid, 'SIGKILL')` after 5 s; browser contexts MUST be closed with `browserContext.close()` before `browser.close()`.

- **Neden:** `subprocess.kill()` does not terminate grandchildren on Linux, so a cancelled render leaves a headless Chrome eating 1.5 GB and an ffmpeg holding the output file open — on a 6-person company's single laptop that is the whole machine.
- **Zorlama:** All process spawning goes through `kernel/src/proc.ts`; CI grep bans `spawn(`/`exec(`/`chromium.launch(` outside it. A startup sweep reads `pids.json`, kills any live PID from a previous run, and logs an `orphan_reaped` event; a test asserts the sweep is idempotent. Sources: https://nodejs.org/docs/latest-v22.x/api/child_process.html, https://playwright.dev/docs/api/class-browser.

#### `sops-age-only` · BLOCKING

All ~20 API keys live in `secrets/providers.enc.yaml`, encrypted with SOPS + age via `.sops.yaml` `creation_rules`; the age identity lives at `$XDG_CONFIG_HOME/sops/age/keys.txt` (never in the repo). 1Password CLI, direnv `.envrc` and OS keychains are NOT permitted for provider keys.

- **Neden:** SOPS+age is one static binary, works offline and unattended (a 3 a.m. cron render cannot answer a biometric prompt), and produces a git diff that shows which key changed without revealing values. direnv stores plaintext; the GNOME keyring is not portable across the team's machines.
- **Zorlama:** `.gitignore` contains `secrets/*.dec.yaml` and `*.decrypted`. A pre-commit hook and a CI job run `scripts/check-secrets.ts`: every file under `secrets/` must parse as SOPS-encrypted (has a `sops.mac` field) and no tracked file may contain a string matching the provider key regexes (`sk-`, `r8_`, `fal_`, `EAAG`, `AKIA`, 32+ char base64 with high entropy).

#### `env-indirection-in-descriptors` · BLOCKING

A Ring 1 provider descriptor MUST reference credentials only by environment variable NAME (`apiKeyEnv: FAL_KEY`) and MUST NOT contain a value; the process is launched via `sops exec-env secrets/providers.enc.yaml -- pnpm start` so plaintext never touches disk.

- **Neden:** The registry is user-editable YAML that gets committed; one pasted key there is a permanent leak in git history.
- **Zorlama:** Zod descriptor schema has no field capable of holding a secret value and rejects unknown keys (`.strict()`); CI grep over `registry/providers/*.yaml` for `key:`, `token:`, `secret:` with a non-`_ENV` value fails the build.

#### `rotation-and-leak-response` · BLOCKING

Rotate every provider key every 90 days. On suspected leak the order is: (1) revoke/regenerate the key AT THE PROVIDER, (2) update `secrets/providers.enc.yaml`, (3) `sops updatekeys` then `sops rotate -i` on affected files if an age recipient is compromised. Never treat `git filter-repo` as the remediation.

- **Neden:** `sops rotate` rotates the SOPS data key, not the API key — rotating SOPS after a plaintext leak changes nothing at the provider. Git history rewriting does not un-leak a key that was already cloned.
- **Zorlama:** `registry/providers/*.yaml` carries `keyRotatedAt`; a CI job fails the build when any value is older than 90 days. The runbook lives at `docs/runbooks/key-leak.md` and is linked from the CI failure message. Source: https://getsops.io/docs/usage/key-management/.

#### `money-as-integers` · BLOCKING

All monetary amounts MUST be stored and computed as integer USD micro-units (`1_000_000n === $1.00`) using `bigint`; floating-point currency arithmetic is banned, and the display layer is the only place a decimal string is produced.

- **Neden:** Per-image and per-second billing produces values like $0.0035 that accumulate float error across a 300-call campaign and make estimate-vs-actual reconciliation report phantom drift.
- **Zorlama:** `CostRecord.amountMicros: bigint`; eslint `@typescript-eslint/no-unsafe-argument` plus a CI grep banning `parseFloat`/`Number(` on any identifier matching `/cost|price|amount|spend/i` outside `packages/ui/src/format/`.

#### `estimate-and-actual-both-recorded` · BLOCKING

Every provider call MUST write exactly one ledger row containing `estimate` (units, unitPriceMicros, formulaVersion, currency `USD`), `actual` (parsed from the provider's usage payload by `actualCost()`), and `deltaRatio`; when a provider reports no usage, `actual` is `null` and `chargeStatus` is `'unreported'` — never silently copied from the estimate.

- **Neden:** Copying the estimate into the actual makes drift invisible, which is exactly the number that tells you a provider changed its pricing.
- **Zorlama:** Ledger row Zod schema makes `actual` a nullable discriminated field and forbids `actual === estimate` by construction (different branded types). Conformance case `actualCost-parsing` per adapter.

#### `try-reporting-fx-snapshot` · BLOCKING

Billing currency is USD; TRY reporting MUST use the TCMB daily bulletin (`https://www.tcmb.gov.tr/kurlar/today.xml`, root `Tarih_Date`, `Currency Kod="USD"` → `ForexSelling`), fetched once per business day after 15:30 Europe/Istanbul, stored as an immutable snapshot with `rateDate` and `Bulten_No`. Historical rows are NEVER re-priced with a newer rate.

- **Neden:** TRY moved enough in 2025-2026 that recomputing last quarter's campaign spend with today's rate silently rewrites the numbers already shown to the founders. As of bulletin 2026/151 (2026-08-14) USD/TRY ForexSelling was 47.8066.
- **Zorlama:** `fxRateId` is a required non-null column on every TRY-denominated report row; a CI test asserts `report(period)` returns byte-identical output when run twice with different current rates. TCMB publishes no bulletin on weekends/holidays — the fetcher falls back to the most recent bulletin and records that `rateDate`.

#### `reconciliation-drift-job` · WARN

A daily reconciliation job MUST flag any call where `|actual - estimate| / estimate > 0.25`, any terminal call still `chargeStatus: 'unreported'` after 24 h, and any provider whose 7-day mean drift exceeds 10%; flagged providers are surfaced in the run-queue header until a human acknowledges.

- **Neden:** A silent provider price change shows up first as consistent one-directional drift, weeks before it shows up on the invoice.
- **Zorlama:** `scripts/reconcile.ts` run by a local systemd timer; it exits non-zero on unacknowledged flags and the shell's status bar renders the count. Test fixtures cover both drift directions.

#### `closed-error-taxonomy` · BLOCKING

All adapter failures MUST map into the closed union `ProviderUnavailable | QuotaExceeded | ContentRejected | ValidationFailed | BudgetExceeded | Cancelled | Timeout | AuthFailed | VersionUnsupported`, each carrying `providerId`, `retryable: boolean`, `retryAfterMs?`, `providerMessage` (verbatim, for the debug pane) and `userMessage` (Turkish, for the surface).

- **Neden:** An open error type means the UI's switch statement gets a `default:` branch that renders 'Something went wrong' for a content-policy rejection the user could have fixed in ten seconds.
- **Zorlama:** `kernel/src/errors/AppError.ts` is the only place `throw new` may appear (throwing is reserved for programmer error); CI greps for `throw new` outside that directory. UI reducers switch on `error.kind` with a `never` exhaustiveness check.

#### `ui-response-per-error` · BLOCKING

The UI MUST render: `ProviderUnavailable` → inline 'retrying in Ns' with breaker state and no user action; `QuotaExceeded` → job parked with an unlock time and a 'switch to free lane' action; `ContentRejected` → terminal, the provider's verbatim reason plus the offending prompt/asset with an inline edit action, and NO retry button; `ValidationFailed` → the failing field path highlighted in the recipe editor; `BudgetExceeded` → blocked before any network call, showing remaining budget; `Cancelled` → neutral, no error styling; `Timeout` → terminal with a 'possibly charged' cost badge and a link to the provider's dashboard.

- **Neden:** Offering a retry button on a content-policy rejection trains the user to bang on it and risks account flags; hiding the 'possibly charged' state on timeout makes the cost dashboard lie.
- **Zorlama:** One Storybook/Ladle story per error kind, asserted present by `scripts/check-error-stories.ts` (fails if a union member has no story); Playwright a11y+visual test on the run-queue error states.

#### `pin-api-versions` · BLOCKING

Every descriptor MUST carry an explicit `apiVersion` string and the adapter MUST send it on every request (LinkedIn: `Linkedin-Version: 202607` plus `X-Restli-Protocol-Version: 2.0.0`; Meta: the `/v23.0/` path segment). Requests without a pinned version, or defaulting to 'latest', are forbidden.

- **Neden:** LinkedIn returns an error when the version header is missing and another when it is deprecated; relying on a server default means an upstream release silently changes your payload shape mid-campaign.
- **Zorlama:** Zod descriptor schema requires `apiVersion` matching a per-provider regex (`/^\d{6}$/` for LinkedIn, `/^v\d+\.\d+$/` for Meta); `wire.ts` header builder is shared and unit-tested. Source: https://learn.microsoft.com/en-us/linkedin/marketing/versioning (monthly YYYYMM releases, supported a minimum of one year, no unversioned calls).

#### `capture-deprecation-headers` · WARN

The shared HTTP client MUST inspect every response for the `Deprecation` (RFC 9745, Structured Field Date, e.g. `Deprecation: @1688169599`) and `Sunset` (RFC 8594, HTTP-date) headers, persist the earliest value per provider into the descriptor's `sunsetAt`, and raise a WARN banner when `sunsetAt` is under 90 days away.

- **Neden:** Deprecation notices arrive in headers months before they arrive in your inbox, and by RFC 9745 the Sunset timestamp is never earlier than the Deprecation one — so the header pair gives you the full runway for free.
- **Zorlama:** `kernel/src/http.ts` parses both headers; test asserts extraction of both formats. A CI check fails the build if any descriptor has `sunsetAt` in the past.

#### `quarterly-spec-drift-job` · WARN

A quarterly `spec-drift` job MUST, for each provider, refetch the pinned version's changelog/spec, diff it against the stored `.derived/specs/<provider>/<version>.json` snapshot, and open a task record in the corpus listing changed fields; the descriptor's `verifiedAt` is stamped only when a human closes that task.

- **Neden:** Solo maintenance means nobody notices a renamed field until a pipeline produces empty Turkish captions in a client deck.
- **Zorlama:** `scripts/spec-drift.ts` scheduled by a local systemd timer on the first business day of each quarter; CI fails when any descriptor's `verifiedAt` is more than 180 days old. Drift output is written as a Ring 2 draft record on a branch — agents propose, the human applies.

#### `adapter-conformance-suite` · BLOCKING

Every adapter MUST pass the shared conformance suite (`packages/adapter-conformance`) covering at minimum: happy path, 429 with `Retry-After`, 500 then success, `ECONNRESET` mid-body, content rejection, validation error, cancel-while-queued, cancel-while-running, deadline timeout, duplicate idempotency key, full status transition sequence, `actualCost()` parsing, and capability-mismatch rejection.

- **Neden:** Thirteen adapters written over six months by one person diverge; a shared suite is the only way the eighth adapter behaves like the first at 2 a.m.
- **Zorlama:** `packages/adapters/*/test/conformance.spec.ts` must `runConformance(adapter, fixtures)`; `scripts/check-adapter-surface.ts` fails any adapter package lacking that file. All fixtures use undici `MockAgent` with `assertNoPendingInterceptors()` — no adapter test may hit the network (CI runs with outbound egress blocked).

#### `artifacts-downloaded-not-linked` · BLOCKING

`status()` MUST NOT return a provider URL as an artifact; on success the adapter downloads the bytes, writes them content-addressed to `.derived/blobs/<sha256>`, and returns an `ArtifactRef { sha256, bytes, mimeType, localPath }`.

- **Neden:** Provider output URLs expire (typically 1–24 hours). A deck rendered on Friday that referenced a live URL is a deck full of broken images on Monday.
- **Zorlama:** `ArtifactRef` has no URL field; eslint bans `http` in any returned artifact literal. Conformance case `artifact-is-local` asserts `localPath` exists on disk and its sha256 matches.

#### `raw-responses-quarantined` · BLOCKING

Raw provider JSON MAY be persisted to `.derived/runs/<runId>/raw/<callId>.json` for debugging, but only `packages/adapters/**` and the debug pane may read that path; kernel and pipeline code MUST NOT.

- **Neden:** A debug dump that becomes a data source is a provider shape leak with extra steps — it reintroduces exactly the coupling the adapter boundary exists to prevent.
- **Zorlama:** `import/no-restricted-paths` zone plus a CI grep for the literal `runs/` + `raw/` path outside the permitted directories.

#### `budget-lease-before-network` · BLOCKING

`start()` MUST acquire a `BudgetLease` for the estimated amount before any network call and release the unused remainder on terminal status; when the lease cannot be granted, return `BudgetExceeded` without touching the network.

- **Neden:** Checking the budget after the call means the cap is advisory — a runaway 40-variant loop discovers the limit only after spending past it.
- **Zorlama:** `CallContext.budget` is a required non-optional field and `kernel/src/http.ts` asserts `budget.state === 'leased'` before dispatch; test drives a run past the configured cap and asserts zero intercepts consumed after the boundary.



### Kalemler (23)

| Ad | Tür | Ne | Erişim | Maliyet | Karar |
|---|---|---|---|---|---|
| SOPS (getsops) |  | Encrypts values (not keys) in YAML/JSON/ENV; `.sops.yaml` `creation_rules` bind `path_regex` to age recipients; `sops encrypt/decrypt`, `-i` in-place, `sops exec-env`, `sops exec-file`, `sops rotate - |  |  | ADOPT — single static binary, offline, unattended, git-diffable ciphertext, no subscription. |
| age |  | X25519 file encryption; recipients listed in `.sops.yaml`, identities one-per-line in `keys.txt`. |  |  | ADOPT — the key backend for SOPS; no GPG agent, no keyring daemon. |
| 1Password CLI (`op`) |  | `op run --env-file` injects secrets from a vault into a child process environment. |  |  | HOLD — requires an active subscription, network reachability and an interactive unlock; a 3 a.m. cron render cannot answer a biometric prompt. |
| direnv |  | Auto-loads `.envrc` into the shell on `cd`. |  |  | AVOID for provider keys — `.envrc` is plaintext on disk and one `git add -A` from being committed. |
| Zod |  | Runtime schema validation; the mandatory parse step in every `<adapter>/src/wire.ts` and for Ring 1 descriptor schemas (`.strict()` so a pasted secret key is a hard error). |  |  | ADOPT — it is what makes 'no provider shape escapes' mechanically true rather than aspirational. |
| undici MockAgent |  | In-process HTTP interception for Node's global fetch; `assertNoPendingInterceptors()` proves no extra calls were made. |  |  | ADOPT — the substrate for the adapter conformance suite; no network in CI. |
| eslint-plugin-import (`import/no-restricted-paths`) |  | Zone-based import boundaries — the mechanism that stops kernel/pipeline code importing provider SDKs or `wire.ts`. |  |  | ADOPT — cheapest possible enforcement of the ring architecture. |
| AWS SDK retry behavior reference |  | Standard/adaptive/legacy modes; full-jitter formula `random(0,1) × min(20000ms, base × 2^retry)`; base 50 ms transient / 1000 ms throttling; 20 s cap; 500-token retry quota costing 14 (transient) / 5  |  |  | ADOPT the numbers verbatim — they are the best-documented production-tuned defaults available and cost nothing to copy. |
| AWS Architecture Blog — Exponential Backoff And Jitter |  | Origin of the Full Jitter / Equal Jitter / Decorrelated Jitter comparison: `sleep = random(0, min(cap, base * 2 ** attempt))`. |  |  | ADOPT Full Jitter — 'Equal Jitter' does more work and takes much longer per the article's own analysis. |
| Google SRE Book — Handling Overload |  | Client-side adaptive throttling `max(0, (requests − K·accepts)/(requests+1))` with K=2 (1.1 when rejection is nearly as expensive as serving); 3 attempts max per request; retries capped at 10% of a cl |  |  | ADOPT the retry budget (10%) and attempt cap (3); TRIAL adaptive throttling — with a single local client the token bucket usually suffices. |
| Stripe idempotent requests |  | The reference semantics for `Idempotency-Key`: server stores status+body of the first request (including 500s), replays them on retry, compares incoming params and errors on mismatch, keys ≤255 chars, |  |  | ADOPT as the behavioral model our adapters assume, and as the yardstick for judging a provider that lacks it. |
| RFC 9110 §10.2.3 (Retry-After) + RFC 6585 §4 (429) |  | `Retry-After` accepts an HTTP-date or delay-seconds; RFC 6585 §4 defines 429 and says responses MAY include `Retry-After`. |  |  | ADOPT — parse both value forms; never assume seconds. |
| RFC 9745 (Deprecation) + RFC 8594 (Sunset) |  | `Deprecation` is an Item Structured Field whose value MUST be a Date (`Deprecation: @1688169599`); `Sunset` is an HTTP-date and MUST NOT be earlier than the Deprecation timestamp. |  |  | ADOPT — free early warning for the spec-drift job, costs one header parse. |
| Meta Graph API rate limiting |  | `X-App-Usage` and `X-Business-Use-Case-Usage` headers with `call_count`, `total_cputime`, `total_time`, `estimated_time_to_regain_access` (minutes), `type`; throttling at 100 on any counter; error cod |  |  | ADOPT header-driven limiting — the headers are far more actionable than the error codes. |
| Instagram content publishing + content_publishing_limit |  | Two-step publish (`POST /{ig-user-id}/media` → `POST /{ig-user-id}/media_publish`); container `status_code` ∈ {IN_PROGRESS, FINISHED, PUBLISHED, ERROR, EXPIRED}; containers expire after 24 h; document |  |  | ADOPT the quota precheck and the reconcile-on-ambiguity rule; treat `media_publish` as non-retryable. |
| LinkedIn Marketing API versioning |  | `Linkedin-Version: YYYYMM` header plus `X-Restli-Protocol-Version: 2.0.0`; monthly releases; each version supported a minimum of one year; missing or deprecated version headers return errors; base pat |  |  | ADOPT explicit pinning; schedule the version bump as a calendar item, not an incident. |
| TCMB daily exchange rate bulletin |  | `today.xml`, root element `Tarih_Date` with `Tarih`/`Date`/`Bulten_No` attributes; per-currency `ForexBuying`/`ForexSelling`/`BanknoteBuying`/`BanknoteSelling`; USD is `CrossOrder="0"`. |  |  | ADOPT as the single FX source for TRY reporting — authoritative, free, no key, and defensible to an accountant. |
| Playwright (browser lifecycle) |  | `browserContext.close()` before `browser.close()` to flush artifacts; `browser.close()` is 'similar to force-quitting'; the `disconnected` event fires on crash or close. |  |  | ADOPT — already the decided render engine; the discipline is the PID registry and process-group kill around it. |
| Node.js child_process (process-group termination) |  | `detached: true` makes the child a process-group leader on POSIX; `process.kill(-pid)` signals the whole group; `subprocess.kill()` alone does not reach grandchildren; `'close'` fires after `'exit'` o |  |  | ADOPT — this is the only reliable way to reap an ffmpeg spawned under a shell. |
| Node.js AbortSignal (globals) |  | `AbortSignal.timeout(delay)` (v17.3.0+), `AbortSignal.any(signals)` (v20.3.0+), `AbortSignal.abort(reason)`, `signal.reason`, the `'abort'` event. |  |  | ADOPT — `AbortSignal.any([ctx.signal, AbortSignal.timeout(ms)])` is the exact composition the adapter contract requires; no library needed. |
| Replicate predictions API |  | Poll `urls.get` (1–2 s suggested); `Prefer: wait` / `Prefer: wait=N` for synchronous mode with a 60 s default; `urls.cancel` for cancellation; `Cancel-After` header (5 s to 24 h) auto-cancels. |  |  | TRIAL as a premium-lane provider; its `Cancel-After` maps cleanly onto our `maxDurationMs`. |
| fal.ai queue API |  | Async submit returning a `request_id` with separate status/response/cancel endpoints — the shape our `start()/status()/cancel()` port assumes. |  |  | TRIAL — architecturally a good fit for the long-job polling discipline. |
| HyperFrames |  | Apache-2.0, HTML-authored motion rendering via Chrome + FFmpeg — the decided motion engine. |  |  | ADOPT (already decided) — but it inherits every rule in the orphan-process section, since it drives both Chrome and ffmpeg. |

<details><summary>Notlar</summary>

**SOPS (getsops)** — Verified this session: age identity resolution order is $SOPS_AGE_KEY, then $SOPS_AGE_KEY_FILE, then $XDG_CONFIG_HOME/sops/age/keys.txt, falling back to $HOME/.config/sops/age/keys.txt. `sops rotate` regenerates the DATA key only — it does not rotate the API key at the provider. `--add-age`/`--rm-age` flags were not confirmed on the key-management page (only `--add-pgp`/`--rm-pgp` were shown); use `.sops.yaml` + `sops updatekeys` for age recipient changes.

**age** — Referenced from the SOPS age identity docs. One recipient per team machine means revoking a lost laptop is a `.sops.yaml` edit plus `sops updatekeys` + `sops rotate -i`.

**1Password CLI (`op`)** — Not fetched this session; assessment is architectural, not a claim about current 1Password features. Service accounts do exist and would remove the prompt — re-evaluate if the team grows past ~10 people.

**direnv** — Fine for non-secret local config (paths, feature flags). Pair with SOPS only via `source_env` of a `sops exec-env` output, never by storing values directly.

**Zod** — Not fetched this session; version/API surface unverified. Pin the major version and treat a Zod major bump as a schema migration.

**undici MockAgent** — Undici's own default `headersTimeout`/`bodyTimeout` values were NOT verified this session (the docs site is an SPA and did not render). Do not rely on them: always pass an explicit `AbortSignal.timeout()`.

**eslint-plugin-import (`import/no-restricted-paths`)** — Rule name verified from memory of the plugin's docs path, not fetched this session — confirm the exact `zones` option shape against the installed version before relying on the CI gate. The core ESLint `no-restricted-imports` rule is a workable fallback.

**AWS SDK retry behavior reference** — Verified 2026-08-14. Note the page describes behavior gated behind `AWS_NEW_RETRIES_2026=true`; the classification tables and quota math are what we are borrowing, not the AWS SDK itself.

**AWS Architecture Blog — Exponential Backoff And Jitter** — Verified 2026-08-14. The canonical Builders Library article now redirects to builder.aws.com and rendered empty via WebFetch this session; this blog post carries the formulas.

**Google SRE Book — Handling Overload** — Verified 2026-08-14, including the verbatim 'A request will only be retried as long as this ratio is below 10%'.

**Stripe idempotent requests** — Verified 2026-08-14. Important corollary: a provider that prunes keys after 24 h cannot protect a job resumed after a weekend — that is why our own ledger, not the provider's key store, is the authority.

**RFC 9110 §10.2.3 (Retry-After) + RFC 6585 §4 (429)** — Verified 2026-08-14. 429 is defined in RFC 6585, not RFC 9110 — cite correctly in code comments.

**RFC 9745 (Deprecation) + RFC 8594 (Sunset)** — Verified 2026-08-14: RFC 9745 published March 2025; RFC 8594 Informational, May 2019. Most providers do not send these yet — absence is not evidence of stability, so the quarterly changelog diff is still required.

**Meta Graph API rate limiting** — Verified 2026-08-14. The Instagram quota verified on the platform overview page is `Calls within 24 hours = 4800 × Number of Impressions`. A points model of read=1/write=3 could NOT be confirmed on any reachable Meta page this session — see `unverified`.

**Instagram content publishing + content_publishing_limit** — Verified 2026-08-14. `quota_usage` field naming on the `content_publishing_limit` edge was not confirmed from the reference page (404 this session) — verify the exact field names against a live call before shipping the precheck.

**LinkedIn Marketing API versioning** — Verified 2026-08-14: latest listed version 202607 (July 2026), and 202507 is already sunset — the one-year window is real and enforced.

**TCMB daily exchange rate bulletin** — Verified 2026-08-14 (Bulten_No 2026/151, USD ForexSelling 47.8066). No bulletin is published on weekends/public holidays; the fetcher must fall back to the most recent bulletin and record which `rateDate` it used. Archive URLs follow /kurlar/YYYYMM/DDMMYYYY.xml for backfill.

**Playwright (browser lifecycle)** — Verified 2026-08-14. Playwright's own close path does not protect against a killed Node process leaving Chrome behind — that is why `.derived/run/pids.json` plus a startup reaper is mandatory.

**Node.js child_process (process-group termination)** — Verified 2026-08-14 against the Node 22 docs, including the documented example showing `subprocess.kill()` failing to terminate a grandchild.

**Node.js AbortSignal (globals)** — Verified 2026-08-14 on Node 22 docs. Whether `AbortSignal.timeout()` unrefs its timer is NOT stated there — do not rely on it to let the process exit; the shutdown handler must abort explicitly.

**Replicate predictions API** — Verified 2026-08-14. Idempotency-key support was not addressed on that page — treat Replicate creates as non-idempotent until confirmed, i.e. ledger-before-network is load-bearing there.

**fal.ai queue API** — COULD NOT BE FETCHED this session (HTTP 429, then a connect timeout to docs.fal.ai). Every claim about fal's exact status enum, cancel verb and polling guidance must be re-verified before an adapter ships.

**HyperFrames** — Repository URL not verified this session. Treat HyperFrames as a local 'provider' behind the same `ProviderAdapter` port: it has an estimate (frames × resolution → seconds of CPU), a start, a status and a cancel, and it can absolutely leave orphans.

</details>


### Doğrulanmamış

- The Meta points-based model (read = 1 point, write = 3 points) could NOT be confirmed from any reachable primary Meta page this session. The Graph API rate-limiting page and the Instagram Platform overview both describe quotas as call counts, with Instagram documented as `Calls within 24 hours = 4800 × Number of Impressions`. Attempts to reach the Threads API rate-limiting docs (three URL variants) all returned 404. The weighted-cost rule (`weight: {read: 1, write: 3}`) is written as a descriptor capability that CAN express such a model — verify the actual per-call weights against Meta's live docs before configuring them.
- The exact field names on the Instagram `content_publishing_limit` edge (`quota_usage`, `config.quota_total`, `config.quota_duration`, the `since` parameter). The 100-posts-per-rolling-24-hours figure and the once-per-minute-for-5-minutes container polling guidance WERE confirmed from the content-publishing guide, but the reference page for the edge returned 404 this session.
- fal.ai queue API specifics — endpoint paths, the exact status enum (`IN_QUEUE`/`IN_PROGRESS`/`COMPLETED`), `queue_position`, the cancel verb, and any recommended polling interval. docs.fal.ai returned HTTP 429 and then a connect timeout; nothing about fal in this rulebook is verified.
- Replicate idempotency support. The create-a-prediction page documented `Prefer: wait`, polling, `urls.cancel` and `Cancel-After`, but said nothing about `Idempotency-Key` or client-provided prediction ids. Assume creates are non-idempotent until confirmed.
- OpenAI's `Idempotency-Key` header. The pricing page returned HTTP 403 and no OpenAI API reference page was fetched this session. Do not assume the header is honoured without checking.
- undici's default `headersTimeout`, `bodyTimeout`, `connectTimeout` and `keepAliveTimeout` values in the Node 22 bundled version. The undici docs site rendered as an SPA shell. This is why the rules mandate an explicit `AbortSignal.timeout()` on every call rather than citing a default.
- Whether `AbortSignal.timeout()` unrefs its underlying timer in Node 22. The Node globals documentation does not state it. Do not rely on it to allow a clean process exit.
- The exact `zones` option shape for eslint `import/no-restricted-paths` in the version you install. The rule name is used from memory of the plugin's documentation path; the docs page itself was not fetched. Verify before relying on it as a BLOCKING CI gate — the core `no-restricted-imports` rule is an adequate fallback.
- The Zod version and API surface (`.strict()` vs `.catchall(z.never())` for rejecting unknown descriptor keys) — zod.dev was not fetched this session.
- The HyperFrames repository URL and its exact CLI/API surface. Its Apache-2.0 licence and Chrome+FFmpeg architecture were given as already-decided context and were not independently verified.
- The canonical AWS Builders Library article 'Timeouts, retries and backoff with jitter' now 301-redirects to builder.aws.com and rendered empty via WebFetch. Its formulas were instead verified from the AWS Architecture Blog post and the AWS SDK retry-behavior reference, both of which are cited directly in the rules.
- SOPS `--add-age` / `--rm-age` command-line flags. The key-management page showed only `--add-pgp` / `--rm-pgp`. Use `.sops.yaml` recipient edits plus `sops updatekeys` as the documented path for age.
- Whether every provider in the eventual ~20 emits `Deprecation` / `Sunset` headers. The RFCs are verified; provider adoption is not. The quarterly changelog-diff job is the load-bearing mechanism, not the headers.
- TCMB bulletin publication time. The XML carries `Tarih`, `Date` and `Bulten_No` but no timestamp; the 15:30 Europe/Istanbul figure in the FX rule is operational folklore, not something the XML confirms. Verify against TCMB's published schedule, or simply make the fetcher idempotent and retry until the bulletin number advances.


### Anti-desenler

- Random idempotency keys. Someone reaches for `crypto.randomUUID()` because it is one line, the process crashes mid-run, the resume sweep computes a fresh key, and the same 12-second video is generated and billed twice. Symptom: the reconciliation job shows two identical `actual` rows seconds apart with different keys and identical `inputDigests`.
- Blind retry of `media_publish`. A socket reset after Meta already processed the publish, plus a generic retry wrapper, equals two identical posts on the client's Instagram feed — visible to the client before it is visible to you. Symptom: the ledger has one publish row; the feed has two posts.
- Retry at three layers. The provider SDK retries 3×, the adapter retries 3×, the run queue retries 3×: one logical call becomes 27 requests, the provider 429s the whole app, and the budget cap is hit on a run the user thought was cheap. Symptom: `X-App-Usage.call_count` jumps 30 points from a single UI click.
- `setTimeout`-based polling across a laptop suspend. The lid closes for two hours; on wake every pending timer fires at once and 14 status calls hit one provider in the same millisecond, triggering a lockout. Symptom: a burst of 429s clustered within 50 ms of resume, then `estimated_time_to_regain_access` in the tens of minutes.
- Deleting `.derived/` to 'rebuild the index'. Ring 3 is documented as rebuildable, so someone runs `rm -rf .derived` and destroys the ledger — the only record of what was spent and which jobs are still running remotely. Symptom: the cost dashboard resets to zero and 6 provider jobs keep running with no local handle.
- Estimate copied into actual. `actualCost()` for a provider that reports no usage returns the estimate 'so the dashboard looks complete'; drift becomes structurally invisible and a 40% price increase is discovered on the invoice. Symptom: `deltaRatio` is exactly 0.000 for 100% of one provider's rows.
- Provider URLs stored as artifacts. `status()` returns fal's or Replicate's output URL, the deck renders fine on Friday, and on Monday every image is a broken icon because the URL expired. Symptom: a client-facing PDF with grey placeholder boxes.
- Orphaned Chromium after cancel. `subprocess.kill()` is called on the shell that spawned ffmpeg, the grandchild survives, and after a week of cancelled renders the laptop has 11 headless Chrome processes and no free RAM. Symptom: `ps aux | grep -c chrome` climbing across the day; renders getting slower for no code reason.
- Sleeping only the failing call on 429. The other 11 queued calls to the same provider fire immediately, each gets 429, each burns 5 retry tokens, and the quota is drained in under two seconds — turning a 30-second throttle into a five-minute outage. Symptom: retry-quota depletion warnings within seconds of the first 429.
- Retrying a content-policy rejection. The classifier defaults unknown 400-family bodies to retryable, the same rejected Turkish prompt is submitted 3×, and the provider's abuse heuristics start flagging the account. Symptom: `ContentRejected` rows appearing in triplicate with identical `providerMessage`.
- Repricing history with today's FX rate. The TRY report is computed live from `today.xml`, so last quarter's campaign spend changes every time someone opens the dashboard and nobody trusts the number again. Symptom: two screenshots of the same period showing different TRY totals.
- Floating-point money. Per-second TTS billing at $0.00003 accumulated as `number` across 300 calls produces drift that the reconciliation job reports as a provider pricing change. Symptom: `deltaRatio` values clustered around 1e-12 that nobody can explain.
- Pasting a key into a Ring 1 descriptor. The registry is user-editable YAML that the user edits at runtime and then commits; one convenient paste puts a live provider key in git history permanently. Symptom: the pre-commit secret scanner is bypassed with `--no-verify` because 'it was urgent'.
- Rotating SOPS instead of the key after a leak. `sops rotate -i` is run, everyone feels safe, and the leaked API key is still live at the provider because SOPS rotated its own data key and nothing else. Symptom: unexplained provider usage from an IP that is not yours.
- Hardcoding a model id in a pipeline. `model: 'flux-pro-1.1'` in a recipe makes the free lane unimplementable and turns the provider's next deprecation into a code change across every pipeline that copied the line. Symptom: grep finds the same model string in 7 YAML files.
- A `default:` branch in the UI's error switch. Adding `AuthFailed` to the union compiles fine, and a bad key renders as 'Bir hata oluştu' with no indication that the fix is 30 seconds of work. Symptom: repeated identical support questions from the same 6-person team.
- Trusting webhooks. An adapter is written against the provider's webhook flow because the docs recommend it, then fails silently on a NAT'd laptop with no public ingress; the job completes remotely and is never claimed. Symptom: jobs stuck in `running` forever with a `succeeded` state on the provider's dashboard.
- Cancelling remote jobs on shutdown. A tidy SIGTERM handler calls `cancel()` on everything, and closing the laptop for lunch throws away four minutes of paid video render per job. Symptom: cost spent with no artifact produced, correlated exactly with process restarts.
