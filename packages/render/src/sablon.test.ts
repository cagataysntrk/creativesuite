// Şablon gramerinin DEĞİŞMEZ İLİŞKİLERİ (§7.1 · FAZ-10.2b · D-254, D-255).
//
// **Bu dosya neden yazıldı:** eğri bandı %44–56'dan %69–78'e taşındı ve `h1` puntosu
// 76'dan 64'e indi — **1359 testin hiçbiri kırılmadı**. Yani grameri istediğim gibi
// bozabilirdim ve hiçbir kapı bunu söylemezdi. Sayılar değişebilir (tasarım kararıdır);
// ama aralarındaki İLİŞKİ değişemez, çünkü kompozisyonun doğruluğu ondan geliyor.
//
// Burada render YOK: bunlar saf fonksiyonlar ve saf ilişkiler. Piksel tarafını
// `tasarim` kapısı ölçecek (FAZ-10.3); bu dosya ondan önce, daha ucuz ve daha kesin.

import { describe, expect, it } from 'vitest'
import type { SlaytKimligi } from '@suite/kernel'
import { LAYOUTS } from './layout/adlar.js'
import {
  SINIR_MIN,
  SINIR_MAX,
  akanEgri,
  alanRolleri,
  egriSagda,
  guvenliMetinYuzdesi,
  hayaletRakam,
  navIsareti,
  duzenBicimi,
} from './sablon.js'

const k = (index: number, total = 5, role: SlaytKimligi['role'] = 'govde'): SlaytKimligi => ({
  role,
  index,
  total,
})

/** Path dizesinden tüm x koordinatlarını çıkarır — `M x y C x y, x y, x y` biçimi. */
const xler = (d: string): number[] => {
  const sayilar = d.match(/-?\d+(\.\d+)?/g) ?? []
  return sayilar.map(Number).filter((_, i) => i % 2 === 0)
}

describe('şablon grameri — değişmez ilişkiler', () => {
  it('güvenli metin sütunu, eğrinin en içerideki kontrol noktasının DIŞINDA kalır', () => {
    // Kübik Bézier kontrol noktalarının dışbükey zarfını aşmaz; en içeridekiler
    // `merkez - genlik`. Sütun oradan geride durmazsa metin eğriye girer — bu, iki kez
    // düzeltilip iki kez geri gelen kusurun ta kendisi.
    const enIceri = SINIR_MIN - 5
    expect(guvenliMetinYuzdesi).toBeLessThan(enIceri)
  })

  it('hiçbir slaytta eğri, metin sütununa girmez', () => {
    for (let i = 0; i < 10; i += 1) {
      const d = akanEgri(k(i))
      const sagda = egriSagda(k(i))
      // Metin sütunu her zaman dolgunun KARŞI tarafında ve genişliği
      // `guvenliMetinYuzdesi`. Sağ dolguda sütun solda (0..G), sol dolguda sağda (100-G..100).
      for (const x of xler(d)) {
        if (sagda) expect(x).toBeGreaterThan(guvenliMetinYuzdesi)
        else expect(x).toBeLessThan(100 - guvenliMetinYuzdesi)
      }
    }
  })

  it('eğri, dolgu tarafına göre AYNALANIR', () => {
    // Aynalanmasaydı sol dolgu geniş tarafı kaplar ve metne dar taraf kalırdı.
    const sagX = xler(akanEgri(k(0))) // index 0 → sagda
    const solX = xler(akanEgri(k(1))) // index 1 → solda
    expect(egriSagda(k(0))).toBe(true)
    expect(egriSagda(k(1))).toBe(false)
    // Faz farkı var, ama iki taraf da kendi yarısında kalıyor.
    expect(Math.min(...sagX)).toBeGreaterThan(50)
    expect(Math.max(...solX)).toBeLessThan(50)
  })

  it('motif, üstünde durduğu alanla AYNI renk olamaz', () => {
    // Hayalet rakam `karsiAlan`ın (dolgu) üstünde duruyor. Renkleri eşitse rakam
    // görünmez olur — dört rolün ÜÇÜNDE tam bu oluyordu ve bant ortadayken kusur
    // gizliydi, çünkü rakam iki alana birden taşıyordu.
    for (const rol of ['kapak', 'govde', 'kapanis', 'tek'] as const) {
      for (let i = 0; i < 4; i += 1) {
        const r = alanRolleri(k(i, 5, rol))
        expect(r.motif).not.toBe(r.karsiAlan)
      }
    }
  })

  it('bant sınırları tutarlı ve tuval içinde', () => {
    expect(SINIR_MIN).toBeLessThan(SINIR_MAX)
    // En dıştaki kontrol noktası `SINIR_MAX + genlik*1.4`; tuvali aşarsa eğri düzleşir.
    expect(SINIR_MAX + 7).toBeLessThanOrEqual(100)
  })

  it('tek slaytlık postta hayalet rakam ve navigasyon YOK', () => {
    // Tek karede "1" basmak bir dizi olduğunu ima eder; olmayan slayta işaret etmek de.
    expect(hayaletRakam(k(0, 1, 'tek'))).toBeNull()
    expect(navIsareti(k(0, 1, 'tek'))).toBeNull()
  })

  it('hiçbir düzen ölçülen punto TAVANINI aşamaz', () => {
    // 64 px, en uzun Türkçe kelimenin güvenli sütuna sığdığı en büyük değer
    // (`docs/referans/tip-olcegi.md`). Bir düzenin "daha çarpıcı" olsun diye 72'ye
    // çıkması, metni doğrudan eğrinin içine sokar — ölçüm bir tercih değil, sınır.
    for (const d of LAYOUTS) expect(duzenBicimi(d).baslikPx).toBeLessThanOrEqual(64)
    expect(duzenBicimi(undefined).baslikPx).toBeLessThanOrEqual(64)
  })

  it('dört düzen BİRBİRİNDEN ayırt edilebilir', () => {
    // Aynı kompozisyonu veren iki düzen, seçim mantığını anlamsız yapar: `duzenSec`
    // doğru seçse bile çıktı aynı görünür ve fark ölçülemez.
    const bicimler = LAYOUTS.map((d) => JSON.stringify(duzenBicimi(d)))
    expect(new Set(bicimler).size).toBe(LAYOUTS.length)
  })

  it('tanımsız düzen `statement` gibi davranır — eski belgeler kırılmaz', () => {
    expect(duzenBicimi(undefined)).toEqual(duzenBicimi('statement'))
  })

  it('her düzenin gövde puntosu başlıktan KÜÇÜK', () => {
    // Hiyerarşi tersine dönerse gövde başlık gibi okunur ve slayt bir metin duvarına
    // dönüşür — kapak slaytında tam bu olmuştu.
    for (const d of LAYOUTS) {
      const b = duzenBicimi(d)
      expect(b.govdePx).toBeLessThan(b.baslikPx)
    }
  })

  it('son slaytta navigasyon YÖN DEĞİŞTİRİR', () => {
    expect(navIsareti(k(3, 5))).toBe('kaydır ››')
    expect(navIsareti(k(4, 5))).toBe('‹‹ başa')
  })
})
