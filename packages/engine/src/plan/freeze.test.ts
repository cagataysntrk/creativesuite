import { describe, expect, it } from 'vitest'
import { usd } from '@suite/contracts'
import type { BrandId, EraId, RunId } from '@suite/contracts'
import { blockMessage, freezePlan, launchBlocks, planStale, staleMessage } from './freeze.js'
import type { PlanReport } from '../plan.js'

const adim = (o: {
  id: string
  provider?: string
  metered?: boolean
  low?: bigint
  high?: bigint
}) => ({
  stepId: o.id,
  verb: 'GENERATE',
  capability: 'image.generate',
  effectClass: 'network-model',
  metered: o.metered ?? true,
  needs: [],
  gate: null,
  constraints: { aspect: '4:5' },
  estimatedCost: { low: usd(o.low ?? 1000n), high: usd(o.high ?? 3000n) },
  kosumSayisi: 1,
  candidateProviders: o.provider === undefined ? [] : [o.provider],
  unavailableProviders: [],
  routing:
    o.provider === undefined
      ? null
      : {
          winner: {
            providerId: o.provider,
            title: o.provider,
            cost: { low: usd(o.low ?? 1000n), high: usd(o.high ?? 3000n) },
            confidence: 'green' as const,
            quality: 1,
            latencySeconds: null,
            score: 1,
          },
          rejected: [],
          fallbacks: [],
        },
})

const rapor = (adimlar: ReturnType<typeof adim>[]): PlanReport =>
  ({
    pipeline: 'instagram-post',
    title: 'IG post',
    brandId: 'brd_upcytech' as BrandId,
    eraId: 'imalat-2026' as EraId,
    order: adimlar.map((a) => a.stepId),
    steps: adimlar,
    totalLow: usd(adimlar.reduce((t, a) => t + a.estimatedCost.low.micros, 0n)),
    totalHigh: usd(adimlar.reduce((t, a) => t + a.estimatedCost.high.micros, 0n)),
    meteredSteps: adimlar.filter((a) => a.metered).length,
    gates: [],
    unpricedSteps: [],
    varyantSayisi: 1,
    matrisModu: null,
  }) as unknown as PlanReport

const dondur = (r: PlanReport, ek: Partial<Parameters<typeof freezePlan>[0]> = {}) =>
  freezePlan({
    report: r,
    runId: 'run_1' as RunId,
    corpusCommit: 'a'.repeat(40),
    registryCommit: 'b'.repeat(40),
    frozenAt: '2026-08-16T00:00:00.000Z',
    recordIds: ['rec_b', 'rec_a'],
    descriptorDigests: { cloudflare: 'sha256:desc1' },
    ...ek,
  })

describe('plan dondurma (R-07)', () => {
  it('aynı karar AYNI özeti verir — zaman ve run id özete girmez', () => {
    // Girmeselerdi "bu plan değişti mi" sorusu zamana bağlı olur ve hep "evet" derdi.
    const a = dondur(rapor([adim({ id: 'gorsel', provider: 'cloudflare' })]))
    const b = dondur(rapor([adim({ id: 'gorsel', provider: 'cloudflare' })]), {
      runId: 'run_2' as RunId,
      frozenAt: '2027-01-01T00:00:00.000Z',
    })
    expect(a.digest).toBe(b.digest)
  })

  it('sağlayıcı değişince özet DEĞİŞİR', () => {
    const a = dondur(rapor([adim({ id: 'gorsel', provider: 'cloudflare' })]))
    const b = dondur(rapor([adim({ id: 'gorsel', provider: 'fal' })]))
    expect(a.digest).not.toBe(b.digest)
  })

  it('kayıt id sırası özeti DEĞİŞTİRMEZ — sorgu ayrıntısı karar değildir', () => {
    const a = dondur(rapor([adim({ id: 'g', provider: 'cloudflare' })]), {
      recordIds: ['rec_a', 'rec_b'],
    })
    const b = dondur(rapor([adim({ id: 'g', provider: 'cloudflare' })]), {
      recordIds: ['rec_b', 'rec_a'],
    })
    expect(a.digest).toBe(b.digest)
  })

  it('kayıt KÜMESİ değişince özet değişir — seçim de donar', () => {
    const a = dondur(rapor([adim({ id: 'g', provider: 'cloudflare' })]), { recordIds: ['rec_a'] })
    const b = dondur(rapor([adim({ id: 'g', provider: 'cloudflare' })]), {
      recordIds: ['rec_a', 'rec_c'],
    })
    expect(a.digest).not.toBe(b.digest)
  })

  it('model alanı YOK — model ID pipeline seviyesine sızmaz (R-40)', () => {
    const p = dondur(rapor([adim({ id: 'g', provider: 'cloudflare' })]))
    expect('model' in (p.steps[0] ?? {})).toBe(false)
    expect(p.steps[0]?.descriptorDigest).toBe('sha256:desc1')
  })
})

describe('bayatlık — bilgi, engel değil', () => {
  const p = dondur(rapor([adim({ id: 'g', provider: 'cloudflare' })]))
  const simdi = {
    corpusCommit: 'a'.repeat(40),
    registryCommit: 'b'.repeat(40),
    descriptorDigests: { cloudflare: 'sha256:desc1' },
    availableProviders: new Set(['cloudflare']),
  }

  it('dünya değişmemişse sessiz', () => {
    expect(planStale(p, simdi)).toHaveLength(0)
  })

  it('corpus commit kayınca bildirir', () => {
    const r = planStale(p, { ...simdi, corpusCommit: 'c'.repeat(40) })
    expect(r[0]?.kind).toBe('corpus_moved')
    expect(staleMessage(r[0]!)).toContain('corpus')
  })

  it('tanımlayıcı değişince bildirir — donmuş fiyat artık geçerli olmayabilir', () => {
    const r = planStale(p, { ...simdi, descriptorDigests: { cloudflare: 'sha256:BASKA' } })
    expect(r.map((x) => x.kind)).toContain('descriptor_changed')
  })

  it('sağlayıcı kullanılamıyorsa bildirir', () => {
    const r = planStale(p, { ...simdi, availableProviders: new Set<string>() })
    expect(r.map((x) => x.kind)).toContain('provider_unavailable')
  })
})

describe('başlat kilidi (§8.3)', () => {
  it('ÜST sınır tavanı aşarsa kilitler — "muhtemelen aşmaz" garanti değildir', () => {
    const p = dondur(rapor([adim({ id: 'g', provider: 'cloudflare', low: 1000n, high: 9000n })]))
    // Alt sınır tavanın altında ama üst sınır üstünde: yine de kilitli.
    const b = launchBlocks(p, usd(5000n))
    expect(b[0]?.kind).toBe('over_cap')
    expect(blockMessage(b[0]!)).toContain('kilitli')
  })

  it('üst sınır tavanın altındaysa açık', () => {
    const p = dondur(rapor([adim({ id: 'g', provider: 'cloudflare', high: 3000n })]))
    expect(launchBlocks(p, usd(5000n))).toHaveLength(0)
  })

  it("tavan yoksa kilit yok — tavan UI'dan ayarlanır (D-17)", () => {
    const p = dondur(rapor([adim({ id: 'g', provider: 'cloudflare', high: 999_999n })]))
    expect(launchBlocks(p, null)).toHaveLength(0)
  })

  it('fiyatlanmamış ücretli adım da KİLİTLER — eksik tahminle onay verilemez', () => {
    const p = dondur(rapor([adim({ id: 'g' })])) // sağlayıcı yok
    const b = launchBlocks(p, null)
    expect(b[0]?.kind).toBe('unpriced')
    expect(blockMessage(b[0]!)).toContain('EKSİK')
  })
})
