import { describe, expect, it } from 'vitest'
import type { Block } from '@suite/kernel'
import { EXPLAINER_ASPECTS, MASTER, budgetFor, layoutAcrossAspects } from './coklu-enboy.js'

const baslik = (text: string): Block => ({ type: 'heading', text, level: 1 })
const govde = (text: string): Block => ({ type: 'body', text })

describe('çok en-boy', () => {
  it('üç en-boy: master 16:9 · dikey 9:16 · kare 1:1', () => {
    expect(EXPLAINER_ASPECTS.map((a) => a.id)).toEqual([
      'master-16x9',
      'instagram-story-9x16',
      'linkedin-feed-1x1',
    ])
  })

  it('9:16 kullanılabilir genişlik GÜVENLİ ALAN — tuval değil', () => {
    const dikey = EXPLAINER_ASPECTS.find((a) => a.id === 'instagram-story-9x16')!
    // 1080 - 2×%6 = 950. Tuvalin tamamını kullanmak metni Reels UI'ının altına gömerdi.
    expect(dikey.usableWidth).toBe(950)
    expect(dikey.usableWidth).toBeLessThan(dikey.width)
  })

  // 🧪 İHLAL TESTİ — bütçe en-boya göre DARALMALI. Fikstür (D-181): üç en-boy üç
  // farklı bütçe; oran kaldırılırsa üçü de eşitlenir ve test kırılır.
  it('bütçe dar çerçevede küçülüyor — punto DEĞİL, bütçe', () => {
    const b = EXPLAINER_ASPECTS.map((a) => budgetFor('statement', a).heading)
    expect(b).toEqual([68, 33, 42])
    // Master en geniş, dikey en dar.
    expect(b[0]).toBeGreaterThan(b[2]!)
    expect(b[2]).toBeGreaterThan(b[1]!)
  })

  it('kısa metin HİÇBİR en-boyda bölünmüyor', () => {
    const r = layoutAcrossAspects([baslik('Fire ölçümü')], 'statement')
    expect(r.map((x) => x.split)).toEqual([false, false, false])
    expect(r.every((x) => !x.oversized)).toBe(true)
  })

  /**
   * Adımın 🧪 kriteri: 9:16'da taşan başlık BÖLÜNÜYOR, küçültülmüyor.
   *
   * Fikstür seçimi kritik (D-181): başlık master'a SIĞACAK ama dikeye SIĞMAYACAK
   * uzunlukta. Her ikisine de sığan bir metin kuralı hiç sınamazdı.
   */
  it('16:9’a sığan başlık 9:16’da BÖLÜNÜYOR — küçültülmüyor', () => {
    // 60 karakter: master bütçesi 68, dikey bütçesi 33.
    const uzun = 'İmalatta fire ölçümü ve vardiya bazlı eğilim takibi tam bir'
    expect(uzun.length).toBeGreaterThan(33)
    expect(uzun.length).toBeLessThanOrEqual(68)

    const r = layoutAcrossAspects([baslik(uzun), govde('Kısa gövde')], 'statement')
    const master = r.find((x) => x.aspect.id === 'master-16x9')!
    const dikey = r.find((x) => x.aspect.id === 'instagram-story-9x16')!

    expect(master.split).toBe(false)
    // Dikeyde tek başına sığmıyor → kendi slaydına konur ve İŞARETLENİR.
    expect(dikey.oversized).toBe(true)
    // **Punto değişmedi**: dönüşte ölçek alanı YOK — tip bunu yapısal olarak garanti
    // ediyor, bu satır o garantiyi belgeliyor.
    expect(Object.keys(dikey)).not.toContain('scale')
  })

  it('master bütçesi düzenin kendi tavanı — oran 1', () => {
    expect(budgetFor('statement', MASTER)).toEqual({ heading: 68, body: 140 })
  })

  it('aynı içerik her en-boyda AYNI blokları taşıyor, yalnız dağılım değişiyor', () => {
    const bloklar = [
      baslik('Ölçüm'),
      govde('Vardiya bazlı fire oranı'),
      govde('İki haftalık eğilim'),
    ]
    const r = layoutAcrossAspects(bloklar, 'claim-proof')
    for (const a of r) {
      const hepsi = a.slides.flat()
      // Hiçbir blok KAYBOLMUYOR: bölmek dağıtır, silmez.
      expect(hepsi.length).toBe(bloklar.length)
    }
  })
})
