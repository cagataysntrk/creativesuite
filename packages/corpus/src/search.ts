// Türetilmiş arama indeksi (§3.5, §5.6 · D-27, D-38).
//
// İKİ TOKENIZER, ÇÜNKÜ TÜRKÇE'NİN STEMMER'I YOK. Ölçüldü (D-62), varsayılmadı:
//
//   veri: "ölçümlerinizi güncelledik"
//   ┌───────────────────────┬──────────────────────────────┬─────────┐
//   │ sorgu                 │ unicode61 remove_diacritics 2│ trigram │
//   ├───────────────────────┼──────────────────────────────┼─────────┤
//   │ olcumlerinizi         │ bulur                        │ —       │
//   │ olcum   (kök)         │ BULAMAZ                      │ —       │
//   │ ölçüm   (kelime içi)  │ —                            │ bulur   │
//   └───────────────────────┴──────────────────────────────┴─────────┘
//
// Aksan katlama tam kelimeyi kurtarıyor ama eklemeli yapıda kökü bulmuyor; trigram
// kökü buluyor ama tek başına gürültülü. İkisi RRF ile birleştirilir.
//
// `derived/index/` SİLİNEBİLİR (D-27): kayıp veri kaybı değil, `just reindex` mesafesi.
// `derived/runs/` ise türetilemez ve asla silinmez (D-38) — bu dosya ona DOKUNMAZ.

import { foldForSearch, type Db } from '@suite/kernel'
import type { Migration } from '@suite/kernel'

export const INDEX_MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.exec(`
        CREATE TABLE record (
          id         TEXT PRIMARY KEY,
          brand_id   TEXT NOT NULL,
          type       TEXT NOT NULL,
          status     TEXT NOT NULL,
          era_id     TEXT NOT NULL,
          locale     TEXT NOT NULL,
          path       TEXT NOT NULL,
          title      TEXT NOT NULL,
          body       TEXT NOT NULL,
          valid_at   TEXT,
          invalid_at TEXT,
          expired_at TEXT
        );
        CREATE INDEX record_marka ON record (brand_id, era_id, status);

        -- 1) Aksan-katlamalı kelime indeksi. Tam kelimeyi aksansız da bulur.
        CREATE VIRTUAL TABLE record_fts USING fts5(
          title, body,
          content = 'record', content_rowid = 'rowid',
          tokenize = "unicode61 remove_diacritics 2"
        );

        -- 2) Trigram indeksi. Kelime İÇİNDE arar — "ölçüm" ⊂ "ölçümlerinizi".
        --    Türkçe eklemeli olduğu için tek başına unicode61 yetmez (D-62).
        CREATE VIRTUAL TABLE record_tri USING fts5(
          title, body,
          content = 'record', content_rowid = 'rowid',
          tokenize = "trigram"
        );
      `)
    },
  },
]

export interface IndexRow {
  readonly id: string
  readonly brand_id: string
  readonly type: string
  readonly status: string
  readonly era_id: string
  readonly locale: string
  readonly path: string
  readonly title: string
  readonly body: string
  readonly valid_at: string | null
  readonly invalid_at: string | null
  readonly expired_at: string | null
}

/** Tüm indeksi sıfırlar. Türetilmiş veri; yeniden kurulabilir olması tasarımdır. */
export const clearIndex = (db: Db): void => {
  db.exec('DELETE FROM record_fts; DELETE FROM record_tri; DELETE FROM record;')
}

export const upsertRecords = (db: Db, rows: readonly IndexRow[]): number => {
  const ekle = db.prepare(
    `INSERT INTO record (id, brand_id, type, status, era_id, locale, path, title, body,
                         valid_at, invalid_at, expired_at)
     VALUES (@id, @brand_id, @type, @status, @era_id, @locale, @path, @title, @body,
             @valid_at, @invalid_at, @expired_at)
     ON CONFLICT(id) DO UPDATE SET
       brand_id=excluded.brand_id, type=excluded.type, status=excluded.status,
       era_id=excluded.era_id, locale=excluded.locale, path=excluded.path,
       title=excluded.title, body=excluded.body, valid_at=excluded.valid_at,
       invalid_at=excluded.invalid_at, expired_at=excluded.expired_at`
  )

  // FTS `content=` tablosu dışarıdan beslenir: satırın rowid'si ile aynı rowid'ye
  // yazılır. Elle senkron tutmak zorundayız — trigger kullanmıyoruz çünkü iki tabloyu
  // besleyen trigger'lar `reindex` sırasında sessizce iki kez tetiklenir.
  const ftsSil = db.prepare(
    `INSERT INTO record_fts(record_fts, rowid, title, body) VALUES('delete', ?, ?, ?)`
  )
  const triSil = db.prepare(
    `INSERT INTO record_tri(record_tri, rowid, title, body) VALUES('delete', ?, ?, ?)`
  )
  const ftsEkle = db.prepare(`INSERT INTO record_fts(rowid, title, body) VALUES(?, ?, ?)`)
  const triEkle = db.prepare(`INSERT INTO record_tri(rowid, title, body) VALUES(?, ?, ?)`)
  const oncekiniBul = db.prepare(`SELECT rowid, title, body FROM record WHERE id = ?`)

  const islem = db.transaction((liste: readonly IndexRow[]) => {
    for (const r of liste) {
      const onceki = oncekiniBul.get(r.id) as
        { rowid: number; title: string; body: string } | undefined
      if (onceki !== undefined) {
        ftsSil.run(onceki.rowid, onceki.title, onceki.body)
        triSil.run(onceki.rowid, onceki.title, onceki.body)
      }
      ekle.run(r)
      const rowid = (oncekiniBul.get(r.id) as { rowid: number }).rowid
      ftsEkle.run(rowid, r.title, r.body)
      triEkle.run(rowid, r.title, r.body)
    }
  })

  islem(rows)
  return rows.length
}

export interface SearchHit {
  readonly id: string
  readonly path: string
  readonly title: string
  readonly score: number
  /** Hangi indeks(ler) buldu — hata ayıklamada RRF'i şeffaf yapar. */
  readonly sources: readonly ('word' | 'trigram')[]
}

/** FTS5 sorgu dizesini zararsızlaştırır: kullanıcı metni operatör olarak yorumlanmaz. */
const quote = (q: string): string => `"${q.replace(/"/g, '""')}"`

const K = 60 // RRF sabiti. Standart değer; sıralamanın kuyruğunu bastırır.

/**
 * İki indeksi çalıştırır ve **reciprocal rank fusion** ile birleştirir.
 * Skorları toplamak yerine SIRALARI birleştiriyoruz: bm25 ile trigram skorları
 * karşılaştırılabilir ölçekte değil, sıralar ise her zaman karşılaştırılabilir.
 */
/**
 * Görünür id kümesini geçici bir tabloya koyar ve join için ad döndürür.
 *
 * **Neden geçici tablo, `IN (...)` değil:** SQLite'ın parametre sınırı ~999; corpus
 * büyüdüğünde `IN` listesi sessizce patlar ya da sorgu devasa olur. Geçici tablo
 * kayıt sayısından bağımsız çalışır ve bağlantı kapanınca kendiliğinden gider.
 */
const gorunurTablo = (db: Db, ids: ReadonlySet<string>): string => {
  db.exec('DROP TABLE IF EXISTS temp.gorunur; CREATE TEMP TABLE gorunur (id TEXT PRIMARY KEY)')
  const ekle = db.prepare('INSERT OR IGNORE INTO temp.gorunur (id) VALUES (?)')
  const islem = db.transaction((liste: readonly string[]) => {
    for (const id of liste) ekle.run(id)
  })
  islem([...ids])
  return 'temp.gorunur'
}

/**
 * @param allowedIds verilirse sonuçlar SQL SEVİYESİNDE bu kümeyle sınırlanır.
 *   Sonradan filtrelemek yetmiyordu: 100 görünmez kayıt aday havuzunu doldurup
 *   görünür kaydı SESSİZCE düşürüyordu (doğrulama agent'ı ölçtü — koddaki yorum
 *   "2000 kayıt" diyordu, gerçek eşik 20 kat düşüktü).
 */
export const search = (
  db: Db,
  query: string,
  limit = 20,
  allowedIds?: ReadonlySet<string>
): SearchHit[] => {
  // Boş küme = hiçbir kayıt görünür değil. Sorguyu hiç koşturmadan dönüyoruz:
  // boş bir geçici tabloyla join etmek aynı sonucu verir ama boşuna iş yapar.
  if (allowedIds !== undefined && allowedIds.size === 0) return []
  const kisit = allowedIds === undefined ? '' : gorunurTablo(db, allowedIds)
  const kelime = quote(foldForSearch(query))
  const tri = quote(query)

  const wordRows = db
    .prepare(
      `SELECT r.id, r.path, r.title FROM record_fts f
         JOIN record r ON r.rowid = f.rowid
         ${kisit === '' ? '' : `JOIN ${kisit} g ON g.id = r.id`}
        WHERE record_fts MATCH ? ORDER BY bm25(record_fts) LIMIT ?`
    )
    .all(kelime, limit * 2) as { id: string; path: string; title: string }[]

  const triRows = db
    .prepare(
      `SELECT r.id, r.path, r.title FROM record_tri t
         JOIN record r ON r.rowid = t.rowid
         ${kisit === '' ? '' : `JOIN ${kisit} g ON g.id = r.id`}
        WHERE record_tri MATCH ? ORDER BY bm25(record_tri) LIMIT ?`
    )
    .all(tri, limit * 2) as { id: string; path: string; title: string }[]

  // Biriktirme sırasında değişebilir (mutable) bir yapı gerekiyor; dışa açılan
  // `SearchHit` ise salt okunur. İkisini ayırmak, skorun dışarıda değiştirilebilir
  // görünmesini engeller.
  type Birikim = {
    id: string
    path: string
    title: string
    score: number
    sources: ('word' | 'trigram')[]
  }
  const acc = new Map<string, Birikim>()
  const birlestir = (
    rows: readonly { id: string; path: string; title: string }[],
    source: 'word' | 'trigram'
  ) => {
    rows.forEach((row, i) => {
      const katki = 1 / (K + i + 1)
      const mevcut = acc.get(row.id)
      if (mevcut === undefined) {
        acc.set(row.id, { ...row, score: katki, sources: [source] })
      } else {
        mevcut.score += katki
        if (!mevcut.sources.includes(source)) mevcut.sources.push(source)
      }
    })
  }

  birlestir(wordRows, 'word')
  birlestir(triRows, 'trigram')

  return [...acc.values()].sort((a, b) => b.score - a.score).slice(0, limit)
}
