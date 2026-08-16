import { describe, expect, it } from 'vitest'
import { chartHtml, isChartError, type ChartSpec } from './chart.js'
import { niceAxis, norm, sayiTr } from './scale.js'

const spec = (over: Partial<ChartSpec> = {}): ChartSpec => ({
  chartKind: 'bar',
  title: 'Vardiya bazlı fire oranı',
  unit: '%',
  asOf: '2026-03-31',
  points: [
    { label: 'Ağustos', value: 4.2 },
    { label: 'İğne hattı', value: 7.8, tone: 'warn' },
    { label: 'Şubat', value: 2.1, tone: 'ok' },
  ],
  ...over,
})

describe('eksen', () => {
  it('adım 1·2·5×10^k — okuyucunun kafadan bölebildiği sayılar', () => {
    for (const v of [[3], [17], [420], [0.7], [1234]]) {
      const a = niceAxis(v)
      const adim = a.ticks[1]! - a.ticks[0]!
      const b = adim / 10 ** Math.floor(Math.log10(adim))
      expect([1, 2, 5, 10]).toContain(Math.round(b))
    }
  })

  // 🧪 İHLAL TESTİ — taban SIFIR. Fikstür (D-181): değerler 100..104; kural kalkarsa
  // eksen 100'den başlar ve %4'lük fark ekranı boydan boya doldurur.
  it('pozitif veride taban SIFIR — fark abartılmıyor', () => {
    expect(niceAxis([100, 102, 104]).min).toBe(0)
  })

  it('negatif değer varsa taban aşağı iniyor', () => {
    expect(niceAxis([-8, 4]).min).toBeLessThan(0)
  })

  it('kayan nokta birikimi YOK — 0.30000000000000004 basılmıyor', () => {
    for (const t of niceAxis([0.1, 0.5]).ticks) {
      expect(String(t)).not.toMatch(/\d{12}/)
    }
  })

  it('aynı girdi aynı ekseni veriyor — deck yeniden render’da kaymıyor', () => {
    expect(niceAxis([4.2, 7.8, 2.1])).toEqual(niceAxis([4.2, 7.8, 2.1]))
  })

  it('norm oran döndürüyor, piksel değil', () => {
    const a = niceAxis([0, 10])
    expect(norm(a, a.min)).toBe(0)
    expect(norm(a, a.max)).toBe(1)
  })

  it('Türkçe sayı biçimi: binlik nokta, ondalık virgül', () => {
    expect(sayiTr(1234.5)).toBe('1.234,5')
  })
})

describe('grafik', () => {
  it('boş veri HATA — sessizce boş kutu basmıyor', () => {
    const r = chartHtml(spec({ points: [] }))
    expect(isChartError(r) && r.kind).toBe('empty')
  })

  it('NaN/Infinity HATA — eksen sessizce bozulmuyor', () => {
    const r = chartHtml(spec({ points: [{ label: 'x', value: Number.NaN }] }))
    expect(isChartError(r) && r.kind).toBe('non_finite')
  })

  /**
   * Adımın ✅ kriteri: renkler token'dan. Kütüphane paleti "hiçbir yerde görünmeyecek".
   *
   * 🧪 İHLAL TESTİ — `TONE_TOKEN`a bir hex yazılırsa bu test kırılır. Fonksiyonun renk
   * PARAMETRESİ yok; geriye tek sızıntı yolu sabit tablodur ve burası onu kapatıyor.
   */
  it('çıktıda HİÇ hex YOK — her renk var(--role-*)', () => {
    const r = chartHtml(spec())
    expect(isChartError(r)).toBe(false)
    if (isChartError(r)) return
    expect(r.html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(r.html).toContain('var(--role-state-warn)')
  })

  it('metin SVG’de değil HTML’de — genişliği Chromium ölçüyor', () => {
    const r = chartHtml(spec())
    expect(isChartError(r)).toBe(false)
    if (isChartError(r)) return
    const svg = r.html.slice(r.html.indexOf('<svg'), r.html.indexOf('</svg>'))
    // D-209'un tamamı bu satırda: SVG'de tek bir <text> olsaydı, o metnin konumunu
    // BİZ hesaplamak zorunda kalırdık — ve ECharts'ın Türkçe'de %83 saptığı yer orası.
    expect(svg).not.toContain('<text')
    expect(r.html).toContain('Ağustos')
  })

  it('veri damgası GÖRÜNÜR — bugünün verisi sanılmıyor', () => {
    const r = chartHtml(spec())
    expect(isChartError(r)).toBe(false)
    if (isChartError(r)) return
    expect(r.html).toContain('2026-03-31')
  })

  it('etiket HTML kaçışından geçiyor — metin etiket açamıyor', () => {
    const r = chartHtml(spec({ points: [{ label: '<script>x</script>', value: 1 }] }))
    expect(isChartError(r)).toBe(false)
    if (isChartError(r)) return
    expect(r.html).not.toContain('<script>')
    expect(r.html).toContain('&lt;script&gt;')
  })

  it('çizgi grafiği aynı ekseni kullanıyor — iki ölçek yok', () => {
    const bar = chartHtml(spec({ chartKind: 'bar' }))
    const line = chartHtml(spec({ chartKind: 'line' }))
    expect(isChartError(bar) || isChartError(line)).toBe(false)
    if (isChartError(bar) || isChartError(line)) return
    expect(line.axis).toEqual(bar.axis)
    expect(line.html).toContain('<polyline')
  })
})
