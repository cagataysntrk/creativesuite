// Yeniden deneme zamanlaması (§8.5 · R-45).
//
// Sınıflandırma kernel'de (`classify`); burada yalnız ZAMANLAMA var. Ayrım kasıtlı:
// "bu hata denenir mi" bir taksonomi sorusudur ve tek yerde cevaplanır; "ne kadar sonra"
// bir zamanlama sorusudur ve motorun işidir.
//
// **Tam jitter** kullanılıyor, "eşit jitter" veya sabit gecikme değil: aynı anda düşen
// beş adım sabit gecikmeyle beşi birden aynı anda geri döner ve sağlayıcıyı ikinci kez
// yıkar. Tam jitter [0, tavan) aralığına yayar.

import type { AppError } from '@suite/contracts'
import { classify, type Rng } from '@suite/kernel'

export interface RetryPolicy {
  readonly maxAttempts: number
  readonly baseDelayMs: number
  readonly maxDelayMs: number
}

export const DEFAULT_RETRY: RetryPolicy = {
  // 3 deneme; devre kesici 5'te açılır. Beş, üçün katı DEĞİL — kasıtlı:
  // 3 seçilseydi tek mantıksal çağrının retry'ları kesiciyi tek başına attırırdı (R-45).
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 30_000,
}

export interface RetryDecision {
  readonly retry: boolean
  readonly delayMs: number
  readonly reason: string
}

/**
 * `Retry-After` başlığını saniye veya HTTP-date olarak okur.
 * Sağlayıcı açıkça bir süre söylüyorsa kendi üstel gecikmemizi dayatmak, o süreyi
 * görmezden gelip banlanmanın yoludur (§8.5).
 */
export const parseRetryAfter = (value: string | null, nowMs: number): number | null => {
  if (value === null) return null
  const saniye = Number(value)
  if (Number.isFinite(saniye) && saniye >= 0) return Math.round(saniye * 1000)
  const tarih = Date.parse(value)
  return Number.isNaN(tarih) ? null : Math.max(0, tarih - nowMs)
}

/**
 * Bir hatanın yeniden denenip denenmeyeceğine ve ne zaman deneneceğine karar verir.
 * `attempt` 1'den başlar (ilk deneme).
 */
export const decideRetry = (
  error: AppError,
  attempt: number,
  rng: Rng,
  policy: RetryPolicy = DEFAULT_RETRY,
  retryAfterMs: number | null = null
): RetryDecision => {
  const p = classify(error.kind)

  if (!p.retryable) {
    return { retry: false, delayMs: 0, reason: `${error.kind} yeniden denenmez` }
  }
  if (attempt >= policy.maxAttempts) {
    return {
      retry: false,
      delayMs: 0,
      reason: `deneme hakkı bitti (${attempt}/${policy.maxAttempts})`,
    }
  }

  if (p.backoff === 'immediate') {
    return { retry: true, delayMs: 0, reason: 'yerel hata, hemen tekrar' }
  }

  if (p.backoff === 'respect-retry-after' && retryAfterMs !== null) {
    return {
      retry: true,
      delayMs: Math.min(retryAfterMs, policy.maxDelayMs),
      reason: `sağlayıcı Retry-After: ${retryAfterMs}ms`,
    }
  }

  // Üstel + TAM jitter: [0, min(tavan, taban·2^(n-1)))
  const tavan = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** (attempt - 1))
  return {
    retry: true,
    delayMs: Math.floor(rng.next() * tavan),
    reason: `üstel geri çekilme, tam jitter (tavan ${tavan}ms)`,
  }
}
