// Kapalı düzen kümesi ve taşma bölme (§7.1 · §12.3 · R-23).
//
// **Düzen kümesi KAPALI.** Dört düzen var ve beşincisi bir kod değişikliğidir, bir
// veri değişikliği değil. Açık bırakılsaydı her yeni brief kendi düzenini getirir,
// hiçbiri golden testten geçmez ve "bedava ile premium çıktı tipografide aynıdır"
// vaadi (§8.2) ilk üç haftada çökerdi.
//
// **Taşma BÖLER, asla küçültmez.** Türkçe'de bu kural İngilizce'dekinden sert:
// kelimeler uzun, ekler yığılıyor ve tipi küçültmek okunabilirliği İngilizce'dekinden
// hızlı bitiriyor. Ayrıca küçültme sorunu GİZLER — çıktı "sığmış" görünür ve kimse
// içeriğin fazla olduğunu fark etmez.

import type { Block, DocumentModel } from '@suite/kernel'

/**
 * Dört başlangıç düzeni. Adlar İngilizce (D-37: tanımlayıcı), açıklamalar Türkçe.
 *
 * - `statement`  tek güçlü cümle, ortalanmış — hook slaytı
 * - `claim-proof` iddia + altında kanıt satırı
 * - `list`       2-4 maddelik sütun
 * - `quote`      alıntı + kaynak atfı
 */
export const LAYOUTS = ['statement', 'claim-proof', 'list', 'quote'] as const
export type LayoutName = (typeof LAYOUTS)[number]

export interface LayoutSpec {
  readonly name: LayoutName
  /** Bu düzende bir slayda sığan EN FAZLA blok. Aşılırsa bölünür, küçültülmez. */
  readonly maxBlocks: number
  /**
   * Başlık için karakter tavanı. Sayı fonta değil DÜZENE aittir: aynı font, farklı
   * düzende farklı genişlik alır. Marka fontu geldiğinde (V-02) golden metrik bu
   * sayıyı doğrulayacak — bugün ölçülmüş değil, seçilmiş bir tavan.
   */
  readonly headingBudget: number
  /** Gövde metni için karakter tavanı. */
  readonly bodyBudget: number
}

export const LAYOUT_SPECS: Record<LayoutName, LayoutSpec> = {
  statement: { name: 'statement', maxBlocks: 2, headingBudget: 68, bodyBudget: 140 },
  'claim-proof': { name: 'claim-proof', maxBlocks: 4, headingBudget: 56, bodyBudget: 220 },
  list: { name: 'list', maxBlocks: 6, headingBudget: 48, bodyBudget: 320 },
  quote: { name: 'quote', maxBlocks: 3, headingBudget: 90, bodyBudget: 120 },
}

export interface Overflow {
  /** Sığan bloklar — İLK slayt. */
  readonly fits: readonly Block[]
  /** Taşan bloklar — SONRAKİ slayt(lar)a gider. Boşsa taşma yok. */
  readonly overflow: readonly Block[]
  /** Neden bölündü. Boş dize = bölünmedi. */
  readonly reason: string
}

const metinUzunlugu = (b: Block): number => {
  switch (b.type) {
    case 'heading':
    case 'body':
      return b.text.length
    case 'image':
    case 'spacer':
      return 0
  }
}

/**
 * Blokları düzene göre böler.
 *
 * **Hiçbir koşulda punto değişmez.** Bu fonksiyon yalnız BÖLER; döndürdüğü şey iki
 * blok listesidir, bir ölçek çarpanı değil. İmza bu yüzden `scale` alanı taşımıyor —
 * taşıyabilseydi biri onu kullanırdı.
 */
export const splitForLayout = (blocks: readonly Block[], layout: LayoutName): Overflow => {
  const spec = LAYOUT_SPECS[layout]
  const fits: Block[] = []
  let baslikKullanilan = 0
  let govdeKullanilan = 0

  for (const [i, b] of blocks.entries()) {
    const uzunluk = metinUzunlugu(b)
    const baslikMi = b.type === 'heading'
    const yeniBaslik = baslikMi ? baslikKullanilan + uzunluk : baslikKullanilan
    const yeniGovde = baslikMi ? govdeKullanilan : govdeKullanilan + uzunluk

    if (i >= spec.maxBlocks) {
      return { fits, overflow: blocks.slice(i), reason: `maxBlocks ${spec.maxBlocks} doldu` }
    }
    if (baslikMi && yeniBaslik > spec.headingBudget) {
      return {
        fits,
        overflow: blocks.slice(i),
        reason: `başlık bütçesi aşıldı (${yeniBaslik}/${spec.headingBudget} karakter)`,
      }
    }
    if (!baslikMi && yeniGovde > spec.bodyBudget) {
      return {
        fits,
        overflow: blocks.slice(i),
        reason: `gövde bütçesi aşıldı (${yeniGovde}/${spec.bodyBudget} karakter)`,
      }
    }
    fits.push(b)
    baslikKullanilan = yeniBaslik
    govdeKullanilan = yeniGovde
  }

  return { fits, overflow: [], reason: '' }
}

/**
 * Blokları düzene göre KAÇ slayda böleceğini hesaplar.
 *
 * Sonsuz döngü koruması var: bir blok tek başına bütçeyi aşıyorsa bölmek onu asla
 * sığdırmaz. O blok kendi slaydına konur ve **açıkça işaretlenir** — sessizce
 * kırpmak ya da küçültmek, tam olarak yasak olan iki şey.
 */
export interface Slide {
  readonly blocks: readonly Block[]
  /** Bu slayt tek başına sığmayan bir blok mu taşıyor. */
  readonly oversized: boolean
}

export const paginate = (blocks: readonly Block[], layout: LayoutName): readonly Slide[] => {
  const slides: Slide[] = []
  let kalan = blocks

  while (kalan.length > 0) {
    const { fits, overflow } = splitForLayout(kalan, layout)
    if (fits.length === 0) {
      // İlk blok tek başına sığmıyor: bölmek çözmez. Kendi slaydına konur ve
      // `oversized` ile İŞARETLENİR — çağıran metni kısaltmalı.
      slides.push({ blocks: [kalan[0] as Block], oversized: true })
      kalan = kalan.slice(1)
      continue
    }
    slides.push({ blocks: fits, oversized: false })
    kalan = overflow
  }
  return slides
}

/** Belgeyi düzene göre slaytlara böler; boyut ve token'lar korunur. */
export const paginateDocument = (
  doc: DocumentModel,
  layout: LayoutName
): readonly DocumentModel[] =>
  paginate(doc.blocks, layout).map((s) => ({ ...doc, blocks: s.blocks }))
