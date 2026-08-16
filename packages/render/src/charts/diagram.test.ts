import { describe, expect, it } from 'vitest'
import { MAX_DUGUM, diagramHtml, isDiagramError, type DiagramSpec } from './diagram.js'

const spec = (n: number): DiagramSpec => ({
  title: 'Ölçüm döngüsü',
  nodes: Array.from({ length: n }, (_, i) => ({ label: `Adım ${i + 1}`, detail: '12 dk' })),
})

describe('akış diyagramı', () => {
  it('boş ve TEK kutu reddediliyor — tek kutuluk akış akış değildir', () => {
    expect(isDiagramError(diagramHtml({ title: 'x', nodes: [] }))).toBe(true)
    const tek = diagramHtml(spec(1))
    expect(isDiagramError(tek) && tek.kind).toBe('single_node')
  })

  // 🧪 İHLAL TESTİ — tavan gerçek. Fikstür (D-181): MAX_DUGUM+1 kutu; tavan kalkarsa
  // deck'e okunamayacak kadar dar altı kutu basılırdı ve bunu ancak PDF'e bakan görürdü.
  it('tavan aşılırsa REDDEDİYOR — sessizce daraltmıyor', () => {
    const r = diagramHtml(spec(MAX_DUGUM + 1))
    expect(isDiagramError(r) && r.kind).toBe('too_many')
    expect(isDiagramError(diagramHtml(spec(MAX_DUGUM)))).toBe(false)
  })

  it('ok bir KARAKTER değil — fonta bağlı değil', () => {
    const r = diagramHtml(spec(3))
    expect(isDiagramError(r)).toBe(false)
    if (isDiagramError(r)) return
    // `→` ya da `->` yazsaydık latin-ext font onu taşımayabilirdi (§7.2).
    expect(r).not.toMatch(/[→➔➜]/)
    expect(r).toContain('<polygon')
    // n kutu arasında n-1 ok.
    expect((r.match(/akis-ok/g) ?? []).length).toBe(2)
  })

  it('çıktıda HİÇ hex YOK — her renk token', () => {
    const r = diagramHtml(spec(3))
    if (isDiagramError(r)) return
    expect(r).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('kutu SABİT genişlik almıyor — Türkçe etiket kırpılmıyor (R-23)', () => {
    const r = diagramHtml(spec(2))
    if (isDiagramError(r)) return
    expect(r).not.toMatch(/\binline-size:\s*\d/)
  })

  it('etiket kaçıştan geçiyor', () => {
    const r = diagramHtml({ title: 'x', nodes: [{ label: '<b>a' }, { label: 'b' }] })
    if (isDiagramError(r)) return
    expect(r).toContain('&lt;b&gt;a')
  })
})
