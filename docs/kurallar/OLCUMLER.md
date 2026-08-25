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

## R-103 · yasak terim listesi

Liste altı terimdi; sistemin sözlüğü ~20. Genişletilince `lexicon` kapısı **üç canlı
ihlal** buldu:

```
corpus/messaging/olcum-mesaj-evi.md          "dünya lideri"
corpus/positioning/imalat-verimlilik-konumu.md  "özel çözümler"
corpus/positioning/veri-katmanindan-karara.md   "akıllı genbi"
```

⚠ **Üçüncüsü öğretici:** `olcum-mesaj-evi.md` yasak terimleri LİSTELEYEN kayıttı ve
listeyi kopyaladığı için kendi yasağını ihlal ediyordu. Çözüm kopyayı kaldırmak — iki
kopya bir gün ayrışır ve hangisinin geçerli olduğu cevapsız kalır.

⚠ **Sınır ÖBEK/SIFAT ayrımında ve bu ölçülerek bulundu.** Çıplak `çözüm` denenseydi
teknik nesir kırmızıya dönerdi; `çözüm odaklı` yalnız pazarlama dolgusunu yakalıyor.
Aynısı `akıllı` için: `akıllı telefon` meşru, `Akıllı GenBI` bir üstünlük iddiası.

⚠ Kasten ihlal: *"tesise özgü yazılım"* → *"yenilikçi çözümler"* yazıldı, kapı
*"yasak terim yenilikçi"* diyerek kırmızıya döndü, geri alındı.

**Hayalet yolun kökü bir ŞABLONDU.** `registry/lexicon/tr` iki kayıtta ve `ANAYASA.md`'de
geçiyordu; kaynağı `scripts/kesif-roportaj.mjs` — yani üretilen HER yeni kayıt onu
taşıyacaktı. Var olmayan bir yolu gösteren belge, bağlamı sıfırlanmış bir agent'ı arama
yapmaya yollar.

## R-104 · kaynak satırı

Faz maddesi *"kaynak satırı bizde HİÇ yok"* diyordu. **Ölçüm aksini gösterdi:** yuva var
(`rayaOrta`), rayda mono büyük harfle çiziliyor, `sablon-uyarla` boş ve örnek-işaretli
değerleri reddediyor, uyarlama istemine yazılı. Madde bayatlamıştı.

**Gerçek açık:** boş `rayaOrta` → boş `<span>` → hiçbir şey çizilmiyor.

```
ray-orta → ""            (düzeltmeden önce: görünmez)
ray-orta ray-orta-bos → "KAYNAK YOK"   (sonra: kesikli kutu)
```

⚠ Sessiz boşluk, eksik veriden daha tehlikeli: slayt **kusursuz görünüyor**. İnsan kapısı
imzasız bir çıktıyı imzalı sanıp onaylar.

⚠ Ölçüm düzeltmenin KENDİSİNİ arıyor (`.ray-orta-bos`) — kutu varsa kaynak yoktur. İki
mekanizmanın ayrışması böylece imkânsız.

Kasten ihlal: ilk kartın `rayaOrta`sı boşaltıldı → `kart 1: kaynak satiri BOS` ve rayda
kesikli kutu göründü. Çizildi ve BAKILDI.

## R-105 · metin zemininden ayrışır

Krom için ölçülüyordu (R-95), içerik için ölçülmüyordu. Yeni `alinti` şablonunda etiket
paneli alan sınırının TAM üstüne düştü ve denetim *"0 kusur"* dedi.

Ölçüm eklendiğinde üç bulgu çıktı ve üçü de YENİ şablonlardaydı — altı eski şablon temiz:

```
alinti         etiketler  %100 yakın   (kâğıt/mürekkep sınırı tam altında)
karsilastirma  baslik     %69 yakın    (kâğıt alanı başlığın üstüne geldi)
karsilastirma  govde      %15 gürültülü
```

⚠ **Ölçü kromunkiyle aynı ve bu bilinçli:** metin metindir. İki istatistik — zeminin
metne YAKINLIĞI (%4) ve zeminin GÜRÜLTÜSÜ (%12). İkincisi olmadan yarısı siyah yarısı
beyaz bir zemin "temiz" görünür.

⚠ **Tek çift ekran görüntüsü, kutu başına değil.** Kutu başına iki çekim 80 çekim ederdi;
tüm panorama iki kez çekiliyor (metinli/metinsiz) ve her kutu o iki resimden okunuyor.

## Şablon ailesi 6 → 10 — bulunan kusurlar

Dört yeni şablon (`kavis` · `alinti` · `karsilastirma` · `dizin`) yazılırken kurulu
kapılar ÜÇ tasarım kusuru buldu, ama asıl değerli olanları GÖZ buldu ve ölçüm sonradan
doğruladı:

**1. `kemer` taşıyıcısı kırıktı** — modelde vardı, hiçbir şablon kullanmıyordu. Geometri
MUTLAK PİKSELLE yazılmıştı (52 · 132 px) ama `viewBox` tüm panorama boyutunda ve
`preserveAspectRatio="none"` ile 560 px'lik banda sıkışıyor: dikey **%41'e** iniyor.
132 px'lik tepe ekranda ~55 px oluyordu. Kullanılmamasının sebebi tercih değil,
koordinat uzayıydı. Ölçüler bandın kendi yüksekliğinin payına çevrildi (%10 taban,
%86 tepe) ve form DOLDURULDU — araştırma dolu formu ince yaydan güçlü sayıyor.

**2. Oklar yön vermiyordu.** Basınç `0,18 + 0,82·sin(tπ)` idi: iki ucu da ince,
simetrik — bir MERCEK. Dosyanın kendi yorumu *"yön kıvrımdan okunuyor"* diyordu ama
simetrik bir daralma yön taşımaz; çizildi ve bakıldı, oklar mavi yapraklar gibi
duruyordu. Basınç tek yönlü azalıyor artık (`0,95 − 0,75·t`).

**3. ÇUBUK GRAFİĞİ VERİ TAŞIMIYORDU.** Kart bir flex sütunu ve `align-items:
flex-start`; panelin eni içeriğine kilitleniyor, yani `.cubuk-yuva { flex: 1 }`
büyüyecek boşluk bulamıyor. Ölçüldü — yuva `veri-hikayesi`de **10 px**,
`karsilastirma`da 42 px. Üç ayrı değer (62 · 71 · 58) aynı minik kare olarak
çiziliyordu. `max-width` bunu çözmüyor: max bir TAVAN, taban değil. `width: 100%`
eklendi → yuva 631 px.

⚠ Üçü de ESKİ şablonları da etkiliyordu; küçük panelde ve kullanılmayan bir bantta
saklanıyorlardı. **Yeni şablon yazmak, eski şablonların denetimidir.**

⚠ Etiket sütunu SABİT genişlikti ve Türkçe etiket taşıyordu ("A vardiyası" kırpılıyordu).
`flex: none` + `min-width`: sütun en az tabanı kadar geniş, gerekirse kelimeye açılıyor,
çubuklar kalan yeri paylaşıyor — eksen hizası korunuyor (R-23).

## R-107 · aile ölçülebilir

On kapak tek sayfada ölçüldü — ailenin üç ortak ekseni:

| şablon | H1 | gövde | ray | baskın ton |
|---|---|---|---|---|
| veri-hikayesi | 151 | 41 | 18@1259 | 220° · %98 |
| akan-alan | 131 | 39 | 18@1259 | 220° · %98 |
| sahne | 93 | 36 | 18@1259 | 220° · %99 |
| memphis | 119 | 40 | 18@1259 | 220° · %100 |
| donen | 74 | 36 | 18@1259 | 220° · %86 |
| editoryal | 122 | 37 | 18@1259 | 220° · %100 |
| kavis | 148 | 46 | 18@1259 | 220° · %100 |
| alinti | 138 | 36 | 18@1259 | 220° · %100 |
| karsilastirma | 140 | 42 | 18@1259 | 220° · %99 |
| dizin | 128 | 41 | 18@1259 | 220° · %99 |

⚠ **Onunda da tek ton.** Hiçbir şablon ikinci bir renk kümesi getirmiyor; kalan %1–14
kenar yumuşatmanın 210°'si. Bu, ızgaranın en görünür ortak ekseni ve tek sayıyla
ölçülebiliyor.

⚠ **Krom birebir aynı** — on yerde de 18 px, üst kenar 1259. Mutlak sayıyla değil
EŞİTLİKLE sınanıyor: ilk sürüm `rayCocuk === 4` yazdı ve on şablonda kırmızıya döndü,
çünkü öge sayısı logo verilip verilmemesine bağlı — o iddia şablonu değil FIXTURE'ı
ölçüyordu. Ailenin tanımı *"krom dört ögedir"* değil, *"krom her şablonda AYNIDIR"*.

⚠ **H1 serbest ve bu bir kusur değil:** 74–151 px. Başlık kadraja oturuyor; ortak olan
ölçek, piksel değil.

⚠ **Doygunluk eşiği 0,25** — nötr rampa chroma 0 (D-318) ama kenar yumuşatma gri
piksellerde küçük bir doygunluk üretiyor. Eşiksiz ölçüm o gürültüyü renk sayardı.

Kasten ihlal: `dizin`in aksanı turuncuya (50°) çevrildi → baskın ton 220°'den saptı ve
test *"bozuk 50° · sağlam 220°"* diyerek kırmızıya döndü.

⚠ **Izgara sayfasının KENDİ kusuru da bakılarak bulundu:** künye şeridi altta duruyordu
ve slaydın RAYINI örtüyordu — sınavın bakacağı ögeyi sınav sayfası gizliyordu. Üste
alındı. Ölçüm aleti ölçtüğü şeyi kapatıyorsa alet değildir.

## R-109 · taşıyıcı yüzey adımı + hairline

Üç taşıyıcı da **atmosfer** olarak çiziliyordu ve üçü de görünmüyordu. Ölçüldü:

| taşıyıcı | eskiden | ölçü | şimdi |
|---|---|---|---|
| `alanSiniri` | `role-bg` / `role-line-edge` | **ΔL 0,03** | `ink-1000` / `ink-850` · ΔL **0,165** + hairline |
| `kemer` | `AKSAN` %10 tint | zeminde sis | `ink-850` %55 + `--pano-metin` %20 kontur |
| `egri` | `stroke-width: 0.22` + degrade | **alt piksel** | `stroke-width: 2` + düz yüzey |

⚠ **`vector-effect="non-scaling-stroke"` genişliği CİHAZ pikseline çeviriyor.** 0,22 ve
D-319'daki 0,12 aynı sebeple kayboldu — aynı hata, iki yıl arayla değil iki ay arayla.

⚠ **Degrade zaten emekliydi (D-318)** ama `egri` bandı bir `linearGradient` taşımaya devam
ediyordu: karar verildi, uygulama takip etmedi. Bu, "kural yazılı, ölçüm yok" ailesinden.

⚠ **Kontur `--pano-metin`den türüyor, aksandan değil:** kemer bir VURGU değil bir ZEMİN
formu. Aksanı forma dökmek tek-karneli-aksan kuralını (D-318) deler.

Hepsi çizilip BAKILDI: `akan-alan`ın dalgası altı slaydı kat ediyor, `kavis`in kemerleri
mimari bir ritim kuruyor, `veri-hikayesi`nin eğrisi okunur bir hat oldu. Üçü de önce
görünmüyordu ve hiçbir kapı bunu söylemiyordu — çünkü hiçbir kapı *"taşıyıcı görünüyor
mu"* diye sormuyordu.

## Ölü kuşak: kutu ölçümü ile mürekkep ölçümü TERS cevap verdi

`memphis`in kapağına bakılınca metin bloğu ile figür arasında büyük bir boşluk
görünüyordu. İki alet ölçtü ve **birbirinin zıddını** söyledi:

| şablon | kutu ölçümü (DOM) | mürekkep ölçümü (piksel) |
|---|---|---|
| `memphis` | %17 — ailenin **en iyisi** | %53 — ailenin **en kötüsü** |
| `akan-alan` | %43 — ailenin **en kötüsü** | %19 — ailenin **en iyisi** |

Sebep: `.gorsel` kutusu **yuvayı** ölçüyor, mürekkebi değil. Kesik PNG'nin saydam kenar
payı kutuya dahil, göze değil. Göz mürekkebe bakar — ölçü de mürekkebe bakmalı.

**İkinci ayrım, ilkinden önemli:** boşluk `yarık` (üstünde VE altında mürekkep var) ile
`pay` (kadraj kenarında) ayrılmadan anlamsız. `sahne`nin %36'sı üst paydır — koyu bir
afişin nefesi. `memphis`in %53'ü iki içerik arasındaydı: kompozisyonu ikiye bölen bir
yarık. Aynı sayı, zıt yargı.

Altı yuvaya çıkarıldıktan sonra ailenin yarık dağılımı: 15 · 19 · 22 · 22 · 26 · 27 ·
28 · 30 · 32 · 36. Aykırı değer yok — `memphis` %53'ten %27'ye, kenar payı %44'ten %3'e.

## Eğri kapakta düzdü — ve ÖLÇÜT bir kez yanlış seçildi

`veri-hikayesi`nin başlığı *"altı yılda İKİ KATINA çıkan bir eğri"* diyor; kapaktaki
eğri neredeyse yatay çiziliyordu. Dikey yolculuk slayt başına:

| | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| önce | 2 | 3 | 3 | 5 | 5 | 3 |
| sonra | 5 | 5 | 5 | 5 | 4 | 5 |

**Buradan bir eşik yazmak yanlış olurdu.** İlk ölçüm ailenin öteki çizgi taşıyıcılarını
6–26 gösterdi (`akan-alan` 13, `karsilastirma` 12, `editoryal` ve `alinti` 6) ve %6'lık
bir taban davetkâr göründü. Ama o altı değerin hepsi `alanSiniri` — **tam kadraj**
aygıtı. `egri` dibe yaslı 560 px'lik bir bandın içinde yaşıyor (kadrajın %41'i) ve
türünün tek örneği. Tek üyeli bir popülasyondan eşik türetilmez.

Ölçülebilir olan başkaydı: eğri kendi bandının yalnız **%49'unu** kullanıyordu (y 78→29).
Genlik 70→4'e açıldı; band, başlangıç bölgesi ve hikâye aynı kaldı.

**Aynı turda alet ÜÇÜNCÜ kez yanlış şeyi ölçtü.** Genlik açılınca eğri pulların içinden
geçti. Açıklık ölçüldü ve *"144 px temiz"* çıktı — ama ölçülen `.kilometre` kutularıydı,
kapaktaki pullar ise `.etiketler`. Doğru kutuyla bakınca pullar y 1092–1160, eğri 1114:
kesişiyordu. Denetim de sessizdi, çünkü `METIN_KUTULARI` yalnız başlık/gövde/üst etiketi
tanıyordu. Kapı pul sırasına açıldı ve **kendi düzeltmesini %2,6 ile yakaladı.**

## Satır sıkışması: ÜÇ ALET DENENDİ, ÜÇÜ DE GÖZLE ÇELİŞTİ — kural YAZILMADI

`alinti` kapağında satırlar birbirine değiyor göründü. Ölçmeye çalışıldı:

1. **Mürekkep bantları.** Başlık kutusundaki dolu piksel satırlarını bantlara ayır,
   aralarındaki boş satırı say. `alinti` 8 px çıktı, en dar `veri-hikayesi` ve
   `karsilastirma` 3 px. ⚠ **Kırık:** bir harfin NOKTASI gövdesinden ayrıksa fazladan
   bant sayılıyor; daha kötüsü, gerçekten değen iki satır TEK bant olup ölçümden
   düşüyor — yani alet en kötü vakayı göremiyor.
2. **Satır kutusu + boş satır.** `Range.getClientRects()` ile gerçek satırlar alındı.
   Şimdi `sahne` ve `alinti` **0** verdi. ⚠ **Çelişki:** ikisine de bakıldı ve ikisi de
   GÜÇLÜ duruyor. Sıfır "değiyor" demek değil, "temiz beyaz bant yok" demek — çıkıntılar
   yatayda kaymışsa göz rahatsız olmuyor.
3. **Sütun başına en yakın mesafe.** İki satırın ortasından yukarı ve aşağı tarayıp en
   yakın mürekkep çiftini bul. ⚠ **Kırık:** bir çıkıntı orta satırı geçiyorsa hem yukarı
   hem aşağı arama AYNI pikseli buluyor ve mesafe 0 çıkıyor — beş şablonda öyle oldu.

**Sonuç: ölçü yok, düzeltme var.** `veri-hikayesi` (0,98 → 1,04) ve `karsilastirma`
(1,02 → 1,08) kırpılıp BAKILARAK düzeltildi; öncesi ve sonrası yan yana kondu. Kural
YAZILMADI — kırık olduğu bilinen bir ölçüye kural bağlamak, kuralsızlıktan kötüdür.

⚠ Ayrıca kesin olan bir şey var: **ayar sonucu öngörmüyor.** `sahne` 0,96 ile rahat,
`karsilastirma` 1,02 ile sıkışıktı. Sıkışmayı `satirAraligi` değil, karşılaşan Türkçe
AKSAN ÇİFTİ belirliyor (ğ kavisi ile ö noktaları, ç kuyruğu ile b çıkıntısı). Bu yüzden
`satirAraligi` üzerine bir taban yazmak da işe yaramazdı.

## Kelime bütçesi (R-89) on şablonun sekizini KIRIYOR — ve kelime yanlış büyüklük

R-89 başlık ≤8, slayt toplamı ≤28 kelime diyor. Tam o tavanda, gerçekçi uzun Türkçe
kelimelerle (`sürdürülebilirlik`, `raporlamasında`, `denetlenebilir`) her şablon
zorlandı: **36 kusur, on şablonun sekizinde.** En ağırı `donen`de `punto-esik-alti` —
gövde, R-83'ün okunabilirlik tabanının ALTINA düşüyor.

Başlık 8'de sabitlenip gövde tabana kadar indirilerek her şablonun gerçek kapasitesi
ölçüldü (başlık + gövde, sıfır kusur veren en büyük değer):

| şablon | kapasite | ilan | şablon | kapasite | ilan |
|---|---|---|---|---|---|
| `editoryal` | **27** | 28 | `veri-hikayesi` | 16 | 28 |
| `kavis` | 25 | 28 | `memphis` | 15 | 28 |
| `alinti` | 19 | 28 | `sahne` | **12** | 28 |
| `karsilastirma` | 19 | 28 | `donen` | **ölçülemedi** | 28 |
| `akan-alan` | 18 | 28 | | | |

`donen` başlık 3 kelimeye ve gövde 0'a inse bile kusurlu — kapasitesi kelimeyle
İFADE EDİLEMİYOR. **2,25 kat yayılma** ve bir de tanımsız uç.

**Kök sebep kodda yazılıydı:** bütçenin türetmesi *"1080 px tuvalde satır başına ~2,5
kelime"* diyor. Ama metin tuvalde değil bir SÜTUNDA yaşıyor ve `baslikSutunu` şablona
göre **0,46 → 0,88** değişiyor. Tek sayı bu yüzden tutamaz.

**Ama şablon başına kelime yazmak da yanlış olurdu.** Kelime, geometrinin vekilidir ve
kötü bir vekildir: *"Bir hat tekrarla öğrenir"* (4 kelime, 23 karakter) ile
*"Sürdürülebilirlik raporlamasında ölçülebilir dönüşüm"* (4 kelime, 52 karakter) aynı
sayıyı verir. `donen`in ölçülemez çıkması tam olarak bunun kanıtı.

## FAZ-19.4 · gren — koşulsuz, luminansa bağlı, JPEG'ten sağ çıkan

**Neyi ölçtük:** `derived/izgara/*.png`, 8×8 blokların içinde aralık ≤24 olanların (yani
kenar ve metin taşımayanların) medyan standart sapması. ⚠ İlk alet YANLIŞTI: sol 120 px
şeridin σ'sını aldı ve kart kenarını da içine kattı — ölçtüğü şey gren değil KONTRASTTI.

### Başlangıç: gren HİÇ uygulanmamıştı

`zeminCss` greni yalnız `degradeVar` iken ekliyordu; degrade yasağı (D-318) yürürlükteyken
o koşul hiç sağlanmadı. Üstelik `zeminDokusu` **hiçbir yerde set edilmiyordu** ve
`ustDoku` alanının da üreticisi yoktu — zincir kopukluğunun on ikinci tekrarı.

| şablon | modal renk | tam modal | ±2 |
|---|---|---|---|
| `akan-alan` | `#040404` | %67,6 | %67,7 |
| `dizin` | `#0e0e0e` | %90,7 | **%92,3** |
| … on şablon, **dört renk** | | medyan ~%85 | |

### `soft-light` tek başına UÇLARDA ÇALIŞMIYOR

Gren üstte, koşulsuz ve `soft-light` yapıldıktan sonra ölçülen düz-blok medyan σ:

| zemin | L | σ | σ<0,5 olan blok |
|---|---|---|---|
| `sahne` · `veri-hikayesi` | ~0,16 | 3,8 | %0,1 |
| `dizin` | ~0,17 | 2,9 | %1,2 |
| `akan-alan` · `donen` · `kavis` · `karsilastirma` | ~0,105 (`#040404`) | **1,0** | %1,3 |
| `alinti` · `editoryal` · `memphis` | ~0,98 (`#fafafa`) | **0,24** | **%87** |

⚠ **Kâğıt şablonlarında düz blokların %87'si σ<0,5** — JPEG onu tamamen siler, yani gren
hiç uygulanmamış gibi olur. Sebep çarpımsal: `soft-light` siyahta çarpacak bir şey
bulamıyor, beyazda doyuyor.

### Çözüm: kip de luminansın fonksiyonu

`L < 0,14` ya da `L > 0,85` → `normal` @ 0,10 (ölçüm tablosunda `normal` σ'sı luminanstan
BAĞIMSIZ); aradaki her yerde `soft-light` + luminansa bağlı opaklık.

| şablon | PNG σ | **JPEG q=90 sonrası σ** | σ<0,5 |
|---|---|---|---|
| `akan-alan` · `donen` · `kavis` · `karsilastirma` | 2,26–2,27 | 1,62–1,65 | %2,5–4,5 |
| `alinti` · `editoryal` · `memphis` | 2,26–2,30 | 1,63–1,69 | %0,5–5,4 |
| `dizin` | 2,94 | 2,46 | %4,2 |
| `sahne` · `veri-hikayesi` | 3,80–3,85 | 3,52–3,61 | %2,9–3,3 |

Tam modal kaplama %67,6–%90,7 → **%8,8–%17,1** (kabul tavanı %40). On kapak, sıfır kusur.

### ⚠ BEDEL: uçlarda luminans KAYIYOR ve bu FİZİK, hata değil

`#040404` → `#111111` (+13) · `#fafafa` → `#eeeeee` (−12). Siyahın ALTINA dither
edilemez: near-black bir zeminde simetrik gürültü 0'da kırpılır, dolayısıyla ortalama
kaçınılmaz olarak YÜKSELİR. Tek çare zemini uçtan çıkarmaktır — FAZ-19.6'nın beş paleti
zaten bunu yapıyor (P1 taban `oklch(0.160)`, `soft-light` bandının içinde).

### ⚠ Bir yığın-bağlamı hatası, ölçümle yakalandı

Gren önce `.ust-doku::before`e konuldu. `.ust-doku` `position:absolute` + `z-index`
taşıdığı için KENDİ yığın bağlamını kuruyor: çocuğun `mix-blend-mode`u kartlarla değil
şeffaf ebeveyniyle karışıyor, yani hiç karışmıyor. Ölçüm: `#040404` zemin `#5c5c5c`ye
çıktı ve on kapakta R-105 patladı. **Gren kaybolmamıştı, GRİ PERDE olmuştu.** Çözüm:
gren ve vinyet `#sahne`in doğrudan çocukları, kardeş.

## FAZ-19.4 · taşıyıcı görünürlüğü — ΔL büyük, KONTRAST küçük

**R-87 yeşildi ve taşıyıcı yine görünmüyordu.** Kapı VARLIK ölçüyor, GÖRÜNÜRLÜK
ölçmüyor: *"teknik yeşil, algısal kırmızı."* Ölçüm — taşıyıcı alanın 12×12 ortalaması
ile üstündeki zeminin WCAG kontrast oranı, vinyetten uzak bir noktada:

| şablon | önce | sonra | eşik 1,6:1 |
|---|---|---|---|
| `kavis` | `#202020` / `#121212` = **1,16:1** | `#3a3a3a` / `#121212` = **1,66:1** | ✓ |
| `akan-alan` | `#2b2b2b` / `#121212` = **1,32:1** | `#585858` / `#121212` = **2,65:1** | ✓ |

⚠ ⚠ **ÖLÇÜM DEFTERİ YANILMAMIŞTI, BİRİM DEĞİŞTİRMİŞTİ.** R-87 kaydı `alanSiniri` için
*"ΔL 0,165"* diyordu ve o doğru: `ink-1000` (oklch 0,105) ile `ink-850` (0,270) arasında
token uzayında gerçekten 0,165 var. Ama **kontrast oranında bu yalnız 1,32:1.** Token
açıklığı ile WCAG kontrastı iki AYRI birim ve biri ötekini garanti etmiyor. Bir kural
bir birimde ölçülüp başka birimde iddia edilirse, kayıt doğru kalır ve iş yanlış çıkar.

⚠ **Nötr rampanın gölgede ara adımı YOK:** `ink-850` 0,270, sonraki `ink-650` 0,485 —
aradaki her şey eksik. `kavis` bu yüzden sabit token yerine **yüzey adımı** kullanıyor:
`color-mix(in oklab, var(--pano-metin) 26%, var(--pano-zemin))`. Adım zeminin kendi
metin renginden türediği için koyu şablonda yukarı, kâğıt şablonda aşağı gidiyor —
sabit bir token iki kutupta birden doğru olamazdı. Ara adım eksiği FAZ-19.6'nın işi.

## FAZ-19.4 · görünür taşıyıcı, z-sırası sözleşmesini ZORUNLU kılıyor

`veri-hikayesi` eğrisinin dolgusu yüzey adımına çevrildi ve kontrast **1,00:1 → 1,74:1**
oldu. Aynı anda `sus-metni-kesiyor` kırmızı döndü: eğri, `ustBaslik` kutusunun
**%99,3'ünün** arkasından geçiyormuş. **Görünmezken kimse fark etmiyordu.**

Çipe gerçek yüzey verilince (aşağı bak) oran %99,3 → **%9**'a indi; kapının eşiği %2.

⚠ ⚠ **REÇETENİN KENDİ SIRASI YANLIŞ.** "İlk beş iş" listesinde taşıyıcıyı görünür kılmak
2., z-sırası sözleşmesi + metin kutusu maskesi 5. sırada. Ölçüm bunun tersini söylüyor:
**görünür bir taşıyıcı, maskesi olmadan çizilemez.** Bu, kapanış imzasının
`--punto-rakam`dan ÖNCE eklenmesiyle aynı sınıf hata — doğru müdahale, yanlış sırada,
yarım sonuç. `kavis` ve `akan-alan` bundan etkilenmedi çünkü taşıyıcıları metin
kutularının altında kalıyor; `veri-hikayesi`nin köşegeni kadrajı kat ediyor.

## FAZ-19.4 · saydam çip iki kusuru aynı anda üretiyordu

`.etiket` yalnız 1 px kontur + `border-radius: 999px` taşıyordu.

1. **Süs çipin İÇİNDEN geçiyordu** — kusurlu olan süs değil ÇİPTİ. Gerçek yüzey (yüzey
   adımı %9 + 1 px iç ışık) verilince fark oranı %99,3 → %9.
2. **Denetçinin *"haplar UI filtre çipi gibi"* bulgusunun kaynağı buydu:** 999 px yarıçap
   + hairline kontur, bir yazılım arayüzü ögesidir. Reçete `C.4`: yarıçap ya 0 ya ≥28 px;
   4–12 px arası "bootstrap kartı" bandı. **Yarıçap 0** — basılı bir künye etiketi keskin
   köşelidir. Çizildi ve BAKILDI: çipler artık basılı etiket okunuyor.

## FAZ-19.7 · z-sırası — dağınık sayılar bir sözleşme değildir

`z-index` on iki ayrı CSS satırında elle yazılıydı; sıra hiçbir yerde bir arada
görünmüyordu. Toplanınca tek bakışta görülen ihlal: **`.bant-ok` 5'te, `.gorsel` 4'te** —
akış taşıyıcısı kesik öznenin ÜSTÜNDEN geçiyordu. Denetçi bunu gözle bulmuştu:
*"üstten geçen çizgi 'bağlantı' değil fosforlu kalem lekesi okunuyor."*

Sözleşme tek yerde (`Z`, `panorama.ts`) ve testi SIRAYI sınıyor, sayıyı değil:
zemin 0 · taşıyıcı 1 · leke-üst 2 · durak 3 · **gren 4** · görsel 5 · **vinyet 6** · metin 7.

### ⚠ Gren ile vinyet AYNI seviyede olamıyor — ölçüm ayırdı

İkisi tek "film" seviyesinde toplanıp görselin ALTINA alındığında R-96 kırmızı döndü:
`memphis` siluetinin p90 luma farkı **119**, eşik 120. Ayrılıp **vinyet görselin ÜSTÜNE**
çıkarılınca on kapak sıfır kusur.

⚠ ⚠ **İLK TEŞHİSİM YANLIŞTI ve kayda doğrusu geçiyor.** Sebebin `normal` kipli grenin
altındaki her kontrastı (1−α) ile çarpması olduğunu sandım (132 × 0,9 = 119 — sayı bile
tutuyordu). Greni tek başına altta bırakınca kusur DEVAM ETTİ. Gerçek sebep vinyet:
kesik özneyi de karartan bir vinyet, özne ile zemini BİRLİKTE kaydırıp aradaki farkı
korur; yalnız zemini karartan bir vinyet o farkı YER. **Vinyet mercek etkisidir —
sahneye değil filme aittir, yani öznenin de üstündedir.** Rakamın tutması, teşhisin
doğru olduğu anlamına gelmiyordu.

## FAZ-19.7 · OKUNURLUK YASTIĞI — reçetenin cevabı ÖLÇÜMDE ÇÜRÜDÜ

Reçete `C.5`b: *"metin bir görselin ya da parlak alanın üstündeyse, arkasına yumuşak
yerel karartma konur (kutu değil, elips)"* — amacı `sus-metni-kesiyor`u karşılanabilir
kılmak. Yazıldı, çizildi, ölçüldü ve **üç ayrı sebeple geri alındı.**

### 1 · İşe yaramıyor — ve sebebi aritmetik

`veri-hikayesi` kart 1, `alan: 'etiket'` (çiplerin BİRLEŞİK kutusu, x 64–612, y 1181–1250):

| kurulum | fark oranı | eşik |
|---|---|---|
| yastıksız | %9,2 | %2 |
| yastık (elips, `blur(26px)`, `--kart-zemin` %92) | **%9,2** | — |
| yastık %100 opak | %9,3 | — |
| yastık düz KIRMIZI, `rgba(...,0.9)` | %9,3 | — |
| yastık düz KIRMIZI, tam opak | **%7,3** | — |

⚠ ⚠ **`blur(26px)` 69 px yüksekliğindeki bir kutunun TAMAMINI yarı saydam yapıyor.**
Bulanıklık kenardan 26 px içeri işliyor; iki kenardan 52 px, kutu 69 px. **Yumuşak bir
yastık, tanımı gereği örtemez.** Kutu büyütülerek çözülemiyor: `inset: -22px -30px`
denendi ve kadraj denetimi 94 `tasma` kusuru döktü — sayı birebir insetti, çünkü pseudo
öge LAYOUT kutusunu büyütüp R-88'in güvenli alanını deliyor.

⚠ Değişen piksellerin ne olduğu da ölçüldü: **çiplerin ARASINDAKİ boşluklar.** Üç boşluk
× ~14 px × 69 px ≈ kutunun %9'u. Denetim çipleri tek tek değil birleşik kutu olarak
ölçtüğü için aradaki zemin de "etiket metni" sayılıyor.

### 2 · Gerekmediği yerde HALE bırakıyor

Düz koyu kartta başlığın etrafında hafif ama görülebilir bir dikdörtgen. Yumuşak da olsa
bir kutu — bu fazın yasakladığı *"html css gibi duruyor"*un ta kendisi. Çizildi, BAKILDI.

### 3 · R-81 zaten yasaklıyor

`kodlanmis-oge` kapısı `panorama.ts`te `sozde-oge` tavanını **0** tutuyor. Kural haklıydı.

### Doğru çözüm ne

**Taşıyıcıyı maskelemek** — ve maske kutuları ancak düzen ÖLÇÜLDÜKTEN sonra bilinebilir
(`duzenProvasi`, D-347). Yani bu bir CSS kuralı değil, **provanın ölçümünü render'a
taşıyan bir ADIM.** `veri-hikayesi` köşegeni (görünür hâlde kontrast 1,74:1) o adım
gelene kadar görünmez kalıyor.

⚠ **Reçetenin sırası ikinci kez yanlışlandı.** Önce "görünür taşıyıcı maskeden önce
çizilemez" çıktı; şimdi de "maskenin yerine geçeceği söylenen yastık maskenin yerine
geçemiyor". Reçete iyi bir kaynak ama sırası ölçümle sınanmadan uygulanamaz.

## FAZ-19.7 · yüzey dönüşü kesimde OLAMAZ — ve asıl dikişi künye şeridi atıyordu

`donen` ve `memphis` sürekliliği **aktif olarak kırıyordu**: kart zeminleri tam kesim
çizgisinde değişiyordu, yani seamless'ın tersi. Ölçüm — kesimin ±5 px'inde RGB farkı
(0–765 ölçeğinde), kesilmemiş panorama üstünde:

| yer | önce | sonra |
|---|---|---|
| yüzey (y 200 · 700 · 1300) | 21–24 | **0–24** |
| **künye şeridi (y 1390)** | **636** | **0–3** |

### Dönüş kartın SON %30'una taşındı, merkezine değil

Reçete dönüşü slayt MERKEZİNE öneriyor. **Merkez olamaz:** metin kartın sol %60'ında ve
metin kutbu (`kartRenkleri`) kart zemininden türüyor — geçiş metnin altından geçerse aynı
başlık yarısı açık yarısı koyu zeminde kalır ve hiçbir tek kutup onu okunur yapamaz.
Dönüş metnin BİTTİĞİ yerde başlıyor: `linear-gradient(90deg, own 0%, own 70%, next 100%)`.
Kesimde iki taraf aynı renkte buluşuyor — kart N %100'de sonrakinin rengine varıyor,
kart N+1 o renkten başlıyor.

### ⚠ ASIL DİKİŞİ ŞERİT ATIYORDU ve yüzey düzelince ORTAYA ÇIKTI

Yüzey kesimde 3–24'e inince künye şeridi hâlâ **636** veriyordu: rengini kart zemininden
alıyordu ve `donen`de kart zemini dönüyor. **Bir seamless karoselde her kesimde renk
değiştiren bir altbilgi, kesimin KENDİSİNİ çiziyor.** Şerit artık panorama ögesi:
`--ray-zemin` · `--ray-metin` · `--ray-aksan`, hepsi `doc.zemin`den. Kaydırırken yerinde
duran bir ray, altında akan bir tuval.

⚠ **Ray metni `panoRenkleri`nden türetilemez.** İlk sürüm onu kullandı ve `alinti` altı
R-95 kusuru döktü: o renkler `alanSiniri.alt`tan, yani KOYU kamadan türüyor — ray zemini
ise kâğıt. Açık üstüne açık. Kural her yerde aynı: **renk, ögenin oturduğu yüzeyden türer.**

⚠ **Dolgunun %62'de bitmesi de yetmedi.** Kart zeminine bağlıyken şeridin altındaki yüzey
zaten aynı renkti; artık `donen`de kart AÇIK, ray KOYU. Sayacın üst kısmı solan bölgeye
düşünce R-95 yine kırmızı (`ray-sayac` yüzeyinin %8'i). Dolgu %86'ya çıkarıldı.

### Dört panoramada kesim farkı (0–765)

`donen` 0–24 · `memphis` 18–24 · `alinti` 18 · `akan-alan` 18–33. Hepsi ≤%4,3.

## FAZ-19.5 · font — raporun her elemesi BAĞIMSIZ olarak yeniden üretildi

Araştırma raporu *"IBM Plex'in tamamı `latn/TRK` taşımıyor"* diyordu ve o iddiaya
dayanarak aile seçilecekti. **Başkasının ölçümüne dayanarak karar vermek dayanaksızdır.**
`scripts/font-denetim.mjs` yazıldı: TTF indirir, `cmap`te 15 Türkçe kod noktasını,
`Ş`(U+015E) ≠ `Ș`(U+0218) ayrımını ve `GSUB`ta `latn/TRK` dil sistemini okur.

| aile | cmap | Ş≠Ș | latn/TRK | sonuç |
|---|---|---|---|---|
| Archivo · Literata · Martian Mono | 15/15 | evet | VAR | ✓ |
| Big Shoulders (+Stencil) · Young Serif | 15/15 | evet | VAR | ✓ (park edildi) |
| Montserrat · Plus Jakarta Sans | 15/15 | evet | VAR | ✓ (yerini bıraktı) |
| **IBM Plex Sans · IBM Plex Mono** | 15/15 | evet | **YOK** | ✗ |
| **Inter** | 15/15 | evet | **YOK** | ✗ |
| **Stardos Stencil · Share Tech Mono** | **10/15** (`Ğ ğ İ Ş ş` YOK) | — | YOK | ✗ |

Raporun adlandırdığı harfler birebir çıktı. Alet hem EVET hem HAYIR diyebiliyor.

### ⚠ BIG SHOULDERS DENENDİ ve ÖLÇÜM GERİ ÇEVİRDİ

Reçete Big Shoulders'a *"sanayi display, hayalet rakam"* rolü veriyor; ben onu EVRENSEL
bölüm başlığı yaptım ve **beş şablon `punto-cokmesi` döktü.** Sebep ölçüldü —
`donen`in başlık sütunu **304 px**:

| kart | yüz | sığan punto | kısıt |
|---|---|---|---|
| 1 (kapak) | Literata (geniş serif) | **69 px** | genişlik |
| 2–4 (gövde) | Big Shoulders (ultra dar) | 113–147 px | genişlik |

**Dar bir poster yüzü, dar bir sütunun içinde ölçek üretmez — hiyerarşiyi TERSİNE çevirir.**
Bölüm başlığı Archivo'ya alındı (reçetenin kendi şablon tabloları da öyle diyor); Archivo'nun
`wdth` ekseni sayesinde daralmayı ŞABLON seçiyor, yüz dayatmıyor.

⚠ **İlk düzeltme denemem YANLIŞTI ve kayda öyle geçmesin:** denetimin ham "sığan punto"yu
kendi çarpanına bölmesini önerdim (render'ın araması öyle yapıyor). Bölünce gövde tavanı
161 → 196'ya çıktı ve fark BÜYÜDÜ; beş şablon yerine altı şablon kırmızıya döndü. Ölçüm
birimini düzeltmek, ölçülen şeyin yanlış olduğu bir yerde işe yaramıyor.

### Kapak ağırlığı 500 → 400: bir GENİŞLİK kararı

`sahne` kapağı 500'de **81 px**'de sıkışıyor, gövde kartları 134'e çıkıyordu (oran 0,60,
eşik 0,62). Editoryal serifin 500'ü bir medium ve dar sütunda punto satın alıyor. 400'de
kapak **84 px** — reçetenin `sahne` için verdiği sayının ta kendisi (Literata opsz 60
wght 400 **84 px**). On kapak sıfır kusur.

### `locl` ve `tnum` açıldı

`lang="tr"` tek başına yetmiyor: dil etiketi yüze hangi dilde olduğunu söyler, `locl`
yüzün o dile ait alternatiflerini AÇAR. Kapalıyken `fi` bağı bağlanıyor ve **noktalı i'nin
noktası kayboluyor** — Türkçe'de `fi` ≠ `fı`. `tnum`: künye sayacı (`01 / 04`) oransal
rakamlarla slayttan slayta ZIPLIYORDU.

## FAZ-19.5 · satır aralığı — MÜREKKEP ölçüldü, kutu değil

`line-height` satır KUTUSUNU verir; çarpışan şey glifin kendisidir. Ölçüm canvas
`actualBoundingBoxAscent/Descent` ile: ardışık iki satırın gerçek mürekkep boşluğu.

| şablon | satırlar | önce | sonra |
|---|---|---|---|
| `sahne` | "göstermekle" / "başlar" | **−4 px** | +17 px |
| `alinti` | "şeyi" / "iyileştiremezsin" | **−1 px** | + |
| `alinti` | "Ölçmediğin" / "şeyi" | 1 px | + |
| `kavis` | "Sapma görünür" / "olmalı" | 4 px | + |
| `donen` | altı satır çifti | 6–7 px | + |
| `akan-alan` | "döngüsel" / "yapan beş şart" | 7 px | + |

⚠ **Eksi sayı gerçek bir üst üste binmedir:** `g`nin kuyruğu bir alt satırın `b`sinin
gövdesine giriyordu. Rapor tam bu iki örneği adlandırmıştı; ölçüm bağımsız olarak
ikisini de üretti.

**Sebep:** Türkçe satır kutusunun İKİ ucu da dolu — üstte `İ Ö Ü ğ`, altta `Ş Ç ş ç g y
p j`. Latin display'de normal olan 1,0, Türkçe'de çarpışmadır. Ölçülen fontlarda Türkçe
mürekkep yüksekliği ~**1,05em**; taban **1,18** seçildi, kalan 0,13em nefes payı.

⚠ **Değerler `katalog-ornek.ts`teydi, `aile.ts`te değil.** Aile tabanları 1,0–1,55'ti ama
`.baslik`in `line-height`ini katalog örneklerinin `tipografi.satirAraligi`si sürüyor:
1,04 · 1,06 · **0,96** · 1,08 · 1,0 · 1,1 · 0,98 · 1,0 · 1,08 · 1,04. Biri BİRİN ALTINDA.
İkisi de tabana çekildi; varsayılan `VARSAYILAN_TIPO` 1,02 → 1,18.

En dar boşluk **−4 px → +17 px**, hiçbir satır 8 px'in altında değil, on kapak sıfır kusur.

## FAZ-19.5 · optik hizalama — YIĞIN işi, blok işi değil

`O Ö C Ç G Q S Ş 0` taban çizgisinde matematiksel olarak hizalıdır; göz onları **içeride**
görür, çünkü eğri kenara yalnız bir noktada değiyor. Tırnak daha beter: altı boş bir
işaret satır başında delik açıyor. Pay em cinsinden — yuvarlak **0,018em**, tırnak
**0,055em** (üç kat, deliğin büyüklüğü kadar).

⚠ ⚠ **İLK SÜRÜM `.baslik`E `margin-left: -0.018em` KOYDU ve `aile-tutarliligi` haklı
olarak kırmızı döndü:** *"metin blokları TEK sol kenarı paylaşıyor"*. Ölçüt yanlış
değildi — uygulamam yanlıştı. **Optik hizalama bir blok değil bir YIĞIN işidir:** yığının
algılanan sol kenarını en büyük öge (başlık) belirler, etiket ve gövde ona uyar.

⚠ **Kaydırma `em` de olamaz.** Etiket 20 px, başlık 84 px, gövde 38 px: aynı `em` üç
farklı piksel demek ve üç blok üç ayrı yere kayardı — düzeltmeye çalıştığım şeyin ta
kendisi. Pay `--baslik-punto` üstünden PİKSEL hesaplanıyor
(`calc(var(--baslik-punto, 0px) * -0.018)`), üçü birlikte kayıyor, sol kenar tek kalıyor.

⚠ Pay ŞABLONDAN değil METİNDEN türüyor: `optikPay(k.baslik)`. Bir sonraki koşuda başlık
değişince pay da değişiyor; şablona sabit yazılsaydı içerik değişince yalan olurdu.

## FAZ-19.4 · beş yüzey ailesi — beş AD değil beş DOKU

Denetimin en sert bulgusu *"on şablon, üç zemin"*di: katalog `editoryal — sıcak kâğıt`,
`kavis — beton` yazıyordu, render ikisini de aynı düz mürekkeple çiziyordu. Beş aile
kapalı dağarcık olarak yazıldı ve her biri bir şablona verildi.

### Ölçülen imzalar (çok ölçekli σ + anizotropi + uçlarda toplanma)

| şablon | aile | σ₈ | σ₉₆ | σ₉₆/σ₈ | yatay/dikey |
|---|---|---|---|---|---|
| `akan-alan` · `donen` | — (düz gren) | 2,26 | 2,39 | 1,06 | 1,02 |
| `editoryal` | **kagit** | 4,72 | 5,89 | 1,25 | 1,01 |
| `alinti` | **tas** | 5,10 | 6,33 | 1,24 | 0,98 |
| `kavis` | **beton** | 5,00 | 6,34 | 1,27 | 0,99 |
| `karsilastirma` | **celik** | 1,88 | 3,58 | **1,90** | **0,69** |
| `memphis` | **halftone** | 10,00 | 10,07 | 1,01 | 1,00 |

### ⚠ ÜÇ ÖLÇÜM ARACI YANILDI, ÜÇÜ DE DÜZELTİLDİ

1. **Tek ölçekli σ kabalığı GÖREMİYOR.** Beton frekansı 0,9 → 0,34'e indirilince 8×8 σ
   5,19 → 5,00 çıktı; alet *"değişmedi"* dedi. 320 px'lik bir tanenin değişimi bloklar
   ARASINDA, blok içinde değil. Çok ölçekli σ (8·32·96) taneyi boyuyla ayırıyor.
2. **Güç grenin opaklığından türetilemiyor.** Kâğıt zeminde `grenOpakligi` 0,10 döndürüyor
   (uçta `normal` kip, bantlanma için KASITLI olarak düşük). O sayıdan türeyen kâğıt σ
   2,29 verdi — düz grenin (2,26) ayırt edilemez kadar yakını. Yüzey ailesi grenin
   şiddetini değil MALZEMENİN imzasını taşır; kendi çarpanı var.
3. **Kabalık opaklıktan gelmiyor, TANE BOYUNDAN geliyor.** Beton opaklığı zaten tavandaydı.

### ⚠ İKİ TASARIM DENEMESİ GERİ ÇEVRİLDİ

- **`contrast(20)` halftone tam kaplama:** R-96 kırmızı — kesik öznenin silüet farkı
  108–117'ye düştü (eşik 120). Reçete tramı **bloklara** veriyor, panorama genişliğinde
  bir zemine değil. Nokta opaklığı üçte bire, kontrast yumuşak uca (8) çekildi.
  **Tram artık kâğıdın baskı izi; kâğıdın yerine geçen bir desen değil.**
- **Çok düzenli fırça izi:** `numOctaves=2` + tam güç eşit aralıklı yatay şeritler
  üretti — bu fazın yasakladığı "html css deseni". Oktav 4, güç 1,45: **yön korunuyor
  (0,69), düzenlilik kırılıyor.** Fırça izinin imzası yön TAŞIMASI, eşit aralıklı olması değil.

### ⚠ `tas` ile `beton` σ'da ayrılmıyor — açık kalan

1,24 ve 1,27. Farkları damar (`multiply`) ve tane boyu; ölçü onu görmüyor. İkisi gerçek
hayatta da yakın malzemeler. Ayrımın asıl yeri RENK — FAZ-19.6 (P3 açık taş, P4 beton+amber).

### ⚠ İki `<rect>` üreticisi — kapı R-05 uyarısı veriyordu

`kodlanmis-oge` `svg-dikdortgen` sayısını 2'de yakaladı (tavan 1). Üslup kuralı değil:
iki ayrı doku üreticisi, biri değişince öbürü sessizce eskir. `grenKatmani` artık
`doku()`nun tek frekanslı bir çağrısı.

## FAZ-19.6 · gamut — kırpılma SESSİZDİR ve canlı bir kurban buldu

Tarayıcı gamut dışı bir `oklch()`i reddetmez; en yakın sRGB rengine **kırpar** ve TON
KAYAR. Ne hata, ne uyarı — yalnız yanlış renk. `scripts/gates/gamut.mjs` yazıldı:
her `(L,h)` için sRGB'de kalan maks kromayı ikili aramayla bulup token'ın kromasıyla
karşılaştırıyor. **Çevrimdışı** — JSON okur, saf matematik yapar, `fast` grup.

### Raporun her sayısı bağımsız olarak yeniden üretildi

marka mavisi `h=262`, sabit `C=0.206`:

| L | maks kroma | rapor | C=0.206 çizince | |
|---|---|---|---|---|
| 0,15 | **0,112** | 0,112 | **`#0f0061`** | ⚠ MOR — raporun adlandırdığı hex |
| 0,30 | 0,144 | 0,144 | `#000692` | ⚠ kırpılıyor |
| 0,50 | 0,233 | 0,233 | `#1556d6` | içeride |
| 0,80 | 0,101 | 0,101 | `#71b8ff` | ⚠ kırpılıyor |
| 0,90 | 0,048 | 0,048 | `#90daff` | ⚠ kırpılıyor |

Beş değerin beşi de birebir. **Sabit kroma rampası mavi yazıp mor çiziyor.**

### ⚠ EŞİK %85 DEĞİL %96 — ve bu bir gevşetme değil, doğru birim

Araştırma `C ≤ maksC(L)×0,85` diyor; bu YENİ üretilen rampalar için bir güvenlik payı.
Depodaki mavi rampası cusp'ı **bilerek** takip ediyor (her L'de maksın %94–95'i) ve
rapor da bunu *"doğru kurulmuş"* diye kaydediyor: markanın mavisi doygun olmak zorunda.
%85 eşiği o rampayı haksız yere kırmızıya çevirir ve **kapı beş gün içinde görmezden
gelinirdi.** %96 gerçekten kenarda duranı yakalıyor.

### Kapı ilk koşuşunda İKİ kurban buldu

| token | oran | çizilen | ne yapıldı |
|---|---|---|---|
| `brd_upcytech` `signal.warn` `oklch(0.72 0.150 75)` | **0,99** | — | 0,140'a çekildi (%92) |
| `brd_dima` `ok` `oklch(0.68 0.130 195)` | **1,12** | **`#00b0b1`** | 0,107'ye çekildi (%92) |

⚠ ⚠ **İkincisi GAMUT DIŞINDAYDI ve şu anda kırpılıyordu.** Alt markanın "ok" rengi token
ne derse desin `#00b0b1` çiziliyordu. Kimsenin bakmadığı, hiçbir testin göremediği,
yalnız matematiğin gördüğü bir hata — ve alt marka canlı (`brd_dima` devralıyor).

## FAZ-19.6 · nötr artık "sıfır kroma" DEĞİL — ve ölçüm birimi onunla birlikte değişti

Rampanın on bir adımının on biri `oklch(L 0 0)`di: reçetenin *"ekrandaki en ölü yüzey"*
dediği şeyin ta kendisi. Gölge ucu **soğuk çelik h=250** (C 0,008–0,014), ışık ucu
**sıcak kâğıt h=75** (C 0,005–0,006); geçiş L≈0,55. Klasik editoryal bölünmüş nötr.

### ⚠ HSL DOYGUNLUĞU BU İŞİN BİRİMİ DEĞİL — ölçüldü

`aile-tutarliligi` *"baskın ton payı ≥%80"* diyor ve nötrler ısıtılınca `sahne` **%60**'a
düştü. Sebep aritmetik: HSL doygunluğu `(mx−mn)/(1−|2l−1|)` ve çok koyu bir renkte payda
sıfıra gidiyor.

| token | OKLCH kroma | HSL doygunluk |
|---|---|---|
| `oklch(0.105 0.014 250)` | 0,014 | **0,609** |
| `oklch(0.165 0.013 250)` | 0,013 | **0,325** |
| `oklch(0.485 0.008 250)` | 0,008 | 0,041 |
| `oklch(0.95 0.006 75)` | 0,006 | 0,192 |

**Kâğıt üstünde nötr sayılan bir ton, siyahın dibinde "renk" sayılıyor.** Tasarım OKLCH'te
yazılıyor; ölçüm de orada yapılmalı. Eşik `C ≥ 0,03`: kasıtlı ısı (≤0,014) dışarıda,
marka mavisi (0,206) içeride. On beş test yeşil.

### ⚠ ÖLÇÜ DOKUNUN VARLIĞINI GÖRÜYOR, AĞIRLIĞINI DEĞİL

`tas` σ 5,10 ile "iyi" ölçülüyordu; kadraja BAKINCA `alinti` ağır, bulutlu, gri bir
zemine dönüşmüştü — açık taş değil, ucuz bir doku kaplaması. Damar 1,6 → 0,55 ve
`multiply` → `soft-light`: `multiply` açık zeminde yalnız karartıyor, taşın damarı ise
ışığı DAĞITIR. σ 5,10 → **3,88** ve çizim ilk kez gerçek bir taş yüzeyi gibi duruyor.
**Bir sayının iyi olması, bakmamak için gerekçe değil.**

## FAZ-19.6 · beş palet — ve `tas`/`beton` ayrımı ölçüyle KAPANDI

Yirmi rengin yirmisi de gamut denetiminden geçti (oran 0,06–0,89, tavan 0,96) ve
reçetenin verdiği hex'ler benim hesabımla **birebir** çıktı: `#000337` · `#3e79ed` ·
`#be5823` · `#f0eeeb` · `#b8321c` · `#e6ac3d` · `#d82e92`. Aksanların hepsi cusp'ın
%85–89'unda — reçete kendi kuralını (`C ≤ maksC×0,85`) uygulamış.

İki palet bağlandı: `alinti` → **P3 kâğıt+oksit (mavi YOK)**, `kavis` → **P4 beton+amber**.

| şablon | önce | sonra |
|---|---|---|
| `alinti` σ / uçlarda | 5,10 / — | **3,88 / %87,7** (açık taş) |
| `kavis` σ / uçlarda | 5,00 / %19,9 | **5,05 / %0,7** (orta ton beton) |

⚠ **Geçen turun açık bulgusu kapandı.** `tas` ve `beton` σ'da ayrılmıyordu (5,10 / 5,00):
iki malzeme, tek görünüm. Şimdi tonal yerleşimleri taban tabana zıt — biri kâğıt ucunda,
öteki tam ortada — ve aksanları oksit (32°) ile amber (80°). **Doku farkı yetmiyordu;
ayrımın taşıyıcısı RENK.**

⚠ ⚠ **BU DEĞİŞİM BİR KURALI KIRDI ve kural DEĞİŞTİ, test değil (D-349).**
`aile-tutarliligi` on şablonun baskın tonunu ±15°'de tutuyordu — D-318'in "tek karneli
aksan" kararının ölçüm karşılığı. Ölçüt kaldırılmadı, **iddiası değişti:** ailelik artık
ortak iskeletten okunuyor (ızgara · güvenli alan · künye geometrisi · gövde ailesi ·
gren) ve aksana gelen kısıt *"keyfî olamaz"*: `--ramp-*` token'ından gelmek zorunda.
**Şablon renk dünyasını SEÇER, İCAT ETMEZ.** Eski ölçüt "hepsi aynı renkte mi" diye
soruyordu; yenisi "rengini icat mı etti" diye soruyor — markayı gerçekten koruyan soru bu.

## FAZ-19.6 · beş paletin beşi de bağlandı — on şablon, dokuz zemin

| şablon | palet | aksan | modal zemin |
|---|---|---|---|
| `akan-alan` · `sahne` | P1 mürekkep+mavi | mavi=ÖZNE | `#020408` · `#000337` |
| `karsilastirma` · `dizin` | P2 çelik+bakır | bakır 45° | `#020408` · `#13161a` |
| `alinti` | P3 kâğıt+oksit | oksit 32° · **mavi YOK** | `#e0e0e0` |
| `kavis` | P4 beton+amber | amber 80° | `#45423d` |
| `veri-hikayesi` | P5 gece+magenta | magenta 350° | `#07090c` |

**Başlangıç: on şablon, DÖRT renk. Şimdi: on şablon, DOKUZ zemin, BEŞ aksan.**

⚠ `veri-hikayesi`nin köşegeni artık ölçülerek magenta: `rgb(215,44,143)`. Reçetenin
ikinci işiydi ve gerekçesi estetik değil AYIRT EDİLEBİLİRLİK — taşıyıcı marka mavisiyle
çiziliyor, markanın geri kalanıyla karışıyordu; göz onu taşıyıcı değil SÜS okuyordu.

### ⚠ ÖLÇÜM KENDİ KOVALAMASINI KUSUR SANDI

`aile-tutarliligi` her şablonda renkli piksellerin ≥%80'inin tek tonda toplanmasını
istiyor. Zeminler kroma taşımaya başlayınca `akan-alan` **%78** verdi. Histogram:

| kova | pay |
|---|---|
| 240° | %81,3 |
| 220° | %14,3 |
| 230° | %4,2 |
| **240°±10** | **%99,8** |

Üçü TEK bir renk ailesi; gren ve vinyet aynı mavinin tonunu bir kova kaydırıyor.
**Ton sürekli bir büyüklük, kova 10°** — tek kova sayan ölçüm sürekliliği kusur olarak
raporluyordu. Pencere ±10°'ye açıldı ve hâlâ dar: amber (80°) ile mavi (240°) arasında
160° var, gerçek bir ikinci küme bu pencereye sığmaz.

### ⚠ KASTEN İHLAL TESTİNİN HEDEFİ ESKİDİ

*"Bir şablonun aksanını değiştir → ızgarada sırıtsın"* testi marka mavisini bozuyordu;
`dizin` P2'ye geçince mavi onu hiç etkilemez oldu ve ölçüm *"bozuk 20° · sağlam 20°"*
dedi. **İddia doğru, HEDEF eskimişti:** artık `dizin`in kendi paletini (`celik-bakir`)
bozuyor.

⚠ **R-98 yine vurdu:** yorumdaki ters tırnaklar tarayıcı kod parçasını taşıyan template
literal'i kapattı ve dosya AYRIŞMADI. Tarayıcıya gönderilen metnin içinde ters tırnak
kullanılamaz — bu oturumda dördüncü tekrarı.

## FAZ-19.7 · kapak kilidi ÖLÇÜLDÜ — dokuz kapak aynı noktadan açılıyor

Denetim *"on kartın dokuzunda aynı açılış hamlesi"* demişti. Ölçüldü — kapak metin
yığınının sol ve üst kenarı (kadraj yüzdesi):

| | değer | kaç şablon |
|---|---|---|
| **sol kenar** | %5,7–5,9 | **9 / 10** (yalnız `editoryal` %51,8) |
| **üst kenar** | %5,6 | **7 / 10** (`alinti` %27,2 · `sahne` %29,6 · `editoryal` %26,7) |

⚠ Panel de sayılınca kompozisyon imzası (sol/üst/alt) ondan dokuzunda AYRI çıkıyor;
tek çakışma `veri-hikayesi` ile `donen` (6/6/87). Kalan kilit **giriş noktası**:
altı şablon hâlâ (%6, %6)'dan açılıyor.

**Göz ilk 300 ms'de siluet okur, süs okumaz** — ve dokuz kapak aynı silueti veriyordu.

### ⚠ ALTI AD, ÜÇ SONUÇ — çeşitlilik yapılandırmada var, piksele ULAŞMIYOR

Beyan edilen yerleşim dağılımı aslında çeşitli: `ust-sol` 3 · `orta-sag` 2 · `ust-sag` 2 ·
`ayrik-sol` 1 · `yayik-sol` 1 · `orta-sol` 1. Ama ölçüm dokuz kapağı aynı yerde buluyor.
İki sebep:

1. **`kolon: 'sag'` KAPAK KARTINDA değil**, sonraki kartlarda ayarlıydı — `kavis` ve
   `karsilastirma` "sag" beyan ediyor, kapakları soldan açılıyordu.
2. ⚠ ⚠ **BU MADDE YANLIŞTI ve düzeltilerek duruyor.** *"`ayrik` ile `ust` aynı
   `justify-content` — ayırt edilemez"* yazmıştım. `justify-content` kısmı doğru (ikisi de
   `flex-start`) ama SONUÇ yanlış: `ayrik` metin yığınına değil **PANELE** etki ediyor —
   `.panel, .sayilar, .etiketler { margin-top: auto }`. Aleti yalnız `.ust-baslik,
   .baslik, .govde` ölçüyordu, yani `ayrik`ın etki ettiği ögeyi HİÇ GÖRMÜYORDU.
   Panel de sayılınca fark ortaya çıkıyor: `veri-hikayesi` alt kenarı %46,7 → **%86,8**,
   `karsilastirma` %48,2 → **%72,5**, `dizin` %33,1 → **%46,1**.
   **Ölçüm aracı dokuzuncu kez yanlış şeye bakıyordu** — ve bu kez yanlış sonucu
   deftere de yazdırmıştı.

### ⚠ `kavis` DİKEYDE KIRILAMADI — form buna izin vermiyor

Önce `yerlesim: 'orta'` denendi. Kapı geri çevirdi: metin doğrudan kemerlerin içine
düştü — `sus-metni-kesiyor` **%36,2**, `metin-zemine-karisiyor` %20 ve %11 (tavan %4).
**Kemerler kadrajın alt yarısını tutuyor; `kavis`in metninin üstte olması bir alışkanlık
değil, formun kendisi.** Siluet YATAYDA kırıldı: kapak kartı `kolon: 'sag'`, sol kenar
**%5,9 → %28,0**. Sol kenar paylaşan şablon 9 → 8.

## FAZ-19.7 · giriş noktası 9/10 → 6/10 — ve sınırı YERLEŞİM değil İÇERİK çiziyor

| şablon | sol kenar | nasıl |
|---|---|---|
| `kavis` | %5,9 → **%28,0** | kapak kartı `kolon: 'sag'` |
| `karsilastirma` | %5,9 → **%25,9** | kapak kartı `kolon: 'sag'` |

⚠ **`karsilastirma` zaten `sag` BEYAN EDİYORDU** — ama `kolon` sonraki kartlarda
ayarlıydı, kapakta değil. Beyan ile çizilen arasındaki fark, bu deponun tekrar eden
hatasının kompozisyon hâli.

Kompozisyon imzası (sol/üst/alt, panel dahil) artık ondan dokuzunda AYRI; tek çakışma
`veri-hikayesi` ↔ `donen` (6/6/87). Kalan kilit giriş noktasında: **beş şablon hâlâ
(%5,9 · %5,6)'dan açılıyor.**

### ⚠ ⚠ İKİ ŞABLON DİKEYDE KIRILAMADI — ve sebebi AYNI

| şablon | denenen | kapının cevabı |
|---|---|---|
| `kavis` | `yerlesim: 'orta'` | `sus-metni-kesiyor` **%36,2** · `metin-zemine-karisiyor` %20 ve %11 |
| `memphis` | `yerlesim: 'orta'` | `metin-gorsel-cakisiyor` gövde **%63** · başlık %13 · gövde %31 |

İkisinde de kadrajın alt yarısını bir KÜTLE tutuyor — `kavis`te kemer dizisi, `memphis`te
kesik özne. **Metnin üstte olması bir alışkanlık değil, formun kendisi.**

⚠ **Denetimin *"hiçbir durum ikiden fazla tekrarlanmaz"* kuralı YERLEŞİMLE tek başına
karşılanamıyor.** Yerleşim çeşitliliğinin sınırını İÇERİK çiziyor: bu iki şablonun girişi
ancak görsel briefi değişirse (FAZ-19.8) yer değiştirebilir. Kural yanlış değil; **tek
başına yeterli değil** ve bunu ancak kapıya çarparak öğrenilir.

## FAZ-19.7 · giriş noktası 6/10 → 4/10 · ve REÇETE KENDİ ŞARTINI SAĞLAMIYOR

`akan-alan` kapağı da sağ kolona alındı: sol kenar %5,9 → **%23,9**. Eğri sınırı 01'de
y=%78'den başlıyor, yani kütle sol-altta; metin sağa geçince kadraj iki kütleye bölünüyor.

**(%5,9 · %5,6)'dan açılan şablon: 9 → 6 → 4** (`veri-hikayesi` · `memphis` · `donen` ·
`dizin`).

### ⚠ ⚠ REÇETENİN VERDİĞİ P1 ÇİFTİ, REÇETENİN KENDİ EŞİĞİNİ GEÇEMİYOR

Reçete `akan-alan` için *"İkisi arasındaki kontrast ≥ 1,6:1 olmak zorunda"* diyor ve
hemen ardından çifti veriyor: `--m-taban oklch(0.160 0.101 262)` ve
`--m-yuzey oklch(0.240 0.102 262)`. Ölçüldü:

| çift | kontrast | reçetenin şartı |
|---|---|---|
| P1 taban ↔ P1 yüzey | **1,18:1** | ≥1,6 ✗ |
| P1 taban ↔ `ink-650` (bugünkü gri) | 3,07:1 | ✓ ama palet DIŞI |
| P1 taban ↔ **`murekkep-alan`** (yeni) | **1,77:1** | ✓ ve palet İÇİ |

**Reçete doğru şeyi istiyor, verdiği sayı onu tutmuyor.** Sebep rampanın gölgede ara
adımının olmaması — aynı boşluk `kavis`in taşıyıcısını `color-mix`e zorlamıştı. P1'e
üçüncü adım eklendi: `oklch(0.360 0.130 262)` = `#123780`, cusp'ın %76'sı.

Çizildi ve BAKILDI: dökme alan artık **mavi** (`#113272`) ve görünür — hem palet içinde
hem eşiğin üstünde. Nötr gri bir alan, "mürekkep+mavi" adını taşıyan bir palette
sessizce yabancıydı.

## FAZ-19.7 · giriş noktası 4/10 → 3/10 — ve DAĞARCIK TÜKENDİ

`dizin` kapağı da sağ kolona: sol kenar %5,9 → **%29,9**. Hayalet kelime (DİZİN) kadrajın
sol-altını tutuyor; metin sağa geçince ikisi artık aynı köşe için yarışmıyor.

**(%5,9 · %5,6)'dan açılan şablon: 9 → 6 → 4 → 3** (`veri-hikayesi` · `memphis` · `donen`).

### ⚠ ⚠ DENETİMİN "İKİDEN FAZLA TEKRARLANMAZ" KURALI BU DAĞARCIKLA KARŞILANAMAZ

Sol kenar üçe bölününce bugünkü dağılım:

| bölge | şablon | sayı |
|---|---|---|
| sol (<%15) | `veri-hikayesi` · `memphis` · `donen` · `sahne` · `alinti` | **5** |
| orta (%15–40) | `akan-alan` · `karsilastirma` · `kavis` · `dizin` | **4** |
| sağ (>%40) | `editoryal` | 1 |

Başlangıç 9/0/1'di; bugün 5/4/1. Gerçek bir kazanç ama tavan 2 değil.

**Sebep dağarcıkta:** yatay eksenin YALNIZ İKİ durumu var (`sol` · `sag`). Denetim beş
durum istiyor — `ust-sol` · `alt-sol` · `orta-sag` · **`tam-genislik`** · **`zemin-ustu`** —
ve son ikisi kodda **YOK**. Üç şablon da (`memphis` · `donen` · `veri-hikayesi`) dikeyde
kırılamıyor çünkü kadrajın alt yarısını içerik tutuyor.

⚠ **Kural yanlış değil; DAĞARCIK eksik.** Beş duruma ulaşmanın yolu şablonları zorlamak
değil, `tam-genislik` (metin sütunu kadrajın tamamı) durumunu YAZMAK. O gelene kadar
5/4/1 dürüst tavan.

## FAZ-19.7 · KÖK SEBEP — kapak kilidi TAŞIYICI GELENEĞİNİN sonucu

Üç şablonun üçü de dikeyde kırılamadı ve **üçünde de sebep aynı**:

| şablon | denenen | kapının cevabı | alt yarıyı ne tutuyor |
|---|---|---|---|
| `kavis` | `orta` | `sus-metni-kesiyor` %36,2 | kemer dizisi |
| `memphis` | `orta` | `metin-gorsel-cakisiyor` gövde %63 | kesik özne |
| `veri-hikayesi` | `alt` | `sus-metni-kesiyor` %4,4 · %2,2 · %2,3 | eğri bandı |

**On şablonun dokuzunda akış taşıyıcısı — eğri · kemer · kama · ok · kesik özne —
kadrajın ALT yarısında duruyor.** Metin bu yüzden üstte.

⚠ ⚠ *"Dokuz kapak aynı yerden açılıyor"* bir tembellik değil, **taşıyıcı konumunun
kaçınılmaz sonucu.** Denetim semptomu doğru teşhis etti, sebebi değil. Dikey çeşitlilik
ancak TAŞIYICI da yer değiştirirse gelir — yani *"sürekliliği veriye bağla"* (19.7) ve
görsel briefi (19.8) adımlarıyla. Yatay eksen, bu geleneğin altında tek gerçek
serbestlik derecesiydi ve sonuna kadar kullanıldı:

**sol kenar dağılımı 9/0/1 → 5/4/1** — dört şablon kapak kartına `kolon: 'sag'` alarak
(`akan-alan` %23,9 · `karsilastirma` %25,9 · `kavis` %28,0 · `dizin` %29,9).

⚠ `tam-genislik` de çare değildi: ölçüldü, şablonların metin sütunu zaten kadrajın
%42–88'ini kaplıyor (`alinti` %78,1 · `veri-hikayesi` %76,1). Eksik olan genişlik değil,
DİKEY serbestlik.

## FAZ-19.7 · sürekliliği VERİYE bağla — geometri iddianın kanıtı

Denetimin en sert tek cümlesi `veri-hikayesi` içindi: *"grafik başlığı YALANLIYOR —
'iki katına çıkan' derken çizgi ~4°; bu zevk değil ARGÜMAN hatası."*

### 1 · Eğri, başlığın söylediği sayıyı çizmiyordu

Eğrinin taşıdığı değer taban çizgisinden yükseklik (`100 − y`):

| | ilk | son | oran |
|---|---|---|---|
| eski noktalar | 30 | 96 | **3,2×** |
| yeni noktalar | 45 | 90 | **2,0×** |

**Tipografi "iki kat" derken geometri "üç kat" çiziyordu.** `veri-egrisi.test.ts` artık
bir SAYIYI değil bir İLİŞKİYİ sınıyor: başlıkta "iki katına" geçiyorsa eğrinin son
değeri ilk değerinin iki katı olmak zorunda; ayrıca eğri MONOTON yükselmeli (arada
düşen bir eğri, uçlar tutsa bile iddiayı daha sinsi biçimde yalanlar).

### 2 · Kilometre durakları eğriye DEĞMİYORDU

`.kilometre` yalnız `left` alıyordu; `bottom` CSS'te sabit **120 px**'ti. Yıl pulları
eğriyle hiç temas etmiyordu — denetimin sözleriyle *"eksen değil LEJANT."* Artık her
durağın y'si eğri noktaları arasında doğrusal ara değerle bulunuyor. Eğri zaten düz
parçalardan oluştuğu için (`M/L`) ara değer **eğrinin kendisi** — yaklaşık değil.

⚠ `bantSvg` ölçeği bilmiyordu; `slaytGenisligi` parametresi eklendi (R-99: her sayı tek
tabandan). Bilmeseydi tuval değişince duraklar eğriden kayardı.

Kesilmemiş panoramaya BAKILDI: yıl pulları artık yükselen köşegenin üstünde oturuyor.
**Bir lejant süstür; eğrinin üstünde duran bir durak iddianın kanıtıdır.**

## FAZ-19.7 · aksan disiplini — 45/45'ten 20/45'e

Denetim: *"aksan on kartta da aynı sözdizimsel yerde — her kartta aynı yerde duran aksan,
AKSAN DEĞİLDİR"* ve *"tek mavi anı işe yarayan şey NADİRLİĞİDİR."* Ölçüldü:

| | önce | sonra |
|---|---|---|
| başlığında aksan taşıyan kart | **45 / 45 (%100)** | **20 / 45 (%44)** |
| şablon başına | 3–6 | tam **2** |
| tamamen sessiz kart | **0** | 25 |

⚠ **İlk ölçüm YANLIŞ ÖGEYİ sayacaktı.** `**...**` hem başlıkta hem gövdede geçiyor ama
`.govde strong` `--kart-metin` kullanıyor, `--kart-aksan` değil: gövde vurgusu KALIN,
renkli değil. Aksan sayımı yalnız `.baslik`e bakmak zorunda — yoksa ölçüm rengi olmayan
bir vurguyu "aksan" sayardı. (Gövde zaten hiç `**` taşımıyordu; sayı aynı çıktı ama
tesadüfen doğru olmak, doğru ölçmek değildir.)

### Kural iki yönlü ve ikisi de gerekli

- **`vurgu` ≤ 2** — aksan nadir olmalı.
- **`yok` ≥ 1** — en az bir kart TAMAMEN sessiz; tavan tek başına *"her kartta biraz"*
  dağılımını engellemez.

⚠ **Hangi ikisi: AÇILIŞ ve VARIŞ.** Karosel bir yolculuk; girişini ve vardığı yeri
işaretlemek, aradaki her adımı işaretlemekten daha çok şey söyler. Ortadaki kartların
aksanlı olması yolculuğu değil GÜRÜLTÜYÜ artırıyordu.

Kesilmemiş panoramaya BAKILDI: 2.–5. başlıklar artık sessiz, magenta yalnız açılışta
("iki katına") ve varışta ("kalite") konuşuyor. Panorama genelinde aksan piksel oranı
**%1,89**.

## FAZ-19.7 · `dizin` okları — "üç aynı leke" VERİDE birebir öyleydi

Denetim: *"üç mavi ok aslında ÜÇ AYNI LEKE: aynı şekil, aynı uzunluk, başsız uçsuz,
hiçbirini hiçbir şeye bağlamıyor."* Veriye bakıldı:

| ok | açıklık | \|Δy\| |
|---|---|---|
| 1 | 14 | 6 |
| 2 | 14 | 6 |
| 3 | 14 | 6 |

**Üçünün de açıklığı ve dikey yolu birebir aynı.** Şikâyet bir izlenim değil, veri.

### Uçlar ölçülerek bağlandı

`liste.mjs` ile liste panellerinin gerçek panorama yüzdeleri okundu:

| kart | panel x | madde numarası |
|---|---|---|
| 1 | %7,5–22,3 | %9,0 · y %44,2 |
| 2 | %26,5–41,3 | %28,0 · y %41,1 |
| 3 | %51,5–66,3 | %53,0 · y %41,1 |
| 4 | **panel YOK** | — |

Her ok artık bir kartın panelinin BİTTİĞİ yerden başlayıp sonraki kartın madde
NUMARASINA iniyor. Açıklıklar 5,7 · 11,7 · 10,2 — üç ok üç ayrı mesafe kat ediyor.

### ⚠ REÇETENİN İKİ ŞARTI AYNI ANDA SAĞLANAMIYOR

Reçete hem *"sonraki maddenin numarasına insin"* hem *"kesimi 45–60° açıyla geçsin"*
diyor. Maddeler aynı yükseklikte (y %41–44); %5,7'lik bir açıklıkta 45° için ~%17 dikey
yol gerekiyor ve o da oku maddenin çok altına indirirdi. **Ya ok maddeye iner ya dik
açıyla geçer.** Bağlantı seçildi — denetimin şikâyeti "açı" değil *"hiçbirini hiçbir şeye
bağlamıyor"*du.

⚠ **Kalınlık 34 → 14 ve bunu BAĞLANTI ortaya çıkardı.** Uçlar boşluktayken kalın bir leke
*"bir şey var"* diyordu; ok bir numaraya inince kalın gövde o numarayı EZDİ. Çizildi ve
bakıldı: 34'te üç şişman leke, 14'te üç kalem izi. Reçetenin verdiği sayı da 14'tü ve
gerekçesi ancak ok bağlandıktan sonra anlaşıldı.

⚠ **AÇIK: `dizin` 4. kartında panel YOK.** Denetim *"dört maddenin DÖRDÜNÜ göstersin"*
diyor; kapanış kartı listeyi taşımıyor ve üçüncü ok bu yüzden bir numaraya değil çip
satırına iniyor.

## FAZ-19.7 · `dizin` BÜTÜN oldu — ve bir zincir halkasını daha ortaya çıkardı

Denetim: *"dört adımlık dizin her karede TEK satır gösteriyor — dizin hiçbir yerde bir
arada görünmüyor."* Veride birebir öyleydi: üç kartta tek maddelik liste, dördüncüde hiç
liste yok (çip satırı vardı).

**Yalnız o anki maddeyi gösteren şey bir dizin değildir; dizin bütünü gösterip içinde
nerede olduğunu söyleyendir.** Artık her kart dört maddenin dördünü taşıyor — üçü sönük
(opaklık 0,38), biri yanık.

### Yanık satır kart sırasıyla iniyor — ve oklar onu izliyor

| kart | yanık madde | y |
|---|---|---|
| 1 | 01 | %44,2 |
| 2 | 02 | %43,6 |
| 3 | 03 | %46,2 |
| 4 | 04 | %48,8 |

Oklar yeniden ölçülüp bu inişe bağlandı. **Geometri artık dizinin ilerlediğini de
söylüyor** — okun eğimi bir süs değil, listedeki adımın karşılığı.

### ⚠ İKON KATMANI SESSİZCE KAPANDI ve kapı yakaladı

`dizin` dört maddeyi birden göstermeye başlayınca *"haftalık oku"* satırı ilk kez her
kartta göründü ve **hiçbir köke oturmadı**. İkon kuralı *"ya hepsi ya hiçbiri"* olduğu
için tek eşleşmeyen satır katmanı TÜMDEN kapatıyordu — dört listenin dördünde de ikon
kayboldu. `katalog-ornek.test.ts` bunu anında kırmızıya çevirdi.

⚠ Çözüm yeni bir İKON değil, var olan `takvim` ikonuna eksik bir kök: **`hafta`**.
Dağarcık zaten `periyod` · `program` · `çizelge` taşıyor; hafta da bir takvim kavramı.
**İçerik zenginleşince sözlüğün eksiği görünür oldu** — dört maddeden üçü hep görünüyordu,
dördüncüsü hiç.

---

## Ölü bant — her slaytta en uzun içeriksiz yatay bant (FAZ-19)

Denetim: *"panolar y≈%75'ten %45-60'a insin ve sürekli ögeye DEĞSİN; art arda iki slaytta
en uzun boş bandın başlangıç y'si %8'den yakın olamaz."* Ölçmek için yeni bir alet yazıldı.

### Alet ÖNCE PİKSELLE yazıldı ve YANLIŞTI

İlk sürüm kenar sayıyordu (4×4 küçültme + yatay gri farkı). İki yerde yalan söyledi:

| Şablon | Alet ne dedi | Gerçek |
|---|---|---|
| `kavis` | en uzun ölü bant **%2** | her satırda 30-150‰ "kenar" vardı — o **DOKU**ydu |
| `memphis` | y%53-92 arası **dolu** | sabit 15‰ = tek bir **4 px'lik saç çizgisi** |

**Doku tanım gereği zemindir; ölçülen şey içerik dağılımıdır.** İkinci sürüm içerik
kutuları + taşıyıcının gerçek geometrisi (`getPointAtLength` örneklemesi) üzerinden
ölçüyor — `getBBox` panoramanın tamamına yayıldığı için kullanılamadı.

**Ve ikinci sürüm de bir kez yalan söyledi:** dört şablon "%100 dolu" çıktı. Sebep
`alan-siniri`in tuvali kaplayan konturSUZ `rect`i — bir **renk alanı zemindir**, içerik
değil. Konturu olmayan ve slaytı kaplayan dolgu artık geçiliyor; çizilmiş **kenar** değil.

### Ölçüm (10 şablon, kart kart, `y%başlangıç+yükseklik`)

| Şablon | Kartlar | Kapsam |
|---|---|---|
| veri-hikayesi | 47+26 · 34+35 · 34+34 · 31+34 · 34+27 · 34+22 | %57 |
| akan-alan | 47+12 · 35+23 · 42+13 · 38+14 · 35+21 · 35+18 | %73 |
| sahne | 0+13 ×4 | %85 |
| memphis | 31+22 · 44+9 · 26+7 · 26+27 · 32+7 · 38+15 | %70 |
| donen | 87+7 ×4 | %83 |
| editoryal | 0+0 · 0+0 · 0+29 · 0+0 | %93 |
| kavis | 44+19 · 44+19 · 33+30 · 39+24 | %60 |
| alinti | 0+27 · 0+25 · 0+29 | %55 |
| karsilastirma | 73+8 · 31+37 · 35+21 · 24+7 | %70 |
| **dizin (önce)** | **54+14 · 51+43 · 51+43 · 51+43** | **%42** |

`kavis` %44+19 ölçüldü — denetimin bağımsız gözlemi *"gövde ~y620 ile kemerler ~y900
arası ölü"* (= %43-%62). **İki ayrı yöntem aynı yeri gösterdi.**

### `dizin`: sebep tek satırdı — `gorseller: []`

On şablonun tek görselsiz olanı. Kapsamı %42, aile ortalaması %70; alt yarısı boştu.

**Bir dizin sıkışık bir pencere ögesi değil, sayfadan aşağı inen bir GÜZERGÂHTIR.**
`yayik` maddeleri kadrajın boyuna dağıtıyor. **Doldurmak için hiçbir öge EKLENMEDİ** —
kutu koymak R-81'in saydığı "kodlanmış öge"yi artırır ve tam da şikâyet edilen HTML-CSS
görüntüsünü üretirdi. Zaten çizili olan sol dikey çizgi bir omurga uzunluğuna kavuştu.

| | önce | sonra |
|---|---|---|
| en uzun ölü bant | **%43** | **%7** |
| kapsam | %42 | **%74** |
| yanık maddenin inişi | %44,2 → %48,8 (**%4,6**) | %52,7 → %83,8 (**%31,2**) |
| ok açısı | ~1,4° | ~27° |

### Bir önceki tespit NİCELİK olarak eskidi

*"Ok hem maddeye inip hem 45-60° geçemez"* tespiti duruyor ama sayıları değişti: iniş
dört katına çıkınca açı ~1,4°'den ~27°'ye yükseldi. Hâlâ 45° değil — kesim açıklığı
dikey yoldan uzun — ama üç ok artık üç ayrı yükseklikten geçen bir **iniş** çiziyor.

### Kapı ve kalan borç

`olu-bant.test.ts`: genel tavan **%38**, `dizin` tavanı **%9**.
Tavan 12 denendi ve işe yaramazdı — ihlal 0,014 puanla kırmızıya dönüyordu.

**%38 dürüsttür, hedef değildir.** %25'in üstünde kalanlar yazılı borçtur:
`veri-hikayesi` %26/35/34/34/27 · `memphis` %27 · `kavis` %30 · `alinti` %27/25/29 ·
`editoryal` k3 %29 · `karsilastirma` k2 %37. Kapandıkça tavan aşağı çekilecek.

**Art arda yakın başlangıç (%8 kuralı) henüz kapıda değil: 28 ihlal.**

---

## Kapanış kartı — deste "bitti" değil "VARDIK" demeli (FAZ-19)

### Mekanizma kodda vardı, katalogda SIFIR çağıranı

`kapanis` tipi, işaretlemesi ve CSS'i `panorama.ts`te duruyordu; **on şablonun hiçbiri
kullanmıyordu.** On birinci kez aynı sınıf (D-182 · D-190 · D-224 · D-250 · D-261 ·
D-270 · D-347): modül yazılır, testi yeşildir, üretim yolunda çağıranı olmaz.

### Sıra bir tercih değil, ÖLÇÜM

`sahne`nin son karesinde mürekkep %2,2 idi.

| eklenen | mürekkep |
|---|---|
| yalnız imza (marka işareti + çağrı) | %2,2 → **%2,8** (+0,6) |
| varış rakamı + imza | %2,2 → **%8,0** (+5,8) |
| bunun imzadan geleni | **+0,4** |

**Kapanışı taşıyan şey imza değil, VARILAN SAYIdır.** Rakam işaretten önce geliyor.

### Rakam sabit puntoyla yazıldı ve KESİLDİ

Archivo 700 + `-0.045em` aralıkta ölçüldü (`rakam-en.mjs`, tahmin değil):

| ölçü | değer |
|---|---|
| hane ilerlemesi | **0,552 em** (1, 2 ve 3 hanede aynı) |
| kapak yüksekliği | **0,705 em** |

458 px'te iki hane **506 px** yer istiyor; `sahne`nin sağ kolonu **454 px**. Rakam
kadrajın dışına taştı — yani *"çizgiler yazıyı kesiyor"* kusurunu kendi elimle ürettim.
Punto artık kolondan hesaplanıyor: `min(458, kolon / (0,552 × hane))`.

### `yayik` ile `kapanis` aynı kartta ÇAKIŞTI

`dizin`in son kartında dev `04` rakamı listenin kendi `04` satırının üstüne bindi —
`yayik` panele kalan yüksekliği veriyor, kapanış bloğu da aynı yeri istiyor. **İki varış
aygıtı bir kartta.** Çözüm iskeleti KIRMAK: üç kart güzergâhı yayıyor, dördüncü onu
topluyor ve varış rakamını veriyor. Son ok da artık liste satırına değil **rakama**
iniyor (yanık satır %83,8'den %48,8'e çıktığı için ucu boşlukta kalmıştı).

### Mürekkep — on deste, son kart

| şablon | önce | sonra | destenin en boşu | oran |
|---|---|---|---|---|
| veri-hikayesi | %6,6 | **%13,0** | %5,0 | 2,60 |
| akan-alan | %41,9 | **%43,3** | %29,5 | 1,47 |
| sahne | %2,2 | **%8,0** | %2,4 | 3,33 |
| memphis | %7,5 | **%14,5** | %3,6 | 4,03 |
| donen | %6,7 | **%14,3** | %9,4 | 1,52 |
| editoryal | %6,9 | **%12,4** | %7,2 | 1,72 |
| kavis | %23,5 | **%27,8** | %23,7 | 1,17 |
| alinti | %24,6 | **%29,9** | %9,8 | 3,05 |
| karsilastirma | %49,9 | **%50,6** | %18,4 | 2,75 |
| dizin | %3,9 | **%10,4** | %3,7 | 2,81 |

### Denetimin "%12 mürekkep" eşiği KULLANILMADI — ve sebebi ölçüm

İki aday kural denendi, ikisi de yanlış çıktı:

- **"kapanış ≥ gövde ortalamasının 2 katı"** — `akan-alan` 1,18× · `donen` 0,60× ·
  `kavis` 0,96×. Görselli kartlar gövde ortalamasını tanım gereği yükseltiyor; kural
  destenin zenginliğini kusur sayıyordu.
- **"kapanış ≥ destenin medyanı"** — `donen` 14,3 vs medyan 20,95'te düşüyor. Tam fotoğraf
  taşıyan bir karenin piksel kütlesi, tipografik kütleyle kıyaslanabilir değil.

Kalan kural denetimin KENDİ kanıtına dayanıyor: *"son kare destenin en boş karesi."*
**Kapanış ≥ destenin en boşu × 1,10.** On destede geçiyor; en dar pay `kavis` (1,17)
çünkü o destenin dört karesi zaten birbirine yakın (%23,7-%27,8).

### Kapı

`kapanis-karti.test.ts` (12 test): on destenin ONUNDA da son kart kapanış taşıyor ·
kapanış yalnız son kartta · rakam kartın içinde kalıyor (taşma = kesilmiş) · kapak boyu
240-360 px · rakam imzadan önce. Kasten ihlal: punto tavanı `min` yerine `max` yapıldı,
beş şablon kırmızıya döndü (kapak 484 px).

### Kapanış kartı KURULURKEN dört kapı birden kırmızıya döndü — dördü de haklıydı

**1. `katalog-dikis` — ON şablonda birden.** `uyarla` alanı taşımıyordu: kapanış kataloğa
girdi, uyarlanmış belgeye GEÇMEDİ. `zemin` · `kolon` · `ayar` aynı dersi üç kez anlatmıştı
(D-269 sınıfı); `kapanis` dördüncüsü ve **ilk kez bir kural — yorum değil — yakaladı.**

**2. `taban-ritmi` — `donen`.** Kural *"okuyucu kaydırırken gövde satırı yerinden
kıpırdamıyor"* diyordu; kapanışta gövde 1250'den 434'e çıkıyor. Muafiyet kuralın KENDİ
gerekçesinden geldi: o söz GÖVDE kartları hakkında, kapanış kaydırmanın bittiği yer.
**Muafiyet açık çek değil:** kapanış gövdesi ötekilerin ALTINA kayarsa yine kırmızı.

**3. `metin-gorsel-cakisiyor` — `donen` %47, sonra `memphis` %19.** Kapanış gövdeyi yukarı
itiyor ve gövde tam o yükseklikteki görselin üstüne biniyor. **Gövde kartların DİBİNDE
dururken görselin ALTINDA kaldığı için sorun görünmüyordu; yer değişince çıktı.**

**4. `duzen-provasi` — `donen`.** Kapanış eklenince örnek metin sığmaz oldu.

#### Metin kolonunu daraltmak DENENDİ ve DAHA KÖTÜ oldu

İlk çözüm gövdeyi görselin sol kenarına kadar daraltmaktı (kolon TS'te görsel x'inden
hesaplanıyordu). `donen` düzeldi, `memphis` bozuldu: gövde **dört satıra sardı**, kart
TAŞTI ve çağrı rayın altında kesildi. Çizilene bakılınca görüldü, ölçümden değil.

#### Kalan kural: kapanış kartında YÜZEN kesik özne yok, tam boy şerit serbest

| şablon | görsel | sonuç |
|---|---|---|
| `donen` | y23-77 kesik özne | gövdenin %47'si üstünde → **kaldırıldı** |
| `memphis` | y53-93 kesik özne | %19 → **kaldırıldı** |
| `editoryal` | y0-93 tam boy şerit | çakışma yok → **DURUYOR** |

⚠ Kural önce *"kapanışta fotoğraf olmaz"* diye fazla geniş yazıldı ve `editoryal`i
kırmızıya çevirdi. **İki dakika önce yazılmış bir kural uğruna çalışan bir kompozisyonu
silmek, sessiz düzeltmenin ta kendisi olurdu.** Ölçümün desteklediği ayrım tutuldu:
yüzen kesik özne rakamla aynı kadrajda yarışıyor, tam boy şerit metnin girmediği bantta.

#### Ve görsel kaldırmak İKİ SÖZLEŞMEYİ daha ısırdı

`donen` ve `memphis`ten kapanış görselini çıkarınca iki değişmez daha kırmızı döndü —
ikisi de düzeltmenin YARIM kaldığını söyledi:

| kapı | ne dedi | ne yapıldı |
|---|---|---|
| `katalog-ornek` | *"katalog `slayt-basina` ilan ediyor: 5 ≠ 6"* | `slayt-basina` artık **GÖVDE slaydı başına** — kapanış özne taşımaz |
| `katalog-kabul` | *"5 yuva, 6 varyant"* | altıncı varyant kaldırıldı (`donen`de dördüncü) |

⚠ `memphis`in varyant listesinde *"üç → altı"* notu duruyordu; şimdi **altı → beş**.
**Aynı değişmez iki kez, iki yönde çalıştı** — bir sözleşme yarım güncellenirse sessiz
kalmıyor. Toplam: kapanış kartı **altı kapı** tarafından sınandı ve altısı da haklıydı.

---

## Panolar taşıyıcıyı biniyor (FAZ-19)

Denetim: *"panolar y≈%75'ten %45-60'a insin ve **sürekli ögeye DEĞSİN**."*

### `veri-hikayesi` — boşluk, eğrinin OLMADIĞI yerdi

Altı karesinin **beşinde** ölü bant %26-%35 ve hepsi aynı yerde başlıyor (y%31-34).
Sebep kompozisyonun kendi mantığına aykırıydı: **eğri panorama boyunca yükseliyor,
panolar dipte düz duruyordu.** Pano artık kendi kartının merkezinde taşıyıcının altına
oturuyor (`--pano-dip`, 26 px pay).

| | önce | sonra |
|---|---|---|
| ölü bant (6 kart) | 26 · 35 · 34 · 34 · 27 · 6 | **20 · 18 · 21 · 22 · 10 · 6** |
| kapsam | %61 | **%71** |
| pano dipleri | 190 (hepsi) | **221 · 249 · 282 · 321 · 370** |

Ara değer hesabı `kilometre` duraklarından ORTAKLAŞTIRILDI (`araDeger`): iki kopya, bir
gün birinin unutulması demek.

### Kural bir kez FAZLA GENİŞ uygulandı ve ölçüm sınırı çizdi

`yerlesim: 'ust'`ta pano zaten gövdenin hemen ALTINDA; taşıyıcıya bindirmek onu aşağı
çekip gövdeyle arasında YENİ bant açıyor.

| `karsilastirma` | dipten konumlu | üstten konumlu (yanlış kapsam) |
|---|---|---|
| kart 1 | %73+8 | **%48+19** |
| kart 2 | %51+17 | **%31+29** |
| kapsam | %76 | **%73** |

**Kural doğruydu, KAPSAMI yanlıştı.** Yalnız dipten konumlanan yerleşimlere uygulanıyor.

⚠ Ve `--pano-dip` tek başına yetmedi: `ust` yerleşimde `margin-bottom` hiçbir şeyi yukarı
taşımıyor. `--pano-ust: auto` da yazılıyor — **taşıyıcıyı binmek panonun DİPTEN
ölçülmesini gerektiriyor.**

### `karsilastirma` — %37'lik bant bir KOMPOZİSYON değil ARGÜMAN kusuruydu

Destenin en uzun ölü bandı kart 2'deydi ve sebebi boşluk değil **içerik yokluğuydu**:
bir KARŞILAŞTIRMA destesinin ortasındaki iki kart hiçbir şey karşılaştırmıyordu. Başlık
*"ölçü vardiyaya indi"* diyor, altında ölçü yok.

Kart 2 → `1 sayaç` (önce, hat toplamında) / `3 sayaç` (sonra, vardiya başına)
Kart 3 → `7 gün` / `1 gün` (karar gecikmesi)

| | önce | sonra |
|---|---|---|
| ölü bant | 8 · **37** · 21 · 7 | 8 · **17** · 7 · 7 |
| kapsam | %70 | **%76** |
| art arda yakın | 1 | **0 — ilk temiz şablon** |

⚠ Kart 2'nin `kolon: 'sag'`ı kaldırıldı: kolonu dar olduğu için iki sayı DİKEY sarıyordu,
kart 3'ün aynı anlamdaki çifti YATAY duruyordu. **Seamless karoselde göz komşu kareleri
karşılaştırır**; aynı şeyi iki ayrı biçimde çizmek "aynı şablon farklı ad" şikâyetinin
tersidir. Kapak `sag` kalıyor — girişin ayrı durması kilidin kendisi.

### Kapı ve yeni tavan

`pano-tasiyici.test.ts`: pano dibi taşıyıcının en fazla **90 px** üstünde ("değmek"
ölçülebilir bir şeydir) · taşıyıcı yükseliyorsa panolar da yükseliyor · **kuralın kapsamı
boş olamaz** (bu depoda on bir kez "yazıldı ama çağrılmadı" oldu).

Ara değer testte YENİDEN yazıldı ve bu kasıtlı: `panorama.ts`in kendi yardımcısını çağıran
bir test, o yardımcı yanlışsa da yeşil kalır.

**Ölü bant tavanı %38 → %31.** En kötü artık `kavis` k3 (%30). Kasten ihlal: dip sıfırlandı,
iki kapı birden kırmızı döndü (bant %35, pano-taşıyıcı açıklığı 195 px).

---

## Kemer ritmi — sapma iddiası ile geometri (FAZ-19)

`kavis`in üçüncü karesi *"Sapma görünür olmalı"* diyor, gövdesi *"görünmeyen sapma,
ortalamanın içinde kaybolur"* diye açıyor. **On üç kemerin on üçü birebir aynı
yükseklikteydi** — tipografi sapmadan söz ederken geometri kusursuz bir ritim çiziyordu.

Bu, `veri-hikayesi` eğrisiyle **aynı sınıf kusur**: orada başlık "iki katına" derken eğri
3,2× çiziyordu (R-107). İki şablon, tek kural: *geometri iddianın kanıtı olmak zorunda.*

| | önce | sonra |
|---|---|---|
| kart 3 ölü bant | **%30** | **%17** |
| kemer yüksekliği | 13 kemer, hepsi eşit | 12 eşit + **1 sapan (1,5×)** |
| destenin en uzun bandı | %30 | %29 (`editoryal` k3) |

Sapan kemer 8. indekste: 13 kemer 4 karta bölününce 7-8-9 üçüncü karta düşüyor ve
üçüncü kart tam olarak sapmadan söz eden kart. **Sapan kemer o kartın ölü bandını da
kapatıyor — süs değil ARGÜMAN.**

### Kapı

`veri-egrisi.test.ts` genişletildi: sapmadan söz eden kart varsa geometride sapma OLMALI ·
çarpan farkı ≥0,25 (%10'luk bir sapma ritmin içinde kaybolur — tam da kartın şikâyet
ettiği şey) · sapma O KARTIN üstünde (başka karede sapan kemer cümleyi kanıtlamaz) ·
sapma TEK (ikisi ritim değişimi olur, sapma olmaz).

Kasten ihlal: çarpan 1,05 yapıldı, kapı kırmızı döndü. **Ölü bant tavanı %31 → %30.**

---

## `turkish-case` kapısı DOĞRU kodu suçluyordu (FAZ-19)

Kapı `.toLocaleLowerCase('tr')` — yani tam olarak İSTEDİĞİ yazımı — kırmızıya çeviriyordu.

**Sebep:** tarama, satırı `stripStringBodies`ten geçirdikten sonra okuyor. O da her dizinin
İÇİNİ boşaltıyor, yani `('tr')` → `('')`. Kapı **denetlediği argümanı göremiyordu.**

**Kanıt** — iki satırlık deney dosyası, ikisi de ders kitabı doğrusu:

```ts
export const a = (s: string): string => s.toLocaleLowerCase('tr')
export const b = (s, t) => `${s} ${t}`.toLocaleLowerCase('tr').includes('x')
```

İkisi de kırmızı döndü.

**Ve kapı gerçek koda çoktan zarar vermişti.** `katalog-ornek.test.ts`te şu yorum
duruyordu: *"`toLocaleLowerCase('tr')` DOĞRU olurdu ama `turkish-case` kapısı
eşleştirmeden önce string gövdelerini siliyor…"* — **yanlış alarm veren kapı, etrafından
dolaşılan kapıdır** ve bu depoda dolaşılmıştı.

**Düzeltme:** eşleşme hâlâ dizi gövdesiz satırda aranıyor (bir dizinin İÇİNDE geçen çağrı
adı ihlal değildir), ama locale doğrulaması HAM satırdan okunuyor — aranan kanıt dizinin
kendisi.

**Kasten ihlal — dördü de yakalandı:**

| yazım | sonuç |
|---|---|
| `toLocaleLowerCase()` (locale'siz) | ✗ yakalandı |
| `toLocaleUpperCase('en')` | ✗ yakalandı |
| `toUpperCase()` (çıplak) | ✗ yakalandı |
| `` `${s}`.toLocaleLowerCase('de') `` | ✗ yakalandı |
| `toLocaleLowerCase('tr')` | ✓ geçiyor |

⚠ Kapının kırmızısı **geçici görünüyordu** — aynı ağaçta bir koşuda yeşil, ötekinde
kırmızı. Sebep bulunana kadar "kapı flaky" demek kolaydı; deney dosyası onun flaky değil
**yanlış** olduğunu gösterdi.

---

## Ölü bant aleti ÜÇÜNCÜ kez düzeltildi — kenar payı ölü bant değildir

`editoryal`in üç kartı **"sıfır boş satır"** ölçüyordu ve panoramaya bakınca deste
neredeyse bomboştu. Şüphelendim ve iki değişiklik denedim; **biri yanlış çıktı.**

### Denenen ve GERİ ALINAN: satır genişlik eşiği (%18)

Hipotez: kartın dar bir dikey şeridi her satırı "dolu" saydırıyor. İki yerde yanlış:

1. **`editoryal`in şeridi zaten kart genişliğinin %40'ı** — eşik ona hiç dokunmadı.
   Yani alarm boştu: gördüğüm boşluk `src: ''` **yer tutucusuydu**; üretimde orada
   gerçek bir fotoğraf kolonu duruyor. *Alet haklıydı, gözüm yanılmıştı.*
2. Eşik **sivri biçimleri eledi**: `kavis`in sapan kemerinin ucu kartın %18'inden dar
   ve ölçüm o kartı %17'den yine %30'a çıkardı — oysa o boşluğu **dolduran şey** tam
   olarak o kemer.

### Kalan ve DOĞRU olan: kenar payı ölü bant değildir

Ölü bant artık **ilk ve son dolu satır arasında** aranıyor. Bir sayfanın kenar payı bir
tasarım kararıdır, kusur değil. Borç listemin üçte biri borç değilmiş:

| şablon | eski kayıt | gerçek | ne olduğu |
|---|---|---|---|
| `sahne` | %13 ×4 | **%1** | üst kenar payı |
| `editoryal` k3 | %29 | **%0** | ortalanmış metnin üst payı |
| `alinti` k1/k2 | %27/%25 | **%23/%12** (y%65/%68) | üst pay + gerçek iç bant |

### Kapı ile alet AYNI ŞEYİ ölçmüyordu

Düzeltmeyi kapıya taşıyınca `veri-hikayesi` k1 kapıda %29, alette %20 çıktı. Sebep:
**kapı fontları yüklemiyordu.** Yedek fontun satır metrikleri başka; bloklar kayıyor ve
ölü bant uzuyor. *Kapı ile alet aynı şeyi ölçmüyorsa ikisinden biri yalan söylüyordur.*
`fontCss` kapıya eklendi.

**Ölü bant tavanı %30 → %28.** Kalan gerçek iç bantlar: `memphis` k4 **%27** ·
`alinti` k1 %23 · `veri-hikayesi` %18-22 · `akan-alan` %21-23.

---

## ⚠ ÖLÇÜM ALETİ DÖRDÜNCÜ KEZ YALAN SÖYLEDİ — ve bu en pahalısıydı

**Üretim her ekran görüntüsünden önce `puntoOlcumu` koşuyor** (`panoramaCiz`, `panorama.ts`):
punto kolona oturuyor ve metin AŞAĞI iniyor. Ölü bant aletinin ve kapısının hiçbiri o adımı
koşmuyordu — yani **yayınlanmayan bir düzen** ölçülüyordu.

| `memphis` metin dibi | oturtmasız | oturtmalı (üretim) |
|---|---|---|
| kart 1 | y%31,1 | **y%50,9** |
| kart 4 | y%25,8 | **y%40,7** |

### Sonuç: defterdeki eski ölü bant sayıları GEÇERSİZ

Üretim düzeni ölçülünce tablo **çok daha iyi** çıktı:

| ölçüt | eski (yanlış düzen) | üretim düzeni |
|---|---|---|
| en uzun ölü bant | %28 | **%26** (`alinti` k1) |
| art arda yakın | 24 | **15** |
| `memphis` kapsam | %71 | **%85** |
| `memphis` k4 bandı | **%27** | **%5** |

**`memphis` k4'ün %27'lik deliği hiç var olmadı.** Serpilmeyi o deliğe bakarak yaptım.

### Beş özdeş kutu tespiti YİNE DE doğru — gerekçe değişti, karar değil

`memphis`in beş görselinin beşi de `y: 53`, `genislik: 8`, `yukseklik: 40` ve `x` farkları
tam **16,67**. Serpilme yoktu; bu, depo sahibinin *"kutucuklar html css gibi"* dediği ızgara
ve `kavis`in on üç özdeş kemeriyle aynı sınıf. Yuvalar artık **ölçülen metin diplerinden**
türüyor (k1 %50,9 · k2 %45,5 · k3-k5 %40,7) ve kutu oranı kaynağın 4:5'inden hesaplanıyor
(`sahne`de ölçülmüş `contain` tuzağı). Bedeli dürüstçe kayıtlı: kapsam %85 → %82.

### Aletin dört yalanı — hepsi aynı aileden

1. **Piksel kenar sayımı dokuyu içerik sandı** (`kavis` her satırda 30-150‰).
2. **Tuvali kaplayan konturSUZ dolgu içerik sayıldı** (`alan-siniri`in `rect`i) — dört
   şablon "%100 dolu" göründü.
3. **Kenar payı ölü bant sayıldı** ve **font yüklenmiyordu** (`veri-hikayesi` k1: %29 / %20).
4. **Punto oturtma adımı atlandı** — üretimdeki düzen hiç ölçülmedi.

### Kalıcı çözüm: `olcum-belgesi.ts` — belge TEK yerden kuruluyor

On bir tarayıcı kapısının **dokuzu** yedek fontla ölçüyordu; `metin-gorsel-cakisiyor` ayrıca
**belirteçsizdi** (`tokenCss: ''`). Ölçüm belgesi artık tek yerde kuruluyor: belirteç + font
+ **logo** + damga. Logo da ölçümün parçası — kapanış kartı gerçek marka işaretini taşıyor
ve logosuz ölçen kapı `donen` k4'te olmayan bir bant bildiriyordu (%22 / %28).

### Ve bir kapı FAZLA KATIYDI

`pano-tasiyici` çizilen panoların katı artmasını istiyordu. `veri-hikayesi` k5'te pano
taşıyıcıya **ulaşamıyor**: hedef dip 560, çizilen 498 — içerik izin vermiyor ve tarayıcı
`margin-bottom`u kısarak **doğru** davranıyor. Kapı artık katı artışı **tasarlanan** diplerde
(eğriden türeyen) arıyor; çizilen tarafta *"taşıyıcıya değiyor ya da içeriğin izin verdiği
kadar yükselmiş"* ölçülüyor. **Render'ın doğru davranışını kusur sayan kapı, kapı değildir.**

**Ölü bant tavanı %28 → %27.** Kasten ihlal: tavan 24 yapıldı, `alinti` k1 (%26) kırmızı döndü.

---

## Meta kapı: ölçüm belgesi zorunlu (FAZ-19)

Ölçüm belgesini tek yere toplamak bir hatayı kapatır; **bir dosya daha eklenir ve unutulur.**
`olcum-belgesi` kapısı (48.) tarayıcı açan her test dosyasının `olcumBelgesi` üzerinden
ölçtüğünü sınıyor.

### Kapı bilmediğim İKİSİNİ daha buldu

Elle saydığımda yedi fontsuz kapı vardı; kapı **on ikiyi** tarayıp dördünü suçladı ve
ikisi listemde hiç yoktu: **`punto-esigi`** ve **`sus-metni`**. *Elle sayım, kapının işini
yapamaz.*

### Kural bir kez FAZLA KÖR yazıldı ve kendi çıktısı düzeltti

İlk hâli her `tokenCss:` yazımını atlama sayıyordu ve meşru testleri kırmızıya çevirdi:

| test | neden `tokenCss` yazıyor |
|---|---|
| `ifsa` | şeridi gizlemek için belirteci KASTEN eziyor |
| `sus-metni` | süsün metni kesmesini FARKLI belirteçlerle ölçüyor |
| `aile-tutarliligi` | markaları karşılaştırıyor; belirteç onun değişkeni |

**Kapatılacak tuzak unutmak, ezmek değil.** Bir alanı bilerek değiştiren yazar zaten
haberdardır. Kural daraldı: dosya `olcumBelgesi`i **hiç** çağırmıyorsa kırmızı.

### Font bu dört kapının bugünkü kararını değiştirmiyor — ve bu da bir ölçüm

`OLCUM_FONT` boşaltıldığında yalnız `olu-bant`ın `dizin` iddiası kırmızı döndü;
`kadraj` · `taban-ritmi` · `tasiyici-gorunur` · `ifsa` yeşil kaldı. **Taşıma yine de
doğru** — gizli tuzağı kaldırıyor — ama kazanç diye yazılmıyor.

### Kapı ve kapsam koruması

Kasten ihlal: `punto-esigi` elle belgeye döndürüldü → kırmızı. Kapının kendi kapsamı da
korunuyor: hiçbir tarayıcı testi taranmazsa kapı **boş geçmiyor**, kırmızı dönüyor.

---

## `alinti` — alanı büyütmek denendi, ÇİZİLDİ, BAKILDI ve geri alındı

`alinti` destenin en boşu: kapsam %56, kart 1'in ölü bandı %26. Şablonun kendi iddiası
*"alıntı ilerledikçe mürekkep alanı büyüyor"* ama kart 1'de alan kadrajın yalnız **%6'sı** —
geometri o ağırlaşmayı çizmiyor, yalnız **ima ediyor**.

Sınır 94→72'den **78→62'ye** çekildi. Ölçüm iyi çıktı:

| | önce | sonra |
|---|---|---|
| ölü bant | %26 · %19 · %10 | **%10 · %6 · %10** |
| kapsam | %56 | **%66** |
| destenin en uzunu | %26 | **%22** |

### Ama kapanış kartını YUTTU

Kart 3'ün **gerçek** içerik dibi `.kapanis` bloğu dahil **y%86,8**. İlk ölçümüm yalnız
`.baslik`+`.govde`ye bakıp **%35,7** dedi ve yanlıştı — kapanış bloğu ölçüm seçicisinde
yoktu. Sınır tek yönlü yükseldiği için en sağda o içeriğe takılıyor: dev "01" rakamının
altı, künye ve marka işareti koyu alanın üstünde kayboldu. **Yani bu fazın kapatmaya
çalıştığı "çizgiler yazıyı kesiyor" kusurunu yeniden ürettim.**

### Hiçbir kapı yakalamadı — GÖZ yakaladı

`sus-metni` süs ögelerini ölçüyor, **alan sınırını değil**. Sebep kökte: `alanSiniri`
varken kart zemini `alanSiniri.ust`e SABİTLENİYOR (`kartZemini`), yani metin rengi
altındaki alanı takip etmiyor. Tek yönlü yükselen bir sınır, en sağdaki kapanış kartının
içeriğine takılmak zorunda.

**Yükselmeyi korumanın yolu kart zemininin bölgeye göre dönmesi** — ayrı bir iş, ve
`alinti`nin %26'lık bandı o iş yapılana kadar açık borç. Geri alındı: görünen bir gerileme
gönderilmez.

---

## Alan sınırının kestiği yazı İKİ alanda da okunmalı (FAZ-19)

Önceki turda `alinti`nin mürekkep alanını büyütme denemesi kapanış kartını yutmuştu ve
**hiçbir kapı yakalamamıştı** — göz yakalamıştı. Bu tur o boşluk kapatıldı
(`alan-siniri.test.ts`; kapı betiği değil test, o yüzden kapı sayacı 49'da kalıyor).

### Kural İKİ KEZ fazla geniş yazıldı, ölçüm iki kez daralttı

**1. "Sınır metni kesiyorsa kusur"** — dört şablonu birden suçladı. Oysa kesme bir
**görme** olayı: `editoryal`in iki alanı 0,985 / 1,000 (ΔL 0,015) ve sınır başlığın
arkasından geçse de hiçbir şey kesmiyor.

**2. "Görünür sınır metni kesiyorsa kusur"** — hâlâ üç şablonu suçladı. Ölçüm ayırdı:

| vaka | metnin İKİ alana ΔL'si | karar |
|---|---|---|
| `akan-alan` k6 rakam | 0,845 / 0,590 | okunuyor |
| `editoryal` k1-k4 | 0,795 / 0,810 | okunuyor (iki alan da açık) |
| `karsilastirma` k4 rakam | 0,845 / 0,680 | okunuyor (iki alan da koyu) |
| **`alinti` k3 marka işareti** | 0,795 / **0,000** | **alt alanda GÖRÜNMEZ** |

**Tek gerçek kusur sonuncusu** ve gözün yakaladığı da oydu. Kalan kural: *sınırın kestiği
yazı iki alanda da okunmalı*, eşik ΔL 0,30 — en yakın gerçek vakadan (0,590) iki kat uzakta.

### Kök sebep: bir varsayım yorumda yazılıydı ve artık geçersizdi

`kartinZemini` şöyle diyor: *"iki alanlı zeminde metin ÜST alanın üstünde duruyor (kartlar
üste yaslı)"*. Kapanış bloğu `margin-top: auto` ile **dibe** yaslı ve ölçüldü: üç şablonun
üçünde de dibi **y%86,8**. `alinti`de sınır y%76'dan geçiyor, yani imza ALT alanda.
Yeni `imzaninZemini` sınırın o karttaki y'sini okuyup imzanın gerçekten hangi alanda
durduğunu söylüyor — tek kartlık yama değil, kural.

### Ölçüm aleti bu kapıda ÜÇ kez kendini ele verdi

1. **Dolguyu `rgb` sandı**, tarayıcı `oklch()` veriyordu: ilk üç sayıyı 255'e böldü, iki
   alan da 0 çıktı, oran 1,00 ve kapı **herkesi geçti**. *Sessizce her şeyi geçen bir kapı,
   kapı değildir.*
2. **Hatayı yuttu**: `'tarayıcı açılamadı'` diyordu ve gerçek sözdizimi hatasını görünmez
   yaptı. Kusur ADIYLA taşınır — mesaj açılınca sebep bir denemede çıktı.
3. **Görselin mürekkebini `color`dan okudu**: marka işareti bir `<img>`; `color` onun
   devraldığı metin rengi. Render düzeltildikten SONRA bile kapı kırmızı kaldı çünkü yanlış
   özelliği okuyordu. İkinci deneme varyantı **adından** tahmin etti (`ink-` geçiyor mu) ve
   `akan-alan`ı kaçırdı (`murekkep-alan`). Kalan: **görselin kendi pikselleri** — saydam
   olmayan piksellerin ortalama ışığı.

⚠ Ve R-98 iki kez daha ısırdı: şablon değişmezinin İÇİNE ters tırnaklı yorum yazmak
değişmezi kapatıyor. Bu oturumda altıncı ve yedinci kez.

Kasten ihlal: `imzaninZemini` geri alındı, kapı ΔL 0,190 ile kırmızı döndü.

---

## `alinti` alanı YÜKSELDİ — kapı yol gösterdi, ölçüm sınırı çizdi

Geçen tur sınırı 78→62'ye çekmek kapanış kartını yutmuştu ve geri alınmıştı. Bu tur
bekçi vardı (`alan-siniri.test.ts`) ve **her adımda bir sonraki ögeyi adıyla söyledi.**

### Kapı üç kez konuştu, üçünde de haklıydı

1. Sınır yükseltildi → **`kapanis-rakam` ΔL 0,000**. Geçen turun kusuru, bu kez sayıyla.
2. Kapanış bloğunun tamamına alt alanın rengi verildi → ΔL 0,000 → **0,035**. Renk
   değişti ama hâlâ okunmuyor: **blok iki alanı birden kaplıyor**, tek renk ikisinde
   birden okunamaz.
3. Blok değişkeni ögelere BÖLÜNDÜ → yeşil.

### Ölçülen pencere: kapanış bloğu bir yığın değil, üç ayrı yükseklik

`kutu.mjs` ile ölçüldü (tahmin değil): `kapanis-rakam` **y%45,3-72,0** · `kapanis-isaret`
**%76,8-81,2** · `kapanis-cagri` **%83,0-86,8**. Sınırın kart 3'te geçebileceği tek temiz
aralık **%72-77** — rakamın dibiyle işaretin tepesi arası.

Yeni sınır **88 → 74**: kart 1'de %85,7, kart 2'de %79, kart 3'te %75,7.

| | önce | sonra |
|---|---|---|
| `alinti` ölü bant | %26 · %19 · %10 | **%21 · %18 · %10** |
| kapsam | %56 | **%58** |
| destenin en uzunu | %26 | **%22** |

⚠ 78→62 hâlâ imkânsız ve sebebi geometrik: kart 3'te rakam %45-72 arasını kaplıyor,
sınır 64'te onu **ortadan keser**. Tek renk iki alanda birden okunamayacağı için çözüm
**knockout maskesi** — sınırın iki yakasında rakamın iki ayrı renkte çizilmesi.
Sıradaki iş, ve `alinti`nin kalan %21'i o iş yapılana kadar açık borç.

### Kapının kendi deliği: yalnız KESİLENİ denetliyordu

Blok değişkenini yazdığımda kapı **yeşil** kaldı ve gerileme çizimde göründü: dev rakam
açık alanda açık. Sebep — kapı yalnız sınırın **kestiği** ögeleri ölçüyordu; kesmediği
ögeyi hiç sormuyordu. **Bir kapının görmediği yer, bir sonraki kusurun saklandığı yerdir.**
Kapı genişledi: her öge artık **üstünde durduğu** alana karşı ölçülüyor; kesilen öge ikisine
karşı.

### Ve alet DÖRDÜNCÜ kez yalan söyledi — `oklab`

Genişletilmiş kapı üç "kusur" daha bildirdi: `kapanis-rakam-alt` ve `panel-baslik`.
Hepsi SAHTEydi. Tarayıcı sessiz etiketleri `oklab(0.95 ... / 0.62)` diye veriyor; parser
yalnız `oklch` biliyordu ve sayısal yedeğe düşüp **0,95'i RGB sanıyordu**.

⚠ Ayrıca **alfa görmezden gelinemez**: %62 opak bir etiket zemine karışıyor ve algılanan
fark tam olarak alfa katsayısı kadar küçülüyor (bileşke L = a·metin + (1−a)·alan, yani
|bileşke − alan| = a·|metin − alan|). Kural sessiz etiketi susturmuyor, **ölçüyor**.

Kasten ihlal: `RAKAM_Y` 58'den 90'a alındı (rakam da imzanın alanını sorar oldu), kapı
ΔL 0,035 ve 0,022 ile kırmızı döndü. **Ölü bant tavanı %27 → %23.**

---

## KNOCKOUT MASKESİ — sınırın kestiği yazı iki yakada iki renk (FAZ-19)

Faz dosyasının *"prova ölçümünü render'a taşıyan maske adımı"* borcu kapandı.

### Sebep geometrik, zevk değil

`alinti`nin kapanış karesinde varış rakamı y%45-72 arasını kaplıyor. Sınır 64'ten geçince
rakamı **ortadan** kesiyor ve tek bir renk iki alanda birden okunamıyor — ölçüldü, iki
denemede de: **ΔL 0,000** ve **0,035**. Sınır bu yüzden yalnız %72-77 penceresinden
geçebiliyordu.

### Kutunun yeri SABİT YAZILMIYOR, tarayıcıya ÖLÇTÜRÜLÜYOR

Bu oturumda sabit yazılmış her ölçü er geç kaydı ve sessizce yanlış oldu (punto 458 →
kesildi; metin dibi %26 → gerçekte %51; alan y'si). `knockoutOlcumu` sınırı **gerçek
kutunun kenarlarında** okuyup degradenin açısını ve sert durağını oradan hesaplıyor.
Üretimde `puntoOlcumu`dan **SONRA** koşuyor — punto metni büyütüp küçültüyor; önce koşan
bir maske kaymış bir kutuyu ölçerdi.

⚠ Degrade bir SÜS değil: `background-clip: text` ile yazının kendi mürekkebi oluyor ve
sert duraklı olduğu için geçiş değil **kesin bir sınır** çiziyor. D-318 süs degradesini
yasakladı; bu optik bir maskeleme aygıtı.

### Kazanç

| | maskesiz | maskeli |
|---|---|---|
| `alinti` sınırı | 88 → 74 | **78 → 62** |
| ölü bant | %21 · %18 · %10 | **%11 · %7 · %10** |
| kapsam | %58 | **%66** |

### Kapı knockout'u TANIMIYORDU ve alet iki kez daha yalan söyledi

**5.** Maskelenmiş yazının mürekkebi `color` değil degrade; `color` `transparent` oluyor ve
kapı onu *"görünmüyor"* sanıp **üç sahte kusur** bildirdi. Kapı öğrendi: maskeli ögede
degradenin iki rengi ayrı ayrı, **kendi yakasındaki** alana karşı ölçülüyor.

**6.** Tarayıcı her durağı İKİ KEZ yazıyor (`renk 0 301px` → `renk 0px, renk 301px`).
İlk iki örneği almak **aynı rengi** iki alana karşı ölçüyordu → yine ΔL 0,000. İlk ve
**son** alınıyor: degradenin iki ucu.

### Ve bir gerçek kusur daha çıktı

`kapanis-rakam-alt` rakamın rengini devralıyordu ama **kendi yüksekliğinde** (y%76,8-81,2)
duruyor, yani imzayla aynı yakada — koyu alanda koyu kalıyordu. Artık `--kapanis-metin`
alıyor.

### Tavan %23'te KALIYOR — ve bu dürüstlük

Maske `alinti`yi %21'den %11'e indirdi ama tavanı indirmiyor: en kötü artık `akan-alan` k2
ve `donen` k4, **ikisi de %22,01**. Tavan 22 denendi ve **0,014 puanla** kırmızı döndü;
öyle bir kapı hiçbir şey söylemez.

Kasten ihlal: `knockoutOlcumu`nun kesişme dalı ters çevrildi, kapı ΔL 0,000 ile kırmızı döndü.

---

## METİN KUTUSU MASKESİ — beşinci iş (FAZ-19)

Kodun kendi notu iki yerde *"beşinci iş bitince"* diyordu. Beşinci iş buydu.

### Reçetenin iki isteği bu adımda bekliyordu

| istek | eski engel | ölçüm |
|---|---|---|
| eğri çizgisi 2 → **6 px** | `sus-metni-kesiyor` | kalın çizgi kilometre etiketinin **%96,6**'sının arkasından geçiyordu |
| eğri dolgusu **yüzey adımı** | aynı kapı | `ustBaslik` kutusunun **%99,3**'ü kapanıyordu |

Maske kurulunca **6 px geçti** ve `sus-metni` yeşil. Çizgi artık kadrajda gerçek bir
kütle: panoramayı kat eden, metnin arkasından geçerken **delinen** bir hat.

### YALNIZ KONTUR DELİNİYOR, DOLGU DEĞİL

Dolgulu bir alanı metin kutusundan delmek, zeminin renginde bir **dikdörtgen** bırakır —
kesilen çizgiden beter. Çizgi kaybolduğunda arkasındaki alan devam ediyor: delik
görünmüyor, çizgi görünmüyor.

⚠ Kutular tarayıcıya ölçtürülüp SVG'nin kendi kullanıcı uzayına **ters CTM** ile
çevriliyor. `viewBox` 100×100 ve `preserveAspectRatio: none` olan bantta ekran pikselini
doğrudan yazmak maskeyi yanlış yere koyardı.

### DENETİM ÜRETİMİN ÇİZDİĞİNİ GÖRMÜYORDU

`panoramaDenetle` yalnız `puntoOlcumu` koşuyordu; `panoramaCiz` ise ondan sonra knockout
ve metin maskesini de koşuyor. **Yayınlanmayan bir düzeni ölçen bir denetim**, bu fazda
kapılarda tam olarak ölçülmüş sınıf: hem gerçek kusuru kaçırıyor hem olmayanı uyduruyor.
Denetim artık üç adımı da koşuyor.

### Dolgu YİNE geri alındı — ama sebep ARTIK BAŞKA

Eski engel kapıydı ve **kalktı**; kapı yeşil geçti. Yeni engel okunabilirlik: dolgu
görünür olunca kart 6'nın `ÜÇ ÖNCELİK` listesi ve `2,0×` varış rakamı **açık alanın
üstünde açık** kaldı — `alinti`de ölçülen kusurun aynısı. Çözüm de aynı: knockout.
Ama `knockoutOlcumu` yalnız `alan-siniri` tanıyor; `egri` bandı için genişletilmesi
gerekiyor. **Sıradaki iş, ve borç yazılı.**

### `akan-alan` ve `donen`in kalan bantları KUSUR DEĞİL

- **`akan-alan` k2/k5 %22**: bant, metnin altındaki mavi ALANIN kendisi. Alet rengi
  (haklı olarak) zemin sayıyor, ama *"boş = kusur"* önermesi bir renk alanı için geçmiyor.
  Aynı dersin tersi: doku içerik değildir, **alan da ölü değildir**.
- **`donen` k4 %22**: gövde y%29'da bitiyor, `360°` y%51'de başlıyor. Rakamın puntosu
  dört haneli olduğu için kolondan 363 px'e düşüyor (`alinti`de 458) ve arta kalan hava
  bant olarak okunuyor. Kapanış kartında iddia ile varış arasındaki hava kasıtlı.

**Tavan %23'te kalıyor** ve sebebi artık yazılı: kalan iki bant içerik boşluğu değil.

---

## `veri-hikayesi` eğrisi GÖRÜNÜR oldu — dolgu iki turda iki ayrı engeli aştı

Eğrinin altındaki alan `ink-950` @0,75 ile çiziliyordu: kart zemininden ayrımı **ΔL 0,025**.
Taşıyıcı teknik olarak vardı, algısal olarak yoktu. İki kez denenip iki kez geri alınmıştı:

| deneme | engel | ne oldu |
|---|---|---|
| birinci | `sus-metni-kesiyor` | metin kutusu maskesi kurulunca **kalktı** |
| ikinci | okunabilirlik | knockout `egri`yi tanımıyordu → bu turda kapı kapsamı genişledi |

Dolgu artık `yuzeyAdimi(26)` ve **tek yerden** (`EGRI_DOLGUSU`) geliyor: iki kopya, bir gün
birinin unutulması demek.

### Gözüm yanıldı, ÖLÇÜM düzeltti

Çizime bakınca kart 6'nın dibi *"yutulmuş"* göründü ve geri almaya hazırlanıyordum.
Ölçüm başka söyledi:

| | L |
|---|---|
| eğri dolgusu | **0,3506** |
| kart zemini | 0,14 |
| kart 6'nın bütün yazıları | **0,95** |

En kötü ΔL **0,60** — rahat okunuyor, ve hiçbir öge maskeye ihtiyaç duymuyor.
*"Yutuldu"* yargısı knockout genişlemeden ÖNCEKİ hâle aitti.

### Aletin YEDİNCİ yalanı — ve bu kez sebebi KENDİ aygıtım

Kapı `egri`ye açılınca her yazıyı *"ΔL 0,05 ile okunmuyor"* diye suçladı. Sebep:
**`metinMaskesi` SVG'nin içine beyaz/siyah `<mask>` dikdörtgenleri koyuyor** ve kapı onları
"iki alan" sanıyordu. `<defs>` içindekiler çizilmez — artık eleniyor.

### Eşik 0,30 → 0,18: yeni bir POPÜLASYON göründü

0,30 `alinti` vakasına göre seçilmişti (en yakın gerçek geçiş 0,590). `egri` kapsama
girince **kasten sessiz** etiketler göründü: `panel-baslik` %50 opak, etkin farkı tam
**0,300** — eşiğin altında kalıyor, yani kural sessiz olmayı kusur sayıyordu. Ölçülen
gerçek kusurların hepsi **≤0,035**; 0,18 onların beş katı uzağında.

### Knockout'un `egri` uzantısı YAZILDI ve GERİ ÇIKARILDI

Uzantı hiçbir yerde **ateşlenmiyor**: eğri dipteki bantta yaşıyor, metin onun üstünde
duruyor, hiçbir yazı eğriyi kesmiyor. Kapatılıp kapı koşuldu ve **yeşil kaldı** — yani
ölmeye yazılmış kod olurdu. Bu depoda on bir kez tekrarlanan sınıf (D-182 · D-190 · D-224
· D-250 · D-261 · D-270 · D-347 · `kapanis`). **Kapı kapsamı `egri`yi zaten içeriyor:**
bir gün bir yazı eğriyi keserse kapı onu adıyla söyler, o zaman o satır geri gelir.

⚠ Ve knockout seçicisi daraltıldı: kapsayıcıları (`.cubuk-satir`, `.sayi-kart`,
`.liste-satir`) maskelemek yanlış — bir çubuk satırı renkli çubuklar taşıyor ve
`background-clip: text` onları kesmiyor. Maske yazının mürekkebini değiştiren bir aygıt,
kutu boyayan değil.

⚠ R-98 **sekizinci** kez ısırdı, yine şablon değişmezi içindeki bir yorumda.

---

## AİLE MERCEĞİ üretimin çizdiğini göstermiyordu (FAZ-19)

`just izgara` — on kapağı yan yana koyan, sahibin baktığı mercek — **hiçbir sayfa adımını
koşmuyordu**: punto oturmamış, knockout uygulanmamış, metin kutusu maskesi konmamış bir
düzeni gösteriyordu. Aynı sınıf hata bu fazda **kapılarda**, **denetimde** ve şimdi
**mercekte** ölçüldü; üçü de kapandı. *Bakılan şey yayınlanan şey olmak zorunda.*

### Mercek iki kusur buldu; ikisi de gerçekti

**1. `dizin` — hayalet kelime güzergâhla çakışıyor (%65).** Ölçüldü: hayalet x%3-81 /
y%68-82, yayık liste x%30-89 / y%55-87. `yayik` öncesinde liste kompakttı (y%38-50) ve
çakışma yoktu; güzergâh kadrajın boyuna dağılınca hayaletin yeri kalmadı.

**Bir kartta tek aygıt** — `yayik` ile `kapanis`in çakışmasıyla aynı ders. Kapağın alt
yarısını artık güzergâh tutuyor ve o, şablonun kimliği. Hayalet kaldırıldı.

**2. `memphis` — kesik özne zemine karışıyor: p90 luma farkı 119, eşik 120.**
Bir puan. Şablon zaten beş görsel işlemini de taşıyor (`matlama` · `keskinlik` ·
`tema-uyum` · `duotone` · `temas-golgesi`), yani kaldıraç orada değil: kalan fark
**üretilen fotoğrafın kendi açıklığı** ve her koşuda değişiyor. Açık borç.

### On kapak yan yana: aile okunuyor

Zeminler ayrışıyor (mürekkep · gece mavisi · kâğıt · beton · çelik), paletler ayrışıyor
(magenta · mavi · amber · kiremit · bakır), tipografi ve künye ortak. On ayrı tasarım,
tek hesap.

---

## IŞIK KAYNAĞI — zincirin ON ÜÇÜNCÜ kopukluğu (FAZ-19.4)

19.4'ün açık kalemi *"ışık kaynağı"*ydı. Sebep arandığında bulunan şey yine aynı sınıftı:

**`tip: 'isik'` katmanı `zemin.ts`te TANIMLI, TESTLİ ve hiçbir şablon onu istemiyordu.**
Ölçüldü: on şablonun **sıfırı** `zeminDokusu` taşıyor. Yani ışık odağı, leke ve tarama —
üçü de yazılı, üretim yolunda çağıranı yok.

Sebep kayıtlı ve mimari: **kart kendi zeminini opak boyuyor**, panorama dokusu altında
kalıyor. Grenin `.ust-gren`e taşınmasının sebebi de tam olarak buydu. Işık da aynı yere
gitti: `.ust-isik`, kartların üstünde, vinyetten önce — *biri odağı açar, öteki kenarı
kapatır.*

### Yön GÖLGEYLE anlaşmak zorunda

Odak `at 22% 16%` — sol üst. `temas-golgesi` gölgeyi sağ-aşağı düşürüyor (dx 14 · dy 26),
yani ışık soldan üstten geliyor. İkisi ayrışırsa göz sahte olduğunu anlar, sebebini
söyleyemeden. Katmanın kendi notu da *"merkezi ortada olan bir odak fark edilmiyor"* diyor.

### İlk sayılar TAHMİNDİ ve görünmezliğin sınırındaydı

| | α | koyu zeminde bileşke ΔL |
|---|---|---|
| ilk (tahmin) | 0,034 | **0,028** — bu fazda defalarca *"ayrışmıyor"* denen bant |
| ölçümden | **0,075** | **0,061** — görünürlük eşiği 0,06 |

Eğri dolgusu ΔL 0,025'te görünmüyordu; 0,028'lik bir odak da görünmezdi. Değer eşikten
geriye hesaplandı: α ≥ (0,06)/(0,95−0,14) = **0,074**. Koyu **7,5** · orta **4,5**.

### Açık zeminde odak YOK — ve bu bir KARAR

Beyazın üstüne beyaz hiçbir şey söylemiyor. Açık kartta ışığın işareti odak değil, ondan
**uzaklaşan gölgedir** — o da vinyetin işi (`vinyetGucu` açıkta 18, koyuda 34).
`memphis` · `editoryal` · `alinti` α 0 alıyor; unutulmuş bir sıfır değil, yazılı bir karar.

### Kapı çıplak rengi ADIYLA söyledi

İlk sürüm `rgba(255,255,255,…)` yazdı ve *"panoramada hiçbir sabit rgba(255,255,255)
kalmadı"* testi kırmızı döndü — **haklıydı**: sabit beyaz, zemini koyu olmayan bir markada
yanlış ışık verir. Odak artık `--pano-metin`den türüyor.

---

## YAYIN JPEG KALİTESİ dört yerde yazılıydı, hiçbir kapı tutmuyordu

`panorama.ts` · `disa-aktar.ts` (iki kez) · merdivenin kendi ayarı. Biri sessizce
düşürülse **gren ölçümü ötekiler için konuşmazdı** — ve gren bu fazın en pahalı
ölçümlerinden biri: düz blok medyan σ 2,26-3,85, **q=90 sonrası 1,62-3,61**.

Tek yer: `YAYIN_JPEG_KALITESI = 92`, ölçülen taban `YAYIN_JPEG_TABANI = 90`.
`yayin-bicimi.test.ts` bir SAYIYI değil bir İLİŞKİYİ sınıyor: yayın kalitesi grenin sağ
çıktığı tabanın altına inemez, ve hiçbir kaynak dosyada çıplak `quality:` yazılamaz.
Kasten ihlal: 84 yapıldı, kapı kırmızı döndü.

⚠ Yol boyunca ölçülen bir yan bulgu: `.ust-gren` · `.ust-isik` · `.ust-vinyet` üçü de
**panorama boyu** (4320×1440), yani optik etkiler slaytlara eşit düşmüyor — vinyetin koyu
kenarı yalnız ilk ve son slaytta beliriyor. Işık için bu doğru (tek sahne, tek güneş);
**vinyet için açık soru**, çünkü vinyet kameranın özelliğidir ve kamera her slaydı ayrı
kadrajlar.
