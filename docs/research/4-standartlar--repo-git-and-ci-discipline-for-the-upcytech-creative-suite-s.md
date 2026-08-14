# Repo, git and CI discipline for the Upcytech Creative Suite (solo maintainer + agent authors, four-ring architecture, local-first)

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Özet

This rulebook treats the repo as a two-author system: one human and a fleet of agents. Everything follows from that. Agents propose on disposable branches inside disposable worktrees; the human applies with a single squash commit onto a linear `main`. There is no develop branch, no release branch, no PR ceremony — trunk-based with a machine-generated proposal layer on top.

Branching: `main` is the only long-lived ref. Every agent run gets exactly one branch `agent/<pipeline>/<run_id>` (lowercase ULID) and exactly one worktree at `../.cs-worktrees/<run_id>` — outside the repo working tree, so ignore rules, glob scans and the derived index never see it. Worktrees are mandatory for any run that writes files, because two agents in one working tree corrupt each other's index. Cleanup is enforced by TTL, not discipline.

Commits: Conventional Commits 1.0.0 (verified spec), commitlint `config-conventional` type-enum minus `style` plus `corpus` and `registry`; scopes are the four rings plus module names, so `git log --oneline --grep '^feat(kernel)'` is a real query. Machine authorship is carried in git trailers (`Run-Id`, `Agent`, `Model`, `Cost-Usd`, `Proposed-By`, `Applied-By`) — parsed with `git interpret-trailers` / `%(trailers:key=...)`, not guessed from author name.

Committed vs ignored is decided by one test: "is this a contract or a cache?" JSON Schemas, pricing snapshots, sidecar JSON and the lockfile are contracts — committed. The SQLite FTS5 index, generated TypeScript and asset bytes are caches — ignored and rebuildable. Assets live in a content-addressed store keyed by sha256 with a committed sidecar; no Git LFS, ever. A staged-blob size gate stops bloat before it happens; `git filter-repo` is the documented break-glass if it doesn't.

CI is local by default: gates live in `scripts/gates/*.sh`, are invoked by lefthook (pre-commit fast, pre-push full) and by a weekly maintenance run. Any remote CI config may only call the same scripts. Golden typography tests compare metrics JSON, never pixels — pixels are binary and belong in the object store.


### Kurallar (44)

#### `trunk-only` · BLOCKING

`main` is the only long-lived branch; never create `develop`, `release/*`, or `staging` branches, and never merge anything into `main` that is not a fast-forward or a squash-apply commit.

- **Neden:** A solo maintainer with agent authors has no release train to coordinate. Long-lived branches guarantee that agent branches rebase onto stale corpus state and produce records referencing entities that no longer exist.
- **Zorlama:** `scripts/gates/branches.sh`: `git for-each-ref --format='%(refname:short)' refs/heads | grep -Ev '^(main|agent/|human/)' && exit 1`; plus `git log --merges main --not --first-parent` must be empty (asserts linear history).

#### `agent-branch-name` · BLOCKING

Every agent-written branch is named exactly `agent/<pipeline-slug>/<run_id>` where `<pipeline-slug>` is the Ring 1 pipeline id and `<run_id>` is a lowercase 26-char Crockford-base32 ULID; one run = one branch = one worktree, never reused.

- **Neden:** The branch name is the join key between git history, the run queue, the cost ledger and the derived provenance sidecars. Free-form names make `git log` unjoinable to run records, and a reused branch silently mixes two runs' proposals into one diff.
- **Zorlama:** lefthook `pre-commit` job `branch-name`: `git symbolic-ref --short HEAD | grep -Eq '^(main|human/[a-z0-9-]+|agent/[a-z0-9-]+/[0-9a-hjkmnp-tv-z]{26})$'`. The kernel's run executor refuses to start if `git rev-parse --abbrev-ref HEAD` does not equal the branch it computed for the run_id.

#### `agent-branch-ttl` · CONVENTION

An agent branch lives at most 14 days; unapplied branches older than that are deleted by the maintenance run without asking, and the run is re-runnable from its recipe instead of being resurrected.

- **Neden:** Proposals are cheap to regenerate and expensive to rebase. A month-old agent branch conflicts with everything and its cost estimate is priced against a stale pricing snapshot, so applying it is worse than re-running.
- **Zorlama:** `scripts/gates/prune-branches.sh` in the weekly `pnpm run maintain`: `git for-each-ref --format='%(refname:short) %(committerdate:unix)' refs/heads/agent | awk -v now=$(date +%s) '$2 < now-1209600 {print $1}' | xargs -r git branch -D`.

#### `worktree-per-run` · BLOCKING

Any agentic run that writes files MUST execute inside its own `git worktree add -b agent/<pipeline>/<run_id> <path> main`; running two agents against the same working tree is forbidden, and so is running an agent in the tree the human has open.

- **Neden:** git has one index per worktree. Two concurrent agents staging files in one tree interleave `.git/index` writes, and one agent's `git checkout`/`git stash` silently discards the other's uncommitted output. It also protects the human's dirty working tree from being reset by a pipeline.
- **Zorlama:** The run executor calls `git rev-parse --git-common-dir` and `--git-dir`; if they are equal (i.e. the main worktree) it aborts with `E_MAIN_WORKTREE`. `scripts/gates/no-parallel-main.sh` asserts `git worktree list --porcelain | grep -c '^worktree ' -le 1` before any non-worktree run.

#### `worktree-outside-repo` · BLOCKING

Worktrees live at `$(git rev-parse --show-toplevel)/../.cs-worktrees/<run_id>`, never inside the repository working tree, and `extensions.worktreeConfig` is enabled once (`git config extensions.worktreeConfig true`) so per-worktree settings use `git config --worktree`.

- **Neden:** A worktree nested inside the repo is walked by every glob, ripgrep pass, corpus validator, Vite watcher and the FTS5 indexer — producing duplicate records and a derived index that indexes itself. Ignoring it in .gitignore does not stop non-git tools. `extensions.worktreeConfig` (verified in git-config docs: `--worktree` writes `$GIT_DIR/config.worktree`) keeps run-scoped config from leaking into the main tree.
- **Zorlama:** `scripts/gates/worktree-location.sh`: `git worktree list --porcelain | awk '/^worktree /{print $2}' | grep -q "^$(git rev-parse --show-toplevel)/" && exit 1`. Plus `git config --get extensions.worktreeConfig` must be `true` in the doctor check.

#### `worktree-cleanup` · BLOCKING

The run executor removes its worktree in a `finally` block with `git worktree remove --force <path>`, and `pnpm run maintain` runs `git worktree prune --expire 3.days.ago` plus deletes any `.cs-worktrees/*` directory with no matching entry in `git worktree list --porcelain`.

- **Neden:** Crashed runs leave both a directory and an administrative entry under `.git/worktrees/<id>`; the stale entry makes `git worktree add` refuse the path and makes `git branch -D` refuse the branch ('checked out at ...'). Orphan directories also silently keep multi-GB rendered artifacts alive on disk.
- **Zorlama:** Unit test on the executor asserting the `finally` cleanup path is called on throw; `scripts/gates/worktree-orphans.sh` exits non-zero if `ls .cs-worktrees` and `git worktree list --porcelain` disagree; wired into the weekly maintenance run.

#### `writeset-lock` · BLOCKING

Every pipeline declares its write-set (glob list of paths it may create or modify) in its Ring 1 YAML, and the run queue refuses to start a run whose write-set intersects any in-flight run's write-set; agents that write outside their declared write-set fail the run.

- **Neden:** This is the only rule that actually prevents agent-branch conflicts. One-record-per-file plus disjoint write-sets means two agent branches physically cannot touch the same file, so the squash-apply of the second never conflicts with the first. Merge drivers only clean up after a collision; write-set locking prevents it.
- **Zorlama:** Kernel run queue holds an in-memory + on-disk lock table under `derived/locks/`; the executor diffs `git status --porcelain` at run end against the declared globs and fails on any out-of-set path. Schema validation asserts every pipeline YAML has a non-empty `write_set`.

#### `no-agent-commit-on-main` · BLOCKING

Agents never commit on `main`. Every commit whose message carries `Proposed-By: agent` must be on an `agent/*` branch, and every commit on `main` must carry `Applied-By: <human name and email>`.

- **Neden:** The 'agents propose, humans apply' invariant is worthless unless git can prove it after the fact. Without a trailer check, a misconfigured agent run silently writes brand-defining corpus records straight to the source of truth.
- **Zorlama:** lefthook `pre-commit` job `apply-gate`: on `main`, `git interpret-trailers --parse < "$1"` must yield an `Applied-By` token and must NOT yield `Proposed-By: agent`; on `agent/*`, the inverse. Audit query: `git log main --format='%h %(trailers:key=Applied-By,valueonly)' | grep -c '^\S* *$'` must be 0.

#### `squash-apply` · BLOCKING

Applying a proposal is `git merge --squash agent/<pipeline>/<run_id>` followed by one human `git commit` carrying the run's trailers; never `git merge --no-ff`, never `git cherry-pick` individual agent commits, never force-push `main`.

- **Neden:** Agent branches contain retry noise (three variants, two rollbacks, a failed render). Squashing gives one commit per applied run, so `git log --oneline main` reads as a list of decisions, and `git revert <sha>` cleanly undoes an entire run. Linear history also makes `git bisect` over corpus regressions usable.
- **Zorlama:** `scripts/apply.sh` is the only sanctioned path and performs the squash + trailer stamping. `scripts/gates/linear-history.sh`: `test -z "$(git rev-list --merges main)"`. `git config --local receive.denyNonFastForwards true` on the backup remote.

#### `conventional-commit-required` · BLOCKING

Every commit message follows Conventional Commits 1.0.0: `<type>(<scope>)!: <description>` with a required terminal colon+space, optional body one blank line after the description, and footers one blank line after the body using the `token: value` or `token #value` separator.

- **Neden:** The commit history is the changelog, the audit trail and the input to era release notes. Free-form messages make `git log --grep` and automatic changelog generation impossible, and this repo has no PR descriptions to fall back on.
- **Zorlama:** `commitlint` via lefthook `commit-msg`: `npx --no -- commitlint --edit $1`, with `@commitlint/config-conventional` extended in `commitlint.config.ts`.

#### `commit-type-enum` · BLOCKING

The allowed types are exactly: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `corpus`, `registry`. `style` is removed; `corpus` means a Ring 2 knowledge/content record change with no code, `registry` means a Ring 1 YAML change that alters runtime behaviour without code.

- **Neden:** `config-conventional` ships 11 types including `style`, which is meaningless when formatting is automatic and unstageable. The two added types let `git log --grep '^corpus'` answer 'what did we learn about the brand this month' without touching diffs, which is the question this repo exists to answer.
- **Zorlama:** `commitlint.config.ts`: `rules: { 'type-enum': [2, 'always', ['feat','fix','docs','refactor','perf','test','build','ci','chore','revert','corpus','registry']] }`.

#### `commit-scope-enum` · BLOCKING

Scope is required and drawn from a closed list tied to the four rings: `kernel`, `registry`, `corpus`, `derived`, `api`, `ui`, `render`, `providers`, `pipelines`, `channels`, `recipes`, `ops`, `repo`. Commit subjects and bodies are written in ENGLISH even though the content they describe is Turkish.

- **Neden:** Ring-named scopes make the architecture greppable (`git log --grep '^\w*(kernel)'` is the Ring 0 change log, which must be near-empty by design). English subjects keep commitlint's `subject-case` rules meaningful and avoid Turkish dotted/dotless-I casing breaking greps; the Turkish content itself lives in the corpus files the commit points at.
- **Zorlama:** `commitlint.config.ts`: `'scope-empty': [2,'never']`, `'scope-enum': [2,'always',[...]]`, `'header-max-length': [2,'always',72]`, `'subject-case': [2,'never',['start-case','pascal-case','upper-case']]`. A CI grep rejects non-ASCII in commit subject lines: `git log --format=%s <range> | LC_ALL=C grep -P '[^\x00-\x7F]' && exit 1`.

#### `run-id-trailer` · BLOCKING

Any commit that touches `corpus/**`, `registry/providers/_pricing/**` or an asset sidecar produced by a pipeline MUST carry a `Run-Id: <ulid>` trailer; on an `agent/*` branch the value must equal the run_id in the branch name.

- **Neden:** Six months later the only question that matters about a brand record is 'which run, which prompt, which model, at what cost produced this'. Without a Run-Id trailer, git history and the run ledger cannot be joined and the provenance of every published Instagram post is unrecoverable.
- **Zorlama:** lefthook `commit-msg` job `run-id`: if `git diff --cached --name-only | grep -qE '^(corpus/|assets/.*\.json$)'` then `git interpret-trailers --parse < "$1" | grep -q '^Run-Id: [0-9a-hjkmnp-tv-z]\{26\}$'` and the value must match `$(git symbolic-ref --short HEAD | awk -F/ '{print $3}')` when on an agent branch.

#### `agent-authorship-trailers` · BLOCKING

Agent-authored commits carry the trailer block `Run-Id`, `Agent: <agent-id>@<version>`, `Model: <capability>/<lane>`, `Cost-Usd: <decimal>`, `Proposed-By: agent`. Human commits carry `Proposed-By: human`. Never encode machine authorship in the Author or Committer field.

- **Neden:** Author fields are needed for real identity and are rewritten by rebase; trailers survive rebase and squash and are queryable with `%(trailers:key=...)`. Recording the requested capability/lane rather than a model id keeps history valid after a provider swap, matching the 'pipelines request capabilities, never model ids' decision.
- **Zorlama:** `scripts/apply.sh` and the run executor stamp trailers via `git interpret-trailers --if-exists replace --trailer "Run-Id=$RUN_ID" ...`. Separation query used in the monthly audit: `git log --format='%h %(trailers:key=Proposed-By,valueonly)' main`. lefthook `commit-msg` rejects a message where `Proposed-By` is absent or not in {agent,human}.

#### `no-ring-mixing-commits` · BLOCKING

A single commit must not modify both Ring 0 kernel source and Ring 2 corpus records; kernel changes ship alone or with their tests and schemas.

- **Neden:** Ring 0 is meant to be nearly frozen. Mixing a kernel edit into a 40-file content commit hides the one change that can break every pipeline, and makes `git revert` of a content batch also revert kernel behaviour.
- **Zorlama:** `scripts/gates/commit-shape.sh` run in `pre-commit`: fails if `git diff --cached --name-only` matches both `^packages/kernel/src/` and `^corpus/`.

#### `no-bypass-verify` · BLOCKING

`--no-verify` is forbidden for both human and agent commits; if a gate is wrong, fix or explicitly disable the gate in `lefthook.yml` in its own `ci:` commit.

- **Neden:** A bypassed hook on a solo repo is never discovered, because there is no reviewer. The failure mode is a secret or a 40 MB MP4 landing in history and being noticed a month later, when removing it requires rewriting every commit since.
- **Zorlama:** Not preventable client-side, so it is detected: `scripts/gates/audit.sh` (weekly and pre-push) replays `pnpm run gate:all` over `git diff audit/last-verified..HEAD` and fails if anything the pre-commit set would have rejected is present. The `audit/last-verified` tag moves only on success.

#### `commit-json-schemas` · BLOCKING

Generated JSON Schemas are COMMITTED under `schemas/<entity>.schema.json`, generated from Zod with `z.toJSONSchema(schema, { target: 'draft-2020-12' })`, and regeneration must produce a zero diff.

- **Neden:** Three consumers need the schemas without running a build: the YAML language server in the editor (`# yaml-language-server: $schema=../schemas/x.schema.json` while the user hand-edits Ring 1), the corpus validator on a fresh clone, and code review — a schema change is the one diff that must be legible, because it is the contract between the fixed kernel and user-defined attributes.
- **Zorlama:** `scripts/gates/schemas.sh`: `pnpm run gen:schemas && git diff --exit-code -- schemas/`. Runs pre-push and in the weekly gate.

#### `ignore-derived-ring3` · BLOCKING

Everything under `derived/` is gitignored, including the better-sqlite3 FTS5 index, and no tracked file may ever live there; the whole directory must be reconstructible by `pnpm run rebuild` from Rings 1 and 2 alone.

- **Neden:** The SQLite file is a large opaque binary that changes on every read-triggered write, cannot be diffed or merged, and would add tens of MB per week to pack size forever. Ring 3 being provably rebuildable is what makes it safe to delete during recovery.
- **Zorlama:** `.gitignore` contains `derived/`; `scripts/gates/no-tracked-derived.sh`: `test -z "$(git ls-files derived/ assets/objects/)"`. Recovery drill asserts `rm -rf derived && pnpm run rebuild` then `pnpm run gate:all` is green.

#### `generated-ts-ignored` · BLOCKING

Generated TypeScript (types emitted from the committed JSON Schemas, registry-derived unions) is gitignored under `derived/types/` and produced by `pnpm run gen:types`, which is a prerequisite of `typecheck` and `build`.

- **Neden:** The committed JSON Schema is already the source of truth; committing the .d.ts too creates a second artifact that drifts and produces review noise on every schema tweak. Generation is offline and deterministic (no network, no provider calls), so a fresh clone can typecheck after one command — that is the exact condition under which generated code should not be committed.
- **Zorlama:** `.gitignore` covers `derived/types/`; `package.json` scripts: `"typecheck": "pnpm run gen:types && tsc -b --pretty false"`. `tsconfig.json` includes `derived/types`. `scripts/gates/gen-offline.sh` runs `gen:types` with network disabled and asserts success.

#### `pricing-snapshots-committed` · BLOCKING

Provider pricing is committed as immutable dated snapshots at `registry/providers/_pricing/<provider>-<YYYY-MM-DD>.json`, each containing `fetched_at`, `source_url`, `currency`, the rate table and a `sha256` of the fetched page; cost formulas reference a snapshot id, never a live fetch.

- **Neden:** A cost estimate shown before a run is a number the user made a decision on. If pricing is fetched live, last quarter's cost report silently re-prices at today's rates and the free/premium lane comparison becomes unauditable. Provider pricing pages also change and disappear, so the snapshot is the only durable evidence.
- **Zorlama:** Schema validation requires `pricing_snapshot` on every provider descriptor and rejects unknown ids. `scripts/gates/pricing-immutable.sh`: `git diff --diff-filter=M --name-only <base>..HEAD -- registry/providers/_pricing/` must be empty (snapshots may be added, never modified). Weekly maintenance opens a `chore(providers): refresh pricing snapshot` commit if the live table differs.

#### `no-asset-bytes-in-git` · BLOCKING

No rendered or source asset bytes (png, jpg, webp, mp4, mov, wav, pdf, psd, zip) are ever tracked by git; Git LFS is not installed and must not be introduced. The only binary exceptions are brand fonts (`brand/fonts/*.woff2`) and the brand logo set, each under 512 KiB.

- **Neden:** Assets are the output of a deterministic pipeline plus a run_id — regenerable, not source. Git stores every version of a binary forever with no delta compression benefit; a single video-heavy month makes clone and `git gc` unusable. LFS would add a server, a second auth path and a smudge filter that breaks in worktrees, in exchange for solving a problem we can avoid entirely.
- **Zorlama:** `.gitignore` blocks `assets/objects/`; `scripts/gates/binary-paths.sh` in `pre-commit`: `git diff --cached --name-only --diff-filter=A | grep -Ei '\.(png|jpe?g|webp|gif|mp4|mov|webm|wav|mp3|pdf|psd|ai|zip)$' | grep -v '^brand/' && exit 1`.

#### `content-addressed-assets` · BLOCKING

Asset bytes live in a local content-addressed object store at `assets/objects/sha256/<first-2-hex>/<full-64-hex><ext>`, written once and never mutated; the hash is computed with `crypto.hash('sha256', bytes, 'hex')` from `node:crypto`.

- **Neden:** Content addressing makes the render pipeline idempotent (identical inputs produce an identical hash, so re-renders are free), makes deduplication automatic across variants, and gives sidecars a stable immutable reference that survives file renames. Node 22 ships `crypto.hash` natively, so this needs no dependency.
- **Zorlama:** The object store module is the only writer to `assets/objects/`; a unit test asserts writing the same bytes twice is a no-op and that a mismatched hash throws. `scripts/gates/object-store-integrity.sh` re-hashes every object and compares to its path.

#### `sidecar-committed` · BLOCKING

Every asset has a COMMITTED sidecar JSON (`assets/<kind>/<slug>.json`) carrying `sha256`, `bytes`, `mime`, `width`/`height`/`duration_ms`, `run_id`, `pipeline`, `recipe`, `channel`, `safe_zone_profile`, `license`, and `created_at`; the sidecar is the tracked entity, the bytes are not.

- **Neden:** This keeps the repo the single source of truth for what exists and how it was made, while keeping it small and diffable. It also means a clone with an empty object store is still fully queryable and can be re-materialised by re-running the recipe, and it lets the safe-zone inspector and analytics work without the bytes present.
- **Zorlama:** `scripts/gates/sidecars.sh`: every file under `assets/objects/` has a sidecar referencing its hash, and every sidecar's `sha256` is either present locally or explicitly marked `"materialized": false`. JSON Schema `schemas/asset-sidecar.schema.json` validated with `ajv -s ... -d 'assets/**/*.json'`.

#### `blob-size-gate` · BLOCKING

Reject any staged blob larger than 512 KiB unless its path matches the allowlist in `scripts/gates/allow-large.txt`; reject any single commit whose total added bytes exceed 5 MiB.

- **Neden:** By the time `git count-objects` shows the problem, the bytes are already in history and only a full rewrite removes them. A staged-size check is the last cheap moment to say no, and it catches the realistic accident: an agent writing a render into `corpus/` instead of the object store.
- **Zorlama:** lefthook `pre-commit` job `blob-size`: `git diff --cached --name-only --diff-filter=AM -z | xargs -0 -I{} sh -c 'test $(git cat-file -s $(git rev-parse :{})) -le 524288 || { echo "too large: {}"; exit 1; }'`.

#### `repo-bloat-budget` · WARN

The repository has a hard budget of 250 MiB for `.git` and 30 s for a cold `git clone` from the backup remote; exceeding it is an incident, not a warning.

- **Neden:** Clone time is the practical measure of whether this repo can still be handed to a second person or restored on a new machine. A budget turns bloat into a tripwire rather than something noticed at 4 GB.
- **Zorlama:** `scripts/gates/repo-size.sh` in the weekly maintenance: `git count-objects -vH | awk '/size-pack/ {print $2}'` compared to the budget, and `git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '$1=="blob" && $3>524288' | sort -k3 -nr | head -20` prints the offenders.

#### `filter-repo-recovery` · BLOCKING

If asset bytes or a secret reach history, recover with `git filter-repo` in a FRESH clone — never `git filter-branch`, never an interactive rebase — then delete every worktree, re-add the remote, force-push, and rotate any exposed credential before the rewrite.

- **Neden:** git-filter-repo bails unless it is a fresh clone (overridable with `--force`) precisely because a botched rewrite of your only copy is unrecoverable, and it removes the origin remote afterwards so you cannot accidentally mix old and new history. Existing worktrees point at rewritten objects and must be discarded.
- **Zorlama:** Documented as `docs/runbooks/history-rewrite.md` with the literal commands: `git clone --no-local . /tmp/rewrite && cd /tmp/rewrite && git filter-repo --strip-blobs-bigger-than 512K` (or `git filter-repo --path <leaked> --invert-paths`), then `git filter-repo --analyze` to verify. A drill executes this runbook against a scratch clone quarterly.

#### `lockfile-committed-frozen` · BLOCKING

`pnpm-lock.yaml` and `pnpm-workspace.yaml` are committed; every non-interactive install uses `pnpm install --frozen-lockfile`, and the `packageManager` field in the root `package.json` pins the exact pnpm version.

- **Neden:** pnpm documents `--frozen-lockfile` as defaulting to true in CI when a lockfile is present, and since v11.4.0 an integrity mismatch is a hard failure — which only protects a project that ships a committed lockfile. Reproducible renders require a reproducible dependency graph, since a Playwright or Chromium bump changes typography output.
- **Zorlama:** `scripts/gates/deps.sh`: `pnpm install --frozen-lockfile --offline` must succeed and leave `git diff --exit-code -- pnpm-lock.yaml` clean. `corepack` reads `packageManager`; the doctor check asserts `pnpm --version` matches it.

#### `env-never-committed` · BLOCKING

`.env`, `.env.local` and any `*.key`/`*.pem` are gitignored and never tracked; only `.env.example` (keys with empty values plus a comment describing where the real value lives) is committed. Provider credentials live in the OS keyring, read at runtime.

- **Neden:** This repo calls paid providers; a leaked key is a direct financial loss and, once committed, is compromised even after removal from history. `.env.example` keeps onboarding a single documented step without ever holding a secret.
- **Zorlama:** `.gitignore`: `.env`, `.env.*`, `!.env.example`, `*.pem`, `*.key`. lefthook `pre-commit` job `secrets`: `gitleaks git --staged --no-banner --redact --exit-code 1` (verified: the `git` command registers a `staged` flag described as 'scan staged commits (good for pre-commit)'). Config in `.gitleaks.toml`. Full-history scan `gitleaks git --no-banner` runs weekly.

#### `gitattributes-records-no-merge` · BLOCKING

Ship a `.gitattributes` that disables 3-way merge for one-record-per-file sources so a collision becomes an explicit whole-file choice, normalises line endings to LF, and marks binaries: `* text=auto eol=lf`, `corpus/**/*.md -merge`, `registry/**/*.yaml -merge`, `registry/**/*.yml -merge`, `assets/**/*.json -merge`, `schemas/**/*.json text`, `pnpm-lock.yaml -diff merge=binary linguist-generated`, `CHANGELOG.md merge=union`, `*.png binary`, `*.mp4 binary`, `*.woff2 binary`, `*.pdf binary`.

- **Neden:** Unsetting `merge` makes git 'take the version from the current branch as the tentative merge result and declare that the merge has conflicts' — exactly right for a semantic record, where a line-level merge of YAML frontmatter plus Turkish prose produces a syntactically valid but meaningless record. `binary` is documented as the macro `-diff -merge -text`. `merge=union` on the changelog takes lines from both sides, which is only safe for an append-only list. LF normalisation prevents Turkish text files from acquiring CRLF via any tool.
- **Zorlama:** `.gitattributes` is committed and its content asserted by `scripts/gates/gitattributes.sh` (diff against a golden copy). `git check-attr -a corpus/brand/tone.md` is part of the doctor output.

#### `ascii-paths` · BLOCKING

Every tracked path matches `^[a-z0-9][a-z0-9._/-]*$` — lowercase ASCII only. Turkish characters and uppercase are allowed in file CONTENT and in frontmatter titles, never in filenames or directory names.

- **Neden:** Turkish dotted/dotless I (İ/i, I/ı) breaks case-insensitive path comparison, `grep -i`, and shell globbing in ways that differ per locale; non-ASCII filenames additionally hit NFC-vs-NFD normalisation differences that make the same file appear twice in `git status`. This is the concrete mechanism behind the 'content Turkish, directories English' decision.
- **Zorlama:** `scripts/gates/paths.sh` in `pre-commit`: `git ls-files -z | tr '\0' '\n' | LC_ALL=C grep -vE '^[a-z0-9][a-z0-9._/-]*$' && exit 1`. Also set `git config core.precomposeunicode true`.

#### `lefthook-hook-manager` · BLOCKING

Use lefthook as the only git hook manager, pinned as a devDependency, installed by the `prepare` script, with `assert_lefthook_installed: true` and `min_version: "1.10.0"` in `lefthook.yml`. Do not use husky, simple-git-hooks, or hand-written `core.hooksPath` scripts.

- **Neden:** This repo needs parallel gates, staged-file globs, per-branch skip conditions and auto-restaging of formatter fixes. lefthook expresses all of that declaratively (`jobs` with `glob`, `stage_fixed`, `skip`/`only`, `parallel`, `group`+`piped`; `jobs` was introduced in 1.10.0), runs as a single Go binary with no Node bootstrap cost per hook, and works uniformly across the many worktrees agents create. husky is a thin shell-script runner with no parallelism or file filtering — every gate would become hand-rolled bash; simple-git-hooks is deliberately minimal and cannot express staged-file scoping. `assert_lefthook_installed` prevents the classic silent failure where hooks simply do not run.
- **Zorlama:** `package.json`: `"prepare": "lefthook install"`. `scripts/gates/doctor.sh` asserts `git config core.hooksPath` resolves and `lefthook version` satisfies `min_version`. Presence of `.husky/` or a `simple-git-hooks` key in package.json fails `gate:repo-shape`.

#### `gates-in-scripts-not-yaml` · BLOCKING

Every gate is a POSIX shell script in `scripts/gates/<name>.sh` exposed as `pnpm run gate:<name>`, with `gate:all` running the full set. `lefthook.yml` and any GitHub Actions workflow may only invoke `pnpm run gate:*` — no gate logic may exist in YAML.

- **Neden:** Gates that live in workflow YAML cannot be run locally, and this repo's primary CI is a laptop. Keeping the logic in scripts means the pre-commit hook, the pre-push hook, the weekly maintenance run and any future remote runner execute byte-identical checks, so 'green locally, red in CI' cannot happen.
- **Zorlama:** `scripts/gates/no-yaml-logic.sh`: any line in `.github/workflows/*.yml` under `run:` that is not `pnpm install --frozen-lockfile` or `pnpm run gate:*` fails the gate.

#### `local-ci-primary` · CONVENTION

CI is local-first: `lefthook` pre-commit + pre-push are the gate of record, and `pnpm run gate:all` must pass on the maintainer's machine before any push. A GitHub Actions workflow is OPTIONAL and exists only as a clean-machine smoke test on a weekly schedule against the private backup remote; it is never the sole enforcement of any rule.

- **Neden:** This is a local command center for one maintainer at a 6-person company; a remote runner cannot access the local object store, provider keys or Chromium render cache, so it can only ever check a subset. Making the laptop authoritative avoids the anti-pattern where the real gate is remote, slow and routinely bypassed. The weekly clean-machine run still catches 'works only on my box' drift (missing lockfile entry, uncommitted schema, undeclared system dependency).
- **Zorlama:** Documented in `docs/runbooks/ci.md`. `.github/workflows/weekly.yml` (if present) runs `pnpm install --frozen-lockfile && pnpm run gate:all` on `schedule: cron`. `scripts/gates/audit.sh` is what actually blocks a push.

#### `pre-commit-gate-set` · BLOCKING

The `pre-commit` hook runs ONLY fast, staged-scoped gates and must complete in under 5 seconds: format check, eslint on staged files, `gitleaks git --staged`, blob-size, ASCII-path, branch-name, commit-shape, and frontmatter validation of staged corpus records only.

- **Neden:** A pre-commit hook slower than a few seconds gets bypassed, and agents commit dozens of times per run. Scoping to staged files keeps cost proportional to the change; the expensive whole-repo truths are checked once at push time instead of once per commit.
- **Zorlama:** `lefthook.yml`: `pre-commit: { parallel: true, jobs: [ {run: 'pnpm exec prettier --check {staged_files}', glob: '*.{ts,tsx,json,md,yaml,yml}', stage_fixed: true}, {run: 'pnpm exec eslint {staged_files}', glob: '*.{ts,tsx}'}, {run: 'pnpm run gate:secrets'}, {run: 'pnpm run gate:blob-size'}, {run: 'pnpm run gate:paths'}, {run: 'pnpm run gate:branch-name'}, {run: 'pnpm run gate:commit-shape'}, {run: 'pnpm run gate:frontmatter -- {staged_files}', glob: 'corpus/**/*.md'} ] }`. A timing assertion in the weekly drill fails if the hook exceeds 5 s.

#### `pre-push-gate-set` · BLOCKING

The `pre-push` hook runs the full repository truth set and may take up to 3 minutes: `gate:typecheck`, `gate:lint`, `gate:schemas` (regenerate + zero diff), `gate:corpus` (every record validates against its entity-type schema, all cross-references resolve), `gate:projections` (snapshot tests), `gate:typography` (golden metrics), `gate:kernel-purity`, `gate:licenses`, `gate:deps`, `gate:linear-history`, `gate:audit`.

- **Neden:** Push is the point where work leaves the machine and becomes the backup of record. These checks are whole-repo and cannot be staged-scoped: a corpus record can be individually valid and still dangle a reference to an entity another commit deleted.
- **Zorlama:** `lefthook.yml`: `pre-push: { parallel: true, jobs: [ {run: 'pnpm run gate:all'} ] }`, with `skip: [{ref: 'agent/*'}]` replaced by a reduced set on agent branches (see `agent-branch-gate-set`).

#### `kernel-purity-gate` · BLOCKING

Ring 0 kernel source must never read `record.attributes` (user-defined fields) and must export exactly 8 verbs; both are checked by a gate, not by review.

- **Neden:** This is the inviolable architectural rule. Once one kernel function branches on a user-defined attribute, the kernel is coupled to one user's registry and Ring 1 stops being editable at runtime. Verb count drift is the same failure in slow motion — the fixed surface is the entire point of Ring 0.
- **Zorlama:** `scripts/gates/kernel-purity.sh`: `rg -n --glob 'packages/kernel/src/**/*.ts' -e '\.attributes\b' -e "\['attributes'\]" -e '\"attributes\"' --glob '!packages/kernel/src/record/opaque.ts' && exit 1`, plus a Vitest test asserting `Object.keys(verbs).sort()` deep-equals the frozen list in `packages/kernel/src/verbs/index.ts` and that its length is 8.

#### `golden-typography-json-not-pixels` · BLOCKING

Golden-file typography and layout tests compare a JSON metrics snapshot (resolved font family, computed font-size/line-height, per-line box geometry, glyph count, overflow flags, safe-zone intersection) via `await expect(metrics).toMatchFileSnapshot('__golden__/<case>.json')` — never a committed PNG. Reference pixels, when needed, go to the object store with their sha256 recorded in the test fixture.

- **Neden:** Pixel goldens are binary, unreviewable, and violate the no-binaries rule; they also break on every Chromium and font-hinting update, producing failures nobody can interpret. Metrics JSON diffs tell you exactly what changed ('line-height 1.4 -> 1.35, line 3 now overflows the safe zone'), which is the thing that actually matters for Turkish text with its longer average word length.
- **Zorlama:** Vitest with `toMatchFileSnapshot(filepath, hint?)`; goldens committed under `__golden__/`. Vitest does not write snapshots when `process.env.CI` is truthy and fails on mismatched, missing and obsolete snapshots, so `scripts/gates/typography.sh` runs `CI=true pnpm vitest run typography`. Updating a golden requires an explicit `chore(render): update typography goldens` commit.

#### `agent-branch-gate-set` · BLOCKING

On `agent/*` branches only the pre-commit set plus `gate:corpus` and `gate:schemas` run; the full set (typecheck, lint, projections, typography, licenses) runs at the human apply on `main`.

- **Neden:** Agents commit many times per run and a 3-minute gate per commit makes pipelines unusable. What must be true of a proposal is that it is well-formed and schema-valid; what must be true of an application is everything. This matches 'agents propose, humans apply' at the gate level.
- **Zorlama:** `lefthook.yml` uses `skip`/`only` refs: full-gate jobs carry `only: [{ref: 'main'}]`, proposal jobs carry no restriction. `scripts/apply.sh` runs `pnpm run gate:all` before creating the apply commit and refuses to commit on failure.

#### `license-and-supply-chain-gate` · BLOCKING

Run a license gate that fails on any dependency license outside the allowlist `MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, CC0-1.0, Unlicense, Python-2.0`, and record HyperFrames' Apache-2.0 NOTICE obligations in `THIRD-PARTY.md`.

- **Neden:** This repo produces commercial client deliverables. A copyleft transitive dependency in the render path is a contract problem, and Apache-2.0 (HyperFrames) carries an attribution/NOTICE obligation that is trivially satisfied now and expensive to reconstruct later.
- **Zorlama:** `scripts/gates/licenses.sh`: `pnpm licenses list --json --prod` piped through a small script that fails on any license not in the allowlist; `THIRD-PARTY.md` regenerated and `git diff --exit-code` checked. Runs pre-push and weekly.

#### `era-and-schema-tags` · BLOCKING

This repo publishes no package and has no semver version. Use two annotated tag namespaces: `era/<YYYY.N>` for a strategy/brand era boundary, and `schema/v<N>` on the commit that changes any committed JSON Schema in a non-backward-compatible way. Never use bare `vX.Y.Z` tags.

- **Neden:** Semver on an unpublished repo is meaningless ceremony that invites automated version bumps nobody reads. Era tags let you ask 'what did the brand look like in 2026.2' with `git checkout era/2026.2` — the actual question a strategy repo gets. Schema tags give migrations a fixed anchor: every record written before `schema/v3` needs the v3 migration.
- **Zorlama:** `scripts/gates/tags.sh`: `git tag --list | grep -Ev '^(era/[0-9]{4}\.[0-9]+|schema/v[0-9]+|audit/last-verified)$' && exit 1`; all tags must be annotated (`git for-each-ref refs/tags --format='%(objecttype)'` all `tag`). `gate:schemas` fails a breaking schema diff unless the commit also adds `migrations/v<N>/*.ts` and the apply script creates the tag.

#### `changelog-per-era` · CONVENTION

`CHANGELOG.md` is generated from Conventional Commit history at era boundaries only, grouped by scope (ring), never hand-edited, and never regenerated per commit.

- **Neden:** A per-commit changelog on a solo repo is pure churn and creates a merge conflict on every agent branch. Generating at era boundaries produces a document that is actually read — a quarterly account of what the brand and product knowledge became.
- **Zorlama:** `scripts/release-era.sh` regenerates the file from `git log <prev-era>..HEAD` and commits it as `docs(repo): era <YYYY.N> changelog`. `.gitattributes` marks `CHANGELOG.md merge=union` so the rare mid-era touch cannot conflict. A gate fails if `CHANGELOG.md` is modified in any commit not authored by that script.

#### `rerere-and-rebase` · CONVENTION

Enable `git rerere` (`git config rerere.enabled true`, `rerere.autoupdate true`); agent branches are updated with `git rebase main`, never `git merge main`; a rebase that conflicts on a `-merge` record aborts the rebase and the run is re-executed rather than hand-merged.

- **Neden:** rerere makes the repeated conflicts of a batch re-run resolve themselves. Rebasing keeps proposal branches based on current truth so the squash-apply is a clean fast-forward. And hand-merging a conflicted brand record is exactly the moment a human invents content the pipeline never produced — re-running is cheaper and keeps provenance honest.
- **Zorlama:** `scripts/gates/doctor.sh` asserts both config values. `scripts/rebase-agent.sh` runs `git rebase main || { git rebase --abort; exit 1; }` and the run queue marks the run `stale` for re-execution.

#### `return-from-absence-drill` · BLOCKING

After any gap of more than two weeks, run `pnpm run doctor` before touching anything; it must execute, in order: `git fsck --full --strict`, `git worktree prune --expire now`, stale-branch report, `pnpm install --frozen-lockfile`, `pnpm run gate:all`, object-store integrity re-hash, and a pricing-snapshot staleness report.

- **Neden:** The realistic state after a month away is: three orphan worktrees from crashed runs, six unapplied agent branches, a pnpm store garbage-collected out from under you, and pricing snapshots that no longer match reality. Discovering that mid-task is what makes people abandon a repo; a single command that reports it is what makes them come back.
- **Zorlama:** `scripts/doctor.sh` implements the sequence and prints a pass/fail table; it exits non-zero on any failure. Its output format is snapshot-tested so the checklist cannot silently lose a step.

#### `rebuild-from-zero-drill` · BLOCKING

Once a month, prove Ring 3 is disposable: `rm -rf derived node_modules && pnpm install --frozen-lockfile && pnpm run rebuild && pnpm run gate:all` must be green with no network access to providers.

- **Neden:** The entire 'derived is gitignored' decision rests on the claim that it is rebuildable. That claim rots quietly — someone hand-edits a row in the SQLite index, or a generator starts depending on a file only present on this machine. An untested backup is not a backup, and an untested rebuild is not a derived artifact.
- **Zorlama:** `scripts/drills/rebuild.sh`, invoked by the weekly maintenance run on the first run of each month, with provider base URLs pointed at an unreachable host to prove no network dependency. Failure opens a blocking `fix(derived): ...` task.



### Kalemler (22)

| Ad | Tür | Ne | Erişim | Maliyet | Karar |
|---|---|---|---|---|---|
| lefthook |  | Git hooks manager, single Go binary, YAML config, distributed as an npm package |  |  | ADOPT — the only hook manager that expresses this repo's gate matrix declaratively |
| husky |  | Shell-script git hooks, `.husky/` directory, `prepare: husky` |  |  | HOLD — fine tool, wrong shape here |
| simple-git-hooks |  | Minimal hooks manager, config inline in package.json |  |  | HOLD — too minimal for a repo with an agent fleet |
| native core.hooksPath |  | `git config core.hooksPath .githooks` with hand-written scripts, zero dependencies |  |  | TRIAL — keep as the documented fallback if lefthook ever breaks |
| commitlint + @commitlint/config-conventional |  | Commit message linter implementing Conventional Commits |  |  | ADOPT — run from lefthook `commit-msg` |
| Conventional Commits 1.0.0 |  | Commit message specification |  |  | ADOPT — as-is, no local dialect beyond the type/scope enums |
| git interpret-trailers |  | Built-in git command to parse and inject commit message trailers |  |  | ADOPT — the mechanism for all agent-authorship metadata |
| git worktree |  | Multiple working trees backed by one object database |  |  | ADOPT — mandatory for every file-writing agent run |
| gitleaks |  | Secret scanner for git history, directories and stdin |  |  | ADOPT — pre-commit staged scan plus a weekly full-history scan |
| git-filter-repo |  | History rewriting tool, the maintained replacement for git filter-branch |  |  | ADOPT — break-glass only, documented in a runbook, never routine |
| Git LFS |  | Large file storage extension using pointer files and a smudge/clean filter |  |  | AVOID — explicitly rejected for this repo |
| Zod v4 z.toJSONSchema |  | Built-in Zod-to-JSON-Schema conversion |  |  | ADOPT — generator for the committed schemas/ directory |
| ajv-cli |  | CLI validator for JSON Schema |  |  | ADOPT — validates corpus frontmatter and sidecars against the committed schemas |
| Vitest toMatchFileSnapshot |  | File-based snapshot matcher |  |  | ADOPT — for projection snapshots and typography metrics goldens |
| pnpm licenses list |  | Built-in dependency license report |  |  | TRIAL — first choice for the license gate, no extra dependency |
| pnpm install --frozen-lockfile |  | Reproducible install mode |  |  | ADOPT — the only install mode used non-interactively |
| node:crypto crypto.hash() |  | One-shot hash helper in Node 22 |  |  | ADOPT — sha256 addressing for the object store with zero dependencies |
| .gitattributes merge control |  | Per-path merge, diff and eol behaviour |  |  | ADOPT — `-merge` on every one-record-per-file source |
| git rerere |  | Reuse recorded conflict resolutions |  |  | ADOPT — `rerere.enabled true`, `rerere.autoupdate true` |
| GitHub Actions |  | Hosted CI |  |  | TRIAL — weekly clean-machine smoke test only, never the gate of record |
| git maintenance / git fsck / git count-objects |  | Built-in repository health and repacking |  |  | ADOPT — wire into the weekly maintenance script |
| git-cliff / conventional-changelog |  | Changelog generators that consume Conventional Commits |  |  | TRIAL — pick one at the first era boundary, not before |

<details><summary>Notlar</summary>

**lefthook** — Verified top-level keys: assert_lefthook_installed, colors, extends, glob_matcher, install_non_git_hooks, lefthook, min_version, no_auto_install, no_tty, output, rc, remotes, skip_lfs, source_dir, source_dir_local, templates, ai (beta). The `jobs` key (added 1.10.0) supports name, run, script, runner, args, group, parallel, piped, glob, files, file_types, exclude, root, stage_fixed, skip, only, tags, env, fail_text, interactive, use_stdin; `priority` is commands/scripts-only. `commands`/`scripts` are NOT deprecated. Install with `lefthook install` from a `prepare` script. Set `assert_lefthook_installed: true` so hooks never silently no-op.

**husky** — Setup verified: `npm install --save-dev husky` then `npx husky init`, which updates the `prepare` script and creates `.husky/pre-commit`. It is a hook runner, not a job runner: no staged-file globs, no parallelism, no per-branch skip, no auto-restage of formatter fixes. Every one of this repo's ~10 gates would become hand-rolled bash with manual `git diff --cached` plumbing. Docs page did not state a current version number.

**simple-git-hooks** — Good choice for a repo with one or two hooks. Here the pre-commit set alone has eight jobs with different file globs and different branch conditions; expressing that in a single package.json string is unmaintainable.

**native core.hooksPath** — Zero-dependency and worktree-safe (config lives in the common dir). The reason it is not the primary choice is that you end up reimplementing staged-file scoping and parallel execution. Note `git config --worktree` only diverges from `--local` when `extensions.worktreeConfig` is enabled — verified in git-config docs.

**commitlint + @commitlint/config-conventional** — Verified default type-enum: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test (11). Verified rule names available to override: type-enum, type-case, type-empty, subject-case, subject-empty, subject-full-stop, header-max-length, footer-max-line-length, body-max-line-length (errors); footer-leading-blank, body-leading-blank (warnings). This rulebook removes `style` and adds `corpus` and `registry`, and tightens header-max-length from 100 to 72.

**Conventional Commits 1.0.0** — Verified: type is REQUIRED, followed by OPTIONAL scope, OPTIONAL `!`, REQUIRED terminal colon+space; body begins one blank line after the description; footers begin one blank line after the body and each consists of a word token followed by `: ` or ` #` — explicitly inspired by the git trailer convention. That is what makes Run-Id/Agent/Proposed-By first-class rather than a local hack.

**git interpret-trailers** — Use `--parse` in the commit-msg hook to validate, and `--if-exists replace --trailer 'Run-Id=...'` in the apply script to stamp. Query history with `git log --format='%h %(trailers:key=Proposed-By,valueonly)'`. Trailers survive rebase and squash; author fields do not reliably.

**git worktree** — `git worktree add -b <branch> <path> main`, `git worktree list --porcelain`, `git worktree remove --force`, `git worktree prune --expire <time>`, `git worktree lock` for anything on removable media. Each worktree has its own index, which is exactly why parallel agents need one each.

**gitleaks** — MIT licensed. `detect` and `protect` are deprecated as of v8.19.0 (hidden, still functional); use `gitleaks git`, `gitleaks dir`, `gitleaks stdin`. Verified from cmd/git.go that the `git` command registers `--staged` ('scan staged commits (good for pre-commit)') and `--pre-commit` ('scan using git diff'), plus `--log-opts` and `--platform`. Useful flags: `--no-banner`, `--redact`, `--exit-code` (default 1), `--baseline-path`, `-f/--report-format` (json, csv, junit, sarif, template). Config resolution order: `-c` flag, GITLEAKS_CONFIG, GITLEAKS_CONFIG_TOML, then `.gitleaks.toml` in the target path.

**git-filter-repo** — Verified: it detects and bails if not run in a fresh clone unless `--force`, and it automatically removes old cruft and repacks after filtering. Relevant flags for this repo: `--analyze` (survey blob sizes first), `--strip-blobs-bigger-than 512K`, `--path <p> --invert-paths` (remove a leaked file). It removes the origin remote afterwards by design so old and new history cannot be mixed — re-add it deliberately.

**Git LFS** — Adds a server, a second auth path, per-clone bandwidth quotas, and a smudge filter that behaves badly across many short-lived worktrees. Every problem it solves is better solved here by a content-addressed local object store plus committed sidecars, because the assets are regenerable pipeline output rather than irreplaceable source.

**Zod v4 z.toJSONSchema** — Verified signature `z.toJSONSchema(schema, params)` with options target ('draft-04' | 'draft-07' | 'draft-2020-12' | 'openapi-3.0'), io ('output' default | 'input'), metadata ($ZodRegistry), unrepresentable ('throw' default | 'any' | fn), cycles ('ref' default | 'throw'), reused ('inline' default | 'ref'), override callback, and uri. Default target is Draft 2020-12. Pin `target` explicitly so a Zod upgrade cannot silently change the committed schema files.

**ajv-cli** — Runs against the same schema files the editor's YAML language server uses, so 'valid in my editor' and 'valid in CI' cannot diverge. Confirm the CLI's draft-2020-12 support flag when wiring it up (not verified this session).

**Vitest toMatchFileSnapshot** — Verified signature `<T>(filepath: string, hint?: string) => Promise<void>` — must be awaited. Verified CI behaviour: 'By default, Vitest does not write snapshots in CI (process.env.CI is truthy) and any snapshot mismatches, missing snapshots, and obsolete snapshots fail the run.' So run gates with CI=true. Update deliberately with `-u`/`--update` in its own commit.

**pnpm licenses list** — Verified flags: `--json`, `--long`, `-D/--dev`, `-P/--prod`, `--no-optional`, `--filter <selector>`. Alias `pnpm licenses ls`. Docs do not state whether a lockfile is required; assume yes and run it after `pnpm install --frozen-lockfile`.

**pnpm install --frozen-lockfile** — Verified default: 'For non-CI: false; For CI: true, if a lockfile is present', and it 'fails to install if the lockfile is out of sync with the manifest / an update is needed or no lockfile is present'. Also verified: since v11.4.0 an integrity mismatch is a hard failure, which the docs frame as protecting projects that ship a committed lockfile against a compromised registry or proxy — a direct argument for committing pnpm-lock.yaml.

**node:crypto crypto.hash()** — Verified present in the Node 22 crypto docs as `crypto.hash(algorithm, data[, outputEncoding])` alongside the stable `createHash`. Use sha256 rather than adding a BLAKE3 dependency; hashing throughput is not the bottleneck in a Chromium render pipeline.

**.gitattributes merge control** — Verified semantics: merge unset = 'take the version from the current branch as the tentative merge result, and declare that the merge has conflicts'; `merge=union` = 'take lines from both versions, instead of leaving conflict markers ... the user should verify the result'; the `binary` macro is exactly `[attr]binary -diff -merge -text`. Custom drivers are defined as `[merge "<name>"] driver = cmd %O %A %B %L %P` with the driver overwriting %A and exiting non-zero on conflict — deliberately NOT used here, because a semantic merge of a brand record is a job for a human, not a script.

**git rerere** — Pays for itself the first time a batch of agent branches is rebased onto the same moved corpus record.

**GitHub Actions** — Cannot see the local object store, the provider keys or the Chromium render cache, so it can only ever check a subset. Its value is proving a fresh clone installs and gates green on a machine that is not the maintainer's laptop. Workflow files may only call `pnpm run gate:*`.

**git maintenance / git fsck / git count-objects** — `git fsck --full --strict` for integrity, `git count-objects -vH` for the size budget, `git maintenance run` for incremental repacking. Combine with `git rev-list --objects --all | git cat-file --batch-check` to list the largest blobs when the budget is exceeded.

**git-cliff / conventional-changelog** — NOT verified this session (no primary source fetched). Either works; the rule that matters is that CHANGELOG.md is generated at era boundaries only and never hand-edited. Confirm current config format before adopting.

</details>


### Doğrulanmamış

- The current husky major version number — typicode.github.io/husky/get-started.html does not state a version on the page. The install flow (`npm install --save-dev husky`, `npx husky init`, `"prepare": "husky"`, scripts in `.husky/`) was verified; the version was not.
- Whether `gitleaks git --staged` behaves correctly inside a linked git worktree and on a repository's very first commit (no HEAD). The flag's existence and description were verified from cmd/git.go; this edge-case behaviour was not tested.
- The current gitleaks release version. The README shows `rev: v8.24.2` in a pre-commit example, but that is an example pin, not necessarily the latest release as of 2026-08-14.
- Whether `pnpm licenses list` requires a lockfile or a completed install — pnpm.io/cli/licenses does not say. The rulebook assumes it runs after `pnpm install --frozen-lockfile`.
- Whether `pnpm licenses list` supports `--recursive` across a workspace; only `--filter <package_selector>` is documented on that page.
- git-cliff's current configuration format and version — no primary source was fetched. The changelog rule is written tool-agnostically for that reason.
- The exact default value of `git worktree prune --expire` when the flag is omitted; the rulebook always passes an explicit expiry rather than relying on the default.
- The precise wording of `core.hooksPath` in git-config docs — the fetched page was truncated before reaching it. The claim that hook configuration is shared across linked worktrees (because `--local` config lives in the common dir) follows from the verified `--worktree`/`extensions.worktreeConfig` documentation but was not read verbatim.
- ajv-cli's exact flag for JSON Schema draft-2020-12 support, which must match Zod's verified default target. Confirm before wiring the corpus validation gate.
- HyperFrames' repository conventions, current version, and the exact NOTICE text its Apache-2.0 licence requires — not fetched this session. The licence gate rule names the obligation; the wording of THIRD-PARTY.md must be taken from the actual LICENSE/NOTICE files in the release used.
- Whether `toMatchFileSnapshot` is covered by the documented CI no-write behaviour (the docs state the rule for snapshots generally, without singling out file snapshots). Running gates with `CI=true` and verifying that a deliberately missing golden fails is a one-minute check worth doing once.
- Lefthook's behaviour when the same repository has many simultaneous linked worktrees running hooks concurrently (lock contention on its internal state). Not documented on the configuration page that was fetched.
- GitHub Actions minute costs and scheduled-workflow reliability for a private repository under whatever plan Upcytech holds — relevant only if the optional weekly smoke test is enabled.
- Whether `git filter-repo` is packaged in the maintainer's distribution repositories or must be installed via pip/manual download; the runbook should record the actual install path used on this machine.


### Anti-desenler

- Agents committing in the main working tree 'just this once' because spinning up a worktree felt slow. Symptom: a run's output vanishes, or `git status` shows files from two different runs interleaved, or an agent's `git checkout` silently discards the human's uncommitted edits. There is one index per worktree and no lock protecting it.
- Worktrees created inside the repo (e.g. `.worktrees/`) and 'handled' with a .gitignore entry. Symptom: the corpus validator reports every record twice, ripgrep results are duplicated, the FTS5 index doubles in size, and the Vite dev server rebuild-loops. .gitignore only stops git — every other tool still walks the directory.
- Crashed runs leaving stale worktree administrative entries under `.git/worktrees/<id>`. Symptom: `git worktree add` refuses the path with 'already exists', and `git branch -D agent/...` refuses with 'used by worktree at ...' even though the directory is gone. Fix is `git worktree prune`, but nobody remembers the command at 11pm.
- Marking agent commits with `Co-Authored-By:` and nothing else. Symptom: after a rebase or squash the trailer is dropped or merged with the human's, and `git log` can no longer answer which records were machine-proposed. Use a dedicated `Proposed-By:` plus `Run-Id:` and validate both in commit-msg.
- Letting a run's Run-Id live only in the run ledger and not in the commit. Symptom: six months later a client asks why a claim in a LinkedIn post was made, and there is no path from the published asset back to the prompt, model lane and cost that produced it.
- Committing the better-sqlite3 index 'temporarily, so the dashboard works on the other laptop'. Symptom: pack size grows tens of MB per week with zero delta compression, clone time triples, and every agent branch conflicts on a binary file. Once it is in history only a filter-repo rewrite removes it.
- Committing generated TypeScript AND the JSON Schema it came from. Symptom: two sources of truth drift, a schema change produces a 900-line review diff, and eventually someone edits the generated .d.ts by hand and it is regenerated away.
- Fetching provider pricing live inside the cost estimator. Symptom: last quarter's cost report silently re-prices at today's rates, the free-vs-premium comparison shown to the user before a run cannot be reproduced, and when a provider deletes its pricing page the estimator throws in production.
- A render landing in `corpus/` instead of the object store because a pipeline used a relative path. Symptom: a 12 MB MP4 is staged and, without a blob-size hook, committed. Six weeks later `.git` is 3 GB and the only fix is rewriting every commit since.
- Introducing Git LFS as the 'proper' fix for the previous problem. Symptom: smudge filters fail inside freshly created worktrees, clones hit bandwidth quotas, and the repo now needs a server to be usable offline — in a system whose entire premise is local-first.
- Line-level 3-way merging of a Turkish brand record's YAML frontmatter. Symptom: git reports a clean merge and the record now has a `tone` from one branch and `audience` from another, describing a persona that was never approved. Unset `merge` on corpus and registry so a collision is loud.
- Non-ASCII or uppercase filenames creeping in from Turkish titles. Symptom: the same record appears twice in `git status` after moving between machines (NFC vs NFD), `grep -i` misses records because of the dotted/dotless I, and glob patterns in pipeline write-sets silently match nothing.
- Running the full gate set on every agent commit. Symptom: a run that makes twelve commits spends thirty minutes in hooks, so the agent runner is configured with `--no-verify` and every gate in the repo becomes decorative.
- Pixel-diff golden files for typography. Symptom: a routine Chromium or font update turns 40 tests red at once with unreadable failures, so the goldens get bulk-updated with `-u` and the test stops catching anything — including the real regression where Turkish text overflows the safe zone.
- Putting gate logic directly in GitHub Actions YAML. Symptom: the check cannot be run locally, so the laptop is green and the remote is red (or vice versa), and the maintainer starts pushing to see if CI passes — the exact loop a local-first repo exists to avoid.
- `--no-verify` becoming habitual because one gate is flaky. Symptom: nothing, for weeks — and that is the problem. On a solo repo there is no reviewer to notice. The only defence is a replay audit that re-runs the gates over the range since the last verified tag.
- Two agent runs whose pipelines both write `corpus/campaigns/<slug>.md`. Symptom: the second squash-apply conflicts on a file with merge disabled, and the human resolves it by writing a blended version by hand — inventing content no pipeline produced and no provenance covers. Declare and lock write-sets instead.
- Semver-tagging a repo that publishes nothing. Symptom: a version bump commit on every change, a CHANGELOG regenerated constantly (conflicting on every agent branch), and tags that carry no information anyone consults.
- Never testing the rebuild. Symptom: after four months, `rm -rf derived && pnpm run rebuild` fails because a generator quietly grew a dependency on a file that only exists on the maintainer's machine — discovered on the day the laptop needs replacing.
- Coming back after a month and starting work before running the doctor. Symptom: three orphan worktrees, six stale agent branches, a garbage-collected pnpm store and stale pricing snapshots, all discovered one at a time in the middle of a client deadline.
