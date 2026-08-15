// Halka kimliği (§3.1).
// `rings.config.mjs` lint tarafını, bu dosya çalışma zamanı tarafını tutar; ikisi
// aynı sırayı taşır ve `rings` kapısı ayrışmayı yakalar.

/** Bir paketin ait olduğu halka. Bağımlılık yönü bu sırayla tek yönlüdür. */
export type RingName =
  'contracts' | 'kernel' | 'registry' | 'corpus' | 'providers' | 'render' | 'engine' | 'ui' | 'app'

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
