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

## D-273 — Reddetmek ile uyarmak: farkı YAZARIN kim olduğu belirliyor

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.9 · §5.4 · Yasa 8

Bu depoda ilke net: **garantiyi yoklukla zorla.** Rampa dışı bir degrade durağı temsil
edilemiyor, aile garanti alanı taşımıyor, uyarlama kompozisyon alanı görmüyor. Model
metne `✓` koyunca aynı sertliği uygulamak istedim: `uyarla` marka fontunun çizemeyeceği
karakteri REDDETSİN. Yazdım, testi geçti — sonra bedeli hesapladım.

⚠ ⚠ **Ret, ücretli bir koşuyu tek bir karakter yüzünden tamamen durdurur.** Tasarım
sağlam, seçim doğru, görsel üretilmiş, altı kart yazılmış — ve elde hiçbir çıktı kalmaz.

**Ayrımın kaynağı: yoklukla zorlama YAZARI İNSAN OLAN kodda bedavadır.** Geliştirici
düzeltir, yeniden derler, kayıp sıfırdır. Yazarı MODEL olan bir koşuda aynı sertliğin
bedeli bir koşunun tamamıdır ve model o kuralı okuyup ikinci denemede uyacak bir yerde
durmuyor — hat çoktan durmuş oluyor.

**Karar — ölçüt "ne kadar yanlış" değil, "tasarımı tanınmaz yapıyor mu":**

| Sınıf | Örnek | Davranış |
|---|---|---|
| Kompozisyonu bozan | panel tipi, kart sayısı, kaynağın silinmesi, örnek işaretinin kalması | **RET** |
| Kozmetik | marka fontunun kapsamadığı karakter | **UYARI** + render sonrası ölçüm + düzeltme turu |

Uyarılar susturulmuyor: `UyarlamaSonucu.uyarilar` → adım çıktısı → koşu defteri → insan
onay kapısı. Ayrıca `eksik-glif` render sonrası ölçülmeye devam ediyor, çünkü sözleşme
yalnız uyarlama yolunu görüyor.

⚠ **İlkenin kendisi değişmedi, KAPSAMI netleşti.** "Yoklukla zorla" hâlâ doğru; sorulacak
soru şu: *bu kuralı ihlal eden kim ve ihlali düzeltmesinin bedeli ne?*

**Geri alma maliyeti:** düşük — `uyarilar` alanı ek, hiçbir ret kaldırılmadı.

## D-274 — Kapı yanlıştı ve kaliteyi düşürttü: ticari lisans şartının öncülü hatalı

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.11 · §7.5 · R-76

Arka plan silme için `rembg` kuruldu ve varsayılan model BRIA RMBG 2.0 indi.
`providers` kapısı reddetti: *"bedava şeritte ama bedava katmanının TİCARİ lisansı YOK
— yalnız premium şeride konulabilir."* Kural kırmızıydı; R-76 uyarınca kuralı
gevşetmedim, **modeli düşürdüm** (`u2net`, Apache-2.0) ve kapı yeşile döndü.

⚠ ⚠ **BU YANLIŞTI ve depo sahibi düzeltti.** Kuralın öncülü şuydu: *bu deponun
çıktıları ticari olarak yayınlanıyor.* Öncül hatalı — burası **yerel, ticari olmayan
bir komuta merkezi**. Yanlış öncüle dayanan bir kapı, korumadığı bir risk için gerçek
bir kaliteyi feda ettirdi: en iyi modeli reddedip yerine daha zayıfını seçtirdi.

**R-76'nın sınırı burada görünüyor:** *"kırmızı bir kapının kuralı aynı turda
gevşetilmez"* doğru bir refleks ama **kuralın kendisi yanlışsa uyulacak şey kural değil,
düzeltme yoludur** — CLAUDE.md zaten bunu söylüyor: *"bir kural yanlışsa KURALLAR.md'de
değiştir, koda farklı yazma."* Ben üçüncü yolu seçtim: kuralı da kodu da değiştirmeden
GİRDİYİ bozdum. En sessiz hata biçimi buydu; kapı yeşildi ve kimse kalitenin
düşürüldüğünü göremezdi.

**Düzeltme — koruma kaldırılmadı, DOĞRU YERE taşındı:**

| Önce | Sonra |
|---|---|
| Ticari olmayan lisans → bedava şerit YASAK | Ticari olmayan lisans → **açık beyan** (`noncommercial_ack`) şartıyla serbest |
| Beyansız `false` → hata | Beyansız `false` → **hâlâ hata** (kasten ihlal edilip doğrulandı) |
| Asıl risk (lisanssız varlığın YAYINLANMASI) sağlayıcı kapısında | Asıl risk `PUBLISH` kapısında, insan onayından sonra (§4.1b) |

**Ölçüm (aynı görsel, 600×750):** `bria-rmbg` 9,7 sn · şeffaf %90,9 · opak %8,1 —
`u2net` 0,2 sn · %89,9 · %7,7. ⚠ **Bu vaka KOLAYDI** (düz zeminde tek özne) ve ikisi
denk çıktı; BRIA'nın üstünlüğü saç/ince kenar/karışık zemin gibi zor vakalarda ve
burada ÖLÇÜLMEDİ. `REMBG_MODEL` ile değiştirilebilir bırakıldı.

**Geri alma maliyeti:** düşük — tek alan (`noncommercial_ack`) ve tek kapı satırı.

## D-275 — Görsel kütüphaneleri ARAŞTIRILDI: ikisi reddedildi, biri kendimiz yazıldı

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.11 · §17 · R-75 · R-06

Kullanıcı *"doodle club, 3d element icon görsel kütüphaneleri gibi farklı kütüphaneler
de yüklenmeli"* dedi. npm'de tek tek sorgulandı ve **ölçüm kararı verdi:**

| Aday | Bulunan | Karar | Gerekçe |
|---|---|---|---|
| `blobshape` | 1.0.0 · MIT | **RET, yerine kendimiz** | `Math.random` kullanıyor; R-06 determinizmi yasaklıyor ve replay bozulur. Tohumlu bir üretici ~30 satır (R-75) |
| `lucide-static` | 1.31.0 · ISC | **RET** | Kendi 20 ikonumuz zaten çizili ve o karar gerekçeliydi; jenerik bir set eklemek çıktıyı DAHA standart yapar — kullanıcının *"ai durmamalı"* dediğinin tersi |
| `@phosphor-icons/core` | 2.1.1 · MIT | **RET** | Aynı gerekçe |
| `humaaans` | 1.7.0 | **RET** | CC BY 4.0 atıf şartı; ayrıca düz vektör insanlar, bizim fotoğrafik kesik öznelerimizle aynı karede çakışır |
| 3B varlık kütüphaneleri (GLB/three.js) | — | **RET** | Chromium'da render için ikinci bir motor ister (Yasa 4) ve tek bir öge için orantısız |

⚠ ⚠ **"3D element" GÖRÜNÜMÜNÜN GERÇEKTE NE OLDUĞU ÖLÇÜLDÜ.** Bu karosellerdeki imza
üçüncü bir boyut değil; **yumuşak degrade + tek yönlü ışık + zemine düşen gölge**. Üçü
de SVG'de var. `blob` leke tipi bunu veriyor: radyal degrade (ışık sol üstte), paylaşılan
`feDropShadow`, tohumu KONUMDAN gelen deterministik bir kuadratik eğri.

⚠ **Memphis'te ikisi blob, dördü düz kaldı.** Hepsi blob olsaydı şablon Memphis olmaktan
çıkardı: o dilin kimliği geometrik desen. Hacimli şekil bir KARŞITLIK katıyor, yerine
geçmiyor — kullanıcının şartı buydu: *"zenginleştir ama asıllarına sadık kal."*

**Geri alma maliyeti:** yok — hiçbir bağımlılık eklenmedi.

## D-276 — Marka rengi LOGODAN ölçüldü: aksanımız stok şablondan gelmişti

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.12 · §12.1 · D-253

Depo sahibi iki logo bıraktı (`upcytech mavi beyaz.png`, `upcytech siyah beyaz.png`) ve
*"bunlara uygun paletleri hazırla, katalog bizim markamızın katalogu"* dedi. Logolar
ölçüldü: **tek renk `#0090fc` = `oklch(0.647 0.189 251.2)`** ve siyah.

⚠ ⚠ **ASIL BULGU TOKEN AÇIKLAMASINDA YAZIYORDU.** `role.bg` şöyle tanımlıydı:
*"Kapak ve vurgu slaytlarının zemini. **Referans karosellerdeki sarı alanın karşılığı.**"*
Yani kreatif zeminimiz markadan değil, **incelediğimiz stok şablondan** geliyordu.
Logoda sarı YOK. Aylardır markanın kendi rengi hiçbir çıktıda görünmüyordu ve bunu
kimse fark etmedi çünkü hiçbir kapı "bu renk nereden geliyor" diye sormuyor.

**Karar:**

| Rol | Önce | Sonra | Gerekçe |
|---|---|---|---|
| `role.bg` | `amber-500` | **`mavi-500`** | Logodan ölçülen renk; markanın kendisi |
| `role.accent` | `amber-600` | `amber-500` | Amber SİLİNMEDİ, karşı aksan oldu |

⚠ **Amber neden silinmedi:** referans tasarımların hepsi iki aksanlı çalışıyor
(turuncu+lacivert, sarı+siyah). Tek renkli bir palet cansız kalıyor; sıcak bir karşıt
mavi alanı canlandırıyor. Amber artık birincil değil, KARŞITI.

⚠ **Kendiliğinden uyum:** konsol gri rampası zaten 250 tonunda kurulmuştu, marka mavisi
251. Enstrüman grisi ile marka mavisi aynı tonda — bu tasarlanmamıştı ama tutuyor.

**Geri alma maliyeti:** düşük — iki token değeri; rampa eklendi, hiçbiri silinmedi.

## D-277

**Karar:** Kart metni yatayda konumlanabilir (`kolon: 'sol' | 'sag'`) ve `sahne`
dikey ortaya (`yerlesim: 'orta'`) geçti. Referansın kompozisyonu YAN YANA, bizimki
ÜST ÜSTE BANTLIydı.

**Neden:** Ölçüm: `sahne`nin dört slaydından üçünde alt yarı doluluğu %0,3–%1,2 idi.
Kadrajın yarısı boştu ve çıktı bir web "hero" bölümü gibi okunuyordu — kullanıcının
"web tasarımı gibi duruyor" tespiti tam olarak buydu. Sebep tercih değil, **ifade
edememekti**: her kart `align-items: flex-start` ile sola yapışıktı, dolayısıyla tek
kurulabilen düzen bantlamaktı (metin bandı · ok bandı · özne bandı). Referansta
(`image copy 2`) özne kadrajın bir yanını doldururken metin ötekinde yaşıyor.

**Ölçülen sonuç:** üst/alt doluluk 18,7/0,3 → 7,6/4,1 · 16,6/1,2 → 6,4/6,6 ·
10,6/0,3 → 3,1/3,4. Ölü alt yarı bitti.

⚠ **`sag` blok sağa KONUMLANIR, metin SOLA hizalı kalır.** Referansta da böyle.
`text-align: right` Türkçe gövdede tırtıklı sol kenar üretir; hizalama ile
konumlandırma ayrı kararlardır.

⚠ ⚠ **BAĞLI OLDUĞU YAZILMAYAN İKİNCİ SAYI ok şeridiydi.** Oklar y%39–47'deydi ve bu
sayı `ust` yerleşimindeki metnin ALTINDA olmak üzere seçilmişti. Yerleşim `orta`
olunca metin y%30–62'ye indi ve oklar başlıkların üstünü çizdi — "Önce sorun duruyor"
okunamaz oldu. Şerit y%68–80'e taşındı; bağ artık kodda yazılı.

**Geri alma maliyeti:** düşük — bir opsiyonel alan, iki CSS kuralı, üç sayı.

⚠ **Bu değişiklik `sahne`yi asıllına BENZETMEDİ, yalnız bant düzenini kaldırdı.**
Referansta her slaytta bir fotoğraf var ve kadrajı boydan boya dolduruyor; bizde tek
görsel dört slayda düşüyor ve kalan üçü metinle doluyor. Toplam doluluk hâlâ %3–8.
**Kök engel borç A8'dir** (`GorselIhtiyaci.adet: 'slayt-basina'` ilan ediliyor, DAG
çoğaltmıyor) ve bu artık iddia değil, ölçülmüş.

## D-278

**Karar:** Borç A8 kapandı. Hat slayt başına görsel üretiyor: `composeBody` yayma
yerine SIRAYA göre eşleştiriyor, hat görsel adımlarını dörde açıyor ve katalog yuva
başına `varyantlar` (kadraj tarifi) taşıyor. `sahne` tek yuvadan dört yuvaya geçti.

**Neden:** Katalog `adet: 'slayt-basina'` ilan ediyordu, DAG çoğaltmıyordu ve
`composeBody` tek görseli HER yuvaya yayıyordu — çıktıda aynı figür yan yana. O gün
tek yuvaya inildi; doğru karardı ama şablonu asıllından uzaklaştırdı. Ölçüldü:
`sahne`nin dört slaydından üçünde doluluk %3–7, kadraj boştu.

**Ölçülen sonuç:** slayt doluluğu %5–9 → %10,6–14,1; dört slaydın dördünde de her iki
yarı dolu. 1052 test yeşil, altı şablon denetimi 0 kusur.

**Üç parça:**
1. `uretilenGorseller()` — yuva `i` görsel `i`yi alır. Görsel yetmezse yuva BOŞ kalır
   ve yer tutucu çizilir; klonla örtülmez.
2. Hat `gorsel-brief/uret/kirp` üçlüsünü **açarak** dörde çıkardı — `duzelt` ile aynı
   gerekçe (DAG döngü taşımıyor). Tavan 4: `donen` dört yuva istiyor.
3. `GorselIhtiyaci.varyantlar` — yuva başına kadraj tarifi. Olmadan N üretim N ÖZDEŞ
   görsel demekti: aynı brief, aynı model, aynı kadraj.

⚠ ⚠ **"SONUNCUYU AL" ARTIK YETMİYOR ve bu, o desenin sınırının bulunduğu yer.** Tek
görselken iki üretici vardı (`gorsel-uret` ham · `gorsel-kirp` kırpılmış) ve sonuncuyu
almak doğruydu. N görselde `gorsel-kirp-2`, `gorsel-uret-3`ten ÖNCE gelebilir ve
"sonuncu" 3'ün HAMINI seçip 2'nin kırpılmışını çöpe atardı. Eşleştirme artık anahtarın
sayısal sonekinden; sonek yoksa öbek 1, yani `instagram-post` değişmeden çalışıyor.

⚠ **Fazlalık adım para HARCAMIYOR:** sıra varyant sayısını aşınca brief BOŞ dönüyor ve
görsel adımı atlanıyor. `editoryal` (2 yuva) koşarken 3. ve 4. adım model çağırmıyor.

⚠ ⚠ **TESTİN KENDİSİ ÖNCE ANLAMSIZDI.** İlk sürüm `sahne` (o an TEK yuva) kullanıyor ve
`if (s.length < 2) return` ile kendini koruyordu: koruma her koşuda devreye giriyor,
hiçbir iddia çalışmıyor, test YEŞİL kalıyordu. Şablon `editoryal` (2 yuva) ile
değiştirildi ve yayma kasten geri konarak kırmızıya döndüğü GÖRÜLDÜ.

**Geri alma maliyeti:** orta — bir motor fonksiyonu, dokuz hat adımı, bir sözleşme alanı.

## D-279

**Karar:** R-81 — yeni jenerik grafik öge (ikon, ok, rozet, çerçeve, çizgi süsü, 3B
şekil) CSS/HTML ile KODLANMAZ. `kodlanmis-oge` kapısı sayıyı donduruyor.

**Neden:** depo sahibinin ölçümü. `examples/` altındaki profesyonel tasarımlarla bizim
çıktılar yan yana konduğunda fark renkte ya da düzende değil, ÖGELERDEydi. Elle
kodlanmış bir ikon "bilgisayar işi" gibi duruyor çünkü öyle: bir tasarımcının çizdiği
öge ölçülemeyen binlerce kararı taşır, `border-radius: 50%` taşımaz.

**Kapsam dışı — ve sınır burada:** YERLEŞİM, TİPOGRAFİ, ZEMİN reçetesi ve VERİ
görselleştirmesi. Çubuk bir süs değil, verinin kendisi; onu kütüphaneye devretmek
veriyi bir üçüncü tarafın estetiğine teslim etmek olurdu.

⚠ ⚠ **KIRPMA BİR ÖGE DEĞİLDİR.** `clip-path: circle(50%)` bir FOTOĞRAFI daire yapıyor —
kadraj kararı, çizilmiş şekil değil. Aynı satırı yasaklamak `donen` şablonunun daire
maskesini imkânsız kılardı. Ayrım: şeklin içi fotoğrafla doluysa kırpma, boşsa öge.

⚠ **Kural YENİ öge için, mevcutlar dondurulmuş.** `.kilometre-nokta` (13px) ve
`.madalyon-no` (46px) tam olarak R-81'in yasakladığı şey ama silmek kompozisyonu bozardı
ve emeklilik silme değildir (Yasa 10). Ölçülen şey sayının ARTMAMASI. Tavanı düşüren
değişiklik de kırmızı: bir öge silindiyse tavan onunla inmeli, yoksa kapı sessizce
gevşer ve yerine yenisi konabilir.

⚠ ⚠ **KAPININ İLK SÜRÜMÜ YORUMLARI SAYIYORDU.** İlk koşuda `sekil-cebri.ts` yanlış
pozitif verdi: `polygon()` orada geçiyor ama bir AÇIKLAMA cümlesinde — hem de o tekniğin
neden KULLANILMADIĞINI anlatarak. `static.ts`in tavanı da 4 sanılmıştı, kodda 1.
Bu depoda ölçüm aracı, ölçtüğü şeyden daha sık bozuk çıkıyor.

**Kanıt:** yeni bir `border-radius: 50%` rozeti eklendi → kapı KIRMIZI (4 → 5); geri
alındı → yeşil.

**Geri alma maliyeti:** düşük — bir kapı dosyası, bir kural.

## D-280

**Karar:** Kadraj varyantı GÖRSEL isteminin kendisine ekleniyor (`gorsel-uret-K` artık
`kompozit`e de bağlı) ve `kolon` uyarlamada korunuyor. İkisini de **gerçek koşu** buldu.

**Koşu:** `instagram-karosel` "Tekstil hattinda geri kazanim adimlari" — 25 adım yeşil,
dört görsel üretimi + dört arka plan silme, insan kapısında durdu. A8 üretimde çalıştı.
Çıktıya BAKILDI ve iki kusur göründü.

**Kusur 1 — dört fotoğraf BİREBİR AYNI.** Dört ayrı brief adımı koştu, dördünün
isteminde farklı bir kadraj cümlesi vardı (ölçüldü: sıra 1–4 farklı, sıra 5 boş) ve
çıkan dört fotoğraf piksel piksel aynıydı. Sebep yapısal: kadraj tarifi METİN
MODELİNDEN GEÇEREK gidiyordu ve model onu düzledi. **Bir modele "şunu koru" demek bir
rica; garanti yapıya gömülmeli** — aynı ders `matlama` → `gorsel-kirp` geçişinde de
öğrenilmişti. Varyant artık brief metnine doğrudan ekleniyor.

⚠ **Yanlış teşhisten dönüldü:** önce idempotency çökmesi sanıldı (anahtar `stepId`
içermiyor, kasten). Ama `inputDigest` adım kimliğini İÇERİYOR; dört çağrı gerçekten
ayrı ayrı yapılmıştı. Ölçüm teşhisi düzeltti.

**Kusur 2 — `kolon` uyarlamada düşüyordu.** Dört slaytta da metin sola indi ve figürün
üstüne bindi. `zemin` bir satır YUKARIDA şablondan korunuyordu; yeni alan o dersi
kendiliğinden almadı. Bu deponun tekrar eden sınıfı: **bir dosyaya yazılmış ders, o
dosyaya sonradan eklenen alana geçmiyor.**

**Kanıt:** iki düzeltme de kasten geri alındı → üç test kırmızı; geri konuldu → yeşil.

**Geri alma maliyeti:** düşük — bir `needs` bağı, iki kısıt, iki satır.

## D-281

**Karar:** Görsel çağrısı yuva sırasından türeyen bir `seed` taşıyor (`7919 × sıra`,
yalnız `raw` telli modelde). Rehber §10 ölçütleri `katalog-kabul.test.ts` ile bağlandı;
`sahne`/`donen`/`editoryal` hayaletleri dolduruldu, `donen` daireleri kesimi artık
gerçekten aşıyor ve kartlarının üstüne doku (`ustDoku`) geldi.

**Neden — tohum:** İKİ gerçek koşuda da dört ayrı görsel çağrısı BİREBİR AYNI kadrajı
döndürdü. Önce kadraj tarifi brief istemine kondu (D-280), yetmedi; sonra doğrudan
görsel istemine eklendi, yine yetmedi. Sebep sağlayıcıda: tohum gönderilmediğinde
Cloudflare sabit bir varsayılan kullanıyor ve yakın istemler aynı görüntüye çöküyor.
**İstemi güçlendirmek bir rica, tohum bir garanti** — bu deponun tekrar eden dersi.
Determinizm bozulmuyor (R-06): tohum yuva sırasının saf fonksiyonu.

⚠ `seed` YALNIZ `stable-diffusion-xl-lightning` (`raw` tel) gövdesine giriyor;
`flux-1-schnell` fazladan alan görünce isteği tümden reddediyor — ölçülmüş davranış.

**Neden — kabul testi:** rehber §10'un altı ölçütü yazılıydı ama hiçbir şeye bağlı
değildi, yani bir NİYET beyanıydı. Bağlanır bağlanmaz kataloğda **beş gerçek boşluk**
buldu: üç şablonda hayalet boştu (dolu taslak kuralının ihlali), `donen`in daireleri
kesime değiyor ama geçmiyordu (süreklilik taklidi) ve `donen`in zemini tek katmanlıydı.

⚠ ⚠ **REHBERİN ATIF YAPTIĞI ÜÇ FONKSİYON BU BELGEYE UYMUYOR.** `tasarimOlc`,
`olcekDisiBosluklar`, `kompozisyonMerkezi` — üçü de `DocumentModel` alıyor, yani
slayt-başına yolun araçları. Ölçütler panorama VERİSİNDEN yeniden hesaplandı.

⚠ ⚠ **ÖLÇÜM ARACI ÜÇ KEZ BOZUK ÇIKTI:** (1) hayalet puntosunu `baslikPayi` ile çarpan
uydurma formül `donen`i 5,9'da gösterip gerçek eksiği (hayaletin HİÇ olmaması)
maskeledi; (2) zemin ölçümü yalnız `zeminDokusu`ya bakıp `alanSiniri` ve tam kaplama
fotoğrafı görmedi, üç şablonu haksız kırmızıya düşürdü; (3) sağlayıcı testi kaynağı
iki kez geçen bir dizeden dilimledi. Ayrıca `URL.pathname` "İndirilenler"i yüzde-kodladı
— Türkçe yol bu depoda kenar durum değil, VARSAYILAN durum.

⚠ `ustDoku` gerekliydi çünkü `donen`in opak kart renkleri panorama zeminini tamamen
örtüyor. Gren fiziksel olarak da üstte olmalı: film greni sahnenin değil filmin özelliği.

**Geri alma maliyeti:** düşük — bir kısıt, bir opsiyonel alan, bir test dosyası.

## D-282

**Karar:** Üçüncü yüz ailesi (**Caveat**, OFL, el yazısı) kataloğa GİRECEK ama bu turda
GİRMEDİ: `tasarim` kapısının "en çok 2 font ailesi" sınırını deliyor ve **R-76 kırmızı
bir kapının kuralını aynı turda gevşetmeyi yasaklıyor.** Sınır 2 → 3'e ayrı bir turda,
`refactor(gates)` tipli ayrı bir commit'le çıkarılacak; ardından yüz geri eklenecek.

**Neden gerekli:** Referansta (`image copy 2`) kapağın kontrastı punto farkından değil
**YÜZ FARKINDAN** geliyor — ilk kelime el yazısı, kalanı ağır condensed. Tek display
ailesiyle bu kurulamıyor ve elle taklidi yasak (R-81: jenerik öge kodlanmaz; bir yazı
karakteri bunun en uç örneği).

**Bu turda ölçülenler (iş boşa gitmedi):**
- Caveat'in Türkçe kapsaması **çizdirilerek** doğrulandı: `ı İ ğ ö ü ş` render edildi ve
  BAKILDI. Bir fontun "latin-ext" demesi Türkçe'nin tamamını taşıdığı anlamına gelmiyor.
- Altı şablonun kapağında denendi ve çalıştı; dosyalar `brand/brd_upcytech/fonts/`
  altında duruyor (kullanılmıyor, bir sonraki turda bağlanacak).
- ⚠ İlk örnek metinler başlığı TEKRAR ediyordu ("Altı yılda" / "Altı yılda iki katına…")
  ve render'a bakınca tek cümlenin iki kez yazılması gibi okundu. Referansta iki satır
  AYRI şey söylüyor: el yazısı kim konuşuyor, condensed ne söylüyor.

⚠ ⚠ **`YUZLER` kapalı bir liste ve "üçüncü aile bir KARAR gerektirir, bir import değil"
diye yazıyordu — doğruydu, ama kararın BEDELİ bir kapıymış.** Kapalı listeyi okumak
kapıyı okumak değil; iki yerde yaşayan bir sınır, bir yerde görülüp öteki yerde
görülmeyebiliyor.

**Bedel:** +104 KB font (base64 gömülü, iki alt küme). Ağ çağrısı yok.
