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
const db = existsSync(indeksYolu) ? openDb({ path: indeksYolu }) : null

const rapor = doktorRaporu({
  repoRoot: REPO,
  bugun: systemClock.nowIso().slice(0, 10),
  aktifEra,
  db,
  git: {
    pushEdilmemis,
    commitlenmemisDefterSatiri: gitSayi(['status', '--porcelain', 'derived/runs']),
  },
})

const durum = existsSync(join(REPO, 'DURUM.md')) ? readFileSync(join(REPO, 'DURUM.md'), 'utf8') : ''
const alan = (ad) => (new RegExp(`^${ad}: *(.*)$`, 'm').exec(durum)?.[1] ?? '?').trim()

console.log(doktorMetni(rapor))
console.log(
  `  aktif faz ${alan('aktif_faz')} · sıradaki ${alan('siradaki_adim')} · bloke ${alan('bloke')}`
)
// Doctor **rapor eder**; çıkış kodu her zaman 0. Kritik bulguda kırmızıya dönseydi
// `just doctor` bir kapıya dönerdi — oysa kapılar `just check`te ve doctor'ın işi
// bir ay sonra dönen kullanıcıya TABLO göstermek, kapıyı kapatmak değil.
