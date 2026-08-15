// TEK HTTP istemcisi (§3.8 · chokepoints.json → `http-istemcisi`).
//
// `fetch` çağrısına izin verilen TEK yer burasıdır. İki HTTP istemcisi çevrimdışı modu
// YALAN yapar: biri msw ile kesilir, diğeri gerçekten ağa çıkar ve test yeşil kalır —
// "tek başına geçer, paket içinde düşer" tipi flake tam olarak buradan doğar (§15).
//
// ⚠ FAZ-1.12 bunun üstüne retry sınıflandırması, devre kesici ve bütçe kiralamayı ekler.
// Burada yalnız çağrının kendisi ve `Result` sözleşmesi var.

import type { AppError, CorrelationId, Result } from '@suite/contracts'
import { ok, err } from '@suite/contracts'
import { makeError } from '../errors/make.js'

export interface HttpRequest {
  readonly url: string
  readonly method?: string
  readonly headers?: Readonly<Record<string, string>>
  readonly body?: string
  /** İptal uçtan uca yayılır (§8.5). Verilmezse çağrı iptal edilemez — bilinçli olsun. */
  readonly signal?: AbortSignal
}

export const httpFetch = async (
  req: HttpRequest,
  correlationId: CorrelationId
): Promise<Result<Response, AppError>> => {
  const init: RequestInit = {
    method: req.method ?? 'GET',
    ...(req.headers === undefined ? {} : { headers: { ...req.headers } }),
    ...(req.body === undefined ? {} : { body: req.body }),
    ...(req.signal === undefined ? {} : { signal: req.signal }),
  }

  try {
    return ok(await fetch(req.url, init))
  } catch (cause) {
    const aborted = cause instanceof Error && cause.name === 'AbortError'
    return err(
      makeError({
        kind: aborted ? 'cancelled' : 'io',
        code: aborted ? 'HTTP_ABORTED' : 'HTTP_REQUEST_FAILED',
        userMessageKey: aborted ? 'error.http.aborted' : 'error.http.failed',
        correlationId,
        // Ağ hatası yeniden denenebilir; iptal denenemez — iptal bir KARARDIR.
        retryable: !aborted,
        cause,
        details: { url: req.url, method: init.method },
      })
    )
  }
}
