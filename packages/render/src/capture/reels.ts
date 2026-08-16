// `reels` — demo bölüm işaretlerinden DETERMİNİSTİK türetme (§10, §9.1 · FAZ-5.8).
//
// **Otomatik klipleyici YOK** (§17). Piyasadaki hepsi konuşma ENERJİSİYLE çalışır:
// ses seviyesi yükselen yerleri "ilginç" sayar. Sessiz bir ekran kaydında bu yöntem
// hiçbir şey bulamaz — ve bulduğunu sandığı şey gürültüdür. Bizde bölüm sınırı zaten
// veri: `timeline.json`daki `chapter: true` işaretleri (5.6), ve onları demo script'i
// tıklamadan ÖNCE yazdı.
//
// **Deterministik demek: aynı demo → aynı reels.** Rastgelelik yok, eşik yok, model
// yok. İkinci kez koştuğunda farklı klip veren bir türetme, "bu klibi onayladım"
// cümlesini anlamsız yapardı.
//
// **Bu dosya video KESMEZ.** Kırpma dikdörtgenlerini ve süreleri HESAPLAR; kesmeyi
// `RENDER` yapar. Saf kalmasının bedeli sıfır, kazancı tam test edilebilirlik.

import type { CaptureTimeline, ClickTarget } from './timeline.js'
import { chapters } from './timeline.js'
import type { Placement } from '../specs/placements.js'
import { safeBand } from '../specs/placements.js'

/** Kaynak videodan kesilecek dikdörtgen — hedef en-boya göre. */
export interface CropRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface Reel {
  /** Bölüm işaretinin etiketi — `narration.tr.json`daki bölüm id'siyle eşleşir. */
  readonly id: string
  readonly startSec: number
  readonly endSec: number
  /** Kaynak videodan kesilecek 9:16 pencere. */
  readonly crop: CropRect
  /** Bu bölümün anlatı metni. Boşsa klip sessiz kalır ve bu SÖYLENİR. */
  readonly narration: string
}

export type ReelsError =
  /** Hiç bölüm işareti yok — tahmin YAPILMAZ. */
  | { readonly kind: 'no_chapters' }
  /** Bölüm çok kısa: bir saniyenin altı klip değil, kare. */
  | { readonly kind: 'too_short'; readonly id: string; readonly sec: number }
  /** Bölüm çok uzun: reels kısa formattır, kırpmak KARAR ister. */
  | { readonly kind: 'too_long'; readonly id: string; readonly sec: number }
  /** Anlatı metni yok — klip sessiz kalır. */
  | { readonly kind: 'no_narration'; readonly id: string }
  /** Kırpma penceresi kaynağa sığmıyor: kaynak zaten 9:16'dan dar. */
  | { readonly kind: 'source_too_narrow'; readonly needed: number; readonly have: number }

export type ReelsResult =
  | { readonly ok: true; readonly value: readonly Reel[] }
  | { readonly ok: false; readonly errors: readonly ReelsError[] }

/**
 * Klip süre sınırları. **Sayılar BURADA ve gerekçeleriyle** — koda gömülü sihirli
 * eşikler, altı ay sonra kimsenin savunamayacağı kararlardır.
 */
export const MIN_KLIP_SN = 3
/** Reels üst sınırı 90 sn; 60'ta duruyoruz — 90'a dayanan klip kesilme riskindedir. */
export const MAX_KLIP_SN = 60

/**
 * 9:16 kırpma penceresi — hedefin MERKEZİNE göre, kaynağın içine KENETLENMİŞ.
 *
 * Merkez kullanılıyor çünkü zoom odağı da merkez (5.6); ikisi ayrışırsa klip,
 * zoom'un gösterdiğinden başka bir yeri gösterir.
 *
 * Genişlik ÇİFT sayıya yuvarlanır: h264 tek boyutu sessizce yuvarlar ve 1 piksellik
 * kayma her kareyi yeniden örnekler (5.6'daki aynı tuzak).
 */
export const cropFor = (
  kaynak: { readonly width: number; readonly height: number },
  hedef: Placement,
  merkezX: number
): CropRect | null => {
  const oran = hedef.width / hedef.height
  let w = Math.round(kaynak.height * oran)
  if (w % 2 !== 0) w += 1
  if (w > kaynak.width) return null

  const ham = Math.round(merkezX - w / 2)
  // Kenetleme: hedef kenara yakınsa pencere kayar ama kaynağın DIŞINA çıkmaz.
  const x = Math.max(0, Math.min(ham, kaynak.width - w))
  return { x, y: 0, width: w, height: kaynak.height }
}

/**
 * Bölüm işaretlerinden klipleri türetir.
 *
 * Her bölüm bir sonraki bölüme kadar sürer; sonuncusu zaman çizgisinin sonuna kadar.
 * Zaman çizgisinin sonu SON HEDEFİN anı değil — son hedeften sonra da görüntü akıyor;
 * bu yüzden `toplamSure` dışarıdan verilir ve tahmin edilmez.
 */
export const deriveReels = (
  t: CaptureTimeline,
  toplamSure: number,
  anlati: Readonly<Record<string, string>>,
  hedef: Placement
): ReelsResult => {
  const bolumler = chapters(t)
  if (bolumler.length === 0) return { ok: false, errors: [{ kind: 'no_chapters' }] }

  const errors: ReelsError[] = []
  const reels: Reel[] = []

  bolumler.forEach((b: ClickTarget, i: number) => {
    const sonraki = bolumler[i + 1]
    const bitis = sonraki === undefined ? toplamSure : sonraki.at
    const sure = bitis - b.at

    if (sure < MIN_KLIP_SN) {
      errors.push({ kind: 'too_short', id: b.label, sec: sure })
      return
    }
    if (sure > MAX_KLIP_SN) {
      // Kırpmak bir KARAR: nereden kesileceğini sistem bilemez ve tahmin ederse
      // bölümün ortasını atar. İnsan bölümü ikiye ayırsın.
      errors.push({ kind: 'too_long', id: b.label, sec: sure })
      return
    }

    const metin = anlati[b.label] ?? ''
    if (metin === '') errors.push({ kind: 'no_narration', id: b.label })

    const crop = cropFor(t, hedef, b.box.x + b.box.width / 2)
    if (crop === null) {
      errors.push({
        kind: 'source_too_narrow',
        needed: Math.round(t.height * (hedef.width / hedef.height)),
        have: t.width,
      })
      return
    }

    reels.push({ id: b.label, startSec: b.at, endSec: bitis, crop, narration: metin })
  })

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: reels }
}

/**
 * Klibin metni güvenli alanın İÇİNDE mi (§9.1).
 *
 * Reels'te UI görselin ÜSTÜNDE: üstte %14, altta %35, yanlarda %6. Metni oraya koymak,
 * onu platformun kendi düğmelerinin altına gömmek demektir — ve bunu ancak yayınladıktan
 * sonra telefonda görürsünüz.
 */
export const textBand = (hedef: Placement): CropRect => {
  const b = safeBand(hedef)
  return { x: b.x, y: b.y, width: b.width, height: b.height }
}

export const reelsHataMesaji = (e: ReelsError): string => {
  switch (e.kind) {
    case 'no_chapters':
      return 'bölüm işareti YOK — türetme tahmin yapmaz; demo script’i `chapter: true` yazmalı'
    case 'too_short':
      return `'${e.id}' ${e.sec.toFixed(1)} sn — ${MIN_KLIP_SN} sn altı klip değil, karedir`
    case 'too_long':
      return `'${e.id}' ${e.sec.toFixed(1)} sn — ${MAX_KLIP_SN} sn üstü; nereden kesileceği bir KARAR, bölümü ikiye ayırın`
    case 'no_narration':
      return `'${e.id}' için anlatı metni yok — klip sessiz kalır`
    case 'source_too_narrow':
      return `kaynak ${e.have}px, 9:16 için ${e.needed}px gerekiyor — kırpma penceresi sığmıyor`
  }
}
