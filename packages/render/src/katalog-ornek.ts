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
  // ⚠ ⚠ **KAPAK KİLİDİ DİKEYDE KIRILAMADI — `kavis` ve `memphis` ile ÜÇÜNCÜ kez, AYNI
  // sebeple.** `alt` denendi: gövde köşegen bandın içine düştü (`sus-metni-kesiyor`
  // %4,4 · %2,2 · %2,3; tavan %2). Eğri bandı kadrajın alt %40'ını tutuyor.
  //
  // ⚠ ⚠ **KÖK SEBEP: KAPAK KİLİDİ TAŞIYICI GELENEĞİNİN SONUCU.** On şablonun
  // dokuzunda akış taşıyıcısı — eğri, kemer, kama, ok, kesik özne — kadrajın ALT
  // yarısında duruyor. Metin bu yüzden üstte; "dokuz kapak aynı yerden açılıyor"
  // tembellik değil, taşıyıcı konumunun kaçınılmaz sonucu. Dikey çeşitlilik ancak
  // taşıyıcı da yer değiştirirse gelir (FAZ-19.7 "sürekliliği VERİYE bağla" +
  // FAZ-19.8 görsel briefi). Yatay eksen bu yüzden tek gerçek serbestlik derecesiydi.
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
    // ⚠ ⚠ **0,98 → 1,04: SATIRLAR TÜRKÇE AKSANDA ÇAKIŞIYORDU.** Mürekkep ölçüldü —
    // başlığın iki satırı arasında yalnız **3 px** boş piksel satırı kalıyordu, puntonun
    // (151 px) **%2'si**. Kırpılıp BAKILDI: "çıkan"ın ç kuyruğu alt satırın "bir"ine
    // giriyor.
    // ⚠ KURAL YAZILMADI: bu sayıyı üreten alet SONRADAN kırık çıktı ve iki alet daha
    // denendi, üçü de gözle çelişti. Düzeltme ölçüye değil BAKMAYA dayanıyor.
    // → `docs/kurallar/OLCUMLER.md`
    satirAraligi: 1.18,
    harfArasi: -0.025,
    govdeOrani: 0.27,
    baslikSutunu: 0.88,
    // ⚠ ⚠ **2,1 — VERİ ŞABLONUNDA VERİ %2'YDİ.** Ölçüldü: panel kadrajın %0,9–4,9'unu,
    // hayalet %22–26'sını tutuyordu. Bu şablonun ADI veri hikâyesi; en büyük ögesi
    // dekoratif bir rakam olamaz. Çarpan panelin TAMAMINI büyütüyor, tek tek ögeleri
    // değil: iç oranlar (rehber §3) korunuyor.
    panelPayi: 1.7,
  },
  zemin: 'var(--ramp-palet-gece-taban)',
  // ⚠ YÜZEY AİLESİ — mavi kopya ızgarası (reçete `B`: 60 px, iki eksen eşit). Veri
  // slaydının zemini teknik çizim kâğıdı; ölçüyü taşıyan yüzey ölçülü olmalı.
  yuzey: 'kopya' as const,
  // ⚠ PALET — P5 GECE+MAGENTA — ölçüm aksanı. Köşegen marka mavisiyle çiziliyordu ve markanın geri kalanıyla KARIŞIYORDU: göz onu taşıyıcı değil süs olarak okuyordu.
  aksan: 'var(--ramp-palet-gece-magenta)',
  bant: {
    tip: 'egri',
    // ⚠ ⚠ **EĞRİ KAPAKTA DÜZDÜ — ölçüldü, sonra ÖLÇÜT DÜZELTİLDİ.** İlk ölçüm dikey
    // yolculuğu slayt başına **2 3 3 5 5 3** (% kadraj) buldu ve ailenin öteki çizgi
    // taşıyıcılarını 6–26 gösterdi. Oradan bir taban yazmak YANLIŞ olurdu: o 6–26'nın
    // hepsi `alanSiniri`, yani TAM KADRAJ aygıtı. `egri` dibe yaslı 560 px'lik bir
    // bandın içinde yaşıyor (kadrajın %41'i) ve türünün tek örneği — tek üyeli bir
    // popülasyondan eşik türetilmez.
    // ⚠ Ölçülebilir olan başkaydı: eğri kendi bandının yalnız **%49'unu** kullanıyordu
    // (y 78→29). Genlik 88→16'ya açıldı: aynı band, aynı hikâye, %72 kullanım.
    // ⚠ Dağılım da düzeldi. Eskisi güçlü DIŞBÜKEYDİ — sonda ivmelenen bir büyüme
    // çiziyordu, oysa başlık *"altı yılda İKİ KATINA çıkan"* diyor; sabit oranlı bir
    // ikiye katlanma yaklaşık düz bir yükseliştir. Yeni dağılım hem her slaytta yön
    // veriyor hem iddiaya daha SADIK.
    // ⚠ ⚠ **88'DE BAŞLAMAK ÇOK DİPTİ ve bunu SAYI DEĞİL GÖZ buldu.** Genlik açılınca
    // eğrinin sol ucu pul sırasına indi ve çizgi "2023" ile "2025" etiketlerinin İÇİNDEN
    // geçti. Denetim sessizdi ve sebebi ölçüldü: `METIN_KUTULARI` yalnız başlık/gövde/üst
    // etiketi tanıyordu, pulları hiç. Kapı genişletildi ve **kendi düzeltmemi yakaladı**.
    // ⚠ 80 de yetmedi: pullar y 1092–1160, eğri o aralıkta 1114'e iniyordu (%2,6 kesişme).
    // ⚠ ARADAKİ ÖLÇÜM YANLIŞ ÖGEYİ OKUDU: `.kilometre` kutuları 144 px açıklık gösterdi
    // ve temiz sanıldı — oysa kapaktaki pullar `.etiketler` ögesi, başka bir şey.
    // Aynı ders bu turda üçüncü kez: alet, ölçtüğünü sandığı şeyi ölçmüyor.
    // 70'te sol uç 1062'ye çıkıyor, pul sırasının 30 px üstünde.
    // ⚠ ⚠ **GEOMETRİ İDDİANIN KANITI OLMAK ZORUNDA — ve DEĞİLDİ.** Başlık *"Altı yılda
    // İKİ KATINA çıkan bir eğri"* diyor. Eğrinin taşıdığı değer taban çizgisinden
    // yükseklik, yani `100 − y`. Eski noktalar: 30 → 96, oran **3,2×**. Yani tipografi
    // "iki kat" derken geometri "üç kat" çiziyordu. Denetimin `veri-hikayesi` için
    // yazdığı şey tam buydu: *"grafik başlığı YALANLIYOR — bu zevk değil ARGÜMAN hatası."*
    // Yeni noktalar 45 → 90, oran **tam 2,0×**. Kilitli: `veri-egrisi.test.ts`.
    noktalar: [
      { x: 0, y: 55 },
      { x: 18, y: 50 },
      { x: 36, y: 44 },
      { x: 54, y: 37 },
      // ⚠ ⚠ **SUREKLI OGE KAPANIS KARTINDA BITER, ONU KAT ETMEZ.** Denetimin kapanis
      // tarifi: *"y %0-28 Varis. Surekli oge burada BITER."* Egri 100'e kadar surunce
      // yukselen alan siniri son kartin ORTASINDAN geciyordu: dev rakam iki tonun
      // arasinda ikiye bolunuyor ve kilometre etiketi '2025' rakamin uzerine dusuyordu.
      // Depo sahibi bakti ve "son sayfalardaki buyuk sayilar cok kotu duruyor" dedi.
      // Alti slaytin sonuncusu x %83'te basliyor; egri orada duruyor.
      { x: 72, y: 28 },
      // ⚠ ⚠ **IDDIA VARISTA TAMAMLANIYOR.** veri-egrisi kapisi "baslik iki katina diyor,
      // egri de IKI KAT yukselmeli" istiyor (deger = 100-y, yani 45 -> 90). Once egriyi
      // yumusattim ve kapi HAKLI OLARAK kirmizi dondu: 1,6x kaldi ve tipografi
      // geometriyi yalanladi. Dogru cozum egriyi kisaltmak degil, ONU SON KARTIN
      // BASINDA BITIRMEK — iddia tam varista tamamlaniyor ve kapanis karti temiz kaliyor.
      { x: 83, y: 10 },
    ],
    kilometre: [
      { x: 18, etiket: '2020' },
      { x: 54, etiket: '2023' },
      { x: 78, etiket: '2025' },
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
      // ⚠ ⚠ **YIL HAPLARI BIR LEJANTTI, GUZERGAH DEGIL.** Denetim: bu sira bir UI
      // filtre cipi gibi duruyor, eğriye DEGMIYOR. Olculdu: haplar ustten %67,3-71,5'te,
      // egri o x'te ~%79 — sekiz puan havada. Ama asil kusur konum degil ICERIKTI:
      // yillari zaten egrinin kilometre isaretleri tasiyor (2020 · 2023 · 2025), yani
      // ayni bilgi iki kez yaziliyordu. → R-111 (sus metni slaytta zaten yazani
      // tekrarlayamaz). Govde "her durakta bir karar var" diyor; haplar artik O
      // DURAKLAR — ortadaki dort kartin adlari. Kapak bir icindekiler oldu.
      panel: {
        tip: 'etiketler',
        ogeler: ['BAŞLANGIÇ', 'KIRILMA', 'YAYILMA', 'BUGÜN'],
      },
      hayalet: '',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
    },
    {
      kolon: 'orta',
      ustBaslik: 'BAŞLANGIÇ',
      baslik: 'Sorun hacim değil, ayrıştırma',
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
      aksanRolu: 'yok' as const,
      ustBaslik: 'KIRILMA',
      baslik: 'Tek bir hat değişikliği eğriyi büktü',
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
      kolon: 'orta',
      ustBaslik: 'YAYILMA',
      baslik: 'Aynı yöntem dört tesise taşındı',
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
      baslik: 'Eğrinin ucu artık tahmin, ölçüm değil',
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
      kolon: 'orta',
      ustBaslik: 'SONRAKİ',
      baslik: 'Sıradaki eşik **kalite**, hacim değil',
      govde: 'Aynı eğri devam ederse sınırı belirleyen şey pazar değil, saflık olacak.',
      // ⚠ ⚠ **KAPANIS KARTI PANO TASIMAZ.** Depo sahibi bakti ve soyledi:
      // *"son sayfalardaki buyuk sayilar cok kotu duruyorlar."* Olculdu ve sebep
      // tam olarak buydu: bu kart hem normal bir icerik panosunu hem de kapanis
      // jestini (dev rakam + okuma satiri + imza + cagri) tasiyordu ve icerigin dibi
      // kartin ALT KENARINI ASIYORDU — veri-hikayesi'nde **%103,2**. Rakam kesildi,
      // kunye seridine bindi, tasarlanmis degil BOZUK gorundu.
      // Denetimin kapanis tarifi zaten bunu soyluyordu: *"Kapanis iskeleti kullanmaz,
      // KIRAR. Serit yok, uc satir baslik yok, ALT PANO YOK."* Bes destede ihlal.
      panel: null,
      hayalet: '',
      // ⚠ ⚠ **KAPANISTA TON KIRILIR ve SUREKLI OGE ORADA BITER.** Denetimin kapanis
      // tarifi: *"Ton kirilmasi tam bu karede: parmak kaydirinca ton degisir, fiziksel
      // 'vardik'."* Bu kart kendi zeminini OPAK boyayinca yukselen alan siniri ve onun
      // kilometre etiketleri kartin ustunden GECMIYOR — olculdu: etiket '2025' tam dev
      // rakamin uzerine dusuyordu ve rakam iki tonun arasinda ikiye BOLUNMUS gorunuyordu.
      // donen'in kapanisi bunu zaten yapiyordu (zemin: role-line-edge) ve tek duzgun
      // duran kapanis oydu.
      zemin: 'var(--ramp-palet-gece-yuzey)',
      rayaSol: 'GERİ KAZANIM',
      rayaOrta: ORNEK,
      kapanis: {
        rakam: '2,0×',
        rakamAlt: 'ÜÇ YILDA EĞRİ',
        cagri: 'Sıradaki eşiği **birlikte** koyalım.',
      },
    },
  ],
}

/**
 * **akan-alan** — iki renk alanı, panoramayı kat eden eğri sınır.
 *
 * ⚠ Sınır YATAY ve tek bir yol; slayt başına çizilseydi kesimde kırılırdı (panorama.ts).
 * ⚠ ⚠ **BAŞLIK "dev hayalet rakam" DİYORDU ve o öge yirmi satır aşağıda KALDIRILMIŞTI
 * (D-299).** Kartlar üst alanda duruyor; sürekliliği KESİNTİSİZ SINIR taşıyor, tek
 * kanal. Bir şablonun başlığı onda olmayan bir ögeyi kimlik sayarsa, sonraki okuyan onu
 * arar ve bulamaz — bu depoda tam olarak bu oldu. → R-110
 * ⚠ Tipografi GENİŞ (`wdth 104`) — `veri-hikayesi`nin dar sesinin karşıtı.
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
    satirAraligi: 1.18,
    harfArasi: -0.015,
    govdeOrani: 0.3,
    baslikSutunu: 0.82,
  },
  zemin: 'var(--ramp-palet-murekkep-taban)',
  // ⚠ PALET — P1 MÜREKKEP+MAVİ — mavi burada ÖZNE. Zemin de mavi kroma taşıyor (0,101), yani iki alan arasındaki fark artık RENKTE de var, yalnız açıklıkta değil.
  aksan: 'var(--ramp-palet-murekkep-mavi)',
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
  // ⚠ ⚠ **İKİ ALAN AYIRT EDİLEMİYORDU.** `role-bg` (L 0,16) ile `role-line-edge`
  // (L 0,19) arasında **ΔL 0,03** var — kimliği "iki renk alanı" olan bir şablonun iki
  // alanı aynı renkti. Yakın-monokrom palet (D-318) adımı sessiz tutuyor ama SIFIR
  // tutmuyor: rampanın uçları `ink-1000` (0,105) ve `ink-850` (0,270), ΔL **0,165**.
  // Hâlâ sakin, artık görünür. Sınırdaki hairline de aynı sebeple eklendi.
  alanSiniri: {
    ust: 'var(--ramp-marka-ink-1000)',
    // ⚠ ⚠ **`ink-850` ÖLÇÜLDÜ ve YETMİYORDU: `#2b2b2b` / `#121212` = 1,32:1.** R-87'nin
    // algısal eşiği 1,6:1. Ölçüm defteri ΔL 0,165 diye kaydetmişti ve o doğruydu —
    // token uzayında büyük olan fark, KONTRAST ORANINDA küçük. **İki farklı birim,
    // biri ötekini garanti etmiyor.** `ink-650` (oklch 0.485) adımı gerçekten görünür
    // kılıyor; nötr rampanın gölgede ara adımı yok, o eksik FAZ-19.6'nın işi.
    // ⚠ ⚠ **ARTIK PALETİN İÇİNDE.** `ink-650` nötr griydi: kontrastı taşıyordu (3,07:1)
    // ama `akan-alan` P1'e (mürekkep+mavi) geçtikten sonra dökme alan gri kalıyordu —
    // palet dışı bir yüzey. Reçetenin verdiği taban/yüzey çifti denendi ve ÖLÇÜLDÜ:
    // **1,18:1**, yani reçetenin kendi ≥1,6:1 şartını SAĞLAMIYOR. `murekkep-alan`
    // (üçüncü adım) 1,77:1 veriyor: hem mavi hem görünür.
    alt: 'var(--ramp-palet-murekkep-alan)',
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
      // DALGA KAPANISTA DINLENIYOR — olculdu ve BAKILDI: son kartta alan siniri
      // y=45'ten y=72'ye tirmaniyordu, yani ustten %55'ten %28'e; dev rakam ustten
      // %47-68'de duruyor ve tam ustunde kaliyordu, iki tonun arasinda ikiye
      // bolunuyordu. Ayni sinif kusur veri-hikayesi'nde vardi ve orada EGRI son kartin
      // basinda bitirilerek cozulmustu. Burada tasiyici bir CIZGI degil bir ZEMIN;
      // bitirilemez, DUZLESTIRILIR. x=83 son kartin basi; y=45 dalganin O NOKTADAKI
      // dogal degeri, yani sinir kirilmiyor sadece DEGISMEYI birakiyor. Once y=20
      // denendi: alan son iki kari BASTI ve 5. kartin gri govdesi mavinin ustunde
      // kaldi. Cizip BAKMASAM gecerdi.
      { x: 83, y: 45 },
      { x: 83.3333, y: 40 },
      { x: 100, y: 40 },
    ],
  },
  bant: { tip: 'yok' },
  gorseller: [],
  // ⚠ ⚠ **"BES SART" DENIYORDU, 01-05 HICBIR YERDE YOKTU.** Denetim: *"alti karede
  // SIFIR bilgi ogesi; 'bes sart' deniyor, 01-05 hicbir yerde yok."* Ve bes kart
  // ZATEN o bes sart — eksik olan sey icerik degil SAYIM. Ust etiketler artik sirayi
  // tasiyor: kapak "bes" diyor, sonraki bes kart 01'den 05'e sayiyor ve iddia
  // kaydirilarak DOGRULANIYOR.
  // ⚠ Pano EKLENMEDI: recete bu sablon icin panosuzlugu ACIKCA onayliyor
  // (*"Gorsel YOK — bu sablon saf tipografi + alan. Bugun de oyle; dogru olan bu"*).
  kartlar: [
    {
      // ⚠ KAPAK KİLİDİ — eğri sınırı 01'de y=%78'den başlıyor, yani KÜTLE sol-altta.
      // Metin sağa geçince kadraj iki kütleye bölünüyor ve giriş noktası ayrışıyor.
      kolon: 'sag' as const,
      ustBaslik: 'DÖNGÜSELLİK',
      baslik: 'Bir hattı **döngüsel** yapan beş şart',
      govde: 'Beşi de olmadan döngü kapanmıyor; biri eksikse sistem doğrusal kalıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      dikey: 'ust' as const,
      ustBaslik: '01 · İZLENEBİLİRLİK',
      baslik: 'Girdi izlenebilir olacak',
      govde: 'Nereden geldiği bilinmeyen malzeme, nereye gittiği bilinmeyen atıktır.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      kolon: 'orta',
      dikey: 'orta' as const,
      ustBaslik: '02 · AYRIŞTIRMA',
      baslik: 'Ayrıştırma kaynakta başlayacak',
      govde: 'Sonradan ayrıştırma her adımda pahalılaşıyor ve saflığı düşürüyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      dikey: 'alt' as const,
      aksanRolu: 'yok' as const,
      ustBaslik: '03 · ÖLÇÜM',
      baslik: 'Ölçülmeyen kalite, varsayılandır',
      govde: 'Ölçülmeyen saflık satışta ortaya çıkıyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      kolon: 'orta',
      dikey: 'orta' as const,
      ustBaslik: '04 · ALICI',
      baslik: 'Çıktının bir alıcısı olacak',
      govde: 'Alıcısı olmayan geri kazanım, ertelenmiş bir depolama.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
    },
    {
      dikey: 'ust' as const,
      ustBaslik: '05 · FİNANS',
      baslik: 'Döngü **kendini finanse** edecek',
      govde: 'Sübvansiyonla dönen döngü, sübvansiyon bitince durur.',
      panel: null,
      hayalet: '',
      rayaSol: 'DÖNGÜSELLİK',
      rayaOrta: ORNEK,
      kapanis: { rakam: '00', rakamAlt: 'SÜBVANSİYON', cagri: 'Döngüyü **birlikte** kuralım.' },
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
    satirAraligi: 1.18,
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
  zemin: 'var(--ramp-palet-murekkep-taban)',
  // ⚠ PALET — P1 — neredeyse tek renk; mavi yalnız bir kelimede. Nesne kahraman, renk sessiz.
  aksan: 'var(--ramp-palet-murekkep-mavi)',
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
    // ⚠ ⚠ **YAYLAR KALDIRILDI — GÖRSELİN %10'UNU KESİYORLARDI.** Depo sahibi çıktıya
    // bakıp gördü, ölçüm doğruladı: üç yayın ikisi kesik öznelerin üstünden geçiyor,
    // her birinde **772×125 px**. Eski gerekçe yalnız *"metnin üstünden geçmiyor"*
    // diyordu; GÖRSELİN üstünden geçip geçmediği hiç sorulmamıştı — ve denetimde de
    // karşılığı yok (`sus-metni-kesiyor` yalnız METNİ arıyor).
    // ⚠ Süreklilik KAYBOLMUYOR, TEKLEŞİYOR: bu şablonun taşıyıcısı zaten kesimi EZEN
    // kesik özne (R-94'ün birinci şıkkı) ve `dikis-bandinda` onu ölçüyor. İkinci bir
    // kanal birinciyi kesiyorsa, kanal değil gürültüdür.
    // ⚠ Bu şablonda İKİNCİ kez oluyor: nüfus karoselinde oklar başlıkların ortasından
    // geçince silinmişti. O zaman metni kesiyorlardı, bu kez özneyi.
    //
    // ⚠ ⚠ **YERİNE ZEMİN ÇİZGİSİ — ve bunu KAPI dayattı, ben değil.** Yaylar kalkınca
    // `kesintisizlik-yok` ortadaki kesimin (x=2160) taşıyıcısız kaldığını söyledi: iki
    // görsel üç kesimin ancak ikisini kapatıyor, üçüncüsünü yaylar taşıyormuş.
    // *"Süreklilik tekleşiyor"* derken fazla emin konuşmuşum; R-87 düzeltti.
    // ⚠ Ölçek çizgisi öznenin ÜSTÜNDEN geçmiyor, ALTINDAN geçiyor: y 93, yani kesik
    // öznelerin ayak hizası (görseller y%13–93 arasında duruyor). Aynı aygıt `memphis`te
    // de zemin çizgisi ve o şablonun notu bunu zaten söylüyordu: *"`sahne` ile aynı
    // zemin çizgisi: aile böyle kuruluyor."*
    // ⚠ Duraklar dört slaydı numaralıyor; kesimler %25/%50/%75'te, duraklar onların
    // ARASINDA — durak bir kesime denk gelirse ölçü değil süs olur.
    tip: 'olcek',
    y: 93,
    aralik: 6.25,
    duraklar: [
      { x: 12, etiket: '01' },
      { x: 37, etiket: '02' },
      { x: 62, etiket: '03' },
      { x: 87, etiket: '04' },
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
      aksanRolu: 'alan' as const,
      aksanDibi: 49,
      ustBaslik: 'SORUN',
      baslik: 'Önce sorun duruyor',
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
      baslik: 'Sonra bir ölçü koyuluyor',
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
      // ⚠ ⚠ **KAPANIŞ MEKANİZMASI KODDA VARDI ve KATALOGDA SIFIR ÇAĞIRANI.** Tip,
      // işaretleme ve CSS `panorama.ts`te duruyordu; on şablonun hiçbiri kullanmıyordu.
      // Bu depoda on birinci kez aynı sınıf: modül yazılır, testi yeşildir, üretim
      // yolunda çağıranı olmaz (D-182 · D-190 · D-224 · D-250 · D-261 · D-270 · D-347).
      // ⚠ Ölçüldü: `sahne`nin son karesi destenin en boş karesi — mürekkep **%2,2**.
      // Karoselin tepe yapması gereken yerde sistem düz çiziyor.
      kapanis: {
        rakam: '03',
        rakamAlt: 'ADIMDA KARAR',
        cagri: 'Ölçüyü **birlikte** koyalım.',
      },
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
  // ⚠ ⚠ **KAPAK KİLİDİ DİKEYDE KIRILAMADI — `kavis`le AYNI SEBEP.** `orta` denendi:
  // gövdenin **%63'ü** kesik öznenin üstüne düştü (`metin-gorsel-cakisiyor`, ayrıca
  // başlık %13 ve ikinci bir gövde %31). Kesik özne kadrajın alt-ortasını tutuyor;
  // metnin üstte olması bir alışkanlık değil, formun kendisi. **Yerleşim çeşitliliğinin
  // sınırını İÇERİK çiziyor** — bu şablonun girişi ancak görsel briefi değişirse
  // (FAZ-19.8) yer değiştirebilir.
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 0.98,
    baslikAgirlik: 500,
    // ⚠ RECETE B: memphis basligi GENISLETILMIS ve oyuncu (Anybody wdth 125).
    // Archivo'nun ekseni 125'e cikiyor; ayri bir aile kurmadan ayni jest.
    // ⚠ Genisleyen yon DARALAN yonden guvenli: baslik daha cok satira yayiliyor,
    // yani olu bant ACILMIYOR kapaniyor. Daralan yon karsilastirma'da olculdu ve
    // 80'in altinda bir satir kaybedip bant actigi icin 88'de durduruldu.
    baslikGenislik: 125,
    satirAraligi: 1.18,
    harfArasi: -0.01,
    govdeOrani: 0.34,
    baslikSutunu: 0.8,
    // ⚠ 1,7: `memphis` panelleri veri değil RİTİM taşıyor (etiket, liste); veri
    // şablonu kadar büyümeleri gerekmiyor ama web ölçüsünde de kalamazlar.
    panelPayi: 1.7,
  },
  // ⚠ PALET — recete A tablosu. Bes palet token'a girmisti ama UC sablon sistemin
  // DISINDA kaliyordu (--role-* ile ciziliyorlardi): memphis, donen, editoryal.
  // ⚠ memphis = P3 KAGIT + P4 BETON: uc murekkep riso (oksit, amber, murekkep), MAVI YOK.
  // Aile garantisi matematiksel: bes palette accent hue'su sabit 262.
  zemin: 'var(--ramp-palet-kagit-taban)',
  aksan: 'var(--ramp-palet-kagit-oksit)',
  // ⚠ YÜZEY AİLESİ — parlak kâğıt + gazete tramı — riso baskının imzası.
  yuzey: 'halftone' as const,
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
    // değil, iki şablonun farkı: `sahne` tek özneyi kahraman yapıyor, `memphis` özneyi
    // her slayda dağıtıyor.
    // ⚠ `y: 53` — özne rayın ÜSTÜNDE bitiyor, kadraj kenarında değil. 60'ta ayaklar
    // tuvalin alt kenarında kesiliyordu ve ray ayak bileklerinden geçiyordu. 53+40 = %93
    // → 1255 px; ray 1259'da başlıyor. `sahne` ile aynı zemin çizgisi: aile böyle kuruluyor.
    //
    // ⚠ ⚠ **ÜÇ → ALTI ve bu bir GÖZ bulgusuydu, sonra iki kez ölçüldü.** Üç yuva altı
    // slayda dağılınca özneler 1., 3. ve 5. slayda düşüyordu; 2., 4. ve 6. slaytta metin
    // üstte bitiyor ve ALTINDA hiçbir şey kalmıyordu. Dördüncü slaydın **%53'ü** iki
    // içerik arasında ölü bir kuşaktı — ailenin en kötüsü.
    // ⚠ İlk ölçüm bunu GÖRMEDİ: kutu ölçümü `.gorsel` YUVASINI okuyordu ve kesik PNG'nin
    // saydam kenar payını dolu sayıyordu. Aynı iki şablona kutu ölçümü ile mürekkep
    // ölçümü TERS cevap verdi (`akan-alan` en kötü ↔ en iyi). Göz mürekkebe bakıyor.
    // ⚠ Asıl kusur sayı değil SÖZLEŞMEYDİ: katalog `adet: 'slayt-basina'` ilan ediyor,
    // örnek yarısını veriyordu — ve bunu hiçbir kapı ölçmüyordu. → R-110
    // ⚠ Her yuva kendi slaydının ORTASINDA: slayt payı %16,667, yuva %8, iki yakada
    // %4,33 = 281 px açıklık — R-94'ün "uzak" şıkkı için gereken 93 px'in üç katı.
    // ⚠ ⚠ **BEŞ GÖRSELİN BEŞİ DE AYNI y'DEYDİ, AYNI BOYDA, EŞİT ARALIKTA.** `x` farkları
    // tam 16,67 ve `y` beşinde de 53. Serpilme YOKTU — bu, tam olarak depo sahibinin
    // *"kutucuklar html css gibi"* dediği ızgara ve `kavis`in on üç özdeş kemeriyle aynı
    // sınıf kusur. Ölçüldü: kart 4'ün ölü bandı %27 (destenin en uzunu) ve gövde y%26'da
    // bitip görsel y%53'te başlıyordu.
    // ⚠ ⚠ **KUTU ORANI KAYNAĞIN ORANINDAN TÜRÜYOR — `sahne`de ÖLÇÜLMÜŞ tuzak.** Sağlayıcı
    // 4:5 üretiyor (oran 0,80); `contain` kutuyu doldurmuyor, kutunun İÇİNE sığdırıyor.
    // Yüksekliği artırıp genişliği sabit bırakmak kutunun altını BOŞ bırakırdı — `sahne`de
    // 405 px ölçülmüştü. Her yuvanın genişliği kendi yüksekliğinden hesaplandı:
    //   en% = (yuk% × 1440 × 0,80) / 6480 × 100
    // ⚠ Yatayda çakışma yok: yuvalar 16,67 aralıkta, en geniş yuva %10,7.
    {
      src: '',
      alt: 'kesik özne — 1',
      x: 4.33,
      y: 54,
      genislik: 6.9,
      yukseklik: 39,
      kirpma: 'kesik',
    },
    { src: '', alt: 'kesik özne — 2', x: 21, y: 49, genislik: 7.8, yukseklik: 44, kirpma: 'kesik' },
    {
      src: '',
      alt: 'kesik özne — 3',
      x: 37.67,
      y: 45,
      genislik: 8.5,
      yukseklik: 48,
      kirpma: 'kesik',
    },
    {
      src: '',
      alt: 'kesik özne — 4',
      x: 54.33,
      y: 44,
      genislik: 8.7,
      yukseklik: 49,
      kirpma: 'kesik',
    },
    { src: '', alt: 'kesik özne — 5', x: 71, y: 47, genislik: 8.2, yukseklik: 46, kirpma: 'kesik' },
    // ⚠ Altıncı görsel KALDIRILDI — kapanış kartı fotoğraf taşımaz (aşağıda `donen`).
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
      kolon: 'orta',
      ustBaslik: 'MALİYET',
      baslik: 'Geri dönüşüm ücretsiz mi?',
      govde: 'Toplama, taşıma ve ayrıştırma bir maliyet kalemi; bedava olan yalnız atmak.',
      panel: { tip: 'etiketler', ogeler: ['toplama', 'taşıma', 'ayrıştırma'] },
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      kolon: 'sag',
      ustBaslik: 'AYRIŞTIRMA',
      baslik: 'Her plastik aynı mı?',
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
      aksanRolu: 'yok' as const,
      ustBaslik: 'DÖNGÜ',
      baslik: 'Temizlemek şart mı?',
      govde: 'Kalıntı, bir sonraki döngüde kokuya ve renk kaybına dönüşüyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      kolon: 'orta',
      ustBaslik: 'ÖMÜR',
      baslik: 'Sonsuz kez dönebilir mi?',
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
      // ⚠ ⚠ **KAPANIS KARTI PANO TASIMAZ.** Depo sahibi bakti ve soyledi:
      // *"son sayfalardaki buyuk sayilar cok kotu duruyorlar."* Olculdu ve sebep
      // tam olarak buydu: bu kart hem normal bir icerik panosunu hem de kapanis
      // jestini (dev rakam + okuma satiri + imza + cagri) tasiyordu ve icerigin dibi
      // kartin ALT KENARINI ASIYORDU — veri-hikayesi'nde **%103,2**. Rakam kesildi,
      // kunye seridine bindi, tasarlanmis degil BOZUK gorundu.
      // Denetimin kapanis tarifi zaten bunu soyluyordu: *"Kapanis iskeleti kullanmaz,
      // KIRAR. Serit yok, uc satir baslik yok, ALT PANO YOK."* Bes destede ihlal.
      panel: null,
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-ink-950)',
      kapanis: { rakam: '03', rakamAlt: 'ADIMDA SIRA', cagri: 'Sırayı **birlikte** kuralım.' },
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
    satirAraligi: 1.18,
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
  // ⚠ PALET — recete A tablosu. Bes palet token'a girmisti ama UC sablon sistemin
  // DISINDA kaliyordu (--role-* ile ciziliyorlardi): memphis, donen, editoryal.
  // ⚠ donen = P1 MUREKKEP ile P3 KAGIT gecisli; gecis slayt MERKEZINDE, kesimde DEGIL.
  // Aile garantisi matematiksel: bes palette accent hue'su sabit 262.
  zemin: 'var(--ramp-palet-murekkep-taban)',
  aksan: 'var(--ramp-palet-murekkep-mavi)',
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
    // ⚠ ⚠ **DÖRDÜNCÜ GÖRSEL KALDIRILDI — KAPANIŞ KARTI FOTOĞRAF TAŞIMAZ.** Varış
    // tipografiktir: rakam, tek iddia, imza, tek eylem. Kapanış gövdeyi yukarı itiyor
    // (rakama yer açmak için) ve gövde tam o yükseklikteki görselin ÜSTÜNE bindi —
    // `metin-gorsel-cakisiyor` "gövdenin %47'si görselin üstünde" dedi.
    // ⚠ Önce metin kolonunu görsele kadar DARALTMAK denendi ve DAHA KÖTÜ oldu: `memphis`te
    // gövde dört satıra sardı ve kart TAŞTI, çağrı rayın altında kesildi. Çizilene
    // bakılınca görüldü. Fotoğraf rakamla aynı karede yarışıyor — biri gidecekti.
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
      kolon: 'orta',
      ustBaslik: 'ZEMİN',
      baslik: 'Aynı düzen, başka zemin',
      govde: 'Süreklilik rengin dönmesinden geliyor; düzen hiç değişmiyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      // ⚠ ⚠ **BURASI 'sag' YAZILDI VE UYARLAMA PROVASI YAKALADI.** Slayt rollerini
      // dagitirken bu karta korlemesine `sag` verdim; `duzen-provasi` gercek kosuda
      // *"kart 3 · metin-zemine-karisiyor"* dedi. Sebep: bu sablonun donen figuru
      // kadrajin SAG yanini dolduruyor ve metin oraya gecince zemine karisiyor. Ders
      // bu depoda zaten yaziliydi (sablon-uyarla.ts: *metnin yatay yeri oznenin KARSI
      // yani demek*) ama ben rolleri desteye bakmadan, ritme bakarak dagittim.
      // ⚠ Ritim yine bozulmuyor: sol · orta · sol · orta, art arda tekrar YOK.
      kolon: 'sol',
      aksanRolu: 'yok' as const,
      ustBaslik: 'RİTİM',
      baslik: 'Ritmi kuran tekrar',
      govde: 'Göz üçüncü karede düzeni öğreniyor ve dördüncüyü bekliyor.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-surface)',
    },
    {
      kolon: 'orta',
      ustBaslik: 'KAPANIŞ',
      baslik: 'Kapanış **koyu** gelir',
      govde: 'Son kare diziyi kapatıyor: aynı düzen, en yüksek kontrast.',
      panel: null,
      hayalet: '',
      rayaSol: 'ÜRÜN',
      rayaOrta: ORNEK,
      zemin: 'var(--role-line-edge)',
      kapanis: { rakam: '360°', rakamAlt: 'TAM DÖNÜŞ', cagri: 'Düzeni **birlikte** kapatalım.' },
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
    satirAraligi: 1.18,
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
  // ⚠ PALET — recete A tablosu. Bes palet token'a girmisti ama UC sablon sistemin
  // DISINDA kaliyordu (--role-* ile ciziliyorlardi): memphis, donen, editoryal.
  // ⚠ editoryal = P3 KAGIT: bu sablon MAVIDEN CIKISIN kaniti, tek aksan oksit.
  // Aile garantisi matematiksel: bes palette accent hue'su sabit 262.
  zemin: 'var(--ramp-palet-kagit-taban)',
  aksan: 'var(--ramp-palet-kagit-oksit)',
  // ⚠ YÜZEY AİLESİ — sıcak kâğıt: ince lif + uzun dalga leke. Katalog zaten "kâğıt" diyordu.
  yuzey: 'kagit' as const,
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
      { x: 75, y: 40 },
      { x: 100, y: 40 },
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
    // ⚠ ⚠ **`100` DEĞİL `93`: şerit KROM BANDINDA duruyor, onun içinde değil (R-97).**
    // Tam boy şeritte ayakkabının siyah konturları rayın altına giriyordu; ortalama
    // kontrast yeterliydi ama ölçüm zeminin **%8**'inin medyandan 60'tan fazla saptığını
    // söyledi — `UPCYTECH · SAHA · ÖRNEK VERİ` çizgilerin içinde yüzüyordu.
    // ⚠ 93 × 1350 = 1255 px; ray 1259'da başlıyor. Aynı zemin çizgisi altı şablonda da
    // geçerli: ortak bir taban, altı ayrı tasarımı tek sayfanın parçası yapıyor.
    // ⚠ ⚠ **ŞERİT 11 → 10 ve ORTA ŞERİT SAĞA KAYDI — GERÇEK GÖRSELLE ölçüldü.** Yer
    // tutucuyla bakarken görünmüyordu: ikinci kartta başlık 1144–1599, görsel 1555–2030,
    // yani **44 px** çakışma. `metin-gorsel-cakisiyor` eşiği (%12) altında kaldığı için
    // sessizdi; R-105 zeminin **%7'sinin** metin lumasına yakın olduğunu söyledi.
    // ⚠ Slaytın matematiği dar: 1080 px'e 432 şerit + 455 metin sütunu + 64 dolgu + 93
    // dikiş açıklığı sığıyor, 11'lik şeritle sığmıyordu. Şeridi kısaltmak metni daraltmaktan
    // iyi — `editoryal`in ölçüsü zaten ailenin en darı (R-86 alt sınırı koşullu).
    { src: '', alt: 'geniş plan', x: 0, y: 0, genislik: 10, yukseklik: 93, kirpma: 'tam' },
    { src: '', alt: 'yakın plan', x: 37.7, y: 0, genislik: 10, yukseklik: 93, kirpma: 'tam' },
    { src: '', alt: 'kapanış karesi', x: 90, y: 0, genislik: 10, yukseklik: 93, kirpma: 'tam' },
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
      baslik: 'Boşluk da bir karar',
      govde: 'Doldurulmayan alan, gözün dinlendiği yerdir.',
      panel: null,
      hayalet: '',
      rayaSol: 'SAHA',
      rayaOrta: ORNEK,
      zemin: 'var(--ramp-marka-kagit-0)',
    },
    {
      aksanRolu: 'yok' as const,
      ustBaslik: '',
      baslik: 'Küçük punto güven ister',
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
      kapanis: { rakam: '01', rakamAlt: 'TEK BAKIŞ', cagri: 'Bakışı **birlikte** yazalım.' },
    },
  ],
}

/**
 * **kavis** — kemer dizisi; ailenin GEOMETRİ öncülü üyesi.
 *
 * ⚠ ⚠ **`kemer` TAŞIYICISI MODELDE VARDI, HİÇBİR ŞABLON KULLANMIYORDU.** Yani destek
 * yazılmış, testi yeşil, üretim yolu yok — bu deponun tekrar eden kopukluğu, bu kez bir
 * TASARIM aracında. Araştırma sıralamasında *"büyük geometrik form"* üçüncü en güçlü
 * taşıyıcı: silueti tanınabilir, yarısı formu belirliyor.
 *
 * ⚠ Görselsiz. Mevcut altı şablonun beşi görsele dayanıyor; aile geometriyle ve
 * tipografiyle taşıyan üyelere muhtaç — hem çeşitlilik hem de sağlayıcısız koşuda
 * üretilebilen bir çıktı için.
 *
 * ⚠ Tipografi ailenin EN SIKI reçetesi: 800 ağırlık, −0,04 harf arası, 0,72 sütun. Dar ve
 * uzun bir başlık bloğu, geniş kemerin karşı ağırlığı.
 */
export const ORNEK_KAVIS: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  // ⚠ ⚠ **KAPAK KİLİDİ ÖLÇÜLDÜ: on kapağın DOKUZU %5,9'da, YEDİSİ %5,6'da başlıyor.**
  // Göz ilk 300 ms'de siluet okur, süs okumaz — ve dokuz kapak aynı silueti veriyordu.
  // ⚠ ⚠ **`orta` DENENDİ ve KAPI GERİ ÇEVİRDİ.** Metin ortaya çekilince doğrudan
  // kemerlerin içine düştü: `sus-metni-kesiyor` %36,2, `metin-zemine-karisiyor` %20 ve
  // %11 (tavan %4). Kemerler kadrajın alt yarısını tutuyor; `kavis`in metni bu yüzden
  // ÜSTTE — bu bir alışkanlık değil, formun kendisi. Siluet DİKEYDE değil YATAYDA
  // kırılıyor: kemerler soldan yükseliyor, metin sağa geçiyor.
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 1.05,
    baslikAgirlik: 800,
    // ⚠ RECETE B: kavis govdesi Archivo wdth 88. Baslik DEGIL govde daraliyor —
    // sablonun sesi 'dar ve agir' ve daralma govdede beton yuzeyle birlikte siki bir
    // sanayi dokusu veriyor. ⚠ Kapak basligi Literata ve eksensiz; genislik oraya
    // ulasmiyor, bu KUSUR DEGIL: display serif kapak ayri bir sestir.
    govdeGenislik: 88,
    satirAraligi: 1.18,
    harfArasi: -0.04,
    govdeOrani: 0.31,
    baslikSutunu: 0.72,
    govdeSutunu: 0.78,
  },
  zemin: 'var(--ramp-palet-beton-taban)',
  // ⚠ PALET — P4 BETON+AMBER — orta açıklıkta bir zemin, ne mürekkep ne kâğıt. Betonun kimliği taneden değil RENKTEN de geliyor.
  aksan: 'var(--ramp-palet-beton-amber)',
  // ⚠ YÜZEY AİLESİ — beton: kaba tane, ölçülen σ kâğıdın ~3,7 katı.
  yuzey: 'beton' as const,
  hayaletKonumu: { ust: 66, olcek: 1.5, guc: 12 },
  // Kesim bir kemerin ORTASINA denk geliyor, tepesine değil. Tepe noktası kesime
  // düşseydi göz iki yarım tepe görürdü; ortadan kesilen bir yay ise iki yandan da AYNI
  // eğimi veriyor ve devamı zorunlu okunuyor.
  //
  // ⚠ ⚠ **BEŞ → ON İKİ: RİTİM SLAYT BAŞINA OKUNUR, PANORAMA BAŞINA DEĞİL.** Beş kemer
  // dört slayda dağılınca slayt başına ~1,25 yay düşüyordu ve tasarım denetimi bunu
  // adıyla söyledi: *"ritim değil iki tepe — ritim en az üç vuruş ve görünür bir aralık
  // ister"*. Şablonun içeriği *"bir hat TEKRARLA öğrenir"* diyor; form o tekrarı
  // kuramıyordu, yani **form içeriği yalanlıyordu.**
  // ⚠ ⚠ **SAYI 4'E BÖLÜNMEMELİ — ve bunu KAPI öğretti.** Önce 12 yazıldı ("dört slayt ×
  // üç vuruş") ve `punto-esigi` kırmızı döndü: *"kavis · hiçbir kesim taşıyıcısız değil"*.
  // Aritmetik şöyle: N kemer panoramayı N eşit parçaya böler, sınırlar `k/N`'de. Dört
  // slaytta kesimler %25/%50/%75'te; kesim bir SINIRA denk gelirse orada mürekkep yok ve
  // taşıyıcı kaybolur. %25 sınır olur ⟺ `0,25·N` tam sayı ⟺ **N 4'e bölünür.**
  // 12 bölünüyordu; 5 bölünmüyordu — orijinal sayının seçilme sebebi buymuş.
  // ⚠ 13 seçildi: slayt başına 3,25 vuruş (ritmin alt sınırı üç) ve N TEK olduğu için
  // %50 kesimi ortadaki kemerin tam ORTASINA düşüyor — kesim tepeden değil gövdeden
  // geçiyor, iki yandan aynı eğim veriliyor ve devamı zorunlu okunuyor.
  // ⚠ ⚠ **BAND 560 → 860: ÖLÜ ORTA KAPANDI.** Ortak yükseklikle gövde ~y700'de bitiyor,
  // kemerler ~y930'da başlıyordu; arada şekillenmemiş bir kuşak kalıyordu. Tasarım
  // denetimi bunu *"nizami boşluk, gerilimli boşluk değil — üst blok ile alt süs
  // birbirinden habersiz"* diye yazdı ve setin EN BOŞ kartı bu şablondu.
  // ⚠ 860 keyfi değil: 1440 tuvalde band üst kenarı 1440−120−860 = **y460**'a çıkıyor,
  // yani gövdenin bittiği yerin hemen altı. Kolonad artık kompozisyonun ALT YARISI,
  // dibe yapışmış bir şerit değil.
  // ⚠ Sapan kemer 8. indekste: 13 kemer 4 karta bölününce 7-8-9 üçüncü kartta kalıyor
  // ve üçüncü kart tam olarak *"Sapma görünür olmalı"* diyen kart.
  bant: { tip: 'kemer', sayi: 13, yukseklik: 860, sapma: { indeks: 8, carpan: 1.5 } },
  gorseller: [],
  kartlar: [
    {
      kolon: 'sag' as const,
      // ⚠ ⚠ **HAYALET KALDIRILDI ve yerine ne konacağını KAPI söyledi.** Hayalet etiket
      // serisinin ilk kelimesini (`RİTİM`) tekrarlıyordu: aynı kelime bir kez 18 px, bir
      // kez kadrajın üçte biri — sıfır bilgi. Yerine `01` denendi ve `sus-baskin` kırmızı
      // döndü: hayalet genişliğe göre ölçeklendiği için iki karakter kartın **%28'ini**
      // tutuyor, içerik %26 (`olcek: 1.55`). Kısa bir hayalet, uzun olandan BÜYÜKTÜR.
      // ⚠ Daha uzun bir kelime aramak da çıkmaz: `TEKRAR` başlıkta ve gövdede geçiyor.
      // Bu şablonun taşıyıcısı zaten KEMER BANDI; hayalet D-299'un altı şablonda
      // kapattığı ögenin artığıydı. Cihaz artık tek yerde: `dizin`. → R-111
      ustBaslik: 'RİTİM',
      baslik: 'Bir hat **tekrarla** öğrenir',
      govde: 'Aynı hareketin beşinci tekrarı, birincisinden ucuzdur.',
      panel: null,
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ÖLÇÜ',
      baslik: 'Önce ölç, sonra tekrarla',
      govde: 'Ölçülmeyen bir tekrar, alışkanlıktır.',
      panel: { tip: 'vafel', baslik: 'ölçülen adım', toplam: 20, dolu: 13 },
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
    },
    {
      aksanRolu: 'yok' as const,
      ustBaslik: 'SAPMA',
      baslik: 'Sapma görünür olmalı',
      govde: 'Görünmeyen sapma, ortalamanın içinde kaybolur.',
      panel: null,
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      kolon: 'sag',
    },
    {
      ustBaslik: 'SÜREKLİLİK',
      baslik: 'Ritim **kendini** taşır',
      govde: 'Kurulmuş bir ritim, gözetim istemez.',
      // ⚠ ⚠ **KAPANIS KARTI PANO TASIMAZ.** Depo sahibi bakti ve soyledi:
      // *"son sayfalardaki buyuk sayilar cok kotu duruyorlar."* Olculdu ve sebep
      // tam olarak buydu: bu kart hem normal bir icerik panosunu hem de kapanis
      // jestini (dev rakam + okuma satiri + imza + cagri) tasiyordu ve icerigin dibi
      // kartin ALT KENARINI ASIYORDU — veri-hikayesi'nde **%103,2**. Rakam kesildi,
      // kunye seridine bindi, tasarlanmis degil BOZUK gorundu.
      // Denetimin kapanis tarifi zaten bunu soyluyordu: *"Kapanis iskeleti kullanmaz,
      // KIRAR. Serit yok, uc satir baslik yok, ALT PANO YOK."* Bes destede ihlal.
      panel: null,
      hayalet: '',
      rayaSol: 'ATÖLYE',
      rayaOrta: ORNEK,
      kapanis: { rakam: '12', rakamAlt: 'AYDA BİR RİTİM', cagri: 'Ritmi **birlikte** kuralım.' },
    },
  ],
}

/**
 * **alinti** — ailenin SESSİZ üyesi: yalnız tipografi.
 *
 * ⚠ ⚠ **Ailede hiç metin-öncülü şablon yoktu.** Altısının altısı ya görsel ya panel ya
 * veri taşıyor; bir karosel dizisi sürekli yüksek sesle konuşamaz. Bu şablon kâğıt
 * zeminde tek bir iri serif alıntı taşıyor — ızgarada yan yana geldiğinde nefes aralığı.
 *
 * ⚠ Taşıyıcı ALAN SINIRI (araştırmanın en güçlü taşıyıcısı, *"sıfır uzamsal frekans"*):
 * kâğıt/mürekkep bölünmesi panoramayı kat ediyor ve alıntının altından geçiyor. Metin
 * kesimi ASLA aşmıyor (R-87 taşıyıcısı sınırın kendisi).
 *
 * ⚠ `baslikPayi: 1.5` ailenin en irisi ve 400 ağırlık en hafifi: alıntı bağırmıyor, YER
 * KAPLIYOR. İkisi aynı şey değil.
 */
export const ORNEK_ALINTI: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  yerlesim: 'orta',
  tipografi: {
    baslikPayi: 1.5,
    baslikAgirlik: 400,
    satirAraligi: 1.18,
    harfArasi: -0.02,
    govdeOrani: 0.26,
    baslikSutunu: 0.9,
    govdeSutunu: 0.62,
  },
  zemin: 'var(--ramp-palet-kagit-taban)',
  // ⚠ PALET — P3 KÂĞIT+OKSİT — bu palette MAVİ YOK. Markadan çıkışın kanıtı: uyumlu olmak aynısını kullanmak değildir. `tas` yüzeyi ile `beton` σ'da ayrılmıyordu (5,10 / 5,00); ayrım BURADA kuruluyor.
  aksan: 'var(--ramp-palet-kagit-oksit)',
  // ⚠ YÜZEY AİLESİ — açık taş: iri tane + damar. Damar `multiply` — taş ışığı geçirmez.
  yuzey: 'tas' as const,
  hayaletKonumu: { ust: 62, olcek: 1.1, guc: 8 },
  alanSiniri: {
    ust: 'var(--ramp-marka-kagit)',
    alt: 'var(--role-line-edge)',
    // Sınır TEK YÖNLÜ iniyor: alıntı ilerledikçe mürekkep alanı büyüyor. Salınan bir
    // sınır "akan alan"ın işi; burada geometri bir CÜMLENİN ağırlaşmasını anlatıyor.
    //
    // ⚠ ⚠ **EĞİM İKİ KEZ AZALTILDI ve ikisini de ÖLÇÜM söyledi.** İlk sürüm %52'ye
    // iniyordu: sınır gövde metninin içinden geçti ve zeminin **%24'ü** medyandan 60
    // luma sapar oldu — metin çizgilerin içinde yüzüyordu (R-105). Yerleşim `orta`, yani
    // metin dikeyde ortada; sınırın ona dokunmadan inebileceği en düşük yer %72.
    // ⚠ ⚠ **ALANI BÜYÜTMEK DENENDİ, ÇİZİLDİ, BAKILDI ve GERİ ALINDI.** Kart 1'de mürekkep
    // alanı kadrajın yalnız %6'sı; söz y%62'de bitiyor ve altındaki %26 boş. Şablonun
    // kendi iddiası *"alıntı ilerledikçe mürekkep alanı büyüyor"* ve geometri o ağırlaşmayı
    // çizmiyor, yalnız ima ediyor. Sınır 78→62'ye çekildi: ölü bant %26/%19/%10'dan
    // %10/%6/%10'a, kapsam %56'dan %66'ya çıktı.
    // ⚠ ⚠ **AMA KAPANIŞ KARTINI YUTTU.** Kart 3'ün gerçek içerik dibi **y%86,8**
    // (`.kapanis` bloğu dahil; ilk ölçümüm yalnız başlık+gövdeye bakıp %35,7 demişti ve
    // YANLIŞTI). Sınır tek yönlü yükseldiği için en sağda o içeriğe takılıyor: dev "01"
    // rakamının altı, künye ve marka işareti koyu alanın üstünde kayboldu — yani tam da
    // bu fazın kapatmaya çalıştığı "çizgiler yazıyı kesiyor" kusuru.
    // ⚠ **HİÇBİR KAPI YAKALAMADI**, göz yakaladı: `sus-metni` süsleri ölçüyor, alan
    // sınırını değil. Sebep kökte: `alanSiniri` varken kart zemini `alanSiniri.ust`e
    // SABİTLENİYOR (`kartZemini`), yani metin rengi altındaki alanı takip etmiyor.
    // Yükselmeyi korumanın yolu kart zemininin bölgeye göre dönmesi — ayrı bir iş.
    noktalar: [
      { x: 0, y: 78 },
      { x: 33, y: 73 },
      { x: 66, y: 68 },
      { x: 66.6667, y: 40 },
      { x: 100, y: 40 },
    ],
  },
  bant: { tip: 'yok' },
  gorseller: [],
  kartlar: [
    {
      ustBaslik: 'ALINTI',
      baslik: '**Ölçmediğin** şeyi iyileştiremezsin',
      // ⚠ ATIF, UYDURULMADAN. Bu soz yaygin bir yonetim aforizmasi ve sahibi tartismali;
      // Drucker'a da Kelvin'e de atfediliyor, ikisi de dogrulanmiyor. Sahte bir sahip
      // vermek R-32'nin ihlali olurdu. Dogru atif, sozun NE OLDUGUNU soylemektir —
      // olcen bir markanin bir alintinin kaynagini bilmedigini soylemesi tutarliliktir.
      govde: '— Sanayi sözü, sahibi belirsiz',
      panel: null,
      hayalet: '',
      rayaSol: 'SÖZ',
      rayaOrta: ORNEK,
    },
    {
      kolon: 'orta',
      aksanRolu: 'alan' as const,
      aksanDibi: 52,
      ustBaslik: 'KARŞI SÖZ',
      baslik: 'Ama ölçtüğün her şey önemli değildir',
      govde: 'İki cümle birlikte doğru; ayrı ayrı yanıltıcı.',
      panel: null,
      hayalet: '',
      rayaSol: 'SÖZ',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SORU',
      baslik: 'Hangi ölçü **karar** değiştiriyor?',
      govde: 'Karar değiştirmeyen ölçü, rapor sayfası doldurur.',
      // ⚠ ⚠ **ETİKET PANELİ KALDIRILDI ve sebebi ÖLÇÜLDÜ.** Panel alan sınırının TAM
      // üstüne düşüyordu: yarısı kâğıtta, yarısı mürekkepte, koyu metin mürekkepte
      // kayboluyordu — ölçüm zeminin **%100'ünün** metin lumasına 44'ten yakın olduğunu
      // söyledi (R-105). Sınırı aşağı çekmek "ağırlaşan cümle" fikrini öldürürdü;
      // etiketler ise bu şablonda zaten üçüncü bir sesti. Alıntı yalnız tipografi.
      panel: null,
      hayalet: '',
      rayaSol: 'SÖZ',
      rayaOrta: ORNEK,
      kapanis: {
        rakam: '01',
        rakamAlt: 'KARAR DEĞİŞTİREN ÖLÇÜ',
        cagri: 'Ölçüyü **birlikte** seçelim.',
      },
    },
  ],
}

/**
 * **karsilastirma** — önce/sonra; zemin panorama boyunca DÖNÜYOR.
 *
 * ⚠ ⚠ **Kart başına zemin değiştirmek DEĞİL — o, her kesimde sert bir renk sıçraması
 * demek olurdu** ve `editoryal` o yolu zaten deniyor (kimliği o). Burada alan sınırı
 * tek yönlü SÜPÜRÜYOR: mürekkep alanı küçülürken kâğıt büyüyor, yani "önce"den
 * "sonra"ya geçiş kesimlerde değil, panoramanın tamamında oluyor.
 *
 * ⚠ Araştırmanın en güçlü taşıyıcısı bu: renk alanı bölünmesi, sıfır uzamsal frekans —
 * *"parçadan bütün zorunlu"*.
 *
 * ⚠ Panel çifti KASTEN farklı: önce tarafında `cubuklar` (dağılım), sonra tarafında
 * `sayilar` (sonuç). Aynı panel iki kez, karşılaştırmayı görsel olarak DÜZLERDİ.
 */
export const ORNEK_KARSILASTIRMA: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 1.22,
    baslikAgirlik: 650,
    // ⚠ RECETE B: karsilastirma bolum basligi Archivo wdth 70 (dar+agir karsitlik).
    // fonts.ts'in kendi kaydi da bunu soyluyor: dogru yuz Archivo, cunku DARALMAYI
    // SABLONUN SECMESI gerekiyor; sabit dar bir yuz dar sutunda hiyerarsiyi tersine
    // ceviriyordu. Eksen KAPAGA ulasmiyor (kapak Literata, eksensiz) ve bu kusur
    // DEGIL: display serif kapak + dar grotesk ic baslik ayri iki sestir.
    baslikGenislik: 88,
    // ⚠ ⚠ **1,02 → 1,08: aynı Türkçe çakışma.** Boşluk 3 px, punto 140 px, oran **%2,1**;
    // "olduğunu" ile "söylemiyordu" birbirine yapışıyordu — ğ kavisi ile ö noktaları.
    // ⚠ AYAR SONUCU ÖNGÖRMÜYOR: `sahne` 0,96 ile rahat, bu şablon 1,02 ile sıkışıktı.
    // Sıkışmayı ayar değil, karşılaşan AKSAN ÇİFTİ belirliyor — bu yüzden `satirAraligi`
    // üzerine bir taban yazmak da işe yaramazdı. → `docs/kurallar/OLCUMLER.md`
    satirAraligi: 1.18,
    harfArasi: -0.025,
    govdeOrani: 0.3,
    baslikSutunu: 0.8,
    govdeSutunu: 0.7,
    // ⚠ Panel WEB ölçüsünde kalıyordu: çubuklar minik kareler gibi çiziliyor ve
    // karşılaştırmanın taşıyıcısı okunmuyordu. `veri-hikayesi` ile aynı çarpan.
    panelPayi: 1.7,
  },
  zemin: 'var(--ramp-palet-celik-taban)',
  // ⚠ PALET — P2 ÇELİK+BAKIR — `celik` yüzeyinin renk karşılığı. Mavi bu palette yalnız kılcal çizgi.
  aksan: 'var(--ramp-palet-celik-bakir)',
  // ⚠ YÜZEY AİLESİ — fırçalanmış çelik: ANİZOTROPİK doku, fırça izi yön taşır.
  yuzey: 'celik' as const,
  // ⚠ ⚠ **BU ŞABLONUN HAYALETİ YOK ve bu bir eksiklik değil, ölçülmüş bir karar.** Üç yer
  // denendi: 64'te panele %23, 46'da gövdeye %64 çarptı. Sebep geometrik — metin tepede,
  // panel dipte, arada hayaletin sığacağı boşluk yok. Kompozisyonu zaten alan süpürmesi
  // taşıyor; hayalet üçüncü bir ses olurdu. `akan-alan`, `editoryal` ve `alinti` de
  // hayaletsiz: her şablonun her aracı kullanması gerekmiyor.
  hayaletKonumu: { ust: 46, olcek: 1.28, guc: 14 },
  // ⚠ ⚠ **"ZEMİN DÖNÜYOR" FİKRİ GEOMETRİK OLARAK İMKÂNSIZ ÇIKTI ve iki ölçüm bunu
  // söyledi.** Kartın metin rengi KENDİ zemininden türüyor (koyu kart → açık metin);
  // üstüne kâğıt alanı gelince metin o alanın üstünde kayboluyor. Kâğıt aşağıdan
  // büyütüldü → ray yutuldu (`ray-sayac` %26 yakın, R-95). Yukarıdan büyütüldü → başlık
  // yutuldu (%69 yakın, gövde %15 gürültülü, R-105). Ray dipte, metin tepede: kâğıdın
  // gidebileceği üçüncü bir yön yok.
  //
  // ⚠ Çözüm alanı KALDIRMAK değil, iki ucu da KOYU tutmak. Önce/sonra artık üç kanaldan
  // okunuyor: tek yönlü süpürme (ölçünün inişi), ÖNCE/SONRA üst başlıkları ve panel
  // çifti (dağılım → sonuç). `akan-alan`dan farkı da bu: orada sınır SALINIYOR, burada
  // tek yönlü iniyor; orada panel yok, burada iki farklı panel karşılaştırmayı taşıyor.
  // ⚠ Aynı ΔL 0,03 sorunu buradaydı: süpürme görünmüyordu, yani şablonun anlattığı
  // "önce → sonra" geçişi hiç okunmuyordu.
  alanSiniri: {
    ust: 'var(--ramp-marka-ink-1000)',
    alt: 'var(--ramp-marka-ink-850)',
    noktalar: [
      { x: 0, y: 92 },
      { x: 25, y: 80 },
      { x: 50, y: 68 },
      { x: 75, y: 40 },
      { x: 100, y: 40 },
    ],
  },
  bant: { tip: 'yok' },
  gorseller: [],
  kartlar: [
    {
      // ⚠ ⚠ **KAPAK KİLİDİ — `sag` BEYAN EDİLİYORDU ama KAPAK KARTINDA DEĞİL.**
      // Şablon dağılımı `ust-sag` diyordu; ölçüm kapağı %5,9'da buldu, çünkü `kolon`
      // sonraki kartlarda ayarlıydı. Beyan ile çizilen arasındaki fark tam olarak bu
      // deponun tekrar eden hatası — burada kompozisyon hâlinde.
      kolon: 'sag' as const,
      ustBaslik: 'ÖNCE',
      baslik: 'Fire **nerede** olduğunu söylemiyordu',
      govde: 'Toplam biliniyordu; hangi vardiyada oluştuğu bilinmiyordu.',
      panel: {
        tip: 'cubuklar',
        baslik: 'vardiya başına fire',
        // ⚠ `tahmin: true` bir SÜS değil: ölçülmemiş bir çubuğu ölçülmüşten ayırıyor.
        // Üçüncü vardiyanın sayacı yoktu; onu kesin göstermek defterin yalanı olurdu.
        satirlar: [
          // ⚠ ⚠ **UC BAR NEREDEYSE AYNI UZUNLUKTAYDI: 62 · 71 · 58, yayilim 1,22x.**
          // Denetimin en sert bulgusu: *"karsilastirma hicbir sey karsilastirmiyor."*
          // Ve kart kendi cumlesini yalanliyordu — govde *"toplam biliniyordu; hangi
          // vardiyada olustugu bilinmiyordu"* diyor, yani IDDIA vardiyalar arasi FARK.
          // Uc esit bar o farki gostermek soyle dursun, YOK oldugunu soyluyordu.
          // Ayni sinif kusur `kavis`te de vardi (on uc kemerin on ucu birebir ayni) ve
          // orada kapiya baglanmisti; burada baglanmamisti.
          { etiket: 'A vardiyası', deger: 34, not: 'sayaçtan', tahmin: false },
          { etiket: 'B vardiyası', deger: 71, not: 'sayaçtan', tahmin: false },
          { etiket: 'C vardiyası', deger: 58, not: 'tahmin', tahmin: true },
        ],
      },
      hayalet: '',
      rayaSol: 'ÖLÇÜM',
      rayaOrta: ORNEK,
    },
    {
      aksanRolu: 'alan' as const,
      aksanDibi: 26,
      // ⚠ ⚠ **BU KARTIN ALT YARISI %3 DOLUYDU — denetimin adiyla andigi tek vaka.**
      // Olculdu (alt-yari.mjs): gorsel yuvasi olan kartlarin hepsi %37-82 arasinda,
      // bu kart %3. Gorseli YOK ve sayi cifti %40-56'da bitiyor; altinda %56-87
      // bombos, yalnizca kosegen supuruyordu.
      // ⚠ Panoyu TASIYICIYA INDIRMEK cozum DEGIL — o yol daha once tam bu destede
      // olculerek curutuldu (sablon-uyarla: "kural dogruydu, KAPSAMI yanlisti").
      // Dogru yon KONUM degil OLCEK: kanit, baslikla ayni mesafeden okunmali.
      // ⚠ Genel bir kapi YAZILMADI ve sebebi olculdu: metrik, tasarlanmis bosluk ile
      // ihmali AYIRT EDEMIYOR. akan-alan'in alt yarisi %0 ama orayi mavi dalga alani
      // dolduruyor; kavis'te kemerler, veri-hikayesi'nde egri var. Alet tasiyiciyi
      // saymiyor. Esigi kurala cevirmek o uc sabloni haksiz yere kirardi.
      ayar: { panel: { olcek: 1.5, dy: 90 } },
      ustBaslik: 'DEĞİŞİM',
      baslik: 'Ölçü vardiyaya indi',
      govde: 'Aynı sayı, üç ayrı sorumlulukla okundu.',
      // ⚠ ⚠ **ORTA İKİ KART ÖLÇÜSÜZDÜ ve bu bir KOMPOZİSYON değil ARGÜMAN kusuruydu.**
      // Ölçüldü: kart 2'nin ölü bandı **%37** — destenin en uzunu. Sebep boşluk değil,
      // içerik yokluğuydu: bir KARŞILAŞTIRMA destesinin ortasında iki kart hiçbir şey
      // karşılaştırmıyordu. Başlık *"ölçü vardiyaya indi"* diyor ve altında ölçü yok.
      panel: {
        tip: 'sayilar',
        ogeler: [
          { deger: '1', birim: 'sayaç', alt: 'önce, hat toplamında' },
          { deger: '3', birim: 'sayaç', alt: 'sonra, vardiya başına' },
        ],
      },
      hayalet: '',
      rayaSol: 'ÖLÇÜM',
      rayaOrta: ORNEK,
      // ⚠ ⚠ **`sag` KALDIRILDI — iki komşu "önce/sonra" çifti FARKLI okunuyordu.** Kart 2
      // `sag` olduğu için kolonu dardı ve iki sayı DİKEY sarıyordu; kart 3'ün aynı anlamdaki
      // çifti YATAY duruyordu. Seamless karoselde göz komşu kareleri karşılaştırır: aynı
      // şeyi iki ayrı biçimde çizmek, "aynı şablon farklı ad" şikâyetinin tersidir.
      // ⚠ Kapak (`kart 1`) `sag` KALIYOR: girişin ayrı durması kilidin kendisi.
    },
    {
      kolon: 'orta',
      ayar: { panel: { olcek: 1.5, dy: 90 } },
      ustBaslik: 'HIZ',
      baslik: 'Karar haftalıktan günlüğe geçti',
      govde: 'Geciken bir ölçü, geciken bir karar demek.',
      // ⚠ Başlık "haftalıktan günlüğe" diyor; sayı onu göstermeliydi (kart 2 ile aynı ders).
      panel: {
        tip: 'sayilar',
        ogeler: [
          { deger: '7', birim: 'gün', alt: 'karar gecikmesi, önce' },
          { deger: '1', birim: 'gün', alt: 'karar gecikmesi, sonra' },
        ],
      },
      hayalet: '',
      rayaSol: 'ÖLÇÜM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'SONRA',
      baslik: 'Fire **yarıya** indi',
      govde: 'Ölçü değişti, hat değişmedi.',
      // ⚠ ⚠ **KAPANIS KARTI PANO TASIMAZ.** Depo sahibi bakti ve soyledi:
      // *"son sayfalardaki buyuk sayilar cok kotu duruyorlar."* Olculdu ve sebep
      // tam olarak buydu: bu kart hem normal bir icerik panosunu hem de kapanis
      // jestini (dev rakam + okuma satiri + imza + cagri) tasiyordu ve icerigin dibi
      // kartin ALT KENARINI ASIYORDU — veri-hikayesi'nde **%103,2**. Rakam kesildi,
      // kunye seridine bindi, tasarlanmis degil BOZUK gorundu.
      // Denetimin kapanis tarifi zaten bunu soyluyordu: *"Kapanis iskeleti kullanmaz,
      // KIRAR. Serit yok, uc satir baslik yok, ALT PANO YOK."* Bes destede ihlal.
      panel: null,
      hayalet: '',
      rayaSol: 'ÖLÇÜM',
      rayaOrta: ORNEK,
      kapanis: { rakam: '-25', rakamAlt: 'PUAN FİRE', cagri: 'Farkı **birlikte** ölçelim.' },
    },
  ],
}

/**
 * **dizin** — numaralı adımlar; taşıyıcı AKIŞ OKLARI.
 *
 * ⚠ Araştırma okları *"anlamsal: devamı var der"* diye sıralıyor. `sahne` de ok
 * kullanıyor ama orada oklar İKİNCİL — kimliği kesik özne. Burada oklar kompozisyonun
 * kendisi: her ok bir adımı sonrakine bağlıyor ve kesimi tam ortadan aşıyor.
 *
 * ⚠ Oklar KART ARALARINDA, metnin üstünden geçmiyor (panorama modelinin kendi kaydı:
 * nüfus karoselinde oklar başlıkların ortasından geçince okunmaz oldu ve silindi).
 *
 * ⚠ Tipografi ailenin en MONO'su: `liste` paneli numaralı ve tabular; başlık ağırlığı
 * 600'de tutuluyor ki numaralar başlıkla yarışmasın.
 */
// ⚠ ⚠ **BU DESTE HER SEYI UC KEZ SOYLUYORDU.** Ust etiket "ADIM 02", baslik
// "Ikinci adim: esigi yaz", liste "02 esigi yaz" — ayni bilgi uc ayri yerde ve
// hicbiri yenisini eklemiyordu (R-111). Kusur once bir TASMA olarak gorundu: kapanis
// kartinda cagri %96,1'e dusup kunye seridine (%95-97) biniyordu, cunku uc satirlik
// baslik yer birakmiyordu. SERITTE gorulda.
// ⚠ Yeni bolusum — dort ses, dort ayri is: ust etiket KONUM · baslik IDDIA ·
// govde SONUC · liste DORT ADIM. "Ikinci adim:" oneki dustu cunku numarayi zaten
// ust etiket tasiyor; basliklar artik adimin ADINI degil NEDENINI soyluyor.
// ⚠ Vurgu sayisi 2'de tutuldu (kapak + kapanis): aksan-disiplini tavani.
export const ORNEK_DIZIN: KatalogOrnegi = {
  slaytGenisligi: VARSAYILAN_TUVAL.genislik,
  yukseklik: VARSAYILAN_TUVAL.yukseklik,
  yerlesim: 'ust',
  tipografi: {
    baslikPayi: 1.1,
    baslikAgirlik: 600,
    satirAraligi: 1.18,
    harfArasi: -0.02,
    govdeOrani: 0.32,
    baslikSutunu: 0.76,
    govdeSutunu: 0.66,
  },
  zemin: 'var(--ramp-palet-celik-taban)',
  // ⚠ YÜZEY AİLESİ — sıcak milimetrik defter (reçete `B`: 48 px). Bir FİHRİST'in zemini
  // gürültü değil ÇİZGİdir; yatay satır dikey sütundan ağır, defterin imzası budur.
  yuzey: 'defter' as const,
  // ⚠ PALET — P2 — bakır; elle çizilmiş okların rengi. Sıcak defter.
  aksan: 'var(--ramp-palet-celik-bakir)',
  hayaletKonumu: { ust: 68, olcek: 1.42, guc: 11 },
  bant: {
    tip: 'ok',
    // Üç ok, üç kesim: her ok kesimden ÖNCE başlayıp SONRA bitiyor. `bukum` işareti
    // dönüşümlü — düz bir ok dizisi ritmi düzleştirir.
    // ⚠ ⚠ **OKLAR ARTIK BİR ŞEYE BAĞLI — eskiden ÜÇ AYNI LEKEYDİ.** Denetim: *"üç mavi
    // ok aslında üç aynı leke: aynı şekil, aynı uzunluk, başsız uçsuz, hiçbirini hiçbir
    // şeye bağlamıyor."* Veride birebir öyleydi: üçünün de açıklığı **14**, üçünün de
    // |Δy|'si **6**. Yeni uçlar ÖLÇÜLDÜ (`liste.mjs`): her ok bir kartın liste panelinin
    // BİTTİĞİ yerden başlayıp sonraki kartın madde NUMARASINA iniyor.
    //   kart 1 panel %7,5–22,3 · numara %9,0 / y %44,2
    //   kart 2 panel %26,5–41,3 · numara %28,0 / y %41,1
    //   kart 3 panel %51,5–66,3 · numara %53,0 / y %41,1
    // Açıklıklar artık 5,7 · 11,7 · 10,2 — üç ok üç ayrı mesafe kat ediyor.
    //
    // ⚠ ⚠ **REÇETENİN "45–60° AÇIYLA GEÇSİN" ŞARTI UYGULANMADI ve sebebi geometrik.**
    // Maddeler aynı yükseklikte (y %41–44); kesimde 45° için uçlar arasında açıklık
    // kadar dikey yol gerekiyor (%5,7 açıklık ≈ 246 px ⇒ ~%17 dikey). O da oku bir
    // sonraki maddenin ÇOK ALTINA indirirdi. **İki şart aynı anda sağlanamıyor:** ya ok
    // maddeye iner ya dik açıyla geçer. Bağlantı seçildi — denetimin şikâyeti "açı" değil
    // *"hiçbirini hiçbir şeye bağlamıyor"*du.
    // ⚠ Uçlar YENİDEN ölçüldü: kartlar dört maddeyi birden taşıyınca YANIK satır her
    // kartta bir aşağı iniyor. Oklar o inişi izliyor — geometri, dizinin ilerlediğini
    // de söylüyor.
    // ⚠ ⚠ **VE İNİŞ `yayik` İLE DÖRT KATINA ÇIKTI: %4,6 → %31,2.** Liste kadrajın
    // boyuna dağılınca yanık madde y %52,7 → %61,5 → %72,6 → %83,8'e indi. Yukarıdaki
    // "45° geometrik olarak imkânsız" tespiti NİCELİK olarak eskidi: okun açısı ~1,4°'den
    // ~27°'ye çıktı. Hâlâ 45° değil (kesim açıklığı dikey yoldan uzun), ama artık ok bir
    // İNİŞ çiziyor — üç ok üç ayrı yükseklikten geçiyor.
    oklar: [
      { x1: 22.3, y1: 52.7, x2: 27.2, y2: 61.5, bukum: 12 },
      { x1: 41.3, y1: 61.5, x2: 52.2, y2: 72.6, bukum: -16 },
      // ⚠ ⚠ **SON OK LİSTEYE DEĞİL VARIŞ RAKAMINA İNİYOR.** Kapanış kartı güzergâhı
      // TOPLUYOR (`yayik: false`), o yüzden yanık satır %83,8'den %48,8'e çıktı ve okun
      // ucu boşlukta kaldı — çizilene bakılınca görüldü. Üç kart rotayı iniyor, dördüncüde
      // rota bir SAYIYA varıyor: son ok rakamın sol kenarına (%76,5) 0,8 pay bırakarak
      // iniyor. Ötekilerle aynı pay, farklı hedef.
      { x1: 66.3, y1: 72.6, x2: 75.7, y2: 74.0, bukum: 14 },
    ],
  },
  gorseller: [],
  kartlar: [
    {
      // ⚠ KAPAK KİLİDİ — hayalet kelime (DİZİN) kadrajın sol-altını tutuyor; metin
      // sağa geçince ikisi çakışmıyor ve giriş noktası ailenin geri kalanından ayrışıyor.
      kolon: 'sag' as const,
      // ⚠ ⚠ **`DİZİN` → `ADIM 01`: etiket hem seriden KOPUKTU hem hayaletle AYNI
      // kelimeydi.** Öteki üç kart `ADIM 02/03/04` diyor, kapak `DİZİN` diyordu; oysa
      // ilk adım kapağın listesinde duruyor. Aynı kelimeyi bir kez küçük bir kez dev
      // yazmak bilgi eklemiyor — süs metni slaytta zaten yazanı tekrarlayamaz. → R-111
      ustBaslik: 'ADIM 01',
      baslik: 'Dört adımda **ölçülebilir** hat',
      govde: 'Sırayı bozmak, ölçüyü bozuyor.',
      panel: {
        tip: 'liste',
        yayik: true,
        baslik: 'sıra',
        ogeler: [
          { no: '01', ad: 'ölçüm noktasını koy', aktif: true },
          { no: '02', ad: 'eşiği yaz' },
          { no: '03', ad: 'sorumlu ata' },
          { no: '04', ad: 'haftalık oku' },
        ],
      },
      // ⚠ ⚠ **HAYALET KALDIRILDI — İKİ AYGIT AYNI TOPRAĞI İSTİYORDU.** Ölçüldü: hayalet
      // x%3-81 / y%68-82, yayık liste x%30-89 / y%55-87 — örtüşme hayaletin **%65'i** ve
      // `hayalet-carpisma` kapısı onu adıyla söyledi. `yayik` öncesinde liste kompakttı
      // (y%38-50) ve çakışma yoktu; güzergâh kadrajın boyuna dağılınca hayaletin yeri
      // kalmadı.
      // ⚠ Bu, `yayik` ile `kapanis`in çakışmasıyla AYNI ders: **bir kartta tek aygıt.**
      // Kapağın alt yarısını artık güzergâh tutuyor ve o, şablonun kimliği.
      hayalet: '',
      rayaSol: 'YÖNTEM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ADIM 02',
      baslik: 'Eşik olmadan alarm yok',
      govde: 'Sayı tek başına bir olay değil; olay eşiğin aşıldığı andır.',
      panel: {
        tip: 'liste',
        yayik: true,
        baslik: 'sıra',
        ogeler: [
          { no: '01', ad: 'ölçüm noktasını koy' },
          { no: '02', ad: 'eşiği yaz', aktif: true },
          { no: '03', ad: 'sorumlu ata' },
          { no: '04', ad: 'haftalık oku' },
        ],
      },
      hayalet: '',
      rayaSol: 'YÖNTEM',
      rayaOrta: ORNEK,
    },
    {
      kolon: 'orta',
      aksanRolu: 'yok' as const,
      ustBaslik: 'ADIM 03',
      baslik: 'Sahipsiz alarm kapanır',
      govde: 'Sahibi olmayan uyarıyı kapatan olur, düzelten olmaz.',
      panel: {
        tip: 'liste',
        yayik: true,
        baslik: 'sıra',
        ogeler: [
          { no: '01', ad: 'ölçüm noktasını koy' },
          { no: '02', ad: 'eşiği yaz' },
          { no: '03', ad: 'sorumlu ata', aktif: true },
          { no: '04', ad: 'haftalık oku' },
        ],
      },
      hayalet: '',
      rayaSol: 'YÖNTEM',
      rayaOrta: ORNEK,
    },
    {
      ustBaslik: 'ADIM 04',
      baslik: 'Okunmayan ölçü **yok** sayılır',
      govde: 'Haftalık okuma, ölçüyü bir alışkanlığa çeviriyor.',
      // ⚠ ⚠ **ÇİP SATIRI → LİSTE.** Kapanış kartı dizinin kendisini taşımıyordu:
      // dört adımlık bir dizin son karede dört ÇİP gösteriyordu ve üçüncü ok bir
      // madde numarasına değil o çip satırına iniyordu. Dizin, vardığı yerde de
      // DİZİN olmalı — dördüncü madde yanık, ilk üçü sönük.
      // ⚠ ⚠ **KAPANIS KARTI PANO TASIMAZ.** Depo sahibi bakti ve soyledi:
      // *"son sayfalardaki buyuk sayilar cok kotu duruyorlar."* Olculdu ve sebep
      // tam olarak buydu: bu kart hem normal bir icerik panosunu hem de kapanis
      // jestini (dev rakam + okuma satiri + imza + cagri) tasiyordu ve icerigin dibi
      // kartin ALT KENARINI ASIYORDU — veri-hikayesi'nde **%103,2**. Rakam kesildi,
      // kunye seridine bindi, tasarlanmis degil BOZUK gorundu.
      // Denetimin kapanis tarifi zaten bunu soyluyordu: *"Kapanis iskeleti kullanmaz,
      // KIRAR. Serit yok, uc satir baslik yok, ALT PANO YOK."* Bes destede ihlal.
      panel: {
        // ⚠ ⚠ **BU LISTE BIR ICERIK PANOSU DEGIL, DESTENIN TASIYICISI.** "Kapanis karti
        // pano tasimaz" kuralini yazdim ve dizin'i de kapsadi; dizin-butunlugu kapisi
        // HAKLI OLARAK kirmizi dondu: bu sablonun kimligi "dort maddenin dordu HER
        // kartta" ve son kart o butunlugun tamamlandigi yer. Kural daraltildi.
        tip: 'liste',
        baslik: 'SIRA',
        ogeler: [
          { no: '01', ad: 'ölçüm noktasını koy' },
          { no: '02', ad: 'eşiği yaz' },
          { no: '03', ad: 'sorumlu ata' },
          // ⚠ 4. kart = 4. madde yanik: dizin-butunlugu "yanik madde kart sirasiyla
          // ILERLIYOR" istiyor ve son kart o ilerlemenin TAMAMLANDIGI yer.
          { no: '04', ad: 'haftalık oku', aktif: true },
        ],
      },
      hayalet: '',
      rayaSol: 'YÖNTEM',
      rayaOrta: ORNEK,
      // ⚠ ⚠ **DEV RAKAM KALDIRILDI VE GERI KONDU — kapi haklı ciktı.** Once "liste zaten
      // 01-04 diyor, dev 04 tekrar" diye kaldirdim; iki-uc kapisi kirmiziya dondu cunku
      // bu destenin ≥220 px'lik TEK dev sesi oydu (hayalet yok). Ve gerekce de fazla
      // genisti: liste KANIT, dev rakam IDDIA — biri otekini tekrarlamiyor.
      // Gercek sorun yer: olculdu, cagri %105-108'de yani kartin DISINDA. → kapanis payi
      kapanis: { rakam: '04', rakamAlt: 'ADIMDA HAT', cagri: 'İlk ölçüyü **birlikte** koyalım.' },
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
  kavis: ORNEK_KAVIS,
  alinti: ORNEK_ALINTI,
  karsilastirma: ORNEK_KARSILASTIRMA,
  dizin: ORNEK_DIZIN,
}

export const ornekBul = (id: string): KatalogOrnegi | null => ORNEKLER[id] ?? null
