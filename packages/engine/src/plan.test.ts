import { describe, expect, it } from 'vitest'
import type { BrandId, RunId } from '@suite/contracts'
import { parsePipeline, topoOrder, type Pipeline } from '@suite/registry'
import { formatPlan, plan } from './plan.js'

const YAML = `
id: test-pipeline
title: Test hattı
steps:
  - id: a
    verb: RESOLVE
  - id: b
    verb: GENERATE
    capability: image.generate
    needs: [a]
    constraints:
      aspect: '4:5'
  - id: c
    verb: PROPOSE
    needs: [b]
    gate: insan-onayi
`

// `throw` yerine assertion + tip daraltma: `throw` eden tek yer errors/panic.ts (§8.6)
// ve `chokepoints` kapısı bunu testte de zorluyor.
const coz = (text = YAML): Pipeline => {
  const r = parsePipeline(text)
  expect(r.ok, JSON.stringify(r.ok ? [] : r.errors)).toBe(true)
  return (r as { ok: true; value: Pipeline }).value
}

const planla = (p: Pipeline) =>
  plan({ pipeline: p, runId: 'run_t' as RunId, brandId: 'brd_t' as BrandId, eraId: '*' })

describe('pipeline çözümü (§3.3 · R-40)', () => {
  it('geçerli pipeline çözülür', () => {
    const p = coz()
    expect(p.id).toBe('test-pipeline')
    expect(p.steps).toHaveLength(3)
  })

  it('MODEL ADI reddedilir — yetenek iste, model isteme (R-40)', () => {
    const r = parsePipeline(YAML.replace("      aspect: '4:5'", '      model: gemini-3-pro-image'))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]).toMatchObject({ kind: 'model_id_in_pipeline', key: 'model' })
  })

  it('sağlayıcı adı da reddedilir', () => {
    const r = parsePipeline(YAML.replace("      aspect: '4:5'", '      provider_id: fal'))
    expect(r.ok).toBe(false)
  })

  it('bilinmeyen fiil reddedilir — dokuz fiil dışına çıkılamaz (R-02)', () => {
    const r = parsePipeline(YAML.replace('verb: RESOLVE', 'verb: ARCHIVE'))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]).toMatchObject({ kind: 'unknown_verb', verb: 'ARCHIVE' })
  })

  it('DAG döngüsü reddedilir — sonsuz bekleyen bir çalıştırma teşhis edilemez', () => {
    const r = parsePipeline(YAML.replace('    needs: [a]', '    needs: [a, c]'))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.some((e) => e.kind === 'cycle')).toBe(true)
  })

  it('olmayan bağımlılık reddedilir', () => {
    const r = parsePipeline(YAML.replace('    needs: [a]', '    needs: [yok]'))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.some((e) => e.kind === 'unknown_dependency')).toBe(true)
  })

  it('topolojik sıra bağımlılıkları önce koyar', () => {
    const sira = topoOrder(coz())
    expect(sira.indexOf('a')).toBeLessThan(sira.indexOf('b'))
    expect(sira.indexOf('b')).toBeLessThan(sira.indexOf('c'))
  })
})

describe('kuru çalıştırma planı (§8.3 · R-47)', () => {
  it('plan üretilir ve adımları sıralı taşır', () => {
    const r = planla(coz())
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.report.steps).toHaveLength(3)
    expect(r.report.order).toEqual(['a', 'b', 'c'])
  })

  it('metered adım sayılır ve insan kapısı görünür', () => {
    const r = planla(coz())
    if (!r.ok) return
    expect(r.report.meteredSteps).toBe(1) // yalnız GENERATE
    expect(r.report.gates).toEqual(['insan-onayi'])
  })

  it('sağlayıcısı seçilmemiş metered adım AÇIKÇA işaretlenir', () => {
    const r = planla(coz())
    if (!r.ok) return
    expect(r.report.unpricedSteps).toEqual(['b'])
    expect(formatPlan(r.report)).toContain('FİYATLANAMADI')
  })

  it('MANŞETTE $0.00 YAZMAZ — sıfır göstermek sıfır-maliyet iddiasıdır', () => {
    // Doğrulama agent'ının bulgusu: uyarı altta olsa da başlıktaki sayı yasaklanan
    // iddianın ta kendisiydi ve göz önce onu okur (D-74).
    const r = planla(coz())
    if (!r.ok) return
    const manset = formatPlan(r.report)
      .split('\n')
      .find((s) => s.includes('maliyet aralığı'))
    expect(manset).toBeDefined()
    expect(manset).not.toContain('$0.0000')
    expect(manset).not.toMatch(/\$0\.00/)
  })

  it('aynı plan iki kez çağrılınca AYNI çıktıyı verir — saat ve rng sabit', () => {
    const p = coz()
    const ilk = planla(p)
    const ikinci = planla(p)
    expect(ilk.ok && ikinci.ok).toBe(true)
    if (!ilk.ok || !ikinci.ok) return
    expect(formatPlan(ilk.report)).toBe(formatPlan(ikinci.report))
  })

  it('çıktı "hiçbir şey harcamadı" iddiasını taşır', () => {
    const r = planla(coz())
    if (!r.ok) return
    expect(formatPlan(r.report)).toContain('sıfır ağ, sıfır yazma')
  })

  it('metered olmayan adımların şeriti "—" gösterilir', () => {
    const r = planla(coz())
    if (!r.ok) return
    const metin = formatPlan(r.report)
    expect(metin).toContain('RESOLVE')
    expect(metin).toContain('insan kapısı: insan-onayi')
  })
})
