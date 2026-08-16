import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'
import { kurSunucu } from '../sunucu.js'
import { ARACLAR, ZORUNLU_DAMGA, girdiDogrula, mcpHataMesaji, oneriDogrula } from './araclar.js'

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
    expect(oneriDogrula({ type: 'fact', brand_id: 'brd_test', era_id: 'imalat-2026' })).toBeNull()
  })

  // 🧪 7. yasa (§4.3): damga ÜRETİM ANINDA basılır, sonradan retrofit imkânsız.
  describe('zorunlu damga — commit beklenmeden', () => {
    it('era_id yoksa reddediliyor', () => {
      const r = oneriDogrula({ type: 'fact', brand_id: 'brd_test' })
      expect(r).toMatchObject({ kind: 'damga_eksik', alanlar: ['era_id'] })
      expect(mcpHataMesaji(r!)).toContain('7. yasa')
    })

    it('üçü birden eksikse ÜÇÜ de adıyla raporlanıyor', () => {
      const r = oneriDogrula({})
      expect(r).toMatchObject({ kind: 'damga_eksik', alanlar: [...ZORUNLU_DAMGA] })
    })

    it('boş dize damga sayılmıyor — var görünüp yok olmak en kötüsü', () => {
      const r = oneriDogrula({ type: 'fact', brand_id: '  ', era_id: 'imalat-2026' })
      expect(r).toMatchObject({ kind: 'damga_eksik', alanlar: ['brand_id'] })
    })

    it('`status` reddi damga kontrolünden ÖNCE gelir — yazma kapısı tektir', () => {
      expect(oneriDogrula({ status: 'active' })).toMatchObject({ kind: 'status_not_accepted' })
    })
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

// 🧪 D-234: şema bir belge değil, bir kapıdır.
describe('girdi şeması ZORLANIYOR', () => {
  const arama = ARACLAR.find((a) => a.ad === 'corpus_search')!
  const oneri = ARACLAR.find((a) => a.ad === 'corpus_propose')!

  it('zorunlu alan yoksa reddediliyor — boş liste "sonuç yok" DEMEK DEĞİL (D-175)', () => {
    const r = girdiDogrula(arama, {})
    expect(r).toMatchObject({ kind: 'girdi_gecersiz', alan: 'query' })
  })

  it('minLength zorlanıyor', () => {
    expect(girdiDogrula(arama, { query: 'a' })).toMatchObject({ alan: 'query' })
    expect(girdiDogrula(arama, { query: 'ölçüm' })).toBeNull()
  })

  it('maximum zorlanıyor — 100000 limitli bir sorgu sunucuyu boğardı', () => {
    expect(girdiDogrula(arama, { query: 'ölçüm', limit: 100000 })).toMatchObject({
      alan: 'limit',
    })
    expect(girdiDogrula(arama, { query: 'ölçüm', limit: 50 })).toBeNull()
  })

  it('tanımsız alan reddediliyor (additionalProperties: false)', () => {
    expect(girdiDogrula(arama, { query: 'ölçüm', zone: 'human' })).toMatchObject({
      alan: 'zone',
    })
  })

  it('pattern zorlanıyor — slug biçimi', () => {
    const temel = { entityType: 'fact', frontmatter: {}, body: 'x' }
    expect(girdiDogrula(oneri, { ...temel, slug: 'Büyük Harf' })).toMatchObject({ alan: 'slug' })
    expect(girdiDogrula(oneri, { ...temel, slug: 'olcum-pilotu' })).toBeNull()
  })

  it('tip uyuşmazlığı yakalanıyor', () => {
    expect(girdiDogrula(arama, { query: 42 })).toMatchObject({ alan: 'query' })
  })
})
