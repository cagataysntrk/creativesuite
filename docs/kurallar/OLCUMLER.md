# Ölçümler — tasarım kurallarının kanıt defteri

> `KURALLAR.md` bir kuralın NE olduğunu ve nasıl zorlandığını söyler. Burası o kuralın
> sayısını nereden aldığını söyler: hangi çıktı ölçüldü, hangi ölçüt önce YANLIŞ
> seçildi, eşik hangi iki kümenin arasında duruyor.
>
> **Neden ayrı dosya (D-325).** `KURALLAR.md` her turda okunan bir indekstir ve tavanı
> bilgiyi sınırlamaya başladı: üç yeni kural ancak eski kuralların gerekçesi budanarak
> sığdı. Gerekçesi budanmış kural, bulunamayan kuralla aynı tuzağa düşüyor. `R-nn`
> başlıkları `KURALLAR.md`'de kalıyor — atıf sözlüğü ve `citations` kapısı bozulmuyor.
>
> ⚠ **Buradaki hiçbir sayı seçilmedi, ölçüldü.** Bir eşik değişecekse önce burada yeni
> bir ölçüm satırı doğar, sonra kural değişir.

## R-83 · punto okuma eşiği

Ölçü nominal punto değil, harfin gözde kapladığı AÇI — kritik punto 0,2° (Legge &
Bigelow 2011, *Journal of Vision*). Gövdemiz **34 px** ölçüldü; oran göreli olduğu için
başlık küçüldükçe daha da iniyordu. İstisna dar: üç kelimelik bir etiket TANINIR,
okunmaz — tanıma eşiği okuma eşiğinden düşük.

## R-84 · görsel metnin üstünde durmaz

Eşik **sıfır değil %12**: poster tipografisinde bir figürün kolunun harfin kenarına
değmesi tasarımın kendisi. Ölçüldü — gerçek bir koşuda metin alanının **%29'u** görselin
altındaydı. `metin-ortuluyor` boyama SIRASINI soruyordu ve doğru cevap veriyordu; yanlış
olan SORUYDU.

## R-85 · tanımsız token çağrılmaz

**CSS tanımsız bir `var()` için hata VERMEZ** — bildirimi geçersiz sayıp ögeyi sessizce
şeffaf bırakır. D-318 amber rampasını emekli etti, `aile.ts` iki değişkeni çağırmaya
devam etti; üç şablonun zemin ögesi kayboldu, hiçbir test kırmızı olmadı, çıktıya
bakmadan görülmesi imkânsızdı. Derleyici de göremez: çağrı bir DİZE içinde yaşıyor.

⚠ Kapının ilk sürümü HER `var()`e baktı ve 39 "ihlal" buldu, çoğu yanlış: bir belge
kendi `:root{--ui:…}` değişkenini tanımlayıp kullanabilir. Kapsam `--ramp-*` ve
`--role-*` ile sınırlandı — gürültülü bir kapı okunmaz olur.

## R-86 · ölçü bandı

Butterick 45–90 diyor; üst sınır **75**'e çekildi çünkü 1080 px'lik tuvalde 90 karakter
kart dolgusunu zaten aşıyor. Alt sınır üst sınır kadar önemli ve eksik olan oydu: çok
kısa satır gözü her satırda geri döndürüp ritmi kırıyor. Sayıldı — `donen` **19**,
`editoryal` 27, `sahne` 30 karakter; üçü de bandın altında ve hiçbir ölçüm görmüyordu,
çünkü kusur "taşma" gibi görünmüyor.

⚠ Alt sınır KOŞULLU: sütun 45 karakteri geometrik olarak kaldıramıyorsa zorlanmıyor.
İmkânsız bir şey isteyen ölçüm gürültüdür ve gürültülü kapı kapatılan kapıdır.

## R-87 · her kesimde taşıyıcı

Eski ölçüm belge düzeyindeydi: altı kesimden BİRİNDE taşıyıcı varsa belge temiz
sayılıyordu ve kalan beş kesimde göz bağı kopuyordu. Kesim başına ölçülünce `memphis`te
2, `editoryal`de 2 boş kesim çıktı.

⚠ **Mekanizma listesi üçüncü kez eksik kaldı.** Önce hayalet sanıldı (D-299'da kalktı),
sonra `ustDoku` eklendi (D-319'da kalktı), sonra ölçek bandı CSS'e taşındı ve `.bant
path` arayan sorgu onu göremedi: `donen`in taşıyıcısı TAM YERİNDEYKEN "kesintisizlik
yok" raporlandı. Bir mekanizmayı değiştirip ölçümü güncellememek bu depoda tekrar eden
hata.

## R-88 · güvenli alan ve metin payı

Üst dolgu 68 px'ti, eşiğin 12 px altında. Metin payı ölçülünce gövde kartlarında
**%36–38** çıktı: her slayt kapakla AYNI punto payını kullanıyordu ve sistemin kendi
merdiveni bunu zaten reddediyor — serif "tek H1", Montserrat "bölüm başlığı". Gövde
başlığı 0,82 çarpanıyla indi.

⚠ **İki eşik, çünkü iki kural çelişiyor:** "metin ≤%30" ile "başlık kadrajın üçte birini
kaplarsa KAHRAMAN olur" aynı kartta uzlaşmaz ve kapağın işi tam olarak kahraman olmak.
Tek eşik ikisinden birini yalanlardı.

⚠ **Panel metin DEĞİL, veridir** — ilk ölçüm onu da sayıp `veri-hikayesi`nin beş kartını
kırmızıya çevirdi; oysa o şablonun taşıyıcısı tam olarak veri paneli. Ray ve sayaç KROM:
kadrajı doldurmuyor, çerçeveliyor.

## R-89 · kelime bütçesi

*"5–8 kelimelik kanca"* bir pazarlama sezgisi DEĞİL, geometrik zorunluluk: başlığın
bakışlık puntoda (≥0,5° açısal x-yüksekliği) olması ve 2–3 satıra sığması gerekiyor;
1080 px tuvalde bu satır başına ~2,5 kelime eder. Aynı yoldan gövde ≈20 kelime çıkıyor —
**iki bağımsız türetmenin aynı sayıya varması kuralın kanıtı.**

⚠ ÜST sınır zorlanır, ALT sınır zorlanmaz. Üç kelimelik bir başlık ("Sessiz bir dönüşüm")
kusur değil, çoğu zaman daha güçlü. Ölçülen şey kadraja SIĞMA.

⚠ Ret RENDER'dan önce: dört görsel üretip sonra "başlık uzun" demek o parayı geri
getirmiyor.

## R-90 · yayın sözleşmesi

Graph API ikisini de açıkça sınırlıyor: *"Carousels are limited to 10 images"* ·
*"JPEG is the only image format supported"* (Meta Content Publishing, 30 Haz 2026).
Uygulama 20 slayta izin veriyor ama **bizim yayın yolumuz API** — iki sayıyı
karıştırmak, elle paylaşılabilen bir karoseli hattan geçirilebilir sanmak demek.

⚠ Hattımız PNG üretiyordu: her slayt yayın anında reddedilecekti, yani dört görsel
üretildikten, bir insan onayladıktan ve kota harcandıktan SONRA.

## R-91 · tuval tek kaynaktan

Aynı sayı altı ayrı dosyada kopyalıydı ve altı kopya, bir gün beşinin değişip birinin
unutulması demek. O gün panorama sessizce farklı orandan dilimlenir — ve Meta API'de
**ilk slaydın oranı tüm karoseli belirlediği için** geri kalan slaytlar KIRPILIR.

⚠ **3:4 artık resmî** (Instagram Yardım Merkezi, 29 May 2025: oran 1.91:1 – 3:4,
yükseklik 566–1440) ama 4:5 **Meta reklamında ZORUNLU** (min oran 400×500). Karar "hangi
oran" değil — oran bir PARAMETRE ve iki değer de aynı hattan üretilebilmeli. Genişlik
her iki oranda da 1080: üstünü Instagram kendi yeniden örnekleyicisiyle küçültüyor.

## R-92 · üretim yolu imza taşır

Dosyalar `brand/<id>/logo/` altında duruyordu, `logoVarliklari()` yazılmış ve test
edilmişti — ama **tek çağıranı `scripts/duzenleyici.mjs`, yani editör önizlemesiydi**.
`uret.mjs` içinde `logo` kelimesi hiç geçmiyordu ve `panorama.ts` *"verilmezse imza
BASILMIYOR"* diyordu. Üretilen hiçbir karosel imza taşımıyordu; hiçbir test kırmızı
değildi.

⚠ **Zincir kopukluğunun yedincisi:** modül var, test yeşil, üretim yolu yok — D-182 ·
D-190 · D-224 · D-250 · D-261 · D-270 ailesi. Modülü test etmek zinciri test etmiyor;
bu yüzden test ÇAĞRIYI sınıyor.

⚠ Eksik logo koşuyu DURDURMUYOR, fontun aksine: font eksikse çıktı YANLIŞ üretilir
(sistem fontu, bozuk Türkçe), logo eksikse geometrik yedek çizilir ve o meşru bir
çıktıdır. Ama sessiz değil — uyarı basılıyor.

## R-93 · sahne kaymaz

`<svg class="filtre-tanim" width="0" height="0">` tanımları gövdede INLINE duruyordu.
Sıfır boyutlu bir inline öge bile satır kutusu doğurur ve o kutunun strut yüksekliği
**21 px**: görsel işlemi olan HER belge 21 px aşağı kaymış üretiliyordu — üstte gövde
zemininden bir şerit, altta kartın son 21 px'i (imza rayı) kadrajın dışında.

⚠ **Var olan hiçbir kusur bunu göremezdi** çünkü bütün ölçümler ögeleri KARTA göre
okuyor: taşma kart kutusunda, güvenli alan kart kenarından, metin payı kart alanına
bölünerek. Kart kendi içinde kusursuzdu; yanlış olan YERİYDİ.

⚠ Kural iptal edilip koşuldu: kusur tam olarak görsel işlemi olan ÜÇ şablonda kırmızı,
diğer üçünde sessiz.

## R-94 · dikiş dışlama bandı

Türetme (`docs/referans/arastirma-2026-08.md` böl. 1.3): tek fiksasyonun net bölgesi
≈2° görsel açı; bu tuvalde 2° = 186 px, yarısı **93**. Öge kesime bundan yakınsa
okuyucunun TEK bakışında kesimle birlikte düşüyor. Ezme eşiği **%40**: gözün ikinci
slaytta AYNI kütleyi bulması. *"Biraz taşsın" en kötü seçenek* — ne devamlılık kuruyor
ne bütünlük.

Ölçüldü: `sahne`nin "1↔2 kesimi" diye ADLANDIRILMIŞ öznesi kesimin **0,4 px** solunda
bitiyordu; `memphis` üç kesimini de aşıyordu ama %16–28 ile; `donen` ve `editoryal`de
görselin kenarı kesime TAM oturuyordu.

⚠ `kesintisizlik-yok` hepsinde sessizdi çünkü kesimleri başka bir taşıyıcı — ince bir
çizgi — geçiyordu. **Kesimde bir şeyin bulunması, doğru şeyin bulunması demek değil.**

⚠ Ölçü BOYANAN alandan: `object-fit: contain` kutuyu doldurmuyor ve kutunun kenarı
kesime değse bile boya içeride kalabiliyor. Tasarımın niyeti kutu, gözün gördüğü boya.

⚠ **Büyütme DENENDİ ve geri alındı.** `donen` %27'den %46'ya çıkarılınca gövdenin
**%86'sı** görselin altında kaldı, `memphis`te %60. 1080 px'lik slayttan 734'ü özneye
verilirse metne 346 px kalıyor. Özne boyu bir tercih değil, kompozisyonun kendisi:
`sahne` tek özneyi kahraman yapıyor, `memphis` üç özneyi altı slayda dağıtıyor.

## R-95 · krom okunur

Ray zaten bir perde taşıyor (`--kart-zemin` %90'dan şeffafa bir degrade) ve bu yeterli
sanıldı. Kesik özne kahraman ölçüye çıkınca ayakkabısı rayın içine girdi: perde o
yükseklikte %82'ye düşüyor, metin ise `--kart-metin` %48 — parlak bir yüzeyin üstünde
ikisi birden kayboluyor. `01 / 04` okunmuyordu. **Mekanizma vardı, parametresi yanlıştı.**

⚠ **İlk ölçüm MEDYANA baktı ve kusuru göremedi — göz görmüştü.** İfşa şeridi geniş,
`ray-sayac` ise 84 px: ayakkabı kutunun yarısını kaplasa bile medyan koyu kalıyor.
Medyan sağlam bir istatistik olduğu için burada YANLIŞ istatistik.

Doğru ölçü iki render farkı: metin gizleniyor, zeminin metin lumasına 44'ten yakın
piksel PAYI sayılıyor. Eşik **%4** ölçülerek seçildi — altı şablonun 90 krom kutusunda
temiz olanların hepsi tam **%0**, kirli tek kutu **%10**.

⚠ Sentetik ihlal DENENDİ ve tutmadı: tam kadraj BEYAZ bir görselle bile kusur çıkmıyor,
perde zemini yeterince bastırıyor. Kanıt gerçek çıktıdan geldi (%10 → %0).

## R-96 · özne zeminden ayrışır

`memphis`in kâğıt kartında beyaz çizgili kesik özne, beyaz zeminde yalnız TEMAS
GÖLGESİNDEN seçiliyordu. Var olan hiçbir ölçüm göremezdi: görsel oradaydı, kutusu
doğruydu, metni örtmüyordu, kesime uzaktı — yalnız görünmüyordu.

⚠ **İlk iki ölçüt yanlış şeye baktı.** Ortalama fark gölgeyi görünürlük sanıyor; medyan
ise ince bir özneyi (ölçüm sehpası) görünmez sanıyor. Doğru soru "ne kadar mürekkep var"
değil, **olan mürekkep ayırt ediliyor mu**: silüetin p90 luma farkı.

Eşik **120** okundu, seçilmedi: on iki görselin çalışan dokuzunda p90 **226–249**, üç
hayalette **48–81**. 120, 145 birimlik bir boşluğun ortasında.

⚠ **Kusur şablonda değil, VARLIĞIN KUTUPLULUĞUNDA.** Aynı hat, koyu mürekkepli bir
varlıkta aynı kâğıt kartta kusursuz çıkıyor (`editoryal` slayt 2). Hangi kutupta
üretileceğini hat garanti edemiyor; garanti bu yüzden RENDER tarafında veriliyor.

⚠ `tema-uyum` adıyla uyum vaat ediyordu ama kartın açık mı koyu mu olduğunu hiç
sormuyordu — sabit bir sıcaklık matrisiydi ve `intercept: +0.03` ile görüntüyü AÇIYORDU.
Görseller kartların DIŞINDA, ayrı bir katmanda yaşıyor ve hiçbir kartın rengini miras
almıyor; cevap yalnız KONUMDAN gelir.

Düzeltmeden sonra ölçüldü: memphis 48–81 → **134–140**, `donen`in kâğıt kartındaki iki
ürünü de 240→254 ve 242→249'a çıktı. Kural iptal edilince tam olarak o üç görsel kırmızı.

## R-97 · krom şeridi ayrılmıştır

R-95 yazılırken kural açıkça *"görsel raya girmesin demiyor; perdesiz girmesin diyor"*
diye sınırlandırılmıştı — tam kadraj fotoğrafın üstünde künye satırı meşru bir editoryal
araç sayıldı. **Ölçüm o kararı bozdu.**

`editoryal`in tam boy şeridinde ray, kesik öznenin ayakkabılarının üstüne düşüyordu.
`krom-okunmuyor`un ilk istatistiği (zeminin metin lumasına yakın piksel payı) **%0**
diyordu ve haklıydı: ayakkabı beyaz, konturları siyah, metin koyu — hiçbir piksel metne
yakın değil. Metin yine de okunmuyordu.

⚠ **Eksik olan istatistik GÜRÜLTÜ.** Yarısı siyah yarısı beyaz bir zeminde hiçbir piksel
metne yakın değildir ve metin yine de çizgilerin içinde yüzer. Ölçüldü: zeminin medyandan
60 lumadan fazla sapan piksel payı — 90 krom kutusunun **88'i tam %0**, kirli ikisi **%4**
ve **%8**, ikisi de `editoryal`. Tavan %3, iki kümenin arasında.

⚠ Perde neden yetmiyor: ray fine print taşıyor (logo, dönem, sayaç), masthead değil.
Fotoğraf üstünde fine print için yumuşak bir degrade yetmez, opak bir bar gerekirdi — o da
rayı tasarımın parçası olmaktan çıkarıp bir kutuya çevirirdi.

⚠ Bant SABİTTEN değil `.ray` kutusundan okunuyor: dolgu sabitini denetimde tekrar yazmak,
CSS değişince sessizce yanlış yeri korumak demekti.

**Yan kazanç aile.** Altı şablonun altısında da görüntü aynı yerde bitiyor (1255 px, ray
1259'da). Ortak bir zemin çizgisi, altı ayrı tasarımı tek bir sayfanın parçası yapan
şeylerden biri — ve kullanıcının istediği tam olarak buydu.

## R-99 · ölçek tek tabandan

Sistemin "ölçeklenen" yanı doğruydu: başlık ikili aramayla, gövde `GOVDE_TABANI_1080`
ile, panel `--panel-olcek` ile tuvale bağlıydı. **Krom değildi.** `.ray-logo{24/104px}`,
`.kilometre-nokta{13px}`, `.kilometre-etiket{16px}`, `.ray{font-size:18px; bottom:46px}`
ve kart dolgusu `80/64/190px` — hepsi çıplak piksel.

⚠ **Bu kusuru tek tuvalde görmek imkânsız.** Tek tuvalde her sayı doğru GÖRÜNÜR, çünkü
referansı yoktur. Ancak iki tuvalin ORANI karşılaştırılınca ortaya çıkıyor: 1080 → 1350
(%25) geçişinde tipografi büyüyor, krom olduğu yerde kalıyordu.

Düzeltmeden sonra ölçüldü (1080 → 1350):

| öge | 1080 | 1350 | beklenen |
|---|---|---|---|
| ray puntosu | 18 | 23 | 22,5 |
| logo eni × boyu | 104 × 24 | 130 × 30 | 130 × 30 |
| kilometre noktası | 13 | 16 | 16,25 |
| kilometre etiketi | 16 | 20 | 20 |
| kart dolgusu | 64 | 80 | 80 |
| ray yüksekliği | 46 | 58 | 57,5 |

⚠ Test `null`u "geçti" saymıyor: `.ray-logo` çizilmemişse ölçüm YAPILMAMIŞTIR. Logo bu
yüzden teste açıkça veriliyor — ölçülemeyen geçmiş sayılmaz.

⚠ Kasten ihlal edildi: tek bir `olc(18)` çıplak `18px`e döndürüldü ve test *"ray puntosu:
18 → 18, beklenen ≈22,5"* diyerek kırmızıya döndü. Kusuru ADIYLA söylüyor.

⚠ **Taban çizgisi ızgarası (54 px) bu adımda KAPANMADI** ve sebebi ölçülerek anlaşıldı:
kartın dış dolgusu bir çerçeve, metin ritminin parçası değil. Müller-Brockmann'ın iddiası
bloklar ARASI boşlukla ilgili. 54'ün yarımlarına izin vermek kuralı anlamsız kılıyordu
(27 ile neredeyse her sayı ifade edilebiliyor). Ayrı bir adım — 18.13b.

## R-100 · taban çizgisi ızgarası

Faz planı bir sayı varsayıyordu: `TABAN = gövdePuntosu × satırAralığı = 40 × 1,35 = 54`.
**Ölçüldü ve iki çarpan da yanlıştı.** Gerçek satır aralığı **1,50**; gövde puntosu ise
şablondan şablona değişiyor:

| şablon | gövde | satır aralığı | taban |
|---|---|---|---|
| `sahne` · `donen` | 36,0 | 1,50 | **54,0** |
| `editoryal` | 36,6 | 1,50 | **54,9** |
| `akan-alan` | 39,4 | 1,50 | **59,1** |
| `memphis` | 40,4 | 1,50 | **60,6** |
| `veri-hikayesi` | 40,8 | 1,50 | **61,2** |

Sabit 54, altı şablonun **beşinde** yanlış bir ızgara dayatırdı.

⚠ **Neden değişken:** gövde puntosu `max(taban, başlıkPuntosu × oran)` ve başlık puntosu
ikili aramanın sonucu — metne bağlı. Taban ancak ölçüm KOŞTUKTAN sonra bilinebiliyor.

⚠ **Kapsam ölçülerek daraldı.** Ölçüm gösterdi ki YAZILI yalnız üç boşluk var (14 · 44 ·
132); geri kalan her şey `margin-top: auto`nun artığı — tasarım kararı değil. Üst başlık
→ başlık da istisna: ikisi tek birim.

⚠ **Kural render'da sınanamaz.** `getComputedStyle().marginTop` `auto` için de KULLANILAN
pikseli döndürüyor; tabana bağlı bir boşlukla `auto` bir boşluk tarayıcıda ayırt
edilemiyor. İki sınav: CSS tabanı çağırıyor mu, ve `--taban` KURULUYOR mu.

⚠ Zincir kasten koparıldı (`--taban` yazan satır iptal edildi): altı şablon da
*"--taban hiç kurulmamış"* diyerek kırmızıya döndü. Kurulmazsa yedek sessizce devralır ve
her şablon yanlış ritme döner.

Düzeltmeden sonra: `başlık→gövde` her şablonda **tam 1× kendi tabanı**, `gövde→panel`
`memphis`te **tam 2×**.

## R-101 · marka varlıkları devralınır

Token sistemi kalıtımı zaten biliyordu: `brand/<id>/parent` tek satır ve `brd_dima`
yalnız `state-ok` rolünü ezip *"ezmediğin şey MİRASTIR"* diyor. **Font ve logo o cümlenin
dışındaydı.** Ölçüldü:

```
brd_dima   font ok: false  eksik: 8
           logo ok: false  eksik: upcytech-mavi.png, upcytech-siyah.png
```

`uret.mjs` doğrudan `brand/brd_dima/fonts` bakıyor, bulamıyor ve `process.exit(1)`
ediyordu. Yani `brd_dima` bir alt marka gibi TANIMLIYDI ama bir alt marka gibi
KOŞAMIYORDU.

⚠ **Eksik listesi ikinci kusuru da söylüyor:** aranan dosyaların adı `upcytech-mavi.png`
ve `upcytech-siyah.png`. Marka-nötr bir modülde (`logo.ts`) bir markanın adı — ikinci
marka kendi işaretini koyamazdı, çünkü dosyanın adı başka bir markanın adıydı. Seçim
zeminin açıklığından yapılıyor, markadan değil; ad da öyle olmalı: `isaret-koyu` /
`isaret-acik`.

⚠ **Kopyalamak alternatif değildi.** Sekiz woff2'yi her alt markaya kopyalamak, kopyanın
bir gün ayrışması ve iki markanın aynı ada sahip iki farklı fontla üretim yapması
demekti.

⚠ **Zincir "dizin var mı" diye sormuyor, "sonuç TAM mı" diye soruyor.** İlk tasarım
"dizin varsa onu al" idi; alt markanın boş bir `fonts/` klasörü olsa zincir orada durur
ve koşu yine fontsuz kalırdı. Kalıtımın anlamı *"eksik olan yukarıdan gelir"*.

⚠ Kısmi devralma YOK: bir marka fontlarını eziyorsa hepsini ezer. Yarısı kendinden
yarısı atasından gelen bir tipografi, iki markanın karışımıdır.

⚠ Döngü (`a → b → a`) sessizce atlanmıyor, zincir orada KESİLİYOR — sonsuz döngüye
girmek yapılandırma hatasını gizler.

Düzeltmeden sonra: `brd_dima` font **OK** (devralındı `brand/brd_upcytech/fonts`), logo
**OK** (devralındı). Ana marka kendi varlıklarını kullanıyor, zincir onu atlamıyor.
Zincir kasten koparıldı (`varlikZinciri` çağrısı elle diziye çevrildi) → test kırmızı.

## R-102 · token yüzeye göre çözülür

Kapı (D-320) tanımlı token'ları `tokens.css` dosyalarının **birleşiminden** topluyordu.
Bir kaskat dört blok taşıyor — `:root`, `console`, `kreatif`, `studio` — ve aynı değişken
hepsinde yeniden tanımlı. Birleşimde "tanımlı" görünen bir değişken, kullanıldığı yüzeyde
TANIMSIZ olabiliyor.

**Kusur 1 — uyarı rengi.** `--role-state-danger` yalnız `kreatif` bloğunda; kabuk
`data-surface="console"` ile koşuyor. Ölçüldü:

| öge | renk |
|---|---|
| `.is-hat` (gövde) | `oklch(0.97 0.004 250)` |
| `.is-uyari` (uyarı) | `oklch(0.97 0.004 250)` ← **aynı** |
| `--role-state-danger` (console) | *(boş)* |
| `--role-state-error` (console) | `oklch(0.58 0.160 25)` |

Panelde *"⊘ kusurlu manifest"* ve *"✎ N slayt elle düzenlendi"* gövde metniyle birebir
aynı renkte çiziliyordu.

**Kusur 2 — kapı düzeltilince ortaya çıktı.** Yüzey başına çözüm açılır açılmaz DOKUZ
ihlal daha: `--role-accent` de yalnız `kreatif`te tanımlıydı ve kabuk onu dokuz yerde
çağırıyor — aktif sekmenin çerçevesi dahil.

⚠ **Ders `koyuMu()`nunkiyle aynı:** doğru dosyayı okumak, doğru YERİ okumak değildir.

⚠ Eşlenmemiş dosya birleşime düşüyor ama SAYISI raporlanıyor (bugün 2). Sessizce
genişleyen bir istisna, istisna değil deliktir.

**Gözle doğrulandı.** Panel açıldı, ekran görüntüsü alındı ve BAKILDI: uyarı kırmızı
(`oklch(0.58 0.16 25)`), aktif sekmenin çerçevesi mavi (`oklch(0.6 0.206 262)`).
