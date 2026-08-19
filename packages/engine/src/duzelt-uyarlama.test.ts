// Düzeltme turunun ÇIKTISI zincire giriyor mu (§7.1 · D-268).
//
// ⚠ ⚠ **DÜZELTME ÜRETİLİYOR AMA KİMSE OKUMUYORDU.** Gerçek koşu: `sus-metni-kesiyor`
// iki kartta ölçüldü, `duzelt` adımı gövdeleri kısaltan geçerli bir uyarlama döndürdü,
// `render-son` AYNI kusurları AYNI yüzdeyle (%14,7 · %4,3) tekrar ölçtü. Yani düzeltme
// hiç uygulanmadı ve bir model çağrısı boşa gitti.
//
// Sebep: `uyarlamayaCevir` yalnız `sablon_uyarla` dalında çağrılıyordu. `duzelt` adımı
// `sablon_duzelt` taşıyor; çıktısı `{lines}` olarak kalıyor, `composeBody` `{uyarlama}`
// arıyor ve bulamayınca ÖNCEKİ uyarlamayla devam ediyordu.
//
// ⚠ Bugüne kadar görünmemesinin sebebi düzeltme turunun neredeyse hiç koşmamasıydı:
// ölçülen kusurlar `matlama-tutmuyor` gibi metinle düzelmeyen türlerdi ve
// `duzeltilebilir` onları eliyordu. Metinle düzelen ilk kusur türü eklenince kopukluk
// aynı gün ortaya çıktı — **kullanılmayan bir yol, bozuk olduğunu göstermez.**

import { describe, expect, it } from 'vitest'
import { ZERO_USD, ok, type CorrelationId, type RunId, type StepId } from '@suite/contracts'
import { fixedClock, seededRng } from '@suite/kernel'
import type { JobHandle, JobStatus, ProviderAdapter } from '@suite/providers'
import { generateBody } from './verbs/bodies.js'

const UYARLAMA = {
  sablonId: 'sahne',
  kartlar: [
    {
      ustBaslik: 'GÖZLEM',
      baslik: 'Herkes **Farklı** Söylüyor',
      govde: 'Vardiya sonunda herkes kendi izlenimini anlatıyor.',
      hayalet: 'İzlenim',
      rayaSol: 'GÖZLEM',
      rayaOrta: 'Ortak cevap yok',
    },
  ],
}

/** Modelin cevabı: kod çiti içinde JSON — gerçek koşuda tam olarak böyle geliyor. */
const CEVAP = `\`\`\`json\n${JSON.stringify(UYARLAMA)}\n\`\`\``

const adapter: ProviderAdapter = {
  id: 'p_sahte',
  title: 'Sahte',
  islerKalici: false,
  capabilities: () => [{ name: 'text.generate', lanes: ['free'], supports: {} }],
  validate: (input) => ok({ ...input, _validated: true }),
  estimate: () => ({ low: ZERO_USD, high: ZERO_USD }),
  available: () => true,
  start: async () =>
    ok({
      providerId: 'p_sahte',
      externalId: 'ext_1',
      idempotencyKey: 'idem_1',
    } satisfies JobHandle),
  status: async () => ok({ state: 'succeeded', output: { result: CEVAP } } as JobStatus),
  cancel: async () => undefined,
  actualCost: async () => ZERO_USD,
}

const CTX = {
  runId: 'run_t' as RunId,
  stepId: 'duzelt' as StepId,
  brandId: 'brd_t',
  eraId: 'era_t',
  correlationId: 'cor_t' as CorrelationId,
  clock: fixedClock('2026-08-19T00:00:00.000Z'),
  rng: seededRng(1),
}

/** Düzeltme turunun GERÇEK girdileri: ölçülmüş kusur + önceki uyarlama. */
const GIRDILER = {
  render: {
    kusurlar: [
      {
        tur: 'sus-metni-kesiyor',
        kart: 2,
        alan: 'govde',
        aciklama: "süs ögesi govde metninin %14.7'inin arkasından geçiyor",
      },
    ],
  },
  'sablon-uyarla': {
    uyarlama: {
      ...UYARLAMA,
      kartlar: [{ ...UYARLAMA.kartlar[0], govde: 'Uzun ve kısaltılması gereken bir gövde.' }],
    },
  },
}

const kos = async (constraints: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const v = generateBody({
    resolveAdapter: () => adapter,
    env: {},
    capability: 'text.generate',
    sleep: async () => undefined,
  })
  const r = await v.run(
    CTX as never,
    {
      capability: 'text.generate',
      providerId: 'p_sahte',
      constraints,
      inputs: GIRDILER,
      signal: new AbortController().signal,
    } as never
  )
  expect(r.ok).toBe(true)
  return (r.ok ? r.value.data : {}) as Record<string, unknown>
}

describe('düzeltme turu çıktısı', () => {
  it('`sablon_duzelt` çıktısı UYARLAMAYA çevriliyor — zincire giriyor', async () => {
    const d = await kos({ sablon_duzelt: true })
    const u = d['uyarlama'] as { kartlar?: { govde?: string }[] } | undefined
    expect(u?.kartlar?.[0]?.govde).toBe('Vardiya sonunda herkes kendi izlenimini anlatıyor.')
  })

  // ⚠ Bayrak YOKSA çeviri de YOK: metin adımlarının çıktısı bir uyarlama değildir ve
  // her çıktıyı uyarlamaya çevirmeye çalışmak, metin adımını hataya düşürürdü.
  it('bayrak yoksa uyarlama ÜRETİLMİYOR', async () => {
    const d = await kos({})
    expect(d['uyarlama']).toBeUndefined()
  })
})
