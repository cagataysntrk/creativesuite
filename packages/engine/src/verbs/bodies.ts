// Fiil gövdeleri — FAZ 3 hattının çalışan kısmı (§3.10, §10 · FAZ-3.14).
//
// **Gövdeler motorda değil, motorun ÜSTÜNDE yaşar.** Kernel'in `VERB_TABLE`ı sözleşmedir
// (ad, yan etki sınıfı, metered); gövdeler o sözleşmenin üstüne buradan yerleştirilir ve
// `resolveVerb` her çağrıda uyuşmayı doğrular (D-69).
//
// **Her gövde TEK yan etki sınıfına sadık** (R-04): `COMPOSE` saf, `RENDER` yalnız
// Chromium, `GENERATE` yalnız sağlayıcı. `COMPOSE`un sessizce bir model çağırması,
// çalıştırma öncesi maliyet tahminini yalan yapardı.

import type { AppError, Result, VerbName } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import {
  asciiLower,
  getVerb,
  makeError,
  validateDocument,
  type AssetStamp,
  type Block,
  type DocumentModel,
  type Verb,
  type VerbContext,
  type VerbOutput,
} from '@suite/kernel'
import { paginateDocument, renderStatic, renderWithinLimit, type LayoutName } from '@suite/render'
import type { ProviderAdapter, ProviderInput } from '@suite/providers'
import { providerCall } from '../provider-call.js'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

/** Gövdelere geçen girdi. `inputs` önceki adımların çıktıları — id ile anahtarlı. */
export interface BodyInput {
  readonly constraints: Readonly<Record<string, unknown>>
  readonly inputs: Readonly<Record<string, unknown>>
  /**
   * Yönlendiricinin SEÇTİĞİ sağlayıcı. Yalnız metered + yetenekli adımlarda dolu.
   *
   * Gövde bunu bilmeden `providerCall`ı kuramaz; ilk sürümde aktarılmıyordu ve
   * `providerCall` üretimden hiç çağrılmıyordu (D-141).
   */
  readonly providerId?: string
  /** Motorun tutamak köprüsü — sağlayıcı iş kimliğini verir vermez çağrılır (R-44). */
  readonly noteHandle?: (externalId: string) => void
  /** Önceki çalıştırmadan kalan tutamak. `null` değilse YENİ çağrı yapılmaz. */
  readonly resumeExternalId?: string | null
}

const hata = (
  kind: AppError['kind'],
  code: string,
  ctx: VerbContext,
  details: Readonly<Record<string, unknown>> = {}
): AppError =>
  makeError({
    kind,
    code,
    userMessageKey: `error.verb.${asciiLower(code)}`,
    correlationId: ctx.correlationId,
    details,
  })

/**
 * Sözleşmeyi kernel'den alıp gövdeyi üstüne koyar.
 *
 * `name`, `effectClass` ve `metered` **kernel'den kopyalanır**, elle yazılmaz: elle
 * yazılsaydı bir gövde `metered: false` diyerek bütçe kapısını atlayabilirdi (D-17) ve
 * `resolveVerb` de o yalanı doğrulardı — çünkü karşılaştırdığı şey aynı yalan olurdu.
 */
const govde = (
  name: VerbName,
  run: (ctx: VerbContext, input: BodyInput) => Promise<Result<VerbOutput, AppError>>
): Verb => {
  const sozlesme = getVerb(name)
  return {
    name: sozlesme.name,
    effectClass: sozlesme.effectClass,
    metered: sozlesme.metered,
    plan: sozlesme.plan,
    run: run as Verb['run'],
  }
}

// ── RESOLVE: tarif + registry → adım DAG'ı ──────────────────────────────────
// Hat zaten çözülmüş hâlde geliyor (`loadPipeline`); bu adım çözümü ONAYLAR ve
// çalıştırma parametrelerini dondurur. Görünüşte boş ama manifest'te bir satırı var:
// "hangi tanımla koştu" sorusunun cevabı burada başlar.
export const resolveBody = govde('RESOLVE', async (ctx, input) =>
  ok({
    costs: [],
    data: { brandId: ctx.brandId, eraId: ctx.eraId, constraints: input.constraints },
  })
)

// ── SELECT: retrieval yükleminden kayıt seçer ───────────────────────────────
export interface SelectDeps {
  /** Retrieval TEK yerden geçer (R-13); motor kendi sorgusunu KURMAZ. */
  readonly select: (
    query: string,
    limit: number
  ) => readonly { readonly id: string; readonly text: string }[]
}

export const selectBody = (deps: SelectDeps): Verb =>
  govde('SELECT', async (ctx, input) => {
    const q = typeof input.constraints['topic'] === 'string' ? input.constraints['topic'] : ''
    if (q === '') return err(hata('validation', 'MISSING_TOPIC', ctx))
    const kayitlar = deps.select(q, 8)
    if (kayitlar.length === 0) {
      // Sessizce boş bağlamla devam etmek yasak: bağlamsız üretilen metin markadan
      // değil modelin genel bilgisinden gelir ve bunu çıktıya bakarak ayırt etmek zor.
      return err(hata('not_found', 'NO_CONTEXT', ctx, { topic: q }))
    }
    return ok({ costs: [], data: { records: kayitlar } })
  })

// ── COMPOSE: SAF. Kayıtlar → belge modeli ───────────────────────────────────
export interface ComposeDeps {
  readonly tokenCss: string
  readonly stamp: AssetStamp
}

/**
 * Belge modelini kurar. **Hiç I/O yok** — `COMPOSE`un yan etki sınıfı `pure` (§3.10).
 *
 * Metin `inputs`tan gelir: `GENERATE` başarılıysa onun çıktısı, değilse `SELECT`in
 * kayıtları. İkinci yol, model çağrısı olmadan da gerçek bir slayt üretilebilmesini
 * sağlıyor — ve bu bir yedek değil, `free` şeridin dürüst hâli.
 */
export const composeBody = (deps: ComposeDeps): Verb =>
  govde('COMPOSE', async (ctx, input) => {
    const metinCiktisi = Object.values(input.inputs).find(
      (v): v is { readonly lines: readonly string[] } =>
        v !== null && typeof v === 'object' && Array.isArray((v as { lines?: unknown }).lines)
    )
    const kayitCiktisi = Object.values(input.inputs).find(
      (v): v is { readonly records: readonly { readonly text: string }[] } =>
        v !== null && typeof v === 'object' && Array.isArray((v as { records?: unknown }).records)
    )

    const satirlar =
      metinCiktisi?.lines ??
      kayitCiktisi?.records.map((r) => r.text.split('\n')[0] ?? '').filter((t) => t !== '') ??
      []

    if (satirlar.length === 0) return err(hata('validation', 'NO_CONTENT', ctx))

    const blocks: Block[] = [
      { type: 'heading', text: satirlar[0] as string, level: 1 },
      ...satirlar.slice(1, 4).map((t): Block => ({ type: 'body', text: t })),
    ]

    const w = typeof input.constraints['width'] === 'number' ? input.constraints['width'] : 1080
    const h = typeof input.constraints['height'] === 'number' ? input.constraints['height'] : 1350

    const doc: DocumentModel = {
      kind: 'post',
      width: w,
      height: h,
      tokenCss: deps.tokenCss,
      stamp: deps.stamp,
      blocks,
    }

    const gecerli = validateDocument(doc)
    if (!gecerli.ok) {
      // Geçersiz belge render EDİLMEZ: boş ya da alt-text'siz bir PNG üretmek,
      // sessiz bir hatadır ve kapıdan geçer görünür.
      return err(hata('validation', 'INVALID_DOCUMENT', ctx, { defects: gecerli.errors }))
    }
    return ok({ costs: [], data: { document: doc } })
  })

// ── RENDER: yalnız Chromium ─────────────────────────────────────────────────
export interface RenderDeps {
  readonly outDir: string
  /** Taşma bölme düzeni (§7.1). Küçültme YOK — bölme var. */
  readonly layout: LayoutName
  /**
   * Platform boyut sınırı (§9.1). Verilirse **kalite merdiveni GERÇEKTEN uygulanır**:
   * her basamak render edilir, dosya ölçülür, sığan ilk basamak kazanır.
   *
   * Verilmezse düz PNG. İlk sürümde merdiven yalnız TAHMİN ediyordu ve seçilen basamak
   * hiçbir yere gitmiyordu — 53KB'lık bir varlık 30KB limitine karşı sessizce
   * yayınlanıyordu (D-139).
   */
  readonly maxBytes?: number
}

export const renderBody = (deps: RenderDeps): Verb =>
  govde('RENDER', async (ctx, input) => {
    const belgeCiktisi = Object.values(input.inputs).find(
      (v): v is { readonly document: DocumentModel } =>
        v !== null && typeof v === 'object' && (v as { document?: unknown }).document !== undefined
    )
    if (belgeCiktisi === undefined) return err(hata('validation', 'NO_DOCUMENT', ctx))

    // Taşma BÖLER, asla küçültmez (§7.1): her slayt kendi PNG'si.
    const slaytlar = paginateDocument(belgeCiktisi.document, deps.layout)
    mkdirSync(deps.outDir, { recursive: true })

    const yollar: string[] = []
    const basamaklar: number[] = []
    const boyutlar: number[] = []
    for (const [i, slayt] of slaytlar.entries()) {
      const taban = join(deps.outDir, `slayt-${String(i + 1).padStart(2, '0')}.png`)
      if (deps.maxBytes === undefined) {
        const r = await renderStatic(slayt, taban)
        if (!r.ok) {
          return err(hata('render_failed', 'RENDER_FAILED', ctx, { slide: i + 1, error: r.error }))
        }
        yollar.push(taban)
        continue
      }
      // Merdiven: her basamak GERÇEK bir render ve GERÇEK bir ölçüm. Tükenirse hata —
      // son basamağı "en iyisi buydu" diye kabul etmek, sınırı aşan bir varlığı yayına
      // göndermektir (§9.1).
      const r = await renderWithinLimit(slayt, taban, deps.maxBytes)
      if (!r.ok) {
        return err(
          hata('render_failed', 'SIZE_LIMIT_EXCEEDED', ctx, { slide: i + 1, error: r.error })
        )
      }
      yollar.push(r.value.path)
      basamaklar.push(r.value.rungIndex + 1)
      boyutlar.push(r.value.bytes)
    }

    // `RENDER` metered: Chromium bir kaynak harcar ve süre de bir maliyettir (§8.3).
    // Tutar sıfır ama olayın KENDİSİ deftere yazılır — sıfır bir bilgisizlik değil,
    // burada bir olgu.
    return ok({
      costs: [
        {
          verb: 'RENDER' as VerbName,
          capability: 'image.render',
          providerId: 'local-chromium',
          amount: ZERO_USD,
          kind: 'actual' as const,
        },
      ],
      data: {
        slides: yollar,
        count: yollar.length,
        ...(basamaklar.length > 0 ? { rung: basamaklar, bytes: boyutlar } : {}),
      },
    })
  })

// ── VALIDATE: QA + lexicon, model yargısı YOK ───────────────────────────────
export interface ValidateDeps {
  readonly check: (
    doc: DocumentModel,
    slides: readonly string[]
  ) => Promise<{ readonly blocked: boolean; readonly report: string }>
}

export const validateBody = (deps: ValidateDeps): Verb =>
  govde('VALIDATE', async (ctx, input) => {
    const belge = Object.values(input.inputs).find(
      (v): v is { readonly document: DocumentModel } =>
        v !== null && typeof v === 'object' && (v as { document?: unknown }).document !== undefined
    )
    const render = Object.values(input.inputs).find(
      (v): v is { readonly slides: readonly string[] } =>
        v !== null && typeof v === 'object' && Array.isArray((v as { slides?: unknown }).slides)
    )
    if (belge === undefined || render === undefined) {
      return err(hata('validation', 'NOTHING_TO_VALIDATE', ctx))
    }

    const sonuc = await deps.check(belge.document, render.slides)
    if (sonuc.blocked) {
      // QA sınır dışıysa hat DURUR. "Uyarı verip devam etmek", tolerans okumasını
      // bir süse çevirirdi (§11.1).
      return err(hata('policy_blocked', 'QA_OUT_OF_TOLERANCE', ctx, { report: sonuc.report }))
    }
    return ok({ costs: [], data: { qa: sonuc.report } })
  })

// ── GENERATE: yalnız sağlayıcı ──────────────────────────────────────────────
export interface GenerateDeps {
  /** Yönlendiricinin seçtiği id'den adaptörü bulur. `adapterById` geçilir. */
  readonly resolveAdapter: (providerId: string) => ProviderAdapter | null
  /** Ortam AÇIKÇA verilir (§14); gövde `process.env`e dokunamaz. */
  readonly env: Readonly<Record<string, string>>
  readonly capability: string
  /** Test bunu 0 yapar; üretimde gerçekten bekler. */
  readonly sleep?: (ms: number, signal: AbortSignal) => Promise<void>
}

/**
 * `GENERATE` — **gerçek sağlayıcıya gider** (§3.10 · R-04).
 *
 * Zincir: yönlendirici kazananı seçer → gövde adaptörü bulur → `validate()` girdiyi
 * doğrular (prompt R-20 kurucusundan geçer) → `providerCall` işi başlatır, tutamağı
 * deftere yazdırır, jitter'lı polling yapar.
 *
 * İlk sürümde bu zincir YOKTU: `uret.mjs` sabit bir `MISSING_CREDENTIALS` döndüren
 * sahte bir köprü kuruyordu ve `cloudflareImage`/`falImage` adaptörlerine hiç
 * ulaşılmıyordu (D-141). Yani "iki şerit de görsel üretiyor" iddiası hiç sınanmamıştı.
 */
export const generateBody = (deps: GenerateDeps): Verb =>
  govde('GENERATE', async (ctx, input) => {
    const providerId = input.providerId
    if (providerId === undefined) return err(hata('internal', 'NO_ROUTED_PROVIDER', ctx))

    const adapter = deps.resolveAdapter(providerId)
    if (adapter === null) {
      return err(hata('config', 'ADAPTER_NOT_FOUND', ctx, { providerId }))
    }

    const serit = input.constraints['lane'] === 'premium' ? 'premium' : 'free'
    const ham: ProviderInput = {
      capability: deps.capability,
      lane: serit,
      prompt: typeof input.constraints['prompt'] === 'string' ? input.constraints['prompt'] : '',
      constraints: input.constraints,
      idempotencyKey: `${ctx.runId}:${ctx.stepId}`,
    }

    // `validate()` prompt'u R-20 kurucusundan geçirir; geçersizse sağlayıcıya HİÇ gidilmez.
    const dogrulanmis = adapter.validate(ham)
    if (!dogrulanmis.ok) return err(dogrulanmis.error)

    const call = providerCall({
      adapter,
      input: dogrulanmis.value,
      ctx: { correlationId: ctx.correlationId, env: deps.env },
      rng: ctx.rng,
      ...(deps.sleep === undefined ? {} : { sleep: deps.sleep }),
    })

    const sonuc = await call({
      signal: ctx.signal ?? new AbortController().signal,
      noteHandle: input.noteHandle ?? (() => undefined),
      resumeExternalId: input.resumeExternalId ?? null,
    })
    if (!sonuc.ok) return err(sonuc.error)

    return ok({
      costs: [
        {
          verb: 'GENERATE' as VerbName,
          capability: deps.capability,
          providerId,
          amount: sonuc.value.amount,
          kind: 'actual' as const,
        },
      ],
      data: sonuc.value.data,
    })
  })
