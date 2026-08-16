// Yayın defteri (§13 · R-46 · D-38 · FAZ-7.4).
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { join } from 'node:path'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import {
  appendPublished,
  initLedgerFile,
  ledgerPath,
  lookupPublished,
  readLedger,
} from './publish-ledger.js'

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-defter-')
})
afterEach(() => tmp.cleanup())

const kayit = (digest: string) => ({
  digest,
  platform: 'instagram',
  externalId: `ig_${digest}`,
  runId: 'run_1',
  publishedAt: '2026-08-16T12:00:00.000Z',
})

describe('yayın defteri', () => {
  // 🧪 Adımın kriteri: defteri sil → yayın DURUR. Defter türetilemez (D-38) ve
  // "yok" ile "boş" aynı şey değil: boş saymak, defteri silmenin yinelemeleri
  // serbest bırakması demekti.
  it('defter YOKSA hata — "boş defter" sayılmıyor', () => {
    const r = readLedger(tmp.path)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('ledger_missing')
  })

  it('başlatma AYRI bir işlem — yazma yolu kendiliğinden oluşturmuyor', () => {
    expect(initLedgerFile(tmp.path)).toBe(true)
    // İkinci çağrı hiçbir şey yapmıyor: var olan defterin üstüne yazmak onu siler.
    expect(initLedgerFile(tmp.path)).toBe(false)
    const r = readLedger(tmp.path)
    expect(r.ok && r.entries).toEqual([])
  })

  it('yayınlanan içerik ikinci kez SORGULANDIĞINDA bulunuyor', () => {
    initLedgerFile(tmp.path)
    appendPublished(tmp.path, kayit('sha256:a'))
    const r = lookupPublished(tmp.path, 'sha256:a', 'instagram')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.entry?.externalId).toBe('ig_sha256:a')
  })

  it('AYNI digest FARKLI platformda yayınlanmamış sayılıyor', () => {
    initLedgerFile(tmp.path)
    appendPublished(tmp.path, kayit('sha256:a'))
    const r = lookupPublished(tmp.path, 'sha256:a', 'linkedin')
    expect(r.ok && r.entry).toBeNull()
  })

  // 🧪 Bozuk satır SESSİZCE atlanmıyor: atlansaydı bozulmuş bir defter "yayınlanmamış"
  // diye okunur ve içerik ikinci kez yayınlanırdı — defterin varlık sebebinin tersi.
  it('bozuk satır okumayı DURDURUYOR', () => {
    initLedgerFile(tmp.path)
    appendPublished(tmp.path, kayit('sha256:a'))
    appendFileSync(join(tmp.path, ledgerPath()), '{ bu json değil\n')
    const r = readLedger(tmp.path)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('unreadable')
    expect(r.error.kind === 'unreadable' && r.error.line).toBe(2)
  })

  it('alanı eksik satır da reddediliyor', () => {
    // Yol SÖZLEŞMEDEN alınıyor: `derived/runs` dizesini elle yazmak `manifest-yazici`
    // darboğazını çiğner ve defterin yolunu ikinci bir yere kopyalar.
    mkdirSync(dirname(join(tmp.path, ledgerPath())), { recursive: true })
    writeFileSync(join(tmp.path, ledgerPath()), '{"digest":"x"}\n')
    const r = readLedger(tmp.path)
    expect(r.ok).toBe(false)
  })

  it('defter append-only — ikinci kayıt birincisini silmiyor', () => {
    initLedgerFile(tmp.path)
    appendPublished(tmp.path, kayit('sha256:a'))
    appendPublished(tmp.path, kayit('sha256:b'))
    const r = readLedger(tmp.path)
    expect(r.ok && r.entries).toHaveLength(2)
  })

  it('okunamayan defterde sorgu HATA dönüyor — null DEĞİL', () => {
    // `null` "yayınlanmamış" demek olurdu ve okunamayan defter boş defterden farklıdır.
    const r = lookupPublished(tmp.path, 'sha256:a', 'instagram')
    expect(r.ok).toBe(false)
  })
})
