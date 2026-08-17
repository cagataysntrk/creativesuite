// Hikâye yayının değişmezleri (§7.2 · FAZ-14.1).

import { describe, expect, it } from 'vitest'
import {
  ISLEVLER,
  islevTavanlari,
  slaytIslevi,
  VARSAYILAN_RITIM,
  yay,
  yayiDogrula,
  yayTalimati,
} from './senaryo.js'

describe('hikâye yayı', () => {
  it('UÇLAR sabit, ORTA esnek — her uzunlukta aynı hikâye', () => {
    for (const n of [4, 5, 6, 7, 9]) {
      const y = yay(n)
      expect(y).toHaveLength(n)
      expect(y[0]).toBe('kanca')
      expect(y[n - 1]).toBe('davet')
      expect(y[1]).toBe('gerilim')
      expect(y[n - 2]).toBe('donus')
    }
  })

  it('dörtten kısa karosel bir hikâye DEĞİL', () => {
    // Kanca + davet iki slayt eder; arada hiçbir şey olmayan şey bir afiştir.
    expect(yay(2)).toEqual(['kanca', 'davet'])
    expect(yay(0)).toEqual([])
  })

  it('DETERMİNİSTİK', () => {
    for (let n = 0; n < 8; n += 1) expect(yay(6)).toEqual(yay(6))
  })

  it('RİTİM var — gövde işlevleri AYNI bütçeyi paylaşmıyor', () => {
    // Bu adımın varlık sebebi: dört gövde satırının dördü de 30 kelimeydi ve sonuç dört
    // eşit paragraftı. Bütçeler ayrışmazsa ritim de yoktur.
    const t = islevTavanlari()
    expect(t.gerilim).toBeLessThan(t.kanit)
    expect(t.donus).toBeLessThan(t.gerilim)
    expect(t.kanca).toBeLessThan(t.donus)
    expect(new Set([t.kanca, t.gerilim, t.kanit, t.donus, t.davet]).size).toBe(5)
  })

  it('ölçülen tabanlar KORUNDU — yeni sayı uydurulmadı', () => {
    // 8 / 30 / 14 zaten ölçülmüştü (tip-ölçeği ve mevcut prompt). Yay onları taşıdı,
    // değiştirmedi; yalnız aradaki iki işlev ORAN olarak türetildi.
    const t = islevTavanlari()
    expect(t.kanca).toBe(8)
    expect(t.kanit).toBe(30)
    expect(t.davet).toBe(14)
  })

  it('ritim bir PARAMETRE — aile kendi ritmini kurabilir (D-262)', () => {
    const duz = islevTavanlari({ gerilim: 1, donus: 1 })
    expect(duz.gerilim).toBe(duz.kanit)
    expect(islevTavanlari(VARSAYILAN_RITIM).gerilim).toBeLessThan(duz.gerilim)
  })

  it('talimat bütçeleri KENDİ yazmıyor, tavanlardan basıyor', () => {
    const t = islevTavanlari()
    const satirlar = yayTalimati(6)
    expect(satirlar).toHaveLength(6)
    for (const [i, s] of satirlar.entries()) {
      const islev = yay(6)[i]
      expect(s).toContain(`EN FAZLA ${t[islev as keyof typeof t]} KELİME`)
    }
  })

  it('doğrulama BÜTÇE aşımını yakalıyor — işlevin KENDİ bütçesiyle', () => {
    const kisa = 'iki kelime'
    const uzun = Array.from({ length: 25 }, () => 'kelime').join(' ')
    // 25 kelime: `kanit` (30) için meşru, `gerilim` (21) için aşım.
    const b = yayiDogrula(['Kanca burada', uzun, kisa, kisa, kisa, kisa])
    expect(b.filter((x) => x.islev === 'gerilim' && x.sebep === 'butce')).toHaveLength(1)
    const c = yayiDogrula(['Kanca burada', kisa, uzun, kisa, kisa, kisa])
    expect(c.filter((x) => x.sebep === 'butce')).toHaveLength(0)
  })

  it('KANCA nokta ile bitmez', () => {
    const k = 'iki kelime'
    expect(yayiDogrula(['Bir iddia.', k, k, k, k, k]).some((x) => x.sebep === 'kanca-nokta')).toBe(
      true
    )
    expect(yayiDogrula(['Bir iddia', k, k, k, k, k]).some((x) => x.sebep === 'kanca-nokta')).toBe(
      false
    )
  })

  it('boş satır bulgu üretiyor', () => {
    const k = 'iki kelime'
    expect(yayiDogrula(['Kanca', '   ', k, k, k, k]).some((x) => x.sebep === 'bos')).toBe(true)
  })

  it('slaytIslevi indeksten çözüyor, dağarcık KAPALI', () => {
    expect(slaytIslevi(0, 6)).toBe('kanca')
    expect(slaytIslevi(5, 6)).toBe('davet')
    expect(slaytIslevi(9, 6)).toBeNull()
    for (let i = 0; i < 6; i += 1) expect(ISLEVLER).toContain(slaytIslevi(i, 6))
  })
})
