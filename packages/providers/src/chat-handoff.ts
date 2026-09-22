// ChatGPT handoff provider — yalnız text.generate.
// Ağ/model çağrısı yapmaz; ChatGPT'nin yazdığı adım çıktısını dosyadan okur.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { AppError, MoneyRange } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import { makeError } from '@suite/kernel'
import type { CapabilityDecl, JobHandle, JobStatus, ProviderAdapter, ProviderInput, ValidatedInput } from './types.js'

const ID = 'chat-handoff'
const ENV = 'SUITE_CHAT_HANDOFF'
const sonuclar = new Map<string, JobStatus>()
const CAPS: readonly CapabilityDecl[] = [{
  name: 'text.generate',
  lanes: ['free'],
  supports: { locale: ['tr-TR','en-US'], max_chars: [400,600,2200,4000,10000] },
}]

const hata = (code: string, correlationId: string, details: Readonly<Record<string, unknown>> = {}): AppError =>
  makeError({ kind: 'config', code, userMessageKey: `error.provider.${code}`, correlationId: correlationId as AppError['correlationId'], details })

const yol = (env: Readonly<Record<string,string|undefined>>): string | null => {
  const p = env[ENV]
  return p === undefined || p.trim() === '' ? null : resolve(p)
}
const stepId = (key: string): string => key.includes(':') ? key.slice(key.lastIndexOf(':') + 1) : key

export const chatHandoff: ProviderAdapter = {
  id: ID,
  title: 'ChatGPT handoff (file-backed)',
  islerKalici: false,
  capabilities: () => CAPS,
  validate: (input: ProviderInput) => {
    if (input.capability !== 'text.generate') return err(hata('CAPABILITY_UNSUPPORTED', input.idempotencyKey))
    if (input.lane !== 'free') return err(hata('LANE_UNSUPPORTED', input.idempotencyKey))
    if (input.prompt.trim() === '') return err(hata('EMPTY_PROMPT', input.idempotencyKey))
    return ok({ ...input, _validated: true } as ValidatedInput)
  },
  estimate: (_vi: ValidatedInput): MoneyRange => ({ low: ZERO_USD, high: ZERO_USD }),
  available: (env) => { const p=yol(env); return p !== null && existsSync(p) },
  start: async (vi, ctx) => {
    const p=yol(ctx.env)
    if (p === null || !existsSync(p)) return err(hata('CHAT_HANDOFF_NOT_FOUND', ctx.correlationId))
    let root: { steps?: Record<string,unknown> }
    try { root=JSON.parse(readFileSync(p,'utf8')) as { steps?: Record<string,unknown> } }
    catch(e) { return err(hata('CHAT_HANDOFF_INVALID', ctx.correlationId, { message: String(e) })) }
    const sid=stepId(vi.idempotencyKey)
    const value=root.steps?.[sid]
    if (typeof value !== 'string' || value.trim()==='') return err(hata('CHAT_HANDOFF_STEP_MISSING', ctx.correlationId, { stepId:sid }))
    const handle: JobHandle={providerId:ID,externalId:vi.idempotencyKey,idempotencyKey:vi.idempotencyKey}
    sonuclar.set(handle.externalId,{state:'succeeded',output:{text:value}})
    return ok(handle)
  },
  status: async (h) => {
    const s=sonuclar.get(h.externalId)
    return s === undefined ? ok({state:'failed',error:hata('CHAT_HANDOFF_JOB_MISSING',h.idempotencyKey)}) : ok(s)
  },
  cancel: async (h) => { sonuclar.set(h.externalId,{state:'cancelled'}) },
  actualCost: async () => ZERO_USD,
}
