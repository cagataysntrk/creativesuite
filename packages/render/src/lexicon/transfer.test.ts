import { describe, expect, it } from 'vitest'
import { checkTransfer, formatViolations, type ProofReference } from './transfer.js'

// §4.6'nın vaadi: geri dönüşüm sonucu ne SİLİNİR ne de imalat sonucu gibi SUNULUR.
// Üçüncü yol — açık aktarım argümanıyla "daha zor bir vaka" — mekanik olarak zorlanır.

const NOT =
  'Aktarılan şey alan bilgisi değil mühendislik pratiği: servis tasarlayıp canlıya alan bir ekip.'

const kanit = (over: Partial<ProofReference> = {}): ProofReference => ({
  id: 'rec_proof_upcyman',
  eraOfOrigin: 'geri-donusum-2024',
  generalisationNote: NOT,
  transferConfidence: 'analogous',
  claimSource: 'api.upcyman.com canlı servis',
  hasNumericClaim: false,
  ...over,
})

const ctx = (over: Partial<{ currentEra: string; outboundToProspect: boolean }> = {}) => ({
  currentEra: 'imalat-2026',
  outboundToProspect: false,
  ...over,
})

describe('dönem-aşırı kanıt (§4.6)', () => {
  it('argümanlı aktarım GEÇİYOR — kanıt silinmiyor, sunuluyor', () => {
    expect(checkTransfer([kanit()], ctx())).toEqual([])
  })

  it('notsuz dönem-aşırı kanıt yayını BLOKLIYOR', () => {
    const v = checkTransfer([kanit({ generalisationNote: null })], ctx())
    expect(v[0]).toMatchObject({
      kind: 'missing_generalisation_note',
      proofId: 'rec_proof_upcyman',
    })
  })

  it('tek kelimelik not YETMİYOR — geçilmek için doldurulmuş alan hiçbir şey korumaz', () => {
    const v = checkTransfer([kanit({ generalisationNote: 'benzer' })], ctx())
    expect(v[0]?.kind).toBe('note_too_thin')
  })

  it('transfer_confidence yoksa reddediliyor', () => {
    const v = checkTransfer([kanit({ transferConfidence: null })], ctx())
    expect(v.some((x) => x.kind === 'missing_transfer_confidence')).toBe(true)
  })

  it('AYNI dönemden kanıt argüman istemiyor — kural yalnız dönem aşıldığında', () => {
    const v = checkTransfer(
      [kanit({ eraOfOrigin: 'imalat-2026', generalisationNote: null, transferConfidence: null })],
      ctx()
    )
    expect(v).toEqual([])
  })

  it("`era_of_origin: '*'` dönemden bağımsız olgudur, argüman istemez", () => {
    const v = checkTransfer(
      [kanit({ eraOfOrigin: '*', generalisationNote: null, transferConfidence: null })],
      ctx()
    )
    expect(v).toEqual([])
  })
})

describe('tanınmayan güven değeri SESSİZCE geçmiyor', () => {
  it('enum dışı değer ihlaldir — null olmadığı için geçen bir değer, kapıyı kör eder', () => {
    // Gerçek olay (2026-08-15): CLI çıkarıcı "analogous.\n\n⚠ Sayısal iddia YOK..."
    // döndürüyordu; değer ne null ne geçerli enum olduğu için HER kontrolden geçti ve
    // kapı yeşil raporlarken hiçbir şey korumuyordu.
    const v = checkTransfer(
      [kanit({ transferConfidence: 'analogous.\n\n⚠ Sayısal iddia YOK' as never })],
      ctx()
    )
    expect(v[0]?.kind).toBe('invalid_transfer_confidence')
  })

  it('üç geçerli değerin üçü de geçiyor', () => {
    for (const g of ['direct', 'analogous', 'illustrative_only'] as const) {
      expect(checkTransfer([kanit({ transferConfidence: g })], ctx()), g).toEqual([])
    }
  })
})

describe('illustrative_only — örnek KANIT değildir (§11.4)', () => {
  it('prospect belgesinde kanıt olarak kullanılamaz', () => {
    const v = checkTransfer(
      [kanit({ transferConfidence: 'illustrative_only' })],
      ctx({ outboundToProspect: true })
    )
    expect(v.some((x) => x.kind === 'illustrative_used_as_evidence')).toBe(true)
  })

  it('iç kullanımda serbest — kural yayına giden belge için', () => {
    const v = checkTransfer([kanit({ transferConfidence: 'illustrative_only' })], ctx())
    expect(v).toEqual([])
  })
})

describe('kaynaksız sayısal iddia (R-32) — dönemden BAĞIMSIZ', () => {
  it('aynı dönemden bile olsa kaynaksız sayı reddediliyor', () => {
    const v = checkTransfer(
      [kanit({ eraOfOrigin: 'imalat-2026', hasNumericClaim: true, claimSource: null })],
      ctx()
    )
    expect(v[0]?.kind).toBe('missing_claim_source')
  })

  it('kaynaklı sayı geçiyor', () => {
    const v = checkTransfer([kanit({ hasNumericClaim: true })], ctx())
    expect(v).toEqual([])
  })

  it('boş dize kaynak SAYILMIYOR', () => {
    const v = checkTransfer([kanit({ hasNumericClaim: true, claimSource: '   ' })], ctx())
    expect(v[0]?.kind).toBe('missing_claim_source')
  })
})

describe('rapor', () => {
  it('ihlal yoksa çıktı BOŞ — sessizlik geçti demektir', () => {
    expect(formatViolations([])).toBe('')
  })

  it('her ihlal NEDEN yasak olduğunu söylüyor', () => {
    const v = checkTransfer([kanit({ generalisationNote: null })], ctx())
    const metin = formatViolations(v)
    expect(metin).toContain('geri-donusum-2024')
    expect(metin).toContain('§4.6')
  })

  it('kanıt kullanmayan varlık ihlal değil', () => {
    expect(checkTransfer([], ctx())).toEqual([])
  })
})
