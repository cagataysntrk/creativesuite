// Projeksiyon derleyicisi — TEK şema, DÖRT hedef (§3.4).
//
//   şema ──┬─→ rjsf form şeması   (UI: tipli girdi formu, §12.9)
//          ├─→ TypeScript tipi    (derleme zamanı sözleşme)
//          ├─→ KATI LLM şeması    (model uydurma alan ekleyemesin)
//          └─→ SQLite DDL         (türetilmiş indeks, §3.5)
//
// **Neden tek kaynak:** dördü elle yazılsaydı, bir alan eklendiğinde dördünden üçü
// güncellenir, biri unutulurdu — ve unutulan hangisiyse hata o katmanda değil, iki
// katmanın ARASINDA çıkardı. Form alanı gösterir, DDL sütunu yoktur; ya da LLM alanı
// üretir, tip onu bilmez.
//
// **Katı LLM şeması en sert olan:** `additionalProperties: false` + HER alan `required`.
// OpenAI ve Anthropic'in yapılandırılmış çıktı alt kümeleri farklı olabilir (V-05);
// derleyici DAHA KATI olana yazıldı — gevşek olana da geçerlidir, tersi değil.

import { asciiLower, asciiUpper } from '../text/case.js'
import {
  validateSchema,
  type CompileError,
  type CompileResult,
  type EntityTypeSchema,
  type SchemaNode,
} from './types.js'

// ── 1. rjsf form şeması ──────────────────────────────────────────────────────
// rjsf JSON Schema'yı doğrudan yer; dönüşüm, DESTEKLEMEDİĞİ şeyleri ayıklamaktır.
// `x-retired` alanlar forma girmez: emekli bir alanı kullanıcıya göstermek, onu
// doldurmaya davet etmektir.

export interface FormProjection {
  readonly schema: Record<string, unknown>
  readonly uiSchema: Record<string, unknown>
}

const formNode = (n: SchemaNode): Record<string, unknown> => {
  const out: Record<string, unknown> = { type: n.type }
  if (n.title !== undefined) out['title'] = n.title
  if (n.description !== undefined) out['description'] = n.description
  if (n.enum !== undefined) out['enum'] = [...n.enum]
  if (n.format !== undefined) out['format'] = n.format
  if (n.minLength !== undefined) out['minLength'] = n.minLength
  if (n.maxLength !== undefined) out['maxLength'] = n.maxLength
  if (n.minimum !== undefined) out['minimum'] = n.minimum
  if (n.maximum !== undefined) out['maximum'] = n.maximum
  if (n.items !== undefined) out['items'] = formNode(n.items)
  if (n.properties !== undefined) {
    const p: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(n.properties)) {
      if (v['x-retired'] === true) continue
      p[k] = formNode(v)
    }
    out['properties'] = p
    out['additionalProperties'] = false
    if (n.required !== undefined) {
      out['required'] = n.required.filter((r) => n.properties?.[r]?.['x-retired'] !== true)
    }
  }
  return out
}

export const toForm = (schema: EntityTypeSchema): FormProjection => {
  const ui: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(schema.properties ?? {})) {
    // Uzun metin alanı tek satırlık kutuya sığmaz; Türkçe metin İngilizce'den ~%20
    // uzun (R-23) ve dar bir kutuda kırpılmış görünür.
    if (v.type === 'string' && (v.maxLength ?? 0) > 200) {
      ui[k] = { 'ui:widget': 'textarea' }
    }
  }
  return { schema: formNode(schema), uiSchema: ui }
}

// ── 2. TypeScript tipi ───────────────────────────────────────────────────────
// Emekli alanlar tipe GİRER ama `readonly … | undefined` olarak: tarihsel kayıtlar
// okunabilir kalsın, yeni kayıtlar doldurmaya zorlanmasın.

const tsType = (n: SchemaNode, indent: string): string => {
  if (n.enum !== undefined) {
    return n.enum.map((e) => (typeof e === 'string' ? `'${e}'` : String(e))).join(' | ')
  }
  switch (n.type) {
    case 'string':
      return 'string'
    case 'number':
    case 'integer':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'array':
      return `readonly ${n.items === undefined ? 'unknown' : tsType(n.items, indent)}[]`
    case 'object': {
      const satirlar = Object.entries(n.properties ?? {}).map(([k, v]) => {
        const zorunlu = n.required?.includes(k) === true && v['x-retired'] !== true
        const not = v['x-retired'] === true ? `${indent}  /** @deprecated emekli alan */\n` : ''
        return `${not}${indent}  readonly ${k}${zorunlu ? '' : '?'}: ${tsType(v, `${indent}  `)}`
      })
      return `{\n${satirlar.join('\n')}\n${indent}}`
    }
  }
}

const pascal = (s: string): string =>
  s
    .split(/[-_]/)
    .map((p) => (p === '' ? '' : asciiUpper(p[0] as string) + asciiLower(p.slice(1))))
    .join('')

export const toTypeScript = (schema: EntityTypeSchema): string =>
  `export interface ${pascal(schema.$id)}Attributes ${tsType(schema, '')}\n`

// ── 3. KATI LLM şeması ───────────────────────────────────────────────────────
// HER alan `required`, HER nesne `additionalProperties: false`. Opsiyonel alan yok:
// yapılandırılmış çıktıda "opsiyonel" demek "model atlayabilir" demektir ve atlanan
// alan sessizce `undefined` olur. Onun yerine alan zorunlu, değeri `null` olabilir.

const llmNode = (n: SchemaNode): Record<string, unknown> => {
  const out: Record<string, unknown> = {}

  if (n.description !== undefined) out['description'] = n.description
  if (n.enum !== undefined) {
    out['type'] = n.type
    out['enum'] = [...n.enum]
    return out
  }

  out['type'] = n.type

  if (n.type === 'array') {
    out['items'] = n.items === undefined ? {} : llmNode(n.items)
    return out
  }

  if (n.type === 'object') {
    const props: Record<string, unknown> = {}
    const zorunlu: string[] = []
    for (const [k, v] of Object.entries(n.properties ?? {})) {
      if (v['x-retired'] === true) continue // emekli alan modelden İSTENMEZ
      props[k] = llmNode(v)
      zorunlu.push(k) // HER alan zorunlu — opsiyonel = sessizce atlanabilir
    }
    out['properties'] = props
    out['required'] = zorunlu
    out['additionalProperties'] = false
  }

  return out
}

export const toLlmSchema = (schema: EntityTypeSchema): Record<string, unknown> => ({
  name: schema.$id,
  strict: true,
  schema: llmNode(schema),
})

// ── 4. SQLite DDL ────────────────────────────────────────────────────────────
// Türetilmiş indeks (§3.5): silinip yeniden kurulabilir, bu yüzden şema değişikliği
// veri kaybı değil rahatsızlıktır. Emekli alanlar sütun olarak KALIR — tarihsel
// kayıtlar okunabilir olmalı.

const sqlType = (n: SchemaNode): string => {
  switch (n.type) {
    case 'integer':
      return 'INTEGER'
    case 'number':
      return 'REAL'
    case 'boolean':
      return 'INTEGER' // SQLite'ta boolean yok; 0/1
    case 'array':
    case 'object':
      return 'TEXT' // JSON olarak; iç içe yapı sütuna açılmaz
    case 'string':
      return 'TEXT'
  }
}

const SQL_RESERVED = new Set(['order', 'group', 'index', 'table', 'select', 'from', 'where'])

export const toSqliteDdl = (schema: EntityTypeSchema): string => {
  const tablo = `attr_${schema.$id.replace(/-/g, '_')}`
  const sutunlar: string[] = ['  record_id TEXT PRIMARY KEY']

  for (const [k, v] of Object.entries(schema.properties ?? {})) {
    const ad = SQL_RESERVED.has(asciiLower(k)) ? `"${k}"` : k
    const zorunlu = schema.required?.includes(k) === true && v['x-retired'] !== true
    sutunlar.push(`  ${ad} ${sqlType(v)}${zorunlu ? ' NOT NULL' : ''}`)
  }

  return `CREATE TABLE IF NOT EXISTS ${tablo} (\n${sutunlar.join(',\n')}\n);\n`
}

// ── dördü birden ─────────────────────────────────────────────────────────────

export interface Projections {
  readonly form: FormProjection
  readonly typescript: string
  readonly llm: Record<string, unknown>
  readonly ddl: string
}

/**
 * Dört projeksiyonu birlikte üretir. Doğrulama ÖNCE koşar: geçersiz bir şemadan
 * üç geçerli bir bozuk projeksiyon üretmek, bozuğun hangisi olduğunu gizler.
 */
export const compile = (schema: unknown): CompileResult<Projections> => {
  const errors: readonly CompileError[] = validateSchema(schema)
  if (errors.length > 0) return { ok: false, errors }

  const s = schema as EntityTypeSchema
  return {
    ok: true,
    value: {
      form: toForm(s),
      typescript: toTypeScript(s),
      llm: toLlmSchema(s),
      ddl: toSqliteDdl(s),
    },
  }
}
