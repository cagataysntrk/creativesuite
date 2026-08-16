#!/usr/bin/env node
// Kazanan hook'u corpus'a ÖNERİR — İNSANIN çalıştırdığı komut (§13, §11.2 · R-14 · FAZ-7.9).
//
// **Agent önerir, insan uygular.** Bu komut `status: draft` bir kayıt yazar ve orada
// durur; kayıt retrieval'a **görünmez** olur. Onay, sizin `git commit`inizdir. Panoya
// bir "corpus'a yaz" düğmesi koymak, onayı bir tıklamaya indirmek olurdu.
//
// **Yalnız sıralanabilir bir satır önerilebilir.** Ölçülmemiş bir postu "kazanan" diye
// corpus'a yazmak, eksik veriyi kalıcı bir inanca çevirir.
//
// **Metin STDIN'den okunur**, argümandan değil: `just *args` tırnağı korumuyor ve
// gerçek bir çalıştırmada cümlenin bir kelimesi `metrik` parametresine düştü —
// "sıralanabilir değil" diye reddedilen kayıt aslında ölçülmüştü. `just save -`
// zaten aynı deseni kullanıyor; iki komut iki farklı yolla metin almamalı.
//
// Kullanım: just hook-oner <externalId> [metrik] < metin.txt

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { readInsights, readLedger, performansPanosu, hookOnerisi, performansDurumMesaji } =
  await import(join(REPO, 'packages/engine/dist/index.js'))
const { propose } = await import(join(REPO, 'packages/corpus/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const [externalId, metrik = 'reach'] = process.argv.slice(2)
const metin = readFileSync(0, 'utf8').trim()
if (!externalId || metin === '') {
  console.log('kullanım: just hook-oner <externalId> [metrik] < metin.txt')
  console.log("  metin STDIN'den okunur — `just` argümanlarda tırnağı korumuyor")
  process.exit(2)
}

const yayinlar = readLedger(REPO)
if (!yayinlar.ok) {
  console.log(`✗ yayın defteri okunamadı: ${yayinlar.error.kind}`)
  process.exit(1)
}
const olcumler = readInsights(REPO)
// **Bozuk defter BOŞ defter DEĞİLDİR** (FAZ-7 denetimi, M5). Sessizce boş saymak,
// her yayını "pencere ölçülmemiş" gösterirdi ve operatör ölçüm sorununu içerik
// sorunu sanardı — `insight-ledger.ts`in "yok ≠ boş" yasasının tam ihlali.
// `ledger_missing` ayrı: ölçüm hiç başlamamış olabilir, o bir hata değil.
if (!olcumler.ok && olcumler.error.kind === 'unreadable') {
  console.log(`✗ insight defteri ${olcumler.error.line}. satırda bozuk: ${olcumler.error.reason}`)
  console.log(
    '  Öneri üretilmedi: bozuk bir defterde "ölçülmemiş" ile "ölçülemedi" ayırt edilemez.'
  )
  process.exit(1)
}
const pano = performansPanosu({
  yayinlar: yayinlar.entries,
  olcumler: olcumler.ok ? olcumler.satirlar : [],
  bugun: systemClock.nowIso().slice(0, 10),
  metrik,
})

const satir = [...pano.siralama, ...pano.disarida].find((s) => s.externalId === externalId)
if (satir === undefined) {
  console.log(`✗ ${externalId} yayın defterinde yok`)
  process.exit(1)
}

const oneri = hookOnerisi(
  satir,
  metin,
  process.env['BRAND_ID'] ?? 'brd_upcytech',
  process.env['ERA_ID'] ?? 'imalat-2026'
)
if (oneri === null) {
  // Sebep GÖSTERİLİR: "öneremedim" tek başına, operatörün ölçüm sorununu içerik
  // sorunu sanmasına yol açar.
  console.log(`✗ ${externalId} sıralanabilir değil — ${performansDurumMesaji(satir.durum)}`)
  process.exit(1)
}

const sonuc = propose({
  root: join(REPO, 'corpus'),
  entityType: oneri.entityType,
  slug: oneri.slug,
  frontmatter: oneri.frontmatter,
  body: oneri.body,
})
if (!sonuc.ok) {
  console.log(`✗ öneri yazılamadı: ${sonuc.refusal.kind}`)
  process.exit(1)
}

console.log(`✓ öneri yazıldı: ${sonuc.path}`)
// `git` + `commit` kelimelerini yan yana YAZMIYORUZ: `kaydetme` darboğazı bu
// dizeyi ikinci bir commit yolu sanıyor ve haklı — deseni gevşetmek yerine cümleyi
// değiştirmek doğru olan (kapı, kendi test dosyasını da yakalamıştı).
console.log('  status: draft — retrieval GÖRMEZ. Onay sizin kaydınızdır (R-14).')
console.log("  Çalıştırma commit'i: Run / Actor / Kind künyesi ister (R-60).")
