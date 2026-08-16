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

## D-240 — Genişletme TEK yerde: plan ne sayıyorsa koşu onu koşar

**2026-08-16 · FAZ-8.1b**

`plan()` yedi varyantı fiyatlıyordu, `runPipeline` tek varyant koşuyordu. Tahmin
dürüsttü, üretim değildi — ve iki ayrı hesap bir gün ayrışır. Ayrıştığı gün kullanıcı
yedi varyantın parasını onaylayıp bir varyant alır, ya da tersi.

**Karar: genişletme tek bir fonksiyon** (`varyantlaGenislet`) ve **plan da koşu da onu
okuyor**. `plan()`in gösterdiği koşum sayısı ayrı bir formülden değil, genişletmenin
kendi SAYIMINDAN geliyor (`kosumSayilari`). Ayrı formül yazmak, bu projenin en sık
tekrarlayan hatasının (D-228 · D-229 · D-237) varyant tarafındaki kardeşi olurdu.

**Üç kova, üç davranış — ve ayrım "ücretli mi" DEĞİL:**

- **Paylaşılan önek** (ücretli hiçbir adıma bağlı olmayan): bir kez. `RESOLVE` tarifi
  çözer, `SELECT` bağlamı seçer; yedi varyant aynı bağlamı paylaşır. Yedi kez seçmek
  seçimin varyanttan varyanta kayma riskini doğurur — oysa OFAT'ın tek vaadi diğer her
  şeyin SABİT kalmasıdır.
- **Varyant gövdesi** (ücretli bir adıma transitif bağlı olan her adım): varyant başına.
  ⚠ **İlk modelim eksikti:** "ücretli adımlar çoğalır" diyordum. `COMPOSE` ücretsizdir
  ama her varyantın KENDİ belge modeli olmak zorunda — çoğaltılmazsa yedi render aynı
  belgeyi basar ve matris bir ölçüm değil bir kopya üretir. Ücretsiz adımı çoğaltmak
  maliyeti değiştirmiyor (sıfır × yedi = sıfır); çoğaltmamak ölçümü yok ediyor.
- **Toplayıcı** (`PROPOSE`): bir kez, tüm varyant yapraklarına bağlı. Yedi varyantlık
  bir set TEK öneridir; yedi ayrı öneri insan kuyruğunu aynı kararla yedi kez meşgul
  eder ve "hangisi kazandı" sorusunu sorulamaz kılar.

**Koordinat kısıtlara giriyor** (`constraints.varyant`), ayrı bir parametre kanalına
değil: kısıtların "adımın tüm girdisi" olma vaadi bozulmamalı.

**Varyant içi bağımlılık aynı varyanta bağlanıyor**, çapraz değil — `kompozit#3` yalnız
`metin-uret#3` ve `gorsel-uret#3`e bakar. Çapraz bağlanma OFAT'ı sessizce bozardı.

**Ekranda da görünüyor:** ücretsiz ama yedi kez koşan adımlar artık `×7` basıyor.
Maliyeti yok diye görünmez olmaz — süresi ve çıktısı var.

**Geri alma maliyeti:** yok — matrissiz hat aynı nesneyi geri alıyor, hiçbir davranış
değişmiyor.

## D-241 — Yetenek gövde kurulumundaydı; ortam üç yerde ayrı kuruluyordu

**2026-08-16 · corpus onaylandıktan sonraki ilk gerçek koşu**

Corpus `active` olunca hat ilk kez `bilgi-sec`i geçti ve arkasındaki üç kusur **sırayla**
ortaya çıktı. Üçü de aynı sınıf: **adımın verisi olması gereken şey koda gömülmüştü.**

**1 · Yetenek kurulumdaydı.** `uret.mjs` tek bir `generateBody({capability:
'image.generate'})` kuruyor ve o gövde TÜM `GENERATE` adımlarına hizmet ediyordu. Metin
adımı görsel yeteneğiyle koşup `CAPABILITY_UNSUPPORTED` alıyordu. `BodyInput` yeteneği
hiç taşımıyordu. Artık taşıyor; `deps.capability` yalnız geriye dönük varsayılan.

⚠ **Bu kusur bugüne kadar maskeliydi:** `image.generate` hiçbir sağlayıcıya
çözülmediği için hat o adıma hiç varamıyordu. Bir anahtar eklemek, arkasındaki üç
kusuru aynı anda görünür yaptı — **engeli kaldırmadan arkasını göremezsin.**

**2 · Ortam üç yerde ayrı kuruluyordu.** `plan()`, `runPipeline()` ve `generateBody()`
üç ayrı `env` alıyordu ve ikisi `{ PATH }`ten ibaretti. Kasada duran anahtar
`candidatesFor`a hiç ulaşmıyor, her sağlayıcı "yerel önkoşul sağlanmadı" diye
eleniyordu. Tek tanım (`SAGLAYICI_ORTAMI`), üç çağıran. D-237'nin `uret.mjs`
tarafındaki ikizi — **bir şeyi üç yerde kurmak, ikisini güncellemeyi unutmaktır.**

**3 · Görsel prompt'unun KAYNAĞI YOK** — `3.7b` olarak açıldı. Hiçbir hat `prompt`
kısıtı beyan etmiyor ve hiçbir kod onu türetmiyor; `buildImagePrompt` boş dize alıp
`{kind:'empty'}` ile reddediyor (doğru davranış). Mekanizma tam, besleyen yok.

**Karar — nasıl doldurulacağı:** görsel brief'i **bir `text.generate` adımı üretecek**
ve `gorsel-uret` ona bağlanacak. Alternatifler reddedildi: (a) hat dosyasına sabit
prompt yazmak içeriğe kör bir görsel verir; (b) Türkçe konuyu doğrudan prompt yapmak
görsel modellerinde belirgin biçimde kötü sonuç veriyor ve **6. yasayı da zorlar** —
model seçimi yönlendiricinin işi ama prompt dili bizim kararımız. Brief'i model
yazınca R-20 ve 9. yasa kapılarının ikisi de o metnin üzerinden geçiyor.

**Geri alma maliyeti:** yok.

## D-242 — Başarısız adım deftere kapanıyor ve sonraki koşuda "başarılı" oluyordu

**2026-08-16 · corpus onayı sonrası ilk koşular**

Manifest'te şu satırı gördüm: `metin-uret · status: ok · output: null · 1 ms`. Ücretli
bir `GENERATE` adımı hiçbir iş yapmadan başarılı olmuştu.

**Zincir, ölçülerek:**
1. `idempotencyKey` **bilerek `runId` içermiyor** — aynı iş koşular arası aynı anahtarı
   paylaşsın ve çift ödeme olmasın diye. Bu doğru.
2. 1. koşuda `metin-uret` `CAPABILITY_UNSUPPORTED` ile düştü ve `scheduler.ts` hatada
   deftere **`not-charged`** yazıp kaydı kapattı.
3. 3. koşuda aynı anahtar bulundu. Kod `chargeStatus === 'possibly-charged'` değilse
   *"(a) KAPANMIŞ kayıt: iş bitmiş, çağrı atlanır"* diyordu — ve `not-charged` de
   `possibly-charged` değil.

Yani **bir kez hata veren adım, sonraki HER koşuda `output: null` ile yeşile dönüyordu.**
Aşağı akış (`kompozit`) boş girdiyle devam ediyordu.

**Kırmızı bir adım, yeşile dönmüş bir adımdan iyidir.** Kırmızı adım bakılır; yeşile
dönen adım bakılmaz ve boş çıktı hattın sonuna kadar taşınır.

**Kök ayrım:** `not-charged` = *çağrı uçmadı*, yani **iş yapılmadı**. `charged` = iş
yapıldı ve ödendi. İkisini "kapanmış" diye aynı kovaya koymak, defterin ne için var
olduğunu karıştırmaktı. **Defterin işi ÖDEMEYİ tekrarlamamak, İŞİ tekrarlamamak
değil** — ödenmemiş bir iş tekrar denenmeli ve çift ödeme riski yok, çünkü ödeme hiç
olmadı.

**Düzeltme:** `not-charged` kayıt `ledger.reopen()` ile `possibly-charged`a çevrilip
yeni koşuya bağlanıyor. Kayıt **SİLİNMİYOR** — defter append-only bir kanıttır (R-52)
ve "bu adım daha önce denendi" bilgisi kaybolmamalı. `charged` ve `possibly-charged`
kayıtlara dokunulmuyor: birincisinde çift ödeme riski var, ikincisinde bilinmeyeni
tahmin etmek yasak.

**Ölçüldü:** düzeltmeden sonra aynı hat `metin-uret`te dürüstçe `EMPTY_PROMPT` veriyor —
yani gerçek eksiği gösteriyor. Bu eksik (`3.7b`) daha önce defterin arkasına saklanmıştı.

**Geri alma maliyeti:** yok.

## D-243 — Prompt'un kaynağı yoktu; çıktı da `COMPOSE`a ulaşmıyordu

**2026-08-16 · FAZ-3.7b**

Corpus onaylandıktan ve defter kusuru kapandıktan (D-242) sonra hat dürüstçe
`EMPTY_PROMPT` dedi ve **aynı dikişin iki ucunun da açık olduğu** görüldü:

**1 · Prompt'un kaynağı yoktu.** `topic` bir çalıştırma parametresi, kayıtlar
`SELECT`ten `input.inputs`e akıyor — ama hiçbir kod ikisini bir prompt'a çevirmiyordu.
`constraints['prompt']` hep boş kalıyordu.

**2 · Çıktı `COMPOSE`a ulaşmıyordu.** `composeBody` `{lines: string[]}` arıyor;
sağlayıcı çıktısı o şekilde değil. Bulamayınca **sessizce ham kayıtlara düşüyordu** —
yani model koşsa bile metni kullanılmıyor ve bunu çıktıya bakarak anlamak imkânsızdı.
İkinci boşluk birincisinin arkasında saklıydı: prompt hiç kurulamadığı için model hiç
koşmuyordu ve normalizasyonun eksikliği görünmüyordu.

**Önce ARADIM, sonra yazdım** (kullanıcının uyarısı üzerine): `assembleContext` hangi
kaydın bütçeye sığdığını hesaplıyor (köken ve planlama), `buildImagePrompt` R-20 ekini
basıyor (güvenlik), `selectBody` kayıtları getiriyor. **Üçü de prompt kurmuyor** ve
hiçbiri bu işi yapacak yer değil — karıştırılırsa "bu kayıt neden düştü" ile "bu prompt
neden böyle" tek cevaba sıkışır. Tikli fazlar bir şeyin var olduğunu garanti etmiyor;
aramak ucuz, ikinci kopya pahalı.

**İkisi tek dosyada** (`metin-akisi.ts`) çünkü aynı dikişin iki ucu: ayrı dosyalarda
olsalardı biri düzeltilip diğeri unutulurdu.

**Görsel brief'i MODEL yazıyor** (D-241'in kararı uygulandı): hat dosyasına sabit prompt
yazmak içeriğe kör görsel verir; Türkçe konuyu doğrudan görsel modeline vermek ölçülerek
elendi. Brief İngilizce, insansız ve metinsiz isteniyor — ve bake-off'un ölçtüğü şey
prompt'a yazıldı: **tabela içeren konular açıkça eleniyor** (kantar göstergesi, raf
etiketi, dashboard), çünkü metin sızması konu seçiminden geliyor, ekten değil.

**Kapılar yine de duruyor:** brief bir metin modelinden çıkıp görsel modeline giderken
R-20 ve 9. yasa kapılarının ikisinden de geçiyor. Bir kapıya çarpmadan geçmek, çarpıp
geri dönmekten ucuz — ama kapı kaldırılmıyor.

**Geri alma maliyeti:** yok.

## D-244 — PATH'te bulunan ikili, DOĞRU ikili demek değil

**2026-08-16 · ilk gerçek metin üretimi**

Prompt kurulduktan sonra `claude` çağrıldı ve `CLAUDE_CODE_EXIT: {code:1, stderr:""}`
döndü. Kazınca: bu makinede **iki Claude Code kurulumu** var —

- `/usr/bin/claude` → global npm paketi, **emekli bir modele ayarlı**, her çağrıda
  `API Error: 404 {"type":"not_found_error","message":"model: claude-opus-4-1-…"}`
- `~/.claude/local/claude` → çalışan kurulum

PATH eskisini önce buluyor. `available()` "var" diyordu ve **kapı yeşildi, çağrı ölü.**

**Ders:** bir ikilinin PATH'te BULUNMASI, doğru ikili olduğunu göstermez. Sürüm sormak
da yetmezdi — kırık olan sürüm değil yapılandırmaydı. Tek dürüst çözüm operatörün
sabitleyebilmesi: `CLAUDE_CODE_BIN` ortam değişkeni, `ctx.env` üzerinden okunuyor
(`secret-okuyucu` darboğazı korunuyor; adaptör `process.env`e dokunmuyor).

Bu, "yalnız bu makinede çalışan şey çalışmıyor demektir" kuralının aynadaki hâli:
**bu makinede çalışmayan şey, başka makinede çalışıyor olabilir** — ve ikisini ayırt
etmenin yolu ikiliyi tahmin etmek değil, sabitlemek.

**Geri alma maliyeti:** yok — değişken verilmezse davranış eskisi gibi.

## D-245 — Arama SIRALAR, yüklem İÇERİK verir

**2026-08-16 · ilk uçtan uca koşu**

`selectSearch` bir **sıralama** şekli döndürüyor — `{id, path, title, score, sources}` —
ve **gövdesi yok**. `uret.mjs` `k.body ?? k.snippet ?? ''` okuyordu: arama isabet
ettiği an üç kaydın üçü de boş metinle geliyor, prompt kurulamıyor ve hat
`EMPTY_PROMPT` ile duruyordu.

**Kusur yalnız arama TUTTUĞUNDA görünüyordu** — ıskaladığında yedek yol
(`selectRecords`) gövdeyi getiriyordu. En sinsi hâli: yeni onaylanmış, konuya değen bir
corpus tam olarak aramanın tuttuğu durumdur.

**Karar:** arama sırayı belirler, içerik **retrieval yükleminden** gelir (R-13). İkinci
bir içerik okuyucu açmak yüklemi ikiye bölerdi.

**Geri alma maliyeti:** yok.

## D-246 — Bir adım, bağlanmadığı adımın çıktısını okuyordu

**2026-08-16 · ilk uçtan uca koşu**

Görsel adımı brief'i `Object.values(inputs)` içinde **arıyordu** ve ilk metin çıktısını
alıyordu. `metin-uret`in TÜRKÇE gönderi metni `gorsel-brief`ten önce geliyor: görsel
prompt'u Türkçe oluyor ve R-20 haklı olarak reddediyordu (`matched: "cümle"`).

**DAG zaten doğru şeyi söylüyordu, gövde onu duymuyordu.** `needs` artık `BodyInput`ta
ve adım yalnız bağlandığı adımların çıktısını okuyor. Şekle bakmak adım adına bakmaktan
sağlamdı (D-229) — ama **bağımlılığa bakmak ikisinden de sağlam**.

**Geri alma maliyeti:** yok.

## D-247 — Defter maliyeti saklıyor, çıktıyı saklamıyor

**2026-08-16 · ilk uçtan uca koşu**

D-242'yi düzelttikten sonra yeni bir kusur çıktı: kapanmış bir kaydı atlayınca
`data: null` dönüyor ve **aşağı akış boş girdiyle kalıyor**. Ölçüldü: `gorsel-brief` ✓
göründü, `gorsel-uret` brief'i `null` aldı, R-20 boş prompt'u reddetti.

**Karar: tutarı SIFIR olan kayıt atlanmaz.** Defterin işi çift ÖDEMEYİ önlemek; sıfır
tutarlı bir kayıtta önlenecek ödeme yok (abonelik çağrısı ya da bedava katman).
Atlamak hiçbir şey kazandırmıyor, çıktıyı kaybettiriyor.

⚠ **Ücretli kayıtlarda sınır DURUYOR ve bu bir eksikliktir:** çıktı deftere yazılmadığı
için ücretli bir adım tekrar oynatıldığında aşağı akış boş kalır. Doğru çözüm çıktıyı
`derived/runs/<run>/steps/` altına yazmak — bugün yok. **Olmadığını söylemek, varmış
gibi davranmaktan iyi.**

⚠ **İlk düzeltmemde kendi açtığım kapıyı iki satır aşağıda kapatmışım:** `reopen`
kaydı `possibly-charged` yapıyor, akış da (c) dalına düşüp `NEEDS_RECONCILIATION`
veriyordu. Bir dal eklerken diğer dalların koşullarını güncellememek, düzeltmeyi
düzeltmenin yokluğuna çevirir.

**`just defter-mutabakat` açıldı:** yarıda kalmış kayıtları listeler ve insan
"ödenmedi" beyan edince `not-charged` yazar; motor onu görünce yeniden dener. Komut
sağlayıcıya SORMAZ ve tahmin yürütmez — karar insanın (R-14). Bir kapı, arkasında kapı
olmayan bir duvar olamaz.

**Geri alma maliyeti:** yok.

## D-248 — Varlık değil TESLİMAT: yüzlerce birikince sorun "yer" değil "hangisi"

**2026-08-16 · ilk postlar üretildikten sonra**

İlk post dört varlık üretti ve kütüphane **dört özdeş satır** gösterdi: hangisinin kapak
olduğu, hangisinin son slayt olduğu belli değil. Yüz postta dört yüz satır ve hiçbiri
diğerine bağlı değil. **Yüzlerce varlık biriktiğinde sorun "yer yok" değil, "hangisi
neydi" olur.**

**Neden ACİL:** damga üretim anında basılır ve **retrofit imkânsızdır** (7. yasa, R-11).
Bu alan olmadan üretilen her varlık kalıcı olarak sırasız kalır. Bir gün beklemek, bir
günlük varlığı kalıcı olarak kaybetmek demekti — nitekim ilk dört varlık öyle kaldı ve
kütüphane onları **damgasız diye sayıyor, uydurma bir gruba KOYMUYOR**.

**`DeliverableRef` damgaya girdi:** `deliverableId` · `kind` · `index` · `total` ·
`role`. `deliverableId` çalıştırma id'sine EŞİT DEĞİL: tek koşu birden çok teslimat
üretebilir (reklam matrisi yedi varyant) ve tek teslimat birden çok koşuya yayılabilir
(yarıda kalan koşu devam ettirilir).

**`total` alanı eksikliği görünür kılıyor:** yarıda kalmış bir koşu üç slayt bırakır ve
liste bunu "3 parçalı post" diye göstermemeli. `eksikParca` ölçülüyor, varsayılmıyor.

⚠ **Yol boyunca `BlobMeta`nın İKİNCİ BİR KOPYASI bulundu** (`kutuphane.ts`) ve yorumu
*"biçim `blobs.ts`ten OKUNDU, uydurulmadı"* diyordu. Okunmuştu — ama kopyaydı ve
`deliverable` eklenince sessizce ayrıştı. **Okunan bir kopya da bir kopyadır.** Tip
artık kaynağından import ediliyor; ayrışma yapısal olarak imkânsız.

**Kapanmayanlar, açıkça:**
- Varlıklar **indekste değil**: `kutuphane()` her çağrıda tüm ağacı tarıyor. 400
  varlıkta ~500 dosya okuması. Ölçülmeden optimize edilmeyecek.
- `derived/blobs` **yalnız bu diskte** (`3.12b`, R2 senkronu yazılmadı). Yüzlerce
  varlığın gerçek riski budur.
- Önizleme/küçük resim yok: dijest'e bakarak 400 görsel taranamaz.

**Geri alma maliyeti:** yok — alan opsiyonel, eski varlıklar okunmaya devam ediyor.
