// Fixture — DIŞ DÜNYAYI taklit eder, sistemin parçası değildir.
//
// `claude` CLI kalıcı bir daemon doğuruyor ve stdout borusunu ona devrediyor; CLI ölse
// bile Node'un `close` olayı gelmiyor ve `spawnProcess` sonsuza kadar bekliyordu (D-272).
// Bu dosya o davranışı deterministik olarak yeniden üretiyor.
//
// ⚠ `.mjs` ve `fixtures/` altında: darboğaz kapısı `packages/*/src/**/*.ts` tarıyor ve
// bu dosya TypeScript sistemi değil, SINANAN dış davranış. Kapıyı atlatmak için bölünmüş
// bir tanımlayıcı yazmak (D-77'nin hatası) yerine dosya doğru yere kondu.
import { spawn } from 'node:child_process'

process.stdout.write('merhaba')
spawn(process.execPath, ['-e', 'setTimeout(() => {}, 30000)'], {
  detached: true,
  stdio: ['ignore', 1, 2],
}).unref()
setTimeout(() => process.exit(0), 50)
