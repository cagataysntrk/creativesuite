import { describe, expect, it } from 'vitest'
import {
  foldForSearch,
  lower,
  sentenceCase,
  slug,
  softHyphenate,
  syllables,
  upper,
} from './case.js'

describe('Türkçe case — R-21', () => {
  it("upper('istanbul') → İSTANBUL (naif hâli ISTANBUL verirdi)", () => {
    expect(upper('istanbul')).toBe('İSTANBUL')
    expect('istanbul'.toUpperCase()).not.toBe('İSTANBUL') // hatanın kendisi
  })

  it("lower('IĞDIR') → ığdır (naif hâli iğdir verirdi)", () => {
    expect(lower('IĞDIR')).toBe('ığdır')
    expect('IĞDIR'.toLowerCase()).not.toBe('ığdır')
  })

  it('noktalı/noktasız i çifti her iki yönde korunur', () => {
    expect(upper('ılık')).toBe('ILIK')
    expect(lower('İLİK')).toBe('ilik')
  })

  it('sentenceCase yalnız ilk harfi büyütür', () => {
    expect(sentenceCase('imalat verimliliği')).toBe('İmalat verimliliği')
  })
})

describe('arama katlaması — §5.6', () => {
  it('Türkçe harfler ASCII karşılığına iner', () => {
    expect(foldForSearch('Ölçüm')).toBe('olcum')
    expect(foldForSearch('IĞDIR')).toBe('igdir')
    expect(foldForSearch('ŞİŞLİ')).toBe('sisli')
  })

  it('ı ve i AYNI hedefe katlanır — ayırmak aramayı bozar', () => {
    expect(foldForSearch('ılık')).toBe(foldForSearch('ilik'))
  })
})

describe('slug', () => {
  it('Türkçe harf, boşluk ve noktalama bırakmaz', () => {
    expect(slug('İstanbul’da Yazılım Çözümleri')).toBe('istanbul-da-yazilim-cozumleri')
    expect(slug('  ---Ağrı  İğne---  ')).toBe('agri-igne')
  })
})

describe('heceleme', () => {
  it('iki ünlü arasındaki tek ünsüz sonraki heceye gider', () => {
    expect(syllables('araba')).toEqual(['a', 'ra', 'ba'])
    expect(syllables('kalem')).toEqual(['ka', 'lem'])
  })

  it('iki ünsüz arasından bölünür', () => {
    expect(syllables('kartal')).toEqual(['kar', 'tal'])
  })

  it('üç ünsüzde ilk ikisi önceki hecede kalır', () => {
    expect(syllables('türkçe')).toEqual(['türk', 'çe'])
  })

  it('tek ünlülü kelime bölünmez', () => {
    expect(syllables('kırk')).toEqual(['kırk'])
    expect(syllables('')).toEqual([])
  })

  it('hecelerin birleşimi kelimenin kendisidir — harf kaybı yok', () => {
    for (const w of ['sürdürülebilirlik', 'ölçümlerinizi', 'İstanbul', 'ağrı', 'üretkenlik']) {
      expect(syllables(w).join('')).toBe(w)
    }
  })
})

describe('yumuşak tire — Chromium Türkçe heceleme bilmez (§7.2)', () => {
  const SH = '­'

  it('uzun kelimeye tire enjekte eder, kısa kelimeye etmez', () => {
    expect(softHyphenate('sürdürülebilirlik')).toContain(SH)
    expect(softHyphenate('ve bir')).not.toContain(SH)
  })

  it('tireler çıkarıldığında metin birebir aynıdır', () => {
    const metin = 'İmalat hatlarında ölçülemeyen kaybı görünür kılar'
    expect(softHyphenate(metin).split(SH).join('')).toBe(metin)
  })

  it('kenara iki harften yakın kırmaz', () => {
    for (const parca of softHyphenate('üretkenlik').split(SH)) {
      expect(parca.length).toBeGreaterThanOrEqual(2)
    }
  })
})
