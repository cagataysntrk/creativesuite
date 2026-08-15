// Keşif planını UYGULAR (§4.4 · R-12, R-14).
//
// **`apply` bile onay değildir.** Yazdığı her kayıt `status: draft` iner ve retrieval'a
// görünmez; onay insanın commit'idir. Motorun yazma yetkisi bu yüzden `propose()` ile
// sınırlı — `apply` daha fazlasını yapabilseydi, "agent önerir insan uygular" bir
// konvansiyona dönerdi (D-31).
//
// **Emeklilik UYGULANMAZ.** `retire` op'u bir kaydı `status: retired` yapmayı önerir;
// bunu motorun yapması, insanın onayladığı bir bilgiyi motorun geri alması demektir.
// Op listelenir, uygulaması insana bırakılır (R-12 + R-14 birlikte).

import { propose, type WriteRefusal } from '@suite/corpus'
import type { DiscoveryOp, DiscoveryPlan } from './plan.js'

/** Bir op'un gövdesi. Keşif çalıştırması üretir; `apply` yalnız yazar. */
export interface OpContent {
  readonly entityType: string
  readonly slug: string
  readonly frontmatter: Readonly<Record<string, unknown>>
  readonly body: string
}

export type ApplyOutcome =
  | { readonly kind: 'written'; readonly recordId: string; readonly path: string }
  | { readonly kind: 'refused'; readonly recordId: string; readonly refusal: WriteRefusal }
  | { readonly kind: 'needs_human'; readonly recordId: string; readonly why: string }
  | { readonly kind: 'no_content'; readonly recordId: string }

export interface ApplyReport {
  readonly runId: string
  readonly outcomes: readonly ApplyOutcome[]
  readonly written: number
  readonly refused: number
  readonly needsHuman: number
}

/**
 * Planı uygular. **Kısmi başarı normaldir**: bir op reddedilirse (imza kırık, elle
 * düzenlenmiş kayıt) diğerleri yazılır ve rapor hangisinin neden yazılmadığını söyler.
 * "Hepsi ya da hiçbiri" burada yanlış olurdu — bir kaydın elle düzeltilmiş olması,
 * dokuz sağlam kaydın güncellenmemesi için sebep değil.
 */
/**
 * RFC 6901 pointer'ların gösterdiği alanları KALDIRIR.
 *
 * Yalnız `/attributes/...` altındaki alanlar kaldırılabilir: zarf alanları sistemindir
 * (D-41) ve `id` ya da `brand_id` bastırmak kaydı anlamsız yapardı. Pointer kök
 * (`''`) ise kayıt zaten plan aşamasında düşmüştür, buraya gelmez.
 */
const stripPointers = (
  frontmatter: Readonly<Record<string, unknown>>,
  pointers: readonly string[]
): Record<string, unknown> => {
  if (pointers.length === 0) return { ...frontmatter }
  const out: Record<string, unknown> = structuredClone(frontmatter) as Record<string, unknown>
  for (const ptr of pointers) {
    const parcalar = ptr.split('/').filter((x) => x !== '')
    if (parcalar.length === 0) continue
    let dugum: Record<string, unknown> | null = out
    for (const p of parcalar.slice(0, -1)) {
      const alt: unknown = dugum[p]
      dugum = alt !== null && typeof alt === 'object' ? (alt as Record<string, unknown>) : null
      if (dugum === null) break
    }
    const son = parcalar[parcalar.length - 1]
    if (dugum !== null && son !== undefined) delete dugum[son]
  }
  return out
}

export const applyPlan = (
  plan: DiscoveryPlan,
  icerikler: ReadonlyMap<string, OpContent>,
  corpusRoot: string
): ApplyReport => {
  const outcomes: ApplyOutcome[] = []

  for (const op of plan.ops) {
    if (op.kind === 'skip') continue

    if (op.kind === 'retire') {
      outcomes.push({
        kind: 'needs_human',
        recordId: op.recordId,
        why: 'emeklilik motorun işi değil: insan onayladığı bilgiyi motor geri alamaz (R-12, R-14)',
      })
      continue
    }

    const icerik = icerikler.get(op.recordId)
    if (icerik === undefined) {
      // İçeriksiz op SESSİZCE atlanmaz: plan bir şey öneriyor ama gövdesi yok —
      // bu bir üretim hatasıdır ve raporda görünmeli.
      outcomes.push({ kind: 'no_content', recordId: op.recordId })
      continue
    }

    // **Bastırılmış alanlar YAZILMAZ.** İlk sürüm `op.suppressedFields`i hiç okumuyordu:
    // plan "dokunulmayan alanlar" diye rapor ediyor, `apply` tam o alanları yazıyordu
    // (2. doğrulama turu). Karar ile yazma arasında uygulama katmanı yoksa, defter
    // yalnız bir rapordur — ve rapor kural değildir.
    const frontmatter = stripPointers(icerik.frontmatter, op.suppressedFields ?? [])

    const sonuc = propose({
      root: corpusRoot,
      entityType: icerik.entityType,
      slug: icerik.slug,
      frontmatter,
      body: icerik.body,
    })
    outcomes.push(
      sonuc.ok
        ? { kind: 'written', recordId: op.recordId, path: sonuc.path }
        : { kind: 'refused', recordId: op.recordId, refusal: sonuc.refusal }
    )
  }

  const say = (k: ApplyOutcome['kind']): number => outcomes.filter((o) => o.kind === k).length
  return {
    runId: plan.runId,
    outcomes,
    written: say('written'),
    refused: say('refused') + say('no_content'),
    needsHuman: say('needs_human'),
  }
}

export const formatApply = (r: ApplyReport): string => {
  const satirlar = [
    `  uygulandı: ${r.written} taslak yazıldı · ${r.refused} reddedildi · ${r.needsHuman} insan gerekiyor`,
  ]
  for (const o of r.outcomes) {
    switch (o.kind) {
      case 'written':
        satirlar.push(`    ✓ ${o.recordId} → ${o.path}`)
        break
      case 'refused':
        satirlar.push(`    ✗ ${o.recordId} — ${JSON.stringify(o.refusal)}`)
        break
      case 'needs_human':
        satirlar.push(`    ⏸ ${o.recordId} — ${o.why}`)
        break
      case 'no_content':
        satirlar.push(`    ✗ ${o.recordId} — op var ama GÖVDESİ yok (üretim hatası)`)
        break
    }
  }
  satirlar.push("  Yazılan her kayıt DRAFT: retrieval'a görünmez, onay insanın commit'idir (R-14).")
  return satirlar.join('\n')
}

/** `review`: kaydedilmiş bir planı okunur hâle getirir. Hiçbir şey yazmaz. */
export const reviewOps = (plan: DiscoveryPlan): readonly DiscoveryOp[] =>
  plan.ops.filter((o) => o.kind !== 'skip')
