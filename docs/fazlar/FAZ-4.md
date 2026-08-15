# FAZ 4 — Komuta merkezi

**Amaç:** Sistem, kullanmaya devam edeceğin kadar keyifli olsun — hayatta kalmasının
gerçek belirleyicisi budur.
**Yöneten kararlar:** D-1, D-7, D-12, D-17, D-19, D-26
**Ön koşul:** FAZ 3 **şartlı** kapalı (D-158) — `4.1`–`4.2` bekleyen üç adımdan
bağımsız; `4.6`–`4.9` gerçek bir çalıştırma gerektirir ve `3.14` açılmadan tiklenmez
**Çıkış kriteri:** Klavyeyle uçtan uca bir çalıştırma: ⌘K → pipeline seç → başlat →
onayla, **fareye hiç dokunmadan** · Tailscale üzerinden telefondan onay ·
+%30 sahte-yerelleştirmede hiçbir yerde kırpma yok

> **Sıra kasıtlı:** UI, pipeline'lardan SONRA geliyor. Neyin gösterilmesi gerektiğini
> ancak gerçek bir carousel ürettikten sonra biliyorsun (FAZ 3).

---

## 4.1 — Tasarım sistemi katmanı: yüzey bağlamları    [x] 2026-08-15

📖 §12.1, §12.4 · R-22, R-23 · D-7
🔗 FAZ-2.10
🛠 Üç kademe token zaten zorlanıyordu (D-133); bu adım **iki yüzey bağlamını** ekler:
   `console` kalıcı koyu, `studio` kalıcı açık, **tema anahtarı YOK**. Yüzey dosyası
   `<ad>.surface.tokens.json` AYRI derlenir ve **yalnız `role.*`** tanımlar. Takma adlar
   CSS'te `var()`a derlenir — düz değerde kaskad kademeyi taşımaz (D-160).
📁 `packages/registry/src/tokens.ts` · `scripts/tokens.mjs` · `brand/*/tokens/*.surface.*`
✅ `just gate tokens` yeşil · `tokens.css` üç blok taşıyor · alt marka yüzeyi devralıyor
🧪 Yüzeye `ramp` ekle → kırmızı · `comp` ekle → kırmızı · yüzey rolüne C=0.12 ver → kırmızı
💾 `feat(ui): iki yüzey bağlamı, takma adlar var()a derleniyor` · `Refs: FAZ-4.1 · §12.4`

## 4.1b — Tasarım sistemi katmanı: tipografi, boşluk, yükseklik    [x] 2026-08-15

📖 §12.2, §12.3, §12.7 · R-22, R-23 · D-7
🔗 4.1
🛠 `theme.css`: **dokuz tip boyutu**, ağırlık 400/450/500/550/650 — konsolda 700
   YASAK. Ölçüm `tabular-nums slashed-zero`, birim 0.85em kardeş span. **4px temel
   birim** (1/2/3/4/6/8), satır 28/32/40, yarıçap 2px. **Gölge YASAK** — basamak + pah
   çizgisi; tek istisna `[data-elevation="overlay"]`. Hareket: altı şey, ≤320ms.
📁 `packages/ui/src/theme.css` · `scripts/gates/ui-tema.sh`
✅ `just gate ui-tema` gölge, 700 ağırlık, ölçek dışı boşluk, tema anahtarını yakalıyor
🧪 `box-shadow` · `font-weight: 700` · `padding: 5px` · `prefers-color-scheme` → kırmızı
💾 `feat(ui): tip ölçeği, boşluk ölçeği, gölgesiz yükseklik` · `Refs: FAZ-4.1b · §12.2`

## 4.2 — Hono API, SSE ve dosya izleme    [x] 2026-08-15

📖 §12.4, §12.5 · D-26
🔗 4.1
🛠 Hono + SSE + dosya izleme. **`chokidar` YOK** (D-162): `fs.watch` `recursive`
   yetiyor (R-75). **Kalp atışı VERİ TAŞIMAZ** — UI sessizliği ölüm sayabilsin diye.
   **Ölçülemeyen alan sıfır girmez**: `kota: null`, indekssiz `bekleyenOnay: -1`.
   Bekleyen onay = taranan − `visibleIds`: ikinci retrieval yüklemi yok (R-13).
📁 `apps/server/src/` · `scripts/sunucu.mjs` · `just dev`
✅ `just gate cli-duman` sunucuyu GERÇEKTEN kaldırıyor · gerçek repoda `/api/durum`
   → `bekleyenOnay: 7`, `kusurluCalistirma: 12`
🧪 `izlenen`i boşalt · izlemeyi kapat · maliyeti dize birleştir → üçü de kırmızı
💾 `feat(server): Hono API, SSE ve dosya izleme` · `Refs: FAZ-4.2 · §12.4`

## 4.2b — Vite + React SPA, ⌘K palet, makine durumu şeridi    [ ]

📖 §12.5, §12.4 · R-22, R-23 · D-26
🔗 4.2
🛠 Vite + React + Tailwind + shadcn (SPA), `theme.css` tüketilir. **⌘K palet
   birincil navigasyon** — menü ağacı YOK (pipeline registry'den gelir, elle menü
   bayatlar). **Kalıcı makine durumu şeridi** `/api/olay`dan beslenir; nabız kesilince
   **"bağlantı yok"** der, eski değeri canlı göstermez (§12.6).
📁 `apps/ui/src/`
✅ `just dev` + Vite ayağa kalkıyor · ⌘K her ekrandan açılıyor · şerit canlı akıyor
🧪 Sunucuyu öldür → şerit "bağlantı yok" diyor, son değeri canlı gibi göstermiyor
💾 `feat(ui): SPA iskeleti, ⌘K palet ve makine durumu şeridi` · `Refs: FAZ-4.2b · §12.5`

## 4.3 — Corpus Browser    [ ]

📖 §12.9 · R-12, R-14 · D-12
🔗 4.2
🛠 Filtreli tablo (marka · tip · durum · dönem), satır içi düzenleme → **git commit**,
   toplu pin/emeklilik. Kart değil **satır**; yoğunluk tablo lehine.
📁 `apps/ui/src/screens/corpus/`
✅ 1000 kayıtla akıcı · düzenleme commit üretiyor · emeklilik `expired_at` yazıyor
🧪 Kayıt silmeyi dene → **silme yok**, yalnız emeklilik (R-12)
💾 `feat(ui): corpus browser` · `Refs: FAZ-4.3 · §12.9`

## 4.4 — Record Detail ve ters indeks    [ ]

📖 §12.9, §13 · R-11
🔗 4.3
🛠 Kaynak alıntısı · `git log --follow` zaman çizgisi · `supersedes` zinciri ·
   **ters indeks: bu kaydın etkilediği HER varlık**. Ters indeks olmadan bir olguyu
   düzeltmek, hangi çıktıların yanlış olduğunu bilmeden düzeltmektir.
📁 `apps/ui/src/screens/record/`
✅ Bir olguyu düzelt → etkilediği varlıklar listeleniyor
🧪 Hiç varlığa girmemiş kayıt → liste boş ve **"etkisi yok" diye açıkça yazıyor**
💾 `feat(ui): record detail ve ters indeks` · `Refs: FAZ-4.4 · §12.9`

## 4.5 — Context Preview    [ ]

📖 §5.3, §12.9 · D-63
🔗 FAZ-2.3
🛠 Bölüm başına token çubuğu · tam prompt metni · kart başına **"neden dahil edildi"** ·
   canlı aç/kapa. Kapatılan kart manifest'e **override** olarak yazılır.
📁 `apps/ui/src/screens/context/`
✅ Kartı kapat → token çubuğu canlı düşüyor · override manifest'te
🧪 Bütçeyi aşan bağlam → hangi bölümün kırpıldığı gösteriliyor, sessizce kesilmiyor
💾 `feat(ui): context preview ve token bütçesi` · `Refs: FAZ-4.5 · §5.3`

## 4.6 — Run Launcher ve plan dondurma    [ ]

📖 §8.3, §12.9 · R-07, R-47 · D-17
🔗 FAZ-3.5
🛠 Tipli girdi formu (şemadan üretilmiş, FAZ-1.4) · şerit seçimi (toplu + adım bazında
   ezme) · maliyet **aralığı + güven noktası** · duvar saati tahmini.
   **Plan onaya giderken DONAR** (R-07): corpus commit'i, registry commit'i, DAG,
   çözülmüş sağlayıcı + model + descriptor hash'i, parametreler, seed, kayıt id'leri.
   Geç çözüm, insanın 40 TL'ye onayladığı çalıştırmanın pahalı bir modelle koşmasıdır.
📁 `apps/ui/src/screens/launcher/` · `packages/engine/src/plan/freeze.ts`
✅ Başlat öncesi donmuş plan gösteriliyor · tahmin üst sınırı tavanı aşarsa **kilitli**
🧪 Donmuş planı çalıştırırken registry'yi değiştir → çalıştırma **eski planla** koşuyor
💾 `feat(ui): run launcher ve plan dondurma` · `Refs: FAZ-4.6 · §8.3`

## 4.7 — Approval Queue    [ ]

📖 §12.5, §12.9 · R-14 · D-31
🔗 4.6
🛠 Klavye odaklı (`j/k/a/e/r/p`). **Red gerekçesi KALICI** ve sonraki çalıştırmaya
   negatif kısıt olarak enjekte edilir; son kabul edilen 5-10 varlık referans olarak geçer.
   Onay = git commit (çalıştırma commit'i, `Refs:` YASAK — R-60).
📁 `apps/ui/src/screens/approval/`
✅ Fareye dokunmadan onayla/reddet · red gerekçesi `brand/decisions.jsonl`'a düşüyor
🧪 Reddedilen bir öneri tekrar üretilsin → **"daha önce reddettin" ile katlanmış** geliyor
💾 `feat(ui): approval queue` · `Refs: FAZ-4.7 · §12.9`

## 4.8 — Tolerans okuması bileşeni    [ ]

📖 §11.1, §12.9 · R-35 · D-22
🔗 FAZ-3.9
🛠 Fazın **imza öğesi**. ΔE 2000 · metin kaplama · en-boy · palet dışı renk payı —
   hepsi **limit karşısında ölçüm**, rozet değil. `ΔE 2.4 / limit 5.0` kenara ne kadar
   yakın olduğunu söyler; "✓ uygun" hiçbir şey söylemez.
   Ölçülen her sayı `tabular-nums slashed-zero` mono; birim kardeş `<span>`'de 0.85em.
📁 `packages/ui/src/components/tolerance/`
✅ Her metrik sayı + limit + bant gösteriyor · sınır dışı olan **glyph + renk + metin**
🧪 Rozet ("✓ uygun") ekle → `ui-lint` kapısı reddediyor · rengi tek başına anlam taşıyan
   bir durum ekle → reddediliyor (alarm yönetimi kuralı, §12.8)
💾 `feat(ui): tolerans okuması bileşeni` · `Refs: FAZ-4.8 · §11.1`

## 4.9 — Placement Preview    [ ]

📖 §9.1, §12.9 · R-23
🔗 4.8
🛠 Gerçek platform chrome simülasyonu; Reels güvenli alan overlay'i (%14 üst / %35 alt /
   %6 yan). Spec tablosu `sourceUrl` + `verifiedAt` taşır (§9.1).
📁 `apps/ui/src/screens/placement/`
✅ Contact sheet'te başlık hiçbir yerde UI chrome altında değil
🧪 Güvenli alana taşan bir başlık ver → **görünür şekilde işaretleniyor**
💾 `feat(ui): placement preview ve güvenli alan` · `Refs: FAZ-4.9 · §9.1`

## 4.10 — Discovery / Reconciliation    [ ]

📖 §4.4, §12.9 · D-6
🔗 FAZ-2.8
🛠 Dört sütun: **DEĞİŞMEDİ / DEĞİŞTİ / ÇELİŞTİ / YENİ**. Her op için `git diff` satır
   bazlı. İdempotent atlama sayesinde ikinci çalıştırma boş gelir — 900 opluk bir plan
   incelenmez, kabul edilir ve yönetişim tiyatroya döner.
📁 `apps/ui/src/screens/discovery/`
✅ İkinci `plan --mode merge` → dört sütun da boş
🧪 `x_signature` kırık bir dosyayla çalıştır → **plan duruyor**, ekran sebebi gösteriyor
💾 `feat(ui): discovery reconciliation ekranı` · `Refs: FAZ-4.10 · §4.4`

## 4.11 — Schema Editor    [ ]

📖 §3.3, §12.9 · D-11, D-20
🔗 FAZ-1.4
🛠 **Yasak anahtar fiziksel olarak yazılamaz** (profil dışı anahtar editörde yok).
   Kaydetmeden önce **tüm corpus'a karşı dry-run**: kaç kaydın kırılacağını SAYIYLA söyler
   ve codemod'suz yıkıcı değişikliği **reddeder**. Alan silmek yerine `x-retired: true`.
📁 `apps/ui/src/screens/schema/` · `packages/registry/src/migrate.ts`
✅ Bir alanı zorunlu yapmayı dene → "N kayıt kırılacak" deyip reddediyor
🧪 Alan sil → reddediliyor, `x-retired` öneriliyor (tarihsel kayıt okunabilir kalmalı)
💾 `feat(ui): schema editor ve göç dry-run'ı` · `Refs: FAZ-4.11 · §3.3`

## 4.12 — Cost & Budget    [ ]

📖 §8.3, §12.9 · D-17
🔗 FAZ-3.5
🛠 Tahmin vs gerçek · canlı bedava kota sayaçları (**doluluk göstergesi**, "1000 kredi"
   yazısı değil) · fiyat anlık görüntüsü yaşı uyarısı · **UI'dan ayarlanabilir tavanlar**
   (aylık / çalıştırma / pipeline).
📁 `apps/ui/src/screens/budget/`
✅ Tavanı UI'dan değiştir → sonraki çalıştırma yeni tavana uyuyor
🧪 %20 üstü sapma olan bir sağlayıcı → panoda işaretleniyor (§16)
💾 `feat(ui): maliyet ve bütçe panosu` · `Refs: FAZ-4.12 · §8.3`

## 4.13 — Tailscale ve Telegram onay botu    [ ]

📖 §9.4 · D-19
🔗 4.7
🛠 D-19'un üç yüzeyi tamamlanıyor: yerel PC + Tailscale + Telegram. Bot **yalnız
   onay/red/gerekçe** — üretim başlatmaz, karar değiştirmez (§4c). Masadan uzaktayken
   kuyruğun tıkanmaması için.
📁 `apps/server/src/telegram/`
✅ Telefondan Tailscale ile onay kuyruğuna girip bir varlık onaylanıyor
🧪 Telegram'dan üretim başlatmayı dene → **reddediliyor**, yüzey sınırı zorlanıyor
💾 `feat(server): tailscale erişimi ve telegram onay botu` · `Refs: FAZ-4.13 · §9.4`

## 4.14 — Asset Library    [ ]

📖 §12.9, §3.5
🔗 FAZ-3.12
🛠 FTS5 arama · **"premium üretildi ama hiç yayınlanmadı"** filtresi (para harcanmış,
   değer alınmamış) · **Reuse birinci sınıf eylem** — benzer bir iş geldiğinde LLM'i
   yeniden çalıştırmak yerine IR'ı kopyalayıp düzenlemek hem ucuz hem tutarlı.
📁 `apps/ui/src/screens/assets/`
✅ Türkçe arama varlık bulur · Reuse mevcut IR'ı açıyor
🧪 Yayınlanmamış premium varlıkları filtrele → liste ve **toplam harcanan** görünüyor
💾 `feat(ui): asset library ve reuse` · `Refs: FAZ-4.14 · §12.9`

## 4.15 — Run History / Provenance Browser    [ ]

📖 §13, §12.9 · D-38
🔗 FAZ-3.13
🛠 Her manifest zaman çizgisi olarak. **`rerun` ve `replay` AYRI düğmeler** ve UI açıkça
   yazar: *"rerun kararı tekrarlar, eseri değil."* Medya uçlarının çoğu deterministik
   değil; bu uyuşmazlığı bug sanan kullanıcı diğer her şeye olan güvenini kaybeder.
📁 `apps/ui/src/screens/runs/`
✅ Bir çalıştırmanın girdileri, commit SHA'sı, şerit/model/seed, tahmini vs gerçek görünüyor
🧪 `rerun` ile `replay`i karşılaştır → sapma **açıkça** gösteriliyor
💾 `feat(ui): run history ve provenance` · `Refs: FAZ-4.15 · §13`

## 4.16 — Strategy Health    [ ]

📖 §11, §12.9 · R-32
🔗 4.3
🛠 Aktif dönemin lint panosu: kaynaksız iddia · birimsiz değer teması · süresi geçmiş
   kanıt · `generalisation_note`'suz dönem-aşırı kanıt · `re_verify_by` geçmiş mevzuat
   kaydı · yasak sözlük terimi.
📁 `apps/ui/src/screens/health/`
✅ Her bulgu ilgili kayda tıklanabilir bağlantı taşıyor
🧪 `re_verify_by` geçmiş bir kayıt ekle → panoda **çürümüş** olarak beliriyor
💾 `feat(ui): strategy health panosu` · `Refs: FAZ-4.16 · §11`

## 4.17 — Doctor ekranı    [ ]

📖 §13, §12.9 · D-1
🔗 4.16
🛠 **Bir ay ihmalden sonra açılacak İLK ekran.** Sağlayıcı fiyat/şema drift'i · emekliye
   ayrılacak modeller · süresi geçmiş kayıtlar · %20 üstü maliyet sapması ·
   indeks/corpus ayrışması. **Rapor yazar, HİÇBİR ŞEYİ DEĞİŞTİRMEZ** — otomatik
   düzeltme, bir ay sonra dönen kullanıcıya ne olduğunu gizler.
📁 `apps/ui/src/screens/doctor/` · `scripts/doctor.sh`
✅ `just doctor` ile aynı bulguları gösteriyor · hiçbir dosya değişmiyor
🧪 Doctor'a düzeltme eylemi ekle → `chokepoints` reddediyor (rapor eder, değiştirmez)
💾 `feat(ui): doctor ekranı` · `Refs: FAZ-4.17 · §13`
