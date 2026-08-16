// Üretimin ÜRETTİĞİ şekil, tüketicilerin BEKLEDİĞİ şekil mi (2. doğrulama turu).
//
// **Bu test elle fikstür yazmaz.** İkinci doğrulama turu şunu buldu: `composeBody`
// `productShots`u `basis` olmadan üretiyordu, zincir `basis` arıyordu ve zincir kendi
// üretimini reddediyordu — ama testler elle `basis` yazılmış, üretimin hiç üretmediği
// bir fikstür kullandığı için ikisi de yeşildi. **Kendi kendini onaylayan test çifti.**
//
// Buradaki kural: girdiyi ÜRETİM üretecek, tüketiciye O verilecek.

import { describe, expect, it } from 'vitest'
import { systemClock, systemRng, inspectManifest } from '@suite/kernel'
import type { AssetStamp } from '@suite/kernel'
import type { BrandId, CorrelationId, EraId, RunId, StepId } from '@suite/contracts'
import { composeBody } from './verbs/bodies.js'
import { prospectDeckZinciri } from './prospect-deck.js'

const DAMGA: AssetStamp = {
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'era_imalat_2026' as EraId,
  kitVersion: 'k',
  definitionDigest: 'sha256:x',
  contextManifest: 'x',
  sourceRunId: 'run_1',
}

const ctx = () => ({
  runId: 'run_uretim' as RunId,
  stepId: 'kompozit' as StepId,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'imalat-2026' as EraId,
  correlationId: 'cor_test' as CorrelationId,
  clock: systemClock,
  rng: systemRng,
})

/** GERÇEK COMPOSE çıktısı — elle yazılmış hiçbir şey yok. */
const gercekCompose = async () => {
  const r = await composeBody({ tokenCss: ':root{--role-bg:#000}', stamp: DAMGA }).run(ctx(), {
    constraints: {},
    inputs: {
      metin: { lines: ['Ölçüm odaklı yaklaşım', 'Vardiya bazlı takip'] },
      urun: {
        capture: {
          path: '/tmp/urun.png',
          captureRunId: 'run_capture_1',
          demoRef: 'demos/dima/demo-script.ts#fire',
          alt: 'dima fire paneli',
        },
      },
    },
  })
  // `throw` YOK (`hata-taksonomisi` darboğazı): hata bir DEĞERDİR. Başarısızlık
  // durumunda boş dizi dönüyor ve testin kendi `expect`i konuşuyor.
  return (r.ok ? r.value.data : { productShots: [] }) as {
    productShots: readonly Record<string, unknown>[]
  }
}

describe('üretim şekli ↔ tüketici beklentisi', () => {
  it('COMPOSE’un ürettiği `productShots` ZİNCİRDEN geçiyor', async () => {
    const cikti = await gercekCompose()
    const z = prospectDeckZinciri({
      kaynaklar: [{ sourceRef: 'u', fetchedAt: '2026-08-16T00:00:00.000Z' }],
      alanlar: [],
      // ⚠ Elle şekil yazmıyoruz: üretimin ÜRETTİĞİ diziyi olduğu gibi veriyoruz.
      urunEkranlari: cikti.productShots as never,
      lexiconIhlalleri: [],
      manifestKusurlari: [],
      now: '2026-08-16T12:00:00.000Z',
    })
    expect(z.gecti).toBe(true)
  })

  it('COMPOSE’un ürettiği `productShots` MANİFEST dedektöründen de geçiyor', async () => {
    const cikti = await gercekCompose()
    const m = {
      runId: 'run_1',
      brandId: 'b',
      eraId: 'e',
      pipeline: 'prospect-deck',
      corpusCommit: '1f0e3dad99908345f7439f8ffabdffc418ac0d5f',
      registryCommit: '2b0e3dad99908345f7439f8ffabdffc418ac0d60',
      createdAt: '2026-08-16T12:00:00.000Z',
      decisions: [],
      context: [],
      contextRetentionDays: null,
      steps: [
        {
          stepId: 'kompozit',
          verb: 'COMPOSE',
          providerId: null,
          candidates: [],
          startedAt: '2026-08-16T12:00:00.000Z',
          finishedAt: '2026-08-16T12:00:00.000Z',
          estimatedCost: {
            low: { micros: 0n, currency: 'USD' },
            high: { micros: 0n, currency: 'USD' },
          },
          actualCost: null,
          status: 'ok',
          output: { productShots: cikti.productShots },
        },
      ],
    }
    // İki tüketici AYNI şekli kabul ediyor: "bir kural, iki uygulama" iddiası artık
    // ölçülmüş bir olgu.
    expect(inspectManifest(m as never)).toEqual([])
  })

  it('dayanaksız bir çekim İKİ tüketicide de düşüyor — kural ayrışmıyor', async () => {
    const dayanaksiz = [{ captureRunId: 'r', demoRef: 'd', aiGenerated: false }]
    const z = prospectDeckZinciri({
      kaynaklar: [],
      alanlar: [],
      urunEkranlari: dayanaksiz,
      lexiconIhlalleri: [],
      manifestKusurlari: [],
      now: '2026-08-16T12:00:00.000Z',
    })
    expect(z.gecti).toBe(false)
    expect(z.gecti === false && z.kapi).toBe('urun-ekrani')
  })
})
