// HEDEF: packages/render/src/static.ts
//
// Belge modeli → HTML → PNG (§7.1 · R-30, R-23).
//
// **Taşma BÖLER, asla küçültmez.** Sığdırmak için tipi küçültmek, makine üretimi
// kreatifin bir numaralı görsel işaretidir (§7.1) — o yüzden `fitText` benzeri
// hiçbir şey YAZILMAYACAK. Sığmayan içerik bir sonraki slayda taşar; bu bir kısıt
// değil, tasarım kararı.
//
// **Türkçe genişleme payı yapısal** (R-23): sabit genişlik yok, satır yüksekliği
// gevşiyor. "Onayla" sığar ama gerçek etiket "Onayla ve depoya işle" olur.

import { validateDocument, type Block, type DocumentModel } from '@suite/kernel'
import { withPage, type BrowserResult } from './browser.js'

/** HTML kaçışı — metin İÇERİK, işaretleme değil. Kullanıcı metni etiket açamaz. */
const kacir = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const blokHtml = (b: Block): string => {
  switch (b.type) {
    case 'heading':
      return `<h${b.level}>${kacir(b.text)}</h${b.level}>`
    case 'body':
      return `<p>${kacir(b.text)}</p>`
    case 'image':
      // `alt` her zaman yazılır; dekoratif görselde BOŞ alt + `aria-hidden` doğru
      // biçimdir (ekran okuyucu atlar), alt'ı hiç yazmamak değil.
      return b.decorative
        ? `<img src="${kacir(b.src)}" alt="" aria-hidden="true">`
        : `<img src="${kacir(b.src)}" alt="${kacir(b.alt)}">`
    case 'spacer':
      return `<div class="spacer ${b.size}"></div>`
  }
}

/**
 * Belge modelini HTML'e çevirir.
 *
 * Token CSS'i `<style>` içine GÖMÜLÜR, link edilmez: harici bir dosya, render anında
 * yüklenemezse sessizce varsayılan renklerle çıktı üretir — ve o çıktı "marka dışı"
 * olduğunu kimseye söylemez.
 */
export const toHtml = (doc: DocumentModel): string =>
  [
    '<!doctype html><meta charset="utf-8">',
    '<style>',
    doc.tokenCss,
    `  html, body { margin: 0; padding: 0; }`,
    `  body { width: ${doc.width}px; height: ${doc.height}px; background: var(--role-bg);`,
    `         color: var(--role-text); font-family: "DejaVu Sans", system-ui, sans-serif;`,
    `         display: flex; flex-direction: column; justify-content: center;`,
    `         padding: 96px; box-sizing: border-box; }`,
    // Sabit genişlik YOK (R-23): Türkçe etiket İngilizcesinden ~%20 uzun.
    `  h1 { font-size: 72px; line-height: 1.12; margin: 0 0 24px; letter-spacing: -0.02em; }`,
    `  h2 { font-size: 48px; line-height: 1.18; margin: 0 0 16px; }`,
    `  p  { font-size: 34px; line-height: 1.45; margin: 0 0 16px; color: var(--role-text-muted); }`,
    `  img { max-width: 100%; height: auto; }`,
    `  .spacer.sm { height: 16px } .spacer.md { height: 40px } .spacer.lg { height: 88px }`,
    '</style>',
    doc.blocks.map(blokHtml).join('\n'),
  ].join('\n')

/**
 * PNG üretir. Çıktı **yola yazılır**, byte döndürülmez: bir varlığın byte'ları
 * bellekte dolaşırsa nereye yazıldığı manifestte kaybolur (§13).
 */
export const renderStatic = async (
  doc: DocumentModel,
  outPath: string
): Promise<
  BrowserResult<{ readonly path: string; readonly width: number; readonly height: number }>
> => {
  const dogrulama = validateDocument(doc)
  if (!dogrulama.ok) {
    return {
      ok: false,
      error: {
        kind: 'render_failed',
        message: `belge geçersiz: ${JSON.stringify(dogrulama.errors)}`,
      },
    }
  }

  return withPage(async (page) => {
    await page.setViewportSize({ width: doc.width, height: doc.height })
    await page.setContent(toHtml(doc), { waitUntil: 'load' })
    // Font yüklemesi TAMAMLANMADAN ekran görüntüsü almak, glif fallback'iyle
    // üretilmiş sessizce bozuk bir varlık demektir (§7.2).
    //
    // `document.fonts.ready` bir `FontFaceSet`e çözülür ve Playwright onu SERİLEŞTİREMEZ —
    // doğrudan döndürmek çağrıyı hata ile düşürürdü. Beklenen şey promise, taşınan bayrak.
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.screenshot({ path: outPath, type: 'png' })
    return { path: outPath, width: doc.width, height: doc.height }
  })
}
