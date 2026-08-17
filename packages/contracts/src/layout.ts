// Düzen adları — RING −1 (§3.1 · FAZ-10.4b).
//
// **Neden burada, `render`da değil:** düzen artık `SlaytKimligi`de taşınıyor (belge
// modeli, ring 0) ama üretimi ve tüketimi `render`da (ring 2). Kernel ring 2'den import
// EDEMEZ — halka yönü tek yönlü. Paylaşılan bir kelime dağarcığının yeri contracts'tır;
// tipi `string` yapmak halka kuralını "çözmek" değil, delmek olurdu.
//
// **Düzen bir ROLDÜR, çizim değil** (D-254). Modelde `quote` yazması, modelin nasıl
// çizileceğini değil NE OLDUĞUNU söylüyor; tırnak işaretini `sablon.ts` çiziyor. Aradaki
// fark, belge modeline işaretleme sokmakla sokmamak arasındaki fark.

/**
 * Dört başlangıç düzeni. Adlar İngilizce (D-37: tanımlayıcı).
 *
 * - `statement`   tek güçlü cümle — hook slaytı
 * - `claim-proof` iddia + altında kanıt satırı
 * - `list`        2-6 maddelik sütun
 * - `quote`       alıntı + kaynak atfı
 *
 * **KAPALI liste.** Beşinci düzen bir KARAR ister (`D-nn`), bir import değil.
 */
export const LAYOUTS = ['statement', 'claim-proof', 'list', 'quote'] as const
export type LayoutName = (typeof LAYOUTS)[number]
