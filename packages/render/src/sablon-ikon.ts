// İkon dağarcığı — gömülü SVG, KAPALI liste, içerikten seçilir (§7.1 · FAZ-11.3).
//
// ⚠ ⚠ **PLANA GERİ DÖNÜLDÜ (D-289).** FAZ-11.3 kaynak olarak Lucide/Phosphor/Tabler gibi
// bir MIT/ISC setini yazıyordu; bir tur onun yerine ikonları BURADA çizdi ve üç gerekçe
// sıraladı: "40 satır bir bağımlılıktan iyidir" (R-75), "lisans denetimi istemesin",
// "kontur markadan gelsin". **Üçü de makuldü ve üçü de yanlış soruya cevaptı.**
//
// Depo sahibinin kuralı (R-81) şunu diyor: *jenerik grafik öge KODLANMAZ; tasarım
// kütüphanelerinden profesyonel öge kullanılır.* R-75 bir BAĞIMLILIK ekonomisi kuralı,
// R-81 bir TASARIM kuralı ve ikisi çatıştığında ikincisi kazanıyor — çünkü elle çizilmiş
// bir ikon çalışıyor ama TASARIM GİBİ DURMUYOR. Ölçülemeyen o fark, kullanıcının
// "aşırı bilgisayar işi duruyor" tespitinin kendisi.
//
// ⚠ Üçüncü gerekçe kayıp değil: kontur kalınlığı hâlâ `ikonSvg`de, markanın ölçüsünden.
// ⚠ Lisans gerekçesi de karşılandı: ISC metni bağımlılıkla birlikte geliyor ve sürüm
// `package.json`da sabit — denetlenecek lisans YOK değil, TEK ve İZLENEBİLİR.

import { lower } from '@suite/contracts'
import { IKON_GOVDESI } from './ikon-govde.js'

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
/**
 * 24×24 ızgarada gövde — **Lucide'den (ISC), elle çizilmiş DEĞİL.**
 *
 * ⚠ ⚠ **BU DOSYA ESKİDEN YİRMİ İKONU ELLE ÇİZİYORDU** ve gerekçesini kendi yorumunda
 * yazıyordu: "40 satır bir bağımlılıktan iyidir", "lisans denetimi istemesin", "kontur
 * markadan gelsin". Üçü de makuldü ve üçü de **R-81 ile çelişiyordu**: jenerik grafik öge
 * kodlanmaz. Elle çizilmiş bir ikon "bilgisayar işi" gibi duruyor çünkü öyle.
 *
 * ⚠ **Üçüncü gerekçe kayıp DEĞİL:** kontur kalınlığı hâlâ `ikonSvg`de, markanın
 * ölçüsünden geliyor. Lucide `stroke-width`i `<svg>` üstünde taşıyor ve `path`ler onu
 * miras alıyor — sarmalayıcıda eziliyor.
 *
 * ⚠ Gövdeler ÜRETİLMİŞ bir modülden (`ikon-govde.ts`); üreteci `scripts/ikon-govde.mjs`.
 * Elle düzenlenmez.
 */
const GOVDE: Record<IkonAdi, string> = IKON_GOVDESI as Record<IkonAdi, string>

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
  // ⚠ `hafta` EKLENDİ: `dizin` her kartta dört maddenin dördünü göstermeye başlayınca
  // (FAZ-19.7) *"haftalık oku"* satırı ilk kez her kartta göründü ve HİÇBİR köke
  // oturmadı — kural "ya hepsi ya hiçbiri" olduğu için ikon katmanı tümden kapandı.
  // Hafta bir takvim kavramı; dağarcık zaten `periyod` · `program` · `çizelge`
  // taşıyor. Yeni İKON değil, var olan ikona eksik bir kök.
  takvim: ['plan', 'takvim', 'bakım', 'program', 'periyod', 'çizelge', 'hafta'],
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
/**
 * Ünsüz yumuşaması — Türkçe'nin ön ek eşleşmesini kıran kuralı.
 *
 * ⚠ ⚠ **`eşik` KÖKÜ `eşiği` KELİMESİYLE EŞLEŞMİYORDU.** Sesli harfle başlayan bir ek
 * gelince sondaki sert ünsüz yumuşuyor: `eşik → eşiği`, `kanat → kanadı`, `ağaç →
 * ağacı`. `startsWith` bunu türetemiyor ve kök listesine yumuşamış ikizleri elle yazmak,
 * bir gün birini unutmak demek.
 *
 * ⚠ **SINIR YAZILI: ünlü düşmesi KAPSAM DIŞI.** `kayıp → kaybı` hem yumuşuyor hem
 * gövdeden ünlü düşürüyor; bu kural onu yakalamaz ve yakalamaya çalışmak bir morfoloji
 * motoru yazmak olurdu (R-75). Sınırını söylemeyen bir kural, olmayan bir sınır sanılır.
 *
 * ⚠ Bu, `'i'.toUpperCase()` ailesinden bir hata: kural Türkçe hakkında ve İngilizce
 * sezgisiyle yazılmış bir ön ek eşleşmesi onu göremiyor.
 *
 * ⚠ Yalnız SON harf esnetiliyor, gövde değil: `eşiğ` kabul ediliyor ama `eşşik` değil.
 * Daha geniş bir esneme yanlış ikon üretirdi ve **anlamsız ikon, ikonsuzluktan kötüdür.**
 */
const YUMUSAMA: Readonly<Record<string, string>> = { k: 'ğ', p: 'b', t: 'd', ç: 'c' }

const kokEsliyor = (kelime: string, kok: string): boolean => {
  if (kelime.startsWith(kok)) return true
  const son = kok.slice(-1)
  const yumusak = YUMUSAMA[son]
  if (yumusak === undefined) return false
  return kelime.startsWith(kok.slice(0, -1) + yumusak)
}

export const ikonSec = (metin: string): IkonAdi | null => {
  // ⚠ **Kelime sırası KAZANIR, ikon sırası değil.** Bir cümlede birden çok kök geçebilir:
  // *"Üretim hattı iki saat durdu"* hem `üretim` (fabrika) hem `saat` (saat) içeriyor.
  // İlk sürüm ikon listesini dıştan dönüyordu, yani kazananı `IKONLAR` dizisindeki
  // konum belirliyordu — tamamen keyfî ve sıra değişirse sessizce başka ikon verirdi.
  // Türkçe cümle KONUYU başa koyar; ilk eşleşen KELİME cümlenin ne hakkında olduğunu
  // söyler. Böylece kazanan anlamdan geliyor, dizi indeksinden değil.
  for (const w of kelimeler(metin)) {
    for (const ad of IKONLAR) {
      if (KOKLER[ad].some((kok) => kokEsliyor(w, kok))) return ad
    }
  }
  return null
}

/** Tek bir ikonun SVG'si. Kontur kalınlığı marka ölçüsünden, setin kararından değil. */
export const ikonSvg = (ad: IkonAdi, renk: string, boyutPx: number): string =>
  `<svg class="ikon" viewBox="0 0 24 24" width="${boyutPx}" height="${boyutPx}" ` +
  `fill="none" stroke="${renk}" stroke-width="1.9" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">${GOVDE[ad]}</svg>`
