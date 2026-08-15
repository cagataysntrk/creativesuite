// Keşif planı — motor ile inceleme ekranı ortak sözlüğü (§4.4 · §12.9 · D-177).
//
// Tip Ring -1'de, MANTIK `packages/engine/src/discovery/`de. Tarayıcı halkası `engine`i
// import edemez; plan ekrana `/api/discovery` ile gelir.

export type OpKind = 'create' | 'update' | 'retire' | 'skip'

/** Op'un AYRIK sebebi — ekran sütunları bundan türer, `reason` metninden DEĞİL. */
export type OpReason =
  | 'unchanged'
  | 'previously_rejected'
  | 'pinned'
  | 'human_zone'
  | 'new_record'
  | 'content_changed'
  | 'absent_in_candidates'

export type ReconcileColumn = 'unchanged' | 'changed' | 'conflicted' | 'new' | 'retired'

export interface DiscoveryOpView {
  readonly kind: OpKind
  readonly why: OpReason
  readonly path: string
  readonly recordId: string
  readonly reason: string
  readonly digest: string
  readonly suppressedFields?: readonly string[]
}

export interface HaltedRecord {
  readonly recordId: string
  readonly path: string
  readonly reason: string
}
