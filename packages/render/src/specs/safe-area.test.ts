import { describe, expect, it } from 'vitest'
import {
  PLACEMENTS,
  placementById,
  safeAreaMessage,
  safeAreaViolations,
  safeBand,
} from './placements.js'

const reels = placementById('instagram-story-9x16')
const feed = placementById('instagram-feed-4x5')

describe('güvenli alan (§9.1)', () => {
  it('Reels bandı §9.1 ile AYNI sayıyı veriyor: 950×979', () => {
    // Belge ile kod ayrışırsa hangisinin doğru olduğu anlaşılmaz; bu test o ayrışmayı
    // yakalar. %6 yan → 1080−129,6·2 = 950 · %14+%35 → 1920·0,51 = 979.
    expect(reels).not.toBeNull()
    if (reels === null) return
    const b = safeBand(reels)
    expect(b.width).toBe(950)
    expect(b.height).toBe(979)
    expect(b.x).toBe(65)
    expect(b.y).toBe(269)
  })

  it('güvenli alanı olmayan yerleşimde bant TUVALİN TAMAMI', () => {
    expect(feed).not.toBeNull()
    if (feed === null) return
    const b = safeBand(feed)
    expect(b).toEqual({ x: 0, y: 0, width: feed.width, height: feed.height })
  })

  it('`null` ile `{0,0,0}` AYRI: feed chrome YOK, ölçülüp sıfır çıkmadı', () => {
    expect(feed?.safeArea).toBeNull()
    expect(reels?.safeArea).not.toBeNull()
  })

  it('bant içindeki kutu ihlal ÜRETMEZ', () => {
    if (reels === null) return
    const b = safeBand(reels)
    expect(safeAreaViolations(reels, { x: b.x, y: b.y, width: 100, height: 100 })).toHaveLength(0)
  })

  it('üstten taşan başlık PİKSELLE raporlanır — "taşıyor" düzeltilebilir bilgi değil', () => {
    if (reels === null) return
    const v = safeAreaViolations(reels, { x: 65, y: 200, width: 100, height: 100 })
    expect(v).toHaveLength(1)
    expect(v[0]?.edge).toBe('top')
    expect(v[0]?.overflowPx).toBe(69) // 269 − 200
    expect(safeAreaMessage(v[0]!)).toContain('69px')
  })

  it('alttan taşma AYRI kenar olarak raporlanır', () => {
    if (reels === null) return
    // Bant 269..1248. 1200'de başlayan 100px'lik kutu 52px taşar.
    const v = safeAreaViolations(reels, { x: 65, y: 1200, width: 100, height: 100 })
    expect(v.map((x) => x.edge)).toEqual(['bottom'])
    expect(v[0]?.overflowPx).toBe(52)
  })

  it('dört kenardan birden taşan kutu DÖRT ihlal üretir', () => {
    if (reels === null) return
    const v = safeAreaViolations(reels, { x: 0, y: 0, width: 1080, height: 1920 })
    expect(new Set(v.map((x) => x.edge))).toEqual(new Set(['top', 'bottom', 'start', 'end']))
  })

  it('her yerleşim `safeArea` alanını AÇIKÇA taşır — eksik alan sessiz varsayım olurdu', () => {
    for (const p of PLACEMENTS) {
      expect('safeArea' in p).toBe(true)
    }
  })

  it('güvenli alan KENDİ kaynağını taşır — yerleşim ölçüsüyle aynı doküman değil', () => {
    expect(reels?.safeArea?.sourceUrl).not.toBe(reels?.sourceUrl)
    expect(reels?.safeArea?.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
