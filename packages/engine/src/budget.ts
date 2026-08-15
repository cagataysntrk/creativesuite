// Bütçe kiralama (§8.3 · D-17).
//
// Tavanlar UI'dan ayarlanır: aylık · çalıştırma başına · pipeline başına. Tahminin
// ÜST sınırı tavanı aşıyorsa Başlat kilitlenir ve gerekçe Türkçe gösterilir.
//
// **Kiralama, harcama değil.** Bir adım koşmadan önce tahmininin üst sınırı kadar bütçe
// KİRALAR; koştuktan sonra gerçek tutarla kapatır. Kiralamadan çalışmak, paralel iki
// adımın aynı son 10 TL'yi ayrı ayrı "uygun" görüp ikisinin birden harcaması demektir.
//
// `possibly-charged` tutar da sayılır (§8.3): saymayan bir tavan, bilinmeyen harcamayı
// sıfır kabul eder ve tam da bilinmeyen harcamanın olduğu anda aşılır.

import type { Money } from '@suite/contracts'
import { ZERO_USD, addMoney } from '@suite/contracts'

export interface BudgetCaps {
  /** `null` = tavan yok. Sıfır ile karıştırılmaz: sıfır "hiç harcama" demektir. */
  readonly perRun: Money | null
  readonly perMonth: Money | null
}

export interface BudgetState {
  readonly caps: BudgetCaps
  readonly spentThisRun: Money
  readonly spentThisMonth: Money
  readonly leased: Money
}

export type BudgetRefusal =
  | { readonly kind: 'run_cap_exceeded'; readonly cap: Money; readonly wouldBe: Money }
  | { readonly kind: 'month_cap_exceeded'; readonly cap: Money; readonly wouldBe: Money }

export type LeaseResult =
  | { readonly ok: true; readonly state: BudgetState }
  | { readonly ok: false; readonly refusal: BudgetRefusal }

const gt = (a: Money, b: Money): boolean => a.micros > b.micros

/**
 * Bir adımın TAHMİN ÜST SINIRI kadar bütçe kiralar.
 * Üst sınır kullanılıyor, ortalama değil: ortalamayla kiralamak, tahminin üst ucuna
 * denk gelen bir çalıştırmanın tavanı sessizce aşması demektir.
 */
export const lease = (state: BudgetState, estimateHigh: Money): LeaseResult => {
  const yeniKira = addMoney(state.leased, estimateHigh)
  const runToplam = addMoney(state.spentThisRun, yeniKira)
  const ayToplam = addMoney(state.spentThisMonth, yeniKira)

  if (state.caps.perRun !== null && gt(runToplam, state.caps.perRun)) {
    return {
      ok: false,
      refusal: { kind: 'run_cap_exceeded', cap: state.caps.perRun, wouldBe: runToplam },
    }
  }
  if (state.caps.perMonth !== null && gt(ayToplam, state.caps.perMonth)) {
    return {
      ok: false,
      refusal: { kind: 'month_cap_exceeded', cap: state.caps.perMonth, wouldBe: ayToplam },
    }
  }
  return { ok: true, state: { ...state, leased: yeniKira } }
}

/**
 * Kirayı gerçek tutarla kapatır. Gerçek tutar kiradan büyük olabilir (sağlayıcı
 * tahminden pahalı çıktı) — bu bir hata DEĞİL, bir sapmadır ve manifest'te görünür.
 * Kira negatife düşmez: fazla kapatma bir muhasebe hatasıdır, sessizce yutulmaz.
 */
export const settleLease = (
  state: BudgetState,
  leasedAmount: Money,
  actual: Money
): BudgetState => {
  const kalanKira = state.leased.micros - leasedAmount.micros
  return {
    ...state,
    leased: { micros: kalanKira < 0n ? 0n : kalanKira, currency: 'USD' },
    spentThisRun: addMoney(state.spentThisRun, actual),
    spentThisMonth: addMoney(state.spentThisMonth, actual),
  }
}

export const emptyBudget = (caps: BudgetCaps): BudgetState => ({
  caps,
  spentThisRun: ZERO_USD,
  spentThisMonth: ZERO_USD,
  leased: ZERO_USD,
})

/** Türkçe gerekçe — UI bunu aynen gösterir (§8.3). */
export const refusalMessage = (r: BudgetRefusal): string => {
  const tl = (m: Money): string => `$${(Number(m.micros) / 1_000_000).toFixed(4)}`
  return r.kind === 'run_cap_exceeded'
    ? `Çalıştırma bütçesi aşılıyor: tahmin ${tl(r.wouldBe)}, tavan ${tl(r.cap)}`
    : `Aylık bütçe aşılıyor: tahmin ${tl(r.wouldBe)}, tavan ${tl(r.cap)}`
}
