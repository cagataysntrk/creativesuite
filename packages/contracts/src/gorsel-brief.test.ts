// GÖRSEL BRIEF SÖZLEŞMESİ — üç yasak, bir zorunluluk (FAZ-19.10).
//
// ⚠ ⚠ **BU KAPI ÜÇ AYRI GERİLEMEDEN DOĞDU ve ÜÇÜNÜ DE BEN ÜRETTİM.** Depo sahibi
// *"sabit monokrom saçmalıklar üretip duruyor"* deyince şablon brief'lerini 3B nesneye
// çevirdim ve tek bir turda deponun ÖLÇEREK yazdığı üç kararı birden deldim:
//
//  1. **`no text` yazdım.** R-20 muhafızı bu alt dizeyi arıyor ve brief'i
//     `suffix_hand_written` ile reddediyor — ek zaten `buildImagePrompt` tarafından TEK
//     kaynaktan ekleniyor. Gerçek koşuda dört yuvanın İKİSİ boş kaldı
//     (`run_01a03af3`), slaytlarda yer tutucu göründü. Tuzak `katalog.ts`te
//     `no texture` örneğiyle ZATEN yazılıydı; okumuştum, yine bastım.
//  2. **`every surface in frame plain and unmarked` ibaresini düşürdüm.** Bir sonraki
//     koşuda (`run_01a03afc`) model LCD ekranlı cihazlar çizdi ve ekranları UYDURMA
//     rakamlarla doldurdu — Yasa 8. Kayıt açıktı: *"üstü yazı taşımaya müsait bir özne
//     İSTENMEZ"*, çünkü *"olumsuzlama görsel modelinde zayıf bir garantidir"*.
//  3. **`rim light` yazdım.** FAZ-18.3 ölçmüştü: rim light öznenin ARKASINA hale koyuyor
//     ve o hale kesme sırasında özneye yapışıyor.
//
// ⚠ Üçü de yorumda yazılıydı ve üçü de tekrar edildi. **Yorumda duran bir kural, kural
// değildir** — bu kapı onları ölçülebilir hâle getiriyor.

import { describe, expect, it } from 'vitest'
import { KATALOG } from './katalog.js'

/** R-20 muhafızının aradığı alt dize — brief'te GEÇEMEZ, ek tek kaynaktan gelir. */
const YASAK_EK = 'no text'
/** Kesmeyi bozan ışık — arkada hale bırakıyor (FAZ-18.3). */
const YASAK_ISIK = 'rim light'
/** Yazı taşımaya müsait özneyi engelleyen ibare — ZORUNLU. */
const ZORUNLU_SADELIK = 'plain and unmarked'

const briefliler = KATALOG.filter((s) => s.gorsel !== null)

describe('görsel brief sözleşmesi', () => {
  // ⚠ Kapı boşa dönmesin: brief taşıyan şablon yoksa aşağıdakiler hiç koşmaz.
  it('brief taşıyan şablon VAR', () => {
    expect(briefliler.map((s) => s.id).join(', '), 'hiç brief yok — kapı boşa dönüyor').not.toBe('')
  })

  for (const s of briefliler) {
    const g = s.gorsel
    if (g === null) continue
    const hepsi = [g.briefTemeli, ...(g.varyantlar ?? [])].join(' · ')

    it(`${s.id} · brief "${YASAK_EK}" YAZMIYOR (R-20 ek tek kaynaktan)`, () => {
      expect(
        hepsi.includes(YASAK_EK),
        `${s.id}: brief "${YASAK_EK}" içeriyor — R-20 muhafızı onu ` +
          'suffix_hand_written ile REDDEDER ve yuva boş kalır'
      ).toBe(false)
    })

    it(`${s.id} · brief "${YASAK_ISIK}" İSTEMİYOR`, () => {
      expect(
        hepsi.includes(YASAK_ISIK),
        `${s.id}: brief "${YASAK_ISIK}" istiyor — hale kesme sırasında özneye yapışır`
      ).toBe(false)
    })

    it(`${s.id} · brief yüzey sadeliğini ŞART KOŞUYOR`, () => {
      expect(
        g.briefTemeli.includes(ZORUNLU_SADELIK),
        `${s.id}: brief "${ZORUNLU_SADELIK}" demiyor — üstü yazı taşımaya müsait bir ` +
          'özne istenirse model kadranı UYDURMA rakamlarla doldurur (Yasa 8)'
      ).toBe(true)
    })
  }
})
