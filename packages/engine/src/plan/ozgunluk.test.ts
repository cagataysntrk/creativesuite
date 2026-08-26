// ÖZGÜNLÜK — eşik ÖLÇÜLDÜ, iddia da ölçülene dayanıyor (FAZ-19.12 · madde 6).
//
// ⚠ ⚠ **BU KAPI EŞİĞİN GERÇEKTEN ÖLÇÜLDÜĞÜNÜ DE SINIYOR.** Bu depoda tahminle yazılan
// eşikler defalarca yalanlandı (`TON_TAVANI` 26 yazıldı, ölçüm 38 dedi). Buradaki
// `0,23` 51 koşunun 1275 çiftinden geldi: 648 farklı-konu çiftinin en yükseği 0,222 ve
// eşik onun HEMEN ÜSTÜNDE. Aşağıdaki iddialar o iki sayıyı da koruyor — eşik sessizce
// oynatılırsa kapı kırmızı döner.
//
// ⚠ ⚠ **VE ALETİN KENDİSİ SINANIYOR.** "Tekrar yok" sonucu, benzerlik ölçüsünün BOZUK
// olmasından da gelebilir: her çifte 0 döndüren bir fonksiyon bütün üretimleri özgün
// ilan ederdi. O yüzden birebir aynı metnin 1,0, ortak kelimesi olmayan metnin 0
// verdiği ayrıca sınanıyor.

import { describe, expect, it } from 'vitest'
import {
  BENZERLIK_TAVANI,
  benzerlik,
  katla,
  ozgunlukDenetle,
  type GecmisUretim,
} from './ozgunluk.js'

const GECMIS: readonly GecmisUretim[] = [
  {
    runId: 'run_a',
    konu: 'ölçülebilir bir geri kazanım hattı kurmanın dört adımı',
    metin: 'Boşluklar artık sorun değil. Eksik veri artık düzenli. Veri karara dönüşür.',
  },
  {
    runId: 'run_b',
    konu: 'vardiya başına sayaç ile hat toplamı ölçümü',
    metin: 'Sayaç vardiyada okunuyor. Hat toplamı akşam çıkıyor. Fark nerede kayboluyor.',
  },
]

describe('özgünlük', () => {
  // ── ALET SINAMASI: ölçü gerçekten ölçüyor mu ─────────────────────────────
  it('benzerlik ölçüsü uçlarda doğru — bedava yeşil değil', () => {
    const m = 'ölçüm alışkanlığa dönüşünce hat kendini düzeltir'
    expect(benzerlik(m, m), 'birebir aynı metin 1,0 vermeli').toBe(1)
    expect(
      benzerlik('kırmızı otomobil hızlandı', 'muzlu tatlı pişiyor'),
      'ortak kelimesi olmayan metin 0 vermeli'
    ).toBe(0)
    expect(benzerlik('', 'herhangi bir metin')).toBe(0)
  })

  it('Türkçe katlama YERELE duyarlı — I/İ tuzağı', () => {
    // ⚠ Yerelsiz `toLowerCase` `ÖLÇÜM`ü `ölçüm` yapar ama `IŞIK`ı `ışık` YAPMAZ
    // (`i̇şık` üretir). O tek harf, tekrarı görünmez kılardı.
    expect(katla('IŞIK ÖLÇÜMÜ')).toBe(katla('ışık ölçümü'))
    expect(katla('İSTANBUL')).toBe(katla('istanbul'))
  })

  // ── EŞİK: ölçülen sayılar korunuyor ──────────────────────────────────────
  it('eşik ÖLÇÜLEN değerde — 0,23', () => {
    expect(
      BENZERLIK_TAVANI,
      '648 farklı-konu çiftinin en yükseği 0,222; eşik onun hemen üstünde ve ' +
        '0,20 ilk yanlış reddi getiriyor'
    ).toBe(0.23)
    expect(BENZERLIK_TAVANI, 'gözlenen farklı-konu tavanının ÜSTÜNDE olmalı').toBeGreaterThan(0.222)
  })

  // ── KURAL 1: konu kimliği, eşiksiz ───────────────────────────────────────
  it('aynı konu TEKRARDIR — benzerlik sayısına bakılmadan', () => {
    const r = ozgunlukDenetle(
      {
        konu: 'Ölçülebilir bir geri kazanım hattı kurmanın dört adımı',
        // ⚠ Metin TAMAMEN farklı; yine de reddedilmeli. Aynı konuyu yeniden
        // yazmak, yeni bir şey söylemek değildir.
        metin: 'Bambaşka cümleler burada duruyor ve hiçbiri örtüşmüyor.',
      },
      GECMIS
    )
    expect(r.ozgun).toBe(false)
    if (!r.ozgun) {
      expect(r.kural).toBe('konu-tekrari')
      expect(r.esleseN).toBe('run_a')
    }
  })

  // ── KURAL 2: metin benzerliği, konu farklıyken ───────────────────────────
  it('konu farklı ama METİN aynıysa yine reddediliyor', () => {
    const r = ozgunlukDenetle(
      {
        konu: 'bambaşka yazılmış bir konu satırı',
        metin: 'Boşluklar artık sorun değil. Eksik veri artık düzenli. Veri karara dönüşür.',
      },
      GECMIS
    )
    expect(r.ozgun, 'konuyu yeniden adlandırmak içeriği özgün yapmaz').toBe(false)
    if (!r.ozgun) {
      expect(r.kural).toBe('metin-benzerligi')
      expect(r.skor).toBeGreaterThanOrEqual(BENZERLIK_TAVANI)
    }
  })

  it('gerçekten YENİ üretim geçiyor', () => {
    expect(
      ozgunlukDenetle(
        {
          konu: 'geri kazanılmış polimerde nem oranının kalıba etkisi',
          metin: 'Nem kalıpta kabarcık bırakıyor. Kurutma süresi ölçülmeden ayarlanamıyor.',
        },
        GECMIS
      ).ozgun
    ).toBe(true)
  })

  it('geçmiş BOŞSA her üretim özgün', () => {
    expect(ozgunlukDenetle({ konu: 'herhangi', metin: 'herhangi bir metin' }, []).ozgun).toBe(true)
  })
})
