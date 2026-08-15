// Boru hattı koşturucusu — uçtan uca çalıştırma (§10, §13 · FAZ-3.14).
//
// **Motor beş şeyi BİR KEZ yapar** ve dokuz fiil de aynı yoldan geçer (`scheduler.ts`):
// bütçe kiralama → devre kesici → hız sınırı → idempotency → çağrı → defter kapatma.
// Bu dosya onun üstüne DAG yürüyüşünü, adım kayıtlarını ve manifest yazımını koyar.
//
// **Fiil gövdeleri ENJEKTE edilir, burada tanımlanmaz.** `RENDER` Chromium'a dokunur ve
// o kod `packages/render`ta; `GENERATE` sağlayıcıya dokunur ve o kod `packages/providers`ta.
// Motor gövdeyi görmez, yalnız sözleşmeyi (`resolveVerb`) doğrular.
//
// **Başarısız bir çalıştırma da bir ÇALIŞTIRMADIR.** Manifest her hâlükârda yazılır:
// yarıda kalan bir hattın ne kadar harcadığı ve nerede durduğu, başarılı bir hattınki
// kadar önemli — hatta daha önemli, çünkü tekrar denenecek olan odur.

import type {
  AppError,
  BrandId,
  CorrelationId,
  EraId,
  Money,
  RunId,
  StepId,
  VerbName,
} from '@suite/contracts'
import { ZERO_USD, usd } from '@suite/contracts'
import {
  asciiLower,
  makeError,
  systemClock,
  systemRng,
  type Clock,
  type Db,
  type ProviderCandidate,
  type Rng,
  type RunManifest,
  type StepRecord,
  type Verb,
  type VerbContext,
} from '@suite/kernel'
import { topoOrder, type Pipeline, type PipelineStep } from '@suite/registry'
import { CircuitBreaker } from './breaker.js'
import * as budget from './budget.js'
import { RateLimiter } from './ratelimit.js'
import { runStep, type CallOutcome, type StepSpec } from './scheduler.js'
import { resolveVerb, type VerbImplementations } from './verbs/registry.js'
import { route, type ProviderPricing, type RoutingDecision } from './router/route.js'
import { rejectionMessage } from './router/reasons.js'
import { writeManifest, type WriteResult } from './manifest-writer.js'
import { digest, idempotencyKey } from './idempotency.js'

export interface RunInput {
  readonly repoRoot: string
  readonly pipeline: Pipeline
  readonly runId: RunId
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly verbs: VerbImplementations
  readonly pricing: Readonly<Record<string, ProviderPricing>>
  readonly candidatesFor: (
    capability: string,
    env: Readonly<Record<string, string>>
  ) => readonly {
    readonly providerId: string
    readonly title: string
    readonly lanes: readonly ('free' | 'premium')[]
    readonly available: boolean
    readonly unavailableReason: string | null
  }[]
  readonly env: Readonly<Record<string, string>>
  /**
   * Çalıştırma parametreleri — her adımın kısıtlarına EKLENİR.
   *
   * Pipeline kısıtları **sözleşmedir** (bu hat neyi nasıl yapar); çalıştırma
   * parametreleri **örnektir** (bu sefer hangi konu, hangi şerit). Ayrım şart:
   * konuyu pipeline'a yazmak, her konu için ayrı bir YAML demekti.
   *
   * ⚠ Parametre kısıtı EZEMEZ. Pipeline `no_text: true` diyorsa çalıştırma anında
   * `false`a çevrilemez — R-20 bir çalıştırma tercihi değil, bir yasadır.
   */
  readonly params?: Readonly<Record<string, string | number | boolean>>
  readonly caps: budget.BudgetCaps
  readonly db: Db
  readonly clock?: Clock
  readonly rng?: Rng
  readonly limiter?: RateLimiter
  /**
   * Devre kesici. Verilmezse çalıştırma başına bir tane kurulur — ama **adım başına
   * ASLA**: adım başına taze bir kesici, 5 ardışık hata eşiğine hiç ulaşamaz (D-135).
   * Çağıran birden fazla çalıştırma arasında paylaşmak isteyebilir.
   */
  readonly breaker?: CircuitBreaker
  readonly signal?: AbortSignal
  /** Test bunu 0 yapar; üretimde gerçekten bekler. */
  readonly sleep?: (ms: number, signal: AbortSignal) => Promise<void>
}

export interface RunReport {
  readonly runId: RunId
  readonly manifest: RunManifest
  readonly manifestWrite: WriteResult
  /** Hangi adımda durdu — `null` ise hat sonuna kadar koştu. */
  readonly stoppedAt: StepId | null
  readonly errors: readonly { readonly stepId: StepId; readonly error: AppError }[]
  /** İnsan kapısına dayandı mı — onay bir yan etki değil, bir KAPIDIR (§4c). */
  readonly awaitingGate: string | null
  readonly budget: budget.BudgetState
  readonly outputs: Readonly<Record<string, unknown>>
}

/**
 * Adım **isteğe bağlı** mı: başarısızlığı hattı durdurmaz.
 *
 * Somut gerekçe: bir carousel'in arka plan görseli üretilemezse slayt düz zeminle
 * render edilir ve bu **meşru bir çıktıdır** — "bedava ve premium çıktı tipografide
 * aynıdır" (§8.2) vaadi zaten görselin taşıyıcı olmadığını söylüyor. Zorunlu saymak,
 * anahtarı olmayan bir kurulumda hattın hiç koşmaması demekti.
 *
 * ⚠ İsteğe bağlılık pipeline'da AÇIKÇA yazılır; motor tahmin etmez.
 */
const isteğeBagli = (s: PipelineStep): boolean => s.constraints['optional'] === true

/**
 * Adım çıktısının manifest'e girecek ÖZETİ.
 *
 * Ölçülebilir ve kısa olanı taşır: QA raporu, üretilen slayt sayısı ve yolları, seçilen
 * kalite basamağı. Belge modelini ya da byte'ları taşımaz — manifest bir defterdir,
 * bir depo değil (byte'lar `derived/blobs`ta, §3.5).
 */
const ozetle = (data: unknown): Readonly<Record<string, unknown>> | null => {
  if (data === null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const cikti: Record<string, unknown> = {}
  for (const anahtar of ['qa', 'slides', 'count', 'rung', 'bytes', 'format', 'width', 'height']) {
    if (o[anahtar] !== undefined) cikti[anahtar] = o[anahtar]
  }
  return Object.keys(cikti).length > 0 ? cikti : null
}

const hata = (
  code: string,
  correlationId: CorrelationId,
  detay: Readonly<Record<string, unknown>>
): AppError =>
  makeError({
    kind: 'internal',
    code,
    userMessageKey: `error.run.${asciiLower(code)}`,
    correlationId,
    details: detay,
  })

/**
 * Hattı uçtan uca koşar.
 *
 * Sıra `topoOrder` ile: bağımlılıklar önce. Paralellik YOK ve bu bilinçli — bir carousel
 * hattı sekiz adım ve paralellik kazancı, iki adımın aynı son 10 kuruşu ayrı ayrı
 * "uygun" görmesi riskine değmez (bütçe kiralaması bunu zaten engelliyor ama karmaşıklık
 * kalırdı). FAZ 5'te uzun render'lar için yeniden değerlendirilir.
 */
export const runPipeline = async (input: RunInput): Promise<RunReport> => {
  const clock = input.clock ?? systemClock
  const rng = input.rng ?? systemRng
  const signal = input.signal ?? new AbortController().signal

  const sira = topoOrder(input.pipeline)
  const adimlar = new Map(input.pipeline.steps.map((s) => [s.id, s]))

  // ⚠ Devre kesici çalıştırma başına BİR KEZ kurulur. İlk yazımda her adımda
  // `new CircuitBreaker()` çağrılıyordu: durum adım başına taze kalıyor, eşik 5 ardışık
  // hata ve tek adımda en fazla 3 deneme olduğu için kesici **yapısal olarak hiç
  // açılamıyordu** (D-135). Enjekte edilebilir: çağıran çalıştırmalar arası paylaşabilir.
  const breaker = input.breaker ?? new CircuitBreaker()

  const kayitlar: StepRecord[] = []
  const hatalar: { stepId: StepId; error: AppError }[] = []
  const ciktilar: Record<string, unknown> = {}
  let bState = budget.emptyBudget(input.caps)
  let durduguYer: StepId | null = null
  let bekleyenKapi: string | null = null

  for (const id of sira) {
    const ham = adimlar.get(id)
    if (ham === undefined) continue
    // Parametreler ÖNCE, kısıtlar SONRA: pipeline kısıtı her zaman kazanır.
    const s: PipelineStep = {
      ...ham,
      constraints: { ...(input.params ?? {}), ...ham.constraints },
    }
    const stepId = id as StepId
    const correlationId = `cor_${input.runId}_${id}` as CorrelationId

    // ── insan kapısı: onay bir yan etki değil, bir KAPIDIR (§4c) ───────────
    if (s.gate !== null) {
      // Kapıya gelindi ve hat DURUR. Kapıyı otomatik geçmek, "agent önerir insan
      // uygular" (§5.4) yasasının tek mekanik karşılığını silmek olurdu.
      bekleyenKapi = s.gate
      durduguYer = stepId
      break
    }

    const verbAdi = s.verb as VerbName
    const cozum = resolveVerb(verbAdi, input.verbs, correlationId)
    if (!cozum.ok) {
      hatalar.push({ stepId, error: cozum.error })
      durduguYer = stepId
      break
    }
    const verb: Verb = cozum.value

    // ── yönlendirme: hangi sağlayıcı, kaybedenler gerekçesiyle (§8.2) ──────
    const adaylar = s.capability === null ? [] : input.candidatesFor(s.capability, input.env)
    const yonlendirme: RoutingDecision | null =
      s.capability === null || adaylar.length === 0
        ? null
        : route(
            {
              capability: s.capability,
              lane: s.constraints['lane'] === 'premium' ? 'premium' : 'free',
              constraints: Object.fromEntries(
                Object.entries(s.constraints).filter(
                  (e): e is [string, string | number | boolean] =>
                    typeof e[1] === 'string' ||
                    typeof e[1] === 'number' ||
                    typeof e[1] === 'boolean'
                )
              ),
              params: Object.fromEntries(
                Object.entries(s.constraints).filter(
                  (e): e is [string, number] => typeof e[1] === 'number'
                )
              ),
              prefer: 'cost',
              maxCost:
                typeof s.constraints['max_cost_usd_micros'] === 'number'
                  ? usd(BigInt(Math.trunc(s.constraints['max_cost_usd_micros'])))
                  : null,
            },
            adaylar,
            input.pricing
          )

    const kazanan = yonlendirme?.winner ?? null
    const tahmin = kazanan?.cost ?? { low: ZERO_USD, high: ZERO_USD }
    const baslangic = clock.nowIso()

    const ctx: VerbContext = {
      runId: input.runId,
      stepId,
      brandId: input.brandId,
      eraId: input.eraId,
      correlationId,
      clock,
      rng,
      ...(input.signal === undefined ? {} : { signal: input.signal }),
    }

    // Metered fiiller motorun tam yolundan geçer; metered olmayanlar doğrudan koşar.
    // Ayrım gövdede değil SÖZLEŞMEDE: `verb.metered` kernel'in dediğidir (R-04).
    let sonuc: {
      readonly ok: boolean
      readonly outcome: CallOutcome | null
      readonly error: AppError | null
    }

    if (verb.metered && s.capability === null) {
      // **Yerel metered adım.** `RENDER` para harcamaz ama kaynak harcar ve süre de bir
      // maliyettir (§8.3) — o yüzden metered. Ama yönlendirilemez: `R-30` tek render
      // motoru diyor ve bir motoru "seçmek", ikinci bir motorun var olabileceğini
      // varsayar. Yönlendirici dışarıdaki sağlayıcılar içindir; Chromium içeride.
      const r = await runStep(
        {
          db: input.db,
          breaker,
          clock,
          rng,
          ...(input.limiter === undefined ? {} : { limiter: input.limiter }),
          ...(input.sleep === undefined ? {} : { sleep: input.sleep }),
        },
        {
          runId: input.runId,
          stepId,
          verb: verbAdi,
          capability: 'local',
          providerId: 'local',
          metered: true,
          idempotencyKey: idempotencyKey({
            runId: input.runId,
            stepId: id,
            verb: verbAdi,
            capability: 'local',
            providerId: 'local',
            model: null,
            seed: null,
            params: s.constraints,
            corpusCommit: input.corpusCommit,
            inputDigest: digest(id, JSON.stringify(ciktilar[s.needs[0] ?? ''] ?? null)),
          }),
          estimateHigh: ZERO_USD,
        },
        bState,
        async () => {
          const o = await verb.run(ctx, { constraints: s.constraints, inputs: ciktilar })
          return o.ok
            ? {
                ok: true as const,
                value: {
                  amount: o.value.costs.reduce<Money>(
                    (t, c) => usd(t.micros + c.amount.micros),
                    ZERO_USD
                  ),
                  chargeStatus: 'not-charged' as const,
                  externalId: null,
                  data: o.value.data,
                },
              }
            : { ok: false as const, error: o.error }
        },
        correlationId,
        signal
      )
      bState = r.budget
      sonuc = { ok: r.error === null, outcome: r.outcome, error: r.error }
    } else if (verb.metered) {
      if (kazanan === null) {
        // Sağlayıcı seçilemedi. Sessizce atlamak yasak: eleme gerekçeleri hatanın
        // içinde taşınıyor ki kullanıcı "anahtarı tanımla" ile "bu yeteneği kimse
        // yapmıyor" arasındaki farkı görebilsin.
        const gerekce = (yonlendirme?.rejected ?? []).map(
          (r) => `${r.providerId}: ${rejectionMessage(r.reason)}`
        )
        sonuc = {
          ok: false,
          outcome: null,
          error: hata('NO_PROVIDER', correlationId, {
            capability: s.capability,
            rejected: gerekce,
          }),
        }
      } else {
        const spec: StepSpec = {
          runId: input.runId,
          stepId,
          verb: verbAdi,
          capability: s.capability ?? '',
          providerId: kazanan.providerId,
          metered: true,
          idempotencyKey: idempotencyKey({
            runId: input.runId,
            stepId: id,
            verb: verbAdi,
            capability: s.capability ?? '',
            providerId: kazanan.providerId,
            model: null,
            seed: null,
            params: s.constraints,
            corpusCommit: input.corpusCommit,
            inputDigest: digest(id, JSON.stringify(ciktilar[s.needs[0] ?? ''] ?? null)),
          }),
          estimateHigh: tahmin.high,
        }
        const r = await runStep(
          {
            db: input.db,
            breaker,
            clock,
            rng,
            ...(input.limiter === undefined ? {} : { limiter: input.limiter }),
            ...(input.sleep === undefined ? {} : { sleep: input.sleep }),
          },
          spec,
          bState,
          async (c) => {
            // Seçilen sağlayıcı ve motorun tutamak köprüsü gövdeye AKTARILIR.
            // Aktarılmasaydı gövde hangi sağlayıcının kazandığını bilemez ve
            // `providerCall`ı kuramazdı — B8'in kökü buydu (D-141).
            let tutamak: string | null = null
            const o = await verb.run(ctx, {
              constraints: s.constraints,
              inputs: ciktilar,
              providerId: kazanan.providerId,
              noteHandle: (id: string) => {
                tutamak = id
                c.noteHandle(id)
              },
              resumeExternalId: c.resumeExternalId,
            })
            return o.ok
              ? {
                  ok: true as const,
                  value: {
                    amount: o.value.costs.reduce<Money>(
                      (t, c2) => usd(t.micros + c2.amount.micros),
                      ZERO_USD
                    ),
                    chargeStatus: 'charged' as const,
                    externalId: tutamak,
                    data: o.value.data,
                  },
                }
              : { ok: false as const, error: o.error }
          },
          correlationId,
          signal
        )
        bState = r.budget
        sonuc = { ok: r.error === null, outcome: r.outcome, error: r.error }
      }
    } else {
      const o = await verb.run(ctx, { constraints: s.constraints, inputs: ciktilar })
      sonuc = o.ok
        ? {
            ok: true,
            outcome: {
              amount: ZERO_USD,
              chargeStatus: 'not-charged',
              externalId: null,
              data: o.value.data,
            },
            error: null,
          }
        : { ok: false, outcome: null, error: o.error }
    }

    const adaylarKaydi: ProviderCandidate[] = [
      ...(kazanan === null
        ? []
        : [
            {
              providerId: kazanan.providerId,
              capability: s.capability ?? '',
              selected: true,
              rejectionReason: null,
              estimatedCost: kazanan.cost,
            },
          ]),
      ...(yonlendirme?.rejected ?? []).map((r) => ({
        providerId: r.providerId,
        capability: s.capability ?? '',
        selected: false,
        rejectionReason: rejectionMessage(r.reason),
        estimatedCost: null,
      })),
    ]

    kayitlar.push({
      stepId,
      verb: verbAdi,
      status: sonuc.ok ? 'ok' : 'failed',
      lane: s.constraints['lane'] === 'premium' ? 'premium' : 'free',
      capability: s.capability,
      providerId: kazanan?.providerId ?? null,
      model: null,
      seed: null,
      params: s.constraints,
      estimatedCost: tahmin,
      // **Gerçek maliyet tahminden KOPYALANMAZ** (§8.3). Adım koşmadıysa `null`.
      actualCost: sonuc.outcome?.amount ?? null,
      candidates: adaylarKaydi,
      startedAt: baslangic,
      finishedAt: clock.nowIso(),
      // **Adım çıktısının ÖZETİ manifest'e girer** (D-136). İlk sürümde QA raporu
      // yalnız konsola basılıyordu; "QA skorları manifest'te" çıkış kriteri
      // karşılanmıyordu ve altı ay sonra "bu görsel hangi ölçümlerle geçti"
      // sorusunun cevabı hiçbir yerde yoktu.
      // Tam çıktı DEĞİL özet: bir belge modelini manifest'e gömmek dosyayı şişirir ve
      // `git diff`i okunamaz yapar. Özet, ölçülebilir olanı taşır.
      output: ozetle(sonuc.outcome?.data ?? null),
    })

    if (sonuc.ok) {
      ciktilar[id] = sonuc.outcome?.data ?? null
      continue
    }

    if (sonuc.error !== null) hatalar.push({ stepId, error: sonuc.error })
    if (!isteğeBagli(s)) {
      durduguYer = stepId
      break
    }
    // İsteğe bağlı adım düştü: kayıt tutuldu, hata listelendi, hat DEVAM ediyor.
    ciktilar[id] = null
  }

  const manifest: RunManifest = {
    runId: input.runId,
    brandId: input.brandId,
    eraId: input.eraId,
    pipeline: input.pipeline.id,
    corpusCommit: input.corpusCommit,
    registryCommit: input.registryCommit,
    createdAt: clock.nowIso(),
    steps: kayitlar,
    decisions: [],
    context: [],
    contextRetentionDays: 90,
  }

  // Manifest HER HÂLÜKÂRDA yazılır: yarıda kalan bir hattın ne kadar harcadığı ve
  // nerede durduğu, başarılı bir hattınki kadar önemli.
  const yazim = writeManifest({ repoRoot: input.repoRoot, manifest })

  return {
    runId: input.runId,
    manifest,
    manifestWrite: yazim,
    stoppedAt: durduguYer,
    errors: hatalar,
    awaitingGate: bekleyenKapi,
    budget: bState,
    outputs: ciktilar,
  }
}

/** Rapor özeti — CLI bunu basar. */
export const formatRun = (r: RunReport): string => {
  const satirlar: string[] = []
  satirlar.push(`  çalıştırma ${r.runId}  ·  ${r.manifest.pipeline}`)
  satirlar.push('')
  for (const s of r.manifest.steps) {
    const h = r.errors.find((e) => e.stepId === s.stepId)
    const isaret = h === undefined ? '✓' : '✗'
    const tutar =
      s.actualCost === null ? '—' : `$${(Number(s.actualCost.micros) / 1_000_000).toFixed(4)}`
    satirlar.push(
      `  ${isaret} ${String(s.stepId).padEnd(14)} ${s.verb.padEnd(9)} ` +
        `${(s.providerId ?? '—').padEnd(22)} ${tutar}`
    )
    if (h !== undefined) {
      satirlar.push(
        `      ${h.error.code}${h.error.details === undefined ? '' : `: ${JSON.stringify(h.error.details)}`}`
      )
    }
  }
  satirlar.push('')
  if (r.awaitingGate !== null) {
    satirlar.push(`  ⏸ insan kapısında durdu: ${r.awaitingGate} — onay bir kapıdır (§4c)`)
  } else if (r.stoppedAt !== null) {
    satirlar.push(`  ✗ ${r.stoppedAt} adımında durdu`)
  } else {
    satirlar.push('  ✓ hat sonuna kadar koştu')
  }
  satirlar.push(
    r.manifestWrite.ok
      ? `  manifest: ${r.manifestWrite.path}`
      : `  ✗ manifest YAZILAMADI: ${r.manifestWrite.defects.map((d) => d.kind).join(', ')}`
  )
  return satirlar.join('\n')
}
