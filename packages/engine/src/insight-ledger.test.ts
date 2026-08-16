import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  appendInsight,
  bosluklar,
  insightLedgerPath,
  insightTazeligi,
  readInsights,
  type InsightSatiri,
} from './insight-ledger.js'

const kok = (): string => mkdtempSync(join(tmpdir(), 'insight-'))

const satir = (o: Partial<InsightSatiri> = {}): InsightSatiri => ({
  gun: '2026-08-15',
  platform: 'instagram',
  externalId: '17900000000000000',
  runId: 'run_1',
  metrikler: { reach: 412, likes: 19 },
  fetchedAt: '2026-08-16T03:00:00.000Z',
  ...o,
})

describe('insight defteri', () => {
  it('yazar ve okur', () => {
    const r = kok()
    expect(appendInsight(r, satir()).kind).toBe('yazildi')
    const okundu = readInsights(r)
    expect(okundu.ok).toBe(true)
    expect(okundu.ok && okundu.satirlar[0]!.metrikler['reach']).toBe(412)
  })

  // Günlük iş günde birden fazla koşabilir; ikinci koşu ikinci satır YAZMAMALI.
  it('aynı gün + aynı varlık ikinci kez YAZILMAZ', () => {
    const r = kok()
    appendInsight(r, satir())
    expect(appendInsight(r, satir({ metrikler: { reach: 999 } })).kind).toBe('zaten_var')
    const ham = readFileSync(join(r, insightLedgerPath()), 'utf8').trim().split('\n')
    expect(ham).toHaveLength(1)
    // İlk ölçüm KORUNUR: append-only bir defterde üzerine yazmak, düzeltmektir.
    expect(ham[0]).toContain('412')
  })

  it('farklı gün ayrı satırdır', () => {
    const r = kok()
    appendInsight(r, satir())
    expect(appendInsight(r, satir({ gun: '2026-08-16' })).kind).toBe('yazildi')
    const okundu = readInsights(r)
    expect(okundu.ok && okundu.satirlar).toHaveLength(2)
  })

  // 🧪 Defter YOK ile defter BOŞ farklı sonuçlardır.
  it('defter yoksa ledger_missing döner — "ölçüm yok" değil', () => {
    const s = readInsights(kok())
    expect(s.ok).toBe(false)
    expect(!s.ok && s.error.kind).toBe('ledger_missing')
  })

  // 🧪 Bozuk satır atlanırsa o gün BOŞLUK sayılır ve olmayan bir kayıp raporlanır.
  it('bozuk satır sessizce atlanmaz ve üstüne YAZILMAZ', () => {
    const r = kok()
    const yol = join(r, insightLedgerPath())
    mkdirSync(dirname(yol), { recursive: true })
    writeFileSync(yol, '{bozuk\n')
    const s = readInsights(r)
    expect(!s.ok && s.error.kind).toBe('unreadable')
    expect(appendInsight(r, satir()).kind).toBe('okunamadi')
  })
})

describe('boşluk tespiti', () => {
  it('eksik günleri listeler, bugünü saymaz', () => {
    const b = bosluklar(['2026-08-13', '2026-08-15'], '2026-08-13', '2026-08-16')
    expect(b.map((x) => x.gun)).toEqual(['2026-08-14'])
  })

  // **90 günü geçen boşluk KURTARILAMAZ.** Bunu bilmemek, panonun o dönemi
  // "düşük performans" diye okuması demektir.
  it('ufkun ötesindeki boşluğu kalıcı kayıp olarak işaretler', () => {
    const b = bosluklar([], '2026-01-01', '2026-08-16')
    expect(b.find((x) => x.gun === '2026-01-02')?.kurtarilabilir).toBe(false)
    expect(b.find((x) => x.gun === '2026-08-10')?.kurtarilabilir).toBe(true)
  })

  it('yayından önceki günler boşluk değildir', () => {
    expect(bosluklar([], '2026-08-16', '2026-08-15')).toHaveLength(0)
  })
})

describe('insight tazeliği', () => {
  it('hiç ölçüm yoksa KRİTİK ve bunu "0 gün" diye göstermez', () => {
    const t = insightTazeligi([], '2026-08-16')
    expect(t.kritik).toBe(true)
    expect(t.gecenGun).toBeNull()
    expect(t.mesaj).toContain('backfill')
  })

  it('bir gün gecikme sessiz, iki gün gecikme kritiktir', () => {
    expect(insightTazeligi(['2026-08-15'], '2026-08-16').kritik).toBe(false)
    const gec = insightTazeligi(['2026-08-13'], '2026-08-16')
    expect(gec.kritik).toBe(true)
    expect(gec.gecenGun).toBe(3)
    expect(gec.mesaj).toContain('KALICI')
  })
})
