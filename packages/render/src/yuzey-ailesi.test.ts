// YÜZEY AİLELERİ — beş ad, BEŞ doku (FAZ-19.4).
//
// ⚠ ⚠ **DENETİMİN EN SERT BULGUSU: "on şablon, üç zemin".** Katalog *"editoryal — sıcak
// kâğıt"*, *"kavis — beton"* yazıyordu; render ikisini de aynı düz mürekkeple çiziyordu.
// Bu test adların ARKASINDA gerçekten farklı bir mekanizma olduğunu sınıyor — pikseli
// değil, üretilen katman reçetesini: frekans, oktav, döşeme boyu, karışım kipi.
//
// ⚠ Ölçülen imzalar (`derived/izgara`, çok ölçekli σ + anizotropi), kayıt `OLCUMLER.md`:
//   düz gren 2,26 · kâğıt 4,72 · taş 5,10 · beton 5,00 · halftone 10,00
//   çelik σ 1,88 ama **yatay/dikey 0,69** — tek yönlü olan o.

import { describe, expect, it } from 'vitest'
import { YUZEYLER, yuzeyKatmanlari, type Yuzey } from './zemin.js'

const hepsi = (y: Yuzey): string => yuzeyKatmanlari(y, 35).katmanlar.join(' | ')

describe('yüzey aileleri', () => {
  it('beş aile — kapalı dağarcık', () => {
    expect([...YUZEYLER].sort()).toEqual(['beton', 'celik', 'halftone', 'kagit', 'tas'])
  })

  // ⚠ ⚠ **ASIL İDDİA BU.** Beş ad beş ayrı reçete üretmiyorsa isim değişikliğinden
  // ibarettir — denetimin bulduğu hatanın ta kendisi.
  it('her ailenin katman reçetesi BAŞKA', () => {
    const receteler = YUZEYLER.map(hepsi)
    expect(new Set(receteler).size, 'iki aile aynı dokuyu üretiyor').toBe(YUZEYLER.length)
  })

  // ⚠ Fırçalanmış metalin imzası YÖN taşımasıdır. Tek değerli bir `baseFrequency` her
  // zaman yönsüz bir bulut üretir; iki değerli olan yalnız `celik` olmalı.
  it('YÖNLÜ doku yalnız `celik`te — anizotropi tek değerle imkânsız', () => {
    for (const y of YUZEYLER) {
      const ikiDegerli = /baseFrequency='[\d.]+ [\d.]+'/.test(hepsi(y))
      expect(ikiDegerli, `${y}: yönlü doku`).toBe(y === 'celik')
    }
  })

  // ⚠ Tram bir GÜRÜLTÜ değil bir IZGARA: `feTurbulence` değil nokta dizisi.
  it('NOKTA IZGARASI yalnız `halftone`da — gürültü değil tram', () => {
    for (const y of YUZEYLER) {
      expect(hepsi(y).includes('radial-gradient'), `${y}: nokta ızgarası`).toBe(y === 'halftone')
    }
  })

  // ⚠ ⚠ **KABALIK OPAKLIKTAN DEĞİL TANE BOYUNDAN GELİR.** Beton ile taş aynı frekansta
  // çizilince ölçüm ikisini ayırt edemedi (σ 5,19 / 5,10) ve opaklık zaten tavandaydı.
  // Betonun döşemesi en iri olan olmalı.
  it('en İRİ tane `beton`da — kabalık frekanstan geliyor', () => {
    const ince = (y: Yuzey): number => {
      const m = /baseFrequency='([\d.]+)'/.exec(hepsi(y))
      return m === null ? 1 : Number(m[1])
    }
    for (const y of YUZEYLER) {
      if (y === 'beton' || y === 'celik' || y === 'halftone') continue
      expect(ince('beton'), `beton, ${y}'dan iri taneli olmalı`).toBeLessThan(ince(y))
    }
  })

  // ⚠ Hiçbir frekans bileşeni TAM SAYI olamaz (R-85 sınıfı): Perlin kafesi piksel
  // ızgarasına oturur ve doku HATA VERMEDEN ölür.
  it('hiçbir frekans TAM SAYI değil — tam sayıda doku sessizce ölür', () => {
    for (const y of YUZEYLER)
      for (const m of hepsi(y).matchAll(/baseFrequency='([\d. ]+)'/g))
        for (const par of (m[1] ?? '').trim().split(/\s+/))
          expect(Number.isInteger(Number(par)), `${y}: baseFrequency ${par}`).toBe(false)
  })
})
