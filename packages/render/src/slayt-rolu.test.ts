// SLAYDIN BİR ROLÜ VAR — art arda iki kart aynı kompozisyonu kuramaz (FAZ-19.7).
//
// ⚠ ⚠ **DENETİMİN "SETİN EN BÜYÜK HASTALIĞI" DEDİĞİ ŞEY BUYDU ve ölçüm onu AŞTI.**
// Denetim *"45 slaydın 34'ünde metin bloğunun sol kenarı %6,0–6,7 arasında; bir karosel
// boyunca yatay kompozisyon kare genişliğinin %0,7'sinden az değişiyor — bu bir şablon
// değil bir FORM"* diyordu. Tarayıcıda ölçüldü: **36/45 slayt %5,7–5,9'da** ve üstelik
// **hepsinin üst kenarı %8,2'de.** Yani hastalık denetimin gördüğünden bir eksen DAHA
// derindi: yatayda tekdüzelik, dikeyde ise SEÇENEK BİLE YOKTU (`yerlesim` belge
// düzeyindeydi, bir destenin bütün kartları tek hizayı paylaşmak zorundaydı).
//
// ⚠ İki mekanizma kuruldu: `kolon`a üçüncü değer (`orta`) ve karta inen `dikey`. Sonra
// yedi destenin rolleri yazıldı ve dağılım **36/45 → 22/45**'e düştü (%80 → %49).
//
// ⚠ ⚠ **KURAL "ÜÇÜNÜ DE KULLAN" DEĞİL, "ART ARDA TEKRARLAMA".** Bu ayrım kasten:
// `sahne` · `editoryal` · `kavis` dört kartını `sag`/`sol` diye şaşırtıyor ve çizilince
// DOĞRU duruyorlar — üç konumu zorlayan bir kural o üçünü haksız yere kırardı. Ölçülen
// kusur çeşit azlığı değil TEKRARdı; kural da tam onu yasaklıyor. (Bu depoda kuralı
// gereğinden geniş yazmak dört kez kapıya takıldı; beşincisi olmasın diye yazıldı.)

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

/** Kartın kompozisyon rolü — yatay konum + dikey hiza. */
const rol = (k: { readonly kolon?: string; readonly dikey?: string }): string =>
  `${k.kolon ?? 'sol'}/${k.dikey ?? '-'}`

describe('slayt rolü', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · art arda iki kart aynı rolü TAŞIMIYOR`, () => {
      const roller = o.kartlar.map(rol)
      const tekrar: string[] = []
      for (let i = 1; i < roller.length; i += 1)
        if (roller[i] === roller[i - 1])
          tekrar.push(`k${String(i)}=k${String(i + 1)}=${roller[i] ?? ''}`)
      expect(
        tekrar.join(', '),
        `${id}: ${roller.join(' · ')} — art arda aynı kompozisyon, kaydırınca kare ` +
          'DEĞİŞMİYOR gibi okunuyor; bu bir şablon değil bir FORM'
      ).toBe('')
    })
  }

  // ⚠ Kapı boşa dönmesin: `kolon`u hiçbir deste kullanmıyorsa yukarısı bedava yeşildir.
  it('üç yatay konumun üçü de KULLANILIYOR', () => {
    const kullanilan = new Set<string>()
    for (const o of Object.values(ORNEKLER))
      for (const k of o.kartlar) kullanilan.add(k.kolon ?? 'sol')
    expect(
      [...kullanilan].sort().join(','),
      'üç konumdan biri hiç kullanılmıyor — mekanizma var ama ölü'
    ).toBe('orta,sag,sol')
  })
})
