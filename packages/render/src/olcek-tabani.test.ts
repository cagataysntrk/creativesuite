// Ölçek TEK TABANDAN: 1080'de ölçülen her sayı tuvale orantılı çevriliyor (R-99 · D-329).
//
// ⚠ ⚠ **KROM ÖLÇEKLENMİYORDU ve bunu ancak iki tuvali yan yana koyan biri görebilirdi.**
// Başlık ikili aramayla, gövde `GOVDE_TABANI_1080` ile, panel `--panel-olcek` ile
// ölçekleniyordu — yani sistemin "ölçeklenen" yanı doğruydu. Ama `.ray-logo{24/104px}`,
// `.kilometre-nokta{13px}`, `.kilometre-etiket{16px}` ve rayın `font-size: 18px`i çıplak
// piksel olarak duruyordu: tuval genişleyince tipografi büyüyor, krom olduğu yerde
// kalıyordu. 1080'de doğru görünen oran 1350'de bozuluyordu.
//
// ⚠ Test tek bir tuvalde koşamaz. Ölçek hatası ancak İKİ tuvalin oranı karşılaştırılınca
// görünür — tek tuvalde her sayı "doğru" görünür, çünkü referansı yoktur.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

const TOKEN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../brand/brd_upcytech/derived-tokens/tokens.css'
  ),
  'utf8'
)

const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

/** Ölçekten ETKİLENMESİ gereken ögeler — hepsi 1080'de ölçülmüş sayılar. */
const OLCUM = `(() => {
  const al = (s, ozellik) => {
    const e = document.querySelector(s)
    if (!e) return null
    return parseFloat(getComputedStyle(e)[ozellik])
  }
  return {
    'ray puntosu': al('.ray', 'fontSize'),
    'logo eni': al('.ray-logo', 'width'),
    'logo boyu': al('.ray-logo', 'height'),
    'kilometre noktası': al('.kilometre-nokta', 'width'),
    'kilometre etiketi': al('.kilometre-etiket', 'fontSize'),
    'kart dolgusu': al('.kart', 'paddingLeft'),
    'ray yüksekliği': al('.ray', 'bottom'),
  }
})()`

const olc = async (G: number): Promise<Record<string, number | null>> => {
  const o = ORNEKLER['veri-hikayesi']
  expect(o).toBeDefined()
  const doc = {
    ...(o as (typeof ORNEKLER)[keyof typeof ORNEKLER]),
    slaytGenisligi: G,
    yukseklik: Math.round(G * 1.25),
    tokenCss: TOKEN,
    stamp: DAMGA,
    // ⚠ Logo VERİLİYOR: `.ray-logo` yoksa ölçüm sessizce `null` döner ve test
    // "ölçeklendi" sanır. Ölçülemeyen geçmiş sayılmaz.
    logo: { koyu: TEK_PIKSEL, acik: TEK_PIKSEL },
  } as unknown as PanoramaBelgesi
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: G, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    return page.evaluate(OLCUM)
  })
  expect(r.ok).toBe(true)
  return r.ok ? (r.value as Record<string, number | null>) : {}
}

const TEK_PIKSEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAA' +
  'DUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

describe('ölçek tek tabandan', () => {
  it('tuval %25 genişleyince krom da %25 büyüyor', async () => {
    const dar = await olc(1080)
    const genis = await olc(1350)
    const anahtarlar = Object.keys(dar)
    expect(anahtarlar.length).toBeGreaterThan(6)
    for (const ad of anahtarlar) {
      const a = dar[ad]
      const b = genis[ad]
      // ⚠ `null` bir "geçti" değil: öge çizilmediyse ölçüm YAPILMAMIŞTIR.
      expect(a, `${ad} 1080'de ölçülemedi`).not.toBeNull()
      expect(b, `${ad} 1350'de ölçülemedi`).not.toBeNull()
      if (a === null || b === null || a === undefined || b === undefined) continue
      // Yuvarlama payı: `Math.round` her sayıda ±0,5 px bırakıyor.
      expect(
        b,
        `${ad}: ${String(a)} → ${String(b)}, beklenen ≈${String(a * 1.25)}`
      ).toBeGreaterThan(a * 1.25 - 1)
      expect(b, `${ad}: ${String(a)} → ${String(b)}`).toBeLessThan(a * 1.25 + 1)
    }
  })
})
