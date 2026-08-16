// GROUP: fast
// Kişiselleştirme tavanı KURAL KİTABIYLA eşleşiyor mu (R-36 · D-214 · FAZ-6.7).
//
// **Bu kapı bir sayıyı değil, bir KAYNAK İLİŞKİSİNİ zorluyor.** Tavan sayısı
// `KURALLAR.md`'deki R-36 satırında yaşıyor; koddaki sabit onun bir kopyası. Kopya ile
// asıl ayrışırsa, kural kitabı kuralı bilmeyen bir belgeye dönüşür — ve bu projede
// kural kitabının tek işi kuralı bilmek.
//
// Adımın 🧪 kriteri bu yüzden "tavanı 6 yap → kod değişmesin" değil, **"kod değişirse
// kural kitabı da değişmek zorunda"**: sabiti 6 yapan biri bu kapıda durur ve
// `KURALLAR.md`'yi değiştirmeye zorlanır (R-74).

import { readFileSync, globSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')

const hatalar = []

// ── 1. kural kitabındaki sayı ────────────────────────────────────────────────
const kurallar = readFileSync(join(REPO, 'KURALLAR.md'), 'utf8')
const kuralBlok = /### R-36 · [^\n]*\n([\s\S]*?)(?=\n### |\n---)/.exec(kurallar)
if (kuralBlok === null) {
  hatalar.push('KURALLAR.md: R-36 bulunamadı — tavanın kaynağı yok')
}
const kuralSayi = kuralBlok === null ? null : /en fazla \*\*(\d+)\*\*/.exec(kuralBlok[1])
if (kuralBlok !== null && kuralSayi === null) {
  hatalar.push("KURALLAR.md R-36: sayı 'en fazla **N**' biçiminde yazılmamış — kapı okuyamıyor")
}

// ── 2. koddaki sabit ─────────────────────────────────────────────────────────
const KOD = 'packages/kernel/src/personalization.ts'
const kod = readFileSync(join(REPO, KOD), 'utf8')
const kodSayi = /export const KISISELLESTIRME_TAVANI = (\d+)/.exec(kod)
if (kodSayi === null) {
  hatalar.push(`${KOD}: KISISELLESTIRME_TAVANI sabiti bulunamadı`)
}

// ── 3. eşleşiyorlar mı ───────────────────────────────────────────────────────
if (kuralSayi !== null && kodSayi !== null && kuralSayi[1] !== kodSayi[1]) {
  hatalar.push(
    `tavan AYRIŞMIŞ: KURALLAR.md R-36 → ${kuralSayi[1]} · ${KOD} → ${kodSayi[1]}. ` +
      `Tavanı değiştirmenin tek yolu ÖNCE kural kitabını değiştirmektir (R-74).`
  )
}

// ── 4. sayı koda ikinci kez sızmış mı ────────────────────────────────────────
// **Sabit dosya listesi YAZILMADI**: ilk sürümüm üç dosya adı sayıyordu ve biri
// (`freshness.ts`) aynı turda taşınınca kapı ENOENT ile çöktü — bakım tuzağı, koruma
// değil. Tüm kaynak taranıyor; ikinci bir tanım nerede olursa olsun görünür.
const kaynaklar = globSync('packages/*/src/**/*.ts', { cwd: REPO }).filter(
  (f) => !f.endsWith('.test.ts')
)
for (const rel of kaynaklar) {
  if (rel === KOD) continue
  if (
    /(?:const|let|var)\s+KISISELLESTIRME_TAVANI\s*=/.test(readFileSync(join(REPO, rel), 'utf8'))
  ) {
    hatalar.push(`${rel}: tavan ikinci kez tanımlanmış — tek kaynak KURALLAR.md R-36`)
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} R-36 bulgusu`)
  process.exit(1)
}

console.log(`✓ kisisellestirme: tavan ${kodSayi[1]} · kaynak KURALLAR.md R-36 · kod ile eşleşiyor`)
