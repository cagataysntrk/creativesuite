#!/usr/bin/env node
// GROUP: fast
// Çağrılan her `var(--ramp-*)` / `var(--role-*)` GERÇEKTEN tanımlı mı (§4.1 · D-320).
//
// ⚠ ⚠ **BU KAPI, KENDİ AÇTIĞIM BİR YARADAN DOĞDU.** D-318 amber rampasını emekli etti
// ve `packages/contracts/src/aile.ts` iki değişkeni çağırmaya devam etti:
//
//     const AMBER_ACIK = 'var(--ramp-marka-amber-200)'   ← artık tanımsız
//
// **CSS tanımsız bir `var()` için hata VERMEZ.** Bildirimi geçersiz sayıp ögeyi
// sessizce şeffaf bırakır. Yani üç şablonun zemin ögesi kayboldu, hiçbir test kırmızı
// olmadı, hiçbir kapı konuşmadı ve çıktıya bakmadan fark edilmesi imkânsızdı.
//
// ⚠ **Derleyici de göremez:** çağrı bir DİZE içinde yaşıyor. Bir rampayı silerken
// `grep` yapmayı hatırlamak bir zorlama değildir — kapı hatırlar.
//
// ⚠ Fallback'li çağrı (`var(--role-x, var(--role-y))`) MEŞRU ve ikinci değişkeni de
// denetleniyor: yedeği tanımsız bir fallback, yedeksiz olmaktan kötüdür.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')

/** Tanımlı değişkenler — üretilmiş `tokens.css` dosyalarının BİRLEŞİMİ. */
const tanimlilar = new Set()
const markalar = readdirSync(join(REPO, 'brand'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
for (const m of markalar) {
  const yol = join(REPO, `brand/${m}/derived-tokens/tokens.css`)
  try {
    for (const eslesme of readFileSync(yol, 'utf8').matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
      tanimlilar.add(eslesme[1])
    }
  } catch {
    // Marka henüz token üretmemiş olabilir; `tokens` kapısı onu ayrıca söylüyor.
  }
}
if (tanimlilar.size === 0) {
  console.log('✗ hiç token okunamadı — `just tokens` çalıştırılmamış, kapı boş geçiyor')
  process.exit(1)
}

/**
 * Kapının KAPSAMI: yalnız token sisteminin iki öneki.
 *
 * ⚠ ⚠ **İLK SÜRÜM HER `var()`E BAKTI ve 39 "ihlal" buldu — çoğu YANLIŞ.** Bir belge
 * kendi `:root{--ui:…}` değişkenini tanımlayıp kullanabilir; o bir token değil, yerel
 * bir kısaltma. Kapının işi token SÖZLEŞMESİNİ korumak: `--ramp-*` (1. kademe) ve
 * `--role-*` (2. kademe) `tokens.css`ten gelmek ZORUNDA, çünkü onları üreten tek yer
 * `just tokens`.
 *
 * ⚠ Gürültülü bir kapı okunmaz olur ve okunmayan bir kapı yoktur — daraltma bir
 * gevşeme değil, kapının çalışabilmesinin şartı.
 */
const KAPSAM = /^--(ramp|role)-/

const KLASORLER = ['packages', 'apps', 'scripts']
const UZANTI = /\.(ts|tsx|mjs|js|css)$/
const dosyalar = []
const gez = (d) => {
  for (const ad of readdirSync(d)) {
    if (ad === 'node_modules' || ad === 'dist' || ad === 'dist-web') continue
    const t = join(d, ad)
    if (statSync(t).isDirectory()) gez(t)
    else if (UZANTI.test(ad) && !ad.endsWith('.test.ts')) dosyalar.push(t)
  }
}
for (const k of KLASORLER) gez(join(REPO, k))

const ihlaller = []
for (const dosya of dosyalar) {
  const metin = readFileSync(dosya, 'utf8')
  metin.split('\n').forEach((satir, i) => {
    // ⚠ Yorum satırları ATLANIYOR: bir yorumda emekli bir token'ın ADINI anmak
    // (D-318'in gerekçesi gibi) bir çağrı değil, bir kayıttır.
    const kirpik = satir.trim()
    if (kirpik.startsWith('//') || kirpik.startsWith('*') || kirpik.startsWith('/*')) return
    for (const m of satir.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const ad = m[1]
      if (!KAPSAM.test(ad)) continue
      if (!tanimlilar.has(ad)) {
        ihlaller.push(
          `${dosya.slice(REPO.length + 1)}:${String(i + 1)}  ${ad} — hiçbir tokens.css'te tanımlı değil`
        )
      }
    }
  })
}

if (ihlaller.length > 0) {
  for (const s of ihlaller) console.log(`  ✗ ${s}`)
  console.log(
    `\n${String(ihlaller.length)} tanımsız token çağrısı — CSS bunlar için hata VERMEZ,` +
      ' bildirimi geçersiz sayıp ögeyi sessizce şeffaf bırakır (D-320).'
  )
  process.exit(1)
}
console.log(
  `  ${String(tanimlilar.size)} tanımlı token · ${String(dosyalar.length)} dosyada çağrı denetlendi`
)
