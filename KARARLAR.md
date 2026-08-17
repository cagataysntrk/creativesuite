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

## D-248 — Varlık değil TESLİMAT: yüzlerce birikince sorun "yer" değil "hangisi"

**2026-08-16 · ilk postlar üretildikten sonra**

İlk post dört varlık üretti ve kütüphane **dört özdeş satır** gösterdi: hangisinin kapak
olduğu, hangisinin son slayt olduğu belli değil. Yüz postta dört yüz satır ve hiçbiri
diğerine bağlı değil. **Yüzlerce varlık biriktiğinde sorun "yer yok" değil, "hangisi
neydi" olur.**

**Neden ACİL:** damga üretim anında basılır ve **retrofit imkânsızdır** (7. yasa, R-11).
Bu alan olmadan üretilen her varlık kalıcı olarak sırasız kalır. Bir gün beklemek, bir
günlük varlığı kalıcı olarak kaybetmek demekti — nitekim ilk dört varlık öyle kaldı ve
kütüphane onları **damgasız diye sayıyor, uydurma bir gruba KOYMUYOR**.

**`DeliverableRef` damgaya girdi:** `deliverableId` · `kind` · `index` · `total` ·
`role`. `deliverableId` çalıştırma id'sine EŞİT DEĞİL: tek koşu birden çok teslimat
üretebilir (reklam matrisi yedi varyant) ve tek teslimat birden çok koşuya yayılabilir
(yarıda kalan koşu devam ettirilir).

**`total` alanı eksikliği görünür kılıyor:** yarıda kalmış bir koşu üç slayt bırakır ve
liste bunu "3 parçalı post" diye göstermemeli. `eksikParca` ölçülüyor, varsayılmıyor.

⚠ **Yol boyunca `BlobMeta`nın İKİNCİ BİR KOPYASI bulundu** (`kutuphane.ts`) ve yorumu
*"biçim `blobs.ts`ten OKUNDU, uydurulmadı"* diyordu. Okunmuştu — ama kopyaydı ve
`deliverable` eklenince sessizce ayrıştı. **Okunan bir kopya da bir kopyadır.** Tip
artık kaynağından import ediliyor; ayrışma yapısal olarak imkânsız.

**Kapanmayanlar, açıkça:**
- Varlıklar **indekste değil**: `kutuphane()` her çağrıda tüm ağacı tarıyor. 400
  varlıkta ~500 dosya okuması. Ölçülmeden optimize edilmeyecek.
- `derived/blobs` **yalnız bu diskte** (`3.12b`, R2 senkronu yazılmadı). Yüzlerce
  varlığın gerçek riski budur.
- Önizleme/küçük resim yok: dijest'e bakarak 400 görsel taranamaz.

**Geri alma maliyeti:** yok — alan opsiyonel, eski varlıklar okunmaya devam ediyor.

## D-249 — İki katman: içerik-adresli DOĞRULUK, klasörlü GEZİNME

**2026-08-16 · varlık düzeni**

Soru haklıydı: `derived/blobs/9a/9abd32a7…png` insan için gezilemez. Ama cevap
"klasörlere geç" değil — **ikisi ayrı iş ve karıştırılırsa ikisi de bozulur.**

**`derived/blobs/<ab>/<sha256>.<ext>` DOĞRULUKTUR ve değişmiyor:**
- Adres = içerik. Aynı görsel iki teslimatta kullanılırsa **tek kopya** durur.
- Bir bayt bozulursa adres tutmaz; bozulma matematiksel olarak yakalanır.
- `post-1/` klasörü bunların **ikisini de** kaybettirir: aynı görsel iki kez yazılır ve
  bir klasör adı hiçbir şeyi doğrulamaz.

**`content/<yyyy-mm>/<tip>-<konu>-<id8>/01-kapak.png` GEZİNMEDİR ve yeni:**
İnsan "şu postu aç" diye bakar, "şu sha256'yı" diye değil. Sıralı, adlandırılmış,
tıklanabilir. Planın §5'inde `content/` yıllardır yazılıydı ve **hiç yazılmamıştı**.

**Projeksiyon, ikinci doğruluk kaynağı DEĞİL:** `content/` gitignore'lu ve
`just teslimatlar` onu sıfırdan kurar. Ters kurulsaydı — klasörler doğruluk, blob'lar
kopya — aynı görsel iki yerde durur ve hangisinin gerçek olduğu sorusu doğardı.

**Sembolik bağ, kopya değil:** 400 varlık iki kez yer kaplamıyor ve "hangisi güncel"
sorusu doğmuyor. Bağlar **göreli**: depo taşınırsa kırılmıyor — mutlak yol, yedeği
başka bir dizine açan birinin karşısına kırık bir ağaç çıkarırdı (FAZ-8.7 dersi).

**Slug `foldForSearch`ten:** çıplak `toLowerCase()` `İ`yi bozar (R-21) ve dosya adı bir
daha eşleşmez.

**Damgasız varlıklar sayılıyor ve söyleniyor** — sessizce atlanan bir varlık, olmayan
bir varlıktan kötüdür: görünüm "hepsi burada" gibi durur.

**Geri alma maliyeti:** yok — `content/` silinebilir, hiçbir şey kaybolmaz.

## D-250 — Üretilen görsel belgeye hiç girmiyordu: kota çöpe gidiyordu

**2026-08-16 · tasarım katmanı, 1. bulgu**

`composeBody` yalnız `capture` (ürün ekran çekimi) arıyordu. `image.generate`
çıktısı `input.inputs`ta duruyor ve **hiçbir bloğa dönüşmüyordu**: Cloudflare'e çağrı
gidiyor, kota harcanıyor, görsel damgalanıp içerik-adresli depoya alınıyor — ve belgeye
hiç konmuyordu. **Siyah slayt + beyaz metin bundan.**

Zincir kopukluğunun **yedinci** tekrarı: modül var, çağrı var, çıktı var, tüketen yok.
Öncekilerden farkı, bu sefer harcanan şeyin **para/kota** olması — sessiz bir kayıp
değil, ölçülebilir bir israf.

**`data:` URI, dosya DEĞİL.** `COMPOSE`un yan etki sınıfı `pure` (§3.10): saf bir fiil
diske yazamaz. Base64 zaten `inputs`ta ve Chromium `data:` URI'yi doğrudan çözüyor —
tek motor yasası (R-30) korunuyor, ikinci bir yazma yolu açılmıyor.

**MIME tipi imzadan okunuyor, varsayılmıyor:** Cloudflare `sdxl-lightning` yolunda JPEG
döndürüyor; `image/png` yazmak tarayıcıyı yanıltmazdı ama **yalan olurdu**.

**`role` verilmiyor:** `product_screenshot` bir iddiadır ("ürün gerçekten böyle
görünüyor") ve model üretimi bir görsel onu iddia edemez (FAZ-6.8).

⚠ **Kalan borç — `alt` metni:** bugün KONUDAN geliyor, yani görselin ne İÇİN
üretildiğini söylüyor, ne GÖSTERDİĞİNİ değil. `decorative: true` yazmak yalan olurdu —
görsel akışta duruyor ve anlam taşıyor. Doğru çözüm görsel brief'ini Türkçe bir
betimlemeyle birlikte istemek. Bugün yok ve olmadığını söylüyorum.

**Ölçüldü:** `olcum olmadan iyilestirme olmaz` konusuyla koşu → metroloji atölyesi
görseli belgeye girdi, 5 slayt üretildi (önceki koşularda 4).

**Geri alma maliyeti:** yok.

## D-251 — Kapı, sistemin üretmesi gereken şeyi reddediyordu

**2026-08-16 · tasarım katmanı**

Görsel belgeye girer girmez slayt boyutu 713KB'a çıktı ve `compliance` kapısı reddetti:
*"713KB — git sınırı aşıldı (R-64)"*. Ama `derived/blobs` **gitignore'lu** ve
`blobs.ts`in kendi yorumu bunu zaten söylüyordu:

> *"R-64: 512KB. Blob deposu git'te değil ama sınır burada da **raporlanır**."*

**Niyet "raporla", uygulama "engelle" idi.** Sonuç: gerçek fotoğraf taşıyan bir
Instagram slaytı 512KB'ı rutin olarak aşıyor ve kapı sistemin üretmesi gereken şeyi
reddediyordu. Yayın sınırı zaten AYRI ölçülüyor ve gerçek olan o: `✓ 156KB / 8192KB`.

`oversize_for_git` artık uyarı. **Bozulma** (`digest_mismatch`) ve **damgasızlık**
(`meta_missing`) hata olarak kalıyor — ikisi de deponun vaadini çiğniyor.

**Uyarılar HER ZAMAN basılıyor**, yalnız hata varken değil: temiz koşuda bilgiyi
gizlemek "her şey mükemmel" izlenimi verir.

**Geri alma maliyeti:** yok.

## D-252 — Marka fontu: gömülü, latin-ext, iki yüz

**2026-08-17 · tasarım katmanı**

Repoda **tek bir font dosyası yoktu** ve `static.ts` `"DejaVu Sans"` diyordu — sistem
fontu. Çıktının "amatör" görünmesinin en büyük tek sebebi buydu.

**Vendor edilenler (SIL OFL, ticari kullanım ve gömme serbest):**
- **Inter** → metin. Geniş latin-ext kapsaması, değişken ağırlık 400–800.
- **Archivo** → display. **Değişken genişlik 62–125%** — referanslardaki "Expanded"
  kapak tipografisi bu eksenden geliyor, ikinci bir dosya indirmeye gerek yok.

**latin ve latin-ext AYRI dosyalar, her biri kendi `unicode-range`i ile.** `ğ ş İ ı Ğ Ş`
latin alt kümesinde YOK; tek dosyaya güvenmek `İstanbul`u `?stanbul` yapan sessiz bir
düşüşe kapı açardı. Ölçüldü: gerçek koşuda `ı ş ğ ç ö ü İ` gliflerinin hepsi doğru.

**Base64 GÖMÜLÜ, harici yükleme yok.** `static.ts`in kendi uyarısı bunu söylüyordu:
harici dosya yüklenemezse Chromium **sessizce** sistem fontuna düşer ve kimseye
söylemez. Gömülü font bu hata modunu ortadan kaldırıyor — font ya HTML'in içindedir ya
da hiç yoktur.

**Eksik font üretimi DURDURUYOR:** `fontCss` `Result` dönüyor ve `uret.mjs` hatada
çıkıyor. Sessizce geçilseydi `ĞÜŞİÖÇ` bozulur ve hiçbir hata görünmezdi — **yanlış
fontla üretilmiş bir varlık, üretilmemiş bir varlıktan kötüdür.**

**Yüz listesi KAPALI:** üçüncü bir aile eklemek bir karar gerektirir, bir import değil.
Tip ölçeği kapalı kalmazsa "marka şablonu" bir öneriye dönüşür.

⚠ **V-02 KAPANMADI.** Bunlar çalışan, lisansı temiz varsayılanlar — nihai marka fontu
hâlâ kullanıcının kararı. Değiştirmek iki dosya indirip `YUZLER` listesini güncellemek.

**Geri alma maliyeti:** düşük — `fontCss` verilmezse eski davranış.

## D-253 — Chroma tavanı yüzey kapsamlı: gevşetme değil, kapsam düzeltmesi

**2026-08-17 · tasarım katmanı**

`CHROMA_LIMITS.fill = 0.02` **her** marka yüzeyine uygulanıyordu ve hedeflenen estetiği
imkânsız kılıyordu. Ölçüldü, tahmin edilmedi: referans karosellerin sarısı
`oklch(0.804 0.156 87)` — **dolgu tavanının 7,8 katı.** Tavan bir ayar meselesi değil,
kural meselesiydi.

**§12.1'in ISA-101 gerekçesi doğru — ama bir İZLEME KABİNİ için.** "Renk anormallik
demektir; her yerde renk varsa hiçbir yerde uyarı yoktur" bir kontrol odası cümlesidir.
Bir Instagram gönderisinde aynı kural **ters yönde** çalışır: orada renk anormallik
değil, markanın kendisidir.

**Kullanıcının kararı kuralın metnini belirledi:** *"sarı kırmızı her renk olabilir o
post için; özel bir talep yoksa markaya uygun klasik bir şablonu devam ettirmeli."*
Mühendislik karşılığı: **kreatif rengin kuralı doygunluk değil KAYNAK.** Renk ya dönemin
kreatif paletinden gelir (varsayılan), ya da o çalıştırmaya özel açık bir parametreyle
gelir ve manifeste yazılır.

**Tutarlılık kaybolmuyor, ölçüldüğü yere taşınıyor:** §11.1'in ΔE ve palet-dışı oran
kapıları zaten **basılmış piksele** bakıyor. Token seviyesindeki chroma tavanı kreatif
yüzey için ikinci ve daha kör bir mekanizmaydı — çıktıyı değil tanımı ölçüyordu.

**Liste KAPALI ve varsayılan SINIRLI:** `TAVANSIZ_YUZEYLER = {'kreatif'}`; tanınmayan
her yüzey tavana tabi. Ters varsayılan, yeni bir yüzey açan kişinin farkında olmadan
konsolu renklendirmesi demekti — ve ISA-101 orada hâlâ geçerli.

**Sıra korundu** (sessiz düzeltme yok): `ANAYASA §12.1` → `tokens.ts` → yeni yüzey.
Koda istisna yazıp kuralı olduğu gibi bırakmak, kuralı bir öneriye çevirirdi.

**Kreatif rampa eklendi:** kehribar (ölçüm/enstrüman dünyasının rengi), mürekkep ve
kâğıt. **Saf beyaz KULLANILMADI** — baskıda ve ekranda parlar, tipografiyi sertleştirir.

**Geri alma maliyeti:** yok — `kreatif` yüzeyini silmek eski davranışa döner.

## D-254 — Karosel grameri: modelde ROL var, çizim yok

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-8.6 · §7.1 · R-30

Referans karoseller yan yana konduğunda "tek şey" görünüyor. Bizim çıktımız görünmüyordu:
tek sütun flex, `padding: 96px`, katman yok. Eksik olan altı öge sayıldı — sayaç,
navigasyon işareti, hayalet rakam, akan şekil ayırıcı, renk rolü rotasyonu, asimetrik
alan — ve hepsinin **CSS + SVG** ile, sıfır bağımlılıkla yapılabildiği görüldü.

**Karar:** kompozisyon `SlaytKimligi`den (`role`, `index`, `total`, `kulp`) TÜRETİLİR;
gramer `packages/render/src/sablon.ts` içinde ve **kapalıdır**.

**Belge modeline işaretleme SOKULMADI.** `ornament: '<svg>…'` gibi bir alan cazipti ve
reddedildi: belge modeli bir şablon diline dönüşürdü ve "tek render motoru" yasası
(R-30) fiilen ikinci bir motora bölünürdü. Model **rol** taşır, `sablon.ts` çizer.

**Neden `static.ts`te değil:** `static.ts` belge → HTML çevirisi yapar; `sablon.ts`
tasarım kararı verir. Karışsalardı "bu rengi kim seçti" sorusu bir HTML şablonunun
içinde kaybolurdu.

**Deterministik, rastgele değil.** Her parametre indeksten hesaplanıyor: aynı slayt her
koşuda aynı kompozisyonu verir (golden test çalışır) ama slayttan slayta değişir (ritim
doğar). Rastgelelik ikisini birden kaybettirirdi.

**Ölçülen üç kusur ve düzeltmeleri** — ilk koşunun çıktısına tek tek bakılarak bulundu:
1. **Yüzey beyan edilmemişti.** `kreatif` rolleri `[data-surface='kreatif']` ile
   kapsanmış; öznitelik yokken `:root` (konsol grisi) devreye giriyordu ve ilk karo
   siyah üstüne siyah çıktı. Kapsanmış token, beyan edilmeyen yüzeyde SESSİZCE düşer.
2. **Metin eğri sınırını kesiyordu.** Bir cümlenin yarısı kehribar, yarısı kâğıt
   üstündeydi. Eğri salınımı `SINIR_MIN..SINIR_MAX` dar bandına alındı ve metin sütunu
   `guvenliMetinYuzdesi` ile bandın dışına kilitlendi — ikisi tek dosyada tanımlı.
3. **Hayalet rakam alt şeritle çakışıyordu.** Metnin karşı tarafına alındı ve alt
   şeridin üstünde bitiriliyor.

**Uzunluk disiplini prompt'a yazıldı** (`icerikPromptu`): 1. satır kapak ≤8 kelime,
gövde ≤30, kapanış ≤14. Sayfalayıcı taşmayı böler (R-30) ama neyin BAŞLIK olduğunu
bilemez — o bilgi yalnız metnin üretildiği yerde vardır.

**Geri alma maliyeti:** düşük — `doc.slayt` yazılmazsa `sablonCss`/`sablonKatmanlari`
boş döner ve eski tek sütun düzeni aynen çalışır. Testler bunu zaten kanıtlıyor.

## D-255 — Onuncu faz: "üretebiliyor" ile "iyi" ayrı sorulardır

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10 · §11.1 · §7.1

FAZ 3 görsel hattını kapattı ve kriteri şuydu: *"gerçek bir carousel üret."* Üretildi.
Ama o kriter **kalite hakkında hiçbir şey söylemiyor** ve bu hafta üç kusur bunu kanıtladı:
metin eğri sınırını kesiyordu, hayalet rakam navigasyon etiketiyle çakışıyordu, kapak
on iki satırlık bir metin duvarıydı. **41 kapının hiçbiri kırmızıya dönmedi.** Üçünü de
PNG'lere tek tek bakarak buldum.

**Karar:** kalite kendi fazını alır (FAZ 10) ve kendi kapısını (`tasarim`).

**Göz kapı değildir.** Yorulur, alışır, ve gözetimsiz koşuda hiç yoktur. Kullanıcı
inceleme istedi ve isabetli — ama insan incelemesi ölçümün YERİNE değil, ÜSTÜNE gelir.
Ölçüm ucuz ve tekrarlanabilir olanı yakalar; göz, ölçülemeyeni.

**Eşikler ölçülmeden konmuyor** (10.2, 10.3'ten önce). D-253 dersi: chroma 0.156
ölçüldüğü için savunulabildi. Eşiği önce koyup sonra ölçmek, eşiği kendi çıktımıza göre
ayarlamak olurdu — kapı o an kendini onaylar.

**Bloklayıcı / uyarı ayrımı gerekçeli.** T2 (metin↔eğri), T3 (rakam↔şerit), T8 (kelime
tavanı) bloklayıcı çünkü **üçü de gerçekten oldu**; olmuş bir hatayı yakalamayan kapı
temennidir. Kaplama, palet payı, ΔE uyarı çünkü estetik tercih payı var ve sıfır
tolerans meşru bir tasarımı reddeder.

**Kabul ölçütü ARDIŞIK, oransal değil.** Yirmi ardışık temiz koşu; biri düşerse sayaç
sıfırlanır. *"20 üretildi, 17'si iyiydi"* geçmez — oran, düzeltilmemiş bir kusurun
kuyruğunu gizler. Ardışıklık, düzeltmenin gerçekten kapandığını kanıtlayan tek ölçüdür.

**Saha taraması bu fazı doğruladı** (`docs/research/8-karosel-oss--*.md`): sekiz agent
destekli karosel aracının hepsi `LLM → HTML/CSS → headless Chromium → PNG` zincirini
kuruyor — mimarimiz doğru. Ama hiçbirinde tasarım metriği YOK ve Türkçe için tek satır
rehberlik yok. Fork edilecek bir şey çıkmadı; alınacak üç mekanizma çıktı ve üçü de bu
fazın adımlarında (10.1 tarayıcı oturumu · 10.5 görsel yargı · 10.6 referans→parametre).

**Ölçülen tek şey:** tarayıcı açma maliyeti. `5 slayt · ayrı tarayıcı 3656 ms` ·
`tek oturum 704 ms` → **5.2x**. Slayt başına Chromium açmak gerçek bir kusurdu ve
alandaki bir araç bunu bizden önce çözmüştü.

**Geri alma maliyeti:** düşük — `tasarim` kapısı kaldırılabilir; ama o an kalite yine
göze kalır ve bu fazın gerekçesi tam olarak budur.

## D-256 — Görsel yargı: yeni yetenek, yeni fiil değil

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.5 · §11.1 · §8.2

`tasarim` kapısı (D-255) ölçülebileni ölçüyor. Ama bu fazda bulduğum kusurların yarısını
hiçbir metrik görmedi ve ancak PNG'ye **bakınca** çıktılar: dev tırnak çerçevenin
tepesinde kırpılıyordu, üste yaslı içerik sayaç bandıyla çakışmaya bir kelime uzaktaydı.
İkisi de "sayıya dökülemez ama bakınca apaçık" sınıfındandı.

**Karar:** `image.critique` bir **YETENEK**, dokuzuncu bir fiil değil. `GENERATE` altında
koşuyor — ölçülüyor, maliyeti önden görünüyor, deftere yazılıyor. Yeni bir fiil, aynı işi
yapan ikinci bir zamanlama/retry/maliyet yolu açardı (R-02).

**SINIRLAYICI KUTU ZORUNLU.** Kutusuz bulgu reddediliyor ve bu tercih değil, ampirik
sonuç: *"kompozisyon dengesiz"* eyleme çevrilemez, *"kapakta 120–460 px bandında metin
eğri sınırını geçiyor"* çevrilebilir. Kategori ve şiddet de **kapalı liste** — serbest
kategori toplanamaz, sayılamaz, izlenemez.

**Reddedilen bulgular SAYILIYOR.** Sessizce atılsalardı model kutusuz bulgu üretmeye
devam eder ve biz "temiz" raporunu gerçek sanardık — kapıyı kör etmenin en sessiz yolu.

**`Read` aracı yeteneğe BAĞLI verildi ve bu ölçülerek bulundu.** Araçsız çağrı 5 dakikada
dönmedi ve SIGTERM ile öldü: Claude Code etkileşimsiz kipte izin istemi çıkarıp asılıyor.
`--allowedTools Read` ile aynı çağrı **18 saniyede** doğru sonucu verdi. Yalnız `Read`:
alandaki araçlar agent'a `Bash WebFetch` verip kendi API'sini curl ile çağırtıyor — o,
kapatılamayan bir delik. Okuma kategorik olarak farklı: yan etkisi yok, kabuk açmıyor,
ağa çıkmıyor. Yine de bir yetki genişlemesi, o yüzden metin üretimi bu aracı ALMIYOR.

**Şerit `free`, her koşuda çalışıyor.** Premium bir yargı, kapının maliyetini üretimin
maliyetine yaklaştırırdı; abonelik zaten var.

**İlk gerçek koşu üç bulgu verdi, üçü de doğruydu ve üçü de düzeltildi:**
1. **Alt-piksel yumuşatma renk saçaklanması** — Chromium varsayılan LCD yumuşatması harf
   kenarlarına mavi–turuncu saçak bırakıyordu. Ekranda görünmez ama PNG bir VARLIK:
   farklı piksel dizilimli ekranda, baskıda ve ölçeklemede görünür oluyor. **Ölçüldü:
   %6,6 → `--disable-lcd-text` ile %0,0.** Hiçbir metrik bunu görmedi ve HER varlığı
   etkiliyordu.
2. **Boşluk hiyerarşisi**: başlık↔ilk madde 37 px, maddeler arası 33 px — fark ayırt
   edilemeyince dört satır tek blok gibi okunuyordu.
3. **Madde çizgisi kontrastı 3,71:1** iken yanındaki gövde metni 7,99:1.

**Geri alma maliyeti:** düşük — hat adımı kaldırılırsa yargı koşmaz; ama o an kalite
yine yalnız ölçülebilene ve göze kalır.

## D-257 — Şablon parametreleri: gramer kapalı, sayılar türetilebilir

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.6 · §7.1

D-254 grameri kapattı: kaç kural olduğu, hangi ögelerin bulunduğu bir KARAR. Ama o
kuralların **sayısal ayarları** — eğrinin nerede aktığı, kenar payı, hayalet rakamın
büyüklüğü — elle çözümleniyordu ve bu tekrar edilebilir değildi: ikinci bir referans
geldiğinde aynı el işi baştan yapılacaktı.

**Karar:** `SablonParametreleri` — kapalı alan listesi, tek yerde tanımlı, `sablon.ts` ve
`static.ts` oradan okuyor. Her sayının kaynağı yazılı: ya bir ölçüm, ya bir kısıt.
*"Güzel duruyor"* diye seçilmiş sayı yok.

**Türetme ÖNERİR, uygulamaz** (R-14 · D-31). `scripts/sablon-turet.mjs` bir JSON yazıyor;
onu `sablon-parametre.ts`e taşımak bir commit. Otomatik uygulansaydı bir referans görseli,
hiçbir insan bakmadan tüm markanın tipografisini değiştirebilirdi.

**ÇIKTI HTML DEĞİL, VERİ** — bu adımın tek gerçek kısıtı. Saha taramasındaki sekiz aracın
hepsi referanstan HTML üretiyor ve o an üç şey ölür: golden tipografi metriği bir belge
modeline karşı ölçülüyor (serbest HTML'e karşı değil), `COMPOSE`/`RENDER` sınırı silinir,
ve Türkçe garantisi font yükleme yolunun TEK olmasından geliyor.

**BANT REFERANSTAN TÜRETİLEMEDİ — ve betik bunu SÖYLÜYOR.** Ham aralık **%2–97**, yani
95 puan; makullük tavanı 40. Bir eğri bandının anlamı sınırın DAR bir aralıkta salınması,
%2–97 "her yerde" demek. Sebep 10.2'de zaten ölçülmüştü: yan slaytlar piksel piksel
bitişik (tam zemin renginde **0/800** sütun), yani bölge ≠ slayt ve ölçüm iki slaydın
eğrilerini slayt kenarlarıyla karıştırıyor.

**Sayı YAZILMADI.** Yazılsaydı kaynağı unutulduğunda ölçüm sanılırdı. Bu fazda aynı sınıf
hata altı kez tekrarladı — palet yuvarlaması %97,8 · T11 krom puntolarını saydı · batarya
çapaları her tur kırıldı · `SAYISAL` deseni `%4`ü kaçırdı · tırnak mutlak konumdaydı ·
bölge sayısı sessizce 2 çıkıyordu. **Sayı üretiyor olmak, ölçüyor olmak değildir** ve
makullük kapısı bu cümlenin koda dökülmüş hâli.

**Bant yürürlükte %69–78 ve kaynağı bir KISIT, referans değil:** metin sütunu %62 olmak
zorunda çünkü `taşıyabileceğimizin` 64 px'te 582 px içerik genişliği istiyor. Referans
İngilizce ve daha dar sütunla idare ediyor. Referansı birebir kopyalamak Türkçe metni
eğrinin içine sokardı — **uyarlama sapma değildir.**

**Geri alma maliyeti:** yok — `VARSAYILAN` bugünkü değerleri taşıyor, davranış değişmedi.

## D-258 — Görsel içeren slaytta renk metriği ölçülmez

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.7 · §11.1

Kabul koşusunun ilk denemesi `kalite` adımında **durdu**: slayt 2 palet dışı %17,7 verdi,
limit %15. O slaytta bir AI fotoğrafı vardı. **Fotoğraf tanımı gereği palet dışıdır** —
o sayı fotoğraf hakkında bir olgu, tasarım hakkında bir kusur değil. Kapı, sistemin
üretmesi gereken şeyi reddediyordu (D-251'in birebir tekrarı).

**Karar:** görsel bloğu taşıyan slaytta ΔE ve palet dışı okumaları **ÜRETİLMİYOR**.
Sıfır yazılmıyor: `measure.ts`in kendi kuralı, ölçülemeyen metriği sıfır yazmanın hiçbir
şey ölçülmediği anda yeşil yakmak olduğunu söylüyor. Kaplama ve en-boy etkilenmiyor —
ikisi belge modelinden hesaplanıyor, pikselden değil.

**İlk düzeltmem FAZLA GENİŞTİ ve bunu ancak koşuyu tekrarlayınca gördüm.** `doc.blocks`a
bakıyordum; ama `uret.mjs` her slayt için AYNI belgeyi geçiyor, yani karoselde tek bir
görsel olsa bile ÜÇ slaytın üçünde de renk QA'sı kapandı. Kapı yeşile döndü ve *doğru
sebepten değil*. **Sessiz kapanma, kırmızı bir kapıdan tehlikelidir: kimse fark etmez.**

**Otorite ÜRETİCİDE.** `renderBody` artık `gorselliSlaytlar` indeks listesi yayınlıyor —
hangi bloğun hangi slayta düştüğünü bilen tek yer sayfalayıcı. Tüketicinin tüm belgeye
bakıp tahmin etmesi, bu deponun en sık tekrarlayan hatasının bir başka yüzüydü.

**Doğrulandı:** slayt 1 (görselsiz) dört okuma alıyor, slayt 2 (fotoğraflı) yalnız
kaplama ve en-boy; `kalite` geçiyor ve hat uçtan uca yeşil koşuyor — `gorsel-yargi`
adımı dahil.

**Geri alma maliyeti:** yok — bayrak verilmezse eski davranışa düşüyor.
