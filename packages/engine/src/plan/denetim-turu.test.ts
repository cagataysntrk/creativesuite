// Son kontrol ve düzeltme turu — tavan İKİ, gerileme geri alınıyor (FAZ-15.8).

import { describe, expect, it } from 'vitest'
import { ornekBul, type KatalogOrnegi } from '@suite/render'
import {
  denetimTuru,
  duzeltmeIstemi,
  TUR_TAVANI,
  type DenetimKusuru,
  type Denetleyici,
} from './denetim-turu.js'
import type { Uyarlama, UyarlamaKarti } from './sablon-uyarla.js'

const ornek = ornekBul('veri-hikayesi') as KatalogOrnegi

const kart = (i: number, ek: Partial<UyarlamaKarti> = {}): UyarlamaKarti => ({
  ustBaslik: `BÖLÜM ${i}`,
  baslik: `Başlık **${i}** burada`,
  govde: 'Gövde metni.',
  hayalet: String(i),
  rayaSol: 'KONU',
  rayaOrta: 'Saha ölçümü 2026',
  ...ek,
})

const uyarlama = (): Uyarlama => ({
  sablonId: 'veri-hikayesi',
  kartlar: ornek.kartlar.map((_, i) => kart(i + 1)),
})

const kusur = (a: string): DenetimKusuru => ({ tur: 'tasma', kart: 1, alan: 'baslik', aciklama: a })

/** Sırayla verilen kusur listelerini döndüren sahte denetim. */
const sirali = (diziler: readonly (readonly DenetimKusuru[])[]): Denetleyici => {
  let i = 0
  return async () => diziler[Math.min(i++, diziler.length - 1)] ?? []
}

describe('denetim turu', () => {
  it('kusur yoksa hiç düzeltme çağırmıyor', async () => {
    let cagri = 0
    const r = await denetimTuru(ornek, uyarlama(), sirali([[]]), async () => {
      cagri += 1
      return uyarlama()
    })
    expect('hata' in r).toBe(false)
    if ('hata' in r) return
    expect(cagri).toBe(0)
    expect(r.kalanKusurlar).toEqual([])
    expect(r.defter).toHaveLength(1)
  })

  it('bir turda düzeliyorsa ikinciyi koşmuyor', async () => {
    let cagri = 0
    const r = await denetimTuru(ornek, uyarlama(), sirali([[kusur('taşma')], []]), async () => {
      cagri += 1
      return uyarlama()
    })
    expect('hata' in r ? r.hata : '').toBe('')
    if ('hata' in r) return
    expect(cagri).toBe(1)
    expect(r.kalanKusurlar).toEqual([])
  })

  // ⚠ ⚠ **TAVAN, "sorun bul" diyen agentın sonsuza kadar sorun bulmasına karşı.**
  it('kusur sürerse EN FAZLA iki tur koşuyor', async () => {
    let cagri = 0
    const r = await denetimTuru(
      ornek,
      uyarlama(),
      sirali([[kusur('a')], [kusur('b')], [kusur('c')], [kusur('d')]]),
      async () => {
        cagri += 1
        return uyarlama()
      }
    )
    expect('hata' in r ? r.hata : '').toBe('')
    if ('hata' in r) return
    expect(cagri).toBe(TUR_TAVANI)
    expect(r.kalanKusurlar.length).toBeGreaterThan(0)
    expect(r.defter).toHaveLength(TUR_TAVANI + 1)
  })

  it('düzeltici `null` derse tur erken bitiyor', async () => {
    const r = await denetimTuru(ornek, uyarlama(), sirali([[kusur('a')]]), async () => null)
    expect('hata' in r ? r.hata : '').toBe('')
    if ('hata' in r) return
    expect(r.defter.at(-1)?.duzeltildi).toBe(false)
  })

  // ⚠ ⚠ "Her tur iyileştirir" bir VARSAYIM; ölçülmeden doğru sayılamaz.
  it('düzeltme daha çok kusur üretirse GERİ ALINIYOR', async () => {
    const r = await denetimTuru(
      ornek,
      uyarlama(),
      sirali([[kusur('a')], [kusur('a'), kusur('b'), kusur('c')], [kusur('a')]]),
      async (_k, onceki) => ({
        ...onceki,
        kartlar: onceki.kartlar.map((k, i) =>
          i === 0 ? { ...k, baslik: 'Kötü **düzeltme**' } : k
        ),
      })
    )
    expect('hata' in r ? r.hata : '').toBe('')
    if ('hata' in r) return
    // Gerileyen tur uygulanmadı: ilk kartın başlığı ilk hâlinde kaldı.
    expect(r.belge.kartlar[0]?.baslik).toBe('Başlık **1** burada')
  })

  // ⚠ Düzeltme uyarlama sözleşmesinden geçemezse tur ATILIYOR: kompozisyonu bozan ya da
  // kaynağı silen bir "düzeltme" yarı uygulanmaz.
  it('sözleşmeyi ihlal eden düzeltme uygulanmıyor ve deftere yazılıyor', async () => {
    const r = await denetimTuru(ornek, uyarlama(), sirali([[kusur('a')]]), async (_k, onceki) => ({
      ...onceki,
      kartlar: onceki.kartlar.map((k) => ({ ...k, rayaOrta: 'ÖRNEK VERİ' })),
    }))
    expect('hata' in r ? r.hata : '').toBe('')
    if ('hata' in r) return
    expect(r.belge.kartlar[0]?.rayaOrta).toBe('Saha ölçümü 2026')
    expect(JSON.stringify(r.defter)).toContain('duzeltme-reddedildi')
  })

  it('ilk uyarlama geçersizse tur hiç başlamıyor', async () => {
    const bozuk: Uyarlama = { sablonId: 'veri-hikayesi', kartlar: [kart(1)] }
    const r = await denetimTuru(ornek, bozuk, sirali([[]]), async () => null)
    expect('hata' in r).toBe(true)
  })
})

describe('düzeltme istemi', () => {
  it('kusurları ve dokunulabilir alanları söylüyor', () => {
    const i = duzeltmeIstemi([kusur('panel dikeyde tuvali aşıyor')])
    expect(i).toContain('kart 1')
    expect(i).toContain('kompozisyona dokunamazsın')
  })

  // ⚠ Metinle düzeltilemeyecek bir kusuru "düzelt" diye vermek, agenta olmayan bir
  // yetki tarif etmektir; istem bunu açıkça söylüyor.
  it('kompozisyon kusurunun metinle düzeltilemeyeceğini söylüyor', () => {
    expect(duzeltmeIstemi([kusur('x')])).toContain('insana bırak')
  })
})
