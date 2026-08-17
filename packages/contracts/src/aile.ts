// HEDEF: packages/contracts/src/aile.ts
//
// Kompozisyon ailesi — kapalı GARANTİ, açık AİLE (FAZ-12.7 · §7.1 · D-254).
//
// *"Tek çeşidi yok, binlerce çeşidi var."* D-254 kapalı bir düzen enum'u kurdu ve bu
// doğruydu — ama kapalı olan **garanti katmanı**, açık olan **estetik katman**.
//
// ⚠ ⚠ **AİLE GÜVENLİĞİ GEVŞETEMEZ — ve bu tip sistemiyle zorlanıyor.** Güvenli alan,
// kontrast eşiği, chroma tavanı, kelime bütçesi ve `column_in_band` değişmezi bu arayüzde
// YOK. Alan yoksa aile onu söyleyemez; "yeni aile" her kısıtı delmenin yolu olamaz.
// Bir kural yalnız `KURALLAR.md`'de değişir (R-74), bir veri dosyasında değil.
//
// ⚠ Aile ESTETİK seçer: hangi süsleme yoğunluğu, hangi tipografi efekti, degrade açık mı,
// yuva hangi biçimde. Hepsi bu oturumda ölçülerek "bu ailede kapalı" diye işaretlenen
// şeyler (D-262 ailesi) — kapatma kararları artık bir yerde yaşıyor.

/** Aile kimliği. Kapalı DEĞİL: ikincisi bir veri satırı, bir `case` değil. */
export type AileKimligi = string

/**
 * Bir ailenin estetik parametreleri.
 *
 * ⚠ Her alan bu oturumda BAKARAK verilmiş bir kararın karşılığı. Değerler ailenin;
 * kararın gerekçesi kodda, ait olduğu modülün yorumunda.
 */
export interface AileProfili {
  readonly id: AileKimligi
  /** İnsan okunur ad — plan gerekçesinde geçiyor. */
  readonly ad: string
  /** Süsleme yoğunluğu 0–1 (D-262). Açık kâğıt alanda seyrek, koyu zeminde yoğun. */
  readonly suslemeYogunlugu: number
  /** Vinyet gücü 0 = kapalı. Düz alanlı ailede 0.1 bile alanı çamurlaştırıyor (ölçüldü). */
  readonly vinyetGucu: number
  /** Degrade yüzeyleri açık mı. Düz alan bu ailenin tasarımının kendisi. */
  readonly degrade: boolean
  /** Fotoğraf yuvasının biçimi. */
  readonly yuvaBicimi: 'alan' | 'maske'
  /** Panoramik süreklilik açık mı (FAZ-12.4). */
  readonly panorama: boolean
  /** Ritim oranları — yay bütçelerinin ölçülen tabana göre payı (FAZ-14.1). */
  readonly ritim: { readonly gerilim: number; readonly donus: number }
  /** Açık tipografi efektleri — kapalı dağarcıktan alt küme (FAZ-12.1). */
  readonly tipoEfektleri: readonly ('vurgu' | 'kontur' | 'degrade' | 'golge' | 'knockout')[]
}

/**
 * Bugünkü tek aile: amber ↔ mürekkep iki alan, akan eğri, dev hayalet rakam.
 *
 * Parametreleri uydurulmadı — hepsi bu oturumda ölçülerek ya da bakarak seçildi:
 * süsleme 0.25 (yoğun tarama kâğıt alanda kalabalıktı), vinyet 0 (0.1'de amber 215→229
 * arası değişiyordu, düz olması gereken alan degradeye dönüyordu), degrade kapalı (aynı
 * sebep), gölge/degrade/knockout kapalı (referansların dördü de düz tipografi; knockout'un
 * çözdüğü sorun bu ailede yok — metin eğri sınırını hiç geçmiyor).
 */
export const TEMEL_AILE: AileProfili = {
  id: 'temel',
  ad: 'Temel — amber/mürekkep, akan eğri, hayalet rakam',
  suslemeYogunlugu: 0.25,
  vinyetGucu: 0,
  degrade: false,
  yuvaBicimi: 'alan',
  panorama: false,
  ritim: { gerilim: 0.7, donus: 0.6 },
  tipoEfektleri: ['vurgu', 'kontur'],
}

/**
 * Kayıtlı aileler. **Veri, kod değil** — ikinci aile buraya bir satır.
 *
 * ⚠ Şu an TEK aile var ve bu dürüst hâl: ikinci aileyi bir referans örnek talep etmeden
 * yazmak, kullanıcısı olmayan çeşitlilik üretmek olurdu. `docs/referans/ornekler/`
 * beş ayrı aile gösteriyor; ikincisi (editoryal, örnek 4) FAZ-13'ten sonra ölçülerek açılır.
 */
export const AILELER: readonly AileProfili[] = [TEMEL_AILE]

export const aileBul = (id: AileKimligi): AileProfili | null =>
  AILELER.find((a) => a.id === id) ?? null

/** Bir ailenin garanti katmanına dokunup dokunmadığı — kusur listesi. */
export interface AileKusuru {
  readonly alan: string
  readonly sebep: 'gecersiz-aralik' | 'bilinmeyen-efekt' | 'bos-ad'
}

const ARALIKTA = (v: number): boolean => v >= 0 && v <= 1

/**
 * Aileyi doğrular.
 *
 * ⚠ **Burada kontrast eşiği ya da güvenli alan DENETLENMİYOR — çünkü aile onları
 * TAŞIMIYOR.** Denetlenecek bir alan yoksa gevşetilecek bir kural da yok: garanti
 * katmanının korunması bir kontrolle değil, YOKLUKLA sağlanıyor. En ucuz zorlama budur.
 */
export const aileKusurlari = (a: AileProfili): readonly AileKusuru[] => {
  const k: AileKusuru[] = []
  if (a.ad.trim() === '') k.push({ alan: 'ad', sebep: 'bos-ad' })
  if (!ARALIKTA(a.suslemeYogunlugu)) k.push({ alan: 'suslemeYogunlugu', sebep: 'gecersiz-aralik' })
  if (!ARALIKTA(a.vinyetGucu)) k.push({ alan: 'vinyetGucu', sebep: 'gecersiz-aralik' })
  if (!ARALIKTA(a.ritim.gerilim) || !ARALIKTA(a.ritim.donus))
    k.push({ alan: 'ritim', sebep: 'gecersiz-aralik' })
  return k
}
