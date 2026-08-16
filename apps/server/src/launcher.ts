// Run Launcher verisi (§8.3, §12.9 · R-07, R-47 · FAZ-4.6b).
//
// Ekranın sorusu: **"bunu başlatırsam ne olur ve kaça mal olur?"** Cevap, para
// harcamadan verilir (R-47) ve verildiği ANDA DONAR (R-07) — çünkü onay, gösterilen
// plana verilir, bir süre sonra yeniden hesaplanacak bir plana değil.
//
// **Tahmin bir BANT, gerçek bir NOKTADIR** (§8.3). Tek sayı göstermek, aralığın
// üst ucunda gelen faturayı "hata" gibi hissettirir; oysa aralık zaten onu söylüyordu.

import { join } from 'node:path'
import {
  freezePlan,
  launchBlocks,
  blockMessage,
  plan,
  pricingFromDescriptor,
  type FrozenPlan,
  type LaunchBlock,
  type StaleCheck,
} from '@suite/engine'
import { loadPipeline, listPipelines } from '@suite/registry'
import { descriptorDigests, loadDescriptors, type ProviderDescriptor } from '@suite/providers'
import type { BrandId, EraId, Money, RunId } from '@suite/contracts'

export interface LauncherGirdisi {
  readonly repoRoot: string
  readonly pipelineId: string
  readonly runId: RunId
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly frozenAt: string
  readonly recordIds: readonly string[]
  /** Bütçe tavanı — **UI'dan ayarlanır** (D-17). `null` = tavan yok. */
  readonly cap: Money | null
  readonly env: Readonly<Record<string, string>>
}

export interface LauncherSonuc {
  readonly ok: boolean
  readonly hata?: string
  readonly frozen?: FrozenPlan
  /** Başlat kilitliyse sebepleri — boşsa açık. */
  readonly bloklar?: readonly { readonly kind: string; readonly mesaj: string }[]
  /** Adım başına güven noktası — `red` bir adım tahminin tamamını şüpheli yapar. */
  readonly guven?: Readonly<Record<string, string | null>>
}

/**
 * Planı kurar ve DONDURUR. Hiçbir şey harcamaz: `plan()` kuru ikizleri çağırır (R-47).
 *
 * Tanımlayıcı özetleri dosya içeriğinden hesaplanır — tanımlayıcı değişirse özet
 * değişir ve `planStale` bunu bildirir. Sürüm numarasına güvenmek yetmezdi: kimse
 * sürümü artırmadan da dosyayı düzenleyebilir.
 */
export const launcherPlani = (g: LauncherGirdisi): LauncherSonuc => {
  const pipelinesDir = join(g.repoRoot, 'registry/pipelines')
  if (!listPipelines(pipelinesDir).includes(g.pipelineId)) {
    return { ok: false, hata: `pipeline yok: ${g.pipelineId}` }
  }
  const cozum = loadPipeline(pipelinesDir, g.pipelineId)
  if (!cozum.ok) return { ok: false, hata: `pipeline çözülemedi: ${g.pipelineId}` }

  const { descriptors } = loadDescriptors(join(g.repoRoot, 'registry/providers'))
  const aktif = descriptors.filter((d: ProviderDescriptor) => d.enabled)

  const sonuc = plan({
    pipeline: cozum.value,
    runId: g.runId,
    brandId: g.brandId,
    eraId: g.eraId,
    env: g.env,
    pricing: Object.fromEntries(
      aktif.flatMap((d: ProviderDescriptor) =>
        d.capabilities.map((c) => [d.id, pricingFromDescriptor(d, c.name)])
      )
    ),
  })
  if (!sonuc.ok) {
    return { ok: false, hata: `plan üretilemedi: ${sonuc.errors.map((e) => e.kind).join(', ')}` }
  }

  const frozen = freezePlan({
    report: sonuc.report,
    runId: g.runId,
    corpusCommit: g.corpusCommit,
    registryCommit: g.registryCommit,
    frozenAt: g.frozenAt,
    recordIds: g.recordIds,
    descriptorDigests: descriptorDigests(
      join(g.repoRoot, 'registry/providers'),
      aktif.map((d: ProviderDescriptor) => d.id)
    ),
  })

  const bloklar = launchBlocks(frozen, g.cap).map((b: LaunchBlock) => ({
    kind: b.kind,
    mesaj: blockMessage(b),
  }))

  const guven: Record<string, string | null> = {}
  for (const s of frozen.steps) guven[s.stepId] = s.confidence

  return { ok: true, frozen, bloklar, guven }
}

/**
 * Bugünün dünyası — donmuş bir planın hâlâ geçerli olup olmadığını ölçmek için (§13).
 *
 * `planStale` bunu ister ve **tahmin etmez**: eksik bir dünya tanımıyla çağrılsaydı
 * "fark yok" cevabı verir, oysa doğrusu "ölçemedim" olurdu (D-175). Bu yüzden dünya
 * açıkça kurulur ve çağıran, kuramadığında `null` geçer.
 */
export const dunyaDurumu = (
  repoRoot: string,
  corpusCommit: string,
  registryCommit: string
): StaleCheck => {
  const { descriptors } = loadDescriptors(join(repoRoot, 'registry/providers'))
  const aktif = descriptors.filter((d: ProviderDescriptor) => d.enabled)
  return {
    corpusCommit,
    registryCommit,
    descriptorDigests: descriptorDigests(
      join(repoRoot, 'registry/providers'),
      descriptors.map((d: ProviderDescriptor) => d.id)
    ),
    availableProviders: new Set(aktif.map((d: ProviderDescriptor) => d.id)),
  }
}
