// Kayıt zarfı (§3.2 · D-41, D-39).
//
// SINIR MUTLAKTIR:
//   zarf        = sistemin bildiği. Kernel OKUR. Yaşam döngüsü ve köken verisi.
//   attributes  = kullanıcının tanımladığı. Kernel'e KAPALI. Tipe özgü her alan.
//
// Şirketin tamamen dönüşebilmesini sağlayan mekanizma budur: bugün `dima`, yarın
// bilinmeyen bir ürün — `attributes` şeması değişir, kernel'in tek satırı değişmez.

import type { BrandId, EraId, RecordId, EntityTypeId } from './brand.js'

/**
 * Kullanıcı tanımlı alanların OPAK gösterimi — halka sınırının tip seviyesindeki hâli.
 *
 * `unique symbol` markası dışında hiçbir üyesi yok; dolayısıyla `record.attributes.foo`
 * **derleme hatası** verir. Grep destructuring ile atlatılabilir, tip sistemi atlatılamaz.
 *
 * Açmanın TEK yasal yolu: `packages/registry/src/attributes.ts#unsealAttributes`
 * (§3.2 · `chokepoints.json` → `yapilandirma-cozucu` komşusu). Başka bir cast, kapı ihlalidir.
 */
declare const OPAQUE_ATTRIBUTES: unique symbol
export type OpaqueAttributes = { readonly [OPAQUE_ATTRIBUTES]: 'attributes' }

export const RECORD_KINDS = ['dna', 'ledger'] as const
export type RecordKind = (typeof RECORD_KINDS)[number]

export const RECORD_ZONES = ['generated', 'human', 'imported'] as const
export type RecordZone = (typeof RECORD_ZONES)[number]

export const RECORD_STATUSES = ['draft', 'active', 'pinned', 'superseded', 'retired'] as const
export type RecordStatus = (typeof RECORD_STATUSES)[number]

export const SOURCE_KINDS = ['url', 'file', 'interview', 'inference', 'registry'] as const
export type SourceKind = (typeof SOURCE_KINDS)[number]

/** Kaynaksız sayısal iddia yayınlanamaz (§11.4) — bu yapı o kuralın taşıyıcısıdır. */
export interface RecordSource {
  readonly kind: SourceKind
  readonly ref: string
  /** Kelimesi kelimesine alıntı. Özet DEĞİL: özet, iddiayı doğrulanamaz hâle getirir. */
  readonly quote: string | null
}

export interface RecordScope {
  readonly channels: readonly string[]
  readonly verticals: readonly string[]
  readonly personas: readonly string[]
}

/**
 * ISO-8601 UTC damgası. Saat TEK yerden gelir (`kernel/src/time/clock.ts`) —
 * iki saat replay'i bozar (§13).
 */
export type Timestamp = string

export interface RecordEnvelope {
  readonly id: RecordId
  /** D-39: marka birinci sınıf eksendir, retrieval yükleminin İLK koşuludur. */
  readonly brand_id: BrandId
  readonly type: EntityTypeId
  readonly schema_version: number
  readonly kind: RecordKind
  readonly zone: RecordZone
  readonly status: RecordStatus
  /** BCP-47, örn. `tr-TR`. */
  readonly locale: string
  /** `'*'` = döneme bağlı değil (§4.3). */
  readonly era_id: EraId | '*'

  readonly created_at: Timestamp

  // ── bi-temporal geçerlilik (§5.2) ──────────────────────────────────────────
  // `null` = sınırsız. Retrieval yüklemi bu üçünü ve `:as_of`'u birlikte okur;
  // emekliye ayrılmış 2024 konumlandırması 2026 deck'ine bu yüzden sızamaz.
  readonly valid_at: Timestamp | null
  readonly invalid_at: Timestamp | null
  /** Emeklilik silme değildir: dosya kalır, yalnız bu alan dolar (değişmez ilke 10). */
  readonly expired_at: Timestamp | null

  /** Çürüme tarihi: bu tarihten sonra kayıt yeniden doğrulanmadan kullanılamaz. */
  readonly re_verify_by: Timestamp | null

  readonly supersedes: readonly RecordId[]
  readonly superseded_by: RecordId | null

  /** 0..1 arası. Üretilmiş kayıtlarda modelin değil, doğrulamanın güveni. */
  readonly confidence: number

  readonly approved_by: string | null
  readonly approved_at: Timestamp | null

  readonly source: RecordSource
  readonly scope: RecordScope
  readonly tags: readonly string[]

  /** Bağlam bütçesi bölümlemesinde ağırlık (§5.3). */
  readonly context_weight: number

  /**
   * `zone: 'generated'` kayıtlarda üretim imzası (§4.5).
   * İmza kırıksa regenerasyon DURUR — elle düzenlenmiş bir kaydın üzerine yazmak,
   * kullanıcının işini sessizce silmektir.
   */
  readonly x_signature: string | null

  /** Kernel'e kapalı bölge. Bkz. `OpaqueAttributes`. */
  readonly attributes: OpaqueAttributes
}
