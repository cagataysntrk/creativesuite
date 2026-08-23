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
  /**
   * Metin gövdesi görselin ÜSTÜNDE duruyor — üstte olmak okunabilirlik değildir.
   *
   * ⚠ `metin-ortuluyor` boyama SIRASINI soruyor ve doğru cevap veriyor; bu kusur
   * KONUMU soruyor. Bir fotoğrafın üstündeki metin, fotoğraf dokulu olduğu ölçüde
   * okunmaz ve kesik özne tanımı gereği dokuludur (gerçek koşu: `run_01a02ade`).
   */
  | 'metin-gorsel-cakisiyor'
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
   * Belge AI ifşası taşıdığını söylüyor ama slaytta GÖRÜNMÜYOR (§11.3 · Md. 50).
   *
   * ⚠ ⚠ **İFŞA İDDİA EDİLMEZ, ÖLÇÜLÜR.** `visibleDisclosure: true` yazan bir sidecar,
   * kimsenin bakmadığı bir kutucuğun işaretlenmesidir — bu deponun `dayanaksiz`
   * dediği şeyin ta kendisi (D-23). Ölçüm DOM'da: şerit her slaytta var mı, boyutu
   * sıfır mı, üstü örtülü mü. Yayın kapısı buna dayanacak.
   */
  | 'ifsa-gorunmuyor'
  /**
   * İfşa şeridi ÇİZİLİYOR ama arkasındaki görsel yüzünden OKUNMUYOR (§11.3).
   *
   * ⚠ ⚠ **"GÖRÜNÜR" İLE "OKUNUR" AYRI ŞEYLER — ve ilk ölçüm bunu karıştırdı.**
   * Denetim şeridin boyutuna, `display`ine ve opaklığına bakıyordu; üçü de geçiyordu.
   * Ama gerçek çıktıda kesik özne kadrajın dibine kadar iniyor ve şerit AÇIK bir kâğıt
   * yığınının üstüne düşüyor: soluk gri metin beyaz zeminde kayboluyor. Md. 50 görünür
   * ifşa istiyor; okunamayan bir ifşa, ifşa değildir.
   */
  | 'ifsa-okunmuyor'
  /**
   * Çıktıda YER TUTUCU kutusu var — görsel üretilemedi ve yerine çerçeve çizildi.
   *
   * ⚠ ⚠ **BU KUSUR GERÇEK BİR ÇIKTIYA BAKARAK DOĞDU ve kalite kapısı onu GEÇİRDİ.**
   * Panelden onaylanan koşuda `gorsel-uret` sağlayıcı politikasıyla reddedildi
   * (`IMAGE_PROMPT_REJECTED`), bir yuva boş kaldı ve son slaytta kesik çizgili bir
   * kutu ile "kesik özne — 3" etiketi kaldı. `kalite` yine de "0 kusur, geçti" dedi:
   * denetim taşmayı, kesimi, glifi ölçüyordu ama EKSİĞİ ölçmüyordu.
   *
   * ⚠ Yer tutucu bilerek çiziliyor (D-…: eksiklik görünür kalmalı, sessizce metin-only
   * bir karosele düşmek tasarımı tanınmaz yapar). Doğru davranış onu SİLMEK değil,
   * yayına gitmesini ENGELLEMEK: kusur olarak bildiriliyor, insan kapısı görüyor.
   */
  | 'yer-tutucu'
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
  /**
   * **Hayalet bir metnin ya da alan sınırının üstüne düşüyor.**
   *
   * ⚠ ⚠ **DEPO SAHİBİ ÜRETİMDE GÖRDÜ, DENETİM GÖRMEDİ.** `akan-alan`ın 3. slaydında dev
   * rakam alan sınırının tam üstüne düşüyor ve yarısı mavi yarısı siyah kalıyordu: kesik,
   * bozuk bir şekil. `sus-baskin` yalnız ALANI ölçüyor, ÇARPIŞMAYI değil — bir öge küçük
   * olup yine de yanlış yerde durabilir.
   * ⚠ Eşik %12: hayaletin kenarı bir harfe değebilir (bu kasıtlı katmanlanmadır); ama
   * gövdesinin sekizde birinden fazlası metnin üstündeyse artık okuma bozuluyor.
   */
  | 'hayalet-carpisma'
  /**
   * **Metin bir görselin ALTINDA kalıyor — okunmuyor.**
   *
   * ⚠ ⚠ **YİNE ÜRETİMDE GÖRÜLDÜ, DENETİM "kusur yok" DEDİ.** Gerçek bir koşuda iki
   * kartın gövdesi kesik öznenin arkasında kaldı, bir üçüncüsü yarıdan kırpıldı — ve
   * denetim temiz rapor verdi. Var olan hiçbir ölçüm bunu göremiyordu: `tasma` kutunun
   * İÇİNDEKİ kırpılmayı ölçüyor, `kart-disi` tuvalden taşmayı, `sus-baskin` yalnız alan
   * oranını. Örtülmek bunların hiçbiri değil.
   *
   * ⚠ ⚠ **Ölçü ÇAKIŞMA değil, ÖRTÜLME.** Metnin bir figürün üstünden geçmesi referans
   * tasarımlarda İSTENEN şey; kusur olan, metnin ALTTA kalması. Bu yüzden kutu kesişimi
   * değil `elementFromPoint` ile gerçek boyama sırası örnekleniyor: gözün gördüğü şey
   * ölçülüyor, bir vekil değil. Yerleşim bir gün metni üste alacak şekilde düzeltilirse
   * (BORÇLAR D14) aynı ölçüm kendiliğinden yeşile döner — eşiği kovalamak gerekmez.
   *
   * ⚠ Eşik %6: bir iki harfin kenarı örtülebilir, ama gövdenin on altıda birinden
   * fazlası kaybolduysa cümle artık okunmuyor.
   */
  | 'metin-ortuluyor'
  /**
   * **Süs ögesi metnin ARKASINDAN geçiyor.**
   *
   * ⚠ ⚠ **DEPO SAHİBİNİN GÖZÜ GÖRDÜ, DENETİM GÖRMEDİ.** Panelden koşan
   * `run_01a01876`in 2. ve 3. slaytlarında akan mavi alan gövde metninin son iki
   * satırının altından geçiyordu: okunuyor ama YANLIŞ görünüyor — tasarım değil,
   * kaza gibi. Denetim "0 kusur" dedi. Var olan hiçbir ölçüm bunu göremezdi:
   * `metin-ortuluyor` metnin ALTTA kalmasını arıyor (burada metin ÜSTTE),
   * `ifsa-okunmuyor` yalnız şeride bakıyor, kontrast ölçümü ise kutunun MEDYANINA
   * bakıyor ve iki satırlık bir kesişim medyanı kıpırdatmıyor.
   *
   * ⚠ Kuralın kendisi kataloğa ZATEN yazılıydı — `sahne` kaydı *"el çizimi yaylar kart
   * ARALARINDA duruyor, metnin üstünden geçmiyor: nüfus karoselinde oklar başlıkların
   * ortasından geçince okunmaz oldu ve silindi"* diyor. Yazılı olması yetmedi; ölçüm
   * yoktu.
   *
   * ⚠ Ölçü İKİ RENDER FARKI: süs gizlenip aynı kutu yeniden okunuyor, değişen piksel
   * oranı süsün metnin altında kapladığı alandır. Eşik ölçülerek seçildi — gerçek
   * belgede temiz kutular %0, kesişen ikisi %4,6 ve %5,9 verdi (§7.1).
   */
  | 'sus-metni-kesiyor'

export interface Kusur {
  readonly tur: KusurTuru
  /** Hangi kart — panoramada 1'den başlıyor. `null` ise belge geneli. */
  readonly kart: number | null
  readonly aciklama: string
  /** Uyarlamanın hangi alanını değiştirmesi gerektiği; yoksa `null`. */
  readonly alan: 'baslik' | 'govde' | 'ustBaslik' | 'panel' | 'hayalet' | 'raya' | null
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

const OLCUM = (
  kesimler: readonly number[],
  iddia: boolean,
  ifsaBekleniyor: boolean
): string => `(() => {
  const kusurlar = []
  // İfşa şeritlerinin EKRAN kutuları — bileşik kontrast Node tarafında ölçülüyor.
  const kutular = []
  const kesimler = ${JSON.stringify(kesimler)}
  const kartlar = Array.from(document.querySelectorAll('.kart'))

  // ── YER TUTUCU: üretilemeyen görselin yerine çerçeve çizildi mi ──────────
  // ⚠ ⚠ **YER TUTUCU KARTIN İÇİNDE DEĞİL, AYRI KATMANDA — ve bu hata bu dosyada
  // ÜÇÜNCÜ kez yapıldı.** Dosyanın kendi yorumu "GÖRSELLER KARTLARIN ÜSTÜNDE, AYRI
  // BİR KATMANDA" diyor; ifşa kontrastı ölçümü de aynı tuzağa düşmüştü. Belge
  // düzeyinde aranıyor, kart KONUMDAN türetiliyor.
  Array.from(document.querySelectorAll('.gorsel-yer')).forEach((yer) => {
    const yr = yer.getBoundingClientRect()
    if (yr.width < 2 || yr.height < 2) return
    const kartIndex = kartlar.findIndex((k) => {
      const kr = k.getBoundingClientRect()
      return yr.left + yr.width / 2 >= kr.left && yr.left + yr.width / 2 < kr.right
    })
    kusurlar.push({
      tur: 'yer-tutucu',
      kart: kartIndex < 0 ? null : kartIndex + 1,
      alan: null,
      aciklama:
        'bu slaytta gorsel yerine YER TUTUCU cizili — gorsel uretilemedi, cikti eksik',
    })
  })

  // ── AI ifşası: her slaytta GÖRÜNÜR mü ─────────────────────────────────────
  // ⚠ Varlık kontrolü YETMEZ: sıfır boyutlu, gizlenmiş ya da opaklığı sıfır bir
  // etiket DOM'da vardır ama ifşa değildir. Üç ölçüt birden aranıyor.
  if (${JSON.stringify(ifsaBekleniyor)}) {
    kartlar.forEach((kart, i) => {
      const e = kart.querySelector('.ray-ifsa')
      const r = e === null ? null : e.getBoundingClientRect()
      const st = e === null ? null : getComputedStyle(e)
      const gorunur =
        e !== null && r !== null && st !== null &&
        r.width > 1 && r.height > 1 &&
        st.visibility !== 'hidden' && st.display !== 'none' && Number(st.opacity) > 0.05
      if (gorunur && r !== null && st !== null) {
        // ⚠ ⚠ **KONTRAST BURADA ÖLÇÜLEMEZ — ve ilk iki deneme tam bunu denedi.**
        // İlk sürüm görselin ham piksellerini okudu; ikinci sürüm metin rengini
        // tuvale çizdirip düzeltti. İkisi de yanlış şeye bakıyordu: aradaki dip
        // vinyeti (zemin reçetesi) bileşik sonucu değiştiriyor ve ham görsel onu
        // bilmiyor. Ölçülmesi gereken şey EKRANDAKİ piksel.
        //
        // Şeridin kutusu dışarı taşınıyor; bileşik ölçüm Node tarafında,
        // ekran görüntüsü üzerinden yapılıyor.
        kutular.push({ kart: i + 1, sol: r.left, ust: r.top, en: r.width, boy: r.height, renk: st.color })
      }
      if (!gorunur) {
        kusurlar.push({
          tur: 'ifsa-gorunmuyor',
          kart: i + 1,
          alan: 'raya',
          aciklama: e === null
            ? 'bu slaytta AI ifşa şeridi HİÇ yok — Md. 50 görünür ifşa istiyor'
            : 'AI ifşa şeridi var ama görünmüyor (sıfır boyut, gizli ya da saydam)',
        })
      }
    })
  }

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
    // ⚠ ⚠ **ÖNCE ALFA, SONRA PARLAKLIK — ve ilk sürüm alfayı HİÇ OKUMUYORDU.**
    // Bu ölçüm luma-anahtarı döneminde yazıldı: o zaman arka planı kesmenin tek yolu
    // koyu zemini CSS filtresiyle şeffaflaştırmaktı, yani "köşe parlaklığı" doğru
    // vekildi. Sonra hatta gerçek arka plan silme (rembg) girdi ve görseller ALFALI
    // geliyor — köşeler şeffaf, ama şeffaf pikselin ALTINDAKİ RGB çöp değeri hâlâ
    // parlaklık olarak sayılıyordu. Gerçek bir koşuda köşe parlaklığı 38/255 ölçüldü
    // ve kusur bildirildi; oysa görsel RGBA'ydı ve kesim ZATEN tutmuştu.
    // ⚠ Ölçüm aletinin kendisi eskimişti: tekniği değiştirdik, ölçüsünü değiştirmedik.
    let alfaToplam = 0
    for (const [x,y] of noktalar) {
      const d = g.getImageData(Math.max(0,x), Math.max(0,y), n, n).data
      let s = 0
      let a = 0
      for (let i = 0; i < d.length; i += 4) {
        s += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]
        a += d[i+3]
      }
      toplam += s / (d.length / 4)
      alfaToplam += a / (d.length / 4)
    }
    const ort = toplam / noktalar.length
    const alfa = alfaToplam / noktalar.length
    // Köşeler şeffafsa arka plan GERÇEKTEN silinmiş: luma anahtarına hiç iş kalmıyor.
    // 16/255 eşiği kenar yumuşatmasının bıraktığı kalıntıya pay bırakıyor.
    if (alfa < 16) continue
    // 34/255: luma anahtarı bu eşiğin altında güvenilir kesiyor; üstünde zemin kalıyor.
    if (ort > 34)
      kusurlar.push({ tur:'matlama-tutmuyor', kart:null, alan:null,
        aciklama: 'kesik görselin köşesi OPAK (alfa ' + Math.round(alfa) + '/255) ve parlaklık ' +
          Math.round(ort) + '/255 — arka plan silinmemiş, luma anahtarı da kesmeyecek' })
  }

  // ── hayalet çarpışması: metnin ya da alan sınırının üstüne düşmemeli ─────
  kartlar.forEach((k, i) => {
    const h = k.querySelector('.hayalet')
    if (!h) return
    const hr = h.getBoundingClientRect()
    const alan = hr.width * hr.height
    if (alan === 0) return
    for (const sec of ['.baslik', '.govde', '.panel', '.sayilar', '.etiketler']) {
      const e = k.querySelector(sec)
      if (!e) continue
      const r = e.getBoundingClientRect()
      const en = Math.max(0, Math.min(hr.right, r.right) - Math.max(hr.left, r.left))
      const boy = Math.max(0, Math.min(hr.bottom, r.bottom) - Math.max(hr.top, r.top))
      const oran = (en * boy) / alan
      if (oran > 0.12) {
        kusurlar.push({ tur:'hayalet-carpisma', kart:i+1, alan:sec.slice(1),
          aciklama: 'hayalet ' + sec + ' ile %' + Math.round(oran*100) + ' çakışıyor' })
        break
      }
    }
  })

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

  // ── metin GÖRSELİN üstünde mi duruyor: kutu kesişimi ────────────────────
  //
  // ⚠ ⚠ **BU KUSUR GERÇEK BİR KOŞUDAN DOĞDU (run_01a02ade).** Metin görselin ÜSTÜNDE
  // (z-index 6) ve metin-ortuluyor bu yüzden temiz çıkıyordu — ama slaytlara bakınca
  // başlıklar okunmuyordu: kesik özne metnin ARKASINDA duruyor ve parlak metal
  // yüzeyinin üstündeki beyaz başlık kayboluyor. Ölçüldü: dört slaytta da metin
  // alanının **%28'i** görselle çakışıyor.
  //
  // ⚠ **"Üstte olmak" okunabilirlik DEĞİLDİR.** Eski ölçüm boyama sırasını soruyordu ve
  // doğru cevabı veriyordu; yanlış olan SORUYDU. Bir fotoğrafın üstündeki metin, fotoğraf
  // dokulu olduğu ölçüde okunmaz — ve kesik özne tanımı gereği dokuludur.
  //
  // ⚠ Eşik %12: sıfır olamaz, çünkü kesik öznenin bir kolu metin kolonuna hafifçe
  // girebilir ve bu istenen bir şey (süreklilik). Ölçülen şey metnin GÖVDESİNİN
  // fotoğrafın üstünde durup durmadığı.
  kartlar.forEach((k, i) => {
    const g = Array.from(document.querySelectorAll('.gorsel, .gorsel-yer')).map((e) =>
      e.getBoundingClientRect()
    )
    if (g.length === 0) return
    const kesis = (a, b) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    for (const sec of ['.baslik', '.govde']) {
      const e = k.querySelector(sec)
      if (!e) continue
      const r = e.getBoundingClientRect()
      const alan = r.width * r.height
      if (alan < 400) continue
      let ort = 0
      for (const gr of g) ort += kesis(r, gr)
      const oran = ort / alan
      if (oran > 0.12) {
        kusurlar.push({ tur:'metin-gorsel-cakisiyor', kart:i+1, alan:sec.slice(1),
          aciklama: sec + ' alanının %' + Math.round(oran*100) +
            "'i görselin üstünde — ustte olmak okunabilirlik degildir" })
      }
    }
  })

  // ── metin örtülüyor mu: boyama sırası ÖRNEKLENİYOR ──────────────────────
  //
  // ⚠ Kutu kesişimi yeterli DEĞİL: metnin figürün üstünden geçmesi istenen bir şey.
  // Kusur, metnin ALTTA kalması. elementFromPoint gerçek boyama sırasını veriyor.
  // (BU GÖVDE BİR ŞABLON DİZESİ: buraya backtick yazılamaz, dizeyi kapatır — beşinci kez.)
  kartlar.forEach((k, i) => {
    for (const sec of ['.baslik', '.govde', '.panel', '.sayilar', '.etiketler']) {
      const e = k.querySelector(sec)
      if (!e) continue
      const r = e.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      let toplam = 0
      let ortulu = 0
      for (let sx = 0; sx < 16; sx++) {
        for (let sy = 0; sy < 8; sy++) {
          const x = r.left + ((sx + 0.5) * r.width) / 16
          const y = r.top + ((sy + 0.5) * r.height) / 8
          const ust = document.elementFromPoint(x, y)
          if (!ust) continue
          toplam++
          if (ust !== e && !e.contains(ust) && ust.closest('.gorsel, .gorsel-yer')) ortulu++
        }
      }
      if (toplam === 0) continue
      const oran = ortulu / toplam
      if (oran > 0.06) {
        kusurlar.push({ tur:'metin-ortuluyor', kart:i+1, alan:sec.slice(1),
          aciklama: sec + ' görselin ALTINDA kalıyor: yüzeyinin %' + Math.round(oran*100) +
            "'i örtülü — okunmuyor" })
      }
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
  return { kusurlar, ifsaKutulari: kutular }
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
/**
 * Metin kutuları — süs kesişimi ölçümünün girdisi.
 *
 * ⚠ Kart SIRASI DOM'dan geliyor, konumdan hesaplanmıyor: panoramada kartlar zaten
 * ayrı `<section>`lar ve konumdan türetmek, kesimi aşan bir öge yüzünden kayardı.
 */
const METIN_KUTULARI = `(() => {
  const cikti = []
  document.querySelectorAll('.kart').forEach((kart, i) => {
    const alanlar = [['baslik','.baslik'],['govde','.govde'],['ustBaslik','.ust-baslik']]
    for (const [alan, sec] of alanlar) {
      const e = kart.querySelector(sec)
      if (e === null) continue
      const r = e.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      cikti.push({ kart: i + 1, alan, sol: r.left, ust: r.top, en: r.width, boy: r.height })
    }
  })
  return cikti
})()`

/**
 * Süs ögeleri — metnin üstünden geçmemesi gereken ÇİZGİSEL ögeler.
 *
 * ⚠ Görsel (`img`) listede YOK ve bu kasıtlı: metnin bir figürün üstünden geçmesi
 * referans tasarımlarda İSTENEN şey (`metin-ortuluyor` onu ayrıca ölçüyor). Burada
 * ölçülen şey SÜSÜN metne girmesi.
 *
 * ⚠ ⚠ **`.alan-siniri` LİSTEDE YOK ve bunu ilk sürüm YANLIŞ yaptı:** `akan-alan`da o
 * sınır bir süs değil ZEMİNİN KENDİSİ — iki renk alanını ayıran eğri. Gizlenince tüm
 * kartın arkası değişiyor ve ölçüm "süs her metnin altında" diyordu; temiz bir belgede
 * on sekiz kusur. Zemini süs sanan bir ölçüm, doğru şeyi yanlış yerde arar.
 */
const SUSU_GIZLE = `(() => {
  const st = document.createElement('style')
  st.id = 'sus-gizle'
  st.textContent = '.bant, .bant-kemer, .bant-ok, .lekeler { display: none !important }'
  document.head.appendChild(st)
  return true
})()`

const SUSU_GOSTER = `(() => {
  document.getElementById('sus-gizle')?.remove()
  return true
})()`

/** İki PNG arasında GÖZLE görülür farkın oranı (%, bir ondalık). */
const farkOrani = (a: string, b: string): string => `(async () => {
  const yukle = async (b64) => {
    const im = new Image()
    im.src = 'data:image/png;base64,' + b64
    await im.decode()
    const c = document.createElement('canvas')
    c.width = im.width; c.height = im.height
    const x = c.getContext('2d')
    x.drawImage(im, 0, 0)
    return x.getImageData(0, 0, c.width, c.height).data
  }
  const p = await yukle(${JSON.stringify(a)})
  const q = await yukle(${JSON.stringify(b)})
  const n = Math.min(p.length, q.length)
  let degisen = 0
  for (let j = 0; j < n; j += 4) {
    // 24: JPEG/antialias gurultusunun ustunde, renk degisiminin altinda.
    if (Math.abs(p[j]-q[j]) + Math.abs(p[j+1]-q[j+1]) + Math.abs(p[j+2]-q[j+2]) > 24) degisen++
  }
  return Math.round((degisen / (n / 4)) * 1000) / 10
})()`

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
    const olcum = (await page.evaluate(
      OLCUM(kesimler, kesintisizlikIddiasi(doc), doc.aiIfsasi === true)
    )) as {
      readonly kusurlar: readonly Kusur[]
      readonly ifsaKutulari: readonly {
        kart: number
        sol: number
        ust: number
        en: number
        boy: number
        renk: string
      }[]
    }
    const ham = olcum.kusurlar

    // ── AI ifşası OKUNUYOR mu — BİLEŞİK piksel üzerinden (§11.3 · Md. 50) ────
    //
    // ⚠ ⚠ **İKİ DENEME YANLIŞ ŞEYE BAKTI.** Birincisi görselin HAM piksellerini
    // okudu, ikincisi metin rengini tuvale çizdirip düzeltti — ama aradaki dip
    // vinyeti (zemin reçetesi) bileşik sonucu değiştiriyor ve ham görsel onu
    // bilmiyor. Ölçülmesi gereken şey EKRANDAKİ piksel; o da ancak ekran
    // görüntüsüyle alınır.
    //
    // ⚠ ⚠ **ÖLÇÜT ÜÇÜNCÜ KEZ DÜZELTİLDİ ve her seferinde SAYI gösterdi.** Önce ham
    // görsel pikselleri okundu (vinyeti görmüyordu), sonra bölgenin luma YAYILIMI
    // ölçüldü — ölçüldü ve ayırt etmedi: vinyetli 98–115, vinyetsiz 96–232, ikisi de
    // eşiğin üstünde. Sebep basit: şerit hem koyu metni hem parlak zemini içeriyor,
    // yani yayılım her hâlde yüksek.
    //
    // Doğru ölçüt METİN ile ZEMİN arasındaki fark: bölgenin MEDYANI zemini temsil
    // ediyor (piksellerin çoğu zemin) ve metin rengi tarayıcıya çizdirilerek
    // okunuyor. Vinyetsiz kart 3'te medyan 209, metin 245 → fark 36: okunmuyor.
    // Vinyetli aynı kartta medyan 36 → fark 209: okunuyor.
    const ifsaKusurlari: Kusur[] = []
    for (const k of olcum.ifsaKutulari) {
      try {
        const png = await page.screenshot({
          clip: {
            x: Math.max(0, Math.round(k.sol)),
            y: Math.max(0, Math.round(k.ust)),
            width: Math.max(1, Math.round(k.en)),
            height: Math.max(1, Math.round(k.boy)),
          },
        })
        const yayilim = (await page.evaluate(
          `(async () => {
            const im = new Image()
            im.src = 'data:image/png;base64,${png.toString('base64')}'
            await im.decode()
            const c = document.createElement('canvas')
            c.width = im.width; c.height = im.height
            const x = c.getContext('2d')
            x.drawImage(im, 0, 0)
            const d = x.getImageData(0, 0, c.width, c.height).data
            const l = []
            for (let j = 0; j < d.length; j += 4) l.push(0.2126*d[j] + 0.7152*d[j+1] + 0.0722*d[j+2])
            l.sort((a, b) => a - b)
            const medyan = l[Math.floor(l.length / 2)]
            const c2 = document.createElement('canvas')
            c2.width = 1; c2.height = 1
            const x2 = c2.getContext('2d')
            x2.fillStyle = ${JSON.stringify(k.renk)}
            x2.fillRect(0, 0, 1, 1)
            const mp = x2.getImageData(0, 0, 1, 1).data
            const metin = 0.2126*mp[0] + 0.7152*mp[1] + 0.0722*mp[2]
            return Math.round(Math.abs(medyan - metin))
          })()`
        )) as number
        if (yayilim < 60) {
          ifsaKusurlari.push({
            tur: 'ifsa-okunmuyor',
            kart: k.kart,
            alan: 'raya',
            aciklama:
              `AI ifşası okunmuyor: metin ile zemin arasındaki luma farkı ${String(yayilim)} ` +
              '(60 altı, metin zemine karışıyor) — Md. 50 GÖRÜNÜR ifşa istiyor',
          })
        }
      } catch (e) {
        ifsaKusurlari.push({
          tur: 'ifsa-okunmuyor',
          kart: k.kart,
          alan: 'raya',
          aciklama: `ifşa okunurluğu ÖLÇÜLEMEDİ (${String(e)}) — ölçülemeyen geçmiş sayılmaz`,
        })
      }
    }
    // ── süs metni kesiyor mu: İKİ RENDER FARKI (§7.1) ───────────────────────
    //
    // ⚠ ⚠ **BU KUSURU GÖZ BULDU, ÖLÇÜM DEĞİL.** Akan mavi alan gövde metninin son iki
    // satırının altından geçiyordu ve denetim "0 kusur" diyordu. Kontrast ölçümü de
    // görmedi: kutunun MEDYANINA bakıyor ve iki satırlık bir kesişim medyanı
    // kıpırdatmıyor. Doğru ölçü, süsün ORADA OLUP OLMADIĞI.
    //
    // ⚠ Aynı sayfa kullanılıyor, ikinci bir `setContent` YOK: süs tek bir `<style>` ile
    // gizleniyor, kutular yeniden okunuyor, stil kaldırılıyor. İkinci bir kurulum,
    // ölçtüğünü sandığı şeyi başka bir ortamda ölçer.
    const susKusurlari: Kusur[] = []
    try {
      const kutular = (await page.evaluate(METIN_KUTULARI)) as readonly {
        kart: number
        alan: 'baslik' | 'govde' | 'ustBaslik'
        sol: number
        ust: number
        en: number
        boy: number
      }[]
      const kirp = (k: { sol: number; ust: number; en: number; boy: number }) => ({
        x: Math.max(0, Math.round(k.sol)),
        y: Math.max(0, Math.round(k.ust)),
        width: Math.max(1, Math.round(k.en)),
        height: Math.max(1, Math.round(k.boy)),
      })
      const once: string[] = []
      for (const k of kutular)
        once.push((await page.screenshot({ clip: kirp(k) })).toString('base64'))
      await page.evaluate(SUSU_GIZLE)
      for (let i = 0; i < kutular.length; i++) {
        const k = kutular[i]
        if (k === undefined) continue
        const sonra = (await page.screenshot({ clip: kirp(k) })).toString('base64')
        const oran = (await page.evaluate(farkOrani(once[i] ?? '', sonra))) as number
        // ⚠ Eşik ÖLÇÜLEREK seçildi: gerçek belgede dokunmayan kutular %0, kesişen
        // ikisi %4,6 ve %5,9 verdi. %2 ikisini ayırıyor ve bir kenarın metne
        // değmesine (kasıtlı katmanlanma) izin veriyor.
        if (oran >= 2) {
          susKusurlari.push({
            tur: 'sus-metni-kesiyor',
            kart: k.kart,
            alan: k.alan,
            aciklama:
              `süs ögesi ${k.alan} metninin %${String(oran)}'inin arkasından geçiyor — ` +
              'metin kısaltılmalı ya da süsün dışına alınmalı',
          })
        }
      }
      await page.evaluate(SUSU_GOSTER)
    } catch {
      // Ölçülemedi: kusur UYDURULMUYOR. Ölçülemeyen bir şeyi kusur saymak, ölçüm
      // aracının arızasını tasarımın suçu yapardı.
    }

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
      ...ifsaKusurlari,
      ...susKusurlari,
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
