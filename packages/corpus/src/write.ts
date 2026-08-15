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
import { computeSignature, signatureIntact } from './signature.js'

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
  | {
      readonly kind: 'would_overwrite_approved'
      readonly path: string
      readonly approvedAt: unknown
    }

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

      // **`zone` yoksa İNSAN sayılır.** İlk sürüm `=== 'human'` bakıyordu ve alanı
      // olmayan bir kayıt iki korumadan da muaf kalıyordu — elle yazılmış kayıtlar
      // (corpus-editing kuralının normal yolu) korumasızdı. Eksik bilgi güvenli
      // tarafa düşer: fail-safe, fail-open değil (2. doğrulama turu).
      const zone = typeof fm['zone'] === 'string' ? fm['zone'] : 'human'
      if (req.actor === 'agent' && zone !== 'generated') {
        return { ok: false, refusal: { kind: 'would_overwrite_human', path } }
      }

      // **İnsanın ONAYLADIĞI kayıt agent tarafından EZİLEMEZ.** Onay bir durumdur ve
      // agent onu geri alamaz (R-14): motor `status: active` bir kaydı yeniden
      // önerirse `approved_by`/`approved_at` silinir ve "bunu ne zaman kabul ettim"
      // sorusunun cevabı yok olur. Yeni öneri gelmesi meşru — ama üzerine değil,
      // yeni bir taslak olarak gelir ve tahkim insanın işidir (§5.5).
      if (req.actor === 'agent' && fm['approved_at'] !== undefined && fm['status'] === 'active') {
        return {
          ok: false,
          refusal: { kind: 'would_overwrite_approved', path, approvedAt: fm['approved_at'] },
        }
      }

      // Üretilmiş bir kaydın imzası KIRIKSA çalıştırma DURUR.
      //
      // "Kırık" = dosyanın içeriği kendi imzasıyla uyuşmuyor, yani dosyaya bir insan
      // dokunmuş. Gelen imzayla karşılaştırmak YANLIŞ soruydu: insan gövdeyi düzeltip
      // imzaya dokunmadığında imzalar eşit çıkıyor ve motor insanın metnini sessizce
      // eziyordu — korunması gereken tam o durumdu (doğrulama agent'ı, 2026-08-15).
      if (req.actor === 'agent' && zone === 'generated') {
        if (signatureIntact(fm, mevcut.value.body) === false) {
          return { ok: false, refusal: { kind: 'signature_broken', path } }
        }
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
): WriteResult => {
  // İmza ÜRETİM anında basılır. Üretilmediği sürece `x_signature` bir tip alanıydı
  // ve hiçbir kayıtta yoktu; koruma da tamamen atıl kalıyordu — belgelenmiş ama
  // hiç çalışmayan bir mekanizma (doğrulama agent'ı buldu).
  const temel = { ...req.frontmatter, status: 'draft', zone: 'generated' }
  return writeRecord({
    ...req,
    actor: 'agent',
    frontmatter: { ...temel, x_signature: computeSignature(temel, req.body) },
  })
}
