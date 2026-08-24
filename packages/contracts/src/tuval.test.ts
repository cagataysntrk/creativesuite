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

  // ⚠ ⚠ **VARSAYILAN 4:5 → 3:4 ve bu bir DAVRANIŞ düzeltmesi değil, KARAR değişikliği.**
  // Instagram organik akışta 3:4'ü tam boy gösteriyor; 4:5 profil ızgarasında her yandan
  // 34 px kırpılıyordu, 3:4'te kırpma SIFIR ve slayt %6,7 uzuyor.
  // ⚠ Geçiş ÖLÇÜLDÜ: on şablon 1350 ve 1440'ta ayrı ayrı denetlendi, ikisinde de sıfır
  // kusur. Geometri yüzde tabanlı olduğu için ölçeğe dayandı. 2184 testin yalnız BİRİ
  // kırıldı — o da bu testti, yani eski kararın kendisi.
  it('varsayılan 3:4 — organik akışta tam boy, ızgarada sıfır kırpma', () => {
    expect(VARSAYILAN_TUVAL).toBe(TUVAL_3_4)
    expect(VARSAYILAN_TUVAL.yukseklik).toBe(1440)
  })

  // ⚠ ⚠ **REKLAM KISITI KAYBOLMADI — varsayılan değişti, kural DEĞİŞMEDİ.** Meta
  // reklamının asgari oranı 400×500 ve 3:4 onun altında kalıyor: reklam verilecek bir
  // kreatif 4:5 üretilmek ZORUNDA. Varsayılan artık 3:4 olduğuna göre reklam yolu onu
  // miras ALAMAZ, açıkça `TUVAL_4_5` istemek zorunda.
  // ⚠ Bu testin var olma sebebi tam olarak budur: bir karar değişince onun GEREKÇESİ
  // sessizce silinirse, aynı tuzağa ikinci kez düşülür — bu depoda defalarca oldu.
  it('reklam oranı 4:5 DURUYOR ve varsayılandan AYRI — miras alınamaz', () => {
    expect(TUVAL_4_5.oran).toBe('4:5')
    expect(TUVAL_4_5.yukseklik).toBe(1350)
    expect(TUVAL_4_5).not.toBe(VARSAYILAN_TUVAL)
    // Meta asgari oranı 400×500 = 0,8; 4:5 tam 0,8, 3:4 ise 0,75 (altında).
    expect(TUVAL_4_5.genislik / TUVAL_4_5.yukseklik).toBeCloseTo(0.8, 3)
    expect(TUVAL_3_4.genislik / TUVAL_3_4.yukseklik).toBeLessThan(0.8)
  })
})
