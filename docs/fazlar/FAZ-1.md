# FAZ 1 — Kurulum: iskelet, şema, çekirdek primitifler

**Amaç:** Çekirdek ayakta, test edilebilir ve dry-run dürüst olsun. Hiçbir üretim yok.
**Yöneten kararlar:** D-27, D-28, D-29, D-35, D-36, D-40, D-41
**Ön koşul:** FAZ 0 kapalı
**Çıkış kriteri:** `just verify` yeşil · dokuz fiil tanımlı ve `verbs` kapısı bağlı ·
`just plan` hiçbir şey harcamadan DAG + sağlayıcı + maliyet aralığı basıyor ·
ağ kablosu çekiliyken de çalışıyor

---

## 1.1 — pnpm workspace ve halka sınırları    [x] 2026-08-15

📖 §3.1, §3.6 · R-03 · D-29
🛠 `packages/{contracts,kernel,registry,corpus,providers,render,engine,ui}` +
   `apps/{ui,server,cli}`. TS project references (`composite: true`).
   **Halka sınırları ilk günden lint'li** — sonradan eklemek 200 kullanımı refactor etmek.
✅ `just check` yeşil · `pnpm -r exec tsc -b` hatasız
🧪 `packages/contracts` içine `packages/kernel`'den import yaz → ESLint, depcruise ve
   `tsc -b` **üçü de** kırmızı
💾 `feat(repo): pnpm workspace ve halka sınırları` · `Refs: FAZ-1.1 · §3.6`

## 1.1b — packages/contracts    [x] 2026-08-15

📖 §3.2, §8.6 · R-01, R-41 · D-36, D-41
🔗 1.1
🛠 `Result<T,E>` · `Brand<T,B>` ve id tipleri (uuidv7, ön ekli) · `Money`
   (`{micros: bigint, currency:"USD"}`) · `RecordEnvelope` + `OpaqueAttributes` ·
   `AppError` kapalı birleşimi · `VerbTable`. **Bu paket hiçbir şey import etmez.**
✅ `pnpm -F @suite/contracts exec tsc --noEmit` hatasız · `package.json` `dependencies` boş
🧪 `record.attributes.foo` yaz → **derleme hatası** (grep değil, tip sistemi)
💾 `feat(contracts): çekirdek tipler ve opak attributes markası` · `Refs: FAZ-1.1b · §3.2`

## 1.2 — Kayıt zarfı ve şema üretimi    [ ]

📖 §3.2, §3.3 · D-41
🔗 1.1b
🛠 Zarf Zod şeması (sistem alanları: `id`, `brand_id`, `type`, `kind`, `zone`, `status`,
   `locale`, `era_id`, geçerlilik tarihleri, `re_verify_by`, `supersedes`, `confidence`,
   `source`, `scope`, `tags`, `context_weight`, `x_signature`).
   `z.toJSONSchema()` → `schemas/*.schema.json`, **commit'li**.
✅ `just gate schemas` — üretip `git diff --exit-code -- schemas/` boş
🧪 Zod'u değiştir, üretmeden commit'le → kapı kırmızı
💾 `feat(contracts): kayıt zarfı ve üretilmiş JSON şemaları` · `Refs: FAZ-1.2 · §3.2`

## 1.3 — registry/PROFILE.md    [ ]

📖 §3.3
🛠 İzin verilen JSON Schema 2020-12 alt kümesi. **Yasak:** `unevaluatedProperties`,
   `$dynamicRef`, `if/then/else`, `patternProperties`, `not`, `oneOf`.
   Varyantlar açık ayırt edici alanla (`kind: 'saas' | 'bespoke'`).
✅ Profil dışı anahtar kullanan bir tip yaz → `registry` kapısı kırmızı
💾 `docs(registry): kısıtlı JSON Schema profili` · `Refs: FAZ-1.3 · §3.3`

## 1.4 — Projeksiyon derleyicisi    [ ]

📖 §3.4 · V-05
🔗 1.3
🛠 Tek şema → dört hedef: rjsf form şeması · TS tipi · **katı LLM şeması**
   (allOf inline, her alan required, `additionalProperties:false`) · SQLite DDL.
✅ Her varlık tipi için dört projeksiyonun CI snapshot'ı eşleşiyor ·
   `just test projection` yeşil
🧪 Şemaya iç içe bir nesne ekle, `additionalProperties:false` koyma → LLM projeksiyonu
   testi kırmızı (sessizce kabul etmiyor)
💾 `feat(kernel): projeksiyon derleyicisi` · `Refs: FAZ-1.4 · §3.4`

## 1.5 — Türkçe metin primitifleri    [ ]

📖 §7.2 · R-21 · 🔗 FAZ-0.C.4 (kapı burada kurulur)
🛠 `packages/kernel/src/text/case.ts` — `upper()`, `lower()`, `slug()`, `foldForSearch()`,
   `softHyphenate()`. Hepsi `toLocaleUpperCase('tr')` tabanlı. Chromium'un Türkçe
   heceleme sözlüğü **yok**, `U+00AD` sunucuda enjekte edilir.
✅ `upper('istanbul')` → `İSTANBUL` · `lower('IĞDIR')` → `ığdır` · testler yeşil
🧪 Başka bir dosyada `.toUpperCase()` yaz → `turkish-case` kapısı kırmızı
💾 `feat(kernel): locale-güvenli Türkçe metin primitifleri` · `Refs: FAZ-1.5 · §7.2`

## 1.6 — Corpus yazma darboğazı ve türetilmiş indeks    [ ]

📖 §3.5, §5.6 · R-05, R-52 · D-27, D-38
🛠 Tek yazma noktası (`corpus/write.ts`). `derived/index/` SQLite: FTS5 `unicode61
   remove_diacritics 2` + paralel `trigram` + RRF birleştirme. `derived/runs/` **ayrı ve
   silinmez**.
✅ `just reindex` sıfırdan kurup saniyeler içinde bitiriyor ·
   "ölçüm" araması "ölçümlerinizi" buluyor
🧪 `derived/index/` sil → `just reindex` geri kuruyor · `derived/runs/` sil → **veri kaybı**,
   bu yüzden ignore edilmiyor (kapı zaten doğruluyor)
💾 `feat(corpus): tek yazma darboğazı ve FTS5 indeksi` · `Refs: FAZ-1.6 · §3.5`

## 1.7 — Hata taksonomisi ve Result disiplini    [ ]

📖 §8.6 · R-41
🔗 1.1b
🛠 `AppError` kapalı birleşimi; her hata `costIncurred` taşır (3 görselden sonra gelen
   429 yine de para harcadı). `Error.cause` zinciri korunur. `classify()` toplam fonksiyon.
   I/O yapan her dışa açık fonksiyon `Result` döner; `throw` yalnız `kernel/src/errors/`.
✅ `just test errors` yeşil · `classify()` her `ErrorKind` için tanımlı (exhaustive)
🧪 `ErrorKind`'a yeni değer ekle, `classify`'ı güncelleme → `tsc` kırmızı
💾 `feat(kernel): hata taksonomisi ve Result sözleşmesi` · `Refs: FAZ-1.7 · §8.6`

## 1.8 — İş kuyruğu ve durum makineleri    [ ]

📖 §3.7 · D-28
🛠 SQLite iş tablosu + süreç-içi worker. Dört durum makinesi: `run` · `asset` · `record` ·
   `job`. Yasal geçişler tabloda, hand-rolled discriminated union (XState değil —
   kalıcı anlık görüntü kütüphane sürümüne bağlanmasın).
✅ Yasadışı geçiş denemesi tip hatası · `just test fsm` yeşil
💾 `feat(kernel): iş kuyruğu ve dört durum makinesi` · `Refs: FAZ-1.8 · §3.7`

## 1.9 — Run manifest sözleşmesi    [ ]

📖 §13 · V-11
🛠 Manifest: `brand_id` · `era_id` · corpus commit SHA'sı · adım başına şerit/model/seed ·
   tahmini vs gerçek maliyet · her insan kararı · **kaybeden sağlayıcılar ve red gerekçeleri**.
   Bağlam anlık görüntüsü saklama süresi burada belirlenir (V-11 kapanır).
✅ Manifest'siz çıktı üretmeyi dene → hata · `just test manifest` yeşil
💾 `feat(kernel): run manifest sözleşmesi` · `Refs: FAZ-1.9 · §13`

## 1.10 — Test altyapısı    [ ]

📖 §15 · R-31
🛠 Vitest (tek koşucu) · golden-file harness (font sabitli Chromium, **JSON metrik**) ·
   msw (tek HTTP kesici) · cassette katmanı (secret redaksiyonlu) · sentetik fixture
   corpus + marka + prospect. **Gerçek prospect verisi fixture'a asla girmez (KVKK).**
✅ `just test` gerçek testler koşuyor (stub değil) · cassette kaydet→oynat çalışıyor
🧪 Cassette'te secret ara → yok · fixture'da gerçek prospect adı ara → yok
💾 `feat(repo): test altyapısı, cassette ve fixture corpus` · `Refs: FAZ-1.10 · §15`

## 1.11 — Dokuz fiilin iskeleti    [ ]

📖 §3.10 · R-02, R-04, R-06 · D-35, D-40 · 🔗 FAZ-0.C.11
🛠 Her fiil `{name, effectClass, metered, plan, run}`. `plan` kuru ikiz: sıfır ağ, sıfır
   yazma. `verbs.json` sabitlenir ve kapı bağlanır.
✅ `just gate verbs` yeşil · her metered fiil ≥1 `CostEvent` döndürüyor
🧪 Onuncu fiil ekle → kapı kırmızı · `RENDER` içinden sağlayıcı çağır → depcruise kırmızı
💾 `feat(kernel): dokuz fiil iskeleti ve kuru ikizleri` · `Refs: FAZ-1.11 · §3.10`

## 1.12 — Motor    [ ]

📖 §8.5, §13 · R-44, R-45
🔗 1.8, 1.11
🛠 `packages/engine`: adım zamanlama · retry sınıflandırması · devre kesici (5 ardışık,
   `(providerId, capability)` anahtarlı) · bütçe kiralama · maliyet defteri yazımı
   (**tek nokta**) · iptal yayılımı (`AbortSignal` uçtan uca).
✅ `just test engine` yeşil · iptal 5 sn içinde alt süreçleri temizliyor
🧪 Bir işi SIGKILL ile kes → yeniden başlatınca kaldığı yerden devam, **çift ücret yok**
💾 `feat(engine): zamanlama, retry, bütçe ve maliyet defteri` · `Refs: FAZ-1.12 · §8.5`

## 1.13 — just plan    [ ]

📖 §8.3, §15 · R-47
🔗 1.11, 1.12
🛠 DAG + seçilen sağlayıcı + maliyet **aralığı** + enjekte edilecek bağlam basar.
   Hiçbir şey harcamaz.
✅ `just plan <pipeline>` çıktı veriyor · ağ kablosu çekiliyken de çalışıyor
🧪 Kuru ikizi olmayan bir fiil ekle → `plan` hata veriyor (sessizce atlamıyor)
💾 `feat(cli): just plan — harcamayan kuru çalıştırma` · `Refs: FAZ-1.13 · §8.3`

## 1.14 — Claude Code köprüsü    [ ]

📖 §3.10 · D-8
🔗 1.11
🛠 `GENERATE` fiilinin "akıl gerektiren" şeridi: headless Claude Code'u alt süreç olarak
   çağıran adaptör. Mevcut abonelik kullanılır, ekstra API faturası yok (D-8).
   Aynı yetenek API şeridine de düşebilmeli — sağlayıcı seçimi yönlendiricinin işi.
📁 `packages/providers/src/claude-code.ts`
✅ `just plan` bu sağlayıcıyı aday olarak listeliyor · adaptör `estimate()` senkron
🧪 Claude Code yokken çalıştır → hata `provider_unavailable`, sessizce atlamıyor
💾 `feat(providers): headless Claude Code adaptörü` · `Refs: FAZ-1.14 · §8.4`
