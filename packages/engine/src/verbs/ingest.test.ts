// INGEST gövdesi — kopuk halkanın kapanması (§14 · D-216 · FAZ-6.10).
//
// Denetimin 4. ve 5. bulguları BİRLİKTE kapanıyor: gövde hem var olacak, hem çıktısında
// `fetchedAt` taşıyacak — çünkü `inspectManifest`in `stale_source` dedektörü tam olarak
// o anahtarı arıyor ve besleyeni yoktu.

import { describe, expect, it } from 'vitest'
import { createServer } from 'node:http'
import { existsSync, readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { systemClock, systemRng } from '@suite/kernel'
import type { BrandId, CorrelationId, EraId, RunId, StepId } from '@suite/contracts'
import { ingestBody } from './bodies.js'

const HTML =
  '<!doctype html><html><head><title>t</title><script>window.k=1</script></head>' +
  '<body><h1>Sentetik Döküm</h1><p>Fire ölçümü ve vardiya takibi.</p></body></html>'

const ctx = () => ({
  runId: 'run_test' as RunId,
  stepId: 'arastir' as StepId,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'imalat-2026' as EraId,
  correlationId: 'cor_test' as CorrelationId,
  clock: systemClock,
  rng: systemRng,
})

const sunucuyla = async <T>(fn: (url: string) => Promise<T>): Promise<T> => {
  const srv = createServer((_, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(HTML)
  })
  await new Promise<void>((r) => srv.listen(0, '127.0.0.1', () => r()))
  const port = (srv.address() as { port: number }).port
  try {
    return await fn(`http://127.0.0.1:${port}/hakkimizda`)
  } finally {
    srv.close()
  }
}

describe('INGEST gövdesi (bağlanma)', () => {
  it('kaynağı çekiyor, karantinaya metin + sidecar YAZIYOR', async () => {
    const kok = mkdtempSync(join(tmpdir(), 'ingest-'))
    await sunucuyla(async (url) => {
      const verb = ingestBody({ repoRoot: kok, env: {} })
      const r = await verb.run(ctx(), { constraints: { url }, inputs: {} })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const d = r.value.data as { quarantinePath: string; domain: string; fetchedAt: string }
      // Metin diskte…
      const metin = join(kok, d.quarantinePath)
      expect(existsSync(metin)).toBe(true)
      expect(readFileSync(metin, 'utf8')).toContain('Fire ölçümü')
      // …script gövdesi SIZMADI (§14)
      expect(readFileSync(metin, 'utf8')).not.toContain('window.k')
      // …ve sidecar YANINDA
      expect(existsSync(`${metin.replace(/\.txt$/, '')}.provenance.json`)).toBe(true)
    })
  })

  /**
   * 🧪 Zincirin kopuk halkası: çıktı `fetchedAt` taşımazsa `stale_source` dedektörü
   * sonsuza kadar sessiz kalır. Dedektörün doğru çalışması YETMEZ — beslenmesi gerekir.
   */
  it('çıktı `fetchedAt` ve `sourceRef` taşıyor — dedektörün okuduğu anahtarlar', async () => {
    const kok = mkdtempSync(join(tmpdir(), 'ingest-'))
    await sunucuyla(async (url) => {
      const verb = ingestBody({ repoRoot: kok, env: {} })
      const r = await verb.run(ctx(), { constraints: { url }, inputs: {} })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const d = r.value.data as Record<string, unknown>
      expect(typeof d['fetchedAt']).toBe('string')
      expect(typeof d['sourceRef']).toBe('string')
      expect(String(d['fetchedAt'])).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  it('bloke kaynaklar RAPORLANIYOR — sessizce atlanmıyor', async () => {
    const kok = mkdtempSync(join(tmpdir(), 'ingest-'))
    await sunucuyla(async (url) => {
      const verb = ingestBody({ repoRoot: kok, env: {} })
      const r = await verb.run(ctx(), { constraints: { url }, inputs: {} })
      if (!r.ok) return
      const d = r.value.data as { sourcesReady: number; sourcesBlocked: number }
      expect(d.sourcesReady).toBe(1)
      expect(d.sourcesBlocked).toBe(4)
    })
  })

  it('URL’siz çağrı HATA — "hiçbir şey bulunamadı" ile karıştırılmıyor', async () => {
    const verb = ingestBody({ repoRoot: mkdtempSync(join(tmpdir(), 'ingest-')), env: {} })
    const r = await verb.run(ctx(), { constraints: {}, inputs: {} })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('NO_SOURCE_URL')
  })

  it('LinkedIn profili AĞA ÇIKMADAN reddediliyor', async () => {
    const verb = ingestBody({ repoRoot: mkdtempSync(join(tmpdir(), 'ingest-')), env: {} })
    const r = await verb.run(ctx(), {
      constraints: { url: 'https://www.linkedin.com/in/biri' },
      inputs: {},
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(JSON.stringify(r.error.details)).toContain('forbidden_source')
  })
})
