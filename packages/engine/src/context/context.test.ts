import { describe, expect, it } from 'vitest'
import { parseRecipe } from '@suite/registry'
import { assembleContext, formatContext, type CandidateRecord } from './assemble.js'
import { estimateTokens } from './estimate.js'

// §5.3'ün tek vaadi: bağlam kesilirse bu MANİFESTTE görünür. Sessiz kırpma, prompt'un
// yarısını kaybedip sonucu "model kötü" diye açıklamaktır — bu dosya onu imkânsız kılar.

const TARIF = `
id: test-tarifi
title: Test
total_budget: 150
sections:
  - id: konum
    entity_type: positioning
    max_records: 2
    token_budget: 100
  - id: kanit
    entity_type: proof_asset
    max_records: 5
    token_budget: 200
`

const tarif = () => {
  const r = parseRecipe(TARIF)
  expect(r.ok, `fixture tarifi bozuk: ${JSON.stringify(r)}`).toBe(true)
  return r.ok ? r.value : { id: '', title: '', totalBudget: 0, sections: [] }
}

const kayit = (id: string, type: string, uzunluk: number): CandidateRecord => ({
  id,
  type,
  title: id,
  body: 'ö'.repeat(uzunluk),
})

describe('token tahmini — adı tahmin, çünkü TAHMİN', () => {
  it('boş metin sıfır, boş olmayan metin en az bir token', () => {
    expect(estimateTokens('')).toBe(0)
    expect(estimateTokens('a')).toBe(1)
  })

  it('uzunlukla orantılı ve deterministik — iki çağrı aynı sayıyı verir', () => {
    const t = estimateTokens('ölçüm'.repeat(100))
    expect(t).toBe(estimateTokens('ölçüm'.repeat(100)))
    expect(estimateTokens('x'.repeat(320))).toBe(100)
  })
})

describe('bağlam birleştirme (§5.3)', () => {
  it('sığan kayıtların hepsi girer ve sebebi yazılı gelir', () => {
    const m = assembleContext(tarif(), {
      positioning: [kayit('rec_k1', 'positioning', 60)],
    })
    expect(m.truncated).toBe(false)
    expect(m.sections[0]?.included).toHaveLength(1)
    expect(m.sections[0]?.included[0]?.reason).toContain('konum bölümü')
    expect(m.sections[0]?.included[0]?.tokenEstimate).toBeGreaterThan(0)
  })

  it('`max_records` aşılınca kayıt SESSİZCE düşmez, sebebiyle raporlanır', () => {
    const m = assembleContext(tarif(), {
      positioning: [
        kayit('rec_1', 'positioning', 30),
        kayit('rec_2', 'positioning', 30),
        kayit('rec_3', 'positioning', 30),
      ],
    })
    expect(m.sections[0]?.included).toHaveLength(2)
    expect(m.sections[0]?.dropped).toEqual([{ id: 'rec_3', reason: 'max_records 2 doldu' }])
    expect(m.truncated).toBe(true)
  })

  it('bölüm bütçesi aşılınca hangi kaydın neden düştüğü yazılı', () => {
    // 100 token bütçe · her kayıt ~94 token: ikincisi sığmaz.
    const m = assembleContext(tarif(), {
      positioning: [kayit('rec_1', 'positioning', 300), kayit('rec_2', 'positioning', 300)],
    })
    expect(m.sections[0]?.included.map((r) => r.id)).toEqual(['rec_1'])
    expect(m.sections[0]?.dropped[0]?.reason).toContain('bölüm bütçesi aşılıyor')
  })

  it('SIRA belirleyicidir — toplam bütçe dolunca SONDAKİ bölüm kesilir', () => {
    // Konum bölümü toplamın çoğunu yer; kanıt bölümü kendi bütçesine sığsa da
    // toplam kalmadığı için düşer. Tarifte sırayı değiştirmek, neyin feda edileceğini
    // değiştirmektir — karar YAML'da yaşıyor, kodda değil.
    const m = assembleContext(tarif(), {
      positioning: [kayit('rec_k1', 'positioning', 300)],
      proof_asset: [kayit('rec_p1', 'proof_asset', 400)],
    })
    expect(m.sections[0]?.included).toHaveLength(1)
    expect(m.sections[1]?.included).toHaveLength(0)
    expect(m.sections[1]?.dropped[0]?.reason).toContain('toplam bütçe doldu')
  })

  it('toplam tahmin, bölüm tahminlerinin toplamıdır — manifest kendiyle tutarlı', () => {
    const m = assembleContext(tarif(), {
      positioning: [kayit('rec_k1', 'positioning', 60)],
      proof_asset: [kayit('rec_p1', 'proof_asset', 60)],
    })
    const toplam = m.sections.reduce((a, s) => a + s.tokenEstimate, 0)
    expect(m.tokenEstimate).toBe(toplam)
  })

  it('hiç kayıt yoksa manifest yine YAPI gösterir — boş bağlam gizlenmez', () => {
    const m = assembleContext(tarif(), {})
    expect(m.sections).toHaveLength(2)
    expect(m.tokenEstimate).toBe(0)
    expect(m.truncated).toBe(false)
  })

  it('çıktı satırında kesme MANŞETTE görünür', () => {
    const m = assembleContext(tarif(), {
      positioning: [kayit('rec_1', 'positioning', 300), kayit('rec_2', 'positioning', 300)],
    })
    const metin = formatContext(m)
    expect(metin).toContain('KESME VAR')
    expect(metin).toContain('rec_2')
  })
})

describe('tarif doğrulama — bozuk tarif SESSİZCE geçmez', () => {
  it('bölümsüz tarif reddedilir', () => {
    const r = parseRecipe('id: x\ntitle: y\ntotal_budget: 100\n')
    expect(r.ok).toBe(false)
  })

  it('sıfır bütçeli bölüm reddedilir — "dahil" görünüp hiçbir şey taşıyamaz', () => {
    const r = parseRecipe(
      'id: x\ntitle: y\ntotal_budget: 100\nsections:\n  - id: a\n    entity_type: positioning\n    max_records: 1\n    token_budget: 0\n'
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.kind === 'non_positive_budget')).toBe(true)
  })

  it('aynı bölüm id iki kez geçemez', () => {
    const iki =
      'id: x\ntitle: y\ntotal_budget: 100\nsections:\n' +
      '  - id: a\n    entity_type: positioning\n    max_records: 1\n    token_budget: 10\n' +
      '  - id: a\n    entity_type: persona\n    max_records: 1\n    token_budget: 10\n'
    const r = parseRecipe(iki)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.kind === 'duplicate_section')).toBe(true)
  })
})
