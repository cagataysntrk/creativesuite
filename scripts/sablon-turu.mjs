#!/usr/bin/env node
// Şablon turu — AYNI METİN, yedi tasarım (FAZ-13 şablon genelleştirme).
//
// ⚠ ⚠ **Deneyin geçerliliği aynı metne bağlı.** Yedi koşu kendi metnini üretseydi
// karşılaştırılan şey tasarım değil METİN olurdu. Metin bir kez üretiliyor, sonra
// `--metin` kısıtıyla yedi aileye veriliyor; `metin-uret` sağlayıcıyı hiç çağırmıyor
// ve defterde `verilen-metin` olarak duruyor.
//
// ⚠ **Hat GERÇEKTEN koşuyor** — render, yargı, kalite ve insan kapısı dahil. Yerel bir
// render betiği yazmak daha hızlı olurdu ama sınanan şey hattın kendisi: aile seçimi
// kısıttan geliyor mu, plan gerekçesini yazıyor mu, defter puanları tutuyor mu.
//
// ⚠ `content/` TÜRETİLMİŞ bir görünüm (§3.5): silinir, yeniden kurulur, gitignore'lu.
// Varlığın kanıtı `derived/runs/<id>/manifest.json`da; burası yalnız insanın bakacağı yer.

import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '..')
const C = await import(join(REPO, 'packages/contracts/dist/index.js'))

const metinYolu = process.argv[2]
const konu = process.argv[3]
if (metinYolu === undefined || konu === undefined) {
  console.log('kullanım: node scripts/sablon-turu.mjs <metin-dosyasi> "<konu>"')
  process.exit(1)
}
const metin = readFileSync(metinYolu, 'utf8').trim()

// ⚠ `akici` DIŞARIDA: `temel`in süslü hâli ve çeşitlilik defterinde uzaklığı 0,33.
// Yedi tasarım isteniyorsa yedisi de birbirinden ayrışmalı — sekizinci bir satır,
// yedinci bir tasarım değildir.
const AILELER = ['temel', 'memphis', 'gece', 'donen', 'editoryal', 'kesit', 'izgara']

const slug = konu
  .toLocaleLowerCase('tr')
  .replace(/[^a-zçğıöşü0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 48)

const kok = join(REPO, 'content', slug)
mkdirSync(kok, { recursive: true })
writeFileSync(join(kok, 'metin.md'), `# ${konu}\n\n${metin}\n`)

const oncekiKosular = new Set(readdirSync(join(REPO, 'derived/runs')))
const ozet = [`# ${konu}`, '', 'Aynı metin, yedi tasarım. Hat her aile için uçtan uca koştu.', '']

for (const aile of AILELER) {
  const profil = C.AILELER.find((a) => a.id === aile)
  console.log(`\n── ${aile} ─────────────────────────────`)
  try {
    execFileSync('just', ['uret', 'instagram-post', konu, '--aile', aile, '--metin', metin], {
      cwd: REPO,
      stdio: 'inherit',
      timeout: 20 * 60_000,
    })
  } catch {
    // ⚠ İnsan onay kapısı çıkış kodu 1 veriyor ve bu BEKLENEN son: hat orada durmalı.
    // Hatayı yutmuyoruz, aşağıda manifest'ten gerçek durumu okuyoruz.
  }
  const yeni = readdirSync(join(REPO, 'derived/runs')).filter((d) => !oncekiKosular.has(d))
  const kosu = yeni.sort().at(-1)
  if (kosu === undefined) {
    console.log(`  ✗ ${aile}: koşu dizini bulunamadı`)
    continue
  }
  oncekiKosular.add(kosu)
  const dizin = join(kok, aile)
  mkdirSync(dizin, { recursive: true })
  const kaynak = join(REPO, 'derived/runs', kosu)
  let sayi = 0
  for (const f of readdirSync(kaynak)
    .filter((x) => x.endsWith('.png'))
    .sort()) {
    copyFileSync(join(kaynak, f), join(dizin, f))
    sayi += 1
  }
  const m = JSON.parse(readFileSync(join(kaynak, 'manifest.json'), 'utf8'))
  const adim = (id) => (m.steps ?? []).find((s) => s.stepId === id)
  const plan = (adim('kompozit')?.output ?? {}).tasarimPlani ?? {}
  const yargi = adim('tasarim-yargi')?.output ?? {}
  ozet.push(
    `## ${aile} — ${profil?.ad ?? ''}`,
    '',
    `- koşu: \`${kosu}\` · slayt: ${sayi}`,
    `- plan ailesi: **${plan.aile?.deger ?? '—'}** · panorama: ${plan.panorama?.deger ?? '—'}`,
    `- estetik puan: **${yargi.toplam ?? '—'}**/5`,
    ''
  )
  console.log(`  ✓ ${aile}: ${sayi} slayt → content/${slug}/${aile}`)
}

writeFileSync(join(kok, 'OZET.md'), ozet.join('\n'))
console.log(`\n✓ content/${slug} hazır — ${AILELER.length} tasarım`)
