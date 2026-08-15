# FAZ 7 — Yayınlama ve analitik

**Amaç:** Tek tıkla yayın, ilk performans verisi akıyor, kanal sağlığı görünür.
**Yöneten kararlar:** D-3, D-19, D-38
**Ön koşul:** FAZ 6 kapalı
**Çıkış kriteri:** Meta'ya ve LinkedIn'e gerçek bir yayın yapıldı · aynı içeriği ikinci
kez göndermek yerel defterce engellendi · insight anlık görüntüleri SQLite'a düşüyor ·
token son kullanma tarihi ekranda görünüyor

---

## 7.1 — Platform spec tablosu ve drift denetçisi    [ ]

📖 §9.1 · R-63
🔗 FAZ-4.9
🛠 Platform ölçüleri **kod olarak**, her satırda `sourceUrl` + `verifiedAt`. Üç aylık
   drift denetçisi `verifiedAt`i eskiyen satırı işaretler. Spec'i yorumda tutmak,
   altı ay sonra hangi ölçünün nereden geldiğini bilmemek demektir.
📁 `packages/channels/src/specs/`
✅ `just doctor` üç aydan eski `verifiedAt` satırlarını listeliyor
🧪 `verifiedAt`i geriye al → denetçi işaretliyor; `sourceUrl`suz satır ekle → tip hatası
💾 `feat(channels): platform spec tablosu ve drift denetçisi` · `Refs: FAZ-7.1 · §9.1`

## 7.2 — Meta adaptörü    [ ]

📖 §9.2, §11.1 · R-34, R-46 · D-3
🔗 7.1, 7.5
🛠 IG feed/carousel/Reels/Stories + Threads. **App Review kendi işletmen için gerekli
   değil** — ramp hızlı (D-3). `content_publishing_limit` **her yayından önce** sorgulanır.
   Alt-text eksikse yayın bloklanır (R-34): erişilebilirlik sonradan eklenemez, çünkü
   yayınlanmış post düzenlenemiyor.
📁 `packages/channels/src/meta/`
✅ Tek test postu yayınlandı · limit yayından ÖNCE sorgulanıyor (log sırası kanıt)
🧪 Alt-text'siz varlık yayınlamayı dene → reddediliyor · limiti aşan çağrı → kuyrukta
   bekliyor, körlemesine tekrar denemiyor (R-46)
💾 `feat(channels): meta adaptörü` · `Refs: FAZ-7.2 · §9.2`

## 7.3 — LinkedIn adaptörü    [ ]

📖 §9.3 · R-34
🔗 7.1, 7.5
🛠 `w_member_social` kapsamı; metin, görsel **ve döküman** postu. Döküman postu en yüksek
   etkileşimli format ve **hiçbir aggregator** onu vermiyor — kendi adaptörümüzün tek
   başına haklı çıktığı yer burası.
📁 `packages/channels/src/linkedin/`
✅ Üç format da yayınlanıyor · döküman postu FAZ-6.3 çıktısını kabul ediyor
🧪 Sürüm sabitini eskit → adaptör açık hata veriyor, sessizce eski API'ye düşmüyor
💾 `feat(channels): linkedin adaptörü` · `Refs: FAZ-7.3 · §9.3`

## 7.4 — Token-bucket rate limiter ve yinelenme defteri    [ ]

📖 §8.5, §9.2 · R-44, R-46 · D-38
🔗 7.2
🛠 Limiter **uploader'dan önce** oturur. Meta yinelenen gönderimde **mevcut ID'yi
   döndürür** — "başardım" sanmak, aynı postu iki kez yayınladığını fark etmemektir.
   Yerel yayın defteri (`derived/runs/published.ndjson`, D-38) idempotency anahtarıyla
   karşılaştırır (R-44).
📁 `packages/engine/src/ratelimit.ts` · `derived/runs/published.ndjson`
✅ Aynı postu iki kez gönder → ikincisi defterce yakalanıyor, kanal çağrısı YAPILMIYOR
🧪 Defteri sil → yayın **durur** (defter türetilemez, D-38); limiti aşan burst → kuyrukta
💾 `feat(engine): rate limiter ve yinelenme defteri` · `Refs: FAZ-7.4 · §8.5`

## 7.5 — OAuth kurulumu    [ ]

📖 §9.2, §9.3, §14 · R-51
🔗 FAZ-0.A.6
🛠 Meta uygulaması (kendi işletmen, App Review gerekmiyor) + LinkedIn "Share on LinkedIn"
   (3-legged OAuth). Her ikisinin **kapsamları `KARARLAR.md`'de kayıtlı** — hangi izni
   neden istediğini altı ay sonra hatırlamanın tek yolu. Token'lar `sops` altında;
   düz metin yok (R-51), `.env` yok.
📁 `secrets/secrets.enc.yaml` · `packages/channels/src/oauth/`
✅ `sops exec-env` ile iki kanal da kimlik doğruluyor · `gitleaks` temiz
🧪 Token'ı düz metin bir dosyaya yaz → `gitleaks` + `repo-hygiene` reddediyor
💾 `feat(channels): meta ve linkedin OAuth` · `Refs: FAZ-7.5 · §9.2`

## 7.6 — Token yenileme işi — ilk gün    [ ]

📖 §9.2, §16 · R-70
🔗 7.5
🛠 Meta uzun ömürlü token **60 günde ölür**. Yenileme işi yayın hattından **önce** kurulur
   ve başarısızlığı **sessiz değil, bloklayıcıdır**. Sonraya bırakılan yenileme, ilk
   iki ay çalışan sonra sebepsiz duran bir sistem demektir — ve ilke 12 (bir ay ihmal
   edilse de çalışır) tam burada sınanır.
📁 `packages/channels/src/oauth/refresh.ts` · `scripts/doctor.sh`
✅ Yenileme işi elle tetiklendi → yeni token yazıldı, son kullanma tarihi güncellendi
🧪 Sahte süresi dolmuş token ile yayın dene → **bloklanıyor**, sessizce geçmiyor
💾 `feat(channels): token yenileme işi` · `Refs: FAZ-7.6 · §9.2`

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
