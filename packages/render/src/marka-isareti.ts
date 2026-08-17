// HEDEF: packages/render/src/marka-isareti.ts
//
// Marka işareti — şablonun KENDİ eğrisinin minyatürü (FAZ-12.6 · §4.3).
//
// **Neden çizim değil, geometri:** `brand/` altında hiçbir logo dosyası yok ve eklemek
// gerçek bir karardır (ağdan indirme, lisans, §16 "klonla gelir" sınavı). Ama markanın
// zaten bir imzası var: **akan eğri.** İşaret onun minyatürü — yeni varlık yok, yeni
// bağımlılık yok, ve işaret tasarım sisteminin kendisini taşıyor.
//
// ⚠ **BOŞLUK KURALI İŞARETİN KENDİ ÖLÇÜSÜNDEN.** Klasik kural: işaretin çevresinde en az
// bir "harf yüksekliği" kadar boşluk. Sabit piksel yazsaydık 1:1 ve 9:16'da farklı
// görünürdü — aynı hata sınıfı `maske` çapında da yaşandı (yüzde yerine piksel).
//
// ⚠ **İşaret SÜSLEME DEĞİL.** Her slayta konmaz: kapak ve kapanış. Ortadaki slaytlarda
// kulp (`@upcytech`) zaten markayı taşıyor; ikisi birden gürültü olurdu.

/** İşaretin çevresindeki dokunulmaz boşluk — işaretin KENDİ boyutunun oranı. */
export const BOSLUK_ORANI = 0.5

/** Boşluk kuralı: işaret ne kadar büyükse çevresi o kadar geniş. */
export const bosluk = (boyutPx: number): number => Math.round(boyutPx * BOSLUK_ORANI)

/**
 * En küçük okunur boy. Altında eğri bir çizgiye, kare bir lekeye dönüşür.
 *
 * ⚠ Ölçüldü değil GÖZLENDİ: 24 px altında minyatür eğrinin iki bükümü ayırt edilemiyor
 * ve işaret "eğik bir çubuk" gibi duruyor — imza olmaktan çıkıyor.
 */
export const EN_KUCUK_PX = 24

/**
 * İşaretin SVG'si: dolu kare, içinden OYULMUŞ "U".
 *
 * ⚠ ⚠ **ÜÇÜNCÜ YAKLAŞIM — ilk iki denemede ÖNCÜL yanlıştı.** Önce şablonun akan eğrisinin
 * minyatürünü çizdim ("işaret, sistemin kendisinin küçüğü olsun"). Fikir güzeldi, sonuç
 * okumadı: 30 px'lik bir karede **iki bükümlü bir eğri ayırt edilemiyor** ve işaret ince
 * bir dilim gibi duruyor. İkinci denemede renkleri ters çevirdim — hâlâ dilim.
 *
 * Öncül şuydu: *"markanın imzası eğridir, öyleyse işaret de eğri olmalı."* Yanlış olan
 * kısım "öyleyse". Eğri 1080 px'te imza; 30 px'te bir çizgi. **Bu ölçekte okuyan tek şey
 * harf formudur** ve marka fontu zaten gömülü (D-252) — yeni varlık, yeni bağımlılık yok.
 *
 * ⚠ Harf `text` olarak duruyor, `path`e çevrilmiyor: canlı metin kalınca glif ölçümü ve
 * `notdef` sayımı işareti de kapsıyor (R-20 ailesi). Font düşerse kapı görür.
 */
export const markaIsaretiSvg = (boyutPx: number, dolgu: string, zemin: string): string => {
  const b = Math.max(boyutPx, EN_KUCUK_PX)
  return (
    `<svg class="marka-isaret" width="${b}" height="${b}" viewBox="0 0 32 32" ` +
    `role="img" aria-label="Upcytech">` +
    `<rect width="32" height="32" rx="3" fill="${zemin}"/>` +
    `<text x="16" y="23" text-anchor="middle" fill="${dolgu}" ` +
    `font-family="Marka Display, Marka Metin, sans-serif" font-size="22" ` +
    `font-weight="800" font-stretch="112%">U</text>` +
    `</svg>`
  )
}

/** İşaret + kelime işareti, tek satırda. */
export const markaKilidi = (boyutPx: number, dolgu: string, zemin: string, ad: string): string =>
  `<div class="marka">${markaIsaretiSvg(boyutPx, dolgu, zemin)}` +
  `<span class="marka-ad">${ad}</span></div>`

export const markaCss = (boyutPx: number, renk: string, payPx: number): string =>
  `  .marka { position: absolute; z-index: 4; left: ${payPx}px; bottom: ${payPx}px;` +
  ` display: flex; align-items: center; gap: ${bosluk(boyutPx)}px; }` +
  `  .marka-ad { font-size: ${Math.round(boyutPx * 0.72)}px; letter-spacing: 0.04em;` +
  ` color: ${renk}; }`
