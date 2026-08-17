// Kompozisyon ailesi: kapalı GARANTİ, açık AİLE (§7.1 · FAZ-12.7).

import { describe, expect, it } from 'vitest'
import {
  AILELER,
  AKICI_AILE,
  TEMEL_AILE,
  aileBul,
  aileKusurlari,
  type AileProfili,
} from './aile.js'

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
        'alan',
        'degrade',
        'gorselIslemleri',
        'hayalet',
        'id',
        'iskelet',
        'sinir',
        'suslemeTipleri',
        'tipoPayi',
        'yerlesim',
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
    expect(AILELER.length).toBeGreaterThanOrEqual(1)
  })
})

describe('akıcı aile — ikinci aile', () => {
  it('KANITTAN doğdu: `temel`de kapatılan üç yeteneği kullanıyor', () => {
    // Panorama, yoğun süsleme ve farklı ritim `temel`de bakarak kapatılmıştı. Üç kapalı
    // yetenek biriktiğinde ortaya çıkan şey eksik bir aile değil, İKİNCİ bir ailedir.
    expect(AKICI_AILE.panorama).toBe(true)
    expect(TEMEL_AILE.panorama).toBe(false)
    expect(AKICI_AILE.suslemeYogunlugu).toBeGreaterThan(TEMEL_AILE.suslemeYogunlugu)
  })

  it('garanti katmanı burada da YOK', () => {
    expect(Object.keys(AKICI_AILE).sort()).toEqual(Object.keys(TEMEL_AILE).sort())
  })

  it('sekiz aile de geçerli ve kayıtta', () => {
    expect(aileKusurlari(AKICI_AILE)).toEqual([])
    // ⚠ Sekiz aile: beşi referanslardan ÖLÇÜLDÜ, ikisi karardan doğdu, biri (`akici`)
    // kapalı yeteneklerin birikmesinden. Sayı bir hedef değil bir sonuç.
    expect(AILELER.length).toBeGreaterThanOrEqual(7)
    expect(aileBul('akici')).toBe(AKICI_AILE)
  })
})
