import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { migrate, openDb, type Db } from '@suite/kernel'
import { INDEX_MIGRATIONS, search, upsertRecords, type IndexRow } from './search.js'
import { readFileSync } from 'node:fs'
import { makeTempDir } from '@suite/kernel/testing'
import { reindex } from './reindex.js'
import { propose, writeRecord } from './write.js'
import { selectRecords, selectSearch, visibleIds } from './select.js'

// §5.2'nin tek vaadi: "emekliye ayrılmış 2024 konumlandırması 2026 deck'ine ASLA
// sızamaz". Bu dosya o vaadi sınar — sızıntının her yolu ayrı bir test.

const MARKA = 'brd_0192f3a1-0000-7000-8000-00000000000a'
const DIGER_MARKA = 'brd_0192f3a1-0000-7000-8000-00000000000b'
const SIMDI = '2026-08-15T09:00:00.000Z'

let db: Db
beforeEach(() => {
  db = openDb({ path: ':memory:' })
  migrate(db, INDEX_MIGRATIONS)
})
afterEach(() => db.close())

const satir = (over: Partial<IndexRow> = {}): IndexRow => ({
  id: 'rec_1',
  brand_id: MARKA,
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

const sorgu = (over: Partial<{ brandId: string; eraId: string; asOf: string }> = {}) => ({
  brandId: MARKA,
  eraId: 'era_1',
  asOf: SIMDI,
  ...over,
})

const idler = (rows: readonly { id: string }[]): string[] => rows.map((r) => r.id).sort()

describe('marka ekseni — İLK koşul (R-10 · D-39)', () => {
  it('başka markanın kaydı GELMEZ', () => {
    upsertRecords(db, [satir(), satir({ id: 'rec_2', brand_id: DIGER_MARKA })])
    expect(idler(selectRecords(db, sorgu()))).toEqual(['rec_1'])
  })

  it('aynı dönem adı iki markada çakışmaz', () => {
    // İki marka aynı `era_1` etiketini kullanabilir; ayrım marka eksenindedir.
    upsertRecords(db, [satir(), satir({ id: 'rec_2', brand_id: DIGER_MARKA, era_id: 'era_1' })])
    expect(idler(selectRecords(db, sorgu({ brandId: DIGER_MARKA })))).toEqual(['rec_2'])
  })
})

describe('dönem ekseni', () => {
  it('başka dönemin kaydı GELMEZ', () => {
    upsertRecords(db, [satir(), satir({ id: 'rec_2', era_id: 'era_0' })])
    expect(idler(selectRecords(db, sorgu()))).toEqual(['rec_1'])
  })

  it("`era_id: '*'` her dönemde gelir — dönemden bağımsız olgular için", () => {
    upsertRecords(db, [satir({ id: 'rec_evrensel', era_id: '*' })])
    expect(idler(selectRecords(db, sorgu({ eraId: 'era_9' })))).toEqual(['rec_evrensel'])
  })
})

describe('durum ekseni — draft GÖRÜNMEZ (R-14)', () => {
  it('draft, retired ve superseded elenir; active ve pinned gelir', () => {
    upsertRecords(db, [
      satir({ id: 'rec_active', status: 'active' }),
      satir({ id: 'rec_pinned', status: 'pinned' }),
      satir({ id: 'rec_draft', status: 'draft' }),
      satir({ id: 'rec_retired', status: 'retired' }),
      satir({ id: 'rec_superseded', status: 'superseded' }),
    ])
    expect(idler(selectRecords(db, sorgu()))).toEqual(['rec_active', 'rec_pinned'])
  })

  it("agent önerisi onaylanmadan retrieval'a düşmez", () => {
    // D-31'in tek güvenlik hikâyesi: öneri `draft` iner, onay insanın commit'idir.
    upsertRecords(db, [satir({ id: 'rec_oneri', status: 'draft' })])
    expect(selectRecords(db, sorgu())).toEqual([])
  })
})

describe('bi-temporal pencere — `:as_of` bir PARAMETRE', () => {
  it('`expired_at` dolu kayıt hiçbir zaman gelmez (emeklilik silme değildir, R-12)', () => {
    upsertRecords(db, [satir({ id: 'rec_emekli', expired_at: '2025-01-01T00:00:00.000Z' })])
    expect(selectRecords(db, sorgu())).toEqual([])
    // Geçmişe gitsek bile: emeklilik nokta değil, kaydın tamamen kapanmasıdır.
    expect(selectRecords(db, sorgu({ asOf: '2024-06-01T00:00:00.000Z' }))).toEqual([])
  })

  it('`invalid_at` geçmişte kalmış kayıt BUGÜN gelmez, GEÇMİŞTE gelir', () => {
    upsertRecords(db, [
      satir({
        id: 'rec_2024',
        title: 'Geri dönüşüm konumlandırması',
        valid_at: '2024-01-01T00:00:00.000Z',
        invalid_at: '2025-06-01T00:00:00.000Z',
      }),
    ])
    expect(selectRecords(db, sorgu())).toEqual([])
    // "Mart 2025'te bu deck'i üretirken sistem neyi biliyordu" — denetim bir parametre.
    expect(idler(selectRecords(db, sorgu({ asOf: '2025-03-01T00:00:00.000Z' })))).toEqual([
      'rec_2024',
    ])
  })

  it('`valid_at` gelecekte olan kayıt HENÜZ gelmez', () => {
    upsertRecords(db, [satir({ id: 'rec_gelecek', valid_at: '2027-01-01T00:00:00.000Z' })])
    expect(selectRecords(db, sorgu())).toEqual([])
    expect(idler(selectRecords(db, sorgu({ asOf: '2027-02-01T00:00:00.000Z' })))).toEqual([
      'rec_gelecek',
    ])
  })

  it('sınır anı: `invalid_at` tam `as_of` ise kayıt ARTIK geçerli değildir', () => {
    upsertRecords(db, [satir({ id: 'rec_sinir', invalid_at: SIMDI })])
    expect(selectRecords(db, sorgu())).toEqual([])
  })
})

describe('tip daraltması', () => {
  it('yalnız istenen varlık tipi gelir', () => {
    upsertRecords(db, [satir(), satir({ id: 'rec_2', type: 'persona' })])
    expect(idler(selectRecords(db, { ...sorgu(), type: 'persona' }))).toEqual(['rec_2'])
  })
})

describe('arama yüklemden GEÇER — sıralama yetkilendirme değildir', () => {
  it('ham `search()` emekli kaydı DÖNDÜRÜR — tehlike burada', () => {
    upsertRecords(db, [satir({ id: 'rec_emekli', status: 'retired' })])
    // Bu bir hata değil, sorumluluk ayrımı: `search.ts` sıralar, `select.ts` yetkilendirir.
    // Test bunu SABİTLİYOR ki biri "search zaten filtreliyor" diye varsaymasın.
    expect(search(db, 'ölçüm').length).toBeGreaterThan(0)
  })

  it('`selectSearch` aynı kaydı DÖNDÜRMEZ', () => {
    upsertRecords(db, [satir({ id: 'rec_emekli', status: 'retired' })])
    expect(selectSearch(db, sorgu(), 'ölçüm')).toEqual([])
  })

  it('görünür kayıt aramada gelir ve sıralama korunur', () => {
    upsertRecords(db, [
      satir({ id: 'rec_gorunur' }),
      satir({ id: 'rec_gizli', status: 'draft', path: 'positioning/b.md' }),
    ])
    const hits = selectSearch(db, sorgu(), 'ölçüm')
    expect(idler(hits)).toEqual(['rec_gorunur'])
    expect(hits[0]?.sources.length).toBeGreaterThan(0)
  })

  it('`visibleIds` ile `selectRecords` aynı kümeyi verir — iki yol, tek yüklem', () => {
    upsertRecords(db, [
      satir({ id: 'rec_a' }),
      satir({ id: 'rec_b', status: 'draft' }),
      satir({ id: 'rec_c', era_id: '*' }),
    ])
    expect([...visibleIds(db, sorgu())].sort()).toEqual(idler(selectRecords(db, sorgu())))
  })
})

describe('propose → reindex → select: öneri UÇTAN UCA görünmez (§5.4 · R-14)', () => {
  // 2.2 yüklemi draft'ı eliyor, 2.4 propose'u draft yazıyor. İkisinin AYRI AYRI
  // doğru olması yetmez: agent'ın yazdığı bir dosyanın gerçekten aranamadığını
  // dosya sisteminden indekse kadar görmek gerekir.
  it('agent önerisi dosyaya iniyor ama indekste GÖRÜNMÜYOR', () => {
    const tmp = makeTempDir('suite-propose-')
    try {
      const yazma = propose({
        root: tmp.path,
        entityType: 'positioning',
        slug: 'agent-onerisi',
        frontmatter: { id: 'rec_oneri', brand_id: MARKA, type: 'positioning', era_id: 'era_1' },
        body: 'ölçümlerinizi güncelledik',
      })
      expect(yazma.ok).toBe(true)

      // Dosya GERÇEKTEN var — öneri kayboluyor değil, görünmüyor.
      if (yazma.ok) expect(readFileSync(yazma.path, 'utf8')).toContain('status: draft')

      const rapor = reindex(db, tmp.path)
      expect(rapor.indexed).toBe(1)

      // Ama retrieval yükleminden geçmiyor.
      expect(selectRecords(db, sorgu())).toEqual([])
      expect(selectSearch(db, sorgu(), 'ölçüm')).toEqual([])
    } finally {
      tmp.cleanup()
    }
  })

  it('insan onaylayıp status active yapınca AYNI dosya görünür oluyor', () => {
    const tmp = makeTempDir('suite-onay-')
    try {
      // Onay insanın eylemidir (git commit); burada onun yazma yolunu taklit ediyoruz.
      writeRecord({
        root: tmp.path,
        entityType: 'positioning',
        slug: 'onayli',
        frontmatter: {
          id: 'rec_onayli',
          brand_id: MARKA,
          type: 'positioning',
          era_id: 'era_1',
          status: 'active',
          zone: 'human',
        },
        body: 'ölçümlerinizi güncelledik',
        actor: 'human',
      })
      reindex(db, tmp.path)
      expect(idler(selectRecords(db, sorgu()))).toEqual(['rec_onayli'])
    } finally {
      tmp.cleanup()
    }
  })
})

describe('iki marka aynı anda — çıktılar KARIŞMIYOR (§4.2 · R-10 · FAZ-2.11)', () => {
  const DIMA = 'brd_dima'

  it('aynı sorgu iki markada iki farklı sonuç veriyor', () => {
    upsertRecords(db, [
      satir({ id: 'rec_upcy', title: 'Ölçüm', body: 'Upcytech konumlandırması' }),
      satir({
        id: 'rec_dima',
        brand_id: DIMA,
        era_id: 'era_dima',
        title: 'Ölçüm',
        body: 'dima konumlandırması',
      }),
    ])
    expect(idler(selectRecords(db, sorgu()))).toEqual(['rec_upcy'])
    expect(idler(selectRecords(db, { brandId: DIMA, eraId: 'era_dima', asOf: SIMDI }))).toEqual([
      'rec_dima',
    ])
  })

  it('dima çalıştırırken Upcytech kaydı çağrılamıyor — marka ekseni İLK koşul', () => {
    // Somut çöküş senaryosu (D-39): tek satırlık global `brand/current` olsaydı,
    // kuyruktaki her Upcytech çalıştırması sessizce dima'ya kayardı.
    upsertRecords(db, [satir({ id: 'rec_upcy' })])
    expect(selectRecords(db, { brandId: DIMA, eraId: 'era_dima', asOf: SIMDI })).toEqual([])
    expect(selectSearch(db, { brandId: DIMA, eraId: 'era_dima', asOf: SIMDI }, 'ölçüm')).toEqual([])
  })

  it("`era_id: '*'` bile marka sınırını AŞMIYOR", () => {
    // Dönemden bağımsız kayıt, MARKADAN bağımsız demek değildir. Aşsaydı dima
    // konumlandırması her Upcytech deck'ine sızardı — §4.5'in "asla sızmaz" vaadi çökerdi.
    upsertRecords(db, [satir({ id: 'rec_dima_evrensel', brand_id: DIMA, era_id: '*' })])
    expect(selectRecords(db, sorgu())).toEqual([])
    expect(idler(selectRecords(db, { brandId: DIMA, eraId: 'era_dima', asOf: SIMDI }))).toEqual([
      'rec_dima_evrensel',
    ])
  })
})
