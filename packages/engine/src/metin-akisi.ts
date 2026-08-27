// `GENERATE`in metin girdisi ve çıktısı — dikişin iki yarısı (§5.3 · D-243 · FAZ-3.7b).
//
// **İki boşluk vardı ve ikisi de sessizdi:**
//
//   1. **Prompt'un kaynağı yoktu.** `topic` bir çalıştırma parametresi, kayıtlar
//      `SELECT`ten `input.inputs`e akıyor — ama hiçbir kod ikisini bir prompt'a
//      çevirmiyordu. `constraints['prompt']` hep boş kalıyor ve adaptör
//      `EMPTY_PROMPT` diyordu.
//   2. **Çıktı `COMPOSE`a ulaşmıyordu.** `composeBody` `{lines: string[]}` arıyor;
//      sağlayıcı çıktısı o şekilde değil. Bulamayınca **sessizce ham kayıtlara
//      düşüyordu** — yani model koşsa bile metni kullanılmıyordu ve bunu çıktıya
//      bakarak anlamak imkânsızdı.
//
// İkisi ayrı dosyalarda olsaydı biri düzeltilip diğeri unutulurdu; aynı dikişin iki
// ucu aynı yerde duruyor.
//
// **Neden `assembleContext` bunu yapmıyor:** o, hangi kaydın bütçeye SIĞDIĞINI
// hesaplıyor (köken ve planlama). Metni birleştirmek ayrı bir iş ve karıştırılırsa
// "bu kayıt neden düştü" ile "bu prompt neden böyle" tek cevaba sıkışır.

// ⚠ Düğüm tavanı ÇİZİCİDEN geliyor, burada tekrar YAZILMIYOR: iki yerde iki sayı
// tutmak, birini değiştirip diğerini unutmanın en kısa yolu. Çizici 5'ten fazlasını
// `too_many` ile reddediyor; ayrıştırıcı da aynı sınırı uyguluyor ki geçersiz bir blok
// hiç kurulmasın.
import { islevTavanlari, yayTalimati } from '@suite/contracts'
import { kipTarifi, type IcerikKipi } from '@suite/contracts'
import { MAX_DUGUM, ORNEKLER } from '@suite/render'

/** Prompt'a giren kayıt — `SELECT` çıktısının şekli. */
export interface PromptKaydi {
  readonly id: string
  readonly text: string
}

export interface PromptGirdisi {
  readonly konu: string
  readonly kayitlar: readonly PromptKaydi[]
  /**
   * İçerik kipi — **metni yazan istemin de bilmesi gereken şey.**
   *
   * ⚠ ⚠ **BU ALAN YOKTU ve `genel` kip ÜÇ AYRI ŞEKİLDE bozuluyordu.** Depo sahibi
   * gerçek bir çıktı yapıştırdı: altı satırın beşi SORU, sonuncusu satış çağrısı —
   * *"ne yargı var ne bilgi, soru sorup duruyor."* Üç sebep birden ölçüldü:
   *   1. `kipTarifi` bu isteme HİÇ ulaşmıyordu (öğretici biçim talimatı yok),
   *   2. istem *"yalnız buradaki bilgiyi kullan"* diyerek modeli MARKA KAYITLARINA
   *      hapsediyordu — genel bir konuda anlatacak genel bir şey kalmıyordu,
   *   3. ritim kuralı `memphis` hedefini seçmişti: *"satırların EN AZ YARISI soru
   *      işaretiyle bitecek."*
   * Model yanlış davranmadı; istem tam olarak bunu istedi.
   */
  readonly kip?: IcerikKipi
  /**
   * Şablon BELLİYSE kimliği — metin O ŞABLON İÇİN yazılır.
   *
   * ⚠ ⚠ **BU ALAN BİR İSRAFI KAPATIYOR ve israf ÖLÇÜLDÜ.** Depo sahibi: *"üretim
   * başlatınca bir metin üretiyor ama bunu şablon seçmeden yaptığı için, sonra şablon
   * seçince farklı bir metinle o şablonu doldurmak zorunda kalıyor — bu da metnin
   * boşa gitmesi demek."* Ölçüm onu doğruladı: dört gerçek koşuda `metin-uret`in
   * 10 · 7 · 11 · 14 satırından uyarlamaya AYNEN geçen satır sayısı 0 · 1 · 0 · 1.
   * Yani ilk metin pratikte bir ŞEKİL SONDASI ve tam bir model çağrısına mal oluyor.
   *
   * ⚠ Şablon verilmezse alan boş kalıyor ve iki fazlı akış AYNEN duruyor: seçim
   * içeriğin şekline bakıyor ve o şekil ancak metin yazıldıktan sonra ölçülebiliyor
   * (hat dosyasının kendi gerekçesi). Bu alan o gerekçeyi KALDIRMIYOR — insan ya da
   * hat şablonu ZATEN söylediyse sondaya gerek olmadığını söylüyor.
   */
  readonly sablonId?: string
  readonly locale?: string
  readonly maxChars?: number
  /** Geçmiş redlerin gerekçesi — negatif kısıt (D-191). */
  readonly kacinilacak?: string
  /**
   * Son koşularda kullanılmış ŞABLONLAR — metnin şeklini çeşitlendirmek için.
   *
   * ⚠ ⚠ **BU ALAN, 16.6'NIN ÜRETİMDE YETMEDİĞİ ÖLÇÜLDÜĞÜ İÇİN VAR.** Şablon
   * çeşitlilik kuralı bağlandı ve dikişi test edildi; iki gerçek koşuda kısıt gövdeye
   * ULAŞTI ve yine aynı şablon seçildi. Kural doğru davranmıştı: eleme yalnız BAŞKA
   * UYGUN ADAY varsa uygulanıyor ve o içeriklerde yoktu — çünkü `metin-uret` konudan
   * bağımsız hep aynı şekli üretiyordu. Açıkça "2019 2021 2023 2025 rakamlarla" denen
   * bir konuda bile dört karttan ÜÇÜ rakamsız çıktı.
   *
   * ⚠ **Şablon çeşitliliği içerik çeşitliliğinin SONUCU, sebebi değil.** Sırayı ters
   * çevirmek (önce şablon seç, sonra ona uygun metin yaz) yanlış cevap olurdu: o an
   * içerik kompozisyona uydurulur ve Yasa 13 tersine döner. Doğru müdahale burada —
   * metne hangi ritimlerin YAKIN GEÇMİŞTE kullanıldığını söylemek.
   */
  readonly sonSablonlar?: readonly string[]
  /**
   * Görselin gireceği YUVA (FAZ-14.3). `undefined` ise plan hiçbir yuva işaretlememiş
   * demektir ve `gorselBriefPromptu` `null` döner — yani model HİÇ çağrılmaz.
   *
   * ⚠ Bu alanın varlık sebebi hattın en eski kusuru: `gorsel-uret` bugün `render`'dan
   * ÖNCE koşuyor ve brief'i `bilgi-sec`ten alıyor. Yani görsel, gireceği slaydı
   * GÖRMEDEN doğuyor — hangi satırın yanında duracağını, hangi alanın üstüne
   * oturacağını bilmiyor. Brief KONUDAN yazılıyor, oysa görselin desteklemesi gereken
   * şey konu değil O SATIR.
   */
  readonly yuva?: Yuva
}

/** Görselin gireceği yuvanın tarifi — brief bunu görerek yazılıyor. */
export interface Yuva {
  /** Yuvanın bulunduğu slaydın 0 tabanlı sırası. */
  readonly slaytIndex: number
  readonly toplam: number
  /** Yayda o slaydın işlevi (`kanit` gibi) — görselin ne yapması gerektiğini söyler. */
  readonly islev: string
  /** Yuvanın yanında duran satır. Görsel KONUYU değil BU CÜMLEYİ desteklemeli. */
  readonly satir: string
}

const baglamBloku = (kayitlar: readonly PromptKaydi[]): string =>
  kayitlar
    .filter((k) => k.text.trim() !== '')
    .map((k) => `[${k.id}]\n${k.text.trim()}`)
    .join('\n\n')

/**
 * Türkçe içerik metni için prompt.
 *
 * **Kaynak zorunlu:** kayıt yoksa prompt kurulmaz. Bağlamsız üretilen metin markadan
 * değil modelin genel bilgisinden gelir ve bunu çıktıya bakarak ayırt etmek zor —
 * `selectBody` zaten `NO_CONTEXT` ile duruyor, bu ikinci savunma hattı.
 *
 * **Sayı yasağı prompt'a YAZILIYOR.** Linter zaten yakalıyor (R-32) ama modelin
 * uydurmasını beklemek yerine baştan söylemek, bir turu ve bir insan bakışını
 * kurtarıyor.
 */
/**
 * Hedef slayt sayısı. Altı satır: kanca · gerilim · kanıt · kanıt · dönüş · davet.
 *
 * ⚠ Yayın ORTASI esnek (kanıt tekrarlanır), UÇLARI sabit — beş de altı da aynı hikâyeyi
 * taşır. Sayı burada duruyor çünkü prompt bir hedef vermek zorunda; yayın kendisi
 * `@suite/contracts`te ve her uzunlukta çalışıyor.
 */
const HEDEF_SATIR = 6

/**
 * Şablon → içerik RİTMİ. Seçim bu ritimleri ölçüyor (`sablonSec`), yani model onları
 * kurduğunda seçim de değişiyor.
 *
 * ⚠ `donen` ve `editoryal` YOK: onlar içerikten seçilemiyor (açıkça istenir), bu
 * yüzden metne bir ritim önermeleri anlamsız olurdu.
 */
const RITIM: Readonly<Record<string, string>> = {
  'veri-hikayesi': 'yıl yıl sayısal seyir (her satırda rakam)',
  'akan-alan': 'numaralı adım ritmi (1. 2. 3. …)',
  memphis: 'soru ritmi (soru sorulur ve CEVAPLANIR)',
  sahne: 'düz anlatı (rakamsız, hikâye)',
  // ⚠ ⚠ **TABLO DÖRTTE KALMIŞTI ve bu ÜRETİMİ İKİ KEZ YAZDIRIYORDU.** Rotasyon
  // yalnız dört şablonu tanıdığı için, kalan altısı ancak METİN YAZILDIKTAN SONRA
  // şekle bakılarak seçilebiliyordu — yani her koşuda bir şekil sondası. Depo sahibi
  // israfı gördü: *"metin boşa gidiyor."* Ölçüm doğruladı: ilk metnin uyarlamaya
  // aynen geçen satır sayısı dört koşuda 0 · 1 · 0 · 1.
  //
  // ⚠ Şekiller UYDURULMADI, kataloğun kendi taslaklarından OKUNDU: her şablonun
  // örnek kartları o şablonun metninin nasıl aktığını zaten gösteriyor. Şablon
  // TASARIMINA dokunulmadı — burada yazılan, tasarımın metne dair ilan ettiği şey.
  donen: 'dört dönüşlü seri (aynı düzen, her kart bir varyasyon)',
  editoryal: 'sessiz editoryal akış (üst başlıksız, tek bakış)',
  kavis: 'tekrar ve sapma (aynı hareket, ölçülen fark)',
  alinti: 'söz ve karşı söz (alıntı · itiraz · soru)',
  karsilastirma: 'önce/sonra (durum · değişim · sonuç)',
  dizin: 'numaralı adım listesi (ADIM 01…04, her kart bir madde)',
}

/**
 * Ritmin MEKANİK karşılığı — üslup tarifi değil, sayılabilir bir kural.
 *
 * ⚠ ⚠ **İKİ YAKLAŞIM DENENDİ VE İKİSİ DE TUTMADI** (LOOP§G · D-309). (1) Üç ritim
 * SEÇENEK olarak sunuldu → model her koşuda en kolayını, zaten bildiği düz anlatıyı
 * seçti. (2) Tek hedef verildi ve "bu bir öneri değil" dendi → çıktı yine anlatı oldu.
 * Ortak sebep: ikisi de ÜSLUP tarif ediyordu ve üslup, ölçülemeyen bir şeydir; model
 * kendi ürettiğinin o üsluba uyduğunu sanabilir ve kimse aksini söyleyemez.
 *
 * ⚠ Üçüncü yaklaşım: ritmi SAYILABİLİR bir biçim kuralına çevirmek. "Satır 2'den
 * itibaren her satır `1.` `2.` `3.` ile BAŞLAYACAK" bir üslup değil, bir sözleşme —
 * ve `sablonSec` zaten tam bunu ölçüyor. Aynı depoda uyarlama isteminde de aynı ders
 * çıkmıştı: şema yazılmadan uyulmasını beklemek, kuralı koymadan ihlali cezalandırmaktır.
 */
const BICIM: Readonly<Record<string, readonly string[]>> = {
  'veri-hikayesi': [
    '- 2. satırdan itibaren HER satır en az bir SAYI içerecek (yıl, oran, adet).',
    '- Sayılar yalnız MARKA BİLGİSİ içinde geçenlerden alınacak.',
  ],
  'akan-alan': [
    '- 2. satırdan itibaren her satır `1.` `2.` `3.` `4.` ile BAŞLAYACAK.',
    '- Numara satırın ilk karakteri olacak; başka bir şey yazma.',
  ],
  memphis: [
    // ⚠ ⚠ **CEVAPSIZ SORU ÖĞRETMİYOR — ve bu bir üretim çıktısıyla ölçüldü.** Kural
    // yalnız *"yarısı soruyla bitecek"* diyordu; gerçek koşuda altı satırın beşi soru
    // oldu ve karosel hiçbir şey söylemedi. Depo sahibi: *"ne yargı var ne bilgi,
    // soru sorup duruyor."* Soru bir GİRİŞTİR, bir içerik değil.
    '- Soru sorduğun her satırda CEVABI da ver: soru cümlesini kendi cevabı izlesin',
    '  ya da aynı satır soruyu sorup yanıtlasın.',
    '- ARDA ARDA iki soru satırı yazma; her sorunun karşısında bir olgu dursun.',
    '- 2. satırdan itibaren satırların en fazla YARISI soruyla başlasın.',
    '- Sorular retorik değil, okurun kendine soracağı türden olacak.',
  ],
  sahne: ['- Rakam ve numara KULLANMA; satırlar bir hikâyenin evreleri olacak.'],
  // ⚠ Aşağıdaki altı kural da kataloğun taslaklarından okundu; her biri o şablonun
  // metninin SAYILABİLİR şeklini söylüyor — bir üslup tarifi değil.
  donen: [
    '- Her satır AYNI şeyin başka bir hâlini anlatacak: aynı düzen, değişen bir öge.',
    '- Son satır diziyi KAPATACAK: "işte bu yüzden" demeden, sonucu söyleyerek.',
  ],
  editoryal: [
    '- Üst başlık YOK; her satır kendi başına duran bir cümle olacak.',
    '- Rakam ve numara kullanma; ton sakin, iddia net.',
  ],
  kavis: [
    '- İlk satır bir TEKRARI, ortadakiler ölçüyü ve SAPMAYI, son satır sürekliliği',
    '  anlatacak.',
    '- Rakam kullanma; fark niteliksel anlatılacak.',
  ],
  alinti: [
    '- 1. satır bir SÖZ olacak (tırnaksız, kısa ve kesin).',
    '- 2. satır o sözün SINIRINI söyleyecek: doğru ama eksik kalan yanı.',
    '- 3. satır bir SORU olacak ve okuru karar vermeye çağıracak.',
  ],
  karsilastirma: [
    '- 1. satır ÖNCEKİ durumu, son satır SONRAKİ durumu anlatacak.',
    '- Aradaki satırlar neyin değiştiğini söyleyecek — sırayla, atlamadan.',
  ],
  dizin: [
    '- 2. satırdan itibaren her satır bir ADIM olacak; adımlar sırayla ilerleyecek.',
    '- Her adım tek bir iş anlatacak: "önce şunu yap" diyebilecek kadar somut.',
  ],
}

/**
 * Kaynakta SAYI isteyen ritimler.
 *
 * ⚠ ⚠ **BU KONTROL YORUMDA VARDI, KODDA YOKTU.** Hemen aşağıdaki not *"kaçış kapısı
 * daraltıldı: yalnız sayısal ritim için ve yalnız kaynakta sayı yoksa"* diyor — ama
 * `ritimTalimati` kayıtları hiç görmüyordu, yani kaynakta sayı olup olmadığını
 * ÖLÇEMİYORDU. Gerçek koşuda sonuç şu oldu: hat sayısız bir kaydı (`proof_asset`)
 * konu seçti, ritim "her satırda rakam" dedi ve model — haklı olarak — REDDETTİ:
 * *"MARKA BİLGİSİ'nde hiç sayı yok."* Yasa 8 gereği uydurması da yasaktı.
 *
 * Ölçülmeyen bir kural bir temennidir; bu dosya bunu iki kez öğrendi.
 */
const SAYI_ISTEYEN: ReadonlySet<string> = new Set(['veri-hikayesi'])

/**
 * Sayısal ritmin ihtiyacı duyduğu EN AZ farklı sayı.
 *
 * Ritim "2. satırdan itibaren HER satır en az bir sayı içerecek" diyor ve karosel
 * 5–7 satır. Aynı sayıyı beş kez yazmak bir veri hikâyesi değil, bir tekrardır;
 * üç farklı sayı en düşük dürüst eşik.
 */
const EN_AZ_SAYI = 3

/**
 * Kaynakta ritmi taşıyacak kadar SAYISAL İDDİA var mı.
 *
 * ⚠ ⚠ **"RAKAM VAR MI" ZAYIF BİR VEKİLDİ ve gerçek koşuda kırıldı.** İlk sürüm
 * `/\d/.test(text)` diyordu; bağlamda TEK kayıt vardı ve içinde TEK bir `1` geçiyordu.
 * Kontrol "sayı var" dedi, ritim her satırda sayı istedi, model — haklı olarak —
 * reddetti: *"MARKA BİLGİSİ hiçbir sayı içermiyor (yıl, oran, adet — hiçbiri yok)"*.
 * Panelden onaylanan koşu tam bu yüzden `TEXT_REFUSED` ile durdu.
 *
 * Ölçülen şey artık **farklı sayısal belirteç sayısı**: bir metnin içindeki tek bir
 * `1`, beş satırlık bir veri ritmini taşıyamaz. Sayılar tekilleştiriliyor — aynı
 * sayıyı tekrar etmek yeni bir iddia değildir.
 */
export const kaynaktaSayiVar = (kayitlar: readonly PromptKaydi[]): boolean => {
  const sayilar = new Set<string>()
  for (const k of kayitlar) {
    for (const m of k.text.matchAll(/\d+(?:[.,]\d+)?\s*%?/g)) sayilar.add(m[0].trim())
  }
  return sayilar.size >= EN_AZ_SAYI
}

/**
 * ROTASYONUN sıradaki şablonu — **metin yazılmadan ÖNCE bilinebilir.**
 *
 * ⚠ ⚠ **BU FONKSİYON BİR MİMARİ KARARIN TAŞIYICISI.** Depo sahibi israfı gördü:
 * *"üretim başlatınca bir metin üretiyor ama bunu şablon seçmeden yaptığı için, sonra
 * şablon seçince farklı bi metinle o şablonu doldurmak zorunda kalıyor."* Ölçüm
 * doğruladı: ilk metnin uyarlamaya AYNEN geçen satır sayısı dört koşuda 0 · 1 · 0 · 1.
 *
 * ⚠ ⚠ **ROTASYON ZATEN METİNDEN ÖNCE KARAR VERİYORDU — kimse sonucu KULLANMIYORDU.**
 * `ritimTalimati` modele *"bu sefer şu şekilde yaz"* diyor, model yazıyor, sonra
 * `sablonSec` yazılanın ŞEKLİNE bakıp *"demek ki şu şablon"* diyor. Yani cevap baştan
 * belliydi ve bir model çağrısı onu yeniden keşfetmeye harcanıyordu.
 *
 * ⚠ Rotasyon artık kataloğun ONUNU birden tanıyor (`RITIM`); dörtte kaldığı sürece
 * şekil sondası gerçekten gerekliydi, çünkü kalan altı şablon başka türlü seçilemezdi.
 *
 * ⚠ `null` = rotasyon bir hedef bulamadı (hepsi yakın geçmişte kullanılmış ya da
 * kaynakta sayı yok ve yalnız sayı isteyen ritimler kalmış). O hâlde ESKİ yol geçerli:
 * metin serbest yazılır, şekle bakılıp seçilir. Kaçış kapısı kapatılmadı.
 */
export const rotasyonHedefi = (
  sonSablonlar: readonly string[],
  sayiVar: boolean
): string | null => {
  // ⚠ ⚠ **İLK KOŞU SERBEST ve bu KASITLI — beş test bunu koruyordu.** Geçmiş yokken
  // rotasyonun döndüreceği bir "sıradaki" yok; ilk sırayı hedef saymak, ilk karoseli
  // her zaman aynı şablona mahkûm ederdi. Geçmiş yoksa ESKİ yol geçerli: metin serbest
  // yazılır, şekle bakılıp seçilir. Bir tur israf, kalıcı bir tekdüzelikten ucuz.
  if (sonSablonlar.length === 0) return null
  return (
    Object.keys(RITIM).find(
      (id) => !sonSablonlar.includes(id) && (sayiVar || !SAYI_ISTEYEN.has(id))
    ) ?? null
  )
}

const ritimTalimati = (sonSablonlar: readonly string[], sayiVar: boolean): readonly string[] => {
  const kullanilan = sonSablonlar.map((s) => RITIM[s]).filter((r): r is string => r !== undefined)
  if (kullanilan.length === 0) return []
  const oneri = Object.entries(RITIM)
    .filter(([id]) => !sonSablonlar.includes(id))
    .map(([, r]) => r)
  if (oneri.length === 0) return []
  // ⚠ ⚠ **MENÜ DEĞİL, TEK HEDEF — ve bu fark ÖLÇÜLEREK anlaşıldı.** İlk sürüm üç
  // ritmi seçenek olarak sunuyor ve "konu izin vermiyorsa zorlama" diyordu. Gerçek
  // koşuda model her seferinde en kolayını, yani zaten bildiği düz anlatıyı seçti;
  // kaçış kapısı her konuda açıktı çünkü hemen her konu anlatıyla anlatılabilir.
  // Bir seçenek listesi bir talimat değildir.
  //
  // ⚠ Kaçış kapısı KALDIRILMADI, DARALTILDI: yalnız sayısal ritim için ve yalnız
  // kaynakta sayı yoksa. Kaynakta olmayan bir sayıyı uydurmak Yasa 8 ihlali olurdu.
  // Kaynakta sayı yoksa sayısal ritim ELENİR — sırayla bir sonraki aday alınır.
  // Elenmesi gereken şey talimat değil HEDEF: "sayı iste ama zorlama" demek,
  // ölçülemeyen bir kurala geri dönmek olurdu.
  const hedefId = rotasyonHedefi(sonSablonlar, sayiVar)
  if (hedefId === null) return []
  const bicim = BICIM[hedefId] ?? []
  return [
    '',
    `BİÇİM KURALI — son karoseller ${kullanilan.join(', ')} biçimindeydi.`,
    `BU SEFER: ${RITIM[hedefId] ?? ''}`,
    ...bicim,
    'Bu bir üslup tercihi değil, sayılabilir bir kural: metnin şekli hangi tasarımın',
    'seçileceğini belirliyor ve aynı şekil her seferinde aynı tasarımı üretiyor.',
  ]
}

/**
 * Şablonun kendi BİÇİM kuralı — ritim tablosunda varsa.
 *
 * ⚠ Tabloda olmayan şablonlar (dizin, karsilastirma, alinti…) için boş: uydurulmuş
 * bir biçim kuralı, modele o şablonun taşımadığı bir şekli dayatırdı.
 */
const sablonBicimi = (
  sablonId: string,
  sonSablonlar: readonly string[] = []
): readonly string[] => {
  const b = BICIM[sablonId]
  if (b === undefined) return []
  // ⚠ ⚠ **RİTMİN ADI DA BASILIYOR — ve bunu bir test korudu.** Yalnız mekanik kuralları
  // yazmak, modelin *"ne tür bir metin bu"* sorusuna cevapsız kalması demekti; rotasyon
  // anlatısı (`BU SEFER: düz anlatı`) o cevabı veriyordu ve şablon adına geçerken
  // kaybolmuştu. İkisi birlikte: ne tür ve hangi sayılabilir kurallarla.
  // ⚠ ⚠ **SON KOŞULARIN RİTMİ DE YAZILI — ve bunu bir test korudu.** *"Bu sefer şunu
  // yaz"* demek yetmiyor; modelin NEDEN başka bir şey istendiğini görmesi, aynı şekle
  // geri dönme eğilimini kırıyor (D-309: iki üslup denemesi de bu yüzden tutmadı).
  const kullanilan = sonSablonlar.map((x) => RITIM[x]).filter((r): r is string => r !== undefined)
  return [
    '',
    `BİÇİM KURALI — bu metin ${sablonId} şablonu için yazılıyor.`,
    ...(kullanilan.length === 0 ? [] : [`Son karoseller ${kullanilan.join(', ')} biçimindeydi.`]),
    `BU SEFER: ${RITIM[sablonId] ?? ''}`,
    ...b,
    'Bu bir üslup tercihi değil, sayılabilir bir kural: metnin şekli kompozisyona',
    'oturmak zorunda ve aynı şekil her seferinde aynı tasarımı dolduruyor.',
  ]
}

export const icerikPromptu = (g: PromptGirdisi): string | null => {
  const baglam = baglamBloku(g.kayitlar)
  if (g.konu.trim() === '' || baglam === '') return null
  const genel = g.kip === 'genel'
  // ⚠ Kart sayısı KATALOGDAN okunuyor, uydurulmuyor: şablonun kaç kartı varsa metin o
  // kadar satır olmalı.
  const ornek = g.sablonId === undefined ? undefined : ORNEKLER[g.sablonId]
  const hedefSatir = ornek?.kartlar.length ?? HEDEF_SATIR

  const satirlar = [
    // ⚠ ⚠ **AÇILIŞ CÜMLESİ KİPE GÖRE DEĞİŞİYOR ve eskiden değişmiyordu.** Genel kipte
    // de *"marka bilgisine dayanarak"* yazıyordu; model genel bir konuda anlatacak
    // genel bir şey bulamayıp marka konumlandırma notlarını soruya çevirdi ve son
    // satıra satış çağrısı koydu. Gerçek çıktıydı, varsayım değil.
    genel
      ? 'Bir sosyal medya karoseli için ÖĞRETİCİ bir metin yaz.'
      : 'Aşağıdaki marka bilgisine dayanarak bir sosyal medya gönderisi metni yaz.',
    '',
    `KONU: ${g.konu.trim()}`,
    '',
    // ⚠ ⚠ **GENEL KİPTE KAYITLAR BİR KISIT DEĞİL, BİR BAĞLAM** — `konuSecPromptu`
    // aynı ayrımı zaten yapıyordu, yazan istem yapmıyordu. Aynı veriyi iki farklı
    // rolde kullanmak, iki ayrı istem yazmaktan az bozulur.
    ...(genel
      ? [
          'MARKANIN DÜNYASI (konuyu SINIRLAMAZ — yalnız kimin konuştuğunu gösterir;',
          'buradaki cümleleri TEKRARLAMA, satış diline ÇEVİRME):',
        ]
      : ['MARKA BİLGİSİ (yalnız buradaki bilgiyi kullan):']),
    baglam,
    '',
    // ⚠ Öğreticiliğin BİÇİMLERİ tek kaynaktan (`kipTarifi`) — konu seçimi, uyarlama ve
    // bu istem aynı tarifi okuyor. Üç yerde yazılan bir kural iki yerde unutulur.
    ...(g.kip === undefined ? [] : [...kipTarifi(g.kip), '']),
    'BİÇİM (karosel — her satır BİR slayt olur, sırayla):',
    // ⚠ **Uzunluk disiplini prompt'ta olmak ZORUNDA.** Modelden serbest metin isteyip
    // sonra sayfalayıcıya "böl" demek, ilk slayta 12 satırlık bir metin duvarı
    // koyuyordu: kapak bir başlık değil, bir paragraf oluyordu. Sayfalayıcı taşmayı
    // böler (R-30: küçültmez) ama neyin BAŞLIK olduğunu bilemez — o bilgi ancak
    // metnin üretildiği yerde vardır.
    // ⚠ **YAY — dört eşit paragraf yerine bir HİKÂYE** (FAZ-14.1). Eskiden 2.–5. satırın
    // dördü de aynı 30 kelimelik bütçeyi paylaşıyordu; sonuç, her satırı aynı ağırlıkta
    // dört paragraftı. Referans örneklerin hiçbirinde olmayan tek şey buydu — hepsinde
    // satır uzunlukları hikâyenin evresine göre değişiyor.
    //
    // ⚠ Bütçeler BURADA YAZILI DEĞİL: `yayTalimati` onları `@suite/contracts`ten basıyor.
    // Elle yazılsaydı ölçüm ile prompt yeniden iki ayrı yerde tanımlanmış olurdu ve
    // `tasarim-olcum.ts`in eski yorumu (*"icerikPromptu ile AYNI sayılar"*) yine bir
    // temenni olarak kalırdı.
    // ⚠ ⚠ **SATIR SAYISI ŞABLONDAN — sabit 6'dan DEĞİL.** Şablon belliyse kart sayısı
    // da belli; altı satır yazıp dört karta sıkıştırmak, iki satırı çöpe atmak
    // demekti. Şablon yoksa eski sabit duruyor.
    ...yayTalimati(hedefSatir),
    // ⚠ Şablon belliyse ritim ROTASYONDAN değil ŞABLONDAN geliyor: rotasyon bir
    // sonraki şablonu çeşitlendirmek için var; şablon zaten seçilmişse onun kendi
    // biçimini istemek gerekiyor. İkisini birden söylemek modele çelişki vermekti.
    ...(g.sablonId === undefined
      ? ritimTalimati(g.sonSablonlar ?? [], kaynaktaSayiVar(g.kayitlar))
      : sablonBicimi(g.sablonId, g.sonSablonlar ?? [])),
    '- Satırları numaralama, madde işareti koyma.',
    // ⚠ **VURGU — karoselin en büyük tipografik eksiği** (FAZ-12.1). Bugüne kadar her
    // satır aynı ağırlıkta okunuyordu; referanslarda bir ifade her zaman öne çıkar.
    // Sınır dar: her şeyin vurgulandığı bir metinde hiçbir şey vurgulanmamıştır.
    '- Her satırda EN FAZLA bir ifadeyi `**iki üç kelime**` ile işaretle. Satırın',
    '  taşıdığı fikir orada olsun. Bazı satırlarda hiç işaretleme olmayabilir.',
    ...(g.sablonId === undefined
      ? [
          `- Toplam ${String(hedefSatir)} satır. Bir KANIT satırını atlayıp ${String(hedefSatir - 1)} satır da yazabilirsin.`,
        ]
      : [
          // ⚠ Şablon belliyse sayı SABİT: kart sayısı kompozisyonun parçası, bir
          // tercih değil. Bir satır eksik yazmak bir kartı boş bırakmak olurdu.
          `- Toplam TAM ${String(hedefSatir)} satır — ${g.sablonId} şablonu bu kadar kart taşıyor.`,
        ]),
    '',
    // ⚠ **Örnek ve sayım talimatı ÖLÇÜLEREK eklendi.** Yalnız "en fazla 8 kelime"
    // yazmak yetmedi: gerçek koşuda kapak 21, gövde 40 kelime geldi ve tasarım kapısı
    // varlığı reddetti. Kural prompt'ta vardı ama SAYILMASI istenmiyordu; bir üst sınır,
    // sayılmadığı sürece bir temennidir.
    'ÖRNEK BİÇİM (kelime sayıları buna benzemeli):',
    'Duruşun nedeni vardiya amirinin hafızasında',
    'Bir duruş yaşandı ve nedeni soruldu; cevap bir kayıtta değil, dün geceyi kapatan kişinin hatırladığı kadarıyla verildi.',
    'Aynı arıza üç hafta sonra tekrarladığında kimse ilkiyle bağlantısını kuramadı, çünkü ikisi de hiçbir yere yazılmamıştı.',
    'Kaydı olmayan bir duruş, olmamış bir duruştur.',
    '',
    '⚠ Yazmadan önce HER SATIRIN kelimesini say. Sınırı aşan satırı KISALT, bölme.',
    // ⚠ Sayı BURADA DA basılıyor, elle yazılmıyor — bağımsız doğrulama yakaladı:
    // `yayTalimati` tek kaynaktan basıyordu ama bu hatırlatmada `8` elle duruyordu.
    // `KANCA` 10'a çekilseydi prompt kendi kendisiyle çelişir ve hiçbir test kırmızıya
    // dönmezdi — bu adımın önlemeye çalıştığı ayrışmanın aynısı.
    `⚠ İlk satır bir başlıktır, bir paragraf değil: ${islevTavanlari().kanca} kelimeyi geçerse yeniden yaz.`,
    '',
    'KURALLAR:',
    `- Dil: ${g.locale ?? 'tr-TR'}. Doğal, abartısız, teknik ve somut.`,
    '- **Hiçbir sayısal iddia yazma.** Yüzde, oran, kat, "X kat hızlı" gibi ifadeler',
    '  yasak — kaynağı olmayan sayı yayınlanamaz.',
    '- "devrim niteliğinde", "çığır açan", "sektör lideri" gibi abartı terimleri kullanma.',
    '- Emoji kullanma. Hashtag kullanma.',
    // ⚠ ⚠ **SON SATIR SATIŞ ÇAĞRISI OLUYORDU.** Gerçek çıktının son satırı *"Verisi
    // dağınık olan imalatçıyla konuşalım"* idi — markanın satış cümlesi. Öğretici bir
    // karoselin son satırı, okurun ELİNDE KALAN şeydir; bir randevu talebi değil.
    ...(genel
      ? [
          '- Son satır bir SATIŞ ÇAĞRISI DEĞİL: okurun elinde kalan kuralı ya da',
          '  yapabileceği ilk adımı yaz. "…ile konuşalım", "bize ulaşın" yazma.',
          '- Marka adını ve ürün adını ANMA; bu metin bir ders, bir tanıtım değil.',
        ]
      : []),
    ...(g.maxChars === undefined ? [] : [`- En fazla ${g.maxChars} karakter.`]),
    ...(g.kacinilacak === undefined || g.kacinilacak.trim() === ''
      ? []
      : ['', `KAÇIN (geçmiş redlerin gerekçesi): ${g.kacinilacak.trim()}`]),
    '',
    // ⚠ **AKIŞ, fotoğrafın yerini alıyor** (FAZ-11.1). Karosel görselliği stok fotoğrafla
    // değil VERİ ve ŞEMAYLA kuruluyor: dört referans örneğin hiçbirinde dikdörtgen
    // fotoğraf yok. `diagram` çizicisi repoda yazılı ve test edilmişti ama üretim hattı
    // hiç çağırmıyordu — fotoğraf, bağlı olan tek görsel yol olduğu için kullanılıyordu.
    //
    // Sayı İSTENMİYOR: `chart` bloğu veri noktası ister, R-32 kaynaksız sayıyı yasaklar
    // ve corpus'ta sayı yok. Akış diyagramı sayısızdır — engelsiz ve konuya uygun.
    'AKIŞ (ayrı bir bölüm, metinden SONRA yaz):',
    `Konu bir süreç, sıra ya da karşılaştırma içeriyorsa 3–${MAX_DUGUM} adımlık bir akış ver.`,
    'Biçim — her satır bir adım, `AKIŞ:` satırından sonra:',
    'AKIŞ: <başlık>',
    '- <adım adı> | <tek cümlelik çıktısı>',
    'Adım adı en fazla 3 kelime; çıktı en fazla 8 kelime. Sayı YAZMA.',
    'Konu akış içermiyorsa `AKIŞ:` bölümünü hiç yazma — zorlama.',
    '',
    // ⚠ **KARŞILAŞTIRMA — sayı İSTEMEYEN veri ögesi** (FAZ-12.5). Halka, KPI ve ilerleme
    // bir orana dayanıyor; R-32 kaynaksız sayıyı yasaklıyor ve yukarıda zaten "sayı yazma"
    // deniyor. Karşılaştırma yapısal: iki durum, sayı yok. Akıştan farkı da bu — akış bir
    // SIRA anlatır, karşılaştırma bir KARŞITLIK kurar.
    'KARŞILAŞTIRMA (akış YOKSA ve konu bir karşıtlık taşıyorsa; ikisi birden YAZMA):',
    'KARŞILAŞTIRMA: <başlık>',
    'ÖNCE: <durum adı>',
    '- <madde>',
    'SONRA: <durum adı>',
    '- <madde>',
    'Her tarafta 2–3 madde, madde en fazla 6 kelime. Sayı YAZMA.',
    '',
    'Yalnız metni döndür; açıklama, başlık ya da biçimlendirme ekleme.',
  ]
  return satirlar.join('\n')
}

/** Akış bölümünün ayrıştırılmış hâli — `COMPOSE` bunu `diagram` bloğuna çeviriyor. */
export interface AkisDugumu {
  readonly label: string
  readonly detail?: string
}
export interface Akis {
  readonly title: string
  readonly nodes: readonly AkisDugumu[]
}

/**
 * Metin çıktısından `AKIŞ:` bölümünü ayırır.
 *
 * **Satırlar KALDIRILIYOR**: akış satırları slayt metni olarak da basılırsa aynı bilgi
 * iki kez görünür. Ayrıştırıcı hem akışı hem TEMİZLENMİŞ satırları döndürüyor — iki uç
 * aynı yerde (D-243 gerekçesi).
 *
 * Diyagram çizicisi 2 düğümden az ve 6'dan fazlasını reddediyor; burada da aynı sınır
 * uygulanıyor ki geçersiz bir blok hiç kurulmasın.
 */
/** Karşılaştırma — `CompareBlock`in prompt karşılığı. */
export interface Karsilastirma {
  readonly title: string
  readonly once: { readonly label: string; readonly items: readonly string[] }
  readonly sonra: { readonly label: string; readonly items: readonly string[] }
}

/**
 * `KARŞILAŞTIRMA:` bölümünü ayırır — `akisiAyir` ile AYNI seam, aynı dosya.
 *
 * ⚠ Prompt ile ayrıştırıcı bir dikişin iki ucudur ve ayrı dosyalara konulmaz: biri
 * değişip diğeri unutulursa bölüm sessizce metne geri düşer ve çöp görünür.
 */
export const karsilastirmayiAyir = (
  satirlar: readonly string[]
): { readonly satirlar: readonly string[]; readonly karsilastirma: Karsilastirma | null } => {
  const bas = satirlar.findIndex((l) => /^KARŞILAŞTIRMA\s*:/i.test(l.trim()))
  if (bas === -1) return { satirlar, karsilastirma: null }
  const baslik = (satirlar[bas] ?? '').replace(/^KARŞILAŞTIRMA\s*:/i, '').trim()

  const taraf = (etiket: string): { label: string; items: string[]; son: number } | null => {
    const i = satirlar.findIndex(
      (l, n) => n > bas && new RegExp(`^${etiket}\\s*:`, 'i').test(l.trim())
    )
    if (i === -1) return null
    const label = (satirlar[i] ?? '').replace(new RegExp(`^${etiket}\\s*:`, 'i'), '').trim()
    const items: string[] = []
    let son = i
    for (let n = i + 1; n < satirlar.length; n += 1) {
      const m = /^[-•*]\s*(.+)$/.exec((satirlar[n] ?? '').trim())
      if (m === null) break
      son = n
      items.push((m[1] ?? '').trim())
    }
    return { label: label === '' ? etiket : label, items, son }
  }

  const a = taraf('ÖNCE')
  const b = taraf('SONRA')
  const bitis = Math.max(bas, a?.son ?? bas, b?.son ?? bas)
  const temiz = [...satirlar.slice(0, bas), ...satirlar.slice(bitis + 1)]
  // Tek taraflı bir karşılaştırma karşılaştırma değil bir listedir — YOK sayılıyor ama
  // satırlar yine temizleniyor, yarım bir bölüm metne geri düşerse çöp görünür.
  if (a === null || b === null || a.items.length === 0 || b.items.length === 0) {
    return { satirlar: temiz, karsilastirma: null }
  }
  return {
    satirlar: temiz,
    karsilastirma: {
      title: baslik === '' ? 'Karşılaştırma' : baslik,
      once: { label: a.label, items: a.items },
      sonra: { label: b.label, items: b.items },
    },
  }
}

export const akisiAyir = (
  satirlar: readonly string[]
): { readonly satirlar: readonly string[]; readonly akis: Akis | null } => {
  const bas = satirlar.findIndex((l) => /^AKIŞ\s*:/i.test(l.trim()))
  if (bas === -1) return { satirlar, akis: null }

  const baslik = (satirlar[bas] ?? '').replace(/^AKIŞ\s*:/i, '').trim()
  const dugumler: AkisDugumu[] = []
  let son = bas
  for (let i = bas + 1; i < satirlar.length; i += 1) {
    const l = (satirlar[i] ?? '').trim()
    const m = /^[-•*]\s*(.+)$/.exec(l)
    if (m === null) break
    son = i
    const [ad, ayrinti] = (m[1] ?? '').split('|').map((x) => x.trim())
    if (ad === undefined || ad === '') continue
    dugumler.push(
      ayrinti === undefined || ayrinti === '' ? { label: ad } : { label: ad, detail: ayrinti }
    )
  }

  const temiz = [...satirlar.slice(0, bas), ...satirlar.slice(son + 1)]
  // Çizicinin sınırları: <2 tek düğüm sayılır, >6 taşar. Geçersizse akış YOK sayılıyor
  // ama satırlar yine temizleniyor — yarım bir akış metne geri düşerse çöp görünür.
  if (dugumler.length < 2 || dugumler.length > MAX_DUGUM) return { satirlar: temiz, akis: null }
  return { satirlar: temiz, akis: { title: baslik === '' ? 'Akış' : baslik, nodes: dugumler } }
}

/**
 * Görsel brief'ini İSTEYEN prompt — bir METİN modeline gider, görsel modeline değil.
 *
 * **Neden brief'i model yazıyor** (D-241): hat dosyasına sabit prompt yazmak içeriğe
 * kör bir görsel verir; Türkçe konuyu doğrudan görsel modeline vermek belirgin biçimde
 * kötü sonuç veriyor. Brief'i model yazınca R-20 (metin yasağı) ve 9. yasa (yapay
 * insan) kapılarının **ikisi de** o metnin üzerinden geçiyor.
 *
 * ⚠ Brief'in İngilizce istenmesi bir üslup tercihi değil: bake-off'ta ölçüldü.
 * Ve **insansız/metinsiz olması prompt'ta AÇIKÇA isteniyor** — kapılar yine de
 * duruyor, ama bir kapıya çarpmadan geçmek, çarpıp geri dönmekten ucuz.
 */
export const gorselBriefPromptu = (g: PromptGirdisi): string | null => {
  const baglam = baglamBloku(g.kayitlar)
  if (g.konu.trim() === '' || baglam === '') return null
  // ⚠ **YUVA YOKSA BRIEF DE YOK — ve bu bir maliyet kararı kadar bir tasarım kararı.**
  // Plan hiçbir slaytta `gorsel-yuvasi` işaretlememişse görsel üretmek, "her ihtimale
  // karşı bir görsel üret" demektir; D-261'in kusuru tam olarak buydu. `null` dönünce
  // `gorsel-uret` de brief bulamıyor ve zincir kendiliğinden sönüyor — koşucuya
  // "adım atla" yeteneği eklemeye gerek yok.
  if (g.yuva === undefined) return null

  return [
    'Write a single-paragraph ENGLISH prompt for a text-to-image model.',
    '',
    `TOPIC (Turkish): ${g.konu.trim()}`,
    '',
    // ⚠ **YUVA TARİFİ — brief artık nereye gireceğini biliyor.** Eskiden yalnız KONU
    // vardı ve görsel, altı slaytlık bir karoselin hangi cümlesinin yanında duracağını
    // bilmeden üretiliyordu. Görselin desteklemesi gereken şey konu değil O SATIR.
    'SLOT (where this image will be placed — support THIS line, not the topic in general):',
    `- It goes on slide ${g.yuva.slaytIndex + 1} of ${g.yuva.toplam}, whose role in the story is "${g.yuva.islev}".`,
    `- The line it sits beside (Turkish): ${g.yuva.satir.trim()}`,
    '- It fills the width of the text column and is cropped to fill; assume a portrait-ish',
    '  area and keep the subject centred with calm negative space around it.',
    '',
    'BRAND CONTEXT (Turkish, for understanding only — do not translate into the prompt):',
    baglam,
    '',
    'HARD RULES:',
    '- The scene must contain NO PEOPLE. No person, worker, engineer, face or crowd.',
    '- Every surface must be BARE and UNMARKED. Choose a subject whose surfaces carry',
    '  nothing printed, painted or engraved: raw metal, concrete, cable, pipe, machined',
    '  part. Avoid control panels, screens, packaging and shelving — they always carry',
    '  markings even when you do not intend it.',
    // ⚠ **MONOKROM AÇIKÇA isteniyor, "muted" YETMİYOR.** Kabul koşusunda ölçüldü: bir
    // fotoğraf mavi/turuncu makinelerle geldi ve amber marka alanının yanında çarpıştı.
    // Kullanıcının açık şartı "marka şablonunu korumalı, tutarlı olmalı hem kendi içinde
    // hem birbirleriyle" — doygun renkli bir fotoğraf bunu bozuyor.
    //
    // Ham doygunluk ÖLÇÜMÜ ayırt etmedi (iki geçerli örnek %34 ve %30, ikisi de yakın),
    // çünkü fotoğrafların büyük kısmı zaten gri. Ayırt eden şey markanın hue'sundan UZAK
    // doygun piksellerin payı olurdu — ama yarım tasarlanmış bir metrik yazmak yerine
    // KAYNAĞA gidildi: brief zaten renk isteyebiliyordu, istemiyordu.
    '- BLACK AND WHITE or near-monochrome. Desaturated, documentary, photographic.',
    '  No strong colour anywhere: no blue, orange, green or red equipment in view.',
    '  The image sits next to a warm amber brand field — saturated colour fights it.',
    '- Industrial subject, calm even lighting, matte surfaces.',
    '',
    // ⚠ **Yasak kelimeler prompt'un KENDİSİNDE geçmemeli.** R-20 kapısı görsel
    // prompt'unda `text`, `lettering`, `sign` gibi sözcükleri arıyor; brief'i yazan model
    // bu kelimeleri talimattan YANKILIYOR ve kapı kendi talimatımızı reddediyordu.
    // Gerçek koşuda oldu: `IMAGE_PROMPT_REJECTED · matched: "lettering"`. Kapı haklıydı —
    // hatalı olan, yasakladığı kelimeyi kullanan talimattı.
    '⚠ NEVER use these words in your output: text, lettering, sign, signage, label,',
    '  writing, word, letter, caption, watermark, logo. Do not negate them either —',
    '  describe a scene that simply has none, using only positive description.',
    '',
    'Return only the prompt, one paragraph, no quotes and no explanation.',
  ].join('\n')
}

/**
 * Sağlayıcı çıktısını `COMPOSE`un beklediği `{lines}` şekline çevirir.
 *
 * **Şekiller ÖLÇÜLEREK yazıldı**, varsayılmadı (D-227 dersi): Claude Code
 * `--output-format json` ile `{result: "..."}` döndürüyor; ayrıştırılamayan çıktı
 * `{text: "..."}` zarfına giriyor. İkisi de burada tanınıyor.
 *
 * `null` dönmek "metin yok" demek — ve çağıran bunu sessizce ham kayıtlara düşerek
 * değil, açıkça ele almak zorunda.
 */
export const metneCevir = (output: unknown): { readonly lines: readonly string[] } | null => {
  if (output === null || typeof output !== 'object') return null
  const o = output as Record<string, unknown>

  // ⚠ **ZATEN normalize edilmiş çıktı da tanınır.** `generateBody` metin adımının
  // çıktısını `{lines, raw}` yapıyor; bir sonraki adım (görsel) onu okurken ham
  // şekli arıyordu ve boş dönüyordu — **kendi iki fonksiyonum arasında şekil
  // uyuşmazlığı** (D-227'nin birebir tekrarı, bu kez üreticiyle tüketici aynı
  // dosyadaydı). Tek geçitten geçmek, iki şekli de burada tanımayı gerektiriyor.
  if (Array.isArray(o['lines'])) {
    const l = (o['lines'] as unknown[]).filter((x): x is string => typeof x === 'string')
    return l.length === 0 ? null : { lines: l }
  }

  const ham =
    typeof o['result'] === 'string'
      ? o['result']
      : typeof o['text'] === 'string'
        ? o['text']
        : typeof o['content'] === 'string'
          ? o['content']
          : null
  if (ham === null || ham.trim() === '') return null

  const lines = ham
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '')
  return lines.length === 0 ? null : { lines }
}

/**
 * İSTEMİN KENDİ SÖZLÜĞÜ — çıktıda görünürse model işi YAPMIYOR, TARTIŞIYOR.
 *
 * ⚠ ⚠ **BİR RET, METİN SANILDI ve zincir iki adım sonra anlamsız bir yerde çöktü.**
 * Gerçek koşu: `metin-uret` *"Bu format çalışmıyor: MARKA BİLGİSİ'nde hiç sayı yok…
 * İki seçenek var:"* yazdı. Adım `status: ok` oldu, kapı bunu ÜRETİLEN METİN diye
 * insana gösterdi, onaylandı, ve `sablon-uyarla` `ADAPTATION_UNPARSEABLE` ile düştü —
 * yani hata, sebebinden iki adım UZAKTA ve tanınmaz bir isimle göründü.
 *
 * Tespit bir kelime avı DEĞİL: bunlar istemin KENDİ bölüm başlıkları. Gerçek bir
 * gönderi metni "MARKA BİLGİSİ" ya da "BİÇİM KURALI" yazmaz; yazıyorsa model
 * talimatı konuşuyordur. Yanlış pozitif olasılığı, ret'i sessizce geçirmenin
 * bedelinin yanında ihmal edilebilir.
 */
const ISTEM_SOZLUGU: readonly string[] = ['MARKA BİLGİSİ', 'BİÇİM KURALI', 'ÖRNEK BİÇİM', 'KONU:']

/**
 * Model istemi yapmak yerine istem HAKKINDA mı konuştu?
 *
 * `null` = metin temiz. Dize = sızan başlık; çağıran onu hataya koyar ki teşhis
 * çıktının kendisinden okunabilsin.
 */
export const istemSizintisi = (lines: readonly string[]): string | null => {
  for (const l of lines) {
    const bulunan = ISTEM_SOZLUGU.find((k) => l.includes(k))
    if (bulunan !== undefined) return bulunan
  }
  return null
}

/** `metneCevir` sonucundan tek satırlık düz metin — görsel brief'i böyle okunuyor. */
export const duzMetin = (output: unknown): string | null => {
  const m = metneCevir(output)
  return m === null ? null : m.lines.join(' ')
}
