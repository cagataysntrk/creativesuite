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

## D-225 — Diklik ölçütü OFAT'tır; tam ızgara öğrenme tasarımı değildir

**2026-08-16 · FAZ-8.1**

Faz dosyasının ✅ kriteri *"3×3 matris tek çalıştırmada üretiliyor"* diyordu ve ilk
tasarımım da "ızgara TAM olmalı" kuralını koyuyordu. **İkisi de yanlış** — araştırma
(`docs/research/2-b2b-ve-seritler--*`) tam çapraz çarpımı yalnız Meta'nın
`asset_feed_spec`i için ayırıyor:

> *"run one-factor-at-a-time (vary hooks with headline and visual fixed) for LEARNING,
> and reserve full cross-product only for `asset_feed_spec`, which does combinatorial
> testing server-side so you upload H+D+V assets instead of H×D×V creatives."*

**Karar: `ofat` varsayılan, `full` yalnız `asset_feed_spec`.**

- **Maliyet:** 3×3×3'te OFAT **7** varyant, tam ızgara **27**. Dört kat render ve
  öğrenme açısından sıfır ek bilgi — kombinasyonu Meta zaten sunucuda kuruyor.
- **Ölçüm:** OFAT'ta temelden **tek eksende** ayrılan bir varyantın farkı doğrudan o
  eksene atfedilir. Tam ızgarada iki varyant iki eksende ayrılabilir ve bu **hata
  değildir** — kombinatoryal tasarımın tanımı budur. Yani "iki ekseni birden değiştirme"
  yasağı yalnız OFAT'ta anlamlı.
- **Faz kriteri düzeltildi** (R-74): "3×3 matris" → "OFAT kümesi; `full` yalnız
  `asset_feed_spec` hedefinde".

**Neden zarif olan yanlıştı:** "ızgara tam olsun" tek cümlelik, mekanik ve güzel bir
kuraldı. Ama öğrenme tasarımı ile kombinatoryal test tasarımını aynı şey sanıyordu —
ve bu proje varyant başına gerçek para ödüyor.

**Geri alma maliyeti:** yok — iki mod da destekleniyor, karar hangi modun varsayılan
olduğu.

## D-226 — Yerel MCP yüzeyi KABUL — ama dar: üç araç, tek yazma yolu

**2026-08-16 · FAZ-8.9** (D-33 aday kararı kapanıyor)

**Soru:** Claude Code zaten `corpus/*.md` okuyabiliyorken MCP ne ekler?

**Cevap — üçü de ham dosya okumakla elde EDİLEMEZ:**
1. **Retrieval yüklemi** (R-13). Ham dosyayı okuyan bir agent **emekliye ayrılmış** bir
   kaydı güncel sanır; §4.5'in "asla sızmaz" vaadi yalnız yüklemden geçerken geçerli.
   `grep` marka, dönem, `status` ve geçerlilik tarihlerini bilmez — **ve bilmediğini de
   söylemez.**
2. **Türkçe arama** (§5.6). FTS5 + trigram + RRF: "ölçüm" → "ölçümlerinizi" bulur.
   `grep` bulmaz ve bulamadığını sessizce geçer.
3. **`propose` yolu** (R-14). Dosyayı elle yazan bir agent `x_signature`sız, `status`ü
   keyfi bir kayıt üretir; kapı bunu ancak commit anında yakalar — saatler sonra.

**Kabul, ama DAR:**
- **Üç araç, hepsi bu kadar.** Her yeni araç yeni bir yüzey ve yeni bir bakım borcu;
  MCP sözleşmesi değişince güncellenecek yer sayısı bu listeye eşit.
- **`derived/ingest/` ASLA açılmıyor** (R-50). Karantina metni dış kaynaktan gelir ve
  talimat olarak sunulamaz; bir araç onu döndürseydi prospect'in sitesindeki bir cümle
  modele **komut** olarak ulaşırdı. Enjeksiyon sınırının koruduğu şey tam olarak bu.
- **`status`/`zone`/`x_signature` REDDEDİLİYOR, yok sayılmıyor.** Sessizce silmek,
  çağıranın "active yazdım" sanmasına yol açardı; reddetmek kuralı öğretiyor.
  **Sessiz düzeltme, öğrenilmeyen bir kuraldır.**
- **Yüklemden geçmeyen kayıt "bulunamadı" sayılıyor**, "var ama göremezsin" değil —
  ikincisi emekli bir kaydın varlığını sızdırırdı.

**Reddedilmedi çünkü:** maliyeti düşük (mevcut fonksiyonların üstünde ince bir
adaptör), yerel bağlanıyor ve öldüğünde geriye düşüş dosya okumak — bozulma değil,
körelme (12. yasa korunuyor).

**Kapsam dürüstlüğü:** taşıma katmanı **minimal** (HTTP + JSON), tam MCP el sıkışması
ve SSE taşıması yazılmadı. Bugün açılan şey araç sözleşmesi ve sınırlar; protokolün
tamamı gerektiğinde eklenir ve o iş bu kararın kapsamında değil.

**Geri alma maliyeti:** düşük — iki uç kaldırılır, altındaki fonksiyonlar UI'ın zaten
kullandığı fonksiyonlar.

## D-227 — Beşinci tekrar: aldatan şey, düzeltmeyi kanıtlayan yorumun kendisiydi

**2026-08-16 · FAZ-8 kapanış denetimi, 1. tur**

`publishBody` girdilerde `assets` arıyordu; **hiçbir gövde onu üretmiyordu.**
`renderBody` `{ slides, count }` basıyor — yani `PUBLISH` her koşuda
`NO_PUBLISHABLE_ASSET` ile dönerdi ve 8.3'ün ifşa kapısı hiç çalışamazdı.

**Aynı sınıfın beşinci tekrarı** (D-216 gövde · D-222 gövde · D-224 hat · 8.3 kapı ·
bu: **şekil**). Ama bu sefer farklı bir şey oldu: aldatan şey kodun kendisi değil,
**düzeltmeyi kanıtlamak için yazdığım yorumdu.** `yayin-baglanma.test.ts` şöyle
diyordu: *"`RENDER` çıktısının GERÇEK şekli — gövde varlıkları buradan topluyor"* ve
altındaki şekil hiç üretilmemişti. Test kendi köprüsünü kurup ölçüyordu; yorum ise
tersini iddia ediyordu.

**Kapatılanlar:**
- `renderBody` artık `assets` basıyor: `path` · `altTr` (**belge modelinden**, R-34
  boşsa kapı reddeder) · `decorative` · `digest` (render edilen **baytın** özeti;
  CAS damgası koşu sonrası basılıyor, `PUBLISH` koşu içinde)
- **`PUBLISH_ARANAN_ANAHTARLAR` tek tanım**: üretici ve tüketici aynı listeyi
  kullanıyor. İki liste olsaydı biri güncellenir diğeri unutulurdu — bu bulgunun
  doğuş sebebi tam olarak buydu.
- `uretim-sekli-render.test.ts` şekli **ölçüyor**, anlatmıyor.

**Kalan gerçek boşluk — `8.3b` olarak açıldı:** damgalama ve blob yazımı tüm koşu
BİTTİKTEN sonra çalışıyor (`uret.mjs`), `PUBLISH` ise koşunun İÇİNDE. Yani
`stamped: true` yayın anında hiçbir zaman doğru olamaz. İfşa kapısı bu yüzden
**fail-closed** davranıyor ve bu doğru — ama sıralama düzeltilene kadar gerçek yayın
yapılamaz. **Bunu bilmek, bilmemekten iyidir.**

**Geri alma maliyeti:** yok.

## D-228 — Matris hat dosyasında yazıyordu, çözücü onu DÜŞÜRÜYORDU

**2026-08-16 · FAZ-8 doğrulama, M1**

`registry/pipelines/ad-creative-set.pipeline.yaml` altı satırlık bir `matris:` bloğu
taşıyor, `matris` kapısı onu okuyup doğruluyor, `matris.ts` 1291 testin bir kısmıyla
kapalı — ve **`parsePipeline` bloğu tamamen düşürüyordu.** `Pipeline` arayüzünde
`matris` alanı yoktu; `just plan ad-creative-set` yedi varyantı tek varyant gibi
fiyatlıyordu. Kapının kendi ihlal mesajı *"maliyet tahmini bu sayıyı çarpan alıyor"*
diyordu ve bu **bir iddiaydı, bir olgu değil**.

**Altıncı tekrar** (D-216 · D-222 · D-224 · 8.3 · D-227 · bu). Yeni olan halka:
**dosyada duran veri, çözücüde yoksa üretimde yoktur.** Kapı YAML'ı okur; üretim
`parsePipeline`ın döndürdüğü nesneyi okur. İkisi aynı dosyaya bakıp farklı şey görür.

**Kapatılanlar:**
- `Pipeline.matris` — çözücü `mod` + `eksenler`i **şekil olarak** okuyor. Tasarım
  yargısı (diklik) engine'de kalıyor: registry engine'i import edemez (§3.6) ve ayrım
  keyfi değil — registry "dosyada ne yazıyor", engine "bu tasarım bilgi üretir mi".
- `plan()` matrisi denetliyor ve **bozuksa plan ÜRETMİYOR**: tek düzeyli bir eksen
  para harcar, ölçüm vermez. Kapı bunu commit anında, plan çalıştırma anında söylüyor.
- Ücretli adımlar varyant başına, ücretsizler bir kez: `SELECT` bağlamı bir kez kurar,
  yedi varyant paylaşır; ama her varyantın kendi modeli, kendi render'ı var.
- `varyantSayisi` **donmuş plana ve özete** giriyor. Maliyet üzerinden dolaylı korunuyor
  sanmak yanlış olurdu: fiyatlanamayan bir planda her adım $0 ve 7 varyantlık onayla 27
  varyant koşmak özeti hiç değiştirmezdi.
- `matris-uretim-yolu.test.ts` **gerçek hat dosyasını** okuyup çarpanı ölçüyor.

**Kalan gerçek boşluk — `8.1b` olarak açıldı:** plan yedi varyant fiyatlıyor ama
`runPipeline` hâlâ tek varyant koşuyor. Tahmin artık dürüst, üretim henüz değil.
Sırayı tersine çevirmek (önce üretim, sonra tahmin) daha kötü olurdu: yedi varyant
üretip birini fiyatlandırmak, kullanıcıyı ödeyeceğinin yedide birine onaylatır.

**Geri alma maliyeti:** yok.

## D-229 — Politika kararı hat ADINDAN okunuyordu: beyan mekanizması

**2026-08-16 · FAZ-8 doğrulama, M3 + M5**

`scripts/uret.mjs` reklam metni linter'ını tek bir satırla açıyordu:
`const REKLAM_HATTI = id === 'ad-creative-set'`. **Tek sabit dize, ne testi ne kapısı.**
Hattı yeniden adlandırmak — ya da ikinci bir reklam hattı eklemek — Meta'nın kişisel
özellik kuralını sessizce kapatırdı ve hiçbir şey kırmızıya dönmezdi. Yasak, yasağın
yokluğuna dönüşürdü ve kimse fark etmezdi.

**Karar: politika hat dosyasının kendi beyanıdır.** `cikti_sinifi: reklam` →
`Pipeline.ciktiSinifi`. Varsayılan `organik`: reklam kuralları ancak AÇIKÇA beyan
edilince koşar. Ters varsayılan (her şey reklam) linter'ı gürültüye çevirirdi ve
**gürültülü şey kapatılır**.

`hat-kimligi` kapısı mekanizmayı atlanamaz kılıyor — iki soru birden:
1. Hat id'si ile karşılaştırma yapan satır var mı (üretim yollarında)
2. Beyan GERÇEKTEN kullanılıyor mu — en az bir hat `cikti_sinifi: reklam` diyor ve
   `uret.mjs` `ciktiSinifi` okuyor mu

⚠ **Kapı ilk çalıştırmada yanlış pozitif verdi** ve bu düzeltildi: `bodies.ts`teki
`zincirAdi === 'prospect-deck'` satırını suçladı — oysa orası **doğru** mekanizma
(`chain:` hat dosyasında beyan edilen bir kısıt; değerin hat adıyla aynı olması
tesadüf). Kapı beyan yolunu cezalandırsaydı, teşvik etmesi gereken şeyi yasaklardı.
Karşılaştırmanın diğer ucu artık `id`/`.id` olmak zorunda.

**M5 — batarya 15'ten 19 ihlale çıktı:** `matris` · `hat-kimligi` · `secret-rotasyon` ·
`doctor-salt-okur`. R-71 "her BLOCKING kapı kasten ihlal edilir" diyor ve bir kapının
batarya dışında kalması, korumadığı şeyi korunuyor sanmaktır.

⚠ **Bataryanın kendi yükü de kaynaktır.** İlk sürümde `hat-kimligi` ve
`secret-rotasyon` bataryanın KENDİ satırlarını suçladı: ihlal metni de bir `.mjs`
dosyasında duruyor ve kapılar onu okuyor. Yük artık parçalanarak yazılıyor
(`${'ad-creative'}-set`) — kapı yazılan dosyayı görmeli, yazan dosyayı değil.
`repo-hygiene` yükünde aynı numara zaten vardı; genel kural olmamıştı.

**Geri alma maliyeti:** yok.

## D-230 — ANAYASA tavanı belgeyi TAMAMLANAMAZ yapıyordu: ölçüt değişti

**2026-08-16 · FAZ-8 kapanışı**

`docs/ANAYASA.md` tam **1200/1200** ve **sekiz alt bölüm boştu**: §3.4 · §3.6 · §3.9 ·
§3.10 · §5.5 · §7.3 · §8.1 · §12.8. Yedisi **kapanmış** fazlara ait — yani D-159'un
"sırası gelen adım kendi bölümünü doldurur" mekanizması çalışmadı: bir fazı kapatmak,
o fazın ANAYASA bölümünü doldurmayı hiç gerektirmedi.

**Ölçtüm, sonra karar verdim** (R-76). Belgede yağ yok: bölümler konularıyla orantılı
ve 150 satır kırpmak gerçek içerik silmek olurdu. Yani tavan, sekiz bölümü doldurmanın
önündeki tek engeldi.

**Karar: ölçüt değişiyor, tavan gevşemiyor.** R-63'ün ANAYASA satırı 1200 → **1400**,
ama tek başına değil: **alt bölüm (`### §N.M`) başına 60 satır** tavanı eklendi ve
`docs-size` onu da zorluyor.

⚠ **Ölçü birimi ikinci ölçümde düzeldi.** Önce "bölüm (`## §N`) başına 180" yazmıştım;
iki kusuru vardı: (1) sekiz bölüm dolunca §3 ≈193 satıra çıkıyor ve kural **kendi
doldurma işini** kırmızıya döndürüyordu, (2) daha önemlisi **yanlış birimi ölçüyordu** —
atıflar `§3` değil `§3.4` biçiminde veriliyor ve `just tur` alt bölümü getiriyor.

⚠ **Ölçüm aracı da yanlış ölçebilir.** İlk awk yalnız `###` sınırına bakıyordu ve son
alt bölümü dosya sonuna kadar sayıyordu: §12.9 28 satır yerine **215** görünüyordu. Bir
tavan, tavanı ölçen araç kadar doğrudur. Sınır artık `###` **veya** `##`.

**Neden bu daha SIKI:** okuyucunun maliyeti belgenin değil, **atıf verilen bölümün**
boyu. 1400 satırlık bir belgede 60 satırlık on bölüm, 1200 satırlık bir belgede 300
satırlık tek bölümden ucuz okunur. Ve **boş bir bölüm uzun bir bölümden pahalıdır**:
§12.8'e bakan biri erişilebilirlik kuralını bulamayınca kuralı yok sanmaz — **kendi
uydurur**. Eksik belge, yanlış belgenin yavaş hâlidir.

**Alternatif — reddedildi:** sekiz bölümü "bilinçli olarak boş" tombstone'larıyla
kapatmak. Yedisi kapanmış fazlara ait ve içerikleri **var** — kodda, kararlarda, faz
dosyalarında. Boş bırakmak bilgiyi yok etmiyor, yalnız **bulunamaz** kılıyor; ve
ANAYASA'nın tek işi bulunabilir kılmak.

**Sıra önemli:** önce doldur, sonra `citations`ı sık (D-231). Kırmızı bir kapıyla
başlamak her commit'i bloke ederdi.

**Geri alma maliyeti:** yok — tavan bir sayı.

## D-231 — `citations` yalnız İLERİ bakıyordu: tikli adımın atfı da denetleniyor

**2026-08-16 · FAZ-8 kapanışı, ANAYASA borcu**

`citations` bugüne kadar **yalnız `siradaki_adim`ın** `📖` satırındaki atıfları
denetliyordu: sıradaki adım gövdesiz bir bölümü okumak zorundaysa hata. Doğru ama eksik.

**Bir faz kapandığında o bölüm bir daha hiç kontrol edilmiyordu.** §12.8 FAZ-4.1'e ait
ve FAZ 4 kapandı; §8.1 FAZ-3.4'e ait ve FAZ 3 kapandı. İkisi de boş kaldı ve kapı yalnız
"8 iskelet bölüm" diye **uyarıyordu** — o uyarı dokuz turdur okunup geçildi. **Gürültülü
şey kapatılır; uyarı da bir kapatma biçimidir.**

**Karar: tiklemek bir iddiadır.** `faz-yollari` bunu `📁` için zaten söylüyor ("tikli bir
adımın yol satırı plan değil, iddiadır"); aynısı `📖` için de geçerli. Bir adımı
tiklemek, okuduğu bölümün VAR olduğunu iddia etmektir. Kaynaksız yapılmış bir adım,
yapılmamış bir adımdan kötüdür: yapıldığı sanılır ve kimse geri dönmez.

**Sıra zorunluydu** (R-76): önce sekiz bölüm dolduruldu (D-230), sonra kapı sıkıldı.
Ters sırada yedi kapanmış faz yüzünden kapı kırmızıya döner ve **her commit bloke
olurdu** — ve o durumda tek makul çıkış kuralı gevşetmek olurdu.

⚠ **İhlal testi kapının SINIRINI da ölçtü.** Önce §12.8'i boşalttım ve kapı kırmızıya
dönmedi: **hiçbir adımın `📖` satırı §12.8'e atıf vermiyor.** Yani mekanizma çalıştı,
kapsamı dışındaydı. §8.1 ile tekrarladım (FAZ-3.4 tikli ve ona atıf veriyor) ve kapı
kırmızıya döndü. Kalan boşluk **bilinçli ve beyanlı**: hiç atıf almayan bir bölüm yalnız
"iskelet" uyarısıyla korunuyor. Bunu kapatmanın yolu kapıyı büyütmek değil, o bölümü
okuyan adımı `📖` satırına yazmaktır — kapı bir eksikliği bildirir, planı yazmaz.

**Kalıcı ders:** *bir denetim yalnız ileri bakıyorsa, geçmiş sessizce birikir.* D-159
"sırası gelen adım doldurur" diyordu ve bu doğruydu — ama sıra geçtikten sonra kimse
bakmıyordu. Kapanış, denetimin BİTTİĞİ an değil, denetimin **kalıcılaştığı** an olmalı.

**Geri alma maliyeti:** yok.

## D-232 — `aiGenerated: false` SABİTTİ; Md. 50 ifşası sessizce kapalıydı

**2026-08-16 · FAZ-8 doğrulama 2. tur, BLOKER**

`scripts/uret.mjs` uyum iddiasını `aiGenerated: false` sabitiyle kuruyordu ve yanındaki
yorum *"bu hatta görsel model çağrısı YOK"* diyordu. **FAZ 8'de eklenen
`ad-creative-set` hattı `capability: image.generate` taşıyor** — yorum yanlış oldu,
hiçbir şey kırmızıya dönmedi.

**Zincir sonuna kadar:** `aiGenerated: false` → `disclosureRequired` daima `false` →
IPTC'ye `Upcytech:AiGenerated=false` basılıyor (**yanlış beyan**) → `publish.ts`
`if (!a.compliance.disclosureRequired) continue` → **EU AI Act Md. 50 ifşa kapısı model
üretimi bir görselde atlanıyor.** Bir sabit, üç katman aşağıda yasal bir kapıyı
kapatıyordu. Taranan prompt da yanlıştı: CLI konusu, modele giden prompt değil.

**D-227'nin birebir tekrarı ve bu yüzden ayrı bir karar:** aldatan şey kod değil, kodun
yanındaki iddiaydı. Fark şu — D-227'de yorumu ben yeni yazmıştım; burada yorum **yazıldığı
gün doğruydu** ve altı hafta sonra bir hat eklenince yanlış oldu. **Doğru bir yorum
eskiyebilir; bir ölçüm eskiyemez, kırmızıya döner.**

**Kapatılanlar:** `uyumKapsami(pipeline)` kararı hattan okuyor · `taranacakPrompt` konu
ve adım prompt'larını birlikte tarıyor (fail-safe yön) · `uyum-kapsami.test.ts` gerçek
hat dosyalarına karşı ölçüyor ve görsel üreten hatları **tarayarak** buluyor (sabit liste
olsaydı listeye eklemeyi unutmak sessiz olurdu) · `compliance` kapısı `aiGenerated`
literalini **yazılamaz** kılıyor.

**Kapsam kararı:** `audio.tts` görsel sayılmıyor. Ses ayrı bir varlık ve ayrı bir ifşa
yüzeyi ister; ikisini tek bayrağa bağlamak birini diğerinin arkasına saklardı.

**Geri alma maliyeti:** yok.

## D-233 — `readonly: true` gerçekten salt-okur değildi; `just doctor` çöküyordu

**2026-08-16 · FAZ-8 doğrulama 2. tur, MAJOR**

`openDb`, `readonly` geçilse bile dizini yaratıyor (`mkdirSync`) ve `journal_mode` +
`synchronous` pragmalarını yazıyordu — ikisi de yazma. Üstelik `scripts/doktor.mjs`
`readonly`yi hiç geçmiyordu. Ölçüm:

```
$ chmod a-w derived/index derived/index/suite.db && just doctor
SqliteError: attempt to write a readonly database (SQLITE_READONLY_DIRECTORY)
```

**12. yasanın tam hedefi olan senaryoda** — bir ay ihmalden sonra, salt-okur bir
kurtarma diskinde — "hiçbir şeyi değiştirmeyen" rapor aracı **çalışmıyordu**.
`doctor-salt-okur` kapısı çağrıları denetliyordu; çağrının ALTINDAKİ yazmayı görmüyordu.
**Bir kapı, koruduğu ilkeyi bir katman aşağıda kaybedebilir.**

**Kapatılanlar:** `openDb` salt-okur modda `mkdirSync` ve yazan pragmaları atlıyor ·
`doktor.mjs` `readonly: true` geçiyor · `doctor-salt-okur` kapısı artık
`scripts/doctor.sh`ı da denetliyor (**giriş betiği listede yoktu**) ve `.sh` için kabuk
yazma biçimlerini (yönlendirme, `tee`, `touch`, `cp`, `mv`) arıyor — `echo x > dosya`
eklemek kapıyı yeşil bırakıyordu. Üçü de kasten ihlal edilip kırmızıya döndürüldü.

**Ölçüldü:** tüm indeks salt-okur → `just doctor` rc=0.

**Geri alma maliyeti:** yok.

## D-234 — MCP girdi şeması bir belgeydi, kapı değildi

**2026-08-16 · FAZ-8 doğrulama 2. tur, MAJOR**

`ARACLAR`ın `girdi` şeması `required`, `minLength`, `maximum`,
`additionalProperties: false` yazıyordu ve **hiçbiri zorlanmıyordu**:

```
POST /mcp/cagir/corpus_search -d '{}'                     → {"sonuclar":[]} HTTP 200
POST /mcp/cagir/corpus_search -d '{"query":"x","limit":100000}' → HTTP 200
```

Sorgusuz bir çağrı "sonuç yok" cevabı alıyordu — yani **arama hiç koşmadan boş liste**.
Bu, `araclar.ts`in birkaç satır yukarısında bizzat yasakladığı şeydi (D-175: "boş liste
dönmek corpus'un boş olduğunu söylerdi"). **Modül kendi ilkesini kendi yüzeyinde
çiğniyordu.**

**Karar: doğrulayıcı elde yazıldı, bağımlılık eklenmedi.** Desteklenen alt küme
`registry/PROFILE.md` ile aynı ruhta dar: `required` · `type` · `minLength` · `minimum` ·
`maximum` · `pattern` · `additionalProperties`. Genel bir JSON Schema doğrulayıcı 40
satırdan pahalıydı ve profil zaten bu alt kümeyi zorunlu kılıyor.

**İlk eşleşmeyen alanda dönüyor:** alan listesi kusmak, çağıranın ilkini düzeltip
ikinciye takılmasından daha yardımcı değil.

**Geri alma maliyeti:** yok.
