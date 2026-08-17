import { describe, expect, it } from 'vitest'
import { AKICI_AILE, TEMEL_AILE } from '@suite/contracts'
import { GORSEL_ISLEMLERI, islemKimligi, islemTanimi, islemZinciri } from './gorsel-islem.js'

describe('islemZinciri', () => {
  it('yalnız filtre referansı üretir — serbest CSS asla sızamaz', () => {
    const z = islemZinciri(['keskinlik', 'duotone'])
    expect(z).toBe(`url(#${islemKimligi('keskinlik')}) url(#${islemKimligi('duotone')})`)
    expect(z).not.toMatch(/[;{}]|saturate|blur|drop-shadow/)
  })

  it('SIRA dağarcıktan geliyor, çağıranın listesinden değil', () => {
    // ⚠ Keskinlik parlaklık üstünde çalışıyor, duotone parlaklığı marka eksenine eşliyor.
    // Ters sırada keskinlik iki renkli bir görüntüyü keskinleştirir ve hale bırakır.
    // Aileye bırakılsaydı yanlış sıralanmış bir liste SESSİZCE bozuk çıktı üretirdi.
    expect(islemZinciri(['duotone', 'keskinlik'])).toBe(islemZinciri(['keskinlik', 'duotone']))
    expect(islemZinciri(['duotone', 'keskinlik']).indexOf('keskinlik')).toBeLessThan(
      islemZinciri(['duotone', 'keskinlik']).indexOf('duotone')
    )
  })

  it('boş liste boş dize — `none` değil, satır hiç basılmasın', () => {
    expect(islemZinciri([])).toBe('')
  })
})

describe('islemTanimi', () => {
  it('her işlem sRGB uzayında çalışıyor', () => {
    // ⚠ Chromium varsayılanı linearRGB; iki işlem ayrı uzayda olsaydı zincir sessizce
    // başka bir şey üretirdi. Konvolüsyon o uzayda koyu uçta abartıyor.
    for (const i of GORSEL_ISLEMLERI) {
      expect(islemTanimi(i)).toContain('color-interpolation-filters="sRGB"')
      expect(islemTanimi(i)).toContain(`id="${islemKimligi(i)}"`)
    }
  })

  it('keskinlik çekirdeği toplamı 1 — parlaklık korunuyor', () => {
    const m = /kernelMatrix="([^"]+)"/.exec(islemTanimi('keskinlik'))
    expect(m).not.toBeNull()
    const toplam = (m?.[1] ?? '')
      .split(/\s+/)
      .map(Number)
      .reduce((a, b) => a + b, 0)
    // Toplam 1 olmasaydı görüntü koyulaşır/açılır ve kontrast metriği kayardı.
    expect(toplam).toBeCloseTo(1, 6)
  })

  it('alfa keskinleştirilmiyor — kenarlar tırtıklanmasın', () => {
    expect(islemTanimi('keskinlik')).toContain('preserveAlpha="true"')
  })
})

describe('aile ↔ dağarcık', () => {
  it('iki aile de dağarcığın içinden seçiyor', () => {
    for (const a of [TEMEL_AILE, AKICI_AILE]) {
      expect(a.gorselIslemleri.length).toBeGreaterThan(0)
      for (const i of a.gorselIslemleri) expect(GORSEL_ISLEMLERI).toContain(i)
    }
  })

  it('duotone HER ailede açık — renk tutarlılığı estetik bir tercih değil', () => {
    // ⚠ FAZ-11.7'de duotone, prompt'a "monokrom yaz" diye yalvarmanın yerine kondu.
    // Bir ailenin onu kapatabilmesi, garantiyi estetik katmana indirmek olurdu.
    for (const a of [TEMEL_AILE, AKICI_AILE]) expect(a.gorselIslemleri).toContain('duotone')
  })
})
