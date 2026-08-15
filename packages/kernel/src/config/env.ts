// TEK ortam değişkeni okuyucusu (§3.8 · §14 · chokepoints.json → `secret-okuyucu`).
//
// `process.env`e dokunan TEK yer burasıdır. Gerekçe iki katlı:
//
//  1. Secret'lar yalnız `sops exec-env` üzerinden gelir. İkinci bir okuyucu, log'a
//     sızabilecek ikinci bir yoldur — ve sızıntı geçmişten silinemez (§14).
//  2. Bir değişkenin OKUNDUĞU tek yer olması, "hangi ortam değişkenleri gerekiyor"
//     sorusunun grep'le cevaplanabilmesi demektir. Dağılmış `process.env` çağrıları,
//     bir ay ihmalden sonra sistemi başlatamamanın en sık sebebidir (ilke 12).
//
// ⚠ FAZ-3.4 bunun üstüne `secrets.ts`'i kurar: hangi anahtarın secret olduğunu bilen,
// değeri asla log'lamayan tipli katman. Burası ham erişim; orası politika.

/**
 * Ham okuma. `undefined` = tanımsız; boş string = tanımlı ama boş.
 * İkisi farklı şeydir ve burada ayrımı korunur.
 */
export const readEnv = (name: string): string | undefined => process.env[name]

/**
 * Bayrak okuma. Kabul edilen doğru değerler AÇIKÇA listelenir —
 * `.toLowerCase()` kullanılmaz (R-21: `'I'.toLowerCase()` → `i`, Türkçe'de `ı`).
 */
const TRUE_VALUES = new Set(['1', 'true', 'TRUE', 'True', 'yes', 'YES', 'on', 'ON'])

export const envFlag = (name: string): boolean => TRUE_VALUES.has(readEnv(name) ?? '')
