// Düzen ADLARI — kendi modülünde (§3.6 · FAZ-10.4).
//
// **Neden ayrı dosya:** `enum.ts` düzen seçimini çağırıyor (`duzenSec`), `secim.ts` de
// düzen adlarını okumak zorunda. İkisi birbirini import edince `rings` kapısı haklı
// olarak **modül döngüsü** bildirdi. Adlar en alttaki katman: hiçbir şey import etmiyor,
// ikisi de onu import ediyor. Döngü, tip-yalnız bir import ile "çalışıyor gibi"
// görünürdü — ve derleyici sussa bile bir döngü, sonraki bir değişiklikte gerçek bir
// başlatma sırası hatasına dönüşür.

/**
 * Dört başlangıç düzeni. Adlar İngilizce (D-37: tanımlayıcı), açıklamalar Türkçe.
 *
 * - `statement`   tek güçlü cümle — hook slaytı
 * - `claim-proof` iddia + altında kanıt satırı
 * - `list`        2-6 maddelik sütun
 * - `quote`       alıntı + kaynak atfı
 *
 * **KAPALI liste.** Beşinci düzen bir KARAR ister (`D-nn`), bir import değil: düzen
 * listesi açılırsa "marka şablonu" bir öneriye dönüşür.
 */
export const LAYOUTS = ['statement', 'claim-proof', 'list', 'quote'] as const
export type LayoutName = (typeof LAYOUTS)[number]
