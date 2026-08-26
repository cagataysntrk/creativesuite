// HEDEF: packages/contracts/src/goruntu-olcu.ts
//
// Görüntü baytından ÖLÇÜ okuma — beyandan değil, dosyanın kendisinden (FAZ-19.12).
//
// ⚠ ⚠ **BU DOSYA BİR BEYANIN YETMEDİĞİ YERDEN DOĞDU.** Depo sahibi: *"paylaşımların
// 1080 x 1440 olması kesin kural artık, bunu da göstermeli sistem doğrulamalı kontrol
// etmeli"*. `VARSAYILAN_TUVAL` zaten 1080×1440 diyordu ve ölçüldüğünde doğruydu — ama
// hiçbir şey ÇIKTIYI sınamıyordu. Bu depoda tekrar eden sınıf tam bu: `kirpma: 'tam'`
// beyanı da doğruydu ve okunmuyordu; `adet: 2` beyanı da doğruydu ve kaymıştı.
// **Bir sayı ancak ÖLÇÜLDÜĞÜ yerde bağlar.**
//
// ⚠ Saf fonksiyon: bayt alır, ölçü döner. Dosya okumaz — `contracts` I/O yapmaz ve
// bu kural yüzünden çağıran katman baytı kendisi getiriyor.
//
// ⚠ Bir bağımlılık eklenmedi (R-75). `sharp` depoda VAR ama onu bu iş için çağırmak
// bir görüntü işleme kütüphanesini yalnız iki tam sayı okumak için başlatmak olurdu;
// JPEG ve PNG başlıkları toplam 40 satır.

export interface GoruntuOlcusu {
  readonly genislik: number
  readonly yukseklik: number
  readonly bicim: 'jpeg' | 'png'
}

/**
 * PNG ölçüsü — IHDR her zaman ilk yığın ve konumu SABİT.
 *
 * İmza 8 bayt, uzunluk 4, tip 4 → genişlik 16. baytta başlıyor.
 */
const png = (b: Uint8Array): GoruntuOlcusu | null => {
  if (b.length < 24) return null
  if (b[0] !== 0x89 || b[1] !== 0x50 || b[2] !== 0x4e || b[3] !== 0x47) return null
  const oku = (i: number): number =>
    ((b[i] as number) << 24) |
    ((b[i + 1] as number) << 16) |
    ((b[i + 2] as number) << 8) |
    (b[i + 3] as number)
  return { genislik: oku(16) >>> 0, yukseklik: oku(20) >>> 0, bicim: 'png' }
}

/**
 * JPEG ölçüsü — SOF işaretçisi ARANIR, konumu sabit DEĞİL.
 *
 * ⚠ ⚠ **KONUMU SABİT SANMAK YAYGIN VE YANLIŞ.** JPEG başında EXIF, ICC profili,
 * yorum ve niceleme tabloları değişken uzunlukta duruyor; ölçü ancak bir SOF
 * (Start Of Frame) çerçevesinde yazılı. Segmentler tek tek atlanarak aranıyor.
 *
 * ⚠ `C4` (Huffman tablosu), `C8` (JPEG uzantısı) ve `CC` (aritmetik kodlama) SOF
 * DEĞİL — aralıkta olmalarına rağmen atlanıyorlar; birini SOF sanmak çöp ölçü verirdi.
 */
const jpeg = (b: Uint8Array): GoruntuOlcusu | null => {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null
  let i = 2
  // ⚠ ⚠ **`i + 9` DEĞİL `i + 8` — bir bayt erken duruyordu.** SOF çerçevesi `i`den
  // `i+8`e kadar dokuz bayt; koşul `i + 9 < uzunluk` olduğunda SOF dosyanın TAM
  // SONUNDAYSA döngü onu okumadan çıkıyor. Gerçek JPEG'de SOF'tan sonra tarama verisi
  // geldiği için üretimde hiç ısırmazdı — kapı, elle kurulmuş asgari bir başlıkla
  // yakaladı. Yalnız gerçek dosyalarla sınanan bir okuyucu bu kusuru hiç görmezdi.
  while (i + 8 < b.length) {
    if (b[i] !== 0xff) {
      i += 1
      continue
    }
    const im = b[i + 1] as number
    // Dolgu baytı (`FF FF`) ve bağımsız işaretçiler: uzunluk alanı yok.
    if (im === 0xff) {
      i += 1
      continue
    }
    if (im === 0xd8 || (im >= 0xd0 && im <= 0xd9)) {
      i += 2
      continue
    }
    const uzunluk = ((b[i + 2] as number) << 8) | (b[i + 3] as number)
    const sof = im >= 0xc0 && im <= 0xcf && im !== 0xc4 && im !== 0xc8 && im !== 0xcc
    if (sof) {
      return {
        yukseklik: ((b[i + 5] as number) << 8) | (b[i + 6] as number),
        genislik: ((b[i + 7] as number) << 8) | (b[i + 8] as number),
        bicim: 'jpeg',
      }
    }
    if (uzunluk < 2) return null
    i += 2 + uzunluk
  }
  return null
}

/**
 * Baytın ölçüsü — okunamazsa `null`.
 *
 * ⚠ `null` "ölçülemedi" demek, "0×0" değil. Çağıran bunu bir kusur olarak bildirmek
 * zorunda: ölçemediğini geçmiş saymak, sınamayı bedava yeşile çevirir.
 */
export const goruntuOlcusu = (bayt: Uint8Array): GoruntuOlcusu | null => png(bayt) ?? jpeg(bayt)
