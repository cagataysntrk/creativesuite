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
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'

export interface BlobRef {
  /** `sha256:` ön ekli — `x_signature` ile aynı biçim, karışmasın diye. */
  readonly digest: string
  /** Repo köküne göreli yol. */
  readonly path: string
  readonly bytes: number
}

export interface BlobMeta {
  readonly digest: string
  readonly ext: string
  readonly bytes: number
  /** Üretim damgası — marka + dönem (R-11). Sonradan retrofit imkânsız. */
  readonly stamp: Readonly<Record<string, string>>
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
