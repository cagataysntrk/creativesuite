// Deterministik lexicon linter (§11.2, §11.4 · R-32, R-35 · D-112).
//
// **Modele "bu marka uygun mu" SORULMAZ.** Sorulan model neredeyse her şeye evet der:
// yargı isteyen bir prompt, onaylayan bir cevabın en kolay yoludur. Burada liste var —
// yasak terim, kaynaksız sayı, token dışı hex, eksik alt-text, locale-naif casing.
// Beşi de mekanik, beşi de tekrar üretilebilir, beşi de kasten ihlal edilerek test
// edilebilir. Bir LLM yargıcının hiçbiri değil.
//
// **Türkçe sayısal iddia çoğu zaman RAKAMSIZ yazılır.** "yüzde kırk azalttık",
// "üç kat hızlandırdık", "yarım milyon parça" — hiçbirinde rakam yok ve rakam arayan
// bir desen üçünü de kaçırır. Bu, kuralın Türkçe'de İngilizce'dekinden zor olmasının
// sebebi ve linter'ın en çok kaçıracağı yer, o yüzden sözcükler de listede.

import { asciiLower, foldForSearch } from '@suite/kernel'
import type { Block, DocumentModel } from '@suite/kernel'

export type LexiconViolation =
  | { readonly kind: 'forbidden_term'; readonly term: string; readonly where: string }
  | { readonly kind: 'unsourced_claim'; readonly claim: string; readonly where: string }
  | { readonly kind: 'off_token_hex'; readonly hex: string; readonly where: string }
  | { readonly kind: 'missing_alt'; readonly src: string }
  | { readonly kind: 'naive_casing'; readonly text: string; readonly where: string }

export interface LexiconRules {
  /** Yasak terimler — diyakritik-katlanmış karşılaştırılır. */
  readonly forbidden: readonly string[]
  /**
   * Marka token'larından gelen izinli hex listesi.
   *
   * **Üç durum, üçü de farklı:**
   * - `null` → palet TANIMSIZ (marka henüz token üretmemiş) → denetim ATLANIR
   * - `[]` → palet tanımlı ama hex İÇERMİYOR → her hex token dışıdır
   * - dolu liste → yalnız listedekiler geçer
   *
   * İkinci durum bu projede varsayılan: marka token'ları OKLCH (§12.1) ve palette hiç
   * hex yok. `[]`i `null` gibi ele almak, denetimi tam da en çok gerektiği yerde
   * kapatırdı — çünkü OKLCH bir palette yazılmış her hex, tanımı gereği token dışıdır.
   */
  readonly allowedHex: readonly string[] | null
  /** Bu metinde sayısal iddia varsa gerekli olan kaynak. `null` = kaynak yok. */
  readonly claimSource: string | null
}

/**
 * Eski sitenin desenli yer tutucuları (§11.4). Bunlar **gerçek değil** ve yeni kreatife
 * taşınmaları sistemin ilk gününde uydurma sayı yayınlaması demek olurdu.
 */
export const MIRAS_YER_TUTUCULAR: readonly string[] = [
  '1.247',
  '892',
  '2.456',
  '1.234.567',
  '1247',
  '1234567',
]

/**
 * Rakamlı sayısal iddia.
 *
 * Tek haneli gündelik sayılar hariç ("3 adım", "5 dakika"): hepsini kaynak istemek
 * linter'ı kullanılamaz yapardı ve **yanlış pozitif de bir hatadır** — sürekli alarm
 * veren kapı, kapatılan kapıdır.
 */
const RAKAMLI =
  /(?:%\s?\d[\d.,]*|\b\d[\d.,]*\s?(?:%|kat|kez|adet|ton|tl|usd|eur)\b|\b\d[\d.,]{2,}\b)/gi

/**
 * Yıl gibi görünen dört haneli sayı (1900-2100). "2025 yılında kurulduk" bir performans
 * iddiası değil, bir olgu beyanıdır ve `claim_source` istemek anlamsız olur.
 */
const YIL = /^\d{4}$/

/** Aralık ifadesi: `50-500 çalışan` bir performans iddiası değil, bir tarif. */
const ARALIK = /\b\d[\d.,]*\s*[-–—]\s*\d[\d.,]*\b/g

/**
 * Tırnak içi metin **alıntıdır, iddia değil.**
 *
 * Corpus kayıtlarının çoğu yönetişim nesridir ve sık sık *ne yapılmaması gerektiğini*
 * alıntılar: `eski sitedeki "1.247 İlan"` cümlesi o sayıyı reddediyor, öne sürmüyor.
 * Alıntıyı iddia saymak, kuralı ANLATAN belgeyi kuralın ihlali sayardı — ve o kapı
 * ilk gün kapatılırdı.
 *
 * Bilinen sınır: gerçek bir iddiayı tırnağa alarak kaçırmak mümkün. Kabul edilen bir
 * ödünleşme; alternatifi, dokümantasyonu imkânsız kılan bir linter.
 */
const TIRNAK = /["“”«»„][^"“”«»„]{0,200}["“”«»„]/g

/**
 * İddia taramasından önce düşülenler: hex kodları, aralıklar, tırnak içi alıntılar.
 *
 * `#101418` içindeki `101418` desene uyuyordu ve kendi token'ını yazan her metin
 * linter'ı kırmızıya döndürüyordu — testin yakaladığı gerçek bir yanlış pozitif.
 */
const ayikla = (t: string): string =>
  t.replace(HEX_TARAMA, ' ').replace(TIRNAK, ' ').replace(ARALIK, ' ')

/**
 * Çıplak bir sayının iddia sayılması için EŞİK.
 *
 * `0.55` (bir güven skoru), `1.5` (bir oran) iddia değil; `1.247` iddiadır. Birimi ya
 * da yüzdesi olan her sayı zaten ayrı desende yakalanıyor — bu eşik yalnız *çıplak*
 * sayılar için.
 */
const CIPLAK_ESIK = 100

/**
 * RAKAMSIZ Türkçe sayısal iddia. Türkçe'nin İngilizce'den ayrıldığı yer burası:
 * "yüzde kırk", "üç kat", "yarım milyon" — hiçbirinde rakam yok.
 */
const YAZIYLA =
  /\b(yuzde|yarim|ceyrek)\s+\w+|\b(bir|iki|uc|dort|bes|alti|yedi|sekiz|dokuz|on|yirmi|otuz|kirk|elli|yuz|bin|milyon|milyar)\s+(kat|kez|misli|adet|ton|puan)\b/g

/** Türkçe casing tuzağı: `İ`/`I` ayrımı bozulmuş metin. */
const NAIF_CASING = /\b(ISTANBUL|IZMIR|ISTAMBUL|IGNE|ILAN|ISLEM|IMALAT|IHRACAT)\b/

const HEX = /#[0-9a-fA-F]{6}\b/g
/** Aynı desen, `hexsiz` için ayrı örnek: `lastIndex` paylaşımı sessiz atlamalara yol açar. */
const HEX_TARAMA = /#[0-9a-fA-F]{6}\b/g

/**
 * Bloğun denetlenecek METNİ.
 *
 * ⚠ **Grafik bloğu 6.2'de eklendi ve bu fonksiyon güncellenmemişti** — yani
 * "Fire oranını %40 düşürdük" başlıklı bir grafik, kaynaksız iddia denetiminden
 * TAMAMEN kaçıyordu. Yeni bir blok tipi eklemek, onu okuyan her yeri güncellemeyi
 * gerektirir; derleyici `switch` olmadığı için bunu söylemedi.
 *
 * Grafikte üç metin var ve üçü de iddia taşıyabilir: başlık, birim ve nokta etiketleri.
 * Sayıların KENDİSİ (`points[].value`) denetlenmiyor — bir eksen değeri iddia değil,
 * veriyi gösteren şeydir; iddia onu ÇEVRELEYEN metindedir.
 */
const metin = (b: Block): string => {
  switch (b.type) {
    case 'heading':
    case 'body':
      return b.text
    case 'chart':
      return [b.title, b.unit ?? '', ...b.points.map((p) => p.label)].join(' ')
    case 'image':
    case 'spacer':
      return ''
  }
}

/**
 * Belgeyi denetler.
 *
 * **Boş kural seti sessizce geçmez.** `allowedHex: null` (palet tanımsız) hex denetimini
 * atlar; `[]` (palet tanımlı, hex içermiyor) her hex'i ihlal sayar. İkisini karıştırmak,
 * denetimi tam da en çok gerektiği yerde kapatırdı. `forbidden` ve iddia denetiminin
 * "henüz hazır değil" hâli hiç yok — her zaman koşarlar.
 */
export const lintDocument = (
  doc: DocumentModel,
  rules: LexiconRules
): readonly LexiconViolation[] => {
  const ihlaller: LexiconViolation[] = []
  const yasakli = rules.forbidden.map((t) => ({ ham: t, katlanmis: foldForSearch(t) }))
  const izinliHex = rules.allowedHex === null ? null : new Set(rules.allowedHex.map(asciiLower))

  for (const [i, b] of doc.blocks.entries()) {
    const nerede = `blok ${i + 1} (${b.type})`

    // ── alt-text ────────────────────────────────────────────────────────────
    if (b.type === 'image' && !b.decorative && b.alt.trim() === '') {
      // Dekoratif görselin boş `alt`ı meşru; içerik taşıyan görselinki değil. Ayrım
      // `decorative` bayrağında ve o bayrak bir İDDİADIR, bir kolaylık değil (R-34).
      ihlaller.push({ kind: 'missing_alt', src: b.src })
    }

    const t = metin(b)
    if (t === '') continue
    const katlanmis = foldForSearch(t)

    // ── yasak terim ─────────────────────────────────────────────────────────
    for (const y of yasakli) {
      if (y.katlanmis !== '' && katlanmis.includes(y.katlanmis)) {
        ihlaller.push({ kind: 'forbidden_term', term: y.ham, where: nerede })
      }
    }

    // ── kaynaksız sayısal iddia (R-32) ──────────────────────────────────────
    if (rules.claimSource === null) {
      const temizMetin = ayikla(t)
      const rakamli = [...temizMetin.matchAll(RAKAMLI)]
        .map((m) => m[0].trim())
        .filter((x) => !YIL.test(x) || Number(x) < 1900 || Number(x) > 2100)
        .filter((x) => {
          // Birimli/yüzdeli sayı her zaman iddiadır. Çıplak sayı ancak eşiği aşarsa.
          if (/[%a-zçğıöşü]/i.test(x)) return true
          const n = Number(x.replace(/\./g, '').replace(',', '.'))
          return !Number.isFinite(n) || n >= CIPLAK_ESIK
        })
      const yaziyla = [...katlanmis.matchAll(YAZIYLA)].map((m) => m[0].trim())
      for (const iddia of [...rakamli, ...yaziyla]) {
        ihlaller.push({ kind: 'unsourced_claim', claim: iddia, where: nerede })
      }
    }

    // ── miras yer tutucular — kaynak VARSA BİLE yasak ────────────────────────
    // Bunlar gerçek değil; bir `claim_source` göstermek onları gerçek yapmaz.
    // Alıntı içindekiler hariç: `"1.247 İlan"` diye ALINTILAYAN bir metin onları
    // reddediyor, öne sürmüyor.
    const alintisiz = t.replace(TIRNAK, ' ')
    for (const yt of MIRAS_YER_TUTUCULAR) {
      if (alintisiz.includes(yt)) {
        ihlaller.push({ kind: 'unsourced_claim', claim: `${yt} (miras yer tutucu)`, where: nerede })
      }
    }

    // ── token dışı hex ──────────────────────────────────────────────────────
    if (izinliHex !== null) {
      for (const h of t.match(HEX) ?? []) {
        if (!izinliHex.has(asciiLower(h))) {
          ihlaller.push({ kind: 'off_token_hex', hex: h, where: nerede })
        }
      }
    }

    // ── locale-naif casing ──────────────────────────────────────────────────
    const naif = NAIF_CASING.exec(t)
    if (naif !== null) {
      // `'istanbul'.toUpperCase()` → `ISTANBUL`; doğrusu `İSTANBUL`. Bu, kodda R-21 ile
      // yasaklı ama METİN dışarıdan da gelebilir (LLM çıktısı, elle yazılmış kayıt).
      ihlaller.push({ kind: 'naive_casing', text: naif[0], where: nerede })
    }
  }

  return ihlaller
}

/** Token CSS'inden izinli hex listesi çıkarır — marka token'ları tek doğrudur. */
export const hexFromTokens = (tokenCss: string): readonly string[] => [
  ...new Set((tokenCss.match(HEX) ?? []).map(asciiLower)),
]

/** Aynı CSS'ten OKLCH renklerini çıkarır. Marka rampaları OKLCH biçiminde (§12.1). */
const OKLCH_TARAMA = /oklch\([^)]*\)/gi

/**
 * Paletin TAMAMI: hex + OKLCH.
 *
 * `hexFromTokens` tek başına bu projede hep boş dönüyordu — token'lar OKLCH ve QA
 * markanın kendi paletini göremiyordu. Kapı "ölçülemedi" deyip yeşil kalıyordu:
 * doğru davranış (D-111), yanlış sebep.
 */
export const colorsFromTokens = (tokenCss: string): readonly string[] => [
  ...new Set([
    ...(tokenCss.match(HEX) ?? []).map(asciiLower),
    ...(tokenCss.match(OKLCH_TARAMA) ?? []),
  ]),
]

export const formatLexicon = (v: readonly LexiconViolation[]): string => {
  if (v.length === 0) return '  ✓ lexicon temiz'
  const satir = (x: LexiconViolation): string => {
    switch (x.kind) {
      case 'forbidden_term':
        return `yasak terim "${x.term}" — ${x.where}`
      case 'unsourced_claim':
        return `kaynaksız sayısal iddia "${x.claim}" — ${x.where} · claim_source zorunlu (R-32)`
      case 'off_token_hex':
        return `token dışı renk ${x.hex} — ${x.where} · marka token'ı kullan`
      case 'missing_alt':
        return `alt-text yok: ${x.src} · dekoratifse \`decorative: true\` işaretle (R-34)`
      case 'naive_casing':
        return `locale-naif casing "${x.text}" — ${x.where} · 'i'.toUpperCase() → 'I', doğrusu 'İ' (R-21)`
    }
  }
  return v.map((x) => `  ✗ ${satir(x)}`).join('\n')
}
