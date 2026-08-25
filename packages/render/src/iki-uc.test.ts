// İKİ UÇ — bir destede hem DEVASA hem FISILTI bulunmak zorunda (FAZ-19.5).
//
// ⚠ ⚠ **BU KAPI BİR ORANI DEĞİL İKİ UCUN VARLIĞINI ÖLÇÜYOR — ve fark ölçümle çıktı.**
// Denetim *"en büyük öge ile en küçüğü arasında ~6:1 ve her şey skalanın ortasında;
// hiçbir yerde devasa, hiçbir yerde fısıltı yok"* diyordu. Bugün oran **25,4:1** ve
// şikâyet eskimiş görünüyor. Ama oran yalnız iki UCU görür; sesler kapak yüksekliğine
// göre log2 kovalara ayrılınca şekil on şablonda da aynı çıktı:
//   küçük seslerin büyük yığını · birkaç orta ses · 128–256 px kovasında DELİK (9/10) ·
//   256+ kovasında **TAM BİR ÖGE** — kapanış rakamı.
// Yani 25,4:1 oranını TEK BİR ÖGE taşıyor. O öge kaybolursa oran çöker ve bu ölçülmüştür:
// D-299 hayaleti kaldırınca oran **3,8–5,1**'e düştü. Kapı tam olarak o çöküşü yakalar.
//
// ⚠ 128–256 kovasının boşluğu KUSUR DEĞİL: ölçüldü, doygunluk 828 px'lik başlık
// kolonundan geliyor (32 harf → 121 px, 8 harf → 168 px; ikisi de kapak 128'in altında).
// Poster ölçeği bir CSS ayarı değil bir METİN BÜTÇESİ kararıdır. Kapı onu istemiyor.
//
// ⚠ Ölçülen şey PUNTO DEĞİL KAPAK YÜKSEKLİĞİ: 458 px punto Archivo'da ~316 px kapak
// verir; iki aile aynı puntoda aynı büyüklükte GÖRÜNMEZ. Göz kapağı okur.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]

/**
 * DEVASA ucun tabanı — kapak yüksekliği piksel.
 * Denetimin `--punto-rakam` bandı 240–360 px kapak; ölçülen en küçük dev **250** px
 * (`donen`). Taban 220: bugünkü en zayıf deste bile %14 pay taşıyor, ama bir desteden
 * kapanış rakamı düşerse (ölçülen ikinci büyük ses ~90 px kapak) kapı kırmızı döner.
 */
const DEV_TABANI = 220
/**
 * FISILTI ucun tavanı. Ölçülen en küçük sesler 11–12 px kapak (künye sayacı, ölçek
 * etiketi). 20 px tavanı bugünkü değerlerin rahat üstünde ama gövde puntosunun
 * (~36 px punto ≈ 25 px kapak) ALTINDA: fısıltı gerçekten ayrı bir ses olmak zorunda.
 */
const FISILTI_TAVANI = 20

/**
 * DEV ses bir RAKAMDIR, bir cümle değil.
 * Denetim: *"~240–360 px, yalnız rakam/sıra/yıl/yüzde, **asla cümle içinde**"*. Ölçülen
 * bugünkü dev sesler: `2,0×` · `00` · `03` · `360°` · `01` · `12` · `-25` · `04`.
 * İzin verilen: rakam, ayırıcı, işaret. Yasak: harf.
 */
const RAKAM_DESENI = /^[\d\s.,:%×°+\-/–—]+$/u

const OLC = `(() => {
  const yaprak = (e) => {
    for (const c of e.childNodes) if (c.nodeType === 1) return false
    return (e.textContent || '').trim().length > 0
  }
  const sesler = []
  for (const e of document.querySelectorAll('*')) {
    if (!yaprak(e)) continue
    const s = getComputedStyle(e)
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.04) continue
    const r = e.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    const p = parseFloat(s.fontSize)
    if (!(p > 0)) continue
    sesler.push({ p, aile: (s.fontFamily.split(',')[0] || '').replace(/["']/g, ''),
      metin: (e.textContent || '').trim().slice(0, 40) })
  }
  const c = document.createElement('canvas').getContext('2d')
  const oran = {}
  for (const a of new Set(sesler.map((x) => x.aile))) {
    c.font = '200px ' + JSON.stringify(a)
    oran[a] = (c.measureText('H').actualBoundingBoxAscent || 140) / 200
  }
  const kapakli = sesler.map((x) => ({ kapak: x.p * (oran[x.aile] || 0.7), metin: x.metin }))
  kapakli.sort((a, b) => b.kapak - a.kapak)
  return { enBuyuk: kapakli[0], enKucuk: kapakli[kapakli.length - 1], adet: kapakli.length }
})`

const uclar = async (
  o: Ornek
): Promise<{
  enBuyuk: { kapak: number; metin: string }
  enKucuk: { kapak: number; metin: string }
  adet: number
}> => {
  const doc = olcumBelgesi(o)
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    // ⚠ ÜÇ SAYFA ADIMI SIRAYLA: punto kolona OTURTULMADAN ölçülen düzen, yayınlanmayan
    // bir düzendir. Bu fazda aynı sınıf hata kapılarda, denetimde ve merceğte çıktı.
    await page.evaluate(puntoOlcumu(doc))
    await page.evaluate(knockoutOlcumu())
    await page.evaluate(metinMaskesi())
    return (await page.evaluate(`${OLC}()`)) as {
      enBuyuk: { kapak: number; metin: string }
      enKucuk: { kapak: number; metin: string }
      adet: number
    }
  })
  expect(r.ok, `ölçüm koşamadı: ${JSON.stringify(r.ok ? null : r.error)}`).toBe(true)
  return r.ok
    ? r.value
    : { enBuyuk: { kapak: 0, metin: '' }, enKucuk: { kapak: 0, metin: '' }, adet: 0 }
}

describe('iki uç', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · destede hem DEVASA hem FISILTI var`, async () => {
      const { enBuyuk, enKucuk, adet } = await uclar(o)
      expect(adet, `${id}: hiç ses ölçülemedi`).toBeGreaterThan(10)
      expect(
        enBuyuk.kapak,
        `${id}: en büyük ses ${enBuyuk.kapak.toFixed(0)} px kapak ("${enBuyuk.metin}") — ` +
          'destede DEVASA bir ses yok; oran tek ögenin sırtında ve o öge düşmüş'
      ).toBeGreaterThanOrEqual(DEV_TABANI)
      expect(
        enKucuk.kapak,
        `${id}: en küçük ses ${enKucuk.kapak.toFixed(0)} px kapak — FISILTI ucu kaybolmuş`
      ).toBeLessThanOrEqual(FISILTI_TAVANI)
      // ⚠ ⚠ **DEV SES BİR RAKAMDIR.** 300 px'lik bir cümle bağırmaz, BOĞAR: dinamik
      // aralığın üst ucu bir vurgu aracıdır, bir metin boyu değil.
      expect(
        RAKAM_DESENI.test(enBuyuk.metin),
        `${id}: dev ses harf taşıyor — "${enBuyuk.metin}"; ` +
          'bu ses yalnız rakam/yıl/yüzde/işaret taşır, asla cümle'
      ).toBe(true)
    }, 60_000)
  }
})
