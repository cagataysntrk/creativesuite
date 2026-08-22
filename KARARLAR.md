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

## D-305

**İki kalite ölçüsü de kökünden düzeltildi: biri eskimişti, öteki bütçesizdi.**

**`matlama-tutmuyor` yanlış şeyi ölçüyordu.** Kural luma-anahtarı döneminde yazıldı:
o zaman arka planı kesmenin tek yolu koyu zemini CSS filtresiyle şeffaflaştırmaktı ve
"köşe parlaklığı" doğru vekildi. Sonra hatta gerçek arka plan silme (rembg) girdi;
görseller artık RGBA geliyor, köşeler ŞEFFAF. Ama ölçüm alfa kanalını hiç okumuyordu
(`d[i+3]` yok) ve şeffaf pikselin ALTINDAKİ RGB çöp değerini parlaklık sayıyordu.
Gerçek bir koşuda köşe parlaklığı 38/255 ölçüldü ve kusur bildirildi — oysa kesim
zaten tutmuştu. **Tekniği değiştirdik, ölçüsünü değiştirmedik.** Artık önce alfa
bakılıyor: köşe şeffafsa (alfa < 16/255) iş bitmiş demektir; opaksa luma eşiği devreye
giriyor.

**`punto-cokmesi` bir bütçe eksikliğiydi.** Gerçek bir koşuda model "Karşılaştırma"
(13 harf) yazdı; o kartın başlığı 88 px'e sığdı, öteki üç kart 149 px'deydi. Punto TÜM
panorama için tek — **bir kelime dört slaydın tipografisini birden düşürüyor.** Sebep
yapısal: Türkçe eklemeli, uzun kavramlar tek kelimede toplanıyor.

**Bütçe elle SEÇİLMEDİ, şablondan OKUNDU.** Taslaklar elle kuruldu ve sığdığı görüldü;
en uzun başlık kelimesi altı şablonda 7–11 harf. Yani sınır zaten tasarımın içinde
yazılı. Sabit bir sayı yazmak altı farklı kolon genişliğine tek cevap vermek olurdu;
`sahne` 12'ye izin verirken `editoryal` 8'de kalıyor ve ikisi de kendi tasarımının
söylediği şey. +1 tolerans bir Türkçe ekine pay bırakıyor.

İstem bütçeyi açıkça yazıyor, `uyarla` aşanı reddediyor — yalnız reddetmek modeli her
koşuda aynı duvara çarptırıp bir tur yakardı.

## D-306

**Numaralı rozet silindi — elle çizilmiş jenerik öge, sıfır üretim yolu.**

`.madalyon-no`: 46 px'lik, 2 px kenarlıklı, içinde numara duran bir daire. Depo
sahibinin *"şu aptal dairemsi renkli topları kaldır, bunlar web tasarım duruyor"*
dediği sınıfın tam örneği ve R-81'in birebir hedefi (rozet).

**Üretim yolu YOKTU.** `bant.tip: 'kemer'` varyantına aitti; altı şablonun hiçbiri
`kemer` kullanmıyor, altısında da `madalyon` dizisi boş. Yani kural ihlali ile ölü kod
aynı satırdaydı.

**Kemerin kendisi kaldı.** Yay bir KOMPOZİSYON ögesi — tuvali bölen bir çizgi, süs
değil. Silinmesi gereken şey, o yayın üstüne oturtulan rozetti.

**`.kilometre-nokta` (13 px) KALDI ve kalmalı.** O bir süs değil, veri eğrisi üstünde
bir kilometre taşını işaretliyor — R-81'in veri görselleştirmesi istisnası. `panorama.ts`
şimdi üç `border-radius: 50%` taşıyor: ikisi `donen` şablonunun daire KIRPMASI (içi
fotoğrafla dolu), biri bu nokta.

Kapı tavanı 4'ten **3'e indirildi** — gevşetme değil sıkma; sahte bir rozet eklenince
kırmızıya dönüyor (denendi).

## D-307

**Hazır tasarım editörü ana düzenleme döngüsüne girmiyor; Penpot tek yönlü rötuş
kulvarı olarak açık kalıyor.**

Depo sahibi Canva'yı ve genel olarak hazır bir açık kaynak editörü sordu. Adaylar
ölçüldü: **Polotno** (SDK ticari lisans), **tldraw** (özel lisans, filigran/ücret),
**Fabric.js / Konva** (MIT ama editör değil, kütüphane — editörü yine biz yazarız),
**Penpot** (MPL-2.0, self-host, gerçek özgür yazılım).

**Ortak ve belirleyici sorun lisans değil, VERİ MODELİ.** Hepsi şekil/piksel düzenliyor;
bizim editör `KatalogOrnegi` ALANLARINI düzenliyor. Bir slaydı Canva'da ya da Penpot'ta
güzelleştirmek o güzelliği **bir sonraki konuya taşımaz** — şablon mantığı (Yasa 13)
çöker, çıktı veriden yeniden üretilemez olur (Yasa 11) ve ikinci bir render motoru
doğar (Yasa 4). Katalog merkezli üretimin tamamı "bir kez mükemmelleştir, sonsuz kez
uygula" öncülüne dayanıyor; serbest tuval tam olarak bunu bozar.

**Maliyet karşılaştırması da aynı yöne bakıyor.** Depo sahibinin istediği yetenekler —
yazıyı taşı, ölçekle, tipografi, öge sil — bizim editörde birkaç yüz satır ve hepsi
veri modelinde kalıyor. Hazır bir editörü bağlamak bundan pahalı ve tekrar
kullanılabilirliği öldürüyor.

**Açık kalan kapı:** Penpot **tek yönlü dışa aktarım** hedefi olarak meşru. Tek bir
yayın için son rötuş isteniyorsa SVG verilir ve orada açılır; şablon döngüsü bizde
kalır ve geri okuma YOKTUR. Geri okuma eklenirse bu karar yeniden açılır.

## D-308

**Tekrar, seçicinin kusuru değil tasarım sonucuydu — düzeltmesi de tasarımda.**

Depo sahibi *"sistem önceki oluşturulanlardan FARKLI yeni bir tane planlasın"* dedi.
Defter ölçüldü: son ÜÇ karosel koşusunun **üçü de `sahne`** seçmiş ve konular
birbirinin kopyasıydı.

**Bu bir hata değildi.** Şablon seçimi içeriğin ölçülen şeklinden deterministik
çıkıyor (D-268): benzer konu benzer şekil verir, benzer şekil aynı şablonu seçer.
Doğru çalışan bir seçici, tek başına bırakıldığında aynı tasarımı sonsuz kez üretir.
Kusur seçimde değil, seçimin **geçmişi görmemesindeydi**.

**Rastgelelik EKLENMEDİ** (R-06). Kural kayıttan: son üç koşuda kullanılmış bir
şablon, **başka uygun aday varsa** eleniyor. "Uygun" demek `puan > 0`, yani eleme
zaten geçilmiş — çeşitlilik uğruna kötü bir şablon seçmek mümkün değil. Başka aday
yoksa tekrar meşrudur: içerik gerçekten tek bir şablona uyuyor demektir. Seçim
gerekçesi elemeyi **yazıyor**; sessiz bir sapma, açıklanmış bir sapmadan kötüdür.

**Geçmiş PLANA DONUYOR, çalışma anında okunmuyor.** Seçim anında diskten okumak,
aynı planın iki farklı zamanda iki farklı tasarım üretmesi demekti ve `R-07`'yi
(plan dondurulur) bozardı. `just uret` geçmişi okuyup `son_kullanilan` kısıtına
yazıyor; defter neyi gördüyse onu saklıyor ve replay aynı sonucu veriyor.

⚠ Sıralama dosya ADINA göre, `mtime`a göre değil: `run_<uuidv7>` zaman-sıralı bir id
taşıyor. Bir defterin kopyalanması ya da dokunulması `mtime` sırasını bozar ve
"son üç koşu" başka bir şey olurdu.

## D-309

**İçerik çeşitliliği ÜSLUPLA istenmiyor, sayılabilir bir biçim kuralıyla isteniyor.**

D-308 şablon seçimini geçmişe duyarlı yaptı ve dikişi test edildi — ama üretimde
tekrar sürdü. Sebep ölçüldü: kısıt gövdeye ULAŞTI, kural doğru davrandı (eleme
yalnız başka uygun aday varsa uygulanır) ve o içeriklerde başka aday YOKTU, çünkü
`metin-uret` konudan bağımsız hep aynı şekli üretiyordu.

**İki yaklaşım denendi, ikisi de gerçek koşuda tutmadı** (LOOP§G):

1. **Ritim menüsü** — "son karoseller şu biçimlerdeydi, bu sefer başka bir ritim kur,
   örneğin şunlar". Model her koşuda en kolayını, yani zaten bildiği düz anlatıyı
   seçti. Bir seçenek listesi bir talimat değildir.
2. **Tek hedef + "bu bir öneri değil"** — kaçış kapısı ("konu izin vermiyorsa
   zorlama") daraltıldı ama çıktı yine anlatı oldu.

**Ortak sebep: ikisi de ÜSLUP tarif ediyordu.** Üslup ölçülemez; model kendi
ürettiğinin o üsluba uyduğunu sanabilir ve kimse aksini söyleyemez.

**Üçüncü yaklaşım — ritmin MEKANİK karşılığı.** "2. satırdan itibaren her satır
`1.` `2.` `3.` ile BAŞLAYACAK" bir üslup değil, sayılabilir bir sözleşme; `sablonSec`
zaten tam bunu ölçüyor. Aynı ders bu depoda uyarlama isteminde de çıkmıştı: şemayı
yazmadan uyulmasını beklemek, kuralı koymadan ihlali cezalandırmaktır.

⚠ Sayısal ritmin kaynağı kısıtlı: sayılar yalnız MARKA BİLGİSİ'nde geçenlerden
alınabilir. Kaynakta olmayan bir sayıyı uydurmak Yasa 8 ihlalidir ve çeşitlilik
uğruna bir yasa çiğnenmez.

## D-310

**Beyaz listeyi yorum korumuyor, kapı koruyor.**

`run.ts`teki `DEFTER_ANAHTARLARI`, listede olmayan her çıktı alanını sessizce atıyor.
Bu **altı kez** tekrarladı: `tasarimPlani` · `digests` · yargı çıktıları (`puanlar`
`toplam` `bulgular` `reddedilen`) · ritim ölçümü. Her seferinde kod doğruydu, testler
yeşildi ve defter boştu; hata ancak gerçek bir koşunun defterini **elle okuyunca**
görünüyordu.

⚠ Listenin KENDİ yorumu *"eksik bir beyaz liste sessiz bir körlüktür"* diyor. O cümle
yazılırken bile liste bir sonraki alanı elemeye hazırdı. **Yorum altı kez yetmedi.**

**Beyaz listeyi kaldırmak çözüm değil.** Defterin küçük kalması ölçülmüş bir gereklilik:
gömülü font ve görsel data URI'siyle bir manifest 580 KB'a çıkmış ve R-64'ün 512 KB
tavanını aşmıştı. Sorun listenin varlığı değil **sessizliği**.

**Kapı sessizliği kaldırıyor:** bir anahtar ya defterde olur ya envanterde gerekçesiyle
dışarıda. İkisi de değilse kapı kırmızı ve anahtarı ADIYLA söylüyor.

⚠ **Kapı yazılır yazılmaz on alan daha çıktı** ve içlerinde yayın kanıtı vardı:
`published` (kanal id'si), `proposedAt`, `quotaBefore`. Yayınlanmış bir varlığın kanal
id'sinin defterde olmaması, R-46'nın (körlemesine tekrar yok, önce mutabakat)
dayanacağı kaydın hiç yazılmaması demekti. Yedisi deftere alındı; üçü (`records`,
`assets`, `gorselliSlaytlar`) yük oldukları için gerekçeyle dışarıda.

⚠ Kapının kendi sınırı yazılı: yalnız `data: { … }` sözlük anahtarlarını ve o bloktaki
`...yardimci(…)` yayılmalarının dönüş tipi anahtarlarını görüyor; dinamik anahtar
göremez. Görülmeyen bir sınır, olmayan bir sınır sanılır.

## D-311

**Görünür AI ifşası her slaytta ve ÖLÇÜLEREK.**

`publish.ts` ifşa gereken bir varlıkta iki kanıt arıyor: makine-okunur damga
(`stamped`) ve kreatifin üstünde görünür ifşa (`visibleDisclosure`). İkincisini
üreten hiçbir kod yoktu. Sonuç panelde ölçüldü: **130 varlığın 130'u
"yayınlanamaz"**, sebep `ifsa_eksik`. Kapı doğru çalışıyordu; üretim eksikti.

**Her slaytta.** Bir karoselin tek slaytı paylaşılabiliyor ve izleyici hangi slaytta
model görseli olduğunu bilemez; ifşayı yalnız kapağa koymak, paylaşılan slaytı
ifşasız bırakırdı. Şerit künye bandında (`.ray`), fotoğraf kredisi gibi — görünür
olmak zorunda, tasarımı bozmak zorunda değil.

**Bayrak belgeye `yuva-doldur`da giriyor**, hat düzeyinde bir parametreden değil:
hat görsel üretebilir ama o koşuda anahtar yoksa hiç üretmemiş olabilir. Doğru
kaynak, belgeye gerçekten görsel GİRMESİ.

**İfşa iddia edilmiyor, ölçülüyor.** `visibleDisclosure: true` yazan bir sidecar,
kimsenin bakmadığı bir kutucuğun işaretlenmesidir — bu deponun `dayanaksiz` dediği
şeyin ta kendisi (D-23). Denetim DOM'da bakıyor: şerit her slaytta var mı, boyutu
sıfır mı, gizli ya da saydam mı. Üç ölçüt birden; biri düşerse `ifsa-gorunmuyor`
kusuru doğuyor ve sidecar `false` yazıyor.

⚠ **Panel "gerekli" ile "eksik"i karıştırıyordu:** `disclosureRequired === true`
görünce doğrudan `ifsa_eksik` diyordu, yani ifşanın yapılıp yapılmadığına hiç
bakmıyordu — çünkü o veri hiç yoktu. Artık iki kanıt aranıyor.

⚠ Kalan sıra sorunu D18 olarak `docs/BORCLAR.md`'de: damga koşudan sonra basılıyor,
`PUBLISH` ise koşunun içinde.

## D-312

**Ayrımı tipografi değil İSKELET kuruyor.**

Depo sahibi "yedi tasarım değil tek tasarımın yedi boyası" demişti ve bunun için bir
test yazılmıştı: her şablon KENDİ tipografi reçetesini taşıyor. Test yeşildi. Izgaraya
yeniden bakıldı — hâlâ aynı görünüyorlardı. Ölçüldü: **altı şablonun BEŞİ birebir aynı
öge envanterini taşıyordu** (`elYazisi + ustBaslik + baslik + govde`), yani punto
farklıydı, KOMPOZİSYON aynıydı. *Ölçülmeyen şey, olmayan şeydir* — ama yanlış şeyi
ölçen bir test, olmayan bir şeyi var sanmaya da yol açar.

**Sebep bir sözleşmedeydi:** `uyarla`, HER kartta boş olmayan bir üst başlık şart
koşuyordu. Bir doğrulama kuralı, bir tasarım kararını evrenselleştirmişti. Kural artık
şablona bakıyor — `hayalet` için verilmiş D-299'un aynısı: **ögenin var olup olmadığına
şablon karar verir, model yalnız doldurur.**

**Envanter çeşitliliği görsel ayrımın VEKİLİ DEĞİL — bu bir denemeyle öğrenildi.**
İlk hamle `memphis`ten el yazısını silmekti; bakıldı ve şablon ayırt edici değil
SIRADAN oldu. Öge silmek bir kompozisyon kararı değil, bir eksiltme. `memphis` yerine
çapa değiştirdi (`ust` → `alt`): üstte büyük boşluk, soru dibe çakılı — bir afiş.
`editoryal` ise gerçekten eksiltmeyi hak ediyordu: dergi kapağı az ögeyle konuşur,
etiket eklemek onu sunum slaytına çevirir.

Ölçüm artık İSKELET = öge envanteri + dikey çapa. Altı şablonun en az dördü farklı
iskelet kurmalı; ikisinin aynı iskeleti iki farklı tipografik sesle kullanması meşru.

⚠ Yan kazanç: "her kartta üst başlık var" testi, bazı kartlarda olup bazılarında
olmayan bir şablonu GEÇİRİYORDU. Yeni kural (ya hepsinde ya hiçbirinde) onu yakalıyor.

## D-313 · "çalışan" deseni ÇEKİMLİ hâllere daraltıldı (2026-08-22)

**Bağlam.** Panelden koşan bir karosel, damgalama adımında düştü:

```
✗ uyum iddiası kurulamadı:
  {"refusal":{"kind":"prompt_requests_person","matched":"çalışan"},"rule":"R-33"}
```

Konu **"UpcyMan: çalışan üretim altyapısı"** idi — markanın KENDİ kayıt başlığı.
Buradaki *çalışan* "çalışmakta olan" demek; personel değil. R-33'ün Türkçe deseni
(`\bcalisan\w*`) eş sesliyi ayırt edemiyordu ve sonuç: **hattın asla üretemeyeceği bir
konu.** Kusursuz bir karosel, sıfır kusurla, yayına gidemeden öldü.

**Karar.** Desen yalnız ÇEKİMLİ hâlleri arıyor: `çalışanlar`, `çalışanı`, `çalışanın`,
`çalışanımız`… Türkçede *çalışan* sıfat olarak isimden önce gelir ve ek almaz
("çalışan üretim"); isim olarak çekim eki alır. Ayrım dilin kendi yapısında.

**Neden koruma zayıflamadı.** `işçi`, `mühendis`, `operatör`, `insan`, `kişi`, `müşteri`,
`portre`, `gülümseyen` desenleri yerinde; İngilizce tarafta `worker|employee|staff|crew`
duruyor. Kaybedilen tek şey bir sıfatın insan sanılması. Aynı turda `personel` deseni
EKLENDİ — listede hiç yoktu ve "personel toplantıda" kapıdan geçiyordu; eksikliği bir
karar değil bir boşluktu.

**Kalan borç.** Bu tarama hâlâ KONUYU okuyor, gerçek görsel prompt'unu değil: hiçbir hat
`prompt` kısıtı yazmıyor ve asıl istem `gorsel-brief` adımının çıktısında yaşıyor.
Yani R-33 bugün bir VEKİL üzerinden çalışıyor. Doğru kaynak brief çıktısı — ama katalog
varyantları bilerek insan figürü istiyor (T4 · T10) ve o kaynağa geçmek, "kesik özne"
tasarım kararıyla R-33'ü karşı karşıya getirir. Bu bir POLİTİKA sorusu ve insanın
kararı: `docs/BORCLAR.md` D22.

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
