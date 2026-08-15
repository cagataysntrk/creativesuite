import { describe, expect, it } from 'vitest'
import type { ToleranceReading, ToleranceStatus } from '@suite/contracts'
import { durumIsareti, konumYuzde } from './Tolerans.js'

const okuma = (o: Partial<ToleranceReading>): ToleranceReading => ({
  metric: 'delta_e_2000',
  label: 'ΔE 2000',
  value: 2.4,
  warn: 3,
  limit: 5,
  direction: 'lower',
  unit: '',
  status: 'in',
  ...o,
})

describe('tolerans okuması — imza öğesi (§11.1)', () => {
  it('HER durum glyph + metin + renk taşır — renk tek başına anlam taşımaz', () => {
    for (const s of ['in', 'warn', 'out'] as ToleranceStatus[]) {
      const i = durumIsareti(s)
      expect(i.glyph.length).toBeGreaterThan(0)
      expect(i.metin.length).toBeGreaterThan(0)
      expect(i.token).toContain('var(--role-state-')
    }
  })

  it('üç durum üç FARKLI metin — "uygun/uygun değil" ikilisi sürüklenmeyi göremez', () => {
    const metinler = (['in', 'warn', 'out'] as ToleranceStatus[]).map((s) => durumIsareti(s).metin)
    expect(new Set(metinler).size).toBe(3)
    expect(durumIsareti('warn').metin).toContain('uyarı')
  })

  it('SINIR DIŞI okuma bant İÇİNDE kalır — kenardan taşan işaret "ne kadar" demez', () => {
    // `lower` metrikte tavan limitin %25 ötesi: limit 5 → tavan 6,25.
    // Değer 6 (sınır dışı) → %96, yani bandın içinde ve limitin sağında.
    const tavan = 5 * 1.25
    expect(konumYuzde(6, tavan)).toBeGreaterThan(konumYuzde(5, tavan))
    expect(konumYuzde(6, tavan)).toBeLessThanOrEqual(100)
  })

  it('çok büyük bir sapma bile %100e KIRPILIR — düzen bozulmaz', () => {
    expect(konumYuzde(9999, 6.25)).toBe(100)
    expect(konumYuzde(-5, 6.25)).toBe(0)
  })

  it('uyarı eşiği limitten AYRI konumda — ikisi üst üste binmez', () => {
    const r = okuma({ warn: 3, limit: 5 })
    const tavan = r.limit * 1.25
    expect(konumYuzde(r.warn, tavan)).not.toBe(konumYuzde(r.limit, tavan))
  })

  it('tavan sıfırsa bölme patlamaz — ölçüm ekranı çökmez', () => {
    expect(Number.isFinite(konumYuzde(1, 0))).toBe(true)
  })
})
