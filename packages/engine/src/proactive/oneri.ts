// Proaktif katman — haftalık öneri (§10 · D-10 · R-14 · FAZ-8.5).
//
// **Öneri, üretim değildir.** Hiçbir öneri metered bir fiil ateşlemez; öneri bir
// PLANDIR ve planı çalıştıran şey insanın komutu. Bu ayrım tipe gömülü: `Oneri`
// çalıştırılabilir bir şey taşımıyor — ne bir fonksiyon, ne bir handle, yalnız hangi
// hattın hangi parametreyle koşabileceğini söyleyen veri. "Öneriyi çalıştır" diye bir
// çağrı yazılamıyor, çünkü çalıştırılacak bir şey yok.
//
// **Erken proaktiflik gürültüdür ve gürültü kapatılır** (D-10 kademeli olmasının
// sebebi). İki mekanik fren:
//
//   1. **Gözlemsiz öneri YOK.** Her öneri bir `kanit` taşımak zorunda — hangi ölçüm,
//      hangi tarih, hangi sayı. "Şu konuda içerik üretebilirsin" tipi genel fikirler
//      bu tipte ifade EDİLEMEZ; kanıt alanı zorunlu ve serbest metin değil.
//   2. **Haftalık tavan.** Üçten fazla öneri, öneri değil listedir; liste okunmaz.
//      Tavan aşılırsa en zayıf kanıtlılar DÜŞER ve düşenlerin sayısı raporlanır —
//      sessizce kırpmak, kapsamı olduğundan geniş göstermek olurdu.
//
// **Doctor ile sınır nettir:** doctor SAĞLIK söyler (token öldü, ölçüm eksik, fiyat
// bayat), bu katman İÇERİK önerir. İkisi karışsaydı, sağlık uyarıları içerik
// gürültüsünün içinde kaybolurdu.

/** Bir öneriyi hak ettiren gözlem. **Kanıtsız öneri kurulamaz.** */
export type OneriKanidi =
  /** Son yayından bu yana geçen gün — boş takvim. */
  | { readonly kind: 'bos_takvim'; readonly gecenGun: number; readonly sonYayin: string }
  /**
   * Ölçülmüş bir kazanan var ama tekrar kullanılmamış.
   *
   * Bu, sistemin öğrendiğini gösteren tek öneri türü: 7.9'un sıralaması olmadan
   * kurulamaz ve sıralama da ölçülmemiş pencereyi dışarıda bırakıyor.
   */
  | {
      readonly kind: 'kullanilmayan_kazanan'
      readonly externalId: string
      readonly deger: number
      readonly metrik: string
    }
  /** Hiç yayın yok — ilk yayın önerisi. Boş takvimden FARKLI: "hiç" ≠ "uzun süredir". */
  | { readonly kind: 'hic_yayin_yok' }

export interface Oneri {
  /** Hangi hat koşabilir. **Çalıştırılabilir değil** — yalnız ad (R-14). */
  readonly pipeline: string
  /** İnsan okunur gerekçe; kanıttan TÜRETİLİR, ayrıca yazılmaz. */
  readonly neden: string
  readonly kanit: OneriKanidi
  /** Kanıt gücü — tavan aşılırsa düşecekleri belirler. Büyük = güçlü. */
  readonly agirlik: number
}

/**
 * Haftalık öneri tavanı.
 *
 * Üçten fazlası liste olur ve liste okunmaz. Bu sayı bir tercih değil, D-10'un
 * "kademeli" ilkesinin mekanik hâli: kapatılan bir özellik, hiç olmayan özellikten
 * kötüdür — çünkü bir kez kapatıldığında bir daha açılmaz.
 */
export const ONERI_TAVANI = 3

/** Boş takvim eşiği. Bir haftadan kısa sessizlik, sessizlik değildir. */
export const BOS_TAKVIM_GUN = 7

export interface OneriGirdisi {
  /** Yayın defterindeki kayıtlar. **`null` = defter okunamadı** — boş DEĞİL. */
  readonly yayinlar: readonly { readonly publishedAt: string }[] | null
  /** Sıralanabilir performans satırları (7.9). Ölçülmemiş pencere buraya girmez. */
  readonly kazananlar: readonly {
    readonly externalId: string
    readonly deger: number
    readonly metrik: string
    readonly tekrarKullanildi: boolean
  }[]
  /** ISO 8601 — çağıran verir (R-06). */
  readonly bugun: string
  /** Öneri üretilecek hat. Hangi hattın koşacağı registry'nin işi, bu modülün değil. */
  readonly hat: string
}

export interface OneriSonucu {
  readonly oneriler: readonly Oneri[]
  /** Tavan yüzünden düşen öneri sayısı. **Sessizce kırpılmaz** — kapsam beyanı. */
  readonly dusenSayisi: number
  /** Ölçülemeyen girdi. `null` değilse öneriler EKSİK kapsamlı. */
  readonly olculemeyen: string | null
}

const gunFarki = (a: string, b: string): number =>
  Math.floor((Date.parse(a) - Date.parse(b)) / 86_400_000)

export const oneriMesaji = (k: OneriKanidi): string => {
  switch (k.kind) {
    case 'bos_takvim':
      return `${k.gecenGun} gündür yayın yok (son: ${k.sonYayin}) — takvim boş`
    case 'kullanilmayan_kazanan':
      return `${k.externalId} ölçülmüş kazanan (${k.metrik}: ${k.deger}) ama tekrar kullanılmamış`
    case 'hic_yayin_yok':
      return 'hiç yayın yapılmamış — ilk yayın ölçümü de başlatır (insight geriye dönük alınamaz)'
  }
}

/**
 * Haftalık önerileri üretir. **Hiçbir maliyet oluşturmaz**: ağ yok, model yok, yazma
 * yok. Girdiler zaten ölçülmüş verilerdir.
 */
export const haftalikOneriler = (g: OneriGirdisi): OneriSonucu => {
  // Defter okunamadıysa öneri üretmek, bilinmeyen bir dünyaya tavsiye vermektir.
  if (g.yayinlar === null) {
    return {
      oneriler: [],
      dusenSayisi: 0,
      olculemeyen: 'yayın defteri okunamadı — öneri üretmek bilinmeyene tavsiye vermektir',
    }
  }

  const ham: Oneri[] = []

  if (g.yayinlar.length === 0) {
    ham.push({
      pipeline: g.hat,
      neden: oneriMesaji({ kind: 'hic_yayin_yok' }),
      kanit: { kind: 'hic_yayin_yok' },
      // En güçlü kanıt: ölçüm penceresi geriye dönük açılamıyor (D-220).
      agirlik: 100,
    })
  } else {
    const son = [...g.yayinlar]
      .map((y) => y.publishedAt)
      .sort()
      .at(-1)!
    const gecen = gunFarki(g.bugun, son)
    if (gecen >= BOS_TAKVIM_GUN) {
      const kanit = { kind: 'bos_takvim' as const, gecenGun: gecen, sonYayin: son.slice(0, 10) }
      ham.push({ pipeline: g.hat, neden: oneriMesaji(kanit), kanit, agirlik: gecen })
    }
  }

  for (const k of g.kazananlar) {
    if (k.tekrarKullanildi) continue
    const kanit = {
      kind: 'kullanilmayan_kazanan' as const,
      externalId: k.externalId,
      deger: k.deger,
      metrik: k.metrik,
    }
    // Ağırlık ÖLÇÜLEN değerden gelir: en çok işe yarayanı önce öner.
    ham.push({ pipeline: g.hat, neden: oneriMesaji(kanit), kanit, agirlik: k.deger })
  }

  const sirali = [...ham].sort((a, b) => b.agirlik - a.agirlik)
  return {
    oneriler: sirali.slice(0, ONERI_TAVANI),
    dusenSayisi: Math.max(0, sirali.length - ONERI_TAVANI),
    olculemeyen: null,
  }
}
