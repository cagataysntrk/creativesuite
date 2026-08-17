// Tipografi katman stilleri (§7.2 · FAZ-12.1).

import { describe, expect, it } from 'vitest'
import { OPENTYPE_CSS, TIPO_EFEKTLERI, vurguCss, vurguyuIsaretle } from './sablon-tipo.js'
import { toHtml } from './static.js'

const belge = (metin: string) =>
  ({
    kind: 'post',
    width: 1080,
    height: 1350,
    tokenCss: ':root{--role-bg:#000;--role-text:#fff}',
    slayt: { role: 'govde', index: 1, total: 5, duzen: 'list' },
    blocks: [{ type: 'body', text: metin, islev: 'kanit' }],
  }) as never

describe('tipografi efektleri', () => {
  it('dağarcık KAPALI — beş öge', () => {
    expect(TIPO_EFEKTLERI).toHaveLength(5)
    expect(new Set(TIPO_EFEKTLERI).size).toBe(5)
  })

  it('`**x**` → `<strong>` ve METİN GÖRSELE DÖNMÜYOR (R-20)', () => {
    const h = toHtml(belge('Kayıt **bir klasörde** duruyor'))
    expect(h).toContain('<strong>bir klasörde</strong>')
    // Canlı metin: glif ölçümü ve Türkçe kapıları çalışmaya devam eder.
    expect(h).not.toContain('data:image')
  })

  it('KAÇIRMA önce, işaretleme sonra — enjeksiyon yok', () => {
    // Ters sırada model metnindeki `<` bir etikete dönüşürdü.
    expect(vurguyuIsaretle('&lt;script&gt; **x**')).toContain('&lt;script&gt;')
    expect(vurguyuIsaretle('&lt;script&gt; **x**')).toContain('<strong>x</strong>')
  })

  it('açgözlü DEĞİL — iki vurgu tek bloğa yapışmıyor', () => {
    const h = vurguyuIsaretle('**bir** arada **iki**')
    expect(h).toBe('<strong>bir</strong> arada <strong>iki</strong>')
  })

  it('vurgu ŞERİT, yalnız renk değil — ilk sürüm bakınca yetersizdi', () => {
    const c = vurguCss('#e9b724', '#111')
    expect(c).toContain('linear-gradient(transparent 58%')
    expect(c).toContain('box-decoration-break: clone') // satır kırılmasında da doğru
  })

  it('OpenType bağlı; `dlig` KAPALI — Türkçe`de fi/fı karışır', () => {
    expect(toHtml(belge('x'))).toContain(`font-feature-settings: ${OPENTYPE_CSS}`)
    expect(OPENTYPE_CSS).not.toContain('dlig')
  })
})
