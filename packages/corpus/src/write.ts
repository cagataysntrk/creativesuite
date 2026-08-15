// TEK corpus yazma noktası (§3.5, §5.4 · R-14 · chokepoints.json → `corpus-yazici`).
//
// **Agent önerir, insan uygular.** Bu dosya dışında hiçbir yer `corpus/` altına yazamaz.
// İkinci bir yazma yolu, onay kuyruğunu ATLAYAN bir yazma yoludur — ve kendi kendini
// değiştirebilen bir yapılandırmanın tek güvenlik hikâyesi budur (§5.4).
//
// Agent yalnız `propose()` çağırabilir: kayıt `status: draft` iner ve retrieval'a
// GÖRÜNMEZ. Onay insanın git commit'idir; bu dosya commit ATMAZ.

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { serializeFrontmatter, parseFrontmatter } from './frontmatter.js'

export type Actor = 'human' | 'agent'

export interface WriteRequest {
  /** Corpus kökü — `corpus/`. Test bunu geçici dizine yöneltir. */
  readonly root: string
  readonly entityType: string
  readonly slug: string
  readonly frontmatter: Record<string, unknown>
  readonly body: string
  readonly actor: Actor
}

export type WriteRefusal =
  | { readonly kind: 'agent_must_propose'; readonly status: unknown }
  | { readonly kind: 'would_overwrite_human'; readonly path: string }
  | { readonly kind: 'invalid_slug'; readonly slug: string }
  | { readonly kind: 'signature_broken'; readonly path: string }

export type WriteResult =
  | { readonly ok: true; readonly path: string }
  | { readonly ok: false; readonly refusal: WriteRefusal }

/** `corpus/<entity_type>/<slug>.md` — kanonik yerleşim (§3.9). */
export const recordPath = (root: string, entityType: string, slug: string): string =>
  join(root, entityType, `${slug}.md`)

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const writeRecord = (req: WriteRequest): WriteResult => {
  if (!SLUG_RE.test(req.slug)) {
    return { ok: false, refusal: { kind: 'invalid_slug', slug: req.slug } }
  }

  // Agent yalnız taslak önerebilir. `active` bir kaydı agent'ın yazması, onayı
  // atlaması demektir — kural burada, yazma anında zorlanır (R-14).
  if (req.actor === 'agent' && req.frontmatter['status'] !== 'draft') {
    return { ok: false, refusal: { kind: 'agent_must_propose', status: req.frontmatter['status'] } }
  }

  const path = recordPath(req.root, req.entityType, req.slug)

  if (existsSync(path)) {
    const mevcut = parseFrontmatter(readFileSync(path, 'utf8'))
    if (mevcut.ok && mevcut.value.frontmatter !== null) {
      const fm = mevcut.value.frontmatter

      // Elle düzenlenmiş bir kaydın üzerine agent yazamaz. `zone: human` kullanıcının
      // emeğidir; sessizce silmek, sistemi bir daha açmamanın en kısa yoludur (§4.5).
      if (req.actor === 'agent' && fm['zone'] === 'human') {
        return { ok: false, refusal: { kind: 'would_overwrite_human', path } }
      }

      // Üretilmiş bir kaydın imzası kırıksa (elle düzenlenmiş) çalıştırma DURUR.
      // Devam etmek, kullanıcının düzeltmesini üretimle ezmektir.
      if (
        req.actor === 'agent' &&
        fm['zone'] === 'generated' &&
        fm['x_signature'] !== undefined &&
        fm['x_signature'] !== req.frontmatter['x_signature']
      ) {
        return { ok: false, refusal: { kind: 'signature_broken', path } }
      }
    }
  }

  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, serializeFrontmatter(req.frontmatter, req.body))
  return { ok: true, path }
}

/**
 * Agent yüzeyi. Kasten dar: `status` ve `zone` çağıran tarafından SEÇİLEMEZ.
 * Seçilebilseydi, "sadece taslak yazabilir" kuralı bir konvansiyona dönerdi.
 */
export const propose = (
  req: Omit<WriteRequest, 'actor' | 'frontmatter'> & {
    readonly frontmatter: Omit<Record<string, unknown>, 'status' | 'zone'>
  }
): WriteResult =>
  writeRecord({
    ...req,
    actor: 'agent',
    frontmatter: { ...req.frontmatter, status: 'draft', zone: 'generated' },
  })
