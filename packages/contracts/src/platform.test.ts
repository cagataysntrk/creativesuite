// PLATFORM SINIRLARI — araştırılan sayılar korunuyor (FAZ-19.12 · madde 3).
//
// ⚠ ⚠ **BU KAPI SAYILARI KORUYOR, DAVRANIŞI DEĞİL.** Sınırlar platformların kendi
// belgelerinden geliyor ve bir gün değişecekler. Değiştiklerinde bu kapı kırmızı dönsün
// istiyoruz — sessizce kaymış bir tavan, yayın anında reddedilen bir gönderi demek ve o
// an dört görsel ile bir insan onayı çoktan harcanmış olur (R-90'ın JPEG dersi).
//
// ⚠ ⚠ **VE ASIL SINAMA: UYARI ile HATA ayrılıyor mu.** İkisini aynı kovaya koymak, ya
// gereksiz ret ya da görmezden gelinen bir tasarım kusuru üretir. `X`in 280'i bir HATA
// eşiği; Instagram'ın ~125'i bir TASARIM eşiği.

import { describe, expect, it } from 'vitest'
import {
  PLATFORMLAR,
  kusurEngelliyorMu,
  platformBul,
  platformDenetle,
  type PlatformId,
} from './platform.js'

const bul = (id: PlatformId) => {
  const p = platformBul(id)
  expect(p, `${id} tanımlı olmalı`).not.toBeNull()
  return p as NonNullable<ReturnType<typeof platformBul>>
}

describe('platform sınırları', () => {
  it('dört platform tanımlı ve her biri kaynağını taşıyor', () => {
    expect(PLATFORMLAR.map((p) => p.id)).toStrictEqual(['instagram', 'facebook', 'linkedin', 'x'])
    for (const p of PLATFORMLAR) {
      expect(
        p.kaynak,
        `${p.id}: sınır nereden geldi yazılmalı — iddia değil izlenebilirlik`
      ).not.toBe('')
      expect(p.katlanmaOncesi, `${p.id}: katlanma noktası tavanı aşamaz`).toBeLessThanOrEqual(
        p.metinTavani
      )
    }
  })

  it('araştırılan sayılar YERİNDE', () => {
    expect(bul('instagram').metinTavani, 'Instagram açıklama sınırı').toBe(2200)
    expect(bul('instagram').katlanmaOncesi, 'akışta görünen kısım').toBe(125)
    expect(bul('instagram').karoselTavani, 'karosel slayt tavanı').toBe(20)
    expect(bul('linkedin').metinTavani).toBe(3000)
    expect(
      bul('x').metinTavani,
      "X'in 25.000'i Premium'a bağlı; abonesiz hesapta 281 karakter REDDEDİLİR"
    ).toBe(280)
    expect(bul('x').karoselTavani, "X'te görsel tavanı").toBe(4)
  })

  it('bilinmeyen platform `null` — sessizce varsayılana düşmüyor', () => {
    expect(platformBul('tiktok')).toBeNull()
    expect(platformBul('')).toBeNull()
  })

  // ── HATA: gönderi reddedilir ─────────────────────────────────────────────
  it('tavanı aşan metin ENGELLİYOR', () => {
    const k = platformDenetle('a'.repeat(281), 4, bul('x'))
    const engel = k.filter(kusurEngelliyorMu)
    expect(engel.map((x) => x.tur)).toContain('metin-tavani-asildi')
  })

  it('karosel tavanını aşan slayt ENGELLİYOR', () => {
    const k = platformDenetle('Kısa bir kanca.', 6, bul('x'))
    expect(k.filter(kusurEngelliyorMu).map((x) => x.tur)).toContain('karosel-tavani-asildi')
    // ⚠ Aynı slayt sayısı Instagram'da SORUN DEĞİL: tavan platforma özgü ve tek bir
    // sayıya indirgemek dört platformun üçünü yanlış kısıtlardı.
    expect(platformDenetle('Kısa bir kanca.', 6, bul('instagram'))).toStrictEqual([])
  })

  it('boş metin ENGELLİYOR', () => {
    expect(platformDenetle('   ', 4, bul('instagram'))).toStrictEqual([{ tur: 'metin-bos' }])
  })

  // ── UYARI: gönderi geçerli ama kanca görünmüyor ──────────────────────────
  it('katlanmayı aşan kanca UYARI — ret DEĞİL', () => {
    const uzunKanca =
      'Bu ilk cümle bilerek çok uzun tutuldu ve akışta görünen kısmın ' +
      'ötesine taşıyor, yani okuyucu devamı linkine basmadan kancayı göremiyor demektir.'
    const k = platformDenetle(uzunKanca, 4, bul('instagram'))
    expect(k.map((x) => x.tur)).toContain('kanca-katlanmanin-otesinde')
    expect(
      k.filter(kusurEngelliyorMu),
      'metin geçerli — yalnız ilk cümlesi akışta görünmüyor'
    ).toStrictEqual([])
  })

  it('kısa kanca uyarı ÜRETMİYOR — alet gürültü yapmıyor', () => {
    expect(platformDenetle('Ölçmediğin şeyi iyileştiremezsin.', 4, bul('instagram'))).toStrictEqual(
      []
    )
  })

  // ── ALET SINAMASI ────────────────────────────────────────────────────────
  it('uzunluk KOD NOKTASI sayıyor — `length` değil', () => {
    // ⚠ Emoji UTF-16'da iki birim; `length` ile ölçmek metni olduğundan uzun sayar ve
    // geçerli bir gönderiyi reddederdi.
    const emojili = '🙂'.repeat(200) // length 400, kod noktası 200
    expect(emojili.length, 'JS `length` iki katını görüyor').toBe(400)
    expect(
      platformDenetle(emojili, 4, bul('x')).filter((x) => x.tur === 'metin-tavani-asildi'),
      '200 kod noktası X tavanının (280) altında — reddedilmemeli'
    ).toStrictEqual([])
  })
})
