// "synthetic": true — alt süreç testi için yardımcı program (§15).
//
// Neden ayrı DOSYA, `node -e` dizesi değil: `secret-okuyucu` darboğazı
// `packages/*/src/**` altında ortam okumasını yasaklar ve grep, kodu dizeden ayırt
// EDEMEZ — etmeye çalışsa yanlış negatif üretir. Çocuk program bir fixture'dır,
// kernel kaynağı değil; yeri burasıdır.
//
// Kullanım: node print-env.cjs <ANAHTAR>  → değeri ya da "undefined" basar.
const anahtar = process.argv[2]
process.stdout.write(String(process.env[anahtar]))
