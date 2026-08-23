// Platform yerleşim spec'i — ölçen ile gösteren ortak sözlüğü (§9.1 · D-176).
//
// **Tip Ring -1'de, VERİ ve mantık Ring 1'de.** Spec tablosu
// `packages/render/src/specs/placements.ts`te yaşar (QA onu doğrulamada kullanır);
// önizleme ekranı aynı yapıyı tarayıcıda çizer ve `render`ı import EDEMEZ — Playwright
// çeker. Veri ekrana API'den gelir (`/api/yerlesimler`), tip buradan.

export interface SafeArea {
  /** Üstten yüzde — platform UI chrome'unun kapladığı bant. */
  readonly topPercent: number
  readonly bottomPercent: number
  /** Her iki yandan yüzde (simetrik). */
  readonly sidePercent: number
  /**
   * Güvenli alan AYRI bir iddiadır ve AYRI doğrulanır: yerleşim ölçüsü Meta'nın boyut
   * dokümanından, güvenli alan Reels tasarım kılavuzundan gelir. Tek `verifiedAt`
   * paylaşsalardı, biri güncellenince diğeri de "doğrulanmış" görünürdü.
   */
  readonly sourceUrl: string
  readonly verifiedAt: string
}

export interface Placement {
  readonly id: string
  readonly platform: 'instagram' | 'linkedin'
  readonly width: number
  readonly height: number
  /** En-boy sapma toleransı, yüzde. Platforma göre FARKLI (§9.1). */
  readonly aspectTolerancePercent: number
  /** Bayt. Aşılırsa kalite merdiveni devreye girer. */
  readonly maxBytes: number
  /** Kaynak ve doğrulama tarihi — tarihsiz spec, ne zaman doğru olduğunu söylemez. */
  readonly sourceUrl: string
  readonly verifiedAt: string
  /**
   * Platform UI'ının kapladığı bant. `null` = bu yerleşimde chrome yok (feed görseli).
   * `null` ile `{0,0,0}` ARASINDA fark var: birincisi "chrome yok", ikincisi "ölçüldü
   * ve sıfır çıktı" — ve ikincisi hiçbir platformda doğru değil.
   */
  readonly safeArea: SafeArea | null
}

/** Kullanılabilir bant, piksel. Güvenli alanı olmayan yerleşimde tuvalin tamamı. */
export interface SafeBand {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

// ── karosel tuvali: TEK sözleşme sabiti (R-91 · D-321) ──────────────────────
//
// ⚠ ⚠ **`1350` ALTI AYRI DOSYADA SABİTTİ** — `bodies.ts`te üç kez, `strateji.ts`te bir,
// katalog örneklerinde ve testlerde. Aynı sayının altı kopyası, bir gün beşinin
// değişip birinin unutulması demektir ve o gün panorama sessizce farklı orandan
// dilimlenir: ilk slaydın oranı tüm karoseli belirlediği için (Meta API) geri kalan
// slaytlar KIRPILIR.
//
// ⚠ ⚠ **3:4 ARTIK RESMÎ** (Instagram Yardım Merkezi, 29 May 2025): oran aralığı
// 1.91:1 – 3:4, yükseklik 566–1440. 4:5 hâlâ geçerli ve **Meta reklamında ZORUNLU**
// (min oran 400×500; 3:4 kabul edilmiyor). Yani karar "hangi oran" değil — **oran bir
// PARAMETRE olmalı** ve iki değer de aynı hattan üretilebilmeli.
//
// ⚠ Genişlik neden sabit: Instagram 1080'den genişini kendi yeniden örnekleyicisiyle
// küçültüyor. Küçültmeyi biz yaparsak sonucu kontrol ederiz.

/** Karosel tuvali — genişlik SABİT 1080, yükseklik orana göre. */
export interface KaroselTuvali {
  readonly genislik: number
  readonly yukseklik: number
  /** İnsan okunur oran — defterde ve istemde bu yazıyor. */
  readonly oran: '4:5' | '3:4'
}

/**
 * **4:5 — bugünkü varsayılan.** Organik akışta geçerli VE Meta reklamında zorunlu;
 * ızgarada her yandan 34 px kırpılıyor (1080 → 1012).
 */
export const TUVAL_4_5: KaroselTuvali = { genislik: 1080, yukseklik: 1350, oran: '4:5' }

/**
 * **3:4 — organik için daha fazla alan.** +%6,7 yükseklik ve ızgarada SIFIR kırpma.
 * ⚠ Meta reklamında KULLANILAMAZ; reklam verilecek bir kreatif 4:5 üretilmeli.
 */
export const TUVAL_3_4: KaroselTuvali = { genislik: 1080, yukseklik: 1440, oran: '3:4' }

/**
 * Hattın bugün ürettiği tuval.
 *
 * ⚠ Değiştirmek TEK satır ve altı dosya birden onu izliyor — sabitin var olma sebebi bu.
 */
export const VARSAYILAN_TUVAL = TUVAL_4_5
