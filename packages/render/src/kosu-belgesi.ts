// Bir koşunun GEÇERLİ panorama belgesi — hangi dosya, tek yerde (§7.1 · D-301, D-302).
//
// ⚠ ⚠ **EDİTÖR DÜZENLENMİŞ BELGEYİ DEĞİL ASLINI AÇIYORDU.** Depo sahibi: *"editörde
// düzenleyince elle düzenlenmiş versiyon koşu sayfasına geliyor ama tekrar koşuyu
// editörde aç deyince eskisini açıyor."* Sebep tek satırdı: editörün koşu tarayıcısı
// her zaman `panorama.json` arıyordu. Düzenleme `panorama-elle.json`a iniyor; yani
// yapılan iş diskte DURUYOR ama okuyan taraf onu hiç sormuyordu. Editör yeniden
// başladığı anda (her `just dev`de) düzenleme kaybolmuş görünüyordu.
//
// ⚠ ⚠ **SEÇİM KURALI ÜÇÜNCÜ KEZ KOPYALANACAKTI.** Sunucunun dışa aktarma yolu
// "önce `-elle`, sonra asıl" kuralını kendi içinde taşıyordu; editör hiç taşımıyordu.
// Aynı kuralın iki kopyası, bir gün birinin düzeltilip ötekinin unutulması demektir —
// bu depoda `gorselleriGom` ile tam olarak böyle oldu. Tek yer burası.
//
// ⚠ **Asıl belge SİLİNMİYOR** (Yasa 10 · Yasa 11): `panorama.json` yerinde kalıyor ve
// fark karşılaştırılabilir oluyor. Seçim bir SIRALAMA, bir silme değil.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gorselleriGom } from './gorsel-gom.js'

/** Elle düzenlenmiş belge — hattın ürettiğinin YANINA yazılır, üstüne değil. */
export const ELLE_BELGE = 'panorama-elle.json'
export const ASIL_BELGE = 'panorama.json'

/**
 * Koşu dizinindeki geçerli belgenin yolu. Yoksa `null`.
 *
 * ⚠ Sıra: elle düzenlenmiş varsa O geçerlidir. İnsanın en son dokunduğu şey, hattın
 * bir önceki geçişte yazdığından daha yenidir — ve insanın kararı hattın çıktısını
 * ezer (Yasa 2'nin okuma tarafı).
 */
export const kosuBelgeYolu = (dizin: string, sadeceAsil = false): string | null => {
  const elle = join(dizin, ELLE_BELGE)
  if (!sadeceAsil && existsSync(elle)) return elle
  const asil = join(dizin, ASIL_BELGE)
  return existsSync(asil) ? asil : null
}

export interface KosuBelgesi<T> {
  readonly yol: string
  /** Görselleri GÖMÜLÜ belge — render ve dışa aktarma doğrudan kullanabilir. */
  readonly belge: T
  /** Elle düzenlenmiş sürüm mü — ekranda söylenebilsin diye. */
  readonly elle: boolean
}

/**
 * Belgeyi okur ve görselleri gömer (`gorselleriGom`).
 *
 * ⚠ Okuma ile gömme AYNI çağrıda: ikisini ayırmak, çağıranın birini yapıp ötekini
 * unutmasına açık kapı bırakırdı — dışa aktarmada tam olarak o oldu ve slaytlar
 * görselsiz çıktı.
 *
 * ⚠ Bozuk JSON `null` dönüyor: yarım bir belgeyi render'a vermek, hatayı iki adım
 * sonra tanınmaz bir isimle göstermek olurdu.
 */
export const kosuBelgesiniOku = <T>(dizin: string, sadeceAsil = false): KosuBelgesi<T> | null => {
  // ⚠ `sadeceAsil`: "değişiklikleri sıfırla" HATTIN ürettiğine döner. Elle düzenlenmiş
  // sürüme dönmek, sıfırlamayı hiçbir şey yapmayan bir düğmeye çevirirdi.
  const yol = kosuBelgeYolu(dizin, sadeceAsil)
  if (yol === null) return null
  try {
    const ham: unknown = JSON.parse(readFileSync(yol, 'utf8'))
    if (ham === null || typeof ham !== 'object') return null
    return {
      yol,
      belge: gorselleriGom(ham as { readonly gorseller?: readonly unknown[] }, dizin) as T,
      elle: yol.endsWith(ELLE_BELGE),
    }
  } catch {
    return null
  }
}
