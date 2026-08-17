// Panorama tipografi ekseni ve zeminden türeyen renk (FAZ-15.2 · §12.3 · R-23).
//
// ⚠ Bu dosya İKİ zincir kopukluğunu kapatan değişikliği bekliyor: (a) `Archivo`nun
// değişken genişlik ekseni depoda duruyordu ve panorama onu hiç kullanmıyordu,
// (b) panel/ray renkleri `rgba(255,255,255,…)` sabitiydi ve kâğıt zeminli şablonlarda
// görünmüyordu. İkisi de "modül var, üretim yolu yok" sınıfının üyesi (D-261).

import { describe, expect, it } from 'vitest'
import type { AssetStamp } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import {
  panoramaHtml,
  puntoOlcumu,
  VARSAYILAN_TIPO,
  type PanoramaBelgesi,
  type Yerlesim,
} from './panorama.js'

const stamp: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const belge = (ek: Partial<PanoramaBelgesi> = {}): PanoramaBelgesi => ({
  slaytGenisligi: 1080,
  yukseklik: 1350,
  kartlar: [
    {
      ustBaslik: 'BÖLÜM 01',
      baslik: 'Geri kazanım **kapasitesi**',
      govde: 'Akış hacmi belirleyici oldu.',
      panel: {
        tip: 'cubuklar',
        baslik: 'AKIŞ',
        satirlar: [{ etiket: '2025', deger: 77, not: '77,4 bin ton', tahmin: true }],
      },
      hayalet: '77',
      rayaSol: 'UPCYTECH',
      rayaOrta: 'TÜİK 2025',
    },
  ],
  bant: { tip: 'yok' },
  gorseller: [],
  zemin: 'var(--role-surface)',
  tokenCss: ':root{--role-bg:#f2b705;--role-surface:#fff;--role-line-edge:#111}',
  stamp,
  ...ek,
})

describe('panorama tipografi ekseni', () => {
  it('genişlik ekseni CSS değişkenine giriyor — sabit 88% DEĞİL', () => {
    const html = panoramaHtml(belge({ tipografi: { ...VARSAYILAN_TIPO, baslikGenislik: 63 } }))
    expect(html).toContain('--baslik-wdth: 63')
    expect(html).toContain('font-stretch: calc(var(--baslik-wdth) * 1%)')
  })

  it('punto CSS`te sabit değil, değişkenden geliyor', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('font-size: var(--baslik-punto)')
    // 82 px'lik eski sabit hiçbir yerde kalmadı.
    expect(html).not.toContain('font-size: 82px')
  })

  it('tabular rakam açık — sayı sütunları hizalanıyor', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('font-variant-numeric: tabular-nums')
  })
})

describe('zeminden türeyen renk', () => {
  // ⚠ ⚠ **İHLAL TESTİ: tek bir sabit beyaz bile kaldıysa kırmızı.** Kural "çoğu yerde
  // düzeltildi" değil; kâğıt zeminde görünmeyen TEK bir öge, o şablonu eksik yapar.
  it('panoramada hiçbir sabit rgba(255,255,255) kalmadı', () => {
    const html = panoramaHtml(belge())
    expect(html).not.toMatch(/rgba\(255,\s*255,\s*255/)
  })

  it('kart dışı ögeler `--pano-metin`den türüyor', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('--pano-metin:')
    expect(html).toContain('color-mix(in oklab, var(--pano-metin)')
  })

  it('kâğıt zeminde metin MÜREKKEP, koyu zeminde YÜZEY', () => {
    const acik = panoramaHtml(belge({ zemin: 'var(--role-surface)' }))
    const koyu = panoramaHtml(belge({ zemin: 'var(--role-line-edge)' }))
    expect(acik).toContain('--kart-metin:var(--role-line-edge)')
    expect(koyu).toContain('--kart-metin:var(--role-surface)')
  })
})

describe('çubuk paneli', () => {
  // ⚠ Yuva olmadan `width: %` esnek kapsayıcıda çözülmüyordu ve üç satır da aynı boyda
  // küçük kare çiziyordu: grafik hiçbir şey anlatmıyordu.
  it('çubuk bir yuvanın İÇİNDE — yüzde oranlanacak bir kutuya sahip', () => {
    const html = panoramaHtml(belge())
    expect(html).toContain('<span class="cubuk-yuva"><span class="cubuk')
    expect(html).toContain('.cubuk-yuva { flex: 1')
  })
})

describe('yerleşim', () => {
  const bekleme: readonly (readonly [Yerlesim, string])[] = [
    ['ust', 'flex-start'],
    ['ayrik', 'flex-start'],
    ['orta', 'center'],
    ['alt', 'flex-end'],
    ['yayik', 'space-between'],
  ]
  for (const [y, css] of bekleme)
    it(`\`${y}\` → justify-content: ${css}`, () => {
      expect(panoramaHtml(belge({ yerlesim: y }))).toContain(`justify-content: ${css}`)
    })

  // ⚠ `ust` ile `ayrik` aynı `justify-content`i veriyor ama panelde AYRIŞIYOR: ikisini
  // tek değerde tutmak, üstte hizalanıp panelini dipte istemeyen şablonu ifade edilemez
  // yapıyordu (`memphis`in paneli kesik öznenin arkasına düşüyordu).
  it('panel yalnız `ayrik`ta dibe itiliyor', () => {
    const dibe = '.panel, .sayilar, .etiketler { margin-top: auto }'
    expect(panoramaHtml(belge({ yerlesim: 'ayrik' }))).toContain(dibe)
    for (const y of ['ust', 'orta', 'alt', 'yayik'] as const)
      expect(panoramaHtml(belge({ yerlesim: y })), y).not.toContain(dibe)
  })
})

describe('punto ölçümü', () => {
  // ⚠ ⚠ **KENDİNİ ÖLÇEN METRİK TUZAĞI.** `.baslik` flex sütununda içeriğine göre daralıyor;
  // sınır `getBoundingClientRect` ile okunsaydı her puntoda "sığıyor" cevabı gelirdi ve
  // ölçüm asla kırmızıya dönmezdi. Bu oturumda aynı sınıf hata üç ayrı yerde çıktı.
  it('sütun sınırı ÖLÇÜLMÜYOR, sabit olarak gömülüyor', () => {
    const kod = puntoOlcumu(belge())
    expect(kod).not.toContain('getBoundingClientRect')
    // 1080 × 0,86 − 128 = 801
    expect(kod).toContain('const sinir = 801')
  })

  it('pay puntoyu çarpıyor — `editoryal` fısıldayabiliyor', () => {
    expect(puntoOlcumu(belge({ tipografi: { ...VARSAYILAN_TIPO, baslikPayi: 0.38 } }))).toContain(
      '* 0.38'
    )
  })
})
