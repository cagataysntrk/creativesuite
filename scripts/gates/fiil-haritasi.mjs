// GROUP: fast
// Kapı: dokuz fiilin HEPSİ üretim fiil haritasında olmalı (§3.10 · R-02, R-04).
//
// **Aynı hata iki fazda tekrarladı ve ikisini de bir denetim agent'ı buldu:**
//   FAZ 6 · `INGEST` (D-216) — şelale, karantina, köken sidecar'ı yazılmıştı; gövdesi
//     yoktu ve `uret.mjs`in haritasında anahtarı geçmiyordu. `arastir` adımı
//     çalıştırılamıyordu.
//   FAZ 7 · `PUBLISH` (D-222) — kapılar, sıra, defter, limiter, OAuth yazılmıştı; gövde
//     yoktu ve haritada anahtar yoktu. `publish()`in tek çağıranı testlerdi.
//
// **Neden iki kez oldu:** bir yetenek "bitti" sanılıyor çünkü **modülü ve testi var**.
// Modül var, test yeşil, kapı yeşil — ama üretimden hiçbir yol oraya varmıyor. Eksik
// olan hep aynı tek satır: fiil haritasındaki anahtar.
//
// İnsan hafızası bunu iki kez tutamadı; kapı tutar.
//
// **İKİ SORU, İKİ AYRI KÖRLÜK.** Kapının ilk hâli yalnız fiil haritasını sayıyordu ve
// 2. doğrulama turu onu da aştı: `PUBLISH` haritadaydı ama `grep -rn PUBLISH registry/`
// sıfır satır veriyordu — **hiçbir hat onu çağırmıyordu**. Yani zincir bir seviye
// yukarıda kopuktu. Bu yüzden kapı iki şeyi birden sorar:
//   1. fiilin gövdesi üretim haritasında BAĞLI mı
//   2. o fiili çağıran en az bir HAT var mı
// "Çağıran var mı" sorusu tek adım için değil, ZİNCİR için sorulmalı (D-216).
//
// **Bilinçli boşluk BEYAN edilir.** Bir fiil kasten bağlanmamışsa `BEKLEYEN` listesine
// gerekçesiyle yazılır — sessizce eksik olmakla, bilerek eksik olmak arasındaki fark
// bu dosyada görünür.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * Kasten bağlanmamış fiiller — her biri bir GEREKÇE taşımak zorunda.
 * Boş olması iyi bir işarettir: bugün dokuzu da bağlı.
 */
const BEKLEYEN = {
  // Hattan çağrılmayan fiiller — gerekçeli. `RESOLVE` her hattın ilk adımı olduğu için
  // burada olamaz; aşağıdakiler yapısal olarak hat dışıdır.
  hat: {
    INGEST:
      'prospect-deck hattında var; başka hatlarda gerekmiyor — kapı zaten en az BİR hat arıyor',
  },
}

const sozlesme = JSON.parse(readFileSync(join(REPO, 'packages/kernel/verbs.json'), 'utf8'))
const fiiller = sozlesme.verbs.map((v) => v.name)

const uret = readFileSync(join(REPO, 'scripts/uret.mjs'), 'utf8')
const blok = /\n  verbs: \{\n([\s\S]*?)\n  \},\n/.exec(uret)

const hatalar = []
if (blok === null) {
  hatalar.push('scripts/uret.mjs içinde `verbs: {` haritası bulunamadı — kapı KÖR kalır')
}

// Anahtarlar: `    PUBLISH: publishBody({` ya da `    RESOLVE: resolveBody,`
const bagli = new Set(
  blok === null ? [] : [...blok[1].matchAll(/^\s{4}([A-Z]+):/gm)].map((m) => m[1])
)

for (const f of fiiller) {
  if (bagli.has(f)) continue
  if (f in BEKLEYEN) {
    console.log(`  · ${f} bilerek bağlı değil — ${BEKLEYEN[f]}`)
    continue
  }
  hatalar.push(
    `${f} fiili üretim haritasında YOK — gövdesi olsa bile üretimden erişilemez ` +
      `(D-216 · D-222: aynı hata iki fazda tekrarladı)`
  )
}

// Ters yön: haritada olup sözleşmede olmayan bir anahtar, onuncu fiildir (R-02).
for (const b of bagli) {
  if (!fiiller.includes(b)) {
    hatalar.push(`${b} haritada var ama verbs.json'da YOK — onuncu fiil bir D-nn ister (R-02)`)
  }
}

// ── 2. hat erişilebilirliği: fiili ÇAĞIRAN en az bir hat var mı ──────────────
const HATLAR = join(REPO, 'registry/pipelines')
const hatMetni = readdirSync(HATLAR)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => readFileSync(join(HATLAR, f), 'utf8'))
  .join('\n')
// `verb: PUBLISH` — YORUM SATIRLARI SAYILMAZ: yorumda geçen bir fiil adı, o fiili
// çağıran bir adım değildir ve kapıyı kendi açıklamasıyla kandırmak mümkün olmamalı.
const hattaGecen = new Set(
  hatMetni
    .split('\n')
    .filter((satir) => !satir.trim().startsWith('#'))
    .flatMap((satir) => [...satir.matchAll(/^\s*verb:\s*([A-Z]+)\s*$/g)].map((m) => m[1]))
)

for (const f of fiiller) {
  if (hattaGecen.has(f)) continue
  hatalar.push(
    `${f} fiilini çağıran HAT yok — gövdesi bağlı olsa bile hiçbir çalıştırma onu ` +
      `ateşleyemez (registry/pipelines/). "Çağıran var mı" ZİNCİR için sorulur (D-216)`
  )
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} bağlanmamış fiil — modül + test, ÜRETİM YOLU demek değildir`)
  process.exit(1)
}
console.log(`✓ fiil-haritasi: ${fiiller.length} fiilin hepsi üretim haritasında bağlı`)
