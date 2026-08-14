# Tasarım sistemi

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.


### Kurallar (41)

#### `dual-surface-contexts` · BLOCKING · color/architecture

The dark console and light studio are two scoped colour contexts on `data-surface`. `[data-surface="console"]` and `[data-surface="studio"]` redefine ONLY tier-2 semantic variables plus `color-scheme: dark|light`, wired to Tailwind via `@theme inline { --color-bg-1: var(--bg-1); … }`. The studio plate is always inset inside the persistent console frame with a minimum 12px dark gutter on all four sides.

- **Neden:** A theme toggle, `prefers-color-scheme`, or a `.dark` class on `<html>` flips the whole chrome when you open a variant — the queue, cost meter and status bar visibly change identity 20 times a day. Scoping to a subtree keeps the frame constant and makes the studio read as 'opening into' rather than 'switching'. `color-scheme` is also the only way to get correct UA scrollbars per subtree.
- **Zorlama:** `rg -n 'prefers-color-scheme|\.dark\b|dark:' apps/ui/src` must return zero hits (CI, exit non-zero on match). A second grep asserts every `[data-surface=…]` block in `apps/ui/src/styles/context.css` declares `color-scheme`. Playwright asserts the topbar's computed `background-color` is byte-identical before and after the `/queue` → `/run/:id/variants` transition.

#### `no-theme-toggle` · BLOCKING · color/architecture

Ship no theme switcher, no system-theme detection, no persisted theme preference.

- **Neden:** A single-operator local tool; a toggle doubles the token surface and the contrast test matrix and produces a second, always-worse design nobody maintains. Removing the choice is what buys the density and the shadow-free elevation model.
- **Zorlama:** CI grep: `localStorage` keys matching `/theme|colorMode|colorScheme/i` and `matchMedia\(['"]\(prefers-color-scheme` must return zero hits in `apps/ui/src`.

#### `token-tiers-enforced` · BLOCKING · color/architecture

Colour lives in exactly three tiers. Tier 1 (`--ref-*`) are literal `oklch()` values and are NEVER referenced by a component. Tier 2 (`--bg-*`, `--fg*`, `--line-*`, `--focus`, `--signal-*`) are defined per surface context. Tier 3 (`--btn-*`, `--row-*`, `--rail-*`, `--gauge-*`) reference tier 2 only.

- **Neden:** Without the tier-1 ban, `bg-steel-3` leaks into a component and the studio context cannot override it — you get dark chips floating on the light plate. The tier split is what makes one component tree render correctly in both contexts with zero conditionals.
- **Zorlama:** CI grep over `apps/ui/src/**/*.{tsx,css}`: any `--ref-` occurrence or class matching `-(steel|paper)-([0-9]|1[0-2])\b` outside `styles/tokens.css` and `styles/context.css` fails the build.

#### `chroma-cap-by-area` · BLOCKING · color

Cap OKLCH chroma by painted area: fills over 25% of the viewport use C ≤ 0.02; borders and rules C ≤ 0.04; body and muted text C ≤ 0.06; solid signal fills may reach C ≤ 0.18 but only on regions under 4% of the viewport. Console neutrals sit on hue 250 with C stepping 0.004 → 0.013.

- **Neden:** High C at low L in OKLCH falls outside sRGB, so Chromium gamut-maps it and you get hue drift plus visible 8-bit banding across a large panel on a 27-inch monitor. It also destroys the instrumentation principle: if the background is tinted, a genuine amber warning stops reading as an event.
- **Zorlama:** `pnpm test:gamut` — a Node script parsing `tokens.css` with `culori`, computing the sRGB-clipped ΔE00 for every `oklch()` literal; fails if any token used in a `--bg-*` role exceeds C 0.02 or if any token's clipped ΔE00 exceeds 1.0.

#### `contrast-matrix-computed` · BLOCKING · color/a11y

Every semantic foreground token is asserted against every background token it can legally sit on, computed from sRGB with the WCAG 2.x relative-luminance formula: text ≥ 4.5:1; ≥18pt or 14pt-bold ≥ 3:1; and every meaning-carrying non-text token (`--focus`, all `--signal-*`, `--axis`, `--tick-major`, safe-zone boundary, spec-limit tick, playhead, status rail) ≥ 3:1. `--line-hair` and `--line-edge` are explicitly exempt and listed as such.

- **Neden:** OKLCH lightness is NOT WCAG luminance — a pair that looks separated in the ramp can measure 3.8:1, and `--fg-muted` (used on every timestamp and unit in the app) is exactly the token that fails. Eyeballing lightness deltas is how this bug ships.
- **Zorlama:** `pnpm test:contrast` — a Vitest suite importing the parsed token table and asserting the pair matrix in both contexts; runs on every PR touching `tokens.css` or `context.css`.

#### `accent-budget-three` · WARN · color

The brand hue (172) may appear in at most three places on any single screen: the focus ring, the current-selection rail, and the one primary action of the current surface. It is a LINE everywhere except that single primary button fill. It never appears in a chart series, a watermark, a background, or a hover state.

- **Neden:** The generic-AI-dark-mode tell is a neon accent sprayed across hovers, icons, links and gradients. Restricting it to selection-and-intent is what makes the one place it appears mean something, and keeps the shell reading as a control room rather than a landing page.
- **Zorlama:** Playwright: screenshot the 12 reference screens, count pixels within ΔE00 < 8 of `--ref-brand-d`, fail if the count exceeds 2% of viewport pixels. Plus `rg 'accent|brand' apps/ui/src/charts/` must return zero hits.

#### `no-shadow-elevation-ladder` · BLOCKING · surface

Ban `box-shadow`, `drop-shadow`, `backdrop-filter` and all gradients. Elevation is (a) a background step bg-1 → bg-2 → bg-3 and (b) a bevel hairline: a panel's `border-block-start` is `--line-edge`, its other three sides `--line-hair`. The only permitted shadow is on `[data-elevation="overlay"]`, whose `::backdrop` is a flat `oklch(0.14 0.005 250 / 0.72)` scrim with no blur.

- **Neden:** Shadows are near-invisible on dark surfaces, so shadcn's `shadow-sm`/`shadow-md` cost render time for no signal and a muddy edge. The step + bevel ladder is legible at any monitor brightness and is the machined-panel read.
- **Zorlama:** Stylelint `declaration-property-value-disallowed-list` for `box-shadow`, `filter: drop-shadow`, `backdrop-filter`, `background-image: linear-gradient`, scoped to `apps/ui/src/**` with `styles/overlay.css` excepted. CI grep bans `shadow-`, `backdrop-blur-`, `bg-gradient-` classes.

#### `radius-max-4` · WARN · surface

`--radius-sm: 0`, `--radius-md: 2px`, `--radius-lg: 4px`. Nothing in the console is rounder than 4px. `--radius-full` is reserved for exactly one element, the 8px status dot. Line weights have three named jobs: `--line-hair` 1px (data separation), `--line-edge` 1px (panel boundary), `--line-rule` 2px (section division, status rail).

- **Neden:** A uniform 8–10px radius plus one uniform 1px border is the most recognisable shadcn/Tailwind default signature. Instruments have square corners and differentiated line weights because the lines mean different things.
- **Zorlama:** `--radius-*: initial` in `@theme` before redefining. CI grep bans `rounded-(md|lg|xl|2xl|full)` (`rounded-full` allowlisted only in `StatusDot.tsx`) and `rounded-\[`. Stylelint restricts `border-color` values to the three `--line-*` tokens.

#### `type-scale-nine` · BLOCKING · typography

Exactly nine sizes as `--text-*` tokens with paired `--text-*--line-height`: 11/12/500, 12/16/450, 13/16/450 (console default), 14/20/450, 15/22/400, 17/24/500, 22/28/550, 28/32/550, 36/36/500-mono. Weights limited to 400/450/500/550/650; 700 is banned in the console. No arbitrary `text-[…]`.

- **Neden:** A dense grid only survives if the line box is a multiple of 4px — 13/16 is what makes a 28px row hold one line with 6px above and below. Turkish is diacritic-dense (ğ ş ç ö ü ı İ), so no console size may have a line box under 16px or ascenders and descenders collide at 13px. Bold at 13px on a dark background blooms.
- **Zorlama:** `--text-*: initial` in `@theme` before redefining, so unlisted sizes generate no utility. CI grep `rg 'text-\['` in `apps/ui/src` must return zero hits.

#### `num-component-only` · BLOCKING · typography/data

Every number in a table, metric, cost, duration, dimension, count or gauge renders through `<Num value unit precision />`, which sets `font-variant-numeric: tabular-nums slashed-zero lining-nums`, uses `--font-mono`, and emits the unit in a sibling `<span class="unit">` at 0.85em `--fg-muted`. It is the only place `Intl.NumberFormat('tr-TR')` may be constructed and the only place a `bigint` micro-unit becomes a decimal string.

- **Neden:** Without `tnum` a live cost readout reflows on every digit change and columns fail to align — exactly the failure a cost table exists to prevent. `slashed-zero` disambiguates 0/O in provider ids and shas. Separating the unit stops '1.284,50₺' reading as one token.
- **Zorlama:** CI grep fails on `toLocaleString(`, `Intl.NumberFormat` or template-literal number interpolation inside `td` / `role="gridcell"` JSX outside `apps/ui/src/format/`. Vitest snapshot asserts computed `font-variant-numeric` on every metric cell in the reference render.

#### `no-css-uppercase-turkish` · BLOCKING · typography/i18n

`text-transform: uppercase` is permitted only on elements carrying `lang="en"` or `data-legend`. `capitalize` and `lowercase` are banned outright. `<html lang="tr">` is mandatory; every English fragment (verb names, model ids, paths, shas) is wrapped in `<span lang="en">`.

- **Neden:** Turkish has two i's with two case pairs (i/İ, ı/I). MDN documents that CSS language-specific case mapping support varies between browsers, so CSS-uppercasing 'iptal' can yield 'IPTAL' instead of 'İPTAL' — it looks like a typo, not a bug, so it survives into a screenshot in a sales deck.
- **Zorlama:** Stylelint disallowed-list for `text-transform: capitalize|lowercase`; CI grep for `uppercase` in className/CSS requires `lang="en"` or `data-legend` on the same element. `eslint-plugin-jsx-a11y` `html-has-lang` plus a Vitest asserting `document.documentElement.lang === 'tr'`.

#### `locale-aware-string-ops` · BLOCKING · i18n

In `apps/ui/src`, `String.prototype.toUpperCase()`, `toLowerCase()` and zero-argument `localeCompare()` are banned. Use `toLocaleUpperCase('tr')`, `toLocaleLowerCase('tr')` and one shared `new Intl.Collator('tr', { sensitivity: 'base' })` for all sorting, filtering and command-palette matching.

- **Neden:** Case-insensitive search over Turkish records silently fails on any word containing i or I — 'İZMİR' will not match 'izmir' under the invariant mapping. The palette is primary navigation, so this bug makes the whole app feel broken.
- **Zorlama:** ESLint `no-restricted-properties` for `toUpperCase`/`toLowerCase`; `no-restricted-syntax` selector `CallExpression[callee.property.name='localeCompare'][arguments.length<2]`. Vitest asserts the palette matches 'ışık' when the user types 'ISIK'.

#### `turkish-expansion-headroom` · BLOCKING · layout/i18n

No label, button, tab, menu item, table header or chip may carry a fixed `width`/`inline-size`. Buttons use `min-inline-size: 96px` + `padding-inline: 12px`; nav items may wrap to two lines with `line-clamp: 2`; the table header row is 40px (two lines), not 28px; the sidebar is 208px; `--col-state` is 136px; `--measure` is 68ch. Every reference screen must render with a +30% pseudo-localisation pass without horizontal overflow.

- **Neden:** Turkish runs ~20–30% longer for the same label ('Approve' → 'Onayla ve depoya işle') and agglutination produces long single words the browser cannot hyphenate. Fixed widths turn that into truncation on exactly the controls that carry irreversible actions.
- **Zorlama:** `pnpm test:pseudo` — Playwright with `?pseudo=1` (pads every i18n string 30%, swaps i↔İ and ı↔I) asserting no element on the 12 reference screens has `scrollWidth > clientWidth + 1`. Stylelint bans `width:` on `.btn`, `.label`, `.tab`.

#### `latin-ext-selfhost` · BLOCKING · typography/i18n

Self-host Inter and IBM Plex Mono as woff2 in `apps/ui/public/fonts` with latin AND latin-ext subsets covering at minimum U+0100-024F, U+0131, U+015E-015F, U+011E-011F, U+00C7, U+00D6, U+00DC and their lowercase forms. Declare `unicode-range` explicitly, `font-display: swap`, and a `size-adjust`-matched fallback. No external font CDN.

- **Neden:** A latin-only subset drops ğ ş ı İ and the browser falls back per-glyph, so a Turkish label renders in two typefaces at two widths mid-word. A CDN font breaks the tool entirely offline, which for a local-first command centre is a hard failure, not a degradation. IBM Plex Mono's latin-ext coverage is unverified — this check is the gate.
- **Zorlama:** `pnpm test:fonts` — a Node script opening each shipped woff2 with `fontkit`, asserting the cmap contains every required codepoint. CI grep bans `fonts.googleapis.com` and `fonts.gstatic.com`.

#### `spacing-six-steps` · WARN · layout

Base unit 4px (`--spacing: 0.25rem`). The console may use only steps 1, 2, 3, 4, 6, 8 (4/8/12/16/24/32px); the studio adds 12, 16, 24 (48/64/96px). Steps 5, 7, 9, 10, 11 and all arbitrary `p-[…]`/`gap-[…]` are banned.

- **Neden:** Six steps force a decision rather than a nudge, and keep the 28px row, 40px header and 24px group header on the same 4px lattice so columns align across independently-built panels. The density difference between the two contexts is carried by spacing, not colour.
- **Zorlama:** CI grep fails on `\b(p|m|gap|space)[xytrbl]?-(5|7|9|10|11)\b` and on `(p|m|gap)[xytrbl]?-\[` inside `apps/ui/src/console/`.

#### `row-height-28` · WARN · layout

Rows are 28px (`--row-h-compact`, default), 32px, or 40px (two-line Turkish labels); headers 40px, sticky group headers 24px. Vertical padding at 28px is 6px. Content that does not fit is never shrunk — the table moves to `relaxed`. Density is per-table, persisted locally, defaulting to compact.

- **Neden:** The point of the shell is seeing 30+ runs without scrolling; shadcn's 40px default shows 18. 28px with 13/16 type is the tightest height that still passes SC 2.5.8 as a full-width target and still holds Turkish descenders.
- **Zorlama:** Row heights come from `--row-h-*` only; CI grep bans `h-\[` and numeric `h-` utilities inside `apps/ui/src/console/queue/`. Playwright asserts `getBoundingClientRect().height === 28` on the default queue row.

#### `table-not-cards` · CONVENTION · layout

Any collection whose items have more than two comparable numeric or categorical attributes renders as a `role="grid"` table; any collection whose primary content is a rendered pixel renders as a contact sheet. No collection ships both views, and there is no view toggle.

- **Neden:** A card list of runs makes cost, duration and status incomparable across rows — the only reason the queue exists. A table of image variants makes you read filenames instead of looking at pictures. A toggle means neither view is designed well and the operator pays a decision cost 20 times a day.
- **Zorlama:** CI grep flags any component under `console/` mapping into an element with both `rounded-` and `border` outside `MediaGrid`. `@axe-core/playwright` asserts `role="grid"` presence on the queue route.

#### `constant-media-stage` · BLOCKING · layout/studio

All studio media renders into one constant `<Stage>`: `display: grid; place-items: center; padding: 48px; max-inline-size: 1200px; max-block-size: calc(100vh - var(--topbar-h) - 96px - var(--filmstrip-h)); object-fit: contain`, unused area filled with the studio `--bg-2` — never black, never a checkerboard. Studio prose is capped at `--measure: 68ch`.

- **Neden:** A 1080×1350 4:5 image and a 1920×1080 video only both feel intentional if the frame is the constant and the asset centres inside it; sizing the container to each asset makes the app jump geometry on every arrow-key press. 68ch rather than 62ch because Turkish words are longer.
- **Zorlama:** A single `<Stage>` component owns these styles; CI grep bans `aspect-` utilities and `object-cover` inside `apps/ui/src/studio/`. Playwright asserts the stage bounding box is identical for a 4:5 and a 16:9 asset.

#### `asset-owns-60` · BLOCKING · layout/studio

In every studio surface the stage occupies ≥60% of viewport width at 1280, 1600 and 1920. The QA scorecard lives in the 320px inspector, scrollable and collapsible to a 40px strip showing only the composite reading and its rail. It is never overlaid on the asset and never a modal. The only marks on the asset are numbered 20px failed-check annotations, bidirectionally linked to scorecard rows by hover AND focus, toggled with `q`.

- **Neden:** The entire purpose of the studio is looking at the thing; a scorecard covering it converts a visual judgement into a reading task. Bidirectional linking that is keyboard-reachable — not hover-only — is what turns 'check 3 failed' into 'that caption, there' without moving the eye off the asset.
- **Zorlama:** Playwright asserts `stage.width / viewport.width >= 0.6` on every studio route at the three widths. CI grep bans `position: absolute` scorecard containers in `studio/`. Axe asserts annotation markers are focusable and referenced with `aria-describedby`.

#### `surface-is-a-route` · BLOCKING · navigation

Opening a creative surface is a route change (`/queue` → `/run/:id/variants`), never a modal, drawer or sheet. `<dialog>.showModal()` is permitted for exactly three things: the command palette, an irreversible-action confirm, and provider credential entry. Nothing else may enter the top layer.

- **Neden:** The studio is where real time is spent — it must be deep-linkable, back-navigable, refreshable, and leaveable while a run continues. A modal is a focus trap that also makes the run queue inert behind a scrim during a 6-minute render.
- **Zorlama:** CI allowlist grep: `showModal(`, `<Dialog`, `role="dialog"` may appear only in `components/CommandPalette.tsx`, `components/ConfirmDestructive.tsx`, `components/ProviderCredentials.tsx`; the test asserts the exact file set.

#### `view-transition-nav-only` · BLOCKING · motion

`document.startViewTransition({ update, types })` is used for shell↔surface navigation only, with `view-transition-name: run-plate` on source thumbnail and target plate. The default root crossfade must be explicitly killed with `::view-transition-old(root), ::view-transition-new(root) { animation: none; }`. Never wrap a data mutation, streaming update, or run-progress tick in a view transition; skip it entirely when `prefers-reduced-motion: reduce` matches.

- **Neden:** The default crossfades the whole document, which on a dense shell reads as a page reload and hides that one element moved. A view transition also freezes the rendered page while it runs — doing that around a live 6-minute run's progress stalls exactly the feedback the operator is watching.
- **Zorlama:** `rg -n 'startViewTransition' apps/ui/src` must match only `apps/ui/src/nav/transition.ts`. Vitest asserts the root-crossfade override exists in the built CSS and that `navigateWithTransition()` short-circuits when the media query matches.

#### `motion-allowlist-six` · BLOCKING · motion

Only six things animate: route positional continuity (220ms), panel disclosure (160ms), the row confirmation rail flash (600ms hold + 900ms fade), the single indeterminate step shuttle (1400ms linear), the dialog scrim (120ms), and colour changes on hover/active/focus (120ms). Durations are `--dur-1..4` (120/160/220/320ms); nothing exceeds 320ms. Easing is `--ease-out: cubic-bezier(0.2,0,0,1)` entering, `--ease-in: cubic-bezier(0.4,0,1,1)` exiting; `ease-in-out` is banned under 300ms. Never animate numbers, list reordering, skeletons, hover scale, chart draw-in, page load, or anything on the queue.

- **Neden:** This tool is opened 20 times a day by the same person; animation that reads as delightful on the first run reads as latency on the two-hundredth. Animating a live cost counter makes the number unreadable and defeats the tabular figures. The 0.2,0,0,1 curve rather than Tailwind's Material default is what makes the shell feel mechanical rather than templated.
- **Zorlama:** Stylelint `declaration-property-value-allowed-list` restricting `transition-duration`/`animation-duration` to the token set; CI grep bans `animate-` utilities outside `{StepRail,RowFlash,Button}.tsx`; Vitest asserts the global `@media (prefers-reduced-motion: reduce)` reset block is present in `dist/assets/*.css`.

#### `seven-surface-states` · BLOCKING · states

Every data-bearing surface implements all seven states — `empty`, `loading`, `streaming`, `ready`, `stale`, `error`, `success` — as a discriminated union, rendered through a `<Surface>` whose props require a slot for each.

- **Neden:** The states that get skipped are always `stale` and `streaming`, and this architecture guarantees both: Ring 3 is a gitignored derived index that will lag Ring 2, and agents emit partial output. A surface without a stale state silently shows yesterday's search results and the operator commits against them.
- **Zorlama:** `SurfaceProps` declares all seven slots non-optional so `tsc --strict` fails on omission. CI grep asserts every file under `apps/ui/src/routes/` default-exports a component whose JSX root is `<Surface`.

#### `loading-delay-no-spinner` · BLOCKING · states

Do not render a loading state before 200ms have elapsed; once rendered, hold it ≥400ms. Loading is a skeleton whenever the shape is known — the real expected row count at the real row height, `--bg-3` fill, 1px `--line-hair`, NO shimmer. Indeterminate spinners are banned everywhere except a 16px glyph inside a button the user just pressed. Any operation with a countable step set uses a determinate step rail.

- **Neden:** A flash of skeleton for a 40ms local SQLite query is worse than nothing. Shimmer is a decorative loop in the operator's peripheral vision all day, and it must be killed under reduced-motion anyway, so it can never be load-bearing. A spinner for a known-length pipeline throws away information the system already has.
- **Zorlama:** `useDelayedLoading(200, 400)` is the only sanctioned source of the loading boolean (grep asserts no other hook returns one). CI grep bans `animate-pulse`, `animate-spin` and `<Spinner` outside `components/Button.tsx`.

#### `stale-never-dims` · BLOCKING · states

Stale content renders at full opacity and full interactivity. Staleness is a 2px hatched `--signal-stale` rule across the panel's block-start edge, a mono timestamp in the header (`indeks 4 dk geride`), and a `Yenile` action. Never auto-refetch a surface the user is viewing; never dim, blur or disable stale content.

- **Neden:** Dimming reads as disabled and the operator stops trusting content that is usually still correct — they start grepping the corpus by hand, which is the workflow the derived index existed to replace. Auto-refetching moves the row you were one keystroke from approving, and here approving is a git commit to the source of truth.
- **Zorlama:** Every component reading the SQLite/FTS layer must accept `indexedAt: Date`, enforced by the query hook's return type so `tsc --strict` fails otherwise. Stylelint bans `opacity` below 1 on `[data-state="stale"]` subtrees.

#### `error-in-place-one-action` · BLOCKING · states

Errors render in place at the position the content would have occupied — never a toast. Every error carries one Turkish sentence, the machine detail in mono inside a collapsed `<details>`, a copyable correlation id, and EXACTLY ONE primary recovery action. The UI switches on the kernel's `AppError.kind` union (the adapter-level provider union is mapped into it) with `default: assertNever(err)`.

- **Neden:** A toast for a failed 6-minute render disappears while the operator is in another window and detaches the failure from the thing that failed. Requiring exactly one action forces the decision about what the operator should actually do. One exhaustive switch rather than two means adding an error kind is a compile error, not a silent blank.
- **Zorlama:** `ErrorStateProps.action: { label: string; onAct: () => void }` is required, not optional — `tsc --strict` fails on omission. `@typescript-eslint/switch-exhaustiveness-check: 'error'` on `remediation.ts`. CI grep bans `toast.error(` and any `sonner` import repo-wide. `scripts/check-error-stories.ts` fails if any union member lacks a story.

#### `status-glyph-color-text` · BLOCKING · states

Every state is encoded as glyph AND colour AND Turkish text. RUN states are exactly the seven kernel states (`kuyrukta`, `planlanıyor`, `onay bekliyor`, `çalışıyor`, `başarılı`, `hata`, `iptal`); ASSET states exactly five; QA verdicts exactly four (`✓ geçti`, `! sınırda`, `✕ kaldı`, `– çalışmadı`), where `sınırda` means `|measured − limit| / limit ≤ 0.10`. Status renders as a 3px full-height andon rail on the row's inline-start edge plus glyph and label — never a pill badge. `iptal` uses `--signal-neutral`, never red.

- **Neden:** A limited, redundantly-coded vocabulary is what lets an operator read a queue at a glance, and it survives the screenshots that end up in Slack and PDF decks. The UI vocabulary must not collapse the kernel's states — dropping `onay bekliyor` hides the only state in which the human is the actor. The edge rail carries state at the same glance distance as a badge while consuming zero horizontal space in a 28px row.
- **Zorlama:** The status union is a TypeScript literal type mirroring `packages/kernel/src/state/run.ts`; a Vitest asserts the render map has exactly one glyph and one Turkish label per member and that the two unions are structurally equal. `tsc` exhaustiveness check on the switch. CI grep bans `<Badge` in `console/queue/`.

#### `run-gauge-contract` · BLOCKING · instrumentation

A multi-step run renders as a horizontal step rail, not a progress bar: one 96px-min segment per step, 6px tall, 2px gaps; states pending (`--bg-4`) / active (determinate if the step reports a fraction, else a 24px shuttle at 1400ms linear) / done (`--fg-muted`) / failed (`--signal-error`) / skipped (hatched). Above it, elapsed at `--text-readout`. ETA is a p20–p80 BAND (`~4:10 – 6:40`), never a point; with fewer than 5 comparable historical runs it renders `—` plus `yetersiz veri (n=N)`. Step labels are the verb's English progress enum key mapped to Turkish in the UI.

- **Neden:** A single bar for a 5-step 6-minute pipeline is a lie — it sits at 40% for three minutes and the operator cancels a run about to succeed. A point ETA that is wrong twice loses all trust; a band that contains the truth builds it. A fabricated band from n=2 is worse than no band.
- **Zorlama:** `RunGaugeProps` requires `steps: Step[]`, `etaBand: [number, number] | null`, `sampleCount: number` — all non-optional, `tsc` enforced. Vitest asserts the component renders `yetersiz veri` when `sampleCount < 5` and throws when `etaBand[0] === etaBand[1]`. Playwright snapshot of all five segment states.

#### `cost-capability-chart` · BLOCKING · instrumentation

Cost accrual renders as a capability chart, not a number: axis 0 → budget cap, minor ticks every 10% and labelled major ticks at 25/50/75%, a `--fg-muted` 24% estimate band bounded by 1px rules at p20/p80, a solid `--accent-solid` actual fill 6px tall updated at 1 Hz, and the cap drawn as a 2px `--fg` spec-limit tick labelled `CAP`. The fill turns `--signal-warn` when actual exceeds the estimate band's upper bound and `--signal-error` at 90% of cap. Below it, three tabular readouts: `harcanan · tahmin · tavan`. Exceeding the cap cancels the run; it is a guard, never a warning banner.

- **Neden:** 'Am I about to blow the budget' is a process-capability question and a capability chart is the correct instrument for it; a bare accumulating number answers it only if you already know the cap. Colouring at the estimate's upper bound rather than at the cap gives warning while there is still time to cancel.
- **Zorlama:** `CostGaugeProps` requires `actualMicros: bigint`, `estimateBand: [bigint, bigint]`, `capMicros: bigint`, `currency` — non-optional, `tsc` enforced. Vitest asserts the amber threshold fires at `actual > estimateBand[1]` and the red at `actual >= capMicros * 90n / 100n`. CI grep bans `parseFloat`/`Number(` on identifiers matching `/cost|price|amount|spend/i` outside `apps/ui/src/format/`.

#### `cancel-always-live` · BLOCKING · instrumentation

A cancel control is visible and enabled for the entire lifetime of every run, at the right end of the step rail, labelled `İptal et` with a `Ctrl+.` key cap. Never in a menu, never disabled, never behind a confirm. On press it becomes `İptal ediliyor…`; if no terminal state within 5s the UI offers `Zorla durdur`. The cancelled state must display the cost incurred up to cancellation.

- **Neden:** Cost is real money accruing in real time; putting cancel behind a `⋯` menu is a financial hazard, and a runaway premium-lane job can burn a month's budget in 90 seconds. Hiding sunk cost after a cancel teaches the operator that cancelling is free, which makes every forecast in the analytics view wrong.
- **Zorlama:** Playwright: for each pipeline fixture, assert a visible enabled `[data-action="cancel-run"]` at every 500ms tick of a mocked run, and assert the terminal cancelled state renders a non-zero `[data-field="cost-incurred"]`. CI grep bans `disabled` on that selector.

#### `qa-is-a-tolerance-reading` · BLOCKING · instrumentation

Every QA check renders as a tolerance reading, not a badge: a row of `ad · ölçülen · limit · sapma` with a 96px tolerance strip running 0 → 2×limit, the limit as a 2px `--fg` tick, the measured value as a 2px×14px needle, the out-of-tolerance region filled 12% `--signal-error`, and deviation as a signed tabular percentage. The composite score is the WORST check, never an average.

- **Neden:** A green dot tells the operator nothing about margin; a needle against a limit tells them whether the next variant will also pass. Averaging lets one hard failure hide behind nine passes, which is precisely the failure a QA gate exists to catch.
- **Zorlama:** `CheckRowProps` requires `measured: number`, `limit: number`, `direction: 'min' | 'max'` — non-optional. Vitest asserts the composite equals `Math.min(...)` over verdict ranks and that a single `kaldı` forces a `kaldı` composite. Playwright snapshot of the four verdict renderings.

#### `safe-zones-from-registry` · BLOCKING · instrumentation/studio

All channel geometry — aspect ratios, resolutions, safe-zone insets, caption bounds — is read from `registry/channels/*.yaml`, never hardcoded in UI or kernel code. The overlay is an `<svg>` sibling of the `<img>` (never baked, never a CSS background): unsafe regions at 12% `--signal-error` fill + 1px solid boundary + 16px L-shaped corner crop marks, no dashed lines, every zone labelled in mono with BOTH px and percent (`üst 250 px (%18,5)`), and graduated rulers along the stage's top and left edges with major ticks every 10% and minor every 2%.

- **Neden:** Platform chrome changes without notice, and a hardcoded 250px inset is both a Ring 1 boundary violation and a maintenance trap requiring a UI release instead of a YAML edit. Dashed lines alias badly at fractional zoom — exactly when you are inspecting. Showing px and percent together is what makes the overlay a measuring instrument rather than a decoration.
- **Zorlama:** CI grep fails on `1080`, `1350`, `1920`, `1\.91`, `9/16`, `4/5` appearing in `apps/ui/src/**` or `packages/kernel/**`. A schema test validates every `registry/channels/*.yaml` against the safe-zone JSON Schema. Playwright asserts the overlay is an `<svg>` sibling of the `<img>`.

#### `focus-ring-2px-outset` · BLOCKING · a11y/interaction

Focus is styled with `:focus-visible` only — never `:focus` — as `outline: 2px solid var(--focus); outline-offset: 2px; border-radius: inherit`. Drawn OUTSIDE the component, never inset. `--focus` must measure ≥3:1 against both the component and its adjacent background in both contexts. `outline: none`/`outline: 0` may appear only in a rule immediately paired with a `:focus-visible` replacement.

- **Neden:** SC 2.4.7 (AA) and 2.4.13 Focus Appearance: a 2px INSET indicator documentedly fails the minimum-area requirement and would need ≥3px, and on a dark row it is nearly invisible anyway. `:focus-visible` avoids a ring on every mouse click, which at 28px density is constant flicker.
- **Zorlama:** Stylelint rule banning bare `:focus` selectors and `outline: none` without a sibling `:focus-visible` block. `pnpm test:contrast` asserts `--focus` against `--bg-1..3` and `--btn-bg` in both contexts. Playwright asserts computed `outline-width` and `outline-offset` are both `2px` on a tabbed-to button.

#### `roving-tabindex-and-focus-integrity` · BLOCKING · a11y/interaction

The queue and every data table is `role="grid"` with roving tabindex — exactly one row tabbable, arrows move focus, Home/End/Ctrl+Home/Ctrl+End jump; the palette uses `aria-activedescendant` with DOM focus on the input. Every focusable row sets `scroll-margin-block-start: 88px`. Entering the studio moves focus to the stage (`tabindex="-1"`) and announces via `aria-live="polite"`; `Esc` returns focus by `data-record-id`, never by element reference. Focus is never trapped outside `showModal()`.

- **Neden:** Without roving tabindex a 30×6 queue costs 180 Tab presses to cross. Without `scroll-margin-block-start` (40px topbar + 40px header + 8px) ArrowDown parks the focused row under the sticky chrome — a literal SC 2.4.11 failure and the single most likely a11y bug in this design, whose practical consequence is approving the wrong record. Storing an element reference breaks because the queue re-sorts while you are in the studio.
- **Zorlama:** `@axe-core/playwright` on the queue route; a Playwright keyboard test asserting exactly one `tabindex="0"` inside `[role="grid"]` at all times, that ArrowDown moves `document.activeElement` by one row, that 200 Tab presses from `body` return to `body`, that `activeElement.getBoundingClientRect().top >= 80` at every step, and that exiting the studio restores the original `data-record-id`.

#### `ctrl-key-allowlist` · BLOCKING · interaction

Modifier bindings are restricted to `Ctrl+K`, `Ctrl+Enter`, `Ctrl+.`, `Ctrl+Shift+.`, `Ctrl+/`, `Ctrl+\`, `Ctrl+Backspace`. Everything else is an unmodified single key on the focused row or a 700ms leader chord (`g q`, `g c`, `g p`, `g r`, `g a`, `g b`, `s d`, `s r`). Bindings colliding with the browser (`Ctrl+T/N/W/Q/R/L/D/P/S/F/H/J/O/U`, `Ctrl+Shift+T/N/W/I/J/C/P`, `Ctrl+1..9`, `Alt+←/→`, `Ctrl++/-/0`, `F1..F12`) are forbidden. All bindings live in one `keymap.ts` table; chord handling is written in-house against it.

- **Neden:** Rebinding `Ctrl+R` for 'run' means the operator loses either reload or your shortcut, and they discover which at the worst moment. Pushing everything onto unmodified single keys is only safe because the queue is a roving-tabindex grid with no autofocused text input — and it is what makes the tool fast.
- **Zorlama:** CI grep bans inline `addEventListener('keydown'` outside `apps/ui/src/keymap/`. A Vitest suite asserts every `keymap.ts` entry is in the modifier allowlist, an unmodified key, or a chord; that none appears in the browser-collision denylist; and that no binding is duplicated within one context.

#### `palette-is-primary-nav` · BLOCKING · interaction

The command palette (`Ctrl+K`, cmdk with `shouldFilter={false}` and app-owned `Intl.Collator('tr')` ranking) is the primary navigation: every action AND every route must be reachable from it, must display its shortcut inline, and must declare a scope (`kayıt`, `pipeline`, `sağlayıcı`, `kanal`). `Ctrl+K` again while open opens the secondary-actions menu for the highlighted item. Sidebar navigation is a convenience mirror, never the only path.

- **Neden:** A palette containing only navigation is a menu with extra steps and nobody uses it. It pays off only when every verb is in it with its shortcut printed inline, which makes it the discoverability surface as well. cmdk does not bind ⌘K itself and its built-in filter is not Turkish-locale aware — typing 'isik' would not find 'ışık'.
- **Zorlama:** A Vitest enumerates the exported `commands` registry and asserts it contains an entry for every route in the router manifest and every entry in `keymap.ts`, and that each has a non-empty Turkish `label` and a `scope`. Fails the build on any orphan action.

#### `target-size-24` · BLOCKING · a11y

Every interactive element has `min-block-size: 24px; min-inline-size: 24px`. Icon-only buttons are exactly 24×24 with a 16px glyph. Where a control must be smaller, adjacent undersized targets must be spaced so 24px-diameter circles centred on their bounding boxes do not intersect.

- **Neden:** SC 2.5.8 Target Size (Minimum), Level AA, verbatim 24×24 CSS pixels. This is the criterion a 28px-row dense UI is most likely to fail, at exactly the controls that trigger irreversible actions — approve, discard, cancel. The full-width 28px row passes as one target; the icon buttons inside it are the risk.
- **Zorlama:** `@axe-core/playwright` target-size check in CI, plus a custom Playwright assertion iterating `button, a, [role="button"], input, select` and failing on any bounding box under 24×24 not annotated `data-target-exception="spacing|inline|equivalent"`.

#### `icon-grid-16-butt` · WARN · identity

Icons are drawn on a 16px grid with `stroke-width: 1.25`, `stroke-linecap: butt`, `stroke-linejoin: miter`, no rounded terminals, no fills. Maintain a ~40-glyph custom set in `apps/ui/src/icons/`; a Lucide glyph may be used only after being restyled to those attributes and imported through `icons/adapters.ts`. Icons are never coloured except the status glyph set.

- **Neden:** Lucide's stock 24px/2px/rounded-cap rendering is the most identifiable 'built from a template in 2024' signal in the default stack, and rounded caps specifically read as friendly-consumer rather than instrument. Butt caps and miter joins at 1.25px read as engineering drawing. Mixing the two languages in one 28px row reads as unfinished more loudly than either alone reads as generic.
- **Zorlama:** `pnpm test:icons` — a Node script parsing every SVG under `apps/ui/src/icons/`, failing on `stroke-linecap="round"`, `stroke-width` ≠ 1.25, `viewBox` ≠ `0 0 16 16`, or any `fill` other than `none`. CI grep bans direct `lucide-react` imports outside `icons/adapters.ts`.

#### `no-illustration-empty-state` · CONVENTION · states/identity

Empty states contain no illustration, no icon larger than 16px, no mascot, no marketing sentence. There are exactly two components and they must not be conflated: `EmptyFirstRun` shows the one command that creates the first record plus its shortcut in a mono key cap; `EmptyFiltered` shows the active filters as removable chips plus `Filtreleri temizle`. Maximum one Turkish sentence at `--text-sm`.

- **Neden:** A generic 'nothing here yet' with a drawing is the loudest default-template signal in the product and tells the operator nothing. Showing the exact command teaches the keyboard map at the only moment the user is idle enough to read it. Conflating the two is the classic bug where a mistyped filter looks like an empty database.
- **Zorlama:** CI grep bans `<img`, `.png`/`.svg` illustration imports, and any `<svg` with `width` > 16 inside `components/Empty*`. A grep asserts no route renders a bare `<Empty>` — only the two named components.

#### `chart-lib-no-palette-no-drawin` · WARN · instrumentation

Charts use uPlot, configured with app tokens only. Any charting library that ships its own colour palette or animates its draw-in is rejected. Chart series draw from `--signal-*` and `--fg-muted`; the brand hue is never a series colour. Axes use `--axis`, major ticks `--tick-major` (8px), minor `--tick-minor` (4px), all labelled in tabular mono.

- **Neden:** A library palette silently reintroduces the accent budget violation and the chroma cap breach in the one place nobody greps; draw-in animation on a cost chart makes the operator wait to read a number the system already had. uPlot is canvas, ~40KB, and imposes neither.
- **Zorlama:** `package.json` allowlist test bans `recharts`, `chart.js`, `victory`, `nivo`. CI grep bans hex literals and `--ref-` references inside `apps/ui/src/charts/`. Playwright's accent-budget pixel test covers chart surfaces.

#### `reference-screens-are-the-fixture` · BLOCKING · process

Twelve reference screens are the CI fixture set for every design-system check: queue-empty, queue-populated, queue-running, awaiting-approval, studio-variants, studio-deck, studio-video, safe-zone-inspector, palette-open, error, stale, budget. Every design rule above that names a Playwright assertion runs against all twelve. Adding a route adds a reference screen in the same PR.

- **Neden:** Design rules with no fixture set degrade into a style guide nobody runs. One fixture set amortises contrast, motion, target-size, overflow, accent-budget and focus-integrity checks over a single Playwright run using the browser binary the project already ships for rendering.
- **Zorlama:** `pnpm test:design` runs the suite; `scripts/check-reference-screens.ts` asserts the router manifest and `tests/design/screens.ts` have identical route sets and fails the build otherwise.



### Token mimarisi

```css
/* apps/ui/src/styles/tokens.css — TIER 1: reference ramps. */
/* Literal oklch() only. NEVER referenced by a component. Verified in sRGB gamut. */
/* Hex in comments = sRGB round-trip, for eyeballing only; CI recomputes. */

:root {
  /* ---- STEEL (console neutrals) — hue 250, C 0.004→0.013, Radix step semantics ---- */
  --ref-steel-1:  oklch(0.1650 0.006 250); /* #0c0f11  app background            */
  --ref-steel-2:  oklch(0.1950 0.007 250); /* #131518  subtle / panel background  */
  --ref-steel-3:  oklch(0.2300 0.008 250); /* #1a1d21  UI element background      */
  --ref-steel-4:  oklch(0.2650 0.009 250); /* #22262a  hovered element            */
  --ref-steel-5:  oklch(0.3050 0.010 250); /* #2b3034  active / selected          */
  --ref-steel-6:  oklch(0.3500 0.011 250); /* #363b40  hairline (decorative)      */
  --ref-steel-7:  oklch(0.4100 0.012 250); /* #464b51  tick marks, disabled fg    */
  --ref-steel-8:  oklch(0.4850 0.013 250); /* #5a6066  panel edge                 */
  --ref-steel-9:  oklch(0.5600 0.013 250); /* #6f757c  rule 2px  (3.63:1 on bg-3) */
  --ref-steel-10: oklch(0.6200 0.012 250); /* #81878d  chart axis (4.64:1 bg-3)   */
  --ref-steel-11: oklch(0.7450 0.010 250); /* #a8adb3  muted text (7.46:1 bg-3)   */
  --ref-steel-12: oklch(0.9550 0.004 250); /* #eef0f3  primary text (14.81:1)     */

  /* ---- PAPER (studio neutrals) — hue 95, faint warm cast: a printed spec sheet ---- */
  --ref-paper-1:  oklch(0.9850 0.002 95);  /* #fafaf9  plate                      */
  --ref-paper-2:  oklch(0.9660 0.003 95);  /* #f4f4f1  inspector / subtle         */
  --ref-paper-3:  oklch(0.9420 0.004 95);  /* #ecece9  stage matte, element bg    */
  --ref-paper-4:  oklch(0.9140 0.005 95);  /* #e3e3df  hovered                    */
  --ref-paper-5:  oklch(0.8820 0.006 95);  /* #d9d8d4  active / selected          */
  --ref-paper-6:  oklch(0.8420 0.007 95);  /* #cccbc6  hairline                   */
  --ref-paper-7:  oklch(0.7850 0.008 95);  /* #bab9b3  panel edge                 */
  --ref-paper-8:  oklch(0.7150 0.009 95);  /* #a5a39d  minor ticks                */
  --ref-paper-9:  oklch(0.6050 0.010 95);  /* #83827b  rule 2px (3.26:1 on p-3)   */
  --ref-paper-10: oklch(0.5450 0.010 95);  /* #72706a  chart axis (4.18:1 p-3)    */
  --ref-paper-11: oklch(0.4600 0.010 95);  /* #5a5852  muted text (6.01:1 p-3)    */
  --ref-paper-12: oklch(0.2450 0.008 95);  /* #22201c  primary text (13.69:1)     */

  /* ---- SIGNALS — one hue per meaning, two lightness steps (dark / light context) ---- */
  /* hue is IDENTICAL across contexts; only L and C change. */
  --ref-green-d:  oklch(0.7400 0.140 150); /* #62c37a  8.83:1 on steel-1 */
  --ref-green-l:  oklch(0.5000 0.125 150); /* #1b763a  5.42:1 on paper-1 */
  --ref-amber-d:  oklch(0.7900 0.150  78); /* #efad32  9.79:1 on steel-1 */
  --ref-amber-l:  oklch(0.5150 0.105  70); /* #8d5b11  5.52:1 on paper-1 */
  --ref-red-d:    oklch(0.6800 0.170  25); /* #ef6661  6.19:1 on steel-1 */
  --ref-red-l:    oklch(0.5100 0.175  25); /* #b52a2d  6.03:1 on paper-1 */
  --ref-cyan-d:   oklch(0.7600 0.110 232); /* #60bdeb  9.17:1 on steel-1 */
  --ref-cyan-l:   oklch(0.5050 0.095 232); /* #186d91  5.51:1 on paper-1 */
  --ref-violet-d: oklch(0.7000 0.080 300); /* #a693c9  7.03:1 — STALE only */
  --ref-violet-l: oklch(0.4800 0.098 300); /* #66508c  6.52:1 — STALE only */

  /* ---- BRAND — one hue, three steps. Accent budget: max 3 appearances per screen. ---- */
  --ref-brand-d:      oklch(0.7200 0.130 172); /* #2bbe9b  line / focus / rail  */
  --ref-brand-solid:  oklch(0.6600 0.120 172); /* #23aa8a  the ONE primary fill */
  --ref-brand-l:      oklch(0.4950 0.090 172); /* #14725c  studio line / focus  */

  --ref-scrim: oklch(0.1400 0.005 250 / 0.72); /* flat, no blur */
}

/* ------------------------------------------------------------------ */
/* apps/ui/src/styles/context.css — TIER 2: semantic roles per surface  */
/* These are the ONLY variables a tier-3 component token may reference. */
/* ------------------------------------------------------------------ */

[data-surface="console"] {
  color-scheme: dark;
  --bg-1: var(--ref-steel-1);  --bg-2: var(--ref-steel-2);
  --bg-3: var(--ref-steel-3);  --bg-4: var(--ref-steel-4);
  --bg-sel: var(--ref-steel-5);
  --fg: var(--ref-steel-12);   --fg-muted: var(--ref-steel-11);
  --fg-disabled: var(--ref-steel-7);
  --line-hair: var(--ref-steel-6);   /* 1px, decorative row separation */
  --line-edge: var(--ref-steel-8);   /* 1px, panel boundary            */
  --line-rule: var(--ref-steel-9);   /* 2px, section division          */
  --tick-minor: var(--ref-steel-7);  --tick-major: var(--ref-steel-10);
  --axis: var(--ref-steel-10);
  --focus: var(--ref-brand-d);
  --accent-line: var(--ref-brand-d);
  --accent-solid: var(--ref-brand-solid);
  --accent-on-solid: var(--ref-steel-1);   /* 6.56:1 */
  --signal-ok: var(--ref-green-d);     --signal-warn: var(--ref-amber-d);
  --signal-error: var(--ref-red-d);    --signal-info: var(--ref-cyan-d);
  --signal-stale: var(--ref-violet-d); --signal-running: var(--ref-brand-d);
  --signal-neutral: var(--ref-steel-9);    /* cancelled — never error-coloured */
}

[data-surface="studio"] {
  color-scheme: light;
  --bg-1: var(--ref-paper-1);  --bg-2: var(--ref-paper-2);
  --bg-3: var(--ref-paper-3);  --bg-4: var(--ref-paper-4);
  --bg-sel: var(--ref-paper-5);
  --fg: var(--ref-paper-12);   --fg-muted: var(--ref-paper-11);
  --fg-disabled: var(--ref-paper-8);
  --line-hair: var(--ref-paper-6);
  --line-edge: var(--ref-paper-7);
  --line-rule: var(--ref-paper-9);
  --tick-minor: var(--ref-paper-8);  --tick-major: var(--ref-paper-10);
  --axis: var(--ref-paper-10);
  --focus: var(--ref-brand-l);
  --accent-line: var(--ref-brand-l);
  --accent-solid: var(--ref-brand-l);
  --accent-on-solid: var(--ref-paper-1);
  --signal-ok: var(--ref-green-l);     --signal-warn: var(--ref-amber-l);
  --signal-error: var(--ref-red-l);    --signal-info: var(--ref-cyan-l);
  --signal-stale: var(--ref-violet-l); --signal-running: var(--ref-brand-l);
  --signal-neutral: var(--ref-paper-9);
}

/* ------------------------------------------------------------------ */
/* TIER 3 — component tokens. Reference tier 2 ONLY.                    */
/* ------------------------------------------------------------------ */
:root {
  /* geometry */
  --topbar-h: 40px;  --statusbar-h: 24px;
  --sidebar-w: 208px; --sidebar-w-collapsed: 48px;   /* 208 = Turkish nav labels */
  --inspector-w: 320px; --inspector-w-collapsed: 40px;
  --filmstrip-h: 96px;
  --row-h-compact: 28px; --row-h-default: 32px; --row-h-relaxed: 40px;
  --row-h-header: 40px;  --row-h-group: 24px;        /* header 40 = two Turkish lines */
  --target-min: 24px;
  --stage-pad: 48px;  --stage-max-i: 1200px;
  --measure: 68ch;                                    /* 68, not 62: Turkish words */
  --plate-gutter: 12px;                               /* dark frame always visible */
  --scroll-margin-row: 88px;                          /* 40 topbar + 40 header + 8 */

  /* column widths — sized from the longest Turkish string + 30% headroom */
  --col-rail: 3px;      /* andon status rail, no text */
  --col-state: 136px;   /* "onay bekliyor" 13ch @13px + 16px glyph + 8px gap + 30% */
  --col-cost: 112px;    /* "₺ 1.284,50" tabular mono @13px */
  --col-eta: 128px;     /* "~4:10 – 6:40" band, tabular mono */
  --col-elapsed: 72px;
  --col-pipeline: 160px;
  --col-label-min: 240px;

  /* line weights */
  --w-hair: 1px; --w-edge: 1px; --w-rule: 2px; --w-rail: 3px;

  /* radii — instruments have square corners */
  --radius-sm: 0; --radius-md: 2px; --radius-lg: 4px; --radius-full: 9999px;

  /* motion */
  --dur-1: 120ms; --dur-2: 160ms; --dur-3: 220ms; --dur-4: 320ms;
  --dur-shuttle: 1400ms; --dur-rail-hold: 600ms; --dur-rail-fade: 900ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in:  cubic-bezier(0.4, 0, 1, 1);
  --ease-linear: linear;

  /* buttons */
  --btn-h: 28px; --btn-h-lg: 32px;
  --btn-min-i: 96px; --btn-pad-i: 12px;
  --btn-bg: var(--bg-3); --btn-bg-hover: var(--bg-4); --btn-bg-active: var(--bg-sel);
  --btn-fg: var(--fg); --btn-border: var(--line-edge);
  --btn-primary-bg: var(--accent-solid); --btn-primary-fg: var(--accent-on-solid);

  /* rails & gauges */
  --rail-w: 3px;
  --gauge-h: 6px; --gauge-gap: 2px; --gauge-seg-min: 96px;
  --gauge-shuttle-w: 24px;
  --cap-tick-w: 2px; --tick-major-h: 8px; --tick-minor-h: 4px;
  --needle-w: 2px; --needle-h: 14px;

  /* the one and only shadow, on [data-elevation="overlay"] */
  --overlay-shadow: 0 8px 24px oklch(0 0 0 / 0.55);
  --scrim: var(--ref-scrim);
}

/* ------------------------------------------------------------------ */
/* Tailwind v4 wiring. `inline` is REQUIRED: these reference other vars. */
/* Namespaces are zeroed first so unlisted values generate no utilities. */
/* ------------------------------------------------------------------ */
@theme inline {
  --color-*: initial;
  --color-bg-1: var(--bg-1);       --color-bg-2: var(--bg-2);
  --color-bg-3: var(--bg-3);       --color-bg-4: var(--bg-4);
  --color-bg-sel: var(--bg-sel);
  --color-fg: var(--fg);           --color-fg-muted: var(--fg-muted);
  --color-fg-disabled: var(--fg-disabled);
  --color-hair: var(--line-hair);  --color-edge: var(--line-edge);
  --color-rule: var(--line-rule);  --color-axis: var(--axis);
  --color-tick-minor: var(--tick-minor); --color-tick-major: var(--tick-major);
  --color-focus: var(--focus);
  --color-accent: var(--accent-line);    --color-accent-solid: var(--accent-solid);
  --color-ok: var(--signal-ok);          --color-warn: var(--signal-warn);
  --color-error: var(--signal-error);    --color-info: var(--signal-info);
  --color-stale: var(--signal-stale);    --color-running: var(--signal-running);
  --color-neutral: var(--signal-neutral);

  --radius-*: initial;
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-full: var(--radius-full);

  --ease-*: initial;
  --ease-out: var(--ease-out);
  --ease-in: var(--ease-in);
}
@theme {
  --spacing: 0.25rem;              /* 4px lattice, unchanged from v4 default */
  --font-*: initial;
  --font-sans: "Inter var", "Inter", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --font-sans--font-feature-settings: "cv08" 1, "cv05" 1, "zero" 1, "calt" 1;
  --font-mono--font-feature-settings: "zero" 1;
  --default-transition-duration: 120ms;
  --default-transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
}
```

RULINGS on tier-1 disputes:
- **Line contrast.** Only lines that are the *sole* carrier of meaning enter the 3:1 matrix: `--focus`, all `--signal-*`, `--axis`, `--tick-major`, the safe-zone boundary, the spec-limit tick, the video playhead, the status rail. `--line-hair` (1.71:1) and `--line-edge` (3.02:1 on bg-1) are exempt because every panel is *also* distinguished by a background step, so the line is never the only cue — WCAG 1.4.11 does not bind decorative boundaries.
- **`--signal-stale` is violet, not amber.** Staleness is not a warning; giving it amber makes a routine, correct condition read as an alarm and burns the one colour that should mean "look now".
- **`cancelled` uses `--signal-neutral` (steel-9), never red.** A human-cancelled run is not a failure, and colouring it red makes the analytics view lie.
- Tier-1 hexes are round-trips of designed values, not measured; `pnpm test:contrast` is the gate that lets any of them ship.


### Tipografi

**Families — exactly two, self-hosted, no CDN.**
- `--font-sans`: Inter var (woff2, `latin` + `latin-ext` subsets, `unicode-range` declared, `font-display: swap`, `size-adjust` matched fallback). Global features `cv08` (upper-case I with serifs — disambiguates I/l/1 in provider ids), `cv05` (lower-case l with tail), `zero` (slashed zero), `calt`. `tnum` is **not** global — it is applied per element via `font-variant-numeric`.
- `--font-mono`: IBM Plex Mono (same subsetting). Its latin-ext coverage is **unverified**; the blocking CI cmap check (ğ Ğ ş Ş ı İ ç Ç ö Ö ü Ü) is the gate. Fallback if it fails: JetBrains Mono.
- No third family. `font-family` may not be declared outside `tokens.css`.

**The 9-size scale.** Declared as Tailwind `--text-*` with paired `--text-*--line-height`, after `--text-*: initial`. No `text-[…]` arbitrary values.

| token | px | line-height | weight | tracking | job |
|---|---|---|---|---|---|
| `--text-micro` | 11 | 12 | 500 | +0.06em | screen-printed panel legends, `lang="en"` keys only |
| `--text-2xs` | 12 | 16 | 450 | 0 | table micro-cells, key caps, timestamps |
| `--text-xs` | **13** | **16** | 450 | 0 | **console default** — row text, labels, buttons |
| `--text-sm` | 14 | 20 | 450 | 0 | console panel headers, empty-state sentence |
| `--text-base` | 15 | 22 | 400 | 0 | studio prose |
| `--text-md` | 17 | 24 | 500 | 0 | studio section headings |
| `--text-lg` | 22 | 28 | 550 | −0.01em | studio surface title |
| `--text-xl` | 28 | 32 | 550 | −0.015em | studio page title |
| `--text-readout` | 36 | 36 | 500 mono | −0.01em | elapsed time, live cost, composite QA score |

Weights: 400 / 450 / 500 / 550 / 650. **700 is banned in the console** — bold at 13px on steel-1 blooms and loses the ğ/ş descender detail. Every console line box is ≥16px so Turkish diacritic stacks (ğ over a descender) never collide.

**Numerals — the instrumentation rule.**
- Any number in a table, metric, cost, duration, dimension, count, or gauge sets `font-variant-numeric: tabular-nums slashed-zero lining-nums` and renders in `--font-mono`. Prose keeps proportional Inter figures.
- The unit is a **sibling** `<span class="unit">` at `0.85em` in `--fg-muted`, separated by a 4px gap: `1.284,50` + `₺`, `6:40` + `dk`, `1080` + `px`. Never `1.284,50₺` as one token.
- `<Num value unit precision />` is the **only** sanctioned way to render a number. It is the only place `Intl.NumberFormat('tr-TR')` may be constructed (one memoised instance), and the only place a `bigint` micro-unit becomes a decimal string.
- Live values (cost accrual, elapsed) update at **1 Hz**, never tweened, never transitioned. Tabular figures + no animation is what makes a changing number readable.
- Currency: the gauge is denominated in the **budget cap's** currency. A `CostEvent` in another currency is converted at the committed `registry/providers/_pricing/<provider>-<YYYY-MM-DD>.json` rate and prefixed `≈`, with the snapshot date in the micro-legend — a converted reading must carry its traceability, like any instrument reading.

**Turkish constraints (hard, not footnotes).**
1. `<html lang="tr">` is mandatory. Every English fragment (verb names, model ids, paths, shas) is wrapped in `<span lang="en">`.
2. `text-transform: uppercase` is permitted **only** on `[lang="en"]` or `[data-legend]`. `capitalize` and `lowercase` are banned outright. Chromium's Turkish `i/İ` case mapping is documented-but-unreliable; "iptal" rendering as "IPTAL" is a typo-shaped bug that survives into sales decks. Micro-legends are therefore English keys (`RUN`, `COST`, `ETA`, `LANE`) — which is also the authentic screen-printed-panel read.
3. `toUpperCase()` / `toLowerCase()` / zero-arg `localeCompare()` are banned in `apps/ui/src`. Use `toLocaleUpperCase('tr')`, `toLocaleLowerCase('tr')`, and one shared `new Intl.Collator('tr', { sensitivity: 'base' })` for **all** sorting, filtering and palette ranking. Typing `ISIK` must match `ışık`.
4. **20–30% expansion headroom is a layout number, not a caveat.** `--btn-min-i: 96px` with `--btn-pad-i: 12px`; table header row is `40px` (two lines) not 28px; sidebar is `208px` not the reflexive 180px; nav items `line-clamp: 2`; `--col-state: 136px` sized from `"onay bekliyor"` + glyph + 30%; `--measure: 68ch` not 62ch. No fixed `width`/`inline-size` on any label, button, tab, menu item, table header or chip.
5. All Turkish content is NFC-normalised at the corpus boundary; the diacritic multiset `[çÇğĞıİöÖşŞüÜ]` is preserved by every UI transform.
6. CI gate: `pnpm test:pseudo` runs the 12 reference screens with `?pseudo=1` (pads every i18n string +30%, swaps i↔İ and ı↔I) and fails on any element where `scrollWidth > clientWidth + 1`.


### Yerleşim

**Spacing lattice.** Base unit 4px (`--spacing: 0.25rem`). Console may use steps **1, 2, 3, 4, 6, 8** only → 4 / 8 / 12 / 16 / 24 / 32px. Studio adds **12, 16, 24** → 48 / 64 / 96px. Steps 5, 7, 9, 10, 11 and every arbitrary `p-[…]` / `gap-[…]` are banned. The density difference between the two contexts is carried by **spacing, not colour**.

**Shell — one persistent dark frame, never re-rendered.**
```
grid-template-columns: var(--sidebar-w) 1fr;
grid-template-rows:    var(--topbar-h) 1fr var(--statusbar-h);
```
- topbar 40px, statusbar 24px, sidebar 208px (collapsed 48px), inspector 320px (collapsed 40px strip), filmstrip 96px.
- The studio is a **light plate inset inside the dark frame** with a minimum `--plate-gutter: 12px` dark border on all four sides. The frame's computed `background-color` must be byte-identical before and after entering the studio.

**Row heights.** compact **28px** (default), default 32px, relaxed 40px (two-line Turkish labels). Header 40px. Sticky group header 24px. Vertical padding at 28px is 6px (13px/16px line box + 6 + 6 = 28). Content that does not fit is **never shrunk** — the table moves to `relaxed`. Density is a per-table setting persisted in `localStorage`, defaulting to compact. 28px is what makes 30+ runs visible without scrolling; shadcn's 40px default shows 18.

**Queue grid — column widths sized from Turkish, right-aligned numerics.**
```
grid-template-columns:
  var(--col-rail)                 /* 3px andon rail, no gap */
  var(--col-state)                /* 136px  glyph + Turkish label */
  minmax(var(--col-label-min), 1fr) /* 240px min record label */
  var(--col-pipeline)             /* 160px */
  var(--col-elapsed)              /* 72px  mono, right */
  var(--col-eta)                  /* 128px "~4:10 – 6:40" band */
  var(--col-cost)                 /* 112px "₺ 1.284,50" */
  auto;                           /* 24×24 icon actions */
column-gap: 12px;  /* the rail has NO gap — it touches the row edge */
```
Every numeric column is `text-align: right` with tabular mono, so decimal points align down the column. The state column carries `--col-state: 136px` because `"onay bekliyor"` at 13px Inter is ~88px, plus a 16px glyph, plus an 8px gap, plus 30% pseudo-localisation headroom.

**Media stage — one constant box, the asset moves inside it.**
```css
.stage {
  display: grid; place-items: center;
  padding: var(--stage-pad);                    /* 48px */
  max-inline-size: var(--stage-max-i);          /* 1200px */
  max-block-size: calc(100vh - var(--topbar-h) - var(--stage-pad)*2 - var(--filmstrip-h));
  background: var(--bg-2);                      /* never black, never checkerboard */
}
.stage img, .stage video { object-fit: contain; max-inline-size: 100%; max-block-size: 100%; }
```
The stage bounding box is **identical** for a 1080×1350 4:5 asset and a 1920×1080 16:9 asset. Sizing the container to each asset makes the app jump geometry on every arrow-key press.

**Asset ownership.** In every studio surface the stage occupies **≥60% of viewport width** at 1280, 1600 and 1920. The QA scorecard lives in the 320px inspector — scrollable, collapsible to a 40px strip showing only the composite reading and its rail. It is never overlaid on the asset and never a modal.

**Breakpoints — three, and they are the CI widths.** 1280 / 1600 / 1920.
- <1280: inspector auto-collapses to the 40px strip; sidebar collapses to 48px.
- ≥1600: filmstrip may show 8 cells instead of 5.
- The app declares a 1280px minimum; below it a single `--text-sm` line says so. This is a desktop instrument, not a responsive site.

**Prose.** `--measure: 68ch` in the studio (68 rather than the usual 60–65 because Turkish words are longer). Console panels have no measure — tables fill.

**Elevation without shadows.** Three background steps (bg-1 frame → bg-2 panel → bg-3 element) plus a **bevel hairline**: a panel's `border-block-start` is `--line-edge` while the other three sides are `--line-hair`. That single asymmetry reads as a machined panel lit from above. `box-shadow`, `drop-shadow`, `backdrop-filter` and gradients are banned everywhere except `[data-elevation="overlay"]` (three dialogs only), whose `::backdrop` is a flat `--scrim` with no blur.

**Radii.** `--radius-sm: 0`, `--radius-md: 2px`, `--radius-lg: 4px`. Nothing in the console is rounder than 4px. `--radius-full` is reserved for exactly one element: the 8px status dot.


### Etkileşim

**Modifier allowlist — these seven and nothing else.**

| binding | action |
|---|---|
| `Ctrl+K` | command palette (again while open → secondary-actions menu for the highlighted item) |
| `Ctrl+Enter` | the one primary action of the current surface (approve plan / apply proposal) |
| `Ctrl+.` | cancel the running job |
| `Ctrl+Shift+.` | force stop (offered only after cancel has hung 5s) |
| `Ctrl+/` | shortcut sheet |
| `Ctrl+\` | toggle inspector |
| `Ctrl+Backspace` | back to `/queue` |

**Forbidden — browser collisions, denylist-tested.** `Ctrl+T/N/W/Q/R/L/D/P/S/F/H/J/O/U`, `Ctrl+Shift+T/N/W/I/J/C/P`, `Ctrl+1..9`, `Ctrl++/−/0`, `Alt+←/→`, `F1..F12`. Rebinding `Ctrl+R` for "run" means the operator loses either reload or your shortcut, and discovers which at the worst moment.

**Leader chords** — 700ms window, first key shows a 2xs hint strip in the statusbar, `Esc` aborts:
`g q` queue · `g c` cost · `g p` pipelines · `g r` registry · `g a` analytics · `g b` branches · `s d` cycle density · `s r` refresh (explicit, never automatic).

**Unmodified single keys on the focused row** (safe because the grid holds focus and no text input is autofocused):
`j`/`k` or `↓`/`↑` move · `Enter` open studio · `Esc` back one level · `a` approve (enabled only in `onay bekliyor`) · `x` cancel · `r` rerun as a new runId · `c` copy correlation id · `p` open the frozen plan · `l` toggle lane free/premium on the plan · `/` focus filter · `?` shortcut sheet · `Home`/`End`/`Ctrl+Home`/`Ctrl+End` jump.

**Studio keys:** `←`/`→` prev/next variant · `q` toggle QA annotations · `z` toggle safe zones · `t` toggle rulers · `+`/`−` zoom, `0` fit · `Space` play/pause · `,`/`.` frame step · `1`–`9` focus pipeline step *n*.

**Declaration.** Every binding lives in one table, `apps/ui/src/keymap.ts`. Inline `addEventListener('keydown')` is banned. Chord handling is ~40 lines written in-house against that table — `tinykeys`' maintenance status is unverified and a keymap this small does not justify a dependency.

**Command palette is primary navigation.** Built on `cmdk` with `shouldFilter={false}` and app-owned `Intl.Collator('tr')` ranking (cmdk's own filter is not Turkish-aware — `isik` would not find `ışık`). Every action *and every route* must be reachable from it, must print its own shortcut inline, and must declare a scope (`kayıt`, `pipeline`, `sağlayıcı`, `kanal`). Sidebar navigation is a convenience mirror, never the only path. A palette that only contains navigation is a menu with extra steps.

**Focus rules.**
- `:focus-visible` **only**, never `:focus`. Ring is `outline: 2px solid var(--focus); outline-offset: 2px; border-radius: inherit;` — drawn **outside**, never inset (a 2px inset indicator fails SC 2.4.13's minimum-area requirement and is nearly invisible on a dark row anyway).
- Tables are `role="grid"` with **roving tabindex**: exactly one row is tabbable at any moment, arrows move focus. Without it a 30×6 queue costs 180 Tab presses to cross.
- The palette uses `aria-activedescendant` with DOM focus retained on the input, so typing keeps working while the highlight moves.
- Every focusable row sets `scroll-margin-block-start: 88px` (`--topbar-h` 40 + `--row-h-header` 40 + 8). Without it `ArrowDown` parks the focused row under 80px of sticky chrome — a literal SC 2.4.11 failure, and in practice it means approving the wrong record.
- Entering the studio moves focus to the stage (`tabindex="-1"`) and announces the surface via `aria-live="polite"`. `Esc` returns focus **by `data-record-id`**, not by element reference — the queue re-sorts while you are away.
- Focus is never trapped outside a `showModal()` dialog. `showModal()` is permitted for exactly three components: `CommandPalette`, `ConfirmDestructive`, `ProviderCredentials`. Nothing else may enter the top layer, so the browser's built-in `inert`+`Esc` semantics are the only focus-trap code in the app.

**Navigation is routing, not modals.** Opening a creative surface is `/queue` → `/run/:id/variants`. Deep-linkable, back-button-navigable, refreshable, and leaveable while a run continues.

**Target size.** Every interactive element is ≥24×24px. Icon-only buttons are exactly 24×24 with a 16px glyph. The full-width 28px row passes as one target; the icon buttons inside it are the risk, and they are what trigger irreversible actions.

**Queue keys are never disabled by state alone.** `x` (cancel) is live for the entire lifetime of a run — never in a `⋯` menu, never disabled, never behind a confirm. It is a financial safety mechanism.


### Durumlar

**The seven-state matrix.** `SurfaceProps` declares all seven slots **non-optional**, so `tsc --strict` fails on omission. Every route component's JSX root is `<Surface>`.

| state | rule (concrete) |
|---|---|
| `empty` | Two distinct components, never conflated. `EmptyFirstRun`: one sentence at `--text-sm`, the exact command that creates the first record, and its shortcut in a mono key cap. `EmptyFiltered`: the active filters as removable chips + `Filtreleri temizle`. No illustration, no mascot, no icon over 16px, no marketing sentence. Conflating them is the classic bug where a mistyped filter looks like an empty database. |
| `loading` | **Do not render before 200ms elapsed; once rendered, hold ≥400ms.** `useDelayedLoading(200, 400)` is the only source of the boolean. Skeleton = the *real* expected row count at the *real* row height, `--bg-3` fill, 1px `--line-hair`, **no shimmer**. A flash of skeleton for a 40ms local SQLite query is worse than nothing; shimmer is a loop running in peripheral vision all day and has to die under reduced-motion anyway, so it can never be load-bearing. |
| `streaming` | Partial content renders in place at full opacity. A 2px `--signal-running` rule on the panel's block-start edge plus a mono counter (`3/7 adım`). Never wrapped in a view transition — the page freezes during capture. |
| `ready` | Nothing special; this is the only state without a rule. |
| `stale` | **Full opacity, full interactivity.** Staleness is a 2px 45° hatched rule in `--signal-stale` across the panel's block-start edge, a mono timestamp in the header (`indeks 4 dk geride`), and a `Yenile` action. **Never dim, blur, disable, or auto-refetch a surface the user is viewing.** Dimming reads as disabled and the operator stops trusting the index; auto-refetching moves the row you were one keystroke from approving — which here is a git commit to the source of truth. Every component reading the FTS layer must accept `indexedAt: Date` (enforced by the query hook's return type). |
| `error` | **In place, at the position the content would have occupied. Never a toast.** Carries: one Turkish sentence (`error.userMessage`); the machine detail in mono inside a collapsed `<details>` (`error.providerMessage`, verbatim); a copyable correlation id; and **exactly one** primary recovery action. `ErrorStateProps.action` is required, not optional. `toast.error(` and `sonner` are banned repo-wide. |
| `success` | The row's inline-start rail flashes `--signal-ok` for 600ms then fades over 900ms. No toast, no confetti, no sound. |

**Error → remediation map.** The UI switches on the kernel's 16-member `AppError.kind` (not the adapter-level 9-member provider union — the adapter layer maps into the kernel union so there is exactly **one** exhaustive switch), with `default: assertNever(err)` and `@typescript-eslint/switch-exhaustiveness-check: 'error'`.

| kind | rendering |
|---|---|
| `provider_unavailable` | inline `N sn sonra yeniden denenecek`, breaker state visible (`açık` / `yarı açık` / `kapalı`), **no user action** |
| `provider_rate_limit` / `provider_quota` | job parked, unlock time as an absolute tr-TR timestamp, action `Ücretsiz şeride geç` |
| `provider_bad_response` (content rejected) | terminal, provider's verbatim reason + the offending prompt/asset with an inline edit action, and **no retry button** |
| `validation` | the failing field path (`/pipelines/0/steps/2/capability`) highlighted in the recipe editor |
| `budget_exceeded` | blocked before any network call; shows remaining budget against the cap on the capability chart |
| `cancelled` | `--signal-neutral`, no error styling |
| `timeout` | terminal + a `muhtemelen ücretlendirildi` cost reading and a link to the provider dashboard |
| `render_failed` / `subprocess_failed` | stderr tail in `<details>`, action `Tekrar dene` |
| `config` / `not_found` / `conflict` / `io` / `internal` / `provider_auth` | one sentence + correlation id + the single relevant action |

---

**RUN status vocabulary — exactly the seven kernel states, 1:1.**
`queued` → `kuyrukta` (glyph `⋯`, neutral) · `planning` → `planlanıyor` (`◐`, info) · `awaiting-approval` → `onay bekliyor` (`⏸`, warn) · `executing` → `çalışıyor` (`▶`, running) · `succeeded` → `başarılı` (`✓`, ok) · `failed` → `hata` (`✕`, error) · `cancelled` → `iptal` (`∅`, **neutral**).

*Ruling:* the UI/UX research proposed collapsing to five states; that is rejected, because collapsing hides `onay bekliyor` — the only state in which the human is the actor. Status is **glyph + colour + Turkish text**, always; colour alone is never the carrier. It is rendered as a **3px full-height andon rail on the row's inline-start edge** plus the glyph and label — never a pill badge, which would cost horizontal space that 30 visible rows cannot spare.

ASSET states are the kernel's five: `taslak` / `QA geçti` / `onaylı` / `yayında` / `emekli`.

---

**The run gauge — a step rail, not a progress bar.**
- One segment per pipeline step, `min-inline-size: 96px`, `height: 6px`, `gap: 2px`.
- Segment states: `pending` = `--bg-4` · `active` = `--signal-running`, determinate if the step reports `{done, total}`, otherwise a single 24px shuttle at 1400ms linear · `done` = `--fg-muted` · `failed` = `--signal-error` · `skipped` = 45° hatch.
- Step labels come from the verb's **English progress enum key** mapped to Turkish in the UI — the kernel never emits a formatted Turkish string.
- Above the rail: elapsed at `--text-readout` (36px mono, tabular, 1 Hz, no tween).
- ETA is a **p20–p80 band**, never a point: `~4:10 – 6:40`, computed from the last 20 completed runs of the same pipeline shape. **If n < 5, render `—` and the micro-legend `yetersiz veri (n=3)`** — a fabricated band is worse than none. `RunGaugeProps.etaBand: [number, number]` is required and the component throws if `etaBand[0] === etaBand[1]`.
- A single bar for a 5-step 6-minute pipeline is a lie: it sits at 40% for three minutes and the operator cancels a run that was about to succeed.
- `İptal et` with a `Ctrl+.` key cap sits at the right end of the rail, always visible and enabled. On press → `İptal ediliyor…`; if no terminal state within **5s**, offer `Zorla durdur`. The cancelled state **must** display the cost incurred up to cancellation — hiding sunk cost teaches the operator that cancelling is free and makes every budget forecast wrong.

**Cost as a capability chart against the cap as a spec limit.**
```
0 ─────────────────────────────────────────────────┤ tavan
   ░░░░░░░░░░░░░░ estimate band (p20–p80)
   ██████████████████ actual
                                            ▲ 90% eylem sınırı
```
- Axis runs 0 → budget cap. Minor ticks every 10% (`--tick-minor`, 1px, 4px tall); major ticks at 25/50/75% (`--tick-major`, 1px, 8px tall), each labelled in tabular mono.
- The **cap** is a 2px full-height `--fg` tick with a `lang="en"` micro-legend `CAP` and the value below it. It is a spec limit, drawn like one.
- Pre-run **estimate band**: `--fg-muted` at 24% fill, bounded by 1px `--line-rule` at p20 and p80.
- **Actual**: solid `--accent-solid` fill, height 6px, updated at 1 Hz.
- Colour transitions: fill turns `--signal-warn` when actual exceeds the estimate band's upper bound; `--signal-error` at **90% of cap**. Below the chart, three tabular readouts: `harcanan · tahmin · tavan`.
- Exceeding the cap is a **guard, not a warning** — the run transitions to `iptal` with `reason: budget-cap` and the chart shows the truncated fill against the limit. There is no "continue anyway".
- Provider drift flags (|actual − estimate|/estimate > 0.25) surface as a count in the queue header until acknowledged; an open circuit breaker renders its state in the row, never silently.

**QA as a tolerance reading, not a badge.** Each check renders as one 24px row in the inspector:
`ad · ölçülen · limit · sapma` with a horizontal tolerance strip 96px wide running `0 → 2×limit`, the limit as a 2px `--fg` tick at centre, the measured value as a 2px×14px needle, and the out-of-tolerance region filled at 12% `--signal-error`. Deviation is a signed tabular percentage (`+%12` / `−%4`).
- Verdicts, exactly four: `✓ geçti` · `! sınırda` · `✕ kaldı` · `– çalışmadı`. **`sınırda` is defined numerically**: `|measured − limit| / limit ≤ 0.10` on the passing side.
- **The composite score is the worst check, never an average.** Averaging lets one hard failure hide behind nine passes.
- Failed checks get numbered 20px annotations on the asset, bidirectionally linked to their scorecard row by hover **and** by focus (`aria-describedby`), toggled with `q`.
- Safe-zone geometry is read from `registry/channels/*.yaml`, never hardcoded. Overlay is an `<svg>` sibling of the `<img>`: unsafe regions at 12% `--signal-error` fill + 1px solid boundary + 16px L-shaped corner crop marks, **no dashed lines** (they alias badly at fractional zoom, which is exactly when you are inspecting). Every zone is labelled in mono with **both** px and percent (`üst 250 px (%18,5)`). Graduated rulers along the stage's top and left edges: major ticks every 10%, minor every 2%.


### Hareket

**The allowlist — six animations. Everything else is static.**

| # | what | duration | easing |
|---|---|---|---|
| 1 | route positional continuity (shell ↔ surface) | `--dur-3` 220ms | `--ease-out` |
| 2 | panel / `<details>` disclosure | `--dur-2` 160ms | `--ease-out` |
| 3 | row state-confirmation rail flash | 600ms hold + 900ms fade | `--ease-in` on the fade |
| 4 | indeterminate step shuttle (24px) | `--dur-shuttle` 1400ms, `iteration-count: infinite` | `linear` |
| 5 | dialog scrim in/out | `--dur-1` 120ms | `--ease-out` / `--ease-in` |
| 6 | colour change on hover/active/focus | `--dur-1` 120ms | `--ease-out` |

Tokens: `--dur-1: 120ms`, `--dur-2: 160ms`, `--dur-3: 220ms`, `--dur-4: 320ms`. **Nothing exceeds 320ms.** Easing is `--ease-out: cubic-bezier(0.2, 0, 0, 1)` entering and `--ease-in: cubic-bezier(0.4, 0, 1, 1)` exiting. `ease-in-out` is banned under 300ms (it reads as sluggish at short durations). The `0.2, 0, 0, 1` curve rather than Tailwind's default Material `0.4, 0, 0.2, 1` is the specific choice that makes the shell feel mechanical rather than templated.

**Never animate:** numbers (the live cost counter especially — rolling digits are unreadable and defeat the tabular figures), list reordering, skeletons, hover scale/lift, chart draw-in, page load, anything on the run queue, and any property that is not `opacity`, `transform`, `background-color`, `border-color`, `color` or `outline-color`.

This tool is opened 20 times a day by the same person. Animation that reads as delightful on the first run reads as latency on the two-hundredth.

**View transitions — navigation only.**
```js
// apps/ui/src/nav/transition.ts — the ONLY caller of startViewTransition in the repo
document.startViewTransition({ update, types: ['enter-studio'] })
```
- `view-transition-name: run-plate` on the source thumbnail and the target plate; `view-transition-class: variant-cell` on contact-sheet cells (each still needs a unique name).
- The default root crossfade **must** be explicitly killed:
  ```css
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
  ```
  Otherwise the whole document crossfades and the transition reads as a page reload, hiding the fact that one element moved.
- **Never** wrap a data mutation, a streaming update, or a run-progress tick in a view transition — the page is frozen during capture, so a 6-minute run's per-step updates produce a permanently janky shell.
- `navigateWithTransition()` short-circuits when the API is absent **or** when `matchMedia('(prefers-reduced-motion: reduce)').matches`.

**Reduced motion.** One global block, asserted present in the built CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```
Plus three behavioural changes that CSS cannot express: the step shuttle becomes a **static 50%-width bar** (not a frozen 24px sliver), the rail flash becomes a 1500ms static hold then an instant removal, and `startViewTransition` is skipped in JS.

**Enforcement.** Stylelint `declaration-property-value-allowed-list` restricts `transition-duration` and `animation-duration` to `var(--dur-1|2|3|4|--dur-shuttle)`; a CI grep bans `animate-*` Tailwind utilities outside `{StepRail,RowFlash,Button}.tsx`; a CI grep bans `startViewTransition` outside `apps/ui/src/nav/transition.ts`; Vitest asserts the reduced-motion block exists in `dist/assets/*.css` and that `navigateWithTransition()` returns without calling the API when the media query matches.
