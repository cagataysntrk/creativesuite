// Adım çıktıları diske yazılır — **tekrar oynatmada kaybolmasınlar** (§13 · R-07).
//
// ⚠ ⚠ **BU EKSİKLİK YAZILIYDI ve tam olarak öngörüldüğü gibi ısırdı.** `scheduler.ts`
// içindeki not aynen şunu diyordu:
//
//   > *"Ücretli kayıtlarda sınır duruyor ve bu bir EKSİKLİK: çıktı deftere
//   > yazılmadığı için ücretli bir adım tekrar oynatıldığında aşağı akış boş kalır.
//   > Doğru çözüm çıktıyı `derived/runs/<run>/steps/` altına yazmak — bugün yok ve
//   > olmadığını söylemek, varmış gibi davranmaktan iyi."*
//
// Ölçülen sonuç: insan `metin-onayi` kapısını onayladı, hat `--devam` ile sürdü ve
// `bilgi-sec` **`MISSING_TOPIC`** ile düştü. Çünkü `konu-sec` (ücretli GENERATE)
// defterden `data: null` ile "oynatıldı" ve agent'ın seçtiği konu buharlaştı. Aynı
// sebeple daha önce `sablon-uyarla` `ADAPTATION_UNPARSEABLE` vermişti: `metin-uret`in
// satırları da kaybolmuştu. **Yani her kapı, arkasındaki zinciri sessizce kesiyordu.**
//
// Defterin işi ÖDEMEYİ tekrarlamamak; İŞİN SONUCUNU unutmak değil.
//
// ⚠ `derived/runs/` türetilmiş DEĞİLDİR ve silinmez (Yasa 11 · R-52) — bu dosyalar da
// defterin parçası. Manifest ÖZETİ taşımaya devam ediyor (D-136): tam çıktı manifeste
// gömülseydi dosya şişer ve `git diff` okunamaz olurdu.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Yazılabilecek en büyük çıktı.
 *
 * ⚠ ⚠ **İLK SÜRÜM HER ŞEYİ YAZDI ve `repo-hygiene` kapısı onu aynı gün yakaladı:**
 * `yuva-doldur.json` 3,9 MB, `gorsel-kirp*.json` 0,6–1,1 MB — çünkü bu çıktılar
 * base64 görsel taşıyor. R-64 512 KB üstü izlenen dosyayı yasaklıyor ve haklı:
 * defter `git`e giriyor, byte'lar `derived/blobs`a.
 *
 * ⚠ **Kayıp yok:** büyük çıktı üreten adımlar (görsel üretimi, kırpma) işleri süreci
 * AŞMAYAN sağlayıcılarda koşuyor (`islerKalici: false`), yani sürdürmede zaten
 * yeniden çağrılıyorlar. Kaybolan tek şey metin çıktılarıydı ve onlar küçük.
 */
const TAVAN_BAYT = 256 * 1024

/**
 * Gömülü BYTE taşıyan çıktı deftere hiç girmez — tavanın altında olsa bile.
 *
 * ⚠ ⚠ **TAVAN YETMEDİ.** `gorsel-uret` çıktısı 220 KB: tavanın altında, yani
 * yazılıyordu — koşu başına dört görsel × ~200 KB base64 defterde birikiyor ve
 * `git` bunu sonsuza kadar taşıyor. Oysa bu byte'lar defterde HİÇ GEREKMİYOR:
 * görsel sağlayıcıları `islerKalici: false`, yani sürdürmede adım zaten yeniden
 * koşuyor; ayrıca byte'ın kendisi `derived/blobs`ta içerik-adresli duruyor.
 *
 * ⚠ Kontrol ŞEKLE bakıyor, anahtar ADINA değil: `format: 'base64'` bugünkü şekil,
 * yarın `image_base64` olabilir. Uzun ve base64 alfabesinden bir dize, bir metin
 * çıktısı değildir.
 */
const gomuluByte = (data: unknown): boolean => {
  if (data === null || typeof data !== 'object') return false
  for (const v of Object.values(data as Record<string, unknown>)) {
    if (typeof v === 'string' && v.length > 4096 && /^[A-Za-z0-9+/=\s]+$/.test(v.slice(0, 512))) {
      return true
    }
  }
  return false
}

/** Bir çalıştırmanın adım çıktıları dizini. */
export const adimDizini = (outDir: string): string => join(outDir, 'steps')

/**
 * Gömülü byte'ı deftere DEĞİL, içerik-adresli depoya koyan geçit.
 *
 * ⚠ ⚠ **D20: BU OLMADAN ONAY BİR ŞEY İFADE ETMİYORDU.** `gorsel-uret`in girdi özeti
 * üç geçişte de aynıydı (`39a8c02e`), çıktısı her seferinde farklıydı
 * (`2c1d3c70` → `c642914f` → …): insan `tasarim-onayi`nde gördüğü slaytları
 * onaylıyor, yayına BAŞKA slaytlar gidiyordu. Sebep, byte taşıyan çıktının deftere
 * yazılmaması (R-64) ve dolayısıyla tekrar oynatmada "çıktı yok" görünmesiydi.
 *
 * Byte artık `derived/blobs`a iniyor, deftere yalnız ADRESİ giriyor. Depo
 * verilmezse eski davranış aynen sürüyor — bu bir geçit, bir varsayım değil.
 */
export interface BaytDeposu {
  /** Base64 gövdeyi saklar, adresini döner. `null` = saklanamadı. */
  readonly yaz: (base64: string) => string | null
  /** Adresi çözer. `null` = byte yok; adım yeniden koşar (dürüst cevap). */
  readonly oku: (adres: string) => string | null
}

/** Deftere giren yer tutucu. Bir byte değil, bir ADRES. */
interface BaytAdresi {
  readonly __bayt: string
  readonly uzunluk: number
}

const baytAdresiMi = (v: unknown): v is BaytAdresi =>
  v !== null && typeof v === 'object' && typeof (v as { __bayt?: unknown }).__bayt === 'string'

const BASE64_SEKLI = /^[A-Za-z0-9+/=\s]+$/

/** Dönüşüm sırasında bir adres çözülemedi mi — `throw` yerine taşınan bayrak. */
interface DonusumDurumu {
  eksik: boolean
}

/**
 * Byte'ları adrese çevirir (yazarken) ya da adresleri byte'a (okurken).
 *
 * ⚠ Dönüşüm ŞEKLE bakıyor, anahtar ADINA değil — `gomuluByte` ile aynı gerekçe:
 * `format: 'base64'` bugünkü şekil, yarın `image_base64` olabilir.
 * ⚠ Derinlik SINIRLI (8): kendine referans veren bir nesne sonsuz döngü yapardı ve
 * bir defter yazıcısının asılması, koşuyu sessizce durdurur.
 */
const donustur = (
  data: unknown,
  yon: 'yaz' | 'oku',
  depo: BaytDeposu,
  durum: DonusumDurumu,
  derinlik = 0
): unknown => {
  if (derinlik > 8) return data
  if (Array.isArray(data)) return data.map((v) => donustur(v, yon, depo, durum, derinlik + 1))
  if (data === null || typeof data !== 'object') return data
  if (yon === 'oku' && baytAdresiMi(data)) {
    const b = depo.oku(data.__bayt)
    // ⚠ ÇÖZÜLEMEYEN ADRES = ÇIKTI YOK. Yarım bir nesne dönmek, aşağı akışa `data:
    // null` taşıyan bir görsel vermek olurdu — bu deponun defalarca ısırdığı hata.
    if (b === null) durum.eksik = true
    return b
  }
  const cikti: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (
      yon === 'yaz' &&
      typeof v === 'string' &&
      v.length > 4096 &&
      BASE64_SEKLI.test(v.slice(0, 512))
    ) {
      const adres = depo.yaz(v)
      // Saklanamadıysa YER TUTUCU YAZILMIYOR: çözülemeyecek bir adres, olmayan bir
      // kayıttan kötüdür — okuma onu `null` görür ve zincir sessizce boş kalırdı.
      if (adres === null) {
        durum.eksik = true
        return data
      }
      cikti[k] = { __bayt: adres, uzunluk: v.length } satisfies BaytAdresi
      continue
    }
    cikti[k] = donustur(v, yon, depo, durum, derinlik + 1)
  }
  return cikti
}

/**
 * Dosya adı adım id'sinden türetiliyor ve **temizleniyor**: adım id'leri hat
 * dosyasından geliyor, yani dış girdi sayılmasa da yol ayracı taşıyabilir.
 */
const dosyaAdi = (stepId: string): string => `${stepId.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`

/**
 * Adım çıktısını yazar. Sessizce başarısız olur — kayıt tutamamak işi durdurmaz,
 * ama bir sonraki tekrar oynatmada çıktı bulunamaz ve zincir yine kesilir. Bu yüzden
 * çağıran hatayı YUTMUYOR: `false` dönüyor ve iz satırına yazılıyor.
 */
/**
 * Yazma sonucu — **"yazılmadı" ile "yazılamadı" ayrı şeyler.**
 *
 * ⚠ Gerçek koşuda iz satırı `⚠ yuva-doldur çıktısı diske yazılamadı — tekrar
 * oynatmada kaybolur` diyordu; oysa atlama BİLİNÇLİYDİ (gömülü byte) ve o adım
 * sürdürmede zaten yeniden koşuyor. Bir uyarı, doğru olmadığında gürültüdür ve
 * gürültü okunmaz olur.
 */
export type YazmaSonucu = 'yazildi' | 'atlandi' | 'yazilamadi'

export const adimCiktisiniYazDurum = (
  outDir: string,
  stepId: string,
  data: unknown,
  depo?: BaytDeposu
): YazmaSonucu => {
  if (data === null || data === undefined) return 'atlandi'
  try {
    const dizin = adimDizini(outDir)
    mkdirSync(dizin, { recursive: true })
    const yol = join(dizin, dosyaAdi(stepId))
    // ⚠ Byte deposu VARSA gömülü byte artık bir engel değil: adrese çevrilip
    // yazılıyor. Yoksa aşağıdaki eski davranış — atlama — aynen sürüyor.
    if (depo !== undefined && gomuluByte(data)) {
      const durum: DonusumDurumu = { eksik: false }
      const adresli = donustur(data, 'yaz', depo, durum)
      if (durum.eksik) return 'yazilamadi'
      const govde = JSON.stringify(adresli)
      // Adrese çevrildikten sonra hâlâ tavanı aşıyorsa sorun byte değil, VERİ.
      if (govde.length <= TAVAN_BAYT) {
        writeFileSync(yol, govde, 'utf8')
        return 'yazildi'
      }
    }
    if (gomuluByte(data)) {
      writeFileSync(
        yol,
        JSON.stringify({
          buyuk: true,
          sebep:
            'çıktı gömülü byte taşıyor — defterde gerekmiyor: byte `derived/blobs`ta, ' +
            'adım sürdürmede zaten yeniden koşuyor',
        }),
        'utf8'
      )
      return 'atlandi'
    }
    const govde = JSON.stringify(data)
    if (govde.length > TAVAN_BAYT) {
      // ⚠ Tavanı aşan çıktı SESSİZCE atlanmıyor: yerine ne olduğunu söyleyen bir
      // işaretçi yazılıyor. Boş bir dizin "hiç koşmadı" diye okunurdu.
      writeFileSync(
        yol,
        JSON.stringify({
          buyuk: true,
          bayt: govde.length,
          sebep: 'çıktı tavanı aşıyor (gömülü byte) — bu adım sürdürmede yeniden koşar',
        }),
        'utf8'
      )
      return 'atlandi'
    }
    writeFileSync(yol, govde, 'utf8')
    return 'yazildi'
  } catch {
    return 'yazilamadi'
  }
}

/** Geriye dönük ince sarmalayıcı: yalnız "yazıldı mı" sorusunu soranlar için. */
export const adimCiktisiniYaz = (outDir: string, stepId: string, data: unknown): boolean =>
  adimCiktisiniYazDurum(outDir, stepId, data) === 'yazildi'

/**
 * Adım çıktısını okur. `null` = kayıt yok.
 *
 * ⚠ Bozuk JSON de `null` dönüyor: yarım bir çıktıyı zincire vermek, hatayı iki adım
 * sonra tanınmaz bir isimle göstermek olurdu — bu depoda tam olarak böyle bir hata
 * (`ADAPTATION_UNPARSEABLE`) sebebinden uzakta görünmüştü.
 */
export const adimCiktisiniOku = (outDir: string, stepId: string, depo?: BaytDeposu): unknown => {
  const yol = join(adimDizini(outDir), dosyaAdi(stepId))
  if (!existsSync(yol)) return null
  try {
    const v = JSON.parse(readFileSync(yol, 'utf8')) as unknown
    // ⚠ İşaretçi bir çıktı DEĞİL: zincire verilirse `{buyuk:true}` bir belge modeli
    // sanılır ve hata iki adım sonra tanınmaz bir isimle görünür.
    if (v !== null && typeof v === 'object' && (v as { buyuk?: unknown }).buyuk === true) {
      return null
    }
    if (depo === undefined) return v
    const durum: DonusumDurumu = { eksik: false }
    const acilmis = donustur(v, 'oku', depo, durum)
    return durum.eksik ? null : acilmis
  } catch {
    return null
  }
}
