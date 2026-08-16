// TEK SQLite handle (§3.5 · §3.8 · D-27 · chokepoints.json → `sqlite-handle`).
//
// Handle Ring 0'dadır, Ring 2'de DEĞİL. Gerekçe halka yasasıdır (§3.6): iş kuyruğu
// kernel'in işidir (`queue.ts`) ve kernel `packages/corpus`'u import EDEMEZ. Handle
// corpus'ta kalsaydı ya kuyruk ikinci bir bağlantı açardı — iki handle, iki WAL ayarı,
// indeksin sessizce iki gerçeğe bölünmesi — ya da halka yasası çiğnenirdi (D-61).
//
// Dosyalar doğruluktur; bu veritabanı TÜRETİLMİŞ indekstir (D-27). Silinip yeniden
// kurulabilir olması, şema değişikliğini veri kaybı değil rahatsızlık yapar.

import Database from 'better-sqlite3'
import { dirname } from 'node:path'
import { mkdirSync } from 'node:fs'

export type Db = Database.Database

export interface OpenOptions {
  /** `:memory:` testte; üretimde `derived/index/suite.db`. */
  readonly path: string
  readonly readonly?: boolean
}

/**
 * Pragmalar tek yerde. İkinci bir bağlantı bunları farklı kurarsa aynı dosya iki
 * farklı dayanıklılık garantisiyle yazılır — ve hangisinin kazandığı zamanlamaya kalır.
 */
export const openDb = (opts: OpenOptions): Db => {
  const saltOkur = opts.readonly === true

  // ⚠ **`readonly: true` gerçekten salt-okur olmalı.** Eski hâli `readonly` geçilse
  // bile dizini yaratıyor ve `journal_mode`/`synchronous` yazıyordu — ikisi de yazma
  // işlemi. `just doctor` bu yüzden salt-okur bir kurtarma diskinde
  // `SQLITE_READONLY_DIRECTORY` ile ÇÖKÜYORDU (D-233): 12. yasanın tam hedefi olan
  // senaryoda, "hiçbir şeyi değiştirmeyen" rapor aracı çalışmıyordu.
  if (opts.path !== ':memory:' && !saltOkur) mkdirSync(dirname(opts.path), { recursive: true })

  const db = new Database(opts.path, saltOkur ? { readonly: true } : {})

  if (!saltOkur) {
    // WAL: okuyucular yazarı bloklamaz. Tek kullanıcılı yerel bir sistemde bile UI
    // okurken worker yazar; rollback journal'da UI donar.
    db.pragma('journal_mode = WAL')
    // NORMAL: WAL ile birlikte güç kesintisinde son işlem kaybolabilir ama veritabanı
    // BOZULMAZ. `FULL` her commit'te fsync eder; türetilmiş bir indeks için bu bedel
    // gereksiz — kaybı `just reindex` geri getirir.
    db.pragma('synchronous = NORMAL')
  }
  db.pragma('foreign_keys = ON')
  // Yazma çakışmasında hemen hata vermek yerine 5 sn bekle: süreç-içi worker ile UI
  // aynı anda yazabiliyor ve `SQLITE_BUSY` kullanıcıya gösterilecek bir şey değil.
  db.pragma('busy_timeout = 5000')

  return db
}

/**
 * Şema sürümü `user_version` pragmasında tutulur — ayrı bir tablo değil.
 * Ayrı tablo, tablonun kendisinin göçünü gerektirir; `user_version` her zaman oradadır.
 */
export const schemaVersion = (db: Db): number => Number(db.pragma('user_version', { simple: true }))

export const setSchemaVersion = (db: Db, v: number): void => {
  db.pragma(`user_version = ${Math.trunc(v)}`)
}

/**
 * Göçler sırayla, TEK işlemde uygulanır. Yarım göç, hiç göç etmemekten kötüdür:
 * yarısı yeni yarısı eski bir şemada hangi sorgunun doğru olduğu bilinemez (§3.3).
 */
export interface Migration {
  readonly version: number
  readonly up: (db: Db) => void
}

export const migrate = (db: Db, migrations: readonly Migration[]): number => {
  const sirali = [...migrations].sort((a, b) => a.version - b.version)
  const mevcut = schemaVersion(db)

  const uygula = db.transaction((liste: readonly Migration[]) => {
    for (const m of liste) {
      m.up(db)
      setSchemaVersion(db, m.version)
    }
  })

  const bekleyen = sirali.filter((m) => m.version > mevcut)
  if (bekleyen.length > 0) uygula(bekleyen)
  return schemaVersion(db)
}
