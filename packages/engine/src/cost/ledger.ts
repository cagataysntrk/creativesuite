// Maliyet defteri — TEK yazma noktası (§8.3, §13 · chokepoints.json → `maliyet-defteri`).
//
// İki yazıcı, tahmin ile gerçeğin karşılaştırılamaması demektir; bütçe tavanı (D-17) o an
// anlamsızlaşır. Defter aynı zamanda **idempotency kaydıdır**: bir çağrı yapılmadan önce
// anahtarı yazılır, sonra sonucu işlenir. Çökme sonrası yeniden başlatma aynı anahtarı
// görür ve çağrıyı TEKRARLAMAZ — çift ücret buradan engellenir (R-44).
//
// `chargeStatus` tahminden KOPYALANMAZ (§8.3). Sağlayıcı bildirmiyorsa `unreported`;
// çağrı uçtu ama yanıt gelmediyse `possibly-charged`. Bilmediğimizi bilmek,
// bilmediğimizi tahmin etmekten iyidir.

import type { Money, RunId, StepId, VerbName } from '@suite/contracts'
import { ZERO_USD, addMoney } from '@suite/contracts'
import { migrate, type Db, type Migration, type Clock, systemClock } from '@suite/kernel'

export type ChargeStatus = 'charged' | 'unreported' | 'possibly-charged' | 'not-charged'

export interface LedgerEntry {
  readonly idempotencyKey: string
  readonly runId: RunId
  readonly stepId: StepId
  readonly verb: VerbName
  readonly providerId: string
  readonly capability: string
  readonly amount: Money
  readonly chargeStatus: ChargeStatus
  /** Sağlayıcının döndürdüğü kimlik — mutabakat (§8.5) için. */
  readonly externalId: string | null
  readonly createdAt: string
}

export const LEDGER_MIGRATIONS: readonly Migration[] = [
  {
    version: 100,
    up: (db) => {
      db.exec(`
        CREATE TABLE cost_ledger (
          idempotency_key TEXT PRIMARY KEY,
          run_id          TEXT NOT NULL,
          step_id         TEXT NOT NULL,
          verb            TEXT NOT NULL,
          provider_id     TEXT NOT NULL,
          capability      TEXT NOT NULL,
          micros          TEXT NOT NULL,
          currency        TEXT NOT NULL,
          charge_status   TEXT NOT NULL,
          external_id     TEXT,
          created_at      TEXT NOT NULL
        );
        CREATE INDEX cost_run ON cost_ledger (run_id);
      `)
    },
  },
]

export const initLedger = (db: Db): void => {
  migrate(db, LEDGER_MIGRATIONS)
}

const toEntry = (r: Record<string, unknown>): LedgerEntry => ({
  idempotencyKey: r['idempotency_key'] as string,
  runId: r['run_id'] as RunId,
  stepId: r['step_id'] as StepId,
  verb: r['verb'] as VerbName,
  providerId: r['provider_id'] as string,
  capability: r['capability'] as string,
  // bigint SQLite'ta TEXT olarak durur: INTEGER 2^63'te taşar ve mikro-birimde
  // toplam maliyet o sınıra yaklaşabilir. Metin, hassasiyeti hiç kaybetmez.
  amount: { micros: BigInt(r['micros'] as string), currency: 'USD' },
  chargeStatus: r['charge_status'] as ChargeStatus,
  externalId: (r['external_id'] as string | null) ?? null,
  createdAt: r['created_at'] as string,
})

/**
 * Çağrı ÖNCESİ rezervasyon. Anahtar zaten varsa mevcut kayıt döner ve çağıran
 * **çağrıyı tekrarlamaz** — çökme sonrası çift ücretin engellendiği yer burasıdır.
 */
/**
 * Ödenmemiş bir kaydı yeniden AÇAR — iş tekrar denenecek (D-242).
 *
 * `not-charged` "çağrı uçmadı" demek: para harcanmadı, iş yapılmadı. Böyle bir kaydı
 * "kapanmış" saymak, bir kez hata veren adımı sonraki her koşuda `output: null` ile
 * "başarılı" yapıyordu. **Defterin işi ÖDEMEYİ tekrarlamamak, İŞİ tekrarlamamak
 * değil.**
 *
 * Kayıt SİLİNMİYOR, `possibly-charged`a çevriliyor ve yeni koşuya bağlanıyor: defter
 * append-only bir KANIT (R-52) ve "bu adım daha önce denendi" bilgisi kaybolmamalı.
 */
export const reopen = (
  db: Db,
  idempotencyKey: string,
  runId: RunId,
  stepId: StepId,
  clock: Clock = systemClock
): void => {
  db.prepare(
    `UPDATE cost_ledger
        SET charge_status = 'possibly-charged', run_id = @run, step_id = @step,
            micros = '0', external_id = NULL, created_at = @now
      WHERE idempotency_key = @k AND charge_status = 'not-charged'`
  ).run({ k: idempotencyKey, run: String(runId), step: String(stepId), now: clock.nowIso() })
}

export const reserve = (
  db: Db,
  input: Omit<LedgerEntry, 'amount' | 'chargeStatus' | 'externalId' | 'createdAt'>,
  clock: Clock = systemClock
): { readonly fresh: boolean; readonly entry: LedgerEntry } => {
  const mevcut = db
    .prepare('SELECT * FROM cost_ledger WHERE idempotency_key = ?')
    .get(input.idempotencyKey) as Record<string, unknown> | undefined
  if (mevcut !== undefined) return { fresh: false, entry: toEntry(mevcut) }

  const now = clock.nowIso()
  db.prepare(
    `INSERT INTO cost_ledger (idempotency_key, run_id, step_id, verb, provider_id,
                              capability, micros, currency, charge_status, external_id, created_at)
     VALUES (@k, @run, @step, @verb, @prov, @cap, '0', 'USD', 'possibly-charged', NULL, @now)`
  ).run({
    k: input.idempotencyKey,
    run: input.runId,
    step: input.stepId,
    verb: input.verb,
    prov: input.providerId,
    cap: input.capability,
    now,
  })

  // Rezervasyon `possibly-charged` ile başlar: çağrı uçtu ama sonucunu bilmiyoruz.
  // `not-charged` ile başlamak, tam o anda çöken bir sürecin ücreti sıfır sanmasına
  // yol açardı — ve o çalıştırma yeniden başladığında ikinci kez ödenirdi.
  return {
    fresh: true,
    entry: {
      ...input,
      amount: ZERO_USD,
      chargeStatus: 'possibly-charged',
      externalId: null,
      createdAt: now,
    },
  }
}

/**
 * Sağlayıcının iş tutamağını **çağrı uçar uçmaz** yazar — sonuç beklenmeden.
 *
 * Bu satır olmadan `start()` ile `settle()` arasında çöken bir süreç tutamağı kaybeder;
 * yeniden başlatma sağlayıcının hâlâ koşan işini bulamaz, `start()`'ı tekrar çağırır ve
 * **iki kez ödenir**. Tutamak defterde olduğu sürece yeniden başlatma "bu iş zaten
 * uçtu, sonucunu sor" diyebilir. (§8.5 · R-44)
 */
export const noteHandle = (db: Db, idempotencyKey: string, externalId: string): void => {
  db.prepare('UPDATE cost_ledger SET external_id = @ext WHERE idempotency_key = @k').run({
    k: idempotencyKey,
    ext: externalId,
  })
}

/** Çağrı SONRASI kesinleştirme. Yalnız rezerve edilmiş bir anahtar kapatılabilir. */
export const settle = (
  db: Db,
  idempotencyKey: string,
  amount: Money,
  chargeStatus: ChargeStatus,
  externalId: string | null = null
): LedgerEntry | null => {
  const sonuc = db
    .prepare(
      `UPDATE cost_ledger SET micros = @micros, currency = @cur, charge_status = @st,
                              external_id = @ext
        WHERE idempotency_key = @k`
    )
    .run({
      k: idempotencyKey,
      micros: amount.micros.toString(),
      cur: amount.currency,
      st: chargeStatus,
      ext: externalId,
    })
  if (sonuc.changes === 0) return null
  return getEntry(db, idempotencyKey)
}

export const getEntry = (db: Db, idempotencyKey: string): LedgerEntry | null => {
  const r = db
    .prepare('SELECT * FROM cost_ledger WHERE idempotency_key = ?')
    .get(idempotencyKey) as Record<string, unknown> | undefined
  return r === undefined ? null : toEntry(r)
}

export interface RunTotals {
  readonly charged: Money
  /** Ücretlendirilmiş OLABİLECEK tutar. Bütçe kontrolü bunu da sayar — saymayan
   *  bir tavan, bilinmeyen harcamayı sıfır kabul eder ve aşılır. */
  readonly possiblyCharged: Money
  readonly entries: number
  readonly unreported: number
}

export const runTotals = (db: Db, runId: RunId): RunTotals => {
  const rows = db.prepare('SELECT * FROM cost_ledger WHERE run_id = ?').all(runId) as Record<
    string,
    unknown
  >[]
  let charged = ZERO_USD
  let possibly = ZERO_USD
  let unreported = 0
  for (const r of rows.map(toEntry)) {
    if (r.chargeStatus === 'charged') charged = addMoney(charged, r.amount)
    if (r.chargeStatus === 'possibly-charged') possibly = addMoney(possibly, r.amount)
    if (r.chargeStatus === 'unreported') unreported += 1
  }
  return { charged, possiblyCharged: possibly, entries: rows.length, unreported }
}
