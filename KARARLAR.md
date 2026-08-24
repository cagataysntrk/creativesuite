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

> **D-299 · D-300 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> İkisi de kapandı ve kodda yaşıyor: hayalet öge şablonun kararı (`katalog.ts`),
> `hayalet-carpisma` kusuru denetimde. Atıf bütünlüğü korunuyor (R-62), tavan
> açıldı (R-63) — bir kararı arşive taşımak onu iptal etmez.

> **D-301 · D-302 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> İkisi de kapandı ve kodda yaşıyor: elle düzenleme koşu defterine iniyor
> (`panorama-elle.json`), defter görseli REFERANS tutuyor ve okuma tarafındaki
> çeviri `gorselleriGom`da. Atıf bütünlüğü korunuyor (R-62), tavan açıldı (R-63).

> **D-303 · D-304 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> İkisi de kapandı ve kodda yaşıyor. Atıf bütünlüğü korunuyor (R-62), tavan
> açıldı (R-63).

> **D-305 · D-306 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> İkisi de kapandı ve kodda yaşıyor. Atıf bütünlüğü korunuyor (R-62), tavan
> açıldı (R-63).

> **D-307 · D-308 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> İkisi de kapandı ve kodda yaşıyor. Atıf bütünlüğü korunuyor (R-62), tavan
> açıldı (R-63).

> **D-309 · D-310 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`.
> İkisi de kapandı ve kodda yaşıyor. Atıf bütünlüğü korunuyor (R-62).

## D-328 · Dört kez aynı şekilde kırılan dosya bir kapı hak eder

**Olay.** `panorama-denetim.ts` içindeki `OLCUM` bir şablon dizesi ve gövdesi tarayıcıda
koşuyor. O gövdeye Türkçe bir yorum yazarken kod alıntısını ters tırnakla göstermek —
`` `contain` `` gibi — diziyi ORADA bitiriyor. Geri kalan her şey TypeScript sanılıyor ve
hata ölçümle ilgisiz bir yerde patlıyor: *"Property 'ray' does not exist on type
'string'"*.

**Dördüncü kez oldu.** Dosyanın kendi yorumunda *"bu bölgedeki yorumlar ters tırnaksız
olmalı"* yazıyordu. Yazılı olması yetmedi — bu, R-87'nin dersinin aynısı: kural kataloğa
yazılıydı, ölçüm yoktu.

**Karar.** `olcum-ters-tirnak` kapısı. Kapsam DAR ve bu bir gevşetme değil, kapının
çalışabilmesinin şartı: yalnız üç tarayıcı gövdesi, yalnız yorum satırları, yalnız
ÇIPLAK ters tırnak — kaçırılmış olan meşru ve sık kullanılıyor.

**Kapı iki kez yanlış pozitif verdi ve ikisi de düzeltildi.** (1) Kaçırılmış ters
tırnakları da ihlal saydı. (2) Gövdenin açılışını "ilk ters tırnak" sanıp sabitin
ÜSTÜNDEKİ JSDoc'ta duran kod alıntılarını gövde içi gördü; üç gövde de `(() => {` ile
açılıyor ve aranan o. Yanlış pozitif de bir hatadır: okunmayan kapı, olmayan kapıdır.

**Kanıt.** Kural kasten ihlal edildi — tek bir yoruma ters tırnak konup kapı kırmızıya
döndü, geri alınınca yeşile.

## D-329 · Ölçek tek tabandan — ve tek tuvalde görülemeyen kusur sınıfı

**Bulgu.** Sistemin ölçeklenen yanı doğruydu: başlık ikili aramayla, gövde
`GOVDE_TABANI_1080` ile, panel `--panel-olcek` ile tuvale bağlıydı. **Krom değildi.**
`.ray-logo{24/104px}`, `.kilometre-nokta{13px}`, `.kilometre-etiket{16px}`, rayın
`font-size:18px`i ve kart dolgusu çıplak piksel olarak duruyordu.

**Kusur tek tuvalde görülemez.** Tek tuvalde her sayı doğru GÖRÜNÜR çünkü referansı
yoktur; hata ancak iki tuvalin ORANI karşılaştırılınca ortaya çıkıyor. Bu, bu depodaki
"bakarak bulunan" kusurlardan farklı bir sınıf: bakmak yetmiyor, İKİ kez bakıp
karşılaştırmak gerekiyor.

**Karar.** 1080'de ölçülmüş her sayı `olc(px) = round(px × G / 1080)` ile çevriliyor.
Tek taban: ikinci bir çarpan, bir gün birinin unutulması demek.

**Test iki tuval koşuyor** ve `null`u "geçti" saymıyor — öge çizilmemişse ölçüm
yapılmamıştır. Kasten ihlal edildi: tek bir `olc(18)` çıplak `18px`e döndürüldü ve test
*"ray puntosu: 18 → 18, beklenen ≈22,5"* diyerek kusuru ADIYLA söyledi.

**Taban çizgisi ızgarası bu adımda KAPANMADI.** 18.13 iki iş taşıyordu; ikincisi ayrı bir
adım (18.13b). Sebep ölçülerek anlaşıldı: kartın dış dolgusu bir çerçeve, metin ritminin
parçası değil ve 54'ün yarımlarına izin vermek kuralı anlamsız kılıyordu — 27 ile
neredeyse her sayı ifade edilebiliyor. Bir kuralı esneterek kurtarmak, onu kaybetmektir.

## D-330 · Taban çizgisi ızgarası METİNDEN türüyor — sabit 54 px yanlıştı

**Faz planı bir sayı varsayıyordu:** `TABAN = gövdePuntosu × satırAralığı = 40 × 1,35 =
54 px`. **Ölçüldü ve ikisi de yanlıştı.** Gerçek satır aralığı **1,50**, gövde puntosu ise
şablondan şablona değişiyor: 54 · 54,9 · 59,1 · 60,6 · 61,2 px. Sabit 54, altı şablonun
**beşinde** yanlış bir ızgara dayatırdı.

**Neden değişken.** Gövde puntosu `max(taban, başlıkPuntosu × oran)`; başlık puntosu ise
ikili aramanın sonucu ve metne bağlı. Taban ancak ölçüm KOŞTUKTAN sonra bilinebiliyor —
bu yüzden `puntoOlcumu` artık `--taban`ı da yazıyor ve CSS boşlukları `calc(var(--taban)
* N)` ile ondan türüyor. Ritim metinden geliyor; Müller-Brockmann'ın kastettiği de bu.

**Kapsam DAR ve ölçülerek belirlendi.** Ölçüm gösterdi ki YAZILI yalnız üç boşluk var
(14 · 44 · 132); geri kalan her şey `margin-top: auto`nun artığı ve tasarım kararı değil.
Üst başlık → başlık boşluğu da İSTİSNA: ikisi tek birim, aradaki 14 px bir blok aralığı
değil bir etiket bağlantısı. Tabana çevirmek onları birbirinden koparırdı.

**Kural render'da SINANAMAZ.** `getComputedStyle().marginTop` `auto` için de KULLANILAN
pikseli döndürüyor; tabana bağlanmış bir boşlukla `auto` bir boşluk tarayıcıda ayırt
edilemiyor. İki ayrı sınav: üretilen CSS tabanı çağırıyor mu, ve `--taban` gerçekten
KURULUYOR mu. İkincisi olmazsa yedek değer sessizce devralır ve her şablon yanlış ritme
döner — bu deponun tekrar eden kopukluğu. Zincir kasten koparıldı: altı şablon da
*"--taban hiç kurulmamış"* diyerek kırmızıya döndü.

## D-331 · `KURALLAR.md` tavanı 480 → 520: D-322'nin sözü artık bağlamıyor

**D-322 şöyle demişti:** *"tavan kalkmıyor, bir kez yükseliyor."* O söz, tavan dolduğunda
doğru cevabın SIKIŞTIRMAK olduğu varsayımıyla verildi. D-325 o varsayımı reddetti ve
yapısal cevabı adlandırdı: gerekçeler ayrı dosyaya. **O iş yapıldı** —
`docs/kurallar/OLCUMLER.md` on beş kuralın ölçülmüş kanıtını taşıyor ve `KURALLAR.md`
480'den 464'e indi.

**Şimdi doluluk başka bir şey anlatıyor.** 71 kural, 480 satır: kural başına **6,8 satır**
ve bunun ikisi başlık ile boş satır. Kalan dört satır beyan + neden + zorlama demek.
Bundan sonra sıkıştırmak metin kısaltmak değil, **bilgi silmek**.

**Dört tur üst üste yeni bir kural ancak eski kuralların gerekçesi budanarak sığdı** —
D-322'nin kendi gerekçesi tam olarak bunun yapılmaması gerektiğini söylüyor.

**Karar.** Tavan **520**. Yeni pay yine sınırlı (≈sekiz kural) ve dolduğunda cevap yine
yükseltmek olmayacak: sıradaki yapısal hamle kural kitabını halkalara bölmek
(`KURALLAR.md` mimari + süreç, `docs/kurallar/TASARIM.md` render ailesi).

**Neden R-76 ihlali değil.** `docs-size` kırmızı DEĞİL — 480'de, tavanın tam üstünde
değil. Yükseltme bir kapıdan kaçmak için değil, kendi kararıyla ve gerekçesiyle yapılıyor.
⚠ Yine de bu hamle bir kez daha tekrarlanırsa şüpheyle bakılmalı: **tavanı yükselterek
korunan bir belge, tavansız bir belgedir.**

## D-332 · Font ve logo da devralınır — ve marka-nötr bir modülde marka adı

**Bulgu.** `brd_dima` token sisteminin kalıtımını kullanan gerçek bir alt marka: `parent`
dosyası `brd_upcytech` diyor, yalnız `state-ok` rolünü eziyor ve kendi kaydı *"ezmediğin
şey MİRASTIR"* yazıyor. **Font ve logo o cümlenin dışındaydı.** Ölçüldü: sekiz font
eksik, `uret.mjs` `exit(1)`. Yani dima bir alt marka gibi tanımlıydı ama koşamıyordu.

**İkinci kusur eksik listesinin kendisinde duruyordu:** aranan dosyalar
`upcytech-mavi.png` ve `upcytech-siyah.png`. Marka-nötr bir modülde bir markanın adı.
İkinci marka kendi işaretini KOYAMAZDI — dosyanın adı başka bir markanın adıydı. Adlar
`isaret-koyu` / `isaret-acik` oldu: seçim zeminin açıklığından yapılıyor, markadan değil.

**Kopyalamak alternatif değildi.** Sekiz woff2'yi her alt markaya kopyalamak, kopyanın
bir gün ayrışması ve iki markanın aynı ada sahip iki farklı fontla üretim yapması
demekti — D-252'nin çözdüğü hatanın alt marka ölçeğinde tekrarı.

**Zincir "dizin var mı" diye sormuyor, "sonuç TAM mı" diye soruyor.** İlk tasarım "dizin
varsa onu al" idi; alt markanın boş bir `fonts/` klasörü zinciri orada keser ve koşu yine
fontsuz kalırdı. Kısmi devralma da yok: yarısı kendinden yarısı atasından gelen bir
tipografi, iki markanın karışımıdır.

**Test modülü değil ÇAĞRIYI sınıyor** — R-92'nin dersi. `uret.mjs` bir CLI, import edilip
çağrılamıyor; bu depoda "modül var, test yeşil, üretim yolu yok" sekiz kez tekrarlandı.

## D-333 · Token yüzeye göre çözülür — birleşim iki canlı kusuru gizledi

**Bulgu.** `token-cagrisi` kapısı (D-320) tanımlı token'ları `tokens.css` dosyalarının
BİRLEŞİMİNDEN topluyordu. Ama bir kaskat dört blok taşıyor — `:root`, `console`,
`kreatif`, `studio` — ve aynı değişken hepsinde yeniden tanımlı. Birleşimde "tanımlı"
görünen bir değişken, kullanıldığı yüzeyde TANIMSIZ olabiliyor.

**İki canlı kusur.** (1) `--role-state-danger` yalnız `kreatif` bloğunda tanımlıydı;
kabuk `data-surface="console"` ile koşuyor. Ölçüldü: `.is-uyari` ile `.is-hat` ikisi de
`oklch(0.97 0.004 250)` — panelde *"⊘ kusurlu manifest"* ve *"✎ N slayt elle
düzenlendi"* uyarıları gövde metniyle **birebir aynı renkte** çiziliyordu. (2) Kapı
yüzey başına çözecek şekilde düzeltilir düzeltilmez DOKUZ kusur daha çıktı:
`--role-accent` da yalnız `kreatif`te tanımlıydı ve kabuk onu dokuz yerde çağırıyor —
aktif sekmenin çerçevesi dahil.

**Ders `koyuMu()`nunkiyle aynı:** *doğru dosyayı okumak, doğru YERİ okumak değildir.*

**Karar.** Kapı yüzey başına çözüyor. Dizinden yüzeye küçük bir harita: `apps/ui/` →
console, `packages/render/` → kreatif, `packages/ui/` → console **ve** studio (kabuk
teması ikisinde de çiziliyor, ikisinde de tanımlı olmalı). Eşlenmemiş dosya birleşime
düşüyor ama SAYISI raporlanıyor — sessizce genişleyen bir istisna, istisna değil deliktir.

**Ad çatallanması kapatıldı.** `state-danger`/`state-error` bir kavramın iki adıydı;
`kreatif` de artık `state-error` diyor. Bir kavramın iki adı, birinde tanımlı öbüründe
tanımsız olmak demekti.

**`accent` rolü console ve studio'ya eklendi**, adım YÜZEYİN AÇIKLIĞINDAN seçilerek
(D-318): koyu konsolda `mavi-500`, kâğıt studio'da `mavi-600`.

**Gözle doğrulandı.** Panel açıldı ve BAKILDI: uyarı artık kırmızı, aktif sekmenin
çerçevesi mavi. İkisi de bu turdan önce ölüydü.

⚠ **BORÇ: `ui-tema` kapısı yorum ile bildirimi ayırmıyor.** Bu düzeltmenin gerekçesini
yoruma yazarken ölçülen renk değeri ihlal sayıldı. `token-cagrisi` ve `olcum-ters-tirnak`
yorum satırlarını atlıyor; `ui-tema` atlamıyor. Aynı turda düzeltilmedi — kapı KIRMIZIYKEN
kuralını gevşetmek yasak (R-76), yanlış pozitif bile olsa. Ayrı bir turda.

## D-334 · Yasak terim listesi öbeklerden kurulur — ve kanonik liste tek yerde

**Bulgu.** `YASAK_TERIMLER` altı terimdi; sistemin kendi sözlüğü ~20. Eksik olanlar
rastgele değildi: en sık kullanılan boş sıfatlar (`yenilikçi`, `öncü`, `akıllı`,
`çözüm odaklı`) hiç yoktu. Liste kısa olduğu için değil, **yanlış kısa** olduğu için üç
canlı ihlal corpus'ta duruyordu.

**Ölçüt "abartılı" değil, YANLIŞLANAMAZ.** Yasa 8 kaynaksız SAYISAL iddiayı yasaklıyor;
bu liste onun nitel kardeşi. *"Sektör lideri"* yanlışlanamaz; *"pazar payı %31
(kaynak)"* yanlışlanabilir ve meşrudur.

**Liste ÖBEKLERDEN kuruluyor, çıplak sıfattan değil.** `çözüm` tek başına meşru bir
kelime (bir denklemin çözümü); `çözüm odaklı` boş bir sıfat. `akıllı` tek başına meşru
(akıllı telefon); `Akıllı <Ürün>` bir üstünlük iddiası. Çıplak sıfat listesi doğru
cümleleri de kırmızıya çevirir ve **okunmayan kapı, olmayan kapıdır.**

**Üç canlı ihlal kapatıldı:** `veri-katmanindan-karara.md` *"Akıllı GenBI"* → *"Doğal
dilden sorgu (GenBI)"* · `imalat-verimlilik-konumu.md` *"özel çözümler"* → *"tesise özgü
yazılım"* · `olcum-mesaj-evi.md` yasak listesini KOPYALIYORDU ve kendi yasağını ihlal
ediyordu — artık listeyi adıyla anıyor.

⚠ **`era.yaml` DEĞİŞMEZ.** Dönem dosyası da *"özel çözümler"* içeriyor ama bir dönem
damgası geçmişin kaydıdır; düzeltmek geçmişi değiştirmek olurdu. Yeni dönem açıldığında
metin düzelir; o güne kadar kayıt burada duruyor. Linter `corpus/`e bakıyor, `brand/`e
değil — bu bilinçli.

**Hayalet yol kapatıldı ve KÖKÜ bulundu.** İki kayıt ve `ANAYASA.md` kanonik listeyi
`registry/lexicon/tr` diye gösteriyordu — **böyle bir yol yok.** Kök `kesif-roportaj.mjs`
ŞABLONUNDAYDI: üretilen her yeni kayıt hayalet yolu taşıyacaktı. Dördü de gerçek yeri
(`YASAK_TERIMLER`) gösteriyor.

## D-335 · Kaynak satırı sessizce kaybolamaz — imzasız çıktı imzalı sanılıyordu

**Faz maddesi *"kaynak satırı bizde HİÇ yok"* diyordu ve ÖLÇÜM aksini gösterdi.** Yuva
var (`rayaOrta`), rayda mono büyük harfle çiziliyor, `sablon-uyarla` onu doğruluyor
(boşsa ve örnek işaretini taşıyorsa reddediyor) ve uyarlama istemine yazılı. Madde
bayatlamıştı — FAZ-15'in ray çalışması onu zaten getirmişti.

**Gerçek açık başka yerdeydi ve ölçülerek bulundu:** boş bir `rayaOrta` **boş bir
`<span>`** basıyordu. Hiçbir şey çizilmiyor, slayt kusursuz GÖRÜNÜYOR ve kaynağını
kaybetmiş oluyor. Sistemin tek imzası kaynak satırıdır (§8); eksikliği gizlenirse
imzasız bir çıktı imzalı sanılır ve insan kapısı onu onaylar.

**Karar.** Boş kaynak **kesikli bir kutu** basıyor: `KAYNAK YOK`. Yer tutucu görselle
birebir aynı desen — eksik olan şey önce GÖRÜLMELİ, sonra raporlanmalı. Rengi zeminden
türüyor: sabit kırmızı kâğıt kartta da koyu kartta da yanlış olurdu (R-95 ailesi).

**Ölçüm düzeltmenin kendisini arıyor:** `kaynak-yok` kusuru kesikli kutuyu sorguluyor —
kutu varsa kaynak yoktur. Böylece iki mekanizma ayrışamıyor.

**Çizildi ve BAKILDI:** rayda `UPCYTECH · GERİ KAZANIM · [KAYNAK YOK] · 01/06`, kesikli
çerçeve net görünüyor.

## D-336 · Kural kitabı halkalara bölündü — mimari + süreç · tasarım

**D-331 sıradaki hamleyi önceden adlandırmıştı:** *"dolduğunda cevap yine yükseltmek
olmayacak; sıradaki yapısal hamle kural kitabını halkalara bölmek."* İki kural sonra
doldu ve hamle yapıldı.

**Bölme konuya göre, boyuta göre değil.** R-83 … R-104 tek bir konu: bir karoselin nasıl
çizildiği. Mimari ve süreç kurallarını her turda okuyan biri onları okumuyor; karosel
üstünde çalışan biri ise yalnız onları okuyor. `KURALLAR.md` 530 → **365** satır.

**`citations` iki dosyayı da tarıyor** ve bir `R-nn`in İKİSİNDE birden olmasını
REDDEDİYOR — `KARARLAR.md` ile arşivi arasındaki sözleşmenin aynısı (D-72). Taşınmış bir
kuralın eski kopyası sessizce yaşamaya devam edemiyor.

**Üç katman, üç dosya, tek numaralandırma:** beyan + zorlama (`KURALLAR.md` ya da
`TASARIM.md`) · ölçülmüş kanıt (`OLCUMLER.md`) · karar ve bağlam (`KARARLAR.md`).

⚠ **Kapı bir UYDURMA ATIF yakaladı.** Bu turda var olmayan bir karar numarasına atıf
yazdım ve beş dosyaya yaydım; arşiv sıfır dolgusuz biçim kullanıyor ve o numara başka bir
konuya ait. Atıf sözlüğünün tek anlamlı olması tam da bunun içindir — kaynak satırının
gerçek yeri Anayasa'nın imza bölümü.

> **D-337 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`. Şablon ailesi 6 → 10;
> yeni şablon yazmak eski şablonların DENETİMİDİR.

> **D-338 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`. Kök eşleşmesi ünsüz
> yumuşamasını bilmiyordu.

> **D-339 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`. Aile sınavı ölçülebilir —
> "bakılır" tek başına bir kapı değil.

> **D-340 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`. Sessiz emeklilik bir
> tuzaktır — ve gerçek bir koşuda yakalandı.

> **D-341 arşive taşındı** → `docs/kararlar/ARSIV-2026.md`. Taşıyıcılar atmosfer
> olarak çiziliyordu — üçü de görünmüyordu.

## D-342 · `blob` lekesi emekli — kararla çelişen, kullanılmayan bir süs

**Gerekçesi kendi kendini çürütüyordu.** Kodun yorumu *"hacim için gereken şey DEGRADE +
GÖLGE"* diyordu ve **D-318 tam olarak onları emekli etti**: degrade, glow, atmosferik
renk. Karar verildi, dal kaldı — ve kataloğun on şablonundan HİÇBİRİ onu kullanmıyordu.

**D-306'nın madalyonuyla aynı gerekçe:** kullanılmayan, sonraki bir kararla çelişen ve
R-81'in tam hedefinde duran bir süs. Bir `radialGradient` + `feDropShadow` çifti, "3B
öge" görüntüsünü taklit etmek için kurulmuştu; sistem o görüntüden vazgeçti.

**Yan kazanç: `kodlanmis-oge` tavanı rahatladı.** Alan sınırına eklenen hairline yedinci
SVG yolunu getiriyordu ve kapı haklı olarak kırmızıya döndü. Yer açan şey bir GEVŞETME
değil, ölü kodun gitmesi oldu — **R-76'nın dilediği tam olarak bu:** tavanı yükseltmeden
önce, tavanı dolduran şeyin hâlâ gerekli olup olmadığını sor.

⚠ `lekeler`in diğer tipleri (`daire` · `halka` · `kare` · `nokta` · `tarama`) duruyor:
onlar düz dolgu, yani sistemin diliyle uyumlu.

## D-343 · Katalog beyanını üretimde kimse okumuyordu — yarım ölçülen bir kapı

**Bağlam.** Izgaraya bakıldı; `memphis` kapağında metin bloğu ile figür arasında ölü bir
kuşak görünüyordu. Denetim *"0 kusur"* diyordu.

**Ölçüm.** İki alet zıt cevap verdi: kutu ölçümü `memphis`i ailenin en iyisi (%17),
mürekkep ölçümü en kötüsü (%53) saydı. Kutu `.gorsel` YUVASINI okuyor, kesik PNG'nin
saydam kenar payını dolu sayıyor. Göz mürekkebe bakar. Ayrıntı `OLCUMLER.md`.

**Sebep beklenenden derinde çıktı.** Yarık geometrik değil SÖZLEŞMESELDİ: katalog
`memphis` için `adet: 'slayt-basina'` (altı) ilan ediyor, örnek üç yuva veriyordu.
Özneler 1., 3. ve 5. slayda düşüyor; 2., 4. ve 6. slaytta metin bitiyor ve altında
hiçbir şey kalmıyordu.

**Asıl bulgu.** `gorsel.adet` üretimde **hiç kimse tarafından okunmuyor** — arandı, tek
tüketici `kirpma`. Sayıyı `ORNEKLER`in yuva adedi sürüyor. Ve kapı VARDI:
`toBeGreaterThan(0)`. Beyanın yanlış yarısını ölçüyordu. **Yarım ölçülen bir beyan,
ölçülmeyen bir beyandan tehlikelidir** — yeşil tik ikisini de kapsıyor sanılır. Zincir
kopukluğunun yeni bir türü: modül var, test yeşil, ama test yanlış soruyu soruyor.

**Karar.** Beyan bağlayıcı: yuva sayısı `adet` ile EŞİT. `memphis` üç → altı yuva (her
biri kendi slaydının ortasında, iki yakada 281 px açıklık), `editoryal` beyanı 2 → 3.
Yarık %53 → %27, kenar payı %44 → %3. Kasten ihlal edildi, kırmızı döndü ve şablonu
adıyla söyledi. → R-110

## D-344 · İki hayaletin ikisi de kendi etiketini tekrarlıyordu

**Bağlam.** Izgaranın on kapağına bakıldı. `dizin` ve `kavis` kapaklarında dev soluk bir
kelime var ve ikisi de üst etikette yazan kelimenin aynısı.

**Ölçüm.** Ailede hayalet taşıyan kart iki tane; ikisi de tekrar — **2/2**. Yedi şablon
`hayaletKonumu` ilan ediyor ve hiçbirinde hayalet yok (D-299 kasten kapatmıştı; bu kusur
değil, karar). Yani cihaz nerede kullanılıyorsa orada bilgi taşımıyordu.

**Denenen ve reddedilen.** `kavis`in hayaleti `01` yapıldı; `sus-baskin` kırmızı döndü —
hayalet genişliğe göre ölçeklendiği için iki karakter kartın %28'ini, içerik %26'sını
tutuyor. **Kısa hayalet uzun olandan büyüktür.** Daha uzun bir kelime de çıkmaz:
`TEKRAR` başlıkta ve gövdede geçiyor.

**Karar.** `dizin`in kapak etiketi `DİZİN` → `ADIM 01`: hem hayalet tekrarı bitti hem
etiket serisi (ADIM 01–04) tamamlandı — kapak zaten ilk adımı listeliyordu. `kavis`in
hayaleti kaldırıldı: o şablonun taşıyıcısı kemer bandı, hayalet D-299'un artığıydı.
Cihaz artık tek yerde ve orada artefaktı ADLANDIRIYOR. → R-111

## D-345 · Bir yerleşim değeri ölmüştü ve hiçbir kapı söylemedi

**Bağlam.** `donen` kapağına bakıldı: üst etiket kadrajın tepesinde yapayalnız, başlığı
kadrajın ortasında, gövdesi dibinde. Üç metin bloğu birbirinden kopuk.

**Ölçüm.** Etiket→başlık açıklığı: ailenin sekiz şablonunda her kartta tam **14 px**,
`donen`de **369/331/362/362**. Varyasyon değil, bambaşka bir ilişki. Sebep `donen`in tek
kullanıcısı olduğu `yerlesim: 'yayik'` = `space-between`: boşluğu dört ögeye TEK TEK
dağıtıyor ve ilk kurban, adlandırdığı şeyden koparılan etiket oluyor.

**Düzeltme İKİ KEZ yanlış yere kondu ve ikisi de SESSİZ kaldı.** `.govde { margin-top:
auto }` önce ritim kuralından önce yazıldı — aynı özgüllükte sonra gelen kazandı. Sonra
"sonrasına" konduğu sanıldı; oysa `.govde` kuralı çok satırlı ve orada kapanmamıştı,
kural bir bildirim bloğunun İÇİNE düşüp geçersiz oldu. İkisinde de hesaplanan değer
`54px` kaldı, yayık yerleşim sessizce `ust`a dönüştü — **bir yerleşim değeri ölmüştü.**

**Kasten ihlal denemesi bir yanılgıyı da düzeltti.** `yayik` `space-between`e geri
çevrildi ve test YEŞİL kaldı: otomatik pay boş alanın tamamını yutuyor, `justify-content`e
dağıtacak bir şey kalmıyor. Yükü taşıyan satır sanılan yer değildi. Kural ancak auto
payı kaldırınca kırmızı döndü: *"donen etiket→başlık açıklığı: expected 361 to be 14"*.

**Karar.** Yayılma öbek-farkında: başlık öbeği (etiket + başlık) üstte tek parça, gövde
dibe. Ölçü eşitlik — tavan yazmak 300 px'lik kaymayı meşru kılardı. → R-112

## D-346 · Sağ yaslı kart bir sütun değil, "sağa itilmiş kutular"dı

**Bağlam.** `sahne`nin 2. slaydına bakıldı: üst etiket "— SORUN" başlığın sol kenarından
kopuk, tek başına içeride duruyor. Başlık ve gövde aynı sol kenardan başlıyor, etiket
başka bir yerden.

**Ölçüm.** Etiketin ve gövdenin sol kenarı başlığınkinden ne kadar sapıyor: sol yaslı
kartların **hepsinde 0 · 0**. Sağ yaslı DÖRT kartın dördünde de kaymış — `sahne` 2/4
(+343), `kavis` 3 (+538, gövde −64), `karsilastirma` 2 (+597, gövde +108). Üç şablon,
tek sebep: `align-items: flex-end` her bloğu ayrı ayrı sağa itiyor ve kutular
içeriklerine göre daraldığı için üç bloğun üç ayrı sol kenarı oluyor.

**Karar.** Sağ kart bir SÜTUNDUR. Hizalama değiştirilmedi — kart sola yaslı kalıyor ve
sol dolgu sütunu sağ yakaya taşıyor; `text-align` dokunulmadan duruyor. Sütun, başlık
kolonu ile gövde ölçü sınırının BÜYÜĞÜ: küçüğünü almak geniş olanı sağdan taşırırdı.
Ölçü mutlak sıfır — tolerans 300 px'lik bir kaymayı "biraz" yapardı. Kasten ihlal
edildi: *"sahne: expected 343 to be +0"*. → R-113

## D-347 · Düzen provası: para harcanmadan ÖNCE render, kelime sayarak değil

**Bağlam.** Şablonlar "kasten kısa" örnek metinlerle ayarlanmıştı ve tavanda kimse render
etmemişti. R-89'un izin verdiği metinle on şablonun sekizi kırılıyor; ölçüm ve kapasite
tablosu `OLCUMLER.md`'de.

**Reddedilen çözüm: şablon başına kelime bütçesi.** Sayılar ölçüldü (12 → 27, 2,25 kat)
ve kataloğa yazılabilirdi. Yazılmadı, çünkü **kelime geometrinin vekilidir ve kötü bir
vekildir:** aynı kelime sayısı iki katı genişlik verebiliyor. `donen`in kapasitesi
kelimeyle İFADE EDİLEMEDİ — başlık 3'e, gövde 0'a inse bile kusurluydu. Bir büyüklüğü
ölçemiyorsan ona kural bağlayamazsın.

**Karar: düzen PROVASI.** `panoramaDenetle` bu kusurların hepsini zaten görüyor; tek
sorunu para harcandıktan sonra koşması. Prova, uyarlanmış metni YER TUTUCU görsellerle
render edip denetler: API maliyeti sıfır, ölçtüğü şey geometrinin kendisi, ve `donen`in
"kelimeyle ifade edilemez" hâlini de kapsıyor.

**Yeri kritik ve hat sırası onu belirledi.** `metin-onayi` kapısı `sablon-uyarla`
ADIMINDA (`.yaml` satır 69), yani `kompozit` ve `gorsel-uret`ten önce — doğru yer. Ama
bugün insan, düzeni HİÇ prova edilmemiş bir metni onaylıyor. Prova o adımın gövdesinde,
kapıdan önce koşmalı: insan sığdığı GÖRÜLMÜŞ bir metni onaylasın.

⚠ **`uyarla` saf kalıyor.** Prova adım gövdesinde (`bodies.ts`), `uyarla`nın sonrasında;
saf bir işlevi tarayıcıya bağlamak onu test edilemez yapardı.
⚠ R-89 KALIYOR — ucuz ön eleme ve modele verilen talimat olarak. Emekli edilen şey onun
TEK KAPI olması. → R-89 · `OLCUMLER.md`
