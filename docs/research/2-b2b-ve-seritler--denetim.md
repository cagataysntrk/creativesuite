# Denetim

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Karar

The decisive call: you own the renderer; the lanes buy only better words and better pictures. Free and premium output must be byte-identical in typography, layout, brand tokens and safe zones. If a premium asset looks like it came from a different company, the dual-lane model has failed. That single rule kills most of the tool list — no Gamma, no Canva, no Presenton, no hosted deck or video product ever touches a prospect-facing artifact.

Three renderers, forever. Satori+resvg+sharp for static (~30ms, no browser). Playwright `page.pdf()` for documents and decks (real Chromium = correct Turkish shaping; print-to-PDF flattens layers, which LinkedIn requires). Remotion for all motion — free at ≤3 employees, one React component library serving Reels, LinkedIn video, demo and explainer. Nothing else renders anything.

Your machine changes two answers. An RTX 3050 6GB laptop cannot host Qwen-Image/FLUX at usable speed, so the "free" image lane is not local — it is Together FLUX.1-schnell at $0.0027/image. And because confidential pipelines must hard-block free-tier APIs (Google states free-tier content trains their models), **prospect decks have no free lane on this hardware**. Say that in the UI rather than pretending otherwise. Your 20 cores and 38GB do make whisper.cpp, Remotion and Chatterbox (500M, MIT, Turkish) genuinely free.

Two non-negotiable Turkish gates. Never let an image model draw Turkish text — Ideogram admits accented Latin "may not render at all" and Google publishes no language list; generate text-free imagery and composite real type from a latin-ext font. And run ceaksan/turkish-diacritics as a hard gate, because prompt instructions to preserve ç ğ ı ö ş ü provably decay past ~1,500 words.

The Turkish edge nobody uses: ihale-mcp. A company that just published or won a tender has budget, published scope and a deadline. Free, legal, MIT — better than any US firmographic trigger.

Infrastructure you will not run: no Langfuse, no Trigger.dev, no LiteLLM, no DVC, no CRM. A `runs/<date>/<id>/manifest.json` carrying the knowledge-tree commit SHA, lane, models, seeds, estimated-vs-actual cost and every human decision is a better ledger, and it still works after you ignore it for a month.

Match the akis-meclisi stack (Vite+React+Tailwind+Radix+Zod+Vitest). Do not introduce Next.js to maintain two conventions alone.


### Açık sorular

- CONFIDENTIALITY POLICY — the single question that defines the dual-lane model. Are you willing to send named-prospect content to Anthropic/Google PAID tiers (which contractually do not train on it), or must confidential work stay strictly local? Your hardware makes this decisive: an RTX 3050 6GB laptop cannot run a Turkish-competent local model, so 'local-only for confidential' means prospect decks have no viable lane at all. I have assumed paid-tier-is-acceptable, free-tier-is-banned. If that is wrong, the prospect-deck pipeline needs a fundamentally different design (a rented GPU, or manual copywriting).
- EMPLOYEE COUNT, today and over the next 12 months. Remotion is free for individuals and companies of up to 3 EMPLOYEES — the threshold is headcount, not revenue. A fourth hire triggers $100/mo minimum on the render-based Automators tier with no grace period, by which time your entire motion layer is Remotion-shaped. This must be recorded as a machine-readable fact in the repo and re-checked at every hire.
- DO YOU INTEND TO SELL THE CREATIVE SUITE ITSELF, or software built with it, to clients? This changes three licence positions at once: Remotion explicitly prohibits selling a derivative of Remotion; ComfyUI (GPL-3.0) and ffmpeg (GPL if built with x264/x265) must stay strictly out-of-process; and Satori/axe-core MPL-2.0 file-level copyleft starts to matter if you ever patch them. Right now I have assumed internal use only.
- WILL YOU RECORD YOUR OWN TURKISH VOICE? For bespoke B2B software at your price point, a 60-second human face-to-camera in native Turkish will likely outperform any AI avatar, and cloning YOUR OWN voice is the only cloning that is unambiguously safe under Art. 27/12. If yes, the entire premium TTS lane becomes optional and you save both money and legal surface. If no, budget one paid Turkish test render on each of ElevenLabs, HeyGen and Tavus BEFORE committing — none of them enumerates Turkish despite broad language claims, and a mispronounced company name is worse than sending nothing.
- MONTHLY VOLUME PER FORMAT. How many Instagram posts, carousels, Reels, LinkedIn posts, documents, prospect decks, demo videos and ad sets per month? Every free tier here is monthly and non-rolling (Tavily 1,000, Firecrawl 1,000, Bright Data 5,000, Exa $10, Tavus 25 min). Below roughly 60 dossiers/month the free research lane genuinely holds; above it, the premium lane stops being optional. I cannot size the estimator's quota logic without your real numbers.
- WHICH PRODUCT IS BEING SOLD, and does it have a demoable UI today? akis-meclisi is in your working directories — is that the product, a client project, or something else? The demo-video pipeline is worthless without a real, stable UI to drive with Playwright, and the prospect-deck's product-screenshot slides depend on the same thing.
- DOES A BRAND SYSTEM ALREADY EXIST? I found zero brand fonts installed on this machine. Do you have a licensed typeface with full latin-ext coverage (dotless ı, dotted İ, ğ, ş — many display fonts ship İ but not ı and fail silently in Turkish), a defined palette, and a logo in vector? If not, that is a Phase-0 design project, not a code project, and everything downstream waits on it.
- BUDGET CEILINGS. What is your acceptable monthly ceiling in TRY, and your per-run cap in USD? The estimator needs a real number to disable the Run button against, and the TRY/USD exposure question is real — I have recommended pay-as-you-go vendors with no subscription floor (HeyGen wallet, Bright Data PAYG, Recraft units) precisely so a slow month costs nothing, but you should confirm that matches how you want to hold the risk.
- PROSPECT SECTOR FOCUS. Do you sell into sectors touched by public procurement (which makes ihale-mcp your best signal), BIST-listed companies (KAP via pykap gives audited financials to quote), or regulated industries (mevzuat-mcp lets you build the 'here is the regulation forcing you to act' slide, which is usually the best slide in the deck)? The research waterfall's ordering should be tuned to whichever applies.
- TURKISH ACCOUNTANT AND LAWYER ACCESS. Three things need professional answers I cannot give: the KVKK aydınlatma and açık rıza texts (must be separate documents per decision 2026/347, and LLM-generated templates are explicitly penalised); Turkish withholding tax on payments to non-resident online advertising providers plus reverse-charge KDV on imported digital services; and whether Upcytech crosses the VERBİS registration thresholds. The cost estimator should not quote TRY figures until the tax treatment is confirmed.
- APPROVAL LATENCY AND MOBILE ACCESS. Do you want to approve from your phone? The command center is designed local-only, which is the right security posture for a repo containing prospect data — but if you want mobile approval, that is a tunnel, an auth layer and a threat model, and it should be decided now rather than retrofitted.
- DOES THIS REPO NEED TO SHARE CONVENTIONS WITH akis-main? I have recommended matching its stack (Vite, React, Tailwind, Radix, Zod, Vitest) rather than introducing Next.js. Confirm that akis-meclisi's conventions are ones you actually like and intend to keep, rather than ones you inherited and want to move away from — if the latter, creativesuite is the better place to establish the new house style.


### Fazlama

- PHASE 0 — FOUNDATION (Week 1, no generation at all). `git init` (this directory is not yet a repo). Install the missing prerequisites: `apt install ffmpeg xvfb` (both absent) and license + install a latin-ext brand font (zero brand fonts detected — this is a hard blocker for every static pipeline). Scaffold pnpm workspace matching the akis-meclisi stack. Write packages/schema (Zod) and emit schemas/*.schema.json. Write packages/tr-text with the ESLint rule banning bare .toUpperCase(). Wire ceaksan/turkish-diacritics as a hook. Write packages/specs/placements.ts seeded with the verified 2026 numbers plus sourceUrl and verifiedAt. Set up SOPS + age + direnv. Build packages/cost with pricing.snapshot.json and a CLI that prints a CostEstimate. IN PARALLEL, because these are calendar time you cannot compress: apply for a Google Ads Basic developer token (~5 business days) and begin deliberately warming the Meta Marketing API toward Full Access with cheap reads (500 successful calls over 15 days, <15% error rate). DELIVERABLE: `pnpm validate` green and an estimator that prints an honest cost range. Nothing renders yet — resist the urge.
- PHASE 1 — STATIC IMAGE LANE, END TO END (Weeks 2–3). Brand tokens → token compiler → Satori/resvg/sharp compositor with 4 layouts. Ship instagram-post and instagram-carousel on BOTH lanes. Build the free QA gate (culori ΔE2000, node-vibrant, transformers.js CLIP, LAION aesthetic MLP, Tesseract word-boxes). Build the asset CAS + R2 sync (~60 lines of TS) and the run-manifest writer. Build the Approval Queue v1 and the Run Launcher with the cost drawer. DELIVERABLE: a real Instagram carousel, generated by the system, approved through the queue, published by hand. This proves the entire thesis — one renderer, two lanes, identical typography — on the cheapest possible asset.
- PHASE 2 — DOCUMENTS AND THE MONEY PIPELINE (Weeks 4–5). Expand to 12–16 layouts and add the ECharts SSR and D2 diagram slots. Ship linkedin-post and linkedin-document (Playwright page.pdf, flattened, ≤10 pages, ≤5MB image ladder). Then the highest-revenue-leverage build: prospect-deck. Prospect directories with provenance sidecars, the research waterfall with the LinkedIn lint ban, ihale-mcp + borsa-mcp + pykap wired as MCP servers with zero glue code, the 14-day freshness gate, the 5-field personalization cap, and the deck IR with its closed layout enum. DELIVERABLE: one tailored deck delivered to a real prospect before a real meeting. Everything after this phase is amplification.
- PHASE 3 — MOTION (Weeks 6–7). Xvfb + headed Chromium + ffmpeg x11grab at 1080p60, with the Playwright script emitting timeline.json. Then the Remotion component set (<ZoomToTarget>, <SyntheticCursor>, <ClickRipple>, <BrowserChrome>, <GradientStage>). Add TTS (Gemini free / ElevenLabs premium / your own voice) and captions (Groq whisper-large-v3) with the mandatory human transcript-diff gate. Ship demo-video, then derive reels deterministically from its chapter marks. Deliberately build raw-capture-plus-good-narration FIRST and the Remotion effects second — raw footage with a good story converts better than beautiful footage with no story, and you will be tempted to invert this.
- PHASE 4 — ADS AND COMPLIANCE (Weeks 8–9). Ship ad-creative-set with the H/C/V orthogonal variant matrix, the naming convention, the ad-copy linter (Meta personal-attributes rule is the top silent B2B rejection), and the multi-placement render from one composition. Build the Compliance Panel: Turkish Reklam Yönetmeliği flags, EU AI Act Art. 50 disclosure for EU audiences, C2PA Content Credentials via c2patool, and the spec-drift watcher. Ship explainer-video, reusing the Phase-3 motion library entirely. Also this phase: get the KVKK aydınlatma and açık rıza texts drafted by a Turkish lawyer — do NOT generate them, since KVKK decision 2026/347 explicitly penalises recycled templates.
- PHASE 5 — API PUBLISHING, ONLY IF THE QUEUE IS THE BOTTLENECK (Month 3+). Meta first, because you warmed it in Phase 0 and your own ad account needs only standard ads_management with no full App Review. Build the token-bucket rate limiter BEFORE the uploader (read = 1 point, write = 3, max score 9000 on Full tier, decay 300s) and compare returned creative IDs against your local ledger, since Meta returns the EXISTING id for duplicate submissions and will make you believe you created 20 creatives when you created 3. Everything is created in DRAFT state and still requires a human activation click. LinkedIn third and expect friction (3-legged OAuth only, 5-account cap, quarterly version sunsets). TikTok and X: never.
- PHASE 6 — OPPORTUNISTIC, NOT SCHEDULED. A GitHub search for 'company research' + 'pitch deck' + agent returns ZERO repositories and every named AI-sales-deck repo has 0 stars. The wheel you are building does not exist. If the suite is working after three months of real use, the prospect-deck pipeline is plausibly a second Upcytech product — but only decide that after it has earned you deals, and note that productising it changes your Remotion licence position and forces ComfyUI/ffmpeg to stay strictly out-of-process.


### Reddedilenler

- ANY LinkedIn data by ANY route — Proxycurl is dead, and §8.2(4) makes broker-sourced LinkedIn data a breach for YOU as the consumer. That covers Bright Data LinkedIn datasets and Apify LinkedIn actors. hiQ won on CFAA and still LOST on breach of contract, then shut down. Encode this as a lint rule over provider configs, not a note in a README.
- A CRM (Twenty, EspoCRM, HubSpot, Attio). When the only consumer is an agent, a database is a liability and a filesystem is an asset. Prospects are git directories. Twenty additionally carries AGPLv3 plus '@license Enterprise' file markers — real legal complexity for a company that sells software. Add Attio's free tier only when a second human needs pipeline visibility.
- DVC. Content-addressed assets + R2 via ~60 lines of TypeScript you already run beats adding a Python toolchain to a Node repo. A python dependency rots faster than code you maintain, and 'still works after a month of neglect' is an explicit requirement.
- Git LFS for generated assets. 10 GiB free, metered on storage AND every byte downloaded, objects effectively unprunable — applied to a pipeline whose defining characteristic is generating far more rejected variants than accepted ones.
- Langfuse, MLflow and Weights & Biases. Self-hosting Langfuse means Postgres + ClickHouse: exactly the infrastructure that rots when ignored. The run manifest in git is greppable, diffable, server-free, and doubles as the cost audit trail your dual-lane model requires.
- Trigger.dev, Inngest and Temporal. Local Remotion and ffmpeg renders are child processes, not distributed workflows. Hosted async video jobs need one persisted operation.json plus a `pnpm jobs:poll` command — about 80 lines. Temporal's $100/mo entry price alone exceeds your likely monthly inference spend.
- Self-hosted LiteLLM Proxy (until Phase 4 at the earliest). Its value is a hard local budget cap across many keys and users. You are one person with a pre-flight estimator and provider-side budgets; that is two of the three layers already.
- OpenMeter and anything requiring Kafka. It solves billing YOUR customers by usage, not tracking your own spend.
- The 16-layout dual renderer (React AND PptxGenJS for every layout). The honest cost is 2–4 hours per layout written twice, and they WILL drift. PDF is canonical; a deliberately plainer 4-layout PptxGenJS export ships only when a prospect explicitly asks. Let the layout catalog reach 40 and you abandon the pptx lane within a quarter anyway.
- Presenton, Gamma, Presentations.ai, SlideSpeak and every AI deck product as a DELIVERY tool. Prospects in 2026 recognise Gamma and Canva output on sight, and a deck that visibly came from a consumer AI tool actively undermines a pitch that Upcytech builds bespoke software. Owning the renderer IS the differentiator; a second deck engine is duplicated brand surface for a solo maintainer.
- Canva Connect API. Autofill requires Canva Enterprise membership — economically absurd for a solo operator, and any architecture assuming it is dead on arrival.
- PandaDoc (Enterprise-gated API, sandbox expires with the trial), Sendspark ($99/mo just to reach the API for a capability you are building), Potion ($99/mo priced for SDRs blasting 750 videos when you send ~10), Bonjoro's $399/mo API tier.
- Arcade, Storylane, Navattic and Supademo APIs. Every vendor in the interactive-demo category gates its API behind Enterprise pricing, so 'automated per-prospect interactive demos' is simply not purchasable at solo-operator prices. Use Supademo's free tier (5 demos + 50 4K recordings, the most generous in the category) for evergreen demos on the website. Building an rrweb-based replayer is a genuinely good v2 idea and a terrible v1 one.
- Auto-clippers (OpusClip, Klap, Vizard, Submagic's Magic Clips). They find highlights by speech energy and face tracking; a silent screen-capture product demo gives them nothing. You already know exactly when each feature is shown — cut deterministically from your own chapter marks. Free, exact, reproducible, better.
- MediaPipe AutoFlip (support ended 1 March 2023). Copy the algorithm — shot boundaries, then stationary-vs-tracking camera per shot — never the code.
- IP-Adapter and ControlNet as v1 needs. IP-Adapter's last release was Jan 2024 with no FLUX support and is fully superseded by native multi-reference conditioning. ControlNet is a good layout-locking idea for v2, not a week-one build.
- Semantic caching (GPTCache, RedisVL) for creative steps. Serving a near-match LinkedIn post is a quality defect, not a saving. Content-hash caching of generated MEDIA is the correct cache; near-match matching belongs only on deterministic steps like classification and grammar QA.
- TikTok and X entirely. TikTok's specs could not be verified from any primary source (fully JS-rendered docs), X's spec pages return HTTP 402 Payment Required, and neither fits Turkish B2B SaaS. Do not ship hardcoded specs for either.
- Midjourney. No official public API; every third-party 'Midjourney API' automates a Discord account in breach of both Midjourney's and Discord's terms. Approximate the look with a Recraft style_id or a $2 fal style LoRA on your own approved outputs.
- Self-hosted FLUX.1 [dev] and FLUX.1 Kontext [dev] (non-commercial licence — the highest-probability licence mistake in this entire domain, because every tutorial treats them as the default), Bria RMBG-2.0 (CC BY-NC, and it ships bundled inside MIT-licensed rembg where it is easy to select by accident), XTTS-v2 (Coqui Public Model License, and the CPML page 404s with the licensor defunct — restrictive terms you cannot even read), F5-TTS pretrained weights (CC BY-NC), Kokoro-82M (no Turkish at all, despite being the most-recommended free TTS in general guides).
- ElevenLabs' free tier as a lane. It carries NO commercial licence and every Upcytech asset is commercial use. Starter at $6/mo is the real floor. Your estimator must never offer 'ElevenLabs free'.
- Screen Studio, Cap, Beam, OpenScreenStudio and the whole OSS screen-recorder fork war as dependencies. All GUI-only, most macOS/Windows-only, none automatable, several under 12 stars. Read Beam's MIT source to learn how auto-zoom is implemented, then port the maths into Remotion — where you have click INTENT they must infer, which makes your output better, not just cheaper.
- Playwright's built-in recordVideo as final output. It silently defaults to viewport-scaled-to-800×800 WebM at undocumented variable frame rate, and only writes after context.close() so a crashed run yields nothing.
- ffmpeg zoompan for the auto-zoom. It rounds internal calculations to integers, producing visible stepping on slow zooms — precisely the effect that separates a premium demo from an amateur one. Do the zoom in Remotion where you have float precision.
- MDX anywhere in knowledge/, and Contentlayer (unmaintained for lack of funding). Plain Markdown + YAML frontmatter, validated by Zod.
- Turborepo and Nx on day one. Four packages and one app do not need a task graph. Turborepo is 20 lines and incrementally adoptable the day `pnpm -r build` annoys you, which is exactly why deferring it costs nothing.
- Next.js for the command center. The akis-meclisi stack you already maintain is Vite + React + Tailwind + Radix + Zod + Vitest. A local-only tool needs no SSR, and maintaining two frontend conventions alone is a tax with no return.
- Letting any image model render Turkish text. Ideogram's own docs admit accented Latin 'may have some difficulty being rendered correctly, if at all', and Google publishes no language list whatsoever for Nano Banana Pro's in-image text.
- Any AI-generated human implying endorsement — synthetic customers, cloned customer voices, avatar testimonials. Turkish Reklam Yönetmeliği Art. 27/12 has banned this outright since 1 August 2026, with fines cited up to 8,635,800 TL for internet violations, and a prospect-specific deck containing an AI-rendered 'customer' is the exact prohibited pattern.
- Per-slide deep personalization in prospect decks. Decks stuffed with scraped facts trigger suspicion rather than flattery, especially in Turkish B2B where a machine-assembled dossier feels invasive. Five high-signal fields, everything else stable brand content.
- Generating your own KVKK aydınlatma and açık rıza texts with an LLM. KVKK decision 2026/347 explicitly penalises recycled templates — LLM-generated privacy text is exactly the artefact the Kurul is now targeting. Pay a Turkish lawyer once.


### Ekranlar

- RUN LAUNCHER — pick a pipeline, fill its typed inputs (product, prospect, campaign), choose a lane. Shows the CostEstimate as a RANGE per step with a confidence dot (green = exact per-unit media price, amber = ranged token estimate, red = per-second GPU / unquotable), plus wall-clock estimate — on a 6GB laptop GPU, TIME is a cost your money model must surface. A master FREE/PREMIUM toggle sets all steps with per-step overrides persisting, so the common case is one click and 'premium copy + free images' stays possible. The Run button is DISABLED with a Turkish explanation when the max estimate exceeds the pipeline's budget cap. For confidential:true pipelines the free toggles are visibly disabled with a reason shown, never silently absent.
- APPROVAL QUEUE — the heart of the system and the only real quality gate on Turkish content. Cards grouped by state (needs_copy_review, needs_visual_review, needs_compliance_signoff, ready_to_publish, published, rejected). Each card shows the artifact, its QA scorecard, its lane, its actual cost, and Approve / Reject-with-reason / Regenerate. Rejection reasons are PERSISTED and injected as explicit negative constraints on the next run, plus the last 5–10 ACCEPTED assets are passed as reference images — this is in-context preference learning that compounds immediately, with no LoRA and no retraining cycle.
- TURKISH COPY REVIEW — side-by-side lane A/B where relevant, with the ceaksan/turkish-diacritics validator results inline (word, suggested correction, confidence), live per-placement character counters that go red at the cap, the ad-copy linter's personal-attributes and unsubstantiated-claim flags, and a proper-noun casing check on prospect legal names. Nothing reaches the visual gate until this is green.
- PLACEMENT PREVIEW & SAFE-ZONE INSPECTOR — every generated asset rendered inside a simulation of the real platform chrome: Stories/Reels with the 14% top / 35% bottom / 6% sides overlay, Instagram feed at 4:5, LinkedIn document at mobile viewport width. Per-placement pass/fail from the spec validator (aspect within ±1%/±3%/±5%, byte cap, codec, duration). This is where you catch the single most common creative failure — a headline sitting under the caption chrome.
- PROSPECT WORKSPACE — one screen per knowledge/prospects/<slug>/. The dossier with EVERY fact showing its source URL and fetched_at, colour-coded by staleness (red past 14 days, because quoting a departed executive to a prospect's face is unrecoverable). The 3 candidate angles. Generated artifacts with their run manifests. KVKK fields (per-purpose legal basis, retention date, consent withdrawal) with a single Delete Prospect action that is genuinely `rm -rf` — which makes a subject-access or deletion request trivial to honour, a real advantage over any CRM.
- ASSET LIBRARY — hybrid keyword (SQLite FTS5) + semantic (sqlite-vec) search over asset sidecars: prompt, caption, tags, product, prospect, campaign, lane, cost, publishedTo. Filters for 'premium-lane assets never published' (kill that spend) and 'approved but unused'. Crucially, REUSE is a first-class action alongside Free and Premium in the Run Launcher — the cheapest generation is the one you don't run.
- COST & BUDGET — estimate vs actual side by side on the same rows for every completed run (this is what makes the NEXT estimate trustworthy), per-provider free-quota meters reading LIVE remaining quota rather than the monthly headline (Tavily 1,000, Firecrawl 1,000, Bright Data 5,000, Exa $10, Tavus 25 min — none roll over, and a burst in week one silently pushes week four onto paid rails), monthly spend in USD with an indicative TRY conversion clearly labelled as indicative, and the pricing-snapshot version with a staleness warning above 60 days.
- COMPLIANCE PANEL — per-asset aiGenerated / containsSyntheticPerson / disclosureRequired / human_reviewed flags with a hard block on approving any asset containing a synthetic person who is not you (Turkish Reklam Yönetmeliği Art. 27/12, in force since 1 Aug 2026). Also surfaces: placement specs whose verifiedAt has drifted past a quarter, any provider config that would touch a LinkedIn-derived source (lint violation), and any model in model-policy.json whose licence forbids the requested use.
- KNOWLEDGE HEALTH — validation status of every file under knowledge/ (Zod pass/fail with the exact path and error), staleness of prospect research, orphaned products, and AGENTS.md line count against the 200-line CI ceiling. Later, Keystatic in local mode mounted at a route gives structured forms over the same files for the handful of fields you edit weekly — but Obsidian pointed at knowledge/ and VS Code with the committed yaml.schemas map cover 90% of editing for zero build effort.
- PUBLISH QUEUE & CHANNEL STATUS — what is scheduled, what shipped, and the operational state of each channel: Meta API tier (Limited vs Full) with progress toward the 500-successful-calls / <15%-error-rate upgrade and the live rate-limit budget (Limited tier allows roughly 20 writes per 5-minute window and will choke a 20-variant push), Google Ads developer token status, and the pinned LinkedIn-Version constant (202607) with a quarterly re-check reminder, since LinkedIn sunsets versions on a schedule and 202507 is already dead.
- RUN HISTORY / PROVENANCE BROWSER — every runs/<date>/<runId>/manifest.json rendered as a timeline: inputs, knowledge-tree commit SHA, per-step lane and model, seeds, estimated vs actual, human decisions. One-click Replay reconstructs the exact context from that commit SHA — without it, a 'replay' silently uses a different brand voice.


### Repo ağacı

```
creativesuite/                          # git init this FIRST — it is not a repo yet
├─ AGENTS.md                            # canonical agent entrypoint. ~150 lines MAX (CI fails above 200).
│                                       #   Repo map + invariants + POINTERS. Never brand copy, never product specs.
├─ CLAUDE.md                            # literally `@AGENTS.md` + 5 Claude-only lines.
│                                       #   Claude Code does NOT read AGENTS.md. @-imports cost full tokens at launch —
│                                       #   splitting a fat file into imports saves nothing.
├─ .claude/
│  ├─ settings.local.json               # already exists here
│  ├─ rules/                            # path-scoped: load ONLY when a matching file is touched. The cheapest context win.
│  │  ├─ knowledge-editing.md           #   paths: ["knowledge/**"]
│  │  ├─ turkish-copy.md                #   paths: ["knowledge/brand/**","content/**"] — orthography, banned calques, siz register
│  │  ├─ pipelines.md                   #   paths: ["packages/pipelines/**"] — dual-lane contract, cost estimation rules
│  │  └─ compliance.md                  #   paths: ["packages/specs/**","packages/compliance/**"]
│  └─ skills/                           # ONE skill per output type. Keep each SKILL.md UNDER ~5,000 tokens:
│     │                                 #   after compaction Claude Code re-attaches skills into a 25,000-token pool,
│     │                                 #   first 5,000 tokens each, most-recent-first. Fat skills get silently DROPPED.
│     ├─ instagram-post/SKILL.md
│     ├─ instagram-carousel/{SKILL.md,references/}
│     ├─ reels/SKILL.md
│     ├─ linkedin-post/SKILL.md
│     ├─ linkedin-document/SKILL.md
│     ├─ prospect-deck/{SKILL.md,references/}   # highest-value skill; references anthropics/skills pptx
│     ├─ demo-video/SKILL.md
│     ├─ explainer-video/SKILL.md
│     └─ ad-creative-set/{SKILL.md,references/}
│
├─ knowledge/                           # THE REPO OF TRUTH. Human handbook AND machine KB — same files, no duplication.
│  ├─ brand/
│  │  ├─ constitution.md                # borrowed from github/spec-kit: inviolable rules. Always loaded. Short.
│  │  ├─ brand.yaml                     # $schema modeline → schemas/brand.schema.json
│  │  ├─ voice.tr.md                    # tone axes, do/don't, real Turkish examples (NOT translated English)
│  │  ├─ tokens/*.tokens.json           # DTCG-SHAPED but validated by YOUR Zod schema.
│  │  │                                 #   The DTCG spec is a preview draft that says "do not implement this version".
│  │  │                                 #   Adopt the stable $value/$type/alias shape only.
│  │  └─ assets/
│  │     ├─ logo/                       # small, permanent, PLAIN GIT (not LFS, not R2)
│  │     └─ fonts/                      # MUST carry latin-ext. Proof string: "İstanbul'da yazılım çözümleri: ığüşöç ĞÜŞÖÇ"
│  │                                    #   NOTE: zero brand fonts detected on this machine — this is a Phase-0 blocker.
│  ├─ products/<slug>/
│  │  ├─ product.yaml                   # pricing, ICP, features, differentiators
│  │  ├─ positioning.md
│  │  ├─ objections.md                  # objection → response pairs, Turkish
│  │  └─ proof/                         # case studies + metrics + testimonials, each with source + date
│  ├─ company/
│  │  ├─ company.yaml                   # legal entity, mersis_no, vergi_no, handles, KVKK statements
│  │  ├─ offers.yaml                    # service lines + rate cards (TRY)
│  │  └─ strategy/{2026-h2.md,icp.yaml}
│  ├─ prospects/<slug>/                 # THIS IS YOUR CRM. Not Twenty, not EspoCRM, not HubSpot.
│  │  ├─ prospect.yaml                  #   mersis_no, vergi_no, stakeholders, stage,
│  │  │                                 #   PER-PURPOSE legal basis + marketingConsentWithdrawnAt (KVKK 2026/347:
│  │  │                                 #   aydınlatma and açık rıza must be SEPARATE, and withdrawal must actually
│  │  │                                 #   gate execution, not merely be offered in text)
│  │  ├─ research/YYYY-MM-DD-*.md       #   + sibling *.meta.json: url, fetched_at, source_tool, cost_usd, licence note
│  │  ├─ angles.md
│  │  └─ generated/                     #   symlinks/hashes into assets/ — never duplicate bytes
│  ├─ channels/{instagram,linkedin,ads}.yaml
│  └─ templates/                        # Turkish copy skeletons + deck layout specs
│
├─ packages/                            # pnpm workspace. NO Turborepo, NO Nx until `pnpm -r build` actually hurts.
│  ├─ schema/                           # Zod 4 = SINGLE SOURCE OF TRUTH
│  │  ├─ src/{brand,product,company,prospect,channel,asset,deck-ir,run,cost}.ts
│  │  └─ src/emit.ts                    # z.toJSONSchema({io:'input'}) → ../../schemas/*.schema.json
│  ├─ knowledge/                        # loader: read → gray-matter → Zod.parse → typed accessors
│  │  └─ src/context.ts                 # THE context assembler: selectSlice(task) → token-budgeted prefix
│  ├─ tr-text/                          # BAN the raw primitives. upper()=toLocaleUpperCase('tr'), lower(), slug(),
│  │                                    #   foldForSearch(), softHyphenate() — Chromium has NO Turkish hyphenation
│  │                                    #   dictionary (Firefox/Safari only), so inject U+00AD server-side.
│  │                                    #   ESLint rule bans bare .toUpperCase() anywhere Turkish flows.
│  ├─ specs/placements.ts               # platform spec table AS CODE. Every row: sourceUrl + verifiedAt.
│  │                                    #   Quarterly agent job re-fetches and diffs. Specs drift silently.
│  ├─ render-static/                    # Satori + resvg + sharp. One JSX template per LayoutEnum member.
│  ├─ render-doc/                       # React → Playwright page.pdf(). Pin the Chromium version.
│  ├─ render-motion/                    # Remotion component library: <ZoomToTarget> <SyntheticCursor>
│  │                                    #   <ClickRipple> <BrowserChrome> <GradientStage> + brand intro/outro.
│  │                                    #   Keep compositions THIN and data-driven so a port to Revideo (MIT)
│  │                                    #   is a swap, not a rewrite, if you ever hire a 4th person.
│  ├─ providers/                        # thin swappable adapters. Vendor mortality in this category is extreme
│  │                                    #   (Proxycurl dead, Crunchbase Basic gone, Google CSE sunsetting, Clearbit absorbed).
│  │                                    #   NEVER let a provider response schema leak into a template.
│  │  └─ src/{text,image,video,tts,stt,search,crawl}.ts   # interface: estimate() pure+network-free, start() with
│  │                                    #   idempotencyKey, status(), cancel(), actualCost() returning null not throwing
│  ├─ cost/                             # estimator: gpt-tokenizer + pricing.snapshot.json → CostEstimate
│  │                                    #   {minUsd,maxUsd,lines[{unit,quantity,unitPrice,confidence}],snapshotVersion}
│  │                                    #   ALWAYS a range for text, exact for per-unit media. Turkish tokens run
│  │                                    #   ~30–40% above English — calibrate on your own briefs, don't assume.
│  ├─ qa/                               # culori ΔE2000 + node-vibrant + transformers.js CLIP + LAION aesthetic MLP
│  │                                    #   + Tesseract word-boxes + turkish-diacritics gate + ffprobe validators
│  ├─ compliance/                       # TR Reklam Yönetmeliği (Art 18/8, 27/12), KVKK, EU AI Act Art 50,
│  │                                    #   Meta ad-copy linter, licence policy (model-policy.json)
│  ├─ pipelines/                        # one module per job. Every step: {free, premium, estimate()}
│  └─ ui/                               # shared React components (copy components.json from akis-meclisi)
│
├─ apps/command-center/                 # Vite + React + Tailwind + Radix/shadcn + Hono API on Node 20.
│                                       #   MATCH the akis-meclisi stack you already maintain. Do NOT introduce
│                                       #   Next.js and run two conventions alone. Local-only; no SSR needed.
│                                       #   better-sqlite3 for the derived index. NO Prisma, NO Supabase here —
│                                       #   git files are the truth, SQLite is a rebuildable cache.
│
├─ demos/<product>/                     # a demo is a VERSIONED ARTIFACT, not a video file
│  ├─ demo-script.ts                    #   the Playwright flow
│  ├─ timeline.json                     #   click targets, timestamps, zoom keyframes, chapter marks
│  └─ narration.tr.json                 #   Turkish VO per chapter. Edit text → re-render. Never re-record.
│
├─ content/                             # generated copy awaiting or past approval
│  ├─ calendar.yaml
│  └─ <yyyy-mm>/<slug>/{caption.tr.md,copy.qa.json}
│
├─ schemas/*.schema.json                # GENERATED + COMMITTED. Powers editor autocomplete AND CI.
├─ pricing/pricing.snapshot.json        # COMMITTED per-provider prices with verifiedAt per entry.
│                                       #   UI shows a warning badge above 60 days old, or your
│                                       #   "cost before the run" promise quietly becomes fiction.
│
├─ assets/                              # content-addressed. The hash IS the name — never rename.
│  └─ <yyyy>/<mm>/<ab>/<sha256>.<ext>   #   Re-rendering identical output costs zero extra storage.
│     └─ <sha256>.meta.json             #   prompt, model, modelVersion, lane, seed, params, costUsd, runId,
│                                       #   sourceAssets[], approvals[], aiGenerated, containsSyntheticPerson,
│                                       #   usageRights, publishedTo[]. Sidecars stay in git (tiny, greppable).
│                                       #   BYTES go to Cloudflare R2 via ~60 lines of TS. No DVC, no Git LFS.
│
├─ runs/<yyyy-mm-dd>/<runId>/           # THIS IS YOUR OBSERVABILITY. Not Langfuse, not MLflow.
│  ├─ manifest.json                     #   knowledgeCommitSha (the field that makes replay REAL — your prompts
│  │                                    #   are assembled from files that change weekly), lane per step,
│  │                                    #   model IDs, seeds, params, estimated vs actual cost, every human decision
│  ├─ steps/NN-<step>.json              #   raw request/response envelopes
│  └─ outputs.json                      #   asset hashes produced
│
├─ .index/                              # GITIGNORED, rebuildable: SQLite FTS5 + sqlite-vec over sidecar text.
│                                       #   sqlite-vec is pre-v1 — a breaking change must cost a rebuild, not data.
├─ secrets/secrets.enc.yaml             # SOPS + age. SAFE TO COMMIT (values encrypted, keys plaintext → real diffs).
├─ .envrc                               # direnv: sops -d → export ~20 keys. Nothing plaintext ever hits disk.
├─ .vscode/settings.json                # yaml.schemas glob→schema map = autocomplete with zero per-file boilerplate
├─ pnpm-workspace.yaml
└─ (turbo.json)                         # ABSENT. Add the day `pnpm -r build` annoys you — it takes 20 lines.
```
