// GROUP: fast
// Her blok tipinin CSS'i HER render yolunda var mı (§7.1 · R-30 · FAZ-7 denetimi).
//
// **Bu kapı bir sınıf hatayı kapatıyor, tek bir hatayı değil.** FAZ 6'da `chart` blok
// tipi eklendi ve onu OKUMASI GEREKEN iki yer güncellenmedi:
//   1. `lexicon` linter'ının `metin()`i → kaynaksız iddia denetimden kaçtı
//   2. `static.ts`in `toHtml`i → grafik CSS'siz çizildi, üretim PNG'sinde bozuk çıktı
// İkisinde de derleyici sustu (`switch` yok, `if` var) ve `just verify` yeşil kaldı.
//
// Kapının mantığı: `DocumentModel`i HTML'e çeviren **her** yol, blok tipinin CSS'ini
// gömmek zorunda. İki yol var (`toHtml` statik, `deckHtml` deck) ve ikisi de aynı
// sabitleri kullanmalı. Üçüncü bir yol eklenirse bu liste büyür — ve büyütmeyi
// unutmak, kapının kendisini kırar (yol dosyası var, listede yok → hata).

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')

/** Blok tipi → CSS'ini taşıyan sabit. Yeni blok tipi eklenince buraya bir satır gelir. */
const BLOK_CSS = {
  chart: 'CHART_CSS',
  diagram: 'DIAGRAM_CSS',
}

/** `DocumentModel` → HTML çeviren yollar. Her biri her sabiti gömmek zorunda. */
const RENDER_YOLLARI = [
  { dosya: 'packages/render/src/static.ts', fn: 'toHtml' },
  { dosya: 'packages/render/src/deck/pdf.ts', fn: 'deckHtml' },
]

const hatalar = []

for (const yol of RENDER_YOLLARI) {
  const src = readFileSync(join(REPO, yol.dosya), 'utf8')
  for (const [tip, sabit] of Object.entries(BLOK_CSS)) {
    // ⚠ **İMPORT SATIRI KULLANIM DEĞİLDİR.** İlk sürüm dosyada dizeyi arıyordu ve
    // `import { CHART_CSS } from …` satırı onu sağlıyordu: kullanımı silsen bile kapı
    // YEŞİL kalıyordu. Kendi ihlal testim yakaladı (R-71) — kapı yazmak yetmiyor,
    // kapının kaçırabileceği biçimi de denemek gerekiyor (D-205).
    //
    // Hem `import` satırları hem yorumlar atılıyor: geriye yalnız gerçek kod kalıyor.
    const kodsuz = src
      .replace(/^\s*import\s[\s\S]*?from\s+'[^']*'\s*$/gm, '')
      .replace(/^\s*(\/\/|\*|\/\*).*$/gm, '')
    if (!kodsuz.includes(sabit)) {
      hatalar.push(
        `${yol.dosya} (${yol.fn}): '${tip}' bloğunun CSS'i (${sabit}) gömülmüyor — ` +
          `blok çizilir ama stilsiz kalır ve bunu ancak çıktıya bakan bir insan görür`
      )
    }
  }
}

// ── blok tipi listesi güncel mi ──────────────────────────────────────────────
// Kernel'de tanımlı ama burada karşılığı olmayan bir blok tipi, bu kapının kör
// noktasıdır. Kapı kendi kapsamının eksildiğini SÖYLEMELİ.
const model = readFileSync(join(REPO, 'packages/kernel/src/doc/model.ts'), 'utf8')
const tipSatiri = /export type BlockType =([^\n]*)/.exec(model)
if (tipSatiri === null) {
  hatalar.push('kernel/doc/model.ts: BlockType bulunamadı — kapı kapsamını doğrulayamıyor')
} else {
  const tipler = [...tipSatiri[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1])
  // Metin taşımayan tipler CSS sabiti gerektirmez; gövde CSS'i zaten `toHtml`de.
  const cssGerektirmeyen = new Set(['heading', 'body', 'image', 'spacer'])
  for (const t of tipler) {
    if (!cssGerektirmeyen.has(t) && BLOK_CSS[t] === undefined) {
      hatalar.push(
        `'${t}' blok tipi kernel'de tanımlı ama bu kapının BLOK_CSS listesinde yok — ` +
          `kapı onu denetlemiyor demektir (kör nokta)`
      )
    }
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} blok CSS bulgusu`)
  process.exit(1)
}

console.log(
  `✓ blok-css: ${Object.keys(BLOK_CSS).length} blok tipi × ${RENDER_YOLLARI.length} render yolu — hepsi gömülü`
)
