# FAZ 8 — Reklam, uyum, proaktiflik

**Amaç:** Sistem kendi başına haftalık plan öneriyor, sen onaylıyorsun.
**Yöneten kararlar:** D-10, D-23, D-33
**Ön koşul:** FAZ 7 kapalı
**Çıkış kriteri:** Haftalık öneri kuyruğu çalışıyor · sentetik insan içeren varlık kod
seviyesinde bloklanıyor · **geri yükleme tatbikatı yapıldı**: repo + blob + secret'lar
boş bir diske geri yüklendi ve orada `just verify` yeşil verdi

---

## 8.1 — `ad-creative-set` ve H/C/V matrisi    [x] 2026-08-16

📖 §10, §7.1 · D-4
🔗 FAZ-3.14
🛠 Dik matris: **hook × copy × visual**. Tek kompozisyondan çok yerleşim (feed · story ·
   reel). Değişkenler dik olmazsa hangi öğenin çalıştığı ölçülemez — üç varyantı birden
   değiştiren bir test hiçbir şey öğretmez.
📁 `registry/pipelines/ad-creative-set.pipeline.yaml` · `packages/engine/src/matris.ts` ·
   `scripts/gates/matris.mjs`
✅ Varyantlar **eksenlerden TÜRETİLİYOR**, elle yazılmıyor (`varyantUret`): iki eksenli
   bir sapma doğamıyor. 3 eksen × 3 düzey → **7 varyant** (ölçüldü), tam ızgara 27.
   ⚠ **Kriter değişti (D-225, R-74):** "3×3 matris" diyordu; araştırma tam çapraz
   çarpımı yalnız Meta `asset_feed_spec` için ayırıyor — orada H+C+V bileşenleri
   yüklenir ve kombinasyonu **sunucu** kurar, H×C×V kreatif render EDİLMEZ. Öğrenme
   tasarımı **OFAT**: dört kat daha ucuz, aynı bilgi.
🧪 İki ekseni aynı anda değiştiren varyant elle tanımlandı → kapı **kırmızı**, ölçüldü:
   `✗ temelden 2 eksende ayrılıyor (hook, copy) — fark hangi eksene ait, ATFEDİLEMEZ`
   `✗ 2 varyant, mod 'ofat' 7 bekliyor — maliyet tahmini bu sayıyı çarpan alıyor`
   ⚠ `full` modda iki eksenli farklılık **hata değildir** — kombinatoryal tasarımın
   tanımı budur; OFAT kuralını oraya uygulamak geçerli bir seti reddederdi.
💾 `feat(cli): ad-creative-set matrisi` · `Refs: FAZ-8.1 · §10`

## 8.2 — Reklam metni linter'ı    [ ]

📖 §11.2 · R-35
🔗 FAZ-3.10
🛠 Meta'nın **kişisel özellik kuralı** B2B lead-gen'de en sık **sessiz red** sebebi ve
   deterministik olarak lint edilebilir: "sen"li varsayım, sağlık/finans/etnik ima,
   hedef kitleye özellik atfetme. Sessiz red, sebebini söylemeyen bir reddir — bu yüzden
   kapı bizde, onlarda değil.
📁 `packages/render/src/lint/ads.ts`
✅ Kural ihlali içeren metin **yayın öncesi** yakalanıyor, gerekçe Türkçe
🧪 "Borçlarınızdan kurtulun" gibi bir ifade yaz → linter reddediyor
💾 `feat(render): reklam metni linter'ı` · `Refs: FAZ-8.2 · §11.2`

## 8.3 — Compliance Panel    [ ]

📖 §11.3 · R-33 · D-23
🔗 FAZ-3.11
🛠 `containsSyntheticPerson=false` **kod seviyesinde iddia** (Reklam Yönetmeliği Md.
   27/12, 1 Ağu 2026'dan yürürlükte) + EU AI Act Md. 50 ifşası. **C2PA ertelendi**:
   imza zinciri kanal dönüşümlerinde kopuyor ve kopuk imza, imzasızdan kötü — doğrulama
   yapıldığını sandırıyor.
📁 `packages/render/src/compliance/` · `apps/ui/src/screens/compliance/`
✅ Panel her varlığın uyum durumunu limit karşısında gösteriyor (rozet değil)
🧪 Onay ima eden yapay insan içeren varlık onaylamayı dene → **kod seviyesinde** bloklanıyor
💾 `feat(render): compliance panel ve AI ifşası` · `Refs: FAZ-8.3 · §11.3`

## 8.4 — Haftalık `just doctor`    [ ]

📖 §16, §13 · R-70
🔗 FAZ-4.17
🛠 Sağlayıcı fiyat drift'i · `re_verify_by` geçmiş kayıtlar · %20 üstü bütçe sapması ·
   indeks/corpus ayrışması. **Rapor yazar, HİÇBİR ŞEYİ DEĞİŞTİRMEZ**: otomatik düzeltme,
   bir ay sonra dönen kullanıcıdan ne olduğunu gizler ve ilke 12'yi çürütür.
📁 `scripts/doctor.sh`
✅ `just doctor` rapor basıyor · `git status` **temiz** kalıyor (hiçbir dosya değişmedi)
🧪 Doctor'a bir düzeltme eylemi ekle → `chokepoints` reddediyor
💾 `feat(scripts): haftalık doctor raporu` · `Refs: FAZ-8.4 · §16`

## 8.5 — Proaktif katman    [ ]

📖 §10 · D-10
🔗 7.9, 8.4
🛠 D-10'un ikinci kademesi açılıyor: haftalık içerik önerisi, boş takvim uyarısı,
   mevzuat değişiminden içerik fırsatı. **Öneri, üretim değildir** — hiçbir öneri
   metered fiil ateşlemez, hepsi onay kuyruğuna düşer (R-14).
📁 `packages/engine/src/proactive/`
✅ Haftalık öneri kuyruğa düşüyor, hiçbir maliyet oluşmadan
🧪 Öneriyi doğrudan çalıştırmayı dene → insan kapısı olmadan `GENERATE` ateşlenmiyor
💾 `feat(engine): proaktif haftalık öneri katmanı` · `Refs: FAZ-8.5 · §10`

## 8.6 — KVKK metinleri (hukukçu)    [ ]

📖 §11.3 · V-10
🔗 6.4
🛠 Türk hukukçudan **aydınlatma + açık rıza** metinleri, sayısal performans iddialarının
   Reklam Kurulu açısından durumu, sınır ötesi veri aktarımı beyanı. **LLM'e yazdırma:**
   KVKK 2026/347 geri dönüştürülmüş şablonları açıkça cezalandırıyor. V-10 burada kapanır.
📁 `docs/hukuk/` · `corpus/policy/`
✅ Metinler hukukçu onayıyla repoda, tarih ve kaynak damgalı · V-10 🔴 kalktı
🧪 LLM üretimi bir KVKK metnini `zone: human` diye işaretlemeyi dene → imza kapısı reddediyor
💾 `docs(hukuk): KVKK aydınlatma ve açık rıza metinleri` · `Refs: FAZ-8.6 · §11.3`

## 8.7 — Yedekleme ve geri yükleme tatbikatı    [ ]

📖 §14, §16 · R-52, R-70 · D-38
🔗 FAZ-7.8
🛠 **Denenmemiş yedek, yedek değildir.** Repo + blob deposu + secret'lar **ayrı bir diske**
   geri yüklenir ve orada `just verify` yeşil verir. `derived/runs/` türetilemez (D-38,
   R-52) — kurtarma senaryosunun asıl sınadığı şey odur; indeks zaten yeniden kurulur.
📁 `scripts/backup.sh` · `docs/RUNBOOK.md`
✅ Boş bir dizine geri yükle → `just verify` orada yeşil, `just reindex` indeksi kuruyor
🧪 Yedekten `derived/runs/`u çıkar → geri yükleme **eksik** olduğunu söylüyor, sessizce
   tamam demiyor
💾 `feat(scripts): yedekleme ve geri yükleme tatbikatı` · `Refs: FAZ-8.7 · §14`

## 8.8 — Secret rotasyon ve sızıntı müdahalesi    [ ]

📖 §14 · R-51
🔗 8.7
🛠 Hangi anahtar nereden döner, sızıntıda **ilk 10 dakikada** ne yapılır — yazılı,
   sıralı, kişi bağımsız. Sızıntı anında prosedürü düşünmek, prosedürü uygulamamaktır.
   `KARARLAR.md`'de kayıtlı, yılda bir tatbik edilir.
📁 `docs/RUNBOOK.md`
✅ Runbook her sağlayıcı için rotasyon adımı ve iptal URL'i içeriyor
🧪 Bir anahtarı gerçekten döndür → sistem yeni anahtarla çalışıyor, eski anahtar reddediliyor
💾 `docs(docs): secret rotasyon ve sızıntı müdahale prosedürü` · `Refs: FAZ-8.8 · §14`

## 8.9 — Yerel MCP yüzeyi (aday)    [ ]

📖 §3.8, §14 · D-33
🔗 FAZ-4.2
🛠 Hono sunucusu `corpus.search/get/propose` ve aktif çalıştırmayı MCP olarak açar;
   Claude Code, UI'ın gördüğü **aynı** projeyi görür. **Aday karar (D-33)**: burada
   karara bağlanır. Yazma yolu MCP'de de `propose`dur — ikinci bir yazma kapısı,
   R-14'ün tek güvenlik hikâyesini bozar.
📁 `apps/server/src/mcp/`
✅ Claude Code MCP üzerinden corpus arıyor ve öneri açabiliyor · karar `KARARLAR.md`'de
🧪 MCP'den doğrudan `status: active` kayıt yazmayı dene → reddediliyor
💾 `feat(server): yerel MCP yüzeyi` · `Refs: FAZ-8.9 · §3.8`
