// Headless Claude Code adaptörü — `GENERATE`'in "akıl gerektiren" şeridi (§8.4 · D-8).
//
// Orkestrasyon TypeScript'te, akıl gerektiren adımlar Claude Code'da. **Mevcut abonelik
// kullanılır; ekstra API faturası yok** — bu yüzden `estimate()` sıfır aralık döndürür ve
// bu sıfır "bilinmiyor" değil, **gerçekten ücretsiz** demektir (abonelik zaten ödenmiş).
//
// Aynı yetenek API şeridine de düşebilmeli: bu adaptör `free` şeridinde yaşar, API
// sağlayıcıları `premium`de. Hangisinin koşacağı YÖNLENDİRİCİNİN kararıdır (R-40) —
// pipeline "text.generate" ister, "claude-code" istemez.
//
// R-43: Claude Code'un çıktı biçimi bu dosyanın DIŞINA sızmaz. `--output-format json`
// zarfı burada açılır; motor yalnız `unknown` bir `output` görür.

import type { AppError, CorrelationId, Money, MoneyRange, Result } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import { commandExists, makeError, spawnProcess } from '@suite/kernel'
import type {
  CapabilityDecl,
  JobHandle,
  JobStatus,
  ProviderAdapter,
  ProviderContext,
  ProviderInput,
  ValidatedInput,
} from './types.js'

const ID = 'claude-code'
const BIN = 'claude'

/**
 * İkiliyi ortamdan SABİTLEME kancası (D-244).
 *
 * ⚠ **Ölçülen tuzak:** bu makinede iki Claude Code kurulumu vardı —
 * `/usr/bin/claude` (global npm, emekli bir modele ayarlı, her çağrıda
 * `404 not_found_error`) ve `~/.claude/local/claude` (çalışan). PATH eskisini önce
 * buluyordu ve `available()` "var" diyordu: kapı yeşil, çağrı ölü.
 *
 * **Bir ikilinin PATH'te BULUNMASI, doğru ikili olduğunu göstermez.** Sürüm sormak
 * da yetmez; kırık olan şey sürüm değil yapılandırmaydı. Tek dürüst çözüm operatörün
 * sabitleyebilmesi.
 */
const BIN_ENV = 'CLAUDE_CODE_BIN'

const ikili = (env: Readonly<Record<string, string | undefined>>): string => {
  const ozel = env[BIN_ENV]
  return ozel !== undefined && ozel.trim() !== '' ? ozel : BIN
}

/** Tamamlanan çağrıların sonuçları — `status()` bunları okur. */
const sonuclar = new Map<string, JobStatus>()

const CAPS: readonly CapabilityDecl[] = [
  {
    name: 'text.generate',
    lanes: ['free'],
    supports: {
      locale: ['tr-TR', 'en-US'],
      // Yapılandırılmış çıktı destekleniyor; katı LLM şeması (§3.4) buradan geçebilir.
      output_format: ['text', 'json'],
    },
  },
  {
    name: 'reasoning.plan',
    lanes: ['free'],
    supports: { locale: ['tr-TR', 'en-US'] },
  },
]

const hata = (
  kind: AppError['kind'],
  code: string,
  correlationId: string,
  details?: Readonly<Record<string, unknown>>
): AppError =>
  makeError({
    kind,
    code,
    userMessageKey: `error.provider.${code}`,
    correlationId: correlationId as CorrelationId,
    ...(details === undefined ? {} : { details }),
  })

export const claudeCode: ProviderAdapter = {
  id: ID,
  title: 'Claude Code (headless, abonelik)',

  capabilities: () => CAPS,

  validate: (input: ProviderInput): Result<ValidatedInput, AppError> => {
    const cap = CAPS.find((c) => c.name === input.capability)
    if (cap === undefined) {
      return err(
        hata('validation', 'CAPABILITY_UNSUPPORTED', input.idempotencyKey, {
          capability: input.capability,
        })
      )
    }
    if (!cap.lanes.includes(input.lane)) {
      // Bu adaptör premium şeritte YAŞAMAZ: abonelik zaten ödenmiş, premium bir
      // şerit isteği başka sağlayıcıya gitmeli. Sessizce free'ye düşmek, kullanıcının
      // "premium istiyorum" kararını ezmek olurdu.
      return err(hata('validation', 'LANE_UNSUPPORTED', input.idempotencyKey, { lane: input.lane }))
    }
    if (input.prompt.trim() === '') {
      return err(hata('validation', 'EMPTY_PROMPT', input.idempotencyKey))
    }
    return ok({ ...input, _validated: true })
  },

  // SENKRON (R-42). Abonelik zaten ödenmiş: aralık gerçekten sıfır.
  estimate: (_vi: ValidatedInput): MoneyRange => ({ low: ZERO_USD, high: ZERO_USD }),

  // SENKRON. Ağa çıkmaz; yalnız ikili dosya PATH'te mi diye bakar.
  available: (env) => commandExists(ikili(env), env['PATH']),

  start: async (vi, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    // **Sessizce atlamaz.** Claude Code yoksa açık bir `provider_unavailable` döner;
    // yönlendirici bunu red gerekçesi olarak manifest'e yazar (§13).
    if (!claudeCode.available(ctx.env)) {
      return err(
        hata('provider_unavailable', 'CLAUDE_CODE_NOT_FOUND', ctx.correlationId, {
          binary: ikili(ctx.env),
          hint: 'claude PATH üzerinde bulunamadı',
        })
      )
    }

    const sonuc = await spawnProcess(ikili(ctx.env), ['-p', vi.prompt, '--output-format', 'json'], {
      env: ctx.env,
      signal: ctx.signal,
      timeoutMs: 10 * 60_000,
      // Alt süreç ortamı devralmaz: yalnız açıkça verilen anahtarlar geçer (§14).
    })

    const handle: JobHandle = {
      providerId: ID,
      externalId: vi.idempotencyKey,
      idempotencyKey: vi.idempotencyKey,
    }

    if (sonuc.aborted) {
      sonuclar.set(handle.externalId, { state: 'cancelled' })
      return ok(handle)
    }
    if (sonuc.timedOut) {
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('timeout', 'CLAUDE_CODE_TIMEOUT', ctx.correlationId),
      })
      return ok(handle)
    }
    if (sonuc.code !== 0) {
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('provider_bad_response', 'CLAUDE_CODE_EXIT', ctx.correlationId, {
          code: sonuc.code,
          // stderr KIRPILIR: sağlayıcı çıktısı bazen prompt'u yankılar ve prompt
          // secret içerebilir. Tam metin log'a girmez (§14).
          stderr: sonuc.stderr.slice(0, 500),
        }),
      })
      return ok(handle)
    }

    // Zarf BURADA açılır; dışarı yalnız `unknown` çıkar (R-43).
    let output: unknown
    try {
      output = JSON.parse(sonuc.stdout)
    } catch {
      output = { text: sonuc.stdout }
    }
    sonuclar.set(handle.externalId, { state: 'succeeded', output })
    return ok(handle)
  },

  status: async (h): Promise<Result<JobStatus, AppError>> =>
    ok(sonuclar.get(h.externalId) ?? { state: 'running' }),

  cancel: async (h): Promise<void> => {
    sonuclar.set(h.externalId, { state: 'cancelled' })
  },

  // Abonelik: sağlayıcı çağrı başına ücret BİLDİRMEZ. `null` değil sıfır dönüyoruz
  // çünkü burada bilmediğimiz bir şey yok — çağrı gerçekten ek ücret üretmedi (D-8).
  actualCost: async (): Promise<Money | null> => ZERO_USD,
}
