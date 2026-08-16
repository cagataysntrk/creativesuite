// TEK yapılandırma çözücü (§3.3 · chokepoints.json → `yapilandirma-cozucu`).
//
// Registry YAML'ı iki farklı yerde çözülürse, UI'ın gördüğü pipeline ile motorun
// çalıştırdığı pipeline AYRIŞIR — ve kullanıcı onayladığı şeyden başkasını çalıştırmış olur.
//
// **Model adı yazılamaz** (R-40). Pipeline yetenek + kısıt ister; hangi modelin
// kullanılacağı yönlendiricinin kararıdır. Model ID'si pipeline'da olsaydı, sağlayıcı
// öldüğü gün kırılan bir varsayım olurdu (D-32).

import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { parseYaml, VERBS_SET } from './internal.js'

export interface PipelineStep {
  readonly id: string
  readonly verb: string
  /** Yetenek adı — `image.generate` gibi. Fiil adı DEĞİL (§3.10). */
  readonly capability: string | null
  readonly constraints: Readonly<Record<string, unknown>>
  /** Bu adım hangi adımlardan sonra koşar. Boşsa DAG'ın kökü. */
  readonly needs: readonly string[]
  /** İnsan kapısı — onay bir yan etki değil, bir kapıdır (§4c). */
  readonly gate: string | null
}

/** Matris ekseni — `ad` ölçülen değişken, `duzeyler` denenen değerler. */
export interface PipelineEksen {
  readonly ad: string
  readonly duzeyler: readonly string[]
}

/**
 * Varyant matrisi — hat dosyasındaki `matris:` bloğu (§10 · D-225 · FAZ-8.1).
 *
 * **Burası yalnız ŞEKLİ okur, tasarımı yargılamaz.** Eksenin diklikli olup olmadığı
 * (`tek_duzeyli_eksen`, OFAT sapması) `packages/engine`'in işi — registry engine'i
 * import edemez (halka yönü, §3.6). Ayrım keyfi değil: registry "dosyada ne yazıyor"
 * sorusunu, engine "bu tasarım para karşılığında bilgi üretir mi" sorusunu cevaplar.
 */
export interface PipelineMatris {
  readonly mod: 'ofat' | 'full'
  readonly eksenler: readonly PipelineEksen[]
}

/**
 * Çıktı sınıfı — **politika buradan okunur, hattın ADINDAN değil** (§11.2 · D-229).
 *
 * `reklam`: Meta'nın kişisel özellik kuralı geçerli; reklam metni linter'ı koşar.
 * `organik`: geçerli değil — bir LinkedIn postuna reklam standardı uygulamak, kuralı
 * olmadığı yere taşımak olurdu.
 *
 * ⚠ Bu alan bir hattın `id`siyle karşılaştırma yapılmasın diye var. `id === 'ad-...'`
 * yazan bir satır, hat yeniden adlandırıldığı gün linter'ı **sessizce** kapatır ve
 * hiçbir test kırmızıya dönmez: yasak, yasağın yokluğuna dönüşür.
 */
export type CiktiSinifi = 'reklam' | 'organik'

export interface Pipeline {
  readonly id: string
  readonly title: string
  readonly ciktiSinifi: CiktiSinifi
  readonly steps: readonly PipelineStep[]
  /**
   * `null` = bu hat tek varyant üretir.
   *
   * ⚠ Bu alan FAZ-8 doğrulamasında **eksikti**: `matris:` bloğu YAML'da duruyor,
   * `matris` kapısı onu dosyadan okuyup doğruluyor, ama çözücü bloğu tamamen
   * düşürüyordu — yani çalışma zamanında matris YOKTU. Kapının yeşili, üretim
   * yolunun o veriyi gördüğünü göstermez (D-228).
   */
  readonly matris: PipelineMatris | null
}

export type ResolveError =
  | { readonly kind: 'invalid_yaml'; readonly message: string }
  | { readonly kind: 'not_a_map' }
  | { readonly kind: 'missing_field'; readonly field: string }
  | { readonly kind: 'unknown_verb'; readonly step: string; readonly verb: string }
  | { readonly kind: 'model_id_in_pipeline'; readonly step: string; readonly key: string }
  | { readonly kind: 'unknown_dependency'; readonly step: string; readonly needs: string }
  | { readonly kind: 'duplicate_step'; readonly step: string }
  | { readonly kind: 'cycle'; readonly steps: readonly string[] }
  /** `matris:` bloğu var ama şekli tutmuyor — sessizce yok saymak maliyeti gizlerdi. */
  | { readonly kind: 'bad_matris'; readonly reason: string }
  /** `cikti_sinifi:` tanınmayan bir değer taşıyor — sessizce `organik`e düşmez. */
  | { readonly kind: 'bad_cikti_sinifi'; readonly value: string }

export type ResolveResult =
  | { readonly ok: true; readonly value: Pipeline }
  | { readonly ok: false; readonly errors: readonly ResolveError[] }

/**
 * Model/sağlayıcı adını ele veren anahtarlar (R-40).
 * Kısıtlarda `model`, `provider`, `model_id` gibi bir anahtar görürsek pipeline
 * yönlendiriciyi atlamaya çalışıyordur.
 */
const YASAK_ANAHTARLAR = ['model', 'model_id', 'provider', 'provider_id', 'engine', 'endpoint']

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)

/**
 * `matris:` bloğunu okur. **Yokluk hata değil** — hatların çoğu tek varyant üretir.
 * Ama VARSA ve bozuksa hata: bozuk bir bloğu yok saymak, kullanıcının yazdığı maliyet
 * çarpanının sessizce 1 olması demektir.
 */
const parseMatris = (
  raw: unknown,
  errors: ResolveError[]
): { readonly mod: 'ofat' | 'full'; readonly eksenler: readonly PipelineEksen[] } | null => {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    errors.push({ kind: 'bad_matris', reason: 'matris bir eşleme değil' })
    return null
  }
  const m = raw as Record<string, unknown>

  // Varsayılan `ofat` bir maliyet kararıdır (D-225), sessiz bir kolaylık değil:
  // 3×3×3'te OFAT 7 render, tam çapraz çarpım 27.
  const modRaw = m['mod'] === undefined ? 'ofat' : str(m['mod'])
  if (modRaw !== 'ofat' && modRaw !== 'full') {
    errors.push({ kind: 'bad_matris', reason: `bilinmeyen mod: ${String(m['mod'])}` })
    return null
  }

  const rawEksenler = Array.isArray(m['eksenler']) ? (m['eksenler'] as unknown[]) : null
  if (rawEksenler === null || rawEksenler.length === 0) {
    errors.push({ kind: 'bad_matris', reason: 'matris var ama eksen yok' })
    return null
  }

  const eksenler: PipelineEksen[] = []
  for (const e of rawEksenler) {
    const eo = (typeof e === 'object' && e !== null ? e : {}) as Record<string, unknown>
    const ad = str(eo['ad'])
    if (ad === null) {
      errors.push({ kind: 'bad_matris', reason: 'eksenin adı yok' })
      continue
    }
    const duzeyler = Array.isArray(eo['duzeyler'])
      ? (eo['duzeyler'] as unknown[]).filter((x): x is string => typeof x === 'string')
      : []
    if (duzeyler.length === 0) {
      errors.push({ kind: 'bad_matris', reason: `'${ad}' ekseninin düzeyi yok` })
      continue
    }
    eksenler.push({ ad, duzeyler })
  }

  return eksenler.length === 0 ? null : { mod: modRaw, eksenler }
}

export const parsePipeline = (text: string): ResolveResult => {
  const y = parseYaml(text)
  if (!y.ok) return { ok: false, errors: [{ kind: 'invalid_yaml', message: y.message }] }
  const d = y.value
  if (d === null || typeof d !== 'object' || Array.isArray(d)) {
    return { ok: false, errors: [{ kind: 'not_a_map' }] }
  }
  const map = d as Record<string, unknown>
  const errors: ResolveError[] = []

  const id = str(map['id'])
  const title = str(map['title'])
  if (id === null) errors.push({ kind: 'missing_field', field: 'id' })
  if (title === null) errors.push({ kind: 'missing_field', field: 'title' })

  const rawSteps = Array.isArray(map['steps']) ? (map['steps'] as unknown[]) : null
  if (rawSteps === null || rawSteps.length === 0) {
    errors.push({ kind: 'missing_field', field: 'steps' })
    return { ok: false, errors }
  }

  const steps: PipelineStep[] = []
  const gorulen = new Set<string>()

  for (const [i, raw] of rawSteps.entries()) {
    const s = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
    const sid = str(s['id']) ?? `#${i}`
    if (gorulen.has(sid)) errors.push({ kind: 'duplicate_step', step: sid })
    gorulen.add(sid)

    const verb = str(s['verb']) ?? ''
    if (!VERBS_SET.has(verb)) errors.push({ kind: 'unknown_verb', step: sid, verb })

    const constraints = (
      typeof s['constraints'] === 'object' && s['constraints'] !== null ? s['constraints'] : {}
    ) as Record<string, unknown>

    for (const k of Object.keys(constraints)) {
      if (YASAK_ANAHTARLAR.includes(k)) {
        errors.push({ kind: 'model_id_in_pipeline', step: sid, key: k })
      }
    }

    steps.push({
      id: sid,
      verb,
      capability: str(s['capability']),
      constraints,
      needs: Array.isArray(s['needs'])
        ? (s['needs'] as unknown[]).filter((x): x is string => typeof x === 'string')
        : [],
      gate: str(s['gate']),
    })
  }

  // Bağımlılıklar gerçek adımlara işaret etmeli.
  for (const s of steps) {
    for (const n of s.needs) {
      if (!gorulen.has(n)) errors.push({ kind: 'unknown_dependency', step: s.id, needs: n })
    }
  }

  // Döngü kontrolü: döngülü bir DAG çalıştırma anında SONSUZ bekler ve teşhisi zordur.
  const dongu = findCycle(steps)
  if (dongu !== null) errors.push({ kind: 'cycle', steps: dongu })

  const matris = parseMatris(map['matris'], errors)

  // Varsayılan `organik`: reklam kuralları ancak AÇIKÇA beyan edilince koşar. Ters
  // varsayılan (her şey reklam) linter'ı gürültüye çevirir ve gürültülü şey kapatılır.
  const ciktiRaw = map['cikti_sinifi'] === undefined ? 'organik' : str(map['cikti_sinifi'])
  if (ciktiRaw !== 'reklam' && ciktiRaw !== 'organik') {
    errors.push({ kind: 'bad_cikti_sinifi', value: String(map['cikti_sinifi']) })
  }

  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: {
      id: id as string,
      title: title as string,
      ciktiSinifi: ciktiRaw as CiktiSinifi,
      steps,
      matris,
    },
  }
}

/** Kahn benzeri gezinti; döngüye giren adım zincirini döndürür. */
const findCycle = (steps: readonly PipelineStep[]): string[] | null => {
  const byId = new Map(steps.map((s) => [s.id, s]))
  const durum = new Map<string, 'ziyaret' | 'bitti'>()
  const yol: string[] = []

  const gez = (id: string): string[] | null => {
    const d = durum.get(id)
    if (d === 'bitti') return null
    if (d === 'ziyaret') return [...yol.slice(yol.indexOf(id)), id]
    durum.set(id, 'ziyaret')
    yol.push(id)
    for (const n of byId.get(id)?.needs ?? []) {
      const c = gez(n)
      if (c !== null) return c
    }
    yol.pop()
    durum.set(id, 'bitti')
    return null
  }

  for (const s of steps) {
    const c = gez(s.id)
    if (c !== null) return c
  }
  return null
}

/** Topolojik sıra — motorun adımları hangi sırayla koşacağı. */
export const topoOrder = (p: Pipeline): readonly string[] => {
  const byId = new Map(p.steps.map((s) => [s.id, s]))
  const bitti = new Set<string>()
  const sira: string[] = []
  const gez = (id: string): void => {
    if (bitti.has(id)) return
    for (const n of byId.get(id)?.needs ?? []) gez(n)
    bitti.add(id)
    sira.push(id)
  }
  for (const s of p.steps) gez(s.id)
  return sira
}

export const loadPipeline = (root: string, id: string): ResolveResult =>
  parsePipeline(readFileSync(join(root, `${id}.pipeline.yaml`), 'utf8'))

export const listPipelines = (root: string): readonly string[] => {
  try {
    return readdirSync(root)
      .filter((f) => f.endsWith('.pipeline.yaml'))
      .map((f) => basename(f, '.pipeline.yaml'))
      .sort()
  } catch {
    return []
  }
}
