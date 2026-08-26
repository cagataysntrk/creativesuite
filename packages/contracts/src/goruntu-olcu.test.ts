// PAYLAŞIM ÖLÇÜSÜ 1080×1440 — beyan değil BAYT sınanıyor (FAZ-19.12 · madde 8).
//
// ⚠ ⚠ **BU KAPI BİR BEYANIN YETMEDİĞİ YERDEN DOĞDU.** `VARSAYILAN_TUVAL` uzun süredir
// 1080×1440 diyordu ve ölçüldüğünde DOĞRUYDU: on koşunun onu da, 45 slaytın 45'i de bu
// ölçüdeydi. Ama hiçbir şey onu KORUMUYORDU. Bu depoda aynı sınıfın dört örneği var —
// `kirpma: 'tam'` doğruydu ve okunmuyordu, `adet: 2` doğruydu ve kaymıştı, 13 kemer ↔
// 13 vafel doğruydu ve korunmuyordu. **Bugün doğru olan, korunmadıkça yarın bozulur.**
//
// ⚠ ⚠ **VE ASIL SINAMA ALETİN KENDİSİNDE.** "Ölçü tutuyor" sonucu, okuyucunun BOZUK
// olmasından da gelebilir — bu fazda ölçüm araçları defalarca yalan söyledi. O yüzden
// aşağıda çöp bayt, boş bayt ve elle kurulmuş başlıklar da sınanıyor: okuyucu körelirse
// birinci iddia bedava yeşil kalır, ötekiler hemen kırmızı döner.

import { describe, expect, it } from 'vitest'
import { goruntuOlcusu } from './goruntu-olcu.js'
import { TUVAL_3_4, TUVAL_4_5, VARSAYILAN_TUVAL } from './placement.js'

/** Elle kurulmuş PNG başlığı: imza + IHDR uzunluğu + tip + genişlik/yükseklik. */
const pngBasligi = (g: number, y: number): Uint8Array => {
  const b = new Uint8Array(24)
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0)
  b.set([0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52], 8)
  const yaz = (i: number, v: number): void => {
    b[i] = (v >>> 24) & 0xff
    b[i + 1] = (v >>> 16) & 0xff
    b[i + 2] = (v >>> 8) & 0xff
    b[i + 3] = v & 0xff
  }
  yaz(16, g)
  yaz(20, y)
  return b
}

/**
 * Elle kurulmuş JPEG: SOI + DEĞİŞKEN uzunlukta bir APP0 + SOF0.
 *
 * ⚠ APP0 KASITLI: JPEG'de ölçünün konumu SABİT DEĞİL, aranmak zorunda. Sabit konumdan
 * okuyan bir sürüm bu baytta yanlış cevap verir — yani bu test okuyucunun gerçekten
 * segment atladığını sınıyor, yalnız "bir sayı döndü mü"yü değil.
 */
const jpegBasligi = (g: number, y: number): Uint8Array =>
  // ⚠ `Uint8Array.from` — ilk sürüm bir `reduce` numarasıyla DÜZ DİZİ döndürüyordu ve
  // okuyucu `undefined` veriyordu. Testin kendi yardımcısı da bir alettir ve o da
  // bozulabilir; buradaki kırmızı okuyucuyu değil, yardımcıyı yakaladı.
  Uint8Array.from([
    0xff,
    0xd8,
    // APP0, uzunluk 16, içerik dolgu
    0xff,
    0xe0,
    0x00,
    0x10,
    ...new Array<number>(14).fill(0x20),
    // SOF0, uzunluk 17, hassasiyet 8, yükseklik, genişlik
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    (y >>> 8) & 0xff,
    y & 0xff,
    (g >>> 8) & 0xff,
    g & 0xff,
  ])

describe('paylaşım ölçüsü', () => {
  // ── 1: SÖZLEŞME — varsayılan tuval 1080×1440 ─────────────────────────────
  it('varsayılan tuval 1080×1440 (3:4)', () => {
    expect(
      `${String(VARSAYILAN_TUVAL.genislik)}x${String(VARSAYILAN_TUVAL.yukseklik)}`,
      'Instagram artık 3:4 gösteriyor; 4:5 ızgarada her yandan 34 px kırpılıyordu'
    ).toBe('1080x1440')
    expect(VARSAYILAN_TUVAL.oran).toBe('3:4')
  })

  // ⚠ 4:5 SİLİNMİYOR ve bu bir gevşetme değil: Meta REKLAMI 3:4 kabul etmiyor
  // (asgari oran 400×500). Reklam kreatifi üreten bir hat `TUVAL_4_5`i AÇIKÇA istemeli.
  it('4:5 hâlâ tanımlı — reklam yolu onu ZORUNLU kılıyor', () => {
    expect(`${String(TUVAL_4_5.genislik)}x${String(TUVAL_4_5.yukseklik)}`).toBe('1080x1350')
    expect(TUVAL_3_4).toStrictEqual(VARSAYILAN_TUVAL)
  })

  // ── 2: OKUYUCU — bayttan doğru okuyor mu ─────────────────────────────────
  it('PNG ve JPEG başlığından ölçü okunuyor', () => {
    expect(goruntuOlcusu(pngBasligi(1080, 1440))).toStrictEqual({
      genislik: 1080,
      yukseklik: 1440,
      bicim: 'png',
    })
    expect(
      goruntuOlcusu(jpegBasligi(1080, 1440)),
      'JPEG ölçüsü SABİT konumda değil — SOF aranmak zorunda'
    ).toStrictEqual({ genislik: 1080, yukseklik: 1440, bicim: 'jpeg' })
  })

  // ── 3: ALETİN KENDİSİ SINANIYOR — "ihlal yok" bedava olmasın ─────────────
  it('okunamayan bayt `null` dönüyor — sıfır DEĞİL', () => {
    for (const [ad, b] of [
      ['boş', new Uint8Array(0)],
      ['çöp', new TextEncoder().encode('bu bir görüntü değil, düz metin')],
      ['kırık PNG imzası', pngBasligi(1080, 1440).map((v, i) => (i === 1 ? 0 : v))],
    ] as const) {
      expect(goruntuOlcusu(b), `${ad}: ölçülemeyen bayt geçmiş sayılamaz`).toBeNull()
    }
  })

  // ⚠ ⚠ **KASTEN İHLAL: yanlış ölçü YAKALANMAK zorunda.** Okuyucu her baytta
  // 1080×1440 döndürseydi yukarıdaki iddialar da yeşil kalırdı ve kapı hiçbir şey
  // korumazdı. Burada 4:5 bir bayt veriliyor ve 3:4'ten AYRIŞTIĞI görülüyor.
  it('yanlış ölçü YAKALANIYOR — 4:5 bayt 3:4 sanılmıyor', () => {
    const dortBes = goruntuOlcusu(jpegBasligi(1080, 1350))
    expect(dortBes?.yukseklik, 'okuyucu körelmiş: her bayta aynı ölçüyü veriyor').toBe(1350)
    expect(dortBes?.yukseklik).not.toBe(VARSAYILAN_TUVAL.yukseklik)
  })
})
