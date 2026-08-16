// 9. yasa kapısı MODEL ÇAĞRISINDAN ÖNCE koşuyor mu (§11.3 · R-33 · D-239).
//
// İlk bake-off'ta "two factory workers in safety vests and helmets" prompt'u
// `validate()`ten geçti, modele gitti ve iki yapay insan üretildi. R-20 yalnız METİN
// isteğini denetliyor; kişi isteği `assertCompliance` içindeydi — yani damgalama
// anında, para harcandıktan SONRA. Bu dosya kapının erkene alındığını ÖLÇÜYOR.

import { describe, expect, it } from 'vitest'
import type { BrandId, EraId, RunId, StepId } from '@suite/contracts'
import { fixedClock, seededRng } from '@suite/kernel'
import { generateBody } from './verbs/bodies.js'

const ctx = {
  runId: 'run_t' as RunId,
  stepId: 'gorsel' as StepId,
  brandId: 'brd_t' as BrandId,
  eraId: 'era_t' as EraId,
  correlationId: 'cor_t' as never,
  clock: fixedClock('2026-08-16T00:00:00.000Z'),
  rng: seededRng(1),
}

/** Adaptör ÇAĞRILIRSA testi düşürür: kapı çağrıdan önce durmalı. */
const cagrilmayanAdapter = {
  id: 'test',
  title: 'test',
  capabilities: () => [],
  estimate: () => ({
    low: { micros: 0n, currency: 'USD' as const },
    high: { micros: 0n, currency: 'USD' as const },
  }),
  available: () => true,
  validate: () => expect.unreachable('adaptör çağrıldı — kapı GEÇ kaldı'),
  start: async () => expect.unreachable('sağlayıcıya gidildi — para harcanırdı'),
  status: async () => expect.unreachable(''),
  cancel: async () => undefined,
}

const kos = async (prompt: string) => {
  const body = generateBody({
    resolveAdapter: () => cagrilmayanAdapter as never,
    env: {},
    capability: 'image.generate',
  })
  return body.run(
    ctx as never,
    {
      constraints: { prompt, aspect: '1:1', lane: 'free', provider_id: 'test' },
    } as never
  )
}

describe('insan isteyen prompt sağlayıcıya HİÇ gitmiyor', () => {
  it('işçi isteyen prompt reddediliyor — bake-off bunu üretmişti', async () => {
    const r = await kos('two factory workers in safety vests on a production floor')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('PROMPT_REQUESTS_PERSON')
  })

  it('portre isteği reddediliyor', async () => {
    const r = await kos('portrait of a smiling engineer')
    expect(r.ok).toBe(false)
  })

  it('insansız sahne kapıdan GEÇİYOR — kapı fazla geniş değil', async () => {
    // Kapıyı geçince yönlendirici adımına düşüyor: farklı bir hata kodu, yani
    // kişi kapısı DEĞİL. Yanlış pozitif de bir hatadır.
    const r = await kos('empty industrial control room, no people')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).not.toBe('PROMPT_REQUESTS_PERSON')
  })
})
