// Sahne gövdenin (0,0)'ında başlıyor — kadraj kartın kutusu değil, EKRANIN kutusudur
// (R-93 · D-323 · §7.1).
//
// ⚠ ⚠ **ÜRETİLEN HER KAROSEL 21 PX AŞAĞI KAYIYORDU.** Görsel işlemlerinin
// `<svg class="filtre-tanim" width="0" height="0">` tanımları gövdede INLINE duruyordu;
// sıfır boyutlu bir inline öge bile satır kutusu doğurur ve o kutunun strut yüksekliği
// 21 px. Üstte gövde zemininden bir şerit kalıyor, kartın son 21 px'i — imzanın
// durduğu ray — kadrajın dışına taşıyordu.
//
// ⚠ ⚠ **VAR OLAN HİÇBİR KUSUR BUNU GÖREMEZDİ ve sebebi tek cümle:** bütün ölçümler
// ögeleri KARTA göre okuyor. Kart kendi içinde kusursuzdu; yanlış olan YERİYDİ. Güvenli
// alan bile karttan sayıldığı için sessizdi. Bu, bu depoda ölçüm aletinin kendisinin
// bozuk çıktığı DÖRDÜNCÜ vaka.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { FILTRE_TANIM_CSS } from './gorsel-islem.js'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaDenetle } from './panorama-denetim.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

const belge = (o: (typeof ORNEKLER)[keyof typeof ORNEKLER]): PanoramaBelgesi =>
  ({ ...o, tokenCss: '', stamp: DAMGA }) as unknown as PanoramaBelgesi

/** Sahnenin ekran koordinatı — ölçümün tam olarak baktığı şey. */
const SAHNE_KOSESI = `(() => {
  const r = document.getElementById('sahne').getBoundingClientRect()
  return [Math.round(r.left), Math.round(r.top)]
})()`

describe('sahne kaymıyor', () => {
  it('tanım ögeleri akışın DIŞINDA — kural üretilen CSS içinde', () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    expect(panoramaHtml(belge(o))).toContain(FILTRE_TANIM_CSS.trim())
  })

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · sahne (0,0)'da`, async () => {
      const r = await panoramaDenetle(belge(o))
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.value.filter((k) => k.tur === 'sahne-kaymis')).toEqual([])
    })
  }

  // 🧪 ⚠ **KASTEN İHLAL** (R-71). Kuralı iptal eden tek satır enjekte ediliyor ve
  // sahnenin gerçekten kaydığı ÖLÇÜLÜYOR. Bu test kırmızıya dönmezse ölçüm bir şey
  // ölçmüyor demektir — düzeltmeden önceki hâl tam olarak buydu ve her şey yeşildi.
  it('kural iptal edilince sahne GERÇEKTEN kayıyor — ölçüm boş değil', async () => {
    const o = ORNEKLER['sahne']
    expect(o).toBeDefined()
    if (o === undefined) return
    const html = panoramaHtml(belge(o))
    const bozuk = html.replace(
      '</style>',
      '.filtre-tanim { position: static; width: auto; height: auto }</style>'
    )
    expect(bozuk).not.toBe(html)
    const r = await withPage(async (page) => {
      await page.setViewportSize({ width: o.slaytGenisligi, height: o.yukseklik })
      await page.setContent(bozuk, { waitUntil: 'load' })
      return page.evaluate(SAHNE_KOSESI)
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const [, ust] = r.value as readonly number[]
    expect(ust).toBeGreaterThan(0)
  })
})
