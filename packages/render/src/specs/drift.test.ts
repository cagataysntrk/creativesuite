// Spec drift denetçisi (§9.1 · FAZ-7.1).
import { describe, expect, it } from 'vitest'
import { PLACEMENTS, specAgeDays, specStaleness } from './placements.js'

const BUGUN = '2026-08-16'

describe('spec tazeliği', () => {
  it('her satır sourceUrl ve verifiedAt taşıyor — TİP zorunlu kılıyor', () => {
    for (const p of PLACEMENTS) {
      expect(p.sourceUrl).toMatch(/^https:\/\//)
      expect(p.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('güvenli alanı olan satır KENDİ kaynağını ve tarihini taşıyor', () => {
    const sa = PLACEMENTS.filter((p) => p.safeArea !== null)
    expect(sa.length).toBeGreaterThan(0)
    for (const p of sa) {
      expect(p.safeArea?.sourceUrl).toMatch(/^https:\/\//)
      expect(p.safeArea?.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  // 🧪 Adımın kriteri: `verifiedAt`i geriye al → denetçi işaretliyor.
  it('geriye alınmış verifiedAt YAŞLI görünüyor', () => {
    const p = { ...PLACEMENTS[0]!, verifiedAt: '2025-01-01' }
    expect(specAgeDays(p, BUGUN)).toBeGreaterThan(90)
  })

  /**
   * 🧪 İHLAL TESTİ — **güvenli alan ayrı ölçülüyor.**
   *
   * Bu test yazılana kadar `specAgeDays` yalnız satırın kendi tarihini okuyordu:
   * güvenli alan bir yıl bayatlasa bile denetçi "1 gün" diyordu. Reels'te güvenli alan
   * yanlışsa başlık UI chrome'un altına düşer ve bunu ancak yayınladıktan sonra
   * fark edersiniz.
   */
  it('BAYAT güvenli alan, satır taze olsa bile görünüyor', () => {
    const kaynak = PLACEMENTS.find((x) => x.safeArea !== null)!
    const p = {
      ...kaynak,
      verifiedAt: BUGUN, // satır BUGÜN doğrulandı
      safeArea: { ...kaynak.safeArea!, verifiedAt: '2025-01-01' }, // güvenli alan bir yıllık
    }
    const s = specStaleness(p, BUGUN)
    expect(s.placementDays).toBe(0)
    // Eski davranış burada `0` verirdi ve bayatlık GÖRÜNMEZDİ.
    expect(s.safeAreaDays).toBeGreaterThan(500)
  })

  it('güvenli alanı olmayan satırda safeAreaDays null — 0 DEĞİL', () => {
    const p = PLACEMENTS.find((x) => x.safeArea === null)!
    // `0` "bugün doğrulandı" demek olurdu; `null` "böyle bir şey yok" demek.
    expect(specStaleness(p, BUGUN).safeAreaDays).toBeNull()
  })

  it('okunamayan tarih SONSUZ yaşlı — bilinmeyen tazelik taze değildir', () => {
    expect(specAgeDays({ ...PLACEMENTS[0]!, verifiedAt: 'dün' }, BUGUN)).toBe(
      Number.POSITIVE_INFINITY
    )
  })
})
