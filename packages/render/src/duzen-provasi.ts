// DÜZEN PROVASI — görsel parası harcanmadan ÖNCE, gerçek geometriyle (D-347).
//
// ⚠ ⚠ **BU MODÜLÜN VARLIK SEBEBİ ÖLÇÜLDÜ.** Şablonlar "kasten kısa" örnek metinlerle
// ayarlanmıştı ve kelime bütçesinin (R-89) TAVANINDA kimse render etmemişti. Tavanda,
// gerçekçi uzun Türkçe kelimelerle her şablon zorlandı: **on şablonun sekizi kırıldı**,
// 36 kusur. En ağırı `donen`de `punto-esik-alti` — gövde, R-83'ün okunabilirlik
// tabanının ALTINA düşüyor. Yani kuralın İZİN VERDİĞİ bir metin, şablonu okunmaz
// yapabiliyor. Kapasite tablosu `docs/kurallar/OLCUMLER.md`'de.
//
// ⚠ ⚠ **ŞABLON BAŞINA KELİME BÜTÇESİ REDDEDİLDİ.** Sayılar ölçüldü (12 → 27, 2,25 kat)
// ve kataloğa yazılabilirdi. Yazılmadı: **kelime geometrinin vekilidir ve kötü bir
// vekildir.** *"Bir hat tekrarla öğrenir"* (4 kelime, 23 karakter) ile *"Sürdürülebilirlik
// raporlamasında ölçülebilir dönüşüm"* (4 kelime, 52 karakter) aynı sayıyı verir.
// Kanıt `donen`: başlık 3 kelimeye, gövde 0'a inse bile kusurluydu — kapasitesi kelimeyle
// İFADE EDİLEMEDİ. Ölçemediğin bir büyüklüğe kural bağlanmaz.
//
// ⚠ Prova, denetimin kendisini kullanıyor: yeni bir ölçüt icat etmiyor. Tek yaptığı onu
// DOĞRU ANDA çağırmak — görseller doğmadan, yer tutucularla. API maliyeti sıfır.
//
// ⚠ **R-89 EMEKLİ DEĞİL.** Ucuz ön eleme ve modele verilen talimat olarak kalıyor; emekli
// edilen şey onun TEK kapı olması.

import type { BrowserResult, Oturum } from './browser.js'
import { panoramaDenetle, type Kusur } from './panorama-denetim.js'
import type { PanoramaBelgesi } from './panorama.js'

/** Provanın kararı: sığıyor mu, sığmıyorsa NEDEN. */
export interface ProvaSonucu {
  readonly sigiyor: boolean
  readonly kusurlar: readonly Kusur[]
  /** İnsana ve modele gösterilecek tek satırlık özet. */
  readonly ozet: string
}

/**
 * Yer tutucu kusuru provada BEKLENEN durumdur ve elenir.
 *
 * ⚠ Prova tanım gereği görselsiz koşuyor; `yer-tutucu` orada "görsel henüz yok" demek,
 * "tasarım bozuk" demek değil. Elemeyip raporlamak, her provayı kırmızı yapar ve kapı
 * beş gün içinde görmezden gelinir — kapının en tehlikeli hâli budur.
 */
const PROVADA_BEKLENEN: ReadonlySet<string> = new Set(['yer-tutucu'])

/**
 * Uyarlanmış belgeyi YER TUTUCU görsellerle render edip denetler.
 *
 * ⚠ Girdi belgesinin görselleri boş `src` ile geliyor: bu kasıtlı. Gerçek görselle
 * prova etmek görseli üretmek demektir ve provanın bütün anlamı onu ÜRETMEDEN karar
 * vermektir.
 */
export const duzenProvasi = async (
  belge: PanoramaBelgesi,
  oturum?: Oturum
): Promise<BrowserResult<ProvaSonucu>> => {
  const provaBelgesi: PanoramaBelgesi = {
    ...belge,
    ...(belge.gorseller === undefined
      ? {}
      : { gorseller: belge.gorseller.map((g) => ({ ...g, src: '' })) }),
  }
  const denetim = await panoramaDenetle(provaBelgesi, oturum)
  if (!denetim.ok) return denetim
  const kusurlar = denetim.value.filter((k) => !PROVADA_BEKLENEN.has(k.tur))
  const sigiyor = kusurlar.length === 0
  return {
    ok: true,
    value: {
      sigiyor,
      kusurlar,
      ozet: sigiyor
        ? 'düzen provası geçti — metin kadraja sığıyor'
        : `düzen provası ${String(kusurlar.length)} kusur buldu: ` +
          kusurlar
            .map((k) => `kart ${String(k.kart)} · ${k.tur}`)
            .slice(0, 6)
            .join(' · '),
    },
  }
}
