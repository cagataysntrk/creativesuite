// Nominal tipler ve kimlikler (§3.2, §3.9).
//
// TypeScript yapısal tiplidir: `string` her yerde `string`'e uyar. Bu sistemde bir
// `BrandId`'yi `EraId` bekleyen bir yere geçirmek sessizce derlenirdi ve sonuç, yanlış
// markanın kayıtlarını çeken bir retrieval sorgusu olurdu — §5.2'nin "asla sızmaz"
// vaadinin tek satırlık çöküşü. Marka (brand) o yüzden var.

declare const BRAND: unique symbol

/** Nominal tip markası. `Brand<string,'RunId'>` artık düz `string` değildir. */
export type Brand<T, B extends string> = T & { readonly [BRAND]: B }

// ── kimlikler ────────────────────────────────────────────────────────────────
// Hepsi uuidv7 ve ÖN EKLİ (§3.9). Ön ek gözle ayırt etmek için değil, bir id'nin
// log'da, manifest'te veya hata mesajında ne olduğunun bağlamsız okunabilmesi için.

export type RunId = Brand<string, 'RunId'>
export type JobId = Brand<string, 'JobId'>
export type RecordId = Brand<string, 'RecordId'>
export type AssetId = Brand<string, 'AssetId'>
export type BrandId = Brand<string, 'BrandId'>
export type EraId = Brand<string, 'EraId'>
export type StepId = Brand<string, 'StepId'>
export type ProviderId = Brand<string, 'ProviderId'>
export type ChannelId = Brand<string, 'ChannelId'>
export type PipelineId = Brand<string, 'PipelineId'>
export type EntityTypeId = Brand<string, 'EntityTypeId'>
export type CorrelationId = Brand<string, 'CorrelationId'>

/**
 * Ön ek tablosu — kimlik üreteci (`packages/kernel/src/ids.ts`) burayı okur.
 * Tek yerde durması, "hangi ön ek neydi" sorusunun asla sorulmaması içindir.
 */
export const ID_PREFIXES = {
  RunId: 'run_',
  JobId: 'job_',
  RecordId: 'rec_',
  AssetId: 'ast_',
  BrandId: 'brd_',
  EraId: 'era_',
  StepId: 'stp_',
  ProviderId: 'prv_',
  ChannelId: 'chn_',
  PipelineId: 'pln_',
  EntityTypeId: 'ent_',
  CorrelationId: 'cor_',
} as const satisfies Readonly<Record<string, string>>

export type IdKind = keyof typeof ID_PREFIXES
