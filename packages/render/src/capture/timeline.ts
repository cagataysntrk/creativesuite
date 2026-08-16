// `timeline.json` — tıklama niyeti PİKSEL OLUŞMADAN ÖNCE yazılır (§7.7 · FAZ-5.6).
//
// **Asıl numara bu.** Her açık kaynak ekran kaydedici, zoom ve kırpma hedeflerini
// kaydedilmiş fare izinden ÇIKARMAK zorunda: görüntüde imleci bul, hareketi izle,
// tıklamayı tahmin et. Kırılgan ve yavaş. Bizde Playwright script'i zaten hedefi
// BİLİYOR — `locator.boundingBox()` tıklamadan önce çağrılıyor — ve onu veri olarak
// yazıyor. Zoom hedefleri, bölüm işaretleri ve otomatik kırpma bundan deterministik
// olarak türer (5.8).
//
// **Bu dosya tarayıcıya DOKUNMAZ.** Girdi zaten ölçülmüş kutulardır; ölçen yer
// Playwright script'i. Ayrım kasıtlı: şema ve doğrulama saf kalıyor ve gerçek yakalama
// olmadan tam test edilebiliyor.

/** Ekranda bir dikdörtgen. Playwright'ın `boundingBox()` çıktısıyla aynı şekil. */
export interface Box {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface ClickTarget {
  /** Ne tıklandı — insan okunur; bölüm başlığı olarak da kullanılır. */
  readonly label: string
  /** Kaydın başından itibaren saniye. */
  readonly at: number
  readonly box: Box
  /**
   * Bölüm sınırı mı. `reels` (5.8) klipleri BURADAN türer — konuşma enerjisinden
   * değil. Otomatik klipleyiciler sessiz ekran kaydında işe yaramaz (§17).
   */
  readonly chapter: boolean
}

export interface CaptureTimeline {
  /** Yakalama çözünürlüğü — kutular bu uzaya ait ve dışına taşamaz. */
  readonly width: number
  readonly height: number
  readonly fps: number
  readonly targets: readonly ClickTarget[]
}

export type TimelineError =
  | { readonly kind: 'no_targets' }
  | { readonly kind: 'negative_time'; readonly label: string }
  /** Hedef ekranın DIŞINDA: zoom oraya giderse siyah kare çıkar. */
  | { readonly kind: 'out_of_bounds'; readonly label: string }
  /** Sıfır alan: `boundingBox()` görünmeyen öğe için bunu döndürür. */
  | { readonly kind: 'empty_box'; readonly label: string }
  /** Zaman geriye gidiyor — kayıt sırası bozuk. */
  | { readonly kind: 'out_of_order'; readonly label: string }

export type TimelineResult =
  | { readonly ok: true; readonly value: CaptureTimeline }
  | { readonly ok: false; readonly errors: readonly TimelineError[] }

/**
 * Zaman çizgisini doğrular.
 *
 * **Sıfır alanlı kutu SESSİZ geçmez.** Playwright görünmeyen bir öğe için
 * `{x:0,y:0,width:0,height:0}` döndürür; onu yazmak, zoom'un ekranın köşesine
 * gitmesi ve kimsenin sebebini anlamaması demektir.
 */
export const validateTimeline = (t: CaptureTimeline): TimelineResult => {
  const errors: TimelineError[] = []
  if (t.targets.length === 0) errors.push({ kind: 'no_targets' })

  let oncekiAn = -Infinity
  for (const h of t.targets) {
    if (h.at < 0) errors.push({ kind: 'negative_time', label: h.label })
    else if (h.at < oncekiAn) errors.push({ kind: 'out_of_order', label: h.label })
    oncekiAn = Math.max(oncekiAn, h.at)

    const b = h.box
    if (b.width <= 0 || b.height <= 0) {
      errors.push({ kind: 'empty_box', label: h.label })
      continue
    }
    if (b.x < 0 || b.y < 0 || b.x + b.width > t.width || b.y + b.height > t.height) {
      errors.push({ kind: 'out_of_bounds', label: h.label })
    }
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: t }
}

/**
 * Zoom odağı — `hf-zoom`un `--hf-odak` değişkenine giren yüzde çifti (5.3).
 *
 * Hedefin MERKEZİ kullanılır, sol üst köşesi değil: `transform-origin` bir noktadır
 * ve köşeyi vermek, yakınlaşınca hedefi kadrajın dışına iter.
 */
export const zoomOrigin = (t: CaptureTimeline, hedef: ClickTarget): string => {
  const cx = ((hedef.box.x + hedef.box.width / 2) / t.width) * 100
  const cy = ((hedef.box.y + hedef.box.height / 2) / t.height) * 100
  const yuvarla = (n: number): string => (Math.round(n * 10) / 10).toFixed(1)
  return `${yuvarla(cx)}% ${yuvarla(cy)}%`
}

/** Bölüm işaretleri — `reels` klipleri bunlardan deterministik türer (5.8). */
export const chapters = (t: CaptureTimeline): readonly ClickTarget[] =>
  t.targets.filter((h) => h.chapter)

export const timelineHataMesaji = (e: TimelineError): string => {
  switch (e.kind) {
    case 'no_targets':
      return 'hiç tıklama hedefi yok — zoom ve bölüm işaretleri türetilemez'
    case 'negative_time':
      return `'${e.label}' negatif zaman taşıyor`
    case 'out_of_bounds':
      return `'${e.label}' ekranın DIŞINDA — zoom oraya giderse siyah kare çıkar`
    case 'empty_box':
      return `'${e.label}' sıfır alanlı: öğe görünmüyordu, boundingBox() boş döndü`
    case 'out_of_order':
      return `'${e.label}' zamanı geriye gidiyor — kayıt sırası bozuk`
  }
}
