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
   ⚠ Faz dosyası `packages/channels/` diyordu; **öyle bir paket yok**. Tablo 3.15'te
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
   değil** — ramp hızlı (D-3). `content_publishing_limit` **her yayından önce** sorgulanır.
   Alt-text eksikse yayın bloklanır (R-34): erişilebilirlik sonradan eklenemez, çünkü
   yayınlanmış post düzenlenemiyor.
📁 `packages/providers/src/publish.ts`
   ⚠ Faz dosyası ayrı bir "channels" paketi öngörüyordu; öyle bir paket yok ve
   `kanal-yayinci` darboğazı bu dosyayı zaten sahibi ilan etmişti.
✅ Dört kapı SIRAYLA: token → alt-text → kota → defter mutabakatı → yayın. Sıra **tipe
   gömülü**: `publish()` dört yeteneği de zorunlu parametre alıyor, biri eksikse
   derlenmiyor — "kota sorgusunu unutmak" mümkün değil.
🧪 Alt-text'siz varlık → reddediliyor · kota dolu → yükleme DENENMİYOR · daha önce
   yayınlanmış içerik → tekrar edilmiyor (R-46) · ölmüş token → BLOKLUYOR (uyarı değil)
   ⚠ Kanıt **çağrı sırası**: sahte bağımlılıklar sırayı kaydediyor ve test
   `kota` indeksinin `yukleme`den küçük olduğunu ölçüyor.
   ⚠ `kanal-yayinci` darboğazı BEYANDAN mekanik kurala çevrildi: kanal uç noktası deseni
   greplenip tek dosyaya kilitlendi, iki biçimde ihlal edildi.
💾 `feat(providers): yayın kapıları ve tek yayıncı` · `Refs: FAZ-7.2 · §9.2`

## 7.2b — Meta'ya gerçek yayın    [ ] BLOKE:insan (V-26)

📖 §9.2 · R-46 · D-3
🔗 7.2, 7.5
🛠 Gerçek Meta uygulaması, uzun ömürlü token ve `instagram_content_publish` kapsamı.
   **App Review kendi işletmen için gerekmiyor** (D-3) ama uygulama, sayfa bağlantısı ve
   token insan eylemidir. Kapılar ve sıra yazıldı ve test edildi; kalan iş bağlantı.
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
📁 `packages/engine/src/ratelimit.ts` · `packages/engine/src/publish-ledger.ts` ·
   `derived/runs/published.ndjson`
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
🛠 Meta uzun ömürlü token **60 günde ölür**. Yenileme işi yayın hattından **önce** kurulur
   ve başarısızlığı **sessiz değil, bloklayıcıdır**. Sonraya bırakılan yenileme, ilk
   iki ay çalışan sonra sebepsiz duran bir sistem demektir — ve ilke 12 (bir ay ihmal
   edilse de çalışır) tam burada sınanır.
📁 `packages/providers/src/token-refresh.ts` · `secrets/token-durumu.json` ·
   `scripts/token-durum.mjs` · `packages/engine/src/saglik/doktor.ts`
✅ `just doctor` ve `just token-durum` üç durumu da doğru ayırıyor (ölçüldü):
   ölmüş → **kritik** · pay içinde → **uyarı** · uzun ömürlü → sessiz
🧪 Sahte süresi dolmuş token → `✗ token 76 gün önce ÖLDÜ — yayın BLOKLU` ·
   kaydı sil → `BİLİNMİYOR, yayın BLOKLU` (bilinmeyen ömür uzun ömür değildir)
   ⚠ **Son kullanma tarihi SIR DEĞİL** ve düz metin duruyor: `just doctor` bir ay sonra
   açıldığında `sops` çözmeden "token 4 gün sonra ölüyor" diyebilmeli. Sırrı okumak
   zorunda olan bir sağlık raporu, gözetimsiz bir kurulumda hiç koşmaz (§16).
   ⚠ `expiresAt` sağlayıcının SÖYLEDİĞİNDEN hesaplanıyor, sabitten değil: Meta 60 gün
   diyor ama bir gün 45 derse ve biz 60 yazarsak, token ölmüşken "15 gün var" deriz.
   Sapma `beklenendenKisa` ile işaretleniyor.
   ⚠ Gerçek yenileme ÇAĞRISI `7.6b`de (V-26/V-27): token olmadan yenilenecek şey yok.
💾 `feat(providers): token ömrü izleme` · `Refs: FAZ-7.6 · §9.2`

## 7.6b — Gerçek yenileme çağrısı    [ ] BLOKE:insan (V-26)

📖 §9.2 · R-51
🔗 7.6, 7.5b
🛠 Uzun ömürlü token değişimi ve periyodik yenileme çağrısı. Ömür ölçümü, üç durum
   ayrımı, `doctor` bağlantısı ve insan komutu yazıldı ve **ölçüldü**; kalan iş gerçek
   token ve gerçek uç.
✅ Yenileme elle tetiklendi → yeni token `sops`a yazıldı, `token-durumu.json` güncellendi
🧪 Yenileme başarısız olduğunda `doctor` **kritik** veriyor, sessiz kalmıyor
💾 `<özet>` + `Run:` / `Actor:` / `Kind:` (çalıştırma commit'i)

## 7.7 — Publish Queue ve Channel Status ekranı    [ ]

📖 §9.4, §12.9 · D-19
🔗 FAZ-4.2, 7.6
🛠 Zamanlanan/giden içerik + kanal başına **operasyonel durum**: Meta tier ve oran
   bütçesi, LinkedIn sürüm sabiti ve üç aylık yeniden kontrol hatırlatıcısı, token son
   kullanma tarihi. Bunlar log'da değil **ekranda** durur; log'a bakmayı hatırlaman
   gereken bir sağlık göstergesi, olmayan bir sağlık göstergesidir.
📁 `apps/ui/src/screens/publish/`
✅ Ekran token bitişine kalan günü ve oran bütçesini gösteriyor
🧪 Token'ı 3 gün kalacak şekilde ayarla → ekran uyarı durumuna geçiyor (glyph + renk + metin)
💾 `feat(ui): publish queue ve kanal durumu` · `Refs: FAZ-7.7 · §9.4`

## 7.8 — Günlük insight anlık görüntüleri    [ ]

📖 §13 · D-27
🔗 7.2
🛠 **İlk postla birlikte başlar.** IG hesap insight'ları 90 günde kayboluyor ve
   **backfill endpoint'i yok** — bugün toplamadığın veri yarın satın alınamaz.
   Günlük snapshot `derived/index/` yerine kalıcı bir tabloya yazılır: türetilemez veri.
📁 `packages/channels/src/insights/` · `derived/runs/insights.ndjson`
✅ İlk satırlar SQLite'ta · iki gün üst üste çalıştır → iki ayrı anlık görüntü
🧪 Snapshot işini durdur → `doctor` "N gündür insight alınmadı" diyor
💾 `feat(channels): günlük insight anlık görüntüleri` · `Refs: FAZ-7.8 · §13`

## 7.9 — Performans panosu ve geri besleme    [ ]

📖 §13, §11.2 · R-35
🔗 7.8
🛠 Döngü kapanıyor: kazanan hook'lar `corpus/`a **geri akar**, yorum dili müşteri-sesi
   kaydı olur, lexicon her ıskalamada sıkışır. Geri besleme olmadan sistem bir yayın
   makinesi; onunla birlikte öğrenen bir sistem.
📁 `apps/ui/src/screens/performance/`
✅ Bir kazanan hook `corpus/`a öneri olarak düşüyor (draft, onay bekliyor — R-14)
🧪 Geri beslemeyi doğrudan `status: active` yazmayı dene → yazma darboğazı reddediyor
💾 `feat(ui): performans panosu ve geri besleme` · `Refs: FAZ-7.9 · §13`
