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
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UC_D_TR, genislet, sade } from './gorsel-tr.mjs'

const KOK = 'https://api.iconify.design'

// ⚠ ⚠ **KATALOG DİSKTEN, ARAMA ANINDA AĞA ÇIKILMIYOR.** 3dicons ve Fluent Emoji'nin
// arama ucu YOK — ikisi de düz dosya deposu. Her harf yazışta GitHub ağacını gezmek
// kabul edilemezdi. `just gorsel-katalog` ile tazeleniyor.
const KATALOG = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'gorsel-katalog.json'), 'utf8')
)

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
/**
 * ⚠ ⚠ **RENKLİ SETLER HER ŞABLONA EKLENİYOR — ve sebebi bir şikâyet.** Depo sahibi:
 * *"editörde bunlar çok sade ve zayıf."* Haklıydı: aşağıdaki hava süzgeci şablonun
 * havasına göre TEK RENKLİ çizgi setleri seçiyordu (`carbon`, `mdi`, `tabler`) ve sonuç
 * gri ikon çuvalıydı. Renkli setler artık her şablonun listesine ekleniyor; hava süzgeci
 * ÇİZGİ setlerini seçmeye devam ediyor, renk ondan bağımsız geliyor.
 */
const RENKLI = ['fluent-emoji', 'noto', 'openmoji', 'twemoji', 'flat-color-icons', 'logos']

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
/**
 * KATALOG araması — 3dicons ve Fluent Emoji 3D.
 *
 * ⚠ ⚠ **PUANLAMA VAR ÇÜNKÜ "İÇERİYOR MU" YETMİYOR.** *"veri"* araması `card index`i de
 * `bar chart`ı da getiriyor; hangisi önce gelmeli? Tam eşleşme > kelime başı > kelime
 * içi > parça. Sırasız bir sonuç listesi, sonucun kendisi kadar kötüdür.
 *
 * ⚠ Türkçe anahtarlar da taranıyor: Fluent'te CLDR'dan gelen (`tr`), 3dicons'ta elle
 * yazılan alan sözlüğü. İnsan *"ampul"* yazınca `light bulb` çıkmalı.
 */
const katalogAra = (sorgu, adet) => {
  const genis = genislet(sorgu)
  const sonuc = []

  const puanla = (metinler) => {
    let en = 0
    for (const [sira, g] of genis.entries()) {
      if (g === '') continue
      // ⚠ ⚠ **GENİŞLETME SIRASI PUANA GİRİYOR.** İlk sürümde girmiyordu ve *"geri
      // kazanım"* aramasında `Seedling`, `Recycling symbol`in ÖNÜNE geçti — çünkü
      // ikisi de tam eşleşiyordu ve sıra rastgeleydi. Aslı ve birincil kavram önce;
      // uzak çağrışım arkada. Ceza küçük (sıra başına 2) — sırayı bir DUVAR değil bir
      // EĞİLİM yapıyor.
      const ceza = Math.min(sira * 2, 20)
      for (const m of metinler) {
        // ⚠ ⚠ **KELİME ORTASINDAN EŞLEŞME YOK — gerçek bir kusurdu.** `atık` araması
        // `Alien`ı getiriyordu, çünkü Türkçe anahtarı *"yaratık"* içinde `atik` geçiyor.
        // Eşleşme bir KELİME SINIRINDA başlamalı; ortadan yakalanan üç harf bir
        // çağrışım değil, bir rastlantıdır.
        const sinirda = m === g || m.startsWith(`${g} `) || m.includes(` ${g}`)
        if (m === g) en = Math.max(en, 100 - ceza)
        else if (m.startsWith(`${g} `)) en = Math.max(en, 70 - ceza)
        else if (m.includes(` ${g} `) || m.endsWith(` ${g}`)) en = Math.max(en, 55 - ceza)
        else if (g.length > 4 && sinirda) en = Math.max(en, 35 - ceza)
      }
    }
    return en
  }

  // ── 3dicons ──
  const d3 = KATALOG.kaynaklar['3dicons']
  for (const o of d3.ogeler) {
    const tr = UC_D_TR[o.ad] ?? []
    const p = puanla([sade(o.ad), sade(o.etiket), ...tr.map(sade)])
    if (p === 0) continue
    // ⚠ Varsayılan `iso/color`: ölçüldü, on iki bileşimin hepsi var ama `iso` açısı
    // izometrik ve karosel tuvalinde en okunaklısı; renk stili de en canlısı.
    sonuc.push({
      tur: 'png',
      kaynak: '3dicons',
      tam: `3dicons:${o.ad}`,
      ad: o.ad,
      setAdi: d3.ad,
      etiket: [o.etiket, ...tr].join(' · '),
      lisans: d3.lisans,
      spdx: d3.lisans,
      pngUrl: `${d3.kok}/iso/color/${o.ad}-iso-color.png`,
      // ⚠ Çeşitler sonuçta taşınıyor: insan aynı nesneyi başka açı/stille isteyebilir
      // ve ikinci bir arama yapmak zorunda kalmamalı.
      cesitler: d3.acilar.flatMap((a) =>
        d3.stiller.map((st) => ({
          etiket: `${a}/${st}`,
          pngUrl: `${d3.kok}/${a}/${st}/${o.ad}-${a}-${st}.png`,
        }))
      ),
      puan: p,
    })
  }

  // ── Fluent Emoji 3D ──
  const fl = KATALOG.kaynaklar.fluent
  for (const o of fl.ogeler) {
    const tr = o.tr ?? []
    const p = puanla([sade(o.ad), ...tr.map(sade)])
    if (p === 0) continue
    sonuc.push({
      tur: 'png',
      kaynak: 'fluent',
      tam: `fluent:${o.ad}`,
      ad: o.ad,
      setAdi: fl.ad,
      etiket: [o.ad, ...tr].join(' · '),
      lisans: fl.lisans,
      spdx: fl.lisans,
      pngUrl: `${fl.kok}/${encodeURIComponent(o.ad)}/3D/${o.dosya}`,
      cesitler: [],
      puan: p + (o.emoji === undefined ? 0 : 5),
    })
  }

  return sonuc.sort((a, b) => b.puan - a.puan).slice(0, adet)
}

export const setleri = (sablonId) => {
  const cizgi = HAVA[sablonId] ?? []
  // ⚠ Hava bilinmiyorsa süzgeç YOK: 236 setin hepsi. Renkli setleri o durumda da
  // eklemek gereksiz — zaten hepsi içinde.
  return cizgi.length === 0 ? [] : [...cizgi, ...RENKLI]
}

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

  // ⚠ ⚠ **KATALOG ÖNCE ve AĞDAN BAĞIMSIZ.** 3D sonuçlar diskteki katalogdan geliyor;
  // Iconify düşse bile arama boş dönmüyor. Depo sahibinin şikâyeti *"çok sade ve zayıf"*
  // idi ve asıl cevap bu: 3D render, saydam, renkli 1715 öğe.
  const katalog = katalogAra(temiz, Math.max(8, Math.floor(adet / 2)))

  const setler = tumSetler ? [] : setleri(sablonId)
  // ⚠ ⚠ **ICONIFY'A TÜRKÇE SORGU GİTMEZ — o Türkçe bilmiyor.** İlk sürüm ham sorguyu
  // olduğu gibi yolluyordu ve *"geri kazanım"* araması Iconify'dan SIFIR sonuç
  // getiriyordu; katalog bulduğu için kusur görünmüyordu ama Iconify'ın 200 bin ikonu
  // Türkçe arayana kapalıydı. Kavram köprüsünün ürettiği İNGİLİZCE karşılık gidiyor.
  // ⚠ Sorgu zaten İngilizceyse köprü onu değiştirmiyor: `genislet` aslı da döndürüyor
  // ve ASCII olan ilk aday seçiliyor.
  const ingilizce = genislet(temiz).find((x) => /^[a-z0-9 ]+$/.test(x) && x !== sade(temiz))
  const iconifySorgu = ingilizce ?? temiz
  const u = new URL(KOK + '/search')
  u.searchParams.set('query', iconifySorgu)
  u.searchParams.set('limit', String(Math.min(Math.max(adet, 1), 64)))
  if (setler.length > 0) u.searchParams.set('prefixes', setler.join(','))
  // ⚠ ⚠ **ICONIFY DÜŞERSE ARAMA DÜŞMÜYOR.** İlk sürüm ağ hatasında `{ok:false}` dönüyordu
  // ve katalog sonuçları da onunla birlikte kayboluyordu — oysa onlar diskte. Dış bir
  // servisin arızası, elimizdeki veriyi görünmez yapmamalı.
  let j = { icons: [], collections: {}, total: 0 }
  let agHatasi = ''
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(12_000) })
    if (!r.ok) agHatasi = 'Iconify ' + String(r.status)
    else j = await r.json()
  } catch (e) {
    agHatasi = 'ağa ulaşılamadı: ' + String(e?.message ?? e)
  }
  if (agHatasi !== '' && katalog.length === 0) return { ok: false, hata: agHatasi }
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
      tur: 'svg',
      kaynak: 'iconify',
      etiket: ad.replace(/-/g, ' '),
      cesitler: [],
    }
  })
  // ⚠ 3D önce: aranan şey *"görsel öge"* ve düz bir çizgi ikonu ile 3D render arasında
  // insanın istediği belli. Iconify sonuçları altta duruyor, kaybolmuyor.
  return {
    ok: true,
    ogeler: [...katalog, ...ogeler],
    toplam: (j.total ?? ogeler.length) + katalog.length,
    suzgec: setler,
    ...(agHatasi === '' ? {} : { uyari: agHatasi }),
  }
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
/**
 * Hazır PNG'yi çeker — 3dicons ve Fluent Emoji için.
 *
 * ⚠ ⚠ **SVG YOLUNDAN GEÇMİYOR ve bu bir GÜVENLİK KAZANCI.** SVG çalıştırılabilir bir
 * belge; bu depo onun için bir temizleyici ve bir rasterleme sayfası taşıyor. PNG öyle
 * değil — bayt bir görüntü, betik taşımıyor. Yeni kaynaklar raster olduğu için o
 * katmanların hiçbirine ihtiyaç yok.
 *
 * ⚠ ⚠ **RENK RAMPASI UYGULANMIYOR ve SEBEBİ VAR.** Iconify ikonu `currentColor`
 * kullanıyor, o yüzden rampa rengiyle boyanabiliyor. 3D render çok renkli bir görüntü;
 * onu tek renge boyamak render'ı yok etmek olurdu. Depo sahibi zaten *"renkli, etkileyici"*
 * istedi — boyamamak bir eksiklik değil, isteğin kendisi.
 *
 * ⚠ Boyut tavanı var: 5 MB üstü bayt yuvaya konmuyor. Sınırsız bir indirme, uzak bir
 * deponun bu depoyu doldurmasına izin vermek olurdu.
 */
export const hazirPngCek = async (url) => {
  if (!/^https:\/\/[\w.-]+\//.test(String(url))) return { ok: false, hata: 'geçersiz adres' }
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20_000) })
    if (!r.ok) return { ok: false, hata: 'kaynak ' + String(r.status) }
    const tip = r.headers.get('content-type') ?? ''
    // ⚠ İçerik TİPİ denetleniyor: adresin `.png` ile bitmesi bir söz, bir kanıt değil.
    if (!tip.startsWith('image/')) return { ok: false, hata: 'görüntü değil: ' + tip }
    const bayt = Buffer.from(await r.arrayBuffer())
    if (bayt.length > 5 * 1024 * 1024)
      return { ok: false, hata: 'çok büyük: ' + String(bayt.length) }
    return { ok: true, b64: bayt.toString('base64'), bayt: bayt.length, tip }
  } catch (e) {
    return { ok: false, hata: 'çekilemedi: ' + String(e?.message ?? e) }
  }
}

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
