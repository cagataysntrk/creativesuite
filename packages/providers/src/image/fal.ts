// Premium şerit: fal.ai kuyruk API'si (§7.3, §8.5 · D-2).
//
// **Gerçekten asenkron**: fal iş açar, `request_id` döner, sonuç polling ile alınır.
// Bu, Cloudflare'in senkron ucunun tam tersi ve iki şeklin de aynı `ProviderAdapter`
// sözleşmesine oturması sözleşmenin doğru çizildiğinin kanıtı (§8.4).
//
// **Webhook YOK** (§8.5): yerel makine NAT arkasında. `providerCall` jitter'lı polling
// yapar ve tutamak ilk poll'dan önce deftere yazılır — süreç ölse bile iş kaybolmaz ve
// yeniden başlatma İKİNCİ bir iş açmaz (R-44).
//
// **Fiyat tanımlayıcıdan gelir, buradan değil** (D-32). Bu dosyada tek bir dolar rakamı
// yok: `registry/providers/fal-flux.provider.yaml` + `_pricing/` anlık görüntüsü.
// Fiyatı koda gömmek, her fiyat değişikliğini bir sürüm çıkarmaya bağlardı.

import type { AppError, Money, MoneyRange } from '@suite/contracts'
import { err, ok, usd, type Result } from '@suite/contracts'
import { httpFetch, makeError } from '@suite/kernel'
import type {
  CapabilityDecl,
  JobHandle,
  JobStatus,
  ProviderAdapter,
  ProviderContext,
  ProviderInput,
  ValidatedInput,
} from '../types.js'
import {
  ASPECT_PIXELS,
  assertNoTextSuffix,
  imageCapability,
  rangeFromUnit,
  validateImageInput,
  type Aspect,
} from './lanes.js'

const ID = 'fal-flux'
const ENDPOINT = 'fal-ai/flux/dev'
const KEY_ENV = 'FAL_KEY'

/**
 * Tahmin için birim fiyat. **Tanımlayıcıdaki formülün yerini TUTMAZ** — yönlendirici
 * gerçek fiyatı `cost_formula`dan hesaplar (§8.2 aşama 2). Bu sayı yalnız adaptörün
 * kendi `estimate()`i için ve `providers` kapısı ikisinin ayrışmasını denetler.
 */
const BIRIM_MIKRO = 25_000n // $0.025 — fal-2026-08-15.json, verified: false

const CAPS: readonly CapabilityDecl[] = [imageCapability(['premium'])]

const hata = (
  kind: AppError['kind'],
  code: string,
  correlationId: string,
  details: Readonly<Record<string, unknown>> = {}
): AppError =>
  makeError({
    kind,
    code,
    userMessageKey: `error.image.${code}`,
    correlationId: correlationId as AppError['correlationId'],
    details,
  })

/** Sağlayıcının kuyruk durumları → bizim `JobStatus`. Şekil sınırı burada (R-43). */
const durumaCevir = (
  govde: { status?: unknown; images?: unknown },
  correlationId: string
): JobStatus => {
  const s = typeof govde.status === 'string' ? govde.status : ''
  if (s === 'IN_QUEUE' || s === 'IN_PROGRESS') return { state: 'running' }
  if (s === 'COMPLETED' || Array.isArray(govde.images)) {
    const gorseller = Array.isArray(govde.images) ? govde.images : []
    const ilk = gorseller[0] as { url?: unknown; width?: unknown; height?: unknown } | undefined
    if (typeof ilk?.url !== 'string') {
      return {
        state: 'failed',
        error: hata('provider_bad_response', 'NO_IMAGE_URL', correlationId),
      }
    }
    // **Sağlayıcı nesnesi geçmiyor** (R-43): yalnız okuduğumuz üç alan, kendi şeklimizde.
    return {
      state: 'succeeded',
      output: {
        format: 'url',
        data: ilk.url,
        width: typeof ilk.width === 'number' ? ilk.width : 0,
        height: typeof ilk.height === 'number' ? ilk.height : 0,
      },
    }
  }
  return {
    state: 'failed',
    error: hata('provider_bad_response', 'UNKNOWN_QUEUE_STATE', correlationId, { status: s }),
  }
}

export const falImage: ProviderAdapter = {
  id: ID,
  title: 'fal.ai FLUX (premium şerit)',

  capabilities: () => CAPS,

  validate: (input: ProviderInput): Result<ValidatedInput, AppError> =>
    validateImageInput(input, ['premium']),

  // SENKRON (R-42). Ağa çıkmaz — fiyat bir tablo okumasıdır, bir sorgu değil.
  estimate: (vi: ValidatedInput): MoneyRange => {
    const adet = typeof vi.constraints['num_images'] === 'number' ? vi.constraints['num_images'] : 1
    return rangeFromUnit(BIRIM_MIKRO, Math.max(1, Math.trunc(adet)))
  },

  available: (env) => (env[KEY_ENV] ?? '') !== '',

  start: async (vi, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    const guvenli = assertNoTextSuffix(vi)
    if (!guvenli.ok) return err(guvenli.error)

    const key = ctx.env[KEY_ENV] ?? ''
    if (key === '') {
      return err(
        hata('provider_auth', 'MISSING_CREDENTIALS', ctx.correlationId, { needs: [KEY_ENV] })
      )
    }

    const aspect = vi.constraints['aspect'] as Aspect
    const boyut = ASPECT_PIXELS[aspect]

    const yanit = await httpFetch(
      {
        url: `https://queue.fal.run/${ENDPOINT}`,
        method: 'POST',
        headers: {
          authorization: `Key ${key}`,
          'content-type': 'application/json',
          'idempotency-key': vi.idempotencyKey,
        },
        body: JSON.stringify({
          prompt: vi.prompt,
          image_size: { width: boyut.w, height: boyut.h },
          num_images: 1,
          // Sonuç URL'i döndürülüyor; base64'ü senkron modda istemek uzun işi
          // kuyruğun dışına taşır ve zaman aşımını sağlayıcıya devreder.
          sync_mode: false,
        }),
        signal: ctx.signal,
      },
      ctx.correlationId as AppError['correlationId']
    )
    if (!yanit.ok) return err(yanit.error)

    const govde = (await yanit.value.json()) as { request_id?: unknown }
    if (typeof govde.request_id !== 'string' || govde.request_id === '') {
      return err(hata('provider_bad_response', 'NO_REQUEST_ID', ctx.correlationId))
    }

    return ok({
      providerId: ID,
      externalId: govde.request_id,
      idempotencyKey: vi.idempotencyKey,
    })
  },

  status: async (h): Promise<Result<JobStatus, AppError>> => {
    // Kimlik `status()`e ortamdan GEÇMİYOR: sözleşme `status(h)` diyor ve tutamak
    // kimlik taşımıyor. Bu, sözleşmenin bilinen bir sınırı ve FAZ-3.7'de kapatılmadı —
    // `providerCall` bugün yalnız aynı süreçte polling yapıyor. V-15.
    const yanit = await httpFetch(
      { url: `https://queue.fal.run/${ENDPOINT}/requests/${h.externalId}` },
      h.idempotencyKey as AppError['correlationId']
    )
    if (!yanit.ok) return err(yanit.error)
    const govde = (await yanit.value.json()) as { status?: unknown; images?: unknown }
    return ok(durumaCevir(govde, h.idempotencyKey))
  },

  cancel: async (h): Promise<void> => {
    await httpFetch(
      { url: `https://queue.fal.run/${ENDPOINT}/requests/${h.externalId}/cancel`, method: 'PUT' },
      h.idempotencyKey as AppError['correlationId']
    )
  },

  // fal tutar bildirmiyor → `null`. **Tahmin KOPYALANMAZ** (§8.3): kopyalasaydık
  // "tahmini vs gerçek" sapma raporu yapısal olarak sıfır çıkardı, yani hiç ölçmemekle
  // aynı şey olurdu. `null` → defter `unreported` yazar ve sapma GÖRÜNÜR kalır.
  actualCost: async (_h): Promise<Money | null> => null,
}

/** Test ve `doctor` için: adaptörün beyan ettiği birim fiyat. */
export const FAL_UNIT_MICROS = BIRIM_MIKRO
export const FAL_UNIT_USD = usd(BIRIM_MIKRO)
