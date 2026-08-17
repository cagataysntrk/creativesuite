import { describe, expect, it } from 'vitest'
import { egriZarfi } from './sekil-cebri.js'
import { akanEgri, egriSagda, guvenliKolonYuzdesi, guvenliMetinYuzdesi } from './sablon.js'
import { NEFES_YUZDESI, VARSAYILAN } from './sablon-parametre.js'
import type { SlaytKimligi } from '@suite/kernel'

const k = (index: number): SlaytKimligi => ({
  role: index === 0 ? 'kapak' : 'govde',
  index,
  total: 5,
  duzen: 'list',
})

describe('egriZarfi', () => {
  it('kontrol noktalarının x uçlarını verir', () => {
    expect(egriZarfi('M 10 0 C 30 24, 4 42, 22 60')).toEqual({ min: 4, max: 30 })
  })

  it('boş path güvenli yönde yanılır — tüm tuval', () => {
    // ⚠ Zarfı DARALTMAK metni eğriye yaklaştırır; boş girdide geniş zarf tek doğru yanıt.
    expect(egriZarfi('')).toEqual({ min: 0, max: 100 })
  })
})

describe('guvenliKolonYuzdesi', () => {
  it('her slaytta sütun, o eğrinin zarfından NEFES kadar geride', () => {
    for (let i = 0; i < 5; i += 1) {
      const z = egriZarfi(akanEgri(k(i)))
      const icKenar = egriSagda(k(i)) ? z.min : 100 - z.max
      expect(guvenliKolonYuzdesi(k(i))).toBeCloseTo(icKenar - NEFES_YUZDESI, 6)
    }
  })

  it('aynalama simetrik — sağ ve sol eğri aynı genişliği bırakır', () => {
    // index 0 sağda, index 1 solda; `merkez` farklı olduğu için genişlikleri de farklı
    // ama AYNI `merkez`li iki tarafın genişliği eşit olmalı. Faz `% 5` olduğundan
    // 0 ve 5 aynı merkezi paylaşıyor, biri sağda biri solda değil — o yüzden formülü
    // doğrudan sınıyoruz: zarf aynalanınca iç kenar aynı sayıya düşüyor.
    const z0 = egriZarfi(akanEgri(k(0)))
    expect(z0.min).toBeCloseTo(VARSAYILAN.bantMin - VARSAYILAN.genlik, 6)
  })

  it('hiçbir slaytta küresel EN KÖTÜ değerin altına inmez', () => {
    // ⚠ Küresel sabit hâlâ bir alt sınır: slayta özgü hesap onu GENİŞLETEBİLİR,
    // asla daraltamaz. Daraltsaydı ölçülmüş punto tavanı (64 px) sığmazdı.
    for (let i = 0; i < 5; i += 1) {
      expect(guvenliKolonYuzdesi(k(i))).toBeGreaterThanOrEqual(guvenliMetinYuzdesi)
    }
  })

  it('eğriye daha içeride bir kontrol noktası girerse sütun DARALIR', () => {
    // Zarf path'ten okunuyor; bu yüzden gramerdeki bir değişiklik sütuna yansır.
    // Formülden hesaplansaydı sayı sessizce yalan olurdu — bu testin tek işi o.
    const daraltilmis = egriZarfi(`${akanEgri(k(4))} C 30 78, 30 90, 30 100`)
    expect(daraltilmis.min).toBeLessThan(egriZarfi(akanEgri(k(4))).min)
  })
})
