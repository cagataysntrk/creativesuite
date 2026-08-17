// Süsleme dağarcığının değişmezleri (§7.1 · FAZ-11.2).

import { describe, expect, it } from 'vitest'
import type { SlaytKimligi } from '@suite/kernel'
import {
  suslemeler,
  suslemeSvg,
  SUSLEME_TIPLERI,
  YOGUNLUK_SEYREK,
  YOGUNLUK_YOGUN,
} from './sablon-susleme.js'
import { guvenliMetinYuzdesi } from './sablon.js'

const k = (index: number, role: SlaytKimligi['role'] = 'govde'): SlaytKimligi => ({
  role,
  index,
  total: 6,
})

describe('süsleme dağarcığı', () => {
  it('METİN SÜTUNUNA girmiyor — iki yönde de', () => {
    // Bu fazın varlık sebebi "oraya ait olmayan öge"yi kaldırmaktı; süslemenin metne
    // girmesi aynı hatayı yeni bir kılıkta geri getirirdi.
    for (let i = 0; i < 12; i += 1) {
      for (const sagda of [true, false]) {
        for (const s of suslemeler(k(i), sagda)) {
          const sol = s.x - s.boyut / 2
          const sag = s.x + s.boyut / 2
          if (sagda) expect(sol).toBeGreaterThan(guvenliMetinYuzdesi)
          else expect(sag).toBeLessThan(100 - guvenliMetinYuzdesi)
        }
      }
    }
  })

  it('tuval DIŞINA taşmıyor', () => {
    for (let i = 0; i < 12; i += 1)
      for (const sagda of [true, false])
        for (const s of suslemeler(k(i), sagda)) {
          expect(s.x - s.boyut / 2).toBeGreaterThanOrEqual(0)
          expect(s.x + s.boyut / 2).toBeLessThanOrEqual(100)
        }
  })

  it('KAPAK süssüz — ızgarada ilk kare bir cümledir', () => {
    expect(suslemeler(k(0, 'kapak'), true)).toHaveLength(0)
    expect(suslemeler(k(0, 'tek'), true)).toHaveLength(0)
  })

  it('slayt başına EN FAZLA iki öge', () => {
    for (let i = 0; i < 12; i += 1) expect(suslemeler(k(i), true).length).toBeLessThanOrEqual(2)
  })

  it('DETERMİNİSTİK — aynı slayt hep aynı süsleme', () => {
    const ilk = JSON.stringify(suslemeler(k(3), true))
    for (let n = 0; n < 10; n += 1) expect(JSON.stringify(suslemeler(k(3), true))).toBe(ilk)
  })

  it('yalnız KAPALI dağarcıktan öge çıkıyor', () => {
    for (let i = 0; i < 12; i += 1)
      for (const s of suslemeler(k(i), true)) expect(SUSLEME_TIPLERI).toContain(s.tip)
  })

  it('her tip GEÇERLİ svg üretiyor ve rengi token`dan alıyor', () => {
    for (const tip of SUSLEME_TIPLERI) {
      const svg = suslemeSvg(
        { tip, x: 80, y: 30, boyut: 12, opaklik: 0.5, yogunluk: YOGUNLUK_SEYREK },
        'var(--role-text)'
      )
      expect(svg).toContain('var(--role-text)')
      expect(svg.length).toBeGreaterThan(20)
    }
  })

  it('tarama daireyi TAM kaplıyor — kama değil', () => {
    // İlk sürüm `x-r`den başlıyordu ve dairenin sol alt yarısı boş kalıyordu.
    const svg = suslemeSvg(
      { tip: 'tarama', x: 80, y: 30, boyut: 12, opaklik: 0.5, yogunluk: YOGUNLUK_SEYREK },
      '#000'
    )
    const ilkX = Number(/x1="([\d.-]+)"/.exec(svg)?.[1] ?? 0)
    expect(ilkX).toBeLessThanOrEqual(80 - 12) // en az 2r kadar solda başlamalı
  })

  it('YOĞUNLUK bir parametre — sabit değil (D-262)', () => {
    // Aynı şekil, iki aile. Seyrek olan bizim kâğıt alanımız için doğru; yoğun olanı
    // koyu zeminli bir kompozisyonda doğru olur. Şekil kapalı, parametresi açık.
    const g = (y: number) =>
      suslemeSvg({ tip: 'tarama', x: 80, y: 30, boyut: 12, opaklik: 0.5, yogunluk: y }, '#000')
    const seyrek = g(YOGUNLUK_SEYREK)
    const yogun = g(YOGUNLUK_YOGUN)
    const say = (s: string) => (s.match(/<line/g) ?? []).length
    expect(say(yogun)).toBeGreaterThan(say(seyrek))
    // Kalınlık da yoğunlukla artıyor: seyrekte ince çizgi, yoğunda kalın.
    const kal = (s: string) => Number(/stroke-width="([\d.]+)"/.exec(s)?.[1] ?? 0)
    expect(kal(yogun)).toBeGreaterThan(kal(seyrek))
  })

  it('her yoğunlukta tarama daireyi TAM kaplıyor', () => {
    // Aralık `adet`ten türediği için ölçek değişince kapsama bozulabilirdi.
    for (const y of [0, 0.25, 0.5, 0.9, 1]) {
      const svg = suslemeSvg(
        { tip: 'tarama', x: 80, y: 30, boyut: 12, opaklik: 0.5, yogunluk: y },
        '#000'
      )
      const xs = [...svg.matchAll(/x1="([\d.-]+)"/g)].map((m) => Number(m[1]))
      expect(Math.min(...xs)).toBeLessThanOrEqual(80 - 12)
      expect(Math.max(...xs)).toBeGreaterThanOrEqual(80 - 0.5)
    }
  })
})
