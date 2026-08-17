// Marka işareti (§4.3 · FAZ-12.6).

import { describe, expect, it } from 'vitest'
import { BOSLUK_ORANI, EN_KUCUK_PX, bosluk, markaIsaretiSvg, markaKilidi } from './marka-isareti.js'
import { toHtml } from './static.js'

const belge = (role: string) =>
  ({
    kind: 'post',
    width: 1080,
    height: 1350,
    tokenCss: ':root{--role-bg:#000;--role-text:#fff}',
    slayt: { role, index: role === 'kapak' ? 0 : 2, total: 5, duzen: 'list', kulp: '@upcytech' },
    blocks: [{ type: 'body', text: 'x', islev: 'kanit' }],
  }) as never

describe('marka işareti', () => {
  it('BOŞLUK işaretin kendi ölçüsünden — sabit piksel değil', () => {
    // Sabit piksel 1:1 ve 9:16'da farklı görünürdü; aynı hata `maske` çapında yaşandı.
    expect(bosluk(30)).toBe(Math.round(30 * BOSLUK_ORANI))
    expect(bosluk(60)).toBe(2 * bosluk(30))
  })

  it('EN KÜÇÜK boyun altına inmiyor', () => {
    expect(markaIsaretiSvg(8, '#fff', '#000')).toContain(`width="${EN_KUCUK_PX}"`)
  })

  it('harf CANLI metin — glif ölçümü işareti de kapsıyor', () => {
    // `path`e çevrilseydi font düşse bile kapı göremezdi (R-20 ailesi).
    const svg = markaIsaretiSvg(30, '#fff', '#000')
    expect(svg).toContain('<text')
    expect(svg).toContain('Marka Display')
    expect(svg).not.toContain('<path')
  })

  it('erişilebilir ad taşıyor', () => {
    expect(markaIsaretiSvg(30, '#fff', '#000')).toContain('aria-label="Upcytech"')
  })

  it('YALNIZ kapak ve kapanışta — süsleme değil, imza', () => {
    expect(toHtml(belge('kapak'))).toContain('class="marka"')
    expect(toHtml(belge('kapanis'))).toContain('class="marka"')
    // Gövdede yalnız kulp: ikisi birden gürültü olurdu.
    const govde = toHtml(belge('govde'))
    expect(govde).not.toContain('class="marka"')
    expect(govde).toContain('class="kulp"')
  })

  it('kilit işaret + kelime işaretini birlikte veriyor', () => {
    expect(markaKilidi(30, '#fff', '#000', '@upcytech')).toContain('@upcytech')
  })
})
