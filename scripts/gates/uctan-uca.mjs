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

// ── 3: EKRANLAR İŞE YARIYOR MU (FAZ-19.13) ──────────────────────────────────
//
// ⚠ ⚠ **BU BÖLÜM BİR ŞİKÂYETTEN DOĞDU ve şikâyet HAKLIYDI.** Kapının ilk iki bölümü
// *"ekran açılıyor mu, konsol temiz mi"* diye soruyordu ve hepsi yeşildi — depo sahibi
// aynı anda *"panel aşırı işlevsiz, hiçbir şey çalışmıyor"* diyordu. İkisi de doğruydu:
// açılan bir ekran işleyen bir ekran DEĞİLDİR. Bir kapı ölçmediği şeyi güvenceye alamaz
// ve ölçmediğini ölçüyormuş gibi görünmesi, hiç ölçmemekten kötüdür.
//
// ⛔ Bu bölüm HİÇBİR ŞEY YAZMIYOR: yalnız okuma ve durum değiştirmeyen tıklamalar.
// Yazma yolları `yayin-takvimi.test.ts`te sınanıyor — gerçek deftere yazan bir kapı,
// her koşusunda sahibin takvimine çöp bırakırdı.
{
  const { p } = await sayfaAc()

  // YAYIN — takvim bir IZGARA mı, ekleme yapılabiliyor mu.
  await p.goto(`${PANEL}/#/yayin-akisi`, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await p.waitForTimeout(3000)
  const baslik = await p.locator('.takvim-baslik').count()
  if (baslik !== 7) bildir('yayın', `takvim ${String(baslik)} sütun başlığı — yedi olmalı`)
  const gun = await p.locator('.takvim-gun').count()
  if (gun !== 35 && gun !== 42)
    bildir('yayın', `takvim ${String(gun)} gün hücresi — 35 ya da 42 olmalı`)
  if ((await p.locator('.takvim-bugun').count()) !== 1) bildir('yayın', 'bugün VURGULANMIYOR')
  // ⚠ Ekleme düğmesi HER günde: takvimin ekleyemediği bir takvim rapordur.
  if ((await p.locator('.takvim-ekle').count()) !== gun)
    bildir('yayın', 'ekleme düğmesi her günde YOK')
  // ⚠ ⚠ **İKİ AYRI KUTU VAR ve bu kapı ilk koşusunda ikisini KARIŞTIRDI.** Boş güne
  // tıklayınca *"bu güne hangi üretim konsun"* (`gun-kutusu`), var olan bir gönderiye
  // tıklayınca *"bu gönderinin kararları"* (`gonderi-kutusu`) açılıyor. İkisi aynı
  // sınıfı taşıyordu; kapı yanlış kutuda dört düğme arayıp kusur bildirdi — ve haklıydı:
  // ayırt edilemeyen iki kutu insanı da karıştırır. Sınıf o yüzden ayrıldı.
  await p.locator('.takvim-ekle').first().click({ force: true })
  await p.waitForTimeout(900)
  if ((await p.locator('.gun-kutusu').count()) === 0)
    bildir('yayın', 'boş güne tıklayınca gün kutusu AÇILMIYOR')

  // KOŞULAR — süzgeçler gerçekten süzüyor mu.
  await p.goto(`${PANEL}/#/gecmis`, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await p.waitForTimeout(3000)
  // ⚠ Sütunlar TABLO görünümünde: varsayılan kart görünümünde tablo yok ve kapı ilk
  // koşusunda "şablon sütunu YOK" dedi — kendi yanlış pozitifi.
  await p.getByLabel(/^görünüm/).selectOption('tablo')
  await p.waitForTimeout(1000)
  const basliklar = await p.locator('table thead th').allTextContents()
  for (const sutun of ['şablon', 'konu']) {
    if (!basliklar.some((x) => x.trim() === sutun)) bildir('koşular', `"${sutun}" sütunu YOK`)
  }
  const oncesi = await p.locator('table tbody tr').count()
  const kapiSecici = p.getByLabel(/^bekleyen kapı/)
  const kapiSecenek = await kapiSecici.locator('option').count()
  if (kapiSecenek < 2) bildir('koşular', 'bekleyen kapı süzgeci BOŞ')
  else {
    const ilkKapi = await kapiSecici.locator('option').nth(1).getAttribute('value')
    await kapiSecici.selectOption(ilkKapi ?? '')
    await p.waitForTimeout(700)
    const sonrasi = await p.locator('table tbody tr').count()
    // ⚠ Süzgeç seçildiğinde satır sayısı DEĞİŞMİYORSA süzgeç kozmetiktir. Eşit olması
    // meşru olabilir (hepsi aynı kapıda) — o yüzden ARTMASI kusur sayılıyor.
    if (sonrasi > oncesi) bildir('koşular', 'kapı süzgeci satır sayısını ARTIRDI — süzmüyor')
    // ⚠ ⚠ **SÜZGEÇ GERİ ALINIYOR — kapı kendi izini bıraktı ve sonraki bölümü düşürdü.**
    // Seçilen kapı (`insan-onayi`) yalnız elenmiş koşularda var; elenenler gizliyken
    // liste boşalıyor ve bir sonraki bölüm *"hiç kart çizilmedi"* diyordu. Kendi
    // bıraktığı durumu ölçen bir kapı, kendi yanlış pozitifini üretir.
    await kapiSecici.selectOption('')
    await p.waitForTimeout(700)
  }

  // ── BİRLEŞİK EKRAN: koşu ekranı VARLIK ekranını da kapsıyor mu ────────────
  //
  // ⚠ ⚠ **BİRLEŞMENİN TEK GERÇEK RİSKİ KAYIPTI.** Varlık ekranı yalnız varlık ÜRETMİŞ
  // koşuları görüyordu; koşu ekranı hepsini. Birleşimi varlık listesi üzerine kursaydım
  // 192 koşu sessizce düşerdi ve düştüğü hiçbir yerde yazmazdı. Kapı tam olarak bunu
  // sınıyor: ekrandaki kart sayısı ile API'nin koşu sayısı EŞİT mi.
  await p.goto(`${PANEL}/#/gecmis`, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await p.waitForTimeout(3500)
  // ⚠ ⚠ **GÖRÜNÜM AÇIKÇA SEÇİLİYOR — kapı kendi izini bıraktı.** Önceki bölüm tabloya
  // geçiyor; `goto` bir hash değişimi ve tek sayfa uygulamasında React durumu SİLİNMİYOR,
  // yani ekran hâlâ tablo. Kapı "kart çizilmedi" dedi ve haklıydı: kendi bıraktığı
  // durumu ölçüyordu. Bir kapı, önceki adımının izini temizlemekle yükümlüdür.
  await p.getByLabel(/^görünüm/).selectOption('kart')
  await p.waitForTimeout(1200)
  const grup = await p.locator('.grup').count()
  if (grup === 0) bildir('birleşik', 'kart görünümünde hiç kart çizilmedi')
  else {
    for (const [ad, sec] of [
      ['takvim', 'takvim'],
      ['adımlar', 'adımlar'],
      ['ele', 'ele'],
    ]) {
      if ((await p.locator(`.kart-eylem button:has-text("${sec}")`).count()) !== grup)
        bildir('birleşik', `${ad} düğmesi her kartta YOK`)
    }
    const kapida = await p.locator('.kart-bilgi .is-uyari').filter({ hasText: '⏸' }).count()
    const onay = await p.locator('.kart-eylem button:has-text("onayla")').count()
    if (kapida !== onay)
      bildir('birleşik', `${String(kapida)} kapı rozeti ama ${String(onay)} onay düğmesi`)

    // ⚠ ⚠ **HİÇBİR KOŞU DÜŞMÜYOR MU** — birleşimin asıl sınaması.
    const api = await p.evaluate(async () => {
      const c = await (await fetch('/api/calistirmalar')).json()
      return c.calistirmalar.length
    })
    const kutu = p.getByLabel(/elenenleri/)
    await kutu.check()
    await p.waitForTimeout(2500)
    const hepsi = await p.locator('.grup').count()
    if (hepsi !== api)
      bildir('birleşik', `API ${String(api)} koşu diyor, ekranda ${String(hepsi)} kart — KAYIP VAR`)
    // ⚠ Varlığı olmayan koşu DÜŞMEMELİ, "slayt üretmedi" demeli.
    if ((await p.locator('.grup .bos:has-text("slayt üretmedi")').count()) === 0)
      bildir(
        'birleşik',
        'varlıksız koşu hiç görünmüyor — eski varlık ekranının kusuru geri gelmiş olabilir'
      )
    await kutu.uncheck()
    await p.waitForTimeout(1500)

    // ⚠ Ayrıntı KARTIN İÇİNDE açılıyor mu: sayfanın dibinde açılan bir ayrıntı,
    // yirminci kartta hiç açılmamış gibi görünür.
    const kart = p.locator('.grup').first()
    await kart.locator('button:has-text("adımlar")').click()
    await p.waitForTimeout(2600)
    if ((await kart.locator('article').count()) === 0)
      bildir('birleşik', 'adımlar kartın İÇİNDE açılmıyor')
    for (const b of ['Tekrar', 'İstasyon zinciri', 'İnsan kararları', 'Donmuş kayıt kümesi']) {
      if ((await kart.locator(`h3:has-text("${b}")`).count()) === 0)
        bildir('birleşik', `ayrıntıda "${b}" bölümü KAYIP`)
    }
    // ⚠ Tablo görünümü de kaybolmamalı: iki yoğunluk, tek veri.
    await p.getByLabel(/^görünüm/).selectOption('tablo')
    await p.waitForTimeout(1200)
    if ((await p.locator('table tbody tr').count()) === 0) bildir('birleşik', 'tablo görünümü BOŞ')
    if ((await p.locator('.grup').count()) !== 0)
      bildir('birleşik', 'tabloya geçince kartlar duruyor')
    await p.getByLabel(/^görünüm/).selectOption('kart')
    await p.waitForTimeout(900)
  }

  // KOŞU DETAYI — platform başına metin paneli.
  const ilkKosu = await p
    .locator('.grup button.hizli:has-text("aç")')
    .first()
    .click()
    .then(
      () => p.waitForTimeout(3500),
      () => undefined
    )
  void ilkKosu
  const platformSatiri = await p.locator('.metin-platformlari > li').count()
  if (platformSatiri !== 4)
    bildir('koşu detayı', `${String(platformSatiri)} platform satırı — dört olmalı`)
  // ⚠ Karar kutusu koşu detayında HER ZAMAN var: takvimde gönderi olmayabilir (hiçbir
  // üretim onaylanmamışsa takvim boştur) ama dört düğme burada her koşuda sınanabilir.
  if ((await p.locator('.gonderi-kutusu').count()) === 0)
    bildir('koşu detayı', 'takvim kutusu YOK — özel tarih planlanamaz')
  else {
    for (const dugme of [
      'bu tarihe planla',
      'elle yayınladım',
      'takvimden çıkar',
      'kararı geri al',
    ]) {
      if ((await p.locator(`.gonderi-kutusu button:has-text("${dugme}")`).count()) === 0)
        bildir('koşu detayı', `"${dugme}" düğmesi YOK`)
    }
    if ((await p.locator('.gonderi-kutusu input[type=checkbox]').count()) !== 4)
      bildir('koşu detayı', 'dört platform kutucuğu YOK')
  }
  await p.close()
}

await tarayici.close()

if (kusurlar.length > 0) {
  console.error('✗ uçtan uca ' + String(kusurlar.length) + ' kusur:')
  for (const k of kusurlar) console.error('    ✗ ' + k)
  process.exit(1)
}
console.log(
  '  ' +
    String(EKRANLAR.length) +
    ' ekran + editör gezildi · konsol hatası yok · kırık istek yok · yayın/birleşik-liste/koşu-detayı İŞLEVSEL · hiçbir koşu düşmüyor'
)
