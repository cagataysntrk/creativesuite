import { describe, expect, it } from 'vitest'
import { addMoney, MICROS_PER_USD, usd, ZERO_USD } from './money.js'

describe('Money — USD mikro bigint (D-36)', () => {
  it('1 dolar 1.000.000 mikrodur', () => {
    expect(usd(MICROS_PER_USD).micros).toBe(1_000_000n)
  })

  it('görsel başına $0.0035 hassasiyet kaybetmez', () => {
    // Kuruş cinsinden bu 0.35 kuruş eder ve TAM SAYIYA yuvarlanırdı; float'ta ise
    // 10.000 kez toplandığında sapardı. Mikro-birimde ikisi de olmaz.
    const gorsel = usd(3_500n)
    let toplam = ZERO_USD
    for (let i = 0; i < 10_000; i++) toplam = addMoney(toplam, gorsel)
    expect(toplam.micros).toBe(35_000_000n) // tam olarak $35.00
  })

  it('float toplama aynı işlemde sapar — mikro-birimin varlık sebebi', () => {
    let floatToplam = 0
    for (let i = 0; i < 10_000; i++) floatToplam += 0.0035
    expect(floatToplam).not.toBe(35)
    expect(Math.abs(floatToplam - 35)).toBeGreaterThan(0)
  })

  it('sıfır para birimi taşır', () => {
    expect(ZERO_USD).toEqual({ micros: 0n, currency: 'USD' })
  })
})
