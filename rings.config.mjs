// Halka tablosu — TEK OTORİTE (§3.1, §3.6 · D-29).
//
// Bu dosya üç ayrı zorlama mekanizmasını besler:
//   1. eslint.config.js        → ad tabanlı `no-restricted-imports` (çözümleme gerektirmez)
//   2. .dependency-cruiser.mjs → grafik tabanlı halka + döngü kuralları
//   3. tsconfig project references → derleyici seviyesinde (paketlerin kendi tsconfig'i)
//
// Üçü de BURADAN okur. Bir halkayı gevşetmek için tek satır değiştirmek yeterlidir —
// ve o tek satır git diff'te görünür. Üç ayrı yerde üç ayrı liste tutmak, birinin
// sessizce bayatlaması demekti.
//
// Yön: contracts ← kernel ← {registry, corpus, providers, render} ← engine ← apps
// Kardeş yasağı: aynı katmandaki paketler birbirini import ETMEZ. Bir kardeşe ihtiyaç
// duyulursa yol yukarıdan (engine) geçer — yoksa katman kavramı çöker ve döngü doğar.

/**
 * @typedef {object} Ring
 * @property {string}   id          kısa kimlik (kurallarda ve mesajlarda geçer)
 * @property {string}   dir         repo köküne göre dizin
 * @property {string}   pkg         npm paket adı
 * @property {string[]} mayImport   import edebileceği halka id'leri — bu liste TAM'dır
 * @property {boolean} [browserOnly] true ise `node:*` yerleşikleri yasak
 */

/** @type {readonly Ring[]} */
export const RINGS = [
  {
    id: 'contracts',
    dir: 'packages/contracts',
    pkg: '@suite/contracts',
    mayImport: [],
  },
  {
    id: 'kernel',
    dir: 'packages/kernel',
    pkg: '@suite/kernel',
    mayImport: ['contracts'],
  },
  {
    id: 'registry',
    dir: 'packages/registry',
    pkg: '@suite/registry',
    mayImport: ['contracts', 'kernel'],
  },
  {
    id: 'corpus',
    dir: 'packages/corpus',
    pkg: '@suite/corpus',
    mayImport: ['contracts', 'kernel'],
  },
  {
    id: 'providers',
    dir: 'packages/providers',
    pkg: '@suite/providers',
    mayImport: ['contracts', 'kernel'],
  },
  {
    id: 'render',
    dir: 'packages/render',
    pkg: '@suite/render',
    mayImport: ['contracts', 'kernel'],
  },
  {
    id: 'engine',
    dir: 'packages/engine',
    pkg: '@suite/engine',
    mayImport: ['contracts', 'kernel', 'registry', 'corpus', 'providers', 'render'],
  },
  {
    // Paylaşılan React bileşenleri. Sunucu tarafını GÖRMEZ — bir bileşen alt süreç
    // başlatabilseydi, "kabuk bir izleme kabinidir" tezi ilk gün çöpe giderdi.
    id: 'ui',
    dir: 'packages/ui',
    pkg: '@suite/ui',
    mayImport: ['contracts'],
    browserOnly: true,
  },
  {
    id: 'app-server',
    dir: 'apps/server',
    pkg: '@suite/app-server',
    mayImport: ['contracts', 'kernel', 'registry', 'corpus', 'providers', 'render', 'engine'],
  },
  {
    id: 'app-cli',
    dir: 'apps/cli',
    pkg: '@suite/app-cli',
    mayImport: ['contracts', 'kernel', 'registry', 'corpus', 'providers', 'render', 'engine'],
  },
  {
    id: 'app-ui',
    dir: 'apps/ui',
    pkg: '@suite/app-ui',
    mayImport: ['contracts', 'ui'],
    browserOnly: true,
  },
]

/** @param {string} id */
export const ringOf = (id) => {
  const r = RINGS.find((x) => x.id === id)
  if (!r) throw new Error(`rings.config.mjs: bilinmeyen halka "${id}"`)
  return r
}

/** Bir halkanın import ETMEMESİ gereken halkalar. */
export const forbiddenFor = (ring) =>
  RINGS.filter((o) => o.id !== ring.id && !ring.mayImport.includes(o.id))
