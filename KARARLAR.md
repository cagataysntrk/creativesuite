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

## D-228 — Matris hat dosyasında yazıyordu, çözücü onu DÜŞÜRÜYORDU

**2026-08-16 · FAZ-8 doğrulama, M1**

`registry/pipelines/ad-creative-set.pipeline.yaml` altı satırlık bir `matris:` bloğu
taşıyor, `matris` kapısı onu okuyup doğruluyor, `matris.ts` 1291 testin bir kısmıyla
kapalı — ve **`parsePipeline` bloğu tamamen düşürüyordu.** `Pipeline` arayüzünde
`matris` alanı yoktu; `just plan ad-creative-set` yedi varyantı tek varyant gibi
fiyatlıyordu. Kapının kendi ihlal mesajı *"maliyet tahmini bu sayıyı çarpan alıyor"*
diyordu ve bu **bir iddiaydı, bir olgu değil**.

**Altıncı tekrar** (D-216 · D-222 · D-224 · 8.3 · D-227 · bu). Yeni olan halka:
**dosyada duran veri, çözücüde yoksa üretimde yoktur.** Kapı YAML'ı okur; üretim
`parsePipeline`ın döndürdüğü nesneyi okur. İkisi aynı dosyaya bakıp farklı şey görür.

**Kapatılanlar:**
- `Pipeline.matris` — çözücü `mod` + `eksenler`i **şekil olarak** okuyor. Tasarım
  yargısı (diklik) engine'de kalıyor: registry engine'i import edemez (§3.6) ve ayrım
  keyfi değil — registry "dosyada ne yazıyor", engine "bu tasarım bilgi üretir mi".
- `plan()` matrisi denetliyor ve **bozuksa plan ÜRETMİYOR**: tek düzeyli bir eksen
  para harcar, ölçüm vermez. Kapı bunu commit anında, plan çalıştırma anında söylüyor.
- Ücretli adımlar varyant başına, ücretsizler bir kez: `SELECT` bağlamı bir kez kurar,
  yedi varyant paylaşır; ama her varyantın kendi modeli, kendi render'ı var.
- `varyantSayisi` **donmuş plana ve özete** giriyor. Maliyet üzerinden dolaylı korunuyor
  sanmak yanlış olurdu: fiyatlanamayan bir planda her adım $0 ve 7 varyantlık onayla 27
  varyant koşmak özeti hiç değiştirmezdi.
- `matris-uretim-yolu.test.ts` **gerçek hat dosyasını** okuyup çarpanı ölçüyor.

**Kalan gerçek boşluk — `8.1b` olarak açıldı:** plan yedi varyant fiyatlıyor ama
`runPipeline` hâlâ tek varyant koşuyor. Tahmin artık dürüst, üretim henüz değil.
Sırayı tersine çevirmek (önce üretim, sonra tahmin) daha kötü olurdu: yedi varyant
üretip birini fiyatlandırmak, kullanıcıyı ödeyeceğinin yedide birine onaylatır.

**Geri alma maliyeti:** yok.

## D-229 — Politika kararı hat ADINDAN okunuyordu: beyan mekanizması

**2026-08-16 · FAZ-8 doğrulama, M3 + M5**

`scripts/uret.mjs` reklam metni linter'ını tek bir satırla açıyordu:
`const REKLAM_HATTI = id === 'ad-creative-set'`. **Tek sabit dize, ne testi ne kapısı.**
Hattı yeniden adlandırmak — ya da ikinci bir reklam hattı eklemek — Meta'nın kişisel
özellik kuralını sessizce kapatırdı ve hiçbir şey kırmızıya dönmezdi. Yasak, yasağın
yokluğuna dönüşürdü ve kimse fark etmezdi.

**Karar: politika hat dosyasının kendi beyanıdır.** `cikti_sinifi: reklam` →
`Pipeline.ciktiSinifi`. Varsayılan `organik`: reklam kuralları ancak AÇIKÇA beyan
edilince koşar. Ters varsayılan (her şey reklam) linter'ı gürültüye çevirirdi ve
**gürültülü şey kapatılır**.

`hat-kimligi` kapısı mekanizmayı atlanamaz kılıyor — iki soru birden:
1. Hat id'si ile karşılaştırma yapan satır var mı (üretim yollarında)
2. Beyan GERÇEKTEN kullanılıyor mu — en az bir hat `cikti_sinifi: reklam` diyor ve
   `uret.mjs` `ciktiSinifi` okuyor mu

⚠ **Kapı ilk çalıştırmada yanlış pozitif verdi** ve bu düzeltildi: `bodies.ts`teki
`zincirAdi === 'prospect-deck'` satırını suçladı — oysa orası **doğru** mekanizma
(`chain:` hat dosyasında beyan edilen bir kısıt; değerin hat adıyla aynı olması
tesadüf). Kapı beyan yolunu cezalandırsaydı, teşvik etmesi gereken şeyi yasaklardı.
Karşılaştırmanın diğer ucu artık `id`/`.id` olmak zorunda.

**M5 — batarya 15'ten 19 ihlale çıktı:** `matris` · `hat-kimligi` · `secret-rotasyon` ·
`doctor-salt-okur`. R-71 "her BLOCKING kapı kasten ihlal edilir" diyor ve bir kapının
batarya dışında kalması, korumadığı şeyi korunuyor sanmaktır.

⚠ **Bataryanın kendi yükü de kaynaktır.** İlk sürümde `hat-kimligi` ve
`secret-rotasyon` bataryanın KENDİ satırlarını suçladı: ihlal metni de bir `.mjs`
dosyasında duruyor ve kapılar onu okuyor. Yük artık parçalanarak yazılıyor
(`${'ad-creative'}-set`) — kapı yazılan dosyayı görmeli, yazan dosyayı değil.
`repo-hygiene` yükünde aynı numara zaten vardı; genel kural olmamıştı.

**Geri alma maliyeti:** yok.

## D-230 — ANAYASA tavanı belgeyi TAMAMLANAMAZ yapıyordu: ölçüt değişti

**2026-08-16 · FAZ-8 kapanışı**

`docs/ANAYASA.md` tam **1200/1200** ve **sekiz alt bölüm boştu**: §3.4 · §3.6 · §3.9 ·
§3.10 · §5.5 · §7.3 · §8.1 · §12.8. Yedisi **kapanmış** fazlara ait — yani D-159'un
"sırası gelen adım kendi bölümünü doldurur" mekanizması çalışmadı: bir fazı kapatmak,
o fazın ANAYASA bölümünü doldurmayı hiç gerektirmedi.

**Ölçtüm, sonra karar verdim** (R-76). Belgede yağ yok: bölümler konularıyla orantılı
ve 150 satır kırpmak gerçek içerik silmek olurdu. Yani tavan, sekiz bölümü doldurmanın
önündeki tek engeldi.

**Karar: ölçüt değişiyor, tavan gevşemiyor.** R-63'ün ANAYASA satırı 1200 → **1400**,
ama tek başına değil: **alt bölüm (`### §N.M`) başına 60 satır** tavanı eklendi ve
`docs-size` onu da zorluyor.

⚠ **Ölçü birimi ikinci ölçümde düzeldi.** Önce "bölüm (`## §N`) başına 180" yazmıştım;
iki kusuru vardı: (1) sekiz bölüm dolunca §3 ≈193 satıra çıkıyor ve kural **kendi
doldurma işini** kırmızıya döndürüyordu, (2) daha önemlisi **yanlış birimi ölçüyordu** —
atıflar `§3` değil `§3.4` biçiminde veriliyor ve `just tur` alt bölümü getiriyor.

⚠ **Ölçüm aracı da yanlış ölçebilir.** İlk awk yalnız `###` sınırına bakıyordu ve son
alt bölümü dosya sonuna kadar sayıyordu: §12.9 28 satır yerine **215** görünüyordu. Bir
tavan, tavanı ölçen araç kadar doğrudur. Sınır artık `###` **veya** `##`.

**Neden bu daha SIKI:** okuyucunun maliyeti belgenin değil, **atıf verilen bölümün**
boyu. 1400 satırlık bir belgede 60 satırlık on bölüm, 1200 satırlık bir belgede 300
satırlık tek bölümden ucuz okunur. Ve **boş bir bölüm uzun bir bölümden pahalıdır**:
§12.8'e bakan biri erişilebilirlik kuralını bulamayınca kuralı yok sanmaz — **kendi
uydurur**. Eksik belge, yanlış belgenin yavaş hâlidir.

**Alternatif — reddedildi:** sekiz bölümü "bilinçli olarak boş" tombstone'larıyla
kapatmak. Yedisi kapanmış fazlara ait ve içerikleri **var** — kodda, kararlarda, faz
dosyalarında. Boş bırakmak bilgiyi yok etmiyor, yalnız **bulunamaz** kılıyor; ve
ANAYASA'nın tek işi bulunabilir kılmak.

**Sıra önemli:** önce doldur, sonra `citations`ı sık (D-231). Kırmızı bir kapıyla
başlamak her commit'i bloke ederdi.

**Geri alma maliyeti:** yok — tavan bir sayı.

## D-231 — `citations` yalnız İLERİ bakıyordu: tikli adımın atfı da denetleniyor

**2026-08-16 · FAZ-8 kapanışı, ANAYASA borcu**

`citations` bugüne kadar **yalnız `siradaki_adim`ın** `📖` satırındaki atıfları
denetliyordu: sıradaki adım gövdesiz bir bölümü okumak zorundaysa hata. Doğru ama eksik.

**Bir faz kapandığında o bölüm bir daha hiç kontrol edilmiyordu.** §12.8 FAZ-4.1'e ait
ve FAZ 4 kapandı; §8.1 FAZ-3.4'e ait ve FAZ 3 kapandı. İkisi de boş kaldı ve kapı yalnız
"8 iskelet bölüm" diye **uyarıyordu** — o uyarı dokuz turdur okunup geçildi. **Gürültülü
şey kapatılır; uyarı da bir kapatma biçimidir.**

**Karar: tiklemek bir iddiadır.** `faz-yollari` bunu `📁` için zaten söylüyor ("tikli bir
adımın yol satırı plan değil, iddiadır"); aynısı `📖` için de geçerli. Bir adımı
tiklemek, okuduğu bölümün VAR olduğunu iddia etmektir. Kaynaksız yapılmış bir adım,
yapılmamış bir adımdan kötüdür: yapıldığı sanılır ve kimse geri dönmez.

**Sıra zorunluydu** (R-76): önce sekiz bölüm dolduruldu (D-230), sonra kapı sıkıldı.
Ters sırada yedi kapanmış faz yüzünden kapı kırmızıya döner ve **her commit bloke
olurdu** — ve o durumda tek makul çıkış kuralı gevşetmek olurdu.

⚠ **İhlal testi kapının SINIRINI da ölçtü.** Önce §12.8'i boşalttım ve kapı kırmızıya
dönmedi: **hiçbir adımın `📖` satırı §12.8'e atıf vermiyor.** Yani mekanizma çalıştı,
kapsamı dışındaydı. §8.1 ile tekrarladım (FAZ-3.4 tikli ve ona atıf veriyor) ve kapı
kırmızıya döndü. Kalan boşluk **bilinçli ve beyanlı**: hiç atıf almayan bir bölüm yalnız
"iskelet" uyarısıyla korunuyor. Bunu kapatmanın yolu kapıyı büyütmek değil, o bölümü
okuyan adımı `📖` satırına yazmaktır — kapı bir eksikliği bildirir, planı yazmaz.

**Kalıcı ders:** *bir denetim yalnız ileri bakıyorsa, geçmiş sessizce birikir.* D-159
"sırası gelen adım doldurur" diyordu ve bu doğruydu — ama sıra geçtikten sonra kimse
bakmıyordu. Kapanış, denetimin BİTTİĞİ an değil, denetimin **kalıcılaştığı** an olmalı.

**Geri alma maliyeti:** yok.

## D-232 — `aiGenerated: false` SABİTTİ; Md. 50 ifşası sessizce kapalıydı

**2026-08-16 · FAZ-8 doğrulama 2. tur, BLOKER**

`scripts/uret.mjs` uyum iddiasını `aiGenerated: false` sabitiyle kuruyordu ve yanındaki
yorum *"bu hatta görsel model çağrısı YOK"* diyordu. **FAZ 8'de eklenen
`ad-creative-set` hattı `capability: image.generate` taşıyor** — yorum yanlış oldu,
hiçbir şey kırmızıya dönmedi.

**Zincir sonuna kadar:** `aiGenerated: false` → `disclosureRequired` daima `false` →
IPTC'ye `Upcytech:AiGenerated=false` basılıyor (**yanlış beyan**) → `publish.ts`
`if (!a.compliance.disclosureRequired) continue` → **EU AI Act Md. 50 ifşa kapısı model
üretimi bir görselde atlanıyor.** Bir sabit, üç katman aşağıda yasal bir kapıyı
kapatıyordu. Taranan prompt da yanlıştı: CLI konusu, modele giden prompt değil.

**D-227'nin birebir tekrarı ve bu yüzden ayrı bir karar:** aldatan şey kod değil, kodun
yanındaki iddiaydı. Fark şu — D-227'de yorumu ben yeni yazmıştım; burada yorum **yazıldığı
gün doğruydu** ve altı hafta sonra bir hat eklenince yanlış oldu. **Doğru bir yorum
eskiyebilir; bir ölçüm eskiyemez, kırmızıya döner.**

**Kapatılanlar:** `uyumKapsami(pipeline)` kararı hattan okuyor · `taranacakPrompt` konu
ve adım prompt'larını birlikte tarıyor (fail-safe yön) · `uyum-kapsami.test.ts` gerçek
hat dosyalarına karşı ölçüyor ve görsel üreten hatları **tarayarak** buluyor (sabit liste
olsaydı listeye eklemeyi unutmak sessiz olurdu) · `compliance` kapısı `aiGenerated`
literalini **yazılamaz** kılıyor.

**Kapsam kararı:** `audio.tts` görsel sayılmıyor. Ses ayrı bir varlık ve ayrı bir ifşa
yüzeyi ister; ikisini tek bayrağa bağlamak birini diğerinin arkasına saklardı.

**Geri alma maliyeti:** yok.

## D-233 — `readonly: true` gerçekten salt-okur değildi; `just doctor` çöküyordu

**2026-08-16 · FAZ-8 doğrulama 2. tur, MAJOR**

`openDb`, `readonly` geçilse bile dizini yaratıyor (`mkdirSync`) ve `journal_mode` +
`synchronous` pragmalarını yazıyordu — ikisi de yazma. Üstelik `scripts/doktor.mjs`
`readonly`yi hiç geçmiyordu. Ölçüm:

```
$ chmod a-w derived/index derived/index/suite.db && just doctor
SqliteError: attempt to write a readonly database (SQLITE_READONLY_DIRECTORY)
```

**12. yasanın tam hedefi olan senaryoda** — bir ay ihmalden sonra, salt-okur bir
kurtarma diskinde — "hiçbir şeyi değiştirmeyen" rapor aracı **çalışmıyordu**.
`doctor-salt-okur` kapısı çağrıları denetliyordu; çağrının ALTINDAKİ yazmayı görmüyordu.
**Bir kapı, koruduğu ilkeyi bir katman aşağıda kaybedebilir.**

**Kapatılanlar:** `openDb` salt-okur modda `mkdirSync` ve yazan pragmaları atlıyor ·
`doktor.mjs` `readonly: true` geçiyor · `doctor-salt-okur` kapısı artık
`scripts/doctor.sh`ı da denetliyor (**giriş betiği listede yoktu**) ve `.sh` için kabuk
yazma biçimlerini (yönlendirme, `tee`, `touch`, `cp`, `mv`) arıyor — `echo x > dosya`
eklemek kapıyı yeşil bırakıyordu. Üçü de kasten ihlal edilip kırmızıya döndürüldü.

**Ölçüldü:** tüm indeks salt-okur → `just doctor` rc=0.

**Geri alma maliyeti:** yok.

## D-234 — MCP girdi şeması bir belgeydi, kapı değildi

**2026-08-16 · FAZ-8 doğrulama 2. tur, MAJOR**

`ARACLAR`ın `girdi` şeması `required`, `minLength`, `maximum`,
`additionalProperties: false` yazıyordu ve **hiçbiri zorlanmıyordu**:

```
POST /mcp/cagir/corpus_search -d '{}'                     → {"sonuclar":[]} HTTP 200
POST /mcp/cagir/corpus_search -d '{"query":"x","limit":100000}' → HTTP 200
```

Sorgusuz bir çağrı "sonuç yok" cevabı alıyordu — yani **arama hiç koşmadan boş liste**.
Bu, `araclar.ts`in birkaç satır yukarısında bizzat yasakladığı şeydi (D-175: "boş liste
dönmek corpus'un boş olduğunu söylerdi"). **Modül kendi ilkesini kendi yüzeyinde
çiğniyordu.**

**Karar: doğrulayıcı elde yazıldı, bağımlılık eklenmedi.** Desteklenen alt küme
`registry/PROFILE.md` ile aynı ruhta dar: `required` · `type` · `minLength` · `minimum` ·
`maximum` · `pattern` · `additionalProperties`. Genel bir JSON Schema doğrulayıcı 40
satırdan pahalıydı ve profil zaten bu alt kümeyi zorunlu kılıyor.

**İlk eşleşmeyen alanda dönüyor:** alan listesi kusmak, çağıranın ilkini düzeltip
ikinciye takılmasından daha yardımcı değil.

**Geri alma maliyeti:** yok.

## D-235 — Röportaj: dikey, marka mimarisi ve kanıt durumu kurucudan alındı

**2026-08-16 · FAZ-2.9 ikinci yarı (D-5)**

İlk yedi strateji kaydı kamuya açık kaynaklardan **çıkarımla** yazılmıştı
(`source.kind: inference`, confidence 0.5–0.6) ve iki yerde yanlıştı: ürünler hiç
geçmiyordu, dikey/bölge tahmindi. Kurucu röportajı dördünü de kapattı.

**1 · Dikey: imalat — ama ayrım ekseni SEKTÖR DEĞİL, VERİ OLGUNLUĞU.**
Bu röportajın en değerli çıktısı ve dışarıdan asla çıkarılamayacak olan şey:
*"Dima ERP üstüne kurulduğunda gittiğimiz firmada veritabanı yoksa UpcyMan'i
genelleştirip kuruyoruz ya da açık kaynak kuruyoruz."*

Bu bir uygulama ayrıntısı değil, **konumun kendisi**: bu alandaki araçların hepsi
verinin var olduğunu varsayar. Power BI bir veri kaynağı ister; GenBI bir veritabanı
ister. Veri yoksa iş orada biter. Upcytech'te bitmiyor. ICP artık üç kovaya ayrılıyor
(verisi yok · verisi var ama karara çevrilmiyor · sürdürülebilirlik zorunluluğu) ve
birincisi rakiplerin **çalışamadığı** yer.

⚠ **Coğrafya iddiası tamamen düştü.** "Marmara ve Ege" uydurmaydı; yerine bir şey
yazılmadı. Ölçek bandı da (çalışan/ciro) boş bırakıldı — kurucudan alınmadı.
**Uydurulmuş bir alan, boş bir alandan kötüdür:** boş alan sorulur, uydurma alan
doğru sanılır.

**2 · Marka mimarisi: onaylı marka — "Dima by Upcytech".** V-06'nın açık kalan yarısı.
Veri modeli değişmiyor (`brand_id` zaten ayrı eksen, D-84); değişen şey sunum ve token
kalıtımı: ürün kendi adıyla yaşar, çatı kredisini taşır.

**3 · Giriş teklifi bugün İKİ ürün, yarın Dima.** `upcyman.com` + `upcycarbon.com`
üzerinden demo ile giriliyor; Dima'nın ilk sürümü tamamlanınca giriş ürünü Dima olacak.
Teklif kaydı bunu **tarihli bir geçiş** olarak yazıyor — "yakında" demiyor.

**4 · Yayınlanabilir kanıt YOK ve bu kayda geçti.** Müşteri sonucu, sayı, referans —
hiçbiri yok. Yedi kaydın hiçbirinde tek bir sayısal iddia bulunmuyor. UpcyMan
`transfer_confidence: analogous` ile **yetenek kanıtı** olarak duruyor, müşteri sonucu
olarak değil (§4.6). Rakip kaydı bu zayıflığı **açıkça yazıyor** — kapatılana kadar
öyle anlatılacak, uydurulmayacak.

**Eski beş taslak silinmedi.** Hiçbiri onaylanmadı, yani hiçbir zaman doğru olmadılar;
ama silme kararı insanın (R-14, `corpus-silici` darboğazı). Retrieval'a görünmüyorlar
(`status: draft`). ⚠ Toplu onay (`just onayla corpus/*/*.md`) ikisini birden aktif
yapar ve **§5.5 anlamında bir çelişki** doğurur — onay yolları tek tek verildi.

**Geri alma maliyeti:** yok — hepsi draft, hiçbiri onaylanmadı.

## D-236 — Kasadaki anahtar adı kodun okuduğuyla eşleşmiyordu

**2026-08-16 · ilk gerçek anahtar kurulumu**

Kullanıcı Cloudflare token'ını koymaya hazırlandığında ölçtüm: `secrets.enc.yaml`
**`CLOUDFLARE_API_TOKEN`** taşıyordu, kod **`CF_API_TOKEN`** okuyor. `CF_ACCOUNT_ID`
ise kasada hiç yoktu. Token mevcut satıra yazılsaydı `sops exec-env` onu ortama
koyardı, hiçbir kod o adı okumazdı, adaptör `MISSING_CREDENTIALS` derdi ve kullanıcı
"anahtarı koydum ama çalışmıyor" ile baş başa kalırdı.
**Yapılandırılmış SANILAN bir sır, yapılandırılmamış sırdan kötüdür.**

**İki doğrulama turu da bunu bulamadı** çünkü `secret-rotasyon` **kod ↔ RUNBOOK**
eksenine bakıyor. Üçgenin üçüncü kenarı — **kasa ↔ kod** — hiç denetlenmiyordu.
İki kenarı denetlemek üçüncüsünün doğru olduğunu göstermez.

**`secret-adlari` kapısı** o kenarı kapatıyor: kasada olup hiçbir kodun okumadığı ad
hatadır. Kasa AÇILMAZ — adlar sops'ta düz metindir (`.sops.yaml`: yalnız değerler
şifrelenir), yani kapı age anahtarı istemez ve CI'da da koşar.

**Kapı benim elle bulduğumdan dört tane daha buldu** ve biri gerçek bir yalanı ortaya
çıkardı: `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` repoda **hiçbir yerde geçmiyor**,
oysa `FAZ-3.12` başlığı *"Varlık CAS **ve R2 senkronu**"* diyip `[x]` tikliydi. R2
kodu hiç yazılmamıştı; ✅ kriteri yalnız CAS'ı ölçtüğü için tik teknik olarak
geçerliydi ama **başlık ölçülenden fazlasını iddia ediyordu**. Başlık daraltıldı ve
R2 yarısı `3.12b` olarak açıldı. İki ölü anahtar, yapılmamış işin tek iziydi.

**Beyanlı muafiyet, sessiz muafiyetten iyidir:** `BEKLEYEN` listesi her parked anahtarı
gerekçesi ve hedefiyle taşıyor (`GROQ_API_KEY` → V-22 · R2 ikilisi → 3.12b ·
`ANTHROPIC_API_KEY` → D-8 gereği kaldırılabilir, karar kullanıcının).

**Geri alma maliyeti:** yok.

## D-237 — Sağlayıcı ortamı iki çağıranda iki farklı şekilde kuruluyordu

**2026-08-16 · ilk gerçek görsel üretimi**

Cloudflare anahtarları kasaya girdikten ve **gerçek çağrı ölçüldükten** sonra
(HTTP 200, 1024×1024 JPEG, metinsiz) `just plan ad-creative-set` hâlâ şunu diyordu:
`elendi cloudflare-workers-ai: yerel önkoşul sağlanmadı`.

Sebep: `candidatesFor(capability, env)` kullanılabilirliği `env` içindeki anahtarlara
bakarak belirliyor ve iki çağıran farklı davranıyordu — `plan.mjs` **yalnız `PATH`**
geçiriyordu, `uret.mjs` ise üç adı **elle sayıyordu**. Yani plan, anahtar kasada olsa
bile her sağlayıcıyı eliyordu; üretim ise dördüncü sağlayıcı eklendiği gün sessizce
unutacaktı.

**Karar: hangi anahtarın gerektiği VERİDİR.** Tanımlayıcılar zaten `auth_env:` beyan
ediyor; `saglayiciOrtami()` ortamı o beyandan türetiyor ve iki çağıran da onu
kullanıyor. Elle sayılan her liste bir gün ayrışır — bu, D-229'un (politika hat adından
okunuyordu) sağlayıcı tarafındaki kardeşi.

**Yalnız `enabled` sağlayıcıların anahtarı geçiliyor:** kapalı bir sağlayıcının sırrını
alt süreçlere yaymak, en az yetki ilkesinin sessiz ihlali olurdu.

**`ek` parametresi açık bir kaçış değil, görünür bir istisna:** tanımlayıcı tek bir
`auth_env` beyan edebiliyor ama Cloudflare iki değişken istiyor (`CF_ACCOUNT_ID` bir
sır değil, hesap kimliği). Sessiz bir varsayım yerine parametreye yazıldı.

**Ölçüldü:** `SEÇİLEN: cloudflare-workers-ai · güven green` — üretim yolu ilk kez
gerçek bir görsel sağlayıcı çözdü.

**Geri alma maliyeti:** yok.

## D-238 — Cassette, sağlayıcının davranışını değil benim varsayımımı kaydetmiş

**2026-08-16 · ilk gerçek bake-off**

Cloudflare adaptörü cassette'lerle test edilmiş ve yeşildi. İlk gerçek koşuda sekiz
brief'in **sekizi de** `MALFORMED_RESPONSE` verdi:

```
AiError: Bad input: Additional or unevaluated properties '/width, /height' at '/' not allowed (5006)
```

`flux-1-schnell` fazladan alan görünce isteği **tümden reddediyor**. Cassette bunu kabul
ediyordu çünkü cassette'i ben yazmıştım. **Kaydedilmemiş bir cassette, sağlayıcının
davranışını değil yazarının varsayımını sabitler** — ve yeşil kalarak o varsayımı bir
olguya benzetir. V-16 tam olarak bunu bekliyordu; bekleyen borç haklı çıktı.

**İkinci olgu, ölçülerek:** iki CF modeli iki farklı **tel biçimi** konuşuyor.
`flux-1-schnell` JSON `{result:{image:<base64>}}` döndürüyor ve boyut SABİT 1024×1024;
`sdxl-lightning` ham JPEG gövdesi döndürüyor ve `width`/`height` KABUL ediyor. Yani
Instagram'ın 4:5'i ancak ikinci modelden geçiyor.

**Karar:** adaptörde `MODELLER` tablosu — en-boy → (model, tel). Model seçimi
adaptörün işidir (D-32): hat yetenek ister, model adı yazmaz. Boyut yalnız kabul eden
modele gönderiliyor; "göndersek de yok sayar" varsayımı ölçüldü ve yanlış çıktı.

**Üçüncü olgu — kendi betiğimde:** bake-off `sonuc.value.data.output` arıyordu, gerçek
şekil `sonuc.value.data`. Sekizi de "şekil bozuk" verdi. D-227'nin dersi bir kez daha:
şekli varsayma, ölç. **Betik gürültülü çöktüğü için bunu öğrendim** — sessizce boş
liste dönseydi "üretim çalışıyor" derdim.

**Geri alma maliyeti:** yok.

## D-239 — 9. yasa kapısı bir adım geçti ve iki kör noktası vardı

**2026-08-16 · ilk gerçek bake-off**

Sekiz brief'ten biri **iki yapay insan üretti** (Md. 27/12 · R-33). Üç ayrı kusur:

**1 · Kapı GEÇ.** `promptRequestsPerson` yalnız `assertCompliance` içinde, yani
**damgalama anında** koşuyordu. İnsan isteyen bir prompt modele gidiyor, para harcıyor,
görsel üretiliyor — ve ancak damga aşamasında iddia kurulamıyor. **Fail-closed olmak
yetmez, ERKEN fail-closed olmak gerekir:** harcanmış para geri gelmez ve üretilmiş
uyumsuz varlık diskte durur. Kontrol artık `generateBody`nin **ilk satırında**,
yönlendirici bile çalışmadan. Yeri `engine` çünkü `providers` ile `render` kardeştir
(§3.6) ve deseni ikinci kez yazmak iki listeden birinin unutulması demekti.

**2 · İngilizce çoğullar KÖR.** Desen `\bworker\b` idi ve *"two factory **workers** in
safety vests"* ile eşleşmiyordu — `\b` sondaki `s`yi kelime karakteri sayıyor. Türkçe
tarafı `\w*` ile yazılmıştı, İngilizce tarafı değil. **Aynı kural iki dilde iki farklı
titizlikle yazılırsa, gevşek olan geçerlidir.** Ve prompt'lar üretimde İngilizce
yazılıyor — yani kapı, asıl kullanıldığı dilde gevşekti.

**3 · Olumsuzlama KÖR.** `no people` ifadesi `people` desenine takılıyor ve kapı,
R-20'nin tam olarak teşvik ettiği prompt'u reddediyordu. Türkçede aynı tuzak `-sız`
ekinde: `insansız` katlandıktan sonra `insansiz` oluyor ve `\binsan\w*` ona da uyuyor.
**Bir kapının, kuralına uyan girdiyi reddetmesi kuralı uygulanamaz kılar** — ve
uygulanamaz kural, kapatılan kuraldır.

**Ölçüldü, sekiz durumun sekizi doğru:** `workers` ✓ yakalanıyor · `no people` ✓
geçiyor · `insansız` ✓ geçiyor · `engineers` ✓ yakalanıyor.

**Brief de düzeltildi:** vardiya sahnesi artık insansız — boş tezgâhta iki kask. Çıktı
hem uyumlu hem **daha iyi**; kısıt burada kaliteyi düşürmedi, yükseltti.

**Geri alma maliyeti:** yok.
