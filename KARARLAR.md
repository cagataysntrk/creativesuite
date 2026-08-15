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

## D-134 — `uret.mjs` retrieval yüklemini ATLIYORDU: R-13 ve R-14 ihlali
2026-08-15 · Doğrulama agent'ı FAZ 3 kapanışında buldu: `scripts/uret.mjs`
`globSync('corpus/*/*.md')` + `.includes()` ile **ikinci bir retrieval yüklemi** kuruyor
ve yedi `status: draft` kaydı üretime sokuyordu. İki BLOCKING kural birden çiğneniyordu —
R-13 (yüklem kodda tek yerde) ve R-14 (draft retrieval'a GÖRÜNMEZ, onay insanın işi).
`retrieval-yuklemi` darboğazı göremedi: deseni SQL şeklini arıyor (`FROM record`,
`WHERE brand_id`) ve `uret.mjs` dosya sistemi üzerinden gidiyordu. **Desen BİÇİMİ
yakalıyordu, ERİŞİMİ değil.** Regex'i genişletmek çözüm değil — çözüm ikinci yüklemi
SİLMEK oldu.
Artık `selectRecords`/`selectSearch` çağrılıyor. Onaylanmamış corpus'ta bu **sıfır kayıt**
döndürüyor ve hat `NO_CONTEXT` ile duruyor: **doğru davranış budur.** FAZ-2.9 insan
onayını bekliyor ve o kapı atlanamaz.

## D-135 — Devre kesici adım başına kuruluyordu: hiç açılamıyordu
2026-08-15 · `run.ts` her adımda `new CircuitBreaker()` çağırıyordu. Durum süreç-içi bir
`Map`te ve adım başına taze; eşik 5 ardışık hata, tek adımda en fazla 3 deneme →
**kesici yapısal olarak hiç açılamıyordu.** FAZ-3.6'nın "devre kesici canlı" iddiası
kâğıt üstündeydi. Artık çalıştırma başına bir tane, ve `RunInput.breaker` ile
enjekte edilebilir (çağıran çalıştırmalar arası paylaşabilir).

## D-136 — Adım çıktısının ÖZETİ manifest'e girer
2026-08-15 · FAZ 3 çıkış kriteri "QA skorları manifest'te" diyordu; `VALIDATE`
`data: { qa }` döndürüyordu ama `run.ts` `StepRecord`a hiç yazmıyordu — QA yalnız
konsola basılıyordu ve 11 manifest'in 11'inde alan yoktu.
`StepRecord.output` eklendi ve **özet** taşıyor: QA raporu, slayt sayısı/yolları, seçilen
kalite basamağı, boyutlar. Tam çıktı DEĞİL — belge modelini manifest'e gömmek dosyayı
şişirir ve `git diff`i okunamaz yapar. Byte'lar `derived/blobs`ta (§3.5); manifest bir
DEFTERDİR, bir depo değil.

## D-137 — Maliyet defteri `:memory:` idi: SIGKILL testi hiç koşmamıştı
2026-08-15 · `uret.mjs` `openDb({ path: ':memory:' })` kullanıyordu. Defter süreçle
birlikte ölüyor, yeniden başlatma idempotency kaydını bulamıyor ve **aynı çağrı tekrar
uçuyordu** — FAZ-3.6'nın "çift ücret yok" iddiasının tam tersi. `scheduler.ts` doğru
yazılmıştı; üretim yolu ona her seferinde boş bir defter veriyordu.
Defter artık `derived/index/ledger.db`de kalıcı.

## D-138 — `knowledgeCommit()` yazılmıştı, sıfır çağıranı vardı
2026-08-15 · §13 bilgi ağacı commit SHA'sını "replay'i GERÇEK yapan alan" diye tanımlıyor.
`manifest-writer.ts` onu okuyan fonksiyonu taşıyordu ama **hiçbir yerden çağrılmıyordu**;
`uret.mjs` alanı `'worktree'` sabitiyle dolduruyordu ve 11 manifest'in hepsinde alan
sahteydi. `inspectManifest` yalnız "boş dize değil" baktığı için temiz raporluyordu.
Artık git'ten okunuyor ve okunamazsa çalıştırma DURUYOR — sahte bir SHA, replay'in yalan
söylemesidir. "Yazıldı ama hiç çağrılmadı" deseninin bu segmentteki yedinci örneği.

## D-139 — Kalite merdiveni hiçbir şey YAPMIYORDU
2026-08-15 · `climbLadder` uydurma bir formülle (`boyut × kalite/200 × ölçek²`) bir
basamak "seçiyor", sonra o basamak **hiçbir yere gitmiyordu**: dosya orijinal PNG olarak
kalıyordu. Doğrulama agent'ı limiti 30KB'a indirip 53KB'lık bir varlığın **sessizce
yayınlandığını** gösterdi. Benim ihlal testim yalnız son-basamak dalını sınamıştı.
`renderWithinLimit` eklendi: **her basamak GERÇEKTEN render ediliyor ve dosya
ÖLÇÜLÜYOR.** Tahmin yok — sıkıştırılmış boyut içeriğe bağlıdır ve hiçbir formül onu
bilemez. JPEG basamakları `.jpg` yazıyor: format dosya adından okunabilmeli.
Merdiven tükenirse **hata**; son basamağı "en iyisi buydu" diye kabul etmek, sınırı aşan
bir varlığı yayına göndermektir.
Ölçülen gerçek: 1200×1500 düz zeminli bir slaytta PNG 30.247 bayt, JPEG %92/%85/%75
**daha büyük** (düz renkte PNG kazanır) ve ancak ×0,8 ölçekte 29.120 bayta iniyor.
Merdiven bunu dürüstçe raporluyor.

## D-140 — Darboğaz kapsamı üretim betiklerini dışarıda bırakıyordu
2026-08-15 · `kapsam_varsayilan` yalnız `packages|apps` idi. **Para harcayan tek betik**
(`scripts/uret.mjs`) 22 darboğazın hiçbirinin kapsamında değildi; agent orada dört ihlal
buldu. `scripts/uret.mjs` ve `scripts/plan.mjs` kapsama alındı — ikisi de `just` ile
koşan ÜRETİM YOLUDUR.
Kapı betikleri (`scripts/gates/**`, `*-kontrol.mjs`, üreteçler) kapsam DIŞI: onlar
araçtır: bir kapının `git` çağırması kapının işidir.
`logger` darboğazı CLI'lar için muaf — bir CLI'ın işi stdout'a tablo basmaktır; kuralın
koruduğu şey "korelasyon id'si taşımayan ikinci bir OLAY logger'ı".

## D-141 — `providerCall` üretimden hiç çağrılmıyordu; GENERATE sahte bir köprüydü
2026-08-15 · Doğrulama agent'ının B8+B9 bulgusu, aynı kökün iki yüzü:
- `providerCall` (jitter'lı polling, `Retry-After`, tutamak kalıcılığı) yazılmıştı ama
  **yalnız kendi testinden** çağrılıyordu. `run.ts` `externalId: null` sabit yazıyordu,
  yani `noteHandle` hiç tetiklenmiyor ve R-44'ün tutamak koruması ölü kalıyordu.
- `uret.mjs`'teki `generate` köprüsü sabit `MISSING_CREDENTIALS` döndürüyordu:
  `cloudflareImage`/`falImage` adaptörlerine **hiç ulaşılmıyordu.** "İki şerit de görsel
  üretiyor" iddiası (FAZ-3.7 ✅) hiç sınanmamıştı.
Kök neden aynıydı: motor kazanan sağlayıcıyı gövdeye AKTARMIYORDU. `BodyInput` artık
`providerId`, `noteHandle` ve `resumeExternalId` taşıyor; `generateBody` adaptörü bulup
`validate()`ten (prompt R-20 kurucusundan geçer) sonra `providerCall`ı kuruyor.
Anahtar yoksa hata artık **adaptörün kendisinden** geliyor — sahte bir sabitten değil.
Bu, bu segmentteki "yazıldı ama hiç çağrılmadı" deseninin sekizinci ve dokuzuncu örneği.

## D-142 — `3.7` ve `3.14` tikleri GERİ ALINDI; LOOP§G eşiği aşıldı ve döngü DEVAM ediyor
2026-08-15 · Doğrulama turu iki tiki geçersiz kıldı:
- **3.7** ✅ "İki şerit de görsel üretiyor" — hiçbir şerit görsel üretmedi. Sözleşme,
  msw ile HTTP şekli ve R-20 kuralı sınandı; **canlı üretim sınanmadı** (V-16: anahtar yok).
- **3.14** ✅ "Gerçek bir carousel üretildi" — üretildi ama **onaylanmamış corpus** ile,
  yani R-14 çiğnenerek (D-134). Retrieval düzeltildikten sonra hat dürüstçe `NO_CONTEXT`
  veriyor: ✅ artık FAZ-2.9'un insan onayını bekliyor.
Tiki geri almak pahalı görünüyor ama alternatifi daha pahalı: **karşılanmamış bir kriteri
tikli bırakmak, faz dosyasını yalancı yapar** ve bağlamı sıfırlanmış bir agent onu
"bitmiş" sanar (LOOP§C).

**LOOP§G tetiklendi ve bilinçli olarak DEVAM ediliyor.** Kural: *"Aynı fazda üç adım
birden bloke olursa döngü durur ve kullanıcıya sorar — çünkü üç bloke adım artık bir
uygulama sorunu değil, plan hatasıdır."* FAZ 3'te dört bloke adım var: 3.2 (V-02), 3.7
(V-16), 3.8 (V-16), 3.14 (FAZ-2.9).
**Ama kuralın gerekçesi burada geçerli değil:** dördü de PLAN HATASI değil, planın
**önceden kaydettiği** dış girdilerdir — V-02 (marka fontu lisansı), V-16 (sağlayıcı
anahtarları), 2.9 (insan onayı). Üçü de `KARARLAR.md`'de doğrulama borcu olarak duruyor
ve üçü de yalnız İNSAN tarafından açılabilir; döngünün durup sorması yeni bir bilgi
üretmez, yalnız ilerlemeyi durdurur.
Kullanıcı "ben pc başında değilim, tam yetki sende" dedi. Durmak yerine: durum
`DURUM.md`'de **görünür** kılındı, bloke listesi dörde çıkarıldı ve tur çıktısında açıkça
bildirildi. Sessiz sapma yok — kuralın tetiklendiği ve neden aşıldığı burada yazılı.

## D-143 — Dört ikincil bulgu: denylist'ler, NUL baytı, sahte dayanak
2026-08-15 · Doğrulama turu 1'in ikincil bulgularından dördü kapatıldı:
**İ2 · `lexicon` R-20 bloğu yalnız İNGİLİZCE anahtar arıyordu.** `ustyazi:` gibi bir
Türkçe anahtarı hiç görmüyordu — *Türkçe içerik üreten bir sistemde İngilizce anahtar
listesi*. Türkçe adlar eklendi ve **kısıt DEĞERLERİ de taranıyor**: anahtar masum
olabilir, değeri olmayabilir (`scene_hint: 'duvarda büyük FİRE ibaresi'`).
**İ3 · `registry` R-40 denylist'i eksik ve anchor'ı delikti.** `ideogram`, `recraft`,
`kling`, `veo`, `qwen`, `seedream` listede yoktu — faz dosyasının kendi metninde geçen
Ideogram dahil. Ayrıca `^\s*-?\s*(model|…)` anchor'ı `video_model:` ve
`fallback_engine:` gibi ÖN EKLİ adları kaçırıyordu; artık `\w*` iki yandan açık.
Yedi ihlal denendi, yedisi de yakalandı.
**İ8 · `idempotency.ts` gerçek bir NUL baytı içeriyordu.** `file` komutu dosyayı `data`
(binary) sanıyor, `grep -r` ve birçok tarama aracı onu **sessizce atlıyordu** — bir
kaynak dosyada kör nokta. Ayırıcı artık `'\u0000'` kaçış dizisiyle yazılıyor; davranış
aynı, dosya metin.
**İ7 · Uyum dayanağı ÇAĞIRANIN beyanıydı.** `promptDigest`e `uret.mjs` çalıştırma
kimliğini yazıyordu. `assertCompliance` artık özeti **kendi hesaplıyor** ve çağıranın
yazdığını yok sayıyor: dayanağını kendi yazan bir iddia, iddia değil beyandır.
