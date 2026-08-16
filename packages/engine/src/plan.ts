// Kuru çalıştırma planı (§8.3, §15 · R-47).
//
// **Hiçbir şey harcamaz, hiçbir yere yazmaz, ağa çıkmaz.** `just plan`'ı dürüst yapan
// tek şey budur: her metered fiilin kuru ikizi var ve plan yalnız onları çağırır.
//
// **Kuru ikizi olmayan bir fiil SESSİZCE ATLANMAZ** — plan hata verir. Atlansaydı,
// çalıştırma öncesi gösterilen maliyet o adımı hiç saymaz ve kullanıcı gerçekte
// ödeyeceğinden az bir rakama onay verirdi.

import type { BrandId, EraId, Money, MoneyRange, RunId, StepId, VerbName } from '@suite/contracts'
import { VERBS, ZERO_USD, addMoney, scaleMoney, usd } from '@suite/contracts'
import { getVerb, seededRng, fixedClock, type VerbContext } from '@suite/kernel'
import { topoOrder, type Pipeline } from '@suite/registry'
import { candidatesFor } from '@suite/providers'
import { route, type ProviderPricing, type RoutingDecision } from './router/route.js'
import { rejectionMessage } from './router/reasons.js'
import { matrisDenetle, matrisHataMesaji, varyantSayisi, varyantUret } from './matris.js'

export interface PlannedStep {
  readonly stepId: StepId
  readonly verb: VerbName
  readonly capability: string | null
  readonly effectClass: string
  readonly metered: boolean
  readonly needs: readonly string[]
  readonly gate: string | null
  readonly constraints: Readonly<Record<string, unknown>>
  /** **Varyant çarpanı UYGULANMIŞ** maliyet — toplama giren sayı budur. */
  readonly estimatedCost: MoneyRange
  /**
   * Bu adım kaç kez koşacak. Ücretsiz adımlarda 1: `SELECT` bağlamı bir kez seçer,
   * yedi varyant onu paylaşır. Ücretli adımlarda varyant sayısı — her varyantın
   * kendi model çağrısı ve kendi render'ı var.
   */
  readonly kosumSayisi: number
  readonly candidateProviders: readonly string[]
  /** Yeteneği yapabilen ama ŞU AN kullanılamayan sağlayıcılar — sessizce düşürülmez. */
  readonly unavailableProviders: readonly string[]
  /**
   * Yönlendirici kararı: kazanan, yedek zinciri ve **her kaybeden gerekçesiyle** (§8.2).
   * `null` = bu adım yetenek istemiyor (`COMPOSE` gibi) ya da hiç aday yok.
   * Bu alan manifest'e olduğu gibi yazılır — "neden bu model" sorusunun cevabı.
   */
  readonly routing: RoutingDecision | null
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
  /**
   * Varyant sayısı — matrissiz hatlarda 1.
   *
   * **Ekrana basılmak ZORUNDA.** Görünmeyen bir çarpan, olmayan bir çarpandan
   * kötüdür: toplam maliyet yedi katına çıkar ve kullanıcı sebebini göremez.
   */
  readonly varyantSayisi: number
  readonly matrisModu: 'ofat' | 'full' | null
}

export type PlanError =
  | { readonly kind: 'unknown_verb'; readonly step: string; readonly verb: string }
  | { readonly kind: 'no_dry_twin'; readonly step: string; readonly verb: string }
  | { readonly kind: 'plan_threw'; readonly step: string; readonly message: string }
  /**
   * Matris tasarımı bozuk — plan ÜRETİLMEZ.
   *
   * `matris` kapısı aynı şeyi commit anında söylüyor; bu, çalıştırma anında söylüyor.
   * İkisi de gerekli: kapı yalnız `registry/pipelines/` altındaki dosyalara bakar,
   * plan ise kendisine ne verilirse ona bakar.
   */
  | { readonly kind: 'matris_gecersiz'; readonly message: string }

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
  /**
   * Sağlayıcı fiyat beyanları — `registry/providers/*.provider.yaml`'dan gelir.
   * Plan bunu OKUMAZ, ÇAĞIRAN verir: plan saf kalmalı ki testte gerçek dosya
   * sistemi olmadan da aynı kararı versin.
   */
  readonly pricing?: Readonly<Record<string, ProviderPricing>>
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

  // ── varyant matrisi (§10 · D-225 · D-228) ─────────────────────────────────
  //
  // Hat dosyasındaki `matris:` bloğu buradan üretim yoluna giriyor. Tasarım burada
  // DENETLENİYOR çünkü matrisi bozuk bir hattın planı basılmamalı: tek düzeyli bir
  // eksen para harcar ve karşılığında ölçüm vermez — eksen değil sabittir.
  const mtr = input.pipeline.matris
  if (mtr !== null) {
    const hatalar = matrisDenetle({
      eksenler: mtr.eksenler,
      varyantlar: varyantUret(mtr.eksenler, mtr.mod),
      mod: mtr.mod,
    })
    for (const h of hatalar) errors.push({ kind: 'matris_gecersiz', message: matrisHataMesaji(h) })
    if (errors.length > 0) return { ok: false, errors }
  }
  const varyant = mtr === null ? 1 : varyantSayisi(mtr.eksenler, mtr.mod)

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

    // Yönlendirme: metered ve yetenekli adımlarda sağlayıcı SEÇİLİR ve kaybedenler
    // gerekçesiyle kaydedilir. Seçim yapılamıyorsa fiilin kendi tahmini kullanılır ve
    // adım `unpriced` sayılır — eksik olduğunu SÖYLEYEN bir tahmin, sessizce eksik
    // olandan iyidir (§8.3).
    const yonlendirme: RoutingDecision | null =
      s.capability === null || adaylar.length === 0
        ? null
        : route(
            {
              capability: s.capability,
              lane: (s.constraints['lane'] === 'premium' ? 'premium' : 'free') as
                'free' | 'premium',
              constraints: Object.fromEntries(
                Object.entries(s.constraints).filter(
                  (e): e is [string, string | number | boolean] =>
                    typeof e[1] === 'string' ||
                    typeof e[1] === 'number' ||
                    typeof e[1] === 'boolean'
                )
              ),
              params: Object.fromEntries(
                Object.entries(s.constraints).filter(
                  (e): e is [string, number] => typeof e[1] === 'number'
                )
              ),
              prefer: 'cost',
              // Pipeline'ın beyan ettiği adım tavanı GERÇEKTEN uygulanır. Okunmasaydı
              // `max_cost_usd_micros` dekoratif bir yorum olurdu — ve dekoratif bir
              // tavan, olmayan bir tavandan kötüdür: var sanılır.
              maxCost:
                typeof s.constraints['max_cost_usd_micros'] === 'number'
                  ? usd(BigInt(Math.trunc(s.constraints['max_cost_usd_micros'])))
                  : null,
            },
            adaylar,
            input.pricing ?? {}
          )

    // **Ücretli adımlar varyant başına koşar, ücretsizler bir kez.** `RESOLVE` ve
    // `SELECT` bağlamı bir kez kurar ve yedi varyant onu paylaşır; ama her varyantın
    // KENDİ metni, KENDİ görseli ve KENDİ render'ı var. Çarpanı ücretsiz adımlara da
    // uygulamak sayıyı şişirir, hiçbirine uygulamamak yedide bir gösterir.
    const kosum = verb.metered ? varyant : 1
    const tekKosum = yonlendirme?.winner?.cost ?? vp.estimatedCost
    const adimMaliyet =
      kosum === 1
        ? tekKosum
        : { low: scaleMoney(tekKosum.low, kosum), high: scaleMoney(tekKosum.high, kosum) }
    low = addMoney(low, adimMaliyet.low)
    high = addMoney(high, adimMaliyet.high)
    if (verb.metered && (kullanilabilir.length === 0 || yonlendirme?.winner == null)) {
      unpriced.push(s.id)
    }

    steps.push({
      stepId: s.id as StepId,
      verb: verb.name,
      capability: s.capability,
      effectClass: verb.effectClass,
      metered: verb.metered,
      needs: s.needs,
      gate: s.gate,
      constraints: s.constraints,
      estimatedCost: adimMaliyet,
      kosumSayisi: kosum,
      candidateProviders: kullanilabilir,
      unavailableProviders: adaylar.filter((a) => !a.available).map((a) => a.providerId),
      routing: yonlendirme,
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
      varyantSayisi: varyant,
      matrisModu: mtr?.mod ?? null,
    },
  }
}

const usdStr = (m: Money): string => `$${(Number(m.micros) / 1_000_000).toFixed(4)}`

/** İnsan için metin çıktısı. Sayılar `tr-TR` biçiminde DEĞİL — CLI'da hizalama önemli. */
export const formatPlan = (r: PlanReport): string => {
  const satirlar: string[] = []
  satirlar.push(`  ${r.title}  (${r.pipeline})`)
  satirlar.push(`  marka ${r.brandId} · dönem ${r.eraId}`)
  if (r.matrisModu !== null) {
    satirlar.push(
      `  varyant matrisi: ${r.matrisModu} · ${r.varyantSayisi} varyant — ` +
        `ücretli her adım ${r.varyantSayisi} kez koşar`
    )
  }
  satirlar.push('')
  satirlar.push('  sıra  adım              fiil      yetenek            şerit  bağımlı')
  satirlar.push('  ────  ────────────────  ────────  ─────────────────  ─────  ────────')

  const byId = new Map(r.steps.map((s) => [String(s.stepId), s]))
  r.order.forEach((id, i) => {
    const s = byId.get(id)
    if (s === undefined) return
    satirlar.push(
      `  ${String(i + 1).padStart(4)}  ${id.padEnd(16)}  ${s.verb.padEnd(8)}  ` +
        `${(s.capability ?? '—').padEnd(17)}  ` +
        `${(s.metered ? (s.kosumSayisi > 1 ? `ü×${s.kosumSayisi}` : 'ücret') : '—').padEnd(5)}  ` +
        `${s.needs.join(', ') || '—'}`
    )
    if (s.capability !== null) {
      const a = s.candidateProviders.length > 0 ? s.candidateProviders.join(', ') : '—'
      satirlar.push(`        └─ aday sağlayıcı: ${a}`)
      if (s.unavailableProviders.length > 0) {
        satirlar.push(`           kullanılamıyor: ${s.unavailableProviders.join(', ')}`)
      }
      // **Kaybedenler EKRANA da basılır**, yalnız manifest'e değil (§8.2 aşama 5).
      // Manifeste yazıp göstermemek, "neden bu model" sorusunu bir dosya arkasına
      // saklar — ve o dosya hiç açılmaz.
      const y = s.routing
      if (y?.winner != null) {
        satirlar.push(
          `           SEÇİLEN: ${y.winner.providerId} · ${usdStr(y.winner.cost.low)}` +
            `–${usdStr(y.winner.cost.high)} · güven ${y.winner.confidence} · skor ${y.winner.score}`
        )
        // Yönlendirici fiyatı TEK çağrının fiyatı. Yanına adım toplamı yazılmazsa
        // göz yukarıdaki küçük sayıyı okur ve çarpan görünmez kalır.
        if (s.kosumSayisi > 1) {
          satirlar.push(
            `           ${s.kosumSayisi} varyant → adım toplamı ` +
              `${usdStr(s.estimatedCost.low)}–${usdStr(s.estimatedCost.high)}`
          )
        }
        for (const f of y.fallbacks)
          satirlar.push(`           yedek: ${f.providerId} (skor ${f.score})`)
      }
      for (const red of y?.rejected ?? []) {
        satirlar.push(`           elendi ${red.providerId}: ${rejectionMessage(red.reason)}`)
      }
    }
    if (s.gate !== null) satirlar.push(`        └─ insan kapısı: ${s.gate}`)
  })

  satirlar.push('')
  if (r.unpricedSteps.length > 0) {
    // **Manşette SAYI YOK.** İlk sürüm "maliyet aralığı: $0.0000 – $0.0000" yazıp altına
    // uyarı koyuyordu; başlıktaki sayı tam olarak yasaklanan iddiaydı ve göz önce onu
    // okur. Fiyatlanamayan bir tahmin bir sayı değil, bir BOŞLUKTUR (D-74).
    satirlar.push(
      `  maliyet aralığı: FİYATLANAMADI — ${r.unpricedSteps.length} ücretli adımın ` +
        `sağlayıcısı seçilmedi (${r.unpricedSteps.join(', ')})`
    )
    const bilinen = r.meteredSteps - r.unpricedSteps.length
    if (bilinen > 0) {
      satirlar.push(
        `  fiyatlanan ${bilinen} adım: ${usdStr(r.totalLow)} – ${usdStr(r.totalHigh)} (ALT SINIR)`
      )
    }
  } else {
    satirlar.push(`  maliyet aralığı: ${usdStr(r.totalLow)} – ${usdStr(r.totalHigh)}`)
  }
  satirlar.push(`  ücretli adım: ${r.meteredSteps} · insan kapısı: ${r.gates.length}`)
  satirlar.push('')
  satirlar.push('  Bu plan hiçbir şey harcamadı: sıfır ağ, sıfır yazma (R-47).')
  return satirlar.join('\n')
}
