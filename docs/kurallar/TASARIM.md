# TASARIM KURALLARI — R-83 … R-104

> Karosel render'ının kural kitabı. `KURALLAR.md`'nin bir PARÇASI: aynı numaralandırma,
> aynı sözleşme, aynı `citations` denetimi. Ayrı dosya olmasının sebebi D-336'da.
>
> **Ölçülmüş kanıt burada DEĞİL:** her kuralın sayısı nereden geldiği
> `docs/kurallar/OLCUMLER.md`'de. Burada beyan, tek cümlelik neden ve zorlama var.

---

### R-83 · punto-okuma-esigi-altina-inmez · GATE · aktif
Gövde metni **0,20° açısal x-yüksekliğinin** altına inemez — 1080 px'te **36 px**, hedef
40–48. Oran tabanı EZEMEZ; taban tuval genişliğine orantılı, sabit piksel değil.
**Neden:** ölçü nominal punto değil, harfin gözde kapladığı AÇIDIR (Legge & Bigelow 2011).
**Zorlama:** `punto-esik-alti`. → D-321 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-84 · gorsel-metnin-ustunde-durmaz · GATE · aktif
Metin gövdesi (`.baslik`, `.govde`) bir görselle **%12'den fazla** çakışamaz.
**Neden:** *"üstte olmak okunabilirlik değildir."* Eşik sıfır DEĞİL: poster
tipografisinde bir kolun harfe değmesi tasarımın kendisi.
**Zorlama:** `metin-gorsel-cakisiyor`. → D-319 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-85 · tanimsiz-token-cagrilmaz · GATE · aktif
Çağrılan her `var(--ramp-*)` / `var(--role-*)`, üretilmiş `tokens.css` dosyalarının
birleşiminde TANIMLI olmak zorundadır.
**Neden:** **CSS tanımsız bir `var()` için hata VERMEZ** — ögeyi sessizce şeffaf bırakır;
derleyici de göremez, çünkü çağrı bir DİZE içinde yaşıyor.
**Zorlama:** `token-cagrisi` kapısı (fast). → D-320 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-86 · olcu-bandi · GATE · aktif
Gövde satırı **45–75 karakter**. Alt sınır yalnız sütun onu kaldırabiliyorsa zorlanır.
**Neden:** alt sınır üst sınır kadar önemli ve eksik olan oydu — kısa satır gözü her
satırda geri döndürüp ritmi kırıyor (Butterick 45–90).
**Zorlama:** `olcu-bandi-disi`, `Range` ile GERÇEK kırılmalardan. → D-321 · ölçüm:
`docs/kurallar/OLCUMLER.md`

### R-87 · her-kesimde-tasiyici · GATE · aktif
Kesintisizlik iddia eden şablonda **HER kesim** en az bir taşıyıcı ögeyle aşılır.
**Neden:** süreklilik bir belge özelliği değil, **her geçişin** özelliği — okuyucu
kesimleri tek tek geçiyor.
**Zorlama:** `kesintisizlik-yok`, boş kesimlerin x'iyle. → D-319 · D-321 · ölçüm:
`docs/kurallar/OLCUMLER.md`

### R-88 · guvenli-alan-ve-metin-payi · GATE · aktif
İçerik ögesi güvenli alanın dışına çıkamaz (üst/alt **80 px**, yan **60 px**) ve metin
kadrajın **%30**'unu geçemez — **kapakta %42**, çünkü kapak başlığı KAHRAMAN olmak
zorunda. Panel metin DEĞİL veridir; ray ve sayaç KROM — ikisi de paya girmiyor.
**Neden:** iki kural aynı kartta çelişiyor ve tek eşik ikisinden birini yalanlardı.
**Zorlama:** `guvenli-alan-disi` · `metin-payi-yuksek`. → D-321 · ölçüm:
`docs/kurallar/OLCUMLER.md`

### R-89 · kelime-butcesi · GATE · aktif
Başlık en fazla **8 kelime**, bir slaytta başlık + gövde + üst başlık toplamı en fazla
**28 kelime**. Sınır hem isteme yazılır hem uyarlamada zorlanır; ret RENDER'dan ÖNCE.
**Neden:** *"5–8 kelimelik kanca"* pazarlama sezgisi DEĞİL, geometri. ÜST sınır zorlanır,
ALT sınır zorlanmaz.
**Zorlama:** `uyarla` → `BASLIK_KELIME_TAVANI` · `SLAYT_KELIME_TAVANI`. → D-321 · ölçüm:
`docs/kurallar/OLCUMLER.md`

### R-90 · yayin-sozlesmesi · GATE · aktif
Karosel en fazla **10 slayt** taşır ve yayınlanan her dosya **JPEG** olur. İkisi de
yükleme yolunun ÖNÜNDE, token'dan da önce denetlenir.
**Neden:** Graph API ikisini de açıkça sınırlıyor; hattımız PNG üretiyordu ve her slayt
yayın anında reddedilecekti. Biçim çağıranın verdiği YOLDAN türüyor.
**Zorlama:** `publish` → `too_many_assets` · `unsupported_format`; `renderPanorama`
biçimi uzantıdan okuyor. → D-321 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-91 · tuval-tek-kaynaktan · GATE · aktif
Karosel tuvalinin ölçüsü **tek sözleşme sabitinden** gelir (`VARSAYILAN_TUVAL`); hiçbir
dosya `1350` yazmaz. Oran bir PARAMETRE: 4:5 ve 3:4 aynı hattan üretilebilmeli.
**Neden:** Meta'da **ilk slaydın oranı tüm karoseli belirliyor** — kopyalardan biri
unutulursa kalan slaytlar KIRPILIR.
**Zorlama:** `tuval.test.ts` — oran adı ile sayının ayrışamayacağını da ölçüyor. → D-321 ·
ölçüm: `docs/kurallar/OLCUMLER.md`

### R-92 · uretim-yolu-imza-tasir · GATE · aktif
Üretilen her karosel marka işaretini TAŞIR; `logoVarliklari` üretim betiğinden çağrılır
ve sonucu `COMPOSE`a geçer. Eksik logo koşuyu durdurmaz ama uyarı basar.
**Neden:** **zincir kopukluğunun yedincisi** — modül var, test yeşil, üretim yolu yok
(D-182 · D-190 · D-224 · D-250 · D-261 · D-270 ailesi).
**Zorlama:** `marka-imzasi.test.ts` — modülü DEĞİL çağrıyı sınıyor. → D-321 · ölçüm:
`docs/kurallar/OLCUMLER.md`

### R-93 · sahne-kaymaz · GATE · aktif
Sahne gövdenin **(0,0)**'ında başlar; hiçbir tanım ögesi akışta duramaz. Tolerans yok.
**Neden:** sıfır boyutlu bir inline öge bile satır kutusu doğurur ve sahneyi 21 px
kaydırıyordu. **Kadraj kartın kutusu değil, EKRANIN kutusudur.**
**Zorlama:** `sahne-kaymis` + `FILTRE_TANIM_CSS` tek sabit (iki render yolu da basıyor);
`kadraj.test.ts`. → D-323 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-94 · dikis-dislama-bandi · GATE · aktif
Bir görsel kesime ya **≥93 px uzaktır** ya da onu **ezer**: kesimin iki yakasında da
slayt genişliğinin ≥%40'ını kaplar. Arada kalan yok. Ölçü BOYANAN alandan.
**Neden:** 93, tek fiksasyonun net bölgesinin yarısı (`arastirma-2026-08` böl. 1.3).
*"Biraz taşsın" en kötü seçenek* — ne devamlılık kuruyor ne bütünlük.
**Zorlama:** `dikis-bandinda`; `DIKIS_BANDI`/`EZICI_PAY` tek sabit. → D-324 · ölçüm:
`docs/kurallar/OLCUMLER.md`

### R-95 · krom-okunur · GATE · aktif
Ray metni — logo, marka, dönem, sayaç — arkasındaki hiçbir şeye karışmaz. Kural "görsel
raya girmesin" demiyor; perdesiz girmesin diyor.
**Neden:** perde vardı, **parametresi yanlıştı** ve `01 / 04` okunmuyordu. Medyan burada
YANLIŞ istatistik; ölçü iki render farkı.
**Zorlama:** `krom-okunmuyor`. → D-324 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-96 · ozne-zeminden-ayrisir · GATE · aktif
Kesik öznenin silüeti kart zemininden **p90 ≥ 120 luma** ayrışır. Tema uyumu, öznenin
üstünde durduğu kartın KUTBUNA göre seçilir — belge başına değil, görsel başına.
**Neden:** görseller kartların dışında ayrı bir katmanda yaşıyor ve hiçbir kartın rengini
miras almıyor; beyaz çizgili bir özne beyaz zeminde yalnız gölgesinden seçiliyordu.
Kusur şablonda değil, **varlığın kutupluluğunda** — hat onu garanti edemez.
**Zorlama:** `gorsel-zemine-karismasin`; `ZEMINDEN_AYRISMA` tek sabit; `ACIK_TEMA_KIMLIGI`
açık kartta tepe ucu bastırıyor. → D-326 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-97 · krom-seridi-ayrilmistir · GATE · aktif
Hiçbir görselin boyası ray bandına giremez. Bant ÖLÇÜLÜR (`.ray` kutusu), sabitten
türetilmez.
**Neden:** R-95 *"tam kadraj fotoğrafın üstünde künye meşrudur"* demişti ve ölçülmemişti;
ölçüm aksini söyledi — zeminin **%8'i** medyandan 60 luma sapıyordu. Ray fine print
taşıyor, masthead değil. ⚠ Yan kazanç AİLE: altı şablonda ortak bir zemin çizgisi.
**Zorlama:** `krom-seridine-giriyor`; ayrıca `krom-okunmuyor` artık zemin GÜRÜLTÜSÜNÜ de
ölçüyor. → D-327 · ölçüm: `docs/kurallar/OLCUMLER.md`

### R-98 · olcum-govdesinde-ters-tirnak-yok · GATE · aktif
Tarayıcıda koşan ölçüm gövdelerinde (`OLCUM`, `METIN_KUTULARI`, `puntoOlcumu`) ÇIPLAK
ters tırnak olamaz; kaçırılmış olan meşrudur.
**Neden:** gövdeler şablon dizesi; yorumdaki bir kod alıntısı diziyi ORADA bitiriyor ve
hata ölçümle ilgisiz bir yerde patlıyor. **Dört kez aynı şekilde kırıldı.**
**Zorlama:** `olcum-ters-tirnak`. → D-328

### R-99 · olcek-tek-tabandan · GATE · aktif
1080'de ölçülmüş her sayı tuvale `G / 1080` ile çevrilir; çıplak piksel yok.
**Neden:** başlık, gövde ve panel ölçekleniyordu ama KROM ölçeklenmiyordu; 1080'de doğru
görünen oran 1350'de bozuluyordu — **tek tuvalde her sayı doğru GÖRÜNÜR.**
**Zorlama:** `olcek-tabani.test.ts` İKİ tuvalin oranını ölçüyor. → D-329 · `OLCUMLER.md`

### R-100 · taban-cizgisi-izgarasi · GATE · aktif
Blok arası dikey boşluklar **ölçülen** gövde satır aralığının (`--taban`) tam katıdır.
İstisna: üst başlık ↔ başlık — ikisi tek birim, aradaki boşluk bir etiket bağlantısı.
**Neden:** taban sabit bir sayı DEĞİL; gövde puntosu başlığa, başlık ikili aramaya bağlı.
Sabit 54 px altı şablonun **beşinde** yanlış olurdu (gerçek: 54 · 54,9 · 59,1 · 60,6 ·
61,2). Ritim metinden türer.
**Zorlama:** `taban-ritmi.test.ts` — CSS tabanı çağırıyor mu VE `--taban` kuruluyor mu.
Kurulmazsa yedek sessizce devralır. → D-330 · `OLCUMLER.md`

### R-101 · marka-varliklari-devralinir · GATE · aktif
Font ve logo da token gibi `brand/<id>/parent` zincirinden devralınır; dosya adları
MARKA-NÖTR (`isaret-koyu` / `isaret-acik`). Kısmi devralma yok — bir marka eziyorsa
hepsini ezer.
**Neden:** token sistemi *"ezmediğin şey MİRASTIR"* diyordu ama font ve logo o cümlenin
dışındaydı: `brd_dima` sekiz font bulamayıp `exit(1)` ediyordu. Ve `logo.ts` marka-nötr
bir modülken `upcytech-mavi.png` yazıyordu — ikinci marka kendi işaretini KOYAMAZDI.
⚠ Zincir "dizin var mı" değil "sonuç TAM mı" diye soruyor: boş bir `fonts/` klasörü
zinciri kesip koşuyu yine fontsuz bırakırdı.
**Zorlama:** `marka-varlik.test.ts` — modülü DEĞİL `uret.mjs`in ÇAĞRISINI sınıyor.
→ D-332 · `OLCUMLER.md`

### R-102 · token-yuzeye-gore-cozulur · GATE · aktif
Bir `--role-*` çağrısı, dosyanın ÇİZİLDİĞİ yüzeyde tanımlı olmak zorunda. Başka bir
yüzeyde tanımlı olması KURTARMAZ. Yüzeye eşlenmemiş dosya sayısı raporlanır.
**Neden:** kapı birleşime bakıyordu ve iki canlı kusuru kaçırdı — `state-danger` yalnız
`kreatif`te, `accent` yalnız `kreatif`te tanımlıyken kabuk `console`da koşuyor. Panelde
uyarı metni gövdeyle aynı renkteydi, aktif sekmenin çerçevesi renksizdi.
⚠ Ders `koyuMu()`nunkiyle aynı: **doğru dosyayı okumak, doğru YERİ okumak değildir.**
**Zorlama:** `token-cagrisi` kapısı, yüzey başına blok. → D-333 · `OLCUMLER.md`

### R-103 · yasak-terim-listesi-obeklerden · GATE · aktif
Yayınlanamayan pazarlama dili **öbeklerden** kurulur, çıplak sıfattan değil. Ölçüt
"abartılı" değil **yanlışlanamaz**. Liste TEK yerde; kayıt onu kopyalamaz, ADIYLA anar.
**Neden:** altı terim sistemin sözlüğünün üçte biriydi ve corpus'ta üç canlı ihlal
duruyordu — liste kısa olduğu için değil, YANLIŞ kısa olduğu için: en sık kullanılan boş
sıfatlar (`yenilikçi`, `öncü`, `akıllı`) hiç yoktu.
⚠ `çözüm` tek başına meşru (bir denklemin çözümü), `çözüm odaklı` değil. Çıplak sıfat
listesi doğru cümleleri de kırmızıya çevirip kapıyı okunmaz yapardı.
**Zorlama:** `lexicon` kapısı · `YASAK_TERIMLER`. → D-334 · `OLCUMLER.md`

### R-104 · kaynak-satiri-sessiz-kaybolmaz · GATE · aktif
Kaynak satırı boşsa slayt **görünür bir kutu** basar (`KAYNAK YOK`) ve denetim onu
raporlar. Sessizce boş `<span>` yok.
**Neden:** sistemin tek imzası kaynak satırıdır (§8). Boş `rayaOrta` hiçbir şey
çizmiyordu: slayt kusursuz GÖRÜNÜYOR, kaynağını kaybetmiş oluyor ve insan kapısı imzasız
bir çıktıyı imzalı sanıp onaylıyordu.
⚠ Yer tutucu görselle birebir aynı desen: eksik olan şey önce GÖRÜLMELİ, sonra
raporlanmalı. Ölçüm düzeltmenin kendisini arıyor — kutu varsa kaynak yoktur.
**Zorlama:** `kaynak-yok` kusuru · `KAYNAK_YOK_METNI`. → D-335 · `OLCUMLER.md`

### R-105 · metin-zemininden-ayrisir · GATE · aktif
İçerik metni (`ust-baslik` · `baslik` · `govde` · `etiketler`) kendi zemininden ayrışır:
zeminin en fazla **%4**'ü metin lumasına 44'ten yakın, en fazla **%12**'si medyandan 60
luma sapar.
**Neden:** krom için ölçülüyordu, içerik için ölçülmüyordu. `alinti` şablonunda etiket
paneli ALAN SINIRININ üstüne düştü — yarısı kâğıtta, yarısı mürekkepte — ve denetim
*"0 kusur"* dedi: `metin-ortuluyor` görselleri arıyor, `sus-metni-kesiyor` süsleri.
⚠ Ölçü kromunkiyle AYNI: metin metindir, krom olması onu farklı kılmaz.
**Zorlama:** `metin-zemine-karisiyor`; tek çift ekran görüntüsü, kutu başına değil.
→ D-337 · `OLCUMLER.md`

### R-107 · aile-olculebilir · GATE · aktif
On şablon tek ızgarada **bir aile** okunur ve bu ÖLÇÜLÜR: baskın ton hepsinde aynı
(±15°), krom (ray puntosu · üst kenar · öge sayısı) hepsinde birebir aynı, gövde okuma
eşiğinin üstünde. Ayrım yalnız YERLEŞİMDEN gelir.
**Neden:** *"bakılır"* tek başına bir kapı değil — göz onu her turda yeniden bakmadan
koruyamaz. Adımın kendi testi zaten ölçülebilirlik istiyordu: *"bir şablonun aksanını
değiştir → ızgarada hemen sırıtıyor."*
⚠ H1 puntosu KASTEN serbest (74–151 px ölçüldü): başlık kadraja oturuyor. Ortak olan
ölçek, piksel değil — sabitlemek uzun bir başlığı taşırır, kısa birini cüce bırakır.
**Zorlama:** `aile-tutarliligi.test.ts`; mercek `just izgara`. → D-339 · `OLCUMLER.md`
