#!/usr/bin/env node
// `just teslimatlar` — varlıkların İNSAN OKUNUR görünümü (§3.5 · D-249).
//
// **İki katman, iki farklı iş — ve karıştırılırsa ikisi de bozulur:**
//
//   `derived/blobs/<ab>/<sha256>.<ext>`  → **DOĞRULUK.** Adres = içerik. Aynı görsel
//     iki teslimatta kullanılırsa tek kopya durur; bir bayt bozulursa adres tutmaz ve
//     bozulma matematiksel olarak yakalanır. Klasör adı bunların ikisini de veremez.
//
//   `content/<yyyy-mm>/<teslimat>/01-kapak.png` → **GEZİNME.** İnsan "şu postu aç"
//     diye bakar, "şu sha256'yı" diye değil. Sıralı, adlandırılmış, tıklanabilir.
//
// **Bu görünüm TÜRETİLMİŞTİR:** silinip yeniden kurulabilir (`just teslimatlar`) ve
// gitignore'ludur. Doğruluk kaynağı `derived/blobs` + sidecar'lar; burası bir
// projeksiyon. Ters kurulsaydı — klasörler doğruluk, blob'lar kopya — aynı görseli iki
// yerde tutar ve hangisinin gerçek olduğunu bilemezdik.
//
// **Sembolik bağ, kopya DEĞİL.** Kopyalasaydık 400 varlık iki kez yer kaplar ve
// "hangisi güncel" sorusu doğardı. Bağ kırılırsa görünür kırılır — sessiz sapma yok.

import { existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'

const REPO = process.env['SUITE_REPO'] ?? process.cwd()
const BLOBS = join(REPO, 'derived/blobs')
const CIKTI = join(REPO, 'content')

const { foldForSearch } = await import(join(REPO, 'packages/contracts/dist/index.js'))
const { readManifest } = await import(join(REPO, 'packages/engine/dist/index.js'))

/**
 * Dosya adı için güvenli slug. **Türkçe katlama `foldForSearch`ten** geliyor —
 * çıplak `toLowerCase()` `İ`yi bozar (R-21) ve dosya adı bir daha eşleşmez.
 */
const slugla = (s, tavan = 48) =>
  foldForSearch(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, tavan) || 'adsiz'

const metalar = []
const gez = (d) => {
  if (!existsSync(d)) return
  for (const ad of readdirSync(d)) {
    const t = join(d, ad)
    if (statSync(t).isDirectory()) gez(t)
    else if (t.endsWith('.meta.json')) {
      try {
        metalar.push({
          meta: JSON.parse(readFileSync(t, 'utf8')),
          blob: t.replace(/\.meta\.json$/, ''),
        })
      } catch {
        // Bozuk sidecar SESSİZCE atlanmaz: sayılır ve sonda bildirilir.
        metalar.push({ meta: null, blob: t })
      }
    }
  }
}
gez(BLOBS)

const bozuk = metalar.filter((m) => m.meta === null).length
const damgasiz = metalar.filter((m) => m.meta !== null && m.meta.deliverable === undefined)

// ── teslimatlara grupla ──────────────────────────────────────────────────────
const gruplar = new Map()
for (const { meta, blob } of metalar) {
  const d = meta?.deliverable
  if (d === undefined || d === null) continue
  const mevcut = gruplar.get(d.deliverableId)
  if (mevcut === undefined) gruplar.set(d.deliverableId, [{ meta, blob }])
  else mevcut.push({ meta, blob })
}

const konuOku = (runId) => {
  const m = readManifest(REPO, runId)
  if (m === null) return ''
  for (const s of m.steps ?? []) {
    const t = s.params?.topic
    if (typeof t === 'string' && t !== '') return t
  }
  return ''
}

let yazilan = 0
let atlanan = 0
const satirlar = []

for (const [id, parcalar] of gruplar) {
  const sirali = [...parcalar].sort((a, b) => a.meta.deliverable.index - b.meta.deliverable.index)
  const ilk = sirali[0]
  const d = ilk.meta.deliverable
  const ay = String(ilk.meta.createdAt).slice(0, 7)
  const konu = konuOku(ilk.meta.sourceRunId)
  // Klasör adı: tip + konu + teslimat kimliğinin kuyruğu. Kimlik olmadan iki aynı
  // konulu teslimat çakışır; tam kimlikle de ad okunamaz hâle gelir.
  const klasor = join(CIKTI, ay, `${d.kind}-${slugla(konu)}-${id.slice(-8)}`)
  mkdirSync(klasor, { recursive: true })

  for (const p of sirali) {
    const pd = p.meta.deliverable
    const ad = `${String(pd.index + 1).padStart(2, '0')}-${slugla(pd.role, 16)}${p.meta.ext}`
    const hedef = join(klasor, ad)
    if (existsSync(hedef)) {
      atlanan++
      continue
    }
    // Göreli bağ: depo taşınırsa bağlar KIRILMAZ. Mutlak yol, yedeği başka bir
    // dizine açan birinin karşısına kırık bir ağaç çıkarırdı (FAZ-8.7 dersi).
    symlinkSync(relative(dirname(hedef), p.blob), hedef)
    yazilan++
  }

  const eksik = sirali.length < d.total
  satirlar.push(
    `  ${relative(REPO, klasor)}  ${sirali.length}/${d.total}` + (eksik ? '  ⚠ EKSİK PARÇA' : '')
  )
}

console.log(`── teslimat görünümü · ${gruplar.size} teslimat ──\n`)
for (const s of satirlar.sort()) console.log(s)
console.log(`\n  ${yazilan} bağ kuruldu · ${atlanan} zaten vardı`)

// **Eksikler SAYILIR ve söylenir.** Sessizce atlanan bir varlık, olmayan bir varlıktan
// kötüdür: kütüphane "hepsi burada" diye görünür.
if (damgasiz.length > 0) {
  console.log(
    `  ⚠ ${damgasiz.length} varlık teslimat damgası TAŞIMIYOR — gruplanamaz ve öyle kalacak.`
  )
  console.log('    Damga üretim anında basılır, retrofit imkânsız (R-11 · D-248).')
}
if (bozuk > 0) console.log(`  ✗ ${bozuk} sidecar okunamadı`)
console.log('\n  Bu görünüm TÜRETİLMİŞTİR: silinebilir, `just teslimatlar` yeniden kurar.')
