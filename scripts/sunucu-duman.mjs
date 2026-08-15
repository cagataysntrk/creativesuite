// `cli-duman` kapısının sunucu bölümü — GERÇEKTEN ayağa kaldırır (D-153, D-164).
//
// `node --check` yalnız sözdizimini görür. Bu betik sunucuyu başlatır, üç ucu çağırır,
// bir dosya değişimi tetikleyip SSE'nin yeni durumu yaydığını doğrular ve kapatır.
// Süreç TEMİZ kapanmalı: kapanmayan bir sunucu kapıyı sonsuza kadar asar.
import { utimesSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = process.env['SUITE_REPO'] ?? join(dirname(fileURLToPath(import.meta.url)), '..')
const { baslat } = await import(join(REPO, 'apps/server/dist/index.js'))
const { systemClock } = await import(join(REPO, 'packages/kernel/dist/index.js'))

const hatalar = []
const bekle = (k, d) => {
  if (!k) hatalar.push(d)
}

const s = await baslat({
  repoRoot: REPO,
  query: { brandId: 'brd_upcytech', eraId: '*', asOf: systemClock.nowIso() },
  kalpAtisiMs: 200,
  debounceMs: 50,
  simdi: () => systemClock.nowIso(),
  port: 0, // 0 = işletim sistemi boş port versin; sabit port paralel koşuda çakışır
  env: { PATH: process.env['PATH'] ?? '' },
})

const U = `http://localhost:${s.port}`
try {
  const saglik = await (await fetch(`${U}/api/saglik`)).json()
  bekle(saglik.ok === true, '/api/saglik ok:true dönmedi')
  // Nabız aralığı İLAN EDİLMELİ: UI onu gömerse sunucu değiştiğinde sessizce
  // yanlış ölçer ve şerit durup dururken "bağlantı yok" der (D-166).
  bekle(typeof saglik.nabizAraligiMs === 'number', '/api/saglik nabizAraligiMs ilan etmiyor')
  bekle(Array.isArray(saglik.izlenen) && saglik.izlenen.length > 0, 'hiçbir dizin izlenmiyor')

  // Marka token'ları çalışma anında servis edilmeli (D-39): statik import tek markayı
  // derlemeye gömerdi. `--role-bg` tanımsızsa kabuk şeffaf açılır.
  const tokens = await fetch(`${U}/api/tokens.css`)
  bekle(tokens.ok, '/api/tokens.css 200 dönmedi')
  const css = await tokens.text()
  bekle(css.includes('--role-bg:'), "token CSS'inde --role-bg TANIMLI değil")
  bekle(css.includes("data-surface='studio'"), "token CSS'inde stüdyo yüzeyi yok")

  const durum = await (await fetch(`${U}/api/durum`)).json()
  bekle(
    /^\d+$/.test(durum.maliyetMikros),
    `maliyetMikros ondalık dize değil: ${durum.maliyetMikros}`
  )
  bekle(durum.kota === null, 'kota ölçülmüyorken null olmalı')
  bekle('bekleyenOnay' in durum, 'bekleyenOnay alanı yok')

  // FAZ-4.6b: launcher planı DONDURUR, hiçbir şey harcamaz (R-47).
  const pl = await (await fetch(`${U}/api/plan?pipeline=instagram-post`)).json()
  bekle(pl.ok === true, '/api/plan instagram-post planını üretemedi')
  bekle(typeof pl.frozen?.digest === 'string', 'donmuş planın özeti yok')
  // Özet KARARLI olmalı: `frozenAt` özete girseydi her istek "plan değişti" derdi.
  const pl2 = await (await fetch(`${U}/api/plan?pipeline=instagram-post`)).json()
  bekle(pl2.frozen?.digest === pl.frozen?.digest, 'donmuş plan özeti KARARLI değil')
  // Fiyatlanmamış ücretli adım BAŞLAT'ı kilitler — eksik tahminle onay verilemez.
  bekle(Array.isArray(pl.bloklar), '/api/plan blok listesi dönmüyor')
  const yokHat = await fetch(`${U}/api/plan?pipeline=yok-boyle-bir-hat`)
  bekle(yokHat.status === 404, 'olmayan pipeline için 404 dönmüyor')

  // FAZ-4.5: bağlam önizleme HİÇBİR ŞEY HARCAMAZ ve boş bölümün NEDENİNİ söyler.
  const bag = await (await fetch(`${U}/api/baglam?tarif=instagram-post`)).json()
  bekle(bag.ok === true, '/api/baglam instagram-post tarifini çözemedi')
  bekle(
    Array.isArray(bag.manifest?.sections) && bag.manifest.sections.length > 0,
    'bağlam manifesti bölümsüz'
  )
  const bosOlan = (bag.manifest?.sections ?? []).find((b) => b.included.length === 0)
  if (bosOlan !== undefined) {
    const neden = bag.bosNedenleri?.[bosOlan.entityType]
    bekle(
      typeof neden === 'string' && neden.length > 0,
      `boş bölüm '${bosOlan.id}' SESSİZ — nedeni yazmıyor (operatör "bağlam kullanmıyor" sanar)`
    )
  }
  const yokTarif = await fetch(`${U}/api/baglam?tarif=yok-boyle-bir-tarif`)
  bekle(yokTarif.status === 404, 'olmayan tarif için boş manifest dönüyor — 404 olmalı')

  // FAZ-4.4 uçları: ters indeks ve git zaman çizgisi GERÇEKTEN çağrılır.
  const etki = await (await fetch(`${U}/api/kayitlar/rec_yok/etki`)).json()
  bekle(typeof etki.ozet === 'string', '/api/kayitlar/:id/etki özet dönmüyor')
  bekle(Array.isArray(etki.kullanimlar), '/api/kayitlar/:id/etki kullanimlar dizisi değil')
  // Hiç kullanılmamış kayıt "etkisi yok" DEMELİ — sessiz boş liste yeterli değil.
  bekle(/etkisi yok|hiç çalıştırma/.test(etki.ozet), 'kullanılmamış kayıt için açık cümle yok')

  const gecmis = await (
    await fetch(`${U}/api/kayitlar/positioning/imalat-verimlilik-konumu/gecmis`)
  ).json()
  bekle(Array.isArray(gecmis.commitler) && gecmis.commitler.length > 0, 'git zaman çizgisi boş')

  const r = await fetch(`${U}/api/olay`)
  const rd = r.body.getReader()
  const dec = new TextDecoder()
  const ilk = dec.decode((await rd.read()).value)
  bekle(ilk.startsWith('event: durum'), 'SSE ilk mesajı durum değil')

  setTimeout(() => {
    const t = systemClock.now() / 1000
    try {
      utimesSync(join(REPO, 'registry/pipelines/instagram-post.pipeline.yaml'), t, t)
    } catch {}
  }, 100)
  let g = ''
  for (let i = 0; i < 12 && !g.startsWith('event: durum'); i++)
    g = dec.decode((await rd.read()).value)
  bekle(g.startsWith('event: durum'), 'dosya değişimi SSE durumu tetiklemedi')
  await rd.cancel()
} finally {
  await s.kapat()
}

if (hatalar.length > 0) {
  for (const h of hatalar) console.log(`    ✗ ${h}`)
  process.exit(1)
}
console.log(
  `    sunucu ayağa kalktı · 8 uç · token · plan dondurma · bağlam · ters indeks · git · SSE`
)
