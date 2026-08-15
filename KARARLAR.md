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

## D-160 — Bileşen token'ı düz değere derleniyordu: iki yüzey imkânsızdı
2026-08-15 · `toCss` her token'ın **çözülmüş** değerini basıyordu:
`--comp-status-bar-bg: oklch(0.21 …)`. Kademe denetimi kusursuz çalışıyordu, çıktı
doğru görünüyordu ve `[data-surface="studio"]` içinde `--role-surface`ı yeniden
tanımlamak **hiçbir şey yapmazdı** — bileşen token'ı çoktan pişmişti. Yani §12.4'ün iki
yüzey bağlamı yapısal olarak imkânsızdı ve bunu ancak yüzeyi yazmaya kalkınca gördük.
Takma ad artık `var(--role-x)`e derleniyor: üç kademe CSS'te de kademe olarak duruyor ve
kaskad onu taşıyor. Ham rampalar düz değer kalır — zincirin bir yerde gerçek bir renge
bağlanması gerekiyor.
Yüzey dosyaları (`<ad>.surface.tokens.json`) AYRI derlenir, temel ağacın rampalarını
ödünç alır ve **yalnız `role.*` tanımlayabilir**. Rampa tanımlasa kabuk iki farklı gri
olurdu — "marka-nötr izleme kabini" tezinin (§12.1) tam tersi. Bileşen tanımlasa iki
tasarım sistemi olurdu ve biri bakımsız kalırdı. Yüzey RENGİ değiştirir, YAPIYI değil.
Yüzey tanımları kalıtılır: `brd_dima` stüdyo yüzeyini `brd_upcytech`ten aldı, tek satır
yazmadan. Kalıtılmasaydı ana markanın yüzeyini güncellemek her alt markada elle tekrar
gerektirirdi ve biri unutulurdu.
Üç ihlalle doğrulandı: yüzeye `ramp` → kırmızı · `comp` → kırmızı · rol chroma'sı
C=0.12 → kırmızı.
**Ders:** "çıktı doğru görünüyor" bir doğrulama değil. Bu token derleyicisi iki fazdır
doğru CSS üretiyordu ve üzerine inşa edilemeyecek bir CSS'ti.

## D-161 — `ui-tema` kapısının iki denetimi hiçbir şey yapmıyordu
2026-08-15 · Tema katmanı (`theme.css`) elle yazılır, yani kuralları yorumda kalırsa
kural değil temennidir. Kapı beş şey arıyor; yazdıktan sonra beşini de kasten ihlal
ettim ve **ikisi sessizce yeşil geçti**:
1. **Boşluk deseni satır BAŞINA bağlıydı** (`^[[:space:]]*padding`). `.x { padding: 5px }`
   tek satırlık bir kuraldır ve kaçtı. Bir CSS özelliği satırın herhangi bir yerinde
   başlayabilir; anchor `^` değil, sınır karakteridir.
2. **Süre denetimi `bc` kullanıyordu ve HER ZAMAN 0 hesaplıyordu.** `printf '%s'` sondaki
   satır sonunu basmıyor, `bc` ise ifadeyi sonlandırmak için onu istiyor; sonuç sessiz
   bir "syntax error" ve `|| echo 0` ile yutulan bir hata. 500ms'lik geçiş yeşil geçti.
   Aritmetik kabuğa taşındı — bir bağımlılık, yanlış kullanıldığında 40 satır koddan
   daha kırılgandır (R-75), ve `|| echo 0` kalıbı hatayı VARSAYILANA çevirdiği için
   yanlış kullanımı görünmez yapar.
Yedi ihlal + üç meşru durum doğrulandı: `box-shadow` · 700 ağırlık · 5px · 18px ·
`prefers-color-scheme` · 500ms · 0.5s kırmızı; `gap: 4px` · 300ms · `border: 1px` yeşil.
Gölge muafiyeti DOSYAYA değil KURAL BLOĞUNA bağlı (`[data-elevation='overlay']`'den ilk
`}`e kadar) — "bu dosyada gölge serbest" demek, yasağı ilk ihtiyaçta esnetmek olurdu.
**Ders (bu turda ikinci kez):** bir kapıyı yazmak onu test etmek değildir. Beş denetimden
ikisi doğdukları anda ölüydü ve tek fark, ihlali gerçekten denemekti.

## D-162 — `chokidar` eklenmedi: `fs.watch` özyineli çalışıyor
2026-08-15 · FAZ-4.2 açıkça `chokidar` diyordu (plandan gelen bir alışkanlık). Node 20'den
beri `fs.watch(dir, { recursive: true })` Linux ve macOS'ta çalışıyor ve bu ortamda
doğrulandı: `/tmp` altında iki seviye derinde açılan bir dosya olay üretti.
chokidar'ın asıl değeri **platformlar arası tutarsızlığı gizlemesi** — Windows'ta farklı,
BSD'de farklı davranan `fs.watch`ı tek bir arayüzün arkasına almak. Bizim tek bir yerel
platformumuz var (§3'ün "yerel komuta merkezi" tezi) ve onu doğrudan test edebiliyoruz;
gizlenecek bir tutarsızlık yok. 40 satır bir bağımlılıktan iyidir (R-75).
Yerine yazılan şey debounce'tur ve o gerçekten gerekli: tek bir dosya kaydetme `rename` +
`change` olarak iki kez gelir, editörün atomik yazması (geçici dosya + rename) üçe çıkarır.
Debounce olmadan her kaydetme üç SSE mesajı ve üç disk taraması demekti.
İzleyici kurulamazsa sunucu YİNE ayağa kalkar ama **sessizce "izliyorum" demez**:
`/api/saglik` gerçekten izlenen dizinleri listeler ve `cli-duman` kapısı o listenin boş
olmamasını doğruluyor — ihlal testinde listeyi boşalttığımda kapı kırmızıya döndü.
**Ders:** faz dosyasındaki bir araç adı bir karar değil, bir varsayımdır. Varsayımı
sorgulamak bir turluk iş; bağımlılığı sökmek bir yıllık.

## D-163 — Kablo biçimi UYDURULDU ve testler onu doğruladı
2026-08-15 · `apps/server/src/durum.ts` manifest'i okumak için KENDİ `JSON.parse`
reviver'ını taşıyordu ve `Money`nin diskteki biçimini `{micros: {__bigint: "…"}}`
sanıyordu. Gerçek biçim `{micros: "0", currency: "USD"}` ve kanonik okuyucu
(`readManifest`) zaten vardı.
Hata **sessizdi**: JS'te `bigint + string` bir dize BİRLEŞTİRMESİDİR, istisna atmaz.
Gerçek repoya karşı ilk istek `maliyetMikros: "000000000000000…"` döndürdü — 69 haneli
bir sıfır dizisi, `bandDisinda: true` ve tamamen anlamsız bir maliyet göstergesi.
**Dokuz birim testi bunu geçirdi** çünkü fikstürleri ben yazdım ve fikstür de aynı
uydurma biçimi kullanıyordu: test kodu değil, kendi varsayımını doğruladı. Bu, "yeşil test
bir şey kanıtlamaz"ın (R-71) en saf hâli — kapı yok, kandırılan bir ayna var.
İki düzeltme: (1) kendi okuyucum silindi, `readManifest`e devredildi — ikinci bir
ayrıştırıcı zaten `chokepoints`in yasakladığı şeydi; (2) fikstürler gerçek biçime
çevrildi ve regresyonu doğrulandı: maliyeti kasten dize birleştirdiğimde üç test kırmızı.
**Ders:** bir serileştirme biçimini kod yazarak öğrenemezsin, sadece OKUYARAK.
Fikstürünü yazan el, kodu yazan elle aynıysa test bir doğrulama değil, bir yankıdır.

## D-164 — Sunucu duman testi: `node --check` yetmez
2026-08-15 · D-153'te iki üretim CLI'ı import eksikliğinden kırıldı ve hiçbir kapı
görmedi; çözüm `cli-duman` kapısıydı ama sunucu betiği için yalnız `node --check`
yapıyordu — ki bu tam olarak D-153'ün yakalayamadığı hata sınıfıdır (dosya
ayrıştırılabilir, import'u eksik).
Nitekim ilk sürüm tam bu şekilde düştü: `scripts/sunucu.mjs` `@hono/node-server`ı
import ediyordu ama o paket pnpm workspace'te `apps/server/node_modules` altında, kökte
DEĞİL. Sözdizimi kusursuzdu; süreç `ERR_MODULE_NOT_FOUND` ile açılmadı.
`scripts/sunucu-duman.mjs` sunucuyu GERÇEKTEN kaldırıyor (port 0 — paralel koşuda
çakışmasın), üç ucu çağırıyor, bir dosya değişiminin SSE'ye yansıdığını doğruluyor ve
temiz kapatıyor. Hiçbir şey harcamaz: bu yalnız okuyan bir API (R-47 ruhu).
Ayrıca doğru mimari de ortaya çıktı: dinleyiciyi açan kod artık `apps/server/src/baslat.ts`
içinde, betikte değil — **bağımlılığın nerede yaşadığı, onu kimin çağırabileceğini
belirler** ve mantığın tip denetimli pakette durması D-153'ün asıl dersiydi.
**Ders:** bir dosyanın ayrıştırılabilmesi, çalışabildiğini göstermez. Aradaki farkı
yalnız çalıştırmak kapatır.

## D-165 — Türkçe katlama Ring -1'e taşındı: iki halkanın da ihtiyacı var
2026-08-15 · Komut paleti Türkçe arama yapmak zorunda (kullanıcı `icerik` yazıp `İçerik`
bulmalı) ve ilk sürümde kendi `.replace` zincirini taşıyordu. `turkish-case` kapısı onu
yakaladı (R-21: case dönüştüren tek yer). Kanonik `foldForSearch`e geçtiğimde bu kez
`rings` kapısı kırmızıya döndü: `apps/ui` **tarayıcı halkasıdır** ve kernel'i import
edemez — kernel `better-sqlite3` taşır.
Üç seçenek vardı: (a) `mayImport`u genişletmek — kırmızı kapının kuralını aynı turda
gevşetmek, R-76 açıkça yasaklıyor; (b) tarayıcıda ikinci bir katlama yazmak — o zaman
paletin bulduğu ile FTS5 indeksinin bulduğu ayrışır ve kullanıcı iki farklı sonuç görüp
hangisinin doğru olduğunu asla anlayamaz (§5.6 katlamanın `unicode61 remove_diacritics 2`
ile AYNI olmasını şart koşuyor); (c) primitifi doğru halkaya taşımak.
(c) seçildi: `packages/contracts/src/text-tr.ts`. Ring -1 hiçbir şey import etmez ve
herkes onu import eder — `Money` neyse Türkçe katlama da odur: **herkesin aynı biçimde
konuşmak zorunda olduğu bir ilkel.** Kernel onu yeniden dışa açıyor, o yüzden mevcut
`@suite/kernel` tüketicilerinin hiçbiri değişmedi. Yetkili yer hâlâ TEK, sadece doğru
halkada; `turkish-case` kapısının `KUTSANMIS` sabiti yeni yolu gösteriyor.
Tarayıcı paketi doğrulandı: `better-sqlite3` sızıntısı 0.
**Ders:** bir halka ihlali çoğu zaman "kural fazla katı" demek değil, "kod yanlış yerde"
demektir. Kuralı gevşetmek soruyu susturur; taşımak cevaplar.

## D-166 — Nabız aralığı UI'a gömülüydü: ölçüm aracı ölçümü bozar
2026-08-15 · Makine durumu şeridi "bağlantı yok"u nabız aralığının katıyla ölçüyor
(1,5 kat bayat, 3 kat kopuk) ve o aralık `App.tsx`te `NABIZ_MS = 5000` olarak GÖMÜLÜYDÜ.
Sunucu nabzını 30 sn'ye çıkardığı gün UI her nabızda "bağlantı yok" derdi — yani bağlantı
sağlıklıyken sürekli alarm veren bir gösterge, ki o gösterge bir hafta içinde yok sayılır.
İki gerçek deseninin bu turdaki üçüncü örneği (D-160 kaskad, D-163 kablo biçimi).
Aralık artık `/api/saglik`ta İLAN EDİLİYOR ve UI onu okuyor; gömülü sabit yalnız
öğrenene kadarki başlangıç değeri. Kapı ilanı zorunlu tutuyor — ilanı kaldırınca kırmızı.
Kabul kriteri gerçek bir SIGKILL ile doğrulandı: `canli` → sunucu ölür → `kopuk`,
"bağlantı yok" ve **son maliyet değeri gösterilmiyor**. Kalıcı bir göstergenin
yapabileceği en kötü şey, sustuğunu söylemeden son gördüğü değeri sonsuza kadar canlı
göstermesidir; toast'ın böyle bir sorunu yoktur çünkü zaten kaybolur.
**Ders:** iki tarafın paylaştığı her sayı, taraflardan birinde SABİT olduğu an bir
zaman bombasıdır. Sözleşmeyi taşıyan taraf onu ilan etmeli.

## D-167 — Dönem adı İKİ FARKLI dizeydi: corpus retrieval'a görünmezdi
2026-08-15 · Corpus Browser'ı gerçek veriye bağladığımda tarayıcı 7 kayıt yerine **1**
gösterdi. Sebep: `brand/brd_upcytech/current`, `era.yaml` `slug`ı ve `git tag era/…`
üçü de **`imalat-2026`** diyor; altı corpus kaydı ise `era_id: era_imalat_2026` taşıyordu.
İki farklı dize, hiçbir yerde karşılaştırılmıyor.
**Sonuç:** retrieval yüklemi (`era_id = :era OR era_id = '*'`) o altı kaydı ASLA
döndürmezdi. Ve bu **maskeliydi**: hepsi `draft` olduğu için zaten görünmüyorlardı.
`2.9` onaylandığı gün hepsi `active` olacak, kullanıcı onayladığını görecek ve `3.14`
yine `NO_CONTEXT` ile duracaktı — onayın işe yaramadığı sanılırdı.
Gerçek kodla ölçüldü: onaylanmış bir corpus kopyasında retrieval **7 kayıt** döndürüyor;
eski dizeyle **1**. Yani bu düzeltme olmadan `3.14` insan onayından sonra da bloke kalırdı.
Üç parça düzeltildi: (1) altı kaydın `era_id`si düzeltildi ve `x_signature` yeniden
hesaplandı — imzaya dokunmamak motoru "insan bu dosyaya dokundu" diye durdururdu ve bu
bir içerik yazarlığı değil, sistem seviyesinde veri düzeltmesi; (2) `uret.mjs` ve
`golden.mjs` dönemi GÖMÜYORDU, artık `brand/<id>/current`tan okuyorlar — kök neden buydu;
(3) `era` kapısı artık her corpus `era_id`sinin var olan bir döneme çözüldüğünü denetliyor.
Kapı yazıldığı anda altısını da kırmızıya çevirdi.
**Ders:** dönem modeli üç parçadır dedik (§4.3) ve kapı o üçünü denetliyordu. **Dördüncü
bir yer vardı** — kayıtların kendisi. Bir tutarlılık kapısı, kontrol ettiği kümenin TAM
olduğunu varsayar; o küme eksikse kapı yeşil yanar ve hiçbir şey korumaz.

## D-168 — Ters indeks manifest'ten TÜRETİLİR, saklanmaz
2026-08-15 · "Bu kaydı hangi çalıştırma kullandı" sorusunun cevabı manifest'lerin
`context` alanında zaten yazıyordu — yalnız ters yönde okunmuyordu. İki seçenek vardı:
ayrı bir tablo tutmak ya da her istekte manifest'leri taramak.
Tarama seçildi. Saklanan bir ters indeks **ikinci bir gerçek** olurdu ve manifest'le
ayrıştığı gün hangisinin doğru olduğu anlaşılmazdı; §13 açık: manifest bir çalıştırmanın
TEK kanıtıdır. Bu turda aynı deseni üç kez yaşadık (D-160, D-163, D-166) ve dördüncüsünü
bilerek yaratmanın gerekçesi yok — 16 çalıştırma için tarama 10 ms sürüyor, binler
olduğunda `derived/index` zaten var ve kaynağı yine manifest olur.
Üç dürüstlük kararı: (1) **"etkisi yok" AÇIKÇA yazılır** — sessiz bir boş liste "henüz
yüklenmedi" ile "hiç kullanılmadı"yı aynı şeye çevirir ve biri beklemek, diğeri kaydı
gözden geçirmek demektir; (2) "hiç çalıştırma yok" ayrı bir cümledir, "0 kullanım"
değil; (3) kusurlu manifest'le üretilmiş kullanımlar İŞARETLENİR — o varlık zaten
yayınlanamaz (D-155) ve bunu söylememek yarım cevaptır.
Git zaman çizgisi de ayrı bir günlükte tutulmuyor: `fileHistory` zaten vardı ve hiç
çağrılmıyordu. İkinci bir değişiklik günlüğü, git ile ayrışabilen bir gerçek olurdu
(12. yasa: kurtarma `git clone` + `cat`).
`git` alt sürecine **yalnız `PATH`** geçiyor (§14): tüm ortamı vermek, `sops exec-env`
ile enjekte edilen sağlayıcı anahtarlarını da alt sürece taşımak olurdu.
**Ders:** bir soruyu cevaplamanın en ucuz yolu genelde yeni veri üretmek değil, var olan
veriyi ters yönde okumaktır.

## D-169 — Elle bağlam daraltma manifest'e yazılır; boş bölüm nedenini söyler
2026-08-16 · Context Preview'ın iki kararı motorda, UI'da değil.
**Kapatma bir FİLTRE değil, bir KARAR.** `assembleContext` artık `excluded` alıyor ve
kapatılan kayıt listeden silinmiyor — `dropped`a `insan kapattı (Context Preview)`
gerekçesiyle giriyor ve `toManifestEntries` onu defter satırına çeviriyor. UI'da
filtreleseydik aynı girdi iki farklı çıktı üretir, farkın sebebi hiçbir yerde durmaz ve
replay (§13) o an yalan söylerdi. Ekranda da silinmiyor: üstü çizili durup "geri aç"
düğmesi taşıyor.
**Boş bölüm SESSİZ KALMAZ.** Önizleme gerçek corpus'ta sıfır kayıt gösterdi ve bu doğru
davranıştı (kayıtlar `draft`), ama ekran NEDENİNİ söylemiyordu — operatörün "bu pipeline
bağlam kullanmıyor" sanmasının kısa yolu. Üç ayrı sebep var ve üçü farklı iş gerektirir:
o tipte hiç kayıt yok · kayıt var ama onay bekliyor · kayıt var ama dönem dışı. Sebep
`browseRecords` ile ÖLÇÜLÜYOR (R-13: ikinci yüklem yok, görünürlük türetiliyor).
Adaylar `selectRecords`ten geliyor — `uret.mjs` ile AYNI yol. İki ayrı seçim yolu,
ekranda görülenle çalışanın ayrışması demekti.

## D-170 — İhlal testim BAYAT `dist` koşturuyordu: `2>/dev/null` derleme hatasını yuttu
2026-08-16 · `ui-tema` ve bağlam ucunun ihlal testlerini koşarken iki ihlal de YEŞİL
geçti. Kapı bozuk değildi: `./node_modules/.bin/tsc -b 2>/dev/null` derleme hatasını
yutuyordu, `dist` güncellenmiyordu ve duman testi **eski kodu** koşuyordu. Yani ihlali
hiç uygulamamıştım ve "kapı yakalamadı" diye okuyordum.
Aynı turda ikinci bir sessiz başarısızlık: duman testine bağlam denetimlerini ekleyen
`python str.replace` hedefi bulamadı ve sessizce hiçbir şey yapmadı — ama aynı betikteki
ikinci replace (özet satırı) tuttu. Sonuç en kötü biçim: kapı `7 uç · bağlam` diye
**ilan ediyordu** ve bağlam ucuna hiç bakmıyordu. Korumadığı şeyi duyuran bir kapı,
hiç olmayandan kötüdür.
İki kural: (1) ihlal testinde derlemenin BAŞARILI olduğu doğrulanmadan sonuç okunmaz —
`if tsc -b; then koş; else "test geçersiz"; fi`; (2) her `str.replace` sonrası dizenin
gerçekten değiştiği `assert` edilir. İkisi de düzeltildikten sonra iki ihlal de kırmızıya
döndü.
**Ders:** "kapı yakalamadı" sonucunun iki açıklaması var ve ikincisi daha olası —
ihlal hiç uygulanmamıştır. Yeşil bir ihlal testi, kapıdan çok TESTİ şüpheli kılar.

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
V-17). Beşinci insan blokajı — hepsi `insan` sınıfında ve LOOP§G üçlü kuralına saymıyor
(D-157), ama DURUM.md ⛔ bloğunda adlarıyla ilan ediliyor.
**Ders:** bir bileşenin "dış bağımlılığı var" olması, hiçbir parçasının yapılamayacağı
anlamına gelmez. Sözleşmeyi bağlantıdan ayırmak, blokajın kapsamını daraltır.
