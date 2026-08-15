// Türkçe metin primitifleri (§7.2 · R-21 · D-165).
//
// BU DOSYA, TÜM REPODA CASE DÖNÜŞTÜREN TEK YERDİR.
//
// **Ring -1'de (contracts) duruyor, kernel'de değil.** Sebep: katlama hem sunucuda
// (FTS5 indeksi) hem tarayıcıda (komut paleti) AYNI sonucu vermek zorunda (§5.6) ve
// tarayıcı halkası kernel'i import EDEMEZ — kernel `better-sqlite3` taşır. Kernel'de
// kalsaydı ya tarayıcı ikinci bir katlama yazacaktı (iki gerçek: paletin bulduğu ile
// indeksin bulduğu ayrışır) ya da halka sınırı gevşetilecekti. `Money` gibi: herkesin
// aynı biçimde konuşmak zorunda olduğu bir ilkel, sözleşme halkasına aittir.
//
// Neden: `'i'.toUpperCase()` → `'I'`, olması gereken `'İ'`. `'I'.toLowerCase()` → `'i'`,
// olması gereken `'ı'`. Hata sessizdir; ekran görüntüsünde tipo gibi görünür ve üretime
// kadar yaşar — bir prospect'e giden deck'te "ISTANBUL" yazar ve kimse build'de görmez.
//
// Aynı ailenin kabuk seviyesindeki kardeşi D-58'de: `LANG=tr_TR.UTF-8` altında POSIX
// `[A-Za-z]` sınıfı da `i`/`I` çevresinde kırılıyor. Türkçe'nin `i` sorunu her katmanda var.

const TR = 'tr'

/** `upper('istanbul')` → `İSTANBUL` */
export const upper = (s: string): string => s.toLocaleUpperCase(TR)

/** `lower('IĞDIR')` → `ığdır` */
export const lower = (s: string): string => s.toLocaleLowerCase(TR)

/** Yalnız ilk harf büyük, gerisi Türkçe küçük. `title` DEĞİL — kelime kelime yapmaz. */
export const sentenceCase = (s: string): string =>
  s.length === 0 ? s : upper(s.slice(0, 1)) + lower(s.slice(1))

// ── protokol token'ları: locale'den BAĞIMSIZ case ────────────────────────────
// HTTP başlık adı, metot, MIME tipi, enum değeri… bunlar Türkçe metin DEĞİL, ASCII
// protokol token'ıdır ve Türkçe kurallarıyla dönüştürülmemelidir:
//   'X-API-KEY'.toLocaleLowerCase('tr') → 'x-apı-key'   ← kümede eşleşmez
// JS'te locale'siz `.toLowerCase()` zaten locale-bağımsızdır; ama çıplak çağrı
// "acaba unutuldu mu" sorusunu bırakır. Bu iki fonksiyon niyeti KODA yazar:
// burada Türkçe kuralı BİLEREK uygulanmıyor.

export const asciiLower = (s: string): string => s.toLowerCase()
export const asciiUpper = (s: string): string => s.toUpperCase()

// ── ASCII katlama ────────────────────────────────────────────────────────────
// Türkçe'ye özgü harfler ASCII karşılıklarına iner. `ı → i` ve `İ → i` AYNI hedefe
// gider: arama tarafında ikisini ayırmak, kullanıcının "olcum" yazıp "ölçüm" bulamaması
// demektir. Slug tarafında da URL'de `ı` istemiyoruz.
const FOLD: Readonly<Record<string, string>> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  i: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  â: 'a',
  Â: 'a',
  î: 'i',
  Î: 'i',
  û: 'u',
  Û: 'u',
}

const foldChars = (s: string): string =>
  Array.from(s)
    .map((c) => FOLD[c] ?? c)
    .join('')

/**
 * Arama için normalleştirme (§5.6).
 * FTS5 `unicode61 remove_diacritics 2` ile AYNI sonucu vermek zorunda; ayrışırsa
 * indekste bulunan bir kayıt sorguda bulunamaz ve hata iki katmanın arasında kalır.
 */
export const foldForSearch = (s: string): string => foldChars(lower(s))

/** URL/dosya adı için. Türkçe harf yok, boşluk yok, tekrarlı tire yok. */
export const slug = (s: string): string =>
  foldChars(lower(s))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// ── heceleme ─────────────────────────────────────────────────────────────────
// Chromium'un Türkçe heceleme sözlüğü YOKTUR. `hyphens: auto` Türkçe metinde hiçbir
// şey yapmaz; dar bir sütunda başlık taşar veya çirkin kırılır. Bu yüzden yumuşak
// tire (U+00AD) SUNUCUDA enjekte edilir — tarayıcıya güvenilmez.
//
// Türkçe hece yapısı düzenlidir: V · VC · CV · CVC · VCC · CVCC.
// Kural: iki ünlü arasındaki tek ünsüz SONRAKİ heceye gider (a-ra-ba);
// iki ünsüz varsa arasından bölünür (kar-tal); üç ünsüz varsa ilk ikisi önceki
// hecede kalır (türk-çe).

const VOWELS = new Set(Array.from('aeıioöuüAEIİOÖUÜâîûÂÎÛ'))
const isVowel = (c: string): boolean => VOWELS.has(c)

export const syllables = (word: string): string[] => {
  const chars = Array.from(word)
  if (chars.length === 0) return []

  // Ünlü konumları hecelerin çekirdeğidir. Ünlüsüz dizi bölünmez.
  const vowelAt: number[] = []
  chars.forEach((c, i) => {
    if (isVowel(c)) vowelAt.push(i)
  })
  if (vowelAt.length <= 1) return [word]

  const cuts: number[] = []
  for (let k = 0; k < vowelAt.length - 1; k++) {
    const v1 = vowelAt[k] as number
    const v2 = vowelAt[k + 1] as number
    const between = v2 - v1 - 1 // aradaki ünsüz sayısı
    // Kural TEK: son ünsüz sonraki heceye gider, öncekiler önceki hecede kalır.
    //   0 ünsüz → a-ile   ·  1 → a-ra-ba  ·  2 → kar-tal  ·  3 → türk-çe
    // İlk sürüm 3 ünsüzde `v1 + between - 1` yazıyordu ve `tür-kçe` üretiyordu;
    // test yakaladı. Üç ayrı dal yerine tek kural: kesim daima son ünsüzden önce.
    cuts.push(between === 0 ? v2 : v2 - 1)
  }

  const out: string[] = []
  let start = 0
  for (const c of cuts) {
    out.push(chars.slice(start, c).join(''))
    start = c
  }
  out.push(chars.slice(start).join(''))
  return out
}

const SOFT_HYPHEN = '­'

/**
 * Kelimelere yumuşak tire enjekte eder. Kısa kelimeler ve kenara çok yakın kırılmalar
 * atlanır: iki harflik bir kırılma, kırılmamaktan daha çirkindir.
 */
export const softHyphenate = (text: string, minWordLength = 6, minEdge = 2): string =>
  text.replace(/\p{L}+/gu, (word) => {
    if (Array.from(word).length < minWordLength) return word
    const parts = syllables(word)
    if (parts.length < 2) return word

    let acc = parts[0] as string
    const out: string[] = [acc]
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i] as string
      const kalan = Array.from(parts.slice(i).join('')).length
      const gecen = Array.from(acc).length
      if (gecen >= minEdge && kalan >= minEdge) out.push(SOFT_HYPHEN)
      out.push(part)
      acc += part
    }
    return out.join('')
  })
