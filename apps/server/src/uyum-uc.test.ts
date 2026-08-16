import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { uyumMesaji, uyumPanosu } from './uyum-uc.js'

const kur = (sidecarlar: readonly Record<string, unknown>[]): string => {
  const root = mkdtempSync(join(tmpdir(), 'uyum-'))
  const dizin = join(root, 'derived/blobs/ab')
  mkdirSync(dizin, { recursive: true })
  sidecarlar.forEach((s, i) => {
    writeFileSync(join(dizin, `sha256-${i}.meta.json`), JSON.stringify(s))
  })
  return root
}

const tam = {
  digest: 'sha256:a',
  sourceRunId: 'run_1',
  compliance: {
    containsSyntheticPerson: false,
    basis: { kind: 'prompt_forbids_people' },
    aiGenerated: true,
    disclosureRequired: false,
  },
}

describe('compliance panosu', () => {
  it('dayanaklı iddia yayınlanabilir ve DAYANAĞI söylüyor', () => {
    const p = uyumPanosu(kur([tam]))
    expect(p.satirlar[0]!.yayinlanabilir).toBe(true)
    expect(uyumMesaji(p.satirlar[0]!.durum)).toContain('prompt_forbids_people')
  })

  // **Dayanaksız iddia bir BEYANDIR.** `containsSyntheticPerson: false` tek başına,
  // kimsenin bakmadığı bir kutucuğun işaretlenmesidir (D-23).
  it('dayanaksız iddia beyandır — yayınlanamaz', () => {
    const p = uyumPanosu(kur([{ ...tam, compliance: { containsSyntheticPerson: false } }]))
    expect(p.satirlar[0]!.durum.kind).toBe('dayanaksiz')
    expect(p.satirlar[0]!.yayinlanabilir).toBe(false)
    expect(uyumMesaji(p.satirlar[0]!.durum)).toContain('denetlenemez')
  })

  it('ifşa gerekliyse yayın BLOKLU (Md. 50(2))', () => {
    const p = uyumPanosu(
      kur([{ ...tam, compliance: { ...tam.compliance, disclosureRequired: true } }])
    )
    expect(p.satirlar[0]!.durum.kind).toBe('ifsa_eksik')
    expect(p.blokluSayisi).toBe(1)
  })

  // **"Ölçülemedi" ≠ "uyumsuz" ≠ "uyumlu"** (D-175). Üç ayrı cümle, üç ayrı sonuç.
  it('uyum kaydı olmayan sidecar ÖLÇÜLEMEDİ — "uyumsuz" değil', () => {
    const p = uyumPanosu(kur([{ digest: 'sha256:b', sourceRunId: 'run_2' }]))
    expect(p.satirlar[0]!.durum.kind).toBe('olculemedi')
    expect(p.olculemeyen).toBe(1)
    expect(uyumMesaji(p.satirlar[0]!.durum)).toContain('"uyumlu" da değil')
    // Ölçülemeyen varlık yayınlanamaz: bilinmeyen uyum, uyum değildir.
    expect(p.satirlar[0]!.yayinlanabilir).toBe(false)
  })

  it('blob dizini yoksa boş pano — çökme yok', () => {
    const p = uyumPanosu(mkdtempSync(join(tmpdir(), 'bos-')))
    expect(p.satirlar).toEqual([])
    expect(p.blokluSayisi).toBe(0)
  })
})
