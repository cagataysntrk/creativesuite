import { describe, expect, it } from 'vitest'
import type { DocumentModel } from '@suite/kernel'
import { AKICI_AILE, type AileProfili, TEMEL_AILE } from '@suite/contracts'
import { ALAN_KAYNAGI, dagilim, PARMAK_IZI_ALANLARI, parmakIzi, uzaklik } from './cesitlilik.js'

const karosel = (
  aile: AileProfili,
  duzenler: readonly string[],
  ekBlok: readonly unknown[] = []
): readonly DocumentModel[] =>
  duzenler.map(
    (duzen, i) =>
      ({
        width: 1080,
        height: 1350,
        slayt: { role: i === 0 ? 'kapak' : 'govde', index: i, total: duzenler.length, duzen },
        aile: {
          suslemeYogunlugu: aile.suslemeYogunlugu,
          vinyetGucu: aile.vinyetGucu,
          degrade: aile.degrade,
          panorama: aile.panorama,
          gorselIslemleri: aile.gorselIslemleri,
          tipoEfektleri: aile.tipoEfektleri,
        },
        blocks: i === 1 && ekBlok.length > 0 ? ekBlok : [{ type: 'body', text: 'metin' }],
      }) as unknown as DocumentModel
  )

const A = ['statement', 'list', 'list', 'claim-proof', 'statement']

describe('parmakIzi', () => {
  it('aynı girdi aynı izi verir — determinizm bir kusur değil, şart (R-06)', () => {
    expect(parmakIzi(karosel(TEMEL_AILE, A))).toEqual(parmakIzi(karosel(TEMEL_AILE, A)))
    expect(uzaklik(parmakIzi(karosel(TEMEL_AILE, A)), parmakIzi(karosel(TEMEL_AILE, A)))).toBe(0)
  })

  it('farklı aile ve içerik farklı iz verir', () => {
    const b = karosel(
      AKICI_AILE,
      ['quote', 'list', 'statement'],
      [
        {
          type: 'compare',
          title: 't',
          once: { label: 'a', items: ['x'] },
          sonra: { label: 'b', items: ['y'] },
        },
      ]
    )
    expect(uzaklik(parmakIzi(karosel(TEMEL_AILE, A)), parmakIzi(b))).toBeGreaterThan(0.5)
  })

  it('SLAYT SIRASI çeşitlilik değildir — alanlar sıralanıyor', () => {
    // ⚠ Sıralamasaydım aynı karar kümesinin farklı sırası "farklı" görünürdü; metriği
    // kendi lehine bükmenin en sessiz yolu tam olarak budur.
    const ters = [...A].reverse()
    expect(parmakIzi(karosel(TEMEL_AILE, A)).duzenler).toBe(
      parmakIzi(karosel(TEMEL_AILE, ters)).duzenler
    )
  })
})

describe('alan disiplini', () => {
  it('alan listesi KAPALI ve altı alan', () => {
    // Yedincisini eklemenin gerekçesi "çeşitlilik düşük çıktı" OLAMAZ.
    expect(PARMAK_IZI_ALANLARI.length).toBe(6)
  })

  it('her alanın kaynağı belli — aile mi içerik mi', () => {
    // ⚠ Bu ayrım olmadan defter yanlış suçluyordu: `duzenler` ve `veriOgesi` aileden
    // gelmiyor, sabit içerikte zorunlu olarak aynı çıkıyor.
    for (const k of PARMAK_IZI_ALANLARI) expect(['aile', 'icerik']).toContain(ALAN_KAYNAGI[k])
    expect(ALAN_KAYNAGI.duzenler).toBe('icerik')
    expect(ALAN_KAYNAGI.panorama).toBe('aile')
  })
})

describe('dagilim', () => {
  it('tek puan DEĞİL: benzersiz sayısı ve ortalama birlikte', () => {
    const izler = [parmakIzi(karosel(TEMEL_AILE, A)), parmakIzi(karosel(AKICI_AILE, A))]
    const d = dagilim(izler)
    expect(d.benzersiz).toBe(2)
    // İki aile bugün altı alanın YALNIZ İKİSİNDE ayrışıyor — ölçüm bunu saklamıyor.
    expect(d.ortalamaUzaklik).toBeCloseTo(2 / 6, 2)
  })

  it('boş küme 0 uzaklık verir, çökmez', () => {
    expect(dagilim([])).toEqual({ benzersiz: 0, ortalamaUzaklik: 0 })
  })
})
