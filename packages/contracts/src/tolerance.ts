// Tolerans okuması — ölçen ile gösteren arasındaki ortak sözlük (§11.1 · D-175).
//
// **Tip Ring -1'de, mantık Ring 1'de.** Ölçüm `packages/render/src/qa/`de yapılır
// (Chromium, piksel, ΔE2000); gösterim tarayıcı halkasında. İkisi aynı yapıyı konuşmak
// zorunda ve tarayıcı halkası `render`ı import EDEMEZ — `render` Playwright çeker.
//
// `Money` neyse bu da odur: herkesin aynı biçimde konuşmak zorunda olduğu bir ilkel.
// Tarayıcı tarafında ikinci bir arayüz tanımlasaydık, ölçüm alanı eklendiğinde ekran
// onu sessizce görmezden gelirdi — ve eksik bir ölçüm ekranı, yanlış bir ölçüm ekranıdır.

/** Ölçünün limite göre durumu. Üç değer, çünkü ikisi sürüklenmeyi göremez. */
export type ToleranceStatus = 'in' | 'warn' | 'out'

export interface ToleranceReading {
  /** İngilizce tanımlayıcı — enum değeri (D-37). */
  readonly metric: string
  /** İnsana gösterilen Türkçe etiket. */
  readonly label: string
  readonly value: number
  readonly warn: number
  readonly limit: number
  /** `'lower'` = küçük iyi (ΔE), `'upper'` = büyük iyi (kontrast oranı). */
  readonly direction: 'lower' | 'upper'
  readonly unit: string
  readonly status: ToleranceStatus
}

export interface QaReport {
  readonly readings: readonly ToleranceReading[]
  /** Herhangi bir okuma sınır dışıysa varlık **yayınlanamaz**. */
  readonly blocked: boolean
  /** Uyarı bandındaki okuma sayısı — sürüklenme göstergesi. */
  readonly warnings: number
}
