#!/usr/bin/env node
// KVKK silme talebi — İNSANIN çalıştırdığı komut (§5.1 · R-12, R-14 · D-212 · FAZ-6.10).
//
// **Agent bunu çağıramaz.** Silme bir karardır ve bir agent'ın kişisel veri silebilmesi,
// bir agent'ın kişisel veri silmeyi UNUTABİLMESİ demektir. `kvkkErasure` bir kütüphane
// fonksiyonuydu ve **hiçbir insan girişi yoktu** (FAZ 6 denetimi, bulgu 12): yükümlülüğü
// yerine getirmenin tek yolu bir test dosyası yazmaktı.
//
// **Dosya SİLİNMEZ, kişisel veri silinir.** Geriye kişisel veri taşımayan bir mezar taşı
// kalır: kimlik, silme tarihi, gerekçe. Düz silme hem köken zincirini koparır hem de
// silmenin yapıldığına dair kanıtı yok eder — ve KVKK'da gösteremediğin şey yapılmamıştır.
//
// Kullanım:
//   just kvkk-sil <slug> --gerekce "<metin>" --talep-eden "<kim>"

import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { kvkkErasure, erasureMessage } = await import(join(REPO, 'packages/corpus/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const argv = process.argv.slice(2)
const bayrak = (ad) => {
  const i = argv.indexOf(`--${ad}`)
  return i === -1 ? null : (argv[i + 1] ?? null)
}
const slug = argv.find(
  (a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true
)

if (slug === undefined || slug === null) {
  console.log('kullanım: just kvkk-sil <slug> --gerekce "<metin>" --talep-eden "<kim>"')
  process.exit(2)
}

const gerekce = bayrak('gerekce')
const talepEden = bayrak('talep-eden')
if (gerekce === null || talepEden === null) {
  // Gerekçesiz silme denetlenemez: yükümlülüğü yerine getirdiğini GÖSTEREMEZSİN.
  console.log('✗ `--gerekce` ve `--talep-eden` zorunlu — gerekçesiz silme denetlenemez')
  process.exit(2)
}

const yol = join(REPO, 'corpus/prospect', `${slug}.md`)
if (!existsSync(yol)) {
  console.log(`✗ kayıt yok: corpus/prospect/${slug}.md`)
  process.exit(1)
}

const r = kvkkErasure({
  root: join(REPO, 'corpus'),
  entityType: 'prospect',
  slug,
  // Saat kernel'den (R-06 · `saat` darboğazı): ikinci bir saat replay'i bozar.
  at: systemClock.nowIso(),
  reason: gerekce,
  requestedBy: talepEden,
})

if (!r.ok) {
  console.log(`✗ ${erasureMessage(r.refusal)}`)
  process.exit(1)
}

console.log(`✓ ${r.erasedFields.length} kişisel alan silindi: ${r.erasedFields.join(', ')}`)
console.log(`  mezar taşı: ${r.path}`)
console.log('')
console.log("  Şimdi ÇALIŞTIRMA commit'i ile kaydedin (Refs: yasak):")
console.log(`    just save - corpus <<'EOF'`)
console.log(`    KVKK silme talebi uygulandı: ${slug}`)
console.log('')
console.log(`    Run: -`)
console.log(`    Actor: human`)
console.log(`    Kind: approve`)
console.log(`    EOF`)
