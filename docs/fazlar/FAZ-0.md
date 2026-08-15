# FAZ 0 — Ön hazırlık: belgeler, kurallar, ortam, döngü

**Amaç:** Temel sağlam olsun; başlayınca hiçbir şey tartışılmasın.
**Yöneten kararlar:** D-15, D-29, D-34, D-37, D-42
**Ön koşul:** yok — ilk faz
**Çıkış kriteri:** `just verify` yeşil · dört kök belge tam · ANAYASA §1–§19 dolu ·
on faz dosyası hazır · her BLOCKING kural kasten ihlal edilerek test edilmiş ·
her 🔴 ya kapanmış ya bir adıma bağlanmış · bağımsız doğrulama agent'ı temiz demiş

> **Özellik kodu yazılmaz — altyapı kodu yazılır.** Pipeline yok, fiil gövdesi yok,
> ekran yok. Ama kapıların kendisi koddur: bir kapı, kodu olmadan kasten ihlal edilerek
> test edilemez.

---

## 0.A — Ortam ve araç zinciri

## 0.A.1 — git init, .gitignore, README    [x] 2026-08-14
✅ `git log --oneline` tek commit · `git status` temiz · dal `main`

## 0.A.1b — GitHub private repo    [x] 2026-08-14
✅ `origin` bağlı · anonim API 404 → private

## 0.A.1c — commit-msg kapısı    [x] 2026-08-14
✅ 5 ihlal reddedildi (AI footer, Refs yok, yanlış tip, >72 karakter, 🤖), geçerli commit kabul

## 0.A.2 — Node 22 + pnpm workspace    [x] 2026-08-14
✅ `node -v` v22.23.2 · pnpm 11.21.0 · `.nvmrc` · `.npmrc` tam sürüm sabitleme

## 0.A.3 — ffmpeg + xvfb + age    [x] 2026-08-15
✅ ffmpeg 6.1.1 · `xvfb-run` sanal ekran açıyor (DISPLAY=:99) · age 1.1.1

## 0.A.4 — justfile + kapı koşucusu    [x] 2026-08-14
✅ ≥2 kapı listeleniyor · her biri kasten bozulunca kırmızı, onarılınca yeşil

## 0.A.5 — latin-ext marka fontu    [ ]
📖 §7.2 · V-02
🔗 FAZ 2 marka keşfiyle bağlantılı — hangi font, marka kararı
🛠 Lisansla, `brand/<brand_id>/assets/fonts/` altına woff2 olarak sabitle (her biri <512KB).
   Harici font CDN'i yok. `unicode-range` açıkça bildirilir.
✅ Kanıt dizesi doğru render: `İstanbul'da yazılım çözümleri: ığüşöç ĞÜŞÖÇ`
   ve `notdef` sayısı = 0

## 0.A.6 — SOPS + age secret yönetimi    [x] 2026-08-15
✅ sops 3.13.3 · 9 anahtar `sops exec-env` ile env'e iniyor · `.env` yok ·
   değerler şifreli, anahtar ADLARI düz (git diff okunabilir kalsın diye)
🧪 4 gerçekçi anahtar biçimi (`sk-ant-api03-`, `ghp_`, `AKIA`, `fal-`) commit'lendi →
   dördü de `repo-hygiene` tarafından reddedildi. **İlk desen `sk-ant-api03-`'ü
   kaçırıyordu** — tire yüzünden; ihlal testi kapıyı yazıldığı gün kör buldu.

## 0.A.7 — hyperframes doctor    [x] 2026-08-15
📖 §7.4 · 🔗 0.A.3 (ffmpeg)
✅ **Zorunlu** kontrollerin hepsi yeşil: Node v22.23.2 · FFmpeg 6.1.1 · FFprobe ·
   Chrome (puppeteer cache) · Docker · 29.7 GB RAM · 436 GB disk
   `optional` üçlü bilerek kurulmadı: Kokoro'nun **Türkçesi yok** (yerel ses için
   Chatterbox seçildi), MusicGen gereksiz, whisper.cpp yalnız çevrimdışı yedek —
   birincil Groq whisper (D-18, FAZ-5.4/5.5).

---

## 0.B — Belge temeli

## 0.B.1 — araştırma eki    [x] 2026-08-14
✅ 45 çıktı → `docs/research/`, en büyük 96KB, `.git` 1.8MB

## 0.B.2a — ANAYASA iskeleti    [x] 2026-08-14
✅ 19 `## §` başlığı · çapalar benzersiz

## 0.B.2b — ANAYASA §1–§7    [x] 2026-08-15
📖 `docs/research/` ilgili dalgalar · D-1…D-42
🛠 Amaç, değişmez ilkeler, mimari, marka sistemi, bilgi/hafıza, strateji modeli, üretim.
   Her bölüm arşivden en az bir kaynağa atıf verir.
✅ Bu yedi bölümde TBD yok · `just gate citations` yeşil

## 0.B.2c — ANAYASA §8–§13    [x] 2026-08-15
🛠 Sağlayıcılar, kanallar, pipeline kataloğu, kalite/uyum, tasarım sistemi, gözlemlenebilirlik.
   **§8.7 elle yazılmaz** — `just docs` YAML'dan üretir.
✅ `docs-drift` kapısı yeşil · üretilmiş dosyalar commit'li

## 0.B.2d — ANAYASA §14–§19    [x] 2026-08-15
🛠 Güvenlik, test stratejisi, riskler, reddedilenler, açık kalemler, araştırma eki.
✅ `grep -rn "TBD\|TODO" docs/ANAYASA.md` boş · `wc -l` ≤1200

## 0.B.3 — KURALLAR.md    [x] 2026-08-14
📖 `docs/research/5-kural-kitabi--*` · 111 kural orada
🛠 R-01…R-nn, alan bazlı. Her kural: kural · neden · zorlama · şiddet.
   Zorlaması olmayan kural yazılmaz — "wish" değil kural olacak.
✅ Her BLOCKING kural bir komut/lint kuralı adı taşıyor · ≤400 satır

## 0.B.4 — CLAUDE.md    [x] 2026-08-14
✅ ≤200 satır · 12 yasa satır içi · compact protokolü · okuma sırası

## 0.B.5 — KARARLAR.md    [x] 2026-08-14
🛠 D-1…D-42 (plandaki §2'nin tamamı) + V-01…V-11 doğrulama borçları.
✅ `grep -c '^## D-' KARARLAR.md` = plandaki karar sayısı · her V bir adıma bağlı

## 0.B.6 — DURUM.md    [x] 2026-08-14
✅ Makine-okunur blok · döngü sıradaki adımı tek başına bulabiliyor

## 0.B.7 — docs/LOOP.md    [x] 2026-08-14
✅ `LOOP§A`…`LOOP§G` bölümlü · G başarısızlık protokolü

## 0.B.8a — FAZ-0.md ve FAZ-1.md    [x] 2026-08-14
✅ On dosya var: FAZ-0/1 tam, 2-9 iskelet · `just tur` adımı ayrıştırıyor
⚠ 2026-08-14: sahte tik geri alındı — yalnız FAZ-0.md yazılmıştı

## 0.B.8b — FAZ-2.md ve FAZ-3.md    [x] 2026-08-15
🛠 Plandaki faz haritasından, **yedi alanlı** şablonla: 📖 Oku · 🔗 Bağımlı · 🛠 Yap ·
   📁 Çıktı yolu · ✅ Kabul · 🧪 İhlal testi · 💾 Commit.
   📁 alanı denetim bulgusu #44 ile eklendi: bağlamsız bir agent, başlamadığı bir adımı
   sürdürürken hangi dosyanın hedef olduğunu bilmeli.
✅ Her ✅ çalıştırılabilir komut içeriyor · "çalışıyor" yazan kriter yok

## 0.B.8c — FAZ-4..9.md    [ ]
✅ Aynı · toplam adım sayısı plan faz haritasıyla eşleşiyor

## 0.B.9 — .claude/rules + skills iskeleti    [x] 2026-08-15
📖 §14
✅ 5 kural dosyası, hepsi `paths:` taşıyor, hepsi ≤32 satır:
   `corpus-editing` · `turkish-copy` · `registry` · `gates` · `kernel`
   Skill'ler FAZ 3'te çıktı tipi başına gelecek (şimdi yazılırsa bayatlar).

## 0.B.10 — denetim bulgularının tasfiyesi    [x] 2026-08-15
📖 `docs/research/6-denetim--*` · 75 bulgu
🛠 26 BLOCKER plana işlendi. Kalan 49 MAJOR/MINOR tek tek: ya faz adımına dönüşür,
   ya `KARARLAR.md`'de gerekçesiyle reddedilir. Sessizce düşen bulgu olmaz.
✅ Her bulgu için bir satır: uygulandı (adım) | reddedildi (D-nn) | ertelendi (V-nn).
   Toplam = 75

---

## 0.C — Kural zorlama altyapısı

## 0.C.1 — tsconfig + ESLint + formatter    [x] 2026-08-15
📖 §3.6 · 🔗 1.1
🛠 `strict · noUncheckedIndexedAccess · exactOptionalPropertyTypes · noImplicitOverride ·
   noPropertyAccessFromIndexSignature · isolatedModules · verbatimModuleSyntax ·
   erasableSyntaxOnly`. **TypeScript 7'ye geçilmez** — typescript-eslint peer aralığı
   kabul edene kadar; sessizce tüm tip-farkında kuralları kapatır ve CI yeşil kalır.
✅ `just check` yeşil · `tsconfig-drift` bir paketin bayrağı zayıflatmasını yakalıyor

## 0.C.2 — halka sınırı zorlaması    [x] 2026-08-15
📖 §3.6 · 🔗 1.1
✅ Kasten yanlış halka import'u → ESLint, depcruise ve `tsc -b` üçü de kırmızı

## 0.C.3 — kernel saflık kapısı    [x] 2026-08-15
📖 §3.2 · D-41
🛠 Üç katman: `OpaqueAttributes` markası (derleme hatası) · ESLint `no-restricted-syntax` ·
   grep + **Proxy tuzağı** (`attributes` fırlatan kayıt dokuz fiilden geçirilir).
✅ Grep destructuring ile atlatılabilir, Proxy atlatılamaz — **ikisini de** kasten dene
   → D-64: üç katmanın hangisinin neyi yakaladığı tabloyla ölçüldü
   → D-64: üç katmanın hangisinin neyi yakaladığı tabloyla ölçüldü

## 0.C.4 — turkish-case kapısı    [x] 2026-08-15
📖 §7.2 · R-21 · 🔗 FAZ-1.5 (`kernel/src/text/case.ts` orada doğdu)
🛠 `scripts/gates/turkish-case.mjs`. İki şey arar: (1) çıplak `.toUpperCase()`/
   `.toLowerCase()` — tek muaf dosya `text/case.ts` · (2) **daha sinsi hâli:**
   `toLocale…Case()` çağrılmış ama locale verilmemiş veya `'tr'` dışı. Kutsanmış
   dosyanın gerçekten `'tr'` kullandığı ayrıca doğrulanır — yoksa muafiyetin dayanağı
   yok demektir. Node regex'i kullanılır, kabuk değil (D-58 locale tuzağı).
✅ `'ı'.toUpperCase()` yaz → kırmızı
⚠ 2026-08-14: sahte tik geri alındı — devredilen '0.C.4b' diye bir adım yoktu

## 0.C.5 — docs-language kapısı    [ ]
📖 D-37
🛠 **Ters çevrilmiş:** Türkçe'nin *tanımlayıcı, şema anahtarı, log olay adı, enum değeri,
   dosya adı, hata `code`* alanlarına sızmasını yakalar. Belge nesri Türkçe kalır.
✅ `code: "SAĞLAYICI_HATASI"` → kırmızı · ANAYASA'daki Türkçe paragraf → yeşil

## 0.C.6 — citations kapısı    [x] 2026-08-14
🛠 Ek: `reddedildi` işaretli bir `D-nn`'e atıf da hata olmalı.
✅ Var olmayan §'ya atıf → kırmızı · reddedilmiş `D-nn`'e atıf → kırmızı
⚠ 2026-08-14: sahte tik geri alındı — ikinci yarı kodda yoktu

## 0.C.7 — commit-msg hook'u    [x] 2026-08-14 (0.A.1c ile)
✅ İki commit sınıfı ayrışıyor · beş ihlal reddediliyor

## 0.C.8 — chokepoints.json    [x] 2026-08-15
📖 §3.8
🛠 "Tam olarak bir tane olmalı" listesi. **Dosya lint'i üretir** — satır eklemek
   zorlamayı otomatik getirir. 24 darboğaz; 13'ü mekanik zorlanıyor, 11'i beyan
   (`desen: null`) ve kapı her turda kaç tanesinin zorlanmadığını **basar**.
✅ İkinci bir `chromium.launch()` yaz → kırmızı

## 0.C.9 — docs-size    [x] 2026-08-14
✅ DURUM.md'yi 175 satıra şişir → kırmızı; geri al → yeşil

## 0.C.10 — commit kancaları + gitleaks    [x] 2026-08-15
🔗 0.A.6 · D-56 (lefthook ve secretlint reddedildi)
🛠 `.githooks/pre-commit` → `fast` grubu · `.githooks/pre-push` → `all` grubu ·
   `scripts/gates/gitleaks.sh` (geçmiş + çalışma ağacı, `--redact`)
✅ Sahte anahtar commit'le → engellendi

## 0.C.11 — verbs kapısı    [x] 2026-08-15
📖 §3.10 · D-35, D-40 · 🔗 1.11
✅ Dokuzuncu fiil listesi `packages/kernel/verbs.json`'a sabit; onuncu → kırmızı

---

## 0.D — Doğrulama borçları

## 0.D.1 — bake-off #1: görsel modelleri (~$5)    [ ]
📖 §7.3 · V-01
🛠 10 Türkçe brief × 4 model. **Metinsiz** üretim kalitesi ve marka estetiği.
✅ Kazanan `registry/models.yaml`'a yazılmış · çıktılar `docs/research/bakeoff/`

## 0.D.2 — bake-off #2: Türkçe TTS (~$2)    [ ]
📖 §7.5
🛠 500 kelimelik Türkçe metin × 4 TTS (biri yerel Chatterbox).
✅ Kazanan yazılmış · ses dosyaları saklanmış

## 0.D.3 — Remotion koltuk fiyatı    [ ]
📖 §7.4 · V-01
🛠 Tarayıcıdan doğrula (JS widget, statik HTML'de yok) → HyperFrames kararını teyit et.
✅ `KARARLAR.md`'de V-01 kapandı

## 0.D.4 — rjsf 2020-12 kapsaması    [ ]
📖 §3.3 · V-03
✅ Tek varlık tipi form olarak render oluyor, veya profil daraltıldı

## 0.D.5 — fal OpenAPI URL'i    [ ]
📖 §8.1 · V-04
✅ Çalışıyorsa içe aktarıcı yolu; çalışmıyorsa elle tanımlayıcı yolu — ikisi de belgeli

---

## 0.E — Döngü kurulumu

## 0.E.1 — DURUM.md sözleşmesi    [x] 2026-08-14
✅ `just tur` sıradaki adımı DURUM.md'den ayrıştırıyor

## 0.E.2 — tur açılış yordamı    [x] 2026-08-14
✅ `just tur` faz + adım + bloke listesi + adım gövdesini basıyor

## 0.E.3 — doğrulama agent'ı tanımı    [ ]
📖 `LOOP§D`
🛠 `.claude/agents/faz-dogrulayici.md`. Prompt bir dize değil, çalıştırılabilir agent olmalı;
   yoksa faz kapanışı öz-onaya döner.
✅ FAZ 0'a karşı çalıştır → eksikleri listeliyor (temiz demiyor, çünkü FAZ 0 bitmedi)

## 0.E.4 — compact protokolü    [x] 2026-08-14
✅ `CLAUDE.md` okuma sırası: DURUM.md → aktif FAZ-N.md → `just tur`

## 0.E.5 — ilk döngü provası    [ ]
🛠 `/loop` dinamik modda üç tur. Her tur: bir adım · kanıt · tik · DURUM · commit · 70sn wakeup.
✅ Üç tur `git log`'da `Refs: FAZ-0.x` ile görünüyor · DURUM üç kez güncellenmiş ·
   hiçbir tur iki adım denememiş
