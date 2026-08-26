#!/usr/bin/env node
// GROUP: all
//
// UÇTAN UCA: panelin HER ekranı ve EDİTÖR gerçekten açılıyor mu (FAZ-19.12 · madde 14).
//
// ⚠ ⚠ **BU KAPI BİR ŞİKÂYETTEN DOĞDU:** *"uçtan uca panel playwright ile test edilmeli
// editör de dahil"*. Bu turda panelde üç ayrı kusur ancak TARAYICIDA görüldü ve
// hiçbirini tip denetimi, lint ya da birim testi yakalayamazdı:
//   · yeni ekranın rotası `adres.ts` beyaz listesinde yoktu — `#/giris`e SESSİZCE düşüyordu
//   · yayın önizlemesi dört isteğin dördünde de 404 alıyordu (yanlış digest kaynağı)
//   · editörde arama sonuçları panelin dibinde, kaydırmadan görünmüyordu
// Üçü de "kod doğru, ekran yanlış" sınıfı. Yeşil bir derleme bunu kanıtlamıyor.
//
// ⚠ ⚠ **TEZGÂH AYAKTA DEĞİLSE KAPI GEÇMİYOR, DÜŞÜYOR.** "Atla" demek bedava yeşil
// olurdu: doğrulanamayan bir şey doğrulanmış sayılamaz. `GROUP: all` olduğu için
// yalnız `just verify`de koşuyor ve orada tezgâhın açık olması meşru bir beklenti.
//
// ⚠ `networkidle` KULLANILMIYOR: panel bir SSE akışı tutuyor ve sayfa hiçbir zaman
// "idle" olmuyor — ilk sürüm 30 saniye bekleyip zaman aşımına düştü.
//
// ⛔ HİÇBİR KOŞU BAŞLATILMIYOR. `/api/calistir` isteği YAKALANIP KESİLİYOR: panele
// 11. bir koşu eklemek, sahibinin tek tek incelediği listeyi kirletirdi.

import { existsSync } from 'node:fs'
import { join } from 'node:path'

const KOK = process.cwd()
const PANEL = 'http://localhost:5173'
const EDITOR = 'http://localhost:4321'
const API = 'http://localhost:5177'

/** Panelin bütün ekranları — `adres.ts`teki beyaz listeyle aynı olmalı. */
const EKRANLAR = [
  'giris',
  'corpus',
  'baglam',
  'calistir',
  'kuyruk',
  'yerlesim',
  'kesif',
  'sema',
  'butce',
  'varliklar',
  'yayin-akisi',
  'gecmis',
  'saglik',
  'doktor',
  'kanallar',
  'performans',
  'uyum',
]

const ayakta = async (url) => {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) })
    return r.status < 500
  } catch {
    return false
  }
}

const kusurlar = []
const bildir = (ekran, ne) => kusurlar.push(`${ekran}: ${ne}`)

// ⚠ Playwright `packages/render`den çözülüyor: paket YALNIZ orada bildirilmiş ve
// depo kökünden `import 'playwright'` çalışmıyor (bir kez denendi).
const pwYolu = join(KOK, 'node_modules/playwright/index.js')
const pwAlt = join(KOK, 'packages/render/node_modules/playwright/index.js')
const pw = existsSync(pwYolu) ? pwYolu : pwAlt
if (!existsSync(pw)) {
  console.error('✗ playwright bulunamadı — `pnpm install` gerekiyor')
  process.exit(1)
}

if (!(await ayakta(PANEL)) || !(await ayakta(API)) || !(await ayakta(EDITOR))) {
  console.error(
    '✗ tezgâh ayakta değil — bu kapı GERÇEK tarayıcıda ölçüyor.\n' +
      '    Başlat:  just dev   (node 22 ile; v20de better-sqlite3 segfault veriyor)\n' +
      '    5173 panel · 5177 api · 4321 editör'
  )
  process.exit(1)
}

// ⚠ Playwright CommonJS: `import()` dışa aktarımları `.default` altına koyuyor ve
// doğrudan yıkım (`const { chromium } = ...`) `undefined` veriyor. İlk sürüm tam burada
// `Cannot read properties of undefined` ile düştü.
const pwModul = await import(pw)
const chromium = pwModul.chromium ?? pwModul.default?.chromium
if (chromium === undefined) {
  console.error('✗ playwright yüklendi ama `chromium` dışa aktarımı bulunamadı')
  process.exit(1)
}
const tarayici = await chromium.launch()

/** Bir sayfayı hazırlar: konsol hatası ve kırık istek toplayıcıları bağlı. */
const sayfaAc = async () => {
  const p = await tarayici.newPage({ viewport: { width: 1440, height: 1000 } })
  const konsol = []
  const kirik = []
  p.on('console', (m) => {
    if (m.type() === 'error') konsol.push(m.text().slice(0, 160))
  })
  p.on('pageerror', (e) => konsol.push('PAGEERROR: ' + String(e.message).slice(0, 160)))
  p.on('response', (r) => {
    // ⚠ 404 de sayılıyor: bu turda yayın önizlemesi dört isteğin dördünde 404 alıyordu
    // ve ekran "çalışıyor" görünüyordu — görsel yüklenmiyordu, o kadar.
    if (r.status() >= 400) kirik.push(`${String(r.status())} ${r.url().replace(PANEL, '')}`)
  })
  return { p, konsol, kirik }
}

// ── 1: PANELİN HER EKRANI ───────────────────────────────────────────────────
{
  const { p, konsol, kirik } = await sayfaAc()
  // ⛔ Koşu başlatma isteği KESİLİYOR — panele 11. koşu eklenmez.
  await p.route('**/api/calistir', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, hata: 'uctan-uca kapısı: koşu BAŞLATILMADI' }),
    })
  )
  for (const ekran of EKRANLAR) {
    konsol.length = 0
    kirik.length = 0
    await p.goto(`${PANEL}/#/${ekran}`, { waitUntil: 'domcontentloaded', timeout: 20_000 })
    await p.waitForTimeout(2200)
    // ⚠ ⚠ **ADRESİN KORUNDUĞU SINANIYOR.** Beyaz listede olmayan bir rota SESSİZCE
    // `#/giris`e düşüyor ve ekran "açıldı" sanılıyor — bu turda tam olarak bu oldu.
    // ⚠ ⚠ **ÖN EK KARŞILAŞTIRMASI, BİREBİR DEĞİL — ve bunu ilk koşu öğretti.** `Üret`
    // ekranı seçili hattı adrese ekliyor (`calistir/instagram-karosel`) ve bu MEŞRU:
    // adres o ekranın durumunu da taşıyor. Birebir eşitlik arayan ilk sürüm onu
    // "rota tanınmıyor" diye bildirdi — kapının kendi yanlış pozitifi.
    const varilan = new URL(p.url()).hash.replace('#/', '')
    if (varilan !== ekran && !varilan.startsWith(ekran + '/'))
      bildir(ekran, `adres ${varilan} oldu — rota tanınmıyor olabilir`)
    // Ekranın bir GÖVDESİ var mı: boş bir div "açıldı" sayılmaz.
    const metin = (
      await p
        .locator('body')
        .innerText()
        .catch(() => '')
    ).trim()
    if (metin.length < 40) bildir(ekran, `ekran neredeyse BOŞ (${String(metin.length)} karakter)`)
    if (konsol.length > 0) bildir(ekran, `konsol hatası: ${konsol.slice(0, 2).join(' | ')}`)
    if (kirik.length > 0)
      bildir(ekran, `kırık istek: ${[...new Set(kirik)].slice(0, 3).join(' | ')}`)
  }
  await p.close()
}

// ── 2: EDİTÖR ───────────────────────────────────────────────────────────────
{
  const { p, konsol, kirik } = await sayfaAc()
  await p.goto(EDITOR, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await p.waitForTimeout(2500)
  const secenek = await p.locator('#sablon option').count()
  if (secenek === 0) bildir('editör', 'şablon/koşu listesi BOŞ')

  // ⚠ ⚠ **GÖRSEL YUVASI OLAN BİR KAYIT SEÇİLİYOR — varsayılan olmayabilir.** İlk koşu
  // *"tuvalde görsel yuvası yok"* dedi: editör listenin ilkini açıyor ve on şablonun
  // ALTISI görselsiz (veri-hikayesi, akan-alan, kavis, alinti, karsilastirma, dizin).
  // Yuvası olmayan bir kayıtta yuva aramak, kapının kendi kurgu hatasıydı.
  const idler = await p.locator('#sablon option').evaluateAll((o) => o.map((x) => x.value))
  const gorselli = idler.find((x) => /sahne|memphis|donen|editoryal/.test(x))
  if (gorselli !== undefined) {
    await p.goto(EDITOR + '?id=' + encodeURIComponent(gorselli) + '&elenmis=1', {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    })
    await p.waitForTimeout(2500)
  }

  // Tuvalde bir görsel yuvası seçilebiliyor mu.
  const fr = p.frameLocator('#pano')
  const yuva = fr.locator('.gorsel, .gorsel-yer').first()
  if ((await yuva.count()) === 0) bildir('editör', 'tuvalde görsel yuvası yok')
  else {
    await yuva
      .click({ force: true, timeout: 15_000 })
      .catch(() => bildir('editör', 'yuva tıklanamadı'))
    await p.waitForTimeout(1500)
    // Yuva paneli açıldı mı — dönüş kaydırakları madde 2'de eklendi.
    for (const etiket of ['yatay çevir', 'dikey yatır', 'düzlemde döndür']) {
      if ((await p.locator(`label:has-text("${etiket}") input[type=range]`).count()) === 0)
        bildir('editör', `"${etiket}" kaydırağı yok`)
    }
    // Fare tutamaçları (madde 13) — yalnız TAŞI modunda.
    await p.locator('#mod').click()
    await p.waitForTimeout(800)
    await yuva.click({ force: true, timeout: 15_000 }).catch(() => {})
    await p.waitForTimeout(1500)
    const tutamac = await fr.locator('[data-duzenleyici="tutamac"] div').count()
    if (tutamac < 2)
      bildir('editör', `tutamaç sayısı ${String(tutamac)} — ölçek ve döndürme bekleniyor`)
  }

  // Webden arama modalı (madde 12) — AĞA ÇIKMADAN: istek kesiliyor.
  // ⚠ Gerçek Iconify çağrısı yapmıyoruz: kapı ağ kesintisinde kırmızı dönmemeli,
  // sınanan şey MODALIN kendisi.
  await p.route('**/gorsel-ara**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        toplam: 1,
        suzgec: [],
        ogeler: [
          {
            // ⚠ GERÇEK bir ikon kimliği: önizleme `<img>` doğrudan Iconify'dan
            // yükleniyor ve uydurma bir kimlik 404 veriyor — kapı kendi sahte
            // verisiyle kendini kırmızıya döndürmüştü.
            tam: 'mdi:recycle',
            set: 'mdi',
            ad: 'recycle',
            setAdi: 'Sınama',
            lisans: 'MIT',
            spdx: 'MIT',
            lisansUrl: '',
            yazar: '',
            kaynakUrl: '',
          },
        ],
      }),
    })
  )
  const araDugmesi = p.locator('button:has-text("webden ara")').first()
  if ((await araDugmesi.count()) === 0) bildir('editör', 'webden arama düğmesi yok')
  else {
    await araDugmesi.click()
    await p.waitForTimeout(600)
    const acik = await p
      .locator('#ara-perde')
      .evaluate((e) => e.classList.contains('acik'))
      .catch(() => false)
    if (!acik) bildir('editör', 'arama modalı AÇILMADI')
    await p.locator('#ara-sorgu').fill('test')
    await p.locator('#ara-git').click()
    await p.waitForTimeout(1500)
    if ((await p.locator('.ara-oge').count()) === 0) bildir('editör', 'arama sonucu çizilmedi')
  }
  if (konsol.length > 0) bildir('editör', `konsol hatası: ${konsol.slice(0, 2).join(' | ')}`)
  const kirikSuzulmus = [...new Set(kirik)].filter((x) => !x.includes('api.iconify.design'))
  if (kirikSuzulmus.length > 0)
    bildir('editör', `kırık istek: ${kirikSuzulmus.slice(0, 3).join(' | ')}`)
  await p.close()
}

await tarayici.close()

if (kusurlar.length > 0) {
  console.error('✗ uçtan uca ' + String(kusurlar.length) + ' kusur:')
  for (const k of kusurlar) console.error('    ✗ ' + k)
  process.exit(1)
}
console.log(
  '  ' + String(EKRANLAR.length) + ' ekran + editör gezildi · konsol hatası yok · kırık istek yok'
)
