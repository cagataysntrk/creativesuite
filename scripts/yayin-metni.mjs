#!/usr/bin/env node
// HEDEF: scripts/yayin-metni.mjs
//
// Platform BAŞINA yayın açıklaması ÜRETİR (FAZ-19.13 · UX-16).
//
// ⚠ ⚠ **PANEL MODEL ÇAĞIRMIYOR, BU BETİK ÇAĞIRIYOR — ve fark mimari.** Sunucuya bir
// model yolu koymak, hangi çağrının ne harcadığını iki ayrı yerde anlatmak olurdu.
// Sağlayıcıya giden tek yol adaptörlerdir; bu betik de tam olarak hattın kullandığı
// adaptörü kullanıyor (`text.generate`), kendi `claude` çağrısını yazmıyor.
//
// ⚠ ⚠ **MALİYET SIFIR ve bu ÖLÇÜLDÜ, varsayılmadı:** `claude-code` adaptörünün
// `estimate`i `ZERO_USD` döndürüyor — abonelik zaten ödenmiş. O yüzden bu çağrı bütçe
// defterine girmiyor; girseydi sıfırları saymak defteri kirletirdi.
//
// ⚠ İstem `yayinMetniIstemi` ile kuruluyor — hattın kullandığı İSTEMİN AYNISI. İkinci
// bir istem yazmak, panelden üretilen metnin hattan üretilenden başka bir ses taşıması
// demekti.
//
// Kullanım:  node scripts/yayin-metni.mjs --run <runId> [--platform instagram] [--hepsi]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (ad) => {
  const i = process.argv.indexOf(ad)
  return i > 0 ? process.argv[i + 1] : undefined
}
const runId = arg('--run')
const platform = arg('--platform')
const hepsi = process.argv.includes('--hepsi')

if (runId === undefined || !/^run_[0-9a-f-]+$/.test(runId)) {
  console.log('✗ --run <runId> gerekli')
  process.exit(1)
}
if (platform === undefined && !hepsi) {
  console.log('✗ --platform <id> ya da --hepsi gerekli')
  process.exit(1)
}

const { PLATFORMLAR, platformDenetle } = await import(
  join(REPO, 'packages/contracts/dist/index.js')
)
const { yayinMetniIstemi, yayinMetniCozumle, kusuruYaz, duzMetin } = await import(
  join(REPO, 'packages/engine/dist/index.js')
)
const { adapterById, loadDescriptors, saglayiciOrtami } = await import(
  join(REPO, 'packages/providers/dist/index.js')
)
const { readEnv, RUNS_DIR } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const dizin = join(REPO, RUNS_DIR, runId)
const oku = (ad) => {
  const y = join(dizin, ad)
  if (!existsSync(y)) return null
  try {
    return JSON.parse(readFileSync(y, 'utf8'))
  } catch {
    return null
  }
}

// ── koşunun bağlamı ────────────────────────────────────────────────────────
//
// ⚠ Kart metni YOKSA üretmiyoruz. Konusuz bir istemle model yine bir şey yazar ama
// karoselle ilgisi olmayan bir şey yazar — ve o metin "üretildi" diye kaydedilirdi.
const kart = oku('steps/metin-uret.json')
const satirlar = Array.isArray(kart?.lines) ? kart.lines : []
if (satirlar.length === 0) {
  console.log('✗ karosel metni yok (`metin-uret` adımı koşmamış) — istem kurulamaz')
  process.exit(1)
}
const konuAdimi = oku('steps/konu-sec.json')
const par = oku('kosu-parametreleri.json') ?? {}
const konu = (konuAdimi?.konu ?? par.topic ?? '').trim()

// Slayt sayısı: karosel tavanı denetimi buna bakıyor.
const sablonAdimi = oku('steps/render.json') ?? oku('steps/yuva-doldur.json')
const slaytSayisi = Array.isArray(sablonAdimi?.assets) ? sablonAdimi.assets.length : satirlar.length

// ⚠ ⚠ **TEK ÇAĞRIDA BİRDEN ÇOK PLATFORM — ve sebebi ÖLÇÜLDÜ.** Depo sahibi: *"metin
// üretimi neden bu kadar yavaş?"* Ölçüm: tek platform için tam komut 11,8 sn; bunun
// 0,5 sn'si `tsc -b` + modül yüklemesi, GERİ KALANI `claude` CLI'si. CLI'nin kendi
// tabanı (dört jetonluk bir cevap için) 5,9 sn ve her çağrıda ~46 bin jetonluk oturum
// bağlamını yeniden yüklüyor (`cache_creation 21875` + `cache_read 24432` ölçüldü).
//
// Yani maliyet ÇAĞRI BAŞINA sabit. İki platform için iki kez çağırmak, o sabiti iki kez
// ödemek demekti (~24 sn). İstem zaten `platformlar` listesi alıyor ve model ikisini
// birden yazabiliyor — eksik olan yalnızca virgüllü argümandı.
//
// ⚠ `--hepsi` ile aynı şey DEĞİL: o dört platformu da yeniden yazıyor ve insanın elle
// düzelttiği metni eziyor. Bu, İSTENEN alt kümeyi tek çağrıda üretiyor.
const secili = hepsi
  ? PLATFORMLAR.map((p) => p.id)
  : String(platform)
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x !== '')
const bilinmeyen = secili.filter((id) => !PLATFORMLAR.some((p) => p.id === id))
if (bilinmeyen.length > 0) {
  console.log(`✗ bilinmeyen platform: ${bilinmeyen.join(', ')}`)
  process.exit(1)
}

const girdi = { konu, kartMetni: satirlar.join('\n'), slaytSayisi, platformlar: secili }
const istem = yayinMetniIstemi(girdi)
if (istem === null) {
  console.log('✗ istem kurulamadı')
  process.exit(1)
}

// ── sağlayıcı: hattın kullandığı adaptör ───────────────────────────────────
const { descriptors } = loadDescriptors(join(REPO, 'registry/providers'))
const ORTAM = saglayiciOrtami(descriptors, readEnv, ['CF_ACCOUNT_ID', 'CLAUDE_CODE_BIN'])
const adaptor = adapterById('claude-code')
if (adaptor === null) {
  console.log('✗ `claude-code` adaptörü bulunamadı')
  process.exit(1)
}
if (!adaptor.available(ORTAM)) {
  console.log('✗ `claude` PATH üzerinde yok — yerel önkoşul sağlanmadı')
  process.exit(1)
}

const girdiNesnesi = {
  capability: 'text.generate',
  lane: 'free',
  prompt: istem,
  constraints: {},
  // ⚠ Anahtar koşu + platformdan türüyor: aynı platform için ikinci çağrı aynı anahtarı
  // taşır ve adaptör onu ayırt edebilir.
  idempotencyKey: `yayin-metni:${runId}:${secili.join(',')}`,
}
const dogrulama = adaptor.validate(girdiNesnesi)
if (!dogrulama.ok) {
  console.log(`✗ girdi reddedildi: ${JSON.stringify(dogrulama.error).slice(0, 200)}`)
  process.exit(1)
}

console.log(`⏳ ${secili.join(', ')} için metin üretiliyor…`)
const baslat = await adaptor.start(dogrulama.value, {
  env: ORTAM,
  correlationId: girdiNesnesi.idempotencyKey,
  signal: undefined,
})
if (!baslat.ok) {
  console.log(`✗ sağlayıcı başlatılamadı: ${JSON.stringify(baslat.error).slice(0, 300)}`)
  process.exit(1)
}
const durum = await adaptor.status(baslat.value)
if (!durum.ok || durum.value.state !== 'succeeded') {
  const e = durum.ok ? durum.value.error : durum.error
  console.log(`✗ üretim başarısız: ${JSON.stringify(e).slice(0, 400)}`)
  process.exit(1)
}

// ── çözümle ve DOĞRULA ─────────────────────────────────────────────────────
//
// ⚠ Doğrulama üretim anında, yayın anında DEĞİL: 281 karakterlik bir X metnini yayın
// anında öğrenmek, dört görsel ve bir insan onayı harcandıktan sonra öğrenmektir.
// ⚠ ⚠ **ZARFI HATTIN ÇIKARICISI AÇIYOR.** Claude Code cevabı `{"type":"result",
// "result":"<asıl metin>"}` zarfında veriyor; ilk sürümde zarfı olduğu gibi
// ayrıştırıcıya verdim ve *"JSON bulunamadı"* dedi — oysa model doğru cevabı üretmişti.
// Kendi çıkarıcımı yazmak, hattınkinden ayrışan ikinci bir okuma demekti.
const ham = duzMetin(durum.value.output) ?? ''
const cozum = yayinMetniCozumle(ham, girdi)
if (cozum === null) {
  console.log('✗ modelin cevabında JSON bulunamadı')
  console.log(ham.slice(0, 400))
  process.exit(1)
}

// ── deftere yaz — ÖNCEKİ HÂL DURUYOR ───────────────────────────────────────
const yol = join(dizin, 'steps/yayin-metni.json')
const eski = oku('steps/yayin-metni.json') ?? {}
const mevcut = eski.yayinMetinleri ?? {}
const onceki = eski.oncekiMetinler ?? {}
const yeni = { ...mevcut }
for (const [id, metin] of Object.entries(cozum.metinler)) {
  if (mevcut[id] !== undefined && mevcut[id] !== metin) {
    onceki[id] = [...(onceki[id] ?? []), mevcut[id]]
  }
  yeni[id] = metin
}
mkdirSync(dirname(yol), { recursive: true })
writeFileSync(
  yol,
  JSON.stringify({
    ...eski,
    yayinMetinleri: yeni,
    oncekiMetinler: onceki,
    // ⚠ NEREDEN üretildiği yazılıyor: hattın adımı mı, panelden tek platform mu.
    // Bunu kaydetmemek, altı ay sonra "bu metin nereden geldi" sorusunu cevapsız bırakırdı.
    panelUretimi: true,
  }),
  'utf8'
)

for (const [id, metin] of Object.entries(cozum.metinler)) {
  const p = PLATFORMLAR.find((x) => x.id === id)
  const kusur =
    p === undefined ? [] : platformDenetle(metin, slaytSayisi, p).map((k) => kusuruYaz(k, p.ad))
  console.log(
    `✓ ${id}: ${[...metin].length} karakter${kusur.length === 0 ? '' : ` · ⚠ ${kusur.join(' · ')}`}`
  )
}
if (cozum.kusurlar.length > 0) console.log(`⚠ ${cozum.kusurlar.map((k) => k.aciklama).join(' · ')}`)
