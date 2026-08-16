// Strategy Health ucu (§11, §12.9 · R-32 · FAZ-4.16).
//
// **Kurallar burada YAŞAMAZ.** Denetimlerin tamamı `@suite/engine`in `stratejiSagligi`
// fonksiyonundan gelir ve `scripts/lexicon.mjs` kapısı da aynı fonksiyonu çağırır.
// Bu dosyanın işi yalnız girdiyi toplamak: aktif dönem hangisi, izinli hex hangileri.
//
// **Pano rapor yazar, hiçbir şeyi değiştirmez.** Bir kaydı düzeltmek insanın işidir
// (R-14); panonun işi bulguyu kaydın YOLUYLA birlikte vermek — tıklanabilir olması
// için hedefin adı gerekiyor.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { stratejiSagligi, type StratejiSagligi } from '@suite/engine'
import { hexFromTokens } from '@suite/render'

/**
 * Aktif dönem — `brand/<brand_id>/current`, tek satır (§4.3).
 *
 * Okunamazsa `'*'` DÖNMEZ: `'*'` "her dönem" demektir ve dönem-aşırı kanıt denetimini
 * sessizce kapatırdı. Okunamayan dönem bir hatadır ve çağıran bunu görmeli.
 */
export const aktifEra = (repoRoot: string, brandId: string): string | null => {
  const yol = join(repoRoot, `brand/${brandId}/current`)
  if (!existsSync(yol)) return null
  const v = readFileSync(yol, 'utf8').trim()
  return v === '' ? null : v
}

/**
 * Marka paletindeki hex'ler. Üç durum ayrı (D-113): `null` palet tanımsız · `[]` palet
 * var ama hex içermiyor (OKLCH — her hex token dışıdır) · dolu liste.
 */
export const izinliHex = (repoRoot: string): readonly string[] | null => {
  const kok = join(repoRoot, 'brand')
  if (!existsSync(kok)) return null
  const bulunan: string[] = []
  let dosyaVar = false
  for (const marka of readdirSync(kok, { withFileTypes: true })) {
    if (!marka.isDirectory()) continue
    const dizin = join(kok, marka.name, 'derived-tokens')
    if (!existsSync(dizin)) continue
    for (const f of readdirSync(dizin)) {
      if (!f.endsWith('.css')) continue
      dosyaVar = true
      bulunan.push(...hexFromTokens(readFileSync(join(dizin, f), 'utf8')))
    }
  }
  return dosyaVar ? bulunan : null
}

export type SaglikSonuc =
  ({ readonly ok: true } & StratejiSagligi) | { readonly ok: false; readonly hata: string }

export const stratejiPanosu = (repoRoot: string, brandId: string, simdi: string): SaglikSonuc => {
  const era = aktifEra(repoRoot, brandId)
  if (era === null) {
    // Dönemsiz denetim, dönem-aşırı kanıt kuralını kapatır — yani panonun en önemli
    // kontrolünü sessizce iptal eder. Boş bir "temiz" raporu vermektense hata veriyoruz.
    return { ok: false, hata: `aktif dönem okunamadı: brand/${brandId}/current` }
  }
  return {
    ok: true,
    ...stratejiSagligi({ repoRoot, aktifEra: era, simdi, izinliHex: izinliHex(repoRoot) }),
  }
}
