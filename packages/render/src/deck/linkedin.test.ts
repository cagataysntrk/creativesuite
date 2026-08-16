import { describe, expect, it } from 'vitest'
import { writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import type { AssetStamp, ChartBlock, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { LINKEDIN_DOC_MAX_SAYFA, KALITE_MERDIVENI } from './linkedin.js'
import { irJson, isIrError, parseIr } from './ir.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'li',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const belge = (fire: number): DocumentModel => ({
  kind: 'deck-page',
  width: 1200,
  height: 1500,
  tokenCss: ':root{--role-bg:#000;--role-text:#fff;--role-text-muted:#aaa}',
  stamp: DAMGA,
  blocks: [
    { type: 'heading', text: 'Fire ölçümü', level: 1 },
    {
      type: 'chart',
      chartKind: 'bar',
      title: 'Fire oranı',
      unit: '%',
      asOf: '2026-03-31',
      points: [{ label: 'Mart', value: fire }],
    },
  ],
})

describe('LinkedIn dökümanı', () => {
  it('editoryal tavan 10 — platform sınırı DEĞİL', () => {
    expect(LINKEDIN_DOC_MAX_SAYFA).toBe(10)
  })

  it('kalite merdiveni AŞAĞI iniyor', () => {
    const m = [...KALITE_MERDIVENI]
    expect(m).toEqual([...m].sort((a, b) => b - a))
    expect(m.length).toBeGreaterThan(1)
  })
})

describe('IR anlık görüntüsü (🧪 FAZ-6.3)', () => {
  let t: TempDir

  it('kaynak DEĞİŞSE de doküman ESKİ değeri gösteriyor', () => {
    t = makeTempDir('ir-')
    try {
      // ── Mart: kaynak kayıt %4,2 diyor, IR yazılıyor ──
      const kaynak = join(t.path, 'kaynak.json')
      writeFileSync(kaynak, JSON.stringify({ fire: 4.2 }))
      const irYol = join(t.path, 'doc.ir.json')
      const okunan = JSON.parse(readFileSync(kaynak, 'utf8')) as { fire: number }
      writeFileSync(irYol, irJson(belge(okunan.fire), '2026-03-31T00:00:00Z'))

      // ── Haziran: kaynak kayıt %9,9'a güncellendi ──
      writeFileSync(kaynak, JSON.stringify({ fire: 9.9 }))

      // ── Doküman yeniden açılıyor: IR'dan, kaynaktan DEĞİL ──
      const ir = parseIr(readFileSync(irYol, 'utf8'))
      expect(isIrError(ir)).toBe(false)
      if (isIrError(ir)) return
      const g = ir.doc.blocks.find((b) => b.type === 'chart')
      expect(g?.type === 'chart' && g.points[0]?.value).toBe(4.2)
      // Yayınlanmış bir iddiayı geriye dönük değiştirmek düzeltme değil tahrifattır.
      expect(JSON.stringify(ir.doc)).not.toContain('9.9')
    } finally {
      t.cleanup()
    }
  })

  it('IR corpus’a REFERANS taşımıyor — değer taşıyor', () => {
    const j = irJson(belge(4.2), '2026-03-31T00:00:00Z')
    expect(j).toContain('4.2')
    // Kayıt id'si tutulsaydı biri bir gün "tazeleyelim" derdi ve haklı görünürdü.
    expect(j).not.toMatch(/recordId|corpusRef|record_id/)
  })

  it('bozuk IR render’ın ortasında değil OKUMADA reddediliyor', () => {
    const bozuk = parseIr('{ bu json değil')
    expect(isIrError(bozuk) && bozuk.kind).toBe('unreadable')
    const eksik = parseIr(JSON.stringify({ writtenAt: 'x' }))
    expect(isIrError(eksik) && eksik.kind).toBe('unreadable')
  })

  it('geçersiz belge taşıyan IR reddediliyor — boş grafik sessizce geçmiyor', () => {
    const d = belge(4.2)
    const grafik = d.blocks[1] as ChartBlock
    const boz = { ...d, blocks: [d.blocks[0]!, { ...grafik, points: [] }] }
    const r = parseIr(JSON.stringify({ doc: boz, writtenAt: 'x' }))
    expect(isIrError(r) && r.kind).toBe('invalid_doc')
  })
})
