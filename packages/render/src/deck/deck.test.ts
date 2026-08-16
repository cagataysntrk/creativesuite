import { describe, expect, it } from 'vitest'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { deckPages } from './pdf.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'deck',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const doc = (metinler: string[]): DocumentModel => ({
  kind: 'post',
  width: 1600,
  height: 900,
  tokenCss: ':root{--role-bg:#000;--role-text:#fff;--role-text-muted:#aaa}',
  stamp: DAMGA,
  blocks: metinler.map((t, i) =>
    i % 2 === 0 ? { type: 'heading', text: t, level: 1 } : { type: 'body', text: t }
  ),
})

describe('deck sayfalama', () => {
  it('kısa içerik TEK sayfa', () => {
    const s = deckPages(doc(['Ölçüm', 'Kısa gövde']), 'statement')
    expect(s).toHaveLength(1)
    expect(s[0]?.oversized).toBe(false)
  })

  // 🧪 İHLAL TESTİ — taşma BÖLER, küçültmez. Fikstür (D-181): `statement` düzeni en
  // fazla 2 blok alıyor; 4 blok verirsek 2 sayfa çıkmalı. Kural kalkarsa 1 sayfa
  // olurdu ve fazlası sessizce kaybolurdu.
  it('düzen tavanını aşan içerik BÖLÜNÜYOR — hiçbir blok kaybolmuyor', () => {
    const bloklar = ['Bir', 'İki', 'Üç', 'Dört']
    const s = deckPages(doc(bloklar), 'statement')
    expect(s.length).toBeGreaterThan(1)
    // Bölmek DAĞITIR, silmez.
    expect(s.flatMap((x) => x.doc.blocks).length).toBe(bloklar.length)
  })

  it('her sayfa belge ölçüsünü ve token’ları KORUYOR', () => {
    const s = deckPages(doc(['Bir', 'İki', 'Üç', 'Dört']), 'statement')
    for (const p of s) {
      expect(p.doc.width).toBe(1600)
      expect(p.doc.height).toBe(900)
      expect(p.doc.tokenCss).toContain('--role-bg')
    }
  })

  it('dar bütçe daha ÇOK sayfa üretiyor — punto değil sayfa sayısı değişir', () => {
    const bloklar = ['Ölçüm odaklı imalat yazılımı', 'Vardiya bazlı fire oranı takibi']
    const genis = deckPages(doc(bloklar), 'statement')
    const dar = deckPages(doc(bloklar), 'statement', { heading: 10, body: 10 })
    expect(dar.length).toBeGreaterThan(genis.length)
  })

  it('sığmayan blok İŞARETLENİYOR — sessizce kırpılmıyor', () => {
    const cokUzun = 'x'.repeat(500)
    const s = deckPages(doc([cokUzun]), 'statement')
    expect(s.some((p) => p.oversized)).toBe(true)
  })
})
