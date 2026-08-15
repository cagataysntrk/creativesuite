// Run manifest sözleşmesi (§13 · chokepoints.json → `manifest-yazici`).
//
// Langfuse yok, MLflow yok, W&B yok. Self-host'ları Postgres + ClickHouse demek — tam da
// ihmal edilince çürüyen altyapı (ilke 12). Git'teki manifest grep'lenebilir,
// diff'lenebilir, sunucusuz ve zaten gereken maliyet denetim izini de veriyor.
//
// **Manifest'siz çıktı bir HATADIR.** Bir varlık üretildi ama hangi markanın hangi
// döneminden, hangi corpus commit'inden, hangi sağlayıcıyla ve kaça üretildiği
// yazılmadıysa o varlık denetlenemez — ve denetlenemeyen bir varlık prospect'e gidemez.
//
// `derived/runs/` TÜRETİLEMEZ (D-38): bu dosyanın yazdığı şey corpus'tan yeniden
// üretilemez, çünkü hangi sağlayıcıya ne gönderildiği başka hiçbir yerde yazmıyor.

import type { BrandId, EraId, Money, MoneyRange, RunId, StepId, VerbName } from '@suite/contracts'
import { ZERO_USD, addMoney } from '@suite/contracts'
import type { Timestamp } from '@suite/contracts'

/** Bedava/premium şerit seçimi (D-2). Sözleşmede DONMUŞ — üçüncü şerit yok. */
export type Lane = 'free' | 'premium'

/**
 * Bir sağlayıcı adayı ve akıbeti.
 * **Kaybedenler de yazılır.** Yalnız kazananı kaydetmek, yönlendirmeyi sihre çevirir:
 * altı ay sonra "neden bu model seçildi" sorusunun cevabı hiçbir yerde olmaz (§4.4).
 */
export interface ProviderCandidate {
  readonly providerId: string
  readonly capability: string
  readonly selected: boolean
  /** Elendiyse NEDEN elendi. `selected: true` ise `null`. */
  readonly rejectionReason: string | null
  readonly estimatedCost: MoneyRange | null
}

/** İnsan kapısı kararı (§4c). Onay bir yan etki değil, bir KAPIDIR. */
export interface HumanDecision {
  readonly gate: string
  readonly decision: 'approved' | 'rejected' | 'edited'
  readonly at: Timestamp
  /** Red gerekçesi kalıcıdır ve sonraki çalıştırmaya negatif kısıt olarak girer (§12.9). */
  readonly note: string | null
}

export interface StepRecord {
  readonly stepId: StepId
  readonly verb: VerbName
  readonly lane: Lane
  /** Yetenek adı — fiil adı DEĞİL (§3.10). `image.generate` gibi. */
  readonly capability: string | null
  readonly providerId: string | null
  readonly model: string | null
  readonly seed: number | null
  readonly params: Readonly<Record<string, unknown>>
  readonly estimatedCost: MoneyRange
  /** Adım henüz koşmadıysa `null`. Tahmin ile gerçeği ayırmayan defter sapmayı ölçemez. */
  readonly actualCost: Money | null
  readonly candidates: readonly ProviderCandidate[]
  readonly startedAt: Timestamp | null
  readonly finishedAt: Timestamp | null
}

/** Enjekte edilen bağlamın özeti — hangi kayıt, neden dahil edildi, kaç token (§5.3). */
export interface ContextManifestEntry {
  readonly recordId: string
  readonly section: string
  readonly tokens: number
  readonly reason: string
}

export interface RunManifest {
  readonly runId: RunId
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  readonly pipeline: string

  /**
   * Bilgi ağacı commit SHA'sı — replay'i GERÇEK yapan alan.
   * Prompt'lar haftalık değişen dosyalardan derleniyor; "aynı girdiyle tekrar çalıştır"
   * ancak aynı ağaçta anlamlıdır (§13).
   */
  readonly corpusCommit: string
  readonly registryCommit: string

  readonly createdAt: Timestamp
  readonly steps: readonly StepRecord[]
  readonly decisions: readonly HumanDecision[]
  readonly context: readonly ContextManifestEntry[]

  /**
   * Bağlam anlık görüntüsünün saklama süresi (V-11 · D-63).
   * `null` = süresiz. Manifest sonsuza saklanır; BAĞLAM (tam prompt metni) N gün.
   */
  readonly contextRetentionDays: number | null
}

// ── doğrulama: manifest'siz veya eksik manifest'li çıktı bir HATADIR ─────────

export type ManifestDefect =
  | { readonly kind: 'missing_manifest' }
  | { readonly kind: 'missing_field'; readonly field: string }
  | { readonly kind: 'no_steps' }
  | { readonly kind: 'step_without_candidates'; readonly stepId: string }
  | { readonly kind: 'metered_step_without_cost'; readonly stepId: string }
  | { readonly kind: 'selected_with_rejection'; readonly stepId: string }
  | { readonly kind: 'no_selected_provider'; readonly stepId: string }

/** Ağ/model çağıran fiiller — bunların maliyeti yazılmadan çalıştırma kapanamaz (§8.3). */
const METERED: ReadonlySet<VerbName> = new Set<VerbName>([
  'GENERATE',
  'RENDER',
  'PUBLISH',
  'INGEST',
])

const REQUIRED_FIELDS = [
  'runId',
  'brandId',
  'eraId',
  'pipeline',
  'corpusCommit',
  'registryCommit',
  'createdAt',
] as const

/**
 * Manifest'i denetler. Boş dizi = temiz.
 * `throw` etmez: kusur bir DEĞERDİR ve çağıran onu kullanıcıya gösterebilmeli (§8.6).
 */
export const inspectManifest = (m: RunManifest | null | undefined): ManifestDefect[] => {
  if (m === null || m === undefined) return [{ kind: 'missing_manifest' }]

  const defects: ManifestDefect[] = []

  for (const f of REQUIRED_FIELDS) {
    const v = m[f]
    if (typeof v !== 'string' || v.trim() === '') defects.push({ kind: 'missing_field', field: f })
  }

  if (m.steps.length === 0) defects.push({ kind: 'no_steps' })

  for (const s of m.steps) {
    // Sağlayıcı seçen her adım adaylarını yazmak zorunda — kaybedenler dahil.
    if (s.providerId !== null && s.candidates.length === 0) {
      defects.push({ kind: 'step_without_candidates', stepId: s.stepId })
    }
    if (s.candidates.length > 0 && !s.candidates.some((c) => c.selected)) {
      defects.push({ kind: 'no_selected_provider', stepId: s.stepId })
    }
    for (const c of s.candidates) {
      // Seçilen aday red gerekçesi taşıyamaz: taşıyorsa defter kendi içinde çelişir.
      if (c.selected && c.rejectionReason !== null) {
        defects.push({ kind: 'selected_with_rejection', stepId: s.stepId })
        break
      }
    }
    if (METERED.has(s.verb) && s.finishedAt !== null && s.actualCost === null) {
      defects.push({ kind: 'metered_step_without_cost', stepId: s.stepId })
    }
  }

  return defects
}

export const isPublishable = (m: RunManifest | null | undefined): boolean =>
  inspectManifest(m).length === 0

// ── maliyet toplamı: tahmin vs gerçek ────────────────────────────────────────

export interface CostSummary {
  readonly estimatedLow: Money
  readonly estimatedHigh: Money
  readonly actual: Money
  /** Gerçek, tahmin bandının DIŞINDA mı — %20 sapma denetiminin girdisi (§16). */
  readonly outsideBand: boolean
}

export const costSummary = (m: RunManifest): CostSummary => {
  let low = ZERO_USD
  let high = ZERO_USD
  let actual = ZERO_USD

  for (const s of m.steps) {
    low = addMoney(low, s.estimatedCost.low)
    high = addMoney(high, s.estimatedCost.high)
    if (s.actualCost !== null) actual = addMoney(actual, s.actualCost)
  }

  return {
    estimatedLow: low,
    estimatedHigh: high,
    actual,
    outsideBand: actual.micros < low.micros || actual.micros > high.micros,
  }
}
