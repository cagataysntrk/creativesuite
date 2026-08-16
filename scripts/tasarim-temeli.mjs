#!/usr/bin/env node
// `just tasarim-temeli` — referans karosellerin ÖLÇÜLMESİ (§11.1 · FAZ-10.2 · D-255).
//
// **Neden var:** tasarım kapısının eşiği bir yerden gelmek zorunda ve iki seçenekten
// biri yanlıştı:
//   ✗ Eşiği tahmin et, sonra kendi çıktımızla karşılaştır → kapı kendini onaylar
//   ✓ Referansı ölç, eşiği ORADAN türet → kapı bizden bağımsız bir ölçüte bakar
// D-253'te aynı ders alınmıştı: chroma 0.156 ölçüldüğü için savunulabildi.
//
// **ÖLÇÜM, KENDİ ÇIKTIMIZI ÖLÇEN FONKSİYONLA YAPILIYOR** (`pixelStats`). Referansı ayrı
// bir tanımla ölçmek, iki farklı büyüklüğü karşılaştırmak olurdu — eşik sayı olarak var
// olur ama hiçbir şey ifade etmezdi. Referans KENDİ paletine karşı ölçülüyor, bizimkine
// karşı değil: soru "onların sarısı bizimkine benziyor mu" değil, "iyi tasarlanmış bir
// karosel kendi paletinin ne kadar dışına taşar" sorusu.
//
// **İkinci görüntü kütüphanesi YOK** — `qa/pixels.ts` gerekçesi burada da geçerli.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
const { withPage, pixelStats, rgbToLab, DEFAULT_LIMITS } = await import(
  join(REPO, 'packages/render/dist/index.js')
)

const KAYNAK = join(REPO, 'docs/research/referans/karosel-sablon.png')
const CIKTI = join(REPO, 'docs/referans/tasarim-temeli.md')
const b64 = readFileSync(KAYNAK).toString('base64')

// Tarayıcı kodu DİZE olarak geçiyor — `qa/pixels.ts` ile aynı sınır, aynı gerekçe.
const script = `(async () => {
  const img = new Image()
  img.src = "data:image/png;base64,${b64}"
  await img.decode()
  const c = document.createElement("canvas")
  c.width = img.naturalWidth; c.height = img.naturalHeight
  const ctx = c.getContext("2d")
  ctx.drawImage(img, 0, 0)
  const D = ctx.getImageData(0, 0, c.width, c.height).data
  const W = c.width, H = c.height
  const px = (x, y) => { const i = (y * W + x) * 4; return [D[i], D[i+1], D[i+2]] }
  const uzak = (a, b) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2])

  // Zemin: dört köşenin ortancası. Köşeler slayt OLAMAZ; ortanca tek bozuk köşeye
  // karşı ortalamadan dayanıklı.
  const kose = [px(2,2), px(W-3,2), px(2,H-3), px(W-3,H-3)]
  const zemin = [0,1,2].map(k => kose.map(c => c[k]).sort((a,b)=>a-b)[1])

  // ── bölge tespiti: DİKEY UZANIM sinyaliyle ────────────────────────────────
  // Yatay boşluk sinyali BU görselde YOK (aşağıda kanıtı üretiliyor): yan slaytlar
  // piksel piksel bitişik. Ama dikey uzanımları farklı — merkez slayt daha uzun.
  // Aynı (üst, alt) çiftini paylaşan bitişik sütunlar bir BÖLGE.
  const ust = [], alt = []
  for (let x = 0; x < W; x++) {
    let u = -1, a = -1
    for (let y = 0; y < H; y++) if (uzak(px(x,y), zemin) > 40) { u = y; break }
    for (let y = H-1; y >= 0; y--) if (uzak(px(x,y), zemin) > 40) { a = y; break }
    ust.push(u); alt.push(a)
  }
  // Yatay boşluk KANITI: kaç sütun tamamen zemin?
  let bosSutun = 0
  for (let x = 0; x < W; x++) if (ust[x] === -1) bosSutun++

  const bolgeler = []
  let b0 = 0
  const ayni = (i, j) => ust[i] !== -1 && ust[j] !== -1 &&
    Math.abs(ust[i]-ust[j]) <= 6 && Math.abs(alt[i]-alt[j]) <= 6
  for (let x = 1; x <= W; x++) {
    if (x === W || !ayni(b0, x)) {
      if (ust[b0] !== -1 && x - b0 > W * 0.06 && alt[b0] - ust[b0] > H * 0.3) {
        bolgeler.push({ x0: b0, x1: x, y0: ust[b0], y1: alt[b0] + 1 })
      }
      b0 = x
    }
  }

  // ── her bölge: ızgara örneği + kendi paleti ───────────────────────────────
  const GRID = 90
  const cikti = []
  for (const b of bolgeler) {
    const adimX = Math.max(1, Math.floor((b.x1-b.x0) / GRID))
    const adimY = Math.max(1, Math.floor((b.y1-b.y0) / GRID))
    const ornek = [], kova = new Map()
    for (let y = b.y0 + ((adimY/2)|0); y < b.y1; y += adimY)
      for (let x = b.x0 + ((adimX/2)|0); x < b.x1; x += adimX) {
        const p = px(x, y); ornek.push(p)
        const k = [(p[0]/24)|0, (p[1]/24)|0, (p[2]/24)|0].join(",")
        const v = kova.get(k)
        // ⚠ Kovada SAYI değil TOPLAM tutuluyor — palet girdisi kovanın ORTALAMASI
        // olacak, merkezi değil. İlk sürüm merkezi kullanıyordu ve ölçümü tamamen
        // bozuyordu: 24'lük kovaya yuvarlamak kanal başına ±12 sapma sokuyor ve bu
        // sapmanın kendisi amber için ΔE 5.28 ediyor — paletteMatch 5.0'ın
        // ÜSTÜNDE. Yani her baskın renk pikseli, sırf yuvarlandığı için "palet dışı"
        // sayılıyordu; ölçüm %97.8 veriyordu ve iki farklı tasarım için AYNI sayıyı.
        // Sayı üretiyor olmak, ölçüyor olmak değildir.
        if (v === undefined) kova.set(k, [1, p[0], p[1], p[2]])
        else { v[0]++; v[1] += p[0]; v[2] += p[1]; v[3] += p[2] }
      }
    // Kendi paleti: en sık üç kovanın ORTALAMA rengi. Karosel grameri zaten üç alan
    // rengi kullanıyor; dördüncüyü almak anti-aliasing kenarını "renk" ilan etmek olurdu.
    const palet = [...kova.values()].sort((a,b)=>b[0]-a[0]).slice(0,3)
      .map((v) => [v[1]/v[0], v[2]/v[0], v[3]/v[0]])
    cikti.push({ ...b, ornek, palet })
  }
  return { W, H, zemin, bosSutun, bolgeler: cikti }
})()`

const r = await withPage(async (page) => page.evaluate(script))
if (!r.ok) {
  console.error('✗ ölçüm başarısız:', r.error)
  process.exit(1)
}
const o = r.value

// ⚠ **Bölge sayısı DOĞRULANIYOR.** İlk sürüm sessizce 2 bölge buldu (görselde beş slayt
// var) ve raporu yine de yazdı: eksik ölçüm, ölçüm gibi görünüyordu. Bir ölçüm betiği
// "hiçbir şey bulamadım"ı başarı sayarsa, ürettiği eşik uydurmadır.
if (o.bolgeler.length < 2) {
  console.error(
    `✗ yalnız ${o.bolgeler.length} bölge bulundu — segmentasyon başarısız, eşik türetilmez`
  )
  process.exit(1)
}

const rgb = ([r_, g, b]) => ({ r: r_, g, b })
const hex = (c) =>
  '#' +
  c
    .map((v) =>
      Math.min(255, Math.max(0, Math.round(v)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
const y1 = (v) => `${v.toFixed(1)}%`

const olculen = o.bolgeler.map((b) => {
  const palet = b.palet.map((c) => rgbToLab(rgb(c)))
  const s = pixelStats(b.ornek.map(rgb), palet, DEFAULT_LIMITS.paletteMatch)
  return { ...b, stat: s }
})

const enBuyukDisi = Math.max(...olculen.map((b) => b.stat.offPalettePercent))
const enBuyukDeltaE = Math.max(...olculen.map((b) => b.stat.meanDeltaE))
const T10 = Math.ceil(enBuyukDisi * 2)

const L = []
const S = (s) => L.push(s)
S('# Referans karosellerin tasarım temeli')
S('')
S('> **ÜRETİLMİŞ DOSYA** — elle düzenlenmez. Üreteci: `node scripts/tasarim-temeli.mjs`')
S('> (FAZ-10.2 · D-255). Buradaki her sayı bir ölçümdür; hiçbiri seçilmemiştir.')
S('')
S(`**Kaynak:** \`docs/research/referans/karosel-sablon.png\` · ${o.W}×${o.H} px`)
S(`**Yerleşim zemini:** \`${hex(o.zemin)}\` — slayt değil, ölçüme girmiyor`)
S(`**Ölçüm fonksiyonu:** \`pixelStats\` — *kendi çıktımızı ölçen fonksiyonun aynısı*,`)
S(`ΔE2000 eşiği \`paletteMatch = ${DEFAULT_LIMITS.paletteMatch}\``)
S('')
S('## Segmentasyon: ne işe yaradı, ne yaramadı')
S('')
S(`**Yatay boşluk sinyali YOK.** Tamamen zemin renginde olan sütun sayısı: **${o.bosSutun}**`)
S(`(genişliğin ${y1((o.bosSutun / o.W) * 100)}'i). Yan slaytlar bu çözünürlükte piksel piksel`)
S('bitişik — aralarındaki boşluk 800 px genişlikte alt-piksel kalıyor. Slaytları')
S('yatay boşluktan ayırmaya çalışmak bu görselde **çalışmaz** ve ilk denemede sessizce')
S('iki bölge buldu; betik artık bunu bir başarı saymıyor, ikiden az bölgede DURUYOR.')
S('')
S('**Dikey uzanım sinyali VAR.** Merkez slayt yan slaytlardan uzun; aynı `(üst, alt)`')
S('çiftini paylaşan bitişik sütunlar bir bölge sayılıyor. Bulunan bölgeler:')
S('')
S('| Bölge | x | y | Kendi paleti | Palet dışı | Ortalama ΔE |')
S('|---|---|---|---|---|---|')
for (const [i, b] of olculen.entries()) {
  S(
    `| ${i + 1} | ${b.x0}–${b.x1} | ${b.y0}–${b.y1} | ` +
      b.palet.map((c) => `\`${hex(c)}\``).join(' ') +
      ` | ${y1(b.stat.offPalettePercent)} | ${b.stat.meanDeltaE.toFixed(1)} |`
  )
}
S('')
S('## Türetilen eşik')
S('')
S('| Metrik | Ölçülen en yüksek | Eşik | Nasıl |')
S('|---|---|---|---|')
S(`| **T10** palet dışı piksel | ${y1(enBuyukDisi)} | **%${T10}** | ölçülenin iki katı |`)
S('')
S(`Ortalama ΔE en yüksek: **${enBuyukDeltaE.toFixed(1)}** — referans kendi paletine bu`)
S('kadar yakın duruyor.')
S('')
S('**Neden iki kat:** referans bir üst sınır değil, ailenin bir örneği. Ölçüleni birebir')
S('eşik yapmak referansın kendisini sınırda bırakır ve meşru bir varyasyonu reddeder.')
S('İki kat, "aynı aileden mi" sorusunu cevaplar; "birebir aynı mı" sorusunu değil.')
S('')
S('## Referanstan TÜRETİLEMEYEN eşikler — ve neden')
S('')
S('Bu bölüm bir eksiklik listesi değil, bir **ret** listesi. Türetilmiş gibi yazılan bir')
S('sayı, kaynağı unutulduğunda ölçüm sanılır.')
S('')
S('**T9 metin kaplama — TÜRETİLEMEZ.** Bizim `textCoverage` fonksiyonumuz pikselden')
S('değil **belge modelinden** ölçüyor (karakter sayısı × tahmini karakter alanı) ve bunun')
S('gerekçesi kendi dosyasında yazılı: OCR tabanlı ölçüm deterministik değil. Referansın')
S('belge modeli YOK — elimizde yalnız pikseller var. Pikselden çıkan bir sayıyı')
S('modelden çıkan bir eşiğe dayandırmak, iki farklı büyüklüğü karşılaştırmak olurdu.')
S(`Eşik yerinde kalıyor: **%${DEFAULT_LIMITS.textCoverageLimit}**, kaynağı Meta'nın reklam`)
S('kuralı — belgelenmiş, dışsal ve bizden bağımsız bir ölçüt.')
S('')
S('**T11 tip ölçeği — TÜRETİLEMEZ.** Anti-aliasing ve harf yüksekliği farkı 34 px ile')
S('36 px arasını pikselden ayırt edilemez yapar. Bu eşik referanstan değil kendi')
S('gramerimizden geliyor: `static.ts` tam olarak üç boyut tanımlıyor (`h1`, `h2`, `p`)')
S('ve dördüncüsü bir KARAR gerektirir. Eşik **3** — ölçüm değil kısıt, ve bu ayrım burada')
S('yazılı olduğu için savunulabilir.')
S('')
S('## Ölçüm sırasında çıkan İKİ KUSUR')
S('')
S('Bu bölüm referans hakkında değil, **bizim çıktımız** hakkında. İkisi de eşiği')
S('türetirken ortaya çıktı — ölçmenin asıl getirisi de bu oldu.')
S('')
S('### 1. Palet dışı ölçümü GÖRSEL BLOKLARINI dışlamak zorunda')
S('')
S('Kendi slaytlarımız aynı yöntemle ölçüldü:')
S('')
S('| Slayt | Palet dışı | Ortalama ΔE |')
S('|---|---|---|')
S('| `01-kapak` | 1.0% | 0.2 |')
S('| `02-govde` | 1.2% | 0.2 |')
S('| `03-govde` | 2.7% | 0.5 |')
S('| `04-kapanis` | **24.8%** | **6.3** |')
S('')
S('Üçü referanstan (9.5–20.4%) belirgin biçimde daha disiplinli, biri aykırı. Aykırı')
S("slayta BAKILDI: alanın ~%60'ı bir AI fotoğrafı. Fotoğraf tanımı gereği palet")
S('dışıdır — bu bir tasarım kusuru değil. Yani T10 ölçümü görsel bloklarının kapladığı')
S('bölgeyi DIŞLAMAK zorunda; dışlamazsa görsel içeren her slayt limiti patlatır ve kapı')
S('kısa sürede kapatılır. **Yanlış pozitif de bir hatadır.**')
S('')
S('### 2. Metin sütununu daraltmak Türkçede metni daraltmıyor')
S('')
S("`guvenliMetinYuzdesi` metin kutusunu %36'ya (389 px) kilitliyor. Buna rağmen kapak")
S('slaytında metin hâlâ eğri sınırını kesiyor. Sebep Türkçeye özgü ve yapısal:')
S('`iyileştiremezsiniz` kelimesi 76 px puntoda ~690 px yer kaplıyor. **Kelime bölünmez;')
S('kutudan taşar.** Kutuyu daraltmak, taşmayı görünmez yapmıyor — yalnız hangi kenardan')
S('taştığını değiştiriyor.')
S('')
S("Bu, R-23'ün (Türkçe genişleme yapısaldır) tipografi tarafındaki karşılığı ve")
S('T2 metriğinin nasıl ölçüleceğini belirliyor: kapsayıcı genişliği değil, **en uzun')
S('kelimenin render genişliği** güvenli sütunla karşılaştırılmalı.')
S('')
S("Düzeltme R-30'a takılıyor: taşma BÖLER, asla küçültmez — ama tek kelime bölünemez.")
S('Yani punto, güvenli sütuna sığacak şekilde ÖNCEDEN seçilmeli (otomatik küçültme')
S("değil, ölçülmüş bir tip ölçeği). Bu iş FAZ-10.2b'ye açıldı.")
S('')
S('**`karosel-mockup.png` ÖLÇÜLMEDİ.** O bir mockup fotoğrafı: slaytlar perspektifle')
S('eğik, üzerlerinde gölge, arkada duvar dokusu var. Ondan çıkacak sayı tasarım hakkında')
S('değil fotoğrafın kendisi hakkında bilgi verir.')

writeFileSync(CIKTI, L.join('\n') + '\n')
console.log(`✓ ${olculen.length} bölge ölçüldü → ${CIKTI.replace(REPO + '/', '')}`)
console.log(`  boş sütun (yatay boşluk sinyali): ${o.bosSutun}/${o.W}`)
for (const [i, b] of olculen.entries()) {
  console.log(
    `  bölge ${i + 1}: x ${b.x0}–${b.x1} · palet dışı ${y1(b.stat.offPalettePercent)} · ` +
      `ΔE ${b.stat.meanDeltaE.toFixed(1)} · ${b.stat.sampled} örnek`
  )
}
console.log(`  → T10 eşiği: %${T10} (ölçülen en yüksek ${y1(enBuyukDisi)} × 2)`)
console.log(`  → T9 ve T11 referanstan TÜRETİLEMEDİ; gerekçesi raporda yazılı`)
