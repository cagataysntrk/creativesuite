#!/usr/bin/env node
// `just plan` girişi — HİÇBİR ŞEY HARCAMAZ (§8.3 · R-47).
//
// Sıfır ağ, sıfır yazma. Ağ kablosu çekiliyken de çalışır; çalışmıyorsa bir yerde
// kaçak I/O var demektir ve o kaçak, çalıştırma öncesi maliyet tahminini yalan yapar.

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const PIPELINES = join(REPO, 'registry/pipelines')

const { loadPipeline, listPipelines } = await import(join(REPO, 'packages/registry/dist/index.js'))
const { plan, formatPlan } = await import(join(REPO, 'packages/engine/dist/index.js'))

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
})

if (!sonuc.ok) {
  console.log('✗ plan üretilemedi — kuru ikizi olmayan fiil sessizce ATLANMAZ:')
  for (const e of sonuc.errors) console.log(`    ${JSON.stringify(e)}`)
  process.exit(1)
}

console.log(formatPlan(sonuc.report))
