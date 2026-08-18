// Plan dondurma (§8.3, §13 · R-07 · FAZ-4.6).
//
// **İnsanın onayladığı plan ile koşan plan AYNI olmak zorundadır.**
//
// Somut çöküş: operatör "$0.40 · flux-schnell" yazan bir planı onaylar, tam o sırada
// biri `registry/providers/`de bir fiyat günceller ya da bir modeli devre dışı bırakır,
// ve çalıştırma başka bir sağlayıcıyla $4.00'a koşar. Onay, onaylanmayan bir şeyin
// onayına dönüşür — ve fark ancak fatura gelince görülür.
//
// Donan şey bir ÖZET değil, kararın kendisidir: hangi corpus commit'i, hangi registry
// commit'i, hangi adım sırası, hangi sağlayıcı, hangi parametre, hangi seed,
// hangi kayıt id'leri. Bunlardan biri eksikse "aynı plan" iddiası ispatlanamaz.
//
// **Doğrulama ÇÖZÜMLEME DEĞİL karşılaştırmadır.** Çalıştırma anında planı yeniden
// hesaplayıp "aynı mı" diye bakmıyoruz — donmuş planı KULLANIYORUZ ve yalnız dünyanın
// değişip değişmediğini rapor ediyoruz. Yeniden hesaplamak, dondurmanın kendisini
// iptal ederdi.

import { createHash } from 'node:crypto'
import type { BrandId, EraId, Money, MoneyRange, RunId } from '@suite/contracts'
import type { PlanReport } from '../plan.js'

/** Donmuş planın tek bir adımı — kararın taşıdığı her şey. */
export interface FrozenStep {
  readonly stepId: string
  readonly verb: string
  readonly capability: string | null
  readonly metered: boolean
  /** Yönlendiricinin SEÇTİĞİ sağlayıcı. `null` = bu adım yetenek istemiyor. */
  readonly providerId: string | null
  /**
   * Sağlayıcı tanımlayıcısının özeti — **model kimliğini bu sabitler.**
   *
   * `model` alanı YOK ve olmamalı: model ID'si pipeline'da yer almaz (R-40), tanımlayıcı
   * içinde yaşar. Buraya bir model adı yazmak, yönlendiricinin seçtiğini plan seviyesine
   * sızdırmak olurdu — tanımlayıcı değişip model değiştiğinde alan bayat kalır ve
   * "hangi modelle koştu" sorusuna YANLIŞ cevap verir. Tanımlayıcı özeti bayatlamaz:
   * değişirse özet değişir ve `planStale` bunu bildirir.
   */
  readonly descriptorDigest: string | null
  /** Tahminin güven noktası (§8.3): `green` kesin · `amber` doğrulanmamış · `red` fiyatlanamaz. */
  readonly confidence: 'green' | 'amber' | 'red' | null
  readonly params: Readonly<Record<string, unknown>>
  readonly seed: number | null
  readonly estimatedCost: MoneyRange
}

export interface FrozenPlan {
  readonly runId: RunId
  readonly pipeline: string
  readonly brandId: BrandId
  readonly eraId: EraId | '*'
  /** Bilgi ağacı ve registry commit'i — "hangi dünyada donduruldu" (§13). */
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly frozenAt: string
  readonly order: readonly string[]
  readonly steps: readonly FrozenStep[]
  /** Bağlama giren kayıtların id'leri — seçim de donar, yeniden sorgulanmaz (R-07). */
  readonly recordIds: readonly string[]
  readonly totalLow: Money
  readonly totalHigh: Money
  /**
   * Kaç varyant onaylandı (matrissiz hatlarda 1).
   *
   * **Özete GİRER.** Maliyet üzerinden dolaylı olarak korunuyor sanmak yanlış olurdu:
   * fiyatlanamayan bir planda her adım $0 ve 7 varyantlık onayla 27 varyant koşmak
   * özeti hiç değiştirmezdi.
   */
  readonly varyantSayisi: number
  /**
   * Planın parmak izi. İçerik değişirse değişir; onay bu özete verilir.
   * Onaylanan özet ile koşan özet farklıysa çalıştırma DURUR.
   */
  readonly digest: string
}

export interface FreezeInput {
  readonly report: PlanReport
  readonly runId: RunId
  readonly corpusCommit: string
  readonly registryCommit: string
  /** ISO 8601 — çağıran verir, bu modül saat OKUMAZ (R-06). */
  readonly frozenAt: string
  readonly recordIds: readonly string[]
  /** Sağlayıcı tanımlayıcı özetleri: `{ providerId: digest }`. */
  readonly descriptorDigests?: Readonly<Record<string, string>>
  readonly seeds?: Readonly<Record<string, number>>
}

/**
 * Özet, alan SIRASINDAN bağımsız olmalı: `JSON.stringify` anahtar sırasını korur ve
 * aynı planın iki farklı özet vermesi, "plan değişti" alarmını gürültüye çevirirdi.
 */
const kararliJson = (v: unknown): string => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null'
  if (Array.isArray(v)) return `[${v.map(kararliJson).join(',')}]`
  const o = v as Record<string, unknown>
  const parcalar = Object.keys(o)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${kararliJson(o[k])}`)
  return `{${parcalar.join(',')}}`
}

const moneyJson = (m: Money): unknown => ({ micros: m.micros.toString(), currency: m.currency })

export const freezePlan = (input: FreezeInput): FrozenPlan => {
  const steps: FrozenStep[] = input.report.steps.map((s) => ({
    stepId: s.stepId,
    verb: s.verb,
    capability: s.capability,
    metered: s.metered,
    providerId: s.routing?.winner?.providerId ?? null,
    confidence: s.routing?.winner?.confidence ?? null,
    descriptorDigest:
      s.routing?.winner?.providerId === undefined
        ? null
        : (input.descriptorDigests?.[s.routing.winner.providerId] ?? null),
    params: s.constraints,
    seed: input.seeds?.[s.stepId] ?? null,
    estimatedCost: s.estimatedCost,
  }))

  const govde = {
    pipeline: input.report.pipeline,
    brandId: input.report.brandId,
    eraId: input.report.eraId,
    corpusCommit: input.corpusCommit,
    registryCommit: input.registryCommit,
    order: input.report.order,
    varyantSayisi: input.report.varyantSayisi,
    // `recordIds` SIRALANIR: seçim sırası bir karar değil, sorgu ayrıntısıdır ve
    // sıradaki bir kayma "plan değişti" demek olurdu.
    recordIds: [...input.recordIds].sort(),
    steps: steps.map((s) => ({
      ...s,
      estimatedCost: { low: moneyJson(s.estimatedCost.low), high: moneyJson(s.estimatedCost.high) },
    })),
  }

  // `frozenAt` ve `runId` özete GİRMEZ: aynı kararın iki kez dondurulması aynı özeti
  // vermeli, yoksa "bu plan değişti mi" sorusu zamana bağlı hâle gelir ve hep "evet"
  // cevabını alır.
  const digest = `sha256:${createHash('sha256').update(kararliJson(govde)).digest('hex')}`

  return {
    runId: input.runId,
    pipeline: input.report.pipeline,
    brandId: input.report.brandId,
    eraId: input.report.eraId,
    corpusCommit: input.corpusCommit,
    registryCommit: input.registryCommit,
    frozenAt: input.frozenAt,
    order: input.report.order,
    steps,
    recordIds: [...input.recordIds].sort(),
    totalLow: input.report.totalLow,
    totalHigh: input.report.totalHigh,
    varyantSayisi: input.report.varyantSayisi,
    digest,
  }
}

// ── bayatlık: dünya değişti mi ───────────────────────────────────────────────

export type StaleReason =
  | { readonly kind: 'corpus_moved'; readonly frozen: string; readonly now: string }
  | { readonly kind: 'registry_moved'; readonly frozen: string; readonly now: string }
  | {
      readonly kind: 'descriptor_changed'
      readonly providerId: string
      readonly frozen: string
      readonly now: string
    }
  | { readonly kind: 'provider_unavailable'; readonly providerId: string }

export interface StaleCheck {
  readonly corpusCommit: string
  readonly registryCommit: string
  readonly descriptorDigests: Readonly<Record<string, string>>
  /** Şu an kullanılabilir sağlayıcılar. Boş küme "hiçbiri" demektir, "bilmiyorum" değil. */
  readonly availableProviders: ReadonlySet<string>
}

/**
 * Donmuş plan hâlâ geçerli mi.
 *
 * **Bayatlık plana ENGEL değil, BİLGİDİR.** Çalıştırma yine donmuş planla koşar (R-07);
 * bu fonksiyon yalnız operatöre "onayladığın dünya değişti" diyebilmek için var.
 * Otomatik yeniden planlama yapsaydık, dondurmanın koruduğu şeyi kendi elimizle
 * iptal ederdik.
 */
export const planStale = (plan: FrozenPlan, now: StaleCheck): readonly StaleReason[] => {
  const nedenler: StaleReason[] = []

  if (plan.corpusCommit !== now.corpusCommit) {
    nedenler.push({ kind: 'corpus_moved', frozen: plan.corpusCommit, now: now.corpusCommit })
  }
  if (plan.registryCommit !== now.registryCommit) {
    nedenler.push({ kind: 'registry_moved', frozen: plan.registryCommit, now: now.registryCommit })
  }

  for (const s of plan.steps) {
    if (s.providerId === null) continue
    if (!now.availableProviders.has(s.providerId)) {
      nedenler.push({ kind: 'provider_unavailable', providerId: s.providerId })
    }
    const simdiki = now.descriptorDigests[s.providerId]
    if (s.descriptorDigest !== null && simdiki !== undefined && simdiki !== s.descriptorDigest) {
      nedenler.push({
        kind: 'descriptor_changed',
        providerId: s.providerId,
        frozen: s.descriptorDigest,
        now: simdiki,
      })
    }
  }

  return nedenler
}

export const staleMessage = (r: StaleReason): string => {
  switch (r.kind) {
    case 'corpus_moved':
      return `corpus commit'i değişti (${r.frozen.slice(0, 8)} → ${r.now.slice(0, 8)}) — plan eski bilgiyle donduruldu`
    case 'registry_moved':
      return `registry commit'i değişti (${r.frozen.slice(0, 8)} → ${r.now.slice(0, 8)}) — tarif ya da sağlayıcı güncellenmiş olabilir`
    case 'descriptor_changed':
      return `'${r.providerId}' tanımlayıcısı değişti — donmuş fiyat artık geçerli olmayabilir`
    case 'provider_unavailable':
      return `'${r.providerId}' şu an kullanılamıyor — çalıştırma bu adımda duracak`
  }
}

// ── bütçe kilidi ─────────────────────────────────────────────────────────────

export type LaunchBlock =
  | { readonly kind: 'over_cap'; readonly high: Money; readonly cap: Money }
  | { readonly kind: 'unpriced'; readonly steps: readonly string[] }

/**
 * Başlat düğmesi kilitli mi.
 *
 * **ÜST sınır karşılaştırılır, alt sınır değil.** Tahmin bir banttır; bandın üstü
 * tavanı aşıyorsa çalıştırma tavanı aşabilir demektir ve "muhtemelen aşmaz" bir bütçe
 * garantisi değildir (§8.3).
 *
 * **Fiyatlanmamış adım da kilitler.** Sağlayıcısı çözülmemiş bir metered adım, tahmini
 * EKSİK yapar — ve eksik bir tahminle onay vermek, bilinmeyen bir tutara onay vermektir.
 */
export const launchBlocks = (plan: FrozenPlan, cap: Money | null): readonly LaunchBlock[] => {
  const blocks: LaunchBlock[] = []
  if (cap !== null && plan.totalHigh.micros > cap.micros) {
    blocks.push({ kind: 'over_cap', high: plan.totalHigh, cap })
  }
  // ⚠ ⚠ **YETENEK BEYAN ETMEYEN ÜCRETLİ ADIM FİYATSIZ SAYILMAZ — ve bu ayrım
  // yokken panel HER HAT İÇİN kalıcı kilitliydi.**
  //
  // `RENDER` ve `PUBLISH` fiil tablosunda `metered: true` (table.ts): bulut render
  // şeridi faturalanır, yayın kota harcar. Ama hat dosyasında `capability:` YOK —
  // yerel Chromium ve kanal çağrısı bir sağlayıcıya yönlendirilmez. Yönlendirilmeyen
  // bir adımın `providerId`si HİÇBİR ZAMAN dolmaz, yani eski koşul "bir gün çözülür"
  // değil "asla çözülmez" bir kilitti. `just uret` bu kilidi uygulamadığı için CLI
  // koşuyor, panel koşmuyordu — ölçülmüş kopuk halka.
  //
  // ⚠ Kural GEVŞETİLMİYOR, DOĞRU ÇİZİLİYOR: yeteneği OLAN ve sağlayıcısı çözülmemiş
  // adım hâlâ kilitler (anahtar yoksa görsel üretimi tam olarak budur). Bilinmeyen
  // tutar ile sağlayıcı çağırmayan yerel adım aynı şey değil.
  const fiyatsiz = plan.steps
    .filter((s) => s.metered && s.capability !== null && s.providerId === null)
    .map((s) => s.stepId)
  if (fiyatsiz.length > 0) blocks.push({ kind: 'unpriced', steps: fiyatsiz })
  return blocks
}

export const blockMessage = (b: LaunchBlock): string => {
  switch (b.kind) {
    case 'over_cap':
      return `tahmin ÜST sınırı ${b.high.micros / 10000n} sent, tavan ${b.cap.micros / 10000n} sent — başlat kilitli (§8.3)`
    case 'unpriced':
      return `sağlayıcısı çözülmemiş ${b.steps.length} ücretli adım (${b.steps.join(', ')}) — tahmin EKSİK, onay verilemez`
  }
}
