#!/usr/bin/env node
// GROUP: fast
// "Tam olarak bir tane olmalı" zorlaması (§3.8 · FAZ-0.C.8).
//
// `chokepoints.json` LİSTEDİR, bu dosya onu LİNT'E çevirir. Listeye satır eklemek
// zorlamayı otomatik getirir — kural ile zorlamanın ayrı yerlerde yaşaması, birinin
// sessizce bayatlaması demektir.
//
// `desen: null` olan darbogazlar BEYAN'dır: kural kabul edilmiş ama mekanik denetimi
// henüz yok. Bunlar gizlenmez, SAYILIR ve her turda ekrana basılır. Zorlanmayan bir
// kuralı zorlanıyormuş gibi göstermek, hiç yazmamaktan kötüdür.

import { readFileSync, globSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

const cfg = JSON.parse(readFileSync(p('chokepoints.json'), 'utf8'))
const list = cfg.darbogazlar ?? []
if (list.length === 0) {
  console.log('✗ chokepoints.json boş — kapı boş geçiyor')
  process.exit(1)
}

// Yorum satırları ve dize içi eşleşmeler gürültüdür. Blok yorumları ve `//` satırlarını
// düşür; kalan kod üstünde ara. Mükemmel bir ayrıştırıcı değil ama yanlış POZİTİF
// üretmez — ve sürekli yanlış alarm veren kapı, kapatılan kapıdır.
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const errors = []
let enforced = 0
const declaredOnly = []
let scannedTotal = 0

for (const cp of list) {
  if (!cp.id || !Array.isArray(cp.izinli) || !cp.neden) {
    errors.push(`chokepoints.json: eksik alan (${cp.id ?? '?'}) — id, izinli ve neden zorunlu`)
    continue
  }
  if (!cp.desen) {
    declaredOnly.push(cp.id)
    continue
  }
  enforced++

  const globs = cp.kapsam ?? cfg.kapsam_varsayilan
  const files = globs.flatMap((g) => globSync(g, { cwd: REPO }))
  const allowed = new Set(cp.izinli)
  // `kapsam_haric` ile `izinli` AYNI ŞEY DEĞİLDİR. `izinli` = "tek yetkili yer",
  // kuralın anlamı orada yaşar. `kapsam_haric` = "kural burada anlamsız". Test
  // dosyaları üretim yoluna import edilmez; oradaki bir cast ikinci bir açıcı değildir.
  // Ayrım kaybolursa muafiyet listesi sessizce şişer ve kapı boşalır.
  const haric = new Set((cp.kapsam_haric ?? []).flatMap((g) => globSync(g, { cwd: REPO })))
  const re = new RegExp(cp.desen, 'gm')

  for (const rel of files) {
    if (allowed.has(rel) || haric.has(rel)) continue
    scannedTotal++
    const src = stripComments(readFileSync(p(rel), 'utf8'))
    const lines = src.split('\n')
    lines.forEach((line, i) => {
      re.lastIndex = 0
      if (re.test(line)) {
        errors.push(
          `${rel}:${i + 1}  darboğaz ihlali "${cp.id}" (${cp.ad}) — ` +
            `tek yetkili yer: ${cp.izinli.join(', ')}\n      neden: ${cp.neden}`
        )
      }
    })
  }
}

// ── sahip dosyası var mı ─────────────────────────────────────────────────────
// Darboğazın `faz`ı ZATEN TİKLİYSE sahip dosyası var olmak zorunda. Yoksa kapı,
// var olmayan bir dosyayı "tek yetkili yer" diye gösteriyor ve "mekanik zorlanıyor"
// sayısı şişiyor — doğrulama agent'ı 2026-08-15'te tam bunu buldu (D-70).
// Gelecek fazlara ait beyanlar meşrudur ve AYRICA sayılır.
const tikli = new Map()
for (let n = 0; n <= 9; n++) {
  const f = `docs/fazlar/FAZ-${n}.md`
  if (!existsSync(p(f))) continue
  for (const m of readFileSync(p(f), 'utf8').matchAll(
    /^##+ +(\d+)\.([A-Za-z0-9.]+?) +—.*?\[( |x)\]/gm
  )) {
    if (m[1] === String(n)) tikli.set(`FAZ-${m[1]}.${m[2]}`, m[3] === 'x')
  }
}

let bekleyenSahip = 0
for (const cp of list) {
  for (const yol of cp.izinli ?? []) {
    if (existsSync(p(yol))) continue
    const faz = cp.faz ?? null
    if (faz !== null && tikli.get(faz) === true) {
      errors.push(
        `${cp.id}: sahip dosyası YOK (${yol}) ama ${faz} TİKLİ — ` +
          `kapı var olmayan bir dosyayı "tek yetkili yer" gösteriyor`
      )
    } else {
      bekleyenSahip++
    }
  }
}

if (scannedTotal === 0 && enforced > 0) {
  console.log('✗ hiçbir kaynak dosya taranmadı — kapsam yanlış, kapı boş geçiyor')
  process.exit(1)
}

if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} darboğaz ihlali`)
  process.exit(1)
}

console.log(
  `  ${list.length} darboğaz · ${enforced} mekanik zorlanıyor · ` +
    `${declaredOnly.length} beyan · ${bekleyenSahip} sahibi gelecek fazda`
)
if (declaredOnly.length) console.log(`  beyan: ${declaredOnly.join(', ')}`)
