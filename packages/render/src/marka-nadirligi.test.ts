// MARKA İŞARETİ KAROSEL BAŞINA TAM İKİ KEZ (FAZ-19.7).
//
// ⚠ ⚠ **ÖLÇÜLDÜ: İŞARET HER KARTTA VARDI.** Altı kartlık bir destede **yedi kez** —
// altı künye şeridi logosu (104 px) artı bir kapanış imzası (277 px). Denetimin kuralı:
// slayt 1'de küçük bir SAHİPLİK işareti, son slaytta büyük İMZA, arada hiçbir şey. Künye
// şeridindeki logo için sözü net: *"imza değil duvar kâğıdı"*.
//
// ⚠ Gerekçe estetikten önce mantıksal: her karede tekrarlanan bir marka, marka olmaktan
// çıkıp DESENE döner. Bir imzanın ağırlığı nadirliğinden gelir — aynı şey aksan renginde
// de ölçülmüştü (`aksan-rolu`).
//
// ⚠ ⚠ **VE İŞARET İLK DENEMEDE YANLIŞ YERE DÜŞTÜ.** `.kapak-isaret` mutlak konumlu
// yazıldı ama `.kart > *` kuralı ona `position: relative` veriyordu; `top`/`right`
// değerleri akıştaki yerinden KAYDIRMAYA dönüştü ve işaret sağ üstte değil BAŞLIĞIN
// ÜZERİNDE belirdi. Çizilip bakılınca görüldü, seçici dışlamaya alındı. Ölçülen son
// konum: **x %85,9–94,1 · y %5,6** — sağ üst, güvenli kenarın içinde.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

/** Bir karoselde marka işareti tam kaç kez görünebilir. */
const ISARET_SAYISI = 2

const OLC = `(() => {
  const c = []
  document.querySelectorAll('img').forEach((e) => {
    const r = e.getBoundingClientRect()
    if (r.width < 3) return
    c.push({ s: (e.className || '').split(' ')[0], w: Math.round(r.width), x: Math.round(r.left) })
  })
  return c
})()`

describe('marka nadirliği', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · marka işareti TAM ${String(ISARET_SAYISI)} kez`, async () => {
      const doc = olcumBelgesi(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        // ⚠ ÜÇ SAYFA ADIMI SIRAYLA — punto oturmadan ölçülen düzen yayınlanmayan düzendir.
        await page.evaluate(puntoOlcumu(doc))
        await page.evaluate(knockoutOlcumu())
        await page.evaluate(metinMaskesi())
        return (await page.evaluate(OLC)) as { s: string; w: number; x: number }[]
      })
      expect(r.ok, `${id}: ölçüm koşamadı`).toBe(true)
      if (!r.ok) return
      const G = doc.slaytGenisligi
      const yerler = r.value.map((x) => `${x.s}@k${String(Math.floor(x.x / G) + 1)}`)
      expect(
        r.value.length,
        `${id}: ${String(r.value.length)} işaret (${yerler.join(' · ')})`
      ).toBe(ISARET_SAYISI)
      // ⚠ Biri KAPAKTA, öteki SON kartta olmak zorunda: ikisi de ortada duruyorsa
      // sayı tutar ama kural tutmaz.
      const ilk = r.value.find((x) => x.s === 'kapak-isaret')
      const son = r.value.find((x) => x.s === 'kapanis-isaret')
      expect(ilk === undefined ? 'kapak işareti YOK' : '', `${id}: kapakta sahiplik yok`).toBe('')
      expect(son === undefined ? 'kapanış imzası YOK' : '', `${id}: kapanışta imza yok`).toBe('')
      if (ilk === undefined || son === undefined) return
      expect(Math.floor(ilk.x / G), `${id}: sahiplik işareti kapakta değil`).toBe(0)
      expect(Math.floor(son.x / G), `${id}: imza son kartta değil`).toBe(o.kartlar.length - 1)
      // ⚠ İMZA SAHİPLİKTEN BÜYÜK: ikisi aynı boyda olsaydı hangisinin imza olduğu
      // okunmazdı. Ölçülen oran bugün 277/88 ≈ 3,1×.
      expect(son.w / ilk.w, `${id}: imza sahiplik işaretinden büyük değil`).toBeGreaterThan(2)
    }, 45_000)
  }
})
