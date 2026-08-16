// `prospect-deck` zinciri — FAZ 6'nın kapanışı (§10 · §11.4 · R-32 · D-4 · FAZ-6.9).
//
// **Bu dosya YENİ KURAL YAZMAZ.** Beş kapının hepsi kendi sahibinde yaşıyor; burada
// olan tek şey SIRA ve İLK HATADA DURMA. Yeni bir kural buraya yazılsaydı altıncı bir
// gerçek olurdu ve diğer beşiyle bir gün ayrışırdı (D-160).
//
// | # | Kapı | Sahibi |
// |---|---|---|
// | 1 | kaynak tazeliği | `kernel/freshness.ts` (R-32 · 6.6) |
// | 2 | kişiselleştirme tavanı | `kernel/personalization.ts` (R-36 · 6.7) |
// | 3 | ürün ekranı gerçek çekim | `render/capture/product.ts` (R-32 · 6.8) |
// | 4 | kaynaksız iddia + lexicon | `render/lexicon/linter.ts` (R-32, R-35 · 3.10) |
// | 5 | yayınlanabilirlik | `kernel/manifest.ts` (§13) |
//
// **Sıra maliyet sırasıdır:** ucuz ve kesin olan önce. Tazelik bir tarih karşılaştırması;
// lexicon bütün belgeyi tarar. Pahalı denetimi önce koşmak, zaten reddedilecek bir deck
// için iş yapmak olurdu.
//
// **İlk hatada durur ve NEDEN durduğunu söyler.** Hepsini koşup liste vermek daha
// "yardımsever" görünür ama yanıltıcıdır: ikinci kapının bulgusu, birinci kapı yüzünden
// zaten geçersiz bir belge hakkındadır.

import { tavanKapisi, tazelikRaporu, type Kaynak, type KisiselAlan } from '@suite/kernel'

export interface ProspectDeckInput {
  readonly kaynaklar: readonly Kaynak[]
  readonly alanlar: readonly KisiselAlan[]
  /** Blob sidecar'larından gelen ürün ekranı meta'ları. */
  readonly urunEkranlari: readonly {
    readonly aiGenerated?: unknown
    readonly basis?: { readonly kind?: unknown }
  }[]
  /** `lintDocument` çıktısı — bu paket `render`ı import EDEMEZ (halka yönü, R-03). */
  readonly lexiconIhlalleri: readonly { readonly kind: string }[]
  /** `inspectManifest` çıktısı. Aynı sebep: kusurlar dışarıdan geliyor. */
  readonly manifestKusurlari: readonly { readonly kind: string }[]
  /** Karşılaştırma tarihi — çalıştırmanın `createdAt`i. Saat OKUNMAZ (R-06). */
  readonly now: string
}

export type DeckKapisi =
  'tazelik' | 'kisisellestirme' | 'urun-ekrani' | 'lexicon' | 'yayinlanabilirlik'

export type ProspectDeckSonucu =
  | { readonly gecti: true; readonly kosulanKapilar: readonly DeckKapisi[] }
  | {
      readonly gecti: false
      /** Hangi kapıda durduğu. */
      readonly kapi: DeckKapisi
      readonly mesaj: string
      /** Bu kapıdan ÖNCE geçilenler — "nereye kadar geldi" sorusunun cevabı. */
      readonly kosulanKapilar: readonly DeckKapisi[]
    }

/**
 * Zinciri koşar.
 *
 * **Ürün ekranı denetimi burada TEKRAR YAZILMIYOR**: `usableAsProductShot` `render`da
 * ve bu paket onu import edemez (R-03, halka yönü). Bunun yerine kural, `render`ın
 * ürettiği meta üzerinden aynı iki koşulla okunuyor — ve `inspectManifest` de aynı
 * kuralı yayın anında bağımsız olarak uyguluyor. Üç yerde üç KOPYA değil; bir kural,
 * halka sınırının iki yakasında iki uygulama.
 */
export const prospectDeckZinciri = (input: ProspectDeckInput): ProspectDeckSonucu => {
  const kosulan: DeckKapisi[] = []

  // 1 ── tazelik
  const tazelik = tazelikRaporu(input.kaynaklar, input.now)
  kosulan.push('tazelik')
  if (!tazelik.hepsiTaze) {
    return { gecti: false, kapi: 'tazelik', mesaj: tazelik.gerekce, kosulanKapilar: kosulan }
  }

  // 2 ── kişiselleştirme tavanı
  const tavan = tavanKapisi(input.alanlar)
  kosulan.push('kisisellestirme')
  if (tavan !== true) {
    return {
      gecti: false,
      kapi: 'kisisellestirme',
      mesaj: tavan.mesaj,
      kosulanKapilar: kosulan,
    }
  }

  // 3 ── ürün ekranları gerçek çekim mi
  kosulan.push('urun-ekrani')
  for (const [i, e] of input.urunEkranlari.entries()) {
    if (e.aiGenerated === true) {
      return {
        gecti: false,
        kapi: 'urun-ekrani',
        mesaj: `${i + 1}. ürün ekranı ÜRETİLMİŞ — uydurma dashboard olgusal bir iddiadır (R-32)`,
        kosulanKapilar: kosulan,
      }
    }
    if (e.basis?.kind !== 'product_capture') {
      return {
        gecti: false,
        kapi: 'urun-ekrani',
        mesaj: `${i + 1}. ürün ekranı gerçek çekime bağlanmıyor (dayanak: ${String(e.basis?.kind ?? 'yok')})`,
        kosulanKapilar: kosulan,
      }
    }
  }

  // 4 ── lexicon: kaynaksız iddia, yasak terim, token dışı hex, eksik alt
  kosulan.push('lexicon')
  if (input.lexiconIhlalleri.length > 0) {
    const turler = [...new Set(input.lexiconIhlalleri.map((v) => v.kind))].join(', ')
    return {
      gecti: false,
      kapi: 'lexicon',
      mesaj: `${input.lexiconIhlalleri.length} lexicon ihlali (${turler}) — kaynaksız sayısal iddia yayınlanamaz (R-32)`,
      kosulanKapilar: kosulan,
    }
  }

  // 5 ── yayınlanabilirlik: manifest kendi içinde tutarlı mı
  kosulan.push('yayinlanabilirlik')
  if (input.manifestKusurlari.length > 0) {
    const turler = [...new Set(input.manifestKusurlari.map((d) => d.kind))].join(', ')
    return {
      gecti: false,
      kapi: 'yayinlanabilirlik',
      mesaj: `manifest kusurlu (${turler}) — çalıştırma defteri kendi içinde çelişiyor`,
      kosulanKapilar: kosulan,
    }
  }

  return { gecti: true, kosulanKapilar: kosulan }
}

/** Zincirin kapı sırası — UI istasyon zincirini bundan çiziyor (§4b). */
export const DECK_KAPI_SIRASI: readonly DeckKapisi[] = [
  'tazelik',
  'kisisellestirme',
  'urun-ekrani',
  'lexicon',
  'yayinlanabilirlik',
]
