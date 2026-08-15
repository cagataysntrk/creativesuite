// Dokuz fiil ve yan etki sınıfları (§3.10 · D-35, D-40).
//
// Her fiil TEK yan etki sınıfı taşır. `RENDER` sessizce bir LLM çağırabilseydi,
// çalıştırma öncesi gösterdiğimiz maliyet tahmini yalan olurdu ve çevrimdışı şerit
// sessizce bozulurdu. Dokuzunun da AYNI imzayı taşıması, motorun zamanlama, yeniden
// deneme, maliyet ve replay'i BİR KEZ yazmasını sağlar.
//
// Yetenek adı ≠ fiil adı. `image.generate`, `audio.tts` bunlar `CapabilityName`
// DEĞERLERİDİR; hepsi `GENERATE` fiiliyle çalışır. `verbs` kapısı bu karışıklığı yakalar.

import type { Money, MoneyRange } from './money.js'

export const VERBS = [
  'RESOLVE',
  'SELECT',
  'COMPOSE',
  'GENERATE',
  'RENDER',
  'VALIDATE',
  'PROPOSE',
  'PUBLISH',
  'INGEST',
] as const

export type VerbName = (typeof VERBS)[number]

export const EFFECT_CLASSES = [
  'read-registry',
  'read-corpus',
  'pure',
  'network-model',
  'browser',
  'write-tree',
  'network-channel',
  'network-source',
] as const

export type EffectClass = (typeof EFFECT_CLASSES)[number]

/**
 * Fiil → yan etki sınıfı eşlemesi. TİP seviyesinde sabit: bir fiilin sınıfını
 * değiştirmek, onu kullanan her yerde derleme hatası üretir — sessizce kaymaz.
 */
export interface VerbSpec {
  readonly name: VerbName
  readonly effectClass: EffectClass
  /** `true` ise en az bir `CostEvent` döndürmek ZORUNDA (§8.3). */
  readonly metered: boolean
}

export type VerbTable = { readonly [K in VerbName]: VerbSpec }

/** Maliyet olayı — defterin tek satır tipi. Motor bunu TEK yerde yazar (§3.8). */
export interface CostEvent {
  readonly verb: VerbName
  readonly capability: string
  readonly providerId: string
  readonly amount: Money
  /** Tahmin mi gerçek mi. İkisini ayırmayan bir defter sapmayı ölçemez (§13). */
  readonly kind: 'estimate' | 'actual'
}

/**
 * Kuru ikizin çıktısı: sıfır ağ, sıfır yazma. `just plan`'ı DÜRÜST yapan şey budur.
 * Kuru ikizi olmayan bir fiil `plan`'da hata verir — sessizce atlanmaz (FAZ-1.13).
 */
export interface VerbPlan {
  readonly verb: VerbName
  readonly effectClass: EffectClass
  readonly estimatedCost: MoneyRange
  /** Seçilen sağlayıcı VE elenenler; eleme gerekçeleri manifest'e yazılır (§4.4). */
  readonly candidateProviders: readonly string[]
}
