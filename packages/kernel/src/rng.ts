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
