// Bağlam tarifi yükleyicisi (§5.3 · Ring 1).
//
// Tarif, prompt'a NEYİN girdiğini belirleyen kullanıcı verisidir: hangi varlık tipinden
// kaç kayıt, hangi sırayla, hangi token bütçesiyle. Kod değil veri — çünkü "bu çıktı
// neden böyle" sorusunun cevabı bir dosyada durmak zorunda (D-11, §5.3).
//
// Yükleyici Ring 1'de çünkü YAML okuyor ve kullanıcının tanımladığı şemayı biliyor.
// Birleştirme (`assembleContext`) SAF ve Ring 2'de: dosya okumaz, sıralar ve keser.

import { readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { parseYaml } from '@suite/kernel'

export interface RecipeSection {
  /** Manifestte ve prompt'ta görünen bölüm adı. */
  readonly id: string
  /** Hangi varlık tipinden çekilecek. */
  readonly entityType: string
  /** Bu bölüme en fazla kaç kayıt girer. */
  readonly maxRecords: number
  /** Bu bölümün token tavanı. Aşılırsa kesme RAPORLANIR, sessiz olmaz. */
  readonly tokenBudget: number
}

export interface ContextRecipe {
  readonly id: string
  readonly title: string
  /** Toplam tavan. Bölümlerin toplamından KÜÇÜK olabilir — o zaman sıra belirleyicidir. */
  readonly totalBudget: number
  /** Sıra ÖNEMLİ: bütçe dolduğunda sondaki bölüm kesilir, baştaki değil. */
  readonly sections: readonly RecipeSection[]
}

export type RecipeError =
  | { readonly kind: 'invalid_yaml'; readonly message: string }
  | { readonly kind: 'not_a_map' }
  | { readonly kind: 'missing_field'; readonly field: string }
  | { readonly kind: 'duplicate_section'; readonly section: string }
  | { readonly kind: 'non_positive_budget'; readonly section: string }

export type RecipeResult =
  | { readonly ok: true; readonly value: ContextRecipe }
  | { readonly ok: false; readonly errors: readonly RecipeError[] }

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

export const parseRecipe = (text: string): RecipeResult => {
  const y = parseYaml(text)
  if (!y.ok) return { ok: false, errors: [{ kind: 'invalid_yaml', message: y.message }] }
  const d = y.value
  if (d === null || typeof d !== 'object' || Array.isArray(d)) {
    return { ok: false, errors: [{ kind: 'not_a_map' }] }
  }
  const map = d as Record<string, unknown>
  const errors: RecipeError[] = []

  const id = str(map['id'])
  const title = str(map['title'])
  const totalBudget = num(map['total_budget'])
  if (id === null) errors.push({ kind: 'missing_field', field: 'id' })
  if (title === null) errors.push({ kind: 'missing_field', field: 'title' })
  if (totalBudget === null) errors.push({ kind: 'missing_field', field: 'total_budget' })

  const ham = Array.isArray(map['sections']) ? map['sections'] : null
  if (ham === null || ham.length === 0) {
    errors.push({ kind: 'missing_field', field: 'sections' })
    return { ok: false, errors }
  }

  const sections: RecipeSection[] = []
  const gorulen = new Set<string>()
  for (const [i, raw] of ham.entries()) {
    const s = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
    const sid = str(s['id']) ?? `#${i}`
    if (gorulen.has(sid)) errors.push({ kind: 'duplicate_section', section: sid })
    gorulen.add(sid)

    const entityType = str(s['entity_type'])
    const maxRecords = num(s['max_records'])
    const tokenBudget = num(s['token_budget'])
    if (entityType === null) errors.push({ kind: 'missing_field', field: `${sid}.entity_type` })
    if (maxRecords === null) errors.push({ kind: 'missing_field', field: `${sid}.max_records` })
    if (tokenBudget === null) errors.push({ kind: 'missing_field', field: `${sid}.token_budget` })
    // Sıfır bütçeli bölüm, "dahil edildi" diye görünüp hiçbir şey taşımaz —
    // bölümü silmekle aynı şey ama manifestte varmış gibi durur.
    if (tokenBudget !== null && tokenBudget <= 0) {
      errors.push({ kind: 'non_positive_budget', section: sid })
    }
    if (entityType !== null && maxRecords !== null && tokenBudget !== null) {
      sections.push({ id: sid, entityType, maxRecords, tokenBudget })
    }
  }

  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: { id: id ?? '', title: title ?? '', totalBudget: totalBudget ?? 0, sections },
  }
}

export const loadRecipe = (root: string, id: string): RecipeResult =>
  parseRecipe(readFileSync(join(root, `${id}.recipe.yaml`), 'utf8'))

export const listRecipes = (root: string): readonly string[] => {
  try {
    return readdirSync(root)
      .filter((f) => f.endsWith('.recipe.yaml'))
      .map((f) => basename(f, '.recipe.yaml'))
      .sort()
  } catch {
    return []
  }
}
