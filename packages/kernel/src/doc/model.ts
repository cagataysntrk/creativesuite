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

export type BlockType = 'heading' | 'body' | 'image' | 'spacer' | 'chart'

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
  /**
   * Görüntünün NE İDDİA ETTİĞİ (FAZ-6.8).
   *
   * `product_screenshot` bir iddiadır: "ürün gerçekten böyle görünüyor". O yüzden
   * gerçek çekime bağlanmak zorunda — `inspectManifest` bunu yayın yükleminde denetler.
   * Verilmezse görüntü hiçbir şey iddia etmez ve serbesttir.
   */
  readonly role?: 'product_screenshot'
}

/**
 * Serinin ANLAMI — rengi değil (R-35 · §12.1). Rol token'ına render katmanında çözülür.
 *
 * Belge modeli renk TAŞIMAZ: bir hex burada olsaydı marka değiştiğinde grafik eski
 * markanın renginde kalırdı ve bunu ancak PDF'e bakan bir insan fark ederdi.
 */
export type SeriesTone = 'neutral' | 'ok' | 'warn' | 'error'

export interface ChartPoint {
  readonly label: string
  readonly value: number
  readonly tone?: SeriesTone
}

/**
 * Grafik bloğu — **veri**, çizim değil.
 *
 * Alternatif, `COMPOSE`un grafiği HTML'e çevirip belgeye gömmesiydi. O yol belge
 * modeline serbest işaretleme sokardı ve "tek render motoru" yasası (R-30) bir şablon
 * diline kaçardı — bu dosyanın başındaki uyarının tam olarak tarif ettiği şey.
 */
export interface ChartBlock {
  readonly type: 'chart'
  readonly chartKind: 'bar' | 'line'
  readonly title: string
  /** Birim (`%`, `adet`). Birimsiz sayı iddia değil, süstür (R-32). */
  readonly unit?: string
  readonly points: readonly ChartPoint[]
  /** Verinin anlık görüntü tarihi (§7.6). Zorunlu ve sayfada görünür. */
  readonly asOf: string
}

export type Block =
  | { readonly type: 'heading'; readonly text: string; readonly level: 1 | 2 }
  | { readonly type: 'body'; readonly text: string }
  | ImageBlock
  | { readonly type: 'spacer'; readonly size: 'sm' | 'md' | 'lg' }
  | ChartBlock

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
  /** Noktasız ya da sonlu olmayan değerli grafik. Boş kutu, verinin yokluğunu DEĞİL
   *  render'ın bozulduğunu düşündürür — sessizce basılmaz. */
  | { readonly kind: 'invalid_chart'; readonly index: number }

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
    // Grafik doğrulaması BURADA, render'da değil: `isPublishable` bu listeyi okuyor
    // ve bozuk bir grafik yayına gitmemeli. Render katmanı da ayrıca reddediyor —
    // ama orada reddedilen bir şey zaten üretim zamanına kalmış demektir.
    if (
      b.type === 'chart' &&
      (b.points.length === 0 || b.points.some((p) => !Number.isFinite(p.value)))
    ) {
      errors.push({ kind: 'invalid_chart', index: i })
    }
  })
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: doc }
}
