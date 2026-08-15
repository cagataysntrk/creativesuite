// GERÇEK Chromium ile piksel örnekleme (§11.1 · D-110).

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { renderStatic } from '../static.js'
import { measure, paletteToLab, pixelStats } from './measure.js'
import { pngSize, samplePng } from './pixels.js'
import { formatReport } from './tolerance.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

/** Marka token'ları: koyu zemin, açık metin, tek aksan. */
const TOKEN_CSS = ':root { --role-bg: #101418; --role-text: #f2f4f7; --role-text-muted: #9aa4b2; }'
const PALET = { colors: ['#101418', '#f2f4f7', '#9aa4b2'] }

const belge = (over: Partial<DocumentModel> = {}): DocumentModel => ({
  kind: 'post',
  width: 1080,
  height: 1350,
  tokenCss: TOKEN_CSS,
  stamp: DAMGA,
  blocks: [
    { type: 'heading', text: 'Ölçemediğiniz fireyi yönetemezsiniz', level: 1 },
    { type: 'body', text: 'ĞÜŞİÖÇ ğüşıöç Ağrı İğne' },
  ],
  ...over,
})

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-qa-')
})
afterEach(() => tmp.cleanup())

describe('uçtan uca marka QA — GERÇEK render, GERÇEK piksel', () => {
  it("marka token'larıyla render edilen görsel TOLERANS İÇİ", async () => {
    const yol = join(tmp.path, 'marka.png')
    const r = await renderStatic(belge(), yol)
    expect(r.ok).toBe(true)

    const ornek = await samplePng(yol, { grid: 32 })
    expect(ornek.ok).toBe(true)
    if (!ornek.ok) return
    // Örnekleme GERÇEKTEN çalıştı mı — boş dizi "palet dışı %0" demekti.
    expect(ornek.value.length).toBeGreaterThan(500)

    const rapor = measure({
      doc: belge(),
      palette: PALET,
      pixels: ornek.value,
      targetAspect: 1080 / 1350,
    })
    expect(rapor.blocked, formatReport(rapor)).toBe(false)
  }, 60_000)

  it('palet DIŞI zeminle render edilen görsel SINIR DIŞI', async () => {
    // Kuralı kasten çiğne: marka token'ı yerine parlak macenta zemin.
    const yol = join(tmp.path, 'ihlal.png')
    const bozuk = belge({
      tokenCss: ':root { --role-bg: #FF00AA; --role-text: #00FF66; --role-text-muted: #00FF66; }',
    })
    const r = await renderStatic(bozuk, yol)
    expect(r.ok).toBe(true)

    const ornek = await samplePng(yol, { grid: 32 })
    expect(ornek.ok).toBe(true)
    if (!ornek.ok) return

    const rapor = measure({
      doc: bozuk,
      palette: PALET,
      pixels: ornek.value,
      targetAspect: 1080 / 1350,
    })
    expect(rapor.blocked).toBe(true)
    const p = rapor.readings.find((x) => x.metric === 'off_palette')
    expect(p?.status).toBe('out')
    expect(p?.value).toBeGreaterThan(90)
  }, 60_000)

  it('örnekleme DETERMİNİSTİK — aynı görsel aynı sayı', async () => {
    // Rastgele örnekleme aynı görselde iki farklı QA sonucu üretir ve manifest'e
    // yazılan sayı tekrar üretilemez olur (§13).
    const yol = join(tmp.path, 'det.png')
    await renderStatic(belge(), yol)
    const a = await samplePng(yol, { grid: 16 })
    const b = await samplePng(yol, { grid: 16 })
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    const s = (px: typeof a.value) => pixelStats(px, paletteToLab(PALET), 5)
    expect(s(a.value)).toEqual(s(b.value))
  }, 90_000)

  it('PNG boyutu başlıktan okunuyor — tarayıcı açmadan', async () => {
    const yol = join(tmp.path, 'boyut.png')
    await renderStatic(belge(), yol)
    expect(pngSize(yol)).toEqual({ w: 1080, h: 1350 })
  }, 60_000)
})
