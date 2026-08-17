// HEDEF: packages/render/src/charts/karsilastirma.ts
//
// Önce/sonra karşılaştırması — SAYI İSTEMEYEN veri ögesi (FAZ-12.5 · §7.1).
//
// **Neden yalnız bu:** halka, KPI karosu ve ilerleme göstergesi hepsi bir orana dayanıyor.
// R-32 kaynaksız sayısal iddiayı yasaklıyor ve `icerikPromptu` zaten *"hiçbir sayısal
// iddia yazma"* diyor — o ögelerin üretim yolu bugün KAPALI. Onları yazmak, çağıranı
// olmayan makine kurmak olurdu; bu projede yedi kez tekrarlayan hata (D-261). Sayı geldiği
// gün (bir `claim_source` ile) açılırlar; o zamana kadar plan dosyasında bekliyorlar.
//
// **Akıştan farkı:** akış bir SIRA anlatıyor (adım → adım → adım), karşılaştırma bir
// KARŞITLIK kuruyor (bugün → olması gereken). Aynı şekli iki kez çizmiyoruz.
//
// ⚠ Metin SVG/DOM'da kalıyor, canvas kullanılmıyor: canvas'a düşen metnin glif ölçümü ve
// Türkçe kapıları körleşir (R-20'nin veri görselleştirmedeki karşılığı).

import type { CompareBlock } from '@suite/kernel'
import { kacir } from '../html.js'

export const COMPARE_CSS = `
.kars { display: grid; gap: 14px; }
.kars-baslik { font-size: 28px; color: var(--role-text); margin: 0; }
.kars-govde { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: stretch; }
/* Sabit genişlik YOK (R-23): iki sütun eşit pay alır, metin kırpılmaz. */
.kars-sutun { padding: 14px 16px; border: 1px solid var(--role-line-hair);
  display: grid; gap: 6px; align-content: start; }
/* SONRA tarafı marka aksanıyla ayrılıyor: karşıtlık renkle de okunmalı, yalnız konumla
   değil — renk tek başına anlam taşımaz ama konumu DESTEKLER (§12.1). */
.kars-sutun.sonra { border-inline-start: 4px solid var(--akis-ton, var(--role-line-hair)); }
.kars-etiket { font-size: 20px; color: var(--role-text); }
.kars-madde { font-size: 17px; color: var(--role-text-muted); }
`

const sutun = (s: CompareBlock['once'], sinif: string): string =>
  `<div class="kars-sutun ${sinif}"><div class="kars-etiket">${kacir(s.label)}</div>` +
  s.items.map((x: string) => `<div class="kars-madde">${kacir(x)}</div>`).join('') +
  `</div>`

export interface CompareError {
  readonly kind: 'invalid_compare'
  readonly reason: string
}

export const isCompareError = (v: unknown): v is CompareError =>
  v !== null && typeof v === 'object' && (v as CompareError).kind === 'invalid_compare'

/**
 * Karşılaştırmayı çizer. Geçersizse HATA döner — sessizce boş kutu basmaz.
 *
 * ⚠ Tek taraflı bir karşılaştırma karşılaştırma değil bir listedir; `list` düzeni onu
 * zaten daha iyi çiziyor. `validateDocument` de aynı kuralı zorluyor (iki savunma).
 */
export const compareHtml = (b: CompareBlock): string | CompareError => {
  if (b.title.trim() === '' || b.once.items.length === 0 || b.sonra.items.length === 0) {
    return { kind: 'invalid_compare', reason: 'başlık ya da taraflardan biri boş' }
  }
  return (
    `<div class="kars"><div class="kars-baslik">${kacir(b.title)}</div>` +
    `<div class="kars-govde">${sutun(b.once, 'once')}${sutun(b.sonra, 'sonra')}</div></div>`
  )
}
