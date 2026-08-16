// Marka fontları — GÖMÜLÜ, harici yükleme YOK (§7.2 · R-20, R-21 · D-252).
//
// **Neden base64 gömülü:** `static.ts`in kendi uyarısı bunu söylüyordu — harici bir
// dosya yüklenemezse Chromium **sessizce** sistem fontuna düşer ve çıktı yanlış fontla
// üretilir; kimseye söylemez. Konteyner içinde, ağsız bir kurtarma diskinde ya da
// yalnızca yavaş bir diskte aynı şey olur. Gömülü font bu hata modunu ortadan
// kaldırıyor: font ya HTML'in içindedir ya da hiç yoktur.
//
// **Türkçe için latin-ext ZORUNLU.** `ğ ş İ ı Ğ Ş` latin alt kümesinde YOK. İkisi de
// yükleniyor ve her biri kendi `unicode-range`i ile: tarayıcı hangi glif için hangi
// dosyayı kullanacağını böyle biliyor. Tek dosyaya güvenmek, `İstanbul`u `?stanbul`
// yapan sessiz bir düşüşe kapı açardı.
//
// **Lisans:** ikisi de SIL Open Font License — ticari kullanım ve gömme serbest.
// Lisans metni `brand/<id>/fonts/OFL.txt`te ve o dosya İZLENİR.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Bir yüz ve hangi Unicode aralığını kapsadığı. */
export interface FontYuzu {
  readonly aile: string
  readonly dosya: string
  readonly unicodeRange: string
  /** Değişken font ekseni — `100 900` gibi. Tek ağırlıkta `null`. */
  readonly agirlik: string | null
  /** Değişken genişlik ekseni — `62% 125%`. Yoksa `null`. */
  readonly genislik: string | null
}

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,' +
  'U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'

const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,' +
  'U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,' +
  'U+A720-A7FF'

/**
 * Standart yüz seti. **Kapalı liste** — üçüncü bir aile eklemek bir karar gerektirir,
 * bir import değil. Tip ölçeği kapalı kalmazsa "marka şablonu" bir öneriye dönüşür.
 */
export const YUZLER: readonly FontYuzu[] = [
  // Metin: Inter — geniş latin-ext kapsaması, değişken ağırlık.
  {
    aile: 'Marka Metin',
    dosya: 'Inter-latin.woff2',
    unicodeRange: LATIN,
    agirlik: '400 800',
    genislik: null,
  },
  {
    aile: 'Marka Metin',
    dosya: 'Inter-latin-ext.woff2',
    unicodeRange: LATIN_EXT,
    agirlik: '400 800',
    genislik: null,
  },
  // Display: Archivo — DEĞİŞKEN GENİŞLİK (62–125%). Referanslardaki "Expanded" kapak
  // tipografisi bu eksenden geliyor; ikinci bir dosya indirmeye gerek yok.
  {
    aile: 'Marka Display',
    dosya: 'Archivo-latin.woff2',
    unicodeRange: LATIN,
    agirlik: '400 900',
    genislik: '62% 125%',
  },
  {
    aile: 'Marka Display',
    dosya: 'Archivo-latin-ext.woff2',
    unicodeRange: LATIN_EXT,
    agirlik: '400 900',
    genislik: '62% 125%',
  },
]

export type FontHatasi = { readonly kind: 'eksik_dosya'; readonly dosya: string }

export type FontSonucu =
  | { readonly ok: true; readonly css: string; readonly bayt: number }
  | { readonly ok: false; readonly eksikler: readonly FontHatasi[] }

/**
 * `@font-face` bloklarını base64 gömülü olarak üretir.
 *
 * **Eksik dosya SESSİZCE atlanmaz.** Atlansaydı çıktı sistem fontuyla üretilir ve
 * `ĞÜŞİÖÇ` bozulur — üstelik hiçbir hata görünmezdi. Çağıran hatayı görüp durmak
 * zorunda: yanlış fontla üretilmiş bir varlık, üretilmemiş bir varlıktan kötüdür.
 */
export const fontCss = (fontDizini: string): FontSonucu => {
  const eksikler: FontHatasi[] = []
  const bloklar: string[] = []
  let toplam = 0

  for (const y of YUZLER) {
    const yol = join(fontDizini, y.dosya)
    if (!existsSync(yol)) {
      eksikler.push({ kind: 'eksik_dosya', dosya: y.dosya })
      continue
    }
    const b64 = readFileSync(yol).toString('base64')
    toplam += b64.length
    bloklar.push(
      [
        '@font-face {',
        `  font-family: "${y.aile}";`,
        `  src: url(data:font/woff2;base64,${b64}) format("woff2");`,
        ...(y.agirlik === null ? [] : [`  font-weight: ${y.agirlik};`]),
        ...(y.genislik === null ? [] : [`  font-stretch: ${y.genislik};`]),
        '  font-style: normal;',
        // `swap` YOK: gömülü fontta yükleme gecikmesi olmaz ve `swap` yalnız
        // FOUT riski ekler. Render deterministik olmalı.
        '  font-display: block;',
        `  unicode-range: ${y.unicodeRange};`,
        '}',
      ].join('\n')
    )
  }

  if (eksikler.length > 0) return { ok: false, eksikler }
  return { ok: true, css: bloklar.join('\n'), bayt: toplam }
}
