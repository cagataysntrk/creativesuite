// Defter ↔ yayıncı bağlanması (§9.2 · R-46 · FAZ-7.4).
//
// **Girdiyi ÜRETİM üretir, tüketiciye o verilir** (FAZ 6 dersi): `lookupLedger` bir
// bağımlılıktı ve gerçek defteri yoktu. Bu test elle fikstür yazmıyor — gerçek deftere
// gerçek `appendPublished` ile yazıp gerçek `publish` çağrısına bağlıyor.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import { ok as sonucOk } from '@suite/contracts'
import { publish, type PublishDeps, type PublishRequest } from '@suite/providers'
import { appendPublished, initLedgerFile, lookupPublished } from './publish-ledger.js'

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-yayin-')
})
afterEach(() => tmp.cleanup())

const SIMDI = '2026-08-16T12:00:00.000Z'
const DIGEST = 'sha256:deck'

const istek = (): PublishRequest => ({
  platform: 'instagram',
  placementId: 'instagram-feed-4x5',
  assets: [{ path: '/tmp/a.png', altTr: 'Fire ölçümü paneli', decorative: false, digest: DIGEST }],
  caption: 'Ölçüm odaklı yaklaşım',
  runId: 'run_1',
  now: SIMDI,
})

/** `lookupLedger` GERÇEK deftere bağlanıyor — sahte bir fonksiyon değil. */
const deps = (yuklendi: string[]): PublishDeps => ({
  tokenState: async () => ({
    expiresAt: '2026-10-01T00:00:00.000Z',
    scopes: ['instagram_content_publish'],
  }),
  publishingLimit: async () => ({ quotaUsed: 1, quotaTotal: 25, checkedAt: SIMDI }),
  lookupLedger: async (digest) => {
    const r = lookupPublished(tmp.path, digest, 'instagram')
    // Defter okunamıyorsa yayın DURMALI: `null` dönmek "yayınlanmamış" demek olurdu.
    if (!r.ok) return { digest, externalId: 'DEFTER_OKUNAMADI', publishedAt: SIMDI }
    return r.entry
  },
  upload: async () => {
    yuklendi.push('yükleme')
    return sonucOk('ig_media_yeni')
  },
})

describe('defter ↔ yayıncı', () => {
  it('boş defterde ilk yayın GEÇİYOR ve deftere yazılıyor', async () => {
    initLedgerFile(tmp.path)
    const yuklendi: string[] = []
    const r = await publish(istek(), deps(yuklendi))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(yuklendi).toEqual(['yükleme'])

    appendPublished(tmp.path, {
      digest: DIGEST,
      platform: 'instagram',
      externalId: r.value.externalId,
      runId: 'run_1',
      publishedAt: SIMDI,
    })
    expect(lookupPublished(tmp.path, DIGEST, 'instagram')).toMatchObject({ ok: true })
  })

  // 🧪 Adımın kriteri: aynı postu iki kez gönder → ikincisi defterce yakalanıyor ve
  // KANAL ÇAĞRISI YAPILMIYOR. Meta yinelenmede mevcut id'yi döndürüyor; çağrı
  // yapılsaydı "başardım" sanılırdı.
  it('aynı içerik İKİNCİ kez yayınlanmıyor ve kanal çağrısı YAPILMIYOR', async () => {
    initLedgerFile(tmp.path)
    appendPublished(tmp.path, {
      digest: DIGEST,
      platform: 'instagram',
      externalId: 'ig_media_eski',
      runId: 'run_0',
      publishedAt: '2026-08-01T00:00:00.000Z',
    })
    const yuklendi: string[] = []
    const r = await publish(istek(), deps(yuklendi))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('already_published')
    expect(yuklendi).toEqual([])
  })

  // 🧪 Defteri sil → yayın DURUR (D-38: defter türetilemez).
  it('defter YOKSA yayın durur — "boş defter" sayılmıyor', async () => {
    // `initLedgerFile` çağrılmadı: defter hiç yok.
    const yuklendi: string[] = []
    const r = await publish(istek(), deps(yuklendi))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('already_published')
    expect(r.error.kind === 'already_published' && r.error.externalId).toBe('DEFTER_OKUNAMADI')
    expect(yuklendi).toEqual([])
  })
})
