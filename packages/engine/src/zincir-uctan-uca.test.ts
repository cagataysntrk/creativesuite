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
import { runPipeline, UNTRUSTED_GATE } from './run.js'

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

// ── çalıştırma parametreleri adım KISITLARINA ulaşıyor mu ───────────────────
//
// İkinci doğrulama turu: `prospect-deck`in `arastir` adımı `url` bekliyordu ve CLI
// yalnız `topic` alıyordu — başka parametre YOLU YOKTU. Hat `NO_SOURCE_URL` ile
// duruyordu ve bu bir "insan blokajı" gibi görünüyordu; teknik bir eksikti.
describe('çalıştırma parametreleri', () => {
  it('`params` adımın KISITLARINA ekleniyor', async () => {
    let gorulenKisit: Record<string, unknown> = {}
    const gozcu = {
      ...sahte('INGEST', {}),
      run: async (_c: unknown, i: { constraints: Record<string, unknown> }) => {
        gorulenKisit = i.constraints
        return ok({
          costs: [
            {
              verb: 'INGEST' as VerbName,
              capability: 'test',
              providerId: 'p1',
              amount: usd(1n),
              kind: 'actual' as const,
            },
          ],
          data: {},
        })
      },
    }
    await runPipeline({
      repoRoot: tmp.path,
      pipeline: { id: 'p', title: 'p', steps: [adim('arastir', 'INGEST')] },
      runId: RUN,
      brandId: 'brd_test' as BrandId,
      eraId: 'era_test' as EraId,
      corpusCommit: 'abc1234',
      registryCommit: 'def5678',
      verbs: { INGEST: gozcu as never },
      pricing: {},
      candidatesFor: () => [],
      env: {},
      params: { url: 'https://ornek.gecersiz/x', demo_ref: 'demos/dima#fire' },
      caps: { perRun: null, perMonth: null },
      db,
      clock: manualClock(SIMDI),
      rng: seededRng(1),
      sleep: async () => undefined,
    } as Parameters<typeof runPipeline>[0])
    expect(gorulenKisit['url']).toBe('https://ornek.gecersiz/x')
    expect(gorulenKisit['demo_ref']).toBe('demos/dima#fire')
  })

  it('pipeline kısıtı parametreyi EZİYOR — kısıt bir sözleşme, parametre bir örnek', async () => {
    let gorulen: Record<string, unknown> = {}
    const gozcu = {
      ...sahte('COMPOSE', {}),
      run: async (_c: unknown, i: { constraints: Record<string, unknown> }) => {
        gorulen = i.constraints
        return ok({ costs: [], data: {} })
      },
    }
    await runPipeline({
      repoRoot: tmp.path,
      pipeline: {
        id: 'p',
        title: 'p',
        steps: [
          {
            id: 'k',
            verb: 'COMPOSE',
            capability: null,
            constraints: { url: 'SÖZLEŞME' },
            needs: [],
            gate: null,
          },
        ],
      },
      runId: RUN,
      brandId: 'brd_test' as BrandId,
      eraId: 'era_test' as EraId,
      corpusCommit: 'abc1234',
      registryCommit: 'def5678',
      verbs: { COMPOSE: gozcu as never },
      pricing: {},
      candidatesFor: () => [],
      env: {},
      params: { url: 'PARAMETRE' },
      caps: { perRun: null, perMonth: null },
      db,
      clock: manualClock(SIMDI),
      rng: seededRng(1),
      sleep: async () => undefined,
    } as Parameters<typeof runPipeline>[0])
    // R-20'nin genel hâli: bir çalıştırma parametresi yasayı ezemez.
    expect(gorulen['url']).toBe('SÖZLEŞME')
  })
})

// ── §14 sınırı KENDİ kapısını istiyor (2. doğrulama turu, bulgu 15) ─────────
describe('dış metin sınırının kapısı', () => {
  const hat = [adim('arastir', 'INGEST'), adim('render', 'RENDER', ['arastir'])]
  const fiiller = {
    INGEST: sahte('INGEST', { fetchedAt: '2026-08-14T00:00:00.000Z', sourceRef: 'u', domain: 'x' }),
    RENDER: sahte('RENDER', { slides: ['/tmp/a.png'] }),
  }
  const kararla = (gate: string) =>
    runPipeline({
      repoRoot: tmp.path,
      pipeline: { id: 'p', title: 'p', steps: hat },
      runId: RUN,
      brandId: 'brd_test' as BrandId,
      eraId: 'era_test' as EraId,
      corpusCommit: 'abc1234',
      registryCommit: 'def5678',
      verbs: fiiller,
      pricing: {},
      candidatesFor: () => [],
      env: {},
      caps: { perRun: null, perMonth: null },
      db,
      clock: manualClock(SIMDI),
      rng: seededRng(1),
      sleep: async () => undefined,
      decisions: [{ gate, decision: 'approved', at: SIMDI, note: null }],
    } as Parameters<typeof runPipeline>[0])

  // 🧪 BAŞKA bir kapının onayı sınırı AÇMAMALI. İlk sürüm `decision === 'approved'`
  // diye bakıyordu; hattın sonundaki yayın onayı `ingestGate`i de açıyordu.
  it('yayın onayı dış metin sınırını AÇMIYOR', async () => {
    const r = await kararla('insan-onayi')
    expect(r.stoppedAt).toBe('render')
    expect(r.errors.some((e) => e.error.code === 'UNTRUSTED_INPUT_GATE')).toBe(true)
  })

  it('sınırın KENDİ kapısı onaylandığında geçiyor', async () => {
    const r = await kararla(UNTRUSTED_GATE)
    expect(r.stoppedAt).toBeNull()
    expect(r.errors).toHaveLength(0)
  })
})
