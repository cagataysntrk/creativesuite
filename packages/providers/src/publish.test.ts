// Yayın kapıları — SIRA bir sözleşmedir (§9.2 · R-34, R-46 · FAZ-7.2).
import { describe, expect, it } from 'vitest'
import { ok as sonucOk, err as sonucErr } from '@suite/contracts'
import {
  ALT_MAX,
  KAROSEL_TAVANI,
  needsRefresh,
  publish,
  refusalMessage,
  YENILEME_PAYI_GUN,
  type PublishAsset,
  type PublishDeps,
  type PublishRequest,
} from './publish.js'

const SIMDI = '2026-08-16T12:00:00.000Z'

const istek = (over: Partial<PublishRequest> = {}): PublishRequest => ({
  platform: 'instagram',
  placementId: 'instagram-feed-4x5',
  assets: [
    {
      path: '/tmp/a.jpg',
      altTr: 'Fire ölçümü paneli',
      decorative: false,
      digest: 'sha256:a',
      // İfşa gerekmiyor: muafiyet kapsamı (boyutlandırma/kırpma). Gerektiği durum
      // ayrı testte ölçülüyor — varsayılan fikstürü "hep ifşalı" yapmak, kapıyı
      // her testte çalıştırıp asıl testi görünmez kılardı.
      compliance: { disclosureRequired: false, stamped: false, visibleDisclosure: false },
    },
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
    rateGate: (cost) => {
      sira.push(`kova:${cost}`)
      return { allowed: true }
    },
    publishingLimit: async () => {
      sira.push('kota')
      return { quotaUsed: 3, quotaTotal: 25, checkedAt: SIMDI }
    },
    lookupLedger: async () => {
      sira.push('defter')
      return { ok: true, entry: null }
    },
    upload: async () => {
      sira.push('yukleme')
      return sonucOk('ig_media_123')
    },
    recordPublished: () => {
      sira.push('kaydet')
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
    // Kova İKİ kez: okuma (kota sorgusu) ve yazma (yükleme) ayrı puanlar (§9.2).
    // Kaydetme yüklemeden SONRA ve publish'in kendi işi — çağırana bırakılmıyor.
    expect(sira).toEqual(['token', 'kova:1', 'kota', 'defter', 'kova:3', 'yukleme', 'kaydet'])
    // Kota indeksi yükleme indeksinden KÜÇÜK: "sonra bakarız" bu hatta yok.
    expect(sira.indexOf('kota')).toBeLessThan(sira.indexOf('yukleme'))
    // Yazma kovası uploader'dan ÖNCE (§9.2) — "limiter uploader'dan önce oturur"
    // artık bir belge cümlesi değil, ölçülen bir sıra.
    expect(sira.indexOf('kova:3')).toBeLessThan(sira.indexOf('yukleme'))
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
        assets: [
          {
            path: '/tmp/a.jpg',
            altTr: '   ',
            decorative: false,
            digest: 'sha256:a',
            compliance: { disclosureRequired: false, stamped: false, visibleDisclosure: false },
          },
        ],
      }),
      d
    )
    expect(r.ok === false && r.error.kind).toBe('missing_alt')
    expect(sira).not.toContain('yukleme')
  })

  it('dekoratif görsel alt-text’siz GEÇİYOR — ayrım bir iddiadır', async () => {
    const { d } = deps()
    const r = await publish(
      istek({
        assets: [
          {
            path: '/tmp/a.jpg',
            altTr: '',
            decorative: true,
            digest: 'sha256:a',
            compliance: { disclosureRequired: false, stamped: false, visibleDisclosure: false },
          },
        ],
      }),
      d
    )
    expect(r.ok).toBe(true)
  })

  it('125 karakteri aşan alt-text reddediliyor — ekran okuyucu keser', async () => {
    const { d } = deps()
    const r = await publish(
      istek({
        assets: [
          {
            path: '/tmp/a.jpg',
            altTr: 'ö'.repeat(ALT_MAX + 1),
            decorative: false,
            digest: 'x',
            compliance: { disclosureRequired: false, stamped: false, visibleDisclosure: false },
          },
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
        ok: true,
        entry: {
          digest: 'sha256:a',
          externalId: 'ig_media_eski',
          publishedAt: '2026-08-01T00:00:00.000Z',
        },
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

  // 🧪 Yükleme hatası KOTA diye raporlanamaz (denetim M1). Eski davranış operatöre
  // "kota doldu (3/25) — kuyrukta bekliyor" diyordu; oysa ağ hatası ve beklemekle
  // geçmez. Yanlış teşhis, teşhis olmamasından kötüdür.
  it('yükleme hatası GERÇEK hatayı taşıyor ve deftere YAZILMIYOR', async () => {
    const { d, sira } = deps({ upload: async () => sonucErr('ağ hatası') })
    const r = await publish(istek(), d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('upload_failed')
    expect(refusalMessage(r.error)).toContain('ağ hatası')
    expect(refusalMessage(r.error)).not.toContain('kota')
    // Yayın olmadıysa defter satırı da olmaz: yazılsaydı, olmayan bir yayın
    // gelecekteki gerçek yayını `already_published` diye bloklardı.
    expect(sira).not.toContain('kaydet')
  })

  // 🧪 Defter OKUNAMIYORSA yayın durur (denetim B3). Eski tip bunu ifade edemiyordu:
  // `LedgerEntry | null` içinde `null` hem "yayınlanmamış" hem "okunamadı" demekti.
  it('defter okunamıyorsa yayın DURUR — "yayınlanmamış" sayılmıyor', async () => {
    const { d, sira } = deps({
      lookupLedger: async () => ({ ok: false, reason: 'unreadable', detay: '3. satır bozuk' }),
    })
    const r = await publish(istek(), d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('ledger_unavailable')
    expect(sira).not.toContain('yukleme')
  })

  // 🧪 Oran kovası boşsa yükleme DENENMEZ ve bu "kota" ile karıştırılmaz: kota
  // sağlayıcının sınırı, kova bizimki. İkisi aynı mesaja düşerse operatör yanlış
  // yerde bekler.
  it('oran kovası boşsa yükleme DENENMİYOR ve kotadan AYRI raporlanıyor', async () => {
    const { d, sira } = deps({ rateGate: () => ({ allowed: false, retryAfterMs: 1500 }) })
    const r = await publish(istek(), d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('rate_limited')
    expect(refusalMessage(r.error)).toContain('KOTA değil')
    expect(sira).not.toContain('yukleme')
  })
})

// 🧪 EU AI Act Md. 50 (§11.3 · FAZ-8.3) — **2 Ağu 2026'dan beri uygulanabilir**.
// Alt-text ile aynı sınıf: yayınlanmış bir postun ifşası sonradan eklenemez.
describe('AI ifşası', () => {
  const ifsali = (c: Partial<PublishAsset['compliance']>) =>
    istek({
      assets: [
        {
          path: '/tmp/a.jpg',
          altTr: 'Ölçüm paneli',
          decorative: false,
          digest: 'sha256:a',
          compliance: {
            disclosureRequired: true,
            stamped: true,
            visibleDisclosure: true,
            ...c,
          },
        },
      ],
    })

  it('ifşa gerekli ama makine-okunur damga yoksa yayın DURUYOR', async () => {
    const { d, sira } = deps()
    const r = await publish(ifsali({ stamped: false }), d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('disclosure_missing')
    expect(refusalMessage(r.error)).toContain('Md. 50(2)')
    expect(sira).not.toContain('yukleme')
  })

  it('görünür ifşa katmanı yoksa yayın DURUYOR', async () => {
    const { d } = deps()
    const r = await publish(ifsali({ visibleDisclosure: false }), d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind === 'disclosure_missing' && r.error.eksik).toBe('visible')
  })

  // **Muafiyet gerçek ve dar okunmamalı:** yeniden boyutlandırma, kırpma, renk
  // düzeltme ifşa tetiklemiyor. Her varlığa ifşa şeridi koymak, kuralı olmadığı
  // yere taşımak olurdu.
  it('ifşa gerekmiyorsa damga da katman da ARANMIYOR', async () => {
    const { d } = deps()
    const r = await publish(
      ifsali({ disclosureRequired: false, stamped: false, visibleDisclosure: false }),
      d
    )
    expect(r.ok).toBe(true)
  })
})

// ── API sözleşmesi: 10 slayt, yalnız JPEG (R-90) ────────────────────────────
//
// ⚠ ⚠ **İKİSİ DE YOKTU ve ikisi de YAYIN ANINDA patlayacaktı** — yani dört görsel
// üretildikten, bir insan onayladıktan ve kota harcandıktan sonra. Meta dokümanı
// (30 Haz 2026 güncel) ikisini de açıkça yazıyor.
describe('API sözleşmesi', () => {
  const varlik = (path: string): PublishAsset => ({
    path,
    altTr: 'Ölçüm görseli',
    decorative: false,
    digest: 'sha256:' + path,
    compliance: { disclosureRequired: false, stamped: false, visibleDisclosure: false },
  })

  it('11 slayt REDDEDİLİYOR — uygulama 20 kabul ediyor ama yolumuz API', async () => {
    const d = deps()
    const r = await publish(
      istek({
        assets: Array.from({ length: KAROSEL_TAVANI + 1 }, (_, i) =>
          varlik(`/tmp/s${String(i)}.jpg`)
        ),
      }),
      d.d
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('too_many_assets')
    // ⚠ Yükleyici HİÇ çağrılmadı: sözleşme ihlali yükleme yolunun ÖNÜNDE.
    expect(d.sira).not.toContain('upload')
  })

  it('tam 10 slayt GEÇİYOR — tavan dahil', async () => {
    const r = await publish(
      istek({
        assets: Array.from({ length: KAROSEL_TAVANI }, (_, i) => varlik(`/tmp/s${String(i)}.jpg`)),
      }),
      deps().d
    )
    expect(r.ok).toBe(true)
  })

  it('PNG REDDEDİLİYOR — API yalnız JPEG kabul ediyor', async () => {
    const d = deps()
    const r = await publish(istek({ assets: [varlik('/tmp/slayt-01.png')] }), d.d)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.kind).toBe('unsupported_format')
    expect(d.sira).not.toContain('upload')
  })

  it('ret mesajı NEDEN olduğunu söylüyor — düzeltecek kişi yolu bilmeli', () => {
    expect(refusalMessage({ kind: 'too_many_assets', count: 11, max: 10 })).toMatch(/API tavanı 10/)
    expect(refusalMessage({ kind: 'unsupported_format', path: '/tmp/a.png' })).toMatch(/JPEG/)
  })
})
