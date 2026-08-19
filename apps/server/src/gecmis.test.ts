import { describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR, frozenPlanPath, manifestPath } from '@suite/kernel'
import type { StaleCheck } from '@suite/engine'
import {
  belirsizAdimlar,
  calistirmaDetayi,
  calistirmalar,
  elemeKaydi,
  elemeyiGeriAl,
  kosuyuEle,
} from './gecmis.js'

// ⚠ Fikstürlerin biçimi diskteki GERÇEK dosyalardan okundu (D-174): `Money` kablo
// biçimi `{ micros: <ondalık dize>, currency }`, `bigint` değil.

const adim = (o: {
  stepId: string
  verb: string
  seed?: number | null
  gercek?: string | null
  tahminUst?: string
}) => ({
  stepId: o.stepId,
  verb: o.verb,
  lane: 'premium' as const,
  capability: o.verb === 'GENERATE' ? 'image.generate' : null,
  providerId: o.verb === 'GENERATE' ? 'p1' : null,
  model: null,
  seed: o.seed === undefined ? 7 : o.seed,
  params: {},
  estimatedCost: {
    low: { micros: '1000', currency: 'USD' },
    high: { micros: o.tahminUst ?? '4000', currency: 'USD' },
  },
  actualCost:
    o.gercek === undefined
      ? { micros: '3000', currency: 'USD' }
      : o.gercek === null
        ? null
        : { micros: o.gercek, currency: 'USD' },
  candidates:
    o.verb === 'GENERATE'
      ? [
          {
            providerId: 'p1',
            capability: 'image.generate',
            selected: true,
            rejectionReason: null,
            estimatedCost: null,
          },
          {
            providerId: 'p2',
            capability: 'image.generate',
            selected: false,
            rejectionReason: 'tavanı aşıyor',
            estimatedCost: null,
          },
        ]
      : [],
  startedAt: '2026-08-16T09:00:00.000Z',
  finishedAt: '2026-08-16T09:00:02.500Z',
})

const manifest = (o: {
  runId: string
  adimlar?: ReturnType<typeof adim>[]
  corpusCommit?: string
  createdAt?: string
}) => ({
  runId: o.runId,
  brandId: 'brd_upcytech',
  eraId: 'imalat-2026',
  pipeline: 'instagram-post',
  corpusCommit: o.corpusCommit ?? 'a'.repeat(40),
  registryCommit: 'b'.repeat(40),
  createdAt: o.createdAt ?? '2026-08-16T09:00:00.000Z',
  decisions: [{ gate: 'onay', decision: 'approved', at: 'T', note: null }],
  context: [
    { recordId: 'rec_a', section: 'konumlandirma', tokens: 120, reason: 'pinned' },
    { recordId: 'rec_b', section: 'konumlandirma', tokens: 80, reason: 'skor' },
  ],
  contextRetentionDays: null,
  steps: o.adimlar ?? [adim({ stepId: 'gorsel', verb: 'GENERATE' })],
})

const donmusPlan = (o: { runId: string; corpusCommit?: string; providerId?: string }) => ({
  runId: o.runId,
  pipeline: 'instagram-post',
  brandId: 'brd_upcytech',
  eraId: 'imalat-2026',
  corpusCommit: o.corpusCommit ?? 'a'.repeat(40),
  registryCommit: 'b'.repeat(40),
  frozenAt: '2026-08-16T08:59:00.000Z',
  order: ['gorsel'],
  steps: [
    {
      stepId: 'gorsel',
      verb: 'GENERATE',
      capability: 'image.generate',
      metered: true,
      providerId: o.providerId ?? 'p1',
      descriptorDigest: 'd1234',
      confidence: 'green',
      params: {},
      seed: 7,
      estimatedCost: {
        low: { micros: '1000', currency: 'USD' },
        high: { micros: '4000', currency: 'USD' },
      },
    },
  ],
  recordIds: ['rec_a', 'rec_b'],
  totalLow: { micros: '1000', currency: 'USD' },
  totalHigh: { micros: '4000', currency: 'USD' },
  digest: 'sha256:plan',
})

const kur = (o: {
  manifestler: ReturnType<typeof manifest>[]
  planlar?: ReturnType<typeof donmusPlan>[]
}): string => {
  const kok = mkdtempSync(join(tmpdir(), 'suite-gec-'))
  for (const m of o.manifestler) {
    mkdirSync(join(kok, RUNS_DIR, m.runId), { recursive: true })
    writeFileSync(join(kok, manifestPath(m.runId)), JSON.stringify(m))
  }
  for (const p of o.planlar ?? []) {
    mkdirSync(join(kok, RUNS_DIR, p.runId), { recursive: true })
    writeFileSync(join(kok, frozenPlanPath(p.runId)), JSON.stringify(p))
  }
  return kok
}

/** Bugünün dünyası — donmuş planla AYNI: sapma çıkmamalı. */
const ayniDunya: StaleCheck = {
  corpusCommit: 'a'.repeat(40),
  registryCommit: 'b'.repeat(40),
  descriptorDigests: { p1: 'd1234' },
  availableProviders: new Set(['p1']),
}

describe('çalıştırma geçmişi', () => {
  it('en yeni üstte listeler ve donmuş planın varlığını bildirir', () => {
    const kok = kur({
      manifestler: [
        manifest({ runId: 'run_eski', createdAt: '2026-08-14T09:00:00.000Z' }),
        manifest({ runId: 'run_yeni', createdAt: '2026-08-16T09:00:00.000Z' }),
      ],
      planlar: [donmusPlan({ runId: 'run_yeni' })],
    })
    const l = calistirmalar(kok)
    expect(l.map((r) => r.runId)).toEqual(['run_yeni', 'run_eski'])
    expect(l[0]?.donmusPlanVar).toBe(true)
    expect(l[1]?.donmusPlanVar).toBe(false)
  })

  it('zaman çizgisi adım başına şerit, model, seed, süre ve KAYBEDEN adayları taşır', () => {
    const kok = kur({
      manifestler: [manifest({ runId: 'run_a' })],
      planlar: [donmusPlan({ runId: 'run_a' })],
    })
    const d = calistirmaDetayi(kok, 'run_a', ayniDunya)
    expect(d).not.toBeNull()
    const a = d?.adimlar[0]
    expect(a?.lane).toBe('premium')
    expect(a?.seed).toBe(7)
    expect(a?.sureMs).toBe(2500)
    expect(a?.adaylar.filter((k) => !k.selected).map((k) => k.rejectionReason)).toEqual([
      'tavanı aşıyor',
    ])
    expect(d?.baglam).toEqual([
      {
        section: 'konumlandirma',
        tokens: 200,
        kayitlar: [
          { recordId: 'rec_a', reason: 'pinned' },
          { recordId: 'rec_b', reason: 'skor' },
        ],
      },
    ])
    expect(d?.donmusKayitlar).toEqual(['rec_a', 'rec_b'])
  })

  // 🧪 İHLAL TESTİ 1 — donmuş plan YOKSA rerun mümkün olmamalı.
  // Fikstür seçimi (D-181): iki çalıştırma, biri planlı biri plansız. Kural kaldırılırsa
  // ikisi de `mumkun: true` olur ve test kırılır; tek çalıştırmayla test süs olurdu.
  it('donmuş plan diskte yoksa rerun MÜMKÜN DEĞİLDİR ve gerekçesi yazılır', () => {
    const kok = kur({
      manifestler: [manifest({ runId: 'run_plansiz' }), manifest({ runId: 'run_planli' })],
      planlar: [donmusPlan({ runId: 'run_planli' })],
    })

    const plansiz = calistirmaDetayi(kok, 'run_plansiz', ayniDunya)
    expect(plansiz?.tekrar.rerun.mumkun).toBe(false)
    expect(plansiz?.tekrar.rerun.neden).toContain('donmuş plan diskte yok')
    // Replay her hâlükârda mümkün: bugünün tanımı her zaman var.
    expect(plansiz?.tekrar.replay.mumkun).toBe(true)
    // Ve sapma ÖLÇÜLEMEZ — "fark yok" DEĞİL (D-175).
    expect(plansiz?.tekrar.sapmaOlculdu).toBe(false)

    const planli = calistirmaDetayi(kok, 'run_planli', ayniDunya)
    expect(planli?.tekrar.rerun.mumkun).toBe(true)
    expect(planli?.tekrar.rerun.neden).toBeNull()
    expect(planli?.tekrar.sapmaOlculdu).toBe(true)
  })

  // 🧪 İHLAL TESTİ 2 — dünya kaydıysa sapma AÇIKÇA gösterilmeli (adım ✅ kriteri).
  it('corpus commit’i kaydıysa rerun ile replay farkı listelenir', () => {
    const kok = kur({
      manifestler: [manifest({ runId: 'run_a' })],
      planlar: [donmusPlan({ runId: 'run_a', corpusCommit: 'c'.repeat(40) })],
    })
    const d = calistirmaDetayi(kok, 'run_a', ayniDunya)
    expect(d?.tekrar.sapmaOlculdu).toBe(true)
    expect(d?.tekrar.sapmalar.join(' ')).toContain("corpus commit'i değişti")

    // Dünya donmuş planla aynı olduğunda liste BOŞ — yani mesaj sabit değil, ölçüm.
    const kok2 = kur({
      manifestler: [manifest({ runId: 'run_b' })],
      planlar: [donmusPlan({ runId: 'run_b' })],
    })
    expect(calistirmaDetayi(kok2, 'run_b', ayniDunya)?.tekrar.sapmalar).toEqual([])
  })

  // 🧪 İHLAL TESTİ 3 — "rerun kararı tekrarlar, eseri değil" ÖLÇÜLMÜŞ olmalı.
  // Fikstür: bir GENERATE (dış dünya) + bir COMPOSE (saf). Kural kaldırılırsa liste
  // ya boşalır ya ikisini birden içerir; her iki durumda test kırılır.
  it('dış dünyaya bağlı adımları seed durumuyla ayırır, saf adımı listelemez', () => {
    const m = manifest({
      runId: 'run_a',
      adimlar: [
        adim({ stepId: 'metin', verb: 'COMPOSE', seed: null, gercek: null }),
        adim({ stepId: 'gorsel', verb: 'GENERATE', seed: null }),
        adim({ stepId: 'gorsel2', verb: 'GENERATE', seed: 42 }),
      ],
    })
    const b = belirsizAdimlar(m as never)
    expect(b.map((x) => x.stepId)).toEqual(['gorsel', 'gorsel2'])
    expect(b[0]?.seedli).toBe(false)
    expect(b[0]?.neden).toContain('seed yok')
    expect(b[1]?.seedli).toBe(true)
    expect(b[1]?.neden).toContain('taahhüt etmiyor')

    const kok = kur({ manifestler: [m], planlar: [donmusPlan({ runId: 'run_a' })] })
    expect(calistirmaDetayi(kok, 'run_a', ayniDunya)?.tekrar.uyari).toContain('ESERİ değil')
  })

  it('koşmamış adımın gerçek maliyeti null kalır — “0” demek DEĞİL', () => {
    const kok = kur({
      manifestler: [
        manifest({
          runId: 'run_a',
          adimlar: [adim({ stepId: 'metin', verb: 'COMPOSE', gercek: null })],
        }),
      ],
    })
    expect(calistirmaDetayi(kok, 'run_a', null)?.adimlar[0]?.gercekMikros).toBeNull()
  })

  it('manifesti olmayan çalıştırma null döner — boş detay uydurulmaz', () => {
    const kok = kur({ manifestler: [] })
    expect(calistirmaDetayi(kok, 'run_yok', null)).toBeNull()
  })
})

// ── eleme: SİLMEK yok, ELEMEK var (Yasa 11 · R-52) ─────────────────────────
//
// ⚠ ⚠ Depo sahibi *"beğenmediklerimi silebilmem lazım"* dedi ve istek meşru: beğenilmeyen
// çıktının listeyi doldurması bir maliyet. Ama koşu defteri türetilemez ve silinmez —
// maliyet ve sağlayıcı geçmişi başka hiçbir yerde yazmıyor. Eleme ikisini uzlaştırıyor.
describe('koşu eleme', () => {
  const kur = (): string => {
    const kok = mkdtempSync(join(tmpdir(), 'suite-eleme-'))
    mkdirSync(join(kok, RUNS_DIR, 'run_x'), { recursive: true })
    return kok
  }

  it('gerekçesiz eleme REDDEDİLİYOR', () => {
    const kok = kur()
    try {
      const r = kosuyuEle(kok, 'run_x', '   ', '2026-08-19T10:00:00.000Z')
      expect(r.ok).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('eleme kaydı yazılıyor, defter dosyaları DURUYOR', () => {
    const kok = kur()
    writeFileSync(join(kok, RUNS_DIR, 'run_x', 'manifest.json'), '{}')
    try {
      expect(kosuyuEle(kok, 'run_x', 'beğenmedim', '2026-08-19T10:00:00.000Z').ok).toBe(true)
      expect(elemeKaydi(kok, 'run_x')?.sebep).toBe('beğenmedim')
      // ⚠ Asıl ölçüm bu: defter YERİNDE. Eleme bir görünürlük kararı, bir silme değil.
      expect(existsSync(join(kok, RUNS_DIR, 'run_x', 'manifest.json'))).toBe(true)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('eleme GERİ ALINABİLİR — karar değişir, kayıt kalır', () => {
    const kok = kur()
    try {
      kosuyuEle(kok, 'run_x', 'beğenmedim', '2026-08-19T10:00:00.000Z')
      expect(elemeyiGeriAl(kok, 'run_x').ok).toBe(true)
      expect(elemeKaydi(kok, 'run_x')).toBeNull()
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})
