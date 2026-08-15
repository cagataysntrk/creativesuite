#!/usr/bin/env node
// Üretilmiş JSON şemaları (§3.2 · FAZ-1.2).
//
// Kaynak Zod'dur; `schemas/*.schema.json` TÜRETİLMİŞTİR ama COMMIT'LENİR.
// Neden commit'leniyor: editör autocomplete'i ve CI, `pnpm install` çalışmadan da
// şemayı görebilmeli. Neden üretiliyor: elle yazılan bir kopya, ilk alan eklendiğinde
// sessizce yalan söylemeye başlar.
//
// Çıktı dizini argümanla verilir. `schemas` kapısı bunu GEÇİCİ bir dizine üretip
// commit'li hâliyle karşılaştırır — bir kapının çalışma ağacını değiştirmesi,
// "kapı yeşil olsun diye dosyayı düzeltti" hatasının kapısını açar.

import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath: `new URL(...).pathname` Türkçe karakterli dizinlerde URL-kodlu yol
// döndürür ve dosyalar yanlış dizine yazılır (2026-08-14'te 44 dosya böyle kayboldu).
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')

const outDir = resolve(process.argv[2] ?? join(REPO, 'schemas'))

const { SCHEMA_REGISTRY } = await import(join(REPO, 'packages/kernel/dist/index.js'))

mkdirSync(outDir, { recursive: true })

let n = 0
for (const entry of SCHEMA_REGISTRY) {
  const schema = entry.uret()
  const doc = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: entry.baslik,
    ...schema,
  }
  writeFileSync(join(outDir, `${entry.dosya}.schema.json`), JSON.stringify(doc, null, 2) + '\n')
  n++
}

console.log(`  ${n} şema üretildi → ${outDir}`)
