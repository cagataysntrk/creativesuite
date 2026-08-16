import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { govdedenAlan, sayisalIddiaVar, stratejiSagligi } from './strateji.js'

const SIMDI = '2026-08-16T12:00:00.000Z'

/** Frontmatter biçimi GERÇEK corpus kayıtlarından okundu (D-174), uydurulmadı. */
const kayit = (o: {
  id: string
  govde: string
  expiredAt?: string
  invalidAt?: string
  reVerifyBy?: string
  claimSource?: string
  eraOfOrigin?: string
  generalisationNote?: string
  transferConfidence?: string
}): string =>
  [
    '---',
    `id: ${o.id}`,
    'brand_id: brd_upcytech',
    'era_id: "*"',
    'status: active',
    'zone: human',
    ...(o.expiredAt === undefined ? [] : [`expired_at: ${o.expiredAt}`]),
    ...(o.invalidAt === undefined ? [] : [`invalid_at: ${o.invalidAt}`]),
    ...(o.reVerifyBy === undefined ? [] : [`re_verify_by: ${o.reVerifyBy}`]),
    ...(o.claimSource === undefined ? [] : [`claim_source: ${o.claimSource}`]),
    ...(o.eraOfOrigin === undefined ? [] : [`era_of_origin: ${o.eraOfOrigin}`]),
    ...(o.generalisationNote === undefined ? [] : [`generalisation_note: ${o.generalisationNote}`]),
    ...(o.transferConfidence === undefined ? [] : [`transfer_confidence: ${o.transferConfidence}`]),
    '---',
    '',
    o.govde,
    '',
  ].join('\n')

const kur = (dosyalar: Readonly<Record<string, string>>): string => {
  const kok = mkdtempSync(join(tmpdir(), 'suite-sag-'))
  for (const [rel, icerik] of Object.entries(dosyalar)) {
    mkdirSync(join(kok, rel.slice(0, rel.lastIndexOf('/'))), { recursive: true })
    writeFileSync(join(kok, rel), icerik)
  }
  return kok
}

const kos = (kok: string) =>
  stratejiSagligi({ repoRoot: kok, aktifEra: 'imalat-2026', simdi: SIMDI, izinliHex: [] })

describe('strateji sağlığı', () => {
  it('temiz corpus’ta bulgu yok ama TARANAN SAYISI raporlanır', () => {
    const kok = kur({
      'corpus/positioning/a.md': kayit({ id: 'rec_a', govde: 'Ölçüm odaklı konumlandırma.' }),
    })
    const r = kos(kok)
    // "0 bulgu" ancak kaç kaydın tarandığı yazılıysa bir şey söyler.
    expect(r.taranan).toBe(1)
    expect(r.bulgular).toEqual([])
  })

  // 🧪 İHLAL TESTİ 1 — yasak terim ve kaynaksız iddia BLOCKING olmalı.
  // Fikstür (D-181): iki kayıt, biri temiz biri kirli. Kural kalkarsa ikisi de temiz
  // görünür ve test kırılır; tek kirli kayıtla "hep bulgu var" da geçerdi.
  it('yasak terim ve kaynaksız sayısal iddiayı yakalar, temiz kaydı işaretlemez', () => {
    const kok = kur({
      'corpus/positioning/temiz.md': kayit({ id: 'rec_temiz', govde: 'Sade bir cümle.' }),
      'corpus/positioning/kirli.md': kayit({
        id: 'rec_kirli',
        govde: 'Biz sektör lideri bir ekibiz ve %47 verimlilik sağlıyoruz.',
      }),
    })
    const r = kos(kok)
    // ⚠ SAYI değil İÇERİK doğrulanır. İlk sürüm yalnız `['rec_kirli','rec_kirli']`
    // sayıyordu ve yasak terim listesini boşaltan ihlal testi YEŞİL kalıyordu: başka
    // bir bulgu sayıyı doldurabilir. Sayı iki kuralı birbirinin yerine geçirir.
    expect(r.bulgular.map((b) => b.mesaj)).toEqual([
      '✗ yasak terim "sektör lideri" — blok 1 (body)',
      '✗ kaynaksız sayısal iddia "%47" — blok 1 (body) · claim_source zorunlu (R-32)',
    ])
    expect(r.bulgular.map((b) => b.kayitId)).toEqual(['rec_kirli', 'rec_kirli'])
    expect(r.bulgular.every((b) => b.siddet === 'blocking')).toBe(true)
    // Bulgu kaydın YOLUNU taşımalı — tıklanabilirliğin ön koşulu (adım ✅ kriteri).
    expect(r.bulgular[0]?.yol).toBe('corpus/positioning/kirli.md')
    expect(r.blocking).toBe(2)
  })

  it('claim_source varsa sayısal iddia bulgu ÜRETMEZ — kural kaynağı gerçekten okuyor', () => {
    const kok = kur({
      'corpus/positioning/a.md': kayit({
        id: 'rec_a',
        govde: '%47 verimlilik artışı ölçüldü.',
        claimSource: 'pilot-2026-raporu',
      }),
    })
    expect(kos(kok).bulgular).toEqual([])
  })

  // 🧪 İHLAL TESTİ 2 — çürüme tarihleri GEÇMİŞ olanı, GELECEKTE olanı değil.
  it('re_verify_by geçmiş kaydı çürümüş sayar, gelecekteki tarihi saymaz', () => {
    const kok = kur({
      'corpus/positioning/gecmis.md': kayit({
        id: 'rec_gecmis',
        govde: 'Mevzuat özeti.',
        reVerifyBy: '2026-01-01T00:00:00.000Z',
      }),
      'corpus/positioning/gelecek.md': kayit({
        id: 'rec_gelecek',
        govde: 'Mevzuat özeti.',
        reVerifyBy: '2027-01-01T00:00:00.000Z',
      }),
    })
    const r = kos(kok)
    expect(r.bulgular.map((b) => [b.kayitId, b.tur])).toEqual([['rec_gecmis', 'yeniden_dogrula']])
  })

  it('emeklilik ve geçerlilik bitişi AYRI bulgular — ikisi aynı şey değil', () => {
    const kok = kur({
      'corpus/positioning/a.md': kayit({
        id: 'rec_a',
        govde: 'Eski konum.',
        expiredAt: '2026-02-01T00:00:00.000Z',
        invalidAt: '2026-03-01T00:00:00.000Z',
      }),
    })
    const turler = kos(kok).bulgular.map((b) => b.tur)
    expect(turler).toContain('suresi_gecmis')
    expect(turler).toContain('gecerliligi_bitmis')
    // Çürüme uyarıdır, yayını durdurmaz: emekli kayıt zaten retrieval'a girmiyor.
    expect(kos(kok).blocking).toBe(0)
  })

  // 🧪 İHLAL TESTİ 3 — "alan eksik" ile "alan nesirde" AYRI gerçekler (D-177).
  it('nesirde yazılmış aktarım argümanını eksik saymaz, ayrı bir uyarı verir', () => {
    const nesir = [
      '**Kaynak dönem:** geri-donusum-2024',
      '',
      '**Genelleme notu:** Aktarılabilir olan teknik yürütme kapasitesidir; alan bilgisi',
      'aktarılmaz, mühendislik pratiği aktarılır ve prospect’e tam bu cümleyle sunulur.',
      '',
      '**Aktarım güveni:** analogous.',
    ].join('\n')
    const kok = kur({ 'corpus/proof_asset/p.md': kayit({ id: 'rec_p', govde: nesir }) })
    const r = kos(kok)
    // Aktarım İHLALİ yok: argüman gerçekten orada.
    expect(r.bulgular.filter((b) => b.tur === 'aktarim')).toEqual([])
    // Ama veri değil — ve bu ayrı bir bulgu, sessiz geçilmiyor.
    expect(r.bulgular.map((b) => b.tur)).toEqual(['alanlar_nesirde'])
    expect(r.blocking).toBe(0)

    // Frontmatter’a taşınınca uyarı KALKAR — yani bulgu sabit değil, ölçüm.
    const kok2 = kur({
      'corpus/proof_asset/p.md': kayit({
        id: 'rec_p',
        govde: nesir,
        eraOfOrigin: 'geri-donusum-2024',
        generalisationNote:
          'Aktarılabilir olan teknik yürütme kapasitesidir; alan bilgisi aktarılmaz.',
        transferConfidence: 'analogous',
      }),
    })
    expect(kos(kok2).bulgular).toEqual([])
  })

  it('dönem-aşırı kanıt genelleme notu YOKSA blocking verir', () => {
    const kok = kur({
      'corpus/proof_asset/p.md': kayit({
        id: 'rec_p',
        govde: 'Geri dönüşümde başardık.',
        eraOfOrigin: 'geri-donusum-2024',
        transferConfidence: 'analogous',
      }),
    })
    const r = kos(kok)
    expect(r.blocking).toBeGreaterThan(0)
    expect(r.bulgular.some((b) => b.tur === 'aktarim')).toBe(true)
  })

  it('okunamayan kayıt SESSİZCE atlanmaz', () => {
    const kok = kur({ 'corpus/positioning/bozuk.md': 'frontmatter yok, sadece metin' })
    const r = kos(kok)
    expect(r.taranan).toBe(0)
    expect(r.okunamayan.map((o) => o.yol)).toEqual(['corpus/positioning/bozuk.md'])
  })
})

describe('paylaşılan yardımcılar', () => {
  it('sayısal iddiayı kelimeyle de görür, yılı iddia saymaz', () => {
    expect(sayisalIddiaVar('yüzde kırk daha hızlı')).toBe(true)
    expect(sayisalIddiaVar('üç kat verim')).toBe(true)
    expect(sayisalIddiaVar('1/3 oranında azaldı')).toBe(true)
    expect(sayisalIddiaVar('2025 yılında kurulduk')).toBe(false)
    expect(sayisalIddiaVar('1.247 ilan')).toBe(true)
  })

  it('gövdeden alan çıkarırken YALNIZ ilk satırı alır', () => {
    const g = '**Aktarım güveni:** analogous.\n\n⚠ Sayısal iddia YOK ve eklenemez.'
    expect(govdedenAlan(g, 'Aktarım güveni')).toBe('analogous')
  })
})
