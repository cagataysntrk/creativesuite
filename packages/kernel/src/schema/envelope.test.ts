import { describe, expect, it } from 'vitest'
import { readJsonFixture } from '../testing/fixtures.js'
import { RecordEnvelopeSchema } from './envelope.js'

const gecerli = (): Record<string, unknown> =>
  structuredClone(readJsonFixture('corpus', 'positioning-sentetik.json')) as Record<string, unknown>

describe('RecordEnvelope şeması', () => {
  it('sentetik fixture geçerli', () => {
    const sonuc = RecordEnvelopeSchema.safeParse(gecerli())
    expect(sonuc.success).toBe(true)
  })

  it('bilinmeyen status reddedilir', () => {
    const sonuc = RecordEnvelopeSchema.safeParse({ ...gecerli(), status: 'yayinda' })
    expect(sonuc.success).toBe(false)
  })

  it('confidence 0..1 dışında reddedilir', () => {
    expect(RecordEnvelopeSchema.safeParse({ ...gecerli(), confidence: 1.5 }).success).toBe(false)
    expect(RecordEnvelopeSchema.safeParse({ ...gecerli(), confidence: -0.1 }).success).toBe(false)
  })

  it('eksik brand_id reddedilir — marka ekseni zorunludur (§5.2)', () => {
    const eksik = gecerli()
    delete eksik['brand_id']
    expect(RecordEnvelopeSchema.safeParse(eksik).success).toBe(false)
  })

  it('bi-temporal alanlar null kabul eder, çöp string kabul etmez', () => {
    expect(RecordEnvelopeSchema.safeParse({ ...gecerli(), expired_at: null }).success).toBe(true)
    expect(RecordEnvelopeSchema.safeParse({ ...gecerli(), expired_at: 'dun' }).success).toBe(false)
  })

  it('source.quote null olabilir ama alan kendisi zorunludur', () => {
    const g = gecerli()
    expect(
      RecordEnvelopeSchema.safeParse({
        ...g,
        source: { kind: 'url', ref: 'https://ornek.test', quote: null },
      }).success
    ).toBe(true)
    delete g['source']
    expect(RecordEnvelopeSchema.safeParse(g).success).toBe(false)
  })
})
