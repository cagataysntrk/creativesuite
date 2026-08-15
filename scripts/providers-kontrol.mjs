#!/usr/bin/env node
// `providers` kapısı — tanımlayıcı ile adaptör arasındaki sözleşme (§8.1).

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
// `ADAPTERS` ham listesine burada dokunulmaz — `saglayici-cagirici` darboğazı onu
// `registry.ts`'e kilitliyor. Kapının ihtiyacı zaten "bu id bir adaptöre çözülüyor mu"
// sorusu ve `adapterById` tam olarak o soruyu meşru yoldan cevaplıyor.
const { loadDescriptors, adapterById } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)

const KOK = join(REPO, 'registry/providers')
const { descriptors, failures } = loadDescriptors(KOK)

const hatalar = []
for (const f of failures) {
  for (const e of f.errors) hatalar.push(`${f.file}: ${e.kind} ${JSON.stringify(e)}`)
}
if (descriptors.length === 0 && failures.length === 0) {
  console.log('✗ hiç sağlayıcı tanımlayıcısı yok — kapı boş geçiyor')
  process.exit(1)
}

let bekleyen = 0
let bagli = 0

for (const d of descriptors) {
  // `pending` adaptör MEŞRU ama enabled OLAMAZ: yönlendiriciye giren ama gövdesi
  // olmayan bir sağlayıcı, çalıştırma anında patlar ve o an geçtir.
  if (d.adapter === 'pending') {
    bekleyen++
    if (d.enabled) {
      hatalar.push(`${d.id}: adapter 'pending' ama enabled: true — gövdesiz sağlayıcı aday olamaz`)
    }
    continue
  }
  const adaptor = adapterById(d.adapter)
  if (adaptor === null) {
    hatalar.push(`${d.id}: adaptör '${d.adapter}' KOD'da yok — sağlayıcı kataloğu onu tanımıyor`)
    continue
  }
  bagli++

  // Tanımlayıcının BEYAN ettiği yetenek, adaptörün UYGULADIĞI yetenekle uyuşmalı.
  // Uyuşmazsa yönlendirici olmayan bir yeteneği aday gösterir ve çalıştırma patlar.
  const uygulanan = new Set(adaptor.capabilities().map((c) => c.name))
  for (const c of d.capabilities) {
    if (!uygulanan.has(c.name)) {
      hatalar.push(`${d.id}: '${c.name}' tanımlayıcıda var ama adaptör uygulamıyor`)
    }
  }
}

// Fiyat anlık görüntüsü VAR olmalı ve doğrulanmamışsa öyle DEMELİ (§8.3).
for (const d of descriptors) {
  if (d.pricingSnapshot === null) continue
  const yol = join(KOK, d.pricingSnapshot)
  if (!existsSync(yol)) {
    hatalar.push(`${d.id}: fiyat anlık görüntüsü YOK (${d.pricingSnapshot})`)
    continue
  }
  const snap = JSON.parse(readFileSync(yol, 'utf8'))

  // **Tarihsiz anlık görüntü yaşlandırılamaz** (§8.7 · D-150). İki dosya iki farklı
  // alan adı kullanıyordu (`captured_at` ve `date`) ve kapı yalnız `verified`a baktığı
  // için hiç fark etmedi: tazelik raporu birini `Infinity` günlük gösteriyordu.
  // Kanonik ad `captured_at`; alan adı sözleşmenin parçasıdır, bir tercih değil.
  if (typeof snap.captured_at !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(snap.captured_at)) {
    hatalar.push(
      `${d.id}: fiyat anlık görüntüsünde \`captured_at\` yok ya da biçimsiz ` +
        `(${JSON.stringify(snap.captured_at ?? null)}) — tarihsiz anlık görüntü yaşlandırılamaz`
    )
  }

  if (snap.verified !== true && d.enabled) {
    hatalar.push(
      `${d.id}: fiyat DOĞRULANMAMIŞ (verified: false) ama sağlayıcı enabled — ` +
        `doğrulanmamış fiyatla maliyet tahmini yapmak, tahmini yalan yapar`
    )
  }
}

if (hatalar.length > 0) {
  console.log(hatalar.map((h) => `  ✗ ${h}`).join('\n'))
  console.log(`\n${hatalar.length} sağlayıcı sözleşme ihlali`)
  process.exit(1)
}

console.log(
  `  ${descriptors.length} tanımlayıcı · ${bagli} adaptöre bağlı · ${bekleyen} gövdesi bekliyor · ` +
    `fiyat anlık görüntüleri tarihli`
)
