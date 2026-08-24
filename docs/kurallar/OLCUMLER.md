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
