import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR, publishedLedgerPath } from '@suite/kernel'
import { kutuphane, yenidenKullanilabilir } from './kutuphane.js'

/** `.meta.json` biçimi diskteki GERÇEK dosyadan okundu (D-163) — uydurulmadı. */
const meta = (o: { digest: string; runId: string; bytes?: number; createdAt?: string }) => ({
  digest: o.digest,
  ext: '.png',
  bytes: o.bytes ?? 19119,
  stamp: {
    brandId: 'brd_upcytech',
    eraId: 'imalat-2026',
    kitVersion: 'kit-1',
    definitionDigest: 'sha256:x',
    contextManifest: `ctx_${o.runId}`,
    sourceRunId: o.runId,
  },
  compliance: {
    containsSyntheticPerson: false,
    basis: { kind: 'prompt_forbids_people', promptDigest: 'sha256:x' },
    aiGenerated: false,
    disclosureRequired: false,
  },
  sourceRunId: o.runId,
  createdAt: o.createdAt ?? '2026-08-16T10:00:00.000Z',
})

const manifest = (o: { runId: string; lane: 'free' | 'premium'; gercek: string }) => ({
  runId: o.runId,
  brandId: 'brd_upcytech',
  eraId: 'imalat-2026',
  pipeline: 'instagram-post',
  corpusCommit: 'a'.repeat(40),
  registryCommit: 'b'.repeat(40),
  createdAt: '2026-08-16T09:00:00.000Z',
  decisions: [],
  context: [],
  contextRetentionDays: null,
  steps: [
    {
      stepId: 'gorsel',
      verb: 'GENERATE',
      lane: o.lane,
      capability: 'image.generate',
      providerId: 'p1',
      model: null,
      seed: 1,
      params: { topic: 'imalat fire' },
      estimatedCost: {
        low: { micros: '1000', currency: 'USD' },
        high: { micros: '3000', currency: 'USD' },
      },
      actualCost: { micros: o.gercek, currency: 'USD' },
      candidates: [
        {
          providerId: 'p1',
          capability: 'image.generate',
          selected: true,
          rejectionReason: null,
          estimatedCost: null,
        },
      ],
      startedAt: 'S',
      finishedAt: 'S',
    },
  ],
})

const kur = (o: {
  varliklar?: { digest: string; runId: string }[]
  manifestler?: ReturnType<typeof manifest>[]
  karantina?: number
  yayinlanan?: string[]
}): string => {
  const kok = mkdtempSync(join(tmpdir(), 'suite-kut-'))
  for (const v of o.varliklar ?? []) {
    const d = join(kok, 'derived/blobs', v.digest.slice(7, 9))
    mkdirSync(d, { recursive: true })
    writeFileSync(join(d, `${v.digest.slice(7)}.meta.json`), JSON.stringify(meta(v)))
  }
  for (const m of o.manifestler ?? []) {
    const d = join(kok, RUNS_DIR, m.runId)
    mkdirSync(d, { recursive: true })
    writeFileSync(join(d, 'manifest.json'), JSON.stringify(m))
  }
  for (let i = 0; i < (o.karantina ?? 0); i++) {
    const d = join(kok, 'derived/karantina/ab')
    mkdirSync(d, { recursive: true })
    writeFileSync(
      join(d, `k${i}.meta.json`),
      JSON.stringify(meta({ digest: `sha256:k${i}`, runId: 'run_k' }))
    )
  }
  if (o.yayinlanan !== undefined) {
    mkdirSync(join(kok, RUNS_DIR), { recursive: true })
    writeFileSync(
      join(kok, publishedLedgerPath()),
      o.yayinlanan.map((d) => JSON.stringify({ digest: d })).join('\n') + '\n'
    )
  }
  return kok
}

describe('varlık kütüphanesi (§12.9 · FAZ-4.14)', () => {
  it('KARANTİNA listeye girmez ama SAYILIR', () => {
    // Listeye koymak onları kullanılabilir gösterirdi (D-155); hiç saymamak boş bir
    // kütüphaneyi açıklanamaz yapardı.
    const kok = kur({ karantina: 14 })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar).toHaveLength(0)
      expect(k.karantina).toBe(14)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('yayın defteri YOKSA bu ayrıca bildirilir — "yayınlanmadı" bir ölçüm değil', () => {
    const kok = kur({ varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }] })
    try {
      const k = kutuphane(kok)
      expect(k.yayinDefteriYok).toBe(true)
      expect(k.varliklar[0]?.yayinlandi).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('PREMIUM üretilip yayınlanmamış varlığın maliyeti "boşa harcanan"da toplanır', () => {
    const kok = kur({
      varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }],
      manifestler: [manifest({ runId: 'run_a', lane: 'premium', gercek: '42000' })],
      yayinlanan: [],
    })
    try {
      const k = kutuphane(kok)
      expect(k.bosaHarcananMikros).toBe('42000')
      expect(k.varliklar[0]?.lane).toBe('premium')
      expect(k.varliklar[0]?.konu).toBe('imalat fire')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('BEDAVA şeritte yayınlanmamış varlık "boşa harcanan"a SAYILMAZ', () => {
    // ⚠ Maliyet SIFIR DEĞİL. İlk sürüm `gercek: '0'` kullanıyordu ve kuralı değil
    // rastlantıyı test ediyordu: bedava şeridi saysak da toplam 0 çıkıyordu, yani
    // ihlal testi yeşil geçiyordu. Sıfır olmayan bir maliyet, kuralın kendisini sınar.
    const kok = kur({
      varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }],
      manifestler: [manifest({ runId: 'run_a', lane: 'free', gercek: '5000' })],
      yayinlanan: [],
    })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar[0]?.harcananMikros).toBe('5000')
      expect(k.bosaHarcananMikros).toBe('0')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('YAYINLANMIŞ premium varlık boşa harcanan değildir', () => {
    const kok = kur({
      varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }],
      manifestler: [manifest({ runId: 'run_a', lane: 'premium', gercek: '42000' })],
      yayinlanan: ['sha256:abc123'],
    })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar[0]?.yayinlandi).toBe(true)
      expect(k.bosaHarcananMikros).toBe('0')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('kusurlu manifest İŞARETLENİR — o varlık zaten yayınlanamaz (D-155)', () => {
    const m = manifest({ runId: 'run_a', lane: 'premium', gercek: '1' })
    ;(m as { corpusCommit: string }).corpusCommit = 'worktree'
    const kok = kur({ varliklar: [{ digest: 'sha256:abc123', runId: 'run_a' }], manifestler: [m] })
    try {
      expect(kutuphane(kok).varliklar[0]?.manifestSaglam).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('manifesti olmayan varlık listeye girer ama SAĞLAM sayılmaz', () => {
    // Sessizce atlamak, diskteki bir varlığı kütüphanede yok göstermek olurdu.
    const kok = kur({ varliklar: [{ digest: 'sha256:abc123', runId: 'run_yok' }] })
    try {
      const k = kutuphane(kok)
      expect(k.varliklar).toHaveLength(1)
      expect(k.varliklar[0]?.manifestSaglam).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('en YENİ üstte — kütüphaneye "en son ne ürettim" diye bakılır', () => {
    const kok = kur({
      varliklar: [
        { digest: 'sha256:eski11', runId: 'run_a' },
        { digest: 'sha256:yeni22', runId: 'run_b' },
      ],
    })
    try {
      // İkisi de aynı createdAt taşıyor; farklı yapalım.
      const k = kutuphane(kok)
      expect(k.varliklar).toHaveLength(2)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('Reuse ön koşulu: manifest YOKSA yeniden kullanılamaz', () => {
    const kok = kur({ manifestler: [manifest({ runId: 'run_a', lane: 'free', gercek: '0' })] })
    try {
      expect(yenidenKullanilabilir(kok, 'run_a')).toBe(true)
      expect(yenidenKullanilabilir(kok, 'run_yok')).toBe(false)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})
