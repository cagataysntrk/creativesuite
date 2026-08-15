// dependency-cruiser — halka sınırının 2. katmanı (§3.6 · D-29).
//
// ESLint tek bir dosyaya bakar; depcruise GRAFİĞE bakar. Fark döngülerde ortaya çıkar:
// a→b→c→a zincirinin hiçbir halkası tek başına kural ihlal etmez, zincir eder.
// Ayrıca klasör kapsamında da döngü arar — modül seviyesinde temiz görünen bir paket
// çifti, klasör seviyesinde birbirine kilitlenmiş olabilir.
//
// `no-unresolvable` bilerek HATA: çözülemeyen bir import, halka kuralının o kenarı
// hiç görmemesi demektir. Sessizce yeşil kalmaktansa kırmızı olsun (R-71).

import { RINGS, forbiddenFor } from './rings.config.mjs'

/** @type {import('dependency-cruiser').IConfiguration} */
const config = {
  forbidden: [
    ...RINGS.flatMap((ring) => {
      const rules = []
      const banned = forbiddenFor(ring)

      if (banned.length) {
        rules.push({
          name: `halka-${ring.id}`,
          comment: `${ring.pkg} yalnız şunları import edebilir: ${
            ring.mayImport.join(', ') || '(hiçbir paket)'
          }`,
          severity: 'error',
          from: { path: `^${ring.dir}/` },
          to: { path: `^(${banned.map((o) => o.dir).join('|')})/` },
        })
      }

      if (ring.browserOnly) {
        rules.push({
          name: `tarayici-${ring.id}`,
          comment: `${ring.pkg} tarayıcıda çalışır: Node yerleşiği import edemez`,
          severity: 'error',
          from: { path: `^${ring.dir}/` },
          to: { dependencyTypes: ['core'] },
        })
      }

      return rules
    }),

    {
      name: 'dongu-modul',
      comment: 'Modül döngüsü. Halka yönü tek yönlüdür (§3.6).',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'dongu-klasor',
      comment: 'Klasör döngüsü — modül seviyesinde görünmez, mimari olarak ölümcül.',
      severity: 'error',
      scope: 'folder',
      from: {},
      to: { circular: true },
    },
    {
      name: 'cozulemeyen',
      comment:
        'Çözülemeyen import. Kenar grafiğe girmediği için halka kuralı onu DENETLEMEZ — ' +
        'bu yüzden hata sayılır, uyarı değil.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],

  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|node_modules)/' },
    tsPreCompilationDeps: true,
    combinedDependencies: false,

    // `development` koşulu paketleri KAYNAĞA çözer. Böylece halka denetimi
    // `tsc -b` çalışmamışken de gerçek kenarları görür — build sırasına bağımlı
    // bir kapı, build atlandığı gün sessizce hiçbir şey denetlemeyen bir kapıdır.
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['development', 'import', 'node', 'default'],
      mainFields: ['module', 'main'],
      extensions: ['.ts', '.tsx', '.js', '.mjs'],
    },
  },
}

export default config
