// Defter ↔ yayıncı bağlanması (§9.2 · R-46 · FAZ-7.2, FAZ-7.4).
//
// **Girdiyi ÜRETİM üretir, tüketiciye o verilir.** Bu testin ilk hâli `PublishDeps`i
// KENDİ kuruyordu — defteri yayıncıya bağlayan adaptör yalnız burada vardı ve üretimde
// eşi yoktu. Yani test, kendi kurduğu köprüyü ölçüyordu (FAZ-7 denetimi, B3).
//
// Artık köprü `publishBody`de ve bu test onu **çağırıyor**: fiil gövdesi çalışır,
// gerçek defter okunur, gerçek defter yazılır. Köprü bozulursa bu test kırmızıya döner;
// önceki hâlinde köprü hiç olmasa bile yeşil kalırdı.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeTempDir, type TempDir } from '@suite/kernel/testing'
import { ok as sonucOk, err as sonucErr } from '@suite/contracts'
import { publishBody, type PublishBodyDeps } from './verbs/bodies.js'
import { RateLimiter } from './ratelimit.js'
import { appendPublished, initLedgerFile, lookupPublished, readLedger } from './publish-ledger.js'
import { systemClock, systemRng } from '@suite/kernel'
import type { BrandId, CorrelationId, EraId, RunId, StepId } from '@suite/contracts'

let tmp: TempDir
beforeEach(() => {
  tmp = makeTempDir('suite-yayin-')
})
afterEach(() => tmp.cleanup())

const SIMDI = '2026-08-16T12:00:00.000Z'
const DIGEST = 'sha256:deck'

/** `RENDER` çıktısının GERÇEK şekli — gövde varlıkları buradan topluyor. */
const renderCiktisi = {
  assets: [
    {
      path: '/tmp/a.png',
      altTr: 'Fire ölçümü paneli',
      decorative: false,
      digest: DIGEST,
      compliance: { disclosureRequired: false, stamped: true, visibleDisclosure: true },
    },
  ],
}

const govdeDeps = (yuklendi: string[], over: Partial<PublishBodyDeps> = {}): PublishBodyDeps => ({
  repoRoot: tmp.path,
  limiter: new RateLimiter(),
  tokenKaydi: () => ({
    provider: 'meta',
    expiresAt: '2026-10-01T00:00:00.000Z',
    obtainedAt: '2026-08-01T00:00:00.000Z',
    scopes: ['instagram_content_publish'],
  }),
  publishingLimit: async () => ({ quotaUsed: 1, quotaTotal: 25, checkedAt: SIMDI }),
  upload: async () => {
    yuklendi.push('yükleme')
    return sonucOk('ig_media_yeni')
  },
  ...over,
})

const ctx = () => ({
  runId: 'run_yayin' as RunId,
  stepId: 'yayinla' as StepId,
  brandId: 'brd_upcytech' as BrandId,
  eraId: 'imalat-2026' as EraId,
  correlationId: 'cor_test' as CorrelationId,
  clock: systemClock,
  rng: systemRng,
})

const kosLocal = async (yuklendi: string[], over: Partial<PublishBodyDeps> = {}) => {
  const fiil = publishBody(govdeDeps(yuklendi, over))
  return fiil.run(
    ctx() as never,
    {
      constraints: { platform: 'instagram', placementId: 'instagram-feed-4x5', caption: 'Ölçüm' },
      inputs: { render: renderCiktisi },
    } as never
  )
}

describe('PUBLISH fiili ↔ defter', () => {
  it('boş defterde ilk yayın GEÇİYOR ve defteri FİİL yazıyor', async () => {
    initLedgerFile(tmp.path)
    const yuklendi: string[] = []
    const r = await kosLocal(yuklendi)
    expect(r.ok).toBe(true)
    expect(yuklendi).toEqual(['yükleme'])

    // **Defteri test yazmıyor.** Önceki hâlde bu satırları test kendisi yazıyordu ve
    // "yazıldı mı" diye kendine soruyordu; üretimde yazan kimse yoktu (B4).
    const defter = readLedger(tmp.path)
    expect(defter.ok && defter.entries).toHaveLength(1)
    expect(defter.ok && defter.entries[0]!.externalId).toBe('ig_media_yeni')
    // Defterdeki anahtar YAYINI tanımlar, tek bir görseli değil (M1): platform,
    // yerleşim, TÜM varlıklar ve metin birlikte. Varlık digest'i onun bir parçası.
    expect(defter.ok && defter.entries[0]!.digest).toContain(DIGEST)
    expect(defter.ok && defter.entries[0]!.digest).toContain('instagram')
  })

  // 🧪 Aynı postu iki kez gönder → ikincisi defterce yakalanıyor ve KANAL ÇAĞRISI
  // YAPILMIYOR. Meta yinelenmede mevcut id'yi döndürüyor; çağrı yapılsaydı "başardım"
  // sanılırdı.
  it('aynı içerik İKİNCİ kez yayınlanmıyor ve kanal çağrısı YAPILMIYOR', async () => {
    initLedgerFile(tmp.path)
    // İlk yayın GERÇEKTEN koşuyor — defter satırını üretim yazıyor, test değil.
    expect((await kosLocal([])).ok).toBe(true)
    const yuklendi: string[] = []
    const r = await kosLocal(yuklendi)
    expect(r.ok).toBe(false)
    expect(yuklendi).toEqual([])
  })

  // 🧪 M1 (2. doğrulama turu): aynı kapak görseli + FARKLI metin = FARKLI yayın.
  // Eski anahtar yalnız `assets[0].digest` idi ve hiç yayınlanmamış içeriği
  // "zaten yayında" diye blokluyordu — operatöre bir OLGU gibi sunulan bir yanlış.
  it('aynı görsel + farklı metin AYRI yayındır, bloklanmıyor', async () => {
    initLedgerFile(tmp.path)
    expect((await kosLocal([])).ok).toBe(true)

    const fiil = publishBody(govdeDeps([]))
    const r = await fiil.run(
      ctx() as never,
      {
        constraints: { platform: 'instagram', placementId: 'instagram-feed-4x5', caption: 'BAŞKA' },
        inputs: { render: renderCiktisi },
      } as never
    )
    expect(r.ok).toBe(true)
    const d = readLedger(tmp.path)
    expect(d.ok && d.entries).toHaveLength(2)
  })

  // 🧪 Defteri sil → yayın DURUR (D-38: defter türetilemez). Artık `already_published`
  // sentineli YOK: gövde `ledger_unavailable`ı olduğu gibi taşıyor.
  it('defter YOKSA yayın durur — "boş defter" sayılmıyor', async () => {
    const yuklendi: string[] = []
    const r = await kosLocal(yuklendi)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('PUBLISH_REFUSED')
    expect(r.error.details?.['kind']).toBe('ledger_unavailable')
    expect(yuklendi).toEqual([])
    // Yayın olmadıysa defter de oluşmaz — "durdum" diyen bir yol, sessizce dosya
    // yaratmamalı.
    expect(readLedger(tmp.path).ok).toBe(false)
  })

  // 🧪 Kanal bağlı DEĞİLSE sessiz başarı YOK (7.2b insan girdisi bekliyor).
  it('yükleyici yoksa fiil AÇIKÇA duruyor, "yayınlandı" saymıyor', async () => {
    initLedgerFile(tmp.path)
    const fiil = publishBody({
      repoRoot: tmp.path,
      limiter: new RateLimiter(),
      tokenKaydi: () => null,
    })
    const r = await fiil.run(
      ctx() as never,
      {
        constraints: { platform: 'instagram' },
        inputs: { render: renderCiktisi },
      } as never
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('CHANNEL_NOT_CONNECTED')
    const d = readLedger(tmp.path)
    expect(d.ok && d.entries).toHaveLength(0)
  })

  // 🧪 Yükleme hatası deftere YAZILMAZ — yazılsaydı olmayan bir yayın, gelecekteki
  // gerçek yayını `already_published` diye bloklardı.
  it('yükleme başarısızsa deftere yazılmıyor', async () => {
    initLedgerFile(tmp.path)
    const r = await kosLocal([], { upload: async () => sonucErr('ağ hatası') })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.details?.['kind']).toBe('upload_failed')
    expect(String(r.error.details?.['mesaj'])).toContain('ağ hatası')
    const d = readLedger(tmp.path)
    expect(d.ok && d.entries).toHaveLength(0)
  })

  // 🧪 Oran kovası: yazma 3 puan. Kovayı boşaltıp yayın dene → uploader ÇAĞRILMIYOR.
  // "Limiter uploader'dan önce oturur" artık ölçülen bir davranış.
  it('oran kovası boşken yükleyici ÇAĞRILMIYOR', async () => {
    initLedgerFile(tmp.path)
    const limiter = new RateLimiter({ capacity: 1, refillPerSecond: 0 })
    const yuklendi: string[] = []
    const r = await kosLocal(yuklendi, { limiter })
    expect(r.ok).toBe(false)
    if (r.ok) return
    // Okuma (1 puan) kovayı boşaltıyor; yazma (3 puan) izin alamıyor.
    expect(r.error.details?.['kind']).toBe('rate_limited')
    expect(yuklendi).toEqual([])
  })

  it('lookupPublished platform ayrımını koruyor', () => {
    initLedgerFile(tmp.path)
    appendPublished(tmp.path, {
      digest: DIGEST,
      platform: 'linkedin',
      externalId: 'li_1',
      runId: 'run_0',
      publishedAt: SIMDI,
    })
    const r = lookupPublished(tmp.path, DIGEST, 'instagram')
    expect(r.ok && r.entry).toBeNull()
  })
})

// 🧪 FAZ-8.3: uyum kaydı EKSİKSE ne olur? "İfşa gerekmiyor" varsayımı, alan eklemeyi
// unutan bir üreticinin ifşa kapısını sessizce kapatması demekti — kapının en çok
// gerektiği yerde kapanması. Bilinmeyen ifşa durumu, ifşa GEREKTİRİR (D-175).
describe('uyum kaydı eksikse', () => {
  it('ifşa GEREKLİ varsayılıyor ve yayın duruyor', async () => {
    initLedgerFile(tmp.path)
    const yuklendi: string[] = []
    const fiil = publishBody(govdeDeps(yuklendi))
    const r = await fiil.run(
      ctx() as never,
      {
        constraints: { platform: 'instagram', placementId: 'instagram-feed-4x5', caption: 'Ölçüm' },
        // `compliance` alanı YOK — eski bir üretici ya da eksik bir çıktı.
        inputs: {
          render: {
            assets: [
              {
                path: '/tmp/a.png',
                altTr: 'Fire ölçümü paneli',
                decorative: false,
                digest: DIGEST,
              },
            ],
          },
        },
      } as never
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.details?.['kind']).toBe('disclosure_missing')
    expect(yuklendi).toEqual([])
  })
})
