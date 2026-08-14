# Testing strategy for non-deterministic media output (Upcytech Creative Suite — Node 22 / TS / pnpm / Vite+React / Hono / better-sqlite3, four-ring kernel-registry-corpus-derived architecture)

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Özet

The system's outputs are mostly non-deterministic (LLM Turkish prose, generated images/video), but everything *around* them is deterministic and that is what gets tested. The strategy is five lanes, not a pyramid of one kind:

1. **Unit (fast, hermetic, ~70% of test count).** Ring 0 kernel purity is the asset: router scoring, cost formulas, the projection compiler, spec/schema validators and Turkish text primitives are pure functions of (input, registry snapshot). They are table-tested with zero I/O. Cost is computed in integer minor units (kuruş) so equality is exact.
2. **Contract (provider adapters vs. recorded cassettes).** One shared contract suite runs against every adapter. HTTP is intercepted by **msw 2.x `setupServer` with `onUnhandledRequest: 'error'`** (verified default is `'warn'` — you must set it), which turns "a test tried to reach the internet" into a failure rather than a bill. Polly.JS is out (Netflix/pollyjs last pushed 2025-05-31, no GitHub releases); nock 14.0.17 is healthy but node-http-only, so msw is the single interception layer for Node + browser.
3. **Golden-file (Chromium stills, deck PDFs, deck pages).** Playwright `toHaveScreenshot` (pixelmatch under the hood, `threshold` default 0.2, `maxDiffPixels`/`maxDiffPixelRatio` unset by default). Determinism comes from bundled+pinned fonts, a pinned container, fixed viewport/DSF, `animations: 'disabled'`, `caret: 'hide'`, masked volatile regions, and `{platform}`-scoped snapshot paths. PDFs are rasterized per page and diffed as images — never byte-compared, because `page.pdf()` output embeds volatile metadata and uses print media with color adjustment.
4. **Evaluated, not tested (LLM quality).** promptfoo 0.122.0 supplies deterministic assertions (`is-json` with schema, `regex`, `contains-all`, `javascript`, `levenshtein`, `word-count`, `cost`, `latency`, `finish-reason`) plus model-graded ones (`llm-rubric`, `g-eval`, `factuality`). Deterministic assertions gate; judges only route to a human queue.
5. **Pre-flight instead of tests for paid work.** Every paid verb must expose `plan()` — dry run, zero spend — and `cs plan` is the CI-tested gate that validates schema, resolves providers, estimates cost and asserts the budget cap.

Coverage is scoped to the kernel and validators only; a repo-wide percentage is explicitly banned.


### Kurallar (49)

#### `five-test-lanes` · BLOCKING

Every test file must live in exactly one of five lanes — `tests/unit/**`, `tests/contract/**`, `tests/golden/**`, `tests/agentic/**`, `tests/live/**` — each with its own pnpm script and its own Vitest project; a test file outside these roots fails CI.

- **Neden:** Without lane separation, one flaky screenshot or one paid API call blocks every commit, and a solo maintainer starts skipping the whole suite.
- **Zorlama:** Vitest `test.projects` with explicit `include` globs per project; CI step `pnpm vitest list --project unit --project contract` plus a `find tests -name '*.test.ts' -not -path 'tests/{unit,contract,golden,agentic,live}/*'` grep that must return empty.

#### `unit-lane-is-hermetic` · BLOCKING

Files under `tests/unit/**` and the modules they import must not import `node:fs`, `node:child_process`, `node:http(s)`, `undici`, `playwright`, `better-sqlite3` or any `packages/providers/*` adapter.

- **Neden:** A pure-function lane that quietly touches disk or network becomes slow and non-deterministic, and it is the only lane that can be trusted to run on every save.
- **Zorlama:** `eslint no-restricted-imports` with a `tests/unit/**` + `packages/kernel/src/**` override listing those specifiers; plus the msw guard from `no-egress-in-ci`.

#### `kernel-never-reads-attributes-test` · BLOCKING

Ship a unit test that constructs a record whose `attributes` is a Proxy throwing on any property access, runs it through every exported kernel verb and the projection compiler, and asserts no throw.

- **Neden:** The inviolable rule ('kernel code NEVER reads record.attributes') is enforced by a CI grep today; a grep is defeated by destructuring, aliasing or dynamic keys, and a runtime tripwire is not.
- **Zorlama:** `tests/unit/kernel/attribute-firewall.test.ts`; the existing CI grep stays as a second line of defence.

#### `cost-in-integer-minor-units` · BLOCKING

All cost formulas compute in integer minor units (kuruş / cents) and return `bigint` or `number` that is an integer; floating-point currency arithmetic and float equality in cost tests are forbidden.

- **Neden:** `0.1 + 0.2 !== 0.3` makes budget-cap assertions and estimate-vs-actual reconciliation silently wrong, and rounding drift compounds across a 40-step pipeline.
- **Zorlama:** Table test per provider descriptor with `expect(cost).toBe(<integer>)`; `eslint no-restricted-syntax` banning `toBeCloseTo` inside `tests/unit/cost/**`; a schema rule that `cost_formula` output unit is declared as a minor unit.

#### `cost-formula-table-per-descriptor` · BLOCKING

Every provider descriptor YAML must have at least three fixed input→cost rows in `tests/unit/cost/table.ts`; adding a descriptor without rows fails CI.

- **Neden:** Cost formulas are the only thing between a dry run and an unbounded bill, and they are edited at runtime in Ring 1 where the type system cannot help.
- **Zorlama:** A test that globs `registry/providers/*.yaml`, diffs the id set against the table's keys, and fails on any id with fewer than three rows.

#### `router-is-pure-and-golden` · BLOCKING

The capability router must be a pure function `(CapabilityRequest, RegistrySnapshot, Budget) => RouteDecision` with a deterministic, documented tie-break (declared descriptor priority, then lexicographic id); its behaviour is frozen as a golden decision table in `tests/unit/router/decisions.json`.

- **Neden:** Non-deterministic tie-breaking (Object key order, Math.random, Date.now) makes the free/premium lane choice unreproducible and makes every downstream cost estimate unauditable.
- **Zorlama:** Golden JSON compared with `toMatchFileSnapshot`; `eslint no-restricted-globals` for `Math.random`/`Date.now` inside `packages/kernel/src/router/**` with an injected clock/RNG instead.

#### `turkish-text-locale-pinned` · BLOCKING

Every case transform in Turkish text primitives must pass an explicit `'tr'` locale (`toLocaleUpperCase('tr')` / `toLocaleLowerCase('tr')`); bare `toUpperCase()`/`toLowerCase()` on content strings is forbidden.

- **Neden:** Turkish dotted/dotless I: `'i'.toUpperCase()` gives `I` not `İ`, and `'I'.toLowerCase()` gives `i` not `ı` — a brand name or hashtag silently becomes misspelled Turkish in a published post.
- **Zorlama:** `eslint no-restricted-syntax` on `CallExpression[callee.property.name=/^to(Upper|Lower)Case$/]` inside `packages/kernel/src/text/**` and `packages/pipelines/**`; unit tests asserting `İstanbul`↔`istanbul` and `ISPARTA`↔`ısparta` round-trips.

#### `diacritic-integrity-property-test` · BLOCKING

All Turkish content strings must be NFC-normalized at the corpus boundary, and every text transform must have a property test asserting the multiset of `[çÇğĞıİöÖşŞüÜ]` is preserved unless the transform is explicitly declared lossy.

- **Neden:** Slugifiers, truncators, template engines and LLM round-trips silently strip or decompose Turkish diacritics; the result reads as broken Turkish to a customer but passes every length check.
- **Zorlama:** `tests/unit/text/diacritics.property.test.ts` over a fixed 500-string Turkish corpus; a corpus loader assertion `s === s.normalize('NFC')` that throws on ingest.

#### `validators-need-negative-fixtures` · BLOCKING

Every registry and corpus schema must ship one valid fixture and at least three invalid fixtures, and each invalid test must assert the exact error path (e.g. `/pipelines/0/steps/2/capability`), not merely that validation failed.

- **Neden:** A validator that rejects everything passes a 'it fails on bad input' test; the user editing YAML at runtime needs the error to point at the right line.
- **Zorlama:** Test helper `expectInvalid(fixture, path)` using Ajv `errors[].instancePath`; a CI test that every file in `schemas/**` has a sibling `fixtures/invalid/*` directory with ≥3 entries.

#### `msw-is-the-only-interceptor` · BLOCKING

HTTP interception in Node tests uses msw `setupServer` exclusively; `nock`, `@pollyjs/*`, `fetch-mock` and hand-rolled `globalThis.fetch` monkey-patching must not appear in `package.json` or in test code.

- **Neden:** Two interception layers fight over the same `undici` dispatcher and produce 'passes alone, fails in suite' flakes; Polly.JS is effectively unmaintained (last push 2025-05-31, no releases).
- **Zorlama:** `eslint no-restricted-imports` for those packages; `pnpm why nock` in CI must fail to resolve; a `knip`/`depcheck` step on devDependencies.

#### `no-egress-in-ci` · BLOCKING

The global test setup must call `server.listen({ onUnhandledRequest: 'error' })` and CI must run with `CS_ALLOW_NETWORK=0`; any unhandled outbound request fails the test that made it.

- **Neden:** msw's default is `'warn'`, which lets a test quietly hit a real paid endpoint and put a charge on a 6-person company's card from a CI runner.
- **Zorlama:** `tests/setup/msw.ts` asserted by a meta-test that deliberately fetches `https://example.invalid` and expects a rejection; CI job env has no provider API keys at all except in the nightly live job.

#### `one-adapter-contract-suite` · BLOCKING

Every provider adapter must be exercised by the single shared suite `tests/contract/adapter-contract.ts` covering: happy path, 429 with Retry-After, 5xx retry-then-succeed, malformed JSON body, timeout, and cancellation — registering a new descriptor without registering its adapter in that suite fails CI.

- **Neden:** Adapter-specific bespoke tests drift; the failure modes that actually cost money and hang the run queue (rate limits, partial bodies, hung sockets) are the ones nobody writes by hand.
- **Zorlama:** A parametrized `describe.each` fed by `registry/providers/*.yaml`; a set-difference assertion between descriptor ids and registered adapters.

#### `cassettes-are-committed-json` · BLOCKING

Cassettes live in `tests/contract/cassettes/<provider>/<endpoint>/<case>.json`, are committed to git, and store `{recordedAt, providerId, descriptorVersion, endpoint, request:{method,url,bodyHash}, response:{status,headers,body}}` — nothing else.

- **Neden:** HAR blobs and opaque binary cassettes are unreviewable in a diff, so secret leaks and rot go unnoticed; a fixed narrow shape makes a PR diff readable.
- **Zorlama:** A schema test validating every file under `cassettes/**` against `schemas/cassette.schema.json`; a CI grep rejecting `.har` files in the repo.

#### `cassette-redaction-allowlist` · BLOCKING

The recorder must strip every request header except an allowlist (`content-type`, `accept`, `user-agent`) and replace any value matching a secret pattern with `__REDACTED__`; a secret scanner runs over `tests/**` on every commit.

- **Neden:** Authorization headers, `openai-organization`, signed upload URLs and presigned fal/S3 links end up in cassettes and then in a public git history.
- **Zorlama:** `gitleaks detect --no-git --redact` as a CI step scoped to `tests/`; a unit test on the redactor asserting a Bearer token and an `X-Api-Key` are removed; a pre-commit hook running the same scan.

#### `cassette-staleness-budget` · WARN

A cassette whose `recordedAt` is older than 90 days emits a WARN in CI; older than 180 days fails the contract lane until re-recorded or explicitly renewed with a dated note in the file.

- **Neden:** Cassettes rot silently: the provider changes a field name, the adapter keeps passing against a 2-year-old recording, and production breaks on the first real call.
- **Zorlama:** `tests/contract/staleness.test.ts` reading `recordedAt` and comparing against an injected clock; nightly job re-records in a scratch dir and posts the diff without committing.

#### `live-tests-nightly-and-capped` · BLOCKING

Tests that hit a real provider live only in `tests/live/**`, are excluded from the default and PR CI runs, and each declares a `maxCostMinorUnits` that the harness asserts before and after the call; the nightly job aborts on the first budget breach.

- **Neden:** 'Just one smoke test against the real API' on every push is how a solo repo discovers a 300 TL day; but never touching the real API is how cassettes rot undetected.
- **Zorlama:** Vitest project `live` with `include: ['tests/live/**']` and no CI trigger except the scheduled workflow; a wrapper `withBudget(maxCostMinorUnits, fn)` that every live test must use, checked by an ESLint custom rule or a grep for `test(` not preceded by `withBudget` in that dir.

#### `goldens-only-from-the-container` · BLOCKING

Reference screenshots and rasterized PDF pages may only be produced inside the pinned render container (pinned Playwright version, pinned base image digest); goldens generated on the maintainer's host OS must never be committed.

- **Neden:** Playwright's own docs warn that rendering varies with host OS, version, settings, hardware, power source and headless mode — a macOS-generated golden fails forever in Linux CI.
- **Zorlama:** `snapshotPathTemplate` includes `{platform}` and `{projectName}` and CI asserts every committed golden path contains `-linux`; a `git diff --name-only` check in the pre-push hook rejecting `*-darwin.png` / `*-win32.png` under `tests/golden/`.

#### `fonts-bundled-and-pinned` · BLOCKING

Every font used by any rendered surface must be a file committed under `assets/fonts/` (Git LFS if large) and referenced by a local `@font-face src: url()`; requests to `fonts.googleapis.com`, `fonts.gstatic.com`, `use.typekit.net` or any remote font host are forbidden in templates.

- **Neden:** A remote font makes rendering depend on network, CDN version and fallback timing — every golden becomes a coin flip, and an offline local command center silently renders in Times New Roman.
- **Zorlama:** CI grep over `templates/**` and `packages/render/**` for those hosts; a render-time Playwright `route` handler that aborts any font request whose URL is not `file://`; a golden test of a text-only page that fails loudly if the fallback face is used.

#### `wait-for-fonts-ready` · BLOCKING

The render engine must `await page.evaluate(() => document.fonts.ready)` and assert `document.fonts.status === 'loaded'` before any screenshot or `page.pdf()` call.

- **Neden:** Capturing during FOUT/FOIT produces a golden with fallback metrics; the next run captures the real face and the diff is 100% of the text area.
- **Zorlama:** A single choke point in `packages/render/src/capture.ts`; a CI grep asserting `page.screenshot(` and `page.pdf(` appear only in that file; a unit test that the capture function throws when fonts are not loaded.

#### `deterministic-capture-environment` · BLOCKING

Every capture must pin: viewport size, `deviceScaleFactor`, `animations: 'disabled'`, `caret: 'hide'`, `TZ=Europe/Istanbul`, `LANG=tr_TR.UTF-8`, `--force-color-profile=srgb`, `--font-render-hinting=none`, and `prefers-reduced-motion: reduce`.

- **Neden:** Timezone leaks into rendered dates, color profile shifts every pixel, and a half-finished CSS transition changes a shadow — each produces a full-page diff with no code change.
- **Zorlama:** A frozen `RenderContext` object in `packages/render/src/context.ts` that the capture choke point requires; a snapshot test of that object so any change to the environment is a reviewed diff.

#### `mask-volatile-regions` · BLOCKING

Any element rendering a timestamp, run id, price, or generated media must be passed to `toHaveScreenshot({ mask: [...] })` or rendered from a frozen fixture clock; unmasked volatile content in a golden is a bug in the test, not a tolerance problem.

- **Neden:** Raising the pixel threshold to absorb a changing date also hides real typography regressions — masking removes the noise instead of blinding the assertion.
- **Zorlama:** Code review checklist item; a golden test that renders the deck twice with clocks 24h apart and asserts zero diff.

#### `threshold-policy-ratio-not-count` · BLOCKING

Set `expect.toHaveScreenshot = { threshold: 0.2, maxDiffPixelRatio: 0.002 }` globally; per-test overrides must use `maxDiffPixelRatio` (never `maxDiffPixels`) and must carry a one-line comment stating why the looser value is justified.

- **Neden:** `maxDiffPixels` is size-dependent — 100 px is strict on a 1080×1080 IG still and meaningless on an A4 deck page; and an unexplained loosened threshold is how a real regression ships.
- **Zorlama:** `playwright.config.ts` `expect.toHaveScreenshot`; CI grep for `maxDiffPixels` under `tests/golden/**`; a grep requiring a `// threshold:` comment on the line above any `maxDiffPixelRatio` override.

#### `antialiasing-is-ignored-not-tolerated` · BLOCKING

Where a comparator is chosen explicitly (odiff or a custom Vitest comparator), anti-aliasing detection must be enabled (odiff `antialiasing: true`, pixelmatch default `includeAA: false`); never compensate for AA noise by raising the per-pixel `threshold` above 0.3.

- **Neden:** Sub-pixel text rendering differs by one or two shades along every glyph edge; ignoring AA pixels keeps the assertion sharp, while a high per-pixel threshold makes a whole colour change invisible.
- **Zorlama:** Comparator options are set in one config file and snapshot-tested; a deliberately colour-shifted fixture (`#1a1a1a` → `#2a2a2a` background) must still fail the golden suite — assert this as a meta-test.

#### `goldens-never-auto-updated-in-ci` · BLOCKING

`--update-snapshots` (and `vitest --update`) must never run in CI or in any agent-executed command; baselines are updated only by the human via `pnpm golden:update`, which regenerates in the container, writes a side-by-side contact sheet to `.derived/golden-review/`, and requires the commit message to contain `GOLDEN-UPDATE: <reason>`.

- **Neden:** Blind baseline updates are the single most common way visual regression suites become decoration; and per the agents-PROPOSE/human-APPLIES rule, accepting a new visual truth is an apply, not a proposal.
- **Zorlama:** CI grep for `--update-snapshots`/`-u`/`--update` in `.github/workflows/**` and in agent-invocable scripts; a `commit-msg` hook that rejects a commit touching `tests/golden/**/*.png` without the `GOLDEN-UPDATE:` line.

#### `pdf-rasterize-never-byte-compare` · BLOCKING

Deck and document PDFs must be asserted by rasterizing each page (`pdftoppm -r 150 -png`) and image-diffing the pages, plus a text-layer assertion via extraction; comparing PDF bytes or hashing the PDF file is forbidden.

- **Neden:** Chromium-produced PDFs embed creation metadata and object ids, so byte comparison fails on every run while genuinely broken kerning passes.
- **Zorlama:** CI grep banning `toMatchSnapshot` / `createHash` applied to a `.pdf` buffer under `tests/golden/**`; the PDF golden helper is the only sanctioned path.

#### `pdf-print-media-pinned` · BLOCKING

PDF rendering must call `page.emulateMedia({ media: 'screen' })` and the template must set `-webkit-print-color-adjust: exact` (and `print-color-adjust: exact`) on the root element before `page.pdf()`.

- **Neden:** `page.pdf()` renders with print CSS media and modifies colours for printing by default — a dark-brand deck silently exports washed out or white, and the golden then locks in the wrong output.
- **Zorlama:** Assert both in `packages/render/src/pdf.ts` (single choke point) and add a golden of a saturated brand-colour page that fails if colour adjustment is on.

#### `video-asserted-on-manifest-not-frames` · BLOCKING

Motion output is never diffed as a whole video; assert the ffprobe manifest (duration ±1 frame, fps, width/height, pixel format, stream count, audio presence) plus image-diffs of exactly three deterministically sampled frames (first, midpoint, last).

- **Neden:** Encoder version, rate control and container muxing change bytes for identical visual content; full-video diffs are permanently red while a broken title card goes unnoticed.
- **Zorlama:** `tests/golden/video/*.test.ts` using `ffprobe -print_format json -show_streams`; a CI grep banning any golden comparison whose baseline extension is `.mp4`/`.webm`.

#### `safe-zone-is-a-geometry-assertion` · BLOCKING

Platform safe zones (IG story/reel/feed, LinkedIn) are asserted as numeric geometry from the DOM bounding boxes against the channel descriptor's declared safe-zone rectangle, not by looking at a screenshot.

- **Neden:** A pixel diff cannot tell you the CTA moved 8 px under the Instagram UI overlay; a geometry assertion can, and it survives a legitimate colour change.
- **Zorlama:** `tests/golden/safe-zone.test.ts` reading `registry/channels/*.yaml` and asserting every element tagged `data-cs-critical` is inside the rect; adding a channel without safe-zone numbers fails schema validation.

#### `deterministic-assertions-before-judges` · BLOCKING

Every prompt template in the registry must have a promptfoo suite asserting, at minimum: `is-json` with a JSON Schema (or the declared output schema), a `javascript` char-cap check against the channel descriptor's limit, `not-contains-any` over the banned-term list, a diacritic-integrity `javascript` assertion, and a `claim_source` presence assertion — before any model-graded assertion is added.

- **Neden:** These five catch the failures that actually reach a customer (unparseable output, truncated caption, forbidden claim, mangled Turkish, unsourced assertion) and they cost nothing to run.
- **Zorlama:** A test that globs `registry/prompts/*.yaml`, requires a matching `evals/<id>.yaml`, and parses it to assert those five assertion types are present; run `promptfoo eval -c evals/ --no-cache` in the nightly job.

#### `judges-never-gate-ci` · BLOCKING

`llm-rubric`, `g-eval`, `factuality`, `select-best` and `similar` results are recorded as metrics and may open a human review item, but must never fail a CI job or block a merge.

- **Neden:** LLM-as-judge is known to be position-biased, verbosity-biased, self-preferring and non-deterministic across grader versions; a red build caused by a judge's mood trains you to ignore the build.
- **Zorlama:** The eval runner exits 0 on judge failures and non-zero only on deterministic-assertion failures; CI parses `promptfoo` JSON output and asserts no model-graded `metric` appears in the blocking set.

#### `judge-config-is-turkish-and-recorded` · BLOCKING

Any model-graded assertion on Turkish content must set `defaultTest.options.rubricPrompt` to a Turkish rubric, and the eval artifact must record grader provider id, model id, temperature and the rubric hash.

- **Neden:** Graders default to English rubrics and English reasoning, which systematically mis-scores Turkish register and idiom; and an unrecorded grader version makes yesterday's score incomparable to today's.
- **Zorlama:** Schema check on `evals/*.yaml` requiring `rubricPrompt` whenever a model-graded assert is present; the runner writes `evals/.derived/<run>.json` containing the grader block, asserted by a test.

#### `judge-position-bias-controls` · WARN

Any comparative evaluation (variant A vs B) must run each pair in both orders and take the agreement rate; a variant only 'wins' if it wins in both orderings across at least three samples.

- **Neden:** Order effects alone can flip an LLM judge's preference, so a single-order comparison is a coin flip dressed as a measurement.
- **Zorlama:** A helper `comparePairs()` in the eval harness that emits both orderings; a test asserting the harness produces `2 * n` cases for `n` pairs.

#### `mock-at-the-verb-boundary` · BLOCKING

Pipeline and agentic tests must stub the eight kernel verbs, never HTTP and never a provider adapter; a file under `tests/agentic/**` that imports from `packages/providers/**` or sets up an msw handler fails CI.

- **Neden:** Testing a DAG through the HTTP layer couples the pipeline test to provider payload shapes, makes it slow, and means a provider change breaks tests that have nothing to do with providers.
- **Zorlama:** `eslint no-restricted-imports` override for `tests/agentic/**`; a `createVerbDouble()` fixture that is the only sanctioned way to construct a pipeline runner in that lane.

#### `dag-structural-tests-per-pipeline` · BLOCKING

For every pipeline YAML, assert: the graph is acyclic, a topological order exists, every step input is produced by an upstream step or declared as a run input, every requested capability resolves to at least one enabled provider, and no step references a model id.

- **Neden:** Ring 1 is user-edited at runtime; a typo'd capability or a cycle must fail at validate time (free) rather than mid-run after three paid steps.
- **Zorlama:** `tests/agentic/pipelines.test.ts` globbing `registry/pipelines/*.yaml`; a schema rule + CI grep rejecting known model-id patterns (`/gpt-|claude-|gemini-|flux|sd3|veo/i`) anywhere in `registry/pipelines/**`.

#### `human-gate-state-machine-test` · BLOCKING

The proposal state machine must be tested exhaustively over all states and transitions, asserting there is no path from `draft` to `applied` that does not pass through a human `approve` event, and that no code reachable from an agent step invokes `git commit`.

- **Neden:** 'Agents PROPOSE, humans APPLY' is the safety property of the whole system; an accidental auto-apply in a retry path publishes unreviewed Turkish marketing copy under the company name.
- **Zorlama:** Exhaustive transition table test; CI grep for `git commit`/`simple-git`/`isomorphic-git` write APIs outside `packages/cli/src/apply/**`.

#### `run-manifest-is-golden-tested` · BLOCKING

Every run must emit `run.json` containing pipeline id+hash, prompt template hashes, resolved provider ids, capability requests, sampling params, seeds, cost estimate, actual cost, and per-step status; it is golden-tested with volatile fields (timestamps, run id, durations) replaced by placeholders.

- **Neden:** The manifest is the only auditable artifact of a non-deterministic run; if its shape drifts, cost reconciliation, reproducibility badges and the analytics view all silently degrade.
- **Zorlama:** `toMatchFileSnapshot` against `tests/agentic/__snapshots__/run-manifest.json` after a normalizer pass; a schema in `schemas/run-manifest.schema.json` validated at write time.

#### `sampling-params-must-be-explicit` · BLOCKING

No LLM call may be issued without explicit `temperature` (and `top_p` if used) sourced from the recipe or pipeline step; a missing value is a validation error, not a provider default.

- **Neden:** Provider defaults change (Anthropic's Messages API defaults temperature to 1.0) and an implicit default makes yesterday's output impossible to explain, let alone reproduce.
- **Zorlama:** Zod/Ajv schema on the step request requiring the field; a unit test that the adapter throws on an undefined temperature; CI grep banning `temperature ??` and `temperature ||` fallbacks in `packages/providers/**`.

#### `seed-only-when-declared` · BLOCKING

A seed is sent only when the provider descriptor declares `supports_seed: true`; the kernel must never invent a seed for a provider that does not accept one, and the descriptor must declare `reproducibility: none | best_effort | deterministic`.

- **Neden:** Anthropic's Messages API has no `seed` parameter at all; OpenAI documents `seed` as best-effort with `system_fingerprint` as the change indicator. Pretending otherwise produces a UI that lies about reproducibility.
- **Zorlama:** Descriptor schema requires both keys; a test asserting every descriptor with `modality: image|video|audio` declares `reproducibility` other than `deterministic`; a test asserting no adapter sends `seed` unless the descriptor allows it.

#### `prompt-template-hashing` · BLOCKING

Every prompt template is hashed (SHA-256 over the NFC-normalized template text plus the sorted variable-name list); the hash is written into the manifest, and changing a template without bumping its `version` field fails CI.

- **Neden:** Without a template hash you cannot tell whether last week's better output came from a better model or from an edit nobody logged — every eval comparison becomes uninterpretable.
- **Zorlama:** `tests/unit/prompts/hash-lock.test.ts` comparing computed hashes against a committed `prompts.lock.json`; the lock file is regenerated only by `pnpm prompts:bump`, which requires a version increment.

#### `ui-must-show-reproducibility-badge` · BLOCKING

Any surface that displays a generated artifact must render the provider's declared `reproducibility` value as a visible badge, and for `none` must show 'Bu çıktı yeniden üretilemez' with the run id; a rerun button on a non-reproducible artifact must be labelled as producing a new variant, not the same one.

- **Neden:** Most media endpoints cannot be reproduced from the same inputs; a UI that offers 'rerun' implying identical output makes the user distrust the whole system the first time it differs.
- **Zorlama:** A React component test asserting the badge renders for each of the three values; a lint rule / test that the artifact card component cannot be rendered without a `reproducibility` prop (required, non-optional TS type).

#### `no-real-personal-data-in-fixtures` · BLOCKING

No real prospect, customer, employee or partner data may appear in any fixture, cassette, eval case, screenshot or corpus test file; all such data must come from `tests/fixtures/synthetic/**` and use reserved/synthetic identifiers (`@example.com`, `+90 555 000 00 00`, invalid-checksum TCKN).

- **Neden:** KVKK — processing real personal data in a test corpus that is committed to git and replayed by agents has no lawful basis and no retention story, and a committed golden screenshot of a real prospect's name is a permanent disclosure.
- **Zorlama:** CI scanner over `tests/**` and `assets/**` for: e-mail domains not in the allowlist, Turkish mobile patterns outside the reserved 555 000 range, 11-digit TCKN-shaped strings with a valid checksum, and IBAN patterns; failure blocks the build. Pair with `gitleaks`.

#### `synthetic-brand-and-prospect-fixtures` · CONVENTION

The repo ships exactly one synthetic brand and one synthetic prospect fixture set (`tests/fixtures/synthetic/brand-*/`, `prospect-*/`), each a full valid corpus record set with Turkish content including all six Turkish-specific characters and at least one long compound word.

- **Neden:** Ad-hoc per-test fixtures drift and never exercise Turkish edge cases; one canonical set means a schema change is fixed in one place and typography goldens actually stress the script.
- **Zorlama:** A test asserting the fixture corpus validates against every current schema; a grep rejecting inline record literals longer than 5 lines in test files outside the fixtures directory.

#### `corpus-fixture-drives-index-tests` · BLOCKING

SQLite/FTS5 tests must build the index from the synthetic corpus fixture inside the test, in a temp directory, and must never read or write `.derived/`; the derived directory stays gitignored and is never a test input.

- **Neden:** Ring 3 is defined as rebuildable; a test that depends on a pre-existing derived index passes on the maintainer's machine and fails on a fresh clone, which is exactly the failure a solo repo cannot afford.
- **Zorlama:** `eslint no-restricted-syntax` / CI grep for the literal `.derived` in `tests/**`; a CI job that runs the suite after `rm -rf .derived`.

#### `coverage-scoped-to-kernel-and-validators` · BLOCKING

Coverage thresholds are configured only via `coverage.thresholds` glob patterns for `packages/kernel/src/**` and `packages/registry/src/validate/**` (lines 90, functions 90, branches 80, statements 90); no global threshold key may be set.

- **Neden:** A repo-wide percentage in a project dominated by render glue, adapters and UI shells rewards writing tests for trivial code and says nothing about whether a deck renders correctly.
- **Zorlama:** `vitest.config.ts` using `coverage.thresholds['packages/kernel/src/**']`; a test that reads the config and fails if top-level `thresholds.lines/functions/branches/statements` or `thresholds['100']` are set.

#### `coverage-ratchet-not-autoupdate` · BLOCKING

`coverage.thresholds.autoUpdate` must be `false`; thresholds are raised by hand in a dedicated commit and may never be lowered without a written reason in the commit body.

- **Neden:** `autoUpdate: true` rewrites the config on every run, so a coverage drop caused by deleted tests is committed as the new normal without anyone noticing.
- **Zorlama:** Config assertion test; a `commit-msg` hook requiring `COVERAGE-LOWER: <reason>` on any commit that decreases a threshold number in `vitest.config.ts`.

#### `every-paid-verb-is-dry-runnable` · BLOCKING

Every kernel verb that can spend money must export `plan(input): Promise<Plan>` alongside `run(input)`; `plan()` must resolve providers, compute a cost estimate and return the request it *would* send, while performing zero network I/O.

- **Neden:** This is the only 'test' that meaningfully covers an expensive non-deterministic operation before it is paid for, and it is what makes the cost-before-run UI honest.
- **Zorlama:** `tests/unit/verbs/plan-exists.test.ts` enumerating the eight verbs and asserting a `plan` export whose invocation triggers zero msw handlers (`onUnhandledRequest: 'error'` plus a handler-call counter asserted to be 0).

#### `plan-command-is-the-preflight-gate` · BLOCKING

`cs plan <pipeline>` must, in order: validate all referenced registry and corpus records against schema, resolve every capability to a concrete provider, compute a total cost estimate per lane (free and premium), assert the estimate against the configured budget cap, and exit non-zero with a distinct exit code per failure class (10 schema, 11 resolution, 12 budget).

- **Neden:** Expensive operations cannot be unit-tested for correctness of output, so the pre-flight must be the thing that is tested — and distinct exit codes let the UI and the agent harness react without parsing prose.
- **Zorlama:** `tests/agentic/plan-cli.test.ts` asserting each exit code against a purpose-built broken fixture; the run command must call the same `plan()` internally and refuse to proceed if it fails.

#### `run-refuses-without-fresh-plan` · BLOCKING

A paid run must carry the hash of the plan it was approved from; if the registry, corpus or prompt hashes changed since the plan was produced, the run aborts and asks for re-planning.

- **Neden:** Approving a 40 TL estimate and then running against an edited pipeline is how the estimate and the invoice diverge; the hash makes the approval bind to a specific artifact.
- **Zorlama:** Manifest schema requires `planHash`; an agentic test that mutates a pipeline YAML between plan and run and asserts the run aborts with exit code 13.

#### `estimate-vs-actual-drift-check` · WARN

Every completed run records estimated and actual cost; a nightly check fails if the median absolute drift over the last 20 runs of any provider exceeds 20%.

- **Neden:** A cost formula that is wrong by 3x is invisible per-run but destroys budget caps and the free/premium lane decision; only reconciliation against reality catches it.
- **Zorlama:** `tests/live/cost-drift.test.ts` reading the run manifests in the derived index; failing check opens a task rather than blocking commits.



### Kalemler (22)

| Ad | Tür | Ne | Erişim | Maliyet | Karar |
|---|---|---|---|---|---|
| Vitest |  | Test runner for unit, contract, agentic and (via browser mode) visual lanes; `test.projects` gives one config with five isolated lanes. |  |  | ADOPT — latest release v4.1.10 (2026-07-06), repo pushed 2026-08-14; native Vite/TS, no extra transform layer. |
| @vitest/coverage-v8 |  | Coverage provider package. |  |  | ADOPT — default provider, no instrumentation step, fast enough to run on every commit. |
| Playwright Test (`toHaveScreenshot`) |  | Golden-file / visual regression for Chromium-rendered stills and deck pages, plus the PDF pipeline via `page.pdf()`. |  |  | ADOPT — v1.62.1 (2026-07-30), Apache-2.0, 94.5k stars; it is already the rendering engine, so no second browser stack. |
| Playwright `page.pdf()` |  | Deck/document PDF generation, Chromium-only. |  |  | ADOPT — already the decided engine; but never byte-compare its output. |
| Vitest browser mode `toMatchScreenshot` |  | Visual regression for the SPA shell components (dark dense chrome, run queue, cost panel) without leaving Vitest. |  |  | TRIAL — genuinely useful for React component goldens; keep Playwright Test as the authority for full render surfaces. |
| pixelmatch |  | The pixel diff engine underneath Playwright and Vitest's default comparator. |  |  | ADOPT (transitively) — v7.2.0 (2026-04-29), ISC, 6.9k stars, actively maintained. |
| odiff |  | SIMD-first native image diff with a Node API; much faster than pixelmatch on large deck pages. |  |  | TRIAL — v4.5.0 (2026-07-23), MIT, 3.1k stars, active. Adopt only if golden runtime becomes a bottleneck. |
| jest-image-snapshot |  | Jest matcher for image comparison. |  |  | AVOID — Jest-bound; this repo is Vitest. v6.5.2 (2026-03-09), Apache-2.0, still maintained (pushed 2026-08-05), so it is a fine tool in the wrong stack. |
| reg-suit |  | Visual regression workflow tool: keygen (git hash) + publisher (S3/GCS) + notifier (GitHub/GitLab/Slack) with an HTML report. |  |  | HOLD — v0.14.6 (2026-03-16), MIT, 1.3k stars, still pushed (2026-08-11), but it assumes an S3/GCS bucket and a PR-centric team flow. Overkill for 6 people with a local command center. |
| MSW (Mock Service Worker) |  | The single HTTP interception layer for contract tests and for the SPA's dev/test mode. |  |  | ADOPT — v2.15.0 (2026-07-08), MIT, 18.1k stars, pushed 2026-07-24. One library covers Node (Hono/kernel) and browser (SPA), which nock cannot. |
| nock |  | Node-only HTTP interception with `nock.back` cassette recording. |  |  | HOLD — v14.0.17 (2026-07-30), MIT, 13.1k stars, healthy. Rejected only because msw covers Node *and* browser; do not run both. |
| Polly.JS |  | Record/replay/stub HTTP as HAR files with pluggable adapters and persisters. |  |  | AVOID — last push 2025-05-31, **no GitHub releases at all**, Apache-2.0, 10.3k stars. Effectively dormant; do not take a maintenance dependency on it in 2026. |
| Playwright route interception (`page.route`) |  | Network mocking inside the browser for SPA end-to-end tests and for hard-blocking font/CDN egress during renders. |  |  | TRIAL — use for two narrow jobs only: SPA e2e mocks, and an `abort()` guard on any non-`file://` font/asset request during golden renders. |
| promptfoo |  | LLM eval harness: config-driven test cases with deterministic and model-graded assertions, plus a local web viewer. |  |  | ADOPT (for the eval lane only) — 0.122.0 (2026-08-04), MIT, 24.2k stars, pushed 2026-08-14. Note the governance change: the docs banner states 'Promptfoo is part of OpenAI.' |
| HyperFrames |  | HTML-authored motion video renderer: headless Chrome frame capture + FFmpeg encode. |  |  | ADOPT — Apache-2.0, 40.9k stars, pushed 2026-08-14 (canonical repo is `heygen-com/hyperframes`, not the 1-star `hyperframes/hyperframes` mirror). Matches the one-engine decision. |
| poppler-utils (`pdftoppm`, `pdftotext`) |  | Rasterize deck PDFs page-by-page to PNG for image diffing, and extract the text layer for content assertions. |  |  | ADOPT — the standard way to make a PDF golden-testable; pin the version in the render container. |
| ffprobe (FFmpeg) |  | Reads container/stream metadata for the video manifest assertions. |  |  | ADOPT — already a HyperFrames dependency; `ffprobe -v error -print_format json -show_streams -show_format` is your video contract test. |
| gitleaks |  | Secret scanner run over `tests/**` (cassettes, fixtures) on every commit and in CI. |  |  | ADOPT — the redaction rule needs an independent verifier; a redactor with a bug is worse than no redactor because it creates false confidence. |
| @faker-js/faker |  | Generates synthetic brand/prospect fixture data with a `tr` locale. |  |  | TRIAL — useful for bulk synthetic corpora, but seed it and commit the *output*, not the generator call. |
| Ajv (JSON Schema) + Zod |  | Ajv validates user-edited Ring 1 YAML and Ring 2 frontmatter against published JSON Schemas; Zod types the kernel's internal boundaries. |  |  | ADOPT — Ajv for user-facing validation (its `instancePath` gives the exact YAML location for an error message), Zod for in-process contracts. |
| Git LFS |  | Storage for golden PNGs, bundled fonts and reference video frames. |  |  | TRIAL — Vitest's visual-regression docs explicitly recommend it for large baseline suites. Defer until the repo exceeds ~200 MB of binaries; adding it early adds clone friction for a 6-person shop. |
| undici `MockAgent` |  | Node's built-in fetch stack has its own mocking agent. |  |  | HOLD — a valid zero-extra-dependency fallback if msw ever conflicts with the Node 22 fetch internals, but do not run it alongside msw. |

<details><summary>Notlar</summary>

**Vitest** — Verified config keys: `coverage.provider` (default `'v8'`), `coverage.enabled` (default false), `coverage.include` (default: files imported during the run), `coverage.exclude` (default `[]`), `coverage.reportOnFailure`, `coverage.skipFull`, `coverage.thresholds.{lines,functions,branches,statements,perFile,autoUpdate,100}` and `coverage.thresholds['<glob>']` (+ `['<glob>'].100`). Negative threshold values mean 'max uncovered items allowed' — useful for a ratchet. Since v3.2 the v8 provider uses AST-aware remapping, so v8 accuracy now matches Istanbul; keep `provider: 'v8'`.

**@vitest/coverage-v8** — Install explicitly (`pnpm add -D @vitest/coverage-v8`); Vitest otherwise prompts interactively, which breaks non-interactive CI and agent runs.

**Playwright Test (`toHaveScreenshot`)** — Verified: uses pixelmatch internally. Options `maxDiffPixels`, `maxDiffPixelRatio` (both *unset by default*), `threshold` (default 0.2), `animations` (default `'disabled'`), `caret` (default `'hide'`), `scale` (default `'css'`), `mask` + `maskColor` (default `#FF00FF`), `omitBackground`, `pathTemplate`. Snapshot names embed browser+platform (`example-test-1-chromium-darwin.png`); customize with `testConfig.snapshotPathTemplate` tokens `{arg} {ext} {platform} {projectName} {snapshotDir} {testDir} {testFileDir} {testFileBaseName} {testFileName} {testFilePath} {testName}`. `--update-snapshots` accepts `all|changed|missing|none` (no flag ⇒ `missing`; bare flag ⇒ `changed`); `--update-source-method` accepts `patch` (default) `|3way|overwrite`. Also useful: `--only-changed [ref]`, `--last-failed`, `--fail-on-flaky-tests`, `--forbid-only`. The docs explicitly warn rendering varies by host OS, version, settings, hardware, power source and headless mode.

**Playwright `page.pdf()`** — Verified caveats: renders with **print** CSS media unless you call `page.emulateMedia({media:'screen'})` first; 'By default, `page.pdf()` generates a pdf with modified colors for printing. Use the `-webkit-print-color-adjust` property to force rendering of exact colors.' `headerTemplate`/`footerTemplate` do not evaluate script tags and do not see page styles. Formats A4 8.27in×11.7in, Letter default; margins default 0.

**Vitest browser mode `toMatchScreenshot`** — Verified options: `comparatorName: 'pixelmatch'` with `comparatorOptions.threshold` (0–1) and `allowedMismatchedPixelRatio` / `allowedMismatchedPixels` (stricter of the two wins; Vitest sets **no default** mismatch allowance). Custom comparators registerable via `browser.expect.toMatchScreenshot.comparators` + `ScreenshotComparatorRegistry`. Paths via `resolveScreenshotPath` / `resolveDiffPath`, default `${root}/${testFileDirectory}/${screenshotDirectory}/${testFileName}/${arg}-${browserName}-${platform}${ext}`. Docs recommend `await document.fonts.ready`, explicit `page.viewport(w,h)`, disabling animations, Git LFS for baselines, and containerized runs; updates via `vitest --update`. Diff legend: red = differing, yellow = anti-aliasing.

**pixelmatch** — Verified options: `threshold` (default 0.1 standalone; Playwright sets 0.2), `includeAA` (default false ⇒ AA pixels are ignored — this is what saves you from font AA flake), `alpha` 0.1, `aaColor` [255,255,0], `diffColor` [255,0,0], `diffColorAlt`, `diffMask`, `checkerboard` (default true), and `windowSize` — returns max differing pixels in any N×N sliding window instead of a total, which is a better signal for 'one region broke' than a global count.

**odiff** — Verified API `compare(basePath, comparePath, diffPath, options)`; options include `threshold` (0–1), `antialiasing` (true ⇒ AA pixels not counted), `ignoreRegions: [{x1,y1,x2,y2}]` (a code-level alternative to DOM masking), `failOnLayoutDiff`, `captureDiffLines`/`captureDiffCols` (gives a bounding rectangle of changes — excellent for review contact sheets), `diffColor`, `outputDiffMask`, `reduceRamUsage`. `ODiffServer` keeps a persistent process to avoid per-comparison spawn cost. Native binary = an extra platform-specific dependency; weigh against a solo maintainer's tolerance for install breakage.

**jest-image-snapshot** — Worth stealing its *concepts* even though you won't install it: it separates `customDiffConfig.threshold` (per-pixel sensitivity, default 0.01) from `failureThreshold` + `failureThresholdType: 'pixel'|'percent'` (whole-image budget) — exactly the two-level model you should replicate. Also `comparisonMethod: 'pixelmatch'|'ssim'` (ssim 'bezkrovny' default, `'fast'` for accuracy), `blur` (Gaussian radius 1–2 to kill scaling noise), `allowSizeMismatch`, `updatePassedSnapshot`, `onlyDiff`, `diffDirection`.

**reg-suit** — Revisit only if goldens outgrow git. Its `reg-keygen-git-hash-plugin` (walk the branch graph to decide *which commit* to compare against) is the right idea to reimplement cheaply; `core.ximgdiff` gives structural insert/move detection rather than naive pixel diff. For now: commit goldens (Git LFS if they get heavy) and generate a local contact sheet.

**MSW (Mock Service Worker)** — Verified: `setupServer()` with `listen()`, `close()`, `resetHandlers()`, `use()`, `restoreHandlers()`, `listHandlers()`, `boundary()`. **`onUnhandledRequest` accepts `'warn' | 'error' | 'bypass'` or a function, and defaults to `'warn'` — you must explicitly set `'error'`** or a test can silently hit a paid endpoint. Use `boundary()` for per-test handler isolation in parallel runs.

**nock** — Its `nockBack` mode model is the best-documented cassette lifecycle and worth copying into your hand-rolled recorder: `wild` (no replay, no record), `dryrun` (default: replay + allow live calls, no record), `record` (replay + record new), `update` (drop and re-record), `lockdown` (replay only, **all un-nocked HTTP disabled**). `lockdown` is the CI mode; `update` is the nightly re-record mode. Also `context.assertScopesFinished()` + `context.query()` to assert the *exact* set of calls a cassette contains — that is your anti-rot assertion.

**Polly.JS** — The HAR-as-cassette format is also a liability for your case: HAR entries carry full request headers by default (Authorization, api keys, signed URLs) and are near-unreviewable in a git diff. Prefer a narrow, hand-rolled JSON cassette schema you control and can redact.

**Playwright route interception (`page.route`)** — Not a replacement for msw at the Node/kernel boundary — pipelines call providers from Node, not from the page. Playwright also supports HAR record/replay (`routeFromHAR`) if you ever need browser-side cassettes.

**promptfoo** — Verified deterministic assertions you should actually use: `equals`, `contains`/`icontains`, `contains-all`/`contains-any` (+ `i` variants), `starts-with`, `regex`, `is-json` (optional JSON Schema), `contains-json`, `is-xml`/`contains-xml`, `is-html`/`contains-html`, `is-sql` (needs `node-sql-parser`), `levenshtein`, `word-count`, `cost`, `latency` (**requires `--no-cache`**), `finish-reason`, `is-refusal`, `javascript`, `python`, `webhook`, `is-valid-function-call`, `is-valid-openai-tools-call`, `tool-call-f1`, `trajectory:tool-used|tool-args-match|tool-sequence|step-count`, plus `guardrails`. Every base type supports a `not-` prefix. Model-graded: `llm-rubric`, `g-eval`, `factuality`, `model-graded-closedqa`, `answer-relevance`, `similar`, `classifier`, `moderation`, `select-best`, `max-score`, `pi`, `agent-rubric`, `search-rubric`, context-* and conversation-relevance. Structural features you need: `assert-set` (group assertions with `threshold`/`weight`), per-assertion `metric` for named aggregate metrics, `defaultTest` inheritance, and `defaultTest.options.rubricPrompt` for **non-English grading** — the docs explicitly document overriding the rubric prompt to grade and reason in another language, and note this works for `llm-rubric`, `g-eval` and `model-graded-closedqa` but **not** for `factuality`/`context-recall`, which need assertion-specific prompts.

**HyperFrames** — README claims 'deterministic, frame-by-frame rendered video, with the same input producing the same output each time' and 'Render locally or in Docker'. Treat that claim as **testable, not trusted**: your video golden lane should verify it (render twice, compare ffprobe manifest + three sampled frames). Determinism here is the *renderer's*; any AI-generated asset fed into it remains non-reproducible.

**poppler-utils (`pdftoppm`, `pdftotext`)** — `pdftoppm -r 150 -png deck.pdf out/page` then diff each `page-NN.png` with your normal comparator. Pair with `pdftotext -layout` to assert Turkish characters survived font subsetting — a PDF can look right and still have a broken text layer, which breaks copy-paste and search for the prospect reading it. Version-pin: a poppler upgrade changes rasterization and invalidates goldens, so treat it like a font bump.

**ffprobe (FFmpeg)** — Assert duration (±1 frame), `r_frame_rate`, `width`/`height`, `pix_fmt`, stream count and audio presence. Do not assert file size or bitrate — encoder builds change them without any visual difference.

**gitleaks** — Run as `gitleaks detect --no-git --redact --source tests/` in CI plus a pre-commit hook. Extend with a custom rule set for the KVKK patterns (TCKN-shaped strings with valid checksum, Turkish mobile numbers outside the reserved 555 000 range, IBAN `TR\d{24}`).

**@faker-js/faker** — Faker output changes between minor versions even with a fixed seed, so generating fixtures at test time reintroduces non-determinism. Use it once via a `pnpm fixtures:generate` script, review the Turkish output by hand (faker's `tr` locale data is uneven), commit the JSON/markdown, and never call faker inside a test.

**Ajv (JSON Schema) + Zod** — Ajv's `instancePath` is what makes the `validators-need-negative-fixtures` rule enforceable — assert the path, not just the boolean. Publish the schemas as files so the user's editor can autocomplete Ring 1 YAML; a schema that only exists as a Zod object cannot help the human editing YAML at runtime.

**Git LFS** — If adopted, LFS-track `tests/golden/**/*.png` and `assets/fonts/**` but *not* cassettes — cassettes must stay plain-text-diffable so redaction failures are visible in review.

**undici `MockAgent`** — Only intercepts undici/global `fetch`, not `node:http` clients or browser traffic, so it cannot be the single interception layer for both the Hono API tests and the SPA tests.

</details>


### Doğrulanmamış

- **fal.ai `seed` parameter and queue semantics** — docs.fal.ai returned HTTP 429 / a Vercel security checkpoint on every fetch attempt this session, and fal.ai model pages are SPA-rendered. I could not verify from a primary source whether fal's FLUX/video endpoints accept `seed`, whether the same seed reproduces output, or the exact queue response shape (`request_id`, status polling). Treat 'media providers expose seeds' as a per-descriptor question to verify by hand before writing `supports_seed: true`.
- **Current OpenAI `seed` / `system_fingerprint` documentation status** — platform.openai.com returned HTTP 403 to WebFetch. My verification comes from the OpenAI Cookbook notebook 'How to make your completions outputs reproducible with the new seed parameter', which states seed makes a 'best effort to sample deterministically', that 'determinism is not guaranteed', and that `system_fingerprint` indicates backend changes — but that notebook dates from the gpt-4-1106/gpt-3.5-turbo-1106 era and describes the feature as beta. Whether `seed` is supported on current models, and whether the Responses API exposes it at all, is UNVERIFIED. Confirm against platform.openai.com before relying on it.
- **Anthropic determinism wording is verified, absence of seed is verified as of this fetch** — platform.claude.com/docs/en/api/messages lists body params `max_tokens, messages, model, cache_control, container, inference_geo, metadata, output_config, service_tier, stop_sequences, stream, system, temperature, thinking, tool_choice, tools, top_k, top_p` with **no `seed`**, and states 'even with `temperature` of `0.0`, the results will not be fully deterministic'. What I did NOT verify is whether any Bedrock/Vertex-hosted Claude surface exposes a seed.
- **Whether odiff is a built-in Vitest comparator.** The Vitest docs I read name only `comparatorName: 'pixelmatch'` and document registering custom comparators via `browser.expect.toMatchScreenshot.comparators` + `ScreenshotComparatorRegistry`. I did not find a primary source confirming a bundled `'odiff'` comparator; assume you must register it yourself.
- **Playwright's `snapshotPathTemplate` default value.** The token list is verified from the TestConfig API page, but the docs excerpt I retrieved did not state the literal default template string. Verify before writing a rule that depends on the exact default.
- **PDF non-determinism specifics.** That Chromium/Skia PDF output embeds a volatile `/CreationDate` and trailer `/ID` is well-established behaviour but I did not verify it from a primary Chromium/Skia source this session. The rule (rasterize, never byte-compare) is correct regardless — verify locally by rendering the same deck twice and running `cmp`.
- **Playwright Docker image and font consistency.** playwright.dev/docs/docker did not, in the content I fetched, contain any statement about screenshot or font consistency. The 'run in a container' advice is verified from Vitest's visual-regression docs (which link to Playwright's Docker page) and from Playwright's own snapshot warning about host OS/version/settings/hardware/power-source variation — but the specific image tag (`mcr.microsoft.com/playwright:v1.xx.x-noble`) is UNVERIFIED here; read it off the docs before pinning.
- **The specific Chromium flags I recommend** (`--force-color-profile=srgb`, `--font-render-hinting=none`) are widely used for render determinism but I did not verify them against current Chromium flag documentation this session. Verify they are still accepted by the Chromium build Playwright 1.62.x ships before baking them into the render context.
- **Instagram caption and LinkedIn post character limits.** I did not verify current values from Meta or LinkedIn primary documentation. Do not hardcode numbers — the rules above deliberately source char caps from the Ring 1 channel descriptor YAML, and a test asserts the descriptor value is enforced. Fill the descriptors from primary docs and date-stamp them.
- **Turkish locale casing behaviour** is specified by Unicode SpecialCasing/CLDR and implemented by V8's ICU; I state it from established specification knowledge rather than a fetch this session. It is trivially verifiable in a Node 22 REPL: `'i'.toLocaleUpperCase('tr')` → `İ`, `'I'.toLocaleLowerCase('tr')` → `ı`.
- **gitleaks current version and rule syntax** — I verified the tool exists and is the standard choice but did not fetch its repo this session for a current release number or the TOML custom-rule schema.
- **HyperFrames licence file contents.** The GitHub API reports `heygen-com/hyperframes` as Apache-2.0 (40,933 stars, pushed 2026-08-14), matching the brief. I read determinism claims from a README fetch of a differently-named repo path; re-read `heygen-com/hyperframes` README directly before quoting its determinism guarantee in your own docs.
- **Vitest `test.projects` exact key name.** Vitest 4 replaced `workspace` with projects configuration; I verified `--project unit` CLI usage and `/guide/projects` is referenced in the docs, but did not fetch the projects config page for the exact config key spelling. Check `/config/projects` before writing `vitest.config.ts`.


### Anti-desenler

- **Raising the pixel threshold to make a flaky golden green.** It always 'works', and it monotonically increases — six months later `maxDiffPixelRatio: 0.15` means a deck rendered in the wrong brand colour passes. Symptom: threshold values in git history that only ever go up, and no golden has failed in three months. Fix: masks and fixture clocks for volatile content, AA-ignoring comparators for text edges, and a *meta-test* that a deliberately colour-shifted fixture still fails.
- **Committing goldens generated on the maintainer's Linux desktop instead of the container.** Fonts resolve from the host fontconfig, so the golden bakes in whatever the local system had. Symptom: 'works on my machine, every screenshot fails in CI' — or worse, the reverse, where CI is the one that's wrong. Fix: `{platform}`/`{projectName}` in the snapshot path plus a pre-push hook rejecting non-container goldens.
- **Letting an agent run `--update-snapshots` (or `vitest --update`) as part of 'making tests pass'.** This is the single most likely way this architecture's safety property gets violated in practice: the agent is supposed to PROPOSE, and silently rewriting the visual ground truth is an APPLY. Symptom: a proposal branch whose diff contains changed PNGs nobody looked at. Fix: the flag is grep-banned from CI and from every agent-invocable script; baseline updates require the `GOLDEN-UPDATE:` commit trailer.
- **Byte-comparing or hashing PDFs.** Chromium PDF output embeds volatile metadata, so the hash differs every run; teams then delete the assertion entirely and lose all deck coverage. Symptom: a `.pdf.snap` that has been regenerated on every commit for weeks. Fix: rasterize per page with `pdftoppm` and diff images, plus a `pdftotext` assertion on the Turkish text layer.
- **Forgetting `page.emulateMedia({media:'screen'})` before `page.pdf()`.** The PDF renders with print CSS and print-adjusted colours, so the dark brand deck exports washed out — and the first golden locks that wrong output in as correct. Symptom: the on-screen preview and the exported deck look like different products. Fix: single choke point in `packages/render/src/pdf.ts` plus a saturated-colour golden.
- **Trusting `onUnhandledRequest`'s default.** It is `'warn'`, not `'error'`. A test that misses a handler quietly makes a real call. In a repo where every provider call costs money, the failure mode is a bill from a CI runner, discovered a month later. Symptom: unexplained provider usage on days nobody ran a pipeline. Fix: explicit `'error'`, no API keys in the PR CI environment at all, and a meta-test that fetching `https://example.invalid` rejects.
- **Cassette rot with no expiry.** The adapter keeps passing against a two-year-old recording while the provider renamed a field; the first real run in production fails. Symptom: contract tests are 100% green and the live nightly is red, and everyone assumes the nightly is flaky. Fix: `recordedAt` in every cassette, 90-day WARN / 180-day BLOCKING, and a nightly re-record that diffs without committing.
- **Secrets in cassettes.** HAR-style recordings capture Authorization headers, `openai-organization`, and presigned upload URLs; once committed they are in history forever, and a presigned URL is a live credential. Symptom: nobody has ever read a cassette diff. Fix: narrow committed JSON schema, header allowlist, `gitleaks` over `tests/`.
- **Gating CI on an LLM judge.** `llm-rubric` scores drift when the grader model version changes underneath you, are position-biased in pairwise comparisons, and favour verbose output. Symptom: a merge blocked on Tuesday by the same prompt that passed on Monday with no code change. Fix: judges write metrics and open review items; only deterministic assertions can fail a build.
- **Grading Turkish content with an English rubric.** The default rubric prompt reasons in English and systematically mis-scores Turkish register, formality (siz/sen) and idiom, so your eval rewards translationese. Symptom: high rubric scores on copy a Turkish reader finds stilted. Fix: `defaultTest.options.rubricPrompt` in Turkish — and note it works for `llm-rubric`/`g-eval`/`model-graded-closedqa` but not for `factuality` or `context-recall`.
- **Testing pipelines through HTTP mocks instead of at the verb boundary.** The agentic lane ends up coupled to provider payload shapes; a provider adds a field and twelve DAG tests break for reasons unrelated to the DAG. Symptom: `tests/agentic/**` contains msw handlers. Fix: stub the eight verbs; ban provider imports in that lane by ESLint override.
- **Case-folding Turkish with `toUpperCase()`.** `'i'.toUpperCase()` is `I`, not `İ`; `'I'.toLowerCase()` is `i`, not `ı`. A hashtag generator or a slug helper quietly ships misspelled Turkish to a public feed. Symptom: brand names rendered as `ISTANBUL` instead of `İSTANBUL` in a published post. Fix: mandatory `'tr'` locale, enforced by an AST lint rule, plus round-trip unit tests.
- **A repo-wide coverage percentage as the quality goal.** In a repo that is 40% render glue and UI shell, chasing 80% global coverage produces tests for prop-drilling components while the cost formula and router stay under-tested. Symptom: coverage is 82% and a cost formula bug still shipped. Fix: glob-scoped thresholds on kernel + validators only, `autoUpdate: false`, ratchet upward by hand.
- **`coverage.thresholds.autoUpdate: true`.** It rewrites the config after every run, so deleting tests lowers the bar and commits the new bar in the same change. Symptom: threshold numbers changing in commits whose message says nothing about coverage. Fix: keep it false; require a `COVERAGE-LOWER:` trailer to reduce a number.
- **A `plan()` that quietly makes a network call** — e.g. to fetch a live price list or to count tokens via the provider's API. The dry run stops being free and stops being offline-capable, which defeats the whole pre-flight gate. Symptom: `cs plan` fails without an API key or without internet. Fix: assert zero msw handler invocations during every verb's `plan()`.
- **A UI 'rerun' button on a non-reproducible artifact.** The user expects the same output, gets a different one, and concludes the seed/temperature controls are broken — or worse, that the system is lying about cost. Symptom: support questions of the form 'why did it change, I didn't touch anything'. Fix: descriptor-declared `reproducibility` badge, and label the action 'yeni varyant üret' where reproducibility is `none`.
- **Real prospect data in a 'quick' fixture.** Someone pastes an actual lead's name, company and e-mail into an eval case to debug a prompt, and it is committed. Under KVKK there is no lawful basis, no retention story, and a committed golden screenshot of that name is a permanent disclosure that git history makes hard to remove. Symptom: a fixture that reads suspiciously plausible. Fix: automated pattern scanner over `tests/**` and `assets/**` that blocks the build, not a policy document.
