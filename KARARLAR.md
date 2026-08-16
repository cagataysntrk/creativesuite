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
