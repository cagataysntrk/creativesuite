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

## D-290

**Karar:** `just sablon-al <dosya>` — Photoshop tasarımını ÖLÇEN araç. PSD'de katman
adları, kutular, metin içeriği ve punto doğrudan okunuyor (`ag-psd`, MIT); düz görselde
yalnız palet kümeleniyor. Çıktı bir şablon DEĞİL, bir ölçüm.

**Neden:** depo sahibinin isteği: *"sana Photoshop'ta yaptığımız bir tasarımı atınca çok
hızlı şekilde mükemmelce onu burada şablona aktarabilmelisin."* Bugüne kadar her şablon
bir referans GÖRSELİNE bakılarak elle ölçüldü; kadraj bölünmesi, kutular ve tip ölçeği
göz kararıydı ve her turda birkaç yanlış tahminle düzeltildi (`editoryal`in üç temel
kararı da tersti). Tasarım bir PSD ise bu bilgilerin hepsi zaten DOSYADA yazılı.

⚠ ⚠ **İKİ GİRDİ, İKİ GÜVEN SEVİYESİ ve araç bunu SÖYLÜYOR.** PSD'de okunanlar
tasarımcının kendi kararları; düz görselde yalnız palet çıkarılabiliyor ve metin kutusu
tahmini KASTEN yapılmıyor — yanlış bir kutu, kutu olmamasından kötü. "Ölçüldü" ile
"tahmin edildi" karışırsa araç zararlı olur.

⚠ ⚠ **SIFIR BOYUTLU KATMAN SESSİZCE ATILMIYOR, SAYILIYOR.** İlk sürüm `continue` diyordu
ve test PSD'sinde HİÇBİR ÖGE listelenmedi; araç "0 öge" deyip geçti. Gerçek bir dosyada
ayar katmanları ve maskeler de böyle kaybolurdu. **Bir ölçüm aracının en kötü davranışı,
ölçemediğini ölçtü sanmaktır.** Metin katmanı boyutsuz olsa bile listeleniyor: içeriği ve
puntosu tasarımın kararı.

⚠ Palet KÜMELENİYOR (medyan-kesme, 8 küme). Ham sayım referansın neredeyse aynı sekiz
nane tonunu SEKİZ AYRI renk sayıyor ve palet hiçbir şey söylemiyordu: tasarımın gerçek
rengi bir DEĞER değil bir KÜME.

⚠ Gömülü Python bir JS şablon dizesinin içinde: **ters tırnak kullanılamaz**, dizeyi
kapatıyor. İlk sürüm bir yorumdaki `` `quantize` `` yüzünden derlenmedi.

**Kanıt:** sentetik bir PSD yazılıp okundu — 4320×1350'den 4 slayt çıkarıldı, katman
grupları (`metin / baslik`), metin içeriği, punto (96/34) ve tip ölçeği oranı (2,8)
raporlandı; ölçülemeyen iki katman ayrıca bildirildi.

**Geri alma maliyeti:** düşük — bir script, bir `just` girişi, bir dev bağımlılık.

## D-291

**Karar:** 3B öge kaynağı TÜRE GÖRE ikiye ayrılıyor — **NESNE** ise hattın kendi görsel
modeli üretir (bedava, markaya özgü, sonsuz çeşit); **SOYUT SEMBOL** ise küratörlü bir
setten gelir. Aday setler ölçüldü: **3dicons** (CC0, 100+ 3B ikon) ve **Fluent Emoji**
(MIT, Microsoft) — ikisi de gerçek 3B render, kod değil.

**Neden — ve bu bir tercih değil, bir ÖLÇÜM sonucu.** Üç 3B brief'i gerçek sağlayıcıya
gönderildi (clay render · izometrik · yumuşak gölge · düz siyah zemin):
- **kutu** → mükemmel: doğru malzeme, doğru temas gölgesi, referanstaki "3d element"
  görünümünün ta kendisi.
- **geri kazanım döngüsü** → yakın ama geometrisi kusurlu; model soyut sembolü tam kuramıyor.
- **dişli** → tamamen başarısız (17 KB siyah kare).
Yani model NESNEDE güçlü, SEMBOLDE zayıf. Tek kaynağa bağlanmak ikisinden birini bozardı.

⚠ ⚠ **LUCIDE BU BOŞLUĞU KAPATMIYOR ve depo sahibi bunu doğru gördü.** Lucide bir ARAYÜZ
ikon seti: ince, tek kalınlıkta kontur, ekran için tasarlanmış. Liste satırlarında doğru
(onlar zaten arayüz ritmi) ama referanslardaki dil o değil — 3B render ürün, el çizimi
fırça, botanik illüstrasyon. **Elle çizimden kurtulmak (D-289) gerekliydi ama yeterli
değil:** ikon seti değiştirmek "web gibi durma" sorununu çözmüyor, yalnız en kaba
belirtisini alıyor.

⚠ Model üretimi hattın MEVCUT yeteneği: `gorsel-uret` + `gorsel-kirp` zaten var, yani
3B nesne için yeni bağımlılık YOK. Küratörlü set ise ayrı bir kurulum kararı — hangi
sembollerin gerçekten gerektiği ölçülmeden yapılmamalı (yirmi ikonun kaçı 3B olmalı?).

**Geri alma maliyeti:** yok — bu tur yalnız ölçüm ve karar; kod değişmedi.

## D-292

**Karar:** Panel ölçeği reçeteye bağlandı (`panelPayi`) ve yeni bir denetim kusuru geldi:
**`sus-baskin`** — hayalet, içeriğin (başlık + gövde + panel + GÖRSEL) toplamını aşarsa
kusur. `veri-hikayesi` 2,1 · `memphis` 1,7 aldı; `akan-alan` hayaleti 1,62 → 1,34 indi.

**Neden — ve bu turun en önemli ölçümü bu.** "Hangi ikon kütüphanesi" sorusunu
kovalarken önce ikonların NEREDE kullanıldığı ölçüldü: yalnız `liste` panelinde, yani
katalogun **30 slaydından 2'sinde**. Yatırım oraya değildi. Asıl soru "paneller nasıl
duruyor" idi ve cevap ezici:

| | kart alanı |
|---|---|
| Panel (verinin kendisi) | **%0,9 – 4,9** |
| Başlık | %3 – 10 |
| Hayalet (süs) | **%22 – 26** |

**Süs, verinin beş ilâ yirmi beş katıydı.** `veri-hikayesi` — adı üstünde VERİ şablonu —
kartlarında ekrandaki en büyük şey dekoratif bir gri rakamdı. Depo sahibinin *"web
tasarımı gibi duruyor, aşırı bilgisayar işi"* tespitinin sayısal karşılığı tam olarak bu:
hiyerarşi ters.

⚠ **Panel sabitleri WEB ölçüsündeydi:** `.liste-ad` 22px, `.etiket` 18px, vafel 300px.
1350px'lik bir tuvalde 22px, yüksekliğin %1,6'sı. Bir gönderi tuvali ekran değildir ve
ekran ölçüsü orada "bilgisayar işi" gibi durur. Tek çarpan tüm paneli büyütüyor; ayrı
ayrı büyütmek panelin iç ritmini (rehber §3, 1:3) bozardı.

**Ölçülen sonuç:** panel %0,9–4,9 → **%3,9–25**. Altı şablonun altısında `sus-baskin`
temiz. `48%` / `23%` gibi sayılar artık kahraman.

⚠ ⚠ **KURALIN İLK SÜRÜMÜ GÖRSELİ İÇERİK SAYMIYORDU** ve tam olarak görsel sürücü
şablonlarda (`sahne`, `donen`, `editoryal`) yanlış çalışıyordu: orada asıl içerik
fotoğraf, metin ona eşlik ediyor. Görseli dışarıda bırakan bir "içerik" tanımı fotoğrafı
SÜS sayar. Görseller kartın dışında ayrı katmanda (kesimi aşabilsinler diye), o yüzden
kesişim hesaplanıyor. Düzeltmeden sonra 18 kusur → 1.

⚠ **Aynı ölçek her şablonda aynı anlama gelmiyor:** `akan-alan`ın ne paneli var ne
görseli, içerik yalnız iki metin bloğu; orada 1,62'lik hayalet baskın, ötekilerde değil.

⚠ Ölçüm aracı bir kez daha ters tırnak tuzağına düştü: denetim kodu bir JS şablon dizesi
İÇİNDE yaşıyor ve yorumdaki `` ` `` diziyi kapatıyor. Bu turda iki ayrı dosyada oldu.

⚠ **Bu kez gözüm yanıldı, araç değil:** `memphis` listesi taşıyor sandım, ölçüm taşma
yok dedi ve haklıydı — montajın kendi kırpmasıydı.

**Geri alma maliyeti:** düşük — bir CSS değişkeni, bir reçete alanı, bir denetim bloğu.

## D-293

**Karar:** Uyarlama isteminin çıktı sözleşmesi artık HER panel tipini tarif ediyor.
Katalogdaki her tip istemde geçmek zorunda; test bunu VERİDEN türeterek zorluyor.

**Neden:** Gerçek koşu `sablon-uyarla` adımında `ADAPTATION_UNPARSEABLE` ile durdu.
İstem *"panel taşıyan kartlarda `panel` alanını da yaz; tipi ŞABLONDAKİYLE aynı olsun"*
diyordu ama **panelin ŞEKLİNİ hiç söylemiyordu.** `veri-hikayesi`nin altı kartında BEŞ
farklı panel tipi var (`etiketler`, `cubuklar`, `sayilar`, `vafel`, `liste`) ve model
şekli uydurmak zorunda kalıyordu.

⚠ ⚠ **BU, AYNI HATANIN İKİNCİ YARISIYDI.** Çıktı sözleşmesi ilk sürümde HİÇ yazılmamıştı
ve iki koşu `ADAPTATION_UNPARSEABLE` ile durmuştu; o zaman kart alanları için şema
yazıldı ve dosyaya *"şema burada, örnekle birlikte"* diye not düşüldü. Panel için
yazılmadı. **Sözleşmenin bir yarısını yazıp öteki yarısını unutmak, hiç yazmamaktan daha
sinsi:** ilk yarı çalıştığı için sözleşme "var" sanılıyor.

⚠ **Şekil veriliyor, DEĞER verilmiyor.** Örnek panelin gerçek sayılarını basmak, başlıkta
olduğu gibi (D-288) kopyalamaya davet ederdi. Sayılar Kaynak metinden gelmeli.

⚠ Hata benim istem değişikliğimden (D-288) DEĞİL: şema eksikliği baştan vardı. Ama örnek
başlık metnini kaldırmak modelin tek yapısal çıpasını da aldığı için boşluk ölümcül hâle
geldi — **bir eksik, başka bir doğru değişiklik onu açığa çıkarana kadar sessiz kalabilir.**

**Kanıt:** `vafel` satırı şemadan silindi → test kırmızı ("panel tipi 'vafel' çıktı
şemasında tarif edilmemiş"); geri kondu → yeşil. Liste veriden türüyor, yeni bir panel
tipi kendiliğinden kapsanıyor.

**Geri alma maliyeti:** düşük — istemde on satır, bir test.

## D-294

**Karar:** Hayalet puntosu karakter SAYISINA değil çizilen GENİŞLİĞE bağlandı. Rakamlar
dar (0,58em), büyük harfler geniş (0,72em); hayalet bir slaydın en çok %86'sını kaplıyor.

**Neden:** Önceki kural (D-284) "üç karaktere kadar tam punto" diyordu ve `01` için
doğruydu — bir rakam DEV kalmalı, kompozisyonun parçası o. Ama model hayalete KELİME
yazınca `TEK` de üç karakter oldu ve **729 px**'e çıktı: bir slaydın tamamını kaplayıp
başlığın üstüne bindi. **Üç karakterlik bir kelime, üç karakterlik bir sayı değildir.**

⚠ ⚠ **BU TURDA EKLENEN DENETİM (D-292) KUSURU ÜRETİMDE YAKALADI.** Gerçek koşu
(`veri-hikayesi`, altı slayt): `sus-baskin` kart 4'te süs %41 · içerik %27 dedi ve
`kalite` `gecti: false` verdi. Kural, eklendiği turda kendi işini yaptı — bir denetim
kuralının değeri tam olarak bu: kimse bakmadan önce yakalaması.

**Ölçülen sonuç:** `01` 729px (değişmedi) · `TEK` 729 → 430 · `BAŞLA` 437 → 258 ·
`KARMAŞIK` 273 → 161.

⚠ Kesin font metriği KULLANILMADI ve gerekmiyor: aranan tek ayrım rakam ile harf.
Yaklaşık em genişliği bunu veriyor, ölçüm zinciri kısa kalıyor.

**Geri alma maliyeti:** düşük — tek fonksiyon.

## D-295

**Karar:** Marka paleti yeniden kuruldu — vurgu mavisi sakinleşti, zemin **eskitmeli
lacivert** oldu, amber yerini **bakır**a bıraktı. Sayaç etiketleri kaldırıldı, altı
şablona gren/vinyet ve kartlara inset ışık geldi, dev sayılarda tracking negatifleşti.

**Neden:** depo sahibinin tespiti — *"mavi çok cıvık ve palete uymuyor"*, *"arkaplanlar
aşırı düz ve tasarımı kötü, sade olsa da bir derinliği olmalı"*, *"bölüm 1 seri 1 soru 1
gibi sayaçlar hangi örnekte var?"*.

**Renk — logonun birebir rengi ŞART DEĞİLMİŞ.** `mavi-500` logodan birebir alınmıştı
(#0091ff, chroma 0,192). Büyük alanda cıvık duruyor ve paletin geri kalanını eziyordu:
**bir aksan rengi kadraj boyunca yayılınca aksan olmaktan çıkıyor.** Yeni değer
oklch(0.620 0.132 242) — aynı aile, doygunluk düşük. Siyah-beyaz logo her zeminle
uyduğu için birebir eşleşme bir zorunluluk değildi; adaylar RENDER EDİLİP karşılaştırıldı.

⚠ **Zemin ile vurgu artık AYRI basamaklar.** `--role-bg` vurgu rengini gösteriyordu;
şimdi `mavi-700` (eskitmeli lacivert). Derinlik tek renkle kurulamıyor — iki komşu tonun
farkından doğuyor. Ara basamaklar eklendi (`mavi-700`, `mavi-300`).

⚠ **Amber → bakır ve bu bir renk tercihi değil, bir DÜZELTME.** Token açıklaması amberi
zaten *"referans karosellerdeki sarının kardeşi"* diye tanımlıyordu: aksanımız markadan
değil STOK ŞABLONDAN gelmişti. Bakır, eskitmeli lacivertin sıcak karşıtı.

⚠ **Sayaç etiketleri (`BÖLÜM I`, `SERİ 02`, `SORU 03`) hiçbir referansta yok** — bir
sunum şablonunun dili, bir tasarımın değil. Sayfa numarasını alt ray zaten veriyor ve
aynı bilgiyi iki kez basmak imzayı zayıflatıyor. Üst başlık artık kartın KONUSUNU
söylüyor.

⚠ **Gren aynı güçte olamaz:** koyu zeminde 18–22, açık zeminde 12–16. Düz bir dijital
alan her zaman dijital görünüyor; doku gözün "bu bir yüzey" demesi için gereken tek şey.

⚠ **Inset ışık renkleri karttan TÜRÜYOR** (`--kart-metin`), sabit beyaz değil: kâğıt
zeminde beyaz ışık görünmez. Aynı hata sınıfı on altı sabit `rgba(255,255,255)` ile
yaşanmıştı.

**Geri alma maliyeti:** orta — token değerleri, bir yeniden adlandırma, altı şablon alanı.

## D-296

**Karar:** Display yüzü **Bricolage Grotesque** (OFL) oldu; vurgu rengi ayrı bir role
(`role.vurgu`) taşındı.

**Neden — yüz:** depo sahibinin tespiti: *"font çok temiz, karakteri az — system UI /
Inter ailesi hissi var"*. Archivo teknik olarak doğruydu (değişken genişlik, geniş
latin-ext) ama **tarafsızdı**: bir arayüz grotesk'i, bir tasarımın sesi değil. Adaylar
yan yana RENDER EDİLDİ; Bricolage'ın terminalleri ve sıkı ritmi kadraja karakter veriyor.
Türkçe kapsaması çizdirilerek doğrulandı (`ğ ü ş ı İ Ö Ç`).

⚠ **Genişlik ekseni DARALDI: 62–125% → 75–100%.** Aralık dışı bir `wdth` tarayıcıda
SESSİZCE kırpılır: `ustGenislik: 118` yazan bir reçete 100 çizer ve reçete yalan
söylemeye başlar. Altı şablonun değerleri oranla taşındı, göz kararıyla değil.

⚠ ⚠ **VURGU, ZEMİNİN KENDİSİYDİ — ve zemini koyulaştırınca vurgu da koyulaştı.**
`AKSAN = var(--role-bg)` yazıyordu. D-295 zemini eskitmeli lacivere indirdi ve mürekkep
zemin üstünde 0,408 açıklıkta bir mavi GRİYE kaçtı: render'a bakınca "iki katına",
"sorun", "koyu" kelimeleri okunmuyordu. **Zemin büyük alan içindir, vurgu okunmak
içindir; ikisi aynı değer olamaz.** Yeni rol `role.vurgu` = `mavi-300`.

⚠ Bir palet değişikliğinin ikinci dereceden etkisi ancak RENDER'a bakınca görüldü:
token tablosunda iki değer de "mavi" ve makul duruyordu.

**Geri alma maliyeti:** orta — bir yüz ailesi, bir rol, altı şablonun genişlik değeri.

## D-297

**Karar:** `memphis`in renkli lekeleri kaldırıldı, kimliği kart zeminlerinin renk
rotasyonuna taşındı; `koyuMu()` artık token ADINA değil ÇÖZÜLMÜŞ AÇIKLIĞA bakıyor.

**Neden — lekeler:** depo sahibi: *"şu aptal dairemsi renkli topları kaldır, bunlar web
tasarım duruyor"*. Referansta (`image copy 4`) gerçekten leke var — ama orada DEV,
kenardan TAŞIYOR ve fotoğrafın ARKASINDA renk alanı kuruyor. Bizimkiler kadrajın
ortasında yüzen küçük konfetiydi: **aynı öge, ters iş.** Ayrıca hepsi elle kodlanmış
şekillerdi (blob · halka · nokta · tarama), yani R-81'in tam tarifi.
**Kimlik silinmedi, yer değiştirdi:** renk alanı bir kompozisyon kararıdır (alan, sınır,
ritim); daire bir süstür.

⚠ ⚠ **`koyuMu()` ADI ÖLÇÜYORDU, ŞEYİ DEĞİL.** `zemin.includes('ink') || includes(
'line-edge')` yazıyordu. `memphis`e lacivert bir kart zemini (`--ramp-marka-mavi-700`)
eklenince sessizce "açık" dedi: koyu mavi üstüne koyu mürekkep metin çizildi ve slayt
okunmaz oldu. Açıklık artık `tokenCss`ten okunuyor (tek düzey `var()` dolaylaması
izleniyor, eşik 0,55). **Adı ölçmek, şeyi ölçmek değildir** — bu depoda tekrar eden sınıf.

⚠ Bulunamazsa eski ada dayalı sezgiye düşülüyor ama bunun bir TAHMİN olduğu kodda yazılı.

**Kanıt:** eski ada dayalı sürüm geri kondu → lacivert kart testi kırmızı; kaldırıldı → yeşil.

⚠ ⚠ **İLK DÜZELTME DE YANLIŞTI: DOSYAYI OKUDU, KASKADI OKUMADI.** `tokens.css` dört yüzey
bloğu taşıyor (`:root` · `console` · `kreatif` · `studio`) ve aynı değişken hepsinde
YENİDEN tanımlı. Çözücü ilk eşleşmeyi alıyordu: `--role-surface` için KONSOL değerini
(oklch 0,21 — koyu) okuyup `donen`in kâğıt kartını "koyu" sandı, metni beyaz yaptı ve
başlık beyaz zeminde KAYBOLDU. Render `data-surface="kreatif"` ile çiziliyor; ölçüm de o
bloğu okumak zorunda. **Doğru dosyayı okumak, doğru yeri okumak değildir.**

⚠ **`texture` kelimesi brief'lerde KULLANILAMAZ:** içinde `text` geçiyor ve R-20 muhafızı
alt dize eşleştiriyor. Yeni varyantlar ilk yazımda "fabric texture" diyordu; test yakaladı,
koşuda görsel adımını reddettirecekti. Yerine `weave`, `grain`, `creases`.

**Geri alma maliyeti:** düşük — bir leke dizisi, bir fonksiyon, altı kart zemini.

## D-298

**Karar:** Gövde puntosuna 34 px TABAN, üst başlık 19→24, alt ray 15→18; gövde genişliği
metin kolonuna bağlandı; `ink-950` gerçekten siyaha indi (0,15 → 0,055) ve `editoryal`
kart zeminleri kâğıt → soluk mavi → açık gri → MÜREKKEP rotasyonuna geçti.

**Neden — punto:** ölçüldü, gövde **23–27 px**, tuvalin %1,7–2'si. 1080 px telefonda
~390 pt'ye iniyor, yani 25 px ≈ 9 pt. Karşılaştırılan dört açık kaynak karosel
üreticisinin hepsi 32–38 px kullanıyor, ikisi bunu mobil için BİLEREK yükseltmiş.
⚠ Taban tek başına bırakılınca ALTI ŞABLON DA aynı puntoya çakıldı: **emniyet, tasarım
kararının yerine geçemez.** Oranlar yükseltildi, taban sigorta olarak kaldı (34–40 px).

⚠ **Gövde genişliği kolondan BAĞIMSIZDI ve punto büyüyünce taştı.** `max-width: 34ch`
sabitti; 34 px puntoda ~580 px eder, `editoryal`in kolonu 369 px. Gövde 200 px aşıp
fotoğrafın altına giriyordu. **Punto tabanı bunu görünür yaptı, sebep olmadı** — hata
baştan oradaydı ve küçük puntoda saklanıyordu.

**Neden — ton:** referans (`image copy 2`) p1=0 · p99=255 · std 79,4. Bizimkiler
ölçüldü: `editoryal` **157–235, aralık 78, std 19** (altısının en düzü), `sahne` 11–161.
**Bir tasarımın "derin" durması ton aralığından geliyor; tek tonda yıkanmış bir kadraj
sade değil, SİSLİ.** `ink-950` 0,15'ti — RGB ~30, yani siyah değil koyu gri.

**Ölçülen sonuç:** `editoryal` std 19,8 → **87,8** · `donen` 27,9 → **89,1** ·
`memphis` 37,8 → 64,8 · `akan-alan` 34,7 → 41,0. İkisi referansın 79'unu geçti.

⚠ `sahne` p99'u 163'te kaldı: kadrajın en parlak şeyi turuncu YER TUTUCU çöp adam.
Gerçek koşuda oraya rim ışıklı fotoğraf giriyor — bu bir şablon kusuru değil, sondanın
sınırı. **Yer tutucuyla ölçülen her metrik bu sınırı taşıyor.**

⚠ ⚠ **2× RENDER DENENDİ, GERİ ALINDI.** `deviceScaleFactor` hiç ayarlanmamış; 2× harf
kenarlarını gözle görülür biçimde temizliyor. Geri alınma sebebi kalite değil ÇIKTI
SÖZLEŞMESİ: üç test PNG'nin 1080×1350 olduğunu doğruluyor ve haklılar. 2×, çıktıyı
2160×2700 yapıyor ve depoda küçültücü yok. Borç yazıldı.

⚠ ⚠ **İLK ÖLÇÜM ARACI 2×'i KÖTÜ GÖSTERDİ:** `FIND_EDGES` enerjisi 1×'te 22,7 · 2×'te
18,3. Filtre TIRTIKLI kenarı da "enerji" sayıyor, yani aliasing'i ödüllendiriyor. Doğru
araç gözdü. **Bir metriğin sayı üretmesi, doğru şeyi ölçtüğü anlamına gelmiyor.**

**Geri alma maliyeti:** orta — iki token değeri, bir CSS tabanı, bir kart rotasyonu.

## D-299

**Karar:** Hayalet (dev soluk rakam) altı şablonun ALTISINDAN da kaldırıldı; hangi
şablonun kullanacağına artık ŞABLON karar veriyor, model değil; denetime
`hayalet-carpisma` kusuru eklendi. Başlıklar büyütüldü.

**Neden:** depo sahibi: *"hepsine arkaya filigran gibi sayı eklemişsin, çoğunda yazılarla
çakışıyor, neden hepsinde var?"* Dev rakam bir kompozisyon ögesi ve yalnız ona YER olan
yerde işe yarıyor; ötekilerde metnin, panelin ya da fotoğrafın arkasına düşüp filigran
gibi okunuyordu.

⚠ Önce yalnız `akan-alan`da bırakıldı ("alt yarısı boş, çakışmıyor"). **Yanlıştı ve depo
sahibi 4. slaytta gösterdi.** Ölçüm doğruladı: alan sınırı y%44–86 arasında SALINIYOR,
hayalet %35 boyunda. Tek alana sığması için ya %86'nın altına inmeli (kadraj dışı) ya
%44'ün üstüne çıkmalı (orada başlık var). **Salınan bir sınırla sabit bir dev rakam yan
yana yaşayamaz** — geometri, tercih değil.

⚠ ⚠ **`uyarla` ARTIK MODELİN HAYALET YAZMASINI ENGELLİYOR.** Örnekteki hayalet boşsa o
şablon ögeyi kullanmıyor demektir; içerik modelin işi, kompozisyon bizim. Aksi hâlde
şablondan silmek yetmiyordu — koşuda model yeniden dolduruyordu.

⚠ ⚠ **DENETİM ALANI ÖLÇÜYORDU, ÇARPIŞMAYI DEĞİL.** `sus-baskin` hayaletin ne kadar YER
tuttuğunu ölçüyor; bir öge küçük olup yine de yanlış yerde durabilir. `hayalet-carpisma`
metin kutularıyla örtüşmeyi ölçüyor (eşik %12: kenarın bir harfe değmesi kasıtlı
katmanlanmadır, gövdenin sekizde biri değil).

⚠ **Hayalet gidince hiyerarşi açığa çıktı:** en büyük/en küçük punto oranı 3,8–5,1'e
düştü. Eşiği düşürmek yanlış cevap olurdu — ölçüt kırılmadı, hayalet onu SAKLIYORDU.
Başlık payları yükseltildi (94–119 px), sonra üç taşma çıktı ve paylar geri dengelendi.

**Geri alma maliyeti:** düşük — hayalet alanları, bir koruma satırı, bir denetim bloğu.

## D-300

**Karar:** Kesim ayracı kaldırıldı; alt ray görsel katmanının üstüne alındı.

**Neden — ayraç:** panoramayı bütün hâlde incelerken kesim yerini göstersin diye vardı.
Ama dilimleme `translateX(-i × G)` ile yapılıyor ve `left: i × G` konumundaki 1 px'lik
çizgi **tam olarak (i+1). slaydın sıfırıncı sütununa** düşüyor. Ölçüldü: `derived/blobs`
altındaki gerçek bir üretim slaydında sütun 0, sütun 2'den **+11,3** daha parlak — her
slaydın sol kenarında hayalet bir hairline YAYINLANMIŞ.
**Görüntüleme yardımcısı çıktıya sızarsa yardımcı değil, kusurdur.**

⚠ Eski test ayracın VARLIĞINI doğruluyordu (bir sınıf adı çakışmasından sonra yazılmıştı);
artık YOKLUĞUNU doğruluyor. Bir testin var olması, doğru şeyi savunduğu anlamına gelmiyor.

**Neden — ray:** `.ray` z-index 2'de, `.gorsel` 4'te. Alt kenardan taşan kesik özne rayı
örtüyor ve marka imzası ile kaynak satırı görünmez oluyordu. Ray 6'ya çıktı.

**Geri alma maliyeti:** düşük — bir CSS kuralı, bir emisyon satırı.

## D-301

**Şablon ve karosel elle düzenlenebilir — ama piksel değil, VERİ düzenlenir.**

Depo sahibi Photoshop benzeri bir ortam istedi: görseli hareket ettirmek, yazıyı
değiştirmek, renklerle oynamak. İki yol vardı.

**Reddedilen yol — serbest piksel tuvali.** Bir tuval editörü (fabric.js, tldraw)
kurup çıktıyı oradan almak. Reddedildi: o an ikinci bir render motoru doğar ve
Yasa 4 tam bunu yasaklıyor — ikinci CSS alt kümesi ikinci Türkçe hata modudur.
Ayrıca elle boyanmış bir tuval **şablon değildir**; bir sonraki konuya uyarlanamaz
ve katalog mantığının (Yasa 13) tamamı çöker.

**Seçilen yol — aynı motor, düzenlenen şey veri.** `just duzenle` `panoramaHtml(doc)`
çıktısını bir iframe'de gösteriyor; tıklanan metin ve sürüklenen görsel kutusu
`KatalogOrnegi` **alanlarına** yazıyor, DOM'a değil. Gördüğün şey ihraç edilen şeydir
çünkü ikisi aynı fonksiyondan geliyor. Panorama denetimi düzenlemenin yanında canlı
koşuyor: kusur düzenlerken görünüyor, render'dan sonra değil.

**İki mod, seçilebilir** (depo sahibinin kararı): şablon düzenleme katalog dosyasına
yazar ve altı tasarımı kalıcı değiştirir; tek karosel düzenleme yalnız o koşunun
defterine bindirme yazar. Prototip **hiçbirine yazmıyor** — `derived/` altına JSON
önizlemesi basıyor. Yazma yolu şablonu bozarsa altı tasarım birden gider; ayrı turda,
kendi testiyle bağlanacak (BORÇLAR D15).

**Bağımlılık eklenmedi.** `node:http` + tarayıcı. Bir editör çatısı, düzenlediğimiz
şeyden büyük olurdu.

## D-302

**Koşu defteri kompozisyonu REFERANS biçiminde saklıyor: metin izlenir, piksel izlenmez.**

`render` artık panorama belgesini `derived/runs/<id>/panorama.json` olarak yazıyor.
Sebep bir zincir kopukluğu: defterde yalnız ÖZET vardı (`sablonId`, `slides`,
`kusurlar`) ve **kompozisyonun kendisi hiçbir yere düşmüyordu**. PNG'ler duruyordu,
onları üreten VERİ yoktu; üretilmiş bir karosel bir daha açılamıyor, elle
düzeltilemiyor (D-301) ve aynı belgeyle yeniden render edilemiyordu.

**Belgeyi olduğu gibi yazmak yanlış cevaptı.** Ölçüldü: 3.299 KB — `gorseller`
2.741 KB (data URI'ler), `fontCss` 552 KB (base64 gömülü yüzler), `tokenCss` 2 KB.
`derived/runs` git'te İZLENİYOR (Yasa 11) ve `repo-hygiene` 512 KB'ı reddediyor;
koşu başına 3 MB ikili veri commit'lemek defteri okunamaz hâle getirirdi.

**Ayrım tekrar üretilebilirlik.** `fontCss` markanın font dizininden deterministik
kuruluyor → yazılmıyor, açan taraf yeniden üretiyor. Görseller ise ÜRETİLDİ — para ve
rastgelelik harcandı, geri getirilemezler → yan dosyaya PNG olarak düşüyor, belge
onların ADINI taşıyor, byte'lar `.gitignore`da. Sonuç: 3.299 KB → 7 KB.

Bu, slaytların `derived/blobs`ta durmasıyla aynı model: **kompozisyon izlenir,
pikselleri izlenmez.** Yazma ve okuma tek fonksiyondan geçiyor
(`panoramaBelgesiniYaz`) — editör kendi serileştiricisini yazsaydı iki biçim doğar
ve biri gün gelip ötekinden ayrışırdı.

## D-303

**Sayaç etiketi yasağı İSTEMDE de yazılı, `uyarla`da da zorunlu.**

Depo sahibi `BÖLÜM 1` / `SERİ 1` / `SORU 1` sayaçlarını açıkça kaldırttı ve altı
katalog taslağından silindiler. Buna rağmen gerçek bir koşuda dört kartın DÖRDÜ de
`BÖLÜM 01…04` ile çıktı. Kök neden: **uyarlama isteminin JSON örneği hâlâ
`"ustBaslik": "BÖLÜM 01"` diyordu** ve model örneği kopyaladı. Bir dosyada silinen
şey, başka bir dosyadaki örnekte yaşamaya devam etti — aynı sınıf hata bu depoda
daha önce de oldu (D-259 → D-283: bir dosyaya yazılan ders, o dosyaya sonradan
eklenen dala kendiliğinden geçmiyor).

İki taraf birden: istem sayacı ÖĞRETMİYOR ve yasağı açıkça yazıyor; `uyarla` sayaç
gelirse REDDEDİYOR. Yalnız reddetmek modeli her koşuda aynı duvara çarptırıp bir tur
daha yakardı; kuralı önce söyle, sonra zorla.

⚠ Kalıp `i` bayrağı KULLANMIYOR: JavaScript'in case-folding'i `İ`/`i` çiftini
Türkçe'nin beklediği gibi eşlemiyor (R-21 ile aynı kök). Biçimler açıkça sayılıyor.
