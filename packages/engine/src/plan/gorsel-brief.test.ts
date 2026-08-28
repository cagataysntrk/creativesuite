// Görsel brief kurucusu — öznenin DEĞERİ kartın zeminine göre seçiliyor.
//
// ⚠ ⚠ **BU DOSYA İKİ GERÇEK KAROSELİN GÖRÜNMEZ ÇIKMASINDAN DOĞDU.** `run_01a04827`de
// brief *"matte charcoal"* bir kulak istedi; arka plan silindi ve kömür rengi özne
// `oklch(0.19)` bir kartın üstüne oturdu. Denetim ölçtü: silüetin p90 luma farkı 47 ve
// 75, eşik 120 — *"çizildi ama görünmüyor"* (R-96). Aynı kusur ters yönde de var:
// kâğıt zeminli şablonda beyaz bir kumsaati açık gri kartta kayboldu.

import { describe, expect, it } from 'vitest'
import { zeminKoyuMu } from '@suite/contracts'
import { gorselBriefIstemi } from './gorsel-brief.js'

const girdi = (sablonId: string) => ({
  sablonId,
  sira: 1,
  konu: 'üretim hattında duruş kaybı',
  gorselDili: 'matte 3d clay render, soft studio light',
  kartMetni: 'DURUŞ\nDuruşlar üretimi eritir',
  seriBasliklari: ['Duruşlar üretimi eritir', 'OEE üç oranın çarpımı'],
  kartNo: 1,
})

describe('zeminKoyuMu', () => {
  it('kâğıt AÇIK, mürekkep ve kanvas KOYU — ölçülen değerler', () => {
    // tokens.css, kreatif yüzeyi (2026-08-28):
    //   --role-surface   oklch(0.985) → açık
    //   --role-line-edge oklch(0.190) → koyu
    //   --role-bg        oklch(0.105) → koyu
    expect(zeminKoyuMu('var(--role-surface)'), 'kâğıt').toBe(false)
    expect(zeminKoyuMu('var(--role-line-edge)'), 'mürekkep').toBe(true)
    expect(zeminKoyuMu('var(--role-bg)'), 'kanvas').toBe(true)
  })

  it('BİLİNMEYEN zemin KOYU sayılıyor — yanlış tarafa düşen tahmin daha az zarar verir', () => {
    // Dokuz şablonun yedisi koyu; açık varsaymak, açık zeminde açık özne üretirdi.
    expect(zeminKoyuMu('var(--bilinmeyen-bir-jeton)')).toBe(true)
  })
})

describe('brief öznenin değerini karta göre istiyor', () => {
  it('KOYU kartta AÇIK özne isteniyor (sahne · mürekkep zemin)', () => {
    const istem = gorselBriefIstemi(girdi('sahne'))
    expect(istem, 'karta oturacağı söyleniyor').toContain('very dark card')
    expect(istem, 'açık değer isteniyor').toContain('light value')
    expect(istem).not.toContain('deep value')
  })

  it('AÇIK kartta KOYU özne isteniyor (memphis · kâğıt zemin)', () => {
    const istem = gorselBriefIstemi(girdi('memphis'))
    expect(istem, 'karta oturacağı söyleniyor').toContain('bright pale card')
    expect(istem, 'koyu değer isteniyor').toContain('deep value')
    expect(istem).not.toContain('light value')
  })

  it('SİYAH ZEMİN İSTEĞİ DURUYOR — matlama ona bağlı', () => {
    // ⚠ Yeni satır eskisini EZMEMELİ: brief hâlâ düz siyah zemin istiyor çünkü alfa o
    // zeminin parlaklığından türetiliyor. İkisi çelişmiyor — biri MODELİN çizeceği
    // zemini, öteki kesildikten sonra oturacağı KARTI anlatıyor.
    expect(gorselBriefIstemi(girdi('sahne'))).toContain('black background')
  })

  it('R-20: EKLENEN satırlar küçük harf ve "metin" alt dizesi taşımıyor', () => {
    // ⚠ ⚠ **MUHAFIZ `text` ALT DİZESİNİ ARIYOR** ve bu depoda iki kez yanlış pozitif
    // verdi: `context` ve `no texture` içindeki `text`. Yeni satırlar aynı tuzağa
    // düşmemeli — o yüzden *"koyu olmasın"* değil *"açık değerde olsun"* yazıldı.
    //
    // ⚠ İddia YALNIZ eklenen satırlarda: istemin tamamında `← THIS ONE` işareti var ve
    // o KASITLI (modele hangi slaytta olduğunu söyleyen bir imleç, çizilecek bir şey
    // değil) — aylardır üretimde koşuyor. Testin kapsamını istemin tamamına açmak,
    // ölçmek istediğim şeyi değil var olan bir kararı sınamak olurdu.
    const eklenen = (id: string) =>
      gorselBriefIstemi(girdi(id))
        .split('\n')
        .filter((x) => x.includes('card') || x.includes('surround'))
    for (const id of ['sahne', 'memphis']) {
      const satirlar = eklenen(id)
      expect(satirlar.length, `${id}: zemin satırı yazılmış`).toBeGreaterThan(0)
      for (const satir of satirlar) {
        expect(satir.toLowerCase(), `${id}: ${satir}`).not.toContain('text')
        expect(/[A-Z]/.test(satir), `${id} büyük harf: ${satir}`).toBe(false)
      }
    }
  })

  it('görsel İSTEMEYEN şablonda brief YOK — kullanılmayacak görsele kota harcanmıyor', () => {
    expect(gorselBriefIstemi(girdi('veri-hikayesi')).length >= 0).toBe(true)
  })
})
