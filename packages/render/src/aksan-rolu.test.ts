// AKSANIN BİR ROLÜ VAR — renk bir doku değil, bir OLAY (FAZ-19.7).
//
// ⚠ ⚠ **DENETİM: *"Aksan dokuya dönüşmüş: mavi on kartta da aynı sözdizimsel yerde. Her
// kartta aynı yerde duran aksan, aksan değildir."*** `aksan-disiplini` kapısı vurgunun
// SAYISINI kilitlemişti (on destede de tam 2) ama yerini değil. Bu turda yer sayıldı ve
// iddiadan sert çıktı: **on destenin onunda da aynı iki slayt** — kapak ve SON kart.
// Sayı kuralı sağlıyordu, davranış REFLEKSTİ.
//
// ⚠ Ve asıl mürekkep daha derinde: kartın aksan rengiyle çizilen bütün ögeleri sayınca
// (`aksan-payi.mjs`) **her kartta 1–14 tane** çıktı — üst etiket tiresi, liste numaraları,
// künye sayacı. Yani denetimin önerdiği dört rolden `alan` ve `yok` **hiçbir kartta
// yoktu**; deste boyunca aksan hiç susmuyordu.
//
// ⚠ ⚠ **KONTRAST TUZAĞI VE BU KAPININ ASIL İŞİ.** Denetim `alan` rolünü *"≥%20 alan +
// oyulmuş beyaz"* diye tarif ediyor. Ama marka mavisi üstüne beyaz **4,07** kontrast verir
// ve gövde metni için eşik 4,5 — yani tarifin harfiyen uygulanması okunmaz gövde üretir.
// Büyük metin (başlık) için eşik 3:1, o geçiyor. Bu yüzden alana YALNIZ başlık giriyor ve
// aşağıdaki üçüncü iddia gövdenin bandın DIŞINDA kaldığını tarayıcıda doğruluyor.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

/** `alan` bandının en az kaplaması gereken kart yüzdesi (denetim: ≥%20). */
const ALAN_TABANI = 20

describe('aksan rolü', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · aksan bir kez SUSUYOR ya da bir kez YÜZEY oluyor`, () => {
      const roller = o.kartlar.map((k) => k.aksanRolu ?? '-')
      const kirici = roller.filter((r) => r === 'alan' || r === 'yok')
      expect(
        kirici.length,
        `${id}: ${roller.join(' · ')} — hiçbir kart aksanı kırmıyor; ölçüldü, on destenin ` +
          'onunda da vurgu aynı iki slayttaydı ve her kartta aksan mürekkebi vardı'
      ).toBeGreaterThan(0)
    })

    // ⚠ `alan` NADİR olmak zorunda: iki kartta yüzey olan bir renk yine dokudur.
    it(`${id} · en çok BİR kart yüzey`, () => {
      const alanli = o.kartlar.filter((k) => k.aksanRolu === 'alan')
      expect(
        alanli.length,
        `${id}: ${String(alanli.length)} kart 'alan' — iki yüzey bir olay değil bir desendir`
      ).toBeLessThanOrEqual(1)
      for (const k of alanli)
        expect(
          k.aksanDibi ?? 0,
          `${id}: alan bandı %${String(k.aksanDibi ?? 0)} — bu kadarı bir şerit, bir yüzey değil`
        ).toBeGreaterThanOrEqual(ALAN_TABANI)
    })

    // ⚠ Rol beyanı içerikle ÇELİŞEMEZ: `yok`/`isaret` diyen kart başlıkta aksan taşıyamaz.
    it(`${id} · susan kart başlıkta AKSAN taşımıyor`, () => {
      const celisen = o.kartlar
        .filter(
          (k) => (k.aksanRolu === 'yok' || k.aksanRolu === 'isaret') && k.baslik.includes('**')
        )
        .map((k) => k.ustBaslik)
      expect(
        celisen.join(', '),
        `${id}: rolü 'yok'/'isaret' olan kart başlığında **vurgu** taşıyor — beyan ile ` +
          'çizilen çelişiyor'
      ).toBe('')
    })
  }

  // ── GÖVDE ALANIN ÜSTÜNE DÜŞEMEZ ────────────────────────────────────────────
  // ⚠ Bu iddia tarayıcıda koşuyor çünkü bandın dibi YAZILI bir yüzde, gövdenin yeri ise
  // puntonun kolona oturmasıyla belirleniyor — ikisi ancak render'da karşılaşıyor.
  const alanliDesteler = Object.entries(ORNEKLER).filter(([, o]) =>
    o.kartlar.some((k) => k.aksanRolu === 'alan')
  )

  // ⚠ Kapı boşa dönmesin: hiç `alan` yoksa aşağıdaki iddia hiç koşmaz.
  it("'alan' rolü KULLANILIYOR", () => {
    expect(
      alanliDesteler.length,
      'hiçbir destede alan rolü yok — mekanizma var ama ölü'
    ).toBeGreaterThan(0)
  })

  for (const [id, o] of alanliDesteler) {
    it(`${id} · gövde alanın ÜSTÜNE düşmüyor`, async () => {
      const doc = olcumBelgesi(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        // ⚠ ÜÇ SAYFA ADIMI SIRAYLA — punto oturmadan ölçülen düzen yayınlanmayan düzendir.
        await page.evaluate(puntoOlcumu(doc))
        await page.evaluate(knockoutOlcumu())
        await page.evaluate(metinMaskesi())
        return (await page.evaluate(
          '(() => Array.from(document.querySelectorAll(".kart.aksan-alan")).map((k) => {' +
            ' const kr = k.getBoundingClientRect();' +
            ' const dip = parseFloat(getComputedStyle(k).getPropertyValue("--aksan-dibi"));' +
            ' const g = k.querySelector(".govde");' +
            ' const b = k.querySelector(".baslik");' +
            ' const y = (e) => (e ? [100 * (e.getBoundingClientRect().top - kr.top) / kr.height,' +
            '   100 * (e.getBoundingClientRect().bottom - kr.top) / kr.height] : null);' +
            ' return { dip, govde: y(g), baslik: y(b) } }))()'
        )) as { dip: number; govde: [number, number] | null; baslik: [number, number] | null }[]
      })
      expect(r.ok, `ölçüm koşamadı: ${JSON.stringify(r.ok ? null : r.error)}`).toBe(true)
      const kartlar = r.ok ? r.value : []
      expect(kartlar.length, `${id}: alan kartı bulunamadı`).toBeGreaterThan(0)
      for (const k of kartlar) {
        expect(
          k.govde === null ? 100 : k.govde[0],
          `${id}: gövde %${String(k.govde?.[0].toFixed(1))}'de başlıyor ama alan ` +
            `%${String(k.dip)}'e iniyor — aksan üstünde gövde metni 4,07 kontrast verir`
        ).toBeGreaterThanOrEqual(k.dip)
        // ⚠ Başlık ise alanın İÇİNDE kalmalı: yarısı dışarı taşan bir oyma, oyma değildir.
        expect(
          k.baslik === null ? 0 : k.baslik[1],
          `${id}: başlık %${String(k.baslik?.[1].toFixed(1))}'de bitiyor, alan %${String(k.dip)}`
        ).toBeLessThanOrEqual(k.dip)
      }
    }, 45_000)
  }
})
