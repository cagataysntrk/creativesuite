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

// ── TARAYICI listelemesi — retrieval DEĞİL ──────────────────────────────────
//
// Corpus Browser'ın (§12.9, FAZ-4.3) tüm işi taslakları ve emeklileri DE göstermek:
// "her şey görülebilir, düzeltilebilir, sabitlenebilir, emekliye ayrılabilir" (D-12).
// Yani bu liste kasten yüklemin DIŞINDADIR.
//
// **İkinci bir yüklem yazılmıyor** (R-13). Görünürlük hâlâ tek yerde tanımlı; burası
// `visibleIds`i ÇAĞIRIP her satıra `visible` bayrağı basıyor. Kopyalasaydık iki tanım
// zamanla ayrışır ve tarayıcı "bu kayıt yayında" derken hat onu hiç görmezdi —
// operatörün fark etmesi imkânsız bir yalan.
//
// ⚠ **Bu fonksiyonun çıktısı prompt'a GİRMEZ.** Bağlam derleyen her yol
// `selectRecords`/`selectSearch` kullanır; buradan gelen satırlar yalnız EKRANA gider.

export interface BrowseRow extends SelectedRecord {
  /** Retrieval yüklemine göre görünür mü — `visibleIds`ten TÜRETİLİR, tekrar hesaplanmaz. */
  readonly visible: boolean
  readonly expired_at: string | null
}

export interface BrowseQuery {
  readonly brandId: string
  readonly eraId: string
  readonly asOf: string
  /** Boşsa marka altındaki HER tip. */
  readonly type?: string
  /** Boşsa her durum. Tarayıcı varsayılanı: hepsi — gizlenen kayıt yönetilemez. */
  readonly status?: string
  readonly limit?: number
}

/**
 * İndeksteki kayıt sayısı — doctor'ın indeks/corpus ayrışma denetimi için (FAZ-4.17).
 *
 * **Neden burada:** `record` tablosuna erişim `retrieval-yuklemi` darboğazına kilitli
 * (R-01). Doctor'ın kendi `SELECT`ini yazması, sayının nereden geldiğini ikinci bir
 * dosyaya dağıtmak olurdu — ve o dosya bir gün yüklemi de yazmaya başlar.
 *
 * Yükleme TABİ DEĞİLDİR ve olmamalı: ayrışma denetimi indeksin TAMAMINI corpus'un
 * tamamıyla karşılaştırır; görünürlük filtresi uygulasaydık emekli kayıtlar "eksik"
 * görünür ve doctor her seferinde sahte bir ayrışma raporlardı.
 */
export const recordCount = (db: Db): number =>
  (db.prepare('SELECT COUNT(*) AS n FROM record').get() as { n: number }).n

export const browseRecords = (db: Db, q: BrowseQuery): readonly BrowseRow[] => {
  const tipKosulu = q.type === undefined || q.type === '' ? '' : ' AND type = :type'
  const durumKosulu = q.status === undefined || q.status === '' ? '' : ' AND status = :status'
  const rows = db
    .prepare(
      `SELECT ${SUTUNLAR}, expired_at FROM record
        WHERE brand_id = :brand AND (era_id = :era OR era_id = '*')${tipKosulu}${durumKosulu}
        ORDER BY type, id LIMIT :limit`
    )
    .all({
      brand: q.brandId,
      era: q.eraId,
      type: q.type ?? '',
      status: q.status ?? '',
      limit: q.limit ?? 1000,
    }) as (SelectedRecord & { expired_at: string | null })[]

  const gorunen = visibleIds(db, { brandId: q.brandId, eraId: q.eraId, asOf: q.asOf })
  return rows.map((r) => ({ ...r, visible: gorunen.has(r.id) }))
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
