// GROUP: fast
// Türkçe genişleme payı — R-23.
//
// **Kural:** hiçbir etiket, düğme, sekme ya da tablo başlığı SABİT genişlik alamaz.
//
// Sebep bir dipnot değil, yapısal: her Türkçe etiket İngilizce karşılığından ~%20-30
// uzun. "Onayla" sığar; gerçek etiket *"Onayla ve depoya işle"* olur ve kırpar. Genişlik
// ölçüleri Türkçe metne göre belirlenir, İngilizce'ye göre değil.
//
// **Bu kapının ölçmediği şey:** gerçek render'da +%30 sahte-yerelleştirmeyle hiçbir
// yerde kırpma OLMADIĞI. O ölçüm bir DOM harness'ı ister (iki bağımlılık, R-75) ve
// V-19 olarak açık duruyor. Burada zorlanan, kuralın YAZILI hâli: sabit genişlik yok,
// kırpma tasarımı yok. Kuralın yarısını mekanik olarak zorlamak, tamamını yorumla
// korumaktan iyidir — ve ölçülmeyen yarı ADIYLA duruyor (D-175 ailesi).

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')

const gez = (d, out = []) => {
  for (const ad of readdirSync(d)) {
    if (ad === 'node_modules' || ad === 'dist') continue
    const p = join(d, ad)
    if (statSync(p).isDirectory()) gez(p, out)
    else if (p.endsWith('.css')) out.push(p)
  }
  return out
}

/** Metin taşıyan kontroller — genişlikleri İÇERİĞE göre olmalı. */
const METIN_KONTROLU =
  /(^|[\s,>])(button|label|th|summary|legend|kbd)(\s|,|:|\[|$)|\.(baslat|etiket|sekme|tab|dugme|komut)/i

/** Sabit genişlik: sayı + mutlak birim. `%`, `auto`, `min-content`, `var()` serbest. */
const SABIT_GENISLIK = /(?:^|[\s;{])(inline-size|width)\s*:\s*[\d.]+\s*(px|rem|em|ch|pt)\b/i

const hatalar = []
let blokSayisi = 0

for (const f of [...gez(join(REPO, 'apps/ui/src')), ...gez(join(REPO, 'packages/ui/src'))]) {
  const src = readFileSync(f, 'utf8')
  // Kaba ama yeterli CSS blok ayrıştırıcısı: `seçici { gövde }`. İç içe at-rule'lar
  // (`@media`) seçici olarak eşleşmez ve gövdeleri ayrıca taranır.
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const secici = m[1].trim().split('\n').pop().trim()
    const govde = m[2]
    if (secici.startsWith('@') || secici === '') continue
    if (!METIN_KONTROLU.test(secici)) continue
    blokSayisi++
    const satir = src.slice(0, m.index).split('\n').length

    const sabit = SABIT_GENISLIK.exec(govde)
    if (sabit !== null) {
      hatalar.push(
        `${relative(REPO, f)}:${satir} — '${secici}' SABİT genişlik alıyor (${sabit[0].trim()}); ` +
          `Türkçe etiket ~%30 uzun ve kırpar (R-23). \`min-inline-size\` kullanın.`
      )
    }
    if (/text-overflow\s*:\s*ellipsis/i.test(govde)) {
      hatalar.push(
        `${relative(REPO, f)}:${satir} — '${secici}' kırpmayı TASARIM yapıyor ` +
          `(text-overflow: ellipsis); Türkçe etiket sığmadığında sessizce kaybolur (R-23).`
      )
    }
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} R-23 ihlali`)
  process.exit(1)
}

console.log(
  `✓ turkce-genisleme: ${blokSayisi} metin kontrolünün hiçbiri sabit genişlik almıyor ` +
    `(görsel +%30 turu → V-19)`
)
