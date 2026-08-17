// Şablon uyarlama — kompozisyon KİLİTLİ, içerik serbest (FAZ-15.7 · D-268).

import { describe, expect, it } from 'vitest'
import { ornekBul, type KatalogOrnegi } from '@suite/render'
import { uyarla, uyarlamaIstemi, type Uyarlama, type UyarlamaKarti } from './sablon-uyarla.js'

const ornek = ornekBul('veri-hikayesi') as KatalogOrnegi

const kart = (i: number, ek: Partial<UyarlamaKarti> = {}): UyarlamaKarti => ({
  ustBaslik: `BÖLÜM ${i}`,
  baslik: `Yeni konu **başlığı** ${i}`,
  govde: 'Konuya özgü gövde metni.',
  hayalet: String(i),
  rayaSol: 'YENİ KONU',
  rayaOrta: 'Şirket içi ölçüm, 2026-03',
  ...ek,
})

const uyarlama = (ek: Partial<UyarlamaKarti>[] = []): Uyarlama => ({
  sablonId: 'veri-hikayesi',
  kartlar: ornek.kartlar.map((_, i) => kart(i + 1, ek[i] ?? {})),
})

describe('uyarlama kompozisyona DOKUNAMIYOR', () => {
  it('bant, görseller, tipografi ve zemin şablondan geçiyor', () => {
    const r = uyarla(ornek, uyarlama())
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.belge.bant).toEqual(ornek.bant)
    expect(r.belge.tipografi).toEqual(ornek.tipografi)
    expect(r.belge.zeminDokusu).toEqual(ornek.zeminDokusu)
    expect(r.belge.yerlesim).toBe(ornek.yerlesim)
    expect(r.belge.slaytGenisligi).toBe(ornek.slaytGenisligi)
  })

  it('içerik GERÇEKTEN değişiyor — kopya değil uyarlama', () => {
    const r = uyarla(ornek, uyarlama())
    expect(r.ok && r.belge.kartlar[0]?.baslik).not.toBe(ornek.kartlar[0]?.baslik)
    expect(r.ok && r.belge.kartlar[0]?.ustBaslik).toBe('BÖLÜM 1')
  })

  // ⚠ ⚠ Model çıktısı JSON; tip koruması çalışma zamanında yok. Yayılma operatörüyle
  // birleştirseydik fazladan bir alan sessizce geçerdi.
  it('uyarlamada fazladan bir kompozisyon alanı varsa GEÇMİYOR', () => {
    const kirli = {
      sablonId: 'veri-hikayesi',
      kartlar: ornek.kartlar.map((_, i) => ({
        ...kart(i + 1),
        zemin: 'var(--role-bg)',
        slaytGenisligi: 9999,
      })),
    } as unknown as Uyarlama
    const r = uyarla(ornek, kirli)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.belge.slaytGenisligi).toBe(1080)
    // `veri-hikayesi` kartları kendi zeminini taşımıyor; uyarlamanınki sızmamalı.
    expect(r.belge.kartlar[0]).not.toHaveProperty('zemin')
  })

  it('`donen`in kart zemini şablondan geliyor, uyarlamadan değil', () => {
    const d = ornekBul('donen') as KatalogOrnegi
    const r = uyarla(d, { sablonId: 'donen', kartlar: d.kartlar.map((_, i) => kart(i + 1)) })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.belge.kartlar.map((k) => k.zemin)).toEqual(d.kartlar.map((k) => k.zemin))
  })
})

describe('uyarlama REDDEDİLEBİLİR', () => {
  it('kart sayısı değişemez', () => {
    const r = uyarla(ornek, { sablonId: 'veri-hikayesi', kartlar: [kart(1)] })
    expect(r.ok).toBe(false)
    expect(!r.ok && r.kusurlar[0]).toContain('kart sayısı')
  })

  // ⚠ ⚠ **YASA 8'İN UYARLAMA KARŞILIĞI.** Şablon `ÖRNEK VERİ` diyor; uyarlama onu
  // değiştirmezse kaynaksız bir iddia yayınlanabilir hâle gelirdi.
  it('şablonun örnek işareti kalırsa reddediliyor', () => {
    const r = uyarla(ornek, uyarlama([{ rayaOrta: 'ÖRNEK VERİ' }]))
    expect(r.ok).toBe(false)
    expect(!r.ok && r.kusurlar.join(' ')).toContain('örnek işareti')
  })

  it('boş kaynak reddediliyor', () => {
    const r = uyarla(ornek, uyarlama([{ rayaOrta: '  ' }]))
    expect(r.ok).toBe(false)
    expect(!r.ok && r.kusurlar.join(' ')).toContain('kaynak boş')
  })

  it('yarım kalan vurgu işareti reddediliyor', () => {
    const r = uyarla(ornek, uyarlama([{ baslik: 'Yarım **vurgu' }]))
    expect(r.ok).toBe(false)
    expect(!r.ok && r.kusurlar.join(' ')).toContain('yarım kalan')
  })

  it('panel tipi değiştirilemez', () => {
    const r = uyarla(ornek, uyarlama([{}, { panel: { tip: 'etiketler', ogeler: ['a', 'b'] } }]))
    expect(r.ok).toBe(false)
    expect(!r.ok && r.kusurlar.join(' ')).toContain('panel tipi değiştirilemez')
  })

  it('şablonda olmayan panel eklenemez', () => {
    const s = ornekBul('sahne') as KatalogOrnegi
    const r = uyarla(s, {
      sablonId: 'sahne',
      kartlar: s.kartlar.map((_, i) =>
        kart(i + 1, i === 0 ? { panel: { tip: 'etiketler', ogeler: ['x'] } } : {})
      ),
    })
    expect(r.ok).toBe(false)
    expect(!r.ok && r.kusurlar.join(' ')).toContain('panel eklemeye')
  })

  it('panel verisi AYNI tiple değiştirilebiliyor', () => {
    const r = uyarla(
      ornek,
      uyarlama([
        {},
        {
          panel: {
            tip: 'cubuklar',
            baslik: 'YENİ SERİ',
            satirlar: [{ etiket: '2026', deger: 90, not: '90 birim', tahmin: false }],
          },
        },
      ])
    )
    expect(r.ok).toBe(true)
    expect(r.ok && r.belge.kartlar[1]?.panel?.tip).toBe('cubuklar')
  })
})

describe('uyarlama istemi', () => {
  it('kart sayısını, rollerini ve panel tiplerini söylüyor', () => {
    const i = uyarlamaIstemi(ornek, 'veri-hikayesi', 'Geri kazanım kapasitesi')
    expect(i).toContain('6 kart')
    expect(i).toContain('DEĞİŞTİRİLEMEZ')
    expect(i).toContain('Geri kazanım kapasitesi')
  })

  it('kaynak zorunluluğunu istemde de söylüyor — kural iki yerde değil, aynı yerde', () => {
    expect(uyarlamaIstemi(ornek, 'veri-hikayesi', 'x')).toContain('ÖRNEK VERİ')
  })
})
