// Dönem (era) modeli ve varlık damgası (§4.3 · R-11 · D-30, D-39).
//
// Era üç ucuz şeydir: `era.yaml` (değişmez manifest) · `current` (tek satır) ·
// `git tag era/<slug>`. **Dönem klasörü YOK** — corpus dönem başına kopyalanmaz.
// Kopyalama, regenerasyonu "dosya ekleme"ye çevirir; `git diff` yan yana gösteremez,
// inceleme ölür ve insan 900 opluk bir planı okumadan kabul eder (D-30).
//
// **Varlık damgası geri alınamaz olan tek şeydir.** Bir varlık damgasız üretilirse
// hangi markanın hangi döneminden geldiği SONSUZA KADAR kaybolur: eşleşme yok, kaynak
// yok, yeniden üretim yok. İlk hafta tek dönem varken alan gereksiz görünür — tam da
// bu yüzden atlanır ve tam da bu yüzden burada mekanik olarak zorunlu.

import type { BrandId, EraId } from '@suite/contracts'

export type EraStatus = 'candidate' | 'active' | 'retired'

export interface EraManifest {
  readonly slug: string
  readonly brandId: BrandId
  readonly status: EraStatus
  /** Bu dönemin doğduğu commit. Değişmez: dönem o ağacın fotoğrafıdır. */
  readonly commitSha: string
  /** ISO 8601, çağırandan (R-06). */
  readonly mintedAt: string
  readonly title: string
  /** Neden bu dönem açıldı — bir yıl sonra tek cevap kaynağı. */
  readonly rationale: string
  /** Önceki dönem; ilk dönemde null. Soy zinciri buradan kurulur. */
  readonly supersedes: string | null
}

export type EraError =
  | { readonly kind: 'invalid_slug'; readonly slug: string }
  | { readonly kind: 'missing_field'; readonly field: string }
  | { readonly kind: 'invalid_commit_sha'; readonly value: string }
  | { readonly kind: 'self_supersede'; readonly slug: string }
  | { readonly kind: 'missing_stamp_field'; readonly field: string }

export type EraResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly EraError[] }

/** Slug hem dosya yolu hem git tag olacak: ikisinin de kabul ettiği dar küme. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SHA_RE = /^[0-9a-f]{40}$/

export const eraDir = (brandId: string, slug: string): string => `brand/${brandId}/eras/${slug}`
export const eraManifestPath = (brandId: string, slug: string): string =>
  `${eraDir(brandId, slug)}/era.yaml`
/** Aktif dönemi tutan TEK SATIR. Markaya göre: iki marka aynı anda yaşar (D-39). */
export const currentEraPath = (brandId: string): string => `brand/${brandId}/current`
/** `git tag era/<slug>` — dönem git'te de görünür, `git log` tek başına yol haritasıdır. */
export const eraTag = (slug: string): string => `era/${slug}`
/** Soy haritası: hangi kayıt hangi kayda dönüştü. */
export const lineagePath = (brandId: string, from: string, to: string): string =>
  `brand/${brandId}/lineage/${from}__${to}.map.json`

export const validateEra = (m: EraManifest): EraResult<EraManifest> => {
  const errors: EraError[] = []
  if (!SLUG_RE.test(m.slug)) errors.push({ kind: 'invalid_slug', slug: m.slug })
  if (!SHA_RE.test(m.commitSha)) errors.push({ kind: 'invalid_commit_sha', value: m.commitSha })
  for (const f of ['title', 'rationale', 'mintedAt'] as const) {
    if (m[f].trim() === '') errors.push({ kind: 'missing_field', field: f })
  }
  // Kendini devralan dönem, soy zincirinde sonsuz döngüdür.
  if (m.supersedes !== null && m.supersedes === m.slug) {
    errors.push({ kind: 'self_supersede', slug: m.slug })
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: m }
}

/**
 * Varlık damgası — üretim anında basılır, **sonradan asla** (R-11).
 *
 * Altı alanın hepsi zorunlu ve hiçbirinin varsayılanı yok. Varsayılan olsaydı damga
 * "vardı ama boştu" durumuna düşerdi ve bu, hiç olmamasından kötüdür: alan dolu
 * görünür, denetim yeşil rapor verir, eşleşme yine de kayıptır.
 */
export interface AssetStamp {
  readonly brandId: BrandId
  readonly eraId: EraId
  /** Marka kiti sürümü — token ve font seti bu sürümle dondurulur. */
  readonly kitVersion: string
  /** Varlık tipi tanımının özeti: şema değişince eski varlık ayırt edilir. */
  readonly definitionDigest: string
  /** Hangi bağlam enjekte edildi (§5.3 manifesti). */
  readonly contextManifest: string
  /** Hangi çalıştırma üretti (§13). */
  readonly sourceRunId: string
}

/**
 * Damgayı doğrular. **Eksik alan = varlık üretilemez.**
 *
 * `RENDER` ve `PROPOSE` bu kontrolden geçmeden çıktı yazamaz; retrofit imkânsız
 * olduğu için "sonra ekleriz" diye bir yol bırakılmadı.
 */
export const validateStamp = (s: Partial<AssetStamp>): EraResult<AssetStamp> => {
  const gerekli: readonly (keyof AssetStamp)[] = [
    'brandId',
    'eraId',
    'kitVersion',
    'definitionDigest',
    'contextManifest',
    'sourceRunId',
  ]
  const errors: EraError[] = []
  const dolu: Record<string, string> = {}
  for (const f of gerekli) {
    const v = s[f]
    if (typeof v !== 'string' || v.trim() === '') {
      errors.push({ kind: 'missing_stamp_field', field: f })
    } else {
      dolu[f] = v
    }
  }
  if (errors.length > 0) return { ok: false, errors }
  // Alanların hepsi doğrulandıktan SONRA tek bir dar cast. `as unknown as` kullanılmıyor:
  // o biçim `attributes-acici` darboğazının yasakladığı biçimdir (D-77) ve burada
  // gerekmiyor da — `dolu` zaten doğru şekle sahip, yalnız marka tipleri daraltılıyor.
  return {
    ok: true,
    value: {
      brandId: dolu['brandId'] as BrandId,
      eraId: dolu['eraId'] as EraId,
      kitVersion: dolu['kitVersion'] ?? '',
      definitionDigest: dolu['definitionDigest'] ?? '',
      contextManifest: dolu['contextManifest'] ?? '',
      sourceRunId: dolu['sourceRunId'] ?? '',
    },
  }
}
