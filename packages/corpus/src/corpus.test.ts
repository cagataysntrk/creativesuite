import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { migrate, openDb, type Db } from '@suite/kernel'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import { parseFrontmatter, serializeFrontmatter } from './frontmatter.js'
import { INDEX_MIGRATIONS, search, upsertRecords, type IndexRow } from './search.js'
import { propose, recordPath, writeRecord } from './write.js'
import { reindex } from './reindex.js'

const BRAND = 'brd_0192f3a1-0000-7000-8000-00000000000a'

let tmp: TempDir
let kok: string
let db: Db

beforeEach(() => {
  tmp = makeTempDir('suite-corpus-')
  kok = tmp.path
  db = openDb({ path: ':memory:' })
  migrate(db, INDEX_MIGRATIONS)
})
afterEach(() => {
  db.close()
  tmp.cleanup()
})

const satir = (over: Partial<IndexRow> = {}): IndexRow => ({
  id: 'rec_1',
  brand_id: BRAND,
  type: 'positioning',
  status: 'active',
  era_id: 'era_1',
  locale: 'tr-TR',
  path: 'positioning/a.md',
  title: 'Ölçüm',
  body: 'İmalat hatlarında ölçümlerinizi güncelledik.',
  valid_at: null,
  invalid_at: null,
  expired_at: null,
  ...over,
})

describe('frontmatter — tek ayrıştırıcı (§3.5)', () => {
  it('ayrıştırma ile seri hâle getirme ters çifttir', () => {
    const fm = { id: 'rec_1', brand_id: BRAND, tags: ['a', 'b'], confidence: 0.8 }
    const govde = 'Gövde metni.\n\nİkinci paragraf.'
    const p = parseFrontmatter(serializeFrontmatter(fm, govde))
    expect(p.ok).toBe(true)
    if (!p.ok) return
    expect(p.value.frontmatter).toEqual(fm)
    expect(p.value.body.trimEnd()).toBe(govde)
  })

  it('bozuk dosya istisna DEĞİL, veri durumu döndürür', () => {
    expect(parseFrontmatter('frontmatter yok')).toEqual({
      ok: false,
      error: { kind: 'no_frontmatter' },
    })
    const kapanmamis = parseFrontmatter('---\nid: x\ngövde')
    expect(kapanmamis.ok).toBe(false)
    if (!kapanmamis.ok) expect(kapanmamis.error.kind).toBe('unterminated')
  })

  it('YAML bir liste ise reddedilir — kayıt bir eşlemedir', () => {
    const r = parseFrontmatter('---\n- a\n- b\n---\n')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('not_a_map')
  })
})

describe('yazma darboğazı — agent önerir, insan uygular (R-14)', () => {
  it('agent yalnız taslak yazabilir', () => {
    const r = writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1', status: 'active' },
      body: '',
      actor: 'agent',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.refusal.kind).toBe('agent_must_propose')
  })

  it('propose() status ve zone seçtirmez — kural konvansiyon değil', () => {
    const r = propose({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1' },
      body: 'x',
    })
    expect(r.ok).toBe(true)
    const yazilan = parseFrontmatter(readFileSync(recordPath(kok, 'positioning', 'a'), 'utf8'))
    expect(yazilan.ok).toBe(true)
    if (!yazilan.ok) return
    expect(yazilan.value.frontmatter?.['status']).toBe('draft')
    expect(yazilan.value.frontmatter?.['zone']).toBe('generated')
  })

  it('agent, elle düzenlenmiş kaydın üzerine YAZAMAZ', () => {
    writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1', status: 'active', zone: 'human' },
      body: 'insan yazdı',
      actor: 'human',
    })
    const r = propose({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1' },
      body: 'agent',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.refusal.kind).toBe('would_overwrite_human')
    expect(readFileSync(recordPath(kok, 'positioning', 'a'), 'utf8')).toContain('insan yazdı')
  })

  it('imza kırıksa çalıştırma durur (§4.5)', () => {
    writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1', status: 'active', zone: 'generated', x_signature: 'abc' },
      body: 'üretilmiş',
      actor: 'human',
    })
    const r = writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1', status: 'draft', zone: 'generated', x_signature: 'DEGISTI' },
      body: 'yeni',
      actor: 'agent',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.refusal.kind).toBe('signature_broken')
  })

  it('bozuk slug reddedilir — dosya yolu kazası olmaz', () => {
    for (const slug of ['../kacis', 'Büyük Harf', 'bosluk var', '']) {
      const r = writeRecord({
        root: kok,
        entityType: 'positioning',
        slug,
        frontmatter: { id: 'x', status: 'draft' },
        body: '',
        actor: 'human',
      })
      expect(r.ok, slug).toBe(false)
    }
  })
})

describe('Türkçe arama — iki tokenizer + RRF (§5.6 · D-62)', () => {
  beforeEach(() => {
    upsertRecords(db, [satir()])
  })

  it('"ölçüm" araması "ölçümlerinizi" bulur — kabul kriteri', () => {
    const hits = search(db, 'ölçüm')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0]?.id).toBe('rec_1')
  })

  it('aksansız tam kelime de bulunur', () => {
    expect(search(db, 'olcumlerinizi').length).toBeGreaterThan(0)
  })

  it('hangi indeksin bulduğu görünür — RRF şeffaf', () => {
    const tri = search(db, 'ölçüm')
    expect(tri[0]?.sources).toContain('trigram')
    const kelime = search(db, 'olcumlerinizi')
    expect(kelime[0]?.sources).toContain('word')
  })

  it('iki indeks birden bulursa skor daha yüksek', () => {
    upsertRecords(db, [
      satir({ id: 'rec_2', title: 'Başka', body: 'ölçümlerinizi ölçüm ölçümlerinizi' }),
    ])
    const hits = search(db, 'ölçümlerinizi')
    const ikiKaynakli = hits.find((h) => h.sources.length === 2)
    expect(ikiKaynakli).toBeDefined()
  })

  it('alakasız sorgu sonuç döndürmez', () => {
    expect(search(db, 'zeplin')).toEqual([])
  })

  it('tırnak içeren sorgu FTS5 operatörü olarak yorumlanmaz', () => {
    expect(() => search(db, 'ölçüm" OR "x')).not.toThrow()
  })

  it('güncelleme eski içeriği indekste bırakmaz', () => {
    // Başlık da değişmeli: ilk hâlinde yalnız gövdeyi değiştirmiştim ve arama kaydı
    // hâlâ BAŞLIKTAN buluyordu — test kodu suçluyordu, kod haklıydı.
    upsertRecords(db, [satir({ title: 'Lojistik', body: 'artık tamamen başka bir konu' })])
    expect(search(db, 'ölçüm')).toEqual([])
    expect(search(db, 'lojistik').length).toBeGreaterThan(0)
  })
})

describe('reindex — indeks silinebilir, corpus silinemez (D-27)', () => {
  it('sıfırdan kurar ve atlananları RAPORLAR', () => {
    propose({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1', brand_id: BRAND, title: 'Ölçüm' },
      body: 'ölçümlerinizi güncelledik',
    })
    // id'siz dosya: sessizce atlanmamalı, raporlanmalı
    writeRecord({
      root: kok,
      entityType: 'positioning',
      slug: 'bozuk',
      frontmatter: { baslik: 'id yok' },
      body: '',
      actor: 'human',
    })

    const rapor = reindex(db, kok)
    expect(rapor.indexed).toBe(1)
    expect(rapor.skipped).toEqual([{ path: 'positioning/bozuk.md', reason: 'id_yok' }])
    expect(search(db, 'ölçüm').length).toBe(1)
  })

  it('ikinci reindex aynı sonucu verir — idempotent', () => {
    propose({
      root: kok,
      entityType: 'positioning',
      slug: 'a',
      frontmatter: { id: 'rec_1', brand_id: BRAND, title: 'Ölçüm' },
      body: 'ölçümlerinizi',
    })
    expect(reindex(db, kok).indexed).toBe(1)
    expect(reindex(db, kok).indexed).toBe(1)
    expect(search(db, 'ölçüm').length).toBe(1)
  })
})
