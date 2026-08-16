// TEK rastgelelik kaynağı (§3.8 · R-06 · chokepoints.json → `rng`).
//
// Seed'siz rastgelelik = aynı girdiyle farklı çıktı. İdempotent atlama (§4.5) çöker ve
// her keşif çalıştırması 900 op üretir; 900 opluk bir plan incelenmez, kabul edilir ve
// yönetişim tiyatroya döner.

import { randomBytes as nodeRandomBytes } from 'node:crypto'

export interface Rng {
  /** [0,1) aralığında. */
  readonly next: () => number
  readonly bytes: (n: number) => Uint8Array
}

export const systemRng: Rng = {
  next: () => nodeRandomBytes(4).readUInt32BE(0) / 0x1_0000_0000,
  bytes: (n) => new Uint8Array(nodeRandomBytes(n)),
}

/**
 * **CSRF token'ı — kriptografik rastgelelik, seed'siz** (§14 · FAZ-7.5).
 *
 * R-06 rastgeleliğin seed'li olmasını istiyor ve haklı: seed'siz bir çalıştırma
 * replay edilemez. Ama OAuth `state` parametresi bir replay girdisi DEĞİL, bir
 * **saldırı yüzeyi**: tahmin edilebilirse saldırgan kendi yetkilendirme cevabını
 * kurbanın oturumuna bağlar (CSRF).
 *
 * Ayrım net ve kurala aykırı değil: `seededRng` **kararları** üretir (hangi kayıt,
 * hangi sıra, hangi seed) ve replay onları tekrar eder. `csrfToken` bir karar
 * üretmez — tek kullanımlık bir sırdır, hiçbir manifeste girmez ve **hiçbir replay
 * onu tekrar etmez**. Tekrar etseydi zaten güvenliği ortadan kalkardı.
 *
 * Burada, `rng.ts`te duruyor çünkü `rng` darboğazı `crypto.randomBytes`ı bu dosyaya
 * kilitliyor — ikinci bir rastgelelik kaynağı, hangisinin seed'li olduğunu belirsiz
 * bırakırdı.
 */
export const csrfToken = (byteCount = 32): string =>
  nodeRandomBytes(byteCount).toString('base64url')

/**
 * İki sırrı **sabit sürede** karşılaştırır.
 *
 * Düz `===` ilk farklı baytta döner ve karşılaştırma süresi sızıntı olur: saldırgan
 * doğru ön eki karakter karakter arayabilir. Uzunluk farkı da erken dönmüyor —
 * yalnız sonuç `false` oluyor.
 */
export const secretEquals = (a: string, b: string): boolean => {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  // Uzunluklar farklıysa da TAM tarama yapılıyor: erken dönüş uzunluğu sızdırırdı.
  const n = Math.max(ab.length, bb.length)
  let fark = ab.length ^ bb.length
  for (let i = 0; i < n; i++) {
    fark |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
  }
  return fark === 0
}

/**
 * Seed'li, deterministik RNG (xorshift128+ türevi). Testte ve idempotency anahtarında
 * kullanılır: aynı seed → aynı dizi, makineden ve tarihten bağımsız.
 */
export const seededRng = (seed: number): Rng => {
  let s0 = seed >>> 0 || 1
  let s1 = (seed * 2654435761) >>> 0 || 2

  const step = (): number => {
    let x = s0
    const y = s1
    s0 = y
    x ^= x << 23
    x >>>= 0
    x ^= x >>> 17
    x ^= y ^ (y >>> 26)
    s1 = x >>> 0
    return (s0 + s1) >>> 0
  }

  return {
    next: () => step() / 0x1_0000_0000,
    bytes: (n) => {
      const out = new Uint8Array(n)
      for (let i = 0; i < n; i++) out[i] = step() & 0xff
      return out
    },
  }
}
