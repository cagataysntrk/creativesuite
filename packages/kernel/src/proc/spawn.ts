// TEK alt süreç başlatıcı (§3.8 · §8.5 · chokepoints.json → `alt-surec`).
//
// İptal yayılımı uçtan uca çalışmak zorunda. İkinci bir spawn noktası, `AbortSignal`
// bağlanmamış bir ffmpeg süreci demektir: kullanıcı İptal'e basar, UI durur, süreç
// arkada çalışmaya ve GPU yemeye devam eder.
//
// **Öldürme iki aşamalıdır.** `SIGTERM` verilir, süreç kendini toparlasın diye kısa bir
// süre beklenir, hâlâ yaşıyorsa `SIGKILL`. Doğrudan `SIGKILL`, yarım yazılmış bir MP4
// bırakır; yalnız `SIGTERM`, sinyali yok sayan bir sürecin sonsuza kalması demektir.

import { spawn as nodeSpawn } from 'node:child_process'
import { accessSync, constants, statSync } from 'node:fs'
import { join } from 'node:path'

export interface SpawnOptions {
  readonly cwd?: string
  /** Ortam AÇIKÇA verilir. `process.env`i olduğu gibi geçirmek, secret'ı alt sürece
   *  sızdırmanın en sessiz yoludur (§14). */
  readonly env?: Readonly<Record<string, string>>
  readonly input?: string
  readonly signal?: AbortSignal
  readonly timeoutMs?: number
  /** `SIGTERM` ile `SIGKILL` arası. Süreç kendini toparlasın diye. */
  readonly graceMs?: number
  readonly maxOutputBytes?: number
}

export interface SpawnResult {
  readonly code: number | null
  readonly signal: NodeJS.Signals | null
  readonly stdout: string
  readonly stderr: string
  readonly timedOut: boolean
  readonly aborted: boolean
  /** Çıktı `maxOutputBytes`ı aştı ve KESİLDİ — sessizce kırpılmadı, bildirildi. */
  readonly truncated: boolean
}

const DEFAULT_MAX_OUTPUT = 8 * 1024 * 1024

/**
 * `exit` ile `close` arası boşalma penceresi.
 *
 * ⚠ Kısa tutuluyor: süreç ZATEN öldü, bu pencere yalnız yoldaki byte'lar için. Uzun bir
 * pencere her çağrıya gecikme eklerdi; kısa bir pencere yalnız boru devredilmiş
 * durumlarda görünür hâle geliyor.
 */
const DRAIN_MS = 250

/**
 * Alt süreç çalıştırır. `throw` ETMEZ: bir sürecin başarısız olması bir istisna değil,
 * bir sonuçtur — çıkış kodu ve stderr çağıranın okuması gereken VERİDİR (§8.6).
 */
export const spawnProcess = (
  command: string,
  args: readonly string[],
  opts: SpawnOptions = {}
): Promise<SpawnResult> =>
  new Promise((resolve) => {
    const maxOut = opts.maxOutputBytes ?? DEFAULT_MAX_OUTPUT
    const grace = opts.graceMs ?? 3_000

    const child = nodeSpawn(command, [...args], {
      ...(opts.cwd === undefined ? {} : { cwd: opts.cwd }),
      // Ortam devralınmaz; yalnız açıkça verilen anahtarlar geçer.
      env: { ...(opts.env ?? {}) },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let truncated = false
    let timedOut = false
    let aborted = false
    let bitti = false

    // Sınır PARÇA İÇİNDE de uygulanır. İlk sürüm yalnız parça BAŞINDA bakıyordu:
    // 50 KB'lık tek bir chunk geldiğinde `stdout.length` hâlâ 0 olduğu için tamamı
    // yazılıyor ve `truncated` hiç işaretlenmiyordu. Test bunu yakaladı — kod yanlıştı,
    // test değil. Tek parça hâlinde gelen büyük çıktı bu sistemde normaldir
    // (ffmpeg log'u, model yanıtı), yani yol istisnai değil tipik.
    const ekle = (hedef: 'out' | 'err', chunk: Buffer): void => {
      const mevcut = hedef === 'out' ? stdout : stderr
      const kalan = maxOut - mevcut.length
      if (kalan <= 0) {
        truncated = true
        return
      }
      const metin = chunk.toString('utf8')
      const parca = metin.length > kalan ? metin.slice(0, kalan) : metin
      if (parca.length < metin.length) truncated = true
      if (hedef === 'out') stdout += parca
      else stderr += parca
    }

    child.stdout.on('data', (c: Buffer) => ekle('out', c))
    child.stderr.on('data', (c: Buffer) => ekle('err', c))

    let killTimer: NodeJS.Timeout | null = null
    let drainTimer: NodeJS.Timeout | null = null
    const oldur = (): void => {
      if (bitti) return
      child.kill('SIGTERM')
      killTimer = setTimeout(() => {
        if (!bitti) child.kill('SIGKILL')
      }, grace)
      // Bu zamanlayıcı süreci canlı tutmasın: kapanışta bekleyen bir timer,
      // "bir ay ihmal edilse de çalışır" için gereksiz bir kilit noktasıdır.
      killTimer.unref?.()
    }

    const timeoutTimer =
      opts.timeoutMs === undefined
        ? null
        : setTimeout(() => {
            timedOut = true
            oldur()
          }, opts.timeoutMs)

    const onAbort = (): void => {
      aborted = true
      oldur()
    }
    if (opts.signal !== undefined) {
      if (opts.signal.aborted) onAbort()
      else opts.signal.addEventListener('abort', onAbort, { once: true })
    }

    child.on('error', (e) => {
      // Komut bulunamadı, izin yok… Bu da bir SONUÇTUR: kod null, stderr dolu.
      if (bitti) return
      bitti = true
      if (timeoutTimer !== null) clearTimeout(timeoutTimer)
      if (killTimer !== null) clearTimeout(killTimer)
      opts.signal?.removeEventListener('abort', onAbort)
      resolve({
        code: null,
        signal: null,
        stdout,
        stderr: `${stderr}${e.message}`,
        timedOut,
        aborted,
        truncated,
      })
    })

    const bitir = (code: number | null, signal: NodeJS.Signals | null): void => {
      if (bitti) return
      bitti = true
      if (timeoutTimer !== null) clearTimeout(timeoutTimer)
      if (killTimer !== null) clearTimeout(killTimer)
      if (drainTimer !== null) clearTimeout(drainTimer)
      opts.signal?.removeEventListener('abort', onAbort)
      resolve({ code, signal, stdout, stderr, timedOut, aborted, truncated })
    }

    child.on('close', (code, signal) => bitir(code, signal))

    // ⚠ ⚠ **`exit` DE DİNLENİYOR ve bu bir ASILMA DÜZELTMESİDİR, bir kemer-askı değil.**
    // Node `close`u yalnız TÜM stdio akışları kapandığında yayıyor; `exit` süreç bittiğinde.
    // İkisi normalde art arda gelir — **alt süreç kendi çocuğunu doğurup boruları ona
    // devretmediği sürece.** `claude` CLI tam bunu yapıyor: kalıcı bir `claude daemon run`
    // süreci başlatıyor ve o daemon stdout borusunu açık tutuyor. CLI ölse bile `close`
    // hiç gelmiyor ve promise sonsuza kadar bekliyor.
    //
    // ⚠ Belirti aldatıcıydı: hat `sablon-uyarla` adımında 21 dakika asıldı, `ps` hiçbir
    // çocuk süreç göstermedi ve **10 dakikalık zaman aşımı da kurtarmadı** — çünkü zaman
    // aşımı `SIGTERM` gönderiyor, süreç ölüyor, ama `close` yine gelmiyordu. Yani hem asıl
    // yol hem kurtarma yolu AYNI olaya bağlıydı; iki kere denendi, ikisinde de asıldı.
    //
    // Çözüm: `exit` geldiğinde kısa bir boşalma penceresi açılıyor. Normal durumda `close`
    // o pencere dolmadan gelir ve davranış birebir aynı kalır; boru devredilmişse pencere
    // dolar ve sonuç ELDEKİ çıktıyla döner. Süreç bittikten sonra gelecek yeni byte yok.
    child.on('exit', (code, signal) => {
      if (bitti || drainTimer !== null) return
      drainTimer = setTimeout(() => bitir(code, signal), DRAIN_MS)
      drainTimer.unref?.()
    })

    if (opts.input !== undefined) child.stdin.end(opts.input)
    else child.stdin.end()
  })

/**
 * Komut çalıştırılabilir mi — SENKRON ve ucuz (birkaç `statSync`).
 * `estimate()` senkron olmak zorunda (R-42) ve "bu sağlayıcı kullanılabilir mi"
 * sorusunu ağ olmadan cevaplayabilmeli; bu yüzden kontrol dosya sisteminde yapılır.
 */
export const commandExists = (command: string, pathEnv: string | undefined): boolean => {
  const calistirilabilir = (aday: string): boolean => {
    try {
      accessSync(aday, constants.X_OK)
      return statSync(aday).isFile()
    } catch {
      return false
    }
  }

  // Yol içeriyorsa PATH aranmaz — doğrudan o dosyaya bakılır.
  if (command.includes('/')) return calistirilabilir(command)
  if (pathEnv === undefined || pathEnv === '') return false

  return pathEnv.split(':').some((dizin) => dizin !== '' && calistirilabilir(join(dizin, command)))
}
