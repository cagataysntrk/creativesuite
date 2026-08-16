// Köken sidecar'ı — çekilen her belgenin yanında (§10 · §13 · FAZ-6.5).
//
// **Kaynaksız çekilmiş metin, kullanılamaz metindir.** Bir prospect deck'indeki her
// sayısal iddia `claim_source` taşımak zorunda (R-32); o kaynak zinciri buradan başlıyor.
// Sidecar yoksa altı ay sonra "bu rakam nereden geldi" sorusunun cevabı yok — ve o an
// iddia kaynaksız bir iddiadır.
//
// Sidecar **ayrı dosyadır**, metnin içine gömülmez: gömülü meta veri, metnin kendisiyle
// birlikte modele gider ve modelin okuduğu her satır bir enjeksiyon yüzeyidir (§14).

import { createHash } from 'node:crypto'

export interface Provenance {
  /** Şelaledeki kaynak kimliği (`own-site`, `tavily`…). */
  readonly sourceId: string
  /** Tam URL. Kısaltılmış ya da normalize edilmiş DEĞİL — kanıt tam hâliyle durur. */
  readonly sourceRef: string
  readonly domain: string
  /** ISO 8601. Çağıran verir; bu modül saat OKUMAZ (R-06). */
  readonly fetchedAt: string
  /** İçerik özeti — aynı metnin iki kez çekilip çekilmediği buradan anlaşılır. */
  readonly contentSha256: string
  readonly bytes: number
  /**
   * Kaynağın kullanım koşulu beyanı. `null` = **beyan edilmedi**, "serbest" DEĞİL.
   * Üçüncü bir durum yok: bilinmeyen bir lisans, izin verilmiş sayılmaz.
   */
  readonly termsRef: string | null
  /** Bu kaynağın ürettiği kanıtın gücü — `waterfall.ts` ile aynı sözlük. */
  readonly confidence: 'direct' | 'corroborating' | 'pointer'
}

export interface ProvenanceInput {
  readonly sourceId: string
  readonly sourceRef: string
  readonly domain: string
  readonly fetchedAt: string
  readonly text: string
  readonly termsRef?: string | null
  readonly confidence: 'direct' | 'corroborating' | 'pointer'
}

export const buildProvenance = (i: ProvenanceInput): Provenance => ({
  sourceId: i.sourceId,
  sourceRef: i.sourceRef,
  domain: i.domain,
  fetchedAt: i.fetchedAt,
  contentSha256: `sha256:${createHash('sha256').update(i.text, 'utf8').digest('hex')}`,
  bytes: Buffer.byteLength(i.text, 'utf8'),
  termsRef: i.termsRef ?? null,
  confidence: i.confidence,
})

/** Karantinadaki belge yolu. Metin ve sidecar YAN YANA durur. */
export const quarantinePaths = (
  domain: string,
  slug: string
): { readonly text: string; readonly sidecar: string } => ({
  text: `derived/ingest/${domain}/${slug}.txt`,
  sidecar: `derived/ingest/${domain}/${slug}.provenance.json`,
})

export const provenanceJson = (p: Provenance): string => `${JSON.stringify(p, null, 2)}\n`

export type ProvenanceError =
  | { readonly kind: 'unreadable'; readonly reason: string }
  | { readonly kind: 'digest_mismatch'; readonly expected: string; readonly actual: string }

/**
 * Sidecar'ı okur ve metinle EŞLEŞTİĞİNİ doğrular.
 *
 * Eşleşme kontrolü olmasaydı sidecar bir süs olurdu: metin elle düzenlenip kaynağı
 * korunabilirdi ve o an sidecar, yanlış bir şeyin kaynağını gösteriyor olurdu — kaynaksız
 * olmaktan daha kötü.
 */
export const verifyProvenance = (raw: string, text: string): Provenance | ProvenanceError => {
  let ham: unknown
  try {
    ham = JSON.parse(raw)
  } catch (e) {
    return { kind: 'unreadable', reason: e instanceof Error ? e.message : 'JSON değil' }
  }
  if (typeof ham !== 'object' || ham === null) return { kind: 'unreadable', reason: 'nesne değil' }
  const o = ham as Record<string, unknown>
  for (const alan of ['sourceId', 'sourceRef', 'domain', 'fetchedAt', 'contentSha256']) {
    if (typeof o[alan] !== 'string') return { kind: 'unreadable', reason: `${alan} yok` }
  }
  const beklenen = `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`
  if (o['contentSha256'] !== beklenen) {
    return { kind: 'digest_mismatch', expected: String(o['contentSha256']), actual: beklenen }
  }
  return ham as Provenance
}

export const isProvenanceError = (r: Provenance | ProvenanceError): r is ProvenanceError =>
  'kind' in r
