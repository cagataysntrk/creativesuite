// Sıfırdan indeks kurma (§3.5 · D-27).
//
// `derived/index/` SİLİNEBİLİR. Bu dosya onu corpus'tan yeniden kurar; kayıp veri
// kaybı değil, birkaç saniyedir. `derived/runs/`a DOKUNMAZ — o türetilemez (D-38).
//
// Bu dosya HİÇBİR ŞEY YAZMAZ: yalnız okur ve indekse besler. Corpus'a yazan tek yer
// `write.ts`tir (§3.8) ve kapı bunu `packages/corpus/src/**` kapsamında zorlar.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { migrate, openDb, type Db } from '@suite/kernel'
import { parseFrontmatter } from './frontmatter.js'
import { clearIndex, INDEX_MIGRATIONS, upsertRecords, type IndexRow } from './search.js'

export interface ReindexReport {
  readonly indexed: number
  /** Atlanan dosyalar ve sebepleri. Sessiz atlama YOK: atlanan kayıt aranamaz. */
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

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const nul = (v: unknown): string | null => (typeof v === 'string' ? v : null)

export const reindex = (db: Db, corpusRoot: string): ReindexReport => {
  migrate(db, INDEX_MIGRATIONS)
  clearIndex(db)

  const rows: IndexRow[] = []
  const skipped: { path: string; reason: string }[] = []

  for (const file of walk(corpusRoot)) {
    const parsed = parseFrontmatter(readFileSync(file, 'utf8'))
    if (!parsed.ok) {
      skipped.push({ path: relative(corpusRoot, file), reason: parsed.error.kind })
      continue
    }
    const fm = parsed.value.frontmatter
    if (fm === null || typeof fm['id'] !== 'string') {
      skipped.push({ path: relative(corpusRoot, file), reason: 'id_yok' })
      continue
    }
    rows.push({
      id: fm['id'],
      brand_id: str(fm['brand_id']),
      type: str(fm['type']),
      status: str(fm['status'], 'draft'),
      era_id: str(fm['era_id'], '*'),
      locale: str(fm['locale'], 'tr-TR'),
      path: relative(corpusRoot, file),
      title: str(fm['title'], str(fm['id'])),
      body: parsed.value.body,
      valid_at: nul(fm['valid_at']),
      invalid_at: nul(fm['invalid_at']),
      expired_at: nul(fm['expired_at']),
    })
  }

  upsertRecords(db, rows)
  return { indexed: rows.length, skipped }
}

/** `just reindex` girişi: veritabanını açar, kurar, raporlar. */
export const reindexToPath = (dbPath: string, corpusRoot: string): ReindexReport => {
  const db = openDb({ path: dbPath })
  try {
    return reindex(db, corpusRoot)
  } finally {
    db.close()
  }
}
