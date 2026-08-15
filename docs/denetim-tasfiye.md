# Denetim tasfiyesi

> Üç düşman denetçinin **75 bulgusunun** tamamı. Sessizce düşen bulgu yok (FAZ-0.B.10).
> Karar sütunu: `uygulandı` · `reddedildi (D-nn)` · `ertelendi (V-nn)` · `faz adımı`

Kaynak: `docs/research/6-denetim--*` · 26 BLOCKER · 42 MAJOR · 7 MINOR

| # | Şiddet | Nerede | Sorun | Karar |
|---|---|---|---|---|
| 1 | B | §4.1b (satır 184) — kernel saflık kapısı | "CI'da `grep -rn \"attributes\\.[a-z]\" kernel/src --include=*.ts` (**render hariç**) — herhangi bir eşleşme b | uygulandı — plana işlendi |
| 2 | B | §4.2 kayıt zarfı + §4.5 retrieval yüklemi (satır 189-196,  | §4.2 declares a 20+ field envelope (`era_id`, `status`, `zone`, `kind`, `valid_at`/`invalid_at`/`expired_at`,  | uygulandı — plana işlendi |
| 3 | B | D-9 (satır 45), §4b (satır 300-303), FAZ-2.11 (satır 874) | D-9 claims "Çok markalı, çok dikeyli — baştan" and §4b's entire visual thesis is "bugün Upcytech, yarın `dima` | uygulandı — plana işlendi |
| 4 | B | FAZ-2.3b, FAZ-3.1, FAZ-3.7, FAZ-5.4 (satır 866, 884, 890,  | Four phase steps name verbs that D-35 abolished. D-35: "`image/video/tts.generate` ayrımı **iptal**" and §4.1b | uygulandı — plana işlendi |
| 5 | B | FAZ-1.1 (satır 845) vs §5 repo yapısı (satır 463-533) | FAZ-1.1, the first implementation step of the whole project, reads: "pnpm workspace paketleri: `kernel` · `app | uygulandı — plana işlendi |
| 6 | B | FAZ-6.5, FAZ-6.9, FAZ-7.8, FAZ-2.9 — verb kapsaması | Walking the nine pipelines: prospect-deck's step "Araştırma şelalesi: kendi siteleri (yerel Playwright) → Brig | uygulandı — plana işlendi |
| 7 | B | FAZ-0.C.7 commit-msg hook (satır 812) + D-31 / law #2 + FA | 0.C.7 makes `Refs: FAZ-N.x · §bölüm` mandatory on every commit ("(a) `Refs: FAZ-N.x · §bölüm` zorunlu"), enfor | uygulandı — plana işlendi |
| 8 | B | FAZ-0.B.5 (satır 791) | "`KARARLAR.md` — D1–D32 + araştırmadan gelen 🔴 doğrulanmamış kalemler". The decision log in §2 runs to **D38* | uygulandı — plana işlendi |
| 9 | B | §6.1 belge tavanları (satır 547-549) vs FAZ-0.C.9 (satır 8 | §6.1 gives `KURALLAR.md` 600 lines and `KARARLAR.md` "sınırsız (append-only)". 0.C.9 gives "`KURALLAR.md` 400  | uygulandı — plana işlendi |
| 10 | B | FAZ-0.B.2 + FAZ-0.B.8 vs FAZ-0.C.9 | 0.B.2 requires `docs/ANAYASA.md` with §1–§19 complete, "hiçbir bölüm boş veya TBD değil", where §8.7 is the "t | uygulandı — plana işlendi |
| 11 | B | §4c "Somut akış" G1/G2/G2b/G3 (satır 456-459) vs run durum | The demo-video flow shows four human gates inside one run: "G1 bölüm sırası ← sen / G2 Türkçe anlatı metni ← s | uygulandı — plana işlendi |
| 12 | M | D-24 (satır 60), §4.3 (satır 198-209), FAZ-5.6 (satır 913) | D-24 claims "TEK motor: headless Chromium" and §4.3 asserts "Üçü de aynı Chromium'u, aynı fontları, aynı token | → FAZ-5.6 |
| 13 | M | §4.4 yetenek yönlendiricisi (satır 213-219) vs D-36 (satır | The single worked example of a router query is `video.text2video · aspect 9:16 · ≤6sn · **≤4.00 TL** · prefer: | → FAZ-3.5 · kısıt USD mikro olur, TL yalnız görüntüde (D-36) |
| 14 | M | FAZ-3.7 (satır 890), D-2 (satır 38), D-18 (satır 54) vs `L | D-2 defines a two-lane cost model and the contracts freeze `LANES = ["free", "premium"]`. FAZ-3.7 then specifi | → FAZ-3.7 |
| 15 | M | §4.1b VALIDATE (satır 165) vs FAZ-3.9 (satır 892) and FAZ- | VALIDATE's declared effect class is `read-corpus` — "QA, lint, spec ve uyum kapıları", and it is not in `METER | → FAZ-3.9 |
| 16 | M | §5 repo yapısı — `brand/`, `content/`, `runs/`, `ledger/`, | §4.1 defines exactly four rings. §5 then creates five top-level stores that belong to none of them: `brand/` ( | reddedildi (D-50) · brand/=Ring 1, content/=Ring 2; beşinci halka açılmadı |
| 17 | M | §4.1 Ring 3 (satır 146-149) vs §5 (satır 526-530) vs FAZ-0 | §4.1 names three Ring 3 locations: `derived/index`, `derived/runs`, `derived/blobs`, with D-38's durability sp | → FAZ-0.A.1 |
| 18 | M | §12 En büyük risk (satır 1178-1182) vs FAZ-2.8 (satır 871) | §12 lays down a "Sert kural": "`SignedSource`, 3-yollu merge, probe bake-off ve karar defteri **ilk yeniden ür | → FAZ-2.8 |
| 19 | M | FAZ-1.11 (satır 855) vs FAZ-3.4 / FAZ-3.5 (satır 887-888) | FAZ-1.11's deliverable is "`just plan` iskeleti — hiçbir şey harcamadan DAG + **seçilen sağlayıcı** + **maliye | → FAZ-1.11 |
| 20 | M | FAZ-1.5 (satır 849) vs §5 (satır 486) vs FAZ-0.C.4 (satır  | §5 declares `packages/kernel/src/text/case.ts` as "Türkçe case dönüşümüne izin verilen TEK dosya" and 0.C.4's  | → FAZ-1.5 |
| 21 | M | D-33 / FAZ-8.9 (satır 69, 992) vs §4.5 tek retrieval yükle | §4.5 promises the retrieval predicate lives "kodda tek bir yerde" and concludes "Emekliye ayrılmış 2024 geri d | → FAZ-8.9 |
| 22 | M | §4.4 yönlendirici — bedava kota, FAZ-3.7, FAZ-4.12 (satır  | The router is described as a pure four-stage function: "filtrele (yetenek etiketi + tipli kısıt + **enabled**) | → FAZ-3.7 |
| 23 | M | D-36 (satır 72) vs FAZ-3.13 / §13 run manifest | D-36 fixes money as `bigint` USD micro-units, and the contract defines `Money = { micros: bigint; currency: "U | → FAZ-3.13 |
| 24 | M | FAZ-0.C.5 (satır 810) vs the synthesised rulebook's `docs- | 0.C.5 defines the gate as "ters çevrilmiş": catch Turkish leaking into identifiers, schema keys, log event nam | → FAZ-0.C.5 |
| 25 | M | FAZ-0.A.4 (satır 779) vs LOOP§C (satır 618) | 0.A.4's acceptance is "`just check` çalışıyor (henüz boş geçse de)" — an empty `check` is explicitly accepted. | → FAZ-0.A.4 |
| 26 | B | FAZ 0 — 0.A/0.B as a whole; §6.4 'Tur anatomisi' step 1 | No step wires the loop itself. The turn anatomy begins '1. ARAŞTIR — Faz dosyasındaki 📖 § referanslarını docs | uygulandı — plana işlendi |
| 27 | B | FAZ-0.B.8 vs §7.1 'Adım büyüklüğü kuralı' and §7.0 CI kapı | 0.B.8 is one step that must produce ten files covering ~136 steps, each carrying six fields including '✅ Kabul | uygulandı — plana işlendi |
| 28 | B | §7.0 atıf sözlüğü · FAZ-0.A.1c · FAZ-0.C.6 · FAZ-0.C.7 | Three incompatible citation notations are mandated simultaneously. (1) §7.0 declares the step-id form `FAZ-N.x | uygulandı — plana işlendi |
| 29 | B | FAZ-0.B.5 | '**`KARARLAR.md`** — D1–D32 + araştırmadan gelen 🔴 doğrulanmamış kalemler'. The decision log in §2 contains D | uygulandı — plana işlendi |
| 30 | B | FAZ-0.C.2, 0.C.3, 0.C.8, 0.C.11 vs the FAZ 0 preamble | FAZ 0 opens with '**Tek satır özellik kodu yazılmaz.**' Yet 0.C.3 requires layer (1) to be 'the `OpaqueAttribu | uygulandı — plana işlendi |
| 31 | B | §6.1 root-file table vs FAZ-0.C.9 vs §6.4 'Kesin kurallar' | §6.1 declares `KARARLAR.md` ceiling '**sınırsız (append-only)**'. 0.C.9 declares the `docs-size` gate ceiling  | uygulandı — plana işlendi |
| 32 | B | FAZ-0.B.2 + §6.3 vs FAZ-0.C.9 | 0.B.2 requires `docs/ANAYASA.md` with '§1–§19 tam, hiçbir bölüm boş veya "TBD" değil', where §8.7 is the '**ta | uygulandı — plana işlendi |
| 33 | M | FAZ-3.2 vs FAZ-1.10 and §4.3 | 3.2 says '**Golden-file tipografi testi** — `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` her boyutta, **piksel farkında build düş | → FAZ-3.2 |
| 34 | M | §12 'En büyük risk' vs FAZ 2/FAZ 3 phase map and FAZ-2.8 | §12 closes with two rules that contradict the phase map. (a) 'Faz 2'nin sonunda elinde gerçek bir carousel olm | → FAZ-2.8 |
| 35 | M | FAZ 3 exit criterion vs FAZ-4.7 | FAZ 3's exit is '★ **Sistem gerçek bir carousel üretti, sen onayladın, elle paylaştın.**' and §9's FAZ 3 list  | → FAZ-4.7 |
| 36 | M | FAZ-3.7 / 3.8 vs 3.12 / 3.13; and FAZ-0.D.1 / 0.D.2 | 3.7 (`image.generate`, paid lanes) and 3.8 (Marka LoRA, $3 real spend) execute before 3.12 (asset CAS + `<sha2 | → FAZ-3.7 |
| 37 | M | FAZ 4 (4.3–4.17) vs §6.3 '§12.9 11 ekran' vs FAZ-7.7 | Three screen counts that must agree do not. §6.3 fixes ANAYASA §12.9 at '11 ekran'. FAZ 4 lists 15 screens (4. | → FAZ-7.7 |
| 38 | M | D8 (§2) and §7.2 karar kapsama matrisi row 'D-8 hibrit age | D8 — 'orkestrasyon TypeScript, akıl gerektiren adımlar **headless Claude Code**' — is a load-bearing cost deci | → FAZ-1.14 · headless Claude Code köprüsü adım olarak eklendi |
| 39 | M | §4.6 'Aday dönemler' + repo tree `brand/probes/*.probe.yam | §4.6 promises a full mechanism: 'birden fazla era aynı anda `status: candidate` durabilir. `brand/probes/` bir | ertelendi (V-12) · probe bake-off ilk yeniden üretim acıtana kadar yok |
| 40 | M | §6.4 (LOOP§G) vs FAZ-0.B.7; and every `LOOP§X` citation | 0.B.7's acceptance is '`docs/LOOP.md` — döngü protokolü, `LOOP§A`…`LOOP§F` bölümlü'. But §6.4 now contains a s | → FAZ-0.B.7 |
| 41 | M | §6.4 'Faz kapanış protokolü' item 2; FAZ-0.B.9 | The independent verification agent is the plan's only defence against self-certification ('"Bitti" tek başına  | → FAZ-0.B.9 |
| 42 | M | §5 repo tree (lines 465–532) vs §6.2 / §7.0 / FAZ-0.B.2 /  | The repo tree names `docs/00-ANAYASA.md` and `docs/01-YOL-HARITASI.md`; D15 repeats both. Everywhere else — §6 | → FAZ-0.B.2b |
| 43 | M | §4.1 Ring 3 vs §5 repo tree vs FAZ-0.A.1 .gitignore vs FAZ | Ring 3 has four incompatible addresses. §4.1 and D38 say `derived/index`, `derived/runs`, `derived/blobs`. The | → FAZ-0.A.1 |
| 44 | M | §7.1 faz dosyası şablonu | The six-field template is missing everything a context-less agent needs to resume a step it did not start. The | uygulandı · şablona 📁 çıktı yolu alanı eklendi |
| 45 | M | FAZ-0.A.2, 0.A.4, 0.A.5; §9 FAZ 1 and FAZ 2 lists | Several ✅ criteria cannot fail, or cannot be run at the phase they appear in. 0.A.4: '`just check` çalışıyor ( | → FAZ-0.A.2 |
| 46 | M | §10 heading and table; §11 heading | Two namespace collisions in the plan's own referencing system. §10 is headed 'Açık kalemler (**§17**)' but §6. | reddedildi · plan arşive alındı, § çakışması ANAYASA'da yok |
| 47 | M | FAZ-0.B.2, 0.B.8, 1.4, 1.8, 1.12, 2.7, 3.5, 4.2, 4.7, 5.6, | Named violations of §7.1's 'bir adım tek bir döngü turunda bitmeli' — each of these is days of work behind a s | → FAZ-0.B.2b |
| 48 | M | FAZ-4.13 and §9 FAZ 4 list vs §4.6 / repo tree `brand/deci | §4.6 defines `brand/decisions.jsonl` as the **sticky karar defteri** for the brand regeneration engine: 'daha  | → FAZ-4.13 |
| 49 | M | §4c 'Durum C' (line 443); FAZ-0.A.4; §4.6 five-command con | The CLI has three names and an undefined surface. §4c cites '`just validate`' — not among 0.A.4's recipes (`ch | → FAZ-0.A.4 |
| 50 | M | D4 (§2) vs FAZ-7.3; FAZ-7.2 vs the pipeline catalogue; §3  | Three promise/step mismatches. D4 lists 'LinkedIn (post/döküman/**video**)' but 7.3 builds only 'metin, görsel | → FAZ-7.3 |
| 51 | B | §6.4 Tur anatomisi step 6 (KAYDET) + FAZ-0.A.1 vs rule `ag | The loop protocol says every turn ends '6. KAYDET Faz dosyasında tikle + tarih → DURUM.md güncelle → commit',  | uygulandı — plana işlendi |
| 52 | B | §6.4 rule 3 + §6.1 KARARLAR.md row vs FAZ-0.C.9 ceiling an | LOOP rule 3: 'Karar sorulmaz — en makul analizle karar verilir, KARARLAR.md'ye tarihli ve gerekçeli yazılır.'  | uygulandı — plana işlendi |
| 53 | B | §7.0 + §7.1 commit template + FAZ-0.C.7 vs gate 35 check 2 | The plan's commit template is '💾 **Commit:** `feat(kernel): <özet>` + `Refs: FAZ-N.x · §7.2`' and FAZ-0.C.7 a | uygulandı — plana işlendi |
| 54 | B | §10 (Açık kalemler, R-01…R-11) vs §7.0 (`R-nn` = KURALLAR. | §7.0 defines exactly one meaning for the prefix: '`R-nn` / `KURALLAR.md` kuralı / `R-14`'. §10 then issues ele | uygulandı — plana işlendi |
| 55 | B | §6.4 'Turda yapılmaz' (⛔ Uzun/kapsamlı test turda YAPILMAZ | The rulebook: 'There is exactly one verification command, `pnpm verify` … an agent may not use the words done, | uygulandı — plana işlendi |
| 56 | B | FAZ-2.3b and rule `no-spend-or-publish-after-fresh-externa | FAZ-2.3b: 'Taze dış metin içeren bir turda `channel.publish` ve hiçbir ücretli fiil **insan onayı olmadan** at | uygulandı — plana işlendi |
| 57 | B | §4.2 (kayıt zarfı) + §4.5 (retrieval yüklemi) vs law 1 / r | §4.5 fixes the retrieval predicate in code in exactly one place: 'WHERE (era_id = :current_era OR era_id = '*' | uygulandı — plana işlendi |
| 58 | B | §5 repo tree (`runs/<ulid>/`) + §4.2 (`id`(ULID)) vs rule  | §4.2 says ids are ULIDs and §5 lays out `runs/<ulid>/{manifest.json,…}`, `assets/<yyyy>/…`; the branch rule al | uygulandı — plana işlendi |
| 59 | M | §4.3 + FAZ-3.2 + §9 (FAZ 3 doğrulama) vs rule `golden-poli | The plan states twice that pixels gate the build: §4.3 '**Golden-file testi:** `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` her ş | → FAZ-3.2 |
| 60 | M | §4.1 (`derived/…`) vs §5 repo tree (`.suite/`, `runs/`, `l | Ring 3 has three incompatible names in one document. §4.1: 'Ring 3 DERIVED derived/index … derived/runs … deri | uygulandı · kanonik adlar tablosu (§3.9) |
| 61 | M | UI rule `status-glyph-color-text` vs D-37 / FAZ-0.C.5 (`do | The UI rule: 'RUN states are exactly the seven kernel states (`kuyrukta`, `planlanıyor`, `onay bekliyor`, `çal | → FAZ-0.C.5 |
| 62 | M | §4.4 (QuickJS maliyet formülü) and FAZ-3.5 vs rule `regist | §4.4: 'fiyatla (QuickJS'te maliyet formülü, 10ms deadline, USD→TRY günlük TCMB kuru)', and D-32 says providers | → FAZ-3.5 |
| 63 | M | §4.4 ('≤4.00 TL', 'USD→TRY günlük TCMB kuru') and FAZ-3.5/ | The router's worked example expresses a hard constraint in lira — 'video.text2video · aspect 9:16 · ≤6sn · **≤ | → FAZ-3.5 |
| 64 | M | FAZ-0.C.5 (`docs-language` kapısı, ters çevrilmiş) and D-3 | D-37 is right in intent but the inherited gate command is a character-class grep: gate 17 is `rg -n --pcre2 '[ | → FAZ-0.C.5 |
| 65 | M | §5 (`docs/00-ANAYASA.md`, `docs/01-YOL-HARITASI.md`) vs §6 | §5's tree lists 'docs/00-ANAYASA.md # § numaralı ana referans' and 'docs/01-YOL-HARITASI.md # § referanslı faz | uygulandı · kanonik adlar tablosu (§3.9) |
| 66 | M | FAZ-0.B.2 acceptance vs rule `citation-notation-and-stable | The acceptance criterion is '`grep -c "^## §" docs/ANAYASA.md` = 19 · TBD taraması temiz'. §6.3 then defines ~ | → FAZ-0.B.2b |
| 67 | M | FAZ-0.C.8 (`chokepoints.json` — 'Dosya lint'i üretir') vs  | The acceptance test is 'Listeye satır ekle → zorlaması kendiliğinden gelsin · ikinci bir `chromium.launch()` y | → FAZ-0.C.8 |
| 68 | M | rule `five-hermetic-test-lanes-no-egress` vs gate 31 `offl | The conflict ruling says: 'RULED for msw as the single interceptor (two dispatchers fight and produce passes-a | → FAZ-1.10 · msw tek kesici, offline kapısı onun üstünde |
| 69 | M | FAZ-0.A.6 (SOPS + age + **direnv**; '`direnv allow` sonras | The ruling was explicit: 'repo-git said OS keyring, integration said SOPS+age and **explicitly banned keyrings | → FAZ-0.A.6 |
| 70 | M | Law 7 (§8) + §4.6 ('Varlıklar üretim anında damgalanır … S | The plan calls the era stamp the most expensive possible omission — 'Sonradan retrofit imkânsız — bu, tasarımd | → FAZ-3.13 · damga R-11 ile zorlanır, kapı orada kurulur |
| 71 | M | §6.4 ('⛔ Kuralı KURALLAR.md'de değiştirmeden koda farklı y | The loop has 'Tam yetki' and its only stated constraint on rule changes is that code and KURALLAR.md must agre | uygulandı · R-76 eklendi (D-51) — kural gevşetme yasağı |
| 72 | M | FAZ-6.5 (araştırma şelalesi) + D-33 vs rule `untrusted-ing | The rule's boundary is narrow: 'Every byte fetched from a prospect site, competitor page or any non-Upcytech s | → FAZ-6.5 |
| 73 | M | §12 ('Sert kural') vs FAZ-2.6 / FAZ-2.8 / §4.6 and FAZ-3.1 | §12 states two hard sequencing rules: 'Sert kural: 10 gerçek varlık yayınlanana kadar 7 strateji varlık tipini | → FAZ-2.6 |
| 74 | M | FAZ-1 çıkış (§9) 'Bir işi yarıda kes (SIGKILL) → yeniden b | The FAZ-1 acceptance criterion tests resume-without-double-charge, which the rulebook implements as 'an intent | → FAZ-3.6 |
| 75 | M | FAZ 0 çıkış kriteri ('Her BLOCKING kural kasten ihlal edil | The rulebook contains 70 master rules (≈60 BLOCKING) plus 41 UI rules (33 BLOCKING) and a 42-row gate table. F | → FAZ-0.C |
