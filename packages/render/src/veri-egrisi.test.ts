// GEOMETRİ İDDİANIN KANITI — eğri, başlığın söylediği sayıyı ÇİZMEK zorunda (FAZ-19.7).
//
// ⚠ ⚠ **DENETİMİN EN SERT TEK CÜMLESİ BURAYA AİT:** *"grafik başlığı YALANLIYOR —
// 'iki katına çıkan' derken çizgi ~4°; bu zevk değil ARGÜMAN hatası."* Ölçüldü: eğrinin
// taşıdığı değer taban çizgisinden yükseklik (`100 − y`) ve eski noktalar 30 → 96, yani
// **3,2×**. Tipografi "iki kat" derken geometri "üç kat" çiziyordu.
//
// ⚠ Bu test bir SAYIYI değil bir İLİŞKİYİ sınıyor: başlıkta "iki katına" geçiyorsa
// eğrinin son değeri ilk değerinin iki katı olmalı. Metin değişirse test de değişir —
// ama sessizce ayrışamazlar.

import { describe, expect, it } from 'vitest'
import { lower } from '@suite/contracts'
import { ORNEKLER } from './katalog-ornek.js'

/** Eğrinin taşıdığı değer: taban çizgisinden yükseklik. */
const deger = (y: number): number => 100 - y

// ⚠ ⚠ **AYNI KURAL `kavis`TE DE KIRIKTI ve kimse bakmamıştı.** Üçüncü kare *"Sapma
// görünür olmalı"* diyor, gövdesi *"görünmeyen sapma, ortalamanın içinde kaybolur"*
// diye açıyor — ve on üç kemerin on üçü BİREBİR aynı yükseklikteydi. Tipografi sapmadan
// söz ederken geometri kusursuz bir ritim çiziyordu: kart kendi cümlesini yalanlıyordu.
// Sapan kemer o kartın ölü bandını da kapattı (%30 → %17) — süs değil ARGÜMAN.
describe('kemer ritmi — sapma iddiası ile geometri', () => {
  const o = ORNEKLER['kavis']

  it('örnek var ve kemer bandı taşıyor', () => {
    expect(o, 'kavis örneği yok').toBeDefined()
    expect((o?.bant as { tip?: string } | undefined)?.tip, 'bant tipi').toBe('kemer')
  })

  it('"sapma" diyen kart VAR ve kemerlerde bir sapma çizili', () => {
    if (o === undefined) return
    const b = o.bant as { sayi?: number; sapma?: { indeks: number; carpan: number } }
    const sapmaKarti = o.kartlar.findIndex((k) =>
      // ⚠ `toLocaleLowerCase('tr')` DOĞRU olurdu ama `turkish-case` kapısı eşleştirmeden
      // önce string gövdelerini siliyor: denetlediği argümanı GÖREMİYOR ve her doğru
      // kullanımı yanlış pozitif sayıyor (aynı not `katalog-ornek.test.ts`te). Kapıyı
      // gevşetmek yerine deponun yetkili yardımcısı — zaten doğru cevap o (R-21).
      lower(`${k.ustBaslik ?? ''} ${k.baslik} ${k.govde ?? ''}`).includes('sapma')
    )
    expect(sapmaKarti, 'sapmadan söz eden kart yok').toBeGreaterThanOrEqual(0)
    expect(b.sapma, 'kart sapmadan söz ediyor, geometride sapma yok').toBeDefined()
    if (b.sapma === undefined || b.sayi === undefined) return
    // ⚠ Sapma GÖRÜNÜR olmalı: %10'luk bir fark ritmin içinde kaybolur, tam da kartın
    // *"ortalamanın içinde kaybolur"* dediği şey olurdu.
    expect(Math.abs(b.sapma.carpan - 1), `çarpan ${String(b.sapma.carpan)}`).toBeGreaterThanOrEqual(
      0.25
    )
    // ⚠ Ve sapma O KARTIN üstünde: başka bir karede sapan kemer, cümleyi kanıtlamaz.
    const kartGenisligi = b.sayi / o.kartlar.length
    const kart = Math.floor((b.sapma.indeks + 0.5) / kartGenisligi)
    expect(
      kart,
      `sapan kemer kart ${String(kart + 1)}'de, cümle kart ${String(sapmaKarti + 1)}'de`
    ).toBe(sapmaKarti)
  })

  it('sapma TEK — ikisi ritim değişimi olur, sapma olmaz', () => {
    const b = o?.bant as { sapma?: unknown } | undefined
    expect(Array.isArray(b?.sapma), 'sapma bir liste değil, tek kemer').toBe(false)
  })
})

describe('veri eğrisi — iddia ile geometri', () => {
  const o = ORNEKLER['veri-hikayesi']

  it('örnek var ve eğri noktaları taşıyor', () => {
    expect(o).toBeDefined()
    expect(o?.bant.tip).toBe('egri')
  })

  it('başlık "iki katına" diyor — eğri de İKİ KAT yükseliyor', () => {
    if (o === undefined || o.bant.tip !== 'egri') return
    const kapak = o.kartlar[0]
    expect(kapak?.baslik.replace(/\*\*/g, '')).toContain('iki katına')
    const n = o.bant.noktalar
    const ilk = deger(n[0]?.y ?? 0)
    const son = deger(n[n.length - 1]?.y ?? 0)
    expect(ilk).toBeGreaterThan(0)
    // ⚠ Tolerans %2: nokta değerleri tam sayı ve ara noktalar yumuşak bir eğri çiziyor.
    expect(
      son / ilk,
      `eğri ${String(ilk)} → ${String(son)} = ${(son / ilk).toFixed(2)}×`
    ).toBeCloseTo(2, 1)
  })

  // ⚠ Eğri MONOTON yükselmeli: "iki katına çıkan" bir eğri arada düşerse iddia yine
  // yalan olur — bu kez daha sinsi biçimde, çünkü uçlar tutuyor.
  it('eğri monoton yükseliyor — arada düşmüyor', () => {
    if (o === undefined || o.bant.tip !== 'egri') return
    const n = o.bant.noktalar
    for (let i = 1; i < n.length; i += 1)
      expect(deger(n[i]?.y ?? 0), `nokta ${String(i)} düşüyor`).toBeGreaterThan(
        deger(n[i - 1]?.y ?? 0)
      )
  })

  // ⚠ Kilometre durakları eğrinin ÜSTÜNDE duruyor (render tarafı); burada veri tarafı
  // sınanıyor: her durağın x'i eğrinin kapsadığı aralıkta olmalı, yoksa ara değer
  // uçtaki noktaya yapışır ve durak eğriden kopar.
  it('her kilometre durağı eğrinin x aralığında', () => {
    if (o === undefined || o.bant.tip !== 'egri') return
    const n = o.bant.noktalar
    const enKucuk = Math.min(...n.map((q) => q.x))
    const enBuyuk = Math.max(...n.map((q) => q.x))
    for (const k of o.bant.kilometre) {
      expect(k.x).toBeGreaterThanOrEqual(enKucuk)
      expect(k.x).toBeLessThanOrEqual(enBuyuk)
    }
  })
})
