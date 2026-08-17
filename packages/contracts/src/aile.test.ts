// Kompozisyon ailesi: kapalı GARANTİ, açık AİLE (§7.1 · FAZ-12.7).

import { describe, expect, it } from 'vitest'
import { AILELER, TEMEL_AILE, aileBul, aileKusurlari, type AileProfili } from './aile.js'

describe('kompozisyon ailesi', () => {
  it('GARANTİ alanları ailede YOK — gevşetilecek şey yok', () => {
    // ⚠ En ucuz zorlama: denetim değil YOKLUK. Güvenli alan, kontrast eşiği, chroma
    // tavanı ve kelime bütçesi bu arayüzde bulunmuyor; "yeni aile" onları söyleyemez.
    const anahtarlar = Object.keys(TEMEL_AILE)
    for (const yasak of [
      'guvenliAlan',
      'kontrastEsigi',
      'chromaTavani',
      'kelimeButcesi',
      'bantSiniri',
    ])
      expect(anahtarlar).not.toContain(yasak)
  })

  it('yalnız ESTETİK parametreler taşınıyor', () => {
    expect(Object.keys(TEMEL_AILE).sort()).toEqual(
      [
        'ad',
        'degrade',
        'id',
        'panorama',
        'ritim',
        'suslemeYogunlugu',
        'tipoEfektleri',
        'vinyetGucu',
        'yuvaBicimi',
      ].sort()
    )
  })

  it('temel ailenin değerleri ÖLÇÜLEREK seçildi', () => {
    // vinyet 0: 0.1'de amber alan 215→229 arası değişiyordu, düz olması gereken alan
    // degradeye dönüyordu. degrade kapalı: aynı sebep.
    expect(TEMEL_AILE.vinyetGucu).toBe(0)
    expect(TEMEL_AILE.degrade).toBe(false)
    expect(TEMEL_AILE.suslemeYogunlugu).toBe(0.25)
  })

  it('kapalı tipografi efektleri ailede AÇIK değil', () => {
    // gölge/degrade/knockout: referansların dördü de düz tipografi; knockout'un çözdüğü
    // sorun bu ailede yok (metin eğri sınırını hiç geçmiyor).
    expect(TEMEL_AILE.tipoEfektleri).toEqual(['vurgu', 'kontur'])
  })

  it('geçersiz aralık yakalanıyor', () => {
    const bozuk: AileProfili = { ...TEMEL_AILE, suslemeYogunlugu: 1.4 }
    expect(aileKusurlari(bozuk).some((k) => k.sebep === 'gecersiz-aralik')).toBe(true)
    expect(aileKusurlari(TEMEL_AILE)).toEqual([])
  })

  it('aile VERİ — kayıttan bulunuyor', () => {
    expect(aileBul('temel')).toBe(TEMEL_AILE)
    expect(aileBul('yok')).toBeNull()
    expect(AILELER).toHaveLength(1) // ikinci aile bir referans talep edince açılır
  })
})
