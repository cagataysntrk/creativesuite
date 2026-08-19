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
export const adimCiktisiniYaz = (outDir: string, stepId: string, data: unknown): boolean => {
  if (data === null || data === undefined) return false
  try {
    const dizin = adimDizini(outDir)
    mkdirSync(dizin, { recursive: true })
    writeFileSync(join(dizin, dosyaAdi(stepId)), JSON.stringify(data), 'utf8')
    return true
  } catch {
    return false
  }
}

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
    return JSON.parse(readFileSync(yol, 'utf8')) as unknown
  } catch {
    return null
  }
}
