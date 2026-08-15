// Devre kesici (§8.5 · R-45).
//
// **5 ardışık hata**, `(providerId, capability)` anahtarlı. Üç sayı da kasıtlı:
//
//  - **5, 3 değil.** 3 seçilseydi 3-denemelik retry sınırıyla çakışır ve TEK mantıksal
//    çağrı kesiciyi tek başına attırırdı. Kesicinin işi "bu sağlayıcı bozuk" demek,
//    "bu istek başarısız oldu" demek değil.
//  - **Ardışık, toplam değil.** Araya giren bir başarı sayacı sıfırlar: sağlayıcı
//    çalışıyor demektir.
//  - **Anahtar (providerId, capability).** Sağlayıcı bazlı olsaydı, `image.generate`i
//    bozuk bir sağlayıcının çalışan `audio.tts`i de kapanırdı; yetenek bazlı olsaydı bir
//    sağlayıcının arızası tüm yeteneği öldürürdü.

import type { Millis } from '@suite/kernel'

export type BreakerState = 'closed' | 'open' | 'half-open'

export interface BreakerConfig {
  readonly threshold: number
  /** Açık kaldıktan sonra tek bir deneme için aralanma süresi. */
  readonly cooldownMs: number
}

export const DEFAULT_BREAKER: BreakerConfig = { threshold: 5, cooldownMs: 60_000 }

interface Entry {
  failures: number
  openedAt: Millis | null
  /** Yarı-açıkken bir deneme uçtu mu — ikinci denemeyi engeller. */
  probeInFlight: boolean
}

export const breakerKey = (providerId: string, capability: string): string =>
  `${providerId}::${capability}`

export class CircuitBreaker {
  readonly #entries = new Map<string, Entry>()
  readonly #cfg: BreakerConfig

  constructor(cfg: BreakerConfig = DEFAULT_BREAKER) {
    this.#cfg = cfg
  }

  #entry(key: string): Entry {
    const e = this.#entries.get(key)
    if (e !== undefined) return e
    const yeni: Entry = { failures: 0, openedAt: null, probeInFlight: false }
    this.#entries.set(key, yeni)
    return yeni
  }

  state(providerId: string, capability: string, nowMs: Millis): BreakerState {
    const e = this.#entry(breakerKey(providerId, capability))
    if (e.openedAt === null) return 'closed'
    return nowMs - e.openedAt >= this.#cfg.cooldownMs ? 'half-open' : 'open'
  }

  /**
   * Çağrıya izin var mı. Yarı-açıkken TEK bir deneme geçer: ikisi birden geçseydi,
   * hâlâ bozuk bir sağlayıcı her soğuma sonrası iki kez daha ücretlendirirdi.
   */
  allows(providerId: string, capability: string, nowMs: Millis): boolean {
    const key = breakerKey(providerId, capability)
    const e = this.#entry(key)
    const durum = this.state(providerId, capability, nowMs)
    if (durum === 'closed') return true
    if (durum === 'open') return false
    if (e.probeInFlight) return false
    e.probeInFlight = true
    return true
  }

  onSuccess(providerId: string, capability: string): void {
    const e = this.#entry(breakerKey(providerId, capability))
    e.failures = 0
    e.openedAt = null
    e.probeInFlight = false
  }

  onFailure(providerId: string, capability: string, nowMs: Millis): BreakerState {
    const key = breakerKey(providerId, capability)
    const e = this.#entry(key)
    e.probeInFlight = false
    e.failures += 1
    if (e.failures >= this.#cfg.threshold) e.openedAt = nowMs
    return this.state(providerId, capability, nowMs)
  }

  /** Gözlemlenebilirlik: hangi çiftler kapalı, kaç hatayla (§13). */
  snapshot(nowMs: Millis): { key: string; failures: number; state: BreakerState }[] {
    return [...this.#entries.entries()].map(([key, e]) => {
      const [providerId = '', capability = ''] = key.split('::')
      return { key, failures: e.failures, state: this.state(providerId, capability, nowMs) }
    })
  }
}
