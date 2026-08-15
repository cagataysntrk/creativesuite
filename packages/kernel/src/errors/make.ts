// Hata üreteci (§8.6 · R-41).
//
// `throw`a izin verilen TEK dizin burasıdır — ve bu dosya hiç `throw` etmez, çünkü
// hata bir DEĞERDİR (`Result`), bir kontrol akışı sıçraması değil. Bir istisna,
// çağıranın tip imzasında görünmez; gözetimsiz bir 03:00 çalıştırmasında yakalanmamış
// istisna, maliyeti defterine yazılmamış yarım bir çalıştırma bırakır.
//
// ⚠ FAZ-1.7 bunun üstüne `classify()` toplam fonksiyonunu ve `ErrorKind` başına retry
// sınıflandırmasını ekler. Burada yalnız üretici var; taksonominin kendisi contracts'ta.

import type { AppError, ErrorKind, Money, CorrelationId } from '@suite/contracts'
import { ZERO_USD } from '@suite/contracts'

export interface MakeErrorInput {
  readonly kind: ErrorKind
  /** İngilizce SCREAMING_SNAKE. Türkçe buraya asla girmez (D-37). */
  readonly code: string
  readonly userMessageKey: string
  readonly correlationId: CorrelationId
  /** Bu hata oluşana kadar harcanan para. Verilmezse sıfır — ama BİLİNÇLİ sıfır. */
  readonly costIncurred?: Money
  readonly retryable?: boolean
  readonly cause?: unknown
  readonly details?: Readonly<Record<string, unknown>>
}

export const makeError = (input: MakeErrorInput): AppError => ({
  kind: input.kind,
  code: input.code,
  userMessageKey: input.userMessageKey,
  correlationId: input.correlationId,
  costIncurred: input.costIncurred ?? ZERO_USD,
  retryable: input.retryable ?? false,
  ...(input.cause === undefined ? {} : { cause: input.cause }),
  ...(input.details === undefined ? {} : { details: input.details }),
})
