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
  yay,
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
}

/** Bugünkü tek aile — amber/mürekkep, akan eğri, dev hayalet rakam. */
export const VARSAYILAN_AILE = 'temel'

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
  if (index === ortaIndex && g.yuvaIstendi)
    return {
      deger: 'gorsel-yuvasi',
      gerekce: 'Akış yok ve hat fotoğraf yuvası istiyor; gövdenin ortasında yuva açılıyor.',
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
export const tasarla = (g: TasarlaGirdisi): TasarimPlani => {
  const toplam = g.satirlar.length
  const y = yay(toplam)
  const ortaIndex = Math.max(1, Math.ceil(toplam / 2) - 1)

  const slaytlar: readonly SlaytPolitikasi[] = y.map((islev, index) => ({
    index,
    islev,
    oge: ogeSecimi(islev, index, ortaIndex, g),
  }))

  return {
    surum: 1,
    konu: g.konu,
    aile: {
      deger: VARSAYILAN_AILE,
      gerekce: 'Tek aile tanımlı: amber/mürekkep iki alan, akan eğri, dev hayalet rakam.',
    },
    yay: y,
    suslemeYogunlugu: {
      deger: 0.25,
      gerekce:
        'Açık kâğıt alanda ince kontur okunur; yoğun tarama koyu bir ailede doğru olurdu (D-262).',
    },
    panorama: {
      deger: false,
      gerekce: 'Panoramik süreklilik henüz bağlı değil (FAZ-12.4); açık demek yalan olurdu.',
    },
    slaytlar,
  }
}
