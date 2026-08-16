import { describe, expect, it } from 'vitest'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { makeTempDir } from '@suite/kernel/testing'
import { KISISEL_ALANLAR, erasureMessage, kvkkErasure } from './kvkk.js'
import { retireRecord } from './lifecycle.js'

const KAYIT = `---
id: rec_prospect_ornek
brand_id: brd_upcytech
type: prospect
schema_version: 1
kind: ledger
locale: tr-TR
era_id: imalat-2026
created_at: 2026-08-16T00:00:00.000Z
status: active
zone: human
title: Sentetik Döküm Sanayi
legal_name: Sentetik Döküm Sanayi Anonim Şirketi
city: Bursa
sector: imalat
stage: contacted
source_url: https://ornek.gecersiz/sentetik
kvkk_basis: mesru_menfaat
retention_until: 2027-08-16
contact_role: Üretim müdürü
contact_name: Sentetik Kişi
contact_email: sentetik@ornek.gecersiz
x_signature: sha256:aaa
---

Görüşme notu gövdesi.
`

const kur = (): { root: string; cleanup: () => void } => {
  const t = makeTempDir('kvkk-')
  mkdirSync(join(t.path, 'prospect'), { recursive: true })
  writeFileSync(join(t.path, 'prospect', 'sentetik.md'), KAYIT)
  return { root: t.path, cleanup: t.cleanup }
}

const hedef = (root: string) => ({
  root,
  entityType: 'prospect',
  slug: 'sentetik',
  at: '2026-09-01T00:00:00.000Z',
})

describe('KVKK silme talebi', () => {
  it('kişisel alanları SİLİYOR, mezar taşı bırakıyor', () => {
    const t = kur()
    try {
      const r = kvkkErasure({
        ...hedef(t.root),
        reason: 'ilgili kişi talebi',
        requestedBy: 'ilgili kişi',
      })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      const metin = readFileSync(r.path, 'utf8')
      // Kişisel veri gitti…
      expect(metin).not.toContain('Sentetik Kişi')
      expect(metin).not.toContain('sentetik@ornek.gecersiz')
      expect(metin).not.toContain('Sentetik Döküm Sanayi')
      expect(metin).not.toContain('Görüşme notu')
      // …ama DOSYA duruyor ve kimliği korunuyor: köken zinciri kopmuyor.
      expect(metin).toContain('rec_prospect_ornek')
      expect(metin).toContain('kvkk_erased_at')
      expect(r.erasedFields.length).toBeGreaterThan(5)
    } finally {
      t.cleanup()
    }
  })

  it('silinmiş kayıt AYNI ZAMANDA emekli — arada bir çalıştırma onu çekemiyor', () => {
    const t = kur()
    try {
      const r = kvkkErasure({ ...hedef(t.root), reason: 'talep', requestedBy: 'ilgili kişi' })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.frontmatter['status']).toBe('retired')
      expect(r.frontmatter['expired_at']).toBe('2026-09-01T00:00:00.000Z')
    } finally {
      t.cleanup()
    }
  })

  // 🧪 İHLAL TESTİ — gerekçesiz silme REDDEDİLİYOR. Fikstür (D-181): boş gerekçe;
  // kural kalkarsa silme sessizce yapılır ve yükümlülüğün yerine getirildiği
  // gösterilemez — KVKK'da gösteremediğin şey yapılmamış sayılır.
  it('gerekçesiz silme reddediliyor', () => {
    const t = kur()
    try {
      const r = kvkkErasure({ ...hedef(t.root), reason: '   ', requestedBy: 'x' })
      expect(r.ok).toBe(false)
      if (r.ok) return
      expect(r.refusal.kind).toBe('missing_reason')
      expect(erasureMessage(r.refusal)).toContain('gerekçe')
      // Dosya DOKUNULMADAN duruyor.
      expect(readFileSync(join(t.root, 'prospect', 'sentetik.md'), 'utf8')).toContain(
        'Sentetik Kişi'
      )
    } finally {
      t.cleanup()
    }
  })

  it('ikinci kez silme reddediliyor — silinecek kişisel veri kalmadı', () => {
    const t = kur()
    try {
      kvkkErasure({ ...hedef(t.root), reason: 'talep', requestedBy: 'ilgili kişi' })
      const r = kvkkErasure({ ...hedef(t.root), reason: 'talep', requestedBy: 'ilgili kişi' })
      expect(r.ok).toBe(false)
      if (r.ok) return
      expect(r.refusal.kind).toBe('already_erased')
    } finally {
      t.cleanup()
    }
  })

  it('EMEKLİLİK kişisel veriyi SİLMİYOR — iki yol karıştırılmıyor (R-12)', () => {
    const t = kur()
    try {
      const r = retireRecord({ ...hedef(t.root) })
      expect(r.ok).toBe(true)
      const metin = readFileSync(join(t.root, 'prospect', 'sentetik.md'), 'utf8')
      // Emeklilik bir GEÇERLİLİK kararıdır; veriyi silmek onun işi değildir.
      expect(metin).toContain('Sentetik Kişi')
      expect(metin).toContain('status: retired')
    } finally {
      t.cleanup()
    }
  })

  it('imza siliniyor — meşru değişiklik "elle düzenlenmiş" sanılmıyor', () => {
    const t = kur()
    try {
      const r = kvkkErasure({ ...hedef(t.root), reason: 'talep', requestedBy: 'ilgili kişi' })
      if (!r.ok) return
      expect(r.frontmatter['x_signature']).toBeUndefined()
    } finally {
      t.cleanup()
    }
  })

  it('kara liste beyaz liste DEĞİL — yeni alan sessizce korunmuyor', () => {
    expect(KISISEL_ALANLAR).toContain('contact_email')
    expect(KISISEL_ALANLAR).toContain('notes')
    expect(KISISEL_ALANLAR).toContain('legal_name')
  })
})
