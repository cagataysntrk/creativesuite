// Üretilen görsel belgeye GİRİYOR mu (§7.1 · D-250).
//
// Kusur: `composeBody` yalnız `capture` arıyordu; `image.generate` çıktısı `inputs`ta
// duruyor ve düşürülüyordu. Çağrı gidiyor, kota harcanıyor, görsel depoya alınıyor —
// belgeye hiç konmuyordu. Bu dosya köprüyü ÖLÇÜYOR.

import { describe, expect, it } from 'vitest'
import type { BrandId, EraId, RunId, StepId } from '@suite/contracts'
import { fixedClock, seededRng } from '@suite/kernel'
import { planGecerli, type TasarimPlani } from '@suite/contracts'
import { composeBody } from './verbs/bodies.js'

const ctx = {
  runId: 'run_t' as RunId,
  stepId: 'kompozit' as StepId,
  brandId: 'brd_t' as BrandId,
  eraId: 'era_t' as EraId,
  correlationId: 'cor_t' as never,
  clock: fixedClock('2026-08-16T00:00:00.000Z'),
  rng: seededRng(1),
}

const damga = {
  brandId: 'brd_t',
  eraId: 'era_t',
  kitVersion: 'kit-1',
  definitionDigest: 'sha256:x',
  contextManifest: 'ctx_1',
  sourceRunId: 'run_t',
}

const kos = async (inputs: Record<string, unknown>) => {
  const body = composeBody({ tokenCss: ':root{--role-bg:#000}', stamp: damga as never })
  return body.run(
    ctx as never,
    {
      constraints: { topic: 'veri yoksa önce veriyi kuruyoruz', width: 1080, height: 1350 },
      inputs,
    } as never
  )
}

const METIN = { 'metin-uret': { lines: ['Başlık', 'Gövde bir', 'Gövde iki'] } }

describe('üretilen görsel belgeye giriyor', () => {
  it('base64 çıktı `data:` URI olarak image bloğuna dönüşüyor', async () => {
    const r = await kos({
      ...METIN,
      'gorsel-uret': { format: 'base64', data: 'iVBORw0KGgo=', width: 1024, height: 1280 },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const doc = (r.value.data as { document: { blocks: { type: string; src?: string }[] } })
      .document
    const img = doc.blocks.find((b) => b.type === 'image')
    expect(img).toBeDefined()
    expect(img?.src).toBe('data:image/png;base64,iVBORw0KGgo=')
  })

  it('JPEG imzası PNG diye ETİKETLENMİYOR — Cloudflare JPEG döndürüyor', async () => {
    const r = await kos({
      ...METIN,
      'gorsel-uret': { format: 'base64', data: '/9j/4AAQSkZJRg==', width: 1024, height: 1024 },
    })
    if (!r.ok) return
    const doc = (r.value.data as { document: { blocks: { type: string; src?: string }[] } })
      .document
    expect(doc.blocks.find((b) => b.type === 'image')?.src).toContain('data:image/jpeg;base64,')
  })

  it('görsel YOKSA blok da yok — boş `src` üretilmiyor', async () => {
    const r = await kos(METIN)
    if (!r.ok) return
    const doc = (r.value.data as { document: { blocks: { type: string }[] } }).document
    expect(doc.blocks.some((b) => b.type === 'image')).toBe(false)
  })

  it('`role` TAŞIMIYOR — model üretimi bir görsel ürün ekranı iddia edemez', async () => {
    const r = await kos({
      ...METIN,
      'gorsel-uret': { format: 'base64', data: 'iVBORw0KGgo=', width: 1, height: 1 },
    })
    if (!r.ok) return
    const doc = (r.value.data as { document: { blocks: { type: string; role?: string }[] } })
      .document
    expect(doc.blocks.find((b) => b.type === 'image')?.role).toBeUndefined()
  })

  it('`alt` boş DEĞİL — R-34 alt-text`siz görseli yayında bloklar', async () => {
    const r = await kos({
      ...METIN,
      'gorsel-uret': { format: 'base64', data: 'iVBORw0KGgo=', width: 1, height: 1 },
    })
    if (!r.ok) return
    const doc = (r.value.data as { document: { blocks: { type: string; alt?: string }[] } })
      .document
    expect(doc.blocks.find((b) => b.type === 'image')?.alt).not.toBe('')
  })
})

// ── Tasarım planı ÜRETİM YOLUNDA (FAZ-14.2) ─────────────────────────────────
//
// ⚠ Bu blok D-261 yüzünden var: `chart`, `diagram` ve `tasarimOlc` üçü de yazılmış,
// testli ve kapıları yeşildi — ve üretim hattı sıfır tane üretiyordu. Bir planın var
// olması, koşunun onu ÜRETMESİ demek değildir. Burada `composeBody`nin gerçek çıktısı
// sınanıyor; defteri yazan `manifest-writer` bu çıktıyı olduğu gibi kaydediyor.

describe('tasarım planı compose ÇIKTISINDA', () => {
  it('plan üretiliyor ve GEÇERLİ', async () => {
    const r = await kos(METIN)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const plan = (r.value.data as { tasarimPlani?: TasarimPlani }).tasarimPlani
    expect(plan).toBeDefined()
    expect(planGecerli(plan!)).toBe(true)
  })

  it('her slaydın GEREKÇESİ dolu — plan denetlenebilir', async () => {
    const r = await kos(METIN)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const plan = (r.value.data as { tasarimPlani: TasarimPlani }).tasarimPlani
    for (const s of plan.slaytlar) expect(s.oge.gerekce.trim().length).toBeGreaterThan(10)
    expect(plan.aile.gerekce.trim().length).toBeGreaterThan(10)
  })

  it('KONU plana geçiyor — hangi koşunun planı olduğu belli', async () => {
    const r = await kos(METIN)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const plan = (r.value.data as { tasarimPlani: TasarimPlani }).tasarimPlani
    expect(plan.konu).toBe('veri yoksa önce veriyi kuruyoruz')
  })

  it('plan defterin ELEME EŞİĞİNİN altında — gerekçeler aynen saklanıyor', async () => {
    // D-263: 8 KB üstü dizeler digest'e çevriliyor. Plan küçük kalmalı ki gerekçeler
    // defterde okunabilir dursun; okunamayan bir gerekçe, olmayan bir gerekçedir.
    const r = await kos(METIN)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const plan = (r.value.data as { tasarimPlani: TasarimPlani }).tasarimPlani
    for (const v of Object.values(plan)) expect(JSON.stringify(v).length).toBeLessThan(8192)
  })
})
