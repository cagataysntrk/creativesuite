// Üretilecek JSON şemalarının kataloğu (§3.2 · FAZ-1.2).
//
// Üreteç bu listeyi okur; liste tek yerdedir. Yeni bir şema eklemek = buraya bir satır.
// Üreteci ve `schemas/` dizinini elle senkron tutmaya çalışmak, ikisinin ayrışması demekti.

import { envelopeJsonSchema } from './envelope.js'

export interface SchemaEntry {
  /** `schemas/` altındaki dosya adı — uzantısız. */
  readonly dosya: string
  /** Şemanın ne olduğu; üretilen JSON'un `title` alanına girer. */
  readonly baslik: string
  readonly uret: () => unknown
}

export const SCHEMA_REGISTRY: readonly SchemaEntry[] = [
  {
    dosya: 'record-envelope',
    baslik: 'RecordEnvelope',
    uret: envelopeJsonSchema,
  },
]
