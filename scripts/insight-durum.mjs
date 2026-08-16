#!/usr/bin/env node
// Insight ölçüm raporu — İNSANIN çalıştırdığı komut (§13 · D-220 · FAZ-7.8).
//
// **Bugün toplanmayan ölçüm yarın satın alınamaz.** IG hesap insight'ları ~90 günde
// kayboluyor ve backfill ucu yok. Bu komut tek bir soruyu cevaplar: **ölçüm işi
// çalışıyor mu, ve şimdiye kadar neyi kalıcı olarak kaybettik.**
//
// **Ağa çıkmaz.** Yalnız `derived/runs/` altındaki iki defteri okur; bir ay sonra,
// anahtarsız bir makinede de aynı cevabı verir (§16).

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { readInsights, readLedger, insightTazeligi, bosluklar, INSIGHT_UFKU_GUN } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const bugun = systemClock.nowIso().slice(0, 10)
const yayinlar = readLedger(REPO)

// Yayın yoksa ölçüm de olmaz: hiç post atmamış bir sistemde "insight alınmadı"
// demek yanlış alarmdır ve yanlış alarm, doğru alarmı da öldürür.
if (!yayinlar.ok) {
  console.log(
    yayinlar.error.kind === 'ledger_missing'
      ? `· yayın defteri yok (${yayinlar.error.path}) — henüz yayın yapılmamış olabilir`
      : `✗ yayın defteri ${yayinlar.error.line}. satırda bozuk: ${yayinlar.error.reason}`
  )
  process.exit(yayinlar.error.kind === 'ledger_missing' ? 0 : 1)
}
if (yayinlar.entries.length === 0) {
  console.log('· henüz yayın yok — ölçülecek varlık yok')
  process.exit(0)
}

const ilkGun = [...yayinlar.entries].map((e) => e.publishedAt.slice(0, 10)).sort()[0]
const olcumler = readInsights(REPO)
if (!olcumler.ok && olcumler.error.kind === 'unreadable') {
  console.log(`✗ insight defteri ${olcumler.error.line}. satırda bozuk: ${olcumler.error.reason}`)
  process.exit(1)
}
const gunler = olcumler.ok ? olcumler.satirlar.map((s) => s.gun) : []

const tazelik = insightTazeligi(gunler, bugun)
console.log(`  ${tazelik.kritik ? '✗' : '✓'} ${tazelik.mesaj}`)
console.log(`  · ilk yayın ${ilkGun} · ${new Set(gunler).size} gün ölçüldü`)

const b = bosluklar(gunler, ilkGun, bugun)
const kalici = b.filter((x) => !x.kurtarilabilir)
if (b.length > 0) {
  console.log('')
  console.log(`  ⚠ ${b.length} gün ölçüm eksik`)
  if (kalici.length > 0) {
    // Kurtarılamayan kayıp, "eksik veri" değil **bitmiş** bir olgudur. Bunu
    // ayırmadan göstermek, panonun o dönemi "düşük performans" diye okuması demek.
    console.log(
      `  ✗ ${kalici.length} günü KALICI olarak kayıp (${INSIGHT_UFKU_GUN} gün ufkunu geçti) — geri getirilemez`
    )
    console.log(`    en eskisi: ${kalici[0].gun}`)
  }
}

console.log('')
if (tazelik.kritik || kalici.length > 0) {
  console.log('✗ ölçüm işi güvenilir çalışmıyor — geçen her gün kalıcı kayıp (§13)')
  process.exit(1)
}
console.log('✓ insight ölçümü güncel')
