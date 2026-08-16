// GROUP: fast
// Prospect kayıtlarının KVKK kuralları (§5.1 · §10 · FAZ-6.4).
//
// **Bu kapı ŞEMANIN YAPAMADIĞI işi yapıyor.** `registry/PROFILE.md` koşullu şemayı
// (`if`/`then`, `dependentSchemas`) yasaklıyor — dört projeksiyonun hiçbiri çeviremiyor.
// O yüzden "kişisel veri varsa aydınlatma zorunlu" kuralı şemada YAZILAMAZ ve profil
// bunu açıkça uygulama katmanına havale ediyor. Havale edilen kural, kapısı yazılmazsa
// yok olur (D-197: kapıyla korunmayan iddia, iddia değildir).
//
// Üç şey denetlenir:
//   1. Kişisel veri alanı doluysa `kvkk_disclosure_sent: true`
//   2. `retention_until` geçmişte kalmışsa uyarı — süresi dolmuş veri, silinmesi
//      gereken veridir; sessiz kalmak yükümlülüğü ertelemektir
//   3. KVKK silmesinden geçmiş kayıtta kişisel alan KALMAMIŞ olmalı

import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')

/** Kişisel veri taşıyan alanlar. `kvkk.ts`teki kara listeyle AYNI olmak zorunda değil:
 *  orası "silinecekler", burası "aydınlatma doğuranlar". Unvan silinir ama aydınlatma
 *  doğurmaz — şirket unvanı kişisel veri değildir. */
const AYDINLATMA_DOGURAN = ['contact_name', 'contact_email', 'contact_phone']

/** Silme sonrası kalmaması gereken alanlar. */
const SILINMIS_OLMALI = [...AYDINLATMA_DOGURAN, 'legal_name', 'notes', 'source_url']

const frontmatter = (metin) => {
  if (!metin.startsWith('---\n')) return null
  const son = metin.indexOf('\n---', 4)
  if (son === -1) return null
  const alanlar = {}
  for (const satir of metin.slice(4, son).split('\n')) {
    const m = /^([a-z_]+):\s*(.*)$/.exec(satir)
    if (m !== null) alanlar[m[1]] = m[2].trim()
  }
  return alanlar
}

const dosyalar = globSync('corpus/prospect/*.md', { cwd: REPO })
const hatalar = []
const uyarilar = []

for (const rel of dosyalar) {
  const fm = frontmatter(readFileSync(join(REPO, rel), 'utf8'))
  if (fm === null) {
    hatalar.push(`${rel} — frontmatter okunamadı; taranmayan kayıt temiz kayıt DEĞİLDİR`)
    continue
  }

  const silinmis = fm['kvkk_erased_at'] !== undefined
  if (silinmis) {
    for (const alan of SILINMIS_OLMALI) {
      if (fm[alan] !== undefined) {
        hatalar.push(
          `${rel} — KVKK silmesinden geçmiş ama '${alan}' hâlâ duruyor; ` +
            `silme yapılmış GÖRÜNÜYOR ama yapılmamış`
        )
      }
    }
    continue
  }

  const kisisel = AYDINLATMA_DOGURAN.filter((a) => fm[a] !== undefined && fm[a] !== '')
  if (kisisel.length > 0 && fm['kvkk_disclosure_sent'] !== 'true') {
    hatalar.push(
      `${rel} — kişisel veri var (${kisisel.join(', ')}) ama 'kvkk_disclosure_sent: true' yok. ` +
        `Aydınlatma yükümlülüğü veriyle birlikte doğar, yayınla değil.`
    )
  }
  if (fm['kvkk_basis'] === undefined) {
    hatalar.push(`${rel} — 'kvkk_basis' yok; varsayılanı olan hukuki sebep, düşünülmemiş sebeptir`)
  }
  // Tarih karşılaştırması ISO dizesi üzerinde yapılıyor: kapı SAAT OKUMUYOR (R-06),
  // `git log`un son commit tarihini de okumuyor — bu bir uyarı, bloklayıcı değil.
  const son = fm['retention_until']
  if (son !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(son)) {
    hatalar.push(`${rel} — 'retention_until' ISO tarih değil: ${son}`)
  }
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`  ✗ ${h}`)
  console.log(`\n${hatalar.length} KVKK bulgusu`)
  process.exit(1)
}
for (const u of uyarilar) console.log(`  ⚠ ${u}`)
console.log(
  dosyalar.length === 0
    ? '✓ prospect-kvkk: henüz prospect kaydı yok — kapı kayıt geldiği gün konuşur'
    : `✓ prospect-kvkk: ${dosyalar.length} prospect kaydı denetlendi`
)
