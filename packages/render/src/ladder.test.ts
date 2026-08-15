// Kalite merdiveni GERÇEKTEN uygulanıyor mu (§9.1 · D-139).
//
// İlk sürüm uydurma bir formülle bir basamak "seçiyor", sonra o basamak hiçbir yere
// gitmiyordu: 53KB'lık bir varlık 30KB limitine karşı SESSİZCE yayınlanıyordu.
// Bu dosya, seçilen basamağın GERÇEKTEN render edildiğini ve dosyanın ÖLÇÜLDÜĞÜNÜ sınar.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { renderStatic, renderWithinLimit } from './static.js'
import { QUALITY_LADDER } from './specs/placements.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const belge = (): DocumentModel => ({
  kind: 'post',
  width: 1200,
  height: 1500,
  tokenCss:
    ':root { --role-bg: oklch(0.16 0.010 250); --role-text: oklch(0.97 0.004 250); --role-text-muted: oklch(0.58 0.008 250); }',
  stamp: DAMGA,
  blocks: [{ type: 'heading', text: 'Ölçemediğiniz fireyi yönetemezsiniz', level: 1 }],
})

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-merdiven-')
})
afterEach(() => tmp.cleanup())

describe('kalite merdiveni — GERÇEK render, GERÇEK ölçüm', () => {
  it('bol limitte İLK basamakta kalıyor ve PNG üretiyor', async () => {
    const r = await renderWithinLimit(belge(), join(tmp.path, 'a.png'), 10_000_000)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.rungIndex).toBe(0)
    expect(r.value.rung.jpegQuality).toBeNull()
    expect(r.value.path.endsWith('.png')).toBe(true)
    // Dosya GERÇEKTEN var ve raporlanan boyut GERÇEK boyut.
    expect(statSync(r.value.path).size).toBe(r.value.bytes)
  }, 60_000)

  it('dar limitte merdiveni İNİYOR ve dosya SIĞIYOR', async () => {
    const ham = join(tmp.path, 'ham.png')
    await renderStatic(belge(), ham)
    const hamBoyut = statSync(ham).size

    const limit = hamBoyut - 1
    const r = await renderWithinLimit(belge(), join(tmp.path, 'b.png'), limit)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.rungIndex).toBeGreaterThan(0)
    // ASIL İDDİA: dosya gerçekten sınırın ALTINDA.
    expect(r.value.bytes).toBeLessThanOrEqual(limit)
    expect(statSync(r.value.path).size).toBeLessThanOrEqual(limit)
  }, 120_000)

  it('JPEG basamağı `.jpg` yazıyor — format dosya adından okunabiliyor', async () => {
    const ham = join(tmp.path, 'ham2.png')
    await renderStatic(belge(), ham)
    const r = await renderWithinLimit(belge(), join(tmp.path, 'c.png'), statSync(ham).size - 1)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    if (r.value.rung.jpegQuality !== null) {
      expect(r.value.path.endsWith('.jpg')).toBe(true)
    }
  }, 120_000)

  it('merdiven TÜKENİRSE hata — son basamak "en iyisi buydu" diye KABUL EDİLMİYOR', async () => {
    // Kabul etmek, sınırı aşan bir varlığı yayına göndermektir.
    const r = await renderWithinLimit(belge(), join(tmp.path, 'd.png'), 100)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.message).toContain('merdiveni tükendi')
      expect(r.error.message).toContain('sessizce yayınlanmaz')
    }
  }, 180_000)

  it('geçersiz belge merdivene HİÇ girmiyor', async () => {
    const r = await renderWithinLimit(
      { ...belge(), blocks: [] },
      join(tmp.path, 'e.png'),
      10_000_000
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('belge geçersiz')
  })

  it('merdivenin ilk basamağı KAYIPSIZ — gereksiz sıkıştırma yok', () => {
    expect(QUALITY_LADDER[0]?.jpegQuality).toBeNull()
    expect(QUALITY_LADDER[0]?.scale).toBe(1)
  })
})
