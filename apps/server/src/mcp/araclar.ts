// Yerel MCP yüzeyi — araç sözleşmesi (§3.8, §14 · D-33 · R-14, R-50 · FAZ-8.9).
//
// **MCP'nin eklediği şey dosya okumak DEĞİL.** Claude Code zaten `corpus/*.md`
// dosyalarını okuyabiliyor; bu yüzey üç şeyi ekliyor ve üçü de ham dosya okumakla
// elde edilemiyor:
//
//   1. **Retrieval yüklemi** (R-13). Ham dosyayı okuyan bir agent, EMEKLİYE AYRILMIŞ
//      bir kaydı güncel sanır — §4.5'in "asla sızmaz" vaadi yalnız yüklemden geçerken
//      geçerli. `grep` marka, dönem, `status` ve geçerlilik tarihlerini bilmez.
//   2. **Türkçe arama** (§5.6). FTS5 `unicode61 remove_diacritics 2` + trigram + RRF:
//      "ölçüm" → "ölçümlerinizi" bulur. `grep` bulmaz ve bulmadığını da söylemez.
//   3. **`propose` yolu** (R-14). Dosyayı elle yazan bir agent `x_signature`sız,
//      `status` alanı keyfi bir kayıt üretir; kapı bunu ancak commit anında yakalar.
//      Buradan yazılan her şey `draft` ve imzalı iner.
//
// **Neden `derived/ingest/` ASLA açılmıyor** (R-50): karantinaya inen metin dış
// kaynaktan gelir ve **talimat olarak sunulamaz**. Bir MCP aracı onu döndürseydi,
// prospect'in web sitesindeki bir cümle modele komut olarak ulaşırdı — enjeksiyon
// sınırının tam olarak koruduğu şey bu.
//
// **Yazma yolu TEK.** İkinci bir yazma kapısı, R-14'ün tek güvenlik hikâyesini bozar:
// onay = git commit. Bu yüzey `propose`dan başka bir şey yazamaz ve `status` alanını
// çağırandan KABUL ETMEZ.

export interface McpArac {
  readonly ad: string
  readonly aciklama: string
  /** JSON Schema alt kümesi — `registry/PROFILE.md` ile aynı kısıtlar. */
  readonly girdi: Readonly<Record<string, unknown>>
}

/**
 * Açılan araçlar. **Üç tane ve hepsi bu kadar.**
 *
 * Her yeni araç yeni bir yüzey ve yeni bir bakım borcudur; liste kısa tutuluyor
 * çünkü MCP sözleşmesi değişince güncellenecek yer sayısı bu listeye eşit.
 */
export const ARACLAR: readonly McpArac[] = [
  {
    ad: 'corpus_search',
    aciklama:
      'Corpus içinde Türkçe arama. Sonuçlar retrieval yükleminden geçer: emekliye ' +
      'ayrılmış, süresi dolmuş ve başka markaya ait kayıtlar GÖRÜNMEZ.',
    girdi: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 2 },
        limit: { type: 'integer', minimum: 1, maximum: 50 },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    ad: 'corpus_get',
    aciklama: 'Tek kaydı id ile getirir. Yüklemden geçmeyen bir kayıt bulunamaz sayılır.',
    girdi: {
      type: 'object',
      properties: { id: { type: 'string', minLength: 3 } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    ad: 'corpus_propose',
    aciklama:
      'Corpus’a ÖNERİ yazar. Kayıt her zaman status: draft olarak iner ve retrieval’a ' +
      'görünmez; onay insanın git commit’idir (R-14). status alanı kabul EDİLMEZ.',
    girdi: {
      type: 'object',
      properties: {
        entityType: { type: 'string', minLength: 2 },
        slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        frontmatter: { type: 'object' },
        body: { type: 'string' },
      },
      required: ['entityType', 'slug', 'frontmatter', 'body'],
      additionalProperties: false,
    },
  },
]

export type McpRet =
  /** Bilinmeyen araç — sessizce boş dönmek, aracın var olduğunu sandırırdı. */
  | { readonly kind: 'unknown_tool'; readonly ad: string }
  /** İndeks yok. **"Sonuç yok" DEĞİL** — arama hiç koşmadı (D-175). */
  | { readonly kind: 'index_missing' }
  /** Çağıran `status`/`zone` geçirmeye çalıştı — yazma kapısı tektir (R-14). */
  | { readonly kind: 'status_not_accepted'; readonly alan: string }
  /** Yazma reddedildi; sebep corpus yazıcısından geliyor. */
  | { readonly kind: 'write_refused'; readonly neden: string }

/**
 * Öneri girdisini doğrular. **`status` ve `zone` reddedilir, yok sayılmaz.**
 *
 * Sessizce silmek, çağıranın "active yazdım" sanmasına yol açardı; reddetmek ona
 * kuralı öğretiyor. Sessiz düzeltme, öğrenilmeyen bir kuraldır.
 */
export const oneriDogrula = (frontmatter: Readonly<Record<string, unknown>>): McpRet | null => {
  for (const alan of ['status', 'zone', 'x_signature']) {
    if (alan in frontmatter) return { kind: 'status_not_accepted', alan }
  }
  return null
}

export const mcpHataMesaji = (r: McpRet): string => {
  switch (r.kind) {
    case 'unknown_tool':
      return `bilinmeyen araç: ${r.ad}`
    case 'index_missing':
      return 'indeks yok — `just reindex` çalıştırın; arama KOŞMADI ("sonuç yok" değil)'
    case 'status_not_accepted':
      return `'${r.alan}' alanı kabul edilmiyor: öneri her zaman draft iner ve imzayı üretim basar (R-14)`
    case 'write_refused':
      return `öneri yazılamadı: ${r.neden}`
  }
}
