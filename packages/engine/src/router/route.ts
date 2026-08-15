// Yetenek yönlendiricisi — beş aşama (§8.2 · R-40 · D-2, D-17, D-32).
//
// Pipeline **yetenek + kısıt** ister, model adı değil (R-40). Bu dosya "hangi sağlayıcı"
// sorusunu cevaplar ve cevabını **yazılı gerekçeyle** verir.
//
// **Beşinci aşama bu tasarımın asıl fikridir.** Kazananı seçmek kolay; sistemi
// yönetilebilir yapan şey **her kaybedenin neden elendiğinin** kayda geçmesi. Altı ay
// sonra "neden bu model seçildi" sorusunun cevabı manifest'te yazılı olacak. Sessiz
// eleme, yönlendirmeyi sihre çevirir — ve sihir hata ayıklanamaz.
//
// **Aday yok ≠ aday var ama kullanılamıyor.** İkisi kullanıcıya farklı şeyler yaptırır:
// birincisi "bu yeteneği kimse yapmıyor", ikincisi "anahtarı tanımla". Karıştıran bir
// yönlendirici, çözülebilir bir sorunu çözülemez gösterir.

import type { Money, MoneyRange } from '@suite/contracts'
import { ZERO_USD, usd } from '@suite/contracts'
import type { Candidate, Lane } from '@suite/providers'
import { evaluateFormula } from './formula.js'

/** Adımın tercihi — skorlama ağırlığını bu belirler (§8.2 aşama 3). */
export type Prefer = 'cost' | 'quality' | 'latency'

export interface CapabilityRequest {
  readonly capability: string
  readonly lane: Lane
  /** Tipli kısıtlar: `aspect: '9:16'`, `seconds: 6`. Filtre bunları okur. */
  readonly constraints: Readonly<Record<string, string | number | boolean>>
  /** Maliyet formülüne geçecek sayısal parametreler (`num_images`, `steps`…). */
  readonly params: Readonly<Record<string, number>>
  readonly prefer: Prefer
  /** `null` = adım tavanı yok; çalıştırma tavanı yine de `budget.ts`'te uygulanır. */
  readonly maxCost: Money | null
}

/** Sağlayıcının fiyat ve kalite BEYANI — tanımlayıcıdan gelir, koddan değil (D-32). */
export interface ProviderPricing {
  readonly providerId: string
  readonly costFormula: string | null
  /** Fiyat anlık görüntüsü doğrulanmış mı (§8.3). Değilse güven noktası düşer. */
  readonly pricingVerified: boolean
  /** 0-100. Bake-off çıktısı; yoksa 50 (bilinmiyor, iyi de kötü de değil). */
  readonly quality: number
  /** Tipik duvar saati, saniye. `null` = bilinmiyor. */
  readonly latencySeconds: number | null
  readonly supports: Readonly<Record<string, readonly (string | number | boolean)[]>>
}

/**
 * Neden elendi. Her biri kullanıcıya farklı bir eylem yaptırır — bu yüzden tek bir
 * "uygun değil" gerekçesi yeterli değil.
 */
export type RejectionReason =
  | { readonly kind: 'lane_mismatch'; readonly wanted: Lane; readonly has: readonly Lane[] }
  | { readonly kind: 'unavailable'; readonly detail: string }
  | {
      readonly kind: 'constraint_unsupported'
      readonly constraint: string
      readonly wanted: string | number | boolean
      readonly supported: readonly (string | number | boolean)[]
    }
  | { readonly kind: 'no_pricing' }
  | { readonly kind: 'formula_error'; readonly detail: string }
  | { readonly kind: 'over_step_cap'; readonly cost: Money; readonly cap: Money }

export interface Priced {
  readonly providerId: string
  readonly title: string
  readonly cost: MoneyRange
  /**
   * Tahminin güven noktası (§8.3): `green` birim başına kesin fiyat · `amber`
   * doğrulanmamış fiyat anlık görüntüsü · `red` fiyatlanamaz.
   */
  readonly confidence: 'green' | 'amber' | 'red'
  readonly quality: number
  readonly latencySeconds: number | null
  readonly score: number
}

export interface Rejected {
  readonly providerId: string
  readonly title: string
  readonly reason: RejectionReason
}

export interface RoutingDecision {
  /** `null` = hiçbir aday geçmedi. `rejected` neden geçmediğini söyler. */
  readonly winner: Priced | null
  /** Kazanandan sonraki sıralı adaylar — yedek zinciri (§8.2 aşama 4). */
  readonly fallbacks: readonly Priced[]
  /** **Her** kaybeden, gerekçesiyle. Manifest'e bu yazılır (§13). */
  readonly rejected: readonly Rejected[]
}

const OLCU = 1_000_000

/** Kısıt desteği: sağlayıcı bu kısıtı hiç bilmiyorsa serbesttir, biliyorsa değeri
 * listede OLMAK ZORUNDA. "Bilmiyorum" ile "desteklemiyorum" karıştırılmaz —
 * karıştırılsaydı, `supports` bloğu eksik yazılmış her sağlayıcı elenirdi. */
const kisitUyuyor = (
  desteklenen: readonly (string | number | boolean)[] | undefined,
  istenen: string | number | boolean
): boolean => desteklenen === undefined || desteklenen.includes(istenen)

/**
 * Skor: 0-1 aralığında üç bileşen, `prefer` ile ağırlıklı.
 *
 * Maliyet bileşeni **grup içinde göreli** hesaplanır (en ucuz = 1.0). Mutlak bir eşik
 * kullanılsaydı sayı bugünün fiyatlarına gömülür ve fiyatlar düştüğünde anlamsızlaşırdı.
 */
const skorla = (
  p: { cost: MoneyRange; quality: number; latencySeconds: number | null },
  enUcuz: bigint,
  enHizli: number,
  prefer: Prefer
): number => {
  const maliyet = p.cost.high.micros === 0n ? 1 : Number(enUcuz) / Number(p.cost.high.micros)
  const kalite = p.quality / 100
  const gecikme = p.latencySeconds === null ? 0.5 : enHizli / Math.max(p.latencySeconds, 0.001)
  const a =
    prefer === 'cost'
      ? { m: 0.6, k: 0.25, g: 0.15 }
      : prefer === 'quality'
        ? { m: 0.15, k: 0.7, g: 0.15 }
        : { m: 0.2, k: 0.2, g: 0.6 }
  return Math.round((a.m * maliyet + a.k * kalite + a.g * gecikme) * OLCU) / OLCU
}

/**
 * Beş aşama tek geçişte: filtrele → fiyatla → skorla → sırala → kazanan + kaybedenler.
 *
 * **Saf ve senkron.** Ağ yok, dosya yok, saat yok. `just plan`'ın hiçbir şey harcamadan
 * gerçek bir aralık basabilmesinin sebebi bu (R-47).
 */
export const route = (
  req: CapabilityRequest,
  candidates: readonly Candidate[],
  pricing: Readonly<Record<string, ProviderPricing>>
): RoutingDecision => {
  const gecenler: Priced[] = []
  const elenenler: Rejected[] = []

  for (const c of candidates) {
    const ele = (reason: RejectionReason): void => {
      elenenler.push({ providerId: c.providerId, title: c.title, reason })
    }

    if (!c.lanes.includes(req.lane)) {
      ele({ kind: 'lane_mismatch', wanted: req.lane, has: c.lanes })
      continue
    }
    if (!c.available) {
      ele({ kind: 'unavailable', detail: c.unavailableReason ?? 'sebep bildirilmedi' })
      continue
    }

    const fiyat = pricing[c.providerId]
    if (fiyat === undefined || fiyat.costFormula === null) {
      // Fiyatsız sağlayıcı **aday olamaz**. "Bilinmiyor"u 0 saymak, tavanı bilmeden
      // aşmak demektir (§8.3).
      ele({ kind: 'no_pricing' })
      continue
    }

    let kisitHatasi = false
    for (const [ad, deger] of Object.entries(req.constraints)) {
      if (!kisitUyuyor(fiyat.supports[ad], deger)) {
        ele({
          kind: 'constraint_unsupported',
          constraint: ad,
          wanted: deger,
          supported: fiyat.supports[ad] ?? [],
        })
        kisitHatasi = true
        break
      }
    }
    if (kisitHatasi) continue

    const r = evaluateFormula(fiyat.costFormula, req.params)
    if (!r.ok) {
      ele({ kind: 'formula_error', detail: r.error.kind })
      continue
    }

    // Doğrulanmamış fiyat bir ARALIK üretir, tek sayı değil: bilmediğimizi bilmek,
    // bilmediğimizi tahmin etmekten iyidir (§8.3). ±%25 bant, `amber` güvenle.
    const dogrulanmis = fiyat.pricingVerified
    const cost: MoneyRange = dogrulanmis
      ? { low: r.value, high: r.value }
      : { low: usd((r.value.micros * 75n) / 100n), high: usd((r.value.micros * 125n) / 100n) }

    if (req.maxCost !== null && cost.high.micros > req.maxCost.micros) {
      ele({ kind: 'over_step_cap', cost: cost.high, cap: req.maxCost })
      continue
    }

    gecenler.push({
      providerId: c.providerId,
      title: c.title,
      cost,
      confidence: dogrulanmis ? 'green' : 'amber',
      quality: fiyat.quality,
      latencySeconds: fiyat.latencySeconds,
      score: 0,
    })
  }

  if (gecenler.length === 0) return { winner: null, fallbacks: [], rejected: elenenler }

  const enUcuz = gecenler.reduce(
    (m, p) => (p.cost.high.micros < m ? p.cost.high.micros : m),
    gecenler[0]?.cost.high.micros ?? 0n
  )
  const gecikmeler = gecenler.map((p) => p.latencySeconds).filter((s): s is number => s !== null)
  const enHizli = gecikmeler.length > 0 ? Math.min(...gecikmeler) : 1

  const skorlu = gecenler
    .map((p) => ({ ...p, score: skorla(p, enUcuz, enHizli, req.prefer) }))
    // Beraberlikte `providerId` ile kırılıyor: sıralama DETERMİNİSTİK olmalı, yoksa
    // aynı plan iki kez farklı sağlayıcı seçer ve `just plan` yalan söyler.
    .sort((a, b) => b.score - a.score || a.providerId.localeCompare(b.providerId))

  return {
    winner: skorlu[0] ?? null,
    fallbacks: skorlu.slice(1),
    rejected: elenenler,
  }
}

/** Toplam tahmin aralığı — adım aralıklarının toplamı (§8.3). */
export const totalEstimate = (kararlar: readonly RoutingDecision[]): MoneyRange =>
  kararlar.reduce<MoneyRange>(
    (t, k) =>
      k.winner === null
        ? t
        : {
            low: usd(t.low.micros + k.winner.cost.low.micros),
            high: usd(t.high.micros + k.winner.cost.high.micros),
          },
    { low: ZERO_USD, high: ZERO_USD }
  )

/**
 * Tanımlayıcı → fiyat beyanı köprüsü.
 *
 * Kalite ve gecikme **tanımlayıcıda yok** (bake-off çıktısıdır, FAZ-0.D.1). Yoklarsa
 * 50/`null` verilir: "bilinmiyor" nötrdür, sıfır değil. Sıfır verilseydi kalitesi hiç
 * ölçülmemiş bir sağlayıcı `prefer: quality` altında daima elenirdi ve bake-off'un
 * sonucu, bake-off yapılmadan verilmiş olurdu.
 */
export const pricingFromDescriptor = (
  d: {
    readonly id: string
    readonly capabilities: readonly {
      readonly name: string
      readonly supports: Readonly<Record<string, readonly (string | number | boolean)[]>>
    }[]
    readonly costFormula: string | null
    readonly pricingVerified: boolean
  },
  capability: string
): ProviderPricing => ({
  providerId: d.id,
  costFormula: d.costFormula,
  pricingVerified: d.pricingVerified,
  quality: 50,
  latencySeconds: null,
  supports: d.capabilities.find((c) => c.name === capability)?.supports ?? {},
})
