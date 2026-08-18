// Adaptör sözleşmesi (§8.4 · R-42, R-43).
//
// Her sağlayıcı TAM OLARAK bunu uygular ve başka hiçbir şey dışa açmaz.
//
// **`estimate()` SENKRONDUR ve saftır.** Bu bir stil tercihi değil: çalıştırma öncesi
// maliyet ancak ağ gerektirmiyorsa dürüsttür. Ağ çağrısı gerektiren bir tahmin, tahmin
// değil ÖN-ÇAĞRIDIR — ve o çağrının kendisi para harcar. Dönüş tipi `MoneyRange`
// olduğu için `async` yazmak derleme hatasıdır (R-42).
//
// **Sağlayıcı SDK tipi, yanıt nesnesi veya string enum'u bu sınırı GEÇEMEZ** (R-43).
// Geçseydi, sağlayıcı değiştiği gün motor da değişirdi ve "yetenek iste, model isteme"
// (R-40) sözü kâğıt üstünde kalırdı.

import type { AppError, Money, MoneyRange, Result } from '@suite/contracts'

/** Bedava/premium şerit (D-2). Sözleşmede DONMUŞ — üçüncü şerit yok. */
export type Lane = 'free' | 'premium'

export interface CapabilityDecl {
  /** `image.generate`, `text.generate`, `audio.tts`… Fiil adı DEĞİL (§3.10). */
  readonly name: string
  readonly lanes: readonly Lane[]
  /** Bu yeteneğin desteklediği kısıtlar — yönlendirici filtresi bunu okur (§8.2). */
  readonly supports: Readonly<Record<string, readonly (string | number | boolean)[]>>
}

export interface ProviderInput {
  readonly capability: string
  readonly lane: Lane
  readonly prompt: string
  readonly constraints: Readonly<Record<string, unknown>>
  readonly idempotencyKey: string
}

/** Doğrulanmış girdi — `validate()` çıkışı. Ham girdi `estimate`e ULAŞMAZ. */
export interface ValidatedInput extends ProviderInput {
  readonly _validated: true
}

export interface JobHandle {
  readonly providerId: string
  /** Sağlayıcının kendi kimliği. Mutabakat (§8.5) bunu kullanır. */
  readonly externalId: string
  readonly idempotencyKey: string
}

export type JobStatus =
  | { readonly state: 'running' }
  | { readonly state: 'succeeded'; readonly output: unknown }
  | { readonly state: 'failed'; readonly error: AppError }
  | { readonly state: 'cancelled' }

export interface ProviderContext {
  readonly correlationId: string
  readonly signal: AbortSignal
  /** Ortam AÇIKÇA verilir — adaptör `process.env`e dokunamaz (§3.8, §14). */
  readonly env: Readonly<Record<string, string>>
}

export interface ProviderAdapter {
  readonly id: string
  readonly title: string

  capabilities: () => readonly CapabilityDecl[]

  validate: (input: ProviderInput) => Result<ValidatedInput, AppError>

  /**
   * ⚠ SENKRON. Dönüş tipi `MoneyRange`; `Promise<MoneyRange>` yazmak derleme hatasıdır.
   * Ağa çıkmaz, dosya okumaz, süreç başlatmaz.
   */
  estimate: (vi: ValidatedInput) => MoneyRange

  /**
   * Sağlayıcı ŞU AN kullanılabilir mi — senkron. `estimate` gibi ağ kullanamaz;
   * ikili dosya var mı, anahtar tanımlı mı gibi yerel kontroller yapar.
   * `false` dönmesi sessiz bir atlama DEĞİLDİR: yönlendirici bunu red gerekçesi
   * olarak manifest'e yazar (§13).
   */
  available: (env: Readonly<Record<string, string>>) => boolean

  /**
   * İşler SÜRECİ AŞAR MI — yani bu süreç ölse bile iş sağlayıcıda devam eder mi?
   *
   * ⚠ ⚠ **BU BEYAN YOKTU ve hattı sonsuz beklemeye soktu.** Zamanlayıcı, yarıda
   * kalmış bir kaydın tutamağı varsa (doğru biçimde) "yeniden çağırma, SOR" diyor —
   * çift ödemeyi önlemenin tek yolu bu. Ama `claude-code` işleri bellekte bir
   * `Map`te tutuyor: süreç ölünce tutamak ÖLÜ. Sorulan şey bir daha asla
   * cevaplanmayacak ve `status` sonsuza kadar "koşuyor" diyordu.
   *
   * Ölçülen zincir: adım bir kez hata verdi → defterde tutamaklı `possibly-charged`
   * kayıt kaldı → sonraki her koşuda `claude` HİÇ başlatılmadan on beş dakika
   * asıldı. Hiçbir bileşen yanlış davranmıyordu; eksik olan tek şey bu beyandı.
   *
   * `false` = iş devralınamaz; yarıda kalmışsa YENİDEN çağrılmalı. Bu güvenli,
   * çünkü devralınamayan iş zaten tamamlanmamıştır ve ücret de tahakkuk etmemiştir.
   * `true` = kuyruk API'si (fal gibi); tutamakla sorulur, asla yeniden çağrılmaz.
   */
  readonly islerKalici: boolean

  start: (vi: ValidatedInput, ctx: ProviderContext) => Promise<Result<JobHandle, AppError>>
  status: (h: JobHandle) => Promise<Result<JobStatus, AppError>>
  cancel: (h: JobHandle) => Promise<void>

  /** Sağlayıcı bildirmiyorsa `null` — tahminden KOPYALANMAZ (§8.3). */
  actualCost: (h: JobHandle) => Promise<Money | null>
}
