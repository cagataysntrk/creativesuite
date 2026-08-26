// Yayınlama — TEK yayıncı (§9.2 · R-34, R-46 · D-3 · FAZ-7.2).
//
// **İkinci bir yayıncı, Meta'nın davranışını yanlış okur.** Meta yinelenen bir gönderide
// hata vermez, **mevcut medya id'sini döndürür**. İki ayrı yayıncı olsaydı biri bunu
// "başardım" sayar ve üç varlık ürettiğin hâlde yirmi ürettiğini sanardın (R-46).
// `chokepoints.json` → `kanal-yayinci` bu dosyayı tek yetkili yer olarak kilitliyor.
//
// **Sıra bir tercih değil, sözleşmedir:**
//   1. token yaşıyor mu         → ölmüşse DUR (uyarı değil, blokaj)
//   2. alt-text var mı          → yoksa DUR (R-34; yayınlanmış post düzenlenemiyor)
//  2b. AI ifşası gerekliyse var mı → yoksa DUR (Md. 50; aynı sebep)
//   3. oran kovası (okuma)      → kota sorgusu da bir API çağrısıdır
//   4. kota sorgusu             → yayından ÖNCE, her seferinde
//   5. yerel defterle mutabakat → daha önce yayınlandıysa TEKRAR ETME
//   6. oran kovası (yazma, 3 puan) → uploader'dan ÖNCE (§9.2)
//   7. yayınla
//   8. **deftere YAZ** — yazmayan bir yayın, bir sonraki çalıştırmada yeniden yayınlanır
//
// Sıra tipe gömülü: `publish()` bu yeteneklerin HEPSİNİ zorunlu parametre olarak alıyor.
// Biri verilmezse kod derlenmez — "kota sorgusunu unutmak" mümkün değil. **Defter yazımı
// da zorunlu bir yetenek**: çağıranın hatırlamasına bırakılsaydı, yineleme koruması
// ancak herkes hatırladığı sürece çalışırdı (FAZ-7 denetimi, B4).

import type { Result } from '@suite/contracts'
import { err, ok, asciiLower } from '@suite/contracts'
import { createHash } from 'node:crypto'

/** Yayınlanacak varlık. `altTr` **zorunlu** — isteğe bağlı olsaydı boş geçilirdi. */
export interface PublishAsset {
  readonly path: string
  /** Türkçe alt-text, ≤125 karakter (R-34). Dekoratif görsel için `decorative: true`. */
  readonly altTr: string
  readonly decorative: boolean
  /** İçerik özeti — yerel defterde yineleme anahtarı. */
  readonly digest: string
  /**
   * Uyum kaydı — varlıkla BİRLİKTE gelir, ayrı bir bağımlılıktan sorulmaz (§11.3).
   *
   * `altTr` ile aynı gerekçe: yayınlanmış bir post düzenlenemiyor, o yüzden uyum
   * kanıtı yayından ÖNCE ve varlığın kendisiyle taşınıyor. Ayrı bir servise sorulsaydı,
   * o servis çağrılmadığında varlık sessizce "uyumlu" sayılırdı.
   */
  readonly compliance: AssetCompliance
}

/**
 * Varlığın taşıdığı uyum kaydı.
 *
 * **Alanlar zorunlu, çünkü eksikliği "uyumlu" anlamına gelemez.** İsteğe bağlı bir
 * `disclosureRequired`, verilmediğinde `false`a düşerdi — ve ifşa gereken bir varlık
 * sessizce ifşasız yayınlanırdı. EU AI Act Md. 50 **2 Ağu 2026'dan beri uygulanabilir**;
 * bu alan bir gelecek işi değil, bugünkü bir yükümlülük.
 */
export interface AssetCompliance {
  /** Md. 50 ifşası gerekli mi (üretim hesaplıyor, çağıran BEYAN ETMİYOR). */
  readonly disclosureRequired: boolean
  /** Makine-okunur işaretleme (IPTC/XMP) varlığa BASILDI mı — Md. 50(2). */
  readonly stamped: boolean
  /**
   * Kreatifin üstünde GÖRÜNÜR ifşa katmanı var mı.
   *
   * Yalnız `disclosureRequired` iken aranıyor: reframe/kırpma/renk düzeltme muafiyeti
   * gerçek ve dar okunmamalı — her varlığa ifşa şeridi koymak, kuralı olmadığı yere
   * taşımak olurdu.
   */
  readonly visibleDisclosure: boolean
}

export interface PublishRequest {
  /**
   * Hedef platform.
   *
   * ⚠ ⚠ **`facebook` ve `x` EKLENDİ (madde 3).** Depo sahibi dört platform istedi:
   * *"insta facebook linkedin ve x platformlarında paylaşım yapılacak"*. `threads`
   * SİLİNMİYOR — kayıtlı bir yetenek, kullanılmaması silinmesini gerektirmez (Yasa 10).
   * ⚠ Platform SINIRLARI burada değil `@suite/contracts`ın `platform.ts`inde: bu dosya
   * gönderim sözleşmesi, o dosya kabul sözleşmesi. Sınırı iki yere yazmak, biri
   * güncellenip öteki unutulduğunda yayın anında öğrenilen bir ret demek.
   */
  readonly platform: 'instagram' | 'threads' | 'linkedin' | 'facebook' | 'x'
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

/**
 * Defter okumasının **üç** sonucu.
 *
 * Önceki tip `LedgerEntry | null` idi ve `null` iki farklı şeyi anlatıyordu:
 * "bu içerik yayınlanmamış" ile "defter okunamadı". İkincisini birincisi sanmak,
 * defteri bozulmuş bir sistemde her şeyi YENİDEN yayınlamak demekti — defterin var
 * olma sebebinin tam tersi (FAZ-7 denetimi, B3).
 */
export type LedgerLookup =
  | { readonly ok: true; readonly entry: LedgerEntry | null }
  | { readonly ok: false; readonly reason: 'missing' | 'unreadable'; readonly detay: string }

/** Oran kovası kararı. Kova motorda yaşıyor; buraya FONKSİYON olarak iniyor (R-03). */
export type RateGate =
  { readonly allowed: true } | { readonly allowed: false; readonly retryAfterMs: number }

export type PublishRefusal =
  | { readonly kind: 'token_expired'; readonly expiredAt: string }
  | { readonly kind: 'token_missing_scope'; readonly needed: string }
  | { readonly kind: 'missing_alt'; readonly path: string }
  | { readonly kind: 'alt_too_long'; readonly path: string; readonly length: number }
  | { readonly kind: 'quota_exhausted'; readonly used: number; readonly total: number }
  /** Daha önce yayınlanmış — bu bir HATA değil, bir OLGU. Çağıran mevcut id'yi alır. */
  | { readonly kind: 'already_published'; readonly externalId: string }
  | { readonly kind: 'no_assets' }
  /**
   * Karosel API tavanını aşıyor (R-90).
   *
   * ⚠ Uygulama 20 slayta izin veriyor ama **Graph API 10'da kesiyor** ve bizim yayın
   * yolumuz API. Fark bir ayrıntı değil: 11 slaytlık bir karosel elle paylaşılabilir,
   * bizim hattımızdan geçemez.
   */
  | { readonly kind: 'too_many_assets'; readonly count: number; readonly max: number }
  /**
   * Yayınlanacak dosya JPEG değil (R-90).
   *
   * ⚠ Meta dokümanı birebir: *"JPEG is the only image format supported."* PNG kabul
   * EDİLMİYOR ve biz PNG üretiyoruz — bu kontrol olmasaydı hata yayın anında, dört
   * görsel ve bir insan onayı harcandıktan sonra gelirdi.
   */
  | { readonly kind: 'unsupported_format'; readonly path: string }
  /**
   * Defter okunamadı. **`already_published` DEĞİL, `no_assets` DEĞİL** — durum
   * bilinmiyor ve bilinmeyen durumda yayın yapmak yinelemeyi göze almaktır.
   */
  | {
      readonly kind: 'ledger_unavailable'
      readonly reason: 'missing' | 'unreadable'
      readonly detay: string
    }
  /** Oran kovası boş. Kota DEĞİL: sınır bizim, sağlayıcının değil. */
  | { readonly kind: 'rate_limited'; readonly retryAfterMs: number }
  /**
   * Yükleme başarısız. **Sağlayıcının hatası KORUNUR.**
   *
   * Önceden bu dal `quota_exhausted` döndürüyordu ve operatöre "kota doldu (3/25)"
   * diyordu — oysa ağ hatasıydı. Yanlış teşhis, doğru teşhisin olmamasından kötüdür:
   * operatör kotanın dolmasını bekler, oysa beklemekle geçmeyecek bir hata var
   * (FAZ-7 denetimi, M1).
   */
  | { readonly kind: 'upload_failed'; readonly hata: string }
  /**
   * İfşa gerekli ama yok (§11.3 · EU AI Act Md. 50).
   *
   * `alt_text` ile aynı sınıf: yayınlanmış bir postun ifşa katmanı sonradan eklenemez.
   */
  | {
      readonly kind: 'disclosure_missing'
      readonly path: string
      readonly eksik: 'stamp' | 'visible'
    }

export interface PublishSuccess {
  readonly externalId: string
  /** Yayından ÖNCE okunan kota — kanıt manifest'e yazılır. */
  readonly limitBefore: PublishingLimit
}

/**
 * Yayın kimliği — **yayınlanan HER ŞEYDEN** türer (R-44).
 *
 * Tek bir görselin hash'i bir yayını tanımlamıyor: aynı kapakla farklı bir metin
 * farklı bir yayındır, ikinci slaytı değişmiş bir karusel de öyle. Yerleşim de
 * anahtarın parçası — aynı içerik feed'e ve story'ye ayrı ayrı yayınlanabilir.
 *
 * Sıra korunuyor: karusel slayt sırası içeriğin parçasıdır, kümesi değil.
 */
export const yayinAnahtari = (req: PublishRequest): string =>
  [
    req.platform,
    req.placementId,
    ...req.assets.map((a) => a.digest),
    // Metin de içerik: kaynağı ne olursa olsun, değişmişse yeni bir yayındır.
    createHash('sha256').update(req.caption).digest('hex').slice(0, 16),
  ].join('::')

/** Alt-text tavanı (R-34). Ekran okuyucu 125 karakterden sonrasını kesiyor. */
export const ALT_MAX = 125

/** Gereken kapsamlar — platforma göre. Eksik kapsam yayın anında 403 demektir. */
export const REQUIRED_SCOPES: Record<PublishRequest['platform'], readonly string[]> = {
  instagram: ['instagram_content_publish'],
  threads: ['threads_content_publish'],
  linkedin: ['w_member_social'],
  // ⚠ Kapsam adları platformların KENDİ adlandırması; uydurulmuş bir kapsam, token
  // doğrulamasını sessizce geçen bir yayın demek. Facebook sayfa gönderisi
  // `pages_manage_posts` istiyor; X v2 yazma yetkisi `tweet.write` ve okuma için
  // `users.read` de gerekiyor.
  facebook: ['pages_manage_posts'],
  x: ['tweet.write', 'users.read'],
}

export interface PublishDeps {
  /** Token durumu. **Sorgulanır, varsayılmaz.** */
  readonly tokenState: () => Promise<TokenState | null>
  /**
   * Oran kovası. **Kova motorda yaşıyor** (`packages/engine`), bu paket onu import
   * edemez (R-03) — o yüzden fonksiyon olarak iniyor. Zorunlu: isteğe bağlı olsaydı
   * "limiter uploader'dan önce oturur" bir belge cümlesi olarak kalırdı (denetim B2).
   */
  readonly rateGate: (cost: number) => RateGate
  /** Kota sorgusu — yayından ÖNCE, HER seferinde çağrılır. */
  readonly publishingLimit: () => Promise<PublishingLimit>
  /** Yerel defter okuması — yineleme mutabakatı (R-46). Üç durumlu. */
  readonly lookupLedger: (digest: string) => Promise<LedgerLookup>
  /** Gerçek yükleme. Yalnız tüm kapılar geçildikten SONRA çağrılır. */
  readonly upload: (req: PublishRequest) => Promise<Result<string, string>>
  /**
   * Deftere yazma. **Zorunlu** — başarıdan sonra publish'in KENDİSİ yazar.
   *
   * Çağıranın hatırlamasına bırakılsaydı, yineleme koruması ancak herkes hatırladığı
   * sürece çalışırdı; ve unutulduğunda hata sessiz olurdu — bir sonraki çalıştırma
   * aynı içeriği yeniden yayınlar, Meta aynı id'yi döndürür, biz "başardım" sanarız.
   */
  readonly recordPublished: (entry: LedgerEntry & { readonly platform: string }) => void
}

/**
 * Yayınlar — **veya reddeder**.
 *
 * Reddetme bir başarısızlık değil, sistemin işi: yayınlanmış bir post düzenlenemiyor,
 * bu yüzden her kontrol yayından ÖNCE yapılıyor. "Sonra düzeltiriz" bu hatta yok.
 */
/**
 * Graph API karosel tavanı (R-90).
 *
 * ⚠ Uygulama 8 Ağu 2024'te 10 → 20'ye çıktı ama **API 10'da kaldı** ve bizim yayın
 * yolumuz API. İki sayıyı karıştırmak, elle paylaşılabilen bir karoseli hattan
 * geçirilebilir sanmak demek.
 */
export const KAROSEL_TAVANI = 10

/** API'nin kabul ettiği TEK biçim (R-90). PNG reddediliyor. */
export const JPEG_UZANTILARI = ['.jpg', '.jpeg'] as const

export const publish = async (
  req: PublishRequest,
  deps: PublishDeps
): Promise<Result<PublishSuccess, PublishRefusal>> => {
  if (req.assets.length === 0) return err({ kind: 'no_assets' })

  // ── API sözleşmesi: 10 slayt, yalnız JPEG (R-90) ──────────────────────────
  //
  // ⚠ ⚠ **BU İKİ KONTROL YOKTU ve ikisi de yayın anında patlayacaktı.** `publish`
  // 50 gönderi/24s kotasını izliyordu ama slayt SAYISINI hiç sormuyordu; format hiç
  // denetlenmiyordu. Meta dokümanı (30 Haz 2026 güncel) ikisini de açıkça yazıyor:
  // *"Carousels are limited to 10 images"* ve *"JPEG is the only image format
  // supported."*
  //
  // ⚠ Kontrol token'dan ÖNCE: sözleşme ihlali bir yetki sorunu değil ve token
  // yenilemek onu düzeltmiyor. Ucuz olan önce sorulur.
  if (req.assets.length > KAROSEL_TAVANI) {
    return err({ kind: 'too_many_assets', count: req.assets.length, max: KAROSEL_TAVANI })
  }
  for (const a of req.assets) {
    // ⚠ `asciiLower`: dosya UZANTISI Türkçe metin değil, bir protokol token'ıdır.
    // Türkçe kuralıyla küçültmek `.JPG` → `.jpğ` sınıfından hatalar üretir.
    if (!JPEG_UZANTILARI.some((u) => asciiLower(a.path).endsWith(u))) {
      return err({ kind: 'unsupported_format', path: a.path })
    }
  }

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

  // ── 2b. AI ifşası (§11.3 · Md. 50) ──────────────────────────────────────
  //
  // Alt-text'in hemen yanında ve aynı sebeple: yayınlanmış bir postun ifşası
  // sonradan eklenemez. Kapı **yalnız ifşa gerektiğinde** çalışıyor — muafiyet
  // (boyutlandırma, kırpma, renk düzeltme) gerçek ve dar okunmamalı.
  for (const a of req.assets) {
    if (!a.compliance.disclosureRequired) continue
    if (!a.compliance.stamped) {
      return err({ kind: 'disclosure_missing', path: a.path, eksik: 'stamp' })
    }
    if (!a.compliance.visibleDisclosure) {
      return err({ kind: 'disclosure_missing', path: a.path, eksik: 'visible' })
    }
  }

  // ── 3. oran kovası: OKUMA (1 puan) ──────────────────────────────────────
  // Kota sorgusu da bir API çağrısıdır. Kovayı yalnız yüklemeden önce sormak, sınıra
  // sorgularla çarpmak demekti — ve o 429, yayın anında değil, ondan da önce gelirdi.
  const okumaIzni = deps.rateGate(OKUMA_PUANI)
  if (!okumaIzni.allowed) {
    return err({ kind: 'rate_limited', retryAfterMs: okumaIzni.retryAfterMs })
  }

  // ── 4. kota — yayından ÖNCE ─────────────────────────────────────────────
  const limit = await deps.publishingLimit()
  if (limit.quotaUsed >= limit.quotaTotal) {
    return err({ kind: 'quota_exhausted', used: limit.quotaUsed, total: limit.quotaTotal })
  }

  // ── 5. yerel defterle mutabakat (R-46) ──────────────────────────────────
  // **Körlemesine tekrar YOK.** Meta yinelenen gönderide mevcut id'yi döndürür; yeniden
  // denemeden önce okuyup mutabakat yapmazsak "3 varlık ürettim" sanıp 20 üretmiş
  // görünürüz.
  //
  // ⚠ Anahtar önce **yalnız ilk varlığın digest'iydi** ve bu, hiç yayınlanmamış
  // içerikleri blokluyordu (FAZ-7 denetimi 2. tur, M1): aynı kapak görseliyle farklı
  // caption, ya da ikinci slaytı değişmiş bir karusel, "bu içerik zaten yayında"
  // cevabı alıyordu. Yanlış pozitif, defterin var oluş sebebinin aynadaki hâli —
  // operatöre bir OLGU gibi sunulan bir yanlış.
  const defter = await deps.lookupLedger(yayinAnahtari(req))
  if (!defter.ok) {
    // Defter okunamıyorsa YAYIN YOK. "Herhalde yayınlanmamıştır" varsayımı, defterin
    // bozulduğu gün her şeyi ikinci kez yayınlar.
    return err({ kind: 'ledger_unavailable', reason: defter.reason, detay: defter.detay })
  }
  if (defter.entry !== null) {
    return err({ kind: 'already_published', externalId: defter.entry.externalId })
  }

  // ── 6. oran kovası: YAZMA (3 puan) — uploader'dan hemen ÖNCE ────────────
  const yazmaIzni = deps.rateGate(YAZMA_PUANI)
  if (!yazmaIzni.allowed) {
    return err({ kind: 'rate_limited', retryAfterMs: yazmaIzni.retryAfterMs })
  }

  // ── 7. yayınla ──────────────────────────────────────────────────────────
  const r = await deps.upload(req)
  if (!r.ok) return err({ kind: 'upload_failed', hata: r.error })

  // ── 8. deftere YAZ ──────────────────────────────────────────────────────
  // Yayın gerçekleşti; kaydedilmezse bir sonraki çalıştırma aynı içeriği yeniden
  // yayınlar. Bu satır opsiyonel olsaydı, yineleme koruması bir konvansiyon olurdu.
  deps.recordPublished({
    digest: yayinAnahtari(req),
    externalId: r.value,
    publishedAt: req.now,
    platform: req.platform,
  })
  return ok({ externalId: r.value, limitBefore: limit })
}

/** Oran puanları (§9.2) — motorla AYNI değerler; ikisi ayrışırsa kova yanlış ölçer. */
export const OKUMA_PUANI = 1
export const YAZMA_PUANI = 3

/** İnsan okunur ret açıklaması — UI ve CLI bunu doğrudan gösterir. */
export const refusalMessage = (r: PublishRefusal): string => {
  switch (r.kind) {
    case 'token_expired':
      return `token ölmüş (${r.expiredAt}) — yenileme işi çalışmamış; yayın BLOKLANDI (§9.2)`
    case 'token_missing_scope':
      return `token '${r.needed}' kapsamını taşımıyor — yayın anında 403 alırdık`
    case 'too_many_assets':
      return (
        `karosel ${String(r.count)} slayt — Graph API tavanı ${String(r.max)} ` +
        '(uygulama 20 kabul ediyor ama yayın yolumuz API)'
      )
    case 'unsupported_format':
      return `${r.path}: API yalnız JPEG kabul ediyor — PNG yayın anında reddedilir`
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
    case 'ledger_unavailable':
      return `yayın defteri okunamadı (${r.reason}: ${r.detay}) — yayın DURDU; bilinmeyen defter durumunda yayınlamak yinelemeyi göze almaktır (R-46)`
    case 'rate_limited':
      return `oran kovası boş — ${r.retryAfterMs}ms sonra tekrar (bu KOTA değil, bizim sınırımız)`
    case 'upload_failed':
      return `yükleme başarısız: ${r.hata}`
    case 'disclosure_missing':
      return r.eksik === 'stamp'
        ? `${r.path}: AI ifşası gerekli ama makine-okunur damga YOK (Md. 50(2)) — yayınlanmış post damgalanamaz`
        : `${r.path}: AI ifşası gerekli ama görünür ifşa katmanı YOK (Md. 50) — yayınlanmış post düzenlenemiyor`
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
