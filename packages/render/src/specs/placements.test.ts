import { describe, expect, it } from 'vitest'
import {
  PLACEMENTS,
  QUALITY_LADDER,
  climbLadder,
  formatLadder,
  placementById,
  specAgeDays,
  type QualityRung,
} from './placements.js'

describe('platform spec tablosu (§9.1)', () => {
  it('her satır KAYNAK ve TARİH taşıyor', () => {
    // Tarihsiz bir spec, ne zaman doğru olduğunu söylemez. Platform ölçüleri sessizce
    // değişiyor: Meta feed'i 1:1'den 4:5'e taşıdı.
    for (const p of PLACEMENTS) {
      expect(p.sourceUrl, p.id).toMatch(/^https:\/\//)
      expect(p.verifiedAt, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('tolerans platforma göre FARKLI', () => {
    // Tek global tolerans ikisinden birinde yanlış olurdu: "yeterince yakın" bir
    // yeniden boyutlandırma Facebook'tan geçip Instagram'dan reddedilir.
    const ig = placementById('instagram-feed-4x5')
    const li = placementById('linkedin-feed-4x5')
    expect(ig?.aspectTolerancePercent).toBe(1)
    expect(li?.aspectTolerancePercent).toBe(5)
  })

  it('LinkedIn boyut sınırı 5MB, Instagram 8MB', () => {
    expect(placementById('linkedin-feed-4x5')?.maxBytes).toBe(5 * 1024 * 1024)
    expect(placementById('instagram-feed-4x5')?.maxBytes).toBe(8 * 1024 * 1024)
  })

  it('bilinmeyen yerleşim `null` — sessizce varsayılana düşmüyor', () => {
    expect(placementById('tiktok-her-neyse')).toBeNull()
  })

  it('spec yaşı hesaplanabiliyor — üç aylık drift denetiminin girdisi', () => {
    const p = placementById('linkedin-feed-4x5')
    expect(p).not.toBeNull()
    if (p === null) return
    expect(specAgeDays(p, '2026-08-15')).toBe(0)
    expect(specAgeDays(p, '2026-11-15')).toBe(92)
    // Bozuk tarih sessizce 0 DEĞİL sonsuz: "yeni doğrulandı" demek en kötü yalan.
    expect(specAgeDays(p, 'bozuk')).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('kalite merdiveni', () => {
  /** Basamak → bayt: PNG büyük, JPEG kalitesi düştükçe küçülür, ölçek karesel. */
  const sahteBoyut = (temel: number) => (r: QualityRung) => {
    const kaliteCarpani = r.jpegQuality === null ? 1 : r.jpegQuality / 200
    return Math.round(temel * kaliteCarpani * r.scale * r.scale)
  }

  it('sığan görsel İLK basamakta kalıyor — gereksiz sıkıştırma yok', () => {
    const r = climbLadder(sahteBoyut(1_000_000), 5 * 1024 * 1024)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.index).toBe(0)
      expect(r.rung.jpegQuality).toBeNull() // PNG, kayıpsız
    }
  })

  it('büyük görsel merdiveni İNİYOR', () => {
    const r = climbLadder(sahteBoyut(8 * 1024 * 1024), 5 * 1024 * 1024)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.index).toBeGreaterThan(0)
      expect(r.bytes).toBeLessThanOrEqual(5 * 1024 * 1024)
    }
  })

  it('ÖLÇEK en SON düşüyor — tipografi korunuyor', () => {
    // 1200px'de %70 JPEG, 900px'de %90 JPEG'den okunaklıdır ve tipografi ölçek
    // düşünce doğrudan zarar görür (§7.1'in yayın tarafındaki karşılığı).
    const olcekliIlk = QUALITY_LADDER.findIndex((r) => r.scale < 1)
    const kaliteSon = QUALITY_LADDER.map((r) => r.jpegQuality).lastIndexOf(75)
    expect(olcekliIlk).toBeGreaterThan(0)
    for (const r of QUALITY_LADDER.slice(0, olcekliIlk)) expect(r.scale).toBe(1)
    expect(kaliteSon).toBeGreaterThan(-1)
  })

  it('merdiven TÜKENİRSE sessizce yayınlanmıyor', () => {
    // Sessizce yayınlamaya çalışmak, "3 varlık ürettim" sanıp sıfır yayınlamaktır.
    const r = climbLadder(sahteBoyut(500 * 1024 * 1024), 5 * 1024 * 1024)
    expect(r.ok).toBe(false)
    expect(formatLadder(r)).toContain('sessizce yayınlanmaz')
  })

  it('rapor NEREDE durulduğunu söylüyor', () => {
    const r = climbLadder(sahteBoyut(8 * 1024 * 1024), 5 * 1024 * 1024)
    const s = formatLadder(r)
    expect(s).toContain('basamak')
    expect(s).toMatch(/JPEG %\d+|PNG/)
    expect(s).toContain('KB')
  })

  it('merdivenin her basamağı bir ÖNCEKİNDEN küçük', () => {
    // Yukarı çıkan bir basamak merdiveni anlamsız yapardı: ilk sığan kazanıyor.
    const boyutlar = QUALITY_LADDER.map(sahteBoyut(10_000_000))
    for (let i = 1; i < boyutlar.length; i++) {
      expect(boyutlar[i], `basamak ${i + 1}`).toBeLessThanOrEqual(boyutlar[i - 1] as number)
    }
  })
})
