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

const hedef = join(REPO, 'docs/referans/saglayicilar.md')
const yeni = `${satirlar.join('\n')}`.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
const eski = existsSync(hedef) ? readFileSync(hedef, 'utf8') : null
writeFileSync(hedef, yeni)

console.log(
  `  docs/referans/saglayicilar.md ${eski === yeni ? 'güncel' : 'YENİDEN ÜRETİLDİ'} · ` +
    `${descriptors.length} tanımlayıcı`
)
