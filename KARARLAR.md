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

## D-275 — Görsel kütüphaneleri ARAŞTIRILDI: ikisi reddedildi, biri kendimiz yazıldı

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.11 · §17 · R-75 · R-06

Kullanıcı *"doodle club, 3d element icon görsel kütüphaneleri gibi farklı kütüphaneler
de yüklenmeli"* dedi. npm'de tek tek sorgulandı ve **ölçüm kararı verdi:**

| Aday | Bulunan | Karar | Gerekçe |
|---|---|---|---|
| `blobshape` | 1.0.0 · MIT | **RET, yerine kendimiz** | `Math.random` kullanıyor; R-06 determinizmi yasaklıyor ve replay bozulur. Tohumlu bir üretici ~30 satır (R-75) |
| `lucide-static` | 1.31.0 · ISC | **RET** | Kendi 20 ikonumuz zaten çizili ve o karar gerekçeliydi; jenerik bir set eklemek çıktıyı DAHA standart yapar — kullanıcının *"ai durmamalı"* dediğinin tersi |
| `@phosphor-icons/core` | 2.1.1 · MIT | **RET** | Aynı gerekçe |
| `humaaans` | 1.7.0 | **RET** | CC BY 4.0 atıf şartı; ayrıca düz vektör insanlar, bizim fotoğrafik kesik öznelerimizle aynı karede çakışır |
| 3B varlık kütüphaneleri (GLB/three.js) | — | **RET** | Chromium'da render için ikinci bir motor ister (Yasa 4) ve tek bir öge için orantısız |

⚠ ⚠ **"3D element" GÖRÜNÜMÜNÜN GERÇEKTE NE OLDUĞU ÖLÇÜLDÜ.** Bu karosellerdeki imza
üçüncü bir boyut değil; **yumuşak degrade + tek yönlü ışık + zemine düşen gölge**. Üçü
de SVG'de var. `blob` leke tipi bunu veriyor: radyal degrade (ışık sol üstte), paylaşılan
`feDropShadow`, tohumu KONUMDAN gelen deterministik bir kuadratik eğri.

⚠ **Memphis'te ikisi blob, dördü düz kaldı.** Hepsi blob olsaydı şablon Memphis olmaktan
çıkardı: o dilin kimliği geometrik desen. Hacimli şekil bir KARŞITLIK katıyor, yerine
geçmiyor — kullanıcının şartı buydu: *"zenginleştir ama asıllarına sadık kal."*

**Geri alma maliyeti:** yok — hiçbir bağımlılık eklenmedi.

## D-276 — Marka rengi LOGODAN ölçüldü: aksanımız stok şablondan gelmişti

**Tarih:** 2026-08-18 · **Bağlam:** FAZ-15.12 · §12.1 · D-253

Depo sahibi iki logo bıraktı (`upcytech mavi beyaz.png`, `upcytech siyah beyaz.png`) ve
*"bunlara uygun paletleri hazırla, katalog bizim markamızın katalogu"* dedi. Logolar
ölçüldü: **tek renk `#0090fc` = `oklch(0.647 0.189 251.2)`** ve siyah.

⚠ ⚠ **ASIL BULGU TOKEN AÇIKLAMASINDA YAZIYORDU.** `role.bg` şöyle tanımlıydı:
*"Kapak ve vurgu slaytlarının zemini. **Referans karosellerdeki sarı alanın karşılığı.**"*
Yani kreatif zeminimiz markadan değil, **incelediğimiz stok şablondan** geliyordu.
Logoda sarı YOK. Aylardır markanın kendi rengi hiçbir çıktıda görünmüyordu ve bunu
kimse fark etmedi çünkü hiçbir kapı "bu renk nereden geliyor" diye sormuyor.

**Karar:**

| Rol | Önce | Sonra | Gerekçe |
|---|---|---|---|
| `role.bg` | `amber-500` | **`mavi-500`** | Logodan ölçülen renk; markanın kendisi |
| `role.accent` | `amber-600` | `amber-500` | Amber SİLİNMEDİ, karşı aksan oldu |

⚠ **Amber neden silinmedi:** referans tasarımların hepsi iki aksanlı çalışıyor
(turuncu+lacivert, sarı+siyah). Tek renkli bir palet cansız kalıyor; sıcak bir karşıt
mavi alanı canlandırıyor. Amber artık birincil değil, KARŞITI.

⚠ **Kendiliğinden uyum:** konsol gri rampası zaten 250 tonunda kurulmuştu, marka mavisi
251. Enstrüman grisi ile marka mavisi aynı tonda — bu tasarlanmamıştı ama tutuyor.

**Geri alma maliyeti:** düşük — iki token değeri; rampa eklendi, hiçbiri silinmedi.

## D-277

**Karar:** Kart metni yatayda konumlanabilir (`kolon: 'sol' | 'sag'`) ve `sahne`
dikey ortaya (`yerlesim: 'orta'`) geçti. Referansın kompozisyonu YAN YANA, bizimki
ÜST ÜSTE BANTLIydı.

**Neden:** Ölçüm: `sahne`nin dört slaydından üçünde alt yarı doluluğu %0,3–%1,2 idi.
Kadrajın yarısı boştu ve çıktı bir web "hero" bölümü gibi okunuyordu — kullanıcının
"web tasarımı gibi duruyor" tespiti tam olarak buydu. Sebep tercih değil, **ifade
edememekti**: her kart `align-items: flex-start` ile sola yapışıktı, dolayısıyla tek
kurulabilen düzen bantlamaktı (metin bandı · ok bandı · özne bandı). Referansta
(`image copy 2`) özne kadrajın bir yanını doldururken metin ötekinde yaşıyor.

**Ölçülen sonuç:** üst/alt doluluk 18,7/0,3 → 7,6/4,1 · 16,6/1,2 → 6,4/6,6 ·
10,6/0,3 → 3,1/3,4. Ölü alt yarı bitti.

⚠ **`sag` blok sağa KONUMLANIR, metin SOLA hizalı kalır.** Referansta da böyle.
`text-align: right` Türkçe gövdede tırtıklı sol kenar üretir; hizalama ile
konumlandırma ayrı kararlardır.

⚠ ⚠ **BAĞLI OLDUĞU YAZILMAYAN İKİNCİ SAYI ok şeridiydi.** Oklar y%39–47'deydi ve bu
sayı `ust` yerleşimindeki metnin ALTINDA olmak üzere seçilmişti. Yerleşim `orta`
olunca metin y%30–62'ye indi ve oklar başlıkların üstünü çizdi — "Önce sorun duruyor"
okunamaz oldu. Şerit y%68–80'e taşındı; bağ artık kodda yazılı.

**Geri alma maliyeti:** düşük — bir opsiyonel alan, iki CSS kuralı, üç sayı.

⚠ **Bu değişiklik `sahne`yi asıllına BENZETMEDİ, yalnız bant düzenini kaldırdı.**
Referansta her slaytta bir fotoğraf var ve kadrajı boydan boya dolduruyor; bizde tek
görsel dört slayda düşüyor ve kalan üçü metinle doluyor. Toplam doluluk hâlâ %3–8.
**Kök engel borç A8'dir** (`GorselIhtiyaci.adet: 'slayt-basina'` ilan ediliyor, DAG
çoğaltmıyor) ve bu artık iddia değil, ölçülmüş.

## D-278

**Karar:** Borç A8 kapandı. Hat slayt başına görsel üretiyor: `composeBody` yayma
yerine SIRAYA göre eşleştiriyor, hat görsel adımlarını dörde açıyor ve katalog yuva
başına `varyantlar` (kadraj tarifi) taşıyor. `sahne` tek yuvadan dört yuvaya geçti.

**Neden:** Katalog `adet: 'slayt-basina'` ilan ediyordu, DAG çoğaltmıyordu ve
`composeBody` tek görseli HER yuvaya yayıyordu — çıktıda aynı figür yan yana. O gün
tek yuvaya inildi; doğru karardı ama şablonu asıllından uzaklaştırdı. Ölçüldü:
`sahne`nin dört slaydından üçünde doluluk %3–7, kadraj boştu.

**Ölçülen sonuç:** slayt doluluğu %5–9 → %10,6–14,1; dört slaydın dördünde de her iki
yarı dolu. 1052 test yeşil, altı şablon denetimi 0 kusur.

**Üç parça:**
1. `uretilenGorseller()` — yuva `i` görsel `i`yi alır. Görsel yetmezse yuva BOŞ kalır
   ve yer tutucu çizilir; klonla örtülmez.
2. Hat `gorsel-brief/uret/kirp` üçlüsünü **açarak** dörde çıkardı — `duzelt` ile aynı
   gerekçe (DAG döngü taşımıyor). Tavan 4: `donen` dört yuva istiyor.
3. `GorselIhtiyaci.varyantlar` — yuva başına kadraj tarifi. Olmadan N üretim N ÖZDEŞ
   görsel demekti: aynı brief, aynı model, aynı kadraj.

⚠ ⚠ **"SONUNCUYU AL" ARTIK YETMİYOR ve bu, o desenin sınırının bulunduğu yer.** Tek
görselken iki üretici vardı (`gorsel-uret` ham · `gorsel-kirp` kırpılmış) ve sonuncuyu
almak doğruydu. N görselde `gorsel-kirp-2`, `gorsel-uret-3`ten ÖNCE gelebilir ve
"sonuncu" 3'ün HAMINI seçip 2'nin kırpılmışını çöpe atardı. Eşleştirme artık anahtarın
sayısal sonekinden; sonek yoksa öbek 1, yani `instagram-post` değişmeden çalışıyor.

⚠ **Fazlalık adım para HARCAMIYOR:** sıra varyant sayısını aşınca brief BOŞ dönüyor ve
görsel adımı atlanıyor. `editoryal` (2 yuva) koşarken 3. ve 4. adım model çağırmıyor.

⚠ ⚠ **TESTİN KENDİSİ ÖNCE ANLAMSIZDI.** İlk sürüm `sahne` (o an TEK yuva) kullanıyor ve
`if (s.length < 2) return` ile kendini koruyordu: koruma her koşuda devreye giriyor,
hiçbir iddia çalışmıyor, test YEŞİL kalıyordu. Şablon `editoryal` (2 yuva) ile
değiştirildi ve yayma kasten geri konarak kırmızıya döndüğü GÖRÜLDÜ.

**Geri alma maliyeti:** orta — bir motor fonksiyonu, dokuz hat adımı, bir sözleşme alanı.

## D-279

**Karar:** R-81 — yeni jenerik grafik öge (ikon, ok, rozet, çerçeve, çizgi süsü, 3B
şekil) CSS/HTML ile KODLANMAZ. `kodlanmis-oge` kapısı sayıyı donduruyor.

**Neden:** depo sahibinin ölçümü. `examples/` altındaki profesyonel tasarımlarla bizim
çıktılar yan yana konduğunda fark renkte ya da düzende değil, ÖGELERDEydi. Elle
kodlanmış bir ikon "bilgisayar işi" gibi duruyor çünkü öyle: bir tasarımcının çizdiği
öge ölçülemeyen binlerce kararı taşır, `border-radius: 50%` taşımaz.

**Kapsam dışı — ve sınır burada:** YERLEŞİM, TİPOGRAFİ, ZEMİN reçetesi ve VERİ
görselleştirmesi. Çubuk bir süs değil, verinin kendisi; onu kütüphaneye devretmek
veriyi bir üçüncü tarafın estetiğine teslim etmek olurdu.

⚠ ⚠ **KIRPMA BİR ÖGE DEĞİLDİR.** `clip-path: circle(50%)` bir FOTOĞRAFI daire yapıyor —
kadraj kararı, çizilmiş şekil değil. Aynı satırı yasaklamak `donen` şablonunun daire
maskesini imkânsız kılardı. Ayrım: şeklin içi fotoğrafla doluysa kırpma, boşsa öge.

⚠ **Kural YENİ öge için, mevcutlar dondurulmuş.** `.kilometre-nokta` (13px) ve
`.madalyon-no` (46px) tam olarak R-81'in yasakladığı şey ama silmek kompozisyonu bozardı
ve emeklilik silme değildir (Yasa 10). Ölçülen şey sayının ARTMAMASI. Tavanı düşüren
değişiklik de kırmızı: bir öge silindiyse tavan onunla inmeli, yoksa kapı sessizce
gevşer ve yerine yenisi konabilir.

⚠ ⚠ **KAPININ İLK SÜRÜMÜ YORUMLARI SAYIYORDU.** İlk koşuda `sekil-cebri.ts` yanlış
pozitif verdi: `polygon()` orada geçiyor ama bir AÇIKLAMA cümlesinde — hem de o tekniğin
neden KULLANILMADIĞINI anlatarak. `static.ts`in tavanı da 4 sanılmıştı, kodda 1.
Bu depoda ölçüm aracı, ölçtüğü şeyden daha sık bozuk çıkıyor.

**Kanıt:** yeni bir `border-radius: 50%` rozeti eklendi → kapı KIRMIZI (4 → 5); geri
alındı → yeşil.

**Geri alma maliyeti:** düşük — bir kapı dosyası, bir kural.

## D-280

**Karar:** Kadraj varyantı GÖRSEL isteminin kendisine ekleniyor (`gorsel-uret-K` artık
`kompozit`e de bağlı) ve `kolon` uyarlamada korunuyor. İkisini de **gerçek koşu** buldu.

**Koşu:** `instagram-karosel` "Tekstil hattinda geri kazanim adimlari" — 25 adım yeşil,
dört görsel üretimi + dört arka plan silme, insan kapısında durdu. A8 üretimde çalıştı.
Çıktıya BAKILDI ve iki kusur göründü.

**Kusur 1 — dört fotoğraf BİREBİR AYNI.** Dört ayrı brief adımı koştu, dördünün
isteminde farklı bir kadraj cümlesi vardı (ölçüldü: sıra 1–4 farklı, sıra 5 boş) ve
çıkan dört fotoğraf piksel piksel aynıydı. Sebep yapısal: kadraj tarifi METİN
MODELİNDEN GEÇEREK gidiyordu ve model onu düzledi. **Bir modele "şunu koru" demek bir
rica; garanti yapıya gömülmeli** — aynı ders `matlama` → `gorsel-kirp` geçişinde de
öğrenilmişti. Varyant artık brief metnine doğrudan ekleniyor.

⚠ **Yanlış teşhisten dönüldü:** önce idempotency çökmesi sanıldı (anahtar `stepId`
içermiyor, kasten). Ama `inputDigest` adım kimliğini İÇERİYOR; dört çağrı gerçekten
ayrı ayrı yapılmıştı. Ölçüm teşhisi düzeltti.

**Kusur 2 — `kolon` uyarlamada düşüyordu.** Dört slaytta da metin sola indi ve figürün
üstüne bindi. `zemin` bir satır YUKARIDA şablondan korunuyordu; yeni alan o dersi
kendiliğinden almadı. Bu deponun tekrar eden sınıfı: **bir dosyaya yazılmış ders, o
dosyaya sonradan eklenen alana geçmiyor.**

**Kanıt:** iki düzeltme de kasten geri alındı → üç test kırmızı; geri konuldu → yeşil.

**Geri alma maliyeti:** düşük — bir `needs` bağı, iki kısıt, iki satır.

## D-281

**Karar:** Görsel çağrısı yuva sırasından türeyen bir `seed` taşıyor (`7919 × sıra`,
yalnız `raw` telli modelde). Rehber §10 ölçütleri `katalog-kabul.test.ts` ile bağlandı;
`sahne`/`donen`/`editoryal` hayaletleri dolduruldu, `donen` daireleri kesimi artık
gerçekten aşıyor ve kartlarının üstüne doku (`ustDoku`) geldi.

**Neden — tohum:** İKİ gerçek koşuda da dört ayrı görsel çağrısı BİREBİR AYNI kadrajı
döndürdü. Önce kadraj tarifi brief istemine kondu (D-280), yetmedi; sonra doğrudan
görsel istemine eklendi, yine yetmedi. Sebep sağlayıcıda: tohum gönderilmediğinde
Cloudflare sabit bir varsayılan kullanıyor ve yakın istemler aynı görüntüye çöküyor.
**İstemi güçlendirmek bir rica, tohum bir garanti** — bu deponun tekrar eden dersi.
Determinizm bozulmuyor (R-06): tohum yuva sırasının saf fonksiyonu.

⚠ `seed` YALNIZ `stable-diffusion-xl-lightning` (`raw` tel) gövdesine giriyor;
`flux-1-schnell` fazladan alan görünce isteği tümden reddediyor — ölçülmüş davranış.

**Neden — kabul testi:** rehber §10'un altı ölçütü yazılıydı ama hiçbir şeye bağlı
değildi, yani bir NİYET beyanıydı. Bağlanır bağlanmaz kataloğda **beş gerçek boşluk**
buldu: üç şablonda hayalet boştu (dolu taslak kuralının ihlali), `donen`in daireleri
kesime değiyor ama geçmiyordu (süreklilik taklidi) ve `donen`in zemini tek katmanlıydı.

⚠ ⚠ **REHBERİN ATIF YAPTIĞI ÜÇ FONKSİYON BU BELGEYE UYMUYOR.** `tasarimOlc`,
`olcekDisiBosluklar`, `kompozisyonMerkezi` — üçü de `DocumentModel` alıyor, yani
slayt-başına yolun araçları. Ölçütler panorama VERİSİNDEN yeniden hesaplandı.

⚠ ⚠ **ÖLÇÜM ARACI ÜÇ KEZ BOZUK ÇIKTI:** (1) hayalet puntosunu `baslikPayi` ile çarpan
uydurma formül `donen`i 5,9'da gösterip gerçek eksiği (hayaletin HİÇ olmaması)
maskeledi; (2) zemin ölçümü yalnız `zeminDokusu`ya bakıp `alanSiniri` ve tam kaplama
fotoğrafı görmedi, üç şablonu haksız kırmızıya düşürdü; (3) sağlayıcı testi kaynağı
iki kez geçen bir dizeden dilimledi. Ayrıca `URL.pathname` "İndirilenler"i yüzde-kodladı
— Türkçe yol bu depoda kenar durum değil, VARSAYILAN durum.

⚠ `ustDoku` gerekliydi çünkü `donen`in opak kart renkleri panorama zeminini tamamen
örtüyor. Gren fiziksel olarak da üstte olmalı: film greni sahnenin değil filmin özelliği.

**Geri alma maliyeti:** düşük — bir kısıt, bir opsiyonel alan, bir test dosyası.

## D-282

**Karar:** Üçüncü yüz ailesi (**Caveat**, OFL, el yazısı) kataloğa GİRECEK ama bu turda
GİRMEDİ: `tasarim` kapısının "en çok 2 font ailesi" sınırını deliyor ve **R-76 kırmızı
bir kapının kuralını aynı turda gevşetmeyi yasaklıyor.** Sınır 2 → 3'e ayrı bir turda,
`refactor(gates)` tipli ayrı bir commit'le çıkarılacak; ardından yüz geri eklenecek.

**Neden gerekli:** Referansta (`image copy 2`) kapağın kontrastı punto farkından değil
**YÜZ FARKINDAN** geliyor — ilk kelime el yazısı, kalanı ağır condensed. Tek display
ailesiyle bu kurulamıyor ve elle taklidi yasak (R-81: jenerik öge kodlanmaz; bir yazı
karakteri bunun en uç örneği).

**Bu turda ölçülenler (iş boşa gitmedi):**
- Caveat'in Türkçe kapsaması **çizdirilerek** doğrulandı: `ı İ ğ ö ü ş` render edildi ve
  BAKILDI. Bir fontun "latin-ext" demesi Türkçe'nin tamamını taşıdığı anlamına gelmiyor.
- Altı şablonun kapağında denendi ve çalıştı; dosyalar `brand/brd_upcytech/fonts/`
  altında duruyor (kullanılmıyor, bir sonraki turda bağlanacak).
- ⚠ İlk örnek metinler başlığı TEKRAR ediyordu ("Altı yılda" / "Altı yılda iki katına…")
  ve render'a bakınca tek cümlenin iki kez yazılması gibi okundu. Referansta iki satır
  AYRI şey söylüyor: el yazısı kim konuşuyor, condensed ne söylüyor.

⚠ ⚠ **`YUZLER` kapalı bir liste ve "üçüncü aile bir KARAR gerektirir, bir import değil"
diye yazıyordu — doğruydu, ama kararın BEDELİ bir kapıymış.** Kapalı listeyi okumak
kapıyı okumak değil; iki yerde yaşayan bir sınır, bir yerde görülüp öteki yerde
görülmeyebiliyor.

**Bedel:** +104 KB font (base64 gömülü, iki alt küme). Ağ çağrısı yok.

## D-283

**Karar:** `image.matte` girdilerini `needs` ile daraltıyor. Dört özdeş fotoğrafın kök
sebebi buydu — üç gerçek koşu boyunca görünen kusur, üç yanlış teşhisten sonra bulundu.

**Kök sebep:** `run.ts` her adıma `inputs: ciktilar` geçiyor — o ana kadarki BÜTÜN
çıktıları. Daraltmayı `needs`i okuyan gövde yapmak zorunda. `uretilenGorseller(...)[0]`
ise listenin ilkini alıyordu: dört kırpma adımının DÖRDÜ DE 1. görseli kırptı. Kırpılmış
olan öbek içinde hamı EZDİĞİ için dört yuvanın dördüne aynı figür girdi. Şablon dört
görsel sipariş etti, sağlayıcı dördünü de üretti, üçü çöpe gitti.

⚠ ⚠ **HATA BİR YORUM SATIRIYDI.** Kodun yanında *"İLKİNİ almak doğru, çünkü `needs`
girdiyi zaten DARALTIYOR (D-246)"* yazıyordu. D-246 gerçekten böyle bir ders içeriyor —
ama o ders İSTEM KURUCUSU için: `promptTuret` `input.needs` üzerinde döner, `inputs`
üzerinde değil. Doğru bir dersin YANLIŞ yere uygulanması, dersin hiç olmamasından daha
tehlikeli: yorum, doğrulamayı gereksiz gösteriyor.

**Üç yanlış teşhis, sırayla:**
1. *"Kadraj tarifi brief isteminde eksik"* → eklendi (D-280), değişmedi.
2. *"Metin modeli tarifi düzlüyor"* → tarif doğrudan görsel istemine kondu, değişmedi.
3. *"Sağlayıcı tohumsuz çağrıda sabit varsayılan kullanıyor"* → tohum eklendi (D-281),
   değişmedi.

**Teşhisi getiren şey sağlayıcıyı DOĞRUDAN sınamak oldu:** aynı isteme üç çağrı —
`seed 7919`, `seed 15838`, tohumsuz — ÜÇ FARKLI görsel döndürdü (98.633 · 84.896 ·
94.379 bayt, üç ayrı özet). Sağlayıcı suçsuzdu, dolayısıyla çökme bizdeydi. **Zincirin
bir ucunu sabitlemeden ortasını tahmin etmek üç turumu aldı.**

⚠ D-280 ve D-281 geçersiz DEĞİL: varyant kadrajı ayrıştırıyor, tohum tekrarlanabilirliği
garantiliyor. Ama ikisi de kusuru gideremezdi — hepsi kırpma adımında birleşiyordu.

**Geri alma maliyeti:** düşük — bir opsiyonel parametre, iki çağrı yeri.

## D-284

**Karar:** Marka işareti karosele girdi (alt rayın solunda, sürümü ZEMİN seçiyor);
logo dosyaları `brand/brd_upcytech/logo/` altında ve alfa kutusundan kırpıldı; marka
mavisi tokeni logodan YENİDEN ölçülüp düzeltildi; hayalet puntosu uzunluğa göre
ölçekleniyor.

**Kanıt — A8 zinciri gerçekten çalışıyor:** dördüncü koşu (`Uretim hattinda kalite
kontrol duraklari`) dört FARKLI figür üretti: koyu tulum + tablet · turuncu yelek +
rulo çizim · beyaz önlük + pano · beyaz önlük, ayrı poz. Üç koşu boyunca dört özdeş
fotoğraf veren kusur (D-283) kapandı ve şablon referansın yapısına oturdu.

**Logo — sürümü zemin seçiyor, şablon değil.** Mavi sürüm mavi işaret + BEYAZ kelime
taşıyor: açık zeminde kelime kaybolur. Siyah sürüm koyu zeminde kaybolur. `koyuMu()`
zaten kartın zeminini ölçüyor; ikinci bir karar noktası açmak o ölçümü yok saymak olurdu.

⚠ ⚠ **KAYNAK PNG'LER 500×500'DÜ ve işaret yalnız %2,4'ünü kaplıyordu.** Rayda 24px'e
sığdırılınca işaret ~4px kalıyor ve OKUNMUYORDU — render'a bakınca görüldü. Dosyalar
alfa kutusundan kırpıldı (338×78); kaynaklar `*-kaynak.png` olarak duruyor (Yasa 10).
⚠ İki sürüm **ORTAK** kutuyla kırpıldı: ayrı kutular farklı oran verir ve zemin
değişince logo bir slayttan ötekine ZIPLAR.

⚠ `sahne`nin `rayaSol` metni 'UPCYTECH'ti; logo zaten onu söylüyor. Aynı bilgiyi iki kez
basmak imzayı zayıflatıyor — 'SAHA' oldu.

⚠ ⚠ **TOKEN "BİREBİR" DİYORDU AMA DEĞİLDİ.** `mavi-500` `#0090fc`ten türetilmişti; asıl
dosyanın alfası >40 olan tek mavisi **`#0091ff`** = `oklch(0.6515 0.192 251.5)`. İlk
ölçüm kenar yumuşatmalı bir pikselden alınmış. Rampanın 200/600/800 kademeleri aynı
oranla taşındı. "Birebir" iddiası taşıyan bir değer yaklaşık olamaz.

⚠ **Hayalet puntosu artık uzunluğa göre.** Sözleşme "kısa: rakam/sembol" diyor ama bu
bir RİCA; gerçek koşuda model "Hafıza", "Kopukluk", "Tekrar" yazdı ve 470px sabit
puntoda tek kelime ÜÇ SLAYDI kat edip başlıkla yarıştı. Reddetmek yanlış olurdu
(D-273: yazar bir model, ret koşunun tamamına mal olur) — ölçek uyarlanıyor. Üç
karaktere kadar tam punto, sonrası orantılı, taban 0,34.

**Geri alma maliyeti:** düşük — bir opsiyonel alan, bir yükleyici, bir formül.

## D-285

**Karar:** `tasarim` kapısının `font_family_count` sınırı 2 → 3; karşılığında yeni bir
ölçüm geldi: `font_family_unknown`, tavan **0**. Kullanılan her aile `fonts.ts`in kapalı
`YUZLER` listesinde beyan edilmiş olmalı.

**Neden gerekli:** Referansta (`image copy 2`) kapağın kontrastı punto farkından değil
**YÜZ FARKINDAN** geliyor — el yazısı vurgu + ağır condensed. Tek display ailesiyle o
kontrast kurulamıyor ve R-81 elle taklidi yasaklıyor (bir yazı karakteri, "jenerik ögeyi
kodlama" yasağının en uç örneği). Üçüncü aile keyfî bir ekleme değil, ayrı bir ROL:
metin · display · vurgu. Dördüncüsü hâlâ kırmızı.

⚠ ⚠ **BU BİR GEVŞETME DEĞİL, BİR TAKAS — ve net sonuç DAHA SIKI bir kapı.** Eski kural
kaba bir sayımdı: üç aile kullanan her belge kırmızıydı ama ÜÇÜNCÜNÜN NE OLDUĞU
sorulmuyordu. `font-family: Georgia` yazan bir belge iki aileyle YEŞİL geçiyordu. Artık
meşruiyet sayıdan değil KAPALI LİSTEDEN geliyor.

⚠ **Liste ikinci kez yazılmadı:** `BEYAN_EDILEN_AILELER` doğrudan `YUZLER`den türüyor.
Bu depoda ikiz sözlük hatası üç kez tekrarlandı; dördüncüsü burada olmayacak.

⚠ ⚠ **AYRI TURDA VE AYRI COMMIT'TE — R-76.** Sınır bir önceki turda üçüncü yüz eklenince
kırmızıya döndü; kural o turda DEĞİŞTİRİLMEDİ, yüz geri alındı (D-282). Kapı yeşile
döndükten sonra, ayrı bir turda ve `refactor(gates)` tipli ayrı bir commit'le
değiştiriliyor. Kuralı kırmızıyken değiştirmek, kapıyı geçmek için kuralı yazmaktır.

**Geri alma maliyeti:** düşük — iki sayı ve bir ölçüm satırı.
