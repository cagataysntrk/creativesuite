// Hata sınıflandırması — TOPLAM fonksiyon (§8.6 · §8.5 · R-41, R-45).
//
// `classify()` her `ErrorKind` için tanımlıdır. Toplamlık `switch` ile değil, tam bir
// `Record<ErrorKind, …>` ile sağlanır: `ErrorKind`'a yeni bir değer eklenip buraya
// karşılığı yazılmazsa `tsc` **eksik özellik** hatası verir. `switch`'te aynı garantiyi
// almak için `default: assertNever` gerekir ve o da yazılmayı unutulabilir; tablo
// unutulamaz — derleyici tablonun eksiğini doğrudan görür.
//
// Neden önemli: sınıflandırılmamış bir hata, motorun onu "yeniden denenebilir" sanıp
// para harcayarak üç kez tekrarlamasına ya da geçici bir 429'da çalıştırmayı öldürmesine
// yol açar. İkisi de sessizdir; biri fatura, diğeri kayıp iş üretir.

import type { AppError, ErrorKind, Money } from '@suite/contracts'
import { ERROR_KINDS, addMoney } from '@suite/contracts'

/** Yeniden deneme aralığının nasıl büyüyeceği (§8.5). */
export type BackoffKind = 'none' | 'immediate' | 'exponential' | 'respect-retry-after'

export interface ErrorPolicy {
  /** Motor bu hatayı tekrar denemeli mi. */
  readonly retryable: boolean
  readonly backoff: BackoffKind
  /**
   * Devre kesici sayacını artırır mı (R-45).
   * Kullanıcı hatası sayacı artırmamalı: geçersiz bir brief 5 kez gönderildiğinde
   * sağlayıcı devre dışı kalırsa, hatanın sahibi cezalandırılan taraf olmaz.
   */
  readonly trips: boolean
  /** İnsan müdahalesi olmadan asla düzelmez — kuyruğa alıp beklemek anlamsız. */
  readonly humanActionable: boolean
}

const POLICIES: Record<ErrorKind, ErrorPolicy> = {
  // ── yapılandırma ve girdi: tekrar denemek aynı sonucu verir ────────────────
  config: { retryable: false, backoff: 'none', trips: false, humanActionable: true },
  validation: { retryable: false, backoff: 'none', trips: false, humanActionable: true },
  not_found: { retryable: false, backoff: 'none', trips: false, humanActionable: true },
  conflict: { retryable: false, backoff: 'none', trips: false, humanActionable: true },

  // ── sağlayıcı: kimlik ve kota insan işi, hız ve erişilebilirlik zaman işi ──
  provider_auth: { retryable: false, backoff: 'none', trips: false, humanActionable: true },
  provider_quota: { retryable: false, backoff: 'none', trips: false, humanActionable: true },
  provider_rate_limit: {
    retryable: true,
    // `Retry-After` başlığı varsa ona uyulur. Kendi üstel gecikmemizi dayatmak,
    // sağlayıcının açıkça söylediği süreyi görmezden gelip banlanmanın yoludur.
    backoff: 'respect-retry-after',
    trips: false,
    humanActionable: false,
  },
  provider_unavailable: {
    retryable: true,
    backoff: 'exponential',
    trips: true,
    humanActionable: false,
  },
  provider_bad_response: {
    // Şema dışı yanıt bazen geçici (kesik akış), bazen kalıcı (API değişti).
    // Denenir ama devre kesiciyi de besler: kalıcıysa 5 hatada zaten kapanır.
    retryable: true,
    backoff: 'exponential',
    trips: true,
    humanActionable: false,
  },

  // ── politika ve bütçe: tekrar denemek yasağı çiğnemektir ──────────────────
  content_rejected: { retryable: false, backoff: 'none', trips: false, humanActionable: true },
  budget_exceeded: { retryable: false, backoff: 'none', trips: false, humanActionable: true },

  // ── zamanlama ve iptal ────────────────────────────────────────────────────
  timeout: { retryable: true, backoff: 'exponential', trips: true, humanActionable: false },
  // İptal bir KARARDIR, bir arıza değil. Yeniden denemek kullanıcının kararını ezer.
  cancelled: { retryable: false, backoff: 'none', trips: false, humanActionable: false },

  // ── yerel çalıştırma ──────────────────────────────────────────────────────
  render_failed: { retryable: true, backoff: 'immediate', trips: false, humanActionable: false },
  subprocess_failed: {
    retryable: true,
    backoff: 'immediate',
    trips: false,
    humanActionable: false,
  },
  io: { retryable: true, backoff: 'exponential', trips: false, humanActionable: false },

  // ── bilinmeyen: denenmez. Bilinmeyen bir hatayı tekrarlamak, bilinmeyen bir
  //    yan etkiyi tekrarlamaktır — yarım yayın, çift ücret, bozuk dosya.
  internal: { retryable: false, backoff: 'none', trips: false, humanActionable: true },
}

export const classify = (kind: ErrorKind): ErrorPolicy => POLICIES[kind]

/** Kapalı birleşimin tükendiğini derleme zamanında iddia eder. */
export const assertNever = (x: never): never => x

/**
 * `AppError.retryable` alanı ile politika ayrışabilir mi? Ayrışmamalı.
 * Üretici alanı `classify()`'dan doldurmadıysa bu fonksiyon farkı görünür kılar.
 */
export const policyMatchesError = (e: AppError): boolean =>
  classify(e.kind).retryable === e.retryable

/** Tüm `ErrorKind`'ların politikası var mı — çalışma zamanı ikinci kontrolü. */
export const allKindsClassified = (): boolean => ERROR_KINDS.every((k) => k in POLICIES)

// ── maliyet birikimi ─────────────────────────────────────────────────────────

/**
 * Bir hataya, o hataya kadar harcanmış parayı ekler.
 * 3 görsel ürettikten sonra gelen 429 yine de para harcadı; `costIncurred`'ı
 * güncellemeden hatayı yukarı fırlatmak, maliyet defterini sessizce eksik bırakır (§13).
 */
export const withCost = (e: AppError, extra: Money): AppError => ({
  ...e,
  costIncurred: addMoney(e.costIncurred, extra),
})
