// Genişletme ÖLÇÜLÜYOR — plan ile koşu aynı sayıyı görüyor mu (D-240 · FAZ-8.1b).

import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { loadPipeline, type Pipeline } from '@suite/registry'
import { kosumSayilari, varyantlaGenislet, VARYANT_AYRAC } from './varyant-genislet.js'

const KOK = join(import.meta.dirname, '..', '..', '..', 'registry', 'pipelines')
const hat = (id: string): Pipeline => {
  const r = loadPipeline(KOK, id)
  expect(r.ok, JSON.stringify(r.ok ? [] : r.errors)).toBe(true)
  return (r as { ok: true; value: Pipeline }).value
}

describe('reklam hattı yedi varyanta açılıyor', () => {
  const g = varyantlaGenislet(hat('ad-creative-set'))
  const sayac = kosumSayilari(g)

  it('yedi varyant', () => {
    expect(g.varyantSayisi).toBe(7)
  })

  it('paylaşılan önek BİR kez: RESOLVE ve SELECT bağlamı yedi varyant paylaşıyor', () => {
    expect(sayac.get('cozumle')).toBe(1)
    expect(sayac.get('bilgi-sec')).toBe(1)
  })

  it('ücretli adımlar yedişer kez', () => {
    expect(sayac.get('metin-uret')).toBe(7)
    expect(sayac.get('gorsel-uret')).toBe(7)
    expect(sayac.get('render')).toBe(7)
  })

  it('ücretsiz ama ücretliye BAĞLI adımlar da yedişer — yoksa yedi render aynı belgeyi basar', () => {
    expect(sayac.get('kompozit')).toBe(7)
    expect(sayac.get('kalite')).toBe(7)
  })

  it('PROPOSE TEK: yedi varyantlık set tek öneridir', () => {
    expect(sayac.get('onay')).toBe(1)
  })

  it('toplayıcı TÜM varyant yapraklarına bağlı — biri atlanamaz', () => {
    const onay = g.pipeline.steps.find((s) => s.id === 'onay')
    expect(onay?.needs).toHaveLength(7)
    expect(onay?.needs.every((n) => n.startsWith(`kalite${VARYANT_AYRAC}`))).toBe(true)
  })

  it('koordinat KISITLARA giriyor — gövdeler onu buradan okur', () => {
    const ilk = g.pipeline.steps.find((s) => s.id === `metin-uret${VARYANT_AYRAC}1`)
    expect(ilk?.constraints['varyant']).toEqual({
      hook: 'olcum-kaybi',
      copy: 'rakamla',
      visual: 'panel',
    })
  })

  it('her varyantın koordinatı FARKLI ve temelden tek eksende ayrılıyor (OFAT)', () => {
    const koordinatlar = g.pipeline.steps
      .filter((s) => s.id.startsWith(`render${VARYANT_AYRAC}`))
      .map((s) => JSON.stringify(s.constraints['varyant']))
    expect(new Set(koordinatlar).size).toBe(7)
  })

  it('varyant içindeki bağımlılık AYNI varyanta bağlanıyor — çapraz bulaşma yok', () => {
    const k3 = g.pipeline.steps.find((s) => s.id === `kompozit${VARYANT_AYRAC}3`)
    expect(k3?.needs).toEqual([`metin-uret${VARYANT_AYRAC}3`, `gorsel-uret${VARYANT_AYRAC}3`])
  })
})

describe('matrissiz hat DEĞİŞMİYOR', () => {
  it('aynı nesne dönüyor — genişletme çağrılmadı ile boş genişletme karışmasın', () => {
    const p = hat('instagram-post')
    const g = varyantlaGenislet(p)
    expect(g.pipeline).toBe(p)
    expect(g.varyantSayisi).toBe(1)
  })
})
