import { describe, expect, it } from 'vitest'
import { readJsonFixture } from '../testing/fixtures.js'
import { compile, toForm, toLlmSchema, toSqliteDdl, toTypeScript } from './compile.js'
import { validateSchema, type EntityTypeSchema } from './types.js'

const sema = (): EntityTypeSchema =>
  structuredClone(readJsonFixture('schemas', 'positioning.type.json')) as EntityTypeSchema

import type { Projections } from './compile.js'

const derle = (s: unknown): Projections => {
  const r = compile(s)
  expect(r.ok, r.ok ? '' : JSON.stringify(r.errors)).toBe(true)
  return (r as { ok: true; value: Projections }).value
}

describe('profil doğrulaması (§3.3)', () => {
  it('temiz şema hata vermez', () => {
    expect(validateSchema(sema())).toEqual([])
  })

  it('yasak anahtar reddedilir — dört projeksiyondan biri onu çeviremez', () => {
    const s = { ...sema(), oneOf: [{ type: 'string' }] }
    expect(validateSchema(s)).toContainEqual({
      kind: 'forbidden_keyword',
      path: '',
      keyword: 'oneOf',
    })
  })

  it('iç içe nesnede yasak anahtar da yakalanır', () => {
    const s = sema()
    const props = {
      ...s.properties,
      scope: { ...s.properties?.['scope'], not: { type: 'string' } },
    }
    const hatalar = validateSchema({ ...s, properties: props })
    expect(hatalar.some((e) => e.kind === 'forbidden_keyword' && e.path === '/scope')).toBe(true)
  })

  it('tipsiz alan reddedilir — DDL sütun üretemez', () => {
    const s = sema()
    const props = { ...s.properties, bozuk: { title: 'tip yok' } }
    const hatalar = validateSchema({ ...s, properties: props })
    expect(hatalar.some((e) => e.kind === 'missing_type')).toBe(true)
  })

  it('items olmayan dizi reddedilir', () => {
    const s = sema()
    const props = { ...s.properties, liste: { type: 'array' } }
    expect(
      validateSchema({ ...s, properties: props }).some((e) => e.kind === 'array_without_items')
    ).toBe(true)
  })

  it('$id olmadan derlenmez — tablo ve tip adı ondan türüyor', () => {
    const s = sema() as unknown as Record<string, unknown>
    delete s['$id']
    expect(validateSchema(s).some((e) => e.kind === 'missing_id')).toBe(true)
  })
})

describe('🧪 additionalProperties:false olmayan iç içe nesne', () => {
  // Kabul kriterinin ihlal testi: bu geçseydi, katı LLM şeması modelin UYDURDUĞU
  // alanı sessizce kabul ederdi ve o alan corpus'a girerdi.
  const bozuk = () => {
    const s = sema()
    const scope = { ...(s.properties?.['scope'] as unknown as Record<string, unknown>) }
    delete scope['additionalProperties']
    return { ...s, properties: { ...s.properties, scope } }
  }

  it('doğrulama REDDEDER', () => {
    expect(validateSchema(bozuk())).toContainEqual({
      kind: 'object_without_additional_properties_false',
      path: '/scope',
    })
  })

  it('derleme hiç çalışmaz — üç geçerli bir bozuk projeksiyon üretilmez', () => {
    const r = compile(bozuk())
    expect(r.ok).toBe(false)
  })

  it('kök nesnede de aynı kural', () => {
    const s = sema() as unknown as Record<string, unknown>
    delete s['additionalProperties']
    expect(
      validateSchema(s).some((e) => e.kind === 'object_without_additional_properties_false')
    ).toBe(true)
  })
})

describe('katı LLM şeması — en sert projeksiyon (V-05)', () => {
  const llm = () => toLlmSchema(sema())

  it('strict ve additionalProperties:false', () => {
    const l = llm()
    expect(l['strict']).toBe(true)
    expect((l['schema'] as Record<string, unknown>)['additionalProperties']).toBe(false)
  })

  it('HER alan required — opsiyonel alan modelin sessizce atlayabileceği alandır', () => {
    const s = llm()['schema'] as Record<string, unknown>
    const props = Object.keys(s['properties'] as Record<string, unknown>)
    expect(s['required']).toEqual(props)
  })

  it('emekli alan modelden İSTENMEZ', () => {
    const s = llm()['schema'] as Record<string, unknown>
    expect(Object.keys(s['properties'] as Record<string, unknown>)).not.toContain('legacy_tagline')
  })

  it('iç içe nesne de katı', () => {
    const s = llm()['schema'] as unknown as Record<string, Record<string, Record<string, unknown>>>
    const scope = s['properties']?.['scope'] as Record<string, unknown>
    expect(scope['additionalProperties']).toBe(false)
    expect(scope['required']).toEqual(['vertical', 'region'])
  })
})

describe('TypeScript projeksiyonu', () => {
  const ts = () => toTypeScript(sema())

  it('zorunlu ve opsiyonel alanları ayırır', () => {
    expect(ts()).toContain('readonly statement: string')
    expect(ts()).toContain('readonly seat_count?: number')
  })

  it('enum birleşim tipine çevrilir', () => {
    expect(ts()).toContain("readonly kind: 'saas' | 'bespoke'")
  })

  it('emekli alan tipte KALIR ama @deprecated — tarihsel kayıt okunabilir', () => {
    expect(ts()).toContain('@deprecated')
    expect(ts()).toContain('readonly legacy_tagline?: string')
  })

  it("tip adı $id'den PascalCase türer", () => {
    expect(ts()).toContain('export interface PositioningAttributes')
  })
})

describe('SQLite DDL projeksiyonu (§3.5)', () => {
  const ddl = () => toSqliteDdl(sema())

  it('tablo adı ön ekli, record_id birincil anahtar', () => {
    expect(ddl()).toContain('CREATE TABLE IF NOT EXISTS attr_positioning')
    expect(ddl()).toContain('record_id TEXT PRIMARY KEY')
  })

  it('tip eşlemesi doğru — boolean INTEGER, dizi/nesne TEXT', () => {
    expect(ddl()).toContain('is_primary INTEGER')
    expect(ddl()).toContain('proof_points TEXT NOT NULL')
    expect(ddl()).toContain('scope TEXT NOT NULL')
    expect(ddl()).toContain('seat_count INTEGER')
  })

  it('emekli alan sütunu KALIR — silmek tarihsel kaydı okunamaz yapar', () => {
    expect(ddl()).toContain('legacy_tagline TEXT')
    expect(ddl()).not.toContain('legacy_tagline TEXT NOT NULL')
  })

  it('gerçek SQLite bunu kabul ediyor', async () => {
    const { openDb } = await import('../db.js')
    const db = openDb({ path: ':memory:' })
    db.exec(ddl())
    const sutunlar = db.prepare('PRAGMA table_info(attr_positioning)').all() as { name: string }[]
    expect(sutunlar.map((c) => c.name)).toContain('statement')
    db.close()
  })
})

describe('rjsf form projeksiyonu', () => {
  it('emekli alan forma GİRMEZ — doldurmaya davet etmek yanlış', () => {
    const f = toForm(sema())
    const props = (f.schema['properties'] as Record<string, unknown>) ?? {}
    expect(Object.keys(props)).not.toContain('legacy_tagline')
    expect(f.schema['required']).not.toContain('legacy_tagline')
  })

  it('uzun metin textarea olur — Türkçe metin dar kutuda kırpılır (R-23)', () => {
    expect(toForm(sema()).uiSchema['statement']).toEqual({ 'ui:widget': 'textarea' })
  })
})

describe('dört projeksiyon birlikte — snapshot (kabul kriteri)', () => {
  it('tek şemadan dördü de üretiliyor ve sabit kalıyor', () => {
    const v = derle(sema())
    expect({
      form: v.form,
      typescript: v.typescript,
      llm: v.llm,
      ddl: v.ddl,
    }).toMatchSnapshot()
  })
})
