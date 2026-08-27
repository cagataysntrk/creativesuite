// Yedek zinciri: kazanan düşerse SIRADAKİ aday denenir (§8.2 aşama 4).
//
// ⚠ ⚠ **BU BOŞLUK BİR İSTEK SIRASINDA ÖLÇÜLDÜ.** Depo sahibi *"fallback olarak
// cloudflare kalır"* dedi ve doğru sandığı şey plan ekranında yazıyordu:
// `route()` `fallbacks` listesini ÜRETİYOR, `plan.ts` onu *"yedek: … (skor N)"* diye
// EKRANA YAZIYOR ve **başka hiç kimse okumuyordu**. Yani sistem yedeği vaat ediyor,
// çalışma anında kullanmıyordu: kazanan sağlayıcı düştüğünde adım `failed` yazılıyor,
// görsel adımları `optional` olduğu için hat devam ediyor ve karosel GÖRSELSİZ bitiyordu.
//
// **Bir listeyi hesaplayıp yalnız göstermek, onu uygulamak değildir.** Bu depo aynı
// sınıf hatayı daha önce iki kez kaydetti (red gerekçesi yazılıp hiç enjekte
// edilmiyordu; `composeBody` beklediği şekli bulamayınca sessizce ham kayda düşüyordu).
//
// ⚠ ⚠ **HER HATA YEDEĞİ HAK ETMEZ — ve ayrım burada yapılmazsa yedek zinciri bir
// PARA YAKMA MAKİNESİNE dönüşür.** İstemimiz R-20'ye takıldıysa ikinci sağlayıcı da
// reddeder: aynı duvara üç kez çarpmanın tek etkisi gecikmedir. Bütçe tavanı dolduysa
// yedeğe geçmek tavanı DELMEK olurdu. İptal bir KARARDIR ve karara yedek aranmaz.

import type { AppError } from '@suite/contracts'

/**
 * Bu hatada sıradaki sağlayıcı denenmeli mi.
 *
 * Yedek YALNIZ sağlayıcıya ÖZGÜ arızalarda: kota (`provider_rate_limit`), kimlik
 * (`provider_auth`), bozuk yanıt (`provider_bad_response`), ağ (`io`). Bunların ortak
 * yanı şu: **başka bir sağlayıcı başarabilir.**
 *
 * Yedek YOK olan durumlar ve gerekçeleri:
 *   · `validation`   — istem/kısıt hatalı; her sağlayıcı aynı şeyi der.
 *   · `budget_*`     — tavan doldu; yedeğe geçmek tavanı delmek olur.
 *   · `cancelled`    — insan durdurdu; karara yedek aranmaz.
 *   · `config`       — adaptör yok/yanlış bağlı; yeniden denemek onu var etmez.
 *   · `internal`     — bizim hatamız; sağlayıcı değiştirmek onu gizler.
 */
export const yedegeGec = (e: AppError): boolean =>
  e.kind === 'provider_rate_limit' ||
  e.kind === 'provider_auth' ||
  e.kind === 'provider_bad_response' ||
  e.kind === 'io'

/**
 * Denenecek sağlayıcı zinciri: kazanan önce, sonra yedekler skor sırasıyla.
 *
 * ⚠ **Yinelenenler atılıyor.** Kazanan yedek listesinde de görünürse aynı sağlayıcı iki
 * kez denenirdi; ikinci deneme birinciyle aynı sonucu verir, sadece parayı ve süreyi
 * ikiye katlayarak.
 *
 * ⚠ **Zincirin uzunluğu SINIRLI (`tavan`).** Sekiz sağlayıcılı bir katalogda kotası
 * dolmuş bir yetenek, sekiz çağrılık bir gecikmeye dönüşürdü. Üç deneme, "bir sağlayıcı
 * arızalandı" ile "bu yetenek bugün çalışmıyor" arasını ayırmaya yeter.
 */
export const yedekZinciri = (
  kazanan: string,
  yedekler: readonly string[],
  tavan = 3
): readonly string[] => [...new Set([kazanan, ...yedekler])].slice(0, Math.max(1, tavan))
