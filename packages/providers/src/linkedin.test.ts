// LinkedIn adaptörü (§9.3 · R-34 · FAZ-7.3).
import { describe, expect, it } from 'vitest'
import {
  COMMENTARY_MAX,
  LINKEDIN_VERSION,
  LINKEDIN_VERSION_VERIFIED_AT,
  buildLinkedinPost,
  isLinkedinRefusal,
  linkedinRefusalMessage,
  versionStale,
  type LinkedinPost,
} from './linkedin.js'
import type { PublishAsset } from './publish.js'

const YAZAR = 'urn:li:person:sentetik'
const TAZE = '2026-09-01T00:00:00.000Z'

const varlik = (path: string): PublishAsset => ({
  path,
  altTr: 'Fire ölçümü paneli',
  decorative: false,
  digest: 'sha256:a',
  compliance: { disclosureRequired: false, stamped: false, visibleDisclosure: false },
})

const post = (over: Partial<LinkedinPost> = {}): LinkedinPost => ({
  kind: 'text',
  commentary: 'Ölçüm odaklı imalat yazılımı',
  assets: [],
  ...over,
})

describe('sürüm sabiti', () => {
  it('YYYYMM biçiminde ve doğrulama tarihi taşıyor', () => {
    expect(LINKEDIN_VERSION).toMatch(/^\d{6}$/)
    expect(LINKEDIN_VERSION_VERIFIED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('taze sürüm geçiyor', () => {
    expect(versionStale(TAZE)).toBeNull()
  })

  // 🧪 Adımın kriteri: sürüm sabitini eskit → adaptör AÇIK hata veriyor, sessizce eski
  // API'ye düşmüyor. En kötü senaryo eski API'ye düşmek değil, bunun FARK EDİLMEMESİ.
  it('eskimiş sürümle istek HİÇ KURULMUYOR', () => {
    const r = buildLinkedinPost(post(), YAZAR, '2027-06-01T00:00:00.000Z')
    expect(isLinkedinRefusal(r)).toBe(true)
    if (!isLinkedinRefusal(r)) return
    expect(r.kind).toBe('version_stale')
    expect(linkedinRefusalMessage(r)).toContain('426')
  })

  it('okunamayan tarih SONSUZ eski — bilinmeyen tazelik taze değildir', () => {
    expect(versionStale('yarın')).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('üç format', () => {
  it('metin postu: varlıksız', () => {
    const r = buildLinkedinPost(post(), YAZAR, TAZE)
    expect(isLinkedinRefusal(r)).toBe(false)
    if (isLinkedinRefusal(r)) return
    expect(r.content.kind).toBe('text')
    expect(r.versionHeader).toBe(LINKEDIN_VERSION)
  })

  it('metin postuna varlık eklenirse REDDEDİLİYOR — biçim karışmıyor', () => {
    const r = buildLinkedinPost(post({ assets: [varlik('/tmp/a.png')] }), YAZAR, TAZE)
    expect(isLinkedinRefusal(r) && r.kind).toBe('wrong_asset_count')
  })

  it('görsel postu: en az bir varlık', () => {
    const r = buildLinkedinPost(
      post({ kind: 'image', assets: [varlik('/tmp/a.png'), varlik('/tmp/b.png')] }),
      YAZAR,
      TAZE
    )
    expect(isLinkedinRefusal(r)).toBe(false)
    if (isLinkedinRefusal(r)) return
    expect(r.content.kind === 'image' && r.content.paths).toHaveLength(2)
  })

  it('görselsiz görsel postu REDDEDİLİYOR', () => {
    const r = buildLinkedinPost(post({ kind: 'image' }), YAZAR, TAZE)
    expect(isLinkedinRefusal(r) && r.kind).toBe('wrong_asset_count')
  })

  it('döküman postu FAZ-6.3 çıktısını (PDF) kabul ediyor', () => {
    const r = buildLinkedinPost(
      post({
        kind: 'document',
        assets: [varlik('/tmp/dokuman.pdf')],
        documentTitle: 'Fire ölçümü — vardiya raporu',
      }),
      YAZAR,
      TAZE
    )
    expect(isLinkedinRefusal(r)).toBe(false)
    if (isLinkedinRefusal(r)) return
    expect(r.content.kind === 'document' && r.content.title).toContain('Fire ölçümü')
  })

  // 🧪 Başlıksız döküman: feed'de `dokuman.pdf` görünür ve sonradan düzenlenemiyor.
  it('başlıksız döküman REDDEDİLİYOR', () => {
    const r = buildLinkedinPost(
      post({ kind: 'document', assets: [varlik('/tmp/dokuman.pdf')], documentTitle: '  ' }),
      YAZAR,
      TAZE
    )
    expect(isLinkedinRefusal(r) && r.kind).toBe('document_title_missing')
  })

  it('PDF olmayan döküman REDDEDİLİYOR — yanlış bağlanmış hat gizlenmiyor', () => {
    const r = buildLinkedinPost(
      post({ kind: 'document', assets: [varlik('/tmp/slayt.png')], documentTitle: 'x' }),
      YAZAR,
      TAZE
    )
    expect(isLinkedinRefusal(r) && r.kind).toBe('document_not_pdf')
  })

  it('döküman postu TEK dosya ister', () => {
    const r = buildLinkedinPost(
      post({
        kind: 'document',
        assets: [varlik('/tmp/a.pdf'), varlik('/tmp/b.pdf')],
        documentTitle: 'x',
      }),
      YAZAR,
      TAZE
    )
    expect(isLinkedinRefusal(r) && r.kind).toBe('wrong_asset_count')
  })

  it('tavanı aşan metin REDDEDİLİYOR', () => {
    const r = buildLinkedinPost(post({ commentary: 'ö'.repeat(COMMENTARY_MAX + 1) }), YAZAR, TAZE)
    expect(isLinkedinRefusal(r) && r.kind).toBe('commentary_too_long')
  })
})
