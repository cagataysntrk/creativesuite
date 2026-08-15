#!/usr/bin/env node
// `era` kapısı: dönem manifesti, git etiketi ve `current` işaretçisi tutarlı mı (§4.3).

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { parseYaml, validateEra } = await import(join(REPO, 'packages/kernel/dist/index.js'))
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
    const manifestYolu = join(eraKok, slug, 'era.yaml')
    if (!existsSync(manifestYolu)) {
      hatalar.push(`${marka}/${slug}: era.yaml yok`)
    } else {
      const y = parseYaml(readFileSync(manifestYolu, 'utf8'))
      if (!y.ok) {
        hatalar.push(`${marka}/${slug}: era.yaml AYRIŞMIYOR — ${y.message.split('\n')[0]}`)
      } else if (y.value === null || typeof y.value !== 'object') {
        hatalar.push(`${marka}/${slug}: era.yaml boş ya da eşleme değil`)
      } else {
        const d = y.value
        const r = validateEra({
          slug: typeof d.slug === 'string' ? d.slug : '',
          brandId: typeof d.brand_id === 'string' ? d.brand_id : '',
          status: d.status,
          commitSha: typeof d.commit_sha === 'string' ? d.commit_sha : '',
          mintedAt: typeof d.minted_at === 'string' ? d.minted_at : '',
          title: typeof d.title === 'string' ? d.title : '',
          rationale: typeof d.rationale === 'string' ? d.rationale : '',
          supersedes: typeof d.supersedes === 'string' ? d.supersedes : null,
        })
        if (!r.ok) {
          for (const e of r.errors)
            hatalar.push(`${marka}/${slug}: ${e.kind} (${JSON.stringify(e)})`)
        }
        // Dizin adı ile manifestteki slug ayrışırsa git etiketi hangisine ait belirsizleşir.
        if (d.slug !== slug)
          hatalar.push(`${marka}/${slug}: manifest slug'ı '${d.slug}' — dizinle uyuşmuyor`)
      }
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

// ── corpus `era_id`'leri VAR OLAN bir döneme çözülmeli (D-167) ──────────────
//
// Dönem modeli üç parçadır (§4.3): `era.yaml` · `brand/current` · `git tag`. Kapı bu
// üçünün birbirini tutmasını denetliyordu ama DÖRDÜNCÜ bir yer daha var: kayıtların
// `era_id` alanı. Orada yazan dize üçüyle eşleşmezse retrieval yüklemi hiçbir şey
// döndürmez ve **sebebi hiçbir yerde yazmaz** — kayıtlar diskte durur, indekste durur,
// yalnız görünmezler.
//
// 2026-08-15'te tam bu oldu: altı kayıt `era_imalat_2026` taşıyordu, dönemin adı
// `imalat-2026`. Bütün kayıtlar `draft` olduğu için maskeliydi — `2.9` onaylandığı gün
// hepsi `active` olacak ve HÂLÂ görünmeyecekti; kullanıcı onaylayıp hiçbir şeyin
// değişmediğini görecekti.
const corpusKok = join(REPO, 'corpus')
if (existsSync(corpusKok)) {
  const gecerli = new Set(['*'])
  for (const m of markalar) {
    const d = join(REPO, `brand/${m}/eras`)
    if (existsSync(d)) for (const e of readdirSync(d)) gecerli.add(e)
  }

  const yur = (dizin) => {
    for (const ad of readdirSync(dizin)) {
      const tam = join(dizin, ad)
      if (statSync(tam).isDirectory()) yur(tam)
      else if (ad.endsWith('.md')) {
        const metin = readFileSync(tam, 'utf8')
        const m = /^era_id:\s*(\S+)\s*$/m.exec(metin)
        if (m === null) {
          hatalar.push(`${relative(REPO, tam)}: era_id alanı YOK (R-11)`)
          continue
        }
        const deger = m[1].replace(/^['"]|['"]$/g, '')
        if (!gecerli.has(deger)) {
          hatalar.push(
            `${relative(REPO, tam)}: era_id '${deger}' hiçbir döneme çözülmüyor — ` +
              `geçerli: ${[...gecerli].sort().join(', ')}. Retrieval bu kaydı ASLA görmez.`
          )
        }
      }
    }
  }
  yur(corpusKok)
}

if (hatalar.length > 0) {
  console.log(hatalar.map((h) => `  ✗ ${h}`).join('\n'))
  console.log(`\n${hatalar.length} dönem tutarsızlığı`)
  process.exit(1)
}
console.log(`  ${markalar.length} marka · ${donemSayisi} dönem · etiket ve current tutarlı`)
