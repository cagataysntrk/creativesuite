import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { lifecycleMessage, pinRecord, retireRecord } from './lifecycle.js'
import { parseFrontmatter } from './frontmatter.js'

const kur = (fm: Record<string, unknown>, body = 'gövde\n'): string => {
  const kok = mkdtempSync(join(tmpdir(), 'suite-lc-'))
  mkdirSync(join(kok, 'fact'), { recursive: true })
  const satirlar = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
  writeFileSync(join(kok, 'fact/x.md'), `---\n${satirlar.join('\n')}\n---\n\n${body}`)
  return kok
}

// `throw` yerine `expect` — hata bir DEĞERDİR, kontrol akışı sıçraması değil (§8.6)
// ve `throw` darboğazı yalnız `panic.ts`e açık. Testte de aynı disiplin: okunamayan
// bir fikstür testin kendi kurulum hatasıdır ve assertion olarak görünmelidir.
const fmOku = (kok: string): Record<string, unknown> => {
  const p = parseFrontmatter(readFileSync(join(kok, 'fact/x.md'), 'utf8'))
  expect(p.ok).toBe(true)
  const fm = p.ok ? p.value.frontmatter : null
  expect(fm).not.toBeNull()
  return fm ?? {}
}

const HEDEF = { entityType: 'fact', slug: 'x' } as const
const SIMDI = '2026-08-15T12:00:00.000Z'

describe('emeklilik', () => {
  it('SİLMEZ — dosya kalır, expired_at yazılır (R-12)', () => {
    const kok = kur({ id: 'f1', status: 'active', zone: 'human' })
    try {
      const r = retireRecord({ root: kok, ...HEDEF, at: SIMDI })
      expect(r.ok).toBe(true)

      // Dosya HÂLÂ ORADA. Bu testin tek sebebi bu satır.
      expect(readdirSync(join(kok, 'fact'))).toEqual(['x.md'])
      const fm = fmOku(kok)
      expect(fm['status']).toBe('retired')
      expect(fm['expired_at']).toBe(SIMDI)
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('gövde KORUNUR — emeklilik içeriği değil durumu değiştirir', () => {
    const kok = kur({ id: 'f1', status: 'active', zone: 'human' }, 'imalat fire oranı %12\n')
    try {
      retireRecord({ root: kok, ...HEDEF, at: SIMDI })
      expect(readFileSync(join(kok, 'fact/x.md'), 'utf8')).toContain('imalat fire oranı %12')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('superseded_by verilirse yazılır, verilmezse ALAN HİÇ AÇILMAZ', () => {
    const a = kur({ id: 'f1', status: 'active', zone: 'human' })
    const b = kur({ id: 'f2', status: 'active', zone: 'human' })
    try {
      retireRecord({ root: a, ...HEDEF, at: SIMDI, supersededBy: 'f9' })
      expect(fmOku(a)['superseded_by']).toBe('f9')

      retireRecord({ root: b, ...HEDEF, at: SIMDI })
      // Boş bir alan yazmak, okuyan kodu `null` ile `''` ayırmaya zorlardı.
      expect('superseded_by' in fmOku(b)).toBe(false)
    } finally {
      rmSync(a, { recursive: true, force: true })
      rmSync(b, { recursive: true, force: true })
    }
  })

  it('emekli kayıt TEKRAR emekli edilemez — emeklilik geri alınmaz', () => {
    const kok = kur({ id: 'f1', status: 'retired', zone: 'human', expired_at: '2026-01-01' })
    try {
      const r = retireRecord({ root: kok, ...HEDEF, at: SIMDI })
      expect(r.ok).toBe(false)
      if (!r.ok) {
        expect(r.refusal.kind).toBe('already_retired')
        expect(lifecycleMessage(r.refusal)).toContain('R-12')
        // İlk emeklilik tarihi EZİLMEDİ.
        expect(fmOku(kok)['expired_at']).toBe('2026-01-01')
      }
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('olmayan kayıt sessizce başarılı olmaz', () => {
    const kok = mkdtempSync(join(tmpdir(), 'suite-lc-'))
    try {
      const r = retireRecord({ root: kok, ...HEDEF, at: SIMDI })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.refusal.kind).toBe('not_found')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})

describe('sabitleme', () => {
  it('active ↔ pinned gidip gelir — sabitleme GERİ ALINABİLİR', () => {
    const kok = kur({ id: 'f1', status: 'active', zone: 'human' })
    try {
      expect(pinRecord({ root: kok, ...HEDEF, pinned: true }).ok).toBe(true)
      expect(fmOku(kok)['status']).toBe('pinned')
      expect(pinRecord({ root: kok, ...HEDEF, pinned: false }).ok).toBe(true)
      expect(fmOku(kok)['status']).toBe('active')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('emekli kayıt SABİTLENEMEZ — "koru" ile "geçersiz" çelişir', () => {
    const kok = kur({ id: 'f1', status: 'retired', zone: 'human' })
    try {
      const r = pinRecord({ root: kok, ...HEDEF, pinned: true })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.refusal.kind).toBe('already_retired')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('taslak SABİTLENEMEZ — önce onaylanır', () => {
    const kok = kur({ id: 'f1', status: 'draft', zone: 'generated' })
    try {
      const r = pinRecord({ root: kok, ...HEDEF, pinned: true })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.refusal.kind).toBe('bad_status')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })

  it('taslak EMEKLİ EDİLEBİLİR — reddedilen öneri de bir karardır', () => {
    const kok = kur({ id: 'f1', status: 'draft', zone: 'generated' })
    try {
      expect(retireRecord({ root: kok, ...HEDEF, at: SIMDI }).ok).toBe(true)
      expect(fmOku(kok)['status']).toBe('retired')
    } finally {
      rmSync(kok, { recursive: true, force: true })
    }
  })
})
