// Golden tipografi metrikleri (§7.2, §15 · R-31 · D-144).
//
// **Commit edilen golden bir PNG değil, JSON METRİKTİR.** İki gerekçe:
// git'e binary girmez (R-64) ve metrik antialiasing gürültüsünden etkilenmez — aynı
// Chromium'un iki sürümü aynı metni bir piksel kaydırabilir, ama glyph ilerleme
// genişliğini kaydırmaz.
//
// **Yakalamak istediğimiz hata: sessiz glyph fallback.** Konteyner içinde marka fontu
// yüklenmezse tarayıcı sessizce başka bir fonta düşer; çıktı "biraz farklı" görünür ve
// kimse fark etmez. `ğ ü ş ı ö ç İ` içeren bir metinde bu, bozuk bir markadır.
//
// **`notdef` tespiti ölçümle, tahminle değil.** Bir glyph eksikse tarayıcı ya fallback
// fonttan çizer ya `.notdef` kutusu koyar. İkisi de aynı imzayı bırakır: karakterin
// ilerleme genişliği, ÖZEL KULLANIM ALANINDAKİ (U+E000) kesinlikle tanımsız bir
// karakterinkiyle aynı olur. O karşılaştırma bu dosyanın çekirdeği.
//
// ⚠ **Bu harness font-AGNOSTİKTİR.** V-02 (marka fontu lisansı) metriği DONDURMAYI
// engeller, harness'ı yazmayı değil: `notdef = 0` hangi fontun lisanslandığına bağlı
// değil. Bugün sistem fontuyla ölçüyor; font geldiğinde temel yeniden alınır.

import type { DocumentModel } from '@suite/kernel'
import { withPage, type BrowserResult } from '../browser.js'
import { toHtml } from '../static.js'

/** Türkçe kanıt dizesi. Diacritics kapısının tamamı bu satırda. */
export const PROOF_TEXT = 'ĞÜŞİÖÇ ğüşıöç Ağrı İğne'

export interface GlyphMetric {
  readonly char: string
  /** Karakterin ilerleme genişliği, px. Font değişince bu değişir. */
  readonly advance: number
  /** Bu karakter eksik mi — `.notdef` ya da fallback. */
  readonly missing: boolean
}

export interface TextMetric {
  readonly text: string
  /** Çözülmüş font ailesi — tarayıcının GERÇEKTEN kullandığı, CSS'te yazan değil. */
  readonly fontFamily: string
  readonly fontSize: number
  /** Satır sayısı: taşma bölmenin (§7.1) çalıştığının kanıtı. */
  readonly lineCount: number
  readonly width: number
  readonly height: number
  readonly glyphs: readonly GlyphMetric[]
}

export interface GoldenMetrics {
  readonly proofText: string
  readonly canvas: { readonly width: number; readonly height: number }
  readonly blocks: readonly TextMetric[]
  /** **Sıfır olmak ZORUNDA** (R-31). Sıfır değilse font sessizce düşmüş. */
  readonly notdefCount: number
}

/**
 * Belgeyi render eder ve tipografi metriklerini ÖLÇER.
 *
 * Ölçüm tarayıcıda: `Range.getClientRects()` satır kutularını, `measureText` ilerleme
 * genişliklerini verir. Node tarafında hesaplamak, tarayıcının gerçekte ne yaptığını
 * TAHMİN etmek olurdu — ve tam da tahmin edilemeyen şey (fallback) aranan hata.
 */
export const measureGolden = async (doc: DocumentModel): Promise<BrowserResult<GoldenMetrics>> =>
  withPage(async (page) => {
    await page.setViewportSize({ width: doc.width, height: doc.height })
    await page.setContent(toHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')

    // ⚠ Tarayıcı kodu DİZE olarak geçiyor: bu kod bu süreçte koşmuyor ve `document`i
    // bu paketin tip evrenine sokmak, Node tarafındaki bir hatayı sessizleştirirdi.
    const script = `(() => {
      // U+E000 özel kullanım alanı: hiçbir fontta tanımlı DEĞİL. İlerleme genişliği,
      // "eksik glyph" imzasının referansıdır.
      const YOK = '\\uE000'

      const olcumTuvali = document.createElement('canvas').getContext('2d')

      const blocks = []
      let notdef = 0

      for (const el of document.querySelectorAll('h1, h2, p')) {
        const metin = el.textContent || ''
        if (metin.trim() === '') continue
        const st = getComputedStyle(el)
        olcumTuvali.font = st.font || (st.fontSize + ' ' + st.fontFamily)

        const yokGenislik = olcumTuvali.measureText(YOK).width

        const glyphs = []
        for (const ch of [...metin]) {
          if (ch === ' ') continue
          const w = olcumTuvali.measureText(ch).width
          // Eksik glyph, tanımsız karakterle AYNI genişliği verir. Eşik yok: eşitlik.
          const missing = Math.abs(w - yokGenislik) < 0.01
          if (missing) notdef++
          glyphs.push({ char: ch, advance: Math.round(w * 100) / 100, missing })
        }

        // Satır sayısı: metnin kaç satır kutusu kapladığı.
        const aralik = document.createRange()
        aralik.selectNodeContents(el)
        const kutular = aralik.getClientRects()
        const r = el.getBoundingClientRect()

        blocks.push({
          text: metin,
          // Çözülmüş aile: tarayıcının GERÇEKTEN kullandığı.
          fontFamily: st.fontFamily,
          fontSize: parseFloat(st.fontSize),
          lineCount: kutular.length,
          width: Math.round(r.width * 100) / 100,
          height: Math.round(r.height * 100) / 100,
          glyphs,
        })
      }
      return { blocks, notdefCount: notdef }
    })()`

    const olcum = (await page.evaluate(script)) as {
      blocks: TextMetric[]
      notdefCount: number
    }

    return {
      proofText: PROOF_TEXT,
      canvas: { width: doc.width, height: doc.height },
      blocks: olcum.blocks,
      notdefCount: olcum.notdefCount,
    }
  })

export type MetricDiff =
  | { readonly kind: 'notdef'; readonly count: number }
  | { readonly kind: 'block_count'; readonly expected: number; readonly actual: number }
  | {
      readonly kind: 'font_family'
      readonly block: number
      readonly expected: string
      readonly actual: string
    }
  | {
      readonly kind: 'line_count'
      readonly block: number
      readonly expected: number
      readonly actual: number
    }
  | {
      readonly kind: 'advance'
      readonly block: number
      readonly char: string
      readonly expected: number
      readonly actual: number
    }

/**
 * Ölçülen metriği dondurulmuş temelle karşılaştırır.
 *
 * **`notdef` her koşulda hata** — temel olsun olmasın. Diğer farklar ancak bir temel
 * varsa anlamlıdır; temelsiz bir "fark" yoktur, yalnız bir ilk ölçüm vardır.
 *
 * İlerleme genişliğinde **tolerans yok** (eşik 0,01px): metrik antialiasing'den
 * etkilenmiyor, o yüzden bir sapma gerçek bir font değişikliğidir. Tolerans vermek,
 * yakalamak için yazdığımız hatayı geçirmek olurdu.
 */
export const diffMetrics = (
  baseline: GoldenMetrics | null,
  actual: GoldenMetrics
): readonly MetricDiff[] => {
  const farklar: MetricDiff[] = []
  if (actual.notdefCount > 0) farklar.push({ kind: 'notdef', count: actual.notdefCount })
  if (baseline === null) return farklar

  if (baseline.blocks.length !== actual.blocks.length) {
    farklar.push({
      kind: 'block_count',
      expected: baseline.blocks.length,
      actual: actual.blocks.length,
    })
    return farklar
  }

  for (const [i, b] of baseline.blocks.entries()) {
    const a = actual.blocks[i] as TextMetric
    if (b.fontFamily !== a.fontFamily) {
      farklar.push({ kind: 'font_family', block: i, expected: b.fontFamily, actual: a.fontFamily })
    }
    if (b.lineCount !== a.lineCount) {
      farklar.push({ kind: 'line_count', block: i, expected: b.lineCount, actual: a.lineCount })
    }
    for (const [j, g] of b.glyphs.entries()) {
      const h = a.glyphs[j]
      if (h === undefined || Math.abs(g.advance - h.advance) > 0.01) {
        farklar.push({
          kind: 'advance',
          block: i,
          char: g.char,
          expected: g.advance,
          actual: h?.advance ?? -1,
        })
      }
    }
  }
  return farklar
}

export const formatDiff = (d: readonly MetricDiff[]): string =>
  d
    .map((x) => {
      switch (x.kind) {
        case 'notdef':
          return `  ✗ ${x.count} eksik glyph — font SESSİZCE düşmüş (R-31)`
        case 'block_count':
          return `  ✗ blok sayısı ${x.actual}, beklenen ${x.expected}`
        case 'font_family':
          return `  ✗ blok ${x.block + 1}: font "${x.actual}", beklenen "${x.expected}"`
        case 'line_count':
          return `  ✗ blok ${x.block + 1}: ${x.actual} satır, beklenen ${x.expected}`
        case 'advance':
          return `  ✗ blok ${x.block + 1}: '${x.char}' ilerleme ${x.actual}px, beklenen ${x.expected}px`
      }
    })
    .join('\n')
