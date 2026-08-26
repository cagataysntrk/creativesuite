// HEDEF: packages/contracts/src/platform.ts
//
// Yayın platformları ve GERÇEK sınırları (FAZ-19.12 · madde 3).
//
// ⚠ ⚠ **SINIRLAR ARAŞTIRILDI, UYDURULMADI.** Bu depoda ölçülmeden yazılan her sayı bir
// kez yalanlandı. Aşağıdaki değerler 2026 Ağustos'unda platform belgelerinden ve
// karşılaştırma kaynaklarından toplandı; her birinin yanında NEREDEN geldiği yazıyor.
//
// ⚠ ⚠ **ASIL TASARIM SAYISI SERT SINIR DEĞİL, `katlanmaOncesi`.** 2.200 karakterlik bir
// Instagram açıklaması yazılabilir ama akışta yalnız ilk ~125 karakteri görünür; gerisi
// *"devamı"* arkasında kalır. Kanca oraya sığmıyorsa metin teknik olarak geçerli ama
// işlevsel olarak kesiktir. Sert sınır bir HATA eşiği, `katlanmaOncesi` bir TASARIM
// eşiği — ikisini karıştırmak, geçen ama okunmayan bir metin üretmek demek.
//
// ⚠ ⚠ **BURADA HİÇBİR AĞ ÇAĞRISI YOK ve olmayacak.** Bu dosya bir SÖZLEŞME: hangi
// platform neyi kabul ediyor. Gönderim `PUBLISH` fiilinin işi ve depo sahibinin duran
// talimatı gereği bugün hiçbir gönderim yapılmıyor — hat yayına HAZIR hale getiriliyor,
// düğmeye basılmıyor.

export type PlatformId = 'instagram' | 'facebook' | 'linkedin' | 'x'

export interface PlatformSiniri {
  readonly id: PlatformId
  readonly ad: string
  /** Metnin sert üst sınırı — aşılırsa platform REDDEDER. */
  readonly metinTavani: number
  /**
   * Akışta *"devamı"* linkinden ÖNCE görünen yaklaşık karakter.
   *
   * ⚠ Yaklaşık ve öyle olduğu söyleniyor: gerçek kesim yazı tipine, satır sarmasına ve
   * cihaz genişliğine bağlı. Kesin bir sayı yazmak, olmayan bir kesinlik iddia etmek
   * olurdu. Tasarım kararı için "yaklaşık 125" yeterli; kapı bunu TAVAN değil UYARI
   * olarak kullanıyor.
   */
  readonly katlanmaOncesi: number
  /** Tek gönderide en fazla kaç görsel. `null` = bu platformda karosel yok. */
  readonly karoselTavani: number | null
  /** Sınırın kaynağı — iddia değil, izlenebilirlik. */
  readonly kaynak: string
}

/**
 * Platform sınırları — 2026 Ağustos.
 *
 * ⚠ X'in 25.000'i **Premium aboneliğe bağlı**; ücretsiz katman 280. Tavan olarak 280
 * alınıyor çünkü aboneliği olmayan bir hesapta 281 karakter REDDEDİLİR ve bunu yayın
 * anında öğrenmek, dört görsel ve bir insan onayı harcandıktan sonra öğrenmek demek.
 * Premium'a geçilirse tavan burada tek satırda değişir.
 */
export const PLATFORMLAR: readonly PlatformSiniri[] = [
  {
    id: 'instagram',
    ad: 'Instagram',
    metinTavani: 2200,
    katlanmaOncesi: 125,
    karoselTavani: 20,
    kaynak: 'Instagram açıklama sınırı 2.200; akışta ilk ~125 karakter görünür (2026-08)',
  },
  {
    id: 'facebook',
    ad: 'Facebook',
    metinTavani: 63_206,
    // ⚠ Facebook'ta teknik sınır çok yüksek ama etkileşim birkaç yüz karakterden sonra
    // sert düşüyor. Tasarım eşiği bu yüzden teknik sınırdan BAĞIMSIZ konuyor.
    katlanmaOncesi: 80,
    karoselTavani: 10,
    kaynak:
      'Facebook gönderi sınırı 63.206; etkileşim birkaç yüz karakterden sonra düşüyor (2026-08)',
  },
  {
    id: 'linkedin',
    ad: 'LinkedIn',
    metinTavani: 3000,
    katlanmaOncesi: 210,
    karoselTavani: 20,
    kaynak: 'LinkedIn gönderi sınırı 3.000; masaüstünde ilk ~210 karakter görünür (2026-08)',
  },
  {
    id: 'x',
    ad: 'X',
    metinTavani: 280,
    // Sert sınırın kendisi zaten katlanma noktasının altında: X'te kesim yok.
    katlanmaOncesi: 280,
    karoselTavani: 4,
    kaynak: 'X ücretsiz katman 280 (Premium 25.000); görsel tavanı 4 (2026-08)',
  },
]

export const platformBul = (id: string): PlatformSiniri | null =>
  PLATFORMLAR.find((p) => p.id === id) ?? null

export type PlatformKusuru =
  | { readonly tur: 'metin-tavani-asildi'; readonly uzunluk: number; readonly tavan: number }
  | { readonly tur: 'metin-bos' }
  | { readonly tur: 'karosel-tavani-asildi'; readonly slayt: number; readonly tavan: number }
  /** Kanca katlanmadan önce bitmiyor — HATA değil, tasarım uyarısı. */
  | { readonly tur: 'kanca-katlanmanin-otesinde'; readonly katlanmaOncesi: number }

/**
 * Bir gönderinin platform için geçerli olup olmadığı.
 *
 * ⚠ ⚠ **UYARI İLE HATA AYRI DÖNÜYOR.** `kanca-katlanmanin-otesinde` bir ret sebebi
 * DEĞİL: metin geçerli, yalnız ilk cümlesi akışta görünmüyor. İkisini aynı kovaya
 * koymak ya gereksiz ret ya da görmezden gelinen bir tasarım kusuru üretirdi.
 * ⚠ Kanca ölçüsü ilk cümle: nokta, soru ya da ünlemle biten ilk parça. Metnin tamamını
 * ölçmek her uzun gönderiyi uyarırdı ve uyarı gürültüye dönerdi.
 */
export const platformDenetle = (
  metin: string,
  slaytSayisi: number,
  p: PlatformSiniri
): readonly PlatformKusuru[] => {
  const out: PlatformKusuru[] = []
  const t = metin.trim()
  if (t === '') return [{ tur: 'metin-bos' }]
  // ⚠ `[...t]` — kod noktası sayılıyor, `length` DEĞİL. Türkçe harfler ve emoji
  // UTF-16'da iki birim tutabiliyor; `length` ile ölçmek metni olduğundan uzun sayar.
  const uzunluk = [...t].length
  if (uzunluk > p.metinTavani)
    out.push({ tur: 'metin-tavani-asildi', uzunluk, tavan: p.metinTavani })
  if (p.karoselTavani !== null && slaytSayisi > p.karoselTavani)
    out.push({ tur: 'karosel-tavani-asildi', slayt: slaytSayisi, tavan: p.karoselTavani })
  const ilkCumle = /^[\s\S]*?[.!?…](\s|$)/.exec(t)?.[0] ?? t
  if ([...ilkCumle].length > p.katlanmaOncesi)
    out.push({ tur: 'kanca-katlanmanin-otesinde', katlanmaOncesi: p.katlanmaOncesi })
  return out
}

/** Kusur ret sebebi mi, yoksa yalnız uyarı mı. */
export const kusurEngelliyorMu = (k: PlatformKusuru): boolean =>
  k.tur !== 'kanca-katlanmanin-otesinde'
