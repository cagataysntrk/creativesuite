import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'
import { kurSunucu } from './sunucu.js'
import { makineDurumu } from './durum.js'

const SORGU = { brandId: 'brd_test', eraId: 'era_test', asOf: '2026-08-15T00:00:00.000Z' } as const

const manifest = (o: {
  runId: string
  biten: boolean
  gercekMikros?: string
}): Record<string, unknown> => ({
  runId: o.runId,
  brandId: 'brd_test',
  eraId: 'era_test',
  pipeline: 'instagram-post',
  corpusCommit: 'a'.repeat(40),
  registryCommit: 'b'.repeat(40),
  createdAt: '2026-08-15T10:00:00.000Z',
  decisions: [],
  context: [],
  contextRetentionDays: null,
  steps: [
    {
      stepId: 'bilgi-sec',
      verb: 'SELECT',
      lane: 'free',
      capability: null,
      providerId: null,
      model: null,
      seed: null,
      params: {},
      estimatedCost: {
        low: { micros: '0', currency: 'USD' },
        high: { micros: '0', currency: 'USD' },
      },
      actualCost: null,
      candidates: [],
      startedAt: '2026-08-15T10:00:01.000Z',
      finishedAt: '2026-08-15T10:00:02.000Z',
    },
    {
      stepId: 'gorsel',
      verb: 'GENERATE',
      lane: 'free',
      capability: 'image.generate',
      providerId: 'cloudflare',
      model: 'flux-schnell',
      seed: 7,
      params: {},
      estimatedCost: {
        low: { micros: '1000', currency: 'USD' },
        high: { micros: '3000', currency: 'USD' },
      },
      // ⚠ Kablo biçimi UYDURULMAZ, `writeManifest`ten okunur: `{micros: <ondalık dize>}`.
      // İlk sürüm `{micros: {__bigint: '…'}}` varsayıyordu ve testler geçiyordu —
      // fikstür de aynı uydurmayı kullandığı için test kendi varsayımını doğruluyordu
      // (D-163). Gerçek manifest'e karşı koşan ilk istek sıfır dizisi döndürdü.
      actualCost: o.gercekMikros === undefined ? null : { micros: o.gercekMikros, currency: 'USD' },
      candidates: [{ providerId: 'cloudflare', outcome: 'won', reason: null }],
      startedAt: '2026-08-15T10:00:02.000Z',
      finishedAt: o.biten ? '2026-08-15T10:00:40.000Z' : null,
    },
  ],
})

const kurRepo = (manifestler: readonly Record<string, unknown>[]): string => {
  const kok = mkdtempSync(join(tmpdir(), 'suite-sunucu-'))
  for (const m of manifestler) {
    const d = join(kok, RUNS_DIR, String(m['runId']))
    mkdirSync(d, { recursive: true })
    writeFileSync(join(d, 'manifest.json'), JSON.stringify(m, null, 2))
  }
  return kok
}

describe('makine durumu', () => {
  it('biten çalıştırma AKTİF değildir — bitmiş iş şeritte durmaz', () => {
    const kok = kurRepo([manifest({ runId: 'run_01', biten: true, gercekMikros: '2500' })])
    try {
      const d = makineDurumu({ repoRoot: kok, db: null, query: SORGU, simdi: 'S' })
      expect(d.aktif).toBeNull()
      expect(d.maliyetMikros).toBe('2500')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('başlamış ama bitmemiş adım çalıştırmayı AKTİF yapar ve kaçıncı adımı söyler', () => {
    const kok = kurRepo([manifest({ runId: 'run_02', biten: false })])
    try {
      const d = makineDurumu({ repoRoot: kok, db: null, query: SORGU, simdi: 'S' })
      expect(d.aktif?.runId).toBe('run_02')
      // İstasyon zinciri: bir adım bitti, ikincisi koşuyor.
      expect(d.aktif?.adim).toBe(2)
      expect(d.aktif?.toplamAdim).toBe(2)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('maliyet bigint olarak toplanır — 2^53 üstünde bile kayıpsız', () => {
    // Number olsaydı bu iki sayının toplamı sessizce yuvarlanırdı (R-41).
    const buyuk = '9007199254740993' // 2^53 + 1
    const kok = kurRepo([
      manifest({ runId: 'run_03', biten: true, gercekMikros: buyuk }),
      manifest({ runId: 'run_04', biten: true, gercekMikros: '1' }),
    ])
    try {
      const d = makineDurumu({ repoRoot: kok, db: null, query: SORGU, simdi: 'S' })
      expect(d.maliyetMikros).toBe('9007199254740994')
      expect(Number(buyuk) + 1).not.toBe(9007199254740994) // yuvarlama gerçek
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('ölçülemeyen alan SIFIR değil: kota null, indekssiz bekleyen onay -1', () => {
    const kok = kurRepo([])
    try {
      const d = makineDurumu({ repoRoot: kok, db: null, query: SORGU, simdi: 'S' })
      expect(d.kota).toBeNull()
      // 0 olsaydı "bekleyen yok" ile "sayamadım" aynı şeye çevrilirdi.
      expect(d.bekleyenOnay).toBe(-1)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('kusurlu manifest SAYILIR — yayınlanamaz iş görünmez olmaz', () => {
    const bozuk = manifest({ runId: 'run_05', biten: true, gercekMikros: '100' })
    bozuk['corpusCommit'] = 'worktree' // D-155: SHA değil
    const kok = kurRepo([bozuk])
    try {
      const d = makineDurumu({ repoRoot: kok, db: null, query: SORGU, simdi: 'S' })
      expect(d.kusurluCalistirma).toBe(1)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})

describe('HTTP uçları', () => {
  it('/api/durum diskteki gerçeği döner', async () => {
    const kok = kurRepo([manifest({ runId: 'run_06', biten: false })])
    const s = kurSunucu({
      repoRoot: kok,
      query: SORGU,
      kalpAtisiMs: 50,
      debounceMs: 10,
      simdi: () => 'S',
    })
    try {
      const r = await s.app.request('/api/durum')
      expect(r.status).toBe(200)
      const j = (await r.json()) as { aktif: { runId: string } | null }
      expect(j.aktif?.runId).toBe('run_06')
    } finally {
      s.kapat()
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('/api/saglik izlenen dizinleri BİLDİRİR — sessizce "izliyorum" demez', async () => {
    const kok = kurRepo([])
    mkdirSync(join(kok, 'registry'), { recursive: true })
    mkdirSync(join(kok, RUNS_DIR), { recursive: true })
    const s = kurSunucu({
      repoRoot: kok,
      query: SORGU,
      kalpAtisiMs: 50,
      debounceMs: 10,
      simdi: () => 'S',
    })
    try {
      const j = (await (await s.app.request('/api/saglik')).json()) as { izlenen: string[] }
      // `derived/runs` var, `registry` var, `corpus` YOK → listede olmamalı.
      expect(j.izlenen).toContain('registry')
      expect(j.izlenen).toContain(RUNS_DIR)
      expect(j.izlenen).not.toContain('corpus')
    } finally {
      s.kapat()
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('SSE ilk durumu ANINDA yollar ve nabız VERİ TAŞIMAZ', async () => {
    const kok = kurRepo([manifest({ runId: 'run_07', biten: true, gercekMikros: '42' })])
    const s = kurSunucu({
      repoRoot: kok,
      query: SORGU,
      kalpAtisiMs: 20,
      debounceMs: 5,
      simdi: () => 'S',
    })
    try {
      const r = await s.app.request('/api/olay')
      const okuyucu = r.body?.getReader()
      expect(okuyucu).toBeDefined()
      if (okuyucu === undefined) return

      const cozucu = new TextDecoder()
      let metin = ''
      // İlk parça: açılışta boş şerit olmasın diye beklemeden gelmeli.
      const ilk = await okuyucu.read()
      metin += cozucu.decode(ilk.value)
      expect(metin).toContain('event: durum')
      expect(metin).toContain('"maliyetMikros":"42"')

      // Sonraki parçalar: değişim yoksa nabız, ve nabız durum verisi taşımamalı.
      const ikinci = await okuyucu.read()
      const nabiz = cozucu.decode(ikinci.value)
      expect(nabiz).toContain('event: nabiz')
      expect(nabiz).not.toContain('maliyetMikros')

      await okuyucu.cancel()
    } finally {
      s.kapat()
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('değişim yayınlanınca SSE yeni durumu yollar', async () => {
    const kok = kurRepo([manifest({ runId: 'run_08', biten: true, gercekMikros: '7' })])
    const s = kurSunucu({
      repoRoot: kok,
      query: SORGU,
      kalpAtisiMs: 20,
      debounceMs: 5,
      simdi: () => 'S',
    })
    try {
      const r = await s.app.request('/api/olay')
      const okuyucu = r.body?.getReader()
      if (okuyucu === undefined) return
      const cozucu = new TextDecoder()
      await okuyucu.read() // ilk durum

      s.yayinla('degisim')
      let gorulen = ''
      for (let i = 0; i < 6 && !gorulen.includes('event: durum'); i++) {
        const p = await okuyucu.read()
        gorulen = cozucu.decode(p.value)
      }
      expect(gorulen).toContain('event: durum')
      await okuyucu.cancel()
    } finally {
      s.kapat()
      rmSync(kok, { recursive: true, force: true })
    }
  })
})

describe('corpus tarayıcısı', () => {
  it('SİLME UCU YOK — hiçbir yol DELETE kabul etmiyor (R-12)', async () => {
    // Bu test bir davranışı değil, bir YOKLUĞU koruyor. `DELETE /api/kayitlar/:id`
    // eklemek R-12'yi bir konvansiyona indirgerdi: kural kodda değil, kimsenin o ucu
    // yazmamış olmasında yaşardı.
    const kok = kurRepo([])
    const s = kurSunucu({
      repoRoot: kok,
      query: SORGU,
      kalpAtisiMs: 50,
      debounceMs: 10,
      simdi: () => 'S',
    })
    try {
      for (const yol of [
        '/api/kayitlar',
        '/api/kayitlar/fact',
        '/api/kayitlar/fact/x',
        '/api/kayitlar/fact/x/emekli',
      ]) {
        const r = await s.app.request(yol, { method: 'DELETE' })
        expect(r.status).not.toBe(200)
        expect(r.status).not.toBe(204)
      }
    } finally {
      s.kapat()
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('indeks yoksa BOŞ LİSTE değil 503 — "corpus boş" ile "indeks yok" ayrı', async () => {
    const kok = kurRepo([])
    const s = kurSunucu({
      repoRoot: kok,
      query: SORGU,
      kalpAtisiMs: 50,
      debounceMs: 10,
      simdi: () => 'S',
    })
    try {
      const r = await s.app.request('/api/kayitlar')
      expect(r.status).toBe(503)
      const j = (await r.json()) as { hata: string }
      expect(j.hata).toContain('reindex')
    } finally {
      s.kapat()
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('emeklilik ucu olmayan kayıtta 409 döner — sessizce başarılı olmaz', async () => {
    const kok = kurRepo([])
    const s = kurSunucu({
      repoRoot: kok,
      query: SORGU,
      kalpAtisiMs: 50,
      debounceMs: 10,
      simdi: () => 'S',
    })
    try {
      const r = await s.app.request('/api/kayitlar/fact/yok/emekli', {
        method: 'POST',
        body: '{}',
        headers: { 'content-type': 'application/json' },
      })
      expect(r.status).toBe(409)
      const j = (await r.json()) as { ok: boolean; mesaj: string }
      expect(j.ok).toBe(false)
      expect(j.mesaj).toContain('kayıt yok')
    } finally {
      s.kapat()
      rmSync(kok, { recursive: true, force: true })
    }
  })
})
