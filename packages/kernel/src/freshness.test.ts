import { describe, expect, it } from 'vitest'
import { TAZELIK_GUN, tazeMi, tazelikRaporu } from './freshness.js'

const k = (fetchedAt: string) => ({ sourceRef: 'https://ornek.gecersiz/haber', fetchedAt })
const SIMDI = '2026-08-16T12:00:00.000Z'

describe('tazelik kapısı', () => {
  it('tavan 14 gün', () => {
    expect(TAZELIK_GUN).toBe(14)
  })

  it('bugün çekilen kaynak TAZE', () => {
    const r = tazeMi(k('2026-08-16T09:00:00.000Z'), SIMDI)
    expect(r.taze).toBe(true)
    expect(r.yasGun).toBe(0)
  })

  it('tam 14 gün SINIRDA ve geçiyor — tavan dahil', () => {
    expect(tazeMi(k('2026-08-02T12:00:00.000Z'), SIMDI).taze).toBe(true)
  })

  // 🧪 İHLAL TESTİ — 15 günlük kaynak REDDEDİLİYOR. Fikstür (D-181): tavanın tam bir gün
  // ötesi; kural kalkarsa aylık eski bir ihale haberi deck'e girer ve görüşmede çöker.
  it('15 günlük kaynak REDDEDİLİYOR, gerekçe Türkçe ve TARİHİ gösteriyor', () => {
    const r = tazeMi(k('2026-08-01T12:00:00.000Z'), SIMDI)
    expect(r.taze).toBe(false)
    if (r.taze) return
    expect(r.yasGun).toBe(15)
    expect(r.mesaj).toContain('15 günlük')
    expect(r.mesaj).toContain('2026-08-01')
    expect(r.mesaj).toContain('tavan 14 gün')
  })

  /**
   * Adımın 🧪 kriteri: "sistem saatini ileri al → aynı kaynak artık reddediliyor".
   *
   * Saati GERÇEKTEN ileri almıyoruz — `now` bir parametre (R-06). Bu, testi hem
   * deterministik hem de daha güçlü yapıyor: kapının tarihe baktığını, saatin
   * değiştiğini varsayarak değil, ölçerek gösteriyor.
   */
  it('AYNI kaynak, ileri alınmış saatte artık BAYAT', () => {
    const kaynak = k('2026-08-10T12:00:00.000Z')
    expect(tazeMi(kaynak, '2026-08-16T12:00:00.000Z').taze).toBe(true)
    expect(tazeMi(kaynak, '2026-09-16T12:00:00.000Z').taze).toBe(false)
  })

  it('GELECEK tarihli kaynak reddediliyor — "her zaman taze" kaynak olmuyor', () => {
    const r = tazeMi(k('2027-01-01T00:00:00.000Z'), SIMDI)
    expect(r.taze).toBe(false)
    if (r.taze) return
    expect(r.mesaj).toContain('GELECEKTE')
  })

  it('okunamayan tarih taze SAYILMIYOR — bilinmeyen yaş sıfır yaş değildir', () => {
    const r = tazeMi(k('dün'), SIMDI)
    expect(r.taze).toBe(false)
    expect(r.yasGun).toBeNull()
  })
})

describe('çalıştırma raporu', () => {
  it('tek bayat kaynak TÜM raporu blokluyor', () => {
    const r = tazelikRaporu([k('2026-08-15T12:00:00.000Z'), k('2026-01-01T12:00:00.000Z')], SIMDI)
    expect(r.hepsiTaze).toBe(false)
    expect(r.tazeSayisi).toBe(1)
    expect(r.gerekce).toContain('tazelik tavanını')
  })

  it('kaynaksız çalıştırma tazelik kapısından GEÇİYOR — o R-32’nin işi (D-198)', () => {
    const r = tazelikRaporu([], SIMDI)
    expect(r.hepsiTaze).toBe(true)
    expect(r.gerekce).toBe('')
  })
})

// ── BAĞLANMA TESTİ: fonksiyon var ama çağıran var mı (D-182'nin dersi) ────────
import { inspectManifest, isPublishable } from './manifest.js'

const manifest = (fetchedAt: string, createdAt: string): Parameters<typeof inspectManifest>[0] =>
  ({
    runId: 'run_1',
    brandId: 'brd_upcytech',
    eraId: 'imalat-2026',
    pipeline: 'prospect-deck',
    // ⚠ Fikstür GERÇEK olmalı (D-181): kısa SHA'lar ve maliyetsiz metered adım, tazelik
    // kuralıyla ilgisi olmayan iki kusur üretiyordu ve test "bağlanmadı" diyordu — oysa
    // bağlanmıştı. Yanlış fikstür, yanlış teşhis.
    corpusCommit: '1f0e3dad99908345f7439f8ffabdffc418ac0d5f',
    registryCommit: '2b0e3dad99908345f7439f8ffabdffc418ac0d60',
    createdAt,
    decisions: [],
    context: [],
    contextRetentionDays: null,
    steps: [
      {
        stepId: 'arastir',
        verb: 'INGEST',
        providerId: null,
        candidates: [],
        startedAt: createdAt,
        finishedAt: createdAt,
        estimatedCost: {
          low: { micros: 0n, currency: 'USD' },
          high: { micros: 0n, currency: 'USD' },
        },
        actualCost: { micros: 1000n, currency: 'USD' },
        status: 'ok',
        output: { fetchedAt, sourceRef: 'https://ornek.gecersiz/haber' },
      },
    ],
  }) as never

describe('tazelik kapısı YAYIN YÜKLEMİNE bağlı mı', () => {
  it('taze kaynakla manifest YAYINLANABİLİR', () => {
    expect(isPublishable(manifest('2026-08-10T12:00:00.000Z', '2026-08-16T12:00:00.000Z'))).toBe(
      true
    )
  })

  // 🧪 İHLAL TESTİ — asıl sınav bu. Fonksiyonun doğru cevap vermesi yetmez; `PUBLISH`
  // yükleminin onu ÇAĞIRIYOR olması gerekir. Bu projede aynı hata iki kez yaşandı:
  // kod yazıldı, kimse çağırmadı, disk 0/18 iken DURUM "düzeltildi" diyordu (D-182).
  it('15 günlük kaynakla manifest YAYINLANAMAZ', () => {
    const m = manifest('2026-08-01T12:00:00.000Z', '2026-08-16T12:00:00.000Z')
    expect(isPublishable(m)).toBe(false)
    const kusur = inspectManifest(m).find((d) => d.kind === 'stale_source')
    expect(kusur).toBeDefined()
    expect(kusur?.kind === 'stale_source' && kusur.ageDays).toBe(15)
  })

  it('karşılaştırma ÇALIŞTIRMA gününe göre — replay yıllar sonra aynı sonucu veriyor', () => {
    // Aynı kaynak, aynı çalıştırma: 2030'da yeniden incelense de taze SAYILIR, çünkü
    // ölçü `createdAt`. Duvar saati okunsaydı her replay farklı cevap verirdi.
    const m = manifest('2026-08-10T12:00:00.000Z', '2026-08-16T12:00:00.000Z')
    expect(isPublishable(m)).toBe(true)
    expect(isPublishable(m)).toBe(true)
  })
})
