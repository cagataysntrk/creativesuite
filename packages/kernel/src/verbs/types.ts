// Fiil sözleşmesi (§3.10 · R-02, R-04, R-06 · D-35, D-40).
//
// Dokuz fiilin HEPSİ aynı imzayı taşır. Sebep tek: motor zamanlama, yeniden deneme,
// maliyet ve replay'i BİR KEZ yazsın. Her fiile özel imza, motorun her fiil için ayrı
// dal tutması demekti — ve o dallardan biri er geç maliyet defterini atlardı.
//
// Her fiilin bir de **kuru ikizi** var (`plan`): sıfır ağ, sıfır yazma, senkron.
// `just plan`'ı dürüst yapan tek şey budur (R-47). Kuru ikizi olmayan bir fiil,
// çalıştırma öncesi gösterilen maliyeti yalan yapar.

import type {
  AppError,
  BrandId,
  CorrelationId,
  CostEvent,
  EffectClass,
  EraId,
  MoneyRange,
  Result,
  RunId,
  StepId,
  VerbName,
  VerbPlan,
} from '@suite/contracts'
import { err } from '@suite/contracts'
import type { Clock } from '../time/clock.js'
import type { Rng } from '../rng.js'
import { makeError } from '../errors/make.js'

/**
 * Fiilin görebildiği her şey. `(brand_id, era_id)` burada bir PARAMETREDİR —
 * dosyadan okunan global durum değil (D-39). Global olsaydı kuyruktaki her Upcytech
 * çalıştırması, sen `dima` üzerinde çalışırken sessizce marka değiştirirdi.
 */
export interface VerbContext {
  readonly runId: RunId
  readonly stepId: StepId
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  readonly correlationId: CorrelationId
  /** Determinizm (R-06): fiil `Date`e ve `Math.random`a doğrudan dokunmaz. */
  readonly clock: Clock
  readonly rng: Rng
  /** İptal uçtan uca yayılır (§8.5). */
  readonly signal?: AbortSignal
}

export interface VerbOutput {
  /**
   * Harcanan para. **Metered bir fiil boş dizi döndüremez** — sıfır maliyetli bir
   * model çağrısı yoktur; sıfır görünüyorsa defter eksik yazılmıştır (§8.3).
   */
  readonly costs: readonly CostEvent[]
  readonly data: unknown
}

export interface Verb<I = unknown> {
  readonly name: VerbName
  readonly effectClass: EffectClass
  /** Para harcıyor mu. `true` ise `run` en az bir `CostEvent` döndürmek ZORUNDA. */
  readonly metered: boolean
  /** Kuru ikiz: sıfır ağ, sıfır yazma, SENKRON. Async olsaydı I/O sızardı. */
  readonly plan: (ctx: VerbContext, input: I) => VerbPlan
  readonly run: (ctx: VerbContext, input: I) => Promise<Result<VerbOutput, AppError>>
}

export const ZERO_RANGE = (): MoneyRange => ({
  low: { micros: 0n, currency: 'USD' },
  high: { micros: 0n, currency: 'USD' },
})

/**
 * Gövdesi henüz yazılmamış fiil. FAZ 3+ doldurur.
 * **Sessizce başarılı dönmez**: boş bir başarı, üretilmemiş bir varlığı üretilmiş
 * sanmanın en hızlı yoludur. Kapalı bir kapı, aralık bir kapıdan iyidir.
 */
export const notImplemented = (name: VerbName, ctx: VerbContext): Result<VerbOutput, AppError> =>
  err(
    makeError({
      kind: 'config',
      code: 'VERB_NOT_IMPLEMENTED',
      userMessageKey: 'error.verb.notImplemented',
      correlationId: ctx.correlationId,
      details: { verb: name },
    })
  )

/**
 * Çıktı sözleşmesini doğrular. Motor bunu HER fiil çağrısından sonra çalıştırır.
 * Metered bir fiilin maliyetsiz dönmesi, bütçe tavanını (D-17) o an anlamsızlaştırır.
 */
export const validateVerbOutput = (verb: Verb, output: VerbOutput): string | null => {
  if (verb.metered && output.costs.length === 0) {
    return `${verb.name}: metered fiil hiç CostEvent döndürmedi — maliyet defteri eksik yazılır (§8.3)`
  }
  if (!verb.metered && output.costs.length > 0) {
    return `${verb.name}: metered olmayan fiil CostEvent döndürdü — yan etki sınıfı yanlış (R-04)`
  }
  return null
}
