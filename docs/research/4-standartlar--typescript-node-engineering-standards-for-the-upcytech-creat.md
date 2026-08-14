# TypeScript & Node engineering standards for the Upcytech Creative Suite (Node 22 LTS, pnpm workspaces, Hono API, Vite/React SPA, better-sqlite3, Playwright/HyperFrames rendering, ~20 flaky AI providers)

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Özet

This rulebook targets one hazard: a solo maintainer running an agentic system that talks to ~20 flaky, expensive external providers and drives headless Chromium and FFmpeg. Every rule below buys back either (a) a class of runtime failure the type system can prove away, or (b) a class of money/time loss from an unbounded or uncancellable job.

The dominant 2026 fact that shapes the toolchain: `typescript@7.0.2` — the native Go compiler — is now `latest` on npm (published 2026-07-08), and its package `exports` map no longer exposes the old JS compiler API (`"." -> "./lib/version.cjs"`, plus `typescript/unstable/*`). `typescript-eslint@8.67.0` still declares `peerDependencies.typescript: ">=4.8.4 <6.1.0"`, and no 9.x or canary exists that lifts it. Type-aware lint rules (`no-floating-promises`, `no-misused-promises`) are load-bearing for this system's async discipline, so the repo pins **typescript 6.0.3** and treats TS 7 as HOLD, with a documented, CI-checked unblock condition. `oxlint@1.78.0` now does stable type-aware linting on top of tsgo/TS7, so it is a legitimate fast pre-commit pass, but its JS plugin API is alpha and cannot host the custom kernel-purity rule — so ESLint 10 flat config remains the CI gate.

Strictness posture: `strict` is the floor, not the ceiling. `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax` + `erasableSyntaxOnly` are all on. `erasableSyntaxOnly` is not optional here: Node 22.18+ strips types natively and rejects enums, runtime namespaces, parameter properties and legacy decorators, so the flag makes the compiler enforce what the runtime already enforces.

Error posture: `Result<T, AppError>` at every I/O boundary with a closed error taxonomy carrying `retryable`, `costIncurred` and a Turkish `userMessage`; `throw` reserved for programmer error. Every provider adapter normalises SDK errors and preserves `Error.cause`.

Async posture: no promise is ever floating, no fetch is ever untimed, and every job accepts an `AbortSignal` composed via `AbortSignal.any([jobSignal, AbortSignal.timeout(ms)])` — because a cancelled render that leaves a Chromium page and an FFmpeg child alive is the failure mode that kills a laptop-hosted command center.

Ring 0 kernel purity is enforced three ways at once: a type-level opaque `attributes` value, an ESLint `no-restricted-syntax` selector scoped to `packages/kernel/**`, and a CI ripgrep. Belt, braces and a third belt, because it is the one law that cannot be allowed to erode.


### Kurallar (47)

#### `tsconfig-single-base` · BLOCKING

Define exactly one `tsconfig.base.json` at the repo root containing the full strictness block, and make every workspace package `extends` it; no package may re-declare or weaken a flag that appears in the base.

- **Neden:** Per-package tsconfig drift is how `strict: false` sneaks into one package and then leaks `any` across the workspace via project references and .d.ts emit.
- **Zorlama:** CI script parses every `packages/*/tsconfig.json` with JSON5 and fails if `compilerOptions` contains any key present in `tsconfig.base.json.compilerOptions` other than the allowlist `["module","moduleResolution","lib","jsx","outDir","rootDir","types","noEmit","composite"]`. Base block: `{"strict":true,"noUncheckedIndexedAccess":true,"exactOptionalPropertyTypes":true,"noImplicitOverride":true,"noPropertyAccessFromIndexSignature":true,"noFallthroughCasesInSwitch":true,"noImplicitReturns":true,"noUnusedLocals":true,"noUnusedParameters":true,"isolatedModules":true,"verbatimModuleSyntax":true,"erasableSyntaxOnly":true,"skipLibCheck":true,"target":"es2024","declaration":true,"declarationMap":true,"sourceMap":true}`.

#### `no-unchecked-indexed-access` · BLOCKING

Keep `noUncheckedIndexedAccess: true`; never silence it with a non-null assertion — narrow with an explicit `if (x === undefined)` guard or use `.at()` with a checked result.

- **Neden:** Registry lookups (`pipelines[name]`, `providers[id]`, `channels[slug]`) are index-signature reads over YAML the user edits at runtime. Without this flag TypeScript claims a typo'd pipeline id returns a Pipeline; at runtime it returns `undefined` and the agent crashes mid-run after the money is spent. Cost: verbose guards on every map access and noisy churn in loops over `Record<string, T>` — pay it, it is the single highest-value flag for a YAML-driven kernel.
- **Zorlama:** tsconfig flag (BLOCKING via `pnpm typecheck`) plus `@typescript-eslint/no-non-null-assertion: error` so the escape hatch is closed.

#### `exact-optional-property-types` · BLOCKING

Keep `exactOptionalPropertyTypes: true`; model "field may be absent" as `field?: T` and "field may be explicitly empty" as `field: T | null` — never `field?: T | undefined` unless the absent and undefined cases genuinely differ.

- **Neden:** Corpus records are markdown + YAML frontmatter round-tripped through the SQLite index and back to git. Without this flag, `{ subtitle: undefined }` and `{}` are the same type but serialise differently, producing spurious git diffs on every agent proposal and polluting the human's review. Cost: object spreads that conditionally add keys need `...(x !== undefined && { x })` instead of `x`.
- **Zorlama:** tsconfig flag; add a Vitest snapshot test `frontmatter.roundtrip.test.ts` asserting `parse(serialize(parse(md))) === parse(md)` byte-for-byte.

#### `erasable-syntax-only` · BLOCKING

Keep `erasableSyntaxOnly: true`: no `enum`, no `namespace` containing runtime code, no constructor parameter properties, no legacy `experimentalDecorators`. Use `const X = { A: 'a' } as const` plus `type X = typeof X[keyof typeof X]` instead of enums.

- **Neden:** Node has stripped types natively since v22.18 / v23.6 and rejects exactly these constructs with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. Keeping the source erasable means a script can be run with plain `node script.ts` with no build step, which matters for a local command center where the human debugs one pipeline at a time. Cost: enums are genuinely more ergonomic than const objects; parameter properties save boilerplate in classes. Accept the loss.
- **Zorlama:** tsconfig flag, plus ESLint `no-restricted-syntax` on `TSEnumDeclaration, TSModuleDeclaration[kind='namespace'] > TSModuleBlock > :not(TSTypeAliasDeclaration, TSInterfaceDeclaration), TSParameterProperty`.

#### `verbatim-module-syntax` · BLOCKING

Keep `verbatimModuleSyntax: true` and `isolatedModules: true`; every type-only import must use `import type { X }` (or inline `import { type X, y }`), and every type-only re-export must use `export type`.

- **Neden:** verbatimModuleSyntax means the emitter only removes what is syntactically marked as a type, so what you write is what runs — required for Node's type stripping and for Vite's per-file esbuild transform, both of which see one file at a time and cannot know whether `import { Foo }` is a type. Without it you get `SyntaxError: The requested module does not provide an export named 'Foo'` only at runtime, only in the SPA. Cost: none worth mentioning; the fixer is automatic.
- **Zorlama:** tsconfig flags plus `@typescript-eslint/consistent-type-imports: ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }]` and `@typescript-eslint/consistent-type-exports: 'error'` (both auto-fixable).

#### `module-resolution-split` · BLOCKING

Node-executed packages (kernel, api, pipelines, renderer, cli) use `"module": "nodenext", "moduleResolution": "nodenext"`; the Vite SPA package uses `"module": "preserve", "moduleResolution": "bundler", "noEmit": true`. Never use `bundler` in a package Node will execute.

- **Neden:** `bundler` resolution lets you write extensionless relative imports that typecheck and then fail at runtime under Node ESM with `ERR_MODULE_NOT_FOUND`, because Node requires a mandatory file extension on every relative specifier. `nodenext` makes tsc reproduce Node's real resolution, including the `exports` map and the CJS/ESM split. Cost: `.js` extensions in TS source, which reads odd until you internalise it.
- **Zorlama:** The `tsconfig-single-base` CI script also asserts moduleResolution per package against a hardcoded map. Backstop: `pnpm -r exec node --input-type=module -e "await import(process.env.ENTRY)"` smoke-imports every Node package entrypoint in CI.

#### `pin-typescript-6` · BLOCKING

Pin `typescript` to exactly `6.0.3` across the workspace. Do not adopt `typescript@7.x` (the native Go compiler) until `typescript-eslint` publishes a version whose `peerDependencies.typescript` range admits it.

- **Neden:** typescript-eslint 8.67.0 declares `"typescript": ">=4.8.4 <6.1.0"`, and typescript@7 no longer exposes the JS compiler API that typed linting is built on (its exports map is `"." -> "./lib/version.cjs"` plus `typescript/unstable/*`). Upgrading silently disables every type-aware rule — including `no-floating-promises`, which is the only thing standing between this system and a swallowed provider error mid-render.
- **Zorlama:** `pnpm-workspace.yaml` catalog entry `typescript: 6.0.3` and every package depends on `catalog:`; `syncpack lint` in CI. Plus a CI step: `node -e "const p=require('typescript-eslint/package.json'); const semver=require('semver'); if(semver.satisfies(require('typescript/package.json').version, p.peerDependencies.typescript)) process.exit(0); console.error('TS/tseslint peer mismatch — typed linting is OFF'); process.exit(1)"`.

#### `no-any-no-assert` · BLOCKING

`any` is banned in source. Type assertions (`as T`) are banned except (a) immediately after a validator returns, inside the validator's own module, and (b) inside `packages/*/src/**/__unsafe__/*.ts` files, each of which must carry a `// UNSAFE: <reason>` header comment.

- **Neden:** One `any` at a provider boundary propagates through the whole pipeline and re-enables every bug the strict flags were bought to prevent. Assertions are how `unknown` from a provider response leaks inward while still typechecking.
- **Zorlama:** `@typescript-eslint/no-explicit-any: 'error'`, `@typescript-eslint/no-unsafe-assignment|-call|-member-access|-return|-argument: 'error'` (all in `recommendedTypeChecked`), plus `no-restricted-syntax` on `TSAsExpression` with an `files`-scoped override permitting it only in `**/__unsafe__/**` and `**/validation/**`.

#### `ts-expect-error-only` · BLOCKING

Never write `@ts-ignore`. Use `@ts-expect-error` with a description of at least 10 characters explaining why the error is expected and what would remove it.

- **Neden:** `@ts-ignore` stays silent forever after the underlying error is fixed; `@ts-expect-error` becomes an error itself, so suppressions self-delete when the reason goes away.
- **Zorlama:** `@typescript-eslint/ban-ts-comment: ['error', { 'ts-ignore': true, 'ts-expect-error': { descriptionFormat: '^: .{10,}$' }, 'ts-nocheck': true }]`.

#### `esm-only` · BLOCKING

Every package declares `"type": "module"`. No `.cjs` file exists under any `src/`. CommonJS is consumed only through the interop rules below, never authored.

- **Neden:** A mixed graph means every shared utility has to work in both worlds, and the dual-package hazard gives you two copies of your ULID branding and two SQLite handles. One module system, no exceptions.
- **Zorlama:** CI: `test -z "$(find packages -path '*/src/*' -name '*.cjs' -o -path '*/src/*' -name '*.cts')"` and `node -e "require('node:fs').globSync('packages/*/package.json').forEach(f=>{if(JSON.parse(require('node:fs').readFileSync(f)).type!=='module'){console.error(f);process.exit(1)}})"`.

#### `explicit-import-extensions` · BLOCKING

Every relative import specifier carries an explicit extension. Write `./foo.js` in TypeScript source that is compiled by tsc; write `./foo.ts` only in packages that set `rewriteRelativeImportExtensions: true` and are run directly by Node. Pick one convention per package and never mix.

- **Neden:** Node ESM mandates the extension: `import './foo'` throws `ERR_MODULE_NOT_FOUND`, and directory indexes must be spelled `./startup/index.js` in full. Under `moduleResolution: nodenext` tsc catches this at compile time; under bundler resolution it does not, which is why `module-resolution-split` exists.
- **Zorlama:** `nodenext` resolution makes tsc fail. Additionally `eslint-plugin-import-x` with `import-x/extensions: ['error', 'always', { ignorePackages: true }]`.

#### `workspace-exports-map` · BLOCKING

Every workspace package declares an `exports` map with an explicit `types` condition first, omits `main`/`module`/`types` top-level fields, and exposes at most three subpaths. Deep imports into another workspace package's internals are forbidden.

- **Neden:** The `exports` map is the only mechanism that makes a package's public surface enforceable rather than aspirational — it is what stops Ring 2 code from reaching into `@suite/kernel/dist/internal/graph.js` and coupling to a private structure. Example: `"exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }, "./package.json": "./package.json" }`.
- **Zorlama:** `publint` and `attw --pack` run per package in CI (`pnpm -r exec publint && pnpm -r exec attw --pack`). Plus ESLint `no-restricted-imports` with `patterns: [{ group: ['@suite/*/dist/*', '@suite/*/src/*'], message: 'Import the package entrypoint, not its internals.' }]`.

#### `native-cjs-quarantine` · BLOCKING

`better-sqlite3` may be imported from exactly one file (`packages/index/src/sqlite-handle.ts`) as `import Database from 'better-sqlite3'` (default import only, never named). Any other native or CJS-only dependency gets the same single-file quarantine.

- **Neden:** better-sqlite3 is a CJS native addon with a platform-conditional `exports` map (`./linux-x64`, `./darwin-arm64`, …). Node's named-export static analysis of CJS does not see its class properly, so `import { Database }` fails only at runtime. Quarantining it also means the whole native-rebuild problem (`pnpm rebuild`, Node ABI bumps) is one file's problem, and Ring 3 stays genuinely rebuildable.
- **Zorlama:** ESLint `no-restricted-imports` with `paths: [{ name: 'better-sqlite3', message: 'Use @suite/index sqlite-handle.' }]` and a `files`-scoped override that permits it in `packages/index/src/sqlite-handle.ts` only.

#### `sqlite-never-on-request-path` · BLOCKING

All better-sqlite3 calls run inside `packages/index`, which sets `pragma('journal_mode = WAL')` and `pragma('synchronous = NORMAL')` at open, uses cached prepared statements, and wraps multi-statement work in `db.transaction()`. No transaction may span an `await`.

- **Neden:** better-sqlite3 is synchronous by design and blocks the event loop; a transaction held across an await starves the Hono server and the render queue simultaneously. The library's own docs state it is 'a very bad idea to keep a transaction open across event loop ticks', and `.transaction()` explicitly does not work with async functions.
- **Zorlama:** ESLint `no-restricted-syntax` inside `packages/index`: selector `CallExpression[callee.property.name='transaction'] AwaitExpression`. Plus a CI grep `rg -n 'await' packages/index/src/queries/ && exit 1`.

#### `result-at-io-boundary` · BLOCKING

Every exported function that performs I/O (network, filesystem, subprocess, browser, database) returns `Promise<Result<T, AppError>>`. `throw` is reserved for programmer error — invariant violations, exhaustiveness failures, impossible states.

- **Neden:** With ~20 flaky providers, failure is the normal case, not the exception. A `Result` makes the compiler force the caller to decide between retry, fallback to the free lane, and surfacing to the human — which is exactly the decision the run queue UI needs to render.
- **Zorlama:** CI grep: `rg -n 'throw new' packages/*/src --glob '!**/errors/**' --glob '!**/*.test.ts'` must be empty. `@typescript-eslint/no-throw-literal` (aka `only-throw-error`) is on. A lint rule `no-restricted-syntax` forbids `TSTypeReference[typeName.name='Promise'] > TSTypeParameterInstantiation > :not(TSTypeReference[typeName.name='Result'])` on exported declarations in `packages/providers/**`.

#### `closed-error-taxonomy` · BLOCKING

`AppError` is a closed discriminated union on `kind`, defined only in `packages/kernel/src/errors/`. The permitted kinds are: `config` | `validation` | `not_found` | `conflict` | `provider_auth` | `provider_rate_limit` | `provider_quota` | `provider_unavailable` | `provider_bad_response` | `budget_exceeded` | `timeout` | `cancelled` | `render_failed` | `subprocess_failed` | `io` | `internal`. Adding a kind is a deliberate PR that also updates the UI's remediation map.

- **Neden:** An open error type means the UI ends up with a fallback branch that says 'bir hata oluştu' and the human learns nothing. A closed union makes `switch (err.kind)` exhaustive, so adding a kind breaks the UI at compile time until someone writes the remediation copy.
- **Zorlama:** The union lives in one file; CI grep asserts no other file declares `kind: '` in an error position. The UI's `remediation.ts` uses `default: assertNever(err)` and `@typescript-eslint/switch-exhaustiveness-check: 'error'` makes a missing case a build failure.

#### `apperror-shape` · BLOCKING

Every `AppError` carries `{ kind, code: string, message: string (English, for logs), userMessage: string (Turkish, for the UI), retryable: boolean, retryAfterMs?: number, costIncurred: Money, cause?: unknown }`.

- **Neden:** `retryable` + `retryAfterMs` is what the queue needs to schedule a retry without a human. `costIncurred` is what stops a failed premium run from being invisible in the budget ledger — a 429 after three successful image generations still cost money. `userMessage` in Turkish keeps the content-language rule honest without putting Turkish into code identifiers.
- **Zorlama:** Zod schema `AppErrorSchema` in the errors module; a Vitest test iterates every constructor exported from `errors/` and asserts `AppErrorSchema.safeParse(ctor(...)).success`. UI type-checks against `z.infer`.

#### `preserve-error-cause` · BLOCKING

When wrapping a lower-level failure, always pass the original through: `new ProviderError(msg, { cause: originalError })`. Never build an error from `String(e)` or `e.message` alone, and never log only `err.message`.

- **Neden:** A provider SDK's error carries the HTTP status, request id and rate-limit headers you will need at 2am. `Error.cause` is standard and Node's inspector prints the whole chain; flattening to a string throws the diagnosis away permanently.
- **Zorlama:** CI grep for the anti-patterns `String(e)`, `${e}` and `e.message` inside `catch` blocks: `rg -n 'catch\s*\([^)]*\)\s*\{[^}]*(String\(|\.message)' -U packages/*/src`. Logger is configured with pino's `serializers: { err: pino.stdSerializers.errWithCause }`.

#### `provider-error-normalization` · BLOCKING

No provider SDK's error type, response object, or thrown value may cross out of `packages/providers/<name>/`. Each adapter's public functions return `Result<T, AppError>` and map SDK failures onto the taxonomy, setting `retryable` from the actual status/headers, not from a guess.

- **Neden:** Twenty adapters means twenty error shapes. If they leak, the retry logic and the UI both have to know all twenty, and adding a provider becomes a change in three rings instead of one YAML descriptor.
- **Zorlama:** ESLint `no-restricted-imports` blocks every provider SDK package name outside its own adapter directory (one entry per SDK in the `paths` array). Contract test per adapter: a table-driven Vitest suite feeds recorded 401/429/500/malformed-JSON fixtures and asserts the resulting `kind` and `retryable`.

#### `kernel-attributes-opacity` · BLOCKING

Ring 0 must never read `record.attributes`. The kernel's `Record` type declares `readonly attributes: OpaqueAttributes` where `declare const AttrBrand: unique symbol; export type OpaqueAttributes = { readonly [AttrBrand]: never }`. Only `packages/registry` may call the single exported `unsealAttributes(record): Record<string, unknown>`.

- **Neden:** This is the inviolable law of the architecture. An opaque branded type makes `record.attributes.color` a compile error rather than a convention, so the law survives an agent that has not read the rulebook.
- **Zorlama:** Three layers. (1) Type: `OpaqueAttributes` has no index signature and no properties. (2) ESLint scoped to `packages/kernel/**`: `'no-restricted-syntax': ['error', { selector: "MemberExpression[property.name='attributes']", message: 'Ring 0 must never read record.attributes.' }, { selector: "Literal[value='attributes']", message: 'Ring 0 must never name the attributes key.' }]`. (3) CI: `! rg -n --type ts '\battributes\b' packages/kernel/src`.

#### `kernel-eight-verbs` · BLOCKING

`packages/kernel/src/index.ts` exports exactly the eight verbs and nothing else executable; the verb list is frozen in `packages/kernel/verbs.json`. Adding, renaming or removing a verb requires editing that file in the same commit.

- **Neden:** The eight-verb constraint is the reason the kernel stays comprehensible to one person. Without a mechanical check it erodes by one convenience helper at a time.
- **Zorlama:** CI: `node --experimental-strip-types scripts/check-verbs.ts` imports the built kernel entrypoint, filters exports to `typeof === 'function'`, and asserts deep equality with `verbs.json`. Fails on any drift in either direction.

#### `no-default-exports` · BLOCKING

Use named exports everywhere. The only permitted default exports are React lazy-loaded route components and the `better-sqlite3` interop import in its quarantine file.

- **Neden:** Default exports break rename-refactors across the workspace, defeat `no-restricted-imports` pattern matching (the local name is arbitrary), and make grep-based architecture checks unreliable — which matters when grep is part of the enforcement strategy.
- **Zorlama:** `import-x/no-default-export: 'error'` with a `files` override for `apps/spa/src/routes/**`. `import-x/no-anonymous-default-export: 'error'`.

#### `no-barrel-files` · BLOCKING

Exactly one barrel per package: `src/index.ts`, which re-exports the public surface and contains no logic. No `index.ts` inside any subdirectory. Import siblings by their real path.

- **Neden:** Intermediate barrels create import cycles that only appear at runtime as `undefined is not a function` during module init, they defeat tree-shaking in the Vite SPA, and they make typed linting materially slower because touching one file pulls the whole subtree into the program.
- **Zorlama:** CI: `! find packages/*/src apps/*/src -mindepth 2 -name index.ts`. Plus `import-x/no-cycle: ['error', { maxDepth: Infinity, ignoreExternal: true }]`.

#### `folder-by-feature` · BLOCKING

Organise by feature, not by kind: `src/pipelines/instagram-carousel/{run.ts,schema.ts,prompt.ts,run.test.ts}`, never `src/{services,types,utils}/`. A directory named `utils`, `helpers`, `common`, `shared`, `lib` or `misc` is forbidden below the package root.

- **Neden:** Folder-by-type means every change to one pipeline touches five directories, and `utils/` becomes the place where kernel purity violations and provider coupling hide because nobody owns it.
- **Zorlama:** CI: `! find packages/*/src apps/*/src -type d -regex '.*/\(utils\|helpers\|common\|shared\|lib\|misc\)$'`.

#### `file-naming-and-size` · BLOCKING

Files are `kebab-case.ts`; test files are `<name>.test.ts` beside the source. Soft ceiling 400 lines for application code, hard ceiling 250 lines for anything under `packages/kernel/src/`. Exceeding the kernel ceiling fails CI.

- **Neden:** Case-insensitive filesystems (a Mac collaborator, a Windows CI runner) turn `Foo.ts`/`foo.ts` into a phantom import failure. The kernel ceiling is not aesthetic: the kernel is meant to be roughly ten concepts, and a 600-line kernel file is evidence that Ring 1 logic has migrated inward.
- **Zorlama:** CI: `! find packages apps -name '*.ts' -path '*/src/*' | grep -P '/[^/]*[A-Z_][^/]*\.ts$'`. Size: `awk 'FNR>250 {print FILENAME; exit 1}' packages/kernel/src/**/*.ts`. Application soft ceiling via ESLint `max-lines: ['warn', { max: 400, skipBlankLines: true, skipComments: true }]`.

#### `parse-dont-validate-zod` · BLOCKING

Every value entering the process from outside — HTTP request bodies, provider responses, YAML frontmatter, environment variables, subprocess stdout, IPC — is passed through a Zod schema's `safeParse` at the boundary module, and only the parsed output type travels inward. Boolean 'validators' that return the input unchanged are forbidden.

- **Neden:** Parsing converts `unknown` into a type once, at a place you can point at; validating leaves `unknown` in scope and invites the assertion that undoes all the strictness flags. Providers change their response shapes without telling you.
- **Zorlama:** `@typescript-eslint/no-unsafe-*` (from `recommendedTypeChecked`) makes untyped data unusable in practice. Architecture check: ESLint `no-restricted-syntax` forbids `MemberExpression[object.name='process'][property.name='env']` outside `packages/config/src/env.ts`. Each provider adapter has a `response.schema.ts` and a test asserting a recorded live fixture parses.

#### `zod-strict-objects` · BLOCKING

Use `z.strictObject()` (not `z.object()`) for every schema describing a file the human authors — corpus frontmatter, registry YAML, provider descriptors, recipes. Use `z.object()` (strip) only for provider HTTP responses.

- **Neden:** `z.object()` silently strips unknown keys, so a typo'd frontmatter key (`titel:`) parses successfully and the field is silently empty — the worst failure mode for a knowledge repo. Provider responses are the opposite case: they gain fields without notice and must not break on them.
- **Zorlama:** ESLint `no-restricted-syntax` scoped to `packages/corpus/**` and `packages/registry/**`: selector `CallExpression[callee.object.name='z'][callee.property.name='object']`, message 'Use z.strictObject for human-authored files.'

#### `ajv-for-published-schemas` · BLOCKING

Registry YAML is validated by Ajv 8 against JSON Schema files checked into `schemas/*.schema.json` (draft 2020-12, `strict: true`, `allErrors: true`), not by Zod. Zod is used only for schemas that exist solely inside TypeScript.

- **Neden:** Registry schemas are a user-facing artifact: they power editor autocomplete via the `$schema` key in the YAML, they are documentation, and the human edits registry files at runtime without running the build. A Zod schema cannot do any of that. Ajv also gives per-field `instancePath` errors, which is what a YAML editor gutter needs. Do not maintain both descriptions of the same shape by hand — generate the TS types from the JSON Schema.
- **Zorlama:** CI: every `registry/**/*.yaml` must declare `# yaml-language-server: $schema=...`; a script asserts it and runs Ajv over all of them. Types generated by `json-schema-to-ts` or a codegen step, with a CI check that regeneration produces no diff.

#### `branded-ids` · BLOCKING

Identifiers and constrained strings are branded, never bare `string`: `RecordId` (ULID, 26 chars, Crockford base32), `HexColor` (`#RRGGBB` lowercase), `Locale` (BCP-47, `tr-TR` / `en-US`), `ProviderId`, `PipelineId`, `Money` (integer minor units + ISO-4217 code). Brands are produced only by the corresponding Zod schema's parse.

- **Neden:** Passing a `PipelineId` where a `ProviderId` is expected typechecks fine with bare strings and fails at runtime inside a paid job. `Money` as a branded integer-minor-units type prevents the float rounding that makes a cost estimate disagree with the ledger.
- **Zorlama:** `export const RecordId = z.string().regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/).brand<'RecordId'>(); export type RecordId = z.infer<typeof RecordId>;` — the brand makes any bare-string assignment a compile error. `@typescript-eslint/no-unnecessary-type-assertion` plus the `no-any-no-assert` rule closes the `as RecordId` escape hatch.

#### `no-floating-promises` · BLOCKING

No promise may be unhandled. `await` it, `return` it, or mark it deliberately with `void promise` accompanied by a `.catch(logAndSwallow)`. Never pass an `async` function where a void-returning callback is expected.

- **Neden:** A floating rejected promise in a render pipeline kills the Node process (Node's default `--unhandled-rejections=throw`) or, worse, silently loses a provider failure so the job reports success with a missing asset. `no-misused-promises` catches the `setTimeout(async () => …)` and `onClick={async …}` shapes where the rejection has nowhere to go at all.
- **Zorlama:** `@typescript-eslint/no-floating-promises: ['error', { ignoreVoid: true, ignoreIIFE: false }]` and `@typescript-eslint/no-misused-promises: ['error', { checksVoidReturn: true }]` — both require `parserOptions: { projectService: true }`. Also `@typescript-eslint/require-await` and `@typescript-eslint/await-thenable`.

#### `abortsignal-everywhere` · BLOCKING

Every exported async function whose work can exceed 100ms accepts `opts: { signal: AbortSignal }` as its last parameter and propagates it into every fetch, subprocess, stream and Playwright call it makes. Long loops call `signal.throwIfAborted()` between iterations.

- **Neden:** A creative job is a tree: pipeline → 4 provider calls → 3 renders → 1 ffmpeg encode. If the human hits cancel in the run queue and the signal only reaches the top, the browser page and the ffmpeg child keep running, keep consuming a paid quota, and keep holding 1.5GB of RSS. AbortSignal is the only cancellation mechanism every one of these APIs already understands.
- **Zorlama:** ESLint `no-restricted-syntax` in `packages/pipelines/**` and `packages/providers/**`: forbid `CallExpression[callee.name='fetch']:not(:has(Property[key.name='signal']))`. Custom check: a Vitest 'cancellation contract' suite that aborts each pipeline at 50ms and asserts (a) the promise rejects with `kind: 'cancelled'` within 2s and (b) `execa` child count and Playwright `browser.contexts().length` return to baseline.

#### `compose-timeout-with-signal` · BLOCKING

Never pass a caller's signal directly to a network call. Always compose: `const signal = AbortSignal.any([opts.signal, AbortSignal.timeout(perCallTimeoutMs)])`, where `perCallTimeoutMs` comes from the provider's YAML descriptor and has no default that means 'infinite'.

- **Neden:** `AbortSignal.any` (Node v20.3.0+) and `AbortSignal.timeout` (Node v17.3.0+) are both built in — no dependency needed. A provider that accepts the TCP connection and then never responds will otherwise hang a job forever, and the run queue will show 'running' for six hours. Every provider descriptor must therefore declare a timeout, and the descriptor schema must make it required.
- **Zorlama:** Ajv schema for provider descriptors marks `timeoutMs` as `required` with `"type":"integer","minimum":1000,"maximum":600000`. ESLint `no-restricted-syntax` forbids `AbortSignal.timeout` outside the shared `withDeadline()` helper so composition is not forgotten.

#### `bounded-concurrency` · BLOCKING

Every fan-out uses an explicit limiter. Use `p-limit` for a bare concurrency cap inside one job and `p-queue` (with `concurrency` + `intervalCap` + `interval`) for the per-provider global queue. A bare `Promise.all` over a dynamically sized array is forbidden; use `Promise.allSettled` behind a limiter.

- **Neden:** `Promise.all(items.map(callProvider))` with 200 corpus records opens 200 sockets, trips every provider's rate limit at once, and — when one rejects — leaves the other 199 running with no way to cancel. `intervalCap`/`interval` is how you honour a documented 60-requests-per-minute limit rather than discovering it via 429s you paid for.
- **Zorlama:** ESLint `no-restricted-syntax`: `CallExpression[callee.object.name='Promise'][callee.property.name='all'] > ArrayExpression ~ *` is too loose, so instead forbid `CallExpression[callee.object.name='Promise'][callee.property.name=/^(all|allSettled)$/] CallExpression[callee.property.name='map']` outside `packages/concurrency/`, and require all fan-out to go through the exported `mapLimited()` / `providerQueue()` helpers.

#### `chromium-pool-not-per-render` · BLOCKING

Launch Chromium once per renderer process into a pool of at most 2 `Browser` instances; create a fresh `BrowserContext` per job and close it in a `finally`. Never call `chromium.launch()` inside a render function. Every context is closed even on abort; the pool is drained on `SIGINT`/`SIGTERM`.

- **Neden:** A cold Chromium launch is 300–800ms and ~120MB; a pipeline producing 30 carousel slides pays that 30 times. Reusing the `Browser` and isolating per job at the `BrowserContext` level gives clean cookies/storage per job at near-zero cost. Leaking contexts is the number-one cause of a laptop-hosted command center hitting swap after an afternoon of runs.
- **Zorlama:** ESLint `no-restricted-imports` blocks `playwright` outside `packages/render/src/browser-pool.ts`. Runtime guard in the pool: if `browser.contexts().length > 4` after a job completes, log at `error` and force-close. Vitest leak test runs 20 sequential renders and asserts `contexts().length === 0` and RSS growth under 150MB.

#### `stream-media-never-buffer` · BLOCKING

Media bytes are never fully materialised in the Node heap. FFmpeg and sharp are driven with streams or file paths; `execa` is called with `buffer: false` and `encoding: 'buffer'` for binary stdio; HTTP uploads of rendered assets use a `ReadableStream` body, not a `Buffer`.

- **Neden:** execa's default `maxBuffer` is 100,000,000 bytes and its default is to buffer — a 4-minute 1080p demo video will either blow it or sit as a ~200MB Buffer in the old space, next to the Chromium screenshots. Buffers over ~2GB are impossible outright.
- **Zorlama:** ESLint `no-restricted-syntax` in `packages/render/**`: forbid `MemberExpression[property.name='toBuffer']` on sharp chains and `Identifier[name='readFileSync']` for anything under `derived/`. CI grep: `rg -n "execa\(" packages/render/src | rg -v 'buffer:\s*false'` must be empty.

#### `subprocess-discipline` · BLOCKING

All subprocesses (ffmpeg, sharp CLI fallbacks, git) run through `execa` with `{ cancelSignal, timeout, forceKillAfterDelay: 10_000, buffer: false, stdin: 'ignore' }`. Never use `child_process.exec` or any shell string interpolation.

- **Neden:** `cancelSignal` is what makes the cancellation contract reach the encoder; `forceKillAfterDelay` is what handles ffmpeg ignoring SIGTERM mid-write (its default is 5000ms — 10s is more forgiving for a long encode flush). Shell interpolation with user-authored filenames from a Turkish corpus is a command-injection and a quoting bug at the same time.
- **Zorlama:** ESLint `no-restricted-imports` on `node:child_process` outside `packages/proc/`. `no-restricted-syntax` forbids `CallExpression[callee.property.name='execaCommand']` and any template literal argument to `execa`. CI grep for `` execa`  `` (the template-tag form) is disallowed in favour of the array form.

#### `sharp-limits` · BLOCKING

Configure sharp once at renderer startup: `sharp.cache({ memory: 64, files: 0, items: 50 }); sharp.concurrency(2);` and set `UV_THREADPOOL_SIZE=8` for the renderer process. Never call sharp from the API server process.

- **Neden:** sharp defaults to a 50MB libvips cache holding 20 open file descriptors, and concurrency defaults to the CPU core count — so three concurrent renders on an 8-core machine spawn 24 libvips worker threads that starve the libuv pool that better-sqlite3 and fs are also using. Pinning concurrency to 2 and files to 0 makes memory and fd usage predictable on a 16GB laptop.
- **Zorlama:** Startup module `packages/render/src/sharp-config.ts` is imported first in the renderer entrypoint; a Vitest asserts `sharp.concurrency() === 2` and `sharp.cache().memory.maxMemory === 64`. ESLint blocks importing `sharp` outside `packages/render/**`.

#### `memory-ceiling` · BLOCKING

Every long-lived process starts with an explicit heap ceiling and dies loudly rather than swapping: renderer `node --max-old-space-size=2048`, API server `--max-old-space-size=512`. A watchdog samples `process.memoryUsage.rss()` every 30s and refuses to accept new jobs above 80% of a configured RSS budget.

- **Neden:** On a single developer laptop that also runs the browser, an editor and the agents, an unbounded Node heap does not crash — it swaps, and then everything on the machine becomes unusable and the human cannot even cancel the run. Failing fast with a heap OOM is strictly better than that.
- **Zorlama:** Ceilings live in `package.json` scripts, asserted by a CI grep. Watchdog is a Vitest-covered module; a smoke test in CI runs the renderer with `--max-old-space-size=256` against a large fixture and asserts the process exits non-zero rather than hanging.

#### `eslint-flat-config-gate` · BLOCKING

The single lint gate is ESLint 10 flat config (`eslint.config.js`) with `typescript-eslint` in `strictTypeChecked` + `stylisticTypeChecked` mode and `parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }`. oxlint may run as a fast pre-commit pass but is never the CI authority; Biome is not used.

- **Neden:** ESLint is the only one of the three that can host the custom kernel-purity rule and the `no-restricted-imports` architectural boundaries with the precision this architecture needs. oxlint's type-aware linting is now stable (it uses tsgo/TS7 internally, so it is unaffected by the TS 6 pin), but its JS plugin API is still alpha. Biome has no type-aware rules at all, which would eliminate `no-floating-promises` — the single most valuable rule in this repo. ESLint 10 removed `.eslintrc` entirely, so there is no legacy path to fall back to.
- **Zorlama:** `pnpm lint` = `eslint . --max-warnings=0` in CI. Pre-commit via lefthook runs `oxlint --fix` then `eslint --fix` on staged files only. `eslint-plugin-oxlint` is applied last in the flat config array to disable rules oxlint already covers, so the two do not double-report.

#### `architectural-boundaries-lint` · BLOCKING

Ring dependencies are enforced by `no-restricted-imports` per directory: kernel imports nothing from registry/corpus/derived/providers/render; registry imports kernel only; corpus imports kernel + registry; derived imports anything; the SPA imports no Node built-in and no server package.

- **Neden:** The four-ring architecture is the whole design. Without a mechanical check, the first 'just this once' import from kernel into providers turns Ring 0 into a god package within a month, and the CI kernel-purity check becomes meaningless because the kernel now transitively knows about attributes anyway.
- **Zorlama:** Flat config block: `{ files: ['packages/kernel/**/*.ts'], rules: { 'no-restricted-imports': ['error', { patterns: [{ group: ['@suite/registry*','@suite/corpus*','@suite/index*','@suite/providers*','@suite/render*'], message: 'Ring 0 kernel may not depend on outer rings.' }] } ] } }`, repeated per ring. Cross-check with `eslint-plugin-boundaries` element types, and `knip` in CI to catch the unused-package drift that hides violations.

#### `exact-pinning-catalog` · BLOCKING

All dependency versions are exact (no `^`, no `~`), declared once in the `pnpm-workspace.yaml` `catalog:` and referenced as `"catalog:"` from every package. `pnpm-lock.yaml` is committed; CI installs with `--frozen-lockfile`.

- **Neden:** A caret range on any of ~40 direct deps means a fresh clone six weeks later builds a different program than the one that was reviewed — and for a repo whose entire premise is being the reproducible source of truth, that is a contradiction. The catalog additionally makes it impossible for two workspace packages to end up on two React or two Zod versions.
- **Zorlama:** `pnpm-workspace.yaml`: `savePrefix: ''`. CI: `pnpm install --frozen-lockfile` and `syncpack lint` (fails on range mismatch or non-catalog reference). A grep asserts no `"[\^~]` appears in any `package.json` dependency block.

#### `supply-chain-hygiene` · BLOCKING

In `pnpm-workspace.yaml` set `minimumReleaseAge: 10080` (7 days), `blockExoticSubdeps: true`, `dangerouslyAllowAllBuilds: false`, and an explicit `allowBuilds:` allowlist naming every package permitted to run install scripts (expect: `better-sqlite3`, `sharp`, `playwright`, `esbuild`). Adding a name to `allowBuilds` is a reviewed change.

- **Neden:** Postinstall scripts are the delivery mechanism for essentially every npm supply-chain compromise, and a 7-day quarantine window means the repo does not install a malicious version during the hours between publication and takedown. `blockExoticSubdeps` stops a transitive dependency from resolving to a git URL or tarball that no registry ever audited. pnpm v11 already defaults `minimumReleaseAge` to 1440; 10080 is the deliberate stricter setting for a one-person team with no other reviewer.
- **Zorlama:** Settings live in `pnpm-workspace.yaml` (committed). CI asserts the file contains them via a YAML parse check. `pnpm audit --audit-level=high` runs in CI and on a weekly schedule; `pnpm licenses list --json` output is diffed against a committed allowlist.

#### `licence-allowlist` · BLOCKING

Only MIT, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause, 0BSD, CC0-1.0, Unlicense and Python-2.0 are permitted. Anything copyleft (GPL/LGPL/AGPL), source-available (BUSL, SSPL, Elastic), or `UNLICENSED`/missing is blocked pending an explicit written exception in `docs/licence-exceptions.md`.

- **Neden:** This repo produces commercial marketing assets for Upcytech and its clients. An AGPL transitive dependency in the render path is a genuine legal problem, and 'we did not notice' is not a defence. HyperFrames being Apache-2.0 is already on the list; that was checked, not assumed.
- **Zorlama:** CI: `pnpm licenses list --json --long | node scripts/check-licences.mjs` exits non-zero on any SPDX id outside the allowlist or on `null`. Exceptions file is read by the same script and each entry requires a `reason` and a `reviewedOn` date.

#### `sixty-line-rule` · BLOCKING

Do not add a dependency you could replace with under ~60 lines of code you fully understand, unless it is (a) a correctness-critical algorithm you would get wrong (parsers, crypto, image/video codecs), (b) a protocol client you would otherwise have to maintain, or (c) already a transitive dependency. Every new direct dependency is justified in the PR body with weekly downloads, last publish date, direct dependency count and licence.

- **Neden:** For a six-person company with one maintainer, the marginal cost of a dependency is not its install size — it is the audit, the breaking-change migration, and the supply-chain surface, forever. Debouncing, deep-equal, slugify, retry-with-backoff and ULID generation are all under 60 lines. Zod, Ajv, Playwright, sharp and better-sqlite3 are emphatically not.
- **Zorlama:** PR checklist item enforced by a GitHub Actions job that diffs `package.json` dependency keys and fails the PR if a key was added and the PR body does not contain a `## Dependency justification` section. `knip` fails CI on any declared-but-unused dependency, which catches the ones added and then abandoned.

#### `node-version-pinned` · BLOCKING

Pin the runtime with `.nvmrc`, `"engines": { "node": ">=22.18.0 <23" }` and `packageManager: "pnpm@11.21.0"` in the root `package.json`; add `pnpm-workspace.yaml` `verifyDepsBeforeRun: install`. Schedule the migration to Node 24 (Active LTS) before Node 22 leaves maintenance.

- **Neden:** better-sqlite3 13 is a native addon compiled against a specific Node ABI — an unpinned Node means a silent `NODE_MODULE_VERSION` mismatch on the next machine. Node 22 (Jod) is Maintenance LTS as of August 2026 while Node 24 (Krypton) is Active LTS; staying on maintenance is fine for a year but must be a decision with a date, not a drift. `>=22.18.0` is the floor because that is where native type stripping is on by default in the 22 line.
- **Zorlama:** `engines` + pnpm's `packageManagerStrict` (default on) make a wrong Node or pnpm fail the install. CI matrix runs on the exact `.nvmrc` version. A calendar reminder plus a CI warning step that prints days-until-EOL from the Node release JSON.

#### `no-console-structured-logs` · WARN

Use the shared pino logger; `console.*` is banned outside `apps/cli/src/render-output.ts` (human-facing terminal output). Every log line for a job carries `{ runId, pipelineId, providerId?, lane: 'free' | 'premium', costMinor? }`.

- **Neden:** When a premium run costs more than expected, the only way to find out which of twenty providers did it is structured logs you can query. `console.log` of an object also stringifies at full depth synchronously on the render path.
- **Zorlama:** `no-console: ['error', { allow: [] }]` with a single `files` override. Pino child logger created per run in the queue; a Vitest asserts every provider adapter call emits a log with `providerId` and `costMinor`.

#### `agent-proposals-typecheck` · BLOCKING

Any branch produced by an agent must pass `pnpm verify` (= `typecheck && lint && test && knip`) before the human is shown the diff for apply. Agents may not commit; they may only push a branch and open a draft.

- **Neden:** The apply step is a human git commit — that is the architectural safety valve. If the human is reviewing a diff that does not compile, the valve is being used to filter noise instead of to make judgement calls, and it will be used less carefully over time.
- **Zorlama:** GitHub Actions `on: push` for `agent/**` branches runs `pnpm verify`; branch protection on the default branch requires the check. The local command center refuses to surface a proposal in the apply UI unless the corresponding check run is green.



### Kalemler (23)

| Ad | Tür | Ne | Erişim | Maliyet | Karar |
|---|---|---|---|---|---|
| typescript 6.0.3 |  | The last TypeScript line built on the JS compiler API, and the newest one typescript-eslint accepts. |  |  | ADOPT — pin exactly. It is the only version that gives both current language features and working type-aware linting. |
| typescript 7.0.2 (native Go compiler) |  | The Go port of tsc, now published as `typescript@latest` on npm. |  |  | HOLD — do not adopt until typescript-eslint supports it. |
| eslint 10.8.1 |  | The lint engine; flat config only. |  |  | ADOPT — this is the CI gate. |
| typescript-eslint 8.67.0 |  | TS parser + rules, including the type-aware ones this rulebook depends on. |  |  | ADOPT — with `projectService: true` and `strictTypeChecked`. |
| oxlint 1.78.0 |  | Rust linter with now-stable type-aware linting via tsgolint/tsgo. |  |  | TRIAL — as a pre-commit fast pass only, never as the CI authority. |
| @biomejs/biome 2.5.8 |  | Rust formatter + linter. |  |  | AVOID for this repo — no type-aware rules. |
| zod 4.4.3 |  | Runtime parsing for every TS-internal boundary; source of branded id types. |  |  | ADOPT — with `z.strictObject` for human-authored files. |
| ajv 8.20.0 |  | JSON Schema validator for registry YAML and provider descriptors. |  |  | ADOPT — for schemas the human sees, not for TS-internal ones. |
| better-sqlite3 13.0.3 |  | Synchronous SQLite + FTS5 for the gitignored Ring 3 index. |  |  | ADOPT — quarantined to one file. |
| playwright 1.62.1 |  | Headless Chromium driver for screenshots and page.pdf. |  |  | ADOPT — pooled, never launched per render. |
| hyperframes 0.7.108 |  | HTML-authored motion rendering (Apache-2.0), Chrome + FFmpeg. |  |  | ADOPT — same pooling and cancellation discipline as Playwright. |
| sharp 0.35.3 |  | libvips image processing for thumbnails, safe-zone overlays, format conversion. |  |  | ADOPT — with explicit cache and concurrency limits. |
| execa 10.0.1 |  | Subprocess wrapper for ffmpeg and git. |  |  | ADOPT — it is the only reason cancellation reaches the encoder. |
| p-limit 7.3.1 / p-queue 9.3.3 |  | Concurrency cap and rate-limited queue respectively. |  |  | ADOPT — p-limit inside a job, p-queue per provider. |
| pnpm 11.21.0 |  | Package manager and workspace/catalog host. |  |  | ADOPT — with the security settings on. |
| knip 6.32.2 |  | Finds unused files, exports and dependencies across the workspace. |  |  | ADOPT — run in CI. |
| publint 0.3.23 + @arethetypeswrong/cli 0.18.5 |  | Validate a package's exports map, types resolution and module format. |  |  | ADOPT — cheap, catches the whole class of exports-map bugs. |
| syncpack 15.3.3 |  | Enforces version consistency and exact pinning across workspace package.json files. |  |  | ADOPT — the enforcement mechanism for the catalog rule. |
| vitest 4.1.10 |  | Test runner, shared config with Vite for the SPA. |  |  | ADOPT. |
| pino 10.3.1 |  | Structured JSON logger. |  |  | ADOPT — with `stdSerializers.errWithCause`. |
| eslint-plugin-boundaries 7.2.0 / eslint-plugin-import-x 4.17.1 |  | Architectural layering rules and import hygiene (cycles, extensions, default exports). |  |  | TRIAL boundaries, ADOPT import-x. |
| lefthook 2.1.10 |  | Git hooks manager for the pre-commit fast pass. |  |  | ADOPT. |
| tsdown 0.22.14 |  | Rolldown-based library bundler for workspace packages that need a dist. |  |  | TRIAL — only if `tsc --build` project references prove too slow. |

<details><summary>Notlar</summary>

**typescript 6.0.3** — Verified from the registry: typescript dist-tags show latest=7.0.2 (2026-07-08), with 6.0.2 and 6.0.3 published earlier in 2026. 6.0.3 satisfies typescript-eslint's peer range `>=4.8.4 <6.1.0`.

**typescript 7.0.2 (native Go compiler)** — Verified: its package.json has `"type": "module"` and `"exports": { ".": "./lib/version.cjs", "./unstable/ast": ..., "./unstable/sync": ..., "./unstable/async": ... }` — the old JS compiler API is gone from the main entrypoint. typescript-eslint 8.67.0 and its canary 8.67.1-alpha.4 both cap at `<6.1.0`, and no 9.x exists. Adopting TS7 silently disables every type-aware rule. Revisit monthly.

**eslint 10.8.1** — v10 removed `.eslintrc` entirely, removed `FlatESLint`/`LegacyESLint`, made `/* eslint-env */` an error, and changed config lookup to search upward from each linted file. Engines: `^20.19.0 || ^22.13.0 || >=24`. `eslint:recommended` gained `no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`.

**typescript-eslint 8.67.0** — peerDependencies: `eslint: ^8.57.0 || ^9.0.0 || ^10.0.0`, `typescript: >=4.8.4 <6.1.0`. Config exports are `tseslint.configs.recommendedTypeChecked`, `.strictTypeChecked`, `.stylisticTypeChecked`. Typed linting costs a full program build before lint; accept it, or scope it to changed files locally.

**oxlint 1.78.0** — Its type-aware mode runs on the native Go compiler (TS7) internally, so it is unaffected by the TS 6 pin. 849+ built-in rules. JS plugins are still alpha, so it cannot host the kernel-purity custom rule. Pair with `eslint-plugin-oxlint` last in the flat config array to avoid duplicate reports.

**@biomejs/biome 2.5.8** — Losing `no-floating-promises` and `no-misused-promises` is not an acceptable trade for a system whose failure mode is a swallowed provider rejection mid-render. Its formatter is excellent; if you want Biome, use it for formatting only and keep ESLint for rules.

**zod 4.4.3** — `.brand<'RecordId'>()` brands the output type by default (second generic accepts `'in' | 'out' | 'inout'`). `z.strictObject` throws on unknown keys, `z.object` strips, `z.looseObject` passes through. `z.iso.date/time/datetime/duration` for frontmatter dates. Prefer spread over `.extend()` on large schemas — `.extend()` is expensive for the TS checker. `zod/mini` exists if SPA bundle size becomes an issue.

**ajv 8.20.0** — Use draft 2020-12 with `{ strict: true, allErrors: true }`. The reason to run both Ajv and Zod is that the registry schemas double as editor autocomplete (`# yaml-language-server: $schema=`) and documentation — Zod cannot do that. Generate TS types from the JSON Schema rather than maintaining both by hand.

**better-sqlite3 13.0.3** — `engines: node >= 22`. Its exports map is platform-conditional (`./linux-x64`, `./darwin-arm64`, `./linuxmusl-x64`, …), i.e. prebuilt binaries per platform. It is a CJS native addon: use `import Database from 'better-sqlite3'` (default only). Docs are explicit that `.transaction()` does not work with async functions and that holding a transaction across event loop ticks is a bad idea.

**playwright 1.62.1** — `engines: node >= 20`. Browser binaries are pinned to the Playwright version — every Playwright upgrade needs `npx playwright install`. Set `PLAYWRIGHT_BROWSERS_PATH` so the binaries live outside the repo and outside node_modules. `page.pdf()` renders with `print` CSS media; call `page.emulateMedia({ media: 'screen' })` first if the deck templates are authored for screen. Useful pdf options: `printBackground` (defaults false — you will want true), `preferCSSPageSize`, `tagged`.

**hyperframes 0.7.108** — `engines: node >= 22`. Because it drives both Chrome and FFmpeg it sits at the intersection of the chromium-pool, subprocess-discipline and stream-media rules; treat its render entrypoint as a job that must accept an AbortSignal and be verified by the cancellation-contract test.

**sharp 0.35.3** — Verified defaults: cache is 50MB memory / 20 files / 100 items; concurrency defaults to the CPU core count (1 on glibc Linux without jemalloc). Both are wrong for a laptop running three renders plus a browser. `sharp.counters()` gives `{ queue, process }` for a health endpoint. `sharp.block()` / `VIPS_BLOCK_UNTRUSTED` are worth setting if you ever process images fetched from a provider.

**execa 10.0.1** — `engines: node >= 22`. Key options verified: `cancelSignal` (sets `error.isCanceled`), `gracefulCancel` (abort via `getCancelSignal()` instead of SIGTERM), `forceKillAfterDelay` (default 5000ms, sends SIGKILL), `timeout` (sets `error.timedOut`), `maxBuffer` (default 100,000,000 bytes), `buffer: false` to stop retaining output, `encoding: 'buffer'` for binary. `subprocess.pipe()` chains stdout to stdin.

**p-limit 7.3.1 / p-queue 9.3.3** — Both `engines: node >= 20`. p-queue's `intervalCap` + `interval` is what encodes a provider's documented requests-per-minute limit; p-limit alone cannot express that. Neither is a candidate for the 60-line rule — the fairness and error-propagation edge cases are where hand-rolled limiters go wrong.

**pnpm 11.21.0** — v11 defaults `minimumReleaseAge` to 1440 minutes; raise to 10080. Also documented: `allowBuilds` (explicit postinstall allowlist), `dangerouslyAllowAllBuilds`, `blockExoticSubdeps`, `trustPolicy: no-downgrade`, `minimumReleaseAgeExclude`, `verifyDepsBeforeRun`, `namedRegistries`. pnpm 12 is in RC (12.0.0-rc.5) — hold until stable.

**knip 6.32.2** — `engines: ^20.19.0 || >=22.12.0`. This is the rule-enforcer for the no-barrel and dependency-justification rules: an unused export is usually a barrel leftover, and an unused dependency is usually one added speculatively by an agent.

**publint 0.3.23 + @arethetypeswrong/cli 0.18.5** — Run `pnpm -r exec publint && pnpm -r exec attw --pack` in CI. attw catches the case where `types` resolves under `moduleResolution: bundler` but not under `nodenext`, which is exactly the split this repo has between the SPA and the server.

**syncpack 15.3.3** — Configure with a `versionGroups` rule requiring `catalog:` for all external deps, and `semverGroups` requiring an empty range prefix.

**vitest 4.1.10** — `engines: ^20.0.0 || ^22.0.0 || >=24.0.0`. v5 is in beta/rc — hold. Node's built-in test runner is a reasonable alternative for the server packages, but sharing one runner and one config with the Vite SPA is worth more than shedding a dependency here.

**pino 10.3.1** — `errWithCause` is what makes the `Error.cause` rule pay off; without it the chain is logged as a bare message and the diagnosis is lost. Use a child logger per run carrying `runId`.

**eslint-plugin-boundaries 7.2.0 / eslint-plugin-import-x 4.17.1** — `no-restricted-imports` with `patterns` covers the four-ring law adequately and is built in; boundaries is worth adding if the per-ring pattern lists become unwieldy. import-x is the maintained fork of eslint-plugin-import and is materially faster on a typed-lint setup.

**lefthook 2.1.10** — Single binary, no Node startup cost per hook. Run `oxlint --fix` and the formatter on staged files only; leave the full typed lint and typecheck to CI so committing stays fast.

**tsdown 0.22.14** — `engines: ^22.18.0 || >=24.11.0`. Prefer plain `tsc --build` with project references first: it is one fewer tool, and it is the tool that already has to run for typechecking anyway.

</details>


### Doğrulanmamış

- Exact release date of `typescript@6.0.3` — the registry version list places it after 6.0.2 and before `7.0.1-rc` (2026-06-18), so roughly April–June 2026, but the `time` field query did not return cleanly. Confirm with `npm view typescript time` before writing it into docs.
- Whether `erasableSyntaxOnly`, `rewriteRelativeImportExtensions` and the other flags quoted from the TSConfig Reference behave identically under `typescript@6.x` and `typescript@7.x`. The reference page tracks the current release; the typescript-go repo's own docs state module resolution is 'not all resolution modes supported yet' and declaration emit 'differs greatly, intentionally'. Since this rulebook pins TS 6, this is only a risk at the eventual TS 7 migration — read `CHANGES.md` in microsoft/typescript-go before that move.
- Exact default values for the pnpm settings named in the supply-chain rule. The supply-chain-security page states `minimumReleaseAge` defaults to 1440 in pnpm v11, but the /settings index page did not expose defaults for `allowBuilds`, `blockExoticSubdeps`, `trustPolicy`, `verifyDepsBeforeRun`, `savePrefix` or `dedupePeerDependents`. Also unconfirmed whether `allowBuilds` fully replaces `onlyBuiltDependencies` in v11 or whether both are accepted — verify on the per-topic pages (/settings/build, /settings/dependency-resolution) before committing pnpm-workspace.yaml.
- Whether `page.pdf()` is restricted to headless Chromium. The current Playwright page docs quoted here confirm it renders with `print` CSS media and list its options, but do not repeat the older 'Chromium headless only' restriction. Test a headed run before assuming either way, since it affects whether one browser pool can serve both screenshots and decks.
- Which specific type-aware rules oxlint 1.78 implements. The oxc linter guide announces type-aware linting as stable and names floating-promise detection, but does not publish a complete rule list on that page. `no-misused-promises` coverage in particular is unconfirmed — do not rely on oxlint alone for the async discipline rules.
- The HyperFrames API surface (render entrypoint signature, whether it accepts an AbortSignal, how it invokes FFmpeg and whether it reuses a Chrome instance). Only the npm metadata was verified: `hyperframes@0.7.108`, `engines: node >= 22`, with `@hyperframes/core` at the same version. The cancellation and pooling rules must be checked against its actual API and may need a wrapper.
- Whether `AbortSignal.any()` triggers Node's MaxListenersExceededWarning when a single long-lived job signal is composed into many per-call signals. The globals doc did not address it. If it appears, `events.setMaxListeners(n, signal)` is the documented remedy — verify empirically under a 200-call fan-out.
- The exact Node 22 (Jod) end-of-life date. The previous-releases page confirms v22 is Maintenance LTS, v24 (Krypton) is Active LTS and v26 is Current as of August 2026, but the dates extracted from that table were last-updated timestamps rather than EOL dates. Read the release schedule JSON at nodejs.org/dist/index.json or the nodejs/Release repo before scheduling the Node 24 migration.
- better-sqlite3's official position on worker threads, ESM import style and `unsafeMode` — the API doc quoted covers synchronous behaviour, prepared statements, `.transaction()`, `.pragma()` and the event-loop warning, but not these. The default-import rule is derived from Node's documented CJS named-export static analysis limits, not from a better-sqlite3 statement. Verify with a one-line smoke import before relying on it.
- Whether `eslint-plugin-boundaries@7.2.0` and `eslint-plugin-import-x@4.17.1` are fully compatible with ESLint 10's removed context APIs (`getCwd`, `getFilename`, `getSourceCode`, `parserOptions`, `parserPath`). Their declared engines predate ESLint 10. Run them against ESLint 10.8.1 before making either load-bearing for the four-ring enforcement; `no-restricted-imports` is built in and has no such risk, which is why it is the primary mechanism in the rules.
- The precise ESLint `no-restricted-syntax` selectors quoted throughout (for `TSParameterProperty`, `MemberExpression[property.name='attributes']`, the Promise.all/map combination, the sharp `toBuffer` chain). The selector syntax is real esquery, but each one needs testing against the actual AST in the ESLint playground — a selector that matches nothing fails silently and gives false confidence, which for the kernel-purity rule would be worse than having no rule. Write a fixture test per selector asserting it reports on a known-bad snippet.


### Anti-desenler

- Upgrading to `typescript@latest` because it is latest. You get 7.0.2, the native Go compiler, whose exports map no longer serves the JS compiler API. Symptom: `pnpm lint` still exits 0, but every type-aware rule has silently stopped running — typescript-eslint 8.67.0 caps at `<6.1.0` and will either warn once about an unsupported version or fail to construct a program. Nothing is red. Weeks later a floating promise in a provider adapter loses a rate-limit error and a premium run reports success with a missing video.
- Turning on `noUncheckedIndexedAccess`, hitting 300 errors in the registry lookups, and 'fixing' them with `!`. You now have all the ceremony of the flag and none of the protection, plus a runtime `TypeError: Cannot read properties of undefined` that the flag was specifically bought to prevent. If you cannot afford the guards, turn the flag off honestly rather than defeating it.
- Extensionless relative imports in a package configured with `moduleResolution: bundler`. tsc is perfectly happy, `pnpm typecheck` is green, the SPA builds — and the Hono server dies on boot with `ERR_MODULE_NOT_FOUND: Cannot find module '/…/pipeline'`. Because it only affects Node-executed packages, this is usually found by the user, not by CI.
- `import { Database } from 'better-sqlite3'`. Typechecks (the .d.ts has the named export), throws at runtime: Node's static analysis of the CJS module does not surface it as a named ESM export. The correct form is the default import, and this is exactly why the dependency is quarantined to one file.
- Holding a better-sqlite3 transaction across an `await`. Because the driver is synchronous, the transaction is open while the event loop runs other work — so the Hono request handler, the render queue tick and the FTS5 rebuild all block on a locked database. Symptom: the whole command center freezes for the duration of one provider call, and `SQLITE_BUSY` appears under any concurrency.
- `await Promise.all(records.map(r => callProvider(r)))`. With 200 corpus records this opens 200 concurrent requests, trips the provider's rate limit, and — the moment one rejects — leaves 199 requests running with no signal reaching them. You are billed for all of them and you have no results. The rejection also arrives before the others settle, so the cost ledger records a fraction of what was actually spent.
- Passing the caller's AbortSignal straight into `fetch` with no timeout composed in. A provider that accepts the connection and then stalls holds the job open forever; the run queue shows 'running' indefinitely, the Chromium context stays alive, and the only recovery is killing the process — which also kills the four healthy jobs beside it.
- Cancelling a job and only aborting at the top level. The Playwright `BrowserContext` and the FFmpeg child are still running. Symptom: after an afternoon of cancelled experiments, `ps` shows nine ffmpeg processes and RSS is 6GB, the laptop is swapping, and the human cannot even open the UI to diagnose it. This is the single most likely way this system becomes unusable in practice.
- `chromium.launch()` inside the render function 'because it is cleaner'. Thirty carousel slides means thirty cold launches: roughly 15–20 seconds of pure startup and thirty chances to leak a browser if a render throws before the `finally`. Reuse the Browser, isolate with a fresh BrowserContext.
- Leaving sharp at its defaults on a 16GB laptop. Concurrency defaults to core count, so three parallel renders on an 8-core machine spawn ~24 libvips threads that contend with better-sqlite3 and fs for the same libuv pool; the 20-file cache also holds file descriptors open. Symptom: image operations that take 200ms alone take 4s under load, and `EMFILE` appears on large batches.
- `execa` with default buffering for an ffmpeg encode. Default `maxBuffer` is 100,000,000 bytes and the default is to buffer, so a long 1080p encode either throws `error.isMaxBuffer` after burning the full encode time, or sits as a ~200MB Buffer in the heap right next to the Chromium screenshots. Set `buffer: false` and write to a path.
- Catching a provider error and rethrowing `new Error(`Provider failed: ${e}`)`. The HTTP status, the request id and the `retry-after` header are gone permanently. Two weeks later you are trying to work out whether the failures are auth, quota or genuine outage, and the logs say `Provider failed: Error: Request failed` fifty times.
- Modelling errors as an open `Error` hierarchy 'so it is extensible'. The UI grows a `default:` branch that renders 'bir hata oluştu', the retry logic grows a `if (message.includes('rate'))` heuristic, and adding a provider becomes a change in three rings. A closed discriminated union with `assertNever` makes the compiler tell you where the new case is unhandled.
- Using `z.object()` for corpus frontmatter. It strips unknown keys, so a typo'd `titel:` parses cleanly and the record silently loses its title. In a repo whose whole value proposition is being the source of truth, silent data loss on a typo is the worst possible default. Use `z.strictObject()`.
- Intermediate `index.ts` barrels 'for tidier imports'. They create import cycles that manifest only at runtime during module initialisation as `undefined is not a function`, they defeat the SPA's tree-shaking, and they make typed linting slower because touching one file pulls its whole subtree into the program. They also make `no-restricted-imports` architectural patterns unreliable, since the barrel launders the real path.
- Caret ranges plus a stale lockfile. `pnpm install` on a new machine six weeks later resolves different minors across forty packages; the render output shifts by a pixel, the FTS5 tokenizer behaves differently, and there is no way to tell which change did it. Exact pins plus `--frozen-lockfile` in CI, or accept that the repo is not reproducible.
- Adding a dependency for something that is 40 lines. Each one carries an audit obligation, a breaking-change migration, and a supply-chain surface, forever, for one maintainer. The counter-antipattern is equally real: hand-rolling a retry-with-jitter queue or a YAML parser and getting the edge cases subtly wrong. The line is 'would I get this wrong', not 'is this short'.
- Letting agents commit. The apply step is the architectural safety valve; the moment an agent can commit, the human's review becomes advisory and then ceremonial. Agents propose on a branch, CI proves the branch compiles and lints, the human commits.
- Treating `pnpm audit` as the whole supply-chain story. Audit only knows about disclosed advisories, which by definition arrive after the fact. `minimumReleaseAge`, an explicit `allowBuilds` allowlist and `blockExoticSubdeps` are the controls that act before disclosure, and they cost nothing after the first configuration.
