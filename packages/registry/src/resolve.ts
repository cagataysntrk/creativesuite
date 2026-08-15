// TEK yapılandırma çözücü (§3.3 · chokepoints.json → `yapilandirma-cozucu`).
//
// Registry YAML'ı iki farklı yerde çözülürse, UI'ın gördüğü pipeline ile motorun
// çalıştırdığı pipeline AYRIŞIR — ve kullanıcı onayladığı şeyden başkasını çalıştırmış olur.
//
// **Model adı yazılamaz** (R-40). Pipeline yetenek + kısıt ister; hangi modelin
// kullanılacağı yönlendiricinin kararıdır. Model ID'si pipeline'da olsaydı, sağlayıcı
// öldüğü gün kırılan bir varsayım olurdu (D-32).

import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { parseYaml, VERBS_SET } from './internal.js'

export interface PipelineStep {
  readonly id: string
  readonly verb: string
  /** Yetenek adı — `image.generate` gibi. Fiil adı DEĞİL (§3.10). */
  readonly capability: string | null
  readonly constraints: Readonly<Record<string, unknown>>
  /** Bu adım hangi adımlardan sonra koşar. Boşsa DAG'ın kökü. */
  readonly needs: readonly string[]
  /** İnsan kapısı — onay bir yan etki değil, bir kapıdır (§4c). */
  readonly gate: string | null
}

export interface Pipeline {
  readonly id: string
  readonly title: string
  readonly steps: readonly PipelineStep[]
}

export type ResolveError =
  | { readonly kind: 'invalid_yaml'; readonly message: string }
  | { readonly kind: 'not_a_map' }
  | { readonly kind: 'missing_field'; readonly field: string }
  | { readonly kind: 'unknown_verb'; readonly step: string; readonly verb: string }
  | { readonly kind: 'model_id_in_pipeline'; readonly step: string; readonly key: string }
  | { readonly kind: 'unknown_dependency'; readonly step: string; readonly needs: string }
  | { readonly kind: 'duplicate_step'; readonly step: string }
  | { readonly kind: 'cycle'; readonly steps: readonly string[] }

export type ResolveResult =
  | { readonly ok: true; readonly value: Pipeline }
  | { readonly ok: false; readonly errors: readonly ResolveError[] }

/**
 * Model/sağlayıcı adını ele veren anahtarlar (R-40).
 * Kısıtlarda `model`, `provider`, `model_id` gibi bir anahtar görürsek pipeline
 * yönlendiriciyi atlamaya çalışıyordur.
 */
const YASAK_ANAHTARLAR = ['model', 'model_id', 'provider', 'provider_id', 'engine', 'endpoint']

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)

export const parsePipeline = (text: string): ResolveResult => {
  const y = parseYaml(text)
  if (!y.ok) return { ok: false, errors: [{ kind: 'invalid_yaml', message: y.message }] }
  const d = y.value
  if (d === null || typeof d !== 'object' || Array.isArray(d)) {
    return { ok: false, errors: [{ kind: 'not_a_map' }] }
  }
  const map = d as Record<string, unknown>
  const errors: ResolveError[] = []

  const id = str(map['id'])
  const title = str(map['title'])
  if (id === null) errors.push({ kind: 'missing_field', field: 'id' })
  if (title === null) errors.push({ kind: 'missing_field', field: 'title' })

  const rawSteps = Array.isArray(map['steps']) ? (map['steps'] as unknown[]) : null
  if (rawSteps === null || rawSteps.length === 0) {
    errors.push({ kind: 'missing_field', field: 'steps' })
    return { ok: false, errors }
  }

  const steps: PipelineStep[] = []
  const gorulen = new Set<string>()

  for (const [i, raw] of rawSteps.entries()) {
    const s = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
    const sid = str(s['id']) ?? `#${i}`
    if (gorulen.has(sid)) errors.push({ kind: 'duplicate_step', step: sid })
    gorulen.add(sid)

    const verb = str(s['verb']) ?? ''
    if (!VERBS_SET.has(verb)) errors.push({ kind: 'unknown_verb', step: sid, verb })

    const constraints = (
      typeof s['constraints'] === 'object' && s['constraints'] !== null ? s['constraints'] : {}
    ) as Record<string, unknown>

    for (const k of Object.keys(constraints)) {
      if (YASAK_ANAHTARLAR.includes(k)) {
        errors.push({ kind: 'model_id_in_pipeline', step: sid, key: k })
      }
    }

    steps.push({
      id: sid,
      verb,
      capability: str(s['capability']),
      constraints,
      needs: Array.isArray(s['needs'])
        ? (s['needs'] as unknown[]).filter((x): x is string => typeof x === 'string')
        : [],
      gate: str(s['gate']),
    })
  }

  // Bağımlılıklar gerçek adımlara işaret etmeli.
  for (const s of steps) {
    for (const n of s.needs) {
      if (!gorulen.has(n)) errors.push({ kind: 'unknown_dependency', step: s.id, needs: n })
    }
  }

  // Döngü kontrolü: döngülü bir DAG çalıştırma anında SONSUZ bekler ve teşhisi zordur.
  const dongu = findCycle(steps)
  if (dongu !== null) errors.push({ kind: 'cycle', steps: dongu })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: { id: id as string, title: title as string, steps } }
}

/** Kahn benzeri gezinti; döngüye giren adım zincirini döndürür. */
const findCycle = (steps: readonly PipelineStep[]): string[] | null => {
  const byId = new Map(steps.map((s) => [s.id, s]))
  const durum = new Map<string, 'ziyaret' | 'bitti'>()
  const yol: string[] = []

  const gez = (id: string): string[] | null => {
    const d = durum.get(id)
    if (d === 'bitti') return null
    if (d === 'ziyaret') return [...yol.slice(yol.indexOf(id)), id]
    durum.set(id, 'ziyaret')
    yol.push(id)
    for (const n of byId.get(id)?.needs ?? []) {
      const c = gez(n)
      if (c !== null) return c
    }
    yol.pop()
    durum.set(id, 'bitti')
    return null
  }

  for (const s of steps) {
    const c = gez(s.id)
    if (c !== null) return c
  }
  return null
}

/** Topolojik sıra — motorun adımları hangi sırayla koşacağı. */
export const topoOrder = (p: Pipeline): readonly string[] => {
  const byId = new Map(p.steps.map((s) => [s.id, s]))
  const bitti = new Set<string>()
  const sira: string[] = []
  const gez = (id: string): void => {
    if (bitti.has(id)) return
    for (const n of byId.get(id)?.needs ?? []) gez(n)
    bitti.add(id)
    sira.push(id)
  }
  for (const s of p.steps) gez(s.id)
  return sira
}

export const loadPipeline = (root: string, id: string): ResolveResult =>
  parsePipeline(readFileSync(join(root, `${id}.pipeline.yaml`), 'utf8'))

export const listPipelines = (root: string): readonly string[] => {
  try {
    return readdirSync(root)
      .filter((f) => f.endsWith('.pipeline.yaml'))
      .map((f) => basename(f, '.pipeline.yaml'))
      .sort()
  } catch {
    return []
  }
}
