import { describe, expect, it } from 'vitest'
import {
  matrisDenetle,
  matrisHataMesaji,
  varyantSayisi,
  varyantUret,
  type Eksen,
  type Varyant,
} from './matris.js'

const EKSENLER: readonly Eksen[] = [
  { ad: 'hook', duzeyler: ['h1', 'h2', 'h3'] },
  { ad: 'copy', duzeyler: ['c1', 'c2', 'c3'] },
  { ad: 'visual', duzeyler: ['v1', 'v2', 'v3'] },
]

const v = (hook: string, copy: string, visual: string): Varyant => ({
  koordinat: { hook, copy, visual },
})

/** OFAT: temel + her eksende tek oynatma = 1 + 2 + 2 + 2 = 7 varyant. */
const ofatKume: readonly Varyant[] = [
  v('h1', 'c1', 'v1'),
  v('h2', 'c1', 'v1'),
  v('h3', 'c1', 'v1'),
  v('h1', 'c2', 'v1'),
  v('h1', 'c3', 'v1'),
  v('h1', 'c1', 'v2'),
  v('h1', 'c1', 'v3'),
]

describe('OFAT tasarımı', () => {
  it('temelden tek eksende ayrılan küme geçerli', () => {
    expect(matrisDenetle({ eksenler: EKSENLER, varyantlar: ofatKume, mod: 'ofat' })).toEqual([])
  })

  // 🧪 FAZ-8.1 ihlal testi: iki ekseni AYNI ANDA değiştiren varyant.
  // Fark hangi eksene ait olduğu bilinemez; "kazanan" ilan etmek uydurma olur.
  it('iki ekseni birden değiştiren varyant REDDEDİLİYOR', () => {
    const h = matrisDenetle({
      eksenler: EKSENLER,
      varyantlar: [...ofatKume, v('h2', 'c2', 'v1')],
      mod: 'ofat',
    })
    expect(h).toHaveLength(1)
    expect(h[0]!.kind).toBe('cok_eksenli_sapma')
    expect(matrisHataMesaji(h[0]!)).toContain('ATFEDİLEMEZ')
  })

  it('üç ekseni birden değiştiren varyant da reddediliyor', () => {
    const h = matrisDenetle({
      eksenler: EKSENLER,
      varyantlar: [v('h1', 'c1', 'v1'), v('h2', 'c2', 'v2')],
      mod: 'ofat',
    })
    expect(h[0]!.kind === 'cok_eksenli_sapma' && h[0]!.sapanEksenler).toHaveLength(3)
  })

  it('yinelenen hücre yakalanıyor — maliyet var, bilgi yok', () => {
    const h = matrisDenetle({
      eksenler: EKSENLER,
      varyantlar: [...ofatKume, v('h2', 'c1', 'v1')],
      mod: 'ofat',
    })
    expect(h.some((x) => x.kind === 'yinelenen_hucre')).toBe(true)
  })

  it('tek düzeyli eksen bir eksen DEĞİL, sabittir', () => {
    const h = matrisDenetle({
      eksenler: [{ ad: 'hook', duzeyler: ['h1'] }],
      varyantlar: [{ koordinat: { hook: 'h1' } }],
      mod: 'ofat',
    })
    expect(h[0]!.kind).toBe('tek_duzeyli_eksen')
  })

  it('tanımsız düzey ve eksik eksen ayrı ayrı yakalanıyor', () => {
    const h = matrisDenetle({
      eksenler: EKSENLER,
      varyantlar: [{ koordinat: { hook: 'h9', copy: 'c1' } }],
      mod: 'ofat',
    })
    expect(h.some((x) => x.kind === 'bilinmeyen_duzey')).toBe(true)
    expect(h.some((x) => x.kind === 'eksik_eksen')).toBe(true)
  })
})

describe('tam kartezyen — yalnız asset_feed_spec', () => {
  it('eksik hücre yakalanıyor', () => {
    const h = matrisDenetle({
      eksenler: [
        { ad: 'hook', duzeyler: ['h1', 'h2'] },
        { ad: 'copy', duzeyler: ['c1', 'c2'] },
      ],
      varyantlar: [
        { koordinat: { hook: 'h1', copy: 'c1' } },
        { koordinat: { hook: 'h1', copy: 'c2' } },
        { koordinat: { hook: 'h2', copy: 'c1' } },
      ],
      mod: 'full',
    })
    expect(h).toHaveLength(1)
    expect(h[0]!.kind).toBe('eksik_hucre')
  })

  // `full` modda iki eksende farklılık NORMALDİR — kombinatoryal tasarımın tanımı bu.
  // OFAT kuralını buraya uygulamak, geçerli bir asset_feed_spec setini reddederdi.
  it('tam ızgarada çok eksenli farklılık HATA DEĞİL', () => {
    const h = matrisDenetle({
      eksenler: [
        { ad: 'hook', duzeyler: ['h1', 'h2'] },
        { ad: 'copy', duzeyler: ['c1', 'c2'] },
      ],
      varyantlar: [
        { koordinat: { hook: 'h1', copy: 'c1' } },
        { koordinat: { hook: 'h1', copy: 'c2' } },
        { koordinat: { hook: 'h2', copy: 'c1' } },
        { koordinat: { hook: 'h2', copy: 'c2' } },
      ],
      mod: 'full',
    })
    expect(h).toEqual([])
  })
})

describe('maliyet çarpanı', () => {
  // Fark dört kat: öğrenme için 27 render ödemek, 7'yle öğrenilecek şeyi
  // öğrenmemektir — Meta kombinasyonu zaten sunucuda kuruyor.
  it('OFAT 7, tam ızgara 27 varyant ister (3×3×3)', () => {
    expect(varyantSayisi(EKSENLER, 'ofat')).toBe(7)
    expect(varyantSayisi(EKSENLER, 'full')).toBe(27)
  })
})

describe('varyant üretimi — ihlali YAZILAMAZ kılmak', () => {
  // En güçlü koruma denetim değil, ihlalin doğamaması. Türetilen bir listede iki
  // eksenli sapma hiç oluşmaz.
  it('OFAT üretimi temelden tek eksende ayrılan küme veriyor', () => {
    const uretilen = varyantUret(EKSENLER, 'ofat')
    expect(uretilen).toHaveLength(7)
    expect(matrisDenetle({ eksenler: EKSENLER, varyantlar: uretilen, mod: 'ofat' })).toEqual([])
  })

  it('tam ızgara üretimi 27 varyant ve deliksiz', () => {
    const uretilen = varyantUret(EKSENLER, 'full')
    expect(uretilen).toHaveLength(27)
    expect(matrisDenetle({ eksenler: EKSENLER, varyantlar: uretilen, mod: 'full' })).toEqual([])
  })

  it('üretilen sayı `varyantSayisi` ile birebir — maliyet tahmini yalan söylemez', () => {
    for (const mod of ['ofat', 'full'] as const) {
      expect(varyantUret(EKSENLER, mod)).toHaveLength(varyantSayisi(EKSENLER, mod))
    }
  })
})
