// Ürün ekran görüntüsü — GERÇEK çekim (§10 · §11.4 · R-32, R-33 · FAZ-6.8).
//
// **Uydurma bir dashboard, olgusal bir iddiadır.** Adı geçen bir prospect'e giden
// deck'te üretilmiş bir ürün ekranı, ürünün yapmadığı bir şeyi yaptığını söyler ve ilk
// demoda çöker. Kaynaksız sayısal iddia yasağının (R-32) görsel karşılığı budur:
// ekran görüntüsü de bir iddiadır ve kaynağı çalışan üründür.
//
// **Aynı Chromium** (R-30): çekim `withPage`ten geçiyor, ikinci bir tarayıcı yok.
//
// **`demos/<product>/` üçlüsüne bağlı** (§4c · FAZ-5.7): kalıcı olan PNG değil, onu
// üreten `demo-script.ts` + `timeline.json`. Ürün arayüzü değişince script güncellenir
// ve görüntü **yeniden çekilir** — tazelenmeyen bir ekran görüntüsü, altı ay sonra
// ürünün artık öyle görünmediği bir iddiadır.

import { withPage, type BrowserResult } from '../browser.js'
import type { PersonBasis } from '../compliance/claim.js'

export interface ProductShotInput {
  /** Çalışan ürünün adresi. Yerel demo ortamı ya da staging — üretim değil. */
  readonly url: string
  /** `demos/<product>/demo-script.ts#adim` — hangi akışın hangi adımı. */
  readonly demoRef: string
  /** Bu çekimi yapan çalıştırma. Manifest'e ve blob sidecar'ına yazılır (§13). */
  readonly captureRunId: string
  readonly outPath: string
  readonly width: number
  readonly height: number
  /**
   * Sayfa yerleştikten sonra beklenecek CSS seçicisi.
   *
   * **`waitForTimeout` KULLANILMIYOR:** sabit bekleme, yavaş bir makinede yarı yüklenmiş
   * bir ekran çeker ve o görüntü prospect'e gider. Seçici beklemek, "ne bekliyoruz"
   * sorusunu yazılı hâle getirir.
   */
  readonly readySelector: string
}

export interface ProductShot {
  readonly path: string
  readonly demoRef: string
  readonly captureRunId: string
  readonly width: number
  readonly height: number
}

/**
 * Ürün ekranını çeker.
 *
 * Dönüş `ProductShot`; uyum iddiası ÇAĞIRANDA kurulur (`assertCompliance` +
 * `productCaptureBasis`). Ayrım bilinçli: bu fonksiyon bir görüntü üretir, iddia kurmaz
 * — iddiayı üreten kodun kendisi kurarsa, iddia kendi kendini onaylamış olur.
 */
export const captureProductShot = async (
  input: ProductShotInput
): Promise<BrowserResult<ProductShot>> =>
  withPage(async (page) => {
    await page.setViewportSize({ width: input.width, height: input.height })
    await page.goto(input.url, { waitUntil: 'load' })
    await page.waitForSelector(input.readySelector)
    // Font yüklemesi bitmeden çekim, glif fallback'iyle bozuk bir ekran demektir (§7.2).
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.screenshot({ path: input.outPath, type: 'png' })
    return {
      path: input.outPath,
      demoRef: input.demoRef,
      captureRunId: input.captureRunId,
      width: input.width,
      height: input.height,
    }
  })

/** Çekimden uyum dayanağı üretir. Dayanak çekimin KENDİ verisinden gelir, beyandan değil. */
export const productCaptureBasis = (shot: ProductShot): PersonBasis => ({
  kind: 'product_capture',
  captureRunId: shot.captureRunId,
  demoRef: shot.demoRef,
})

export type ProductShotRefusal =
  { readonly kind: 'not_captured'; readonly reason: string } | { readonly kind: 'ai_generated' }

/**
 * Bir görüntünün ürün ekranı olarak KULLANILABİLİR olup olmadığına karar verir.
 *
 * `deckte kullanılabilir mi` sorusunun tek cevabı budur ve `inspectManifest` aynı
 * kuralı yayın yükleminde tekrar sorar — iki kontrol noktası değil, aynı kuralın
 * üretim ve yayın anındaki iki uygulaması.
 */
export const usableAsProductShot = (meta: {
  readonly aiGenerated?: unknown
  readonly basis?: { readonly kind?: unknown }
}): true | ProductShotRefusal => {
  if (meta.aiGenerated === true) return { kind: 'ai_generated' }
  if (meta.basis?.kind !== 'product_capture') {
    return {
      kind: 'not_captured',
      reason: `dayanak 'product_capture' değil (${String(meta.basis?.kind ?? 'yok')})`,
    }
  }
  return true
}
