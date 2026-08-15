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
//
// İkinci ve üçüncü argüman aday/mevcut listelerini dosyadan alır. Sebep kolaylık değil
// KANIT: "ikinci çalıştırma 0 op üretir" FAZ 2'nin çıkış kriteridir ve corpus doğmadan
// (FAZ-2.9) gerçek komutla gösterilemezdi.
const adayYolu = process.argv[3] ?? 'derived/runs/discovery-candidates.json'
const mevcutYolu = process.argv[4] !== undefined && process.argv[4] !== '' ? process.argv[4] : null
const oku = (rel) => {
  const tam = rel.startsWith('/') ? rel : join(REPO, rel)
  return existsSync(tam) ? JSON.parse(readFileSync(tam, 'utf8')) : null
}
const adaylar = oku(adayYolu)
const mevcutlar = mevcutYolu === null ? [] : (oku(mevcutYolu) ?? [])

// Sticky karar defteri (§4.5) — reddedilen öneri tekrar sorulmaz.
const DEFTER = join(REPO, `brand/${'brd_upcytech'}/decisions.jsonl`)
const { parseLedger } = await import(join(REPO, 'packages/engine/dist/index.js'))
const defterSonuc = existsSync(DEFTER)
  ? parseLedger(readFileSync(DEFTER, 'utf8'))
  : { ledger: undefined, badLines: [] }
if (defterSonuc.badLines.length > 0) {
  console.log(`✗ decisions.jsonl bozuk satır: ${defterSonuc.badLines.join(', ')}`)
  console.log('  Atlanan bir red kaydı, insanın hayır dediği öneriyi tekrar sormaktır.')
  process.exit(1)
}

const plan = buildDiscoveryPlan({
  runId: 'run_discovery_dry',
  brandId: MARKA,
  eraSlug,
  mode,
  existing: mevcutlar,
  candidates: adaylar ?? [],
  ...(defterSonuc.ledger === undefined ? {} : { ledger: defterSonuc.ledger }),
})

console.log(formatDiscoveryPlan(plan))
console.log('')
if (adaylar === null) {
  console.log("  ⚠ aday listesi YOK — keşif çalıştırması FAZ-2.9'da koşacak.")
  console.log('    Yukarıdaki plan boş bir corpus üzerindedir; "değişiklik yok" demek')
  console.log('    DEĞİLDİR. İkisini karıştırmak, hiç koşmamış bir motoru çalışıyor sanmaktır.')
}
console.log('  Bu komut hiçbir dosya YAZMADI: sıfır ağ, sıfır yazma, sıfır commit.')
