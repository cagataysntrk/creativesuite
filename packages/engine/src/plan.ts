// Kuru çalıştırma planı (§8.3, §15 · R-47).
//
// **Hiçbir şey harcamaz, hiçbir yere yazmaz, ağa çıkmaz.** `just plan`'ı dürüst yapan
// tek şey budur: her metered fiilin kuru ikizi var ve plan yalnız onları çağırır.
//
// **Kuru ikizi olmayan bir fiil SESSİZCE ATLANMAZ** — plan hata verir. Atlansaydı,
// çalıştırma öncesi gösterilen maliyet o adımı hiç saymaz ve kullanıcı gerçekte
// ödeyeceğinden az bir rakama onay verirdi.

import type { BrandId, EraId, Money, MoneyRange, RunId, StepId, VerbName } from '@suite/contracts'
import { VERBS, ZERO_USD, addMoney } from '@suite/contracts'
import { getVerb, seededRng, fixedClock, type VerbContext } from '@suite/kernel'
import { topoOrder, type Pipeline } from '@suite/registry'
import { candidatesFor } from '@suite/providers'

export interface PlannedStep {
  readonly stepId: StepId
  readonly verb: VerbName
  readonly capability: string | null
  readonly effectClass: string
  readonly metered: boolean
  readonly needs: readonly string[]
  readonly gate: string | null
  readonly constraints: Readonly<Record<string, unknown>>
  readonly estimatedCost: MoneyRange
  readonly candidateProviders: readonly string[]
  /** Yeteneği yapabilen ama ŞU AN kullanılamayan sağlayıcılar — sessizce düşürülmez. */
  readonly unavailableProviders: readonly string[]
}

export interface PlanReport {
  readonly pipeline: string
  readonly title: string
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  readonly order: readonly string[]
  readonly steps: readonly PlannedStep[]
  readonly totalLow: Money
  readonly totalHigh: Money
  readonly meteredSteps: number
  readonly gates: readonly string[]
  /** Sağlayıcı henüz seçilmemiş metered adımlar — tahmin bu kadarıyla EKSİKTİR. */
  readonly unpricedSteps: readonly string[]
}

export type PlanError =
  | { readonly kind: 'unknown_verb'; readonly step: string; readonly verb: string }
  | { readonly kind: 'no_dry_twin'; readonly step: string; readonly verb: string }
  | { readonly kind: 'plan_threw'; readonly step: string; readonly message: string }

export type PlanResult =
  | { readonly ok: true; readonly report: PlanReport }
  | { readonly ok: false; readonly errors: readonly PlanError[] }

const VERB_SET: ReadonlySet<string> = new Set<string>(VERBS)

export interface PlanInput {
  readonly pipeline: Pipeline
  readonly runId: RunId
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  /** Ortam AÇIKÇA verilir: sağlayıcı kullanılabilirliği `PATH`e bakıyor (§3.8). */
  readonly env?: Readonly<Record<string, string>>
}

export const plan = (input: PlanInput): PlanResult => {
  const errors: PlanError[] = []
  const steps: PlannedStep[] = []
  let low = ZERO_USD
  let high = ZERO_USD
  const unpriced: string[] = []

  // Kuru çalıştırmada saat ve rastgelelik SABİT: aynı plan iki kez çağrıldığında
  // aynı çıktıyı vermeli, yoksa "plan değişti mi" sorusu cevaplanamaz.
  const clock = fixedClock('1970-01-01T00:00:00.000Z')
  const rng = seededRng(0)

  for (const s of input.pipeline.steps) {
    if (!VERB_SET.has(s.verb)) {
      errors.push({ kind: 'unknown_verb', step: s.id, verb: s.verb })
      continue
    }
    const verb = getVerb(s.verb as VerbName)

    if (typeof verb.plan !== 'function') {
      errors.push({ kind: 'no_dry_twin', step: s.id, verb: s.verb })
      continue
    }

    const ctx: VerbContext = {
      runId: input.runId,
      stepId: s.id as StepId,
      brandId: input.brandId,
      eraId: input.eraId,
      correlationId: `cor_plan_${s.id}` as VerbContext['correlationId'],
      clock,
      rng,
    }

    let vp
    try {
      vp = verb.plan(ctx, { constraints: s.constraints })
    } catch (e) {
      // Kuru ikiz PATLAMAMALI: sıfır ağ, sıfır yazma demek "hata da yok" demek.
      // Patlıyorsa fiil planda I/O yapmaya çalışıyordur ve bu sessizce geçilemez.
      errors.push({
        kind: 'plan_threw',
        step: s.id,
        message: e instanceof Error ? e.message : String(e),
      })
      continue
    }

    // Yetenek → aday sağlayıcılar. Seçim YAPILMAZ (o FAZ-3.5'in işi); yalnız kimin
    // yapabileceği listelenir. KULLANILAMAYANLAR da listelenir: "aday yok" ile "aday
    // var ama kurulu değil" farklı sorunlardır ve kullanıcıya farklı şey yaptırır.
    const adaylar = s.capability === null ? [] : candidatesFor(s.capability, input.env ?? {})
    const kullanilabilir = adaylar.filter((a) => a.available).map((a) => a.providerId)

    low = addMoney(low, vp.estimatedCost.low)
    high = addMoney(high, vp.estimatedCost.high)
    if (verb.metered && kullanilabilir.length === 0) unpriced.push(s.id)

    steps.push({
      stepId: s.id as StepId,
      verb: verb.name,
      capability: s.capability,
      effectClass: verb.effectClass,
      metered: verb.metered,
      needs: s.needs,
      gate: s.gate,
      constraints: s.constraints,
      estimatedCost: vp.estimatedCost,
      candidateProviders: kullanilabilir,
      unavailableProviders: adaylar.filter((a) => !a.available).map((a) => a.providerId),
    })
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    report: {
      pipeline: input.pipeline.id,
      title: input.pipeline.title,
      brandId: input.brandId,
      eraId: input.eraId,
      order: topoOrder(input.pipeline),
      steps,
      totalLow: low,
      totalHigh: high,
      meteredSteps: steps.filter((s) => s.metered).length,
      gates: steps.filter((s) => s.gate !== null).map((s) => s.gate as string),
      unpricedSteps: unpriced,
    },
  }
}

const usdStr = (m: Money): string => `$${(Number(m.micros) / 1_000_000).toFixed(4)}`

/** İnsan için metin çıktısı. Sayılar `tr-TR` biçiminde DEĞİL — CLI'da hizalama önemli. */
export const formatPlan = (r: PlanReport): string => {
  const satirlar: string[] = []
  satirlar.push(`  ${r.title}  (${r.pipeline})`)
  satirlar.push(`  marka ${r.brandId} · dönem ${r.eraId}`)
  satirlar.push('')
  satirlar.push('  sıra  adım              fiil      yetenek            şerit  bağımlı')
  satirlar.push('  ────  ────────────────  ────────  ─────────────────  ─────  ────────')

  const byId = new Map(r.steps.map((s) => [String(s.stepId), s]))
  r.order.forEach((id, i) => {
    const s = byId.get(id)
    if (s === undefined) return
    satirlar.push(
      `  ${String(i + 1).padStart(4)}  ${id.padEnd(16)}  ${s.verb.padEnd(8)}  ` +
        `${(s.capability ?? '—').padEnd(17)}  ${(s.metered ? 'ücret' : '—').padEnd(5)}  ` +
        `${s.needs.join(', ') || '—'}`
    )
    if (s.capability !== null) {
      const a = s.candidateProviders.length > 0 ? s.candidateProviders.join(', ') : '—'
      satirlar.push(`        └─ aday sağlayıcı: ${a}`)
      if (s.unavailableProviders.length > 0) {
        satirlar.push(`           kullanılamıyor: ${s.unavailableProviders.join(', ')}`)
      }
    }
    if (s.gate !== null) satirlar.push(`        └─ insan kapısı: ${s.gate}`)
  })

  satirlar.push('')
  satirlar.push(`  maliyet aralığı: ${usdStr(r.totalLow)} – ${usdStr(r.totalHigh)}`)
  satirlar.push(`  ücretli adım: ${r.meteredSteps} · insan kapısı: ${r.gates.length}`)
  if (r.unpricedSteps.length > 0) {
    // Tahminin EKSİK olduğu açıkça yazılır. "0.00" göstermek, sıfır maliyet iddiasıdır.
    satirlar.push(
      `  ⚠ ${r.unpricedSteps.length} ücretli adımın sağlayıcısı henüz seçilmedi ` +
        `(${r.unpricedSteps.join(', ')}) — aralık EKSİKTİR, sıfır değil.`
    )
  }
  satirlar.push('')
  satirlar.push('  Bu plan hiçbir şey harcamadı: sıfır ağ, sıfır yazma (R-47).')
  return satirlar.join('\n')
}
