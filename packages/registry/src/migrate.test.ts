import { describe, expect, it } from 'vitest'
import type { EntityTypeSchema } from '@suite/kernel'
import { diffSchemas, impactMessage, migrationImpact, type MigrationRecord } from './migrate.js'

const sema = (o: Partial<EntityTypeSchema>): EntityTypeSchema => ({
  $id: 'competitor',
  type: 'object',
  additionalProperties: false,
  properties: { name: { type: 'string' }, kind: { type: 'string' } },
  required: ['name'],
  ...o,
})

const kayit = (id: string, attrs: Record<string, unknown>): MigrationRecord => ({
  id,
  alanlar: attrs,
})

const KAYITLAR = [
  kayit('r1', { name: 'Excel', kind: 'spreadsheet_status_quo' }),
  kayit('r2', { name: 'Danışman' }), // `kind` YOK
  kayit('r3', { name: 'SAP', kind: 'direct_product' }),
]

describe('şema göç analizi (§3.3 · FAZ-4.11)', () => {
  it('alan SİLMEK reddedilir ve `x-retired` ÖNERİLİR — reddetmek yetmez', () => {
    const yeni = sema({ properties: { name: { type: 'string' } } })
    const i = migrationImpact(diffSchemas(sema({}), yeni), KAYITLAR)
    expect(i.safe).toBe(false)
    expect(i.refusals[0]?.change.kind).toBe('field_removed')
    expect(i.refusals[0]?.suggestion).toContain('x-retired')
  })

  it('alan silmek SIFIR kayıt etkilese bile reddedilir', () => {
    // Gelecekte yazılacak tarihsel okuyucular da kırılır; sayı bu kararı değiştirmez.
    const yeni = sema({ properties: { name: { type: 'string' } } })
    const i = migrationImpact(diffSchemas(sema({}), yeni), [])
    expect(i.refusals).toHaveLength(1)
  })

  it('zorunlu yapmak kaç kaydın kırılacağını SAYIYLA söyler', () => {
    const yeni = sema({ required: ['name', 'kind'] })
    const i = migrationImpact(diffSchemas(sema({}), yeni), KAYITLAR)
    expect(i.broken).toHaveLength(1)
    expect(i.broken[0]?.recordId).toBe('r2')
    expect(i.scanned).toBe(3)
    // "12 kayıt kırılacak" bir uyarıdır; "şu kayıt" bir iş listesidir.
    expect(impactMessage(i)).toContain('1 kayıt kırılacak')
  })

  it('`x-retired` GÜVENLİ — kayıtlar okunabilir kalır', () => {
    const yeni = sema({
      properties: { name: { type: 'string' }, kind: { type: 'string', 'x-retired': true } },
    })
    const i = migrationImpact(diffSchemas(sema({}), yeni), KAYITLAR)
    expect(i.safe).toBe(true)
    expect(i.changes[0]?.kind).toBe('field_retired')
  })

  it('isteğe bağlı alan eklemek GÜVENLİ', () => {
    const yeni = sema({
      properties: { name: { type: 'string' }, kind: { type: 'string' }, note: { type: 'string' } },
    })
    const i = migrationImpact(diffSchemas(sema({}), yeni), KAYITLAR)
    expect(i.safe).toBe(true)
  })

  it('tip değişimi uymayan kayıtları sayar', () => {
    const yeni = sema({
      properties: { name: { type: 'string' }, kind: { type: 'number' } },
    })
    const i = migrationImpact(diffSchemas(sema({}), yeni), KAYITLAR)
    // r1 ve r3 string `kind` taşıyor; r2'de alan yok → kırılmaz.
    expect(i.broken.map((b) => b.recordId).sort()).toEqual(['r1', 'r3'])
  })

  it('enum DARALTMAK kaldırılan değeri taşıyan kayıtları sayar', () => {
    const eski = sema({
      properties: {
        name: { type: 'string' },
        kind: { type: 'string', enum: ['spreadsheet_status_quo', 'direct_product'] },
      },
    })
    const yeni = sema({
      properties: { name: { type: 'string' }, kind: { type: 'string', enum: ['direct_product'] } },
    })
    const i = migrationImpact(diffSchemas(eski, yeni), KAYITLAR)
    expect(i.broken.map((b) => b.recordId)).toEqual(['r1'])
  })

  it('enum GENİŞLETMEK güvenli — hiçbir kayıt geçersizleşmez', () => {
    const eski = sema({
      properties: { name: { type: 'string' }, kind: { type: 'string', enum: ['direct_product'] } },
    })
    const yeni = sema({
      properties: {
        name: { type: 'string' },
        kind: { type: 'string', enum: ['direct_product', 'consultancy'] },
      },
    })
    expect(migrationImpact(diffSchemas(eski, yeni), KAYITLAR).safe).toBe(true)
  })

  it('"0 kırık" ile "hiç kayıt yok" AYRI — `scanned` ayrı gidiyor', () => {
    const i = migrationImpact(diffSchemas(sema({}), sema({})), [])
    expect(i.scanned).toBe(0)
    expect(i.broken).toHaveLength(0)
    expect(impactMessage(i)).toContain('0 kayıt tarandı')
  })

  it('fark listesi DETERMİNİSTİK — aynı şemalar aynı sırayı verir', () => {
    const a = diffSchemas(sema({}), sema({ required: ['name', 'kind'] }))
    const b = diffSchemas(sema({}), sema({ required: ['name', 'kind'] }))
    expect(a).toEqual(b)
  })
})
