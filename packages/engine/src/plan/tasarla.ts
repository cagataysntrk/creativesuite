// HEDEF: packages/engine/src/plan/tasarla.ts
//
// Tasarım planını İÇERİKTEN türetir — DETERMİNİSTİK, model çağırmaz (FAZ-14.2 · §7.1).
//
// **Neden model değil:** aynı senaryo iki koşuda iki farklı plan verirse golden test
// kurulamaz ve "bu slayt neden böyle" sorusunun cevabı her seferinde değişir. Model
// danışmanlığı ayrı bir karardır; buraya karıştırılmaz.
//
// ⚠ Plan **politika** tutuyor, ölçüm değil. Düzen burada seçilmiyor — `duzenSec`
// sayfalayıcının içinde, sayfa başına koşuyor, çünkü kaç bloğun sığdığını bilen tek yer
// orası (bkz. `packages/contracts/src/tasarim-plani.ts` dosya başı).

import {
  AKICI_AILE,
  aileBul,
  TEMEL_AILE,
  yay,
  type AileProfili,
  type Islev,
  type OgePolitikasi,
  type SlaytPolitikasi,
  type TasarimPlani,
} from '@suite/contracts'

export interface TasarlaGirdisi {
  readonly konu: string
  /** Metin satırları — kapak, gövde…, kapanış. */
  readonly satirlar: readonly string[]
  /** İçerikte bir AKIŞ bulundu mu (FAZ-11.1). */
  readonly akisVar: boolean
  /**
   * Fotoğraf yuvası İSTENİYOR mu — hattın/ailenin politikası.
   *
   * ⚠ **Eskiden bu alan `gorselVar` idi ve DÖNGÜSELDİ.** Plan, "ortada üretilmiş bir
   * görsel var mı" diye bakıp yuva açıyordu; ama FAZ-14.3'te sıra tersine döndü ve
   * görsel artık PLANDAN SONRA üretiliyor. Yani plan, kendi tetiklediği şeyin varlığını
   * ön koşul sayıyordu: yuva hiç açılmaz, görsel hiç üretilmezdi.
   *
   * Doğru öncül: yuva bir **politika kararıdır**, bir gözlem değil. Fotoğraf varsayılan
   * olmaktan çıktı (D-261); yuva açılacaksa bunu hat ya da kompozisyon ailesi söyler.
   */
  readonly yuvaIstendi: boolean
  /** Yuvanın biçimi — hat/aile söylüyor. Varsayılan `alan`. */
  readonly yuvaBicimi?: 'alan' | 'maske'
  /** Hattın açıkça istediği aile adı — verilmezse içerikten seçiliyor. */
  readonly aileAdi?: string
  /**
   * Kompozisyon ailesi (FAZ-12.7). Verilmezse `temel`.
   *
   * ⚠ **Aile ESTETİK seçer, GÜVENLİK değil.** Süsleme yoğunluğu, vinyet, degrade, ritim
   * ve tipografi efektleri buradan geliyor; güvenli alan, kontrast eşiği ve chroma tavanı
   * `AileProfili`de YOK ve olamaz — alan yoksa gevşetilecek kural da yok.
   */
  readonly aile?: AileProfili
}

/** Bugünkü tek aile — amber/mürekkep, akan eğri, dev hayalet rakam. */
export const VARSAYILAN_AILE = TEMEL_AILE.id

/**
 * Bir slaydın görsel öge politikası.
 *
 * ⚠ **Sıra anlamlı ve KAPAK süssüz kalır.** Akış varsa diyagram gövdenin ortasına düşer;
 * akış yoksa ve gerçek bir görsel varsa yuva açılır. İkisi birden konmaz: aynı slaytta
 * iki görsel öge kompozisyonu kalabalıklaştırır ve referans ailesinde örneği yok.
 */
const ogeSecimi = (
  islev: Islev,
  index: number,
  ortaIndex: number,
  fotoIndex: number | null,
  g: TasarlaGirdisi
): { deger: OgePolitikasi; gerekce: string } => {
  if (islev === 'kanca')
    return {
      deger: 'yok',
      gerekce: 'Kapak süssüz: ızgarada ilk kare bir cümledir, bir desen değil.',
    }
  if (islev === 'davet')
    return {
      deger: 'yok',
      gerekce: 'Kapanış bir davettir; görsel öge daveti bir resim altyazısına çevirir.',
    }
  if (index === ortaIndex && g.akisVar)
    return {
      deger: 'diyagram',
      gerekce: 'İçerikte adımlı bir akış geçiyor; diyagram fotoğrafın yerine geçiyor.',
    }
  // ⚠ **AYRI SLAYT — bağımsız doğrulama bulgusu.** Diyagram ve fotoğraf yuvası AYNI
  // indeks için yarışıyordu (`ortaIndex`), ve `icerikPromptu` her konuda AKIŞ istediği
  // için diyagram neredeyse her zaman kazanıyordu: `gorsel_yuvasi: true` fiilen ÖLÜ bir
  // kısıttı ve `yuva-doldur` altı gerçek koşuda bir kez bile yuva doldurmadı. Yani
  // 14.3/11.4'ün asıl yolu üretimde HİÇ koşmamıştı — zincir kopukluğunun altıncı biçimi.
  //
  // İkisi farklı slaytlara düşünce çakışma da yok: *"aynı slaytta iki görsel öge"*
  // kuralı slayt başınadır, karosel başına değil.
  if (index === fotoIndex && g.yuvaIstendi)
    return {
      deger: 'gorsel-yuvasi',
      gerekce: 'Hat fotoğraf yuvası istiyor; diyagramdan AYRI bir gövde slaydında açılıyor.',
    }
  return {
    deger: 'ikon',
    gerekce: 'Madde ritmi taşıyan gövde satırı; ikon içerikten seçiliyor, madde çizgisi yerine.',
  }
}

/**
 * Planı üretir. Girdi aynıysa çıktı aynıdır.
 *
 * ⚠ `ortaIndex` gövdenin ortası: görsel öge sona konduğunda sayfalayıcı onu kapanış
 * slaydına taşıyor ve kapanış cümlesi altına sıkışıyordu (FAZ-10.7'de ölçüldü).
 */
/**
 * Aileyi İÇERİKTEN seçer — bir varsayılan değil, bir KARAR.
 *
 * ⚠ ⚠ **Bağımsız doğrulama bu boşluğu blokaj olarak buldu ve haklıydı.** `AKICI_AILE`
 * `aile.ts`te tanımlıydı, testi vardı, kapılar yeşildi — ve HİÇBİR üretim yolu onu
 * seçmiyordu (`const aile = g.aile ?? TEMEL_AILE`, `g.aile`'yi kimse doldurmuyor).
 * Sonuç: `panorama` ve `degrade` hiçbir koşuda basılmadı, yani FAZ-12.4 ve 12.9'un
 * teslimatının TAMAMI ölü koddu. **Ölü kod bir seviye yukarı taşınmıştı:** modül değil,
 * ailenin kendisi çağrılmıyordu (D-261'in dokuzuncu tekrarı).
 *
 * ⚠ **Kural ölçülebilir bir gerilimden geliyor, zevkten değil:** yoğun süsleme ve
 * panorama dikkati ÇEKER; veri ögesi ve fotoğraf da dikkat ister. İkisi aynı karede
 * yarışırsa kanıt okunmaz olur. Kanıt varsa zemin düz kalır (`temel`); karosel saf
 * tipografik bir anlatıysa akış onu taşır (`akici`).
 *
 * ⚠ **Deterministik** (R-06): aynı girdi aynı aile. Rastgele olsaydı golden test kurulamaz
 * ve çeşitlilik parmak izi (FAZ-13.4) anlamını yitirirdi.
 */
export const aileSec = (g: TasarlaGirdisi): AileProfili => {
  if (g.aile !== undefined) return g.aile
  // ⚠ Hat AÇIKÇA bir aile isteyebilir: aynı metni farklı tasarımlarda üretmek (şablon
  // karşılaştırması) ancak böyle mümkün. İsim tanınmazsa içerikten seçime düşüyor —
  // yazım hatası yüzünden koşunun düşmesi, sessizce yanlış aile seçmekten iyi ama
  // burada ikisi de değil: bilinmeyen ad yok sayılıyor ve karar içeriğe kalıyor.
  if (g.aileAdi !== undefined) {
    const bulunan = aileBul(g.aileAdi)
    if (bulunan !== null) return bulunan
  }
  // ⚠ ⚠ **YALNIZ `akisVar` — `yuvaIstendi` ÖLÇÜT DEĞİL, ve bunu 2. doğrulama turu
  // gösterdi.** İlk sürüm `akisVar || yuvaIstendi` diyordu; hat dosyası `gorsel_yuvasi:
  // true` sabitini yazıyor, yani `yuvaIstendi` HER KOŞUDA true ve her konu `temel`
  // çıkıyordu. `akici` kodda seçilebilir hâle geldi ama üretimde hâlâ ulaşılamazdı —
  // aynı blokaj, bir katman aşağıda.
  //
  // ⚠ **Ayrım ölçülebilir:** diyagram DETERMİNİSTİK çiziliyor, her koşuda gerçekten
  // sayfaya iniyor ve süslemeyle aynı mürekkebi paylaşıyor. Fotoğraf yuvası ise bir
  // İSTEK; bedava şeritte sağlayıcı yok ve iki gerçek koşuda da boş kaldı. Üstelik dolsa
  // bile duotone onu marka eksenine indiriyor — sessiz bir öge, süslemeyle yarışmıyor.
  // **Ne çizildiğine bakılır, ne istendiğine değil.**
  return g.akisVar ? TEMEL_AILE : AKICI_AILE
}

export const tasarla = (g: TasarlaGirdisi): TasarimPlani => {
  const aile = aileSec(g)
  const toplam = g.satirlar.length
  const y = yay(toplam)
  const ortaIndex = Math.max(1, Math.ceil(toplam / 2) - 1)
  // Fotoğraf yuvası diyagramdan AYRI bir gövde slaydında: `gerilim` (indeks 1) —
  // kancadan hemen sonra, referans örnek 2'nin dili. Orta ile çakışırsa yuva açılmaz:
  // dört slaytlık bir karoselde iki görsel ögeye yer yok.
  const fotoIndex = toplam >= 5 && ortaIndex !== 1 ? 1 : null

  const slaytlar: readonly SlaytPolitikasi[] = y.map((islev, index) => ({
    index,
    islev,
    oge: ogeSecimi(islev, index, ortaIndex, fotoIndex, g),
  }))

  return {
    surum: 1,
    konu: g.konu,
    aile: {
      deger: aile.id,
      gerekce: `${aile.ad}. Estetik parametreler buradan; garanti katmanı ailenin DIŞINDA.`,
    },
    yay: y,
    suslemeYogunlugu: {
      deger: aile.suslemeYogunlugu,
      gerekce:
        'Aileden geliyor: açık kâğıt alanda ince kontur okunur, yoğun tarama koyu bir ailede doğru olurdu (D-262).',
    },
    yuvaBicimi: {
      deger: g.yuvaBicimi ?? aile.yuvaBicimi,
      gerekce:
        (g.yuvaBicimi ?? 'alan') === 'alan'
          ? 'Uçtan uca alan: fotoğraf kutu değil zemin olur, kompozisyon çerçeveyi kullanır.'
          : 'Daire maske: özne arka planından ayrılmış olmalı, yoksa daire rastgele kırpar.',
    },
    panorama: {
      deger: aile.panorama,
      gerekce:
        'Aileden geliyor: yön veren süsleme slaytlar arasında akıyor (FAZ-12.4, render bağlı).',
    },
    slaytlar,
  }
}
