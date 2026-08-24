#!/usr/bin/env node
// Marka fontlarını GETİRİR — dizayn sisteminin adlandırdığı dört aile (FAZ-18.1).
//
// ⚠ ⚠ **FONT DOSYALARI DEPODA DURUYOR, ÇALIŞMA ANINDA İNDİRİLMİYOR.** Render sırasında
// ağa çıkan bir font, ağsız bir kurtarma diskinde SESSİZCE sistem fontuna düşer ve
// çıktı yanlış fontla üretilir (§16 · Yasa 12). Bu betik yalnız KURULUM anında koşar;
// getirdiği dosyalar `brand/<id>/fonts/` altında git'e girer.
//
// ⚠ **latin VE latin-ext ayrı ayrı** — `ğ ş İ ı Ğ Ş` latin alt kümesinde YOK. Tek dosyaya
// güvenmek `İstanbul`u `?stanbul` yapan sessiz bir düşüşe kapı açar.
//
// ⚠ Dört aile de SIL Open Font License: gömme ve ticari kullanım serbest. Lisans metni
// `brand/<id>/fonts/OFL.txt`te ve o dosya İZLENİR.
//
// Kaynak: dizayn sistemi `DESIGN.md` §7 — aileler ve eksenleri orada ölçülerek seçildi
// (Türkçe kapsaması WOFF2 ikilisi çözülerek doğrulanmış, `Ş`≠`Ș` ayrımı dahil).

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const HEDEF = join(REPO, 'brand/brd_upcytech/fonts')

/**
 * Aileler ve eksenleri. **Kapalı liste** — beşinci bir aile bir KARAR gerektirir
 * (D-nn), bir satır değil. Dizayn sistemi dört aileyi bile "briefin izin verdiğinden
 * bir fazla" diye kaydediyor ve Montserrat'ı sınırlandırıyor.
 */
const AILELER = [
  // ⚠ ⚠ **DÖRT AİLE → ALTI YÜZ (FAZ-19.5) ve hepsi ÖLÇÜLEREK seçildi.**
  // `scripts/font-denetim.mjs` her adayın TTF'ini indirip `cmap`te 15 Türkçe kod
  // noktasını, `Ş`(U+015E) ≠ `Ș`(U+0218) ayrımını ve `GSUB`ta `latn/TRK` dil sistemini
  // doğruluyor. Ölçüm `docs/kurallar/OLCUMLER.md`'de; altısı da 15/15 · Ş≠Ș · TRK VAR.
  //
  // ⚠ ⚠ **IBM PLEX AİLESİNİN TAMAMI ELENDİ ve sanayi işi için en bariz tercihti.**
  // Sans da Mono da `latn/TRK` TAŞIMIYOR — Inter'i eleyen kapının aynısı (D-317).
  // Denenmesin diye buraya yazılıyor: eleme ölçüldü, tahmin değil.
  { ad: 'Archivo', sorgu: 'Archivo:wdth,wght@62..125,100..900' },
  { ad: 'MartianMono', sorgu: 'Martian+Mono:wdth,wght@75..112.5,100..800' },
  { ad: 'Literata', sorgu: 'Literata:opsz,wght@7..72,200..900' },
  // ⚠ **`Big Shoulders`, `Big Shoulders Stencil` ve `Young Serif` ÖLÇÜLDÜ, GEÇTİ, YOK.**
  // Reçete ikisini `memphis` aksanı ve `alinti` anıtsal display'i için istiyor;
  // o çağrı yerleri henüz yazılmadı. Çağıranı olmayan bir dosyayı depoya koymak,
  // bu depoda on iki kez tekrarlanan hatanın font hâli olurdu. Çağrı yeri doğduğu
  // gün iki satır: ölçümleri `docs/kurallar/OLCUMLER.md`'de duruyor.
]

// ⚠ Modern tarayıcı UA'sı ZORUNLU: Google Fonts eski UA'ya `ttf` döndürüyor ve o dosya
// üç kat büyük. İstenen şey woff2 ve onu ancak UA söylüyor.
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/** CSS'i alt küme bloklarına ayırır: `/* latin *​/` yorumları sınırları veriyor. */
const bloklar = (css) => {
  const out = {}
  const parcalar = css.split('/*').slice(1)
  for (const p of parcalar) {
    const ad = p.slice(0, p.indexOf('*/')).trim()
    const url = /url\((https:\/\/[^)]+\.woff2)\)/.exec(p)?.[1]
    if (url !== undefined) out[ad] = url
  }
  return out
}

const getir = async (url, bin = false) => {
  const r = await fetch(url, { headers: { 'user-agent': UA } })
  if (!r.ok) throw new Error(`${String(r.status)} ${url}`)
  return bin ? Buffer.from(await r.arrayBuffer()) : r.text()
}

mkdirSync(HEDEF, { recursive: true })
let yazilan = 0
for (const aile of AILELER) {
  const css = await getir(`https://fonts.googleapis.com/css2?family=${aile.sorgu}&display=swap`)
  const b = bloklar(css)
  for (const [altKume, sonEk] of [
    ['latin', 'latin'],
    ['latin-ext', 'latin-ext'],
  ]) {
    const url = b[altKume]
    if (url === undefined) {
      console.log(`  ✗ ${aile.ad} · ${altKume} bloğu YOK — Google Fonts biçimi değişmiş olabilir`)
      process.exitCode = 1
      continue
    }
    const dosya = join(HEDEF, `${aile.ad}-${sonEk}.woff2`)
    // ⚠ Var olan dosyanın üstüne yazılıyor: sürüm yükseltmesi bu betiğin işi. Ama
    // bayt aynıysa dokunulmuyor — `git status`u boşuna kirletmek, gerçek değişikliği
    // görünmez yapar.
    const bayt = await getir(url, true)
    const ayni = existsSync(dosya) && Buffer.compare(await readIfExists(dosya), bayt) === 0
    if (!ayni) {
      writeFileSync(dosya, bayt)
      yazilan += 1
    }
    console.log(
      `  ${ayni ? '·' : '✓'} ${aile.ad}-${sonEk}.woff2  ${String(Math.round(bayt.length / 1024))} KB`
    )
  }
}
console.log(`\n${String(yazilan)} dosya yazıldı → brand/brd_upcytech/fonts/`)

async function readIfExists(p) {
  const { readFileSync } = await import('node:fs')
  return readFileSync(p)
}
