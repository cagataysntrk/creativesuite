// İçerik-adresli varlık deposu (§3.5 · R-64 · D-38, D-117).
//
// **Adres içeriğin kendisidir.** Bir varlığın yolu `derived/blobs/<ab>/<sha256>.<ext>`
// ve `<ab>` sha256'nın ilk iki karakteri. Aynı byte iki kez saklanmaz; iki farklı
// çalıştırma aynı görseli üretirse tek dosya olur ve ikisi de aynı adresi gösterir.
//
// **`derived/blobs` gitignore'lu ama TÜRETİLEBİLİR DEĞİL** (§3.5). Ayrım önemli:
// `derived/index` silinip `just reindex` ile geri gelir; bir blob silinirse geri
// gelmesi için üretimin **parası yeniden ödenir**. Bu yüzden git'te değil ama nesne
// deposunda yedeklenir — ve sidecar hangi çalıştırmanın ürettiğini söyler.
//
// **512KB üstü dosya git'e girmez** (R-64). Git LFS kullanılmıyor: LFS bir sunucu
// bağımlılığı ve "kurtarma `git clone` + `cat`" (§16) vaadini kırar.

import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, extname, join } from 'node:path'

export interface BlobRef {
  /** `sha256:` ön ekli — `x_signature` ile aynı biçim, karışmasın diye. */
  readonly digest: string
  /** Repo köküne göreli yol. */
  readonly path: string
  readonly bytes: number
}

/**
 * Varlığın TESLİMAT içindeki yeri (§3.5 · D-248).
 *
 * ⚠ **Bu alanlar sonradan eklenemez.** Damga üretim anında basılır ve retrofit
 * imkânsızdır (7. yasa, R-11). Onlarsız üretilen bir varlık kalıcı olarak sırasızdır:
 * dört slaytlık bir postun hangisinin kapak olduğu bir daha bilinemez. Yüzlerce varlık
 * biriktiğinde sorun "yer yok" değil, **"hangisi neydi"** olur.
 *
 * `deliverableId` bir ÇALIŞTIRMA id'si değil: tek koşu birden çok teslimat üretebilir
 * (reklam matrisi yedi varyant) ve tek teslimat birden çok koşuya yayılabilir (yarıda
 * kalan bir koşu devam ettirilir).
 */
export interface DeliverableRef {
  /** Teslimatın kimliği — bir post, bir carousel, bir video. */
  readonly deliverableId: string
  /** Teslimat tipi: `post` · `carousel` · `video` · `deck` · `ad-variant`. */
  readonly kind: string
  /** Kaçıncı parça (0 tabanlı). Tek parçalı teslimatta `0`. */
  readonly index: number
  /** Toplam parça — `index/total` okunabilir olsun diye. */
  readonly total: number
  /** Parçanın rolü: `kapak` · `govde` · `kapanis` · `varyant` … */
  readonly role: string
}

export interface BlobMeta {
  readonly digest: string
  readonly ext: string
  readonly bytes: number
  /** Üretim damgası — marka + dönem (R-11). Sonradan retrofit imkânsız. */
  readonly stamp: Readonly<Record<string, string>>
  /**
   * Teslimat konumu (D-248) — hangi teslimatın kaçıncı parçası.
   *
   * Eski varlıklarda YOK ve öyle kalacak: retrofit imkânsız (R-11). Kütüphane bunu
   * "bilinmiyor" diye gösteriyor, sıfır diye DEĞİL — ölçülmemiş ile ölçülmüş ayrı.
   */
  readonly deliverable?: DeliverableRef
  /** Uyum iddiası (R-33). Damgasız varlık yayınlanamaz. */
  readonly compliance: Readonly<Record<string, unknown>>
  /** Bu byte'ı üreten çalıştırma. Blob kaybolursa yeniden üretimin adresi. */
  readonly sourceRunId: string
  readonly createdAt: string
}

const sha256 = (buf: Buffer): string => createHash('sha256').update(buf).digest('hex')

/** `derived/blobs/<ab>/<sha256>.<ext>` — `<ab>` dizin dağılımı için ilk iki karakter. */
export const blobPath = (root: string, digestHex: string, ext: string): string =>
  join(root, digestHex.slice(0, 2), `${digestHex}${ext}`)

export const metaPath = (blobFile: string): string => `${blobFile}.meta.json`

export type StoreResult =
  | { readonly ok: true; readonly ref: BlobRef; readonly deduplicated: boolean }
  | { readonly ok: false; readonly error: 'source_missing' | 'write_failed' }

export interface StoreInput {
  /** Kaynak dosya — taşınır, kopyalanmaz (aynı diskteyse atomik). */
  readonly sourcePath: string
  readonly blobRoot: string
  readonly stamp: Readonly<Record<string, string>>
  readonly compliance: Readonly<Record<string, unknown>>
  readonly sourceRunId: string
  readonly createdAt: string
  /**
   * Teslimat konumu. **İsteğe bağlı DEĞİL, geçici olarak opsiyonel**: eski çağıranlar
   * derlensin diye. `varlik-duzeni` kapısı üretim yolunda verilmesini zorluyor.
   */
  readonly deliverable?: DeliverableRef
}

/**
 * Varlığı depoya alır ve sidecar'ı yazar.
 *
 * **Aynı içerik ikinci kez gelirse byte YENİDEN YAZILMAZ** ama sidecar da EZİLMEZ:
 * ilk üretimin `sourceRunId`'si korunur. Ezseydik "bu byte'ı hangi çalıştırma üretti"
 * sorusu son çalıştırmayı gösterirdi ve maliyet defteriyle (§13) çelişirdi — para ilk
 * üretimde harcandı.
 */
export const storeBlob = (input: StoreInput): StoreResult => {
  if (!existsSync(input.sourcePath)) return { ok: false, error: 'source_missing' }

  const buf = readFileSync(input.sourcePath)
  const hex = sha256(buf)
  const ext = extname(input.sourcePath)
  const hedef = blobPath(input.blobRoot, hex, ext)
  const varDi = existsSync(hedef)

  try {
    mkdirSync(dirname(hedef), { recursive: true })
    if (!varDi) {
      // `rename` aynı dosya sistemindeyse atomiktir: yarım yazılmış bir blob,
      // içerik-adresli deponun tek varsayımını (adres = içerik) çiğnerdi.
      try {
        renameSync(input.sourcePath, hedef)
      } catch {
        writeFileSync(hedef, buf)
      }
    }

    const meta = metaPath(hedef)
    if (!existsSync(meta)) {
      const kayit: BlobMeta = {
        digest: `sha256:${hex}`,
        ext,
        bytes: buf.length,
        stamp: input.stamp,
        ...(input.deliverable === undefined ? {} : { deliverable: input.deliverable }),
        compliance: input.compliance,
        sourceRunId: input.sourceRunId,
        createdAt: input.createdAt,
      }
      writeFileSync(meta, `${JSON.stringify(kayit, null, 2)}\n`)
    }
  } catch {
    return { ok: false, error: 'write_failed' }
  }

  return {
    ok: true,
    ref: { digest: `sha256:${hex}`, path: hedef, bytes: buf.length },
    deduplicated: varDi,
  }
}

/**
 * Depodaki bütün sidecar dosyaları — `derived/blobs/<ab>/<sha>.<ext>.meta.json`.
 *
 * ⚠ ⚠ **BU YÜRÜYÜŞÜN ÜÇÜNCÜ KOPYASI YAZILMAK ÜZEREYDİ.** `kutuphane.ts` bir tane
 * taşıyor, `uyum-uc.ts` ikincisini — yorumunda *"aynı desen, aynı sidecar biçimi"*
 * yazıyor, yani kopya olduğunu BİLEREK. Editör damgalamaya başlayınca üçüncüsü
 * gerekecekti. Depo dizilimi (`<ab>` dağılımı) burada tanımlı olduğuna göre okuyucusu
 * da burada olmalı: dağılım değişirse tek yer değişir.
 *
 * ⚠ Depo YOKSA boş dizi — "hiç varlık yok" ile "depo kurulmamış" ayrı sorular ama
 * ikisinin de cevabı boş liste; çağıran dizini kendisi sorabilir.
 */
export const blobSidecarYollari = (blobRoot: string): readonly string[] => {
  const out: string[] = []
  const yur = (d: string): void => {
    if (!existsSync(d)) return
    for (const ad of readdirSync(d)) {
      const t = join(d, ad)
      if (statSync(t).isDirectory()) yur(t)
      else if (ad.endsWith('.meta.json')) out.push(t)
    }
  }
  yur(blobRoot)
  return out
}

/**
 * Bir çalıştırmanın ÜRETTİĞİ varlıklar — sidecar'ı o koşuyu gösterenler.
 *
 * ⚠ ⚠ **AYNI İÇERİK İKİNCİ KEZ GELİRSE SİDECAR EZİLMİYOR** (`storeBlob`), yani bir
 * blob'un `sourceRunId`'si İLK üretenidir. Bu okuyucu o yüzden "bu koşunun ürettiği"
 * diyor, "bu koşuda kullanılan" demiyor — ikisi aynı şey değil ve karıştırmak
 * maliyet defteriyle çelişirdi.
 */
export const kosununBloblari = (
  blobRoot: string,
  runId: string
): readonly { readonly dosya: string; readonly meta: BlobMeta }[] => {
  const out: { dosya: string; meta: BlobMeta }[] = []
  for (const sidecar of blobSidecarYollari(blobRoot)) {
    const dosya = sidecar.replace(/\.meta\.json$/, '')
    const meta = readBlobMeta(dosya)
    if (meta !== null && meta.sourceRunId === runId) out.push({ dosya, meta })
  }
  return out
}

export const readBlobMeta = (blobFile: string): BlobMeta | null => {
  const m = metaPath(blobFile)
  if (!existsSync(m)) return null
  try {
    return JSON.parse(readFileSync(m, 'utf8')) as BlobMeta
  } catch {
    return null
  }
}

/**
 * Deponun bütünlüğünü doğrular: **her dosyanın içeriği kendi adresiyle uyuşmalı.**
 *
 * Bu, `x_signature`'ın blob karşılığı: bozuk bir adres sessizce yanlış varlığı
 * döndürür ve o varlık bir prospect'e gider. Kontrol ucuz, hata pahalı.
 */
export type BlobDefect =
  | { readonly kind: 'digest_mismatch'; readonly path: string; readonly actual: string }
  | { readonly kind: 'meta_missing'; readonly path: string }
  | { readonly kind: 'oversize_for_git'; readonly path: string; readonly bytes: number }

/** R-64: 512KB. Blob deposu git'te değil ama sınır burada da raporlanır. */
export const GIT_SIZE_LIMIT = 512 * 1024

export const verifyBlob = (blobFile: string): readonly BlobDefect[] => {
  const kusurlar: BlobDefect[] = []
  const buf = readFileSync(blobFile)
  const beklenen = blobFile
    .split('/')
    .pop()
    ?.replace(/\.[^.]*$/, '')
  const gercek = sha256(buf)
  if (beklenen !== gercek) {
    kusurlar.push({ kind: 'digest_mismatch', path: blobFile, actual: gercek })
  }
  if (readBlobMeta(blobFile) === null) {
    kusurlar.push({ kind: 'meta_missing', path: blobFile })
  }
  if (statSync(blobFile).size > GIT_SIZE_LIMIT) {
    kusurlar.push({ kind: 'oversize_for_git', path: blobFile, bytes: statSync(blobFile).size })
  }
  return kusurlar
}

// ── adım çıktısı baytı: TESLİMAT DEĞİL, tekrar oynatma kaydı ────────────────
//
// ⚠ ⚠ **BU YOL BİR ÖLÇÜMDEN DOĞDU (D20).** `gorsel-uret`in GİRDİ özeti üç geçişte de
// aynıydı (`39a8c02e`) ama çıktısı her seferinde değişti (`2c1d3c70` → `c642914f` → …):
// insan `tasarim-onayi`nde gördüğü slaytları onaylıyor, yayına BAŞKA slaytlar gidiyor.
// Sebep basit ve yapısaldı: görsel çıktısı gömülü byte taşıdığı için deftere
// yazılmıyordu (R-64) ve "diskte çıktı var mı" sorusu görsel adımlarında hep `hayır`
// dönüyordu.
//
// **Byte'ın yeri burası** (§3.5): `derived/blobs` gitignore'lu ama TÜRETİLEBİLİR DEĞİL —
// silinirse üretimin parası yeniden ödenir. Adım baytı da tam olarak öyle bir şey.
//
// ⚠ Sidecar YOK ve bu kasıtlı: sidecar bir varlığın KÜNYESİ (damga, uyum, teslimat) ve
// bunlar yayınlanan varlığa ait. Adım baytı bir ara üründür; ona künye yazmak, ara ürünü
// teslimat sanmaya davettir. Ayrı uzantı (`.bin`) ve künyesizlik ikisini ayırıyor.
export const storeStepBytes = (blobRoot: string, bayt: Buffer): string | null => {
  try {
    const hex = sha256(bayt)
    const hedef = blobPath(blobRoot, hex, '.bin')
    if (!existsSync(hedef)) {
      mkdirSync(dirname(hedef), { recursive: true })
      writeFileSync(hedef, bayt)
    }
    return `sha256:${hex}`
  } catch {
    // Yazılamadıysa çağıran `null` görüyor ve çıktıyı deftere HİÇ yazmıyor: yarım bir
    // kayıt, olmayan bir kayıttan kötüdür (adım yeniden koşar, doğru davranış).
    return null
  }
}

/** `null` = blob yok. Adım yeniden koşar — bu bir hata değil, dürüst bir cevap. */
export const readStepBytes = (blobRoot: string, digest: string): Buffer | null => {
  const hex = digest.startsWith('sha256:') ? digest.slice(7) : digest
  if (!/^[0-9a-f]{64}$/.test(hex)) return null
  const yol = blobPath(blobRoot, hex, '.bin')
  if (!existsSync(yol)) return null
  try {
    return readFileSync(yol)
  } catch {
    return null
  }
}
