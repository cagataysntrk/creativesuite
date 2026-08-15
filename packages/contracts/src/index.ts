// Ring -1 — CONTRACTS. Bu paket HİÇBİR ŞEY import etmez (§3.1).
// Gerçek çekirdek tipler (Result, Money, RecordEnvelope, OpaqueAttributes) FAZ-1.1b'de.

/** Bir paketin ait olduğu halka. Bağımlılık yönü bu sırayla tek yönlüdür. */
export type RingName =
  | 'contracts'
  | 'kernel'
  | 'registry'
  | 'corpus'
  | 'providers'
  | 'render'
  | 'engine'
  | 'ui'
  | 'app'

/** Her workspace paketi kendini böyle tanıtır. */
export interface PackageIdentity {
  readonly name: string
  readonly ring: RingName
}

export const RING_ORDER: readonly RingName[] = [
  'contracts',
  'kernel',
  'registry',
  'corpus',
  'providers',
  'render',
  'engine',
  'ui',
  'app',
]

export const IDENTITY: PackageIdentity = { name: '@suite/contracts', ring: 'contracts' }
