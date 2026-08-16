import { describe, expect, it } from 'vitest'
import { inspectManifest, isPublishable, type RunManifest } from './manifest.js'
import { usd } from '@suite/contracts'

/**
 * Transkript kapısı (§7.5 · FAZ-5.5).
 *
 * Kural `PUBLISH` yükleminin İÇİNDE yaşıyor: ikinci bir kontrol noktası,
 * atlanabilecek bir kontrol noktasıdır.
 */
const adim = (o: { id: string; output?: Record<string, unknown> | null }) => ({
  stepId: o.id as never,
  verb: 'RENDER' as never,
  lane: 'free' as const,
  capability: null,
  providerId: null,
  model: null,
  seed: null,
  params: {},
  estimatedCost: { low: usd(0n), high: usd(0n) },
  actualCost: usd(0n),
  candidates: [],
  startedAt: null,
  finishedAt: null,
  output: o.output ?? null,
})

const manifest = (o: {
  adimlar: ReturnType<typeof adim>[]
  kararlar?: { gate: string; decision: string }[]
}): RunManifest =>
  ({
    runId: 'run_x',
    brandId: 'brd_upcytech',
    eraId: 'imalat-2026',
    pipeline: 'demo-video',
    corpusCommit: 'a'.repeat(40),
    registryCommit: 'b'.repeat(40),
    createdAt: 'T',
    steps: o.adimlar,
    decisions: (o.kararlar ?? []).map((k) => ({ ...k, at: 'T', note: null })),
    context: [],
    contextRetentionDays: null,
  }) as unknown as RunManifest

describe('transkript kapısı', () => {
  // 🧪 İHLAL TESTİ — altyazı var, onay yok. Fikstür (D-181): aynı manifest yalnız
  // onay eklenince yayınlanabilir oluyor; kural kalkarsa iki dal da `true` verir.
  it('altyazı üretildi ama transkript ONAYLANMADI → YAYINLANAMAZ', () => {
    const m = manifest({ adimlar: [adim({ id: 'altyazi', output: { captions: 'x.ass' } })] })
    expect(isPublishable(m)).toBe(false)
    expect(inspectManifest(m).map((d) => d.kind)).toContain('captions_without_transcript')
  })

  it('transkript ONAYLANDI → yayınlanabilir', () => {
    const m = manifest({
      adimlar: [adim({ id: 'altyazi', output: { captions: 'x.ass' } })],
      kararlar: [{ gate: 'transkript', decision: 'approved' }],
    })
    expect(isPublishable(m)).toBe(true)
  })

  it('REDDEDİLEN transkript onay SAYILMIYOR', () => {
    const m = manifest({
      adimlar: [adim({ id: 'altyazi', output: { captions: 'x.ass' } })],
      kararlar: [{ gate: 'transkript', decision: 'rejected' }],
    })
    expect(isPublishable(m)).toBe(false)
  })

  it('BAŞKA bir kapının onayı transkript yerine geçmiyor', () => {
    const m = manifest({
      adimlar: [adim({ id: 'altyazi', output: { captions: 'x.ass' } })],
      kararlar: [{ gate: 'onay', decision: 'approved' }],
    })
    expect(isPublishable(m)).toBe(false)
  })

  it('altyazı YOKSA kapı hiç tetiklenmiyor — yanlış pozitif de hatadır', () => {
    const m = manifest({ adimlar: [adim({ id: 'render', output: { slides: 3 } })] })
    expect(isPublishable(m)).toBe(true)
  })
})
