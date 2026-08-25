// KUTU DEĞİL YÜZEY — üç ölçülen kural, hepsi bugün SAĞLANIYOR (FAZ-19.8).
//
// ⚠ ⚠ **BU KAPI BİR KUSURDAN DEĞİL, BİR ÖLÇÜMDEN DOĞDU.** 19.8'in *"kutu değil yüzey"*
// altı kuralı ölçüldü ve render tarafında **hiçbir ihlal çıkmadı**. Kapı yine de yazıldı:
// bugün doğru olan bir şey, korunmadığı sürece yarın sessizce bozulur — bu fazda tam bunun
// üç örneği çıktı (13 kemer ↔ 13 vafel, marka nadirliği, kapanış yüzeyi: hepsi doğruydu,
// hiçbiri korunmuyordu).
//
// ⚠ ⚠ **VE ÖLÇÜM BENİ İKİ KEZ GEREKSİZ İŞTEN DÖNDÜRDÜ.**
//  1. Yarıçap taraması `vafel-kare` 2 px ve `cubuk` 3 px buldu — ikisi de yasak **4–12 px**
//     bandının ALTINDA. O bant "bootstrap kartı" bandıdır; 2 px'lik optik yumuşatma bir
//     UI kartı değildir. Düzeltilecek bir şey yoktu.
//  2. Piksel taraması `akan-alan` · `sahne` · `donen`i "düz renk" diye işaretledi ve üçünde
//     `yuzey` alanı gerçekten boştu. §4 matrisine bakılınca sebep göründü: o üçünün yüzeyi
//     bir DOKU AİLESİ değil, ALANIN KENDİSİ (*"dökme mürekkep alanı"* · *"derin mürekkep +
//     temas zemini"* · *"alternan"*). Eksiklik değil, tasarım. Koyu zeminde grenin mutlak
//     luminans yayılımı doğal olarak küçük — alet onu "gren yok" sanmıştı.
//
// *Ölçülen her sapma bir kusur değildir; kuralın ne dediğine bakmadan düzeltmek, bu fazda
// bana iki kez gereksiz iş yaptırdı.*

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

/** "Bootstrap kartı" bandı — bu aralıktaki yarıçap kutu görüntüsü üretir. */
const KUTU_BANDI = { alt: 4, ust: 12 }

const OLC = `(() => {
  const yaricap = []
  const golge = []
  document.querySelectorAll('*').forEach((e) => {
    const s = getComputedStyle(e)
    const b = e.getBoundingClientRect()
    if (b.width < 4 || b.height < 4) return
    const ad = String(e.className && e.className.baseVal !== undefined
      ? e.className.baseVal : e.className || e.tagName).split(' ')[0]
    const r = parseFloat(s.borderTopLeftRadius)
    if (r >= ${KUTU_BANDI.alt} && r <= ${KUTU_BANDI.ust}) yaricap.push(ad + ' ' + Math.round(r))
    const g = s.boxShadow
    if (g && g !== 'none' && !/inset/.test(g)) golge.push(ad)
  })
  const var_ = (s) => {
    const e = document.querySelector(s)
    return e !== null && Number(getComputedStyle(e).opacity) > 0
  }
  return { yaricap, golge, gren: var_('.ust-gren'), isik: var_('.ust-isik') }
})()`

describe('yüzey zanaatı', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · kutu değil YÜZEY`, async () => {
      const doc = olcumBelgesi(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        // ⚠ ÜÇ SAYFA ADIMI SIRAYLA — punto oturmadan ölçülen düzen yayınlanmayan düzendir.
        await page.evaluate(puntoOlcumu(doc))
        await page.evaluate(knockoutOlcumu())
        await page.evaluate(metinMaskesi())
        return (await page.evaluate(OLC)) as {
          yaricap: string[]
          golge: string[]
          gren: boolean
          isik: boolean
        }
      })
      expect(r.ok, `${id}: ölçüm koşamadı`).toBe(true)
      if (!r.ok) return
      // ── 1: yarıçap ya 0'a yakın ya ≥28; ARADAKİ bant kutu üretir ────────
      expect(
        r.value.yaricap.join(', '),
        `${id}: ${String(KUTU_BANDI.alt)}–${String(KUTU_BANDI.ust)} px yarıçap — ` +
          'bu bant tam olarak "bootstrap kartı" bandıdır'
      ).toBe('')
      // ── 2: DÜZ GÖLGE YOK; sistem yalnız iç ışık kullanıyor ─────────────
      expect(
        [...new Set(r.value.golge)].join(', '),
        `${id}: dış gölge var — bu sistem gölgeyle değil YÜZEYLE derinlik kuruyor; ` +
          'gerekiyorsa iki katman (sıcak yakın + soğuk uzak), tek düz katman DEĞİL'
      ).toBe('')
      // ── 3: SAF RENK YOK; gren ve ışık katmanları duruyor ────────────────
      expect(r.value.gren, `${id}: gren katmanı yok — saf renk ekrandaki en ölü yüzeydir`).toBe(
        true
      )
      expect(r.value.isik, `${id}: ışık katmanı yok — yüzeyin kalınlığını o veriyor`).toBe(true)
    }, 45_000)
  }
})
