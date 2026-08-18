// GROUP: fast
// Elle kodlanmış JENERİK GRAFİK ÖGE sayısı ARTMIYOR mu (R-81 · D-279 · FAZ-15).
//
// ⚠ ⚠ **BU KAPI BİR ÖLÇÜMDEN DOĞDU, bir tercihten değil.** Depo sahibi `examples/`
// altındaki profesyonel tasarımlarla bizim çıktıları yan yana koydu: fark renkte ya da
// düzende değil, ÖGELERDEydi. Elle kodlanmış bir ikon/rozet/çerçeve "bilgisayar işi"
// gibi duruyor çünkü öyle — bir tasarımcının çizdiği öge, ölçülemeyen binlerce kararı
// taşır; `border-radius: 50%` taşımaz.
//
// ⚠ **Kural YENİ öge için.** Mevcutlar dondurulmuş durumda: silmek kompozisyonu bozardı
// ve emeklilik silme değildir (Yasa 10). Ölçülen şey SAYININ ARTMAMASI.
//
// ⚠ ⚠ **KIRPMA BİR ÖGE DEĞİLDİR ve bu ayrım kapının kalbi.** `clip-path: circle(50%)`
// bir GÖRSELİ daire yapıyor — fotoğrafın kadrajı, çizilmiş bir şekil değil. Aynı satırı
// yasaklamak, `donen` şablonunun daire maskesini imkânsız kılardı. Ayrım: şeklin İÇİ
// fotoğrafla doluysa kırpmadır, boşsa ögedir.
//
// ⚠ Yerleşim, tipografi, zemin reçetesi ve VERİ görselleştirmesi (çubuk, vafel) kapsam
// dışı: çubuk bir süs değil, verinin kendisi. R-81 istisnaları birebir burada.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const KAYNAK = 'packages/render/src'

/**
 * Elle çizilmiş şekil üreten CSS kalıpları.
 *
 * ⚠ Kalıplar ŞEKİL kuranlar; `border-radius: 8px` (kart köşesi) burada YOK çünkü o bir
 * öge değil, bir kenar yumuşatması.
 */
const KALIPLAR = [
  { ad: 'daire', re: /border-radius:\s*50%/g },
  // ⚠ İki biçim: CSS `clip-path:` ve SVG özniteliği `clip-path=`. İlk sürüm yalnız
  // ilkini arıyordu ve SVG maskesini hiç saymıyordu — kapı kendi tavanıyla ayrıştı.
  { ad: 'kirpma-yolu', re: /clip-path[:=]/g },
  { ad: 'cokgen', re: /polygon\(/g },
  { ad: 'sozde-oge', re: /content:\s*''/g },
  { ad: 'ucgen-kenar', re: /border-(left|right|top|bottom):\s*\d+px solid transparent/g },
  // ⚠ ⚠ **SVG İLKELLERİ — kapının EN BÜYÜK KÖR NOKTASIYDI.** İlk sürüm yalnız CSS
  // şekillerini sayıyordu; `sablon-ikon.ts` yirmi ikonu 57 SVG ilkeliyle ELLE çiziyordu
  // ve kapı YEŞİL diyordu. R-81'in tarif ettiği ihlalin en büyüğü, R-81'in kapısından
  // görünmüyordu. Bir kural, ölçmediği şeyi yasaklayamaz.
  { ad: 'svg-cizgi', re: /<line\b/g },
  { ad: 'svg-cember', re: /<circle\b/g },
  { ad: 'svg-dikdortgen', re: /<rect\b/g },
  { ad: 'svg-coklu-cizgi', re: /<polyline\b/g },
  { ad: 'svg-cokgen', re: /<polygon\b/g },
  { ad: 'svg-yol', re: /<path\b/g },
]

/**
 * Kapsam dışı dosyalar — ÜRETİLMİŞ olanlar.
 *
 * ⚠ `ikon-govde.ts` Lucide'den (ISC) üretiliyor; içindeki `path`ler KÜTÜPHANENİN çizimi,
 * bizim değil. Onu saymak, kuralın istediği şeyi cezalandırmak olurdu.
 */
const URETILMIS = new Set(['ikon-govde.ts'])

/**
 * DONDURULMUŞ SAYIM — her satır bir gerekçe taşıyor.
 *
 * ⚠ Bir sayıyı büyütmek isteyen, `KARARLAR.md`ye bir `D-nn` yazmak zorunda. Kapıyı
 * sessizce gevşetmek, kuralın kendisini kaldırmakla aynı şey.
 */
const TAVAN = {
  // ⚠ ⚠ **SIFIR ve SIFIR KALMALI.** Bu dosya yirmi ikonu elle çiziyordu (D-289); ikonlar
  // artık Lucide'den (ISC) geliyor. Buradaki her artış, kuralın geri alınması demek.
  'sablon-ikon.ts': {
    'svg-cizgi': 0,
    'svg-cember': 0,
    'svg-dikdortgen': 0,
    'svg-coklu-cizgi': 0,
    'svg-cokgen': 0,
    'svg-yol': 0,
  },
  // Bant eğrisi, blob, alan sınırı, lekeler — VERİ ve KOMPOZİSYON, süs değil (R-81 istisnası).
  'panorama.ts_svg': { 'svg-cizgi': 1, 'svg-cember': 3, 'svg-dikdortgen': 2, 'svg-yol': 6 },
  // Marka kilidi ve desen: `static.ts` (sekiz hat) onları kullanıyor. Emeklilikleri ayrı
  // bir karar — gerekçeleri artık geçersiz (D-289 borç notu) ama sekiz hattı kırmıyoruz.
  'marka-isareti.ts': { 'svg-dikdortgen': 1 },
  'sablon-susleme.ts_svg': { 'svg-cizgi': 2, 'svg-cember': 3, 'svg-dikdortgen': 1, 'svg-yol': 2 },
  'static.ts_svg': { 'svg-cizgi': 1, 'svg-yol': 1 },
  'zemin.ts_svg': { 'svg-dikdortgen': 1 },
  // `.gorsel.daire` ve `.gorsel-yer.daire` KIRPMA (donen şablonunun daire maskesi);
  // `.kilometre-nokta` (13px) ve `.madalyon-no` (46px) elle çizilmiş öge — DONDURULDU.
  'panorama.ts': { daire: 4, 'kirpma-yolu': 0, cokgen: 0, 'sozde-oge': 0, 'ucgen-kenar': 0 },
  // ⚠ Tavan 4 değil 1: ilk sayım YORUMLARI da sayıyordu. `clip-path: circle(50%)` KODDA
  // bir kez geçiyor, kalan üçü o kararın neden böyle olduğunu anlatan açıklama satırları.
  'static.ts': { daire: 0, 'kirpma-yolu': 1, cokgen: 0, 'sozde-oge': 0, 'ucgen-kenar': 0 },
  // SVG `clip-path="url(#…)"` — tarama deseninin maskesi, çizilmiş şekil değil.
  'sablon-susleme.ts': { daire: 0, 'kirpma-yolu': 1, cokgen: 0, 'sozde-oge': 0, 'ucgen-kenar': 0 },
}

const dosyalar = readdirSync(join(REPO, KAYNAK)).filter(
  (d) => d.endsWith('.ts') && !d.endsWith('.test.ts')
)

/**
 * Yorumları ATAR — kalıplar yalnız KODDA aranır.
 *
 * ⚠ ⚠ **İLK SÜRÜM YORUMLARI SAYIYORDU ve ilk koşuda yanlış pozitif verdi:**
 * `sekil-cebri.ts` içinde `polygon()` geçiyor ama bir AÇIKLAMA cümlesinde — "`polygon()`
 * koordinatları float'ın kendi kutusuna göre" diye, hem de o tekniğin neden
 * KULLANILMADIĞINI anlatarak. Bu depoda ölçüm aracının kendisi, ölçtüğü şeyden daha sık
 * bozuk çıkıyor; kapı yazarken ilk soru "aracım ne sayıyor" olmalı.
 */
const kodu = (metin) => metin.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const hatalar = []
for (const dosya of dosyalar) {
  if (URETILMIS.has(dosya)) continue
  const metin = kodu(readFileSync(join(REPO, KAYNAK, dosya), 'utf8'))
  for (const { ad, re } of KALIPLAR) {
    const sayi = (metin.match(re) ?? []).length
    // ⚠ İki anahtar: CSS tavanları `<dosya>`, SVG tavanları `<dosya>_svg` altında.
    // Tek nesnede birleştirmek, bir kalıbı yanlış listeye yazınca sessizce 0 tavan verirdi.
    const tavan = TAVAN[dosya]?.[ad] ?? TAVAN[`${dosya}_svg`]?.[ad] ?? 0
    if (sayi > tavan) {
      hatalar.push(
        `${KAYNAK}/${dosya}: '${ad}' ${sayi} kez (tavan ${tavan}) — R-81: jenerik öge ` +
          `kodlanmaz. Tasarım kütüphanesinden gelmeli; gerekçesi varsa D-nn yazıp tavanı yükselt.`
      )
    }
  }
}

// ⚠ Tavanı DÜŞEN dosya da bildiriliyor: bir öge silinmişse tavan onunla birlikte inmeli,
// yoksa kapı sessizce gevşer ve yerine yenisi konabilir.
for (const [anahtar, beklenen] of Object.entries(TAVAN)) {
  const dosya = anahtar.replace(/_svg$/, '')
  if (!dosyalar.includes(dosya)) {
    hatalar.push(`TAVAN'da olan dosya yok: ${dosya} — kapı kendi listesiyle ayrışmış.`)
    continue
  }
  const metin = kodu(readFileSync(join(REPO, KAYNAK, dosya), 'utf8'))
  for (const { ad, re } of KALIPLAR) {
    const sayi = (metin.match(re) ?? []).length
    if (sayi < (beklenen[ad] ?? 0)) {
      hatalar.push(
        `${KAYNAK}/${dosya}: '${ad}' ${sayi}'e DÜŞTÜ (tavan ${beklenen[ad]}) — tavanı da indir.`
      )
    }
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.error(`  ✗ ${h}`)
  process.exit(1)
}
console.log(`  ✓ elle kodlanmış öge sayısı tavanda (${dosyalar.length} dosya tarandı)`)
