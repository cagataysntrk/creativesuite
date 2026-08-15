#!/usr/bin/env node
// Tazelik denetimi — fiyat anlık görüntüleri ve platform spec'leri (§8.7 · §9.1).
//
// **Spec'ler sessizce bayatlar.** Platform ölçüleri değişiyor (Meta feed'i 1:1'den
// 4:5'e taşıdı), sağlayıcılar fiyat güncelliyor. Tarihsiz bir spec ne zaman doğru
// olduğunu söylemez; TARİHLİ ama denetlenmeyen bir spec, tarihi olduğu için doğru
// SANILIR — ikincisi daha tehlikeli.
//
// **Rapor eder, hiçbir şeyi değiştirmez** (§16). Otomatik tazeleme, bir ay sonra dönen
// kullanıcıya neyin değiştiğini gizler.

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { PLACEMENTS, specAgeDays } = await import(join(REPO, 'packages/render/dist/index.js'))
const { loadDescriptors } = await import(join(REPO, 'packages/providers/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

// Bugünün tarihi ÇAĞIRANDAN değil saatten; ama saat kernel'in tek saati (R-06).
const BUGUN = systemClock.nowIso().slice(0, 10)

// §8.7: "UI, anlık görüntü 60 günden eskiyse uyarı rozeti gösterir."
const FIYAT_UYARI_GUN = 60
// §9.1: "Üç aylık bir iş kaynakları yeniden çeker ve diff'ler."
const SPEC_UYARI_GUN = 90

const satirlar = []

// ── fiyat anlık görüntüleri ─────────────────────────────────────────────────
const KOK = join(REPO, 'registry/providers')
const { descriptors } = loadDescriptors(KOK)
for (const d of descriptors) {
  if (d.pricingSnapshot === null) {
    if (d.enabled) satirlar.push(`  ⚠ ${d.id}: fiyat anlık görüntüsü YOK ama enabled`)
    continue
  }
  const yol = join(KOK, d.pricingSnapshot)
  if (!existsSync(yol)) {
    satirlar.push(`  ✗ ${d.id}: anlık görüntü dosyası yok (${d.pricingSnapshot})`)
    continue
  }
  const snap = JSON.parse(readFileSync(yol, 'utf8'))
  // Kanonik alan `captured_at` (D-150); `providers` kapısı varlığını zorluyor.
  const yas = specAgeDays({ verifiedAt: snap.captured_at ?? '' }, BUGUN)
  const dogrulanmis = snap.verified === true ? '' : ' · DOĞRULANMAMIŞ'
  const isaret = yas > FIYAT_UYARI_GUN ? '⚠' : ' '
  satirlar.push(
    `  ${isaret} ${d.id.padEnd(24)} fiyat ${String(yas).padStart(4)} günlük${dogrulanmis}` +
      (yas > FIYAT_UYARI_GUN ? ` — ${FIYAT_UYARI_GUN} gün sınırı aşıldı (§8.7)` : '')
  )
}

// ── platform spec'leri ──────────────────────────────────────────────────────
for (const p of PLACEMENTS) {
  const yas = specAgeDays(p, BUGUN)
  const isaret = yas > SPEC_UYARI_GUN ? '⚠' : ' '
  satirlar.push(
    `  ${isaret} ${p.id.padEnd(24)} spec  ${String(yas).padStart(4)} günlük` +
      (yas > SPEC_UYARI_GUN ? ` — ${SPEC_UYARI_GUN} gün sınırı aşıldı (§9.1)` : '')
  )
}

console.log(satirlar.join('\n'))
