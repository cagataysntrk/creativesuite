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

## D-255 — Onuncu faz: "üretebiliyor" ile "iyi" ayrı sorulardır

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10 · §11.1 · §7.1

FAZ 3 görsel hattını kapattı ve kriteri şuydu: *"gerçek bir carousel üret."* Üretildi.
Ama o kriter **kalite hakkında hiçbir şey söylemiyor** ve bu hafta üç kusur bunu kanıtladı:
metin eğri sınırını kesiyordu, hayalet rakam navigasyon etiketiyle çakışıyordu, kapak
on iki satırlık bir metin duvarıydı. **41 kapının hiçbiri kırmızıya dönmedi.** Üçünü de
PNG'lere tek tek bakarak buldum.

**Karar:** kalite kendi fazını alır (FAZ 10) ve kendi kapısını (`tasarim`).

**Göz kapı değildir.** Yorulur, alışır, ve gözetimsiz koşuda hiç yoktur. Kullanıcı
inceleme istedi ve isabetli — ama insan incelemesi ölçümün YERİNE değil, ÜSTÜNE gelir.
Ölçüm ucuz ve tekrarlanabilir olanı yakalar; göz, ölçülemeyeni.

**Eşikler ölçülmeden konmuyor** (10.2, 10.3'ten önce). D-253 dersi: chroma 0.156
ölçüldüğü için savunulabildi. Eşiği önce koyup sonra ölçmek, eşiği kendi çıktımıza göre
ayarlamak olurdu — kapı o an kendini onaylar.

**Bloklayıcı / uyarı ayrımı gerekçeli.** T2 (metin↔eğri), T3 (rakam↔şerit), T8 (kelime
tavanı) bloklayıcı çünkü **üçü de gerçekten oldu**; olmuş bir hatayı yakalamayan kapı
temennidir. Kaplama, palet payı, ΔE uyarı çünkü estetik tercih payı var ve sıfır
tolerans meşru bir tasarımı reddeder.

**Kabul ölçütü ARDIŞIK, oransal değil.** Yirmi ardışık temiz koşu; biri düşerse sayaç
sıfırlanır. *"20 üretildi, 17'si iyiydi"* geçmez — oran, düzeltilmemiş bir kusurun
kuyruğunu gizler. Ardışıklık, düzeltmenin gerçekten kapandığını kanıtlayan tek ölçüdür.

**Saha taraması bu fazı doğruladı** (`docs/research/8-karosel-oss--*.md`): sekiz agent
destekli karosel aracının hepsi `LLM → HTML/CSS → headless Chromium → PNG` zincirini
kuruyor — mimarimiz doğru. Ama hiçbirinde tasarım metriği YOK ve Türkçe için tek satır
rehberlik yok. Fork edilecek bir şey çıkmadı; alınacak üç mekanizma çıktı ve üçü de bu
fazın adımlarında (10.1 tarayıcı oturumu · 10.5 görsel yargı · 10.6 referans→parametre).

**Ölçülen tek şey:** tarayıcı açma maliyeti. `5 slayt · ayrı tarayıcı 3656 ms` ·
`tek oturum 704 ms` → **5.2x**. Slayt başına Chromium açmak gerçek bir kusurdu ve
alandaki bir araç bunu bizden önce çözmüştü.

**Geri alma maliyeti:** düşük — `tasarim` kapısı kaldırılabilir; ama o an kalite yine
göze kalır ve bu fazın gerekçesi tam olarak budur.

## D-256 — Görsel yargı: yeni yetenek, yeni fiil değil

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.5 · §11.1 · §8.2

`tasarim` kapısı (D-255) ölçülebileni ölçüyor. Ama bu fazda bulduğum kusurların yarısını
hiçbir metrik görmedi ve ancak PNG'ye **bakınca** çıktılar: dev tırnak çerçevenin
tepesinde kırpılıyordu, üste yaslı içerik sayaç bandıyla çakışmaya bir kelime uzaktaydı.
İkisi de "sayıya dökülemez ama bakınca apaçık" sınıfındandı.

**Karar:** `image.critique` bir **YETENEK**, dokuzuncu bir fiil değil. `GENERATE` altında
koşuyor — ölçülüyor, maliyeti önden görünüyor, deftere yazılıyor. Yeni bir fiil, aynı işi
yapan ikinci bir zamanlama/retry/maliyet yolu açardı (R-02).

**SINIRLAYICI KUTU ZORUNLU.** Kutusuz bulgu reddediliyor ve bu tercih değil, ampirik
sonuç: *"kompozisyon dengesiz"* eyleme çevrilemez, *"kapakta 120–460 px bandında metin
eğri sınırını geçiyor"* çevrilebilir. Kategori ve şiddet de **kapalı liste** — serbest
kategori toplanamaz, sayılamaz, izlenemez.

**Reddedilen bulgular SAYILIYOR.** Sessizce atılsalardı model kutusuz bulgu üretmeye
devam eder ve biz "temiz" raporunu gerçek sanardık — kapıyı kör etmenin en sessiz yolu.

**`Read` aracı yeteneğe BAĞLI verildi ve bu ölçülerek bulundu.** Araçsız çağrı 5 dakikada
dönmedi ve SIGTERM ile öldü: Claude Code etkileşimsiz kipte izin istemi çıkarıp asılıyor.
`--allowedTools Read` ile aynı çağrı **18 saniyede** doğru sonucu verdi. Yalnız `Read`:
alandaki araçlar agent'a `Bash WebFetch` verip kendi API'sini curl ile çağırtıyor — o,
kapatılamayan bir delik. Okuma kategorik olarak farklı: yan etkisi yok, kabuk açmıyor,
ağa çıkmıyor. Yine de bir yetki genişlemesi, o yüzden metin üretimi bu aracı ALMIYOR.

**Şerit `free`, her koşuda çalışıyor.** Premium bir yargı, kapının maliyetini üretimin
maliyetine yaklaştırırdı; abonelik zaten var.

**İlk gerçek koşu üç bulgu verdi, üçü de doğruydu ve üçü de düzeltildi:**
1. **Alt-piksel yumuşatma renk saçaklanması** — Chromium varsayılan LCD yumuşatması harf
   kenarlarına mavi–turuncu saçak bırakıyordu. Ekranda görünmez ama PNG bir VARLIK:
   farklı piksel dizilimli ekranda, baskıda ve ölçeklemede görünür oluyor. **Ölçüldü:
   %6,6 → `--disable-lcd-text` ile %0,0.** Hiçbir metrik bunu görmedi ve HER varlığı
   etkiliyordu.
2. **Boşluk hiyerarşisi**: başlık↔ilk madde 37 px, maddeler arası 33 px — fark ayırt
   edilemeyince dört satır tek blok gibi okunuyordu.
3. **Madde çizgisi kontrastı 3,71:1** iken yanındaki gövde metni 7,99:1.

**Geri alma maliyeti:** düşük — hat adımı kaldırılırsa yargı koşmaz; ama o an kalite
yine yalnız ölçülebilene ve göze kalır.

## D-257 — Şablon parametreleri: gramer kapalı, sayılar türetilebilir

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.6 · §7.1

D-254 grameri kapattı: kaç kural olduğu, hangi ögelerin bulunduğu bir KARAR. Ama o
kuralların **sayısal ayarları** — eğrinin nerede aktığı, kenar payı, hayalet rakamın
büyüklüğü — elle çözümleniyordu ve bu tekrar edilebilir değildi: ikinci bir referans
geldiğinde aynı el işi baştan yapılacaktı.

**Karar:** `SablonParametreleri` — kapalı alan listesi, tek yerde tanımlı, `sablon.ts` ve
`static.ts` oradan okuyor. Her sayının kaynağı yazılı: ya bir ölçüm, ya bir kısıt.
*"Güzel duruyor"* diye seçilmiş sayı yok.

**Türetme ÖNERİR, uygulamaz** (R-14 · D-31). `scripts/sablon-turet.mjs` bir JSON yazıyor;
onu `sablon-parametre.ts`e taşımak bir commit. Otomatik uygulansaydı bir referans görseli,
hiçbir insan bakmadan tüm markanın tipografisini değiştirebilirdi.

**ÇIKTI HTML DEĞİL, VERİ** — bu adımın tek gerçek kısıtı. Saha taramasındaki sekiz aracın
hepsi referanstan HTML üretiyor ve o an üç şey ölür: golden tipografi metriği bir belge
modeline karşı ölçülüyor (serbest HTML'e karşı değil), `COMPOSE`/`RENDER` sınırı silinir,
ve Türkçe garantisi font yükleme yolunun TEK olmasından geliyor.

**BANT REFERANSTAN TÜRETİLEMEDİ — ve betik bunu SÖYLÜYOR.** Ham aralık **%2–97**, yani
95 puan; makullük tavanı 40. Bir eğri bandının anlamı sınırın DAR bir aralıkta salınması,
%2–97 "her yerde" demek. Sebep 10.2'de zaten ölçülmüştü: yan slaytlar piksel piksel
bitişik (tam zemin renginde **0/800** sütun), yani bölge ≠ slayt ve ölçüm iki slaydın
eğrilerini slayt kenarlarıyla karıştırıyor.

**Sayı YAZILMADI.** Yazılsaydı kaynağı unutulduğunda ölçüm sanılırdı. Bu fazda aynı sınıf
hata altı kez tekrarladı — palet yuvarlaması %97,8 · T11 krom puntolarını saydı · batarya
çapaları her tur kırıldı · `SAYISAL` deseni `%4`ü kaçırdı · tırnak mutlak konumdaydı ·
bölge sayısı sessizce 2 çıkıyordu. **Sayı üretiyor olmak, ölçüyor olmak değildir** ve
makullük kapısı bu cümlenin koda dökülmüş hâli.

**Bant yürürlükte %69–78 ve kaynağı bir KISIT, referans değil:** metin sütunu %62 olmak
zorunda çünkü `taşıyabileceğimizin` 64 px'te 582 px içerik genişliği istiyor. Referans
İngilizce ve daha dar sütunla idare ediyor. Referansı birebir kopyalamak Türkçe metni
eğrinin içine sokardı — **uyarlama sapma değildir.**

**Geri alma maliyeti:** yok — `VARSAYILAN` bugünkü değerleri taşıyor, davranış değişmedi.

## D-258 — Görsel içeren slaytta renk metriği ölçülmez

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.7 · §11.1

Kabul koşusunun ilk denemesi `kalite` adımında **durdu**: slayt 2 palet dışı %17,7 verdi,
limit %15. O slaytta bir AI fotoğrafı vardı. **Fotoğraf tanımı gereği palet dışıdır** —
o sayı fotoğraf hakkında bir olgu, tasarım hakkında bir kusur değil. Kapı, sistemin
üretmesi gereken şeyi reddediyordu (D-251'in birebir tekrarı).

**Karar:** görsel bloğu taşıyan slaytta ΔE ve palet dışı okumaları **ÜRETİLMİYOR**.
Sıfır yazılmıyor: `measure.ts`in kendi kuralı, ölçülemeyen metriği sıfır yazmanın hiçbir
şey ölçülmediği anda yeşil yakmak olduğunu söylüyor. Kaplama ve en-boy etkilenmiyor —
ikisi belge modelinden hesaplanıyor, pikselden değil.

**İlk düzeltmem FAZLA GENİŞTİ ve bunu ancak koşuyu tekrarlayınca gördüm.** `doc.blocks`a
bakıyordum; ama `uret.mjs` her slayt için AYNI belgeyi geçiyor, yani karoselde tek bir
görsel olsa bile ÜÇ slaytın üçünde de renk QA'sı kapandı. Kapı yeşile döndü ve *doğru
sebepten değil*. **Sessiz kapanma, kırmızı bir kapıdan tehlikelidir: kimse fark etmez.**

**Otorite ÜRETİCİDE.** `renderBody` artık `gorselliSlaytlar` indeks listesi yayınlıyor —
hangi bloğun hangi slayta düştüğünü bilen tek yer sayfalayıcı. Tüketicinin tüm belgeye
bakıp tahmin etmesi, bu deponun en sık tekrarlayan hatasının bir başka yüzüydü.

**Doğrulandı:** slayt 1 (görselsiz) dört okuma alıyor, slayt 2 (fotoğraflı) yalnız
kaplama ve en-boy; `kalite` geçiyor ve hat uçtan uca yeşil koşuyor — `gorsel-yargi`
adımı dahil.

**Geri alma maliyeti:** yok — bayrak verilmezse eski davranışa düşüyor.

## D-259 — Kapı depoyu koruyordu, çıktıyı korumuyordu

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.7 · §11.1

FAZ 10 boyunca on iki tasarım metriği yazıldı ve `scripts/gates/tasarim.mjs` onları
**temsili belgelerle** ölçüyordu. Gerçek çıktıya hiçbiri uygulanmıyordu. Sonuç ölçüldü:
kapak, "≤8 kelime" kuralına rağmen üç satır başlık ve iki uzun paragrafla çıktı ve
**hiçbir şey kırmızıya dönmedi**.

Bu, bu deponun en sık tekrarlayan hatasının — *kod var, üretim yolunda çağıranı yok* —
**bu fazın kendi içindeki tekrarı**; üstelik tam o hatayı kapatmak için kurulmuş bir
fazda. **Kapı yazmak, kapıyı bağlamak değildir.**

**Karar:** `kaliteKontrol` (üretim yolu) `tasarimOlc` okumalarını da topluyor ve
bloklayıcı bir okuma varlığı DURDURUYOR. Slayt belgeleri orada yeniden sayfalanıyor:
sayfalama saf ve deterministik, o yüzden ikinci çağrı üretimdekiyle aynı sonucu veriyor.

**İkinci kusur — kapak `list` düzeni alıyordu.** Kapak bir KANCADIR, madde listesi değil.
Düzeltme yalnız çizime uygulanamazdı: düzen sayfalama BÜTÇESİNİ de belirliyor, yani kapak
`list` bütçesiyle (6 blok, 320 karakter) bölünüp `statement` gibi çizilseydi tam olarak
gördüğümüz metin duvarı çıkardı. Kısıt **sayfalamaya** girdi.

**İki geçişli sayfalama.** Rol `total`e bağlı (son slayt kapanıştır) ama `total` sayfalama
bitmeden bilinmiyor. İki geçiş saf ve ucuz: birincisi kaç slayt olacağını öğreniyor,
ikincisi rolü bilerek bölüyor. İlk geçişin sonucu ATILIYOR — kısıtlı bölme farklı sayıda
slayt üretebilir ve sayıyı dayatmak `total`i yalan yapardı.

**Üçüncü bulgu: `citations` kapısında da tek-haneli faz varsayımı vardı.** `for (n = 0;
n <= 9; n++)` — `durum` kapısındakinin birebir kopyası. FAZ 10'dan itibaren `FAZ-10.x`
atıfları "doğrulanmadı" uyarısına düşüyordu, yani kırık bir faz atfı sessizce geçerdi.
Dizin taramasına çevrildi. **İki ayrı kapıda aynı hata**, çünkü ikisi de dosya sisteminin
söyleyebileceği bir şeyi tahmin ediyordu.

**Geri alma maliyeti:** düşük — üretim yolundaki ölçüm çağrısı kaldırılabilir; ama o an
metrikler yine yalnız depoyu korur.

## D-260 — Ölçen ile ölçülen aynı birimi konuşmalı

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-10.7 · §11.1

Kabul koşusu üç kez düştü ve üçünde de sebep **benim ölçüm tarafımdaydı**:

**1. Kontrast okuması hiç ÜRETİLMİYORDU.** `tokenCoz` tek adım çözüyordu, oysa token
mimarisi üç kademeli (§12.1): `--role-bg` bir renge değil `var(--ramp-gray-950)`e
çözülüyor. Ayrıca "son tanım kazanır" kuralı `studio` yüzeyini seçiyordu — karosel
`kreatif` yüzeyinde çiziliyor. İkisi birlikte: ölçüm doğru sayı üretip **yanlış şeyi**
ölçecekti. Çözüm özyinelemeli ve yüzey kapsamlı; döngüsel tanımda derinlik sınırıyla
`null` dönüyor, sıfır DEĞİL.

**2. Kapanış cümlesi belgeye hiç girmiyordu.** `satirlar.slice(1, 4)` yalnız üç gövde
satırı alıyordu; son satır — yani DAVET — atılıyordu. Kesme, uzunluk disiplini prompt'a
yazılmadan önceki bir kalıntıydı ve disiplin gelince fazlalık değil **kayıp** oldu.
Ayrıca görsel en sona ekleniyordu ve sayfalayıcı onu tek başına son slayda koyuyordu:
kapanış 0 kelimeyle çıkıyordu (ölçüldü). Görsel gövdenin sonuna alındı, kapanış en sona.

**3. Birim uyuşmazlığı — ve bu en sinsisiydi.** T8 slayttaki TÜM metni topluyordu ama
`icerikPromptu`un bütçesi SATIR başına. Bir slayt iki satır taşıyabildiği için her satır
kurala uysa bile toplam 41 çıkıyor ve metrik varlığı reddediyordu. **Modelin hatası
sanılan şey ölçenin hatasıydı.** Metrik artık en uzun BLOĞU ölçüyor — prompt'un
sözleşmesiyle aynı birim.

**Prompt'a örnek ve sayım talimatı eklendi ve bu da ölçülerek yapıldı:** yalnız "en fazla
8 kelime" yazmak yetmedi (kapak 21 geldi); örnek biçim ve "yazmadan önce her satırın
kelimesini say" eklendikten sonra kapak 5–6 kelimeye indi. **Bir üst sınır, sayılması
istenmediği sürece bir temennidir.**

**Sonuç:** hat uçtan uca yeşil koşuyor, tasarım metriklerinin hepsi tolerans içinde,
kapanış slaydı gerçek bir davet taşıyor.

**Geri alma maliyeti:** yok — üçü de düzeltme, davranış genişlemesi değil.

## D-261 — Fotoğraf varsayılan olmaktan çıktı; öncül sorgulanır

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-11 · §7.1

FAZ-10.7'de bulduğum görsel kusurların çoğu tek kökten geliyordu: **oraya ait olmayan bir
öge.** Fotoğraf kutu gibi duruyordu → kenara taşırdım. Altında boşluk kaldı → doldurdum.
`kaydır ››` ile çakıştı → sayfalama bütçesi verdim. Mavi/turuncu makineler amber alanla
çarpıştı → brief'e monokrom yazdım. **Dört yama, hepsi belirtiye.**

Doğru soru *"bu fotoğraf neden burada?"* idi ve cevabı: **bağlı olan tek görsel yol oydu.**
`chart` ve `diagram` çizicileri repoda yazılı ve test edilmişti; üretim hattı sıfır tane
üretiyordu (`grep -c` → 0). Aynı zincir kırılması sınıfı, bu kez benim onu fark edememem
biçiminde.

**Kanıt — kendi referanslarımızda fotoğraf YOK, ölçüldü:** `karosel-sablon` doku payı
**%6,8** (düz renk + tipografi). `karosel-mockup` %18,7 ama o doku slaytlardan değil,
mockup'ın DUVAR fotoğrafından. Kullanıcının dört yeni örneğinde de dikdörtgen serbest
fotoğraf yok: kesilmiş özne · daire arkalıklı ürün · geometrik süsleme dağarcığı ·
yarım kareyi uçtan uca dolduran alan.

**Karar:** fotoğraf varsayılan olmaktan çıkıyor. Görsellik kapalı bir öge dağarcığıyla
kuruluyor: akış diyagramı · geometrik süsleme · gömülü ikon · maskeli/alan fotoğraf.

**`chart` DEĞİL `diagram`:** grafik veri noktası ister, R-32 kaynaksız sayıyı yasaklar ve
corpus'ta sayı yok — grafik yolu kaynak gelene kadar kapalı. Akış diyagramı sayısızdır.

**⚠ TEK ÇEŞİT YOK — kullanıcının düzeltmesi ve D-254'le görünürdeki çelişkinin çözümü.**
*"binlerce çeşidi var; mühim mesele estetik olması, hikayesinin olması, akması."*
Ayrım: **garanti katmanı** kapalıdır (Türkçe tipografi, güvenli alan, kontrast, kelime
bütçesi) — orada çeşitlilik özgürlük değil hata modudur. **Kompozisyon ailesi** ise çok
olabilir ve post bazında seçilir. "Kapalı gramer" bir ŞABLON demek değil: bir aile
kapalıdır, kaç aile olduğu açıktır. Bugüne kadarki hatam tek aileyi tüm sistem sanmaktı.

**Yeni çalışma kuralı:** bir düzeltme **iki denemede** tutmuyorsa yamaya devam edilmez,
öncül sorgulanır. Ölçüt tek soru: *bu öge oraya ait mi?* Fotoğraf yamalarında dört deneme
harcadım ve dördü de yanlış katmandaydı.

**Geri alma maliyeti:** düşük — akış yoksa fotoğraf yolu aynen çalışıyor.

## D-262 — Bir bağlamda ölçülen değer SABİT değil PARAMETREdir

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-11.2 · §7.1

Taralı daireyi tek bir slaytta gördüm — kâğıt alanda, mürekkep renginde, hayalet rakamın
üstünde — ve **kalabalık** buldum. Sonra `sablon-susleme.ts`'teki çizgi sayısını 17'den
11'e, kalınlığı `boyut/16`'dan `boyut/26`'ya çektim. Yani **tek bir bağlamdaki tek bir
gözlemi, tüm tasarımlar için geçerli bir sabite dönüştürdüm.**

Bu yanlış. Aynı yoğun tarama koyu zeminli, yüksek enerjili bir kompozisyonda **doğru**
olurdu; referans örnek 3'te ince, örnek 1'in koyu dilinde kalın doğru olur. Kararın kendisi
(seyrek) bu ailede doğruydu; **kararı sabitlemek** yanlıştı.

**Kural:** dağarcık KAPALI, parametreleri AÇIK.
- *Hangi şekiller var* → kapalı birleşim, altıncısı bir karar ister.
- *O şekil ne kadar yoğun / kalın / opak çizilir* → bağlamdan gelen bir parametre.

Ayırt edici soru: **"bu sayı her tasarımda aynı mı olmalı?"** Cevap hayırsa sabit değildir.
`SINIR_MAX` bir sabittir (metnin taşmaması bir garanti). Tarama yoğunluğu değildir (estetik
bir tercih). Garanti katmanı kapalı, estetik katmanı parametrik — FAZ-12.7'nin (kompozisyon
ailesi) mikro ölçekteki hâli.

⚠ **Bu D-260'ın kardeşi.** Orada ölçen ile ölçülen farklı birim konuşuyordu; burada bir
bağlamın ölçüsü tüm bağlamlara uygulandı. İkisi de "yerelde doğru olanı global sanmak".

**Geri alma maliyeti:** düşük — parametre varsayılanı bugünkü değer, davranış değişmiyor.

## D-263 — Defter KANIT tutar, yük değil; JSON kanıttır, PNG teslimattır

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-14.1 · §3.5 · R-52 ↔ R-64

Bekleyen çalıştırma defterlerini commit'lerken `repo-hygiene` kırmızıya döndü: bir
`manifest.json` **580 KB** çıkmıştı. İki kural çakışıyor göründü — R-52 defterin
commit'lenmesini, R-64 512 KB üstü izlenen dosya olmamasını zorunlu kılıyor.

**Çakışma sahteydi, iki ayrı kökü vardı.**

**(a) Manifest gömülü YÜK taşıyordu.** Ölçüldü: `output.document.fontCss` **414 KB** —
gömülü marka fontu, her koşuda AYNI ve zaten `brand/<id>/fonts` altında izleniyor — ve bir
görselin `src` data URI'si **385 KB**. Defterin işi byte'ı saklamak değil, *hangi byte
olduğunu kanıtlamak*; digest bunu 64 karakterde yapıyor. `defterReplacer` 8 KB üstü her
dizeyi `«elenmis sha256:… <n>B»` ile değiştiriyor. Eşik ölçülerek seçildi: en büyük gerçek
kanıt alanı QA raporu 3,4 KB, `tokenCss` 2,6 KB — ikisi de korunuyor. Kazanç: 16 MB.

**(b) Teslimat PNG'leri deftere karışmıştı.** Fotoğraflı bir slayt 792 KB. R-52'nin kendi
gerekçesi *"maliyet ve sağlayıcı geçmişi başka hiçbir yerde yazmıyor"* diyor — yani defter
PARA ve SAĞLAYICI geçmişidir, teslimat deposu değil. Teslimat byte'ı D-248'in içerik-adresli
deposuna ait. Depo zaten 48 manifest'e karşı **yalnız 6** PNG izliyordu: PNG kuralın kendisi
değil istisnasıydı; tutarsızlık lehine değil aleyhine karar verildi.

⚠ **Kalan borç:** manifest slaytların YOLUNU ve boyutunu yazıyor ama **digest'ini yazmıyor**,
yani işaretçi doğrulanabilir değil. Bu, bu kararın kapattığı değil AÇTIĞI bir eksiktir ve
öyle kayda geçiyor. → FAZ-14.2 plan artefaktıyla birlikte kapanır.

**Geri alma maliyeti:** düşük — eleme yalnız yazma anında, okuyan hiçbir tüketici elenen
alanlara bakmıyor (`captions`, `fetchedAt`, `sourceRef`, `personalizationFields`).

## D-264 — Yuva bir POLİTİKA kararıdır, bir gözlem değil

**Tarih:** 2026-08-17 · **Bağlam:** FAZ-14.3 · §7.1

Hattın sırasını çevirdim — `kompozit` artık `gorsel-uret`ten ÖNCE koşuyor, böylece brief
gireceği yuvayı görerek yazılıyor. Sıra değişince plan **kendi kuyruğunu ısırdı**:
`tasarla` yuvayı `gorselVar: gorsel !== null` ile açıyordu, yani *"ortada üretilmiş bir
görsel var mı"* diye soruyordu. Ama görsel artık plandan SONRA üretiliyor. Plan, kendi
tetiklediği şeyin varlığını ön koşul sayıyordu: yuva hiç açılmaz, brief hiç yazılmaz,
görsel hiç üretilmezdi. Test bunu ilk koşuda yakaladı — `expected '' to contain …`.

**Yanlış olan sıra değil ÖNCÜLDÜ.** Yuvanın var olup olmayacağı bir gözlem değil bir
karardır: *"bu karosel bir fotoğraf taşımalı mı?"* Bunu görselin kendisi cevaplayamaz.
`yuvaIstendi` artık hattın (ileride kompozisyon ailesinin, FAZ-12.7) verdiği bir politika
ve plan yalnız gerekçesini yazıyor.

⚠ **Bu D-261'in kardeşi ve aynı sınıf.** Orada fotoğraf "bağlı olan tek görsel yol"
olduğu için kullanılıyordu; burada plan, görselin varlığını kendi kararının girdisi
sanıyordu. İkisi de *"neden bu öge burada?"* sorusunun cevabının bir tesadüf olmasıydı.

**Yan kazanç — üretim artık KOŞULLU.** Plan yuva işaretlemezse `gorselBriefPromptu` `null`
dönüyor, brief üretilmiyor, `gorsel-uret` besinsiz kalıyor. Koşucuya "adım atla" yeteneği
EKLENMEDİ; zincir kendiliğinden sönüyor. *"Her ihtimale karşı bir görsel üret"* hem kota
hem marka tutarlılığı kaybıydı.

**Geri alma maliyeti:** düşük — `gorsel_yuvasi: true` hat kısıtı bugünkü davranışı koruyor.

## D-265 — Yavaşlığın nedeni tahmin edildi; ölçüm tahmini çürüttü

**Tarih:** 2026-08-17 · **Bağlam:** R-78 · R-79 · R-80

Önce tahminle cevap verildi: *"her adım 1500 testi birkaç kez koşuyor, kazanç testleri
daraltmakta."* Ölçüldü, tahmin çürüdü:

| Ölçülen | Sonuç |
|---|---|
| `vitest run` (1511 test) | **11.0 sn** — darboğaz değil |
| `just check` | **40 sn** duvar / 115 sn CPU · 43 kapının 42'si `fast` |
| En pahalı beş kapı | tests 11.5 · format 8.7 · lint 7.0 · cli-duman 5.2 · types 4.3 |
| Commit başına üretim kodu | 310 → 266 → **86** satır (15 → 16 → 17 Ağustos) |

Tahmin uygulansaydı en ucuz koruma (11 sn) kesilir, gerçek maliyet yerinde kalırdı.
Tur sayısı düşmemişti (101 · 107 · 70 commit) — düşen **turun kod içeriğiydi**.
Zaman adım başına ~6 tam doğrulama turuna gidiyordu; R-79 bunu ~1.5'e indiriyor.

**Ölçümün yan bulgusu:** `vitest run` tek başına çıkış kodu 1 verdi ("Worker exited
unexpectedly", 1511 testin 161'i hiç koşmadı), aynı paket `just check` içinde yeşil
geçti. Test kapısı bugün bazen 1350 bazen 1511 test koşuyor ve ikisinde de yeşil
raporlayabiliyor — hem yeniden koşum (hız) hem yalan yeşil (güvenlik). → R-80

**Kesilmeyecekler — bilerek.** Gerçek uçtan uca koşular (~300 sn), ihlal turu (R-71) ve
çıktıya gözle bakmak. FAZ-14'ün dört kusurundan üçü metrikler yeşilken, yalnız gerçek
çıktıya bakınca çıktı.

⚠ **Asıl gecikme kurallar değildi.** Bu turdaki üç büyük kayıp, üç kez öncülün yanlış
çıkmasıydı (D-264 · D-259 · D-260). Çaresi daha az doğrulama değil, baştan daha dikkatli
düşünmek. R-78…R-80 tekrarı kesiyor, düşünmeyi değil.

**Geri alma maliyeti:** sıfır — hiçbir kapı gevşetilmedi, hiçbir test silinmedi.

## D-266 — Dört bloke adım karara bağlandı: biri kapandı, üçü TETİKLEYİCİ aldı

**2026-08-17.** FAZ-11'in dört adımı (`11.5` `11.6` `11.9` `11.10`) günlerdir
`bloke: karar` duruyordu ve hiçbiri karara bağlanmamıştı. **Kararsız bir blokaj bir karar
değil, bir erteleme borcudur:** her turda okunur, her turda atlanır ve planı yavaşça
gerçeklikten koparır. LOOP§A tam yetki veriyor; kullanılmayan yetki de bir seçimdir.

| Adım | Karar | Gerekçe |
|---|---|---|
| `11.10` illüstrasyon kütüphanesi | **KAPATILDI — yapılmayacak** | §11.3 onay ima eden yapay insanı yasaklıyor; kalan (soyut/şematik) alt kümeyi 20 ikon + 5 süsleme + akış diyagramı zaten dolduruyor. Dışarıdan varlık + lisans metni indirmek §16 kurtarma yükü ekler (R-75). |
| `11.9` yerel raster | **YARISI ÇÖZÜLDÜ, yarısı ertelendi** | Upscale yumuşaması `feConvolveMatrix` keskinliğiyle **bağımlılıksız** çözüldü (FAZ-12.2, kenar enerjisi 2,04 → 2,36). Akıllı kırpma ve arka plan silme ertelendi. |
| `11.5` arka plan silme | **ERTELENDİ, tetikleyicili** | ~1 GB ağırlık + §16 sınavı. Tetikleyici: gerçek bir koşuda fotoğrafın arka planı alanla çarpışsın **ve** duotone (FAZ-11.7) bunu çözemesin. Bugüne kadar olmadı. |
| `11.6` taban → model (img2img) | **ERTELENDİ, tetikleyicili** | Sıralama yarısı FAZ-14.3'te zaten teslim edildi (taban önce, model sonra). Kalan yarı yeni bir ücretli sağlayıcı yolu. Tetikleyici: 20 kabul koşusunda kompozisyon körlüğü baskın kusur kaynağı çıksın. Görsel üretimi artık **koşullu** (D-264) ve çoğu koşuda hiç çalışmıyor — adımın yazıldığı andaki öncül zayıfladı. |

**Ortak ilke:** üçü de dış kaynak (ağırlık indirme, ücretli yol, varlık + lisans) istiyor;
D-157 bunları `insan` sınıfı sayıyor ve LOOP§G üçlü kuralına saymıyor — **plan hatası
değiller.** Ama sınıflandırmak karara bağlamak değildir. Her birine bir tetikleyici
yazıldı: blokaj artık "bir gün bakarız" değil, **gözlenebilir bir koşul**.

⚠ **Erteleme geri alınabilir, kapatma da.** `11.10` bir talep gelirse yeniden açılır —
ama talep bir sezgi değil, bir referans örnek ya da bir kabul koşusu bulgusu olmalı.

**Geri alma maliyeti:** sıfır — hiçbir kod yazılmadı, hiçbir bağımlılık eklenmedi.

## D-267 — Kalan iki bloke adım da tetikleyici aldı; kararsız blokajla faz kapanmaz

**2026-08-17.** D-266 FAZ-11'in dört adımını karara bağladı ama `12.8` ve `13.3` aynı
durumda bırakıldı — ve 2. doğrulama turu haklı olarak bunu yakaladı: **kendi yazdığım
ilkeyi bir sonraki dosyada uygulamamıştım.** Bir kuralı bir yerde uygulayıp komşusunda
uygulamamak, kuralı olmamasından kötüdür (bu turda üçüncü kez).

| Adım | Karar | Tetikleyici |
|---|---|---|
| `12.8` `sharp`/Lanczos | **ERTELENDİ** | Upscale yumuşaması FAZ-12.2'de `feConvolveMatrix` ile **bağımlılıksız** çözüldü (kenar enerjisi 2,04 → 2,36). Kalan: gerçek yeniden örnekleme + EXIF temizliği. Tetikleyici: `keskinlik` sonrası bir koşuda örnekleme kaybı GÖRÜNÜR olsun, ya da EXIF taşıyan bir kaynak fotoğraf hatta girsin. Bugün model çıktısı PNG ve EXIF yok. |
| `13.3` vektörleştirme | **ERTELENDİ** | Gerekçesi renk sapmasıydı; duotone (11.7) sapmayı YAPISAL olarak kapatıyor ve ölçüldü: doygun bir test görselinde ortalama ΔE **12,79 → 8,19**. Üstelik bugün bedava şeritte görsel sağlayıcı YOK — vektörleştirilecek model çıktısı da yok. Tetikleyici: ücretli görsel şeridi açılsın **ve** duotone'un yetmediği ölçülsün. |

⚠ **Blokajı sınıflandırmak karara bağlamak değildir.** `bloke: karar` bir etiket; karar,
adımın hangi gözlenebilir koşulda yeniden açılacağını yazmaktır. Etiket kalırsa plan her
turda okunur, her turda atlanır ve sessizce gerçeklikten kopar.

⚠ **`durum` kapısı bunu göremiyor** ve görmesi de beklenmemeli: yalnız DURUM→FAZ yönünü
doğruluyor, `bloke` sınıfları `insan|teknik`. `karar` üçüncü bir sınıf değil — D-157'nin
`insan` sınıfının alt kümesi (dış girdi: para, ağırlık, lisans). İkisi de artık
DURUM.md'nin `bloke` dizisinde `insan` olarak duruyor.

**Geri alma maliyeti:** sıfır — hiçbir kod yazılmadı, hiçbir bağımlılık eklenmedi.

