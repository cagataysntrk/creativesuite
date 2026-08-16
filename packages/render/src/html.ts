// HTML kaçışı — YAPRAK modül (§3.6).
//
// Bu fonksiyon önce `static.ts`teydi ve grafik katmanı (6.2) onu oradan aldı; sonuç
// `chart → static → chart` döngüsü oldu ve `rings` kapısı yakaladı. Paylaşılan bir
// yardımcı, kullananlardan BİRİNİN içinde yaşayamaz: ikisinin de altında yaşar.

/** Metin İÇERİKTİR, işaretleme değil — kullanıcı metni etiket açamaz. */
export const kacir = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
