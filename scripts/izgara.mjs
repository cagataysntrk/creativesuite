#!/usr/bin/env node
// `just izgara` — AİLE SINAVI: kataloğun her şablonundan bir kapak, tek sayfada.
//
// ⚠ ⚠ **BU BETİK BİR KAPI DEĞİL, BİR MERCEK.** Kapı `aile-tutarliligi.test.ts`te ve o
// paleti, kromu ve okuma eşiğini ÖLÇÜYOR. Ama ölçülemeyen bir şey kalıyor: on tasarım
// yan yana konduğunda *tek bir hesaba mı ait görünüyor*. O soruyu ancak bir insan
// cevaplıyor ve cevaplayabilmesi için önce BAKMASI gerekiyor.
//
// ⚠ Çıktı `derived/` altında: türetilmiş, yeniden üretilebilir, git'te değil (Yasa 11).
// `docs/`e yazılmıyor — üretilmiş bir ikili belge, belge değil çıktıdır.
//
// ⚠ ⚠ **GÖRSELLER GERÇEK — ve bu bir DÜZELTME.** İlk sürüm görselli şablonları yer
// tutucuyla çiziyordu ("sınavın konusu kompozisyon"). Izgaraya BAKINCA görüldü ki üç
// şablon (`sahne` · `memphis` · `donen`) o hâlde YARGILANAMIYOR: kadrajın yarısı kesikli
// bir kutu oluyor ve "bu tasarım aileye ait mi" sorusu cevapsız kalıyor. Sınav aletinin
// ölçtüğü şeyi göstermemesi, aletin kusurudur.
// ⚠ Kaynak `derived/runs` altındaki GERÇEK kesik özneler; yoksa yer tutucuya düşüyor ve
// bu SÖYLENİYOR — sessiz bir yedek, sınavı yine yargılanamaz kılardı.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const CIKTI = join(REPO, 'derived/izgara')

const {
  ORNEKLER,
  fontCss,
  logoVarliklari,
  knockoutOlcumu,
  metinMaskesi,
  panoramaHtml,
  panoramaDenetle,
  puntoOlcumu,
  varlikZinciri,
  zincirdenCoz,
} = await import(join(REPO, 'packages/render/dist/index.js'))
const { withPage } = await import(join(REPO, 'packages/render/dist/browser.js'))

const MARKA = process.env['SUITE_BRAND'] ?? 'brd_upcytech'
const tokenCss = readFileSync(join(REPO, `brand/${MARKA}/derived-tokens/tokens.css`), 'utf8')
const f = zincirdenCoz(varlikZinciri(join(REPO, 'brand'), MARKA, 'fonts'), (d) => fontCss(d))
if (!f.sonuc.ok) {
  console.log(`✗ marka fontu eksik: ${f.sonuc.eksikler.map((e) => e.dosya).join(', ')}`)
  process.exit(1)
}
const l = zincirdenCoz(varlikZinciri(join(REPO, 'brand'), MARKA, 'logo'), (d) => logoVarliklari(d))

const DAMGA = {
  brandId: MARKA,
  eraId: readFileSync(join(REPO, `brand/${MARKA}/current`), 'utf8').trim(),
  kitVersion: 'izgara',
  definitionDigest: 'sha256:izgara',
  contextManifest: 'izgara',
  sourceRunId: 'izgara',
}

mkdirSync(CIKTI, { recursive: true })

// ── gerçek kesik özneler: en son koşudan ────────────────────────────────────
const { readdirSync } = await import('node:fs')
const gorselHavuzu = (() => {
  const kok = join(REPO, 'derived/runs')
  let kosular
  try {
    kosular = readdirSync(kok)
      .filter((a) => a.startsWith('run_'))
      .sort()
      .reverse()
  } catch {
    return []
  }
  for (const k of kosular) {
    try {
      const dosyalar = readdirSync(join(kok, k))
        .filter((a) => /^gorsel-\d+\.png$/.test(a))
        .sort()
      if (dosyalar.length >= 2) return dosyalar.map((a) => join(kok, k, a))
    } catch {
      continue
    }
  }
  return []
})()
const veriUri = (yol) => `data:image/png;base64,${readFileSync(yol).toString('base64')}`
console.log(
  gorselHavuzu.length === 0
    ? '  ⚠ gerçek kesik özne bulunamadı — görselli şablonlar YER TUTUCU ile çizilecek'
    : `  · ${String(gorselHavuzu.length)} gerçek kesik özne kullanılıyor — ` +
        `ÖDÜNÇ: son koşudan alınıp on şablona sırayla dağıtılıyor`
)
// ⚠ ⚠ **GÖRSELE DAİR KUSURLAR ÖDÜNÇ ÖZNEDE ÖLÇÜLÜYOR.** Havuz son koşudan geliyor ve
// `i % havuz.length` ile dönüyor: `memphis` başka bir şablonun brief'iyle üretilmiş bir
// fotoğrafı kendi BEYAZ zemininde taşıyabiliyor. Ölçüldü: `gorsel-zemine-karismasin`
// p90 farkı **119**, eşik 120 — bir puan, ve o fark ödünç fotoğrafın açıklığından.
// Üretimde her şablon KENDİ brief'inden görsel alıyor (`memphis`: koyu zeminde kişi).
// Mercek bunu söylemezse, şablonun kusuru sanılır ve yanlış yer düzeltilir.
const GORSEL_KUSURU = new Set(['gorsel-zemine-karismasin', 'metin-gorsel-cakisiyor'])
const kapaklar = []
let toplamKusur = 0

for (const [id, o] of Object.entries(ORNEKLER)) {
  const doc = {
    ...o,
    tokenCss,
    fontCss: f.sonuc.css,
    stamp: DAMGA,
    ...(l.sonuc.ok ? { logo: l.sonuc.varliklar } : {}),
    ...(gorselHavuzu.length === 0
      ? {}
      : {
          gorseller: o.gorseller.map((g, i) => ({
            ...g,
            src: veriUri(gorselHavuzu[i % gorselHavuzu.length]),
          })),
        }),
  }
  // ⚠ Kusur sayısı da basılıyor: temiz görünen bir ızgara, kusursuz bir ızgara demek
  // değil. İkisi birlikte okunur.
  const d = await panoramaDenetle(doc)
  const kusur = d.ok ? d.value.filter((k) => k.tur !== 'yer-tutucu') : null
  if (kusur === null) {
    console.log(`✗ ${id}: denetim koşamadı — ${JSON.stringify(d.error)}`)
    process.exit(1)
  }
  toplamKusur += kusur.length

  const yol = join(CIKTI, `${id}.png`)
  const r = await withPage(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    // ⚠ ⚠ **MERCEK ÜRETİMİN ÇİZDİĞİNİ GÖSTERMEK ZORUNDA.** Bu ızgara hiçbir sayfa adımını
    // koşmuyordu: punto oturmamış, knockout uygulanmamış, metin kutusu maskesi
    // konmamış bir düzeni gösteriyordu — yani **yayınlanmayan** bir aileyi. Aynı sınıf
    // hata bu fazda kapılarda ve denetimde de ölçüldü; ızgara sonuncusuydu.
    await page.evaluate(puntoOlcumu(doc))
    await page.evaluate(knockoutOlcumu())
    await page.evaluate(metinMaskesi())
    await page.screenshot({ path: yol })
    return true
  })
  if (!r.ok) {
    console.log(`✗ ${id}: çizilemedi — ${JSON.stringify(r.error)}`)
    process.exit(1)
  }
  kapaklar.push({ id, yol, kusur: kusur.length, slayt: doc.kartlar.length })
  const isaret = kusur.length === 0 ? '✓' : '✗'
  console.log(
    `  ${isaret} ${id.padEnd(15)} ${String(doc.kartlar.length)} slayt · ${String(kusur.length)} kusur`
  )
  for (const k of kusur)
    console.log(
      `      · ${k.tur} ${k.aciklama}` +
        (GORSEL_KUSURU.has(k.tur) && gorselHavuzu.length > 0
          ? `\n        ⚠ ÖDÜNÇ özneyle ölçüldü — üretimde şablon KENDİ brief'inden görsel alır`
          : '')
    )
}

// ⚠ Tek sayfa HTML: ızgarayı bir tarayıcıda açıp BAKMAK için. PNG'leri birleştirmek bir
// görüntü kütüphanesi bağımlılığı isterdi (R-75) ve tarayıcı zaten elimizde.
const html =
  '<!doctype html><html lang="tr"><meta charset="utf-8"><title>Aile sınavı</title>' +
  '<style>body{margin:0;background:#181818;font-family:system-ui;color:#eee}' +
  'h1{font-size:16px;font-weight:600;padding:14px 18px;margin:0;letter-spacing:.08em}' +
  '.izgara{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:0 2px 2px}' +
  'figure{margin:0;position:relative}img{width:100%;display:block}' +
  // ⚠ ⚠ **KÜNYE ÜSTTE, ALTTA DEĞİL — ve bunu ızgaraya BAKINCA gördüm.** Alttaki şerit
  // slaydın kendi RAYINI örtüyordu; yani sınavın bakacağı ögeyi tam da sınav sayfası
  // gizliyordu. Ölçüm aleti ölçtüğü şeyi kapatıyorsa alet değildir.
  'figcaption{position:absolute;left:0;top:0;right:0;font-size:11px;padding:4px 6px;' +
  'background:rgba(0,0,0,.55);letter-spacing:.06em}</style>' +
  `<h1>AİLE SINAVI · ${String(kapaklar.length)} şablon · ${String(toplamKusur)} kusur · ${MARKA}</h1>` +
  '<div class="izgara">' +
  kapaklar
    .map(
      (k) =>
        `<figure><img src="${k.id}.png" alt="${k.id}">` +
        `<figcaption>${k.id} · ${String(k.slayt)} slayt${k.kusur === 0 ? '' : ` · ${String(k.kusur)} kusur`}</figcaption></figure>`
    )
    .join('') +
  '</div>'
writeFileSync(join(CIKTI, 'index.html'), html)

console.log(
  `\n${String(kapaklar.length)} kapak · ${String(toplamKusur)} kusur → derived/izgara/index.html`
)
if (toplamKusur > 0) process.exit(1)
