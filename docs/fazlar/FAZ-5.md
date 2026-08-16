# FAZ 5 — Hareket katmanı

**Amaç:** Görüşme öncesi gönderebileceğin gerçek bir demo videosu, kendi sesinle.
**Yöneten kararlar:** D-18, D-24, D-25
**Ön koşul:** FAZ 4 kapalı
**Çıkış kriteri:** Gerçek bir demo videosu üretildi ve izlendi · `ffprobe` h264/yuv420p/aac
doğruluyor · **tam kapsamlı test paketi burada çalıştırıldı** (LOOP§D.4 — daha önce değil)

---

## 5.1 — HyperFrames kurulumu ve Claude skill'leri    [x] 2026-08-16

📖 §7.4 · R-30 · D-25, D-194
📁 `motion/kanit/` · `scripts/golden-hareket.mjs`
✅ `npx hyperframes doctor` ZORUNLU kontrollerin hepsinde yeşil (optional olanlar
   D-194'te adıyla sayıldı) · örnek kompozisyon MP4 üretiyor · **`ĞÜŞİÖÇ ğüşıöç Ağrı
   İğne` metrikleri Playwright golden'ıyla eşleşiyor** (D-194: sınır ikili değil motor)
🧪 İkinci bir render motoru ekle → `chokepoints` (`chromium-baslatan`) kırmızı

## 5.2 — `frame.md` token köprüsü    [x] 2026-08-16

📖 §7.4, §4.1 · D-196
🔗 5.1 · FAZ-2.10
📁 `brand/brd_upcytech/derived-tokens/frame.md` · `scripts/tokens.mjs`
✅ `frame.md` token'lardan ÜRETİLİYOR — renk rolleri markadan, tip ölçeği/boşluk/
   hareket süreleri `theme.css`ten · `just gate tokens` sürüklenmeyi yakalıyor
🧪 Elle düzenle, üreteci çalıştır → değişiklik kayboluyor (R-65) · `theme.css` deseni
   bayatlarsa üreteç SESSİZ geçmiyor, düşüyor

## 5.3 — Marka hareket kütüphanesi    [x] 2026-08-16

📖 §7.4, §12.7 · D-197
🔗 5.2
📁 `motion/components/marka.css` · `motion/kanit/index.html`
✅ Altı bileşen de 320 ms altında ve **düz renk değeri içermiyor** (marka-bağımsız) ·
   golden metrik sabit: 3/3 boyut + iki Chromium karşılaştırması yeşil
🧪 400 ms'lik geçiş ekle → `ui-tema` kırmızı · marka rengi göm → `ui-tema` kırmızı

## 5.4 — `audio.tts` şerit sözleşmesi    [x] 2026-08-16

📖 §7.5, §8.2 · R-40 · D-18, D-198
🔗 FAZ-3.5
📁 `registry/providers/chatterbox.provider.yaml` · `packages/providers/src/audio/`
✅ Üç sağlayıcı tanımlı (yerel MIT · bedava bulut · premium) · dördüncü şerit "kendi
   kaydın" sağlayıcı DEĞİL, dosya girdisi · `free_tier_commercial` beyanı zorunlu
🧪 ElevenLabs'ı bedava şeride koy → `providers` lisans gerekçesiyle reddediyor ·
   beyanı sil → "bilmiyorum ≠ serbest" gerekçesiyle reddediyor

## 5.4b — Canlı ses üretimi    [ ] BLOKE: insan

📖 §7.5 · D-18
🔗 5.4
✅ Dört şerit de gerçekten ses üretiyor · `just plan` dördünü aday listeliyor
⛔ `chatterbox` ağırlıkları (~2 GB) indirilmedi · `GEMINI_API_KEY` ve
   `ELEVENLABS_API_KEY` yok · premium şerit gerçek para harcıyor. → V-21

## 5.5 — `.ass` yazıcısı ve transkript kapısı    [x] 2026-08-16

📖 §7.5, §11.4 · R-32 · D-199
🔗 5.4
📁 `packages/render/src/captions/ass.ts` · `packages/kernel/src/manifest.ts`
✅ `.ass` karaoke üretiliyor (Türkçe kaçışsız, `\k` kelime süresi) · transkript onayı
   olmadan `isPublishable` FALSE — kural yayın yükleminin İÇİNDE
🧪 Kuralı kaldır → 3 test kırmızı · altyazısız çalıştırma kapıyı tetiklemiyor

## 5.5b — Gerçek ASR bağlantısı    [ ] BLOKE: insan

📖 §7.5
🔗 5.5
✅ Gerçek sesten kelime zamanları üretiliyor ve `.ass`e dönüyor
⛔ `whisper.cpp` kurulu değil, `GROQ_API_KEY` yer tutucu. → V-22

## 5.6 — Demo yakalama (Xvfb + x11grab)    [x] 2026-08-16

📖 §7.7 · D-24, D-200
🔗 5.3
📁 `packages/render/src/capture/timeline.ts` · `packages/render/src/capture/ffmpeg.ts`
✅ Xvfb 1920×1080x24 + üretilen argümanlarla gerçek yakalama: **h264 · yuv420p ·
   1920×1080 · 60 fps** · `timeline.json` şeması tıklama kutularını ve bölüm
   işaretlerini taşıyor, zoom odağı hedefin merkezinden türüyor
🧪 `recordVideo` kullanmayı dene → `chokepoints` (`ekran-kaydedici`) reddediyor

## 5.7 — `demo-video` pipeline    [x] 2026-08-16

📖 §10 · D-13, D-201, D-202
🔗 5.6
📁 `registry/pipelines/demo-video.pipeline.yaml` · `demos/upcyman/`
✅ Kalıcı üçlü kuruldu; anlatı metnini düzenlemek yeniden KAYIT gerektirmiyor ·
   bölüm işaretleri anlatı bölümleriyle eşleşiyor (test) · `just plan demo-video`
   üç insan kapısı ve dört ücretli adım basıyor · **V-20 kapandı: render 1dk34sn → 8,3sn**
🧪 `timeline.json`'suz render dene → `missing_file` (BOŞ zaman çizgisinden AYRI hata)

## 5.8 — `reels` — deterministik türetme    [ ]

📖 §10, §9.1
🔗 5.7
🛠 Demo bölüm işaretlerinden **deterministik** türetme. **Otomatik klipleyici YOK**:
   konuşma enerjisiyle çalışır, sessiz ekran kaydında işe yaramaz.
   Reels güvenli alanı (%14/%35/%6) render öncesi uygulanır.
📁 `registry/pipelines/reels.pipeline.yaml`
✅ Aynı demodan aynı reels üretiliyor (deterministik) · güvenli alan ihlali yok
🧪 Bölüm işareti olmayan bir demo ver → türetme reddediliyor, tahmin YAPMIYOR
💾 `feat(cli): reels deterministik türetme` · `Refs: FAZ-5.8 · §10`

## 5.9 — `explainer-video`    [ ]

📖 §10
🔗 5.3
🛠 Aynı hareket kütüphanesi, çok en-boy render (16:9 · 9:16 · 1:1). Tek kompozisyon,
   üç çıktı — üç ayrı kompozisyon üç ayrı bakım yüküdür.
📁 `registry/pipelines/explainer-video.pipeline.yaml`
✅ Üç en-boy da üretiliyor · üçünde de tipografi golden'ı yeşil
🧪 9:16'da taşan bir başlık ver → otomatik bölünüyor, küçültülmüyor (R-23)
💾 `feat(cli): explainer-video çok en-boy` · `Refs: FAZ-5.9 · §10`

## 5.10 — Tam kapsamlı test paketi    [ ]

📖 §15 · R-71 · 🔗 LOOP§D
🛠 Döngü protokolünün öngördüğü **tek geniş test turu**. FAZ-1.10'da kurulan altyapı
   burada tam koşar: birim · kontrat (cassette) · golden · değerlendirme.
   Daha önce koşulmaz çünkü her turda tam paket koşturmak turu yavaşlatır ve yavaş
   kapı atlanan kapıdır.
📁 `just verify` · `just golden`
✅ `just verify` yeşil ve golden ayağı **gerçek metrik** üretiyor (artık no-op değil)
🧪 **Her BLOCKING kuralı kasten ihlal et** ve kırmızıya döndüğünü gör (R-71) —
   yeşil paket hiçbir şey kanıtlamaz
💾 `test(repo): tam kapsamlı doğrulama turu` · `Refs: FAZ-5.10 · §15`
