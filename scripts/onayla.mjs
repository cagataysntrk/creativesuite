#!/usr/bin/env node
// `just onayla <slug…>` — İNSANIN onay komutu (§5.4 · R-14 · D-31).
//
// Agent `propose()` çağırır ve kayıt `status: draft` iner: retrieval'a görünmez,
// hiçbir üretime giremez. Bu komut o kaydı `active` yapar ve **yalnız insan çalıştırır**.
//
// **Neden ayrı bir komut:** onay = git commit'tir, ama commit'ten önce birinin
// `status`u çevirmesi gerekir. O çevirme agent'ın elinde olsaydı, R-14 bir
// konvansiyona dönerdi — agent kendi önerisini onaylayabilirdi. Komut insanın
// klavyesinden çalışır; agent'ın bunu çağırması kuralı çiğnemektir.
//
// Komut commit ATMAZ: onay, insanın `just save` ile attığı commit'tir.

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { parseFrontmatter, writeRecord, computeSignature } = await import(
  join(REPO, 'packages/corpus/dist/index.js')
)
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const hedefler = process.argv.slice(2).filter((a) => a !== '')
if (hedefler.length === 0) {
  console.log('  kullanım: just onayla <corpus-yolu…>')
  console.log('  örnek:    just onayla corpus/positioning/imalat-verimlilik-konumu.md')
  process.exit(1)
}

// Saat `time/clock.ts`ten okunuyor: `new Date()` ikinci bir saat kaynağıdır ve
// replay'i bozar (R-06). Darboğaz kapsamı `scripts/`i kapsamıyordu, bu yüzden kapı
// görmemişti — kapsam bu turda genişletildi (doğrulama agent'ı buldu).
const zaman = new Date(systemClock.now()).toISOString()
let onaylanan = 0

for (const rel of hedefler) {
  const yol = rel.startsWith('/') ? rel : join(REPO, rel)
  if (!existsSync(yol)) {
    console.log(`✗ yok: ${rel}`)
    process.exit(1)
  }
  const p = parseFrontmatter(readFileSync(yol, 'utf8'))
  if (!p.ok || p.value.frontmatter === null) {
    console.log(`✗ frontmatter okunamadı: ${rel}`)
    process.exit(1)
  }
  const fm = p.value.frontmatter
  if (fm['status'] !== 'draft') {
    // Zaten onaylı bir kaydı yeniden onaylamak sessizce geçmez: onay tarihini
    // ezmek, "bunu ne zaman kabul ettim" sorusunun cevabını silmektir.
    console.log(`✗ ${rel}: status "${fm['status']}" — yalnız draft onaylanır`)
    process.exit(1)
  }
  const yeni = {
    ...fm,
    status: 'active',
    approved_by: 'human',
    approved_at: zaman,
    valid_at: zaman,
  }
  // Yazma TEK noktadan: `writeFileSync` ile doğrudan yazmak, `corpus-yazici`
  // darboğazının yasakladığı ikinci yoldur (R-14). Yol parçalarından tip ve slug
  // çıkarılıyor; `recordPath` ile aynı yerleşim.
  const parcalar = rel.replace(/^corpus\//, '').split('/')
  const entityType = parcalar[0] ?? ''
  const slug = (parcalar[1] ?? '').replace(/\.md$/, '')
  const sonuc = writeRecord({
    root: join(REPO, 'corpus'),
    entityType,
    slug,
    frontmatter: { ...yeni, x_signature: computeSignature(yeni, p.value.body) },
    body: p.value.body,
    actor: 'human',
  })
  if (!sonuc.ok) {
    console.log(`✗ ${rel}: yazma reddedildi — ${JSON.stringify(sonuc.refusal)}`)
    process.exit(1)
  }
  console.log(`  ✓ ${rel}`)
  onaylanan++
}

console.log(`\n  ${onaylanan} kayıt onaylandı (status: active, approved_at: ${zaman}).`)
console.log("  Onay HENÜZ tamamlanmadı: gerçek onay insanın commit'idir (R-14).")
console.log("  Sonraki adım:  just reindex  →  kaydetme komutu (çalıştırma commit'i)")
