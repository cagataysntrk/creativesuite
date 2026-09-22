// ChatGPT bridge provider — deterministic, file-seeded responses for native JUST runs.
// No network call. Enabled only when SUITE_CHAT_SEED_FILE points to an explicit seed map.

import { existsSync, readFileSync } from 'node:fs'
import type { AppError, CorrelationId, Money, MoneyRange, Result } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import { makeError } from '@suite/kernel'
import type { CapabilityDecl, JobHandle, JobStatus, ProviderAdapter, ProviderContext, ProviderInput, ValidatedInput } from './types.js'

const ID = 'chat-seed'
const ENV = 'SUITE_CHAT_SEED_FILE'
const CAPS: readonly CapabilityDecl[] = [
  { name: 'text.generate', lanes: ['free'], supports: { locale: ['tr-TR', 'en-US'], output_format: ['text', 'json'] } },
  { name: 'reasoning.plan', lanes: ['free'], supports: { locale: ['tr-TR', 'en-US'] } },
  { name: 'image.critique', lanes: ['free'], supports: { locale: ['tr-TR'], output_format: ['json'] } },
  { name: 'design.critique', lanes: ['free'], supports: { locale: ['tr-TR'], output_format: ['json'] } },
]
const sonuclar = new Map<string, JobStatus>()
const hata = (kind: AppError['kind'], code: string, correlationId: string, details?: Readonly<Record<string, unknown>>): AppError =>
  makeError({ kind, code, userMessageKey: `error.provider.${code}`, correlationId: correlationId as CorrelationId, ...(details === undefined ? {} : { details }) })
const seedYolu = (env: Readonly<Record<string, string | undefined>>): string | null => {
  const p = env[ENV]
  return p !== undefined && p.trim() !== '' ? p.trim() : null
}
const adimId = (key: string): string => {
  const i = key.indexOf(':')
  return i === -1 ? key : key.slice(i + 1)
}
export const chatSeed: ProviderAdapter = {
  id: ID,
  title: 'ChatGPT seed bridge (deterministic)',
  islerKalici: false,
  capabilities: () => CAPS,
  validate: (input: ProviderInput): Result<ValidatedInput, AppError> => {
    const cap = CAPS.find((c) => c.name === input.capability)
    if (cap === undefined) return err(hata('validation', 'CAPABILITY_UNSUPPORTED', input.idempotencyKey, { capability: input.capability }))
    if (!cap.lanes.includes(input.lane)) return err(hata('validation', 'LANE_UNSUPPORTED', input.idempotencyKey, { lane: input.lane }))
    if (input.prompt.trim() === '') return err(hata('validation', 'EMPTY_PROMPT', input.idempotencyKey))
    return ok({ ...input, _validated: true })
  },
  estimate: (_vi: ValidatedInput): MoneyRange => ({ low: ZERO_USD, high: ZERO_USD }),
  available: (env) => {
    const p = seedYolu(env)
    return p !== null && existsSync(p)
  },
  start: async (vi: ValidatedInput, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    const handle: JobHandle = { providerId: ID, externalId: vi.idempotencyKey, idempotencyKey: vi.idempotencyKey }
    const p = seedYolu(ctx.env)
    if (p === null || !existsSync(p)) {
      sonuclar.set(handle.externalId, { state: 'failed', error: hata('provider_unavailable', 'CHAT_SEED_FILE_MISSING', ctx.correlationId, { env: ENV }) })
      return ok(handle)
    }
    let map: Record<string, unknown>
    try {
      const ham: unknown = JSON.parse(readFileSync(p, 'utf8'))
      if (ham === null || typeof ham !== 'object' || Array.isArray(ham)) throw new Error('root-object-required')
      map = ham as Record<string, unknown>
    } catch (e) {
      sonuclar.set(handle.externalId, { state: 'failed', error: hata('provider_bad_response', 'CHAT_SEED_INVALID', ctx.correlationId, { path: p, error: String(e) }) })
      return ok(handle)
    }
    const stepId = adimId(vi.idempotencyKey)
    const value = map[stepId]
    if (typeof value !== 'string' || value.trim() === '') {
      sonuclar.set(handle.externalId, { state: 'failed', error: hata('provider_bad_response', 'CHAT_SEED_STEP_MISSING', ctx.correlationId, { stepId, path: p, available: Object.keys(map).sort() }) })
      return ok(handle)
    }
    sonuclar.set(handle.externalId, { state: 'succeeded', output: { result: value } })
    return ok(handle)
  },
  status: async (h): Promise<Result<JobStatus, AppError>> => {
    const s = sonuclar.get(h.externalId)
    if (s !== undefined) return ok(s)
    return ok({ state: 'failed', error: hata('internal', 'JOB_NOT_RESUMABLE', h.idempotencyKey, { externalId: h.externalId }) })
  },
  cancel: async (h): Promise<void> => { sonuclar.set(h.externalId, { state: 'cancelled' }) },
  actualCost: async (): Promise<Money | null> => ZERO_USD,
}
