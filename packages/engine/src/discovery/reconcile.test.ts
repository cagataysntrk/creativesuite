import { describe, expect, it } from 'vitest'
import { COLUMN_LABELS, byColumn, columnOf, type DiscoveryOp } from './plan.js'

const op = (o: Partial<DiscoveryOp> & Pick<DiscoveryOp, 'why' | 'kind'>): DiscoveryOp => ({
  path: 'corpus/fact/x.md',
  recordId: 'rec_x',
  reason: 'test',
  digest: 'sha256:x',
  ...o,
})

describe('reconciliation sütunları (§12.9 · FAZ-4.10)', () => {
  it('"değişmedi" ile "insan hayır dedi" AYRI sütunlarda — ikisi de `skip`', () => {
    // Bu testin var olma sebebi: `kind` ikisini de `skip` diyor. Ekranın tüm amacı
    // onları ayırmak; birincisi kaydırıp geçtiğiniz gürültü, ikincisi dikkatinizin yeri.
    expect(columnOf(op({ kind: 'skip', why: 'unchanged' }))).toBe('unchanged')
    expect(columnOf(op({ kind: 'skip', why: 'previously_rejected' }))).toBe('conflicted')
    expect(columnOf(op({ kind: 'skip', why: 'pinned' }))).toBe('conflicted')
    expect(columnOf(op({ kind: 'skip', why: 'human_zone' }))).toBe('conflicted')
  })

  it('emeklilik KENDİ sütununda — "değişti"nin arkasına gizlenmiyor', () => {
    // Mirror modunun en sonuçlu op'u; dört sütuna sıkıştırmak onu görünmez yapardı.
    expect(columnOf(op({ kind: 'retire', why: 'absent_in_candidates' }))).toBe('retired')
    expect(COLUMN_LABELS.retired).toBe('EMEKLİ')
  })

  it('yeni ve değişen ayrı sütunlar', () => {
    expect(columnOf(op({ kind: 'create', why: 'new_record' }))).toBe('new')
    expect(columnOf(op({ kind: 'update', why: 'content_changed' }))).toBe('changed')
  })

  it('BOŞ sütun da bir sonuçtur — anahtar her zaman var', () => {
    // Eksik anahtar, ekranın o sütunu hiç çizmemesi ve "hiç çelişki yok" ile
    // "çelişki sütunu unutuldu" arasındaki farkın kaybolması demekti.
    const k = byColumn([])
    expect(Object.keys(k).sort()).toEqual(
      ['changed', 'conflicted', 'new', 'retired', 'unchanged'].sort()
    )
    expect(k.conflicted).toEqual([])
  })

  it('her sütunun Türkçe başlığı var', () => {
    for (const c of ['unchanged', 'changed', 'conflicted', 'new', 'retired'] as const) {
      expect(COLUMN_LABELS[c].length).toBeGreaterThan(0)
    }
  })

  it("op'lar doğru sütunlara dağılıyor", () => {
    const k = byColumn([
      op({ kind: 'skip', why: 'unchanged' }),
      op({ kind: 'skip', why: 'pinned' }),
      op({ kind: 'create', why: 'new_record' }),
      op({ kind: 'retire', why: 'absent_in_candidates' }),
    ])
    expect(k.unchanged).toHaveLength(1)
    expect(k.conflicted).toHaveLength(1)
    expect(k.new).toHaveLength(1)
    expect(k.retired).toHaveLength(1)
    expect(k.changed).toHaveLength(0)
  })
})
