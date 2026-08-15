// TEK kimlik üreteci (§3.9 · chokepoints.json → `id-uretici`).
//
// **uuidv7, ön ekli.** Neden v4 değil: v7 zaman sıralıdır. Bir SQLite birincil anahtarı
// olarak v4 rastgele yazma yapar (B-tree her seferinde farklı sayfaya düşer); v7 sonuna
// ekler. Ayrıca `derived/runs/` dizini id'ye göre sıralandığında kronolojik çıkar —
// bir ay sonra "en son ne koştu" sorusu `ls | tail` ile cevaplanır (ilke 12).
//
// Ön ek gözle ayırt etmek için değil: log'da, manifest'te veya hata mesajında geçen bir
// id'nin NE OLDUĞU bağlamsız okunabilmeli. `run_0192…` ile `job_0192…` karışmaz.
//
// Kütüphane YOK (R-75): uuidv7 48-bit ms + 4-bit sürüm + 74-bit rastgelelik. Kırk satır.

import type { IdKind } from '@suite/contracts'
import { ID_PREFIXES } from '@suite/contracts'
import { systemRng, type Rng } from './rng.js'
import { systemClock, type Clock } from './time/clock.js'

const hex = (n: number, len: number): string => n.toString(16).padStart(len, '0')

/** Ham uuidv7 — ön eksiz. Zaman sıralı, RFC 9562 düzenine uygun. */
export const uuidv7 = (clock: Clock = systemClock, rng: Rng = systemRng): string => {
  const ms = clock.now()
  const b = rng.bytes(10)

  // 48-bit zaman damgası (big-endian), sonra 74-bit rastgelelik.
  const timeHigh = Math.floor(ms / 0x1_0000_0000) // üst 16 bit
  const timeLow = ms >>> 0 // alt 32 bit

  // sürüm 7 (üst dörtlü) ve varyant 10xx — RFC'nin şart koştuğu iki alan.
  const verAndRandA = ((0x7 << 12) | (((b[0] as number) << 4) | ((b[1] as number) >> 4))) & 0xffff
  const variantAndRandB =
    ((0b10 << 14) | (((b[2] as number) << 6) | ((b[3] as number) >> 2))) & 0xffff

  const randC = Array.from(b.slice(4, 10))
    .map((x) => hex(x, 2))
    .join('')

  return [
    hex(timeHigh, 4) + hex(timeLow >>> 16, 4),
    hex(timeLow & 0xffff, 4),
    hex(verAndRandA, 4),
    hex(variantAndRandB, 4),
    randC,
  ].join('-')
}

/** Ön ekli kimlik. `newId('RunId')` → `run_0192f3a1-…` */
export const newId = <K extends IdKind>(
  kind: K,
  clock: Clock = systemClock,
  rng: Rng = systemRng
): string => `${ID_PREFIXES[kind]}${uuidv7(clock, rng)}`

/** Ön eki doğrular. Yanlış tipte bir id'yi kabul etmek, yanlış tabloyu sorgulamaktır. */
export const hasKind = (id: string, kind: IdKind): boolean => id.startsWith(ID_PREFIXES[kind])

/** Ön eki sıyırır; ön ek uymuyorsa `null` — sessiz kabul yok. */
export const stripPrefix = (id: string, kind: IdKind): string | null =>
  hasKind(id, kind) ? id.slice(ID_PREFIXES[kind].length) : null
