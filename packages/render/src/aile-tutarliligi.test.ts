// AİLE SINAVI — on şablon tek Instagram ızgarasında (R-107 · D-339 · FAZ-18.17).
//
// ⚠ ⚠ **"BAKILIR" TEK BAŞINA BİR KAPI DEĞİL.** Faz adımının kendi testi *"bir şablonun
// aksanını değiştir → ızgarada hemen sırıtıyor"* diyor; yani aile tutarlılığının
// ÖLÇÜLEBİLİR olması bekleniyor. Göz onu her turda yeniden bakmadan koruyamaz.
//
// ⚠ Ölçülen üç şey, adımın kendi cümlesinden: *"ayrım layout'tan gelmeli; palet, tip
// ölçeği ve künye ORTAK kalmalı."*
//   · **Palet** — çizilen renkli piksellerin tonu. On şablonun onunda da ≥%86'sı tek
//     tonda toplanıyor; ikinci bir renk kümesi YOK.
//   · **Krom** — ray on yerde de birebir aynı: punto, üst kenar, çocuk sayısı.
//   · **Tip** — gövde puntosu okuma eşiğinin üstünde (R-83 zaten zorluyor).
//
// ⚠ H1 puntosu KASTEN serbest (74–151 px ölçüldü): başlık kadraja OTURUYOR, sabit bir
// punto taşımıyor. Sabitlemek uzun bir başlığı taşırır ya da kısa birini cüce bırakır —
// ortak olan ölçek, piksel değil.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

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

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]

/** Kapağın krom ölçüleri ve renkli piksellerinin ton dağılımı. */
const OLCUM = `(() => {
  const al = (s, o) => {
    const e = document.querySelector(s)
    return e ? parseFloat(getComputedStyle(e)[o]) : null
  }
  const ray = document.querySelector('.ray')
  const rb = ray ? ray.getBoundingClientRect() : null
  return {
    govde: al('.govde', 'fontSize'),
    rayPunto: al('.ray', 'fontSize'),
    rayUst: rb ? Math.round(rb.top) : null,
    rayCocuk: ray ? ray.children.length : null,
  }
})()`

/**
 * ⚠ ⚠ **DOYGUNLUK EŞİĞİ 0,25 ve bu bir ayrıntı değil.** Nötr rampanın chroma'sı 0
 * (D-318) ama kenar yumuşatma gri piksellerde küçük bir doygunluk üretiyor. Eşiksiz
 * ölçüm o gürültüyü "renk" sayar ve her şablonda rastgele tonlar bulur.
 */
const TON = (b64: string): string => `(async () => {
  const im = new Image()
  im.src = 'data:image/png;base64,${b64}'
  await im.decode()
  const c = document.createElement('canvas')
  c.width = im.width; c.height = im.height
  const x = c.getContext('2d')
  x.drawImage(im, 0, 0)
  const d = x.getImageData(0, 0, c.width, c.height).data
  const kova = new Map()
  let renkli = 0
  for (let i = 0; i < d.length; i += 28) {
    const r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b), l = (mx+mn)/2
    const s = mx === mn ? 0 : (mx-mn)/(1 - Math.abs(2*l - 1))
    if (s < 0.25 || l < 0.06 || l > 0.96) continue
    renkli += 1
    let h = 0
    if (mx === r) h = 60*(((g-b)/(mx-mn))%6)
    else if (mx === g) h = 60*(((b-r)/(mx-mn))+2)
    else h = 60*(((r-g)/(mx-mn))+4)
    if (h < 0) h += 360
    const k = Math.round(h/10)*10
    kova.set(k, (kova.get(k)||0)+1)
  }
  if (renkli === 0) return { renkli: 0, tepe: null, pay: 0 }
  const sirali = [...kova.entries()].sort((a,b)=>b[1]-a[1])
  return { renkli: renkli, tepe: sirali[0][0], pay: Math.round(sirali[0][1]/renkli*100) }
})()`

interface Olcu {
  readonly govde: number
  readonly rayPunto: number
  readonly rayUst: number
  readonly rayCocuk: number
  readonly renkli: number
  readonly tepe: number | null
  readonly pay: number
}

const kapagiOlc = async (o: Ornek, token = TOKEN): Promise<Olcu> => {
  const doc = { ...o, tokenCss: token, stamp: DAMGA } as unknown as PanoramaBelgesi
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.evaluate(puntoOlcumu(doc))
    const olcu = await page.evaluate(OLCUM)
    const png = await page.screenshot()
    const ton = await page.evaluate(TON(png.toString('base64')))
    return { ...(olcu as object), ...(ton as object) } as Olcu
  })
  expect(r.ok).toBe(true)
  return r.ok ? r.value : ({} as Olcu)
}

describe('aile sınavı — on şablon tek ızgarada', () => {
  const olculer: Record<string, Olcu> = {}

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · kromu ve paleti aileye ait`, async () => {
      const v = await kapagiOlc(o)
      olculer[id] = v
      // ── palet: TEK ton ──────────────────────────────────────────────────
      // ⚠ İkinci bir renk kümesi ailenin en görünür kırılması: ızgarada bir şablon
      // "başka bir marka" gibi durur ve bunu ancak yan yana konunca fark edersin.
      if (v.renkli > 200) {
        expect(v.pay, `${id}: baskın ton payı %${String(v.pay)}`).toBeGreaterThanOrEqual(80)
      }
      // ── tip: okuma eşiği (R-83) ────────────────────────────────────────
      expect(v.govde, `${id} gövde puntosu`).toBeGreaterThanOrEqual(36)
    })
  }

  // ⚠ ⚠ **KROM MUTLAK BİR SAYIYLA DEĞİL, EŞİTLİKLE SINANIYOR.** İlk sürüm
  // `rayCocuk === 4` yazıyordu ve on şablonda birden kırmızıya döndü: öge sayısı logo
  // verilip verilmemesine bağlı, yani o iddia şablonu değil FIXTURE'ı ölçüyordu. Ailenin
  // tanımı "krom dört ögedir" değil, **"krom her şablonda AYNIDIR"**.
  it('krom on şablonda BİREBİR aynı — punto, üst kenar, öge sayısı', () => {
    const hepsi = Object.entries(olculer)
    expect(hepsi.length).toBe(Object.keys(ORNEKLER).length)
    const ilk = hepsi[0]?.[1]
    expect(ilk).toBeDefined()
    if (ilk === undefined) return
    for (const [id, v] of hepsi) {
      expect(v.rayPunto, `${id} ray puntosu`).toBe(ilk.rayPunto)
      expect(v.rayUst, `${id} ray üst kenarı`).toBe(ilk.rayUst)
      expect(v.rayCocuk, `${id} ray öge sayısı`).toBe(ilk.rayCocuk)
    }
  })

  it('on şablonun BASKIN TONU aynı — ızgara tek bir hesaba ait', () => {
    const tonlar = Object.entries(olculer)
      .filter(([, v]) => v.renkli > 200)
      .map(([id, v]) => [id, v.tepe] as const)
    expect(tonlar.length).toBeGreaterThan(6)
    const ilk = tonlar[0]?.[1]
    for (const [id, t] of tonlar) {
      expect(
        Math.abs((t ?? 0) - (ilk ?? 0)),
        `${id}: ton ${String(t)}°, aile ${String(ilk)}°`
      ).toBeLessThanOrEqual(15)
    }
  })

  // 🧪 ⚠ **KASTEN İHLAL** — adımın kendi testi: *"bir şablonun aksanını değiştir →
  // ızgarada hemen sırıtıyor."* Aksan turuncuya çevriliyor ve ölçüm onu YAKALIYOR.
  it('aksanı değişen şablon ızgarada SIRITIYOR', async () => {
    const o = ORNEKLER['dizin']
    expect(o).toBeDefined()
    if (o === undefined) return
    const bozuk = TOKEN.replace(
      /--ramp-marka-mavi-500:[^;]+;/g,
      '--ramp-marka-mavi-500: oklch(0.70 0.190 50);'
    )
    expect(bozuk).not.toBe(TOKEN)
    const v = await kapagiOlc(o, bozuk)
    const saglam = olculer['dizin']
    expect(saglam).toBeDefined()
    if (saglam === undefined) return
    expect(
      Math.abs((v.tepe ?? 0) - (saglam.tepe ?? 0)),
      `bozuk ${String(v.tepe)}° · sağlam ${String(saglam.tepe)}°`
    ).toBeGreaterThan(15)
  })
})
