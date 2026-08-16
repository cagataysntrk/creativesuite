#!/usr/bin/env node
// `just doctor` gövdesi — bulguların TAMAMI `doktorRaporu`ndan gelir (FAZ-4.17).
//
// Bu betiğin kendi denetimi YOKTUR ve olmamalı: Doctor ekranı ile `just doctor` aynı
// bulguları göstermek zorunda (adımın ✅ kriteri). İki kopya olsaydı biri güncellenip
// diğeri unutulduğunda kabuk "temiz" derken ekran "kırık" derdi — D-185'in tekrarı.
//
// Buradaki tek iş: kabuğun bilebileceği olguları (git) toplayıp modüle VERMEK.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { doktorRaporu, doktorMetni } = await import(join(REPO, 'packages/engine/dist/index.js'))
const { systemClock, openDb } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const gitSayi = (args) => {
  try {
    return Number(
      execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
        .length
    )
  } catch {
    return null
  }
}
const pushEdilmemis = (() => {
  try {
    return Number(
      execFileSync('git', ['rev-list', '--count', '@{u}..HEAD'], {
        cwd: REPO,
        encoding: 'utf8',
      }).trim()
    )
  } catch {
    return null // upstream yok — modül bunu KRİTİK sayar, sessiz geçmez
  }
})()

const MARKA = 'brd_upcytech'
const eraYolu = join(REPO, `brand/${MARKA}/current`)
const aktifEra = existsSync(eraYolu) ? readFileSync(eraYolu, 'utf8').trim() : null

// İndeks yolu `durum.ts` ile AYNI olmak zorunda: farklı bir yol yazmak, doctor'ın
// hep "indeks yok" demesi ve ayrışmayı hiç görmemesi demekti.
const indeksYolu = join(REPO, 'derived/index/suite.db')
// **SALT OKUR** (D-233). Doctor rapor eder, değiştirmez (§16) — ve bu bir üslup
// kuralı değil: `readonly` geçilmediğinde `openDb` dizini yaratıyor ve WAL pragmasını
// yazıyordu. Salt-okur bir kurtarma diskinde `just doctor` ÇÖKÜYORDU; oysa o disk,
// aracın en çok gerektiği yer. `doctor-salt-okur` kapısı çağrıları denetliyordu,
// çağrının ALTINDAKİ yazmayı görmüyordu.
const db = existsSync(indeksYolu) ? openDb({ path: indeksYolu, readonly: true }) : null

const rapor = doktorRaporu({
  repoRoot: REPO,
  bugun: systemClock.nowIso().slice(0, 10),
  // Tam an: token ömrü gün değil AN meselesi. `just token-durum` ile aynı cevabı
  // vermek zorunda — iki rapor bir günü farklı sayarsa ikisi de güvenilmez olur.
  simdi: systemClock.nowIso(),
  aktifEra,
  db,
  git: {
    pushEdilmemis,
    commitlenmemisDefterSatiri: gitSayi(['status', '--porcelain', 'derived/runs']),
  },
})

// ── haftalık iş modu (§16 · FAZ-8.4) ────────────────────────────────────────
//
// **Hiçbir daemon doğruluk tutmaz** (12. yasa) ve bu betik hiçbir şey YAZAMAZ
// (`doctor-salt-okur`). O yüzden "en son ne zaman koştu" bilgisi hiçbir yerde
// saklanmıyor — saklansaydı, o damga bir doğruluk kaynağı olurdu ve silindiğinde
// sistem "hiç koşmadı" ile "damga kayboldu"yu ayırt edemezdi.
//
// **Haftalık tetik bir ALARM SAATİDİR, doğruluk kaynağı değil.** Kullanıcının kendi
// makinesindeki bir `cron` satırı bu komutu koşturur; komut idempotent ve ucuz, o
// yüzden fazladan koşması zarar vermez ve kaçırması telafi edilebilir — tek maliyet
// bir haftalık gecikme. Kurulum `docs/referans/` altında değil, aşağıda: kurulumu
// otomatikleştirmek, kullanıcının makinesine izinsiz bir iş yazmak olurdu.
//
// `--json`: makine-okunur çıktı. Bir cron satırı bunu bir dosyaya yazabilir; betik
// KENDİSİ yazmaz — yazsaydı salt-okur olmaktan çıkardı.
const jsonMod = process.argv.includes('--json')
if (jsonMod) {
  console.log(
    JSON.stringify(
      {
        bugun: rapor.bugun,
        kritik: rapor.kritik,
        uyari: rapor.uyari,
        bulgular: rapor.bulgular,
        kosanDenetimler: rapor.kosanDenetimler,
        atlananDenetimler: rapor.atlananDenetimler,
      },
      null,
      2
    )
  )
  process.exit(0)
}

const durum = existsSync(join(REPO, 'DURUM.md')) ? readFileSync(join(REPO, 'DURUM.md'), 'utf8') : ''
const alan = (ad) => (new RegExp(`^${ad}: *(.*)$`, 'm').exec(durum)?.[1] ?? '?').trim()

console.log(doktorMetni(rapor))
console.log(
  `  aktif faz ${alan('aktif_faz')} · sıradaki ${alan('siradaki_adim')} · bloke ${alan('bloke')}`
)
// Doctor **rapor eder**; çıkış kodu her zaman 0. Kritik bulguda kırmızıya dönseydi
// `just doctor` bir kapıya dönerdi — oysa kapılar `just check`te ve doctor'ın işi
// bir ay sonra dönen kullanıcıya TABLO göstermek, kapıyı kapatmak değil.
//
// ── haftalık kurulum (kullanıcı kendi makinesinde, bir kez) ──────────────────
//   crontab -e
//   0 9 * * 1  cd <repo> && just doctor >> ~/.upcytech-doctor.log 2>&1
//
// Cron bir alarm saatidir: doğruluk tutmaz, yalnız hatırlatır. Kaçırılan bir hafta
// telafi edilebilir; komut idempotent ve hiçbir şey değiştirmiyor.
console.log('')
console.log('  Haftalık koşturmak için (bir kez, kendi makinenizde):')
console.log('    0 9 * * 1  cd ' + REPO + ' && just doctor >> ~/.upcytech-doctor.log 2>&1')
console.log('  ⚠ Kurulumu bu komut YAPMAZ: kullanıcının makinesine izinsiz iş yazılmaz.')
