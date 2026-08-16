# FAZ 7 — Yayınlama ve analitik

**Amaç:** Tek tıkla yayın, ilk performans verisi akıyor, kanal sağlığı görünür.
**Yöneten kararlar:** D-3, D-19, D-38
**Ön koşul:** FAZ 6 kapalı
**Çıkış kriteri:** Meta'ya ve LinkedIn'e gerçek bir yayın yapıldı · aynı içeriği ikinci
kez göndermek yerel defterce engellendi · insight anlık görüntüleri SQLite'a düşüyor ·
token son kullanma tarihi ekranda görünüyor

---

## 7.1 — Platform spec tablosu ve drift denetçisi    [x] 2026-08-16

📖 §9.1 · R-63
🔗 FAZ-4.9
🛠 Platform ölçüleri **kod olarak**, her satırda `sourceUrl` + `verifiedAt`. Üç aylık
   drift denetçisi `verifiedAt`i eskiyen satırı işaretler. Spec'i yorumda tutmak,
   altı ay sonra hangi ölçünün nereden geldiğini bilmemek demektir.
📁 `packages/render/src/specs/placements.ts` · `packages/engine/src/saglik/doktor.ts`
   ⚠ Faz dosyası ayrı bir channels paketi diyordu; **öyle bir paket yok**. Tablo 3.15'te
   `render` altında kuruldu ve denetçi 4.17'de doctor'a bağlandı — yeni bir paket açmak
   aynı veriyi ikinci bir yere koymak olurdu.
✅ `just doctor` üç aydan eski `verifiedAt` satırlarını listeliyor (90 gün)
🧪 `verifiedAt`i geriye al → denetçi işaretliyor (ölçüldü: 592 gün, `⚠ [spec]`) ·
   `sourceUrl`suz satır ekle → tip hatası (`Placement.sourceUrl` zorunlu alan)
   ⚠ **Güvenli alanın KENDİ tarihi ayrı ölçülüyor** (D-215): `specAgeDays` yalnız satırın
   `verifiedAt`ini okuyordu, güvenli alan bir yıl bayatlasa "1 gün" diyordu.
💾 `feat(channels): platform spec tablosu ve drift denetçisi` · `Refs: FAZ-7.1 · §9.1`

## 7.2 — Yayın kapıları ve tek yayıncı    [x] 2026-08-16

📖 §9.2, §11.1 · R-34, R-46 · D-3
🔗 7.1, 7.5
🛠 IG feed/carousel/Reels/Stories + Threads. **App Review kendi işletmen için gerekli
   değil** (D-3). `content_publishing_limit` **her yayından önce** sorgulanır; alt-text
   eksikse yayın bloklanır (R-34) — yayınlanmış post düzenlenemiyor.
📁 `packages/providers/src/publish.ts` (ayrı "channels" paketi yok — `kanal-yayinci`
   darboğazı bu dosyayı zaten sahibi ilan etmişti)
✅ Sıra **tipe gömülü** ve ölçüldü: `token → kova:1 → kota → defter → kova:3 →
   yükleme → kaydet`. Her yetenek zorunlu parametre; biri eksikse derlenmiyor.
🧪 Alt-text'siz → red · kota dolu → yükleme DENENMİYOR · yayınlanmış içerik → tekrar
   YOK (R-46) · ölmüş token → BLOKLU · defter okunamıyor → DURUYOR · yükleme hatası
   kotaya karışmıyor. `kanal-yayinci` darboğazı iki biçimde ihlal edildi.
💾 `feat(providers): yayın kapıları ve tek yayıncı` · `Refs: FAZ-7.2 · §9.2`

## 7.2b — Meta'ya gerçek yayın    [ ] BLOKE:insan (V-26)

📖 §9.2 · R-46 · D-3
🔗 7.2, 7.5
🛠 Gerçek Meta uygulaması, uzun ömürlü token ve `instagram_content_publish` kapsamı.
   **App Review kendi işletmen için gerekmiyor** (D-3) ama uygulama, sayfa bağlantısı ve
   token insan eylemidir. Kapılar, sıra ve **`PUBLISH` gövdesi** yazıldı ve bağlandı
   (D-222); gövde yükleyici olmadan `CHANNEL_NOT_CONNECTED` ile AÇIKÇA duruyor.
   ⚠ **Kalan iş yalnız hesap değil:** `upload` + `publishingLimit` adaptörleri (HTTP
   katmanı) ve bir insan komutu da bu adımda yazılacak. Önceki metin "kalan iş
   bağlantı" diyordu ve bu eksikti (FAZ-7 denetimi, M2).
✅ Tek test postu yayınlandı · `content_publishing_limit` yayından ÖNCE sorgulandı
   (gerçek yanıt log'da) · yerel defter yayını kaydetti
🧪 Aynı postu iki kez gönder → yerel defter yinelemeyi yakalıyor, Meta'nın döndürdüğü
   mevcut id "başardım" sanılmıyor
💾 `<özet>` + `Run:` / `Actor:` / `Kind:` (çalıştırma commit'i)

## 7.3 — LinkedIn adaptörü    [x] 2026-08-16

📖 §9.3 · R-34
🔗 7.1, 7.5
🛠 `w_member_social` kapsamı; metin, görsel **ve döküman** postu. Döküman postu en yüksek
   etkileşimli format ve **hiçbir aggregator** onu vermiyor — kendi adaptörümüzün tek
   başına haklı çıktığı yer burası.
📁 `packages/providers/src/linkedin.ts` (ayrı bir "channels" paketi yok — bkz. 7.2)
✅ Üç formatın isteği de KURULUYOR ve doğrulanıyor · döküman postu FAZ-6.3 çıktısını
   (PDF) kabul ediyor, başka biçimi reddediyor
🧪 Sürüm sabitini eskit → istek HİÇ kurulmuyor, sessizce eski API'ye düşmüyor ·
   başlıksız döküman reddediliyor (feed'de `dokuman.pdf` görünürdü ve düzenlenemez) ·
   metin postuna varlık ekle → biçim karışması reddediliyor
   ⚠ **V-23 KAPANDI:** LinkedIn döküman sınırı kaynağından okundu — **300 sayfa · 100 MB**
   (`linkedin.com/help/linkedin/answer/a523054`) ve `placements.ts`e `linkedin-document`
   satırı olarak girdi. Doğrulama bir HATA ortaya çıkardı: döküman için LinkedIn'in
   **görsel** sınırı (5 MB) kullanılıyordu; 40 MB'lık meşru bir döküman reddedilirdi.
   Editoryal tavanımız (10 sayfa) platform sınırından AYRI duruyor — biri olgu, diğeri karar.
   ⚠ Gerçek yayın `7.2b`ye bağlı (V-26): token ve uygulama insan girdisi.
💾 `feat(providers): linkedin adaptörü` · `Refs: FAZ-7.3 · §9.3`

## 7.4 — Token-bucket rate limiter ve yinelenme defteri    [x] 2026-08-16

📖 §8.5, §9.2 · R-44, R-46 · D-38
🔗 7.2
🛠 Limiter **uploader'dan önce** oturur. Meta yinelenen gönderimde **mevcut ID'yi
   döndürür** — "başardım" sanmak, aynı postu iki kez yayınladığını fark etmemektir.
   Yerel yayın defteri (`derived/runs/published.ndjson`, D-38) idempotency anahtarıyla
   karşılaştırır (R-44).
📁 `packages/engine/src/ratelimit.ts` · `packages/engine/src/publish-ledger.ts`
   (yayın defteri dosyası **henüz yok**: ilk gerçek yayın onu yazar — 7.2b. Boş bir
   defter oluşturmak "yayın başladı" derdi ve `ledger_missing` sinyalini yok ederdi.)
✅ Aynı postu iki kez gönder → ikincisi defterce yakalanıyor, kanal çağrısı YAPILMIYOR
   (ölçüldü: `yuklendi` dizisi boş kalıyor)
🧪 Defteri sil → yayın **durur** (defter türetilemez, D-38) · iki ardışık YAZMA
   kapasiteyi aşıyor, ikincisi kuyrukta (`retryAfterMs` tahmin değil hesap)
   ⚠ **"Yok" ile "boş" AYRI:** boş saymak, defteri silmenin yinelemeleri serbest
   bırakması demekti. Bozuk bir satır da sessizce atlanmıyor — atlansaydı bozulmuş
   defter "yayınlanmamış" diye okunur ve içerik ikinci kez yayınlanırdı.
   ⚠ Ağırlık: okuma 1, **yazma 3** (§9.2). Tek ağırlık ya okumayı gereksiz yavaşlatır
   ya yazmayı sağlayıcının sınırına çarptırır — ve 429 ancak yayın anında görünür.
💾 `feat(engine): rate limiter ve yinelenme defteri` · `Refs: FAZ-7.4 · §8.5`

## 7.5 — OAuth akışı ve kapsam sözleşmesi    [x] 2026-08-16

📖 §9.2, §9.3, §14 · R-51
🔗 FAZ-0.A.6
🛠 Meta uygulaması (kendi işletmen, App Review gerekmiyor) + LinkedIn "Share on LinkedIn"
   (3-legged OAuth). Her ikisinin **kapsamları `KARARLAR.md`'de kayıtlı** — hangi izni
   neden istediğini altı ay sonra hatırlamanın tek yolu. Token'lar `sops` altında;
   düz metin yok (R-51), `.env` yok.
📁 `packages/providers/src/oauth.ts` · `packages/kernel/src/rng.ts`
✅ Kapsamlar **gerekçeleriyle** kodda · yetkilendirme URL'i kuruluyor · geri dönüş
   doğrulaması state'i **sabit sürede** karşılaştırıyor · eksik ortam değişkenleri
   ADLARIYLA raporlanıyor
🧪 Düz metin token'ı **izlenen** bir dosyaya yaz → `repo-hygiene` reddediyor ·
   state eşleşmezse geri dönüş reddediliyor (CSRF) · HTTP `redirect_uri` reddediliyor ·
   kısa state reddediliyor
   ⚠ **Kapı ilk denemede YEŞİL KALDI** (D-219): desen listesinde Meta ve LinkedIn yoktu
   ve `gitleaks` de yakalamadı — D-49'un birebir tekrarı. `EAA…` ve `WPL_AP1.` eklendi.
   ⚠ `csrfToken()` **seed'siz** ve bu R-06'ya aykırı değil (D-218): `seededRng` kararları
   üretir ve replay onları tekrar eder; state bir karar değil, tek kullanımlık bir sırdır.
💾 `feat(providers): oauth akışı ve kapsam sözleşmesi` · `Refs: FAZ-7.5 · §9.2`

## 7.5b — Gerçek uygulama kaydı ve token    [ ] BLOKE:insan (V-27)

📖 §9.2, §9.3, §14 · R-51
🔗 7.5, 7.2b
🛠 Meta uygulaması (kendi işletmen — **App Review gerekmiyor**, D-3) ve LinkedIn
   "Share on LinkedIn" kaydı. `META_APP_ID`/`META_APP_SECRET` ve
   `LINKEDIN_CLIENT_ID`/`LINKEDIN_CLIENT_SECRET` `sops` altına iner. Akış, kapsamlar ve
   doğrulama yazıldı ve test edildi; kalan iş **hesap kurulumu**.
✅ `sops exec-env` altında `oauthEnvDurumu` iki sağlayıcı için de `hazir: true` ·
   yetkilendirme akışı gerçek bir token'la tamamlanıyor
🧪 Token'ı düz metin bir dosyaya koy → `gitleaks` + `repo-hygiene` reddediyor
💾 `<özet>` + `Run:` / `Actor:` / `Kind:` (çalıştırma commit'i)

## 7.6 — Token ömrü izleme — ilk gün    [x] 2026-08-16

📖 §9.2, §16 · R-70
🔗 7.5
🛠 Meta uzun ömürlü token **60 günde ölür**. Yenileme yayın hattından **önce** kurulur;
   sonraya bırakılan yenileme, iki ay çalışıp sebepsiz duran bir sistem demektir.
📁 `packages/providers/src/token-refresh.ts` · `secrets/token-durumu.json` ·
   `scripts/token-durum.mjs` · `packages/engine/src/saglik/doktor.ts`
✅ `just doctor` ve `just token-durum` üç durumu da doğru ayırıyor (ölçüldü):
   ölmüş → **kritik** · pay içinde → **uyarı** · uzun ömürlü → sessiz
🧪 Sahte süresi dolmuş token → `✗ token 76 gün önce ÖLDÜ — yayın BLOKLU` ·
   kaydı sil → `BİLİNMİYOR, yayın BLOKLU` (bilinmeyen ömür uzun ömür değildir)
   ⚠ **Son kullanma tarihi SIR DEĞİL** ve düz metin duruyor: `just doctor` bir ay sonra
   açıldığında `sops` çözmeden "token 4 gün sonra ölüyor" diyebilmeli. Sırrı okumak
   zorunda olan bir sağlık raporu, gözetimsiz bir kurulumda hiç koşmaz (§16).
   ⚠ `expiresAt` sağlayıcının SÖYLEDİĞİNDEN hesaplanıyor, sabitten değil: 60 yazarken
   sağlayıcı 45 derse, token ölmüşken "15 gün var" deriz (`beklenendenKisa`).
💾 `feat(providers): token ömrü izleme` · `Refs: FAZ-7.6 · §9.2`

## 7.6b — Gerçek yenileme çağrısı    [ ] BLOKE:insan (V-26)

📖 §9.2 · R-51
🔗 7.6, 7.5b
🛠 Uzun ömürlü token değişimi ve periyodik yenileme çağrısı. Ömür ölçümü, üç durum
   ayrımı ve komutlar yazıldı ve ölçüldü; kalan iş gerçek token ve gerçek uç.
✅ Yenileme elle tetiklendi → yeni token `sops`a yazıldı, `token-durumu.json` güncellendi
🧪 Yenileme başarısız olduğunda `doctor` **kritik** veriyor, sessiz kalmıyor
💾 `<özet>` + `Run:` / `Actor:` / `Kind:` (çalıştırma commit'i)

## 7.7 — Publish Queue ve Channel Status ekranı    [x] 2026-08-16

📖 §9.4, §12.9 · D-19
🔗 FAZ-4.2, 7.6
🛠 Kanal başına **operasyonel durum**: oran bütçesi, LinkedIn sürüm sabiti + üç aylık
   hatırlatıcı, token son kullanma. Log'a bakmayı hatırlaman gereken bir sağlık
   göstergesi, olmayan bir sağlık göstergesidir.
📁 `apps/server/src/kanal-uc.ts` · `apps/ui/src/KanalDurumu.tsx` (kabuk düz dosya
   kullanıyor; screens/ alt dizini repoda hiç var olmadı)
✅ `/api/kanallar` gerçek sunucudan ölçüldü — üç gün kalan token, oran bütçesi ve
   sürüm sabiti aynı cevapta:
   `"durum":{"kind":"yenile","kalanGun":3}` · `"oran":{"kapasite":5,"yayinPuani":3,"kalan":null}`
   · `"surum":{"pinned":"202508","yasGun":0,"kalanGun":90}`
🧪 Üç gün kalan token → **uyarı**, yayın hâlâ mümkün · kaydı sil → **BİLİNMİYOR, bloklu**
   · sürümü bir yıl eskit → LinkedIn **bloklu**, Meta etkilenmiyor (10 test)
   ⚠ **Ölçülmeyen üç şey ÜÇ AYRI cümleyle** (D-175): oran bütçesi `null` (kovalar
   ÇALIŞTIRMA sürecinde) · defter yoksa geçmiş **ÖLÇÜLEMEDİ**, sıfır değil (D-38) ·
   zamanlayıcı **yok** ve bu yazıyor — boş liste "var ama iş almadı" derdi.
   ⚠ Sürüm hatırlatıcısı eşikten ÖNCE konuşuyor (`surumYasiGun`): 90. günde kırmızı
   yanan bir gösterge, yeniden kontrol için zaman bırakmaz.
💾 `feat(ui): publish queue ve kanal durumu` · `Refs: FAZ-7.7 · §9.4`

## 7.8 — Insight defteri ve boşluk tespiti    [x] 2026-08-16

📖 §13 · D-27
🔗 7.2
🛠 **İlk postla birlikte başlar.** IG hesap insight'ları 90 günde kayboluyor ve
   **backfill endpoint'i yok** — bugün toplamadığın veri yarın satın alınamaz.
   Günlük snapshot `derived/index/` yerine kalıcı bir tabloya yazılır: türetilemez veri.
📁 `packages/engine/src/insight-ledger.ts` · `scripts/insight-durum.mjs`
   (insight defteri dosyası **henüz yok ve olmamalı**: ilk gerçek ölçüm onu yazar —
   7.8b. Boş bir defter oluşturmak "ölçüm başladı" derdi.)
✅ Aynı gün ikinci kez yazılmıyor (`zaten_var`), farklı gün ayrı satır — 10 test.
   ⚠ **Doğruluk NDJSON'da, SQLite'ta DEĞİL** (D-220): kriter "ilk satırlar SQLite'ta"
   diyordu ve **değiştirildi**. `derived/index/` silinip yeniden kurulabilir (11. yasa);
   geri getirilemez veriyi oraya koymak `just reindex`i kalıcı veri kaybına çevirirdi.
🧪 Ölçüm işini durdur (yayın var, ölçüm yok) → `just doctor` ve `just insight-durum`
   ikisi de **kırmızı**, ölçüldü:
   `✗ [insight] hiç insight alınmadı — backfill ucu YOK, geçen her gün kalıcı kayıp`
   `✗ [insight] 137 gün ölçüm eksik, 47 günü KALICI olarak kayıp (90 gün ufkunu geçti)`
   Üç gün ölçüm yaz → tazelik `✓`e döner **ama 47 günlük kalıcı kayıp `✗` kalır**:
   "ölçüm yeniden çalışıyor", "hiçbir şey kaybolmadı" DEMEK DEĞİLDİR.
   ⚠ Yayın YOKSA denetim **atlanır**: post atmamış bir sistemde "insight alınmadı"
   yanlış alarmdır ve yanlış alarm doğru alarmı da öldürür.
💾 `feat(engine): insight defteri ve boşluk tespiti` · `Refs: FAZ-7.8 · §13`

## 7.8b — Gerçek insight çekimi    [ ] BLOKE:insan (V-26)

📖 §13 · §9.2
🔗 7.8, 7.6b
🛠 Meta insight uçlarından günlük çekim ve deftere yazım. Defter, yineleme koruması,
   boşluk tespiti, ufuk ayrımı ve iki insan komutu yazıldı ve **ölçüldü**; kalan iş
   gerçek token ve gerçek uç. Çekim `INGEST` fiiliyle koşar — kanal okuması da dış
   kaynaktır ve maliyetlenmesi gerekir (R-04).
✅ İki gün üst üste çekim → iki ayrı anlık görüntü, aynı gün ikinci çekim yazmıyor
🧪 Çekim başarısız olduğunda gün **boşluk olarak** kalır, uydurma sıfır YAZILMAZ
💾 `<özet>` + `Run:` / `Actor:` / `Kind:` (çalıştırma commit'i)

## 7.9 — Performans panosu ve geri besleme    [x] 2026-08-16

📖 §13, §11.2 · R-35
🔗 7.8
🛠 Döngü kapanıyor: kazanan hook'lar `corpus/`a **geri akar**, yorum dili müşteri-sesi
   kaydı olur, lexicon her ıskalamada sıkışır. Geri besleme olmadan sistem bir yayın
   makinesi; onunla birlikte öğrenen bir sistem.
📁 `packages/engine/src/performans.ts` · `apps/ui/src/PerformansPanosu.tsx` ·
   `scripts/hook-oner.mjs`
✅ Uçtan uca ÖLÇÜLDÜ: `just hook-oner 179 < metin.txt` →
   `corpus/messaging/kazanan-hook-instagram-179.md`, `status: draft`, `x_signature` ve
   `claim_source: 7 günlük pencere · 1 gün ölçüldü` ile.
🧪 `status: active` zorla → `agent_must_propose` ile reddediliyor (test).
   🧪 Ölçülmemiş pencere → **9999 erişimle en yüksek görünen post ÖNERİLEMİYOR**:
   `✗ 180 sıralanabilir değil — 2026-08-11 ölçülmemiş; bu düşük performans DEĞİL`
   ⚠ **Kümülatif toplam SIRALANAMAZ — yaşla kirlenir.** Üç ay önceki postu dünkü postla
   "toplam erişim"e göre karşılaştırmak, eskiyi kazanan ilan etmektir; ölçtüğün şey
   içerik değil TAKVİM. Sıralama sabit pencerede: yayın + 7 gün (`PENCERE_GUN`).
   ⚠ Sıralanamayanlar **gizlenmiyor** — "en iyi üç post" listesi, ölçülemeyen on postu
   görünmez kılarak yalan söyler. Her satır neden dışarıda olduğunu söylüyor.
   ⚠ **Gerçek çalıştırma gerçek bir hata buldu:** `just *args` tırnağı korumuyor ve
   cümlenin bir kelimesi `metrik` parametresine düştü — ölçülmüş bir kayıt
   "sıralanabilir değil" diye reddedildi. Metin artık STDIN'den (`just save -` deseni).
💾 `feat(ui): performans panosu ve geri besleme` · `Refs: FAZ-7.9 · §13`
