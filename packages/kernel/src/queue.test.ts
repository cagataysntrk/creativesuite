import { beforeEach, describe, expect, it } from 'vitest'
import { migrate, openDb, schemaVersion, type Db } from './db.js'
import {
  countByState,
  enqueue,
  getJob,
  lease,
  QUEUE_MIGRATIONS,
  retryOrFail,
  setState,
} from './queue.js'
import { manualClock } from './time/clock.js'

const RUN = 'run_0192f3a1-0000-7000-8000-000000000010'

let db: Db
let clock: ReturnType<typeof manualClock>
const deps = () => ({ db, clock })

beforeEach(() => {
  db = openDb({ path: ':memory:' })
  migrate(db, QUEUE_MIGRATIONS)
  clock = manualClock('2026-08-15T09:00:00.000Z')
})

describe('şema göçü', () => {
  it('sürüm user_version pragmasında tutulur', () => {
    expect(schemaVersion(db)).toBe(1)
  })

  it('ikinci kez göç etmek hiçbir şey yapmaz — idempotent', () => {
    expect(migrate(db, QUEUE_MIGRATIONS)).toBe(1)
  })
})

describe('kuyruk (§3.7 · D-28)', () => {
  it('eklenen iş kuyrukta ve ön ekli id taşıyor', () => {
    const j = enqueue(deps(), { runId: RUN, kind: 'render', payload: { a: 1 } })
    expect(j.state).toBe('queued')
    expect(j.id.startsWith('job_')).toBe(true)
    expect(getJob(db, j.id)?.state).toBe('queued')
  })

  it('kiralanan iş ikinci kez alınamaz — iki worker aynı işi almaz', () => {
    enqueue(deps(), { runId: RUN, kind: 'render', payload: {} })
    const ilk = lease(deps())
    expect(ilk?.state).toBe('leased')
    expect(lease(deps())).toBeNull()
  })

  it('kira dolunca iş geri alınabilir — SIGKILL işi kilitlemez', () => {
    enqueue(deps(), { runId: RUN, kind: 'render', payload: {} })
    const ilk = lease(deps(), 60_000)
    expect(ilk).not.toBeNull()

    clock.ilerlet(59_000)
    expect(lease(deps())).toBeNull() // kira sürerken alınamaz

    clock.ilerlet(2_000)
    const tekrar = lease(deps())
    expect(tekrar?.id).toBe(ilk?.id)
    expect(tekrar?.attempts).toBe(2) // aynı iş, ikinci deneme
  })

  it('işler ekleniş sırasına göre alınır', () => {
    const a = enqueue(deps(), { runId: RUN, kind: 'a', payload: {} })
    clock.ilerlet(1000)
    enqueue(deps(), { runId: RUN, kind: 'b', payload: {} })
    expect(lease(deps())?.id).toBe(a.id)
  })
})

describe('durum geçişleri tabloya uyar', () => {
  it('yasal geçiş uygulanır', () => {
    const j = enqueue(deps(), { runId: RUN, kind: 'render', payload: {} })
    lease(deps())
    expect(setState(deps(), j.id, 'done')?.state).toBe('done')
  })

  it('yasadışı geçiş REDDEDİLİR ve satır değişmez', () => {
    const j = enqueue(deps(), { runId: RUN, kind: 'render', payload: {} })
    // queued → done yasadışı: iş önce kiralanmalı
    expect(setState(deps(), j.id, 'done')).toBeNull()
    expect(getJob(db, j.id)?.state).toBe('queued')
  })

  it('bitmiş iş yeniden kuyruğa alınamaz', () => {
    const j = enqueue(deps(), { runId: RUN, kind: 'render', payload: {} })
    lease(deps())
    setState(deps(), j.id, 'done')
    expect(setState(deps(), j.id, 'queued')).toBeNull()
  })
})

describe('yeniden deneme sınırı — sonsuz deneme sonsuz fatura demektir', () => {
  it('hak kaldıysa kuyruğa döner', () => {
    const j = enqueue(deps(), { runId: RUN, kind: 'render', payload: {}, maxAttempts: 3 })
    lease(deps())
    expect(retryOrFail(deps(), j.id, 'gecici hata')?.state).toBe('queued')
  })

  it('hak bittiğinde failed TERMİNAL kalır', () => {
    const j = enqueue(deps(), { runId: RUN, kind: 'render', payload: {}, maxAttempts: 2 })
    lease(deps()) // attempts = 1
    retryOrFail(deps(), j.id, 'hata 1')
    lease(deps()) // attempts = 2
    const son = retryOrFail(deps(), j.id, 'hata 2')
    expect(son?.state).toBe('failed')
    expect(getJob(db, j.id)?.state).toBe('failed')
    expect(getJob(db, j.id)?.last_error).toBe('hata 2')
  })

  it('sayaçlar duruma göre okunabiliyor', () => {
    enqueue(deps(), { runId: RUN, kind: 'a', payload: {} })
    enqueue(deps(), { runId: RUN, kind: 'b', payload: {} })
    lease(deps())
    expect(countByState(db)).toEqual({ queued: 1, leased: 1 })
  })
})
