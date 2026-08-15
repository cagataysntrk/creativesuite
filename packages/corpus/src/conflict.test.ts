import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { migrate, openDb, type Db } from '@suite/kernel'
import { INDEX_MIGRATIONS, upsertRecords, type IndexRow } from './search.js'
import {
  arbitrationQueue,
  findCandidates,
  numericConflict,
  type ClaimRecord,
  type Classifier,
} from './conflict.js'

// §5.5'in tek vaadi: **model karar vermez**. Bu dosya iki şeyi sınar — (1) çelişen
// kayıtlar bulunuyor, (2) bulunduğunda otomatik çözülmüyor, insana gidiyor.

const MARKA = 'brd_0192f3a1-0000-7000-8000-00000000000a'

let db: Db
beforeEach(() => {
  db = openDb({ path: ':memory:' })
  migrate(db, INDEX_MIGRATIONS)
})
afterEach(() => db.close())

const iddia = (over: Partial<ClaimRecord> = {}): ClaimRecord => ({
  id: 'rec_1',
  type: 'proof_asset',
  title: 'Fire azalması',
  body: 'Döküm hattında fire oranı %18 azaldı.',
  sourceRef: 'musteri-onayi-2026-03.pdf',
  confidence: 0.8,
  recordedAt: '2026-03-01T00:00:00.000Z',
  ...over,
})

const indeksle = (kayitlar: readonly ClaimRecord[]): void => {
  const rows: IndexRow[] = kayitlar.map((r) => ({
    id: r.id,
    brand_id: MARKA,
    type: r.type,
    status: 'active',
    era_id: 'era_1',
    locale: 'tr-TR',
    path: `${r.type}/${r.id}.md`,
    title: r.title,
    body: r.body,
    valid_at: null,
    invalid_at: null,
    expired_at: null,
  }))
  upsertRecords(db, rows)
}

/** Sahte sınıflandırıcı: sayısal çelişki varsa `contradicts`. Gerçek model FAZ-3.5'te. */
const sayisalSiniflandirici: Classifier = (c) => ({
  verdict: numericConflict(c.incoming, c.existing) ? 'contradicts' : 'entails',
  rationale: 'sayısal karşılaştırma',
})

describe('sayısal çelişki — deterministik, MODELSİZ', () => {
  it('aynı olgunun iki farklı sayısı çelişkidir', () => {
    const a = iddia({ body: 'Fire oranı %18 azaldı.' })
    const b = iddia({ id: 'rec_2', body: 'Fire oranı %31 azaldı.' })
    expect(numericConflict(a, b)).toBe(true)
  })

  it('aynı sayı çelişki DEĞİLDİR', () => {
    const a = iddia({ body: 'Fire oranı %18 azaldı.' })
    const b = iddia({ id: 'rec_2', body: 'Fire %18 düştü, ölçüm mart ayında yapıldı.' })
    expect(numericConflict(a, b)).toBe(false)
  })

  it('Türkçe ondalık ayırıcı VİRGÜL — 18,5 ikiye bölünmüyor', () => {
    // `18,5` sayısı `18` ve `5` diye bölünseydi, `%18` içeren bir kayıtla ortak sayı
    // bulunur ve çelişki KAÇIRILIRDI.
    const a = iddia({ body: 'Fire oranı %18,5 azaldı.' })
    const b = iddia({ id: 'rec_2', body: 'Fire oranı %31,2 azaldı.' })
    expect(numericConflict(a, b)).toBe(true)
  })

  it('sayı içermeyen kayıt çelişki üretmez — her metni çelişki saymak kuyruğu boğar', () => {
    const a = iddia({ body: 'Süreç iyileşti.' })
    const b = iddia({ id: 'rec_2', body: 'Fire oranı %31 azaldı.' })
    expect(numericConflict(a, b)).toBe(false)
  })
})

describe('aday bulma — aynı yuva, deterministik arama', () => {
  it('benzer kayıt aday olarak geliyor', () => {
    const mevcut = iddia({ id: 'rec_eski', body: 'Döküm hattında fire oranı %31 azaldı.' })
    const gelen = iddia({ id: 'rec_yeni', body: 'Döküm hattında fire oranı %18 azaldı.' })
    indeksle([mevcut, gelen])

    const adaylar = findCandidates(db, gelen, [mevcut])
    expect(adaylar.length).toBeGreaterThan(0)
    expect(adaylar[0]?.existing.id).toBe('rec_eski')
  })

  it('kayıt KENDİSİYLE eşleşmiyor', () => {
    const gelen = iddia({ id: 'rec_yeni' })
    indeksle([gelen])
    expect(findCandidates(db, gelen, [gelen])).toEqual([])
  })

  it('farklı TİP aday olamaz — persona ile konumlandırma çelişemez', () => {
    const persona = iddia({
      id: 'rec_p',
      type: 'persona',
      body: 'Döküm hattında fire oranı önemli.',
    })
    const gelen = iddia({ id: 'rec_yeni', type: 'proof_asset' })
    indeksle([persona, gelen])
    expect(findCandidates(db, gelen, [persona])).toEqual([])
  })

  it('alakasız kayıt aday değil', () => {
    const baska = iddia({ id: 'rec_z', title: 'Zeplin', body: 'Tamamen ilgisiz bir konu.' })
    const gelen = iddia({ id: 'rec_yeni' })
    indeksle([baska, gelen])
    expect(findCandidates(db, gelen, [baska])).toEqual([])
  })
})

describe('tahkim kuyruğu — model KARAR VERMEZ, insanı çağırır (§5.5)', () => {
  it('çelişen kayıt kuyruğa düşüyor ve İKİ kaynak yan yana geliyor', () => {
    const mevcut = iddia({
      id: 'rec_eski',
      body: 'Döküm hattında fire oranı %31 azaldı.',
      sourceRef: 'olcum-raporu-2025.pdf',
      recordedAt: '2025-11-01T00:00:00.000Z',
    })
    const gelen = iddia({ id: 'rec_yeni', body: 'Döküm hattında fire oranı %18 azaldı.' })
    indeksle([mevcut, gelen])

    const kuyruk = arbitrationQueue(findCandidates(db, gelen, [mevcut]), sayisalSiniflandirici)
    expect(kuyruk).toHaveLength(1)
    // Tahkim için gereken her şey kalemde: iki iddia, iki kaynak, iki tarih, iki güven.
    const k = kuyruk[0]
    expect(k?.candidate.incoming.sourceRef).toBe('musteri-onayi-2026-03.pdf')
    expect(k?.candidate.existing.sourceRef).toBe('olcum-raporu-2025.pdf')
    expect(k?.candidate.incoming.recordedAt).not.toBe(k?.candidate.existing.recordedAt)
  })

  it('kuyruk hiçbir şeyi ÇÖZMÜYOR — yalnız listeliyor', () => {
    const mevcut = iddia({ id: 'rec_eski', body: 'Döküm hattında fire oranı %31 azaldı.' })
    const gelen = iddia({ id: 'rec_yeni', body: 'Döküm hattında fire oranı %18 azaldı.' })
    indeksle([mevcut, gelen])

    const kuyruk = arbitrationQueue(findCandidates(db, gelen, [mevcut]), sayisalSiniflandirici)
    // Dönen yapıda "kazanan", "seçilen", "otomatik çözüm" diye bir alan YOK ve olmayacak.
    // Yeni olan (2026) eski olanı (2025) otomatik ezmiyor — tarih doğruluk kanıtı değildir.
    expect(Object.keys(kuyruk[0] ?? {}).sort()).toEqual(['candidate', 'rationale', 'verdict'])
  })

  it('`entails` kuyruğa GİRMİYOR — her yakın kaydı sormak kuyruğu kullanılamaz yapar', () => {
    const mevcut = iddia({ id: 'rec_eski', body: 'Döküm hattında fire oranı %18 azaldı.' })
    const gelen = iddia({ id: 'rec_yeni', body: 'Döküm hattında fire %18 azaldı.' })
    indeksle([mevcut, gelen])
    expect(arbitrationQueue(findCandidates(db, gelen, [mevcut]), sayisalSiniflandirici)).toEqual([])
  })
})
