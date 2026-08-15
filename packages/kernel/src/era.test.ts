import { describe, expect, it } from 'vitest'
import type { BrandId, EraId } from '@suite/contracts'
import {
  currentEraPath,
  eraDir,
  eraManifestPath,
  eraTag,
  lineagePath,
  validateEra,
  validateStamp,
  type AssetStamp,
  type EraManifest,
} from './era.js'

const MARKA = 'brd_0192f3a1-0000-7000-8000-00000000000a' as BrandId
const SHA = 'a'.repeat(40)

const donem = (over: Partial<EraManifest> = {}): EraManifest => ({
  slug: 'imalat-2026',
  brandId: MARKA,
  status: 'active',
  commitSha: SHA,
  mintedAt: '2026-08-15T09:00:00.000Z',
  title: 'İmalat dönemi',
  rationale: 'Geri dönüşümden imalata konum değişimi (§3b).',
  supersedes: 'geri-donusum-2024',
  ...over,
})

const damga = (over: Partial<AssetStamp> = {}): Partial<AssetStamp> => ({
  brandId: MARKA,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
  ...over,
})

describe('dönem yerleşimi — marka BAŞINA (D-39)', () => {
  it('yollar marka ekseninden geçiyor', () => {
    expect(eraDir(MARKA, 'imalat-2026')).toBe(`brand/${MARKA}/eras/imalat-2026`)
    expect(eraManifestPath(MARKA, 'imalat-2026')).toBe(`brand/${MARKA}/eras/imalat-2026/era.yaml`)
    // Tek satırlık `current` markaya göre: iki marka aynı anda yaşayabilsin diye.
    expect(currentEraPath(MARKA)).toBe(`brand/${MARKA}/current`)
    expect(currentEraPath('brd_x')).not.toBe(currentEraPath(MARKA))
  })

  it('dönem KLASÖRÜ yok — corpus yolu era içermiyor (D-30)', () => {
    // Bu test bir yasağı sabitliyor: `eraDir` yalnız marka verisi altında yaşar,
    // corpus'a dönem klasörü açmaz. Açsaydı regenerasyon "ekleme" olurdu ve
    // `git diff` yan yana gösteremezdi.
    expect(eraDir(MARKA, 'x').startsWith('brand/')).toBe(true)
    expect(eraDir(MARKA, 'x')).not.toContain('corpus/')
  })

  it('git tag ve soy haritası yolları sabit', () => {
    expect(eraTag('imalat-2026')).toBe('era/imalat-2026')
    expect(lineagePath(MARKA, 'a', 'b')).toBe(`brand/${MARKA}/lineage/a__b.map.json`)
  })
})

describe('dönem manifesti doğrulaması', () => {
  it('geçerli manifest kabul ediliyor', () => {
    expect(validateEra(donem()).ok).toBe(true)
  })

  it('slug hem dosya yolu hem git tag olacak — dar küme zorunlu', () => {
    for (const kotu of ['İmalat', 'imalat 2026', 'imalat_2026', 'imalat/2026', '']) {
      const r = validateEra(donem({ slug: kotu }))
      expect(r.ok, kotu).toBe(false)
    }
  })

  it('commit SHA 40 hex olmak zorunda — dönem bir ağacın FOTOĞRAFIDIR', () => {
    const r = validateEra(donem({ commitSha: 'HEAD' }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('invalid_commit_sha')
  })

  it('gerekçesiz dönem açılamaz — bir yıl sonra tek cevap kaynağı odur', () => {
    const r = validateEra(donem({ rationale: '   ' }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.kind === 'missing_field')).toBe(true)
  })

  it('kendini devralan dönem reddediliyor — soy zincirinde sonsuz döngü', () => {
    const r = validateEra(donem({ supersedes: 'imalat-2026' }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('self_supersede')
  })

  it('ilk dönem `supersedes: null` ile geçerli', () => {
    expect(validateEra(donem({ supersedes: null })).ok).toBe(true)
  })

  it('aday dönem de geçerli — birden fazla aday aynı anda yaşayabilir (§4.6)', () => {
    expect(validateEra(donem({ status: 'candidate' })).ok).toBe(true)
  })
})

describe('varlık damgası — retrofit İMKÂNSIZ (R-11)', () => {
  it('altı alan doluysa damga geçerli', () => {
    const r = validateStamp(damga())
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.sourceRunId).toBe('run_1')
  })

  it('HER alan zorunlu — biri eksikse varlık üretilemez', () => {
    const alanlar: readonly (keyof AssetStamp)[] = [
      'brandId',
      'eraId',
      'kitVersion',
      'definitionDigest',
      'contextManifest',
      'sourceRunId',
    ]
    for (const f of alanlar) {
      const eksik = { ...damga() }
      delete eksik[f]
      const r = validateStamp(eksik)
      expect(r.ok, f).toBe(false)
      if (!r.ok) {
        expect(r.errors.some((e) => e.kind === 'missing_stamp_field' && e.field === f)).toBe(true)
      }
    }
  })

  it('BOŞ dize dolu sayılmıyor — "vardı ama boştu" hiç olmamaktan kötüdür', () => {
    const r = validateStamp(damga({ kitVersion: '  ' }))
    expect(r.ok).toBe(false)
  })

  it('damgasız varlık reddediliyor ve KAÇ alanın eksik olduğu söyleniyor', () => {
    const r = validateStamp({})
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors).toHaveLength(6)
  })
})
