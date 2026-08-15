// TEK logger (§13 · §3.8 · chokepoints.json → `logger`).
//
// İkinci bir logger, korelasyon id'si taşımayan satırlar üretir ve hata ayıklama biter:
// bir çalıştırmanın hangi adımında ne olduğunu bağlamak imkânsızlaşır.
//
// **Olay adları İngilizce ve ŞEMALI** (D-37). Türkçe nesir log'a girmez — log makine
// tarafından okunur; insan yüzeyi UI kataloğudur. `verb.started` gibi noktalı bir ad,
// `grep`'lenebilir ve gelecekte alan hâline getirilebilir.
//
// **Secret ASLA log'lanmaz** (§14): `details` içindeki bilinen hassas anahtarlar
// redakte edilir. Sızıntıyı raporlarken ikinci kez sızdırmak en aptalca hatadır.

import type { CorrelationId } from '@suite/contracts'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEvent {
  readonly level: LogLevel
  /** İngilizce, noktalı, şemalı: `verb.started`, `provider.rejected`, `budget.exceeded`. */
  readonly event: string
  readonly correlationId: CorrelationId | null
  readonly details?: Readonly<Record<string, unknown>>
}

const HASSAS = new Set([
  'authorization',
  'api_key',
  'apiKey',
  'token',
  'secret',
  'password',
  'cookie',
  'prompt',
])

const redakte = (d: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(d)) out[k] = HASSAS.has(k) ? '<REDACTED>' : v
  return out
}

/** Test ve UI bunu değiştirir; üretimde stdout'a NDJSON basar. */
export type Sink = (line: string) => void

let sink: Sink = (line) => {
  process.stdout.write(`${line}\n`)
}

export const setSink = (s: Sink): void => {
  sink = s
}

/**
 * NDJSON tek satır. Neden JSON: `derived/runs/` altındaki log'lar `jq` ile
 * sorgulanabilir olmalı; serbest metin bir ay sonra grep'lenemez (ilke 12).
 * Zaman damgası ÇAĞIRAN tarafından verilir — logger saati okumaz (§3.8, R-06).
 */
export const log = (e: LogEvent, at: string): void => {
  sink(
    JSON.stringify({
      at,
      level: e.level,
      event: e.event,
      correlationId: e.correlationId,
      ...(e.details === undefined ? {} : { details: redakte(e.details) }),
    })
  )
}
