#!/usr/bin/env node
// `just tip-olcegi` — puntoyu EN UZUN TÜRKÇE KELİMEDEN türetir (§7.2 · FAZ-10.2b · R-23).
//
// **Çözülen kusur:** kapak metni eğri sınırını kesiyordu ve sebep sanıldığı gibi kutu
// genişliği DEĞİLDİ. `guvenliMetinYuzdesi` kutuyu %36'ya kilitliyor, ama
// `taşıyabileceğimizin` gibi bir kelime h1'in puntosunda kutudan geniş çıkıyor.
// **Kelime bölünmez** — kutuyu daraltmak taşmayı yok etmiyor, yalnız hangi kenardan
// taştığını değiştiriyor. Bu, R-23'ün ("Türkçe genişleme yapısaldır") tipografi tarafı:
// İngilizce bir başlıkta `Showcase` 8 karakter, Türkçe karşılığında 19.
//
// ⚠ **OTOMATİK KÜÇÜLTME YOK** (R-30). `fitText` benzeri hiçbir şey yazılmıyor: sığdırmak
// için tipi çalışma zamanında küçültmek, makine üretimi kreatifin bir numaralı görsel
// işareti. Punto ÖNCEDEN, ölçülerek seçiliyor — bu bir tip ölçeği KARARI.
//
// **Kelimeler uydurulmadı**, corpus'tan ve üretilmiş slayt metinlerinden toplandı.
// Uydurulmuş bir "en kötü durum" ya fazla iyimser olur (gerçek kelime daha uzundur) ya
// da fazla kötümser (kimsenin yazmayacağı bir kelime yüzünden punto gereksiz küçülür).

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
const { withPage, fontCss } = await import(join(REPO, 'packages/render/dist/index.js'))

// Corpus'tan ve üretilmiş metinlerden toplanan gerçek uzun kelimeler (12+ karakter).
// Liste `scripts/tip-olcegi.mjs` içinde SABİT: ölçümün tekrar üretilebilir olması için
// girdi de sabit olmalı. Yeni bir uzun kelime çıkarsa buraya eklenir ve ölçüm yenilenir.
const KELIMELER = [
  'taşıyabileceğimizin',
  'sürdürülebilirlik',
  'taşıyabildiğimizi',
  'konumlandırmadan',
  'genelleştirilmiş',
  'tamamlandığında',
  'karşılaştırması',
  'özelleştirilmiş',
  'toplamıyorsunuz',
  'birleştiriliyor',
  'yönetemezsiniz',
  'izlenebilirlik',
  'yaygınlaştırma',
  'iyileştiremezsiniz',
]

const f = fontCss(join(REPO, 'brand/brd_upcytech/fonts'))
if (!f.ok) {
  console.error('✗ font eksik:', f.eksikler)
  process.exit(1)
}

// `static.ts`teki h1 stiliyle BİREBİR aynı olmak zorunda. Farklı olsaydı ölçüm başka
// bir tipografiyi ölçer ve sayı üretimde tutmazdı.
const H1 =
  'font-family:"Marka Display","Marka Metin",sans-serif;font-weight:800;' +
  'font-stretch:112%;letter-spacing:-0.03em;'

const PUNTOLAR = [44, 48, 52, 56, 60, 64, 68, 72, 76, 80]

const script = `(async () => {
  await document.fonts.ready
  const kelimeler = ${JSON.stringify(KELIMELER)}
  const puntolar = ${JSON.stringify(PUNTOLAR)}
  // ⚠ Stil dizesi JSON.stringify ile geçiyor: içinde çift tırnak var ("Marka Display")
  // ve doğrudan gömüldüğünde tarayıcıya giden kodu kırıyordu.
  const h1 = ${JSON.stringify(H1)}
  const TABAN = "position:absolute;left:-9999px;top:0;white-space:nowrap;" 
  const olc = document.createElement("div")
  olc.style.cssText = "position:absolute;left:-9999px;top:0;white-space:nowrap;"
  document.body.appendChild(olc)
  const sonuc = []
  for (const p of puntolar) {
    const satir = { punto: p, genislikler: [] }
    for (const k of kelimeler) {
      olc.setAttribute("style", TABAN + h1 + "font-size:" + p + "px")
      olc.textContent = k
      satir.genislikler.push(Math.ceil(olc.getBoundingClientRect().width))
    }
    sonuc.push(satir)
  }
  return sonuc
})()`

const r = await withPage(async (page) => {
  await page.setContent(`<meta charset="utf-8"><style>${f.css}</style><body></body>`, {
    waitUntil: 'load',
  })
  return page.evaluate(script)
})
if (!r.ok) {
  console.error('✗ ölçüm başarısız:', r.error)
  process.exit(1)
}

const TUVAL = 1080
const PAY = 88 // `.icerik` kenar payı, `static.ts` ile aynı

// Aday sütun genişlikleri, tuvalin yüzdesi. Eğri bandı buna göre kayacak.
const ADAYLAR = [36, 44, 52, 58, 62, 68]

const enGenis = r.value.map((s) => ({
  punto: s.punto,
  en: Math.max(...s.genislikler),
  hangi: KELIMELER[s.genislikler.indexOf(Math.max(...s.genislikler))],
}))

const L = []
const S = (x) => L.push(x)
S('# Tip ölçeği: en uzun Türkçe kelimeden türetildi')
S('')
S('> **ÜRETİLMİŞ DOSYA** — elle düzenlenmez. Üreteci: `node scripts/tip-olcegi.mjs`')
S('> (FAZ-10.2b · R-23 · §7.2). Buradaki her sayı bir ölçümdür.')
S('')
S('**Ölçülen stil:** `static.ts`teki `h1` ile birebir — Marka Display 800, `font-stretch`')
S('112%, `letter-spacing` -0.03em. Farklı olsaydı ölçüm başka bir tipografiyi ölçerdi.')
S('')
S(
  `**Kelimeler uydurulmadı:** corpus ve üretilmiş slayt metinlerinden toplandı, ${KELIMELER.length} adet.`
)
S('')
S('## En geniş kelime, punto başına')
S('')
S('| Punto | En geniş kelime | Genişlik |')
S('|---|---|---|')
for (const e of enGenis) S(`| ${e.punto} px | \`${e.hangi}\` | **${e.en} px** |`)
S('')
S('## Hangi sütun genişliğinde hangi punto sığar')
S('')
S(`Tuval ${TUVAL} px, kenar payı ${PAY} px. Kullanılabilir içerik = sütun − pay.`)
S('')
S('| Sütun | İçerik gen. | Sığan en büyük punto |')
S('|---|---|---|')
const secimler = []
for (const yuzde of ADAYLAR) {
  const icerik = Math.round((TUVAL * yuzde) / 100) - PAY
  const sigan = [...enGenis].reverse().find((e) => e.en <= icerik)
  secimler.push({ yuzde, icerik, punto: sigan?.punto ?? null })
  S(
    `| %${yuzde} (${Math.round((TUVAL * yuzde) / 100)} px) | ${icerik} px | ` +
      (sigan === undefined ? '**hiçbiri** — 44 px bile taşıyor' : `**${sigan.punto} px**`) +
      ' |'
  )
}
S('')
const mevcut = secimler.find((s) => s.yuzde === 36)
S('## Karar')
S('')
S(
  `**Bugünkü ayar (%36 sütun, 76 px punto) ÇALIŞMIYOR** ve tablo bunu gösteriyor: ` +
    `%36'da içerik ${mevcut.icerik} px, sığan en büyük punto ` +
    (mevcut.punto === null ? '**yok**' : `**${mevcut.punto} px**`) +
    ` — yani 76 px zaten imkânsızdı.`
)
S('')
S('Seçim iki değişkenli: sütunu genişletmek ya da puntoyu küçültmek. **İkisi de yapılıyor,**')
S('çünkü tek başına ikisi de kötü: sadece punto küçültmek başlığı gövde metnine yaklaştırıp')
S('hiyerarşiyi öldürür; sadece sütunu genişletmek eğriyi kenara sıkıştırıp motifi yok eder.')
S('')
S("Referansta metin alanı karenin ~%62'sini kaplıyor ve eğri sınırı oradan geçiyor — yani")
S("geniş sütun zaten ailenin özelliği, bizim %36'lık sütunumuz referanstan SAPMAYDI.")

const CIKTI = join(REPO, 'docs/referans/tip-olcegi.md')
writeFileSync(CIKTI, L.join('\n') + '\n')
console.log(
  `✓ ${KELIMELER.length} kelime × ${PUNTOLAR.length} punto ölçüldü → ${CIKTI.replace(REPO + '/', '')}`
)
for (const s of secimler) {
  console.log(
    `  sütun %${String(s.yuzde).padStart(2)} → içerik ${String(s.icerik).padStart(4)} px → ` +
      (s.punto === null ? 'HİÇBİR punto sığmıyor' : `en büyük punto ${s.punto} px`)
  )
}
console.log(`  en geniş kelime 76 px'te: ${enGenis.find((e) => e.punto === 76).en} px`)
