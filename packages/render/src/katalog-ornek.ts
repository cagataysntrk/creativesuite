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

import { VARSAYILAN_TUVAL } from '@suite/contracts'
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
// ⚠ ⚠ **SAYAÇ ETİKETLERİ KALDIRILDI (T1).** `BÖLÜM I` · `SERİ 02` · `SORU 03` gibi
// etiketler HİÇBİR referansta yok; onlar bir sunum şablonunun dili, bir tasarımın değil.
// Sayfa sayısını alt ray zaten veriyor (`03 / 06`) ve iki kez söylemek imzayı zayıflatıyor.
// Üst başlık artık kartın KONUSUNU söylüyor: 'AYRIŞTIRMA', 'ÖLÇÜM', 'İMZA'.
// ⚠ ⚠ **GENİŞLİK DEĞERLERİ YENİ EKSENE TAŞINDI (D-296).** Archivo'nun `wdth` ekseni
// 62–125%, Bricolage'ınki 75–100%. Aralık dışı bir değer tarayıcıda SESSİZCE kırpılıyor:
// `ustGenislik: 118` yazan bir reçete 100 çiziyor ve reçete yalan söylemeye başlıyor.
// Değerler oranla taşındı, gözle değil. Ağırlık tavanı da 900 → 800.
// ⚠ ⚠ **HAYALET GİDİNCE HİYERARŞİ AÇIĞA ÇIKTI (D-299).** Dev soluk rakam kaldırılınca
// kabul ölçütü 1 (en büyük/en küçük punto oranı ≥ 6) kırıldı: başlık 69–91 px, alt ray
// 18 px → oran 3,8–5,1. **Eşiği düşürmek yanlış cevap olurdu** — ölçüt kırılmadı, hayalet
// onu SAKLIYORDU. Referansta kadrajın en büyük ögesi başlığın kendisi; bizimki
// tuvalin %5–6,7'siydi. Paylar ~%30 yükseltildi.
export const ORNEK_VERI_HIKAYESI: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  // ⚠ ⚠ **GREN HER ŞABLONDA (T7).** Depo sahibi: *"illüstrasyon stili çok pürüzsüz,
  // gölgesiz, texture'sız"*. Düz bir dijital alan her zaman dijital görünüyor; film greni
  // ve kâğıt paraziti, gözün "bu bir yüzey" demesi için gereken tek şey. Koyu zeminde
  // film greni (daha görünür), açık zeminde kâğıt paraziti (daha ince) — aynı doku iki
  // zeminde aynı güçte olamaz.
  // ⚠ Vinyet kadrajı topluyor: kenarları hafif düşürmek merkezi kendiliğinden öne çıkarıyor.
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
    baslikPayi: 1.16,
    baslikAgirlik: 600,
    satirAraligi: 0.98,
    harfArasi: -0.025,
    govdeOrani: 0.27,
    baslikSutunu: 0.88,
    // ⚠ ⚠ **2,1 — VERİ ŞABLONUNDA VERİ %2'YDİ.** Ölçüldü: panel kadrajın %0,9–4,9'unu,
    // hayalet %22–26'sını tutuyordu. Bu şablonun ADI veri hikâyesi; en büyük ögesi
    // dekoratif bir rakam olamaz. Çarpan panelin TAMAMINI büyütüyor, tek tek ögeleri
    // değil: iç oranlar (rehber §3) korunuyor.
    panelPayi: 1.7,
  },
  zemin: 'var(--role-line-edge)',
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
      ustBaslik: 'AÇILIŞ',
      baslik: 'Altı yılda **iki katına** çıkan bir eğri',
      govde: 'Kaydırın: eğri altı slaydı kat ediyor ve her durakta bir karar var.',
      panel: { tip: 'etiketler', ogeler: ['2019', '2021', '2023', '2025'] },
      hayalet: '',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'BAŞLANGIÇ',
      baslik: 'Sorun hacim değil, **ayrıştırma**',
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
      hayalet: '',
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
      hayalet: '',
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
      hayalet: '',
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
      hayalet: '',
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
      hayalet: '',
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
// ⚠ ⚠ **HAYALET BURADAN DA KALKTI — SIĞACAK YER YOK, ÖLÇÜLDÜ (D-299).** Önce "boş alt
// alanda çakışmıyor" diye burada bırakılmıştı; depo sahibi 3. slaytta çakışmayı gördü ve
// ölçüm onu doğruladı: alan sınırı y%44–86 arasında SALINIYOR, hayalet ise %35 boyunda.
// Tek bir alana sığması için ya sınırın en alçak noktasının (%86) altına inmesi gerekir
// (%86+35 = kadraj dışı) ya da en yüksek noktasının (%44) üstüne çıkması (orada başlık var).
// **Salınan bir sınırla sabit bir dev rakam yan yana yaşayamaz** — geometri, tercih değil.
// Böylece hayalet altı şablonun altısında da kapalı; yetenek duruyor, kullanan yok.
// ESKİ NOT (neden burada tutulmuştu): Depo sahibi: *"hepsine arkaya filigran
// gibi sayı eklemişsin, çoğunda yazılarla çakışıyor, neden hepsinde var?"* — haklıydı.
// Dev soluk rakam bir KOMPOZİSYON ögesi ve yalnız ona YER olan yerde işe yarıyor:
// `akan-alan`ın alt yarısı boş bir mürekkep alanı ve rakamlar oraya oturuyor, hiçbir
// şeyle çakışmıyor. Öteki beş şablonda metnin, panelin ya da fotoğrafın ARKASINA düşüyordu
// ve orada bir tasarım ögesi değil, bir FİLİGRAN gibi okunuyor.
// **Aynı öge her şablonda aynı anlama gelmiyor** — tekrar eden ders.
export const ORNEK_AKAN_ALAN: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 1.18,
    baslikAgirlik: 700,
    satirAraligi: 1.06,
    harfArasi: -0.015,
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
      ustBaslik: 'DÖNGÜSELLİK',
      baslik: 'Bir hattı **döngüsel** yapan beş şart',
      govde: 'Beşi de olmadan döngü kapanmıyor; biri eksikse sistem doğrusal kalıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'İZLENEBİLİRLİK',
      baslik: 'Girdi **izlenebilir** olacak',
      govde: 'Nereden geldiği bilinmeyen malzeme, nereye gittiği bilinmeyen atıktır.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'AYRIŞTIRMA',
      baslik: 'Ayrıştırma **kaynakta** başlayacak',
      govde: 'Sonradan ayrıştırma her adımda pahalılaşıyor ve saflığı düşürüyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ÖLÇÜM',
      baslik: '**Ölçülmeyen** kalite, varsayılandır',
      govde: 'Ölçülmeyen saflık satışta ortaya çıkıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ALICI',
      baslik: 'Çıktının bir **alıcısı** olacak',
      govde: 'Alıcısı olmayan geri kazanım, ertelenmiş bir depolama.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'FİNANS',
      baslik: 'Döngü **kendini finanse** edecek',
      govde: 'Sübvansiyonla dönen döngü, sübvansiyon bitince durur.',
      panel: null,
      hayalet: '',
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
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
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
    baslikPayi: 0.98,
    baslikAgirlik: 600,
    satirAraligi: 0.96,
    harfArasi: -0.03,
    govdeOrani: 0.32,
    // ⚠ 0,66'da başlık üç satıra çıkıyor ve metin bloğu okların şeridine giriyordu.
    // Sütunu genişletmek satır sayısını ikiye indiriyor: oklara yer açan şey boşluk değil,
    // metnin daha az dikey yer kaplaması.
    // ⚠ 0,8 → 0,56: yan yana kompozisyonda metin kolonu figüre yer BIRAKMAK zorunda.
    // Genişken blok kadrajı boydan boya kesiyor ve "yan yana" iddiası çöküyor.
    // ⚠ ⚠ **0,56 → 0,46 ve GEREKÇESİ ÖLÇÜLDÜ.** Yuva slaydın %52'sini tutuyor; %56'lık bir
    // metin kolonu ona yer BIRAKMIYOR ve çakışma matematiksel olarak kaçınılmaz oluyordu
    // (kart 3'te %40, kart 4'te %44 — ölçüldü, göz kararı değil). İki öge aynı kadrajı
    // paylaşacaksa toplamları 100'ü geçemez; bu bir tasarım tercihi değil, aritmetik.
    // ⚠ 0,46 → 0,54: dar kolonda baslik uc satira bolunuyordu ("Sessiz / bir /
    // donusum") ve editoryal ses cirkinlesti. Fotograf kolonuna hala yer var.
    baslikSutunu: 0.54,
    // ⚠ Gövde sütunu başlıktan AYRI (R-86): dar bir başlık tercihi gövdeyi de
    // daraltıyordu ve satır ölçü bandının altına düşüyordu.
    govdeSutunu: 0.54,
  },
  zemin: 'var(--role-line-edge)',
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
  // ⚠ ⚠ **ARALIKLAR KASTEN DÜZENSİZ (T9).** Depo sahibi: *"her şey çok dengeli;
  // birkaç slaytta kasıtlı dengesizlik elle yapılmış hissi verir"*. Eşit aralıklı
  // yerleşim bir ızgaranın imzasıdır, bir tasarımcının değil: göz düzenliliği hemen
  // tanıyor ve "hesaplanmış" diyor. Kaymalar küçük (2–4 puan) ama ritmi kırmaya yetiyor.
  // ⚠ ⚠ **KUTU EN/BOYU KAYNAKLA UYUŞMUYORDU — özne kartın %20'siydi, referansta %76.**
  // Ölçüldü: kutu %12 genişlik × %78 yükseklik = 518 × 1053 px, yani oran 0,49. Sağlayıcı
  // 4:5 üretiyor (1024×1280, oran 0,80) ve `object-fit: contain` onu 518 px genişliğe
  // sığdırınca yükseklik 648 px'te kalıyor: **kutunun 405 px'i BOŞ.** Kadrajın ortasında
  // gördüğümüz boşluğun sebebi buydu; figürü büyütmek değil, kutuyu kaynağın oranına
  // getirmek gerekiyordu. 1053 × 0,80 = 842 px → panorama genişliğinin %19,5'i.
  //
  // ⚠ **Metin figürün ÜSTÜNE binebilir ve referansta da biniyor.** Daha önce çakışmayı
  // sıfıra indirmiştim; o, iki ögeyi de küçülten yanlış bir hedefti. Kesik öznenin
  // etrafındaki boşluk metnin yeri değil, öznenin nefesi.
  // ⚠ ⚠ **GÖRSEL METİN KOLONUNDAN KAÇIYOR (FAZ-18.3).** Gerçek koşuda ölçüldü
  // (run_01a02ade): metin alanının %29'u görselin ÜSTÜNDE duruyordu. Metin z-index 6
  // ile üstteydi ve `metin-ortuluyor` bu yüzden temiz çıkıyordu — ama "üstte olmak
  // okunabilirlik değildir": beyaz bir başlık parlak metal bir yüzeyde kayboluyor.
  // Slaytlara BAKILINCA görüldü, sonra `metin-gorsel-cakisiyor` kusuru yazıldı.
  //
  // ⚠ Kolon sınırı: metin kartın sol %54'ünde (`baslikSutunu`), görsel sağ yarıda.
  // Dört kart = %25/kart, yani görsel kart içinde ~%56'dan başlıyor.
  // ⚠ **Kesim aşma KORUNUYOR:** her görsel kendi kartının sağ sınırını geçip sonraki
  // slayda uzanıyor — bu şablonun süreklilik iddiası tam olarak o.
  // ⚠ ⚠ **DÖRT GÖRSEL → İKİ GÖRSEL, ve ikisi de KESİMİN ÜSTÜNDE (FAZ-18.3).** Depo
  // sahibi çıktıya bakıp yazdı: *"iki görsel farklı sayfalarda yan yana olmamalı, tek
  // görsel iki sayfanın ortasında olmalı — yarısı ilkinde yarısı diğerinde ki kaydırırken
  // seamless hissedilsin. Her sayfada görsel olmasına gerek yok, aşırı boğucu."*
  //
  // ⚠ **Süreklilik İMA EDİLMİYOR, KANITLANIYOR.** Slayt başına bir görsel, kaydırırken
  // dört ayrı kare demek — her karede yeni bir figür beliriyor ve göz bağı kopuyor.
  // Kesimin TAM üstüne oturan bir görselde ise aynı figürün devamı geliyor: seamless
  // olduğunun kanıtı, iddiası değil.
  //
  // ⚠ Aradaki slaytlar BOŞ değil: taşıyıcı orada tipografi. Dört slaytta iki görsel
  // (1↔2 kesimi ve 3↔4 kesimi), aralarda başlık kadrajı taşıyor.
  // ⚠ ⚠ **ÖLÇÜLER "GÜZEL GÖRÜNSÜN" DİYE DEĞİL, DİKİŞ BANDINDAN TÜRÜYOR (R-94).** Önceki
  // sürüm `genislik: 12` idi: özne kesimin iki yakasında da slayt genişliğinin yalnız
  // **%24**'ünü kaplıyordu — arada kalan bölge, araştırmanın *"en kötü seçenek"* dediği
  // yer. Ezme eşiği %40 → kesimin her yakasında ≥432 px → boyanan genişlik ≥864 px.
  // 864/4320 = **%20**, kesime ortalanınca x = (kesim − 432)/4320.
  // ⚠ Yükseklik de bundan türüyor, ayrı bir tercih değil: 4:5 kaynakta 864 px genişlik
  // ancak 1080 px yükseklikte BOYANIYOR (`contain`). 78 verilseydi kutu 1053'te kalır,
  // boya 842'ye düşer ve eşik yine tutmazdı — kutuyu büyütüp boyayı unutmak bu kusurun
  // ta kendisi.
  gorseller: [
    {
      src: '',
      alt: 'kesik özne — 1↔2 kesimi',
      x: 15,
      y: 13,
      genislik: 20,
      yukseklik: 80,
      kirpma: 'kesik',
    },
    {
      src: '',
      alt: 'kesik özne — 3↔4 kesimi',
      x: 65,
      y: 13,
      genislik: 20,
      yukseklik: 80,
      kirpma: 'kesik',
    },
  ],
  // ⚠ ⚠ **HAYALETLER BOŞTU ve bu "dolu taslak" kuralını deliyordu.** Şablon taslak
  // demek BOŞ demek değil; agent çoğaltıp düzenleyeceği şeyi göremezse alanı ya
  // atlıyor ya da uyduruyor. Gerçek koşuda model bu alanı kendiliğinden doldurdu
  // (HAT · KAYIP · KAYIT · SÜREÇ) ve çıktının EN tasarımsal ögesi o oldu — örnek
  // onu göstermiyordu, yani şans eseri iyi çıktı.
  // ⚠ Rakamlar aynı zamanda referanstaki `#003` tipi indeks etiketinin karşılığı.
  kartlar: [
    {
      ustBaslik: 'SAHNE',
      baslik: 'Anlatmak **göstermekle** başlar',
      govde: 'Dört karede tek bir hareket.',
      panel: null,
      hayalet: '',
      // ⚠ 'UPCYTECH' DEĞİL: alt rayda artık marka işareti duruyor ve kelimeyi zaten
      // söylüyor. Aynı bilgiyi iki kez basmak imzayı zayıflatıyor, güçlendirmiyor.
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SORUN',
      baslik: 'Önce **sorun** duruyor',
      govde: 'Adı konmamış sorun çözülemez.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      // Özne bu karede SOLDA; metin karşı yana geçiyor.
      kolon: 'sag',
    },
    {
      ustBaslik: 'ÖLÇÜ',
      baslik: 'Sonra **bir ölçü** koyuluyor',
      govde: 'Ölçü, tartışmayı tercihe çevirir.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'KARAR',
      baslik: 'En sonda **karar** var',
      govde: 'Kararı ölçü değil insan verir.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
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
/**
 * ⚠ ⚠ **AYRIMI ÖGE SİLEREK DEĞİL, KOMPOZİSYONLA ARIYOR — ve bu bir DENEMEYLE
 * öğrenildi.** İlk hamle el yazısını kaldırmaktı; bakıldı ve şablon ayırt edici
 * OLMADI, sıradanlaştı. Öge envanteri çeşitliliği görsel ayrımın vekili değil.
 * Soru ritmi yerini değiştirerek ayrışıyor: metin DİBE iniyor, üstte büyük bir
 * boşluk kalıyor — soru soran bir afiş. → D-312
 */
export const ORNEK_MEMPHIS: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  // ⚠ ⚠ **`orta` DENENDİ ve BIRAKILDI.** Dikeyde ortalanan metin, kesimi aşan özneyle
  // aynı bandı istiyor: liste paneli bir insan gövdesinin arkasında kalıyordu. Süreklilik
  // ögesi kesimi aşmak ZORUNDA olduğuna göre çakışmayı yatayda çözmek imkânsız — her
  // kartın metni solda başlıyor ve kesimi aşan her öge bir sonraki kartın soluna giriyor.
  // Çözüm dikeyde ayrışmak; `sahne` de aynı yola çıktı. Ayrım artık yerleşimde değil
  // zeminde (kâğıt), lekelerde ve `wdth 92`lik geniş seste.
  // ⚠ ⚠ **`alt` → `ust` ve sebebi ÖLÇÜLDÜ (FAZ-18.3).** Metin dibe itiliyordu, kesik
  // özne de alt yarıda duruyordu: ikisi aynı bandı istiyor ve `metin-gorsel-cakisiyor`
  // beş kusur buldu. Yatayda çözmek imkânsızdı — süreklilik ögesi kesimi aşmak ZORUNDA
  // ve kesim metin kolonunun içinden geçiyor. Çakışma DİKEYDE çözülüyor: metin üstte,
  // özne altta. Aynı ders `sahne`de bir kez öğrenilmişti.
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 0.98,
    baslikAgirlik: 500,
    satirAraligi: 1.08,
    harfArasi: -0.01,
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
  // ⚠ ⚠ **ÜÇ GÖRSEL BEŞ KESİMİ KAPATAMAZ (R-87).** Görseller %16,7 · %50 · %83,3
  // kesimlerini aşıyor; %33,3 ve %66,7 boştu ve ölçüm belge düzeyinde olduğu için
  // görmüyordu. Dördüncü ve beşinci bir görsel eklemek şablonun "az öge" kimliğini
  // bozardı — ölçek çizgisi panoramayı KAT EDİYOR ve beş kesimi birden kapatıyor.
  // ⚠ Duraklar içerikten: altı varsayımın numarası, uydurma bir işaret değil.
  bant: {
    tip: 'olcek',
    y: 88,
    aralik: 4.17,
    duraklar: [
      { x: 8, etiket: '01' },
      { x: 25, etiket: '02' },
      { x: 42, etiket: '03' },
      { x: 58, etiket: '04' },
      { x: 75, etiket: '05' },
      { x: 92, etiket: '06' },
    ],
  },
  // ⚠ Kâğıt zeminde gölge DAHA gerekli: açık zeminde kesik bir figürün kenarı zeminle
  // aynı parlaklıkta olabiliyor ve figür "kesilmiş kâğıt" gibi görünüyor.
  gorselIslemleri: ['matlama', 'tema-uyum', 'temas-golgesi'],
  // ⚠ ⚠ **BU YUVALAR BİR EŞLEŞME TESTİNDEN GELDİ.** Katalog `memphis` için slayt başına
  // kesik özne ilan ediyordu; ilk örnek hiç görsel taşımıyordu ve kimse fark etmezdi —
  // koşu görselleri üretir, yerleştirecek yuva bulamaz, sessizce metin-only bir memphis
  // çıkardı. `ornek-3`ün kimliği desen + İNSAN; ikisinden biri eksikse o şablon değil.
  // ⚠ Yuvalar kesimlerin ÜSTÜNDE (6 slaytta kesimler %16,7 · %33,3 · %50 · %66,7 · %83,3).
  gorseller: [
    // ⚠ ⚠ **R-94'ÜN İKİNCİ ŞIKKI: UZAK.** Önceki sürüm üç kesimi de aşıyordu ama yalnız
    // %16–28 ile — araştırmanın *"arada kalan"* dediği yer. `sahne` gibi EZMEK
    // `memphis`i `sahne`ye çevirirdi; bu şablonun kesim taşıyıcısı zaten lekeler.
    // Özneler kendi slaytlarının içine çekildi, iki yakasında da ≥93 px açıklıkla.
    //
    // ⚠ ⚠ **BÜYÜTÜLMEDİ ve bu da ÖLÇEREK anlaşıldı.** Kadraj payı %16'dan %36'ya
    // çıkarıldı; ölçüm ilk kartın gövdesinin **%60'ının** görsel altında kaldığını
    // söyledi (R-84). Sebep geometrik: metin sütunu 800 px, slayt 1080 px — büyüyen
    // özne yatayda kaçacak yer bulamıyor. Özne alt banda hapsolduğu için (y 60, boy 40)
    // eni de o bandın yüksekliğinden türüyor: `contain` ile 432 px.
    // ⚠ Yani `memphis`in öznesi `sahne`ninkinden küçük olmak ZORUNDA ve bu bir kusur
    // değil, iki şablonun farkı: `sahne` tek özneyi kahraman yapıyor, `memphis` üç
    // özneyi altı slayda dağıtıyor.
    // ⚠ `y: 53` — özne rayın ÜSTÜNDE bitiyor, kadraj kenarında değil. 60'ta ayaklar
    // tuvalin alt kenarında kesiliyordu ve ray ayak bileklerinden geçiyordu. 53+40 = %93
    // → 1255 px; ray 1259'da başlıyor. `sahne` ile aynı zemin çizgisi: aile böyle kuruluyor.
    { src: '', alt: 'kesik özne — 1', x: 3, y: 53, genislik: 8, yukseklik: 40, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne — 2', x: 38, y: 53, genislik: 8, yukseklik: 40, kirpma: 'kesik' },
    { src: '', alt: 'kesik özne — 3', x: 70, y: 53, genislik: 8, yukseklik: 40, kirpma: 'kesik' },
  ],
  // ⚠ ⚠ **LEKELER KALDIRILDI (depo sahibi: "şu aptal dairemsi renkli topları kaldır,
  // bunlar web tasarım duruyor").** Referansta (`image copy 4`) gerçekten leke var — ama
  // ORADA DEV, kenardan TAŞIYOR ve fotoğrafın ARKASINDA renk alanı kuruyor. Bizimkiler
  // kadrajın ortasında yüzen küçük konfetiydi: aynı öge, ters iş. Ayrıca hepsi elle
  // kodlanmış şekillerdi, yani R-81'in tam tarifi.
  //
  // ⚠ Kimlik SİLİNMEDİ, YER DEĞİŞTİRDİ: artık kart zeminlerinin RENK ROTASYONU taşıyor.
  // Renk alanı bir kompozisyon kararıdır (alan, sınır, ritim); daire bir süstür.

  kartlar: [
    {
      ustBaslik: 'VARSAYIM',
      baslik: 'Altı soru, **altı** yanlış varsayım',
      govde: 'Her kare bir varsayımı yıkıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit)',
    },
    {
      ustBaslik: 'MALİYET',
      baslik: 'Geri dönüşüm **ücretsiz** mi?',
      govde: 'Toplama, taşıma ve ayrıştırma bir maliyet kalemi; bedava olan yalnız atmak.',
      panel: { tip: 'etiketler', ogeler: ['toplama', 'taşıma', 'ayrıştırma'] },
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      ustBaslik: 'AYRIŞTIRMA',
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
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit)',
    },
    {
      ustBaslik: 'DÖNGÜ',
      baslik: 'Temizlemek **şart** mı?',
      govde: 'Kalıntı, bir sonraki döngüde kokuya ve renk kaybına dönüşüyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      ustBaslik: 'ÖMÜR',
      baslik: 'Sonsuz kez **dönebilir** mi?',
      govde: 'Her döngüde zincir kısalıyor; sınırsız değil, sayılı.',
      panel: {
        tip: 'sayilar',
        ogeler: [
          { deger: '5', birim: 'döngü', alt: 'tipik üst sınır' },
          { deger: '1', birim: 'döngü', alt: 'kirli akışta' },
        ],
      },
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit)',
    },
    {
      ustBaslik: 'YAPILACAK',
      baslik: 'Peki **ne** yapmalı?',
      govde: 'Önce ayrıştır, sonra temizle, sonra ölç. Sıra değişince üçü de boşa gidiyor.',
      panel: { tip: 'etiketler', ogeler: ['ayrıştır', 'temizle', 'ölç'] },
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-ink-950)',
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
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  yerlesim: 'yayik',
  tipografi: {
    baslikPayi: 0.98,
    baslikAgirlik: 700,
    satirAraligi: 1.0,
    harfArasi: -0.02,
    govdeOrani: 0.31,
    // ⚠ 0,7'de üç satırlık başlık daireye giriyordu (1. kartta "tek" çipi dairenin
    // altında kaldı). Sütun daralınca metin ve daire ayrı dikey şeritlerde kalıyor.
    // ⚠ ⚠ **0,40: GERÇEK KOŞUDA METİN FOTOĞRAFA GİRDİ.** Ürün kutusu slaydın %42'sinde
    // başlıyor; %46'lık bir metin kolonu onunla 4 puan çakışıyor ve başlık fotoğrafın
    // altından okunuyordu ("Kağıttaki ka|ğıt"). Yan yana kompozisyonun bedeli bu: iki
    // ögenin sınırı ÖLÇÜLMELİ, göz kararı bırakılmamalı.
    baslikSutunu: 0.4,
    // ⚠ Gövde sütunu başlıktan AYRI (R-86): dar bir başlık tercihi gövdeyi de
    // daraltıyordu ve satır ölçü bandının altına düşüyordu.
    govdeSutunu: 0.86,
  },
  // ⚠ ⚠ **KARTLARIN ÜSTÜNDE DOKU — `donen`in zemini tek katmanlıydı.** Bu şablonun
  // kimliği kart renklerinin DÖNMESİ; kartlar opak olmak zorunda ve panorama zemini
  // onların altında hiç görünmüyor. Sonuç her kartta düz bir renk, yani rehber §10
  // ölçüt 5'in tarif ettiği "web arka planı" — kabul testi bunu kırmızı verdi.
  // Gren + yumuşak vinyet üstte duruyor ve düz rengi yüzeye çeviriyor.
  zemin: 'var(--role-bg)',
  // ⚠ ⚠ **SÜREKLİLİK ARTIK BİR ÖLÇEK ÇİZGİSİ (FAZ-18.3).** Önce iki dev soluk daire
  // taşıyordu — bir ışık havuzu, yani sistemin yasakladığı "atmosferik renk". Ölçek
  // çizgisi panoramayı kat ediyor ve duraklar ÜRÜNLERİN yerinde: silinirse kaybolan şey
  // bir dekor değil, dört ürünün aynı hattın çıktısı olduğu bilgisi.
  bant: {
    tip: 'olcek',
    y: 74,
    aralik: 3.125,
    duraklar: [
      { x: 14.5, etiket: '01' },
      { x: 40.5, etiket: '02' },
      { x: 68.5, etiket: '03' },
      { x: 92.5, etiket: '04' },
    ],
  },
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
  // ⚠ ⚠ **İKİ DEV SOLUK DAİRE EMEKLİ (FAZ-18.3).** Sürekliliği %7 beyaz, 760 px'lik iki
  // yumuşak daire taşıyordu — yani bir IŞIK HAVUZU. Markanın dizayn sistemi "atmosferik
  // renk"i ve glow'u açıkça yasaklıyor; sürekliliği YÜZEY ADIMI + HAIRLINE ile kuruyor.
  // Yerine gelen şey bir süs değil bir ÖLÇÜ: `olcek` bandı panoramayı kat ediyor ve her
  // ürünün altında etiketli bir durak var.
  //
  // ⚠ Podyum diskleri KALDI ama kâğıt beyazı değil YÜZEY ADIMI (#171717): kesik ürünün
  // altında bir tabla duruyor, kadrajda bir projektör lekesi değil.
  // ⚠ ⚠ **PODYUM DİSKLERİ DE EMEKLİ.** Beyaz diskler kâğıt kartlarda DEV KOYU dairelere
  // dönüyordu (çizildi, bakıldı): belge düzeyinde tek renk, kart düzeyinde iki ayrı
  // zemin — aynı öge bir slaytta plaka, ötekinde delik gibi okunuyordu. Ürünü yere
  // basıran şey zaten `temas-golgesi`; ikinci bir tabla kompozisyon değil gürültü.
  // ⚠ Kırpma `kesik`: ürün dairenin dışına taşabilsin — referanstaki hacim hissi bu.
  // ⚠ Her ürün KENDİ slaydında, kesimi aşmıyor: merkezler 17 · 42 · 67 · 92.
  gorseller: [
    // ⚠ ⚠ **ÜRÜN — 3 KESİME TAM OTURUYORDU (x=62 → sağ kenar 3240,0).** Ne aşıyor ne
    // uzak: R-94'ün yasakladığı arada kalma. Yalnız O taşındı (x=59), açıklık 130 px.
    // ⚠ ⚠ **BOYUT BÜYÜTÜLMEDİ ve bu ÖLÇEREK anlaşıldı.** Ürünler %27'den %46'ya
    // çıkarıldı, ölçüm gövdenin **%86'sının** görselin altında kaldığını söyledi (R-84).
    // Bu şablonda ürünün yanında metin yaşıyor: 1080 px'lik slayttan 734 px'i ürüne
    // verilirse metne 346 px kalıyor ve o sütun okunmuyor. Ürünün boyu bir tercih değil,
    // kompozisyonun kendisi — küçük görünmesi kusur DEĞİL, `sahne`den farkı.
    { src: '', alt: 'ürün — 1', x: 8, y: 26, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
    { src: '', alt: 'ürün — 2', x: 34, y: 22, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
    { src: '', alt: 'ürün — 3', x: 59, y: 25, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
    { src: '', alt: 'ürün — 4', x: 86, y: 23, genislik: 13, yukseklik: 54, kirpma: 'kesik' },
  ],
  kartlar: [
    {
      ustBaslik: 'MALZEME',
      baslik: 'Dört malzeme, **tek** hat',
      govde: 'Aynı hat, dört farklı beslemeyle çalışıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-bg)',
    },
    {
      ustBaslik: 'ZEMİN',
      baslik: 'Aynı düzen, **başka** zemin',
      govde: 'Süreklilik rengin dönmesinden geliyor; düzen hiç değişmiyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      ustBaslik: 'RİTİM',
      baslik: 'Ritmi kuran **tekrar**',
      govde: 'Göz üçüncü karede düzeni öğreniyor ve dördüncüyü bekliyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-surface)',
    },
    {
      ustBaslik: 'KAPANIŞ',
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
// ⚠ ⚠ **TON ARALIĞI ÖLÇÜLDÜ ve altı şablonun EN DÜZÜ buydu: p1=157 · p99=235, aralık 78.**
// Referans (`image copy 2`) 0–255 arası gidiyor ve std'si 79; bunun 19. Sebep: kartlar
// OPAK ve hepsi aynı açık tonda, yani panorama dokusu hiç görünmüyor ve kadrajda ne
// gerçek siyah var ne gerçek beyaz. **Bir tasarımın "derin" durması ton aralığından
// geliyor; tek tonda yıkanmış bir kadraj sade değil, SİSLİ.**
// Kart zeminleri artık kâğıt → soluk mavi → açık gri → MÜREKKEP: kapanış kartı gerçek
// siyaha iniyor ve şerit boyunca bir ton yolculuğu kuruluyor.
/**
 * ⚠ ⚠ **BU ŞABLONUN İSKELETİ KASTEN FARKLI: el yazısı YOK, üst başlık YOK.**
 *
 * Ölçüldü: altı şablonun beşi birebir aynı öge envanterini taşıyordu
 * (`elYazisi + ustBaslik + baslik + govde`). Tipografi reçeteleri farklıydı ama
 * KOMPOZİSYON aynıydı — depo sahibinin "yedi tasarım değil tek tasarımın yedi
 * boyası" dediği şey tam buydu ve `birbirinin boyası DEĞİL` testi bunu ölçmüyordu:
 * o yalnız punto/genişlik/ağırlık imzasına bakıyor.
 *
 * Dergi kapağı az ögeyle konuşur: fotoğrafın yanında TEK bir başlık ve kısa bir
 * giriş. Etiket eklemek onu bir sunum slaytına çevirir. → D-312
 */
export const ORNEK_EDITORYAL: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
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
    // ⚠ 0,98 → 1,18: kapakta baslik KAHRAMAN olmak zorunda (FAZ-18.3). Olculdu —
    // kapak basligi kadrajin yalniz %5'ini kapliyordu ve kadraj bos duruyordu.
    baslikPayi: 1.18,
    baslikAgirlik: 500,
    satirAraligi: 1.1,
    harfArasi: -0.02,
    govdeOrani: 0.3,
    // ⚠ 0,6 → 0,46: metin kolonu fotoğrafa yer BIRAKMAK zorunda. Yan yana kompozisyonun
    // tek sert kısıtı bu; kolon geniş kalırsa iki öge üst üste biner ve düzen çöker.
    // ⚠ 0,46 → 0,54: dar kolonda baslik uc satira bolunuyordu ("Sessiz / bir /
    // donusum") ve editoryal ses cirkinlesti. Fotograf kolonuna hala yer var.
    // ⚠ Kolon 0,54 → 0,46: kesimin üstündeki ince fotoğraf şeridi kartın iki kenarında
    // da duruyor (kendi kesiminden gelen + sonrakine giden). Metin ikisinin ARASINDA
    // kalmak zorunda; geniş kolon şeride biniyordu (R-84, ölçüldü: 8 çakışma).
    baslikSutunu: 0.54,
    // ⚠ Gövde sütunu başlıktan AYRI (R-86): dar bir başlık tercihi gövdeyi de
    // daraltıyordu ve satır ölçü bandının altına düşüyordu.
    govdeSutunu: 0.54,
  },
  // ⚠ Açık zemin: kart metni `kartRenkleri` ile zeminden TÜRÜYOR, sabit beyaz değil —
  // bu yüzden zemini açığa çevirmek metni okunmaz yapmıyor (FAZ-15.2 dersi).
  zemin: 'var(--ramp-marka-kagit-0)',
  gorselIslemleri: [],
  bant: { tip: 'yok' },
  // ⚠ Genlik NAZİK (%38–58): bu şablonun sesi sessiz ve keskin bir bölme onu
  // "memphis" yapardı. Sınır yine de her kesimi aşıyor — süreklilik iddiası ölçülüyor.
  alanSiniri: {
    ust: 'var(--role-surface)',
    alt: 'var(--role-kart-acik)',
    noktalar: [
      { x: 0, y: 58 },
      { x: 22, y: 41 },
      { x: 45, y: 56 },
      { x: 68, y: 38 },
      { x: 88, y: 52 },
      { x: 100, y: 44 },
    ],
  },
  // ⚠ ⚠ **GÖRSEL BU ŞABLONDA KESİM TAŞIYICISI DEĞİL — ve bunu bir ÇELİŞKİ gösterdi.**
  // Görselleri kesimlere hizalamayı denedim: her seferinde sonraki kartın metnine
  // girdiler (R-84, 8 çakışma). Sebep geometrik ve çözülemez: yan yana kolon düzeninde
  // fotoğraf kartın KENARINDA duruyor, kesim de kenarda — kesimi aşan bir fotoğraf
  // zorunlu olarak komşu kartın metin kolonuna giriyor.
  //
  // ⚠ Taşıyıcı ALAN SINIRINA geçti: sistemin en güçlü kesim taşıyıcısı (sıfır uzamsal
  // frekans, parçadan bütün zorunlu). Fotoğraflar kartların İÇİNDE kaldı ve kendi
  // işlerini yapıyor. **Her ögeyi kesime zorlamak değil, doğru ögeyi seçmek.**
  //
  // ⚠ Konum kolon düzeninin AYNASI: metin sağdaysa fotoğraf solda. Ortaya alınca ikisi
  // de aynı bandı istedi ve altı çakışma doğdu — düzenin kendisi zaten doğruydu.
  gorseller: [
    // ⚠ **Orta şerit kesime TAM oturuyordu** (x=39 → sağ kenar 2160,0): arada kalma.
    // 36'ya çekildi, kesime 130 px açıklık kaldı. Kenar şeritler zaten uzak.
    { src: '', alt: 'geniş plan', x: 0, y: 0, genislik: 11, yukseklik: 100, kirpma: 'tam' },
    { src: '', alt: 'yakın plan', x: 36, y: 0, genislik: 11, yukseklik: 100, kirpma: 'tam' },
    { src: '', alt: 'kapanış karesi', x: 89, y: 0, genislik: 11, yukseklik: 100, kirpma: 'tam' },
  ],
  kartlar: [
    {
      ustBaslik: '',
      baslik: 'Sessiz bir **dönüşüm**',
      govde: 'Bir hattın değişimi gürültüyle değil, ölçüyle başlıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit)',
      // Fotoğraf bu karede SOLDA; metin karşı yana geçiyor.
      kolon: 'sag',
    },
    {
      ustBaslik: '',
      baslik: 'Boşluk da bir **karar**',
      govde: 'Doldurulmayan alan, gözün dinlendiği yerdir.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      ustBaslik: '',
      baslik: 'Küçük punto **güven** ister',
      govde: 'Bağırmayan bir başlık, okunacağını varsayıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-ink-200)',
      kolon: 'sag',
    },
    {
      ustBaslik: '',
      baslik: 'Ve **kapanış**',
      govde: 'Dört karede tek bir bakış; imza altta duruyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-ink-950)',
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
