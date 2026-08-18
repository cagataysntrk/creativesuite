// Yerel arka plan silici — `image.matte` yeteneği (FAZ-15.11 · D-274 · §8.4).
//
// ⚠ ⚠ **BU ADAPTÖR BİR ÖLÇÜMÜN SONUCU, BİR TERCİHİN DEĞİL.** Kesik özne şablonları
// `matlama` (luma anahtarı) ile kuruluyordu: brief düz siyah zemin istiyor ve alfa o
// zeminin parlaklığından türetiliyordu. Katalog kaydı bunu *"garantiyi rica etme,
// yapıya göm"* diye anlatıyordu — ama brief bir RİCA'dır. Üç gerçek koşuda model açık
// gri stüdyo zemini üretti (köşe parlaklığı 59–101/255 ölçüldü), anahtar hiçbir şeyi
// kesmedi ve çıktıda kesik özne yerine DİKDÖRTGEN fotoğraf kaldı. Denetim kusuru
// görüyordu ama düzeltemiyordu: metin değiştirerek bir görselin zemini siyahlaşmaz.
//
// ⚠ ⚠ **NEDEN `GENERATE` VE NEDEN BİR SAĞLAYICI.** `rembg` bir sinir ağı (BRIA RMBG
// 2.0) — yerel koşuyor ama yine bir MODEL. Dokuz fiilde model çağıran tek fiil
// `GENERATE` (R-04); ayrı bir onuncu fiil açmak R-02'yi delerdi. Yerel olması yalnız
// maliyeti ve kullanılabilirlik kontrolünü değiştiriyor, sınıfını değil.
//
// ⚠ **Maliyet gerçekten SIFIR:** model diskte, çağrı ağa çıkmıyor. Bu "bilinmiyor"
// değil, ölçülmüş sıfır — `claude-code`un abonelik sıfırıyla aynı sınıf (D-8).
//
// ⚠ **R-43:** `rembg`in çıktı biçimi bu dosyanın dışına sızmıyor; motor `{format,data}`
// görüyor, `rembg` diye bir şey görmüyor.

import type { AppError, CorrelationId, Money, MoneyRange, Result } from '@suite/contracts'
import { ZERO_USD, err, ok } from '@suite/contracts'
import { makeError, spawnProcess } from '@suite/kernel'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type {
  CapabilityDecl,
  JobHandle,
  JobStatus,
  ProviderAdapter,
  ProviderContext,
  ProviderInput,
  ValidatedInput,
} from '../types.js'

const ID = 'local-rembg'

/**
 * Sanal ortamın Python'ı ve betik — ikisi de DEPO İÇİNDE.
 *
 * ⚠ Sistem Python'ı KULLANILMIYOR: `rembg` ve `onnxruntime` 587 MB ve sistem geneline
 * kurulmaları bu depoyu makineye bağımlı yapardı. `.venv-gorsel` gitignore'lu ve
 * türetilmiş — `just setup` yeniden kurar (Yasa 12: kurtarma `git clone` + kurulum).
 */
const pythonYolu = (env: Readonly<Record<string, string | undefined>>): string =>
  env['SUITE_GORSEL_PYTHON'] ?? join(env['SUITE_REPO'] ?? process.cwd(), '.venv-gorsel/bin/python')

const betikYolu = (env: Readonly<Record<string, string | undefined>>): string =>
  join(env['SUITE_REPO'] ?? process.cwd(), 'scripts/gorsel/arkaplan-sil.py')

const CAPS: readonly CapabilityDecl[] = [{ name: 'image.matte', lanes: ['free'], supports: {} }]

const sonuclar = new Map<string, JobStatus>()

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

export const localRembg: ProviderAdapter = {
  id: ID,
  title: 'Yerel arka plan silici (BRIA RMBG, CPU)',

  capabilities: () => CAPS,

  validate: (input: ProviderInput): Result<ValidatedInput, AppError> => {
    if (input.capability !== 'image.matte') {
      return err(
        hata('validation', 'CAPABILITY_UNSUPPORTED', input.idempotencyKey, {
          capability: input.capability,
        })
      )
    }
    // ⚠ ⚠ **GİRDİ PROMPT DEĞİL, GÖRSELDİR — ama yük kontrolü BURADA DEĞİL.** Bu
    // yetenekte metin bir şey ifade etmiyor, dolayısıyla boş prompt reddi (diğer
    // adaptörlerin doğru davranışı) burada yanlış olurdu. Görselin VARLIĞINI da burada
    // kontrol etmeyi denedim ve sözleşme testi reddetti — haklı olarak: `validate()`
    // yetenek ve şerit uyumunu doğruluyor, YÜKÜ değil. Sözleşme testi kısıtları
    // `supports`tan türetiyor ve bir base64 yük orada ifade edilemez (o alan
    // yönlendiricinin süzdüğü kısıtlar için, taşınan veri için değil).
    // Yük kontrolü `start`ta ve orada da AÇIK bir hata veriyor — sessiz atlama yok.
    return ok({ ...input, _validated: true })
  },

  // SENKRON (R-42). Model diskte, çağrı ağa çıkmıyor: aralık gerçekten sıfır.
  estimate: (): MoneyRange => ({ low: ZERO_USD, high: ZERO_USD }),

  // SENKRON. Ağa çıkmaz; sanal ortam ve betik yerinde mi diye bakar.
  available: (env) => existsSync(pythonYolu(env)) && existsSync(betikYolu(env)),

  start: async (vi, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    const handle: JobHandle = {
      providerId: ID,
      externalId: vi.idempotencyKey,
      idempotencyKey: vi.idempotencyKey,
    }
    if (!localRembg.available(ctx.env)) {
      // ⚠ Sessizce atlamıyor: "arka plan silinemedi" ile "arka plan silmeye gerek
      // yoktu" ayrı şeyler ve ikincisi bir yalan olurdu.
      return err(
        hata('provider_unavailable', 'REMBG_NOT_INSTALLED', ctx.correlationId, {
          python: pythonYolu(ctx.env),
          hint: 'just setup — .venv-gorsel kurulmamış',
        })
      )
    }

    const b64 = vi.constraints['image_base64']
    if (typeof b64 !== 'string' || b64 === '') {
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('validation', 'NO_IMAGE_INPUT', ctx.correlationId),
      })
      return ok(handle)
    }
    // ⚠ ⚠ **BORU METİN TAŞIYOR, İKİLİ VERİ DEĞİL — ve bunu gerçek bir koşu öğretti.**
    // İlk sürüm `Buffer.from(b64,'base64').toString('binary')` gönderiyordu; `spawnProcess`
    // stdin'i `string` alıp varsayılan utf8 ile yazıyor ve latin1 baytlar BOZULUYOR.
    // Python `cannot identify image file` dedi. Ring 0'ın boru sözleşmesini tek bir
    // yetenek için genişletmek yerine sınır metin tutuldu: base64 girer, base64 çıkar.
    // ⚠ ⚠ **GÖRSEL stdin/stdout ÜZERİNDEN, DOSYA ÜZERİNDEN DEĞİL.** Geçici dosya
    // kullansaydık iki taraf da bir dizin varsayardı, temizlik borcu doğardı ve paralel
    // koşular birbirinin dosyasını ezebilirdi. Boru sınırı zaten var: `spawnProcess`.
    // ⚠ Ölçüldü: model yüklemesi ~8 sn, çıkarım ~9,7 sn. Tavan bunun sekiz katı —
    // yavaş bir makinede kesmek, çalışan bir adımı hataya çevirirdi.
    const sonuc = await spawnProcess(pythonYolu(ctx.env), [betikYolu(ctx.env)], {
      env: ctx.env as Record<string, string>,
      signal: ctx.signal,
      input: b64,
      timeoutMs: 150_000,
      maxOutputBytes: 32 * 1024 * 1024,
    })

    if (sonuc.timedOut) {
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('timeout', 'REMBG_TIMEOUT', ctx.correlationId),
      })
      return ok(handle)
    }
    if (sonuc.code !== 0 || sonuc.stdout.length === 0) {
      sonuclar.set(handle.externalId, {
        state: 'failed',
        error: hata('provider_bad_response', 'REMBG_FAILED', ctx.correlationId, {
          code: sonuc.code,
          stderr: sonuc.stderr.slice(0, 400),
        }),
      })
      return ok(handle)
    }

    // ⚠ Çıktı RGBA PNG; motorun beklediği şekil `{format:'base64', data}` — `image.generate`
    // ile AYNI şekil, çünkü tüketici (`uretilenGorsel`) tek bir şekil biliyor. İkinci bir
    // şekil, üreticiyle tüketici arasında sessiz uyuşmazlık demekti (D-227).
    // ⚠ Çıktı zaten base64: yeniden kodlanmıyor, yalnız boşluklardan arındırılıyor.
    const b64Cikti = sonuc.stdout.trim()
    sonuclar.set(handle.externalId, {
      state: 'succeeded',
      output: { format: 'base64', data: b64Cikti, matlandi: true },
    })
    return ok(handle)
  },

  status: async (h): Promise<Result<JobStatus, AppError>> =>
    ok(sonuclar.get(h.externalId) ?? { state: 'running' }),

  cancel: async (h): Promise<void> => {
    sonuclar.set(h.externalId, { state: 'cancelled' })
  },

  actualCost: async (): Promise<Money | null> => ZERO_USD,
}
