// OAuth akışı ve kapsam sözleşmesi (§9.2 · §9.3 · §14 · FAZ-7.5).
import { describe, expect, it } from 'vitest'
import { csrfToken } from '@suite/kernel'
import {
  ENV_KEYS,
  LINKEDIN_SCOPES,
  META_SCOPES,
  SCOPES,
  STATE_MIN,
  authorizeUrl,
  isOAuthRefusal,
  oauthEnvDurumu,
  oauthRefusalMessage,
  verifyCallback,
} from './oauth.js'

const STATE = csrfToken()

describe('kapsam sözleşmesi', () => {
  it('her kapsam GEREKÇE taşıyor — gerekçesiz izin istenmez', () => {
    for (const p of ['meta', 'linkedin'] as const) {
      for (const s of SCOPES[p]) {
        expect(s.scope.length).toBeGreaterThan(0)
        expect(s.reason.length).toBeGreaterThan(20)
      }
    }
  })

  it('LinkedIn yalnız KİŞİSEL profil paylaşımı istiyor', () => {
    const adlar = LINKEDIN_SCOPES.map((s) => s.scope)
    expect(adlar).toContain('w_member_social')
    // Şirket sayfası kapsamı İSTENMİYOR: istenmeyen izin, korunması gerekmeyen izin.
    expect(adlar.some((a) => a.includes('organization'))).toBe(false)
  })

  it('Meta yayın kapsamı ve insight kapsamı ayrı', () => {
    const adlar = META_SCOPES.map((s) => s.scope)
    expect(adlar).toContain('instagram_content_publish')
    expect(adlar).toContain('pages_read_engagement')
  })
})

describe('yetkilendirme URL’i', () => {
  const girdi = {
    provider: 'meta' as const,
    clientId: '1234567890',
    redirectUri: 'https://ornek.gecersiz/oauth/meta',
    state: STATE,
  }

  it('kapsamları ve state’i taşıyor', () => {
    const u = authorizeUrl(girdi)
    expect(isOAuthRefusal(u)).toBe(false)
    if (isOAuthRefusal(u)) return
    const url = new URL(u)
    expect(url.searchParams.get('state')).toBe(STATE)
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('scope')).toContain('instagram_content_publish')
  })

  it('LinkedIn kapsamları BOŞLUKLA, Meta VİRGÜLLE ayrılıyor', () => {
    const meta = authorizeUrl(girdi)
    const li = authorizeUrl({ ...girdi, provider: 'linkedin' })
    if (isOAuthRefusal(meta) || isOAuthRefusal(li)) return
    expect(new URL(meta).searchParams.get('scope')).toContain(',')
    expect(new URL(li).searchParams.get('scope')).toContain(' ')
  })

  // 🧪 Düz HTTP bir yetkilendirme kodu taşımak, kodu ağdaki herkese vermektir.
  it('HTTP redirect REDDEDİLİYOR, localhost hariç', () => {
    const r = authorizeUrl({ ...girdi, redirectUri: 'http://ornek.gecersiz/cb' })
    expect(isOAuthRefusal(r) && r.kind).toBe('insecure_redirect')
    // Yerel kurulum akışı meşru.
    expect(
      isOAuthRefusal(authorizeUrl({ ...girdi, redirectUri: 'http://localhost:8787/cb' }))
    ).toBe(false)
  })

  it('kısa state REDDEDİLİYOR — tahmin edilebilir olurdu', () => {
    const r = authorizeUrl({ ...girdi, state: 'kisa' })
    expect(isOAuthRefusal(r) && r.kind).toBe('state_too_short')
    expect(STATE_MIN).toBeGreaterThanOrEqual(32)
  })
})

describe('geri dönüş doğrulaması', () => {
  it('doğru state ve kod GEÇİYOR', () => {
    const r = verifyCallback({
      expectedState: STATE,
      receivedState: STATE,
      code: 'auth_kodu',
      error: null,
    })
    expect(r).toBe('auth_kodu')
  })

  // 🧪 CSRF: state eşleşmezse bu cevap bizim başlattığımız akışa ait DEĞİL.
  it('state eşleşmezse REDDEDİLİYOR', () => {
    const r = verifyCallback({
      expectedState: STATE,
      receivedState: csrfToken(),
      code: 'auth_kodu',
      error: null,
    })
    expect(isOAuthRefusal(r) && r.kind).toBe('state_mismatch')
    expect(isOAuthRefusal(r) && oauthRefusalMessage(r)).toContain('CSRF')
  })

  it('sağlayıcı hatası state kontrolünden ÖNCE — sıra önemli', () => {
    const r = verifyCallback({
      expectedState: STATE,
      receivedState: 'yanlis',
      code: null,
      error: 'access_denied',
    })
    // Hata önce dönüyor ama state kontrolü ATLANMIYOR: hatalı cevapta kod da yok.
    expect(isOAuthRefusal(r) && r.kind).toBe('provider_error')
  })

  it('state’siz cevap REDDEDİLİYOR', () => {
    const r = verifyCallback({
      expectedState: STATE,
      receivedState: null,
      code: 'k',
      error: null,
    })
    expect(isOAuthRefusal(r) && r.kind).toBe('state_missing')
  })

  it('kodsuz cevap REDDEDİLİYOR', () => {
    const r = verifyCallback({
      expectedState: STATE,
      receivedState: STATE,
      code: '',
      error: null,
    })
    expect(isOAuthRefusal(r) && r.kind).toBe('code_missing')
  })
})

describe('ortam sözleşmesi', () => {
  it('eksik değişkenler ADLARIYLA raporlanıyor', () => {
    const d = oauthEnvDurumu('meta', {})
    expect(d.hazir).toBe(false)
    expect(d.eksik).toEqual([ENV_KEYS.meta.id, ENV_KEYS.meta.secret])
  })

  it('yer tutucu DEĞER SAYILMIYOR', () => {
    const d = oauthEnvDurumu('linkedin', {
      LINKEDIN_CLIENT_ID: 'doldurulacak',
      LINKEDIN_CLIENT_SECRET: '   ',
    })
    expect(d.hazir).toBe(false)
    expect(d.eksik).toHaveLength(2)
  })

  it('gerçek değerlerle HAZIR', () => {
    const d = oauthEnvDurumu('meta', { META_APP_ID: '123', META_APP_SECRET: 'abc' })
    expect(d.hazir).toBe(true)
    expect(d.eksik).toEqual([])
  })
})

describe('CSRF token’ı', () => {
  it('her çağrıda FARKLI — seed’li olsaydı tahmin edilebilirdi', () => {
    const a = csrfToken()
    const b = csrfToken()
    expect(a).not.toBe(b)
    expect(a.length).toBeGreaterThanOrEqual(STATE_MIN)
  })

  it('URL güvenli karakterler — base64url', () => {
    expect(csrfToken()).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})
