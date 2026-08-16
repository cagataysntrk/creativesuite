// Beş alanlık kişiselleştirme tavanı (§10 · §11.4 · R-36 · FAZ-6.7).
//
// **Fazlası iltifat değil ŞÜPHE uyandırır.** Türk B2B'sinde altı ayrı kişisel detay
// taşıyan bir deck, "bu adamlar bizi araştırmış" değil "bunları nereden biliyorsun"
// tepkisi alır — ve görüşme, satış konuşmasından veri kaynağı savunmasına döner.
// Tavan yapısaldır: bir öneri değil, bir sınır.
//
// **Tavan sayısı BURADA YAZMIYOR** (D-214). `KURALLAR.md`'deki R-36 satırından okunur;
// `kisisellestirme` kapısı iki değeri karşılaştırır ve ayrışırlarsa kırmızıya döner.
// Sayıyı koda ikinci kez yazmak, kural kitabını kuralı bilmeyen bir belgeye çevirirdi.

/** Kaynağın kanıt gücü — `INGEST` şelalesiyle (FAZ-6.5) aynı sözlük. */
export type Guven = 'direct' | 'corroborating' | 'pointer'

export interface KisiselAlan {
  readonly id: string
  /** Deck'te görünen etiket. Hangi beşinin kaldığını insan bundan okur. */
  readonly label: string
  /** Kaynağın nereden geldiği. Kaynaksız alan zaten R-32'de düşer. */
  readonly sourceRef: string
  readonly confidence: Guven
}

/**
 * Tavan. **Tek kaynağı `KURALLAR.md` R-36'dır** ve `kisisellestirme` kapısı bu sabitin
 * oradaki sayıyla eşleştiğini doğrular. Buradaki değer bir kopya, bir karar değil.
 */
export const KISISELLESTIRME_TAVANI = 5

const AGIRLIK: Record<Guven, number> = { direct: 0, corroborating: 1, pointer: 2 }

export interface TavanSonucu {
  /** Deck'e giren alanlar — en fazla tavan kadar. */
  readonly kabul: readonly KisiselAlan[]
  /** Elenenler. **Sessizce düşmezler**: hangi beşinin kaldığı da, neyin düştüğü de yazılır. */
  readonly elenen: readonly KisiselAlan[]
  readonly tavanAsildi: boolean
  /** Türkçe gerekçe. Boş dize = tavan aşılmadı. */
  readonly mesaj: string
}

/**
 * Alanları tavana indirir.
 *
 * **Sıralama deterministik ve GEREKÇELİ:** önce kanıt gücü (`direct` → `corroborating`
 * → `pointer`), eşitlikte giriş sırası. Rastgele ya da "ilk beş" seçmek, en zayıf
 * kanıtın deck'e girip en güçlüsünün elenmesine izin verirdi — ve tam da elenen o alan
 * görüşmede savunulması gereken alan olurdu.
 *
 * `Array.prototype.sort` **kararlıdır** (ES2019+), o yüzden eşitlikte giriş sırası
 * korunur ve ayrıca bir sıra numarası taşımaya gerek yok.
 */
export const tavanaIndir = (
  alanlar: readonly KisiselAlan[],
  tavan: number = KISISELLESTIRME_TAVANI
): TavanSonucu => {
  const sirali = [...alanlar].sort((a, b) => AGIRLIK[a.confidence] - AGIRLIK[b.confidence])
  const kabul = sirali.slice(0, tavan)
  const elenen = sirali.slice(tavan)
  return {
    kabul,
    elenen,
    tavanAsildi: elenen.length > 0,
    mesaj:
      elenen.length === 0
        ? ''
        : `${alanlar.length} kişiselleştirme alanı var, tavan ${tavan} (R-36). ` +
          `Kalan: ${kabul.map((a) => a.label).join(' · ')}. ` +
          `Elenen: ${elenen.map((a) => a.label).join(' · ')}. ` +
          `Fazlası iltifat değil şüphe uyandırır; hangisinin kalacağını siz seçmek ` +
          `istiyorsanız listeyi kısaltın.`,
  }
}

/**
 * Tavan aşıldıysa REDDEDER — kırpmaz.
 *
 * `tavanaIndir` bir öneridir (UI önizlemede kullanır); bu ise bir kapıdır. Ayrım
 * bilinçli: sessizce kırpmak, insanın yazdığı bir alanın deck'ten çıktığını ona
 * söylemeden çıkarmaktır ve bu, tavanın kendisinden daha kötü bir davranış.
 */
export type TavanIhlali = {
  readonly kind: 'personalization_cap'
  readonly count: number
  readonly cap: number
  readonly mesaj: string
}

export const tavanKapisi = (
  alanlar: readonly KisiselAlan[],
  tavan: number = KISISELLESTIRME_TAVANI
): true | TavanIhlali => {
  if (alanlar.length <= tavan) return true
  const s = tavanaIndir(alanlar, tavan)
  return { kind: 'personalization_cap', count: alanlar.length, cap: tavan, mesaj: s.mesaj }
}
