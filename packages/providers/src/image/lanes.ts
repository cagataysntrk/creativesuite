// Görsel üretim şeritleri (§7.3, §8.2 · D-2).
//
// **İki şerit, sözleşmede DONMUŞ.** `free` | `premium`. Üçüncü şerit yok ve bu bir
// eksiklik değil bir karar: `free` içinde ucuz ile orta model arasındaki seçim
// **yönlendiricinin** işidir (§8.2), kullanıcının değil. Üçüncü bir şerit ("orta")
// açmak, kullanıcıya sağlayıcı seçtirmenin kılık değiştirmiş hâli olurdu ve R-40'ın
// ("yetenek iste, model isteme") yanından dolaşırdı.
//
// **Şerit kelime ve resim satın alır, tasarım değil** (CLAUDE.md §5). Bedava şeritte
// üretilen görsel daha basit olabilir; ama tipografi, ızgara, renk ve kompozisyon
// ikisinde de AYNIDIR, çünkü onlar render motorundan gelir, modelden değil.

import type { AppError, MoneyRange } from '@suite/contracts'
import { err, ok, usd, type Result } from '@suite/contracts'
import { makeError } from '@suite/kernel'
import type { CapabilityDecl, Lane, ProviderInput, ValidatedInput } from '../types.js'
import { buildImagePrompt, hasNoTextSuffix } from './prompt.js'

/** Her görsel sağlayıcısının bildirdiği ortak yetenek şekli. */
export const IMAGE_CAPABILITY = 'image.generate'

/**
 * Desteklenen en-boy oranları. Kapalı liste: pipeline'ın istediği oran burada yoksa
 * yönlendirici o sağlayıcıyı **gerekçesiyle** eler (§8.2). "Yakın orana yuvarlama"
 * yapılmaz — 4:5 isteyip 1:1 almak, Instagram'da kırpılmış bir başlık demektir.
 */
export const ASPECTS = ['1:1', '4:5', '9:16', '16:9'] as const
export type Aspect = (typeof ASPECTS)[number]

export const ASPECT_PIXELS: Record<Aspect, { readonly w: number; readonly h: number }> = {
  '1:1': { w: 1024, h: 1024 },
  '4:5': { w: 1024, h: 1280 },
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
}

export const imageCapability = (lanes: readonly Lane[]): CapabilityDecl => ({
  name: IMAGE_CAPABILITY,
  lanes,
  supports: {
    aspect: [...ASPECTS],
    // `no_text` yalnız `true` olabilir. Sözleşmede `false` YOK — desteklenen değerler
    // listesinde göründüğü an biri onu seçer ve R-20 bir öneriye dönüşür.
    no_text: [true],
  },
})

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
 * Görsel girdisinin ortak doğrulaması — her iki şerit de bunu kullanır.
 *
 * **Prompt burada KURULUR.** Adaptörün kendi prompt'unu birleştirmesine izin verilseydi
 * iki şerit iki farklı prompt üretir ve "bedava ile premium tipografide aynıdır" vaadi
 * ilk günden çürürdü. Kurulan prompt `_validated` girdinin içine yazılır.
 */
export const validateImageInput = (
  input: ProviderInput,
  lanes: readonly Lane[]
): Result<ValidatedInput, AppError> => {
  const cid = input.idempotencyKey
  if (input.capability !== IMAGE_CAPABILITY) {
    return err(hata('validation', 'CAPABILITY_UNSUPPORTED', cid, { capability: input.capability }))
  }
  if (!lanes.includes(input.lane)) {
    return err(hata('validation', 'LANE_UNSUPPORTED', cid, { lane: input.lane }))
  }

  const aspect = input.constraints['aspect']
  if (typeof aspect !== 'string' || !(ASPECTS as readonly string[]).includes(aspect)) {
    return err(hata('validation', 'ASPECT_UNSUPPORTED', cid, { aspect, supported: ASPECTS }))
  }

  // `no_text: false` AÇIKÇA reddedilir. Sessizce `true`ya çekmek daha "yardımsever"
  // görünürdü ama kullanıcının yazdığı ile sistemin yaptığı ayrışırdı — ve o ayrışma
  // ancak çıktıya bakınca fark edilir.
  if (input.constraints['no_text'] === false) {
    return err(hata('policy_blocked', 'NO_TEXT_REQUIRED', cid, { rule: 'R-20' }))
  }

  const p = buildImagePrompt(input.prompt, cid)
  if (!p.ok) return err(p.error)

  return ok({ ...input, prompt: p.value.text, _validated: true })
}

/**
 * Doğrulanmış girdinin gerçekten kurucudan geçtiğini sınar — **ikinci savunma hattı**.
 *
 * `start()` bunu her çağrıda sorar. `validate()`in atlandığı ya da girdinin elle
 * kurulduğu bir yol açılırsa (bir test yardımcısı, bir replay, bir refactor) burası
 * yakalar. R-20 tek bir fonksiyona güvenemeyecek kadar önemli.
 */
export const assertNoTextSuffix = (vi: ValidatedInput): Result<ValidatedInput, AppError> =>
  hasNoTextSuffix(vi.prompt)
    ? ok(vi)
    : err(hata('policy_blocked', 'NO_TEXT_SUFFIX_MISSING', vi.idempotencyKey, { rule: 'R-20' }))

/**
 * Birim fiyattan aralık üretir.
 *
 * **Aralık, tek sayı değil** (§8.3): görsel üretiminde yeniden deneme gerçek ve sık
 * (içerik filtresi, bozuk çıktı). Üst sınır bir yeniden denemeyi kapsar; kapsamasaydı
 * ilk retry'da bütçe tavanı sessizce aşılırdı.
 */
export const rangeFromUnit = (unitMicros: bigint, count: number): MoneyRange => ({
  low: usd(unitMicros * BigInt(count)),
  high: usd(unitMicros * BigInt(count) * 2n),
})
