// Çok en-boy render — TEK kompozisyon, üç çıktı (§10 · FAZ-5.9).
//
// **Üç ayrı kompozisyon üç ayrı bakım yüküdür.** Metin bir yerde düzeltilir, diğer
// ikisinde unutulur; altı ay sonra hangisinin doğru olduğu bilinmez. Bu yüzden
// kompozisyon tek, en-boy bir PARAMETRE.
//
// **Değişen tek şey satır BÜTÇESİ, punto DEĞİL.** 9:16 çerçeve 16:9'dan dar; aynı
// başlık orada daha az karakter alır. Doğru tepki metni KÜÇÜLTMEK değil BÖLMEK
// (§7.1 · R-23): küçülen metin dikey videoda telefonda okunamaz hâle gelir ve bunu
// ancak yayınladıktan sonra fark edersiniz.
//
// `splitForLayout` zaten bir ölçek çarpanı DÖNDÜREMEZ — imzasında öyle bir alan yok
// (D-…/`enum.ts`). Bu dosya o kararı en-boy eksenine taşıyor.

import type { Block } from '@suite/kernel'
import { LAYOUT_SPECS, paginate, type LayoutName } from './enum.js'
import { placementById, safeBand } from '../specs/placements.js'

export interface ExplainerAspect {
  readonly id: string
  readonly width: number
  readonly height: number
  /**
   * Metnin gerçekten kullanabildiği genişlik.
   *
   * 9:16'da bu **güvenli alan** genişliğidir, tuvalin tamamı değil: Reels'te yanlarda
   * %6 UI var (§9.1) ve oraya yazmak metni platformun düğmelerinin altına gömmektir.
   */
  readonly usableWidth: number
}

/**
 * Master en-boy: 16:9. **Bir platform spec'i DEĞİL** — bizim yakalama ölçümüz (5.6)
 * ve bütçe oranlarının paydası. Platform ölçüleri `placements.ts`te ve orada her
 * satır `sourceUrl` + `verifiedAt` taşıyor; burada uydurma bir kaynak yazmıyoruz.
 */
export const MASTER: ExplainerAspect = {
  id: 'master-16x9',
  width: 1920,
  height: 1080,
  usableWidth: 1920,
}

const dikey = placementById('instagram-story-9x16')
const kare = placementById('linkedin-feed-1x1')

/** Üç çıktı en-boyu. Dördüncüsü eklenecekse bu liste değişir, kompozisyon değişmez. */
export const EXPLAINER_ASPECTS: readonly ExplainerAspect[] = [
  MASTER,
  ...(dikey === null
    ? []
    : [
        {
          id: dikey.id,
          width: dikey.width,
          height: dikey.height,
          // Güvenli alan genişliği — tuval değil.
          usableWidth: safeBand(dikey).width,
        },
      ]),
  ...(kare === null
    ? []
    : [{ id: kare.id, width: kare.width, height: kare.height, usableWidth: kare.width }]),
]

/**
 * Bu en-boyda karakter bütçesi.
 *
 * Oran master'a göre: dar çerçeve daha az karakter alır. Punto sabit kaldığı için
 * karakter genişliği de sabittir ve oran doğrusaldır.
 */
export const budgetFor = (
  layout: LayoutName,
  aspect: ExplainerAspect
): { readonly heading: number; readonly body: number } => {
  const spec = LAYOUT_SPECS[layout]
  const oran = aspect.usableWidth / MASTER.usableWidth
  return {
    heading: Math.floor(spec.headingBudget * oran),
    body: Math.floor(spec.bodyBudget * oran),
  }
}

export interface AspectLayout {
  readonly aspect: ExplainerAspect
  readonly slides: readonly (readonly Block[])[]
  /** Bu en-boyda metin bölündü mü. */
  readonly split: boolean
  /**
   * Tek başına sığmayan blok var mı. Bölmek onu çözmez ve **küçültmek yasak** —
   * çağıran metni kısaltmalı. Sessizce kırpmak iki yasağı birden çiğnerdi.
   */
  readonly oversized: boolean
}

/**
 * Blokları her en-boy için ayrı ayrı sayfalar.
 *
 * **Punto hiçbir en-boyda değişmez** — dönüş tipinde ölçek alanı YOK. Dar çerçevede
 * fazladan slayt çıkar; bu istenen davranıştır ve `split` bayrağıyla görünür.
 */
export const layoutAcrossAspects = (
  blocks: readonly Block[],
  layout: LayoutName,
  aspects: readonly ExplainerAspect[] = EXPLAINER_ASPECTS
): readonly AspectLayout[] =>
  aspects.map((aspect) => {
    // `paginate` YENİDEN YAZILMIYOR: sonsuz döngü koruması ve `oversized` işareti
    // orada ve tek yerde kalmalı. Burada değişen tek şey BÜTÇE.
    const dilimler = paginate(blocks, layout, budgetFor(layout, aspect))
    return {
      aspect,
      slides: dilimler.map((d) => d.blocks),
      split: dilimler.length > 1,
      oversized: dilimler.some((d) => d.oversized),
    }
  })
