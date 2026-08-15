// Ring 1 — REGISTRY. Varlık tipleri, pipeline ve sağlayıcı tanımları (§3.3).
import type { PackageIdentity } from '@suite/contracts'

export const IDENTITY: PackageIdentity = { name: '@suite/registry', ring: 'registry' }

export { unsealAttributes, attribute, type UnsealedAttributes } from './attributes.js'

export {
  parsePipeline,
  loadPipeline,
  listPipelines,
  topoOrder,
  type Pipeline,
  type PipelineStep,
  type ResolveError,
  type ResolveResult,
} from './resolve.js'

export {
  parseRecipe,
  loadRecipe,
  listRecipes,
  type ContextRecipe,
  type RecipeSection,
  type RecipeError,
  type RecipeResult,
} from './recipe.js'

export {
  compileTokens,
  inheritTokens,
  toCss,
  toSurfaceCss,
  toTailwind,
  toBrandFacts,
  type FlatToken,
  type TokenError,
  type TokenNode,
  type TokenResult,
  type TokenTier,
  checkChroma,
  formatChroma,
  areaClassOf,
  chromaOf,
  CHROMA_LIMITS,
  type AreaClass,
  type ChromaViolation,
} from './tokens.js'

// Şema göç analizi — kaydetmeden önce kaç kayıt kırılacak (§3.3 · FAZ-4.11).
export {
  diffSchemas,
  migrationImpact,
  impactMessage,
  type SchemaChange,
  type MigrationRecord,
  type MigrationImpact,
  type BrokenRecord,
  type Refusal,
} from './migrate.js'

// Bütçe tavanları — Ring 1, UI'dan ayarlanır (§8.3 · D-17).
export {
  parseButce,
  serializeButce,
  toBudgetCaps,
  butceHatasiMesaji,
  VARSAYILAN as VARSAYILAN_BUTCE,
  type ButceTavanlari,
  type ButceHatasi,
  type ButceSonuc,
} from './butce.js'
