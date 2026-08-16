// RENDER gövdesi `format: pdf` kısıtını GERÇEKTEN okuyor mu (§7.6 · D-216 · FAZ-6.10).
//
// **Bu bir bağlanma testidir, bir birim testi değil.** `renderDeckPdf`in doğru çalıştığı
// zaten kanıtlıydı — eksik olan, üretim gövdesinin onu ÇAĞIRMASIYDI. FAZ 6 denetimi
// diskte sıfır PDF buldu ve "deck.pdf üretiliyor" kriteri tikliydi.

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import { systemClock, systemRng } from '@suite/kernel'
import type { BrandId, CorrelationId, EraId, RunId, StepId } from '@suite/contracts'
import { renderBody } from './bodies.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const belge = (): DocumentModel => ({
  kind: 'deck-page',
  width: 1600,
  height: 900,
  tokenCss:
    ':root{--role-bg:#101418;--role-text:#f2f4f7;--role-text-muted:#9aa4b2;--role-line-hair:#2a323c;--role-surface:#161b22;--role-state-ok:#3fb950;--role-state-warn:#d29922;--role-state-error:#f85149}',
  stamp: DAMGA,
  blocks: [
    { type: 'heading', text: 'ĞÜŞİÖÇ ğüşıöç Ağrı İğne', level: 1 },
    { type: 'body', text: 'İmalatta fire ölçümü ve vardiya bazlı eğilim takibi' },
  ],
})

const ctx = () => ({
  runId: 'run_test' as RunId,
  stepId: 'render' as StepId,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'imalat-2026' as EraId,
  correlationId: 'cor_test' as CorrelationId,
  clock: systemClock,
  rng: systemRng,
})

const kos = async (constraints: Record<string, unknown>, outDir: string) => {
  const verb = renderBody({ outDir, layout: 'statement' })
  return verb.run(ctx(), { constraints, inputs: { kompozit: { document: belge() } } })
}

describe('RENDER gövdesi · PDF yolu (bağlanma)', () => {
  it('kısıtsız çağrı PNG üretiyor — varsayılan davranış korunuyor', async () => {
    const d = mkdtempSync(join(tmpdir(), 'render-png-'))
    const r = await kos({}, d)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const veri = r.value.data as { slides?: string[] }
    expect(veri.slides?.[0]).toMatch(/slayt-01\.png$/)
    expect(existsSync(veri.slides![0]!)).toBe(true)
  }, 60_000)

  // 🧪 Denetimin 1. bulgusu: gövde `format: pdf`i hiç okumuyordu.
  it('`format: pdf` GERÇEK bir PDF yazıyor', async () => {
    const d = mkdtempSync(join(tmpdir(), 'render-pdf-'))
    const r = await kos({ format: 'pdf' }, d)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const veri = r.value.data as { deck?: string; pages?: number; flattened?: boolean }
    expect(veri.deck).toMatch(/deck\.pdf$/)
    expect(veri.flattened).toBe(false)
    expect(existsSync(veri.deck!)).toBe(true)
    // Dosya GERÇEKTEN PDF: sihirli sayı. "Yol döndü" yetmez — dosya var mı, PDF mi.
    expect(readFileSync(veri.deck!).subarray(0, 5).toString('latin1')).toBe('%PDF-')
    expect(veri.pages).toBeGreaterThan(0)
  }, 60_000)

  // 🧪 Denetimin 10. bulgusu: `renderLinkedinDocument` sıfır çağıran.
  it('`flatten: true` DÜZLEŞTİRİLMİŞ döküman yazıyor', async () => {
    const d = mkdtempSync(join(tmpdir(), 'render-doc-'))
    const r = await kos({ format: 'pdf', flatten: true }, d)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const veri = r.value.data as { document?: string; flattened?: boolean; quality?: number }
    expect(veri.document).toMatch(/dokuman\.pdf$/)
    expect(veri.flattened).toBe(true)
    // Kalite merdiveninin hangi basamağında durulduğu manifeste yazılıyor (§9.3).
    expect(veri.quality).toBeGreaterThan(0)
    expect(readFileSync(veri.document!).subarray(0, 5).toString('latin1')).toBe('%PDF-')
  }, 60_000)

  it('bayt tavanı aşılırsa REDDEDİYOR — "üretildi ama reddedilir" dosya yok', async () => {
    const d = mkdtempSync(join(tmpdir(), 'render-red-'))
    // 1 KB tavan: merdivenin en alt basamağı bile geçemez.
    const r = await kos({ format: 'pdf', flatten: true, max_bytes: 1024 }, d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('DOCUMENT_REJECTED')
  }, 120_000)
})
