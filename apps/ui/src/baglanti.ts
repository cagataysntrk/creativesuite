// Bağlantı durumu — kalıcı bir göstergenin en tehlikeli hatası (§12.6 · FAZ-4.2b).
//
// Makine durumu şeridi ekranın alt kenarında HER ZAMAN durur. Kalıcı bir gösterge,
// sustuğunu söyleyemezse **son gördüğü değeri sonsuza kadar canlı gibi gösterir** —
// operatör üç saat önceki maliyeti okur ve doğru okuduğunu sanır. Toast'ın böyle bir
// sorunu yoktur çünkü toast zaten kaybolur; kalıcı olanın sorumluluğu daha ağırdır.
//
// **Bayat içerik SOLDURULMAZ, BİLDİRİLİR** (§12.6). Soldurma "devre dışı" okunur ve
// operatör göstergeye güvenmeyi tamamen bırakır; oysa değer hâlâ doğru olabilir, yalnız
// ESKİDİR. Ayrım metinle ve zaman damgasıyla yapılır, opaklıkla değil.

export type BaglantiDurumu =
  /** Nabız zamanında geldi — okunan değer ŞU AN. */
  | 'canli'
  /** Bir nabız kaçtı. Değer hâlâ gösterilir ama ESKİ olduğu YAZILIR. */
  | 'bayat'
  /** Sunucu sustu. Değer gösterilmez — gösterilirse yalan olur. */
  | 'kopuk'

export interface BaglantiGirdisi {
  /** Son olayın (durum ya da nabız) alındığı an, ms. Hiç olay gelmediyse `null`. */
  readonly sonOlayMs: number | null
  readonly simdiMs: number
  /** Sunucunun ilan ettiği nabız aralığı. Eşikler bunun katıdır, sabit sayı değil. */
  readonly nabizAraligiMs: number
}

/**
 * Eşikler nabız aralığının KATIDIR, sabit milisaniye değil.
 *
 * Sunucu nabzını 5 sn'den 30 sn'ye çıkardığında sabit bir eşik her nabızda "kopuk"
 * derdi. Katsayı, iki tarafın aynı sözleşmeyi paylaşması demek: 1,5 kat bir kaçan
 * nabza tolerans (ağ gecikmesi, sekme arka planda), 3 kat artık gecikme değil ölümdür.
 */
export const BAYAT_KAT = 1.5
export const KOPUK_KAT = 3

export const baglantiDurumu = (g: BaglantiGirdisi): BaglantiDurumu => {
  // Hiç olay gelmediyse "canlı" DEĞİL. Açılışta canlı varsaymak, sunucu hiç ayakta
  // değilken şeridin yeşil başlaması demektir — ve ilk izlenim en çok güvenilendir.
  if (g.sonOlayMs === null) return 'kopuk'
  const gecen = g.simdiMs - g.sonOlayMs
  if (gecen >= g.nabizAraligiMs * KOPUK_KAT) return 'kopuk'
  if (gecen >= g.nabizAraligiMs * BAYAT_KAT) return 'bayat'
  return 'canli'
}

/**
 * Durum rengi TEK BAŞINA anlam taşımaz — glyph + renk + metin, her zaman (§12.6,
 * alarm yönetimi kuralı). Renk körlüğü bir yana, tek renkli bir nokta hangi durumu
 * gösterdiğini ancak öğrenilmiş bir eşlemeyle söyler ve o eşleme öğrenilmez.
 */
export interface DurumIsareti {
  readonly glyph: string
  readonly metin: string
  readonly rolToken: string
}

export const durumIsareti = (d: BaglantiDurumu): DurumIsareti => {
  switch (d) {
    case 'canli':
      return { glyph: '●', metin: 'canlı', rolToken: 'var(--role-state-ok)' }
    case 'bayat':
      return { glyph: '◑', metin: 'bayat', rolToken: 'var(--role-state-warn)' }
    case 'kopuk':
      return { glyph: '○', metin: 'bağlantı yok', rolToken: 'var(--role-state-error)' }
  }
}

/**
 * Şeritte gösterilecek ölçüm — **kopukken DEĞER YOKTUR**.
 *
 * `null` dönmek, bileşenin "—" basmasını sağlar. Son değeri göstermek, kalıcı bir
 * göstergenin yapabileceği en kötü şeydir: doğru görünen yanlış bir sayı, hiç sayı
 * olmamasından tehlikelidir çünkü operatör ona göre karar verir.
 */
export const gosterilecekDeger = <T>(d: BaglantiDurumu, deger: T): T | null =>
  d === 'kopuk' ? null : deger

// ── biçimlendirme ───────────────────────────────────────────────────────────

/**
 * USD mikro → okunabilir dolar. **Girdi DİZE, `bigint` üzerinden** (R-41).
 *
 * `Number(mikros)` ile bölmek 2^53 üstünde sessizce yuvarlar. Bölme bigint'te yapılır,
 * yalnız gösterilecek iki ondalık hane `Number`a düşer — ve o iki hane zaten gösterim.
 */
export const usdBicimle = (mikrosDize: string): string => {
  let m: bigint
  try {
    m = BigInt(mikrosDize)
  } catch {
    return '—'
  }
  const eksi = m < 0n
  if (eksi) m = -m
  const tam = m / 1_000_000n
  const kesir = (m % 1_000_000n) / 10_000n // iki hane
  return `${eksi ? '-' : ''}$${tam}.${String(kesir).padStart(2, '0')}`
}

/** `Intl.NumberFormat('tr-TR')` — sayı biçimi Türkçe (§12.2). */
export const sayiBicimle = (n: number): string => new Intl.NumberFormat('tr-TR').format(n)
