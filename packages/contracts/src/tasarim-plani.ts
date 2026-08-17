// HEDEF: packages/contracts/src/tasarim-plani.ts
//
// Tasarım planı — kararların GEREKÇESİYLE yazılı hâli (FAZ-14.2 · §7.1 · §3.5).
//
// **Neden var:** hat bugün on bir adımlı ve olgun; her koşu `donmus-plan.json` yazıyor.
// Ama o plan *hangi adım, hangi sağlayıcı, ne maliyet* donduruyor — **hangi düzen, hangi
// görsel öge, neden** demiyor. O kararlar `composeBody`/`paginateDocument` içinde kod
// dalları olarak veriliyor ve hiçbir artefakta düşmüyor. *"Bu slayt neden böyle
// tasarlandı?"* sorusunun cevabı repoda hiçbir yerde yazılı değildi.
//
// ⚠ **NİYET planlanır, ÖLÇÜM planlanamaz.** İlk taslak planın düzeni de seçmesini
// öngörüyordu. Kod okunduğunda yanlış çıktı: `duzenSec` sayfalayıcının içinde, sayfa
// başına koşuyor, çünkü kaç bloğun sığdığını bilen tek yer orası. Düzeni önden seçmek ya
// sayfalamayı ya düzeni yalan yapardı. Plan bu yüzden **politika** tutuyor; gerçekleşme
// koşuda kaydediliyor ve 14.4 ikisini karşılaştırıyor.

import type { Islev } from './senaryo.js'

/**
 * Kompozisyon ailesi — estetik profil.
 *
 * ⚠ **KAPALI değil, AÇIK uçlu bir ad alanı** (D-254 ile çelişmez): kapalı olan GARANTİ
 * katmanıdır (okunabilirlik, kontrast, güvenli alan, chroma tavanı). Aile yalnız estetik
 * seçer ve garantiyi gevşetemez. Bugün tek aile var; ikincisi FAZ-12.7'de gelir.
 */
export type AileAdi = string

/** Bir slaytın görsel öge POLİTİKASI — ne konacağı değil, neyin konabileceği. */
export const OGE_POLITIKALARI = ['yok', 'diyagram', 'ikon', 'gorsel-yuvasi'] as const
export type OgePolitikasi = (typeof OGE_POLITIKALARI)[number]

/**
 * Gerekçeli bir seçim. **`gerekce` boş olamaz** — tip zorlamaz, `planGecerli` zorlar.
 *
 * ⚠ Gerekçe alanının varlık sebebi denetlenebilirlik: *"Bu slaytta diyagram var çünkü
 * içerikte üç adımlı bir akış geçiyor."* Bu cümle olmadan seçim, sonradan bakan hiç kimse
 * tarafından doğrulanamaz — ne insan ne de bir sonraki tur.
 */
export interface Secim<T> {
  readonly deger: T
  readonly gerekce: string
}

/** Slayt başına politika. Düzen BURADA YOK — ölçümden çıkıyor (bkz. dosya başı). */
export interface SlaytPolitikasi {
  readonly index: number
  readonly islev: Islev
  readonly oge: Secim<OgePolitikasi>
}

/** Karosel geneli politika. */
export interface TasarimPlani {
  readonly surum: 1
  readonly konu: string
  readonly aile: Secim<AileAdi>
  readonly yay: readonly Islev[]
  /** Süsleme yoğunluğu (D-262) — sabit değil, ailenin parametresi. */
  readonly suslemeYogunlugu: Secim<number>
  /** Panoramik süreklilik açık mı (FAZ-12.4). */
  readonly panorama: Secim<boolean>
  readonly slaytlar: readonly SlaytPolitikasi[]
}

/** Bir planın neden geçersiz olduğu. */
export interface PlanKusuru {
  readonly alan: string
  readonly sebep: 'gerekce-bos' | 'yay-uyusmuyor' | 'islev-uyusmuyor' | 'bos-plan'
}

const bos = (s: string): boolean => s.trim() === ''

/**
 * Planı doğrular — gerekçe ZORUNLU ve yay ile slayt işlevleri tutarlı olmalı.
 *
 * ⚠ Gerekçeyi tip sistemi zorlayamıyor (boş dize de `string`), o yüzden kapı burada.
 * Zorlamasız bir alan bir temennidir — bu projede aynı ders üç kez alındı (kelime
 * tavanı prompt'ta yazılıydı ama sayılmıyordu; `KELIME_TAVANI` yorumu "aynı sayılar"
 * diyordu ama zorlamıyordu).
 */
export const planKusurlari = (p: TasarimPlani): readonly PlanKusuru[] => {
  const k: PlanKusuru[] = []
  if (p.slaytlar.length === 0) k.push({ alan: 'slaytlar', sebep: 'bos-plan' })
  if (bos(p.aile.gerekce)) k.push({ alan: 'aile', sebep: 'gerekce-bos' })
  if (bos(p.suslemeYogunlugu.gerekce)) k.push({ alan: 'suslemeYogunlugu', sebep: 'gerekce-bos' })
  if (bos(p.panorama.gerekce)) k.push({ alan: 'panorama', sebep: 'gerekce-bos' })
  if (p.yay.length !== p.slaytlar.length) k.push({ alan: 'yay', sebep: 'yay-uyusmuyor' })
  p.slaytlar.forEach((s, i) => {
    if (bos(s.oge.gerekce)) k.push({ alan: `slaytlar[${i}].oge`, sebep: 'gerekce-bos' })
    if (p.yay[i] !== undefined && p.yay[i] !== s.islev)
      k.push({ alan: `slaytlar[${i}].islev`, sebep: 'islev-uyusmuyor' })
  })
  return k
}

export const planGecerli = (p: TasarimPlani): boolean => planKusurlari(p).length === 0
