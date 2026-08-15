#!/usr/bin/env node
// GROUP: fast
// DURUM.md tutarlılığı (LOOP§E · D-46 · FAZ-0.E.1).
//
// `DURUM.md` döngünün SÖZLEŞMESİDİR: bağlamı sıfırlanmış bir agent "şimdi ne yapmalıyım"
// sorusunu yalnız buradan cevaplar. Bayat bir `siradaki_adim`, o agent'ı **bitmiş bir işe**
// yönlendirir ve tur boşa gider — ya da daha kötüsü, biten iş ikinci kez yapılır.
//
// 2026-08-15'te tam olarak bu oldu: art arda birkaç düzenleme sessizce boşa gitti ve
// `siradaki_adim` altı adım geride kaldı, "Sıradaki adım" bölümü iki farklı turun
// metnini üst üste taşıdı. Hiçbir kapı bunu görmedi. Bu kapı onun için var.

import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)

{
  const { status, stdout, stderr } = spawnSync('bash', [join(REPO, 'scripts/ensure-build.sh')], {
    encoding: 'utf8',
  })
  if (status !== 0) {
    console.log(`✗ derleme başarısız — kapı bayat dist üstünde çalışmaz\n${stdout}${stderr}`)
    process.exit(1)
  }
}
const { parseYaml } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const errors = []
const durum = readFileSync(p('DURUM.md'), 'utf8')

// ── 0. blok GERÇEKTEN YAML mı ────────────────────────────────────────────────
// Regex ile alan çekmek yetmiyor: 2026-08-15'te `son_kanit` fazladan bir tırnakla
// bitiyordu ve blok YAML olarak AYRIŞMIYORDU. Regex bunu görmedi çünkü satırı
// okuyabiliyordu. Ama bloğun tek varlık sebebi MAKİNE-OKUNUR olması — ayrışmayan
// bir sözleşme, sözleşme değildir (doğrulama agent'ı buldu).
const blok = durum.match(/```yaml\n([\s\S]*?)```/)
if (blok === null) {
  errors.push('makine-okunur yaml bloğu YOK — LOOP§E sözleşmesi eksik')
} else {
  const y = parseYaml(blok[1])
  if (!y.ok) errors.push(`yaml bloğu ayrışmıyor: ${y.message.split('\n')[0]}`)
}

const alan = (ad) => durum.match(new RegExp(`^${ad}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? null

const aktifFaz = alan('aktif_faz')
const siradaki = alan('siradaki_adim')

if (aktifFaz === null || !/^\d+$/.test(aktifFaz)) {
  errors.push(`aktif_faz okunamadı veya sayı değil: ${aktifFaz}`)
}
// İki geçerli biçim: bir adım (`3.14`) ya da faz kapanışı (`FAZ-3-KAPANIS`).
// İkincisinin kendi koşulu var (aşağıda) — serbest metin kabul edilmiyor.
if (siradaki === null || !/^(\d+\.[A-Za-z0-9.]+|FAZ-\d-KAPANIS)$/.test(siradaki)) {
  errors.push(`siradaki_adim okunamadı veya biçimsiz: ${siradaki}`)
}

// ── faz dosyalarındaki tikler ────────────────────────────────────────────────
const adimlar = new Map() // "1.11" -> true(tikli)/false
for (let n = 0; n <= 9; n++) {
  const f = `docs/fazlar/FAZ-${n}.md`
  if (!existsSync(p(f))) continue
  for (const m of readFileSync(p(f), 'utf8').matchAll(
    /^##+ +(\d+)\.([A-Za-z0-9.]+?) +—.*?\[( |x)\]/gm
  )) {
    if (m[1] !== String(n)) continue
    adimlar.set(`${m[1]}.${m[2]}`, m[3] === 'x')
  }
}

if (adimlar.size === 0) {
  console.log('✗ hiç faz adımı okunamadı — kapı boş geçiyor')
  process.exit(1)
}

// Bloke listesi kapanış kontrolünden ÖNCE okunur: kapanış, bloke adımları hariç
// tutabilmek için onları bilmek zorunda.
const blokeListesi = (durum.match(/^bloke:\s*\[(.*)\]$/m)?.[1] ?? '')
  .split(',')
  .map((x) => x.trim().replace(/^['"]|['"]$/g, ''))
  .filter(Boolean)

// ── 1. sıradaki adım gerçekten var mı ve BİTMEMİŞ mi ─────────────────────────
//
// `FAZ-N-KAPANIS` özel bir değerdir: faz kapanış protokolü (LOOP§D) işliyor demek.
// Bu bir kaçış deliği DEĞİL — kontrol edilebilir bir koşulu var: o fazın BLOKE
// OLMAYAN her adımı tikli olmalı. Aksi hâlde "kapanışa geçtim" demek, yarım kalmış
// adımların üstünü örtmenin en kolay yolu olurdu.
const KAPANIS = /^FAZ-(\d)-KAPANIS$/
const kapanisEslesme = siradaki === null ? null : KAPANIS.exec(siradaki)

if (kapanisEslesme !== null) {
  const faz = kapanisEslesme[1]
  const acikta = [...adimlar.entries()]
    .filter(([ad, tikli]) => ad.startsWith(`${faz}.`) && !tikli && !blokeListesi.includes(ad))
    .map(([ad]) => ad)
  if (acikta.length > 0) {
    errors.push(
      `siradaki_adim '${siradaki}' ama FAZ ${faz}'te bloke OLMAYAN ${acikta.length} adım ` +
        `hâlâ tiksiz: ${acikta.join(', ')} — kapanış yarım adımların üstünü örtemez`
    )
  }
} else if (siradaki !== null) {
  if (!adimlar.has(siradaki)) {
    errors.push(
      `siradaki_adim '${siradaki}' hiçbir faz dosyasında yok — bağlamsız agent olmayan bir adımı arar`
    )
  } else if (adimlar.get(siradaki) === true) {
    errors.push(
      `siradaki_adim '${siradaki}' ZATEN TİKLİ — DURUM bayatlamış. ` +
        `Bağlamı sıfırlanmış bir agent biten işi tekrar yapar (LOOP§E).`
    )
  }
}

// ── 2. bloke adımlar gerçek mi ───────────────────────────────────────────────
for (const b of blokeListesi) {
  if (!adimlar.has(b)) errors.push(`bloke listesindeki '${b}' hiçbir faz dosyasında yok`)
}

// ── 3. tamamlananlar tablosu tiklerden TÜRETİLİR — İKİ YÖNDE (D-46 · D-155) ──
// Tabloda olup faz dosyasında tikli olmayan bir satır, "bitti" diye yazılmış ama
// bitmemiş bir adımdır — kanıtsız tikleme (R-70) tablodan sızabilir.
//
// ⚠ TERS YÖN de denetlenir. İlk sürüm yalnız tablo→tik bakıyordu ve `3.2` tikli olduğu
// hâlde tablodan eksikti: bağlamı sıfırlanmış bir agent tabloya bakıp o adımı YAPILMAMIŞ
// sanardı — kapının önlemek için var olduğu şeyin tam tersi. Doğrulama turu 2 yakaladı.
const AKTIF = aktifFaz ?? ''
const tabloAdimlari = new Set(
  [...durum.matchAll(/^\|\s*\**([0-9]+\.[A-Za-z0-9.]+)\**\s*·/gm)].map((m) => m[1])
)
for (const a of tabloAdimlari) {
  if (adimlar.get(a) !== true) {
    errors.push(`Tamamlananlar tablosunda '${a}' var ama faz dosyasında tikli değil (D-46)`)
  }
}

// Ters yön: AKTİF fazın tikli her adımı tabloda olmalı. Yalnız aktif faz — tablo
// "yalnız AKTİF fazı gösterir" (D-85) ve geçmiş fazlar faz dosyalarındaki tiklerdedir.
for (const [ad, tikli] of adimlar) {
  if (!tikli || !ad.startsWith(`${AKTIF}.`)) continue
  if (!tabloAdimlari.has(ad)) {
    errors.push(
      `'${ad}' faz dosyasında TİKLİ ama Tamamlananlar tablosunda yok (D-46) — ` +
        `bağlamı sıfırlanmış agent onu yapılmamış sanar`
    )
  }
}

// ── 3b. prose "Sıradaki adım" bölümü BİTMİŞ bir adımı göstermemeli ──────────
// Makine-okunur alan doğruyken prose bölümü bayat kalabiliyor; bağlamı sıfırlanmış
// agent önce prose'u okur ve bitmiş işe yönlendirilir (doğrulama agent'ı buldu).
{
  const bolum = durum.match(/^## Sıradaki adım\n([\s\S]*?)(?=^## )/m)?.[1] ?? ''
  const ilk = bolum.match(/`(\d+\.[A-Za-z0-9.]+)`/)?.[1] ?? null
  if (ilk !== null && adimlar.get(ilk) === true) {
    errors.push(`"Sıradaki adım" bölümünün İLK adımı '${ilk}' ama o adım TİKLİ — bayat metin`)
  }
}

// ── 4. son_kanit boş olamaz ──────────────────────────────────────────────────
const kanit = alan('son_kanit')
if (kanit === null || kanit.replace(/["']/g, '').trim().length < 10) {
  errors.push('son_kanit boş veya anlamsız — kanıtsız "bitti" yok (R-70)')
}

if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} DURUM tutarsızlığı`)
  process.exit(1)
}

const tikli = [...adimlar.values()].filter(Boolean).length
console.log(
  `  aktif faz ${aktifFaz} · sıradaki ${siradaki} (tiksiz) · ${tikli}/${adimlar.size} adım tikli · tablo tutarlı`
)
