#!/usr/bin/env node
// `just discovery` girişi — keşif PLANI basar, HİÇBİR ŞEY YAZMAZ (§4.4 · R-47).
//
// Neden `just plan discovery` değil: `plan` bir PIPELINE alır ve pipeline'lar
// `registry/pipelines/` altında yaşar. Keşif bir pipeline değil, marka DNA'sının
// yeniden üretimidir; onu pipeline listesine sokmak, `just plan` çıktısının anlamını
// ikiye bölerdi (D-81).
//
// Çalışma ağacına dokunmadığı GÖRÜLEBİLİR olsun diye: komut kendi başına `git status`
// çalıştırmaz, ama çıktısının sonunda ne yazdığını açıkça söyler — "yazmadım" demek
// yetmez, ne yapmadığını yazmak gerekir.

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { buildDiscoveryPlan, formatDiscoveryPlan } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)

const mode = process.argv[2] ?? 'merge'
if (mode !== 'merge' && mode !== 'mirror') {
  console.log(`✗ bilinmeyen mod: ${mode}\n  kullanım: just discovery [merge|mirror]`)
  process.exit(1)
}

const MARKA = 'brd_upcytech'
const CURRENT = join(REPO, `brand/${MARKA}/current`)
if (!existsSync(CURRENT)) {
  console.log(`✗ aktif dönem yok: brand/${MARKA}/current`)
  process.exit(1)
}
const eraSlug = readFileSync(CURRENT, 'utf8').trim()

// Adaylar bir keşif çalıştırmasından gelir (FAZ-2.9). Bugün yoklar ve bu SESSİZCE
// "0 op" diye gösterilmez — boş bir plan ile değişmemiş bir corpus aynı şey değildir.
const ADAYLAR = join(REPO, 'derived/runs/discovery-candidates.json')
const adaylar = existsSync(ADAYLAR) ? JSON.parse(readFileSync(ADAYLAR, 'utf8')) : null

const plan = buildDiscoveryPlan({
  runId: 'run_discovery_dry',
  brandId: MARKA,
  eraSlug,
  mode,
  existing: [],
  candidates: adaylar ?? [],
})

console.log(formatDiscoveryPlan(plan))
console.log('')
if (adaylar === null) {
  console.log("  ⚠ aday listesi YOK — keşif çalıştırması FAZ-2.9'da koşacak.")
  console.log('    Yukarıdaki plan boş bir corpus üzerindedir; "değişiklik yok" demek')
  console.log('    DEĞİLDİR. İkisini karıştırmak, hiç koşmamış bir motoru çalışıyor sanmaktır.')
}
console.log('  Bu komut hiçbir dosya YAZMADI: sıfır ağ, sıfır yazma, sıfır commit.')
