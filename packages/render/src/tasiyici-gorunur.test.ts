// Süreklilik taşıyıcısı GÖRÜNÜR — atmosfer değil, yüzey adımı (R-109 · D-341).
//
// ⚠ ⚠ **ÜÇ TAŞIYICI DA ÇİZİLİYORDU AMA GÖRÜNMÜYORDU** ve hiçbir kapı bunu söylemiyordu,
// çünkü hiçbir kapı *"taşıyıcı görünüyor mu"* diye sormuyordu. `kesintisizlik-yok` yalnız
// kesimde bir öge VAR MI diye bakıyor — o öge şeffafsa da "var" diyor.
//
// ⚠ Kural iki katmanda: işaretleme SÖZLEŞMESİ (degrade yok, alt piksel çizgi yok) ve
// GERÇEK PİKSEL (iki alan birbirinden ayrışıyor mu).

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { panoramaHtml, type PanoramaBelgesi } from './panorama.js'

type Ornek = (typeof ORNEKLER)[keyof typeof ORNEKLER]
const belge = (o: Ornek): PanoramaBelgesi =>
  // ⚠ Ölçüm belgesi TEK yerden (`olcum-belgesi.ts`): belirteç + font + logo + damga.
  // Yedek fontla ölçen bir kapı, yayınlanmayan bir düzeni denetler.
  olcumBelgesi(o)

describe('taşıyıcı görünür', () => {
  // ⚠ D-318 degradeyi, glow'u ve atmosferik rengi EMEKLİ ETTİ — ama `egri` bandı
  // kararın ardından da bir `linearGradient` taşımaya devam etti. Karar verildi,
  // uygulama takip etmedi; bu kapı o boşluğu kapatıyor.
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · degrade yok, alt piksel çizgi yok`, () => {
      const html = panoramaHtml(belge(o))
      expect(html, `${id}: degrade emekli (D-318)`).not.toContain('linearGradient')
      expect(html, `${id}: radyal degrade emekli`).not.toContain('radialGradient')
      // ⚠ `non-scaling-stroke` genişliği CİHAZ pikseline çeviriyor: 1'in altı alt piksele
      // düşüp KAYBOLUYOR. D-319'da 0,12, burada 0,22 — aynı hata iki kez.
      for (const m of html.matchAll(/stroke-width="([\d.]+)"[^>]*non-scaling-stroke/g)) {
        expect(
          Number(m[1]),
          `${id}: stroke-width ${String(m[1])} cihaz pikselinde`
        ).toBeGreaterThanOrEqual(1)
      }
      for (const m of html.matchAll(/non-scaling-stroke[^>]*stroke-width="([\d.]+)"/g)) {
        expect(Number(m[1]), `${id}: stroke-width ${String(m[1])}`).toBeGreaterThanOrEqual(1)
      }
    })
  }

  // ── gerçek piksel: sınır GÖRÜNÜYOR mu ──────────────────────────────────
  //
  // ⚠ ⚠ **İLK ÖLÇÜM YANLIŞ ŞEYE BAKTI: iki alanın MEDYAN farkına.** O ölçüt `editoryal`i
  // kırmızıya döndürdü (ΔL 5) — oysa o şablonun genliği KASTEN nazik ("sesi sessiz, keskin
  // bir bölme onu memphis yapardı") ve sınırı hairline taşıyor. Kural iki aygıttan birini
  // istiyor: yüzey adımı YA DA çizilmiş kenar. Medyan farkı yalnız birincisini görüyor.
  //
  // Doğru ölçü KENAR GÜCÜ: dokuz dikey sütunda, komşu piksellerin en büyük luma sıçraması.
  // Adım da hairline da bir sıçrama üretiyor; ikisi de yoksa sıçrama yok.
  //
  // ⚠ Kartlar ve bantlar GİZLENİYOR: ölçülen şey alan katmanının kendisi. Aksi hâlde
  // başlığın kenarı her şablonu "görünür" gösterirdi.
  const alanli = Object.entries(ORNEKLER).filter(([, o]) => o.alanSiniri !== undefined)

  it('alan sınırı taşıyan her şablonda sınır GÖRÜNÜYOR', async () => {
    expect(alanli.length).toBeGreaterThan(2)
    for (const [id, o] of alanli) {
      const doc = belge(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate(
          `(() => { const s = document.createElement('style');
            s.textContent = '.kart, .bant, .bant-kemer, .bant-ok, .gorsel, .gorsel-yer { visibility: hidden }';
            document.head.appendChild(s) })()`
        )
        const png = await page.screenshot()
        return page.evaluate(`(async () => {
          const im = new Image()
          im.src = 'data:image/png;base64,${png.toString('base64')}'
          await im.decode()
          const c = document.createElement('canvas')
          c.width = im.width; c.height = im.height
          const x = c.getContext('2d')
          x.drawImage(im, 0, 0)
          const d = x.getImageData(0, 0, c.width, c.height).data
          const L = (px, py) => {
            const i = (py * c.width + px) * 4
            return 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]
          }
          const kenarlar = []
          for (let k = 1; k <= 9; k += 1) {
            const px = Math.round(c.width * k / 10)
            let en = 0
            for (let py = 8; py < c.height - 6; py += 1) {
              en = Math.max(en, Math.abs(L(px, py) - L(px, py + 3)))
            }
            kenarlar.push(en)
          }
          kenarlar.sort((a, b) => a - b)
          return Math.round(kenarlar[Math.floor(kenarlar.length / 2)])
        })()`)
      })
      expect(r.ok, id).toBe(true)
      if (!r.ok) continue
      // ⚠ Eşik 25 ÖLÇÜLEREK seçildi: dört şablonun kenar medyanları 44 · 57 · 60 · 230,
      // en zayıf tek sütun 34. `akan-alan` düzeltmeden ÖNCE ~8 idi (ΔL 0,03, hairline yok).
      // 25, iki kümenin arasında.
      expect(r.value as number, `${id}: sınır kenar gücü`).toBeGreaterThanOrEqual(25)
    }
  })
})
