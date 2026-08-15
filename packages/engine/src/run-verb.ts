// Fiil çağrısının TEK yolu (§3.10 · §8.3 · R-04 · D-69).
//
// `runStep` ham bir `StepCall` alır; bu dosya o çağrıyı bir FİİLE bağlar ve arada
// **sözleşmeyi zorlar**: metered bir fiil `CostEvent` döndürmeden geçemez.
//
// Neden ayrı bir katman: `validateVerbOutput` FAZ-1.11'de yazıldı ama hiçbir yerden
// çağrılmıyordu — docstring'i "motor bunu her çağrıdan sonra çalıştırır" diyordu, motor
// çalıştırmıyordu. Bağımsız doğrulama agent'ı bunu ölü kod olarak buldu (D-69).
// Zorlaması olmayan bir sözleşme, sözleşme değil temennidir.

import type { AppError, CorrelationId, Money } from '@suite/contracts'
import { ZERO_USD, err, ok, type Result } from '@suite/contracts'
import {
  makeError,
  validateVerbOutput,
  type Verb,
  type VerbContext,
  type VerbOutput,
} from '@suite/kernel'
import type { CallOutcome } from './scheduler.js'
import type { ChargeStatus } from './cost/ledger.js'

export interface VerbCallResult {
  readonly outcome: CallOutcome
  readonly output: VerbOutput
}

/**
 * Fiili çağırır ve çıktı sözleşmesini doğrular.
 * **Metered fiil sıfır `CostEvent` döndürürse çağrı BAŞARISIZ sayılır** — sıfır maliyetli
 * bir model çağrısı yoktur; sıfır görünüyorsa defter eksik yazılmıştır ve bütçe tavanı
 * (D-17) o adım için sessizce devre dışı kalır.
 */
export const runVerb = async (
  verb: Verb,
  ctx: VerbContext,
  input: unknown
): Promise<Result<VerbCallResult, AppError>> => {
  const sonuc = await verb.run(ctx, input)
  if (!sonuc.ok) return err(sonuc.error)

  const ihlal = validateVerbOutput(verb, sonuc.value)
  if (ihlal !== null) {
    return err(
      makeError({
        kind: 'internal',
        code: 'VERB_OUTPUT_CONTRACT_VIOLATION',
        userMessageKey: 'error.verb.contract',
        correlationId: ctx.correlationId as CorrelationId,
        details: { verb: verb.name, reason: ihlal },
      })
    )
  }

  // Maliyet fiilin bildirdiği `CostEvent`lerden TOPLANIR, tahminden kopyalanmaz (§8.3).
  let toplam: Money = ZERO_USD
  for (const c of sonuc.value.costs) {
    toplam = { micros: toplam.micros + c.amount.micros, currency: 'USD' }
  }

  // Metered olmayan fiil gerçekten hiç harcamadı: `not-charged` DOĞRU bir iddia.
  // Metered fiil harcadı ve tutarı bildirdi: `charged`.
  const chargeStatus: ChargeStatus = verb.metered ? 'charged' : 'not-charged'

  return ok({
    outcome: { amount: toplam, chargeStatus, externalId: null, data: sonuc.value.data },
    output: sonuc.value,
  })
}
