#!/usr/bin/env node
// `just reindex` girişi — türetilmiş indeksi SIFIRDAN kurar (§3.5 · D-27).
//
// `derived/index/` silinebilir; bu betik onu corpus'tan geri getirir. Kayıp veri kaybı
// değil, saniyelerdir. `derived/runs/`a ASLA dokunmaz — o türetilemez (D-38).

import { rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')

// İki isteğe bağlı argüman: corpus kökü ve veritabanı yolu.
//
// Varsayılanlar gerçek corpus'u gerçek indekse kurar. Argüman almasının sebebi
// kolaylık değil KANIT: `corpus/` FAZ-2.9'da doğuyor, o güne kadar FAZ-1.6'nın kabul
// komutu çalıştırılamaz durumdaydı — tikli bir adımın ✅'si EXIT=1 veriyordu (D-78).
// Sentetik fixture corpus'una karşı koşmak, aynı kod yolunu bugün çalıştırır.
const CORPUS = join(REPO, process.argv[2] ?? 'corpus')
const DB = join(REPO, process.argv[3] ?? 'derived/index/suite.db')

const { reindexToPath } = await import(join(REPO, 'packages/corpus/dist/index.js'))

// Sıfırdan kurmak ŞART: eski şemayla açılan bir dosyaya göç uygulamak, "silinip
// yeniden kurulabilir" garantisini test etmeden geçmek olurdu.
for (const ek of ['', '-wal', '-shm']) {
  if (existsSync(DB + ek)) rmSync(DB + ek)
}

const t0 = process.hrtime.bigint()
const sonuc = reindexToPath(DB, CORPUS)
const ms = Number(process.hrtime.bigint() - t0) / 1e6

// `corpus/` yoksa bu bir BAŞARI değildir. Sessizce "0 kayıt" demek, indekslenmemiş
// bir corpus'u indekslenmiş sanmaktır — ve arama boş dönünce sebebi aranmaz (D-75).
if (!sonuc.ok) {
  console.log(`✗ corpus kökü yok: ${sonuc.error.path}`)
  console.log('  indeksleme YAPILMADI. Corpus FAZ-2.9 adımında doğuyor.')
  process.exit(1)
}
const rapor = sonuc.report

console.log(`  ${rapor.indexed} kayıt indekslendi · ${ms.toFixed(0)} ms`)
if (rapor.skipped.length > 0) {
  console.log(`  ⚠ ${rapor.skipped.length} dosya atlandı:`)
  for (const s of rapor.skipped) console.log(`      ${s.path} — ${s.reason}`)
}
