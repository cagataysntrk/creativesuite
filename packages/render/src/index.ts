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
  withOturum,
  type Oturum,
  type BrowserFailure,
  type BrowserOptions,
  type BrowserResult,
} from './browser.js'
export { renderWithinLimit, type LadderRender } from './static.js'
// Karosel şablon grameri (D-254) — sabitler de dışa aktarılıyor: kapı ve ölçüm
// betikleri bunları OKUMAK zorunda; ayrı kopya tutmak iki gerçek üretirdi.
export { SINIR_MIN, SINIR_MAX, guvenliMetinYuzdesi } from './sablon.js'
export { suslemeler, suslemeSvg, SUSLEME_TIPLERI, type Susleme } from './sablon-susleme.js'
export { VARSAYILAN, guvenliYuzde, type SablonParametreleri } from './sablon-parametre.js'
export { ikonSec, ikonSvg, IKONLAR, type IkonAdi } from './sablon-ikon.js'
export { planDenetle, uyumsuzlukOzeti, type Uyumsuzluk } from './plan-denetim.js'
export {
  markaIsaretiSvg,
  markaKilidi,
  markaCss,
  bosluk,
  BOSLUK_ORANI,
  EN_KUCUK_PX,
} from './marka-isareti.js'
export {
  TIPO_EFEKTLERI,
  OPENTYPE_CSS,
  vurguCss,
  konturCss,
  degradeCss,
  golgeCss,
  knockoutCss,
  vurguyuIsaretle,
  type TipoEfekti,
} from './sablon-tipo.js'
export {
  duotoneSvg,
  duotoneCss,
  VARSAYILAN_UCLAR,
  kanal,
  type DuotoneUclari,
} from './sablon-filtre.js'
export { duzenSec } from './layout/secim.js'
export { renderStatic, toHtml } from './static.js'
// Tasarım metrikleri — saf katman (FAZ-10.3 · D-255)
export {
  tasarimOlc,
  tipografiSay,
  kontrastOrani,
  KELIME_TAVANI,
  KENAR_PAYI,
  type TasarimGirdisi,
} from './tasarim-olcum.js'

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
  promptDigest,
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
export {
  PLACEMENTS,
  QUALITY_LADDER,
  climbLadder,
  formatLadder,
  placementById,
  specAgeDays,
  specStaleness,
  type SpecStaleness,
  safeBand,
  safeAreaViolations,
  safeAreaMessage,
  type SafeArea,
  type SafeBand,
  type SafeAreaViolation,
  type Rect,
  type Placement,
  type QualityRung,
  type LadderResult,
} from './specs/placements.js'
export {
  measureGolden,
  diffMetrics,
  formatDiff,
  PROOF_TEXT,
  type GoldenMetrics,
  type TextMetric,
  type GlyphMetric,
  type MetricDiff,
} from './golden/metrics.js'

// Altyazı (§7.5 · FAZ-5.5). Yazıcı SAF: ASR bağlantısı ayrı bir adım (5.5b).
export {
  toAss,
  assHataMesaji,
  type WordTiming,
  type CaptionLine,
  type AssError,
  type AssResult,
} from './captions/ass.js'

// Demo yakalama (§7.7 · FAZ-5.6). Tarayıcıya ve sürece DOKUNMAZ: şema + argüman.
export {
  validateTimeline,
  loadTimeline,
  zoomOrigin,
  chapters,
  timelineHataMesaji,
  type Box,
  type ClickTarget,
  type CaptureTimeline,
  type TimelineError,
  type TimelineResult,
} from './capture/timeline.js'
export {
  captureArgs,
  xvfbArgs,
  captureHataMesaji,
  type CaptureOptions,
  type CaptureArgError,
  type CaptureArgResult,
} from './capture/ffmpeg.js'

// reels deterministik türetme (§10 · FAZ-5.8). Video KESMEZ: dikdörtgen ve süre hesaplar.
export {
  deriveReels,
  cropFor,
  textBand,
  reelsHataMesaji,
  MIN_KLIP_SN,
  MAX_KLIP_SN,
  type Reel,
  type CropRect,
  type ReelsError,
  type ReelsResult,
} from './capture/reels.js'

// Çok en-boy render (§10 · FAZ-5.9). Punto sabit, bütçe en-boya göre daralır.
export {
  layoutAcrossAspects,
  budgetFor,
  EXPLAINER_ASPECTS,
  MASTER,
  type ExplainerAspect,
  type AspectLayout,
} from './layout/coklu-enboy.js'

// Deck PDF (§7.6 · FAZ-6.1). ÜÇÜNCÜ RENDERER YOK: aynı Chromium, aynı toHtml, page.pdf().
export {
  KALITE_MERDIVENI,
  LINKEDIN_DOC_MAX_SAYFA,
  LINKEDIN_PLATFORM_MAX_SAYFA,
  VARSAYILAN_BAYT_TAVANI,
  isLinkedinDocError,
  renderLinkedinDocument,
  type LinkedinDocError,
  type LinkedinDocResult,
} from './deck/linkedin.js'
export { irJson, isIrError, parseIr, type IrError, type IrFile } from './deck/ir.js'
export {
  deckHtml,
  deckPages,
  renderDeckPdf,
  type DeckPage,
  type DeckPdfResult,
} from './deck/pdf.js'

// ── grafik katmanı (FAZ-6.2) ────────────────────────────────────────────────
// Geometri SVG, metin HTML: hiçbir yerde metin genişliği tahmin edilmiyor (D-209).
export {
  CHART_CSS,
  chartHtml,
  isChartError,
  type ChartError,
  type ChartResult,
  type ChartSpec,
} from './charts/chart.js'
export { kacir } from './html.js'
export {
  COMPARE_CSS,
  compareHtml,
  isCompareError,
  type CompareError,
} from './charts/karsilastirma.js'
export { niceAxis, norm, sayiTr, type Axis } from './charts/scale.js'
export {
  DIAGRAM_CSS,
  MAX_DUGUM,
  diagramHtml,
  isDiagramError,
  type DiagramError,
  type DiagramNode,
  type DiagramSpec,
} from './charts/diagram.js'
export {
  captureProductShot,
  productCaptureBasis,
  usableAsProductShot,
  type ProductShot,
  type ProductShotInput,
  type ProductShotRefusal,
} from './capture/product.js'

// Marka fontları — base64 gömülü, latin+latin-ext (§7.2 · D-252).
export { fontCss, YUZLER, type FontYuzu, type FontSonucu } from './fonts.js'

// Karosel şablon grameri — slayt kimliğinden kompozisyon (§7.1 · D-254).
export {
  alanRolleri,
  akanEgri,
  egriSagda,
  hayaletRakam,
  sayacEtiketi,
  navIsareti,
  type AlanRolleri,
} from './sablon.js'
