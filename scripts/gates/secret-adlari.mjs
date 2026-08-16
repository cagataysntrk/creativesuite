// GROUP: fast
// Kapı: kasadaki anahtar ADLARI kodun okuduğuyla eşleşmeli (§14 · R-51 · D-236).
//
// **Bulunan tuzak — ve bunu iki doğrulama turu da bulamadı.**
// `secrets.enc.yaml` `CLOUDFLARE_API_TOKEN` diye bir anahtar taşıyordu; kod
// `CF_API_TOKEN` okuyor. `CF_ACCOUNT_ID` ise kasada hiç yoktu. Yani kullanıcı
// token'ını mevcut satıra yazsaydı:
//   · `sops exec-env` onu ortama koyar,
//   · hiçbir kod o adı okumaz,
//   · adaptör `MISSING_CREDENTIALS` der,
//   · ve kullanıcı "anahtarı koydum ama çalışmıyor" ile baş başa kalır.
// **Yapılandırılmış sanılan bir sır, yapılandırılmamış sırdan kötüdür.**
//
// `secret-rotasyon` bu tuzağı göremezdi çünkü o **kod ↔ RUNBOOK** ekseninde bakıyor.
// Bu kapı üçüncü ekseni kapatıyor: **kasa ↔ kod**. Üç köşesi olan bir üçgende iki
// kenarı denetlemek, üçüncüsünün doğru olduğunu göstermez.
//
// ⚠ **Kasa AÇILMIYOR.** Anahtar ADLARI sops'ta düz metindir (`.sops.yaml`: yalnız
// DEĞERLER şifrelenir — git diff hangi anahtarın eklendiğini gösterir, değerini
// göstermez). Bu kapı yalnız adları okur; `sops -d` çağırmaz, age anahtarı istemez
// ve CI'da da koşabilir.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '../..')
const KASA = join(REPO, 'secrets/secrets.enc.yaml')

if (!existsSync(KASA)) {
  console.log('⊘ secret-adlari: secrets.enc.yaml yok — kapı KOŞMADI (kasa kurulmamış)')
  process.exit(0)
}

/**
 * Kasadaki üst düzey anahtar adları. `sops` meta bloğu (`sops:`) hariç: o bir
 * sır değil, şifreleme defteridir.
 */
const kasaAdlari = new Set(
  readFileSync(KASA, 'utf8')
    .split('\n')
    .map((s) => /^([A-Z][A-Z0-9_]{2,}):/.exec(s)?.[1])
    .filter((x) => x !== undefined)
)

// ── kodda okunan adlar ───────────────────────────────────────────────────────
//
// Desen kümesi `secret-rotasyon` ile AYNI olmak zorunda: iki kapı aynı soruyu farklı
// desenlerle sorarsa, birinin gördüğünü diğeri görmez ve hangisinin haklı olduğu
// belirsizleşir.
const kaynaklar = []
const yur = (d) => {
  for (const ad of readdirSync(d)) {
    if (ad === 'node_modules' || ad === 'dist' || ad === '.git') continue
    const t = join(d, ad)
    if (statSync(t).isDirectory()) yur(t)
    else if (/\.(ts|tsx|mjs|sh)$/.test(t) && !t.includes('.test.')) kaynaklar.push(t)
  }
}
for (const k of ['packages', 'apps', 'scripts']) yur(join(REPO, k))

const yorumsuz = (metin) =>
  metin
    .split('\n')
    .filter((satir) => !/^\s*(\/\/|\*|\/\*|#)/.test(satir))
    .join('\n')

const koddaOkunan = new Set()
for (const dosya of kaynaklar) {
  const metin = yorumsuz(readFileSync(dosya, 'utf8'))
  for (const m of metin.matchAll(/readEnv\(\s*'([A-Z][A-Z0-9_]{3,})'/g)) koddaOkunan.add(m[1])
  for (const m of metin.matchAll(/env\[\s*'([A-Z][A-Z0-9_]{3,})'\s*\]/g)) koddaOkunan.add(m[1])
  for (const m of metin.matchAll(/process\.env\[\s*'([A-Z][A-Z0-9_]{3,})'\s*\]/g))
    koddaOkunan.add(m[1])
  for (const m of metin.matchAll(/process\.env\.([A-Z][A-Z0-9_]{3,})/g)) koddaOkunan.add(m[1])
  for (const m of metin.matchAll(/const\s+[A-Za-z_]*ENV\s*=\s*'([A-Z][A-Z0-9_]{3,})'/g))
    koddaOkunan.add(m[1])
}

// Sağlayıcı tanımlayıcıları `auth_env:` ile anahtar ADI beyan ediyor.
const saglayicilar = join(REPO, 'registry/providers')
if (existsSync(saglayicilar)) {
  for (const f of readdirSync(saglayicilar).filter((x) => x.endsWith('.yaml'))) {
    const metin = readFileSync(join(saglayicilar, f), 'utf8')
    for (const m of metin.matchAll(/^\s*auth_env:\s*([A-Z][A-Z0-9_]{3,})/gm)) koddaOkunan.add(m[1])
  }
}

/**
 * **Bilinçli olarak parked anahtarlar** — her biri bir GEREKÇE ve bir hedef taşır.
 *
 * Beyansız bir muafiyet, muafiyet değil bir deliktir. Bu liste boşaldıkça kasa
 * kodla tam örtüşür; dolduğunda ise ne beklediğimiz **yazılı** olur.
 */
const BEKLEYEN = {
  GROQ_API_KEY:
    'ASR bağlantısı yazılmadı (V-22 → FAZ-5.5b): whisper.cpp kurulu değil, Groq ' +
    'adaptörü yok. Anahtar geldiğinde kod yazılacak.',
  R2_ACCESS_KEY_ID:
    'R2 senkronu HİÇ YAZILMADI (FAZ-3.12b). Bu iki anahtar o eksikliğin tek izidir — ' +
    'kapı onları bulmasa, 3.12nin başlığındaki iddia sessiz kalacaktı.',
  R2_SECRET_ACCESS_KEY: 'aynı — FAZ-3.12b',
  ANTHROPIC_API_KEY:
    'D-8: akıl gerektiren adımlar Claude Code ABONELİĞİ üzerinden koşuyor, API ' +
    'anahtarıyla değil. Bugün hiçbir kod yolu bunu okumuyor; SDK yoluna geçilirse ' +
    'gerekir. **Kaldırılabilir** — karar kullanıcının (R-14).',
}

const hatalar = []

// ── ASIL SORU: kasada olup kodun okumadığı ad var mı ─────────────────────────
//
// Bu yön hatadır çünkü sessizdir: anahtar yerinde durur, kimse okumaz ve kimse
// bunu söylemez. Ters yön (kodda var, kasada yok) zaten gürültülü başarısız olur —
// adaptör `MISSING_CREDENTIALS` der ve kullanıcı görür.
for (const ad of [...kasaAdlari].sort()) {
  if (koddaOkunan.has(ad)) continue
  if (ad in BEKLEYEN) {
    console.log(`  · ${ad} bilerek bekliyor — ${BEKLEYEN[ad]}`)
    continue
  }
  hatalar.push(
    `${ad} kasada var ama HİÇBİR KOD onu okumuyor — ölü ad. Sırrı buraya yazan kişi ` +
      'onu yapılandırdığını sanır; oysa ortama iner ve kimse bakmaz (D-236)'
  )
}

// Uyarı yönü: sağlayıcı `auth_env` beyan ediyor ama kasada karşılığı yok. Hata DEĞİL —
// henüz alınmamış bir anahtar meşru bir durumdur ve gürültülü bir kapı kapatılır.
//
// İşletim sistemi ve yapılandırma değişkenleri bu listeden ÇIKARILIYOR: `PATH` bir sır
// değil ve kasada olması da beklenmiyor. Gürültü, kapının okunmamasının ilk adımıdır.
const SIR_DEGIL = /^(PATH|HOME|SUITE_|BRAND_ID|ERA_ID|RESEARCH_SRC)/
const eksik = [...koddaOkunan].filter((a) => !kasaAdlari.has(a) && !SIR_DEGIL.test(a)).sort()

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} ölü anahtar adı — kasa ile kod ayrışmış`)
  process.exit(1)
}
console.log(
  `✓ secret-adlari: ${kasaAdlari.size} kasa anahtarının hepsi kodda okunuyor` +
    (eksik.length > 0 ? ` · ${eksik.length} ad henüz kasada yok (${eksik.join(', ')})` : '')
)
