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

import { sablonBul, zeminKoyuMu } from '@suite/contracts'

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
  /**
   * Bu görselin DÜŞTÜĞÜ SLAYDIN kendi metni — üst başlık · başlık · gövde.
   *
   * ⚠ ⚠ **BU ALAN YOKTU ve üretilen görsel SLAYDI HİÇ BİLMİYORDU.** Depo sahibi:
   * *"tüm yuvalara üretme işi metne uygun konuya uygun mükemmelce yapılmalı rastgele
   * görsel değil!!!"* Ve haklıydı: brief yalnız KONUYU taşıyordu, yani dört slaytın
   * dördü de aynı soruyu cevaplıyordu. Kadraj varyantı görselleri birbirinden ayırıyor
   * ama İÇERİKTEN ayırmıyor — sonuç, konuya uzaktan uygun ama o slayda ait olmayan bir
   * görsel. Bir karoselde her slayt başka bir şey SÖYLÜYOR; görseli de öyle olmalı.
   *
   * ⚠ Boş bırakılabilir: metinsiz bir slayt (kapak deseni, kapanış) için konu yeter.
   */
  readonly kartMetni: string
  /**
   * Karoselin BÜTÜNÜ — komşu slaytların başlıkları, sırayla.
   *
   * ⚠ Bir slaydın görseli komşusunun tekrarı OLMAMALI. Model neyin zaten söylendiğini
   * bilmeden aynı nesneyi iki kez çizer; gerçek koşuda dört slaytta iki kez aynı
   * ölçüm cihazı çıktı. Kadraj farkı bunu çözmüyor, çünkü sorun kadrajda değil ÖZNEDE.
   */
  readonly seriBasliklari: readonly string[]
  /**
   * Bu görselin düştüğü slaydın SIRASI (1 tabanlı). `0` = bilinmiyor.
   *
   * ⚠ ⚠ **YUVA SIRASI İLE SLAYT SIRASI AYNI ŞEY DEĞİL — ve ilk yazımda karıştırdım.**
   * `sira` kaçıncı GÖRSEL YUVASI olduğunu söylüyor; bir slaytta iki yuva olabilir ya
   * da bir slaytta hiç olmayabilir. Seri listesinde *"bu slayt"* işaretini yuva
   * numarasıyla koymak, yanlış slaydı işaretlerdi.
   */
  readonly kartNo: number
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
  // ⚠ Komşu başlıklar SIRALI veriliyor ve bu slaydın kendisi işaretli: model neyin
  // zaten söylendiğini görmeden aynı nesneyi iki kez çizer.
  const seri = g.seriBasliklari
    .map((b, i) => `  ${String(i + 1)}. ${b}${i + 1 === g.kartNo ? '  ← THIS ONE' : ''}`)
    .filter((x) => x.trim() !== '')
  return [
    'write one short image generation brief in english, lowercase only.',
    'YOU choose what to depict — the topic decides, not a template:',
    '  · if the topic is about people and their work, a single figure is right.',
    '  · if it is about a machine, a material or a measurement, show THAT thing.',
    '  · if it is abstract, show a physical object that stands for it.',
    // ⚠ ⚠ **ÖZNEYİ SLAYDIN METNİ SEÇİYOR, KONU DEĞİL.** Konu bütün karosel için
    // aynı; slayt metni her slayt için farklı. Yalnız konuya bakan bir brief, dört
    // slayta dört kez aynı soruyu sorar ve birbirine benzeyen dört görsel üretir.
    ...(g.kartMetni.trim() === ''
      ? ['choose the one subject a reader would recognise instantly for this topic.']
      : [
          'THIS SLIDE SAYS (turkish):',
          ...g.kartMetni
            .split('\n')
            .map((x) => x.trim())
            .filter((x) => x !== '')
            .map((x) => `  ${x}`),
          'depict what THIS slide is about — not the general topic.',
          'the object must be the one a reader would point at while reading these lines.',
        ]),
    ...(seri.length < 2
      ? []
      : [
          // ⚠ Seri BÜTÜNÜ: komşusunun çizdiğini tekrar çizmek karoseli tekdüze yapıyor.
          'the full carousel, in order (do NOT repeat a neighbour subject):',
          ...seri,
        ]),
    `keep this technical base: ${kayit.gorsel.briefTemeli}`,
    // ⚠ ⚠ **ÖZNENİN DEĞERİ KARTA GÖRE SEÇİLİYOR — ve bu satır olmadığı için iki gerçek
    // karosel görünmez çıktı.** Brief düz siyah zemin istiyor (alfa oradan türetiliyor,
    // doğru); ama kesildikten sonra öznenin nereye oturacağını soran kimse yoktu.
    // Ölçüm: koyu kartta kömür rengi bir kulak, p90 luma farkı 47 (eşik 120); kâğıt
    // kartta beyaz bir kumsaati, aynı kusur ters yönde. Zemin katalogda ZATEN yazılı
    // (`KatalogSablonu.zemin`) ve bu fonksiyon `sablonBul`u zaten çağırıyordu — eksik
    // olan tek şey onu okumaktı.
    //
    // ⚠ İstenmeyen şey ADIYLA ANILMIYOR (R-20 muhafızı olumsuzlamada yanlış pozitif
    // veriyor): *"koyu olmasın"* demek yerine *"açık değerde olsun"* deniyor.
    ...(zeminKoyuMu(kayit.zemin)
      ? [
          'the cut out object will sit on a very dark card, so give it a light value:',
          'pale, bright or polished surfaces that stay readable against a near black surround.',
        ]
      : [
          'the cut out object will sit on a bright pale card, so give it a deep value:',
          'dark, rich or shadowed surfaces that stay readable against a near white surround.',
        ]),
    ...(g.gorselDili === '' ? [] : [`visual language for this whole set: ${g.gorselDili}`]),
    // ⚠ Varyant KADRAJI söylüyor, ÖZNEYİ değil: aynı konudan N özdeş görsel çıkmasın.
    ...(varyant === undefined ? [] : [`frame it like this: ${varyant}`]),
    // ⚠ ⚠ **BU SATIR ÖNCE `context` KELİMESİNİ TAŞIYORDU ve dikiş kapısı yakaladı.**
    // R-20 muhafızı `text` ALT DİZESİNİ arıyor: `con-text-` onu tetikliyor. Aynı
    // yanlış pozitif bu depoda `no texture` içindeki `no text` ile de yaşandı ve
    // katalog kaydında yazılı. Muhafız gevşetilmiyor (R-76) — cümle değişiyor.
    `overall topic, for orientation: ${g.konu}`,
    // ⚠ ⚠ **ARKA PLAN SİLİNMEYE HAZIR OLMAK ZORUNDA.** Depo sahibi: *"her şey 3d
    // olarak arkaplansız hale gelmeye hazır olarak üretilebilir."* Yerel silici
    // (BRIA RMBG) tek, net, ayrık bir özneyi temiz kesiyor; sahneye gömülmüş ya da
    // kadrajı taşan bir özneyi kesemiyor — üç gerçek koşuda ölçüldü (D-274).
    // ⚠ ⚠ **BU ÜÇ SATIR BİR ÖLÇÜMDEN DOĞDU.** İlk sürüm yalnız *"tek özne, kadrajın
    // içinde"* diyordu ve model MAKRO bir kadraj seçti: granül örneği bütün tuvali
    // dolduruyor, arka plan silici kesecek bir kenar bulamıyor. Ölçüm ikisini birden
    // gösterdi: `matlama-tutmuyor` kusuru ve akıllı kırpmada `%0 boş kenar`.
    // Kesilebilir bir görsel, ÇEVRESİNDE BOŞLUK OLAN bir görseldir.
    //
    // ⚠ İstenmeyen şey ADIYLA ANILMIYOR (olumsuzlama R-20 muhafızında yanlış pozitif
    // üretiyor): *"makro çekme"* demek yerine *"uzaktan, çevresi boş"* deniyor.
    'show the whole object from a short distance, with empty ground on all four sides.',
    'the object occupies about two thirds of the frame and touches no edge.',
    'render it as a physical three-dimensional object with real material and volume,',
    'the kind of render a product studio would deliver: crisp, deliberate, memorable.',
    'describe only the subject, its material, and the lighting.',
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
