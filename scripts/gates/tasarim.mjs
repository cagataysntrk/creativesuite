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

const rapor = tasarimOlc({ slaytlar, enGenisKelimePx: olcum.value })
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
