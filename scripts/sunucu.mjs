#!/usr/bin/env node
// `just dev` girişi — komuta merkezi API'si (FAZ-4.2 · §12.4).
//
// Bu betik İNCE: yalnız port, marka parametresi ve sinyal. Dinleyiciyi açan kod
// `apps/server/src/baslat.ts`te, çünkü `@hono/node-server` O paketin bağımlılığı ve
// pnpm workspace'te kök `node_modules`ta yok. Mantığın tip denetimli pakette durması
// ayrıca D-153'ün dersi: betikte biriken mantığı hiçbir kapı denetlemiyor.

import { dirname, join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const { baslat } = await import(join(REPO, 'apps/server/dist/index.js'))
// Saat TEK yerden gelir (chokepoints → `saat`). İkinci bir `new Date()`, bir
// çalıştırmanın yeniden oynatılmasını imkânsız kılan sapmanın başlangıcıdır (§13).
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))
const { knowledgeCommit } = await import(join(REPO, 'packages/engine/dist/index.js'))

// Planın dondurulacağı DÜNYA gerçek HEAD commit'idir, 'worktree' değil (D-155, D-167).
// 'worktree' yazan bir manifest KUSURLUDUR ve o plandan çıkan varlık yayınlanamaz —
// yani sunucu bunu okumazsa launcher baştan yayınlanamaz planlar donduruyor demektir.
const GIT_ENV = { PATH: process.env['PATH'] ?? '' }
const { sha: HEAD_SHA, ok: shaOk } = await knowledgeCommit(REPO, GIT_ENV)

// ⚠ ⚠ **SAĞLAYICI ORTAMI: PANELİN "Başlat" DÜĞMESİNİ AÇAN ŞEY.** Sunucu tek bir `env`
// tutuyordu ve o env `git` için doğru biçimde `{PATH}`e indirilmişti — ama aynı env
// plan hesabına da gidiyordu. Sonuç: `candidatesFor` her ücretli adımda "yerel önkoşul
// sağlanmadı" diyor, `providerId` null kalıyor, `launchBlocks` "tahmin EKSİK" deyip
// kilitliyordu. Sunucu `sops exec-env` altında kalksa bile kilit açılmıyordu.
//
// Aynı hatanın ÜÇÜNCÜ yüzü: `plan.mjs` ve `uret.mjs` D-237'de düzeltilmişti, sunucu
// hiç bağlanmamıştı. Liste yine elle yazılmıyor — tanımlayıcıların `auth_env` beyanı.
const { loadDescriptors, saglayiciOrtami } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
const { readEnv } = await import(join(REPO, 'packages/kernel/dist/index.js'))
const { descriptors } = loadDescriptors(join(REPO, 'registry/providers'))
const SAGLAYICI_ORTAMI = saglayiciOrtami(descriptors, readEnv, ['CF_ACCOUNT_ID', 'CLAUDE_CODE_BIN'])

const PORT = Number(process.env['SUITE_PORT'] ?? 5177)

// Marka ve dönem dosyadan OKUNUR ama çalıştırma parametresi olarak GEÇİRİLİR (D-39):
// sunucu global durum tutmaz. Tutsaydı markayı değiştirmek akıştaki her isteği
// sessizce kaydırırdı.
const BRAND = 'brd_upcytech'
const donemYolu = join(REPO, `brand/${BRAND}/current`)
const eraId = existsSync(donemYolu) ? readFileSync(donemYolu, 'utf8').trim() : '*'

// ⚠ Port doluysa ham Node yığın izi basılıyordu (`EADDRINUSE ... at Server.listen`).
// Sebep tek cümleyle söylenebilirken on satır iz basmak, "sunucu bozuldu" ile "zaten
// açık" arasındaki farkı gizliyor. Aynı düzeltme düzenleyicide de yapılmıştı;
// yazılı bir ders ikinci giriş noktasına kendiliğinden geçmiyor.
process.on('uncaughtException', (e) => {
  if (e?.code === 'EADDRINUSE') {
    console.error(`✗ ${PORT} zaten dinleniyor — başka bir 'just dev' açık.`)
    console.error(`  ya onu kapat ya da: SUITE_PORT=<baska> just dev`)
    process.exit(1)
  }
  throw e
})

const sunucu = await baslat({
  repoRoot: REPO,
  query: { brandId: BRAND, eraId, asOf: systemClock.nowIso() },
  kalpAtisiMs: Number(process.env['SUITE_NABIZ'] ?? 5000),
  debounceMs: 150,
  simdi: () => systemClock.nowIso(),
  port: PORT,
  // `git` alt sürecine YALNIZ PATH gider (§14). Tüm ortamı geçirmek, `sops exec-env`
  // ile enjekte edilen sağlayıcı anahtarlarını da alt sürece taşımak olurdu.
  env: GIT_ENV,
  // Plan ve çalıştırma sağlayıcı anahtarlarını GÖRÜR; `git` görmez. Ayrım kasıtlı:
  // en az yetki, "hiç yetki" demek değil (§14).
  saglayiciEnv: SAGLAYICI_ORTAMI,
  // Kirli ağaç da bir gerçektir: commit okunamazsa 'worktree' kalır ve kusurlu
  // manifest kapısı (D-155) o çalıştırmanın çıktısını yayından bloke eder.
  corpusCommit: shaOk ? HEAD_SHA : 'worktree',
  registryCommit: shaOk ? HEAD_SHA : 'worktree',
})

console.log(`  komuta merkezi API   http://localhost:${sunucu.port}`)
console.log(`  marka ${BRAND} · dönem ${eraId}`)
console.log(`  izlenen: ${sunucu.izlenen.join(', ') || '(hiçbiri)'}`)
console.log(`  uçlar: /api/durum · /api/olay (SSE) · /api/saglik`)
// Anahtarların VARLIĞI yazılıyor, değeri değil (R-51). Sessiz kalsaydı "panel bozuk"
// ile "sunucu anahtarsız" ayırt edilemezdi — kilit ekranda aynı görünüyor.
{
  const adlar = Object.keys(SAGLAYICI_ORTAMI).filter((k) => k !== 'PATH')
  console.log(
    adlar.length === 0
      ? `  sağlayıcı anahtarı: YOK — ücretli adımlar fiyatlanamaz, panelde Başlat kilitli`
      : `  sağlayıcı anahtarı: ${adlar.join(', ')}`
  )
}

// Telegram botu: yer tutucu token ile AÇILMAZ ama bu SESSİZ kalmaz (§9.4 · D-180).
// Sessiz kalsaydı "bot çalışıyor" sanılır ve masadan uzaktayken kuyruk sessizce tıkanırdı.
const { tokenGercekMi } = await import(join(REPO, 'apps/server/dist/index.js'))
const tgToken = process.env['TELEGRAM_BOT_TOKEN']
console.log(
  tokenGercekMi(tgToken)
    ? '  telegram botu: token GERÇEK — webhook /api/telegram/webhook'
    : `  telegram botu: KAPALI — TELEGRAM_BOT_TOKEN ${tgToken === undefined ? 'yok' : 'yer tutucu'} (V-17)`
)

const kapat = () => {
  sunucu.kapat().then(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000).unref()
}
process.on('SIGINT', kapat)
process.on('SIGTERM', kapat)
