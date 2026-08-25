// KARŞILAŞTIRMA GERÇEKTEN KARŞILAŞTIRMALI — geometri iddiayı taşır (FAZ-19.7).
//
// ⚠ ⚠ **DENETİMİN EN SERT BULGUSU BUYDU ve veri onu doğruladı.** `karsilastirma`nın üç
// çubuğu **62 · 71 · 58** idi; yayılım (en büyük ÷ en küçük) yalnız **1,22×**. Denetim:
// *"üç bar neredeyse AYNI uzunlukta — 'karşılaştırma' hiçbir şey karşılaştırmıyor."*
//
// ⚠ Ve kart KENDİ CÜMLESİNİ yalanlıyordu: gövdesi *"Toplam biliniyordu; hangi vardiyada
// oluştuğu bilinmiyordu"* diyor, yani iddia vardiyalar arası FARK. Üç eşit çubuk o farkı
// göstermek şöyle dursun, YOK olduğunu söylüyordu. Değerler 34 · 71 · 58'e çekildi:
// yayılım **2,09×** ve en yüksek vardiya en düşüğün iki katından fazla.
//
// ⚠ ⚠ **AYNI SINIF KUSUR ZATEN BİR KEZ YAKALANMIŞTI.** `kavis`in on üç kemerinin on üçü
// birebir aynı yükseklikteydi ve kart *"sapma görünür olmalı"* diyordu; o, kapıya
// bağlanmıştı. Burada bağlanmamıştı — **kural bir yerde vardı, ötekinde yoktu.**

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

/**
 * Bir çubuk panosunun karşılaştırma sayılabilmesi için en küçük yayılım.
 *
 * ⚠ 1,6 keyfî değil: ölçülen kusurlu hâl **1,22×** ve düzeltilmiş hâl **2,09×**. Eşik
 * ikisinin arasında ve düzeltilmiş hâle %31 pay bırakıyor; 1,22'ye ise %31 uzak, yani
 * kusur geri gelirse kapı kesin kırmızı döner. Daha yükseği gerçek verinin dar olabildiği
 * durumları haksız yere reddederdi — bir ölçüm bandı dar olabilir, ama o zaman o kart
 * çubuk panosu DEĞİL tek sayı taşımalıdır.
 */
const EN_AZ_YAYILIM = 1.6

describe('karşılaştırma farkı', () => {
  // ⚠ ⚠ **KURAL YALNIZ KARŞILAŞTIRMA ŞABLONUNA — ve bunu KENDİ KAPIM öğretti.** İlk sürüm
  // bütün çubuk panolarını tarıyordu ve `veri-hikayesi`yi kırmızıya çevirdi: çubukları
  // 58,9 · 71,2 · 77,4 (yıllık hacim), yayılım 1,33×. Ama o bir ZAMAN SERİSİ — yayılımı
  // VERİNİN kendisi, tasarımcının tercihi değil. Onu "daha farklı" yapmak veriyi
  // ÇARPITMAK olurdu ve bu depo tam olarak bunu yasaklıyor (Yasa 8, R-32).
  //
  // Ayrım şu: bir zaman serisi ne ise onu gösterir; bir KARŞILAŞTIRMA ise iki durumu
  // yan yana koymak için VAR. İkincisinde fark yoksa kartın var olma sebebi yoktur.
  const KARSILASTIRAN = new Set(['karsilastirma'])
  const cubuklu: [string, readonly { readonly deger: number }[]][] = []
  for (const [id, o] of Object.entries(ORNEKLER))
    if (KARSILASTIRAN.has(id))
      for (const k of o.kartlar)
        if (k.panel?.tip === 'cubuklar') cubuklu.push([id, k.panel.satirlar])

  // ⚠ Kapı boşa dönmesin: hiç çubuk panosu yoksa aşağıdaki iddia hiç koşmaz.
  it('çubuk panosu taşıyan kart VAR', () => {
    expect(cubuklu.length, 'hiç çubuk panosu bulunamadı — kapı boşa dönüyor').toBeGreaterThan(0)
  })

  for (const [id, satirlar] of cubuklu) {
    it(`${id} · çubuklar GERÇEKTEN farklı (yayılım ≥${String(EN_AZ_YAYILIM)}×)`, () => {
      const degerler = satirlar.map((s) => s.deger).filter((d) => d > 0)
      expect(degerler.length, `${id}: çubuk yok`).toBeGreaterThan(1)
      const yayilim = Math.max(...degerler) / Math.min(...degerler)
      expect(
        yayilim,
        `${id}: çubuklar ${degerler.join(' · ')} — yayılım ${yayilim.toFixed(2)}×; ` +
          'eşit uzunlukta çubuklar bir KARŞILAŞTIRMA değil bir LİSTEDİR'
      ).toBeGreaterThanOrEqual(EN_AZ_YAYILIM)
    })
  }
})
