// TCMB kuru — YALNIZCA GÖRÜNTÜ (§8.3 · D-36 · R-41).
//
// **Para USD mikro'dur. TRY bir hesap birimi değil, bir okuma kolaylığıdır.** Bütçe
// tavanı, kiralama, defter — hepsi USD mikro üzerinden çalışır ve TRY'ye hiç uğramaz.
//
// **Kur asla çalıştırma anında çekilmez.** Çekilseydi aynı çalıştırma iki kez farklı
// maliyet raporlardı ve "tahmini vs gerçek" karşılaştırması (§13) anlamsızlaşırdı —
// sapmanın fiyat mı kur mu olduğu ayırt edilemezdi. Kur `registry/rates/tcmb-<tarih>.json`
// içinde SABİTLENMİŞ bir anlık görüntüdür ve plana dondurulur.

import type { Money } from '@suite/contracts'

export interface RateSnapshot {
  readonly date: string
  readonly usdTry: number
  /** Kur XML'den doğrulandı mı. `false` ise gösterimde AÇIKÇA belirtilir. */
  readonly verified: boolean
}

/**
 * Görüntü dizesi. Dönüş `string`; `Money` DÖNMEZ — TRY'de bir `Money` üretmek, onu
 * toplanabilir kılar ve ilk toplamada para modeli iki birime bölünür.
 *
 * Biçim `tr-TR`: binlik ayıracı nokta, ondalık virgül (§12.2).
 */
export const displayTry = (m: Money, rate: RateSnapshot): string => {
  const usd = Number(m.micros) / 1_000_000
  const tl = usd * rate.usdTry
  const sayi = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(tl)
  // Doğrulanmamış kur SESSİZ kalmaz: "≈" ve tarih, okuyana bunun bir çeviri olduğunu
  // ve ne zamanki kurla yapıldığını söyler.
  return `≈ ${sayi} ₺ (${rate.date}${rate.verified ? '' : ', doğrulanmamış kur'})`
}

/** USD gösterimi — hesabın gerçek birimi. Bu her zaman gösterilir, TRY yalnız yanında. */
export const displayUsd = (m: Money): string => `$${(Number(m.micros) / 1_000_000).toFixed(4)}`
