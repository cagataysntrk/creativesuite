import { describe, expect, it } from 'vitest'
import { parseDescriptor } from './descriptor.js'

// §8.1'in tezi: tanımlayıcı VERİ, adaptör KOD. Test şu soruyla: "sağlayıcı yarın
// fiyatını değiştirse kod değişir mi?" Cevap hayır olmalı.

const TEMEL = `
id: ornek
title: Örnek sağlayıcı
adapter: pending
enabled: false
auth_env: ORNEK_KEY
capabilities:
  - name: image.generate
    lanes: [premium]
    supports:
      aspect: ['4:5']
`

describe('tanımlayıcı ayrıştırma', () => {
  it('geçerli tanımlayıcı kabul ediliyor', () => {
    const r = parseDescriptor(TEMEL)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.id).toBe('ornek')
      expect(r.value.capabilities[0]?.name).toBe('image.generate')
    }
  })

  it('`enabled` varsayılanı TRUE — belirtilmemiş sağlayıcı kapalı sanılmaz', () => {
    const r = parseDescriptor(TEMEL.replace('enabled: false\n', ''))
    expect(r.ok && r.value.enabled).toBe(true)
  })

  it('yetenek adı FİİL olamaz — `GENERATE` bir fiil, `image.generate` bir yetenek', () => {
    const r = parseDescriptor(TEMEL.replace('image.generate', 'GENERATE'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]?.kind).toBe('capability_is_verb')
  })

  it('şerit yalnız free|premium — üçüncü şerit YOK (D-2)', () => {
    const r = parseDescriptor(TEMEL.replace('[premium]', '[ultra]'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.kind === 'invalid_lane')).toBe(true)
  })

  it('yeteneksiz tanımlayıcı reddediliyor — neye aday olduğu bilinmeyen sağlayıcı', () => {
    const r = parseDescriptor('id: x\ntitle: y\nadapter: pending\n')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.some((e) => e.kind === 'no_capabilities')).toBe(true)
  })

  it('adaptörsüz tanımlayıcı reddediliyor', () => {
    const r = parseDescriptor(TEMEL.replace('adapter: pending\n', ''))
    expect(r.ok).toBe(false)
  })
})

describe('secret tanımlayıcıda YAŞAMAZ (R-51)', () => {
  it('ortam değişkeni ADI geçerli', () => {
    expect(parseDescriptor(TEMEL).ok).toBe(true)
  })

  it('anahtarın KENDİSİ reddediliyor — bu dosya git geçmişine giriyor', () => {
    for (const kotu of ['sk-ant-api03-abc', 'fal-abcdef123456', 'Bearer xyz', 'a'.repeat(40)]) {
      const r = parseDescriptor(TEMEL.replace('ORNEK_KEY', kotu))
      expect(r.ok, kotu).toBe(false)
      if (!r.ok)
        expect(
          r.errors.some((e) => e.kind === 'literal_secret'),
          kotu
        ).toBe(true)
    }
  })

  it('`auth_env: null` meşru — her sağlayıcı kimlik istemiyor', () => {
    const r = parseDescriptor(TEMEL.replace('auth_env: ORNEK_KEY', 'auth_env: null'))
    expect(r.ok && r.value.authEnv).toBeNull()
  })
})
