// Tek test koşucusu: Vitest (§15).
//
// `resolve.conditions` içinde `development`: workspace paketleri KAYNAĞA çözülür.
// Böylece testler `tsc -b` çalışmamışken de gerçek kodu görür — build sırasına bağlı
// bir test paketi, build atlandığı gün bayat `dist/`'i test eden bir pakettir.

import { defineConfig } from 'vitest/config'

const CONDITIONS = ['development', 'import', 'node', 'default']

export default defineConfig({
  resolve: { conditions: CONDITIONS },
  ssr: { resolve: { conditions: CONDITIONS } },
  test: {
    include: ['packages/*/src/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
    environment: 'node',
    // Global `describe/it` YOK: her test dosyası ne kullandığını import eder.
    // Örtük global, bir dosyanın hangi koşucuda çalıştığını okunamaz yapar.
    globals: false,
    restoreMocks: true,
    // Ağa çıkan bir test sessizce yavaşlar ve CI'da rastgele düşer; msw dışı her
    // istek zaten `onUnhandledRequest: 'error'` ile patlar (§15).
    testTimeout: 10_000,
  },
})
