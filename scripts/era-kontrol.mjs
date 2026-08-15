#!/usr/bin/env node
// `era` kapısı: dönem manifesti, git etiketi ve `current` işaretçisi tutarlı mı (§4.3).

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const hatalar = []

const etiketler = new Set(
  spawnSync('git', ['tag', '-l', 'era/*'], { cwd: REPO, encoding: 'utf8' })
    .stdout.split('\n')
    .filter((x) => x !== '')
)

const markalar = readdirSync(join(REPO, 'brand'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

let donemSayisi = 0
for (const marka of markalar) {
  const eraKok = join(REPO, `brand/${marka}/eras`)
  if (!existsSync(eraKok)) {
    hatalar.push(`${marka}: eras/ dizini yok — dönem modeli olmadan marka yaşayamaz`)
    continue
  }
  const donemler = readdirSync(eraKok, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  if (donemler.length === 0) hatalar.push(`${marka}: hiç dönem yok`)

  for (const slug of donemler) {
    donemSayisi++
    if (!existsSync(join(eraKok, slug, 'era.yaml'))) {
      hatalar.push(`${marka}/${slug}: era.yaml yok`)
    }
    // Etiket, dönemin git tutamağıdır: onsuz "o günkü ağacı ver" cevapsız kalır.
    if (!etiketler.has(`era/${slug}`)) {
      hatalar.push(`${marka}/${slug}: 'git tag era/${slug}' YOK (§4.3)`)
    }
  }

  // `current` var olan bir döneme işaret etmeli; etmezse retrieval boş döner ve
  // sebebi hiçbir yerde yazmaz.
  const cur = join(REPO, `brand/${marka}/current`)
  if (!existsSync(cur)) {
    hatalar.push(`${marka}: current dosyası yok`)
  } else {
    const aktif = readFileSync(cur, 'utf8').trim()
    if (!donemler.includes(aktif)) {
      hatalar.push(`${marka}: current '${aktif}' diyor ama o dönem yok`)
    }
  }
}

if (hatalar.length > 0) {
  console.log(hatalar.map((h) => `  ✗ ${h}`).join('\n'))
  console.log(`\n${hatalar.length} dönem tutarsızlığı`)
  process.exit(1)
}
console.log(`  ${markalar.length} marka · ${donemSayisi} dönem · etiket ve current tutarlı`)
