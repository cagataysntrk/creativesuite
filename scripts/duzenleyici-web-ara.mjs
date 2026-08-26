// Webden tasarım ögesi arama — editörden, ELLE (FAZ-19.11).
//
// ⚠ ⚠ **BU HATTA GİRMİYOR ve girmemesi bir TASARIM KARARI.** Depo sahibi: *"üretim
// hattında otomatik olmayacak yani mesela bir görsel yuvasına tıklayıp webden ara deyip
// scrape edilebilecek aranabilecek"*. Hat deterministik kalıyor: aynı girdi aynı çıktıyı
// veriyor ve dışarıdan gelen bir varlık koşuyu sessizce değiştirmiyor. Dış kaynak yalnız
// insanın tıkladığı yerde ve o anda giriyor.
//
// ⚠ ⚠ **FOTOĞRAF DEĞİL, TASARIM ÖGESİ.** *"fotoğraf değil görsel ögeler ikon svg tasarım
// vs alakalı şeyler"*. Kaynak bu yüzden Iconify: 236 açık kaynak set, anahtar istemiyor
// ve sonuç SVG — yani **doğası gereği arkaplansız ve çerçevesiz**. Arkaplan silmeye
// gerek yok çünkü hiç arkaplan yok; `rembg`in bu yolda işi yok.
// ⚠ Denenip ELENENLER, bir daha denenmesin diye: `svgrepo.com` bot korumasıyla 429
// veriyor · `poly.pizza` API anahtarı istiyor (`"You need an API key to do that dingus"`)
// ve web sayfası istemci tarafında kuruluyor, sunucu tarafı HTML boş · `openverse` çalışıyor
// ama getirdiği şey FOTOĞRAF, yani istenmeyen şeyin ta kendisi.
//
// ⚠ ⚠ **UZAK SVG DOM'A ASLA GİRMEZ.** Bir SVG `<script>` taşıyabilir; bu depo aynı
// sınıfı bir kez daha yaşadı ve sunucu `/api/varlik/:digest` yolunda `.svg` sunmayı
// KASTEN reddediyor. Burada iki kat koruma var: önizleme `<img src=…>` ile yükleniyor
// (tarayıcı `<img>` bağlamında betiği çalıştırmaz) ve yuvaya konan şey SVG değil,
// sunucuda rasterlenmiş PNG.

/** Iconify — anahtarsız, 236 açık kaynak set, sonuç SVG. */
const KOK = 'https://api.iconify.design'

/**
 * Şablonun havasına yakın set süzgeci.
 *
 * ⚠ ⚠ **BU BİR YARGI, ÖLÇÜM DEĞİL — ve öyle olduğu SÖYLENİYOR.** Bu depoda ölçmeden
 * yazılmış eşikler defalarca yalanlandı; bu tablo bir eşik değil bir BAŞLANGIÇ SÜZGECİ.
 * Yanlış olduğu an kullanıcı `tumSetler` ile kapatıyor, yani yargı bir duvar değil.
 * ⚠ Süzgecin var olma sebebi: *"her şablonun kendi havasına temasına uygun görseller"*.
 * Süzgeçsiz arama 236 setten karışık bir çuval getiriyor ve `memphis`in yumuşak kil
 * dünyasına `carbon`ın keskin sanayi çizgisi düşüyor.
 */
const HAVA = {
  // sanayi, mat kömür gövde, kobalt aksan → ağır, dolu, keskin
  sahne: ['material-symbols', 'carbon', 'mdi'],
  // beton kemer, ağır yüzey → aynı aile
  kavis: ['material-symbols', 'carbon', 'mdi'],
  // izometrik kil, sıcak kırık beyaz, kehribar → yuvarlak, oyuncaklı
  memphis: ['ph', 'solar', 'iconoir'],
  // fırçalanmış metal, lacivert → hassas çizgi
  donen: ['tabler', 'lucide', 'carbon'],
  // kâğıt zemin, kemik beyazı, zarif → ince çizgi
  editoryal: ['ph', 'solar', 'iconoir'],
  'akan-alan': ['ph', 'solar', 'iconoir'],
  alinti: ['ph', 'tabler', 'solar'],
  // veri, kıyas, dizin → nötr ve okunaklı
  'veri-hikayesi': ['carbon', 'tabler', 'lucide'],
  karsilastirma: ['carbon', 'tabler', 'lucide'],
  dizin: ['tabler', 'lucide', 'carbon'],
}

/** Havası bilinmeyen deste için: süzgeç yok, 236 setin hepsi. */
export const setleri = (sablonId) => HAVA[sablonId] ?? []

/**
 * Arama — sonuç listesi + HER SETİN LİSANSI.
 *
 * ⚠ ⚠ **LİSANS SONUÇLA BİRLİKTE GELİYOR ve bu tesadüf değil, ŞART.** §17 bu depoda
 * bir sesi *"bedava katmanının TİCARİ lisansı YOK"* diye reddetti. Bir varlığın nereden
 * geldiği ve hangi lisansla geldiği, varlık yuvaya girerken YAZILMAZSA sonradan
 * retrofit edilemez (Yasa 7 ile aynı mantık). Iconify arama yanıtı `collections`
 * altında `license.title` · `license.spdx` · `license.url` veriyor; hepsi taşınıyor.
 */
export const ara = async (sorgu, { sablonId = '', tumSetler = false, adet = 24 } = {}) => {
  const temiz = String(sorgu ?? '').trim()
  if (temiz === '') return { ok: false, hata: 'sorgu boş' }
  const setler = tumSetler ? [] : setleri(sablonId)
  const u = new URL(KOK + '/search')
  u.searchParams.set('query', temiz)
  u.searchParams.set('limit', String(Math.min(Math.max(adet, 1), 64)))
  if (setler.length > 0) u.searchParams.set('prefixes', setler.join(','))
  let j
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(12_000) })
    if (!r.ok) return { ok: false, hata: 'Iconify ' + String(r.status) }
    j = await r.json()
  } catch (e) {
    return { ok: false, hata: 'ağa ulaşılamadı: ' + String(e?.message ?? e) }
  }
  const kol = j.collections ?? {}
  const ogeler = (j.icons ?? []).map((tam) => {
    const [set, ad] = String(tam).split(':')
    const k = kol[set] ?? {}
    return {
      tam,
      set,
      ad,
      setAdi: k.name ?? set,
      lisans: k.license?.title ?? 'bilinmiyor',
      spdx: k.license?.spdx ?? '',
      lisansUrl: k.license?.url ?? '',
      yazar: k.author?.name ?? '',
      kaynakUrl: 'https://icon-sets.iconify.design/' + set + '/' + ad + '/',
    }
  })
  return { ok: true, ogeler, toplam: j.total ?? ogeler.length, suzgec: setler }
}

/**
 * Uzak SVG'yi temizler — `<script>`, olay niteliği, dış başvuru ve `<foreignObject>` gider.
 *
 * ⚠ ⚠ **BU FONKSİYON RASTERLEME SAYFASINA GİRMEDEN ÖNCE ÇALIŞIR ve sebebi şu: o sayfa
 * benim kurduğum bir sayfa ama içine koyduğum şey BAŞKASININ baytı.** Iconify bugün
 * temiz SVG veriyor; yarın bir set bakımını kaybeder ya da ara sunucu değişir. "Kaynak
 * güvenilir" bir savunma değil — `INGEST` dış metni ASLA talimat olarak sunmuyor (R-50)
 * ve burada aynı ilke baytlara uygulanıyor.
 * ⚠ Beyaz liste değil kara liste olması bilinçli: SVG'nin meşru öge kümesi çok geniş
 * ve beyaz liste ikonların yarısını sessizce boşa çıkarırdı. Tehlikeli olan küme ise
 * kısa ve iyi bilinen.
 */
export const temizle = (svg) => {
  const ham = String(svg ?? '')
  if (!/^\s*<svg[\s>]/i.test(ham)) return { ok: false, hata: 'kök öge <svg> değil' }
  const t = ham
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(script|foreignObject|iframe|embed|object|style)\b[^>]*\/?>/gi, '')
    // ⚠ ⚠ **SMIL ÇALIŞMA ANINDA NİTELİK YAZIYOR — statik tarama onu göremez.**
    // `<animate attributeName="href" values="javascript:…"/>` belgede hiçbir yasak
    // dize taşımadan, animasyon başlayınca `href`i o değere çeviriyor.
    .replace(/<(animate|animateTransform|animateMotion|set)\b[\s\S]*?(?:\/>|<\/\1>)/gi, '')
    // ⚠ ⚠ **TIRNAKSIZ DEĞER: İLK SÜRÜMÜN AÇIĞI ve beni kendi SINAMAM yanılttı.**
    // Regex `"…"` ya da `'…'` şart koşuyordu; `onload=alert(1)` hiç eşleşmiyordu.
    // Sınamada yalnız tırnaklı hâlleri denemiştim — yani testi saldırıya göre değil
    // TEMİZLEYİCİYE göre yazmışım. Bedava yeşil tam olarak budur.
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Dış başvuru: `href`/`xlink:href` yalnız belge içi (`#…`) kalabilir.
    .replace(/\s(?:xlink:)?href\s*=\s*(?:"(?!#)[^"]*"|'(?!#)[^']*'|(?!#)[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
  return { ok: true, svg: t }
}

/** Tek ikonun temizlenmiş SVG'si — `currentColor` KORUNUYOR (renk rasterlemede geliyor). */
export const svgCek = async (tam) => {
  const [set, ad] = String(tam ?? '').split(':')
  if (!set || !ad || !/^[a-z0-9-]+$/i.test(set) || !/^[a-z0-9-]+$/i.test(ad))
    return { ok: false, hata: 'ikon kimliği geçersiz: ' + String(tam) }
  try {
    const r = await fetch(KOK + '/' + set + '/' + ad + '.svg', {
      signal: AbortSignal.timeout(12_000),
    })
    if (!r.ok) return { ok: false, hata: 'Iconify ' + String(r.status) }
    return temizle(await r.text())
  } catch (e) {
    return { ok: false, hata: 'ağa ulaşılamadı: ' + String(e?.message ?? e) }
  }
}

/**
 * Temizlenmiş SVG'yi SAYDAM PNG'ye çevirir — marka rengiyle, Chromium'da.
 *
 * ⚠ ⚠ **RENK HEX'E ÇEVRİLMİYOR, TOKEN OLARAK VERİLİYOR.** İlk tasarım Iconify'ın
 * `?color=` parametresini kullanacaktı; bunun için `var(--ramp-…)` değerini hex'e
 * çözmek gerekiyordu ve bu depoda `oklch` token'ını `getComputedStyle` ile çözmeye
 * çalışmak zaten bir kez yanlış ölçüme yol açtı. Burada gerek yok: ikon `currentColor`
 * kullanıyor, sayfa token CSS'ini taşıyor ve sarmalayıcıya `color: var(--role-…)`
 * yazmak yetiyor. Renk marka uzayında kalıyor, ara bir dönüşüm yok. → R-35
 *
 * ⚠ Zemin SAYDAM: `omitBackground` olmadan Chromium beyaz basar ve "arkaplansız"
 * vaadi ilk adımda ölürdü.
 *
 * ⚠ ⚠ **CHROMIUM `withPage` İLE AÇILIYOR — `chromium.launch()` YAZMAK BİR KAPI İHLALİ.**
 * İlk sürüm `playwright`i doğrudan import ediyordu ve iki şeyi birden kırıyordu:
 * `chokepoints.json → chromium-baslatan` tarayıcıyı açan TEK dosyayı `browser.ts` diye
 * bağlıyor (R-30, tek motor yasası), ve `playwright` zaten `scripts/`ten çözülmüyor —
 * paket yalnız `packages/render` altında bildirilmiş. Kapı burada iki kez haklıydı:
 * hem mimari hem de çalışma zamanı aynı yeri gösteriyordu.
 */
export const pngYap = async (
  svg,
  { genislik = 1024, yukseklik = 1024, renk = '', tokenCss = '', withPage } = {}
) => {
  if (typeof withPage !== 'function') return { ok: false, hata: 'withPage verilmedi' }
  // ⚠ ⚠ **`data-surface="kreatif"` OLMADAN RENK SESSİZCE SİYAHA DÜŞÜYOR.** Token CSS'i
  // rolleri `[data-surface='kreatif'] { --role-…: … }` altında tanımlıyor; nitelik
  // taşımayan bir kökte `var(--role-accent)` ÇÖZÜLMEZ, `color` geçersiz olur ve tarayıcı
  // devralınan siyahı çizer. İlk sürüm tam bunu yaptı: iki farklı renkle konan iki ikon
  // BİREBİR aynı bayt çıktı — hata mesajı yok, uyarı yok, yalnız yanlış renk.
  //
  // ⚠ ⚠ **SVG SAYFAYA GÖMÜLMÜYOR, `<img>` İÇİNDE YÜKLENİYOR — ve bu bir REGEX'İN
  // YERİNE GEÇEN YAPISAL GARANTİ.** İlk sürüm temizlenmiş SVG'yi doğrudan DOM'a
  // basıyordu ve temizleyicinin üç açığı vardı (tırnaksız olay niteliği · `<style>`
  // `@import` · SMIL `<animate>`). Kara listeye bir tur daha eklemek aynı sınıfı
  // dördüncü kez davet ederdi: tarayıcı `<img>` bağlamında SVG betiğini ÇALIŞTIRMAZ,
  // dış kaynak çekmez, olay dinleyicisi kurmaz. Temizleyici ikinci katman olarak
  // duruyor — bu depoda R-20 da tek fonksiyona güvenmiyor, iki katmanla zorluyor.
  //
  // ⚠ `<img>`e giden SVG ayrı bir belge: sayfanın `color`unu DEVRALMAZ, yani
  // `currentColor` orada siyah kalırdı. O yüzden renk sayfada ÇÖZÜLÜP metne yazılıyor.
  // ⚠ Çözülen değer PARSE EDİLMİYOR, olduğu gibi taşınıyor: `oklch(…)` da `rgb(…)` da
  // geçerli bir SVG boyası. `oklch`i elle hex'e çevirmeye çalışmak bu depoda zaten bir
  // kez yanlış ölçüme yol açtı.
  const kabuk = `<!doctype html><meta charset="utf-8"><style>
${tokenCss}
  html,body{margin:0;background:transparent}
  #k{width:${String(genislik)}px;height:${String(yukseklik)}px;display:grid;place-items:center}
  #k img{width:88%;height:88%;object-fit:contain}
  #prob{position:absolute;left:-9999px${renk === '' ? '' : ';color:' + renk}}
</style><body data-surface="kreatif"><span id="prob"></span><div id="k"></div></body>`
  const r = await withPage(async (p) => {
    await p.setViewportSize({ width: genislik, height: yukseklik })
    await p.setContent(kabuk, { waitUntil: 'load' })
    const cozulen =
      renk === '' ? '' : await p.evaluate('getComputedStyle(document.querySelector("#prob")).color')
    const boyali =
      cozulen === '' ? svg : svg.replace(/currentColor/g, String(cozulen).replace(/"/g, ''))
    // ⚠ ⚠ **TARAYICI GÖVDESİ DİZE, OK FONKSİYONU DEĞİL — ve sebebi lint kapısı.**
    // İlk sürüm `p.evaluate(([b]) => { document… })` yazıyordu; `document` Node
    // kapsamında YOK ve `no-undef` haklı olarak kırmızı döndü. Çözüm globals listesine
    // `document` eklemek DEĞİL — o, gerçek bir denetimi bütün betikler için susturmak
    // olurdu. Deponun kendi düzeni zaten bu: `puntoOlcumu` da gövdesini dize veriyor.
    // ⚠ Ters tırnak yok (R-98 · `olcum-ters-tirnak`): gövde düz dize birleştirmesiyle.
    await p.evaluate(
      '(() => { const im = document.createElement("img");' +
        ' im.src = "data:image/svg+xml;base64," + ' +
        JSON.stringify(Buffer.from(boyali, 'utf8').toString('base64')) +
        '; document.querySelector("#k").appendChild(im); return im.decode() })()'
    )
    const png = await p.locator('#k').screenshot({ omitBackground: true })
    return png.toString('base64')
  })
  return r.ok ? { ok: true, b64: r.value } : { ok: false, hata: 'rasterleme başarısız' }
}
