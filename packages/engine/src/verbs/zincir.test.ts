// VALIDATE gövdesi zinciri GERÇEKTEN koşuyor mu (§10 · D-216 · FAZ-6.10).
//
// Denetimin 3. bulgusu: `chain:` kısıtı YAML'da duruyordu, hiçbir kod okumuyordu ve
// `prospectDeckZinciri`nin sıfır çağıranı vardı. Beş kapı yazılmış ve hiç koşmamıştı.

import { describe, expect, it } from 'vitest'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import { systemClock, systemRng } from '@suite/kernel'
import type { BrandId, CorrelationId, EraId, RunId, StepId } from '@suite/contracts'
import { validateBody } from './bodies.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'k',
  definitionDigest: 'sha256:x',
  contextManifest: 'x',
  sourceRunId: 'run_1',
}

const doc: DocumentModel = {
  kind: 'deck-page',
  width: 1600,
  height: 900,
  tokenCss: ':root{--role-bg:#000}',
  stamp: DAMGA,
  blocks: [{ type: 'heading', text: 'Ölçüm', level: 1 }],
}

// Saat SABİT: `systemClock` kullanmak testi bugüne bağlardı ve `saat` darboğazı da
// çıplak `Date.now()`u zaten yasaklıyor (R-06). Sabit saat, tazelik testini de
// deterministik yapıyor — 40 günlük kaynak her koşuda 40 günlük.
const SIMDI = '2026-08-16T12:00:00.000Z'
const sahteClock = { nowIso: () => SIMDI, nowMs: () => Date.parse(SIMDI) }

const ctx = () => ({
  runId: 'run_test' as RunId,
  stepId: 'olgu-dogrulama' as StepId,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'imalat-2026' as EraId,
  correlationId: 'cor_test' as CorrelationId,
  clock: sahteClock as unknown as typeof systemClock,
  rng: systemRng,
})

const temizCheck = async () => ({ blocked: false, report: 'temiz' })

const kos = (inputs: Record<string, unknown>, constraints: Record<string, unknown> = {}) =>
  validateBody({ check: temizCheck }).run(ctx(), { constraints, inputs })

const TAZE = '2026-08-13T12:00:00.000Z' // 3 gün
const BAYAT = '2026-07-07T12:00:00.000Z' // 40 gün

const temizGirdi = () => ({
  kompozit: { document: doc },
  render: { deck: '/tmp/deck.pdf', pages: 2 },
  arastir: { fetchedAt: TAZE, sourceRef: 'https://ornek.gecersiz/x' },
  urun: { productShots: [{ aiGenerated: false, basis: { kind: 'product_capture' } }] },
})

describe('VALIDATE · zincir (bağlanma)', () => {
  it('PDF çıktısı doğrulanabiliyor — `slides` yokluğu artık engel değil', async () => {
    const r = await kos({ kompozit: { document: doc }, render: { deck: '/tmp/x.pdf' } })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Piksel QA atlandı ve bu YAZILDI — atlanan denetim "temiz" değildir.
    expect(String((r.value.data as { qa: string }).qa)).toContain('ATLANDI')
  })

  it('`chain` kısıtı olmadan zincir KOŞMUYOR — davranış değişmedi', async () => {
    const r = await kos(temizGirdi())
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect((r.value.data as { chain?: string }).chain).toBeUndefined()
  })

  it('`chain: prospect-deck` BEŞ kapıyı koşuyor', async () => {
    const r = await kos(temizGirdi(), { chain: 'prospect-deck' })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const d = r.value.data as { chain: string; chainGates: readonly string[] }
    expect(d.chain).toBe('prospect-deck')
    expect(d.chainGates).toHaveLength(5)
  })

  // 🧪 Bayat kaynak hattı DURDURUYOR — dedektör artık besleniyor.
  it('bayat kaynak hattı DURDURUYOR', async () => {
    const g = temizGirdi()
    const r = await kos(
      { ...g, arastir: { fetchedAt: BAYAT, sourceRef: 'https://ornek.gecersiz/eski' } },
      { chain: 'prospect-deck' }
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('CHAIN_BLOCKED')
    expect(JSON.stringify(r.error.details)).toContain('tazelik')
  })

  it('ÜRETİLMİŞ ürün ekranı hattı DURDURUYOR', async () => {
    const g = temizGirdi()
    const r = await kos(
      { ...g, urun: { productShots: [{ aiGenerated: true, basis: { kind: 'product_capture' } }] } },
      { chain: 'prospect-deck' }
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(JSON.stringify(r.error.details)).toContain('urun-ekrani')
  })

  it('altı kişiselleştirme alanı hattı DURDURUYOR', async () => {
    const g = temizGirdi()
    const alanlar = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({
      id,
      label: `Alan ${id}`,
      sourceRef: 'https://ornek.gecersiz/x',
      confidence: 'direct',
    }))
    const r = await kos(
      { ...g, metin: { personalizationFields: alanlar } },
      { chain: 'prospect-deck' }
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(JSON.stringify(r.error.details)).toContain('kisisellestirme')
  })
})
