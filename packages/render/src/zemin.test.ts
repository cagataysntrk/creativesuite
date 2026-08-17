// Zemin reçetesi — katman, sıra, karışım (FAZ-15.3 · §12.1).

import { describe, expect, it } from 'vitest'
import { zeminCss, zeminKarisimi, type ZeminResetesi } from './zemin.js'

const recete = (ek: Partial<ZeminResetesi> = {}): ZeminResetesi => ({
  taban: '--ramp-marka-ink-950',
  katmanlar: [
    {
      tip: 'dogrusal',
      aci: 104,
      duraklar: [
        { renk: '--ramp-marka-ink-950', konum: 0 },
        { renk: '--ramp-marka-ink-800', konum: 46 },
      ],
    },
    { tip: 'isik', x: 16, y: 24, capX: 52, capY: 78, renk: '--ramp-marka-amber-500', guc: 17 },
    { tip: 'vinyet', guc: 34 },
  ],
  ...ek,
})

describe('zemin reçetesi', () => {
  it('taban EN ALTTA — katmanlar onun üstünde', () => {
    const css = zeminCss(recete())
    expect(css.endsWith('var(--ramp-marka-ink-950)')).toBe(true)
  })

  // ⚠ CSS `background`ta İLK katman en öndedir; reçete "önce taban, sonra üstü" diye
  // okunuyor. Çevrim yapılmasaydı vinyet degradenin altında kalır ve HİÇ görünmezdi.
  it('reçetede SON yazılan katman zeminde EN ÜSTTE çıkıyor', () => {
    const css = zeminCss(recete())
    const vinyet = css.indexOf('ellipse 78% 88%')
    const dogrusal = css.indexOf('linear-gradient(104deg')
    expect(vinyet).toBeGreaterThanOrEqual(0)
    expect(vinyet).toBeLessThan(dogrusal)
  })

  it('degrade varsa gren KENDİLİĞİNDEN ekleniyor — kapatma alanı yok', () => {
    expect(zeminCss(recete())).toContain('feTurbulence')
  })

  it('degrade yoksa gren de yok — dither edilecek bir bant yok', () => {
    const dokusuz = recete({ katmanlar: [{ tip: 'vinyet', guc: 20 }] })
    expect(zeminCss(dokusuz)).not.toContain('feTurbulence')
  })

  // ⚠ ⚠ **SIRA EŞLEŞMESİ.** `background-blend-mode` listesi `background` listesiyle
  // birebir aynı uzunlukta olmalı; kaydığı an karışım YANLIŞ katmana uygulanır ve bu
  // bakınca bile zor görülür.
  it('karışım listesi katman listesiyle aynı uzunlukta', () => {
    // ⚠ Düz `split(',')` işe yaramıyor: `linear-gradient(...)` kendi içinde virgül
    // taşıyor. İlk sürüm tam bunu yaptı ve 5 yerine 13 saydı — ölçüm aracının kendisi
    // bozuktu, ölçtüğü şey değil. Derinlik sayan bir ayırıcı gerekiyor.
    const ustDuzeyVirgul = (s: string): number => {
      let derinlik = 0
      let parca = 1
      for (const c of s) {
        if (c === '(') derinlik += 1
        else if (c === ')') derinlik -= 1
        else if (c === ',' && derinlik === 0) parca += 1
      }
      return parca
    }
    for (const r of [recete(), recete({ katmanlar: [{ tip: 'vinyet', guc: 20 }] })])
      expect(ustDuzeyVirgul(zeminKarisimi(r))).toBe(ustDuzeyVirgul(zeminCss(r)))
  })

  it('gren `overlay` ile bindiriliyor — görünür film greni DEĞİL', () => {
    expect(zeminKarisimi(recete()).startsWith('overlay')).toBe(true)
  })

  // ⚠ Serbest renk TEMSİL EDİLEMİYOR: her renk `--ramp-` ön ekli bir token.
  it('üretilen CSS`te rampa dışı renk literali yok', () => {
    const css = zeminCss(recete())
    const renkler = css.match(/var\(--[a-z0-9-]+\)/g) ?? []
    expect(renkler.length).toBeGreaterThan(0)
    for (const r of renkler) expect(r.startsWith('var(--ramp-')).toBe(true)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}(?![^(]*\.svg)/)
    expect(css).not.toMatch(/rgba?\(/)
  })

  it('gren determinist — seed açıkça yazılı (R-06)', () => {
    expect(zeminCss(recete())).toContain("seed='7'")
  })
})
