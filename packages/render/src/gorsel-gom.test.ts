// Defterdeki referans biçimi gömülü byte'a çevriliyor mu (§7.1 · D-302).
//
// ⚠ ⚠ **DIŞA AKTARILAN SLAYTLARDA GÖRSELLER YOKTU.** Depo sahibi: *"görsel ögeler export
// olmuyor, sadece dosya adları ile export oluyor"*. Koşu defteri görseli
// `src: "gorsel-01.png"` diye taşıyor — bir DOSYA ADI, bir veri değil. Belge diskten
// okunup doğrudan render'a verildiğinde Chromium'un o adı çözecek bir taban adresi yok:
// slayt çiziliyor, kesik özne YOK.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gorselleriGom } from './gorsel-gom.js'

const PNG = Buffer.from('89504e470d0a1a0a', 'hex')

const kur = (): string => {
  const d = mkdtempSync(join(tmpdir(), 'gorsel-gom-'))
  writeFileSync(join(d, 'gorsel-01.png'), PNG)
  return d
}

describe('görsel gömme', () => {
  it('dosya adı `data:` URI oluyor — render onu çözebiliyor', () => {
    const d = kur()
    const r = gorselleriGom({ gorseller: [{ src: 'gorsel-01.png', alt: 'kesik özne' }] }, d)
    const g = (r.gorseller as { src: string; alt: string }[])[0]
    expect(g?.src.startsWith('data:image/png;base64,')).toBe(true)
    // ⚠ Öteki alanlar DOKUNULMADAN geçiyor: alt metin R-34'ün dayanağı.
    expect(g?.alt).toBe('kesik özne')
  })

  it('ZATEN gömülü olan dokunulmadan geçiyor', () => {
    const d = kur()
    const veri = 'data:image/png;base64,AAAA'
    const r = gorselleriGom({ gorseller: [{ src: veri }] }, d)
    expect((r.gorseller as { src: string }[])[0]?.src).toBe(veri)
  })

  it('dosya YOKSA `src` boş — uydurma yer tutucu KONMUYOR', () => {
    const d = kur()
    const r = gorselleriGom({ gorseller: [{ src: 'yok-boyle.png' }] }, d)
    // ⚠ Sessizce bir şey çizmek, "görsel üretildi" yanılgısı üretirdi. Eksik olan görünür.
    expect((r.gorseller as { src: string }[])[0]?.src).toBe('')
  })

  it('YOL AYRACI taşıyan ad okunmuyor — defter dizininin dışına çıkılmaz', () => {
    const d = kur()
    for (const kotu of ['../../etc/passwd', 'alt/dizin.png', '..']) {
      const r = gorselleriGom({ gorseller: [{ src: kotu }] }, d)
      expect((r.gorseller as { src: string }[])[0]?.src).toBe('')
    }
  })

  it('görselsiz belge AYNEN dönüyor', () => {
    const d = kur()
    const belge: { kartlar: readonly { baslik: string }[]; gorseller?: readonly unknown[] } = {
      kartlar: [{ baslik: 'x' }],
    }
    expect(gorselleriGom(belge, d)).toBe(belge)
  })
})
