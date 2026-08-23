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

## D-314 · Yayın anı: hat ÖNERİR, insan SEÇER (2026-08-22)

**Bağlam.** FAZ-17.3 yayın zamanını istiyordu ve iki kolay yol vardı: (a) onaylanan
koşuyu hemen yayınlamak, (b) "salı 19:00 en iyi saat" gibi genel bir kural gömmek.
İkisi de yanlış. (a) Yasa 2'yi siler — *agent önerir, insan uygular*; onay "bu içerik
iyi" demektir, "şimdi yayınla" değil. (b) Kaynaksız bir sayısal iddiadır (Yasa 8) ve
"öneri" etiketi onu kaynaklı yapmaz.

**Karar.** Üç parça:

1. **Öneri ÖLÇÜMDEN gelir.** `yayinSaatiOner` yayın defterindeki (`published.ndjson`)
   ETKİLEŞİM ölçümlerini saat kovalarına ayırıp en yüksek ORTALAMAYI söylüyor —
   toplamı değil, yoksa "en çok yayın yaptığın saat" ile "en iyi saat" karışırdı.
   Gerekçe sayıyla konuşuyor: kaç ölçüm, hangi dilim, genel ortalamanın yüzde kaç üstü.
2. **Ölçüm yoksa hat SUSUYOR.** En az beş ölçülmüş yayın gerekiyor; altındaysa cevap
   `veri-yok` ve SEBEBİ yazılı. Bugün üretimde dönen dal budur — defter yayın ZAMANINI
   tutuyor, etkileşimi tutmuyor (analitik çekimi FAZ-7.9'da). Ölçüldü: `{"tur":
   "veri-yok","ornek":0,"sebep":"etkileşimi ölçülmüş yayın yok — saat öneremem"}`.
3. **Seçim İNSANIN ve `PUBLISH` onsuz koşmuyor.** Karar `derived/runs/<id>/
   yayin-ani.json` dosyasında: seçilen an, seçen (`human`), seçim zamanı ve o an
   ekranda duran ÖNERİ. Kayıt yoksa `PUBLISH_TIME_NOT_CHOSEN`, biçimsizse
   `PUBLISH_TIME_INVALID`.

**Neden çalıştırma parametresi değil.** Parametreler plana DONUYOR (R-07): koşu
başlarken hesaplanan özet onları kapsıyor ve devam ederken eklenen bir parametre özeti
değiştirir — kapı haklı olarak *"onayladığınız plan artık geçerli değil"* der. Yayın anı
koşu başlarken değil, ONAY anında seçiliyor. İki farklı zamana ait iki şey aynı kaba
konamaz. `HumanDecision.note` da uygun değildi: serbest metinden saat ayrıştırmak,
yayın zamanını insanın cümle kurma biçimine bağlamak olurdu.

**Ölçüm — iki dal da GERÇEK koşuda görüldü, on sekiz saniye arayla, aynı derlemeyle:**
karar dosyası yokken `yayinla` adımı `PUBLISH_TIME_NOT_CHOSEN` (16:28:38), karar
konduğunda muhafızdan geçip dürüst `CHANNEL_NOT_CONNECTED` (16:28:56) ile durdu.
Kontrol kanal kontrolünün ÖNÜNDE: kanallar bağlandığı gün sıranın tersi bu kapıyı
sessizce atlatırdı.

## D-315 · Sağlayıcı yokluğu, DEFTERDEKİ çıktıyı yok saymaz (2026-08-22)

**Bulgu — gerçek koşu, `run_01a02989`.** Panelden onaylanıp sürdürülen bir karoselde
dört `gorsel-uret` adımı da `NO_PROVIDER` ile düştü: `sops exec-env` olmadan koşan bir
sürdürmede Cloudflare *"yerel önkoşul sağlanmadı"* diyor. Adımlar `optional` olduğu
için hat DEVAM etti, `COMPOSE` görselsiz bir belge kurdu ve `RENDER` onu yeniden çizdi.
Sonuç: insanın **onayladığı** kesik özneler yerine dört yer tutucu. Dışa aktarma da
onları verdi — bir sürdürme, tamamlanmış bir işi bozdu ve kimse fark etmedi çünkü
`kalite` adımı kusuru sayıp geçti (`yer-tutucu`, 5 kusur).

**Kök sebep.** Yönlendirici, adımın çıktısının DEFTERDE durduğunu bilmiyordu. Oysa
`derived/runs/<run>/steps/<adim>.json` kaydı ve `derived/blobs`taki byte'lar oradaydı:
ölçüldü, `gorsel-uret` çıktısı 261 760 karakterlik base64 olarak sorunsuz çözülüyor.
**Çağrılacak bir şey yoktu ki sağlayıcı gereksin** — yönlendirici yalnız YENİ bir çağrı
için gerekli.

**Karar.** `runPipeline` metered adımda sağlayıcı seçemediğinde önce deftere bakıyor:
çıktı duruyorsa adım defterden oynatılıyor (`↺ … sağlayıcı yok ama çıktı DEFTERDE`),
yoksa eskisi gibi `NO_PROVIDER`. Sıra önemli — kontrol hatanın ÖNÜNDE, sonrasında
olsaydı adım çoktan `failed` yazılmış olurdu.

**Ölçüm.** Aynı anahtarsız sürdürme, düzeltmeden önce panorama belgesinde dört boş
`src`, sonra `gorsel-01.jpg · gorsel-02.jpg · gorsel-03.jpg` (dördüncü gerçekten hiç
üretilmemişti). Slayt yeniden çizildi ve kesik özne yerinde. Birim testi düzeltme geri
alındığında KIRMIZI dönüyor.

**Sınır.** Girdiler değiştiyse defterdeki çıktı bayattır ve bu dal onu yine de
kullanır. Alternatif, tamamlanmış bir işi SİLMEKTİ; bayat bir görsel, yok edilmiş bir
görselden iyidir ve iz satırı olan biteni ekranda söylüyor.

## D-316 · Elle düzenlenmiş sürüm GÖRÜNÜR: editör onu açar, kütüphane onu gösterir (2026-08-22)

**Bulgu — depo sahibi:** *"editörde düzenleyince elle düzenlenmiş versiyon koşu
sayfasına geliyor ama tekrar koşuyu editörde aç deyince eskisini açıyor; ayrıca
varlıklarda da hâlâ eskisi görünüyor, güncellenmiyor."*

**İki ayrı kusur, tek kök:** yazan taraf `panorama-elle.json` üretiyordu, okuyan taraf
onu hiç sormuyordu.

1. **Editör.** Koşu tarayıcısı her zaman `panorama.json` arıyordu. Düzenleme bellekte
   yaşıyor, `just dev` her yeniden başladığında kayboluyor gibi görünüyordu — oysa
   diskte duruyordu. Artık seçim kuralı TEK yerde (`kosuBelgesiniOku`): elle
   düzenlenmiş varsa O geçerlidir. *"Değişiklikleri sıfırla"* ise açıkça asıl belgeyi
   istiyor (`sadeceAsil`), yoksa düğme hiçbir şey yapmazdı.
2. **Kütüphane.** Liste DAMGALI byte'ları gösteriyor; elle düzenlenmiş slayt damga
   taşımıyor (Yasa 7: damga üretim anında basılır, retrofit imkânsız). Liste yanlış
   değildi — **eksikti**: insanın en son gördüğü hâl hiçbir yerde yoktu. Artık her
   koşu satırında ayrı bir şerit: *"✎ elle düzenlenmiş sürüm — damgasız, yayına aday
   değil"*. Damgalıların YERİNE geçmiyor; karıştırmak, damgasız bir varlığı
   yayınlanabilir sanmak olurdu (R-33).

**Seçim kuralı neden ortak modüle taşındı.** Sunucunun dışa aktarma yolu "önce `-elle`,
sonra asıl" kuralını kendi içinde taşıyordu, editör hiç taşımıyordu. Aynı kuralın iki
kopyası bu depoda bir kez daha (D-302, `gorselleriGom`) birinin düzeltilip ötekinin
unutulmasıyla sonuçlanmıştı. Üçüncü kopya yazılmadan tek yere alındı.

**Ölçüm.** Editörde başlık değiştirildi, kaydedildi, **editör süreci öldürülüp yeniden
başlatıldı** ve açılışta düzenlenmiş başlık geldi (`ELLE Kantar mı satış mı`); önce
asıl başlık geliyordu. Kütüphane ekranı gerçek tarayıcıda: 7 koşuda "elle düzenlendi"
rozeti, 28 elle slayt görseli, hepsi `/api/kosu/<run>/elle/<ad>` üzerinden.

## D-317 · Tip ölçeği markanın dizayn sistemine bağlanıyor — dört aile, dört rol (2026-08-22)

**Bağlam.** Depo sahibi markanın gerçek dizayn sistemini depoya koydu
(`examples/design-system-master/`, gitignore'lu — GitHub'a gitmesin diye) ve *"şablonları
bu dizayn sisteme uygun olarak güncelle"* dedi. Sistem tipografiyi tahminle değil
ÖLÇÜMLE seçmiş: dört ailenin WOFF2 ikilisi çözülüp `cmap` okunmuş, 15 Türkçe kod
noktasının hepsi doğrulanmış, `Ş`(U+015E) ile `Ș`(U+0218) aynı glife düşüyor mu diye
bakılmış ve `GSUB`ta `latn/TRK` dil sistemi aranmış. Inter bu sınavda *"Türkçe dil
sistemi yok"* diye elenmiş — bizim bugünkü gövde fontumuz.

**Karar.** `font_family_count` tavanı 3 → 4. Dört aile, dört AYRI rol:

| Aile | Rol | Asla |
|---|---|---|
| Plus Jakarta Sans | gövde, etiket, tüm arayüz | pazarlama display puntosu |
| Source Serif 4 | pazarlama sayfasının TEK H1'i — karoselde kapak başlığı | başka her yer |
| Montserrat | bölüm başlıkları ve alt başlıklar — karoselde gövde slaytları | gövde metni |
| JetBrains Mono | rakam, kimlik, künye, eyebrow | düzyazı |

**Neden gevşeme değil.** "Beyan edilmemiş aile" tavanı 0 olarak duruyor: hangi ailenin
meşru olduğu `fonts.ts`in kapalı listesinden geliyor. Sistemin kendi sınırlama kuralı da
devrede — Source Serif 4 ve Montserrat ürün kromunda YASAK, yalnız pazarlama
yüzeylerinde; karosel bir pazarlama yüzeyi. Beşinci aile hâlâ kırmızı.

**Bedeli.** Dört yüz ailesi gömülü olarak taşınıyor (latin + latin-ext, sekiz dosya,
toplam ~426 KB). Eski dört dosya (Inter, Archivo, Bricolage, Caveat) emekli oluyor;
`scripts/font-getir.mjs` listeyi geri koyan tek satırla onları da geri getirebilir.

## D-318 · Palet dizayn sisteminden: yakın-monokrom zemin, TEK karneli aksan (2026-08-22)

**Bulgu.** Kreatif yüzey kendi paletini taşıyordu: eskitmeli lacivert zemin (D-295),
bakır aksan, sıcak kâğıt. Markanın gerçek dizayn sistemi bunların üçünü de başka yere
koyuyor ve gerekçesi ölçülü:

- **Nötrler chroma 0.** Sistem, Dima'nın sıcak mürekkebini (hue 65) ve UpcyMan'in soğuk
  mavi-grisini (240) BİLEREK tersine çevirip gerçek nötre geçiyor. Zemin `#040404` —
  saf siyah değil: OLED halasyonu ve panel kenarında kaybolan hairline'lar yüzünden.
- **Aksan ASLA zemin değil.** Anti-desen listesinin ikinci maddesi: *"aksanı bir arka
  plan ya da büyük yüzey olarak kullanma"*. Bizim iki şablonumuzun zemini mavinin
  kendisiydi.
- **Aksanın iki adımı var.** `#0b5bf0` kâğıt üstünde (5.34:1), `#3477f9` koyu zeminde
  (5.03:1). Tek bir değer ikisini de karşılayamıyor — sistemin "split roles" tespiti.

**Karar.** Kreatif rolleri sistemin merdivenine bağlandı: kanvas `#040404`, kart
`#0e0e0e`, hairline `#262626`, koyu zemin metni `#eeeeee`, soluk `#989898`; kâğıt
`#fafafa`, mürekkep `#141414`, soluk `#696969`, hairline `#e4e4e4`.

**Üç şey emekli oldu:**

1. **Vurgu çipi.** Açık zeminde vurgulanan kelime DOLU bir kutuya alınıyordu; gerekçesi
   ölçülmüştü (eski amber aksan kâğıtta 1,9:1). Kâğıt için ayrı aksan adımı gelince o
   gerekçe kalktı — ve karoselin en çok bakılan yerindeki dolu kutu, "aksan asla yüzey
   değildir" kuralının tam ihlaliydi. Vurgu artık iki yüzeyde de RENK.
2. **Koyu zemin metninin kâğıt rengine bağlı olması.** "Açık olan neyse metin odur"
   varsayımıydı; sistem ikisini ayırıyor ve farkı gerekçeliyor.
3. **Alfa harmanlı soluk metin.** `color-mix(… 72%)` "aşağı yukarı soluk" demekti;
   sistem "şu kadar soluk, şu kadar kontrast" diyor ve değer ölçülmüş bir adım.

**Ölçüm.** Altı şablon yeniden çizildi ve bakıldı: mavi zeminler koyu kanvasa döndü,
aksan yalnız kapak vurgusunda ve süreklilik ögesinde kaldı, kâğıt zeminli iki şablon ilk
kez marka mavisini taşıyabiliyor. 44 kapı yeşil.

## D-319 · Süreklilik bir IŞIK HAVUZU değil, bir ÖLÇEK ÇİZGİSİ (2026-08-22)

**Bağlam.** Karoselin sürekliliğini üç mekanizma taşıyordu: panoramayı kat eden degrade,
kartların üstündeki gren + vinyet, ve `donen`de iki dev soluk daire (%7 beyaz, 760 px).
Markanın dizayn sistemi üçünü de yasaklıyor — anti-desen listesi *"degrade meshi, glow,
yörüngedeki parçacıklar"* ve *"yüzmeyen hiçbir şeye gölge"* diyor; ayrımı **yüzey adımı +
1 px hairline** ile kuruyor.

**Karar.** Yeni bant tipi: `olcek`. Panoramayı kat eden bir hairline, eşit aralıklı
tırtıklar ve **içerikten gelen** etiketli duraklar. Bir enstrüman skalası — sistemin
*"süslenmiş gösterge paneli değil, enstrüman paneli"* tarifinin karoseldeki karşılığı.

**Neden süs değil.** Duraklar uydurulmuyor: `donen`de dört ürünün konumu, bir veri
şablonunda kilometre taşları. Silinirse kaybolan şey bir dekor değil, dört ürünün aynı
hattın çıktısı olduğu bilgisi. Ölçüt: bir öge silindiğinde YALNIZ görsellik kaybolduysa
o öge süstür.

**CSS, SVG değil — ve bunu kapı söyledi.** İlk sürüm çizgiyi ve tırtıkları `<line>`
ögeleriyle çiziyordu; `kodlanmis-oge` kapısı R-81 gereği kırmızıya döndü. Doğrusu da bu:
bir cetvel çizilmiş bir şekil değil, TEKRAR EDEN bir ölçüdür ve tekrarın dili CSS'te
zaten var (`repeating-linear-gradient` + kenarlık). Kodlanmış öge sıfır.

**Kabul ölçütleri yeniden tanımlandı — gevşetme değil, DİL değişikliği.** Ölçüt 5 "zemin
en az iki katmanlı" derken degradeyi ve vinyeti kastediyordu. Amacı korunuyor (zemin düz
bir web arka planı olmasın) ama ölçtüğü mekanizmalar sistemin mekanizmaları: **yüzey
adımı** (kart zemini kanvastan farklı), alan sınırı, tam kaplama fotoğraf ya da kesimi
kat eden bant. Ölçüt 4'ün listesine bant eklendi: kartların üstünden geçen bir bant
katmanlanmanın kendisidir.

**Ölçüm.** `donen` yeniden çizildi ve bakıldı: iki soluk daire gitti, ölçek çizgisi
1080 px'lik slaytta okunuyor, duraklar dört ürünün altında. İlk denemede çizgi
GÖRÜNMÜYORDU — `vector-effect="non-scaling-stroke"` kalınlığı cihaz pikselinde okuyor ve
0.12 alt piksele düşüyordu; çizildi, bakıldı, düzeltildi.

## D-320 · Tanımsız token çağrısı bir KAPIYA bağlandı (2026-08-23)

**Bulgu, kendi açtığım yaradan.** D-318 amber rampasını emekli etti;
`packages/contracts/src/aile.ts` iki değişkeni çağırmaya devam etti:

    const AMBER_ACIK = 'var(--ramp-marka-amber-200)'   ← artık tanımsız

**CSS tanımsız bir `var()` için hata VERMEZ.** Bildirimi geçersiz sayıp ögeyi sessizce
şeffaf bırakır. Üç şablonun zemin ögesi kayboldu, hiçbir test kırmızı olmadı, hiçbir
kapı konuşmadı. Derleyici de göremez — çağrı bir DİZE içinde yaşıyor.

**Karar.** `token-cagrisi` kapısı: çağrılan her `--ramp-*` / `--role-*`, üretilmiş
`tokens.css` dosyalarının birleşiminde tanımlı olmak ZORUNDA. Yorum satırları
atlanıyor: emekli bir token'ın adını bir gerekçede anmak çağrı değil, kayıttır.

**Kapsam neden daraltıldı.** İlk sürüm her `var()`e baktı ve 39 "ihlal" buldu — çoğu
yanlış: bir belge kendi `:root{--ui:…}` değişkenini tanımlayıp kullanabilir. Kapının işi
token SÖZLEŞMESİNİ korumak; `--ramp-*` ve `--role-*` `tokens.css`ten gelmek zorunda
çünkü onları üreten tek yer `just tokens`. **Gürültülü bir kapı okunmaz olur ve okunmayan
bir kapı yoktur** — daraltma bir gevşeme değil, kapının çalışabilmesinin şartı.

**Bulduğu gerçek kusurlar:** `aile.ts` iki amber çağrısı · `sablon.ts` `ink-800`
(emekli; "koyu mu" kümesinde tanımsız olduğu için metin rengi yanlış tarafa düşebilirdi)
· `kabuk.css` dört yanlış rol adı (`--role-line`, `--role-ok`, `--role-danger`,
`--role-text-soft`).

**Ölçüm.** 52 tanımlı token · 325 dosyada çağrı denetlendi · 0 ihlal. Kasten
`--ramp-marka-yok-1` yazıldı → kırmızı döndü, geri alındı.

## D-321 · Araştırma tabanı: sayılar kaynağıyla duruyor (2026-08-23)

**Bağlam.** Depo sahibi şablonları dizayn sistemine oturtmamı istedi ve ben araştırma
yapmadan koda giriştim. Uyardı: *"webden araştırdın mı, seamless muazzam tasarımlar için
nasıl olmalı biliyor musun, gerçekten başarılı olanları gördün mü? Bunları halletmeden
işe geçtin."* Haklıydı — kodladığım her eşik tahmindi.

**Karar.** Üç bağımsız araştırma koşturuldu ve bulguları
`docs/referans/arastirma-2026-08.md`ye yazıldı. FAZ-18'in her sayısı oraya bakıyor:
**bir eşiği değiştiren, önce kaynağı çürütmek zorunda.**

**Üç bulgu, üçü de bizim kodumuzu yanlış çıkardı:**

1. **Gövde puntomuz okuma eşiğinin altında.** Kritik punto 0,2° açısal x-yüksekliği
   (Legge & Bigelow 2011); 1080 px tuvalde taban **36 px**, hedef 40–48. Ölçüldü: bugün
   **34 px**. Ve `govdeOrani` GÖRELİ olduğu için başlık küçüldükçe daha da iniyor.
   ⚠ Yaygın "gövde 24 px yeter" tavsiyesi eşiğin **%30 altında** ve hiçbir kaynağı yok.
2. **Instagram 3:4'ü (1080×1440) 29 May 2025'ten beri destekliyor** — depo sahibi
   haklıydı. Bizim 1080×1350'miz hâlâ geçerli ama artık tavan değil; ızgarada her yandan
   34 px kaybediyor. ⚠ Bedeli: 3:4 Meta reklamında kullanılamıyor.
3. **Graph API karoseli 10 ile sınırlıyor ve yalnız JPEG kabul ediyor.** Biz PNG
   üretiyoruz ve slayt sayısını hiç kontrol etmiyoruz — yayın anında patlayacak iki hata.

**Yöntem notu, kalıcı olarak kayda geçiyor.** 2025–26'da arama sonuçlarını dolduran AI
üretimi SEO siteleri birbirini kopyalıyor ve birincil kaynağa gitmiyor. Dolaşımdaki
safe-zone sayılarının ("üstte 135 px UI", "yanlar 60 / üst-alt 80") hiçbiri Meta'dan
gelmiyor ve çoğu **Reels rakamlarının akışa yanlış taşınması**. Bunlar kural olarak
KODLANMADI ve belgede "doğrulanmadı" diye işaretli. Kaynağı olmayan bir sayı, kaynağı
olmayan bir iddiadır (Yasa 8) — ve bu, kendi kodumuz için de geçerli.

## D-322 · `KURALLAR.md` tavanı 400 → 480: tavan artık BİLGİYİ sınırlıyor (2026-08-23)

**Bulgu.** FAZ-18'de altı kural eklendi (R-83…R-88) ve her biri tavanı deldi. Her
seferinde bir ESKİ kuralın gerekçesini kısaltarak geçtim — dört turda dokuz kural
kısaldı. Yani kapı yeni kuralı değil, **eski kuralların gerekçesini** kesiyordu.

**Tavanın amacı okunabilirlik.** R-63'ün kendi cümlesi: *"boş bir bölüm uzun bir
bölümden pahalıdır — kuralı bulamayan kuralı yok sanmaz, kendi uydurur"*. Gerekçesi
budanmış bir kural tam olarak bu tuzağa düşüyor: kural orada duruyor ama NEDEN orada
olduğu artık yazmıyor ve altı ay sonra biri onu "gereksiz" diye kaldırıyor.

**Karar.** `KURALLAR.md` tavanı **480**. Sayı keyfî değil: bugün 60 kural × ortalama
6,5 satır ≈ 390, artı başlık ve bölüm ayraçları. 480, on kurallık bir büyüme payı
bırakıyor ve o dolduğunda tekrar bir karar gerektiriyor — tavan kalkmıyor, bir kez
yükseliyor.

**Neden R-76 ihlali değil.** *"Kırmızı bir kapının kuralı aynı turda gevşetilemez"* —
bu kapı bir KUSURU yakalamıyordu; belge büyüdü çünkü içine ölçülmüş bilgi girdi.
Ve yükseltme kırmızı turda değil, ayrı bir turda ve kendi kararıyla yapılıyor.

**Sınır neden kalkmıyor.** Kural kitabı sonsuz büyüyemez: 88 kuralın hepsini okuyan
kimse yok, `just tur` yalnız atıf verileni getiriyor. Ama bir kuralın GEREKÇESİ o kuralın
parçası — zorlaması olmayan kural yazılmadığı gibi, gerekçesi olmayan kural da
savunulamaz.

## D-323 · Kadraj kartın kutusu değil, EKRANIN kutusu — sahne kaymaz

**Bulgu.** Görsel payını ölçmek için yazılan geçici bir alet, ölçmeye çalıştığı şeyi
değil bambaşka bir kusuru gösterdi: `sahne` `memphis` ve `donen` şablonlarında sahne
gövdenin (0,0)'ında **başlamıyordu** — `top: 21`. Sebep, görsel işlemlerinin
`<svg class="filtre-tanim" width="0" height="0">` tanımlarının gövdede INLINE durması.
Sıfır boyutlu bir inline öge bile satır kutusu doğuruyor ve o kutunun strut yüksekliği
21 px. Yani **görsel işlemi olan her belge 21 px aşağı kaymış** üretiliyordu: üstte gövde
zemininden bir şerit, altta kartın son 21 px'i — imza rayının durduğu yer — kadrajın
dışında.

**Neden hiçbir kapı görmedi.** Bu depodaki bütün panorama ölçümleri ögeleri KARTA göre
okuyor: taşma kart kutusunda, güvenli alan kart kenarından, metin payı kart alanına
bölünerek. Kart kendi içinde kusursuzdu; yanlış olan onun YERİYDİ. Ölçüm aletinin
kendisinin bozuk çıktığı dördüncü vaka (D-31x ailesi) ve en sessizi: alet doğru çalışıyor,
yalnız yanlış şeye bağlı.

**Karar.** Kadrajın tanımı düzeltiliyor: kadraj `.kart`ın kutusu değil, EKRANIN kutusudur.
`sahne-kaymis` kusuru sahneyi mutlak koordinatta ölçüyor — tolerans yok, çünkü bir piksel
kayma ekran görüntüsünün her slaytta aynı yerden kesilmediği demektir. Kural R-93.

**Düzeltme tanımı ÜRETEN modülde.** `FILTRE_TANIM_CSS` `gorsel-islem.ts`te tek sabit;
`panorama.ts` ve `static.ts` ikisi de onu basıyor. İki render yolu aynı işaretlemeyi
üretiyor ve stili birinde unutmak, kaymayı yalnız orada geri getirirdi (§3.8 darboğaz).

**Kanıt.** Kural iptal edilip koşuldu: kusur tam olarak görsel işlemi olan ÜÇ şablonda
kırmızı, diğer üçünde sessiz. Ölçüm, kaymanın kendisini de doğrudan okuyor.

## D-324 · Dikiş bandı ve krom okunurluğu — iki ölçü, ikisi de gözle bulundu

**Dikiş bandı (R-94).** Kesik öznelerin küçük kaldığını çıktıya BAKINCA gördüm ve bir
"görsel payı ≥%X" eşiği uyduracaktım. Araştırma o kuralı zaten türetmişti ve ölçüsü
alan değil **genişlikti** (`arastirma-2026-08` böl. 1.3): bir kimlik ögesi kesime ya ≥93 px
uzaktır ya da kesimin iki yakasında da slayt genişliğinin ≥%40'ını kaplar. 93, tek
fiksasyonun net bölgesinin yarısı; %40, gözün ikinci slaytta aynı kütleyi bulması.

**Bulgular sayıyla.** `sahne`nin "1↔2 kesimi" diye ADLANDIRILMIŞ öznesi kesimin 0,4 px
solunda bitiyordu — adı doğru, geometrisi yanlış. `memphis` üç kesimini de aşıyor ama
%16–28'le eziyordu. `donen` ve `editoryal`de görselin kenarı kesime TAM oturuyordu.
`kesintisizlik-yok` hepsinde sessizdi çünkü kesimleri başka bir taşıyıcı — ince bir
çizgi — geçiyordu: **kesimde bir şeyin bulunması, doğru şeyin bulunması demek değil.**

**Ölçü boyadan, kutudan değil.** `object-fit: contain` kutuyu doldurmuyor; kutunun kenarı
kesime değse bile boya içeride kalabiliyor. Tasarımın niyeti kutu, gözün gördüğü boya.

**Krom okunurluğu (R-95).** `sahne`nin öznesi kahraman ölçüye çıkınca ayakkabısı ray
bandına girdi ve `01 / 04` okunmaz oldu. Ray zaten bir perde taşıyor — mekanizma vardı,
**parametresi yanlıştı**: perde o yükseklikte %82'ye düşüyor, metin `--kart-metin` %48.

**İlk ölçüm kusuru göremedi ve göz görmüştü.** İfşa şeridinin medyan ölçüsü ödünç
alınmıştı; ifşa şeridi geniş, `ray-sayac` ise 84 px. Ayakkabı kutunun yarısını kaplasa
bile medyan koyu kalıyor. Medyan sağlam bir istatistik olduğu için burada YANLIŞ
istatistik. Doğru ölçü iki render farkı: metin gizleniyor, zeminin metin lumasına
44'ten yakın piksel PAYI sayılıyor. Eşik %4 ÖLÇÜLEREK seçildi — altı şablonun 90 krom
kutusunda temiz olanların hepsi tam %0, kirli tek kutu %10.

**Kural hiçbir tasarım aracını yasaklamıyor.** Tam kadraj fotoğrafın üstünde künye satırı
meşru; meşru olmayan, perdesiz olması.

## D-325 · `KURALLAR.md` yapısal olarak doldu — sonraki kural bir yükseltme değil

**Durum.** D-322 tavanı 400'den 480'e çıkarırken *"tavan kalkmıyor, bir kez yükseliyor"*
dedi ve on kurallık bir pay bıraktı. R-93 · R-94 · R-95 ile o pay **doldu**: 67 kural,
480 satır, kural başına 7,6 satır. Üç kuralın hepsi ancak eski kuralların gerekçesi
budanarak sığdı — ve D-322'nin kendi gerekçesi tam olarak bunun yapılmaması gerektiğini
söylüyor.

**Karar: bir sonraki kural tavanı yükseltmez.** Gerekçeler ayrı bir dosyaya alınır —
`KURALLAR.md` beyan + zorlama + tek cümlelik neden tutar, ölçülmüş kanıt ve ⚠ notları
`docs/kurallar/OLCUMLER.md`'ye taşınır, `R-nn` başlıkları yerinde kalır (`citations`
kapısı kırılmaz). Bu, `KARARLAR.md`'nin arşiv desenidir; orada işe yaradı.

**Neden şimdi yapılmadı.** Bir turda bir adım: bu tur iki ölçü aleti kuruldu ve altı
şablonun geometrisi düzeltiliyor. Bölmeyi aynı turda yapmak, `citations` ve `just tur`
yollarını sınamadan değiştirmek olurdu. Borç burada, adı konmuş hâlde duruyor.
