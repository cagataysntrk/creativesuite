#!/usr/bin/env node
// Yedekleme ve geri yükleme DENETİMİ (§14, §16 · R-52 · D-38 · FAZ-8.7).
//
// **Denenmemiş yedek, yedek değildir.** Bu komut yedek ALMAZ — yedeğin tam olup
// olmadığını DENETLER. Ayrım önemli: yedek almak kolay ve herkes alıyor sanıyor;
// eksik olan, alınanın geri yüklenebilir olduğunu bir kez bile görmek.
//
// **Üç ayrı şey yedeklenmeli ve üçü ayrı yerde yaşıyor:**
//   1. `git` deposu     → kod, corpus, registry, brand. `git clone` ile gelir.
//   2. `derived/runs/`  → **TÜRETİLEMEZ** (D-38). git'te ama ignore edilmediği için
//                          clone ile gelir; asıl risk yanlışlıkla ignore edilmesi.
//   3. `derived/blobs/` → varlık byte'ları, gitignore'lu. **Clone ile GELMEZ.**
//   4. `secrets/`       → sops altında; anahtar (age) repoda DEĞİL.
//
// **En sinsi hata:** `git clone` çalışır, `just verify` yeşil verir ve sistem sağlıklı
// görünür — ama `derived/blobs/` boştur ve bunu ancak eski bir varlığı açmaya
// çalıştığında fark edersin. O yüzden bu denetim "clone yeter mi" diye değil,
// **"neyin clone ile GELMEDİĞİNİ"** sorar.

import { existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '..')

const sayDosya = (kok) => {
  if (!existsSync(kok)) return null
  let n = 0
  const yur = (d) => {
    for (const ad of readdirSync(d)) {
      const t = join(d, ad)
      if (statSync(t).isDirectory()) yur(t)
      else n++
    }
  }
  yur(kok)
  return n
}

/** `git check-ignore` — ignore edilen bir yol clone ile GELMEZ. */
const ignoreEdiliyor = (yol) => {
  try {
    execFileSync('git', ['check-ignore', '-q', yol], { cwd: REPO })
    return true
  } catch {
    return false
  }
}

const bulgular = []
const ekle = (siddet, mesaj) => bulgular.push({ siddet, mesaj })

// ── 1. `derived/runs/` — TÜRETİLEMEZ, ignore EDİLMEMELİ ─────────────────────
if (ignoreEdiliyor('derived/runs')) {
  ekle(
    'kritik',
    'derived/runs IGNORE EDİLİYOR — çalıştırma defteri clone ile GELMEZ ve türetilemez (D-38, R-52)'
  )
} else {
  const n = sayDosya(join(REPO, 'derived/runs'))
  ekle(
    n === null || n === 0 ? 'bilgi' : 'ok',
    n === null
      ? 'derived/runs YOK — henüz çalıştırma yapılmamış olabilir; "yedek eksik" DEĞİL'
      : `derived/runs: ${n} dosya, git'te (clone ile gelir)`
  )
}

// ── 2. `derived/blobs/` — CLONE İLE GELMEZ ──────────────────────────────────
//
// Burası tatbikatın asıl konusu: ignore edilmesi DOĞRU (byte'lar git'e girmez, R-64)
// ama bu, ayrı bir yedek gerektiğini söyler. "git clone yeter" varsayımı tam burada
// kırılır ve kırıldığını ancak eski bir varlığı açarken fark edersin.
const blobSayisi = sayDosya(join(REPO, 'derived/blobs'))
if (blobSayisi === null || blobSayisi === 0) {
  ekle('bilgi', 'derived/blobs boş — yedeklenecek varlık yok (henüz üretim yapılmamış)')
} else if (!ignoreEdiliyor('derived/blobs')) {
  ekle('uyari', `derived/blobs git'te — ${blobSayisi} dosya; 512KB üstü varlık R-64'ü çiğner`)
} else {
  ekle(
    'kritik',
    `derived/blobs: ${blobSayisi} dosya ve GITIGNORE'LU — 'git clone' bunları GETİRMEZ. ` +
      'Ayrı yedek şart: bu dosyalar içerik-adresli ve yeniden üretilmeleri para demek'
  )
}

// ── 3. secrets/ — anahtar repoda DEĞİL ──────────────────────────────────────
const sopsVar = existsSync(join(REPO, 'secrets/secrets.enc.yaml'))
ekle(
  sopsVar ? 'kritik' : 'bilgi',
  sopsVar
    ? 'secrets/secrets.enc.yaml var ama ÇÖZME ANAHTARI (age) repoda DEĞİL — anahtarsız yedek, yedek değildir'
    : 'secrets/secrets.enc.yaml yok — henüz secret tanımlanmamış'
)

// ── 4. uzak depo — `git clone` ile kurtarmanın ön koşulu ────────────────────
let uzak = null
try {
  uzak = execFileSync('git', ['remote', 'get-url', 'origin'], {
    cwd: REPO,
    encoding: 'utf8',
  }).trim()
} catch {
  /* uzak yok */
}
if (uzak === null) {
  ekle('kritik', "origin YOK — 'git clone' ile kurtarma İMKÂNSIZ (12. yasa)")
} else {
  let pushEdilmemis = '?'
  try {
    pushEdilmemis = execFileSync('git', ['rev-list', '--count', '@{u}..HEAD'], {
      cwd: REPO,
      encoding: 'utf8',
    }).trim()
  } catch {
    /* upstream yok */
  }
  ekle(
    pushEdilmemis === '0' ? 'ok' : 'kritik',
    pushEdilmemis === '0'
      ? "origin güncel — clone en son commit'i getirir"
      : `${pushEdilmemis} commit uzakta YOK — clone onları kaçırır (12. yasa)`
  )
}

console.log('── yedek denetimi ──')
for (const b of bulgular) {
  const isaret =
    b.siddet === 'kritik' ? '⚠' : b.siddet === 'uyari' ? '!' : b.siddet === 'ok' ? '✓' : '·'
  console.log(`  ${isaret} ${b.mesaj}`)
}
console.log('')
console.log('  Tam kurtarma (runbook: docs/RUNBOOK.md):')
console.log('    1. git clone <origin> <hedef>       → kod, corpus, registry, derived/runs')
console.log('    2. derived/blobs/ ayrı yedekten     → clone GETİRMEZ')
console.log('    3. age anahtarı ayrı kasadan        → repoda DEĞİL')
console.log('    4. cd <hedef> && just setup && just verify')
console.log('')
console.log('  ⚠ Bu komut yedek ALMAZ, yedeğin TAM olup olmadığını denetler.')
console.log('    Denenmemiş bir yedek, yedek değildir — tatbikatı `just yedek-tatbikat` yapar.')
