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
  gorseller: [],
  kartlar: [
    {
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
  hayaletKonumu: { ust: 48, olcek: 1.62, guc: 16 },
  alanSiniri: {
    ust: 'var(--role-bg)',
    alt: 'var(--role-line-edge)',
    noktalar: [
      { x: 0, y: 62 },
      { x: 22, y: 57 },
      { x: 44, y: 66 },
      { x: 66, y: 58 },
      { x: 84, y: 64 },
      { x: 100, y: 60 },
    ],
  },
  bant: { tip: 'yok' },
  gorseller: [],
  kartlar: [
    {
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
  yerlesim: 'ust',
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
    baslikSutunu: 0.8,
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
      { tip: 'isik', x: 50, y: 12, capX: 84, capY: 46, renk: '--ramp-marka-amber-500', guc: 13 },
      { tip: 'vinyet', guc: 42 },
    ],
  },
  gorselIslemleri: ['matlama', 'keskinlik'],
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
      { x1: 21, y1: 44, x2: 29, y2: 44, bukum: -13 },
      { x1: 46, y1: 41, x2: 54, y2: 41, bukum: 15 },
      { x1: 71, y1: 45, x2: 79, y2: 45, bukum: -11 },
    ],
  },
  gorseller: [
    // ⚠ x KESİM ÇİZGİSİNİN ÜSTÜNE denk geliyor (4 slaytta kesimler %25/%50/%75): özne
    // gövdesi bir slayttan diğerine geçiyor — bu şablonun birinci süreklilik kanalı.
    { src: '', alt: 'kesik özne — 1', x: 19, y: 51, genislik: 13, yukseklik: 49, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne — 2', x: 44, y: 48, genislik: 13, yukseklik: 52, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne — 3', x: 69, y: 52, genislik: 13, yukseklik: 48, kirpma: 'kesik' },
  ],
  kartlar: [
    {
      ustBaslik: 'SAHNE',
      baslik: 'Anlatmak **göstermekle** başlar',
      govde: 'Dört karede tek bir hareket.',
      panel: null,
      hayalet: '',
      rayaSol: 'UPCYTECH',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ADIM 01',
      baslik: 'Önce **sorun** duruyor',
      govde: 'Adı konmamış sorun çözülemez.',
      panel: null,
      hayalet: '',
      rayaSol: 'UPCYTECH',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ADIM 02',
      baslik: 'Sonra **bir ölçü** koyuluyor',
      govde: 'Ölçü, tartışmayı tercihe çevirir.',
      panel: null,
      hayalet: '',
      rayaSol: 'UPCYTECH',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ADIM 03',
      baslik: 'En sonda **karar** var',
      govde: 'Kararı ölçü değil insan verir.',
      panel: null,
      hayalet: '',
      rayaSol: 'UPCYTECH',
      rayaOrta: ORNEK,
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
  gorselIslemleri: ['matlama'],
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
    { tip: 'daire', x: 7, y: 76, boyut: 190, renk: 'var(--ramp-marka-amber-500)' },
    { tip: 'halka', x: 31, y: 18, boyut: 150, renk: 'var(--ramp-marka-ink-800)' },
    { tip: 'tarama', x: 49, y: 80, boyut: 210, renk: 'var(--ramp-marka-ink-800)' },
    { tip: 'kare', x: 66, y: 16, boyut: 130, renk: 'var(--ramp-marka-amber-600)' },
    { tip: 'nokta', x: 84, y: 76, boyut: 170, renk: 'var(--ramp-marka-ink-800)' },
    { tip: 'daire', x: 96, y: 22, boyut: 120, renk: 'var(--ramp-marka-amber-200)' },
  ],
  kartlar: [
    {
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
    baslikSutunu: 0.6,
  },
  zemin: 'var(--role-bg)',
  bant: { tip: 'yok' },
  gorselIslemleri: ['keskinlik'],
  gorseller: [
    // ⚠ y 34: daire başlığın ALTINDA, gövde metninin ÜSTÜNDE. y 46'da gövdeyi örtüyordu
    // ve metin dairenin içinden okunuyordu — render'a bakınca görüldü.
    { src: '', alt: 'ürün — 1', x: 16, y: 34, genislik: 9, yukseklik: 30, kirpma: 'daire' },
    { src: '', alt: 'ürün — 2', x: 41, y: 34, genislik: 9, yukseklik: 30, kirpma: 'daire' },
    { src: '', alt: 'ürün — 3', x: 66, y: 34, genislik: 9, yukseklik: 30, kirpma: 'daire' },
    { src: '', alt: 'ürün — 4', x: 91, y: 34, genislik: 9, yukseklik: 30, kirpma: 'daire' },
  ],
  kartlar: [
    {
      ustBaslik: 'SERİ 01',
      baslik: 'Dört malzeme, **tek** hat',
      govde: 'Aynı hat, dört farklı beslemeyle çalışıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-bg)',
    },
    {
      ustBaslik: 'SERİ 02',
      baslik: 'Aynı düzen, **başka** zemin',
      govde: 'Süreklilik rengin dönmesinden geliyor; düzen hiç değişmiyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-amber-200)',
    },
    {
      ustBaslik: 'SERİ 03',
      baslik: 'Ritmi kuran **tekrar**',
      govde: 'Göz üçüncü karede düzeni öğreniyor ve dördüncüyü bekliyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-surface)',
    },
    {
      ustBaslik: 'SERİ 04',
      baslik: 'Kapanış **koyu** gelir',
      govde: 'Son kare diziyi kapatıyor: aynı düzen, en yüksek kontrast.',
      panel: null,
      hayalet: '',
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
  yerlesim: 'alt',
  tipografi: {
    baslikPayi: 0.4,
    baslikGenislik: 96,
    baslikAgirlik: 500,
    satirAraligi: 1.3,
    harfArasi: 0.01,
    ustGenislik: 62,
    govdeOrani: 0.42,
    baslikSutunu: 0.6,
  },
  zemin: 'var(--role-line-edge)',
  hayaletKonumu: { ust: 14, olcek: 0.42, guc: 9 },
  bant: { tip: 'yok' },
  gorselIslemleri: ['duotone'],
  gorseller: [
    { src: '', alt: 'geniş plan — sol', x: 0, y: 0, genislik: 56, yukseklik: 100, kirpma: 'tam' },
    { src: '', alt: 'geniş plan — sağ', x: 56, y: 0, genislik: 44, yukseklik: 100, kirpma: 'tam' },
  ],
  kartlar: [
    {
      ustBaslik: 'BÖLÜM I',
      baslik: 'Sessiz bir **dönüşüm**',
      govde: 'Fotoğraf kesimi aşıyor; metin kenarda duruyor ve yer istemiyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'BÖLÜM II',
      baslik: 'Boşluk da bir **karar**',
      govde: 'Doldurulmayan alan, gösterilen şeyi büyütüyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'BÖLÜM III',
      baslik: 'Küçük punto **güven** ister',
      govde: 'Bağırmayan bir başlık, okunacağını varsayıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'BÖLÜM IV',
      baslik: 'Ve **kapanış**',
      govde: 'Aynı fotoğraf, dört karede tek bir bakış.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
  ],
}

/**
 * Katalog id'si → dolu taslak.
 *
 * ⚠ ⚠ **ANAHTAR KATALOG ID'SİYLE AYNI ve testi bunu zorluyor.** Ayrı bir `ornekId` alanı
 * açılsaydı iki liste birbirinden bağımsız kayabilir, bir şablon örneksiz kalır ve bunu
 * ancak koşu anında — yani parayı harcadıktan sonra — fark ederdik.
 */
export const ORNEKLER: Readonly<Record<string, KatalogOrnegi>> = {
  'veri-hikayesi': ORNEK_VERI_HIKAYESI,
  'akan-alan': ORNEK_AKAN_ALAN,
  sahne: ORNEK_SAHNE,
  memphis: ORNEK_MEMPHIS,
  donen: ORNEK_DONEN,
  editoryal: ORNEK_EDITORYAL,
}

export const ornekBul = (id: string): KatalogOrnegi | null => ORNEKLER[id] ?? null
