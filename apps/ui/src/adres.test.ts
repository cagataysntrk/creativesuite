// Adres çözümlemesi — sayfaların URL'i (§12.4).
//
// ⚠ ⚠ **SAYFALARIN ADRESİ HİÇ YOKTU.** Depo sahibi: *"sayfalar url'siz olduğundan
// tazelenince kayboluyor, geri gelince anasayfaya gidiyor"*. Bir panelde en sık yapılan
// iki şey bir bağlantıyı paylaşmak ve F5'e basmaktır; ikisi de çalışmıyordu.

import { describe, expect, it } from 'vitest'
import { adresKur, adresiCoz } from './adres.js'

const ile = (hash: string): ReturnType<typeof adresiCoz> => adresiCoz(hash)

describe('adres → ekran', () => {
  it('bilinen ekran adı çözülüyor', () => {
    expect(ile('#/gecmis').ekran).toBe('gecmis')
  })

  it('koşu adresi KİMLİĞİ taşıyor', () => {
    const a = ile('#/kosu/run_01a018ef-b011-7cbc-9b5c-f38c7b0ce655')
    expect(a.ekran).toBe('kosu')
    expect(a.arg).toBe('run_01a018ef-b011-7cbc-9b5c-f38c7b0ce655')
  })

  it('bilinmeyen ad GİRİŞE düşüyor — uydurma bir ekran açılmıyor', () => {
    expect(ile('#/yok-boyle-ekran').ekran).toBe('giris')
    expect(ile('').ekran).toBe('giris')
  })
})

describe('ekran → adres', () => {
  it('koşu ve hat ARGÜMAN taşıyor, ötekiler tek parça', () => {
    expect(adresKur('kosu', 'run_x', 'instagram-post')).toBe('#/kosu/run_x')
    expect(adresKur('calistir', null, 'instagram-karosel')).toBe('#/calistir/instagram-karosel')
    expect(adresKur('gecmis', null, 'instagram-post')).toBe('#/gecmis')
  })

  it('gidiş-dönüş AYNI yeri veriyor', () => {
    for (const [e, k] of [
      ['kosu', 'run_01a018ef-b011-7cbc-9b5c-f38c7b0ce655'],
      ['gecmis', null],
    ] as const) {
      const a = adresiCoz(adresKur(e, k, 'instagram-post'))
      expect(a.ekran).toBe(e)
      expect(a.arg).toBe(k)
    }
  })
})
