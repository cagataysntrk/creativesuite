// Dokuz fiil — TAM OLARAK DOKUZ (§3.10 · R-02 · D-35, D-40).
//
// Her fiil TEK yan etki sınıfı taşır. `RENDER` sessizce bir LLM çağırabilseydi,
// çalıştırma öncesi gösterdiğimiz maliyet tahmini yalan olurdu ve çevrimdışı şerit
// sessizce bozulurdu.
//
// **Yetenek adı ≠ fiil adı.** `image.generate`, `audio.tts`, `video.text2video` bunlar
// `capability` DEĞERLERİDİR; hepsi `GENERATE` fiiliyle koşar. `verbs` kapısı bu
// karışıklığı yakalar — bir yetenek adının fiil listesine sızması, dokuz fiil yasasının
// sessizce on beş fiile dönüşmesi demekti.
//
// Gövdeler FAZ 3+'ta doluyor; burada sözleşme, yan etki sınıfı ve KURU İKİZ var.

import type { EffectClass, VerbName, VerbPlan } from '@suite/contracts'
import { VERBS } from '@suite/contracts'
import { notImplemented, ZERO_RANGE, type Verb, type VerbContext } from './types.js'

/** Fiil → yan etki sınıfı. Tam eşleme; eksik anahtar derleme hatasıdır. */
export const EFFECT_OF: Record<VerbName, EffectClass> = {
  RESOLVE: 'read-registry',
  SELECT: 'read-corpus',
  COMPOSE: 'pure',
  GENERATE: 'network-model',
  RENDER: 'browser',
  VALIDATE: 'read-corpus',
  PROPOSE: 'write-tree',
  PUBLISH: 'network-channel',
  INGEST: 'network-source',
}

/**
 * Para harcayan fiiller. `RENDER` metered çünkü Chromium/FFmpeg CPU ve zaman harcar ve
 * bulut render şeridinde doğrudan faturalanır; `PUBLISH` ve `INGEST` metered çünkü kota
 * tüketirler ve kota paradır (§8.3).
 */
export const METERED_OF: Record<VerbName, boolean> = {
  RESOLVE: false,
  SELECT: false,
  COMPOSE: false,
  GENERATE: true,
  RENDER: true,
  VALIDATE: false,
  PROPOSE: false,
  PUBLISH: true,
  INGEST: true,
}

const makeVerb = (name: VerbName): Verb => ({
  name,
  effectClass: EFFECT_OF[name],
  metered: METERED_OF[name],
  plan: (_ctx: VerbContext, _input: unknown): VerbPlan => ({
    verb: name,
    effectClass: EFFECT_OF[name],
    // İskelet aşamasında aralık sıfırdır; FAZ-3.5 yönlendiricisi gerçek aralığı
    // sağlayıcı fiyat formüllerinden hesaplayacak. Sıfır burada "bilinmiyor" değil
    // "henüz sağlayıcı yok" demek — ve `just plan` bunu açıkça yazar.
    estimatedCost: ZERO_RANGE(),
    candidateProviders: [],
  }),
  run: (ctx: VerbContext) => Promise.resolve(notImplemented(name, ctx)),
})

/**
 * Fiil tablosu. `VERBS` sözleşmeden gelir; bu dosya ona bir şey EKLEYEMEZ —
 * anahtar kümesi `VerbName` olduğu için onuncu fiil derleme hatasıdır.
 */
export const VERB_TABLE: Record<VerbName, Verb> = Object.fromEntries(
  VERBS.map((v) => [v, makeVerb(v)])
) as Record<VerbName, Verb>

export const getVerb = (name: VerbName): Verb => VERB_TABLE[name]

/** `verbs.json` ile karşılaştırılan sabitlenmiş görünüm. */
export interface VerbFingerprint {
  readonly name: VerbName
  readonly effectClass: EffectClass
  readonly metered: boolean
}

export const fingerprint = (): VerbFingerprint[] =>
  VERBS.map((v) => ({ name: v, effectClass: EFFECT_OF[v], metered: METERED_OF[v] }))
