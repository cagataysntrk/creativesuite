#!/usr/bin/env node
// GROUP: fast
// GAMUT DENETİMİ — bir rampa sRGB'de GERÇEKTEN duruyor mu (FAZ-19.6).
//
// ⚠ ⚠ **KIRPILMA SESSİZDİR ve bu kapının var olma sebebi budur.** Tarayıcı gamut dışı
// bir `oklch()`i reddetmez; en yakın sRGB rengine kırpar ve TON KAYAR. Ölçüldü:
// `oklch(0.15 0.206 262)` mavi yazıyor, **`#0f0061` çiziyor** — yani mor. Ne bir hata,
// ne bir uyarı; yalnız yanlış renk.
//
// ⚠ ⚠ **EŞİK %85 DEĞİL %96 ve sebebi kayıtta.** Araştırma "C ≤ maksC(L)×0,85" diyor ama
// bu YENİ üretilen rampalar için bir güvenlik payı. Depodaki mavi rampası cusp'ı bilerek
// takip ediyor (her L'de maksın %94–95'i) ve bu bir kusur DEĞİL, tasarımın kendisi:
// markanın mavisi doygun olmak zorunda. %85 eşiği o rampayı haksız yere kırmızıya
// çevirir ve kapı beş gün içinde görmezden gelinirdi. %96, gerçekten kenarda duranı
// yakalıyor — `signal.warn` %99'daydı ve yuvarlama farkında kırpılırdı.
//
// ⚠ Ölçüm ÇEVRİMDIŞI: JSON okur, saf matematik yapar. Ağ yok, tarayıcı yok, `fast` grup.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const f = (t) => (t > 0.0031308 ? 1.055 * Math.pow(t, 1 / 2.4) - 0.055 : 12.92 * t)
const oklchSrgb = (L, C, h) => {
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}
const icerde = (L, C, h) => oklchSrgb(L, C, h).every((v) => v >= -0.0005 && v <= 1.0005)
export const maksKroma = (L, h) => {
  let alt = 0,
    ust = 0.5
  for (let i = 0; i < 40; i++) {
    const m = (alt + ust) / 2
    if (icerde(L, m, h)) alt = m
    else ust = m
  }
  return alt
}
export const hex = (L, C, h) => {
  const [r, g, b] = oklchSrgb(L, C, h).map((v) => Math.max(0, Math.min(1, f(v))))
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

const dir = 'brand'
const TAVAN = 0.96
let kusur = 0
let sayi = 0
const markalar = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())
for (const marka of markalar) {
  const tdir = join(dir, marka.name, 'tokens')
  if (!existsSync(tdir)) continue
  for (const dosya of readdirSync(tdir).filter((x) => x.endsWith('.json'))) {
    const metin = readFileSync(join(tdir, dosya), 'utf8')
    for (const m of metin.matchAll(
      /"([^"]+)":\s*\{[^}]*?"\$value":\s*"oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)"/g
    )) {
      const [, ad, Ls, Cs, hs] = m
      const L = Number(Ls)
      const C = Number(Cs)
      const h = Number(hs)
      sayi += 1
      const mx = maksKroma(L, h)
      const oran = mx === 0 ? Infinity : C / mx
      if (oran > TAVAN) {
        kusur += 1
        console.log(
          `  ✗ ${marka.name}/${dosya.replace('.tokens.json', '')} · ${ad}: ` +
            `oklch(${String(L)} ${String(C)} ${String(h)}) — cusp ${mx.toFixed(3)}, ` +
            `oran ${oran.toFixed(2)} (tavan ${String(TAVAN)}) → ${hex(L, C, h)}`
        )
      }
    }
  }
}
if (kusur > 0) {
  console.log(
    `\n${String(kusur)} token sRGB cusp'ının %${String(TAVAN * 100)}'inin üstünde — ` +
      'kırpılma sessizdir, ton kayar'
  )
  process.exit(1)
}
console.log(`  ${String(sayi)} oklch token · hepsi gamut içinde`)
