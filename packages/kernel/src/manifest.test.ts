import { describe, expect, it } from 'vitest'
import { usd, type BrandId, type EraId, type RunId, type StepId } from '@suite/contracts'
import {
  costSummary,
  inspectManifest,
  isPublishable,
  type RunManifest,
  type StepRecord,
} from './manifest.js'

const adim = (over: Partial<StepRecord> = {}): StepRecord => ({
  stepId: 'stp_1' as StepId,
  verb: 'GENERATE',
  lane: 'premium',
  capability: 'image.generate',
  providerId: 'prv_a',
  model: 'model-a',
  seed: 42,
  params: { aspect: '4:5' },
  estimatedCost: { low: usd(3_000n), high: usd(5_000n) },
  actualCost: usd(4_000n),
  candidates: [
    {
      providerId: 'prv_a',
      capability: 'image.generate',
      selected: true,
      rejectionReason: null,
      estimatedCost: { low: usd(3_000n), high: usd(5_000n) },
    },
    {
      providerId: 'prv_b',
      capability: 'image.generate',
      selected: false,
      rejectionReason: 'aspect 4:5 desteklenmiyor',
      estimatedCost: null,
    },
  ],
  startedAt: '2026-08-15T09:00:00.000Z',
  finishedAt: '2026-08-15T09:00:30.000Z',
  ...over,
})

const manifest = (over: Partial<RunManifest> = {}): RunManifest => ({
  runId: 'run_0192f3a1-0000-7000-8000-000000000020' as RunId,
  brandId: 'brd_0192f3a1-0000-7000-8000-00000000000a' as BrandId,
  eraId: 'era_0192f3a1-0000-7000-8000-00000000000b' as EraId,
  pipeline: 'instagram-post',
  corpusCommit: 'a'.repeat(40),
  registryCommit: 'b'.repeat(40),
  createdAt: '2026-08-15T09:00:00.000Z',
  steps: [adim()],
  decisions: [],
  context: [],
  contextRetentionDays: 90,
  ...over,
})

describe('manifest sözleşmesi (§13)', () => {
  it('tam manifest temiz', () => {
    expect(inspectManifest(manifest())).toEqual([])
    expect(isPublishable(manifest())).toBe(true)
  })

  it('manifest YOKSA çıktı yayınlanamaz — kabul kriteri', () => {
    expect(inspectManifest(null)).toEqual([{ kind: 'missing_manifest' }])
    expect(isPublishable(undefined)).toBe(false)
  })

  it('corpus commit SHA eksikse reddedilir — replay yalan olur', () => {
    const d = inspectManifest(manifest({ corpusCommit: '' }))
    expect(d).toContainEqual({ kind: 'missing_field', field: 'corpusCommit' })
    expect(isPublishable(manifest({ corpusCommit: '' }))).toBe(false)
  })

  it('marka ve dönem eksikse reddedilir (R-11)', () => {
    const d = inspectManifest(manifest({ brandId: '' as BrandId, eraId: '' as EraId }))
    expect(d).toContainEqual({ kind: 'missing_field', field: 'brandId' })
    expect(d).toContainEqual({ kind: 'missing_field', field: 'eraId' })
  })

  it('adımsız manifest reddedilir', () => {
    expect(inspectManifest(manifest({ steps: [] }))).toContainEqual({ kind: 'no_steps' })
  })
})

describe('kaybeden sağlayıcılar da yazılır (§4.4)', () => {
  it('sağlayıcı seçen adım aday listesi olmadan geçemez', () => {
    const d = inspectManifest(manifest({ steps: [adim({ candidates: [] })] }))
    expect(d).toContainEqual({ kind: 'step_without_candidates', stepId: 'stp_1' })
  })

  it('adaylar var ama hiçbiri seçilmemişse çelişki', () => {
    const d = inspectManifest(
      manifest({
        steps: [
          adim({
            candidates: [
              {
                providerId: 'prv_a',
                capability: 'image.generate',
                selected: false,
                rejectionReason: 'pahalı',
                estimatedCost: null,
              },
            ],
          }),
        ],
      })
    )
    expect(d).toContainEqual({ kind: 'no_selected_provider', stepId: 'stp_1' })
  })

  it('seçilen aday red gerekçesi taşıyamaz — defter kendiyle çelişmez', () => {
    const d = inspectManifest(
      manifest({
        steps: [
          adim({
            candidates: [
              {
                providerId: 'prv_a',
                capability: 'image.generate',
                selected: true,
                rejectionReason: 'elendi',
                estimatedCost: null,
              },
            ],
          }),
        ],
      })
    )
    expect(d).toContainEqual({ kind: 'selected_with_rejection', stepId: 'stp_1' })
  })

  it('red gerekçeleri okunabilir kalır', () => {
    const m = manifest()
    const kaybeden = m.steps[0]?.candidates.filter((c) => !c.selected) ?? []
    expect(kaybeden).toHaveLength(1)
    expect(kaybeden[0]?.rejectionReason).toBe('aspect 4:5 desteklenmiyor')
  })
})

describe('metered adım maliyetsiz kapanamaz (§8.3)', () => {
  it('biten GENERATE adımı gerçek maliyet taşımak zorunda', () => {
    const d = inspectManifest(manifest({ steps: [adim({ actualCost: null })] }))
    expect(d).toContainEqual({ kind: 'metered_step_without_cost', stepId: 'stp_1' })
  })

  it('henüz bitmemiş adım maliyetsiz olabilir', () => {
    const d = inspectManifest(manifest({ steps: [adim({ actualCost: null, finishedAt: null })] }))
    expect(d).toEqual([])
  })

  it('metered olmayan fiil maliyetsiz kapanabilir', () => {
    const d = inspectManifest(
      manifest({
        steps: [
          adim({
            verb: 'COMPOSE',
            actualCost: null,
            capability: null,
            providerId: null,
            candidates: [],
          }),
        ],
      })
    )
    expect(d).toEqual([])
  })
})

describe('tahmin vs gerçek (§13)', () => {
  it('bant içindeki gerçek maliyet sapma saymaz', () => {
    const s = costSummary(manifest())
    expect(s.estimatedLow.micros).toBe(3_000n)
    expect(s.estimatedHigh.micros).toBe(5_000n)
    expect(s.actual.micros).toBe(4_000n)
    expect(s.outsideBand).toBe(false)
  })

  it('bandın üstüne çıkan gerçek maliyet işaretlenir', () => {
    const s = costSummary(manifest({ steps: [adim({ actualCost: usd(9_000n) })] }))
    expect(s.outsideBand).toBe(true)
  })

  it('bandın altında kalmak da sapmadır — tahmin de yanlış olabilir', () => {
    const s = costSummary(manifest({ steps: [adim({ actualCost: usd(100n) })] }))
    expect(s.outsideBand).toBe(true)
  })

  it('çok adımlı çalıştırmada bantlar toplanır', () => {
    const s = costSummary(manifest({ steps: [adim(), adim({ stepId: 'stp_2' as StepId })] }))
    expect(s.estimatedLow.micros).toBe(6_000n)
    expect(s.estimatedHigh.micros).toBe(10_000n)
    expect(s.actual.micros).toBe(8_000n)
  })
})

describe('bağlam saklama süresi (V-11 · D-63)', () => {
  it('manifest bağlam saklama süresini TAŞIR — kararsız bırakılmaz', () => {
    expect(manifest().contextRetentionDays).toBe(90)
  })

  it('süresiz saklama açıkça null ile ifade edilir', () => {
    expect(inspectManifest(manifest({ contextRetentionDays: null }))).toEqual([])
  })
})
