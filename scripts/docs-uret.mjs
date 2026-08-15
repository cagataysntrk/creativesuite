#!/usr/bin/env node
// `just docs` — üretilmiş referans belgeleri (§8.7 · R-65).
//
// **Elle yazılmaz.** Sağlayıcı kataloğu `registry/providers/*.provider.yaml`ten doğar;
// elle yazılsaydı ilk sağlayıcı eklemesinde bayatlar ve kimse fark etmezdi. `docs-drift`
// kapısı `just docs` sonrası `git diff --exit-code` ile sapmayı yakalar.

import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { loadDescriptors } = await import(join(REPO, 'packages/providers/dist/index.js'))
const { adapterById } = await import(join(REPO, 'packages/providers/dist/index.js'))

const KOK = join(REPO, 'registry/providers')
const { descriptors, failures } = loadDescriptors(KOK)

const satirlar = []
satirlar.push('# Sağlayıcı kataloğu')
satirlar.push('')
satirlar.push('> ⚠ **ÜRETİLMİŞ DOSYA — elle düzenleme** (R-65). Üreteci: `just docs`.')
satirlar.push('> Kaynak: `registry/providers/*.provider.yaml`. Elle yapılan düzenleme')
satirlar.push('> `just docs` çalıştığında kaybolur; `docs-drift` kapısı sapmayı yakalar.')
satirlar.push('')
satirlar.push(`Toplam **${descriptors.length}** tanımlayıcı.`)
satirlar.push('')
satirlar.push('| id | başlık | adaptör | durum | yetenek | şerit | fiyat anlık görüntüsü |')
satirlar.push('|---|---|---|---|---|---|---|')

for (const d of descriptors.slice().sort((a, b) => a.id.localeCompare(b.id))) {
  const yetenekler = d.capabilities.map((c) => `\`${c.name}\``).join('<br>')
  const seritler = [...new Set(d.capabilities.flatMap((c) => c.lanes))].join(', ')
  const durum = d.enabled ? '✅ aktif' : '⏸ kapalı'
  const adaptorVar = adapterById(d.adapter) === null ? ' ⚠ gövde yok' : ''
  const fiyat =
    d.pricingSnapshot === null
      ? '—'
      : `\`${d.pricingSnapshot}\`${d.pricingVerified ? '' : ' ⚠ doğrulanmamış'}`
  satirlar.push(
    `| \`${d.id}\` | ${d.title} | \`${d.adapter}\`${adaptorVar} | ${durum} | ${yetenekler} | ${seritler} | ${fiyat} |`
  )
}

satirlar.push('')
satirlar.push('## Desteklenen kısıtlar')
satirlar.push('')
for (const d of descriptors.slice().sort((a, b) => a.id.localeCompare(b.id))) {
  satirlar.push(`### \`${d.id}\``)
  satirlar.push('')
  for (const c of d.capabilities) {
    satirlar.push(`- **${c.name}** — şerit: ${c.lanes.join(', ')}`)
    for (const [k, v] of Object.entries(c.supports)) {
      satirlar.push(`  - \`${k}\`: ${v.map((x) => `\`${String(x)}\``).join(' · ')}`)
    }
  }
  satirlar.push('')
}

if (failures.length > 0) {
  satirlar.push('## ⚠ Çözülemeyen tanımlayıcılar')
  satirlar.push('')
  for (const f of failures) {
    satirlar.push(`- \`${f.file}\`: ${f.errors.map((e) => e.kind).join(', ')}`)
  }
  satirlar.push('')
}

const yaz = (yol, govde) => {
  const tam = join(REPO, yol)
  const yeni = govde.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
  const eski = existsSync(tam) ? readFileSync(tam, 'utf8') : null
  writeFileSync(tam, yeni)
  return eski === yeni ? 'güncel' : 'YENİDEN ÜRETİLDİ'
}

const s1 = yaz('docs/referans/saglayicilar.md', satirlar.join('\n'))

// ── §10 pipeline kataloğu ───────────────────────────────────────────────────
// ANAYASA §10 "üretilmiş kısım: docs/referans/pipelinelar.md" diyor. Elle yazılsaydı
// ilk pipeline eklemesinde bayatlar ve kimse fark etmezdi — §8.7 ile aynı gerekçe.
const { loadPipeline, listPipelines } = await import(join(REPO, 'packages/registry/dist/index.js'))
const PIPE_KOK = join(REPO, 'registry/pipelines')

const pl = []
pl.push('# Pipeline kataloğu')
pl.push('')
pl.push('> ⚠ **ÜRETİLMİŞ DOSYA — elle düzenleme** (R-65). Üreteci: `just docs`.')
pl.push('> Kaynak: `registry/pipelines/*.pipeline.yaml`. `docs-drift` kapısı sapmayı yakalar.')
pl.push('')

const hatlar = listPipelines(PIPE_KOK).sort()
pl.push(`Toplam **${hatlar.length}** hat.`)
pl.push('')

const cozulemeyen = []
for (const ad of hatlar) {
  const r = loadPipeline(PIPE_KOK, ad)
  if (!r.ok) {
    cozulemeyen.push(`- \`${ad}\`: ${r.errors.map((e) => e.kind).join(', ')}`)
    continue
  }
  const hat = r.value
  const kapilar = hat.steps.filter((x) => x.gate !== null)
  const ucretli = hat.steps.filter((x) => x.capability !== null)
  pl.push(`## \`${hat.id}\` — ${hat.title}`)
  pl.push('')
  pl.push(
    `${hat.steps.length} adım · ${ucretli.length} yetenek isteyen · ${kapilar.length} insan kapısı`
  )
  pl.push('')
  pl.push('| adım | fiil | yetenek | bağımlı | kapı | isteğe bağlı |')
  pl.push('|---|---|---|---|---|---|')
  for (const st of hat.steps) {
    pl.push(
      `| \`${st.id}\` | \`${st.verb}\` | ${st.capability === null ? '—' : `\`${st.capability}\``} ` +
        `| ${st.needs.join(', ') || '—'} | ${st.gate ?? '—'} | ${st.constraints['optional'] === true ? '✓' : '—'} |`
    )
  }
  pl.push('')
}

if (cozulemeyen.length > 0) {
  pl.push('## ⚠ Çözülemeyen hatlar')
  pl.push('')
  pl.push(...cozulemeyen)
  pl.push('')
}

const s2 = yaz('docs/referans/pipelinelar.md', pl.join('\n'))

console.log(
  `  saglayicilar.md ${s1} (${descriptors.length} tanımlayıcı) · ` +
    `pipelinelar.md ${s2} (${hatlar.length} hat)`
)
