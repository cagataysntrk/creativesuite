// PNG metadata damgası (§11.3, §4.3 · R-11 · D-115).
//
// **ExifTool yerine kendi chunk yazıcımız.** ExifTool kurulu değil ve kurmak, gözetimsiz
// bir çalıştırmada var olduğu varsayılan bir sistem ikilisi demek — "bir ay ihmal edilse
// de çalışır" (§16) vaadiyle bağdaşmıyor. PNG chunk formatı otuz yıldır sabit ve
// ihtiyacımız olan kısmı ~60 satır: uzunluk · tip · veri · CRC32.
//
// **`iTXt` kullanılıyor, `tEXt` değil.** `tEXt` Latin-1 taşır ve `ğüşıöç` içeren bir
// damgayı sessizce bozar — tam da bu projenin her yerde kaçındığı hata modu. `iTXt`
// UTF-8'dir ve dil etiketi taşır.
//
// **Damga üretim ANINDA basılır** (R-11). Sonradan retrofit imkânsız: hangi varlığın
// hangi dönemden geldiği eşleşmesi kaybolur ve bu, tasarımdaki en pahalı hata.

import { readFileSync, writeFileSync } from 'node:fs'
import type { AssetStamp } from '@suite/kernel'
import type { ComplianceClaim } from './claim.js'

const PNG_IMZA = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** CRC32 tablosu — PNG spesifikasyonundaki polinom (0xEDB88320). */
const CRC_TABLOSU = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

const crc32 = (buf: Buffer): number => {
  let c = 0xffffffff
  for (const b of buf) c = (CRC_TABLOSU[(c ^ b) & 0xff] as number) ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/**
 * `iTXt` chunk'ı kurar.
 *
 * Düzen: `anahtar\0 sikistirmaBayragi sikistirmaYontemi dilEtiketi\0 cevrilmisAnahtar\0 metin`
 * Sıkıştırma kapalı (0): birkaç yüz baytlık damgayı sıkıştırmak, okunabilirliği
 * `zlib` bağımlılığına takas etmek olurdu.
 */
const iTXt = (anahtar: string, metin: string): Buffer => {
  const veri = Buffer.concat([
    Buffer.from(anahtar, 'latin1'), // anahtar Latin-1 (spesifikasyon)
    Buffer.from([0x00, 0x00, 0x00]), // \0 + sıkıştırma bayrağı + yöntem
    Buffer.from('tr', 'latin1'), // dil etiketi
    Buffer.from([0x00, 0x00]), // \0 + boş çevrilmiş anahtar + \0
    Buffer.from(metin, 'utf8'), // ⚠ UTF-8: `ğüşıöç` burada yaşıyor
  ])
  const tip = Buffer.from('iTXt', 'latin1')
  const uzunluk = Buffer.alloc(4)
  uzunluk.writeUInt32BE(veri.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([tip, veri])), 0)
  return Buffer.concat([uzunluk, tip, veri, crc])
}

/** Anahtar adları İngilizce (D-37): metadata anahtarı bir tanımlayıcıdır. */
export const STAMP_KEYS = {
  brand: 'Upcytech:BrandId',
  era: 'Upcytech:EraId',
  kit: 'Upcytech:KitVersion',
  digest: 'Upcytech:DefinitionDigest',
  context: 'Upcytech:ContextManifest',
  run: 'Upcytech:SourceRunId',
  synthetic: 'Upcytech:ContainsSyntheticPerson',
  basis: 'Upcytech:ComplianceBasis',
  aiGenerated: 'Upcytech:AiGenerated',
  disclosure: 'Upcytech:DisclosureRequired',
  software: 'Software',
} as const

export interface StampInput {
  readonly stamp: AssetStamp
  readonly claim: ComplianceClaim
}

const alanlar = (i: StampInput): readonly (readonly [string, string])[] => [
  [STAMP_KEYS.brand, i.stamp.brandId],
  [STAMP_KEYS.era, i.stamp.eraId],
  [STAMP_KEYS.kit, i.stamp.kitVersion],
  [STAMP_KEYS.digest, i.stamp.definitionDigest],
  [STAMP_KEYS.context, i.stamp.contextManifest],
  [STAMP_KEYS.run, i.stamp.sourceRunId],
  // `false` bir dize olarak yazılıyor: metadata'da tip yok, okuyanın yorumu var.
  [STAMP_KEYS.synthetic, String(i.claim.containsSyntheticPerson)],
  [STAMP_KEYS.basis, i.claim.basis.kind],
  [STAMP_KEYS.aiGenerated, String(i.claim.aiGenerated)],
  [STAMP_KEYS.disclosure, String(i.claim.disclosureRequired)],
  [STAMP_KEYS.software, 'Upcytech Creative Suite'],
]

export type StampResult =
  | { readonly ok: true; readonly bytes: number }
  | {
      readonly ok: false
      readonly error: 'not_png' | 'no_iend' | 'not_jpeg' | 'no_sos' | 'unsupported_format'
    }

/**
 * PNG dosyasına damgayı basar. Chunk'lar **IEND'den ÖNCE** eklenir — sonrasına
 * eklenen veri PNG değildir, dosyanın kuyruğuna yapışmış bayttır ve hiçbir okuyucu
 * onu görmez.
 */
export const stampPng = (path: string, input: StampInput): StampResult => {
  const buf = readFileSync(path)
  if (!buf.subarray(0, 8).equals(PNG_IMZA)) return { ok: false, error: 'not_png' }

  const iendIndex = buf.lastIndexOf(Buffer.from('IEND', 'latin1'))
  if (iendIndex < 4) return { ok: false, error: 'no_iend' }
  // IEND chunk'ı 4 baytlık uzunluk alanıyla başlıyor; ekleme noktası onun önü.
  const kesim = iendIndex - 4

  const eklenecek = alanlar(input).map(([k, v]) => iTXt(k, v))
  const yeni = Buffer.concat([buf.subarray(0, kesim), ...eklenecek, buf.subarray(kesim)])
  writeFileSync(path, yeni)
  return { ok: true, bytes: yeni.length - buf.length }
}

// ── JPEG ─────────────────────────────────────────────────────────────────────
//
// ⚠ ⚠ **BU YOL EKSİKTİ ve KAROSEL HATTI ONDAN BERİ HİÇ BİTMİYORDU.** R-90 yayın
// sözleşmesi gereği render'ı JPEG'e çevirdi (Graph API yalnız JPEG kabul ediyor), ama
// damgalayıcı PNG'de kaldı: gerçek bir koşu dört slaydı üretiyor, `gorsel-yargi`ya
// geliyor ve `✗ damgalanamadı: slayt-01.jpg (not_png)` ile ÖLÜYORDU. Görseller diskte
// duruyordu, koşu defterde bitmemiş görünüyordu — panelde ne geçmişte ne varlıklarda.
// Biçim bir uçta değişti, öteki uç güncellenmedi: bu depodaki en sık kusur sınıfı.
//
// ⚠ **Yasa 7 pazarlık konusu değil:** *"Her varlık üretim anında marka + dönem damgası
// alır; sonradan retrofit imkânsız."* Damgayı atlamak ya da yan dosyaya yazmak yasayı
// deler — damga varlıkla BİRLİKTE seyahat etmek zorunda.
//
// ⚠ **COM segmenti seçildi, EXIF değil.** EXIF/XMP yazmak bir TIFF ağacı kurmak demek;
// üç yüz satır ve bir bağımlılık. COM (`FFFE`) JPEG'in kendi yorum segmenti, SOI'nin
// hemen ardına giriyor ve hiçbir kod çözücüyü bozmuyor. Yük UTF-8 JSON: `iTXt`in
// Latin-1 tuzağının (yukarıdaki not) JPEG'deki karşılığı yok, ama Türkçe damga yine
// UTF-8 istiyor.
const JPEG_IMZA = Buffer.from([0xff, 0xd8])
const JPEG_ONEK = 'Upcytech-Stamp\u0000'

/** COM (`FFFE`) segmenti — uzunluk alanı KENDİSİNİ de sayar (JPEG kuralı). */
const comSegmenti = (yuk: Buffer): Buffer => {
  const bas = Buffer.alloc(4)
  bas.writeUInt16BE(0xfffe, 0)
  bas.writeUInt16BE(yuk.length + 2, 2)
  return Buffer.concat([bas, yuk])
}

/**
 * JPEG dosyasına damgayı basar — COM segmenti SOI'nin HEMEN ARDINA.
 *
 * ⚠ Segment SOI'den önce konamaz (dosya JPEG olmaktan çıkar) ve SOS'tan sonra konamaz
 * (orası sıkıştırılmış veri; araya giren bayt görüntüyü bozar).
 */
export const stampJpeg = (path: string, input: StampInput): StampResult => {
  const buf = readFileSync(path)
  if (!buf.subarray(0, 2).equals(JPEG_IMZA)) return { ok: false, error: 'not_jpeg' }
  const govde: Record<string, string> = {}
  for (const [k, v] of alanlar(input)) govde[k] = v
  const yuk = Buffer.from(JPEG_ONEK + JSON.stringify(govde), 'utf8')
  const yeni = Buffer.concat([buf.subarray(0, 2), comSegmenti(yuk), buf.subarray(2)])
  writeFileSync(path, yeni)
  return { ok: true, bytes: yeni.length - buf.length }
}

/**
 * Biçime göre damgalar — çağıranın uzantı tahmin etmesi gerekmiyor.
 *
 * ⚠ İMZADAN karar veriyor, uzantıdan değil: `.jpg` adlı bir PNG damgasız kalırdı ve
 * bunu kimse fark etmezdi.
 */
export const stampAsset = (path: string, input: StampInput): StampResult => {
  const bas = readFileSync(path).subarray(0, 8)
  if (bas.equals(PNG_IMZA)) return stampPng(path, input)
  if (bas.subarray(0, 2).equals(JPEG_IMZA)) return stampJpeg(path, input)
  return { ok: false, error: 'unsupported_format' }
}

/** JPEG COM segmentlerinden damgayı okur. */
const jpegDamgasi = (buf: Buffer): Readonly<Record<string, string>> | null => {
  let i = 2
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) return null
    const isaret = buf[i + 1] ?? 0
    // SOS (`FFDA`) sonrası sıkıştırılmış veri başlıyor: orada segment aranmaz.
    if (isaret === 0xda || isaret === 0xd9) return null
    const uzunluk = buf.readUInt16BE(i + 2)
    if (isaret === 0xfe) {
      const yuk = buf.subarray(i + 4, i + 2 + uzunluk).toString('utf8')
      if (yuk.startsWith(JPEG_ONEK)) {
        try {
          const o = JSON.parse(yuk.slice(JPEG_ONEK.length)) as Record<string, string>
          return o
        } catch {
          return null
        }
      }
    }
    i += 2 + uzunluk
  }
  return null
}

/**
 * Damgayı okur. Ayrıştırıcı **kendi yazdığımızdan bağımsız** çalışır: dosyayı baştan
 * gezer, `iTXt` chunk'larını bulur, anahtar/değer çıkarır. Kendi yazıcımızın çıktısını
 * varsaymak, yazıcı bozulduğunda okuyucunun da bozulması demekti.
 *
 * ⚠ JPEG dalı COM segmentlerini geziyor — aynı gerekçe, farklı kap.
 */
export const readStamp = (path: string): Readonly<Record<string, string>> | null => {
  const buf = readFileSync(path)
  if (buf.subarray(0, 2).equals(JPEG_IMZA)) return jpegDamgasi(buf)
  if (!buf.subarray(0, 8).equals(PNG_IMZA)) return null

  const cikti: Record<string, string> = {}
  let i = 8
  while (i + 8 <= buf.length) {
    const uzunluk = buf.readUInt32BE(i)
    const tip = buf.subarray(i + 4, i + 8).toString('latin1')
    if (tip === 'iTXt') {
      const veri = buf.subarray(i + 8, i + 8 + uzunluk)
      const anahtarSonu = veri.indexOf(0)
      if (anahtarSonu > 0) {
        const anahtar = veri.subarray(0, anahtarSonu).toString('latin1')
        // anahtar\0 + bayrak + yöntem, sonra dil\0, sonra çevrilmişAnahtar\0
        let p = anahtarSonu + 3
        p = veri.indexOf(0, p) + 1
        p = veri.indexOf(0, p) + 1
        if (p > 0 && p <= veri.length) cikti[anahtar] = veri.subarray(p).toString('utf8')
      }
    }
    if (tip === 'IEND') break
    i += 12 + uzunluk
  }
  return cikti
}

/** Damgalanmış bir PNG uyum iddiası taşıyor mu — kapının sorduğu soru. */
export const hasComplianceStamp = (path: string): boolean => {
  const s = readStamp(path)
  return s !== null && s[STAMP_KEYS.synthetic] === 'false' && (s[STAMP_KEYS.basis] ?? '') !== ''
}
