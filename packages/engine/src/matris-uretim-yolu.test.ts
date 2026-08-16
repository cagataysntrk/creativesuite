// Matris ÜRETİM YOLUNDA mı — çarpanı ÖLÇEN test (§10 · D-225 · D-228 · FAZ-8.1).
//
// **Bu dosya bir yorumun yerine geçiyor.** `matris` kapısı "maliyet tahmini bu sayıyı
// çarpan alıyor" diyordu ve bu bir İDDİAYDI: `parsePipeline` `matris:` bloğunu tamamen
// düşürüyor, `plan()` matrisi hiç görmüyordu. Kapı yeşildi çünkü kapı YAML dosyasına
// bakıyordu — çalışma zamanına değil.
//
// Zincirin altı halkası var (modül · gövde · fiil haritası · hat · kapı · ŞEKİL) ve bu
// dosya **beşinci ile altıncı arasını** ölçüyor: hat dosyasında yazan sayı, üretim
// yolundaki maliyete gerçekten çarpan mı oluyor.
//
// ⚠ Gerçek `registry/pipelines/ad-creative-set.pipeline.yaml` okunuyor, kopyası değil.
// Kopya okusaydı hat dosyası yeniden adlandırıldığında ya da `matris:` bloğu
// silindiğinde test yeşil kalırdı — tam olarak yakalaması gereken gerileme.

import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import type { BrandId, RunId } from '@suite/contracts'
import { loadPipeline, parsePipeline, type Pipeline } from '@suite/registry'
import { formatPlan, plan } from './plan.js'
import { varyantSayisi } from './matris.js'

// Dosya `loadPipeline` ile okunuyor, `readFileSync` ile DEĞİL: yapılandırma çözücü tek
// darboğazdır (§3.3) ve testin ikinci bir çözüm yolu açması, tam olarak ölçmek istediği
// ayrışmayı testin kendisinde doğururdu.
const KOK = join(import.meta.dirname, '../../..', 'registry', 'pipelines')

const soz = (r: ReturnType<typeof parsePipeline>): Pipeline => {
  expect(r.ok, JSON.stringify(r.ok ? [] : r.errors)).toBe(true)
  return (r as { ok: true; value: Pipeline }).value
}
const coz = (text: string): Pipeline => soz(parsePipeline(text))
const reklamHatti = (): Pipeline => soz(loadPipeline(KOK, 'ad-creative-set'))

const planla = (p: Pipeline) =>
  plan({ pipeline: p, runId: 'run_t' as RunId, brandId: 'brd_t' as BrandId, eraId: '*' })

describe('hat dosyasındaki matris çalışma zamanına ULAŞIYOR mu', () => {
  it('çözücü `matris:` bloğunu düşürmüyor', () => {
    const p = reklamHatti()
    expect(p.matris).not.toBeNull()
    expect(p.matris?.mod).toBe('ofat')
    expect(p.matris?.eksenler.map((e) => e.ad)).toEqual(['hook', 'copy', 'visual'])
  })

  it('plan 7 varyant bildiriyor — 3×3×3 OFAT (D-225)', () => {
    const p = reklamHatti()
    const r = planla(p)
    expect(r.ok, JSON.stringify(r.ok ? [] : r.errors)).toBe(true)
    if (!r.ok) return
    expect(r.report.varyantSayisi).toBe(7)
    expect(r.report.matrisModu).toBe('ofat')
  })

  it('ÜCRETLİ adım 7 kez, ücretsiz adım 1 kez koşuyor', () => {
    const r = planla(reklamHatti())
    if (!r.ok) return
    for (const s of r.report.steps) {
      expect(s.kosumSayisi, `${String(s.stepId)} (${s.verb})`).toBe(s.metered ? 7 : 1)
    }
  })
})

describe('çarpan MALİYETE gerçekten uygulanıyor', () => {
  const TEK = `
id: tek-varyant
title: Tek varyant
steps:
  - id: g
    verb: GENERATE
    capability: image.generate
`
  const EKSENLER = [
    { ad: 'hook', duzeyler: ['a', 'b', 'c'] },
    { ad: 'copy', duzeyler: ['x', 'y', 'z'] },
    { ad: 'visual', duzeyler: ['p', 'q', 'r'] },
  ] as const

  const YEDI = `${TEK}
matris:
  mod: ofat
  eksenler:
    - ad: hook
      duzeyler: [a, b, c]
    - ad: copy
      duzeyler: [x, y, z]
    - ad: visual
      duzeyler: [p, q, r]
`

  it('yedi varyantlı hattın toplamı, tek varyantlının tam 7 katı', () => {
    const tek = planla(coz(TEK))
    const yedi = planla(coz(YEDI))
    if (!tek.ok || !yedi.ok) return expect.fail('plan üretilmedi')
    expect(yedi.report.totalHigh.micros).toBe(tek.report.totalHigh.micros * 7n)
    expect(yedi.report.totalLow.micros).toBe(tek.report.totalLow.micros * 7n)
  })

  it('`full` mod 27 varyant — dört kat maliyet, sıfır ek öğrenme', () => {
    const r = planla(coz(YEDI.replace('mod: ofat', 'mod: full')))
    if (!r.ok) return expect.fail('plan üretilmedi')
    expect(r.report.varyantSayisi).toBe(27)
    // Aynı eksenlerle OFAT 7 — fark dört kat ve karar bu farkın üstünde duruyor.
    expect(varyantSayisi(EKSENLER, 'ofat')).toBe(7)
    expect(varyantSayisi(EKSENLER, 'full')).toBe(27)
  })

  it('çarpan EKRANDA görünüyor — görünmeyen çarpan yok sayılır', () => {
    const r = planla(reklamHatti())
    if (!r.ok) return expect.fail('plan üretilmedi')
    const cikti = formatPlan(r.report)
    expect(cikti).toContain('7 varyant')
    expect(cikti).toContain('ü×7')
  })

  it('matrissiz hatta ne çarpan satırı ne `ü×` işareti var', () => {
    const r = planla(coz(TEK))
    if (!r.ok) return expect.fail('plan üretilmedi')
    const cikti = formatPlan(r.report)
    expect(cikti).not.toContain('varyant matrisi')
    expect(cikti).not.toContain('ü×')
    expect(r.report.varyantSayisi).toBe(1)
  })

  it('ADIM maliyeti de çarpılıyor, yalnız toplam değil', () => {
    const yedi = planla(coz(YEDI))
    const tek = planla(coz(TEK))
    if (!yedi.ok || !tek.ok) return expect.fail('plan üretilmedi')
    expect(yedi.report.steps[0]?.estimatedCost.high.micros).toBe(
      (tek.report.steps[0]?.estimatedCost.high.micros ?? 0n) * 7n
    )
  })
})

// 🧪 İHLAL TESTİ (R-71): tasarımı bozuk bir matris planı DÜŞÜRMELİ.
describe('bozuk matris planı düşürüyor — kapı beklemeden', () => {
  const TEK_DUZEY = `
id: bozuk
title: Bozuk
matris:
  mod: ofat
  eksenler:
    - ad: hook
      duzeyler: [tek]
    - ad: copy
      duzeyler: [x, y]
steps:
  - id: g
    verb: GENERATE
    capability: image.generate
`

  it('tek düzeyli eksen: para harcar, ölçüm vermez', () => {
    const r = planla(coz(TEK_DUZEY))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]?.kind).toBe('matris_gecersiz')
    expect(JSON.stringify(r.errors)).toContain('eksen değil sabit')
  })

  it('bilinmeyen mod çözücüde reddediliyor', () => {
    const r = parsePipeline(TEK_DUZEY.replace('mod: ofat', 'mod: taguchi'))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]).toMatchObject({ kind: 'bad_matris' })
  })

  it('eksensiz matris bloğu reddediliyor — sessizce 1 varyanta düşmüyor', () => {
    const r = parsePipeline(`
id: bos
title: Boş
matris:
  mod: ofat
steps:
  - id: g
    verb: COMPOSE
`)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(JSON.stringify(r.errors)).toContain('eksen yok')
  })
})
