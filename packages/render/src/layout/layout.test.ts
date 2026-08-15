import { describe, expect, it } from 'vitest'
import type { Block } from '@suite/kernel'
import { LAYOUTS, LAYOUT_SPECS, paginate, splitForLayout } from './enum.js'

// §7.1'in sert kuralı: taşma BÖLER, asla küçültmez. Türkçe'de bu kural İngilizce'den
// sert — kelimeler uzun, ekler yığılıyor ve küçültme okunabilirliği daha hızlı bitiriyor.
// Ayrıca küçültme sorunu GİZLER: çıktı "sığmış" görünür, kimse içeriğin fazla
// olduğunu fark etmez.

const baslik = (t: string): Block => ({ type: 'heading', text: t, level: 1 })
const govde = (t: string): Block => ({ type: 'body', text: t })

/** Türkçe metin: +%30 sahte-yerelleştirme yerine GERÇEK Türkçe (R-23). */
const UZUN_BASLIK = 'Ölçemediğiniz fireyi yönetemezsiniz ve yönetemediğiniz fireyi açıklayamazsınız'
const KISA_BASLIK = 'Ölçüm hattınızda başlar'

describe('kapalı düzen kümesi', () => {
  it('dört düzen var ve hepsinin speci tanımlı', () => {
    expect(LAYOUTS).toHaveLength(4)
    for (const l of LAYOUTS) expect(LAYOUT_SPECS[l]?.name).toBe(l)
  })

  it('her düzenin bütçesi POZİTİF — sıfır bütçe her şeyi taşırdı', () => {
    for (const l of LAYOUTS) {
      expect(LAYOUT_SPECS[l].headingBudget, l).toBeGreaterThan(0)
      expect(LAYOUT_SPECS[l].bodyBudget, l).toBeGreaterThan(0)
      expect(LAYOUT_SPECS[l].maxBlocks, l).toBeGreaterThan(0)
    }
  })
})

describe('taşma BÖLER, küçültmez', () => {
  it('sığan içerik bölünmüyor', () => {
    const r = splitForLayout([baslik(KISA_BASLIK)], 'statement')
    expect(r.overflow).toEqual([])
    expect(r.reason).toBe('')
  })

  it('uzun Türkçe başlık taşıyor ve SEBEBİ yazılı', () => {
    const r = splitForLayout([baslik(UZUN_BASLIK)], 'statement')
    expect(r.overflow).toHaveLength(1)
    expect(r.reason).toContain('başlık bütçesi aşıldı')
  })

  it('dönen yapıda ÖLÇEK alanı YOK — küçültme imkânsız', () => {
    // İmza bir ölçek çarpanı taşısaydı biri onu kullanırdı. Kural, yazılmayan
    // alanla zorlanıyor.
    const r = splitForLayout([baslik(UZUN_BASLIK)], 'statement')
    expect(Object.keys(r).sort()).toEqual(['fits', 'overflow', 'reason'])
  })

  it('maxBlocks aşılınca kalan bloklar sonraki slayda gidiyor', () => {
    const bloklar = [baslik(KISA_BASLIK), govde('a'), govde('b'), govde('c')]
    const r = splitForLayout(bloklar, 'statement')
    expect(r.fits).toHaveLength(2)
    expect(r.overflow).toHaveLength(2)
    expect(r.reason).toContain('maxBlocks')
  })
})

describe('sayfalama — sonsuz döngü YOK', () => {
  it('uzun içerik birden fazla slayda bölünüyor', () => {
    const bloklar = [baslik(KISA_BASLIK), govde('x'.repeat(100)), govde('y'.repeat(100))]
    const slaytlar = paginate(bloklar, 'statement')
    expect(slaytlar.length).toBeGreaterThan(1)
  })

  it('TEK BAŞINA sığmayan blok kendi slaydına konuyor ve İŞARETLENİYOR', () => {
    // Bölmek onu asla sığdırmaz. Sessizce kırpmak ya da küçültmek yasak olan iki şey;
    // üçüncü yol açıkça işaretlemek.
    const slaytlar = paginate([baslik('Ö'.repeat(500))], 'statement')
    expect(slaytlar).toHaveLength(1)
    expect(slaytlar[0]?.oversized).toBe(true)
  })

  it('her blok TAM OLARAK bir slaytta — kayıp yok, kopya yok', () => {
    const bloklar = [
      baslik(KISA_BASLIK),
      govde('a'.repeat(200)),
      govde('b'.repeat(200)),
      govde('c'.repeat(200)),
    ]
    const slaytlar = paginate(bloklar, 'claim-proof')
    const toplam = slaytlar.flatMap((s) => s.blocks)
    expect(toplam).toHaveLength(bloklar.length)
    expect(toplam.map((b) => (b.type === 'body' ? b.text[0] : 'H'))).toEqual(['H', 'a', 'b', 'c'])
  })

  it('boş liste boş sayfalama — sonsuz döngüye girmiyor', () => {
    expect(paginate([], 'list')).toEqual([])
  })

  it('dört düzenin dördü de sonlanıyor', () => {
    const zor = Array.from({ length: 20 }, (_, i) => govde('z'.repeat(80 + i)))
    for (const l of LAYOUTS) {
      const s = paginate(zor, l)
      expect(
        s.flatMap((x) => x.blocks),
        l
      ).toHaveLength(zor.length)
    }
  })
})
