// Insight defteri — `derived/runs/insights.ndjson` (§13 · R-52 · D-38 · FAZ-7.8).
//
// **Bugün toplanmayan ölçüm yarın satın alınamaz.** IG hesap insight'ları ~90 günde
// kayboluyor ve **backfill uçları yok**: geçmişi geri getiren bir çağrı YOK. Bu, bu
// repodaki en katı "türetilemez veri" örneği — bir çalıştırma yeniden koşturulabilir,
// bir insight KOŞTURULAMAZ.
//
// **Bu yüzden doğruluk NDJSON'da, SQLite'ta değil.** Faz dosyası "ilk satırlar
// SQLite'ta" diyordu; `derived/index/` **silinip yeniden kurulabilir** olarak
// tanımlanmış (11. yasa, D-38) ve geri getirilemez veriyi oraya koymak, bir
// `just reindex`i kalıcı veri kaybına çevirirdi. SQLite yalnız SORGU indeksidir ve
// bu dosyadan beslenir. → D-220
//
// **Boşluk bir yokluk değil, bir OLGUDUR.** Alınmayan gün sessizce atlanmaz: 90 günü
// geçmiş bir boşluk **kalıcı** olarak işaretlenir, çünkü artık kurtarılamaz.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { RUNS_DIR } from '@suite/kernel'

/**
 * Bir günün bir varlık için ölçümü.
 *
 * Sayılar **sağlayıcının söylediği** hâliyle saklanır; türetilmiş oran (etkileşim
 * yüzdesi gibi) YAZILMAZ — türetilebilir olan sonradan hesaplanır, ham olan bir daha
 * hiç elde edilemez.
 */
export interface InsightSatiri {
  /** `YYYY-MM-DD` — ölçümün ait olduğu gün. */
  readonly gun: string
  readonly platform: string
  /** Kanaldaki varlık id'si (`externalId`) — yayın defteriyle bağlanan alan. */
  readonly externalId: string
  /** Bu varlığı üreten çalıştırma; performansın hangi karara ait olduğunu söyler. */
  readonly runId: string | null
  readonly metrikler: Readonly<Record<string, number>>
  /** Ölçümün ALINDIĞI an — `gun`dan farklı olabilir ve farkı bilmek gerekir. */
  readonly fetchedAt: string
}

export const insightLedgerPath = (): string => `${RUNS_DIR}/insights.ndjson`

/** Ölçüm ufku. Bunun ötesindeki bir boşluk kurtarılamaz. */
export const INSIGHT_UFKU_GUN = 90

export type InsightHatasi =
  /**
   * Defter YOK. **"Hiç ölçüm alınmadı" DEĞİL** — dosyanın yokluğu, işin hiç
   * kurulmadığını da, kaydın kaybolduğunu da anlatabilir; ikisi aynı şey değil.
   */
  | { readonly kind: 'ledger_missing'; readonly path: string }
  | { readonly kind: 'unreadable'; readonly line: number; readonly reason: string }

export type InsightSonucu =
  | { readonly ok: true; readonly satirlar: readonly InsightSatiri[] }
  | { readonly ok: false; readonly error: InsightHatasi }

const gecerli = (o: unknown): o is InsightSatiri =>
  o !== null &&
  typeof o === 'object' &&
  typeof (o as InsightSatiri).gun === 'string' &&
  typeof (o as InsightSatiri).externalId === 'string' &&
  typeof (o as InsightSatiri).platform === 'string' &&
  typeof (o as InsightSatiri).metrikler === 'object'

/** Defteri okur. **Bozuk satır sessizce atlanmaz** — atlanan gün, boşluk sayılırdı. */
export const readInsights = (repoRoot: string): InsightSonucu => {
  const yol = join(repoRoot, insightLedgerPath())
  if (!existsSync(yol)) {
    return { ok: false, error: { kind: 'ledger_missing', path: insightLedgerPath() } }
  }
  const satirlar: InsightSatiri[] = []
  for (const [i, ham] of readFileSync(yol, 'utf8').split('\n').entries()) {
    if (ham.trim() === '') continue
    try {
      const o: unknown = JSON.parse(ham)
      if (!gecerli(o)) {
        return { ok: false, error: { kind: 'unreadable', line: i + 1, reason: 'alan eksik' } }
      }
      satirlar.push(o)
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
  return { ok: true, satirlar }
}

/** Aynı gün + aynı varlık = aynı ölçüm. İki kez koşmak ikinci satır YAZMAZ. */
export const insightAnahtari = (
  s: Pick<InsightSatiri, 'gun' | 'platform' | 'externalId'>
): string => `${s.gun}::${s.platform}::${s.externalId}`

export type YazmaSonucu =
  | { readonly kind: 'yazildi' }
  /** Zaten vardı. Bir hata DEĞİL: günlük iş günde birden fazla koşabilir. */
  | { readonly kind: 'zaten_var' }
  | { readonly kind: 'okunamadi'; readonly error: InsightHatasi }

/**
 * Ölçümü deftere ekler — **varsa eklemez**.
 *
 * Defter okunamıyorsa YAZILMAZ: okunamayan bir deftere eklemek, yinelenmeyi göremeden
 * yazmak demektir ve append-only bir dosyada yanlış satır silinemez.
 */
export const appendInsight = (repoRoot: string, satir: InsightSatiri): YazmaSonucu => {
  const mevcut = readInsights(repoRoot)
  if (!mevcut.ok && mevcut.error.kind !== 'ledger_missing') {
    return { kind: 'okunamadi', error: mevcut.error }
  }
  const anahtar = insightAnahtari(satir)
  if (mevcut.ok && mevcut.satirlar.some((s) => insightAnahtari(s) === anahtar)) {
    return { kind: 'zaten_var' }
  }
  const yol = join(repoRoot, insightLedgerPath())
  mkdirSync(dirname(yol), { recursive: true })
  appendFileSync(yol, `${JSON.stringify(satir)}\n`)
  return { kind: 'yazildi' }
}

const gunEkle = (gun: string, n: number): string => {
  const t = Date.parse(`${gun}T00:00:00Z`)
  return new Date(t + n * 86_400_000).toISOString().slice(0, 10)
}

const gunFarki = (a: string, b: string): number =>
  Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000)

export interface Bosluk {
  readonly gun: string
  /**
   * Ufkun içinde mi. **`false` = KALICI KAYIP**: o günün ölçümü artık hiçbir çağrıyla
   * geri getirilemez ve bunu bilmek, bilmemekten iyidir.
   */
  readonly kurtarilabilir: boolean
}

/**
 * Hangi günlerin ölçümü eksik.
 *
 * `ilkGun` **yayın tarihinden** gelir: yayınlanmadan önceki günler boşluk değildir.
 * Bugün hariç tutulur — gün bitmeden "eksik" demek, her sabah yanlış alarm demek.
 */
export const bosluklar = (
  olculenGunler: readonly string[],
  ilkGun: string,
  bugun: string
): readonly Bosluk[] => {
  const set = new Set(olculenGunler)
  const sonuc: Bosluk[] = []
  const uzunluk = gunFarki(bugun, ilkGun)
  if (uzunluk < 0) return sonuc
  for (let i = 0; i < uzunluk; i += 1) {
    const g = gunEkle(ilkGun, i)
    if (set.has(g)) continue
    sonuc.push({ gun: g, kurtarilabilir: gunFarki(bugun, g) <= INSIGHT_UFKU_GUN })
  }
  return sonuc
}

export interface TazelikRaporu {
  /** En son ölçüm günü. `null` = hiç ölçüm yok. */
  readonly sonGun: string | null
  /** Kaç gündür ölçüm alınmadı. `null` = hiç alınmadı, "0 gün" değil. */
  readonly gecenGun: number | null
  readonly mesaj: string
  /** Ölçüm kaçırılıyor mu — `doctor`ın kritik sayacına giren şey. */
  readonly kritik: boolean
}

/**
 * Ölçüm işi çalışıyor mu.
 *
 * **Bir gün gecikme uyarı, iki gün gecikme kritiktir** — kaybedilen her gün kalıcı
 * ve iş sessizce durduğunda ilk fark ediliş yeri, üç ay sonra boş bir pano olurdu.
 */
export const insightTazeligi = (olculenGunler: readonly string[], bugun: string): TazelikRaporu => {
  if (olculenGunler.length === 0) {
    return {
      sonGun: null,
      gecenGun: null,
      mesaj:
        'hiç insight alınmadı — ilk postla birlikte başlaması gerekiyordu; ' +
        'backfill ucu YOK, geçen her gün kalıcı kayıp (§13)',
      kritik: true,
    }
  }
  const sonGun = [...olculenGunler].sort().at(-1)!
  const gecen = gunFarki(bugun, sonGun)
  return {
    sonGun,
    gecenGun: gecen,
    mesaj:
      gecen <= 1
        ? `insight güncel — son ölçüm ${sonGun}`
        : `${gecen} gündür insight alınmadı (son: ${sonGun}) — kaçırılan gün KALICI, backfill ucu yok`,
    kritik: gecen > 1,
  }
}
