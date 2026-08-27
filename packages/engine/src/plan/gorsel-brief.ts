// Görsel brief istemi — şablonun KENDİ ilanından (§7.1 · D-268 · FAZ-19.13).
//
// ⚠ ⚠ **BU İSTEM HATTIN İÇİNDE GÖMÜLÜYDÜ ve editörün de aynısına ihtiyacı oldu.**
// Depo sahibi: *"bazen bazı görseller kötü üretiliyor… editörde ben o üretilen görseli
// siliyorum o alanlar boş kalıyor. bir tuş ile boş yuvalara uygun görsel üret diye
// basınca otomatik üretmeli mükemmelce şablona ve konuya uygun olarak."* İstemi editöre
// KOPYALAMAK, bu deponun en sık tekrar eden hatasını bir kez daha yapmaktı: aynı kural
// iki yerde, biri düzeltilir öteki unutulur. Kurucu buraya taşındı; hat da editör de
// bu dosyayı çağırıyor.
//
// ⚠ ⚠ **BRIEF İNGİLİZCE VE BÜYÜK HARFSİZ.** R-20 muhafızı büyük harfli öbeği "metin
// çizdirme isteği" sayıyor ve iki kez reddetti (katalog.ts kaydı).
//
// ⚠ ⚠ **OLUMSUZLAMA YASAK — ve bunu GERÇEK BİR KOŞU öğretti.** İlk sürüm brief'e *"do
// not ask for any lettering…"* koyuyordu; model bunu brief'in içine kopyaladı ve R-20
// muhafızı `lettering` alt dizesini yakalayıp görsel adımını REDDETTİ. Muhafız
// olumsuzlamayı anlamıyor: `no texture` içindeki `no text` için de aynı yanlış pozitif
// kayıtlı. Kırmızı bir kapının kuralı aynı turda gevşetilmez (R-76) — brief YENİDEN
// YAZILDI ve yalnız KADRAJDA NE OLDUĞUNU söylüyor. İstenmeyen şeyi adıyla anmayan bir
// istem, o adı çıktıya sızdıramaz.

import { sablonBul } from '@suite/contracts'

export interface GorselBriefGirdisi {
  /** Katalog şablonunun kimliği — `sablon-uyarla` adımının seçtiği. */
  readonly sablonId: string
  /** Kaçıncı görsel yuvası (1 tabanlı). */
  readonly sira: number
  readonly konu: string
  /**
   * Uyarlama adımının seçtiği görsel dili — koşu başına BİR KEZ.
   *
   * ⚠ Şablon her varyantta *"monochrome ink hatching"* diyordu ve konu ne olursa olsun
   * çıktı siyah-beyaz mürekkepti. Dil artık bir kez seçiliyor ve dört slayt onu
   * paylaşıyor: seri bütünlüğü korunuyor, ama üslup konuya ait.
   */
  readonly gorselDili: string
}

/**
 * Brief isteminin metni. **Boş dize = bu yuvaya brief YOK** ve adım atlanmalı.
 *
 * İki sebeple boş döner ve ikisi de kasıtlı:
 *   1. Şablon görsel İSTEMİYOR (`veri-hikayesi`, `akan-alan`) — kullanılmayacak bir
 *      görsel için kota harcamak (D-261'in birebir tekrarı).
 *   2. Sıra, şablonun varyant sayısını AŞIYOR — üretilen görsel hiçbir yuvaya girmez;
 *      bu deponun "modül var, çıktı var, tüketen yok" sınıfının ta kendisi.
 */
export const gorselBriefIstemi = (g: GorselBriefGirdisi): string => {
  const kayit = sablonBul(g.sablonId)
  if (kayit?.gorsel === undefined || kayit.gorsel === null) return ''
  const varyantlar = kayit.gorsel.varyantlar ?? []
  if (g.sira > 1 && g.sira > varyantlar.length) return ''
  const varyant = varyantlar[g.sira - 1]
  return [
    'write one short image generation brief in english, lowercase only.',
    'YOU choose what to depict — the topic decides, not a template:',
    '  · if the topic is about people and their work, a single figure is right.',
    '  · if it is about a machine, a material or a measurement, show THAT thing.',
    '  · if it is abstract, show a physical object that stands for it.',
    'choose the one subject a reader would recognise instantly for this topic.',
    `keep this technical base: ${kayit.gorsel.briefTemeli}`,
    ...(g.gorselDili === '' ? [] : [`visual language for this whole set: ${g.gorselDili}`]),
    // ⚠ Varyant KADRAJI söylüyor, ÖZNEYİ değil: aynı konudan N özdeş görsel çıkmasın.
    ...(varyant === undefined ? [] : [`frame it like this: ${varyant}`]),
    `topic: ${g.konu}`,
    'describe only the subject, the lighting and the background surface.',
    'answer with the brief sentence alone.',
  ].join('\n')
}

/**
 * Görsel isteminin SONUNA basılan kadraj eki.
 *
 * ⚠ ⚠ **VARYANT GÖRSEL İSTEMİNE DOĞRUDAN EKLENİYOR — brief'e GÜVENMİYORUZ.** Gerçek
 * koşu: dört yuvaya dört ayrı brief adımı koştu, her birinin isteminde farklı bir
 * kadraj satırı vardı ve çıkan dört fotoğraf BİREBİR AYNIYDI. Sebep yapısal: kadraj
 * tarifi metin modelinden GEÇEREK gidiyordu ve model onu düzledi. Bir modele "şunu
 * koru" demek bir RİCA; garantiyi yapıya gömmek gerekiyor.
 */
export const varyantEki = (sablonId: string, sira: number): string => {
  const vs = sablonBul(sablonId)?.gorsel?.varyantlar ?? []
  return vs[sira - 1] ?? ''
}
