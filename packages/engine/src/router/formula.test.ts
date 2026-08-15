import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { evaluateFormula } from './formula.js'

const KACIS = JSON.parse(
  readFileSync(
    join(import.meta.dirname, '../../test-fixtures/formula-kacis-denemeleri.json'),
    'utf8'
  )
) as { hepsi_reddedilmeli: string[] }

const mikro = (f: string, p: Record<string, number> = {}): bigint | string => {
  const r = evaluateFormula(f, p)
  return r.ok ? r.value.micros : r.error.kind
}

describe('aritmetik — float YOK (R-41)', () => {
  it('$0.025 × 4 görsel = $0.10, tam', () => {
    expect(mikro('0.025 * num_images', { num_images: 4 })).toBe(100_000n)
  })

  it('0.1 + 0.2 tam olarak 0.3 — float olsaydı olmazdı', () => {
    expect(mikro('0.1 + 0.2')).toBe(300_000n)
  })

  it('mikro altı hassasiyet YUKARI yuvarlanıyor — az göstermek tavanı deler', () => {
    // $0.0000004 → 1 mikro. Aşağı yuvarlansaydı 0 mikro olurdu ve bin çağrılık bir
    // çalıştırma bedava görünürdü.
    expect(mikro('0.0000004')).toBe(1n)
  })

  it('operatör önceliği doğru', () => {
    expect(mikro('2 + 3 * 4')).toBe(14_000_000n)
    expect(mikro('(2 + 3) * 4')).toBe(20_000_000n)
  })

  it('min/max/ceil/floor', () => {
    expect(mikro('min(3, 1, 2)')).toBe(1_000_000n)
    expect(mikro('max(3, 1, 2)')).toBe(3_000_000n)
    expect(mikro('ceil(1.2)')).toBe(2_000_000n)
    expect(mikro('floor(1.8)')).toBe(1_000_000n)
  })

  it('saniye başına GPU: ceil ile faturalanan süre', () => {
    expect(mikro('ceil(seconds) * 0.002', { seconds: 4.1 })).toBe(10_000n)
  })
})

describe('kapalı dilbilgisi — host yüzeyi YOK', () => {
  it('tanımsız değişken HATA, sıfır değil', () => {
    // Bu testin tersi tehlikeli: eksik parametre sessizce 0 sayılsaydı ücretli bir
    // çağrı bedava görünür ve bütçe kapısı onu geçirirdi.
    expect(mikro('0.02 * adet')).toBe('unknown_identifier')
  })

  it('kaçış denemelerinin HEPSİ reddediliyor', () => {
    // Girdi listesi `test-fixtures/formula-kacis-denemeleri.json`'da: düşmanca dizeler
    // VERİDİR, kod değil. Kaynağa gömüldüklerinde `chokepoints` kapısı `fetch(` ve
    // `process.env` desenlerini haklı olarak yakalıyordu — kapıyı gevşetmek yerine
    // veriyi doğru yere koymak, kuralın kendisine saygı duymanın yolu.
    for (const kotu of KACIS.hepsi_reddedilmeli) {
      expect(evaluateFormula(kotu, { x: 1, a: 1 }).ok, kotu).toBe(false)
    }
  })

  it('bilinmeyen fonksiyon reddediliyor', () => {
    expect(mikro('eval(1)')).toBe('unknown_function')
  })

  it('sıfıra bölme yakalanıyor', () => {
    expect(mikro('1 / steps', { steps: 0 })).toBe('division_by_zero')
  })

  it('negatif maliyet reddediliyor — para iade eden formül yok', () => {
    expect(mikro('0.01 - 0.02')).toBe('negative_cost')
  })

  it('kapanmayan parantez sözdizimi hatası', () => {
    expect(mikro('(1 + 2')).toBe('syntax')
  })

  it('döngü YAZILAMIYOR — deadline gerekmemesinin sebebi bu', () => {
    expect(evaluateFormula('while(1){}', {}).ok).toBe(false)
    expect(evaluateFormula('for(;;);', {}).ok).toBe(false)
  })
})
