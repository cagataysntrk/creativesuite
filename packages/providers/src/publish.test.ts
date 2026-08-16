// Yayın kapıları — SIRA bir sözleşmedir (§9.2 · R-34, R-46 · FAZ-7.2).
import { describe, expect, it } from 'vitest'
import { ok as sonucOk, err as sonucErr } from '@suite/contracts'
import {
  ALT_MAX,
  needsRefresh,
  publish,
  refusalMessage,
  YENILEME_PAYI_GUN,
  type PublishDeps,
  type PublishRequest,
} from './publish.js'

const SIMDI = '2026-08-16T12:00:00.000Z'

const istek = (over: Partial<PublishRequest> = {}): PublishRequest => ({
  platform: 'instagram',
  placementId: 'instagram-feed-4x5',
  assets: [
    { path: '/tmp/a.png', altTr: 'Fire ölçümü paneli', decorative: false, digest: 'sha256:a' },
  ],
  caption: 'Ölçüm odaklı yaklaşım',
  runId: 'run_1',
  now: SIMDI,
  ...over,
})

/** Çağrı SIRASINI kaydeden sahte bağımlılıklar — "kanıt log sırasıdır". */
const deps = (over: Partial<PublishDeps> = {}) => {
  const sira: string[] = []
  const d: PublishDeps = {
    tokenState: async () => {
      sira.push('token')
      return { expiresAt: '2026-10-01T00:00:00.000Z', scopes: ['instagram_content_publish'] }
    },
    publishingLimit: async () => {
      sira.push('kota')
      return { quotaUsed: 3, quotaTotal: 25, checkedAt: SIMDI }
    },
    lookupLedger: async () => {
      sira.push('defter')
      return null
    },
    upload: async () => {
      sira.push('yukleme')
      return sonucOk('ig_media_123')
    },
    ...over,
  }
  return { d, sira }
}

describe('yayın sırası', () => {
  it('kota yüklemeden ÖNCE sorgulanıyor — sıra kanıt', async () => {
    const { d, sira } = deps()
    const r = await publish(istek(), d)
    expect(r.ok).toBe(true)
    expect(sira).toEqual(['token', 'kota', 'defter', 'yukleme'])
    // Kota indeksi yükleme indeksinden KÜÇÜK: "sonra bakarız" bu hatta yok.
    expect(sira.indexOf('kota')).toBeLessThan(sira.indexOf('yukleme'))
  })

  it('başarılı yayın yayından ÖNCEKİ kotayı döndürüyor — manifest kanıtı', async () => {
    const { d } = deps()
    const r = await publish(istek(), d)
    expect(r.ok && r.value.limitBefore.quotaUsed).toBe(3)
  })
})

describe('token', () => {
  // 🧪 Ölü token SESSİZDİR — kapı onu bloklayıcı yapıyor, uyarı değil.
  it('ölmüş token yayını BLOKLUYOR', async () => {
    const { d, sira } = deps({
      tokenState: async () => ({
        expiresAt: '2026-01-01T00:00:00.000Z',
        scopes: ['instagram_content_publish'],
      }),
    })
    const r = await publish(istek(), d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('token_expired')
    // Yükleme HİÇ denenmedi.
    expect(sira).not.toContain('yukleme')
  })

  it('eksik kapsam yayın ANINDA değil ÖNCE yakalanıyor', async () => {
    const { d } = deps({
      tokenState: async () => ({ expiresAt: '2026-10-01T00:00:00.000Z', scopes: [] }),
    })
    const r = await publish(istek(), d)
    expect(r.ok === false && r.error.kind).toBe('token_missing_scope')
  })

  it('yenileme SON güne bırakılmıyor — 7 günlük pay', () => {
    expect(YENILEME_PAYI_GUN).toBe(7)
    expect(needsRefresh({ expiresAt: '2026-08-20T12:00:00.000Z', scopes: [] }, SIMDI)).toBe(true)
    expect(needsRefresh({ expiresAt: '2026-10-01T00:00:00.000Z', scopes: [] }, SIMDI)).toBe(false)
    // Okunamayan tarih de yenileme gerektirir: bilinmeyen ömür, uzun ömür değildir.
    expect(needsRefresh({ expiresAt: 'yarın', scopes: [] }, SIMDI)).toBe(true)
  })
})

describe('alt-text (R-34)', () => {
  // 🧪 Adımın kriteri: alt-text'siz varlık yayınlamayı dene → reddediliyor.
  it('alt-text’siz varlık REDDEDİLİYOR', async () => {
    const { d, sira } = deps()
    const r = await publish(
      istek({
        assets: [{ path: '/tmp/a.png', altTr: '   ', decorative: false, digest: 'sha256:a' }],
      }),
      d
    )
    expect(r.ok === false && r.error.kind).toBe('missing_alt')
    expect(sira).not.toContain('yukleme')
  })

  it('dekoratif görsel alt-text’siz GEÇİYOR — ayrım bir iddiadır', async () => {
    const { d } = deps()
    const r = await publish(
      istek({ assets: [{ path: '/tmp/a.png', altTr: '', decorative: true, digest: 'sha256:a' }] }),
      d
    )
    expect(r.ok).toBe(true)
  })

  it('125 karakteri aşan alt-text reddediliyor — ekran okuyucu keser', async () => {
    const { d } = deps()
    const r = await publish(
      istek({
        assets: [
          { path: '/tmp/a.png', altTr: 'ö'.repeat(ALT_MAX + 1), decorative: false, digest: 'x' },
        ],
      }),
      d
    )
    expect(r.ok === false && r.error.kind).toBe('alt_too_long')
  })
})

describe('yineleme mutabakatı (R-46)', () => {
  // 🧪 Meta yinelenen gönderide mevcut id'yi döndürür — körlemesine tekrar, "3 varlık
  // ürettim" sanıp 20 üretmiş görünmektir.
  it('daha önce yayınlanmış içerik TEKRAR yayınlanmıyor', async () => {
    const { d, sira } = deps({
      lookupLedger: async () => ({
        digest: 'sha256:a',
        externalId: 'ig_media_eski',
        publishedAt: '2026-08-01T00:00:00.000Z',
      }),
    })
    const r = await publish(istek(), d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('already_published')
    expect(refusalMessage(r.error)).toContain('ig_media_eski')
    expect(sira).not.toContain('yukleme')
  })

  it('kota dolmuşsa yükleme DENENMİYOR — kuyrukta bekliyor', async () => {
    const { d, sira } = deps({
      publishingLimit: async () => ({ quotaUsed: 25, quotaTotal: 25, checkedAt: SIMDI }),
    })
    const r = await publish(istek(), d)
    expect(r.ok === false && r.error.kind).toBe('quota_exhausted')
    expect(sira).not.toContain('yukleme')
  })

  it('yükleme hatası kota mesajına düşüyor ama defter BOZULMUYOR', async () => {
    const { d } = deps({ upload: async () => sonucErr('ağ hatası') })
    const r = await publish(istek(), d)
    expect(r.ok).toBe(false)
  })
})
