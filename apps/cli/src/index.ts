// Uygulama halkası — just tarafından çağrılan komut yüzeyi (§3.9).
import { IDENTITY as engine, WIRED } from '@suite/engine'

export const MOUNTED = [engine, ...WIRED] as const
