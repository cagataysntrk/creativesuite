// Fiil gövdeleri — FAZ 3 hattının çalışan kısmı (§3.10, §10 · FAZ-3.14).
//
// **Gövdeler motorda değil, motorun ÜSTÜNDE yaşar.** Kernel'in `VERB_TABLE`ı sözleşmedir
// (ad, yan etki sınıfı, metered); gövdeler o sözleşmenin üstüne buradan yerleştirilir ve
// `resolveVerb` her çağrıda uyuşmayı doğrular (D-69).
//
// **Her gövde TEK yan etki sınıfına sadık** (R-04): `COMPOSE` saf, `RENDER` yalnız
// Chromium, `GENERATE` yalnız sağlayıcı. `COMPOSE`un sessizce bir model çağırması,
// çalıştırma öncesi maliyet tahminini yalan yapardı.

import type { AppError, Result, ToleranceReading, VerbName } from '@suite/contracts'
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
import {
  captureProductShot,
  deckPages,
  isLinkedinDocError,
  paginateDocument,
  promptRequestsPerson,
  renderDeckPdf,
  renderLinkedinDocument,
  LINKEDIN_PLATFORM_MAX_SAYFA,
  renderStatic,
  renderWithinLimit,
  type LayoutName,
} from '@suite/render'
import {
  fetchSource,
  isIngestFailure,
  planWaterfall,
  provenanceJson,
  publish,
  refusalMessage,
  type ProviderAdapter,
  type ProviderInput,
  type PublishAsset,
  type PublishRequest,
  type PublishingLimit,
  type TokenKaydi,
} from '@suite/providers'
import { RateLimiter } from '../ratelimit.js'
import { appendPublished, lookupPublished } from '../publish-ledger.js'
import { providerCall } from '../provider-call.js'
import { prospectDeckZinciri } from '../prospect-deck.js'
import type { Kaynak, KisiselAlan } from '@suite/kernel'
import { dirname, join } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

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
  /**
   * **Adımın yeteneği** — `image.generate`, `text.generate`…
   *
   * ⚠ Eskiden yoktu ve `generateBody` yeteneği KURULUM anında alıyordu
   * (`capability: 'image.generate'`). Tek bir gövde tüm `GENERATE` adımlarına
   * hizmet ettiği için metin adımı da görsel yeteneğiyle koşuyor ve
   * `CAPABILITY_UNSUPPORTED` alıyordu (D-241). Yetenek adımın VERİSİDİR, gövdenin
   * yapılandırması değil.
   */
  readonly capability?: string
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
  /**
   * Deck IR'ı — **KAYNAK, çıktı değil** (§4c · FAZ-6.1).
   *
   * ⚠ İkinci doğrulama turu: `deck.ir.json` yazılmıyordu, okunmuyordu ve `chart`/
   * `diagram` bloklarını ÜRETEN hiçbir gövde yoktu — yani "grafik PDF'te vektör"
   * kriteri üretimde hiçbir çıktıda görünmüyordu. IR bu boşluğu kapatıyor: benzer bir
   * deck geldiğinde LLM yeniden koşturulmaz, IR kopyalanıp düzenlenir.
   *
   * **Dosyayı CLI okur, bu gövde DEĞİL:** `COMPOSE`un yan etki sınıfı `pure` (§3.10)
   * ve saf bir fiil dosya açamaz. Ayrım korunuyor.
   */
  readonly ir?: DocumentModel | null
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

    // ── IR verildiyse blokların KAYNAĞI odur ────────────────────────────────
    // Metin üretimi atlanır: IR zaten insan tarafından düzenlenmiş bir belgedir ve
    // model onu "iyileştirmeye" çalışırsa düzenlemeyi geri alır.
    if (deps.ir !== undefined && deps.ir !== null) {
      const irBelge: DocumentModel = {
        ...deps.ir,
        // Damga ve token'lar ÇALIŞTIRMADAN gelir, IR'dan değil: bir varlık üretim anında
        // damgalanır (R-11) ve IR aylar önce yazılmış olabilir.
        tokenCss: deps.tokenCss,
        stamp: deps.stamp,
      }
      const irGecerli = validateDocument(irBelge)
      if (!irGecerli.ok) {
        return err(hata('validation', 'INVALID_IR', ctx, { defects: irGecerli.errors }))
      }
      return ok({
        costs: [],
        data: {
          document: irBelge,
          irKullanildi: true,
          ...kisisellestirmeCiktisi(input.constraints),
        },
      })
    }

    const satirlar =
      metinCiktisi?.lines ??
      kayitCiktisi?.records.map((r) => r.text.split('\n')[0] ?? '').filter((t) => t !== '') ??
      []

    if (satirlar.length === 0) return err(hata('validation', 'NO_CONTENT', ctx))

    // Önceki adımlardan gelen ürün ekranı çekimleri belgeye BLOK olarak giriyor.
    // `role: 'product_screenshot'` bir İDDİADIR: "ürün gerçekten böyle görünüyor".
    const cekimler = urunCekimleri(input.inputs)
    const blocks: Block[] = [
      { type: 'heading', text: satirlar[0] as string, level: 1 },
      ...satirlar.slice(1, 4).map((t): Block => ({ type: 'body', text: t })),
      ...cekimler.map((c): Block => ({
        type: 'image',
        src: c.path,
        alt: c.alt,
        decorative: false,
        role: 'product_screenshot',
      })),
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
    // ⚠ **`productShots` BURADA doğuyor** ve `role: 'product_screenshot'` bloklarının
    // karşılığıdır (FAZ 6 denetimi, bulgu 8: alanın okuyanı yoktu). Manifest dedektörü
    // (`fabricated_product_shot`) bu diziyi arıyor; blok ile defter kaydı aynı kaynaktan
    // türediği için biri diğerinden ayrışamaz.
    return ok({
      costs: [],
      data: {
        document: doc,
        ...kisisellestirmeCiktisi(input.constraints),
        ...(cekimler.length > 0
          ? {
              productShots: cekimler.map((c) => ({
                captureRunId: c.captureRunId,
                demoRef: c.demoRef,
                aiGenerated: false,
                // ⚠ `basis` ZORUNLU: zincirin 3. kapısı (`prospectDeckZinciri`) ve
                // `inspectManifest` bunu arıyor. İlk sürüm onu YAZMIYORDU ve zincir
                // kendi üretimini reddediyordu — testler ise elle `basis` yazılmış,
                // üretimin hiç üretmediği bir fikstür kullanıyordu. Kendi kendini
                // onaylayan test çifti (2. doğrulama turu).
                basis: {
                  kind: 'product_capture',
                  captureRunId: c.captureRunId,
                  demoRef: c.demoRef,
                },
              })),
            }
          : {}),
      },
    })
  })

/**
 * Kişiselleştirme alanları — **operatörün açıkça saydığı** prospect'e özgü alanlar.
 *
 * ⚠ İkinci doğrulama turu: bu anahtarın yalnız OKUYUCULARI vardı (`ozetle`,
 * `inspectManifest`, zincir toplayıcı) ve tek bir üreticisi yoktu — yani `kisisellestirme`
 * kapısı ve `personalization_cap` dedektörü ölüydü.
 *
 * **Neden operatör sayıyor, sistem çıkarmıyor:** tavan bir EDİTORYAL karardır (R-36) ve
 * "hangi cümle prospect'e özgü" sorusunun mekanik bir cevabı yok. Sistemin çıkarım
 * yapması, sayının anlamını kaybettirirdi. Operatör `--kisisellestirme "a,b,c"` yazar;
 * kapı sayar.
 */
const kisisellestirmeCiktisi = (
  constraints: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> => {
  const ham = constraints['personalization']
  if (typeof ham !== 'string' || ham.trim() === '') return {}
  const alanlar = ham
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x !== '')
  return alanlar.length === 0
    ? {}
    : {
        personalizationFields: alanlar.map((label, i) => ({
          id: `alan-${i + 1}`,
          label,
          sourceRef: 'operatör beyanı',
          confidence: 'direct' as const,
        })),
      }
}

/**
 * Önceki adımların ürettiği ürün ekranı çekimleri.
 *
 * Çekim yoksa boş döner ve belge ürün ekranı TAŞIMAZ — "ekran koyamadım" sessizce
 * uydurma bir ekrana dönüşemez (R-32).
 */
const urunCekimleri = (
  inputs: Readonly<Record<string, unknown>>
): readonly { path: string; alt: string; captureRunId: string; demoRef: string }[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const c = v as { capture?: unknown }
    if (c.capture === null || typeof c.capture !== 'object') return []
    const o = c.capture as Record<string, unknown>
    return typeof o['path'] === 'string' &&
      typeof o['captureRunId'] === 'string' &&
      typeof o['demoRef'] === 'string'
      ? [
          {
            path: o['path'],
            alt: typeof o['alt'] === 'string' ? o['alt'] : 'Ürün ekran görüntüsü',
            captureRunId: o['captureRunId'],
            demoRef: o['demoRef'],
          },
        ]
      : []
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
    // ── ürün ekranı çekimi (§10 · R-32 · FAZ-6.8, 6.10) ─────────────────────
    //
    // ⚠ `captureProductShot` yazılmış, test edilmiş ve **sıfır çağıranı** vardı (FAZ 6
    // denetimi, bulgu 6). `prospect-deck` hattındaki `urun-ekrani` adımı bu dalı
    // bekliyordu ve dal yoktu — yani hat koşsa bile ekran çekilmezdi.
    //
    // Çekim bir BELGE üretmez, bir GÖRÜNTÜ üretir; `COMPOSE` onu bloğa çevirir ve
    // `productShots` kaydını doğurur. Ayrım bilinçli: çekimi yapan kod kendi iddiasını
    // kurarsa, iddia kendi kendini onaylamış olur.
    if (input.constraints['capture'] === 'product') {
      const url = typeof input.constraints['url'] === 'string' ? input.constraints['url'] : ''
      const demoRef =
        typeof input.constraints['demo_ref'] === 'string' ? input.constraints['demo_ref'] : ''
      const hazir =
        typeof input.constraints['ready_selector'] === 'string'
          ? input.constraints['ready_selector']
          : 'body'
      if (url === '' || demoRef === '') {
        // Kaynaksız çekim iddiası denetlenemez; denetlenemeyen iddia beyandır (D-216).
        return err(hata('validation', 'CAPTURE_SOURCE_MISSING', ctx, { url, demoRef }))
      }
      mkdirSync(deps.outDir, { recursive: true })
      const yol = join(deps.outDir, 'urun-ekrani.png')
      const c = await captureProductShot({
        url,
        demoRef,
        captureRunId: String(ctx.runId),
        outPath: yol,
        width: typeof input.constraints['width'] === 'number' ? input.constraints['width'] : 1600,
        height: typeof input.constraints['height'] === 'number' ? input.constraints['height'] : 900,
        readySelector: hazir,
      })
      if (!c.ok) return err(hata('render_failed', 'CAPTURE_FAILED', ctx, { error: c.error }))
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
          capture: {
            path: c.value.path,
            captureRunId: c.value.captureRunId,
            demoRef: c.value.demoRef,
            alt: `Ürün ekran görüntüsü — ${demoRef}`,
          },
        },
      })
    }

    const belgeCiktisi = Object.values(input.inputs).find(
      (v): v is { readonly document: DocumentModel } =>
        v !== null && typeof v === 'object' && (v as { document?: unknown }).document !== undefined
    )
    if (belgeCiktisi === undefined) return err(hata('validation', 'NO_DOCUMENT', ctx))

    mkdirSync(deps.outDir, { recursive: true })

    // ── PDF yolu (§7.6 · FAZ-6.1, 6.3) ──────────────────────────────────────
    //
    // ⚠ **Bu dal FAZ 6 denetiminde EKSİK bulundu** (D-216): `renderDeckPdf` ve
    // `renderLinkedinDocument` yazılmış, test edilmiş ve hiç ÇAĞRILMAMIŞTI. Gövde her
    // zaman PNG yazıyordu; `format: pdf` kısıtı YAML'da duruyor ama kimse okumuyordu.
    // Diskte sıfır PDF vardı ve `deck.pdf üretiliyor` kriteri tikliydi.
    //
    // `flatten` ayrımı kanala ait (D-207): deck metin katmanını korur, LinkedIn
    // dökümanı rasterleşir.
    if (input.constraints['format'] === 'pdf') {
      const sayfalar = deckPages(belgeCiktisi.document, deps.layout)
      const duzlestir = input.constraints['flatten'] === true
      const cikti = join(deps.outDir, duzlestir ? 'dokuman.pdf' : 'deck.pdf')

      if (duzlestir) {
        // ⚠ `max_pages` kısıtı YAML'da duruyordu ve hiçbir kod okumuyordu; sınır
        // yalnız `LINKEDIN_DOC_MAX_SAYFA` sabitinden geliyordu (2. doğrulama turu,
        // bulgu 14). Ölü bir kısıt, okunduğu sanılan bir kısıttır — ve YAML'ı
        // değiştiren kişi hiçbir şeyin değişmediğini fark etmez.
        // **Platform sınırı ÖNCE** (2. doğrulama turu, M3): editoryal tavan önce
        // koşarsa 350 sayfalık bir belge "bizim kararımız, aşılabilir" (`max: 10`)
        // cevabı alır ve "tavanı 400 yapayım" refleksi doğar — D-223'ün tam olarak
        // önlemek istediği şey. Platform sınırı aşılamaz bir OLGU olduğu için
        // sıranın başında durur.
        if (sayfalar.length > LINKEDIN_PLATFORM_MAX_SAYFA) {
          return err(
            hata('validation', 'DOCUMENT_REJECTED', ctx, {
              refusal: {
                kind: 'platform_limit',
                count: sayfalar.length,
                max: LINKEDIN_PLATFORM_MAX_SAYFA,
              },
            })
          )
        }
        const maxPages = input.constraints['max_pages']
        if (typeof maxPages === 'number' && sayfalar.length > maxPages) {
          return err(
            hata('validation', 'DOCUMENT_REJECTED', ctx, {
              refusal: { kind: 'too_many_pages', count: sayfalar.length, max: maxPages },
            })
          )
        }
        const maxBytes = input.constraints['max_bytes']
        const r = await renderLinkedinDocument(
          sayfalar,
          cikti,
          typeof maxBytes === 'number' ? { maxBytes } : {}
        )
        if (!r.ok) return err(hata('render_failed', 'RENDER_FAILED', ctx, { error: r.error }))
        if (isLinkedinDocError(r.value)) {
          // Sayfa tavanı ve bayt tavanı BURADA zorlanıyor — "üretildi ama reddedilir"
          // bir dosya, reddedilen bir dosyadan tehlikelidir.
          return err(hata('validation', 'DOCUMENT_REJECTED', ctx, { refusal: r.value }))
        }
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
            document: r.value.path,
            pages: r.value.pageCount,
            quality: r.value.quality,
            bytes: r.value.bytes,
            flattened: true,
          },
        })
      }

      const r = await renderDeckPdf(sayfalar, cikti)
      if (!r.ok) return err(hata('render_failed', 'RENDER_FAILED', ctx, { error: r.error }))
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
          deck: r.value.path,
          pages: r.value.pageCount,
          oversizedPages: r.value.oversizedPages,
          flattened: false,
        },
      })
    }

    // Taşma BÖLER, asla küçültmez (§7.1): her slayt kendi PNG'si.
    const slaytlar = paginateDocument(belgeCiktisi.document, deps.layout)

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

    // Alt-text BELGEDEN okunuyor (R-34): görsel blokları sırayla slaytlara karşılık
    // geliyor. Uydurulmuş bir alt-text, kapının kendi ürettiği veriyi denetlemesi olurdu.
    const gorseller = slaytlar.flatMap((sayfa) =>
      ((sayfa as { blocks?: readonly unknown[] }).blocks ?? []).filter(
        (b): b is { readonly type: 'image'; readonly alt: string; readonly decorative?: boolean } =>
          (b as { type?: string }).type === 'image'
      )
    )

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
        // ⚠ **`assets` ÜRETİM tarafından basılıyor** (FAZ-8 denetimi, B2). `publishBody`
        // bu anahtarı arıyordu ve **hiçbir gövde onu üretmiyordu**: `renderBody`
        // `{slides, count}` veriyordu, yani `PUBLISH` her koşuda `NO_PUBLISHABLE_ASSET`
        // ile dönerdi. Daha kötüsü, testteki "RENDER çıktısının GERÇEK şekli" yorumu
        // bunu düzelttiğimi iddia ediyordu ve yanlıştı — aynı sınıfın BEŞİNCİ tekrarı
        // (D-216·222·224·8.3), bu sefer kendi kanıt yorumumun içinde.
        //
        // `altTr` belge modelinden geliyor, uydurulmuyor: `alt` boşsa boş kalır ve
        // yayın kapısı R-34 ile reddeder — doğru davranış. `digest` render edilen
        // BAYTIN özeti; CAS damgası koşu sonrasında basılıyor ve `PUBLISH` koşunun
        // İÇİNDE, o yüzden burada hesaplanıyor.
        assets: yollar.map((yol, i) => {
          const blok = gorseller[i]
          return {
            path: yol,
            altTr: blok?.alt ?? '',
            decorative: blok?.decorative === true,
            digest: `sha256:${createHash('sha256').update(readFileSync(yol)).digest('hex')}`,
          }
        }),
      },
    })
  })

// ── PROPOSE: çalışma ağacına yazan TEK fiil (§5.4 · R-14 · FAZ-6.10) ────────
//
// ⚠ **Gövdesi HİÇ YOKTU** (2. doğrulama turu, bulgu 9): `uret.mjs` fiil haritasında
// `PROPOSE` anahtarı yoktu ve `deck`, `linkedin-document`, `prospect-deck` üçü de
// `onay` adımıyla bitiyor. İnsan onaylayıp `--devam` dediğinde hat son adımda
// `VERB_NOT_IMPLEMENTED` ile patlıyordu — hiçbir manifestte `onay` adımı yok, yani
// bu yol hiç koşulmamıştı.
//
// **Bu gövde corpus'a YAZMAZ.** `PROPOSE`un yan etki sınıfı `write-tree` ama yazma
// darboğazı `packages/corpus/src/write.ts`te ve onay kuyruğu (FAZ-4.7) oradan geçiyor.
// Burada olan tek şey: onaylanmış çıktıyı ÖZETLEYİP deftere geçirmek. Yazmayı buraya
// koymak, onay kuyruğunu ATLAYAN ikinci bir yazma yolu açardı (R-14).

export const proposeBody = (): Verb =>
  govde('PROPOSE', async (ctx, input) => {
    // Kapı kararı motorda okunuyor (`run.ts`): buraya gelindiyse insan ONAYLADI.
    // Gövdenin işi kararı değil, SONUCU kaydetmek.
    const ciktilar = Object.values(input.inputs).filter(
      (v): v is Record<string, unknown> => v !== null && typeof v === 'object'
    )
    const varliklar = ciktilar.flatMap((o) => {
      const s = o['slides']
      if (Array.isArray(s)) return s.filter((x): x is string => typeof x === 'string')
      for (const anahtar of ['deck', 'document']) {
        const y = o[anahtar]
        if (typeof y === 'string') return [y]
      }
      return []
    })
    if (varliklar.length === 0) {
      // Onaylanacak bir şey yoksa onay bir kayıt değil, bir yanılsamadır.
      return err(hata('validation', 'NOTHING_TO_PROPOSE', ctx))
    }
    return ok({
      costs: [],
      data: {
        proposed: varliklar,
        proposedAt: ctx.clock.nowIso(),
      },
    })
  })

// ── INGEST: dış kaynak çeken TEK fiil (§14 · R-50 · D-40 · FAZ-6.10) ────────
//
// ⚠ **Bu gövde FAZ 6 denetiminde EKSİK bulundu** (D-216). Şelale, karantina, köken
// sidecar'ı ve enjeksiyon sınırı yazılmış ve test edilmişti — ama `INGEST` fiilinin
// gövdesi hiç yoktu. `uret.mjs`in fiil haritasında `INGEST` anahtarı bile yoktu, yani
// hattaki `arastir` adımı çalıştırılamıyordu.
//
// **Çıktı `fetchedAt` taşıyor** ve bu tesadüf değil: `inspectManifest`in `stale_source`
// dedektörü tam olarak o anahtarı arıyor (FAZ-6.6). Dedektör yazılmıştı, besleyeni
// yoktu — kural zincirinin kopuk halkası buydu.

export interface IngestDeps {
  /** Karantina kökü (repo kökü). Dosyalar `derived/ingest/<domain>/` altına iner. */
  readonly repoRoot: string
  /** Ortam — şelale hangi kaynakların hazır olduğunu buradan okur. Ağ ÇAĞIRMAZ. */
  readonly env: Readonly<Record<string, string | undefined>>
}

export const ingestBody = (deps: IngestDeps): Verb =>
  govde('INGEST', async (ctx, input) => {
    // Şelale planı: anahtarsız kaynak ATLANMIYOR, `bloke` işaretleniyor ve raporlanıyor.
    const plan = planWaterfall(deps.env)

    const url = typeof input.constraints['url'] === 'string' ? input.constraints['url'] : ''
    if (url === '') {
      // Kaynaksız `INGEST` sessizce boş dönmez: çekilecek bir şey yoksa bu bir HATADIR,
      // "hiçbir şey bulunamadı" değil. İkisi karışırsa araştırma yapılmamış bir deck
      // "araştırıldı" diye görünür.
      return err(
        hata('validation', 'NO_SOURCE_URL', ctx, {
          hazir: plan.hazirSayisi,
          bloke: plan.steps.filter((x) => x.durum === 'bloke').map((x) => x.id),
        })
      )
    }

    const r = await fetchSource({
      url,
      sourceId: 'own-site',
      confidence: 'direct',
      fetchedAt: ctx.clock.nowIso(),
      correlationId: ctx.correlationId,
      ...(ctx.signal === undefined ? {} : { signal: ctx.signal }),
    })
    if (isIngestFailure(r)) {
      return err(hata('io', 'INGEST_FAILED', ctx, { refusal: r }))
    }

    // Metin ve sidecar YAN YANA yazılıyor; sidecar metne GÖMÜLMÜYOR — gömülü meta veri
    // modele gider ve modelin okuduğu her satır bir enjeksiyon yüzeyidir (§14).
    const metinYolu = join(deps.repoRoot, r.paths.text)
    mkdirSync(dirname(metinYolu), { recursive: true })
    writeFileSync(metinYolu, r.text)
    writeFileSync(join(deps.repoRoot, r.paths.sidecar), provenanceJson(r.provenance))

    return ok({
      costs: [
        {
          verb: 'INGEST' as VerbName,
          capability: 'web.fetch',
          providerId: 'own-site',
          amount: ZERO_USD,
          kind: 'actual' as const,
        },
      ],
      data: {
        // ⚠ `fetchedAt` ve `sourceRef` manifest dedektörünün OKUDUĞU anahtarlar
        // (`stale_source`, FAZ-6.6). Adları değişirse dedektör sessizce körleşir.
        fetchedAt: r.provenance.fetchedAt,
        sourceRef: r.provenance.sourceRef,
        domain: r.provenance.domain,
        bytes: r.provenance.bytes,
        quarantinePath: r.paths.text,
        // Bloke kaynaklar RAPORLANIYOR: "5 kaynak tarandı" diyen ama 1 kaynak taramış
        // bir araştırma, eksik araştırmadan tehlikelidir (eksikliği görünmez).
        sourcesReady: plan.hazirSayisi,
        sourcesBlocked: plan.blokeSayisi,
      },
    })
  })

// ── VALIDATE: QA + lexicon, model yargısı YOK ───────────────────────────────
export interface ValidateDeps {
  /**
   * **Lexicon denetimi — çıktı biçiminden BAĞIMSIZ** (§11.2 · R-32, R-35).
   *
   * ⚠ İlk sürümde lexicon `check`in İÇİNDEYDİ ve `check` yalnız `slides` varken
   * çağrılıyordu. PDF çıktısı `slides` taşımaz → kaynaksız sayı kapısı `deck`,
   * `linkedin-document` ve `prospect-deck` hatlarında **hiç koşmuyordu** — yani fazın
   * çıxış kriteri ("her sayısal iddia `claim_source` taşıyor") üretimde zorlanmıyordu.
   * İkinci doğrulama turu yakaladı. Lexicon yalnız BELGEYE bakar; rastere değil.
   */
  readonly lint: (doc: DocumentModel) => readonly { readonly kind: string }[]
  readonly check: (
    doc: DocumentModel,
    slides: readonly string[]
  ) => Promise<{
    readonly blocked: boolean
    /** İnsan okunur rapor — CLI çıktısı ve hata gövdesi için. */
    readonly report: string
    /**
     * YAPILANDIRILMIŞ okumalar (§11.1 · FAZ-4.8).
     *
     * Rapor metni bir ÖLÜ UÇTUR: tolerans bileşeni sayının altına bant çizemez, çünkü
     * sayı bir dizenin içindedir. Ölçüm kaynağında zaten yapılandırılmış (`measure()`
     * `QaReport` döner); metne düzleştirip UI'da yeniden ayrıştırmak, aynı bilgiyi iki
     * kez temsil etmek ve ikisinin ayrışmasını beklemek olurdu.
     *
     * İsteğe bağlı: eski çağıranlar (yalnız metin veren) çalışmaya devam eder.
     */
    readonly readings?: readonly ToleranceReading[]
  }>
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
    // PDF çıktısı `slides` TAŞIMAZ (`deck` ya da `document` taşır). İlk sürüm yalnız
    // `slides` arıyordu ve PDF hattı `NOTHING_TO_VALIDATE` ile duruyordu — PDF yolunu
    // bağlarken açılan boşluk (FAZ-6.10).
    const pdf = Object.values(input.inputs).find(
      (v): v is { readonly deck?: string; readonly document?: string } =>
        v !== null &&
        typeof v === 'object' &&
        (typeof (v as { deck?: unknown }).deck === 'string' ||
          typeof (v as { document?: unknown }).document === 'string')
    )
    if (belge === undefined || (render === undefined && pdf === undefined)) {
      return err(hata('validation', 'NOTHING_TO_VALIDATE', ctx))
    }

    // ── lexicon: HER çıktı biçiminde (§11.2 · R-32) ─────────────────────────
    // Belgeye bakar, rastere değil — bu yüzden PDF yolunda da koşar. Kaynaksız sayısal
    // iddia yayınlanamaz ve bu kural çıktı biçimine göre değişmez.
    const lexIhlalleri = deps.lint(belge.document)
    if (lexIhlalleri.length > 0) {
      const turler = [...new Set(lexIhlalleri.map((v) => v.kind))].join(', ')
      return err(
        hata('policy_blocked', 'LEXICON_BLOCKED', ctx, {
          count: lexIhlalleri.length,
          kinds: turler,
          rule: 'R-32/R-35',
        })
      )
    }

    // Piksel QA yalnız PNG üzerinde anlamlı: ΔE ve kaplama ölçümleri bir raster ister.
    // PDF'te bu denetim **ATLANIYOR ve bu YAZILIYOR** — atlanan bir denetim "temiz"
    // değildir (D-175 ailesi) ve manifest ikisini ayırt edebilmeli.
    const sonuc =
      render === undefined
        ? { blocked: false, report: 'piksel QA ATLANDI: çıktı PDF, raster ölçüm yok' }
        : await deps.check(belge.document, render.slides)
    if (sonuc.blocked) {
      // QA sınır dışıysa hat DURUR. "Uyarı verip devam etmek", tolerans okumasını
      // bir süse çevirirdi (§11.1).
      return err(hata('policy_blocked', 'QA_OUT_OF_TOLERANCE', ctx, { report: sonuc.report }))
    }

    // ── zincir (§10 · D-216 · FAZ-6.9) ──────────────────────────────────────
    //
    // ⚠ **`chain:` kısıtı FAZ 6 denetiminde ÖLÜ bulundu**: `prospect-deck.pipeline.yaml`
    // onu yazıyordu, hiçbir kod okumuyordu ve `prospectDeckZinciri`nin sıfır çağıranı
    // vardı. Beş kapı yazılmış, test edilmiş ve hiç koşmamıştı.
    const zincirAdi = input.constraints['chain']
    if (zincirAdi === 'prospect-deck') {
      const z = prospectDeckZinciri({
        kaynaklar: ingestKaynaklari(input.inputs),
        alanlar: kisiselAlanlar(input.inputs),
        urunEkranlari: urunEkranlari(input.inputs),
        // Lexicon yukarıda KOŞTU ve boş çıktı (dolu olsaydı adım zaten durmuştu).
        // Zincire gerçek sonucu veriyoruz — eski hâli sabit `[]` geçiyordu ve yorumu
        // "check'in içinde koştu" diyordu; koşmamıştı (2. doğrulama turu).
        lexiconIhlalleri: lexIhlalleri,
        // Manifest kusurları YAYIN anında `inspectManifest`te bakılıyor: adım koşarken
        // manifest henüz yazılmadı ve olmayan bir defteri denetlemek uydurma olurdu.
        manifestKusurlari: [],
        now: ctx.clock.nowIso(),
      })
      if (!z.gecti) {
        return err(
          hata('policy_blocked', 'CHAIN_BLOCKED', ctx, {
            kapi: z.kapi,
            mesaj: z.mesaj,
            kosulanKapilar: z.kosulanKapilar,
          })
        )
      }
      return ok({
        costs: [],
        data: {
          qa: sonuc.report,
          ...(sonuc.readings === undefined ? {} : { qaReadings: sonuc.readings }),
          chain: 'prospect-deck',
          chainGates: z.kosulanKapilar,
        },
      })
    }

    return ok({
      costs: [],
      // Hem metin hem YAPILANDIRILMIŞ okuma manifeste gider: biri insan için, diğeri
      // ekran için. Yalnız metin yazsaydık imza öğesi (§11.1) hiç çizilemezdi.
      data: {
        qa: sonuc.report,
        ...(sonuc.readings === undefined ? {} : { qaReadings: sonuc.readings }),
      },
    })
  })

// ── zincir girdisini önceki adım ÇIKTILARINDAN toplar ───────────────────────
//
// Anahtar adları `inspectManifest`in aradıklarıyla AYNI olmak zorunda: `fetchedAt`,
// `personalizationFields`, `productShots`. Aynı veri hem adım anında (zincir) hem yayın
// anında (manifest) denetleniyor — iki kontrol noktası değil, aynı kuralın iki anı.

const ingestKaynaklari = (inputs: Readonly<Record<string, unknown>>): readonly Kaynak[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const o = v as { fetchedAt?: unknown; sourceRef?: unknown }
    return typeof o.fetchedAt === 'string'
      ? [
          {
            sourceRef: typeof o.sourceRef === 'string' ? o.sourceRef : 'bilinmiyor',
            fetchedAt: o.fetchedAt,
          },
        ]
      : []
  })

const kisiselAlanlar = (inputs: Readonly<Record<string, unknown>>): readonly KisiselAlan[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const alanlar = (v as { personalizationFields?: unknown }).personalizationFields
    if (!Array.isArray(alanlar)) return []
    return alanlar.map((a, i) => {
      const o = (a ?? {}) as Record<string, unknown>
      return {
        id: typeof o['id'] === 'string' ? o['id'] : `alan-${i}`,
        label: typeof o['label'] === 'string' ? o['label'] : String(a),
        sourceRef: typeof o['sourceRef'] === 'string' ? o['sourceRef'] : 'bilinmiyor',
        confidence: (o['confidence'] === 'direct' || o['confidence'] === 'corroborating'
          ? o['confidence']
          : 'pointer') as KisiselAlan['confidence'],
      }
    })
  })

const urunEkranlari = (
  inputs: Readonly<Record<string, unknown>>
): readonly { readonly aiGenerated?: unknown; readonly basis?: { readonly kind?: unknown } }[] =>
  Object.values(inputs).flatMap((v) => {
    if (v === null || typeof v !== 'object') return []
    const g = (v as { productShots?: unknown }).productShots
    return Array.isArray(g) ? (g as { aiGenerated?: unknown; basis?: { kind?: unknown } }[]) : []
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
    // **Yetenek ADIMDAN gelir** (D-241); `deps.capability` yalnız geriye dönük
    // varsayılan. Kurulumdan almak, tek bir gövdenin tüm `GENERATE` adımlarına
    // hizmet ettiği yerde metin adımını görsel yeteneğiyle koşturuyordu.
    const yetenek = input.capability ?? deps.capability

    // ── 9. yasa: SAĞLAYICI SEÇİLMEDEN ÖNCE (§11.3 · R-33 · D-239) ───────────
    //
    // ⚠ **Bu kapı bir adım GEÇ çalışıyordu.** `promptRequestsPerson` yalnız
    // `assertCompliance` içinde, yani DAMGALAMA anında koşuyordu. Sonuç: insan isteyen
    // bir prompt modele gidiyor, PARA HARCIYOR, görsel üretiliyor — ve ancak damga
    // aşamasında iddia kurulamıyor. İlk gerçek bake-off tam olarak bunu üretti:
    // "two factory workers in safety vests" prompt'u `validate()`ten geçti, çünkü R-20
    // yalnız METİN isteğini denetliyor, kişi isteğini değil.
    //
    // **Fail-closed olmak yetmez; ERKEN fail-closed olmak gerekir.** Harcanmış para
    // geri gelmez ve üretilmiş uyumsuz bir varlık diskte durur.
    //
    // En başta duruyor — yönlendirici bile çalışmadan. Reddedilecek bir iş için
    // sağlayıcı seçmek, seçimi manifest'e yazmak ve sonra reddetmek gürültüdür.
    //
    // Kontrol burada, `providers`ta DEĞİL: `providers` ile `render` kardeştir (§3.6)
    // ve birbirini import edemez. Deseni ikinci kez yazmak, iki listeden birinin
    // güncellenmemesi demekti — bu projenin en sık tekrarlayan hatası.
    if (yetenek.startsWith('image.') || yetenek.startsWith('video.')) {
      const istenenPrompt =
        typeof input.constraints['prompt'] === 'string' ? input.constraints['prompt'] : ''
      const insan = promptRequestsPerson(istenenPrompt)
      if (insan !== null) {
        return err(hata('policy_blocked', 'PROMPT_REQUESTS_PERSON', ctx, { matched: insan }))
      }
    }

    const providerId = input.providerId
    if (providerId === undefined) return err(hata('internal', 'NO_ROUTED_PROVIDER', ctx))

    const adapter = deps.resolveAdapter(providerId)
    if (adapter === null) {
      return err(hata('config', 'ADAPTER_NOT_FOUND', ctx, { providerId }))
    }

    const serit = input.constraints['lane'] === 'premium' ? 'premium' : 'free'

    // ── geçmiş redlerin gerekçesi: NEGATİF KISIT (§12.9 · D-191) ─────────────
    //
    // `DecisionEntry.reason`ın kendi dokümanı "sonraki çalıştırmaya negatif kısıt
    // olarak enjekte edilir" diyordu ve hiçbir yer enjekte etmiyordu: defter
    // yazılıyor, hiç okunmuyordu (2026-08-16 denetimi).
    //
    // ⚠ **Yalnız METİN yeteneklerine.** Red gerekçesi serbest Türkçe nesirdir ve
    // görsel prompt'una eklenirse iki şey olur: (1) "başlıktaki yazı fazla küçük"
    // gibi bir gerekçe R-20 kurucusunu tetikler ve çalıştırma reddedilir, (2) daha
    // kötüsü, metin İSTEYEN bir cümle görsel modeline gider. Görsel modeline Türkçe
    // metin çizdirilmez — on iki yasadan biri ve bir kolaylık için esnetilmez.
    const metinYetenegi = !yetenek.startsWith('image.')
    const kacinilacak =
      metinYetenegi && typeof input.constraints['kacinilacak'] === 'string'
        ? input.constraints['kacinilacak'].trim()
        : ''
    const temelPrompt =
      typeof input.constraints['prompt'] === 'string' ? input.constraints['prompt'] : ''

    const ham: ProviderInput = {
      capability: yetenek,
      lane: serit,
      prompt: kacinilacak === '' ? temelPrompt : `${temelPrompt}\n\nKAÇIN: ${kacinilacak}`,
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
          capability: yetenek,
          providerId,
          amount: sonuc.value.amount,
          kind: 'actual' as const,
        },
      ],
      data: sonuc.value.data,
    })
  })

// ── PUBLISH: kanal API'si çağıran TEK fiil (§9.2 · R-34, R-46 · FAZ-7.2) ────
//
// ⚠ **Bu gövde FAZ 7 denetiminde EKSİK bulundu — `INGEST`in birebir tekrarı** (D-216).
// Yayın kapıları, sıra sözleşmesi, defter, limiter ve OAuth yazılmış ve test edilmişti;
// ama `PUBLISH` fiilinin gövdesi yoktu ve `uret.mjs`in fiil haritasında `PUBLISH`
// anahtarı bile geçmiyordu. Yani `publish()`in tek çağıranı testlerdi: hat tip
// düzeyinde doğru, üretimde **erişilemez**.
//
// **Aynı hatanın iki fazda tekrarlaması tesadüf değil:** bir yetenek "bitti" sanılıyor
// çünkü modülü ve testi var. Eksik olan hep aynı yer — fiil haritası.
//
// **Tutkal BURADA, testte değil.** Denetim, defter ile yayıncıyı birbirine bağlayan
// adaptörün yalnız test dosyasında var olduğunu buldu (B3): test kendi kurduğu köprüyü
// ölçüyordu. Köprü artık üretimde ve testler onu ÇAĞIRIYOR.

export interface PublishBodyDeps {
  readonly repoRoot: string
  /** Oran kovası — motorun kovası, yayıncıya fonksiyon olarak iner (R-03). */
  readonly limiter: RateLimiter
  /** Token kaydı okuyucu. `null` = kayıt yok → yayın bloklu (FAZ-7.6). */
  readonly tokenKaydi: (provider: string) => TokenKaydi | null
  /** Kota sorgusu — gerçek kanal çağrısı. Yoksa yayın DURUR, varsayılmaz. */
  readonly publishingLimit?: (platform: string) => Promise<PublishingLimit>
  /** Gerçek yükleyici. Yoksa yayın DURUR: "yükleyici yok" sessiz başarı değildir. */
  readonly upload?: (req: PublishRequest) => Promise<Result<string, string>>
}

/**
 * Desteklenen platformlar — **çalışma anı doğrulaması**, tip değil.
 *
 * `PublishRequest['platform']` bir birleşim tipi ama YAML'dan gelen dize tip
 * sisteminden geçmiyor; sınırda doğrulanmazsa hata en derinde ve en anlamsız yerde
 * patlıyor.
 */
const DESTEKLENEN_PLATFORMLAR: readonly string[] = ['instagram', 'threads', 'linkedin']

/**
 * `PUBLISH`in bir varlıkta aradığı anahtarlar — **TEK tanım**.
 *
 * `renderBody` bunları basıyor, `yayinVarliklari` bunları okuyor. İki ayrı liste
 * olsaydı biri güncellenir diğeri unutulurdu; bu bulgu (FAZ-8 denetimi, B2) tam
 * olarak öyle doğdu: üretim `slides` basıyordu, tüketici `assets` arıyordu.
 */
export const PUBLISH_ARANAN_ANAHTARLAR = ['path', 'altTr', 'decorative', 'digest'] as const

/** Yayın yeteneği — oran kovasının anahtarı. Kanal durumu ekranıyla AYNI dize. */
export const YAYIN_YETENEGI = 'channel.publish'

export const publishBody = (deps: PublishBodyDeps): Verb =>
  govde('PUBLISH', async (ctx, input) => {
    // ⚠ Önce doğrulamasız cast vardı ve YAML'daki tek harflik bir yazım hatası
    // (`facebook`) tipli bir ret yerine ÇIPLAK `TypeError` veriyordu: `REQUIRED_SCOPES`
    // `undefined` dönüyor, `for…of` çöküyordu (FAZ-7 denetimi 2. tur, M2).
    // "Sıra tipe gömülü" garantisi ŞEKLİ kapsıyor, DEĞERLERİ değil.
    const ham = input.constraints['platform']
    if (typeof ham !== 'string' || !DESTEKLENEN_PLATFORMLAR.includes(ham)) {
      return err(
        hata('validation', 'UNSUPPORTED_PLATFORM', ctx, {
          verilen: typeof ham === 'string' ? ham : null,
          destekleyen: DESTEKLENEN_PLATFORMLAR,
        })
      )
    }
    const platform = ham as PublishRequest['platform']

    // Varlıklar ÜRETİMDEN gelir — testin elle yazdığı bir şekilden değil. `RENDER`
    // çıktısındaki yollar ve alt-text'ler burada toplanıyor; toplanamıyorsa yayın
    // yapılmaz (boş bir liste "yayınlanacak bir şey yok" demek DEĞİL, "girdiyi
    // bulamadım" demektir ve ikisi ayrı hatalardır).
    const varliklar = yayinVarliklari(input.inputs)
    if (varliklar.length === 0) {
      return err(hata('validation', 'NO_PUBLISHABLE_ASSET', ctx, { platform }))
    }

    if (deps.upload === undefined || deps.publishingLimit === undefined) {
      // **Yükleyici yoksa sessiz başarı YOK.** Gerçek kanal bağlantısı `7.2b`de ve
      // insan girdisi bekliyor; o gelene kadar bu fiil AÇIKÇA durur. "Yayınlandı
      // sayalım" diyen bir dal, defterde olmayan bir yayın üretirdi.
      return err(
        hata('io', 'CHANNEL_NOT_CONNECTED', ctx, {
          platform,
          neden: 'kanal adaptörü bağlı değil (FAZ-7.2b · V-26)',
        })
      )
    }

    const kayit = deps.tokenKaydi(platform === 'linkedin' ? 'linkedin' : 'meta')
    const istek: PublishRequest = {
      platform,
      placementId: String(input.constraints['placementId'] ?? ''),
      assets: varliklar,
      caption: String(input.constraints['caption'] ?? ''),
      runId: ctx.runId,
      now: ctx.clock.nowIso(),
    }

    const sonuc = await publish(istek, {
      // Token ÖMRÜ düz metinden, token'ın KENDİSİ sops'tan (FAZ-7.6). Kayıt yoksa
      // `null` geçiyor ve `publish` onu ölmüş sayıyor — bilinmeyen ömür, uzun ömür
      // değildir.
      tokenState: async () =>
        kayit === null ? null : { expiresAt: kayit.expiresAt, scopes: kayit.scopes },
      rateGate: (cost) => {
        const karar = deps.limiter.take(platform, YAYIN_YETENEGI, cost)
        return karar.allowed
          ? { allowed: true }
          : { allowed: false, retryAfterMs: karar.retryAfterMs }
      },
      publishingLimit: async () => deps.publishingLimit!(platform),
      lookupLedger: async (digest) => {
        const r = lookupPublished(deps.repoRoot, digest, platform)
        // Üç durum KORUNUYOR: okunamayan defter, boş deftere çökertilmiyor (B3).
        return r.ok
          ? { ok: true, entry: r.entry }
          : {
              ok: false,
              reason: r.error.kind === 'ledger_missing' ? 'missing' : 'unreadable',
              detay: r.error.kind === 'ledger_missing' ? r.error.path : r.error.reason,
            }
      },
      upload: deps.upload,
      // Defteri `publish()` yazıyor; gövde yalnız nereye yazılacağını biliyor.
      recordPublished: (kayitSatiri) =>
        appendPublished(deps.repoRoot, {
          digest: kayitSatiri.digest,
          platform: kayitSatiri.platform,
          externalId: kayitSatiri.externalId,
          runId: ctx.runId,
          publishedAt: kayitSatiri.publishedAt,
        }),
    })

    if (!sonuc.ok) {
      return err(
        hata('io', 'PUBLISH_REFUSED', ctx, {
          platform,
          kind: sonuc.error.kind,
          mesaj: refusalMessage(sonuc.error),
        })
      )
    }

    return ok({
      costs: [],
      data: {
        published: sonuc.value.externalId,
        platform,
        // Yayından ÖNCEKİ kota manifest'e yazılıyor: "yayın anında kota neredeydi"
        // sorusunun cevabı sonradan üretilemez.
        quotaBefore: `${sonuc.value.limitBefore.quotaUsed}/${sonuc.value.limitBefore.quotaTotal}`,
      },
    })
  })

/**
 * Yayınlanacak varlıkları ÖNCEKİ ADIM ÇIKTILARINDAN toplar.
 *
 * `RENDER` çıktısı `{ path, altTr, decorative, digest }` taşır; alt-text'i burada
 * uydurmuyoruz — uydurulsaydı R-34 kapısı kendi ürettiği veriyi denetlerdi.
 */
const yayinVarliklari = (inputs: Readonly<Record<string, unknown>>): PublishAsset[] => {
  const sonuc: PublishAsset[] = []
  for (const cikti of Object.values(inputs)) {
    if (cikti === null || typeof cikti !== 'object') continue
    const liste = (cikti as Record<string, unknown>)['assets']
    if (!Array.isArray(liste)) continue
    for (const ham of liste) {
      if (ham === null || typeof ham !== 'object') continue
      const o = ham as Record<string, unknown>
      if (typeof o['path'] !== 'string' || typeof o['digest'] !== 'string') continue
      // **Uyum kaydı ÜRETİMDEN gelir, burada uydurulmaz.** Eksikse `disclosureRequired`
      // `true` varsayılıyor: bilinmeyen bir ifşa durumu, "ifşa gerekmiyor" DEĞİLDİR
      // (D-175). Aksi hâlde alan eklemeyi unutan bir üretici, ifşa kapısını sessizce
      // kapatırdı — ve bu, kapının en çok gerektiği yerde kapanması olurdu.
      const u = o['compliance']
      const uyum = u !== null && typeof u === 'object' ? (u as Record<string, unknown>) : {}
      sonuc.push({
        path: o['path'],
        altTr: typeof o['altTr'] === 'string' ? o['altTr'] : '',
        decorative: o['decorative'] === true,
        digest: o['digest'],
        compliance: {
          disclosureRequired: uyum['disclosureRequired'] !== false,
          stamped: uyum['stamped'] === true,
          visibleDisclosure: uyum['visibleDisclosure'] === true,
        },
      })
    }
  }
  return sonuc
}
