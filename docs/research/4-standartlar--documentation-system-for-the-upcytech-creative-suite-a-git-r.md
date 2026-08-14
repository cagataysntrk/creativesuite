# Documentation system for the Upcytech Creative Suite — a git repo read by both a solo founder and AI agents, that must not rot

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Özet

Diátaxis is the right spine but not the whole skeleton: it has no home for a constitution, a roadmap, or a decision log. So the docs tree is Diátaxis-plus-three: `docs/tutorial/` (exactly one file, first run), `docs/how-to/` (runbooks), `docs/reference/` (100% GENERATED — schema, provider catalog, pipeline catalog, CLI, glossary, anchors), `docs/explanation/` (constitution, architecture rationale, brand-voice notes), plus `docs/decisions/` (MADR 4.0.0, immutable) and `ROADMAP.md` / `CHANGELOG.md` at root. The brand book is NOT documentation — it is Ring 2 corpus data in Turkish; `docs/reference/brand-book.md` is generated from it.

The anti-rot thesis is simple: a doc that a human types is a doc that lies. Every fact that exists in a machine-readable source (Zod schemas → JSON Schema, `registry/providers/*.yaml`, `registry/pipelines/*.yaml`, kernel's 8 verb definitions, CLI command table, `registry/lexicon.yaml`) is generated into `docs/reference/`, committed (the single deliberate exception to "Ring 3 is gitignored", because agents must read it without running a build), banner-marked, and gated by `git diff --exit-code` in CI. Anything that cannot be generated carries `verifiedAt` + `verifyEvery` frontmatter and is swept by a `docs:doctor` job.

Cross-references survive edits because every referenceable heading carries an explicit `{#s-4-3}` anchor (markdownlint MD051 understands these), anchors are immutable, retired anchors get tombstones, and prose may never say "see 4.3" — only a real link, so lychee with `include_fragments = "full"` catches breakage.

Agent-facing docs are budgeted, not written: `AGENTS.md` is the single entrypoint (≤200 lines), `CLAUDE.md` is `@AGENTS.md` plus Claude-only lines, deep or path-specific instructions live in `.claude/rules/*.md` with `paths:` frontmatter, and procedures live in Skills (`SKILL.md` ≤500 lines, description ≤1024 chars, ~100 tokens each at startup). Docs are English; content is Turkish; a generated bilingual glossary and a Vale substitution blocklist keep calques out.


### Kurallar (40)

#### `doc-tree-fixed` · BLOCKING

Every markdown file under `docs/` MUST live in exactly one of `docs/tutorial/`, `docs/how-to/`, `docs/reference/`, `docs/explanation/`, `docs/decisions/`; no other subdirectory and no loose file at `docs/` root is permitted.

- **Neden:** Without a fixed taxonomy, docs accumulate in an undifferentiated pile and agents cannot infer from a path whether a file is a promise, a procedure, or a fact.
- **Zorlama:** CI script `scripts/docs/check-tree.ts`: `find docs -name '*.md' | grep -vE '^docs/(tutorial|how-to|reference|explanation|decisions)/'` must return empty. Wired into `pnpm docs:check`.

#### `one-tutorial` · BLOCKING

`docs/tutorial/` MUST contain exactly one file, `docs/tutorial/first-run.md`, that takes a fresh clone to one rendered Instagram asset; anything else claiming to be a tutorial is a how-to and belongs in `docs/how-to/`.

- **Neden:** Diátaxis rots fastest at the tutorial corner: people write six 'getting started' docs, five go stale, and the founder cannot tell which one is current.
- **Zorlama:** `test -f docs/tutorial/first-run.md && [ $(ls docs/tutorial/*.md | wc -l) -eq 1 ]` in `pnpm docs:check`.

#### `reference-is-generated-only` · BLOCKING

No file in `docs/reference/` may be hand-edited; every file there MUST begin with the exact line `<!-- GENERATED FILE — DO NOT EDIT. Source: <glob>. Regenerate: pnpm docs:generate -->` as its first line.

- **Neden:** Hand-maintained reference docs are the primary rot surface: the YAML descriptor changes, the table in the docs does not, and an agent then plans a pipeline against a provider that no longer exists.
- **Zorlama:** `scripts/docs/check-generated-banner.ts` asserts line 1 of every `docs/reference/**/*.md` matches `/^<!-- GENERATED FILE — DO NOT EDIT\. Source: .+\. Regenerate: pnpm docs:generate -->$/`. Severity BLOCKING in `pnpm docs:check`.

#### `docs-drift-gate` · BLOCKING

CI MUST run `pnpm docs:generate` and then fail if the working tree is dirty; generated docs are committed to git despite Ring 3 being gitignored, and this exception applies ONLY to `docs/reference/`.

- **Neden:** Committing generated docs is what lets an agent read the provider catalog without a build step; the diff gate is what stops those committed files from silently drifting from their sources.
- **Zorlama:** CI step: `pnpm docs:generate && git diff --exit-code -- docs/reference/`. Plus `.gitignore` MUST NOT contain a `docs/reference` entry — asserted by `grep -q 'docs/reference' .gitignore && exit 1`.

#### `schema-ref-generated` · BLOCKING

`docs/reference/schema/*.md` MUST be generated from JSON Schema emitted by the kernel's Zod schemas (`pnpm schema:emit` → `derived/schema/*.json` → docs), never written by hand, and MUST cover every entity-type declared in `registry/entity-types/`.

- **Neden:** A stale schema reference makes an agent propose records with fields the kernel will reject, wasting a whole pipeline run and a premium-lane budget.
- **Zorlama:** `pnpm docs:generate` runs the emitter; `scripts/docs/check-schema-coverage.ts` fails if any `registry/entity-types/*.yaml` has no corresponding `docs/reference/schema/*.md` section. Covered by the docs-drift-gate diff check.

#### `provider-catalog-generated` · BLOCKING

`docs/reference/providers.md` MUST be generated from `registry/providers/*.yaml` and MUST render, per provider: declared capabilities, cost formula, free/premium lane assignment, and the descriptor file path — and nothing hand-written.

- **Neden:** Provider prices and capability sets change monthly; a hand-kept table means the cost estimate shown before a run disagrees with the doc the founder is reading.
- **Zorlama:** Generator `scripts/docs/gen-providers.ts`; banner rule + drift gate cover it. `scripts/docs/check-provider-coverage.ts` fails if `ls registry/providers/*.yaml | wc -l` differs from the row count parsed out of the generated table.

#### `pipeline-catalog-generated` · BLOCKING

`docs/reference/pipelines.md` MUST be generated from `registry/pipelines/*.yaml` and list, per pipeline, the CAPABILITIES it requests; a generator that finds a hardcoded model id in a pipeline file MUST exit non-zero instead of documenting it.

- **Neden:** Pipelines requesting capabilities rather than model ids is an architectural invariant; letting the doc generator render a model id would legitimise the violation in writing.
- **Zorlama:** `scripts/docs/gen-pipelines.ts` throws on any `model:` key in a pipeline YAML; plus CI grep: `grep -rnE '^\s*model(_id)?:' registry/pipelines/ && exit 1`.

#### `cli-reference-generated` · BLOCKING

`docs/reference/cli.md` MUST be generated by introspecting the command definition objects in `packages/cli/src/commands/`, and every command MUST carry a `description` and at least one `example` field, or generation fails.

- **Neden:** The founder and agents both discover the command surface here; an undocumented flag is a flag nobody uses, and a documented flag that was removed is a failed agent run.
- **Zorlama:** `scripts/docs/gen-cli.ts` iterates the exported command registry and throws on missing `description`/`examples`; drift gate catches removals.

#### `adr-madr-4` · BLOCKING

Every ADR MUST be a MADR 4.0.0 document at `docs/decisions/NNNN-title-with-dashes.md`, with YAML frontmatter keys `status`, `date`, `decision-makers` and the headings `## Context and Problem Statement`, `## Considered Options`, `## Decision Outcome` present; `## Decision Drivers`, `### Consequences`, `### Confirmation`, `## Pros and Cons of the Options`, `## More Information` are optional.

- **Neden:** A free-form decision note omits the alternatives, which is exactly the part the founder needs in eight months when re-litigating the choice.
- **Zorlama:** `scripts/docs/check-adr.ts` validates filename regex `^\d{4}-[a-z0-9-]+\.md$`, frontmatter against an ajv JSON Schema, and required-heading presence. Optionally also markdownlint MD043 `required-headings` scoped to `docs/decisions/**` via `.markdownlint-cli2.jsonc` overrides.

#### `adr-numbering-immutable` · BLOCKING

ADR numbers MUST be allocated strictly monotonically and never reused; the body of an ADR whose `status` is `accepted` MUST NOT be edited afterwards — only the `status` line and an appended `Superseded by [ADR-NNNN](NNNN-....md)` link under `## More Information` may change.

- **Neden:** ADRs are a decision *history*; editing an accepted ADR erases the reasoning that a future reader needs to judge whether the context still holds.
- **Zorlama:** Pre-push hook (lefthook) runs `scripts/docs/check-adr-immutability.ts`: for each changed file under `docs/decisions/` whose committed `status` is `accepted`, `git diff` must touch only the `status:` frontmatter line or lines under `## More Information`; otherwise exit 1. Gaps/duplicates in NNNN also fail.

#### `adr-status-enum` · BLOCKING

`status` MUST be one of exactly `proposed`, `accepted`, `rejected`, `deprecated`, `superseded`; a `superseded` ADR MUST link to its successor and the successor MUST link back with `Supersedes [ADR-NNNN]`.

- **Neden:** Without a closed enum and a bidirectional link, an agent reading `docs/decisions/` cannot tell which decision is currently in force and will cite a dead one.
- **Zorlama:** ajv enum in `scripts/docs/check-adr.ts`; a second pass asserts link symmetry across the whole `docs/decisions/` set.

#### `adr-required-triggers` · BLOCKING

An ADR is MANDATORY before merging any change that: adds/removes/renames one of the 8 kernel verbs, adds a runtime dependency to `packages/kernel`, changes a Ring boundary, changes the rendering engine or its three modes, changes the free/premium lane contract, or adds a provider capability name.

- **Neden:** These are the decisions that are expensive to reverse and that a solo maintainer will otherwise make silently at 2am and forget by Friday.
- **Zorlama:** PR/commit checklist item plus CI: if `git diff --name-only origin/main...` touches `packages/kernel/src/verbs/`, `packages/kernel/package.json`, `packages/render/`, or `registry/capabilities.yaml`, then the same diff MUST add a file under `docs/decisions/`; else exit 1.

#### `adr-code-backref` · BLOCKING

Code that exists because of an ADR MUST carry a comment of the exact form `// ADR-NNNN: <one-line reason>` on the construct it governs, and every `ADR-NNNN` referenced anywhere in the repo MUST resolve to an existing, non-`rejected` ADR file.

- **Neden:** Otherwise a refactor deletes the only implementation of a decision and nothing anywhere notices that the ADR is now fiction.
- **Zorlama:** CI: `grep -rhoE 'ADR-[0-9]{4}' --include='*.ts' --include='*.md' . | sort -u` cross-checked against `ls docs/decisions/` by `scripts/docs/check-adr-refs.ts`; unresolved id or reference to a `rejected` ADR fails the build.

#### `stable-explicit-anchors` · BLOCKING

Every heading in `docs/explanation/constitution.md`, `ROADMAP.md` and any doc that is cross-referenced MUST carry an explicit custom anchor of the form `## 4.3 Provider descriptors {#s-4-3}`; auto-generated slugs MUST NOT be linked to.

- **Neden:** GitHub-style slugs are derived from heading text, so a wording fix silently breaks every inbound link; an explicit anchor survives rewording, renumbering and translation.
- **Zorlama:** `scripts/docs/check-anchors.ts` requires `/\{#[a-z0-9-]+\}$/` on every heading in the anchored file list; markdownlint MD051 (`link-fragments`) validates that all in-repo fragment links resolve, and it understands `{#custom-id}` syntax.

#### `anchors-immutable-tombstones` · BLOCKING

A custom anchor id, once committed, MUST NOT be changed or deleted; a removed section MUST leave an entry in `docs/reference/anchors-retired.md` (generated) stating the anchor, the commit that retired it, and its replacement anchor.

- **Neden:** Roadmap items, ADRs and code comments reference sections by anchor; a deleted anchor turns those references into silent lies rather than loud errors.
- **Zorlama:** `scripts/docs/check-anchors.ts` diffs the anchor set against `docs/reference/anchors.json` (generated, committed); any anchor that disappeared without a tombstone row fails CI.

#### `no-bare-section-numbers` · BLOCKING

Prose MUST NOT reference a section by bare number (`see 4.3`, `per section 4.3`); it MUST use a markdown link, e.g. `[§4.3](explanation/constitution.md#s-4-3)`.

- **Neden:** A bare number is unverifiable by any tool and goes stale the moment sections are renumbered; a link is checkable by lychee and MD051.
- **Zorlama:** CI grep: `grep -rnEi '(see|per|bkz\.?) +(section +)?[0-9]+\.[0-9]+' docs/ *.md` must return no hits outside code fences. Severity WARN for the first month, then BLOCKING.

#### `link-check-lychee` · BLOCKING

`pnpm docs:check` MUST run lychee in offline mode with fragment checking over all markdown, and MUST fail on any broken local link or anchor; external URLs are checked in a separate, non-blocking weekly job.

- **Neden:** Internal link rot breaks the founder's navigation and an agent's ability to follow a pointer file to its reference subdirectory; external rot is noise that should never block a local commit.
- **Zorlama:** `lychee.toml` with `offline = true`, `include_fragments = "full"`, `cache = true`, `max_cache_age = "2d"`, `extensions = ["md"]`, `exclude_path` for `derived/`. Local: `lychee --config lychee.toml .`. Weekly external pass: same config with `offline = false` and `--accept-timeouts`, non-blocking.

#### `markdownlint-config` · BLOCKING

All markdown MUST pass markdownlint-cli2 with, at minimum, MD001 (heading-increment), MD024 `siblings_only: true` (no-duplicate-heading), MD034 (no-bare-urls), MD042 (no-empty-links), MD047 (single-trailing-newline) and MD051 (link-fragments) enabled; MD013 (line-length) is enabled with `line_length: 120`, `tables: false`, `code_blocks: false`.

- **Neden:** Duplicate headings silently collide anchors, bare URLs defeat link checking, and unbounded line length makes diffs unreviewable for a solo maintainer.
- **Zorlama:** `.markdownlint-cli2.jsonc` at repo root; `pnpm docs:lint` = `markdownlint-cli2 "**/*.md" "#node_modules" "#derived"`; run in CI and in the lefthook pre-commit hook.

#### `verified-at-stamps` · BLOCKING

Any doc paragraph stating a volatile external fact (a price, a platform limit, an aspect ratio, an API behaviour) MUST live in a file whose frontmatter carries `verifiedAt: YYYY-MM-DD`, `verifyEvery: <N>d` and `sources: [<url>, ...]`; volatile facts in files without these keys are forbidden.

- **Neden:** Instagram safe-zone dimensions and model pricing change without notice; an unstamped fact is indistinguishable from a fact verified this morning, so nobody ever rechecks it.
- **Zorlama:** ajv schema `schemas/doc-frontmatter.json` applied by `scripts/docs/check-frontmatter.ts`; CI grep for currency/dimension patterns (`/[$₺€]\s?\d|\d+\s?x\s?\d+\s?px|\d+\s?(saniye|seconds)/`) in files lacking `verifiedAt` fails the build.

#### `docs-doctor-staleness` · WARN

`pnpm docs:doctor` MUST report every file whose `verifiedAt + verifyEvery` is in the past, every ADR in `proposed` status older than 30 days, and every `docs/how-to/` runbook not touched in 180 days; it MUST run weekly and MUST exit non-zero when anything is more than 30 days overdue.

- **Neden:** Rot is a scheduling problem, not a willpower problem; a solo operator needs the repo to nag, not to be nagged.
- **Zorlama:** `scripts/docs/doctor.ts`; scheduled locally via the command centre's run queue (or a `cron`/systemd timer) and additionally invoked by `pnpm docs:check` with `--warn-only` so it appears in every commit's output.

#### `agents-md-single-entrypoint` · BLOCKING

`AGENTS.md` at the repo root is the ONLY hand-written agent-instruction file at root and MUST be ≤200 lines; it contains build/test/lint commands, the four-ring rules, the propose-vs-apply rule, and pointers — never brand copy, never Turkish content, never provider prices, never secrets.

- **Neden:** AGENTS.md is loaded in full every session by every agent; every line of brand copy in it is a line of context tax paid on every unrelated task.
- **Zorlama:** `wc -l AGENTS.md` ≤ 200 in `scripts/docs/check-doc-size.ts`; secret scan (`gitleaks` or a CI grep for `sk-`, `AKIA`, `api_key`) over `AGENTS.md`, `CLAUDE.md`, `.claude/rules/**`, `.claude/skills/**`.

#### `claude-md-imports-agents` · BLOCKING

`CLAUDE.md` MUST consist of the single line `@AGENTS.md` followed only by Claude-Code-specific instructions, and MUST itself stay ≤200 lines; instructions MUST NOT be duplicated between the two files.

- **Neden:** Claude Code reads CLAUDE.md, not AGENTS.md; duplicating content produces two files that drift, and Anthropic's own guidance targets under 200 lines per CLAUDE.md because longer files reduce adherence.
- **Zorlama:** `scripts/docs/check-agent-docs.ts`: assert `head -1 CLAUDE.md` equals `@AGENTS.md`, assert `wc -l` ≤ 200, and assert no line >60 chars appears verbatim in both files.

#### `path-scoped-rules` · CONVENTION

Any instruction that applies to only one ring or package MUST live in `.claude/rules/<topic>.md` with a `paths:` frontmatter glob (e.g. `packages/kernel/**/*.ts`), NOT in AGENTS.md or CLAUDE.md; each rules file stays ≤120 lines and covers one topic.

- **Neden:** Path-scoped rules load only when the agent touches matching files, so kernel invariants cost zero tokens during a Tailwind tweak.
- **Zorlama:** `scripts/docs/check-agent-docs.ts`: every `.claude/rules/*.md` must have valid YAML frontmatter with a non-empty `paths` array (except a documented allowlist of always-on rules) and ≤120 lines; ajv-validated against `schemas/claude-rule.json`.

#### `skill-md-limits` · BLOCKING

Every `SKILL.md` MUST satisfy: `name` ≤64 chars, lowercase alphanumerics and single hyphens only, not starting/ending with a hyphen, identical to its parent directory name; `description` non-empty and ≤1024 chars stating both what it does and when to use it; body ≤500 lines; reference files exactly one level deep under `references/`.

- **Neden:** These are the published Agent Skills spec limits — violating them means the skill fails validation on upload and, more practically, a >500-line body blows the ~5k-token activation budget.
- **Zorlama:** `scripts/docs/check-skills.ts` enforcing all five constraints, plus `skills-ref validate ./<skill>` from the agentskills reference library where available. BLOCKING in `pnpm docs:check`.

#### `skills-are-procedures` · BLOCKING

A `SKILL.md` MUST describe a repeatable procedure (how to render a deck, how to run the safe-zone inspector); it MUST NOT contain facts that exist in the registry or corpus — those are referenced by path, never copied.

- **Neden:** Copied facts are the fastest rot vector: the YAML changes, the skill keeps instructing the agent with last quarter's cost formula.
- **Zorlama:** CI grep over `.claude/skills/**/SKILL.md` for provider names, model ids, price literals and Turkish brand strings; any hit fails with a message pointing at the registry path to reference instead.

#### `no-volatile-in-loaded-context` · BLOCKING

Files loaded into agent context at startup (`AGENTS.md`, `CLAUDE.md`, always-on `.claude/rules/*.md`) MUST NOT contain model ids, prices, API keys, dated facts, or directory listings the agent can derive by reading the filesystem.

- **Neden:** Startup context is the most expensive real estate in the repo and the least likely to be re-read critically; a stale model id there poisons every session.
- **Zorlama:** `scripts/docs/check-agent-docs.ts` greps those files for `/claude-|gpt-|gemini-|flux-|\bv\d+\.\d+\b|[$₺€]\s?\d/` and for tree-like blocks (`├──`), failing on any hit.

#### `llms-txt-generated` · CONVENTION

If and when docs are served over HTTP by the local command centre, `/llms.txt` MUST be generated (never hand-written) and MUST follow the llms.txt v2 shape: one H1 with the project name, a blockquote summary, optional non-heading prose, then H2-delimited lists of `[name](url): notes` links, with skippable material under an `## Optional` H2.

- **Neden:** The spec's value is the Optional section: it tells a context-constrained agent exactly what it may skip, which is the whole point for a repo this size.
- **Zorlama:** `scripts/docs/gen-llms-txt.ts` emits it from the docs tree; `scripts/docs/check-llms-txt.ts` asserts exactly one H1, a blockquote on the line after it, no H3+, and that every link resolves (lychee). Covered by the drift gate.

#### `doc-size-ceilings` · BLOCKING

Hard line ceilings, enforced per file type: `AGENTS.md` 200, `CLAUDE.md` 200, `.claude/rules/*.md` 120, `SKILL.md` 500, `docs/explanation/*.md` 400, `docs/how-to/*.md` 250, `docs/decisions/*.md` 150, `ROADMAP.md` 300; `docs/reference/**` is exempt because it is generated and read by search, not by load.

- **Neden:** Every hand-written doc over its ceiling is a doc an agent will truncate or skim, and a doc the founder will stop updating.
- **Zorlama:** `scripts/docs/check-doc-size.ts` with the ceiling table hardcoded; runs in `pnpm docs:check` and in the lefthook pre-commit hook. Exit non-zero listing file, actual lines, ceiling.

#### `pointer-file-pattern` · CONVENTION

When a doc exceeds its ceiling it MUST be split into a pointer file that keeps the ceiling and a sibling subdirectory of detail files (`docs/how-to/rendering.md` + `docs/how-to/rendering/*.md`); the pointer file MUST list every child with a one-line 'read this when…' description.

- **Neden:** This is the progressive-disclosure pattern that makes Skills work, applied to human docs: cheap index always, expensive detail on demand.
- **Zorlama:** `scripts/docs/check-pointers.ts`: for every `docs/**/<name>/` directory there must exist `docs/**/<name>.md`, and every `.md` in that directory must be linked from it exactly once.

#### `docs-english-corpus-turkish` · BLOCKING

Every file under `docs/`, `AGENTS.md`, `CLAUDE.md`, `.claude/**` and all code comments MUST be in English; Turkish appears only inside `corpus/**` record bodies, inside quoted example strings, and in the `tr` column of the generated glossary.

- **Neden:** Schema keys, directories and code are already English; mixed-language instruction files degrade agent adherence and make grep useless.
- **Zorlama:** `scripts/docs/check-language.ts` flags files under `docs/` containing Turkish-specific characters (`ğşıçöüĞŞİÇÖÜ`) outside fenced code blocks, inline code spans, and lines tagged `<!-- lang:tr -->`. BLOCKING.

#### `lexicon-single-source` · BLOCKING

`registry/lexicon.yaml` is the single source of bilingual terminology; each entry MUST have `en`, `tr`, `definition_en`, `definition_tr`, and `forbidden_tr` (calques to reject). `docs/reference/glossary.md` is generated from it and MUST NOT be edited.

- **Neden:** Without one lexicon, the same concept becomes 'varyant', 'seçenek' and 'alternatif' across three pipelines, and generated Turkish copy stops sounding like one brand.
- **Zorlama:** ajv schema `schemas/lexicon.json`; `scripts/docs/gen-glossary.ts` + drift gate; `scripts/docs/check-lexicon-coverage.ts` fails if any `type:` value used in `corpus/**` frontmatter has no lexicon entry.

#### `calque-blocklist` · WARN

Turkish prose in `corpus/**` MUST be linted against a Vale style whose `substitution` rules are generated from every `forbidden_tr` entry in `registry/lexicon.yaml`; a hit is a build warning that names the approved term.

- **Neden:** Calqued English ('optimize etmek', 'deploy etmek', 'case study') is the signature of machine-translated brand copy and is exactly what an agent will produce by default.
- **Zorlama:** `.vale.ini` with `StylesPath = styles`, a generated `styles/UpcytechTR/Calques.yml` of `extends: substitution` rules, `[corpus/**/*.md] BasedOnStyles = UpcytechTR`. Run `vale corpus/` in `pnpm docs:check`. Note Vale's NLP-based checks are English-only; only regex-based rule types are used for Turkish.

#### `spellcheck-bilingual` · WARN

cspell MUST run over all markdown with both an English and a Turkish dictionary enabled, and project-specific proper nouns MUST live in a committed `project-words.txt` rather than in inline `cspell:ignore` comments.

- **Neden:** Inline ignores scatter the vocabulary across 200 files so nobody can audit it; a single word list is reviewable and is itself a mini-glossary.
- **Zorlama:** `cspell.config.yaml` importing `@cspell/dict-tr-tr` and listing `dictionaryDefinitions: [{name: project-words, path: ./project-words.txt}]`; `pnpm docs:spell` = `cspell "**/*.md" --no-progress`. CI grep bans `cspell:ignore` in `docs/` and `corpus/`.

#### `changelog-handwritten` · BLOCKING

`CHANGELOG.md` MUST follow Keep a Changelog 1.1.0 — reverse-chronological releases, an `## [Unreleased]` section, and only the headings `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security` — and MUST be written for a human reader, never pasted from `git log`.

- **Neden:** Six months later the founder needs 'why did rendering change', which a commit list cannot answer; an auto-generated changelog is a git log with extra steps.
- **Zorlama:** `scripts/docs/check-changelog.ts`: assert `## [Unreleased]` exists, versions are in descending semver order with ISO dates, and every `###` heading is in the allowed set. Fails if the Unreleased section is empty while `git diff` since the last tag touched `packages/` or `registry/`.

#### `conventional-commits-scoped` · BLOCKING

Commit messages MUST follow Conventional Commits 1.0.0 with the scope restricted to the enum `kernel | registry | corpus | derived | ui | api | render | docs | ops`; the scope is the machine index into the changelog, not a replacement for it.

- **Neden:** Because agents propose on branches and the human applies, the commit is the apply event — a typed, ring-scoped commit makes it possible to answer 'what changed in Ring 0 this quarter' without reading diffs.
- **Zorlama:** `@commitlint/cli` with `scope-enum` rule in `commitlint.config.ts`, wired to a lefthook `commit-msg` hook; CI re-validates the range with `commitlint --from origin/main --to HEAD`.

#### `changelog-draft-not-autocommit` · CONVENTION

A changelog generator (git-cliff) MAY produce a draft into `.tmp/changelog-draft.md`, but MUST NOT write `CHANGELOG.md` directly; the human edits the draft into the Unreleased section as part of the release commit.

- **Neden:** Auto-committed changelogs train the maintainer to stop reading them, which defeats the only purpose of having one.
- **Zorlama:** `pnpm changelog:draft` writes only to `.tmp/`; CI fails if `CHANGELOG.md` is modified by a commit whose author is a bot or whose message contains `chore(release): auto`.

#### `doc-frontmatter-schema` · BLOCKING

Every markdown file under `docs/` MUST carry YAML frontmatter validated against `schemas/doc-frontmatter.json`, requiring `title`, `kind` (`tutorial|how-to|reference|explanation|decision`), and `updated` (ISO date); `kind` MUST match the file's directory.

- **Neden:** Typed frontmatter is what lets the doctor job, the generators and the agent-facing index reason about docs without parsing prose.
- **Zorlama:** `scripts/docs/check-frontmatter.ts` using ajv 8; runs in `pnpm docs:check`. Mismatched `kind`/directory is a hard failure.

#### `brand-book-is-corpus` · BLOCKING

The brand book MUST live as Ring 2 corpus records (`corpus/brand/*.md` with YAML frontmatter, Turkish body), not as a document under `docs/`; `docs/reference/brand-book.md` is generated from those records for reading convenience only.

- **Neden:** Brand rules are data the pipelines consume; if they live as prose in docs/, agents will paraphrase them instead of loading them, and the two copies will diverge.
- **Zorlama:** CI: `test ! -f docs/explanation/brand-book.md`; generator `scripts/docs/gen-brand-book.ts` plus the generated-banner and drift-gate rules.

#### `roadmap-references-constitution` · BLOCKING

Every roadmap item MUST link to at least one constitution anchor or ADR it advances, using the `[§4.3](docs/explanation/constitution.md#s-4-3)` form; roadmap items MUST NOT restate constitutional rules in their own words.

- **Neden:** A roadmap that paraphrases the constitution becomes a competing source of truth, and the paraphrase is the version that goes stale.
- **Zorlama:** `scripts/docs/check-roadmap.ts`: every `- [ ]`/`- [x]` bullet at list depth 0 must contain at least one link matching `constitution\.md#s-` or `docs/decisions/\d{4}-`; lychee validates the fragments resolve.

#### `docs-check-is-one-command` · BLOCKING

`pnpm docs:check` MUST run, in order: generate + drift diff, frontmatter schema, doc-size ceilings, agent-doc checks, skills validation, anchors, ADR checks, markdownlint, cspell, vale, lychee offline — and MUST be the only documentation command anyone needs to remember.

- **Neden:** A solo maintainer will run one command; ten separate scripts means nine of them never run and rot goes undetected.
- **Zorlama:** Defined in root `package.json` scripts; lefthook `pre-push` runs it; CI runs the identical command so local and CI results cannot diverge.



### Kalemler (22)

| Ad | Tür | Ne | Erişim | Maliyet | Karar |
|---|---|---|---|---|---|
| MADR |  | Markdown Architectural Decision Records template and conventions |  |  | ADOPT — 4.0.0 is the current stable release |
| Diátaxis |  | Four-quadrant documentation taxonomy (tutorial / how-to / reference / explanation) |  |  | ADOPT with two additions — it has no quadrant for decisions or plans |
| AGENTS.md |  | Open convention for a repo-root agent instruction file |  |  | ADOPT as the single agent entrypoint |
| Agent Skills spec (SKILL.md) |  | Open spec for skill folders: frontmatter, limits, progressive disclosure |  |  | ADOPT — these limits are hard constraints, not style advice |
| Claude Code CLAUDE.md + .claude/rules/ |  | Claude-specific memory files and path-scoped rule files |  |  | ADOPT — path-scoped rules are the token-cost answer |
| llms.txt |  | Convention for an agent-readable index file at a site or path root |  |  | TRIAL — only once the command centre serves docs over HTTP |
| markdownlint-cli2 |  | Markdown linter with the MD### rule set |  |  | ADOPT — 0.23.2 (2026-07-27), library markdownlint 0.41.1 |
| lychee |  | Fast async link checker (Rust) for markdown/HTML, with anchor-fragment checking |  |  | ADOPT — lychee-v0.24.2 (2026-05-01); lychee-action v2.9.0 (2026-07-09) |
| Vale |  | Configurable prose linter with regex and NLP-based rule types |  |  | ADOPT for English docs; TRIAL for Turkish (regex rules only) |
| cspell + @cspell/dict-tr-tr |  | Spell checker for code and prose, with a Turkish dictionary bundle |  |  | ADOPT — cspell 10.0.1 (2026-05-31), @cspell/dict-tr-tr 3.0.6 (2025-07-19) |
| TypeDoc |  | Generates HTML or a JSON model from TypeScript exports and TSDoc comments |  |  | TRIAL — use the JSON model, not the HTML site |
| Astro Starlight |  | Documentation site framework for Astro |  |  | HOLD — do not add a second frontend stack |
| json-schema-static-docs |  | Generates markdown documentation from JSON Schema files |  |  | AVOID — 0.28.1 last published 2025-01-03 and its docs site returns 404 |
| Zod + ajv |  | Runtime schema definition (Zod) and JSON Schema validation (ajv) for docs frontmatter and registry YAML |  |  | ADOPT — zod 4.4.3 (2026-05-04), ajv 8.20.0 (2026-04-24) |
| commitlint |  | Enforces Conventional Commits and a scope enum on commit messages |  |  | ADOPT — @commitlint/cli 21.2.2 (2026-08-13); spec pinned at Conventional Commits 1.0.0 |
| Keep a Changelog |  | Hand-written changelog format and section vocabulary |  |  | ADOPT — 1.1.0 is current |
| git-cliff |  | Generates changelog entries from Conventional Commits |  |  | TRIAL — v2.13.1 (2026-04-26) — as a draft generator only |
| lefthook |  | Fast polyglot git hooks manager |  |  | ADOPT — 2.1.10 (2026-07-08) |
| @changesets/cli |  | Versioning and changelog tool for multi-package monorepos |  |  | AVOID for this repo — 3.0.0 (2026-08-11), healthy but wrong shape |
| markdown-magic |  | Injects generated content into markdown between comment markers |  |  | TRIAL — 4.11.0 (2026-06-29) |
| doctoc |  | Generates a table of contents into markdown files |  |  | HOLD — 2.5.0 (2026-06-12) |
| Redocly CLI |  | Lints OpenAPI descriptions and generates API reference docs |  |  | TRIAL — 2.46.1 (2026-08-11) — only if the Hono API gets an OpenAPI description |

<details><summary>Notlar</summary>

**MADR** — Verified 2026-08-14: latest release tag is 4.0.0, published 2024-09-17; no 5.x exists. Template frontmatter keys: status, date, decision-makers, consulted, informed. Headings: Context and Problem Statement, Decision Drivers, Considered Options, Decision Outcome (with Consequences and Confirmation subsections), Pros and Cons of the Options, More Information. Filenames NNNN-title-with-dashes.md in docs/decisions/. `bare` and `minimal` template variants exist in template/ — use `adr-template-minimal.md` as the working template for a solo repo.

**Diátaxis** — Use it for docs/, but add docs/decisions/ (ADRs) and root ROADMAP.md/CHANGELOG.md outside the quadrants. Do not try to force the constitution into 'reference'; it is normative explanation.

**AGENTS.md** — Verified: plain markdown, no required sections, nearest-file-wins in monorepos, explicit user prompts override it. Claimed adoption >60,000 open-source projects. Claude Code does NOT read AGENTS.md directly — a CLAUDE.md containing `@AGENTS.md` (or a symlink) is required.

**Agent Skills spec (SKILL.md)** — Verified limits: name 1–64 chars, lowercase a-z0-9 and hyphens, no leading/trailing/consecutive hyphens, must match parent directory name. description 1–1024 chars. Optional fields: license, compatibility (≤500 chars), metadata (string map), allowed-tools (experimental). Progressive disclosure: metadata ~100 tokens always loaded, SKILL.md body <5000 tokens recommended and ≤500 lines, resources loaded on demand. Keep file references one level deep. Validate with `skills-ref validate`.

**Claude Code CLAUDE.md + .claude/rules/** — Verified: target under 200 lines per CLAUDE.md ('longer files consume more context and reduce adherence'). `@path` imports load at launch (no token saving) with max depth 4 hops. `.claude/rules/*.md` with `paths:` glob frontmatter load only when Claude reads matching files. Block-level HTML comments in CLAUDE.md are stripped before injection — useful for maintainer notes at zero token cost. Nested CLAUDE.md and path-scoped rules are NOT re-injected after /compact.

**llms.txt** — Verified: this is now v2 of the proposal, 'updated based on what I learned from two years of adoption'. Structure: optional BOM, required H1 (only required section), blockquote summary, zero or more non-heading sections, then H2-delimited link lists of `[name](url)` optionally followed by `: notes`. The `## Optional` H2 marks links an agent may skip for shorter context. Can live at any path, most specific wins. Zero value for a purely local repo — AGENTS.md covers that case.

**markdownlint-cli2** — Key rules verified: MD001 heading-increment, MD013 line-length (params line_length/heading_line_length/code_block_line_length/tables/code_blocks/strict/stern, default 80), MD024 no-duplicate-heading (siblings_only), MD034 no-bare-urls, MD042 no-empty-links, MD043 required-headings (params headings/match_case — use for ADR structure), MD047 single-trailing-newline, MD051 link-fragments (params ignore_case/ignored_pattern). MD051 explicitly understands `{#custom-id}` heading anchors and HTML `id`/`name` anchors — this is what makes the stable-anchor rule enforceable.

**lychee** — Verified from lychee.example.toml: `include_fragments = "full"` enables anchor and text-fragment checking; `offline = true` restricts to local files; `cache = true` + `max_cache_age`; `exclude_path` (regex), `extensions`, `require_https`, `base_url`, `root_dir`, `fallback_extensions`, `include_wikilinks`, `host_concurrency`, `suggest` (Wayback replacements). Config file `lychee.toml`. Pin the action by commit SHA if used in GitHub Actions.

**Vale** — Verified: v3.17.1 published 2026-08-05; repo has moved to github.com/vale-cli/vale and is actively pushed (2026-08-14). Use `extends: substitution` and `extends: existence` rules for the Turkish calque blocklist — these are pure regex and language-agnostic. Vale's spelling and readability checks depend on English NLP (the `prose` library) and should NOT be pointed at Turkish text.

**cspell + @cspell/dict-tr-tr** — The Turkish dictionary is a separate package and is maintained but less frequently updated than cspell core. Keep project proper nouns in a committed project-words.txt rather than inline `cspell:ignore` comments so the vocabulary is auditable. `cspell-cli` 10.0.1 is the standalone CLI package.

**TypeDoc** — 0.28.20 (2026-07-05), healthy. For this repo the valuable output is `--json`: feed it into your own markdown generator for docs/reference/kernel-api.md so the kernel's 8 verbs and ~10 concepts are documented from source. The default HTML site is a second UI nobody will open next to the command centre.

**Astro Starlight** — 0.41.7 (2026-08-05), very actively maintained, but it pulls in Astro (0.41.0 targets Astro 7) alongside your existing Vite+React SPA. For a solo repo where docs are read in the editor and by agents, plain markdown plus the command centre's own reader is cheaper. Revisit only if docs must be published publicly.

**json-schema-static-docs** — Verified 2026-08-14: npm latest 0.28.1 dated 2025-01-03; https://tomdoherty.github.io/json-schema-static-docs/ returns HTTP 404. Write a ~150-line generator against your own JSON Schema output instead — you control the output shape, which matters because the schema reference is read by agents, not browsers.

**Zod + ajv** — Emit JSON Schema from the kernel's Zod schemas and generate docs/reference/schema/ from that, so one definition drives validation, the derived index and the docs. Use ajv for validating doc frontmatter, ADR frontmatter and .claude/rules frontmatter. zod-to-json-schema 3.25.2 exists but Zod 4 ships its own JSON Schema conversion — prefer built-in over the extra dependency.

**commitlint** — Use `scope-enum` restricted to the ring/package vocabulary. The spec is stable at 1.0.0 — verified, no 2.0. Commits are the apply events in the propose/apply model, so typed commits are the cheapest decision index you will ever get.

**Keep a Changelog** — Verified: sections Added, Changed, Deprecated, Removed, Fixed, Security; Unreleased section at top; reverse-chronological; ISO dates. Its explicit thesis — 'don't let your friends dump git logs into changelogs' — is the right call for a solo operator who reads the changelog for intent, not for commit archaeology.

**git-cliff** — Point it at a scratch file (.tmp/changelog-draft.md) that the human edits into CHANGELOG.md. Never let it write CHANGELOG.md directly; auto-committed changelogs stop being read within two releases.

**lefthook** — Run the cheap checks (markdownlint, doc-size ceilings, commitlint) on pre-commit/commit-msg and the full `pnpm docs:check` on pre-push. husky 9.1.7 has not been published since 2024-11 — lefthook is the better-maintained choice and handles parallel execution natively.

**@changesets/cli** — Designed for publishing many packages to npm with independent versions. This is a private single-product workspace with one release cadence; Changesets adds a ceremony file per change with no consumer to serve.

**markdown-magic** — Useful if you want generated tables inside otherwise hand-written files. Prefer whole-file generation with a DO-NOT-EDIT banner where possible; partial injection makes the drift gate harder to reason about because the same file is half-owned by a human. embedme (1.22.1, last published 2022-09) is effectively unmaintained — avoid.

**doctoc** — It generates TOC links from auto-derived slugs, which fights the explicit `{#s-4-3}` anchor rule. If you want a TOC in the constitution, generate it from your own anchor registry so the TOC and the anchors share one source.

**Redocly CLI** — Relevant only for docs/reference/api.md. If the Hono server exposes an OpenAPI document (e.g. via @hono/zod-openapi), Redocly gives you a generated, lintable API reference for free; otherwise skip it entirely.

</details>


### Doğrulanmamış

- Vale's exact behaviour on Turkish text: I verified Vale v3.17.1 (2026-08-05, repo now vale-cli/vale, actively pushed) and that it has regex-based rule types, but I did NOT verify from primary docs which specific rule `extends:` values are safe for non-English text. Treat 'substitution and existence are language-agnostic, NLP-based checks are English-only' as a strong inference from Vale's use of the English `prose` NLP library, not a quoted guarantee — test it on a sample corpus file before making it BLOCKING.
- The exact cspell config key for importing @cspell/dict-tr-tr. Package existence and version (3.0.6, 2025-07-19) are verified from the npm registry; the conventional import path string (`@cspell/dict-tr-tr/cspell-ext.json` under `import:`) was NOT read from that package's README this session. Check the package's own docs before pasting.
- Whether lychee's CLI flag for fragment checking is exactly `--include-fragments` with the same `full` value as the TOML key. I verified the config key `include_fragments = "full"` verbatim from lychee.example.toml on master, and the full `--help` output was indexed but I did not read the fragment flag line directly. Confirm with `lychee --help | grep -i fragment`.
- Zod 4's built-in JSON Schema conversion API name (`z.toJSONSchema()`). I verified zod is at 4.4.3 (2026-05-04) and that zod-to-json-schema 3.25.2 still exists, but I did not read the Zod 4 docs page for the built-in converter's exact signature. Verify before writing the emitter.
- `skills-ref validate` availability as an installable binary. The agentskills.io specification page names it and links to github.com/agentskills/agentskills/tree/main/skills-ref, but I did not confirm a published package or its install command, and the GitHub releases API returned nothing for agentskills/agentskills.
- markdownlint MD043 (required-headings) semantics for OPTIONAL headings. I verified the rule exists with `headings` and `match_case` parameters, but did not verify the wildcard syntax (e.g. `*` / `+`) needed to express MADR's optional sections. If the syntax cannot express optionality, keep ADR heading validation in the custom script only.
- Whether markdownlint MD051's `{#custom-id}` support applies to all heading levels and to CommonMark without a specific flavor flag. The rule doc describes the syntax and HTML anchors as supported; I did not test it. Run it against a fixture before making the stable-anchor rule BLOCKING.
- AGENTS.md adoption number (>60,000 open-source projects) is a claim from agents.md itself, not independently verified. It is used here only as evidence of ecosystem breadth, not as a load-bearing fact.
- No primary source was found for a maximum SKILL.md file-size in bytes (as opposed to the ≤500-line / <5000-token recommendations). Treat 500 lines as the enforceable ceiling; there may be additional hard limits on the Skills API upload path that I did not check.
- Turkish calque examples for the lexicon blocklist (`forbidden_tr`) are the founder's call — I deliberately did not invent a list, since prescribing wrong Turkish would be worse than prescribing none. The mechanism is verified; the vocabulary must be authored locally.
- The exact scheduling mechanism for the weekly docs:doctor run. I described cron/systemd/the command centre's own run queue as options but verified none of them against this machine's setup.


### Anti-desenler

- The 'living document' constitution. Someone edits section 4.3's heading text to be clearer, the auto-generated slug changes from #provider-descriptors to #provider-descriptors-and-cost-formulas, and every roadmap link, ADR citation and code comment pointing at it dies silently — because nothing checks fragments unless you turn on MD051 and lychee include_fragments. Symptom: months later an agent follows a link, lands at the top of a 400-line file, and confidently summarizes the wrong section.
- Copying the provider table into AGENTS.md 'so the agent doesn't have to read the YAML'. It works for three weeks. Then a price changes, the YAML is updated, AGENTS.md is not, and every single session for the next quarter starts with a wrong cost model loaded into context at position zero. Symptom: cost estimates shown before a run disagree with the invoice.
- Diátaxis applied literally, with no home for decisions or plans. The constitution gets filed under 'reference' (it is not — reference is generated), the roadmap under 'explanation', and ADRs get scattered into explanation/ where they are edited like ordinary docs. Symptom: an accepted ADR quietly rewritten to match what was actually built, destroying the record of what was considered and rejected.
- Editing an accepted ADR instead of superseding it. It feels tidier. It deletes the exact information — the alternatives, the drivers, the context that no longer holds — that made the ADR worth writing. Symptom: eight months later you re-propose the option you already rejected, because the reason is gone.
- Skills as fact dumps. A skill called 'instagram-rendering' accumulates safe-zone pixel values, aspect ratios and a provider price table, because it is convenient. Now the same facts live in registry YAML, in the skill, and in the brand book. Symptom: three answers to 'what is the story safe zone', and the agent picks whichever it loaded most recently.
- SKILL.md that quietly exceeds its budget. Nothing errors — the body is just long. At ~800 lines it is eating most of the activation budget every time it triggers, crowding out the actual task. Symptom: agent follows step 1-3 of the skill correctly and ignores steps 9-14. Enforce ≤500 lines mechanically; you will not notice by reading.
- Turkish creeping into instruction files. A runbook gains one Turkish sentence because it was faster to type. Then a heading. Then the file is bilingual, grep stops finding things, and the agent's adherence drops because half its instructions are in the content language rather than the instruction language. Symptom: agent starts answering in Turkish about code.
- The link checker that checks the internet. lychee is pointed at everything including external URLs, some rate-limited host 429s, the commit is blocked, and within two weeks the check is disabled with --fail=false. Symptom: link checking exists in the config and enforces nothing. Split it: offline+fragments blocks commits, external runs weekly and only warns.
- Auto-generated changelog. git-cliff writes CHANGELOG.md on every release, so it is a reformatted git log. The founder reads it once, finds it useless for answering 'why', and never opens it again — but it keeps being generated, so it looks maintained. Symptom: a changelog with 400 entries and zero explanations.
- Generated docs added to .gitignore because 'Ring 3 is derived'. Consistent, and wrong: now an agent must run a build to learn what providers exist, so it guesses instead. Symptom: agents inventing plausible provider names. Commit docs/reference/ and gate it with git diff --exit-code — that gets you both freshness and readability.
- verifiedAt stamps that are updated by the same script that reads them. Someone writes a 'refresh timestamps' helper; the doctor job goes green forever while the facts stay stale. The stamp must only be moved by a human who actually re-checked the cited source.
- Path-scoped rules with no `paths:` frontmatter. Rules files without the field load unconditionally, so a .claude/rules/ directory intended to save context ends up costing more than the CLAUDE.md it was extracted from. Symptom: startup context grows every time you 'modularize'.
