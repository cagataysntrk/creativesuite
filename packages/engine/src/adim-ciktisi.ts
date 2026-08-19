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
  data: unknown
): YazmaSonucu => {
  if (data === null || data === undefined) return 'atlandi'
  try {
    const dizin = adimDizini(outDir)
    mkdirSync(dizin, { recursive: true })
    const yol = join(dizin, dosyaAdi(stepId))
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
export const adimCiktisiniOku = (outDir: string, stepId: string): unknown => {
  const yol = join(adimDizini(outDir), dosyaAdi(stepId))
  if (!existsSync(yol)) return null
  try {
    const v = JSON.parse(readFileSync(yol, 'utf8')) as unknown
    // ⚠ İşaretçi bir çıktı DEĞİL: zincire verilirse `{buyuk:true}` bir belge modeli
    // sanılır ve hata iki adım sonra tanınmaz bir isimle görünür.
    if (v !== null && typeof v === 'object' && (v as { buyuk?: unknown }).buyuk === true) {
      return null
    }
    return v
  } catch {
    return null
  }
}
