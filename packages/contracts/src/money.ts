// Para (§8.3 · D-36).
//
// USD MİKRO-BİRİM, `bigint`. 1_000_000n = $1.00.
// Kuruş/cent DEĞİL, float hiç değil: görsel başına $0.0035 gibi fiyatlar minor-unit'te
// hassasiyet kaybeder ve float'ta zaten toplanamaz — 10.000 görselin toplam maliyeti
// yuvarlama hatasıyla dolar mertebesinde kayar ve bütçe tavanı (D-17) yalan söyler.
//
// TRY yalnızca RAPORDA görünür ve daima sabitlenmiş bir TCMB anlık görüntüsüyle
// çevrilir; çevrim oranı asla çalıştırma anında canlı çekilmez, yoksa aynı çalıştırma
// iki kez farklı maliyet raporlar.

/** Tek para birimi: USD. Genişletmeden önce §8.3'ü ve D-36'yı oku. */
export type Currency = 'USD'

export interface Money {
  /** USD'nin milyonda biri. 1_000_000n = $1.00 · 3_500n = $0.0035 */
  readonly micros: bigint
  readonly currency: Currency
}

export const MICROS_PER_USD = 1_000_000n

export const usd = (micros: bigint): Money => ({ micros, currency: 'USD' })

export const ZERO_USD: Money = usd(0n)

/**
 * Toplama. `Currency` tek üyeli olduğu sürece farklı birim toplamak TİP olarak
 * imkânsızdır — bu yüzden burada çalışma zamanı kontrolü yok ve `throw` da yok
 * (`throw` yalnız `kernel/src/errors/`, §8.6).
 *
 * ⚠ İkinci bir para birimi eklendiği gün bu fonksiyon `Result<Money, AppError>`
 * dönmek ZORUNDA. Aksi hâlde tip sistemi susar ve iki birim sessizce toplanır.
 */
export const addMoney = (a: Money, b: Money): Money => ({
  micros: a.micros + b.micros,
  currency: a.currency,
})

/**
 * Tam sayı katı. **Varyant matrisi bunu kullanır**: yedi varyantlık bir reklam seti,
 * ücretli her adımı yedi kez koşar ve tek koşumluk tahmin gösterilirse kullanıcı
 * gerçekte ödeyeceğinin yedide birine onay verir (§10 · D-225).
 *
 * Katsayı `number` çünkü bir sayım (varyant adedi); `bigint`e burada çevriliyor ki
 * çağıranların her biri aynı dönüşümü tekrar yazmasın. Negatif kat anlamsız olurdu
 * ama `throw` burada yasak (§8.6) — çağıran zaten `varyantSayisi`den ≥1 alıyor.
 */
export const scaleMoney = (m: Money, kat: number): Money => ({
  micros: m.micros * BigInt(Math.trunc(kat)),
  currency: m.currency,
})

/** Bir aralık: maliyet TEK SAYI olarak gösterilmez (§4b — tahmin bir bant taşır). */
export interface MoneyRange {
  readonly low: Money
  readonly high: Money
}
