// Fixture — DIŞ DÜNYAYI taklit eder, sistemin parçası değildir.
//
// İki kötü davranışı AYNI ANDA yapar ve gerçek bir asılmanın tam şekli budur:
//   1. `SIGTERM`i yutar → nazik öldürme işe yaramaz.
//   2. stdout borusunu ayrılmış bir toruna devreder → `close` hiç gelmez.
//
// Sonuç: zaman aşımı `SIGTERM` gönderir, süreç ölmez; `SIGKILL` gelene kadar hiçbir
// olay yayılmaz. Eski `spawnProcess` bu noktada beklemeye devam ediyordu ve gerçek
// koşuda `just uret` on beş dakika asılı kaldı.
//
// ⚠ `.mjs` ve `fixtures/` altında: darboğaz kapısı `packages/*/src/**/*.ts` tarıyor ve
// bu dosya TypeScript sistemi değil, SINANAN dış davranış.
import { spawn } from 'node:child_process'

process.on('SIGTERM', () => {})

process.stdout.write('basladi')
spawn(process.execPath, ['-e', 'setTimeout(() => {}, 30000)'], {
  detached: true,
  stdio: ['ignore', 1, 2],
}).unref()

// Kendi başına ASLA bitmez: bitişi ancak `SIGKILL` ya da son çare zamanlayıcısı sağlar.
setInterval(() => {}, 1000)
