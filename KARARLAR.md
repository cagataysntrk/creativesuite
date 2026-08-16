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

## D-214 — Tavan sayısı KURALLAR.md'den okunur, koda ikinci kez yazılmaz

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6.7 · R-36 · R-74

Adımın 🧪 kriteri şuydu: *"tavanı 6'ya çıkarmayı dene → `KURALLAR.md` değişmeden kod
değişmiyor"*. Bunu bir temenni olarak bırakmak mümkündü; kapıya bağlamak da mümkündü.

**Karar:** `kisisellestirme` kapısı sayıyı `KURALLAR.md`'deki R-36 satırından **okur** ve
koddaki sabitle karşılaştırır. İki yerde iki farklı sayı yazması artık derleme değil ama
**kapı** hatasıdır. Kuralın yazılı hâli ile kodun hâli, ancak biri diğerinin kaynağıysa
ayrışamaz.

**Alternatif (reddedildi):** sayıyı yalnız kodda tutup kural kitabına "koda bak" yazmak.
O zaman kural kitabı, kuralı bilmeyen bir belge olurdu — ve bu projede kural kitabının
tek işi kuralı bilmek.

**Genel biçim:** bu desen sayı taşıyan her kural için tekrarlanabilir (tazelik 14 gün,
sayfa tavanı 10). Şimdilik yalnız R-36'ya uygulandı; diğerleri kendi adımlarında
bağlanır — bir deseni ihtiyaç doğmadan genelleştirmek, kullanılmayan soyutlama üretir.

**Geri alma maliyeti:** düşük — kapı tek dosya.

## D-215 — Güvenli alan KENDİ tarihini taşır, satırın tazeliği onu kapsamaz

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-7.1 · §9.1

Spec tablosu 3.15'te kuruldu, drift denetçisi 4.17'de doctor'a bağlandı. 7.1'de kriteri
**ölçerken** boşluk çıktı: `specAgeDays` yalnız `placement.verifiedAt`i okuyor, oysa
`safeArea`nın **kendi** `sourceUrl` + `verifiedAt`i var. Ölçüm: güvenli alanı bir yıl
geriye alınmış bir satır için denetçi **1 gün** diyordu.

**Neden önemli:** güvenli alan ölçüleri Reels tasarım kılavuzundan gelir ve platform
ölçüsünden **bağımsız** değişir. Biri tazelendiğinde diğeri tazelenmiş sayılamaz. Yanlış
bir güvenli alan başlığı UI chrome'un altına düşürür — ve bunu ancak yayınladıktan sonra
fark edersiniz.

**Karar:** `specStaleness(p, today)` iki tarihi **ayrı ayrı** döndürüyor ve doctor iki
ayrı bulgu üretiyor. En eskisini alıp tek sayı vermek daha basitti ama hangi kaynağın
yenilenmesi gerektiğini gizlerdi — iki farklı URL'e bakan bir insan için o bilgi işin
kendisi (D-198).

**Ayrım korundu:** güvenli alanı olmayan satırda `safeAreaDays` **`null`**, `0` değil.
`0` "bugün doğrulandı" demek olurdu; `null` "böyle bir şey yok" demek.

**Kanıt:** güvenli alan tarihi geriye alındığında `⚠ [spec] instagram-story-9x16:
GÜVENLİ ALAN 592 günlük` çıktı; geri alınınca bulgu kayboldu.

**Ders (üçüncü kez):** yeni bir alan eklemek, onu OKUMASI GEREKEN her yeri güncellemeyi
gerektirir. Bu turda aynı sınıftan iki hata bulundu — `chart` bloğu lexicon linter'ında,
`safeArea.verifiedAt` drift denetçisinde. İkisinde de derleyici sustu.

**Geri alma maliyeti:** düşük.

## D-216 — FAZ 6 KAPANMADI: mekanizma yazıldı, üretim yoluna bağlanmadı

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6 kapanış turu (LOOP§D) · D-182

Bağımsız doğrulama agent'ı FAZ 6'nın **çekirdek iddiasını çürüttü**. `just verify` yeşil,
1087 test geçiyor, 12 kural kırmızıya döndürülüyor — ve buna rağmen sistem **hiçbir**
şirkete deck üretemiyor. Bulgular tek bir sınıfta toplanıyor: **kod yazıldı, üretim
yolunda çağıranı yok.**

| # | Ne | Kanıt |
|---|---|---|
| 1 | `renderDeckPdf` sıfır çağıran; RENDER gövdesi `format: pdf`i hiç okumuyor | diskte 0 PDF, 23 manifest'in hepsi post/carousel |
| 2 | `deck`/`prospect-deck` hatları plan aşamasında sağlayıcısız | `max_chars: 4000` desteklenmeyen kademe |
| 3 | `prospectDeckZinciri` sıfır çağıran; `chain:` kısıtını kimse okumuyor | VALIDATE gövdesi yalnız `kaliteKontrol` koşuyor |
| 4 | `INGEST` fiil gövdesi HİÇ YOK | `uret.mjs` fiil haritasında INGEST ve PROPOSE yok |
| 5 | Üç yeni manifest dedektörü ölü | hiçbir kod `fetchedAt`/`personalizationFields`/`productShots` yazmıyor |
| 6 | `captureProductShot` sıfır çağıran | testte bile yok |
| 7 | `chart` CSS'i statik yolda gömülmüyor | üretim PNG'sinde grafik bozuk, kapı görmüyor |
| 9 | `runVerb` (→ `ingestGate`) üretimde koşmuyor | `runPipeline` `verb.run`u doğrudan çağırıyor |

**Karar:** FAZ 6 **KAPANMADI**. Dokuz tik duruyor ama fazın kendisi açık; `DURUM.md`
bunu ilan ediyor ve kapanış ancak bulgular kapandıktan sonra tekrar denenir. Tikleri
silmiyorum — adımların ürettiği kod gerçek, testli ve doğru; eksik olan **bağlanma**.
Silmek yapılan işi de silerdi; asıl dürüst hamle eksiğin ADINI koymak.

**Kök neden — ve bu üçüncü tekrar:** D-182'de donmuş plan yazılmıştı, `uret.mjs`
çağırmıyordu. D-190'da düğmenin `onClick`i yoktu. Şimdi aynı hata **bir seviye yukarıda**:
`tazeMi`nin çağıranı var (`inspectManifest`), ama `inspectManifest` o veriyi hiç görmüyor
çünkü onu yazan yok. **"Çağıran var mı" sorusu bir adım değil, ZİNCİR sorulmalı:** üretim
girişinden kurala kadar kesintisiz bir yol var mı?

**Bu turda kapatılanlar:** bulgu 2 (kademe düzeltildi, hatlar planlanıyor) · bulgu 7
(CSS gömüldü + `blok-css` kapısı yazıldı, üç biçimde ihlal edildi).

**Batarya genişletildi:** `blok-css` ihlali "yeni dosya yaz" biçimiyle ifade edilemiyordu;
batarya artık **yama** modunu da destekliyor. Desteklemeseydi, bataryaya giremeyen bir
kapı sınıfı kalırdı — yani her turda kanıtlanamayan kapılar.

**Kendi kapımı da ihlal testi yakaladı:** `blok-css` ilk sürümü dosyada dizeyi arıyordu
ve `import { CHART_CSS }` satırı onu sağlıyordu — kullanımı silsen bile kapı yeşildi.

**Geri alma maliyeti:** yok — bu bir kayıt düzeltmesi.

## D-217 — FAZ 6 ŞARTLI kapandı: iki tur, 28 bulgu, tek sınıf hata

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-6 kapanışı (LOOP§D · D-79) · D-216

İki doğrulama turu koştu ve **28 bulgu** verdi. Birinci tur 12, ikinci tur 16 — ve
neredeyse hepsi tek sınıftandı: **kod yazılmış, üretim yolunda çağıranı yok.** Hepsi
kapatıldı; **üçüncü tur açılmıyor** (D-79).

**İkinci turun iki bulgusu özellikle öğretici:**

1. **Kendi gerilemem.** PDF yolunu bağlarken `deps.check`in yalnız `slides` varken
   çağrıldığını fark etmedim ve `lintDocument` onun içindeydi — üç PDF hattında
   kaynaksız sayı kapısı **hiç koşmuyordu**. Üstüne zincire `lexiconIhlalleri: []`
   geçiyordum ve **yorumum "check'in içinde koştu" diyordu**. Yorum yanlıştı ve yanlış
   bir yorum, olmayan bir kapıyı var gösterir.
2. **Kendi kendini onaylayan test çifti.** `composeBody` `productShots`u `basis`siz
   üretiyordu, zincir `basis` arıyordu; testlerim ise elle `basis` yazılmış, **üretimin
   hiç üretmediği** bir fikstür kullanıyordu. İkisi de yeşildi ve zincir gerçek üretimi
   reddediyordu. Karşılığı `uretim-sekli.test.ts`: girdiyi ÜRETİM üretir, tüketiciye o
   verilir.

**Kapanış ŞARTLI ve çıkış kriteri tikle ÖRTÜLMÜYOR** (D-206 deseni). Faz şunu istiyordu:
*"adı geçen gerçek bir şirkete özel deck üretildi ve görüşmeden önce gönderildi"*. Bu bir
**insan eylemidir**: gerçek prospect kaydı (`6.9b`, V-25) ve şelale anahtarları
(`6.5b`, V-24) olmadan sistem onu iddia edemez. Zincir uçtan uca doğrulandı; teslim
edilmedi.

**Dürüstlük düzeltmesi:** V-24 önce "kalan iş yalnız bağlantı" diyordu. Yanlıştı — dört
kaynağın **adaptörü de yazılmamış**. Bir anahtar blokajının arkasına saklanmış teknik
eksikti ve borç metni düzeltildi. Aynı şekilde FAZ-6.5'in "şelale sırayla düşüyor" ✅'sı
daraltıldı: plan sırayla düşüyor, çekim yalnız `own-site`tan.

**Kalıcı ders — üç kez tekrarladı:** yeni bir blok tipi, alan ya da çıktı anahtarı
eklerken onu **okuması gereken her yeri** ara. `chart` linter'da, `safeArea.verifiedAt`
drift denetçisinde, çıktı anahtarları `ozetle()`de kaçtı. Derleyici üçünde de sustu,
çünkü hiçbiri `switch` değildi.

**Geri alma maliyeti:** yok — bu bir kapanış kaydı.

## D-218 — CSRF token'ı SEED'SİZ: R-06'nın konusu karar, bunun konusu sır

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-7.5 · §14 · R-06

R-06 rastgeleliğin seed'li olmasını istiyor ve haklı: seed'siz bir çalıştırma replay
edilemez, idempotent atlama çöker. Ama OAuth `state` parametresi bir replay girdisi
**değil**, bir saldırı yüzeyi: tahmin edilebilirse saldırgan kendi yetkilendirme cevabını
kurbanın oturumuna bağlar (CSRF).

**Karar:** `csrfToken()` `rng.ts`te ve `crypto.randomBytes` kullanıyor — kriptografik,
seed'siz. Ayrım kuralı çiğnemiyor: `seededRng` **kararları** üretir (hangi kayıt, hangi
sıra, hangi seed) ve replay onları tekrar eder; `csrfToken` bir karar üretmez, tek
kullanımlık bir sırdır, hiçbir manifeste girmez ve **hiçbir replay onu tekrar etmez**.
Tekrar etseydi zaten güvenliği ortadan kalkardı.

**Yeri `rng.ts`:** `rng` darboğazı `crypto.randomBytes`ı bu dosyaya kilitliyor. İkinci bir
rastgelelik kaynağı, hangisinin seed'li olduğunu belirsiz bırakırdı.

**Yanına `secretEquals` kondu:** düz `===` ilk farklı baytta döner ve süre farkı
saldırgana doğru ön eki karakter karakter aratır. Uzunluk farkında da erken dönmüyor.

**Geri alma maliyeti:** düşük.

## D-219 — Secret deseni, entegre edilen sağlayıcıyı içermiyordu (D-49 tekrarı)

**Tarih:** 2026-08-16 · **Bağlam:** FAZ-7.5 · R-51

7.5'in 🧪'sı basitti: düz metin token'ı repoya koy, kapı reddetsin. **Reddetmedi.**
Sentetik bir Meta token'ı hem `repo-hygiene`den hem `gitleaks`ten geçti: bizim desen
listemizde Meta ve LinkedIn yoktu ve gitleaks'in varsayılan kural seti de bu biçimi
yakalamadı.

Bu D-49'un birebir tekrarı — orada da liste, gerçek Anthropic anahtarının biçimini
kaçırıyordu. **Desen eklemenin doğru anı, o sağlayıcıya dokunulan andır**; entegrasyondan
sonra eklenen desen, arada geçen her commit için geç kalmıştır.

**Eklendi:** `EAA…` (Meta erişim token'ı) · `WPL_AP1.` (LinkedIn istemci secret'ı).

**Test üç kez yanıldı, kapı değil:**
1. İlk denemem **izlenmeyen** bir dosya yazdı — kapı yalnız git'in bildiği dosyaları
   tarıyor ve haklı olarak sessiz kaldı.
2. Bataryaya eklediğimde **batarya dosyasının kendisi** deseni içerdi ve kapı onu
   yakaladı (`chart.js` darboğazının kendi modülünü yakalamasıyla aynı sınıf). Token
   parçalardan kuruldu.
3. Yama hedefim henüz **commit'lenmemiş** bir dosyaydı; izlenen bir dosyaya çevrildi.

Üçünde de "kapı korumuyor" görüntüsü vardı ve üçünde de sorun testteydi. **Bir kapının
yeşil kalması, kapının değil testin yanlış olduğu anlamına da gelebilir** — ikisini
ayırmanın tek yolu ihlali gerçekten diske yazıp kapının ne taradığını okumak.

**Geri alma maliyeti:** yok.


## D-220 — Insight'ın doğruluğu NDJSON'da, SQLite'ta DEĞİL

**2026-08-16 · FAZ-7.8**

Faz dosyasının kabul kriteri "ilk satırlar SQLite'ta" diyordu. **Reddedildi ve kriter
değiştirildi** (R-74: sessiz sapma yasak).

**Gerekçe:** IG hesap insight'ları ~90 günde kayboluyor ve **backfill ucu YOK** — bugün
alınmayan ölçüm hiçbir çağrıyla geri getirilemez. `derived/index/` ise tanım gereği
**silinip yeniden kurulabilir** (11. yasa, D-38). Geri getirilemez veriyi yeniden
kurulabilir bir yere koymak, `just reindex`i kalıcı veri kaybına çevirirdi — ve bunu
fark edeceğin an, üç ay sonra boş bir panonun karşısıdır.

**Karar:** doğruluk `derived/runs/insights.ndjson`'da (append-only, git'te, yedekli);
SQLite yalnız **sorgu indeksi** ve bu dosyadan beslenir. Yayın defteriyle (D-38) birebir
aynı gerekçe, aynı biçim.

**Alternatif:** SQLite'ı doğruluk yapıp dosyayı yedek saymak — reddedildi: yedeğin ne
zaman alındığını hatırlaman gereken bir sistem, bir ay ihmali kaldıramaz (§16).

**Yan karar — boşluk bir OLGUDUR:** alınmayan gün sessizce atlanmaz, `bosluklar()`
listeler ve 90 günü geçmişse **`kurtarilabilir: false`** işaretler. Kurtarılamayan bir
kaybı bilmek, bilmemekten iyidir; bilinmezse pano onu "düşük performans" diye okur.

**Geri alma maliyeti:** yok — indeks zaten türetilmiş.

## D-221 — Kabuk yönlendirmesi tabloya çevrildi; kapı iki şekli de tanıyor

**2026-08-16 · FAZ-7.9 sonrası**

`App.tsx`'te palet komutu → ekran eşlemesi **on dört katmanlık iç içe ternary**'di ve her
yeni ekranda AYNI hatayı üretti: ekran yönlendirmede vardı, hiçbir komut ona gitmiyordu.
`ui-navigasyon` kapısı **üç kez** yakaladı — yani kural doğruydu, **kodun şekli** yanlıştı.

**Karar:** eşleme bir `Readonly<Record<string, Ekran>>` tablosu. Tabloda unutmak zor:
komut ya haritadadır ya değildir.

**Kapı da genişletildi, ama GEVŞETİLMEDİ.** Artık iki şekli de ayrıştırıyor ve ikisinde
de eksik eşleme hata. Kasten ihlal edilerek doğrulandı: satırı sil → *"ulaşılamaz"* ·
hedefi `giris` yap → *"sessiz no-op"*.

**Sıralama önemliydi (R-76).** Bu değişikliği ilk denediğimde kapı KIRMIZIYDI ve tabloyu
tanımıyordu; **geri aldım**. Kırmızı bir kapının tanıma biçimini aynı turda değiştirmek,
"kapıyı geçmek için kapıyı düzenlemek"le ayırt edilemez — niyet doğru olsa bile. Kapı
yeşile döndükten sonra, ayrı bir turda yapıldı.

**Geri alma maliyeti:** yok.

## D-222 — `PUBLISH` gövdesi hiç yazılmamıştı: `INGEST` hatasının birebir tekrarı

**2026-08-16 · FAZ-7 kapanış denetimi, 1. tur**

Doğrulama agent'ı FAZ 7'nin yayın tarafının **üretimde erişilemez** olduğunu buldu:
`publish()`, `buildLinkedinPost()`, `authorizeUrl()`, `appendPublished()` — dokuz
fonksiyonun tek çağıranı test dosyalarıydı. Kesin kanıt: `verbs/bodies.ts` dokuz
fiilden sekizini tanımlıyordu, **`publishBody` yoktu** ve `uret.mjs`in fiil haritasında
`PUBLISH` anahtarı hiç geçmiyordu.

**Bu D-216'nın (FAZ 6 · `INGEST`) birebir tekrarı** — ve o maddenin yorumu `bodies.ts`
içinde, `ingestBody`nin hemen üstünde duruyordu. Aynı hatanın iki fazda tekrarlaması
tesadüf değil: **bir yetenek "bitti" sanılıyor çünkü modülü ve testi var.** Eksik olan
hep aynı yer — fiil haritası.

**Kapatılanlar (hepsi tipe gömüldü):**
- `publishBody` yazıldı; `PUBLISH` üretim haritasına bağlandı
- **Defteri artık `publish()` yazıyor** (`recordPublished` zorunlu dep). Çağırana
  bırakılsaydı yineleme koruması ancak herkes hatırladığı sürece çalışırdı
- **Oran kovası fonksiyon olarak iniyor** (`rateGate`, zorunlu). Kova motorda yaşıyor,
  `providers` onu import edemez (R-03) — "limiter uploader'dan önce oturur" artık
  ölçülen bir sıra: `token → kova:1 → kota → defter → kova:3 → yükleme → kaydet`
- **`lookupLedger` üç durumlu.** Eski tip `LedgerEntry | null` idi ve `null` hem
  "yayınlanmamış" hem "defter okunamadı" demekti; ikincisini birincisi sanmak, defteri
  bozulmuş bir sistemde HER ŞEYİ yeniden yayınlamaktı
- **Yükleme hatası artık `upload_failed`.** Eski dal `quota_exhausted` döndürüyordu ve
  operatöre "kota doldu (3/25) — kuyrukta bekliyor" diyordu; oysa ağ hatası ve
  beklemekle geçmez. Yanlış teşhis, teşhissizlikten kötüdür
- **Yükleyici yoksa AÇIK duruş:** `CHANNEL_NOT_CONNECTED`. Sahte bir yükleyici,
  defterde olmayan bir yayın üretirdi

**Testin kendi köprüsünü ölçmesi:** `yayin-baglanma.test.ts` defteri yayıncıya bağlayan
adaptörü KENDİ kuruyordu ve üretimde eşi yoktu. Artık `publishBody`yi çağırıyor —
köprü bozulursa kırmızıya döner. Önceki hâlinde köprü hiç olmasa bile yeşildi.

**Kalan iş gerçekten insan girdisi:** `upload` ve `publishingLimit` verilmiyor çünkü
gerçek kanal bağlantısı `7.2b` (V-26). Fark şu: **eskiden yol yoktu, şimdi yol var ve
ucunda bir insan var.**

**Geri alma maliyeti:** yok.

## D-223 — Denetim 1. tur: altı bulgu kapandı, biri gerekçesiyle REDDEDİLDİ

**2026-08-16 · FAZ-7 kapanış denetimi**

D-222 kök blokajı kapattı; kalan bulgular:

**Kapananlar:**
- **`faz-yollari` kapısı KÖRDÜ:** yalnız `📁` ile *başlayan* satırı okuyordu; sarılmış
  ikinci satır denetim dışıydı. Kapı `✓` derken **beş** yol bayattı — biri
  `packages/kernel/src/proc/spawn.ts` yerine `kernel/src/proc/spawn.ts` yazılmıştı.
  Denetlenen yol 90 → **95**. *Bir kapının yeşil olması, baktığı yerin doğru olduğunu
  göstermez.*
- **`just hook-oner` bozuk defteri BOŞ sayıyordu:** her yayın "pencere ölçülmemiş"
  görünürdü ve operatör ölçüm sorununu içerik sorunu sanardı. Artık `unreadable`
  ayrı ve komut duruyor. (`ledger_missing` ayrı kalıyor: ölçüm hiç başlamamış olabilir.)
- **`doctor` ile `token-durum` bir günü farklı sayıyordu** (gece yarısı vs gerçek an).
  Bugün 00:30'da ölen bir token'la ölçüldü: ikisi de `1 gün önce ÖLDÜ` diyor. Aynı
  kayıt için iki farklı cevap veren iki rapor, ikisi de güvenilmez olur.
- **LinkedIn secret deseni hiç ihlal edilmemişti:** `WPL_AP1.` listede vardı ama
  bataryada yoktu — "korunuyor" iddiası ölçülmemişti (R-71). Batarya 14 → **15**.
- **Platform sınırı okunamıyordu:** `LINKEDIN_PLATFORM_MAX_SAYFA` dışa açılmıyordu.
  Artık ayrı bir ret tipi: 300+ sayfa `platform_limit` (**olgu**, tavan yükselterek
  çözülemez), 11 sayfa `too_many_pages` (**karar**, bilerek aşılabilir). Tek mesaja
  indirilseydi 300 sayfalık bir denemede "tavanı 400 yapayım" refleksi doğardı.
- **Bloke adımların metni dürüstleştirildi:** "kalan iş bağlantı" diyordu; gerçekte
  HTTP adaptörü ve insan komutu da yoktu. Artık ikisi de açıkça yazıyor.

**Reddedilen bulgu — m1 (`VARSAYILAN_BAYT_TAVANI = 8 MB` "40 MB'lık meşru dökümanı
reddediyor"):** bu bir hata değil, **bilinçli ayrım**. 8 MB bizim *editoryal*
varsayılanımız; LinkedIn'in 100 MB'ı `placements.ts`te `sourceUrl` + `verifiedAt` ile
duruyor. Olgu ile kararı ayrı tutmak bu repoda bir desen (D-220, D-215) — on sayfalık
bir deck 8 MB'ı aşıyorsa sorun sıkıştırmada değil içeriktedir. Çağıran `maxBytes` ile
ezebilir.

**Geri alma maliyeti:** yok.

## D-224 — Zincir bir seviye yukarıda da kopuktu: fiil haritası ≠ üretim yolu

**2026-08-16 · FAZ-7 kapanış denetimi, 2. tur**

D-222 `PUBLISH` gövdesini yazıp fiil haritasına bağladı ve *"eskiden yol yoktu, şimdi
yol var"* dedi. **Yarım doğruydu:** `grep -rn "PUBLISH" registry/` → **0 satır**.
Hiçbir hat onu çağırmıyordu; harita dolduruldu, hattı yazan olmadı.

**Aynı sınıf hata üç kez:** D-216 (`INGEST` gövdesi yok) → D-222 (`PUBLISH` gövdesi yok)
→ bu (hat adımı yok). Her seferinde bir seviye yukarı taşındı ve her seferinde bir
denetim agent'ı buldu. **İnsan hafızası bunu üç kez tutamadı.**

**Kapatılanlar:**
- `PUBLISH` adımı üç hatta eklendi (`instagram-post`, `instagram-carousel`,
  `linkedin-post`), `needs: [onay]` ile — yayın onaydan sonra; kapı geçilmediyse hiç
  koşmaz
- **`fiil-haritasi` kapısı açıldı ve İKİ soru soruyor:** gövde haritada bağlı mı ·
  o fiili çağıran en az bir hat var mı. İkisi de kasten ihlal edilip kırmızıya
  döndürüldü. Yorum satırları sayılmıyor — kapı kendi açıklamasıyla kandırılamaz
- **`just defter-baslat`** (B2): `publish()` defteri okur ve yoksa DURUR; defter ise
  ancak başarılı yayının sonunda yazılır. **Kısır döngü:** ilk gerçek yayın hiçbir
  zaman başarılı olamazdı. Komut idempotent ve bozuk defteri ONARMAZ — var olanı asla
  sıfırlamaz (D-38)
- **Yineleme anahtarı düzeltildi** (M1): yalnız `assets[0].digest` idi ve aynı kapakla
  farklı metin, ya da ikinci slaytı değişmiş bir karusel, "zaten yayında" diye
  bloklanıyordu — **hiç yayınlanmamış** içerik. Anahtar artık platform + yerleşim +
  tüm varlıklar + metin (R-44)
- **Desteklenmeyen platform tipli ret veriyor** (M2): YAML'daki `facebook` yazımı
  çıplak `TypeError` veriyordu. *"Sıra tipe gömülü"* garantisi **şekli** kapsıyor,
  **değerleri** değil — değerler sınırda doğrulanmak zorunda
- **Platform sınırı editoryal tavandan ÖNCE** (M3): 350 sayfalık belge `max: 10`
  cevabı alıyordu ve "tavanı 400 yapayım" refleksi doğuyordu — D-223'ün tam olarak
  önlemek istediği şey. Ayrım artık hattın geçtiği yerde
- **Dürüstlük düzeltmesi dört yerin dördüne** (M4): D-223 yalnız `FAZ-7.md` 7.2b'yi
  düzeltmişti; `KARARLAR.md` V-26/V-27, `DURUM.md` bloke tablosu ve 7.5b hâlâ "kalan iş
  hesap kurulumu" diyordu. **D-217'nin kendi dersi kendi düzeltmesine uygulanmamıştı.**

**Geri alma maliyeti:** yok.
