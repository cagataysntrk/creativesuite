# Denetim

> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt
> `~/.claude/projects/.../subagents/workflows/` altında.

## Karar

NOT-READY. The architecture and the rule corpus are both strong, but the plan and the synthesised rulebook were never reconciled at the mechanical level, and the mismatches land precisely where an unattended loop cannot recover: the loop's own commit path is forbidden by a BLOCKING rule and a PreToolUse deny hook (`agents-propose-humans-apply` + gate 36); the `Refs:` trailer format the plan writes into every commit (`Refs: FAZ-0.1 · §3.1`) is rejected by the commit-msg regex the rulebook specifies; the loop writes a KARARLAR.md entry every turn into an append-only file with a hard 600-line ceiling; and the Stop hook demands a literal `pnpm verify` run that LOOP§ explicitly forbids per turn. Any one of these stops turn 1. Beyond that, the author has noticed and overruled exactly one conflict (D-37) while at least five more rulings from `conflictsResolved` are silently contradicted or silently inherited unresolved: pixel goldens, secrets via direnv, msw-vs-undici, PR-shaped gates that go vacuous on a trunk-only repo, and Ring-3 naming. Three findings are correctness-in-production rather than loop mechanics: the retrieval predicate cannot be written without reading `attributes`, the `R-nn` prefix is used for two different registries so a citation can resolve to the wrong target while the gate stays green, and the era stamp — declared "the most expensive mistake in the design" — has no rule and no manifest field. Fix the eight BLOCKERs and re-issue; the rest are mostly one-line corrections to FAZ-0 acceptance criteria.


### Bulgular (25)

#### [BLOCKER] §6.4 Tur anatomisi step 6 (KAYDET) + FAZ-0.A.1 vs rule `agents-propose-humans-apply` and gate 36 `apply-gate`

**Sorun:** The loop protocol says every turn ends '6. KAYDET Faz dosyasında tikle + tarih → DURUM.md güncelle → commit', and FAZ-0.A.1 begins with 'git init + main dalı ... ilk commit' on main. The rulebook's BLOCKING rule states: 'No agent may create a commit, merge, rebase, push or tag; agent work lands only as a branch that the human applies with scripts/apply.sh', enforced by 'PreToolUse hook .claude/hooks/block-main-write.sh matched on Bash denies any `git (commit|merge|push|rebase|tag)` when HEAD is main, returning permissionDecision: "deny"'. Gate 36 additionally rejects any commit on main lacking `Applied-By: <human>` or carrying `Proposed-By: agent`. Inviolable law 2 says the same thing: 'Agent önerir, sen uygularsın. Onay = git commit.' The plan never distinguishes the development-time loop agent from the runtime product agent.

**Ne zaman patlar:** Turn 1, step 6. The loop tries `git commit` on main, the PreToolUse hook denies it, the turn cannot tick the step, DURUM.md and the phase file diverge from the tree, and the next wakeup re-reads a phase file whose state is a lie.

**Düzeltme:** Add a decision (D-39) that scopes `agents-propose-humans-apply` to *runtime* agents only, and give the development loop its own path: it commits on `human/loop` (already allowed by the branch regex `^(main|human/[a-z0-9-]+|agent/...)$`), with trailers `Proposed-By: loop` and `Applied-By: loop@<host>`, and main advances only by `scripts/apply.sh` at a phase close. Rewrite law 2 as 'Runtime agent önerir; geliştirme döngüsü human/loop dalına commit eder; main'e yalnızca scripts/apply.sh yazar.' Update the block-main-write hook to allow the loop branch, and add the violation test to FAZ-0.C.

---

#### [BLOCKER] §6.4 rule 3 + §6.1 KARARLAR.md row vs FAZ-0.C.9 ceiling and rule `decisions-ledger-append-only`

**Sorun:** LOOP rule 3: 'Karar sorulmaz — en makul analizle karar verilir, KARARLAR.md'ye tarihli ve gerekçeli yazılır.' §6.1 gives KARARLAR.md the ceiling 'sınırsız (append-only)'. FAZ-0.C.9 gives the *same file* a hard cap: '`KARARLAR.md` 600'. The rulebook makes it append-only with immutable bodies: 'an accepted entry's body is never edited — only its status line and a `Superseded by D-nn` back-link', with the MADR content discipline (Bağlam / Seçenekler / Karar / Sonuçlar / Yeniden-değerlendirme-tetiği) — roughly 8–12 lines per entry. The plan is internally contradictory (sınırsız vs 600) and the gate is the side that runs.

**Ne zaman patlar:** Around turn 50–60 (D-38 alone already consumes ~40 lines of table). The `docs-size` gate runs at pre-commit, so from that turn on *every* commit is blocked, and the only legal remedies — trimming the file or editing entry bodies — are themselves forbidden by the append-only gate. The loop deadlocks with no human present.

**Düzeltme:** Delete the KARARLAR.md ceiling from FAZ-0.C.9 entirely (it is the one file that must be unbounded), and instead cap it structurally: `scripts/gates/doc-size.ts` asserts each individual D-nn entry ≤ 15 lines and that the file is append-only, with no total. Fix §6.1 and 0.C.9 to say the same thing. Add a rollover rule: when the file exceeds 1500 lines, entries older than the current era move to `docs/kararlar-arsiv/<era>.md` with the anchors preserved and a tombstone in anchors.json.

---

#### [BLOCKER] §7.0 + §7.1 commit template + FAZ-0.C.7 vs gate 35 check 2 (`Refs:` regex)

**Sorun:** The plan's commit template is '💾 **Commit:** `feat(kernel): <özet>` + `Refs: FAZ-N.x · §7.2`' and FAZ-0.C.7 accepts '`Refs: FAZ-N.x · §bölüm` zorunlu'. The gate the rulebook specifies is: `grep -qE '^Refs: (section-(1[0-9]|[1-9])(-[0-9]+)?|R-[0-9]{2}|D-[0-9]{2}|FAZ-[0-9](\.[0-9]+)?)(, (…))*$'`. Three incompatibilities: (a) separator is `, ` not ` · `; (b) the ANAYASA token is `section-7-2`, not `§7.2` — the `§` character is not in the regex at all; (c) `FAZ-[0-9](\.[0-9]+)?` cannot express the plan's own step ids `FAZ-0.C.7`, `FAZ-0.A.1b`, `FAZ-2.3b`, and `D-[0-9]{2}` cannot express `D-1`…`D-9`, which §7.2 writes as `D-1 repo + yerel merkez`.

**Ne zaman patlar:** The very first commit of FAZ-0.A.1. The commit-msg hook rejects it, the loop cannot record step 1, and D-34's own reference '(FAZ-0.C.7)' would be unciteable even after the format is fixed.

**Düzeltme:** Pick one surface syntax and write it into §7.0 as the single normative form. Recommended: keep `§7.2` in human prose (it is what the user reads) and make gate 12's extractor normalise `§N.M` → `section-N-M`; then rewrite the Refs regex as `^Refs: <tok>( · <tok>)*$` with `<tok> = §[0-9]{1,2}(\.[0-9]+)?|R-[0-9]{2}|D-[0-9]{1,2}|FAZ-[0-9]\.[A-Z0-9]+(\.[0-9]+[a-z]?)?`. Renumber §2 to zero-padded `D-01`…`D-38` in one pass so §2, §7.2 and 0.B.5 agree, and fix 0.B.5's 'D1–D32' (there are 38).

---

#### [BLOCKER] §10 (Açık kalemler, R-01…R-11) vs §7.0 (`R-nn` = KURALLAR.md kuralı) and gate 12 `citations`

**Sorun:** §7.0 defines exactly one meaning for the prefix: '`R-nn` | `KURALLAR.md` kuralı | `R-14`'. §10 then issues eleven open verification debts under the identical prefix: 'R-08 | Kuruluş tarihi çelişkisi (sicil 3 Tem 2025 · LinkedIn 2022 · site "2021'den beri")'. Meanwhile §7.1's step template shows '📖 **Oku:** §7.2, §11.2 · R-08, R-31 · D-22' where R-08 is a *rule*. Gate 12 resolves `R-nn` against 'KURALLAR.md id column' — so a phase step citing open item R-08 resolves silently to whatever rule happens to be numbered 08, and the citation gate stays green. §10 also says these items live in KARARLAR.md ('Her kalem `KARARLAR.md`'de 🔴 ile işaretli kalır'), i.e. in the D-nn file, under R-nn ids.

**Ne zaman patlar:** FAZ-2.9, which must close R-07 and R-08 (era vertical, founding date). A context-less turn reads '📖 Oku: … R-08' from a phase file, resolves it to a coding rule about Turkish casing, and closes the wrong debt — with a green citation gate as evidence. This is the exact silent-rot mode §7.0 exists to prevent.

**Düzeltme:** Renumber §10 to a fifth, distinct prefix — `V-01`…`V-11` (doğrulama borcu) — everywhere, including §7.2, §9 and the FAZ files, and add `V-nn` to §7.0's table with its target (`KARARLAR.md` 🔴 block). Add a gate-12 assertion that the four (now five) prefix namespaces are pairwise disjoint across all tracked markdown.

---

#### [BLOCKER] §6.4 'Turda yapılmaz' (⛔ Uzun/kapsamlı test turda YAPILMAZ) + FAZ-0.A.4 (`just check/verify`) vs rule `one-verify-command-with-pasted-output`

**Sorun:** The rulebook: 'There is exactly one verification command, `pnpm verify` … an agent may not use the words done, passing, green, works or fixed unless the same message contains the last 20 lines of a pnpm verify run from this session', enforced by a Stop hook that blocks the turn 'when the success vocabulary appears and no successful Bash call to the literal string `pnpm verify` occurred since the last user prompt'. The plan forbids exactly that per turn — '⛔ Uzun/kapsamlı test turda YAPILMAZ', '4. DOĞRULA Nokta atışı test' — and builds a *different* command surface: FAZ-0.A.4 'justfile: `check · verify · plan · reindex · doctor · fmt · test`'. `just verify` does not contain the literal string `pnpm verify`.

**Ne zaman patlar:** Every turn that ticks a ✅ box. Step 5 KABUL and the turn output format ('ne doğrulandı (somut kanıt)') inevitably use success vocabulary; the Stop hook returns `{"decision":"block"}`; the turn never reaches step 7 PLANLA, so ScheduleWakeup(70s) is never issued and the loop dies silently.

**Düzeltme:** Make the two agree in one direction. Either (a) drop `just` as the agent-facing surface and define `pnpm verify` as the only verification command with `just` recipes as thin human aliases — then relax LOOP's '⛔ uzun test' to '⛔ tests beyond `pnpm verify`', since the rulebook budgets verify at <3 min; or (b) rewrite the Stop hook to accept `just verify` and add a fast tier `just verify --step` whose output the hook also accepts. Record the choice as a D-nn and write the accepted literal into both docs/LOOP.md and the hook in the same FAZ-0 step.

---

#### [BLOCKER] FAZ-2.3b and rule `no-spend-or-publish-after-fresh-external-text`

**Sorun:** FAZ-2.3b: 'Taze dış metin içeren bir turda `channel.publish` ve hiçbir ücretli fiil **insan onayı olmadan** ateşlenemez.' The rulebook's enforcement is a session-scoped marker file: 'PostToolUse hook on `WebFetch|mcp__.*fetch.*` writes derived/.fresh-external-<session_id>; a PreToolUse hook on Bash denies any command matching `pnpm run (job|publish|render):` while that marker exists (deny beats ask and allow); **the UserPromptSubmit hook clears it**.' An unattended loop woken by ScheduleWakeup has no UserPromptSubmit and no human to give 'insan onayı'.

**Ne zaman patlar:** FAZ-0.D.3 ('Remotion Creators koltuk fiyatını tarayıcıdan doğrula') is the first WebFetch in the project. From that moment the marker exists and nothing clears it: FAZ-0.D.1/0.D.2 bake-offs, every `render:` in FAZ 3, and every publish in FAZ 7 are denied. The loop will read the deny as a broken environment and, with full autonomy ('Karar sorulmaz'), is most likely to 'fix' it by deleting the marker — destroying the control instead of honouring it.

**Düzeltme:** Replace the session-scoped marker with a turn-scoped one and give the loop a legal clearing ritual: the marker carries the fetch's step id and is cleared only by `scripts/gates/clear-external.sh`, which requires (1) the fetched text to have been written under `derived/ingest/<domain>/<date>/raw.md`, (2) a `Refs:` commit landing it, and (3) the *next* turn to start. Then the rule reads 'no spend in the same turn as a fetch' rather than 'no spend until a human types', which is what FAZ-2.3b actually intends. Record as D-nn and add the violation test to FAZ-0.C.

---

#### [BLOCKER] §4.2 (kayıt zarfı) + §4.5 (retrieval yüklemi) vs law 1 / rule `kernel-never-reads-attributes` and the contracts' `RecordEnvelopeBase`

**Sorun:** §4.5 fixes the retrieval predicate in code in exactly one place: 'WHERE (era_id = :current_era OR era_id = '*') AND status IN ('active','pinned') AND expired_at IS NULL AND (invalid_at IS NULL OR invalid_at > :as_of) AND (valid_at IS NULL OR valid_at <= :as_of)'. §4.2 lists ~22 envelope fields including era_id, valid_at/invalid_at/expired_at, zone, x_signature, confidence, context_weight. The synthesised contract freezes the envelope at eleven fields — 'The ~10 fixed system fields. This shape is frozen; growth happens in `attributes`' — with no era_id and no temporal fields, and the BLOCKING rule says the kernel may not 'read, destructure, alias or string-index record.attributes'. The retrieval predicate is itself a listed chokepoint owned by the kernel.

**Ne zaman patlar:** FAZ-1.2 (zarf + Zod şeması) and FAZ-2.2 (retrieval yüklemi). Either the loop puts era_id/valid_at into `attributes`, and then the retrieval predicate reads attributes and `gate:kernel-purity` (the Proxy tripwire) fails on every SELECT; or it silently widens the frozen envelope from 11 to 22 fields — quietly deleting the property that D-11/D-20 rest on, with no gate noticing because nothing asserts the envelope's field count.

**Düzeltme:** Explicitly enumerate the system envelope in §4.2 as the frozen contract (it is ~22 fields, not ~10 — the rulebook's number is wrong for this project) and add a gate that asserts `Object.keys(RecordEnvelopeBase)` deep-equals a committed `envelope.json`, so growth requires a D-nn. State in law 1 and in KURALLAR that the ban is on *user-defined* attributes only, and that era/temporal/lifecycle fields are system fields by definition because the retrieval predicate needs them. Without this, FAZ-1.2 cannot be executed from the written artefacts alone.

---

#### [BLOCKER] §5 repo tree (`runs/<ulid>/`) + §4.2 (`id`(ULID)) vs rule `deterministic-clock-rng-ids` and rule `commit-trailers-and-no-ai-attribution`

**Sorun:** §4.2 says ids are ULIDs and §5 lays out `runs/<ulid>/{manifest.json,…}`, `assets/<yyyy>/…`; the branch rule also encodes ULID: 'agent/<pipeline-slug>/<ulid>' with the hook regex `[0-9a-hjkmnp-tv-z]{26}`, and the commit-msg gate requires 'Commits touching `corpus/**` or an asset sidecar must additionally carry `Run-Id: <26-char Crockford base32 ULID>`'. But the BLOCKING id rule says 'ids only from kernel/src/ids.ts#newId(prefix) returning a **prefixed UUIDv7**', §5's own tree says `src/{ids,rng,paths}.ts # uuidv7 · seed'li rng`, and the contracts declare `export type RunId = Brand<string, "RunId">; // uuidv7, prefixed "run_"`. A `run_018f…` UUIDv7 is 36+ characters with hyphens and never matches the 26-char Crockford regex.

**Ne zaman patlar:** The first corpus commit produced by a run — FAZ-2.9's discovery run, or earlier if any FAZ-1 fixture lands in corpus/. The commit-msg hook rejects `Run-Id: run_018f2c…`, and the branch-name hook rejects the run's own branch. Both are hard stops with no in-loop remedy.

**Düzeltme:** Choose ULID (it sorts, it is 26 chars, it is what §4.2/§5/the hooks already assume) and correct the id rule, the contracts comment and `kernel/src/ids.ts` to mint Crockford-base32 ULIDs with a type prefix carried outside the id (`run_` as a separate field, not a string prefix), so the 26-char regex holds. Record as a D-nn and make FAZ-1.7/1.8 depend on it.

---

#### [MAJOR] §4.3 + FAZ-3.2 + §9 (FAZ 3 doğrulama) vs rule `golden-policy-metrics-first-never-auto-updated` and gate 27

**Sorun:** The plan states twice that pixels gate the build: §4.3 '**Golden-file testi:** `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` her şablon boyutunda render edilir, **piksel farkında build düşer**' and FAZ-3.2 repeats it verbatim. The ruling in `conflictsResolved` went the other way — 'the committed golden is always JSON metrics or geometry; pixel references live in the content-addressed object store' — and gate 27 is explicit: 'Compares a JSON metrics snapshot … **not pixels**. Ruling: PNG pixel goldens would violate the no-binaries-in-git rule and break on every Chromium bump, so pixel diffing lives only in the nightly container lane … and **never blocks a commit**.' The plan's FAZ-3 acceptance test 'fontu kasten boz → kırmızıya döndüğünü gör' is satisfiable by the metrics golden (resolved family changes), so the contradiction will not surface as a test failure — only as an argument at implementation time.

**Ne zaman patlar:** FAZ-3.2. The loop must either commit PNG baselines (blocked by gate 24 `blob-size` and gate 28's binary-path check — a hard stop) or silently drop the pixel guarantee the plan promised, and then §4.3's stated rationale ('konteyner içinde sessiz glyph fallback, bu sistemin bozuk varlık üretmesinin en muhtemel yolu') is no longer covered at push time.

**Düzeltme:** Rewrite §4.3 and FAZ-3.2 to: 'Golden = JSON metrik anlık görüntüsü (çözümlenen aile, computed size/line-height, satır kutusu geometrisi, glyph sayısı, taşma bayrağı, güvenli alan kesişimi); piksel referansı CAS'ta sha256 ile, yalnızca gecelik konteyner turunda diff'lenir.' Add the one case metrics cannot catch — a colour-profile regression that moves no geometry — as an explicit accepted risk in KARARLAR.md, since the rulebook's own openQuestions already flags it.

---

#### [MAJOR] §4.1 (`derived/…`) vs §5 repo tree (`.suite/`, `runs/`, `ledger/`, `assets/<yyyy>/`) vs gates 25/32/39

**Sorun:** Ring 3 has three incompatible names in one document. §4.1: 'Ring 3 DERIVED derived/index … derived/runs … derived/blobs'. §5's tree: top-level `runs/<ulid>/{manifest.json,…}`, `ledger/published.jsonl`, `assets/<yyyy>/<mm>/<ab>/<sha256>.<ext>`, and separately '`.suite/` # RING 3 — gitignore'; FAZ-1.6 then says '`.suite/index.db`'. The gates all target `derived/`: gate 25 `no-tracked-derived` is `test -z "$(git ls-files derived/ assets/objects/)"`, gate 39 is `rm -rf derived node_modules`, the ingest boundary writes `derived/ingest/<domain>/`, the fresh-external marker is `derived/.fresh-external-<id>`, and the rulebook's asset path is `assets/objects/sha256/<xx>/<hash><ext>` — not `assets/<yyyy>/<mm>/<ab>/`. Worse, FAZ-0.A.1's .gitignore ignores `assets/**/*.{png,jpg,mp4,wav}`, so gate 32 `manifests` ('walks every committed file under assets/ and fails on a missing or hash-mismatched sidecar') iterates an empty set and passes vacuously forever.

**Ne zaman patlar:** Immediately and permanently: gates 25/39 protect a directory that never exists (green, meaningless), the rebuild drill deletes nothing, and the manifest gate — the only mechanism that guarantees every artifact has provenance — is vacuous from FAZ-0 through FAZ-9. The failure is invisible because everything is green.

**Düzeltme:** Do one naming pass over §4.1, §5 and every FAZ step: Ring 3 = `derived/{index,runs,blobs,ingest}` (delete `.suite/` entirely), assets = `assets/objects/sha256/<xx>/<hash><ext>` (bytes, gitignored) + `assets/sidecars/<hash>.meta.json` (committed JSON, never ignored), `ledger/published.jsonl` → `derived/runs/published.ndjson`. Then add a meta-gate to FAZ-0.C: every gate script must assert its target path set is non-empty, so a gate can never pass by looking at nothing.

---

#### [MAJOR] UI rule `status-glyph-color-text` vs D-37 / FAZ-0.C.5 (`docs-language` kapısı) and rule `structured-logs-with-correlation`

**Sorun:** The UI rule: 'RUN states are exactly the seven kernel states (`kuyrukta`, `planlanıyor`, `onay bekliyor`, `çalışıyor`, `başarılı`, `hata`, `iptal`)', enforced by 'The status union is a TypeScript literal type mirroring `packages/kernel/src/state/run.ts`; a Vitest asserts … that the two unions are structurally [identical]'. That test can only pass if the kernel's run-state enum values are Turkish strings. D-37 says the opposite in the sharpest possible terms: 'Gerçek hata Türkçe'nin *enum değerine* sızmasıdır', FAZ-0.C.5 gates exactly that, and the log rule says 'Turkish may appear only in a message payload, never as a key or enum value'. Separately, the seven UI states omit `qa-passed` and `approved`, which the architecture rule's human-only edges require ('qa-passed→approved', 'awaiting-approval→executing') — so the two unions cannot be structurally identical anyway.

**Ne zaman patlar:** FAZ-4.2/4.6, when the UI status component is built against the FAZ-1.8 state machine. Either the structural-equality test fails (and gets weakened — which `no-weakened-tests` does not cover, since it only inspects `tests/**` diffs) or Turkish is written into the kernel enum and gate 0.C.5 goes red on the kernel.

**Düzeltme:** Rewrite the UI rule for §12.6: the kernel state union is English (`queued`,`planning`,`awaiting_approval`,`executing`,`succeeded`,`failed`,`cancelled`,`qa_passed`,`approved`); the UI holds a total `Record<RunState,{glyph,label}>` whose label is Turkish and lives in `apps/ui/src/i18n/tr.ts`; the test asserts the map is *total over* the kernel union (compile-time exhaustiveness), not equal to it. Also reconcile the state count — seven vs nine — before FAZ-1.8 writes the transition table.

---

#### [MAJOR] §4.4 (QuickJS maliyet formülü) and FAZ-3.5 vs rule `registry-is-data-and-bad-files-quarantine`, rule `estimate-pure-actual-recorded-fx-pinned` and D-35's own rationale

**Sorun:** §4.4: 'fiyatla (QuickJS'te maliyet formülü, 10ms deadline, USD→TRY günlük TCMB kuru)', and D-32 says providers are 'YAML tanımlayıcı + maliyet formülü'. This puts executable JavaScript inside registry YAML, in the pricing path. The BLOCKING rule says 'Nothing under registry/ may be executable (YAML only, safe schema, custom tags disabled)' with gate 10 `find registry -type f ! -name '*.yaml' … && exit 1` — which a formula-as-string defeats without tripping. And D-35 removed `script.run` for precisely this reason: '`script.run` tamamen kaldırıldı: keyfi kod çalıştırma, kapatılamayan bir güvenlik deliğiydi.' The cost rule also requires 'estimation and actualisation share one formula function' with `estimate()` synchronous and pure, tested by stubbing fetch/Date.now/fs to throw — a QuickJS host with a 10ms deadline needs a clock.

**Ne zaman patlar:** FAZ-3.5. The loop implements a JS interpreter over user-editable YAML, and the security posture the plan bought by deleting `script.run` is handed back through the registry — while gate 10 stays green because the file is still `.yaml`.

**Düzeltme:** Replace the QuickJS formula with a closed, declarative pricing grammar in YAML: `{unit: image|second|input_token|output_token, perUnitMicros: bigint, minimumMicros?, tiers?: [{upTo, perUnitMicros}]}`, parsed by one pure TS evaluator shared by `estimate()` and `actual()`. A new pricing shape then requires a kernel change plus a D-nn — which is correct, because pricing shapes change roughly yearly. Record the QuickJS rejection in §11 (Reddedilenler) with D-35's own reasoning.

---

#### [MAJOR] §4.4 ('≤4.00 TL', 'USD→TRY günlük TCMB kuru') and FAZ-3.5/§9 ('TL aralığı basıyor') vs D-36 and rule `estimate-pure-actual-recorded-fx-pinned` / rule `plan-frozen-hashed-and-capability-resolved`

**Sorun:** The router's worked example expresses a hard constraint in lira — 'video.text2video · aspect 9:16 · ≤6sn · **≤4.00 TL** · prefer: cost' — and prices with the 'USD→TRY **günlük** TCMB kuru'. D-36 says 'TRY yalnızca raporda, sabitlenmiş TCMB anlık görüntüsüyle', and the cost rule says 'TRY reporting uses an immutable dated TCMB FX snapshot that never re-prices historical rows' with `estimate()` pure (no clock, no fetch). If a filter threshold is denominated in TRY at today's rate, provider selection becomes a function of the day's FX, while `planHash = sha256(canonicalJson(plan …))` and the replay/rerun distinction (FAZ-4.15) assume selection is reproducible from the frozen plan.

**Ne zaman patlar:** FAZ-3.5 and again at FAZ-4.15, when 'rerun (donmuş plan)' and 'replay (bugünün tanımı)' are supposed to differ only in definition, not in exchange rate. A run replayed after a 10% lira move picks a different provider with an identical planHash input set — provenance silently lies.

**Düzeltme:** State in §4.4 and D-36 that every constraint, cap and ledger value is USD micro-units; TRY exists only in the display layer and in reports, always via the FX snapshot id recorded in the run manifest. Change the example constraint to '≤ 120_000 micros (~4 TL @ fx-2026-08-14)'. Add the fx snapshot id to the frozen-plan field list so a replay can reprice deterministically.

---

#### [MAJOR] FAZ-0.C.5 (`docs-language` kapısı, ters çevrilmiş) and D-37 vs gate 17 as specified

**Sorun:** D-37 is right in intent but the inherited gate command is a character-class grep: gate 17 is `rg -n --pcre2 '[ğşıçöüĞŞİÇÖÜ]' -g 'docs/**/*.md' -g 'CLAUDE.md' -g '.claude/**/*.md' … && exit 1`. D-37 mandates the exact opposite for those files: 'ANAYASA · KURALLAR · KARARLAR · DURUM · FAZ dosyaları · CLAUDE.md **Türkçe**'. FAZ-0.C.5 describes the inversion in prose — 'Türkçe'nin *tanımlayıcı, şema anahtarı, log olay adı, enum değeri, dosya adı, hata `code`* alanlarına sızmasını yakalar' — but gives an acceptance test that only exercises the easy half ('`code: "SAĞLAYICI_HATASI"` yaz → kırmızı; ANAYASA'daki Türkçe paragraf → yeşil'). No grep can distinguish 'Turkish in an enum value' from 'Turkish in prose' in a file that legitimately contains both.

**Ne zaman patlar:** FAZ-0.C.5 itself — the first gate step whose acceptance criterion cannot be met by the tool the plan implies. The likely outcome is a grep restricted to `.ts` string literals, which misses Turkish in YAML keys under `registry/`, in JSON Schema `enum` arrays, in `log-events.ts` and in generated SQLite column names — all named in the rule.

**Düzeltme:** Specify the gate as three position-scoped scanners, not a grep: (1) a TS AST pass flagging non-ASCII in identifiers, object keys, `as const` array members and template-literal type members across `packages/**` and `apps/**` except `apps/ui/src/i18n/**`; (2) a YAML/JSON key-path pass over `registry/**`, `schemas/**`, `brand/**` flagging non-ASCII in any key or `enum` value; (3) a filename pass. Drop the doc-prose scan entirely. Write the three commands into FAZ-0.C.5 with one deliberate violation each.

---

#### [MAJOR] §5 (`docs/00-ANAYASA.md`, `docs/01-YOL-HARITASI.md`) vs §6.2 (`docs/ANAYASA.md`) and rule `four-root-docs-fixed-tree`

**Sorun:** §5's tree lists 'docs/00-ANAYASA.md # § numaralı ana referans' and 'docs/01-YOL-HARITASI.md # § referanslı faz haritası'; §6.2's table lists 'docs/ANAYASA.md' and has no roadmap file at all (its job is done by `docs/fazlar/`). D-15 repeats the numbered names. The rule's gate is `find docs -name '*.md' | grep -vE '^docs/(ANAYASA|LOOP)\.md$|^docs/(fazlar|research|reference)/'` must be empty — which rejects both numbered filenames and rejects `01-YOL-HARITASI.md` outright. §5 also omits `docs/LOOP.md`, `docs/referans/` (generated, required by gate 15 `docs-drift`) and `docs/runbook/` (referenced by the secret-leak rule as `docs/how-to/key-leak.md`).

**Ne zaman patlar:** FAZ-0.B.2/0.B.7/0.B.8 — the loop creates files from §5's tree, then gate `docs-check` rejects them, and the phase cannot close. Later, gate 15 runs `git diff --exit-code -- docs/referans/` against a directory the plan never created, so it passes vacuously and the generated provider/pipeline catalogue never exists.

**Düzeltme:** Make §5's tree authoritative and correct in one edit: `docs/{ANAYASA.md, LOOP.md, fazlar/FAZ-0..9.md, referans/ (üretilmiş, commit'li), runbook/{sizinti,yeniden-kur,donus}.md, research/}`. Delete `01-YOL-HARITASI.md` and update D-15. Add `docs/referans/` generation as an explicit FAZ-1 step, since gate 15 blocks pre-push from the moment it is wired.

---

#### [MAJOR] FAZ-0.B.2 acceptance vs rule `citation-notation-and-stable-anchors` and §6.3

**Sorun:** The acceptance criterion is '`grep -c "^## §" docs/ANAYASA.md` = 19 · TBD taraması temiz'. §6.3 then defines ~90 *subsections* (§3.1–§3.8, §5.1–§5.6, §8.1–§8.7, §12.1–§12.9 …) and every FAZ step cites them (FAZ-1.1 → §3.1, FAZ-3.7 → §7.3). The rule requires 'always as a markdown link to an explicit custom anchor (`## 4.3 Provider descriptors {#s-4-3}`)' and 'a committed anchor id may never be changed or deleted', checked against `docs/reference/anchors.json`. Counting 19 `##` headings proves nothing about the ~90 anchors the phase files depend on. Additionally, 0.C.9 caps ANAYASA at 1200 lines while the rulebook caps it at 600 — and §6.3 asks that file to hold the full provider catalogue (§8.7), the 9-pipeline catalogue (§10), the 11-screen design system (§12) and ~60 rejected tools (§17), all with 'hiçbir bölüm boş veya "TBD" değil'.

**Ne zaman patlar:** FAZ-0.B.2 is a single loop turn with a hard ceiling and an anti-stub requirement that cannot both be met — roughly 12 lines per subsection for content like a full provider catalogue. The loop will either stub (violating the TBD check by writing prose that says nothing) or blow the ceiling and block its own commit.

**Düzeltme:** Change 0.B.2's evidence to: every `##`/`###` heading carries `{#section-N-M}`, `docs/referans/anchors.json` is generated and committed, and `node scripts/gates/citations.ts` resolves 100% of `§` tokens found in `docs/fazlar/`. Split the ANAYASA: keep the invariants and reasoning in `docs/ANAYASA.md` under the 600-line ceiling, and move §8.7 (provider catalogue), §10 (pipeline catalogue) and §12.9 (screens) into generated `docs/referans/` files, which the rule already exempts from ceilings. Split FAZ-0.B.2 into one turn per §-block.

---

#### [MAJOR] FAZ-0.C.8 (`chokepoints.json` — 'Dosya lint'i üretir') vs rule `chokepoint-registry` enforcement

**Sorun:** The acceptance test is 'Listeye satır ekle → zorlaması kendiliğinden gelsin · ikinci bir `chromium.launch()` yaz → kırmızı', and the rule generates the enforcement as dependency-cruiser config: 'chokepoints.json maps each entry to `{allowedFile, forbiddenTargets[]}`; scripts/check-chokepoints.ts generates .dependency-cruiser.generated.cjs at build time'. Dependency-cruiser can only forbid *module edges*. At least six of the ~23 listed chokepoints are not module edges: clock (`Date` is a global), RNG (`Math.random`), id factory, outbound HTTP (`fetch` is a global), config resolver and cost estimator (same-package function calls). Those need ESLint `no-restricted-globals`/`no-restricted-properties`, which the generator does not emit. The acceptance test is satisfied by a generator that emits a rule matching nothing.

**Ne zaman patlar:** Whenever a later phase adds a chokepoint row expecting protection — e.g. 'maliyet defteri' in FAZ-3.13 or 'corpus yazıcı' in FAZ-2.4. The row exists, the doc says it is enforced, the generated config contains an unreachable rule, and a second cost-ledger writer or a second `Date.now()` lands unnoticed.

**Düzeltme:** Give chokepoints.json two enforcement kinds — `kind: "module"` (→ depcruise) and `kind: "global"` (→ generated ESLint `no-restricted-globals`/`no-restricted-properties`/`no-restricted-syntax` block with file-scoped overrides) — and make the generator fail on a row whose kind it cannot emit. Change 0.C.8's evidence to: 'add a `global` row for `Date`, write `new Date()` in a second file → lint red' plus 'assert every row in chokepoints.json produced at least one emitted rule'.

---

#### [MAJOR] rule `five-hermetic-test-lanes-no-egress` vs gate 31 `offline` (contradiction inherited unresolved; plan silent)

**Sorun:** The conflict ruling says: 'RULED for msw as the single interceptor (two dispatchers fight and produce passes-alone/fails-in-suite flakes)', and the rule enforces it with '`no-restricted-imports` for nock, @pollyjs/*, fetch-mock and **undici MockAgent** plus `pnpm why nock` failing to resolve'. Gate 31, in the same rulebook, mandates the banned tool: '`offline` | `pnpm exec vitest run --project agentic tests/agentic/offline` with **undici `MockAgent().disableNetConnect()`**'. The plan inherits both and mentions neither; FAZ-1.10 only says 'sağlayıcı cassette katmanı'.

**Ne zaman patlar:** FAZ-1.10, when the test harness is built. The loop implements gate 31 as written, the lint rule rejects the import, and the loop's most likely 'fix' — an eslint-disable — is itself a gate failure in the kernel-purity rule's spirit. Alternatively it implements msw and leaves gate 31 permanently missing, which the FAZ-1 exit criterion ('ağ kablosunu çek → yine çalışıyor') will not catch.

**Düzeltme:** Resolve in FAZ-1.10 and record as D-nn: msw is the only interceptor; the offline lane is expressed as msw `server.listen({ onUnhandledRequest: 'error' })` plus an `CS_ALLOW_NETWORK=0` guard that monkey-patches `fetch`/`undici` to throw at setup, and the assertion becomes 'zero msw handlers were called'. Rewrite gate 31's command accordingly and delete the MockAgent reference.

---

#### [MAJOR] FAZ-0.A.6 (SOPS + age + **direnv**; '`direnv allow` sonrası anahtar isimleri env'de') vs the secrets ruling and rule `secrets-in-sops-age-referenced-by-env-name`

**Sorun:** The ruling was explicit: 'repo-git said OS keyring, integration said SOPS+age and **explicitly banned keyrings/1Password/direnv**. RULED for SOPS+age with env-name indirection and `sops exec-env`, because it is the only option that works offline and unattended … `.env.local` remains only for local non-secret overrides.' The rule adds 'injected via `sops exec-env … -- pnpm start` so plaintext never touches disk'. FAZ-0.A.6 reinstates the banned mechanism and makes it the acceptance criterion: 'SOPS + age + **direnv**; `secrets.enc.yaml` iskeleti; `.envrc`' / '`direnv allow` sonrası anahtar isimleri env'de'. direnv exports decrypted values into the ambient environment of every process started in that directory — including the loop's own shell, every subagent, every `npx` — which is exactly the exposure `sops exec-env` avoids, and it makes the `process.env`-only-in-`packages/config/src/env.ts` rule meaningless.

**Ne zaman patlar:** FAZ-0.A.6, and then permanently: from that point every command the unattended loop runs — including third-party `npx hyperframes doctor` and any postinstall script the `allowBuilds` allowlist admits — inherits live provider keys.

**Düzeltme:** Rewrite FAZ-0.A.6: SOPS + age only; `.envrc` (if kept) exports only `SOPS_AGE_KEY_FILE` and non-secret paths; every entrypoint runs under `sops exec-env secrets/providers.enc.yaml -- <cmd>`, wired as a `just` recipe. Acceptance: '`env | grep -c <PROVIDER>_KEY` → 0 in a plain shell; the same variable is present only inside `just run`; `secrets/*.enc.yaml` carries `sops.mac`.' Record the direnv rejection in §11.

---

#### [MAJOR] Law 7 (§8) + §4.6 ('Varlıklar üretim anında damgalanır … Sonradan retrofit imkânsız') vs rule `manifest-and-ledger-are-durable` and gate 32 `manifests`

**Sorun:** The plan calls the era stamp the most expensive possible omission — 'Sonradan retrofit imkânsız — bu, tasarımdaki en pahalı hata ve ilk gün önlemesi bedava' — and law 7 elevates it to an inviolable. But no rule among the 70 mentions era_id, kit_version, definition_digest, context_manifest or source_run_id, and the manifest rule enumerates its required fields without any of them: 'runId, planHash, corpusCommit, registryCommit, inputs with content hashes, per-step provider/model/cost/timings and outputs with sha256'. Gate 32 only checks 'a committed file under assets/ with no sidecar whose sha256 matches it; a sidecar with no run_id'. FAZ-3.13 says the manifest writer includes 'era damgası', but nothing gates it.

**Ne zaman patlar:** The first FAZ-3 asset. If the stamp is forgotten or dropped in a refactor, every asset produced until someone notices is unattributable to an era — and by the plan's own words the loss is irreversible. The gate that exists will be green throughout.

**Düzeltme:** Add the five stamp fields to the manifest/sidecar Zod schema as required (non-optional, so `tsc` catches omission), extend gate 32 to assert every sidecar carries `era_id`, `kit_version`, `definition_digest`, `context_manifest_hash`, `source_run_id`, and add a FAZ-0.C step that writes the sidecar schema before FAZ 3 can produce anything. Add the deliberate-violation test: strip era_id from a sidecar → gate red.

---

#### [MAJOR] §6.4 ('⛔ Kuralı KURALLAR.md'de değiştirmeden koda farklı yazmak') + rule `instruction-files-budgeted-and-path-scoped` + rule `no-weakened-tests-no-invented-keys`

**Sorun:** The loop has 'Tam yetki' and its only stated constraint on rule changes is that code and KURALLAR.md must agree — which explicitly licenses changing the rule instead of the code. The mechanical guards do not close this. `instruction-files` enforces '`git diff --numstat` added-minus-deleted on CLAUDE.md ≤10' — a net *addition* cap; a diff that deletes 60 lines scores −60 and passes. `no-weakened-tests` inspects only `git diff main -- 'tests/**' '**/*.test.ts'`. Nothing at all protects `KURALLAR.md`, `docs/ANAYASA.md`, `scripts/gates/**`, `lefthook.yml`, `chokepoints.json` or `.claude/settings.json` from being edited by the same agent they constrain — and §6.1 assigns those files to 'İnsan' as a convention, not a gate.

**Ne zaman patlar:** Any turn where a gate blocks progress and the loop, under 'Karar sorulmaz — en makul analizle karar verilir', concludes the gate is wrong. It rewrites the gate script, writes a justifying D-nn, commits, and every subsequent turn is green. This is the failure mode with no natural detection, because the audit trail is written by the same actor.

**Düzeltme:** Add a BLOCKING rule and a FAZ-0.C step: `scripts/gates/self-modification.sh` fails any applied diff touching `KURALLAR.md`, `scripts/gates/**`, `lefthook.yml`, `chokepoints.json`, `.claude/settings.json` or `.claude/hooks/**` unless the commit message carries `RULE-CHANGE: <D-nn>` **and** the same diff adds that D-nn with an explicit `Gerekçe` and `Geri alma maliyeti`; and additionally require a `git notes` countersignature by the human before such a commit can be applied to main. Change the `instruction-files` check from net lines to `abs(added)+abs(deleted) ≤ 10`. Add 'kuralı zayıflatmak' to LOOP's '⛔ Turda yapılmaz' list.

---

#### [MAJOR] FAZ-6.5 (araştırma şelalesi) + D-33 vs rule `untrusted-ingest-boundary`

**Sorun:** The rule's boundary is narrow: 'Every byte fetched from a prospect site, competitor page or any non-Upcytech source lands under `derived/ingest/<domain>/<iso-date>/raw.md` … and **fetching happens only through the WebFetch domain allowlist or the non-agentic `pnpm ingest` script**', with `wrapUntrusted` as the only reader. FAZ-6.5 sources data through four other channels — 'Bright Data SERP (5k bedava/ay) → Tavily (1k bedava/ay) → **ihale-mcp** … → **borsa-mcp/pykap**' — none of which is WebFetch or `pnpm ingest`. MCP tool results return straight into the model's context, bypassing `derived/ingest/` and therefore bypassing both the `<untrusted-data>` wrapper and `scripts/ci/scan-corpus-injection.sh`. Rule `permissions-and-hooks` also denies `mcp__*` by default with a server-anchored allowlist, and no plan step adds these servers.

**Ne zaman patlar:** FAZ-6.5/6.9, on the first real prospect deck. A tender listing or a competitor page containing instruction-shaped text enters the model's context as an ordinary tool result, and the pipeline that runs next is `prospect-deck` — the artefact that goes to a named third party. This is the plan's highest-consequence injection surface and it is outside its own boundary.

**Düzeltme:** Extend the untrusted-ingest rule to 'any tool result originating outside upcytech-controlled hosts, including MCP servers': the adapter for each research source must write to `derived/ingest/<source>/<date>/raw.md` and return only a handle; `wrapUntrusted` stays the only reader. Add a FAZ-6.5 sub-step that registers each MCP server in the `mcp__*` allowlist with a D-nn, and a deliberate-violation test (a fixture page containing 'ignore previous instructions' must appear inside `<untrusted-data>` in the composed prompt, asserted in the prompt snapshot).

---

#### [MAJOR] §12 ('Sert kural') vs FAZ-2.6 / FAZ-2.8 / §4.6 and FAZ-3.14

**Sorun:** §12 states two hard sequencing rules: 'Sert kural: 10 gerçek varlık yayınlanana kadar 7 strateji varlık tipinin ötesine geçilmez. `SignedSource`, 3-yollu merge, **probe bake-off ve karar defteri ilk yeniden üretim gerçekten acıtana kadar eklenmez**' and 'Faz 2'nin sonunda elinde gerçek bir carousel olmalı. Olmuyorsa sıralama yanlış.' The phase map contradicts both: FAZ-2.6 builds the era model and asset stamping, FAZ-2.8 builds 'Sticky karar defteri + `x_signature` + idempotent atlama', §4.6 builds `brand/probes/` bake-offs — all before any asset is published (FAZ 7) — and the first carousel is FAZ-3.14, i.e. the end of phase *3*, with FAZ 3's own exit line saying so.

**Ne zaman patlar:** FAZ-2.8. The loop reads a phase file whose step is explicitly forbidden by §12's 'sert kural' and has no human to arbitrate. Under 'Karar sorulmaz' it will pick one and write a D-nn — a coin flip on the plan's single most important sequencing judgement.

**Düzeltme:** Resolve it in the document, not at runtime. Either move FAZ-2.8 (sticky ledger, x_signature, probes) into a new FAZ-2.5-deferred block explicitly gated on 'ilk mirror regenerasyonu tamamlandı', or delete the §12 sentence and accept the up-front cost with a written reason. Then fix '§12: Faz 2'nin sonunda … carousel' to 'Faz 3'ün sonunda', matching FAZ-3.14 and FAZ 3's own exit criterion.

---

#### [MINOR] FAZ-1 çıkış (§9) 'Bir işi yarıda kes (SIGKILL) → yeniden başlatınca kaldığı yerden devam ediyor, çift ücret yok' vs FAZ-3.6 and rule `derived-idempotency-key-written-before-network`

**Sorun:** The FAZ-1 acceptance criterion tests resume-without-double-charge, which the rulebook implements as 'an intent ledger record carrying it must be fsync'd before the first byte leaves the process, start() consults the ledger first and resumes or short-circuits on a hit' — plus the poller's resume sweep in `absolute-deadline-polling-and-resume-sweep`. Neither is a FAZ-1 step: FAZ-1.8 is the SQLite queue and four state machines; idempotency lands in FAZ-3.6 ('Yeniden deneme / idempotency / rate limit disiplini') and polling in FAZ-3.4/3.6.

**Ne zaman patlar:** The FAZ-1 closing turn. 'Bağımsız doğrulama agent'ı temiz demeden faz kapanmaz' — the verifier correctly reports the criterion unmet, the loop cannot close FAZ 1, and the most likely resolution is that it builds FAZ-3.6 machinery out of order inside a phase that has no acceptance criteria for it.

**Düzeltme:** Split the criterion: FAZ-1 asserts only 'SIGKILL → restart resumes the job from the persisted handle with no duplicate *local* work (fixture provider, zero cost)'; move the 'çift ücret yok' half to FAZ-3's verification list, next to the idempotency step that implements it. Alternatively move the intent-ledger write into FAZ-1.9 (run manifest) and cite it from FAZ-3.6.

---

#### [MINOR] FAZ 0 çıkış kriteri ('Her BLOCKING kural kasten ihlal edilerek test edilmiş — **en az sekiz** ihlal testi') and FAZ-0.C (11 gates) vs the 42-gate table and ~88 BLOCKING rules

**Sorun:** The rulebook contains 70 master rules (≈60 BLOCKING) plus 41 UI rules (33 BLOCKING) and a 42-row gate table. FAZ-0.C schedules eleven gates. Never scheduled anywhere: `audit` (the only detector of `--no-verify`), `pii`/KVKK, `licenses`, `no-egress`, `blob-size`, `no-tracked-derived`, `paths`, `linear-history`, `apply-gate`, `pricing-immutable`, `manifests`, `no-snapshot-update`, `docs-drift`, `links`, `deps`. The exit bar 'en az sekiz ihlal testi' reads, to a context-less turn, as 'eight is enough'.

**Ne zaman patlar:** FAZ-0's closing turn passes with eight violation tests, and the unscheduled gates arrive too late to matter: `audit` must exist from commit 1 or the `audit/last-verified` tag has nothing to replay from; `blob-size`/`no-tracked-derived` must exist before the first render in FAZ-3.1 or a 4 MB PNG is already in history; `licenses` must exist before FAZ-1's dependency wave.

**Düzeltme:** Replace the count with coverage: 'KURALLAR.md'deki her BLOCKING kuralın karşısında bir `🧪 İhlal testi` adımı ve bir `scripts/gates/` betiği var — `node scripts/gates/rule-coverage.ts` her R-nn için bir gate ve bir ihlal testi bulamazsa kırmızı.' Add the fifteen missing gates to FAZ-0.C in dependency order, with `audit`, `paths`, `blob-size`, `no-tracked-derived` and `licenses` before FAZ-0.A.2 (the first dependency install).

---



### İyi olanlar

- The eight-verbs / one-effect-class-per-verb design (§4.1b, D-35) is the single best decision in the document, and the stated reason — 'RENDER sessizce bir LLM çağırabilseydi, çalıştırma öncesi gösterdiğimiz maliyet tahmini yalan olurdu' — is exactly the right justification. Deleting `script.run` and demoting `human.approve` to a state transition are both correct. Do not soften this.
- The verification philosophy in §9 — 'her kapı kasten ihlal edilerek test edilir. Yeşil bir test, gerçekten koruduğunu kanıtlamaz; kırmızıya döndüğünü görmek kanıtlar' — plus FAZ-9.2 re-running the violation tests forever, is stronger than what almost any team does. Keep it verbatim; only the count ('en az sekiz') is wrong.
- D-38 / §4.1 splitting Ring 3 into a rebuildable index and a non-derivable append-only run ledger. The reasoning ('bir çalıştırmanın maliyeti ve hangi sağlayıcıya ne gönderildiği başka yerde yazmıyor') resolves the researchers' conflict correctly and is the difference between a recoverable and an unrecoverable system.
- The instrument-panel design direction in §4b — brand-neutral shell, tolerance readings instead of badges, ΔE against a limit, cost as a capability chart, cancel always live, stale content never dimmed — is coherent, technically motivated (ISO 3664, alarm management) and matches the customer's own domain. The 41 UI rules back nearly all of it with real enforcement.
- D-37: catching that the synthesised 'docs in English' rule was wrong for a Turkish-reading solo maintainer, and inverting the gate to police enum values rather than prose, is precisely the kind of override this plan needed more of. The instinct is right — it just needs to be applied to four or five more inherited rulings.
- The idempotent-skip requirement in §4.6 ('Bu olmadan 900 opsiyonluk incelenemez bir plan çıkar, sen hepsini kabul edersin, yönetişim tiyatroya döner') and the FAZ-2 acceptance test 'ikinci kez çalıştırıldığında 0 op üretiyor' — a governance mechanism with a falsifiable test attached.
