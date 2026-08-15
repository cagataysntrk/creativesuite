// Ring 1 — RENDER. Chromium/FFmpeg'e dokunan tek yer (§7.1).
import type { PackageIdentity } from '@suite/contracts'

export const IDENTITY: PackageIdentity = { name: '@suite/render', ring: 'render' }

// Dönem-aşırı kanıt aktarımı (§4.6 · FAZ-2.12)
export {
  checkTransfer,
  formatViolations,
  type ProofReference,
  type TransferConfidence,
  type TransferContext,
  type TransferViolation,
} from './lexicon/transfer.js'

// Chromium'u başlatan TEK yer (§3.8 · D-86) ve statik render (§7.1 · FAZ-3.1)
export {
  withPage,
  type BrowserFailure,
  type BrowserOptions,
  type BrowserResult,
} from './browser.js'
export { renderStatic, toHtml } from './static.js'
