// Karoselin SIRASI — panelde tek yer (D-248 · FAZ-19.13).
//
// ⚠ ⚠ **BU KURAL BU DEPODA SEKİZ KEZ YAZILDI ve iki kopyası YANLIŞTI.** Sunucuda yedi
// kopyası vardı (`kosununSlaytlari` ile birleştirildi), panelde iki: koşu ekranı ve
// Komuta ekranı. Komuta ekranınınki `createdAt` ile sıralıyordu — ve zaman damgaları
// milisaniyede eşitlenebiliyor (`dizin` koşusunda 1. ve 2. slayt aynı milisaniyede
// yazılmış ve sıraları ters). Kopyalanan bir kural, kopyalarından birinin yanlış olduğu
// bir kuraldır.
//
// ⚠ Sıranın tek ölçülmüş kaynağı `teslimat.index`: damga üretim anında basılıyor ve bir
// slaydın teslimattaki yerini SÖYLÜYOR. `createdAt` yalnız damgasız (D-248 öncesi)
// varlıklar için bir GERİ DÜŞÜŞ — kural değil.
//
// ⚠ Emeklilik burada YOK ve olmamalı: sunucu `varliklar` listesinde emekli sürüm
// vermiyor (`kutuphane.ts`). Süzgeci burada tekrarlamak, iki yerde tutulan bir güvence
// olurdu — düzeltmeye çalıştığımız şeyin ta kendisi.

/** Sıralama için gereken en az alan — ekranların kendi tipleri bunu karşılıyor. */
export interface SiraliVarlik {
  readonly createdAt: string
  readonly teslimat?: { readonly index: number } | null
}

/** Karosel sırası: `teslimat.index` artan; damgasızlarda `createdAt`. */
export const karoselSirasi = <T extends SiraliVarlik>(varliklar: readonly T[]): T[] =>
  varliklar
    .slice()
    .sort((a, b) =>
      a.teslimat != null && b.teslimat != null
        ? a.teslimat.index - b.teslimat.index
        : a.createdAt.localeCompare(b.createdAt)
    )
