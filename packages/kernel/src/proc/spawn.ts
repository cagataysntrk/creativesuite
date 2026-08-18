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
  /**
   * Sinyal gönderimi — **dikiş, süs değil.**
   *
   * ⚠ ⚠ Son çare zamanlayıcısı (aşağıda) gerçek bir süreçle SINANAMAZ: `SIGKILL`
   * alan her süreç ölür ve `exit` yayar, yani ağ hiç devreye girmez. İlk yazılan
   * test tam bu yüzden ağı ölçmüyordu — kasten bozuldu ve YEŞİL kaldı.
   *
   * Alan "sinyal iletilmedi" durumunu modelliyor ve o durum uydurma değil: gerçek
   * koşuda çocuk çoktan ölmüştü, `kill` hiçbir şey yapmadı ve hiçbir olay gelmedi.
   */
  readonly sinyalGonder?: (sinyal: NodeJS.Signals) => void
  /**
   * Çıktı GELDİĞİ ANDA haber verir — biriktirip sonunda vermek değil.
   *
   * ⚠ ⚠ Sonuç yalnız süreç BİTİNCE dönüyor; dakikalarca süren bir çalıştırmada bu,
   * "başlattım ama ne oluyor bilmiyorum" demektir. Panelde canlı günlük tam olarak
   * bu yüzden yoktu. Kesme (`truncated`) sayacı yine uygulanıyor: dinleyiciye giden
   * parça, sonuca giren parçadır.
   */
  readonly onData?: (parca: string, hedef: 'out' | 'err') => void
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
      // Dinleyici hata fırlatırsa süreç ölmemeli: günlük yazımı, çalıştırmayı
      // durdurmaya yetkili değil.
      try {
        opts.onData?.(parca, hedef)
      } catch {
        // yutuluyor — bilerek
      }
    }

    child.stdout.on('data', (c: Buffer) => ekle('out', c))
    child.stderr.on('data', (c: Buffer) => ekle('err', c))

    // `bitir` AŞAĞIDA tanımlı ama `oldur` onu ancak zamanlayıcı ateşlendiğinde
    // çağırıyor — o an tanım çoktan yapılmış olur. Sıra bilinçli: ikisini de yukarı
    // taşımak `child.on('close')` kaydını geciktirirdi.
    let killTimer: NodeJS.Timeout | null = null
    let sonTimer: NodeJS.Timeout | null = null
    let drainTimer: NodeJS.Timeout | null = null
    const gonder = opts.sinyalGonder ?? ((sinyal: NodeJS.Signals) => void child.kill(sinyal))
    const oldur = (): void => {
      if (bitti) return
      gonder('SIGTERM')
      killTimer = setTimeout(() => {
        if (!bitti) gonder('SIGKILL')
      }, grace)
      // Bu zamanlayıcı süreci canlı tutmasın: kapanışta bekleyen bir timer,
      // "bir ay ihmal edilse de çalışır" için gereksiz bir kilit noktasıdır.
      killTimer.unref?.()

      // ⚠ ⚠ **ZAMAN AŞIMI BİR GARANTİDİR, BİR RİCA DEĞİL — ve değildi.**
      //
      // Eski kod öldürüyor ve sonra YİNE bir olay bekliyordu: `close` ya da `exit`.
      // Olay hiç gelmezse promise sonsuza kadar bekler ve zaman aşımı hiçbir şey
      // başarmaz. Gerçek koşuda tam bu oldu: `just uret` on beş dakika asılı kaldı,
      // `ps` hiçbir çocuk süreç göstermedi (yani çocuk çoktan ölmüştü), `ep_poll`de
      // boşta bekliyordu ve on dakikalık zaman aşımı da onu KURTARMADI.
      //
      // Bu, dosyanın kendi uyarısının birebir tekrarı: *"hem asıl yol hem kurtarma
      // yolu AYNI olaya bağlıydı."* Ders bir kez yazılmış ama zaman aşımı yoluna
      // uygulanmamıştı. Artık son bir zamanlayıcı, olay gelsin gelmesin ELDEKİ
      // çıktıyla bitiriyor: `SIGKILL`den sonra hâlâ yaşayan bir çocuk yok sayılır.
      sonTimer = setTimeout(() => {
        if (!bitti) bitir(null, 'SIGKILL')
      }, grace * 2)
      sonTimer.unref?.()
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
      if (sonTimer !== null) clearTimeout(sonTimer)
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
