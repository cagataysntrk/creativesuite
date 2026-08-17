// HEDEF: packages/render/src/sablon-degrade.ts
//
// Degrade yüzeyleri — duraklar RAMPADAN, serbest renkten değil (FAZ-12.9 · §12.1).
//
// ⚠ ⚠ **CHROMA TAVANI AYRI BİR ÖLÇÜMLE DEĞİL, KURGUYLA KORUNUYOR.** Plan "her durak ayrı
// ölçülmeli" diyordu — çünkü bir degradenin ortalaması tavanı geçmese de tek bir durağı
// geçebilir. Doğru ama gereksiz: tavan zaten `ui-tema` kapısında RAMPA TOKEN'LARI
// üstünden zorlanıyor. Duraklar yalnız token adı kabul ederse, tavanı aşan bir durak
// TEMSİL EDİLEMEZ hâle geliyor.
//
// Bu, ailenin garanti alanlarını taşımamasıyla (FAZ-12.7) ve yuvasız görselin
// reddedilmesiyle (FAZ-11.4) aynı ilke: **en ucuz zorlama, ihlalin ifade edilemez
// olmasıdır.** Ölçüm eklemek ikinci bir doğruluk kaynağı yaratırdı.
//
// ⚠ 8-bit bantlaşma gerçek bir kusur: 1080 px'de düşük kontrastlı bir degrade şeritlenir.
// Gren katmanı (FAZ-11.8) bunu gizliyor — süs değil DÜZELTME. Degrade açıksa gren de açık.

/** Rampa token'ı — serbest renk DEĞİL. `--ramp-` ön eki tip düzeyinde zorlanıyor. */
export type RampaTokeni = `--ramp-${string}`

export const DEGRADE_ACILARI = ['dikey', 'yatay', 'kosegen'] as const
export type DegradeAcisi = (typeof DEGRADE_ACILARI)[number]

/**
 * Alan degradesinin SVG tanımı — TEK üretici.
 *
 * ⚠ **CSS karşılığı YAZILMADI ve bu bir karar.** İlk sürümde bir `linear-gradient()`
 * üreteci de vardı; hiçbir üretim yolu onu çağırmıyordu. İki üretici = iki degrade
 * tanımı = biri değişince öbürü sessizce eski kalır (R-05'in degrade karşılığı).
 * Kullanıcısı doğduğunda yazılır.
 *
 * ⚠ Üçüncü durak bir KARAR ister: iki durak arası doğrusal ve öngörülebilir; üçüncüsü
 * orta ton kaymasına yol açar ve kontrast metriği tek renk üstünden ölçtüğü için o kaymayı
 * göremez (FAZ-12.1'de `degrade` metin dolgusunun kapalı bırakılma sebebiyle aynı).
 *
 * ⚠ **CSS `background-image` İŞE YARAMADI ve sebebi yapısal:** dolgu alanı bir `<div>`
 * değil, bir SVG `<path>`. Path'e arka plan resmi uygulanmaz; SVG'de degrade bir
 * `<linearGradient>` tanımı ve `fill="url(#id)"` ile olur. İlk sürüm CSS seçicisi
 * yazıyordu ve seçtiği öge YOKTU — sessizce hiçbir şey yapmazdı.
 *
 * ⚠ `stop-color` içinde `var(--ramp-*)` çalışıyor: aynı belge, aynı özel değişkenler.
 * Yani duraklar hâlâ RAMPADAN ve tavan hâlâ kurguyla korunuyor.
 */
export const degradeDefSvg = (
  id: string,
  bas: RampaTokeni,
  son: RampaTokeni,
  aci: DegradeAcisi = 'kosegen'
): string => {
  const yatay = aci === 'yatay' || aci === 'kosegen'
  const dikey = aci === 'dikey' || aci === 'kosegen'
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" ` +
    `x2="${yatay ? 1 : 0}" y2="${dikey ? 1 : 0}">` +
    `<stop offset="0" stop-color="var(${bas})"/>` +
    `<stop offset="1" stop-color="var(${son})"/>` +
    `</linearGradient></defs>`
  )
}
