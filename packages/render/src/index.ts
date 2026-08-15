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

// Kapalı düzen kümesi ve taşma bölme (§7.1 · R-23 · FAZ-3.3)
export {
  LAYOUTS,
  LAYOUT_SPECS,
  splitForLayout,
  paginate,
  paginateDocument,
  type LayoutName,
  type LayoutSpec,
  type Overflow,
  type Slide,
} from './layout/enum.js'

export {
  deltaE2000,
  deltaEHex,
  parseHex,
  parseOklch,
  parseColor,
  rgbToLab,
  type Lab,
  type Rgb,
} from './qa/deltae.js'
export {
  formatReading,
  formatReport,
  reading,
  report,
  type QaReport,
  type ToleranceReading,
  type ToleranceStatus,
} from './qa/tolerance.js'
export {
  DEFAULT_LIMITS,
  aspectDeviation,
  measure,
  nearestDeltaE,
  paletteToLab,
  pixelStats,
  textCoverage,
  type BrandPalette,
  type QaInput,
  type QaLimits,
  type PixelStats,
} from './qa/measure.js'
export { samplePng, pngSize, type SampleOptions } from './qa/pixels.js'
export {
  lintDocument,
  formatLexicon,
  hexFromTokens,
  colorsFromTokens,
  MIRAS_YER_TUTUCULAR,
  type LexiconRules,
  type LexiconViolation,
} from './lexicon/linter.js'
export {
  assertCompliance,
  promptRequestsPerson,
  PERSON_PROBES,
  personPatternHits,
  type ComplianceClaim,
  type ComplianceRefusal,
  type ClaimInput,
  type PersonBasis,
} from './compliance/claim.js'
export {
  stampPng,
  readStamp,
  hasComplianceStamp,
  STAMP_KEYS,
  type StampInput,
  type StampResult,
} from './compliance/stamp.js'
