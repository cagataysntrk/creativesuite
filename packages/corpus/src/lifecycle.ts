// Kayıt yaşam döngüsü — emeklilik ve sabitleme (§5.1 · R-12 · FAZ-4.3).
//
// **Emeklilik SİLME DEĞİLDİR** (12 yasadan biri). Dosya kalır, `expired_at` ve
// `superseded_by` yazılır, `status: retired` olur. Sebep tek cümleyle: silinen bir
// kayıt, onu kaynak gösteren varlıkların kökenini de siler — altı ay sonra bir deck'te
// duran iddianın nereden geldiği sorulduğunda cevap "dosya yoktu" olur ve o an iddia
// kaynaksız bir iddiadır (R-32'nin geriye dönük hâli).
//
// Bu modül **yazma yolunu KURMAZ**, `writeRecord`u çağırır: corpus'a yazan tek dosya
// `write.ts`tir (chokepoints → `corpus-yazici`). Buradaki iş yalnız hangi alanların
// nasıl değişeceğine karar vermek — ve o karar test edilebilir olmalı.

import { existsSync, readFileSync } from 'node:fs'
import { parseFrontmatter } from './frontmatter.js'
import { recordPath, writeRecord, type WriteResult } from './write.js'

/** Emekliye ayrılabilen durumlar. `retired` zaten emekli, tekrar emekli edilmez. */
const EMEKLI_EDILEBILIR = new Set(['draft', 'active', 'pinned', 'superseded'])

export type LifecycleRefusal =
  | { readonly kind: 'not_found'; readonly path: string }
  | { readonly kind: 'unreadable'; readonly path: string }
  | { readonly kind: 'already_retired'; readonly path: string }
  | { readonly kind: 'bad_status'; readonly status: unknown }

export type LifecycleResult =
  | { readonly ok: true; readonly path: string; readonly frontmatter: Record<string, unknown> }
  | { readonly ok: false; readonly refusal: LifecycleRefusal }

interface Hedef {
  readonly root: string
  readonly entityType: string
  readonly slug: string
}

// Ayrı bir `okundu` etiketi taşır: `LifecycleResult` ile birleşim yapıldığında iki
// `ok: true` dalı ayırt edilemez ve `tsc` alan erişimini reddeder. Testler bunu
// GÖRMEZ (vitest tip denetlemez) — `just gate types` görür.
type Okuma =
  | {
      readonly okundu: true
      readonly fm: Record<string, unknown>
      readonly body: string
      readonly path: string
    }
  | { readonly okundu: false; readonly refusal: LifecycleRefusal }

const oku = (h: Hedef): Okuma => {
  const path = recordPath(h.root, h.entityType, h.slug)
  if (!existsSync(path)) return { okundu: false, refusal: { kind: 'not_found', path } }
  const p = parseFrontmatter(readFileSync(path, 'utf8'))
  if (!p.ok || p.value.frontmatter === null) {
    return { okundu: false, refusal: { kind: 'unreadable', path } }
  }
  return { okundu: true, fm: p.value.frontmatter, body: p.value.body, path }
}

export interface RetireInput extends Hedef {
  /** ISO 8601 — çağıran verir. Bu modül saat OKUMAZ (R-06). */
  readonly at: string
  /** Yerine geçen kaydın id'si. Yoksa `null` — emeklilik ikame gerektirmez. */
  readonly supersededBy?: string | null
}

/**
 * Emekliye ayırır: `status: retired` + `expired_at` + (varsa) `superseded_by`.
 *
 * **`actor: 'human'`** — emeklilik bir KARARDIR ve agent karar veremez (R-14).
 * Agent'ın önerebileceği şey yeni bir taslaktır, mevcut bir kaydın emekliliği değil.
 */
export const retireRecord = (input: RetireInput): LifecycleResult => {
  const r = oku(input)
  if (!r.okundu) return { ok: false, refusal: r.refusal }

  const durum = r.fm['status']
  if (durum === 'retired') return { ok: false, refusal: { kind: 'already_retired', path: r.path } }
  if (typeof durum !== 'string' || !EMEKLI_EDILEBILIR.has(durum)) {
    return { ok: false, refusal: { kind: 'bad_status', status: durum } }
  }

  const fm: Record<string, unknown> = {
    ...r.fm,
    status: 'retired',
    expired_at: input.at,
  }
  // `superseded_by` yalnız VERİLDİĞİNDE yazılır. Boş bir alan yazmak, "bunun yerine
  // bir şey var" diye arayan kodun `null` ile `''` arasında ayrım yapmasını gerektirirdi.
  if (input.supersededBy !== undefined && input.supersededBy !== null) {
    fm['superseded_by'] = input.supersededBy
  }

  const w: WriteResult = writeRecord({
    root: input.root,
    entityType: input.entityType,
    slug: input.slug,
    frontmatter: fm,
    body: r.body,
    actor: 'human',
  })
  return w.ok
    ? { ok: true, path: w.path, frontmatter: fm }
    : { ok: false, refusal: { kind: 'unreadable', path: r.path } }
}

export interface PinInput extends Hedef {
  readonly pinned: boolean
}

/**
 * Sabitler / sabitlemeyi kaldırır: `pinned` ↔ `active`.
 *
 * Sabitleme retrieval'ı ETKİLEMEZ (yüklem ikisini de görür) — anlamı "bunu regenerasyon
 * planına sokma"dır (§4.5, sticky karar defteri). Yani bir işaret, bir filtre değil;
 * bu yüzden emeklilikten farklı olarak geri alınabilir.
 */
export const pinRecord = (input: PinInput): LifecycleResult => {
  const r = oku(input)
  if (!r.okundu) return { ok: false, refusal: r.refusal }

  const durum = r.fm['status']
  // Emekli bir kayıt sabitlenemez: sabitleme "bunu koru" demek, emeklilik "bu artık
  // geçerli değil". İkisini birden söylemek bir çelişki, hata değil sessizlik üretir.
  if (durum === 'retired') return { ok: false, refusal: { kind: 'already_retired', path: r.path } }
  if (durum !== 'active' && durum !== 'pinned') {
    return { ok: false, refusal: { kind: 'bad_status', status: durum } }
  }

  const fm = { ...r.fm, status: input.pinned ? 'pinned' : 'active' }
  const w = writeRecord({
    root: input.root,
    entityType: input.entityType,
    slug: input.slug,
    frontmatter: fm,
    body: r.body,
    actor: 'human',
  })
  return w.ok
    ? { ok: true, path: w.path, frontmatter: fm }
    : { ok: false, refusal: { kind: 'unreadable', path: r.path } }
}

/** İnsan okunur ret açıklaması — UI bunu doğrudan gösterir. */
export const lifecycleMessage = (r: LifecycleRefusal): string => {
  switch (r.kind) {
    case 'not_found':
      return `kayıt yok: ${r.path}`
    case 'unreadable':
      return `kayıt okunamadı (frontmatter bozuk): ${r.path}`
    case 'already_retired':
      return `kayıt zaten emekli — emeklilik geri alınmaz, yerine yeni kayıt açılır (R-12)`
    case 'bad_status':
      return `bu durumda yapılamaz: ${String(r.status)}`
  }
}
