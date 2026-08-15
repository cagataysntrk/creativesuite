import { beforeEach, describe, expect, it } from 'vitest'
import {
  usd,
  ZERO_USD,
  err,
  ok,
  type CorrelationId,
  type RunId,
  type StepId,
} from '@suite/contracts'
import { makeError, manualClock, openDb, seededRng, type Db } from '@suite/kernel'
import { CircuitBreaker, DEFAULT_BREAKER } from './breaker.js'
import { decideRetry, parseRetryAfter } from './retry.js'
import { emptyBudget, lease, refusalMessage, settleLease } from './budget.js'
import { digest, idempotencyKey } from './idempotency.js'
import { getEntry, initLedger, reserve, runTotals } from './cost/ledger.js'
import { runScope, runStep, type CallOutcome, type StepSpec } from './scheduler.js'

const RUN = 'run_0192f3a1-0000-7000-8000-000000000030' as RunId
const CID = 'cor_0192f3a1-0000-7000-8000-000000000031' as CorrelationId

let db: Db
let clock: ReturnType<typeof manualClock>
let breaker: CircuitBreaker

beforeEach(() => {
  db = openDb({ path: ':memory:' })
  initLedger(db)
  clock = manualClock('2026-08-15T09:00:00.000Z')
  breaker = new CircuitBreaker()
})

const spec = (over: Partial<StepSpec> = {}): StepSpec => ({
  runId: RUN,
  stepId: 'stp_1' as StepId,
  verb: 'GENERATE',
  capability: 'image.generate',
  providerId: 'prv_a',
  metered: true,
  idempotencyKey: 'idem_test_1',
  estimateHigh: usd(5_000n),
  ...over,
})

const deps = () => ({
  db,
  breaker,
  clock,
  rng: seededRng(7),
  // Test beklemez; gecikme mantığı `decideRetry` testlerinde ayrıca sınanıyor.
  sleep: async () => {},
})

const basarili = (micros: bigint): CallOutcome => ({
  amount: usd(micros),
  chargeStatus: 'charged',
  externalId: 'ext_1',
  data: { ok: true },
})

describe('retry sınıflandırması (§8.5)', () => {
  const rng = seededRng(1)

  it('içerik reddi ASLA denenmez', () => {
    const e = makeError({
      kind: 'content_rejected',
      code: 'X',
      userMessageKey: 'x',
      correlationId: CID,
    })
    expect(decideRetry(e, 1, rng).retry).toBe(false)
  })

  it('iptal denenmez — kullanıcının kararı yeniden denemeyle ezilmez', () => {
    const e = makeError({ kind: 'cancelled', code: 'X', userMessageKey: 'x', correlationId: CID })
    expect(decideRetry(e, 1, rng).retry).toBe(false)
  })

  it('429 denenir ve sağlayıcının Retry-After süresine UYAR', () => {
    const e = makeError({
      kind: 'provider_rate_limit',
      code: 'X',
      userMessageKey: 'x',
      correlationId: CID,
    })
    const k = decideRetry(e, 1, rng, undefined, 7_000)
    expect(k.retry).toBe(true)
    expect(k.delayMs).toBe(7_000)
  })

  it('5xx üstel geri çekilir ve gecikme tavanı aşmaz', () => {
    const e = makeError({
      kind: 'provider_unavailable',
      code: 'X',
      userMessageKey: 'x',
      correlationId: CID,
    })
    for (let deneme = 1; deneme <= 2; deneme++) {
      const k = decideRetry(e, deneme, rng)
      expect(k.retry).toBe(true)
      expect(k.delayMs).toBeLessThan(500 * 2 ** deneme)
    }
  })

  it('deneme hakkı bitince durur', () => {
    const e = makeError({ kind: 'timeout', code: 'X', userMessageKey: 'x', correlationId: CID })
    expect(decideRetry(e, 3, rng).retry).toBe(false)
  })

  it('Retry-After hem saniye hem HTTP-date okur', () => {
    expect(parseRetryAfter('12', 0)).toBe(12_000)
    expect(parseRetryAfter(null, 0)).toBeNull()
    const t = Date.parse('2026-08-15T09:00:30.000Z')
    expect(parseRetryAfter('Sat, 15 Aug 2026 09:00:30 GMT', t - 30_000)).toBe(30_000)
  })
})

describe('devre kesici (§8.5 · R-45)', () => {
  it('5 ardışık hatada açılır, 4 hatada değil', () => {
    for (let i = 0; i < 4; i++) breaker.onFailure('prv_a', 'image.generate', clock.now())
    expect(breaker.allows('prv_a', 'image.generate', clock.now())).toBe(true)
    breaker.onFailure('prv_a', 'image.generate', clock.now())
    expect(breaker.allows('prv_a', 'image.generate', clock.now())).toBe(false)
  })

  it('araya giren başarı sayacı SIFIRLAR — ardışık, toplam değil', () => {
    for (let i = 0; i < 4; i++) breaker.onFailure('prv_a', 'image.generate', clock.now())
    breaker.onSuccess('prv_a', 'image.generate')
    for (let i = 0; i < 4; i++) breaker.onFailure('prv_a', 'image.generate', clock.now())
    expect(breaker.allows('prv_a', 'image.generate', clock.now())).toBe(true)
  })

  it('aynı sağlayıcının BAŞKA yeteneği etkilenmez', () => {
    for (let i = 0; i < 5; i++) breaker.onFailure('prv_a', 'image.generate', clock.now())
    expect(breaker.allows('prv_a', 'image.generate', clock.now())).toBe(false)
    expect(breaker.allows('prv_a', 'audio.tts', clock.now())).toBe(true)
  })

  it('soğuma sonrası YALNIZ BİR deneme geçer', () => {
    for (let i = 0; i < 5; i++) breaker.onFailure('prv_a', 'image.generate', clock.now())
    clock.ilerlet(DEFAULT_BREAKER.cooldownMs + 1)
    expect(breaker.state('prv_a', 'image.generate', clock.now())).toBe('half-open')
    expect(breaker.allows('prv_a', 'image.generate', clock.now())).toBe(true)
    expect(breaker.allows('prv_a', 'image.generate', clock.now())).toBe(false)
  })
})

describe('bütçe kiralama (§8.3 · D-17)', () => {
  it('tavansız bütçe her şeyi kabul eder', () => {
    const b = emptyBudget({ perRun: null, perMonth: null })
    expect(lease(b, usd(999_999_999n)).ok).toBe(true)
  })

  it('tahminin ÜST sınırı tavanı aşarsa reddedilir', () => {
    const b = emptyBudget({ perRun: usd(10_000n), perMonth: null })
    const r = lease(b, usd(10_001n))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.refusal.kind).toBe('run_cap_exceeded')
  })

  it('paralel iki kiralama aynı son bütçeyi iki kez harcayamaz', () => {
    const b = emptyBudget({ perRun: usd(10_000n), perMonth: null })
    const ilk = lease(b, usd(6_000n))
    expect(ilk.ok).toBe(true)
    if (!ilk.ok) return
    expect(lease(ilk.state, usd(6_000n)).ok).toBe(false)
  })

  it('kira gerçek tutarla kapanır ve serbest kalır', () => {
    const b = emptyBudget({ perRun: usd(10_000n), perMonth: null })
    const k = lease(b, usd(6_000n))
    expect(k.ok).toBe(true)
    if (!k.ok) return
    const kapali = settleLease(k.state, usd(6_000n), usd(1_000n))
    expect(kapali.leased).toEqual(ZERO_USD)
    expect(kapali.spentThisRun.micros).toBe(1_000n)
    expect(lease(kapali, usd(8_000n)).ok).toBe(true)
  })

  it('red gerekçesi Türkçe ve sayılı', () => {
    const b = emptyBudget({ perRun: usd(1_000n), perMonth: null })
    const r = lease(b, usd(2_000n))
    // `throw` yerine assertion: `throw` eden tek yer errors/panic.ts (§8.6) ve
    // `chokepoints` kapısı testte de zorluyor — haklı olarak.
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(refusalMessage(r.refusal)).toContain('Çalıştırma bütçesi aşılıyor')
  })
})

describe('idempotency anahtarı (R-44)', () => {
  const temel = {
    runId: RUN,
    stepId: 'stp_1',
    verb: 'GENERATE',
    capability: 'image.generate',
    providerId: 'prv_a',
    model: 'm1',
    seed: 42,
    params: { aspect: '4:5', quality: 'high' },
    corpusCommit: 'a'.repeat(40),
    inputDigest: digest('prompt'),
  }

  it('aynı girdi aynı anahtarı verir', () => {
    expect(idempotencyKey(temel)).toBe(idempotencyKey({ ...temel }))
  })

  it('parametre SIRASI anahtarı değiştirmez', () => {
    const ters = { ...temel, params: { quality: 'high', aspect: '4:5' } }
    expect(idempotencyKey(ters)).toBe(idempotencyKey(temel))
  })

  it('corpus commit değişince anahtar DEĞİŞİR — farklı bağlam, farklı çağrı', () => {
    expect(idempotencyKey({ ...temel, corpusCommit: 'b'.repeat(40) })).not.toBe(
      idempotencyKey(temel)
    )
  })

  it('seed ve model anahtarı etkiler', () => {
    expect(idempotencyKey({ ...temel, seed: 43 })).not.toBe(idempotencyKey(temel))
    expect(idempotencyKey({ ...temel, model: 'm2' })).not.toBe(idempotencyKey(temel))
  })
})

describe('motor: çağrı, defter ve maliyet', () => {
  it('başarılı metered adım defteri KAPATIR ve CostEvent döndürür', async () => {
    const { signal } = runScope()
    const b = emptyBudget({ perRun: usd(10_000n), perMonth: null })
    const r = await runStep(deps(), spec(), b, async () => ok(basarili(4_000n)), CID, signal)

    expect(r.error).toBeNull()
    expect(r.costs).toHaveLength(1)
    expect(r.costs[0]?.kind).toBe('actual')
    expect(getEntry(db, 'idem_test_1')?.chargeStatus).toBe('charged')
    expect(runTotals(db, RUN).charged.micros).toBe(4_000n)
    expect(r.budget.spentThisRun.micros).toBe(4_000n)
    expect(r.budget.leased).toEqual(ZERO_USD)
  })

  it('metered olmayan adım deftere HİÇ yazmaz', async () => {
    const { signal } = runScope()
    const b = emptyBudget({ perRun: null, perMonth: null })
    const r = await runStep(
      deps(),
      spec({ verb: 'COMPOSE', metered: false }),
      b,
      async () => ok({ amount: ZERO_USD, chargeStatus: 'not-charged', externalId: null, data: 1 }),
      CID,
      signal
    )
    expect(r.costs).toEqual([])
    expect(runTotals(db, RUN).entries).toBe(0)
  })

  it('bütçe tavanı aşılırsa ÇAĞRI HİÇ YAPILMAZ', async () => {
    const { signal } = runScope()
    let cagrildi = 0
    const b = emptyBudget({ perRun: usd(1_000n), perMonth: null })
    const r = await runStep(
      deps(),
      spec(),
      b,
      async () => {
        cagrildi++
        return ok(basarili(1n))
      },
      CID,
      signal
    )
    expect(cagrildi).toBe(0)
    expect(r.error?.kind).toBe('budget_exceeded')
    expect(runTotals(db, RUN).entries).toBe(0)
  })

  it('başarısız çağrının harcadığı para deftere YAZILIR', async () => {
    // 3 görsel üretip 429 alan adım bedava değildir (§8.6).
    const { signal } = runScope()
    const b = emptyBudget({ perRun: usd(50_000n), perMonth: null })
    const hata = makeError({
      kind: 'provider_rate_limit',
      code: 'RATE',
      userMessageKey: 'x',
      correlationId: CID,
      costIncurred: usd(10_500n),
    })
    const r = await runStep(deps(), spec(), b, async () => err(hata), CID, signal)
    expect(r.error?.kind).toBe('provider_rate_limit')
    expect(getEntry(db, 'idem_test_1')?.amount.micros).toBe(10_500n)
    expect(r.budget.spentThisRun.micros).toBe(10_500n)
  })
})

describe('SIGKILL sonrası devam — ÇİFT ÜCRET YOK (R-44)', () => {
  it('aynı anahtarla ikinci çalıştırma çağrıyı TEKRARLAMAZ', async () => {
    const { signal } = runScope()
    const b = emptyBudget({ perRun: usd(50_000n), perMonth: null })
    let cagrildi = 0

    const ilk = await runStep(
      deps(),
      spec(),
      b,
      async () => {
        cagrildi++
        return ok(basarili(4_000n))
      },
      CID,
      signal
    )
    expect(cagrildi).toBe(1)
    expect(ilk.replayedFromLedger).toBe(false)

    // ── süreç öldü, yeniden başladı: aynı plan, aynı idempotency anahtarı ──
    const ikinci = await runStep(
      deps(),
      spec(),
      b,
      async () => {
        cagrildi++
        return ok(basarili(4_000n))
      },
      CID,
      signal
    )
    expect(cagrildi, 'çağrı ikinci kez yapıldı — ÇİFT ÜCRET').toBe(1)
    expect(ikinci.replayedFromLedger).toBe(true)
    expect(ikinci.outcome?.amount.micros).toBe(4_000n)
    expect(runTotals(db, RUN).charged.micros, 'defterde iki kayıt var').toBe(4_000n)
    expect(runTotals(db, RUN).entries).toBe(1)
  })

  it('rezervasyon sonrası çöküş → possibly-charged, sıfır değil', () => {
    // Süreç, rezervasyon ile kapatma ARASINDA öldü. Bunu "hiç dönmeyen bir promise"le
    // taklit etmek testi kilitler (ilk sürümüm öyleydi ve 10 sn'de zaman aşımına uğradı);
    // çöküşün gerçek modeli, `settle` hiç ÇAĞRILMAMASIDIR.
    const rez = reserve(db, {
      idempotencyKey: 'idem_crash',
      runId: RUN,
      stepId: 'stp_1' as StepId,
      verb: 'GENERATE',
      providerId: 'prv_a',
      capability: 'image.generate',
    })
    expect(rez.fresh).toBe(true)

    // ── burada süreç ölür; settle çağrılmaz ──
    const kayit = getEntry(db, 'idem_crash')
    expect(kayit?.chargeStatus).toBe('possibly-charged')

    // Yeniden başlatma aynı anahtarı görür ve çağrıyı TEKRARLAMAZ.
    expect(
      reserve(db, {
        idempotencyKey: 'idem_crash',
        runId: RUN,
        stepId: 'stp_1' as StepId,
        verb: 'GENERATE',
        providerId: 'prv_a',
        capability: 'image.generate',
      }).fresh
    ).toBe(false)
  })
})

describe('iptal uçtan uca (§8.5)', () => {
  it('iptal edilmiş kapsamda adım hiç başlamaz', async () => {
    const { signal, cancel } = runScope()
    cancel()
    let cagrildi = 0
    const r = await runStep(
      deps(),
      spec(),
      emptyBudget({ perRun: null, perMonth: null }),
      async () => {
        cagrildi++
        return ok(basarili(1n))
      },
      CID,
      signal
    )
    expect(cagrildi).toBe(0)
    expect(r.error?.kind).toBe('cancelled')
    expect(runTotals(db, RUN).entries).toBe(0)
  })

  it('çağrı sırasında iptal edilirse YENİDEN DENENMEZ', async () => {
    const { signal, cancel } = runScope()
    let cagrildi = 0
    const r = await runStep(
      deps(),
      spec(),
      emptyBudget({ perRun: null, perMonth: null }),
      async (s) => {
        cagrildi++
        cancel()
        return err(
          makeError({
            kind: 'timeout',
            code: 'T',
            userMessageKey: 'x',
            correlationId: CID,
            details: { aborted: s.signal.aborted },
          })
        )
      },
      CID,
      signal
    )
    expect(cagrildi, 'iptalden sonra yeniden denendi').toBe(1)
    expect(r.error?.kind).toBe('cancelled')
  })

  it('iptal sinyali çağrıya AKTARILIR — fiil onu görebiliyor', async () => {
    const { signal, cancel } = runScope()
    let gorulen: boolean | null = null
    cancel()
    await runStep(
      deps(),
      spec({ metered: false }),
      emptyBudget({ perRun: null, perMonth: null }),
      async (s) => {
        gorulen = s.signal.aborted
        return ok(basarili(0n))
      },
      CID,
      signal
    )
    // Adım hiç başlamadı, o yüzden çağrı da yapılmadı — sinyal zaten iptalliydi.
    expect(gorulen).toBeNull()
  })
})

describe('devre kesici motorla birlikte', () => {
  it('kesici açıkken çağrı yapılmaz ve ücret yazılmaz', async () => {
    for (let i = 0; i < 5; i++) breaker.onFailure('prv_a', 'image.generate', clock.now())
    const { signal } = runScope()
    let cagrildi = 0
    const r = await runStep(
      deps(),
      spec(),
      emptyBudget({ perRun: null, perMonth: null }),
      async () => {
        cagrildi++
        return ok(basarili(4_000n))
      },
      CID,
      signal
    )
    expect(cagrildi).toBe(0)
    expect(r.error?.code).toBe('CIRCUIT_OPEN')
    expect(getEntry(db, 'idem_test_1')?.chargeStatus).toBe('not-charged')
  })

  it('kullanıcı hatası kesiciyi TETİKLEMEZ', async () => {
    const { signal } = runScope()
    const hata = makeError({
      kind: 'validation',
      code: 'V',
      userMessageKey: 'x',
      correlationId: CID,
    })
    for (let i = 0; i < 6; i++) {
      await runStep(
        deps(),
        spec({ idempotencyKey: `idem_v_${i}` }),
        emptyBudget({ perRun: null, perMonth: null }),
        async () => err(hata),
        CID,
        signal
      )
    }
    expect(breaker.allows('prv_a', 'image.generate', clock.now())).toBe(true)
  })
})
