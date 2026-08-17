// Akış diyagramı — kutular HTML, oklar SVG (§7.6 · R-30 · FAZ-6.2).
//
// **D2 de reddedildi** (D-210), ECharts'la aynı gerekçe: D2 kendi font metriğiyle metin
// ölçer, kutu genişliğini ona göre hesaplar ve Türkçe'de kutu ya taşar ya boş kalır.
// Üstelik harici bir Go ikilisidir — `alt-surec` darboğazından geçmesi gerekirdi ve
// "bir ay ihmal edilse de çalışır" (§16) vaadine bir kurulum adımı daha eklerdi.
//
// **Kutu genişliğini içerik belirler.** `grid-auto-columns: 1fr` ve `min-inline-size`;
// hiçbir yerde piksel sayılmıyor. Türkçe etiket İngilizce'sinden ~%30 uzundur (R-23) ve
// bunu ölçen tek şey Chromium'un kendisi.
//
// **Ok bir KARAKTER değil, geometridir.** `→` yazmak fonta bağımlılık demekti: latin-ext
// bir font oku taşımayabilir ve `notdef` kutusu basılırdı (§7.2). SVG çizgi + üçgen
// hiçbir fonta bağlı değil.

import type { SeriesTone } from '@suite/kernel'
import { kacir } from '../html.js'

export interface DiagramNode {
  readonly label: string
  /** Alt satır: adımın çıktısı ya da ölçüsü. İsteğe bağlı. */
  readonly detail?: string
  readonly tone?: SeriesTone
}

export interface DiagramSpec {
  readonly title: string
  readonly nodes: readonly DiagramNode[]
}

export type DiagramError =
  | { readonly kind: 'empty' }
  /** Tek kutuluk "akış" akış değildir; okuyucuya hiçbir şey anlatmaz. */
  | { readonly kind: 'single_node' }
  /** Yatay akışta beşten fazla kutu deck'te okunamaz hâle gelir — böl. */
  | { readonly kind: 'too_many'; readonly count: number }

export const MAX_DUGUM = 5

const TONE_TOKEN: Record<SeriesTone, string> = {
  neutral: 'var(--role-line-hair)',
  ok: 'var(--role-state-ok)',
  warn: 'var(--role-state-warn)',
  error: 'var(--role-state-error)',
}

// ⚠ **AKIŞ DİKEY — ve bu ölçülerek karar verildi (FAZ-14.3).** İlk sürüm yataydı
// (`grid-auto-flow: column`) ve gerçek bir koşuda ÜÇÜNCÜ DÜĞÜM ÇERÇEVEDEN TAŞTI.
// Hiçbir metrik yakalamadı: `text_overflow` metin sütununu ölçüyor, diyagramı değil.
// Yalnız BAKINCA görüldü.
//
// Aritmetik yatay düzeni imkânsız kılıyor: güvenli metin sütunu 582 px; üç kutu
// (3 × 140 min + 3 × 40 padding = 540) artı iki ok (2 × 48 = 96) = **636 px**. Dört
// düğümde 830 px. `min-inline-size`i düşürmek taşmayı bir düğüm ötelerdi, çözmezdi —
// ve kutu 122 px içerik genişliğinde 22 px fontla satır başına beş harf alırdı.
//
// Dikey akışta kutu sütunun TAMAMINI kaplıyor: taşma **yapısal olarak imkânsız**,
// düğüm sayısından bağımsız. Referans örnek 3'ün adım listeleri de dikey.
export const DIAGRAM_CSS = `
.akis { display: grid; gap: 16px; }
.akis-baslik { font-size: 28px; color: var(--role-text); margin: 0; }
.akis-sira { display: grid; grid-auto-flow: row; align-items: stretch; gap: 0;
  justify-items: stretch; }
/* Sabit genişlik YOK (R-23): kutu sütunu doldurur, metin kırpılmaz. */
.akis-kutu { padding: 16px 20px; border: 1px solid var(--role-line-hair);
  border-inline-start: 4px solid var(--akis-ton, var(--role-line-hair));
  background: var(--role-surface); display: grid; align-content: center; gap: 4px; }
.akis-etiket { font-size: 22px; color: var(--role-text); }
.akis-detay { font-size: 16px; color: var(--role-text-muted);
  font-variant-numeric: tabular-nums slashed-zero; }
/* Ok kutular ARASINDA, aşağı bakıyor: dikey akışta yön aşağıdır. */
.akis-ok { block-size: 28px; display: grid; place-items: center; }
.akis-ok svg { inline-size: 16px; block-size: 24px; }
`

const okSvg = `<svg viewBox="0 0 16 32" role="presentation" aria-hidden="true"><line x1="8" y1="0" x2="8" y2="24" stroke="var(--role-text-muted)" stroke-width="2"/><polygon points="3,24 8,32 13,24" fill="var(--role-text-muted)"/></svg>`

export const diagramHtml = (spec: DiagramSpec): string | DiagramError => {
  if (spec.nodes.length === 0) return { kind: 'empty' }
  if (spec.nodes.length === 1) return { kind: 'single_node' }
  if (spec.nodes.length > MAX_DUGUM) return { kind: 'too_many', count: spec.nodes.length }

  const kutular = spec.nodes.map((d) => {
    const ton = TONE_TOKEN[d.tone ?? 'neutral']
    const detay = d.detail === undefined ? '' : `<span class="akis-detay">${kacir(d.detail)}</span>`
    return `<div class="akis-kutu" style="--akis-ton:${ton}"><span class="akis-etiket">${kacir(d.label)}</span>${detay}</div>`
  })
  // Oklar kutuların ARASINA giriyor; son kutudan sonra ok yok.
  const sira = kutular.join(`<div class="akis-ok">${okSvg}</div>`)

  return `<figure class="akis"><h2 class="akis-baslik">${kacir(spec.title)}</h2><div class="akis-sira">${sira}</div></figure>`
}

export const isDiagramError = (r: string | DiagramError): r is DiagramError => typeof r !== 'string'
