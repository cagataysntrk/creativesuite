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

export const DIAGRAM_CSS = `
.akis { display: grid; gap: 16px; }
.akis-baslik { font-size: 28px; color: var(--role-text); margin: 0; }
.akis-sira { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  align-items: stretch; gap: 0; }
/* Sabit genişlik YOK (R-23): kutu içeriğe göre büyür, metin kırpılmaz. */
.akis-kutu { min-inline-size: 140px; padding: 20px; border: 1px solid var(--role-line-hair);
  border-inline-start: 4px solid var(--akis-ton, var(--role-line-hair));
  background: var(--role-surface); display: grid; align-content: center; gap: 6px; }
.akis-etiket { font-size: 22px; color: var(--role-text); }
.akis-detay { font-size: 16px; color: var(--role-text-muted);
  font-variant-numeric: tabular-nums slashed-zero; }
/* Ok: kutular arası boşlukta, fonttan bağımsız geometri. */
.akis-ok { inline-size: 48px; display: grid; place-items: center; }
.akis-ok svg { inline-size: 32px; block-size: 16px; }
`

const okSvg = `<svg viewBox="0 0 32 16" role="presentation" aria-hidden="true"><line x1="0" y1="8" x2="24" y2="8" stroke="var(--role-text-muted)" stroke-width="2"/><polygon points="24,3 32,8 24,13" fill="var(--role-text-muted)"/></svg>`

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
