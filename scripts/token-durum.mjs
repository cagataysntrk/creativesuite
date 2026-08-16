#!/usr/bin/env node
// Token ömrü raporu — İNSANIN çalıştırdığı komut (§9.2 · §16 · FAZ-7.6).
//
// **Secret ÇÖZMEZ.** Son kullanma tarihi sır değil ve `secrets/token-durumu.json` düz
// metin duruyor; bu sayede bir ay sonra dönen kullanıcı `sops` kurmadan da "token
// ölmüş mü" sorusunu cevaplayabiliyor. Sırrı okumak zorunda olan bir sağlık raporu,
// gözetimsiz bir kurulumda hiç koşmaz.

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { yenilemeRaporu } = await import(join(REPO, 'packages/providers/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const YOL = 'secrets/token-durumu.json'
const mutlak = join(REPO, YOL)

let kayitlar = []
if (!existsSync(mutlak)) {
  console.log(`⚠ ${YOL} yok — token ömrü BİLİNMİYOR ve yayın bloklu`)
} else {
  try {
    const ham = JSON.parse(readFileSync(mutlak, 'utf8'))
    kayitlar = Array.isArray(ham.kayitlar) ? ham.kayitlar : []
  } catch (e) {
    console.log(`✗ ${YOL} okunamadı: ${e.message}`)
    process.exit(1)
  }
}

const rapor = yenilemeRaporu(kayitlar, ['meta', 'linkedin'], systemClock.nowIso())
let bloklu = 0
for (const r of rapor) {
  const isaret = r.bloklu ? '✗' : r.durum.kind === 'ok' ? '✓' : '⚠'
  console.log(`  ${isaret} ${r.mesaj}`)
  if (r.bloklu) bloklu++
}

console.log('')
if (bloklu > 0) {
  console.log(`✗ ${bloklu} kanalın yayını BLOKLU — token yenilenmeli (§9.2)`)
  console.log('  Yenileme sonrası kaydı güncelleyin: provider · expiresAt · obtainedAt · scopes')
  console.log(`  ⚠ Token'ın KENDİSİ ${YOL}'a yazılmaz — o sops altında (R-51).`)
  process.exit(1)
}
console.log('✓ token ömürleri sağlıklı')
