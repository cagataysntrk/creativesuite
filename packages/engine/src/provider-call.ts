// Sağlayıcı adaptörü → motor çağrısı köprüsü (§8.5 · R-44, R-45).
//
// Motor `StepCall` bilir, `ProviderAdapter` bilmez. Bu dosya ikisini birleştirir ve
// arada üç şeyi zorlar: tutamak kalıcılığı, jitter'lı polling, iptal yayılımı.
//
// **Webhook YOK.** Yerel makine NAT arkasında; gelen bağlantı kabul edemez. Uzun işler
// **polling** ile izlenir. Polling'in bedeli var (istek sayısı) ama alternatifi bir
// tünel servisi ve ona bağımlı bir çalıştırma yolu — "bir ay ihmal edilse de çalışır"
// (§16) vaadiyle bağdaşmaz.
//
// **Jitter zorunlu.** Sabit aralıklı polling, aynı anda başlayan beş adımı sağlayıcının
// rate limit'ine aynı milisaniyede çarptırır ve beşi birden 429 alır. Jitter deterministik
// bir `Rng`den gelir — testte tekrarlanabilir, üretimde dağıtık.
//
// **`start()` ile ilk `status()` arasında tutamak deftere yazılır.** Arada çöken bir
// süreç tutamağı kaybederse yeniden başlatma `start()`'ı tekrar çağırır ve **iki kez
// ödenir** (R-44). Bu dosyanın var oluş sebebi büyük ölçüde o tek satır.

import type { AppError, Money } from '@suite/contracts'
import { ZERO_USD, err, ok, type Result } from '@suite/contracts'
import { asciiLower, makeError, systemRng, type Rng } from '@suite/kernel'
import type { JobHandle, ProviderAdapter, ProviderContext, ValidatedInput } from '@suite/providers'
import type { CallOutcome, StepCall, StepCallContext } from './scheduler.js'
import type { ChargeStatus } from './cost/ledger.js'

export interface PollPolicy {
  /** İlk bekleme. Çok kısa olursa sağlayıcı henüz "running" bile dememiş olur. */
  readonly baseMs: number
  /** Üst sınır: uzun işlerde aralık büyür ama sonsuza gitmez. */
  readonly maxMs: number
  /** Her adımda çarpan. */
  readonly factor: number
  /** Toplam bekleme tavanı — aşılırsa iş TERK EDİLMEZ, tutamakla birlikte hata döner. */
  readonly totalMs: number
  /** Jitter oranı: `0.3` = beklemenin ±%30'u rastgele. */
  readonly jitter: number
}

export const DEFAULT_POLL: PollPolicy = {
  baseMs: 1_000,
  maxMs: 15_000,
  factor: 1.6,
  totalMs: 10 * 60_000,
  jitter: 0.3,
}

const bekleme = (deneme: number, p: PollPolicy, rng: Rng): number => {
  const temel = Math.min(p.baseMs * Math.pow(p.factor, deneme), p.maxMs)
  // `rng.next()` 0-1; ±jitter bandına açılır.
  return Math.max(0, Math.round(temel * (1 + (rng.next() * 2 - 1) * p.jitter)))
}

export interface ProviderCallDeps {
  readonly adapter: ProviderAdapter
  readonly input: ValidatedInput
  readonly ctx: Omit<ProviderContext, 'signal'>
  readonly rng?: Rng
  readonly poll?: PollPolicy
  readonly sleep?: (ms: number, signal: AbortSignal) => Promise<void>
}

const uyu = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(signal.reason)
    })
  })

const hata = (
  code: string,
  correlationId: string,
  kind: AppError['kind'],
  details: Readonly<Record<string, unknown>>
): AppError =>
  makeError({
    kind,
    code,
    // Case dönüşümünün tek yetkili yeri kernel (R-21). Kod ASCII ama
    // "burada Türkçe olamaz" muhakemesi kapıların aşındığı yerdir.
    userMessageKey: `error.provider.${asciiLower(code)}`,
    correlationId: correlationId as AppError['correlationId'],
    details,
  })

/**
 * Adaptörü motorun beklediği `StepCall`a çevirir.
 *
 * **Gerçek tutar tahminden KOPYALANMAZ** (§8.3): `actualCost()` `null` dönerse durum
 * `unreported` olur. Tahmini gerçek gibi yazmak, "tahmini vs gerçek" sapma raporunu
 * (§13) yapısal olarak sıfır gösterirdi — yani hiç ölçmemekle aynı şey.
 */
export const providerCall = (deps: ProviderCallDeps): StepCall => {
  const rng = deps.rng ?? systemRng
  const p = deps.poll ?? DEFAULT_POLL
  const sleep = deps.sleep ?? uyu

  return async (c: StepCallContext): Promise<Result<CallOutcome, AppError>> => {
    const { adapter, input, ctx } = deps
    const pctx: ProviderContext = { ...ctx, signal: c.signal }

    // ⚠ ⚠ **DEVRALINAMAYAN İŞ DEVRALINMAZ — ve bu ayrım yokken hat ASILDI.**
    //
    // Zamanlayıcı yarıda kalmış bir kaydın tutamağını buluyor ve (doğru biçimde)
    // "yeniden çağırma, SOR" diyor: çift ödemeyi önlemenin tek yolu bu. Ama işleri
    // bellekte tutan bir sağlayıcıda (yerel CLI, senkron HTTP) o tutamak süreç
    // ölünce ÖLÜ oluyor ve sorulan soru bir daha asla cevaplanmıyor. Gerçek koşuda
    // `claude` hiç başlatılmadan on beş dakika beklendi.
    //
    // Yeniden çağırmak burada GÜVENLİ: devralınamayan bir iş tamamlanmamıştır ve
    // ücret tahakkuk etmemiştir. Kuyruk sağlayıcılarında (`islerKalici: true`)
    // davranış birebir aynı kalıyor.
    const devralinabilir = c.resumeExternalId !== null && adapter.islerKalici

    let handle: JobHandle
    if (devralinabilir && c.resumeExternalId !== null) {
      // Önceki çalıştırmadan devam. `start()` ÇAĞRILMAZ — çağrılsaydı sağlayıcı ikinci
      // bir iş açar ve ikisi de faturalanır.
      handle = {
        providerId: adapter.id,
        externalId: c.resumeExternalId,
        idempotencyKey: input.idempotencyKey,
      }
    } else {
      const baslat = await adapter.start(input, pctx)
      if (!baslat.ok) return err(baslat.error)
      handle = baslat.value
      // Tutamak, İLK POLL'DAN ÖNCE deftere. Aradaki çökme çift ücret demektir.
      c.noteHandle(handle.externalId)
    }

    let gecen = 0
    let deneme = 0
    for (;;) {
      const durum = await adapter.status(handle)
      if (!durum.ok) return err(durum.error)

      if (durum.value.state === 'succeeded') {
        const gercek: Money | null = await adapter.actualCost(handle)
        const chargeStatus: ChargeStatus = gercek === null ? 'unreported' : 'charged'
        return ok({
          amount: gercek ?? ZERO_USD,
          chargeStatus,
          externalId: handle.externalId,
          data: durum.value.output,
        })
      }
      if (durum.value.state === 'failed') return err(durum.value.error)
      if (durum.value.state === 'cancelled') {
        return err(
          hata('PROVIDER_CANCELLED', ctx.correlationId, 'cancelled', {
            externalId: handle.externalId,
          })
        )
      }

      if (gecen >= p.totalMs) {
        // Zaman aşımı işi ÖLDÜRMEZ ve tutamağı KAYBETMEZ: iş sağlayıcıda koşmaya devam
        // ediyor olabilir ve parası ödenmiş olabilir. Tutamak hatanın içinde döner ki
        // mutabakat onu bulabilsin.
        return err(
          hata('PROVIDER_POLL_TIMEOUT', ctx.correlationId, 'timeout', {
            externalId: handle.externalId,
            waitedMs: gecen,
          })
        )
      }

      const ms = bekleme(deneme, p, rng)
      deneme += 1
      gecen += ms
      try {
        await sleep(ms, c.signal)
      } catch {
        // İptal: işi sağlayıcıda da iptal etmeye ÇALIŞ. Başarısız olursa yine de iptal
        // döneriz — kullanıcının kararı, sağlayıcının cevabına bağlı değil.
        await adapter.cancel(handle).catch(() => undefined)
        return err(
          hata('STEP_CANCELLED', ctx.correlationId, 'cancelled', {
            externalId: handle.externalId,
          })
        )
      }
    }
  }
}
