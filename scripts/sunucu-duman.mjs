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

import { readdirSync as _rd } from 'node:fs'
const _runs = (() => {
  try {
    return _rd(join(REPO, 'derived/runs')).filter((x) => x.startsWith('run_'))
  } catch {
    return []
  }
})()
const ORNEK_RUN = _runs[0] ?? 'run_yok'

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

  // FAZ-4.13: Telegram YÜZEY SINIRI — bot üretim başlatamaz (§4c).
  const tg = (govde) =>
    fetch(`${U}/api/telegram/webhook`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(govde),
    })
  const uretDeneme = await tg({ message: { text: '/uret instagram-post' } })
  bekle(
    uretDeneme.status === 403,
    `Telegram'dan üretim başlatma reddedilmedi (${uretDeneme.status}) — yüzey sınırı yok`
  )
  const uretGovde = await uretDeneme.json().catch(() => ({}))
  bekle(
    typeof uretGovde.neden === 'string' && uretGovde.neden.length > 0,
    'yasak komut NEDENSİZ reddediliyor — kullanıcı başka yazımlar dener'
  )
  // Gerekçesiz red bu yüzeyde de reddedilir (D-173).
  const tgRedsiz = await tg({ message: { text: '/reddet run_x onay' } })
  bekle(tgRedsiz.status === 403, `gerekçesiz red kabul edildi (${tgRedsiz.status})`)
  // Bozuk inline callback sessizce ONAYA dönüşmez.
  const bozukCb = await tg({ callback_query: { data: 'hede|run_x|g' } })
  bekle(bozukCb.status === 400, `bozuk callback ${bozukCb.status} döndü, 400 olmalı`)

  // FAZ-4.12: bütçe tavanı UI'dan ayarlanır ve GEÇERSİZ tavan yazılmaz.
  const bt = await (await fetch(`${U}/api/butce`)).json()
  bekle(bt.tavan !== undefined, '/api/butce tavan dönmüyor')
  bekle(bt.kota === null, 'kota ölçülmüyorken null olmalı — uydurma doluluk yasak')
  bekle(typeof bt.tavan.varsayilan === 'boolean', 'varsayılan tavan kullanıldığı SÖYLENMİYOR')
  const tavanYaz = (govde) =>
    fetch(`${U}/api/butce`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(govde),
    })
  // Çelişkili tavan (çalıştırma > aylık) YAZILMAZ.
  const celiskili = await tavanYaz({ perRunMicros: '9000000', perMonthMicros: '1000' })
  bekle(celiskili.status === 422, `çelişkili tavan kabul edildi (${celiskili.status})`)
  // Sayı olmayan tavan 500 DEĞİL 400.
  const bozuk = await tavanYaz({ perRunMicros: 'abc' })
  bekle(bozuk.status === 400, `sayı olmayan tavan ${bozuk.status} döndü, 400 olmalı`)

  // FAZ-4.11: şema kuru çalıştırması. Reddedilen bir göç 200 DÖNMEZ — durum koduna
  // bakan bir istemci yıkıcı değişikliği başarılı sanardı (D-178).
  const sm = await (await fetch(`${U}/api/semalar`)).json()
  bekle(Array.isArray(sm.semalar) && sm.semalar.length > 0, '/api/semalar boş')
  bekle(
    sm.semalar.every((x) => typeof x.ozniteliktiKayit === 'number'),
    'şema özeti `ozniteliktiKayit` taşımıyor — "0 kayıt kırılacak" açıklanamaz olurdu'
  )
  const kuru = async (govde) =>
    fetch(`${U}/api/semalar/competitor/kuru`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(govde),
    })
  // Alan silmek: SIFIR kayıt etkilense bile reddedilir.
  const sil = await kuru({
    $id: 'competitor',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: { name: { type: 'string' } },
  })
  bekle(sil.status === 409, `alan silme reddedilmedi (${sil.status}) — yıkıcı göç geçiyor`)
  // Profil dışı anahtar analize HİÇ girmemeli.
  const profilDisi = await kuru({
    $id: 'competitor',
    type: 'object',
    additionalProperties: false,
    oneOf: [],
    properties: {},
  })
  bekle(profilDisi.status === 422, 'profil dışı şema analize giriyor')

  // FAZ-4.10: keşif planı BOŞ dört sütun DÖNMEZ — plan yoksa 404.
  const dsc = await fetch(`${U}/api/discovery?run=run_olmayan`)
  bekle(dsc.status === 404, 'plan yokken boş sütun dönüyor — "değişiklik yok" ile karışır')

  // FAZ-4.9: yerleşim spec'i + güvenli alan bandı API'den geliyor.
  const yl = await (await fetch(`${U}/api/yerlesimler`)).json()
  bekle(Array.isArray(yl.yerlesimler) && yl.yerlesimler.length > 0, '/api/yerlesimler boş')
  const reels = yl.yerlesimler.find((x) => x.id === 'instagram-story-9x16')
  bekle(reels !== undefined, 'story/reels yerleşimi yok')
  if (reels !== undefined) {
    // §9.1: 1080×1920'de kullanılabilir bant 950×979. Belge ile kod ayrışırsa
    // hangisinin doğru olduğu anlaşılmaz.
    bekle(
      reels.band?.width === 950 && reels.band?.height === 979,
      `Reels güvenli bandı §9.1 ile uyuşmuyor: ${JSON.stringify(reels.band)}`
    )
    bekle(
      reels.safeArea?.sourceUrl !== reels.sourceUrl,
      'güvenli alan KENDİ kaynağını taşımıyor — yerleşim ölçüsüyle aynı doküman değil'
    )
    bekle(typeof reels.yasGun === 'number', 'spec yaşı ekrana gitmiyor (drift denetimi görünmez)')
  }
  const feed = yl.yerlesimler.find((x) => x.id === 'instagram-feed-4x5')
  bekle(
    feed?.safeArea === null,
    'feed yerleşiminde safeArea null DEĞİL — "chrome yok" ile "sıfır" ayrı'
  )

  // FAZ-4.8: QA okumaları manifest'ten okunur ve "ölçülmedi" ile "geçti" AYRILIR.
  const qa = await (await fetch(`${U}/api/calistirma/run_yok/qa`)).json()
  bekle(qa.ok === false, 'olmayan çalıştırma için QA ok:true dönüyor')
  const runlar = await (await fetch(`${U}/api/kuyruk`)).json()
  void runlar
  // Var olan bir çalıştırma: ölçüm yoksa `olculdu:false` DEMELİ, boş liste yetmez.
  const qa2 = await (await fetch(`${U}/api/calistirma/${ORNEK_RUN}/qa`)).json()
  if (qa2.ok === true) {
    bekle(typeof qa2.olculdu === 'boolean', 'QA yanıtı `olculdu` bayrağı taşımıyor')
    bekle(Array.isArray(qa2.readings), 'QA yanıtı readings dizisi taşımıyor')
  }

  // FAZ-4.7: onay kuyruğu manifest'lerden beslenir ve GEREKÇESİZ REDDİ reddeder.
  const kq = await (await fetch(`${U}/api/kuyruk`)).json()
  bekle(Array.isArray(kq.bekleyenler), '/api/kuyruk bekleyenler dizisi dönmüyor')
  const redsiz = await fetch(`${U}/api/kuyruk/run_yok/onay`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ karar: 'rejected', gerekce: '' }),
  })
  bekle(redsiz.status === 409, 'olmayan çalıştırma/gerekçesiz red 409 dönmüyor')

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
  `    sunucu ayağa kalktı · 18 uç · telegram · bütçe · şema · keşif · yerleşim · qa · kuyruk · SSE`
)
