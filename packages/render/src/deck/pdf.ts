// Deck PDF çıktısı (§7.6 · R-30 · D-21, D-24 · FAZ-6.1).
//
// **ÜÇÜNCÜ RENDERER YOK.** Deck aynı Chromium'u, aynı `toHtml`i, aynı token CSS'ini
// kullanıyor; tek fark çağrılan API — `screenshot()` yerine `pdf()`. Gamma, Presenton
// ya da herhangi bir hazır deck üreticisi prospect'e giden hiçbir şeye dokunmaz (D-21):
// "size özel yazılım yaparız" diyen bir şirketin deck'i hazır bir şablon üreticisinden
// çıkıyorsa, iddia kendi çıktısıyla çürütülmüş olur.
//
// **Metin katmanı KORUNUR.** Düzleştirme KANALA aittir (§7.6): LinkedIn dökümanı
// (6.3) düzleştirilir çünkü LinkedIn'in görüntüleyicisi metin katmanlı PDF'lerde satır
// kırılmalarını bozuyor. Prospect deck'i okunan, kopyalanan, alıntılanan bir belgedir
// ve metnini kilitlemek okuyucuya zarar verir.
//
// **`deck.ir.json` KAYNAK, PDF build çıktısı** (§4c). Benzer bir deck geldiğinde LLM
// yeniden koşturulmaz; IR kopyalanıp düzenlenir — hem ucuz hem tutarlı.

import { validateDocument, type DocumentModel } from '@suite/kernel'
import { withPage, type BrowserResult } from '../browser.js'
import { toHtml } from '../static.js'
import { paginate, type CharBudget, type LayoutName } from '../layout/enum.js'
import { CHART_CSS } from '../charts/chart.js'
import { DIAGRAM_CSS } from '../charts/diagram.js'

export interface DeckPage {
  readonly doc: DocumentModel
  /** Bu sayfa tek başına sığmayan bir blok taşıyor mu — bölmek çözmez, metin kısalmalı. */
  readonly oversized: boolean
}

export interface DeckPdfResult {
  readonly path: string
  readonly pageCount: number
  /** Sığmayan blok taşıyan sayfaların indeksi. Boş değilse metin kısaltılmalı. */
  readonly oversizedPages: readonly number[]
}

/**
 * Deck IR'ını sayfalara böler.
 *
 * `paginate` YENİDEN YAZILMIYOR (D-204): sonsuz döngü koruması ve `oversized` işareti
 * tek yerde kalmalı. Deck yalnız kendi karakter bütçesini veriyor — sayfa boyutu
 * slayttan büyük olduğu için bütçe de geniş.
 */
export const deckPages = (
  doc: DocumentModel,
  layout: LayoutName,
  butce?: CharBudget
): readonly DeckPage[] =>
  paginate(doc.blocks, layout, butce).map((s) => ({
    doc: { ...doc, blocks: s.blocks },
    oversized: s.oversized,
  }))

/**
 * Sayfaları TEK HTML belgesine çevirir.
 *
 * Dışa açık, çünkü LinkedIn dökümanı (6.3) aynı gövdeyi sayfa sayfa kullanıyor. İkinci
 * bir HTML üreticisi yazmak, ikinci bir tipografi hata modu demekti (D-160 · R-30).
 */
export const deckHtml = (pages: readonly DeckPage[]): string => {
  const ilk = pages[0]!.doc
  const govde = pages
    .map((p, i) => {
      const html = toHtml(p.doc)
      const icerik = html.slice(html.indexOf('</style>') + '</style>'.length)
      return `<section class="deck-sayfa"${i === 0 ? '' : ' data-sonraki'}>${icerik}</section>`
    })
    .join('\n')

  return [
    '<!doctype html><meta charset="utf-8">',
    '<style>',
    ilk.tokenCss,
    'html, body { margin: 0; padding: 0; }',
    `.deck-sayfa { inline-size: ${ilk.width}px; block-size: ${ilk.height}px;`,
    '  background: var(--role-bg); color: var(--role-text);',
    '  font-family: "DejaVu Sans", system-ui, sans-serif;',
    '  display: flex; flex-direction: column; justify-content: center;',
    '  padding: 96px; box-sizing: border-box; }',
    // Sayfa sonu: ilk sayfadan SONRAKİLERİN önüne. `page-break-before` yerine
    // `break-before` — eski özellik Chromium'da `flex` içinde yok sayılıyor.
    '.deck-sayfa[data-sonraki] { break-before: page; }',
    'h1 { font-size: 72px; line-height: 1.12; margin: 0 0 24px; letter-spacing: -0.02em; }',
    'h2 { font-size: 48px; line-height: 1.18; margin: 0 0 16px; }',
    'p  { font-size: 34px; line-height: 1.45; margin: 0 0 16px; color: var(--role-text-muted); }',
    'img { max-width: 100%; height: auto; }',
    '.spacer.sm { height: 16px } .spacer.md { height: 40px } .spacer.lg { height: 88px }',
    CHART_CSS,
    DIAGRAM_CSS,
    '</style>',
    govde,
  ].join('\n')
}

/**
 * PDF üretir. Çıktı **yola yazılır**, byte döndürülmez: bellekte dolaşan byte'ların
 * nereye yazıldığı manifestte kaybolur (§13).
 *
 * Her sayfa AYRI bir `DocumentModel` ve hepsi tek PDF'e giriyor. Sayfa başına ayrı
 * dosya üretip sonra birleştirmek, ikinci bir araç (pdftk/ghostscript) demekti —
 * ve o araç ikinci bir tipografi hata modu getirirdi.
 */
export const renderDeckPdf = async (
  pages: readonly DeckPage[],
  outPath: string
): Promise<BrowserResult<DeckPdfResult>> => {
  if (pages.length === 0) {
    return { ok: false, error: { kind: 'render_failed', message: 'deck boş — sayfa yok' } }
  }
  for (const [i, p] of pages.entries()) {
    const d = validateDocument(p.doc)
    if (!d.ok) {
      return {
        ok: false,
        error: {
          kind: 'render_failed',
          message: `sayfa ${i + 1} geçersiz: ${JSON.stringify(d.errors)}`,
        },
      }
    }
  }

  const ilk = pages[0]!.doc
  const stil = deckHtml(pages)

  return withPage(async (page) => {
    await page.setViewportSize({ width: ilk.width, height: ilk.height })
    await page.setContent(stil, { waitUntil: 'load' })
    // Font yüklemesi tamamlanmadan PDF almak, glif fallback'iyle sessizce bozuk bir
    // belge demektir (§7.2) — ve PDF'te bu, ekran görüntüsünden daha zor fark edilir.
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')

    await page.pdf({
      path: outPath,
      width: `${ilk.width}px`,
      height: `${ilk.height}px`,
      // Arka plan rengi BASILIR: varsayılan `false`, marka zeminini beyaza çevirir ve
      // koyu yüzeydeki açık metin okunamaz hâle gelir.
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      pageRanges: `1-${pages.length}`,
    })

    return {
      path: outPath,
      pageCount: pages.length,
      oversizedPages: pages.flatMap((p, i) => (p.oversized ? [i] : [])),
    }
  })
}
