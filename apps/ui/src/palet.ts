// ⌘K komut paleti — BİRİNCİL navigasyon, kısayol değil (§12.5 · FAZ-4.2b).
//
// Menü ağacı YOK. Sebep pratik: pipeline'lar registry'den gelir ve kullanıcı çalışma
// anında yenisini ekler (D-11). Elle bakımlanan bir menü, ilk yeni pipeline'da bayatlar
// ve bayat bir menü "bu sistem yeni şeyleri göstermiyor" demektir.
//
// Bu dosya SAF: eşleştirme ve sıralama mantığı, hiç DOM yok. Bileşen ince kalsın diye
// değil — **test edilebilsin** diye. Bir paletin tek işi doğru şeyi bulmaktır ve o iş
// tarayıcı açmadan sınanabilir.

import { foldForSearch as katla } from '@suite/contracts/text'

export interface Komut {
  readonly id: string
  /** Türkçe etiket. Genişlik ölçüsü buna göre (R-23) — İngilizcesine göre DEĞİL. */
  readonly etiket: string
  readonly grup: string
  /** Ek arama anahtarları: kısaltmalar, İngilizce karşılıklar, eşanlamlılar. */
  readonly anahtarlar?: readonly string[]
}

export interface Eslesme {
  readonly komut: Komut
  readonly skor: number
}

// Türkçe katlama `@suite/contracts/text`ten gelir — **kopyası yazılmaz** (R-21).
//
// İlk sürüm kendi `.replace` zincirini taşıyordu ve `turkish-case` kapısı onu yakaladı.
// Kapı haklıydı ama asıl mesele lint değil: `foldForSearch` FTS5'in
// `unicode61 remove_diacritics 2` ayarıyla AYNI sonucu vermek zorunda (§5.6). İkinci bir
// katlama, paletin bulduğu ile indeksin bulduğunun ayrışması demekti — kullanıcı
// "ölçüm" yazar, palet bir sonuç gösterir, aynı sorgu corpus aramasında başka bir şey
// döndürür ve arada hangisinin doğru olduğu hiç anlaşılmaz.
//
// Ring -1'de duruyor (D-165): tarayıcı halkası kernel'i import EDEMEZ ve etmemeli.

/**
 * Alt dizi eşleşmesi — harflerin SIRASI korunur, bitişik olması gerekmez.
 *
 * `igp` → `instagram-post`. Skor: baştan eşleşme ve bitişiklik ödüllendirilir, çünkü
 * kullanıcı genelde adın başını yazar ve "en iyi tahmin" ilk sırada olmazsa palet
 * bir listeye, liste de bir menüye dönüşür.
 */
const altDiziSkoru = (aday: string, sorgu: string): number | null => {
  if (sorgu === '') return 1
  let i = 0
  let skor = 0
  let oncekiIndeks = -1
  for (const h of sorgu) {
    const bulunan = aday.indexOf(h, i)
    if (bulunan === -1) return null
    if (bulunan === 0) skor += 10
    if (bulunan === oncekiIndeks + 1) skor += 5
    skor += Math.max(0, 5 - (bulunan - i))
    oncekiIndeks = bulunan
    i = bulunan + 1
  }
  return skor
}

/**
 * Palet eşleşmeleri, skora göre sıralı.
 *
 * **Eşit skorda etiket sırası** — deterministik olmayan bir palet, aynı sorguya iki kez
 * farklı ilk sonuç verir ve kas hafızası kurulamaz (kullanıcı `⌘K` `ig` `Enter` yazmayı
 * öğrenemez).
 */
export const eslestir = (komutlar: readonly Komut[], sorgu: string): readonly Eslesme[] => {
  const s = katla(sorgu.trim())
  const cikti: Eslesme[] = []
  for (const k of komutlar) {
    const adaylar = [k.etiket, k.id, ...(k.anahtarlar ?? [])]
    let enIyi: number | null = null
    for (const a of adaylar) {
      const skor = altDiziSkoru(katla(a), s)
      if (skor !== null && (enIyi === null || skor > enIyi)) enIyi = skor
    }
    if (enIyi !== null) cikti.push({ komut: k, skor: enIyi })
  }
  return cikti.sort((a, b) =>
    a.skor === b.skor ? a.komut.etiket.localeCompare(b.komut.etiket, 'tr') : b.skor - a.skor
  )
}

/**
 * Seçili indeksi kaydırır ve **sarmalar**.
 *
 * Sarmalama bir süs değil: listenin sonunda takılan bir palet, kullanıcıyı yön
 * değiştirmeye zorlar ve `j`/`k` ile tek elle çalışma vaadi (§12.5) orada biter.
 */
export const kaydir = (mevcut: number, delta: number, uzunluk: number): number => {
  if (uzunluk === 0) return 0
  return (((mevcut + delta) % uzunluk) + uzunluk) % uzunluk
}
