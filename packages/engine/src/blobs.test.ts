import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import { GIT_SIZE_LIMIT, blobPath, readBlobMeta, storeBlob, verifyBlob } from './blobs.js'

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-blob-')
})
afterEach(() => tmp.cleanup())

const DAMGA = { brandId: 'brd_upcytech', eraId: 'era_imalat_2026' }
const UYUM = { containsSyntheticPerson: false, basis: 'prompt_forbids_people' }

const kaynak = (ad: string, icerik: string): string => {
  const y = join(tmp.path, ad)
  writeFileSync(y, icerik)
  return y
}

const koy = (ad: string, icerik: string, runId = 'run_1') =>
  storeBlob({
    sourcePath: kaynak(ad, icerik),
    blobRoot: join(tmp.path, 'blobs'),
    stamp: DAMGA,
    compliance: UYUM,
    sourceRunId: runId,
    createdAt: '2026-08-15T09:00:00.000Z',
  })

describe('içerik-adresli depolama', () => {
  it('adres İÇERİKTEN türüyor', () => {
    const r = koy('a.png', 'ayni-icerik')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.ref.digest).toMatch(/^sha256:[0-9a-f]{64}$/)
    // Yol `<ab>/<sha256><ext>` — ilk iki karakter dizin.
    const hex = r.ref.digest.slice(7)
    expect(r.ref.path).toBe(blobPath(join(tmp.path, 'blobs'), hex, '.png'))
    expect(existsSync(r.ref.path)).toBe(true)
  })

  it('AYNI içerik ikinci kez saklanmıyor', () => {
    const a = koy('a.png', 'tekrar-eden')
    const b = koy('b.png', 'tekrar-eden')
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    expect(b.ref.path).toBe(a.ref.path)
    expect(a.deduplicated).toBe(false)
    expect(b.deduplicated).toBe(true)
  })

  it('FARKLI içerik farklı adres', () => {
    const a = koy('a.png', 'birinci')
    const b = koy('b.png', 'ikinci')
    expect(a.ok && b.ok && a.ref.path !== b.ref.path).toBe(true)
  })

  it('sidecar damgayı ve uyum iddiasını taşıyor', () => {
    const r = koy('a.png', 'damgali')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const m = readBlobMeta(r.ref.path)
    expect(m?.stamp['brandId']).toBe('brd_upcytech')
    expect(m?.stamp['eraId']).toBe('era_imalat_2026')
    expect(m?.compliance['containsSyntheticPerson']).toBe(false)
    expect(m?.sourceRunId).toBe('run_1')
    expect(m?.bytes).toBe(Buffer.byteLength('damgali'))
  })

  it('tekrar eden içerikte İLK çalıştırma korunuyor', () => {
    // Ezseydik "bu byte'ı hangi çalıştırma üretti" sorusu SON çalıştırmayı gösterirdi
    // ve maliyet defteriyle çelişirdi — para İLK üretimde harcandı.
    koy('a.png', 'ayni', 'run_ilk')
    const b = koy('b.png', 'ayni', 'run_ikinci')
    expect(b.ok).toBe(true)
    if (!b.ok) return
    expect(readBlobMeta(b.ref.path)?.sourceRunId).toBe('run_ilk')
  })

  it('olmayan kaynak reddediliyor', () => {
    const r = storeBlob({
      sourcePath: join(tmp.path, 'yok.png'),
      blobRoot: join(tmp.path, 'blobs'),
      stamp: DAMGA,
      compliance: UYUM,
      sourceRunId: 'run_1',
      createdAt: '2026-08-15T09:00:00.000Z',
    })
    expect(r).toEqual({ ok: false, error: 'source_missing' })
  })
})

describe('bütünlük doğrulama', () => {
  it('sağlam blob kusursuz', () => {
    const r = koy('a.png', 'saglam')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(verifyBlob(r.ref.path)).toEqual([])
  })

  it('İÇERİĞİ DEĞİŞTİRİLMİŞ blob yakalanıyor', () => {
    // Adres = içerik varsayımı deponun tek yasası. Bozulursa sessizce YANLIŞ varlık
    // döner ve o varlık bir prospect'e gider.
    const r = koy('a.png', 'orijinal')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    writeFileSync(r.ref.path, 'değiştirildi')
    const k = verifyBlob(r.ref.path)
    expect(k.map((x) => x.kind)).toContain('digest_mismatch')
  })

  it("sidecar'ı olmayan blob yakalanıyor", () => {
    const r = koy('a.png', 'sidecarsiz')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    unlinkSync(`${r.ref.path}.meta.json`)
    expect(verifyBlob(r.ref.path).map((x) => x.kind)).toContain('meta_missing')
  })

  it('512KB üstü dosya İŞARETLENİYOR (R-64)', () => {
    const r = koy('buyuk.png', 'x'.repeat(GIT_SIZE_LIMIT + 1))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(verifyBlob(r.ref.path).map((x) => x.kind)).toContain('oversize_for_git')
  })

  it('tam 512KB sınırda DEĞİL', () => {
    const r = koy('sinir.png', 'x'.repeat(GIT_SIZE_LIMIT))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(verifyBlob(r.ref.path).map((x) => x.kind)).not.toContain('oversize_for_git')
  })
})
