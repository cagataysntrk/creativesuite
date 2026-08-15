// OpenAPI → tanımlayıcı TASLAĞI (§8.1 · FAZ-3.4 · V-04).
//
// **İçe aktarıcı bir kolaylıktır, bir otorite değildir.** OpenAPI bir sağlayıcının
// *şeklini* söyler — hangi alanlar var, hangi enum değerleri kabul ediliyor. Söylemediği
// şeyler şunlar: fiyat, kalite, gecikme, şerit. Yani içe aktarma bir tanımlayıcının
// **yarısını** üretir ve kalan yarısı bir insan kararıdır.
//
// Bu yüzden üretilen taslak **daima** `adapter: pending` ve `enabled: false` taşır. Şerit
// ataması, fiyat anlık görüntüsü ve maliyet formülü elle eklenir; eklenene kadar
// `providers` kapısı sağlayıcıyı aday listesine sokmaz. Otomatik `enabled: true` üreten
// bir içe aktarıcı, doğrulanmamış fiyatla maliyet tahmini yapan bir sisteme giden
// en kısa yoldur.
//
// **Elle yazma yedeği birinci sınıftır.** `parseDescriptor` elle yazılmış YAML'ı da aynı
// sözleşmeye tabi tutar; içe aktarıcı yalnızca ilk taslağı hızlandırır. fal'ın endpoint
// başına OpenAPI'si bugün kimlik doğrulamasız çalışıyor (V-04, 2026-08-15) ama yarın
// kapanabilir — kapandığında sistem çalışmaya devam eder, sadece taslak elle yazılır.

import { asciiLower } from '@suite/kernel'
import type { Lane } from './types.js'

/** OpenAPI'nin okuduğumuz kadarı. Tam bir ayrıştırıcı değil — ihtiyacımız olan alanlar. */
interface OpenApiDoc {
  readonly openapi?: unknown
  readonly info?: {
    readonly title?: unknown
    readonly 'x-fal-metadata'?: { readonly endpointId?: unknown; readonly category?: unknown }
  }
  readonly components?: { readonly schemas?: Record<string, unknown> }
}

export interface ImportedDraft {
  readonly id: string
  readonly title: string
  readonly capability: string
  /** Girdi şemasından okunan enum'lar — tanımlayıcının `supports` bloğu olur. */
  readonly supports: Readonly<Record<string, readonly string[]>>
  /** İnsanın doldurması gereken alanlar. Boş bırakılamaz, tahmin edilemez. */
  readonly needsHuman: readonly string[]
}

export type ImportError =
  | { readonly kind: 'not_openapi' }
  | { readonly kind: 'no_input_schema' }
  | { readonly kind: 'unmappable_category'; readonly category: string }

export type ImportResult =
  | { readonly ok: true; readonly value: ImportedDraft }
  | { readonly ok: false; readonly error: ImportError }

/**
 * OpenAPI kategorisi → yetenek adı. Tablo **kapalı**: eşleşmeyen kategori bir hata verir,
 * uydurulmuş bir yetenek adı değil. Tanımadığımız bir kategoriye isim uydurmak,
 * yönlendiricinin hiçbir zaman bulamayacağı bir aday üretir.
 */
const KATEGORI_YETENEK: Readonly<Record<string, string>> = {
  'text-to-image': 'image.generate',
  'image-to-image': 'image.edit',
  'text-to-video': 'video.generate',
  'image-to-video': 'video.generate',
  'text-to-audio': 'audio.tts',
  'text-to-speech': 'audio.tts',
}

/** Şerit ataması ASLA çıkarılmaz — fiyatı bilmeden şerit demek, fiyatı uydurmaktır. */
const INSAN_ALANLARI: readonly string[] = [
  'lanes', // fiyat bilinmeden şerit atanamaz (§8.2)
  'pricing_snapshot', // OpenAPI fiyat taşımaz
  'cost_formula', // maliyet modeli sağlayıcının belgesinde, şemasında değil
  'auth_env', // hangi ortam değişkeni — repo kararı, sağlayıcı kararı değil
  'adapter', // gövde yazılana kadar `pending`
]

const dize = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null)

/**
 * `fal-ai/flux/dev` → `fal-flux-dev`. Nokta ve eğik çizgi dosya adına ve YAML anahtarına
 * girmez; tanımlayıcı id'si bir dosya adı olarak da yaşayacak.
 *
 * Küçültme `asciiLower` ile: bu dize zaten `[^A-Za-z0-9]` ayıklamasından geçti, ama
 * "burada Türkçe olamaz" muhakemesi tam olarak kapıların aşındığı yerdir — case
 * dönüşümünün tek yetkili yeri kernel'dir (R-21).
 */
const kimlige = (endpointId: string): string =>
  asciiLower(
    endpointId
      .replace(/^fal-ai\//, 'fal-')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )

/** Bir JSON Schema nesnesinden `enum` listelerini toplar — `anyOf` dalları dahil. */
const enumlar = (sema: unknown): Readonly<Record<string, readonly string[]>> => {
  const s = sema as { properties?: Record<string, unknown> } | null
  if (s === null || typeof s !== 'object' || typeof s.properties !== 'object') return {}
  const cikti: Record<string, readonly string[]> = {}
  for (const [ad, ham] of Object.entries(s.properties as Record<string, unknown>)) {
    const p = ham as { enum?: unknown; anyOf?: unknown }
    const dallar = Array.isArray(p.anyOf) ? p.anyOf : []
    const kaynak = Array.isArray(p.enum)
      ? p.enum
      : (
          dallar.find((d) => Array.isArray((d as { enum?: unknown }).enum)) as
            { enum: unknown[] } | undefined
        )?.enum
    if (!Array.isArray(kaynak)) continue
    const degerler = kaynak.filter((v): v is string => typeof v === 'string')
    if (degerler.length > 0) cikti[ad] = degerler
  }
  return cikti
}

export const importOpenApi = (doc: unknown): ImportResult => {
  const d = doc as OpenApiDoc | null
  if (d === null || typeof d !== 'object' || dize(d.openapi) === null) {
    return { ok: false, error: { kind: 'not_openapi' } }
  }
  const meta = d.info?.['x-fal-metadata'] ?? {}
  const endpointId = dize(meta.endpointId) ?? dize(d.info?.title) ?? 'bilinmeyen'
  const kategori = dize(meta.category)
  if (kategori === null) return { ok: false, error: { kind: 'unmappable_category', category: '' } }
  const capability = KATEGORI_YETENEK[kategori]
  if (capability === undefined) {
    return { ok: false, error: { kind: 'unmappable_category', category: kategori } }
  }

  const semalar = d.components?.schemas ?? {}
  const girdiAdi = Object.keys(semalar).find((k) => k.endsWith('Input'))
  if (girdiAdi === undefined) return { ok: false, error: { kind: 'no_input_schema' } }

  return {
    ok: true,
    value: {
      id: kimlige(endpointId),
      title: dize(d.info?.title) ?? endpointId,
      capability,
      supports: enumlar(semalar[girdiAdi]),
      needsHuman: INSAN_ALANLARI,
    },
  }
}

/**
 * Taslağı YAML'a döker. **Şerit boş bırakılır** ve `TODO` ile işaretlenir: dosya bu hâliyle
 * `parseDescriptor`'dan geçmez (`lanes` boş → `missing_field`). Kasıtlı — yarım bir
 * tanımlayıcının sessizce geçerli sayılması, en tehlikeli sonuç olurdu.
 */
export const draftToYaml = (draft: ImportedDraft): string => {
  const satirlar: string[] = [
    `# OpenAPI'den ÜRETİLMİŞ TASLAK — elle tamamlanmadan geçerli değil.`,
    `# İnsan doldurmalı: ${draft.needsHuman.join(', ')}`,
    `id: ${draft.id}`,
    `title: ${JSON.stringify(draft.title)}`,
    `adapter: pending`,
    `enabled: false`,
    `auth_env: null # TODO: ortam değişkeninin ADI (R-51 — anahtarın kendisi değil)`,
    `pricing_snapshot: null # TODO: _pricing/<sağlayıcı>-<tarih>.json`,
    `capabilities:`,
    `  - name: ${draft.capability}`,
    `    lanes: [] # TODO: free|premium — fiyat doğrulanmadan atanamaz`,
  ]
  const anahtarlar = Object.keys(draft.supports)
  if (anahtarlar.length === 0) satirlar.push(`    supports: {}`)
  else {
    satirlar.push(`    supports:`)
    for (const k of anahtarlar) {
      satirlar.push(`      ${k}: [${(draft.supports[k] ?? []).map((v) => `'${v}'`).join(', ')}]`)
    }
  }
  return `${satirlar.join('\n')}\n`
}

/** Şerit tipini kullanan tek yer — içe aktarıcının şerit ATAMADIĞINI tipte de belli eder. */
export const IMPORTED_LANES: readonly Lane[] = []
