// Makine durumu — kalıcı enstrüman okuması (§12.4).
//
// Kabuğun alt kenarındaki tek satırın verisi: aktif çalıştırma · biriken maliyet ·
// bekleyen onay · en yakın kota sınırı. Toast değil, köşede rozet değil — makinenin
// durumunu bilmek için hiçbir yere tıklamak gerekmiyor.
//
// **Ölçülemeyen alan RAPORA GİRMEZ, sıfır olarak girmez.** `kota: null` ile
// `kota: { kalan: 0 }` arasındaki fark, "bilmiyoruz" ile "bitti" arasındaki farktır ve
// ikincisi operatörü yanlış yönlendirir. Aynı ilke marka QA'sında da geçerli
// (`packages/render/src/qa/measure.ts`): sıfır bir okuma değil, bir yalandır.

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, costSummary, inspectManifest, type RunManifest } from '@suite/kernel'
import type { RunId } from '@suite/contracts'
import { openDb, type Db } from '@suite/kernel'
import { readManifest } from '@suite/engine'
import { scanCorpus, visibleIds, type SelectQuery } from '@suite/corpus'

/** Aktif çalıştırma özeti. `null` = hiçbir şey koşmuyor (boş bir okuma DEĞİL, gerçek). */
export interface AktifCalistirma {
  readonly runId: string
  readonly pipeline: string
  /** Kaçıncı adımda — parça takip kartı gibi, istasyon zinciri (§12.4). */
  readonly adim: number
  readonly toplamAdim: number
  readonly baslangic: string
}

export interface MakineDurumu {
  readonly aktif: AktifCalistirma | null
  /**
   * Biriken gerçek maliyet, USD mikro-birim — **dize olarak**.
   * `bigint` JSON'a girmez ve `Number`a çevirmek 2^53 üstünde sessizce yuvarlar (R-41).
   */
  readonly maliyetMikros: string
  readonly tahminAltMikros: string
  readonly tahminUstMikros: string
  /** Gerçek, tahmin bandının dışında mı — %20 sapma denetiminin görsel karşılığı. */
  readonly bandDisinda: boolean
  /** İnsan onayı bekleyen kayıt sayısı (R-14). */
  readonly bekleyenOnay: number
  /** Manifest'i KUSURLU olduğu için yayınlanamayan çalıştırma sayısı. */
  readonly kusurluCalistirma: number
  /**
   * En yakın kota sınırı. **Şu an ölçülmüyor** — bedava katman sayaçları FAZ-4.12'de
   * gelecek. `null` burada dürüstlüktür: uydurulmuş bir "%80 dolu" göstergesi,
   * hiç göstergesi olmamaktan tehlikelidir.
   */
  readonly kota: null
  readonly olcumAni: string
}

// Manifest okuma `readManifest`e devredilir — İKİNCİ bir okuyucu yazılmaz.
//
// İlk sürüm kendi `JSON.parse` reviver'ını taşıyordu ve **kablo biçimini uydurmuştu**
// (`{__bigint: "..."}`); gerçek biçim `{micros: "0", currency: "USD"}`. Sonuç sessizdi:
// `bigint + string` JS'te dize BİRLEŞTİRMESİDİR, o yüzden toplam `"0000000…"` oldu ve
// hiçbir istisna atılmadı. Birim testleri geçti çünkü fikstürler de uydurma biçimi
// kullanıyordu — test, kodu değil kendi varsayımını doğruladı (D-163).
const manifestOku = (repoRoot: string, runId: string): RunManifest | null =>
  readManifest(repoRoot, runId as RunId)

/** Bir çalıştırma AKTİF sayılır: başlamış ama bitmemiş bir adımı varsa. */
const aktifMi = (m: RunManifest): boolean =>
  m.steps.some((s) => s.startedAt !== null && s.finishedAt === null)

const bitenAdim = (m: RunManifest): number => m.steps.filter((s) => s.finishedAt !== null).length

export interface DurumGirdisi {
  readonly repoRoot: string
  readonly db: Db | null
  readonly query: SelectQuery
  readonly simdi: string
}

/**
 * Diskteki gerçeği okur. **Önbellek yok.**
 *
 * Önbellek burada bir optimizasyon değil, bir yalan riski olurdu: makine durumu
 * şeridinin tek işi ŞU AN ne olduğunu söylemek ve bayat bir sayı gösteren kalıcı bir
 * gösterge, hiç göstergesi olmamaktan kötüdür (§12.6: bayat içerik soldurulmaz,
 * BİLDİRİLİR). Çalıştırma sayısı yüzlerce olduğunda burada bir indeks gerekir;
 * o gün geldiğinde `derived/index` zaten var.
 */
export const makineDurumu = (g: DurumGirdisi): MakineDurumu => {
  const runsDir = join(g.repoRoot, RUNS_DIR)
  let aktif: AktifCalistirma | null = null
  let mikros = 0n
  let altMikros = 0n
  let ustMikros = 0n
  let bandDisinda = false
  let kusurlu = 0

  const dizinler = existsSync(runsDir)
    ? readdirSync(runsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : []

  for (const runId of dizinler) {
    const m = manifestOku(g.repoRoot, runId)
    if (m === null) continue
    if (inspectManifest(m).length > 0) kusurlu++

    const c = costSummary(m)
    mikros += c.actual.micros
    altMikros += c.estimatedLow.micros
    ustMikros += c.estimatedHigh.micros
    if (c.outsideBand) bandDisinda = true

    // Son başlayan aktif çalıştırma kazanır: dizin adları uuidv7 olduğu için
    // alfabetik sıra zaman sırasıdır (§3.9).
    if (aktifMi(m)) {
      aktif = {
        runId: m.runId,
        pipeline: m.pipeline,
        adim: bitenAdim(m) + 1,
        toplamAdim: m.steps.length,
        baslangic: m.createdAt,
      }
    }
  }

  return {
    aktif,
    maliyetMikros: String(mikros),
    tahminAltMikros: String(altMikros),
    tahminUstMikros: String(ustMikros),
    bandDisinda,
    bekleyenOnay: bekleyenOnaySayisi(g),
    kusurluCalistirma: kusurlu,
    kota: null,
    olcumAni: g.simdi,
  }
}

/**
 * Onay bekleyen kayıt sayısı = taranan kayıt − retrieval'a GÖRÜNEN kayıt.
 *
 * **İkinci bir retrieval yüklemi yazılmıyor** (R-13). "draft olanları say" demek,
 * görünürlük kuralını ikinci bir yerde yeniden ifade etmek olurdu ve iki ifade
 * zamanla ayrışır. Görünmezliğin tanımı tek yerde (`visibleIds`); burası yalnız
 * tümleyeni alıyor.
 *
 * İndeks yoksa `0` DEĞİL `-1` dönülür: indekssiz bir sayım, "bekleyen yok" ile
 * "sayamadım"ı aynı şeye çevirirdi.
 */
const bekleyenOnaySayisi = (g: DurumGirdisi): number => {
  if (g.db === null) return -1
  const tarama = scanCorpus(join(g.repoRoot, 'corpus'), g.repoRoot)
  if (tarama.records.length === 0) return 0
  const gorunen = visibleIds(g.db, g.query)
  return tarama.records.filter((r) => !gorunen.has(r.id)).length
}

/** Salt-okunur indeks bağlantısı. Yoksa `null` — sunucu yine ayağa kalkar. */
export const indeksAc = (repoRoot: string): Db | null => {
  const yol = join(repoRoot, 'derived/index/suite.db')
  if (!existsSync(yol)) return null
  try {
    return openDb({ path: yol, readonly: true })
  } catch {
    return null
  }
}
