import { describe, expect, it } from 'vitest'
import { degradeDefSvg } from './sablon-degrade.js'
import { alanRolleri } from './sablon.js'
import type { SlaytKimligi } from '@suite/kernel'

const k = (index: number, total: number, role: SlaytKimligi['role']): SlaytKimligi => ({
  role,
  index,
  total,
  duzen: 'list',
})

describe('degradeDefSvg', () => {
  it('durakları var() ile rampadan okur — serbest renk yazmaz', () => {
    const svg = degradeDefSvg('x', '--ramp-marka-bakir-500', '--ramp-marka-bakir-600')
    expect(svg).toContain('stop-color="var(--ramp-marka-bakir-500)"')
    expect(svg).toContain('stop-color="var(--ramp-marka-bakir-600)"')
    // Chroma tavanı kurguyla korunuyor: token dışı bir renk buraya YAZILAMAZ.
    expect(svg).not.toMatch(/stop-color="(#|oklch|rgb)/)
  })

  it('açı yönü değiştiriyor — dikey yalnız y, yatay yalnız x', () => {
    expect(degradeDefSvg('x', '--ramp-a', '--ramp-b', 'dikey')).toContain('x2="0" y2="1"')
    expect(degradeDefSvg('x', '--ramp-a', '--ramp-b', 'yatay')).toContain('x2="1" y2="0"')
    expect(degradeDefSvg('x', '--ramp-a', '--ramp-b', 'kosegen')).toContain('x2="1" y2="1"')
  })
})

describe('alan rampası', () => {
  // ⚠ Asıl kusur buradaydı: duraklar `static.ts`te SABİTTİ ve kâğıt alan da amber
  // boyanıyordu. Test rolden TÜREMEYİ zorluyor, üretilen dizgeyi değil.
  it('kâğıt dolgu düz kalır — rampada ikinci kâğıt durağı yok', () => {
    // Kapak ve çift indeksli gövde: dolgu kâğıt.
    expect(alanRolleri(k(0, 5, 'kapak')).karsiAlanRampa).toBeNull()
    expect(alanRolleri(k(2, 5, 'govde')).karsiAlanRampa).toBeNull()
  })

  it('kehribar dolgu iki durak alır ve ikisi de rampa token’ı', () => {
    for (const kim of [k(1, 5, 'govde'), k(4, 5, 'kapanis')]) {
      const cift = alanRolleri(kim).karsiAlanRampa
      expect(cift).not.toBeNull()
      for (const durak of cift ?? []) expect(durak.startsWith('--ramp-')).toBe(true)
    }
  })

  it('duraklar dolgu rengiyle aynı aileden — komşu kararla ayrışamaz', () => {
    const g = alanRolleri(k(1, 5, 'govde'))
    expect(g.karsiAlan).toBe('var(--role-bg)')
    // ⚠ Aksan ailesi amber DEĞİL bakır (D-295): amber markadan gelmiyordu, stok şablon
    // mirasıydı ve token açıklaması bunu zaten yazıyordu.
    expect(g.karsiAlanRampa?.[0]).toContain('bakir')
  })
})
