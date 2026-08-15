// Ring 1 — REGISTRY. Varlık tipleri, pipeline ve sağlayıcı tanımları (§3.3).
import type { PackageIdentity } from '@suite/contracts'

export const IDENTITY: PackageIdentity = { name: '@suite/registry', ring: 'registry' }

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
