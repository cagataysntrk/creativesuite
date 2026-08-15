import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import type { AssetStamp, DocumentModel } from '@suite/kernel'
import type { BrandId, EraId } from '@suite/contracts'
import { renderStatic } from '../static.js'
import {
  PERSON_PROBES,
  assertCompliance,
  personPatternHits,
  promptRequestsPerson,
  type PersonBasis,
} from './claim.js'
import { STAMP_KEYS, hasComplianceStamp, readStamp, stampPng } from './stamp.js'

const CID = 'cor_uyum'
const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:abc',
  contextManifest: 'ctx-1',
  sourceRunId: 'run_1',
}

const PROMPT_TEMIZ = 'çelik tezgâh üstünde ölçüm aleti, soğuk ışık'
const basis = (over?: Partial<PersonBasis>): PersonBasis =>
  ({ kind: 'prompt_forbids_people', promptDigest: 'sha256:x', ...over }) as PersonBasis

describe('sentetik insan yasağı (R-33 · Md. 27/12)', () => {
  it('temiz prompt iddia ALIYOR', () => {
    const r = assertCompliance({
      basis: basis(),
      aiGenerated: true,
      prompt: PROMPT_TEMIZ,
      correlationId: CID,
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.containsSyntheticPerson).toBe(false)
      expect(r.value.basis.kind).toBe('prompt_forbids_people')
    }
  })

  it('insan isteyen prompt iddia KURAMIYOR — Türkçe', () => {
    for (const p of [
      'gülümseyen bir müşteri ürünü tutuyor',
      'mühendisler hattı inceliyor',
      'memnun kullanıcıların portresi',
      'el sıkışan iki yönetici',
      'işçilerin çalıştığı atölye',
      'referans veren bir kişi',
    ]) {
      const r = assertCompliance({
        basis: basis(),
        aiGenerated: true,
        prompt: p,
        correlationId: CID,
      })
      expect(r.ok, p).toBe(false)
      if (!r.ok) {
        expect(r.error.code).toBe('COMPLIANCE_BLOCKED')
        expect(r.error.details?.['rule']).toBe('R-33')
      }
    }
  })

  it('insan isteyen prompt iddia KURAMIYOR — İngilizce', () => {
    for (const p of [
      'a smiling customer holding the product',
      'a team of engineers',
      'portrait of a worker',
      'handshake between two people',
      'a testimonial video still',
    ]) {
      expect(
        assertCompliance({ basis: basis(), aiGenerated: true, prompt: p, correlationId: CID }).ok,
        p
      ).toBe(false)
    }
  })

  it('Türkçe EKLER kaçmıyor — gövde ön eki', () => {
    // `insan` · `insanlar` · `insanlarla` · `insanların`: sonlu bir ek listesi her zaman
    // bir sonraki eki kaçırır.
    for (const p of ['insanlarla dolu fabrika', 'müşterilerimizin tepkisi', 'çalışanların eli']) {
      expect(
        assertCompliance({ basis: basis(), aiGenerated: true, prompt: p, correlationId: CID }).ok,
        p
      ).toBe(false)
    }
  })

  it('yanlış pozitif yok — meşru endüstriyel prompt geçiyor', () => {
    for (const p of [
      'boş bir üretim hattı, gece vardiyası',
      'ölçüm cihazının makro çekimi',
      'soyut bakır geometrik desen',
      'endüstriyel tesis dış cephesi, mavi saat',
    ]) {
      expect(
        assertCompliance({ basis: basis(), aiGenerated: true, prompt: p, correlationId: CID }).ok,
        p
      ).toBe(true)
    }
  })

  it('GERÇEK fotoğraf dayanağı insan içerse bile geçerli', () => {
    // Sentetik insan yasağı ÜRETİLMİŞ insanı hedefliyor; gerçek bir fotoğraf
    // Md. 27/12'nin konusu değil.
    const r = assertCompliance({
      basis: { kind: 'human_photograph', sourceRef: 'assets/2026/08/foto.jpg' },
      aiGenerated: false,
      correlationId: CID,
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.aiGenerated).toBe(false)
  })

  it('kaynaksız fotoğraf dayanağı REDDEDİLİYOR', () => {
    const r = assertCompliance({
      basis: { kind: 'human_photograph', sourceRef: '  ' },
      aiGenerated: false,
      correlationId: CID,
    })
    expect(r.ok).toBe(false)
  })

  it('İSİMSİZ insan onayı onay DEĞİL', () => {
    // Denetimde "kim onayladı" sorusunun cevabı olmalı.
    const r = assertCompliance({
      basis: { kind: 'human_reviewed', reviewer: '', reviewedAt: '2026-08-15' },
      aiGenerated: true,
      correlationId: CID,
    })
    expect(r.ok).toBe(false)
    if (!r.ok)
      expect((r.error.details?.['refusal'] as { kind: string }).kind).toBe('reviewer_unnamed')
  })

  it("insan onayı, insan İSTEYEN prompt'u geçirebiliyor", () => {
    // Katı olmak fazla katı olmakla aynı şey değil: model prompt\'ta istenmese de insan
    // üretebilir, o yüzden insan gözü bir kaçış değil bir dayanaktır.
    const r = assertCompliance({
      basis: { kind: 'human_reviewed', reviewer: 'Çağatay Şentürk', reviewedAt: '2026-08-15' },
      aiGenerated: true,
      prompt: 'gülümseyen bir müşteri',
      correlationId: CID,
    })
    expect(r.ok).toBe(true)
  })

  it('boş prompt dayanağı REDDEDİLİYOR — dayanaksız iddia', () => {
    expect(
      assertCompliance({ basis: basis(), aiGenerated: true, prompt: '   ', correlationId: CID }).ok
    ).toBe(false)
  })

  it('`promptRequestsPerson` eşleşen terimi SÖYLÜYOR', () => {
    expect(promptRequestsPerson('gülümseyen bir müşteri')).not.toBeNull()
    expect(promptRequestsPerson(PROMPT_TEMIZ)).toBeNull()
  })
})

describe("her desen KENDİ probe'uyla kanıtlanıyor", () => {
  // Bu blok bir ihlal testinden doğdu: kapının öz-testi tek bir prompt kullanıyordu ve
  // `müşteri` deseni silindiğinde `gülümse` deseni aynı prompt'u yakalayıp kapıyı
  // YEŞİL bırakıyordu. Desenlerin çoğu silinebilir ve kapı hiçbir şey söylemezdi.
  it.each(PERSON_PROBES.map((p, i) => [i, p] as const))('probe #%i bloklanıyor: %s', (_i, p) => {
    expect(
      assertCompliance({ basis: basis(), aiGenerated: true, prompt: p, correlationId: CID }).ok
    ).toBe(false)
  })

  it('her probe TEK bir desene uyuyor — üst üste binme yok', () => {
    // Binen probe'lar mekanizmayı ilk hâline geri götürür: silinen bir desen başka
    // bir desenin probe'uyla maskelenir.
    for (const p of PERSON_PROBES) {
      expect(personPatternHits(p), p).toBe(1)
    }
  })

  it('probe sayısı desen sayısına EŞİT — probesuz desen eklenemez', () => {
    expect(PERSON_PROBES.length).toBe(16)
    expect(new Set(PERSON_PROBES).size).toBe(PERSON_PROBES.length)
  })
})

describe('EU AI Act Md. 50 ifşası', () => {
  it('AI üretimi ifşa gerektiriyor', () => {
    const r = assertCompliance({
      basis: basis(),
      aiGenerated: true,
      prompt: PROMPT_TEMIZ,
      correlationId: CID,
    })
    expect(r.ok && r.value.disclosureRequired).toBe(true)
  })

  it('KIRPMA/renk düzeltme ifşa TETİKLEMİYOR — belgelenmiş istisna', () => {
    const r = assertCompliance({
      basis: basis(),
      aiGenerated: true,
      minorEditsOnly: true,
      prompt: PROMPT_TEMIZ,
      correlationId: CID,
    })
    expect(r.ok && r.value.disclosureRequired).toBe(false)
  })

  it('AI üretimi olmayan varlık ifşa gerektirmiyor', () => {
    const r = assertCompliance({
      basis: { kind: 'human_photograph', sourceRef: 'x.jpg' },
      aiGenerated: false,
      correlationId: CID,
    })
    expect(r.ok && r.value.disclosureRequired).toBe(false)
  })
})

describe('PNG damgası — GERÇEK render üstünde', () => {
  let tmp: TempDir
  beforeEach(() => {
    tmp = makeTempDir('suite-uyum-')
  })
  afterEach(() => tmp.cleanup())

  const belge = (): DocumentModel => ({
    kind: 'post',
    width: 1080,
    height: 1350,
    tokenCss: ':root { --role-bg: #101418; --role-text: #f2f4f7; }',
    stamp: DAMGA,
    blocks: [{ type: 'heading', text: 'Ölçemediğiniz fireyi yönetemezsiniz', level: 1 }],
  })

  const iddia = () => {
    const r = assertCompliance({
      basis: basis(),
      aiGenerated: true,
      prompt: PROMPT_TEMIZ,
      correlationId: CID,
    })
    return r.ok ? r.value : null
  }

  it('damga basılıyor ve GERİ OKUNUYOR', async () => {
    const yol = join(tmp.path, 'damgali.png')
    await renderStatic(belge(), yol)
    const c = iddia()
    expect(c).not.toBeNull()
    if (c === null) return

    const s = stampPng(yol, { stamp: DAMGA, claim: c })
    expect(s.ok).toBe(true)

    const okunan = readStamp(yol)
    expect(okunan?.[STAMP_KEYS.brand]).toBe('brd_upcytech')
    expect(okunan?.[STAMP_KEYS.era]).toBe('era_imalat_2026')
    expect(okunan?.[STAMP_KEYS.synthetic]).toBe('false')
    expect(okunan?.[STAMP_KEYS.basis]).toBe('prompt_forbids_people')
    expect(okunan?.[STAMP_KEYS.disclosure]).toBe('true')
    expect(hasComplianceStamp(yol)).toBe(true)
  }, 60_000)

  it('damgalanan PNG hâlâ GEÇERLİ PNG — imza ve boyut korunuyor', async () => {
    const yol = join(tmp.path, 'gecerli.png')
    await renderStatic(belge(), yol)
    const c = iddia()
    if (c === null) return
    stampPng(yol, { stamp: DAMGA, claim: c })

    const b = readFileSync(yol)
    expect([...b.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    // IHDR hâlâ yerinde: boyut okunabiliyor.
    expect(b.readUInt32BE(16)).toBe(1080)
    expect(b.readUInt32BE(20)).toBe(1350)
    // IEND hâlâ SON chunk: damga onun ÖNÜNE eklendi.
    expect(b.subarray(b.length - 8, b.length - 4).toString('latin1')).toBe('IEND')
  }, 60_000)

  it("Chromium damgalanmış PNG'yi hâlâ ÇÖZEBİLİYOR — CRC doğru", async () => {
    // CRC yanlış hesaplanırsa dosya "PNG gibi görünür" ama çözücü reddeder. Kendi
    // okuyucumuzla test etmek bunu kaçırırdı: aynı yanlışı iki kez yapardık.
    const yol = join(tmp.path, 'crc.png')
    await renderStatic(belge(), yol)
    const c = iddia()
    if (c === null) return
    stampPng(yol, { stamp: DAMGA, claim: c })

    const { samplePng } = await import('../qa/pixels.js')
    const ornek = await samplePng(yol, { grid: 8 })
    expect(ornek.ok).toBe(true)
    if (ornek.ok) expect(ornek.value.length).toBeGreaterThan(30)
  }, 90_000)

  it('damgasız PNG kapıdan GEÇMİYOR', async () => {
    const yol = join(tmp.path, 'damgasiz.png')
    await renderStatic(belge(), yol)
    expect(hasComplianceStamp(yol)).toBe(false)
  }, 60_000)

  it('PNG olmayan dosya reddediliyor', () => {
    const yol = join(tmp.path, 'sahte.png')
    writeFileSync(yol, 'bu bir PNG değil')
    const c = iddia()
    if (c === null) return
    expect(stampPng(yol, { stamp: DAMGA, claim: c })).toEqual({ ok: false, error: 'not_png' })
    expect(readStamp(yol)).toBeNull()
  })

  it('Türkçe karakter damgada BOZULMUYOR — `iTXt` UTF-8', async () => {
    const yol = join(tmp.path, 'turkce.png')
    await renderStatic(belge(), yol)
    const c = iddia()
    if (c === null) return
    stampPng(yol, {
      stamp: { ...DAMGA, kitVersion: 'ĞÜŞİÖÇ ğüşıöç sürüm' },
      claim: c,
    })
    // `tEXt` Latin-1 taşır ve bunu sessizce bozardı — tam da bu projenin her yerde
    // kaçındığı hata modu.
    expect(readStamp(yol)?.[STAMP_KEYS.kit]).toBe('ĞÜŞİÖÇ ğüşıöç sürüm')
  }, 60_000)
})
