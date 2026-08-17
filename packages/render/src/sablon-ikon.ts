// İkon dağarcığı — gömülü SVG, KAPALI liste, içerikten seçilir (§7.1 · FAZ-11.3).
//
// ⚠ **PLANDAN SAPMA, gerekçesiyle.** FAZ-11.3 kaynak olarak Lucide/Phosphor/Tabler gibi
// bir MIT/ISC setini yazıyordu. Onun yerine ikonlar BURADA çizildi. Üç sebep:
//   1. *"40 satır yazmak bir bağımlılıktan iyidir"* (CLAUDE.md) — yirmi ikon bu dosya kadar.
//   2. Bir set gömülseydi lisans metni izlenen bir dosyada durmak zorundaydı ve her ikon
//      güncellemesi bir lisans denetimi gerektirirdi. Burada denetlenecek lisans yok.
//   3. Kontur kalınlığı ve köşe yarıçapı **markanın** ölçüsünden geliyor, setin kendi
//      tasarım kararlarından değil. Gömülü bir set, kendi tipografik sesini de getirirdi.
//
// ⚠ Yalnız **tam kurulabilir** ilkeller kullanıldı — çizgi, çember, dikdörtgen, çoklu çizgi
// ve basit yay. Karmaşık `path` verisi ezberden yazılsaydı bozuk çizilir ve bunu ancak
// bakınca görürdük; burada her şeklin geometrisi okunarak doğrulanabilir.

import { lower } from '@suite/contracts'

/** Kapalı dağarcık. Yirmi birincisi bir KARAR ister, bir `case` değil. */
export const IKONLAR = [
  'onay',
  'uyari',
  'saat',
  'artis',
  'dusus',
  'ayar',
  'kutu',
  'fabrika',
  'olcek',
  'liste',
  'arama',
  'enerji',
  'katman',
  'dongu',
  'takvim',
  'belge',
  'ekip',
  'kalkan',
  'hedef',
  'grafik',
] as const
export type IkonAdi = (typeof IKONLAR)[number]

/** 24×24 ızgarada gövde. `stroke`/`fill` çağıran tarafından veriliyor. */
const GOVDE: Record<IkonAdi, string> = {
  onay: '<circle cx="12" cy="12" r="9"/><polyline points="7.8,12.4 10.8,15.4 16.2,9"/>',
  uyari:
    '<path d="M12 3.2 L21.8 20.4 L2.2 20.4 Z"/><line x1="12" y1="9.4" x2="12" y2="14"/>' +
    '<line x1="12" y1="17.2" x2="12" y2="17.2"/>',
  saat: '<circle cx="12" cy="12" r="9"/><polyline points="12,6.4 12,12 16,14"/>',
  artis: '<polyline points="3,17.4 9,11.4 13,15.4 21,7"/><polyline points="15,7 21,7 21,13"/>',
  dusus: '<polyline points="3,6.6 9,12.6 13,8.6 21,17"/><polyline points="15,17 21,17 21,11"/>',
  ayar:
    '<line x1="3" y1="8" x2="21" y2="8"/><circle cx="9" cy="8" r="2.4"/>' +
    '<line x1="3" y1="16" x2="21" y2="16"/><circle cx="16" cy="16" r="2.4"/>',
  // İzometrik kutu: üst yüz + iki yan. Düz dikdörtgen "kutu" okunmuyordu.
  kutu:
    '<path d="M3 7.6 L12 3 L21 7.6 L21 18.4 L12 23 L3 18.4 Z"/>' +
    '<polyline points="3,7.6 12,12.2 21,7.6"/><line x1="12" y1="12.2" x2="12" y2="23"/>',
  fabrika: '<path d="M3 20.6 L3 10.6 L9 14.4 L9 10.6 L15 14.4 L15 5.4 L21 5.4 L21 20.6 Z"/>',
  olcek:
    '<path d="M3.8 17.2 A 8.2 8.2 0 0 1 20.2 17.2"/>' +
    '<line x1="12" y1="17.2" x2="16.6" y2="11.8"/><circle cx="12" cy="17.2" r="1.2"/>',
  liste:
    '<circle cx="4.6" cy="7" r="1.4"/><line x1="9" y1="7" x2="20.4" y2="7"/>' +
    '<circle cx="4.6" cy="12" r="1.4"/><line x1="9" y1="12" x2="20.4" y2="12"/>' +
    '<circle cx="4.6" cy="17" r="1.4"/><line x1="9" y1="17" x2="20.4" y2="17"/>',
  arama: '<circle cx="10.6" cy="10.6" r="6.8"/><line x1="15.6" y1="15.6" x2="20.8" y2="20.8"/>',
  enerji: '<path d="M13.4 2.4 L4.2 13.8 L11 13.8 L10.2 21.6 L19.8 10.2 L13 10.2 Z"/>',
  katman:
    '<path d="M12 3 L21.6 8.4 L12 13.8 L2.4 8.4 Z"/><polyline points="2.4,13.4 12,18.8 21.6,13.4"/>',
  // Döngü: iki yarım yay, uçlarında ok. Tek yay "yükleniyor" gibi okunuyordu.
  dongu:
    '<path d="M19.8 12 A 7.8 7.8 0 0 1 6.6 17.6"/><polyline points="6.6,13.2 6.6,18 11.4,18"/>' +
    '<path d="M4.2 12 A 7.8 7.8 0 0 1 17.4 6.4"/><polyline points="17.4,10.8 17.4,6 12.6,6"/>',
  takvim:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>' +
    '<line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
  belge:
    '<path d="M14 3 L6 3 L6 21 L18 21 L18 7 Z"/><polyline points="14,3 14,7 18,7"/>' +
    '<line x1="9" y1="12.4" x2="15" y2="12.4"/><line x1="9" y1="16.4" x2="15" y2="16.4"/>',
  ekip:
    '<circle cx="9" cy="8" r="3.4"/><path d="M3.2 20 A 5.8 5.8 0 0 1 14.8 20"/>' +
    '<circle cx="17.4" cy="9.6" r="2.4"/><path d="M16.2 14.6 A 5.2 5.2 0 0 1 21 20"/>',
  kalkan:
    '<path d="M12 2.8 L20 5.8 L20 12 C20 16.8 16.6 19.9 12 21.4 C7.4 19.9 4 16.8 4 12 L4 5.8 Z"/>',
  hedef:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  grafik:
    '<line x1="3" y1="20.6" x2="21" y2="20.6"/><rect x="5" y="12" width="4" height="8.6"/>' +
    '<rect x="11.4" y="6.6" width="4" height="14"/><rect x="17.8" y="15" width="3.2" height="5.6"/>',
}

/**
 * Anahtar kelime → ikon. Türkçe **sonek** dilidir: kelime kökü başta durur ve ekler sona
 * gelir. Bu yüzden eşleşme **kelime BAŞINDA** aranıyor, kelimenin içinde değil.
 *
 * ⚠ İlk sürüm `metin.includes(kok)` idi ve kısa kökler çarpışıyordu:
 * `ara` → "p**ara**metre", `kaza` → "**kaza**nç", `art` → "**art**ık", `süre` → "**süre**ç".
 * Yani cümlede geçen alakasız bir kelime yanlış ikonu getiriyordu. Kelime başı eşleşmesi
 * bunların hepsini birden çözüyor çünkü Türkçede ek ÖNE gelmez.
 *
 * ⚠ Kalan tek örtüşme kasıtlı: `verim` (artış) ile `veri` (belge). "verimlilik" iki köke de
 * uyar; `IKONLAR` sırasında `artis` önce geldiği için artış kazanır — doğru sonuç. Bu,
 * sıraya bağlı TEK durum ve testte açıkça yazılı.
 */
const KOKLER: Record<IkonAdi, readonly string[]> = {
  onay: ['onay', 'kontrol', 'doğrul', 'uygun', 'kabul', 'tamamlan'],
  uyari: ['uyar', 'risk', 'hata', 'arıza', 'tehlike', 'kaçak', 'sapma'],
  saat: ['süresi', 'süreyi', 'sürede', 'zaman', 'saat', 'gecikm', 'duruş', 'bekle'],
  artis: ['artış', 'artır', 'arttı', 'yüksel', 'iyileş', 'kazanç', 'verim', 'büyü'],
  dusus: ['düş', 'azal', 'kayıp', 'fire', 'israf'],
  ayar: ['ayar', 'parametre', 'kalibr', 'tolerans', 'eşik'],
  kutu: ['stok', 'depo', 'envanter', 'malzeme', 'sevkiy', 'paket'],
  fabrika: ['fabrika', 'tesis', 'üretim', 'atölye', 'imalat'],
  olcek: ['ölç', 'gösterge', 'sensör', 'okum'],
  liste: ['liste', 'adım', 'madde', 'prosedür'],
  arama: ['arama', 'araştır', 'arayın', 'tespit', 'incel', 'denet', 'analiz'],
  enerji: ['enerji', 'elektrik', 'tüket', 'kompresör'],
  katman: ['katman', 'seviye', 'aşama', 'kademe'],
  dongu: ['döngü', 'tekrar', 'süreç', 'akış', 'çevrim'],
  takvim: ['plan', 'takvim', 'bakım', 'program', 'periyod', 'çizelge'],
  belge: ['kayıt', 'belge', 'rapor', 'doküman', 'form', 'veri'],
  ekip: ['ekip', 'çalışan', 'operatör', 'personel', 'sorumlu', 'vardiya'],
  kalkan: ['güvenlik', 'koruma', 'önlem'],
  hedef: ['hedef', 'amaç', 'kpi', 'başarı'],
  grafik: ['grafik', 'istatistik', 'trend', 'dağılım', 'oran'],
}

/**
 * Noktalama ve boşlukla ayır; Türkçe harfler kelimenin PARÇASI kalır.
 *
 * ⚠ Küçültmeyi **kendimiz yapmıyoruz** (R-21): `lower` `@suite/contracts`ten geliyor ve
 * case dönüşümü repoda TEK yerde yaşıyor. İlk sürüm burada `toLocaleLowerCase('tr')`
 * çağırıyordu — locale doğruydu ama kural locale hakkında değil, **tek yer** hakkında:
 * doğru locale'i her çağrı yerinde tekrarlamak, bir gün birinde unutmak demektir.
 */
const kelimeler = (metin: string): readonly string[] =>
  lower(metin)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 0)

/**
 * Bir gövde satırına ikon seçer — DETERMİNİSTİK, içerikten.
 *
 * ⚠ Eşleşme yoksa `null` döner ve çağıran mevcut madde çizgisini çizer. Zorla bir ikon
 * atamak (indekse göre) daha "zengin" görünürdü ama takvimden bahseden bir satırın yanına
 * fabrika ikonu koyardı. **Anlamsız ikon, ikonsuzluktan kötüdür.**
 */
export const ikonSec = (metin: string): IkonAdi | null => {
  // ⚠ **Kelime sırası KAZANIR, ikon sırası değil.** Bir cümlede birden çok kök geçebilir:
  // *"Üretim hattı iki saat durdu"* hem `üretim` (fabrika) hem `saat` (saat) içeriyor.
  // İlk sürüm ikon listesini dıştan dönüyordu, yani kazananı `IKONLAR` dizisindeki
  // konum belirliyordu — tamamen keyfî ve sıra değişirse sessizce başka ikon verirdi.
  // Türkçe cümle KONUYU başa koyar; ilk eşleşen KELİME cümlenin ne hakkında olduğunu
  // söyler. Böylece kazanan anlamdan geliyor, dizi indeksinden değil.
  for (const w of kelimeler(metin)) {
    for (const ad of IKONLAR) {
      if (KOKLER[ad].some((kok) => w.startsWith(kok))) return ad
    }
  }
  return null
}

/** Tek bir ikonun SVG'si. Kontur kalınlığı marka ölçüsünden, setin kararından değil. */
export const ikonSvg = (ad: IkonAdi, renk: string, boyutPx: number): string =>
  `<svg class="ikon" viewBox="0 0 24 24" width="${boyutPx}" height="${boyutPx}" ` +
  `fill="none" stroke="${renk}" stroke-width="1.9" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">${GOVDE[ad]}</svg>`
