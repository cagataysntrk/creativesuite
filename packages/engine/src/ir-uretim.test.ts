// IR → COMPOSE → PDF: üretim kod yolu (§4c · FAZ-6.1, 6.2 · 2. doğrulama turu).
//
// İkinci doğrulama turu üç şeyi birden buldu: `deck.ir.json` hiç yazılmıyor/okunmuyor,
// `chart`/`diagram` bloklarını üreten gövde yok, ve "grafik PDF'te vektör" kriteri
// üretimde hiçbir çıktıda görünmüyor. Üçü tek kökten: **IR bir KAYNAK ve okuyanı yoktu.**

import { describe, expect, it } from 'vitest'
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { systemClock, systemRng, type AssetStamp, type DocumentModel } from '@suite/kernel'
import { isIrError, parseIr } from '@suite/render'
import type { BrandId, CorrelationId, EraId, RunId, StepId } from '@suite/contracts'
import { composeBody, renderBody } from './verbs/bodies.js'

const REPO = join(import.meta.dirname, '../../..')

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'deck',
  definitionDigest: 'sha256:x',
  contextManifest: 'x',
  sourceRunId: 'run_1',
}

const TOKENS =
  ':root{--role-bg:#101418;--role-text:#f2f4f7;--role-text-muted:#9aa4b2;' +
  '--role-line-hair:#2a323c;--role-surface:#161b22;--role-state-ok:#3fb950;' +
  '--role-state-warn:#d29922;--role-state-error:#f85149}'

const ctx = (stepId: string) => ({
  runId: 'run_ir' as RunId,
  stepId: stepId as StepId,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'imalat-2026' as EraId,
  correlationId: 'cor_ir' as CorrelationId,
  clock: systemClock,
  rng: systemRng,
})

/** Repodaki GERÇEK IR dosyası — elle yazılmış fikstür değil. */
const irOku = (): DocumentModel | null => {
  const ham = readFileSync(join(REPO, 'demos/ornek/deck.ir.json'), 'utf8')
  const r = parseIr(ham)
  return isIrError(r) ? null : r.doc
}

describe('IR üretim yolu', () => {
  it('repodaki `deck.ir.json` GEÇERLİ ve grafik + diyagram taşıyor', () => {
    const doc = irOku()
    expect(doc).not.toBeNull()
    expect(doc?.blocks.some((b) => b.type === 'chart')).toBe(true)
    expect(doc?.blocks.some((b) => b.type === 'diagram')).toBe(true)
  })

  it('COMPOSE IR verildiğinde metin üretimini ATLIYOR ve blokları IR’dan alıyor', async () => {
    const ir = irOku()
    const r = await composeBody({ tokenCss: TOKENS, stamp: DAMGA, ir }).run(ctx('kompozit'), {
      constraints: {},
      // Metin girdisi VERİLMİYOR: IR varken model çıktısı gerekmiyor.
      inputs: {},
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const d = r.value.data as { document: DocumentModel; irKullanildi: boolean }
    expect(d.irKullanildi).toBe(true)
    expect(d.document.blocks.some((b) => b.type === 'chart')).toBe(true)
    // Damga ÇALIŞTIRMADAN geliyor, IR'dan değil (R-11): IR aylar önce yazılmış olabilir.
    expect(d.document.stamp.definitionDigest).toBe('sha256:x')
    expect(d.document.tokenCss).toContain('--role-state-warn')
  })

  // 🧪 Asıl kanıt: IR'daki grafik gerçekten VEKTÖR olarak PDF'e giriyor mu.
  it('IR’dan gelen grafik PDF’te VEKTÖR — sıfır raster', async () => {
    const ir = irOku()
    const c = await composeBody({ tokenCss: TOKENS, stamp: DAMGA, ir }).run(ctx('kompozit'), {
      constraints: {},
      inputs: {},
    })
    expect(c.ok).toBe(true)
    if (!c.ok) return

    const d = mkdtempSync(join(tmpdir(), 'ir-pdf-'))
    const r = await renderBody({ outDir: d, layout: 'claim-proof' }).run(ctx('render'), {
      constraints: { format: 'pdf' },
      inputs: { kompozit: c.value.data },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const yol = (r.value.data as { deck: string }).deck
    const bayt = readFileSync(yol)
    expect(bayt.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    // Görüntü XObject YOK: grafik raster değil, çizim operatörleriyle geldi.
    expect(bayt.toString('latin1')).not.toContain('/Subtype /Image')
  }, 60_000)

  it('bozuk IR OKUMADA reddediliyor — render’ın ortasında değil', () => {
    const r = parseIr('{ bu json değil')
    expect(isIrError(r)).toBe(true)
  })
})

describe('kişiselleştirme üreticisi', () => {
  // 🧪 İkinci doğrulama turu: bu anahtarın yalnız OKUYUCULARI vardı, üreticisi yoktu —
  // `kisisellestirme` kapısı ve `personalization_cap` dedektörü ölüydü.
  it('`personalization` kısıtı ALAN listesi üretiyor', async () => {
    const r = await composeBody({ tokenCss: TOKENS, stamp: DAMGA }).run(ctx('kompozit'), {
      constraints: { personalization: 'Bursa tesisi, İhale kapsamı, Vardiya sayısı' },
      inputs: { metin: { lines: ['Ölçüm odaklı yaklaşım'] } },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const d = r.value.data as { personalizationFields: readonly { label: string }[] }
    expect(d.personalizationFields).toHaveLength(3)
    expect(d.personalizationFields[0]?.label).toBe('Bursa tesisi')
  })

  it('kısıt yoksa alan ÜRETİLMİYOR — boş liste bir iddia olurdu', async () => {
    const r = await composeBody({ tokenCss: TOKENS, stamp: DAMGA }).run(ctx('kompozit'), {
      constraints: {},
      inputs: { metin: { lines: ['Tek satır'] } },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(
      (r.value.data as { personalizationFields?: unknown }).personalizationFields
    ).toBeUndefined()
  })
})
