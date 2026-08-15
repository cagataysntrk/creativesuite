#!/usr/bin/env node
// GROUP: fast
// Dokuz fiil kapısı (§3.10 · R-02 · FAZ-0.C.11).
//
// Sapma İKİ YÖNDE de hatadır: onuncu fiil eklemek de, birini çıkarmak da, birinin yan
// etki sınıfını sessizce değiştirmek de. Her fiil zamanlama, maliyet, retry, replay ve
// UI yüzeyi çarpanıdır; onuncu fiil beş yerde yeni dal demektir ve o dallardan biri er
// geç maliyet defterini atlar.
//
// Kapı ayrıca **yetenek adının fiil listesine sızmasını** yakalar: `image.generate` bir
// `capability` DEĞERİDİR, fiil değil. Bu karışıklık dokuz fiil yasasını sessizce on beş
// fiile çevirmenin en kolay yoludur.

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

const PIN = 'packages/kernel/verbs.json'
const DIST = 'packages/kernel/dist/index.js'

const BEKLENEN_SAYI = 9

const EFFECT_CLASSES = new Set([
  'read-registry',
  'read-corpus',
  'pure',
  'network-model',
  'browser',
  'write-tree',
  'network-channel',
  'network-source',
])

const errors = []

if (!existsSync(p(PIN))) {
  console.log(`✗ ${PIN} yok — sabitlenmiş liste olmadan kapı anlamsız`)
  process.exit(1)
}
if (!existsSync(p(DIST))) {
  console.log(`✗ ${DIST} yok — önce 'just gate types'`)
  process.exit(1)
}

const pinned = JSON.parse(readFileSync(p(PIN), 'utf8')).verbs
const { fingerprint } = await import(p(DIST))
const live = fingerprint()

// ── 1. sayı ──────────────────────────────────────────────────────────────────
if (live.length !== BEKLENEN_SAYI) {
  errors.push(
    `kernel ${live.length} fiil dışa açıyor, ${BEKLENEN_SAYI} olmalı (R-02). ` +
      `Onuncu fiil AYNI COMMIT'te bir D-nn girdisi gerektirir.`
  )
}
if (pinned.length !== BEKLENEN_SAYI) {
  errors.push(`${PIN} ${pinned.length} fiil listeliyor, ${BEKLENEN_SAYI} olmalı`)
}

// ── 2. sabitlenmiş liste ile canlı tablo birebir aynı mı ─────────────────────
const key = (v) => `${v.name}|${v.effectClass}|${v.metered}`
const pinSet = new Set(pinned.map(key))
const liveSet = new Set(live.map(key))

for (const v of live) {
  if (!pinSet.has(key(v))) {
    errors.push(
      `${v.name}: kodda var, ${PIN} ile eşleşmiyor (${v.effectClass}, metered=${v.metered})`
    )
  }
}
for (const v of pinned) {
  if (!liveSet.has(key(v))) {
    errors.push(`${v.name}: ${PIN}'da var, kodda yok veya farklı`)
  }
}

// ── 3. fiil adı bir YETENEK adı olamaz ───────────────────────────────────────
for (const v of live) {
  if (v.name.includes('.')) {
    errors.push(
      `${v.name}: nokta içeriyor — bu bir YETENEK adı (capability), fiil adı değil (§3.10). ` +
        `image.generate gibi değerler GENERATE fiiliyle koşar.`
    )
  }
  if (v.name !== v.name.toUpperCase()) {
    errors.push(`${v.name}: fiil adları BÜYÜK harftir; küçük harf yetenek adını çağrıştırır`)
  }
}

// ── 4. yan etki sınıfı geçerli mi ve TEK mi ──────────────────────────────────
for (const v of live) {
  if (!EFFECT_CLASSES.has(v.effectClass)) {
    errors.push(`${v.name}: bilinmeyen yan etki sınıfı '${v.effectClass}'`)
  }
}

// Ağ/tarayıcı/yazma sınıfları TEK sahiplidir: iki fiil aynı ağ sınıfını paylaşırsa
// "yalnız GENERATE model çağırır" cümlesi yalan olur (R-04).
const TEKIL = ['network-model', 'browser', 'write-tree', 'network-channel', 'network-source']
for (const ec of TEKIL) {
  const sahipler = live.filter((v) => v.effectClass === ec).map((v) => v.name)
  if (sahipler.length > 1) {
    errors.push(
      `'${ec}' sınıfını ${sahipler.length} fiil paylaşıyor (${sahipler.join(', ')}) — tek olmalı (R-04)`
    )
  }
}

// ── 5. metered tutarlılığı ───────────────────────────────────────────────────
// Ağ ve tarayıcı harcar; saf ve okuma harcamaz. Sapan bir satır, bütçe tavanını
// (D-17) o fiil için sessizce devre dışı bırakır.
const HARCAYAN = new Set(['network-model', 'browser', 'network-channel', 'network-source'])
for (const v of live) {
  const beklenen = HARCAYAN.has(v.effectClass)
  if (v.metered !== beklenen) {
    errors.push(
      `${v.name}: metered=${v.metered} ama yan etki sınıfı '${v.effectClass}' → ${beklenen} olmalı`
    )
  }
}

if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} fiil sözleşmesi ihlali`)
  process.exit(1)
}

const metered = live.filter((v) => v.metered).map((v) => v.name)
console.log(`  ${live.length} fiil sabit · metered: ${metered.join(', ')}`)
