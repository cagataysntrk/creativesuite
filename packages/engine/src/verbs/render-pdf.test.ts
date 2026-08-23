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
  // ⚠ ⚠ **VARSAYILAN PNG → JPEG (R-90) ve bu bir test zayıflatması DEĞİL.** Graph API
  // *"JPEG is the only image format supported"* diyor; PNG üretmek yayın anında —
  // dört görsel ve bir insan onayı harcandıktan SONRA — reddedilmek demekti. Testin
  // koruduğu şey "PNG" değil, **slaytın gerçekten yazıldığı**; biçim artık yayın
  // sözleşmesinden geliyor ve iddia ona göre güncellendi.
  it('kısıtsız çağrı JPEG üretiyor — yayın sözleşmesi (R-90)', async () => {
    const d = mkdtempSync(join(tmpdir(), 'render-jpg-'))
    const r = await kos({}, d)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const veri = r.value.data as { slides?: string[] }
    expect(veri.slides?.[0]).toMatch(/slayt-01\.jpg$/)
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

// ── ürün ekranı çekimi (bulgu 6 + 8) ────────────────────────────────────────
import { createServer } from 'node:http'
import { composeBody } from './bodies.js'

const URUN_HTML =
  '<!doctype html><meta charset="utf-8"><div data-hazir><h1>dima — fire paneli</h1></div>'

describe('RENDER · ürün ekranı çekimi (bağlanma)', () => {
  it('`capture: product` GERÇEK bir PNG çekiyor ve künyesini döndürüyor', async () => {
    const srv = createServer((_, res) => {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      res.end(URUN_HTML)
    })
    await new Promise<void>((r) => srv.listen(0, '127.0.0.1', () => r()))
    const port = (srv.address() as { port: number }).port
    const d = mkdtempSync(join(tmpdir(), 'capture-'))
    try {
      const r = await renderBody({ outDir: d, layout: 'statement' }).run(ctx(), {
        constraints: {
          capture: 'product',
          url: `http://127.0.0.1:${port}/`,
          demo_ref: 'demos/dima/demo-script.ts#fire',
          ready_selector: '[data-hazir]',
          width: 800,
          height: 400,
        },
        inputs: {},
      })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const c = (r.value.data as { capture: Record<string, string> }).capture
      expect(existsSync(c['path']!)).toBe(true)
      expect(readFileSync(c['path']!).subarray(1, 4).toString('latin1')).toBe('PNG')
      expect(c['demoRef']).toContain('demo-script')
    } finally {
      srv.close()
    }
  }, 60_000)

  it('kaynaksız çekim REDDEDİLİYOR — denetlenemeyen iddia beyandır', async () => {
    const d = mkdtempSync(join(tmpdir(), 'capture-'))
    const r = await renderBody({ outDir: d, layout: 'statement' }).run(ctx(), {
      constraints: { capture: 'product', url: 'http://127.0.0.1:1/' },
      inputs: {},
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('CAPTURE_SOURCE_MISSING')
  })

  // 🧪 Bulgu 8: `role: 'product_screenshot'` alanının okuyanı yoktu. Artık COMPOSE onu
  // ÜRETİYOR ve aynı kaynaktan `productShots` kaydını doğuruyor — blok ile defter
  // kaydı ayrışamaz.
  it('COMPOSE çekimi `role` bloğuna VE `productShots` kaydına çeviriyor', async () => {
    const r = await composeBody({
      tokenCss: ':root{--role-bg:#000}',
      stamp: DAMGA,
    }).run(ctx(), {
      constraints: {},
      inputs: {
        metin: { lines: ['Ölçüm odaklı yaklaşım', 'Vardiya bazlı takip'] },
        urun: {
          capture: {
            path: '/tmp/urun.png',
            captureRunId: 'run_x',
            demoRef: 'demos/dima#fire',
            alt: 'dima paneli',
          },
        },
      },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const d = r.value.data as {
      document: { blocks: readonly { type: string; role?: string }[] }
      productShots: readonly { captureRunId: string; aiGenerated: boolean }[]
    }
    expect(
      d.document.blocks.some((b) => b.type === 'image' && b.role === 'product_screenshot')
    ).toBe(true)
    expect(d.productShots).toHaveLength(1)
    expect(d.productShots[0]?.aiGenerated).toBe(false)
  })

  it('çekim YOKSA belge ürün ekranı TAŞIMIYOR — uydurma ekrana dönüşmüyor', async () => {
    const r = await composeBody({ tokenCss: ':root{}', stamp: DAMGA }).run(ctx(), {
      constraints: {},
      inputs: { metin: { lines: ['Tek satır'] } },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const d = r.value.data as { productShots?: unknown }
    expect(d.productShots).toBeUndefined()
  })
})

// 🧪 `max_pages` ölü kısıttı (2. doğrulama turu, bulgu 14): YAML'da duruyordu ve
// hiçbir kod okumuyordu. Ölü bir kısıt, okunduğu sanılan bir kısıttır.
describe('RENDER · max_pages kısıtı', () => {
  it('sayfa tavanını aşan döküman REDDEDİLİYOR', async () => {
    const d = mkdtempSync(join(tmpdir(), 'render-mp-'))
    const uzunBelge: DocumentModel = {
      ...belge(),
      blocks: Array.from({ length: 12 }, (_, i) => ({
        type: 'heading' as const,
        text: `Başlık ${i + 1}`,
        level: 1 as const,
      })),
    }
    const r = await renderBody({ outDir: d, layout: 'statement' }).run(ctx(), {
      constraints: { format: 'pdf', flatten: true, max_pages: 2 },
      inputs: { kompozit: { document: uzunBelge } },
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('DOCUMENT_REJECTED')
    expect(JSON.stringify(r.error.details)).toContain('too_many_pages')
  }, 60_000)
})
