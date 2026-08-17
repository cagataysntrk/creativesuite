// Görsel içeren slaytta renk metrikleri ÖLÇÜLMÜYOR (§11.1 · FAZ-10.7 · D-258).
//
// Bu davranış gerçek bir koşuyu durdurduktan sonra yazıldı: AI fotoğrafı taşıyan slayt
// "palet dışı %17,7" verdi ve karosel yayınlanamaz oldu. Fotoğraf tanımı gereği palet
// dışıdır — o sayı fotoğraf hakkında bir olgu, tasarım hakkında bir kusur değil.

import { describe, expect, it } from 'vitest'
import type { BrandId, EraId } from '@suite/contracts'
import type { DocumentModel } from '@suite/kernel'
import { measure, DEFAULT_LIMITS } from './measure.js'

// Damga her varlıkta ZORUNLU (R-11): retrofit imkânsız olduğu için testte de var.
const DAMGA = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const TOKEN = ':root{--role-bg:#e8a92a}'
const belge = (gorselli: boolean): DocumentModel => ({
  kind: 'post',
  stamp: DAMGA,
  width: 1080,
  height: 1350,
  tokenCss: TOKEN,
  blocks: gorselli
    ? [
        { type: 'heading', level: 1, text: 'Başlık' },
        { type: 'image', src: 'x.png', alt: 'fabrika bandı', decorative: false },
      ]
    : [{ type: 'heading', level: 1, text: 'Başlık' }],
})

// Palete UZAK pikseller — bir fotoğrafın yapacağı şey.
const UZAK = Array.from({ length: 200 }, (_, i) => ({ r: i % 255, g: 200, b: 30 }))
const PALET = { colors: ['#e8a92a', '#f5f3ee', '#1b1b1b'] }

const olc = (gorselli: boolean) =>
  measure({
    doc: belge(gorselli),
    palette: PALET,
    pixels: UZAK,
    targetAspect: 1080 / 1350,
    limits: DEFAULT_LIMITS,
  })

describe('measure — görsel içeren slayt', () => {
  it('görselSİZ slaytta renk okumaları ÜRETİLİYOR', () => {
    const m = olc(false).readings.map((r) => r.metric)
    expect(m).toContain('delta_e_2000')
    expect(m).toContain('off_palette')
  })

  it('görselli slaytta renk okumaları ÜRETİLMİYOR — sıfır da yazılmıyor', () => {
    const r = olc(true)
    const m = r.readings.map((x) => x.metric)
    expect(m).not.toContain('delta_e_2000')
    expect(m).not.toContain('off_palette')
    // ⚠ Sıfır yazmak da yanlış olurdu: "mükemmel uyum" göstermek, hiçbir şey
    // ölçülmediği anda yeşil yakmaktır (`measure.ts`in kendi kuralı).
    expect(r.readings.some((x) => x.metric === 'off_palette' && x.value === 0)).toBe(false)
  })

  it('kaplama ve en-boy ETKİLENMİYOR — ikisi belge modelinden geliyor', () => {
    const m = olc(true).readings.map((x) => x.metric)
    expect(m).toContain('text_coverage')
    expect(m).toContain('aspect_deviation')
  })

  it('görselli slayt palet yüzünden BLOKLANMIYOR', () => {
    // Asıl kusur buydu: fotoğraf yüzünden `blocked: true` dönüyor ve sistemin üretmesi
    // gereken şey reddediliyordu (D-251'in birebir tekrarı).
    expect(olc(true).blocked).toBe(false)
    expect(olc(false).blocked).toBe(true)
  })
})
