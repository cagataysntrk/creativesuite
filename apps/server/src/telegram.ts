// Telegram onay botu — YÜZEY SINIRI (§4c, §9.4 · D-19 · FAZ-4.13).
//
// **Bot yalnız onay / red / gerekçe.** Üretim başlatmaz, karar değiştirmez, şema
// düzenlemez. Sebep §4c'de: her yüzeyin bir işi var ve Telegram'ınki "masadan uzaktayken
// kuyruğun tıkanmaması". Telefonda maliyet aralığı okunmaz, bağlam önizlenmez, donmuş
// plan incelenmez — oradan üretim başlatmak, incelenmemiş bir çalıştırmaya para
// harcamaktır.
//
// **Sınır bir konvansiyon değil, bir REDDİR:** yasak komutlar tanınır ve gerekçesiyle
// geri çevrilir. Tanınmamış bırakmak, "belki ileride ekleriz" demenin sessiz hâli olurdu.
//
// Bu dosya AĞA DOKUNMAZ: komut ayrıştırma ve yetki kararı saftır, gönderim çağıranın işi.
// Böylece yüzey sınırı gerçek bir bot token'ı olmadan da test edilebilir.

export type BotKomutu =
  /** Bekleyen onayları listele. */
  | { readonly kind: 'kuyruk' }
  | { readonly kind: 'onayla'; readonly runId: string; readonly gate: string }
  | {
      readonly kind: 'reddet'
      readonly runId: string
      readonly gate: string
      readonly gerekce: string
    }
  /** Tanınan ama YASAK komut — gerekçesiyle reddedilir. */
  | { readonly kind: 'yasak'; readonly komut: string; readonly neden: string }
  | { readonly kind: 'yardim' }
  | { readonly kind: 'bilinmeyen'; readonly girdi: string }

/**
 * Telegram'da YASAK komutlar ve neden.
 *
 * Liste TAM: tanınmayan bir komut `bilinmeyen` olur ve yardım gösterilir. Yasak olanlar
 * ayrı çünkü kullanıcı onları denemek isteyecek ve "bilinmeyen komut" cevabı yanlış
 * bilgi verir — komut var, bu yüzeyde yok.
 */
const YASAK: Readonly<Record<string, string>> = {
  uret: 'üretim bu yüzeyden başlatılmaz — maliyet aralığı ve donmuş plan telefonda incelenemez (§4c)',
  calistir: 'üretim bu yüzeyden başlatılmaz (§4c)',
  plan: 'plan incelemesi komuta merkezinde yapılır — telefonda DAG okunmaz',
  sema: "şema değişikliği corpus'a karşı kuru çalıştırma ister (§3.3)",
  butce: "bütçe tavanı bir karardır ve git'te yaşar — telefondan değiştirilmez (D-179)",
  discovery: 'keşif planı beş sütunlu bir inceleme ekranıdır (§4.4)',
  sil: 'silme YOKTUR — emeklilik silme değildir (R-12)',
}

/** `/onayla run_x onay` · `/reddet run_x onay görsel markaya uymuyor` */
export const parseKomut = (metin: string): BotKomutu => {
  const t = metin.trim()
  if (t === '') return { kind: 'bilinmeyen', girdi: metin }

  const parcalar = t.split(/\s+/)
  const ham = parcalar[0] ?? ''
  // `@botadi` eki Telegram grup mesajlarında gelir ve komutun parçası DEĞİLDİR.
  const komut = ham.replace(/^\//, '').split('@')[0]?.toLocaleLowerCase('tr') ?? ''

  if (komut === 'kuyruk' || komut === 'bekleyenler') return { kind: 'kuyruk' }
  if (komut === 'yardim' || komut === 'start') return { kind: 'yardim' }

  const neden = YASAK[komut]
  if (neden !== undefined) return { kind: 'yasak', komut, neden }

  if (komut === 'onayla') {
    const runId = parcalar[1]
    const gate = parcalar[2]
    if (runId === undefined || gate === undefined) return { kind: 'bilinmeyen', girdi: metin }
    return { kind: 'onayla', runId, gate }
  }

  if (komut === 'reddet') {
    const runId = parcalar[1]
    const gate = parcalar[2]
    const gerekce = parcalar.slice(3).join(' ').trim()
    if (runId === undefined || gate === undefined) return { kind: 'bilinmeyen', girdi: metin }
    // Gerekçesiz red BURADA da reddedilir: aynı kural iki yüzeyde farklı olamaz.
    // Boş gerekçeyi `reddet` olarak kabul edip sonra sunucuda düşürmek, kullanıcıya
    // "gönderildi" hissi verip hiçbir şey yapmamak olurdu.
    if (gerekce === '') {
      return {
        kind: 'yasak',
        komut: 'reddet',
        neden: 'red GEREKÇE ister — `/reddet <run_id> <kapı> <gerekçe>` (D-173)',
      }
    }
    return { kind: 'reddet', runId, gate, gerekce }
  }

  return { kind: 'bilinmeyen', girdi: metin }
}

/** Inline klavye `callback_data`: `onay|<run_id>|<gate>`. 64 bayt sınırı Telegram'ın. */
export const callbackData = (eylem: 'onay' | 'red', runId: string, gate: string): string =>
  `${eylem}|${runId}|${gate}`

export const parseCallback = (
  data: string
): { readonly eylem: 'onay' | 'red'; readonly runId: string; readonly gate: string } | null => {
  const [eylem, runId, gate] = data.split('|')
  if ((eylem !== 'onay' && eylem !== 'red') || runId === undefined || gate === undefined)
    return null
  if (runId === '' || gate === '') return null
  return { eylem, runId, gate }
}

export const YARDIM = [
  'Bu bot **yalnız onay kuyruğu** içindir (§4c).',
  '',
  '  /kuyruk                       bekleyen onaylar',
  '  /onayla <run_id> <kapı>       onayla',
  '  /reddet <run_id> <kapı> <gerekçe>   reddet (gerekçe ZORUNLU)',
  '',
  'Üretim başlatmak, plan incelemek, şema ya da bütçe değiştirmek komuta merkezinde',
  'yapılır — telefonda maliyet aralığı okunmaz ve incelenmemiş bir çalıştırma para harcar.',
].join('\n')

/**
 * Token gerçek mi. **Yer tutucu bir token ile bot AÇILMAZ.**
 *
 * `doldurulacak` gibi bir değerle Telegram'a bağlanmayı denemek, her açılışta 401 alıp
 * yeniden denemek demek; log gürültüsü "bot çalışıyor" sanılmasına yol açar. Gerçek
 * token biçimi `<rakamlar>:<harf-rakam>` ve en az ~40 karakter.
 */
export const tokenGercekMi = (token: string | undefined): boolean =>
  token !== undefined && token.length >= 40 && /^\d+:[A-Za-z0-9_-]+$/.test(token)
