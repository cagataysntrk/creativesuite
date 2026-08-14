#!/usr/bin/env node
// Araştırma journal'larından docs/research/ altına damıtılmış markdown çıkarır.
//
// Neden ham transkript commit'lenmiyor: 26 MB ve tek dosyalar 1 MB'ı aşıyor.
// repo-hygiene kapısı 512KB üstünü zaten blokluyor — varlık byte'ları git'e girmez.
// Ham kayıt ~/.claude/projects/.../subagents/workflows/ altında kalır; buraya
// yalnızca agent'ların OKUYACAĞI damıtılmış hâli iner.
//
// Yeniden çalıştırılabilir: docs/research/ silinip bu betik tekrar koşulabilir.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath şart: .pathname Türkçe karakterleri URL-kodlu bırakır
// ("İndirilenler" → "%C4%B0ndirilenler") ve dosyalar yanlış dizine yazılır.
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.env.RESEARCH_SRC ??
  join(process.env.HOME, '.claude/projects/-home-cagataysntrk--ndirilenler-projeler-creativesuite')
const OUT = join(REPO, 'docs/research')
const MAX_BYTES = 480 * 1024 // repo-hygiene tavanının (512KB) altında kal

const WAVE_NAMES = {
  wf_ccf062eb: '1-manzara',
  wf_5f800306: '2-b2b-ve-seritler',
  wf_5816490f: '3-dinamik-cekirdek',
  wf_237836db: '4-standartlar',
  wf_d863dc2b: '5-kural-kitabi',
  wf_d0fcaf4e: '6-denetim',
}

const slug = (s) =>
  String(s).toLowerCase()
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c]))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

function findJournals(root) {
  const out = []
  const walk = (d, depth = 0) => {
    if (depth > 6 || !existsSync(d)) return
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p, depth + 1)
      else if (e.name === 'journal.jsonl') out.push(p)
    }
  }
  walk(root)
  return out
}

const md = []
const push = (s) => md.push(s)

function renderList(title, arr) {
  if (!Array.isArray(arr) || arr.length === 0) return ''
  return `\n### ${title}\n\n` + arr.map((x) => `- ${typeof x === 'string' ? x : JSON.stringify(x)}`).join('\n') + '\n'
}

function renderItems(items) {
  if (!Array.isArray(items) || items.length === 0) return ''
  let s = `\n### Kalemler (${items.length})\n\n| Ad | Tür | Ne | Erişim | Maliyet | Karar |\n|---|---|---|---|---|---|\n`
  for (const i of items) {
    const c = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200)
    s += `| ${c(i.name)} | ${c(i.kind)} | ${c(i.what)} | ${c(i.access)} | ${c(i.cost)} | ${c(i.verdict)} |\n`
  }
  s += '\n<details><summary>Notlar</summary>\n\n'
  for (const i of items) if (i.notes) s += `**${i.name}** — ${i.notes}\n\n`
  s += '</details>\n'
  return s
}

function renderRules(rules) {
  if (!Array.isArray(rules) || rules.length === 0) return ''
  let s = `\n### Kurallar (${rules.length})\n\n`
  for (const r of rules) {
    s += `#### \`${r.id}\` · ${r.severity}${r.area ? ` · ${r.area}` : ''}\n\n`
    s += `${r.rule}\n\n- **Neden:** ${r.why}\n- **Zorlama:** ${r.enforcement}\n\n`
  }
  return s
}

function renderFindings(f) {
  if (!Array.isArray(f) || f.length === 0) return ''
  let s = `\n### Bulgular (${f.length})\n\n`
  for (const x of f) {
    s += `#### [${x.severity}] ${x.where}\n\n**Sorun:** ${x.problem}\n\n**Ne zaman patlar:** ${x.whenItBites}\n\n**Düzeltme:** ${x.fix}\n\n---\n\n`
  }
  return s
}

function writeChunked(base, title, body) {
  const header = `# ${title}\n\n> Kaynak: araştırma journal'ı, damıtılmış. Ham kayıt\n> \`~/.claude/projects/.../subagents/workflows/\` altında.\n\n`
  const full = header + body
  if (Buffer.byteLength(full) <= MAX_BYTES) {
    writeFileSync(join(OUT, `${base}.md`), full)
    return 1
  }
  // Böl: başlıklardan
  const parts = full.split(/\n(?=#### )/)
  let buf = header, n = 0, files = 0
  const flush = () => { if (buf.trim()) { writeFileSync(join(OUT, `${base}-${++n}.md`), buf); files++ } buf = header }
  for (const p of parts) {
    if (Buffer.byteLength(buf + p) > MAX_BYTES) flush()
    buf += '\n' + p
  }
  flush()
  return files
}

mkdirSync(OUT, { recursive: true })
const journals = findJournals(SRC)
let total = 0, files = 0
const index = []

for (const j of journals) {
  const wf = (j.match(/wf_[a-z0-9]+/) ?? [])[0] ?? 'bilinmeyen'
  const wave = WAVE_NAMES[wf?.slice(0, 11)] ?? slug(wf)
  for (const line of readFileSync(j, 'utf8').split('\n')) {
    if (!line.trim()) continue
    let o; try { o = JSON.parse(line) } catch { continue }
    if (o.type !== 'result' || !o.result || typeof o.result !== 'object') continue
    const r = o.result
    const title = r.domain ?? (r.verdict ? 'Denetim' : r.rules ? 'Master kural listesi'
      : r.tokens ? 'Tasarım sistemi' : r.contracts ? 'Sözleşmeler ve kapılar' : 'Sentez')
    const base = `${wave}--${slug(title)}`
    md.length = 0
    if (r.summary) push(`## Özet\n\n${r.summary}\n`)
    if (r.verdict) push(`## Karar\n\n${r.verdict}\n`)
    push(renderRules(r.rules))
    push(renderRules(r.uiRules))
    push(renderFindings(r.findings))
    push(renderItems(r.items))
    for (const [k, label] of [
      ['recommendations', 'Öneriler'], ['risks', 'Riskler'], ['unverified', 'Doğrulanmamış'],
      ['antipatterns', 'Anti-desenler'], ['conflictsResolved', 'Çözülen çelişkiler'],
      ['droppedAsNoise', 'Elenenler'], ['whatIsGood', 'İyi olanlar'], ['openQuestions', 'Açık sorular'],
      ['buildVsBuy', 'Yap/Satın al'], ['phasing', 'Fazlama'], ['killedIdeas', 'Reddedilenler'],
      ['uiSurfaces', 'Ekranlar'],
    ]) push(renderList(label, r[k]))
    for (const [k, label] of [
      ['coreModel', 'Çekirdek model'], ['memoryDesign', 'Hafıza tasarımı'],
      ['regenerationDesign', 'Yeniden üretim'], ['extensibilityDesign', 'Genişletilebilirlik'],
      ['strategySchema', 'Strateji şeması'], ['repoTree', 'Repo ağacı'],
      ['tokens', 'Token mimarisi'], ['typography', 'Tipografi'], ['layout', 'Yerleşim'],
      ['interaction', 'Etkileşim'], ['states', 'Durumlar'], ['motion', 'Hareket'],
      ['contracts', 'TypeScript sözleşmeleri'], ['ciGates', 'CI kapıları'],
      ['docTree', 'Belge ağacı'], ['justfile', 'justfile'],
    ]) if (typeof r[k] === 'string' && r[k].trim()) push(`\n### ${label}\n\n${r[k]}\n`)

    const body = md.filter(Boolean).join('\n')
    if (!body.trim()) continue
    const n = writeChunked(base, title, body)
    files += n; total++
    index.push(`- \`${base}\` — ${title} (${n} dosya)`)
  }
}

writeFileSync(join(OUT, 'README.md'),
  `# Araştırma eki\n\n${total} agent çıktısı, ${files} dosya. Damıtılmış — ham transkript git'e girmez.\n\n` +
  `**Nasıl okunur:** baştan sona okuma. \`ctx_search\` ile sorgula veya ilgili dosyayı aç.\n\n` +
  `## Dizin\n\n${index.sort().join('\n')}\n`)

console.log(`✓ ${total} sonuç → ${files} dosya, docs/research/`)
