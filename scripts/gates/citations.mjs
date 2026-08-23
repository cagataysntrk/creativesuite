#!/usr/bin/env node
// GROUP: fast
// Atıf bütünlüğü. Her §N / R-nn / D-nn / V-nn / FAZ-N.x / LOOP§X hedefte var olmalı.
//
// Neden bloklayıcı: bağlamsız bir agent atıfı körü körüne izler. Kırık bir atıf,
// var olmayan bir bölümü "okudum" sanmasına ve yanlış varsayımla kod yazmasına yol açar.
// Sessiz çürüme burada başlar.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..')
const p = (f) => join(REPO, f)
const read = (f) => (existsSync(p(f)) ? readFileSync(p(f), 'utf8') : null)

// ── hedef kümeleri ───────────────────────────────────────────────────────────
const anayasa = read('docs/ANAYASA.md')
const anchors = new Set()
if (anayasa) {
  for (const m of anayasa.matchAll(/\{#section-([0-9-]+)\}/g)) {
    anchors.add(m[1].replace(/-/g, '.'))
  }
}

const idSet = (file, re) => {
  const t = read(file)
  if (t === null) return null // dosya henüz yok → uyarı, hata değil
  return new Set([...t.matchAll(re)].map((m) => m[1]))
}
// ⚠ ⚠ **KURAL KİTABI İKİ DOSYADA YAŞIYOR** (D-336): mimari + süreç `KURALLAR.md`'de,
// karosel render ailesi `docs/kurallar/TASARIM.md`'de. Satır tavanını (R-63) yapısal
// çözmenin yolu bu — `KARARLAR.md` ile arşivi arasındaki sözleşmenin aynısı.
// ⚠ Bir `R-nn` İKİSİNDE birden olamaz: hangisinin geçerli olduğu belirsiz kalır ve
// taşınmış bir kuralın eski kopyası sessizce yaşamaya devam eder.
const KURAL_DOSYALARI = ['KURALLAR.md', 'docs/kurallar/TASARIM.md']
const kuralKumeleri = KURAL_DOSYALARI.map((f) => idSet(f, /^##+ +`?(R-\d+)`?/gm) ?? new Set())
const cakisanR = [...kuralKumeleri[0]].filter((r) => kuralKumeleri[1].has(r))
if (cakisanR.length > 0) {
  console.log(`  aynı kural iki dosyada birden: ${cakisanR.join(', ')}`)
  process.exit(1)
}
const rules = new Set(kuralKumeleri.flatMap((k) => [...k]))

// Karar defteri İKİ dosyada yaşar: aktif `KARARLAR.md` + `docs/kararlar/ARSIV-<yyyy>.md`.
// Satır tavanını (R-63) yapısal çözmenin yolu bu: kapanmış kararlar devredilir,
// aktif defter okunabilir kalır. Her `D-nn` ikisinden **TAM OLARAK BİRİNDE** çözülmeli —
// ikisinde birden olması hangisinin geçerli olduğunu belirsiz bırakır ve arşivlenmiş bir
// kararın aktif sanılmasına yol açar (D-72).
const ARSIV = ['docs/kararlar/ARSIV-2026.md']
const aktifD = idSet('KARARLAR.md', /^##+ +`?(D-\d+)`?/gm) ?? new Set()
const arsivD = new Set()
for (const f of ARSIV) for (const d of idSet(f, /^##+ +`?(D-\d+)`?/gm) ?? []) arsivD.add(d)
const cakisan = [...aktifD].filter((d) => arsivD.has(d))
if (cakisan.length > 0) {
  console.log(`  aynı karar hem KARARLAR.md'de hem arşivde: ${cakisan.join(', ')}`)
  console.log('\nkarar defteri çift kayıt')
  process.exit(1)
}
const decisions = new Set([...aktifD, ...arsivD])
const debts = idSet('KARARLAR.md', /^##+ +`?(V-\d+)`?/gm)

// Reddedilmiş kararlar. Bir karar silinmez, açık bir DURUM satırıyla işaretlenir:
//     **Durum:** reddedildi → D-nn
// Anahtar kelime taraması YETMEZ: bir kararın gövdesinde "Remotion reddedildi" yazması,
// kararın kendisinin reddedildiği anlamına gelmez. İşaretleyici açık olmak zorunda.
// Reddedilmiş bir karara atıf vermek hatadır — geçersiz gerekçeye dayanmak, gerekçesiz
// olmaktan kötüdür, çünkü sağlam görünür.
const rejected = new Set()
{
  const t = ['KARARLAR.md', ...ARSIV].map(read).filter(Boolean).join('\n')
  if (t) {
    for (const b of t.split(/\n(?=##+ +`?[DV]-\d+)/)) {
      const id = b.match(/^##+ +`?([DV]-\d+)`?/)?.[1]
      if (id && /^\*\*Durum:\*\*\s*reddedildi\b/m.test(b)) rejected.add(id)
    }
  }
}
const loopSections = new Set(
  [...(read('docs/LOOP.md') ?? '').matchAll(/\{#loop-([a-g])\}/g)].map((m) => m[1].toUpperCase())
)

const phaseSteps = new Map() // "0" -> Set("A.1","B.2a",…)
// ⚠ **Dizin TARANIR, sayı sayılmaz.** İlk sürüm `for (n = 0; n <= 9; n++)` idi ve FAZ 10
// açıldığı gün `FAZ-10.md`yi hiç okumadı: kapı `FAZ-10.x` atıflarını "doğrulanmadı" diye
// UYARIYA çeviriyordu, yani onuncu fazdan itibaren kırık bir faz atıfı sessizce geçerdi.
// **Aynı tek-haneli varsayım `durum` kapısında da vardı ve orada da düzeltildi** — iki
// ayrı kapıda aynı hata, çünkü ikisi de dosya sisteminin söyleyebileceği bir şeyi tahmin
// ediyordu.
for (const dosya of readdirSync(p('docs/fazlar')).filter((f) => /^FAZ-\d+\.md$/.test(f))) {
  const n = Number(/^FAZ-(\d+)\.md$/.exec(dosya)[1])
  const t = read(`docs/fazlar/${dosya}`)
  if (t === null) continue
  const s = new Set()
  for (const m of t.matchAll(/^##+ +(\d+)\.([A-Za-z0-9.]+?) +—/gm))
    if (m[1] === String(n)) s.add(m[2])
  phaseSteps.set(String(n), s)
}

// ── taranacak dosyalar ───────────────────────────────────────────────────────
let files = []
try {
  // execFileSync: kabuk yok, pathspec glob'larını git'in kendisi çözer
  files = execFileSync('git', ['ls-files', '*.md', '*.ts', '*.mjs', '*.sh', 'justfile'], {
    cwd: REPO,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
} catch {
  files = []
}
// Arşiv ve kayıt dosyaları: ARŞİVLENMİŞ bir belgeden alıntı yapan bir kayıt, canlı
// çapalara karşı doğrulanamaz. denetim-tasfiye planın § numaralarını alıntılıyor;
// plan arşivde ve numaraları ANAYASA'ya eşlenmiyor.
const SKIP = /^docs\/(research|PLAN-ARSIV|denetim-tasfiye)/
files = files.filter((f) => !SKIP.test(f))

// ── kontrol ──────────────────────────────────────────────────────────────────
const errors = []
const warns = new Set()

for (const f of files) {
  const text = readFileSync(p(f), 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    const at = (msg) => errors.push(`${f}:${i + 1}  ${msg}`)

    // §N / §N.M — ANAYASA bölümü. Tanım satırlarını (başlıklar) atla.
    if (!/^#+\s/.test(line)) {
      for (const m of line.matchAll(/§(\d+(?:\.\d+)?)/g)) {
        if (anchors.size === 0) {
          warns.add('docs/ANAYASA.md yok veya çapasız — § atıfları doğrulanmadı')
          break
        }
        if (!anchors.has(m[1])) at(`§${m[1]} — ANAYASA'da böyle bir bölüm yok`)
      }
    }

    // LOOP§<harf>. "LOOP§X" literal yer tutucudur (şablon anlatımı) — atlanır.
    for (const m of line.matchAll(/LOOP§([A-Z])/g)) {
      if (m[1] === 'X') continue
      if (loopSections.size === 0) {
        warns.add('docs/LOOP.md yok — LOOP§ atıfları doğrulanmadı')
        break
      }
      if (!loopSections.has(m[1])) at(`LOOP§${m[1]} — LOOP.md'de böyle bir bölüm yok`)
    }

    // R-nn
    for (const m of line.matchAll(/\bR-(\d+)\b/g)) {
      if (rules === null) {
        warns.add('kural kitabı yok — R-nn atıfları doğrulanmadı')
        break
      }
      if (!rules.has(`R-${m[1]}`)) at(`R-${m[1]} — kural kitabında yok`)
    }

    // D-nn / V-nn
    for (const m of line.matchAll(/\bD-(\d+)\b/g)) {
      if (decisions === null) {
        warns.add('KARARLAR.md yok — D-nn atıfları doğrulanmadı')
        break
      }
      const id = `D-${m[1]}`
      if (!decisions.has(id)) at(`${id} — ne KARARLAR.md'de ne arşivde var`)
      // Defterin kendi içinde (aktif ya da arşiv) reddedilmeye atıf serbest:
      // yerine geçen kararı gösterir.
      else if (rejected.has(id) && f !== 'KARARLAR.md' && !ARSIV.includes(f))
        at(`${id} — bu karar REDDEDİLDİ, ona dayanılamaz`)
    }
    for (const m of line.matchAll(/\bV-(\d+)\b/g)) {
      if (debts === null) {
        warns.add('KARARLAR.md yok — V-nn atıfları doğrulanmadı')
        break
      }
      if (!debts.has(`V-${m[1]}`)) at(`V-${m[1]} — KARARLAR.md'de yok`)
    }

    // FAZ-N.x — dosya adı (FAZ-0.md), yer tutucu (FAZ-0.x) ve aralık (FAZ-0..9) atlanır.
    // Adım alfanümerikle BAŞLAMAK zorunda: "FAZ-0..9" ikinci noktada eşleşmez.
    for (const m of line.matchAll(/\bFAZ-(\d+)\.([A-Za-z0-9][A-Za-z0-9.]*)/g)) {
      const [, n, step] = m
      const clean = step.replace(/[.,;:)]+$/, '')
      if (clean === 'x' || clean === 'md') continue
      const set = phaseSteps.get(n)
      if (!set) {
        warns.add(`docs/fazlar/FAZ-${n}.md yok — FAZ-${n} atıfları doğrulanmadı`)
        continue
      }
      if (!set.has(clean)) at(`FAZ-${n}.${clean} — FAZ-${n}.md'de böyle bir adım yok`)
    }
  })
}

// ── GÖVDESİZ BÖLÜM: çözülen atıf ≠ okunabilir kaynak (D-159) ─────────────────
//
// `§12.3` çapası vardı, atıf kapısı yeşildi ve bölümün İÇİ BOŞTU — yalnız başlık.
// FAZ-4.1'in `📖 Oku` satırı oraya işaret ediyordu; bağlamı sıfırlanmış bir agent
// hedefi bulur, hiçbir şey öğrenmez ve adımı TAHMİNLE yapar. Kırık atıftan sinsi,
// çünkü kırık atıf en azından bağırır.
//
// **Eşik neden SIRADAKİ ADIMA bağlı:** ANAYASA'da 24 iskelet bölüm var (FAZ-0.B.2a
// bilerek tek cümlelik amaçlarla açtı). Hepsini bugün doldurmak, henüz yapılmamış
// fazların detayını yazmaktır ve o detay yapılana kadar bayatlar (FAZ-0.B.8a'nın
// kendi gerekçesi). Doğru an, o bölümü OKUYACAK adımın sırası geldiği andır — nitekim
// §12.3/§12.4 tam olarak FAZ-4.1 başlarken dolduruldu.
//
// Yani: sıradaki adımın okuduğu bölüm gövdesizse HATA; diğerleri sayılıp bildirilir.
const govdeSayisi = (metin) => {
  const satirlar = metin.split('\n')
  const basliklar = satirlar
    .map((l, i) => ({ i, m: /^(#{2,4})\s+§([0-9.]+)/.exec(l) }))
    .filter((x) => x.m !== null)
  const harita = new Map()
  for (const [k, b] of basliklar.entries()) {
    const son = k + 1 < basliklar.length ? basliklar[k + 1].i : satirlar.length
    // Üst başlık (alt bölümleri olan) gövdesiz olabilir — gövdesi alt bölümlerdir.
    const ustBaslik = k + 1 < basliklar.length && basliklar[k + 1].m[1].length > b.m[1].length
    harita.set(b.m[2], {
      satir: satirlar.slice(b.i + 1, son).filter((l) => l.trim() !== '').length,
      ustBaslik,
    })
  }
  return harita
}

if (anayasa) {
  const bolumler = govdeSayisi(anayasa)

  // Sıradaki adımın `📖 Oku` satırındaki § atıfları.
  const durum = read('DURUM.md') ?? ''
  const siradaki = /^siradaki_adim:\s*(\S+)/m.exec(durum)?.[1] ?? ''
  const fazNo = /^(\d+)\./.exec(siradaki)?.[1] ?? null
  const okunacak = new Set()
  if (fazNo !== null) {
    const faz = read(`docs/fazlar/FAZ-${fazNo}.md`) ?? ''
    const adimBas = faz.indexOf(`## ${siradaki} —`)
    if (adimBas !== -1) {
      const govde = faz.slice(adimBas, adimBas + 600)
      const oku = /^📖\s+(.+)$/m.exec(govde)?.[1] ?? ''
      for (const m of oku.matchAll(/§([0-9.]+)/g)) okunacak.add(m[1])
    }
  }

  // ── TİKLİ adımların `📖` atıfları da denetlenir (D-231) ───────────────────
  //
  // ⚠ Kapı yalnız `siradaki_adim`a bakıyordu ve bir faz kapandığında o fazın bölümleri
  // bir daha hiç kontrol edilmiyordu: §12.8 (FAZ-4.1) ve §8.1 (FAZ-3.4) fazları
  // kapandığı hâlde boş kaldı ve kapı dokuz turdur yalnız "8 iskelet bölüm" diye
  // UYARIYORDU. D-159'un "sırası gelen adım kendi bölümünü doldurur" mekanizması
  // **yalnız ileri bakıyordu** — ve yalnız ileri bakan bir denetimde geçmiş sessizce
  // birikir.
  //
  // **Tiklemek bir İDDİADIR.** `faz-yollari` bunu `📁` için söylüyor: "tikli bir adımın
  // yol satırı plan değil, iddiadır". Bu satır `📖` için söylüyor: bir adımı tiklemek,
  // okuduğu bölümün VAR olduğunu iddia etmektir. Kaynaksız yapılmış bir adım,
  // yapılmamış bir adımdan kötüdür — yapıldığı sanılır ve kimse geri dönmez.
  const tikliAtiflar = new Map()
  for (let n = 0; n <= 9; n++) {
    const faz = read(`docs/fazlar/FAZ-${n}.md`)
    if (faz === null) continue
    let adim = null
    for (const satir of faz.split('\n')) {
      const bas = /^##+ +(\d+\.[A-Za-z0-9.]*) +—.*\[( |x)\]/.exec(satir)
      if (bas !== null) {
        adim = bas[2] === 'x' ? bas[1] : null
        continue
      }
      if (adim === null) continue
      const oku = /^📖\s+(.+)$/.exec(satir)
      if (oku === null) continue
      for (const m of oku[1].matchAll(/§([0-9.]+)/g)) {
        if (!tikliAtiflar.has(m[1])) tikliAtiflar.set(m[1], adim)
      }
    }
  }

  let iskelet = 0
  for (const [bolum, bilgi] of bolumler) {
    if (bilgi.ustBaslik || bilgi.satir >= 3) continue
    iskelet++
    if (okunacak.has(bolum)) {
      errors.push(
        `docs/ANAYASA.md  §${bolum} GÖVDESİZ (${bilgi.satir} satır) ama SIRADAKİ ADIM ` +
          `'${siradaki}' onu okumak zorunda — adım kaynaksız yapılamaz`
      )
    } else if (tikliAtiflar.has(bolum)) {
      errors.push(
        `docs/ANAYASA.md  §${bolum} GÖVDESİZ (${bilgi.satir} satır) ama TİKLİ adım ` +
          `'${tikliAtiflar.get(bolum)}' ona atıf veriyor — tiklemek, kaynağın VAR ` +
          `olduğunu iddia etmektir (D-231)`
      )
    }
  }
  if (iskelet > 0) {
    warns.add(
      `ANAYASA'da ${iskelet} iskelet bölüm — sırası gelen adım kendi bölümünü doldurur (D-159)`
    )
  }
}

for (const w of warns) console.log(`  ⚠ ${w}`)
if (errors.length) {
  console.log(errors.map((e) => `  ${e}`).join('\n'))
  console.log(`\n${errors.length} kırık atıf`)
  process.exit(1)
}
console.log(`  ${files.length} dosya tarandı · ${anchors.size} § çapası · kırık atıf yok`)
