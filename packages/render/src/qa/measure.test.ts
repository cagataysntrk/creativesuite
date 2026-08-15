import { describe, expect, it } from 'vitest'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { parseHex, type Rgb } from './deltae.js'
import {
  DEFAULT_LIMITS,
  aspectDeviation,
  measure,
  nearestDeltaE,
  paletteToLab,
  pixelStats,
  textCoverage,
} from './measure.js'
import { formatReading, formatReport, reading } from './tolerance.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const belge = (over: Partial<DocumentModel> = {}): DocumentModel => ({
  kind: 'post',
  width: 1080,
  height: 1350,
  tokenCss: ':root{}',
  stamp: DAMGA,
  blocks: [{ type: 'heading', text: 'Ölçemediğiniz fireyi yönetemezsiniz', level: 1 }],
  ...over,
})

const PALET = { colors: ['#0091FF', '#101418', '#F2F4F7'] }
const px = (hex: string): Rgb => parseHex(hex) ?? { r: 0, g: 0, b: 0 }

describe('palet mesafesi', () => {
  it('paletteki renk sıfır mesafede', () => {
    expect(nearestDeltaE(px('#0091FF'), paletteToLab(PALET))).toBe(0)
  })

  it('EN YAKIN üye seçiliyor, ilk üye değil', () => {
    // Beyaza yakın bir piksel, listede üçüncü olan `#F2F4F7`ye eşlenmeli.
    const d = nearestDeltaE(px('#F0F2F5'), paletteToLab(PALET)) ?? 99
    expect(d).toBeLessThan(2)
  })

  it('boş palette ölçüm YOK — sıfır değil `null`', () => {
    // Sıfır dönseydi "mükemmel uyum" demek olurdu ve hiçbir şey ölçülmediği anda
    // kapı yeşil yanardı.
    expect(nearestDeltaE(px('#FF0000'), [])).toBeNull()
    expect(pixelStats([px('#FF0000')], [], 5)).toBeNull()
  })

  it('geçersiz hex paletten DÜŞÜYOR, siyaha dönüşmüyor', () => {
    const lab = paletteToLab({ colors: ['#0091FF', 'mavi', '#GGGGGG'] })
    expect(lab).toHaveLength(1)
  })
})

describe('piksel istatistiği', () => {
  it('tamamı palet içi görsel: ΔE 0, palet dışı %0', () => {
    const s = pixelStats([px('#0091FF'), px('#101418')], paletteToLab(PALET), 5)
    expect(s?.meanDeltaE).toBe(0)
    expect(s?.offPalettePercent).toBe(0)
  })

  it('yarısı palet dışı görsel: %50', () => {
    const s = pixelStats(
      [px('#0091FF'), px('#FF0000'), px('#101418'), px('#00FF00')],
      paletteToLab(PALET),
      5
    )
    expect(s?.offPalettePercent).toBe(50)
    expect(s?.meanDeltaE).toBeGreaterThan(10)
  })

  it('eşiğin ALTINDAKİ sapma palet dışı SAYILMIYOR', () => {
    // Gözle ayırt edilemeyen bir kayma ihlal değildir; sayılsaydı her JPEG artefaktı
    // kapıyı kırmızıya döndürür ve kapı kapatılırdı.
    const s = pixelStats([px('#0092FE')], paletteToLab(PALET), 5)
    expect(s?.offPalettePercent).toBe(0)
    expect(s?.meanDeltaE).toBeLessThan(5)
  })
})

describe('metin kaplama ve en-boy', () => {
  it('metin arttıkça kaplama artıyor', () => {
    const az = textCoverage(belge({ blocks: [{ type: 'body', text: 'kısa' }] }))
    const cok = textCoverage(belge({ blocks: [{ type: 'body', text: 'x'.repeat(600) }] }))
    expect(cok).toBeGreaterThan(az)
  })

  it('görsel ve boşluk blokları kaplama üretmiyor', () => {
    const c = textCoverage(
      belge({ blocks: [{ type: 'image', src: 'a.png', alt: 'a', decorative: false }] })
    )
    expect(c).toBe(0)
  })

  it('4:5 tuval hedefe tam oturuyor', () => {
    expect(aspectDeviation(1080, 1350, 0.8)).toBeCloseTo(0, 6)
  })

  it('1:1 tuval 4:5 hedefte SAPIYOR', () => {
    expect(aspectDeviation(1080, 1080, 0.8)).toBeCloseTo(25, 3)
  })

  it('sıfır yükseklik %100 sapma — bölme hatası değil', () => {
    expect(aspectDeviation(1080, 0, 0.8)).toBe(100)
  })
})

describe('tolerans okuması — rozet değil ÖLÇÜM', () => {
  const oku = (v: number) =>
    reading({
      metric: 'delta_e_2000',
      label: 'ΔE 2000',
      value: v,
      warn: 3,
      limit: 5,
      direction: 'lower',
      unit: '',
    })

  it('üç durum: içi, uyarı, dışı', () => {
    expect(oku(2.4).status).toBe('in')
    expect(oku(4.0).status).toBe('warn')
    expect(oku(6.0).status).toBe('out')
  })

  it('uyarı eşiği limitten AYRI — sürüklenme görünür', () => {
    // İkili "geçti/kaldı" olsaydı, tek tek hiçbir varlığın düşmediği ama ortalamanın
    // limite yaslandığı durum görünmezdi ve marka yavaşça bozulurdu.
    expect(oku(4.9).status).toBe('warn')
    expect(oku(5.1).status).toBe('out')
  })

  it('`upper` yönü ters çalışıyor (kontrast oranı gibi)', () => {
    const k = (v: number) =>
      reading({
        metric: 'contrast',
        label: 'kontrast',
        value: v,
        warn: 4.5,
        limit: 3,
        direction: 'upper',
        unit: ':1',
      })
    expect(k(7).status).toBe('in')
    expect(k(4).status).toBe('warn')
    expect(k(2).status).toBe('out')
  })

  it('biçim tr-TR: ondalık VİRGÜL', () => {
    const s = formatReading(oku(2.4))
    expect(s).toContain('2,4')
    expect(s).not.toContain('2.4')
    expect(s).toContain('tolerans içi')
  })

  it('sınır dışı okuma bandın İÇİNDE görünüyor', () => {
    // Kenardan taşan bir işaret "ne kadar dışında" sorusunu cevaplayamaz.
    const s = formatReading(oku(9.9))
    expect(s).toContain('●')
    expect(s).toContain('SINIR DIŞI')
  })

  it('dört işaret AYRI karakter — limit bant kenarıyla karışmıyor', () => {
    // İlk sürümde limit ve bant kenarı aynı `┤` idi; sınır dışı bir okumada iki `┤`
    // yan yana çıkıyor ve "limit nerede" sorusu tam da limitin aşıldığı anda
    // okunamaz hâle geliyordu.
    const s = formatReading(oku(9.9))
    for (const isaret of ['●', '┊', '╎', '│']) expect(s, isaret).toContain(isaret)
    expect(s.split('╎')).toHaveLength(2)
  })

  it('tam limitte duran ölçüm GÖRÜNÜYOR — eşiğin altında kaybolmuyor', () => {
    // Ölçüm en son yazılır ve eşiklerin üstüne biner. Tersi olsaydı en çok bakılması
    // gereken okuma görünmez olurdu.
    const s = formatReading(oku(5.0))
    expect(s).toContain('●')
  })
})

describe('rapor', () => {
  it('temiz görsel: bloke değil', () => {
    const r = measure({
      doc: belge(),
      palette: PALET,
      pixels: [px('#0091FF'), px('#101418')],
      targetAspect: 0.8,
    })
    expect(r.blocked).toBe(false)
    expect(formatReport(r)).toContain('bütün okumalar tolerans içi')
  })

  it('palet dışı renk oranı limiti aşan görsel SINIR DIŞI', () => {
    const r = measure({
      doc: belge(),
      palette: PALET,
      pixels: [px('#FF0000'), px('#00FF00'), px('#0091FF'), px('#101418')],
      targetAspect: 0.8,
    })
    expect(r.blocked).toBe(true)
    const p = r.readings.find((x) => x.metric === 'off_palette')
    expect(p?.status).toBe('out')
    expect(p?.value).toBe(50)
    expect(formatReport(r)).toContain('yayınlanamaz')
  })

  it('ÖLÇÜLEMEYEN metrik rapora girmiyor — sıfır olarak da girmiyor', () => {
    const r = measure({ doc: belge(), palette: { colors: [] }, pixels: [], targetAspect: 0.8 })
    expect(r.readings.map((x) => x.metric)).not.toContain('delta_e_2000')
    expect(r.readings.map((x) => x.metric)).not.toContain('off_palette')
    // Ama ölçülebilenler duruyor: rapor boş değil.
    expect(r.readings.map((x) => x.metric)).toContain('text_coverage')
  })

  it('yanlış en-boy tek başına yayını BLOKLUYOR', () => {
    const r = measure({
      doc: belge({ width: 1080, height: 1080 }),
      palette: PALET,
      pixels: [px('#0091FF')],
      targetAspect: 0.8,
    })
    expect(r.blocked).toBe(true)
    expect(r.readings.find((x) => x.metric === 'aspect_deviation')?.status).toBe('out')
  })

  it('varsayılan limitler sabit — sessizce gevşetilemez', () => {
    expect(DEFAULT_LIMITS.deltaELimit).toBe(5)
    expect(DEFAULT_LIMITS.offPaletteLimit).toBe(15)
  })
})
