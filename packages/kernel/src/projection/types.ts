// Projeksiyon derleyicisinin girdi tipi (§3.4 · §3.3).
//
// Girdi, `registry/PROFILE.md`'nin izin verdiği JSON Schema 2020-12 ALT KÜMESİDİR.
// Profil dışı anahtarlar `registry` kapısında zaten reddediliyor; burada onların
// hiç gelmeyeceğini VARSAYMIYORUZ — derleyici bilmediği anahtarı görürse hata verir.
// Sessizce yok saymak, dört projeksiyondan birinin eksik çıkması demekti.

export type SchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'

export interface SchemaNode {
  readonly type: SchemaType
  readonly title?: string
  readonly description?: string
  readonly enum?: readonly (string | number)[]
  readonly format?: string
  readonly minLength?: number
  readonly maxLength?: number
  readonly minimum?: number
  readonly maximum?: number
  readonly items?: SchemaNode
  readonly properties?: Readonly<Record<string, SchemaNode>>
  readonly required?: readonly string[]
  readonly additionalProperties?: boolean
  /** Alan emekliye ayrıldı: tarihsel kayıtlar okunabilir kalsın diye SİLİNMEZ. */
  readonly 'x-retired'?: boolean
}

export interface EntityTypeSchema extends SchemaNode {
  readonly type: 'object'
  /** `positioning`, `persona`… SQLite tablo adı ve TS tip adı buradan türer. */
  readonly $id: string
}

export type CompileError =
  | { readonly kind: 'not_object'; readonly path: string }
  | { readonly kind: 'missing_type'; readonly path: string }
  | { readonly kind: 'unknown_type'; readonly path: string; readonly type: string }
  | { readonly kind: 'forbidden_keyword'; readonly path: string; readonly keyword: string }
  | { readonly kind: 'object_without_additional_properties_false'; readonly path: string }
  | { readonly kind: 'array_without_items'; readonly path: string }
  | { readonly kind: 'missing_id' }

export type CompileResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly CompileError[] }

/** `registry/PROFILE.md` ile birebir aynı liste. Ayrışırsa `projection` kapısı yakalar. */
export const FORBIDDEN_KEYWORDS = [
  'oneOf',
  'not',
  'if',
  'then',
  'else',
  'patternProperties',
  'unevaluatedProperties',
  '$dynamicRef',
  '$dynamicAnchor',
  'dependentSchemas',
  'propertyNames',
  'contains',
  'minContains',
  'maxContains',
] as const

const TYPES: ReadonlySet<string> = new Set<SchemaType>([
  'string',
  'number',
  'integer',
  'boolean',
  'array',
  'object',
])

/**
 * Şemayı profile karşı doğrular. **En sert kural nesnelerde:**
 * `additionalProperties: false` olmayan bir nesne, katı LLM şemasında modelin
 * uydurduğu alanı SESSİZCE kabul eder — ve o alan corpus'a girer.
 */
export const validateSchema = (schema: unknown): readonly CompileError[] => {
  const errors: CompileError[] = []

  const gez = (node: unknown, path: string): void => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) {
      errors.push({ kind: 'not_object', path })
      return
    }
    const n = node as Record<string, unknown>

    for (const k of FORBIDDEN_KEYWORDS) {
      if (k in n) errors.push({ kind: 'forbidden_keyword', path, keyword: k })
    }

    const t = n['type']
    if (typeof t !== 'string') {
      errors.push({ kind: 'missing_type', path })
      return
    }
    if (!TYPES.has(t)) {
      errors.push({ kind: 'unknown_type', path, type: t })
      return
    }

    if (t === 'object') {
      if (n['additionalProperties'] !== false) {
        errors.push({ kind: 'object_without_additional_properties_false', path })
      }
      const props = n['properties']
      if (props !== undefined && typeof props === 'object' && props !== null) {
        for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
          gez(v, `${path}/${k}`)
        }
      }
    }

    if (t === 'array') {
      if (n['items'] === undefined) errors.push({ kind: 'array_without_items', path })
      else gez(n['items'], `${path}[]`)
    }
  }

  gez(schema, '')

  const s = schema as Record<string, unknown> | null
  if (s === null || typeof s !== 'object' || typeof s['$id'] !== 'string') {
    errors.push({ kind: 'missing_id' })
  }

  return errors
}
