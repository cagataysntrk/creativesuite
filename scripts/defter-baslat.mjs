#!/usr/bin/env node
// Yayın defterini BAŞLATIR — İNSANIN çalıştırdığı komut (§13 · R-46 · D-38 · FAZ-7.2).
//
// **Kısır döngüyü kıran tek şey bu komut** (FAZ-7 denetimi 2. tur, B2): `publish()`
// yayından önce defteri okur ve yoksa DURUR; defter ise ancak başarılı bir yayının
// sonunda yazılır. Yani ilk gerçek yayın, insan token'ı ve HTTP adaptörünü verse bile
// hiçbir zaman başarılı olamazdı.
//
// **Neden otomatik değil:** "defter yok" bir insanın kararını istiyor — yedekten mi
// geri yüklenecek, yoksa bu gerçekten ilk yayın mı? Yazma yolunun defteri kendiliğinden
// oluşturması, o kararı sessizce vermek olurdu ve defteri silmek yinelemeleri serbest
// bırakırdı (D-38: defter TÜRETİLEMEZ).
//
// **Var olan defteri ASLA sıfırlamaz.** Idempotent: ikinci çağrı hiçbir şey yapmaz.

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { initLedgerFile, readLedger, publishedLedgerPath } = await import(
  join(REPO, 'packages/engine/dist/index.js')
).then(async (m) => ({
  ...m,
  publishedLedgerPath: (await import(join(REPO, 'packages/kernel/dist/index.js')))
    .publishedLedgerPath,
}))

const yol = publishedLedgerPath()
const once = readLedger(REPO)

if (once.ok) {
  console.log(`· defter zaten var: ${yol} · ${once.entries.length} kayıt`)
  console.log('  Hiçbir şey yapılmadı — var olan defter ASLA sıfırlanmaz (D-38).')
  process.exit(0)
}
if (once.error.kind === 'unreadable') {
  // Bozuk defteri "başlatmak" onu SİLMEK olurdu. Bu komut kurtarma aracı değil.
  console.log(`✗ defter BOZUK (${once.error.line}. satır: ${once.error.reason})`)
  console.log('  Bu komut bozuk defteri onarmaz ve üzerine yazmaz — yedekten geri yükleyin.')
  process.exit(1)
}

const yaratildi = initLedgerFile(REPO)
console.log(yaratildi ? `✓ defter başlatıldı: ${yol}` : `· defter zaten vardı: ${yol}`)
console.log('  Boş defter = "hiç yayın yapılmadı". Defter YOKLUĞU ise "durum bilinmiyor"du;')
console.log('  ikisi farklı ve yayın hattı artık ilkini kabul ediyor (R-46).')
console.log('  ⚠ Bu dosya `derived/runs/` altında ve TÜRETİLEMEZ: ayrı bir çalıştırma')
console.log('    kaydı olarak commit edilmeli (R-60 · Run / Actor / Kind künyesi).')
