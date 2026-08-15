import { describe, expect, it } from 'vitest'
import { asciiLower, readEnv } from '@suite/kernel'
import { claudeCode } from './claude-code.js'
import { candidatesFor, allCapabilities, adapterById } from './registry.js'
import type { ProviderInput, ValidatedInput } from './types.js'

const GERCEK_PATH = { PATH: readEnv('PATH') ?? '' }
const BOS_PATH = { PATH: '/yok/boyle/bir/dizin' }

const girdi = (over: Partial<ProviderInput> = {}): ProviderInput => ({
  capability: 'text.generate',
  lane: 'free',
  prompt: 'Türkçe bir cümle yaz.',
  constraints: { locale: 'tr-TR' },
  idempotencyKey: 'idem_cc_1',
  ...over,
})

const dogrula = (i: ProviderInput): ValidatedInput => {
  const r = claudeCode.validate(i)
  expect(r.ok, r.ok ? '' : r.error.code).toBe(true)
  return (r as { ok: true; value: ValidatedInput }).value
}

describe('adaptör sözleşmesi (§8.4)', () => {
  it('yedi metodun hepsi var', () => {
    for (const m of [
      'capabilities',
      'validate',
      'estimate',
      'available',
      'start',
      'status',
      'cancel',
      'actualCost',
    ] as const) {
      expect(typeof claudeCode[m], m).toBe('function')
    }
  })

  it('estimate() SENKRON — Promise döndürmez (R-42)', () => {
    const sonuc = claudeCode.estimate(dogrula(girdi()))
    expect(sonuc).not.toBeInstanceOf(Promise)
    expect(sonuc.low.currency).toBe('USD')
  })

  it('available() SENKRON ve ağsız', () => {
    const sonuc = claudeCode.available(GERCEK_PATH)
    expect(sonuc).not.toBeInstanceOf(Promise)
    expect(typeof sonuc).toBe('boolean')
  })

  it('abonelik şeridi: tahmin sıfır — ve bu "bilinmiyor" değil, ücretsiz (D-8)', () => {
    const e = claudeCode.estimate(dogrula(girdi()))
    expect(e.low.micros).toBe(0n)
    expect(e.high.micros).toBe(0n)
  })
})

describe('doğrulama sınırı (R-43)', () => {
  it('desteklenmeyen yetenek reddedilir', () => {
    const r = claudeCode.validate(girdi({ capability: 'video.text2video' }))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('CAPABILITY_UNSUPPORTED')
  })

  it("premium şerit reddedilir — kullanıcının kararı sessizce free'ye düşürülmez", () => {
    const r = claudeCode.validate(girdi({ lane: 'premium' }))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('LANE_UNSUPPORTED')
  })

  it('boş prompt reddedilir', () => {
    const r = claudeCode.validate(girdi({ prompt: '   ' }))
    expect(r.ok).toBe(false)
  })

  it('hatalar AppError — sağlayıcı SDK tipi sınırı geçmiyor', () => {
    const r = claudeCode.validate(girdi({ capability: 'yok' }))
    if (r.ok) return
    expect(r.error.kind).toBe('validation')
    expect(r.error.costIncurred).toEqual({ micros: 0n, currency: 'USD' })
  })
})

describe('Claude Code YOKKEN sessizce atlamaz (kabul kriteri)', () => {
  it('available() false döner', () => {
    expect(claudeCode.available(BOS_PATH)).toBe(false)
  })

  it('start() provider_unavailable döner — boş başarı DEĞİL', async () => {
    const ac = new AbortController()
    const r = await claudeCode.start(dogrula(girdi()), {
      correlationId: 'cor_t',
      signal: ac.signal,
      env: BOS_PATH,
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('provider_unavailable')
    expect(r.error.code).toBe('CLAUDE_CODE_NOT_FOUND')
    expect(r.error.details?.['binary']).toBe('claude')
  })

  it('katalog sağlayıcıyı SİLMEZ, kullanılamaz diye işaretler', () => {
    const adaylar = candidatesFor('text.generate', BOS_PATH)
    expect(adaylar).toHaveLength(1)
    expect(adaylar[0]?.available).toBe(false)
    expect(adaylar[0]?.unavailableReason).not.toBeNull()
  })
})

describe('sağlayıcı kataloğu (§8.2 · R-40)', () => {
  it('yetenek adıyla aday bulunur, sağlayıcı adıyla değil', () => {
    expect(candidatesFor('text.generate', GERCEK_PATH).length).toBeGreaterThan(0)
    expect(candidatesFor('claude-code', GERCEK_PATH)).toEqual([])
  })

  it('bilinmeyen yetenek boş liste döndürür', () => {
    expect(candidatesFor('yok.boyle', GERCEK_PATH)).toEqual([])
  })

  it('katalogdaki yetenekler nokta içerir — fiil adı DEĞİL (§3.10)', () => {
    for (const c of allCapabilities()) {
      expect(c, c).toContain('.')
      expect(c, c).toBe(asciiLower(c))
    }
  })

  it('adaptör id ile bulunur', () => {
    expect(adapterById('claude-code')?.id).toBe('claude-code')
    expect(adapterById('yok')).toBeNull()
  })
})
