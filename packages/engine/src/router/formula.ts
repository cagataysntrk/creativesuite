// Maliyet formülü değerlendiricisi (§8.2 · R-41 · D-101).
//
// **Neden QuickJS değil.** ANAYASA §8.2 formülleri "QuickJS'te, 10 ms deadline" diye
// tarif ediyordu. Gerçek formüller şuna benziyor: `0.025 * num_images`,
// `steps * 0.0001 + 0.002`. Bunun için bir WASM JavaScript motoru taşımak, çözdüğünden
// büyük bir yüzey getirir. Onun yerine **kapalı bir aritmetik dilbilgisi** var:
// sayı, tanımlayıcı, `+ - * /`, parantez ve dört fonksiyon. Başka hiçbir şey.
//
// Bu seçim QuickJS'ten **daha güvenli**, daha az kod ve daha hızlı:
//
// - Dilbilgisinde **döngü yok** → sonsuz döngü imkânsız → deadline'a gerek yok.
//   (Deadline gerektiren bir tasarım, deadline'ın kaçırılabileceğini kabul eder.)
// - Host bağlantısı yok: `fetch`, `require`, `process`, prototip zinciri — hiçbiri
//   dilbilgisinde yok. QuickJS'te bunlar "verilmediği için" yok; burada
//   **söylenemedikleri için** yok.
// - Tanımsız değişken **hata**dır, `undefined` değil. JavaScript'te `steps * fiyat`
//   yanlış anahtarla `NaN` verir ve `NaN` bir maliyet olarak sessizce 0 mikro'ya
//   yuvarlanırdı — ücretli bir çağrı bedava görünürdü.
//
// **Float yok** (R-41). Hesap sabit noktalı `bigint` üzerinde, ölçek 10^12. Çarpma ve
// bölme her adımda ölçeğe geri normalize edilir; tek yuvarlama noktası en sonda,
// mikro'ya çevirirken. `0.1 + 0.2 !== 0.3` bir para modelinde kabul edilemez.

import type { Money } from '@suite/contracts'
import { usd } from '@suite/contracts'

/** Sabit nokta ölçeği: bir birim = 10^12. Mikro'dan (10^6) altı basamak daha derin. */
const SCALE = 1_000_000_000_000n

export type FormulaError =
  | { readonly kind: 'syntax'; readonly at: number; readonly text: string }
  | { readonly kind: 'unknown_identifier'; readonly name: string }
  | { readonly kind: 'unknown_function'; readonly name: string }
  | { readonly kind: 'division_by_zero' }
  | { readonly kind: 'negative_cost'; readonly micros: bigint }

export type FormulaResult =
  | { readonly ok: true; readonly value: Money }
  | { readonly ok: false; readonly error: FormulaError }

// ── sözcükleme ───────────────────────────────────────────────────────────────

type Token =
  | { readonly t: 'num'; readonly v: bigint; readonly at: number }
  | { readonly t: 'id'; readonly v: string; readonly at: number }
  | { readonly t: 'op'; readonly v: string; readonly at: number }

/** `"0.025"` → ölçekli bigint. Float'a hiç uğramaz — dize doğrudan tam sayıya çevrilir. */
const ondalikOlcekle = (metin: string): bigint => {
  const [tam = '0', kesir = ''] = metin.split('.')
  const dolgulu = (kesir + '000000000000').slice(0, 12)
  return BigInt(tam) * SCALE + BigInt(dolgulu === '' ? '0' : dolgulu)
}

const sozcukle = (src: string): { tokens: Token[]; hata: FormulaError | null } => {
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i] as string
    if (c === ' ' || c === '\t' || c === '\n') {
      i++
      continue
    }
    if (c >= '0' && c <= '9') {
      const m = /^\d+(\.\d+)?/.exec(src.slice(i))
      if (m === null) return { tokens, hata: { kind: 'syntax', at: i, text: c } }
      tokens.push({ t: 'num', v: ondalikOlcekle(m[0]), at: i })
      i += m[0].length
      continue
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i)) as RegExpExecArray
      tokens.push({ t: 'id', v: m[0], at: i })
      i += m[0].length
      continue
    }
    if ('+-*/(),'.includes(c)) {
      tokens.push({ t: 'op', v: c, at: i })
      i++
      continue
    }
    // Dilbilgisinde OLMAYAN her karakter burada durur: `.` zincirlemesi, `[`, `=`, `;`
    // — hepsi sözdizimi hatası. Kapalı dilbilgisinin bütün güvenlik iddiası bu satırda.
    return { tokens, hata: { kind: 'syntax', at: i, text: c } }
  }
  return { tokens, hata: null }
}

// ── ayrıştırma + değerlendirme (tek geçiş, özyinelemeli iniş) ────────────────

const FONKSIYONLAR = new Set(['min', 'max', 'ceil', 'floor'])

interface Durum {
  readonly tokens: readonly Token[]
  i: number
  hata: FormulaError | null
}

const carp = (a: bigint, b: bigint): bigint => (a * b) / SCALE
const bol = (a: bigint, b: bigint): bigint => (a * SCALE) / b

const birim = (d: Durum, p: Readonly<Record<string, number>>): bigint => {
  const tok = d.tokens[d.i]
  if (tok === undefined) {
    d.hata ??= { kind: 'syntax', at: -1, text: 'beklenmedik son' }
    return 0n
  }
  if (tok.t === 'num') {
    d.i++
    return tok.v
  }
  if (tok.t === 'op' && tok.v === '(') {
    d.i++
    const v = toplam(d, p)
    const kapanis = d.tokens[d.i]
    if (kapanis?.t === 'op' && kapanis.v === ')') d.i++
    else d.hata ??= { kind: 'syntax', at: tok.at, text: 'kapanmayan parantez' }
    return v
  }
  if (tok.t === 'op' && tok.v === '-') {
    d.i++
    return -birim(d, p)
  }
  if (tok.t === 'id') {
    const sonraki = d.tokens[d.i + 1]
    if (sonraki?.t === 'op' && sonraki.v === '(') {
      if (!FONKSIYONLAR.has(tok.v)) {
        d.hata ??= { kind: 'unknown_function', name: tok.v }
        return 0n
      }
      d.i += 2
      const argumanlar: bigint[] = [toplam(d, p)]
      while (d.tokens[d.i]?.t === 'op' && d.tokens[d.i]?.v === ',') {
        d.i++
        argumanlar.push(toplam(d, p))
      }
      const kapanis = d.tokens[d.i]
      if (kapanis?.t === 'op' && kapanis.v === ')') d.i++
      else d.hata ??= { kind: 'syntax', at: tok.at, text: 'kapanmayan parantez' }
      return uygula(tok.v, argumanlar)
    }
    // Tanımsız değişken SIFIR değil HATA. `undefined`ı 0 saymak, formülün bir
    // parçasının sessizce buharlaşması ve ücretli çağrının bedava görünmesi demektir.
    if (!Object.hasOwn(p, tok.v)) {
      d.hata ??= { kind: 'unknown_identifier', name: tok.v }
      d.i++
      return 0n
    }
    d.i++
    return ondalikOlcekle(String(p[tok.v]))
  }
  d.hata ??= { kind: 'syntax', at: tok.at, text: 'beklenmeyen simge' }
  d.i++
  return 0n
}

const uygula = (ad: string, a: readonly bigint[]): bigint => {
  const ilk = a[0] ?? 0n
  switch (ad) {
    case 'min':
      return a.reduce((x, y) => (y < x ? y : x), ilk)
    case 'max':
      return a.reduce((x, y) => (y > x ? y : x), ilk)
    case 'ceil':
      return ilk % SCALE === 0n ? ilk : (ilk / SCALE) * SCALE + (ilk > 0n ? SCALE : 0n)
    case 'floor':
      return ilk % SCALE === 0n ? ilk : (ilk / SCALE) * SCALE - (ilk < 0n ? SCALE : 0n)
    default:
      return ilk
  }
}

const carpim = (d: Durum, p: Readonly<Record<string, number>>): bigint => {
  let sol = birim(d, p)
  for (;;) {
    const tok = d.tokens[d.i]
    if (tok?.t !== 'op' || (tok.v !== '*' && tok.v !== '/')) return sol
    d.i++
    const sag = birim(d, p)
    if (tok.v === '/') {
      if (sag === 0n) {
        d.hata ??= { kind: 'division_by_zero' }
        return sol
      }
      sol = bol(sol, sag)
    } else sol = carp(sol, sag)
  }
}

const toplam = (d: Durum, p: Readonly<Record<string, number>>): bigint => {
  let sol = carpim(d, p)
  for (;;) {
    const tok = d.tokens[d.i]
    if (tok?.t !== 'op' || (tok.v !== '+' && tok.v !== '-')) return sol
    d.i++
    const sag = carpim(d, p)
    sol = tok.v === '+' ? sol + sag : sol - sag
  }
}

/**
 * Formülü verilen parametrelerle değerlendirir ve **USD mikro** döner.
 *
 * `params` sayısaldır ve sağlayıcı girdisinden gelir (`num_images`, `steps`, `seconds`).
 * Tanımsız bir isim hata verir; formülün kendisi hiçbir yere erişemez.
 */
export const evaluateFormula = (
  formula: string,
  params: Readonly<Record<string, number>>
): FormulaResult => {
  const { tokens, hata } = sozcukle(formula)
  if (hata !== null) return { ok: false, error: hata }
  const d: Durum = { tokens, i: 0, hata: null }
  const olcekli = toplam(d, params)
  if (d.hata !== null) return { ok: false, error: d.hata }
  if (d.i !== tokens.length) {
    const kalan = tokens[d.i]
    return {
      ok: false,
      error: { kind: 'syntax', at: kalan?.at ?? -1, text: 'ifadeden sonra artık girdi' },
    }
  }
  // Tek yuvarlama noktası: 10^12 → 10^6. Yukarı yuvarlanıyor — maliyeti olduğundan
  // AZ göstermek, bütçe tavanının sessizce aşılması demektir (§8.3).
  const micros = (olcekli + 999_999n) / 1_000_000n
  if (micros < 0n) return { ok: false, error: { kind: 'negative_cost', micros } }
  return { ok: true, value: usd(micros) }
}
