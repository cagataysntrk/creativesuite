// `Error.cause` zinciri (§8.6).
//
// Kök neden KAYBOLMAZ. Bir sağlayıcı hatası dört katmandan geçerek yukarı çıkarken
// her katman bağlam ekler; en üstte yalnız "GENERATE başarısız" görmek, hata ayıklamayı
// gözetimsiz bir çalıştırmada imkânsız kılar — o çalıştırma bir daha tekrarlanamaz,
// çünkü neyin niye kırıldığı hiçbir yerde yazmıyor.
//
// Bu dosya `throw` ETMEZ. Hata bir değerdir (`Result`); zincir de bir veri yapısıdır.

import type { AppError, CorrelationId } from '@suite/contracts'
import { makeError } from './make.js'

/** Zincirdeki tek bir halkanın okunabilir özeti. */
export interface ChainLink {
  readonly name: string
  readonly message: string
}

const MAX_DEPTH = 32 // döngüsel `cause` zincirine karşı — sonsuz döngü hata ayıklamaz

/**
 * `cause` zincirini kökten yaprağa değil, YAPRAKTAN KÖKE sıralı olarak düzleştirir:
 * ilk eleman en dıştaki (en yakın) hata, sonuncusu kök nedendir.
 */
export const chainOf = (value: unknown): ChainLink[] => {
  const out: ChainLink[] = []
  const gorulen = new Set<unknown>()
  let cur: unknown = value

  while (cur !== null && cur !== undefined && out.length < MAX_DEPTH) {
    if (gorulen.has(cur)) break
    gorulen.add(cur)

    if (cur instanceof Error) {
      out.push({ name: cur.name, message: cur.message })
      cur = cur.cause
      continue
    }
    if (typeof cur === 'object' && 'kind' in (cur as object) && 'code' in (cur as object)) {
      const e = cur as AppError
      out.push({ name: `${e.kind}/${e.code}`, message: e.userMessageKey })
      cur = e.cause
      continue
    }
    out.push({ name: 'unknown', message: String(cur) })
    break
  }
  return out
}

/** Tek satırlık okunabilir zincir: `io/HTTP_REQUEST_FAILED ← TypeError: fetch failed` */
export const formatChain = (value: unknown): string =>
  chainOf(value)
    .map((l) => `${l.name}: ${l.message}`)
    .join(' ← ')

/** Zincirin en dibindeki neden — asıl arıza. */
export const rootCause = (value: unknown): ChainLink | null => chainOf(value).at(-1) ?? null

// ── bilinmeyeni sözleşmeye sokmak ────────────────────────────────────────────

const ABORT_NAMES = new Set(['AbortError', 'TimeoutError'])

/**
 * Yakalanmış bilinmeyen bir değeri `AppError`'a çevirir — `cause` KORUNARAK.
 *
 * Sınıflandırma muhafazakârdır: tanımadığımız her şey `internal` olur ve `internal`
 * yeniden DENENMEZ. Bilinmeyen bir hatayı tekrarlamak, bilinmeyen bir yan etkiyi
 * tekrarlamaktır — yarım yayın, çift ücret, bozuk dosya.
 */
export const fromUnknown = (cause: unknown, correlationId: CorrelationId): AppError => {
  if (cause instanceof Error && ABORT_NAMES.has(cause.name)) {
    return makeError({
      kind: 'cancelled',
      code: 'OPERATION_CANCELLED',
      userMessageKey: 'error.cancelled',
      correlationId,
      cause,
    })
  }

  return makeError({
    kind: 'internal',
    code: 'UNEXPECTED',
    userMessageKey: 'error.unexpected',
    correlationId,
    cause,
    details: { chain: formatChain(cause) },
  })
}
