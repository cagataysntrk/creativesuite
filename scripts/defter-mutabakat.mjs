#!/usr/bin/env node
// `just defter-mutabakat` — YARIDA KALMIŞ maliyet kayıtlarını insanla kapatır (§8.5).
//
// **Neden gerekiyor:** bir çalıştırma ortasında ölürse (SIGKILL, elektrik, `timeout`)
// defterde `possibly-charged` bir kayıt kalır ve `externalId` yoktur. O anda sistem
// tahmin etmeyi REDDEDİYOR ve haklı: "uçmadı" dersek çift ödeme riski, "uçtu" dersek
// üretilmemiş bir varlığı üretilmiş sayarız. Sonraki koşu `NEEDS_RECONCILIATION` ile
// duruyor — fail-closed, doğru davranış.
//
// **Ama çıkış yolu olmalıydı ve yoktu.** Bir kapı, arkasında kapı olmayan bir duvar
// olamaz: kullanıcı defteri elle düzenlemek zorunda kalırdı ve o an defter bir kanıt
// olmaktan çıkardı.
//
// **Karar İNSANINDIR** (R-14): bu komut sağlayıcı panelini SORGULAMAZ ve tahmin
// yürütmez. Kayıtları listeler, insan hangisinin gerçekten ödenmediğini söyler.
//
// Kullanım:
//   just defter-mutabakat                    # yarıda kalanları LİSTELER, değiştirmez
//   just defter-mutabakat --odenmedi <key>   # "bu çağrı uçmadı" — kayıt yeniden açılır
//   just defter-mutabakat --odenmedi-hepsi   # hepsi için aynı beyan (dikkatli kullan)

import { join } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
const { openDb } = await import(join(REPO, 'packages/kernel/dist/index.js'))
const { settle } = await import(join(REPO, 'packages/engine/dist/index.js'))
const { ZERO_USD } = await import(join(REPO, 'packages/contracts/dist/index.js'))

const YOL = join(REPO, 'derived/index/ledger.db')
const db = openDb({ path: YOL })

// Yarıda kalmış = çağrı uçtu mu bilinmiyor. `external_id` varsa sağlayıcıya
// sorulabilir; yoksa yalnız insan bilir.
const yarim = db
  .prepare(
    `SELECT idempotency_key, run_id, step_id, provider_id, capability, external_id, created_at
       FROM cost_ledger WHERE charge_status = 'possibly-charged' ORDER BY created_at`
  )
  .all()

const bayrak = (ad) => process.argv.includes(`--${ad}`)
const deger = (ad) => {
  const i = process.argv.indexOf(`--${ad}`)
  return i === -1 ? null : (process.argv[i + 1] ?? null)
}

if (yarim.length === 0) {
  console.log('✓ yarıda kalmış kayıt yok — defter temiz')
  process.exit(0)
}

const hedefKey = deger('odenmedi')
const hepsi = bayrak('odenmedi-hepsi')

if (hedefKey === null && !hepsi) {
  console.log(`── yarıda kalmış ${yarim.length} kayıt ──\n`)
  for (const r of yarim) {
    console.log(`  ${r.idempotency_key}`)
    console.log(
      `    ${r.step_id} · ${r.provider_id} · ${r.capability} · ${r.created_at}` +
        (r.external_id === null ? ' · tutamak YOK' : ` · tutamak ${r.external_id}`)
    )
  }
  console.log('\n  Bu kayıtlar bir sonraki koşuyu NEEDS_RECONCILIATION ile durdurur.')
  console.log('  Sağlayıcı panelinden çağrının uçup uçmadığını doğrulayın, sonra:')
  console.log('    just defter-mutabakat --odenmedi <anahtar>   # uçmadıysa')
  console.log('  ⚠ Bu komut sağlayıcıya SORMAZ ve tahmin YÜRÜTMEZ — karar sizin (R-14).')
  process.exit(0)
}

const hedefler = hepsi ? yarim.map((r) => r.idempotency_key) : [hedefKey]
let acilan = 0
for (const k of hedefler) {
  const kayit = yarim.find((r) => r.idempotency_key === k)
  if (kayit === undefined) {
    console.log(`  ⊘ ${k} — yarıda kalmış kayıtlar arasında yok, atlandı`)
    continue
  }
  // **`not-charged` yazılıyor, `possibly-charged` DEĞİL.** İkincisi kaydı yine
  // "bilinmiyor" kovasına koyar ve sonraki koşu yine mutabakat ister — kapıyı açar
  // gibi görünüp kapatmak olurdu. `not-charged` = "iş yapılmadı"; motor onu görünce
  // yeniden deniyor (D-242). Kayıt SİLİNMİYOR: defter append-only kanıttır (R-52).
  settle(db, k, ZERO_USD, 'not-charged')
  console.log(`  ✓ ${k} · ${kayit.step_id} — "ödenmedi" beyan edildi, tekrar denenecek`)
  acilan++
}
console.log(`\n${acilan} kayıt yeniden açıldı. Kayıtlar SİLİNMEDİ — defter kanıttır.`)
