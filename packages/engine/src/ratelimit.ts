// Token kovası (§8.5 · R-45 kardeşi).
//
// **Limiter çağrının ÖNÜNDE durur, arkasında değil.** 429 alıp yeniden denemek de bir
// strateji ama pahalı: bazı sağlayıcılar reddedilen isteği de sayar, bazıları arka
// arkaya 429'da hesabı geçici olarak kilitler. Kendi hızımızı kendimiz sınırlarsak
// sağlayıcının bizi sınırlamasına gerek kalmaz.
//
// **Saat DIŞARIDAN gelir, `setInterval` yok.** Bir zamanlayıcı, gözetimsiz bir
// çalıştırmada süreç uyuduğunda sessizce kayar; kova ise "en son ne zaman doldurdum"
// sorusunu her çağrıda saate sorar ve uyumadan etkilenmez. Ayrıca testte saat elle
// ilerletilebilir — gerçek beklemeye ihtiyaç kalmaz.
//
// **Anahtar `(providerId, capability)`.** Sağlayıcı bazında tek kova yanlış olurdu:
// aynı sağlayıcının görsel ve metin uçları ayrı limitlere tabi ve biri diğerini
// aç bırakmamalı.

import type { AppError, CorrelationId } from '@suite/contracts'
import { makeError, systemClock, type Clock } from '@suite/kernel'

export interface BucketConfig {
  /** Kova kapasitesi — ani yük (burst) bu kadar isteği bekletmeden geçirir. */
  readonly capacity: number
  /** Saniyede eklenen token. `2` = sürekli rejimde saniyede iki istek. */
  readonly refillPerSecond: number
}

export const DEFAULT_BUCKET: BucketConfig = { capacity: 5, refillPerSecond: 2 }

interface Kova {
  tokens: number
  lastMs: number
}

export const bucketKey = (providerId: string, capability: string): string =>
  `${providerId}::${capability}`

export type RateDecision =
  | { readonly allowed: true }
  /** İzin yok. `retryAfterMs` **tahmin değil hesap**: kovanın dolmasına kalan süre. */
  | { readonly allowed: false; readonly retryAfterMs: number }

export class RateLimiter {
  readonly #kovalar = new Map<string, Kova>()
  readonly #cfg: BucketConfig
  readonly #clock: Clock

  constructor(cfg: BucketConfig = DEFAULT_BUCKET, clock: Clock = systemClock) {
    this.#cfg = cfg
    this.#clock = clock
  }

  /** Bir token ister. **Yan etkilidir**: izin verdiyse token'ı düşürür. */
  take(providerId: string, capability: string): RateDecision {
    const k = bucketKey(providerId, capability)
    const now = this.#clock.now()
    const mevcut = this.#kovalar.get(k) ?? { tokens: this.#cfg.capacity, lastMs: now }

    const gecenMs = Math.max(0, now - mevcut.lastMs)
    const eklenen = (gecenMs / 1000) * this.#cfg.refillPerSecond
    const tokens = Math.min(this.#cfg.capacity, mevcut.tokens + eklenen)

    if (tokens < 1) {
      // Kovayı GÜNCELLE ama token düşürme: reddedilen istek de zamanın geçtiğini görmeli,
      // yoksa `lastMs` donar ve kova bir daha hiç dolmaz.
      this.#kovalar.set(k, { tokens, lastMs: now })
      const eksik = 1 - tokens
      return { allowed: false, retryAfterMs: Math.ceil((eksik / this.#cfg.refillPerSecond) * 1000) }
    }

    this.#kovalar.set(k, { tokens: tokens - 1, lastMs: now })
    return { allowed: true }
  }

  /** Gözlem — test ve `doctor` ekranı için. Yan etkisi YOK. */
  available(providerId: string, capability: string): number {
    const mevcut = this.#kovalar.get(bucketKey(providerId, capability))
    if (mevcut === undefined) return this.#cfg.capacity
    const gecenMs = Math.max(0, this.#clock.now() - mevcut.lastMs)
    return Math.min(
      this.#cfg.capacity,
      mevcut.tokens + (gecenMs / 1000) * this.#cfg.refillPerSecond
    )
  }
}

export const rateLimitError = (
  providerId: string,
  capability: string,
  retryAfterMs: number,
  correlationId: CorrelationId
): AppError =>
  makeError({
    kind: 'provider_rate_limit',
    code: 'LOCAL_RATE_LIMIT',
    userMessageKey: 'error.provider.localRateLimit',
    correlationId,
    retryable: true,
    // Sağlayıcının 429'undan AYRI bir kod: bu limiti biz koyduk ve tavanı UI'dan
    // değiştirilebilir. İkisini aynı koda toplamak, "sağlayıcı mı kısıtlıyor biz mi"
    // sorusunu log'dan cevaplanamaz yapardı.
    details: { providerId, capability, retryAfterMs, source: 'local' },
  })
