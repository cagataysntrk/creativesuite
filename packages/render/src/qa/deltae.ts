// CIEDE2000 renk farkı (§11.1 · D-109).
//
// **Neden bağımlılık değil.** `culori` bu işi yapıyor ama getirdiği yüzey ihtiyacımızın
// çok üstünde: onlarca renk uzayı, ayrıştırıcı, interpolasyon. Bizim ihtiyacımız iki
// fonksiyon — sRGB→Lab ve ΔE2000 — ve ikisi de yayınlanmış, sabit, otuz yıldır
// değişmeyen formüller. "40 satır yazmak bir bağımlılıktan iyidir" (CLAUDE.md).
//
// **Doğruluk nasıl kanıtlanıyor:** Sharma, Wu & Dalal (2005) makalesinin referans test
// çiftleriyle. Bu, kendi matematiğimize kendi testimizi yazmanın tuzağından kaçınmanın
// tek yolu — bağımsız bir kaynağın beklediği sayıyı üretmezsek implementasyon yanlıştır.
//
// **Neden ΔE2000, ΔE76 değil:** ΔE76 Öklid mesafesidir ve mavi bölgede insan algısıyla
// ciddi biçimde ayrışır. Marka paleti mavi ağırlıklıysa (Upcytech'in `#0091FF`'i öyle)
// ΔE76 iki gözle ayırt edilebilir maviyi "aynı" sayar ve QA kapısı boş geçer.

export interface Lab {
  readonly L: number
  readonly a: number
  readonly b: number
}

export interface Rgb {
  readonly r: number
  readonly g: number
  readonly b: number
}

/** `#RRGGBB` → 0-255. Geçersiz girdide `null` — sessizce siyaha düşmek yasak. */
export const parseHex = (hex: string): Rgb | null => {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (m === null) return null
  const n = Number.parseInt(m[1] as string, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** sRGB gama sökümü (IEC 61966-2-1). */
const dogrusallastir = (c: number): number => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/** D65 beyaz noktası — ekran içeriği için doğru referans (D50 baskı içindir). */
const BEYAZ = { X: 95.047, Y: 100.0, Z: 108.883 }

const f = (t: number): number => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29)

export const rgbToLab = ({ r, g, b }: Rgb): Lab => {
  const R = dogrusallastir(r)
  const G = dogrusallastir(g)
  const B = dogrusallastir(b)

  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) * 100
  const Y = (0.2126729 * R + 0.7151522 * G + 0.072175 * B) * 100
  const Z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) * 100

  const fx = f(X / BEYAZ.X)
  const fy = f(Y / BEYAZ.Y)
  const fz = f(Z / BEYAZ.Z)

  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

/**
 * CIEDE2000. Ağırlıklar `kL = kC = kH = 1` (referans koşullar).
 *
 * Formül Sharma, Wu & Dalal (2005) düzeltilmiş hâli. İki incelik, implementasyonların
 * en sık yanıldığı yerler ve ikisi de test edilmiş durumda:
 *   1. `h'` farkı ±180°'de sarmalanır — sarmalanmazsa kırmızının iki yanındaki iki renk
 *      arasındaki fark 350° çıkar ve ΔE patlar
 *   2. `C' = 0` olduğunda tonlar TANIMSIZDIR ve ortalama ton, sıfır olmayan tonun
 *      kendisidir — sıfır kabul etmek nötr griyi her renkten uzak gösterir
 */
export const deltaE2000 = (l1: Lab, l2: Lab): number => {
  const kL = 1
  const kC = 1
  const kH = 1

  const C1 = Math.hypot(l1.a, l1.b)
  const C2 = Math.hypot(l2.a, l2.b)
  const Cort = (C1 + C2) / 2

  const C7 = Math.pow(Cort, 7)
  const G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Math.pow(25, 7))))

  const a1p = (1 + G) * l1.a
  const a2p = (1 + G) * l2.a

  const C1p = Math.hypot(a1p, l1.b)
  const C2p = Math.hypot(a2p, l2.b)

  // Ton açıları. `atan2(0, 0)` 0 döner ama tanım gereği ton TANIMSIZDIR; aşağıdaki
  // ortalama hesabı bunu ayrıca ele alıyor.
  const h1p = a1p === 0 && l1.b === 0 ? 0 : (Math.atan2(l1.b, a1p) * DEG + 360) % 360
  const h2p = a2p === 0 && l2.b === 0 ? 0 : (Math.atan2(l2.b, a2p) * DEG + 360) % 360

  const dLp = l2.L - l1.L
  const dCp = C2p - C1p

  let dhp: number
  if (C1p * C2p === 0) dhp = 0
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p
  else if (h2p - h1p > 180) dhp = h2p - h1p - 360
  else dhp = h2p - h1p + 360

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * RAD)

  const Lortp = (l1.L + l2.L) / 2
  const Cortp = (C1p + C2p) / 2

  let hortp: number
  if (C1p * C2p === 0) hortp = h1p + h2p
  else if (Math.abs(h1p - h2p) <= 180) hortp = (h1p + h2p) / 2
  else if (h1p + h2p < 360) hortp = (h1p + h2p + 360) / 2
  else hortp = (h1p + h2p - 360) / 2

  const T =
    1 -
    0.17 * Math.cos((hortp - 30) * RAD) +
    0.24 * Math.cos(2 * hortp * RAD) +
    0.32 * Math.cos((3 * hortp + 6) * RAD) -
    0.2 * Math.cos((4 * hortp - 63) * RAD)

  const dTheta = 30 * Math.exp(-Math.pow((hortp - 275) / 25, 2))
  const Cp7 = Math.pow(Cortp, 7)
  const RC = 2 * Math.sqrt(Cp7 / (Cp7 + Math.pow(25, 7)))
  const RT = -RC * Math.sin(2 * dTheta * RAD)

  const kare = Math.pow(Lortp - 50, 2)
  const SL = 1 + (0.015 * kare) / Math.sqrt(20 + kare)
  const SC = 1 + 0.045 * Cortp
  const SH = 1 + 0.015 * Cortp * T

  const tL = dLp / (kL * SL)
  const tC = dCp / (kC * SC)
  const tH = dHp / (kH * SH)

  return Math.sqrt(tL * tL + tC * tC + tH * tH + RT * tC * tH)
}

/** Kolaylık: iki hex arasındaki ΔE2000. Geçersiz hex'te `null`. */
export const deltaEHex = (a: string, b: string): number | null => {
  const ra = parseHex(a)
  const rb = parseHex(b)
  if (ra === null || rb === null) return null
  return deltaE2000(rgbToLab(ra), rgbToLab(rb))
}
