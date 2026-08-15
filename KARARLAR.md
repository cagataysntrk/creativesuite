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

## D-100 — Kapı `ADAPTERS`'a değil `adapterById`'ye sorar
2026-08-15 · `providers` kapısı ham `ADAPTERS` listesini barrel'dan istedi; `chokepoints`
reddetti. Doğru tepki barrel'ı açmak değil, **sorunun kendisini düzeltmekti**: kapının
ihtiyacı "bu id bir adaptöre çözülüyor mu" ve `adapterById` tam olarak o soruyu meşru
yoldan cevaplıyor. Ham liste `registry.ts`'te kilitli kaldı.
**Ders (üçüncü kez):** darboğaz kapısı bir engel değil, tasarım geri bildirimi. İki kez
"kancayı kapatmak yerine kapıyı öğren" dedik; bu üçüncüsü.

## D-101 — Maliyet formülü QuickJS'te değil, kapalı bir dilbilgisinde
2026-08-15 · §8.2 "QuickJS, 10 ms deadline" diyordu. Gerçek formüller
`0.025 * num_images` mertebesinde; bunun için bir WASM JS motoru taşımak çözdüğünden
büyük bir yüzey getirir. Yerine ~180 satırlık **kapalı aritmetik dilbilgisi**: sayı,
tanımlayıcı, `+ - * /`, parantez, `min/max/ceil/floor`.
**Neden daha güvenli, sadece daha küçük değil:**
1. Döngü **dilbilgisinde yok** → sonsuz döngü imkânsız → deadline'a gerek yok. Deadline
   gerektiren tasarım, deadline'ın kaçırılabileceğini kabul eder.
2. `fetch`/`require`/`process`/prototip zinciri QuickJS'te "verilmediği için" yoktu;
   burada **söylenemedikleri için** yok. Test 8 kaçış denemesini reddediyor.
3. Tanımsız değişken **hata**dır. JS'te `steps * fiyat` yanlış anahtarla `NaN` verir,
   `NaN` 0 mikro'ya yuvarlanır ve **ücretli çağrı bedava görünür**.
4. Float yok (R-41): sabit nokta `bigint`, ölçek 10^12, tek yuvarlama en sonda ve
   **yukarı** — az göstermek tavanı sessizce deler.
Alternatif (bağımlılık ekleyip QuickJS kurmak) reddedildi: "40 satır yazmak bir
bağımlılıktan iyidir". ANAYASA §8.2 ve §14 güncellendi — sessiz sapma yok.
Geri alma maliyeti: düşük, `evaluateFormula` tek arayüz.

## D-102 — Kaybedenler manifestte DEĞİL, ekranda DA
2026-08-15 · §8.2 aşama 5 kaybedenleri manifest'e yazmayı söylüyor. `just plan` artık
onları **ekrana da basıyor**: `elendi claude-code: adım tavanını aşıyor: $0.0625 > $0.0100`.
Yalnız manifeste yazmak, "neden bu model" sorusunu hiç açılmayan bir dosyanın arkasına
saklamak olurdu. Aynı turda `max_cost_usd_micros` de dekoratif olmaktan çıkıp gerçekten
uygulandı — dekoratif bir tavan, olmayan tavandan kötüdür: var sanılır.

## D-103 — Yarıda kalan iş üç farklı gerçektir, biri değil
2026-08-15 · Defterde bir kayıt bulunca motor onu "bitmiş" sayıyordu. Bu, `possibly-charged`
bir kaydı $0.00 maliyetle **başarılı** gösteriyordu — üretilmemiş bir varlığı üretilmiş
saymanın en sessiz yolu. Artık üç dal var:
- **kapanmış** (`charged`/`unreported`/`not-charged`) → çağrı atlanır, tutar defterden
- **yarım + tutamak var** → sağlayıcıya SORULUR (`start()` çağrılmaz), iş devam eder
- **yarım + tutamak yok** → `NEEDS_RECONCILIATION`. Tahmin etmek yasak: "uçmadı" dersek
  çift ödeme, "uçtu" dersek hayalet varlık.
Bunu yazarken **aynı deliğin retry döngüsünde de olduğu** ortaya çıktı: `resumeExternalId`
döngü öncesi bir kez hesaplanıyordu, yani 2. deneme sağlayıcıda İKİNCİ bir iş açıyordu.
`noteHandle` artık tutamağı döngü değişkenine de yazıyor. Test `start()` çağrı sayısını
sayıyor — "çift ücret yok" iddiası ancak sayılabilir bir şeyle kanıtlanır.
Üçüncü bulgu: başarısızlık yolundaki `settle` tutamağı `null`'a çekiyordu — mutabakat için
özellikle yazdığımız tutamağı, tam ona ihtiyaç duyulan anda siliyordu.

## D-104 — Sözleşme testi adaptör başına değil, KATALOG başına
2026-08-15 · `provider-contract.test.ts` `describe.each(ADAPTERS)` ile koşuyor: yeni bir
adaptör eklendiği gün, kimse test yazmasa bile sözleşme ona da soruluyor. Adaptör başına
elle yazılan testler her zaman **sonuncuyu** atlar.
İki incelik ihlal testinden çıktı:
1. `estimate()`in senkronluğu **çalışma zamanında** da kontrol ediliyor: tip seviyesindeki
   koruma `as unknown as` ile bastırılabiliyor, `expect(t).not.toBeInstanceOf(Promise)`
   bastırılamıyor.
2. Ağ yasağı iki katmanlı: `onUnhandledRequest: 'error'` **yetmedi** — `fetch(...).catch(()
   => undefined)` yazan sahte bir adaptör sessizce geçti. `request:start` sayacı eklendi;
   **denemenin kendisi ihlaldir**, reddin yakalanıp yakalanmaması adaptörün insafına
   bırakılamaz.
Ayrıca `describe.each([])` hiç test üretmeden YEŞİL raporladığı için katalogun boş
olmadığı ayrıca iddia ediliyor.

## D-105 — Hız sınırı çağrının ÖNÜNDE, arkasında değil
2026-08-15 · Token kovası (`RateLimiter`), anahtar `(providerId, capability)`. 429 alıp
yeniden denemek de mümkündü ama bazı sağlayıcılar reddedilen isteği de sayar ve arka
arkaya 429'da hesabı geçici kilitler. Saat **dışarıdan** gelir, `setInterval` yok: bir
zamanlayıcı süreç uyuduğunda sessizce kayar, kova ise her çağrıda saate sorar.
Reddedilen istek de `lastMs`i günceller — güncellemeseydi ilk 429 kalıcı bir kilit olurdu
(test bunu ayrıca sınıyor). `LOCAL_RATE_LIMIT` kodu sağlayıcının 429'undan AYRI: ikisini
aynı koda toplamak "sağlayıcı mı kısıtlıyor biz mi" sorusunu log'dan cevaplanamaz yapardı.

## D-106 — R-20 iki parçalıdır: ek eklemek YETMEZ
2026-08-15 · "Her prompt'a 'no text' ekle" tek başına bir yarım kural. `üstünde FİRE
yazan tabela` isteyen bir prompt'a bu eki eklemek modele **çelişki** gönderir ve
çelişkide model genellikle ilk isteği dinler — kapı yeşil, çıktı bozuk. Bu yüzden
`buildImagePrompt` metin İSTEYEN prompt'u reddediyor.
**Türkçe eklemeli yapı desen tasarımını değiştirdi:** `\bharf(ler|li)?\b` "harfler"i
yakalıyordu ama "harflerle"yi kaçırıyordu. Sonlu bir ek listesi her zaman bir sonraki
eki kaçırır. Türkçe desenler **gövde ön eki** (`\bharf\w*`) oldu. Tek istisna
`yazi(?!lim)`: "yazılım çözümleri" bu şirketin kendi sözlüğü ve yanlış pozitif de bir
hatadır.
Üç savunma katmanı: (1) kurucu reddi, (2) `assertNoTextSuffix` `start()` sınırında,
(3) `lexicon` kapısı pipeline kısıtlarında (`no_text: false`, `overlay_text`).

## D-107 — Sözleşme testi girdiyi `supports`tan KURUYOR
2026-08-15 · İki görsel adaptörü eklenince sözleşme testi kendiliğinden onlara da
uygulandı (D-104) ve ikisinde de düştü: test elle `constraints: {}` veriyordu, görsel
adaptörleri `aspect` istiyordu. Elle kısıt yazmak yerine test artık kısıtları adaptörün
KENDİ `supports` beyanından kuruyor — her anahtarın ilk değeri.
Bu, sözleşmeye sessizce bir madde ekledi: **`supports` eyleme dönüştürülebilir olmak
zorunda.** Yönlendiricinin yaptığı da tam bu. Test elle kısıt yazsaydı, `supports`u
eksik yazan bir adaptör testte geçer ama yönlendiricide elenirdi — ve bu ancak üretim
anında fark edilirdi.

## D-108 — `NO_TEXT_SUFFIX` barrel'dan dışa AÇILMIYOR
2026-08-15 · Dışarıdan ihtiyaç duyulan şey kurucudur (`buildImagePrompt`), ham ek
değil. Sabiti paket sınırından dağıtmak, onu ikinci bir yerde birleştirmeyi
kolaylaştırır — `gorsel-prompt-kurucu` darboğazının önlediği şey tam bu. Darboğaz
zaten yakalardı; ama bir kuralı hem kapıyla hem API şekliyle zorlamak, kapının bir gün
gevşetilmesine karşı ikinci hat.

## D-109 — ΔE2000 kendimiz yazıldı, `culori` eklenmedi
2026-08-15 · İhtiyaç iki fonksiyon (sRGB→Lab, ΔE2000); `culori`nin getirdiği yüzey
onlarca renk uzayı, ayrıştırıcı ve interpolasyon. Formüller yayınlanmış, sabit ve otuz
yıldır değişmiyor — "40 satır yazmak bir bağımlılıktan iyidir".
**Doğruluk bağımsız kaynakla kanıtlandı:** Sharma, Wu & Dalal (2005) makalesinin 21
referans çifti, 4 ondalık hassasiyetle geçiyor. Kendi matematiğine kendi beklentini
yazmak hiçbir şey kanıtlamaz: yanlış bir formül, ondan türetilmiş beklentiyi her zaman
karşılar.
ΔE76 (Öklid) **reddedildi**: mavi bölgede algıyla ciddi ayrışıyor ve marka paleti mavi
ağırlıklı (`#0091FF`) — ΔE76 gözle ayırt edilebilir iki maviyi "aynı" sayar ve QA kapısı
boş geçerdi.

## D-110 — Piksel Chromium'dan okunuyor; metin kaplaması OCR'sız
2026-08-15 · İki bağımlılık daha eklenmedi:
1. **sharp/jimp yok.** Chromium zaten var, zaten tek başlatıcıdan geçiyor ve `<canvas>`
   piksel erişimini standart veriyor. İkinci bir PNG çözücü = ikinci bir renk profili
   yorumu = farklı ΔE, ve hangisinin doğru olduğu ancak gözle anlaşılır.
2. **Tesseract yok.** OCR'ın yapacağı iş "bu görselde nerede metin var" sorusunu tahmin
   etmek; oysa metni BİZ yerleştiriyoruz ve yerini kesin biliyoruz (§7.1). Bildiğimiz bir
   şeyi %90 doğrulukla yeniden keşfetmek olurdu. OCR'ın gerçek işi modelin ürettiği metni
   yakalamak — ama R-20 zaten onu yasaklıyor.
**Örnekleme ızgara, rastgele değil:** rastgele örnekleme aynı görselde iki farklı QA
sonucu üretir ve manifest'e yazılan sayı tekrar üretilemez olur (§13).
Ayrıca `getImageData` piksel başına değil TEK seferde çağrılıyor — 2000 örnekte
piksel başına çağrı saniyeler sürüyor ve render zaman aşımını tetikliyordu.

## D-111 — Ölçülemeyen metrik rapora GİRMEZ, sıfır olarak da girmez
2026-08-15 · Palet tanımlı değilse ΔE `0,0` yazmak "mükemmel uyum" göstermek demektir
ve tam da hiçbir şey ölçülmediği anda kapı yeşil yanar. `pixelStats` boş palette `null`
dönüyor, `measure` o okumayı rapora hiç koymuyor. Aynı ilke `nearestDeltaE` ve
`parseHex`te de var: geçersiz hex `null`, siyah değil — siyaha düşseydi bozuk bir token
paletle "mükemmel uyumlu" bir siyah olurdu.
**Uyarı eşiği limitten ayrı** tutuldu: yalnız limit olsaydı sistem geçti/kaldı ikilisine
düşer ve limite doğru SÜRÜKLENME görünmezdi — tek tek hiçbir varlığın düşmediği ama
ortalamanın kenara yaslandığı durum, markanın yavaşça bozulduğu durumdur.

## D-112 — Lexicon linter, corpus'a bağlandığı gün 11 YANLIŞ POZİTİF verdi
2026-08-15 · Linter yazıldı, testleri geçti, `lexicon` kapısına bağlandı — ve gerçek
corpus'ta 11 ihlal raporladı. **Hepsi yanlış pozitifti** ve üçü ayrı bir ders:
1. **Tırnak içi alıntı iddia değildir.** `eski sitedeki "1.247 İlan"` cümlesi o sayıyı
   REDDEDİYOR, öne sürmüyor. Alıntıyı iddia saymak, kuralı ANLATAN belgeyi kuralın
   ihlali sayardı — ve o kapı ilk gün kapatılırdı.
2. **Aralık tariftir.** `50-500 çalışanlı tesisler` bir firmografi, bir performans
   iddiası değil.
3. **Çıplak küçük sayı iddia değildir.** `confidence 0.55` bir parametre. Eşik 100:
   birimi/yüzdesi olan sayı her zaman iddiadır, çıplak sayı ancak büyükse.
Bilinen ödünleşme: gerçek bir iddiayı tırnağa alarak kaçırmak mümkün. Alternatifi
dokümantasyonu imkânsız kılan bir linter — kabul edildi ve yazıldı.
**Asıl ders:** kapıyı sadece sentetik testle değil GERÇEK veriyle koşturmak zorunlu.
Testlerim 20/20 yeşildi ve linter kullanılamaz durumdaydı.

## D-113 — "Palet tanımsız" ile "palette hex yok" AYRI durumlar
2026-08-15 · `allowedHex: []` başlangıçta "denetimi atla" demekti. Marka token'ları
OKLCH olduğu için (§12.1) hex çıkarımı hep boş dönüyordu — yani hex denetimi **hiç
çalışmıyordu** ve kapı bunu yeşil raporluyordu.
Üç durum ayrıldı: `null` palet tanımsız (atla) · `[]` palet tanımlı, hex içermiyor
(HER hex token dışı) · dolu liste (yalnız listedekiler).
OKLCH bir palette yazılmış her hex, tanımı gereği token dışıdır. İkisini karıştırmak,
denetimi tam da en çok gerektiği yerde kapatıyordu — bu segmentte üçüncü kez görülen
desen: **kod yazıldı ama hiç çalışmadı.**

## D-114 — `turkish-case` kapısı dize İÇERİĞİNİ tarıyordu
2026-08-15 · Lexicon linter'ının hata mesajı `'i'.toUpperCase() → 'I'` yazıyor —
kullanıcıya sorunu ANLATIYOR, bir çağrı yapmıyor. Kapı onu ihlal saydı.
Kapı zaten yorumları düşürüyordu; dize içerikleri de düşürüldü. **Ama şablon
dizelerindeki `${...}` blokları KORUNUYOR**: `` `${x.toUpperCase()}` `` gerçek bir
çağrıdır ve maskelenirse kural sessizce ölür.
**İlk yazımım tam bunu yaptı:** `derinlik` 0'dan başlayan bir `do-while`, `${`yi
görünce ilk karakterde çıkıyor ve bloğu maskeliyordu. İhlal testi (R-71) yakaladı —
kapı yeşil raporluyordu ve gerçek bir `.toUpperCase()` sessizce geçmişti.
Dört vaka ayrı ayrı sınandı: çıplak çağrı · şablon içi çağrı · iç içe şablon içi
çağrı · mesaj dizesi. Dördü de doğru davranıyor.

## D-115 — ExifTool yerine kendi PNG chunk yazıcımız
2026-08-15 · ExifTool kurulu değil ve kurmak, gözetimsiz bir çalıştırmada var olduğu
VARSAYILAN bir sistem ikilisi demek — "bir ay ihmal edilse de çalışır" (§16) vaadiyle
bağdaşmıyor. PNG chunk formatı otuz yıldır sabit; ihtiyacımız olan kısmı ~60 satır
(uzunluk · tip · veri · CRC32) ve `node:zlib` zaten yerleşik.
**`iTXt` seçildi, `tEXt` değil:** `tEXt` Latin-1 taşır ve `ğüşıöç` içeren bir damgayı
sessizce bozar — tam da bu projenin her yerde kaçındığı hata modu. Kapının öz-testi
her koşuda `ĞÜŞİÖÇ ğüşıöç` turu atıyor; `latin1`e çevirince kırmızıya dönüyor.
**CRC doğruluğu Chromium'la sınandı**, kendi okuyucumuzla değil: kendi okuyucumuz aynı
yanlışı iki kez yapabilirdi. Damgalı PNG hâlâ çözülüyor, IHDR yerinde, IEND son chunk.

## D-116 — Sabit probe listesi KODUN DIŞINDA yaşar
2026-08-15 · `containsSyntheticPerson` bir bayrak değil bir **tür**: `false` literali,
`true` yazan bir iddia DERLENMEZ. Ve tek yapıcı bir `basis` istiyor — dayanağı kayda
geçmeyen iddia kurulamaz. Üç dayanak: prompt taraması · gerçek fotoğraf · insan onayı.
**Asıl ders ihlal testinden geldi, iki kez:**
1. Kapının öz-testi TEK bir prompt kullanıyordu. `müşteri` desenini sildim — `gülümse`
   deseni aynı prompt'u yakaladı ve kapı YEŞİL kaldı. Yani desenlerin çoğu silinebilir
   ve kapı hiçbir şey söylemezdi. Her desene kendi `probe`'u eklendi.
2. Probe listesi desen listesinden TÜRETİLİYORDU — desen silinince probe'u da siliniyor
   ve kapı yine yeşil kalıyordu. Liste `packages/render/person-probes.json`'a
   **sabitlendi**: kodun dışında, `verbs.json` ile aynı mantık (R-02).
Artık iki yönde de kırmızı: desen silmek "sabit probe KODDA YOK" veriyor, desen eklemek
"person-probes.json'a eklenmemiş" veriyor. Desen listesini değiştirmek artık bir KARAR.

## D-117 — Blob deposu: dedup EDER ama ilk çalıştırmayı EZMEZ
2026-08-15 · `derived/blobs/<ab>/<sha256>.<ext>` + `<sha256>.png.meta.json` sidecar.
Aynı byte iki kez saklanmıyor — ama sidecar da **ezilmiyor**: ilk üretimin
`sourceRunId`'si korunuyor. Ezseydik "bu byte'ı hangi çalıştırma üretti" sorusu son
çalıştırmayı gösterirdi ve maliyet defteriyle (§13) çelişirdi — **para ilk üretimde
harcandı.**
`rename` tercih edildi (`copy` yedek): yarım yazılmış bir blob, içerik-adresli deponun
tek yasasını (adres = içerik) çiğner.
**`verifyBlob` kapıya BAĞLANDI** — `compliance` kapısı her blob için içeriğin kendi
adresiyle uyuştuğunu ve sidecar'ın var olduğunu doğruluyor. Bağlanmasaydı bu segmentte
üç kez görülen "kod yazıldı ama hiç çalışmadı" deseninin dördüncüsü olacaktı.
Gerçek bir blob uçtan uca sınandı: depoya alındı, damgalandı, sonra içeriği bozuldu
(`içerik adresle UYUŞMUYOR`) ve sidecar'ı silindi (`sidecar YOK`) — ikisi de kırmızı.

## D-118 — Blob deposu `engine`'de, `corpus`ta değil (faz dosyasından SAPMA)
2026-08-15 · FAZ-3.12 dosyası `packages/corpus/src/blobs.ts` diyordu. `corpus-yazici`
darboğazı `packages/corpus/src/**` altındaki HER yazmayı reddetti — ve **haklıydı**:
orada ikinci bir yazma yolu, onay kuyruğunu atlayan bir yoldur (§5.4) ve 2. doğrulama
turunda bu darboğaz beş ayrı yoldan atlatılmıştı.
Üç seçenek vardı:
1. `izinli`ye eklemek → darboğazı gerçekten zayıflatır, ikinci bir corpus yazıcısı yaratır
2. `kapsam_haric`e eklemek → "kural burada anlamsız" demek olurdu; değil, blobs.ts
   pekâlâ corpus'a yazabilirdi
3. **Doğru pakete taşımak** → seçilen
`derived/blobs` bir corpus kaydı değil, bir **çalıştırma çıktısıdır**. Motor zaten
`derived/runs` ile maliyet defterini yazıyor; doğru komşu orası. Faz dosyasındaki yol
düzeltildi — **sessiz sapma yok** (R-74).
**Ders:** darboğaz kapısı bir engel değil, tasarım geri bildirimi. Dördüncü kez.

## D-119 — `bigint` para manifest'te DİZE olarak yazılır
2026-08-15 · Manifest yazıcısının ilk testi şunu gösterdi: **`JSON.stringify` bir
`bigint`i serileştiremez, atar.** Para `bigint` USD mikro olduğu için (R-41) manifest
bu düzeltme olmadan **hiç yazılamıyordu** — testi yazmasaydık bunu ilk gerçek
çalıştırmada, para harcandıktan sonra öğrenirdik.
Sözleşme: `bigint` → **ondalık dize**. `Number`a çevirmek reddedildi — 2^53 üstü mikro
değerler sessizce yuvarlanır ve defter yanlış toplar; dize kayıpsız ve `git diff`te
okunabilir. Okurken şekil tabanlı revive: `{micros: <dize>, currency: <dize>}` bir
`Money`dir. Alan ADINA göre çevirmek kırılgan olurdu.
**Revive olmasaydı `costVariance` sessizce felaket olurdu:** `micros` dize kalır ve
`+` toplama yerine BİRLEŞTİRME yapardı — `"28000" + "10000"` = `"2800010000"`.
Test bunu ayrıca sınıyor.

## D-120 — Doğrulayıcı geçersiz girdide ÇÖKMEZ
2026-08-15 · `inspectManifest` diskten okunan boş bir `{}` üstünde
`Cannot read properties of undefined (reading 'length')` ile patladı. `JSON.parse` bir
`{}`'ı da `RunManifest` sanar — **tip JSON sınırını geçmez.**
Doğrulayıcının kendisi geçersiz girdide çökerse doğrulayıcı değildir; ve `{}` bir
manifest dosyası olarak pekâlâ var olabilir. `steps` ve `candidates` artık
`Array.isArray` ile korunuyor, eksikse `missing_field` raporlanıyor.
Bu, `classify`ın toplam fonksiyona çevrilmesiyle (D-114 civarı) aynı desen: **tipin
geçmediği her sınırda çalışma zamanı savunması gerekir.** Üçüncü kez.

## D-121 — Manifest kapıya bağlandı: manifest'siz varlık yayınlanamaz
2026-08-15 · §13 "manifest'siz çıktı bir hatadır" diyor. `compliance` kapısı artık her
blob'un sidecar'ındaki `sourceRunId`'yi okuyup `derived/runs/<id>/manifest.json`
varlığını VE temizliğini doğruluyor. Gerçek bir varlık `run_manifestsiz` ile depoya
alındı ve kapı reddetti.
Sapma oranı **tahminin ÜST sınırına** göre: kullanıcı onaylarken gördüğü sayı odur ve
sapma "onayladığım rakamı aştı mı" sorusunu cevaplamalı. Ortalamaya göre hesaplasaydık
her çalıştırma yarı yarıya sapmış görünür ve %20 eşiği anlamını kaybederdi.

## D-122 — `RENDER` yönlendirilmez: yetenek YOK, yerel metered adım
2026-08-15 · Hat ilk koşuşunda `render` adımı `NO_PROVIDER` ile düştü: `image.render`
yeteneğini sağlayan hiçbir sağlayıcı yok — ve olmamalı da. **R-30 tek render motoru
diyor; bir motoru "seçmek", ikinci bir motorun var olabileceğini varsayar.**
Yönlendirici DIŞARIDAKİ sağlayıcılar içindir; Chromium içeride.
Motor artık üç dala ayrılıyor: metered + yetenekli → yönlendirilir · metered +
yeteneksiz → **yerel** (bütçe/defter yolundan geçer ama seçim yok) · metered değil →
doğrudan koşar. Pipeline'lardan `capability: image.render` silindi.
`RENDER`ın metered kalması doğru: para harcamıyor ama kaynak harcıyor ve **süre de bir
maliyettir** (§8.3). Tutar sıfır ama olayın kendisi deftere yazılıyor.

## D-123 — Marka QA'sı markanın KENDİ paletini göremiyordu
2026-08-15 · İlk gerçek carousel çalıştırmasında ΔE ve palet payı okumaları rapordan
**sessizce düştü**. Sebep: marka token'ları OKLCH (§12.1) ve `parseHex` yalnız hex
okuyor; palet boş kalınca `measure` o okumaları hiç eklemiyordu.
Davranış **doğruydu** (D-111: ölçülemeyen metrik rapora girmez) ama **sebep yanlıştı**:
ölçülemeyen şey aslında ölçülebilirdi. Kapı yeşil, marka QA'sı kör.
`parseOklch` eklendi (OKLCH → OKLab → doğrusal sRGB → sRGB → Lab, ~35 satır, yine
bağımlılıksız). Doğruluk bilinen bir eşleşmeyle sınandı: `oklch(0.628 0.2577 29.23)`
tam olarak `#FF0000` veriyor ve iki gösterim arasındaki ΔE < 0,5.
Sonuç: gerçek carousel'de **ΔE 0,1 · palet dışı %0,9** — marka QA'sı artık görüyor.
**Ders:** "ölçülemedi" diyen bir kapı da bir bulgudur; neden ölçemediği sorulmalı.

## D-124 — ★ FAZ 3'ün hedefi karşılandı: hat uçtan uca koştu
2026-08-15 · `just uret instagram-carousel "imalat fire ölçümü"` gerçek bir çalıştırma
üretti: corpus'tan kayıt seçildi → belge modeli kuruldu → **gerçek Chromium** iki slayt
render etti → marka QA ölçtü → slaytlar damgalandı → içerik-adresli depoya alındı →
manifest yazıldı → hat **insan kapısında durdu**.
Türkçe tipografi doğru: `İddia` · `Şirketin` · `çalışan` · `altyapısı` · `ölçülebilir`.
Marka QA gerçek sayılar veriyor: **ΔE 0,1 · palet dışı %0,9 · metin kaplama %6,7**.
**Görsel adımı dürüstçe düştü** (`NO_PROVIDER`, iki gerekçesiyle) ve hat DEVAM etti —
çünkü adım `optional: true`. Bu bir yedek değil, `free` şeridin dürüst hâli: arka plan
görseli olmayan bir slayt düz zeminle render edilir ve tipografi ikisinde de aynıdır
(§8.2). Zorunlu saysaydık, anahtarı olmayan bir kurulumda hat hiç koşmazdı.
**Kalan tek eksik sağlayıcı anahtarları** (V-16) — hattın kendisi değil.

## D-125 — Çalıştırma parametresi ile pipeline kısıtı AYRI
2026-08-15 · Hat ilk koşuşunda `MISSING_TOPIC` ile durdu: konu pipeline'da yoktu ve
olmamalıydı da. Pipeline kısıtları **sözleşmedir** (bu hat neyi nasıl yapar); çalıştırma
parametreleri **örnektir** (bu sefer hangi konu). Konuyu pipeline'a yazmak, her konu
için ayrı bir YAML demekti.
**Parametre kısıtı EZEMEZ**: birleştirme sırası `{...params, ...constraints}` — pipeline
her zaman kazanır. Aksi hâlde çalıştırma anında `no_text: false` geçilebilirdi ve R-20
bir çalıştırma tercihine dönerdi.

## D-126 — Platform spec'i KOD, tolerans platforma ÖZEL
2026-08-15 · `packages/render/src/specs/placements.ts`: her satır `sourceUrl` +
`verifiedAt` taşıyor. Tarihsiz bir spec, **ne zaman doğru olduğunu söylemez** ve
platform ölçüleri sessizce değişiyor (Meta feed'i 1:1'den 4:5'e taşıdı).
**Tolerans tek ve global DEĞİL**: Instagram ±%1, LinkedIn ±%5. Tek bir sayı ikisinden
birinde yanlış olurdu — "yeterince yakın" bir yeniden boyutlandırma Facebook'tan geçip
Instagram'dan reddedilir. `measure` artık limiti yerleşimden alıyor.
`specAgeDays` bozuk tarihte `Infinity` dönüyor, 0 değil: "yeni doğrulandı" demek en
kötü yalan olurdu.

## D-127 — Kalite merdiveninde ÖLÇEK en son düşer
2026-08-15 · LinkedIn 5MB'ı aşan görseli reddeder. Merdiven altı basamak: PNG → JPEG
%92/%85/%75 → ölçek ×0,8 ile %85/%75.
**Sıra bilinçli:** 1200px'de %70 JPEG, 900px'de %90 JPEG'den okunaklıdır ve tipografi
ölçek düşünce doğrudan zarar görür — §7.1'in "küçültme yok" ilkesinin yayın tarafındaki
karşılığı. Bir test her basamağın bir öncekinden küçük olduğunu ayrıca doğruluyor;
yukarı çıkan bir basamak merdiveni anlamsız yapardı.
**Merdiven tükenirse hat DURUR.** İhlal testi: sınır 3KB'a indirildi → `QA_OUT_OF_TOLERANCE`,
`kalite` adımında durdu, hiçbir şey yayınlanmadı. Sessizce yayınlamak, "3 varlık
ürettim" sanıp sıfır yayınlamaktır.

## D-128 — Döngünün durum modelinde "faz kapanıyor" hâli YOKTU
2026-08-15 · `durum` kapısı `siradaki_adim: FAZ-3-KAPANIS`i reddetti: her değer bir faz
adımı olmak zorundaydı. Ama faz kapanışı (LOOP§D) gerçek bir iş ve bir adım değil —
model eksikti.
`FAZ-N-KAPANIS` eklendi ve **kaçış deliği değil**: kontrol edilebilir bir koşulu var —
o fazın BLOKE OLMAYAN her adımı tikli olmalı. `bloke` listesi boşaltılınca kapı
kırmızıya dönüyor.
**Kapı eklerken gerçek bir tutarsızlık yakaladı:** `3.2` düzyazıda "ATLANDI" yazıyordu
ama makine-okunur `bloke` listesinde YOKTU. Bağlamı sıfırlanmış bir agent o adımı
"sıradaki iş" sanabilirdi. Düzyazı ile makine bloğunun ayrışması, `DURUM.md`'nin tam
olarak önlemesi gereken şey.

## D-129 — R-65 BLOCKING yazıyordu ama zorlaması YOKTU
2026-08-15 · `KURALLAR.md` R-65'i "BLOCKING · Zorlama: `docs-drift` kapısı" diye
listeliyor ve ANAYASA §8.7 "`just docs` üretir, `docs-drift` sapmayı yakalar" diyor.
**İkisi de doğru değildi**: `just docs` bir `echo` taslağıydı ve `docs-drift` diye bir
kapı yoktu. `KURALLAR.md`'nin kendi başlığı bunu yasaklıyor: *"Zorlaması olmayan kural
buraya yazılmaz — uygulanmayan 111 kural, uygulanan 20 kuraldan kötüdür."*
`just docs` artık İKİ belge üretiyor — ANAYASA ikisini de "üretilmiş" ilan ediyordu:
`docs/referans/saglayicilar.md` (§8.7, kaynak `registry/providers/*.provider.yaml`) ve
`docs/referans/pipelinelar.md` (§10, kaynak `registry/pipelines/*.pipeline.yaml`).
`docs-drift` kapısı ikisini de denetliyor. 23. kapı.
**Kapı ilk yazımda işi SESSİZCE yok ediyordu:** önce `just docs` koşuyor, elle yapılmış
düzenlemeyi eziyor, sonra `git diff` boş çıkıyor ve yeşil raporluyordu. R-65 "elle
düzenleme kaybolur" diyor ama **sessizce kaybolması** başka şey. Kapı artık üretim
ÖNCESİ ve SONRASI içeriği karşılaştırıyor ve iki durumu da bildiriyor: elle düzenleme
ve tazelenmemiş kaynak.

## D-130 — `just doctor` her zaman "bloke: 0" diyordu
2026-08-15 · Sağlık raporu `grep -c '^  - adim:' DURUM.md` ile bloke sayıyordu —
`DURUM.md`'nin **hiç sahip olmadığı** bir biçim. Yani doctor her koşuda "bloke: 0"
diyordu ve gerçekte 3 bloke adım (2.9, 3.2, 3.8) vardı.
Doctor, §16'nın deyişiyle "bir ay ihmalden sonra açılacak ilk ekran". **Yalan söyleyen
bir sağlık raporu, sağlık raporu olmamasından kötüdür**: kullanıcı ona bakıp "engel yok"
diye devam eder.
Artık gerçek biçimi (`bloke: [...]`) okuyor ve hangi adımların bloke olduğunu da yazıyor.
Ayrıca commit'lenmemiş çalıştırma defteri girdilerini bildiriyor — `derived/runs`
türetilemez (R-52) ve commit'lenmeden duran bir çalıştırma bir `git clean` uzaklıkta.

## D-131 — `gitleaks` `fast` grubuna taşındı: secret kapısı COMMIT'te çalışmalı
2026-08-15 · `just gates all` FAZ 3 kapanış kanıtı için koşuldu ve **kırmızı çıktı**:
gitleaks bir bulgu buldu. `just check` (fast) onu hiç koşmadığı için 14 commit boyunca
görünmemişti.
Bulgunun kendisi bir test fixture'ıydı (aşağıda), ama **asıl bulgu kapının yerindeydi**:
`GROUP: all` demek, secret taramasının yalnız `just verify` ve pre-push'ta koşması demek.
**Git geçmişi silinmez** — R-51'in bütün gerekçesi bu. Push anında yakalanan bir secret
ZATEN yerel geçmişe girmiştir; çıkarmak için geçmiş yeniden yazılır. Commit anında
yakalanan geçmişe hiç girmez. Bedel 1,7 saniye; geçmiş yeniden yazmanın bedeli ölçülemez.

## D-132 — gitleaks muafiyeti PARMAK İZİ bazlı, desen bazlı değil
2026-08-15 · Bulgu `packages/providers/src/descriptor.test.ts:65` — `parseDescriptor`ın
anahtar GİBİ görünen bir değeri REDDETTİĞİNİ kanıtlayan test (R-51). Dizeler uydurma.
İki yanlış çözüm vardı:
1. **Dizeleri "anahtara benzemeyecek" hâle getirmek** → test, kuralın anahtar ŞEKLİNİ
   yakaladığını artık kanıtlamazdı. Testi zayıflatarak kapıyı geçirmek yasak (R-73).
2. **Dosyayı ya da deseni allowlist'e almak** → o dosya tamamen körleşirdi ve yarın
   oraya yazılan GERÇEK bir anahtar sessizce geçerdi.
Seçilen: `.gitleaksignore`da **parmak izi** (`commit:dosya:kural:satır`). O tek satır,
o tek hâliyle muaf. İki ihlal testiyle doğrulandı: aynı dosyaya başka bir anahtar
eklemek → **yakalanıyor**; muaf satırı iki satır kaydırmak → **muafiyet düşüyor**.

## D-133 — Chroma sınırları zorlanmıyordu; `tokens` kapısı §12.1'i iddia ediyordu
2026-08-15 · `tokens` kapısının docstring'i "§12.1 zorlanır" diyordu ama yalnız KADEME
denetimi vardı. Kademesi kusursuz bir token pekâlâ ekranın dörtte birini C=0.12 ile
boyayabiliyordu — ve renk her yerde olduğunda hiçbir yerde uyarı kalmaz (ISA-101).
`checkChroma` eklendi: alan sınıfı token ADINDAN türer (`bg`/`surface`/`track` → dolgu,
`line`/`hair` → kenarlık, `text`/`label` → metin, `signal`/`state`/`tolerance` → sinyal),
sınırlar §12.1'den (0.02 · 0.04 · 0.06 · 0.16). Tanınmayan ad `null` → denetlenmez:
sınır UYDURMAK, yanlış sınırı zorlamaktan kötüdür.
1. kademe (`ramp`) hariç: sinyal rampasının yüksek chroma'sı TASARIMDIR; sınır onu
KULLANAN role/comp token'ına uygulanır — kullanım yeri, tanım yeri değil.
Dört sınıfın dördü de kasten ihlal edilip kırmızıya döndürüldü; sınırın altındaki
değerler geçiyor.
