// Cassette katmanı (§15 · FAZ-1.10).
//
// Sağlayıcı adaptörleri gerçek HTTP konuşur; testte o konuşma bir kez KAYDEDİLİR ve
// sonsuza dek OYNATILIR. Böylece kontrat testleri ağ olmadan, para harcamadan ve
// deterministik koşar.
//
// REDAKSİYON PAZARLIK KONUSU DEĞİL: kaydedilen her şey git'e girer. Bir `Authorization`
// başlığı cassette'e sızarsa, o secret geçmişte SONSUZA KADAR kalır — sonradan silinse
// bile (§14). Bu yüzden redaksiyon kayıt anında yapılır, commit anında değil: unutulacak
// bir adım olmasın diye.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { FIXTURE_ROOT } from './fixtures.js'

const REDACTED = '<REDACTED>'

/** Cassette'ler fixture'ların yanında ama ayrı: biri veri, diğeri konuşma kaydı. */
export const CASSETTE_ROOT = join(FIXTURE_ROOT, '../cassettes')

/** Değeri tamamen silinen başlıklar. Küçük harfe normalize edilerek karşılaştırılır. */
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'api-key',
  'x-auth-token',
  'x-goog-api-key',
  'anthropic-api-key',
  'openai-organization',
])

/**
 * Gövde içinde geçen anahtar desenleri. `repo-hygiene` kapısıyla aynı aileden;
 * orada "commit'lenmesin" diye aranır, burada "yazılmasın" diye değiştirilir.
 */
const BODY_SECRET_PATTERNS: readonly RegExp[] = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /sk_(live|test)_[A-Za-z0-9]{20,}/g,
  /ghp_[A-Za-z0-9]{30,}/g,
  /github_pat_[A-Za-z0-9_]{50,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,
  /AIza[0-9A-Za-z_-]{30,}/g,
  /fal-[A-Za-z0-9-]{20,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
]

export interface CassetteEntry {
  readonly method: string
  readonly url: string
  readonly requestHeaders: Readonly<Record<string, string>>
  readonly requestBody: string | null
  readonly status: number
  readonly responseHeaders: Readonly<Record<string, string>>
  readonly responseBody: string
}

export interface Cassette {
  readonly name: string
  /** Kaydın hangi commit'te alındığı — sürüklenme tartışmasını bitirir. */
  readonly recordedAtCommit: string | null
  readonly entries: readonly CassetteEntry[]
}

export const redactHeaders = (
  headers: Readonly<Record<string, string>>
): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers)) {
    out[k] = SENSITIVE_HEADERS.has(k.toLowerCase()) ? REDACTED : redactText(v)
  }
  return out
}

export const redactText = (text: string): string => {
  let out = text
  for (const re of BODY_SECRET_PATTERNS) out = out.replace(re, REDACTED)
  return out
}

const headersToObject = (h: Headers): Record<string, string> => {
  const out: Record<string, string> = {}
  h.forEach((v, k) => {
    out[k] = v
  })
  return out
}

/** Bir istek/yanıt çiftini REDAKTE EDİLMİŞ olarak cassette girdisine çevirir. */
export const toEntry = async (request: Request, response: Response): Promise<CassetteEntry> => {
  const reqBody = request.body === null ? null : await request.clone().text()
  return {
    method: request.method,
    url: request.url,
    requestHeaders: redactHeaders(headersToObject(request.headers)),
    requestBody: reqBody === null ? null : redactText(reqBody),
    status: response.status,
    responseHeaders: redactHeaders(headersToObject(response.headers)),
    responseBody: redactText(await response.clone().text()),
  }
}

/**
 * Eşleme anahtarı: metot + URL. Gövdeyi anahtara KATMIYORUZ — sağlayıcılar aynı
 * gövdeyi farklı alan sırasıyla serileştirir ve eşleşme sessizce kaçar. Aynı URL'e
 * birden fazla farklı çağrı gerekirse cassette'i böl; anahtarı karmaşıklaştırma.
 */
export const entryKey = (method: string, url: string): string => `${method.toUpperCase()} ${url}`

export const findEntry = (cassette: Cassette, method: string, url: string): CassetteEntry | null =>
  cassette.entries.find((e) => entryKey(e.method, e.url) === entryKey(method, url)) ?? null

/** Cassette girdisinden gerçek bir `Response` üretir — oynatma tarafının tamamı budur. */
export const toResponse = (entry: CassetteEntry): Response =>
  new Response(entry.responseBody, {
    status: entry.status,
    headers: { ...entry.responseHeaders },
  })

// ── kalıcılık ────────────────────────────────────────────────────────────────
// Cassette COMMIT'LENİR: kayıt bir kez alınır, sonsuza dek oynatılır. Yeniden kayıt
// bilinçli bir eylemdir (`UPDATE_CASSETTES=1`), testin yan etkisi değil — aksi hâlde
// bozulan bir sağlayıcı sözleşmesi, cassette'i sessizce güncelleyerek "düzelir".

export const cassettePath = (name: string): string => join(CASSETTE_ROOT, `${name}.json`)

export const cassetteExists = (name: string): boolean => existsSync(cassettePath(name))

export const loadCassette = (name: string): Cassette =>
  JSON.parse(readFileSync(cassettePath(name), 'utf8')) as Cassette

export const saveCassette = (cassette: Cassette): string => {
  const path = cassettePath(cassette.name)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(cassette, null, 2) + '\n')
  return path
}
