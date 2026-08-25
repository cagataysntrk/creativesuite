// OKUMA KONTRASTI — metin, ARKASINDA GERÇEKTEN BOYANAN yüzeye karşı ölçülür (FAZ-19.6).
//
// ⚠ ⚠ **FAZ MADDESİ DAR, AÇIK GENİŞTİ.** 19.6 *"marka mavisi üstüne beyaz gövde YASAK
// (4,07 < 4,5)"* diyordu. Önce o ihlal var mı diye ölçüldü — **hiçbir destede yoktu.** Ama
// aynı ölçüm daha genel bir açık buldu: gövde metni `--kart-soluk` ile çiziliyordu ve
// `editoryal` 4,12 · `alinti` 4,14 · `kavis` **3,16–3,42** veriyordu.
//
// ⚠ ⚠ **BU KAPI CSS AĞACINI YÜRÜMEZ ve sebebi acı bir derstir.** İlk iki ölçüm aleti
// yanlıştı: (a) `getComputedStyle` `oklch()`i ÇÖZMEDEN döndürüyor, dizgeden sayı çekmek
// 91 ögenin 91'ini "2,16" diye okudu; (b) zemini ağaçta yukarı yürüyerek aramak `alinti`
// k3'ün çağrısına **1,00** (görünmez) dedi — oysa şeritte apaçık okunuyor, çünkü o kartın
// gerçek yüzeyi bir SVG **alan sınırı**, CSS `background` değil. Doğru yol: elemanın
// kutusunu ekran görüntüsünden kesip **luminans histogramı** çıkarmak — çoğunluk zemin,
// uçtaki %2 metin.
//
// ⚠ Alet kalibre edildi: `karsilastirma` piksel yönteminde 6,92, bağımsız token probunda
// 7,30 — piksel yöntemi kenar yumuşatma yüzünden tutarlı biçimde **%5 düşük** okuyor. Eşik
// bu payla seçildi.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

/**
 * WCAG AA gövde eşiği 4,5 — ama alet %5 düşük okuduğu için tabana o pay veriliyor.
 *
 * ⚠ 4,2 keyfî değil: 4,5 × 0,95 ≈ 4,28. Ölçülen kusurlu hâller **2,45 · 3,16 · 3,29 ·
 * 4,12** bu tabanın hepsi ALTINDA, düzeltilmiş hâller **4,92 · 7,18 · 8,3+** hepsi
 * ÜSTÜNDE. Yani eşik iki kümeyi temiz ayırıyor ve hiçbirine yakın değil.
 */
const TABAN = 4.2

/** Bir kutunun içindeki metin ile zemini arasındaki WCAG oranı, PİKSELDEN. */
const OLC = `(() => {
  const kutular = []
  document.querySelectorAll('.kart').forEach((k, i) => {
    k.querySelectorAll('.govde, .liste-ad, .cubuk-not, .sayi-alt, .kapanis-cagri').forEach((e) => {
      const r = e.getBoundingClientRect()
      if (r.width < 8 || r.height < 6) return
      kutular.push({ k: i + 1, c: e.className.split(' ')[0], r })
    })
  })
  return kutular.map((b) => ({ k: b.k, c: b.c, x: Math.round(b.r.left), y: Math.round(b.r.top),
                               w: Math.round(b.r.width), h: Math.round(b.r.height) }))
})()`

describe('okuma kontrastı', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · metin arkasındaki YÜZEYE karşı ≥${String(TABAN)}`, async () => {
      const doc = olcumBelgesi(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        // ⚠ ⚠ **PANORAMA AÇILMADAN EKRAN GÖRÜNTÜSÜ ALINAMAZ — ve bu ilk sürümü ÇÖKERTTİ.**
        // `#sahne` bir slaytı gösterecek şekilde `translateX` ile kaydırılmış duruyor;
        // görüntü yalnız İLK kareyi içeriyordu, oysa kutu koordinatları BÜTÜN panoramanın
        // uzayında. Sonuç: ikinci karttan sonraki her kutu kadraj dışına düşüyor, kesilen
        // bölge tek renk oluyor ve oran **1,00** çıkıyordu. On destenin onu da kırmızıydı
        // ve hiçbiri gerçek değildi. `alan-siniri` kapısı aynı işi yıllardır doğru
        // yapıyor — çözüm oradan alındı: dönüşümü kaldır, kadrajı panorama kadar aç.
        await page.evaluate(
          '(() => { const s = document.querySelector("#sahne");' +
            ' s.style.transform = "none"; document.body.style.width = s.style.width })()'
        )
        await page.setViewportSize({
          width: doc.slaytGenisligi * o.kartlar.length,
          height: doc.yukseklik,
        })
        // ⚠ ÜÇ SAYFA ADIMI SIRAYLA — punto oturmadan ölçülen düzen yayınlanmayan düzendir.
        await page.evaluate(puntoOlcumu(doc))
        await page.evaluate(knockoutOlcumu())
        await page.evaluate(metinMaskesi())
        const kutular = (await page.evaluate(OLC)) as {
          k: number
          c: string
          x: number
          y: number
          w: number
          h: number
        }[]
        const png = await page.screenshot({ fullPage: false })
        return { kutular, png }
      })
      expect(r.ok, `ölçüm koşamadı: ${JSON.stringify(r.ok ? null : r.error)}`).toBe(true)
      if (!r.ok) return
      // ⚠ PNG tarayıcıda çözülüyor: node tarafında bir kod çözücü BAĞIMLILIĞI eklemek,
      // kırk satır kaçınılabilir kod demekti (bu depo bağımlılık eklemeden önce durur).
      const oranlar = await withPage(async (page) => {
        const b64 = r.value.png.toString('base64')
        return (await page.evaluate(
          `(async () => {
              const im = new Image()
              im.src = 'data:image/png;base64,${b64}'
              await im.decode()
              const cv = document.createElement('canvas')
              cv.width = im.width; cv.height = im.height
              const cx = cv.getContext('2d', { willReadFrequently: true })
              cx.drawImage(im, 0, 0)
              const lin = (c) => { const x = c / 255
                return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) }
              const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
              return ${JSON.stringify(r.value.kutular)}.map((b) => {
                const d = cx.getImageData(b.x, b.y, b.w, b.h).data
                const ls = []
                for (let i = 0; i < d.length; i += 4) ls.push(L(d[i], d[i + 1], d[i + 2]))
                ls.sort((a, z) => a - z)
                const n = ls.length
                const zem = ls[Math.floor(n / 2)]
                const alt = ls[Math.max(0, Math.floor(n * 0.02))]
                const ust = ls[Math.min(n - 1, Math.floor(n * 0.98))]
                const met = Math.abs(alt - zem) > Math.abs(ust - zem) ? alt : ust
                const o = (Math.max(zem, met) + 0.05) / (Math.min(zem, met) + 0.05)
                return { k: b.k, c: b.c, o }
              })
            })()`
        )) as { k: number; c: string; o: number }[]
      })
      expect(oranlar.ok, 'piksel çözümü koşamadı').toBe(true)
      if (!oranlar.ok) return
      expect(oranlar.value.length, `${id}: hiç metin kutusu bulunamadı`).toBeGreaterThan(0)
      const dusuk = oranlar.value
        .filter((x) => x.o < TABAN)
        .map((x) => `k${String(x.k)} ${x.c} ${x.o.toFixed(2)}`)
      expect(
        dusuk.join(' · '),
        `${id}: metin arkasındaki yüzeye karşı ${String(TABAN)}'nin altında — ` +
          'okunmayan metin, yazılmamış metindir'
      ).toBe('')
    }, 60_000)
  }
})
