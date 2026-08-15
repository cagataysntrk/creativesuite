// Uygulama halkası — Hono API, SSE, chokidar, alt süreçler (§12).
import { IDENTITY as engine, WIRED } from '@suite/engine'

export const MOUNTED = [engine, ...WIRED] as const
