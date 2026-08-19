import { beforeEach, describe, expect, it } from 'vitest'
import { ZERO_USD, ok, usd, type CorrelationId, type RunId, type StepId } from '@suite/contracts'
import { makeError, manualClock, openDb, seededRng, type Db } from '@suite/kernel'
import type { JobHandle, JobStatus, ProviderAdapter, ValidatedInput } from '@suite/providers'
import { CircuitBreaker } from './breaker.js'
import { emptyBudget } from './budget.js'
import { getEntry, initLedger } from './cost/ledger.js'
import { providerCall } from './provider-call.js'
import { runStep, type StepSpec } from './scheduler.js'

const RUN = 'run_0192f3a1-0000-7000-8000-000000000040' as RunId
const CID = 'cor_0192f3a1-0000-7000-8000-000000000041' as CorrelationId

let db: Db
let breaker: CircuitBreaker
beforeEach(() => {
  db = openDb({ path: ':memory:' })
  initLedger(db)
  breaker = new CircuitBreaker()
})

/** Çağrı sayacı taşıyan sahte sağlayıcı — "kaç kez başlatıldı" sorusu testin kalbi. */
const sahteAdaptor = (
  over: {
    durumlar?: JobStatus[]
    maliyet?: bigint | null
    /** Kuyruk sağlayıcısı mı (fal gibi) yoksa süreçle ölen mi (claude-code gibi). */
    islerKalici?: boolean
  } = {}
) => {
  const sayac = { start: 0, status: 0, cancel: 0 }
  const durumlar = over.durumlar ?? [{ state: 'succeeded', output: { url: 'x' } } as JobStatus]
  let i = 0
  const adapter: ProviderAdapter = {
    id: 'prv_sahte',
    title: 'Sahte',
    // ⚠ Varsayılan `true`: bu dosyadaki testlerin çoğu ÇİFT ÖDEMEYİ sınıyor ve o
    // tehlike yalnız işleri süreci aşan sağlayıcılarda var.
    islerKalici: over.islerKalici ?? true,
    capabilities: () => [{ name: 'image.generate', lanes: ['premium'], supports: {} }],
    validate: (input) => ok({ ...input, _validated: true }),
    estimate: () => ({ low: ZERO_USD, high: usd(50_000n) }),
    available: () => true,
    start: async () => {
      sayac.start += 1
      return ok({
        providerId: 'prv_sahte',
        externalId: `ext_${sayac.start}`,
        idempotencyKey: 'idem_pc',
      } satisfies JobHandle)
    },
    status: async () => {
      sayac.status += 1
      const d = durumlar[Math.min(i, durumlar.length - 1)] as JobStatus
      i += 1
      return ok(d)
    },
    cancel: async () => {
      sayac.cancel += 1
    },
    actualCost: async () => (over.maliyet === null ? null : usd(over.maliyet ?? 42_000n)),
  }
  return { adapter, sayac }
}

const girdi: ValidatedInput = {
  capability: 'image.generate',
  lane: 'premium',
  prompt: 'test',
  constraints: {},
  idempotencyKey: 'idem_pc',
  _validated: true,
}

const spec = (over: Partial<StepSpec> = {}): StepSpec => ({
  runId: RUN,
  stepId: 'stp_1' as StepId,
  verb: 'GENERATE',
  capability: 'image.generate',
  providerId: 'prv_sahte',
  metered: true,
  idempotencyKey: 'idem_pc',
  estimateHigh: usd(50_000n),
  ...over,
})

const deps = () => ({
  db,
  breaker,
  rng: seededRng(7),
  clock: manualClock('2026-08-15T09:00:00.000Z'),
  sleep: async () => undefined,
})
const cagri = (a: ProviderAdapter, durumSayisi = 0) =>
  providerCall({
    adapter: a,
    input: girdi,
    ctx: { correlationId: CID, env: {} },
    rng: seededRng(durumSayisi + 1),
    sleep: async () => undefined,
  })

describe('sağlayıcı köprüsü', () => {
  it('başarılı iş: gerçek maliyet defterden geliyor, tahminden KOPYALANMIYOR', async () => {
    const { adapter } = sahteAdaptor({ maliyet: 42_000n })
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)
    expect(r.error).toBeNull()
    expect(r.outcome?.amount.micros).toBe(42_000n) // tahmin 50.000'di
    expect(r.outcome?.chargeStatus).toBe('charged')
  })

  it('sağlayıcı maliyet bildirmezse `unreported` — tahmin YAZILMIYOR', async () => {
    const { adapter } = sahteAdaptor({ maliyet: null })
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)
    expect(r.outcome?.chargeStatus).toBe('unreported')
    expect(r.outcome?.amount.micros).toBe(0n)
  })

  it('koşan iş jitter ile poll ediliyor, sonunda bitiyor', async () => {
    const { adapter, sayac } = sahteAdaptor({
      durumlar: [{ state: 'running' }, { state: 'running' }, { state: 'succeeded', output: null }],
    })
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)
    expect(r.error).toBeNull()
    expect(sayac.status).toBe(3)
    expect(sayac.start).toBe(1)
  })

  it('tutamak İLK POLL ÖNCESİ deftere yazılıyor', async () => {
    const { adapter } = sahteAdaptor({ durumlar: [{ state: 'running' }] as JobStatus[] })
    const b = emptyBudget({ perRun: null, perMonth: null })
    // Poll tavanını sıfıra indirip zaman aşımına düşür: iş bitmedi ama tutamak yazılmış olmalı.
    const c = providerCall({
      adapter,
      input: girdi,
      ctx: { correlationId: CID, env: {} },
      rng: seededRng(1),
      sleep: async () => undefined,
      poll: { baseMs: 1, maxMs: 1, factor: 1, totalMs: 0, jitter: 0 },
    })
    await runStep(deps(), spec(), b, c, CID, new AbortController().signal)
    expect(getEntry(db, 'idem_pc')?.externalId).toBe('ext_1')
  })
})

describe('SIGKILL sonrası: ÇİFT ÜCRET YOK (R-44 · D-103)', () => {
  it('yarıda kalan iş TUTAMAKLA devam ediyor — `start()` İKİNCİ KEZ çağrılmıyor', async () => {
    const b = emptyBudget({ perRun: null, perMonth: null })

    // 1. çalıştırma: iş başladı, tutamak deftere yazıldı, sonra süreç öldü (poll tavanı 0).
    const ilk = sahteAdaptor({ durumlar: [{ state: 'running' }] as JobStatus[] })
    await runStep(
      deps(),
      spec(),
      b,
      providerCall({
        adapter: ilk.adapter,
        input: girdi,
        ctx: { correlationId: CID, env: {} },
        rng: seededRng(1),
        sleep: async () => undefined,
        poll: { baseMs: 1, maxMs: 1, factor: 1, totalMs: 0, jitter: 0 },
      }),
      CID,
      new AbortController().signal
    )
    expect(ilk.sayac.start).toBe(1)
    expect(getEntry(db, 'idem_pc')?.chargeStatus).toBe('possibly-charged')

    // 2. çalıştırma: AYNI defter, aynı idempotency anahtarı. İş bu kez bitmiş dönüyor.
    const ikinci = sahteAdaptor({ maliyet: 42_000n })
    const r = await runStep(
      deps(),
      spec(),
      b,
      cagri(ikinci.adapter),
      CID,
      new AbortController().signal
    )

    // ASIL İDDİA: sağlayıcıda ikinci bir iş AÇILMADI.
    expect(ikinci.sayac.start).toBe(0)
    expect(ikinci.sayac.status).toBeGreaterThan(0)
    expect(r.outcome?.amount.micros).toBe(42_000n)
    expect(getEntry(db, 'idem_pc')?.chargeStatus).toBe('charged')
  })

  it('tutamağı OLMAYAN yarım kayıt sessizce başarılı SAYILMIYOR', async () => {
    // `start()` ile `noteHandle()` arasında ölen süreç: çağrının uçup uçmadığı bilinmiyor.
    // Eski davranış bunu $0.00 maliyetle BAŞARILI sayıyordu — üretilmemiş bir varlığı
    // üretilmiş göstermenin en sessiz yolu.
    const { reserve } = await import('./cost/ledger.js')
    reserve(db, {
      runId: RUN,
      stepId: 'stp_1' as StepId,
      verb: 'GENERATE',
      providerId: 'prv_sahte',
      capability: 'image.generate',
      idempotencyKey: 'idem_pc',
    })
    const { adapter, sayac } = sahteAdaptor()
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)

    expect(r.outcome).toBeNull()
    expect(r.error?.code).toBe('NEEDS_RECONCILIATION')
    expect(sayac.start).toBe(0) // körlemesine tekrar YOK
  })

  it('KAPANMIŞ kayıt tekrar çağrılmıyor, defterdeki tutar kullanılıyor', async () => {
    const { reserve, settle } = await import('./cost/ledger.js')
    reserve(db, {
      runId: RUN,
      stepId: 'stp_1' as StepId,
      verb: 'GENERATE',
      providerId: 'prv_sahte',
      capability: 'image.generate',
      idempotencyKey: 'idem_pc',
    })
    settle(db, 'idem_pc', usd(9_000n), 'charged', 'ext_eski')
    const { adapter, sayac } = sahteAdaptor()
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)

    expect(r.replayedFromLedger).toBe(true)
    expect(r.outcome?.amount.micros).toBe(9_000n)
    expect(sayac.start).toBe(0)
    expect(sayac.status).toBe(0)
  })
})

describe('iptal ve hata', () => {
  it('sağlayıcı hatası `err` olarak yayılıyor', async () => {
    const { adapter } = sahteAdaptor({
      durumlar: [
        {
          state: 'failed',
          error: makeError({
            kind: 'provider_bad_response',
            code: 'X',
            userMessageKey: 'e',
            correlationId: CID,
          }),
        },
      ] as JobStatus[],
    })
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)
    expect(r.outcome).toBeNull()
    expect(r.error).not.toBeNull()
  })

  it('zaman aşımı işi ÖLDÜRMÜYOR — tutamak hatanın içinde dönüyor', async () => {
    const { adapter } = sahteAdaptor({ durumlar: [{ state: 'running' }] as JobStatus[] })
    const c = providerCall({
      adapter,
      input: girdi,
      ctx: { correlationId: CID, env: {} },
      rng: seededRng(1),
      sleep: async () => undefined,
      poll: { baseMs: 1, maxMs: 1, factor: 1, totalMs: 0, jitter: 0 },
    })
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(deps(), spec(), b, c, CID, new AbortController().signal)
    expect(r.error?.code).toBe('PROVIDER_POLL_TIMEOUT')
    expect(r.error?.details?.['externalId']).toBe('ext_1')
  })
})

// ⚠ ⚠ **DEVRALINAMAYAN İŞ: YENİDEN ÇAĞRILIR.** Üstteki test bunun tersini koruyor ve
// ikisi birlikte anlam taşıyor — biri olmadan diğeri yanlış bir kuralı korur:
//   · kuyruk sağlayıcısında tutamakla devam → çift ödeme yok
//   · süreçle ölen sağlayıcıda yeniden çağrı → sonsuz bekleme yok
// İkincisi olmadığı için gerçek koşuda `claude` hiç başlatılmadan on beş dakika
// beklendi: ölü bir tutamağa sorulan soru bir daha asla cevaplanmıyordu.
describe('devralınamayan sağlayıcı', () => {
  it('ölü tutamak yok sayılıyor — `start()` YENİDEN çağrılıyor', async () => {
    const { adapter, sayac } = sahteAdaptor({ islerKalici: false })
    const c = cagri(adapter)
    const sonuc = await c({
      signal: new AbortController().signal,
      noteHandle: () => undefined,
      resumeExternalId: 'ext_olu',
    })
    expect(sonuc.ok).toBe(true)
    expect(sayac.start).toBe(1)
  })

  it('kuyruk sağlayıcısında tutamak KORUNUYOR — `start()` çağrılmıyor', async () => {
    const { adapter, sayac } = sahteAdaptor({ islerKalici: true })
    const c = cagri(adapter)
    await c({
      signal: new AbortController().signal,
      noteHandle: () => undefined,
      resumeExternalId: 'ext_canli',
    })
    expect(sayac.start).toBe(0)
  })
})

// ── ücretsiz kapanmış kayıt: atlamak KAYIP mı, tekrar etmek İSRAF mı (D-247 · D19) ──
//
// ⚠ ⚠ **BU DAVRANIŞ GERÇEK BİR KOŞUDA ISIRDI.** `run_01a01876` insan kapısında durdu,
// panelden onaylandı, sürdürüldü — ve `konu-sec` YENİDEN koştu: girdi özeti aynı
// (`5a68ed27`) ama çıktı özeti değişti (`5e0f8c7d` → `e02f01c7`). Yani onaylanan
// metnin dayandığı konu, onaydan SONRA değişti. Sebep D-247'nin dalıydı: "ücretsiz
// kayıtta atlamak çıktıyı kaybettirir". O gerekçe artık geçersiz — çıktı
// `derived/runs/<run>/steps/` altında duruyor.
describe('ücretsiz kapanmış kayıt', () => {
  it('çıktı DİSKTE ise çağrı TEKRARLANMIYOR — onay, onaylananı değiştiremez', async () => {
    const { adapter, sayac } = sahteAdaptor({ maliyet: 0n })
    const b = emptyBudget({ perRun: null, perMonth: null })
    await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)
    expect(sayac.start).toBe(1)

    // Kapı onayından sonraki sürdürme. Çıktı diskte DURUYOR.
    const r = await runStep(
      { ...deps(), ciktiVar: () => true },
      spec(),
      b,
      cagri(adapter),
      CID,
      new AbortController().signal
    )
    expect(sayac.start).toBe(1)
    expect(r.replayedFromLedger).toBe(true)
  })

  it('çıktı diskte YOKSA tekrar koşuyor — D-247 gerekçesi orada hâlâ geçerli', async () => {
    const { adapter, sayac } = sahteAdaptor({ maliyet: 0n })
    const b = emptyBudget({ perRun: null, perMonth: null })
    await runStep(deps(), spec(), b, cagri(adapter), CID, new AbortController().signal)
    await runStep(
      { ...deps(), ciktiVar: () => false },
      spec(),
      b,
      cagri(adapter),
      CID,
      new AbortController().signal
    )
    // Atlansaydı aşağı akış boş girdiyle kalırdı: ölçülmüş kusur, `gorsel-uret`
    // brief'i `null` almıştı.
    expect(sayac.start).toBe(2)
  })
})
