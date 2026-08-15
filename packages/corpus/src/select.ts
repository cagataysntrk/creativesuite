// Retrieval yükleminin YAŞADIĞI TEK DOSYA (§5.2 · R-10, R-13 · chokepoints.json).
//
// Yüklem dört soruyu birden sorar: hangi marka · hangi dönem · hangi durum · hangi ANDA
// geçerli. Bunlar ayrı yerlerde sorulursa biri unutulur ve emekliye ayrılmış 2024 geri
// dönüşüm konumlandırması 2026 imalat deck'ine sızar — sistemin en pahalı sessiz hatası.
//
// **`brand_id` İLK koşuldur** (R-10). Sıra rastgele değil: marka ekseni en geniş elemedir
// ve `record_marka` indeksi (brand_id, era_id, status) tam bu sırayla kurulu.
//
// **`SystemRecord` üzerinde çalışır, `attributes` üzerinde DEĞİL** (R-13). Yüklem
// `attributes` okusaydı R-01'i kendi içinde çiğnerdi — kernel'e kapalı olan alanı,
// kernel'in en sıcak yolu okuyor olurdu.

import type { Db } from '@suite/kernel'
import { search, type SearchHit } from './search.js'

/** Retrieval'a görünen durumlar. `draft` YOK: agent önerisi onaylanana kadar görünmez (R-14). */
export const VISIBLE_STATUSES = ['active', 'pinned'] as const

/**
 * Yüklemin kendisi. **Tek dize, tek yer.**
 *
 * Bi-temporal pencere `:as_of` ile açılır: geçmişe dönük denetim bir PARAMETREDİR,
 * ayrı bir kod yolu değil. "Mart ayında bu deck'i üretirken sistem neyi biliyordu"
 * sorusu ancak böyle cevaplanabilir.
 */
const YUKLEM = `
  WHERE brand_id = :brand
    AND (era_id = :era OR era_id = '*')
    AND status IN ('active','pinned')
    AND expired_at IS NULL
    AND (invalid_at IS NULL OR invalid_at > :as_of)
    AND (valid_at   IS NULL OR valid_at  <= :as_of)`

export interface SelectQuery {
  readonly brandId: string
  readonly eraId: string
  /** ISO 8601. Çağıran verir; yüklem saat OKUMAZ (R-06). */
  readonly asOf: string
  /** Tek varlık tipiyle daralt. Boşsa hepsi. */
  readonly type?: string
  readonly limit?: number
}

export interface SelectedRecord {
  readonly id: string
  readonly brand_id: string
  readonly type: string
  readonly status: string
  readonly era_id: string
  readonly locale: string
  readonly path: string
  readonly title: string
  readonly body: string
}

const SUTUNLAR = 'id, brand_id, type, status, era_id, locale, path, title, body'

export const selectRecords = (db: Db, q: SelectQuery): readonly SelectedRecord[] => {
  const tipKosulu = q.type === undefined ? '' : ' AND type = :type'
  const stmt = db.prepare(
    `SELECT ${SUTUNLAR} FROM record${YUKLEM}${tipKosulu} ORDER BY id LIMIT :limit`
  )
  return stmt.all({
    brand: q.brandId,
    era: q.eraId,
    as_of: q.asOf,
    limit: q.limit ?? 200,
    ...(q.type === undefined ? {} : { type: q.type }),
  }) as SelectedRecord[]
}

/**
 * Yüklemden GEÇEN kayıtların id kümesi.
 *
 * Arama (`search.ts`) FTS5 + trigram + RRF ile sıralama yapar ama **durum, dönem ve
 * geçerlilik bilmez** — bilseydi yüklem iki yerde yaşardı. Bunun yerine arama sonucu
 * bu kümeyle KESİŞTİRİLİR: sıralama orada, yetki burada kalır.
 */
export const visibleIds = (db: Db, q: SelectQuery): ReadonlySet<string> => {
  const rows = db
    .prepare(`SELECT id FROM record${YUKLEM}`)
    .all({ brand: q.brandId, era: q.eraId, as_of: q.asOf }) as { id: string }[]
  return new Set(rows.map((r) => r.id))
}

/**
 * Arama + yüklem. **Yayına giden her arama buradan geçer**, `search()`ten değil.
 *
 * Ham `search()` durum ve dönem bilmez: emekliye ayrılmış bir kaydı da döndürür.
 * Bu kasıtlı (sıralama ile yetkilendirme ayrı sorumluluklardır) ama tehlikelidir —
 * bu yüzden yayına giden yol budur ve `search()` yalnız indeks testlerinde çıplak kullanılır.
 *
 * **Eleme SQL SEVİYESİNDE.** İlk sürüm önce sıralayıp sonra eliyordu ve görünmez
 * kayıtlar aday havuzunu doldurunca görünür kayıt SESSİZCE düşüyordu: doğrulama
 * agent'ı eşiği **100 kayıtta** ölçtü (koddaki yorum "2000" diyordu — 20 kat sapma).
 * Sessiz kayıp, arama sonucunun eksik olduğunu kimseye söylemez.
 */
export const selectSearch = (
  db: Db,
  q: SelectQuery,
  query: string,
  limit = 20
): readonly SearchHit[] => search(db, query, limit, visibleIds(db, q))
