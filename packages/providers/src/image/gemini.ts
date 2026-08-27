// Premium şerit: Google Gemini görsel üretimi — "nano banana" (§7.3 · D-2, D-32).
//
// ⚠ ⚠ **BU ADAPTÖR ALTI ANAHTARLA ÖLÇÜLDÜ ve ölçüm depo sahibinin öncülünü ÇÜRÜTTÜ.**
// İstek şuydu: *"birden fazla google api key vereceğim sana, biri biterse öteki fallback
// olur, en son cloudflare'e geçer."* Öncül, her anahtarın kendi günlük kotası olduğu ve
// kotaların ÜST ÜSTE BİNDİĞİ varsayımıydı. Gerçek ölçüm (2026-08-28, altı anahtar):
//
//   · metin modeli (`gemini-3.6-flash`) → 6 anahtarın 6'sı da **200 OK**
//   · görsel modelleri (2.5-flash-image · 3-pro-image · 3.1-flash-image) → 6/6 **429**
//   · 429'un gerekçesi: `limit: 0, model: gemini-3-pro-image`
//
// **`limit: 0` "kotan bitti" DEĞİL, "bedava katmanda görsel üretimi sıfır" demektir.**
// Yani anahtar sayısı çarpan değil: 6 × 0 = 0. Anahtarlar sağlam, engel anahtarlarda
// değil HESAP PLANINDA. Gemini görsel için bir Google projesinde faturalandırma açık
// olmak zorunda.
//
// ⚠ ⚠ **BU YÜZDEN ŞERİT `premium`.** Onu `free` şeride koymak, ölçümün söylediğinin
// tersini beyan etmek olurdu: yönlendirici bedava şeritte onu seçer, her koşuda 429
// yer ve *"neden görsel gelmiyor"* sorusu sağlayıcıda değil YÖNLENDİRİCİDE aranırdı.
//
// ⚠ ⚠ **ANAHTAR ROTASYONU YİNE DE VAR ve boşuna değil.** Faturalandırma açıldığında
// dakika/gün kotaları GERÇEKTEN anahtar başına işliyor; bir anahtar 429 yerse sıradaki
// deneniyor. Ama rotasyon 429'u bir SONUÇ olarak da bildiriyor: bütün anahtarlar
// tükendiğinde adaptör "başarısız" diyor ve yedek zinciri Cloudflare'e geçiyor.
// Sessizce boş görsel döndürmek, kotasız bir koşuyu kotalı gibi göstermek olurdu.
//
// ⚠ **BAŞARILI YANIT ŞEKLİ HENÜZ GERÇEK UÇTAN DOĞRULANMADI.** Faturalandırma kapalı
// olduğu için 200 alınamadı; şekil Google'ın belgelediği `inlineData` sözleşmesine göre
// yazıldı. Bu dosyanın komşusu `cloudflare.ts` tam olarak bu noktada bir ders taşıyor:
// *"bir cassette, sağlayıcının davranışını değil senin varsayımını kaydeder."* Bu yüzden
// tanımlayıcıda `pricing_verified` YOK ve kalite beyanı YAPILMIYOR — faturalandırma
// açıldığında ilk iş `just gate bakeoff-gorsel` ile GERÇEK bir çağrı ölçmek.

import type { AppError, Money, MoneyRange } from '@suite/contracts'
import { err, ok, type Result } from '@suite/contracts'
import { httpFetch, makeError } from '@suite/kernel'
import type {
  CapabilityDecl,
  JobHandle,
  JobStatus,
  ProviderAdapter,
  ProviderContext,
  ProviderInput,
  ValidatedInput,
} from '../types.js'
import {
  ASPECT_PIXELS,
  assertNoTextSuffix,
  imageCapability,
  rangeFromUnit,
  validateImageInput,
  type Aspect,
} from './lanes.js'

const ID = 'gemini-image'

/**
 * Ortam değişkeninin ADI — değeri asla (R-51).
 *
 * ⚠ **ÇOĞUL ve bu bilinçli.** Tanımlayıcı tek bir `auth_env` beyan edebiliyor; altı
 * anahtar için altı değişken adı uydurmak (`GEMINI_API_KEY_1..6`) tanımlayıcıyı kod
 * değişikliği olmadan büyütülemez yapardı. Virgülle ayrılmış tek değişken, anahtar
 * sayısını VERİ yapıyor: yedinci anahtar kasaya eklenir, kod değişmez.
 */
const KEYS_ENV = 'GEMINI_API_KEYS'

/**
 * Model — "nano banana". Yetenek isteniyor, model adı hattan GELMİYOR (R-40 · D-32):
 * bu tablo adaptörün içinde, çünkü hangi modelin hangi oranı verdiği sağlayıcının
 * şeklidir ve sınırı geçmemeli.
 *
 * ⚠ `gemini-2.5-flash-image` seçildi, `gemini-3-pro-image` değil: pro modelin çağrı
 * başı maliyeti belirgin biçimde yüksek ve bu depo slayt BAŞINA görsel üretiyor —
 * dört slaytlık bir karosel dört çağrı demek. Kalite farkı ölçülmeden pahalı olanı
 * varsayılan yapmak, ölçmeden hızlandırmanın tersi ama aynı hatadır (R-78).
 */
const MODEL = 'gemini-2.5-flash-image'

const CAPS: readonly CapabilityDecl[] = [imageCapability(['premium'])]

/**
 * Görsel başı maliyet, mikro-dolar. Ölçüm değil BEYAN — `_pricing/` anlık görüntüsünden
 * gelir ve `pricing_verified: false` bunu açıkça söyler.
 */
const BIRIM_MIKRO = 39_000n

/** Sonuçlar süreç-içi — kalıcılık defterin işi (§3.5), `cloudflare.ts` ile aynı gerekçe. */
const sonuclar = new Map<string, JobStatus>()

const hata = (
  kind: AppError['kind'],
  code: string,
  correlationId: string,
  details: Readonly<Record<string, unknown>> = {}
): AppError =>
  makeError({
    kind,
    code,
    userMessageKey: `error.image.${code}`,
    correlationId: correlationId as AppError['correlationId'],
    details,
  })

/**
 * Kasadaki anahtar listesi. Boş ve yinelenen alanlar atılıyor: kasaya elle yazılan bir
 * listede sondaki virgül ya da iki kez yapıştırılmış bir anahtar beklenen bir kaza ve
 * ikisi de sessizce boş bir denemeye dönüşürdü.
 */
export const anahtarlar = (env: Readonly<Record<string, string>>): readonly string[] => [
  ...new Set(
    (env[KEYS_ENV] ?? '')
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x !== '')
  ),
]

/**
 * Bu HTTP kodunda SIRADAKİ ANAHTAR denenmeli mi.
 *
 * ⚠ ⚠ **AYRIM BURADA ve yanlış yapılırsa altı anahtar da boşa yanar.** `429` (kota) ve
 * `403` (anahtar kapalı/yetkisiz) anahtara ÖZGÜ: başka bir anahtar başarabilir. `400`
 * (bozuk istem) ve `500` ise anahtardan bağımsız — aynı isteği altı kez göndermek altı
 * kez aynı cevabı alır, sadece daha yavaş. Kota hatasını "geçici ağ hatası" gibi
 * görüp beklemek de yanlış olurdu: `limit: 0` beklemekle geçmiyor.
 */
export const anahtarDegistir = (kod: number): boolean => kod === 429 || kod === 403

export const geminiImage: ProviderAdapter = {
  id: ID,
  title: 'Google Gemini görsel (nano banana · premium şerit)',

  // Senkron HTTP ucu — `generateContent` cevabı çağrının içinde döndürüyor.
  islerKalici: false,

  capabilities: () => CAPS,

  validate: (input: ProviderInput): Result<ValidatedInput, AppError> =>
    validateImageInput(input, ['premium']),

  estimate: (_vi: ValidatedInput): MoneyRange => rangeFromUnit(BIRIM_MIKRO, 1),

  // SENKRON. Ağa çıkmaz: kasada EN AZ BİR anahtar var mı, ona bakar.
  available: (env) => anahtarlar(env).length > 0,

  start: async (vi, ctx: ProviderContext): Promise<Result<JobHandle, AppError>> => {
    // İkinci savunma hattı — `cloudflare.ts` ile aynı gerekçe: R-20 tek bir fonksiyona
    // güvenemeyecek kadar önemli.
    const guvenli = assertNoTextSuffix(vi)
    if (!guvenli.ok) return err(guvenli.error)

    const liste = anahtarlar(ctx.env)
    if (liste.length === 0)
      return err(
        hata('provider_auth', 'MISSING_CREDENTIALS', ctx.correlationId, { needs: [KEYS_ENV] })
      )

    const aspect = vi.constraints['aspect'] as Aspect
    const boyut = ASPECT_PIXELS[aspect]

    // ⚠ Denenen anahtarın SIRASI tutuluyor, DEĞERİ değil (R-51): hata ayrıntısına
    // "üçüncü anahtar da 429 yedi" yazmak meşru, anahtarın kendisini yazmak sızıntı.
    const denemeler: { readonly sira: number; readonly kod: number | string }[] = []

    for (const [i, key] of liste.entries()) {
      const yanit = await httpFetch(
        {
          url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
          method: 'POST',
          headers: {
            // ⚠ Anahtar BAŞLIKTA gidiyor, sorgu dizesinde değil: sorgu dizesi ara
            // katmanların erişim kayıtlarına düşer ve o kayıtlar silinmez.
            'x-goog-api-key': key,
            'content-type': 'application/json',
            'idempotency-key': vi.idempotencyKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: vi.prompt }] }],
            generationConfig: {
              // Yalnız GÖRSEL isteniyor: modeli metin de üretebilir bırakmak, R-20'nin
              // koruduğu şeyi sağlayıcı tarafında geri açmak olurdu.
              responseModalities: ['IMAGE'],
              imageConfig: { aspectRatio: aspect },
            },
          }),
          signal: ctx.signal,
        },
        ctx.correlationId as AppError['correlationId']
      )

      // ⚠ ⚠ **AĞ HATASI ile HTTP HATASI AYRI ŞEYLER ve ilk yazımda karıştırdım.**
      // `httpFetch` yalnız ağ düşerse `err` döner; 429 ve 403 `ok: true` olarak gelir
      // ve durum kodu `Response`ın üstündedir. `!yanit.ok`e bakarak kota hatası aramak,
      // altı anahtarın hiçbirini denemeden ilk anahtarda durmak olurdu.
      if (!yanit.ok) {
        denemeler.push({ sira: i + 1, kod: yanit.error.code })
        // Ağ düştüyse anahtar değiştirmek anlamsız: sorun bizim tarafımızda.
        return err(yanit.error)
      }

      const durum = yanit.value.status
      if (durum < 200 || durum >= 300) {
        denemeler.push({ sira: i + 1, kod: durum })
        if (!anahtarDegistir(durum)) {
          // Anahtara ÖZGÜ olmayan hata (bozuk istem, sağlayıcı arızası): altı kez aynı
          // duvara çarpmanın tek etkisi gecikme olurdu.
          return err(
            hata('provider_bad_response', 'HTTP_ERROR', ctx.correlationId, {
              status: durum,
              denemeler,
            })
          )
        }
        continue
      }

      const govde = (await yanit.value.json()) as {
        candidates?: readonly {
          content?: { parts?: readonly { inlineData?: { data?: string; mimeType?: string } }[] }
        }[]
      }
      const parcalar = govde.candidates?.[0]?.content?.parts ?? []
      const gorsel = parcalar.find((p) => typeof p.inlineData?.data === 'string')?.inlineData
      if (gorsel?.data === undefined || gorsel.data === '') {
        // 200 geldi ama görsel YOK: güvenlik süzgeci ya da yalnız metin döndü. Bu
        // anahtarın sorunu DEĞİL — sıradaki anahtar da aynı cevabı verir.
        return err(
          hata('provider_bad_response', 'MALFORMED_RESPONSE', ctx.correlationId, {
            providerMessage: 'yanıtta inlineData yok',
            denemeler,
          })
        )
      }

      const handle: JobHandle = {
        providerId: ID,
        externalId: vi.idempotencyKey,
        idempotencyKey: vi.idempotencyKey,
      }
      sonuclar.set(handle.externalId, {
        state: 'succeeded',
        output: { format: 'base64', data: gorsel.data, width: boyut.w, height: boyut.h },
      })
      return ok(handle)
    }

    // ⚠ ⚠ **BÜTÜN ANAHTARLAR TÜKENDİ ve bu AÇIKÇA söyleniyor.** Sessiz bir boş sonuç,
    // yedek zincirinin Cloudflare'e geçmesini engeller ve koşu görselsiz biter.
    return err(
      hata('provider_rate_limit', 'ALL_KEYS_EXHAUSTED', ctx.correlationId, {
        anahtarSayisi: liste.length,
        denemeler,
      })
    )
  },

  status: async (h): Promise<Result<JobStatus, AppError>> => {
    const s = sonuclar.get(h.externalId)
    if (s === undefined) {
      return err(
        hata('internal', 'RESULT_LOST', h.idempotencyKey, {
          externalId: h.externalId,
          reason: 'senkron sağlayıcı sonucu süreç-içiydi; yeniden üretim gerekiyor',
        })
      )
    }
    return ok(s)
  },

  cancel: async (h): Promise<void> => {
    sonuclar.delete(h.externalId)
  },

  /**
   * GERÇEK maliyet — sağlayıcı bunu bildirmiyor, o yüzden `null`.
   *
   * ⚠ ⚠ **`null` ile `0` AYRI ŞEYLER ve burada karıştırmak pahalıya patlar.** Cloudflare
   * `0` döndürüyor çünkü bedava katmanda çağrı GERÇEKTEN bedava — ölçülmüş bir olgu.
   * Gemini ücretli: `0` demek, harcanan parayı bütçe defterine SIFIR yazmak olurdu ve
   * çalıştırma tavanı hiç dolmazdı. `null` = "bilinmiyor" ve bütçe TAHMİNİ kullanır.
   */
  actualCost: async (_h): Promise<Money | null> => null,
}

/** Maliyet beyanı — tanımlayıcıdaki formülle aynı sayı, tek yerden okunsun diye dışa açık. */
export const GEMINI_BIRIM_MIKRO: Money['micros'] = BIRIM_MIKRO
