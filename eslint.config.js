// ESLint flat config — halka sınırının 1. katmanı (§3.6 · D-29).
//
// NEDEN AD TABANLI (`no-restricted-imports`), yol tabanlı değil:
// `import-x/no-restricted-paths` import'u ÇÖZMEK zorundadır. Çözemezse kural sessizce
// hiçbir şey demez — yani `dist/` silinmiş bir repoda kapı yeşil raporlar ve hiçbir şeyi
// korumaz (R-71: yeşil kapı hiçbir şey kanıtlamaz). Paket adı ise her zaman oradadır.
// Yol tabanlı denetim `depcruise`'a bırakıldı; o grafiği kendi kurar ve döngü de görür.

import tseslint from 'typescript-eslint'
import { RINGS, forbiddenFor } from './rings.config.mjs'

/** Bir halka için `no-restricted-imports` seçeneği üretir. */
const ringRule = (ring) => {
  const paths = forbiddenFor(ring).map((o) => ({
    name: o.pkg,
    message: `Halka ihlali: ${ring.pkg} → ${o.pkg}. İzinli: ${
      ring.mayImport.length ? ring.mayImport.join(', ') : '(hiçbir paket)'
    }. Yön contracts ← kernel ← {registry,corpus,providers,render} ← engine ← apps (§3.6).`,
  }))

  const patterns = ring.browserOnly
    ? [
        {
          group: ['node:*'],
          message: `${ring.pkg} tarayıcıda çalışır: node:* yerleşiği import edilemez (§12).`,
        },
      ]
    : []

  return ['error', { paths, ...(patterns.length ? { patterns } : {}) }]
}

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.d.ts',
      'docs/**',
      'scripts/gates/**', // kapılar düz Node betiği; kendi disiplinleri var
    ],
  },

  ...tseslint.configs.recommended,

  // Kök seviyesindeki yapılandırma dosyaları — tip denetimi dışı, düz JS
  {
    files: ['*.mjs', '*.js'],
    ...tseslint.configs.disableTypeChecked,
  },

  // ── halka sınırları: her paket kendi yasak listesini alır ──────────────────
  ...RINGS.map((ring) => ({
    files: [`${ring.dir}/**/*.{ts,tsx}`],
    rules: { 'no-restricted-imports': ringRule(ring) },
  }))
)
