import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { propose, writeRecord } from '@suite/corpus'
import { hookOnerisi, PENCERE_GUN, pencereDurumu, performansPanosu } from './performans.js'
import type { InsightSatiri } from './insight-ledger.js'
import type { PublishedEntry } from './publish-ledger.js'

const BUGUN = '2026-08-16'

const yayin = (o: Partial<PublishedEntry> = {}): PublishedEntry => ({
  digest: 'sha256:a',
  platform: 'instagram',
  externalId: '179',
  runId: 'run_1',
  publishedAt: '2026-08-01T09:00:00.000Z',
  ...o,
})

const olcum = (gun: string, externalId: string, reach: number): InsightSatiri => ({
  gun,
  platform: 'instagram',
  externalId,
  runId: 'run_1',
  metrikler: { reach },
  fetchedAt: `${gun}T03:00:00.000Z`,
})

describe('pencere durumu', () => {
  it('pencere dolmadıysa OLGUNLAŞMADI der — "kötü" demez', () => {
    const d = pencereDurumu('2026-08-15T09:00:00.000Z', [], BUGUN, 'reach')
    expect(d.kind).toBe('olgunlasmadi')
    expect(d.kind === 'olgunlasmadi' && d.kalanGun).toBe(PENCERE_GUN - 2)
  })

  // **Eksik ölçüm, düşük performans DEĞİLDİR.** Bu ayrım olmazsa geri besleme,
  // ölçemediğimiz içeriği "işe yaramaz" diye corpus'a yazar ve yanlış kalıcılaşır.
  it('pencere günü ölçülmemişse EKSİK ÖLÇÜM der ve sıralamaya girmez', () => {
    const d = pencereDurumu(
      '2026-08-01T09:00:00.000Z',
      [olcum('2026-08-02', '179', 10)],
      BUGUN,
      'reach'
    )
    expect(d.kind).toBe('eksik_olcum')
    expect(d.kind === 'eksik_olcum' && d.eksikGun).toBe('2026-08-07')
  })

  it('metrik yoksa sıfır SAYMAZ, metrik_yok der', () => {
    const o: InsightSatiri = { ...olcum('2026-08-07', '179', 0), metrikler: { likes: 3 } }
    const d = pencereDurumu('2026-08-01T09:00:00.000Z', [o], BUGUN, 'reach')
    expect(d.kind).toBe('metrik_yok')
  })

  it('pencere ölçülmüşse o günün değerini verir', () => {
    const d = pencereDurumu(
      '2026-08-01T09:00:00.000Z',
      [olcum('2026-08-07', '179', 412), olcum('2026-08-14', '179', 900)],
      BUGUN,
      'reach'
    )
    // 14. günün 900'ü ALINMAZ: pencere sabit, yoksa yaşça büyük post kazanır.
    expect(d.kind === 'siralanabilir' && d.deger).toBe(412)
  })
})

describe('performans panosu', () => {
  // 🧪 Asıl tuzak: üç gün ölçülmüş post ile otuz gün ölçülmüş post yan yana KONMAZ.
  it('sıralanamayanları gizlemez, ayrı listeler', () => {
    const p = performansPanosu({
      yayinlar: [
        yayin({ externalId: 'a', publishedAt: '2026-08-01T09:00:00.000Z' }),
        yayin({ externalId: 'b', publishedAt: '2026-08-01T09:00:00.000Z' }),
        yayin({ externalId: 'c', publishedAt: '2026-08-15T09:00:00.000Z' }),
      ],
      olcumler: [olcum('2026-08-07', 'a', 500), olcum('2026-08-02', 'b', 4000)],
      bugun: BUGUN,
      metrik: 'reach',
    })
    expect(p.siralama.map((s) => s.externalId)).toEqual(['a'])
    // `b` 4000 ile en yüksek görünüyor ama penceresi ölçülmemiş — sıralamaya GİREMEZ.
    expect(p.disarida.map((s) => s.externalId).sort()).toEqual(['b', 'c'])
  })

  it('sıralanabilirleri azalan sıralar', () => {
    const p = performansPanosu({
      yayinlar: [yayin({ externalId: 'a' }), yayin({ externalId: 'b' })],
      olcumler: [olcum('2026-08-07', 'a', 100), olcum('2026-08-07', 'b', 900)],
      bugun: BUGUN,
      metrik: 'reach',
    })
    expect(p.siralama.map((s) => s.externalId)).toEqual(['b', 'a'])
  })
})

describe('geri besleme', () => {
  const kazanan = (): ReturnType<typeof performansPanosu>['siralama'][number] =>
    performansPanosu({
      yayinlar: [yayin({ externalId: 'a' })],
      olcumler: [olcum('2026-08-07', 'a', 412)],
      bugun: BUGUN,
      metrik: 'reach',
    }).siralama[0]!

  it('sıralanamayan bir satır için öneri ÜRETMEZ', () => {
    const disarida = performansPanosu({
      yayinlar: [yayin({ externalId: 'c', publishedAt: '2026-08-15T09:00:00.000Z' })],
      olcumler: [],
      bugun: BUGUN,
      metrik: 'reach',
    }).disarida[0]!
    expect(hookOnerisi(disarida, 'metin', 'brd_x', 'era_x')).toBeNull()
  })

  // R-32: önerinin içindeki sayı bir İDDİADIR ve kaynağı ölçümün kendisidir.
  it('öneri claim_source taşır ve pencereyi alıntılar', () => {
    const o = hookOnerisi(kazanan(), 'Ölçümü olmayan verimlilik yoktur.', 'brd_x', 'era_x')!
    const kaynak = o.frontmatter['claim_source'] as { ref: string; quote: string }
    expect(kaynak.ref).toContain('insights.ndjson')
    expect(kaynak.quote).toContain('pencere')
  })

  // 🧪 FAZ-7.9 ihlal testi: geri besleme doğrudan `active` yazmayı DENEYEMEZ.
  // Öneri `status` taşımıyor; `propose()` `draft` basıyor. Elle `active` zorlamak
  // yazma darboğazında reddediliyor (R-14).
  it('öneri status taşımaz ve agent active yazamaz', () => {
    const o = hookOnerisi(kazanan(), 'metin', 'brd_x', 'era_x')!
    expect(o.frontmatter['status']).toBeUndefined()

    const kok = mkdtempSync(join(tmpdir(), 'perf-corpus-'))
    const iyi = propose({
      root: kok,
      entityType: o.entityType,
      slug: o.slug,
      frontmatter: o.frontmatter,
      body: o.body,
    })
    expect(iyi.ok).toBe(true)
    expect(iyi.ok && readFileSync(iyi.path, 'utf8')).toContain('status: draft')

    const kotu = writeRecord({
      root: kok,
      entityType: o.entityType,
      slug: 'zorla-aktif',
      frontmatter: { ...o.frontmatter, status: 'active' },
      body: o.body,
      actor: 'agent',
    })
    expect(kotu.ok).toBe(false)
    expect(!kotu.ok && kotu.refusal.kind).toBe('agent_must_propose')
  })
})
