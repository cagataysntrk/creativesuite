// Sağlayıcı kataloğu — yetenek → adaylar (§8.2 · R-40).
//
// Pipeline YETENEK ister, sağlayıcı istemez. Bu dosya "bu yeteneği kim yapabilir"
// sorusunu cevaplar; **hangisinin seçileceği** yönlendiricinin işidir (FAZ-3.5) ve
// kaybedenler red gerekçesiyle manifest'e yazılır (§13).
//
// Liste KODDA, tanımlayıcı VERİDE (FAZ-3.4). İkisi ayrı şeyleri söylüyor: kod
// "bu sağlayıcıyla nasıl konuşulur"u, tanımlayıcı "ne kadara ve neyi yapar"ı.
// `providers` kapısı ikisinin ayrışmadığını denetler.

import type { Lane, ProviderAdapter } from './types.js'
import { chatSeed } from './chat-seed.js'
import { claudeCode } from './claude-code.js'
import { cloudflareImage } from './image/cloudflare.js'
import { falImage } from './image/fal.js'
import { geminiImage } from './image/gemini.js'
import { localRembg } from './image/rembg.js'

export const ADAPTERS: readonly ProviderAdapter[] = [
  chatSeed,
  claudeCode,
  cloudflareImage,
  falImage,
  // ⚠ Gemini görsel (nano banana) — ÜCRETLİ şerit. Bedava katmanda görsel kotası SIFIR
  // ölçüldü (6 anahtarın 6'sında `limit: 0`), o yüzden `free` şeritte aday değil.
  geminiImage,
  // ⚠ Yerel arka plan silici (D-274). `image.matte` yeteneğinin TEK adayı; yönlendirici
  // yine de listeliyor ve kurulu değilse SEBEBİYLE yazıyor — sessiz atlama yok.
  localRembg,
]

export interface Candidate {
  readonly providerId: string
  readonly title: string
  readonly lanes: readonly Lane[]
  /** Şu an kullanılabilir mi. `false` ise SEBEBİ yazılır — sessiz atlama yok. */
  readonly available: boolean
  readonly unavailableReason: string | null
}

/**
 * Bir yeteneği yapabilen sağlayıcılar. **Kullanılamayanlar da listelenir**:
 * "aday yok" ile "aday var ama kurulu değil" farklı sorunlardır ve kullanıcıya
 * farklı şeyler yaptırır.
 */
export const candidatesFor = (
  capability: string,
  env: Readonly<Record<string, string>>
): readonly Candidate[] =>
  ADAPTERS.filter((a) => a.capabilities().some((c) => c.name === capability)).map((a) => {
    const kullanilabilir = a.available(env)
    return {
      providerId: a.id,
      title: a.title,
      lanes: a.capabilities().find((c) => c.name === capability)?.lanes ?? [],
      available: kullanilabilir,
      unavailableReason: kullanilabilir ? null : `${a.id}: yerel önkoşul sağlanmadı`,
    }
  })

export const adapterById = (id: string): ProviderAdapter | null =>
  ADAPTERS.find((a) => a.id === id) ?? null

/** Katalogdaki tüm yetenek adları — `just plan` ve UI bunu gösterir. */
export const allCapabilities = (): readonly string[] =>
  [...new Set(ADAPTERS.flatMap((a) => a.capabilities().map((c) => c.name)))].sort()
