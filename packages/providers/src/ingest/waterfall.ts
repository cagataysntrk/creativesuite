// `INGEST` araştırma şelalesi (§10 · §14 · R-50 · D-40 · FAZ-6.5).
//
// **Sıra maliyet ve GÜVEN sırasıdır, ikisi birden.** En üstte şirketin kendi sitesi var:
// bedava ve en yüksek güven — bir şirketin kendi sitesinde yazdığı, o şirketin
// söylediğidir. En altta borsa/KAP kayıtları: pahalı ya da dar kapsamlı ama teyitli.
// Arada arama API'leri: ucuz, geniş, **düşük güven** — bir SERP sonucu bir olgu değil,
// bir işaretçidir.
//
// **Şelale ATLAMAZ, DÜŞER.** Bir kaynak anahtarsızsa o kaynak `bloke` işaretlenir ve
// sıradakine geçilir — sessizce atlanmaz. Sessiz atlama, "üç kaynak tarandı" diye
// raporlanan ama aslında bir kaynak taranmış bir araştırma demektir ve bu, eksik
// araştırmadan daha tehlikelidir: eksikliği görünmez.
//
// **LinkedIn HİÇBİR biçimde kazınmaz.** ToS ihlali ve hesap kaybı riski; `linkedin-kazima`
// darboğazı (`izinli: []`) mekanik olarak yasaklıyor. LinkedIn'e yalnız `PUBLISH`
// tarafından, resmî API ile dokunulur (§9.3) — okuma ile yazma aynı platformda iki ayrı
// hukuki zemindir.

/** Kaynağın ne tür kanıt ürettiği. Güven sırası buradan gelir, ada göre değil. */
export type SourceKind =
  /** Şirketin kendi sitesi — söylediği şey, kendi beyanı. */
  | 'own_site'
  /** Arama motoru sonucu — işaretçi, olgu değil. */
  | 'serp'
  /** Arama API'si özeti — işaretçi, olgu değil. */
  | 'search_api'
  /** Yayınlanan/kazanılan ihale — teyitli bütçe, kapsam ve tarih. */
  | 'tender'
  /** Borsa/KAP bildirimi — hukuken bağlayıcı beyan. */
  | 'filings'

export interface IngestSource {
  readonly id: string
  readonly kind: SourceKind
  /** Şelaledeki sıra. Küçük olan önce denenir. */
  readonly order: number
  /** Bu kaynağın çalışması için gereken ortam değişkeni. `null` = anahtar gerekmiyor. */
  readonly envKey: string | null
  /** Aylık bedava kota — bilinmiyorsa `null`. Uydurulmuş bir kota, olmayan bir kotadır. */
  readonly freeQuotaPerMonth: number | null
  /**
   * Çıkardığı iddianın güveni. `direct` = kaynağın kendi beyanı · `corroborating` =
   * başka bir kaynağı destekler · `pointer` = tek başına iddia taşımaz.
   */
  readonly confidence: 'direct' | 'corroborating' | 'pointer'
}

/**
 * Şelale. **Model adı yok, sağlayıcı adı var** — bunlar yetenek değil, veri kaynağı;
 * R-40 model seçimini yasaklar, kaynak kimliğini değil.
 */
export const SELALE: readonly IngestSource[] = [
  {
    id: 'own-site',
    kind: 'own_site',
    order: 1,
    envKey: null,
    freeQuotaPerMonth: null,
    confidence: 'direct',
  },
  {
    id: 'brightdata-serp',
    kind: 'serp',
    order: 2,
    envKey: 'BRIGHTDATA_API_KEY',
    freeQuotaPerMonth: 5000,
    confidence: 'pointer',
  },
  {
    id: 'tavily',
    kind: 'search_api',
    order: 3,
    envKey: 'TAVILY_API_KEY',
    freeQuotaPerMonth: 1000,
    confidence: 'pointer',
  },
  {
    id: 'ihale-mcp',
    kind: 'tender',
    order: 4,
    envKey: 'IHALE_MCP_URL',
    freeQuotaPerMonth: null,
    confidence: 'corroborating',
  },
  {
    id: 'borsa-mcp',
    kind: 'filings',
    order: 5,
    envKey: 'BORSA_MCP_URL',
    freeQuotaPerMonth: null,
    confidence: 'direct',
  },
]

export type SourceState =
  | { readonly id: string; readonly durum: 'hazir'; readonly kaynak: IngestSource }
  /** Anahtar yok. **Atlanmadı — bloke edildi** ve raporda görünür. */
  | {
      readonly id: string
      readonly durum: 'bloke'
      readonly kaynak: IngestSource
      readonly eksik: string
    }

export interface WaterfallPlan {
  readonly steps: readonly SourceState[]
  readonly hazirSayisi: number
  readonly blokeSayisi: number
  /**
   * Hiç `direct` güvenli kaynak hazır değilse bu `false`.
   *
   * Yalnız `pointer` kaynaklarla yapılan bir araştırma, bir prospect deck'ine
   * girebilecek hiçbir olgu üretmez (R-32) — ve bunu çalıştırmadan ÖNCE bilmek gerekir.
   */
  readonly dogrudanKanitMumkun: boolean
}

/**
 * Şelaleyi ortamdaki anahtarlara göre planlar. **Ağ yok, saat yok** (R-06, R-47):
 * bu bir kuru plandır ve `just plan` bunu hiçbir şey harcamadan basabilir.
 */
export const planWaterfall = (
  env: Readonly<Record<string, string | undefined>>,
  sources: readonly IngestSource[] = SELALE
): WaterfallPlan => {
  const sirali = [...sources].sort((a, b) => a.order - b.order)
  const steps: SourceState[] = sirali.map((k) => {
    if (k.envKey === null) return { id: k.id, durum: 'hazir', kaynak: k }
    const deger = env[k.envKey]
    // Yer tutucu bir anahtar, anahtar DEĞİLDİR: `doldurulacak` yazan bir değişkenle
    // çalıştırmaya başlamak, 401'i araştırmanın ortasında görmek demektir.
    const gecerli = deger !== undefined && deger.trim() !== '' && deger !== 'doldurulacak'
    return gecerli
      ? { id: k.id, durum: 'hazir', kaynak: k }
      : { id: k.id, durum: 'bloke', kaynak: k, eksik: k.envKey }
  })
  const hazir = steps.filter((s) => s.durum === 'hazir')
  return {
    steps,
    hazirSayisi: hazir.length,
    blokeSayisi: steps.length - hazir.length,
    dogrudanKanitMumkun: hazir.some((s) => s.kaynak.confidence === 'direct'),
  }
}

/** Yasaklı kaynak desenleri — `linkedin-kazima` darboğazının okunur karşılığı. */
export const YASAKLI_KAYNAK = /linkedin\.com\/(in|company|sales|jobs)/i

export type SourceRefusal = { readonly kind: 'forbidden_source'; readonly url: string }

/**
 * Bir URL'in çekilebilir olup olmadığına karar verir.
 *
 * **`api.linkedin.com` YASAK DEĞİL:** oraya `PUBLISH` resmî API ile dokunuyor (§9.3).
 * Okuma ile yazma aynı platformda iki ayrı hukuki zemindir ve tek bir "linkedin" kelimesi
 * araması ikisini birbirine karıştırırdı.
 */
export const canFetch = (url: string): true | SourceRefusal =>
  YASAKLI_KAYNAK.test(url) ? { kind: 'forbidden_source', url } : true
