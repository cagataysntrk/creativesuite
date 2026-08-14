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

## 0.A.3 — ffmpeg + xvfb + age    [ ] BLOKE
📖 §7.4, §7.7 · D-25
🛠 `sudo apt-get install -y ffmpeg xvfb age`
✅ `ffmpeg -version` ve `xvfb-run --help` çıktı veriyor
🚧 **Bloke:** sudo şifresi gerekiyor, agent kuramaz. Kullanıcı çalıştıracak.
   Engellediği: 0.A.6, 0.A.7, 5.6

## 0.A.4 — justfile + kapı koşucusu    [x] 2026-08-14
✅ 2 kapı listeleniyor · ikisi de kasten bozulunca kırmızı, onarılınca yeşil

## 0.A.5 — latin-ext marka fontu    [ ]
📖 §7.2 · V-02
🔗 FAZ 2 marka keşfiyle bağlantılı — hangi font, marka kararı
🛠 Lisansla, `brand/<brand_id>/assets/fonts/` altına woff2 olarak sabitle (her biri <512KB).
   Harici font CDN'i yok. `unicode-range` açıkça bildirilir.
✅ Kanıt dizesi doğru render: `İstanbul'da yazılım çözümleri: ığüşöç ĞÜŞÖÇ`
   ve `notdef` sayısı = 0

## 0.A.6 — SOPS + age secret yönetimi    [ ]
📖 §14 · 🔗 0.A.3 (age)
🛠 `age-keygen` ile anahtar üret, `secrets/secrets.enc.yaml` oluştur.
   Erişim yalnız `sops exec-env`. **`direnv` kullanılmaz** — gözetimsiz 03:00
   render'ında kabuk kancası yoktur.
✅ `sops exec-env secrets/secrets.enc.yaml 'env | grep -c _KEY'` > 0 · `.env` dosyası yok
🧪 Düz metin anahtar commit'lemeyi dene → `repo-hygiene` bloklamalı

## 0.A.7 — hyperframes doctor    [ ]
📖 §7.4 · 🔗 0.A.3 (ffmpeg)
🛠 `npx hyperframes doctor`
✅ Eksik bildirmiyor

---

## 0.B — Belge temeli

## 0.B.1 — araştırma eki    [x] 2026-08-14
✅ 45 çıktı → `docs/research/`, en büyük 96KB, `.git` 1.8MB

## 0.B.2a — ANAYASA iskeleti    [x] 2026-08-14
✅ 19 `## §` başlığı · çapalar benzersiz

## 0.B.2b — ANAYASA §1–§7    [ ]
📖 `docs/research/` ilgili dalgalar · D-1…D-42
🛠 Amaç, değişmez ilkeler, mimari, marka sistemi, bilgi/hafıza, strateji modeli, üretim.
   Her bölüm arşivden en az bir kaynağa atıf verir.
✅ Bu yedi bölümde TBD yok · `just gate citations` yeşil

## 0.B.2c — ANAYASA §8–§13    [ ]
🛠 Sağlayıcılar, kanallar, pipeline kataloğu, kalite/uyum, tasarım sistemi, gözlemlenebilirlik.
   **§8.7 elle yazılmaz** — `just docs` YAML'dan üretir.
✅ `docs-drift` kapısı yeşil · üretilmiş dosyalar commit'li

## 0.B.2d — ANAYASA §14–§19    [ ]
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
✅ İki dosya tam, sekizi iskelet · `just tur` adımı ayrıştırabiliyor

## 0.B.8b — FAZ-2.md ve FAZ-3.md    [ ]
🛠 Plandaki faz haritasından, altı alanlı şablonla.
✅ Her ✅ çalıştırılabilir komut içeriyor · "çalışıyor" yazan kriter yok

## 0.B.8c — FAZ-4..9.md    [ ]
✅ Aynı · toplam adım sayısı plan faz haritasıyla eşleşiyor

## 0.B.9 — .claude/rules + skills iskeleti    [ ]
📖 §14
🛠 Yol-kapsamlı kurallar (`paths:` taşır, yalnız eşleşen dosyaya dokununca yüklenir).
✅ Her kural dosyası `paths:` taşıyor · ≤120 satır

## 0.B.10 — denetim bulgularının tasfiyesi    [ ]
📖 `docs/research/6-denetim--*` · 75 bulgu
🛠 26 BLOCKER plana işlendi. Kalan 49 MAJOR/MINOR tek tek: ya faz adımına dönüşür,
   ya `KARARLAR.md`'de gerekçesiyle reddedilir. Sessizce düşen bulgu olmaz.
✅ Her bulgu için bir satır: uygulandı (adım) | reddedildi (D-nn) | ertelendi (V-nn).
   Toplam = 75

---

## 0.C — Kural zorlama altyapısı

## 0.C.1 — tsconfig + ESLint + formatter    [ ]
📖 §3.6 · 🔗 1.1
🛠 `strict · noUncheckedIndexedAccess · exactOptionalPropertyTypes · noImplicitOverride ·
   noPropertyAccessFromIndexSignature · isolatedModules · verbatimModuleSyntax ·
   erasableSyntaxOnly`. **TypeScript 7'ye geçilmez** — typescript-eslint peer aralığı
   kabul edene kadar; sessizce tüm tip-farkında kuralları kapatır ve CI yeşil kalır.
✅ `just check` yeşil · `tsconfig-drift` bir paketin bayrağı zayıflatmasını yakalıyor

## 0.C.2 — halka sınırı zorlaması    [ ]
📖 §3.6 · 🔗 1.1
✅ Kasten yanlış halka import'u → ESLint, depcruise ve `tsc -b` üçü de kırmızı

## 0.C.3 — kernel saflık kapısı    [ ]
📖 §3.2 · D-41
🛠 Üç katman: `OpaqueAttributes` markası (derleme hatası) · ESLint `no-restricted-syntax` ·
   grep + **Proxy tuzağı** (`attributes` fırlatan kayıt dokuz fiilden geçirilir).
✅ Grep destructuring ile atlatılabilir, Proxy atlatılamaz — **ikisini de** kasten dene

## 0.C.4 — turkish-case kapısı    [x] kısmen → 0.C.4b
✅ `.toUpperCase()` yalnız `kernel/src/text/case.ts`'de (kural yazıldı, kapı 1.5'te)

## 0.C.5 — docs-language kapısı    [ ]
📖 D-37
🛠 **Ters çevrilmiş:** Türkçe'nin *tanımlayıcı, şema anahtarı, log olay adı, enum değeri,
   dosya adı, hata `code`* alanlarına sızmasını yakalar. Belge nesri Türkçe kalır.
✅ `code: "SAĞLAYICI_HATASI"` → kırmızı · ANAYASA'daki Türkçe paragraf → yeşil

## 0.C.6 — citations kapısı    [x] 2026-08-14
✅ Var olmayan §'ya atıf → kırmızı · reddedilmiş `D-nn`'e atıf → kırmızı

## 0.C.7 — commit-msg hook'u    [x] 2026-08-14 (0.A.1c ile)
✅ İki commit sınıfı ayrışıyor · beş ihlal reddediliyor

## 0.C.8 — chokepoints.json    [ ]
📖 §3.8
🛠 "Tam olarak bir tane olmalı" listesi. **Dosya lint'i üretir** — satır eklemek
   zorlamayı otomatik getirir.
✅ İkinci bir `chromium.launch()` yaz → kırmızı

## 0.C.9 — docs-size    [x] 2026-08-14
✅ DURUM.md'yi 175 satıra şişir → kırmızı; geri al → yeşil

## 0.C.10 — secretlint + gitleaks + lefthook    [ ]
🔗 0.A.6
✅ Sahte anahtar commit'le → engellendi

## 0.C.11 — verbs kapısı    [ ]
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
