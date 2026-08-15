#!/usr/bin/env node
// GROUP: fast
// Atıf bütünlüğü. Her §N / R-nn / D-nn / V-nn / FAZ-N.x / LOOP§X hedefte var olmalı.
//
// Neden bloklayıcı: bağlamsız bir agent atıfı körü körüne izler. Kırık bir atıf,
// var olmayan bir bölümü "okudum" sanmasına ve yanlış varsayımla kod yazmasına yol açar.
// Sessiz çürüme burada başlar.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)
const read = (f) => (existsSync(p(f)) ? readFileSync(p(f), 'utf8') : null)

// ── hedef kümeleri ───────────────────────────────────────────────────────────
const anayasa = read('docs/ANAYASA.md')
const anchors = new Set()
if (anayasa) {
  for (const m of anayasa.matchAll(/\{#section-([0-9-]+)\}/g)) {
    anchors.add(m[1].replace(/-/g, '.'))
  }
}

const idSet = (file, re) => {
  const t = read(file)
  if (t === null) return null // dosya henüz yok → uyarı, hata değil
  return new Set([...t.matchAll(re)].map((m) => m[1]))
}
const rules = idSet('KURALLAR.md', /^##+ +`?(R-\d+)`?/gm)
const decisions = idSet('KARARLAR.md', /^##+ +`?(D-\d+)`?/gm)
const debts = idSet('KARARLAR.md', /^##+ +`?(V-\d+)`?/gm)

// Reddedilmiş kararlar. Bir karar silinmez, açık bir DURUM satırıyla işaretlenir:
//     **Durum:** reddedildi → D-nn
// Anahtar kelime taraması YETMEZ: bir kararın gövdesinde "Remotion reddedildi" yazması,
// kararın kendisinin reddedildiği anlamına gelmez. İşaretleyici açık olmak zorunda.
// Reddedilmiş bir karara atıf vermek hatadır — geçersiz gerekçeye dayanmak, gerekçesiz
// olmaktan kötüdür, çünkü sağlam görünür.
const rejected = new Set()
{
  const t = read('KARARLAR.md')
  if (t) {
    for (const b of t.split(/\n(?=##+ +`?[DV]-\d+)/)) {
      const id = b.match(/^##+ +`?([DV]-\d+)`?/)?.[1]
      if (id && /^\*\*Durum:\*\*\s*reddedildi\b/m.test(b)) rejected.add(id)
    }
  }
}
const loopSections = new Set(
  [...(read('docs/LOOP.md') ?? '').matchAll(/\{#loop-([a-g])\}/g)].map((m) => m[1].toUpperCase())
)

const phaseSteps = new Map() // "0" -> Set("A.1","B.2a",…)
for (let n = 0; n <= 9; n++) {
  const t = read(`docs/fazlar/FAZ-${n}.md`)
  if (t === null) continue
  const s = new Set()
  for (const m of t.matchAll(/^##+ +(\d+)\.([A-Za-z0-9.]+?) +—/gm)) if (m[1] === String(n)) s.add(m[2])
  phaseSteps.set(String(n), s)
}

// ── taranacak dosyalar ───────────────────────────────────────────────────────
let files = []
try {
  // execFileSync: kabuk yok, pathspec glob'larını git'in kendisi çözer
  files = execFileSync('git', ['ls-files', '*.md', '*.ts', '*.mjs', '*.sh', 'justfile'],
    { cwd: REPO, encoding: 'utf8' }).split('\n').filter(Boolean)
} catch { files = [] }
// Arşiv ve kayıt dosyaları: ARŞİVLENMİŞ bir belgeden alıntı yapan bir kayıt, canlı
// çapalara karşı doğrulanamaz. denetim-tasfiye planın § numaralarını alıntılıyor;
// plan arşivde ve numaraları ANAYASA'ya eşlenmiyor.
const SKIP = /^docs\/(research|PLAN-ARSIV|denetim-tasfiye)/
files = files.filter((f) => !SKIP.test(f))

// ── kontrol ──────────────────────────────────────────────────────────────────
const errors = []
const warns = new Set()

for (const f of files) {
  const text = readFileSync(p(f), 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    const at = (msg) => errors.push(`${f}:${i + 1}  ${msg}`)

    // §N / §N.M — ANAYASA bölümü. Tanım satırlarını (başlıklar) atla.
    if (!/^#+\s/.test(line)) {
      for (const m of line.matchAll(/§(\d+(?:\.\d+)?)/g)) {
        if (anchors.size === 0) { warns.add('docs/ANAYASA.md yok veya çapasız — § atıfları doğrulanmadı'); break }
        if (!anchors.has(m[1])) at(`§${m[1]} — ANAYASA'da böyle bir bölüm yok`)
      }
    }

    // LOOP§<harf>. "LOOP§X" literal yer tutucudur (şablon anlatımı) — atlanır.
    for (const m of line.matchAll(/LOOP§([A-Z])/g)) {
      if (m[1] === 'X') continue
      if (loopSections.size === 0) { warns.add('docs/LOOP.md yok — LOOP§ atıfları doğrulanmadı'); break }
      if (!loopSections.has(m[1])) at(`LOOP§${m[1]} — LOOP.md'de böyle bir bölüm yok`)
    }

    // R-nn
    for (const m of line.matchAll(/\bR-(\d+)\b/g)) {
      if (rules === null) { warns.add('KURALLAR.md yok — R-nn atıfları doğrulanmadı'); break }
      if (!rules.has(`R-${m[1]}`)) at(`R-${m[1]} — KURALLAR.md'de yok`)
    }

    // D-nn / V-nn
    for (const m of line.matchAll(/\bD-(\d+)\b/g)) {
      if (decisions === null) { warns.add('KARARLAR.md yok — D-nn atıfları doğrulanmadı'); break }
      const id = `D-${m[1]}`
      if (!decisions.has(id)) at(`${id} — KARARLAR.md'de yok`)
      // KARARLAR.md'nin kendi içinde reddedilmeye atıf serbest (yerine geçeni gösterir)
      else if (rejected.has(id) && f !== 'KARARLAR.md') at(`${id} — bu karar REDDEDİLDİ, ona dayanılamaz`)
    }
    for (const m of line.matchAll(/\bV-(\d+)\b/g)) {
      if (debts === null) { warns.add('KARARLAR.md yok — V-nn atıfları doğrulanmadı'); break }
      if (!debts.has(`V-${m[1]}`)) at(`V-${m[1]} — KARARLAR.md'de yok`)
    }

    // FAZ-N.x — dosya adı (FAZ-0.md), yer tutucu (FAZ-0.x) ve aralık (FAZ-0..9) atlanır.
    // Adım alfanümerikle BAŞLAMAK zorunda: "FAZ-0..9" ikinci noktada eşleşmez.
    for (const m of line.matchAll(/\bFAZ-(\d+)\.([A-Za-z0-9][A-Za-z0-9.]*)/g)) {
      const [, n, step] = m
      const clean = step.replace(/[.,;:)]+$/, '')
      if (clean === 'x' || clean === 'md') continue
      const set = phaseSteps.get(n)
      if (!set) { warns.add(`docs/fazlar/FAZ-${n}.md yok — FAZ-${n} atıfları doğrulanmadı`); continue }
      if (!set.has(clean)) at(`FAZ-${n}.${clean} — FAZ-${n}.md'de böyle bir adım yok`)
    }
  })
}

for (const w of warns) console.log(`  ⚠ ${w}`)
if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} kırık atıf`)
  process.exit(1)
}
console.log(`  ${files.length} dosya tarandı · ${anchors.size} § çapası · kırık atıf yok`)
