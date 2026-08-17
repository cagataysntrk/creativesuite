# Karosel görselliği — kesilmiş özne, süsleme dağarcığı ve yuva modeli

**Tarih:** 2026-08-17 · **Tetikleyen:** kullanıcının dört yeni örneği ve şu uyarısı:
*"fotoğrafı dümdüz şak diye koyamazsın"* · *"genelde bu tarz karosellerde bilgi olur,
ikon olur, generative görsellikler olur"* · *"önce temeli deterministik hazırlayıp
eklenecek görseli tarif edip Flux'a gönderip ekletiyorlar."*

## 1. Kendi referanslarımızda zaten fotoğraf YOK — ölçüldü

Doku payı (komşu piksel farkı 4–60 arası, fotoğraf imzası):

| Referans | Doku payı | Yorum |
|---|---|---|
| `karosel-sablon.png` | **%6,8** | düz renk + tipografi; slayt içi fotoğraf yok |
| `karosel-mockup.png` | %18,7 | doku slaytlardan değil, mockup'ın DUVAR fotoğrafından |

Fotoğrafı hattın parçası olduğu için sorgulamadan kullandım. FAZ-10.7'de bulduğum
kusurların çoğu tek kökten geliyordu — **oraya ait olmayan bir öge**: kutu gibi durması,
altında boşluk kalması, `kaydır ››` ile çakışması, mavi/turuncu makinelerin amber alanla
çarpışması.

## 2. Dört örneğin ortak dili

| Örnek | Teknik |
|---|---|
| Panoramik | Arka planı silinmiş figür + slaytlar arası süreklilik ögesi (akan ok) |
| Ürün | Kesilmiş ürün + arkasında beyaz daire (spot); renk alanı slayttan slayta dönüyor |
| Memphis | **Kapalı süsleme dağarcığı**: blob · nokta ızgarası · taralı daire · kontur halka · küçük kare. Fotoğraf kesilmiş ya da DAİRE MASKELİ |
| Editoryal | Yarım kareyi TAM TAŞAN fotoğraf; alan olarak, kutu olarak değil |

**Dördünde de ortak:** dikdörtgen, serbest duran fotoğraf YOK. Görsel ya kesik, ya
maskeli, ya da bir alanı uçtan uca dolduruyor. Süslemelerin tamamı vektör.

## 3. Sektör pratiği aynı yeri gösteriyor

B2B karosellerde görsellik **veri görselleştirme ve ikonografi** ile kuruluyor; stok
fotoğrafla değil. Tam genişlik kaplayan ögeler öneriliyor (inset dikdörtgenin tersi).
Tek aksan rengi + iki font kuralı bizde zaten var; kapak için 5–8 kelimelik kanca da
ölçülü şekilde tutuyor.

## 4. En önemli bulgu: bu yetenek BİZDE VAR ve hiç çağrılmıyor

Belge modelinde altı blok tipi tanımlı: `heading · body · chart · diagram · image ·
spacer`. `packages/render/src/charts/` altında `chart.ts` ve `diagram.ts` yazılı ve
test edilmiş.

**Üretim hattı bunlardan SIFIR tanesini üretiyor** (`grep -c "type: 'chart'\|type:
'diagram'" bodies.ts` → 0). Aynı zincir kırılması sınıfı, bir kez daha: çizen kod var,
üretim yolunda çağıranı yok. Fotoğrafı kullanmamın sebebi de buydu — bağlı olan tek
görsel yol oydu.

## 4b. ⚠ TEK ÇEŞİT YOK — kullanıcının en önemli düzeltmesi

*"unutma tek çeşidi yok, binlerce çeşidi var. mühim mesele estetik olması, hikayesinin
olması, akması."*

Bu, D-254'ün "gramer KAPALI" kararıyla **görünürde çelişiyor** ve çelişkiyi çözmek
gerekiyor, örtmek değil. Ayrım şu:

| Katman | Kapalı mı | Neden |
|---|---|---|
| **Garanti katmanı** | KAPALI | Türkçe tipografi, güvenli alan, kontrast, kelime bütçesi, tek font ailesi çifti. Bunlar açılırsa `ğ ş İ ı` garantisi ve okunabilirlik biter — çeşitlilik burada özgürlük değil, hata modu. |
| **Kompozisyon ailesi** | ÇOK OLABİLİR | Panoramik · spot daire · Memphis süsleme · editoryal yarım alan · veri odaklı… Her biri kendi içinde tutarlı; hangisinin kullanılacağı POST BAZINDA seçilir. |

Yani "kapalı gramer" = **bir şablon** demek DEĞİL. Bir aile kapalıdır (kaç kuralı var,
hangi ögeleri var); ama kaç aile olduğu açıktır. Bugünkü hata, tek aileyi tüm sistem
sanmaktı.

**Ölçüt üç kelime:** estetik · hikâye · akış. Üçü de metrikle tam ölçülemez — bu yüzden
görsel yargı adımı (D-256) bir konfor değil, ZORUNLU. Metrikler garanti katmanını
koruyor; estetiği göz ve yargı adımı denetliyor.

## 4c. Süreç: taban ÖNCE deterministik, ögeler SONRA modele ekletiliyor

*"önce temel formatını, arka plan ve yazıları vs hazırlayıp bir AI modele gönderip
ögeleri ya da fotoları mükemmelce ekleterek yapıyorlar."*

Bu bizim bugünkü akışımızın TERSİ. Bugün: model görsel üretiyor → biz belgeye koyuyoruz.
Önerilen: biz tabanı render ediyoruz → model o tabana öge ekliyor.

**Fark neden önemli:** model kompozisyonu GÖRÜYOR. Nereye ne sığacağını, hangi alanın boş
olduğunu, metnin nerede bittiğini biliyor. Bugünkü yolda model kör üretiyor ve biz
sonucu bir kutuya sıkıştırıyoruz — FAZ-10.7'de bulduğum bütün görsel kusurlar buradan.

**Yetenek farkı:** bu `image.generate` değil, **görselden görsele** (img2img / inpainting).
Yeni bir yetenek adı ve yeni bir sağlayıcı yolu ister; `GENERATE` fiili altında kalır.

⚠ **Garanti katmanı bu akışta da korunmak zorunda.** Model tabanın üstüne çizerken metne
girebilir ya da Türkçe glifleri bozabilir. İki savunma: (1) metin katmanı modele giden
tabanda DEĞİL, dönen görselin ÜSTÜNE yeniden basılır — böylece tipografi hiçbir zaman
modelden geçmez (R-20'nin doğal uzantısı); (2) tasarım metrikleri dönen varlığa da koşar.

## 5. Yuva modeli — önerilen mimari

**Taban DETERMİNİSTİK, görsel bir YUVAYA giriyor.** Kullanıcının tarif ettiği süreç bu
ve gramerimizle uyumlu: `sablon.ts` kompozisyonu kurar, üretilen varlık ilan edilmiş bir
yuvayı doldurur.

Yuva biçimleri — **kapalı liste**, çünkü açık liste gramerin kapalılığını bozar:

| Yuva | Ne ister | Bizde durum |
|---|---|---|
| `yok` | süsleme + tipografi yeter | **hazır** — gramer zaten bunu yapıyor |
| `sekil` | blob/daire/halka/nokta ızgarası | **CSS+SVG, sıfır bağımlılık** |
| `veri` | `chart` / `diagram` bloğu | **kod VAR, çağıran yok** → bağlanacak |
| `maske` | görsel + daire/eğri maskesi | CSS `clip-path`, ucuz |
| `alan` | yarım kareyi tam taşan görsel | kenar taşması ZATEN yapıldı |
| `kesik` | arka planı SİLİNMİŞ görsel (şeffaf PNG) | yeni makine gerekir |

`kesik` için iki yol: görsel modelinden şeffaf zemin istemek (güvenilmez), ya da yerel
arka plan silme. Planda zaten adı geçiyor: **BiRefNet (MIT)**, "yerelde bedava
çalışacaklar" listesinde. Lisans tuzağı notu duruyor: Bria RMBG **CC BY-NC**, MIT
`rembg` içinde paketli ve yanlışlıkla seçilmesi kolay.

## 6. Sıra önerisi — ucuzdan pahalıya, her adım tek başına değer

1. **`veri` yuvası** — `chart`/`diagram` üretim yoluna bağlanır. Kod hazır, en yüksek
   kaldıraç, B2B için en doğru görsellik. Fotoğrafa hiç gerek kalmadan slayt zenginleşir.
2. **`sekil` yuvası** — kapalı süsleme dağarcığı. Saf CSS/SVG, deterministik, gramerin
   doğal uzantısı.
3. **`maske` / `alan`** — mevcut görsel yolunun disiplinli hâli; fotoğraf kalırsa böyle kalır.
4. **`kesik`** — arka plan silme; ayrı bir karar ve ayrı bir bağımlılık ister.
5. **`taban→model`** — deterministik taban render edilip modele gönderilir, model ögeleri
   ekler, **metin dönen görselin üstüne yeniden basılır**. En güçlüsü ama en pahalısı;
   yeni yetenek (görselden görsele) ve yeni sağlayıcı yolu ister.

⚠ **Fotoğraf varsayılan olmaktan çıkıyor.** Varsayılan `veri` + `sekil`; fotoğraf ancak
konu gerçekten bir sahne istiyorsa ve o zaman da işlenmiş biçimde.
