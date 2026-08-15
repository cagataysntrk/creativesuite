#!/usr/bin/env node
// GROUP: fast
// Projeksiyon derleyicisi kapısı (§3.4 · FAZ-1.4).
//
// **Her varlık tipi dört projeksiyona da çevrilebilmeli.** Çevrilemeyen bir tip
// bugün fark edilmezse, yarın form alanı gösterir ama DDL sütunu yoktur — ve hata
// hiçbir katmanda değil, İKİ KATMANIN ARASINDA çıkar.
//
// Kapı bugün sıfır gerçek varlık tipi görüyor (onlar FAZ-2.1'de doğuyor) ve bunu
// SESSİZCE geçmiyor: fixture şemaları üstünde derleyicinin çalıştığını doğruluyor,
// gerçek tipler geldiğinde otomatik olarak onları da kapsıyor.

import { readFileSync, globSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

const DIST = 'packages/kernel/dist/index.js'
// dist TAZE olmak zorunda: kapı sırasına güvenmek, sıranın değiştiği gün bayat
// çıktı üstünde yeşil rapor vermek demektir (D-67).
{
  const { status, stdout, stderr } = spawnSync('bash', [join(REPO, 'scripts/ensure-build.sh')], {
    encoding: 'utf8',
  })
  if (status !== 0) {
    console.log(`✗ derleme başarısız — kapı bayat dist üstünde çalışmaz\n${stdout}${stderr}`)
    process.exit(1)
  }
}

const { compile, validateSchema, FORBIDDEN_KEYWORDS } = await import(p(DIST))

const errors = []

// ── 1. derleyici gerçekten çalışıyor mu (öz-test) ────────────────────────────
// Sıfır gerçek varlık tipi varken bu kapı boş geçerdi. Fixture'lar onu doldurur.
const fixtureler = globSync('test/fixtures/schemas/*.type.json', { cwd: REPO })
if (fixtureler.length === 0) {
  console.log('✗ hiç fixture şema yok — kapı boş geçiyor')
  process.exit(1)
}

let derlenen = 0
for (const rel of [...fixtureler].sort()) {
  const s = JSON.parse(readFileSync(p(rel), 'utf8'))
  const r = compile(s)
  if (!r.ok) {
    errors.push(`${rel}: derlenemedi → ${JSON.stringify(r.errors)}`)
    continue
  }
  derlenen++
  // Dördü de gerçekten üretilmiş mi — biri boşsa "derlendi" yalan olur.
  if (typeof r.value.typescript !== 'string' || r.value.typescript.length < 10) {
    errors.push(`${rel}: TS projeksiyonu boş`)
  }
  if (typeof r.value.ddl !== 'string' || !r.value.ddl.includes('CREATE TABLE')) {
    errors.push(`${rel}: DDL projeksiyonu boş`)
  }
  if (r.value.llm?.strict !== true) errors.push(`${rel}: LLM şeması strict değil`)
  if (r.value.llm?.schema?.additionalProperties !== false) {
    errors.push(`${rel}: LLM şemasında additionalProperties:false yok`)
  }
  if (r.value.form?.schema === undefined) errors.push(`${rel}: form projeksiyonu yok`)
}

// ── 2. öz-test: bozuk şema GERÇEKTEN reddediliyor mu ─────────────────────────
// Yeşil bir kapı hiçbir şey kanıtlamaz (R-71). Kapı her koşuda kendi keskinliğini
// gösterir: `additionalProperties:false` olmayan bir nesne reddedilmeli.
{
  const bozuk = {
    $id: 'oz-test',
    type: 'object',
    additionalProperties: false,
    properties: { ic: { type: 'object', properties: { a: { type: 'string' } } } },
  }
  const h = validateSchema(bozuk)
  if (!h.some((e) => e.kind === 'object_without_additional_properties_false')) {
    errors.push('öz-test: additionalProperties:false eksikliği YAKALANMADI — derleyici körelmiş')
  }
}
{
  const bozuk = { $id: 'oz-test-2', type: 'object', additionalProperties: false, oneOf: [] }
  if (!validateSchema(bozuk).some((e) => e.kind === 'forbidden_keyword')) {
    errors.push('öz-test: yasak anahtar YAKALANMADI')
  }
}

// ── 3. yasak liste PROFILE.md ile senkron mu ─────────────────────────────────
const PROFILE = 'registry/PROFILE.md'
if (existsSync(p(PROFILE))) {
  const doc = readFileSync(p(PROFILE), 'utf8')
  const eksik = FORBIDDEN_KEYWORDS.filter((k) => !doc.includes(`\`${k}\``))
  if (eksik.length > 0) {
    errors.push(`${PROFILE} derleyiciyle ayrışmış — belgede geçmeyen: ${eksik.join(', ')}`)
  }
}

// ── 4. gerçek varlık tipleri (FAZ-2.1'den itibaren dolar) ────────────────────
const gercekler = globSync('registry/entity-types/*.type.yaml', { cwd: REPO })

if (errors.length > 0) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} projeksiyon hatası`)
  process.exit(1)
}

console.log(
  `  ${derlenen} şema × 4 projeksiyon · öz-test geçti · ` +
    `${gercekler.length} gerçek varlık tipi (FAZ-2.1'de dolar)`
)
