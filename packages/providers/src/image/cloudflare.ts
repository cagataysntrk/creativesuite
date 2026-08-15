// Bedava şerit: Cloudflare Workers AI (§7.3 · D-2, D-16).
//
// Bedava katman gerçekten bedava (günlük nöron kotası) ve ticari kullanıma açık —
// bu yüzden `free` şeridin varsayılanı. Maliyet formülü `0`, ama fiyat anlık görüntüsü
// **doğrulanmamış** olarak işaretli: kota aşımının nasıl faturalandığı bizim tarafımızda
// ölçülmedi ve "bedava" ile "kotası bitince ne olur" ayrı sorular (V-14).
//
// **Senkron API**: Workers AI görsel uçları isteği bekletip byte'ı doğrudan döndürür,
// kuyruk yok. Yani `start()` işi bitirir ve `status()` hafızadaki sonucu okur. Sahte bir
// kuyruk simüle etmiyoruz — sağlayıcının gerçek şekli buysa adaptör de o şekli taşımalı;
// uydurma bir asenkronluk, gerçekten asenkron olan sağlayıcıda hata ayıklamayı zorlaştırır.

import type { AppError, Money, MoneyRange } from '@suite/contracts'
import { ZERO_USD, err, ok, type Result } from '@suite/contracts'
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

const ID = 'cloudflare-workers-ai'
const MODEL_PATH = '@cf/black-forest-labs/flux-1-schnell'

/** Ortam değişkeninin ADI — değeri asla (R-51). */
const ACCOUNT_ENV = 'CF_ACCOUNT_ID'
const TOKEN_ENV = 'CF_API_TOKEN'

const CAPS: readonly CapabilityDecl[] = [imageCapability(['free'])]

/**
 * Sonuçlar süreç-içi. Kalıcılık defterin işi (`derived/runs`, §3.5): adaptör kendi
 * kalıcılığını kurarsa iki doğruluk kaynağı doğar ve hangisinin kazandığı belirsiz olur.
 */
const sonuclar = new Map<string, JobStatus>()

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

export const cloudflareImage: ProviderAdapter = {
  id: ID,
  title: 'Cloudflare Workers AI (bedava şerit)',

  capabilities: () => CAPS,

  validate: (input: ProviderInput): Result<ValidatedInput, AppError> =>
    validateImageInput(input, ['free']),

  // SENKRON (R-42). Bedava katman: aralık sıfır. Kota aşımı ayrı bir sorun ve
  // `available()` onu göremez — bu yüzden V-14 açık duruyor.
  estimate: (_vi: ValidatedInput): MoneyRange => rangeFromUnit(0n, 1),

  // SENKRON. Ağa çıkmaz; yalnız anahtarların TANIMLI olduğuna bakar.
  available: (env) => (env[ACCOUNT_ENV] ?? '') !== '' && (env[TOKEN_ENV] ?? '') !== '',

  start: async (vi, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    // İkinci savunma hattı: `validate()` atlanmış olabilir (test yardımcısı, replay,
    // refactor). R-20 tek bir fonksiyona güvenemeyecek kadar önemli.
    const guvenli = assertNoTextSuffix(vi)
    if (!guvenli.ok) return err(guvenli.error)

    const hesap = ctx.env[ACCOUNT_ENV] ?? ''
    const token = ctx.env[TOKEN_ENV] ?? ''
    if (hesap === '' || token === '') {
      return err(
        hata('provider_auth', 'MISSING_CREDENTIALS', ctx.correlationId, {
          needs: [ACCOUNT_ENV, TOKEN_ENV],
        })
      )
    }

    const aspect = vi.constraints['aspect'] as Aspect
    const boyut = ASPECT_PIXELS[aspect]

    const yanit = await httpFetch(
      {
        url: `https://api.cloudflare.com/client/v4/accounts/${hesap}/ai/run/${MODEL_PATH}`,
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          // Idempotency anahtarı BAŞLIKTA gider: sağlayıcı onu onurlandırmasa bile
          // kayıt/replay ve sağlayıcı destek talebi için izlenebilirlik sağlar (R-44).
          'idempotency-key': vi.idempotencyKey,
        },
        body: JSON.stringify({ prompt: vi.prompt, width: boyut.w, height: boyut.h }),
        signal: ctx.signal,
      },
      ctx.correlationId as AppError['correlationId']
    )
    if (!yanit.ok) return err(yanit.error)

    const govde = (await yanit.value.json()) as {
      success?: boolean
      result?: { image?: string }
      errors?: readonly { message?: string }[]
    }
    if (govde.success !== true || typeof govde.result?.image !== 'string') {
      return err(
        hata('provider_bad_response', 'MALFORMED_RESPONSE', ctx.correlationId, {
          // Sağlayıcının hata METNİ taşınır ama sağlayıcı NESNESİ taşınmaz (R-43):
          // yanıt şekli adaptör sınırını geçemez.
          providerMessage: govde.errors?.[0]?.message ?? null,
        })
      )
    }

    const handle: JobHandle = {
      providerId: ID,
      // Senkron API'de dış kimlik yok; idempotency anahtarı tutamağın kendisi olur.
      // Uydurma bir id üretmek, mutabakatta var olmayan bir kaydı aratmak olurdu.
      externalId: vi.idempotencyKey,
      idempotencyKey: vi.idempotencyKey,
    }
    sonuclar.set(handle.externalId, {
      state: 'succeeded',
      output: { format: 'base64', data: govde.result.image, width: boyut.w, height: boyut.h },
    })
    return ok(handle)
  },

  status: async (h): Promise<Result<JobStatus, AppError>> => {
    const s = sonuclar.get(h.externalId)
    if (s === undefined) {
      // Süreç yeniden başladı ve senkron sonuç hafızada yok. **Yalan söylemek yasak**:
      // "running" demek sonsuz polling, "succeeded" demek hayalet varlık olurdu.
      return err(
        hata('internal', 'RESULT_LOST', h.idempotencyKey, {
          externalId: h.externalId,
          reason: 'senkron sağlayıcı sonucu süreç-içiydi; yeniden üretim gerekiyor',
        })
      )
    }
    return ok(s)
  },

  cancel: async (h): Promise<void> => {
    sonuclar.delete(h.externalId)
  },

  // Bedava katman tutar bildirmiyor. `null` DÖNMEZ, sıfır döner: burada sıfır bir
  // bilgisizlik değil bir olgudur (§8.3'ün `unreported` ile ayrımı tam olarak bu).
  actualCost: async (_h): Promise<Money | null> => ZERO_USD,
}
