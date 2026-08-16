// GROUP: fast
// Kapı: politika kararı hat ADIYLA verilemez (§11.2 · R-40 · D-229).
//
// **Bulunan kusur:** `scripts/uret.mjs` reklam metni linter'ını şu satırla açıyordu:
//
//     const REKLAM_HATTI = id === 'ad-creative-set'
//
// Tek bir sabit dize. Ne testi vardı, ne kapısı. Hattı yeniden adlandırmak — ya da
// ikinci bir reklam hattı eklemek — Meta'nın kişisel özellik kuralını **sessizce**
// kapatırdı ve hiçbir şey kırmızıya dönmezdi. Bu, "opsiyonel + testsiz = sessiz
// gerileme" sınıfının en pahalı hâli: yasak, yasağın yokluğuna dönüşür.
//
// **Doğru mekanizma:** karar hat dosyasının kendi beyanı (`cikti_sinifi: reklam`),
// çözücüden `Pipeline.ciktiSinifi` olarak geliyor. Yeniden adlandırma beyanı taşır;
// yeni bir reklam hattı beyanı yazmadan linter'a giremez.
//
// Bu kapı o mekanizmanın **atlanamaz** olmasını sağlıyor: bir hat id'sini dize olarak
// karşılaştıran her satır hatadır. En güçlü koruma, ihlali yazılamaz kılmaktır.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '../..')
const HATLAR = join(REPO, 'registry/pipelines')

const hatIdleri = readdirSync(HATLAR)
  .filter((f) => f.endsWith('.pipeline.yaml'))
  .map((f) => f.replace(/\.pipeline\.yaml$/, ''))

const hatalar = []
if (hatIdleri.length === 0) {
  hatalar.push('registry/pipelines/ altında hat yok — kapı KÖR kalır')
}

/**
 * Taranan yerler: üretim yolları. `packages/registry` HARİÇ — çözücünün kendisi
 * id'leri dosya adından üretiyor ve orada karşılaştırma yok; taramak yalnız gürültü
 * yapardı. Testler de hariç: bir testin `loadPipeline(kok, 'ad-creative-set')` demesi
 * politika kararı değil, fikstür seçimidir.
 */
const KOKLER = ['scripts', 'packages', 'apps']
const HARIC = /node_modules|[/\\]dist[/\\]|\.test\.[tj]sx?$|[/\\]gates[/\\]/

const dosyalar = []
const gez = (yol) => {
  for (const ad of readdirSync(yol)) {
    const tam = join(yol, ad)
    if (HARIC.test(tam)) continue
    if (statSync(tam).isDirectory()) gez(tam)
    else if (/\.(ts|tsx|mjs|js)$/.test(tam)) dosyalar.push(tam)
  }
}
for (const k of KOKLER) gez(join(REPO, k))

/**
 * Yorum satırları SAYILMAZ — bir kapı kendi belgesiyle kandırılmamalı ve kendi
 * belgesini de suçlamamalı.
 */
const yorumMu = (satir) => /^\s*(\/\/|\*|\/\*|#)/.test(satir)

/**
 * **Aranan şey "hat id'sine benzeyen bir dize" değil, KİMLİĞE dayalı karar.**
 *
 * İlk sürüm her dize eşleşmesini yakalıyordu ve `bodies.ts`teki
 * `zincirAdi === 'prospect-deck'` satırını suçladı — oysa orası **doğru** mekanizma:
 * `chain:` hat dosyasında BEYAN edilen bir kısıt ve değerin hat adıyla aynı olması
 * tesadüf. Kapı beyan yolunu cezalandırsaydı, teşvik etmesi gereken şeyi yasaklardı.
 *
 * Bu yüzden karşılaştırmanın diğer ucu `id`/`.id` olmak zorunda: `id === 'x'`,
 * `cozum.value.id !== 'x'`, `['x'].includes(pipeline.id)`.
 */
const KIMLIK = '(?:[\\w$]+\\.)*[iI][dD]'

for (const dosya of dosyalar) {
  const satirlar = readFileSync(dosya, 'utf8').split('\n')
  for (const [i, satir] of satirlar.entries()) {
    if (yorumMu(satir)) continue
    for (const id of hatIdleri) {
      const kacisli = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const lit = `['\"\`]${kacisli}['\"\`]`
      const desen = new RegExp(
        `${KIMLIK}\\s*(?:===|!==|==|!=)\\s*${lit}|` +
          `${lit}\\s*(?:===|!==|==|!=)\\s*${KIMLIK}|` +
          `${lit}[^\\n]*\\.(?:includes|indexOf|has)\\(\\s*${KIMLIK}\\s*\\)`
      )
      if (!desen.test(satir)) continue
      hatalar.push(
        `${relative(REPO, dosya)}:${i + 1}  hat id'si '${id}' ile karşılaştırma — ` +
          `politika hattın ADINDAN okunamaz; hat dosyası beyan eder, çözücü taşır ` +
          `(D-229). Yeniden adlandırma bu satırı sessizce kapatır.`
      )
    }
  }
}

// ── Ters yön: beyan mekanizması GERÇEKTEN kullanılıyor mu ────────────────────
//
// Kapının yeşili baktığı yerin doğruluğunu göstermez: hiçbir hat `cikti_sinifi: reklam`
// demezse yukarıdaki tarama da yeşil kalır ve reklam linter'ı üretimde HİÇ koşmaz.
const reklamHatlari = hatIdleri.filter((id) =>
  readFileSync(join(HATLAR, `${id}.pipeline.yaml`), 'utf8')
    .split('\n')
    .some((s) => /^\s*cikti_sinifi:\s*reklam\s*$/.test(s))
)
if (reklamHatlari.length === 0) {
  hatalar.push(
    "hiçbir hat `cikti_sinifi: reklam` demiyor — reklam metni linter'ı üretimde " +
      'hiç ateşlenemez (§11.2); mekanizma var, kullanıcısı yok'
  )
}

const uret = readFileSync(join(REPO, 'scripts/uret.mjs'), 'utf8')
if (!/ciktiSinifi\s*===\s*'reklam'/.test(uret)) {
  hatalar.push(
    "scripts/uret.mjs `ciktiSinifi === 'reklam'` okumuyor — beyan hat dosyasında " +
      'duruyor ama üretim yolu onu görmüyor (D-228 ile aynı sınıf)'
  )
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} kimlik bağımlılığı — hat adı bir sözleşme değildir`)
  process.exit(1)
}
console.log(
  `✓ hat-kimligi: ${dosyalar.length} dosyada id karşılaştırması yok · ` +
    `${reklamHatlari.length} hat reklam beyanı taşıyor`
)
