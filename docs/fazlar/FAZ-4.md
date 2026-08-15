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
✅ `just gate tokens` yeşil · `tokens.css` üç blok taşıyor · alt marka yüzeyi devralıyor
🧪 Yüzeye `ramp` ekle → kırmızı · `comp` ekle → kırmızı · yüzey rolüne C=0.12 ver → kırmızı

## 4.1b — Tasarım sistemi katmanı: tipografi, boşluk, yükseklik    [x] 2026-08-15

📖 §12.2, §12.3, §12.7 · R-22, R-23 · D-7
✅ `just gate ui-tema` gölge, 700 ağırlık, ölçek dışı boşluk, tema anahtarını yakalıyor
🧪 `box-shadow` · `font-weight: 700` · `padding: 5px` · `prefers-color-scheme` → kırmızı

## 4.2 — Hono API, SSE ve dosya izleme    [x] 2026-08-15

📖 §12.4, §12.5 · D-26
✅ `just gate cli-duman` sunucuyu GERÇEKTEN kaldırıyor · gerçek repoda `/api/durum`
   → `bekleyenOnay: 7`, `kusurluCalistirma: 12`
🧪 `izlenen`i boşalt · izlemeyi kapat · maliyeti dize birleştir → üçü de kırmızı

## 4.2b — Vite + React SPA, ⌘K palet, makine durumu şeridi    [x] 2026-08-15

📖 §12.5, §12.4 · R-22, R-23 · D-26
✅ `just dev` ikisini kaldırıyor · marka token'ı `/api/tokens.css`ten · 17 test
🧪 SIGKILL → `kopuk`, "bağlantı yok", değer GÖSTERİLMİYOR · nabız ilanını kaldır →
   kırmızı · token CSS'ini boşalt → kırmızı

## 4.3 — Corpus Browser    [x] 2026-08-15

📖 §12.9 · R-12, R-14 · D-12
✅ `/api/kayitlar` 7 kaydı `visible` bayrağıyla döndürüyor · emeklilik dosyayı BIRAKIR
🧪 `DELETE` yok (404) · emekliyi tekrar emekli et → 409 · `era_id`yi boz → kırmızı

## 4.4 — Record Detail ve ters indeks    [x] 2026-08-15

📖 §12.9, §13 · R-11
✅ `/api/kayitlar/:id/etki` + `/gecmis` gerçek veriyle çalışıyor (3 commit, 16 tarandı)
🧪 "etkisi yok" cümlesini sustur → kırmızı · git çizgisini boşalt → kırmızı

## 4.5 — Context Preview    [x] 2026-08-16

📖 §5.3, §12.9 · D-63
✅ Kapatılan kart manifeste yazılıyor · boş bölüm NEDENİNİ söylüyor
🧪 Boş bölüm nedenini sustur → kırmızı · olmayan tarife boş manifest döndür → kırmızı

## 4.6 — Plan dondurma çekirdeği    [x] 2026-08-16

> **Bölündü** (LOOP§C): `4.6` dondurma mantığı, `4.6b` ekran + koşucu.
📖 §8.3, §12.9 · R-07, R-47 · D-17
✅ 15 test · aynı karar aynı özeti veriyor · sağlayıcı değişince özet değişiyor
🧪 Tavanı alt sınırın üstüne, üst sınırın altına koy → yine kilitli

## 4.6b — Run Launcher ekranı ve donmuş planla koşma    [x] 2026-08-16

📖 §8.3, §12.9 · R-07 · D-17
🔗 4.6
🛠 Tipli girdi formu (şemadan) · şerit seçimi · maliyet aralığı + güven noktası.
   **Koşucu donmuş planı KULLANIR**, yeniden çözmez (R-07). ⚠ Gerçek çalıştırma
   gerektirir; `3.14` açılmadan tiklenmez (D-158).
📁 `apps/ui/src/RunLauncher.tsx` · `packages/engine/src/run.ts`
✅ `/api/plan` gerçek HEAD commit'iyle donduruyor · özet KARARLI · fiyatlanmamış
   `gorsel-uret` adımı başlatı KİLİTLİYOR (V-16 anahtarsız — doğru davranış)
🧪 Registry'yi değiştir (p1→p2, $0.025→$9.00) → çalıştırma **p1 ve $0.025 ile** koştu ·
   özete `frozenAt` ekle → kırmızı · fiyatsız adım kilidini kaldır → kırmızı
💾 `feat(ui): run launcher ve donmuş planla koşma` · `Refs: FAZ-4.6b · §8.3`

## 4.7 — Approval Queue    [x] 2026-08-16

📖 §12.5, §12.9 · R-14 · D-31
🔗 4.6
🛠 Klavye odaklı (`j/k/a/e/r/p`). **Red gerekçesi KALICI** ve sonraki çalıştırmaya
   negatif kısıt olarak enjekte edilir; son kabul edilen 5-10 varlık referans olarak geçer.
   Onay = git commit (çalıştırma commit'i, `Refs:` YASAK — R-60).
📁 `apps/ui/src/screens/approval/`
✅ `j/k/a/r` klavye · red gerekçesi `brand/<id>/decisions.jsonl`'a DÜŞÜYOR · manifest
   `awaitingGate` yazıyor (önce yalnız rapor nesnesindeydi) · 7 test
🧪 Gerekçesiz redi kabul et → kırmızı · defter yazımını kaldır → kırmızı ·
   kararı ezilebilir yap → kırmızı
💾 `feat(ui): approval queue` · `Refs: FAZ-4.7 · §12.9`

## 4.8 — Tolerans okuması bileşeni    [x] 2026-08-16

📖 §11.1, §12.9 · R-35 · D-22
🔗 FAZ-3.9
🛠 Fazın **imza öğesi**. ΔE 2000 · metin kaplama · en-boy · palet dışı renk payı —
   hepsi **limit karşısında ölçüm**, rozet değil. `ΔE 2.4 / limit 5.0` kenara ne kadar
   yakın olduğunu söyler; "✓ uygun" hiçbir şey söylemez.
   Ölçülen her sayı `tabular-nums slashed-zero` mono; birim kardeş `<span>`'de 0.85em.
📁 `packages/ui/src/components/tolerance/`
✅ Sayı + limit + bant + glyph + metin · `ToleranceReading` Ring -1'de (D-175) ·
   VALIDATE artık YAPILANDIRILMIŞ okuma yazıyor, metin değil · 6 test
🧪 `✓ uygun` rozeti ekle → `ui-tema` kırmızı · `marka uyumu` ekle → kırmızı ·
   yorumda alıntı → YEŞİL (gerekçe yazmak meşru) · `olculdu` bayrağını kaldır → kırmızı
💾 `feat(ui): tolerans okuması bileşeni` · `Refs: FAZ-4.8 · §11.1`

## 4.9 — Placement Preview    [x] 2026-08-16

📖 §9.1, §12.9 · R-23
🔗 4.8
🛠 Gerçek platform chrome simülasyonu; Reels güvenli alan overlay'i (%14 üst / %35 alt /
   %6 yan). Spec tablosu `sourceUrl` + `verifiedAt` taşır (§9.1).
📁 `apps/ui/src/screens/placement/`
✅ Reels bandı §9.1 ile birebir: `950×979` · güvenli alan KENDİ `sourceUrl`+`verifiedAt`
   taşıyor · `safeArea: null` ("chrome yok") ile `{0,0,0}` ("ölçüldü sıfır") AYRI · 9 test
🧪 `topPercent`i boz → kapı + 2 test kırmızı · feed'e sıfırlı güvenli alan ver → kırmızı
💾 `feat(ui): placement preview ve güvenli alan` · `Refs: FAZ-4.9 · §9.1`

## 4.10 — Discovery / Reconciliation    [x] 2026-08-16

📖 §4.4, §12.9 · D-6
🔗 FAZ-2.8
🛠 Dört sütun: **DEĞİŞMEDİ / DEĞİŞTİ / ÇELİŞTİ / YENİ**. Her op için `git diff` satır
   bazlı. İdempotent atlama sayesinde ikinci çalıştırma boş gelir — 900 opluk bir plan
   incelenmez, kabul edilir ve yönetişim tiyatroya döner.
📁 `apps/ui/src/screens/discovery/`
✅ **BEŞ sütun** (D-177): `retire` dördüncüye sıkışmıyor · `skip` ikiye ayrıldı —
   DEĞİŞMEDİ ile ÇELİŞTİ ayrı sütunlarda · 6 test
🧪 Gerçek bir kaydın gövdesine elle dokun → `just discovery plan` **DURDU**, çıkış 1,
   sebep yazılı · plan yokken boş sütun değil 404
💾 `feat(ui): discovery reconciliation ekranı` · `Refs: FAZ-4.10 · §4.4`

## 4.11 — Schema Editor    [x] 2026-08-16

📖 §3.3, §12.9 · D-11, D-20
🔗 FAZ-1.4
🛠 **Yasak anahtar fiziksel olarak yazılamaz** (profil dışı anahtar editörde yok).
   Kaydetmeden önce **tüm corpus'a karşı dry-run**: kaç kaydın kırılacağını SAYIYLA söyler
   ve codemod'suz yıkıcı değişikliği **reddeder**. Alan silmek yerine `x-retired: true`.
📁 `apps/ui/src/screens/schema/` · `packages/registry/src/migrate.ts`
✅ Gerçek corpus'a karşı: zorunlu yapma → **409** `1 kayıt kırılacak · rec_comp_excel ·
   evidence_url` · alan silme → **409** + `x-retired` önerisi · profil dışı → **422** ·
   güvenli ekleme → **200** · 10 test
🧪 Reddedilene 200 döndür → kırmızı · silme reddini kaldır → kapı + 2 test kırmızı
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
