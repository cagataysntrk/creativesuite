// DİZİN BÜTÜNLÜĞÜ — bir dizin, BÜTÜNÜ gösterip nerede olduğunu söyler (FAZ-19.7).
//
// ⚠ ⚠ **DENETİM: "dört adımlık dizin her karede TEK satır gösteriyor — dizin hiçbir
// yerde bir arada görünmüyor."** Veride birebir öyleydi: dört kartın üçünde tek maddelik
// liste, dördüncüsünde hiç liste yok, onun yerine çip satırı vardı. Yalnız o anki maddeyi
// gösteren şey bir dizin DEĞİLDİR; dizin bütünü gösterip içinde nerede olduğunu
// söyleyendir.
//
// ⚠ Test bir SAYIYI değil bir BÜTÜNLÜĞÜ sınıyor: her kart aynı maddeleri aynı sırada
// taşımalı ve tam biri yanık olmalı. Sıra kayarsa "dizin" iki farklı şeyi anlatır.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

describe('dizin bütünlüğü', () => {
  const o = ORNEKLER['dizin']

  it('örnek var', () => {
    expect(o).toBeDefined()
  })

  it('HER kart dizinin TAMAMINI taşıyor — aynı maddeler, aynı sıra', () => {
    if (o === undefined) return
    const listeler = o.kartlar.map((k) =>
      k.panel !== null && k.panel?.tip === 'liste'
        ? k.panel.ogeler.map((x) => x.no).join('·')
        : null
    )
    for (const [i, l] of listeler.entries())
      expect(l, `${String(i + 1)}. kart liste taşımıyor`).not.toBeNull()
    expect(new Set(listeler).size, `kartlar farklı listeler taşıyor: ${listeler.join(' | ')}`).toBe(
      1
    )
    expect(listeler[0]).toBe('01·02·03·04')
  })

  // ⚠ TAM BİRİ yanık: sıfırsa "neredeyim" cevapsız, ikisi varsa cevap yalan.
  it('her kartta TAM BİR madde yanık', () => {
    if (o === undefined) return
    o.kartlar.forEach((k, i) => {
      if (k.panel === null || k.panel?.tip !== 'liste') return
      const yanik = k.panel.ogeler.filter((x) => x.aktif === true).length
      expect(yanik, `${String(i + 1)}. kartta ${String(yanik)} madde yanık`).toBe(1)
    })
  })

  // ⚠ Yanık madde kartın SIRASIYLA ilerlemeli: 1. kartta 01, 2. kartta 02… Yoksa dizin
  // ilerlemiyor, yalnız yanıp sönüyor.
  it('yanık madde kart sırasıyla İLERLİYOR', () => {
    if (o === undefined) return
    o.kartlar.forEach((k, i) => {
      if (k.panel === null || k.panel?.tip !== 'liste') return
      const yanik = k.panel.ogeler.findIndex((x) => x.aktif === true)
      expect(yanik, `${String(i + 1)}. kartta yanık madde ${String(yanik + 1)}. sırada`).toBe(i)
    })
  })
})
