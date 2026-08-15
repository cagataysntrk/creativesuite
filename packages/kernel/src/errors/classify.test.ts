import { describe, expect, it } from 'vitest'
import { ERROR_KINDS, usd, type CorrelationId, type ErrorKind } from '@suite/contracts'
import { allKindsClassified, classify, policyMatchesError, withCost } from './classify.js'
import { chainOf, formatChain, fromUnknown, rootCause } from './chain.js'
import { makeError } from './make.js'

const CID = 'cor_0192f3a1-0000-7000-8000-00000000000e' as CorrelationId

describe('classify — toplam fonksiyon (§8.6)', () => {
  it('her ErrorKind için politika var', () => {
    expect(allKindsClassified()).toBe(true)
    for (const k of ERROR_KINDS) {
      expect(classify(k), `sınıflandırılmamış: ${k}`).toBeDefined()
    }
  })

  it('ERROR_KINDS ile politika tablosu birebir aynı boyutta', () => {
    // Fazla anahtar da hata: silinmiş bir ErrorKind'ın politikası kalırsa,
    // artık var olmayan bir duruma göre karar veriyoruz demektir.
    const kinds = new Set<string>(ERROR_KINDS)
    for (const k of ERROR_KINDS) expect(kinds.has(k)).toBe(true)
    expect(kinds.size).toBe(ERROR_KINDS.length)
  })

  it('iptal yeniden DENENMEZ — bir karardır, arıza değil', () => {
    expect(classify('cancelled').retryable).toBe(false)
  })

  it('bilinmeyen hata yeniden denenmez — bilinmeyen yan etki tekrarlanmaz', () => {
    expect(classify('internal').retryable).toBe(false)
  })

  it('rate limit denenir ama devre kesiciyi TETİKLEMEZ', () => {
    const p = classify('provider_rate_limit')
    expect(p.retryable).toBe(true)
    expect(p.backoff).toBe('respect-retry-after')
    expect(p.trips).toBe(false)
  })

  it('kullanıcı hatası devre kesiciyi tetiklemez', () => {
    for (const k of ['validation', 'config', 'content_rejected', 'budget_exceeded'] as const) {
      expect(classify(k).trips, k).toBe(false)
    }
  })

  it('insan müdahalesi gereken hatalar yeniden denenmez', () => {
    for (const k of ERROR_KINDS) {
      const p = classify(k)
      if (p.humanActionable) expect(p.retryable, k).toBe(false)
    }
  })

  it('denenmeyen bir hata backoff istemez — tutarsız politika yok', () => {
    for (const k of ERROR_KINDS) {
      const p = classify(k)
      if (!p.retryable) expect(p.backoff, k).toBe('none')
    }
  })
})

describe('maliyet — her hata harcanan parayı taşır (§13)', () => {
  const temel = (kind: ErrorKind = 'provider_rate_limit') =>
    makeError({ kind, code: 'X', userMessageKey: 'error.x', correlationId: CID })

  it('varsayılan sıfırdır ama BİLİNÇLİ sıfırdır', () => {
    expect(temel().costIncurred).toEqual({ micros: 0n, currency: 'USD' })
  })

  it('3 görselden sonra gelen 429 yine de para harcamıştır', () => {
    const uc_gorsel = usd(3n * 3_500n)
    const e = withCost(temel(), uc_gorsel)
    expect(e.costIncurred.micros).toBe(10_500n)
    expect(e.kind).toBe('provider_rate_limit')
  })

  it('maliyet birikir, üzerine yazılmaz', () => {
    let e = temel()
    for (let i = 0; i < 4; i++) e = withCost(e, usd(1_000n))
    expect(e.costIncurred.micros).toBe(4_000n)
  })
})

describe('Error.cause zinciri korunur (§8.6)', () => {
  it('kök neden kaybolmaz', () => {
    const kok = new TypeError('fetch failed')
    const orta = new Error('sağlayıcı çağrısı düştü', { cause: kok })
    const ust = fromUnknown(orta, CID)

    expect(ust.kind).toBe('internal')
    expect(rootCause(ust)?.message).toBe('fetch failed')
    expect(formatChain(ust)).toContain('fetch failed')
  })

  it('AbortError iptale eşlenir, io hatasına değil', () => {
    const abort = new Error('durduruldu')
    abort.name = 'AbortError'
    expect(fromUnknown(abort, CID).kind).toBe('cancelled')
  })

  it('döngüsel cause zinciri sonsuz döngüye girmez', () => {
    const a = new Error('a')
    const b = new Error('b', { cause: a })
    ;(a as { cause?: unknown }).cause = b
    expect(chainOf(a).length).toBeLessThanOrEqual(32)
  })

  it('Error olmayan bir değer de zincire girer', () => {
    expect(chainOf('düz string')).toEqual([{ name: 'unknown', message: 'düz string' }])
  })
})

describe('politika ile hata alanı ayrışmaz', () => {
  it('retryable alanı classify ile aynı olmalı', () => {
    const dogru = makeError({
      kind: 'timeout',
      code: 'T',
      userMessageKey: 'error.timeout',
      correlationId: CID,
      retryable: classify('timeout').retryable,
    })
    expect(policyMatchesError(dogru)).toBe(true)

    const ayrisik = makeError({
      kind: 'timeout',
      code: 'T',
      userMessageKey: 'error.timeout',
      correlationId: CID,
      retryable: false,
    })
    expect(policyMatchesError(ayrisik)).toBe(false)
  })
})
