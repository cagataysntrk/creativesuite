// HEDEF: packages/render/src/kompozisyon-olcum.ts
//
// Kompozisyon ölçümü — DENGE, taşma değil (FAZ-13.1 · §7.1 · D-254, D-255).
//
// **Neden var:** buraya kadarki her sayı bir TAŞMAYI ölçüyordu — kelime sütuna sığıyor mu,
// metin bandın dışında mı, kontrast eşiği geçiyor mu. Hepsi *kusurun yokluğunu* ölçüyor.
// Bir karosel bunların hepsini geçip yine de dağınık durabilir; denge hiç ölçülmedi.
//
// ⚠ ⚠ **BUNLAR KAPI DEĞİL, RAPOR.** Eşik aşılırsa uyarı üretiliyor, koşu DÜŞMÜYOR.
// Estetiği zorunlu kılmak *kabul edilemez* ile *tercih edilmeyen*i karıştırmaktır ve sistem
// kendi zevkini dayatmaya başlar. `kalite` kapısı elemeye devam ediyor; burası bakıyor.
//
// ⚠ **Ağırlık PİKSELDEN değil GRAMERDEN hesaplanıyor** ve bu bir kolaycılık değil, tercih:
// ekran görüntüsünü çözmek bir PNG çözücü bağımlılığı isterdi (*40 satır yazmak bir
// bağımlılıktan iyidir*), ve daha önemlisi piksel bir ÖRNEKLEMDİR — gramer tasarımın
// kendisi. Eğri, sütun ve hayalet rakam tam olarak biliniyor; ölçüm onlardan türüyor.
//
// ⚠ **Süslemeler ağırlığa GİRMİYOR ve sebebi yazılı:** hepsi kontur (`stroke`), dolgu değil;
// 1080 px'lik bir tuvalde 3 px'lik bir çizginin momenti dolgu alanının binde biri. Onları
// saymak sayıyı hassaslaştırmaz, yalnız uydurulmuş bir kesinlik verirdi.

import type { DocumentModel, SlaytKimligi } from '@suite/kernel'
import { akanEgri, egriSagda, guvenliKolonYuzdesi } from './sablon.js'
import { VARSAYILAN } from './sablon-parametre.js'

/**
 * Optik merkez — göz geometrik merkezi merkez SAYMAZ.
 *
 * ⚠ Klasik tipografi kuralı: bir ögenin optik olarak ortalanması için geometrik merkezin
 * biraz ÜSTÜNE konması gerekir; tam ortadaki öge "aşağı kaymış" görünür. %5 yaygın değer.
 * ⚠ Bu bir EŞİK değil bir HEDEF: ölçüm ona olan uzaklığı raporluyor, kimseyi düşürmüyor.
 */
export const OPTIK_MERKEZ = 0.45

/**
 * Boşluk tabanı — 4 px, §12.3'ün kendi ilanı.
 *
 * ⚠ ⚠ **İLK SÜRÜM FİBONACCİ (8·13·21·34·55·89) YAZIYORDU ve o ölçeği BEN UYDURDUM.**
 * Artefakttan ölçünce çıktı: şablonun ürettiği on beş boşluk değerinin **hiçbiri** o
 * ölçekte değildi. Bir tasarımı, hiç kullanmadığı bir standarda göre ölçmek, ölçümü
 * gürültüye çevirir — gürültü hep kırmızı yanar ve hiç okunmaz.
 * Oysa `static.ts` zaten *"güvenli alan: 4 px tabanın katı (§12.3)"* diyor: sistem
 * VARDI, ölçüm başka bir sisteme bakıyordu. Bu oturumun tekrarlayan hatası — enstrüman,
 * ölçtüğü şeyden daha sık bozuk çıkıyor.
 *
 * ⚠ Şimdi ölçülen şey tasarımın KENDİ tabanı: 4'ün katı olmayan boşluk raporlanıyor.
 * Bu bir KAPI değil rapor (FAZ-13.1); düzeltme bir karar, bir zorlama değil.
 */
export const BOSLUK_TABANI = 4

/** Bir kütle: normalize edilmiş merkez ve ağırlık. */
export interface Kutle {
  readonly x: number
  readonly y: number
  readonly agirlik: number
}

/** Kübik Bézier'in tek boyutta t noktasındaki değeri. */
const bezier = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

/** `akanEgri`nin ürettiği path'ten sayı çiftleri. */
const noktalar = (d: string): readonly (readonly [number, number])[] => {
  const s = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
  const c: [number, number][] = []
  for (let i = 0; i + 1 < s.length; i += 2) c.push([s[i] ?? 0, s[i + 1] ?? 0])
  return c
}

/**
 * Dolgu alanının kütlesi — eğriden İNTEGRALLE.
 *
 * ⚠ Zarf (FAZ-12.10) alanı ÜSTTEN sınırlıyor ve orada bu doğru yöndü: metni uzak tutmak
 * için geniş yanılmak güvenli. Burada tersi geçerli — denge hesabı için gerçek alan
 * gerekiyor, yoksa dolgu tarafı sistematik olarak ağır çıkar. O yüzden eğri ÖRNEKLENİYOR.
 * *Aynı şekil, farklı soru, farklı yaklaşım* — tek bir "şekil sayısı" ikisine de yetmezdi.
 */
export const alanKutlesi = (k: SlaytKimligi, adim = 64): Kutle => {
  const n = noktalar(akanEgri(k))
  // İki kübik parça: [0..3] ve [3..6] (ilki `M`, sonrası `C` üçlüleri).
  const p = n.map(([x, y]) => ({ x, y }))
  let toplamAlan = 0
  let momentX = 0
  let momentY = 0
  for (let i = 0; i < adim; i += 1) {
    const t = (i + 0.5) / adim
    // Parça seçimi: ilk yarı üstteki eğri, ikinci yarı alttaki.
    const ilk = t < 0.5
    const tt = ilk ? t * 2 : (t - 0.5) * 2
    const a = ilk ? p[0] : p[3]
    const b = ilk ? p[1] : p[4]
    const c = ilk ? p[2] : p[5]
    const e = ilk ? p[3] : p[6]
    if (a === undefined || b === undefined || c === undefined || e === undefined) continue
    const x = bezier(a.x, b.x, c.x, e.x, tt)
    const y = bezier(a.y, b.y, c.y, e.y, tt)
    // Dolgu eğrinin dış tarafında: sağdaysa x..100, solda 0..x.
    const genislik = egriSagda(k) ? 100 - x : x
    const merkezX = egriSagda(k) ? x + genislik / 2 : genislik / 2
    toplamAlan += genislik
    momentX += genislik * merkezX
    momentY += genislik * y
  }
  if (toplamAlan === 0) return { x: 50, y: 50, agirlik: 0 }
  return { x: momentX / toplamAlan, y: momentY / toplamAlan, agirlik: toplamAlan / adim }
}

/**
 * Metin sütununun kütlesi.
 *
 * ⚠ Ağırlık alan DEĞİL, alan × DOLULUK: boş bir sütun kütle taşımaz. Doluluk kaba bir
 * kestirim (karakter sayısı) ve öyle olduğu burada yazıyor — uydurulmuş bir kesinlik
 * (`%18,37`) kaba bir kestirimden tehlikelidir (`textCoverage` ile aynı gerekçe).
 */
export const metinKutlesi = (doc: DocumentModel): Kutle => {
  const k = doc.slayt
  if (k === undefined) return { x: 50, y: 50, agirlik: 0 }
  const genislik = guvenliKolonYuzdesi(k)
  const x = egriSagda(k) ? genislik / 2 : 100 - genislik / 2
  const harf = doc.blocks.reduce((t, b) => t + ('text' in b ? b.text.length : 0), 0)
  // Dikey merkez: gövde ortalı, kapak alta yaslı (gramerin kendi kuralı).
  const y = k.role === 'kapak' || k.role === 'tek' ? 72 : 50
  return { x, y, agirlik: Math.min(genislik, harf / 4) }
}

/**
 * Hayalet rakamın kütlesi — dolgu tarafında, alta yaslı, kenardan taşan.
 *
 * ⚠ `opacity: 0.42` ve yalnız KONTUR: görünen mürekkep dolgunun küçük bir kesri. Katsayı
 * 0.42 × ince kontur ≈ alanın %8'i; bu sayı bir ölçüm değil bir KESTİRİM ve o yüzden
 * burada tek bir yerde duruyor.
 */
export const rakamKutlesi = (k: SlaytKimligi): Kutle => {
  if (k.total <= 1) return { x: 50, y: 50, agirlik: 0 }
  const boyut = (VARSAYILAN.hayaletPx / 1080) * 100
  const x = egriSagda(k) ? 100 - boyut * 0.3 : boyut * 0.3
  return { x, y: 100 - (VARSAYILAN.kenarPayi + 62) / 13.5 - boyut * 0.3, agirlik: boyut * 0.08 }
}

/** Kütlelerin bileşke merkezi. Ağırlık toplamı 0 ise tuval merkezi. */
export const bileske = (kutleler: readonly Kutle[]): { readonly x: number; readonly y: number } => {
  const w = kutleler.reduce((t, m) => t + m.agirlik, 0)
  if (w === 0) return { x: 50, y: 50 }
  return {
    x: kutleler.reduce((t, m) => t + m.x * m.agirlik, 0) / w,
    y: kutleler.reduce((t, m) => t + m.y * m.agirlik, 0) / w,
  }
}

/** Bir slaytın kompozisyon merkezi, tuval yüzdesi olarak. */
export const kompozisyonMerkezi = (
  doc: DocumentModel
): { readonly x: number; readonly y: number } => {
  const k = doc.slayt
  if (k === undefined) return { x: 50, y: 50 }
  return bileske([alanKutlesi(k), metinKutlesi(doc), rakamKutlesi(k)])
}

/**
 * Göz yolu — ağırlık, gramerin SEÇTİĞİ tarafta mı.
 *
 * ⚠ ⚠ **İLK SÜRÜM ZİKZAK SAYIYORDU ve gramerin kendisini kusur olarak raporluyordu.**
 * Beş slaytta 3/3 dönüş çıktı — çünkü dolgu tarafı her slaytta yer değiştiriyor ve ritim
 * tam olarak budur (D-254). Ölçtüğü şey doğruydu, ölçmesi gereken şey değildi: **ölçüm
 * aracının tasarımla çatışması**, bu projede tekrarlayan bir sınıf.
 *
 * Doğru soru şu: kütle merkezi, o slaytta dolgunun bulunduğu tarafta mı? Metin hacmi
 * dolguyu bastırıp dengeyi beklenmedik yöne çevirirse bu sayı artar — kompozisyonun
 * gerçekten kaydığı hâl. Ritim ise sıfır üretir, çünkü ritim bir kusur değil.
 */
export const yolSapmasi = (
  slaytlar: readonly { readonly k: SlaytKimligi; readonly x: number }[]
): number => slaytlar.filter((s) => egriSagda(s.k) !== s.x > 50).length

/** Tabanın katı OLMAYAN boşluklar — dikey ritmi bozanlar. */
export const olcekDisiBosluklar = (degerler: readonly number[]): readonly number[] =>
  degerler.filter((d) => d % BOSLUK_TABANI !== 0)
