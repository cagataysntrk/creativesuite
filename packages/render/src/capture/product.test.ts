import { describe, expect, it } from 'vitest'
import { assertCompliance } from '../compliance/claim.js'
import { productCaptureBasis, usableAsProductShot } from './product.js'

const shot = {
  path: '/tmp/x.png',
  demoRef: 'demos/haber-takip/demo-script.ts#panel',
  captureRunId: 'run_capture_1',
  width: 1600,
  height: 900,
}

describe('ürün ekran görüntüsü dayanağı', () => {
  it('gerçek çekim iddiası KURULUYOR', () => {
    const r = assertCompliance({
      basis: productCaptureBasis(shot),
      aiGenerated: false,
      correlationId: 'cor_1',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.basis.kind).toBe('product_capture')
    expect(r.value.containsSyntheticPerson).toBe(false)
  })

  // 🧪 İHLAL TESTİ — üretilmiş bir görsel ürün ekranı OLAMAZ. Fikstür (D-181): geçerli
  // bir çekim dayanağı + `aiGenerated: true`; kural kalkarsa ikisi birden iddia edilir
  // ve hangisinin yalan olduğunu sistem bilemez.
  it('çekim + üretim birlikte iddia edilemez', () => {
    const r = assertCompliance({
      basis: productCaptureBasis(shot),
      aiGenerated: true,
      correlationId: 'cor_2',
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(JSON.stringify(r.error.details)).toContain('capture_cannot_be_generated')
  })

  it('demoRef’siz çekim iddiası REDDEDİLİYOR — denetlenemeyen iddia beyandır', () => {
    const r = assertCompliance({
      basis: productCaptureBasis({ ...shot, demoRef: '  ' }),
      aiGenerated: false,
      correlationId: 'cor_3',
    })
    expect(r.ok).toBe(false)
  })

  it('captureRunId’siz çekim iddiası REDDEDİLİYOR', () => {
    const r = assertCompliance({
      basis: productCaptureBasis({ ...shot, captureRunId: '' }),
      aiGenerated: false,
      correlationId: 'cor_4',
    })
    expect(r.ok).toBe(false)
  })
})

describe('deckte kullanılabilir mi', () => {
  it('çekim dayanaklı görüntü kullanılabilir', () => {
    expect(usableAsProductShot({ aiGenerated: false, basis: { kind: 'product_capture' } })).toBe(
      true
    )
  })

  it('üretilmiş görüntü reddediliyor', () => {
    const r = usableAsProductShot({ aiGenerated: true, basis: { kind: 'product_capture' } })
    expect(r !== true && r.kind).toBe('ai_generated')
  })

  it('başka dayanaklı görüntü ürün ekranı SAYILMIYOR', () => {
    const r = usableAsProductShot({ aiGenerated: false, basis: { kind: 'prompt_forbids_people' } })
    expect(r !== true && r.kind).toBe('not_captured')
  })
})

// ── BAĞLANMA: yayın yüklemi uydurma ekranı REDDEDİYOR mu ─────────────────────
import { inspectManifest, isPublishable } from '@suite/kernel'

const manifest = (
  shots: readonly Record<string, unknown>[]
): Parameters<typeof inspectManifest>[0] =>
  ({
    runId: 'run_1',
    brandId: 'brd_upcytech',
    eraId: 'imalat-2026',
    pipeline: 'prospect-deck',
    corpusCommit: '1f0e3dad99908345f7439f8ffabdffc418ac0d5f',
    registryCommit: '2b0e3dad99908345f7439f8ffabdffc418ac0d60',
    createdAt: '2026-08-16T12:00:00.000Z',
    decisions: [],
    context: [],
    contextRetentionDays: null,
    steps: [
      {
        stepId: 'kompozit',
        verb: 'COMPOSE',
        providerId: null,
        candidates: [],
        startedAt: '2026-08-16T12:00:00.000Z',
        finishedAt: '2026-08-16T12:00:00.000Z',
        estimatedCost: {
          low: { micros: 0n, currency: 'USD' },
          high: { micros: 0n, currency: 'USD' },
        },
        actualCost: null,
        status: 'ok',
        output: { productShots: shots },
      },
    ],
  }) as never

describe('yayın yüklemi (bağlanma)', () => {
  it('gerçek çekim YAYINLANABİLİR', () => {
    expect(
      isPublishable(
        manifest([{ captureRunId: 'run_capture_1', demoRef: 'demos/x#panel', aiGenerated: false }])
      )
    ).toBe(true)
  })

  // 🧪 Adımın kendi kriteri: üretilmiş bir görseli ürün ekranı olarak koy → reddediliyor.
  it('üretilmiş ekran YAYINLANAMAZ', () => {
    const m = manifest([{ captureRunId: 'run_1', demoRef: 'demos/x#panel', aiGenerated: true }])
    expect(isPublishable(m)).toBe(false)
    const k = inspectManifest(m).find((d) => d.kind === 'fabricated_product_shot')
    expect(k?.kind === 'fabricated_product_shot' && k.reason).toContain('üretilmiş')
  })

  it('kaynağı olmayan ekran YAYINLANAMAZ — "çekildi" demek yetmiyor', () => {
    const m = manifest([{ aiGenerated: false }])
    expect(isPublishable(m)).toBe(false)
    const k = inspectManifest(m).find((d) => d.kind === 'fabricated_product_shot')
    expect(k?.kind === 'fabricated_product_shot' && k.reason).toContain('denetlenemez')
  })
})
