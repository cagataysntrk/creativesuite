// Bağlam birleştirici — SAF (§5.3 · §13 · D-63).
//
// Girdi: tarif + zaten seçilmiş kayıtlar. Çıktı: **bağlam manifesti** — hangi kayıt,
// NEDEN dahil edildi, kaç token tahmin edildi, ne kesildi.
//
// Dosya okumaz, sorgu atmaz, saat okumaz. Seçme işi `selectRecords`ün (§5.2), okuma işi
// çağıranın. Burada yalnız sıralama ve kesme var — ve **kesme asla sessiz değil**:
// manifest her bölümün ne kaybettiğini sayıyla söyler. Sessiz kırpma, prompt'un yarısını
// kaybedip çıktıyı "model kötü" diye açıklamaktır.

import type { ContextRecipe, RecipeSection } from '@suite/registry'
import { estimateTokens } from './estimate.js'

/** Bağlama giren tek kayıt. `reason` manifestte GÖRÜNÜR — "neden buradasın" cevabı. */
export interface IncludedRecord {
  readonly id: string
  readonly title: string
  readonly type: string
  readonly tokenEstimate: number
  /** İnsan okuyacak: hangi bölüm, hangi sıra, hangi tarif kuralı getirdi. */
  readonly reason: string
}

export interface SectionManifest {
  readonly id: string
  readonly entityType: string
  readonly tokenBudget: number
  readonly tokenEstimate: number
  readonly included: readonly IncludedRecord[]
  /** Aday olup GİRMEYEN kayıtlar ve sebebi. Boş olması "hepsi girdi" demektir. */
  readonly dropped: readonly { readonly id: string; readonly reason: string }[]
}

export interface ContextManifest {
  readonly recipeId: string
  readonly totalBudget: number
  readonly tokenEstimate: number
  readonly sections: readonly SectionManifest[]
  /** Herhangi bir bölümde kesme oldu mu. `just plan` bunu MANŞETTE gösterir. */
  readonly truncated: boolean
}

/** Bağlama girmeye aday kayıt. Alan adları `SelectedRecord` ile bilerek aynı. */
export interface CandidateRecord {
  readonly id: string
  readonly type: string
  readonly title: string
  readonly body: string
}

const bolumuDoldur = (
  section: RecipeSection,
  adaylar: readonly CandidateRecord[],
  kalanToplam: number
): SectionManifest => {
  const included: IncludedRecord[] = []
  const dropped: { id: string; reason: string }[] = []
  let kullanilan = 0

  for (const [i, r] of adaylar.entries()) {
    const maliyet = estimateTokens(`${r.title}\n${r.body}`)

    if (i >= section.maxRecords) {
      dropped.push({ id: r.id, reason: `max_records ${section.maxRecords} doldu` })
      continue
    }
    if (kullanilan + maliyet > section.tokenBudget) {
      dropped.push({
        id: r.id,
        reason: `bölüm bütçesi aşılıyor (${kullanilan + maliyet}/${section.tokenBudget} tahmini token)`,
      })
      continue
    }
    if (kullanilan + maliyet > kalanToplam) {
      dropped.push({
        id: r.id,
        reason: `toplam bütçe doldu (${kalanToplam} tahmini token kalmıştı)`,
      })
      continue
    }
    included.push({
      id: r.id,
      title: r.title,
      type: r.type,
      tokenEstimate: maliyet,
      reason: `${section.id} bölümü · ${section.entityType} · sıra ${i + 1}/${section.maxRecords}`,
    })
    kullanilan += maliyet
  }

  return {
    id: section.id,
    entityType: section.entityType,
    tokenBudget: section.tokenBudget,
    tokenEstimate: kullanilan,
    included,
    dropped,
  }
}

/**
 * Tarifi kayıtlara uygular.
 *
 * **Sıra belirleyicidir:** toplam bütçe dolduğunda sondaki bölüm kesilir, baştaki değil.
 * Tarifte bölüm sırasını değiştirmek, neyin feda edileceğini değiştirmektir — ve bu
 * kararın kod yerine YAML'da yaşaması, D-11'in ("şema veri, kod değil") bağlam hâlidir.
 */
export const assembleContext = (
  recipe: ContextRecipe,
  kayitlar: Readonly<Record<string, readonly CandidateRecord[]>>
): ContextManifest => {
  const sections: SectionManifest[] = []
  let toplam = 0

  for (const s of recipe.sections) {
    const bolum = bolumuDoldur(s, kayitlar[s.entityType] ?? [], recipe.totalBudget - toplam)
    sections.push(bolum)
    toplam += bolum.tokenEstimate
  }

  return {
    recipeId: recipe.id,
    totalBudget: recipe.totalBudget,
    tokenEstimate: toplam,
    sections,
    truncated: sections.some((s) => s.dropped.length > 0),
  }
}

/** Manifesti insan gözü için basar. `just plan` bunu kullanır. */
export const formatContext = (m: ContextManifest): string => {
  const satirlar: string[] = [
    `  bağlam: ${m.recipeId} · ${m.tokenEstimate}/${m.totalBudget} tahmini token` +
      (m.truncated ? ' · ⚠ KESME VAR' : ''),
  ]
  for (const s of m.sections) {
    satirlar.push(
      `    ${s.id.padEnd(14)} ${String(s.tokenEstimate).padStart(5)}/${s.tokenBudget}` +
        ` · ${s.included.length} kayıt` +
        (s.dropped.length > 0 ? ` · ${s.dropped.length} DIŞARIDA` : '')
    )
    for (const d of s.dropped) satirlar.push(`        ✗ ${d.id} — ${d.reason}`)
  }
  return satirlar.join('\n')
}
