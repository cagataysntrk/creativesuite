import { describe, expect, it } from 'vitest'
import {
  deltaE2000,
  deltaEHex,
  parseColor,
  parseHex,
  parseOklch,
  rgbToLab,
  type Lab,
} from './deltae.js'

const lab = (L: number, a: number, b: number): Lab => ({ L, a, b })

/**
 * Sharma, Wu & Dalal (2005) referans çiftleri — CIEDE2000'in yayınlanmış test verisi.
 *
 * Kendi matematiğimize kendi beklentimizi yazmak hiçbir şey kanıtlamaz: yanlış bir
 * formül, ondan türetilmiş bir beklentiyi her zaman karşılar. Bağımsız bir kaynağın
 * sayısını üretmek, doğruluğun tek kanıtı.
 */
const REFERANS: readonly (readonly [Lab, Lab, number])[] = [
  [lab(50, 2.6772, -79.7751), lab(50, 0, -82.7485), 2.0425],
  [lab(50, 3.1571, -77.2803), lab(50, 0, -82.7485), 2.8615],
  [lab(50, 2.8361, -74.02), lab(50, 0, -82.7485), 3.4412],
  [lab(50, -1.3802, -84.2814), lab(50, 0, -82.7485), 1.0],
  [lab(50, -1.1848, -84.8006), lab(50, 0, -82.7485), 1.0],
  [lab(50, -0.9009, -85.5211), lab(50, 0, -82.7485), 1.0],
  [lab(50, 0, 0), lab(50, -1, 2), 2.3669],
  [lab(50, -1, 2), lab(50, 0, 0), 2.3669],
  [lab(50, 2.49, -0.001), lab(50, -2.49, 0.0009), 7.1792],
  [lab(50, 2.49, -0.001), lab(50, -2.49, 0.001), 7.1792],
  [lab(50, 2.5, 0), lab(50, 0, -2.5), 4.3065],
  [lab(50, 2.5, 0), lab(73, 25, -18), 27.1492],
  [lab(50, 2.5, 0), lab(61, -5, 29), 22.8977],
  [lab(50, 2.5, 0), lab(56, -27, -3), 31.903],
  [lab(50, 2.5, 0), lab(58, 24, 15), 19.4535],
  [lab(50, 2.5, 0), lab(50, 3.1736, 0.5854), 1.0],
  [lab(50, 2.5, 0), lab(50, 3.2972, 0), 1.0],
  [lab(50, 2.5, 0), lab(50, 1.8634, 0.5757), 1.0],
  [lab(50, 2.5, 0), lab(50, 3.2592, 0.335), 1.0],
  [lab(60.2574, -34.0099, 36.2677), lab(60.4626, -34.1751, 39.4387), 1.2644],
  [lab(2.0776, 0.0795, -1.135), lab(0.9033, -0.0636, -0.5514), 0.9082],
]

describe('CIEDE2000 — bağımsız referans verisi', () => {
  it.each(REFERANS.map((r, i) => [i, ...r] as const))(
    'çift #%i → ΔE %#3$s',
    (_i, a, b, beklenen) => {
      expect(deltaE2000(a, b)).toBeCloseTo(beklenen, 4)
    }
  )

  it('simetrik: ΔE(a,b) = ΔE(b,a)', () => {
    for (const [a, b] of REFERANS) {
      expect(deltaE2000(a, b)).toBeCloseTo(deltaE2000(b, a), 10)
    }
  })

  it('özdeşlik sıfır', () => {
    for (const [a] of REFERANS) expect(deltaE2000(a, a)).toBe(0)
  })

  it('nötr gri ile nötr gri: ton TANIMSIZ ama fark hesaplanabiliyor', () => {
    // `C\' = 0` olduğunda ton tanımsızdır. Sıfır kabul eden bir implementasyon nötr
    // griyi her renkten uzak gösterir ve palet payı ölçümü çöker.
    expect(deltaE2000(lab(50, 0, 0), lab(60, 0, 0))).toBeGreaterThan(0)
    expect(Number.isFinite(deltaE2000(lab(50, 0, 0), lab(60, 0, 0)))).toBe(true)
  })

  it('ton sarmalaması: 350° ile 10° arası 20°dir, 340° değil', () => {
    const a = { L: 50, a: 40, b: -7 } // ~350°
    const b = { L: 50, a: 40, b: 7 } // ~10°
    const yakin = deltaE2000(a, b)
    // Karşılaştırma noktası: gerçekten ters tondaki (180°) bir renk.
    const ters = deltaE2000(a, { L: 50, a: -40, b: 7 })
    // 20°lik fark, 180°lik farkın küçük bir kesri olmalı. Sarmalama olmasaydı
    // 340° hesaplanır ve ikisi birbirine yakın çıkardı — kural sessizce ölürdü.
    expect(yakin).toBeLessThan(ters / 5)
    expect(yakin).toBeCloseTo(7.7324, 3)
  })
})

describe('sRGB → Lab', () => {
  it('beyaz L=100, siyah L=0', () => {
    expect(rgbToLab({ r: 255, g: 255, b: 255 }).L).toBeCloseTo(100, 3)
    expect(rgbToLab({ r: 0, g: 0, b: 0 }).L).toBeCloseTo(0, 6)
  })

  it('nötr gri a=b=0', () => {
    const g = rgbToLab({ r: 128, g: 128, b: 128 })
    expect(g.a).toBeCloseTo(0, 3)
    expect(g.b).toBeCloseTo(0, 3)
  })

  it('bilinen sRGB birincilleri', () => {
    // Kırmızı #FF0000 → L≈53.24, a≈80.09, b≈67.20 (D65)
    const k = rgbToLab({ r: 255, g: 0, b: 0 })
    expect(k.L).toBeCloseTo(53.24, 1)
    expect(k.a).toBeCloseTo(80.09, 1)
    expect(k.b).toBeCloseTo(67.2, 1)
  })
})

describe('hex ayrıştırma', () => {
  it('# ile ve # olmadan', () => {
    expect(parseHex('#0091FF')).toEqual({ r: 0, g: 145, b: 255 })
    expect(parseHex('0091ff')).toEqual({ r: 0, g: 145, b: 255 })
  })

  it('geçersiz hex `null` — sessizce siyaha düşmüyor', () => {
    // Siyaha düşseydi bozuk bir token, paletle "mükemmel uyumlu" bir siyah olurdu.
    for (const k of ['#GGG', '#12345', 'mavi', '', '#0091FF00']) {
      expect(parseHex(k), k).toBeNull()
    }
    expect(deltaEHex('#0091FF', 'mavi')).toBeNull()
  })

  it('aynı hex ΔE 0', () => {
    expect(deltaEHex('#0091FF', '#0091ff')).toBe(0)
  })
})

describe('OKLCH — marka rampalarının biçimi (§12.1)', () => {
  it('uç noktalar: beyaz ve siyah', () => {
    expect(parseOklch('oklch(1 0 0)')).toEqual({ r: 255, g: 255, b: 255 })
    expect(parseOklch('oklch(0 0 0)')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('sRGB kırmızısının OKLCH karşılığı TAM dönüyor', () => {
    // Yayınlanmış referans: `#FF0000` = oklch(0.628 0.2577 29.23). Kendi
    // matematiğimize kendi beklentimizi yazmak yerine bilinen bir eşleşme.
    expect(parseOklch('oklch(0.628 0.2577 29.23)')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('yüzdeli açıklık kabul ediliyor', () => {
    expect(parseOklch('oklch(100% 0 0)')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('gam DIŞI değer KIRPILIYOR — negatif ışık yok', () => {
    const r = parseOklch('oklch(0.5 0.9 140)')
    expect(r).not.toBeNull()
    if (r === null) return
    for (const k of [r.r, r.g, r.b]) {
      expect(k).toBeGreaterThanOrEqual(0)
      expect(k).toBeLessThanOrEqual(255)
    }
  })

  it('geçersiz OKLCH `null` — sessizce siyaha düşmüyor', () => {
    for (const k of ['oklch()', 'oklch(a b c)', 'rgb(1,2,3)', '']) {
      expect(parseOklch(k), k).toBeNull()
    }
  })

  it('`parseColor` hem hex hem OKLCH okuyor', () => {
    expect(parseColor('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseColor('oklch(0.628 0.2577 29.23)')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseColor('mavi')).toBeNull()
  })

  it('aynı rengin iki gösterimi arasında ΔE ~0', () => {
    // Bu, dönüşümün gerçekten doğru olduğunun en sıkı testi: iki farklı yoldan
    // gelen aynı renk, algısal olarak AYNI çıkmalı.
    const a = parseColor('#FF0000')
    const b = parseColor('oklch(0.628 0.2577 29.23)')
    expect(a).not.toBeNull()
    expect(b).not.toBeNull()
    if (a === null || b === null) return
    expect(deltaE2000(rgbToLab(a), rgbToLab(b))).toBeLessThan(0.5)
  })
})
