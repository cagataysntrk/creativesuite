// LinkedIn dökümanı — DÜZLEŞTİRİLMİŞ PDF (§9.3 · §7.6 · FAZ-6.3).
//
// **Neden yalnız burası düzleşiyor.** Prospect deck'i metin katmanını korur (D-207);
// LinkedIn'in kendi görüntüleyicisi metin katmanlı PDF'lerde satır kırılmalarını bozuyor
// ve okuyucu bozuk gördüğünü bize söyleyemez. Düzleştirme bir maliyettir (metin
// seçilemez, arama motoru okuyamaz, ekran okuyucu kaybeder) ve yalnız onu gerektiren
// kanalda ödenir.
//
// **İkinci araç YOK.** pdftk/ghostscript/qpdf çağırmıyoruz: her sayfa aynı Chromium'da
// ekran görüntüsüne çevriliyor, görüntüler yine aynı Chromium'da tek PDF'e basılıyor
// (R-30). Harici bir PDF aracı, ikinci bir renk profili ve ikinci bir font gömme yolu
// demekti — ve ikisi de sessizce bozar.
//
// **Erişilebilirlik kaybı BEYAN EDİLİR.** Düzleştirilmiş bir sayfada ekran okuyucu
// hiçbir şey bulamaz; bu yüzden her görüntü sayfanın kendi metninden türetilen bir
// `alt` taşıyor. Kaybı telafi etmiyor ama gizlemiyor da (R-34 ailesi).

import type { Block } from '@suite/kernel'
import { withPage, type BrowserResult } from '../browser.js'
import { deckHtml, type DeckPage } from './pdf.js'

/**
 * Editoryal sayfa tavanı — **platform sınırı DEĞİL**.
 *
 * LinkedIn'in gerçek döküman sınırı bu koda girmedi, çünkü doğrulanmadı (V-23);
 * uydurulmuş bir platform sayısı, `sourceUrl` + `verifiedAt` taşıyan spec tablosunun
 * (§9.1) tamamını değersizleştirirdi. 10 sayfa BİZİM kararımız: on birinci sayfaya
 * kadar okunan bir LinkedIn dökümanı yok.
 */
export const LINKEDIN_DOC_MAX_SAYFA = 10

/**
 * Kalite merdiveni (§9.3). Sınırın altına inene kadar aşağı iner.
 *
 * Meta'nın 30 MB'ına göre ayarlanmış tek bir hat, LinkedIn'in reddedeceği dosyaları
 * sessizce üretir — o yüzden tavan burada, üretim anında zorlanıyor.
 */
export const KALITE_MERDIVENI = [92, 82, 72, 62] as const
export const VARSAYILAN_BAYT_TAVANI = 5 * 1024 * 1024

export interface LinkedinDocResult {
  readonly path: string
  readonly pageCount: number
  /** Merdivenin hangi basamağında durulduğu. Manifest'e yazılır (§13). */
  readonly quality: number
  readonly bytes: number
}

export type LinkedinDocError =
  | { readonly kind: 'empty' }
  | { readonly kind: 'too_many_pages'; readonly count: number; readonly max: number }
  /** Merdivenin en alt basamağı bile tavanı geçmiyorsa: sessizce yayınlanmaz. */
  | { readonly kind: 'too_large'; readonly bytes: number; readonly max: number }

/** Sayfanın metninden `alt` üretir — düzleştirmenin sildiği şeyin yerine konan şey. */
const sayfaAlt = (bloklar: readonly Block[], no: number): string => {
  const metin = bloklar
    .map((b) =>
      b.type === 'heading' || b.type === 'body' ? b.text : b.type === 'chart' ? b.title : ''
    )
    .filter((t) => t !== '')
    .join(' · ')
  return metin === '' ? `Sayfa ${no}` : `Sayfa ${no}: ${metin}`
}

/**
 * Düzleştirilmiş döküman üretir.
 *
 * Sayfa sayısı tavanı **üretimden ÖNCE** kontrol ediliyor: on bir sayfalık bir belgeyi
 * render edip sonra reddetmek, harcanmış Chromium zamanı ve kullanıcıya geç gelen bir
 * "hayır" demektir.
 */
export const renderLinkedinDocument = async (
  pages: readonly DeckPage[],
  outPath: string,
  opts: { readonly maxBytes?: number } = {}
): Promise<BrowserResult<LinkedinDocResult | LinkedinDocError>> => {
  if (pages.length === 0) return { ok: true, value: { kind: 'empty' } }
  if (pages.length > LINKEDIN_DOC_MAX_SAYFA) {
    return {
      ok: true,
      value: { kind: 'too_many_pages', count: pages.length, max: LINKEDIN_DOC_MAX_SAYFA },
    }
  }

  const tavan = opts.maxBytes ?? VARSAYILAN_BAYT_TAVANI
  const ilk = pages[0]!.doc

  return withPage(async (page) => {
    const { statSync } = await import('node:fs')
    await page.setViewportSize({ width: ilk.width, height: ilk.height })

    let sonBayt = Number.POSITIVE_INFINITY
    for (const kalite of KALITE_MERDIVENI) {
      // ── 1. her sayfa AYRI ekran görüntüsü ──
      const gorseller: string[] = []
      for (const [i, p] of pages.entries()) {
        await page.setContent(deckHtml([p]), { waitUntil: 'load' })
        await page.evaluate('(async () => { await document.fonts.ready; return true })()')
        const png = await page.screenshot({ type: 'jpeg', quality: kalite })
        const alt = sayfaAlt(p.doc.blocks, i + 1).replace(/"/g, '&quot;')
        gorseller.push(
          `<img src="data:image/jpeg;base64,${png.toString('base64')}" alt="${alt}"${i === 0 ? '' : ' data-sonraki'}>`
        )
      }

      // ── 2. görüntüler tek PDF'e ──
      const html = [
        '<!doctype html><meta charset="utf-8">',
        '<style>html,body{margin:0;padding:0}',
        `img{display:block;inline-size:${ilk.width}px;block-size:${ilk.height}px}`,
        'img[data-sonraki]{break-before:page}</style>',
        gorseller.join(''),
      ].join('')
      await page.setContent(html, { waitUntil: 'load' })
      await page.pdf({
        path: outPath,
        width: `${ilk.width}px`,
        height: `${ilk.height}px`,
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })

      sonBayt = statSync(outPath).size
      if (sonBayt <= tavan) {
        return { path: outPath, pageCount: pages.length, quality: kalite, bytes: sonBayt }
      }
    }

    // Merdiven bitti, hâlâ büyük. Dosya diskte duruyor ama SONUÇ hata: yayınlanabilir
    // sanılan bir dosya, reddedilen bir dosyadan tehlikelidir.
    return { kind: 'too_large' as const, bytes: sonBayt, max: tavan }
  })
}

export const isLinkedinDocError = (
  r: LinkedinDocResult | LinkedinDocError
): r is LinkedinDocError => 'kind' in r
