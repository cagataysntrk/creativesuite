// HEDEF: packages/render/src/static.test.ts
//
// §7.1'in üç vaadi burada sınanıyor: tek motor · zarf görünmez · taşma böler.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { renderStatic, toHtml } from './static.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const TOKEN_CSS = ':root { --role-bg: #101418; --role-text: #f2f4f7; --role-text-muted: #9aa4b2; }'

const belge = (over: Partial<DocumentModel> = {}): DocumentModel => ({
  kind: 'post',
  width: 1080,
  height: 1350,
  tokenCss: TOKEN_CSS,
  stamp: DAMGA,
  blocks: [
    { type: 'heading', text: 'Ölçemediğiniz fireyi yönetemezsiniz', level: 1 },
    { type: 'body', text: 'İstanbul’da yazılım çözümleri · ĞÜŞİÖÇ ğüşıöç Ağrı İğne' },
  ],
  ...over,
})

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-render-')
})
afterEach(() => tmp.cleanup())

/** PNG imzası: ilk sekiz bayt sabittir. Boyut IHDR başlığından okunur. */
const pngBoyut = (yol: string): { readonly w: number; readonly h: number } => {
  const b = readFileSync(yol)
  const imza = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (const [i, x] of imza.entries()) {
    if (b[i] !== x) return { w: -1, h: -1 }
  }
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
}

describe('HTML üretimi — saf, tarayıcısız', () => {
  it('token CSS GÖMÜLÜ, link edilmemiş', () => {
    const html = toHtml(belge())
    expect(html).toContain('--role-bg')
    // Harici stil, render anında yüklenemezse çıktı sessizce varsayılan renklerle
    // üretilir ve "marka dışı" olduğunu kimseye söylemez.
    expect(html).not.toContain('<link')
  })

  it('metin KAÇIRILIYOR — kullanıcı metni etiket açamaz', () => {
    const html = toHtml(belge({ blocks: [{ type: 'body', text: '<script>alert(1)</script>' }] }))
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('&lt;script&gt;')
  })

  it('dekoratif görsel `aria-hidden` alıyor, boş alt İDDİA değil', () => {
    const html = toHtml(
      belge({ blocks: [{ type: 'image', src: 'a.png', alt: '', decorative: true }] })
    )
    expect(html).toContain('aria-hidden="true"')
  })

  it('METİN öğelerine sabit genişlik YOK — Türkçe etiket ~%20 uzun (R-23)', () => {
    const html = toHtml(belge())
    // Tuval genişliği (body) meşru: çıktı boyutu platform spec'idir (§9.1).
    // Yasak olan h1/h2/p gibi metin öğelerine sabit genişlik vermek.
    for (const secici of ['h1', 'h2', 'p']) {
      const kural = new RegExp(`${secici}\\s*\\{[^}]*width:\\s*\\d+px`)
      expect(html, secici).not.toMatch(kural)
    }
  })

  it('küçültme YOK — taşma bölmeli, tip küçülmemeli (§7.1)', () => {
    // `fitText`, `transform: scale`, `font-size: calc(...)` gibi hiçbir küçültme
    // mekanizması olmamalı: sığdırmak için tipi küçültmek makine üretimi kreatifin
    // bir numaralı görsel işaretidir.
    const html = toHtml(belge())
    expect(html).not.toContain('scale(')
    expect(html).not.toContain('calc(')
  })
})

describe('PNG üretimi — GERÇEK Chromium (§7.1 · D-86)', () => {
  it('1080×1350 PNG üretiyor', async () => {
    const yol = join(tmp.path, 'post.png')
    const r = await renderStatic(belge(), yol)
    expect(r.ok).toBe(true)
    expect(pngBoyut(yol)).toEqual({ w: 1080, h: 1350 })
  }, 60_000)

  it('geçersiz belge render EDİLMİYOR — boş PNG üretmek sessiz hatadır', async () => {
    const r = await renderStatic(belge({ blocks: [] }), join(tmp.path, 'bos.png'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('belge geçersiz')
  })

  it("alt-text'siz görsel render EDİLMİYOR (R-34)", async () => {
    const r = await renderStatic(
      belge({ blocks: [{ type: 'image', src: 'a.png', alt: '  ', decorative: false }] }),
      join(tmp.path, 'x.png')
    )
    expect(r.ok).toBe(false)
  })
})
