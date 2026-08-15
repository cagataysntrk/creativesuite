// Sıfırdan indeks kurma (§3.5 · D-27).
//
// `derived/index/` SİLİNEBİLİR. Bu dosya onu corpus'tan yeniden kurar; kayıp veri
// kaybı değil, birkaç saniyedir. `derived/runs/`a DOKUNMAZ — o türetilemez (D-38).
//
// Bu dosya HİÇBİR ŞEY YAZMAZ: yalnız okur ve indekse besler. Corpus'a yazan tek yer
// `write.ts`tir (§3.8) ve kapı bunu `packages/corpus/src/**` kapsamında zorlar.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { migrate, openDb, type Db } from '@suite/kernel'
import { parseFrontmatter } from './frontmatter.js'
import { clearIndex, INDEX_MIGRATIONS, upsertRecords, type IndexRow } from './search.js'

export interface ReindexReport {
  readonly indexed: number
  /** Atlanan dosyalar ve sebepleri. Sessiz atlama YOK: atlanan kayıt aranamaz. */
  readonly skipped: readonly { readonly path: string; readonly reason: string }[]
}

/**
 * ⚠ Okuma hatası KÖK dizinde yutulmaz. İlk sürüm `catch { return out }` ile her hatayı
 * sessizce yutuyordu: `corpus/` hiç yokken `just reindex` "0 kayıt indekslendi" deyip
 * EXIT=0 dönüyordu — adımın kendi ilkesi "sessiz atlama, aranamayan kayıt demektir"
 * olduğu hâlde (D-75). Alt dizinlerde yutmak meşru (izin sorunu bir dosyayı atlar),
 * kökte değil (kök yoksa HİÇBİR şey indekslenmez ve bunu bilmek gerekir).
 */
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

export type ReindexFailure = { readonly kind: 'corpus_root_missing'; readonly path: string }

export type ReindexOutcome =
  | { readonly ok: true; readonly report: ReindexReport }
  | { readonly ok: false; readonly error: ReindexFailure }

/** Kök dizin var mı — yoksa indeksleme YAPILMAZ ve bu bir SONUÇTUR, sessizlik değil. */
export const reindexChecked = (db: Db, corpusRoot: string): ReindexOutcome => {
  if (!existsSync(corpusRoot)) {
    return { ok: false, error: { kind: 'corpus_root_missing', path: corpusRoot } }
  }
  return { ok: true, report: reindex(db, corpusRoot) }
}

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
export const reindexToPath = (dbPath: string, corpusRoot: string): ReindexOutcome => {
  const db = openDb({ path: dbPath })
  try {
    return reindexChecked(db, corpusRoot)
  } finally {
    db.close()
  }
}
