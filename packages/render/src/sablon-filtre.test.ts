// Duotone: renk tutarlılığı YAPISAL (§12.1 · FAZ-11.7).

import { describe, expect, it } from 'vitest'
import {
  dokuCss,
  duotoneSvg,
  grainSvg,
  vinyetCss,
  GRAIN_TAVANI,
  VARSAYILAN_UCLAR,
} from './sablon-filtre.js'
import { toHtml } from './static.js'

describe('duotone', () => {
  it('ÖNCE griye indiriyor, SONRA iki uca yayıyor — sıra şart', () => {
    // Tek adımda yapılsaydı renkli girdinin kendi hue`su matrise sızar ve mavi bir
    // makine mavi kalırdı. Luminance ağırlıkları insan gözünün yeşile duyarlılığı.
    const svg = duotoneSvg('t')
    expect(svg.indexOf('feColorMatrix')).toBeLessThan(svg.indexOf('feComponentTransfer'))
    expect(svg).toContain('0.2126 0.7152 0.0722')
  })

  it('uçlar MARKA ekseninde ve tablodan geliyor', () => {
    const svg = duotoneSvg('t', VARSAYILAN_UCLAR)
    expect(svg).toContain(`tableValues="${VARSAYILAN_UCLAR.koyu[0]} ${VARSAYILAN_UCLAR.acik[0]}"`)
    expect(svg).toContain('type="table"')
  })

  it('sRGB uzayında çalışıyor — linearRGB hue kaydırır', () => {
    expect(duotoneSvg('t')).toContain('color-interpolation-filters="sRGB"')
  })

  it('ÜRETİM YOLUNA bağlı: yuvalı görsele filtre uygulanıyor', () => {
    // Modül yazmak yetmez (D-261). `toHtml` gerçekten filtreyi bağlıyor mu.
    const doc = {
      kind: 'post',
      width: 1080,
      height: 1350,
      tokenCss: ':root{--role-bg:#000;--role-text:#fff}',
      slayt: { role: 'govde', index: 1, total: 5, duzen: 'list' },
      blocks: [{ type: 'image', src: 'x.png', alt: 'a', decorative: false, yuva: 'alan' }],
    } as never
    const h = toHtml(doc)
    // ⚠ Kimlik FAZ-12.2'de dağarcığa taşındı: `islem-<ad>`. Tek yerden üretiliyor.
    expect(h).toContain('<filter id="islem-duotone"')
    expect(h).toContain('filter: url(#islem-duotone)')
  })

  it('slayt kimliği YOKSA filtre basılmıyor — eski belgeler bozulmuyor', () => {
    const doc = {
      kind: 'post',
      width: 1080,
      height: 1350,
      tokenCss: ':root{--role-bg:#000}',
      blocks: [{ type: 'body', text: 'x' }],
    } as never
    expect(toHtml(doc)).not.toContain('islem-duotone')
  })
})

describe('doku ve derinlik', () => {
  it('grain DETERMİNİSTİK — sabit seed', () => {
    expect(grainSvg('g')).toBe(grainSvg('g'))
    expect(grainSvg('g')).toContain('seed="7"')
  })

  it('grain opaklığı TAVANLI — doku bir his, gürültü değil', () => {
    // Tavan olmadan "biraz daha doku" her turda biraz daha eklenir ve okunabilirlik erir.
    expect(grainSvg('g', 0.9)).toContain(`slope="${GRAIN_TAVANI}"`)
  })

  it('fractalNoise seçildi — turbulence mermer gibi görünür', () => {
    expect(grainSvg('g')).toContain('type="fractalNoise"')
  })

  it('vinyet BU AİLEDE kapalı — ölçüldü, amber düz kalmalı', () => {
    // 0.1 ile render edildi: amber alan 215→229→215 arası değişti (görünür degrade).
    // Kapalıyken 233/233/233 — düz, referans örnek 5'in gerektirdiği gibi.
    expect(vinyetCss()).toContain('rgba(0,0,0,0) 55%')
    expect(vinyetCss()).toContain('rgba(0,0,0,0) 100%')
    expect(vinyetCss(0.1)).toContain('rgba(0,0,0,0.1) 100%')
  })

  it('doku ve vinyet METNİN ALTINDA — z-index 2, içerik 3', () => {
    expect(dokuCss()).toContain('z-index: 2')
    expect(vinyetCss()).toContain('z-index: 2')
    expect(dokuCss()).toContain('pointer-events: none')
  })
})
