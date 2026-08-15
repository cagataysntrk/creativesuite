// İş kuyruğu — SQLite tablosu + süreç-içi worker (§3.7 · D-28).
//
// pg-boss / Temporal / Trigger.dev YOK: yerel render'lar alt süreçtir, dağıtık iş akışı
// değil. Tek kullanıcılı bir makinede dağıtık kuyruk, çözmediği bir problem için
// çalıştırılması gereken ikinci bir servistir (ilke 12).
//
// KİRALAMA (lease) modeli: iş "alınır" ve bir süreliğine kiralanır. Süreç SIGKILL
// yerse iş ne kaybolur (kuyrukta kalır) ne de sonsuza kilitlenir (kira dolar).
// Bu, "bir işi yarıda kes → yeniden başlatınca kaldığı yerden devam, çift ücret yok"
// kabul kriterinin (FAZ-1.12) altyapısıdır.

import type { Db, Migration } from './db.js'
import { canTransition } from './fsm/machines.js'
import { newId } from './ids.js'
import { systemClock, type Clock } from './time/clock.js'

export type JobState = 'queued' | 'leased' | 'done' | 'failed' | 'cancelled'

export interface Job {
  readonly id: string
  readonly run_id: string
  readonly kind: string
  readonly state: JobState
  readonly payload: string
  readonly attempts: number
  readonly max_attempts: number
  readonly lease_until: string | null
  readonly last_error: string | null
  readonly created_at: string
  readonly updated_at: string
}

export const QUEUE_MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.exec(`
        CREATE TABLE job (
          id           TEXT PRIMARY KEY,
          run_id       TEXT NOT NULL,
          kind         TEXT NOT NULL,
          state        TEXT NOT NULL,
          payload      TEXT NOT NULL,
          attempts     INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 3,
          lease_until  TEXT,
          last_error   TEXT,
          created_at   TEXT NOT NULL,
          updated_at   TEXT NOT NULL
        );
        -- Alma sorgusu bu indeksi kullanır: durum + kira sonu.
        CREATE INDEX job_alinabilir ON job (state, lease_until);
        CREATE INDEX job_run ON job (run_id);
      `)
    },
  },
]

export interface QueueDeps {
  readonly db: Db
  readonly clock?: Clock
}

const iso = (c: Clock) => c.nowIso()

export const enqueue = (
  { db, clock = systemClock }: QueueDeps,
  input: { runId: string; kind: string; payload: unknown; maxAttempts?: number }
): Job => {
  const now = iso(clock)
  const job: Job = {
    id: newId('JobId', clock),
    run_id: input.runId,
    kind: input.kind,
    state: 'queued',
    payload: JSON.stringify(input.payload),
    attempts: 0,
    max_attempts: input.maxAttempts ?? 3,
    lease_until: null,
    last_error: null,
    created_at: now,
    updated_at: now,
  }
  db.prepare(
    `INSERT INTO job (id, run_id, kind, state, payload, attempts, max_attempts,
                      lease_until, last_error, created_at, updated_at)
     VALUES (@id, @run_id, @kind, @state, @payload, @attempts, @max_attempts,
             @lease_until, @last_error, @created_at, @updated_at)`
  ).run(job)
  return job
}

/**
 * Bir iş kiralar. Kira süresi dolmuş `leased` işler de alınabilir — süreç öldüyse
 * iş geri döner. Seçim ve güncelleme TEK işlemde: iki worker aynı işi alamaz.
 */
export const lease = ({ db, clock = systemClock }: QueueDeps, leaseMs = 60_000): Job | null => {
  const now = clock.now()
  const nowIso = new Date(now).toISOString()
  const leaseUntil = new Date(now + leaseMs).toISOString()

  const al = db.transaction((): Job | null => {
    const row = db
      .prepare(
        `SELECT * FROM job
          WHERE (state = 'queued')
             OR (state = 'leased' AND lease_until IS NOT NULL AND lease_until < @now)
          ORDER BY created_at
          LIMIT 1`
      )
      .get({ now: nowIso }) as Job | undefined
    if (row === undefined) return null

    db.prepare(
      `UPDATE job SET state = 'leased', lease_until = @lease, attempts = attempts + 1,
                      updated_at = @now
        WHERE id = @id`
    ).run({ id: row.id, lease: leaseUntil, now: nowIso })

    return { ...row, state: 'leased', lease_until: leaseUntil, attempts: row.attempts + 1 }
  })

  return al()
}

/** Durum geçişi — geçiş tablosuna uymayan güncelleme REDDEDİLİR (§3.7). */
export const setState = (
  { db, clock = systemClock }: QueueDeps,
  id: string,
  to: JobState,
  lastError?: string
): Job | null => {
  const row = db.prepare('SELECT * FROM job WHERE id = @id').get({ id }) as Job | undefined
  if (row === undefined) return null
  if (!canTransition('job', row.state, to)) return null

  db.prepare(
    `UPDATE job SET state = @to, last_error = @err, lease_until = NULL, updated_at = @now
      WHERE id = @id`
  ).run({ id, to, err: lastError ?? null, now: iso(clock) })

  return { ...row, state: to, last_error: lastError ?? null, lease_until: null }
}

/**
 * Başarısız işi yeniden kuyruğa alır — deneme hakkı kaldıysa.
 * Hak bittiğinde `failed` TERMİNAL kalır: sonsuz yeniden deneme, sonsuz fatura demektir.
 */
export const retryOrFail = (deps: QueueDeps, id: string, error: string): Job | null => {
  const row = deps.db.prepare('SELECT * FROM job WHERE id = @id').get({ id }) as Job | undefined
  if (row === undefined) return null

  const failed = setState(deps, id, 'failed', error)
  if (failed === null) return null
  if (row.attempts >= row.max_attempts) return failed
  return setState(deps, id, 'queued', error)
}

export const getJob = (db: Db, id: string): Job | null =>
  (db.prepare('SELECT * FROM job WHERE id = @id').get({ id }) as Job | undefined) ?? null

export const countByState = (db: Db): Readonly<Record<string, number>> => {
  const rows = db.prepare('SELECT state, COUNT(*) n FROM job GROUP BY state').all() as {
    state: string
    n: number
  }[]
  return Object.fromEntries(rows.map((r) => [r.state, r.n]))
}
