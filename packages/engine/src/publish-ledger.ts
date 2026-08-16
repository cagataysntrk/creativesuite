// Yayın defteri — `derived/runs/published.ndjson` (§13 · R-44, R-46 · D-38 · FAZ-7.4).
//
// **Meta yinelenen gönderimde HATA VERMEZ, mevcut medya id'sini döndürür.** Yerel bir
// defter olmadan bu davranış "başardım" diye okunur: üç varlık ürettiğin hâlde yirmi
// ürettiğini sanırsın ve fark ancak insight'lara bakınca ortaya çıkar (R-46).
//
// **Defter TÜRETİLEMEZ** (D-38). `derived/index` silinip `just reindex` ile geri gelir;
// bu dosya gelmez — "bu içerik yayınlandı mı" sorusunun cevabı başka hiçbir yerde
// yazmıyor. O yüzden `derived/runs/` altında, git'te ve yedekli.
//
// **NDJSON, JSON dizisi değil.** Append-only bir defterin tek doğru biçimi bu: yeni
// satır eklemek dosyanın tamamını okumayı gerektirmiyor ve yarıda kesilen bir yazma
// yalnız son satırı bozuyor, dosyanın tamamını değil.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'

export interface PublishedEntry {
  /** İçerik özeti — aynı byte, aynı yayın. İdempotency anahtarının çekirdeği (R-44). */
  readonly digest: string
  readonly platform: string
  /** Kanalın döndürdüğü id. Yinelenmede Meta AYNI id'yi döndürür. */
  readonly externalId: string
  readonly runId: string
  /** ISO 8601 — çağıran verir (R-06). */
  readonly publishedAt: string
}

/** Defter yolu. `derived/runs` dizesi kernel'de (`manifest-yazici` darboğazı). */
export const ledgerPath = (): string => `${RUNS_DIR}/published.ndjson`

export type LedgerError =
  /**
   * Defter YOK. **Bu bir "boş defter" DEĞİLDİR.**
   *
   * Boş saymak, defteri silmenin yinelemeleri serbest bırakması demekti — ve defter
   * türetilemez olduğu için silinmesi bir kaza olabilir. Yayın DURUR ve insan
   * "yedekten geri yükle" ya da "ilk yayın, defteri başlat" der.
   */
  | { readonly kind: 'ledger_missing'; readonly path: string }
  | { readonly kind: 'unreadable'; readonly line: number; readonly reason: string }

export type LedgerResult =
  | { readonly ok: true; readonly entries: readonly PublishedEntry[] }
  | { readonly ok: false; readonly error: LedgerError }

const gecerli = (o: unknown): o is PublishedEntry =>
  o !== null &&
  typeof o === 'object' &&
  typeof (o as PublishedEntry).digest === 'string' &&
  typeof (o as PublishedEntry).externalId === 'string' &&
  typeof (o as PublishedEntry).platform === 'string'

/**
 * Defteri okur.
 *
 * **Bozuk bir satır sessizce atlanmaz.** Atlansaydı, bozulmuş bir defter "o içerik
 * yayınlanmamış" diye okunur ve ikinci kez yayınlanırdı — defterin var olma sebebinin
 * tam tersi.
 */
export const readLedger = (repoRoot: string): LedgerResult => {
  const yol = join(repoRoot, ledgerPath())
  if (!existsSync(yol)) return { ok: false, error: { kind: 'ledger_missing', path: ledgerPath() } }

  const entries: PublishedEntry[] = []
  const satirlar = readFileSync(yol, 'utf8').split('\n')
  for (const [i, ham] of satirlar.entries()) {
    if (ham.trim() === '') continue
    try {
      const o: unknown = JSON.parse(ham)
      if (!gecerli(o)) {
        return { ok: false, error: { kind: 'unreadable', line: i + 1, reason: 'alan eksik' } }
      }
      entries.push(o)
    } catch (e) {
      return {
        ok: false,
        error: {
          kind: 'unreadable',
          line: i + 1,
          reason: e instanceof Error ? e.message : 'JSON değil',
        },
      }
    }
  }
  return { ok: true, entries }
}

/**
 * Bu içerik daha önce yayınlandı mı.
 *
 * Defter okunamıyorsa **`null` DÖNMÜYOR**: `null` "yayınlanmamış" demek olurdu ve
 * okunamayan bir defter, boş bir defterden farklıdır. Hata yukarı çıkar.
 */
export const lookupPublished = (
  repoRoot: string,
  digest: string,
  platform: string
):
  | { readonly ok: true; readonly entry: PublishedEntry | null }
  | { readonly ok: false; readonly error: LedgerError } => {
  const r = readLedger(repoRoot)
  if (!r.ok) return r
  const bulunan = r.entries.find((e) => e.digest === digest && e.platform === platform)
  return { ok: true, entry: bulunan ?? null }
}

/**
 * Defteri BAŞLATIR — yalnız yoksa.
 *
 * Ayrı bir işlem olması bilinçli: "defter yok" hatası bir insanın kararını istiyor
 * (yedekten mi geri yüklenecek, yoksa bu gerçekten ilk yayın mı). Yazma yolunun onu
 * kendiliğinden oluşturması, o kararı sessizce vermek olurdu.
 */
export const initLedgerFile = (repoRoot: string): boolean => {
  const yol = join(repoRoot, ledgerPath())
  if (existsSync(yol)) return false
  mkdirSync(dirname(yol), { recursive: true })
  appendFileSync(yol, '')
  return true
}

/** Yayını deftere ekler. **Append-only**: satır silinmez, düzeltilmez. */
export const appendPublished = (repoRoot: string, entry: PublishedEntry): void => {
  const yol = join(repoRoot, ledgerPath())
  mkdirSync(dirname(yol), { recursive: true })
  appendFileSync(yol, `${JSON.stringify(entry)}\n`)
}
