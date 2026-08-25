#!/usr/bin/env node
// GROUP: fast
// DENETİM TAVANI — `panoramaDenetle` çağıran her test AÇIK zaman aşımı taşır (FAZ-19.5).
//
// ⚠ ⚠ **BU KAPI GİZLİ BİR BORÇTAN DOĞDU ve borcu ÖLÇÜM açığa çıkardı.** `veri-hikayesi`ye
// çizgili zemin eklenince `kadraj.test.ts` kırmızı döndü — ama sebep çizgi DEĞİLDİ:
//   · `panoramaDenetle(veri-hikayesi)` yüzeysiz **8342 ms** sürüyordu, yani vitest'in
//     varsayılan 10 000 ms tavanının **%83'ünde.**
//   · Yüzey ailesi (`feTurbulence` katmanları) render başına ~70-100 ms ekliyor ve denetim
//     ~40 render yapıyor → **+3283 ms.** Toplam 11 625 ms, tavan aşıldı.
//   · Izgaranın kendi maliyeti ÖLÇÜLDÜ ve GÜRÜLTÜNÜN İÇİNDE: `repeating-linear-gradient`
//     +12 ms, döşemeli yazım -23 ms (yayılım 2175-2412 ms). Yani suçlanan şey masumdu.
//
// **Ders:** varsayılan tavanda duran bir denetim testi, meşru her eklemeyi kırar. Tavan
// bir performans hedefi değil bir GÜVENLİK PAYIDIR; denetim ağır bir iştir ve ağırlığı
// açıkça YAZILMALIDIR. Beş test bu tavanı taşımıyordu, komşuları taşıyordu — kural vardı,
// tutarlı uygulanmıyordu. Kapı tutarlılığı zorluyor.
//
// ⚠ Kapı bir SÜRE ölçmüyor: yalnız tavanın YAZILI olmasını istiyor. Süreyi ölçmek
// makineye bağımlı bir kapı üretirdi (R-78: ölçmeden hızlandırma yok, ama makineye bağlı
// eşik de kapı değildir).

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '../..')
const AGIR = 'panoramaDenetle'

/** `it(` açılışından başlayıp parantezi eşleştirerek çağrının tamamını döndürür. */
const cagriSonu = (s, acilis) => {
  let derinlik = 0
  let tirnak = null
  for (let i = acilis; i < s.length; i += 1) {
    const c = s[i]
    if (tirnak !== null) {
      if (c === '\\') i += 1
      else if (c === tirnak) tirnak = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') tirnak = c
    else if (c === '(') derinlik += 1
    else if (c === ')') {
      derinlik -= 1
      if (derinlik === 0) return i
    }
  }
  return -1
}

const dosyalar = []
for (const paket of readdirSync(join(KOK, 'packages'))) {
  const src = join(KOK, 'packages', paket, 'src')
  let girdiler
  try {
    girdiler = readdirSync(src, { recursive: true })
  } catch {
    continue
  }
  for (const g of girdiler) if (String(g).endsWith('.test.ts')) dosyalar.push(join(src, String(g)))
}

const ihlaller = []
let sayilan = 0
for (const yol of dosyalar) {
  const s = readFileSync(yol, 'utf8')
  if (!s.includes(AGIR)) continue
  for (const m of s.matchAll(/\bit\(/g)) {
    const acilis = m.index + 2
    const son = cagriSonu(s, acilis)
    if (son === -1) continue
    const cagri = s.slice(acilis, son + 1)
    if (!cagri.includes(AGIR)) continue
    sayilan += 1
    // Son argüman sayı mı: `}, 60_000)` / `}, 120000)` biçimi.
    if (!/,\s*[\d_]+\s*\)$/.test(cagri)) {
      const ad = /^\(\s*(?:'|"|`)([^'"`]{0,60})/.exec(cagri)
      const satir = s.slice(0, acilis).split('\n').length
      ihlaller.push(`${yol.replace(KOK + '/', '')}:${String(satir)}  ${ad?.[1] ?? '?'}`)
    }
  }
}

if (ihlaller.length > 0) {
  console.log(`  ${AGIR} çağıran ${String(ihlaller.length)} testte AÇIK zaman aşımı yok:`)
  for (const i of ihlaller) console.log(`    ${i}`)
  console.log(
    '  Denetim ağır bir iştir: yüzeysiz 8,3 sn, yüzeyli 11,6 sn ölçüldü.\n' +
      '  Varsayılan 10 sn tavanda duran bir test, meşru her eklemeyi kırar.\n' +
      "  Çare: `it('...', async () => { … }, 60_000)`"
  )
  process.exit(1)
}
console.log(`  ${String(sayilan)} denetim testinin hepsi açık zaman aşımı taşıyor`)
