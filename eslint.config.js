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
      '**/dist-web/**', // Vite derleme çıktısı — üretilmiş dosya denetlenmez
      '**/node_modules/**',
      '**/*.d.ts',
      'docs/**',
      'scripts/gates/**', // kapılar düz Node betiği; kendi disiplinleri var
      // ⚠ ⚠ **`examples/` BİZİM KODUMUZ DEĞİL — referans malzemesi ve gitignore'lu.**
      // Depoya yeni bir referans projesi kopyalandığı an kapı, bizim yazmadığımız ve
      // düzeltemeyeceğimiz kodda 12 hata verip kırmızıya döndü. Bir kapının kendi
      // kapsamı dışındaki koda kızması, kapıyı gürültüye çevirir ve gürültülü kapı
      // okunmaz olur. Kapsam: BU deponun kaynak kodu.
      'examples/**',
    ],
  },

  ...tseslint.configs.recommended,

  // Kullanılmayan bağlayıcılar hata; `_` öneki AÇIK "bilerek kullanılmıyor" işaretidir.
  // Bir sözleşme imzasını (`plan(ctx, input)`) korumak için parametreyi tutmak
  // meşrudur — silmek imzayı bozar. İşaretsiz kullanılmayan değişken ise ölü koddur.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },

  // Kök seviyesindeki yapılandırma dosyaları — tip denetimi dışı, düz JS
  {
    files: ['*.mjs', '*.js'],
    ...tseslint.configs.disableTypeChecked,
  },

  // ── betikler: TANIMSIZ DEĞİŞKEN kapısı (D-153) ────────────────────────────
  //
  // `scripts/**` tip denetimi dışında (JS) ve `tseslint.configs.recommended`
  // `no-undef` İÇERMEZ. Sonuç: 2026-08-15'te bir düzeltme commit'i iki üretim CLI'ının
  // import'unu sildi (`readEnv`, `climbLadder`) ve **24 kapının hiçbiri görmedi** —
  // `just plan` ve `just uret` kırık hâlde yeşil raporlandı.
  //
  // Node globalleri açıkça listelenir: `globals` paketi yok ve 40 satır yazmak bir
  // bağımlılıktan iyidir (R-75). Liste betiklerin gerçekten kullandıklarıyla sınırlı.
  {
    files: ['scripts/**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        AbortController: 'readonly',
        structuredClone: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
    },
  },

  // ── kernel saflığı: 2. katman (§3.2 · R-01 · FAZ-0.C.3) ───────────────────
  //
  // 1. katman `OpaqueAttributes` markası → derleme hatası (özellik erişimini keser).
  // 2. katman BU → `attributes`e DOKUNMAYI keser; derleme hatası vermeyen
  //    `const { attributes } = rec` biçimini de yakalar. Grep bunu KAÇIRIR
  //    (destructuring'de nokta yok) — §3.2 zaten öyle söylüyor.
  // 3. katman Proxy tuzağı → çalışma zamanında atlatılamaz (purity.test.ts).
  {
    files: ['packages/kernel/src/**/*.ts'],
    ignores: ['packages/kernel/src/**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[property.name='attributes']",
          message:
            'R-01: kernel `attributes` okuyamaz. Yol: SELECT → unsealAttributes (yalnız packages/registry) → COMPOSE belge modeli → RENDER (§3.2).',
        },
        {
          selector: "ObjectPattern > Property[key.name='attributes']",
          message:
            'R-01: `attributes` destructuring de okumadır. Grep bunu kaçırır, bu kural kaçırmaz (§3.2).',
        },
      ],
    },
  },

  // ── halka sınırları: her paket kendi yasak listesini alır ──────────────────
  ...RINGS.map((ring) => ({
    files: [`${ring.dir}/**/*.{ts,tsx}`],
    rules: { 'no-restricted-imports': ringRule(ring) },
  }))
)
