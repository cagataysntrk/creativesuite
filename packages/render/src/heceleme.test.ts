// Türkçe yumuşak tireleme render'da (§7.2 · FAZ-12.3).
//
// ⚠ Bu dosya bir ZİNCİR KOPUKLUĞUNDAN doğdu: `softHyphenate`/`syllables` contracts'te
// yazılı ve testliydi, render katmanı onları HİÇ çağırmıyordu ve `static.ts`te ne
// `hyphens` ne `lang` vardı. Modül var, test yeşil, üretim yolu sıfır — bu projede
// yedinci kez (D-261).

import { describe, expect, it } from 'vitest'
import { toHtml } from './static.js'

const YUMUSAK = '­'

const belge = (metin: string, tur: 'body' | 'heading' = 'body') =>
  ({
    kind: 'post',
    width: 1080,
    height: 1350,
    tokenCss: ':root{--role-bg:#000;--role-text:#fff}',
    slayt: { role: 'govde', index: 1, total: 5, duzen: 'list' },
    blocks: [
      tur === 'body'
        ? { type: 'body', text: metin, islev: 'kanit' }
        : { type: 'heading', level: 1, text: metin, islev: 'kanca' },
    ],
  }) as never

describe('Türkçe heceleme', () => {
  it('UZUN kelime yumuşak tire alıyor', () => {
    expect(toHtml(belge('taşıyabileceğimizin'))).toContain(YUMUSAK)
  })

  it('KISA kelime dokunulmuyor — eşik 12', () => {
    // "kalibrasyon" 11 harf: satır sonunda bölünmesine gerek yok, bölünmesi de çirkin.
    const h = toHtml(belge('kalibrasyon vardiya ölçüm'))
    expect(h).not.toContain(YUMUSAK)
  })

  it('BAŞLIK bölünmüyor — 64 px display yüzünde bölünen kelime kompozisyonu bozar', () => {
    expect(toHtml(belge('taşıyabileceğimizin', 'heading'))).not.toContain(YUMUSAK)
  })

  it('`lang="tr"` basılıyor — locale bilgisi olmadan tarayıcı İngilizce kurallar uygular', () => {
    expect(toHtml(belge('x'))).toContain('lang="tr"')
  })

  it('BELGE MODELİ değişmiyor — tire yalnız render anında', () => {
    // Aksi hâlde alt metin, lexicon ve defter görünmez karakterler taşırdı.
    const doc = belge('taşıyabileceğimizin') as unknown as {
      blocks: readonly { text: string }[]
    }
    toHtml(doc as never)
    expect(doc.blocks[0]!.text).not.toContain(YUMUSAK)
  })
})
