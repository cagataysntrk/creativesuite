// Corpus'u tarayıp keşif motorunun `ExistingRecord` listesini üretir (§4.4).
//
// **Bu dosya olmadan döngü KAPALI DEĞİLDİ.** `plan` "mevcut kayıtlar" listesini
// argümanla alıyordu ve gerçek yedi kayıt o yola hiç girmiyordu: "ikinci koşu 0 op"
// kanıtı yalnız elle yazılmış bir JSON ile üretilebiliyordu (2. doğrulama turu).
// Saf fonksiyon kanıtlanmıştı, sistem kanıtlanmamıştı.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parseFrontmatter } from './frontmatter.js'

export interface ScannedRecord {
  readonly id: string
  /** Repo köküne göre yol — plan op'ları bu yolu taşır. */
  readonly path: string
  /** `x_signature`; yoksa null ("imzasız", "kırık" DEĞİL). */
  readonly signature: string | null
  readonly zone: 'generated' | 'human' | 'imported'
}

export interface ScanReport {
  readonly records: readonly ScannedRecord[]
  /** Okunamayan dosyalar SESSİZCE atlanmaz: atlanan kayıt, plana hiç girmeyen kayıttır. */
  readonly skipped: readonly { readonly path: string; readonly reason: string }[]
}

const walk = (dir: string): string[] => {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const e of entries) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (p.endsWith('.md')) out.push(p)
  }
  return out
}

export const scanCorpus = (corpusRoot: string, repoRoot: string): ScanReport => {
  if (!existsSync(corpusRoot)) return { records: [], skipped: [] }

  const records: ScannedRecord[] = []
  const skipped: { path: string; reason: string }[] = []

  for (const dosya of walk(corpusRoot)) {
    const rel = relative(repoRoot, dosya)
    const p = parseFrontmatter(readFileSync(dosya, 'utf8'))
    if (!p.ok || p.value.frontmatter === null) {
      skipped.push({ path: rel, reason: 'frontmatter okunamadı' })
      continue
    }
    const fm = p.value.frontmatter
    if (typeof fm['id'] !== 'string') {
      skipped.push({ path: rel, reason: 'id yok' })
      continue
    }
    // `zone` yoksa İNSAN: eksik bilgi güvenli tarafa düşer, `write.ts` ile aynı kural.
    const zoneHam = typeof fm['zone'] === 'string' ? fm['zone'] : 'human'
    const zone = zoneHam === 'generated' || zoneHam === 'imported' ? zoneHam : 'human'
    records.push({
      id: fm['id'],
      path: rel,
      signature: typeof fm['x_signature'] === 'string' ? fm['x_signature'] : null,
      zone,
    })
  }
  return { records, skipped }
}
