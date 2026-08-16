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

## V-20 — HyperFrames render'ı 45 sn boşuna bekliyor
`sub_timeline_readiness_timeout`: 6 saniyelik video **1 dk 34 sn**de render oluyor,
oysa iskelet kompozisyonu (GSAP'li) 10,7 sn'de bitiyordu. Koşucunun sözleşmesi
paketten OKUNDU (`hyperframe.runtime.iife.js`): `Object.keys(__timelines).length > 0`
ve `typeof timeline.duration === 'function'`. İkisi de karşılandı — bekleme sürüyor,
yani tetikleyen başka bir koşul var (mesaj "**sub**-composition" diyor ve bizim
alt-kompozisyonumuz yok). Çıktı DOĞRU (h264/yuv420p/1920×1080/30fps); bedel yalnız
süre. Hareket hattı gerçekten kullanılmaya başlayınca (FAZ-5.7) ölçülüp çözülür. → FAZ-5.7

## V-21 — TTS anahtarları ve model ağırlıkları yok, ses ÜRETİLMEDİ
Üç sağlayıcı da `enabled: false`: `chatterbox` model ağırlıkları indirilmedi (~2 GB),
`gemini-tts` `GEMINI_API_KEY` yok, `elevenlabs` `ELEVENLABS_API_KEY` yok ve premium
şerit gerçek para harcıyor. Sözleşme yazıldı ve test edildi (lisans kuralı iki ihlalle
kırmızıya döndürüldü); kalan iş yalnız bağlantı. → FAZ-5.4b

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

## D-182 — Donmuş plan diske yazılmıyordu: `rerun` düğmesi sessizce `replay` olurdu
2026-08-16 · `4.15`in ön koşulunu ararken veri akışı izlendi (D-173'ün dersi) ve şu
çıktı: `freezePlan` üretiliyor, `launcherPlani` HTTP cevabında döndürüyor, `runPipeline`
geri alıp kullanıyor — ve süreç bitince plan **kayboluyordu**. Diskte yalnız manifest
vardı. Gerçek repoda ölçüldü: **18 çalıştırmanın 0'ında donmuş plan var.**
Sonuç, bir eksiklikten fazlası olurdu: `rerun` ("kararı tekrarla") düğmesi koysaydık,
donmuş plan olmadığı için sessizce yeniden planlardı — yani `replay` yapardı. Ekran iki
ayrı eylem gösterip tek eylem yapardı ve fark ancak farklı bir sağlayıcıyla farklı bir
fatura geldiğinde görülürdü.
Karar: donmuş plan `derived/runs/<id>/plan.json` altına yazılır (`planPath`, kernel'in
`manifest-yazici` darboğazında). Manifest'ten TÜRETİLEMEZ: manifest gerçekleşeni yazar,
plan onay anındaki kararı — alternatifler, kısıtlar, kayıt kümesi.
Ve plan **yoksa** `rerun` MÜMKÜN DEĞİL olarak, gerekçesiyle döner. Düğmeyi gizlemek de
etkinleştirmek de yalan olurdu; üçüncü seçenek gerçeği söylemek.

## D-183 — Dört ekran yönlendirmede vardı, palette yoktu: ulaşılamaz "biten" adımlar
2026-08-16 · `kesif` · `sema` · `butce` · `varliklar` — dördü de `App.tsx`te
yönlendiriliyordu, dördü de `KOMUTLAR` listesinde yoktu. **Menü yok, palet birincil
navigasyondur** (§12.5); palette olmayan ekranı açmanın hiçbir yolu yok. Dört faz adımı
"bitti" diye tiklenmişti, dördünün de ucu cevap veriyordu, testleri geçiyordu — ve
kullanıcı hiçbirini göremezdi. 26 kapının hiçbiri bakmıyordu.
Ters yön de sessizdi: `instagram-post` gibi üç üretim komutu seçildiğinde `giris`e
düşüyordu, yani komut bulunup tıklanıyor ve hiçbir şey olmuyordu.
Karar: `ui-navigasyon` kapısı — her yönlendirilen ekranın bir palet komutu, her palet
komutunun bir hedefi olmalı. Üretim komutları artık launcher'ı O hatla açıyor.
**Ders:** "uç çalışıyor + test yeşil" ile "kullanıcı ulaşabiliyor" farklı iddialar.
İkincisi ölçülmediği sürece birincisi bir şey kanıtlamaz.

## D-184 — Node 20'ye düşen kabuk 144 testi sessizce KOŞTURMUYORDU
2026-08-16 · Tam test paketi `Test Files 56 passed (64)` yazıyordu ve bunun yanında tek
satırlık `Errors 8` vardı. Sekiz dosya hiç koşmamıştı: `better-sqlite3` başka bir Node
ABI'si için derlenmişti ve `require` anında **SIGSEGV** veriyordu (çıkış kodu 139).
Kabuk `nvm` varsayılanıyla v20.20.0'a düşmüştü. `.nvmrc` FAZ-0'dan beri `22` yazıyordu —
ama **`.nvmrc` bir dilektir, zorlama değil**: `nvm use` çağrılmadıkça kimse okumaz.
`engines` alanı yoktu ve hiçbir kapı sürüme bakmıyordu.
Belirti yanıltıcı: hata testin içinde değil koşucunun altyapısında, çıktı yeşile çok
benziyor ve test SAYISI düşüyor — kimsenin ezberinde olmayan tek sayı.
Karar: `.nvmrc` (22) + `engines.node >=22` + `node-surum` kapısı. Kapı sürüm numarasına
bakıp geçmiyor, `better-sqlite3`ü GERÇEKTEN yüklemeyi deniyor: doğru sürümde yeniden
derlenmemiş bir bağımlılık da aynı sessiz kaybı verir.
Node 22'de: **64 dosya, 902 test, hepsi yeşil.**

## D-185 — Strateji lint kuralları yalnız kapı betiğinde yaşıyordu
2026-08-16 · `4.16` panosunu yazarken kuralların nerede olduğu arandı: yasak terim
listesi, sayısal iddia tespiti, gövdeden alan çıkarma — hepsi `scripts/lexicon.mjs`
içinde, kapı betiğinin gövdesinde, test edilemez JavaScript olarak. Pano aynı kuralları
göstermek zorunda. İkinci bir kopya yazmak D-160'ın birebir tekrarı olurdu: iki gerçek,
ikisi de "doğru", bir gün sessizce ayrışırlar — ve o gün pano "temiz" derken kapı
kırmızı olur, hangisinin haklı olduğu belirsiz kalır.
Kurallar `packages/engine/src/saglik/strateji.ts`e çıkarıldı; kapı da pano da **aynı
fonksiyonu** çağırıyor. Halka gerekçesi: corpus okumak `@suite/corpus`, lexicon
`@suite/render` — kardeşler, birbirini import edemez; ikisini birleştiren en alçak
halka `engine`.
**Ayrıştırmadan sonra kapı yeniden ihlal edildi** (D-153: bir düzeltme commit'i iki CLI'ı
kırmıştı ve 24 kapı görmedi): gerçek bir corpus kaydına yasak terim + kaynaksız `%47`
eklendi, kapı ikisini de yakalayıp kırmızıya döndü.
**Yeni ayrım — `alanlar_nesirde`.** Gerçek `proof_asset` kaydında `generalisation_note`,
`era_of_origin` ve `transfer_confidence` **nesirde** yazılı, frontmatter'da değil.
"Alan eksik" demek haksız bir suçlama olurdu — argüman orada. Ayrı bir tür açıldı
(D-177: enum iki gerçeği sıkıştırmasın) ve `uyari` şiddetinde: denetim bugün gövde
başlıklarını okuyarak çalışıyor, başlıklar değişirse sessizce kör kalır.
Gerçek repoda ölçüldü: **7 kayıt, 0 blocking, 1 uyarı.**

## D-186 — İhlal testi SAYI doğruluyordu, İÇERİK değil
2026-08-16 · `4.16`nın ilk ihlal testi yasak terim listesini boşalttı ve **testler yeşil
kaldı**. Sebep: test `bulgular.map(b => b.kayitId)`in `['rec_kirli','rec_kirli']` olmasını
bekliyordu — yani iki bulgu olmasını, hangisi olduğunu değil. Yasak terim kuralı
kalktığında başka bir bulgu sayıyı doldurabilirdi.
D-181 fikstürün değerini düzeltmişti; bu onun bir üst katmanı: **fikstür doğru olsa da
İDDİA yanlış yerde durabilir.** Sayı, iki kuralı birbirinin yerine geçirir. Test bulgu
MESAJLARINI doğrulayacak biçimde yeniden yazıldı ve ihlal kırmızıya döndü.
İkinci ders aynı turdan: ihlali uygulayan betiğin kendisi de hatalıydı —
`s.index("]")` `readonly string[]` içindeki köşeli ayraca takıldı ve üretilen kod
`= [] = [...]` oldu; bu **geçerli JavaScript** (boş dizi destructuring) olduğu için
derleme geçti ve liste hiç boşalmadı. `assert` vardı ama fazla gevşekti.
**Ders:** ihlal testinde üç şey ayrı ayrı doğrulanmalı — ihlal UYGULANDI mı, kod
DERLENİYOR mu, ve iddia ihlal edilen KURALA mı bakıyor.

## D-187 — Doctor'ın denetimleri kabuk betiğindeydi; kapı ile ekran ayrışırdı
2026-08-16 · `4.17`nin ✅ kriteri açık: *"`just doctor` ile aynı bulguları gösteriyor"*.
Denetimler `scripts/doctor.sh` içinde bash olarak yaşıyordu — öksüz çalıştırma taraması,
defter kirliliği, tazelik. Ekranın aynı bulguları göstermesi için ya betiği HTTP'den
çağırmak ya da kuralları TypeScript'te tekrar yazmak gerekiyordu. İkincisi D-185'in
tekrarı olurdu.
Denetimler `packages/engine/src/saglik/doktor.ts`e taşındı; `scripts/doctor.sh` artık
yalnız kabuğun kendi bağlamını (git özeti, kapı sayısı) basıyor ve gövdeyi modülden
alıyor. Taşıma sırasında iki denetim KAZANILDI: indeks/corpus ayrışması (kabukta hiç
yoktu) ve %20 üstü maliyet sapması (`doctor.sh` sonunda *"FAZ-8.4'te eklenecek"*
yazıyordu — modülde `costVariance` zaten hazırdı).
**`doctor-salt-okur` kapısı.** "Rapor eder, hiçbir şeyi değiştirmez" bir yorumla
korunamaz: "düzelt" düğmesi her zaman makul görünür ve tam bu yüzden bir gün eklenir.
Kapı doctor yolundaki üç dosyada yazma çağrısı ve durum değiştiren uç arıyor. İki farklı
ihlalle kırmızıya döndürüldü: öksüz çalıştırmayı silen `rmSync`, ve `/api/doktor`un
POST'a çevrilmesi.
**Atlanan denetim GİZLENMİYOR.** Sunucu ucu git olgularını toplamıyor (`git-cagiran`
darboğazı tek dosyaya kilitli), indeks kapalıysa ayrışma ölçülemiyor — rapor bunları
`atlananDenetimler` altında ADIYLA söylüyor. Boş bırakmak "kontrol edildi, temiz"
izlenimi verirdi (D-175 ailesinin altıncı uygulaması).
Gerçek çıktı: **2 kritik** (`claude-code` fiyat anlık görüntüsü yok ama enabled ·
1 çalıştırmada 2 varlık var manifest yok) **1 uyarı**.

## D-188 — FAZ 4 kapanış turu: "düzeltildi" sanılan üç şey düzeltilmemişti
2026-08-16 · Bağımsız doğrulama (LOOP§D) FAZ 4'ü **kapanışa hazır DEĞİL** buldu ve en
ağır bulgu benim kendi düzeltmemdi: **D-182 yarım kapatılmıştı.** `writeFrozenPlan`
yazıldı, `runPipeline` onu çağırıyordu — ama üretim CLI'ı (`scripts/uret.mjs`) `frozen`
alanını hiç geçmiyordu. Disk hâlâ **0/18**. `DURUM.md` "donmuş plan artık diske
yazılıyor" diyordu; yazmıyordu. Düzeltme koda ve teste girdi, **çağırana girmedi** —
yani D-173'ün tam kendisi, üstelik D-173'ü anlatan bir commit'te.
Şimdi `uret.mjs` planı `plan()` + `freezePlan()` ile donduruyor, motora veriyor ve
`derived/runs/<id>/donmus-plan.json` diske düşüyor. Gerçek kanıt: `rerun mümkün = true`,
`sapma ÖLÇÜLDÜ = true`, sapma listesi dolu (corpus/registry commit'i kaymış).
**Ders:** bir düzeltmenin kanıtı, düzeltilen katmanın testi değil, **üretim yolunun
diskte bıraktığı izdir.** "0/18" ölçümünü yazdım ama ölçümü tekrarlamadım.

## D-189 — Bozuk bir VERİ dosyası üretimi tamamen durdurmuştu, 29 kapı görmedi
2026-08-16 · `registry/butce.yaml` diskte `per_run 9_000_000` > `per_month 1_000`
taşıyordu — çelişkili. Sonuç: `just uret` **hiç başlamıyordu**, her çalıştırma açılışta
"bütçe tavanı okunamadı" ile düşüyordu. Değerler FAZ-4.12'nin kendi commit'inden
(`f2767ba`) geliyor: bir ihlal testinden kalmış ve geri alınmamış.
Okuma yolu doğru davrandı — sessizce varsayılana düşmedi (D-179 tam da bunu istiyordu).
Eksik olan, **bozuk verinin commit edilebilmesiydi**: 29 kapı `packages/` ve `apps/`
altındaki her satırı denetliyordu, `registry/` altındaki VERİYİ hiçbiri denetlemiyordu.
`registry-veri` kapısı eklendi ve tam bu bozulma ile kırmızıya döndürüldü.
**Ders:** kod kadar veri de commit edilebilir ve veri de sistemi durdurabilir. "Kapı"
demek "kod kapısı" demek değil.

## D-190 — "Başlat" düğmesinin eylemi yoktu; FAZ 4'ün çıkış kriteri kopuktu
2026-08-16 · Run Launcher planı kuruyor, maliyet aralığını basıyor, bütçe kilidini
hesaplıyordu — düğmenin `onClick`i yoktu ve sunucuda çalıştırma başlatan uç yoktu.
FAZ 4'ün çıkış kriteri *"⌘K → seç → çalıştır → onayla, fareye hiç dokunmadan"* zincirin
"çalıştır" adımında kopuyordu. 29 kapı ve 918 test bunu görmedi çünkü **13 ekran
bileşeninin sıfır testi var**; sayılan testler sunucu testleri.
Eklenenler: `POST /api/calistir` (özet ZORUNLU — onay bir ÖZETE verilir, R-07),
`POST /api/calistirmalar/:id/rerun|replay` (AYRI uçlar, çünkü ayrı eylemler), ve
CLI'da `--run` · `--plan-digest` · `--rerun` · `--replay`. Digest uyuşmazlığı
çalıştırmayı **başlamadan durduruyor** ve bu kırmızıya döndürülerek gösterildi.
**İkinci bir üretim yolu AÇILMADI:** sunucu `runPipeline`ı kendi içinde çağırmıyor,
`just uret`i başlatıyor. İçeride çağırsaydık biri planı donduran, diğeri belki
dondurmayan iki üretim yolu olurdu (D-185 ailesi).
`ui-dugme` kapısı eklendi: her `<button>` bir eylem taşımalı. Kapı yazıldığı anda
**benim `4.15`te yazdığım iki ölü düğmeyi daha buldu** (`rerun`, `replay`) — ikisi de
bağlandı.

## D-191 — Red gerekçesi yazılıyordu, hiç okunmuyordu; ve görsele ASLA gitmez
2026-08-16 · `brand/<marka>/decisions.jsonl` bir redde yazılıyordu ama **hiçbir üretim
yolu okumuyordu.** `DecisionEntry.reason`ın kendi dokümanı *"sonraki çalıştırmaya
negatif kısıt olarak enjekte edilir"* diyordu — D-173'ün en birebir hâli: tipin
dokümantasyonu var olmayan bir davranışı tarif ediyordu.
`uret.mjs` artık defteri okuyor, **yalnız kapı redlerini** (`/gate/…`) alıyor (keşif
redleri corpus kayıtlarına ait, kreatif prompt'a girmeleri anlamsız) ve **en yeni beşini**
tekilleştirip `kacinilacak` kısıtı olarak veriyor. Hepsini eklemek prompt'u geçmişin
çöplüğüne çevirirdi; altı ay önceki bir red bugünkü işi kısıtlamaya devam ederdi.
**Karar — gerekçe YALNIZ metin yeteneklerine girer, görsele ASLA.** Red gerekçesi
serbest Türkçe nesirdir ve görsel prompt'una eklenmesi iki şeyden birini yapar:
*"başlıktaki yazı fazla küçük"* gibi bir gerekçe R-20 kurucusunu tetikler ve çalıştırma
reddedilir; ya da daha kötüsü, metin İSTEYEN bir cümle görsel modeline gider. Görsel
modeline Türkçe metin çizdirilmez — on iki yasadan biri ve bir kolaylık için esnetilmez.
Sınır `deps.capability.startsWith('image.')` ile çiziliyor ve ihlal testiyle kırmızıya
döndürüldü: aynı gerekçe metin yeteneğinde prompt'a giriyor, görsel yeteneğinde girmiyor.

## D-192 — Ekranların sabit kodlu parametreleri ve tikli adımların bayat yolları
2026-08-16 · İki ayrı sessiz bozulma, aynı kök: **bir kez yazılıp bir daha
doğrulanmayan iddia.**
`DiscoveryEkrani` `runId="run_discovery_dry"` ile açılıyordu; o çalıştırma repoda hiç
var olmadı ve ekran gerçek veride **kalıcı olarak 404** gösteriyordu — beş sütun hiç
görülmedi. `BaglamOnizleme` `tarif="instagram-post"`a çivilenmişti; palet başka tarif
seçtiremiyordu. İlki artık kimliği kullanıcıdan alıyor (plan kurmak insanın işidir,
R-14 — bir sayfa yenilemesiyle tetiklenmez), ikincisi paletin seçtiği hattı izliyor.
FAZ-4'ün yedi `📁` yolu planlama sırasında yazılmış ve hiç güncellenmemişti; gerçek
yerleşim düz `apps/ui/src/*.tsx`. FAZ-3'te bir tane daha: `COMPOSE` gövdesi
`packages/kernel/src/verbs/compose.ts` diye gösteriliyordu, gerçekte
`packages/engine/src/verbs/bodies.ts`.
`faz-yollari` kapısı eklendi: **tikli** bir adımın `📁` satırı artık plan değil,
İDDİADIR ve dosya var olmak zorunda. Tiksiz adımlar denetlenmiyor — onların yolu hâlâ
bir plan. Kapı ilk koşuşunda 13 yanlış pozitif verdi (glob, brace, yer tutucu) ve
onlar elendi: sürekli alarm veren kapı, kapatılan kapıdır.
**Bileşen testi kararı:** 13 ekranın sıfır testi olması gerçek bir boşluk ama DOM test
altyapısı iki bağımlılık demek (R-75). Boşluğun SOMUT hâli — "kontrol hiçbir şey
yapmıyor" — `ui-dugme` kapısıyla sıfır bağımlılıkla ve tüm ekranları birden kapsayarak
kapatıldı; kapı düğmelere ek olarak `onChange`siz kontrollü girdileri de yakalıyor
(ikisi de sessizdir: kullanıcı bir şey yapmaya çalışır, hiçbir şey olmaz, hata da yok).
Render durumları ve hata dalları için gerçek bileşen testi FAZ 9'a kalıyor.

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
