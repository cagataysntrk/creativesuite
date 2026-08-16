// GROUP: fast
// Kapı: kodda okunan HER anahtar, runbook'ta bir rotasyon satırı taşımalı (§14 · R-51).
//
// **Nasıl döndürüleceği bilinmeyen bir anahtar, sızdığında döndürülemez.** Sızıntı
// anında "bu neredendi ya" diye aramak, prosedürü uygulamamaktır — ve o an prosedür
// yazmak için en kötü an.
//
// **Sır olmayanlar da tabloda olmak zorunda.** `CF_ACCOUNT_ID` bir sır değil ve
// döndürülemez; ama listede olmasaydı, "unutulmuş anahtar" ile "sır olmadığı için
// yazılmamış anahtar" ayırt edilemezdi. Tabloda bir satırı var ve satır bunu söylüyor.
//
// Kapı iki yönde çalışır: kodda olup tabloda olmayan **hata**; tabloda olup kodda
// olmayan **uyarı** (bir bağımlılık kaldırılmış ama satır kalmış olabilir).

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '../..')

/** Ortam anahtarı olmayan, altyapıya ait adlar. */
const MUAF = new Set(['PATH', 'HOME', 'NODE_ENV', 'CI', 'LC_ALL', 'LANG', 'SUITE_REPO'])

const kaynaklar = []
const yur = (d) => {
  for (const ad of readdirSync(d)) {
    if (ad === 'node_modules' || ad === 'dist' || ad === '.git') continue
    const t = join(d, ad)
    if (statSync(t).isDirectory()) yur(t)
    else if (/\.(ts|mjs)$/.test(t) && !t.includes('.test.')) kaynaklar.push(t)
  }
}
for (const k of ['packages', 'apps', 'scripts']) yur(join(REPO, k))

// `readEnv(...)` ve `ENV_KEYS` tablosundaki `id`/`secret` değerleri.
//
// ⚠ **Yorum satırları çıkarılıyor.** İlk sürüm kendi açıklamasındaki örneği gerçek
// bir anahtar sandı ve kapı kendi üstüne döndü — `chart.js` darboğazının kendi
// modülünü yakalamasıyla aynı sınıf. Bir kapı, kendi belgesiyle kandırılmamalı.
const yorumsuz = (metin) =>
  metin
    .split('\n')
    .filter((satir) => !/^\s*(\/\/|\*|\/\*)/.test(satir))
    .join('\n')

const kodAnahtarlari = new Set()
for (const dosya of kaynaklar) {
  const metin = yorumsuz(readFileSync(dosya, 'utf8'))
  for (const m of metin.matchAll(/readEnv\(\s*'([A-Z][A-Z0-9_]{3,})'/g)) kodAnahtarlari.add(m[1])
  for (const m of metin.matchAll(/(?:id|secret):\s*'([A-Z][A-Z0-9_]{3,})'/g))
    kodAnahtarlari.add(m[1])
  for (const m of metin.matchAll(/env\[\s*'([A-Z][A-Z0-9_]{3,})'\s*\]/g)) kodAnahtarlari.add(m[1])
  for (const m of metin.matchAll(/process\.env\[\s*'([A-Z][A-Z0-9_]{3,})'\s*\]/g))
    kodAnahtarlari.add(m[1])
}
for (const m of MUAF) kodAnahtarlari.delete(m)

const runbook = readFileSync(join(REPO, 'docs/RUNBOOK.md'), 'utf8')
const tabloAnahtarlari = new Set(
  [...runbook.matchAll(/^\|\s*`([A-Z][A-Z0-9_]*)`\s*\|/gm)].map((m) => m[1])
)

const hatalar = []
for (const a of [...kodAnahtarlari].sort()) {
  if (!tabloAnahtarlari.has(a)) {
    hatalar.push(
      `${a} kodda okunuyor ama RUNBOOK rotasyon tablosunda YOK — ` +
        'nasıl döndürüleceği bilinmeyen anahtar, sızdığında döndürülemez (§14)'
    )
  }
}
const uyarilar = [...tabloAnahtarlari]
  .filter((a) => !kodAnahtarlari.has(a))
  .map((a) => `${a} tabloda var ama kodda okunmuyor — bağımlılık kalkmış olabilir`)

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} rotasyonu yazılmamış anahtar`)
  process.exit(1)
}
for (const u of uyarilar) console.log(`  ⚠ ${u}`)
console.log(
  `✓ secret-rotasyon: ${kodAnahtarlari.size} anahtarın hepsi RUNBOOK'ta rotasyon satırı taşıyor`
)
