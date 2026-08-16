// Reklam metni linter'ı — SESSİZ reddin önüne geçer (§11.2 · R-32, R-35 · FAZ-8.2).
//
// **Sessiz red, sebebini söylemeyen bir reddir.** Meta bir reklamı "kişisel özellik"
// gerekçesiyle reddettiğinde hangi cümlenin sorun olduğunu söylemiyor; kampanya durur,
// sebep bilinmez ve deneme yanılma başlar. Kural deterministik olarak lintlenebiliyorsa
// kapı BİZDE olmalı, onlarda değil.
//
// **Asıl incelik: saf ikinci şahıs YASAK DEĞİL.** "Ürünü deneyin", "Demoyu izleyin"
// tamamen meşru. Yasak olan, ikinci şahsın bir **kişisel özellik** ile birleşmesi:
// "Borçlarınızdan kurtulun" muhatabına finansal durum ATFEDİYOR. Meta'nın kuralı
// "assert **or imply** personal attributes" diyor ve ima, Türkçe'de iyelik ekiyle
// geliyor — `borçlarınız`, `hastalığınız`, `kilonuz`.
//
// Bu yüzden dedektör TEK başına ne ikinci şahsı ne alan sözcüğünü arar; **kesişimi**
// arar. Yalnız ikinci şahsa bakan bir linter her reklamı reddeder ve kapatılır; yalnız
// alan sözcüğüne bakan bir linter "KOBİ'lerin finansman erişimi" gibi meşru üçüncü
// şahıs cümlelerini reddeder.
//
// **Çözüm de metinde:** üçüncü şahsa çevir. "Borçlarınızdan kurtulun" → "Borç yükünü
// azaltan işletmeler için". Linter bunu söylüyor, çünkü sebebini söylemeyen bir ret
// bizim kapımızda da olmamalı.

import { foldForSearch } from '@suite/kernel'

export type ReklamIhlali =
  /** İkinci şahıs + kişisel özellik alanı. **Bloklayıcı.** */
  | {
      readonly kind: 'personal_attribute'
      readonly alan: string
      readonly kanit: string
      readonly oneri: string
    }
  /** Niteliksiz üstünlük iddiası — kaynak yoksa bloklayıcı. */
  | { readonly kind: 'unqualified_superlative'; readonly ifade: string }
  /** Önce/sonra dönüşüm çerçevelemesi. **Bloklayıcı.** */
  | { readonly kind: 'before_after'; readonly kanit: string }
  /**
   * Görselde metin kaplama oranı. **UYARI — bloklayıcı DEĞİL.**
   *
   * Meta'nın %20 kuralı **artık bir red sebebi değil**; blocker yapmak geçerli
   * reklamları reddetmek olurdu. Ama zayıf kreatifin hâlâ en iyi göstergesi, o yüzden
   * uyarı olarak duruyor.
   */
  | { readonly kind: 'text_coverage'; readonly oran: number }

/**
 * Kişisel özellik alanları (Meta Advertising Standards).
 *
 * Irk, din, cinsel yönelim, engellilik, **sağlık durumu** ve **finansal durum** —
 * son ikisi B2B lead-gen'de en sık tökezlenen ikisi, çünkü masum görünüyorlar:
 * "nakit akışı sıkıntınız" bir finansal durum atfıdır.
 */
export const OZELLIK_ALANLARI: Readonly<Record<string, readonly string[]>> = {
  // Kökler **kelime başına** çapalanıyor (`\bborc`), çünkü Türkçe eklemeli:
  // `borçlarınızdan` tek kelimedir ve tam eşleşme onu kaçırırdı.
  finans: ['borc', 'kredi', 'icra', 'haciz', 'iflas', 'nakit sikintisi', 'batak'],
  saglik: ['hastalik', 'obezite', 'depresyon', 'agri', 'tedavi', 'bagimlilik'],
  engellilik: ['engelli', 'ozurlu'],
  din: ['dindar', 'musluman', 'hristiyan', 'yahudi', 'ateist'],
  koken: ['turk kokenli', 'suriyeli', 'gocmen', 'multeci'],
  yonelim: ['escinsel', 'lgbt', 'transseksuel'],
}

/**
 * **Diyakritik katlamanın yok ettiği ayrımlar — bilinçli olarak listede DEĞİL.**
 *
 * `foldForSearch` `ü→u` yapıyor ve `Kürt` ile `kurtul-` aynı dizeye düşüyor:
 * "Borçlarınızdan **kurtul**un" cümlesi köken ihlali sanılıyordu. Aynı sınıf:
 * `kilo` (`kilogram`, `kilometre`), `sakat` (`sakatlık` spor bağlamı), `zarar`
 * (`zarar görmüş parça` — imalatın günlük sözcüğü).
 *
 * **Kaçırmak, yanlış yakalamaktan iyidir** — ama yalnız burada: her cümlede ateşleyen
 * bir linter ilk haftada kapatılır ve o zaman hiçbir kuralı korumaz. Kaçan durumlar
 * insan onay kuyruğunda görülür; kapatılmış bir linter hiçbir yerde görülmez.
 */
export const KATLAMA_CAKISMASI: readonly string[] = ['kurt', 'kilo', 'sakat', 'zarar']

/**
 * İkinci şahıs işaretleri — **iyelik ve soru ekleri dâhil**.
 *
 * Türkçe'de muhataba atıf çoğu zaman ayrı bir sözcük değil, EK: `borçlarınız` tek
 * kelimedir ve "siz" geçmez. Yalnız zamir arayan bir dedektör bunu kaçırır.
 *
 * ⚠ **Ek sonrası KELİME SONU ARANMAZ.** İlk sürüm `iniz\b` istiyordu ve
 * `borçlarınız**dan**` eşleşmiyordu: Türkçe eklemeli bir dil, iyelik ekinden sonra
 * durum eki gelir. Kelime sonuna çapalanan bir Türkçe eki deseni, en tipik cümleyi
 * kaçırır — dedektörün ilk hâli faz dosyasının kendi ihlal örneğinde patladı.
 *
 * Metin `foldForSearch`ten geçiyor: `ı→i`, `ü→u`, `ö→o`. O yüzden yalnız ASCII
 * biçimleri aranıyor; aksanlı varyantları ayrıca yazmak ölü kod olurdu.
 */
const IKINCI_SAHIS = /(?:\b(?:siz|sizin|size|sizi)\b|iniz|unuz|m[iu](?:siniz|sunuz))/

/** Niteliksiz üstünlük — kaynak yoksa iddia, kaynak varsa ölçüm. */
const USTUNLUK = /\b(?:en\s+(?:iyi|hizli|ucuz|guclu|buyuk|gelismis)|bir\s+numara|rakipsiz|essiz)\b/

/** Önce/sonra dönüşüm çerçevelemesi. */
const ONCE_SONRA =
  /\b(?:oncesi\s*(?:ve|\/|-)?\s*sonrasi|once\b[^.]{0,40}\bsonra\b|dan\s+.{0,20}\s*ya\s+donusum)\b/

/** Metin kaplama uyarı eşiği. Red sebebi DEĞİL — zayıf kreatif göstergesi. */
export const KAPLAMA_UYARI_ORANI = 0.2

export interface ReklamKurallari {
  /** Sayısal iddia kaynağı. `null` = kaynak yok → üstünlük iddiası bloklanır. */
  readonly claimSource: string | null
  /** Ölçülen metin kaplama oranı (0–1). Verilmezse denetim ATLANIR, "temiz" DEĞİL. */
  readonly textCoverage?: number
}

/** Bloklayıcı mı — uyarı ile ret aynı listede durur ama aynı şey değildir. */
export const bloklayici = (i: ReklamIhlali): boolean => i.kind !== 'text_coverage'

export const reklamLint = (metin: string, kurallar: ReklamKurallari): readonly ReklamIhlali[] => {
  const ihlaller: ReklamIhlali[] = []
  // Diyakritik katlama: `borçlarınız` ile `borclariniz` aynı metindir ve saldırgan
  // olmayan bir yazım hatası kuralı atlatmamalı.
  const duz = foldForSearch(metin)

  const ikinciSahis = IKINCI_SAHIS.test(duz)
  if (ikinciSahis) {
    for (const [alan, sozcukler] of Object.entries(OZELLIK_ALANLARI)) {
      // Kelime BAŞINA çapalı: `borclarinizdan` yakalanır, `kurtulun` içindeki
      // `kurt` yakalanmaz (o zaten listede değil, ama çapa ikinci savunma).
      const bulunan = sozcukler.find((s) => new RegExp(`\\b${s}`).test(duz))
      if (bulunan === undefined) continue
      ihlaller.push({
        kind: 'personal_attribute',
        alan,
        kanit: bulunan,
        // Çözümü söylemeyen bir ret, sessiz reddin bizdeki kopyası olurdu.
        oneri: `üçüncü şahsa çevir: muhataba '${bulunan}' atfetme, o durumdaki İŞLETMELERDEN söz et`,
      })
    }
  }

  const ust = USTUNLUK.exec(duz)
  if (ust !== null && kurallar.claimSource === null) {
    ihlaller.push({ kind: 'unqualified_superlative', ifade: ust[0] })
  }

  const os = ONCE_SONRA.exec(duz)
  if (os !== null) ihlaller.push({ kind: 'before_after', kanit: os[0] })

  // **Ölçülmediyse denetim ATLANIR** (D-175): `undefined`ı "eşiğin altında" saymak,
  // hiç ölçülmemiş bir kreatifi temiz göstermek olurdu.
  if (kurallar.textCoverage !== undefined && kurallar.textCoverage > KAPLAMA_UYARI_ORANI) {
    ihlaller.push({ kind: 'text_coverage', oran: kurallar.textCoverage })
  }

  return ihlaller
}

export const reklamIhlalMesaji = (i: ReklamIhlali): string => {
  switch (i.kind) {
    case 'personal_attribute':
      return `kişisel özellik ataması (${i.alan}: "${i.kanit}") — Meta bunu SESSİZCE reddeder; ${i.oneri}`
    case 'unqualified_superlative':
      return `niteliksiz üstünlük: "${i.ifade}" — kaynaksız üstünlük bir iddiadır (R-32)`
    case 'before_after':
      return `önce/sonra çerçevelemesi: "${i.kanit}" — dönüşüm vaadi kısıtlı kategoride`
    case 'text_coverage':
      return `metin kaplama %${Math.round(i.oran * 100)} — UYARI, red sebebi değil: Meta %20 kuralını artık uygulamıyor ama zayıf kreatifin göstergesi`
  }
}
