// TAŞIYICI VERİYİ TAŞIR — geometri sayıyı doğrular (FAZ-19.7).
//
// ⚠ ⚠ **DENETİM: *"Sürekliliği VERİYE bağla — `kavis`te 13 kemer ↔ 13 vafel karesi
// hizalansın. Geometri iddianın KANITI olsun."*** Ölçüldü ve hizalama BUGÜN DURUYOR:
// `bant.kemer.sayi = 13` ve `panel.vafel.dolu = 13` (yirmi karenin on üçü). Ama hiçbir şey
// onu korumuyordu — biri değişirse öteki sessizce yalan söylerdi.
//
// ⚠ Bu, `veri-egrisi` ve `sayilan-iddia` kapılarıyla aynı aileden: **bir şablon bir sayı
// gösteriyorsa, o sayıyı gösteren ÖTEKİ öge de aynı sayıyı göstermek zorunda.** Orada
// tipografi ile geometri, burada taşıyıcı ile pano.
//
// ⚠ ⚠ **KAPSAM KENDİLİĞİNDEN DAR ve bu bilinçli.** Kural yalnız HEM kemer bandı HEM vafel
// panosu taşıyan desteye uygulanıyor; bugün bu yalnız `kavis`. Bu depoda kuralı gereğinden
// geniş yazmak altı kez kapıya takıldı — yedincisi olmasın diye kapsam veriden türüyor,
// varsayımdan değil.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

describe('taşıyıcı verisi', () => {
  const ciftli: [string, number, number][] = []
  for (const [id, o] of Object.entries(ORNEKLER)) {
    const b = o.bant
    if (b.tip !== 'kemer') continue
    for (const k of o.kartlar) {
      if (k.panel?.tip !== 'vafel') continue
      ciftli.push([id, b.sayi, k.panel.dolu])
    }
  }

  // ⚠ Kapı boşa dönmesin: hiç çift yoksa aşağıdaki iddia hiç koşmaz ve yeşil hiçbir şey
  // kanıtlamaz. Bugün tam bir çift var (`kavis`).
  it('kemer bandı VE vafel panosu taşıyan deste VAR', () => {
    expect(
      ciftli.map(([id]) => id).join(', '),
      'hiç kemer+vafel çifti yok — kapı boşa dönüyor'
    ).not.toBe('')
  })

  for (const [id, kemer, dolu] of ciftli) {
    it(`${id} · kemer sayısı ile dolu vafel karesi AYNI`, () => {
      expect(
        dolu,
        `${id}: bant ${String(kemer)} kemer çiziyor ama vafel ${String(dolu)} kare ` +
          'dolduruyor — taşıyıcı ile pano aynı adımı sayıyorsa aynı sayıyı göstermeli'
      ).toBe(kemer)
    })
  }
})
