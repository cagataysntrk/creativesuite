// Token yenileme (§9.2 · §16 · FAZ-7.6).
import { describe, expect, it } from 'vitest'
import {
  META_TOKEN_OMRU_GUN,
  YENILEME_PAYI_GUN,
  durumMesaji,
  tokenDurumu,
  yayinaUygun,
  yeniKayit,
  yenilemeGerekli,
  yenilemeRaporu,
  type TokenKaydi,
} from './token-refresh.js'

const SIMDI = '2026-08-16T12:00:00.000Z'
const kayit = (expiresAt: string): TokenKaydi => ({
  provider: 'meta',
  expiresAt,
  obtainedAt: '2026-07-01T12:00:00.000Z',
  scopes: ['instagram_content_publish'],
})

describe('token durumu', () => {
  it('uzun ömürlü token OK', () => {
    const d = tokenDurumu(kayit('2026-10-01T12:00:00.000Z'), SIMDI)
    expect(d.kind).toBe('ok')
    expect(yayinaUygun(d)).toBe(true)
    expect(yenilemeGerekli(d)).toBe(false)
  })

  // 🧪 Yenileme SON güne bırakılmıyor: yedi günlük pay bir haftalık ihmali tolere ediyor.
  it('pay içindeki token YENİLE diyor ama yayını bloklamıyor', () => {
    const d = tokenDurumu(kayit('2026-08-20T12:00:00.000Z'), SIMDI)
    expect(d.kind).toBe('yenile')
    expect(yayinaUygun(d)).toBe(true)
    expect(yenilemeGerekli(d)).toBe(true)
    expect(YENILEME_PAYI_GUN).toBe(7)
  })

  // 🧪 Adımın kriteri: sahte süresi dolmuş token ile yayın dene → BLOKLANIYOR.
  it('ölmüş token yayını BLOKLUYOR — sessizce geçmiyor', () => {
    const d = tokenDurumu(kayit('2026-08-01T12:00:00.000Z'), SIMDI)
    expect(d.kind).toBe('olmus')
    expect(yayinaUygun(d)).toBe(false)
    expect(durumMesaji('meta', d)).toContain('BLOKLU')
  })

  // 🧪 Kaydı silmek, kontrolü kapatmanın en kolay yolu OLMAMALI.
  it('kayıt YOKSA yayın BLOKLU — bilinmeyen ömür uzun ömür değildir', () => {
    const d = tokenDurumu(null, SIMDI)
    expect(d.kind).toBe('bilinmiyor')
    expect(yayinaUygun(d)).toBe(false)
  })

  it('okunamayan tarih de BİLİNMİYOR', () => {
    const d = tokenDurumu(kayit('yarın'), SIMDI)
    expect(d.kind).toBe('bilinmiyor')
    expect(yayinaUygun(d)).toBe(false)
  })

  it('ölmüş token için de yenileme DENENİYOR — operatör hatayı görmeli', () => {
    expect(yenilemeGerekli(tokenDurumu(kayit('2026-08-01T12:00:00.000Z'), SIMDI))).toBe(true)
  })
})

describe('rapor', () => {
  it('kayıtsız sağlayıcı raporda BLOKLU görünüyor', () => {
    const r = yenilemeRaporu([kayit('2026-10-01T12:00:00.000Z')], ['meta', 'linkedin'], SIMDI)
    expect(r).toHaveLength(2)
    expect(r.find((x) => x.provider === 'meta')?.bloklu).toBe(false)
    const li = r.find((x) => x.provider === 'linkedin')
    expect(li?.bloklu).toBe(true)
    expect(li?.mesaj).toContain('BİLİNMİYOR')
  })
})

describe('yeni kayıt', () => {
  it('son kullanma sağlayıcının SÖYLEDİĞİNDEN hesaplanıyor, sabitten değil', () => {
    const k = yeniKayit('meta', ['s'], 60 * 86_400, SIMDI)
    expect(k.expiresAt).toBe('2026-10-15T12:00:00.000Z')
    expect(k.beklenendenKisa).toBe(false)
  })

  // 🧪 Meta 60 gün diyor; bir gün 45 derse ve biz 60 yazarsak, token ölmüşken
  // "15 gün var" deriz. Sapma bir BULGUDUR.
  it('beklenenden kısa ömür İŞARETLENİYOR', () => {
    const k = yeniKayit('meta', ['s'], 30 * 86_400, SIMDI)
    expect(k.beklenendenKisa).toBe(true)
    expect(META_TOKEN_OMRU_GUN).toBe(60)
  })

  it('kayıt SIR taşımıyor — token’ın kendisi yok', () => {
    const k = yeniKayit('meta', ['instagram_content_publish'], 60 * 86_400, SIMDI)
    expect(JSON.stringify(k)).not.toMatch(/EAA|token|secret/i)
  })
})
