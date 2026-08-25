// PANOLAR TAŞIYICIYI BİNİYOR — denetimin "sürekli ögeye DEĞSİN" şartı (FAZ-19).
//
// ⚠ ⚠ **ÖLÇÜLDÜ: `veri-hikayesi`nin altı karesinin BEŞİNDE ölü bant %26-%35'ti** ve
// hepsi aynı yerde başlıyordu (y%31-34). Sebep kompozisyonun kendi mantığına aykırıydı:
// eğri panorama boyunca YÜKSELİYOR, panolar dipte DÜZ duruyordu. Boşluk tam olarak
// eğrinin OLMADIĞI yerdi. Pano artık kendi kartının merkezinde taşıyıcının altına
// oturuyor — kart kart yükseliyor ve düzen, verinin anlattığı hikâyeyi anlatıyor.
//
// ⚠ ⚠ **KURAL BİR KEZ FAZLA GENİŞ UYGULANDI ve ölçüm sınırı çizdi.** `yerlesim: 'ust'`ta
// pano zaten gövdenin hemen ALTINDA; taşıyıcıya bindirmek onu aşağı çekip gövdeyle
// arasında YENİ bant açıyor. `karsilastirma`da ölçüldü: kart 1 %73+8 → %48+19,
// kart 2 %51+17 → %31+29, kapsam %76 → %73. **Kural doğruydu, kapsamı yanlıştı.**

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const TOKEN = readFileSync(join(KOK, 'brand/brd_upcytech/derived-tokens/tokens.css'), 'utf8')
const DAMGA = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi =>
  ({ ...o, tokenCss: TOKEN, stamp: DAMGA }) as unknown as PanoramaBelgesi

// ⚠ Ara değer BURADA YENİDEN yazılıyor ve bu KASITLI: `panorama.ts`in kendi yardımcısını
// çağıran bir test, o yardımcı yanlışsa da yeşil kalır. Bağımsız hesap = gerçek kapı.
const araDeger = (n: readonly { readonly x: number; readonly y: number }[], x: number): number => {
  const oncekiler = n.filter((q) => q.x <= x)
  const onceki = oncekiler[oncekiler.length - 1] ?? n[0]
  const sonraki = n.find((q) => q.x >= x) ?? n[n.length - 1]
  const xON = onceki?.x ?? 0
  const xSON = sonraki?.x ?? 0
  const t = xSON === xON ? 0 : (x - xON) / (xSON - xON)
  return (onceki?.y ?? 0) + ((sonraki?.y ?? 0) - (onceki?.y ?? 0)) * t
}

/** Taşıyıcının kart dibinden yüksekliği (px) — eğri dibe yaslı 560 px bandın içinde. */
const tasiyiciDibi = (o: Ornek, merkez: number): number | null => {
  const G = o.slaytGenisligi
  const olc = (px: number): number => Math.round((px * G) / 1080)
  const b = o.bant as { tip?: string; noktalar?: readonly { x: number; y: number }[] } | undefined
  if (b?.tip === 'egri' && b.noktalar !== undefined)
    return Math.round(olc(120) + ((100 - araDeger(b.noktalar, merkez)) / 100) * olc(560))
  const a = o.alanSiniri as { noktalar?: readonly { x: number; y: number }[] } | undefined
  if (a?.noktalar !== undefined)
    return Math.round(((100 - araDeger(a.noktalar, merkez)) / 100) * o.yukseklik)
  return null
}

const BINIYOR = Object.entries(ORNEKLER).filter(
  ([, o]) =>
    (o.yerlesim === undefined || o.yerlesim === 'ayrik') &&
    tasiyiciDibi(o, 50) !== null &&
    o.kartlar.some((k) => k.panel !== null && k.panel !== undefined)
)

describe('panolar taşıyıcıyı biniyor', () => {
  it('en az bir şablonda kural GERÇEKTEN uygulanıyor', () => {
    // ⚠ Kapsam boşalırsa aşağıdaki döngü hiç koşmaz ve dosya "yeşil" görünür. Bu depoda
    // aynı sınıf hata on bir kez oldu: yazılmış ama çağrılmamış.
    expect(BINIYOR.map(([id]) => id).length, 'kuralın kapsamı BOŞ').toBeGreaterThan(0)
  })

  for (const [id, o] of BINIYOR) {
    it(`${id} · pano taşıyıcıya DEĞİYOR ve onunla birlikte yükseliyor`, async () => {
      const sonuc = await withPage(async (page) => {
        const G = o.slaytGenisligi
        await page.setViewportSize({ width: G, height: o.yukseklik })
        await page.setContent(panoramaHtml(belge(o)), { waitUntil: 'load' })
        await page.evaluate(
          '(async () => { await document.fonts.ready;' +
            ' const s = document.querySelector("#sahne");' +
            ' s.style.transform = "none"; document.body.style.width = s.style.width })()'
        )
        await page.setViewportSize({ width: G * o.kartlar.length, height: o.yukseklik })
        return (await page.evaluate(
          '(() => Array.from(document.querySelectorAll(".kart")).map((k) => {' +
            ' const p = k.querySelector(".panel, .sayilar, .etiketler");' +
            ' if (p === null) return null;' +
            ' const kk = k.getBoundingClientRect(), pk = p.getBoundingClientRect();' +
            ' return Math.round(kk.bottom - pk.bottom) }))()'
        )) as readonly (number | null)[]
      })
      expect(sonuc.ok, 'tarayıcı açılamadı').toBe(true)
      if (!sonuc.ok) return
      const dipler = sonuc.value
      const binenler: number[] = []
      for (const [i, dip] of dipler.entries()) {
        const k = o.kartlar[i]
        if (dip === null || k === undefined) continue
        if ((k as { kapanis?: unknown }).kapanis !== undefined) continue
        const hedef = tasiyiciDibi(o, (100 * (i + 0.5)) / o.kartlar.length)
        expect(hedef, `${id} kart ${String(i + 1)}: taşıyıcı yok`).not.toBeNull()
        if (hedef === null) continue
        // ⚠ **DEĞMEK ölçülebilir bir şeydir:** panonun dibi taşıyıcının en fazla 90 px
        // üstünde. "Yakın dursun" bir kural değil, bir temennidir.
        expect(
          Math.abs(dip - hedef),
          `${id} kart ${String(i + 1)}: pano dibi ${String(dip)}, taşıyıcı ${String(hedef)}`
        ).toBeLessThanOrEqual(90)
        binenler.push(dip)
      }
      expect(binenler.length, `${id}: binen pano`).toBeGreaterThan(1)
      // ⚠ Taşıyıcı yükseliyorsa panolar da yükselmeli — düzen verinin hikâyesini anlatıyor.
      for (const [j, v] of binenler.slice(1).entries())
        expect(v, `${id}: pano ${String(j + 2)} bir öncekinden aşağıda`).toBeGreaterThan(
          binenler[j] as number
        )
    }, 90_000)
  }
})
