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

## 1.2 — Kayıt zarfı ve şema üretimi    [x] 2026-08-15

📖 §3.2, §3.3 · D-41
🔗 1.1b
🛠 Zarf Zod şeması (sistem alanları: `id`, `brand_id`, `type`, `kind`, `zone`, `status`,
   `locale`, `era_id`, geçerlilik tarihleri, `re_verify_by`, `supersedes`, `confidence`,
   `source`, `scope`, `tags`, `context_weight`, `x_signature`).
   `z.toJSONSchema()` → `schemas/*.schema.json`, **commit'li**.
✅ `just gate schemas` — üretip `git diff --exit-code -- schemas/` boş
🧪 Zod'u değiştir, üretmeden commit'le → kapı kırmızı
💾 `feat(kernel): kayıt zarfı şeması ve üretilmiş JSON şemaları` · `Refs: FAZ-1.2 · §3.2`
   (D-57: Zod çalışma zamanı bağımlılığıdır, contracts hiçbir şey import etmez)

## 1.3 — registry/PROFILE.md    [x] 2026-08-15

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

## 1.5 — Türkçe metin primitifleri    [x] 2026-08-15

📖 §7.2 · R-21 · 🔗 FAZ-0.C.4 (kapı burada kurulur)
🛠 `packages/kernel/src/text/case.ts` — `upper()`, `lower()`, `sentenceCase()`, `slug()`,
   `foldForSearch()`, `syllables()`, `softHyphenate()`. Hepsi `toLocaleUpperCase('tr')`
   tabanlı. Chromium'un Türkçe heceleme sözlüğü **yok**, `U+00AD` sunucuda enjekte edilir.
   Ayrıca `asciiLower()`/`asciiUpper()`: HTTP başlığı, metot, MIME gibi **protokol
   token'ları** Türkçe kuralıyla dönüştürülmez (`'X-API-KEY'` → `'x-apı-key'` olurdu).
✅ `upper('istanbul')` → `İSTANBUL` · `lower('IĞDIR')` → `ığdır` · testler yeşil
🧪 Başka bir dosyada `.toUpperCase()` yaz → `turkish-case` kapısı kırmızı
💾 `feat(kernel): locale-güvenli Türkçe metin primitifleri` · `Refs: FAZ-1.5 · §7.2`

## 1.6 — Corpus yazma darboğazı ve türetilmiş indeks    [x] 2026-08-15

📖 §3.5, §5.6 · R-05, R-52 · D-27, D-38
🛠 Tek yazma noktası (`corpus/write.ts`) — agent yalnız `propose()` çağırabilir, `status`
   ve `zone` seçtirilmez; elle düzenlenmiş (`zone: human`) kaydın ve imzası kırık
   üretilmiş kaydın üzerine yazmak REDDEDİLİR. `derived/index/` SQLite: FTS5 `unicode61
   remove_diacritics 2` + paralel `trigram` + RRF (k=60) birleştirme; hangi indeksin
   bulduğu sonuçta görünür. `derived/runs/` **ayrı ve silinmez**.
   Tek frontmatter ayrıştırıcı; bozuk dosya istisna değil **veri durumu** döndürür ve
   `reindex` atlananları RAPORLAR — sessiz atlama, aranamayan kayıt demektir.
✅ `just reindex` sıfırdan kurup saniyeler içinde bitiriyor ·
   "ölçüm" araması "ölçümlerinizi" buluyor
🧪 `derived/index/` sil → `just reindex` geri kuruyor · `derived/runs/` sil → **veri kaybı**,
   bu yüzden ignore edilmiyor (kapı zaten doğruluyor)
💾 `feat(corpus): tek yazma darboğazı ve FTS5 indeksi` · `Refs: FAZ-1.6 · §3.5`

## 1.7 — Hata taksonomisi ve Result disiplini    [x] 2026-08-15

📖 §8.6 · R-41
🔗 1.1b
🛠 `AppError` kapalı birleşimi; her hata `costIncurred` taşır (3 görselden sonra gelen
   429 yine de para harcadı). `Error.cause` zinciri korunur. `classify()` toplam fonksiyon.
   I/O yapan her dışa açık fonksiyon `Result` döner; `throw` yalnız `errors/panic.ts` —
   ve yalnız **değişmez ihlalinde**, ağ/dosya/kullanıcı hatasında asla.
   Toplamlık `switch`+`assertNever` ile değil, tam `Record<ErrorKind, ErrorPolicy>` ile:
   `default` dalı yazılmayı unutulabilir, eksik tablo anahtarını derleyici doğrudan görür.
✅ `just test errors` yeşil · `classify()` her `ErrorKind` için tanımlı (exhaustive)
🧪 `ErrorKind`'a yeni değer ekle, `classify`'ı güncelleme → `tsc` kırmızı
💾 `feat(kernel): hata taksonomisi ve Result sözleşmesi` · `Refs: FAZ-1.7 · §8.6`

## 1.8 — İş kuyruğu ve durum makineleri    [x] 2026-08-15

📖 §3.7 · D-28
🛠 SQLite iş tablosu + **kiralama (lease)** modeli: iş alınır ve süreliğine kiralanır;
   süreç SIGKILL yerse iş ne kaybolur ne kilitlenir. Dört durum makinesi: `run` · `asset` ·
   `record` · `job`. Yasal geçişler tabloda, hand-rolled discriminated union (XState
   değil — kalıcı anlık görüntü kütüphane sürümüne bağlanmasın, D-28).
   Yanında doğan darboğazlar: `db.ts` (tek SQLite handle, **Ring 0**'a taşındı — D-61) ·
   `time/clock.ts` (dondurulabilir saat) · `rng.ts` (seed'li) · `ids.ts` (uuidv7, ön ekli,
   kütüphanesiz). Kuyruk dördünü de gerektiriyordu; ayrı ayrı doğurmanın anlamı yoktu.
✅ Yasadışı geçiş denemesi tip hatası · `just test fsm` yeşil
💾 `feat(kernel): iş kuyruğu ve dört durum makinesi` · `Refs: FAZ-1.8 · §3.7`

## 1.9 — Run manifest sözleşmesi    [x] 2026-08-15

📖 §13 · V-11
🛠 Manifest: `brand_id` · `era_id` · corpus commit SHA'sı · adım başına şerit/model/seed ·
   tahmini vs gerçek maliyet · her insan kararı · **kaybeden sağlayıcılar ve red gerekçeleri**.
   Bağlam anlık görüntüsü saklama süresi burada belirlendi: **90 gün** (V-11 kapandı → D-63).
   `inspectManifest()` yedi kusur sınıfı arar; kusur bir DEĞERDİR, istisna değil.
   En sert iki kural: sağlayıcı seçen adım **kaybedenleri de** yazmak zorunda, ve biten
   metered adım gerçek maliyet olmadan kapanamaz.
✅ Manifest'siz çıktı üretmeyi dene → hata · `just test manifest` yeşil
💾 `feat(kernel): run manifest sözleşmesi` · `Refs: FAZ-1.9 · §13`

## 1.10 — Test altyapısı    [x] 2026-08-15

📖 §15 · R-31 · D-59 (golden harness 1.10b'ye ayrıldı)
🛠 Vitest (tek koşucu) · msw (tek HTTP kesici) · cassette katmanı (secret redaksiyonlu,
   commit'li) · sentetik fixture corpus + marka + prospect.
   **Gerçek prospect verisi fixture'a asla girmez (KVKK).**
   Yanında doğan darboğazlar: `net/http.ts` (tek HTTP istemcisi) · `config/env.ts`
   (tek `process.env` okuyucusu) · `errors/make.ts` — cassette sarmalayacak bir istemci
   olmadan anlamsızdı (D-60).
✅ `just test` gerçek testler koşuyor (stub değil) · cassette kaydet→oynat çalışıyor
🧪 Cassette'te secret ara → yok · fixture'da gerçek prospect adı ara → yok
💾 `feat(repo): test altyapısı, cassette ve fixture corpus` · `Refs: FAZ-1.10 · §15`

## 1.10b — Golden-file harness    [ ]

📖 §15, §7.2 · R-31 · D-59
🔗 FAZ-3.1 (Playwright/Chromium), V-02 (marka fontu)
🛠 Font sabitli headless Chromium; commit edilen golden **JSON metriktir** (glyph
   kutuları, satır sayısı, ilerleme genişliği, font ailesi, `notdef` = 0). Piksel
   referansı içerik-adresli depoda durur ve sha256 ile anılır.
⚠ **Bilerek ertelendi:** yer tutucu bir fontla metrik dondurmak, testin varlık sebebini
   (Türkçe glyph fallback'ini yakalamak) doğrudan çürütür. Font kararı V-02'de.
✅ `just golden` gerçek metrik üretiyor · fontu kasten boz → kırmızı
💾 `feat(repo): golden-file harness ve JSON metrikleri` · `Refs: FAZ-1.10b · §15`

## 1.11 — Dokuz fiilin iskeleti    [x] 2026-08-15

📖 §3.10 · R-02, R-04, R-06 · D-35, D-40 · 🔗 FAZ-0.C.11
🛠 Her fiil `{name, effectClass, metered, plan, run}`. `plan` kuru ikiz: sıfır ağ, sıfır
   yazma. `verbs.json` sabitlenir ve kapı bağlanır.
✅ `just gate verbs` yeşil · her metered fiil ≥1 `CostEvent` döndürüyor
🧪 Onuncu fiil ekle → kapı kırmızı · `RENDER` içinden sağlayıcı çağır → depcruise kırmızı
💾 `feat(kernel): dokuz fiil iskeleti ve kuru ikizleri` · `Refs: FAZ-1.11 · §3.10`

## 1.12 — Motor    [x] 2026-08-15

📖 §8.5, §13 · R-44, R-45
🔗 1.8, 1.11
🛠 `packages/engine`: adım zamanlama · retry sınıflandırması (1.7'deki `classify()`
   bağlandı; zamanlama motorda, taksonomi kernel'de) · devre kesici (5 ardışık,
   `(providerId, capability)` anahtarlı, yarı-açıkta TEK deneme) · bütçe kiralama
   (tahminin ÜST sınırı kiralanır) · maliyet defteri (**tek nokta**, aynı zamanda
   idempotency kaydı) · iptal yayılımı (`AbortSignal` uçtan uca).
   Sıra sabit: bütçe → kesici → idempotency → çağrı → defter. Her fiil aynı yoldan geçer.
✅ `just test engine` yeşil · iptal 5 sn içinde alt süreçleri temizliyor
🧪 Bir işi SIGKILL ile kes → yeniden başlatınca kaldığı yerden devam, **çift ücret yok**
💾 `feat(engine): zamanlama, retry, bütçe ve maliyet defteri` · `Refs: FAZ-1.12 · §8.5`

## 1.13 — just plan    [x] 2026-08-15

📖 §8.3, §15 · R-47
🔗 1.11, 1.12
🛠 DAG + seçilen sağlayıcı + maliyet **aralığı** + insan kapıları basar. Hiçbir şey
   harcamaz: sıfır ağ, sıfır yazma, sabit saat ve seed (aynı plan iki kez = aynı çıktı).
   Pipeline çözücü `registry/resolve.ts`'te (D-66) ve **model adını reddeder** (R-40);
   ayrıca DAG döngüsü, bilinmeyen fiil ve olmayan bağımlılık da reddedilir.
   Sağlayıcısı seçilmemiş metered adım için `$0.00` YAZILMAZ — "aralık EKSİKTİR,
   sıfır değil" denir; sıfır göstermek bir sıfır-maliyet iddiasıdır.
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
