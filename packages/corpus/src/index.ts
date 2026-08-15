// Ring 2 — CORPUS. Tek yazma darboğazı ve türetilmiş indeks (§3.5).
import type { PackageIdentity } from '@suite/contracts'

export const IDENTITY: PackageIdentity = { name: '@suite/corpus', ring: 'corpus' }

export {
  parseFrontmatter,
  serializeFrontmatter,
  type ParsedFile,
  type ParseError,
  type ParseResult,
} from './frontmatter.js'

export {
  INDEX_MIGRATIONS,
  clearIndex,
  upsertRecords,
  search,
  type IndexRow,
  type SearchHit,
} from './search.js'

export {
  selectRecords,
  selectSearch,
  visibleIds,
  VISIBLE_STATUSES,
  type SelectQuery,
  type SelectedRecord,
} from './select.js'

export {
  writeRecord,
  propose,
  recordPath,
  type Actor,
  type WriteRequest,
  type WriteRefusal,
  type WriteResult,
} from './write.js'

export {
  reindex,
  reindexChecked,
  reindexToPath,
  type ReindexReport,
  type ReindexOutcome,
  type ReindexFailure,
} from './reindex.js'

export {
  findCandidates,
  arbitrationQueue,
  numericConflict,
  type ClaimRecord,
  type Classifier,
  type ConflictCandidate,
  type ArbitrationItem,
  type Verdict,
} from './conflict.js'
