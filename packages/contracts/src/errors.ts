// Hata taksonomisi (§8.6 · R-41).
//
// KAPALI ayrık birleşim. Yeni bir tür eklenip `classify()` güncellenmezse `tsc` kırmızıya
// döner — hata sınıflandırması unutulabilecek bir şey olmamalı.
//
// Her hata `costIncurred` TAŞIR: 3 görsel ürettikten sonra gelen bir 429 yine de para
// harcadı. Bunu taşımayan bir hata modeli maliyet defterini sessizce eksik bırakır ve
// "tahmin vs gerçek" karşılaştırması (§13) yalan söylemeye başlar.

import type { Money } from './money.js'
import type { CorrelationId } from './brand.js'

/**
 * Çalışma zamanı listesi VE tip, tek kaynaktan. İkisini ayrı yazmak, birinin
 * sessizce eksik kalması demekti — tam olarak `classify()`'ın kaçırdığı durum.
 */
export const ERROR_KINDS = [
  'config',
  'validation',
  'not_found',
  'conflict',
  'provider_auth',
  'provider_rate_limit',
  'provider_quota',
  'provider_unavailable',
  'provider_bad_response',
  'content_rejected',
  'policy_blocked',
  'budget_exceeded',
  'timeout',
  'cancelled',
  'render_failed',
  'subprocess_failed',
  'io',
  'internal',
] as const

export type ErrorKind = (typeof ERROR_KINDS)[number]

export interface AppError {
  readonly kind: ErrorKind

  /**
   * Makine okunur kod, İngilizce SCREAMING_SNAKE (D-37).
   * Türkçe buraya ASLA girmez — `code: "SAĞLAYICI_HATASI"` bu sistemdeki en tipik
   * dil sızıntısıdır ve `docs-language` kapısı tam olarak onu arar.
   */
  readonly code: string

  /** UI kataloğunda Türkçe karşılığı olan İngilizce anahtar. Metnin kendisi değil. */
  readonly userMessageKey: string

  /** Bu hata oluşana kadar HARCANAN para. Sıfır olabilir, eksik olamaz. */
  readonly costIncurred: Money

  /** Motorun yeniden deneme sınıflandırması için (§8.5). */
  readonly retryable: boolean

  /** Log, manifest ve UI hata yüzeyi aynı id'yi gösterir — kopyalanabilir olmalı. */
  readonly correlationId: CorrelationId

  /** `Error.cause` zinciri korunur: kök neden kaybolmaz. */
  readonly cause?: unknown

  /** Yapılandırılmış bağlam. Anahtarlar İngilizce, değerler serileştirilebilir. */
  readonly details?: Readonly<Record<string, unknown>>
}
