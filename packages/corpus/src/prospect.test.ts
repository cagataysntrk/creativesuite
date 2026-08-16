// Prospect kaydı zarf alanlarının HEPSİNİ taşıyor (FAZ-6.4 ✅).
//
// Bu test corpus'a sahte bir prospect YAZMIYOR: uydurulmuş bir şirket, doğruluk
// kaynağına giren bir kurgudur ve altı ay sonra kimse hangisinin gerçek olduğunu
// bilmez. Kaydın ŞEKLİ burada, gerçek kayıtlar `2.9` gibi insan onayıyla gelir.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { RecordEnvelopeSchema } from '@suite/kernel'

const REPO = join(import.meta.dirname, '../../..')

// YAML ayrıştırıcısı EKLENMEDİ (R-75): burada gereken tek şey iki satırı okumak ve
// `yaml` paketi bu paket için yeni bir bağımlılık olurdu. Ham metin denetimi, aradığımız
// şeyin dosyada YAZIYOR olması — ayrıştırılmış hâli zaten `just gate projection`ın işi.
const TIP = readFileSync(join(REPO, 'registry/entity-types/prospect.type.yaml'), 'utf8')
const zorunlular = (): readonly string[] =>
  (/^required:\s*\[(.+)\]$/m.exec(TIP)?.[1] ?? '').split(',').map((x) => x.trim())

const ZARF = {
  id: 'rec_prospect_sentetik',
  brand_id: 'brd_upcytech',
  type: 'prospect',
  schema_version: 1,
  kind: 'ledger',
  zone: 'human',
  status: 'draft',
  locale: 'tr-TR',
  era_id: 'imalat-2026',
  created_at: '2026-08-16T00:00:00.000Z',
  valid_at: null,
  invalid_at: null,
  expired_at: null,
  re_verify_by: null,
  supersedes: [],
  superseded_by: null,
  confidence: 0.9,
  approved_by: null,
  approved_at: null,
  source: { kind: 'inference', ref: 'sentetik', quote: null },
  scope: { channels: [], verticals: ['imalat'], personas: [] },
  tags: [],
  context_weight: 1,
  x_signature: null,
  // Prospect'e özgü her şey BURADA — zarf sistemin, `attributes` kullanıcının (D-41).
  attributes: {
    legal_name: 'Sentetik Döküm Sanayi Anonim Şirketi',
    stage: 'identified',
    source_url: 'https://ornek.gecersiz/sentetik',
    kvkk_basis: 'mesru_menfaat',
    retention_until: '2027-08-16',
    size_band: 'unknown',
  },
}

describe('prospect varlık tipi', () => {
  it('zarfın HER alanını taşıyor — retrofit imkânsızdır (R-11)', () => {
    const r = RecordEnvelopeSchema.safeParse(ZARF)
    expect(r.success).toBe(true)
  })

  it('zarftan bir alan düşerse kayıt GEÇERSİZ — eksik damga sessizce geçmiyor', () => {
    const { era_id: _atilan, ...eksik } = ZARF
    expect(RecordEnvelopeSchema.safeParse(eksik).success).toBe(false)
  })

  it('tip dosyası KVKK alanlarını ZORUNLU tutuyor', () => {
    const z = zorunlular()
    // Kaynağı ve saklama sonu olmayan bir prospect, silme talebinde nereye bakılacağı
    // bilinmeyen veridir.
    expect(z).toContain('source_url')
    expect(z).toContain('kvkk_basis')
    expect(z).toContain('retention_until')
    // Kişisel veri alanları zorunlu DEĞİL: toplanmayan veri, korunması gerekmeyen veri.
    expect(z).not.toContain('contact_name')
    expect(z).not.toContain('contact_email')
  })

  it('ölçek BANDI var, kesin çalışan sayısı YOK — kaynaksız sayı olurdu (R-32)', () => {
    expect(TIP).toContain('size_band')
    expect(TIP).toMatch(/enum: \[micro, small, medium, large, unknown\]/)
    expect(TIP).not.toContain('employee_count')
  })
})
