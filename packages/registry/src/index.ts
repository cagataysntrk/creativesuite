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
