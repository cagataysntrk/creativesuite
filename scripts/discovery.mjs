#!/usr/bin/env node
// `just discovery` girişi — keşif PLANI basar, HİÇBİR ŞEY YAZMAZ (§4.4 · R-47).
//
// Neden `just plan discovery` değil: `plan` bir PIPELINE alır ve pipeline'lar
// `registry/pipelines/` altında yaşar. Keşif bir pipeline değil, marka DNA'sının
// yeniden üretimidir; onu pipeline listesine sokmak, `just plan` çıktısının anlamını
// ikiye bölerdi (D-81).
//
// Çalışma ağacına dokunmadığı GÖRÜLEBİLİR olsun diye: komut kendi başına `git status`
// çalıştırmaz, ama çıktısının sonunda ne yazdığını açıkça söyler — "yazmadım" demek
// yetmez, ne yapmadığını yazmak gerekir.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { buildDiscoveryPlan, formatDiscoveryPlan } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)

// Üç alt komut (§4.4): plan (öneri üret) · review (kaydedilmiş planı oku) ·
// apply (planı DRAFT olarak yaz). `apply` bile onay değildir — onay insanın commit'i.
const altKomut = process.argv[2] ?? 'plan'
if (!['plan', 'review', 'apply'].includes(altKomut)) {
  console.log(`✗ bilinmeyen alt komut: ${altKomut}`)
  console.log('  kullanım: just discovery plan [merge|mirror] [adaylar] [mevcut]')
  console.log('            just discovery review <plan.json>')
  console.log('            just discovery apply  <plan.json> <icerik.json>')
  process.exit(1)
}

if (altKomut !== 'plan') {
  const { reviewOps, applyPlan, formatApply, formatDiscoveryPlan } = await import(
    join(REPO, 'packages/engine/dist/index.js')
  )
  const planYolu = process.argv[3] ?? ''
  if (planYolu === '' || !existsSync(planYolu)) {
    console.log(`✗ plan dosyası yok: ${planYolu || '(verilmedi)'}`)
    process.exit(1)
  }
  const kayitliPlan = JSON.parse(readFileSync(planYolu, 'utf8'))

  if (altKomut === 'review') {
    console.log(formatDiscoveryPlan(kayitliPlan))
    console.log(`\n  ${reviewOps(kayitliPlan).length} op incelemede · bu komut HİÇBİR ŞEY yazmadı.`)
    process.exit(0)
  }

  const icerikYolu = process.argv[4] ?? ''
  if (icerikYolu === '' || !existsSync(icerikYolu)) {
    console.log(`✗ içerik dosyası yok: ${icerikYolu || '(verilmedi)'}`)
    console.log(
      '  apply, op gövdelerini içerik dosyasından okur — plan yalnız NE yapılacağını söyler.'
    )
    process.exit(1)
  }
  const icerikler = new Map(Object.entries(JSON.parse(readFileSync(icerikYolu, 'utf8'))))
  const rapor = applyPlan(kayitliPlan, icerikler, join(REPO, 'corpus'))
  console.log(formatApply(rapor))
  process.exit(rapor.refused > 0 ? 1 : 0)
}

const mode = process.argv[3] ?? 'merge'
if (mode !== 'merge' && mode !== 'mirror') {
  console.log(`✗ bilinmeyen mod: ${mode}\n  kullanım: just discovery plan [merge|mirror]`)
  process.exit(1)
}

const MARKA = 'brd_upcytech'
const CURRENT = join(REPO, `brand/${MARKA}/current`)
if (!existsSync(CURRENT)) {
  console.log(`✗ aktif dönem yok: brand/${MARKA}/current`)
  process.exit(1)
}
const eraSlug = readFileSync(CURRENT, 'utf8').trim()

// Adaylar bir keşif çalıştırmasından gelir (FAZ-2.9). Bugün yoklar ve bu SESSİZCE
// "0 op" diye gösterilmez — boş bir plan ile değişmemiş bir corpus aynı şey değildir.
//
// İkinci ve üçüncü argüman aday/mevcut listelerini dosyadan alır. Sebep kolaylık değil
// KANIT: "ikinci çalıştırma 0 op üretir" FAZ 2'nin çıkış kriteridir ve corpus doğmadan
// (FAZ-2.9) gerçek komutla gösterilemezdi.
const adayYolu = process.argv[4] ?? 'derived/runs/discovery-candidates.json'
const mevcutYolu = process.argv[5] !== undefined && process.argv[5] !== '' ? process.argv[5] : null
const oku = (rel) => {
  const tam = rel.startsWith('/') ? rel : join(REPO, rel)
  return existsSync(tam) ? JSON.parse(readFileSync(tam, 'utf8')) : null
}
const adaylar = oku(adayYolu)
// Mevcut kayıtlar CORPUS'tan taranır. Argümanla beslemek "ikinci koşu 0 op" kanıtını
// sahte yapıyordu: gerçek yedi kayıt o yola hiç girmiyordu (2. doğrulama turu).
// Argüman yine kabul ediliyor ama yalnız TEST içindir ve çıktıda söylenir.
const { scanCorpus } = await import(join(REPO, 'packages/corpus/dist/index.js'))
const tarama = scanCorpus(join(REPO, 'corpus'), REPO)
// İmza BÜTÜNLÜĞÜ plan yolunda da doğrulanır (§4.4 · D-177). Önceden yalnız yazma yolu
// (`write.ts`) reddediyordu; plan ekranı "update" gösterip insanın emeğini üzerine
// yazacakmış gibi görünüyordu. Kırık imza planı DURDURUR.
const { parseFrontmatter, signatureIntact } = await import(
  join(REPO, 'packages/corpus/dist/index.js')
)
const imzaDurumu = (rel) => {
  try {
    const p = parseFrontmatter(readFileSync(join(REPO, rel), 'utf8'))
    if (!p.ok || p.value.frontmatter === null) return undefined
    if (p.value.frontmatter.x_signature === undefined) return undefined
    return signatureIntact(p.value.frontmatter, p.value.body) === false
  } catch {
    return undefined
  }
}

const mevcutlar = (mevcutYolu === null ? tarama.records : (oku(mevcutYolu) ?? [])).map((r) => {
  const kirik = mevcutYolu === null ? imzaDurumu(r.path) : undefined
  return kirik === undefined ? r : { ...r, signatureBroken: kirik }
})
if (mevcutYolu !== null) {
  console.log('  ⚠ mevcut liste DOSYADAN okundu — gerçek corpus taranmadı (test yolu)')
}
if (tarama.skipped.length > 0 && mevcutYolu === null) {
  for (const s of tarama.skipped) console.log(`  ⚠ atlandı: ${s.path} — ${s.reason}`)
}

// Sticky karar defteri (§4.5) — reddedilen öneri tekrar sorulmaz.
const DEFTER = join(REPO, `brand/${'brd_upcytech'}/decisions.jsonl`)
const { parseLedger } = await import(join(REPO, 'packages/engine/dist/index.js'))
const defterSonuc = existsSync(DEFTER)
  ? parseLedger(readFileSync(DEFTER, 'utf8'))
  : { ledger: undefined, badLines: [] }
if (defterSonuc.badLines.length > 0) {
  console.log(`✗ decisions.jsonl bozuk satır: ${defterSonuc.badLines.join(', ')}`)
  console.log('  Atlanan bir red kaydı, insanın hayır dediği öneriyi tekrar sormaktır.')
  process.exit(1)
}

const plan = buildDiscoveryPlan({
  runId: 'run_discovery_dry',
  brandId: MARKA,
  eraSlug,
  mode,
  existing: mevcutlar,
  candidates: adaylar ?? [],
  ...(defterSonuc.ledger === undefined ? {} : { ledger: defterSonuc.ledger }),
})

console.log(formatDiscoveryPlan(plan))

// İmza kırıksa plan UYGULANAMAZ ve bu SESSİZ kalmaz (§4.4). Uyarı verip devam etmek,
// insanın elle yazdığını motorun üzerine yazması demekti.
if (plan.halted.length > 0) {
  console.log('')
  console.log(`  ✗ PLAN DURDU — ${plan.halted.length} kaydın imzası kırık:`)
  for (const h of plan.halted) console.log(`    ${h.path}\n      ${h.reason}`)
  process.exit(1)
}

// Plan `--kaydet <yol>` ile diske yazılabilir; `review` ve `apply` onu okur.
// Varsayılan olarak YAZILMAZ: `plan` komutunun "hiçbir şey yazmaz" iddiası,
// istisnasız olmadıkça iddia değildir.
const kaydetIdx = process.argv.indexOf('--kaydet')
if (kaydetIdx !== -1) {
  const hedef = process.argv[kaydetIdx + 1]
  if (hedef === undefined) {
    console.log('✗ --kaydet bir yol istiyor')
    process.exit(1)
  }
  writeFileSync(hedef, `${JSON.stringify(plan, null, 2)}\n`)
  console.log(`  plan kaydedildi: ${hedef}`)
}
console.log('')
if (adaylar === null) {
  console.log("  ⚠ aday listesi YOK — keşif çalıştırması FAZ-2.9'da koşacak.")
  console.log('    Yukarıdaki plan boş bir corpus üzerindedir; "değişiklik yok" demek')
  console.log('    DEĞİLDİR. İkisini karıştırmak, hiç koşmamış bir motoru çalışıyor sanmaktır.')
}
console.log('  Bu komut hiçbir dosya YAZMADI: sıfır ağ, sıfır yazma, sıfır commit.')
