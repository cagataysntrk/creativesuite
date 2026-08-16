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

## 5.2 — `motion/frame.md`    [ ]

📖 §7.4, §4.1
🔗 5.1 · FAZ-2.10
🛠 Marka token'ları **kamera bağlamına** çevrilir: renk rampası, tip ölçeği ve boşluk
   birimleri hareket diline eşlenir. Tek kaynak yine `brand/<brand_id>/tokens/` —
   hareket için ikinci bir palet tanımlamak, iki marka gerçeği demektir.
📁 `motion/frame.md`
✅ `frame.md` token'lardan ÜRETİLİYOR · `git diff --exit-code` boş
🧪 Elle düzenle, üreteci çalıştır → değişiklik kayboluyor (R-65)
💾 `feat(motion): frame.md token köprüsü` · `Refs: FAZ-5.2 · §7.4`

## 5.3 — Marka hareket kütüphanesi    [ ]

📖 §7.4, §12.7
🔗 5.2
🛠 intro/outro · lower-third · `ZoomToTarget` · `SyntheticCursor` · `ClickRipple` ·
   `BrowserChrome`. **Hareket beyaz listesi** (§12.7): süre 320 ms'yi geçmez; sayı
   animasyonu, liste yeniden sıralama, skeleton parıltısı, grafik çizilme YASAK.
📁 `motion/components/`
✅ Her bileşen 320 ms altında · golden metrik sabit
🧪 400 ms'lik bir geçiş ekle → `ui-lint` kırmızı
💾 `feat(motion): marka hareket kütüphanesi` · `Refs: FAZ-5.3 · §7.4`

## 5.4 — `GENERATE` yeteneği `"audio.tts"` — dört şerit    [ ]

📖 §7.5, §8.2 · R-40 · D-18
🔗 FAZ-3.5
🛠 **Dördü de UI'dan seçilebilir** (D-18): kendi kaydın (dosya girdisi — fiil değil) ·
   Chatterbox klonu (yerel, MIT) · Gemini TTS (bedava şerit) · ElevenLabs (premium).
   ⚠ **ElevenLabs bedava katmanının TİCARİ LİSANSI YOK** — bedava şeride konulamaz.
📁 `packages/providers/src/audio/`
✅ Dört şerit de ses üretiyor · `just plan` dördünü aday listeliyor
🧪 ElevenLabs'ı bedava şeride koy → `providers` kapısı lisans gerekçesiyle reddediyor
💾 `feat(providers): audio.tts dört şerit` · `Refs: FAZ-5.4 · §7.5`

## 5.5 — Altyazı ve ZORUNLU transkript kapısı    [ ]

📖 §7.5, §11.4 · R-32
🔗 5.4
🛠 Groq whisper-large-v3 / yerel whisper.cpp → kelime bazlı zamanlama → `.ass` karaoke.
   **İnsan transkript kapısı ATLANAMAZ**: Türkçe WER %10-25 ve yanlış bir altyazı,
   söylemediğin bir şeyi söylemiş gibi gösterir — düzeltilemez bir iddia.
📁 `packages/render/src/captions/`
✅ `.ass` altyazı üretiliyor · transkript kapısı olmadan yayın YOK
🧪 Transkript kapısını atlamayı dene → `PUBLISH` reddediyor
💾 `feat(render): altyazı ve transkript kapısı` · `Refs: FAZ-5.5 · §7.5`

## 5.6 — Demo yakalama (Xvfb + x11grab)    [ ]

📖 §7.7 · D-24
🔗 5.3
🛠 Xvfb + headed Chromium 1920×1080 + `ffmpeg -f x11grab -framerate 60 -draw_mouse 0`.
   Playwright script `timeline.json` YAZAR — tıklama hedefleri **piksel oluşmadan önce**
   bilinir; sonradan görüntüden hedef aramak kırılgan ve yavaştır.
   ⚠ Playwright `recordVideo` REDDEDİLDİ: sessizce 800×800 WebM'e düşüyor.
📁 `packages/render/src/capture/` · `demos/<product>/`
✅ 1920×1080 MP4 üretiliyor · `timeline.json` tıklama hedefleriyle dolu
🧪 `recordVideo` kullanmayı dene → kapı reddediyor (çözünürlük sessizce düşer)
💾 `feat(render): xvfb demo yakalama` · `Refs: FAZ-5.6 · §7.7`

## 5.7 — `demo-video` pipeline    [ ]

📖 §10 · D-13
🔗 5.6
🛠 **Demo bir SÜRÜMLÜ ARTEFAKTTIR**, MP4 yalnız build çıktısı. Kalıcı üçlü:
   `demo-script.ts` (Playwright akışı) · `timeline.json` · `narration.tr.json`.
   Ürün arayüzü değişince script güncellenir, video **yeniden render edilir** — yeniden
   kayıt YAPILMAZ.
📁 `registry/pipelines/demo-video.pipeline.yaml` · `demos/<product>/`
✅ Metni düzenle → yeniden render, yeni kayıt gerekmiyor
🧪 `timeline.json`'suz render dene → hata (hedefler bilinmeden zoom yapılamaz)
💾 `feat(cli): demo-video pipeline` · `Refs: FAZ-5.7 · §10`

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
