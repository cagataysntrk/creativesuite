// Lucide ikon gövdelerini TS modülüne çevirir (R-81 · D-289).
//
// ⚠ ⚠ **BU DOSYA BİR PLANDAN DÖNÜŞÜN ARACIDIR.** `sablon-ikon.ts` yirmi ikonu ELLE
// çiziyordu ve kendi yorumunda gerekçesini yazıyordu: "40 satır yazmak bir bağımlılıktan
// iyidir", "lisans denetimi istemesin", "kontur markadan gelsin". Üçü de makuldü ve
// üçü de depo sahibinin kuralıyla (R-81) çelişiyor: *"kendin element oluşturma — tasarım
// kütüphanelerinde profesyonel ögeler kullanılmalı"*. Elle çizilmiş bir ikon "bilgisayar
// işi" gibi duruyor çünkü öyle; bir tasarımcının çizdiği ikon ölçülemeyen binlerce kararı
// taşır ve `<line x1= y1=>` taşımaz.
//
// ⚠ **Kontur kalınlığı YİNE markadan geliyor:** Lucide `stroke-width`i `<svg>` üstünde
// taşıyor ve `path`ler onu miras alıyor, yani sarmalayıcıda ezilebiliyor. Eski gerekçenin
// üçüncüsü kayıp DEĞİL.
//
// ⚠ Çıktı ÜRETİLMİŞ dosyadır — elle düzenlenmez, üreteci düzeltilir.

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const IKONLAR = join(REPO, 'packages/render/node_modules/lucide-static/icons')

/**
 * Sözlük → Lucide adı. Sözlük KAPALI kalıyor; değişen tek şey çizimin KAYNAĞI.
 * ⚠ `dongu` için `recycle` seçildi: marka geri kazanım işi yapıyor ve genel bir yenileme
 * oku yerine döngüsellik simgesi hem doğru hem markanın kendi dili.
 */
const ESLEME = {
  onay: 'check',
  uyari: 'triangle-alert',
  saat: 'clock',
  artis: 'trending-up',
  dusus: 'trending-down',
  ayar: 'settings',
  kutu: 'package',
  fabrika: 'factory',
  olcek: 'scale',
  liste: 'list',
  arama: 'search',
  enerji: 'zap',
  katman: 'layers',
  dongu: 'recycle',
  takvim: 'calendar',
  belge: 'file-text',
  ekip: 'users',
  kalkan: 'shield',
  hedef: 'target',
  grafik: 'chart-column',
}

/** `<svg>` sarmalayıcısını atar, yalnız çizim düğümlerini bırakır. */
const govde = (svg) =>
  svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>[\s\S]*$/, '')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .join('')

const satirlar = Object.entries(ESLEME).map(([ad, dosya]) => {
  const svg = readFileSync(join(IKONLAR, `${dosya}.svg`), 'utf8')
  const g = govde(svg)
  if (g === '') throw new Error(`boş gövde: ${dosya}`)
  return `  ${ad}: '${g.replace(/'/g, "\\'")}',`
})

const cikti = [
  '// ÜRETİLMİŞ DOSYA — elle düzenleme, `scripts/ikon-govde.mjs` düzelt.',
  '//',
  '// Kaynak: lucide-static v1.31.0 (ISC). Lisans metni',
  '// `packages/render/node_modules/lucide-static/LICENSE` altında; bağımlılık `package.json`da.',
  '//',
  '// ⚠ Sözlük KAPALI (`IKONLAR`); bu dosya yalnız o sözlüğün ÇİZİMİNİ taşıyor. Yirmi',
  '// birincisi hâlâ bir KARAR ister — üreteçteki eşlemeye bir satır eklemek yetmez.',
  '',
  'export const IKON_GOVDESI: Readonly<Record<string, string>> = {',
  ...satirlar,
  '}',
  '',
].join('\n')

writeFileSync(join(REPO, 'packages/render/src/ikon-govde.ts'), cikti)
console.log(`  ✓ ${satirlar.length} ikon gövdesi üretildi → packages/render/src/ikon-govde.ts`)
