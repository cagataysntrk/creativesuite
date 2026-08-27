import { describe, expect, it } from 'vitest'
import { usd } from '@suite/contracts'
import type { Candidate } from '@suite/providers'
import { route, totalEstimate } from './route.js'
import type { CapabilityRequest, ProviderPricing } from './route.js'
import { rejectionMessage } from './reasons.js'
import { displayTry } from './rate.js'

const aday = (id: string, over: Partial<Candidate> = {}): Candidate => ({
  providerId: id,
  title: id,
  lanes: ['free', 'premium'],
  available: true,
  unavailableReason: null,
  ...over,
})

const fiyat = (id: string, over: Partial<ProviderPricing> = {}): ProviderPricing => ({
  providerId: id,
  costFormula: '0.02 * num_images',
  pricingVerified: true,
  quality: 50,
  latencySeconds: 10,
  supports: {},
  ...over,
})

const istek = (over: Partial<CapabilityRequest> = {}): CapabilityRequest => ({
  capability: 'image.generate',
  lane: 'premium',
  constraints: {},
  params: { num_images: 1 },
  prefer: 'cost',
  maxCost: null,
  ...over,
})

describe('filtrele — eleme SESSİZ değil', () => {
  it('şerit uymayan eleniyor, gerekçesiyle', () => {
    const d = route(istek(), [aday('a', { lanes: ['free'] })], { a: fiyat('a') })
    expect(d.winner).toBeNull()
    expect(d.rejected[0]?.reason.kind).toBe('lane_mismatch')
  })

  it('kullanılamayan aday LİSTELENİYOR — "aday yok" ile aynı şey değil', () => {
    const d = route(
      istek(),
      [aday('a', { available: false, unavailableReason: 'CLI kurulu değil' })],
      {
        a: fiyat('a'),
      }
    )
    expect(d.winner).toBeNull()
    expect(d.rejected).toHaveLength(1)
    expect(rejectionMessage(d.rejected[0]!.reason)).toContain('CLI kurulu değil')
  })

  it('fiyatsız sağlayıcı aday OLAMAZ', () => {
    const d = route(istek(), [aday('a')], { a: fiyat('a', { costFormula: null }) })
    expect(d.rejected[0]?.reason.kind).toBe('no_pricing')
  })

  it('desteklenmeyen kısıt eleniyor; BİLİNMEYEN kısıt elemiyor', () => {
    const kirmizi = route(istek({ constraints: { aspect: '1:1' } }), [aday('a')], {
      a: fiyat('a', { supports: { aspect: ['9:16', '4:5'] } }),
    })
    expect(kirmizi.rejected[0]?.reason.kind).toBe('constraint_unsupported')

    // `supports` bloğunda hiç geçmeyen kısıt "desteklenmiyor" demek DEĞİLDİR —
    // yoksa eksik yazılmış her tanımlayıcı elenirdi.
    const yesil = route(istek({ constraints: { seed: 42 } }), [aday('a')], { a: fiyat('a') })
    expect(yesil.winner?.providerId).toBe('a')
  })

  it('adım tavanını aşan eleniyor', () => {
    const d = route(istek({ maxCost: usd(1000n), params: { num_images: 10 } }), [aday('a')], {
      a: fiyat('a'),
    })
    expect(d.rejected[0]?.reason.kind).toBe('over_step_cap')
    expect(rejectionMessage(d.rejected[0]!.reason)).toContain('adım tavanını aşıyor')
  })
})

describe('fiyatla ve skorla', () => {
  it('prefer:cost en ucuzu seçiyor', () => {
    const d = route(istek({ prefer: 'cost' }), [aday('ucuz'), aday('pahali')], {
      ucuz: fiyat('ucuz', { costFormula: '0.01' }),
      pahali: fiyat('pahali', { costFormula: '0.10', quality: 90 }),
    })
    expect(d.winner?.providerId).toBe('ucuz')
    expect(d.fallbacks[0]?.providerId).toBe('pahali')
  })

  it('prefer:quality aynı adaylarda kaliteliyi seçiyor', () => {
    const d = route(istek({ prefer: 'quality' }), [aday('ucuz'), aday('pahali')], {
      ucuz: fiyat('ucuz', { costFormula: '0.01', quality: 30 }),
      pahali: fiyat('pahali', { costFormula: '0.10', quality: 95 }),
    })
    expect(d.winner?.providerId).toBe('pahali')
  })

  it('doğrulanmamış fiyat ARALIK üretiyor ve güven `amber`', () => {
    const d = route(istek(), [aday('a')], {
      a: fiyat('a', { costFormula: '0.02', pricingVerified: false }),
    })
    expect(d.winner?.confidence).toBe('amber')
    expect(d.winner!.cost.low.micros).toBeLessThan(d.winner!.cost.high.micros)
  })

  it('doğrulanmış fiyat tek nokta ve `green`', () => {
    const d = route(istek(), [aday('a')], { a: fiyat('a', { costFormula: '0.02' }) })
    expect(d.winner?.confidence).toBe('green')
    expect(d.winner!.cost.low.micros).toBe(d.winner!.cost.high.micros)
  })

  it('sıralama DETERMİNİSTİK — aynı skorda id ile kırılıyor', () => {
    const iki = () =>
      route(istek(), [aday('b'), aday('a')], { a: fiyat('a'), b: fiyat('b') }).winner?.providerId
    expect(iki()).toBe('a')
    expect(iki()).toBe('a')
  })
})

describe('kaydet — her kaybeden gerekçesiyle (§8.2 aşama 5)', () => {
  it('kazanan VE üç ayrı gerekçeli kaybeden birlikte dönüyor', () => {
    const d = route(
      istek({ constraints: { aspect: '1:1' }, maxCost: usd(50_000n) }),
      [aday('kazanan'), aday('serit', { lanes: ['free'] }), aday('kisit'), aday('fiyatsiz')],
      {
        kazanan: fiyat('kazanan'),
        serit: fiyat('serit'),
        kisit: fiyat('kisit', { supports: { aspect: ['9:16'] } }),
        fiyatsiz: fiyat('fiyatsiz', { costFormula: null }),
      }
    )
    expect(d.winner?.providerId).toBe('kazanan')
    expect(d.rejected.map((r) => r.reason.kind).sort()).toEqual([
      'constraint_unsupported',
      'lane_mismatch',
      'no_pricing',
    ])
    // Her gerekçe Türkçe ve BOŞ DEĞİL — manifest'e yazılacak metin bu.
    for (const r of d.rejected) expect(rejectionMessage(r.reason).length).toBeGreaterThan(10)
  })

  it('toplam tahmin adım aralıklarının toplamı', () => {
    const d = route(istek(), [aday('a')], { a: fiyat('a', { costFormula: '0.02' }) })
    expect(totalEstimate([d, d]).high.micros).toBe(40_000n)
  })
})

describe('TRY yalnız GÖRÜNTÜ (D-36)', () => {
  it('tr-TR biçimi ve doğrulanmamış kur uyarısı', () => {
    const s = displayTry(usd(1_000_000n), { date: '2026-08-15', usdTry: 41.85, verified: false })
    expect(s).toContain('41,85')
    expect(s).toContain('doğrulanmamış kur')
  })

  it('`Money` DÖNMÜYOR — TRY toplanabilir olsaydı para modeli ikiye bölünürdü', () => {
    expect(typeof displayTry(usd(1n), { date: 'x', usdTry: 40, verified: true })).toBe('string')
  })
})

// ── ihlal testi: bütçe tavanı GERÇEKTEN kilitliyor mu (R-71 · D-17) ──────────
import { emptyBudget, lease, refusalMessage } from '../budget.js'

describe('bütçe tavanı — Başlat KİLİTLİ, gerekçe Türkçe', () => {
  it('tahminin ÜST sınırı tavanı aşınca kiralama reddediliyor', () => {
    const b = emptyBudget({ perRun: usd(10_000n), perMonth: null })
    const d = route(istek({ params: { num_images: 1 } }), [aday('a')], {
      a: fiyat('a', { costFormula: '0.05' }), // $0.05 = 50.000 mikro > 10.000 tavan
    })
    const k = lease(b, d.winner!.cost.high)
    expect(k.ok).toBe(false)
    if (!k.ok) {
      expect(k.refusal.kind).toBe('run_cap_exceeded')
      const mesaj = refusalMessage(k.refusal)
      expect(mesaj).toContain('Çalıştırma bütçesi aşılıyor')
      // Gerekçe Türkçe VE sayılı: "bütçe yetersiz" tek başına kullanıcıya tavanı
      // ne kadar yükseltmesi gerektiğini söylemez.
      expect(mesaj).toContain('0.0500')
      expect(mesaj).toContain('0.0100')
    }
  })

  it('tavanın ALTINDA kalan aynı çalıştırma geçiyor — kapı boş kilitlemiyor', () => {
    const b = emptyBudget({ perRun: usd(100_000n), perMonth: null })
    const d = route(istek(), [aday('a')], { a: fiyat('a', { costFormula: '0.05' }) })
    expect(lease(b, d.winner!.cost.high).ok).toBe(true)
  })

  it('ORTALAMA ile değil ÜST sınırla kiralanıyor', () => {
    // Doğrulanmamış fiyat $0.05 → aralık $0.0375–$0.0625. Tavan $0.05 olsaydı ortalama
    // ile geçerdi; üst sınırla geçmemeli — yoksa aralığın üst ucuna denk gelen bir
    // çalıştırma tavanı sessizce aşar.
    const b = emptyBudget({ perRun: usd(50_000n), perMonth: null })
    const d = route(istek(), [aday('a')], {
      a: fiyat('a', { costFormula: '0.05', pricingVerified: false }),
    })
    expect(d.winner!.cost.high.micros).toBe(62_500n)
    expect(lease(b, d.winner!.cost.high).ok).toBe(false)
  })

  it('PREMIUM şeritte bedava sağlayıcı YEDEK, ücretli KAZANIR', () => {
    // ⚠ ⚠ **ÖLÇÜLEN KUSUR: premium şerit `free` ile AYNI sağlayıcıyı seçiyordu.**
    // Skorun %60'ı maliyet ve maliyet "grup içinde en ucuz = 1.0" diye hesaplanıyor;
    // bedava aday hep 1.0 alıyor, ücretli aday 0'a yakın. Kalite ise henüz ölçülmediği
    // için herkeste sabit 50. Sonuç: ücretli sağlayıcı premium şeritte bile ASLA
    // kazanamıyordu ve `premium` bir etiketten ibaretti.
    const d = route(
      istek({ lane: 'premium', prefer: 'cost' }),
      [aday('bedava', { lanes: ['free', 'premium'] }), aday('ucretli', { lanes: ['premium'] })],
      {
        bedava: fiyat('bedava', { costFormula: '0' }),
        ucretli: fiyat('ucretli', { costFormula: '0.039 * num_images' }),
      }
    )
    expect(d.winner?.providerId, 'ücretli kazandı').toBe('ucretli')
    // ⚠ Bedava aday ELENMİYOR, yedeğe düşüyor: ücretli sağlayıcı kota yerse zincir
    // ona geçiyor ve premium bir koşu görselsiz kalmıyor.
    expect(
      d.fallbacks.map((f) => f.providerId),
      'bedava aday YEDEK'
    ).toEqual(['bedava'])
    expect(
      d.rejected.map((r) => r.providerId),
      'hiçbiri elenmedi'
    ).toEqual([])
  })

  it('FREE şeritte davranış DEĞİŞMEDİ — ucuz olan kazanmaya devam ediyor', () => {
    // Şerit kuralı yalnız premium'a dokunuyor; bedava şeritte ücretli aday zaten
    // şerit uyuşmazlığıyla eleniyor ve en ucuz kazanıyor.
    const d = route(
      istek({ lane: 'free', prefer: 'cost' }),
      [aday('bedava', { lanes: ['free', 'premium'] }), aday('ucretli', { lanes: ['premium'] })],
      {
        bedava: fiyat('bedava', { costFormula: '0' }),
        ucretli: fiyat('ucretli', { costFormula: '0.039 * num_images' }),
      }
    )
    expect(d.winner?.providerId).toBe('bedava')
    expect(d.rejected.map((r) => r.providerId)).toEqual(['ucretli'])
  })
})
