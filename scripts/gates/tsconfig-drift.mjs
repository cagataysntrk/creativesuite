#!/usr/bin/env node
// GROUP: fast
// tsconfig sapması — katılık tek yerden gelir (FAZ-0.C.1).
//
// Neden bloklayıcı: `strict` veya `noUncheckedIndexedAccess`'i tek bir pakette kapatmak
// tek satırlık, görünmez ve geri dönülmez bir karardır. O paket büyüdükçe bayrağı geri
// açmak yüzlerce hatayı aynı anda açar, kimse açmaz ve taban yalan söylemeye başlar.
// Taban katıysa HERKES katıdır; istisna yoktur.
//
// Ayrıca TypeScript ana sürümünü de kilitler: typescript-eslint'in peer aralığı TS 7'yi
// kabul edene kadar geçilmez. Geçilirse tip-farkında kuralların hepsi SESSİZCE kapanır
// ve CI yeşil kalır — R-71'in kitabi örneği.

import { readFileSync, existsSync } from 'node:fs'
import { globSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

/** tsconfig JSONC'dir — TypeScript'in kendi ayrıştırıcısı kullanılır, elle regex değil. */
const readTsconfig = (abs) => {
  const { config, error } = ts.parseConfigFileTextToJson(abs, readFileSync(abs, 'utf8'))
  if (error) throw new Error(`${relative(REPO, abs)}: ayrıştırılamadı`)
  return config ?? {}
}

const errors = []

// ── 1. taban var mı ve katı mı ────────────────────────────────────────────────
const BASE = p('tsconfig.base.json')
if (!existsSync(BASE)) {
  console.log('✗ tsconfig.base.json yok — katılık tabanı olmadan kapı anlamsız')
  process.exit(1)
}
const base = readTsconfig(BASE)
const baseOpts = base.compilerOptions ?? {}

// FAZ-0.C.1'in açıkça saydığı bayraklar. Taban bunları kaybederse kapı kırmızı.
const ZORUNLU = [
  'strict',
  'noUncheckedIndexedAccess',
  'exactOptionalPropertyTypes',
  'noImplicitOverride',
  'noPropertyAccessFromIndexSignature',
  'isolatedModules',
  'verbatimModuleSyntax',
  'erasableSyntaxOnly',
]
for (const k of ZORUNLU) {
  if (baseOpts[k] !== true) errors.push(`tsconfig.base.json: '${k}' true değil (FAZ-0.C.1)`)
}

// ── 2. hiçbir paket taban bayrağını yeniden tanımlayamaz ──────────────────────
// Tek meşru istisna `lib`: tarayıcı paketleri DOM ister, sunucu paketleri istemez.
// Bu bir katılık bayrağı değil, hedef ortam beyanıdır.
const EZILEBILIR = new Set(['lib', 'rootDir', 'outDir', 'jsx', 'jsxImportSource', 'types'])

const configs = globSync(['packages/*/tsconfig.json', 'apps/*/tsconfig.json'], { cwd: REPO })
if (configs.length === 0) {
  console.log("✗ hiç paket tsconfig'i bulunamadı — kapı boş geçiyor")
  process.exit(1)
}

for (const rel of configs.sort()) {
  const cfg = readTsconfig(p(rel))
  const opts = cfg.compilerOptions ?? {}

  if (cfg.extends !== '../../tsconfig.base.json') {
    errors.push(`${rel}: 'extends' tabanı göstermiyor (${cfg.extends ?? 'yok'})`)
  }

  for (const k of Object.keys(opts)) {
    if (EZILEBILIR.has(k)) continue
    if (k in baseOpts) {
      errors.push(
        `${rel}: '${k}' tabanda tanımlı, pakette yeniden tanımlanamaz (değer: ${JSON.stringify(opts[k])})`
      )
    }
  }

  if (opts.composite === false)
    errors.push(`${rel}: 'composite: false' — project reference zinciri kırılır`)
}

// ── 3. TypeScript ana sürüm kilidi ───────────────────────────────────────────
const pkg = JSON.parse(readFileSync(p('package.json'), 'utf8'))
const tsSpec = pkg.devDependencies?.typescript ?? ''
const major = Number.parseInt(tsSpec.replace(/^[^\d]*/, ''), 10)
if (!Number.isFinite(major)) {
  errors.push(`package.json: typescript sürümü okunamadı ('${tsSpec}')`)
} else if (major >= 7) {
  errors.push(
    `package.json: typescript ${tsSpec} — TS 7'ye geçilmez (FAZ-0.C.1). ` +
      'typescript-eslint peer aralığı kabul edene kadar tip-farkında kurallar sessizce kapanır.'
  )
}

if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} sapma`)
  process.exit(1)
}
console.log(
  `  taban ${ZORUNLU.length} katılık bayrağı · ${configs.length} paket sapmasız · typescript ${tsSpec}`
)
