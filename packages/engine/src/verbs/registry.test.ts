import { describe, expect, it } from 'vitest'
import type { CorrelationId } from '@suite/contracts'
import { ok, usd } from '@suite/contracts'
import { getVerb, type Verb } from '@suite/kernel'
import { resolveVerb } from './registry.js'

// Kernel'in tablosu SÖZLEŞMEDİR, gövde dış halkalarda yaşar (§3.10). Gövde sözleşmeyi
// değiştirebilseydi `metered: false` diyen bir `RENDER` bütçe kapısını (D-17) sessizce
// devre dışı bırakırdı — ve "çalıştırma öncesi maliyet tahmini dürüsttür" iddiası
// tam o noktada çökerdi.

const KOR = 'cor_t' as CorrelationId

const govde = (over: Partial<Verb> = {}): Verb => ({
  ...getVerb('RENDER'),
  run: async () =>
    ok({
      costs: [
        {
          verb: 'RENDER',
          capability: 'image.render',
          providerId: 'prv',
          amount: usd(1n),
          kind: 'actual',
        },
      ],
      data: null,
    }),
  ...over,
})

describe('fiil kaydı — gövde sözleşmeyi DEĞİŞTİREMEZ', () => {
  it('gövde yoksa kernel iskeleti dönüyor', () => {
    const r = resolveVerb('RENDER', {}, KOR)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.name).toBe('RENDER')
  })

  it('uyumlu gövde kabul ediliyor', () => {
    const r = resolveVerb('RENDER', { RENDER: govde() }, KOR)
    expect(r.ok).toBe(true)
  })

  it('`metered: false` enjekte etmek REDDEDİLİYOR — bütçe kapısı atlanamaz', () => {
    const r = resolveVerb('RENDER', { RENDER: govde({ metered: false }) }, KOR)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.code).toBe('VERB_CONTRACT_MISMATCH')
      expect(String(r.error.details?.['reason'])).toContain('bütçe kapısı')
    }
  })

  it('yan etki sınıfını değiştirmek REDDEDİLİYOR (R-04)', () => {
    const r = resolveVerb('RENDER', { RENDER: govde({ effectClass: 'pure' }) }, KOR)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(String(r.error.details?.['reason'])).toContain('yan etki sınıfı')
  })

  it('başka fiilin gövdesini takmak REDDEDİLİYOR', () => {
    const r = resolveVerb('RENDER', { RENDER: { ...govde(), name: 'GENERATE' } }, KOR)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(String(r.error.details?.['reason'])).toContain('kendini')
  })

  it('korelasyon id hataya taşınıyor — hangi çalıştırma olduğu bilinmeli (§13)', () => {
    const r = resolveVerb('RENDER', { RENDER: govde({ metered: false }) }, KOR)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.correlationId).toBe(KOR)
  })
})
