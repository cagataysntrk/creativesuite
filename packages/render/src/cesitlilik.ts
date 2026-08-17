// HEDEF: packages/render/src/cesitlilik.ts
//
// Çeşitlilik parmak izi — "binlerce çeşit" iddiasının ölçüsü (FAZ-13.4 · §7.1 · D-254).
//
// **Neden var:** 12.7 açık bir kompozisyon ailesi kurdu ve *"tek çeşidi yok, binlerce
// çeşidi var"* denildi. Ölçülmeyen bir çeşitlilik iddiası **kendi lehimize yorumlanır** —
// tıpkı kabul sayacının yorumlanabilmesi gibi (FAZ-10.7).
//
// ⚠ ⚠ **PİKSEL BENZERLİĞİ DEĞİL, KARAR BENZERLİĞİ.** İki karosel farklı renkte olup aynı
// kararları vermiş olabilir; o çeşitlilik değil, boyamadır. Parmak izi yalnız KARARLARI
// taşıyor: hangi düzenler, hangi aile, hangi efektler, veri ögesi var mı, panorama açık mı.
//
// ⚠ ⚠ **BU METRİK KENDİ KENDİNİ KANDIRMAYA EN AÇIK OLANI ve önlemi tek cümlede:
// ALANLAR ÖNCE SABİTLENDİ, ÖLÇÜM SONRA YAPILDI.** Parmak izine ne kadar çok alan koyarsam
// çeşitlilik o kadar yüksek çıkar. Aşağıdaki liste ölçüm görülmeden yazıldı ve sonuç
// beğenilmediği için alan EKLENMEYECEK. Bu cümle buraya tam bu yüzden kondu.
//
// ⚠ **Çeşitlilik bir KAPI DEĞİL.** Aynı konudan iki kez üretmek BENZER sonuç vermeli —
// determinizm bir kusur değil, sistemin şartı (R-06). Ölçülen şey FARKLI konuların farklı
// karar üretip üretmediği.

import type { DocumentModel } from '@suite/kernel'

/**
 * Parmak izinin alanları — KAPALI ve ölçümden ÖNCE sabitlendi.
 *
 * Yedincisini eklemek bir karar ister ve o kararın gerekçesi "çeşitlilik düşük çıktı"
 * OLAMAZ. Alan eklemek metriği iyileştirmez, yalnız şişirir.
 */
export const PARMAK_IZI_ALANLARI = [
  'duzenler',
  'aile',
  'tipoEfektleri',
  'gorselIslemleri',
  'veriOgesi',
  'panorama',
] as const

export type ParmakIziAlani = (typeof PARMAK_IZI_ALANLARI)[number]

/**
 * Alanı KİM belirliyor — aile mi, içerik mi.
 *
 * ⚠ **Bu ayrım olmadan defter yanlış suçluyor.** İlk sürüm "hiçbir ailede farklılaşmayan
 * alan" listesine `duzenler` ve `veriOgesi`ni de koyuyordu; oysa ikisini de aile SEÇMİYOR
 * — düzen plandan, veri ögesi içerikten geliyor. Sabit içerikle iki aileyi karşılaştırınca
 * o alanlar zorunlu olarak aynı çıkar ve bu ailelerin kusuru değildir.
 * Ölçümün kime ne sorduğunu bilmemek, ölçümün kendisini yanlış yapar.
 */
export const ALAN_KAYNAGI: Readonly<Record<ParmakIziAlani, 'aile' | 'icerik'>> = {
  duzenler: 'icerik',
  aile: 'aile',
  tipoEfektleri: 'aile',
  gorselIslemleri: 'aile',
  veriOgesi: 'icerik',
  panorama: 'aile',
}

/** Bir karoselin karar parmak izi. Değerler sıralı ve normalize — karşılaştırılabilir. */
export type ParmakIzi = Readonly<Record<ParmakIziAlani, string>>

/** Veri ögesi tipleri — hangi görsel kanıt kullanıldı. */
const veriOgesi = (slaytlar: readonly DocumentModel[]): string => {
  const tipler = new Set<string>()
  for (const d of slaytlar)
    for (const b of d.blocks)
      if (b.type === 'compare' || b.type === 'diagram' || b.type === 'chart' || b.type === 'image')
        tipler.add(b.type)
  return tipler.size === 0 ? 'yok' : [...tipler].sort().join('+')
}

/**
 * Karoselin parmak izi.
 *
 * ⚠ Her alan SIRALANIYOR: `['list','quote']` ile `['quote','list']` aynı karar kümesidir
 * ve farklı görünmemeli. Sıralamasaydım slayt sırası çeşitlilik gibi okunurdu — metriği
 * kendi lehine bükmenin en sessiz yolu.
 */
export const parmakIzi = (slaytlar: readonly DocumentModel[]): ParmakIzi => {
  const duzenler = [...new Set(slaytlar.map((d) => d.slayt?.duzen ?? 'yok'))].sort()
  const ilkAile = slaytlar.find((d) => d.aile !== undefined)?.aile
  return {
    duzenler: duzenler.join('+'),
    // ⚠ Aile KİMLİĞİ belgede yok (belge yalnız parametreleri taşıyor); ayırt edici
    // parametrelerden türetiliyor. Kimliği belgeye eklemek FAZ-12.7'nin garanti/estetik
    // ayrımını bulandırırdı — parmak izi için bir alan açmak yeterli sebep değil.
    aile:
      ilkAile === undefined
        ? 'yok'
        : `s${ilkAile.suslemeYogunlugu}v${ilkAile.vinyetGucu}d${ilkAile.degrade ? 1 : 0}`,
    tipoEfektleri: [...(ilkAile?.tipoEfektleri ?? [])].sort().join('+') || 'yok',
    gorselIslemleri: [...(ilkAile?.gorselIslemleri ?? [])].sort().join('+') || 'yok',
    veriOgesi: veriOgesi(slaytlar),
    panorama: ilkAile?.panorama === true ? 'acik' : 'kapali',
  }
}

/**
 * İki parmak izi arasındaki uzaklık, 0–1.
 *
 * ⚠ Hamming: kaç alan farklı / toplam alan. Ağırlıklı bir uzaklık daha "akıllı" görünürdü
 * ama ağırlıklar bir tercih olurdu ve tercih, ölçümü lehine bükmenin kapısıdır.
 */
export const uzaklik = (a: ParmakIzi, b: ParmakIzi): number =>
  PARMAK_IZI_ALANLARI.filter((k) => a[k] !== b[k]).length / PARMAK_IZI_ALANLARI.length

/**
 * Bir parmak izi kümesinin çeşitlilik dağılımı.
 *
 * ⚠ Döndürülen şey tek bir puan DEĞİL: `benzersiz` kaç farklı karar kümesi çıktığını,
 * `ortalamaUzaklik` ne kadar uzak olduklarını söylüyor. Tek puan olsaydı, iki karoselin
 * tamamen aynı olduğu bir küme ile hepsinin biraz farklı olduğu bir küme aynı sayıyı
 * verebilirdi — ortalamanın gizlediği tam olarak budur.
 */
export const dagilim = (
  izler: readonly ParmakIzi[]
): { readonly benzersiz: number; readonly ortalamaUzaklik: number } => {
  const anahtar = (p: ParmakIzi): string => PARMAK_IZI_ALANLARI.map((k) => p[k]).join('|')
  const benzersiz = new Set(izler.map(anahtar)).size
  const ciftler: number[] = []
  for (let i = 0; i < izler.length; i += 1)
    for (let j = i + 1; j < izler.length; j += 1) {
      const a = izler[i]
      const b = izler[j]
      if (a !== undefined && b !== undefined) ciftler.push(uzaklik(a, b))
    }
  const ortalama = ciftler.length === 0 ? 0 : ciftler.reduce((t, v) => t + v, 0) / ciftler.length
  return { benzersiz, ortalamaUzaklik: Math.round(ortalama * 100) / 100 }
}
