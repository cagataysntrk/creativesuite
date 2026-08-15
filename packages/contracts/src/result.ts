// Result sözleşmesi (§8.6 · R-41).
//
// I/O yapan her dışa açık fonksiyon `Result` döner. `throw` yalnız
// `packages/kernel/src/errors/` içinde yaşar. Gerekçe: bir istisna, çağıran tarafın
// tip imzasında GÖRÜNMEZ. Gözetimsiz bir 03:00 çalıştırmasında yakalanmamış bir
// istisna, maliyeti defterine yazılmamış yarım bir çalıştırma bırakır.

export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Err<E> {
  readonly ok: false
  readonly error: E
}

export type Result<T, E> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok

/**
 * Başarılıysa dönüştür, hatalıysa aynen geçir.
 * Hata TİPİ korunur — hata yolunda tip bilgisi kaybetmek, `classify()`'ın toplam
 * fonksiyon olma garantisini (§8.6) çağrı zincirinin ortasında bozar.
 */
export const mapOk = <T, U, E>(r: Result<T, E>, f: (value: T) => U): Result<U, E> =>
  r.ok ? ok(f(r.value)) : r
