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
  // ── EŞLEŞME 1: kemer bandı ↔ vafel panosu ──────────────────────────────────
  const kemerCifti: [string, number, number][] = []
  for (const [id, o] of Object.entries(ORNEKLER)) {
    const b = o.bant
    if (b.tip !== 'kemer') continue
    for (const k of o.kartlar) {
      if (k.panel?.tip !== 'vafel') continue
      kemerCifti.push([id, b.sayi, k.panel.dolu])
    }
  }

  // ── EŞLEŞME 2: ok güzergâhı ↔ liste maddeleri ──────────────────────────────
  //
  // ⚠ ⚠ **BU EŞLEŞME, BİRİNCİSİ ÖZNESİZ KALINCA YAZILDI.** Depo sahibi `kavis`in kemer
  // bandı için *"aşırı HTML/CSS duruyor, çok çirkin, kaldır"* dedi; bant kalkınca
  // katalogda tek bir kemer+vafel çifti kalmadı ve kapının kendi *"boşa dönmesin"*
  // koruması HAKLI OLARAK kırmızı döndü. Test silinmedi, YÖNLENDİRİLDİ: kural aynı
  // kural (**bir şablon bir sayıyı iki yerde gösteriyorsa ikisi aynı sayıyı göstermeli**),
  // yalnız bugünkü öznesi başka.
  //
  // ⚠ `dizin`de güzergâh maddeleri birbirine bağlıyor: her ok bir maddeden SONRAKİNE
  // gidiyor, dolayısıyla ok sayısı madde sayısının BİR EKSİĞİ olmak zorunda. Beşinci bir
  // madde eklenip dördüncü ok unutulursa dizin yarım kalır ve bunu hiçbir piksel ölçümü
  // söylemez — rota "bitmiş" görünür.
  const okCifti: [string, number, number][] = []
  for (const [id, o] of Object.entries(ORNEKLER)) {
    const b = o.bant
    if (b.tip !== 'ok') continue
    const liste = o.kartlar.map((k) => k.panel).find((pn) => pn?.tip === 'liste')
    if (liste?.tip !== 'liste') continue
    okCifti.push([id, b.oklar.length, liste.ogeler.length])
  }

  // ⚠ Kapı boşa dönmesin: hiç çift yoksa aşağıdaki iddialar hiç koşmaz ve yeşil hiçbir
  // şey kanıtlamaz. Bu koruma bu fazda GERÇEKTEN işe yaradı (yukarıdaki not).
  it('taşıyıcısı veriye bağlı deste VAR', () => {
    expect(
      [...kemerCifti, ...okCifti].map(([id]) => id).join(', '),
      'hiç taşıyıcı-veri çifti yok — kapı boşa dönüyor'
    ).not.toBe('')
  })

  for (const [id, kemer, dolu] of kemerCifti) {
    it(`${id} · kemer sayısı ile dolu vafel karesi AYNI`, () => {
      expect(
        dolu,
        `${id}: bant ${String(kemer)} kemer çiziyor ama vafel ${String(dolu)} kare ` +
          'dolduruyor — taşıyıcı ile pano aynı adımı sayıyorsa aynı sayıyı göstermeli'
      ).toBe(kemer)
    })
  }

  for (const [id, ok, madde] of okCifti) {
    it(`${id} · ok sayısı madde sayısının BİR EKSİĞİ`, () => {
      expect(
        ok,
        `${id}: liste ${String(madde)} madde taşıyor ama güzergâh ${String(ok)} ok ` +
          'çiziyor — her ok bir maddeden sonrakine gider, sayı ondan türer'
      ).toBe(madde - 1)
    })
  }
})
