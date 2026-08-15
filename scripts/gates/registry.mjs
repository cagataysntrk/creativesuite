#!/usr/bin/env node
// GROUP: fast
// Kısıtlı JSON Schema profili (§3.3 · FAZ-1.3).
//
// Tek şema DÖRT hedefe derlenir: rjsf formu · TS tipi · katı LLM şeması · SQLite DDL.
// Profil dışı bir anahtar bu dördünden en az birini SESSİZCE bozar — çıktı üretilir,
// kimse fark etmez. Yasak listesi ve gerekçeleri `registry/PROFILE.md`'de.
//
// KENDİ KENDİNİ TEST EDER: henüz hiç varlık tipi yokken bu kapı denetleyecek dosya
// bulamaz ve yeşil raporlardı — yani doğduğu gün işe yaramadığı hâlde çalışıyor
// görünürdü. Aşağıdaki iki fixture, denetleyicinin gerçekten çalıştığını her koşuda
// kanıtlar; kanıtlayamazsa kapı kırmızıdır (R-71).

import { readFileSync, globSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

/** `registry/PROFILE.md` ile birebir aynı liste. Ayrışırsa aşağıdaki kontrol yakalar. */
const YASAK = [
  'oneOf',
  'not',
  'if',
  'then',
  'else',
  'patternProperties',
  'unevaluatedProperties',
  '$dynamicRef',
  '$dynamicAnchor',
  'dependentSchemas',
  'propertyNames',
  'contains',
  'minContains',
  'maxContains',
]

/** YAML anahtarı olarak geçen yasak sözcükleri bulur. Yorum satırları atlanır. */
const ihlalleriBul = (text) => {
  const found = []
  text.split('\n').forEach((line, i) => {
    if (/^\s*#/.test(line)) return
    const m = line.match(/^\s*(\$?[A-Za-z][A-Za-z0-9$_]*)\s*:/)
    if (m && YASAK.includes(m[1])) found.push({ line: i + 1, key: m[1] })
  })
  return found
}

const errors = []

// ── 1. denetleyicinin kendisi çalışıyor mu (öz-test) ─────────────────────────
const TEMIZ_FIXTURE = `
type: object
additionalProperties: false
properties:
  kind:
    type: string
    enum: [saas, bespoke]
  # burada oneOf: kelimesi yorumda geçiyor, ihlal değil
required: [kind]
`
const KIRLI_FIXTURE = `
type: object
oneOf:
  - properties: { kind: { const: saas } }
`
if (ihlalleriBul(TEMIZ_FIXTURE).length !== 0) {
  errors.push('öz-test: temiz fixture yanlış pozitif verdi — denetleyici fazla agresif')
}
{
  const bad = ihlalleriBul(KIRLI_FIXTURE)
  if (bad.length !== 1 || bad[0]?.key !== 'oneOf') {
    errors.push('öz-test: kirli fixture yakalanmadı — denetleyici çalışmıyor')
  }
}

// ── 2. PROFILE.md yasak listesiyle senkron mu ────────────────────────────────
const PROFILE = 'registry/PROFILE.md'
if (!existsSync(p(PROFILE))) {
  errors.push(`${PROFILE} yok — profil tanımı olmadan kapı anlamsız`)
} else {
  const doc = readFileSync(p(PROFILE), 'utf8')
  const eksik = YASAK.filter((k) => !doc.includes(`\`${k}\``))
  if (eksik.length) {
    errors.push(`${PROFILE} kapıyla ayrışmış — belgede geçmeyen yasak anahtar: ${eksik.join(', ')}`)
  }
}

// ── 3. gerçek varlık tipleri ────────────────────────────────────────────────
const tipler = globSync('registry/entity-types/*.type.yaml', { cwd: REPO })
for (const rel of tipler) {
  for (const { line, key } of ihlalleriBul(readFileSync(p(rel), 'utf8'))) {
    errors.push(`${rel}:${line}  profil dışı anahtar '${key}' — bkz. ${PROFILE}`)
  }
}

if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} profil ihlali`)
  process.exit(1)
}

console.log(
  `  profil ${YASAK.length} anahtar yasaklıyor · öz-test geçti · ${tipler.length} varlık tipi denetlendi`
)
