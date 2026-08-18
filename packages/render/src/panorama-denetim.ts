// HEDEF: packages/render/src/panorama-denetim.ts
//
// Panorama denetimi — çıktıya BAKAN ölçüm (FAZ-15.8 · §11 · R-71).
//
// ⚠ ⚠ **BU DOSYA BİR ALIŞKANLIKTAN DOĞDU: "metrik yeşilken çıktı kırık olabilir."**
// Bu oturumda on iki kusur yalnızca render edilip BAKILARAK bulundu — sabit beyaz
// paneller, kaybolan hayalet rakam, birbirine yapışan kelimeler, hiçbir şey anlatmayan
// çubuk grafik. Hepsinin ortak yanı: var olan bir testi geçiyorlardı. Buradaki ölçümler
// "öge var mı" diye değil, **"göründüğü gibi mi duruyor"** diye soruyor.
//
// ⚠ ⚠ **ÖLÇÜM DOM'DAN, BELGEDEN DEĞİL.** Belgeye bakan bir denetim, belgenin kendisiyle
// aynı varsayımları paylaşır ve asla kırmızıya dönmez — bu oturumda `column_in_band`,
// `ghost_overlap` ve `spacing_offscale` tam olarak böyle kırıldı. Sorular tarayıcıya
// soruluyor: kutu taştı mı, hangi glif çizilemedi, metin kesim çizgisini geçti mi.
//
// ⚠ **DÜZELTME BURADA DEĞİL.** Denetim yalnız kusuru ve YERİNİ söylüyor; düzeltmeyi
// uyarlama katmanı yapıyor (`sablon-uyarla`), çünkü kompozisyonu koruyan tek yer orası.
// Denetim düzeltseydi, düzelttiği şeyi kimse doğrulamazdı.

import { withPage, type BrowserResult, type Oturum, type Page } from './browser.js'
import { kapsamDisiKarakterler } from './fonts.js'
import { panoramaHtml, puntoOlcumu, type PanoramaBelgesi } from './panorama.js'

export type KusurTuru =
  /** Bir metin kutusu içeriğini kırpıyor — satır ya da kelime görünmüyor. */
  | 'tasma'
  /** Fontta olmayan glif çizildi — Türkçe aksanların bilinen hata modu. */
  | 'eksik-glif'
  /** Metin kesim çizgisini geçiyor: yarısı bir slaytta, yarısı ötekinde. */
  | 'kesim-uzeri-metin'
  /** Şablon kesintisizlik iddia ediyor ama hiçbir öge kesimi aşmıyor. */
  | 'kesintisizlik-yok'
  /**
   * Tek bir kartın uzun kelimesi TÜM karoselin başlık ölçeğini çökertiyor.
   *
   * ⚠ ⚠ **BU KUSUR TÜRÜ, BİR İHLAL DENEMESİNİN ÜRÜNÜ.** Kasten 66 harflik bölünemez bir
   * kelime yazıldı ve denetim "0 kusur" dedi — çünkü taşma ARANIYORDU ve taşma yoktu:
   * `puntoOlcumu` puntoyu 96,1'den 30,8 px'e indirip kelimeyi sığdırmıştı. Sistem
   * doğru çalışıyordu; ölçülen şey yanlıştı. Gerçek kusur taşma değil, ÇÖKME: tavan
   * tüm kartların en darından geldiği için bir kart altı kartın hepsini küçültüyor ve
   * poster tipografisi 30 px'e iniyor. Görünen kusuru arayan bir denetim, görünmez
   * kusuru kaçırır.
   */
  | 'punto-cokmesi'
  /** Bir kartın metni tuvalin dışına taşıyor. */
  | 'kart-disi'
  /**
   * `matlama` bekleniyor ama görselin zemini siyah DEĞİL — kesim tutmayacak.
   *
   * ⚠ ⚠ **BU KUSUR TÜRÜ GERÇEK BİR ÇIKTIYA BAKARAK DOĞDU.** `kesik` kırpma, brief'in
   * *"plain solid black background"* istemesine ve alfanın o zeminin parlaklığından
   * türetilmesine dayanıyor. Katalog kaydı bunu *"garantiyi rica etme, yapıya göm"*
   * diye anlatıyor — ama brief bir RİCA'dır: hat koştu, model açık gri bir stüdyo
   * zemini üretti, luma anahtarı hiçbir şeyi kesmedi ve çıktıda kesik özne yerine
   * DİKDÖRTGEN bir fotoğraf durdu. Yapıya gömülmüş olan alfa türetimiydi; zeminin
   * siyah olması hâlâ modelin uymasına bağlı ve o yüzden ÖLÇÜLMESİ gerekiyor.
   */
  | 'matlama-tutmuyor'
  /**
   * **Süs, içerikten büyük.** Hayalet rakam kartın en büyük ögesi ve başlık + gövde +
   * panel toplamını aşıyor.
   *
   * ⚠ ⚠ **BU KUSUR BİR ÖLÇÜMDEN DOĞDU ve sayılar ezici.** `veri-hikayesi` — adı üstünde
   * VERİ şablonu — kartlarında panel kadrajın %0,9–4,9'unu tutuyordu, hayalet ise
   * %22–26'sını. Yani ekrandaki en büyük şey dekoratif bir gri rakamdı ve şablonun tüm
   * amacı olan veri bir kırıntıydı. Depo sahibinin *"aşırı bilgisayar işi duruyor"*
   * tespitinin sayısal karşılığı tam olarak bu: hiyerarşi ters.
   *
   * ⚠ Hayaleti YASAKLAMIYOR — gerçek koşularda çıktının en tasarımsal ögesiydi. Ölçtüğü
   * tek şey ORAN: süs içerikten büyükse kompozisyon süsün etrafında kurulmuş demektir.
   */
  | 'sus-baskin'

export interface Kusur {
  readonly tur: KusurTuru
  /** Hangi kart — panoramada 1'den başlıyor. `null` ise belge geneli. */
  readonly kart: number | null
  readonly aciklama: string
  /** Uyarlamanın hangi alanını değiştirmesi gerektiği; yoksa `null`. */
  readonly alan: 'baslik' | 'govde' | 'ustBaslik' | 'panel' | 'hayalet' | null
}

/**
 * Belgenin kesintisizlik İDDİA edip etmediği.
 *
 * ⚠ **İddia etmeyen şablon bu kusurdan muaf** ve bu `memphis`in kaydıyla birebir aynı:
 * *"olmayan bir sürekliliği iddia etmemek, zayıf bir süreklilik kurmaktan dürüst."*
 * Her şablona kesintisizlik dayatan bir denetim, `memphis`i kalıcı kırmızıya çevirirdi.
 */
const kesintisizlikIddiasi = (doc: PanoramaBelgesi): boolean =>
  doc.bant.tip !== 'yok' ||
  doc.alanSiniri !== undefined ||
  // ⚠ ⚠ **HER GÖRSEL BİR SÜREKLİLİK İDDİASI DEĞİL — ilk sürüm öyle sayıyordu ve `donen`i
  // haksız yere kırmızıya çevirdi.** `daire` kırpma TANIMI GEREĞİ kapalı bir öge: maskesi
  // kartın içinde duran bir madalyon. `kesik` (gövdesi çerçeveyi aşan özne) ve `tam`
  // (kenardan kenara fotoğraf) ise taşımak için var. `donen`in sürekliliği zaten renk
  // ROTASYONU — katalog kaydı bunu açıkça söylüyor ve denetim onu okumak yerine
  // görsellerin varlığından çıkarım yaptığı için yanıldı.
  doc.gorseller.some((g) => g.kirpma !== 'daire')

const OLCUM = (kesimler: readonly number[], iddia: boolean): string => `(() => {
  const kusurlar = []
  const kesimler = ${JSON.stringify(kesimler)}
  const kartlar = Array.from(document.querySelectorAll('.kart'))

  // ── taşma: kutu içeriğini kırpıyor mu ────────────────────────────────────
  // ⚠ 1 px tolerans: alt piksel yuvarlaması gerçek bir taşma değil.
  // ⚠ ⚠ **DİKEY TAŞMA YALNIZ KIRPAN KUTUDA KUSUR — ilk sürüm bunu ayırmadı ve BEŞ
  // ŞABLONU birden kırmızıya çevirdi.** Ölçülen değerler satır aralığıyla birebir
  // orantılıydı: satirAraligi 0,96 → 8 px; 1,00 → 5 px; 1,08 → 0 px; 1,30 → 0 px.
  // Yani "taşma" diye raporlanan şey, SIKI SATIR ARALIĞINDA glif mürekkebinin satır
  // kutusunu aşması — poster tipografisinin tanımı, kusuru değil. overflow:visible olan
  // bir kutuda içerik KIRPILMIYOR; kırpılmayan bir şey görünmez olmaz.
  // Yatay taşma ise overflow:visible olsa bile kusur: sütun bir TASARIM sınırı ve onu
  // asan metin komsu ogenin ustune yuruyor (Turkce uzun kelimenin bilinen hatasi, R-23).
  const alanlar = [['.baslik','baslik'], ['.govde','govde'], ['.ust-baslik','ustBaslik'],
                   ['.panel','panel'], ['.sayilar','panel'], ['.etiketler','panel']]
  kartlar.forEach((k, i) => {
    for (const [sec, alan] of alanlar) {
      for (const e of k.querySelectorAll(sec)) {
        if (e.scrollWidth > e.clientWidth + 1)
          kusurlar.push({ tur:'tasma', kart:i+1, alan,
            aciklama: sec + ' yatayda ' + (e.scrollWidth - e.clientWidth) + ' px taşıyor' })
        const kirpiyor = getComputedStyle(e).overflowY !== 'visible'
        if (kirpiyor && e.scrollHeight > e.clientHeight + 1)
          kusurlar.push({ tur:'tasma', kart:i+1, alan,
            aciklama: sec + ' dikeyde ' + (e.scrollHeight - e.clientHeight) + ' px kırpılıyor' })
      }
    }
  })

  // ── kart dışı: metin tuvalden çıkıyor mu ─────────────────────────────────
  const tuval = document.getElementById('sahne').getBoundingClientRect()
  kartlar.forEach((k, i) => {
    for (const e of k.querySelectorAll('.baslik, .govde, .ray, .panel')) {
      const r = e.getBoundingClientRect()
      if (r.bottom > tuval.bottom + 1 || r.top < tuval.top - 1)
        kusurlar.push({ tur:'kart-disi', kart:i+1, alan:null,
          aciklama: e.className + ' dikeyde tuvali aşıyor' })
    }
  })

  // ── kesim üzeri metin: metin ASLA kesimi geçmemeli ───────────────────────
  // ⚠ Hayalet, görsel ve bant GEÇEBİLİR — kesintisizliği kuran onlar. Okunacak metnin
  // ikiye bölünmesi ise her zaman kusur: yarım bir cümle okunmaz.
  kartlar.forEach((k, i) => {
    for (const e of k.querySelectorAll('.baslik, .govde, .ust-baslik, .panel, .sayilar, .etiketler')) {
      const r = e.getBoundingClientRect()
      for (const x of kesimler)
        if (r.left < x - 0.5 && r.right > x + 0.5)
          kusurlar.push({ tur:'kesim-uzeri-metin', kart:i+1, alan:null,
            aciklama: 'kesim çizgisi ' + Math.round(x) + ' px metni bölüyor' })
    }
  })

  // ── matlama: kesik kırpmada görselin zemini gerçekten siyah mı ───────────
  // ⚠ Ölçüm HAM görselden: CSS filtresi uygulanmış hâlden değil. Filtrelenmiş pikseli
  // ölçmek, filtrenin kendi çıktısını kendine sormak olurdu.
  for (const img of document.querySelectorAll('img.gorsel.kesik')) {
    const c = document.createElement('canvas')
    const g = c.getContext('2d')
    if (g === null || img.naturalWidth === 0) continue
    c.width = img.naturalWidth; c.height = img.naturalHeight
    g.drawImage(img, 0, 0)
    // ⚠ Pencere görsele göre: sabit 12 px, 8 px'lik bir test görselinde sınır dışına
    // taşıyor ve getImageData boş dönüyordu — ölçüm SESSİZCE hiçbir şey ölçmüyordu.
    const n = Math.max(1, Math.min(12, Math.floor(Math.min(c.width, c.height) / 3)))
    const noktalar = [[0,0],[c.width-n,0],[0,c.height-n],[c.width-n,c.height-n]]
    let toplam = 0
    for (const [x,y] of noktalar) {
      const d = g.getImageData(Math.max(0,x), Math.max(0,y), n, n).data
      let s = 0
      for (let i = 0; i < d.length; i += 4) s += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]
      toplam += s / (d.length / 4)
    }
    const ort = toplam / noktalar.length
    // 34/255: luma anahtarı bu eşiğin altında güvenilir kesiyor; üstünde zemin kalıyor.
    if (ort > 34)
      kusurlar.push({ tur:'matlama-tutmuyor', kart:null, alan:null,
        aciklama: 'kesik görselin köşe parlaklığı ' + Math.round(ort) +
          '/255 — zemin siyah değil, luma anahtarı kesmeyecek ve fotoğraf DİKDÖRTGEN kalacak' })
  }

  // ── süs baskınlığı: hayalet, içerik toplamını aşmamalı ───────────────────
  //
  // ⚠ Alan ölçülüyor, punto değil: bir rakam dar ama çok uzun olabilir. Göz alanı görüyor.
  kartlar.forEach((k, i) => {
    const kr = k.getBoundingClientRect()
    const alan = (e) => { if (!e) return 0
      const r = e.getBoundingClientRect(); return (r.width * r.height) / (kr.width * kr.height) }
    const hayalet = alan(k.querySelector('.hayalet'))
    if (hayalet === 0) return
    let icerik = ['.baslik', '.govde', '.panel', '.sayilar', '.etiketler', '.vafel']
      .reduce((t, sec) => t + alan(k.querySelector(sec)), 0)
    // ⚠ ⚠ **GÖRSEL DE İÇERİKTİR — ilk sürüm onu SAYMIYORDU ve bu, kuralı tam olarak
    // görsel sürücülü şablonlarda (sahne, donen, editoryal) yanlış yapıyordu.**
    // O şablonlarda asıl içerik fotoğraf; metin yalnız ona eşlik ediyor. Görselleri
    // dışarıda bırakan bir "içerik" tanımı, fotoğrafı süs sayar.
    // ⚠ Görseller kartın DIŞINDA, ayrı bir katmanda (kesimi aşabilmeleri için): kesişim
    // hesaplanıyor, querySelector işe yaramaz.
    for (const g of document.querySelectorAll('.gorsel, .gorsel-yer')) {
      const gr = g.getBoundingClientRect()
      const en = Math.max(0, Math.min(kr.right, gr.right) - Math.max(kr.left, gr.left))
      const boy = Math.max(0, Math.min(kr.bottom, gr.bottom) - Math.max(kr.top, gr.top))
      icerik += (en * boy) / (kr.width * kr.height)
    }
    if (hayalet > icerik) {
      kusurlar.push({ tur:'sus-baskin', kart:i+1, alan:'hayalet',
        aciklama: 'hayalet kartın %' + Math.round(hayalet*100) + "'ini tutuyor, içerik (başlık+gövde+panel) %"
          + Math.round(icerik*100) + " — süs içerikten büyük" })
    }
  })

  // ── kesintisizlik: iddia varsa BİR ÖGE kesimi aşmalı ─────────────────────
  if (${iddia ? 'true' : 'false'}) {
    const asanlar = Array.from(document.querySelectorAll('.hayalet, .gorsel, .gorsel-yer, .leke'))
      .filter((e) => { const r = e.getBoundingClientRect()
        return kesimler.some((x) => r.left < x - 0.5 && r.right > x + 0.5) })
    // ⚠ ⚠ **DOĞRU SORU "BANT VAR MI" DEĞİL, "KESİMİ GEÇİYOR MU".** İlk sürüm ögenin
    // varlığına baktı; ikincisi çizilmiş bir yol aradı ve İKİSİ DE yakalamadı: boş bir
    // ok bandı bile 21 karakterlik bir path (ok başlığı tanımı) basıyor. Kesintisizlik
    // bir ögenin VAR OLMASI değil, kesim çizgisini AŞMASIDIR — ölçülecek şey tam olarak
    // iddianın kendisi. Varlığı ölçen iki deneme de aynı sebeple boşa gitti: iddia ile
    // ölçüm farklı şeylerdi.
    const bantVar = Array.from(
      document.querySelectorAll('.bant path, .bant-kemer path, .bant-ok path, .alan-siniri path')
    ).some((e) => { const r = e.getBoundingClientRect()
      return kesimler.some((x) => r.left < x - 0.5 && r.right > x + 0.5) })
    if (asanlar.length === 0 && !bantVar)
      kusurlar.push({ tur:'kesintisizlik-yok', kart:null, alan:null,
        aciklama: 'şablon kesintisizlik iddia ediyor ama hiçbir öge kesimi aşmıyor' })
  }
  return kusurlar
})()`

/**
 * Her kartın KENDİ punto tavanı — `puntoOlcumu`nun kart kırılımı.
 *
 * ⚠ Aynı ikili arama, ama minimum alınmadan: hangi kartın dar olduğunu bilmek için
 * tek tek gerekiyor. Sınır yine VERİLİYOR, ölçülmüyor (kendini ölçen metrik tuzağı).
 */
const kartTavanlari = (doc: PanoramaBelgesi): string => {
  const blok = Math.round((doc.yukseklik - 258) * 0.44)
  const t = doc.tipografi
  const sutun = Math.round(doc.slaytGenisligi * (t?.baslikSutunu ?? 0.86)) - 128
  return `(() => Array.from(document.querySelectorAll('.baslik')).map((b) => {
    let alt = 20, ust = 168
    for (let k = 0; k < 18; k += 1) {
      const orta = (alt + ust) / 2
      b.style.fontSize = orta + 'px'
      if (b.scrollWidth <= ${sutun} + 1 && b.scrollHeight <= ${blok}) alt = orta; else ust = orta
    }
    b.style.fontSize = ''
    return alt
  }))()`
}

/**
 * Belgeyi render edip DOM'a sorar.
 *
 * ⚠ Ekran görüntüsü ALINMIYOR: denetim pikselleri değil kutuları okuyor ve dosyaya
 * yazmadan çalışıyor. Böylece düzeltme turu, kaydedilmiş bir çıktıyı geçersiz kılmıyor.
 */
export const panoramaDenetle = async (
  doc: PanoramaBelgesi,
  oturum?: Oturum
): Promise<BrowserResult<readonly Kusur[]>> => {
  const kesimler = Array.from(
    { length: doc.kartlar.length - 1 },
    (_, i) => (i + 1) * doc.slaytGenisligi
  )
  const calistir = <T>(fn: (page: Page) => Promise<T>): Promise<BrowserResult<T>> =>
    oturum === undefined ? withPage(fn) : oturum.sayfaIle(fn)
  return calistir(async (page) => {
    // ⚠ Görüntü alanı TÜM panorama: slayt genişliğinde bir viewport'ta kartların çoğu
    // görünür alanın dışında kalır ve `getBoundingClientRect` yine doğru değer verir —
    // ama `scrollWidth` kırpma davranışı viewport'a bağlı olabildiği için tam tuval
    // kuruluyor. Ölçüm ortamı, render ortamıyla aynı olmak zorunda değil; AYNI DEĞERLERİ
    // vermek zorunda ve tam tuval bunu garanti ediyor.
    await page.setViewportSize({
      width: doc.slaytGenisligi * doc.kartlar.length,
      height: doc.yukseklik,
    })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.evaluate(puntoOlcumu(doc))
    // ⚠ ⚠ **GÖRSELLERİN ÇÖZÜLMESİ BEKLENİYOR — beklenmediğinde ölçüm SESSİZCE boş
    // dönüyordu.** `naturalWidth` yüklenmemiş bir `<img>`de 0 ve döngü `continue` ile
    // atlıyordu: matlama denetimi hem siyah hem açık zeminli görselde "kusur yok" dedi.
    // Yeşil bir ölçüm, ölçüm yapıldığı anlamına gelmiyor.
    await page.evaluate(
      `(async () => { await Promise.all(Array.from(document.images).map(
        (i) => i.decode().catch(() => undefined))); return true })()`
    )
    const ham = (await page.evaluate(
      OLCUM(kesimler, kesintisizlikIddiasi(doc))
    )) as readonly Kusur[]
    // ── punto çökmesi: hangi KART tavanı aşağı çekiyor ──────────────────────
    // ⚠ ⚠ **İKİ TARAF AYRI KAYNAKTAN.** Ölçüm bir sabitle değil, KARTLARIN KENDİ
    // ORTANCASIYLA karşılaştırılıyor: "bu kart ötekilerden çok mu dar". Mutlak bir eşik
    // (`punto < 44px`) `editoryal` gibi kasten fısıldayan bir şablonu haksız yere
    // kırmızıya çevirirdi. Kendi kendini ölçmüyor: bir kart, DİĞER kartlara bakılarak
    // yargılanıyor.
    const tavanlar = (await page.evaluate(kartTavanlari(doc))) as readonly number[]
    const sirali = [...tavanlar].sort((a, b) => a - b)
    const ortanca = sirali[Math.floor(sirali.length / 2)] ?? 0
    const cokme: Kusur[] = tavanlar.flatMap((t, i) =>
      ortanca > 0 && t < ortanca * 0.62
        ? [
            {
              tur: 'punto-cokmesi' as const,
              kart: i + 1,
              alan: 'baslik' as const,
              aciklama:
                `bu kartın başlığı ${Math.round(t)} px'e sığıyor, diğerleri ` +
                `${Math.round(ortanca)} px — tek kart tüm karoselin ölçeğini düşürüyor`,
            },
          ]
        : []
    )
    // ⚠ Eksik glif TARAYICIYA SORULMUYOR — `document.fonts.check` bu soruya yanlış cevap
    // veriyor (ölçüldü: kapsanan `A`/`ğ` için `false`, kapsanmayan `д`/`漢` için `true`).
    // Kapsamı belirleyen `@font-face` beyanı bizim; sınanan da o (`kapsamDisiKarakterler`).
    const metin = doc.kartlar
      .map((k) => `${k.ustBaslik}${k.baslik}${k.govde}${k.hayalet}${k.rayaSol}${k.rayaOrta}`)
      .join('')
    const eksik = kapsamDisiKarakterler(metin)
    return [
      ...ham,
      ...cokme,
      ...(eksik.length === 0
        ? []
        : [
            {
              tur: 'eksik-glif' as const,
              kart: null,
              alan: null,
              aciklama: `marka fontunun kapsamı dışında: ${eksik.join(' ')}`,
            },
          ]),
    ]
  })
}

/** Kusurları uyarlama turuna verilecek insan okunur bir listeye çevirir. */
export const kusurMetni = (kusurlar: readonly Kusur[]): string =>
  kusurlar.length === 0
    ? 'kusur yok'
    : kusurlar
        .map((k) => `- ${k.kart === null ? 'belge' : `kart ${k.kart}`}: ${k.aciklama}`)
        .join('\n')
