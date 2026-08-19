// Uyum iddiasının kapsamı hattan OKUNUR (§11.3 · R-33 · D-232 · FAZ-8.3).
//
// **Bulunan kusur:** `scripts/uret.mjs` uyum iddiasını şöyle kuruyordu:
//
//     basis: { kind: 'prompt_forbids_people', promptDigest: '' },
//     aiGenerated: false,        ← SABİT
//     prompt: konu,              ← CLI konusu, modele giden prompt DEĞİL
//
// Yanındaki yorum *"bu hatta görsel model çağrısı YOK"* diyordu. FAZ 8'de eklenen
// `ad-creative-set` hattı `capability: image.generate` taşıyor — yani yorum **artık
// doğru değildi ve kimse fark etmedi**. D-227'nin dersinin birebir tekrarı: aldatan
// şey kod değil, kodun yanındaki iddiaydı.
//
// **Zinciri sonuna kadar takip et:** `aiGenerated: false` → `disclosureRequired` her
// zaman `false` → IPTC'ye `Upcytech:AiGenerated=false` basılıyor (yanlış beyan) →
// `publish.ts` `if (!a.compliance.disclosureRequired) continue` → **EU AI Act Md. 50
// ifşa kapısı model üretimi bir görselde sessizce atlanıyor.** Bir sabit, üç katman
// aşağıda bir yasal kapıyı kapatıyordu.
//
// Bu modül kararı **hattan** okuyor ve bir testle ölçülüyor: hat yeniden adlandırılsa
// ya da ikinci bir görsel hattı eklense de doğru kalır.

import type { Pipeline, PipelineStep } from '@suite/registry'

/**
 * Görsel/video üreten yetenek önekleri.
 *
 * Ses (`audio.tts`) burada **yok ve bu bilinçli**: bu modül damgalanan ve yayınlanan
 * GÖRSEL varlığın iddiasını kuruyor. Ses ayrı bir varlık tipi ve ayrı bir ifşa
 * yüzeyi ister; ikisini tek bayrağa bağlamak, birini diğerinin arkasına saklardı.
 */
export const GORSEL_YETENEK_ONEKLERI = ['image.', 'video.'] as const

/** Bu adım bir görsel modeli mi çağırıyor. */
const gorselAdimMi = (s: PipelineStep): boolean =>
  s.verb === 'GENERATE' && GORSEL_YETENEK_ONEKLERI.some((o) => (s.capability ?? '').startsWith(o))

export interface UyumKapsami {
  /**
   * Bu çalıştırmada model üretimi bir görsel var mı.
   *
   * `aiGenerated` alanına giden değer budur — ve Md. 50 ifşası buna bağlı.
   */
  readonly aiGenerated: boolean
  /** Görsel üreten adım id'leri — manifest ve hata mesajı için. */
  readonly adimlar: readonly string[]
  /**
   * Taranacak prompt'lar: hat adımlarının `prompt` kısıtı.
   *
   * **Boş olabilir ve bu bir hata DEĞİL burada** — `assertCompliance` boş prompt'ta
   * `basis_missing` ile reddediyor (fail-closed). Bu modülün işi olguyu bildirmek;
   * reddi kuran yer iddianın kendisi.
   */
  readonly promptlar: readonly string[]
}

export const uyumKapsami = (p: Pipeline): UyumKapsami => {
  const adimlar = p.steps.filter(gorselAdimMi)
  return {
    aiGenerated: adimlar.length > 0,
    adimlar: adimlar.map((s) => s.id),
    promptlar: adimlar
      .map((s) => (typeof s.constraints['prompt'] === 'string' ? s.constraints['prompt'] : ''))
      .filter((x) => x.trim() !== ''),
  }
}

/**
 * `assertCompliance`e verilecek prompt metni.
 *
 * **Görsel üretiliyorsa konu VE adım prompt'ları birlikte taranır.** Yalnız adım
 * prompt'unu taramak dar olurdu: bugün hiçbir hat `prompt` kısıtı yazmıyor ve tarama
 * boş bir dizeye düşerdi. Yalnız konuyu taramak da dar — modele giden metin konudan
 * türetiliyor ama ona eşit değil. İkisini birleştirmek **fail-safe yön**: tarama ne
 * kadar geniş olursa insan isteyen bir ifade o kadar yakalanır.
 */
export const taranacakPrompt = (kapsam: UyumKapsami, konu: string): string =>
  kapsam.aiGenerated ? [konu, ...kapsam.promptlar].join('\n') : konu

/**
 * Koşu GERÇEKTEN model görseli üretti mi — hattın YAPABİLDİĞİ değil, YAPTIĞI.
 *
 * ⚠ ⚠ **HAT KAPSAMI ÜST SINIRDIR, OLGU DEĞİL.** `uyumKapsami` "bu hat görsel
 * üretebilir mi" sorusunu cevaplıyor ve D-232'de tam da bunun için yazıldı: eskiden
 * `aiGenerated` sabit `false` idi ve ifşa kapısı sessizce kapanıyordu. Ama üst sınır
 * karar yerine kullanılınca ters yönde yanılıyor:
 *
 * Ölçülen koşu — `akan-alan` şablonu seçildi, o şablonun görsel yuvası YOK, dolayısıyla
 * `gorsel-uret` **atlandı** (`status: skipped`). Kreatifte tek bir model görseli yok.
 * Yine de `aiGenerated: true` yazıldı → `disclosureRequired: true` → görünür ifşa
 * aranmadı (aranacak görsel yok) → `visibleDisclosure: false` → **kusursuz, sıfır
 * kusurlu bir karosel YAYINLANAMAZ oldu.** İhtiyacı olmayan bir ifşa yüzünden.
 *
 * ⚠ Yön önemli: eksik iddia etmek tehlikeli, fazla iddia etmek engelleyici. Bu yüzden
 * karar bir VARSAYIMA değil deftere dayanıyor — adımın `status`u. Adım koştuysa ve
 * çıktı ürettiyse ifşa gerekir; `skipped` ise adım hiç çalışmamıştır ve bu bir kayıttır,
 * bir tahmin değil.
 */
export const kosudaGorselUretildi = (
  kapsam: UyumKapsami,
  adimDurumlari: Readonly<Record<string, string | undefined>>
): boolean => kapsam.adimlar.some((id) => adimDurumlari[id] === 'ok')
