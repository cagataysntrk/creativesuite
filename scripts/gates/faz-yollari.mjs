// GROUP: fast
// TİKLİ bir adımın `📁` yolları GERÇEKTEN var olmalı (R-65 ruhu · R-70).
//
// **Faz dosyası bağlamsız agent'ın haritasıdır.** Bir adım "bitti" diye tiklendiğinde
// `📁` satırı artık bir plan değil, bir İDDİADIR: "kod burada". İddia yanlışsa, bir ay
// sonra dönen okuyucu (insan ya da agent) var olmayan bir dizini arar ve kodu
// bulamadığı için işin yapılmadığını sanır.
//
// Gerçekten oldu (2026-08-16 denetimi): FAZ-4'ün yedi `📁` yolu
// (`apps/ui/src/screens/approval/`, `packages/ui/src/components/tolerance/` …)
// planlama sırasında yazılmış ve hiç güncellenmemişti; gerçek yerleşim düz
// `apps/ui/src/*.tsx`. Yedi adım tikliydi, yedi yol da yanlıştı.
//
// **TİKSİZ adımlar denetlenmez** — onların yolu henüz bir plandır ve olmaması normal.
//
// ⚠ **Kapı bir kez KÖR kaldı** (FAZ-7 denetimi, M4): yalnız `📁` ile BAŞLAYAN satırı
// okuyordu. Yol listesi iki satıra sarıldığında ikinci satır denetim dışı kalıyordu ve
// dokuz yol hiç bakılmadan geçiyordu — kapı `✓` derken bir tanesi gerçekten yoktu.
// **Bir kapının yeşil olması, baktığı yerin doğru olduğunu göstermez.**

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const FAZLAR = join(REPO, 'docs/fazlar')

const hatalar = []
let denetlenen = 0

for (const dosya of readdirSync(FAZLAR).filter((f) => /^FAZ-\d+\.md$/.test(f))) {
  const satirlar = readFileSync(join(FAZLAR, dosya), 'utf8').split('\n')
  let tikli = false
  // `📁` bloğu içinde miyiz: sarılmış (girintili) devam satırları da bloğa aittir.
  let blokta = false
  satirlar.forEach((satir, i) => {
    // Adım başlığı: tik durumunu belirler ve sonraki `📁` satırları ona ait.
    // ⚠ Regex `## 0.A.1` biçimini HİÇ görmüyordu: 125 tikli adımın 37'si (FAZ-0'ın
    // tamamı) denetim dışı kalıyordu (2. denetim turu, m3). Kapının ilk körlüğü
    // sarılmış satırdı, bu ikincisi — **kapı iki kez baktığı yeri eksik tanımladı.**
    if (/^## \d+(?:\.[A-Za-z0-9]+)* —/.test(satir)) {
      tikli = satir.includes('[x]')
      blokta = false
    }
    if (satir.startsWith('📁')) blokta = true
    // Blok biter: başka bir alan işareti, boş satır ya da girintisiz metin.
    else if (blokta && (satir.trim() === '' || !/^\s/.test(satir))) blokta = false
    if (!blokta || !tikli) return

    for (const m of satir.matchAll(/`([^`]+)`/g)) {
      const ham = m[1].trim()
      // ── yanlış pozitif de bir HATADIR: sürekli alarm veren kapı kapatılan kapıdır
      //
      // Atlanan notasyonlar — hepsi meşru ve hiçbiri tek bir dosyayı göstermez:
      //   `*.recipe.yaml`  glob            `{a,b}.ts`  brace genişletmesi
      //   `<brand_id>/`    yer tutucu      `types.ts`  dizinsiz çıplak dosya adı
      // Çıplak dosya adı kasıtlı olarak atlanıyor: nesirde "types.ts" demek bir yol
      // iddiası değil, bir dosyaya atıftır ve hangi paketteki olduğu belirsizdir.
      if (/[*{}<>]/.test(ham)) continue
      if (!ham.includes('/')) continue
      denetlenen++
      if (!existsSync(join(REPO, ham))) {
        hatalar.push(
          `docs/fazlar/${dosya}:${i + 1} — tikli adım var olmayan yolu gösteriyor: ${ham}`
        )
      }
    }
  })
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} bayat yol — tikli bir adımın 📁 satırı plan değil, İDDİADIR`)
  process.exit(1)
}

console.log(`✓ faz-yollari: tikli adımların ${denetlenen} yolu da mevcut`)
