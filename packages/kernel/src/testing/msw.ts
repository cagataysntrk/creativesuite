// TEK HTTP kesici: msw (§15).
//
// İki dispatcher birbiriyle kavga eder ve "tek başına geçer, paket içinde düşer" tipi
// flake üretir. Bu yüzden nock/undici-mock/fetch-mock hiçbiri eklenmez; kesici tektir.

import { setupServer } from 'msw/node'
import { http, HttpResponse, type RequestHandler } from 'msw'
import { toEntry, findEntry, toResponse, type Cassette, type CassetteEntry } from './cassette.js'

/** msw sürümleri arasında adı değişen tip — dönüşten türetilir, tahmin edilmez. */
export type MswServer = ReturnType<typeof setupServer>

export interface RecordingServer {
  readonly server: MswServer
  /** Tüm kayıt işlerinin bitmesini bekler ve girdileri döndürür. */
  readonly flush: () => Promise<CassetteEntry[]>
}

/**
 * Kayıt sunucusu: verilen upstream handler'ları çalıştırır ve her istek/yanıt çiftini
 * REDAKTE EDİLMİŞ olarak toplar.
 *
 * İstek `request:start`'ta KLONLANIR: handler gövdeyi okuduğunda orijinal akış tükenir
 * ve `response:mocked` anında `clone()` "unusable" atar. Yani kayıt, handler'ın gövdeyi
 * okuyup okumamasına göre sessizce ya çalışır ya çökerdi.
 */
export const recordingServer = (upstream: readonly RequestHandler[]): RecordingServer => {
  const started = new Map<string, Request>()
  const pending: Promise<CassetteEntry>[] = []
  const server = setupServer(...upstream)

  server.events.on('request:start', ({ request, requestId }) => {
    started.set(requestId, request.clone())
  })

  server.events.on('response:mocked', ({ request, response, requestId }) => {
    const snapshot = started.get(requestId) ?? request
    started.delete(requestId)
    pending.push(toEntry(snapshot, response))
  })

  return { server, flush: () => Promise.all(pending) }
}

/**
 * Oynatma sunucusu. Cassette'te olmayan bir istek SESSİZCE GEÇMEZ: 599 ve açık bir
 * gövde döner. Kaçan bir isteğin ağa çıkması, testin gerçekte ne konuştuğunu
 * gizlemenin en hızlı yoludur.
 */
export const replayServer = (cassette: Cassette): MswServer =>
  setupServer(
    http.all('*', ({ request }) => {
      const entry = findEntry(cassette, request.method, request.url)
      if (entry === null) {
        return HttpResponse.json(
          { error: 'cassette_miss', method: request.method, url: request.url },
          { status: 599 }
        )
      }
      return toResponse(entry)
    })
  )

/**
 * **Ağ KAPALI** sunucusu: hiçbir handler yok, her istek hata.
 *
 * "Bu kod ağa çıkmıyor" iddiası ancak çıkmaya çalıştığında testin DÜŞMESİYLE kanıtlanır.
 * Handler'sız `setupServer` + `onUnhandledRequest: 'error'` tam olarak bunu yapar.
 *
 * Neden burada: msw tek bir yerde yaşar (§3.8). İkinci bir paket kendi msw'sini
 * kurarsa iki dispatcher birbiriyle kavga eder ve "tek başına geçer, paket içinde
 * düşer" tipi flake üretir.
 */
export const offlineServer = (): MswServer => setupServer()

/** `offlineServer()` için doğru `listen` seçenekleri — çağıranın hatırlaması gerekmesin. */
export const OFFLINE_LISTEN = { onUnhandledRequest: 'error' } as const

/**
 * Handler'lı sahte sunucu + msw'nin kendi yapıcıları.
 *
 * Neden yeniden dışa açılıyor: msw **tek bir pakette** yaşar (§3.8). Ring 1 paketleri
 * kendi msw bağımlılığını eklerse iki dispatcher birbiriyle kavga eder ve "tek başına
 * geçer, paket içinde düşer" tipi flake doğar. Testler `@suite/kernel/testing`ten
 * alır — böylece kesici tek kalır ve sürüm tek yerden yükseltilir.
 */
export const mockServer = (...handlers: readonly RequestHandler[]): MswServer =>
  setupServer(...handlers)

export { http, HttpResponse, type RequestHandler }
