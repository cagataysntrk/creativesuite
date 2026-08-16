// Prompt kaynağı ve çıktı normalizasyonu ÖLÇÜLÜYOR (D-243).

import { describe, expect, it } from 'vitest'
import { duzMetin, gorselBriefPromptu, icerikPromptu, metneCevir } from './metin-akisi.js'

const KAYITLAR = [
  { id: 'rec_pos', text: 'Veriyi karara çeviren ürünler üretiyoruz.' },
  { id: 'rec_msg', text: 'Veriniz yoksa önce veriyi kuruyoruz.' },
]

describe('içerik prompt`u', () => {
  it('konu ve kayıtları birlikte taşıyor', () => {
    const p = icerikPromptu({ konu: 'ölçüm', kayitlar: KAYITLAR })
    expect(p).toContain('KONU: ölçüm')
    expect(p).toContain('rec_pos')
    expect(p).toContain('Veriniz yoksa önce veriyi kuruyoruz.')
  })

  it('KAYIT YOKSA prompt kurulmuyor — bağlamsız metin markadan gelmez', () => {
    expect(icerikPromptu({ konu: 'ölçüm', kayitlar: [] })).toBeNull()
    expect(icerikPromptu({ konu: 'ölçüm', kayitlar: [{ id: 'x', text: '   ' }] })).toBeNull()
  })

  it('KONU YOKSA prompt kurulmuyor', () => {
    expect(icerikPromptu({ konu: '  ', kayitlar: KAYITLAR })).toBeNull()
  })

  it('sayısal iddia yasağı prompt`a YAZILIYOR — linter`i beklemiyor', () => {
    const p = icerikPromptu({ konu: 'ölçüm', kayitlar: KAYITLAR }) ?? ''
    expect(p).toContain('Hiçbir sayısal iddia yazma')
  })

  it('max_chars ve kacinilacak geçiyor', () => {
    const p =
      icerikPromptu({ konu: 'x', kayitlar: KAYITLAR, maxChars: 500, kacinilacak: 'başlık uzun' }) ??
      ''
    expect(p).toContain('En fazla 500 karakter')
    expect(p).toContain('başlık uzun')
  })
})

describe('görsel brief prompt`u', () => {
  const p = gorselBriefPromptu({ konu: 'veri yoksa', kayitlar: KAYITLAR }) ?? ''

  it('İngilizce brief istiyor ve insansız/metinsiz şart koşuyor', () => {
    expect(p).toContain('ENGLISH')
    expect(p).toContain('NO PEOPLE')
    expect(p).toContain('NO TEXT')
  })

  // ⚠ Bake-off ölçtü: metin, sahnenin KENDİSİ tabela içerdiğinde sızıyor. Kantar
  // görselinde "FONTER" yazıyordu. Bu yüzden konu seçimi de kısıtlanıyor.
  it('tabela içeren konuları açıkça eliyor', () => {
    expect(p).toContain('weighbridge displays')
    expect(p).toContain('shelf labels')
  })
})

describe('çıktı normalizasyonu', () => {
  it('Claude Code `result` zarfı tanınıyor', () => {
    expect(metneCevir({ result: 'birinci\n\nikinci' })).toEqual({ lines: ['birinci', 'ikinci'] })
  })

  it('ayrıştırılamayan çıktının `text` zarfı da tanınıyor', () => {
    expect(metneCevir({ text: 'tek satır' })).toEqual({ lines: ['tek satır'] })
  })

  it('boş çıktı `null` — "metin yok" sessizce ham kayıtlara düşmemeli', () => {
    expect(metneCevir({ result: '   ' })).toBeNull()
    expect(metneCevir(null)).toBeNull()
    expect(metneCevir('düz dize')).toBeNull()
  })

  it('`duzMetin` görsel brief`ini tek satıra indiriyor', () => {
    expect(duzMetin({ result: 'a\nb' })).toBe('a b')
  })
})
