// YAYIN BİÇİMİ — JPEG kalitesi TEK yerden ve ölçülmüş tabanın üstünde (FAZ-19.4 · R-90).
//
// ⚠ ⚠ **DÖRT AYRI YERDE YAZILIYDI ve hiçbir kapı tutmuyordu:** `panorama.ts`,
// `disa-aktar.ts` (iki kez) ve merdivenin kendi ayarı. Biri sessizce düşürülse **gren
// ölçümü ötekiler için konuşmazdı** — ve gren bu fazın en pahalı ölçümlerinden biri:
// düz blok medyan σ 2,26-3,85, **q=90 sonrası 1,62-3,61**.
//
// ⚠ Bu kapı bir SAYIYI değil bir İLİŞKİYİ sınıyor: yayın kalitesi, grenin sağ çıktığı
// ÖLÇÜLEN tabanın altına inemez. Taban değişecekse önce ölçüm yeniden yapılır.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { YAYIN_JPEG_KALITESI, YAYIN_JPEG_TABANI } from './panorama.js'

const SRC = dirname(fileURLToPath(import.meta.url))

describe('yayın biçimi', () => {
  it('yayın kalitesi ÖLÇÜLEN tabanın altına inmiyor', () => {
    expect(YAYIN_JPEG_TABANI, 'gren ölçümünün yapıldığı kalite').toBe(90)
    expect(YAYIN_JPEG_KALITESI).toBeGreaterThanOrEqual(YAYIN_JPEG_TABANI)
    // ⚠ Üst uç da bağlı: 100'e çıkarmak dosyayı şişirir ve gren SORUNU çözülmüş olmaz,
    // yalnız gizlenir. Ölçüm 90'da geçiyor; 92 iki puanlık pay.
    expect(YAYIN_JPEG_KALITESI).toBeLessThanOrEqual(95)
  })

  // ⚠ ⚠ **ÇIPLAK SAYI ARANIYOR: sabit tek yerde ise başka yerde yazılamaz.** Bu, kuralın
  // kendisini değil DAĞILMASINI engelliyor — bu depoda aynı sınıf hata (aynı değerin iki
  // kopyası) bu fazda beş kez çıktı.
  it('kalite hiçbir kaynak dosyada ÇIPLAK yazılmıyor', () => {
    const yanlis: string[] = []
    for (const ad of ['panorama.ts', 'disa-aktar.ts']) {
      const src = readFileSync(join(SRC, ad), 'utf8')
      src.split('\n').forEach((satir, i) => {
        if (/^\s*(\/\/|\*)/.test(satir)) return
        if (/quality:\s*\d+/.test(satir)) yanlis.push(`${ad}:${String(i + 1)}  ${satir.trim()}`)
      })
    }
    expect(yanlis, 'çıplak `quality:` sayısı — tek yetkili `YAYIN_JPEG_KALITESI`').toEqual([])
  })

  // ⚠ Biçim UZANTIDAN türüyor (R-90): Graph API yalnız JPEG kabul ediyor ve hat
  // `slayt-NN.jpg` yazıyor. Uzantı yolu kopunca çıktı sessizce PNG olur ve yayın anında
  // reddedilir — dört görsel ve bir insan onayı harcandıktan SONRA.
  it('biçim uzantıdan türüyor — .jpg JPEG, ötekisi PNG', () => {
    const src = readFileSync(join(SRC, 'panorama.ts'), 'utf8')
    expect(src).toMatch(/\/\\\.jpe\?g\$\/i\.test\(yol\)/)
    expect(src).toContain("type: 'jpeg' as const, quality: YAYIN_JPEG_KALITESI")
  })
})
