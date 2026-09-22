#!/usr/bin/env node
// ChatGPT-controlled carousel render worker.
//
// This file deliberately contains NO model/provider calls. The intelligence lives in
// the chat session: content, composition and revisions are written into a PanoramaBelgesi
// JSON file. GitHub Actions only provides a reproducible Chromium render + mechanical QA.
//
// Usage:
//   node scripts/chat-carousel-render.mjs ci/chat-jobs/<job-id> <output-dir>

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const [jobArg, outArg] = process.argv.slice(2)

if (!jobArg || !outArg) {
  console.error('kullanim: node scripts/chat-carousel-render.mjs <job-dir> <output-dir>')
  process.exit(2)
}

const jobDir = resolve(REPO, jobArg)
const outDir = resolve(REPO, outArg)
const panoramaPath = join(jobDir, 'panorama.json')
const metaPath = join(jobDir, 'meta.json')

if (!existsSync(panoramaPath)) {
  console.error(`panorama.json yok: ${panoramaPath}`)
  process.exit(2)
}

const doc = JSON.parse(readFileSync(panoramaPath, 'utf8'))
const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {}

const hata = []
if (doc.slaytGenisligi !== 1080) hata.push(`slaytGenisligi 1080 olmali, gelen ${doc.slaytGenisligi}`)
if (doc.yukseklik !== 1440) hata.push(`yukseklik 1440 olmali, gelen ${doc.yukseklik}`)
if (!Array.isArray(doc.kartlar) || doc.kartlar.length < 2 || doc.kartlar.length > 10)
  hata.push('kart sayisi 2..10 arasinda olmali')
if (!Array.isArray(doc.gorseller)) hata.push('gorseller dizi olmali')
if (meta.publish !== false) hata.push('meta.publish kesinlikle false olmali')
if (hata.length) {
  console.error(hata.map((x) => `- ${x}`).join('\n'))
  process.exit(2)
}

const { renderPanorama, panoramaDenetle } = await import(join(REPO, 'packages/render/dist/index.js'))

mkdirSync(outDir, { recursive: true })
const jpegDir = join(outDir, 'jpeg')
const pngDir = join(outDir, 'png')
const metaDir = join(outDir, 'meta')
mkdirSync(jpegDir, { recursive: true })
mkdirSync(pngDir, { recursive: true })
mkdirSync(metaDir, { recursive: true })

const n = doc.kartlar.length
const pad = (i) => String(i + 1).padStart(2, '0')
const jpeg = Array.from({ length: n }, (_, i) => join(jpegDir, `slayt-${pad(i)}.jpg`))
const png = Array.from({ length: n }, (_, i) => join(pngDir, `slayt-${pad(i)}.png`))

const qa = await panoramaDenetle(doc)
if (!qa.ok) {
  console.error('panoramaDenetle calismadi:', qa.error)
  process.exit(1)
}

const jpgResult = await renderPanorama(doc, jpeg)
if (!jpgResult.ok) {
  console.error('JPEG render basarisiz:', jpgResult.error)
  process.exit(1)
}

const pngResult = await renderPanorama(doc, png)
if (!pngResult.ok) {
  console.error('PNG render basarisiz:', pngResult.error)
  process.exit(1)
}

copyFileSync(panoramaPath, join(metaDir, 'panorama.json'))
if (existsSync(metaPath)) copyFileSync(metaPath, join(metaDir, 'meta.json'))
for (const name of ['caption.md', 'sources.md', 'review.md']) {
  const src = join(jobDir, name)
  if (existsSync(src)) copyFileSync(src, join(metaDir, name))
}

const report = {
  job: meta.id ?? basename(jobDir),
  width: doc.slaytGenisligi,
  height: doc.yukseklik,
  slides: n,
  defects: qa.value,
  jpeg: jpeg.map((x) => x.slice(outDir.length + 1)),
  png: png.map((x) => x.slice(outDir.length + 1)),
}
writeFileSync(join(metaDir, 'qa.json'), JSON.stringify(report, null, 2) + '\n')

console.log(JSON.stringify(report, null, 2))
if (qa.value.length > 0) {
  console.error(`mekanik QA kusuru: ${qa.value.length}`)
  process.exit(3)
}
