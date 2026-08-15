#!/usr/bin/env node
// `just onay <run_id> onayla|reddet [gerekçe]` — İNSANIN çalıştırma kapısı kararı
// (§4c · §13 · R-14 · D-145).
//
// **`just onayla` corpus kaydını, `just onay` bir ÇALIŞTIRMAYI onaylar.** İkisi ayrı:
// biri bilginin doğruluğuna, diğeri o bilgiden üretilmiş varlığa dair.
//
// **Komut insanın klavyesinden çalışır.** Agent'ın bunu çağırması R-14'ü çiğnemektir:
// kendi ürettiğini onaylayan bir agent, onay kuyruğunu bir formaliteye çevirir.
//
// Komut commit ATMAZ — onay, insanın `just save` ile attığı commit'tir.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { manifestPath } = await import(join(REPO, 'packages/kernel/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const runId = process.argv[2]
const karar = process.argv[3]
const gerekce = process.argv.slice(4).join(' ').trim()

if (runId === undefined || (karar !== 'onayla' && karar !== 'reddet')) {
  console.log('  kullanım: just onay <run_id> onayla|reddet [gerekçe]')
  console.log('  örnek:    just onay run_01a0… reddet "başlık ikinci slaytta kesiliyor"')
  process.exit(1)
}

// **Red GEREKÇE İSTER.** Gerekçesiz bir red, sonraki çalıştırmaya negatif kısıt olarak
// giremez (§12.9) ve altı ay sonra "bu neden reddedildi" sorusu cevapsız kalır.
if (karar === 'reddet' && gerekce === '') {
  console.log('✗ red GEREKÇE ister — gerekçesiz red, sonraki çalıştırmaya bilgi taşımaz')
  console.log('  just onay <run_id> reddet "…"')
  process.exit(1)
}

const yol = join(REPO, manifestPath(runId))
if (!existsSync(yol)) {
  console.log(`✗ çalıştırma bulunamadı: ${runId}`)
  console.log(`  aranan: ${manifestPath(runId)}`)
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(yol, 'utf8'))
// Hangi kapı? Manifest'te duran adım kapıyı taşımıyor (kapıda DURDUĞU için hiç
// yazılmadı), o yüzden pipeline'dan okunur.
const { loadPipeline } = await import(join(REPO, 'packages/registry/dist/index.js'))
const hat = loadPipeline(join(REPO, 'registry/pipelines'), manifest.pipeline)
if (!hat.ok) {
  console.log(`✗ pipeline çözülemedi: ${manifest.pipeline}`)
  process.exit(1)
}
const hatKapilari = hat.value.steps.map((s) => s.gate).filter((g) => g !== null)
if (hatKapilari.length === 0) {
  console.log(`✗ ${manifest.pipeline} hattında insan kapısı yok — onaylanacak bir şey yok`)
  process.exit(1)
}

const mevcut = manifest.decisions ?? []
const yeni = hatKapilari
  .filter((g) => !mevcut.some((d) => d.gate === g))
  .map((g) => ({
    gate: g,
    decision: karar === 'onayla' ? 'approved' : 'rejected',
    at: systemClock.nowIso(),
    note: gerekce === '' ? null : gerekce,
  }))

if (yeni.length === 0) {
  console.log(`  ${runId}: bütün kapılar zaten kararlı`)
  for (const d of mevcut) console.log(`    ${d.gate}: ${d.decision} (${d.at})`)
  process.exit(0)
}

manifest.decisions = [...mevcut, ...yeni]
writeFileSync(yol, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`  ${runId}`)
for (const d of yeni) {
  console.log(`    ${d.gate}: ${d.decision}${d.note === null ? '' : ` — ${d.note}`}`)
}
console.log('')
console.log(`  Karar manifest'e yazıldı: ${manifestPath(runId)}`)
console.log(`  Sonraki adım:  just uret <pipeline> --devam ${runId}  →  hat kapıdan geçer`)
console.log("  Onay COMMIT değildir: kaydetmek için 'just save' (çalıştırma commit'i).")
