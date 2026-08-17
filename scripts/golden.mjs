#!/usr/bin/env node
// `just golden` — tipografi metriklerini ÖLÇER ve dondurulmuş temelle karşılaştırır
// (§7.2, §15 · R-31 · FAZ-3.2).
//
// Temel yoksa YAZILIR ve bunun bir doğrulama OLMADIĞI açıkça söylenir. Sessizce
// "geçti" demek, ilk koşuda her şeyi onaylamak olurdu.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { measureGolden, diffMetrics, formatDiff, PROOF_TEXT } = await import(
  join(REPO, 'packages/render/dist/index.js')
)

const GOLDEN_DIR = join(REPO, 'test/golden')
mkdirSync(GOLDEN_DIR, { recursive: true })

// Her şablon boyutunda ölçülür: aynı font farklı puntoda farklı hinting alır ve
// fallback yalnız bir boyutta görünebilir.
const BOYUTLAR = [
  { ad: 'post-4x5', width: 1080, height: 1350 },
  { ad: 'story-9x16', width: 1080, height: 1920 },
  { ad: 'linkedin-4x5', width: 1200, height: 1500 },
  // Deck boyutu (FAZ-6.1): 16:9 yatay. Aynı font farklı puntoda farklı hinting alır ve
  // fallback yalnız bir boyutta görünebilir — deck ölçüsü ölçülmezse deck'te sessizce
  // bozuk çıkabilirdi.
  { ad: 'deck-16x9', width: 1600, height: 900 },
]

const MARKA = 'brd_upcytech'

// Dönem `brand/<id>/current`tan OKUNUR, gömülmez (D-167).
//
// 2026-08-15'e kadar burada `'era_imalat_2026'` yazıyordu; dönemin gerçek adı
// `imalat-2026`. Altı corpus kaydı da aynı yanlış dizeyi taşıyordu, yani retrieval
// yüklemi hiçbirini GÖRMÜYORDU — ve hepsi `draft` olduğu için bu maskeliydi. Onay
// verildiği gün kayıtlar `active` olacak ve HÂLÂ görünmeyecekti.
const AKTIF_DONEM = readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim()
const tokenYolu = join(REPO, `brand/${MARKA}/derived-tokens/tokens.css`)
if (!existsSync(tokenYolu)) {
  console.log(`✗ marka token'ları yok: ${tokenYolu}`)
  process.exit(1)
}
const tokenCss = readFileSync(tokenYolu, 'utf8')

const damga = {
  brandId: MARKA,
  eraId: AKTIF_DONEM,
  kitVersion: 'golden',
  definitionDigest: 'sha256:golden',
  contextManifest: 'golden',
  sourceRunId: 'run_golden',
}

let hata = false
let yeniTemel = 0
let dogrulanan = 0

for (const b of BOYUTLAR) {
  const doc = {
    kind: 'post',
    width: b.width,
    height: b.height,
    tokenCss,
    stamp: damga,
    blocks: [
      { type: 'heading', text: PROOF_TEXT, level: 1 },
      { type: 'body', text: `${PROOF_TEXT} · İstanbul'da yazılım çözümleri` },
    ],
  }

  const olcum = await measureGolden(doc)
  if (!olcum.ok) {
    console.log(`✗ ${b.ad}: ölçüm başarısız — ${olcum.error.message}`)
    hata = true
    continue
  }

  const yol = join(GOLDEN_DIR, `${b.ad}.metrics.json`)
  const temel = existsSync(yol) ? JSON.parse(readFileSync(yol, 'utf8')) : null
  const farklar = diffMetrics(temel, olcum.value)

  if (farklar.length > 0) {
    console.log(`✗ ${b.ad}:`)
    console.log(formatDiff(farklar))
    hata = true
    continue
  }

  if (temel === null) {
    writeFileSync(yol, `${JSON.stringify(olcum.value, null, 2)}\n`)
    yeniTemel++
    const aile = olcum.value.blocks[0]?.fontFamily ?? '?'
    console.log(`  ${b.ad}: TEMEL YAZILDI (${aile}) — bu bir doğrulama DEĞİL`)
  } else {
    dogrulanan++
    // ⚠ `notdef 0` SABİT DİZE değil, ÖLÇÜLEN değer. Sabit yazmak, kanıt dizesinin
    // kendini yazması olurdu — doğrulama agent'ı yakaladı (D-155).
    console.log(
      `  ${b.ad}: ✓ ${olcum.value.blocks.length} blok · notdef ${olcum.value.notdefCount} · ` +
        `metrik eşleşiyor`
    )
  }
}

if (hata) {
  console.log('')
  console.log('  Metrik değişti ya da glyph eksik. Sessiz font fallback, bu sistemin')
  console.log('  bozuk varlık üretmesinin en muhtemel yoludur (§7.2).')
  process.exit(1)
}

if (yeniTemel > 0) {
  console.log('')
  console.log(`  ⚠ ${yeniTemel} temel YENİ yazıldı — sonraki koşu onlara karşı doğrular.`)
  console.log('  Temel MARKA fontuyla alındı (D-252). Font değişirse temel yenilenir —')
  console.log('  ama önce yeni temelin gerçekten marka fontu olduğu ve notdef=0 olduğu')
  console.log('  DOĞRULANIR: körlemesine yenilenen bir golden, sessiz fallback mühürler.')
}
console.log(`  ${dogrulanan}/${BOYUTLAR.length} boyut doğrulandı · kanıt dizesi: ${PROOF_TEXT}`)
