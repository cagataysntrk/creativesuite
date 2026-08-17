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
import type { LayoutName } from './adlar.js'
import { duzenSec } from './secim.js'

// Adlar `adlar.ts`te — `secim.ts` de onları okuyor ve döngü oluşmasın diye ayrıldı.
export { LAYOUTS, type LayoutName } from './adlar.js'

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
    case 'compare':
      // İki sütun da bütçeye giriyor: karşılaştırma tek bir kutu değil, iki liste.
      return (
        b.title.length +
        b.once.label.length +
        b.sonra.label.length +
        [...b.once.items, ...b.sonra.items].reduce((t, x) => t + x.length, 0)
      )
    case 'diagram':
      // Kutu etiketleri esnemez; bütçeye giren onlar.
      return b.nodes.reduce((t, n) => t + n.label.length, b.title.length)
    case 'chart':
      // Grafiğin GEOMETRİSİ esner (yüzdeyle konumlanıyor), BAŞLIĞI esnemez. Bütçeye
      // giren şey bu yüzden yalnız başlık: grafiği "uzun" saymak, kısa başlıklı bir
      // grafiği sığmıyor diye ikinci sayfaya atardı.
      return b.title.length
    case 'image':
      // ⚠ **Görsel SIFIR bütçe harcıyordu ve bu gerçek bir ÇAKIŞMA üretti.**
      //
      // Kabul koşusunda görüldü: görsel + iki gövde bloğu aynı slayta sığıyor sanıldı,
      // metin alt şeride taştı ve son satır `kaydır ››` ile ÜST ÜSTE BİNDİ. Sayfalayıcı
      // yalnız KARAKTER sayıyordu; bir fotoğraf hiç karakter içermediği için "bedava"
      // görünüyordu. Oysa dikey alanı en çok tüketen şey oydu.
      //
      // 180 karakter ≈ `statement` gövde bütçesinin (140) tamamından biraz fazla,
      // `list` bütçesinin (320) yarısından biraz çoğu. Ölçüm: görsel sütun genişliğinde
      // render ediliyor ve gözlenen slaytta kullanılabilir yüksekliğin ~%55'ini
      // kaplıyordu; 180 o payı bütçe diliyle ifade ediyor.
      //
      // **Tam sayı değil, bir SINIF meselesi:** görsel bir metin bloğundan pahalıdır ve
      // sayfalayıcı bunu bilmek zorunda. Sıfır yazmak, bilmediğini sıfır sanmaktı.
      return 180
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
/**
 * Karakter bütçesi. Verilmezse düzenin kendi tavanı kullanılır.
 *
 * **En-boy ekseni bunu daraltır, puntoyu DEĞİL** (FAZ-5.9): 9:16 çerçeve 16:9'dan dar
 * ve aynı başlık orada daha az karakter alır. Doğru tepki bölmek, küçültmek değil.
 */
export interface CharBudget {
  readonly heading: number
  readonly body: number
}

export const splitForLayout = (
  blocks: readonly Block[],
  layout: LayoutName,
  butce?: CharBudget
): Overflow => {
  const temel = LAYOUT_SPECS[layout]
  const spec = {
    ...temel,
    headingBudget: butce?.heading ?? temel.headingBudget,
    bodyBudget: butce?.body ?? temel.bodyBudget,
  }
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
  /**
   * Bu slayt için SEÇİLEN düzen (FAZ-10.4b). Sayfalayıcı biliyor, render bilmiyordu:
   * seçim yapılıp atılıyordu ve `quote` seçmek görsel olarak hiçbir şey değiştirmiyordu.
   */
  readonly duzen: LayoutName
}

/**
 * @param layout Sabit bir düzen, ya da **`null` = slayt başına İÇERİKTEN seç**
 *   (`duzenSec`, FAZ-10.4). `null` bir düzen adı DEĞİL, bir seçim KİPİ; enum'a
 *   `'auto'` eklemek onu kapalı olmaktan çıkarır ve `LAYOUT_SPECS` kaydında
 *   karşılığı olmayan bir anahtar doğururdu.
 */
export const paginate = (
  blocks: readonly Block[],
  layout: LayoutName | null,
  butce?: CharBudget,
  /**
   * Slayt indeksine göre düzeni ZORLAYAN kısıt (FAZ-10.7). `null` dönerse seçim
   * içerikten yapılır. Rol tabanlı kısıt buradan geliyor: kapak bir KANCADIR, madde
   * listesi değil — ve bu kısıt sayfalamaya da girmek zorunda, yalnız çizime değil.
   * Yalnız çizime uygulansaydı kapak `list` bütçesiyle bölünür (6 blok, 320 karakter)
   * ama `statement` gibi çizilirdi: tam olarak gördüğümüz metin duvarı.
   */
  rolKisiti?: (index: number) => LayoutName | null
): readonly Slide[] => {
  const slides: Slide[] = []
  let kalan = blocks

  while (kalan.length > 0) {
    // Seçim HER slayt için yeniden yapılıyor, bir kez değil: aynı karoselde kapak bir
    // `statement`, üçüncü slayt bir `list` olabilir. Bir kez seçilseydi en baştaki
    // bloklar tüm karoselin bütçesini belirlerdi.
    const d = rolKisiti?.(slides.length) ?? layout ?? duzenSec(kalan)
    const { fits, overflow } = splitForLayout(kalan, d, butce)
    if (fits.length === 0) {
      // İlk blok tek başına sığmıyor: bölmek çözmez. Kendi slaydına konur ve
      // `oversized` ile İŞARETLENİR — çağıran metni kısaltmalı.
      slides.push({ blocks: [kalan[0] as Block], oversized: true, duzen: d })
      kalan = kalan.slice(1)
      continue
    }
    slides.push({ blocks: fits, oversized: false, duzen: d })
    kalan = overflow
  }
  return slides
}

/**
 * Belgeyi düzene göre slaytlara böler; boyut ve token'lar korunur.
 *
 * **Slayt kimliği BURADA doğuyor** (§7.1 · D-254): sayfalama kaç slayt olduğunu ve
 * hangisinin kaçıncı olduğunu bilen tek yer. Kimliği çağırana hesaplatmak, iki yerde
 * iki farklı sayı demekti — ve `total` yanlışsa hayalet rakam da sayaç da yalan söyler.
 *
 * Roller: ilk **kapak**, son **kapanış**, arası **gövde**; tek slaytta **tek**.
 * Kapak ve kapanışın ayrı olması bir süs değil — ızgarada dizinin nerede başlayıp
 * nerede bittiği görünmeli.
 */
export const paginateDocument = (
  doc: DocumentModel,
  layout: LayoutName | null,
  kulp?: string
): readonly DocumentModel[] => {
  // ── İKİ GEÇİŞ ────────────────────────────────────────────────────────────
  //
  // Rol `total`e bağlı (son slayt kapanıştır) ama `total` sayfalama bitmeden bilinmiyor.
  // Tek geçişte rol kısıtı uygulanamaz. İki geçiş SAF ve UCUZ: birinci geçiş kaç slayt
  // olacağını öğreniyor, ikincisi rolü bilerek bölüyor.
  //
  // İlk geçişin sonucu ATILIYOR ve bu kasıtlı: kısıtlı bölme farklı sayıda slayt
  // üretebilir. Sayıyı ilk geçişten alıp ikincisine dayatmak, `total`i yalan yapardı.
  const onGecis = paginate(doc.blocks, layout)
  const tahminiN = onGecis.length
  const slaytlar =
    tahminiN <= 1
      ? onGecis
      : paginate(doc.blocks, layout, undefined, (i) =>
          // Kapak ve kapanış her zaman TEK GÜÇLÜ İFADE. Referansta da öyle: ilk kare bir
          // kanca, son kare bir davet — ikisi de madde listesi değil. Aradaki gövde
          // slaytları içerikten seçiliyor.
          i === 0 || i === tahminiN - 1 ? 'statement' : null
        )
  const n = slaytlar.length
  return slaytlar.map((s, i) => ({
    ...doc,
    blocks: s.blocks,
    slayt: {
      role:
        n === 1
          ? ('tek' as const)
          : i === 0
            ? ('kapak' as const)
            : i === n - 1
              ? ('kapanis' as const)
              : ('govde' as const),
      index: i,
      total: n,
      // Düzen KİMLİĞE giriyor: `renderStatic(doc)` yalnız belgeyi görüyor, ayrı bir
      // parametre eklemek imzayı ikiye bölerdi ve biri unutulurdu.
      duzen: s.duzen,
      ...(kulp === undefined ? {} : { kulp }),
    },
  }))
}
