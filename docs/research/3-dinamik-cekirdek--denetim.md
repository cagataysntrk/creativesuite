# Denetim

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Karar

Yes — achievable by one person, but only by inverting the build order: **the meta-model is the product; the Creative Suite is its first application.** Ship a kernel of ~10 fixed concepts and ~8 executable verbs, then express brand, strategy, pipelines, providers, channels and memory as data files the founder edits at runtime. Budget 6–8 weeks to a working core, not 6 months.

Four decisions carry the whole design.

**1. One corpus, not four stores.** The research proposed separate systems for memory cards, strategy entities, brand DNA and content records. Collapse them. Every fact, positioning statement, persona, proof asset, provider note and published asset is a record: `/corpus/<entity_type>/<slug>.md`, markdown + YAML frontmatter, one fixed 20-field envelope plus an open `attributes` object validated against a user-editable JSON Schema. Memory governance, brand governance and content governance become the same three screens. This is the single largest reduction in surface area available, and it is what makes solo maintenance realistic.

**2. Git is the era engine — no era directories.** Do not duplicate the corpus per era. An era is a git tag + a small immutable manifest + an `era_id` stamped on records at write time. Regeneration runs on a branch and rewrites the *same paths*, so `git diff main..regen/...` is a genuine line-level review instead of a wall of file additions. Rollback is one line in `brand/current`. Old assets resolve through `era_id → manifest → commit SHA → git show`. This is strictly better than the era-directory pattern the research proposed and costs zero new dependencies.

**3. Kernel code may never read `attributes`.** The envelope is the only contract. Type-specific fields reach code as `unknown`, narrowed by Ajv at the edges and rendered generically by rjsf. That one rule is what lets Upcytech become a different company without a rewrite — and it is grep-testable in CI.

**4. Agents propose; only the founder applies.** Agents write `status: draft` records and registry YAML on branches. Nothing enters retrieval or execution without a human approval that produces a git commit. Diff-review-then-commit is the entire safety story for self-modifying config, and it degrades gracefully when the model is wrong.

The genuine risks are not technical. They are (a) over-building the meta-model and never publishing a Turkish post, and (b) LLM nondeterminism turning every regeneration diff into unreviewable noise, which kills the review ritual and therefore the whole governance claim. Mitigate the first with a hard rule — no entity type beyond the seven strategy types until ten real assets ship — and the second with input-hash-gated idempotent skipping, which is mandatory infrastructure, not an optimisation.

Survives a month of neglect because nothing daemon-dependent holds truth: `git clone` + `cat` is the recovery path, and `suite verify` rebuilds every derived artefact from scratch.


### Riskler

- KERNEL LEAKAGE IS THE FAILURE THAT KILLS REQUIREMENT (d). The entire design rests on kernel code never reading `attributes`, but the pressure to write `record.attributes.headline_tr` in a renderer, then a validator, then the router, is constant and each instance looks harmless. Six months later the company cannot reposition because forty places assume a Turkish headline exists. Mitigation: a CI grep over kernel/src excluding kernel/src/render/, plus typed accessors returning `unknown` narrowed only by Ajv. This must be enforced from commit one, because retrofitting it is a rewrite.
- REGENERATION NOISE DESTROYS THE REVIEW RITUAL. LLM nondeterminism will re-word unchanged material on every run, producing a 900-op plan that the founder accepts wholesale — functionally identical to having no review at all, but with the false confidence of having reviewed. Input-hash-gated skipping plus pinned model/temperature/seed/prompt-hash is mandatory infrastructure, not an optimisation, and even then expect real effort in prompt stability and jd deny-lists for volatile fields. If the third re-run produces an unreviewable plan, the whole governance claim is theatre.
- THE PROJECTION COMPILER FAILS SILENTLY. The authoring-schema → strict-LLM projection is lossy in ways that produce no error: an allOf that fails to inline, a nested object missing additionalProperties:false, a schema quietly crossing the 5000-property or 10-level ceiling. The API rejects some loudly and degrades on others. Snapshot-test the projected schema for every entity type in CI and assert property count and nesting depth explicitly. Note also that generated TypeScript covers SHAPE ONLY — json-schema-to-typescript verifiably drops pattern, format, minimum/maximum, multipleOf, uniqueItems, dependencies — so any code trusting the types alone lets invalid data through, and a schema edited after the last build produces types that are quietly a lie.
- TURKISH LANGUAGE TRAPS AT THREE LEVELS. (1) A Node process under tr_TR maps 'I'→'ı' and 'i'→'İ' in toLowerCase(), silently corrupting ids and slugs — force toLowerCase('en-US') or better, validate ids against ^[a-z0-9-]+$ and never transform. (2) FTS5 has no Turkish stemmer; unicode61 strips diacritics helpfully but agglutinative morphology means 'ölçüm' will not match 'ölçümlerinizi' — hence the parallel trigram index and rank fusion, which is heavier and less precise than a real stemmer. (3) YAML 1.1 parses `no` as false; a language code or aspect ratio can silently change type. Pin the yaml package to the 1.2 core schema and quote every enum-ish scalar in generated files.
- PROMPT INJECTION VIA PROSPECT RESEARCH IS THE REAL SECURITY THREAT, NOT A DETERMINED ATTACKER. Personalising decks means the agent fetches prospect websites and profiles — precisely the case Anthropic's own skills documentation flags as highest-risk, because fetched content may carry instructions. A publish or spend verb reachable from a turn whose context contains freshly-fetched external text is a live exfiltration and overspend path. Structural mitigation: an `untrusted_input` context section that is clearly delimited and never presented as instructions, plus a hard rule that channel.publish and any paid verb cannot fire in such a turn without explicit human approval. Note Anthropic states `allowed_callers` is 'not a hard API-level block' and must not be relied on as a security boundary.
- COST FORMULAS ARE ARBITRARY EXPRESSIONS ON THE BUDGET-CRITICAL PATH. A wrong formula silently under-estimates and the budget gate waves through a run costing 10x. QuickJS with a 10ms deadline and no globals bounds the blast radius to a wrong number, but the number is what matters. Add post-run reconciliation that diffs estimated against actual cost per provider and flags drift over 20% in the doctor report. Also note quickjs-emscripten is pre-1.0 and unaudited by its own README, with expected breaking API changes.
- ERA LINEAGE IS UNRECOVERABLE IF NOT STAMPED AT GENERATION TIME. If era_id, definition_digest and the context manifest are not written onto every asset at the moment it is created, retrofitting them after a regeneration is impossible — the mapping is gone. This is the single highest-cost mistake available in the design and it costs nothing to prevent on day one. It is also the mistake most likely to be made, because in week one there is only one era and the field looks redundant.
- REGULATORY FACT DECAY POISONS GENERATED ASSETS FASTER THAN ANY OTHER INPUT. Every high-value fact in the sector research changed in eighteen months: CBAM twice, CSRD twice, TSRS thresholds doubled in January 2026, the AI Act's high-risk dates moved sixteen months. An asset asserting the old 31 May CBAM deadline or the old 500m TL TSRS threshold is not merely stale — it is actively reputation-damaging in front of a compliance-anxious buyer who will check. re_verify_by is a required field on regulation records and a source_invalidated regeneration trigger is not optional. Several Turkish figures in the research rest on secondary blogs (the 2026 VAP ceiling, e-belge thresholds, OSB counts) and must never enter a customer-facing asset without primary-source verification.
- AN IMMUTABLE PUBLISHED LEDGER IS A KVKK/GDPR LIABILITY. Permanently retaining every asset with prospect-personalised deck content and persona data makes ledger/published.jsonl a personal-data store. Design it so asset METADATA (era, hashes, timestamps, manifests) is immutable while prospect-identifying PAYLOADS are separable and deletable, or era attribution will collide head-on with an erasure request. Separately, any agentic product sending Turkish plant, HR or operator data to a US LLM provider is a cross-border transfer under the June 2024 KVKK regime and needs a declared basis.
- SCHEMA-EDITING POWER IS SCHEMA-BREAKING POWER, AND THE FOUNDER IS ALONE. Live authority to retype or delete a field means one careless edit can invalidate thousands of records with nobody to catch it in review. The dry-run-against-the-whole-corpus gate and the refuse-without-codemod rule are the only defences, and both must be unskippable — no --force flag on the schema editor, only on plan apply.
- TWO COMPONENTS HAVE NO UPSTREAM: the capability router and the projection compiler. Nobody else maintains them, no community will fix them, and both are subtle. Keep each under ~300 lines, table-driven, and covered by fixture tests that assert 'given these descriptors and this constraint set, this provider wins and these lost for these reasons'. If either grows past that, the system has stopped being maintainable by one person.
- VENDOR AND LICENCE DRIFT ON THE ATTRACTIVE SATELLITES. Directus's Open Innovation Grant is a commercial policy, not an irrevocable licence grant, and can be narrowed at any time; the MSCL forbids circumventing licence-key checks, so those checks are load-bearing code; the delayed GPL-3.0 grant lands four years after each release, so a version shipped today is not GPL until 2030. fal's per-endpoint OpenAPI URL is reachable but not confirmed as a documented public interface, and the provider importer is the highest-leverage component in the design. sqlite-vec warns 'pre-v1, expect breaking changes'. Sveltia, Velite and Front Matter CMS are near-solo projects. Mitigation is architectural, not contractual: file-based truth means every one of these is a replaceable surface over data already owned — never let one become a storage dependency.
- OVER-ENGINEERING IS THE MOST LIKELY WAY THIS PROJECT FAILS. A one-person company can spend three months building a strategy CMS and zero weeks talking to manufacturers. The full stack described here — resolver, signatures, 3-way merge, plan/apply, decision ledger, probe-set bake-off, claim registry, capability router — is a multi-week build with permanent maintenance. Hard rule: no entity type beyond the seven strategy types until ten real assets have shipped and one deal has closed. Add SignedSource, DTCG resolver modifiers and the decision ledger only when the first re-run actually hurts.
- MERGE CONFLICTS SCALE WITH AGENT CONCURRENCY, NOT WITH RECORD COUNT. One file per record makes conflicts near-zero for a founder editing sequentially, but agentic generation writing many records across parallel branches, or a full era regeneration touching thousands of files, reintroduces them at scale. Agents must write to per-run branches or worktrees, never to main; regeneration must be gated on git merge-file's conflict-count exit code; and records must stay small and single-purpose so any conflict is confined to one claim.
- JSON SCHEMA CANNOT EXPRESS REFERENTIAL INTEGRITY. It validates documents, not graphs, so a persona referencing a deleted vertical or a value theme pointing at a retired proof asset validates cleanly. As the ontology grows this gap widens and silently produces assets citing evidence that no longer exists. References are modelled as typed string IDs with x-ref-type and integrity is enforced by a corpus-wide linter in CI — never by the per-document validator.


### Açık sorular

- Does react-jsonschema-form actually support the JSON Schema 2020-12 keywords the authoring profile uses? Themes and the ajv8 validator are verified but draft coverage is not. The restricted profile is designed to sidestep this (no unevaluatedProperties, no $dynamicRef, no if/then/else), but it must be confirmed hands-on before the schema editor ships — build a spike rendering the value_theme type as a form in week one.
- Is Anthropic's structured-output subset identical to OpenAI's? The projection compiler is written against OpenAI's verified constraints because they are stricter and therefore safer, but Anthropic's exact accepted subset was never independently confirmed and may differ in ways that make the projection over-restrictive (wasting expressiveness) or under-restrictive (silent failures). Verify against a real tool-use call per entity type in CI.
- Is fal's per-endpoint OpenAPI URL (fal.ai/api/openapi/queue/openapi.json?endpoint_id=...) a documented, supported public interface or an internal endpoint that happens to be reachable? The provider importer is the highest-leverage component in the extensibility design and it rests entirely on this. The docs page describing it returned 429 and was never read. A manual-descriptor fallback path is mandatory regardless.
- Is pointing Claude Code's autoMemoryDirectory at a git-tracked repo path a supported and tested configuration? The setting accepts any absolute or ~/ path from any scope, but committing auto memory to a repo is not described as a pattern anywhere. If it misbehaves — clobbering, worktree sharing, unexpected pruning — the fallback is CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 and relying solely on the governed corpus. Decide within the first week, because ungoverned agent knowledge accumulating outside the repo defeats requirement (c).
- Which is the command center: Vite+Hono (this design's pick, matching the founder's existing akis-main stack and better suited to long-running jobs, file watching and SSE) or Next.js (what most of the research assumed, with a larger ecosystem and better documented patterns)? This is reversible for about three weeks and irreversible after the run-audit and preview screens exist. Confirm the pick against the founder's actual preference before writing UI code.
- Should Upcytech be Vite-only, or does the public-facing site (which needs SEO, JSON-LD and llms.txt generated from the active era) warrant a separate static generator? The command center is private and local; the marketing site is public and must be crawlable. Two apps sharing one corpus is probably right, but that is a decision, not a default.
- Does Cognee let users supply their own ontology as custom types, or does it only generate one? This single fact decides whether Cognee ever serves requirement (a) or fights it — and therefore whether a graph layer is ever worth adding over the SQLite index. Only relevant after 2,000+ records; park it.
- What is the actual Turkish/EU legal exposure for unsubstantiated AI performance claims? The claim registry gate is designed against verified US FTC and SEC standards because they are the clearest articulation available, but Turkish consumer-protection and advertising-board rules, and the EU AI Act's marketing-claim implications, were never researched. Get local counsel to confirm before publishing any numeric performance claim in Turkish.
- Is the endorsed-brand model ('dima by Upcytech') the right call, and is dima a product or a module? The four-of-five test in the offer schema (distinct persona, distinct category, standalone budget line, survives parent pivot, self-serve motion) should be applied deliberately rather than assumed. Getting this wrong early means renaming later, which is a MAJOR kit_version change touching every asset.
- Which vertical is era 1? The evidence points to automotive supply in Bursa (TÜSİAD DAIMI 3.16, second-highest digital maturity in Turkey; IATF-disciplined; export-heavy; MAKTEK Avrasya runs there 28 Sept–3 Oct 2026), but that is an inference from third-party data, not from the founder's actual pipeline. The ICP and persona records must be seeded as hypotheses with confidence flags and overwritten after ten real sales conversations — which is precisely the runtime-extensible schema earning its keep on day one.
- What is the retention policy for run context snapshots? Storing the fully-resolved plan plus the verbatim injected context per run is what makes rerun reproducible and audit real, but at a few hundred KB per run it needs a policy from day one: keep manifests forever, keep context snapshots for N days, content-address large blobs so identical contexts store once. Pick N before the first hundred runs, not after.
- Does the DTCG Resolver Module 2025.10 have a working OSS implementation, or is that ~200 lines to write? Terrazzo's docs say resolver support is 'coming in 2.0' while its CLI is at 2.7.1 — an unresolved contradiction. The Format Module is safe (two major design systems verified using $deprecated in production); the Resolver is the bet. Test Terrazzo hands-on before committing, and be prepared to write the resolution logic. Note also that DTCG covers tokens only — roughly 80% of the brand DNA here is prose and strategy with no standard at all.
- When does the Directus satellite become justified? The trigger should be written down now rather than decided under pressure: high-volume tabular data (İSO 500 parsed company entities, prospect lists, ad-performance rows) becoming genuinely painful in markdown. If it is deployed, schedule a YAML export back into the repo so git stays the archive of record, and re-read the Open Innovation Grant terms annually.
- Are the KAP official REST API terms compatible with commercial use of derived content? The terms PDF is marked 'Hizmete Özel/Restricted' and could not be read: cost, rate limits, auth model and redistribution rights are entirely unknown. Trigger-event detection (capacity investments, sustainability filings) is a real differentiator for the sector-intelligence pipelines, but do not build on the community scrapers (pykap, kap-cli, kap-tr-sdk) without checking commit recency — a dead scraper is worse than no pipeline.


### Ekranlar

- CORPUS BROWSER (the single most important screen — build it first). Faceted table over every record in the system: facts, positioning, value themes, personas, ICPs, proof assets, competitors, offers, claims, assets, runs. Filters for era / type / status / zone / scope (channel, vertical, persona) / confidence / source kind / staleness / locale. Inline edit writes the markdown file and commits with a generated message. Bulk pin, bulk retire, bulk re-scope. Per-row chips: status (draft|active|pinned|retired|superseded), zone (generated|human|imported), staleness driven by re_verify_by, source kind, and a 'used in N assets' counter. Free-text search hits FTS5 unicode61 + trigram fused by reciprocal rank, with the matched terms and BM25 score shown — because explainability is the actual requirement, not recall.
- RECORD DETAIL. Claim, body, the verbatim source quote, a confidence slider, the approval trail, `git log --follow` on this file rendered as a timeline with one-click revert to any revision, the supersedes/superseded-by chain as a lineage graph, cross-references in and out (which personas cite this, which proofs support it), and the reverse index: every asset this record ever influenced. Two clicks from a bad post to the bad fact; fixing that fact immediately lists every other asset now suspect.
- SCHEMA EDITOR. Field-list editor over registry/entity-types/*.type.yaml, restricted to the documented JSON Schema profile — the editor physically cannot emit a banned keyword. Add field, change type, add enum value, mark x-retired, set x-index, set x-ref-type. On save it runs a DRY RUN against the entire existing corpus and reports the exact count and identity of records that would fail, refusing any destructive change unless a codemod exists at registry/migrations/<type>/NNNN-*.ts (with a one-click scaffold). On commit it regenerates TypeScript types, rebuilds the index and hot-reloads the registry over SSE. Live preview of the four projections side by side: the rjsf form, the generated TS interface, the strict LLM schema, and the SQLite DDL.
- CONTEXT PREVIEW (the screen that makes the founder trust the system). Preflight for every generation: a stacked token bar per recipe section against the model window, the full rendered prompt text, and a card list where each row shows claim / source / confidence / era / why-included (always-on, pinned by human, BM25 8.4, scoped to metal-forming) / exact token cost / an include toggle. Toggling recomputes the bar live and is recorded as a run-scoped override in the manifest. A 'diff vs last run' pane shows what the agent's knowledge changed since this asset type was last generated. Token numbers come from Anthropic's count_tokens with context_management set, so the preview is post-editing reality, not a guess.
- DISCOVERY / RECONCILIATION. The regeneration diff review: four columns — UNCHANGED / CHANGED / CONTRADICTED / NEW — over a git worktree branch. One claim per file means every row is a whole-object accept or reject, never a prose hunk. CONTRADICTED rows show old claim, new claim, both sources, both dates, both confidences, with three buttons: keep old / accept new (auto-writes supersedes + superseded_by) / keep both scoped differently. Rows previously rejected are pre-collapsed as 'you rejected this before' from brand/decisions.jsonl; pinned pointers do not appear at all. A skipped-sections panel explains what was NOT regenerated and why (input_hash_unchanged), which is how the founder learns to trust the plan size. 'Open in difftastic' is always available as the escape hatch.
- APPROVALS INBOX. Keyboard-driven queue (j/k next-prev, a approve, e edit-and-approve, r reject-with-reason, p pin) over every agent proposal: draft records, proposed registry YAML, imported provider descriptors, arbitration items from contradiction detection. Shows the originating run_id and the prompt that produced it. This must be fast, because a tedious approval queue gets rubber-stamped, and a rubber-stamped queue is functionally identical to letting the agent write directly.
- ERA TIMELINE. Horizontal band of eras (candidate | active | sunset | archived) with record counts, asset counts, cost and date ranges. Clicking an era switches the entire application into that era's point-in-time view — read-only for past eras, resolved through the era manifest's commit SHA. Shows the lineage map for each transition (retired claim ids, token names, message keys and their successors) and, on retire, the content-audit listing every still-live published asset from that era classified update | archive | leave-as-history. Candidate eras get a probe-set bake-off view: the same 5 Instagram posts, 3 LinkedIn posts and 1 deck rendered under each candidate, side by side.
- PIPELINE STUDIO. Registry view of pipelines, providers, channels and recipes as YAML with schema-driven autocomplete and inline validation errors that name the file, the JSON pointer, the expectation and one suggested fix. Per-pipeline: `validate` (schema → DAG → reference → provider-resolution gates), `plan` (Terraform-style dry run printing the DAG, chosen provider per step, estimated cost band in TRY, token budget and the exact context to be injected — spending nothing), and `run`. The provider importer lives here: paste a fal endpoint id or an OpenRouter model id, see the derived params, ranges, enums and defaults, annotate capability tags / quality tier / cost formula, commit.
- RUN AUDIT. Every generation with its full manifest: definition_digest, era_id, resolved plan, provider chosen per step AND every loser with its rejection reason, model ids, seeds, input/output tokens, actual vs estimated cost, wall time, the verbatim injected context, applied context-management edits, and the output artefact. Two distinct buttons — `rerun` (execute the frozen plan; reproduces the DECISION, not the artefact, and the UI says so explicitly) and `replay` (same inputs against today's definition; shows drift). Reverse index from any record to every asset it influenced. Spend dashboard by task class, era and month is a SQL query over this table, not a subsystem. Optionally mirrored to a self-hosted Langfuse.
- STRATEGY HEALTH. The lint dashboard: every ERROR and WARN rule from the strategy schema evaluated against the active era, as a single score with drill-down. Missing status-quo competitor, value themes without units, unsubstantiated claims, proof assets past expiry, cross-era proofs missing a generalisation note, ICPs with no disqualifiers, banned lexicon terms in live assets, regulation records past re_verify_by that live assets still cite. Plus the wrong-positioning signal panel: share of losses to status quo, sales cycle length, discount depth, whether prospects use the market category term unprompted. This is what makes requirement (c) visible rather than theoretical.
- DOCTOR. Output of the weekly scheduled job, and the first screen to open after ignoring the system for a month: provider metadata drift (re-pulled OpenAPI and pricing diffed against local descriptors), upstream models scheduled for retirement, records past re_verify_by, proof assets past expiry, estimated-vs-actual cost drift over 20%, index/corpus divergence, budget burn against models.yaml caps, and orphaned references. It reports; it never changes anything. `suite verify` (full index rebuild + validate every record) runs from here as one button.


### Çekirdek model

## The four rings

**Ring 0 — Kernel (TypeScript, developer-only, changes ~4×/year).** Fixed concepts: `Record`, `EntityType`, `Era`, `Pipeline`, `Provider`, `Channel`, `Recipe`, `Run`, `Decision`, `Verb`. Fixed verbs: `llm.generate`, `image.generate`, `video.generate`, `tts.generate`, `render.compose`, `channel.publish`, `human.approve`, `script.run`. Eight. Defend the cap — if a new creative job cannot be expressed as an arrangement of these plus data, that is the rare genuine signal a developer is needed.

**Ring 1 — Registry (YAML in git, founder edits at runtime).** Entity types, pipelines, providers, channels, context recipes, models/budgets, lexicons, migrations.

**Ring 2 — Corpus (markdown+frontmatter, one record per file).** All facts, strategy, personas, prospects, proof, assets, runs.

**Ring 3 — Derived (gitignored, rebuildable in seconds).** SQLite index, generated TypeScript, resolved brand kit, embeddings, 3-way-merge bases.

## The fixed record envelope

This is the entire contract kernel code may depend on. Everything else is `attributes`.

```yaml
---
id: 01JZ8K3M2QW9X7VN4TCPB0R5FE   # ULID, immutable, filename-independent
type: value_theme                # → registry/entity-types/value_theme.type.yaml
schema_version: 3
kind: dna                        # dna (regenerable, replaced in place) | ledger (append-only)
zone: generated                  # generated | human | imported
status: active                   # draft | active | pinned | retired | superseded
locale: tr                       # tr | en
era_id: 2026-manufacturing-ai
created_at: 2026-08-14T09:12:03Z
valid_at: 2026-01-01T00:00:00Z   # when the fact became true      (Graphiti)
invalid_at: null                 # when it stopped being true      (Graphiti)
expired_at: null                 # when WE invalidated it          (Graphiti)
re_verify_by: 2026-12-31         # decay date — regulatory facts REQUIRE this
supersedes: [01JY...]
superseded_by: null
confidence: 0.8
approved_by: cagatay
approved_at: 2026-08-14T09:30:00Z
source: {kind: interview, ref: sha256:ab3f..., quote: "..."}   # kind: interview|url|file|inference|import
scope: {channels: [], verticals: [metal-forming], personas: [uretim-direktoru]}
tags: [cbam, measurement]
context_weight: 1.0
x_signature: "<<SignedSource::a3f19c...>>"   # only when zone=generated
attributes:                      # ← 100% user-defined, validated by the type schema
  headline: "Ölçmediğiniz karbonu 2027'de faturalandıracaksınız"
  metric: {name: dogrulanabilir_emisyon_kapsami, unit: "%", baseline: 0, delta: 100}
---
Markdown body (prose-bearing types only).
```

**The inviolable rule:** kernel code reads the envelope; `attributes` reaches code as `unknown`. CI runs `grep -rn "attributes\.[a-z]" kernel/src --include=*.ts` outside `kernel/src/render/` — any hit fails the build. This is the mechanism that lets the company reposition entirely without touching code.

## Two record classes

- **`kind: dna`** — positioning, value themes, claims, personas, ICPs, tokens, messaging, lexicon. Stable path, `era_id` in frontmatter, regeneration replaces in place on a branch. History = git.
- **`kind: ledger`** — assets, runs, published records, decisions, era manifests, proposals, doctor reports. New file per item; never modified except lifecycle transitions (retire = set `expired_at` + `status: retired`; never delete).

## Directory sketch

```
upcytech-suite/
├─ .suite/                                # gitignored, rebuildable: `suite reindex`
│  ├─ index.db                            # SQLite: cards + FTS5 + runs + edges
│  ├─ types/*.d.ts                        # json-schema-to-typescript output
│  ├─ base/                               # pristine last-run generated files (merge base)
│  └─ resolved/brand/<era>/               # Style Dictionary output
├─ kernel/
│  ├─ src/registry/{loader,validator,watcher}.ts
│  ├─ src/projection/{form,typescript,llm,index}.ts   # THE compiler — 4 targets
│  ├─ src/corpus/{read,write,retire,propose}.ts       # single write chokepoint
│  ├─ src/router/{filter,price,score,fallback}.ts     # ~300 LOC, table-driven
│  ├─ src/context/{recipe,assemble,manifest}.ts
│  ├─ src/verbs/*.ts                                  # exactly 8
│  ├─ src/git/{worktree,plan,apply,ledger,merge}.ts
│  ├─ src/guard/{lexicon,claims,injection}.ts
│  └─ web/                                # Vite + React 18 + Tailwind + shadcn/ui
├─ registry/                              # RING 1 — the founder's territory
│  ├─ PROFILE.md                          # the allowed JSON Schema subset
│  ├─ entity-types/*.type.yaml
│  ├─ pipelines/*.pipeline.yaml
│  ├─ providers/*.provider.yaml
│  ├─ channels/*.channel.yaml
│  ├─ recipes/*.recipe.yaml
│  ├─ lexicon/{tr,en}.lexicon.yaml
│  ├─ models.yaml
│  └─ migrations/<type>/NNNN-description.ts
├─ brand/
│  ├─ POLICY.md                           # GOV.UK managing-change policy, adapted
│  ├─ current                             # one line: active era slug
│  ├─ eras/<slug>/era.yaml                # immutable manifest + commit SHA
│  ├─ lineage/<from>__<to>.map.json       # generated old→new key map
│  ├─ decisions.jsonl                     # sticky accept/reject ledger
│  └─ probes/*.probe.yaml                 # fixed bake-off set
├─ corpus/<entity_type>/<slug>.md         # EVERYTHING
├─ runs/<ulid>/{manifest.json,context.md,plan.json}
├─ ledger/published.jsonl
├─ .claude/{skills,agents,rules}/         # agent surface, git-tracked
└─ .agent-memory/                         # autoMemoryDirectory, git-tracked, visible
```

## Schema-as-data mechanics

**Authoring dialect:** a restricted profile of JSON Schema 2020-12, documented in `registry/PROFILE.md` and enforced by the schema editor. Allowed: `type, properties, required, enum, const, items, minimum/maximum, minLength/maxLength, pattern, format, default, title, description, $ref → $defs, top-level allOf for mixins`, plus `x-*` annotations (`x-ref-type`, `x-index`, `x-locale`, `x-widget`, `x-retired`, `x-llm-hint`). Banned: `unevaluatedProperties, $dynamicRef, if/then/else, patternProperties, not, oneOf`. Banning `oneOf` sidesteps json-schema-to-typescript's oneOf→anyOf fidelity loss; variants use an explicit literal discriminant (`kind: 'saas' | 'bespoke'`). Banning `unevaluatedProperties` sidesteps RJSF's unverified 2020-12 coverage. The restriction *is* the answer to two open research questions.

**Projection compiler** — one authoring schema, four outputs, snapshot-tested per type in CI:
1. `toForm()` → rjsf data schema + sibling `*.ui.yaml` uiSchema
2. `toTypeScript()` → shape only (Ajv covers constraints; generated types are a *lie* about constraints and must be treated as such)
3. `toStrictLLM()` → inline `allOf`, force every property `required`, optional → `anyOf:[T,{type:"null"}]`, recursive `additionalProperties:false`, strip unsupported keywords, assert ≤5000 properties and ≤10 depth
4. `toIndexDDL()` → SQLite columns for `x-index: true` fields

**Evolution:** additive-by-default with lazy migration. New optional field with default → commit directly. Rename/delete/retype/narrow-enum/add-required → refused unless `registry/migrations/<type>/NNNN-*.ts` exists (scaffolded by `suite migrate:create`, applied with `gray-matter` producing a reviewable diff). Prefer `x-retired: true` over field deletion — historical records stay readable forever, which is what lets a total repositioning retire rather than destroy.

**Dry run before every schema commit:** validate the proposed schema against all existing records of that type; report exact count and identity of records that would fail; refuse destructive changes without a codemod. Schema-editing power is schema-breaking power, and this gate is non-negotiable.

## Stack (decisive, licences checked)

Node 22 LTS · **Hono** (MIT) single server process · **Vite + React 18 + TS + Tailwind + shadcn/ui** SPA (matches the founder's existing `akis-main` muscle memory; rejected Next.js because long-running jobs, chokidar watching and SSE are awkward under App Router and its upgrade churn is hostile to a system that must survive neglect) · **Ajv 8** for user schemas · **Zod v4** for kernel-authored config only, one-way via `z.toJSONSchema()`, never `fromJSONSchema` on the runtime path · **@rjsf/core + @rjsf/shadcn + @rjsf/validator-ajv8** (Apache-2.0) · **better-sqlite3 + FTS5** (MIT / public domain) — not PGlite, because one synchronous in-process index beats a WASM Postgres until pgvector is genuinely needed · **gray-matter**, **yaml** pinned to 1.2 core schema (kills the `no`/`on`/`off` YAML 1.1 footgun) · **ulid** · **jd** (MIT) for machine diffs, **difftastic** for human display · **signedsource** (MIT) · **quickjs-emscripten** (MIT) for cost formulas and templates · **Deno subprocess** with explicit `--allow-net=<hosts>` for `script.run`, never `node:vm` · **Vercel AI SDK** `createProviderRegistry`/`createOpenAICompatible` (Apache-2.0) · **Style Dictionary 5** (Apache-2.0) over DTCG Format Module 2025.10 · shell out to `git` (needed for `worktree`, `merge-file --diff3`, `cat-file` anyway; avoids an isomorphic-git dependency).

Deliberately excluded from the core: every CMS, every memory SaaS, Directus (satellite only, if tabular prospect/ad data ever becomes painful in markdown), n8n and Windmill (licences hostile to eventual productisation), Typesense (GPL-3.0), Dolt/TerminusDB/Grist (binary-in-git or bus-factor).

## Surviving a month of neglect

No daemon holds truth — recovery is `git clone` + `cat`. Exact-pinned dependencies, `npm ci`, no auto-upgrade. One scheduled job only: weekly `suite doctor`, which re-pulls provider OpenAPI/pricing metadata, flags records past `re_verify_by`, flags proof assets past `expiry_date`, checks budget drift — and *writes a report record, changing nothing*. Nothing auto-retires while unattended; silent auto-decay is how neglected systems rot. `suite verify` rebuilds the index from zero and validates every record against its type: if that passes after four weeks away, the system is healthy.


### Hafıza tasarımı

## Architecture: memory is the corpus

There is no separate memory subsystem. A "memory card" is a record of `type: fact` in the same corpus as everything else, with the same envelope, the same index, the same governance screens. "Show me everything the agents know" is a faceted table over `corpus/`, and it is also `ls corpus/fact/`.

**Layer 1 — truth.** `corpus/**/*.md` in git. Line-level diffs, `git blame` on every claim, revert on any mistake, branch for any experiment. Directly validated by Letta's 2026 MemFS ("a git-backed memory filesystem that they can inspect and edit") and by Anthropic's GA memory tool being client-side by design ("Memory lives entirely in your application").

**Layer 2 — index (`.suite/index.db`, gitignored, pure function of layer 1).**

```sql
CREATE TABLE cards (            -- one row per record, envelope fields only
  id TEXT PRIMARY KEY, type TEXT, kind TEXT, zone TEXT, status TEXT,
  locale TEXT, era_id TEXT, path TEXT, content_hash TEXT,
  created_at TEXT, valid_at TEXT, invalid_at TEXT, expired_at TEXT,
  re_verify_by TEXT, confidence REAL, context_weight REAL,
  source_kind TEXT, superseded_by TEXT, body TEXT, claim TEXT
  -- plus generated columns from x-index:true attributes
);
CREATE TABLE scope  (card_id, axis, value);      -- channels/verticals/personas, many-to-many
CREATE TABLE edges  (from_id, to_id, rel);       -- supersedes | proves | refutes | refs | derived_from
CREATE VIRTUAL TABLE cards_fts USING fts5(
  claim, body, tags, content='cards', content_rowid='rowid',
  tokenize="unicode61 remove_diacritics 2"       -- handles ı İ ş ğ ç ö ü
);
CREATE VIRTUAL TABLE cards_tri USING fts5(       -- Turkish has no FTS5 stemmer;
  claim, body, tokenize="trigram"                -- trigram covers agglutinative morphology
);
```

Query both, fuse with reciprocal rank (`1/(60+rank)`), weight `claim` above `body` via `bm25(cards_fts, 10.0, 3.0, 2.0)`. `npm run reindex` nukes and rebuilds in seconds. Because the index is derivable, an FTS5 schema change or a future `sqlite-vec` breaking upgrade is an inconvenience, never data loss.

**Layer 3 — retrieval predicate.** This one query *is* the definition of "what the agents know", and it appears in exactly one place in the codebase:

```sql
WHERE (era_id = :current_era OR era_id = '*')
  AND status IN ('active','pinned')
  AND expired_at IS NULL
  AND (invalid_at IS NULL OR invalid_at > :as_of)
  AND (valid_at   IS NULL OR valid_at  <= :as_of)
```

`:as_of` makes point-in-time audit a parameter, not a feature. A retired 2024 recycling positioning can never leak into a 2026 manufacturing deck; a 2024 asset still resolves correctly against its own era.

**Vectors: not yet.** Add `sqlite-vec` only when (a) cards pass ~2,000 and BM25 visibly misses paraphrases, or (b) — the likely trigger here — cross-lingual recall matters, because the founder searches Turkish for facts recorded in English. When added, it is a **reranker over the FTS5 top-50**, never the primary retriever, so the first stage stays explainable ("matched SKDM, bm25 8.4"). Explainability is the actual requirement.

## The write path — the hard line

**Agents may only call `corpus.propose()`.** A proposal lands as `status: draft`, `zone: generated`, `source.kind: inference`, with `source.run_id`. Drafts are invisible to retrieval by the predicate above, so nothing an agent writes can influence generation until a human approves it. Approval stamps `approved_by`/`approved_at`, flips `status: active`, and commits.

This is the deliberate inversion of every surveyed product. Letta's "dreaming", Mem0's automatic extraction, Cognee's `improve`, Supermemory's automatic extraction and Redis's background promotion all give the LLM write authority and the human a review-after-the-fact role. Steal their extraction quality; reject their write authority.

Single proposals land as drafts in the working tree. Bulk regeneration goes to a branch. That split keeps the common case cheap and the dangerous case reviewable.

**Conflict detection on every proposal:** (1) FTS5 near-duplicate retrieval within the same `(type, scope)` slot; (2) a cheap LLM classifier over the top candidates returning `entails | contradicts | unrelated`. A `contradicts` verdict *never* auto-resolves — it opens an arbitration item showing both claims, both sources, both dates, both confidences, with three actions: keep old / accept new (auto-writes `supersedes` + `superseded_by`) / keep both scoped differently.

**Retirement is never deletion.** Set `expired_at` + `superseded_by`, flip `status: retired`. Graphiti's model exactly: "old facts are invalidated — not deleted."

## Context governance: recipes with per-section budgets

```yaml
# registry/recipes/instagram-post.recipe.yaml
apiVersion: creative/v1
kind: Recipe
id: instagram-post
model_window: 200000
sections:
  - {id: brand_invariants, source: always_on, selector: {type: brand_rule},        budget_tokens: 1200}
  - {id: positioning,      source: pinned,    selector: {type: positioning},        budget_tokens: 800}
  - {id: lexicon,          source: always_on, selector: {type: lexicon, locale: tr}, budget_tokens: 600}
  - {id: supporting_facts, source: retrieved, selector: {types: [fact, proof_asset], k: 12, mode: bm25}, budget_tokens: 3500}
  - {id: persona,          source: entity,    selector: {type: persona, id: "{{ inputs.persona }}"},     budget_tokens: 1200}
  - {id: recent_assets,    source: retrieved, selector: {type: asset, channel: instagram, k: 5, mode: recency}, budget_tokens: 1000}
  - {id: untrusted_input,  source: external,  trust: untrusted, budget_tokens: 2000}   # scraped prospect pages
overflow: drop_lowest_score
```

Per-card entry policy borrows Cursor's four-mode taxonomy: `always` / `agent_decides_by_description` / `scoped_by_facet` / `manual_pin`. The assembler fills each section to budget in score order, drops overflow, and emits a **manifest**: every card id, section, reason for inclusion (always-on / pinned by human / bm25 8.4), content hash, and exact token count.

Get token counts *exactly right* by calling Anthropic's `count_tokens` with `context_management` set, so the preview reflects post-editing reality rather than a guess.

## Anthropic-native integration

- `CLAUDE.md` + `.claude/rules/*.md` with `paths:` globs → durable **operating instructions**.
- Agent Skills (`SKILL.md`, agentskills.io spec so they survive leaving Claude Code) → **procedures**. Level-3 bundled files cost zero tokens until read, so a skill can carry the whole brand book. `disable-model-invocation: true` on every side-effecting skill (publish, spend, deploy).
- The corpus exposed as a local **MCP server**: `corpus.search`, `corpus.get`, `corpus.propose`, `corpus.manifest`. Declares `tools.listChanged: true` so a newly-committed pipeline appears mid-session.
- GA memory tool (`memory_20250818`) pointed at `.agent-memory/scratch/` — inside the repo, so agent scratch notes are git-visible. Canonicalise and re-check every path (`/memories/../../secrets.env` is the documented attack); no secrets ever live in the repo, only `${ENV_VAR}` indirection.
- Set `autoMemoryDirectory` to `<repo>/.agent-memory/` so auto memory stops being invisible machine-local state. Log loads with the `InstructionsLoaded` hook. If it misbehaves, `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` and rely solely on the governed store.
- Pass `exclude_tools: ['corpus_search','corpus_get']` to `clear_tool_uses_20250919` so context editing can never silently delete retrieved facts mid-run. Log `context_management.applied_edits` into the run record so you can *prove* nothing was cleared.

**Critical:** Anthropic's docs state memory files and rules are "context, not enforced configuration". Brand-safety constraints — never claim we are a recycling-software company, never overstate a certification, never publish an unsubstantiated AI claim — are enforced by a **post-generation validator** (`kernel/src/guard/`) that the `human.approve` verb depends on, never by writing them into memory and hoping. MEMORY.md's 200-line/25KB truncation is the same class of failure: any scheme assuming "it's in the file so the agent read it" is wrong.

## Governance UI (the part that earns trust)

The **Corpus Browser** is the primary screen: faceted table over every record, filters for era / type / status / zone / scope / confidence / source kind / staleness. Inline edit writes the markdown file and commits. Bulk pin, bulk retire. Per-row chips: status, staleness (driven by `re_verify_by`), source kind, and a "used in N assets" counter.

**Card Detail** shows claim, body, the verbatim source quote, a confidence slider, the approval trail, `git log --follow` for that file rendered as a timeline, the supersedes chain, and — the reverse index — every asset this card ever influenced. Two clicks from a bad post to the bad fact; fixing that fact immediately lists every other asset now suspect.

**Context Preview** is the screen that makes the founder trust the system: a stacked token bar per section against the model window, the full rendered prompt text, and a card list where each row shows claim / source / confidence / era / why-included / token cost / an include toggle. Toggling recomputes live and is recorded as a run-scoped override. A "diff vs last run" view shows what the agent's knowledge changed since this deck was last generated.

**Approvals Inbox** is keyboard-driven (j/k/a/e/r), because a proposal queue that is tedious will be rubber-stamped, and a rubber-stamped queue is functionally identical to letting the agent write directly.

Requirement (c) needs almost no new machinery. When memory is files, "see everything the agents know" is browsing the repo, and context assembly is a deterministic, auditable, diffable function over frontmatter.


### Yeniden üretim

## Core stance: an era is a git tag, not a directory

Rejecting the era-directory pattern the research proposed, for one decisive reason: duplicating the corpus per era means a regeneration produces file *additions*, and `git diff` on additions shows no side-by-side — which destroys the review requirement it was meant to serve.

An era is three cheap things:

```yaml
# brand/eras/2026-manufacturing-ai/era.yaml   — immutable, append-only
era_id: 2026-manufacturing-ai
label: "Manufacturing intelligence"
status: active                    # candidate | active | sunset | archived
kit_version: 1.4.0                # semver WITHIN the era
valid_from: 2026-03-01
valid_to: null
supersedes: 2019-recycling-native
spec_edition: dtcg-2025.10
commit_sha: 8f3c1a9...            # schema registry + corpus at mint time
git_tag: era/2026-manufacturing-ai
discovery_run_id: 01JZ8K...
rationale: "Repositioning from recycling software to manufacturing intelligence."
generator:
  provider: anthropic
  model_id: claude-opus-4-5
  temperature: 0.3
  seed: 7
  prompt_template_hash: sha256:19ab...
  retrieval_snapshot_id: 01JZ8J...
  input_file_hashes: {interviews/...: sha256:..., scrape/...: sha256:...}
  cost_usd: 41.20
```

Plus `brand/current` (one line naming the active era — rollback is a one-line edit) and `git tag era/<slug>` at mint. "Show me the 2019 positioning" is `git show era/2019-recycling-native:corpus/positioning/company.md`. "Regenerate everything" rewrites the same paths on a branch; old assets stay correctly attributed because they carry `era_id` and resolve through the manifest's commit SHA.

**Two version identifiers, never one.** `era_id` is opaque, immutable, never reused. `kit_version` is semver *within* an era, governed by `brand/POLICY.md` (adapted almost verbatim from GOV.UK's managing-change doc): declare the public API — token names, message keys, claim ids, persona ids, channel ids — then MAJOR = a declared name is renamed or removed; MINOR = additions and deprecations; PATCH = a value or wording change behind a stable name. Never deprecate in a patch. Following Adobe (React Spectrum 3.47 and S2 1.6 shipping side by side), a repositioning is a **new era at kit_version 1.0.0**, not a major bump of the old one.

## The five-command regeneration contract

```
suite discovery plan  --era <slug> --mode merge|mirror  --trigger <enum>
suite discovery review <run_id>              # opens the diff UI
suite discovery apply --plan runs/<id>/plan.json [--force]
suite era mint        <slug> --from <run_id>
suite era retire      <slug>
```

**Triggers (enum, from Dunford's verified taxonomy plus three operational):** `product_change | competitor_change | market_change | founder_dissatisfaction | scheduled_review | source_invalidated`. The last one matters enormously here: when a `regulation` record passes `re_verify_by` or flips `invalid_at`, the doctor job proposes a targeted regeneration of exactly the assets that cite it. CBAM changed twice, CSRD twice, TSRS once and the AI Act once in 18 months — an asset asserting the old 31 May CBAM deadline or the old 500m TL TSRS threshold is now actively damaging.

**Plan format** (`runs/<ulid>/plan.json`), copying Directus's snapshot→diff→hash-guarded-apply contract:

```json
{
  "base_hash": "sha256:...",
  "mode": "merge",
  "era_id": "2026-manufacturing-ai",
  "generator": { "model_id": "...", "temperature": 0.3, "seed": 7, "prompt_template_hash": "..." },
  "ops": [{
    "path": "corpus/value_theme/measurable-carbon-per-tonne.md",
    "json_pointer": "/attributes/metric/delta",
    "kind": "change",
    "before": 60, "after": 100,
    "confidence": 0.74,
    "rationale": "CBAM definitive regime requires plant-level verified data.",
    "source_refs": ["sha256:cbam-2025-2083"],
    "sticky": null
  }],
  "skipped": [{ "section": "personas", "reason": "input_hash_unchanged" }]
}
```

`apply` recomputes `base_hash` against the working tree and **refuses** if the founder hand-edited anything since the plan was generated (`--force` is the documented escape hatch). Two modes exactly as Directus does: `merge` (additive only, never deletes — the safe monthly refresh, and the default) and `mirror` (full regeneration including removals — the "do it all again from scratch" button).

## The rule that makes review survivable

**Idempotent skipping is mandatory infrastructure, not an optimisation.** Skip regeneration of any section whose tuple `(input_file_hashes, prompt_template_hash, model_id, temperature, seed, retrieval_snapshot_id)` is unchanged. Emit ops only from genuinely changed inputs. This is the difference between a reviewable 12-op plan and an unreviewable 900-op plan, and an unreviewable plan means accept-all, which means no governance at all.

Generate ops with **jd** (MIT) using deny-lists for volatile fields (`generated_at`, `model_id`, token counts, embedding hashes) so a re-run does not surface 400 meaningless changes.

## Sticky decision ledger — the piece nothing off-the-shelf provides

```jsonl
{"at":"2026-08-14T11:02:00Z","era":"2026-manufacturing-ai","json_pointer":"/attributes/metric/delta","from_hash":"sha256:a1","to_hash":"sha256:b2","verdict":"reject","reason":"unsubstantiated, no test performed"}
{"at":"2026-08-14T11:04:00Z","era":"2026-manufacturing-ai","json_pointer":"/attributes/headline","verdict":"pin","reason":"founder wording, do not regenerate"}
```

On the next run: any op whose `(json_pointer, to_hash)` was previously rejected is pre-collapsed as "you rejected this before"; any pointer marked `pin` is excluded from the plan entirely (per-field `.regen-ignore`). Without this, the fourth re-run makes the founder re-litigate the same 200 decisions and he abandons the system. This is the single highest-value component with no upstream to copy.

## Generated vs hand-edited: zones plus signatures

`zone: generated` records carry `x_signature: <<SignedSource::md5>>` in frontmatter (the pattern verified in production across every `@atlaskit/tokens` codegen artefact). Before overwriting, verify. Signature intact → overwrite freely, zero risk. Signature broken → **halt the run** and tell the founder to promote his edit into a `zone: human` record (the "eject" move), or accept it as the new base. `zone: human` records are never written by the regenerator and always layer last in resolution.

`.suite/base/<era>/` holds a pristine copy of the previous run's generated output so `git merge-file --diff3 -L yours -L last-run -L regenerated` is available when a file must genuinely be merged rather than replaced (its exit code is the conflict count, so the pipeline gates on it directly).

## Diff review UI

Never regenerate in place. Every run happens in `git worktree add .suite/wt/<run_id> -b regen/<era>/<run_id>` and ends as a draft PR — TinaCMS's editorial-workflow model. The founder approves in the command center and never sees git; the escape hatch (`difftastic` in a real terminal) always exists.

The review screen is four columns — **UNCHANGED / CHANGED / CONTRADICTED / NEW** — with `CONTRADICTED` showing old claim, new claim, both sources, both confidences and three buttons: keep old / accept new (auto-writes `supersedes` + `superseded_by`) / keep both scoped differently.

**One claim per file** is the load-bearing storage rule. Prose merges badly; conflict markers inside a 600-word Turkish positioning statement are hostile to review. `corpus/claim/verimlilik-artisi.md` rather than one manifesto. Accept/reject becomes whole-object and file-level, git's hunk-`split` verb is never needed, and the manifesto is assembled at build time from the claim records.

## Era tagging on assets — the one mistake you cannot fix later

At generation time, every asset stamps:

```yaml
era_id: 2026-manufacturing-ai
kit_version: 1.4.0
definition_digest: sha256:...        # pipeline + prompts + resolved providers + context snapshot
resolver_context: {era: ..., brand: upcytech, channel: instagram, mode: light}
context_manifest: [{card_id, content_hash, section, reason, tokens}, ...]
source_run_id: 01JZ8K...
content_hash: sha256:...
published_at: ...
channel_url: ...
```

and appends the same record to `ledger/published.jsonl`. Retrofitting era tags after a regeneration is *impossible* — the mapping is gone. This is the highest-cost available mistake and it is free to prevent on day one.

Published assets are immutable. `suite era retire <slug>` does exactly three things: flips `status: sunset` and sets `valid_to`; regenerates `brand/lineage/<from>__<to>.map.json` (an old→new map of retired claim ids, token names, message keys and product names, mirroring Atlassian's `replacement-mapping.js` and Primer's `dist/deprecated.json`); and emits `content-audit.md` listing every still-live published asset from the retired era, classified `update | archive | leave-as-history`. Canonical surfaces (website, master deck, one-pager) get a hard cutover date; social archives stay tagged to their era forever.

## rerun vs replay

Two distinct buttons, copying Trigger.dev's semantics exactly. **`rerun`** executes the frozen plan in `runs/<id>/manifest.json` — same providers, same params, same context, reproducible. **`replay`** runs the same inputs against today's definition and shows the drift. Freezing the fully-resolved plan at trigger time sidesteps Temporal's entire determinism/patching problem class rather than solving it. Be explicit in the UI that `rerun` reproduces the **decision**, not the **artefact** — media endpoints are non-deterministic and many do not expose seeds, and a founder who reads that mismatch as a bug will lose trust in everything else.

## Candidate eras and the probe-set bake-off

Several eras may sit at `status: candidate` simultaneously (Sanity Content Releases' "Undecided" affordance — publish actions deliberately hidden in the UI). To compare them, `brand/probes/` defines a fixed set once: 5 Instagram posts, 3 LinkedIn posts, 1 deck for a named prospect archetype, 1 ad set. Render the identical probe set under each candidate context and diff them side by side. A golden-file bake-off — deterministic, cheap, no A/B infrastructure, no Unleash, no feature flags. Promotion is one field flip `candidate → active` plus `valid_from`.

## Bridging the repositioning

The recycling past is proof, not baggage. Every `proof_asset` carries `era_of_origin`, `generalisation_note` and `transfer_confidence ∈ {direct, analogous, illustrative_only}`. A recycling result is never deleted and never presented as a manufacturing result — it is presented as a *harder instance* with an explicit transfer argument the agents must reproduce verbatim. A lint rule fails any published asset citing a proof from a prior era without a `generalisation_note`. And per Google's site-move guidance, keep redirects at least a year and never 410 the recycling pages: they hold the backlinks and the only third-party evidence the new positioning has.


### Genişletilebilirlik

## Principle: three data registries, eight fixed verbs, no plugin API

Do not build an extension framework with lifecycle hooks — for a solo maintainer a data registry plus a small fixed verb set is strictly better than a plugin API nobody else will ever write against. Copy Claude Code's convention-first model: components auto-discovered by directory, a manifest only ever *overrides* defaults, paths `./`-relative, and a separate persistent-data directory that survives a registry rewrite.

**Adding a pipeline, provider or channel = writing a YAML file. Adding a verb = a developer, ~twice a year.**

## Pipeline format

Flat, ordered, typed step list — not a node graph. Kestra proves the flat `{id, type, params}` shape scales to hundreds of task types; GitHub Actions' `uses`/`with`/`needs`/`{{ }}` is the densest workflow dialect in any LLM's training data and therefore the most reliably agent-authorable; and ComfyUI's own *executable* format collapses to a flat map, proving the canvas is renderer chrome. If a visual editor is ever wanted, it is a projection over this file, never the storage format.

```yaml
# registry/pipelines/reels-teaser.pipeline.yaml
# yaml-language-server: $schema=../../.suite/types/pipeline.schema.json
apiVersion: creative/v1
kind: Pipeline
id: reels-teaser
title: "Instagram Reels teaser — 9:16, Türkçe seslendirme"
schema_version: 1
era: current                       # or a pinned era slug

inputs:                            # JSON Schema 2020-12 → rjsf run form + Ajv validation
  type: object
  required: [topic, persona]
  additionalProperties: false
  properties:
    topic:      { type: string, title: "Konu", minLength: 8 }
    persona:    { type: string, x-ref-type: persona }
    vertical:   { type: string, x-ref-type: vertical, default: metal-forming }
    duration_s: { type: integer, minimum: 8, maximum: 30, default: 18 }

context:
  recipe: instagram-post           # registry/recipes/instagram-post.recipe.yaml
  overrides:
    supporting_facts: { query: "{{ inputs.topic }}", k: 12 }

steps:
  - id: script
    uses: llm.generate
    with:
      task_class: creative_short_form         # → models.yaml, never a model id
      output_schema: reels_script             # entity type → toStrictLLM() projection
      locale: tr

  - id: vo
    uses: tts.generate
    needs: [script]
    with:
      text: "{{ steps.script.output.voiceover }}"
      capability: tts.speech
      constraints: { language: tr, voice: male_warm, max_cost_try: 1.5 }

  - id: shots
    uses: video.generate
    needs: [script]
    foreach: "{{ steps.script.output.shots }}"       # first-class, not matrix gymnastics
    with:
      capability: video.text2video
      constraints: { aspect: "9:16", max_duration_s: 6, max_cost_try: 4.0 }
      prefer: cost                                   # cost | speed | quality
      prompt: "{{ item.prompt }}"

  - id: cut
    uses: render.compose
    needs: [shots, vo]
    with:
      template: reels-9x16
      clips: "{{ steps.shots.output[*].video }}"
      audio: "{{ steps.vo.output.audio }}"
      tokens: "{{ brand.resolved.tokens }}"

  - id: gate
    uses: human.approve
    needs: [cut]
    with:
      preview: "{{ steps.cut.output.video }}"
      guards: [lexicon, claim_registry, era_consistency]

  - id: post
    uses: channel.publish
    needs: [gate]
    with:
      channel: instagram-reels
      caption: "{{ steps.script.output.caption }}"
      media: "{{ steps.cut.output.video }}"

outputs:
  video: "{{ steps.cut.output.video }}"
  record_type: asset

policy:
  budget_try: 12.00
  max_wall_seconds: 900
  on_error: halt                    # halt | continue | fallback
  egress_allow: []                  # script.run only; translated to --allow-net
```

**Steps declare capabilities, never model ids.** A model id in a pipeline file is a hardcoded assumption that violates requirement (d) the day a provider dies. Resolution happens at plan time and is recorded in the run manifest, so pipelines survive provider churn while past runs stay explainable.

Three ideas borrowed from Windmill's OpenFlow (whose spec is Apache-2.0, so implementing it is legally clean): a `rawscript`-style escape hatch (`script.run`), per-step `mock:` for dry runs, and `suspend`-style human approval gates (`human.approve`).

## Provider descriptor

```yaml
# registry/providers/fal-kling-v2-master.provider.yaml
apiVersion: creative/v1
kind: Provider
id: fal-kling-v2-master
title: "Kling v2 Master — text to video (fal.ai)"
adapter: fal.queue                  # openai-compatible | fal.queue | replicate | http.json | comfy | local
endpoint: fal-ai/kling-video/v2/master/text-to-video
auth:
  api_key: "${FAL_KEY}"             # env indirection ONLY — never a literal in git

schema_source:                      # the importer's provenance
  openapi: "https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v2/master/text-to-video"
  imported_at: 2026-08-14T10:02:11Z
  imported_hash: sha256:7d1e...

capabilities: [video.text2video]     # mirrors OpenRouter's input/output_modalities vocabulary
constraints:                         # TYPED, not tag soup — this is what LiteLLM tags cannot do
  aspect: ["16:9", "9:16", "1:1"]
  min_duration_s: 5
  max_duration_s: 10
  audio: false
  max_resolution: "1080p"
  languages: [any]

params:                              # canonical → native, with imported ranges/enums
  prompt:      { native: prompt, required: true }
  duration_s:  { native: duration, transform: "String(v)", enum: ["5","10"] }
  aspect:      { native: aspect_ratio }
  negative:    { native: negative_prompt, default: "blur, distort, low quality" }
  seed:        { native: seed, optional: true }

cost:                                # LiteLLM's exact key vocabulary where a flat rate suffices
  currency: USD
  input_cost_per_video_per_second: 0.28
  formula: "input_cost_per_video_per_second * duration_s"    # QuickJS, 10ms deadline, no globals
  fx: { source: tcmb_evds, cache_hours: 24 }

latency_p50_s: 210
quality_tier: 4                      # 1-5, founder-editable, the human judgement input
enabled: true
health: { last_ok_at: 2026-08-13T22:10:00Z, consecutive_failures: 0, p95_s: 340 }
upstream: { expiration_date: null, knowledge_cutoff: null }   # from OpenRouter-style metadata
```

**The importer is the highest-leverage component.** fal serves a complete OpenAPI 3.0.4 document per model endpoint (verified live for `fal-ai/flux/dev`, including `num_inference_steps` 1–50 default 28, `guidance_scale` 1–20 default 3.5, `acceleration` enum). OpenRouter serves capability and pricing metadata at `/api/v1/models`. So "add a provider" is: paste an endpoint id → the importer pulls the schema, derives params, ranges, enums and defaults → proposes a descriptor → the founder annotates capability tags, quality tier and cost formula → commit. Under 60 seconds, and the imported ranges let the validator reject `num_inference_steps: 90` *before* spending money. Keep a hand-written fallback path, because the fal OpenAPI URL pattern is reachable but not confirmed as a documented public interface.

## Channel descriptor

```yaml
apiVersion: creative/v1
kind: Channel
id: instagram-reels
title: "Instagram Reels"
publish: { adapter: http.json, endpoint: "https://graph.facebook.com/v21.0/{ig_id}/media", auth: { token: "${IG_TOKEN}" } }
constraints:
  media_types: [video/mp4]
  aspect: ["9:16"]
  max_duration_s: 90
  caption_max_chars: 2200
  hashtags_max: 30
preview: { template: templates/instagram-reels.preview.hbs }
locale_default: tr
era_scoped: true
```

## Capability router (~300 lines, table-driven, yours to own)

No OSS system today answers "9:16 video with Turkish voiceover under 30s for under 5 TL". OpenRouter's `max_price` is per-million-tokens and text-only; LiteLLM tags are opaque strings with no semantics; Helicone balances latency and cost but not media capability. This gap is the actual product differentiator, and it is small enough to stay legible a year later.

1. **Filter** — hard match on capability tag + typed constraints + `enabled` + the era's allow/deny list. Borrow LiteLLM's AND/OR/NOT tag algebra and `allow_fail_open` degradation.
2. **Price** — evaluate `cost.formula` against concrete params in QuickJS (10ms deadline, no host bindings, blast radius = a wrong number), convert USD→TRY at a cached daily TCMB rate, drop anything over `max_cost_try`.
3. **Score** — weighted sum of `quality_tier`, −normalised cost, −latency, with weights from the step's `prefer:`.
4. **Fallback** — ordered chain on error or timeout.
5. **Record** — persist the winner *and every loser with its rejection reason* into the run manifest.

Step 5 is what turns routing from magic into governance. Cover it with fixture tests asserting "given these descriptors and this constraint set, this provider wins and these lost for these reasons".

## Four validation gates before anything runs

1. **SCHEMA** — file matches `pipeline.schema.json` (generated from one Zod v4 source via `z.toJSONSchema()`, emitting `io:'input'` for forms and `io:'output'` for the executor contract).
2. **GRAPH** — every `needs` resolves, the DAG is acyclic, and every `{{ }}` expression resolves to a declared input, a prior step's declared output, or a context key. **This gate catches nearly every agent-authored mistake and is the highest-value 100 lines in the codebase.** Deferring it means the founder experiences agent-authored pipelines as runtime failures halfway through a paid run.
3. **RESOLVE** — every capability has ≥1 surviving provider, or fail specifically: `no provider satisfies video.text2video at 9:16 ≤6s under 4.00 TL; cheapest candidate fal-kling-v2-master estimates 7.40 TL`.
4. **PLAN** — Terraform-style dry run printing the DAG, chosen provider per step, estimated cost band, token budget and the exact context to be injected. Calls nothing paid.

Ajv's raw errors are unreadable; every failure must name the file, the JSON pointer, what was expected, and one suggested fix.

## Hot reload and agent authoring

`chokidar` watches `registry/**` → re-parse → re-validate → push over SSE to the command center. Registry reload is safe because it is data; dynamic re-import of TS modules is not, so a new verb means a restart — fine at twice a year. The MCP server declares `tools.listChanged: true` and notifies on registry change, so a running agent session discovers a new pipeline mid-conversation; treat that as convenience, with restart as the guaranteed path.

Agent authoring ships as a `new-pipeline` skill (agentskills.io spec — name ≤64 chars lowercase-hyphen matching its directory, description ≤1024, body <500 lines, schema detail in `references/`) plus a `pipeline-author` subagent with `isolation: worktree`, so registry rewrites land in a throwaway worktree and the founder reviews a real diff. `allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/validate.sh *)` pre-approves exactly the validator and nothing else.

**The inviolable rail: the agent may WRITE registry YAML; only the founder may APPLY it.** Apply is a git commit.

## Sandboxing: three tiers

- Templates and cost formulas → **quickjs-emscripten** with `memoryLimitBytes` and `shouldInterruptAfterDeadline`, zero host bindings. Pre-1.0 and unaudited by its own README, which is acceptable for arithmetic with a deadline.
- `script.run` needing network → a **Deno subprocess** with the pipeline's declared egress hosts translated to `--allow-net=<exact hosts> --allow-read=./workspace`. Never grant `--allow-run` or `--allow-ffi`; Deno's own docs say treat those as `--allow-all`.
- **Never `node:vm`** — its docs disclaim it in one sentence. Skip `isolated-vm` (maintenance mode, native rebuild per Node major) and `workerd` (its README states it lacks defence-in-depth and needs a VM around it).

Single-tenant means the real threats are the founder's own agent erring and injected instructions from a scraped prospect page — bound egress, filesystem and spend, do not try to defeat a determined attacker. Fetched prospect content enters the `untrusted_input` context section, clearly delimited, never as instructions, and no `channel.publish` or spend verb may fire in a turn whose context contains freshly-fetched external text without explicit human approval.

## The 10-minute path

`/new-pipeline reels teaser, 9:16, Türkçe VO, 20s altı` [30s] → Claude writes the YAML [1min] → `suite validate reels-teaser` [5s] → `suite plan reels-teaser --topic skdm --persona uretim-direktoru` prints the DAG, chosen providers and a 4.20 TL estimate, spending nothing [10s] → founder reads the diff and commits [2min] → run. Under five minutes of human time, with headroom for one round of "no, cheaper, different voice".


### Strateji şeması

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# Upcytech Creative Suite — strategy entity types
# Location: registry/entity-types/*.type.yaml
# Dialect:  restricted JSON Schema 2020-12 profile (registry/PROFILE.md)
# Notation below is the compact authoring view; one full JSON Schema
# rendering follows at the end so the mapping is unambiguous.
#
# LEGEND
#   name:  T        required          name?: T      optional
#   A|B|C           enum              []T           array of T
#   →type           reference: ULID string, x-ref-type: type, integrity
#                   checked by the corpus linter (JSON Schema cannot express it)
#   @               x-index: true  → materialised as a SQLite column
#   !               enforced by a lint rule (see LINT RULES at the end)
#   tr              x-locale: tr → belongs in the Turkish lexicon, not code
#
# Every record ALSO carries the fixed kernel envelope (id, type, schema_version,
# kind, zone, status, locale, era_id, created_at, valid_at, invalid_at,
# expired_at, re_verify_by, supersedes[], superseded_by, confidence,
# approved_by, approved_at, source{}, scope{}, tags[], context_weight,
# x_signature). Only the `attributes` object is shown below.
# ═══════════════════════════════════════════════════════════════════════════


# ── positioning ─────────────────────────────────────────────── kind: dna ──
# Dunford's five components as a normalised graph. Everything else in the
# system (messaging house, deck, homepage, llms.txt) is a VIEW over this.
positioning:
  subject_ref:            →company|→product|→service_line          @
  subject_kind:           company|product|suite|service_line       @
  pre_work:
    audience:             customer|investor|employee|partner
    readiness:            pre_launch_thesis|shipped
    champion_persona_ref: →persona                                 !
  competitive_alternatives: []{                                    !
      alternative_ref:    →competitor
      prevalence_pct?:    number 0..100
      evidence_refs:      []→proof_asset
      last_seen_in_deal_at?: date }
  unique_attributes: []{
      key:                string ^[a-z0-9-]+$        # PUBLIC API: rename = MAJOR
      name_tr:            string tr
      mechanism:          string          # what it DOES, not what it IS      !
      alternatives_lacking_refs: []→competitor
      defensibility:      algorithm|proprietary_data|domain_model|
                          integration_depth|patent|none
      proof_refs:         []→proof_asset
      decay_risk:         low|medium|high
      decay_note?:        string
      state:              active|experimental|deprecated|removed
      introduced:         semver          # kit_version it appeared in
      replacement?:       string }        # key of successor → lineage map
  value_theme_refs:       []→value_theme  max 4                    !
  target_segment_refs:    []→icp
  market_category:
    chosen_frame_tr:      string tr       # PUBLIC API
    style:                head_to_head|big_fish_small_pond|new_category  !
    frames_considered:    []string
    why_this_frame:       string
    buyer_budget_line?:   string
    evidence_prospects_use_term: []→proof_asset
  relevant_trends: []{ trend, why_we_can_ride_it, expiry_date }
  point_of_view_ref?:     →point_of_view
  review_due_at:          date                                      @


# ── value_theme ─────────────────────────────────────────────── kind: dna ──
# STRICTLY SEPARATE from objection_handler. Merging them is the #1 cause of
# bloated undifferentiated decks, and an LLM will merge them by default.
value_theme:
  key:                    string ^[a-z0-9-]+$                       @
  headline_tr:            string tr
  headline_en?:           string
  so_what_chain:          []string  minItems 3
                          # attribute → capability → operational → financial   !
  metric:                                                            !
    name:                 string
    unit:                 string          # TL, %, dakika, tCO2e/ton, puan
    baseline?:            number
    delta?:               number
    measurement_method:   string
    n?:                   integer
    time_window?:         string
  buyer_role_refs:        []→persona
  evidence_strength:      anecdote|self_reported|customer_confirmed|
                          independently_audited|reproducible_artifact  @
  proof_refs:             []→proof_asset
  is_differentiated:      boolean                                    @!
  positioning_ref:        →positioning


# ── objection_handler ───────────────────────────────────────── kind: dna ──
# Never appears on a value slide. Attaches to gatekeeper personas.
objection_handler:
  objection_tr:           string tr       # "Tek kişilik firma, yarın kaybolursan?"
  persona_ref:            →persona                                  @
  response_tr:            string tr
  proof_refs:             []→proof_asset
  is_disqualifier:        boolean         # true = loses the deal if unanswered
  becomes_value_when?:    string          # rare: competitor trust damage + quantified
  structural_answer?:     string          # escrow, self-host, open export, handover


# ── point_of_view ───────────────────────────────────────────── kind: dna ──
point_of_view:
  belief_tr:              string tr
  time_horizon:           1y|3y|5y|10y
  falsifiable_prediction: string                                    !
  rooted_in_unique_attribute_refs: []→positioning#unique_attributes  !
  evidence_refs:          []→proof_asset
  contradicts_consensus?: string


# ── icp ─────────────────────────────────────────────────────── kind: dna ──
icp:
  name_tr:                string tr
  tier:                   primary|secondary|explore|disqualified     @
  firmographics:
    nace_codes:           []string        # C-prefixed for manufacturing
    sub_sector_tr:        string tr
    employee_range:       {min, max}
    revenue_range_try:    {min, max}
    plant_count?:         {min, max}
    multi_site:           boolean
    geo:                  []string        # TR-16 Bursa, TR-34, EU-DE ...
    ownership:            family|pe|corporate_group|public
    export_share_pct?:    number
  technographics:
    erp?:                 string
    mes?:                 string
    scada_historian?:     string
    plc_vendors:          []string
    cloud_posture:        on_prem_only|hybrid|cloud_ok
    data_maturity:        paper|excel|siloed|integrated|analytics_mature @
  operational_signals:
    shift_pattern?:       string
    oee_baseline?:        number
    scrap_rate_pct?:      number
    energy_intensity?:    number
    regulatory_regimes:   []→regulation   # SKDM/CBAM, TR-ETS, TSRS, ISO 50001,
                                          # IATF 16949, ESPR/DPP
    digital_maturity_framework?: ddx|siri|daimi|none
  trigger_events: []{
      event_tr:           string tr       # kapasite yatırımı, enerji tarifesi şoku,
                                          # KAP sürdürülebilirlik bildirimi, ERP göçü
      detectability_source: →data_source } # kap | iso500 | tim | evds | linkedin
  incentive_fit:          []string        # kosgeb-dijital-donusum, vap, hamle, tubitak
  why_they_care_value_theme_refs: []→value_theme
  disqualifiers:          []string  minItems 1                      !
  reachability:
    channels:             []→channel
    list_source?:         →data_source
    estimated_count?:     integer
  economics:
    acv_range_try:        {min, max}
    sales_cycle_days?:    integer
    cac_estimate_try?:    number
    expansion_path?:      string
  last_validated_at:      date                                      @


# ── persona ─────────────────────────────────────────────────── kind: dna ──
persona:
  name_tr:                string tr       # Üretim/Operasyon Direktörü
  role_title_variants_tr: []string tr                               !
  role_title_variants_en: []string        # both, always — TR search ≠ EN search
  segment_refs:           []→icp
  role_in_deal:           champion|economic_buyer|technical_evaluator|
                          blocker|end_user|influencer                @
  jtbd: []{
      job_statement_tr:   string tr
      job_type:           core_functional|related|emotional|
                          social|consumption_chain          # Ulwick, verified
      desired_outcomes: []{
          direction:      minimise|increase|stabilise
          metric:         string
          object_of_control: string
          context:        string } }      # "...bir vardiya boyunca"
  pains_tr:               []string tr
  gains_tr:               []string tr
  objection_refs:         []→objection_handler
  vocabulary:
    words_they_use_tr:    []string tr     # üretim takip sistemi, kestirimci bakım,
                                          # SKDM, dijital olgunluk, DDX
    words_that_repel_tr:  []string tr     # populate ONLY from real call transcripts
    en_equivalents:       []{tr, en}
  information_diet:
    publications:         []string        # Otomasyon Dergisi, ST Endüstri Haber
    communities:          []string        # OSB, MMO, TOBB sektör meclisleri
    events:               []string        # WIN EURASIA, MAKTEK Avrasya, Model Fabrika
    platforms:            []string
    podcasts:             []string
  proof_preferences:      []string        # ranked proof_asset.kind values
  decision_criteria_tr:   []string tr
  last_validated_at:      date                                      @


# ── proof_asset ─────────────────────────────────────── kind: ledger ────────
# The most important entity in a repositioning: it turns the recycling past
# from baggage into evidence.
proof_asset:
  title_tr:               string tr
  claim_supported_ref:    →value_theme|→positioning#unique_attributes  !
  kind:                   benchmark|pilot_result|reference_plant|case_study|
                          methodology_note|open_source_component|dataset|
                          certification|audit_report|patent|publication|
                          testimonial|live_demo|third_party_review     @
  strength_tier:          1|2|3|4|5                                    @
                          # 1 anecdote · 2 self-reported metric
                          # 3 customer-confirmed · 4 independently audited
                          # 5 reproducible artifact (code + data published)
  metric?:
    name, value, unit, baseline?, uplift?, n?, confidence_interval?,
    measurement_method, time_window
  reproducibility:
    method_documented:    boolean
    artifact_url?:        string
    data_availability:    none|synthetic|anonymised|full
  confidentiality:        public|nda_anonymised|internal_only          @
  anonymisation_rule?:    string
  customer_ref?:          →company
  sector_tr:              string tr
  era_of_origin:          string                                       @!
  generalisation_note?:   string tr       # REQUIRED when era_of_origin ≠ current !
  transfer_confidence?:   direct|analogous|illustrative_only            !
  usable_in_channels:     []→channel
  expiry_date?:           date                                         @
  last_verified_at:       date                                         @
  verified_by:            string
  legal_review_status:    none|reviewed|blocked


# ── competitor ──────────────────────────────────────────────── kind: dna ──
competitor:
  name:                   string
  kind:                   status_quo|manual_process_excel|in_house_build|
                          point_tool|erp_mes_module|suite_vendor|
                          si_consultancy|academic_partner                @!
  origin:                 tr_local|global_with_tr_channel|eu|none
  url?:                   string
  category_tr:            string tr
  what_they_do_well:      []string
  structural_weakness:    []string        # e.g. "stops at the OEE dashboard"
  pricing_model?:         string
  pricing_evidence_refs:  []→proof_asset  # NEVER quote unverified comparison sites !
  strategy_canvas_scores: []{ factor_ref: →competing_factor, score: 0..10 }
  content_cadence?:       string
  last_reviewed_at:       date                                          @
  monitor:                { enabled: boolean, source: →data_source }

competing_factor:                          # Blue Ocean canvas axis (structure only,
  key:                    string           # never the trademarked phrase in copy)
  name_tr:                string tr
  unit_hint?:             string
errc:                                      # Eliminate/Reduce/Raise/Create
  eliminate: []{factor_ref, rationale}
  reduce:    []{factor_ref, rationale}
  raise:     []{factor_ref, rationale}
  create:    []{factor_ref, rationale}


# ── offer ───────────────────────────────────────────────────── kind: dna ──
# Palantir forward-deployed model: not "an agency with a product" — a platform
# company whose deployments are how the platform learns.
offer:
  name_tr:                string tr
  delivery_model:         assessment|pilot|bespoke_project|
                          saas_subscription|licence_plus_services|
                          outcome_based                                  @
  ladder_position:        integer 1..6                                   @!
                          # agents MUST pitch the lowest unclaimed rung
  scope_tr:               string tr
  deliverables_tr:        []string tr
  duration:               string
  price_model:
    type:                 fixed|time_and_materials|subscription|outcome_share
    range_try:            {min, max}
    currency:             TRY|USD|EUR
    fx_risk_note?:        string          # TL exposure of USD-priced SaaS
  risk_reversal?:         string          # pilot with defined success criteria + exit
  ip_terms:               we_own|customer_owns|joint|licence_back        !
                          # load-bearing: the model collapses if bespoke
                          # contracts assign IP away
  reusability_clause:     string          # right to generalise learnings
  productisation_candidates: []string
  incentive_fit:          []string        # kosgeb-dijital-donusum | vap | hamle
  target_segment_refs:    []→icp
  persona_refs:           []→persona
  proof_refs:             []→proof_asset


# ── claim_registry ──────────────────────────────────── kind: ledger ────────
# Forced by FTC Operation AI Comply + SEC v. Delphia/Global Predictions.
# The publish gate resolves EVERY numeric/superlative/AI claim against this.
claim:
  text_tr:                string tr
  claim_type:             capability|performance|comparative|
                          first_or_only|autonomy|outcome_guarantee        @
  evidence_refs:          []→proof_asset  minItems 1                      !
  substantiation_status:  substantiated|pending_evidence|prohibited        @!
  test_performed?:        { what, method, date, result }                   !
  jurisdictions:          []string        # TR, EU
  reviewed_by:            string
  reviewed_at:            date
  expires_at?:            date                                             @


# ── lexicon ─────────────────────────────────────────────────── kind: dna ──
lexicon:                                   # one per locale
  approved_terms:         []{ term, definition, use_when }
  banned_terms:           []{ term, reason, replacement }
    # seeded from enforcement precedent: "AI-powered"/"AI-driven" as bare
    # adjectives, "devrim niteliğinde", "sorunsuz", "yeni nesil",
    # "dünyada ilk", "tamamen otonom", "akıllı", "uçtan uca"
  claim_words_requiring_proof: []string    # %, "'e kadar", "gerçek zamanlı",
                                           # "kanıtlanmış", "x kat hızlı"
  tr_en_term_pairs:       []{tr, en}       # SKDM↔CBAM, kestirimci bakım↔predictive
  forbidden_constructions: []string        # adjective stacks with no named mechanism
  sentence_length_max:    integer
  # CORE RULE: replace every adjective with a mechanism, a number and a
  # boundary condition. State the failure mode — it is the strongest
  # credibility signal to an engineer and the thing an AI-washing
  # competitor structurally cannot copy.


# ── messaging_house ─────────────────────────── kind: dna, DERIVED VIEW ────
messaging_house:
  derived_from_positioning_id: →positioning                              @
  generated_at:           datetime                                       @
  roof_tr:                string tr       # market_category + primary value theme
  pillars:                []{ value_theme_ref, headline_tr, support_tr }
  foundation:             []→proof_asset
  stale:                  boolean         # computed: positioning changed since


# ── brand_architecture ──────────────────────────────────────── kind: dna ──
brand_architecture:
  model:                  branded_house|endorsed_brand|
                          house_of_brands|hybrid                          @
  parent_brand_ref:       →brand
  nodes: []{
      brand_ref:          →brand
      relationship:       master|endorsed|sub_brand|independent
      endorsement_strength: strong|linked|token|shadow
      own_domain:         boolean }
  naming_rules:           []string
  # RECOMMENDATION: endorsed_brand — "dima by Upcytech". A future product
  # earns its own name only on ≥4 of 5: distinct buyer persona · distinct
  # market category · standalone price/budget line · survives the parent
  # pivoting away · self-serve motion. Below 4 it is a module.
  governance: { who_decides, launch_checklist_ref, review_cadence }


# ── bridge_narrative ────────────────────────────────────────── kind: dna ──
bridge_narrative:
  from_niche_tr:          string tr       # geri dönüşüm yazılımı
  to_positioning_ref:     →positioning
  hardness_claim_tr:      string tr
    # "Geri dönüşüm, imalatın en zor örneğidir: heterojen ve kalitesi belirsiz
    #  girdi, deterministik olmayan verim, oynak girdi fiyatı, ağır izlenebilirlik
    #  raporlaması, hataya tahammülü olmayan marj."
  transfer_axes:          []string        # optimisation under uncertainty,
                                          # lot genealogy, yield modelling
  proof_refs:             []→proof_asset
  objection_refs:         []→objection_handler
  test_result?:           validated|weak|rejected   # from real discovery calls


# ── discovery_run ───────────────────────────────────── kind: ledger ────────
discovery_run:
  trigger:                product_change|competitor_change|market_change|
                          founder_dissatisfaction|scheduled_review|
                          source_invalidated                              @
  inputs_manifest:        []{ path, sha256, kind }
  generator:              { provider, model_id, temperature, seed,
                            prompt_template_hash, retrieval_snapshot_id }
  cost_usd:               number
  ops_count:              integer
  skipped_count:          integer
  output_record_ids:      []string
  migration_map:          {}              # old_id → new_id | RETIRED | UNCHANGED
  approval:               { approved_by, approved_at, notes }


# ═══════════════════════════════════════════════════════════════════════════
# LINT RULES  (kernel/src/guard/strategy.ts — run on every era, surfaced as a
# single "strategy health" score; this is what makes governance visible)
# ═══════════════════════════════════════════════════════════════════════════
# ERROR
#   E01 positioning.competitive_alternatives has no competitor of kind
#       status_quo or in_house_build   (≈50% of B2B losses go there)
#   E02 value_theme.metric missing name or unit
#   E03 published asset contains a numeric/superlative/AI claim with no
#       substantiated claim_registry entry
#   E04 proof_asset.era_of_origin ≠ current era and generalisation_note empty
#   E05 icp.disqualifiers empty                         (ICP too broad)
#   E06 point_of_view.rooted_in_unique_attribute_refs empty
#   E07 any x-ref-type reference points at a missing or retired record
#   E08 offer.ip_terms = customer_owns while delivery_model = bespoke_project
#       and reusability_clause empty                    (model collapse)
#   E09 identifier fails ^[a-z0-9-]+$  or was produced by toLowerCase()
#       without an explicit 'en-US' locale              (Turkish I/ı trap)
# WARN
#   W01 positioning.value_theme_refs.length > 4
#   W02 value_theme.is_differentiated = true but strongest proof is tier 1
#   W03 identical text appears in a value_theme and an objection_handler
#   W04 market_category.style = new_category            (unfundable solo)
#   W05 asset uses a lexicon banned term
#   W06 proof_asset past expiry_date, or last_verified_at older than 12 months
#   W07 unique_attribute.decay_risk = high with no refresh plan
#   W08 regulation record past re_verify_by is cited by a live asset
#   W09 competitor.pricing_model present with empty pricing_evidence_refs


# ═══════════════════════════════════════════════════════════════════════════
# The same thing as a real registry file, so the mapping is unambiguous
# ═══════════════════════════════════════════════════════════════════════════
# registry/entity-types/value_theme.type.yaml
$schema: "https://json-schema.org/draft/2020-12/schema"
$id: "urn:upcytech:entity-type:value_theme:3"
title: "Değer Teması"
x-schema-version: 3
x-kind: dna
x-discriminant: null
type: object
additionalProperties: false
required: [key, headline_tr, so_what_chain, metric, evidence_strength,
           is_differentiated, positioning_ref]
properties:
  key:
    type: string
    pattern: "^[a-z0-9-]+$"
    x-index: true
    description: "Public API. Renaming is a MAJOR kit_version change."
  headline_tr:  { type: string, minLength: 10, maxLength: 140, x-locale: tr }
  headline_en:  { type: string, maxLength: 140, x-locale: en }
  so_what_chain:
    type: array
    minItems: 3
    items: { type: string }
    description: "attribute → capability → operational effect → financial effect"
  metric:
    type: object
    additionalProperties: false
    required: [name, unit, measurement_method]
    properties:
      name:               { type: string }
      unit:               { type: string }
      baseline:           { type: number }
      delta:              { type: number }
      measurement_method: { type: string }
      n:                  { type: integer, minimum: 1 }
      time_window:        { type: string }
  buyer_role_refs:
    type: array
    items: { type: string, x-ref-type: persona }
  evidence_strength:
    type: string
    x-index: true
    enum: [anecdote, self_reported, customer_confirmed,
           independently_audited, reproducible_artifact]
  proof_refs:
    type: array
    items: { type: string, x-ref-type: proof_asset }
  is_differentiated: { type: boolean, x-index: true }
  positioning_ref:   { type: string, x-ref-type: positioning }
  retired_note:      { type: string, x-retired: true }
```
