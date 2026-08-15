// Ring 0 — KERNEL. Sabit kavramlar ve dokuz fiil (§3.10). Yalnız contracts'a bakar.
import type { PackageIdentity } from '@suite/contracts'

export const IDENTITY: PackageIdentity = { name: '@suite/kernel', ring: 'kernel' }
