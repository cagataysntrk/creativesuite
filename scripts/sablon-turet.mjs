#!/usr/bin/env node
// `just sablon-turet` — referans görselden şablon parametresi ÖNERİR (§7.1 · FAZ-10.6).
//
// ⚠⚠ **ÇIKTI HTML DEĞİL, VERİ.** Bu, bu adımın tek gerçek kısıtı ve alandaki sekiz
// agent destekli karosel aracının hepsi tersini yapıyor: referanstan HTML üretiyorlar.
// O an üç şey birden ölür — golden tipografi metriği bir belge modeline karşı ölçülüyor,
// serbest HTML'e karşı değil; `COMPOSE`/`RENDER` sınırı silinir; ve Türkçe garantisi
// font yükleme yolunun TEK olmasından geliyor, her slayt kendi CSS'ini taşırsa o yol
// biter. Veri çıktısı aynı referansın her zaman aynı grameri vermesini de sağlıyor.
//
// ⚠ **ÖNERİR, UYGULAMAZ** (R-14 · D-31). Bir JSON yazıyor; onu `sablon-parametre.ts`e
// taşımak bir commit'tir. Otomatik uygulansaydı bir referans görseli, hiçbir insan
// bakmadan tüm markanın tipografisini değiştirebilirdi.
//
// **Ölçülemeyen ölçülmüş gibi yazılmıyor.** Punto tavanı ve tip ölçeği bu betikten
// ÇIKMIYOR ve sebebi raporda yazılı: onlar dilden geliyor, referanstan değil.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
const { withPage, VARSAYILAN } = await import(join(REPO, 'packages/render/dist/index.js'))

const KAYNAK = join(REPO, 'docs/research/referans/karosel-sablon.png')
const CIKTI_DIZIN = join(REPO, 'brand/brd_upcytech/sablonlar')
const b64 = readFileSync(KAYNAK).toString('base64')

// Referansın alan renkleri — 10.2'de ölçülen baskın kümeler.
const ALAN = [
  [224, 168, 40],
  [255, 255, 255],
  [26, 26, 26],
]

const script = `(async () => {
  const img = new Image()
  img.src = "data:image/png;base64,${b64}"
  await img.decode()
  const c = document.createElement("canvas")
  c.width = img.naturalWidth; c.height = img.naturalHeight
  const ctx = c.getContext("2d")
  ctx.drawImage(img, 0, 0)
  const D = ctx.getImageData(0, 0, c.width, c.height).data
  const W = c.width
  const px = (a, b) => { const k = (b * W + a) * 4; return [D[k], D[k+1], D[k+2]] }
  const uz = (a, b) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2])
  const ALAN = ${JSON.stringify(ALAN)}
  const sinif = (p) => {
    let en = 1e9, k = -1
    ALAN.forEach((a, j) => { const d = uz(p, a); if (d < en) { en = d; k = j } })
    return en < 150 ? k : -1
  }

  // ── alan geçişleri ────────────────────────────────────────────────────────
  // Her satırda sınıf değişim noktaları. **Metin geçişleri elenmiyor** — bunun yerine
  // yalnız UZUN koşular sayılıyor: bir harf 2-3 piksel sürer, bir renk alanı yüzlerce.
  // İlk denemede "ilk renk sıçraması" aranıyordu ve metin kenarlarını yakalıyordu.
  const ASGARI_KOSU = 40
  const gecisler = []
  for (let y = 95; y < 245; y += 3) {
    let bas = 14, onceki = sinif(px(14, y))
    for (let X = 15; X < 783; X++) {
      const k = sinif(px(X, y))
      if (k === onceki) continue
      if (X - bas >= ASGARI_KOSU && onceki !== -1 && k !== -1) gecisler.push({ y, x: X, from: onceki, to: k })
      bas = X; onceki = k
    }
  }
  return { W, H: c.height, gecisler }
})()`

const r = await withPage(async (page) => page.evaluate(script))
if (!r.ok) {
  console.error('✗ ölçüm başarısız:', r.error)
  process.exit(1)
}

const { gecisler } = r.value

// ⚠ **Yetersiz veri SESSİZCE kabul edilmiyor.** Az sayıda geçişten türetilen bir bant,
// ölçüm gibi görünen bir tahmindir.
if (gecisler.length < 30) {
  console.error(`✗ yalnız ${gecisler.length} alan geçişi bulundu — bant türetilemez`)
  process.exit(1)
}

// Slayt sınırları 10.2'de belirlendi: sol çift 13–309 · merkez 312–490 · sağ çift 490–783.
// ⚠ **Yan slaytların BİREYSEL sınırı ölçülemedi** (10.2: yatay boşluk sinyali yok, 0/800
// boş sütun). Bu yüzden bant, slayt genişliğine değil BÖLGE genişliğine göre veriliyor
// ve belirsizlik raporda yazılı. Kesinmiş gibi yazmak, ölçümü uydurma yapardı.
const BOLGELER = [
  { ad: 'sol çift', x0: 13, x1: 309 },
  { ad: 'merkez', x0: 312, x1: 490 },
  { ad: 'sağ çift', x0: 490, x1: 783 },
]

const satirlar = []
const S = (x) => satirlar.push(x)
S('# Referanstan türetilen şablon parametreleri')
S('')
S('> **ÜRETİLMİŞ** — `node scripts/sablon-turet.mjs` (FAZ-10.6). ÖNERİDİR, uygulanmadı.')
S('')
S(`**Kaynak:** \`docs/research/referans/karosel-sablon.png\` · ${gecisler.length} alan geçişi`)
S('')
S('## Ölçülen: alan sınırı bandı')
S('')
S('| Bölge | Geçiş | En sol | Ortanca | En sağ |')
S('|---|---|---|---|---|')

const oneri = {}
for (const b of BOLGELER) {
  const g = gecisler.filter((x) => x.x >= b.x0 && x.x <= b.x1)
  if (g.length < 8) {
    S(`| ${b.ad} | ${g.length} | — | — | — |`)
    continue
  }
  const yuzdeler = g.map((x) => (100 * (x.x - b.x0)) / (b.x1 - b.x0)).sort((p, q) => p - q)
  const al = (f) =>
    +(yuzdeler[Math.min(yuzdeler.length - 1, Math.floor(f * yuzdeler.length))] ?? 0).toFixed(1)
  const kayit = { gecis: g.length, min: al(0.05), ortanca: al(0.5), max: al(0.95) }
  oneri[b.ad] = kayit
  S(`| ${b.ad} | ${kayit.gecis} | %${kayit.min} | %${kayit.ortanca} | %${kayit.max} |`)
}

const tum = Object.values(oneri)
const hamMin = tum.length > 0 ? Math.round(Math.min(...tum.map((x) => x.min))) : null
const hamMax = tum.length > 0 ? Math.round(Math.max(...tum.map((x) => x.max))) : null

// ⚠ **MAKULLÜK KAPISI.** Bir eğri bandının anlamı, sınırın DAR bir aralıkta salınması.
// %2–97 gibi bir aralık bant değil, "her yerde" demek — ölçüm slayt sınırlarını ve iki
// ayrı slaydın eğrilerini birbirine karıştırmış olur. Böyle bir sayıyı rapora yazmak,
// bu fazda altı kez tekrarlanan hatanın yedincisi olurdu: **sayı üretiyor olmak, ölçüyor
// olmak değildir.** Eşik 40 puan: bandın kendi genliği (±5) ve slayt farkı payıyla bile
// gerçek bir bant bunu aşamaz.
const BANT_TAVANI = 40
const gecerli = hamMin !== null && hamMax !== null && hamMax - hamMin <= BANT_TAVANI
const bantMin = gecerli ? hamMin : null
const bantMax = gecerli ? hamMax : null

S('')
S('## Öneri ve yürürlükteki değer')
S('')
S('| Parametre | Referanstan | Yürürlükte | Fark neden |')
S('|---|---|---|---|')
S(
  `| \`bantMin\` | %${bantMin ?? '—'} | %${VARSAYILAN.bantMin} | ` +
    'Türkçe metin sütunu %62 olmak zorunda; referans İngilizce ve daha dar sütunla ' +
    'idare ediyor |'
)
S(`| \`bantMax\` | %${bantMax ?? '—'} | %${VARSAYILAN.bantMax} | aynı |`)
S('')
if (!gecerli) {
  S(`⛔ **BANT TÜRETİLEMEDİ.** Ham aralık %${hamMin}–${hamMax}, genişliği`)
  S(`${(hamMax ?? 0) - (hamMin ?? 0)} puan — makullük tavanı ${BANT_TAVANI}. Bir eğri`)
  S('bandının anlamı sınırın DAR bir aralıkta salınmasıdır; bu genişlik "her yerde"')
  S("demek. Sebep 10.2'de ölçülmüştü: yan slaytlar piksel piksel bitişik (tam zemin")
  S('renginde **0/800** sütun), yani bölge ≠ slayt. Ölçüm iki slaydın eğrilerini ve')
  S('slayt kenarlarını birbirine karıştırıyor.')
  S('')
  S('**Sayı yazılmadı.** Yazılsaydı kaynağı unutulduğunda ölçüm sanılırdı — bu fazda')
  S('aynı hata altı kez tekrarladı ve her seferinde ancak kasten kontrol edince çıktı.')
} else {
  S('**Bant referanstan BİREBİR alınmadı ve bu bilinçli.** Referansın bandı daha solda;')
  S('birebir kopyalansaydı metin sütunu daralır ve `taşıyabileceğimizin` doğrudan')
  S('eğrinin içine girerdi. Referans bir ÖRNEK, bir tavan değil.')
}
S('')
S('## Referanstan TÜRETİLEMEYEN — ve neden')
S('')
S('**Punto tavanı ve tip ölçeği:** dilden geliyor, referanstan değil. Referansın')
S('`Showcase`ı 8 karakter, bizim `taşıyabileceğimizin` 19. İngilizce bir görselden')
S('ölçülen punto Türkçe metinde taşar (`docs/referans/tip-olcegi.md`).')
S('')
S("**Yan slaytların bireysel sınırı:** 10.2'de ölçüldü ve REDDEDİLDİ — 800×320'de tam")
S('zemin renginde **0/800** sütun var, yani yan slaytlar piksel piksel bitişik. Bant bu')
S('yüzden slayt genişliğine değil BÖLGE genişliğine göre veriliyor; belirsizlik ±%5.')

mkdirSync(CIKTI_DIZIN, { recursive: true })
const jsonYol = join(CIKTI_DIZIN, 'referans-olcum.json')
writeFileSync(
  jsonYol,
  JSON.stringify({ kaynak: 'karosel-sablon.png', bolgeler: oneri, bantMin, bantMax }, null, 2) +
    '\n'
)
const mdYol = join(REPO, 'docs/referans/sablon-turetme.md')
writeFileSync(mdYol, satirlar.join('\n') + '\n')

console.log(`✓ ${gecisler.length} alan geçişi ölçüldü`)
for (const [ad, k] of Object.entries(oneri)) {
  console.log(`  ${ad.padEnd(10)} %${k.min} … %${k.ortanca} … %${k.max}  (${k.gecis} geçiş)`)
}
console.log(
  gecerli
    ? `  → referans bandı %${bantMin}–${bantMax} · yürürlükte %${VARSAYILAN.bantMin}–${VARSAYILAN.bantMax}`
    : `  ⛔ bant TÜRETİLEMEDİ: ham aralık %${hamMin}–${hamMax} (${(hamMax ?? 0) - (hamMin ?? 0)} puan) ` +
        `makullük tavanı ${BANT_TAVANI}'ı aşıyor — bölge ≠ slayt, ölçüm karışıyor`
)
console.log(`  öneri: ${jsonYol.replace(REPO + '/', '')} · rapor: ${mdYol.replace(REPO + '/', '')}`)
console.log("  ⚠ UYGULANMADI — parametreyi taşımak bir commit'tir (R-14).")
