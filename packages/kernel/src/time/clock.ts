// TEK saat (§3.8 · R-06 · chokepoints.json → `saat`).
//
// İki saat replay'i bozar. "Geçen ayki deck'i yeniden üret" diyen bir çalıştırma,
// duvar saatini doğrudan okuyan tek bir satır yüzünden sessizce farklı çıktı verir —
// ve fark, karşılaştırıldığında değil, aylar sonra fark edilir.
//
// Testte saat DONDURULABİLİR. Dondurulamayan bir saat, zamana bağlı her davranışı
// (lease süresi, geçerlilik penceresi, çürüme tarihi) test edilemez kılar.

export type Millis = number

export interface Clock {
  readonly now: () => Millis
  /** ISO-8601 UTC. Depolanan her damga bu biçimdedir. */
  readonly nowIso: () => string
}

const systemNow = (): Millis => Date.now()

export const systemClock: Clock = {
  now: systemNow,
  nowIso: () => new Date(systemNow()).toISOString(),
}

/** Testler için sabit saat. Üretimde ASLA kullanılmaz. */
export const fixedClock = (isoOrMillis: string | Millis): Clock => {
  const ms = typeof isoOrMillis === 'number' ? isoOrMillis : Date.parse(isoOrMillis)
  return { now: () => ms, nowIso: () => new Date(ms).toISOString() }
}

/** İlerletilebilir saat — lease süresi ve zaman aşımı testleri için. */
export const manualClock = (baslangic: string | Millis) => {
  let ms = typeof baslangic === 'number' ? baslangic : Date.parse(baslangic)
  return {
    now: () => ms,
    nowIso: () => new Date(ms).toISOString(),
    ilerlet: (delta: Millis) => {
      ms += delta
    },
  }
}
