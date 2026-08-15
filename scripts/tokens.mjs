#!/usr/bin/env node
// Token üreteci — dört çıktı, tek kaynak (§4.1 · R-65).
//
// `--check` ile çalıştırıldığında HİÇBİR ŞEY YAZMAZ, yalnız üretileni diskteki ile
// karşılaştırır. Kapı bu modu kullanır: üreteci koşturup `git diff` bakmak, kapının
// çalışma ağacını kirletmesi demekti ve kirli ağaçta koşan bir kapı hiçbir şey kanıtlamaz.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { compileTokens, inheritTokens, toCss, toTailwind, toBrandFacts } = await import(
  join(REPO, 'packages/registry/dist/index.js')
)

const kontrol = process.argv.includes('--check')

// Marka kalıtım ağacı. Alt marka ana markadan DEVRALIR (§4.2); ezmediği her token
// mirastır. Ağacı burada tutmak geçici: FAZ-4'te `brand/<id>/brand.yaml`a taşınacak
// ve o gün bu sabit silinecek. Bugün iki marka var ve bir satır, bir dosyadan ucuz.
const MARKALAR = [
  { id: 'brd_upcytech', parent: null },
  { id: 'brd_dima', parent: 'brd_upcytech' },
]

// Birden fazla dosya TEK ağaçta birleşir: `console.tokens.json` ve gelecekteki
// `studio.tokens.json` aynı kademe kurallarına tabidir. Ayrı derlemek, bir dosyanın
// diğerinin rampasına referans vermesini sessizce imkânsız kılardı.
const agacOku = (marka) => {
  const dizin = join(REPO, `brand/${marka}/tokens`)
  if (!existsSync(dizin)) return null
  const dosyalar = readdirSync(dizin)
    .filter((f) => f.endsWith('.tokens.json'))
    .sort()
  if (dosyalar.length === 0) return null
  const agac = {}
  for (const f of dosyalar) {
    const d = JSON.parse(readFileSync(join(dizin, f), 'utf8'))
    for (const [k, v] of Object.entries(d)) {
      if (k.startsWith('$')) continue
      agac[k] = { ...(agac[k] ?? {}), ...v }
    }
  }
  return { agac, dosyaSayisi: dosyalar.length }
}

let toplamToken = 0
let toplamFarkli = 0
const raporlar = []

for (const marka of MARKALAR) {
  const kendi = agacOku(marka.id)
  if (kendi === null) {
    console.log(`✗ ${marka.id}: hiç token dosyası yok — kapı boş geçiyor`)
    process.exit(1)
  }
  let agac = kendi.agac
  let devralinan = 0
  if (marka.parent !== null) {
    const ana = agacOku(marka.parent)
    if (ana === null) {
      console.log(`✗ ${marka.id}: ana marka ${marka.parent} token taşımıyor`)
      process.exit(1)
    }
    const k = inheritTokens(ana.agac, kendi.agac)
    agac = k.merged
    devralinan = k.overridden.length
  }
  const dosyaSayisi = kendi.dosyaSayisi

  const sonuc = compileTokens(agac)
  if (!sonuc.ok) {
    console.log(`✗ ${marka.id}: token derlenemedi:`)
    for (const e of sonuc.errors) {
      console.log(`    ${e.kind}  ${e.path}${e.ref === undefined ? '' : ` → ${e.ref}`}`)
      if (e.why !== undefined) console.log(`      ${e.why}`)
    }
    process.exit(1)
  }

  const MARKA = marka.id
  const CIKTI_DIR = join(REPO, `brand/${MARKA}/derived-tokens`)
  const eraSlug = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()
  // `frame.md` — marka token'larının KAMERA BAĞLAMINA çevrilmiş hâli (§7.4).
  // Hareket için ikinci bir palet tanımlamak iki marka gerçeği demektir; bu dosya da
  // üretilir ve elle düzenlenirse kapı yakalar (R-65). FAZ-5.2 onu tüketecek.
  const roller = sonuc.value.filter((t) => t.tier === 'role')
  const frame =
    '<!-- ÜRETİLMİŞ — elle düzenleme (R-65). Kaynak: brand/<id>/tokens/ -->\n' +
    `# frame.md — ${MARKA} · ${eraSlug}\n\n` +
    'Hareket kompozisyonları bu rolleri kullanır. **İkinci bir palet YOK**: hareket için\n' +
    'ayrı renk tanımlamak, iki marka gerçeği demektir (§7.4).\n\n' +
    '| Rol | CSS değişkeni |\n|---|---|\n' +
    roller.map((t) => `| \`${t.path}\` | \`var(--${t.path.replace(/\./g, '-')})\` |`).join('\n') +
    '\n'

  const ciktilar = {
    'tokens.css': toCss(sonuc.value),
    'tailwind-theme.ts': toTailwind(sonuc.value),
    'brand-facts.json': toBrandFacts(sonuc.value, { brandId: MARKA, eraSlug }),
    'frame.md': frame,
  }

  let farkli = 0
  mkdirSync(CIKTI_DIR, { recursive: true })
  for (const [ad, icerik] of Object.entries(ciktilar)) {
    const yol = join(CIKTI_DIR, ad)
    const mevcut = existsSync(yol) ? readFileSync(yol, 'utf8') : null
    if (mevcut === icerik) continue
    farkli++
    if (kontrol) console.log(`    ✗ ${MARKA}/${ad} güncel değil`)
    else writeFileSync(yol, icerik)
  }

  toplamToken += sonuc.value.length
  toplamFarkli += farkli
  raporlar.push(
    `${MARKA}: ${sonuc.value.length} token · ${dosyaSayisi} kaynak` +
      (marka.parent === null
        ? ' · kök marka'
        : ` · ${marka.parent}'ten devralıyor, ${devralinan} ezme`)
  )
}

for (const r of raporlar) console.log(`  ${r}`)

if (kontrol) {
  if (toplamFarkli > 0) {
    console.log(`\n${toplamFarkli} üretilmiş dosya güncel değil — 'just tokens' çalıştır (R-65)`)
    process.exit(1)
  }
  console.log(
    `  ${MARKALAR.length} marka · ${toplamToken} token · 3 kademe zorlanıyor · çıktılar güncel`
  )
} else {
  console.log(
    `  ${MARKALAR.length} marka · ${toplamToken} token · ${toplamFarkli} dosya güncellendi`
  )
}
