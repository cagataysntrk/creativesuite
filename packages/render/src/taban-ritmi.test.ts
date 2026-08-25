// Taban çizgisi ızgarası: dikey ritim METİNDEN türüyor (R-100 · D-330).
//
// ⚠ ⚠ **TABAN SABİT BİR SAYI DEĞİL ve faz planı öyle varsayıyordu** (40 × 1,35 = 54).
// Ölçüldü: gerçek satır aralığı **1,50** ve gövde puntosu şablondan şablona değişiyor —
// 54 · 54,9 · 59,1 · 60,6 · 61,2 px. Sabit 54, altı şablonun BEŞİNDE yanlış olurdu.
// Gövde puntosu başlık puntosuna bağlı, başlık puntosu ise ikili aramanın sonucu: taban
// ancak ölçüm KOŞTUKTAN sonra bilinebiliyor.
//
// ⚠ ⚠ **KURAL RENDER'DA SINANAMAZ.** `getComputedStyle().marginTop` `auto` için de
// KULLANILAN pikseli döndürüyor; yani `margin-top: auto` ile yazılmış bir boşluk ile
// tabana bağlanmış bir boşluk tarayıcıda ayırt edilemiyor. Bu yüzden iki ayrı sınav:
// üretilen CSS tabanı ÇAĞIRIYOR mu, ve `--taban` gerçekten KURULUYOR mu. İkincisi
// olmazsa yedek değer sessizce devralır ve her şablon yanlış ritme döner — bu deponun
// tekrar eden kopukluğu.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi =>
  // ⚠ Ölçüm belgesi TEK yerden (`olcum-belgesi.ts`): belirteç + font + logo + damga.
  // Yedek fontla ölçen bir kapı, yayınlanmayan bir düzeni denetler.
  olcumBelgesi(o)

describe('taban çizgisi ızgarası', () => {
  it('blok arası boşluklar tabanı ÇAĞIRIYOR — sabit piksel değil', () => {
    const o = ORNEKLER['memphis']
    expect(o).toBeDefined()
    if (o === undefined) return
    const css = panoramaHtml(belge(o))
    expect(css).toMatch(/\.govde \{ margin-top: calc\(var\(--taban, \d+px\) \* 1\)/)
    expect(css).toMatch(
      // ⚠ Kural aynı, KURALIN YAZIMI değişti: bildirim `var(--pano-ust, …)` üzerinden
      // geçiyor ve bloğa `margin-bottom: var(--pano-dip)` eklendi — panolar taşıyıcıyı
      // biniyor. İddia hâlâ *"boşluk `--taban`ı ÇAĞIRIYOR, sabit piksel değil"*; seçici ve
      // süsleme iddiaya dahil değildi ve onları aramak kuralı değil noktalamayı sınıyordu.
      /margin-top: var\(--pano-ust, calc\(var\(--taban, \d+px\) \* 2\)\)/
    )
    // ⚠ Üst başlık İSTİSNA: başlıkla tek birim, aralarındaki boşluk bir blok aralığı
    // değil bir etiket bağlantısı. Tabana çevirmek ikisini KOPARIRDI.
    expect(css).toMatch(/margin-bottom: \d+px;/)
  })

  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · taban ÖLÇÜLEN gövde aralığı ve boşluk onun tam katı`, async () => {
      const doc = belge(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({
          width: doc.slaytGenisligi * doc.kartlar.length,
          height: doc.yukseklik,
        })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        await page.evaluate(puntoOlcumu(doc))
        return page.evaluate(`(() => {
          const sahne = document.getElementById('sahne')
          const taban = parseFloat(getComputedStyle(sahne).getPropertyValue('--taban'))
          const g = document.querySelector('.govde')
          if (!g) return { taban: taban, aralik: null, bosluk: null }
          return {
            taban: taban,
            aralik: parseFloat(getComputedStyle(g).lineHeight),
            bosluk: parseFloat(getComputedStyle(g).marginTop),
          }
        })()`)
      })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const v = r.value as { taban: number; aralik: number | null; bosluk: number | null }
      // ⚠ ⚠ `--taban` KURULMAMIŞSA yedek sessizce devralır ve hiçbir şey kırmızı olmaz.
      // Ölçülemeyen geçmiş sayılmaz: önce KURULDUĞU sınanıyor.
      expect(Number.isNaN(v.taban), `${id}: --taban hiç kurulmamış`).toBe(false)
      expect(v.taban).toBeGreaterThan(40)
      if (v.aralik === null || v.bosluk === null) return
      // Taban ölçülen gövde satır aralığının ta kendisi.
      expect(Math.abs(v.taban - v.aralik), `${id}: taban ${String(v.taban)} ≠ aralık`).toBeLessThan(
        0.2
      )
      // ⚠ ⚠ **`yayik` MUAF ve muafiyet ÖLÇÜMLE alındı, varsayımla değil.** O yerleşimde
      // gövde `margin-top: auto` ile ÇERÇEVEYE yaslanıyor; boşluk bir ritim adımı değil,
      // başlık öbeğinden artan pay. Ritim kuralı AKAN blokları yönetir, çerçeveye
      // çivilenmiş bloğu çerçeve yönetir.
      // ⚠ Muafiyet bir gevşeme DEĞİL: yerine daha güçlü bir iddia geliyor. `donen`in dört
      // kartında gövdenin ALT kenarı ölçüldü — **1160 · 1160 · 1160 · 1160**, birebir aynı.
      // Üst kenar (1106/1052/1052/1052) başlığın satır sayısına göre oynuyor, alt kenar
      // oynamıyor: okuyucu kaydırırken gövde satırı yerinden KIPIRDAMIYOR. Katlık testi
      // bunu hiç ölçmüyordu.
      if (doc.yerlesim === 'yayik') {
        const alt = await withPage(async (page) => {
          await page.setViewportSize({
            width: doc.slaytGenisligi * doc.kartlar.length,
            height: doc.yukseklik,
          })
          await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
          await page.evaluate('(async () => { await document.fonts.ready; return true })()')
          await page.evaluate(puntoOlcumu(doc))
          return page.evaluate(
            '(() => Array.from(document.querySelectorAll(".govde")).map((e) => Math.round(e.getBoundingClientRect().bottom)))()'
          )
        })
        expect(alt.ok).toBe(true)
        if (!alt.ok) return
        const kenarlar = alt.value as number[]
        expect(kenarlar.length, `${id}: gövde taşıyan kart`).toBeGreaterThan(1)
        // ⚠ ⚠ **KAPANIŞ KARTI BU EŞİTLİKTEN MUAF ve muafiyet kuralın KENDİ gerekçesinden
        // geliyor.** Kural şunu söylüyordu: *"okuyucu kaydırırken gövde satırı yerinden
        // kıpırdamıyor."* O, GÖVDE kartları hakkında bir söz; kapanış kartı kaydırmanın
        // BİTTİĞİ yer. 300 px'lik varış rakamı ile 1250 px'lik gövde tabanı aynı kartta
        // duramıyor: `donen`de ölçüldü, gövde 1250'den 434'e çıkıyor.
        // ⚠ Muafiyet AÇIK ÇEK DEĞİL: kapanışın gövdesi ötekilerden YUKARIDA olmak
        // zorunda. Aşağı kayarsa bu bir kompozisyon kararı değil, bir kazadır.
        const kapanisli = doc.kartlar.map((k) => (k as { kapanis?: unknown }).kapanis !== undefined)
        const govdeli =
          kenarlar.length === doc.kartlar.length ? kapanisli : kapanisli.slice(0, kenarlar.length)
        const govde = kenarlar.filter((_, i) => govdeli[i] !== true)
        const kapanis = kenarlar.filter((_, i) => govdeli[i] === true)
        expect(govde.length, `${id}: kapanış dışı gövde kartı`).toBeGreaterThan(1)
        for (const k of govde) {
          expect(k, `${id}: gövde alt kenarı kartlar arasında oynuyor`).toBe(govde[0])
        }
        for (const k of kapanis) {
          expect(k, `${id}: kapanış gövdesi ötekilerin ALTINA kaydı`).toBeLessThan(
            govde[0] as number
          )
        }
        return
      }
      // Ve blok arası boşluk onun tam katı.
      const kat = v.bosluk / v.taban
      expect(
        Math.abs(kat - Math.round(kat)),
        `${id}: boşluk/taban = ${kat.toFixed(3)}`
      ).toBeLessThan(0.02)
    })
  }
})
