// HEDEF: packages/kernel/src/doc/model.ts
//
// Belge modeli — `RENDER`ın gördüğü TEK şey (§7.1 · §3.2).
//
// **`RENDER` `RecordEnvelope` GÖRMEZ** ve bu grep'le değil İMZAYLA zorlanır:
// `renderStatic(doc: DocumentModel)` imzası, zarfı geçirmeyi derleme hatası yapar.
// Varlığa özgü veriye yasal yol: `SELECT` → `unsealAttributes` (yalnız Ring 1) →
// `COMPOSE` (saf) → belge modeli → `RENDER`.
//
// Belge modeli kasten FAKİR: yalnız blok listesi, boyut ve token CSS'i. Zengin olsaydı
// (koşullu yerleşim, hesaplanan alanlar) `RENDER` bir şablon motoruna dönerdi ve
// "tek render motoru" yasası şablon diline kaçardı.

import type { AssetStamp } from '../era.js'

export type BlockType = 'heading' | 'body' | 'image' | 'spacer'

/**
 * Görsel blok. `alt` ZORUNLU: R-34 yayında alt-text'siz görseli bloklar ve alanı
 * isteğe bağlı bırakmak, "sonra ekleriz"i bugünden mümkün kılardı. Dekoratif görsel
 * için `alt: ''` DEĞİL, `decorative: true` yazılır — boş dize bir iddiadır ve
 * yanlış iddiadır.
 */
export interface ImageBlock {
  readonly type: 'image'
  readonly src: string
  readonly alt: string
  readonly decorative: boolean
}

export type Block =
  | { readonly type: 'heading'; readonly text: string; readonly level: 1 | 2 }
  | { readonly type: 'body'; readonly text: string }
  | ImageBlock
  | { readonly type: 'spacer'; readonly size: 'sm' | 'md' | 'lg' }

export type DocumentKind = 'post' | 'carousel-slide' | 'deck-page'

export interface DocumentModel {
  readonly kind: DocumentKind
  /** Piksel. Platform spec'i belirler (§9.1); belge modeli yalnız taşır. */
  readonly width: number
  readonly height: number
  readonly blocks: readonly Block[]
  /** `brand/<id>/derived-tokens/tokens.css` içeriği (FAZ-2.10). Marka BURADAN gelir. */
  readonly tokenCss: string
  /** Üretim damgası (R-11). Çıktı meta'sına basılır; retrofit imkânsız. */
  readonly stamp: AssetStamp
}

export type DocError =
  | { readonly kind: 'empty_document' }
  | { readonly kind: 'missing_alt'; readonly index: number }
  | { readonly kind: 'invalid_size'; readonly width: number; readonly height: number }
  | { readonly kind: 'empty_text'; readonly index: number }

export type DocResult =
  | { readonly ok: true; readonly value: DocumentModel }
  | { readonly ok: false; readonly errors: readonly DocError[] }

/**
 * Belge modelini doğrular. **Boş belge geçerli DEĞİLDİR**: boş bir PNG üretmek,
 * üretilmemiş bir varlığı üretilmiş saymanın en sessiz yolu.
 */
export const validateDocument = (doc: DocumentModel): DocResult => {
  const errors: DocError[] = []
  if (doc.blocks.length === 0) errors.push({ kind: 'empty_document' })
  if (doc.width <= 0 || doc.height <= 0) {
    errors.push({ kind: 'invalid_size', width: doc.width, height: doc.height })
  }
  doc.blocks.forEach((b, i) => {
    if (b.type === 'image' && !b.decorative && b.alt.trim() === '') {
      errors.push({ kind: 'missing_alt', index: i })
    }
    if ((b.type === 'heading' || b.type === 'body') && b.text.trim() === '') {
      errors.push({ kind: 'empty_text', index: i })
    }
  })
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: doc }
}
