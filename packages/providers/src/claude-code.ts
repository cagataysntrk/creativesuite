// Headless Claude Code adaptörü — `GENERATE`'in "akıl gerektiren" şeridi (§8.4 · D-8).
//
// Orkestrasyon TypeScript'te, akıl gerektiren adımlar Claude Code'da. **Mevcut abonelik
// kullanılır; ekstra API faturası yok** — bu yüzden `estimate()` sıfır aralık döndürür ve
// bu sıfır "bilinmiyor" değil, **gerçekten ücretsiz** demektir (abonelik zaten ödenmiş).
//
// Aynı yetenek API şeridine de düşebilmeli: bu adaptör `free` şeridinde yaşar, API
// sağlayıcıları `premium`de. Hangisinin koşacağı YÖNLENDİRİCİNİN kararıdır (R-40) —
// pipeline "text.generate" ister, "claude-code" istemez.
//
// R-43: Claude Code'un çıktı biçimi bu dosyanın DIŞINA sızmaz. `--output-format json`
// zarfı burada açılır; motor yalnız `unknown` bir `output` görür.

import type { AppError, CorrelationId, Money, MoneyRange, Result } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import { commandExists, makeError, spawnProcess } from '@suite/kernel'
import type {
  CapabilityDecl,
  JobHandle,
  JobStatus,
  ProviderAdapter,
  ProviderContext,
  ProviderInput,
  ValidatedInput,
} from './types.js'

const ID = 'claude-code'
const BIN = 'claude'

/**
 * İkiliyi ortamdan SABİTLEME kancası (D-244).
 *
 * ⚠ **Ölçülen tuzak:** bu makinede iki Claude Code kurulumu vardı —
 * `/usr/bin/claude` (global npm, emekli bir modele ayarlı, her çağrıda
 * `404 not_found_error`) ve `~/.claude/local/claude` (çalışan). PATH eskisini önce
 * buluyordu ve `available()` "var" diyordu: kapı yeşil, çağrı ölü.
 *
 * **Bir ikilinin PATH'te BULUNMASI, doğru ikili olduğunu göstermez.** Sürüm sormak
 * da yetmez; kırık olan şey sürüm değil yapılandırmaydı. Tek dürüst çözüm operatörün
 * sabitleyebilmesi.
 */
const BIN_ENV = 'CLAUDE_CODE_BIN'

const ikili = (env: Readonly<Record<string, string | undefined>>): string => {
  const ozel = env[BIN_ENV]
  return ozel !== undefined && ozel.trim() !== '' ? ozel : BIN
}

/** Tamamlanan çağrıların sonuçları — `status()` bunları okur. */
const sonuclar = new Map<string, JobStatus>()

const CAPS: readonly CapabilityDecl[] = [
  {
    name: 'text.generate',
    lanes: ['free'],
    supports: {
      locale: ['tr-TR', 'en-US'],
      // Yapılandırılmış çıktı destekleniyor; katı LLM şeması (§3.4) buradan geçebilir.
      output_format: ['text', 'json'],
    },
  },
  {
    name: 'reasoning.plan',
    lanes: ['free'],
    supports: { locale: ['tr-TR', 'en-US'] },
  },
  {
    // Görsel yargı (FAZ-10.5 · D-256). Model görseli KENDİ okuyor — adaptör ikili veri
    // taşımıyor, prompt mutlak yolu taşıyor ve çağrıya `--allowedTools Read` ekleniyor.
    //
    // ⚠ Bu girdi olmadan `providers` kapısı haklı olarak kırmızı verdi: yetenek
    // tanımlayıcıda ilan edilmiş ama adaptör onu UYGULADIĞINI beyan etmiyordu. Tam da bu
    // deponun tekrar eden hatası — bir yetenek "bitti" sanılır çünkü kodu vardır; ama
    // ilan ile uygulama arasındaki bağ kurulmamıştır. Kapı bunu bir turda yakaladı.
    name: 'image.critique',
    lanes: ['free'],
    supports: { locale: ['tr-TR'], output_format: ['json'] },
  },
  {
    // ⚠ `design.critique` (FAZ-13.5) — ESTETİK eksen. `image.critique` kusur arıyor,
    // bu iyi arıyor; ikisi ayrı yetenek çünkü ayrı sorular. Aynı taşıma (dosyayı model
    // kendi okuyor, `Read` aracı gerekiyor) ama ayrı ilan: tek bir yetenek adı altında
    // iki soru sormak, hangi raporun hangi sorunun cevabı olduğunu belirsizleştirirdi.
    name: 'design.critique',
    lanes: ['free'],
    supports: { locale: ['tr-TR'], output_format: ['json'] },
  },
]

/**
 * Çağrılan model — ADAPTÖRDE, tanımlayıcıda değil.
 *
 * ⚠ ⚠ **Bu sabit bir ARIZADAN doğdu.** Adaptör `--model` geçmiyordu, yani CLI'ın kendi
 * VARSAYILANINA bağlıydı. O varsayılan yukarı akışta `claude-opus-4-1-20250805`e
 * sabitliydi; model kaldırılınca her çağrı `404 not_found_error` verdi ve hat İLK
 * `GENERATE` adımında durdu. §16 ile açıkça çelişiyor: *"bir ay ihmal edilse de çalışır"*
 * bir üst akış varsayılanına bağlanamaz — o varsayılan bizim kontrolümüzde değil.
 *
 * ⚠ **Tanımlayıcıya değil buraya yazıldı** ve gerekçesi tanımlayıcının kendi başlığında:
 * *"Tanımlayıcı veridir: fiyat, yetenek ve kısıtlar burada; ONUNLA KONUŞMA BİÇİMİ
 * `claude-code.ts`te."* Bayrak bir konuşma detayıdır. R-40 model kimliğini HATTA
 * yasaklıyor (yetenek iste, yönlendirici seçsin); adaptör çözümün bittiği yerdir.
 *
 * ⚠ Ortam değişkeni ezebiliyor: bir model kaldırıldığında düzeltme bir dağıtım değil,
 * bir env satırı olmalı — §16'nın kurtarma şartı.
 */
const VARSAYILAN_MODEL = 'claude-sonnet-5'

const modelAdi = (env: Readonly<Record<string, string>>): string =>
  env['SUITE_CLAUDE_MODEL'] ?? VARSAYILAN_MODEL

const hata = (
  kind: AppError['kind'],
  code: string,
  correlationId: string,
  details?: Readonly<Record<string, unknown>>
): AppError =>
  makeError({
    kind,
    code,
    userMessageKey: `error.provider.${code}`,
    correlationId: correlationId as CorrelationId,
    ...(details === undefined ? {} : { details }),
  })

export const claudeCode: ProviderAdapter = {
  id: ID,
  title: 'Claude Code (headless, abonelik)',

  capabilities: () => CAPS,

  validate: (input: ProviderInput): Result<ValidatedInput, AppError> => {
    const cap = CAPS.find((c) => c.name === input.capability)
    if (cap === undefined) {
      return err(
        hata('validation', 'CAPABILITY_UNSUPPORTED', input.idempotencyKey, {
          capability: input.capability,
        })
      )
    }
    if (!cap.lanes.includes(input.lane)) {
      // Bu adaptör premium şeritte YAŞAMAZ: abonelik zaten ödenmiş, premium bir
      // şerit isteği başka sağlayıcıya gitmeli. Sessizce free'ye düşmek, kullanıcının
      // "premium istiyorum" kararını ezmek olurdu.
      return err(hata('validation', 'LANE_UNSUPPORTED', input.idempotencyKey, { lane: input.lane }))
    }
    if (input.prompt.trim() === '') {
      return err(hata('validation', 'EMPTY_PROMPT', input.idempotencyKey))
    }
    return ok({ ...input, _validated: true })
  },

  // SENKRON (R-42). Abonelik zaten ödenmiş: aralık gerçekten sıfır.
  estimate: (_vi: ValidatedInput): MoneyRange => ({ low: ZERO_USD, high: ZERO_USD }),

  // SENKRON. Ağa çıkmaz; yalnız ikili dosya PATH'te mi diye bakar.
  available: (env) => commandExists(ikili(env), env['PATH']),

  start: async (vi, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    // **Sessizce atlamaz.** Claude Code yoksa açık bir `provider_unavailable` döner;
    // yönlendirici bunu red gerekçesi olarak manifest'e yazar (§13).
    if (!claudeCode.available(ctx.env)) {
      return err(
        hata('provider_unavailable', 'CLAUDE_CODE_NOT_FOUND', ctx.correlationId, {
          binary: ikili(ctx.env),
          hint: 'claude PATH üzerinde bulunamadı',
        })
      )
    }

    // ⚠ **`image.critique` görseli KENDİ okuyor ve bunun için `Read` aracı gerekiyor.**
    //
    // Ölçüldü: araç verilmeden çağrı 5 dakikada dönmedi ve SIGTERM ile öldü — Claude Code
    // etkileşimsiz kipte izin istemi çıkarıyor ve cevap gelmeyince asılıyor. `Read`
    // verilince aynı çağrı 18 saniyede doğru sonucu verdi.
    //
    // **YALNIZ `Read`.** Alandaki araçlar (Open Carrusel) agent'a `Bash WebFetch` veriyor
    // ve kendi API'sini curl ile çağırtıyor; o, kapatılamayan bir delik. Okuma yetkisi
    // kategorik olarak farklı: yan etkisi yok, kabuk açmıyor, ağa çıkmıyor. Yine de bir
    // yetki genişlemesi ve o yüzden yeteneğe BAĞLI — metin üretimi bu aracı almıyor.
    // ⚠ İki yargı yeteneği de dosyayı KENDİ okuyor; ikisi de `Read` alıyor. Liste
    // olarak yazıldı çünkü üçüncüsü eklendiğinde `||` zinciri sessizce unutulurdu —
    // ve unutulduğunda belirti "çağrı 5 dakikada dönmedi ve öldü" olurdu, apaçık değil.
    const okuyanYetenekler = ['image.critique', 'design.critique']
    const araclar = okuyanYetenekler.includes(vi.capability) ? ['--allowedTools', 'Read'] : []
    const sonuc = await spawnProcess(
      ikili(ctx.env),
      ['-p', vi.prompt, '--model', modelAdi(ctx.env), ...araclar, '--output-format', 'json'],
      {
        env: ctx.env,
        signal: ctx.signal,
        timeoutMs: 10 * 60_000,
        // Alt süreç ortamı devralmaz: yalnız açıkça verilen anahtarlar geçer (§14).
      }
    )

    const handle: JobHandle = {
      providerId: ID,
      externalId: vi.idempotencyKey,
      idempotencyKey: vi.idempotencyKey,
    }

    if (sonuc.aborted) {
      sonuclar.set(handle.externalId, { state: 'cancelled' })
      return ok(handle)
    }
    if (sonuc.timedOut) {
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('timeout', 'CLAUDE_CODE_TIMEOUT', ctx.correlationId),
      })
      return ok(handle)
    }
    if (sonuc.code !== 0) {
      // ⚠ ⚠ **HATA METNİ STDOUT'TA, STDERR'DE DEĞİL.** Claude Code `--output-format json`
      // ile başarısızlığı da JSON olarak yazıyor: `{"is_error":true,"result":"API Error:
      // 404 ..."}`. İlk sürüm yalnız `stderr`i taşıyordu ve o BOŞ geliyordu; hat
      // `{"code":1,"stderr":""}` diye durdu ve sebep görünmedi. Teşhis edilemeyen bir
      // hata, olmayan bir hata kadar kötüdür — asıl sebebi bulmak elle çağrı gerektirdi.
      // ⚠ Kırpma korunuyor: sağlayıcı çıktısı prompt'u yankılayabilir, prompt secret
      // taşıyabilir (§14).
      const govde = ((): string => {
        try {
          const o: unknown = JSON.parse(sonuc.stdout)
          const r = (o as { result?: unknown } | null)?.result
          return typeof r === 'string' ? r : sonuc.stdout
        } catch {
          return sonuc.stdout
        }
      })()
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('provider_bad_response', 'CLAUDE_CODE_EXIT', ctx.correlationId, {
          code: sonuc.code,
          stderr: sonuc.stderr.slice(0, 500),
          cikti: govde.slice(0, 500),
        }),
      })
      return ok(handle)
    }

    // ⚠ **Çıkış kodu 0 ama `is_error: true` OLABİLİR** — CLI hatayı JSON'a yazıp sıfırla
    // dönebiliyor (elle denendi: 404 model hatası `RC=0` verdi). Kodu tek gerçek saymak,
    // bir hata metnini geçerli çıktı sanmaktı; ayrıştırıcı onu "JSON bulunamadı" diye
    // reddederdi ve sebep yine görünmezdi.
    let hamCikti: unknown
    try {
      hamCikti = JSON.parse(sonuc.stdout)
    } catch {
      hamCikti = null
    }
    if ((hamCikti as { is_error?: unknown } | null)?.is_error === true) {
      const r = (hamCikti as { result?: unknown }).result
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('provider_bad_response', 'CLAUDE_CODE_ERROR', ctx.correlationId, {
          cikti: (typeof r === 'string' ? r : sonuc.stdout).slice(0, 500),
        }),
      })
      return ok(handle)
    }

    // Zarf BURADA açılır; dışarı yalnız `unknown` çıkar (R-43).
    let output: unknown
    try {
      output = JSON.parse(sonuc.stdout)
    } catch {
      output = { text: sonuc.stdout }
    }
    sonuclar.set(handle.externalId, { state: 'succeeded', output })
    return ok(handle)
  },

  status: async (h): Promise<Result<JobStatus, AppError>> =>
    ok(sonuclar.get(h.externalId) ?? { state: 'running' }),

  cancel: async (h): Promise<void> => {
    sonuclar.set(h.externalId, { state: 'cancelled' })
  },

  // Abonelik: sağlayıcı çağrı başına ücret BİLDİRMEZ. `null` değil sıfır dönüyoruz
  // çünkü burada bilmediğimiz bir şey yok — çağrı gerçekten ek ücret üretmedi (D-8).
  actualCost: async (): Promise<Money | null> => ZERO_USD,
}
