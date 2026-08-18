// HEDEF: packages/render/src/katalog-ornek.ts
//
// Katalog örnekleri — şablon BOŞ İSKELET DEĞİL, DOLU TASLAK (FAZ-15.4 · D-268 · Yasa 13).
//
// ⚠ ⚠ **BU DOSYANIN VARLIK SEBEBİ ŞU CÜMLE:** *"şablonlar taslak derken boş demek değil,
// örnek içerik gibi dolu olacak; tipografisi, mimarisi, mantığı, seamless akışı ve en
// önemlisi kaynağı net olacak ki agent onu çoğaltıp düzenlesin — sıfırdan yapmayacak,
// olanı alıp düzenleyecek."* Katalog bugüne kadar yalnız TARİF ediyordu: "koyu zemin,
// eğri bant, kesik özne". Bir tarif kompozisyon kurmaz. Agent her koşuda yeniden icat
// ederdi ve **icat, kalitenin en oynak yeri.** Burada icat edilecek bir şey kalmıyor:
// düzen, oran, ritim, bant geometrisi ve panel biçimi HAZIR; değişen yalnız içerik.
//
// ⚠ ⚠ **DAMGA, TOKEN VE FONT KASTEN YOK — `KatalogOrnegi` onları TAŞIYAMIYOR.** Yasa 7:
// *"her varlık üretim anında marka + dönem damgası alır; sonradan retrofit imkânsız."*
// Bir şablon damga taşısaydı o damga şablonun yazıldığı ana ait olurdu ve her koşuda
// yanlış bir damgayı taşırdı. Alan yok, dolayısıyla yanlış damga temsil edilemiyor.
// Aynısı `tokenCss` ve `fontCss` için: onlar markadan gelir, şablondan değil.
//
// ⚠ ⚠ **SAYILAR "ÖRNEK VERİ" DİYE İŞARETLİ ve bu R-32'nin gereği, bir özür değil.**
// Kaynaksız sayısal iddia yayınlanamaz (Yasa 8). Örneğe gerçek bir kuruma atıf yazmak
// daha "gerçekçi" görünürdü ama **doğrulanmamış bir atıf, atıfsızlıktan kötüdür**: sahte
// bir güven üretir ve şablon çoğaltıldıkça o atıf da çoğalır. Her örnek kartın `rayaOrta`
// alanı `ÖRNEK VERİ` diyor; uyarlama adımı orayı gerçek kaynakla DEĞİŞTİRMEK zorunda.
//
// ⚠ Altı örnek altı AYRI tipografi reçetesi, yerleşim ve zemin dokusu taşıyor. Aynı
// reçeteyi paylaşan iki şablon, iki tasarım değil bir tasarımın iki boyasıdır — bu
// kataloğun düzeltmek üzere kurulduğu hatanın ta kendisi.

import type { PanoramaBelgesi } from './panorama.js'

/**
 * Bir katalog örneği — belgenin markaya ve koşuya bağlı olmayan kısmı.
 *
 * ⚠ `stamp`, `tokenCss` ve `fontCss` dışarıda: bkz. dosya başı. Koşu onları ekliyor.
 */
export type KatalogOrnegi = Omit<PanoramaBelgesi, 'stamp' | 'tokenCss' | 'fontCss'>

const ORNEK = 'ÖRNEK VERİ'

/**
 * **veri-hikayesi** — panoramayı kat eden veri eğrisi.
 *
 * ⚠ Eğri VERİDEN çiziliyor: altı nokta altı yıl. Süs olsaydı silinebilirdi; kilometre
 * taşları gerçek kartlara denk geldiği için silinemiyor. `x` panorama yüzdesi, yani
 * 2. slaydın kilometre taşı gerçekten 2. slaytta duruyor.
 * ⚠ Tipografi DAR (`wdth 70`) ve İRİ (`payi 0,95`): eklemeli Türkçe'de poster puntosunun
 * tek yolu daraltmak (D-269). Üst başlık GENİŞ (`112`) — zıtlık hiyerarşiyi keskinleştirir.
 */
export const ORNEK_VERI_HIKAYESI: KatalogOrnegi = {
  slaytGenisligi: 1080,
  yukseklik: 1350,
  // ⚠ `ayrik`: paneller DİBE, eğrinin üstüne oturuyor. Aradaki boşluk kusur değil,
  // eğrinin hikâyeyi anlattığı alan.
  yerlesim: 'ayrik',
  // ⚠ ⚠ **HAYALET BİR KATMAN, BİR FİLİGRAN DEĞİL (tasarım rehberi §3).** Varsayılan
  // (%7 opaklık, 1× ölçek) rakamı fark edilmez yapıyordu ve kart yüzeyinde HİÇBİR
  // katmanlanma kalmıyordu: her öge kendi kutusunda, hiçbiri diğerine girmiyor — yani
  // "web işi". Rakam büyütülüp metnin arkasından geçirildi ve kesim çizgisini aşıyor.
  // ⚠ %9'u geçmiyor: gövde metni onun üstünde ve okunaklılık kaybı kabul edilemez.
  hayaletKonumu: { ust: 26, olcek: 1.55, guc: 9 },
  tipografi: {
    baslikPayi: 0.95,
    baslikGenislik: 70,
    baslikAgirlik: 850,
    satirAraligi: 0.98,
    harfArasi: -0.025,
    ustGenislik: 112,
    govdeOrani: 0.27,
    baslikSutunu: 0.88,
    // ⚠ ⚠ **2,1 — VERİ ŞABLONUNDA VERİ %2'YDİ.** Ölçüldü: panel kadrajın %0,9–4,9'unu,
    // hayalet %22–26'sını tutuyordu. Bu şablonun ADI veri hikâyesi; en büyük ögesi
    // dekoratif bir rakam olamaz. Çarpan panelin TAMAMINI büyütüyor, tek tek ögeleri
    // değil: iç oranlar (rehber §3) korunuyor.
    panelPayi: 2.1,
  },
  zemin: 'var(--role-line-edge)',
  zeminDokusu: {
    taban: '--ramp-marka-ink-950',
    katmanlar: [
      {
        tip: 'dogrusal',
        aci: 104,
        duraklar: [
          { renk: '--ramp-marka-ink-950', konum: 0 },
          { renk: '--ramp-marka-ink-800', konum: 52 },
          { renk: '--ramp-marka-ink-950', konum: 100 },
        ],
      },
      { tip: 'isik', x: 12, y: 22, capX: 46, capY: 74, renk: '--ramp-marka-amber-500', guc: 16 },
      { tip: 'isik', x: 86, y: 78, capX: 40, capY: 58, renk: '--ramp-marka-amber-600', guc: 12 },
      { tip: 'vinyet', guc: 30 },
    ],
  },
  bant: {
    tip: 'egri',
    noktalar: [
      { x: 0, y: 78 },
      { x: 18, y: 74 },
      { x: 36, y: 66 },
      { x: 54, y: 57 },
      { x: 72, y: 44 },
      { x: 88, y: 34 },
      { x: 100, y: 29 },
    ],
    kilometre: [
      { x: 18, etiket: '2020' },
      { x: 54, etiket: '2023' },
      { x: 88, etiket: '2025' },
    ],
  },
  // ⚠ ⚠ **DAİRELER KESİME DEĞİYORDU, GEÇMİYORDU (16..25, 41..50, 66..75).** Karoselin
  // tek yapısal iddiası süreklilik; kesime teğet geçen bir öge onu KURMUYOR, taklit
  // ediyor. x 4 birim kaydırıldı: ilk üç daire artık 25/50/75 kesimlerini gerçekten
  // aşıyor. Dördüncü slaydın sağında kesim yok, o yerinde kaldı.
  gorseller: [],
  kartlar: [
    {
      // ⚠ ⚠ **EL YAZISI BAŞLIĞI TEKRAR ETMEZ, ONA GİRİŞ YAPAR.** İlk deneme başlığın ilk
      // kelimesini kopyalıyordu ("Altı yılda" / "Altı yılda iki katına…") ve render'a
      // bakınca ikisi tek bir cümlenin iki kez yazılması gibi okundu. Referansta iki satır
      // AYRI şey söylüyor: el yazısı kim konuşuyor, ağır condensed ne söylüyor. Uyarlama
      // bu ayrımı örnekten öğreniyor.
      elYazisi: 'Rakamlarla',
      ustBaslik: 'AÇILIŞ',
      baslik: 'Altı yılda **iki katına** çıkan bir eğri',
      govde: 'Kaydırın: eğri altı slaydı kat ediyor ve her durakta bir karar var.',
      panel: { tip: 'etiketler', ogeler: ['2019', '2021', '2023', '2025'] },
      hayalet: '2×',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'BAŞLANGIÇ',
      baslik: 'Önce hacim değil, **ayrıştırma** sorunuydu',
      govde: 'Toplanan malzemenin üçte biri karışık geldiği için işlenemiyordu.',
      panel: {
        tip: 'cubuklar',
        baslik: 'GİRDİ KALİTESİ',
        satirlar: [
          { etiket: '2019', deger: 34, not: '%34 temiz akış', tahmin: false },
          { etiket: '2021', deger: 51, not: '%51 temiz akış', tahmin: false },
          { etiket: '2023', deger: 68, not: '%68 temiz akış', tahmin: false },
        ],
      },
      hayalet: '01',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'KIRILMA',
      baslik: 'Tek bir hat değişikliği eğriyi **büktü**',
      govde: 'Optik ayrıştırıcı devreye girdiği yıl kayıp oranı yarıya indi.',
      panel: {
        tip: 'sayilar',
        ogeler: [
          { deger: '48', birim: '%', alt: 'kayıp oranı, önce' },
          { deger: '23', birim: '%', alt: 'kayıp oranı, sonra' },
        ],
      },
      hayalet: '02',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'YAYILMA',
      baslik: 'Aynı yöntem **dört tesise** taşındı',
      govde: 'Kopyalanan şey makine değil, besleme sırasıydı.',
      panel: {
        tip: 'vafel',
        baslik: 'DÖNÜŞÜM TAMAMLANAN HAT',
        toplam: 20,
        dolu: 13,
      },
      hayalet: '03',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'BUGÜN',
      baslik: 'Eğrinin ucu artık **tahmin**, ölçüm değil',
      govde: 'Son iki nokta projeksiyon; kesikli çerçeve onu söylüyor.',
      panel: {
        tip: 'cubuklar',
        baslik: 'YILLIK HACİM',
        satirlar: [
          { etiket: '2023', deger: 58, not: '58,9 bin ton', tahmin: false },
          { etiket: '2024', deger: 71, not: '71,2 bin ton', tahmin: false },
          { etiket: '2025', deger: 77, not: '77,4 bin ton', tahmin: true },
        ],
      },
      hayalet: '04',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SONRAKİ',
      baslik: 'Sıradaki eşik **kalite**, hacim değil',
      govde: 'Aynı eğri devam ederse sınırı belirleyen şey pazar değil, saflık olacak.',
      panel: {
        tip: 'liste',
        baslik: 'ÜÇ ÖNCELİK',
        ogeler: [
          // ⚠ Satır metinleri ikon köklerine DOĞAL olarak oturuyor (`denet`, `ölç`,
          // `üretim`): ikon içerikten türüyor, içerik ikona göre eğilip bükülmüyor.
          // Bir satır bile eşleşmezse ikon katmanı hiç açılmıyor (ya hepsi ya hiçbiri).
          { no: '01', ad: 'Girdi saflığını her partide denetle' },
          { no: '02', ad: 'Numuneyi hatta ölç, sonra kabul et' },
          { no: '03', ad: 'Alıcıyı üretimden önce bağla' },
        ],
      },
      hayalet: '05',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
  ],
}

/**
 * **akan-alan** — iki renk alanı, panoramayı kat eden eğri sınır, dev hayalet rakam.
 *
 * ⚠ Sınır YATAY ve tek bir yol; slayt başına çizilseydi kesimde kırılırdı (panorama.ts).
 * ⚠ Kartlar üst alanda duruyor, hayalet rakamlar sınırı aşıyor: kesintisizliğin ikinci
 * kanalı. Tipografi GENİŞ (`wdth 104`) — `veri-hikayesi`nin dar sesinin karşıtı.
 */
export const ORNEK_AKAN_ALAN: KatalogOrnegi = {
  slaytGenisligi: 1080,
  yukseklik: 1350,
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 0.9,
    baslikGenislik: 104,
    baslikAgirlik: 800,
    satirAraligi: 1.06,
    harfArasi: -0.015,
    ustGenislik: 74,
    govdeOrani: 0.3,
    baslikSutunu: 0.82,
  },
  zemin: 'var(--role-bg)',
  // ⚠ Hayalet ALT alanda: sınır ~%60'ta, rakam %52'den başlayıp mürekkep alana taşıyor.
  // İlk sürümde üst alanda kalıyordu ve tuvalin alt %40'ı bomboş siyahtı.
  hayaletKonumu: {
    ust: 48, // ⚠ ⚠ **1,62 → 1,34: bu şablonun ne paneli var ne görseli.** İçerik yalnız başlık ve
    // gövde; hayalet 1,62'de kartın %19'unu tutup içeriğin (%15) önüne geçiyordu ve
    // `sus-baskin` bunu ölçtü. Ötekilerde hayalet aynı boyutta kalabiliyor çünkü orada
    // fotoğraf ya da panel ağırlığı dengeliyor — **aynı ölçek her şablonda aynı anlama
    // gelmiyor.**
    olcek: 1.34,
    guc: 16,
  },
  alanSiniri: {
    ust: 'var(--role-bg)',
    alt: 'var(--role-line-edge)',
    // ⚠ ⚠ **GENLİK %9'DAN %58'E — referansla farkın kaynağı EKSEN DEĞİL, GENLİKTİ.**
    // `image.png`de amber alan slayttan slayta yer değiştiriyor: bir karede neredeyse
    // tamamı kaplıyor, ötekinde alt köşeye çekiliyor. Bizim sınır 57–66 arası
    // salınıyordu, yani her slaytta AYNI yükseklikte düz bir şerit — göz bir bölme
    // değil bir çizgi görüyordu.
    //
    // ⚠ Ekseni dikeye çevirmek denenmedi ve çevrilmeyecek: kayıtlı gerekçe duruyor
    // (`panorama.ts`) — slayt başına dikey sınır kesimde KIRILIR ve süreklilik ima
    // edilmekten öteye geçmez. Tek yol genliği büyütmek: aynı sürekli eğri, her karede
    // başka bir yükseklikte kesiyor ve slayt slayt bakınca DİKEY bir bölme gibi
    // okunuyor. Süreklilik korunuyor, referansın etkisi geliyor.
    // ⚠ ⚠ **TEPE NOKTALARI METNİN ALTINDA KALMAK ZORUNDA — ilk deneme %26'ya çıktı ve
    // BAŞLIĞI KESTİ.** Metin bloğu (üst başlık + başlık + gövde) tuvalin ilk %32'sini
    // kaplıyor; dalga oraya girince "Ölçülmeyen kalite" başlığının yarısı mürekkep
    // alanda kaldı. Genlik hâlâ büyük (%42 salınım) ama tavan %44'te: referansın etkisi
    // duruyor, okunabilirlik kaybı yok.
    noktalar: [
      { x: 0, y: 86 },
      { x: 18, y: 46 },
      { x: 36, y: 80 },
      { x: 54, y: 44 },
      { x: 72, y: 78 },
      { x: 88, y: 45 },
      { x: 100, y: 72 },
    ],
  },
  bant: { tip: 'yok' },
  gorseller: [],
  kartlar: [
    {
      elYazisi: 'Adım adım',
      ustBaslik: 'BEŞ ŞART',
      baslik: 'Bir hattı **döngüsel** yapan beş şart',
      govde: 'Beşi de olmadan döngü kapanmıyor; biri eksikse sistem doğrusal kalıyor.',
      panel: null,
      hayalet: '5',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ŞART 01',
      baslik: 'Girdi **izlenebilir** olacak',
      govde: 'Nereden geldiği bilinmeyen malzeme, nereye gittiği bilinmeyen atıktır.',
      panel: null,
      hayalet: '1',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ŞART 02',
      baslik: 'Ayrıştırma **kaynakta** başlayacak',
      govde: 'Sonradan ayrıştırma her adımda pahalılaşıyor ve saflığı düşürüyor.',
      panel: null,
      hayalet: '2',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ŞART 03',
      baslik: '**Ölçülmeyen** kalite, varsayılan kalitedir',
      govde: 'Ölçülmeyen saflık, satışta değil üretimde ortaya çıkıyor.',
      panel: null,
      hayalet: '3',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ŞART 04',
      baslik: 'Çıktının bir **alıcısı** olacak',
      govde: 'Alıcısı olmayan geri kazanım, ertelenmiş bir depolama.',
      panel: null,
      hayalet: '4',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ŞART 05',
      baslik: 'Döngü **kendini finanse** edecek',
      govde: 'Sübvansiyonla dönen bir döngü, sübvansiyon bitince duruyor.',
      panel: null,
      hayalet: '5',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
  ],
}

/**
 * **sahne** — koyu zemin, kesik özne, kesimi aşan akış okları.
 *
 * ⚠ İKİ süreklilik kanalı: öznenin gövdesi kesimi aşıyor VE oklar kartlar ARASINDA
 * duruyor. Oklar metnin üstünden geçmiyor — nüfus karoselinde geçmişti ve okunmaz oldu.
 * ⚠ `src: ''` YER TUTUCU demek: koşu görseli üretip dolduruyor. Boş bırakmak değil,
 * eksikliği GÖRÜNÜR bırakmak (panorama.ts).
 */
export const ORNEK_SAHNE: KatalogOrnegi = {
  slaytGenisligi: 1080,
  yukseklik: 1350,
  // ⚠ ⚠ **METİN ÜSTTE, ÖZNE ALTTA — ikisi de altta olamaz.** İlk sürüm `yerlesim: 'alt'`
  // idi ve kesik özne kutuları başlıkların ÜSTÜNE bindi: "Sonra elle tutulur bir ölçü"
  // bir insan gövdesinin arkasından okunuyordu. Süreklilik ögesi kesimi aşmak ZORUNDA,
  // dolayısıyla bir sonraki kartın soluna girecek; çözüm onu kısaltmak değil, metni
  // dikeyde ondan uzaklaştırmak. Referansta (`ornek-1`) da özne alt yarıda duruyor.
  // ⚠ ⚠ **`ust` → `orta`: BANT DÜZENİNDEN YAN YANA KOMPOZİSYONA.** Ölçüldü — `ust` ile
  // dört slayttan üçünde alt yarı doluluğu %0,3–%1,2 idi, yani kadrajın yarısı boştu ve
  // çıktı bir web "hero" bölümü gibi okunuyordu. Referansta metin dikey ORTADA ve öznenin
  // YANINDA yaşıyor; boşluk üstte ve altta paylaşılıyor, tek bir dev boşluk hâlinde dibe
  // yığılmıyor. Çakışmayı `kolon` çözüyor: metin, figürün olmadığı yana geçiyor.
  yerlesim: 'orta',
  tipografi: {
    baslikPayi: 0.86,
    baslikGenislik: 66,
    baslikAgirlik: 900,
    satirAraligi: 0.96,
    harfArasi: -0.03,
    ustGenislik: 118,
    govdeOrani: 0.32,
    // ⚠ 0,66'da başlık üç satıra çıkıyor ve metin bloğu okların şeridine giriyordu.
    // Sütunu genişletmek satır sayısını ikiye indiriyor: oklara yer açan şey boşluk değil,
    // metnin daha az dikey yer kaplaması.
    // ⚠ 0,8 → 0,56: yan yana kompozisyonda metin kolonu figüre yer BIRAKMAK zorunda.
    // Genişken blok kadrajı boydan boya kesiyor ve "yan yana" iddiası çöküyor.
    baslikSutunu: 0.56,
  },
  zemin: 'var(--role-line-edge)',
  zeminDokusu: {
    taban: '--ramp-marka-ink-950',
    katmanlar: [
      {
        tip: 'dogrusal',
        aci: 90,
        duraklar: [
          { renk: '--ramp-marka-ink-800', konum: 0 },
          { renk: '--ramp-marka-ink-950', konum: 74 },
        ],
      },
      // ⚠ ⚠ **IŞIK ORTADAN KAÇIRILDI — merkezî havuz ŞERİT gibi okunuyordu.** `x: 50`
      // ile havuz panoramanın tam ortasına düşüyor ve 2.–3. slaytlar ötekilerden gözle
      // görülür biçimde açık kalıyor: göz bunu "ışık" değil "kutu" diye okuyor. Rehber
      // §5 zaten söylüyordu: merkezi ortada olan bir odak fark edilmiyor, asimetri
      // gerekiyor. ⚠ Düşüş de yumuşatıldı (`capX` 84 → 62): geniş ve sert kenarlı bir
      // havuz, dar ve yumuşak olandan daha çok "kutu" üretiyor.
      { tip: 'isik', x: 22, y: 16, capX: 62, capY: 52, renk: '--ramp-marka-mavi-500', guc: 15 },
      { tip: 'isik', x: 88, y: 74, capX: 46, capY: 44, renk: '--ramp-marka-amber-500', guc: 9 },
      { tip: 'vinyet', guc: 42 },
    ],
  },
  // ⚠ ⚠ **`matlama` LİSTEDE KALDI ama artık YEDEK.** Arka plan silme hatta bağlandı
  // (`gorsel-kirp`); silme koştuğunda `composeBody` `matlama`yı listeden ÇIKARIYOR —
  // şeffaf zeminli bir PNG'ye luma anahtarı uygulanınca öznenin koyu bölgeleri de
  // saydamlaşıyor ve figür delik deşik oluyor. Silme koşamazsa (sanal ortam yoksa)
  // eski yol devrede kalıyor: iki teknik ARDIŞIK, üst üste değil.
  // ⚠ `tema-uyum` + `temas-golgesi`: arka planı silmek "yapıştırılmış" hissini tek
  // başına bitirmiyor. Renk sıcaklığı zemine çekilmezse figür tasarımın ÜSTÜNDE durur;
  // gölge olmadan da havada durur.
  gorselIslemleri: ['matlama', 'keskinlik', 'tema-uyum', 'temas-golgesi'],
  // ⚠ ⚠ **BU ŞABLONUN KURALI: BAŞLIK İKİ SATIR, GÖVDE TEK SATIR.** Gövde iki satıra
  // çıkınca okların şeridine giriyor ve yay metnin üstünden geçiyor — render'a bakınca
  // görüldü. Örnek içerik kasten kısa: uyarlama adımı sınırı buradan öğreniyor. Oklar metin bloğu ile kesik
  // özne arasındaki dar şeritte duruyor; üç satırlık bir başlık o şeridi yutuyor ve ok
  // metnin üstünden geçiyor — nüfus karoselinde aynı şey olmuş ve oklar SİLİNMİŞTİ.
  // Örnek başlıklar kasten kısa: uyarlama adımı çoğaltacağı şeyin sınırını buradan görür.
  bant: {
    tip: 'ok',
    oklar: [
      // ⚠ Oklar metin bloğu ile kesik özne ARASINDAKİ şeritte: y 42–45. Daha yukarısı
      // gövde satırına giriyor (33'te girdi ve render'a bakınca görüldü), daha aşağısı
      // öznenin üstünden geçiyor. Şerit dar; şablonun kısa metin kuralı bu yüzden var.
      // ⚠ ⚠ **UZUN VE KIVRIMLI — kısa yay fırça değil MERCEK gibi görünüyor.** İlk
      // sürüm 8 panorama yüzdesi kadar bir yay çiziyordu ve 34 px'lik fırça o mesafede
      // incelmeye vakit bulamıyordu: çıktı bir badem şekliydi. Referansta (`image copy 2`)
      // oklar geniş süpürme hareketleri ve büküm belirgin. Açıklık 8 → 17, büküm 13 → 52.
      // ⚠ ⚠ **ŞERİT y 39–47'DEN 68–80'E TAŞINDI — yerleşim değişince ESKİ ŞERİT METNİN
      // İÇİNE DÜŞTÜ.** `ust`ta metin y%8–35 arasındaydı ve 39–47 onun hemen altındaki boş
      // banttı. `orta`ya geçince blok y%30–62'ye indi ve oklar başlıkların ÜSTÜNÜ ÇİZDİ:
      // "Önce sorun duruyor" ve "En sonda karar var" okunamaz hâle geldi (render'a bakıldı).
      // İki sayı birbirine bağlıydı ve bağ yazılı değildi; şimdi yazılı.
      // ⚠ Alt yarı zaten ölçülmüş biçimde boştu (%0,3–%1,2 doluluk); şerit oraya inince
      // hem çakışma bitiyor hem boşluk hareket kazanıyor — tek taşla iki kusur.
      { x1: 17, y1: 74, x2: 34, y2: 68, bukum: -52 },
      { x1: 42, y1: 67, x2: 59, y2: 74, bukum: 58 },
      { x1: 67, y1: 75, x2: 84, y2: 69, bukum: -48 },
    ],
  },
  gorseller: [
    // ⚠ ⚠ **TEK ÖZNE, ÜÇ KOPYA DEĞİL — ve bunu gerçek bir koşu gösterdi.** Şablon üç
    // yuva ilan ediyordu; hat TEK görsel üretiyor ve `composeBody` onu üç yuvaya birden
    // koyuyordu. Çıktıda aynı figür üç kez yan yana duruyordu: tasarım değil, hata gibi
    // okunuyor. Katalog `adet: 'slayt-basina'` diyor ama hattın DAG'ı dinamik çoğaltma
    // yapmıyor (borç A8) — ilan ile gerçek ayrışıyordu.
    //
    // ⚠ Referansın (`ornek-1`) yaptığı şey de zaten bu değil: TEK bir özne kesimi aşarak
    // devam ediyor. Tek geniş yuva hem dürüst hem referansa sadık: figür 2. ve 3. slaydı
    // kat ediyor ve süreklilik gerçekten kuruluyor.
    // ⚠ ⚠ **KAHRAMAN ÖLÇEĞİ: %26 → %40 (rehber §7, referans ölçümü).** `image copy 2`de
    // pandomimci kadrajın ~%40'ını tutuyor ve karenin KAHRAMANI; bizimki %13'ten %26'ya
    // çıkmıştı ve hâlâ bir dipnot gibi duruyordu. Rehber §7 tek cümle: "her karede tek
    // bir kahraman vardır ve karenin en az %40'ını tutar; üç öge de orta boyda ise
    // kompozisyon yoktur, yalnız yerleşim vardır."
    // ⚠ Yukarı da çekildi (y 44 → 30): alt kenara yapışmış bir figür "eklenmiş" durur;
    // referansta özne kadrajın ortasından yükseliyor ve metinle aynı hizada yaşıyor.
    // ⚠ ⚠ **TEK YUVADAN DÖRDE — borç A8 kapandığı için mümkün oldu.** Tek özne kararı
    // (yukarıdaki not) doğruydu AMA sebebi tasarım değil, kısıttı: hat tek görsel
    // üretiyor ve `composeBody` onu her yuvaya YAYIYORDU. Yayma kaldırıldı, hat
    // slayt başına üretiyor; referansın (`image copy 2`) yaptığı şey artık kurulabilir:
    // her karede AYRI bir poz ve figür kadrajın altından KESİLİYOR.
    //
    // ⚠ Geometri referanstan ölçüldü: özne y%22'den ALT KENARA kadar (h 78) ve slaydın
    // ~%52'si kadar geniş. Alt kenardan kesilmek "eklenmiş" hissini bitiren şey; boşlukta
    // yüzen bir figür her zaman yapıştırılmış durur.
    //
    // ⚠ ⚠ **İKİ YUVA KESİMİ AŞIYOR (x 24 ve 74) ve bu şablonun süreklilik İDDİASIDIR.**
    // Dördü de slayt ortasına otursaydı `kesintisizlik-yok` kusuru haklı olarak düşerdi:
    // oklar tek başına süreklilik kurmuyor, gövde de kesimi geçmeli.
    //
    // ⚠ Metin kolonu her karede öznenin KARŞI yanında (`kolon`): 12/24/62/74 sırasıyla
    // sağ · sol · sağ · sol kadrajı tutuyor, metin de sol · sağ · sol · sağ.
    { src: '', alt: 'kesik özne', x: 12, y: 22, genislik: 13, yukseklik: 78, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne', x: 24, y: 22, genislik: 13, yukseklik: 78, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne', x: 62, y: 22, genislik: 13, yukseklik: 78, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne', x: 74, y: 22, genislik: 13, yukseklik: 78, kirpma: 'kesik' },
  ],
  // ⚠ ⚠ **HAYALETLER BOŞTU ve bu "dolu taslak" kuralını deliyordu.** Şablon taslak
  // demek BOŞ demek değil; agent çoğaltıp düzenleyeceği şeyi göremezse alanı ya
  // atlıyor ya da uyduruyor. Gerçek koşuda model bu alanı kendiliğinden doldurdu
  // (HAT · KAYIP · KAYIT · SÜREÇ) ve çıktının EN tasarımsal ögesi o oldu — örnek
  // onu göstermiyordu, yani şans eseri iyi çıktı.
  // ⚠ Rakamlar aynı zamanda referanstaki `#003` tipi indeks etiketinin karşılığı.
  kartlar: [
    {
      elYazisi: 'Bir bakışta',
      ustBaslik: 'SAHNE',
      baslik: 'Anlatmak **göstermekle** başlar',
      govde: 'Dört karede tek bir hareket.',
      panel: null,
      hayalet: '01',
      // ⚠ 'UPCYTECH' DEĞİL: alt rayda artık marka işareti duruyor ve kelimeyi zaten
      // söylüyor. Aynı bilgiyi iki kez basmak imzayı zayıflatıyor, güçlendirmiyor.
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ADIM 01',
      baslik: 'Önce **sorun** duruyor',
      govde: 'Adı konmamış sorun çözülemez.',
      panel: null,
      hayalet: '02',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      // Özne bu karede SOLDA; metin karşı yana geçiyor.
      kolon: 'sag',
    },
    {
      ustBaslik: 'ADIM 02',
      baslik: 'Sonra **bir ölçü** koyuluyor',
      govde: 'Ölçü, tartışmayı tercihe çevirir.',
      panel: null,
      hayalet: '03',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ADIM 03',
      baslik: 'En sonda **karar** var',
      govde: 'Kararı ölçü değil insan verir.',
      panel: null,
      hayalet: '04',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      // Özne bu karede SOLDA; metin karşı yana geçiyor.
      kolon: 'sag',
    },
  ],
}

/**
 * **memphis** — kâğıt zemin, geometrik leke dili, soru ritmi.
 *
 * ⚠ Süreklilik ögesi YOK ve bu iddia edilmiyor. Referansta da slaytlar bağımsız; bağlayan
 * şey desen dili. **İddia edip kuramamak, kurmamaktan kötüdür.**
 * ⚠ Lekeler panorama koordinatında ve bazıları kesim çizgisinin ÜSTÜNE oturuyor: ritmi
 * kuran serpilme tam olarak bu.
 * ⚠ Zemin AÇIK — panel ve ray renkleri `--kart-metin`den türüdüğü için okunuyor. Sabit
 * beyaz olsalardı bu şablonun tüm verisi görünmezdi (FAZ-15.2).
 */
export const ORNEK_MEMPHIS: KatalogOrnegi = {
  slaytGenisligi: 1080,
  yukseklik: 1350,
  // ⚠ ⚠ **`orta` DENENDİ ve BIRAKILDI.** Dikeyde ortalanan metin, kesimi aşan özneyle
  // aynı bandı istiyor: liste paneli bir insan gövdesinin arkasında kalıyordu. Süreklilik
  // ögesi kesimi aşmak ZORUNDA olduğuna göre çakışmayı yatayda çözmek imkânsız — her
  // kartın metni solda başlıyor ve kesimi aşan her öge bir sonraki kartın soluna giriyor.
  // Çözüm dikeyde ayrışmak; `sahne` de aynı yola çıktı. Ayrım artık yerleşimde değil
  // zeminde (kâğıt), lekelerde ve `wdth 92`lik geniş seste.
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 0.78,
    baslikGenislik: 92,
    baslikAgirlik: 800,
    satirAraligi: 1.08,
    harfArasi: -0.01,
    ustGenislik: 84,
    govdeOrani: 0.34,
    baslikSutunu: 0.8,
    // ⚠ 1,7: `memphis` panelleri veri değil RİTİM taşıyor (etiket, liste); veri
    // şablonu kadar büyümeleri gerekmiyor ama web ölçüsünde de kalamazlar.
    panelPayi: 1.7,
  },
  zemin: 'var(--role-surface)',
  // ⚠ Kâğıt zeminde koyu bir hayalet aynı opaklıkta DAHA GÜÇLÜ okunur (koyu üstüne
  // açık ile açık üstüne koyu simetrik değil): %7 burada yeterli, ölçek büyütülüyor.
  hayaletKonumu: { ust: 30, olcek: 1.4, guc: 7 },
  zeminDokusu: {
    taban: '--ramp-marka-kagit',
    katmanlar: [
      {
        tip: 'dogrusal',
        aci: 160,
        duraklar: [
          { renk: '--ramp-marka-kagit', konum: 0 },
          { renk: '--ramp-gray-100', konum: 100 },
        ],
      },
      { tip: 'isik', x: 78, y: 18, capX: 44, capY: 52, renk: '--ramp-marka-amber-200', guc: 40 },
    ],
  },
  bant: { tip: 'yok' },
  // ⚠ Kâğıt zeminde gölge DAHA gerekli: açık zeminde kesik bir figürün kenarı zeminle
  // aynı parlaklıkta olabiliyor ve figür "kesilmiş kâğıt" gibi görünüyor.
  gorselIslemleri: ['matlama', 'tema-uyum', 'temas-golgesi'],
  // ⚠ ⚠ **BU YUVALAR BİR EŞLEŞME TESTİNDEN GELDİ.** Katalog `memphis` için slayt başına
  // kesik özne ilan ediyordu; ilk örnek hiç görsel taşımıyordu ve kimse fark etmezdi —
  // koşu görselleri üretir, yerleştirecek yuva bulamaz, sessizce metin-only bir memphis
  // çıkardı. `ornek-3`ün kimliği desen + İNSAN; ikisinden biri eksikse o şablon değil.
  // ⚠ Yuvalar kesimlerin ÜSTÜNDE (6 slaytta kesimler %16,7 · %33,3 · %50 · %66,7 · %83,3).
  gorseller: [
    { src: '', alt: 'kesik özne — 1', x: 13, y: 52, genislik: 8, yukseklik: 48, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne — 2', x: 46, y: 54, genislik: 8, yukseklik: 46, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne — 3', x: 80, y: 50, genislik: 8, yukseklik: 50, kirpma: 'kesik' },
  ],
  lekeler: [
    // ⚠ ⚠ **İKİSİ HACİMLİ, DÖRDÜ DÜZ — hepsi blob olsaydı Memphis olmaktan çıkardı.**
    // Bu şablonun kimliği GEOMETRİK desen dili: halka, kare, tarama, nokta ızgarası.
    // Hacimli organik şekil o dile bir KARŞITLIK katıyor (rehber §3: katmanlanma ve
    // kontrast), yerine geçmiyor. Kullanıcının şartı buydu: zenginleştir ama aslına
    // sadık kal.
    // ⚠ ⚠ **ÖLÇEK REFERANSTAN ÖLÇÜLDÜ: leke slaytın ~%35'i, bizimki %12–19'du.**
    // `image copy 4`te organik lekeler dev ve KESİM ÇİZGİLERİNİ AŞIYOR; küçük ve seyrek
    // şekiller "dekoratif nokta" gibi okunuyordu, desen dili kurmuyordu. Altı slaytta
    // kesimler %16,7 · %33,3 · %50 · %66,7 · %83,3 — üç leke kasten oraya oturtuldu.
    // ⚠ İki aksan (mavi + amber): referans da iki aksanlı çalışıyor (turuncu+lacivert).
    { tip: 'blob', x: 8, y: 74, boyut: 430, renk: 'var(--ramp-marka-mavi-500)' },
    { tip: 'halka', x: 17, y: 20, boyut: 260, renk: 'var(--ramp-marka-ink-800)' },
    { tip: 'blob', x: 33, y: 26, boyut: 380, renk: 'var(--ramp-marka-amber-500)' },
    { tip: 'tarama', x: 44, y: 78, boyut: 300, renk: 'var(--ramp-marka-ink-800)' },
    { tip: 'nokta', x: 58, y: 22, boyut: 230, renk: 'var(--ramp-marka-mavi-600)' },
    { tip: 'blob', x: 67, y: 76, boyut: 400, renk: 'var(--ramp-marka-mavi-200)' },
    { tip: 'kare', x: 78, y: 20, boyut: 170, renk: 'var(--ramp-marka-amber-500)' },
    { tip: 'blob', x: 88, y: 70, boyut: 360, renk: 'var(--ramp-marka-amber-500)' },
    { tip: 'nokta', x: 96, y: 26, boyut: 210, renk: 'var(--ramp-marka-ink-800)' },
  ],
  kartlar: [
    {
      elYazisi: 'Kendine sor',
      ustBaslik: 'SORU 00',
      baslik: 'Altı soru, **altı** yanlış varsayım',
      govde: 'Her kare bir varsayımı yıkıyor.',
      panel: null,
      hayalet: '?',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SORU 01',
      baslik: 'Geri dönüşüm **ücretsiz** mi?',
      govde: 'Toplama, taşıma ve ayrıştırma bir maliyet kalemi; bedava olan yalnız atmak.',
      panel: { tip: 'etiketler', ogeler: ['toplama', 'taşıma', 'ayrıştırma'] },
      hayalet: '01',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SORU 02',
      baslik: 'Her plastik **aynı** mı?',
      govde: 'Yedi kod, yedi ayrı akış. Karıştıkları an yedisi birden değersizleşiyor.',
      panel: {
        tip: 'liste',
        baslik: 'YEDİ AKIŞTAN ÜÇÜ',
        ogeler: [
          { no: '01', ad: 'PET — şişe, uzun çevrim ömrü' },
          { no: '02', ad: 'HDPE — bidon, depo malzemesi' },
          { no: '07', ad: 'Diğer — karışık, ayrıştırma hatası' },
        ],
      },
      hayalet: '02',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SORU 03',
      baslik: 'Temizlemek **şart** mı?',
      govde: 'Kalıntı, bir sonraki döngüde kokuya ve renk kaybına dönüşüyor.',
      panel: null,
      hayalet: '03',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SORU 04',
      baslik: 'Sonsuz kez **dönebilir** mi?',
      govde: 'Her döngüde zincir kısalıyor; sınırsız değil, sayılı.',
      panel: {
        tip: 'sayilar',
        ogeler: [
          { deger: '5', birim: 'döngü', alt: 'tipik üst sınır' },
          { deger: '1', birim: 'döngü', alt: 'kirli akışta' },
        ],
      },
      hayalet: '04',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SORU 05',
      baslik: 'Peki **ne** yapmalı?',
      govde: 'Önce ayrıştır, sonra temizle, sonra ölç. Sıra değişince üçü de boşa gidiyor.',
      panel: { tip: 'etiketler', ogeler: ['ayrıştır', 'temizle', 'ölç'] },
      hayalet: '05',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
  ],
}

/**
 * **donen** — aynı düzen, her slaytta başka zemin, daire maskeli ürün.
 *
 * ⚠ Kimlik renklerde değil DÖNMEDE. Rotasyon marka rampasının içinde kalıyor; referansın
 * turuncu→kırmızı→yeşil dizisini kopyalamak §12.1 chroma tavanını delerdi.
 * ⚠ Kart kendi zeminini taşıdığı için `zeminDokusu` YOK: doku kartların altında kalır ve
 * hiç görünmezdi. Bu şablonun zemini kartın kendisi.
 */
export const ORNEK_DONEN: KatalogOrnegi = {
  slaytGenisligi: 1080,
  yukseklik: 1350,
  yerlesim: 'yayik',
  tipografi: {
    baslikPayi: 0.8,
    baslikGenislik: 86,
    baslikAgirlik: 850,
    satirAraligi: 1.0,
    harfArasi: -0.02,
    ustGenislik: 104,
    govdeOrani: 0.31,
    // ⚠ 0,7'de üç satırlık başlık daireye giriyordu (1. kartta "tek" çipi dairenin
    // altında kaldı). Sütun daralınca metin ve daire ayrı dikey şeritlerde kalıyor.
    // ⚠ ⚠ **0,40: GERÇEK KOŞUDA METİN FOTOĞRAFA GİRDİ.** Ürün kutusu slaydın %42'sinde
    // başlıyor; %46'lık bir metin kolonu onunla 4 puan çakışıyor ve başlık fotoğrafın
    // altından okunuyordu ("Kağıttaki ka|ğıt"). Yan yana kompozisyonun bedeli bu: iki
    // ögenin sınırı ÖLÇÜLMELİ, göz kararı bırakılmamalı.
    baslikSutunu: 0.4,
  },
  // ⚠ ⚠ **KARTLARIN ÜSTÜNDE DOKU — `donen`in zemini tek katmanlıydı.** Bu şablonun
  // kimliği kart renklerinin DÖNMESİ; kartlar opak olmak zorunda ve panorama zemini
  // onların altında hiç görünmüyor. Sonuç her kartta düz bir renk, yani rehber §10
  // ölçüt 5'in tarif ettiği "web arka planı" — kabul testi bunu kırmızı verdi.
  // Gren + yumuşak vinyet üstte duruyor ve düz rengi yüzeye çeviriyor.
  ustDoku: { gren: 22, vinyet: 34 },
  zemin: 'var(--role-bg)',
  bant: { tip: 'yok' },
  // ⚠ Gölge YOK: daire maske ögeyi zaten ayırıyor ve maskeli bir ögeye gölge eklemek
  // onu zeminden koparıp rozet gibi gösteriyor. Renk uyumu var — ürün her kartta BAŞKA
  // bir zemine düşüyor ve kendi sıcaklığıyla gelirse dördü de yamalı görünür.
  gorselIslemleri: ['keskinlik', 'tema-uyum'],
  // ⚠ ⚠ **DAİRE ARKA FON, KIRPMA DEĞİL (D-288).** Referansta (`image copy 3`) beyaz daire
  // ürünün ARKASINDA duruyor ve ürün onu TAŞIYOR — omuzları, sapı, yaprağı dairenin
  // dışına çıkıyor. Bizde fotoğraf daireye KIRPILIYORDU: aynı görüntü değil, daha az
  // tasarım. Hat zaten arka planı siliyor (`gorsel-kirp`), yani kesik ürün elimizde;
  // eksik olan tek şey dairenin görünür bir katmanda durmasıydı.
  // ⚠ Daireler `ust: true`: kart zemini opak ve altta kalan bir leke hiç görünmüyor.
  lekeler: [
    // ⚠ ⚠ **SÜREKLİLİK ÜRÜNDE DEĞİL, ZEMİNDE.** İlk kurulumda ürünler kesimi aşıyordu ve
    // her slaytta İKİ yarım figür beliriyordu (kendi ürünü + öncekinin kuyruğu); metin
    // ikisinin arasında sıkışıp üstlerine bindi — render'a bakınca görüldü. Ürün bir
    // slaydın konusudur, iki slaydın ortak ögesi değil.
    // Kesimi aşan şey artık SOLUK BÜYÜK DAİRELER: zemin katmanında yaşıyorlar, metinle
    // yarışmıyorlar ve şablonun süreklilik iddiasını gerçekten kuruyorlar.
    { tip: 'daire', ust: true, x: 25, y: 30, boyut: 760, renk: 'rgba(255,255,255,0.07)' },
    { tip: 'daire', ust: true, x: 75, y: 68, boyut: 700, renk: 'rgba(255,255,255,0.07)' },
    // Ürünün arkasındaki beyaz daire — referansın (`image copy 3`) imzası. Merkezleri
    // ürün kutularıyla AYNI; boyutları üründen KÜÇÜK ki ürün taşsın.
    { tip: 'daire', ust: true, x: 17, y: 51, boyut: 400, renk: 'var(--ramp-marka-kagit)' },
    { tip: 'daire', ust: true, x: 42, y: 51, boyut: 400, renk: 'var(--ramp-marka-kagit)' },
    { tip: 'daire', ust: true, x: 67, y: 51, boyut: 400, renk: 'var(--ramp-marka-kagit)' },
    { tip: 'daire', ust: true, x: 92, y: 51, boyut: 400, renk: 'var(--ramp-marka-kagit)' },
  ],
  // ⚠ Kırpma `kesik`: ürün dairenin dışına taşabilsin — referanstaki hacim hissi bu.
  // ⚠ Her ürün KENDİ slaydında, kesimi aşmıyor: merkezler 17 · 42 · 67 · 92.
  gorseller: [
    { src: '', alt: 'ürün — 1', x: 10.5, y: 24, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
    { src: '', alt: 'ürün — 2', x: 35.5, y: 24, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
    { src: '', alt: 'ürün — 3', x: 60.5, y: 24, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
    { src: '', alt: 'ürün — 4', x: 85.5, y: 24, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
  ],
  kartlar: [
    {
      elYazisi: 'Seride',
      ustBaslik: 'SERİ 01',
      baslik: 'Dört malzeme, **tek** hat',
      govde: 'Aynı hat, dört farklı beslemeyle çalışıyor.',
      panel: null,
      hayalet: '01',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-bg)',
    },
    {
      ustBaslik: 'SERİ 02',
      baslik: 'Aynı düzen, **başka** zemin',
      govde: 'Süreklilik rengin dönmesinden geliyor; düzen hiç değişmiyor.',
      panel: null,
      hayalet: '02',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-amber-200)',
    },
    {
      ustBaslik: 'SERİ 03',
      baslik: 'Ritmi kuran **tekrar**',
      govde: 'Göz üçüncü karede düzeni öğreniyor ve dördüncüyü bekliyor.',
      panel: null,
      hayalet: '03',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-surface)',
    },
    {
      ustBaslik: 'SERİ 04',
      baslik: 'Kapanış **koyu** gelir',
      govde: 'Son kare diziyi kapatıyor: aynı düzen, en yüksek kontrast.',
      panel: null,
      hayalet: '04',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-line-edge)',
    },
  ],
}

/**
 * **editoryal** — tam kaplama fotoğraf, minik zarif tipografi, devasa boşluk.
 *
 * ⚠ ⚠ **KATALOĞUN EN DEĞERLİ KAYDI, çünkü ötekilerin ZIDDI.** `baslikPayi: 0,40` ölçülen
 * tavanın çok altında ve bu bir kısıt değil bir SES: bu şablon bağırmıyor, fısıldıyor.
 * Bir katalog ancak kendi zıddını barındırabiliyorsa katalogdur; hepsi poster olan bir
 * katalog, tek şablonun altı varyasyonudur.
 * ⚠ Süreklilik ögesi fotoğrafın KENDİSİ: tam kaplama görsel kesimi aşarak devam ediyor.
 */
export const ORNEK_EDITORYAL: KatalogOrnegi = {
  slaytGenisligi: 1080,
  yukseklik: 1350,
  // ⚠ ⚠ **BU ŞABLON REFERANSA GÖRE YENİDEN KURULDU (D-286).** Önceki hâli referansın
  // (`image copy 5`) ÜÇ temel kararını da ters yapıyordu:
  //   1. Zemin KOYUYDU — referans açık, havadar, neredeyse kâğıt.
  //   2. Fotoğraflar panoramanın TAMAMINI kaplıyordu (0–56 ve 56–100), yani metin hep
  //      fotoğrafın ÜSTÜNDEydi. Referansta fotoğraf ve metin YAN YANA duruyor, her biri
  //      kadrajın yarısı, ve taraflar slayttan slayta DEĞİŞİYOR.
  //   3. Başlık 38px'ti (`baslikPayi: 0.4`) — referansta başlık kadrajın en büyük ögesi
  //      ve İNCE; sessizliği punto küçüklüğü değil AĞIRLIK azlığı kuruyor.
  // Kapaklar ızgarasına bakınca bu şablon altısının açık ara en zayıfıydı.
  yerlesim: 'orta',
  tipografi: {
    // ⚠ 0,4 → 0,72 ve ağırlık 500 → 400: referansın "sessiz" tonu İNCE ve BÜYÜK bir
    // başlıktan geliyor. Küçük ve yarı kalın bir başlık sessiz değil, çekingen duruyor.
    baslikPayi: 0.72,
    baslikGenislik: 100,
    baslikAgirlik: 400,
    satirAraligi: 1.12,
    harfArasi: -0.012,
    ustGenislik: 62,
    govdeOrani: 0.34,
    // ⚠ 0,6 → 0,46: metin kolonu fotoğrafa yer BIRAKMAK zorunda. Yan yana kompozisyonun
    // tek sert kısıtı bu; kolon geniş kalırsa iki öge üst üste biner ve düzen çöker.
    baslikSutunu: 0.46,
  },
  // ⚠ Açık zemin: kart metni `kartRenkleri` ile zeminden TÜRÜYOR, sabit beyaz değil —
  // bu yüzden zemini açığa çevirmek metni okunmaz yapmıyor (FAZ-15.2 dersi).
  zemin: 'var(--ramp-marka-mavi-200)',
  zeminDokusu: {
    taban: '--ramp-marka-mavi-200',
    katmanlar: [
      // ⚠ Referansın zemini düz değil: soluk bir sıcaklık farkı var. İki katman —
      // dikey bir açılma ve tek bir yumuşak ışık havuzu — onu kuruyor.
      {
        tip: 'dogrusal',
        aci: 168,
        duraklar: [
          { renk: '--ramp-marka-kagit', konum: 0 },
          { renk: '--ramp-marka-mavi-200', konum: 82 },
        ],
      },
      { tip: 'isik', x: 74, y: 24, capX: 58, capY: 46, renk: '--ramp-marka-kagit', guc: 30 },
    ],
  },
  gorselIslemleri: [],
  bant: { tip: 'yok' },
  gorseller: [
    // ⚠ ⚠ **ÜÇ YARIM KADRAJ, DÖNÜŞÜMLÜ YANLARDA — referansın ritmi bu.** Her fotoğraf
    // slaydın ~%52'si ve üst-alt kenara TAŞIYOR (`y: 0, yukseklik: 100`); referansta da
    // fotoğraflar kadrajı boydan boya kesiyor, içinde yüzen bir kutu değiller.
    // ⚠ İkincisi 50 kesimini AŞIYOR: bu şablonun tek süreklilik iddiası o. Üçü de slayt
    // ortasına otursaydı `kesintisizlik-yok` kusuru haklı olarak düşerdi.
    {
      src: '',
      alt: 'geniş plan — açılış',
      x: 0,
      y: 0,
      genislik: 13,
      yukseklik: 100,
      kirpma: 'tam',
    },
    {
      src: '',
      alt: 'yakın plan — kesim üstü',
      x: 44,
      y: 0,
      genislik: 13,
      yukseklik: 100,
      kirpma: 'tam',
    },
    { src: '', alt: 'kapanış karesi', x: 87, y: 0, genislik: 13, yukseklik: 100, kirpma: 'tam' },
  ],
  kartlar: [
    {
      elYazisi: 'Sahadan',
      ustBaslik: 'BÖLÜM I',
      baslik: 'Sessiz bir **dönüşüm**',
      govde: 'Bir hattın değişimi gürültüyle değil, ölçüyle başlıyor.',
      panel: null,
      hayalet: '01',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      // Fotoğraf bu karede SOLDA; metin karşı yana geçiyor.
      kolon: 'sag',
    },
    {
      ustBaslik: 'BÖLÜM II',
      baslik: 'Boşluk da bir **karar**',
      govde: 'Doldurulmayan alan, gözün dinlendiği yerdir.',
      panel: null,
      hayalet: '02',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'BÖLÜM III',
      baslik: 'Küçük punto **güven** ister',
      govde: 'Bağırmayan bir başlık, okunacağını varsayıyor.',
      panel: null,
      hayalet: '03',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      kolon: 'sag',
    },
    {
      ustBaslik: 'BÖLÜM IV',
      baslik: 'Ve **kapanış**',
      govde: 'Dört karede tek bir bakış; imza altta duruyor.',
      panel: null,
      hayalet: '04',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
  ],
}

export const ORNEKLER: Readonly<Record<string, KatalogOrnegi>> = {
  'veri-hikayesi': ORNEK_VERI_HIKAYESI,
  'akan-alan': ORNEK_AKAN_ALAN,
  sahne: ORNEK_SAHNE,
  memphis: ORNEK_MEMPHIS,
  donen: ORNEK_DONEN,
  editoryal: ORNEK_EDITORYAL,
}

export const ornekBul = (id: string): KatalogOrnegi | null => ORNEKLER[id] ?? null
