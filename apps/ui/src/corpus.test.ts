import { describe, expect, it } from 'vitest'
import { foldForSearch } from '@suite/contracts/text'
import {
  BOS_FILTRE,
  durumIsareti,
  durumlar,
  eylemler,
  filtrele,
  tipler,
  type KayitSatiri,
} from './corpus.js'

const s = (o: Partial<KayitSatiri> & { id: string }): KayitSatiri => ({
  type: 'fact',
  status: 'active',
  era_id: 'imalat-2026',
  path: `corpus/fact/${o.id}.md`,
  title: o.id,
  visible: true,
  expired_at: null,
  ...o,
})

const SATIRLAR: readonly KayitSatiri[] = [
  s({ id: 'z-aktif', status: 'active' }),
  s({ id: 'a-emekli', status: 'retired', visible: false, expired_at: '2026-01-01' }),
  s({ id: 'm-taslak', status: 'draft', visible: false, type: 'positioning' }),
  s({ id: 'k-sabit', status: 'pinned' }),
  s({ id: 'ölçüm-kaydı', status: 'active', title: 'Ölçüm ve Fire' }),
]

describe('corpus tarayıcısı', () => {
  it('İŞ BEKLEYEN ÜSTTE — alfabetik değil, durum sırasına göre', () => {
    // Alfabetik olsaydı `a-emekli` başa gelirdi ve onay bekleyen taslak ortada kaybolurdu.
    const r = filtrele(SATIRLAR, BOS_FILTRE, foldForSearch)
    expect(r[0]?.status).toBe('draft')
    expect(r[r.length - 1]?.status).toBe('retired')
  })

  it('emekli ve taslak GİZLENMEZ — hepsi listede durur (D-12)', () => {
    const r = filtrele(SATIRLAR, BOS_FILTRE, foldForSearch)
    expect(r).toHaveLength(SATIRLAR.length)
    expect(r.map((x) => x.id)).toContain('a-emekli')
  })

  it('Türkçe arama aksana takılmaz — katlama çağıranın verdiği fonksiyon', () => {
    const r = filtrele(SATIRLAR, { ...BOS_FILTRE, arama: 'olcum' }, foldForSearch)
    expect(r.map((x) => x.id)).toEqual(['ölçüm-kaydı'])
  })

  it('tip ve durum filtresi birlikte çalışır', () => {
    expect(filtrele(SATIRLAR, { ...BOS_FILTRE, tip: 'positioning' }, foldForSearch)).toHaveLength(1)
    expect(filtrele(SATIRLAR, { ...BOS_FILTRE, durum: 'active' }, foldForSearch)).toHaveLength(2)
  })

  it('filtre seçenekleri VERİDEN türetilir — sabit liste bayatlar', () => {
    expect(tipler(SATIRLAR)).toEqual(['fact', 'positioning'])
    expect(durumlar(SATIRLAR)).toEqual(['draft', 'active', 'pinned', 'retired'])
  })

  it('emekli kayıt hiçbir eylemi kabul etmez ve NEDENİ söylenir', () => {
    const e = eylemler(s({ id: 'x', status: 'retired' }))
    expect(e.emekliEdilebilir).toBe(false)
    expect(e.sabitlenebilir).toBe(false)
    expect(e.neden).toContain('R-12')
  })

  it('taslak emekli EDİLEBİLİR ama sabitlenemez', () => {
    const e = eylemler(s({ id: 'x', status: 'draft' }))
    expect(e.emekliEdilebilir).toBe(true)
    expect(e.sabitlenebilir).toBe(false)
  })

  it('"aktif ama görünmez" AYRI bir işaret — sessiz kalmaz', () => {
    // Dönem ya da geçerlilik tarihi dışarıda bırakıyor. Bunu göstermemek,
    // "neden bu kayıt kullanılmıyor" sorusunu cevapsız bırakırdı.
    const i = durumIsareti(s({ id: 'x', status: 'active', visible: false }))
    expect(i.metin).toContain('dönem dışı')
    expect(durumIsareti(s({ id: 'y', status: 'active', visible: true })).metin).toBe('yayında')
  })

  it('her işaret glyph + metin taşır — renk tek başına anlam taşımaz', () => {
    for (const st of ['active', 'draft', 'pinned', 'retired']) {
      const i = durumIsareti(s({ id: 'x', status: st }))
      expect(i.glyph.length).toBeGreaterThan(0)
      expect(i.metin.length).toBeGreaterThan(0)
    }
  })
})
