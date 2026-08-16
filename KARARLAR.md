# KARARLAR

Döngünün ve insanın aldığı **her** karar. Tarih · karar · gerekçe.
Append-only: bir karar silinmez. Reddedilen karar gövdesine **tam olarak** şu satır
eklenir ve yerine geçen belirtilir:

    **Durum:** reddedildi → D-nn

`citations` kapısı bu satırı arar; gövdede geçen "reddedildi" kelimesi yetmez
(bir kararın metninde "Remotion reddedildi" yazması kararın kendisini geçersiz kılmaz).
Sonda `V-nn` doğrulama borçları (🔴) durur.

Aktif defter 600 satırda tutulur; kapanmış kararlar `docs/kararlar/ARSIV-<yyyy>.md`'ye
devredilir. `citations` kapısı her `D-nn`'in ikisinden **tam olarak birinde** çözüldüğünü
doğrular.

---
## V-01 — Remotion lisansı ✅ KAPANDI (2026-08-15, D-80)
Bedava lisans "up to 3 employees" (LICENSE.md), şirket 6 kişi. Bizim kullanımımız
*Automators* katmanı: **$100/ay asgari**. D-25 teyit edildi. → FAZ-0.D.3

## V-02 — Hangi latin-ext font lisanslanacak
Marka kararı, FAZ 2 keşfiyle bağlantılı. → FAZ-0.A.5

## V-03 — rjsf'nin JSON Schema 2020-12 kapsaması
Kısıtlı profil bunu atlatmak için tasarlandı, yine de spike ile doğrula. → FAZ-0.D.4

## V-04 — fal endpoint-başına OpenAPI URL'i ✅ KAPANDI (2026-08-15, D-99)
`https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=<id>` → HTTP 200,
**kimlik doğrulamasız**, `openapi: 3.0.4`. Fixture repoda:
`packages/providers/test-fixtures/fal-flux-dev.openapi.json`. → FAZ-3.4

## V-05 — Anthropic yapılandırılmış çıktı alt kümesi
OpenAI'ninkiyle aynı mı? Derleyici daha katı olana yazıldı, CI'da gerçek çağrıyla doğrula. → FAZ-1.4

## V-06 — `dima` ürün mü modül mü ✅ VERİ MODELİ KAPANDI (2026-08-15, D-84)
`dima` **ayrı marka ekseni** olarak modellendi (token kalıtımıyla). Pazara sunum adı
("dima by Upcytech" mi bağımsız mı) veri modelini DEĞİŞTİRMİYOR ve kullanıcıya
bırakıldı. → FAZ-2.11

## V-07 — Era 1'in dikeyi
Kanıt otomotiv tedarik/Bursa'yı işaret ediyor ama bu üçüncü taraf verisinden çıkarım,
gerçek satış pipeline'ından değil. Hipotez olarak tohumla, 10 gerçek görüşmeden sonra üzerine yaz. → FAZ-2.9

## V-08 — Kuruluş tarihi çelişkisi ✅ KAPANDI (2026-08-15, D-82)
**3 Temmuz 2025** tek doğrudur — ticaret sicili BELGELİDİR, diğer ikisi beyandır.
LinkedIn "2022" ve upcymarket.com "2021'den beri" düzeltilecek. → FAZ-2.9

## V-09 — KAP resmî REST API şartları
Ticari kullanıma uygun mu? Şartlar PDF'i "Hizmete Özel". → FAZ-6.5

## V-10 — Türk hukukçu
KVKK aydınlatma/açık rıza metinleri, sayısal performans iddialarının Reklam Kurulu
açısından durumu, sınır ötesi veri aktarımı beyanı. → FAZ-8.6

## V-11 — Run bağlam anlık görüntülerinin saklama süresi ✅ KAPANDI
Manifest sonsuza, bağlam N gün. **N = 90** (2026-08-15, FAZ-1.9). Gerekçe D-63'te.

## V-17 — Md. 27/12 ifşası makine-okunur DEĞİL
Damga `Upcytech:*` özel `iTXt` anahtarları taşıyor; hiçbir platform bunu okumaz.
`aiGenerated` bayrağı repo içinde denetlenebilir ama dışarıya bir şey söylemiyor.
Platform-tarafı ifşa (Meta/LinkedIn "AI-generated" işareti) FAZ 7'nin işi. → FAZ-7.2

## V-19 — +%30 sahte-yerelleştirme turu GÖRSEL olarak ölçülmedi
R-23'ün yazılı hâli (`turkce-genisleme` kapısı) zorlanıyor: sabit genişlik yok, kırpma
tasarımı yok. Ama "gerçek render'da hiçbir yerde kırpma yok" ölçümü YAPILMADI — bir DOM
harness'ı ister (jsdom + testing-library, iki bağımlılık, R-75). Ölçüm gelene kadar
FAZ 4'ün bu çıkış kriteri **karşılanmadı** sayılır. → FAZ-9.2

## V-20 — HyperFrames render'ı 45 sn boşuna bekliyor ✅ KAPANDI
Beklenen `window.__hf`ti, `__timelines` değil (D-201). Kompozisyonlarımız player
runtime'ı çalıştırmıyor; `--player-ready-timeout 2000` ile **1 dk 34 sn → 8,3 sn**.

## V-21 — TTS anahtarları ve model ağırlıkları yok, ses ÜRETİLMEDİ
Üç sağlayıcı da `enabled: false`: `chatterbox` model ağırlıkları indirilmedi (~2 GB),
`gemini-tts` `GEMINI_API_KEY` yok, `elevenlabs` `ELEVENLABS_API_KEY` yok ve premium
şerit gerçek para harcıyor. Sözleşme yazıldı ve test edildi (lisans kuralı iki ihlalle
kırmızıya döndürüldü); kalan iş yalnız bağlantı. → FAZ-5.4b

## V-22 — ASR bağlantısı yok: gerçek ses transkript edilmedi
Yerel `whisper.cpp` kurulu değil ve `GROQ_API_KEY` yer tutucu. `.ass` yazıcısı ve
transkript kapısı ASR'siz yazıldı ve test edildi (ikisi de saf); kalan iş yalnız
kelime zamanlarını üreten bağlantı. → FAZ-5.5b

## V-18 — Tailscale kurulu değil, Telegram token'ı yer tutucu
`tailscale` binary yok (sudo kurulum + hesap girişi) ve `TELEGRAM_BOT_TOKEN`
`doldurulacak`. Bot mantığı ve yüzey sınırı yazılmış, test edilmiş; kalan iş yalnız
gerçek erişim. FAZ-4.13b bu borca bağlı. **Bu borç önce yanlışlıkla `V-17` diye
anılıyordu** — o kimlik Md. 27/12 ifşasına ait; `citations` kapısı yalnız hedefin
VAR olduğunu denetliyor, anlam eşleşmesini değil (2026-08-16 denetimi). → FAZ-4.13b

## V-16 — fal ve Cloudflare anahtarları yok, canlı üretim DOĞRULANMADI
İki görsel adaptörü de yazıldı ve cassette'lerle test edildi ama `FAL_KEY`,
`CF_ACCOUNT_ID`, `CF_API_TOKEN` `secrets.enc.yaml`da yok. Yani **gerçek bir görsel
henüz üretilmedi**; sözleşme, prompt kuralı ve HTTP şekli doğrulandı, sağlayıcının
gerçek davranışı doğrulanmadı. → FAZ-3.14 (ilk gerçek carousel)

## V-15 — `status()` kimliği ortamdan alamıyor
`ProviderAdapter.status(h)` yalnız tutamak alıyor; kimlik `ProviderContext`te ve o
yalnız `start()`e geçiyor. Bugün sorun değil (`providerCall` aynı süreçte poll ediyor),
ama süreçler arası devam (SIGKILL sonrası ayrı bir işlem) kimliksiz `status()`
çağıramaz. Sözleşme değişikliği gerektirir. → FAZ-3.14

## V-14 — Cloudflare bedava katman kota aşımı
"Bedava" ile "kotası bitince ne olur" ayrı sorular. Günlük nöron kotası aşıldığında
faturalama mı başlıyor, istek mi reddediliyor — ölçülmedi. `cost_formula: '0'` bu
yüzden `verified: false` bir anlık görüntüye bağlı. → FAZ-3.14

## V-13 — TCMB kuru doğrulanmadı
`registry/rates/tcmb-2026-08-15.json` elle girildi (`usdTry: 41.85`), TCMB XML'inden
doğrulanmadı. TRY yalnız GÖRÜNTÜDE kullanıldığı için (D-36) hesabı etkilemiyor —
ama gösterilen sayı yanlış olabilir ve `doğrulanmamış kur` etiketi bunu söylüyor.
→ FAZ-4.12 (Cost & Budget ekranı)

## V-12 — Aday dönem probe bake-off mekanizması
`brand/probes/` ile birden fazla aday dönemin yan yana karşılaştırılması. §12'nin sert
kuralı gereği **ilk yeniden üretim gerçekten acıtana kadar** kurulmaz. → FAZ-2.8

## D-193 — FAZ 4 ŞARTLI kapandı: iki çıkış kriteri karşılanmadı ve tikle örtülmedi
2026-08-16 · FAZ 4'ün yirmi adımının on dokuzu tikli, biri (`4.13b`) bilinçli
`BLOKE: insan`. Kapanış turunun altı bulgusu da kapatıldı (D-188…D-192). Ama **çıkış
kriterinin üç maddesinden ikisi karşılanmadı** ve bunu tikle örtmek, FAZ 3'te
reddettiğimiz şeyin (D-158) tekrarı olurdu:
1. *"Klavyeyle uçtan uca: ⌘K → seç → başlat → onayla"* — **başlat** artık bağlı
   (D-190), ama **onayla** hiç yürütülmedi: hiçbir çalıştırma insan kapısına ulaşmadı
   çünkü hepsi `2.9` blokajı yüzünden `bilgi-sec`te duruyor. Zincirin son halkası
   `3.14` koştuğu gün kapanır.
2. *"Tailscale üzerinden telefondan onay"* — `4.13b`, V-18.
3. *"+%30 sahte-yerelleştirmede kırpma yok"* — kuralın YAZILI hâli artık
   `turkce-genisleme` kapısıyla zorlanıyor (sabit genişlik yok, `text-overflow:
   ellipsis` yok; ikisi de kırmızıya döndürüldü). **Görsel ölçüm yapılmadı** ve V-19
   olarak açık duruyor.
**Karar:** FAZ 5'e geçilir. Üçünün de ortak özelliği dış bağımlılık ya da ayrı bir
altyapı olması — plan hatası değil, planın `V-nn` olarak zaten öngördüğü şeyler.
İkinci doğrulama turu AÇILMAZ (D-79): 1. tur bulguları kapandı, kalan her şey FAZ 9
denetim turlarının zaten aradığı sınıfta.

## D-194 — HyperFrames kendi Chrome'unu getiriyor: R-30 mekanizması değil AMACI zorlanır
2026-08-16 · `5.1`e başlarken ölçüldü: `hyperframes browser path` **puppeteer'ın**
Chrome'unu gösteriyor (`chrome-headless-shell 135.0.7049.114`), oysa `packages/render`
Playwright'ın **Chromium 141.0.7390.37**'sini kullanıyor. Altı ana sürüm fark.
`PUPPETEER_EXECUTABLE_PATH` ile yönlendirme denendi — **yok sayılıyor**, HyperFrames
kendi ikilisini çözüyor.
R-30 *"statik, döküman ve hareket aynı headless Chromium'u kullanır"* diyor ve D-25
HyperFrames'i tam da "Chrome + FFmpeg, yani tek motor korunuyor" diye seçmişti. Kural
lafzen ihlal ediliyor.
**Ama kuralın AMACI ikili sayısı değil:** gerekçesi *"ikinci CSS alt kümesi = ikinci
Türkçe tipografi hata modu"* ve hedefi Satori'ydi — ayrı bir CSS motoru, ligature ve
WOFF2 desteği olmayan. İki Chromium sürümü aynı CSS motorudur; risk farklı ve ölçülebilir:
**altı sürümlük font shaping / metrik kayması.** D-86 bu riski zaten bir kez yaşattı
(kendi kendine güncellenen snap Chromium golden metriği bozdu).
**Karar:** ikinci ikili KABUL EDİLİR, ama tipografik eşdeğerlik **kanıtlanmak zorunda**.
`ĞÜŞİÖÇ ğüşıöç Ağrı İğne` kanıt dizesi HyperFrames'te de render edilip metriklerinin
(glyph kutuları, satır sayısı, ilerleme genişliği, `notdef` = 0) Playwright golden'ıyla
karşılaştırılması `5.1`in kabul kriteri olur. Metrikler ayrışırsa hareket katmanı
kullanılamaz ve Revideo yedeğine (D-25) geçilir — karar o gün ölçüyle verilir, bugün
tahminle değil.
`hyperframes doctor` üç eksik bildiriyor, üçü de **optional** ve bu plana ait değil:
whisper-cpp (FAZ-5.5 kendi çözümünü seçer), Kokoro TTS ve MusicGen (D-18 seslendirme
şeritlerini sayıyor, ikisi de listede yok). Zorunlu kontrollerin hepsi yeşil.

## D-195 — İki Chromium AYNI tipografiyi veriyor: ölçüldü, varsayılmadı
2026-08-16 · D-194 hareket katmanını bir borca bağlamıştı: ikinci ikili ancak
tipografik eşdeğerlik KANITLANIRSA kabul. Ölçüm yapıldı ve **eşdeğerlik doğrulandı** —
Playwright Chromium 141.x ile HyperFrames Chrome 135.x, `ĞÜŞİÖÇ ğüşıöç Ağrı İğne`
dizesinde aynı glyph kutularını, aynı ilerleme genişliklerini ve **her ikisinde de
sıfır eksik glyph** veriyor.
**Aynı ölçüm kodu iki ikilide koştu.** `measureGolden` bir `executablePath` alıyor ve
başlatma yine `browser.ts`te — `chromium-baslatan` darboğazı ikinci bir başlatma
NOKTASINI değil ikinci bir başlatma DOSYASINI yasaklıyor. İkinci bir ölçüm yazmak
soruyu cevaplanamaz yapardı: farkın ölçümden mi motordan mı geldiği bilinemezdi.
`golden-hareket` kapısı `GROUP: all` (iki tarayıcı başlatıyor, `just check`i
yavaşlatmamalı) ve iki ihlalle kırmızıya döndürüldü: hareket ölçümünün fontunu
monospace'e zorlamak **68 eksik glyph** verdi — yani Türkçe glyph'leri taşıyan şey
marka fontu ve karşılaştırma gerçekten canlı; olmayan bir ikili yolu da reddediliyor.
Örnek kompozisyon render edildi: **h264 · yuv420p · 1920×1080 · 30fps · 10 sn**,
10,7 saniyede. §7.4'ün "build adımı yok, `index.html` olduğu gibi oynar" iddiası
doğrulandı.
**İki küçük düzeltme:** `hyperframes init` iskeleti kendi `CLAUDE.md` ve `AGENTS.md`
dosyalarını bırakıyor — talimatın ikinci kaynağı olurdu, silindi. `motion/*/renders/`
gitignore'landı: MP4 build çıktısıdır, kalıcı varlık `index.html`dir (§4c).

## D-196 — `frame.md` markaya ait, `motion/`e değil; ve iki kaynağı yan yana getirir
2026-08-16 · FAZ-5.2 dosyası `📁 motion/frame.md` diyordu. Gerçek yer
`brand/<brand_id>/derived-tokens/frame.md` ve bu **daha doğru**: dosya renk rollerini
taşıyor, renk rolleri markaya ait ve repoda iki marka var (`brd_upcytech`, `brd_dima`).
`motion/` altında tek bir `frame.md`, "aktif marka" diye global bir duruma bağlanırdı —
D-39'un tam olarak kapattığı delik.
**Dosya İKİ kaynağı yan yana getiriyor, kopyalamıyor:** renk rolleri `brand/<id>/tokens/`
(markaya ait), tip ölçeği · boşluk · hareket süreleri `packages/ui/src/theme.css`
(sisteme ait). Ayrım keyfi değil — kabuk marka-NÖTR (§4b) ve her markanın kendi tip
ölçeğini tanımlaması iki tasarım sistemi demek olurdu.
**Üreteçte bulunan iki hata:**
1. Süreler **iki kez** çıkıyordu: `@media (prefers-reduced-motion)` bloğu onları `0ms`e
   çeviriyor ve regex ikisini de yakaladı. Tabloda aynı değişken hem `320ms` hem `0ms`
   göründü — kompozisyon yazarı için cevabı olmayan bir soru. İlk tanım kazanıyor ve
   **ezme gizlenmiyor**: ayrı bir cümle olarak dosyada yazıyor.
2. Bir regex `theme.css` yeniden biçimlendiğinde sessizce hiçbir şey bulur ve `frame.md`
   boş tabloyla üretilirdi. Artık boş çıkarım üreteci **düşürüyor** — ihlal testiyle
   doğrulandı (`--size-*` → `--typescale-*` yeniden adlandırıldı, üreteç düştü).

## D-197 — Hareket kütüphanesi marka-BAĞIMSIZ; ve iskeletin getirdiği iki şey atıldı
2026-08-16 · `motion/components/marka.css` altı bileşeni taşıyor (intro/outro,
lower-third, `ZoomToTarget`, `SyntheticCursor`, `ClickRipple`, `BrowserChrome`) ve
**tek bir renk değeri, tek bir süre sayısı içermiyor** — yalnız `var(--role-*)` ve
`var(--dur-*)`. Marka kompozisyona `tokens.css` olarak GELİR (§4.1); bu yüzden aynı
kütüphane `brd_upcytech` ve `brd_dima` için değişmeden çalışır.
**`ui-tema` kapısı `motion/`ü de tarıyor artık.** Taramasaydı 320 ms tavanı kabukta
zorlanır, VİDEODA zorlanmazdı — ve videoyu prospect izliyor. 400 ms'lik bir geçişle
kırmızıya döndürüldü.
**Yeni kural: düz renk değeri yasak.** Kütüphanenin tüm iddiası marka-bağımsız olmak
ve bunu hiçbir kapı denetlemiyordu (ihlal testi hex'i geçirdi). Artık elle yazılan
hiçbir CSS `#hex`/`rgb()`/`oklch()` içeremez; TEK istisna `box-shadow` — §12.1 gölgeyi
yalnız `[data-elevation="overlay"]`de meşru sayıyor ve o bir yükseklik aracı, marka
rengi değil. İki yönde de kırmızıya döndürüldü.
**İskeletin getirdiği iki şey atıldı:** `hyperframes init` kompozisyonu CDN'den GSAP
çekiyordu — render anında ağ çağrısı, ve bir CDN kesintisi hareket katmanını tamamen
durdurur (12. yasa). Gömülü `#000` ve `Inter` de kaldırıldı; artık `ui-tema` onları
zaten reddederdi.
Kanıt: kompozisyon gerçek Chromium'da render edildi — **h264 · yuv420p · 1920×1080 ·
30 fps · 6 sn** — ve golden metrikler DEĞİŞMEDİ (3/3 boyut + iki ikili karşılaştırması
yeşil). GSAP'siz render'ın bedeli ölçüldü ve V-20 olarak açık duruyor.

## D-198 — Bedava şerit LİSANS beyanı ister; "bilmiyorum" ile "serbest" ayrı sonuçlar
2026-08-16 · `audio.tts` dört şeridini kurarken ortaya çıkan asıl kural şu: **ücretsiz
olmak, ücretsiz KULLANILABİLİR olmakla aynı şey değil.** ElevenLabs bedava katmanı para
almıyor ama ticari kullanıma izin vermiyor; onunla üretilmiş bir prospect videosu geri
alınamaz bir yayındır.
Tanımlayıcıya `free_tier_commercial` alanı eklendi ve `providers` kapısı iki AYRI hata
üretiyor: beyan `false` ise "bedava şeride konulamaz", beyan YOKSA "beyan edilmemiş".
İkisini tek hataya sıkıştırmak (D-177) "bilmiyorum"u "serbest" saymak olurdu.
**Kural genel, ElevenLabs'a özel değil** — ve bunu yazıldığı anda kanıtladı: mevcut iki
tanımlayıcıyı (`claude-code`, `cloudflare-workers-ai`) beyansız `free` şeritte yakaladı.
İkisi de gerçekten ticari kullanıma açık; beyanlar dosyaların KENDİ metnine göre
dolduruldu, varsayımla değil.
**Dördüncü şerit bir sağlayıcı DEĞİL.** "Kendi kaydın" dosya girdisidir; sağlayıcı
sayarsak "ses üret" adımı bazen ağ çağırır bazen çağırmaz olur ve çalıştırma öncesi
maliyet tahmini yalan olurdu (§3.10). Test bunu da denetliyor: sağlayıcı listesinde
"kendi/upload/dosya" adı geçen bir kayıt olmamalı.
**Adım bölündü** (D-180 deseni): `5.4` sözleşme — bitti. `5.4b` canlı ses — üç
sağlayıcı da `enabled: false`, anahtarlar ve ağırlıklar yok, `bloke: insan` (V-21).

## D-199 — Transkript kapısı `PUBLISH` yükleminin İÇİNE kondu, yanına değil
2026-08-16 · Türkçe WER %10–25: on kelimede bir hata. Yanlış bir altyazı, söylemediğin
bir şeyi söylemiş gibi gösterir ve yayınlandıktan sonra düzeltilemez — video paylaşıldı,
ekran görüntüsü alındı.
Kapıyı ayrı bir kontrol olarak yazmak mümkündü; yazılmadı. **İkinci bir kontrol noktası,
atlanabilecek bir kontrol noktasıdır** — bu projede tam olarak bu sınıftan üç hata çıktı
(D-173 yazan var okuyan yok, D-182 yazıcı var çağıran yok, D-190 düğme var eylemi yok).
Kural `inspectManifest`in içinde ve `isPublishable` onu otomatik devralıyor: yayın
yüklemi TEK ve kural onun İÇİNDE.
**Tetikleyici fiil değil ÜRÜN:** `output` içinde `captions` taşıyan bir adım altyazı
üretmiştir; onu `RENDER` de `GENERATE` de üretebilir. Fiil adına bakmak, üçüncü bir
fiil eklendiğinde sessizce kör kalırdı.
İhlal testi: kuralı kaldır → **3 test kırmızı**. Yanlış pozitif de denetlendi —
altyazısız bir çalıştırma kapıyı hiç tetiklemiyor.
**`.ass` yazıcısı SAF ve ASR'den bağımsız.** Girdi kelime zamanlarıdır; nereden geldiği
(Groq, yerel whisper, elle) yazıcıyı ilgilendirmez. Böylece bağlantı olmadan tam test
edilebiliyor: Türkçe karakterler kaçışsız yazılıyor (Latin-1'e düşen bir yazıcı `ğ`yi
sessizce `g` yapar ve bu ancak video izlenirken görülür), `\\k` süresi kelimenin KENDİ
süresi, ters ve çakışan zamanlar reddediliyor.
**Adım bölündü:** `5.5` yazıcı + kapı bitti · `5.5b` gerçek ASR `bloke: insan` (V-22).

## D-200 — Tıklama niyeti pikselden ÖNCE yazılır; `recordVideo` darboğazla yasaklandı
2026-08-16 · `5.6`nın asıl fikri şu: her açık kaynak ekran kaydedici zoom ve kırpma
hedeflerini **kaydedilmiş fare izinden ÇIKARMAK** zorunda — görüntüde imleci bul,
hareketi izle, tıklamayı tahmin et. Kırılgan ve yavaş. Bizde Playwright script'i hedefi
zaten BİLİYOR (`boundingBox()` tıklamadan önce çağrılıyor) ve onu `timeline.json`a veri
olarak yazıyor. Zoom odağı, bölüm işaretleri ve `reels` klipleri (5.8) bundan
**deterministik** türüyor — ses enerjisinden değil (sessiz ekran kaydında o yöntem
çalışmaz, §17).
**`recordVideo` `chokepoints.json`a `izinli: []` ile kondu** — "tam olarak bir tane"
değil, "hiç olmasın" kuralı. Sebep: istenen çözünürlüğü karşılayamadığında SESSİZCE
800×800 WebM'e düşüyor. Sessizce düşen bir ayar en kötü ayardır: çıktı üretilir, kimse
bakmaz, ve prospect'e giden demo 800×800'dür.
**Kendi ihlal testim ilk denemede yanlış kuralı sınadı** (D-186 tekrarı): ihlal dosyası
playwright'ı da import ediyordu ve kırmızı `chromium-baslatan`dan geldi. Dosya yalnız
`recordVideo` içerecek şekilde sadeleştirildi; kırmızı doğru kuraldan geldi.
**Doğrulamalar sessiz bozulmayı hedefliyor:** sıfır alanlı kutu (`boundingBox()`
görünmeyen öğe için bunu döndürür — zoom köşeye gider), ekran dışı hedef (siyah kare),
geriye giden zaman, tek boyut (h264 çift ister; ffmpeg sessizce yuvarlar).
Gerçek kanıt: Xvfb 1920×1080x24 + üretilen argümanlarla x11grab →
**h264 · yuv420p · 1920×1080 · 60 fps · 3 sn**.
**Koşum betiğim iki kez yalan söyledi:** `xterm` yokluğu ffmpeg hatası gibi göründü;
sonra zsh unquoted değişkeni **kelime bölmediği** için tüm argüman dizisi tek argüman
oldu ve "Unrecognized option" verdi. İkisi de koddaki değil harness'taki hataydı —
D-170'in kabuk seviyesindeki hâli.

## D-201 — V-20 çözüldü: beklenen `window.__hf`, `__timelines` değildi
2026-08-16 · Render 6 saniyelik bir videoyu **1 dk 34 sn**de bitiriyordu. İlk teşhis
yanlıştı: `hyperframe.runtime.iife.js`ten `__timelines` sözleşmesini okuyup karşıladım,
bekleme sürdü. Doğru cevap CLI yardımındaydı — *"the post-goto **`window.__hf`**
readiness poll has its own 45s budget"*. `__hf` player paketinin kurduğu bir nesne ve
bizim kompozisyonlarımız player runtime'ı ÇALIŞTIRMIYOR: hareket CSS'te, süreler
token'da (§12.7). Yani beklenen şey hiç gelmeyecekti.
Çözüm bir hile değil, belgelenmiş bayrak: `--player-ready-timeout 2000`.
**8,3 saniye** — aynı çıktı (66,9 KB, 6 sn), 11 kat hızlı. Uyarı hâlâ çıkıyor ve
çıkmalı: doğruyu söylüyor, hiçbir player zaman çizgisi hazır olmadı.
Bayrak `motion/kanit/package.json`daki `render` script'ine kondu ve gerekçesi dosyanın
içinde — komut satırında kalsaydı ilk temiz çalıştırmada kaybolurdu.
**Ders:** bir sözleşmeyi paketten okumak doğru refleksti (D-174) ama **yanlış
sözleşmeyi** okudum. Hata mesajındaki kelime (`sub_timeline`) beni `__timelines`e
yönlendirdi; asıl cevap aracın kendi yardım metnindeydi. Kaynağı okumadan önce
**aracın kendi belgesine bakmak** daha ucuzdu.

## D-202 — Demo bir sürümlü artefakt: kalıcı olan üçlü, MP4 değil
2026-08-16 · `demos/upcyman/` üçlüsü kuruldu: `demo-script.ts` (Playwright akışı,
adımlar VERİ — sıra değiştirmek bir düzenleme, yeniden yazma değil) · `timeline.json`
(tıklama kutuları ve bölüm işaretleri) · `narration.tr.json` (bölüm başına Türkçe
anlatı). Ürün arayüzü değişince script güncellenir, video **yeniden render edilir**;
yeniden KAYIT yapılmaz — yeniden kayıt her seferinde farklı zamanlama ve farklı fare
izi demektir.
**Yeni bir değişmez test edildi: bölüm işaretleri anlatı bölümleriyle EŞLEŞMELİ.**
Ayrışırlarsa video ya anlatılmayan bir bölüm gösterir ya da anlatı boşluğa konuşur —
ve bu ancak videoyu izleyerek fark edilir, yani en pahalı yoldan.
**`timeline.json` YOKLUĞU ile BOŞLUĞU ayrı hatalar** (D-198 deseni): ilki script'in hiç
koşmadığını, ikincisi koştuğunu ama hiçbir öğe bulamadığını söyler. Tek hataya
sıkıştırmak, hangisinin olduğunu bilmeden hata ayıklamak demekti.
`demo-video` hattı yetenek + kısıt istiyor (R-40), **üç insan kapısı** taşıyor
(bölüm sırası · transkript · onay) ve `just plan` maliyeti dürüstçe "FİYATLANAMADI"
diyor — dört ücretli adımın sağlayıcısı henüz seçilemiyor (V-21).

## D-203 — `reels` bir TÜRETMEDİR: yeni çekim yok, tahmin yok, sihirli eşik yok
2026-08-16 · Klip sınırları veriden geliyor: `timeline.json`daki `chapter: true`
işaretleri, demo script'i tıklamadan ÖNCE yazdı (D-200). Piyasadaki otomatik
klipleyicilerin hepsi konuşma ENERJİSİYLE çalışır — sessiz bir ekran kaydında
bulduğunu sandıkları şey gürültüdür (§17).
**Deterministik demek: aynı demo → aynı reels.** Test bunu doğrudan doğruluyor
(`a` ile `b` çağrısı `toEqual`). İkinci koşuda farklı klip veren bir türetme, "bu
klibi onayladım" cümlesini anlamsız yapardı.
**Süre sınırları koda gömülü sihir DEĞİL, gerekçeli sabit:** `MIN_KLIP_SN = 3`
(altı klip değil, karedir) · `MAX_KLIP_SN = 60` (Reels tavanı 90; 90'a dayanan klip
kesilme riskindedir). **Uzun bölüm KESİLMİYOR, REDDEDİLİYOR**: nereden kesileceği bir
KARARDIR ve sistem tahmin ederse bölümün ortasını atar — insan bölümü ikiye ayırsın.
**9:16 kırpma matematiği iki tuzağı birden kapatıyor:** genişlik ÇİFT'e yuvarlanıyor
(h264 tek boyutu sessizce yuvarlar, 1 piksellik kayma her kareyi yeniden örnekler —
5.6'daki aynı tuzak) ve pencere kaynağın içine KENETLENİYOR (kenara yakın hedefte
negatif `x`, ffmpeg'de siyah kenar demekti). Kenetlemenin ihlal testi ortadaki hedefin
kenetlenMEDİĞİNİ de doğruluyor — yoksa kural koşulu okumadan hep kenetlerdi.
Kırpma merkezi zoom odağıyla AYNI hesaptan geliyor: ayrışırlarsa klip, zoom'un
gösterdiğinden başka bir yeri gösterir.
`reels` hattı **hiçbir üretim adımı taşımıyor** — türetme, ikinci bir üretim değil.

## D-204 — Çok en-boy: değişen BÜTÇE, punto değil; ve `paginate` yeniden yazılmadı
2026-08-16 · Explainer videosu üç en-boy üretiyor ama **tek kompozisyondan**. Üç ayrı
kompozisyon üç ayrı bakım yüküdür: metin bir yerde düzeltilir, diğer ikisinde unutulur
ve altı ay sonra hangisinin doğru olduğu bilinmez.
**En-boy ekseni karakter BÜTÇESİNİ daraltır, puntoyu DEĞİL** (R-23 · §7.1). Ölçüldü:
`statement` başlık bütçesi master 16:9'da 68, 1:1'de 42, 9:16'da **33** karakter.
16:9'a sığan bir başlık 9:16'da bölünüyor — küçülmüyor. Küçülen metin dikey videoda
telefonda okunamaz hâle gelir ve bu ancak yayınlandıktan sonra görülür.
**9:16'da kullanılabilir genişlik GÜVENLİ ALANDIR** (950px), tuvalin tamamı (1080px)
değil: yanlarda %6 Reels UI var ve oraya yazmak metni platformun kendi düğmelerinin
altına gömmektir.
**`paginate` YENİDEN YAZILMADI.** İlk taslağım kendi sayfalama döngüsünü kuruyordu —
sonsuz döngü koruması ve `oversized` işareti ikinci bir yerde yaşayacaktı. Bunun yerine
`splitForLayout`/`paginate` isteğe bağlı bir `CharBudget` aldı; en-boy modülü yalnız
bütçeyi hesaplıyor. Ayrıca `splitForLayout(kalan, layout, butce)` diye var olmayan bir
imza uydurmuştum ve derleme yakaladı — imzayı ÖNCE okumak gerekiyordu (D-174).
**Master 16:9 bir platform spec'i DEĞİL**, bizim yakalama ölçümüz (5.6) ve bütçe
oranlarının paydası. `placements.ts`teki her satır `sourceUrl` + `verifiedAt` taşıyor;
oraya uydurma bir kaynakla 16:9 eklemek, doğrulanmamış bir sayıyı doğrulanmış
göstermek olurdu (§11.4).
**İhlal testi ilk denemede GEÇERSİZDİ:** oranı `1` yapınca `aspect` kullanılmaz oldu ve
derleme düştü — D-170 uyarınca "derlenmiyorsa test geçersiz". `aspect.usableWidth /
aspect.usableWidth` ile tekrarlandı: **2 test kırmızı**.

## D-205 — İhlal bataryası: `just verify` artık kapıları GEÇMEKLE kalmıyor, KIRIYOR
2026-08-16 · `5.10`un 🧪 kriteri "her BLOCKING kuralı kasten ihlal et"ti. Tek seferlik
bir kabuk komutu yazmak yerine `scripts/ihlal-bataryasi.mjs` yazıldı ve `just verify`e
bağlandı — FAZ-9.2 "kural uyum turu" da aynı bataryayı çağıracak. Bir kez koşup unutulan
ihlal testi, koşulmamış ihlal testidir.
**Batarya üç ayrı şeyi doğruluyor** (D-186 · D-170): ihlal UYGULANDI mı · kod hâlâ
DERLENİYOR mu (derlenmiyorsa kapı değil derleyici konuşur) · kırmızı DOĞRU kapıdan mı
geldi. Üçüncüsü için her ihlal bir `imza` taşıyor: kapının GERÇEK mesajından bir parça.
**Batarya ilk koşuşunda iki bulgu verdi ve ikisi de öğreticiydi:**
1. `turkish-case` "kırmızı ama başka kuraldan" dedi — **batarya haklıydı, imzam
   yanlıştı**: kapı adını aramıştım, kapı ise "çıplak `.toUpperCase()`" diyor. İmza
   kapının adından değil MESAJINDAN alınır.
2. `turkce-genisleme` **YEŞİL KALDI** — gerçek bir delik. Desen `button` sonrası
   yalnız `\s , : [ $` kabul ediyordu ve `button.ihlal` gibi **sınıflı her seçici**
   kuraldan kaçıyordu. Gerçek kodda düğmeler zaten sınıflı yazılıyor; kapı iki tur
   önce yazılmıştı ve o gün yaptığım ihlal testi tesadüfen `.baslat` sınıf listesinden
   geçmişti. Terminatör listesine `.` ve `{` eklendi.
İkinci bulgu bu turun asıl kazancı: **bir kapıyı bir kez kırmızı görmek yetmiyor**;
ihlali kapının kaçırabileceği bir biçimde de denemek gerekiyor.

## D-206 — FAZ 5 ŞARTLI kapandı: `aac` ses ölçülemedi, tikle örtülmedi
2026-08-16 · On adımın sekizi tikli, ikisi (`5.4b`, `5.5b`) bilinçli `BLOKE: insan`.
Çıkış kriterinin üç maddesinden ikisi karşılandı:
1. *"Gerçek bir demo videosu üretildi"* — üretildi ve `ffprobe` ile ölçüldü:
   **h264 · yuv420p · 1920×1080 · 6 sn**. *"ve izlendi"* kısmı bir İNSAN eylemidir;
   sistem onu iddia edemez.
2. *"`ffprobe` h264/yuv420p/**aac** doğruluyor"* — **aac YOK**: ffprobe tek akış
   gösteriyor (`codec_type=video`). Ses üretimi `5.4b`ye (TTS ağırlıkları ve
   anahtarları, V-21) ve `5.5b`ye (ASR, V-22) bağlı; ikisi de insan girdisi bekliyor.
   Bunu tikle örtmek, FAZ 3 ve FAZ 4'te reddettiğimiz şeyin (D-158 · D-193) tekrarı
   olurdu.
3. *"Tam kapsamlı test paketi burada çalıştırıldı"* — çalıştırıldı: **34 kapı · 979
   test · 3/3 golden · 26 uç duman testi · 5 ihlal kırmızı**.
**Karar:** FAZ 6'ya geçilir. Kalan iki madde dış bağımlılık — plan hatası değil, planın
`V-nn` olarak zaten öngördüğü şeyler.
