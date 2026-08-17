#!/usr/bin/env node
// GROUP: fast
// Tasarım kapısı — karosel GRAMERİNİN doğruluğu (§11.1 · FAZ-10.3 · D-255).
//
// **Neden bu kapı var:** `qa/measure.ts` ΔE, palet dışı, kaplama ve en-boyu zaten
// ölçüyor ve üretimde koşuyor. Ama bu hafta üç kusur çıktı ve üçünü de HİÇBİR kapı
// görmedi — metin eğri sınırını kesiyordu, hayalet rakam navigasyonla çakışıyordu,
// kapak on iki satırlık bir duvardı. Üçü de ancak PNG'lere tek tek bakarak bulundu.
// Göz güvenilir bir kapı değildir: yorulur, alışır, gözetimsiz koşuda hiç yoktur.
//
// **Kapı bir ÇALIŞTIRMAYI değil GRAMERİ denetliyor.** Temsili slaytlar burada kuruluyor
// ve ölçülüyor; yani kapı, üretim yapılmasa bile gramerdeki bir gerilemeyi yakalıyor.
// Çalıştırma çıktısını denetlemek başka bir iştir ve onu tolerans okuması yapıyor.
//
// **Metnin gerçek genişliği TARAYICIDAN ölçülüyor.** Tahmin edilmiyor: bu turda
// öğrenildi ki kutuyu daraltmak Türkçede metni daraltmıyor — `taşıyabileceğimizin`
// 76 px'te 665 px yer kaplıyor ve kelime bölünmüyor (R-23). Tahmine dayalı bir T2,
// tam da yakalaması gereken kusuru kaçırırdı.

import { join } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
const R = await import(join(REPO, 'packages/render/dist/index.js'))
const { withPage, fontCss, toHtml, tasarimOlc, tipografiSay, formatReading, guvenliMetinYuzdesi } =
  R

const f = fontCss(join(REPO, 'brand/brd_upcytech/fonts'))
if (!f.ok) {
  console.log(`✗ tasarim: marka fontu eksik — ${f.eksikler.map((e) => e.dosya).join(', ')}`)
  process.exit(1)
}

// Temsili token seti. Gerçek marka token'ları OKLCH; `parseColor` ikisini de çözüyor.
const TOKEN =
  ':root{--role-bg:#e8a92a;--role-surface:#f5f3ee;--role-text:#1b1b1b;' +
  '--role-text-muted:#4a4a4a;--role-line-edge:#1b1b1b}'

// ⚠ Metin UZUN Türkçe kelimeler içeriyor ve bu kasıtlı: kısa kelimelerle kurulan bir
// temsili belge, kapının yakalaması gereken tek şeyi hiç göstermez.
const ROLLER = ['kapak', 'govde', 'govde', 'govde', 'kapanis']
const slaytlar = ROLLER.map((role, i) => ({
  width: 1080,
  height: 1350,
  tokenCss: TOKEN,
  fontCss: f.css,
  slayt: { role, index: i, total: ROLLER.length, kulp: '@upcytech' },
  blocks:
    role === 'kapak'
      ? [{ type: 'heading', level: 1, text: 'Ölçmediğiniz bir hattı iyileştiremezsiniz' }]
      : [
          { type: 'heading', level: 1, text: 'Sürdürülebilirlik ölçümdür' },
          {
            type: 'body',
            text: 'Vardiya karşılaştırması yapılamıyorsa izlenebilirlik bir iddiadır.',
          },
        ],
}))

// ── metnin GERÇEK genişliği ─────────────────────────────────────────────────
const kelimeler = slaytlar.map((d) =>
  d.blocks
    .filter((b) => b.type === 'heading')
    .flatMap((b) => b.text.split(/\s+/))
    .filter((w) => w !== '')
)

const olcum = await withPage(async (page) => {
  await page.setContent(`<meta charset="utf-8"><style>${f.css}</style><body></body>`, {
    waitUntil: 'load',
  })
  const script = `(async () => {
    await document.fonts.ready
    const gruplar = ${JSON.stringify(kelimeler)}
    const stil = ${JSON.stringify(
      'position:absolute;left:-9999px;top:0;white-space:nowrap;' +
        'font-family:"Marka Display","Marka Metin",sans-serif;font-weight:800;' +
        'font-stretch:112%;letter-spacing:-0.03em;font-size:64px'
    )}
    const el = document.createElement("div")
    el.setAttribute("style", stil)
    document.body.appendChild(el)
    return gruplar.map((g) => {
      let en = 0
      for (const w of g) { el.textContent = w; en = Math.max(en, el.getBoundingClientRect().width) }
      return Math.ceil(en)
    })
  })()`
  return page.evaluate(script)
})
if (!olcum.ok) {
  console.log(`✗ tasarim: metin genişliği ölçülemedi — ${olcum.error.message}`)
  process.exit(1)
}

// ── SÜTUN ↔ EĞRİ: iki ayrı kod yolundan, ARTEFAKTTAN (FAZ-12.10) ────────────
//
// ⚠ ⚠ **Değişmez daha önce kendi kendini ölçüyordu:** sütun da eğri de aynı sabitlerden
// hesaplanıyordu, işaret hep aynıydı ve okuma hiçbir girdide kırmızıya dönemezdi. Şimdi
// `kolonPx` DOM'daki `.icerik` kutusundan, `egriPx` aynı HTML'e basılmış `<path>`ın
// zarfından geliyor. Biri ötekinden ayrışırsa (CSS genişliği ile path birbirini takip
// etmezse) okuma bunu görür — tam da yakalanamayan gerileme sınıfı buydu.
const kenarOlcum = await withPage(async (page) => {
  const sonuc = []
  for (const d of slaytlar) {
    await page.setContent(toHtml(d), { waitUntil: 'load' })
    // ⚠ Üç ölçüm de AYNI sayfadan ve ayrı ögelerden: sütun kutusu, hayalet rakamın alt
    // kenarı, alt şeridin üst kenarı. İkisi tek sabitten türeseydi okuma kırmızıya
    // dönemezdi — `ghost_overlap` tam olarak öyleydi (bağımsız doğrulama, bulgu 8).
    const kutu = await page.evaluate(
      `(() => {
        const e = document.querySelector(".icerik"); if (!e) return null
        const r = e.getBoundingClientRect()
        const h = document.querySelector(".hayalet")
        const serit = [...document.querySelectorAll(".kulp, .nav")]
          .map((x) => x.getBoundingClientRect().top)
        return {
          sol: r.left, sag: r.right,
          rakamAlt: h ? h.getBoundingClientRect().bottom : null,
          seritUst: serit.length ? Math.min(...serit) : null,
        } })()`
    )
    const html = await page.content()
    // Alan katmanının path'i: `viewBox="0 0 100 100"` kutusunda, tuvale gerilmiş.
    const eslesme = /<path d="([^"]+)"/.exec(html)
    if (kutu === null || eslesme === null) return null
    const zarf = R.egriZarfi(eslesme[1])
    // ⚠ `egriSagda` İMPORT EDİLİYOR, yeniden yazılmıyor: kopya bir ikinci doğruluk
    // kaynağıdır ve gramer değişirse kapı sessizce YANLIŞ kenarı ölçer (R-05'in kapı
    // katmanındaki karşılığı; bağımsız doğrulama bulgu 15).
    // Eğri sağdaysa sütun solda: bakan kenar `sag`, eğrinin iç kenarı `zarf.min`.
    const sagda = R.egriSagda(d.slayt)
    const yatay = sagda
      ? { kolonPx: kutu.sag, egriPx: (zarf.min / 100) * d.width }
      : { kolonPx: d.width - kutu.sol, egriPx: d.width - (zarf.max / 100) * d.width }
    sonuc.push({ ...yatay, rakamAltPx: kutu.rakamAlt, seritUstPx: kutu.seritUst })
  }
  return sonuc
})
if (!kenarOlcum.ok || kenarOlcum.value === null) {
  console.log('✗ tasarim: sütun/eğri kenarları ölçülemedi')
  process.exit(1)
}

// ⚠ Boşluklar ÜRETİLEN STİLDEN toplanıyor, elle yazılmış bir listeden değil: şablonun
// boşluğu değişince ölçüm bunu görmek zorunda (bağımsız doğrulama, bulgu 7).
//
// ⚠ ⚠ **YALNIZ `padding` · `margin` · `gap` ve `.spacer` yüksekliği.** İlk sürüm `height`
// de topluyordu ve tuval yüksekliğini (1350), maske çapını (376), kontur kalınlığını (3)
// "boşluk" sayıyordu: 16 sayı sayan bir metrik ölçüm değil GÜRÜLTÜdür ve gürültü hep
// kırmızı yanar, yani hiç okunmaz. Ölçülen şey DİKEY RİTİM, ögelerin boyu değil.
const boslukKaynagi = toHtml(slaytlar[1])
const bosluklar = [
  ...new Set([
    ...[...boslukKaynagi.matchAll(/(?:padding|margin|gap)(?:-[a-z]+)?:([^;{}]+)/g)].flatMap((m) =>
      [...m[1].matchAll(/(\d+)px/g)].map((x) => Number(x[1]))
    ),
    ...[...boslukKaynagi.matchAll(/\.spacer\.[a-z]+ \{ height: (\d+)px/g)].map((m) => Number(m[1])),
  ]),
]
  .filter((v) => v > 0)
  .sort((a, b) => a - b)

const rapor = tasarimOlc({
  slaytlar,
  enGenisKelimePx: olcum.value,
  kolonKenarlari: kenarOlcum.value.map((k) => ({ kolonPx: k.kolonPx, egriPx: k.egriPx })),
  dikeyKenarlar: kenarOlcum.value
    .filter((k) => k.rakamAltPx !== null && k.seritUstPx !== null)
    .map((k) => ({ rakamAltPx: k.rakamAltPx, seritUstPx: k.seritUstPx })),
  bosluklar,
})
const tip = tipografiSay(toHtml(slaytlar[1]))
const okumalar = [...rapor.readings, ...tip.readings]

// ⚠ **Boş rapor BAŞARI DEĞİL.** Ölçüm yapılmadığında kapı yeşil yanarsa, kapıyı
// devre dışı bırakmanın en kolay yolu onu bozmak olur — ve bozulduğu görülmez.
if (okumalar.length === 0) {
  console.log('✗ tasarim: hiç okuma üretilmedi — ölçüm koşmamış, yeşil sayılmaz')
  process.exit(1)
}

const disarida = okumalar.filter((r) => r.status === 'out')
const uyari = okumalar.filter((r) => r.status === 'warn')

for (const r of disarida) console.log('  ' + formatReading(r))
if (disarida.length > 0) {
  console.log(`\n✗ tasarim: ${disarida.length} okuma SINIR DIŞI (${okumalar.length} okumadan)`)
  console.log(
    `  güvenli metin sütunu %${guvenliMetinYuzdesi} · ölçülen kelime ${olcum.value.join(', ')} px`
  )
  process.exit(1)
}

console.log(
  `✓ tasarim: ${okumalar.length} okuma tolerans içi` +
    (uyari.length > 0 ? ` · ${uyari.length} uyarı bandında` : '')
)
