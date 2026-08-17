// HEDEF: packages/render/src/sekil-cebri.ts
//
// Şekil cebri — bir eğrinin ZARFI, yorumda değil hesapta (FAZ-12.10 · §7.1 · R-30).
//
// **Neden var:** `guvenliMetinYuzdesi`in güvenliği tek bir cümleye dayanıyordu —
// *"eğri bir kübik Bézier: kontrol noktalarının dışbükey zarfını AŞMAZ, en içerideki
// `bantMin - genlik`."* Cümle doğru. Ama `akanEgri`'ye yarın daha içeride bir kontrol
// noktası eklenirse cümle sessizce yalan olur ve hiçbir şey bunu görmez. **Bir yorum bir
// zorlama değildir** — bu projede aynı ders kelime tavanlarında da alınmıştı (FAZ-14.1).
//
// Burada zarf, path'in KENDİSİNDEN hesaplanıyor. İki kaynak yok: eğri değişirse zarf
// değişir, sütun değişir, kapı ölçer.
//
// ⚠ **`shape-outside` YAZILMADI ve sebebi yapısal — tercih değil.** Adım planı metnin bir
// şeklin ETRAFINDA akmasını istiyordu. Chromium'da standart, bizde kullanılamıyor:
//   1. `float` bir flex ögesinde YOK SAYILIR (CSS Flexbox §3). `.icerik` bir flex sütunu.
//   2. `polygon()` koordinatları float'ın KENDİ kutusuna göre. Float'ın kutusu eğriyle
//      aynı y-aralığını kaplamazsa poligon dikey olarak EZİLİR ve eğriyi ıskalar; garanti
//      geometrik bir kurgu olmaktan çıkıp bir argümana döner.
//   3. Metin bölgesinin y-aralığı ancak `flex-start` yaslamada belirli — ve gramerdeki
//      DÖRT düzenin hiçbiri `flex-start` değil (üçü `center`, biri `flex-end`).
// Yani yazılsaydı: tüketicisi olmayan bir yetenek + zayıflamış bir garanti. Açılma şartı
// bir CSS numarası değil, dikey yerleşimin yeniden tasarlanması — o bir adım.
//
// ⚠ Boole dağarcığının kalanı (birleşim/fark/kesişim, `stroke-dasharray` ailesi) de
// AYNI sebeple yok: bugün çağıranı olmayan her üreteç, ikinci bir doğruluk kaynağıdır.

/** Bir şeklin yatay zarfı — 0–100 birimlik kutuda. */
export interface Zarf {
  readonly min: number
  readonly max: number
}

/**
 * Bir SVG path'inin yatay zarfı — kontrol noktalarından.
 *
 * ⚠ **Kübik Bézier dışbükey zarfını AŞMAZ.** Yani kontrol noktalarının min/max'ı eğrinin
 * gerçek min/max'ından geniş olabilir ama asla dar olamaz: bu yönde yanılmak GÜVENLİ.
 * Eğriyi örnekleyip gerçek uçları bulmak daha dar bir zarf verirdi ve daha dar zarf =
 * metin eğriye daha yakın. Kazanç birkaç piksel, risk okunabilirlik — takas kabul edilmez.
 *
 * ⚠ Yalnız `M` ve `C` komutlarını okuyor, çünkü gramer yalnız onları üretiyor. Bilinmeyen
 * bir komut gelirse sessizce yok saymak yerine sayı çiftlerini olduğu gibi topluyor:
 * fazladan nokta zarfı GENİŞLETİR, yani yine güvenli yönde yanılıyor.
 */
export const egriZarfi = (d: string): Zarf => {
  const sayilar = d.match(/-?\d+(?:\.\d+)?/g) ?? []
  // Koordinatlar (x, y) çiftleri hâlinde: çift indeksler x.
  const xler = sayilar.filter((_, i) => i % 2 === 0).map(Number)
  if (xler.length === 0) return { min: 0, max: 100 }
  return { min: Math.min(...xler), max: Math.max(...xler) }
}
