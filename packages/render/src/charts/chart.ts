// Deck grafiği — geometri SVG, metin HTML (§7.6 · R-30, R-35 · FAZ-6.2).
//
// **Neden hazır bir grafik kütüphanesi yok.** FAZ-6.2 ECharts SSR öngörüyordu; kurup
// ÖLÇTÜM ve reddettim (D-209). ECharts SSR'da tuval yok, bu yüzden metin genişliğini
// kendi tahmin ediyor — ve Türkçe'de tahmini şu kadar tutuyor:
//
//     etiket        echarts   chromium   sapma
//     Ağustos          48.8       43.4   +%12,6
//     İğne fire %      71.5       57.4   +%24,7
//     Çğüşiöı          74.6       40.7   +%83,4
//
// Bu sayılarla eksen payı, etiket döndürme ve "sığmayanı gizle" kararları veriliyor.
// Yani sığan etiket gizleniyor, sığmayan taşıyor. **Satori'yi reddettiğimiz gerekçenin
// aynısı** (D-24): ikinci bir metin ölçüm motoru = ikinci bir Türkçe hata modu.
// Üstelik varsayılan paleti (`#5070dd`) SVG'ye sızdırıyordu — 6.2'nin ✅ kriteri tam da
// bunu yasaklıyor.
//
// **Bu dosyanın anayasası: hiçbir yerde metin genişliği TAHMİN EDİLMEZ.** SVG yalnız
// geometri taşır (çubuk, çizgi, kılavuz); her etiket HTML kutusudur ve Chromium
// yerleştirir. Bir grafiğin Türkçe'de bozulmasının yolu buradan geçmiyor artık.
//
// **Renk parametresi YOK.** Fonksiyon hex ALMIYOR — `tone` bir token adına çözülüyor.
// Kütüphanenin varsayılan paleti "hiçbir yerde görünmeyecek" kriterini yorumla değil,
// tiple garanti ediyoruz: geçirilecek bir renk alanı yok.

import type { ChartBlock, ChartPoint, SeriesTone } from '@suite/kernel'
import { kacir } from '../html.js'
import { niceAxis, norm, sayiTr, type Axis } from './scale.js'

/**
 * Ton → rol token'ı. Tablo BURADA, kernel'de değil: kernel renk BİLMEZ (§3.2), yalnız
 * anlamı taşır. Renk bir render kararıdır ve yalnız render katmanında yaşar.
 */
const TONE_TOKEN: Record<SeriesTone, string> = {
  neutral: 'var(--role-text-muted)',
  ok: 'var(--role-state-ok)',
  warn: 'var(--role-state-warn)',
  error: 'var(--role-state-error)',
}

/**
 * Grafik girdisi = belge modelindeki blok. İkinci bir "spec" tipi TANIMLANMADI: iki
 * tip bir gün ayrışır ve biri diğerinin taşımadığı bir alan kazanır (D-160).
 */
export type ChartSpec = Omit<ChartBlock, 'type'>

export interface ChartResult {
  readonly html: string
  readonly axis: Axis
}

export type ChartError =
  { readonly kind: 'empty' } | { readonly kind: 'non_finite'; readonly label: string }

/** Grafik CSS'i — bir kez, deck belgesinin başına. */
export const CHART_CSS = `
.grafik { display: grid; grid-template-rows: auto 1fr auto auto; gap: 12px; }
.grafik-baslik { font-size: 28px; color: var(--role-text); margin: 0; }
.grafik-tuval { position: relative; }
/* Yükseklik SATIR SAYISINDAN gelir, sabit px'ten değil: Türkçe etiket iki satıra
   düştüğünde grafik kısalmaz, alan gevşer (R-23). */
.grafik-alan { position: relative; block-size: var(--grafik-h, 320px); }
.grafik-alan svg { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; }
.grafik-yatay { position: absolute; inline-size: 100%; display: flex; }
.grafik-x { flex: 1 1 0; text-align: center; font-size: 18px; color: var(--role-text-muted);
  padding-block-start: 8px; }
.grafik-y { position: absolute; inset-inline-start: 0; transform: translateY(-50%);
  font-size: 16px; color: var(--role-text-muted);
  font-variant-numeric: tabular-nums slashed-zero; }
.grafik-damga { font-size: 14px; color: var(--role-text-muted);
  font-variant-numeric: tabular-nums slashed-zero; }
`

const GRID_SOL = 72 // y etiketleri için ayrılan pay (px), tuval koordinatında

/**
 * Grafiği HTML'e çevirir.
 *
 * Dönüş `Result` değil, `ChartResult | ChartError` ayrımı çağıranda yapılıyor —
 * boş bir grafik sessizce boş bir kutu basmamalı; deck'te boş kutu, verinin olmadığını
 * DEĞİL, render'ın bozulduğunu düşündürür.
 */
export const chartHtml = (spec: ChartSpec): ChartResult | ChartError => {
  if (spec.points.length === 0) return { kind: 'empty' }
  for (const p of spec.points) {
    if (!Number.isFinite(p.value)) return { kind: 'non_finite', label: p.label }
  }

  const axis = niceAxis(spec.points.map((p) => p.value))
  const W = 1000
  const H = 400
  const ic = W - GRID_SOL

  // ── kılavuz çizgileri (geometri) ──
  const kilavuz = axis.ticks
    .map((t) => {
      const y = H - norm(axis, t) * H
      return `<line x1="${GRID_SOL}" y1="${y.toFixed(2)}" x2="${W}" y2="${y.toFixed(2)}" stroke="var(--role-line-hair)" stroke-width="1"/>`
    })
    .join('')

  // ── seri (geometri) ──
  const n = spec.points.length
  const adim = ic / n
  let seri = ''
  if (spec.chartKind === 'bar') {
    seri = spec.points
      .map((p, i) => {
        const h = norm(axis, p.value) * H
        const genislik = adim * 0.62
        const x = GRID_SOL + i * adim + (adim - genislik) / 2
        return `<rect x="${x.toFixed(2)}" y="${(H - h).toFixed(2)}" width="${genislik.toFixed(2)}" height="${h.toFixed(2)}" fill="${TONE_TOKEN[p.tone ?? 'neutral']}"/>`
      })
      .join('')
  } else {
    const nokta = spec.points.map((p, i) => {
      const x = GRID_SOL + i * adim + adim / 2
      const y = H - norm(axis, p.value) * H
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    seri =
      `<polyline points="${nokta.join(' ')}" fill="none" stroke="${TONE_TOKEN.neutral}" stroke-width="3"/>` +
      spec.points
        .map((p, i) => {
          const [x, y] = nokta[i]!.split(',')
          return `<circle cx="${x}" cy="${y}" r="6" fill="${TONE_TOKEN[p.tone ?? 'neutral']}"/>`
        })
        .join('')
  }

  // ── etiketler: HTML, SVG DEĞİL ──
  // Her biri kendi kutusunda; genişliği Chromium hesaplıyor. `translateY(-50%)` ve
  // `flex: 1` sayesinde hiçbir yerde bizim ölçtüğümüz bir piksel yok.
  const yEtiket = axis.ticks
    .map((t) => {
      const yuzde = (1 - norm(axis, t)) * 100
      return `<span class="grafik-y" style="inset-block-start:${yuzde.toFixed(2)}%">${kacir(sayiTr(t))}</span>`
    })
    .join('')
  const xEtiket = spec.points.map((p) => `<span class="grafik-x">${kacir(p.label)}</span>`).join('')

  const birim = spec.unit === undefined ? '' : ` (${kacir(spec.unit)})`
  const html = [
    '<figure class="grafik">',
    `<h2 class="grafik-baslik">${kacir(spec.title)}${birim}</h2>`,
    '<div class="grafik-tuval"><div class="grafik-alan">',
    `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="presentation">${kilavuz}${seri}</svg>`,
    `${yEtiket}</div>`,
    `<div class="grafik-yatay" style="inset-inline-start:${((GRID_SOL / W) * 100).toFixed(2)}%;inline-size:${(((W - GRID_SOL) / W) * 100).toFixed(2)}%">${xEtiket}</div>`,
    '</div>',
    // Veri damgası: grafiğin yanında, dipnotta değil.
    `<figcaption class="grafik-damga">Veri: ${kacir(spec.asOf)} anlık görüntüsü</figcaption>`,
    '</figure>',
  ].join('')

  return { html, axis }
}

export type { ChartPoint, SeriesTone }

export const isChartError = (r: ChartResult | ChartError): r is ChartError => 'kind' in r
