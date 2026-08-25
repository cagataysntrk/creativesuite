// KAPANIŞ KARESİ TEK YÜZEYDİR — dev rakam iki tonun arasında bölünemez (FAZ-19.7).
//
// ⚠ ⚠ **DEPO SAHİBİNİN ŞİKÂYETİ, İKİNCİ KEZ.** On kapanış karesi yan yana konup bakıldı:
// *"son sayfalardaki büyük sayılar çok kötü duruyorlar"* ve *"alttan akan son sayfalara
// doğru yazılara giriyor"*. Ölçüldü — ON kapanışın ÜÇÜNDE taşıyıcı dev rakamın içinden
// geçiyordu: `veri-hikayesi`nde eğri dolgusu **%88**, `kavis`te kemerler **%100**,
// `dizin`de ok bandı **%100**.
//
// ⚠ ⚠ **ESKİ KURAL YETMEDİ ÇÜNKÜ İKİ TİP İÇİN YAZILMIŞTI, BEŞ TİP VARDI.**
// `kapanis-temiz` yalnız `egri` noktalarını ve `alanSiniri` yüksekliğini sınıyordu;
// `kemer` · `ok` · eğrinin DOLGUSU kapsam dışındaydı. Nokta listesini kısaltmak da
// çözmezdi: dolgu ve tekrar eden yay son noktadan SONRA da çiziliyor.
//
// ⚠ Çözüm veri değil KATMAN düzeyinde oldu — taşıyıcı katmanı son karenin genişliği kadar
// kırpılıyor. Bu kapı da tipten bağımsız: **rakamın arkasındaki yüzey TEK TON olmalı.**
// Yarın altıncı bir taşıyıcı eklense, kural onu da kendiliğinden kapsar.
//
// ⚠ ⚠ **ÖLÇÜM RAKAMI GİZLEYEREK YAPILIYOR.** Glif pikselleri arka planı kirletiyordu;
// `visibility: hidden` ile rakam kaldırılıp ARDINDAKİ yüzey doğrudan okunuyor. Model
// varsayımı yok, piksel var.

import { describe, expect, it } from 'vitest'
import { withPage } from './browser.js'
import { ORNEKLER } from './katalog-ornek.js'
import { olcumBelgesi } from './olcum-belgesi.js'
import { knockoutOlcumu, metinMaskesi, panoramaHtml, puntoOlcumu } from './panorama.js'

/**
 * Rakamın ardındaki yüzeyde izin verilen en büyük ton farkı (0–255 luminans).
 *
 * ⚠ ⚠ **38 ÖLÇÜLDÜ — ve ilk yazılan 26 TAHMİNDİ, kapı onu hemen yalanladı.** Eşiği
 * ölçmeden yazmak tam da bu defterde üç kez eleştirilen şeydi; kapı on destede de kırmızı
 * dönünce gerçek sayılar alındı.
 *
 * Kırık hâl (taşıyıcı kapanış karesini kat ederken): `kavis` **61** · `veri-hikayesi`
 * **50**. Düzeltilmiş hâl: en yüksek **28** (`kavis` — beton greni), sonra 24 · 24 · 23 ·
 * 21 · 18 · 17 · 16 · 4. Yani DOKU en fazla 28, SINIR en az 50 üretiyor.
 *
 * 38 ikisinin ortasında: sağlıklı tarafa **%36**, kusurlu tarafa **%24** pay bırakıyor.
 * Dokuyu sınır sanmıyor, sınırı doku sanmıyor.
 */
const TON_TAVANI = 38

const OLC = `(() => {
  const e = document.querySelector('.kapanis-rakam')
  if (!e) return null
  const r = e.getBoundingClientRect()
  e.style.visibility = 'hidden'
  const alt = document.querySelector('.kapanis-rakam-alt')
  if (alt) alt.style.visibility = 'hidden'
  // Anahtarlar width/height olmak ZORUNDA: Playwright clip w/h kabul etmiyor ve
  // "expected float, got undefined" diye patlıyor. İlk sürüm tam buradan çöktü.
  return { x: Math.round(r.left), y: Math.round(r.top),
           width: Math.round(r.width), height: Math.round(r.height) }
})()`

describe('kapanış yüzeyi', () => {
  for (const [id, o] of Object.entries(ORNEKLER)) {
    it(`${id} · dev rakamın ardındaki yüzey TEK TON`, async () => {
      const doc = olcumBelgesi(o)
      const r = await withPage(async (page) => {
        await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
        await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        // ⚠ Panorama AÇILIYOR: kaydırılmış sahnede son karenin pikselleri kadraj dışında
        // kalır ve ölçüm tek renk okur (bu tuzağa `okuma-kontrasti` yazılırken düşüldü).
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
        const kutu = (await page.evaluate(OLC)) as {
          x: number
          y: number
          width: number
          height: number
        } | null
        if (kutu === null) return null
        const png = await page.screenshot({ clip: kutu })
        return png.toString('base64')
      })
      expect(r.ok, `${id}: ölçüm koşamadı`).toBe(true)
      if (!r.ok || r.value === null) return
      const yayilim = await withPage(async (page) => {
        return (await page.evaluate(
          `(async () => {
              const im = new Image()
              im.src = 'data:image/png;base64,${r.value}'
              await im.decode()
              const cv = document.createElement('canvas')
              cv.width = im.width; cv.height = im.height
              const cx = cv.getContext('2d', { willReadFrequently: true })
              cx.drawImage(im, 0, 0)
              const d = cx.getImageData(0, 0, im.width, im.height).data
              const ls = []
              for (let i = 0; i < d.length; i += 4)
                ls.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])
              ls.sort((a, b) => a - b)
              // ⚠ Uçtaki %2 atılıyor: gren tanesi ve kenar pikseli bir SINIR değildir.
              const a = ls[Math.floor(ls.length * 0.02)]
              const b = ls[Math.floor(ls.length * 0.98)]
              return Math.round(b - a)
            })()`
        )) as number
      })
      expect(yayilim.ok, `${id}: piksel çözümü koşamadı`).toBe(true)
      if (!yayilim.ok) return
      expect(
        yayilim.value,
        `${id}: dev rakamın ardındaki yüzeyde ${String(yayilim.value)} tonluk fark var — ` +
          'bir taşıyıcı kapanış karesini kat ediyor ve rakamı ikiye bölüyor'
      ).toBeLessThanOrEqual(TON_TAVANI)
    }, 60_000)
  }
})
