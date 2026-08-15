# KARARLAR — ARŞİV 2026

Kapanmış kararlar. **Aktif defter `KARARLAR.md`'dir**; burası yalnız tarihsel kayıttır.

Neden ayrı dosya: `KARARLAR.md` append-only ve satır tavanı 600 (R-63). Tavanı
yapısal çözmenin yolu budur — kapanmış kararlar devredilir, aktif defter okunabilir
kalır. `citations` kapısı her `D-nn`'in **ikisinden tam olarak birinde** çözüldüğünü
doğrular; ikisinde birden olması da hatadır.

Buradaki kararlar **hâlâ bağlayıcıdır** — arşiv, iptal değil. Bir kararı geçersiz
kılmak için `KARARLAR.md`'de yeni bir `D-nn` yazılır ve eskisi `**Durum:** reddedildi`
ile işaretlenir.

Bu dosyadaki kararlar planlama döneminde (2026-08-14) alındı ve FAZ 0 ile FAZ 1
boyunca uygulandı.

---

## D-1 — Sistem şekli
Git repo (doğruluk kaynağı) + **yerel** komuta merkezi.
**Neden:** sunucu maliyeti yok, veri sende, git geçmişi bedava sürümleme.

## D-2 — Çift şerit maliyet modeli
Her adım hem bedava hem premium şeritte çalışır; çalıştırma anında seçilir, maliyet
önceden gösterilir.

## D-3 — Kademeli yayınlama
Önce onay kuyruğu, sonra API otomasyonu. Meta App Review kendi işletmen için gerekmiyor.

## D-4 — Öncelikli çıktılar
IG (post/carousel/Reels) · LinkedIn (post/döküman/video) · şirkete özel deck ·
görüşme öncesi demo video · tanıtım ve reklam içerikleri.

## D-5 — Bilgi tabanı doldurma
Önce taslak, sonra boşluklar için röportaj.

## D-6 — Marka DNA'sı yeniden çalıştırılabilir
Tek seferlik dosya değil, sürümlü motor. "Bir yıl sonra sıfırdan kurabileyim."

## D-7 — Hibrit UI
Koyu/yoğun kabuk + ferah tam-ekran kreatif yüzeyler.

## D-8 — Hibrit agent motoru
Orkestrasyon TypeScript'te, akıl gerektiren adımlar headless Claude Code.

## D-9 — Çok markalı, çok dikeyli — baştan
`dima` ve gelecek ürün markaları. Sonradan açmak çok pahalı. → D-39

## D-10 — Kademeli proaktiflik
Önce komutla, sonra haftalık öneri. Erken proaktiflik gürültü yaratır.

## D-11 — Şema = veri
Varlık tipleri ve alanlar veri, kod değil. Kullanıcı çalışma anında genişletir.

## D-12 — Hafıza yönetimi
Agent'ın bildiği her şey görülebilir, düzeltilebilir, sabitlenebilir, emekliye ayrılabilir.

## D-13 — Medya çekirdeği önce
FAZ 3 = görsel motoru → IG post + carousel uçtan uca. En zor ortak payda önce.

## D-14 — Dil ayrımı
İçerik ve belgeler Türkçe; kod, şema anahtarları, klasör adları İngilizce. → D-37

## D-15 — Anayasa
`docs/ANAYASA.md` (§ numaralı) + `docs/fazlar/FAZ-0..9.md` + `docs/research/`.
Ayrı yol-haritası dosyası **yok** — ikinci bir liste kaçınılmaz olarak bayatlar.

## D-16 — Gizlilik kısıtı yok
Ürün satılmayacak, iç kullanım. Bedava katmanlar her pipeline'da açık.

## D-17 — Bütçe tavanı UI'dan ayarlanır
Sabit sayı yok: aylık / çalıştırma / pipeline bazında.

## D-18 — Esnek seslendirme
Kendi kaydın · klonlanmış sesin · bedava TTS · premium TTS — dördü de seçilebilir.

## D-19 — Üç erişim yüzeyi
Yerel PC + Tailscale + Telegram botu.

## D-20 — 360 derece esneklik
Hiçbir karar koda gömülmez. Kullanıcının en güçlü tekrarlanan talebi.

## D-21 — Renderer sahipliği
Üç yüzey de bizim. Hazır üretici (Gamma/Canva/Presenton) prospect'e giden hiçbir şeye
dokunmaz — 2026'da müşteriler o çıktıyı tanıyor ve "size özel yazılım yaparız" iddiasını
çürütüyor.

## D-22 — Türkçe sert kapıları
Görsel modeline Türkçe metin çizdirilmez · diacritics doğrulayıcı bloklar ·
çıplak `.toUpperCase()` yasak.

## D-23 — Sentetik insan yasağı
`containsSyntheticPerson=false` kod seviyesinde iddia. Reklam Yönetmeliği Md. 27/12,
1 Ağustos 2026'dan yürürlükte.

## D-24 — Tek render motoru
Headless Chromium. Satori reddedildi: ligature/kerning/WOFF2 yok — ikinci CSS alt kümesi
ikinci Türkçe tipografi hata modu demek.

## D-25 — Hareket katmanı HyperFrames
Apache 2.0. Remotion reddedildi: ücretsiz lisansı ≤3 çalışan, şirket 6 kişi.
Revideo (MIT) belgelenmiş yedek.

## D-26 — Komuta merkezi Vite + Hono
Next.js reddedildi: uzun süren alt süreçler, chokidar registry izleme ve SSE App
Router'da zorlama; SEO ihtiyacı yok.

## D-27 — Dosya = doğruluk, SQLite = indeks
Postgres yok, vektör DB yok. İndeks türetilebilir olduğu için şema değişimi veri kaybı
değil, rahatsızlık.

## D-28 — SQLite iş kuyruğu
Yerel render'lar alt süreç, dağıtık iş akışı değil.

## D-29 — Dört halka
Contracts · Kernel · Registry · Corpus · Derived. D-11 ve D-20'yi teknik olarak mümkün
kılan tek yapı.

## D-30 — Era = git tag
Dönem klasörü yok. Klasör kopyalama regenerasyonu "dosya ekleme"ye çevirir, `git diff`
yan yana gösteremez, inceleme ölür.

## D-31 — Agent önerir, insan uygular
Her agent yazımı `status: draft` + branch; onay = git commit.

## D-32 — Yetenek bazlı sağlayıcı seçimi
Pipeline'lar yetenek ister, model ID'si değil. Model ID'si pipeline'da = sağlayıcı
öldüğü gün kırılan varsayım.

## D-33 — Yerel MCP yüzeyi (aday)
Hono sunucusu corpus ve aktif çalıştırmayı MCP olarak açar. FAZ-8.9'da karara bağlanır.
Palmier Pro deseninden.

## D-34 — Private repo + imzasız commit
Repo kalıcı olarak private. Commit mesajlarında AI atıf footer'ı yasak.
`commit-msg` kapısı zorlar. **Kullanıcının açık talimatı.**

## D-35 — Dokuz fiil, tek yan etki
RESOLVE · SELECT · COMPOSE · GENERATE · RENDER · VALIDATE · PROPOSE · PUBLISH · INGEST.
`image/video/tts.generate` ayrımı iptal (yetenek alanında zaten kodlu). `human.approve`
fiil değil, durum geçişi. `script.run` kaldırıldı: kapatılamayan güvenlik deliğiydi.

## D-36 — Para = bigint USD mikro-birim
1.000.000n = $1.00. Kuruş değil, float hiç değil. Görsel başına $0.0035 minor-unit'te
hassasiyet kaybediyor. TRY yalnız raporda, sabitlenmiş TCMB anlık görüntüsüyle.

## D-37 — Belge dili Türkçe
ANAYASA · KURALLAR · KARARLAR · DURUM · FAZ dosyaları · CLAUDE.md Türkçe.
İngilizce kalanlar: tanımlayıcılar, şema anahtarları, log olay adları, enum değerleri,
dosya adları, commit tipleri, hata `code` alanları.
**Sentez "dokümanlar İngilizce olsun" dedi — reddedildi.** Belgeleri kullanıcı okuyacak;
gerçek hata Türkçe'nin enum değerine sızmasıdır, nesre değil.

## D-38 — Ring 3 ikiye ayrılır
`derived/index` silinip yeniden kurulabilir · `derived/runs` **türetilemez**, append-only,
yedeklenir · `derived/blobs` içerik-adresli. Çalıştırma defteri corpus'tan üretilemez.

## D-39 — `brand_id` birinci sınıf eksen
Zarfta sistem alanı · `brand/<brand_id>/…` · retrieval yükleminde ilk koşul ·
`(brand_id, era_id)` çalıştırma parametresi, dosyadan okunan global durum değil.
**Denetim bulgusu:** D-9 çok markalılık iddia ediyordu ama marka ekseni hiç yoktu.

## D-40 — Dokuzuncu fiil `INGEST`
Yan etki sınıfı `network-source`. Dış kaynak çeken tek fiil; çıktısı daima karantinalı
`untrusted_input`'a düşer. Metered.
**Neden:** prospect araştırma şelalesi hiçbir fiile eşlenmiyordu; kaçak giren I/O ne
maliyetlenir, ne zaman aşımına uğrar, ne karantinaya alınır.

## D-41 — Zarf = sistem alanı
Zarfın alanları sabit sistem alanlarıdır, kernel okur. Kullanıcının tanımladığı her şey
`attributes` altında ve kernel'e kapalı. Retrieval yüklemi bu alanları okumak zorunda;
`attributes` altında olsalardı yüklem kendi yasasını çiğnerdi.

## D-42 — Açık kalemler `V-nn`
Doğrulama borçları `R-nn` değil `V-nn`. `R-nn` zaten KURALLAR kuralı demek; aynı ön ek
iki hedefe işaret ederse atıf kapısı yanlış belgeyi doğrular.
