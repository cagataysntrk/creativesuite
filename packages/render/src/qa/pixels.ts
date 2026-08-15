// Piksel örnekleme — Chromium üzerinden (§11.1 · D-110).
//
// **İkinci bir görüntü kütüphanesi YOK.** sharp/jimp/canvas eklemek ikinci bir PNG
// çözücü ve ikinci bir renk profili yorumu demektir; iki yorum farklı ΔE üretir ve
// hangisinin doğru olduğu ancak gözle bakarak anlaşılır. Chromium zaten var, zaten tek
// başlatıcıdan geçiyor ve `<canvas>` piksel erişimini standart olarak veriyor.
//
// **Örnekleme ızgarası, rastgele değil.** Rastgele örnekleme aynı görselde iki farklı
// QA sonucu üretir ve manifest'e yazılan sayı tekrar üretilemez olur (§13). Izgara
// deterministiktir: aynı görsel her zaman aynı sayıyı verir.

import { readFileSync } from 'node:fs'
import type { Rgb } from './deltae.js'
import { withPage, type BrowserResult } from '../browser.js'

export interface SampleOptions {
  /** Izgara kenarı: `48` → en çok 48×48 = 2304 örnek. Kare kök, çünkü ızgara iki boyutlu. */
  readonly grid?: number
  /**
   * Tam saydam pikselleri atla. PNG'de saydam alan bir renk DEĞİLDİR; siyah sayılırsa
   * her şeffaf kenarlı görsel "palet dışı siyah" ile dolu görünür.
   */
  readonly skipTransparent?: boolean
}

/**
 * PNG dosyasından ızgara örneği alır.
 *
 * Dosya `data:` URI olarak sayfaya gömülür — `file://` kullanılsaydı Chromium'un yerel
 * dosya politikası devreye girer ve sandbox'lı ortamda sessizce boş tuval üretirdi.
 * Boş tuval, "palet dışı %0" demektir: kapı yeşil, ölçüm hiç yapılmamış.
 */
export const samplePng = async (
  pngPath: string,
  opts: SampleOptions = {}
): Promise<BrowserResult<readonly Rgb[]>> => {
  const grid = opts.grid ?? 48
  const skipTransparent = opts.skipTransparent ?? true
  const b64 = readFileSync(pngPath).toString('base64')

  return withPage(async (page) => {
    // ⚠ Tarayıcı kodu **DİZE** olarak geçiyor, fonksiyon olarak değil.
    //
    // Sebebi tip sınırı: bu kod bu süreçte KOŞMUYOR, Chromium'da koşuyor. Fonksiyon
    // olarak yazmak `document` ve `Image`i bu paketin tip evrenine sokmayı gerektirir
    // (`lib: ["dom"]`) — ve o an Node tarafındaki bir kod da `document`e dokunabilir
    // hâle gelir, derleyici susar, hata çalışma zamanına kayar. `static.ts` de aynı
    // yöntemi kullanıyor; sınır tek biçimde çizilmiş olsun.
    const script = `(async () => {
      const img = new Image()
      img.src = "data:image/png;base64,${b64}"
      await img.decode()
      const c = document.createElement("canvas")
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext("2d")
      if (ctx === null) return { pixels: [], w: 0, h: 0 }
      ctx.drawImage(img, 0, 0)
      const adimX = Math.max(1, Math.floor(c.width / ${grid}))
      const adimY = Math.max(1, Math.floor(c.height / ${grid}))
      // Tüm tuvali TEK seferde oku: piksel başına getImageData çağrısı 2000 örnekte
      // saniyeler sürüyor ve render zaman aşımını tetikliyor.
      const tum = ctx.getImageData(0, 0, c.width, c.height).data
      const cikti = []
      for (let y = Math.floor(adimY / 2); y < c.height; y += adimY) {
        for (let x = Math.floor(adimX / 2); x < c.width; x += adimX) {
          const i = (y * c.width + x) * 4
          if (${skipTransparent ? 'true' : 'false'} && tum[i + 3] === 0) continue
          cikti.push([tum[i], tum[i + 1], tum[i + 2]])
        }
      }
      return { pixels: cikti, w: c.width, h: c.height }
    })()`

    const veri = (await page.evaluate(script)) as { pixels: number[][]; w: number; h: number }
    return veri.pixels.map(([r, g, bb]) => ({ r: r ?? 0, g: g ?? 0, b: bb ?? 0 }))
  })
}

/** PNG başlığından boyut — tarayıcı açmadan. IHDR sabit konumda. */
export const pngSize = (pngPath: string): { readonly w: number; readonly h: number } | null => {
  const b = readFileSync(pngPath)
  const imza = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (const [i, x] of imza.entries()) if (b[i] !== x) return null
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
}
