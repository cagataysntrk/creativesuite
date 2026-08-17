import { describe, expect, it } from 'vitest'
import type { DocumentModel } from '@suite/kernel'
import { KATMAN_SIRASI, ustunde, z } from './kompozit.js'
import { toHtml } from './static.js'

describe('katman yığını', () => {
  it('hiçbir iki katman aynı z-index alamaz', () => {
    // ⚠ Eski hâlde SEKİZ elle yazılmış sabit vardı ve ÜÇÜ beraberdi: `.alan`/`.susleme`
    // ikisi de 1, `.hayalet`/`.doku`/`.vinyet` üçü de 2. Beraberlikte sırayı CSS değil
    // DOM sırası belirliyordu — bir satır taşınsa sessizce bozulurdu.
    const zler = KATMAN_SIRASI.map(z)
    expect(new Set(zler).size).toBe(zler.length)
  })

  it('doku hayaletin ÜSTÜNDE, içeriğin ALTINDA', () => {
    // ⚠ `mix-blend-mode: overlay` taşıyan bir katmanın yeri bir tercih değil bir şart.
    // Bu cümle bir yorum olarak yaşarsa bir gün yalan olur; okuma olarak yaşarsa olamaz.
    expect(ustunde('doku', 'hayalet')).toBe(true)
    expect(ustunde('icerik', 'doku')).toBe(true)
  })

  it('kimlik en üstte, alan en altta', () => {
    expect(z('kimlik')).toBe(KATMAN_SIRASI.length)
    expect(z('alan')).toBe(1)
  })

  it('yığın KAPALI — yedi katman', () => {
    // Sekizincisi bir karar ister: sınırsız katman şablon olmaktan çıkarır.
    expect(KATMAN_SIRASI.length).toBe(7)
  })
})

describe('üretim yolu', () => {
  const belge = (): DocumentModel =>
    ({
      width: 1080,
      height: 1350,
      tokenCss: ':root{--role-bg:#e8a92a;--role-surface:#f5f3ee;--role-line-edge:#1b1b1b}',
      slayt: { role: 'govde', index: 1, total: 5, duzen: 'list', kulp: '@upcytech' },
      blocks: [{ type: 'body', text: 'Ölçmediğiniz bir hattı iyileştiremezsiniz.' }],
    }) as unknown as DocumentModel

  it('HTML’de basılan z-index’ler dağarcıktan geliyor', () => {
    const h = toHtml(belge())
    for (const k of KATMAN_SIRASI) {
      if (k === 'kimlik') continue
      expect(h).toContain(`.${k} `)
    }
    // ⚠ Elle yazılmış bir z-index kalmamalı: dağarcık dışı her sayı ikinci bir sıra kaynağı.
    const zler = [...h.matchAll(/z-index:\s*(\d+)/g)].map((m) => Number(m[1]))
    expect(zler.length).toBeGreaterThan(0)
    for (const v of zler) expect(KATMAN_SIRASI.map(z)).toContain(v)
  })

  it('sıra İÇERİKTEN türemez — aynı belge iki kez aynı yığını verir', () => {
    // Türeseydi aynı konu iki koşuda iki farklı kompozit verir, golden test kurulamazdı.
    const bir = [...toHtml(belge()).matchAll(/z-index:\s*(\d+)/g)].map((m) => m[1])
    const iki = [...toHtml(belge()).matchAll(/z-index:\s*(\d+)/g)].map((m) => m[1])
    expect(bir).toEqual(iki)
  })
})
