// "synthetic": true — SIGTERM'i yutan alt süreç (§15 · FAZ-1.12).
//
// İki aşamalı öldürmeyi (SIGTERM → grace → SIGKILL) sınamanın tek yolu, ilk sinyali
// GERÇEKTEN yok sayan bir süreçtir.
//
// Neden hazırlık dosyası yazıyor: test önce sabit bir gecikmeyle (50 ms) abort
// ediyordu ve bu YARIŞTI — Node'un açılışı ~50-90 ms sürüyor, handler kurulmadan
// gelen SIGTERM süreci varsayılan davranışla öldürüyor ve `signal` SIGKILL yerine
// SIGTERM oluyordu. Doğrulama agent'ı 2026-08-15'te testi kırmızı yakaladı, ardından
// 18 koşuda tekrar üretemedi: rastgele kırmızıya dönen bir kapı, kapatılan kapıdır.
// Artık test bu dosyanın varlığını bekliyor; sinyal handler kurulduktan SONRA geliyor.
//
// Kullanım: node sigterm-yutan.mjs <hazirlik-dosyasi>
import { writeFileSync } from 'node:fs'

process.on('SIGTERM', () => {})
writeFileSync(process.argv[2], 'hazir')
setInterval(() => {}, 1000)
