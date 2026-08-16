// OAuth — yetkilendirme akışı ve KAPSAM sözleşmesi (§9.2 · §9.3 · §14 · R-51 · FAZ-7.5).
//
// **Kapsamlar gerekçeleriyle KODDA duruyor.** "Hangi izni neden istedik" sorusunun altı
// ay sonraki tek cevabı bu tablo. Gerekçesiz bir kapsam, bir gün "acaba gerekli mi" diye
// bakılıp ya gereksizce tutulur ya da kaldırılıp yayın hattını kırar.
//
// **Bu dosya AĞA ÇIKMAZ ve SECRET OKUMAZ.** İstemci kimliği çağırandan gelir; secret'lar
// yalnız `sops exec-env` üzerinden ortama iner ve `readEnv` ile okunur (R-51 · `secret-okuyucu`
// darboğazı). Burada olan tek şey URL kurmak ve cevabı DOĞRULAMAK.
//
// **App Review kendi işletmen için gerekmiyor** (D-3): Meta'nın kendi dokümantasyonu,
// uygulama yalnız sahip olunan bir işletmeye hizmet ediyorsa incelemeyi "gerekli değil"
// sayıyor. Ekosistemdeki en yaygın yanlış inanış bu ve Instagram'ı bizim için
// self-servis yapan şey.

import { secretEquals } from '@suite/kernel'

export type OAuthProvider = 'meta' | 'linkedin'

export interface ScopeSpec {
  readonly scope: string
  /** Bu izni NEDEN istiyoruz. Boş bırakılamaz — gerekçesiz kapsam istenmez. */
  readonly reason: string
}

/**
 * Meta kapsamları. **App Review gerekmiyor** (D-3) ama kapsamlar yine de dar tutuluyor:
 * istemediğin bir izin, sızdığında sorumlu olduğun bir izindir.
 */
export const META_SCOPES: readonly ScopeSpec[] = [
  {
    scope: 'instagram_content_publish',
    reason: 'IG feed/carousel/Reels/Stories yayını — hattın var olma sebebi',
  },
  {
    scope: 'instagram_basic',
    reason: 'hesap kimliği ve medya id doğrulaması; yinelenme mutabakatı bunu okuyor (R-46)',
  },
  {
    scope: 'pages_read_engagement',
    reason: 'insight anlık görüntüleri (FAZ-7.8) — IG hesap insight’ları 90 günde kayboluyor',
  },
]

/**
 * LinkedIn kapsamları. `w_member_social` **kişisel profil** paylaşımı içindir; şirket
 * sayfası ayrı bir kapsam ister ve bugün istenmiyor — istenmeyen izin, korunması
 * gerekmeyen izindir.
 */
export const LINKEDIN_SCOPES: readonly ScopeSpec[] = [
  {
    scope: 'w_member_social',
    reason: 'metin, görsel ve DÖKÜMAN postu — döküman formatını hiçbir aggregator vermiyor (§9.3)',
  },
  {
    scope: 'r_liteprofile',
    reason: 'yazar URN’si; post gövdesi `author` alanını zorunlu kılıyor',
  },
]

export const SCOPES: Record<OAuthProvider, readonly ScopeSpec[]> = {
  meta: META_SCOPES,
  linkedin: LINKEDIN_SCOPES,
}

/** Yetkilendirme uçları. Sürüm sabitleri adaptörlerde; burası yalnız yetkilendirme. */
const AUTHORIZE_URL: Record<OAuthProvider, string> = {
  meta: 'https://www.facebook.com/v21.0/dialog/oauth',
  linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
}

/**
 * Ortam değişkeni adları — **açık sözleşme**.
 *
 * "Hangi değişken gerekiyor" sorusu ancak tek bir listeden cevaplanabilir; dağılmış
 * `process.env` okumaları bir ay ihmalden sonra sistemi başlatamamanın en sık sebebi
 * (§16 · `secret-okuyucu` darboğazının gerekçesi).
 */
export const ENV_KEYS: Record<OAuthProvider, { readonly id: string; readonly secret: string }> = {
  meta: { id: 'META_APP_ID', secret: 'META_APP_SECRET' },
  linkedin: { id: 'LINKEDIN_CLIENT_ID', secret: 'LINKEDIN_CLIENT_SECRET' },
}

export interface AuthorizeInput {
  readonly provider: OAuthProvider
  readonly clientId: string
  readonly redirectUri: string
  /**
   * CSRF token'ı — **çağıran üretir** (`csrfToken()`), bu modül değil.
   *
   * Ayrım bilinçli: state oturumda saklanıp geri dönüşte karşılaştırılmalı ve bu
   * modülün oturumu yok. Kendi üretseydi, doğrulayacak tarafın onu nereden bulacağı
   * belirsiz kalırdı.
   */
  readonly state: string
}

export type OAuthRefusal =
  | { readonly kind: 'state_missing' }
  | { readonly kind: 'state_too_short'; readonly length: number }
  | { readonly kind: 'state_mismatch' }
  | { readonly kind: 'provider_error'; readonly error: string }
  | { readonly kind: 'code_missing' }
  | { readonly kind: 'insecure_redirect'; readonly uri: string }

/** State için asgari uzunluk. Kısa bir state, tahmin edilebilir bir state'tir. */
export const STATE_MIN = 32

/**
 * Yetkilendirme URL'ini kurar — **veya reddeder**.
 *
 * `redirect_uri` HTTPS olmak zorunda (`localhost` hariç: yerel kurulum akışı). Düz HTTP
 * bir yetkilendirme kodu taşımak, kodu ağdaki herkese vermektir.
 */
export const authorizeUrl = (input: AuthorizeInput): string | OAuthRefusal => {
  if (input.state === '') return { kind: 'state_missing' }
  if (input.state.length < STATE_MIN) {
    return { kind: 'state_too_short', length: input.state.length }
  }
  let u: URL
  try {
    u = new URL(input.redirectUri)
  } catch {
    return { kind: 'insecure_redirect', uri: input.redirectUri }
  }
  const yerel = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
  if (u.protocol !== 'https:' && !yerel) {
    return { kind: 'insecure_redirect', uri: input.redirectUri }
  }

  const url = new URL(AUTHORIZE_URL[input.provider])
  url.searchParams.set('client_id', input.clientId)
  url.searchParams.set('redirect_uri', input.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', input.state)
  url.searchParams.set(
    'scope',
    SCOPES[input.provider].map((s) => s.scope).join(input.provider === 'meta' ? ',' : ' ')
  )
  return url.toString()
}

export interface CallbackInput {
  /** Oturumda saklanan state. */
  readonly expectedState: string
  /** Sağlayıcıdan dönen sorgu parametreleri. */
  readonly receivedState: string | null
  readonly code: string | null
  readonly error: string | null
}

/**
 * Geri dönüşü doğrular.
 *
 * **Sıra önemli:** önce sağlayıcı hatası, sonra state, en son kod. State'i en sona
 * bırakmak, hatalı bir cevapta CSRF kontrolünü atlamak olurdu.
 *
 * Karşılaştırma **sabit sürede** (`secretEquals`): düz `===` ilk farklı baytta döner ve
 * süre farkı saldırgana doğru ön eki karakter karakter aratır.
 */
export const verifyCallback = (input: CallbackInput): string | OAuthRefusal => {
  if (input.error !== null && input.error !== '') {
    return { kind: 'provider_error', error: input.error }
  }
  if (input.receivedState === null || input.receivedState === '') {
    return { kind: 'state_missing' }
  }
  if (!secretEquals(input.expectedState, input.receivedState)) {
    return { kind: 'state_mismatch' }
  }
  if (input.code === null || input.code === '') return { kind: 'code_missing' }
  return input.code
}

export interface EnvDurumu {
  readonly provider: OAuthProvider
  readonly hazir: boolean
  /** Eksik değişken adları — "neyi kurmam gerekiyor" sorusunun cevabı. */
  readonly eksik: readonly string[]
}

/**
 * Ortamda kimlik var mı — **secret'ı OKUMADAN**.
 *
 * Değerin kendisi buradan geçmiyor; yalnız "dolu mu" sorusu cevaplanıyor. Yer tutucu
 * (`doldurulacak`) bir değer, değer sayılmıyor: yer tutucuyla başlayan bir akış, 401'i
 * yetkilendirmenin ortasında görmek demektir.
 */
export const oauthEnvDurumu = (
  provider: OAuthProvider,
  env: Readonly<Record<string, string | undefined>>
): EnvDurumu => {
  const anahtarlar = ENV_KEYS[provider]
  const eksik: string[] = []
  for (const ad of [anahtarlar.id, anahtarlar.secret]) {
    const v = env[ad]
    if (v === undefined || v.trim() === '' || v === 'doldurulacak') eksik.push(ad)
  }
  return { provider, hazir: eksik.length === 0, eksik }
}

export const isOAuthRefusal = (r: string | OAuthRefusal): r is OAuthRefusal => typeof r !== 'string'

export const oauthRefusalMessage = (r: OAuthRefusal): string => {
  switch (r.kind) {
    case 'state_missing':
      return 'state yok — CSRF koruması olmadan yetkilendirme başlatılamaz'
    case 'state_too_short':
      return `state ${r.length} karakter, asgari ${STATE_MIN} — kısa state tahmin edilebilir`
    case 'state_mismatch':
      return 'state eşleşmiyor — bu cevap bizim başlattığımız akışa ait DEĞİL (CSRF)'
    case 'provider_error':
      return `sağlayıcı hatası: ${r.error}`
    case 'code_missing':
      return 'yetkilendirme kodu yok'
    case 'insecure_redirect':
      return `redirect_uri HTTPS değil (${r.uri}) — kod ağdaki herkese açık olurdu`
  }
}
