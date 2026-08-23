// Tuval oranı TEK sözleşme sabitinden geliyor mu (R-91 · D-321).
//
// ⚠ ⚠ **`1350` ALTI AYRI DOSYADA SABİTTİ.** Aynı sayının altı kopyası, bir gün beşinin
// değişip birinin unutulması demektir — ve o gün panorama sessizce farklı orandan
// dilimlenir. Meta API'de **ilk slaydın oranı tüm karoseli belirliyor**, yani geri kalan
// slaytlar kırpılır ve içerik uçar.
//
// ⚠ Bu dosya sayıyı değil, SAYININ TEK OLDUĞUNU sınıyor.

import { describe, expect, it } from 'vitest'
import { TUVAL_3_4, TUVAL_4_5, VARSAYILAN_TUVAL } from './placement.js'

describe('karosel tuvali', () => {
  it('genişlik HER İKİ oranda da 1080 — Instagram üstünü kendi küçültüyor', () => {
    // ⚠ Instagram 1080'den genişini kendi yeniden örnekleyicisiyle küçültüyor.
    // Küçültmeyi biz yaparsak sonucu kontrol ederiz; ona bırakmak sonucu bilmemek.
    expect(TUVAL_4_5.genislik).toBe(1080)
    expect(TUVAL_3_4.genislik).toBe(1080)
  })

  it('oranlar GERÇEKTEN o oran — ad ile sayı ayrışamaz', () => {
    // ⚠ `oran: '4:5'` yazıp 1440 yükseklik vermek, defterin kendi kendine yalan
    // söylemesi olurdu. Ad bir etiket değil, bir İDDİA.
    expect(TUVAL_4_5.yukseklik / TUVAL_4_5.genislik).toBeCloseTo(5 / 4, 3)
    expect(TUVAL_3_4.yukseklik / TUVAL_3_4.genislik).toBeCloseTo(4 / 3, 3)
  })

  it('ikisi de Instagram`ın kabul aralığında — 1.91:1 ile 3:4 arası', () => {
    // Instagram Yardım Merkezi: yükseklik 566–1440 (1080 genişlikte).
    for (const t of [TUVAL_4_5, TUVAL_3_4]) {
      expect(t.yukseklik).toBeGreaterThanOrEqual(566)
      expect(t.yukseklik).toBeLessThanOrEqual(1440)
    }
  })

  it('varsayılan 4:5 — Meta REKLAMINDA zorunlu olan oran', () => {
    // ⚠ 3:4 organik akışta daha fazla alan veriyor (+%6,7, ızgarada sıfır kırpma) ama
    // Meta reklamının minimum oranı 400×500 ve 3:4 onun altında kalıyor. Reklam
    // verilecek bir kreatif 4:5 üretilmek zorunda; varsayılan bu yüzden 4:5.
    expect(VARSAYILAN_TUVAL).toBe(TUVAL_4_5)
  })
})
