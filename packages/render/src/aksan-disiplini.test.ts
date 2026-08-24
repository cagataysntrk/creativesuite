// AKSAN DİSİPLİNİ — tek aksan anını işe yarayan şey NADİRLİĞİDİR (FAZ-19.7).
//
// ⚠ ⚠ **ÖLÇÜLDÜ: 45 KARTIN 45'İ başlığında aksan taşıyordu.** Yüzde yüz. Denetimin
// sözleriyle: *"aksan on kartta da aynı sözdizimsel yerde — her kartta aynı yerde duran
// aksan, AKSAN DEĞİLDİR."* Bir vurgu her yerdeyse vurgu değil DOKUDUR.
//
// ⚠ Kural iki yönlü ve ikisi de gerekli:
//   · `vurgu` ≤ 2 — aksan nadir olmalı.
//   · `yok` ≥ 1 — en az bir kart TAMAMEN sessiz olmalı; tavan tek başına
//     "her kartta biraz" dağılımını engellemez.
//
// ⚠ Hangi ikisi: AÇILIŞ ve VARIŞ. Karosel bir yolculuk; girişi ve vardığı yeri
// işaretlemek, aradaki her adımı işaretlemekten daha çok şey söyler.

import { describe, expect, it } from 'vitest'
import { ORNEKLER } from './katalog-ornek.js'

const aksanli = (metin: string): boolean => /\*\*/.test(metin)

describe('aksan disiplini', () => {
  it('bir karoselde EN ÇOK İKİ kart başlığı aksan taşıyor', () => {
    for (const [id, o] of Object.entries(ORNEKLER)) {
      const n = o.kartlar.filter((k) => aksanli(k.baslik)).length
      expect(n, `${id}: ${String(n)} kart aksan taşıyor`).toBeLessThanOrEqual(2)
    }
  })

  // ⚠ Tavan tek başına yetmez: dört kartın ikisi aksanlıysa tavan sağlanır ama sessizlik
  // yoktur. Nadirlik, susan bir kart olmadan kurulmuyor.
  it('EN AZ BİR kart tamamen sessiz — sessizlik olmadan nadirlik olmaz', () => {
    for (const [id, o] of Object.entries(ORNEKLER)) {
      const sessiz = o.kartlar.filter((k) => !aksanli(k.baslik)).length
      expect(sessiz, `${id}: hiçbir kart susmuyor`).toBeGreaterThanOrEqual(1)
    }
  })

  // ⚠ ⚠ **AÇILIŞ VE VARIŞ.** Aksanın hangi iki kartta durduğu keyfî değil: kapak
  // karoselin girişi, son kart vardığı yer. Ortadaki kartlar yolculuk — onları da
  // işaretlemek yolculuğu değil GÜRÜLTÜYÜ artırır.
  it('aksan AÇILIŞ ve VARIŞ kartlarında — arada değil', () => {
    for (const [id, o] of Object.entries(ORNEKLER)) {
      const n = o.kartlar.length
      if (n < 3) continue
      for (let i = 1; i < n - 1; i += 1)
        expect(aksanli(o.kartlar[i]?.baslik ?? ''), `${id}: ${String(i + 1)}. kart aksanlı`).toBe(
          false
        )
    }
  })
})
