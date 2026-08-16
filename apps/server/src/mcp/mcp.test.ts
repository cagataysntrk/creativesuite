import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'
import { kurSunucu } from '../sunucu.js'
import { ARACLAR, mcpHataMesaji, oneriDogrula } from './araclar.js'

const SORGU = { brandId: 'brd_test', eraId: 'era_test', asOf: '2026-08-16T00:00:00.000Z' } as const

const kur = () => {
  const kok = mkdtempSync(join(tmpdir(), 'mcp-'))
  mkdirSync(join(kok, RUNS_DIR), { recursive: true })
  mkdirSync(join(kok, 'registry'), { recursive: true })
  return kurSunucu({
    repoRoot: kok,
    query: SORGU,
    kalpAtisiMs: 50,
    debounceMs: 10,
    simdi: () => '2026-08-16T10:00:00.000Z',
  })
}

describe('MCP araç sözleşmesi', () => {
  it('üç araç açılıyor — her yeni araç yeni bir bakım borcu', () => {
    expect(ARACLAR.map((a) => a.ad)).toEqual(['corpus_search', 'corpus_get', 'corpus_propose'])
  })

  // 🧪 FAZ-8.9 ihlal testi: MCP'den `status: active` yazmayı dene → REDDEDİLİYOR.
  // Sessizce silmek, çağıranın "active yazdım" sanmasına yol açardı; reddetmek
  // kuralı öğretiyor.
  it('status/zone/x_signature alanları REDDEDİLİYOR, yok sayılmıyor', () => {
    for (const alan of ['status', 'zone', 'x_signature']) {
      const r = oneriDogrula({ [alan]: 'active' })
      expect(r?.kind).toBe('status_not_accepted')
      expect(mcpHataMesaji(r!)).toContain('draft')
    }
  })

  it('temiz frontmatter geçiyor', () => {
    expect(oneriDogrula({ type: 'fact', brand_id: 'brd_test' })).toBeNull()
  })
})

describe('MCP uçları', () => {
  it('araç listesi sunucudan geliyor', async () => {
    const s = kur()
    try {
      const j = (await (await s.app.request('/mcp/araclar')).json()) as { araclar: unknown[] }
      expect(j.araclar).toHaveLength(3)
    } finally {
      s.kapat()
    }
  })

  it('bilinmeyen araç 404 — sessizce boş dönmüyor', async () => {
    const s = kur()
    try {
      const r = await s.app.request('/mcp/cagir/corpus_delete', { method: 'POST' })
      expect(r.status).toBe(404)
    } finally {
      s.kapat()
    }
  })

  // **İndeks yoksa "sonuç yok" DEĞİL**: arama hiç koşmadı (D-175). Boş liste
  // dönmek, corpus'un boş olduğunu söylerdi.
  it('indeks yoksa 503 ve "arama KOŞMADI" diyor', async () => {
    const s = kur()
    try {
      const r = await s.app.request('/mcp/cagir/corpus_search', {
        method: 'POST',
        body: JSON.stringify({ query: 'ölçüm' }),
      })
      expect(r.status).toBe(503)
      expect(((await r.json()) as { hata: string }).hata).toContain('KOŞMADI')
    } finally {
      s.kapat()
    }
  })
})
