// Context Preview verisi (§5.3, §12.9 · FAZ-4.5).
//
// Ekranın sorusu: **"bu pipeline çalışırsa prompt'a ne girecek ve neden?"** Cevap
// çalıştırmadan önce verilmeli, çünkü bağlamı çalıştırma sonrası öğrenmek "model kötü"
// demenin en kolay yolu.
//
// **Adaylar retrieval yükleminden gelir** (`selectRecords`) — ikinci bir yol YOK (R-13).
// Bu, `uret.mjs`in ürettiği bağlamla önizlemenin AYNI olmasının tek garantisi: iki ayrı
// seçim yolu, ekranda gördüğünüzle çalışanın ayrışması demekti.
//
// **Hiçbir şey harcamaz.** Yalnız corpus okur ve saf bir birleştirici çağırır (R-47).

import { assembleContext, toManifestEntries, type ContextManifest } from '@suite/engine'
import { loadRecipe, listRecipes } from '@suite/registry'
import { browseRecords, selectRecords, type SelectQuery } from '@suite/corpus'
import type { Db } from '@suite/kernel'
import type { ContextManifestEntry } from '@suite/kernel'

export interface BaglamGirdisi {
  readonly db: Db
  readonly recipesDir: string
  readonly recipeId: string
  readonly query: SelectQuery
  /** Operatörün kapattığı kayıtlar. Filtre DEĞİL, karar — manifeste yazılır (§5.3). */
  readonly excluded?: readonly string[]
}

export type BaglamSonuc =
  | {
      readonly ok: true
      readonly manifest: ContextManifest
      /** Deftere gidecek satırlar — kapatılanlar `DÜŞTÜ:` gerekçesiyle burada. */
      readonly girdiler: readonly ContextManifestEntry[]
      /** Her bölümün ADAY havuzu: kapatılan kart yeniden açılabilsin diye. */
      readonly adaylar: Readonly<Record<string, readonly { id: string; title: string }[]>>
      /**
       * Bölüm BOŞSA nedeni. `null` = boş değil.
       *
       * Boş bir bölümü sessizce göstermek, operatörün "bu pipeline bağlam kullanmıyor"
       * sanmasına yol açar. Oysa üç ayrı sebep olabilir ve üçü çok farklı iş gerektirir:
       * o tipte hiç kayıt yok · kayıt var ama onay bekliyor · kayıt var ama dönem dışı.
       */
      readonly bosNedenleri: Readonly<Record<string, string | null>>
    }
  | { readonly ok: false; readonly hata: string }

export const baglamOnizle = (g: BaglamGirdisi): BaglamSonuc => {
  if (!listRecipes(g.recipesDir).includes(g.recipeId)) {
    // Var olmayan tarif için BOŞ manifest dönmüyoruz: boş bir önizleme "bu pipeline
    // hiç bağlam kullanmıyor" okunur ve o çok farklı bir şeydir.
    return { ok: false, hata: `tarif yok: ${g.recipeId}` }
  }
  const tarif = loadRecipe(g.recipesDir, g.recipeId)
  if (!tarif.ok) return { ok: false, hata: `tarif bozuk: ${g.recipeId}` }

  const adaylar: Record<string, { id: string; title: string; type: string; body: string }[]> = {}
  for (const b of tarif.value.sections) {
    adaylar[b.entityType] = selectRecords(g.db, { ...g.query, type: b.entityType, limit: 20 }).map(
      (k) => ({ id: k.id, title: k.title === '' ? k.id : k.title, type: k.type, body: k.body })
    )
  }

  const manifest = assembleContext(tarif.value, adaylar, { excluded: g.excluded ?? [] })
  const havuz: Record<string, { id: string; title: string }[]> = {}
  const bosNedenleri: Record<string, string | null> = {}
  for (const [tip, liste] of Object.entries(adaylar)) {
    havuz[tip] = liste.map((k) => ({ id: k.id, title: k.title }))
    bosNedenleri[tip] = liste.length > 0 ? null : bosNeden(g, tip)
  }

  return {
    ok: true,
    manifest,
    girdiler: toManifestEntries(manifest),
    adaylar: havuz,
    bosNedenleri,
  }
}

/**
 * Bir bölüm neden boş — **veriden ölçülür, tahmin edilmez**.
 *
 * `browseRecords` görünürlüğü retrieval yükleminden TÜRETİR (R-13), o yüzden burada
 * ikinci bir kural yok: yalnız "kaç kayıt var" ile "kaçı görünüyor" karşılaştırılıyor.
 */
const bosNeden = (g: BaglamGirdisi, tip: string): string => {
  const hepsi = browseRecords(g.db, {
    brandId: g.query.brandId,
    eraId: g.query.eraId,
    asOf: g.query.asOf,
    type: tip,
  })
  if (hepsi.length === 0) return `bu markada '${tip}' tipinde hiç kayıt yok`

  const taslak = hepsi.filter((r) => r.status === 'draft').length
  const emekli = hepsi.filter((r) => r.status === 'retired').length
  const parcalar: string[] = []
  if (taslak > 0) parcalar.push(`${taslak} taslak (insan onayı bekliyor — R-14)`)
  if (emekli > 0) parcalar.push(`${emekli} emekli`)
  const kalan = hepsi.length - taslak - emekli
  if (kalan > 0) parcalar.push(`${kalan} kayıt dönem ya da geçerlilik tarihi dışında`)

  return `${hepsi.length} kayıt var ama hiçbiri retrieval'a görünmüyor: ${parcalar.join(' · ')}`
}
