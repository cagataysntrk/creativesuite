import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import { openDb, manualClock, seededRng, type Db, type Verb, type VerbContext } from '@suite/kernel'
import { getVerb } from '@suite/kernel'
import {
  ZERO_USD,
  ok,
  err,
  usd,
  type BrandId,
  type EraId,
  type RunId,
  type VerbName,
} from '@suite/contracts'
import type { Pipeline } from '@suite/registry'
import { initLedger } from './cost/ledger.js'
import { readFrozenPlan } from './manifest-writer.js'
import { runPipeline, DEFTER_ANAHTARLARI } from './run.js'
import { adimCiktisiniYazDurum } from './adim-ciktisi.js'
import { runOutputDir } from './manifest-writer.js'
import { readManifest } from './manifest-writer.js'
import type { ProviderPricing } from './router/route.js'

const RUN = 'run_0192f3a1-0000-7000-8000-000000000060' as RunId

let tmp: TempDir
let db: Db
beforeEach(() => {
  tmp = makeTempDir('suite-run-')
  db = openDb({ path: ':memory:' })
  initLedger(db)
})
afterEach(() => tmp.cleanup())

/** Sözleşmeyi kernel'den alıp gövdeyi üstüne koyan sahte fiil. */
const sahte = (name: VerbName, run: Verb['run']): Verb => {
  const s = getVerb(name)
  return { name: s.name, effectClass: s.effectClass, metered: s.metered, plan: s.plan, run }
}

const basarili = (name: VerbName, veri: unknown, micros = 0n): Verb =>
  sahte(name, async () =>
    ok({
      costs: getVerb(name).metered
        ? [
            {
              verb: name,
              capability: 'test',
              providerId: 'p1',
              amount: usd(micros),
              kind: 'actual' as const,
            },
          ]
        : [],
      data: veri,
    })
  )

const dusen = (name: VerbName): Verb =>
  sahte(name, async (ctx: VerbContext) =>
    err({
      kind: 'provider_error' as never,
      code: 'PATLADI',
      userMessageKey: 'e',
      correlationId: ctx.correlationId,
      costIncurred: ZERO_USD,
      retryable: false,
    })
  )

const hat = (steps: Pipeline['steps']): Pipeline => ({
  id: 'test-hat',
  title: 'Test',
  steps,
  ciktiSinifi: 'organik',
  matris: null,
  retired: false,
})

const aday = (id: string) => [
  {
    providerId: id,
    title: id,
    lanes: ['free', 'premium'] as const,
    available: true,
    unavailableReason: null,
  },
]

const fiyat = (id: string, formula: string): Record<string, ProviderPricing> => ({
  [id]: {
    providerId: id,
    costFormula: formula,
    pricingVerified: true,
    quality: 50,
    latencySeconds: 1,
    supports: {},
  },
})

const kos = (steps: Pipeline['steps'], over: Record<string, unknown> = {}) =>
  runPipeline({
    repoRoot: tmp.path,
    pipeline: hat(steps),
    runId: RUN,
    brandId: 'brd_test' as BrandId,
    eraId: 'era_test' as EraId,
    corpusCommit: 'abc1234',
    registryCommit: 'def5678',
    verbs: {},
    pricing: {},
    candidatesFor: () => [],
    env: {},
    caps: { perRun: null, perMonth: null },
    db,
    clock: manualClock('2026-08-15T09:00:00.000Z'),
    rng: seededRng(1),
    sleep: async () => undefined,
    ...over,
  } as Parameters<typeof runPipeline>[0])

describe('hat uçtan uca', () => {
  it('bütün adımlar geçiyor ve manifest yazılıyor', async () => {
    const r = await kos(
      [
        { id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null },
        { id: 'b', verb: 'COMPOSE', capability: null, constraints: {}, needs: ['a'], gate: null },
      ],
      { verbs: { RESOLVE: basarili('RESOLVE', { x: 1 }), COMPOSE: basarili('COMPOSE', { y: 2 }) } }
    )
    expect(r.stoppedAt).toBeNull()
    expect(r.errors).toHaveLength(0)
    expect(r.manifestWrite.ok).toBe(true)
    expect(readManifest(tmp.path, RUN)?.steps).toHaveLength(2)
  })

  it('önceki adımın ÇIKTISI sonrakine geçiyor', async () => {
    let gorulen: unknown = null
    const r = await kos(
      [
        { id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null },
        { id: 'b', verb: 'COMPOSE', capability: null, constraints: {}, needs: ['a'], gate: null },
      ],
      {
        verbs: {
          RESOLVE: basarili('RESOLVE', { kaynak: 'a-çıktısı' }),
          COMPOSE: sahte('COMPOSE', async (_c, i) => {
            gorulen = (i as { inputs: Record<string, unknown> }).inputs['a']
            return ok({ costs: [], data: null })
          }),
        },
      }
    )
    expect(r.errors).toHaveLength(0)
    expect(gorulen).toEqual({ kaynak: 'a-çıktısı' })
  })

  it('ZORUNLU adım düşünce hat DURUYOR', async () => {
    const r = await kos(
      [
        { id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null },
        { id: 'b', verb: 'COMPOSE', capability: null, constraints: {}, needs: ['a'], gate: null },
        { id: 'c', verb: 'VALIDATE', capability: null, constraints: {}, needs: ['b'], gate: null },
      ],
      {
        verbs: {
          RESOLVE: basarili('RESOLVE', {}),
          COMPOSE: dusen('COMPOSE'),
          VALIDATE: basarili('VALIDATE', {}),
        },
      }
    )
    expect(r.stoppedAt).toBe('b')
    expect(r.errors).toHaveLength(1)
    // `c` HİÇ koşmadı: manifest iki adım taşıyor.
    expect(r.manifest.steps).toHaveLength(2)
  })

  it('İSTEĞE BAĞLI adım düşünce hat DEVAM ediyor', async () => {
    // Carousel'in arka plan görseli üretilemezse slayt düz zeminle render edilir ve bu
    // MEŞRU bir çıktıdır — "bedava ve premium tipografide aynıdır" (§8.2).
    const r = await kos(
      [
        { id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null },
        {
          id: 'b',
          verb: 'COMPOSE',
          capability: null,
          constraints: { optional: true },
          needs: ['a'],
          gate: null,
        },
        { id: 'c', verb: 'VALIDATE', capability: null, constraints: {}, needs: ['b'], gate: null },
      ],
      {
        verbs: {
          RESOLVE: basarili('RESOLVE', {}),
          COMPOSE: dusen('COMPOSE'),
          VALIDATE: basarili('VALIDATE', { qa: 'ok' }),
        },
      }
    )
    expect(r.stoppedAt).toBeNull()
    expect(r.errors).toHaveLength(1) // hata KAYBOLMUYOR, listeleniyor
    expect(r.manifest.steps).toHaveLength(3)
    expect(r.manifest.steps[1]?.status).toBe('failed')
    expect(r.manifest.steps[2]?.status).toBe('ok')
  })

  it('ATLANAN adım `skipped` — `ok` değil (FAZ-14.5)', async () => {
    // ⚠ **Üç durum, üç anlam.** `ok` işini yaptı, `failed` denedi olmadı, `skipped`
    // koştu ama yapılacak iş yoktu. Plan görsel yuvası açmadıysa brief üretilmez ve
    // bu bir başarı da değildir hata da: `ok` demek defterde "brief üretildi" yalanı
    // bırakırdı, `failed` demek DOĞRU bir kararı hata gibi gösterirdi.
    const r = await kos(
      [
        { id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null },
        { id: 'b', verb: 'COMPOSE', capability: null, constraints: {}, needs: ['a'], gate: null },
      ],
      {
        verbs: {
          RESOLVE: basarili('RESOLVE', {}),
          COMPOSE: basarili('COMPOSE', { atlandi: true, sebep: 'prompt-yok' }),
        },
      }
    )
    expect(r.stoppedAt).toBeNull()
    expect(r.manifest.steps[1]?.status).toBe('skipped')
    // Gerekçe deftere GİRİYOR: sessizce atlanan bir adım, atlanmamış bir adımdır.
    expect((r.manifest.steps[1]?.output as { sebep?: string })?.sebep).toBe('prompt-yok')
  })

  it('normal çıktı hâlâ `ok` — atlama işareti YOKKEN', async () => {
    const r = await kos(
      [{ id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null }],
      { verbs: { RESOLVE: basarili('RESOLVE', { qa: 'x' }) } }
    )
    expect(r.manifest.steps[0]?.status).toBe('ok')
  })

  it('İNSAN KAPISI hattı durduruyor — otomatik geçilmiyor', async () => {
    // Kapıyı otomatik geçmek, "agent önerir insan uygular" (§5.4) yasasının tek
    // mekanik karşılığını silmek olurdu.
    const r = await kos(
      [
        { id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null },
        {
          id: 'onay',
          verb: 'PROPOSE',
          capability: null,
          constraints: {},
          needs: ['a'],
          gate: 'insan-onayi',
        },
      ],
      { verbs: { RESOLVE: basarili('RESOLVE', {}), PROPOSE: basarili('PROPOSE', {}) } }
    )
    expect(r.awaitingGate).toBe('insan-onayi')
    expect(r.stoppedAt).toBe('onay')
    // PROPOSE HİÇ koşmadı — kapı çalıştırmadan önce durdurdu.
    expect(r.manifest.steps).toHaveLength(1)

    // **DİSKTEN okunuyor.** Rapor nesnesi süreçle birlikte ölür; onay kuyruğu ve bir
    // ay sonra dönen operatör bu bilgiyi dosyadan okumak zorunda (D-173). Rapor
    // alanını doğrulamak, alanın manifeste YAZILDIĞINI kanıtlamaz — 2026-08-16
    // denetimi "18 manifestin 0'ında awaitingGate" derken tam bu boşluğa bakıyordu.
    const diskten = readManifest(tmp.path, r.runId)
    expect(diskten?.awaitingGate).toBe('insan-onayi')
    expect(diskten?.stoppedAt).toBe('onay')
  })

  it('manifest BAŞARISIZ çalıştırmada da yazılıyor', async () => {
    // Yarıda kalan bir hattın nerede durduğu, başarılı bir hattınki kadar önemli —
    // hatta daha önemli, çünkü tekrar denenecek olan odur.
    const r = await kos(
      [{ id: 'a', verb: 'RESOLVE', capability: null, constraints: {}, needs: [], gate: null }],
      { verbs: { RESOLVE: dusen('RESOLVE') } }
    )
    expect(r.stoppedAt).toBe('a')
    expect(r.manifestWrite.ok).toBe(true)
    expect(readManifest(tmp.path, RUN)?.steps[0]?.status).toBe('failed')
  })
})

describe('bütçe tavanı hattı KİLİTLİYOR (D-17)', () => {
  const uretimHat = [
    { id: 'a', verb: 'RESOLVE' as const, capability: null, constraints: {}, needs: [], gate: null },
    {
      id: 'uret',
      verb: 'GENERATE' as const,
      capability: 'image.generate',
      constraints: { lane: 'premium', num_images: 1 },
      needs: ['a'],
      gate: null,
    },
  ]

  it('DONMUŞ plan varsa registry değişse bile ESKİ kararla koşuyor (R-07)', async () => {
    // Kabul kriterinin çekirdeği. Senaryo: operatör `p1`e $0.025 ile onay verdi;
    // onayla çalıştırma arasında `p1` registry'den kalktı ve `p2` $9.00 ile geldi.
    // Yeniden yönlendirseydik onaylanmayan bir sağlayıcı, onaylanmayan bir fiyatla
    // koşardı — ve fark ancak fatura gelince görülürdü.
    const donmus = {
      runId: RUN,
      pipeline: 'test-hat',
      brandId: 'brd_test',
      eraId: 'era_test',
      corpusCommit: 'abc1234',
      registryCommit: 'def5678',
      frozenAt: '2026-08-16T00:00:00.000Z',
      order: ['a', 'uret'],
      recordIds: [],
      totalLow: usd(25_000n),
      totalHigh: usd(25_000n),
      digest: 'sha256:test',
      steps: [
        {
          stepId: 'uret',
          verb: 'GENERATE',
          capability: 'image.generate',
          metered: true,
          providerId: 'p1',
          descriptorDigest: 'sha256:d1',
          confidence: 'green' as const,
          params: {},
          seed: null,
          estimatedCost: { low: usd(25_000n), high: usd(25_000n) },
        },
      ],
    }

    const r = await kos(uretimHat, {
      verbs: {
        RESOLVE: basarili('RESOLVE', {}),
        GENERATE: basarili('GENERATE', { url: 'x' }, 25_000n),
      },
      // Registry DEĞİŞTİ: p1 yok, p2 çok pahalı.
      candidatesFor: () => aday('p2'),
      pricing: fiyat('p2', '9.00'),
      caps: { perRun: usd(100_000n), perMonth: null },
      frozen: donmus,
    })

    expect(r.errors).toHaveLength(0)
    // Donmuş sağlayıcı koştu, yeni gelen DEĞİL.
    expect(r.manifest.steps[1]?.providerId).toBe('p1')
    // Donmuş tahmin kullanıldı: $9.00 hiçbir yere yazılmadı.
    expect(r.manifest.steps[1]?.estimatedCost.high.micros).toBe(25_000n)

    // **Donmuş plan DİSKE düştü** (FAZ-4.15). Yalnız bellekte kalsaydı `rerun` düğmesi
    // sessizce `replay`e dönerdi: kararı değil, bugünün tanımını tekrarlardı.
    const diskten = readFrozenPlan(tmp.path, r.runId)
    expect(diskten?.digest).toBe(donmus.digest)
    expect(diskten?.steps[0]?.providerId).toBe('p1')
    // Para kablo biçiminden geri OKUNDU: `bigint`, dize değil (D-163).
    expect(diskten?.steps[0]?.estimatedCost.high.micros).toBe(25_000n)
  })

  it('donmuş plan YOKSA yönlendirici normal çalışır — davranış değişmedi', async () => {
    const r = await kos(uretimHat, {
      verbs: {
        RESOLVE: basarili('RESOLVE', {}),
        GENERATE: basarili('GENERATE', { url: 'x' }, 25_000n),
      },
      candidatesFor: () => aday('p2'),
      pricing: fiyat('p2', '0.030'),
      caps: { perRun: usd(100_000n), perMonth: null },
    })
    expect(r.manifest.steps[1]?.providerId).toBe('p2')
  })

  it('tavanın ALTINDA koşuyor', async () => {
    const r = await kos(uretimHat, {
      verbs: {
        RESOLVE: basarili('RESOLVE', {}),
        GENERATE: basarili('GENERATE', { url: 'x' }, 25_000n),
      },
      candidatesFor: () => aday('p1'),
      pricing: fiyat('p1', '0.025'),
      caps: { perRun: usd(100_000n), perMonth: null },
    })
    expect(r.errors).toHaveLength(0)
    expect(r.manifest.steps[1]?.actualCost?.micros).toBe(25_000n)
  })

  it('tavanı AŞAN çalıştırma BAŞLAMIYOR — çağrı hiç yapılmıyor', async () => {
    let cagrildi = false
    const r = await kos(uretimHat, {
      verbs: {
        RESOLVE: basarili('RESOLVE', {}),
        GENERATE: sahte('GENERATE', async () => {
          cagrildi = true
          return ok({ costs: [], data: null })
        }),
      },
      candidatesFor: () => aday('p1'),
      pricing: fiyat('p1', '0.025'),
      caps: { perRun: usd(10_000n), perMonth: null }, // $0.01 < $0.025
    })
    expect(r.stoppedAt).toBe('uret')
    expect(r.errors[0]?.error.code).toBe('BUDGET_CAP_EXCEEDED')
    // ASIL İDDİA: sağlayıcı hiç çağrılmadı. Çağrılıp sonra reddedilseydi para
    // harcanmış olurdu ve tavan bir rapor olurdu, bir kapı değil.
    expect(cagrildi).toBe(false)
  })

  it('gerekçe TÜRKÇE ve SAYILI', async () => {
    const r = await kos(uretimHat, {
      verbs: { RESOLVE: basarili('RESOLVE', {}), GENERATE: basarili('GENERATE', {}, 25_000n) },
      candidatesFor: () => aday('p1'),
      pricing: fiyat('p1', '0.025'),
      caps: { perRun: usd(10_000n), perMonth: null },
    })
    const mesaj = String(r.errors[0]?.error.details?.['reason'] ?? '')
    expect(mesaj).toContain('Çalıştırma bütçesi aşılıyor')
    expect(mesaj).toContain('0.0250')
    expect(mesaj).toContain('0.0100')
  })

  it('SAĞLAYICI YOKSA gerekçeler taşınıyor — sessiz atlama yok', async () => {
    const r = await kos(uretimHat, {
      verbs: { RESOLVE: basarili('RESOLVE', {}), GENERATE: basarili('GENERATE', {}, 0n) },
      candidatesFor: () => [
        {
          providerId: 'p1',
          title: 'p1',
          lanes: ['free'] as const,
          available: true,
          unavailableReason: null,
        },
      ],
      pricing: fiyat('p1', '0.025'),
    })
    expect(r.errors[0]?.error.code).toBe('NO_PROVIDER')
    const gerekce = r.errors[0]?.error.details?.['rejected'] as string[]
    expect(gerekce[0]).toContain('premium şeridinde değil')
  })

  // ⚠ ⚠ **ANAHTARSIZ SÜRDÜRME ÜRETİLMİŞ GÖRSELLERİ SİLİYORDU.** Gerçek koşu
  // (`run_01a02989`): panelden onaylanıp sürdürülen bir hatta dört `gorsel-uret` adımı
  // da `NO_PROVIDER` ile düştü (`sops exec-env` yok → "yerel önkoşul sağlanmadı`).
  // Adımlar `optional` olduğu için hat DEVAM etti, `COMPOSE` görselsiz bir belge kurdu
  // ve `RENDER` onu yeniden çizdi: insanın onayladığı kesik özneler yerine dört YER
  // TUTUCU. Bir sürdürme, tamamlanmış bir işi BOZDU.
  it('sağlayıcı yok ama çıktı DEFTERDE — adım düşmüyor, defterden oynatılıyor', async () => {
    // Defterde duran çıktı: byte'ları `derived/blobs`ta olan bir görselin kaydı gibi.
    adimCiktisiniYazDurum(runOutputDir(tmp.path, RUN), 'uret', { url: 'defterden' })
    let gorulen: unknown = null
    const r = await kos(
      [
        ...uretimHat,
        {
          id: 'son',
          verb: 'COMPOSE' as const,
          capability: null,
          constraints: {},
          needs: ['uret'],
          gate: null,
        },
      ],
      {
        verbs: {
          RESOLVE: basarili('RESOLVE', {}),
          GENERATE: basarili('GENERATE', {}, 0n),
          COMPOSE: sahte('COMPOSE', async (_c, i) => {
            gorulen = (i as { inputs: Record<string, unknown> }).inputs['uret']
            return ok({ costs: [], data: { bitti: true } })
          }),
        },
        // Sağlayıcı YOK: `free` şeridinde premium isteyen adıma aday çıkmıyor.
        candidatesFor: () => [
          {
            providerId: 'p1',
            title: 'p1',
            lanes: ['free'] as const,
            available: true,
            unavailableReason: null,
          },
        ],
        pricing: fiyat('p1', '0.025'),
      }
    )
    // Adım DÜŞMEDİ ve hat durmadı: çağrılacak bir şey yoktu ki sağlayıcı gereksin.
    expect(r.errors).toHaveLength(0)
    expect(r.stoppedAt).toBeNull()
    // ⚠ Asıl ölçüm bu: çıktı AŞAĞI AKIŞA geçti. Adımın "ok" görünüp çıktıyı
    // kaybetmesi, tam olarak karoseli boşaltan davranıştı.
    expect(gorulen).toEqual({ url: 'defterden' })
  })
})

describe('insan kapısı kararı (§4c · D-145)', () => {
  const kapiliHat = [
    { id: 'a', verb: 'RESOLVE' as const, capability: null, constraints: {}, needs: [], gate: null },
    {
      id: 'onay',
      verb: 'PROPOSE' as const,
      capability: null,
      constraints: {},
      needs: ['a'],
      gate: 'insan-onayi',
    },
  ]
  const verbs = { RESOLVE: basarili('RESOLVE', {}), PROPOSE: basarili('PROPOSE', { ok: true }) }

  it('KARAR YOKSA hat kapıda duruyor', async () => {
    const r = await kos(kapiliHat, { verbs })
    expect(r.awaitingGate).toBe('insan-onayi')
    expect(r.manifest.steps).toHaveLength(1)
    expect(r.manifest.decisions).toHaveLength(0)
  })

  it("ONAYLANDIYSA kapı geçiliyor ve karar manifest'e yazılıyor", async () => {
    const r = await kos(kapiliHat, {
      verbs,
      decisions: [
        { gate: 'insan-onayi', decision: 'approved', at: '2026-08-15T09:00:00.000Z', note: null },
      ],
    })
    expect(r.awaitingGate).toBeNull()
    expect(r.stoppedAt).toBeNull()
    // `PROPOSE` GERÇEKTEN koştu.
    expect(r.manifest.steps).toHaveLength(2)
    expect(r.manifest.decisions[0]?.decision).toBe('approved')
  })

  it('REDDEDİLDİYSE hat duruyor ve GEREKÇE taşınıyor', async () => {
    // Red de bir karardır ve gerekçesi KALICIDIR: sonraki çalıştırmaya negatif kısıt
    // olarak girer (§12.9). Sessizce "durdu" demek gerekçeyi kaybederdi.
    const r = await kos(kapiliHat, {
      verbs,
      decisions: [
        {
          gate: 'insan-onayi',
          decision: 'rejected',
          at: '2026-08-15T09:00:00.000Z',
          note: 'başlık ikinci slaytta kesiliyor',
        },
      ],
    })
    expect(r.stoppedAt).toBe('onay')
    expect(r.errors[0]?.error.code).toBe('GATE_REJECTED')
    expect(r.errors[0]?.error.details?.['note']).toBe('başlık ikinci slaytta kesiliyor')
    // PROPOSE koşmadı: red bir kapıdır, bir uyarı değil.
    expect(r.manifest.steps).toHaveLength(1)
  })

  it('BAŞKA bir kapının kararı bu kapıyı AÇMIYOR', async () => {
    const r = await kos(kapiliHat, {
      verbs,
      decisions: [
        { gate: 'baska-kapi', decision: 'approved', at: '2026-08-15T09:00:00.000Z', note: null },
      ],
    })
    expect(r.awaitingGate).toBe('insan-onayi')
  })

  it("kararlar manifest'e AYNEN yazılıyor — `decisions: []` sabit kodu kalktı", async () => {
    const kararlar = [
      {
        gate: 'insan-onayi',
        decision: 'approved' as const,
        at: '2026-08-15T09:00:00.000Z',
        note: 'tamam',
      },
    ]
    await kos(kapiliHat, { verbs, decisions: kararlar })
    expect(readManifest(tmp.path, RUN)?.decisions).toEqual(kararlar)
  })
})

describe('defter beyaz listesi', () => {
  // ⚠ ⚠ Bu liste BEŞ KEZ eksik kaldı ve belirtisi her seferinde aynıydı: veri üretiliyor,
  // deftere hiç girmiyor, kimse fark etmiyor. Ancak gerçek bir koşunun manifest'ine
  // bakınca çıkıyor (D-216 · D-261). Bekçisi olmayan bir düzeltme altıncı kez eksilir.
  it('yargı çıktıları defterde — puan ve bulgu kaybolmuyor', () => {
    for (const k of ['puanlar', 'toplam', 'bulgular', 'reddedilen'])
      expect(DEFTER_ANAHTARLARI).toContain(k)
  })

  it('dedektörlerin okuduğu alanlar ve tasarım planı da listede', () => {
    for (const k of ['fetchedAt', 'personalizationFields', 'productShots', 'tasarimPlani'])
      expect(DEFTER_ANAHTARLARI).toContain(k)
  })

  it('belge ve byte taşıyan alanlar liste DIŞINDA kalmıyor ama elenmiş geliyor', () => {
    // `document` bilerek listede: `manifest-writer` 8 KB üstü dizeleri digest'e çeviriyor
    // (D-263), yani defter kanıtı tutuyor yükü değil.
    expect(DEFTER_ANAHTARLARI).toContain('document')
    expect(DEFTER_ANAHTARLARI).not.toContain('fontCss')
  })
})

// ── defterden oynatılan adımın çıktısı manifeste GİRİYOR mu ─────────────────
//
// ⚠ ⚠ **BU KUSUR, BİR ÖNCEKİ DÜZELTMENİN YAN ETKİSİYDİ.** Ücretsiz kapanmış kayıt artık
// yeniden koşmuyor (D-247 · D19) — doğru. Ama kayıt `outcome.data`yı yazıyordu ve o
// `null` dönüyor; manifest her geçişte YENİDEN yazıldığı için son geçiş, önceki geçişin
// yazdığı gerçek çıktıyı SİLİYORDU.
//
// Ölçülen zincir: `konu-sec` çıktısı manifeste `null` düştü → `islenmisKonular`
// manifestten okuyor → seçilen konu hiç "işlenmiş" sayılmadı → aday listesinde kaldı →
// bir sonraki koşu AYNI konuyu seçti. Depo sahibinin ilk şikâyeti buydu.
describe('defterden oynatma manifesti', () => {
  const hatKonu = [
    { id: 'a', verb: 'RESOLVE' as const, capability: null, constraints: {}, needs: [], gate: null },
    {
      id: 'konu-sec',
      verb: 'GENERATE' as const,
      capability: 'text.generate',
      constraints: { lane: 'free' },
      needs: ['a'],
      gate: null,
    },
  ]

  it('ikinci geçişte çıktı `null`a DÜŞMÜYOR — konu buharlaşmıyor', async () => {
    const ortak = {
      verbs: {
        RESOLVE: basarili('RESOLVE', {}),
        // Ücretsiz kapanan bir kayıt: abonelik çağrısı (claude-code) tam olarak böyle.
        GENERATE: basarili('GENERATE', { konu: 'Ölçüm pilotu' }, 0n),
      },
      candidatesFor: () => aday('p1'),
      pricing: fiyat('p1', '0'),
    }
    const birinci = await kos(hatKonu, ortak)
    expect(birinci.errors).toHaveLength(0)
    expect((birinci.manifest.steps[1]?.output as { konu?: string } | null)?.konu).toBe(
      'Ölçüm pilotu'
    )

    // İkinci geçiş: AYNI db, aynı runId — defter "bu iş bitti" diyor ve çağrı
    // yapılmıyor. Manifest yine de gerçeği yazmalı.
    const ikinci = await kos(hatKonu, ortak)
    expect(ikinci.errors).toHaveLength(0)
    expect((ikinci.manifest.steps[1]?.output as { konu?: string } | null)?.konu).toBe(
      'Ölçüm pilotu'
    )
  })
})
