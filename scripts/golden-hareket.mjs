#!/usr/bin/env node
// Hareket katmanının tarayıcısı bizim tipografimizi bozuyor mu (D-194 · FAZ-5.1).
//
// **Sorulan tek soru:** HyperFrames'in Chrome'u (135.x) ile bizim Playwright
// Chromium'umuz (141.x) `ĞÜŞİÖÇ ğüşıöç Ağrı İğne` dizesini AYNI mı çiziyor.
//
// R-30 artık "sınır ikili değil MOTOR" diyor — ama bu bir muafiyet değil, bir BORÇ:
// ikinci ikili ancak eşdeğerlik ÖLÇÜLDÜĞÜ sürece kabul. Ölçüm ayrışırsa hareket
// katmanı kullanılamaz ve Revideo yedeğine geçilir (D-25).
//
// **Aynı ölçüm kodu iki ikilide koşuyor.** `measureGolden` bir `executablePath`
// alıyor ve tarayıcı içi ölçüm betiği tek yerde. İkinci bir ölçüm yazmak, "aynı mı"
// sorusunu cevaplanamaz yapardı: farkın ölçümden mi motordan mı geldiği bilinemezdi.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { measureGolden, diffMetrics, formatDiff, PROOF_TEXT } = await import(
  join(REPO, 'packages/render/dist/index.js')
)

// HyperFrames'in KENDİ çözdüğü yol — tahmin edilmiyor, ona soruluyor.
let hfChrome
try {
  hfChrome = execFileSync(join(REPO, 'node_modules/.bin/hyperframes'), ['browser', 'path'], {
    encoding: 'utf8',
    timeout: 120_000,
  })
    .trim()
    .split('\n')
    .pop()
    .trim()
} catch (e) {
  console.log(`✗ hyperframes browser path okunamadı: ${e.message}`)
  process.exit(1)
}

if (!existsSync(hfChrome)) {
  console.log(`✗ HyperFrames Chrome'u yok: ${hfChrome}`)
  console.log("  'npx hyperframes browser ensure' ile indirin")
  process.exit(1)
}

const MARKA = 'brd_upcytech'
const AKTIF_DONEM = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()
const tokenYolu = join(REPO, `brand/${MARKA}/derived-tokens/tokens.css`)
if (!existsSync(tokenYolu)) {
  console.log(`✗ marka token'ları yok: ${tokenYolu}`)
  process.exit(1)
}
const tokenCss = readFileSync(tokenYolu, 'utf8')

// Hareket 9:16 — Reels ve Stories'in ölçüsü (§9.1). Statik golden 4:5 ölçüyor;
// hareket katmanının kendi ölçüsünde ölçmek, gerçekten kullanılacak boyutu sınar.
const doc = {
  kind: 'post',
  width: 1080,
  height: 1920,
  tokenCss,
  stamp: {
    brandId: MARKA,
    eraId: AKTIF_DONEM,
    kitVersion: 'golden-hareket',
    definitionDigest: 'sha256:golden-hareket',
    contextManifest: 'golden-hareket',
    sourceRunId: 'run_golden_hareket',
  },
  blocks: [
    { type: 'heading', text: PROOF_TEXT, level: 1 },
    { type: 'body', text: `${PROOF_TEXT} · İstanbul'da yazılım çözümleri` },
  ],
}

const bizim = await measureGolden(doc)
if (!bizim.ok) {
  console.log(`✗ Playwright ölçümü başarısız: ${bizim.error.message}`)
  process.exit(1)
}

const hareket = await measureGolden(doc, hfChrome)
if (!hareket.ok) {
  console.log(`✗ HyperFrames Chrome ölçümü başarısız: ${hareket.error.message}`)
  process.exit(1)
}

// **Sıfır `notdef` her iki ikilide de ZORUNLU** (R-31). Bir ikilide font düşerse
// karşılaştırma zaten anlamsız — iki bozuk çıktı da "eşit" olabilir.
for (const [ad, m] of [
  ['Playwright', bizim.value],
  ['HyperFrames', hareket.value],
]) {
  if (m.notdefCount !== 0) {
    console.log(`✗ ${ad}: ${m.notdefCount} eksik glyph — font düşmüş (R-31)`)
    process.exit(1)
  }
}

// Playwright ölçümü TEMEL, HyperFrames ölçümü aday: `diffMetrics` zaten golden
// karşılaştırmasının kendisi ve eşiği orada tanımlı — ikinci bir eşik, ikinci bir
// gerçek olurdu.
const farklar = diffMetrics(bizim.value, hareket.value)

if (farklar.length > 0) {
  console.log(`✗ hareket katmanı tipografiyi AYRIŞTIRIYOR (${farklar.length} fark)`)
  console.log(formatDiff(farklar))
  console.log('')
  console.log('  R-30: ikinci ikili ancak eşdeğerlik kanıtlanırsa kabul edilir.')
  console.log('  Ayrışma sürüyorsa hareket katmanı Revideo yedeğine geçer (D-25).')
  process.exit(1)
}

console.log(
  `✓ golden-hareket: ${PROOF_TEXT} · iki Chromium ikilisi AYNI metrikleri veriyor\n` +
    `    Playwright  ${bizim.value.blocks.length} blok · ${bizim.value.notdefCount} eksik glyph\n` +
    `    HyperFrames ${hareket.value.blocks.length} blok · ${hareket.value.notdefCount} eksik glyph\n` +
    `    ikili: ${hfChrome}`
)
