// TEK yol çözücü (§3.8 · chokepoints.json → `yol-cozucu`).
//
// **Somut hata, 2026-08-14:** bir betik `new URL(import.meta.url).pathname` kullandı.
// O ifade Türkçe karakterli dizin adlarında URL-KODLU yol döndürür
// (`/home/…/%C4%B0ndirilenler/…`) ve 44 dosya `~/%C4%B0ndirilenler` diye bir dizine
// yazıldı. Kimse hata almadı; dosyalar sessizce yanlış yere gitti.
//
// Doğrusu `fileURLToPath`. Bu dosya onu tek yerde tutar; `chokepoints` kapısı da
// bozuk biçimi her yerde yasaklar.

import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

/** `import.meta.url` → mutlak dosya yolu. Türkçe dizin adlarında da doğru. */
export const fromFileUrl = (importMetaUrl: string): string => fileURLToPath(importMetaUrl)

/** Modülün bulunduğu dizin. */
export const moduleDir = (importMetaUrl: string): string => dirname(fromFileUrl(importMetaUrl))

/**
 * Repo kökü, çağıran modüle göre.
 * `packages/<ad>/src/x.ts` → üç seviye yukarı çıkar; `up` ile ayarlanır.
 */
export const repoRootFrom = (importMetaUrl: string, up = 3): string =>
  resolve(moduleDir(importMetaUrl), ...Array<string>(up).fill('..'))

export const underRoot = (root: string, ...parts: readonly string[]): string => join(root, ...parts)
