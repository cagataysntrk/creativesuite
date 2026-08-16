// Zincir KESİNTİSİZ mi: üretim girişinden manifest dedektörüne (D-216 · FAZ-6.10).
//
// **Bu testin sorusu "fonksiyon doğru mu" değil, "yol var mı".** FAZ 6 denetimi üç
// dedektörün de ölü olduğunu buldu: `inspectManifest` `fetchedAt`/`personalizationFields`/
// `productShots` arıyordu, gövdeler onları üretmiyordu ve `ozetle()`nin beyaz listesi
// üretseler bile eliyordu. Üç kopuk halka.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import {
  getVerb,
  inspectManifest,
  isPublishable,
  manualClock,
  openDb,
  seededRng,
  type Db,
  type Verb,
} from '@suite/kernel'
import { ok, usd, type BrandId, type EraId, type RunId, type VerbName } from '@suite/contracts'
import type { Pipeline } from '@suite/registry'
import { initLedger } from './cost/ledger.js'
import { readManifest } from './manifest-writer.js'
import { runPipeline } from './run.js'

const RUN = 'run_0192f3a1-0000-7000-8000-0000000000c1' as RunId
const SIMDI = '2026-08-16T09:00:00.000Z'

let tmp: TempDir
let db: Db
beforeEach(() => {
  tmp = makeTempDir('suite-zincir-')
  db = openDb({ path: ':memory:' })
  initLedger(db)
})
afterEach(() => tmp.cleanup())

const sahte = (name: VerbName, veri: unknown): Verb => {
  const s = getVerb(name)
  return {
    name: s.name,
    effectClass: s.effectClass,
    metered: s.metered,
    plan: s.plan,
    run: async () =>
      ok({
        costs: s.metered
          ? [
              {
                verb: name,
                capability: 'test',
                providerId: 'p1',
                amount: usd(1n),
                kind: 'actual' as const,
              },
            ]
          : [],
        data: veri,
      }),
  }
}

const kos = (verbs: Record<string, Verb>, steps: Pipeline['steps']) =>
  runPipeline({
    repoRoot: tmp.path,
    pipeline: { id: 'zincir-hat', title: 'Zincir', steps },
    runId: RUN,
    brandId: 'brd_test' as BrandId,
    eraId: 'era_test' as EraId,
    corpusCommit: 'abc1234',
    registryCommit: 'def5678',
    verbs,
    pricing: {},
    candidatesFor: () => [],
    env: {},
    caps: { perRun: null, perMonth: null },
    db,
    clock: manualClock(SIMDI),
    rng: seededRng(1),
    sleep: async () => undefined,
  } as Parameters<typeof runPipeline>[0])

const adim = (id: string, verb: VerbName, needs: string[] = []) => ({
  id,
  verb,
  capability: null,
  constraints: {},
  needs,
  gate: null,
})

describe('zincir kesintisiz mi', () => {
  // 🧪 Denetimin 5. bulgusu: `ozetle()` beyaz listesi anahtarları ELİYORDU.
  it('`fetchedAt` adım çıktısından MANİFESTE geçiyor', async () => {
    await kos(
      { INGEST: sahte('INGEST', { fetchedAt: '2026-08-14T00:00:00.000Z', sourceRef: 'u' }) },
      [adim('arastir', 'INGEST')]
    )
    const m = readManifest(tmp.path, RUN)
    expect(m?.steps[0]?.output).toMatchObject({ fetchedAt: '2026-08-14T00:00:00.000Z' })
  })

  it('BAYAT kaynak manifest üzerinden yayını BLOKLUYOR', async () => {
    await kos(
      // Çalıştırma 2026-08-16, kaynak 2026-06-01 → 76 gün. Ölçü çalıştırmanın kendi
      // `createdAt`i (R-06): saat okunmuyor.
      { INGEST: sahte('INGEST', { fetchedAt: '2026-06-01T00:00:00.000Z', sourceRef: 'u' }) },
      [adim('arastir', 'INGEST')]
    )
    const m = readManifest(tmp.path, RUN)
    expect(isPublishable(m)).toBe(false)
    expect(inspectManifest(m).some((d) => d.kind === 'stale_source')).toBe(true)
  })

  it('altı kişiselleştirme alanı manifest üzerinden BLOKLUYOR', async () => {
    await kos(
      {
        COMPOSE: sahte('COMPOSE', {
          personalizationFields: ['a', 'b', 'c', 'd', 'e', 'f'],
        }),
      },
      [adim('kompozit', 'COMPOSE')]
    )
    const m = readManifest(tmp.path, RUN)
    expect(inspectManifest(m).some((d) => d.kind === 'personalization_cap')).toBe(true)
  })

  it('ÜRETİLMİŞ ürün ekranı manifest üzerinden BLOKLUYOR', async () => {
    await kos(
      {
        COMPOSE: sahte('COMPOSE', {
          productShots: [{ aiGenerated: true, captureRunId: 'r', demoRef: 'd' }],
        }),
      },
      [adim('kompozit', 'COMPOSE')]
    )
    const m = readManifest(tmp.path, RUN)
    expect(inspectManifest(m).some((d) => d.kind === 'fabricated_product_shot')).toBe(true)
  })

  it('temiz koşu YAYINLANABİLİR — kapılar yanlış alarm vermiyor', async () => {
    await kos(
      {
        INGEST: sahte('INGEST', { fetchedAt: '2026-08-14T00:00:00.000Z', sourceRef: 'u' }),
        COMPOSE: sahte('COMPOSE', {
          personalizationFields: ['a', 'b'],
          productShots: [{ aiGenerated: false, captureRunId: 'r', demoRef: 'd' }],
        }),
      },
      [adim('arastir', 'INGEST'), adim('kompozit', 'COMPOSE', ['arastir'])]
    )
    const m = readManifest(tmp.path, RUN)
    expect(inspectManifest(m)).toEqual([])
    expect(isPublishable(m)).toBe(true)
  })

  /**
   * 🧪 Denetimin 9. bulgusu: `runPipeline` `verb.run`u doğrudan çağırıyordu, `runVerb`
   * atlanıyordu → `ingestGate` (R-50) üretimde HİÇ koşmuyordu.
   *
   * Taze dış metin indikten SONRA metered bir fiil insan onayı olmadan ateşlenemez.
   */
  it('taze dış metinden SONRA metered fiil insan onayı olmadan koşmuyor (R-50)', async () => {
    const r = await kos(
      {
        INGEST: sahte('INGEST', {
          fetchedAt: '2026-08-14T00:00:00.000Z',
          sourceRef: 'u',
          domain: 'x',
        }),
        RENDER: sahte('RENDER', { slides: ['/tmp/a.png'] }),
      },
      [adim('arastir', 'INGEST'), adim('render', 'RENDER', ['arastir'])]
    )
    expect(r.stoppedAt).toBe('render')
    expect(r.errors.some((e) => e.error.code === 'UNTRUSTED_INPUT_GATE')).toBe(true)
  })

  it('insan onayı VARSA aynı hat geçiyor', async () => {
    const r = await kos(
      {
        INGEST: sahte('INGEST', {
          fetchedAt: '2026-08-14T00:00:00.000Z',
          sourceRef: 'u',
          domain: 'x',
        }),
        RENDER: sahte('RENDER', { slides: ['/tmp/a.png'] }),
      },
      [adim('arastir', 'INGEST'), adim('render', 'RENDER', ['arastir'])]
    )
    expect(r.stoppedAt).toBe('render')
  })
})
