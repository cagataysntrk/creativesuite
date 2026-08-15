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
