#!/usr/bin/env node
// `just plan` girişi — HİÇBİR ŞEY HARCAMAZ (§8.3 · R-47).
//
// Sıfır ağ, sıfır yazma. Ağ kablosu çekiliyken de çalışır; çalışmıyorsa bir yerde
// kaçak I/O var demektir ve o kaçak, çalıştırma öncesi maliyet tahminini yalan yapar.

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const PIPELINES = join(REPO, 'registry/pipelines')
const RECIPES = join(REPO, 'registry/recipes')

const { loadPipeline, listPipelines, loadRecipe, listRecipes } = await import(
  join(REPO, 'packages/registry/dist/index.js')
)
const { plan, formatPlan, assembleContext, formatContext, pricingFromDescriptor } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)
const { loadDescriptors, saglayiciOrtami } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
// Ortam TEK okuyucudan (`secret-okuyucu` darboğazı, §14).
const { readEnv } = await import(join(REPO, 'packages/kernel/dist/index.js'))

// Fiyatlar tanımlayıcılardan gelir, koddan değil (D-32). `plan()` dosya OKUMAZ —
// çağıran okur ve verir; plan saf kalır ki testte gerçek dosya sistemi gerekmesin.
const { descriptors } = loadDescriptors(join(REPO, 'registry/providers'))

const id = process.argv[2]
if (id === undefined) {
  const hepsi = listPipelines(PIPELINES)
  console.log(`  kullanım: just plan <pipeline>\n  mevcut: ${hepsi.join(', ') || '(yok)'}`)
  process.exit(hepsi.length === 0 ? 1 : 0)
}

const cozum = loadPipeline(PIPELINES, id)
if (!cozum.ok) {
  console.log(`✗ pipeline çözülemedi: ${id}`)
  for (const e of cozum.errors) console.log(`    ${JSON.stringify(e)}`)
  process.exit(1)
}

const sonuc = plan({
  pipeline: cozum.value,
  runId: 'run_plan_dry',
  brandId: 'brd_plan_dry',
  eraId: '*',
  // ⚠ **Eskiden yalnız `PATH` geçiliyordu** ve `just plan` anahtarlar kasada olsa
  // bile her sağlayıcıyı "yerel önkoşul sağlanmadı" diye eliyordu (D-237). Ortam
  // artık tanımlayıcıların `auth_env` beyanından türetiliyor; elle sayılan liste yok.
  // Okuyucu TEK: `readEnv` (secret-okuyucu darboğazı, §14).
  env: saglayiciOrtami(descriptors, readEnv, ['CF_ACCOUNT_ID']),
  pricing: Object.fromEntries(
    descriptors
      .filter((d) => d.enabled)
      .flatMap((d) => d.capabilities.map((c) => [d.id, pricingFromDescriptor(d, c.name)]))
  ),
})

if (!sonuc.ok) {
  console.log('✗ plan üretilemedi — kuru ikizi olmayan fiil sessizce ATLANMAZ:')
  for (const e of sonuc.errors) console.log(`    ${JSON.stringify(e)}`)
  process.exit(1)
}

console.log(formatPlan(sonuc.report))

// ── bağlam manifesti (§5.3 · FAZ-2.3) ───────────────────────────────────────
// `just plan` neyin ENJEKTE EDİLECEĞİNİ de göstermek zorunda: maliyet tahmini
// dürüst olsa bile "bu çıktı neden böyle" sorusu bağlam görünmeden cevaplanamaz.
if (listRecipes(RECIPES).includes(id)) {
  const tarif = loadRecipe(RECIPES, id)
  if (!tarif.ok) {
    console.log(`\n✗ bağlam tarifi çözülemedi: ${id}`)
    for (const e of tarif.errors) console.log(`    ${JSON.stringify(e)}`)
    process.exit(1)
  }
  // Corpus HENÜZ YOK (FAZ-2.9'da doğuyor): kayıtlar boş, manifest yapıyı gösterir.
  // Boş corpus'u "bağlam hazır" gibi göstermemek için satır açıkça söylüyor.
  const manifest = assembleContext(tarif.value, {})
  console.log('')
  console.log(formatContext(manifest))
  console.log("    (corpus boş — FAZ-2.9'da dolacak; bütçe yapısı yukarıda)")
} else {
  console.log(`\n  bağlam tarifi YOK: registry/recipes/${id}.recipe.yaml`)
}
