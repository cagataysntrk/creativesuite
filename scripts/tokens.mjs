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
const { compileTokens, toCss, toTailwind, toBrandFacts } = await import(
  join(REPO, 'packages/registry/dist/index.js')
)

const kontrol = process.argv.includes('--check')
const MARKA = 'brd_upcytech'
const TOKEN_DIR = join(REPO, `brand/${MARKA}/tokens`)
const CIKTI_DIR = join(REPO, `brand/${MARKA}/derived-tokens`)

if (!existsSync(TOKEN_DIR)) {
  console.log(`✗ token dizini yok: brand/${MARKA}/tokens`)
  process.exit(1)
}

// Birden fazla dosya TEK ağaçta birleşir: `console.tokens.json` ve gelecekteki
// `studio.tokens.json` aynı kademe kurallarına tabidir. Ayrı derlemek, bir dosyanın
// diğerinin rampasına referans vermesini sessizce imkânsız kılardı.
const agac = {}
const dosyalar = readdirSync(TOKEN_DIR)
  .filter((f) => f.endsWith('.tokens.json'))
  .sort()
if (dosyalar.length === 0) {
  console.log('✗ hiç token dosyası yok — kapı boş geçiyor')
  process.exit(1)
}
for (const f of dosyalar) {
  const d = JSON.parse(readFileSync(join(TOKEN_DIR, f), 'utf8'))
  for (const [k, v] of Object.entries(d)) {
    if (k.startsWith('$')) continue
    agac[k] = { ...(agac[k] ?? {}), ...v }
  }
}

const sonuc = compileTokens(agac)
if (!sonuc.ok) {
  console.log('✗ token derlenemedi:')
  for (const e of sonuc.errors) {
    console.log(`    ${e.kind}  ${e.path}${e.ref === undefined ? '' : ` → ${e.ref}`}`)
    if (e.why !== undefined) console.log(`      ${e.why}`)
  }
  process.exit(1)
}

const eraSlug = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()
// `motion/frame.md` — marka token'larının KAMERA BAĞLAMINA çevrilmiş hâli (§7.4).
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
  if (kontrol) console.log(`    ✗ ${ad} güncel değil`)
  else writeFileSync(yol, icerik)
}

if (kontrol) {
  if (farkli > 0) {
    console.log(`\n${farkli} üretilmiş dosya güncel değil — 'just tokens' çalıştır (R-65)`)
    process.exit(1)
  }
  console.log(
    `  ${sonuc.value.length} token · 3 kademe zorlanıyor · ${dosyalar.length} kaynak dosya · üretilmiş çıktılar güncel`
  )
} else {
  console.log(`  ${sonuc.value.length} token derlendi · ${farkli} dosya güncellendi`)
}
