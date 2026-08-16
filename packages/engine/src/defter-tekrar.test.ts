// Başarısız bir adım tekrar DENENİYOR mu (D-242 · §8.5).
//
// Ölçülen kusur: `metin-uret` hata verdi → deftere `not-charged` kapandı → sonraki
// koşuda "iş bitmiş" sayılıp atlandı → `status: ok`, `output: null`, 1 ms.
// **Kırmızı bir adım, yeşile dönmüş bir adımdan iyidir.**

import { describe, expect, it } from 'vitest'
import type { RunId, StepId, VerbName } from '@suite/contracts'
import { ZERO_USD, usd } from '@suite/contracts'
import { openDb } from '@suite/kernel'
import { initLedger, reserve, settle, reopen } from './cost/ledger.js'

const kur = () => {
  const db = openDb({ path: ':memory:' })
  initLedger(db)
  return db
}

const giris = {
  idempotencyKey: 'idem_test',
  runId: 'run_1' as RunId,
  stepId: 'metin-uret' as StepId,
  verb: 'GENERATE' as VerbName,
  providerId: 'claude-code',
  capability: 'text.generate',
}

describe('ödenmemiş iş tekrar denenir', () => {
  it('`not-charged` kapanmış SAYILMIYOR — reopen sonrası taze davranıyor', () => {
    const db = kur()
    expect(reserve(db, giris).fresh).toBe(true)
    settle(db, giris.idempotencyKey, ZERO_USD, 'not-charged')

    // İkinci koşu: kayıt var ama iş yapılmadı.
    const ikinci = reserve(db, giris)
    expect(ikinci.fresh).toBe(false)
    expect(ikinci.entry.chargeStatus).toBe('not-charged')

    reopen(db, giris.idempotencyKey, 'run_2' as RunId, giris.stepId)
    const ucuncu = reserve(db, { ...giris, runId: 'run_2' as RunId })
    expect(ucuncu.entry.chargeStatus).toBe('possibly-charged')
    expect(ucuncu.entry.externalId).toBeNull()
  })

  it('`charged` kayıt DOKUNULMUYOR — çift ödeme koruması duruyor', () => {
    const db = kur()
    reserve(db, giris)
    settle(db, giris.idempotencyKey, usd(25_000n), 'charged')

    reopen(db, giris.idempotencyKey, 'run_2' as RunId, giris.stepId)
    const sonra = reserve(db, giris)
    expect(sonra.entry.chargeStatus).toBe('charged')
    expect(sonra.entry.amount.micros).toBe(25_000n)
  })

  it('`possibly-charged` da dokunulmuyor — bilinmeyeni tahmin etmek yasak', () => {
    const db = kur()
    reserve(db, giris)
    settle(db, giris.idempotencyKey, ZERO_USD, 'possibly-charged')
    reopen(db, giris.idempotencyKey, 'run_2' as RunId, giris.stepId)
    expect(reserve(db, giris).entry.chargeStatus).toBe('possibly-charged')
  })

  it('kayıt SİLİNMİYOR — defter append-only kanıttır (R-52)', () => {
    const db = kur()
    reserve(db, giris)
    settle(db, giris.idempotencyKey, ZERO_USD, 'not-charged')
    reopen(db, giris.idempotencyKey, 'run_2' as RunId, giris.stepId)
    // Sayım defterin KENDİ okuyucusundan: ham SQL yazmak `maliyet-defteri`
    // darboğazının ikinci bir kopyası olurdu (§3.8) — kapı bunu yakaladı.
    expect(reserve(db, giris).fresh).toBe(false)
  })
})
