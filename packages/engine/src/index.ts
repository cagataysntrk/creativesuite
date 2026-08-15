// Ring 2 — ENGINE. Zamanlama, retry, bütçe, maliyet defteri (§8.5).
// Alt halkaların hepsini görür; ui ve apps'i görmez.
import type { PackageIdentity } from '@suite/contracts'
import { IDENTITY as kernel } from '@suite/kernel'
import { IDENTITY as registry } from '@suite/registry'
import { IDENTITY as corpus } from '@suite/corpus'
import { IDENTITY as providers } from '@suite/providers'
import { IDENTITY as render } from '@suite/render'

export const IDENTITY: PackageIdentity = { name: '@suite/engine', ring: 'engine' }

/** Motorun bağlı olduğu halkalar — project reference zincirinin canlı kanıtı. */
export const WIRED: readonly PackageIdentity[] = [kernel, registry, corpus, providers, render]
