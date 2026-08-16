// LinkedIn adaptörü — metin, görsel ve DÖKÜMAN postu (§9.3 · R-34 · FAZ-7.3).
//
// **Kendi adaptörümüzün tek başına haklı çıktığı yer burası.** Döküman postu (PDF
// carousel) LinkedIn'in en yüksek etkileşimli formatı ve **hiçbir aggregator onu
// vermiyor** — Ayrshare, Buffer, Postiz hepsi soyutlayıp kaybediyor. ~400 satır
// karşılığında aggregator'ların sıyırdığı yetenek elde kalıyor.
//
// **Sürüm SABİTLENİR ve eskimesi bir HATADIR.** LinkedIn sürümleri takvimle emekliye
// ayırıyor (`YYYYMM` biçimi) ve emekli bir sürümle yapılan çağrı sessizce eski davranışa
// düşmüyor — 426 dönüyor. Sabiti eskitmek bu yüzden açık bir hata: "sessizce eski API'ye
// düşmek" en kötü senaryo değil, en kötü senaryo bunun FARK EDİLMEMESİ.
//
// **Bu dosya AĞA ÇIKMAZ.** Yayın çağrısı `publish.ts`ten geçiyor (`kanal-yayinci`
// darboğazı); burada olan tek şey isteği KURMAK ve doğrulamak. Ayrım sayesinde tüm
// doğrulama anahtarsız test edilebiliyor.

import { asciiLower } from '@suite/contracts'
import type { PublishAsset } from './publish.js'

/**
 * Sabitlenmiş API sürümü.
 *
 * LinkedIn `YYYYMM` kullanıyor ve eski sürümleri takvimle emekliye ayırıyor. Sabit
 * burada, çağrı yerinde DEĞİL: iki yerde iki sürüm, birinin unutulması demektir.
 */
export const LINKEDIN_VERSION = '202508'

/**
 * Sürümün doğrulandığı tarih. **Üç ayda bir yeniden kontrol** (§9.3).
 *
 * `verifiedAt` olmadan bir sürüm sabiti, ne zaman doğru olduğunu söylemeyen bir sayıdır.
 */
export const LINKEDIN_VERSION_VERIFIED_AT = '2026-08-16'

/** Üç ay. Platform spec'lerinin tazelik tavanıyla (§9.1) aynı. */
export const SURUM_TAZELIK_GUN = 90

export type LinkedinPostKind = 'text' | 'image' | 'document'

export interface LinkedinPost {
  readonly kind: LinkedinPostKind
  /** Post metni. LinkedIn 3000 karakter kabul ediyor; tavan aşılırsa API reddeder. */
  readonly commentary: string
  readonly assets: readonly PublishAsset[]
  /**
   * Döküman postunun başlığı — **feed'de dosya adı yerine bu görünür**.
   *
   * Zorunlu: boş bırakılırsa LinkedIn dosya adını gösterir ve `dokuman.pdf` bir başlık
   * değildir. Sonradan düzenlenemiyor.
   */
  readonly documentTitle?: string
}

export const COMMENTARY_MAX = 3000

export type LinkedinRefusal =
  | { readonly kind: 'version_stale'; readonly days: number; readonly pinned: string }
  | { readonly kind: 'commentary_too_long'; readonly length: number }
  | { readonly kind: 'document_title_missing' }
  | { readonly kind: 'wrong_asset_count'; readonly expected: string; readonly got: number }
  | { readonly kind: 'document_not_pdf'; readonly path: string }

export interface LinkedinRequestBody {
  readonly author: string
  readonly commentary: string
  readonly visibility: 'PUBLIC'
  /** `NONE` = paylaşım kapalı değil; LinkedIn'in varsayılanı bu ve açıkça yazılıyor. */
  readonly distribution: { readonly feedDistribution: 'MAIN_FEED' }
  readonly content:
    | { readonly kind: 'text' }
    | { readonly kind: 'image'; readonly paths: readonly string[] }
    | { readonly kind: 'document'; readonly path: string; readonly title: string }
  /** İstekte gönderilecek sürüm başlığı — sabitten türer, elle yazılmaz. */
  readonly versionHeader: string
}

/**
 * Sürüm sabiti eskidi mi.
 *
 * **Saat okumaz** (R-06): `now` çağırandan gelir. Eskimiş bir sürüm bir uyarı değil bir
 * HATA: emekli sürümle yapılan çağrı 426 döner ve yayın hattı, sebebi anlaşılmayan bir
 * hatayla durur.
 */
export const versionStale = (now: string, maxDays = SURUM_TAZELIK_GUN): number | null => {
  const a = Date.parse(`${LINKEDIN_VERSION_VERIFIED_AT}T00:00:00Z`)
  const b = Date.parse(now)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.POSITIVE_INFINITY
  const gun = Math.floor((b - a) / 86_400_000)
  return gun > maxDays ? gun : null
}

/**
 * İstek gövdesini kurar — **veya reddeder**.
 *
 * Her ret yayından ÖNCE: LinkedIn postu yayınlandıktan sonra medyası düzenlenemiyor.
 */
export const buildLinkedinPost = (
  post: LinkedinPost,
  author: string,
  now: string
): LinkedinRequestBody | LinkedinRefusal => {
  const eski = versionStale(now)
  if (eski !== null) {
    // Sessizce eski API'ye düşmek YOK: sabit eskidiyse çağrı hiç kurulmaz.
    return { kind: 'version_stale', days: eski, pinned: LINKEDIN_VERSION }
  }
  if (post.commentary.length > COMMENTARY_MAX) {
    return { kind: 'commentary_too_long', length: post.commentary.length }
  }

  switch (post.kind) {
    case 'text':
      if (post.assets.length !== 0) {
        return { kind: 'wrong_asset_count', expected: '0', got: post.assets.length }
      }
      return {
        author,
        commentary: post.commentary,
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED' },
        content: { kind: 'text' },
        versionHeader: LINKEDIN_VERSION,
      }

    case 'image':
      if (post.assets.length === 0) {
        return { kind: 'wrong_asset_count', expected: '≥1', got: 0 }
      }
      return {
        author,
        commentary: post.commentary,
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED' },
        content: { kind: 'image', paths: post.assets.map((a) => a.path) },
        versionHeader: LINKEDIN_VERSION,
      }

    case 'document': {
      if (post.assets.length !== 1) {
        return { kind: 'wrong_asset_count', expected: '1', got: post.assets.length }
      }
      const dosya = post.assets[0]!
      // FAZ-6.3'ün çıktısı bir PDF'tir; başka bir şey gelirse bu bir hattın yanlış
      // bağlandığını söyler ve sessizce yüklemek onu gizlerdi.
      // `asciiLower` — çıplak `.toLowerCase()` yasak (R-21). Dosya uzantısı ASCII olsa
      // da istisna açmıyoruz: bir istisna açıldığı an sonraki çağrı Türkçe metinle gelir.
      if (!asciiLower(dosya.path).endsWith('.pdf')) {
        return { kind: 'document_not_pdf', path: dosya.path }
      }
      const baslik = post.documentTitle?.trim() ?? ''
      if (baslik === '') return { kind: 'document_title_missing' }
      return {
        author,
        commentary: post.commentary,
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED' },
        content: { kind: 'document', path: dosya.path, title: baslik },
        versionHeader: LINKEDIN_VERSION,
      }
    }
  }
}

export const isLinkedinRefusal = (r: LinkedinRequestBody | LinkedinRefusal): r is LinkedinRefusal =>
  'kind' in r && !('author' in r)

export const linkedinRefusalMessage = (r: LinkedinRefusal): string => {
  switch (r.kind) {
    case 'version_stale':
      return `LinkedIn sürüm sabiti ${r.days} günlük (${r.pinned}) — üç ayda bir yeniden kontrol edilmeli (§9.3); emekli sürüm 426 döner`
    case 'commentary_too_long':
      return `post metni ${r.length} karakter, tavan ${COMMENTARY_MAX}`
    case 'document_title_missing':
      return 'döküman başlığı yok — feed’de dosya adı görünür ve `dokuman.pdf` bir başlık değildir'
    case 'wrong_asset_count':
      return `varlık sayısı yanlış: beklenen ${r.expected}, gelen ${r.got}`
    case 'document_not_pdf':
      return `döküman postu PDF ister: ${r.path}`
  }
}
