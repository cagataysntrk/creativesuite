// `INGEST` çekimi — tek HTTP istemcisi, tarayıcı YOK (§14 · R-04 · FAZ-6.5).
//
// **Plan "yerel Playwright" diyordu; olamaz** (D-213). R-04 "yalnız `RENDER` Chromium'a
// dokunur" diyor ve `chromium-baslatan` darboğazı tek başlatıcıya izin veriyor. `INGEST`
// bir tarayıcı açsaydı iki yasayı birden çiğnerdi — ve daha kötüsü, prospect sitesinden
// gelen JavaScript'i **çalıştırırdık**: enjeksiyon sınırının (§14) altını oyan tam olarak
// bu olurdu. Metni okumak için kod çalıştırmak gerekmiyor.
//
// **Bedeli beyan ediliyor:** yalnız JavaScript ile çizilen bir site bize boş görünür.
// Bu bir kusur değil, sınırın kendisi — ve `bos_icerik` olarak RAPORLANIR, sessizce boş
// metin dönmez. Boş dönen bir çekim, "site hakkında hiçbir şey yok" diye okunurdu.

import { httpFetch } from '@suite/kernel'
import { asciiLower, type CorrelationId } from '@suite/contracts'
import { canFetch } from './waterfall.js'
import { buildProvenance, quarantinePaths, type Provenance } from './provenance.js'

export interface FetchInput {
  readonly url: string
  readonly sourceId: string
  readonly confidence: 'direct' | 'corroborating' | 'pointer'
  /** ISO 8601 — çağıran verir (R-06). */
  readonly fetchedAt: string
  /** Hata izini çalıştırmaya bağlar (§13). Çağıran verir; bu modül id ÜRETMEZ. */
  readonly correlationId: CorrelationId
  readonly signal?: AbortSignal
}

export type IngestFailure =
  | { readonly kind: 'forbidden_source'; readonly url: string }
  | { readonly kind: 'http'; readonly status: number }
  | { readonly kind: 'transport'; readonly message: string }
  /** İçerik geldi ama metin çıkmadı — muhtemelen JS ile çiziliyor. Sessiz kalınmaz. */
  | { readonly kind: 'bos_icerik'; readonly url: string }

export interface IngestArtifact {
  readonly text: string
  readonly provenance: Provenance
  readonly paths: { readonly text: string; readonly sidecar: string }
}

/**
 * HTML'den metin çıkarır.
 *
 * Ayrıştırıcı bağımlılığı EKLENMEDİ (R-75): burada gereken şey bir DOM değil, okunur
 * metin. `<script>` ve `<style>` gövdeleri **tamamen atılır** — bunlar içerik değil, ve
 * bir modele gönderilecek metnin içinde JavaScript kaynak kodu olması, enjeksiyon
 * yüzeyini büyütmekten başka bir şey yapmaz.
 */
export const htmlToText = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .split('\n')
    .map((s) => s.replace(/[ \t]+/g, ' ').trim())
    .filter((s) => s !== '')
    .join('\n')

const alanAdi = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return 'bilinmeyen'
  }
}

/**
 * Dosya adı — alan adı ve yol izinden türetilir, saat kullanılmaz (R-06).
 *
 * `asciiLower` kullanılıyor, çıplak `.toLowerCase()` değil (R-21). İlk sürüm çıplak
 * çağırıyordu ve **ihlal bataryası yakaladı** — burada Türkçe metin olmadığı için hata
 * zararsız görünüyordu, ama kuralın değeri tam olarak "istisna yok"tan geliyor: bir
 * istisna açıldığı an, sonraki çağrı Türkçe metinle gelir ve kimse fark etmez.
 */
export const slugFor = (url: string): string => {
  const yol = (() => {
    try {
      return new URL(url).pathname
    } catch {
      return url
    }
  })()
  const s = yol.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return s === '' ? 'kok' : asciiLower(s.slice(0, 80))
}

/**
 * Bir kaynağı çeker ve **karantina artefaktlarını üretir** — yazmaz.
 *
 * Yazma çağırana bırakıldı: bu fonksiyon saf kalırsa test edilebilir, ve `derived/ingest`
 * altına yazmanın nerede olduğu manifestte tek yerde görünür (§13).
 */
export const fetchSource = async (input: FetchInput): Promise<IngestArtifact | IngestFailure> => {
  const izin = canFetch(input.url)
  if (izin !== true) return { kind: 'forbidden_source', url: input.url }

  const r = await httpFetch(
    {
      url: input.url,
      method: 'GET',
      // `Accept` dar tutuluyor: ikili içerik karantinaya metin diye inmemeli.
      headers: { accept: 'text/html,text/plain' },
      ...(input.signal === undefined ? {} : { signal: input.signal }),
    },
    input.correlationId
  )
  if (!r.ok) return { kind: 'transport', message: r.error.code }

  const yanit = r.value
  if (yanit.status >= 400) return { kind: 'http', status: yanit.status }

  const metin = htmlToText(await yanit.text())
  if (metin.trim() === '') return { kind: 'bos_icerik', url: input.url }

  const domain = alanAdi(input.url)
  return {
    text: metin,
    provenance: buildProvenance({
      sourceId: input.sourceId,
      sourceRef: input.url,
      domain,
      fetchedAt: input.fetchedAt,
      text: metin,
      confidence: input.confidence,
    }),
    paths: quarantinePaths(domain, slugFor(input.url)),
  }
}

export const isIngestFailure = (r: IngestArtifact | IngestFailure): r is IngestFailure =>
  'kind' in r
