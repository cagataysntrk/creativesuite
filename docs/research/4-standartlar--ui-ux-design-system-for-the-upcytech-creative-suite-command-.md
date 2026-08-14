# UI/UX design system for the Upcytech Creative Suite command center — a dark, dense, keyboard-first shell that opens into airy full-screen creative surfaces, in an industrial-instrumentation visual vernacular (Vite + React + Tailwind v4 + shadcn/ui SPA, Turkish content, English code)

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Özet

The brief is one app with two colour contexts, not one app with a theme toggle. The CONSOLE (nav, run queue, cost, analytics) is permanently dark, 13px base, 28px rows, no shadows, no rounded corners beyond 4px. The STUDIO (variants, deck preview, video, safe-zone inspector) is a permanently light plate laid inside the dark frame, reached by a route with a View Transition — never a modal. Because the console never becomes light and the studio never becomes dark, `prefers-color-scheme` and any user theme switch are ignored by construction, and theme thrash cannot happen. Both contexts are expressed as `[data-surface="console"|"studio"]` blocks that redefine only tier-2 semantic tokens plus `color-scheme`, wired into Tailwind v4 via `@theme inline { --color-bg: var(--bg) }` — the pattern Tailwind's own docs prescribe for referencing other variables.

The aesthetic comes from instrumentation, not AI-startup dark mode. Concretely taken: ISA-101/high-performance-HMI's principle that colour means abnormal (so the console is near-neutral steel at chroma ≤ 0.02 and every hue is a signal); alarm-management's rule that a state is never colour alone (glyph + colour + text); metrology's tolerance band (the run's ETA is a p20–p80 band, not a point; the cost accrual is a capability chart against the budget cap as a spec limit); the graduated scale (safe-zone rulers and the video timeline carry major/minor ticks and numeric labels); andon stack lights (a 3px status rail on the row edge, never a pill badge); screen-printed panel legends (11px uppercase mono micro-labels — English keys only, because Turkish must never be CSS-uppercased).

Turkish drives three hard constraints: `lang="tr"`, no `text-transform` on Turkish strings (the i/İ and ı/I mapping is unreliable across engines), and a 20% expansion headroom enforced by a pseudo-localization overflow test on every reference screen. Every number in the app is IBM Plex Mono, tabular, slashed-zero, with its unit in a separate muted span.

The deliverable below is 38 enforceable rules. Where I could not verify a number from a primary source this session — Linear/Raycast published keymaps, ISA-101's paywalled normative text, Meta/LinkedIn channel geometry, APCA, caption conventions — it is in `unverified`, and channel geometry is architecturally forced into Ring 1 YAML so the UI never hardcodes it.


### Kurallar (41)

#### `dual-color-context` · BLOCKING

Express the dark console and light studio as two scoped colour contexts on a `data-surface` attribute — `[data-surface="console"]` and `[data-surface="studio"]` each redefine ONLY the tier-2 semantic variables plus `color-scheme: dark|light`, and are wired to Tailwind through `@theme inline { --color-bg: var(--bg); ... }`; a studio plate is always inset inside a persistent console frame with a minimum 12px dark gutter on all four sides.

- **Neden:** A theme toggle, `prefers-color-scheme`, or a `.dark` class on `<html>` makes the whole chrome flip when you open a variant, which is theme thrash: the run queue, cost meter and status bar visibly change identity 20 times a day. Scoping the context to a subtree keeps the frame constant and makes the studio read as 'opening into' rather than 'switching'. `color-scheme` is also the only way to get correct UA scrollbars and form controls per subtree.
- **Zorlama:** CI grep: `rg -n 'prefers-color-scheme|\.dark|dark:' apps/ui/src` must return zero hits. A second grep asserts every `[data-surface=...]` block in `apps/ui/src/styles/context.css` declares `color-scheme`. Playwright screenshot test on the queue→studio route asserts the top bar's computed `background-color` is byte-identical before and after the transition.

#### `token-tiers` · BLOCKING

Colour lives in exactly three tiers: tier 1 reference ramps (`--ref-steel-1..12`, `--ref-paper-1..12`, `--ref-brand-1..12`, `--ref-red-*`, `--ref-amber-*`, `--ref-green-*`, `--ref-cyan-*`) written as literal `oklch(L C H)` and NEVER referenced by a component; tier 2 semantic roles (`--bg-1..3`, `--fg`, `--fg-muted`, `--line-hair`, `--line-edge`, `--line-rule`, `--focus`, `--signal-ok|warn|error|stale|running`) defined per surface context; tier 3 component tokens (`--btn-*`, `--row-*`, `--rail-*`) that reference only tier 2.

- **Neden:** Without the ban on tier-1 usage, `bg-steel-3` leaks into components and the studio context cannot override it — you end up with dark chips floating on the light plate. The tier split is what makes one component tree render correctly in both contexts with zero conditionals.
- **Zorlama:** CI grep over `apps/ui/src/**/*.{tsx,css}`: any occurrence of `--ref-` or a Tailwind class matching `-(steel|paper|brand)-([0-9]|1[0-2])\b` outside `apps/ui/src/styles/tokens.css` and `context.css` fails the build. Signal ramps carry the same hue in both contexts; only the L step differs.

#### `no-user-theme-toggle` · BLOCKING

Ship no theme switcher, no system-theme detection and no persisted theme preference; the console is dark and the studio is light, permanently.

- **Neden:** This is a single-operator local tool. A toggle doubles the token surface, doubles the contrast test matrix, and creates a second, always-worse design that nobody maintains. Removing the choice is what buys the density and the shadow-free elevation model.
- **Zorlama:** PR checklist item; CI grep for `localStorage` keys matching `/theme|colorMode|colorScheme/` and for `matchMedia('(prefers-color-scheme` returns zero hits.

#### `chroma-cap` · BLOCKING

Cap OKLCH chroma by area: any fill covering more than 25% of the viewport uses C ≤ 0.02; borders and rules C ≤ 0.04; body and muted text C ≤ 0.06; solid signal fills may reach C ≤ 0.16 but only on regions under 4% of the viewport. Console neutrals sit on hue 250 with C stepping 0.006 → 0.013 across steps 1–12.

- **Neden:** High chroma at low lightness in OKLCH falls outside sRGB, so the browser gamut-maps it and you get hue drift plus visible 8-bit banding across a large panel on a 27-inch monitor. It also destroys the instrumentation principle: if the background is tinted, a genuine amber warning stops reading as an event.
- **Zorlama:** Node script in CI parses `tokens.css` with `culori`, computes the sRGB-clipped delta for every `oklch()` literal, and fails if any token used as a `--bg-*` role exceeds C 0.02 or if any token's clipped ΔE00 exceeds 1.0.

#### `no-box-shadow` · BLOCKING

Ban `box-shadow`, `drop-shadow`, `backdrop-filter` and any gradient in the console; express elevation as (a) a background step 1→2→3, (b) a bevel hairline where a panel's block-start border is `--line-edge` while its other three sides are `--line-hair`. The only permitted shadow is on elements carrying `[data-elevation="overlay"]` (dialog, popover), and the `::backdrop` is a flat scrim `oklch(0.14 0.005 250 / 0.72)` with no blur.

- **Neden:** Shadows are near-invisible on dark surfaces, so shadcn's `shadow-sm`/`shadow-md` produce cost with no signal and a muddy edge. The background-step + bevel-hairline ladder is legible at any brightness and is the machined-panel read.
- **Zorlama:** Stylelint `declaration-property-value-disallowed-list` for `box-shadow`, `filter: drop-shadow`, `backdrop-filter`, `background-image: linear-gradient` scoped to `apps/ui/src/**` with an exception file for `overlay.css`. Grep for Tailwind classes `shadow-`, `backdrop-blur-`, `bg-gradient-`.

#### `contrast-ci-test` · BLOCKING

Every semantic foreground token must be asserted against every background token it can legally sit on, computed (not eyeballed) with the WCAG 2.x relative-luminance formula: text ≥ 4.5:1, text ≥ 18pt or 14pt-bold ≥ 3:1, and every non-text token that carries meaning (`--line-hair` when it separates data, `--focus`, all `--signal-*`, chart axes, safe-zone boundary, video playhead) ≥ 3:1.

- **Neden:** WCAG 2.2 SC 1.4.3 and 1.4.11 (both Level AA). OKLCH lightness is not WCAG luminance, so a token pair that looks separated in the ramp can measure 3.9:1. On dark surfaces `--fg-muted` is the token that fails, and it is the one used for every timestamp and unit in the app.
- **Zorlama:** `pnpm test:contrast` — a Vitest suite that imports the parsed token table and asserts a matrix of pairs; runs in CI on every PR touching `tokens.css` or `context.css`.

#### `accent-budget` · WARN

The brand accent `oklch(0.72 0.13 172)` may appear in at most three places on any single screen: the focus ring, the current-selection rail, and the one primary action of the current surface. It is a LINE, not a fill, everywhere except that single primary button. It never appears in a chart series, a logo watermark, a background, or a hover state.

- **Neden:** The generic-AI-dark-mode tell is a neon accent sprayed across hovers, icons, links and gradients. Restricting the accent to selection-and-intent is what makes the one place it appears actually mean something, and it keeps the shell reading as a control room rather than a landing page.
- **Zorlama:** Playwright reference-screen test: screenshot the 12 canonical screens, count pixels within ΔE00 < 8 of the brand colour, fail if the count exceeds 2% of viewport pixels. Plus a grep banning brand tokens in `charts/`.

#### `status-glyph-plus-color` · BLOCKING

Every state (run status, QA verdict, budget state, index freshness) is encoded with a glyph AND a colour AND a text label; there are at most five run states (`kuyrukta`, `çalışıyor`, `beklemede`, `başarılı`, `hata`) and at most four QA verdicts (`✓ geçti`, `! sınırda`, `✕ kaldı`, `– çalışmadı`). Colour alone is never the carrier.

- **Neden:** Alarm-management practice: a limited, redundantly-coded state vocabulary is what lets an operator read a queue at a glance without decoding. It also satisfies WCAG 1.4.1 for the same reason, and it survives the exported screenshots that end up in decks.
- **Zorlama:** The status union is a TypeScript literal type in `apps/ui/src/domain/status.ts`; a Vitest test asserts the render map has exactly one glyph and one Turkish label per member and that no component imports the colour token without the glyph component. `tsc` exhaustiveness check on the switch.

#### `type-scale-locked` · BLOCKING

Use exactly nine sizes, all declared as Tailwind v4 `--text-*` tokens with paired `--text-*--line-height`: micro 11px/12px/500/+0.06em, 2xs 12px/16px/450, xs 13px/16px/450 (the console default), sm 14px/20px/450, base 15px/22px/400, md 17px/24px/500, lg 22px/28px/550, xl 28px/32px/550, readout 36px/36px/500 mono. Weights are limited to 400/450/500/550/650; weight 700 is banned in the console. No arbitrary `text-[...]` values.

- **Neden:** A dense grid only survives if the line box is a multiple of 4px — 13px/16px is what makes a 28px row hold one line with 6px of padding above and below. Turkish is diacritic-dense (ğ ş ç ö ü ı İ), so no console size may have a line box under 16px or ascender/descender collisions appear at 13px. Bold at 13px on a dark background blooms and reduces legibility.
- **Zorlama:** `--text-*` namespace fully overridden with `--text-*: initial` in `@theme` before redefining, so unlisted sizes generate no utility. ESLint `tailwindcss/no-arbitrary-value` (or a CI grep for `text-\[`) fails the build.

#### `tabular-numerals-and-units` · BLOCKING

Every numeric value that appears in a table, a metric, a cost, a duration, a dimension or a count sets `font-variant-numeric: tabular-nums slashed-zero lining-nums` and renders its unit in a sibling `<span class="unit">` at 0.85em in `--fg-muted`. Prose keeps proportional figures. Numbers are formatted with `Intl.NumberFormat('tr-TR')` (decimal comma, thousands dot).

- **Neden:** Without `tnum` a live cost readout reflows on every digit change and columns fail to align, which is exactly the failure a cost table exists to prevent. `slashed-zero` disambiguates 0/O in provider ids and hashes. Separating the unit is the instrumentation convention and stops '1.284₺' reading as one token. Both `tabular-nums` and `slashed-zero` map to the OpenType `tnum`/`zero` features Inter ships.
- **Zorlama:** A `<Num value unit>` component is the only sanctioned way to render a number; CI grep fails on `toLocaleString()` or template-literal number interpolation inside `td`/`role="gridcell"` JSX. Vitest snapshot asserts the computed `font-variant-numeric` on every metric cell in the reference render.

#### `mono-for-machine-text` · CONVENTION

IBM Plex Mono is used for and only for: all numerals in tables and readouts, record ids, git shas, file paths, provider/model identifiers, log output, keyboard key caps, and the 11px uppercase micro-legends. Inter is used for all Turkish prose and all control labels. No third family.

- **Neden:** The Inter + Plex Mono pairing, with mono carrying every machine-generated string, is the single strongest identity signal and it is functional: it tells the operator at a glance which strings are typed by a human and which are emitted by the system. Two families is also the whole webfont budget for an offline-first local tool.
- **Zorlama:** `--font-*` namespace set to `initial` then redefined with exactly `--font-sans` and `--font-mono`; grep bans `font-family` declarations outside `tokens.css` and any `font-['...']` arbitrary value.

#### `no-css-uppercase-tr` · BLOCKING

`text-transform: uppercase` is permitted only on elements carrying `lang="en"` or `data-legend`; `text-transform: capitalize` and `text-transform: lowercase` are banned outright. `<html lang="tr">` is mandatory and every English fragment (verb names, model ids, paths) is wrapped in `<span lang="en">`.

- **Neden:** Turkish has two i's with two case pairs (i/İ and ı/I). CSS case mapping is language-dependent via `lang`, but MDN states support varies between browsers — so CSS-uppercasing 'iptal' can yield 'IPTAL' instead of 'İPTAL'. `capitalize` is under-specified and applies no language rules at all. WCAG 3.1.1/3.1.2 additionally require the language to be programmatically determinable.
- **Zorlama:** Stylelint disallowed-list for `text-transform: capitalize|lowercase`; CI grep for `uppercase` in className/CSS reports the file and requires an adjacent `lang="en"` or `data-legend` in the same element (reviewed manually on hit). An `eslint-plugin-jsx-a11y` `html-has-lang` rule plus a unit test asserting `document.documentElement.lang === 'tr'`.

#### `locale-aware-string-ops` · BLOCKING

In `apps/ui/src`, `String.prototype.toUpperCase()`, `toLowerCase()` and zero-argument `localeCompare()` are banned; use `toLocaleUpperCase('tr')`, `toLocaleLowerCase('tr')` and a shared `new Intl.Collator('tr')` instance for all sorting, filtering and command-palette matching.

- **Neden:** Case-insensitive search over Turkish records silently fails on any word containing i or I — searching 'İZMİR' will not match 'izmir' under the invariant mapping. The command palette is the primary navigation, so this bug makes the app feel broken.
- **Zorlama:** ESLint `no-restricted-properties` for `toUpperCase`, `toLowerCase`; `no-restricted-syntax` selector for `CallExpression[callee.property.name='localeCompare'][arguments.length<2]`. A Vitest case asserts the palette matches 'ışık' when the user types 'ISIK'.

#### `turkish-expansion-headroom` · BLOCKING

No label, button, tab, menu item, table header or chip may have a fixed `width`/`inline-size`; buttons use `min-inline-size: 96px` with `padding-inline: 12px`, nav items may wrap to two lines with `line-clamp: 2`, and the table header row is 40px (two lines) not 28px. Every reference screen must render with a pseudo-localization pass that expands each string by 30% without horizontal overflow.

- **Neden:** Turkish runs roughly 20% longer than English for the same UI label ('Approve' → 'Onayla ve uygula'), and agglutination produces long single words that cannot be hyphenated by the browser without `lang` hints. Fixed widths turn that into truncation on the exact controls that carry irreversible actions.
- **Zorlama:** Playwright test with `?pseudo=1` (a dev-only flag that pads every i18n string by 30% and swaps i↔İ, ı↔I) asserting `document.querySelectorAll('*')` has no element where `scrollWidth > clientWidth + 1` on all 12 reference screens. Stylelint bans `width:` on `.btn`, `.label`, `.tab` classes.

#### `latin-ext-selfhost` · BLOCKING

Self-host Inter and IBM Plex Mono as woff2 in `apps/ui/public/fonts` with subsets that include latin AND latin-ext (at minimum U+0100-024F, U+0131, U+015E-015F, U+011E-011F, U+00C7, U+00D6, U+00DC and their lowercase forms); no external font CDN. Declare `unicode-range` explicitly and set `font-display: swap` with a matching `size-adjust` fallback.

- **Neden:** A latin-only subset drops ğ ş ı İ and the browser falls back per-glyph, so a Turkish label renders in two typefaces at two widths mid-word. And a CDN font breaks the tool entirely when the machine is offline, which for a local-first command center is a hard failure, not a degradation.
- **Zorlama:** CI script opens each shipped woff2 with `fonttools`/`opentype.js`, asserts the cmap contains the required codepoints, and fails otherwise. CSP header / grep bans `fonts.googleapis.com` and `fonts.gstatic.com`.

#### `spacing-six-steps` · WARN

Base spacing unit is 4px (`--spacing: 0.25rem`). The console may use only steps 1, 2, 3, 4, 6 and 8 (4/8/12/16/24/32px); the studio adds 12, 16 and 24 (48/64/96px). Steps 5, 7, 9, 10, 11 and all arbitrary `p-[...]`/`gap-[...]` values are banned.

- **Neden:** Six steps is what forces a decision rather than a nudge, and it is what keeps a 28px row, a 40px header and a 24px group header on the same 4px lattice so columns align across independently-built panels. The studio needs the bigger steps precisely because it is airy — the density difference between the two contexts is carried by spacing, not by colour.
- **Zorlama:** CI grep fails on `\b(p|m|gap|space)[xytrbl]?-(5|7|9|10|11)\b` and on `-\[` arbitrary spacing values inside `apps/ui/src/console/`. The full `--spacing-*` namespace is not overridden, so this is a lint rule, not a token rule — the grep is the enforcement.

#### `row-height-28` · WARN

Queue and table rows are 28px (`--row-h-compact`, the default), 32px (`--row-h-default`) or 40px (`--row-h-relaxed`, two-line Turkish labels); headers are 40px, sticky group headers 24px. Density is a per-table setting persisted locally, defaulting to compact. Row vertical padding is 6px at 28px; content that does not fit is not shrunk, the row moves to `relaxed`.

- **Neden:** The whole point of the shell is seeing 30+ runs without scrolling; shadcn's default 40px+ row shows 18. 28px with 13px/16px type is the tightest height that still passes SC 2.5.8 as a full-width target and still holds Turkish descenders.
- **Zorlama:** Row heights come from `--row-h-*` tokens only; CI grep bans `h-[` and numeric `h-` utilities inside `apps/ui/src/console/queue/`. Playwright asserts `getBoundingClientRect().height === 28` on the default queue row.

#### `table-not-cards` · CONVENTION

Any collection whose items have more than two comparable numeric or categorical attributes renders as a `role="grid"` table; any collection whose primary content is a rendered pixel renders as a contact sheet. No collection ships both views and there is no view toggle.

- **Neden:** A card list of runs makes cost, duration and status incomparable across rows, which is the only reason the queue exists. A table of image variants makes you read filenames instead of looking at pictures. A toggle means neither view is designed well and the operator pays a decision cost 20 times a day.
- **Zorlama:** PR checklist item plus a grep: any component under `console/` rendering `.map(` into an element with `rounded-` and `border` that is not inside `MediaGrid` gets flagged for review. `role="grid"` presence asserted by the axe test.

#### `constant-media-stage` · BLOCKING

All studio media renders into one constant stage box: `display: grid; place-items: center;` with `--stage-pad: 48px`, `max-inline-size: 1200px`, `max-block-size: calc(100vh - var(--topbar-h) - var(--stage-pad)*2 - var(--filmstrip-h))`, asset `object-fit: contain`, unused area filled with `--bg-2` of the studio context (never black, never a checkerboard). Prose in the studio is capped at `--measure: 68ch`.

- **Neden:** A 4:5 image at 1080×1350 and a 16:9 video only both feel intentional if the frame is the constant and the asset is centred inside it — sizing the container to each asset makes the app jump geometry on every arrow-key press. 68ch rather than the usual 60–65ch because Turkish words are longer.
- **Zorlama:** A single `<Stage>` component owns these styles; CI grep bans `aspect-` utilities and `object-cover` inside `apps/ui/src/studio/`. Playwright asserts the stage bounding box is identical when displaying a 4:5 asset and a 16:9 asset.

#### `surface-is-a-route` · BLOCKING

Opening a creative surface is a route change (`/queue` → `/run/:id/variants`), never a modal, drawer or sheet. `<dialog>.showModal()` is permitted for exactly three things: the command palette, an irreversible-action confirm, and provider credential entry. Nothing else may enter the top layer.

- **Neden:** The studio is where you spend real time — it needs to be deep-linkable, back-button-navigable, refreshable, and leaveable while a run continues. A modal is a focus trap that also blocks the run queue behind it. Restricting the top layer to three cases means `showModal()`'s built-in inert + Esc semantics are the only focus-trap code in the app.
- **Zorlama:** CI grep: `showModal(`, `<Dialog`, `role="dialog"` occurrences must appear only in `components/CommandPalette.tsx`, `components/ConfirmDestructive.tsx`, `components/ProviderCredentials.tsx` — an allowlist test asserts the file set.

#### `view-transition-nav-only` · BLOCKING

Use `document.startViewTransition({ update, types: ['enter-studio'|'exit-studio'] })` for shell↔surface navigation only, with `view-transition-name: run-plate` on the source thumbnail and target plate and `view-transition-class: variant-cell` on contact-sheet cells (each still needs a unique name). Explicitly disable the default root crossfade with `::view-transition-old(root), ::view-transition-new(root) { animation: none; }`. Never wrap a data mutation, a streaming update or anything on the run queue in a view transition, and skip `startViewTransition` entirely when `prefers-reduced-motion: reduce` matches.

- **Neden:** The default behaviour crossfades the entire document, which on a dense shell looks like a page reload and hides the fact that one element moved. A view transition also freezes the rendered page while it runs — doing that around a live 6-minute run's progress or a streaming token feed stalls the exact feedback the user is watching.
- **Zorlama:** A single `navigateWithTransition()` helper is the only sanctioned caller; CI grep fails on `startViewTransition` outside `apps/ui/src/nav/transition.ts`. That helper checks `matchMedia('(prefers-reduced-motion: reduce)').matches` and the presence of the API before calling. Unit test asserts the root-crossfade override exists in the compiled CSS.

#### `seven-surface-states` · BLOCKING

Every data-bearing surface implements all seven states: `empty`, `loading`, `streaming`, `ready`, `stale`, `error`, `success`. They are a TypeScript discriminated union and every route component renders through a `<Surface>` whose props require a slot for each.

- **Neden:** The states that get skipped are always `stale` and `streaming`, and this app's architecture guarantees both: Ring 3 is a gitignored derived index that will lag Ring 2, and agents emit partial output. A surface without a stale state silently shows the operator yesterday's search results and they commit against them.
- **Zorlama:** `SurfaceProps` declares all seven slots non-optional, so `tsc --strict` fails on omission. A CI grep asserts every file under `apps/ui/src/routes/` default-exports a component whose JSX root is `<Surface`.

#### `loading-delay-and-no-spinner` · BLOCKING

Do not render a loading state before 200ms have elapsed, and once rendered hold it for at least 400ms. Loading is a skeleton whenever the shape is known — exactly the expected number of rows or cells, at the real row height, filled `--bg-3` with a 1px `--line-hair`, and with NO shimmer animation. Indeterminate spinners are banned everywhere except a 16px glyph inside a button the user just pressed. Any operation with a countable step set uses a determinate step rail.

- **Neden:** A flash of skeleton for a 40ms local SQLite query is worse than nothing. Shimmer is a decorative loop running in the operator's peripheral vision all day, and it has to be killed under reduced-motion anyway, so it can never be load-bearing. A spinner for a known-length pipeline throws away information the system already has.
- **Zorlama:** A `useDelayedLoading(200, 400)` hook is the only sanctioned source of the loading boolean; CI grep bans `animate-pulse`, `animate-spin` (outside `Button.tsx`) and `<Spinner` outside `Button.tsx`.

#### `stale-never-dims` · BLOCKING

Stale content renders at full opacity and full interactivity; staleness is signalled by a 2px hatched rule in `--signal-stale` across the panel's block-start edge, plus a mono timestamp in the panel header (`indeks 4 dk geride`) and a `Yenile` action. Never auto-refetch a surface the user is currently viewing, and never dim, blur or disable stale content.

- **Neden:** Dimming reads as disabled and makes the operator stop trusting content that is usually still correct. Auto-refetching under the cursor moves the row you were about to approve. The derived FTS index is rebuildable and therefore routinely behind — stale is a normal state here, not an error.
- **Zorlama:** Every component reading from the SQLite/FTS layer must accept an `indexedAt: Date` prop (enforced by the query-hook's return type); `tsc` fails otherwise. Stylelint bans `opacity` values below 1 on `[data-state="stale"]` subtrees.

#### `error-requires-action` · BLOCKING

Errors render in place, at the position the content would have occupied — never as a toast. Every error state carries: one Turkish sentence saying what failed, the machine detail in mono inside a collapsed `<details>`, a copyable correlation id, and EXACTLY ONE primary recovery action (`Tekrar dene`, `Sağlayıcıyı değiştir`, `Bütçeyi artır`, `Dalı sıfırla`).

- **Neden:** A toast for a failed 6-minute render disappears while you are looking at another window, and it detaches the failure from the thing that failed. Requiring exactly one action forces the designer to decide what the operator should actually do, which is the difference between an error message and a dead end.
- **Zorlama:** `ErrorStateProps` types `action: { label: string; onAct: () => void }` as required (not optional) — `tsc --strict` fails on omission. CI grep bans `toast.error(` and `sonner` imports repo-wide.

#### `no-illustration-empty-state` · CONVENTION

Empty states contain no illustration, icon larger than 16px, mascot or marketing sentence. There are exactly two kinds and they must not be conflated: `empty-first-run` shows the one command that creates the first record plus its keyboard shortcut in a mono key cap; `empty-filtered` shows the active filters as removable chips plus `Filtreleri temizle`. Maximum one sentence of Turkish, at `--text-sm`.

- **Neden:** A generic 'nothing here yet' with a drawing is the loudest default-template signal in the product and it tells the operator nothing. Showing the exact command teaches the keyboard map at the only moment the user is idle enough to read it. Conflating the two kinds is the classic bug where a mistyped filter looks like an empty database.
- **Zorlama:** CI grep bans `<svg` with `width` > 16, `<img` and `.png`/`.svg` illustration imports inside `components/EmptyState*`. Two distinct components (`EmptyFirstRun`, `EmptyFiltered`) with no shared default — a grep asserts no route renders a bare `<Empty>`.

#### `run-gauge-contract` · BLOCKING

A multi-step run renders as a horizontal step rail, not a progress bar: one 96px-min segment per pipeline step, 6px tall, 2px gaps, states pending (`--bg-4`) / active (brand, determinate if the step reports a fraction, otherwise a single 24px shuttle at 1400ms) / done (`--fg-muted`) / failed (`--signal-error`) / skipped (hatched). Above it, elapsed time at `--text-readout` and an ETA rendered as a p20–p80 BAND (`~4:10 – 6:40`), never a point estimate. Below it, cost accrual as a capability chart: axis 0 → budget cap, a grey pre-run estimate band, a solid actual fill, and the cap drawn as a labelled spec-limit tick; the band turns amber when actual exceeds the estimate's upper bound and red at 90% of cap.

- **Neden:** A single bar for a 6-minute five-step pipeline is a lie — it either jumps or crawls, and it hides which step is slow. The ETA band is the metrology move: a point ETA that is wrong twice erodes all trust, a band that contains the truth builds it. The cost-against-cap chart is a process-capability chart and is the correct instrument for 'am I about to blow the budget', which is the actual question.
- **Zorlama:** `RunGaugeProps` requires `steps: Step[]`, `etaBand: [number, number]`, `estimateBand: [number, number]`, `capMinor: number` — all non-optional, `tsc` enforced. Vitest asserts the component throws when `etaBand[0] === etaBand[1]`. Storybook/Playwright snapshot of all five segment states.

#### `cancel-always-live` · BLOCKING

A cancel control is visible and enabled for the entire lifetime of every run, positioned at the right end of the step rail, labelled `İptal et` with `Ctrl+.` shown as a key cap; it is never inside a menu, never disabled, never behind a confirm. On press it becomes `İptal ediliyor…` and if the run has not reached a terminal state within 5s the UI offers `Zorla durdur`. The cancelled state must display the cost incurred up to cancellation.

- **Neden:** The cost is real money accruing in real time; putting cancel behind a `⋯` menu is a financial hazard. Hiding sunk cost after a cancel trains the operator to believe cancelling is free, which makes budget forecasting from the analytics view wrong.
- **Zorlama:** Playwright test: for each pipeline fixture, assert a visible, enabled element matching `[data-action="cancel-run"]` at every 500ms tick of a mocked run, and assert the terminal cancelled state renders a non-zero `[data-field="cost-incurred"]`. Grep bans `disabled` on that selector.

#### `ctrl-key-allowlist` · BLOCKING

Modifier bindings are restricted to a fixed allowlist — `Ctrl+K`, `Ctrl+Enter`, `Ctrl+.`, `Ctrl+Shift+.`, `Ctrl+/`, `Ctrl+\`, `Ctrl+Backspace`; everything else is an unmodified single key on the focused row or a leader chord (`g q`, `g c`, `g p`, `g r`, `g a`, `g b`, `s d`, `s r`). Bindings colliding with the browser (`Ctrl+T/N/W/Q/R/L/D/P/S/F/H/J/O/U`, `Ctrl+Shift+T/N/W/I/J/C/P`, `Ctrl+1..9`, `Alt+←/→`, `Ctrl++/-/0`, `F1..F12`) are forbidden.

- **Neden:** Rebinding `Ctrl+R` in a browser app means the operator either loses reload or loses your shortcut, and they will discover which one at the worst moment. Pushing everything onto unmodified single keys is what Linear- and Superhuman-class queue UIs actually do, and it is only safe because the queue is a roving-tabindex grid where no text input has focus by default.
- **Zorlama:** All bindings are declared in one `keymap.ts` table (no inline `addEventListener('keydown')` — grep-enforced). A Vitest suite asserts every entry is either in the modifier allowlist, an unmodified key, or a chord, and that no entry appears in the browser-collision denylist. A second test asserts no duplicate binding within one context.

#### `palette-is-primary-nav` · BLOCKING

The command palette (`Ctrl+K`, built on cmdk with `shouldFilter={false}` and app-owned `Intl.Collator('tr')` ranking) is the primary navigation: every action in the app, including every route, must be reachable from it, must display its own keyboard shortcut inline, and must show its scope (`kayıt`, `pipeline`, `sağlayıcı`, `kanal`). A secondary actions menu opens on `Ctrl+K` again while the palette is open. Sidebar navigation is a convenience mirror, never the only path.

- **Neden:** A palette that only contains navigation is a menu with extra steps. The payoff comes from it being the single discoverable surface for every verb, which is what makes it worth building muscle memory for. cmdk explicitly does not bind ⌘K itself and does not virtualize, so both are the app's responsibility; its own filter is not Turkish-locale aware, hence `shouldFilter={false}`.
- **Zorlama:** A Vitest test enumerates the exported `commands` registry and asserts it contains an entry for every route in the router manifest and every entry in `keymap.ts`, and that every entry has a non-empty Turkish `label` and a `scope`. Fails the build on any orphan action.

#### `roving-tabindex-grid` · BLOCKING

The queue and every data table is `role="grid"` with roving tabindex — exactly one row is tabbable, arrows move focus, `Home`/`End`/`Ctrl+Home`/`Ctrl+End` jump; the command palette uses `aria-activedescendant` with DOM focus retained on the input. A cell containing a single non-arrow-key widget (button, checkbox, link) receives focus directly; a cell containing text receives focus on the cell.

- **Neden:** The WAI-ARIA APG grid pattern. Without roving tabindex a 30-row × 6-column queue takes 180 Tab presses to cross, and with it the queue behaves like the spreadsheet the operator expects. The combobox pattern's `aria-activedescendant` rule is what keeps typing working while the highlight moves in the palette.
- **Zorlama:** `@axe-core/playwright` run against the queue route in CI; plus a Playwright keyboard test asserting exactly one element with `tabindex="0"` inside `[role="grid"]` at all times, and that ArrowDown moves `document.activeElement` by one row.

#### `focus-ring-2px-outset` · BLOCKING

Focus is styled with `:focus-visible` only — never `:focus` — as `outline: 2px solid var(--focus); outline-offset: 2px; border-radius: inherit;`. The ring is drawn OUTSIDE the component, never inset. `--focus` must measure ≥ 3:1 against both the component and its adjacent background in both surface contexts. `outline: none`/`outline: 0` may only appear in a rule that is immediately paired with a `:focus-visible` replacement.

- **Neden:** WCAG 2.2 SC 2.4.7 (AA) and SC 2.4.13 Focus Appearance (AAA): the understanding document states a solid 2px perimeter is the simplest way to meet the minimum-area requirement, and explicitly that a 2px INSET indicator fails and would need to be ≥3px. Taking the AAA criterion here costs nothing and is what makes a keyboard-only tool usable. `:focus-visible` avoids the ring appearing on every mouse click, which at this density is visual noise.
- **Zorlama:** Stylelint rule banning bare `:focus` selectors and `outline: none` without a sibling `:focus-visible` block; the contrast CI test asserts `--focus` against `--bg-1..3` and `--btn-bg` in both contexts. Playwright asserts computed `outline-offset` is `2px` and `outline-width` is `2px` on a tabbed-to button.

#### `focus-integrity-test` · BLOCKING

Focus must never be trapped outside a `showModal()` dialog, must never be obscured by the sticky top bar or sticky table header, and must always return to its origin. Every focusable row sets `scroll-margin-block-start: calc(var(--topbar-h) + var(--row-h-header) + 8px)`; on route into the studio, focus moves to the stage container (`tabindex="-1"`) and an `aria-live="polite"` region announces the surface; on `Esc`, focus returns to the originating row identified by record id, not by element reference.

- **Neden:** WCAG 2.2 SC 2.1.2 No Keyboard Trap (A) and SC 2.4.11 Focus Not Obscured — Minimum (AA, new in 2.2). With a sticky 40px top bar plus a sticky 40px header, `scrollIntoView` on ArrowDown puts the focused row underneath the chrome, which is a literal 2.4.11 failure and in practice means you approve the wrong item. Storing an element reference breaks because the queue re-sorts while you were in the studio.
- **Zorlama:** Playwright test per screen: press Tab 200 times from `document.body`, assert focus eventually returns to `body` (no trap) and that at every step `document.activeElement.getBoundingClientRect().top >= topbarHeight + headerHeight`. A second test enters and exits the studio and asserts `document.activeElement` carries the original `data-record-id`.

#### `target-size-24` · BLOCKING

Every interactive element has `min-block-size: 24px; min-inline-size: 24px` (`--target-min`). Icon-only buttons are exactly 24×24 with a 16px glyph. Where a control must be smaller, adjacent undersized targets must be spaced so that 24px-diameter circles centred on their bounding boxes do not intersect.

- **Neden:** WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA, verbatim 24×24 CSS pixels with a documented spacing exception. This is the criterion a 28px-row dense UI is most likely to fail, at exactly the controls that trigger irreversible actions (approve, discard, cancel). The full-width 28px row itself passes as one target; the icon buttons inside it are the risk.
- **Zorlama:** `@axe-core/playwright` target-size check in CI, plus a custom Playwright assertion iterating all `button, a, [role="button"], input, select` and failing on any bounding box under 24×24 that is not annotated `data-target-exception="spacing|inline|equivalent"`.

#### `motion-allowlist` · BLOCKING

Only six things animate: route positional continuity (220ms), panel disclosure (160ms), the row state-confirmation rail flash (600ms hold + 900ms fade), the single indeterminate step shuttle (1400ms linear), the dialog scrim (120ms), and colour changes on hover/active (120ms). Durations are tokens `--dur-1: 120ms` through `--dur-4: 320ms` and nothing exceeds 320ms. Easing is `--ease-out: cubic-bezier(0.2, 0, 0, 1)` for entering and `--ease-in: cubic-bezier(0.4, 0, 1, 1)` for exiting; `ease-in-out` is banned under 300ms. Never animate numbers, list reordering, skeletons, hover scale, chart draw-in, page load, or anything in the queue. Under `prefers-reduced-motion: reduce`, all durations collapse to 1ms, iteration counts to 1, the shuttle becomes a static bar, and view transitions are skipped in JS.

- **Neden:** This tool is opened 20 times a day by the same person; animation that reads as delightful on the first run reads as latency on the two-hundredth. The 0.2,0,0,1 curve rather than Tailwind's default 0.4,0,0.2,1 Material curve is the specific choice that makes the shell feel mechanical rather than templated. Animating a live cost counter makes an unreadable number and defeats the tabular figures.
- **Zorlama:** Stylelint disallowed-list on `transition-duration`/`animation-duration` values not in the token set; CI grep bans `animate-` Tailwind utilities outside an allowlisted file set. Vitest asserts the global `@media (prefers-reduced-motion: reduce)` reset block is present in the built CSS, and that `navigateWithTransition()` short-circuits when the media query matches.

#### `asset-owns-60` · BLOCKING

In any studio surface the asset occupies at least 60% of the viewport width at all times. The QA scorecard lives in the 320px inspector, scrollable and collapsible to a 40px strip showing only the composite score and its colour rail. The scorecard is never overlaid on the asset and never a modal. The only permitted marks on the asset are numbered 20px failed-check annotations whose numbers match scorecard rows, bidirectionally linked by hover AND by focus, toggleable with `q`.

- **Neden:** The entire purpose of the studio is looking at the thing; a scorecard that covers it converts a visual judgement into a reading task. Bidirectional linking (and making it keyboard-reachable, not hover-only) is what lets 'check 3 failed' become 'that caption, there' without moving the eye off the asset.
- **Zorlama:** Playwright asserts `stage.getBoundingClientRect().width / viewport.width >= 0.6` on every studio route at 1280, 1600 and 1920 widths. Grep bans `position: absolute` scorecard containers inside `studio/`. Axe check asserts annotation markers are focusable and referenced with `aria-describedby`.

#### `safe-zones-from-registry` · BLOCKING

All channel geometry — aspect ratios, resolutions, safe-zone insets, caption placement bounds — is read from Ring 1 registry YAML (`registry/channels/*.yaml` → `safe_zones:`), never hardcoded in UI or kernel code. The overlay is drawn as SVG on top of the asset (never baked, never CSS-transformed with the image): unsafe regions get a 12%-opacity `--signal-error` fill plus a 1px solid boundary and 16px L-shaped corner crop marks; no dashed lines; every zone is labelled in mono with BOTH pixels and percent (`üst 250 px (%18,5)`); graduated rulers with major ticks every 10% and minor every 2% run along the stage's top and left edges.

- **Neden:** Platform chrome changes without notice, and this is a registry-driven architecture — a hardcoded 250px inset would be an inviolable-boundary violation as well as a maintenance trap. Dashed lines alias badly at fractional zoom, which is when you are inspecting. Showing both px and percent is what makes the overlay a measuring instrument rather than a decoration, and it is the shop-floor caliper reference made literal.
- **Zorlama:** CI grep fails on numeric literals matching `/(0\.\d+|\d{2,4})\s*\/\*\s*safe/` or any of `1080`, `1350`, `1920`, `1.91`, `9/16`, `4/5` appearing in `apps/ui/src/**` or `packages/kernel/**`. A schema test validates every `channels/*.yaml` against the safe-zone JSON Schema. Playwright asserts the overlay is an `<svg>` sibling of the `<img>`, not a CSS background.

#### `alt-text-blocks-publish` · BLOCKING

The publish verb refuses any image asset whose record frontmatter lacks a non-empty Turkish `alt_tr` of ≤ 125 characters, OR an explicit `decorative: true` paired with `alt_tr: ""`. Text baked into an image must measure ≥ 4.5:1 against its local background and render at ≥ 24px at the channel's declared output resolution; both are blocking QA checks.

- **Neden:** WCAG 1.1.1 Non-text Content (Level A) — a text alternative that serves the equivalent purpose. This is the accessibility criterion that matters most here because it applies to the OUTPUT, which is public and represents the company. Forcing an explicit `decorative: true` rather than allowing a missing field means the decision is made once, deliberately, rather than skipped silently by an agent.
- **Zorlama:** A kernel-adjacent validator in the publish pipeline (reading declared schema fields, not `record.attributes`) rejects the commit; a pre-push git hook runs the same validator. The contrast and text-size checks run in the QA scorecard step and set the run to `hata` on failure.

#### `captions-block-publish` · BLOCKING

Every published video containing speech ships a `.vtt` sidecar in the corpus AND burned-in Turkish captions for vertical channels; burned-in captions must sit fully inside the channel's declared safe zone, sit on an ≥ 80%-opacity backplate, and satisfy ≤ 42 characters per line, ≤ 2 lines, ≥ 1.0s minimum cue duration. Audio-only assets ship a transcript. In the app's own player, captions default to ON.

- **Neden:** WCAG 1.2.2 Captions (Prerecorded), Level A. Beyond compliance: the majority of feed video is watched muted, so an uncaptioned Turkish demo video is functionally silent to most of its audience — this is a distribution requirement disguised as an accessibility one. The safe-zone constraint is why captions must be checked by the same inspector that checks crops.
- **Zorlama:** The publish validator parses the `.vtt`, asserts the line/duration constraints, and asserts every caption's rendered bounding box (measured on the burned-in render via the safe-zone checker) is inside the registry safe zone; failure blocks the commit. Player default asserted by a Playwright test on `track.mode === 'showing'`.

#### `radius-and-lines` · WARN

Base radius is 2px, not shadcn's 0.625rem: `--radius-sm: 0`, `--radius-md: 2px`, `--radius-lg: 4px`, and `--radius-full` is reserved for exactly one element, the 8px status dot. Nothing in the console is rounder than 4px. Lines have three named weights with distinct jobs — `--line-hair` (1px, data separation inside a panel), `--line-edge` (1px, panel boundary), `--line-rule` (2px, section division and the left status rail) — and panels apply the bevel hairline: `--line-edge` on `border-block-start`, `--line-hair` on the other three sides.

- **Neden:** The 8–10px uniform radius plus one uniform 1px border is the most recognisable shadcn/Tailwind default signature. Instruments have square corners and differentiated line weights because the lines mean different things. The bevel hairline is a single declaration that reads as a machined panel lit from above and costs nothing.
- **Zorlama:** `--radius-*` namespace fully overridden in `@theme`; CI grep bans `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` (allowlisted only in `StatusDot.tsx`) and any `rounded-[` arbitrary value. Stylelint restricts `border-color` values to the three `--line-*` tokens.

#### `icon-grid-16-butt` · WARN

Icons are drawn on a 16px grid with `stroke-width: 1.25`, `stroke-linecap: butt`, `stroke-linejoin: miter`, no rounded terminals and no fills. Maintain a ~40-glyph custom set in `apps/ui/src/icons/`; where a custom glyph does not exist, a Lucide glyph may be used only after being restyled to those attributes. Icons are never coloured except the status glyph set. Run state is shown as a 3px full-height rail on the row's inline-start edge (andon light) plus a glyph — coloured pill badges are banned.

- **Neden:** Lucide's default 24px / 2px / rounded-cap set is the most identifiable 'built in 2024 from a template' signal in the product, and rounded caps are specifically what read as friendly-consumer rather than instrument. Butt caps and miter joins at 1.25px read as engineering drawing. The edge rail carries state at the same glance distance as a badge while consuming zero horizontal space in a 28px row — which is what makes 30 visible rows possible.
- **Zorlama:** CI script parses every SVG under `apps/ui/src/icons/` and every Lucide import wrapper, failing on `stroke-linecap="round"`, `stroke-width` ≠ 1.25, `viewBox` ≠ `0 0 16 16`, or any `fill` other than `none`. Grep bans `<Badge` in `console/queue/` and bans direct `lucide-react` imports outside `icons/adapters.ts`.



### Kalemler (15)

| Ad | Tür | Ne | Erişim | Maliyet | Karar |
|---|---|---|---|---|---|
| Tailwind CSS v4 (@theme / @theme inline) |  | Utility CSS engine; `@theme` defines design tokens as CSS variables that also generate utilities; `@theme inline` is required when a token references another variable |  |  | ADOPT — already decided, and the v4 model is exactly the right shape for a two-context token architecture |
| OKLCH (CSS Color 4) |  | Perceptually-uniform colour space usable directly as `oklch(L C H / A)` in CSS |  |  | ADOPT — Baseline widely available since May 2023, and lightness-uniformity is what makes a 12-step dark ramp predictable |
| shadcn/ui |  | Copy-in React component source built on Radix primitives with a CSS-variable theme |  |  | TRIAL — use as a source of correct headless behaviour, never as a look. Every added component gets a mandatory re-skin pass before merge |
| cmdk |  | Unstyled, accessible command-menu React component (combobox pattern, composes Radix Dialog) |  |  | ADOPT for the command palette |
| View Transition API (same-document) |  | `document.startViewTransition({update, types})` plus `::view-transition-*` pseudo-elements for animating DOM state changes |  |  | ADOPT for shell↔surface navigation only |
| Inter (variable) |  | UI typeface, 2000+ glyphs, 147 languages |  |  | ADOPT as the sans |
| IBM Plex Mono |  | Monospace companion for numerics, ids, paths, logs and key caps |  |  | ADOPT as the mono — it is the pairing that carries the industrial identity |
| culori |  | JS colour library with OKLCH support, gamut mapping and CIEDE2000 ΔE |  |  | ADOPT for the CI token tests and for the studio palette inspector's ΔE readouts |
| @axe-core/playwright |  | Automated WCAG rule engine driven from the existing Playwright install |  |  | ADOPT — zero marginal infrastructure since Playwright is already a hard dependency for rendering |
| Playwright (reuse of the render engine) |  | The already-mandated headless Chromium driver, reused for visual regression, keyboard-integrity, pseudo-localization overflow, and the brand-pixel-budget test |  |  | ADOPT — one browser binary serves rendering, screenshots, PDFs and the entire design-system CI |
| Lucide |  | Open-source icon set (default in shadcn/ui) |  |  | TRIAL — permitted only as a fallback, restyled to 16px / 1.25px / butt caps / miter joins, imported through a single adapter module |
| HyperFrames |  | Apache-2.0 HTML-authored motion renderer via headless Chrome + FFmpeg (HeyGen) |  |  | ADOPT — already decided; the design-system consequence is that the studio's video preview should embed the same HTML composition rather than a rendered proxy |
| Radix Colors scale semantics |  | A documented 12-step role assignment for colour ramps |  |  | ADOPT the step semantics as the structure for the custom OKLCH ramps; do NOT adopt the Radix palettes themselves |
| tinykeys |  | Tiny keybinding library with key-sequence (chord) support |  |  | TRIAL — pending verification of chord support and current maintenance |
| @tanstack/react-virtual |  | Headless list/grid virtualizer |  |  | HOLD until the queue actually exceeds ~1,000 rows |

<details><summary>Notlar</summary>

**Tailwind CSS v4 (@theme / @theme inline)** — Verified: namespaces `--color-*`, `--text-*` (with paired `--text-*--line-height`), `--spacing-*`, `--radius-*`, `--ease-*`. Defaults verified from packages/tailwindcss/theme.css: `--spacing: 0.25rem`, `--radius-md: 0.375rem`, `--ease-out: cubic-bezier(0,0,0.2,1)`, `--default-transition-duration: 150ms`. Set `--color-*: initial`, `--text-*: initial`, `--radius-*: initial` before redefining so unlisted values generate no utilities. Docs confirm the exact pattern this rulebook needs: define `--acme-canvas-color` under `:root` / `[data-theme="dark"]`, then `@theme inline { --color-canvas: var(--acme-canvas-color) }` — swap `[data-theme]` for `[data-surface]`.

**OKLCH (CSS Color 4)** — Chromium-only deployment (headless Chromium is already mandated), so no fallback needed. Caution: OKLCH L is NOT WCAG relative luminance — equal L steps do not give equal contrast ratios, which is why the contrast test must compute from sRGB. High C at low L is out of sRGB gamut and gets mapped, causing hue drift; hence the chroma caps.

**shadcn/ui** — Verified default theme is `--radius: 0.625rem` with a derived scale (`--radius-sm: calc(var(--radius)*0.6)` … ) and `oklch` token values — override `--radius` to `0.125rem` and the whole scale follows. Its `.dark` selector convention conflicts with the `[data-surface]` context model; strip it. Its `background/foreground/card/popover/primary/secondary/muted/accent/destructive/border/input/ring/chart-1..5/sidebar-*` token vocabulary is a good checklist of roles to cover but is one-context-at-a-time by design.

**cmdk** — Verified from the README: does NOT bind ⌘K itself ("do it yourself to have full control over keybind context"), no virtualization ("good performance up to 2,000-3,000 items"), supports `shouldFilter={false}` for app-owned ranking, `loop` for wrap-around arrows, custom `filter(value, search, keywords)`. Use `shouldFilter={false}` plus `Intl.Collator('tr')` because its built-in filter is not Turkish-locale aware. Requires React 18+. Ensure `open` is false on first render.

**View Transition API (same-document)** — Verified API surface: `types` array, `:active-view-transition-type(x)` and `:active-view-transition` selectors, `view-transition-class` for shared animation styles (each element still needs a unique `view-transition-name`), and the promises `ready` / `updateCallbackDone` / `finished`, plus `skipTransition()`. Supported in Chrome since 111. Must explicitly neutralise the default root crossfade. Do not use around streaming updates — the page is frozen during capture.

**Inter (variable)** — Verified: Turkish is in the Latin language-support list; ships `tnum` (tabular figures, same width across all weights), `zero` (slashed zero), `calt`, `case`, `frac`, and the disambiguation set `ss02` / `cv08` (upper-case i with serif) / `cv05` (lower-case L with tail). Enable `cv08`, `cv05`, `zero` globally via `--font-sans--font-feature-settings`; do NOT enable `tnum` globally — apply `font-variant-numeric: tabular-nums` per element instead. Self-host with latin + latin-ext subsets.

**IBM Plex Mono** — Open Font License, source and multiple formats available, npm package `@ibm/plex-mono`. The repo states Plex Sans supports extended Latin; Plex Mono's latin-ext coverage was not individually verified this session — check ğ ş ı İ ç ö ü in the shipped woff2 before committing to it (see unverified).

**culori** — Used in two places: the CI script that parses tokens.css, computes WCAG contrast from sRGB and checks sRGB-gamut clipping against the chroma caps; and the palette inspector that reports ΔE00 between an asset's dominant colours and the brand palette. Not verified from a primary source this session — confirm current API before wiring.

**@axe-core/playwright** — Covers 1.4.3, 1.4.11, 2.5.8, 1.3.1, 3.1.1 mechanically. Does NOT cover 2.4.11 Focus Not Obscured, 2.1.2 keyboard traps, focus-return correctness, or Turkish overflow — those need the bespoke Playwright tests specified in the rules.

**Playwright (reuse of the render engine)** — The 12 reference screens (queue empty / queue populated / queue running / studio variants / studio deck / studio video / safe-zone inspector / palette open / error / stale / budget / analytics) are the CI fixture set for contrast, motion, target-size, overflow and accent-budget checks. Same engine already used for `page.screenshot` and `page.pdf`.

**Lucide** — Its stock 24px / 2px / rounded-cap rendering is the strongest 'template' signal in the default stack. Restyling is possible because the icons are stroke-based SVG, but the geometry is drawn for a 24px grid — a custom ~40-glyph set on a 16px grid will read noticeably sharper for the icons used most (run, apply, branch, cost, channel, variant).

**HyperFrames** — Verified: renders with headless Chrome + FFmpeg, Apache-2.0, plain-HTML authoring model (vs Remotion's React + source-available licence), CLI has `lint` / `preview` / `render --quality draft|standard`. Because the composition is plain HTML with seekable animation, the studio player can scrub the live composition — meaning the safe-zone SVG overlay composites over the real thing, and there is no proxy/final mismatch. Generate the scrub sprite sheet into Ring 3 at draft-render time.

**Radix Colors scale semantics** — Verified step roles: 1 app background, 2 subtle background, 3 UI element background, 4 hovered, 5 active/selected, 6 subtle borders and separators, 7 UI element border and focus rings, 8 hovered border, 9 solid backgrounds, 10 hovered solid, 11 low-contrast text, 12 high-contrast text. This maps cleanly onto the three-line-weight system (6 = hair, 7 = edge, 8 = rule) and gives a principled place for every tier-2 role.

**tinykeys** — Needed for the `g q` / `s d` leader chords, which a plain keydown handler makes messy. Not verified this session (see unverified). Whatever library is chosen, the architectural rule stands: one declarative `keymap.ts` table, no inline listeners, so the collision denylist test can run against it.

**@tanstack/react-virtual** — cmdk's own README documents good performance to 2,000–3,000 items, and a 28px row means 2,000 rows is 56,000px of DOM — survivable. Virtualization conflicts with roving tabindex and with `scroll-margin` focus behaviour, so pay that complexity only when measured. If adopted, the SC 2.4.11 focus test must be re-run against the virtualized queue.

</details>


### Doğrulanmamış

- Linear's, Superhuman's and Raycast's exact published keyboard maps. `linear.app/docs/keyboard-shortcuts` and `linear.app/docs/shortcuts` both returned HTTP 404 and `manual.raycast.com/hotkey` returned 404 this session; `linear.app/method` returned only a nav stub. The interaction PATTERNS attributed to them in these rules (single global palette, unmodified single-key actions on the focused row, `g`-prefixed go-to chords, `?` for the shortcut sheet, Esc stepping out one level, Raycast's in-palette secondary-actions menu) are described from widely-observed product behaviour, NOT from a fetched primary source. Do not cite specific bindings as 'Linear does X' in the rulebook without re-verifying against their live docs.
- ANSI/ISA-101.01-2015 normative text. The ISA committee page was fetched and confirms the standard's scope covers 'menu hierarchies, screen navigation conventions, graphics and color conventions, dynamic elements, alarming conventions', but the full standard is paywalled. The specific high-performance-HMI guidance this design leans on — neutral grey backgrounds rather than black, colour reserved for abnormal conditions, greyscale depiction of normal state — comes from the ASM Consortium / high-performance-HMI tradition and was NOT verified from a normative document this session.
- EEMUA 191 and ANSI/ISA-18.2 alarm-management specifics (number of priorities, the redundant shape+colour+number coding convention, priority distribution targets). Not fetched. The 'never colour alone, at most five states' rule is defensible on WCAG 1.4.1 grounds independently, but do not attribute it to a specific standard clause.
- Instagram and LinkedIn channel geometry: exact supported aspect ratios, recommended resolutions, and safe-zone pixel/percent insets for feed, Reels and Stories. The Meta Business Help Center page returned only a page title; the LinkedIn help page returned supported file types only. Every number (1080×1350, 1080×1920, 1.91:1, top/bottom safe margins) must be re-verified against Meta's and LinkedIn's current published specs before first publish. This is why the rules force all channel geometry into Ring 1 YAML rather than into code.
- APCA / WCAG 3 lightness-contrast (Lc) thresholds. APCA is not normative in WCAG 2.2 and was not fetched. All contrast requirements in these rules are WCAG 2.x ratio-based (4.5:1 / 3:1) because that is what is verifiable and enforceable today. If APCA is used as an additional dark-UI heuristic, treat its output as advisory only.
- Broadcast/subtitle conventions cited for captions: ≤42 characters per line, ≤2 lines, ≥1.0s minimum cue duration, ~20 characters/second reading rate. These are widely-used industry conventions (EBU-TT / BBC subtitle guidelines lineage) but were NOT fetched from a normative source this session. WCAG 1.2.2 itself only requires that captions be provided, not these specific numbers.
- IBM Plex Mono's latin-ext / Turkish glyph coverage specifically. The IBM Plex repository states IBM Plex SANS supports extended Latin; Plex Mono's coverage was not individually confirmed. Verify ğ Ğ ş Ş ı İ ç Ç ö Ö ü Ü in the shipped `@ibm/plex-mono` woff2 before committing to it as the numeric/mono face; the CI unicode-range check specified in the rules is the mechanism.
- Whether Chromium actually applies Turkish (`lang="tr"`) case mapping for `text-transform: uppercase`. MDN documents that the property takes language-specific case mapping into account and lists Turkish i/İ and ı/I explicitly, but also warns that 'support for language-specific cases varies between browsers'. This uncertainty is precisely why the rule is 'never CSS-uppercase Turkish' rather than 'set lang and uppercase freely'.
- tinykeys' key-sequence (chord) support and current maintenance status. Not fetched this session. The `g q` / `s d` leader-chord design assumes a library or ~40 lines of custom code that supports timed key sequences; verify before adopting, or write it in-house against the declarative `keymap.ts` table.
- culori's current API surface, and the choice of charting library for the cost-capability and control charts (uPlot vs visx vs Recharts). Neither was fetched. The design constraint that matters is that the chart library must not impose its own colour palette or animate the draw-in — evaluate against that.
- All specific OKLCH values in this document (the steel/paper/brand/signal ramps, `--focus`, the scrim) are DESIGNED, not measured. Every one must pass the CI contrast and gamut test before use; treat them as starting points, not as verified tokens.
- The claim that Inter's `ss02`, `cv08` and `cv05` improve legibility here. Their EXISTENCE is verified from the Inter feature list; whether enabling them is right for this product is a taste judgement, not a fact.
- Row-height and density numbers (28/32/40px, 13px base) are ergonomic judgements calibrated to a 1440p desktop monitor at 100% zoom. They satisfy the verified SC 2.5.8 24×24 target-size floor and the SC 1.4.12 text-spacing requirement, but the specific comfort of 28px for this operator should be validated in the first week and the token adjusted once, globally.


### Anti-desenler

- Adding a light/dark toggle 'because it's easy in shadcn'. It doubles the token matrix and the contrast test matrix, and the second theme is never maintained. The symptom appears three months in: the studio's light plate is the only thing anyone styled, so toggling to light mode makes the queue unreadable and nobody notices because nobody uses it. Kill the toggle in week one.
- Putting the studio behind a `<Dialog>` because it is faster to build. Symptom: you cannot deep-link a variant review, the browser back button exits the app instead of the surface, the run queue is inert behind a scrim while a 6-minute render is going, and you now own a hand-rolled focus trap that fights the safe-zone inspector's own keyboard map.
- Letting Tailwind's default palette and radius survive. Symptom: `bg-zinc-900`, `border-zinc-800`, `rounded-lg` appear in the fourth component anyone writes, the app is indistinguishable from every other 2025 dashboard, and by the time you notice there are 200 usages. Prevention is setting `--color-*: initial` and `--radius-*: initial` on day one, not a refactor later.
- Using `text-transform: uppercase` for the panel legends and then applying it to a Turkish string. Symptom: 'İptal' renders as 'IPTAL' or 'iptal' becomes 'IPTAL' instead of 'İPTAL'. It looks like a typo, not a bug, so it survives to production and appears in a screenshot in a sales deck.
- Testing the layout only in English or with short placeholder Turkish. Symptom: 'Onayla' fits, then the real label is 'Onayla ve depoya işle' and the button clips or the nav item ellipsizes into 'Onayla ve dep…'. Always run the +30% pseudo-localization pass in CI, not manually.
- Computing contrast by eyeballing OKLCH lightness deltas. Symptom: `--fg-muted` at L 0.62 on a L 0.20 background looks fine to a designer at full brightness and measures 3.8:1 — a 1.4.3 failure on every timestamp and unit in the app. OKLCH L is not WCAG luminance; only the computed test catches this.
- Rendering the run as one progress bar. Symptom: the bar sits at 40% for 3 minutes during the render step and the operator cancels a run that was about to succeed, or trusts a bar that jumps 0→90→stall. The step rail costs an hour to build and eliminates the entire class of complaint.
- Showing a single-point ETA. Symptom: it says 4:00, the run takes 6:20, and after this happens twice the operator stops reading it entirely — at which point you have a widget that costs pixels and provides nothing. The p20–p80 band is honest and stays trusted.
- Hiding cancel behind a `⋯` menu or disabling it during the 'committing' phase. Symptom: a runaway premium-lane job burns the month's budget in 90 seconds while the operator hunts for the control. Cancel is a financial safety mechanism, not a convenience.
- Dimming stale content to 60% opacity. Symptom: the operator reads dim as disabled, stops trusting the index entirely, and starts grepping the corpus by hand — which is the exact workflow the derived index existed to replace.
- Toasts for errors. Symptom: a 6-minute render fails at minute 5 while the operator is in another window; the toast auto-dismisses; they return to an empty surface with no explanation and re-run the same failing job. Errors belong in the place the content would have been, permanently, with the correlation id.
- Auto-refetching the surface the user is looking at. Symptom: the row you were one keystroke from approving re-sorts, and you approve the wrong record — which in this architecture is a git commit to the source of truth. Offer `Yenile`; never move things under the cursor.
- Binding Ctrl+R for 'run' or Ctrl+S for 'save'. Symptom: either the operator loses browser reload, or your shortcut silently does nothing on some focus states, and they can never remember which. The unmodified-single-key + leader-chord model exists specifically so you never have to fight the browser.
- Building the command palette as a navigation-only list. Symptom: nobody uses it, because a menu with a search box is slower than clicking the sidebar. It only pays off when every verb in the app is in it with its shortcut printed inline, so it doubles as the discoverability surface.
- Using cmdk's built-in filter for Turkish. Symptom: typing 'isik' fails to find 'ışık' and typing 'ISIK' fails to find 'işık'; the operator concludes search is broken. Use `shouldFilter={false}` with an `Intl.Collator('tr')`-backed ranker.
- Applying `:focus` styles instead of `:focus-visible`, or inset focus rings. Symptom one: a ring appears on every mouse click, so in a 30-row dense queue the screen is constantly flickering rings. Symptom two: a 2px inset ring documentedly fails SC 2.4.13's minimum-area requirement (it needs 3px inset), and on a dark row it is nearly invisible anyway.
- Sticky header plus sticky top bar without `scroll-margin-block-start` on rows. Symptom: ArrowDown scrolls the focused row exactly under the 80px of sticky chrome; you are keyboard-navigating an invisible cursor and approving blind. This is a literal SC 2.4.11 failure and it is the single most likely a11y bug in this design.
- Baking the safe-zone overlay into the image or hardcoding channel insets in the UI. Symptom one: an exported asset ships with red guide rectangles on it. Symptom two: Instagram changes its bottom chrome, and the fix requires a UI release instead of a YAML edit — while also violating the Ring 1 registry boundary.
- Overlaying the QA scorecard on the asset, or opening it as a modal. Symptom: you are now reading a table instead of judging an image, which is the one thing a human is uniquely needed for in this pipeline. Keep the asset at ≥60% width and link the scorecard to on-asset markers.
- Shipping the QA verdict as colour alone (a green or red dot). Symptom: it is unreadable in a screenshot pasted into Slack, unreadable to a colour-blind colleague, and unreadable in the PDF export of the deck. Glyph + colour + text, always — the alarm-management rule.
- Skeleton shimmer everywhere. Symptom: a looping animation in the operator's peripheral vision for eight hours a day, which is fatiguing; and it has to be disabled under reduced-motion anyway, so it can never carry meaning. Static skeletons at the real row height communicate the same thing.
- Animating the live cost counter. Symptom: the digits roll or tween, the number is unreadable while it changes, and if it is not tabular it also reflows the row on every tick. Update at 1 Hz, tabular figures, no transition.
- Wrapping a streaming update or a run-progress tick in `startViewTransition`. Symptom: the page freezes for the capture, progress visibly stutters, and with a 6-minute run's per-step updates you get a permanently janky shell. View transitions are for navigation only.
- Publishing without alt text because the agent did not produce it and the field was optional. Symptom: months of public assets with no text alternative, discovered during an accessibility review or by a customer. Make the publish verb refuse, and require an explicit `decorative: true` rather than tolerating a missing field.
- Burning captions in without checking them against the safe zone. Symptom: the caption's last line sits under the Reels UI chrome and is unreadable in the feed — which is worse than no caption, because it also occupies the region where a CTA could have been. The caption checker and the safe-zone checker must be the same checker.
- Keeping Lucide's default 2px rounded-cap icons alongside a 1.25px butt-cap custom set. Symptom: two visibly different icon languages in the same 28px row; the mixture reads as unfinished more loudly than either set alone would read as generic. Route every icon through one adapter that normalises stroke, caps and joins.
