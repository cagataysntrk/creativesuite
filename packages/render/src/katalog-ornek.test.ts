// Katalog dolu taslak — örnek ile kayıt arasında KAYMA olmasın (FAZ-15.4 · D-268).
//
// ⚠ Bu testin varlık sebebi somut: katalog kaydı `packages/contracts`ta, örnek belge
// `packages/render`da. İki liste iki ayrı dosyada ve **hiçbir derleme hatası onları
// birbirine bağlamıyor.** Bir şablon eklenip örneği unutulursa hat koşu anında — yani
// para harcandıktan sonra — patlar. Kapı burada.

import { describe, expect, it } from 'vitest'
import { KATALOG } from '@suite/contracts'
import { ORNEKLER, ornekBul, type KatalogOrnegi } from './katalog-ornek.js'
import { VARSAYILAN_TIPO } from './panorama.js'

const ornekler = Object.entries(ORNEKLER)

describe('katalog ↔ örnek eşleşmesi', () => {
  it('katalogdaki her şablonun bir örneği var', () => {
    const eksik = KATALOG.filter((s) => ornekBul(s.id) === null).map((s) => s.id)
    expect(eksik).toEqual([])
  })

  it('her örneğin katalogda bir kaydı var — sahipsiz örnek yok', () => {
    const idler = new Set(KATALOG.map((s) => s.id))
    expect(Object.keys(ORNEKLER).filter((id) => !idler.has(id))).toEqual([])
  })

  it('slayt sayısı kataloğun ilan ettiği aralıkta', () => {
    for (const s of KATALOG) {
      const o = ornekBul(s.id)
      expect(o, s.id).not.toBeNull()
      expect((o as KatalogOrnegi).kartlar.length, s.id).toBeGreaterThanOrEqual(s.slayt.min)
      expect((o as KatalogOrnegi).kartlar.length, s.id).toBeLessThanOrEqual(s.slayt.max)
    }
  })

  it('görsel ilan eden şablonun örneği görsel yuvası taşıyor', () => {
    for (const s of KATALOG) {
      const o = ornekBul(s.id) as KatalogOrnegi
      if (s.gorsel === null) continue
      expect(o.gorseller.length, s.id).toBeGreaterThan(0)
      // ⚠ Kırpma kataloğun ilanıyla aynı olmalı: `daire` ilan edip `kesik` çizen bir
      // örnek, brief'i doğru üretilmiş bir görseli yanlış maskeye sokar.
      for (const g of o.gorseller) expect(g.kirpma, s.id).toBe(s.gorsel.kirpma)
    }
  })

  // ⚠ `alan` kaydı ayrı bir bant ögesi DEĞİL, iki alanı ayıran sınır demek: örnek
  // `bant: 'yok'` taşır ama `alanSiniri` taşımak ZORUNDADIR. Sürekliliği ilan edip
  // kurmamak, kurmamaktan kötüdür.
  it('bant tipi kataloğun ilanıyla aynı', () => {
    for (const s of KATALOG) {
      const o = ornekBul(s.id) as KatalogOrnegi
      if (s.bant.tip === 'alan') {
        expect(o.bant.tip, s.id).toBe('yok')
        expect(o.alanSiniri, s.id).toBeDefined()
        expect((o.alanSiniri?.noktalar ?? []).length, s.id).toBeGreaterThan(2)
      } else expect(o.bant.tip, s.id).toBe(s.bant.tip)
    }
  })
})

describe('örnek içeriği', () => {
  // ⚠ ⚠ **YASA 8 ÖRNEKTE DE GEÇERLİ.** Kaynaksız sayısal iddia yayınlanamaz; örnek
  // içerik de yayınlanabilir bir şeydir (agent onu çoğaltıyor). Gerçek bir kuruma
  // uydurma atıf yazmak "daha gerçekçi" olurdu ve tam olarak bu yüzden yasak.
  it('her kart kaynak beyan ediyor ve örnek verisi İŞARETLİ', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar) {
        expect(k.rayaOrta.trim(), id).not.toBe('')
        expect(k.rayaOrta, id).toContain('ÖRNEK')
      }
  })

  it('hiçbir kart boş başlıkla gelmiyor — taslak DOLU', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar) {
        expect(k.baslik.trim().length, id).toBeGreaterThan(8)
        expect(k.ustBaslik.trim(), id).not.toBe('')
      }
  })

  // ⚠ Boş bir panel, panel başlığını çizip altını boş bırakıyor: "ÜÇ ÖNCELİK" yazıp
  // hiçbir şey göstermeyen bir kutu. İlk sürümde iki şablonda tam bu vardı.
  it('panel varsa İÇİ de var', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar) {
        if (k.panel === null) continue
        const p = k.panel
        if (p.tip === 'cubuklar') expect(p.satirlar.length, id).toBeGreaterThan(0)
        if (p.tip === 'liste') expect(p.ogeler.length, id).toBeGreaterThan(0)
        if (p.tip === 'sayilar') expect(p.ogeler.length, id).toBeGreaterThan(0)
        if (p.tip === 'etiketler') expect(p.ogeler.length, id).toBeGreaterThan(0)
        if (p.tip === 'vafel') expect(p.toplam, id).toBeGreaterThan(0)
      }
  })

  it('vurgu işareti çiftler hâlinde — yarım kalan `**` yok', () => {
    for (const [id, o] of ornekler)
      for (const k of o.kartlar)
        expect((k.baslik.match(/\*\*/g) ?? []).length % 2, `${id}: ${k.baslik}`).toBe(0)
  })
})

describe('şablonlar birbirinin boyası DEĞİL', () => {
  // ⚠ ⚠ **KULLANICININ "REZALET" DEDİĞİ ŞEYİN TESTİ.** Yedi aile üretilmişti ve ızgaraya
  // bakınca yedi TASARIM değil tek tasarımın yedi BOYASI görünmüştü. Aynı tipografi
  // reçetesini paylaşan iki şablon, katalogda iki satır ama tasarımda bir tanedir.
  it('her şablon KENDİ tipografi reçetesini taşıyor', () => {
    const imzalar = ornekler.map(([id, o]) => {
      const t = o.tipografi ?? VARSAYILAN_TIPO
      return [
        id,
        `${t.baslikGenislik}/${t.baslikAgirlik}/${t.baslikPayi}/${t.ustGenislik}`,
      ] as const
    })
    expect(new Set(imzalar.map(([, i]) => i)).size).toBe(imzalar.length)
  })

  it('genişlik ekseni gerçekten AÇILMIŞ — hepsi aynı yerde değil', () => {
    const g = ornekler.map(([, o]) => (o.tipografi ?? VARSAYILAN_TIPO).baslikGenislik)
    expect(Math.max(...g) - Math.min(...g)).toBeGreaterThanOrEqual(25)
  })

  it('yerleşim tek bir değerde toplanmamış', () => {
    expect(new Set(ornekler.map(([, o]) => o.yerlesim ?? 'ust')).size).toBeGreaterThanOrEqual(3)
  })

  it('şablon damga/token TAŞIMIYOR — Yasa 7', () => {
    for (const [id, o] of ornekler) {
      expect(o, id).not.toHaveProperty('stamp')
      expect(o, id).not.toHaveProperty('tokenCss')
      expect(o, id).not.toHaveProperty('fontCss')
    }
  })
})
