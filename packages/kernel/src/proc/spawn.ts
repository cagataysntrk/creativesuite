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

    const ekle = (hedef: 'out' | 'err', chunk: Buffer): void => {
      const mevcut = hedef === 'out' ? stdout : stderr
      if (mevcut.length >= maxOut) {
        truncated = true
        return
      }
      const metin = chunk.toString('utf8')
      if (hedef === 'out') stdout += metin
      else stderr += metin
    }

    child.stdout.on('data', (c: Buffer) => ekle('out', c))
    child.stderr.on('data', (c: Buffer) => ekle('err', c))

    let killTimer: NodeJS.Timeout | null = null
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

    child.on('close', (code, signal) => {
      if (bitti) return
      bitti = true
      if (timeoutTimer !== null) clearTimeout(timeoutTimer)
      if (killTimer !== null) clearTimeout(killTimer)
      opts.signal?.removeEventListener('abort', onAbort)
      resolve({ code, signal, stdout, stderr, timedOut, aborted, truncated })
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
