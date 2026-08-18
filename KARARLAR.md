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

## V-06 — `dima` ürün mü modül mü ✅ TAMAMEN KAPANDI (2026-08-16, D-235)
`dima` ayrı marka ekseni olarak modellendi (2026-08-15, D-84). **Pazara sunum adı da
kapandı: onaylı marka — "Dima by Upcytech"** (kurucu, 2026-08-16). Her ürün kendi
adıyla yaşar, Upcytech çatı olarak arkasında durur. → FAZ-2.11 · FAZ-2.9

## V-07 — Era 1'in dikeyi ✅ KAPANDI (2026-08-16, D-235)
Hipotez **otomotiv tedarik/Bursa** idi ve üçüncü taraf verisinden çıkarımdı. Kurucu
doğrulamadı: dikey **imalat**, ama asıl ayrım ekseni sektör değil **veri olgunluğu**.
Bölge iddiası tamamen düştü — uydurulmuş bir coğrafya kaydı, kayıt olmayandan kötüdür.
→ FAZ-2.9

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

## V-27 — OAuth uygulama kaydı yok: gerçek token alınamadı
Akış, kapsam sözleşmesi, CSRF doğrulaması ve ortam sözleşmesi yazıldı ve test edildi
(`oauthEnvDurumu` eksik değişkenleri ADLARIYLA raporluyor). ⚠ **Kalan iş yalnız hesap
kurulumu DEĞİL:** `oauthEnvDurumu` ve `authorizeUrl`ün bugün sıfır üretim çağıranı var —
yetkilendirme akışını koşturan bir komut/uç de yazılacak. Sonra Meta uygulaması
(App Review gerekmiyor, D-3) ve LinkedIn "Share on LinkedIn" kaydı, `sops` altına dört
değişken. → FAZ-7.5b

## V-26 — Meta uygulaması ve token yok: gerçek yayın yapılmadı
Yayın kapıları (token ömrü, alt-text, kota, defter mutabakatı) yazıldı ve **çağrı
sırasıyla** doğrulandı; `PUBLISH` gövdesi yazıldı, üç hatta bağlandı ve defter
bootstrap komutu açıldı (D-224). Ama gerçek bir Meta uygulaması, sayfa bağlantısı ve
uzun ömürlü token **insan eylemidir**. ⚠ **Kalan iş yalnız hesap kurulumu DEĞİL:**
HTTP adaptörü (`upload` + `publishingLimit`) de yazılacak. App Review gerekmiyor
(D-3). → FAZ-7.2b

## V-25 — Gerçek prospect yok: deck teslim edilmedi
Zincir kuruldu ve uçtan uca doğrulandı (gerçek çekim + grafik → PDF, beş kapı 5/5,
iki ihlal biçimi doğru kapılarda durdu). Ama **gerçek bir prospect kaydı yok** ve
uydurulmuş bir şirket doğruluk kaynağına giren bir kurgudur. `2.9`'a da bağlı: onaylı
corpus olmadan `bilgi-sec` `NO_CONTEXT` veriyor. → FAZ-6.9b

## V-24 — Şelalenin dört kaynağı: anahtar YOK ve ADAPTÖR de yok
⚠ Bu borç ilk yazıldığında "kalan iş yalnız bağlantı" diyordu; **yanlıştı** (2. doğrulama
turu). `ingestBody` `SELALE` üzerinde iterasyon yapmıyor, yalnız `own-site` çağırıyor ve
dört uzak kaynağın adaptörü yazılmamış — yalnız tanımlayıcı tablosu var. Yani bu, bir
anahtar blokajının arkasına saklanmış TEKNİK bir eksikti. Anahtar geldiğinde yazılacak
iş: dört adaptör + fallback döngüsü. Karantina, sidecar ve enjeksiyon sınırı hazır ve
gerçek çekimle doğrulandı. → FAZ-6.5b

## V-23 — LinkedIn döküman sınırı ✅ KAPANDI (2026-08-16, FAZ-7.3)
Kaynak okundu: **300 sayfa · 100 MB**
(`https://www.linkedin.com/help/linkedin/answer/a523054`) ve `placements.ts`e
`linkedin-document` satırı olarak `sourceUrl` + `verifiedAt` ile girdi.
**Doğrulama bir hatayı ortaya çıkardı:** döküman için LinkedIn'in **görsel** sınırı
(5 MB) kullanılıyordu — iki farklı medya tipinin limiti karıştırılmıştı ve 40 MB'lık
meşru bir döküman reddedilirdi. Editoryal tavanımız (10 sayfa) platform sınırından AYRI
duruyor: biri bir olgu, diğeri bir karar.

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

> **D-252 · D-253 · D-254 arşive devredildi** → `docs/kararlar/ARSIV-2026.md`.
> Üçü de kapandı ve kodda yaşıyor: gömülü marka fontu (`brand/*/fonts`), yüzey kapsamlı
> chroma tavanı (`tasarim-olcum.ts`), karosel grameri (`sablon.ts`). R-63 gereği tavan
> dolmadan devredildi — bir kararı arşive taşımak onu iptal etmez, atıfları çalışmaya
> devam eder.

> **D-255 · D-256 · D-257 · D-258 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> Kapanmış kararlar; atıf bütünlüğü korunuyor (R-62), tavan açıldı (R-63).

## D-263 — Defter KANIT tutar, yük değil; JSON kanıttır, PNG teslimattır

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-14.1 · §3.5 · R-52 ↔ R-64

Bekleyen çalıştırma defterlerini commit'lerken `repo-hygiene` kırmızıya döndü: bir
`manifest.json` **580 KB** çıkmıştı. İki kural çakışıyor göründü — R-52 defterin
commit'lenmesini, R-64 512 KB üstü izlenen dosya olmamasını zorunlu kılıyor.

**Çakışma sahteydi, iki ayrı kökü vardı.**

**(a) Manifest gömülü YÜK taşıyordu.** Ölçüldü: `output.document.fontCss` **414 KB** —
gömülü marka fontu, her koşuda AYNI ve zaten `brand/<id>/fonts` altında izleniyor — ve bir
görselin `src` data URI'si **385 KB**. Defterin işi byte'ı saklamak değil, *hangi byte
olduğunu kanıtlamak*; digest bunu 64 karakterde yapıyor. `defterReplacer` 8 KB üstü her
dizeyi `«elenmis sha256:… <n>B»` ile değiştiriyor. Eşik ölçülerek seçildi: en büyük gerçek
kanıt alanı QA raporu 3,4 KB, `tokenCss` 2,6 KB — ikisi de korunuyor. Kazanç: 16 MB.

**(b) Teslimat PNG'leri deftere karışmıştı.** Fotoğraflı bir slayt 792 KB. R-52'nin kendi
gerekçesi *"maliyet ve sağlayıcı geçmişi başka hiçbir yerde yazmıyor"* diyor — yani defter
PARA ve SAĞLAYICI geçmişidir, teslimat deposu değil. Teslimat byte'ı D-248'in içerik-adresli
deposuna ait. Depo zaten 48 manifest'e karşı **yalnız 6** PNG izliyordu: PNG kuralın kendisi
değil istisnasıydı; tutarsızlık lehine değil aleyhine karar verildi.

⚠ **Kalan borç:** manifest slaytların YOLUNU ve boyutunu yazıyor ama **digest'ini yazmıyor**,
yani işaretçi doğrulanabilir değil. Bu, bu kararın kapattığı değil AÇTIĞI bir eksiktir ve
öyle kayda geçiyor. → FAZ-14.2 plan artefaktıyla birlikte kapanır.

**Geri alma maliyeti:** düşük — eleme yalnız yazma anında, okuyan hiçbir tüketici elenen
alanlara bakmıyor (`captions`, `fetchedAt`, `sourceRef`, `personalizationFields`).

## D-264 — Yuva bir POLİTİKA kararıdır, bir gözlem değil

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-14.3 · §7.1

Hattın sırasını çevirdim — `kompozit` artık `gorsel-uret`ten ÖNCE koşuyor, böylece brief
gireceği yuvayı görerek yazılıyor. Sıra değişince plan **kendi kuyruğunu ısırdı**:
`tasarla` yuvayı `gorselVar: gorsel !== null` ile açıyordu, yani *"ortada üretilmiş bir
görsel var mı"* diye soruyordu. Ama görsel artık plandan SONRA üretiliyor. Plan, kendi
tetiklediği şeyin varlığını ön koşul sayıyordu: yuva hiç açılmaz, brief hiç yazılmaz,
görsel hiç üretilmezdi. Test bunu ilk koşuda yakaladı — `expected '' to contain …`.

**Yanlış olan sıra değil ÖNCÜLDÜ.** Yuvanın var olup olmayacağı bir gözlem değil bir
karardır: *"bu karosel bir fotoğraf taşımalı mı?"* Bunu görselin kendisi cevaplayamaz.
`yuvaIstendi` artık hattın (ileride kompozisyon ailesinin, FAZ-12.7) verdiği bir politika
ve plan yalnız gerekçesini yazıyor.

⚠ **Bu D-261'in kardeşi ve aynı sınıf.** Orada fotoğraf "bağlı olan tek görsel yol"
olduğu için kullanılıyordu; burada plan, görselin varlığını kendi kararının girdisi
sanıyordu. İkisi de *"neden bu öge burada?"* sorusunun cevabının bir tesadüf olmasıydı.

**Yan kazanç — üretim artık KOŞULLU.** Plan yuva işaretlemezse `gorselBriefPromptu` `null`
dönüyor, brief üretilmiyor, `gorsel-uret` besinsiz kalıyor. Koşucuya "adım atla" yeteneği
EKLENMEDİ; zincir kendiliğinden sönüyor. *"Her ihtimale karşı bir görsel üret"* hem kota
hem marka tutarlılığı kaybıydı.

**Geri alma maliyeti:** düşük — `gorsel_yuvasi: true` hat kısıtı bugünkü davranışı koruyor.

## D-265 — Yavaşlığın nedeni tahmin edildi; ölçüm tahmini çürüttü

**Tarih:** 2026-08-17 · **Bağlam:** R-78 · R-79 · R-80

Önce tahminle cevap verildi: *"her adım 1500 testi birkaç kez koşuyor, kazanç testleri
daraltmakta."* Ölçüldü, tahmin çürüdü:

| Ölçülen | Sonuç |
|---|---|
| `vitest run` (1511 test) | **11.0 sn** — darboğaz değil |
| `just check` | **40 sn** duvar / 115 sn CPU · 43 kapının 42'si `fast` |
| En pahalı beş kapı | tests 11.5 · format 8.7 · lint 7.0 · cli-duman 5.2 · types 4.3 |
| Commit başına üretim kodu | 310 → 266 → **86** satır (15 → 16 → 17 Ağustos) |

Tahmin uygulansaydı en ucuz koruma (11 sn) kesilir, gerçek maliyet yerinde kalırdı.
Tur sayısı düşmemişti (101 · 107 · 70 commit) — düşen **turun kod içeriğiydi**.
Zaman adım başına ~6 tam doğrulama turuna gidiyordu; R-79 bunu ~1.5'e indiriyor.

**Ölçümün yan bulgusu:** `vitest run` tek başına çıkış kodu 1 verdi ("Worker exited
unexpectedly", 1511 testin 161'i hiç koşmadı), aynı paket `just check` içinde yeşil
geçti. Test kapısı bugün bazen 1350 bazen 1511 test koşuyor ve ikisinde de yeşil
raporlayabiliyor — hem yeniden koşum (hız) hem yalan yeşil (güvenlik). → R-80

**Kesilmeyecekler — bilerek.** Gerçek uçtan uca koşular (~300 sn), ihlal turu (R-71) ve
çıktıya gözle bakmak. FAZ-14'ün dört kusurundan üçü metrikler yeşilken, yalnız gerçek
çıktıya bakınca çıktı.

⚠ **Asıl gecikme kurallar değildi.** Bu turdaki üç büyük kayıp, üç kez öncülün yanlış
çıkmasıydı (D-264 · D-259 · D-260). Çaresi daha az doğrulama değil, baştan daha dikkatli
düşünmek. R-78…R-80 tekrarı kesiyor, düşünmeyi değil.

**Geri alma maliyeti:** sıfır — hiçbir kapı gevşetilmedi, hiçbir test silinmedi.

## D-266 — Dört bloke adım karara bağlandı: biri kapandı, üçü TETİKLEYİCİ aldı

**2026-08-17.** FAZ-11'in dört adımı (`11.5` `11.6` `11.9` `11.10`) günlerdir
`bloke: karar` duruyordu ve hiçbiri karara bağlanmamıştı. **Kararsız bir blokaj bir karar
değil, bir erteleme borcudur:** her turda okunur, her turda atlanır ve planı yavaşça
gerçeklikten koparır. LOOP§A tam yetki veriyor; kullanılmayan yetki de bir seçimdir.

| Adım | Karar | Gerekçe |
|---|---|---|
| `11.10` illüstrasyon kütüphanesi | **KAPATILDI — yapılmayacak** | §11.3 onay ima eden yapay insanı yasaklıyor; kalan (soyut/şematik) alt kümeyi 20 ikon + 5 süsleme + akış diyagramı zaten dolduruyor. Dışarıdan varlık + lisans metni indirmek §16 kurtarma yükü ekler (R-75). |
| `11.9` yerel raster | **YARISI ÇÖZÜLDÜ, yarısı ertelendi** | Upscale yumuşaması `feConvolveMatrix` keskinliğiyle **bağımlılıksız** çözüldü (FAZ-12.2, kenar enerjisi 2,04 → 2,36). Akıllı kırpma ve arka plan silme ertelendi. |
| `11.5` arka plan silme | **ERTELENDİ, tetikleyicili** | ~1 GB ağırlık + §16 sınavı. Tetikleyici: gerçek bir koşuda fotoğrafın arka planı alanla çarpışsın **ve** duotone (FAZ-11.7) bunu çözemesin. Bugüne kadar olmadı. |
| `11.6` taban → model (img2img) | **ERTELENDİ, tetikleyicili** | Sıralama yarısı FAZ-14.3'te zaten teslim edildi (taban önce, model sonra). Kalan yarı yeni bir ücretli sağlayıcı yolu. Tetikleyici: 20 kabul koşusunda kompozisyon körlüğü baskın kusur kaynağı çıksın. Görsel üretimi artık **koşullu** (D-264) ve çoğu koşuda hiç çalışmıyor — adımın yazıldığı andaki öncül zayıfladı. |

**Ortak ilke:** üçü de dış kaynak (ağırlık indirme, ücretli yol, varlık + lisans) istiyor;
D-157 bunları `insan` sınıfı sayıyor ve LOOP§G üçlü kuralına saymıyor — **plan hatası
değiller.** Ama sınıflandırmak karara bağlamak değildir. Her birine bir tetikleyici
yazıldı: blokaj artık "bir gün bakarız" değil, **gözlenebilir bir koşul**.

⚠ **Erteleme geri alınabilir, kapatma da.** `11.10` bir talep gelirse yeniden açılır —
ama talep bir sezgi değil, bir referans örnek ya da bir kabul koşusu bulgusu olmalı.

**Geri alma maliyeti:** sıfır — hiçbir kod yazılmadı, hiçbir bağımlılık eklenmedi.

## D-267 — Kalan iki bloke adım da tetikleyici aldı; kararsız blokajla faz kapanmaz

**2026-08-17.** D-266 FAZ-11'in dört adımını karara bağladı ama `12.8` ve `13.3` aynı
durumda bırakıldı — ve 2. doğrulama turu haklı olarak bunu yakaladı: **kendi yazdığım
ilkeyi bir sonraki dosyada uygulamamıştım.** Bir kuralı bir yerde uygulayıp komşusunda
uygulamamak, kuralı olmamasından kötüdür (bu turda üçüncü kez).

| Adım | Karar | Tetikleyici |
|---|---|---|
| `12.8` `sharp`/Lanczos | **ERTELENDİ** | Upscale yumuşaması FAZ-12.2'de `feConvolveMatrix` ile **bağımlılıksız** çözüldü (kenar enerjisi 2,04 → 2,36). Kalan: gerçek yeniden örnekleme + EXIF temizliği. Tetikleyici: `keskinlik` sonrası bir koşuda örnekleme kaybı GÖRÜNÜR olsun, ya da EXIF taşıyan bir kaynak fotoğraf hatta girsin. Bugün model çıktısı PNG ve EXIF yok. |
| `13.3` vektörleştirme | **ERTELENDİ** | Gerekçesi renk sapmasıydı; duotone (11.7) sapmayı YAPISAL olarak kapatıyor ve ölçüldü: doygun bir test görselinde ortalama ΔE **12,79 → 8,19**. Üstelik bugün bedava şeritte görsel sağlayıcı YOK — vektörleştirilecek model çıktısı da yok. Tetikleyici: ücretli görsel şeridi açılsın **ve** duotone'un yetmediği ölçülsün. |

⚠ **Blokajı sınıflandırmak karara bağlamak değildir.** `bloke: karar` bir etiket; karar,
adımın hangi gözlenebilir koşulda yeniden açılacağını yazmaktır. Etiket kalırsa plan her
turda okunur, her turda atlanır ve sessizce gerçeklikten kopar.

⚠ **`durum` kapısı bunu göremiyor** ve görmesi de beklenmemeli: yalnız DURUM→FAZ yönünü
doğruluyor, `bloke` sınıfları `insan|teknik`. `karar` üçüncü bir sınıf değil — D-157'nin
`insan` sınıfının alt kümesi (dış girdi: para, ağırlık, lisans). İkisi de artık
DURUM.md'nin `bloke` dizisinde `insan` olarak duruyor.

**Geri alma maliyeti:** sıfır — hiçbir kod yazılmadı, hiçbir bağımlılık eklenmedi.

## D-268 — KATALOG MERKEZLİ ÜRETİM: serbest üretim yok, şablon var

**2026-08-18.** Bu karar bir mimariyi değiştiriyor; öncekiler onun içinde kalıyor.

**Ne yanlıştı.** Sistem tek bir gramer kurup onu parametrelerle çeşitlendirmeye çalışıyordu:
`AileProfili` renk, süsleme yoğunluğu, tipografi ölçeği söylüyor, `sablon.ts` her slaydı
AYRI çiziyordu. Yedi "aile" tanımlandı ve render edildi; ızgaraya bakınca **yedi tasarım
değil, tek tasarımın yedi boyası** göründü. Sebep tek bir eksik parametre değildi:

1. **Tuvalin nasıl bölündüğü, hangi ögenin nereye oturduğu, çizginin hangi açıyla geçtiği
   `sablon.ts`'e GÖMÜLÜYDÜ.** Bir şablonu şablon yapan şey rengi değil; çizgileri,
   açıları, bölmeleri ve akışıdır.
2. **Süreklilik İMA EDİLİYORDU.** Her slayt ayrı render edilip "eğrinin çıkış açısı
   sonrakinin girişiyle uyumlu olsun" deniyordu. Bu yaklaşımla sürekli görünmek
   imkânsız — süreklilik bir efekt değil, **tuvalin kendisidir.**

**Ne doğru.** *Seamless carousel*: N slayt için `N × 1080` genişliğinde **tek tuval**
tasarlanır, ögeler kesim çizgilerini serbestçe aşar, sonra dilimlenir. Ve **kesimi aşan
öge içerikten türer, süsten değil** — veri eğrisi, kemer dizisi, kesik öznenin kolu.
Bant süs olsaydı silinebilirdi; içerikten türediği için silinemiyor.

**Yeni çalışma biçimi: KATALOG MERKEZLİ.**

| Eski | Yeni |
|---|---|
| Tek gramer + parametreler | **Elle kurulmuş şablon kataloğu** (`packages/contracts/src/katalog.ts`) |
| Slayt başına render | **Panorama**: tek tuval + dilimleme (`packages/render/src/panorama.ts`) |
| Süreklilik ima edilir | Süreklilik **kurulur**; taşıyıcı öge içerikten türer |
| Aile renk/süsleme seçer | Şablon **kompozisyonu** taşır; içerik ve görsellik değişir |

⚠ **Serbest üretim YOK.** Hat bir düzen icat etmiyor: kataloğdan bir şablon seçiyor,
içeriği ve görselleri onun yuvalarına üretiyor. Hedef determinizm değil — **üretken ve
estetik olmak**; ama üretkenlik kompozisyonda değil, İÇERİKTE ve GÖRSELLİKTE.

⚠ **Katalog bugün altı kayıt** ve hedef 20–30. Beşi referans örneklerden ölçüldü
(`ornek-1..5`), biri panorama referansından. Her kayıt görsel ihtiyacını **ilan ediyor**
(adet · kırpma · brief temeli) ve `kullanilabilir` bayrağı taşıyor: kataloga eklemek işi
bitirmez, kullanılabilirlik ayrı bir sorudur.

⚠ **Garanti katmanı DEĞİŞMEDİ.** Kontrast, Türkçe taşma, chroma tavanı, kelime bütçesi,
R-20 hâlâ ölçüm olarak üstte duruyor. Şablon kompozisyon seçer, kuralı gevşetemez —
`kartRenkleri` metin rengini zeminden TÜRETİYOR, seçtirmiyor.

**Devredilen dosyalar:** `sablon.ts` ve `AileProfili` yaşamaya devam ediyor (slayt başına
render yolu ve `tasarim` kapısı onlara bağlı), ama **yeni şablonlar kataloğa yazılıyor.**
İkisini birleştirmek ayrı bir adım.

**Geri alma maliyeti:** düşük — panorama ayrı bir modül, mevcut render yolu bozulmadı.


## D-269 — "Ne kurmalı" sorusunun cevabı ÖLÇÜLDÜ: hiçbir şey; üç eksen kullanılmıyordu

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.1 · §17 · R-75

"Muazzam tasarımlar için ne yüklemek, hangi kütüphaneyi eklemek lazım" sorusu bir
envanterle değil bir **ölçümle** cevaplandı. Tarayıcıda gerçek fontla ölçülen değerler:

| Yetenek | Durum | Ölçüm |
|---|---|---|
| Display genişlik ekseni | **VAR, kullanılmıyordu** | `Sürdürülebilirlik` `wdth 62`→580 px, `wdth 125`→1001 px (1,73×) |
| Metin ağırlık ekseni | **VAR, kullanılmıyordu** | 400→735 px, 800→798 px |
| Tabular rakam | **VAR, kullanılmıyordu** | `1111 8888` orantılı 464 px, tabular 543 px |
| İkon seti | **VAR, panorama çağırmıyordu** | 20 ikon `sablon-ikon.ts`te çizili |
| Doku/gren, degrade, maske | VAR — SVG `feTurbulence`/`linearGradient` yerel | — |
| Renk uzayı | VAR — OKLCH token'ları + `color-mix(in oklab)` | — |

**Karar: yeni bağımlılık YOK, yeni font YOK.** Eksik olan araç değil, **bağlanmamış
zincir**. Bir kütüphane kurmak eksik olanı vermezdi; kurulmuş olsaydı aynı eksenler yine
kullanılmadan duracak, üstüne bir lisans denetimi borcu doğacaktı (R-75).

⚠ **Bu, D-261 ailesinin sekizinci ve dokuzuncu üyesi.** `softHyphenate` için yedincisi
yazılmıştı; şimdi aynı sınıf iki kez daha çıktı — modül var, test yeşil, üretim yolu
sıfır. Sorunun tekrar etmesi tesadüf değil: **yeni bir yol açıldığında (panorama) eski
yolun bağladığı zincirler otomatik gelmiyor.** FAZ-15.9 eski yolu emekliye ayırırken
kontrol listesi bu tablodur.

⚠ **Başlık heceleme REDDEDİLDİ, gerekçesi korunarak.** Uzun Türkçe kelime punto tavanını
düşürüyor ve heceleme onu kurtarırdı; ama `static.ts` başlık hecelemeyi kompozisyon
gerekçesiyle reddediyor ve kırmızı bir kuralın gerekçesi başka bir dosyada sessizce
delinmez. Doğru kaldıraç genişlik ekseni çıktı: `wdth 62`'de aynı kelime %67 genişlikte,
punto tavanı **1,49 kat** yükseliyor. Eklemeli bir dilde poster tipografisinin yolu
daraltmaktan geçiyor — ölçülmeden bilinemeyecek bir sonuç.

**Geri alma maliyeti:** yok — hiçbir şey kurulmadı.

## D-270 — Mimarinin tamamı üretim yolundan KOPUKTU: onuncu ve en büyüğü

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.9 · D-261 ailesi · §3.10

Panorama render'ı, altı şablonluk katalog, dolu örnek belgeler, deterministik seçici,
uyarlama sözleşmesi ve DOM denetimi yazıldı. Her birinin testi yeşildi, 42 kapı yeşildi.
Ve `grep -rn "renderPanorama(" packages/engine` **sıfır satır** veriyordu: mimarinin
tamamı `just uret`ten erişilemez duruyordu.

⚠ **Bu, aynı sınıf hatanın onuncu tekrarı** (`validateVerbOutput`, `chart`, `diagram`,
`tasarimOlc`, `captureProductShot`, `renderDeckPdf`, `PUBLISH` gövdesi, `softHyphenate`,
`Archivo` genişlik ekseni, ikon dağarcığı) — ve en büyüğü, çünkü kaçırılan şey bir
fonksiyon değil bir MİMARİ idi. Sebep tekrar ettiği için artık tesadüf sayılamaz:
**yeni bir yol açıldığında eski yolun bağladığı zincirler otomatik gelmiyor** ve
"modülün testi var" duygusu, "üretim yolu var" duygusuyla karışıyor.

**Karar:** bir yetenek ancak **hattan çağrıldığı gösterilebiliyorsa** bitmiş sayılır.
`katalog-dikis.test.ts` bunu bir teste çeviriyor: üretim kaynağında `renderPanorama(`
çağıranlarını SAYIYOR ve sıfırsa kırmızı. Modül testi zinciri test etmez; her halka
sağlamken zincir kopuk olabilir.

**Bağlama sırasında GERÇEK KOŞUNUN öğrettiği üç kusur** (hiçbiri testle bulunamazdı):

1. **Zorunlu adım sessizce atlandı.** Şablon seçilemeyince istem boş döndü, koşucu
   `{atlandi: true, sebep: 'prompt-yok'}` yazdı ve hat iki adım sonra anlamsız bir
   `NO_ADAPTATION` ile durdu. Seçim artık istem kurucusundan AYRI: başarısızlık
   `TEMPLATE_SELECTION_FAILED` ile, puanlarıyla birlikte deftere giriyor.
2. **Eleme kuralı iki yönlüydü.** `metin-uret` 11 satır üretti; şablonlar 3–8 kart
   istiyordu ve **altı şablonun altısı birden elendi.** Yanlış olan metin değil kuraldı:
   yazar CÜMLE üretiyor, karosel KART taşıyor. Kural asimetrik oldu — fazlayı uyarlama
   birleştirir, eksiği uyduramaz.
3. **Sağlayıcı çıktı şekli üç adla geliyor.** Ayrıştırıcı yalnız `{text}` biliyordu;
   `claude-code` `{result}` döndürüyor ve hat `ADAPTATION_UNPARSEABLE` ile durdu.
   `metneCevir` üç adı da (`result`/`text`/`content`) zaten biliyordu — ikinci bir liste
   yazmak D-227'nin birebir tekrarıydı.

**Geri alma maliyeti:** düşük — katalog dalları kısıtla açılıyor (`katalog: true`,
`sablon_uyarla: true`); kısıt yoksa eski yol aynen koşuyor.

## D-271 — Eski karosel yolu emekli; "öldür" TAM silme demek değil, ÖLÇÜLDÜ

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.9 · Yasa 10 · R-12 · §3.5

Katalog merkezli üretim (D-268) devreye girince eski karosel tasarım yolunun emekliye
ayrılması gerekti. **Kapsam ölçülerek belirlendi, varsayılarak değil.**

| Öge | Karar | Gerekçe |
|---|---|---|
| `scripts/sablon-turu.mjs` (yedi-aile tezgâhı) | **arşive taşındı** | Terk edilen yaklaşımın deney tezgâhı; kalması onu diriltmeye davet |
| `instagram-carousel` hattı | **emekli işaretlendi, dosya kaldı** | `apps/ui` id'ye bağlı · FAZ-3.14 onu hedefliyor (bloke) |
| `aileSec` karosel seçimi | **emekli** | Karosel artık katalogdan geçiyor |
| `sablon.ts` · `AileProfili` · `static.ts` | **KALDI** | ⚠ ölçüm: `static.ts`te `doc.aile` **on altı yerde**; LinkedIn dökümanı, deck PDF, prospect-deck, reels, explainer, ad-creative ve tek görsel postu dahil **sekiz hat** ondan besleniyor |

⚠ ⚠ **"Eski sistemi öldür" isteği, sekiz hattı kırmadan tam olarak karşılanamıyor ve bu
rapor edilmesi gereken bir sonuç, sessizce daraltılacak bir kapsam değil.** Emekli olan
şey **karosel için aile seçimi**dir; slayt-başına render'ın kendisi değil — o, karoselin
değil BELGE ve DECK'in motoru ve karoselle birlikte ölmesi için hiçbir sebep yok.
Yasa 4 (tek render motoru) da bozulmuyor: panorama ile `static.ts` aynı Chromium'u, aynı
gömülü fontu ve aynı token CSS'ini kullanıyor — ikinci bir CSS alt kümesi yok.

**Geri alma maliyeti:** yok — hiçbir dosya silinmedi, biri taşındı.

## D-272 — Hat 21 dakika asıldı: `close` gelmiyordu, çünkü boruyu bir TORUN tutuyordu

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.9 · §3.8 · `chokepoints.json → alt-surec`

Katalog hattı gerçek koşuda `sablon-uyarla` adımında **iki ayrı denemede 21'er dakika
asıldı**. `ps` hiçbir çocuk süreç göstermiyordu: alt süreç ölmüştü ama `spawnProcess`
hâlâ bekliyordu. **Sağlayıcının 10 dakikalık zaman aşımı da kurtarmadı.**

**Kök neden:** Node `close` olayını yalnız TÜM stdio akışları kapandığında yayıyor;
`exit`i süreç bittiğinde. İkisi normalde art arda gelir — **alt süreç kendi çocuğunu
doğurup boruları ona devretmediği sürece.** `claude` CLI tam bunu yapıyor: kalıcı bir
`claude daemon run` süreci başlatıyor ve o daemon stdout borusunu açık tutuyor.

⚠ ⚠ **KURTARMA YOLU ASIL YOLLA AYNI OLAYA BAĞLIYDI ve bu tasarımın asıl kusuru.** Zaman
aşımı `SIGTERM` gönderiyor, süreç ölüyor — ve yine `close` bekleniyor. Bir zaman aşımı,
korumaya çalıştığı mekanizmanın aynısına dayanıyorsa koruma değildir.

**Düzeltme:** `exit` de dinleniyor; geldiğinde 250 ms'lik bir boşalma penceresi açılıyor.
Normal durumda `close` o pencere dolmadan gelir ve davranış birebir aynı kalır.

**İhlal testiyle doğrulandı:** boruyu devralan ayrılmış bir torun doğuran alt süreç
yazıldı. `exit` dinleyicisi kaldırıldığında test 20 sn tavana dayanıp **asıldı**;
dinleyiciyle **388 ms**'de doğru çıktıyla döndü.

⚠ Bu, ring-0'da (`kernel/src/proc/spawn.ts`) bir değişiklik ve orası "sabit" olmalı —
ama asılan bir darboğaz, sabit değil bozuktur. Değişiklik davranış-koruyucu: yeni bir
olay dinleniyor, hiçbir yol kaldırılmıyor.

**Geri alma maliyeti:** yok — tek dosya, tek olay dinleyicisi.
