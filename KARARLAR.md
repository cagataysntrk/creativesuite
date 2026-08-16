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

## D-171 — Bitmiş adımın TALİMATI faz dosyasında kalmaz
2026-08-16 · FAZ-4.md 250 satır tavanına (R-63) beş kez dayandı ve her seferinde bir
adımı sıkıştırarak yer açtım. Beşincide bunun bir sıkışıklık değil bir SİNYAL olduğunu
kabul ettim: 17 adımlık bir faz, her adımın tam talimatıyla birlikte 250 satıra sığmaz —
ve tavanı yükseltmek yanlış cevap olurdu (tavan, bir faz dosyasının tek oturuşta
okunabilir kalması için var).
Doğru cevap: **bir faz dosyası bir ÇALIŞMA TALİMATIDIR; bitmiş bir adımın talimatı
arkeolojidir.** Tikli adımlarda `🛠` (ne yapılacak), `📁` (nereye) ve `💾` (commit
mesajı) satırları siliniyor; `📖` (kaynaklar), `✅` (KANIT) ve `🧪` (ihlal testi)
kalıyor. Silinen bilgi kaybolmuyor: kod, `git log` ve `KARARLAR.md` onu taşıyor —
üçü de faz dosyasından daha güvenilir kaynaklar.
Tikli altı adım sıkıştırıldı: 257 → 212 satır. Kalan on bir adım için yer açıldı ve
her tikleme artık dosyayı KÜÇÜLTÜYOR.
**Ders:** aynı sınıra beşinci kez çarpmak, sınırın yanlış olduğunu değil, dosyanın
yanlış şey taşıdığını gösterir. Tavanı yükseltmek soruyu susturur.

## D-172 — Koşucu donmuş planı KULLANIR, yeniden çözmez
2026-08-16 · R-07'nin çalıştırma tarafı eksikti: `freezePlan` planı donduruyordu ama
`runPipeline` her adımda yönlendiriciyi YENİDEN çağırıyordu. Yani onay bir plana
veriliyor, koşan başka bir plan oluyordu — ve fark ancak fatura gelince görülürdü.
`RunInput.frozen` eklendi. Donmuş adımın sağlayıcısı varsa `candidatesFor` HİÇ
çağrılmıyor. "Çağır ve karşılaştır" alternatifi reddedildi: karşılaştırma "farklı çıktı,
ne yapayım" sorusunu doğurur ve tek doğru cevap zaten donmuş olanı kullanmaktır.
Kabul kriteri gerçek kodla doğrulandı: registry'yi değiştirdim (`p1` kalktı, `p2` $9.00
ile geldi) ve çalıştırma **`p1` ile $0.025'e** koştu. Testi kaldırdığımda kırmızıya
döndü — koruduğu doğrulandı.
Üç ek dürüstlük: (1) launcher planı **gerçek HEAD commit'iyle** donduruyor, `worktree`
ile değil — `worktree` yazan manifest KUSURLUDUR (D-155) ve o plandan çıkan varlık
yayınlanamaz, yani sunucu commit'i okumazsa baştan yayınlanamaz planlar donardı;
(2) tanımlayıcı özeti dosya İÇERİĞİNDEN hesaplanıyor, sürüm alanından değil — sürümü
artırmadan fiyat değiştiren herkes görünmez kalırdı ve tam o düzenleme planı geçersiz
kılan şey; (3) `unpriced` kilidi gerçek repoda hemen iş gördü: `gorsel-uret` adımı
V-16 anahtarları olmadığı için fiyatlanamıyor ve **başlat kilitli** — eksik bir tahminle
onay vermek, bilinmeyen bir tutara onay vermektir.
**Ders:** bir kural iki uçlu olduğunda (dondur + donmuşu kullan) yalnız birini yazmak,
kuralı yazılı ama işlemez bırakır. `freezePlan` tek başına bir belge parçasıydı.

## D-173 — Red iki yere yazılır: manifest o çalıştırmanın kanıtı, defter markanın hafızası
2026-08-16 · `just onay` reddi yalnız çalıştırmanın manifest'ine yazıyordu. Sonuç: red o
çalıştırmayla birlikte ölüyordu. `brand/<id>/decisions.jsonl` **hiç oluşmamıştı** —
sticky karar defteri (§4.5) kodu tamdı (`parseLedger`/`suppression`/`appendLine`),
`discovery.mjs` onu okuyordu, ama **hiçbir yol ona yazmıyordu.** Yazılı, okunan ve hep
boş kalan bir defter.
Onay kuyruğu artık iki yere yazıyor: manifest (o çalıştırmanın kanıtı, §13) ve defter
(markanın hafızası, §4.5). Onay yalnız manifeste gider — defter REDLERİN hafızasıdır,
"evet" kendini açıklar ve tekrar sorulması zaten istenen şeydir.
İki koruma daha: **gerekçesiz red reddedilir** (bilgi taşımayan bir "hayır" sonraki
çalıştırmaya hiçbir şey söylemez) ve **karar EZİLMEZ** (aynı kapıya ikinci karar 409).
Üçü de ihlal testiyle doğrulandı.
Yol boyunca manifest'te gerçek bir eksik çıktı: `awaitingGate` yalnız çalıştırma anındaki
RAPOR nesnesindeydi, diske yazılmıyordu. Yani manifest "bu çalıştırma beni mi bekliyor"
sorusunu cevaplayamıyordu — ve onay kuyruğunun tek kaynağı manifest. Alan eklendi
(isteğe bağlı, eski manifest'ler geçerli kalıyor).
**Ders (yedinci kez):** bir mekanizmanın kodu, testi ve okuyucusu olabilir ve yine de
hiç çalışmıyor olabilir — çünkü kimse ona YAZMIYOR. "Bu özellik var mı" sorusunun cevabı
kodda değil, veri akışında.

## D-174 — Fikstür yine kablo biçimini uydurdu: `ProviderCandidate`
2026-08-16 · `sunucu.test.ts` fikstürü `candidates: [{ providerId, outcome: 'won',
reason: null }]` yazıyordu. Gerçek `ProviderCandidate` şu: `{ providerId, capability,
selected, rejectionReason, estimatedCost }`. `outcome` diye bir alan YOK.
Yedi test bu fikstürle geçiyordu çünkü hiçbiri `writeManifest` çağırmıyordu. Onay kuyruğu
çağırdığı an `no_selected_provider` kusuruyla düştü — yani manifest doğrulayıcısı doğru
çalıştı ve fikstürün yalanını ilk fırsatta yakaladı.
Bu D-163'ün birebir tekrarı ve aynı turda ikinci kez oldu. **Kural artık şu: bir fikstür
yazmadan önce tipin tanımı OKUNUR.** Tip zaten repoda; onu okumamak, kendi varsayımını
test etmektir.

## D-175 — Tolerans okuması tipi Ring -1'e: ölçen ile gösteren ortak sözlüğü
2026-08-16 · Sistemin imza öğesi (§11.1) tolerans okumasıdır ve iki halka onu paylaşmak
zorunda: ölçüm `packages/render/src/qa/`de yapılır (Chromium, piksel, ΔE2000), gösterim
tarayıcı halkasında. Ama `packages/ui` `render`ı import EDEMEZ — `render` Playwright çeker.
D-165'in aynı sorusu, aynı cevabı: **tip Ring -1'e taşındı**, mantık yerinde kaldı.
`ToleranceReading`/`ToleranceStatus`/`QaReport` artık `packages/contracts/src/tolerance.ts`te;
`render` onları import edip yeniden dışa açıyor, yani mevcut hiçbir çağıran değişmedi.
Tarayıcı tarafında ikinci bir arayüz tanımlasaydık, ölçüm alanı eklendiğinde ekran onu
sessizce görmezden gelirdi — ve eksik bir ölçüm ekranı, yanlış bir ölçüm ekranıdır.
Yol boyunca gerçek bir ölü uç çıktı: `validateBody`ın `check` sözleşmesi
`{ blocked, report: string }` döndürüyordu — yani ölçüm **kaynağında yapılandırılmışken**
(`measure()` `QaReport` döner) metne düzleştiriliyordu. Tolerans bileşeni bir dizenin
içindeki sayının altına bant çizemez. Sözleşme `readings?` ile genişletildi (isteğe bağlı,
eski çağıranlar çalışıyor) ve `uret.mjs` okumaları yapılandırılmış topluyor — aynı metrik
birden çok slayttan gelirse **en KÖTÜ okuma** kalıyor, ortalama değil: ortalama, bir
slaydın sınır dışı olduğunu diğerlerinin arkasına gizler.
**Rozet yasağı kapıya bağlandı:** `ui-tema` artık `✓ uygun` / `uyumlu ✓` / `marka uyumu`
ifadelerini reddediyor. Yorumlar soyuluyor — bir kuralı ihlal eden ifadeyi NEDEN yasak
olduğunu anlatan yorumda alıntılamak meşrudur ve kapının ilk sürümü tam da bu dosyanın
kendi gerekçe yorumunu yakaladı.
**Ders:** "ölçülmedi" ile "geçti" iki farklı cümledir. Boş bir tolerans raporu gösterip
sessiz kalmak, QA hiç koşmamış bir varlığı temiz göstermektir — `olculdu` bayrağı ayrı
gidiyor ve kapı onun varlığını zorluyor.

## D-176 — Güvenli alan kodda ve KENDİ kaynağıyla; `null` ile sıfır ayrı
2026-08-16 · §9.1 Reels güvenli alanını sayıyla veriyordu (üst %14, alt %35, yan %6 →
1080×1920'de 950×979) ama **kod bunu hiç bilmiyordu**. Placement Preview'ın tek işi o
bandı çizmek; belgede duran bir sayı, çizilemeyen bir sayıdır.
`Placement.safeArea` eklendi ve bir test §9.1'in sayısını kodla karşılaştırıyor: belge ile
kod ayrışırsa hangisinin doğru olduğu anlaşılmaz, o yüzden ayrışma bir hatadır.
**Güvenli alan KENDİ `sourceUrl`+`verifiedAt`ini taşıyor.** Yerleşim ölçüsü Meta'nın boyut
dokümanından, güvenli alan Reels tasarım kılavuzundan geliyor — tek tarih paylaşsalardı
biri güncellenince diğeri de "doğrulanmış" görünürdü.
**`safeArea: null` ile `{0,0,0}` AYRI:** birincisi "bu yerleşimde chrome yok" (feed
görselinde UI görselin üstüne binmez), ikincisi "ölçüldü ve sıfır çıktı" — ve ikincisi
hiçbir platformda doğru değil. Kapı bu ayrımı zorluyor.
Taşma **pikselle** raporlanıyor: "taşıyor" düzeltilebilir bir bilgi değil, "üstten 69px
taşıyor" düzeltilebilir bir bilgidir. Her kenar ayrı.
Tip yine Ring -1'e taşındı (D-165, D-175 ile aynı gerekçe; üçüncü kez): tarayıcı halkası
`render`ı import edemez, ama VERİ de kopyalanmadı — `/api/yerlesimler` ile geliyor ve
spec güncellendiğinde ekran otomatik doğru ölçüyü çiziyor.
**Ders:** bir sayı belgede duruyorsa "tanımlı" değildir. Tanımlı olması, onu okuyan bir
testin ve onu çizen bir kodun olması demektir.

## D-177 — `kind: 'skip'` iki farklı şeyi birleştiriyordu; sütunlar BEŞ oldu
2026-08-16 · Reconciliation ekranının tüm amacı "hiçbir şey değişmedi" ile "insan hayır
dedi"yi AYIRMAK: birincisi kaydırıp geçtiğiniz gürültü, ikincisi dikkatinizin ait olduğu
yer. Motor ikisini de `kind: 'skip'` diyordu ve fark yalnız `reason` METNİNDE vardı —
bir cümleyi düzeltmek ekranın sütununu değiştirirdi.
Op'a **ayrık `why` alanı** eklendi (`unchanged` · `previously_rejected` · `pinned` ·
`human_zone` · `new_record` · `content_changed` · `absent_in_candidates`). Sütunlar
ondan MEKANİK türüyor, prose ayrıştırılmıyor.
**Sütun sayısı beş, dört değil.** Plan arşivi dört diyordu (DEĞİŞMEDİ / DEĞİŞTİ /
ÇELİŞTİ / YENİ) ama `retire` hiçbirine düşmüyordu — ve emeklilik mirror modunun en
sonuçlu op'u. Dördüncüye sıkıştırmak, silinen bir kaydı "değişti"nin arkasına gizlemek
olurdu. Sessizce sıkıştırmak yerine faz dosyası düzeltildi.
İkinci bulgu daha ağır: **plan yolu imza bütünlüğünü HİÇ doğrulamıyordu.** §4.4 "imza
kırıksa çalıştırma durur" diyor ve `signatureIntact` yalnız YAZMA yolunda (`write.ts`)
çağrılıyordu. Yani plan ekranı, insanın elle düzelttiği bir kayıt için "update" gösterip
emeğini üzerine yazacakmış gibi görünüyordu. `ExistingRecord.signatureBroken` +
`DiscoveryPlan.halted` eklendi; `just discovery plan` artık gerçekten DURUYOR.
Kanıt: gerçek bir kaydın gövdesine bir cümle ekledim → `✗ PLAN DURDU — 1 kaydın imzası
kırık`, çıkış kodu 1. Beş sütun gerçek planla doğrulandı: `pinned` ve `human_zone`
ÇELİŞTİ'ye, `unchanged` ayrı sütuna düştü.
**Ders:** bir enum iki farklı gerçeği tek değere sıkıştırıyorsa, ekran o ayrımı
YAPAMAZ — ve ayrımı metinden geri kazanmaya çalışmak, veriyi ikinci kez ve daha kötü
temsil etmektir.

## D-178 — `ok: true` "analiz koştu" demek, "değişiklik güvenli" DEĞİL
2026-08-16 · Şema kuru çalıştırma ucu reddedilen bir göçe **200** dönüyordu. Gövdede
`✗ 5 yıkıcı değişiklik — kaydetme REDDEDİLDİ` yazıyordu ama durum kodu başarı diyordu:
gövdeyi okumayan her istemci yıkıcı bir göçü uygulanmış sanardı. Kendi yorumumda bu
tehlikeyi yazmıştım ve kodda yapmıştım — `r.ok` "analiz yapılabildi" demekti, ben onu
"sonuç iyi" diye okudum.
Üç durum kodu, üç farklı gerçek: **422** şema profil dışı (analiz HİÇ yapılamadı) ·
**409** analiz koştu ama değişiklik güvenli değil · **200** güvenli. Gerçek corpus'a
karşı dördü de doğrulandı.
Alan silmek **kayıt sayısından bağımsız** reddediliyor: sıfır kayıt etkilense bile
gelecekte yazılacak tarihsel okuyucular kırılır. Ret yetmez, yol gösterilir —
`x-retired: true` (R-12'nin şema seviyesindeki karşılığı: emeklilik silme değildir).
**Yol boyunca daha büyük bir bulgu:** hiçbir corpus kaydı `attributes` bloğu taşımıyor.
Yedi varlık tipi tanımlı, projeksiyon derleyicisi dört hedefe derliyor (§3.4), `registry`
kapısı şemaları doğruluyor — ama kayıtlar alanları NESİR GÖVDEDE taşıyor ve şemalara
hiç bağlı değil. Yani form, katı LLM şeması ve SQLite DDL projeksiyonlarının bağlanacak
verisi yok. Ekran bunu sessizce geçmiyor: her tip için `ozniteliktiKayit` gösteriliyor
ve `0` ise "şema hiçbir kayda bağlı değil" yazıyor — yoksa kuru çalıştırmanın "her kayıt
kırılacak" demesi açıklanamaz bir alarm olurdu.
**Ders:** bir `Result` iki soruyu cevaplıyorsa ("işlem yapılabildi mi" ve "sonuç iyi mi")
çağıran ikisini karıştırır. Ayrı alanlar, ayrı durum kodları.

## D-179 — Bütçe tavanı env değişkeninden Ring 1'e taşındı
2026-08-16 · Tavan `SUITE_RUN_CAP` ortam değişkenindeydi. Üç sorun: UI'dan
değiştirilemez (D-17 "tavanlar UI'dan ayarlanır" diyor), git'te görünmez, iki makinede
farklı olabilir — ve "bu çalıştırma hangi tavanla koştu" sorusu cevapsız kalır.
**Tavan bir KARARDIR ve kararlar Ring 1'de, git'te yaşar** (D-11). `registry/butce.yaml`
açıldı; `uret.mjs` onu okuyor, sunucu okuyup YAZIYOR, ekran düzenliyor.
Kabul kriteri uçtan uca ölçüldü: `just uret` `100000` okuyordu → UI `250000` yazdı →
sonraki `just uret` `250000` okudu.
Dört dürüstlük kararı: (1) **`null` ile `0` karıştırılmaz** — biri tavansız, diğeri "hiç
harcama yapma" ve ikincisi meşru bir tercih; (2) **çalıştırma tavanı aylıktan büyük
olamaz** — ikisinden biri anlamsız olurdu (422); (3) **bozuk dosya sessizce varsayılana
düşmez**, hata panoda görünür: kullanıcının koyduğunu sandığı tavanın yerine başka bir
tavanla koşmak, tavan koymamaktan tehlikelidir; (4) **kota ÖLÇÜLMÜYOR ve bu yazılıyor** —
sağlayıcı kota uçları FAZ-7.8'de gelecek, uydurulmuş bir "%80 dolu" göstergesi hiç
göstergesi olmamaktan tehlikelidir (D-175).
Yazma ucu var ama **commit yok**: dosya güncellenir, `git diff`te görünür ve commit
insanın kararıdır (R-14). Sunucunun kendi kendine commit atması, "onay = git commit"
yasasını sunucunun eline verirdi.
**Ders:** bir yapılandırma değeri env'de yaşıyorsa, o değer hakkında hiçbir soru
cevaplanamaz — ne "kim değiştirdi", ne "ne zaman", ne "hangi çalıştırma hangisini gördü".

## D-180 — Yüzey sınırı token'a bağlı değil, sözleşmeye bağlı
2026-08-16 · `4.13` Telegram botu istiyordu ama `TELEGRAM_BOT_TOKEN` yer tutucu
(`doldurulacak`, 12 karakter — gerçek token ~46) ve `tailscale` kurulu değil. İki seçenek
vardı: adımı tamamen bloke etmek ya da token gerektirmeyen kısmı yapmak.
İkincisi seçildi çünkü botun ASIL işi bir sözleşmedir, bir ağ bağlantısı değil:
**Telegram yalnız onay/red/gerekçedir** (§4c). O sınır saf bir fonksiyonda yaşıyor ve
token olmadan test edilebiliyor — `/uret` `/plan` `/sema` `/butce` `/discovery` `/sil`
hepsi **403 + gerekçe** ile geri çevriliyor.
**403, 404 değil:** komut TANINIYOR ama bu yüzeyde yok. 404 "böyle bir komut yok" derdi
ve kullanıcı başka yazımlar denerdi — sessiz yok sayma "belki ileride ekleriz"in kibar
hâlidir.
Üç ek karar: gerekçesiz red **bu yüzeyde de** reddediliyor (aynı kural iki yüzeyde farklı
olamaz — D-173); bozuk inline callback `null` dönüyor, sessizce ONAYA dönüşmüyor; ve
yer tutucu token ile bot **AÇILMIYOR ama bu SESSİZ kalmıyor** — sunucu açılışta
`telegram botu: KAPALI` yazıyor. Sessiz kalsaydı "bot çalışıyor" sanılır ve masadan
uzaktayken kuyruk sessizce tıkanırdı.
Adım bölündü: `4.13` (sözleşme, bitti) · `4.13b` (gerçek token + Tailscale, `bloke: insan`,
V-18). Beşinci insan blokajı — hepsi `insan` sınıfında ve LOOP§G üçlü kuralına saymıyor
(D-157), ama DURUM.md ⛔ bloğunda adlarıyla ilan ediliyor.
**Ders:** bir bileşenin "dış bağımlılığı var" olması, hiçbir parçasının yapılamayacağı
anlamına gelmez. Sözleşmeyi bağlantıdan ayırmak, blokajın kapsamını daraltır.

## D-181 — Karantina SAYILIR ama listelenmez; "defter yok" ile "yayınlanmadı" ayrıdır
2026-08-16 · Varlık kütüphanesi gerçek repoda **0 varlık** gösteriyor — `derived/blobs`
boş, çünkü 14 varlık D-155'te karantinaya alındı. Boş bir kütüphane açıklanamaz bir
sonuçtur: operatör "hiç üretmemişim" sanar. Üç seçenek vardı: karantinayı listelemek
(yayınlanamaz varlığı kullanılabilir göstermek), hiç saymamak (sessizlik), ya da
**listeye almadan saymak**. Üçüncüsü seçildi ve ekran sebebini yazıyor.
İkinci ayrım daha ince: **yayın defteri HİÇ YOK.** Bu durumda "yayınlanmadı" bir ölçüm
değil bir varsayımdır ve fark söylenmeli — `yayinDefteriYok` ayrı bir alan olarak gidiyor.
Aynı ilkenin üçüncü uygulaması (D-175 "ölçülmedi ≠ geçti", D-179 "kota null = ölçülmüyor").
**Reuse varlığı değil KARARI kopyalar** (§4c): donmuş girdiler, konu, bağlam commit'i.
Baytı kopyalamak yeni bir iş üretmez; kararı kopyalamak LLM'i yeniden çalıştırmadan
benzer bir iş üretir. Manifest yoksa Reuse yapılamaz ve 404 döner — "kopyalandı" deyip
boş bir form açmak, kullanıcının donmuş girdileri elle yeniden yazması demekti.
**Kendi ihlal testim yine geçersizdi:** "bedava şerit boşa harcanana sayılmaz" testi
`gercek: '0'` fikstürü kullanıyordu, yani kuralı değil rastlantıyı sınıyordu — bedava
şeridi saysak da toplam 0 çıkıyordu. Fikstür `5000`e çevrildi ve ihlal kırmızıya döndü.
**Ders:** bir kuralı sınayan fikstür, kural KALDIRILDIĞINDA sonucu değişecek biçimde
seçilmelidir. Sıfır değerler her iki dalda da aynı sonucu verir ve testi süse çevirir.

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
