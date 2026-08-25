// PALET AİLESİ — on şablonun onu da BEŞ paletten birine oturur (FAZ-19.6).
//
// ⚠ ⚠ **BEŞ PALET TOKEN'A GİRMİŞTİ AMA ÜÇ ŞABLON SİSTEMİN DIŞINDA KALMIŞTI.** Ölçüldü:
// `memphis` `--role-surface`, `donen` `--role-bg`, `editoryal` `--ramp-marka-kagit-0` ile
// çiziliyordu — yani jenerik rol belirteçleriyle, paletle değil. Yedi şablon zaten
// doğruydu ve reçetenin `A` tablosuyla birebir örtüşüyordu:
//   akan-alan P1 · sahne P1 · veri-hikayesi P5 · alinti P3 · kavis P4 ·
//   karsilastirma P2 · dizin P2
// Eksik üçü bağlandı: `memphis` P3 (kâğıt+oksit riso) · `editoryal` P3 (mavi YOK) ·
// `donen` P1 (mürekkep, kâğıtla dönüşümlü).
//
// ⚠ **AİLE GARANTİSİ MATEMATİKSEL:** beş palette `accent` hue'su sabit **262**, `signal`
// hue'su ISO 3864 uyarı bandında (26–95). Değişen yalnız L ve C. Bir şablon paletin
// dışına çıkarsa bu garanti sessizce bozulur ve on kart "aynı aileden" olmaktan çıkar.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

/** Reçete 0.3'ün beş paleti. Altıncı bir palet bir KARAR ister, bir satır değil. */
const PALETLER = ['murekkep', 'celik', 'kagit', 'beton', 'gece'] as const

const paletAdi = (deger: string): string | null => {
  const m = /--ramp-palet-([a-z]+)-/.exec(deger)
  return m === null ? null : (m[1] ?? null)
}

describe('palet ailesi', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · zemini BEŞ paletten birinden`, () => {
      const p = paletAdi(o.zemin)
      expect(
        p,
        `${id}: zemin "${o.zemin}" bir palete ait değil — jenerik rol belirteci ` +
          'kullanmak aile garantisini (accent hue 262) sessizce bozar'
      ).not.toBeNull()
      expect(PALETLER, `${id}: "${String(p)}" beş paletin dışında`).toContain(p)
    })
  }

  // ⚠ Aksan da paletten gelmeli: zemin doğru palette olup aksanı başka bir yerden almak,
  // "tek mavi anı nadirdir" kuralını taşıyan rengi ailenin dışına çıkarır.
  it('aksan taşıyan her şablonda aksan da PALETTEN', () => {
    let sayilan = 0
    for (const [id, o] of Object.entries(ORNEKLER)) {
      if (o.aksan === undefined) continue
      sayilan += 1
      const p = paletAdi(o.aksan)
      expect(p, `${id}: aksan "${o.aksan}" palet dışı`).not.toBeNull()
      // Aksan, zeminin paletiyle AYNI aileden olmak zorunda: iki palet karıştırmak
      // reçetenin `memphis` için açıkça izin verdiği tek durum (P3+P4 riso).
      if (id !== 'memphis') expect(p, `${id}: aksan paleti zeminden başka`).toBe(paletAdi(o.zemin))
    }
    expect(sayilan, 'hiç aksan ölçülmedi — kapı boşa dönüyor').toBeGreaterThan(6)
  })

  // ⚠ ⚠ **BEŞİ DE KULLANILMALI.** Beş palet tanımlayıp üçünü kullanmak, repertuarı
  // kâğıt üstünde tutmak demektir; denetimin *"on şablon, üç zemin"* bulgusu tam olarak
  // buydu ve o bulgu zeminin DOKUSU için kapanmıştı, RENGİ için değil.
  it('beş paletin BEŞİ de kullanılıyor', () => {
    const kullanilan = new Set(
      Object.values(ORNEKLER)
        .map((o) => paletAdi(o.zemin))
        .filter((p): p is string => p !== null)
    )
    const eksik = PALETLER.filter((p) => !kullanilan.has(p))
    expect(eksik.join(','), `kullanılmayan palet: ${eksik.join(', ')}`).toBe('')
  })
})
