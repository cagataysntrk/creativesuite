# FAZ 4 — Komuta merkezi

**Amaç:** Sistem, kullanmaya devam edeceğin kadar keyifli olsun — hayatta kalmasının
gerçek belirleyicisi budur.
**Yöneten kararlar:** D-1, D-7, D-12, D-17, D-19, D-26
**Ön koşul:** FAZ 3 kapalı
**Çıkış kriteri:** Klavyeyle uçtan uca bir çalıştırma: ⌘K → pipeline seç → başlat →
onayla, **fareye hiç dokunmadan** · Tailscale üzerinden telefondan onay ·
+%30 sahte-yerelleştirmede hiçbir yerde kırpma yok

> **Sıra kasıtlı:** UI, pipeline'lardan SONRA geliyor. Neyin gösterilmesi gerektiğini
> ancak gerçek bir carousel ürettikten sonra biliyorsun (FAZ 3).

---

## 4.1 — Tasarım sistemi katmanı    [ ]

📖 §12.1, §12.2, §12.3, §12.4, §12.7 · R-22, R-23 · D-7
🔗 FAZ-2.10
🛠 **Üç kademe token:** ham OKLCH rampalar (bileşen asla dokunmaz) → anlamsal roller
   (yüzey bağlamına göre) → bileşen token'ları (yalnız 2. kademeye referans).
   **İki renk bağlamı, tema anahtarı YOK:** `[data-surface="console"]` kalıcı koyu,
   `[data-surface="studio"]` kalıcı açık. `prefers-color-scheme` yapısal olarak yok sayılır —
   kabuk bir **izleme kabinidir** (ISO 3664) ve çok markalı bir sistemde aracın kendi
   rengi işin rengiyle kavga ederse hiçbir marka dürüst görünmez.
   **Chroma alana göre sınırlı:** ekranın %25'inden büyük dolgu C ≤ 0.02 · kenarlık ≤ 0.04 ·
   metin ≤ 0.06 · yalnız %4'ten küçük sinyal alanları ≤ 0.16. **Gölge yasak** — yükseklik
   arka plan basamağı + pah çizgisiyle.
📁 `packages/ui/src/tokens/` · `packages/ui/src/theme.css`
✅ `just gate tokens` üç kademe ihlalini yakalıyor · chroma sınırları makineyle denetleniyor
🧪 Bileşen token'ını 1. kademeye bağla → kırmızı · %30 alanlı bir dolguya C=0.12 ver → kırmızı
💾 `feat(ui): üç kademe token ve iki yüzey bağlamı` · `Refs: FAZ-4.1 · §12.1`

## 4.2 — Vite + React + Hono + SSE iskeleti    [ ]

📖 §12.5, §12.4 · D-26
🔗 4.1
🛠 Vite + React + Tailwind + shadcn (SPA) · Hono API · SSE · `chokidar` registry izleme.
   **⌘K palet birincil navigasyon** — menü değil. **Kalıcı makine durumu şeridi**:
   aktif çalıştırma · biriken maliyet (canlı) · bekleyen onay · en yakın kota sınırı.
   Toast değil, köşede rozet değil — kalıcı enstrüman okuması.
📁 `apps/ui/src/` · `apps/server/src/`
✅ `just dev` ayağa kalkıyor · SSE ile canlı maliyet akıyor · ⌘K her ekrandan açılıyor
🧪 Sunucuyu öldür → UI "bağlantı yok" diyor, **eski değeri canlı gibi göstermiyor**
💾 `feat(ui): SPA iskeleti, ⌘K palet ve makine durumu şeridi` · `Refs: FAZ-4.2 · §12.5`

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
