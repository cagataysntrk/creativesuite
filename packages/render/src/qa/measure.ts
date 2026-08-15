// Marka QA ölçümleri (§11.1 · D-109, D-110).
//
// **Piksel okuma tarayıcıda, ölçüm burada.** Görselin piksellerine erişmek için ikinci
// bir görüntü kütüphanesi (sharp, jimp, canvas) eklemedik: Chromium zaten var, zaten
// tek başlatıcıdan geçiyor (`browser.ts`) ve `<canvas>` piksel erişimini standart olarak
// veriyor. Bir PNG çözücü daha eklemek, ikinci bir renk profili yorumu demektir — ve iki
// yorum farklı ΔE üretir.
//
// **Metin kaplama OCR ile DEĞİL, belge modelinden ölçülür.** Tesseract'ın yapacağı şey
// "bu görselde nerede metin var" sorusunu tahmin etmek; oysa metni biz yerleştiriyoruz
// ve nerede olduğunu KESİN biliyoruz (§7.1). Tahmin etmek, bildiğimiz bir şeyi
// %90 doğrulukla yeniden keşfetmek olurdu. OCR'ın gerçek işi, modelin ürettiği metni
// yakalamak — ama R-20 zaten onu yasaklıyor ve `image.generate` metinsiz üretiyor.

import type { Block, DocumentModel } from '@suite/kernel'
import { deltaE2000, parseHex, rgbToLab, type Lab, type Rgb } from './deltae.js'
import { reading, report, type QaReport, type ToleranceReading } from './tolerance.js'

export interface BrandPalette {
  /** Marka token'larından gelen hex listesi. Boşsa ölçüm YAPILMAZ, uydurulmaz. */
  readonly colors: readonly string[]
}

export interface QaLimits {
  /** Ortalama ΔE: markadan sapma. */
  readonly deltaEWarn: number
  readonly deltaELimit: number
  /** Palet dışı piksel oranı, yüzde. */
  readonly offPaletteWarn: number
  readonly offPaletteLimit: number
  /** Metin kaplaması, yüzde. Meta reklam kuralının mirası: %20 üstü dikkat çeker. */
  readonly textCoverageWarn: number
  readonly textCoverageLimit: number
  /** En-boy sapması, yüzde. */
  readonly aspectLimit: number
  /**
   * Bir pikselin "palet içi" sayılması için gereken en büyük ΔE.
   * 5.0 kabaca "eğitimsiz gözün ayırt edemeyeceği" sınır; bunun üstü kasıtlı farktır.
   */
  readonly paletteMatch: number
}

export const DEFAULT_LIMITS: QaLimits = {
  deltaEWarn: 3.0,
  deltaELimit: 5.0,
  offPaletteWarn: 10,
  offPaletteLimit: 15,
  textCoverageWarn: 18,
  textCoverageLimit: 20,
  aspectLimit: 1.0,
  paletteMatch: 5.0,
}

/** Bir pikselin palete en yakın üyesine olan ΔE'si. Palet boşsa `null`. */
export const nearestDeltaE = (piksel: Rgb, palet: readonly Lab[]): number | null => {
  if (palet.length === 0) return null
  const lab = rgbToLab(piksel)
  let enYakin = Number.POSITIVE_INFINITY
  for (const p of palet) {
    const d = deltaE2000(lab, p)
    if (d < enYakin) enYakin = d
  }
  return enYakin
}

export const paletteToLab = (p: BrandPalette): readonly Lab[] =>
  p.colors
    .map(parseHex)
    .filter((r): r is Rgb => r !== null)
    .map(rgbToLab)

export interface PixelStats {
  /** Palete olan ortalama ΔE. */
  readonly meanDeltaE: number
  /** Palet dışı piksel oranı, yüzde. */
  readonly offPalettePercent: number
  readonly sampled: number
}

/**
 * Piksel örneklerinden istatistik. **Örnekleme çağıranın işi** — bu fonksiyon saf.
 *
 * Saflık burada bir tercih değil zorunluluk: aynı piksel dizisi her zaman aynı sayıyı
 * vermeli ki QA sonucu manifest'e yazıldığında tekrar üretilebilir olsun (§13).
 */
export const pixelStats = (
  pikseller: readonly Rgb[],
  palet: readonly Lab[],
  paletteMatch: number
): PixelStats | null => {
  if (pikseller.length === 0 || palet.length === 0) return null
  let toplam = 0
  let disarida = 0
  for (const p of pikseller) {
    const d = nearestDeltaE(p, palet) ?? 0
    toplam += d
    if (d > paletteMatch) disarida += 1
  }
  return {
    meanDeltaE: toplam / pikseller.length,
    offPalettePercent: (disarida / pikseller.length) * 100,
    sampled: pikseller.length,
  }
}

/**
 * Metin kaplaması: metin bloklarının kapladığı alanın tuvale oranı.
 *
 * Kaba ama **deterministik** bir kestirim: karakter sayısı × tahmini karakter alanı.
 * Gerçek glyph metrikleri marka fontu geldiğinde (V-02) gelecek; o zamana kadar bu sayı
 * bir ÜST SINIR kestirimi ve öyle olduğu burada yazıyor. Uydurulmuş bir kesinlik
 * ("%18,37") kaba bir kestirimden daha tehlikeli olurdu.
 */
export const textCoverage = (doc: DocumentModel): number => {
  const alan = doc.width * doc.height
  if (alan === 0) return 0
  const karakterAlani = (b: Block): number => {
    if (b.type === 'heading') return b.text.length * (doc.width / 22) * (doc.width / 22) * 0.42
    if (b.type === 'body') return b.text.length * (doc.width / 46) * (doc.width / 46) * 0.45
    return 0
  }
  return (doc.blocks.reduce((t, b) => t + karakterAlani(b), 0) / alan) * 100
}

/** En-boy sapması, yüzde. Hedeften %1 sapma Instagram'da görünür kırpma demektir. */
export const aspectDeviation = (w: number, h: number, hedef: number): number => {
  if (h === 0 || hedef === 0) return 100
  return Math.abs((w / h - hedef) / hedef) * 100
}

export interface QaInput {
  readonly doc: DocumentModel
  readonly palette: BrandPalette
  readonly pixels: readonly Rgb[]
  readonly targetAspect: number
  readonly limits?: QaLimits
}

/**
 * Tolerans raporu üretir.
 *
 * **Ölçülemeyen metrik RAPORA GİRMEZ** — sıfır olarak girmez. Sıfır bir okuma değil bir
 * yalan olurdu: palet tanımlı değilse ΔE 0,0 yazmak "mükemmel uyum" göstermek demektir
 * ve tam da hiçbir şey ölçülmediği anda yeşil yanardı.
 */
export const measure = (input: QaInput): QaReport => {
  const l = input.limits ?? DEFAULT_LIMITS
  const okumalar: ToleranceReading[] = []

  const palet = paletteToLab(input.palette)
  const stats = pixelStats(input.pixels, palet, l.paletteMatch)
  if (stats !== null) {
    okumalar.push(
      reading({
        metric: 'delta_e_2000',
        label: 'ΔE 2000',
        value: stats.meanDeltaE,
        warn: l.deltaEWarn,
        limit: l.deltaELimit,
        direction: 'lower',
        unit: '',
      })
    )
    okumalar.push(
      reading({
        metric: 'off_palette',
        label: 'palet dışı renk',
        value: stats.offPalettePercent,
        warn: l.offPaletteWarn,
        limit: l.offPaletteLimit,
        direction: 'lower',
        unit: '%',
      })
    )
  }

  okumalar.push(
    reading({
      metric: 'text_coverage',
      label: 'metin kaplama',
      value: textCoverage(input.doc),
      warn: l.textCoverageWarn,
      limit: l.textCoverageLimit,
      direction: 'lower',
      unit: '%',
    })
  )

  okumalar.push(
    reading({
      metric: 'aspect_deviation',
      label: 'en-boy sapması',
      value: aspectDeviation(input.doc.width, input.doc.height, input.targetAspect),
      warn: l.aspectLimit / 2,
      limit: l.aspectLimit,
      direction: 'lower',
      unit: '%',
    })
  )

  return report(okumalar)
}
