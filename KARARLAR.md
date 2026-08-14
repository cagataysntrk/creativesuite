# KARARLAR

Döngünün ve insanın aldığı **her** karar. Tarih · karar · gerekçe.
Append-only: bir karar silinmez, `reddedildi` işaretlenir ve yerine geçen belirtilir.
Sonda `V-nn` doğrulama borçları (🔴) durur.

Aktif defter 600 satırda tutulur; kapanmış kararlar `docs/kararlar/ARSIV-<yyyy>.md`'ye
devredilir. `citations` kapısı her `D-nn`'in ikisinden **tam olarak birinde** çözüldüğünü
doğrular.

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

## D-43 — GateGuard fact-force kancası kapatıldı
2026-08-14 · `.claude/settings.local.json` içinde `ECC_DISABLED_HOOKS`.
**Neden:** her yeni dosyada dört maddelik beyan istiyordu; FAZ 0 ~30 dosya üretiyor ve
beyan, planda zaten yazılı olanı tekrar ettiriyordu. Her dosya onaylı bir faz adımından
geliyor, her adımın ✅ kriteri var, her commit hook'tan geçiyor.
**Alternatif:** açık bırakıp her dosyada beyan vermek — ~30 ekstra tur.
**Geri alma maliyeti:** tek satır silmek.

## D-44 — commit-msg kapısı 0.C.7'den 0.A.1c'ye çekildi
2026-08-14 · **Neden:** kural ancak zorlandığında gerçektir. 0.C.7'ye kadar beklemek
onlarca denetimsiz commit demekti. Ayrıca `.git/hooks/` yerine `.githooks/` seçildi —
`.git/hooks/` commit'lenmez ve taze klonda kural kaybolur.
**Geri alma maliyeti:** yok, saf kazanç.

---

# 🔴 Doğrulama borçları

Her biri bir faz adımına bağlı. Kapanınca tarih ve kanıtla kapatılır.

## V-01 — Remotion Creators koltuk fiyatı
JS widget'ta, statik HTML'de yok. HyperFrames kararını (D-25) teyit için. → FAZ-0.D.3

## V-02 — Hangi latin-ext font lisanslanacak
Marka kararı, FAZ 2 keşfiyle bağlantılı. → FAZ-0.A.5

## V-03 — rjsf'nin JSON Schema 2020-12 kapsaması
Kısıtlı profil bunu atlatmak için tasarlandı, yine de spike ile doğrula. → FAZ-0.D.4

## V-04 — fal endpoint-başına OpenAPI URL'i
Belgelenmiş public arayüz mü? Elle tanımlayıcı yedeği her hâlükârda zorunlu. → FAZ-0.D.5

## V-05 — Anthropic yapılandırılmış çıktı alt kümesi
OpenAI'ninkiyle aynı mı? Derleyici daha katı olana yazıldı, CI'da gerçek çağrıyla doğrula.

## V-06 — `dima` ürün mü modül mü
"dima by Upcytech" onaylı-marka modeli doğru mu? Yanlış karar sonradan MAJOR sürüm
değişikliği demek.

## V-07 — Era 1'in dikeyi
Kanıt otomotiv tedarik/Bursa'yı işaret ediyor ama bu üçüncü taraf verisinden çıkarım,
gerçek satış pipeline'ından değil. Hipotez olarak tohumla, 10 gerçek görüşmeden sonra üzerine yaz.

## V-08 — Kuruluş tarihi çelişkisi
Sicil 3 Tem 2025 · LinkedIn 2022 · site "2021'den beri". Tek doğruya bağlan.

## V-09 — KAP resmî REST API şartları
Ticari kullanıma uygun mu? Şartlar PDF'i "Hizmete Özel".

## V-10 — Türk hukukçu
KVKK aydınlatma/açık rıza metinleri, sayısal performans iddialarının Reklam Kurulu
açısından durumu, sınır ötesi veri aktarımı beyanı.

## V-11 — Run bağlam anlık görüntülerinin saklama süresi
Manifest sonsuza, bağlam N gün. N ilk yüz çalıştırmadan **önce** belirlenir.
