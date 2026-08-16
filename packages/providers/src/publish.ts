// Yayınlama — TEK yayıncı (§9.2 · R-34, R-46 · D-3 · FAZ-7.2).
//
// **İkinci bir yayıncı, Meta'nın davranışını yanlış okur.** Meta yinelenen bir gönderide
// hata vermez, **mevcut medya id'sini döndürür**. İki ayrı yayıncı olsaydı biri bunu
// "başardım" sayar ve üç varlık ürettiğin hâlde yirmi ürettiğini sanardın (R-46).
// `chokepoints.json` → `kanal-yayinci` bu dosyayı tek yetkili yer olarak kilitliyor.
//
// **Sıra bir tercih değil, sözleşmedir:**
//   1. token yaşıyor mu        → ölmüşse DUR (uyarı değil, blokaj)
//   2. alt-text var mı         → yoksa DUR (R-34; yayınlanmış post düzenlenemiyor)
//   3. kota sorgusu            → yayından ÖNCE, her seferinde
//   4. yerel defterle mutabakat → daha önce yayınlandıysa TEKRAR ETME
//   5. yayınla
//
// Sıra tipe gömülü: `publish()` bu dört yeteneği ZORUNLU parametre olarak alıyor. Biri
// verilmezse kod derlenmez — "kota sorgusunu unutmak" mümkün değil.

import type { Result } from '@suite/contracts'
import { err, ok } from '@suite/contracts'

/** Yayınlanacak varlık. `altTr` **zorunlu** — isteğe bağlı olsaydı boş geçilirdi. */
export interface PublishAsset {
  readonly path: string
  /** Türkçe alt-text, ≤125 karakter (R-34). Dekoratif görsel için `decorative: true`. */
  readonly altTr: string
  readonly decorative: boolean
  /** İçerik özeti — yerel defterde yineleme anahtarı. */
  readonly digest: string
}

export interface PublishRequest {
  readonly platform: 'instagram' | 'threads' | 'linkedin'
  readonly placementId: string
  readonly assets: readonly PublishAsset[]
  readonly caption: string
  /** Bu yayını üreten çalıştırma (§13). Defter kaydı buna bağlanır. */
  readonly runId: string
  /** ISO 8601 — çağıran verir (R-06). */
  readonly now: string
}

/** Kota sorgusunun cevabı. `null` alanlar "bilinmiyor" demektir, "sınırsız" değil. */
export interface PublishingLimit {
  readonly quotaUsed: number
  readonly quotaTotal: number
  /** Sorgunun kendi zamanı — bayat bir kota cevabı kota değildir. */
  readonly checkedAt: string
}

export interface TokenState {
  /** ISO 8601 son kullanma. Meta uzun ömürlü token 60 günde ölür ve SESSİZCE ölür. */
  readonly expiresAt: string
  readonly scopes: readonly string[]
}

/** Yerel yayın defterindeki kayıt — mutabakatın kaynağı (R-46). */
export interface LedgerEntry {
  readonly digest: string
  readonly externalId: string
  readonly publishedAt: string
}

export type PublishRefusal =
  | { readonly kind: 'token_expired'; readonly expiredAt: string }
  | { readonly kind: 'token_missing_scope'; readonly needed: string }
  | { readonly kind: 'missing_alt'; readonly path: string }
  | { readonly kind: 'alt_too_long'; readonly path: string; readonly length: number }
  | { readonly kind: 'quota_exhausted'; readonly used: number; readonly total: number }
  /** Daha önce yayınlanmış — bu bir HATA değil, bir OLGU. Çağıran mevcut id'yi alır. */
  | { readonly kind: 'already_published'; readonly externalId: string }
  | { readonly kind: 'no_assets' }

export interface PublishSuccess {
  readonly externalId: string
  /** Yayından ÖNCE okunan kota — kanıt manifest'e yazılır. */
  readonly limitBefore: PublishingLimit
}

/** Alt-text tavanı (R-34). Ekran okuyucu 125 karakterden sonrasını kesiyor. */
export const ALT_MAX = 125

/** Gereken kapsamlar — platforma göre. Eksik kapsam yayın anında 403 demektir. */
export const REQUIRED_SCOPES: Record<PublishRequest['platform'], readonly string[]> = {
  instagram: ['instagram_content_publish'],
  threads: ['threads_content_publish'],
  linkedin: ['w_member_social'],
}

export interface PublishDeps {
  /** Token durumu. **Sorgulanır, varsayılmaz.** */
  readonly tokenState: () => Promise<TokenState | null>
  /** Kota sorgusu — yayından ÖNCE, HER seferinde çağrılır. */
  readonly publishingLimit: () => Promise<PublishingLimit>
  /** Yerel defter okuması — yineleme mutabakatı (R-46). */
  readonly lookupLedger: (digest: string) => Promise<LedgerEntry | null>
  /** Gerçek yükleme. Yalnız dört kapı geçildikten SONRA çağrılır. */
  readonly upload: (req: PublishRequest) => Promise<Result<string, string>>
}

/**
 * Yayınlar — **veya reddeder**.
 *
 * Reddetme bir başarısızlık değil, sistemin işi: yayınlanmış bir post düzenlenemiyor,
 * bu yüzden her kontrol yayından ÖNCE yapılıyor. "Sonra düzeltiriz" bu hatta yok.
 */
export const publish = async (
  req: PublishRequest,
  deps: PublishDeps
): Promise<Result<PublishSuccess, PublishRefusal>> => {
  if (req.assets.length === 0) return err({ kind: 'no_assets' })

  // ── 1. token ────────────────────────────────────────────────────────────
  const token = await deps.tokenState()
  if (token === null || Date.parse(token.expiresAt) <= Date.parse(req.now)) {
    return err({ kind: 'token_expired', expiredAt: token?.expiresAt ?? 'yok' })
  }
  for (const gereken of REQUIRED_SCOPES[req.platform]) {
    if (!token.scopes.includes(gereken)) {
      return err({ kind: 'token_missing_scope', needed: gereken })
    }
  }

  // ── 2. alt-text (R-34) ──────────────────────────────────────────────────
  // Erişilebilirlik SONRADAN eklenemez: yayınlanmış bir Instagram postunun alt-text'i
  // düzenlenemiyor. Kapı bu yüzden yayın hattında, onay kuyruğunda değil.
  for (const a of req.assets) {
    if (!a.decorative && a.altTr.trim() === '') return err({ kind: 'missing_alt', path: a.path })
    if (a.altTr.length > ALT_MAX) {
      return err({ kind: 'alt_too_long', path: a.path, length: a.altTr.length })
    }
  }

  // ── 3. kota — yayından ÖNCE ─────────────────────────────────────────────
  const limit = await deps.publishingLimit()
  if (limit.quotaUsed >= limit.quotaTotal) {
    return err({ kind: 'quota_exhausted', used: limit.quotaUsed, total: limit.quotaTotal })
  }

  // ── 4. yerel defterle mutabakat (R-46) ──────────────────────────────────
  // **Körlemesine tekrar YOK.** Meta yinelenen gönderide mevcut id'yi döndürür; yeniden
  // denemeden önce okuyup mutabakat yapmazsak "3 varlık ürettim" sanıp 20 üretmiş
  // görünürüz. Digest içerikten türüyor: aynı byte = aynı yayın.
  const onceki = await deps.lookupLedger(req.assets[0]!.digest)
  if (onceki !== null) return err({ kind: 'already_published', externalId: onceki.externalId })

  // ── 5. yayınla ──────────────────────────────────────────────────────────
  const r = await deps.upload(req)
  return r.ok
    ? ok({ externalId: r.value, limitBefore: limit })
    : err({ kind: 'quota_exhausted', used: limit.quotaUsed, total: limit.quotaTotal })
}

/** İnsan okunur ret açıklaması — UI ve CLI bunu doğrudan gösterir. */
export const refusalMessage = (r: PublishRefusal): string => {
  switch (r.kind) {
    case 'token_expired':
      return `token ölmüş (${r.expiredAt}) — yenileme işi çalışmamış; yayın BLOKLANDI (§9.2)`
    case 'token_missing_scope':
      return `token '${r.needed}' kapsamını taşımıyor — yayın anında 403 alırdık`
    case 'missing_alt':
      return `${r.path}: Türkçe alt-text yok (R-34) — yayınlanmış post düzenlenemiyor`
    case 'alt_too_long':
      return `${r.path}: alt-text ${r.length} karakter, tavan ${ALT_MAX} — ekran okuyucu keser`
    case 'quota_exhausted':
      return `kota doldu (${r.used}/${r.total}) — kuyrukta bekliyor, körlemesine denenmiyor`
    case 'already_published':
      return `bu içerik zaten yayında (${r.externalId}) — Meta mevcut id'yi döndürürdü (R-46)`
    case 'no_assets':
      return 'yayınlanacak varlık yok'
  }
}

/**
 * Token ne zaman yenilenmeli.
 *
 * **Yenileme son güne bırakılmaz.** 60 günlük bir token 59. günde yenilenirse ve o gün
 * makine kapalıysa token ölür; ölü token sessizdir ve ilk fark ediliş yeri yayın
 * hattıdır. Yedi günlük pay, bir haftalık ihmali tolere ediyor (§16).
 */
export const YENILEME_PAYI_GUN = 7

export const needsRefresh = (token: TokenState, now: string): boolean => {
  const kalan = (Date.parse(token.expiresAt) - Date.parse(now)) / 86_400_000
  return !Number.isFinite(kalan) || kalan <= YENILEME_PAYI_GUN
}
