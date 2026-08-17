// HEDEF: packages/render/src/static.ts
//
// Belge modeli → HTML → PNG (§7.1 · R-30, R-23).
//
// **Taşma BÖLER, asla küçültmez.** Sığdırmak için tipi küçültmek, makine üretimi
// kreatifin bir numaralı görsel işaretidir (§7.1) — o yüzden `fitText` benzeri
// hiçbir şey YAZILMAYACAK. Sığmayan içerik bir sonraki slayda taşar; bu bir kısıt
// değil, tasarım kararı.
//
// **Türkçe genişleme payı yapısal** (R-23): sabit genişlik yok, satır yüksekliği
// gevşiyor. "Onayla" sığar ama gerçek etiket "Onayla ve depoya işle" olur.

import { statSync } from 'node:fs'
import { softHyphenate } from '@suite/contracts'
import { validateDocument, type Block, type DocumentModel } from '@suite/kernel'
import { withPage, type BrowserResult, type Oturum, type Page } from './browser.js'
import { CHART_CSS, chartHtml, isChartError } from './charts/chart.js'
import { COMPARE_CSS, compareHtml, isCompareError } from './charts/karsilastirma.js'
import { DIAGRAM_CSS, diagramHtml, isDiagramError } from './charts/diagram.js'
import { kacir } from './html.js'
import { VARSAYILAN } from './sablon-parametre.js'
import { suslemeler, suslemeSvg } from './sablon-susleme.js'
import {
  akanEgri,
  alanRolleri,
  egriSagda,
  duzenBicimi,
  guvenliMetinYuzdesi,
  hayaletRakam,
  navIsareti,
  sayacEtiketi,
} from './sablon.js'
import { ikonSec, ikonSvg } from './sablon-ikon.js'
import { OPENTYPE_CSS, vurguCss, vurguyuIsaretle } from './sablon-tipo.js'
import {
  dokuCss,
  duotoneSvg,
  grainKatmani,
  grainSvg,
  vinyetCss,
  vinyetKatmani,
} from './sablon-filtre.js'

/** Duotone filtresinin belge içi kimliği — tek yerde, iki tüketici (svg + css). */
const DUOTONE_ID = 'marka-duotone'
/** Grain filtresinin belge içi kimliği. */
const GRAIN_ID = 'marka-grain'

/**
 * İkon kenarı, px.
 *
 * ⚠ **28 px ölçülmeden seçilmişti ve BAKINCA yanlış çıktı:** 34 px gövde metninin yanında
 * ikon cılız duruyordu. Sebep, kutu boyutu ile GÖRÜNEN boyutun aynı olmaması — 24 birimlik
 * ızgarada şekiller ~19 birim dolduruyor, yani 28 px kutu ~22 px şekil demek. Gövde
 * puntosuna eşitlendi: 34 px kutu → ~27 px şekil, satırla aynı optik ağırlıkta.
 */
const IKON_PX = 34
/** İçerik oluğu — ikon burada durur ve TÜM içerik bu kenardan hizalanır. */
const IKON_OLUK = IKON_PX + 20

export { kacir } from './html.js'

/**
 * ⚠ İkon **blok başına** karar — paylaşılan bir CSS kuralı olamaz. Madde ritmi bugüne
 * kadar `.icerik p::before` ile çiziliyordu ve bu, satırın NE dediğini bilmiyor. İkon
 * içerikten seçildiği için işaretin markup'a girmesi şart.
 */
/**
 * Slayttaki gövde satırlarının HEPSİ bir ikonla eşleşiyor mu.
 *
 * Kısmi eşleşme, aynı slaytta iki farklı madde işareti demek — ritim yerine gürültü.
 */
const ikonlarHepsiEslesiyorMu = (doc: DocumentModel): boolean => {
  if (doc.slayt === undefined || !duzenBicimi(doc.slayt.duzen).maddeRitmi) return false
  const govdeler = doc.blocks.filter((b) => b.type === 'body')
  return (
    govdeler.length > 0 && govdeler.every((b) => ikonSec((b as { text: string }).text) !== null)
  )
}

/**
 * Türkçe yumuşak tireleme — uzun kelimeler satır sonunda BÖLÜNEBİLSİN (FAZ-12.3).
 *
 * ⚠ **Kod ZATEN VARDI ve hiç çağrılmıyordu.** `softHyphenate`/`syllables`
 * `packages/contracts/src/text-tr.ts` içinde yazılı ve testliydi; render katmanı onu
 * hiç çağırmıyordu ve `static.ts`te ne `hyphens` ne `lang` vardı. Bu projede yedinci
 * kez aynı sınıf: modül var, test yeşil, üretim yolu sıfır kullanıyor (D-261).
 *
 * ⚠ **`hyphens: auto` DEĞİL, yumuşak tire.** Chromium'un otomatik hecelemesi bir
 * sözlük gerektiriyor ve Türkçe için garantisi yok; olmadığında sessizce hiçbir şey
 * yapmaz — sessiz yokluk, bu sistemin en sevmediği hata biçimi. `softHyphenate` U+00AD
 * basıyor ve tarayıcı onu her koşulda onurlandırıyor.
 *
 * ⚠ **Yalnız GÖVDE metni, başlık DEĞİL.** Başlık 64 px display yüzüyle çiziliyor;
 * orada bölünen bir kelime kompozisyonu bozar. Referansların hiçbirinde bölünmüş başlık
 * yok. Ayrıca başlık zaten 8 kelimeyle sınırlı (yay tavanı) ve ölçülerek seçilmiş bir
 * puntoda sığıyor (`docs/referans/tip-olcegi.md`).
 *
 * ⚠ **Belge modeli DEĞİŞMİYOR.** Tire yalnız render anında giriyor; `doc.blocks[].text`
 * temiz kalıyor. Aksi hâlde alt metin, lexicon ve defter görünmez karakterler taşırdı.
 */
const HECE_ESIGI = 12

const hecele = (t: string): string => softHyphenate(t, HECE_ESIGI, 3)

const blokHtml = (b: Block, ikonRengi: string | null): string => {
  switch (b.type) {
    case 'heading':
      return `<h${b.level}>${vurguyuIsaretle(kacir(b.text))}</h${b.level}>`
    case 'body': {
      const ad = ikonRengi === null ? null : ikonSec(b.text)
      // Eşleşme yoksa sınıf da yok: mevcut madde çizgisi çizilmeye devam eder. Zorla ikon
      // atamak, takvimden bahseden satırın yanına fabrika koymak demekti.
      const metin = vurguyuIsaretle(kacir(hecele(b.text)))
      return ad === null
        ? `<p>${metin}</p>`
        : `<p class="ikonlu">${ikonSvg(ad, ikonRengi as string, IKON_PX)}${metin}</p>`
    }
    case 'diagram': {
      // Diyagram da VERİ olarak geliyor; çizim burada (D-209 ailesi).
      const d = diagramHtml({ title: b.title, nodes: b.nodes })
      return isDiagramError(d) ? '' : d
    }
    case 'compare': {
      // Veri OLARAK geliyor, çizim burada (D-209 ailesi). Bozuk karşılaştırma sessizce
      // boş kutu basmıyor — `validateDocument` zaten reddediyor, bu ikinci savunma.
      const k = compareHtml(b)
      return isCompareError(k) ? '' : k
    }
    case 'chart': {
      // Grafik VERİ olarak geldi, çizim burada oluyor (D-209). Bozuk grafik sessizce
      // boş kutu basmıyor — `validateDocument` zaten reddediyor, bu dal ikinci savunma.
      const g = chartHtml(b)
      return isChartError(g) ? '' : g.html
    }
    case 'image': {
      // biçimdir (ekran okuyucu atlar), alt'ı hiç yazmamak değil. // `alt` her zaman yazılır; dekoratif görselde BOŞ alt + `aria-hidden` doğru
      // Yuva sınıfı ZORUNLU alandan geliyor: `validateDocument` yuvasız görseli
      // reddediyor, yani buraya yuvasız bir blok ulaşamaz. `alan` yalnız ürün ekran
      // çekimi için varsayılan — o bir kanıttır ve yuvaya tabi değildir.
      const yuva = `yuva-${b.yuva ?? 'alan'}`
      return b.decorative
        ? `<img class="${yuva}" src="${kacir(b.src)}" alt="" aria-hidden="true">`
        : `<img class="${yuva}" src="${kacir(b.src)}" alt="${kacir(b.alt)}">`
    }
    case 'spacer':
      return `<div class="spacer ${b.size}"></div>`
  }
}

/**
 * Belge modelini HTML'e çevirir.
 *
 * Token CSS'i `<style>` içine GÖMÜLÜR, link edilmez: harici bir dosya, render anında
 * yüklenemezse sessizce varsayılan renklerle çıktı üretir — ve o çıktı "marka dışı"
 * olduğunu kimseye söylemez.
 */
export const toHtml = (doc: DocumentModel): string =>
  [
    '<!doctype html><meta charset="utf-8">',
    // ⚠ **Yüzey BEYAN EDİLMEK zorunda.** `kreatif` rolleri `[data-surface='kreatif']`
    // ile kapsanmış; öznitelik yoksa `:root` devreye girer ve o KONSOL grisidir.
    // İlk kompozisyon koşusu tam olarak böyle çıktı: eğri, hayalet rakam, sayaç —
    // hepsi doğru, ama siyah üstüne siyah. Kapsanmış bir token, beyan edilmeyen bir
    // yüzeyde sessizce varsayılana düşer (D-254).
    ...(doc.slayt === undefined
      ? []
      : ['<html lang="tr" data-surface="kreatif"><body data-surface="kreatif">']),
    '<style>',
    // Font bloğu EN ÖNDE: `@font-face` tanımı kullanımından önce gelmeli.
    doc.fontCss ?? '',
    doc.tokenCss,
    // ⚠ **Grafik ve diyagram CSS'i BURADA olmak zorunda.** İlk sürüm `chartHtml`i
    // çağırıyordu ama stilini koymuyordu: üretim PNG yolunda y-etiketleri üst üste
    // yığılıyor, x-etiketleri birbirine giriyordu — deck PDF yolunda doğru çıkıyordu,
    // çünkü orası CSS'i ekliyordu. Aynı belge iki yolda farklı görünüyordu ve HİÇBİR
    // kapı bunu yakalamıyordu (FAZ-6 denetimi, bulgu 7).
    CHART_CSS,
    DIAGRAM_CSS,
    COMPARE_CSS,
    `  html, body { margin: 0; padding: 0; }`,
    `  body { width: ${doc.width}px; height: ${doc.height}px; background: var(--role-bg);`,
    // ⚠ Eskiden `"DejaVu Sans"` — SİSTEM fontu. Repoda tek bir font dosyası yoktu ve
    // çıktının "amatör" görünmesinin en büyük tek sebebi buydu (D-252).
    `         color: var(--role-text); font-family: "Marka Metin", system-ui, sans-serif;`,
    `         display: flex; flex-direction: column; justify-content: center;`,
    `         padding: 96px; box-sizing: border-box; }`,
    // Sabit genişlik YOK (R-23): Türkçe etiket İngilizcesinden ~%20 uzun.
    // Display yüzü YALNIZ başlıkta: iki yüz kuralı, üçüncü bir boyut yok (§12.2).
    // `font-stretch` değişken genişlik eksenini sürüyor — referanslardaki "Expanded".
    `  h1 { font-family: "Marka Display", "Marka Metin", system-ui, sans-serif;`,
    // ⚠ **64 px ÖLÇÜLDÜ, seçilmedi** (`docs/referans/tip-olcegi.md`). 76 px'te en uzun
    // Türkçe kelime 665 px yer kaplıyor ve güvenli sütuna (582 px) sığmıyordu. 64 px,
    // ölçülen kelime listesinin tamamının sığdığı en büyük punto. Otomatik küçültme
    // YOK (R-30) — bu bir tip ölçeği kararı, çalışma zamanı düzeltmesi değil.
    `       font-size: 64px; line-height: 1.08; margin: 0 0 24px; letter-spacing: -0.03em;`,
    `       font-weight: 800; font-stretch: 112%; text-wrap: balance; }`,
    `  h2 { font-size: 48px; line-height: 1.18; margin: 0 0 16px; }`,
    `  p  { font-size: 34px; line-height: 1.45; margin: 0 0 16px; color: var(--role-text-muted); }`,
    // OpenType: görünmez ama gerçek kalite farkı. `dlig` KAPALI — dekoratif bağlar
    // Türkçe'de okunabilirliği düşürür (FAZ-12.1).
    `  h1, h2, p { font-feature-settings: ${OPENTYPE_CSS}; }`,
    `  img { max-width: 100%; height: auto; }`,
    `  .spacer.sm { height: 16px } .spacer.md { height: 40px } .spacer.lg { height: 88px }`,
    sablonCss(doc),
    doc.slayt === undefined
      ? ''
      : vurguCss(alanRolleri(doc.slayt).karsiAlan, alanRolleri(doc.slayt).metin),
    '</style>',
    sablonKatmanlari(doc),
    doc.slayt === undefined ? '' : duotoneSvg(DUOTONE_ID),
    // Doku ve vinyet: kreatif yüzeyde derinlik MEŞRU (§12.1 gölge yasağı konsola ait).
    // Metnin ALTINDA (z-index 2, `.icerik` 3) — bir his, bir perde değil.
    doc.slayt === undefined ? '' : grainSvg(GRAIN_ID),
    doc.slayt === undefined ? '' : grainKatmani(GRAIN_ID),
    doc.slayt === undefined ? '' : vinyetKatmani(),
    `<main class="icerik">`,
    // İkon YALNIZ madde ritmi olan düzenlerde: `list` bir dizi madde demektir ve ikon o
    // dizinin işaretidir. `quote` ya da `hero` düzeninde tek bir cümlenin yanında ikon,
    // vurguyu cümleden çalar.
    //
    // ⚠ **HEPSİ ya da HİÇBİRİ — üçüncü gözlemde kural yazıldı.** Gerçek bir koşuda aynı
    // slaytta bir madde ikonlu, diğeri düz çizgiliydi: iki farklı işaret yan yana, ritim
    // yerine gürültü. Sebep ikon seçiminin BLOK BAŞINA yapılmasıydı — eşleşen satır ikon
    // alıyor, eşleşmeyen çizgi alıyordu. Karar slaytın TAMAMINA ait: bir madde bile
    // eşleşmiyorsa hiçbiri ikon almıyor. Anlamsız ikon ikonsuzluktan kötüdür, **karışık
    // işaret ikisinden de kötüdür.**
    ikonlarHepsiEslesiyorMu(doc)
      ? doc.blocks.map((b) => blokHtml(b, alanRolleri(doc.slayt!).metin)).join('\n')
      : doc.blocks.map((b) => blokHtml(b, null)).join('\n'),
    '</main>',
  ].join('\n')

/**
 * Şablon katmanlarının CSS'i. **Slayt kimliği yoksa hiçbir şey basılmaz** — eski
 * belgeler ve testler aynen çalışmaya devam eder.
 */
const sablonCss = (doc: DocumentModel): string => {
  const k = doc.slayt
  if (k === undefined) return ''
  const r = alanRolleri(k)
  // Metin sütunu eğrinin KARŞI tarafında: eğri sağı dolduruyorsa metin solda.
  const sagda = egriSagda(k)
  // Düzen artık GÖRSEL bir fark yaratıyor (FAZ-10.4b): punto, dikey yaslama, tırnak,
  // madde ritmi, kanıt şeridi. Öncesinde `layout` yalnız sayfalama bütçesiydi ve
  // `quote` seçmek alıntı gibi görünmüyordu.
  const b = duzenBicimi(k.duzen)
  // Güvenli alan: 4px tabanın katı (§12.3) ve platform kenar payından geniş.
  const pay = VARSAYILAN.kenarPayi
  /** Sayacın kapladığı üst bant (26 px punto + nefes). Üste yaslı içerik bunu aşar. */
  const SAYAC_BANDI = VARSAYILAN.sayacBandi
  /** Maske dairesinin çapı — güvenli sütunun içerik genişliğinin %62'si (FAZ-11.4). */
  const capPx = Math.round(((guvenliMetinYuzdesi / 100) * doc.width - pay) * 0.62)
  return [
    // Zemin ve metin rolleri KİMLİKTEN geliyor; `body`nin varsayılanını eziyor.
    `  body { background: ${r.zemin}; color: ${r.metin};`,
    `         display: block; padding: 0; position: relative; overflow: hidden; }`,
    // ── metin sütunu: EĞRİNİN KARŞI TARAFINDA, bandın dışında ────────────────
    //
    // ⚠ İlk sürümde `max-width: 78%` idi ve metin eğri sınırını KESİYORDU: bir cümlenin
    // yarısı kehribar, yarısı kâğıt üstünde kalıyordu. Referansta metin her zaman tek
    // alanda durur — bu bir üslup tercihi değil, okunabilirlik kuralı: iki zemin
    // arasında geçen bir satırın kontrastı satır ortasında değişir.
    //
    // Sütun eğrinin karşı tarafına yerleşiyor ve genişliği `guvenliMetinYuzdesi`
    // (şablon gramerinden) ile sınırlı. Taraf `egriSagda` ile dönüyor, yani metin de
    // slayttan slayta yer değiştiriyor — ritim buradan da besleniyor.
    `  .icerik { position: relative; z-index: 3; box-sizing: border-box;`,
    `            width: ${guvenliMetinYuzdesi}%; ${sagda ? '' : 'margin-left: auto;'}`,
    // ⚠ **Üste yaslı içerik sayaç bandını AŞMAK zorunda.** Sayaç `top: pay`de duruyor ve
    // 26 px punto ile ~52 px'lik bir bant kaplıyor. `flex-start` yaslamada içerik de
    // `pay`de başlıyordu, yani ikisi aynı satırda: bu içerikte çakışmıyorlardı ama
    // başlığın ilk satırı bir kelime daha uzun olsaydı üst üste bineceklerdi.
    // Çakışmayan bir çakışma, henüz görülmemiş bir çakışmadır.
    `            padding: ${pay + (b.yaslama === 'flex-start' ? SAYAC_BANDI : 0)}px ${sagda ? 0 : pay}px ${pay + 64}px ${sagda ? pay : 0}px;`,
    `            display: flex; flex-direction: column;`,
    // Dikey yerleşim ROLE göre. Kapak alta yaslı: referansta kapak başlığı optik
    // merkezin ALTINDA durur ve üstteki boşluk nefes olur. Gövde ortalı: kısa bir
    // paragrafı tepeye yaslamak, altında 900 piksel boşluk bırakıyordu.
    // Yaslama artık DÜZENDEN geliyor; rol yalnız kapakta baskın. Kapak her zaman alta
    // yaslı kalıyor çünkü ızgarada ilk kare bir açılış cümlesidir, bir liste değil.
    `            justify-content: ${k.role === 'kapak' || k.role === 'tek' ? 'flex-end' : b.yaslama};`,
    `            min-height: 100%; }`,
    // ── düzenin tipografisi ─────────────────────────────────────────────────
    // Punto DÜZENDEN geliyor ama tavan `docs/referans/tip-olcegi.md`ten: 64 px, en uzun
    // Türkçe kelimenin güvenli sütuna sığdığı en büyük değer. Hiçbir düzen onu aşamaz.
    `  h1 { color: ${r.metin}; font-size: ${b.baslikPx}px; line-height: ${b.baslikYukseklik} }`,
    `  p  { color: ${r.metinSoluk}; font-size: ${b.govdePx}px }`,
    ...(b.tirnak
      ? [
          // Dev açılış tırnağı — bir süs değil, "bu cümle bana ait değil" işareti.
          // `::before` kullanılıyor: seçilemiyor, ekran okuyucuya okunmuyor ve belge
          // modeline bir tırnak BLOĞU eklemek gerekmiyor (D-254).
          //
          // ⚠ **AKIŞTA, mutlak konumda DEĞİL.** İlk sürüm `.icerik::before` idi ve
          // `position: absolute; top: -70px` ile kabın üstüne çıkıyordu — ama `.icerik`
          // tam yükseklikte ve içerik dikey ORTALI, yani tırnak metnin değil ÇERÇEVENİN
          // tepesine düşüyor ve kırpılıyordu. Başlığın kendi `::before`ı olarak akışa
          // girince tırnak her zaman cümlenin hemen üstünde duruyor ve puntoyla birlikte
          // ölçekleniyor. Mutlak konum, hizalanacak şeyin nerede olduğunu bilmiyordu.
          `  .icerik h1::before { content: "\\201C"; display: block;`,
          `      font-family: "Marka Display", serif; font-size: ${Math.round(b.baslikPx * 2.2)}px;`,
          `      line-height: 0.66; margin-bottom: 6px; color: ${r.metin}; opacity: 0.22 }`,
        ]
      : []),
    ...(b.maddeRitmi
      ? [
          // Madde ritmi: her gövde bloğunun önünde kısa bir çizgi. Madde İŞARETİ değil —
          // metin zaten "-" ile gelebiliyor ve iki işaret üst üste binerdi.
          // ⚠ Boşluk HİYERARŞİSİ — görsel yargının bulgusu: başlık↔ilk madde arası 37 px,
          // maddeler arası 33 px idi; fark ayırt edilemeyince dört satır tek blok gibi
          // okunuyordu. Başlık boşluğu iki katına çıkarıldı.
          // ⚠ **OLUK TEK DEĞER.** İlk denemede `.icerik > *` ile verdim ama `.icerik p`
          // kuralının özgüllüğü onu eziyordu: paragraf 34 px, blok 54 px alıyordu ve ikon
          // metne yapışıyordu. İki kural aynı oluğu ayrı ayrı yazarsa biri değişince
          // öbürü unutulur — bu projede defalarca görülen ayrışma biçimi.
          `  .icerik p { position: relative; padding-left: ${IKON_OLUK}px; margin-bottom: 10px }`,
          `  .icerik h1 { margin-bottom: ${Math.round(b.govdePx * 1.4)}px }`,
          `  .icerik p::before { content: ""; position: absolute; left: 0;`,
          `      top: ${Math.round(b.govdePx * 0.62)}px; width: 20px; height: 3px;`,
          // ⚠ Opaklık 0.55 → 0.85: ölçülen kontrast 3,71:1 idi, yanındaki gövde metni
          // 7,99:1. Bir ritim ögesi metinden silik olabilir ama okunamayacak kadar değil.
          `      background: ${r.metin}; opacity: 0.85 }`,
          // ── ikonlu madde (FAZ-11.3) ────────────────────────────────────────
          // İkon çizginin YERİNE geçiyor, yanına değil: iki işaret üst üste binerdi ve
          // madde çizgisinin varlık sebebi zaten "burada yeni bir madde başlıyor" demekti.
          // ⚠ **TEK SOL KENAR — bakınca bulundu.** Oluk yalnız `p.ikonlu`ya veriliyordu;
          // diyagram ve karşılaştırma blokları 54 px solda başlıyor, gövde metni sağda
          // duruyordu. Referans örneklerin hepsinde tüm içerik TEK bir sol kenardan
          // hizalanır — iki kenar, kompozisyonu iki ayrı sütuna böler.
          // Oluk artık `.icerik`in TÜM çocuklarına: ikon mutlak konumda `left: 0`da,
          // yani oluğun içinde kalıyor ve hiçbir şeyi itmiyor.
          `  .icerik > * { padding-left: ${IKON_OLUK}px }`,
          `  .icerik p.ikonlu::before { display: none }`,
          // Dikey hiza: ikonun ORTASI ilk satırın ortasına gelir. Üste yaslamak, 34 px
          // gövdede ikonu satırdan 8 px yukarıda bırakıyordu.
          `  .icerik p.ikonlu .ikon { position: absolute; left: 0;`,
          `      top: ${Math.round(b.govdePx * 0.72 - IKON_PX / 2)}px; opacity: 0.85 }`,
        ]
      : []),
    ...(b.kanitSeridi
      ? [
          // Kanıt şeridi: İLK gövde bloğu kenardan bir çizgiyle ayrılıyor. Ayrım görsel
          // olmazsa iddia ile kanıt aynı sesle okunur ve kanıt kanıt olmaktan çıkar.
          `  .icerik p:first-of-type { border-left: 4px solid ${r.metin};`,
          `      padding-left: 22px; margin-top: 8px }`,
        ]
      : []),
    // ── katman 1: karşı alan + akan eğri ────────────────────────────────────
    `  .alan { position: absolute; inset: 0; z-index: 1; }`,
    `  .alan svg { width: 100%; height: 100%; display: block; }`,
    // Süsleme katmanı alanın ÜSTÜNDE, hayalet rakamın ALTINDA: rakam imzadır, süsleme
    // dokudur — sıra tersine dönerse doku imzayı bastırır.
    `  .susleme { position: absolute; inset: 0; z-index: 1; pointer-events: none; }`,
    `  .susleme svg { width: 100%; height: 100%; display: block; }`,
    // ── katman 2: hayalet rakam ─────────────────────────────────────────────
    // Kontur-only tipografi: dolgu yok, `-webkit-text-stroke` var. DIŞ kenardan taşıyor
    // ve `overflow: hidden` onu kırpıyor — referanstaki "yarım rakam" bundan.
    //
    // ⚠ İki konum düzeltmesi, ikisi de ölçülmüş:
    //   1. **Metnin karşı tarafında.** Aynı tarafta olduğunda dev konturlar paragrafın
    //      arkasından geçiyor ve ikisi de okunmuyordu.
    //   2. **Alt şeridin ÜSTÜNDE bitiyor.** Öncesinde `bottom` negatifti ve rakam
    //      `kaydır ››` ile üst üste biniyordu — z-index onu arkada tutuyordu ama
    //      çakışma yine de kazara duruyordu. Nefes payı bırakmak yeterli.
    `  .hayalet { position: absolute; z-index: 2;`,
    `             ${sagda ? 'right' : 'left'}: -${Math.round(pay * 0.7)}px; bottom: ${pay + 62}px;`,
    `             font-family: "Marka Display", sans-serif;`,
    `             font-size: ${VARSAYILAN.hayaletPx}px; font-weight: 700; font-stretch: 88%; line-height: 0.78;`,
    `             color: transparent; -webkit-text-stroke: ${VARSAYILAN.hayaletKonturPx}px ${r.motif}; opacity: 0.42;`,
    `             pointer-events: none; }`,
    // ── katman 3: sayaç, kulp, navigasyon ───────────────────────────────────
    //
    // ⚠ **Renk, ALTINDAKİ alana göre seçiliyor** — hayalet rakamdaki kusurun aynısı bu
    // üç ögede de vardı. `metinSoluk` ZEMİN için seçilmiş bir renk; ama bu ögeler
    // köşelerde duruyor ve köşelerin bir kısmı DOLGUNUN üstünde. Sağdaki ögeler
    // (`sayac`, `nav`) dolgu sağdayken dolgunun üstünde; soldaki (`kulp`) dolgu
    // soldayken. Yanlış tarafta `metinSoluk` kontrastı çökertiyor: kapanış slaytında
    // kâğıt rengi kulp, amber dolgu üstünde ~1.9:1 veriyordu — WCAG AA'nın yarısı.
    // `motif` zaten `kontrast(karsiAlan)`; dolgu üstündeki öge onu kullanıyor.
    `  .sayac { position: absolute; z-index: 4; top: ${pay}px; right: ${pay}px;`,
    `           font-size: 26px; font-weight: 600; letter-spacing: 0.06em;`,
    `           font-variant-numeric: tabular-nums slashed-zero;`,
    `           color: ${sagda ? r.motif : r.metinSoluk}; }`,
    `  .kulp { position: absolute; z-index: 4; left: ${pay}px; bottom: ${pay}px;`,
    `          font-size: 24px; letter-spacing: 0.02em;`,
    `          color: ${sagda ? r.metinSoluk : r.motif}; }`,
    `  .nav { position: absolute; z-index: 4; right: ${pay}px; bottom: ${pay}px;`,
    `         font-size: 24px; letter-spacing: 0.04em;`,
    `         color: ${sagda ? r.motif : r.metinSoluk}; }`,
    // ── görsel: KUTU DEĞİL ALAN (FAZ-10.7) ──────────────────────────────────
    //
    // ⚠ Önceki hâlde `width: 100%` idi ve padding'li sütunun içinde her yanı eşit
    // boşluklu bir dikdörtgen olarak duruyordu: **kompozisyon değil, yapıştırılmış
    // resim.** Kabul koşularında ÜÇ KEZ görüldü (4, 6 ve öncesi) ve her seferinde aynı
    // izlenim: fotoğraf slaydın parçası değil, üstüne konmuş bir nesne.
    //
    // Düzeltme: görsel DIŞ kenara taşıyor (metin sütunu hangi taraftaysa onun dış
    // kenarına). Böylece çerçeveye bağlanıyor ve bir ALAN oluyor — eğri nasıl bir alan
    // sınırıysa, görsel de öyle. İç kenarda padding korunuyor: metin hizası bozulmuyor.
    // ⚠ **Görsel kalan dikey alanı DOLDURUYOR** (`flex: 1`). Sabit oranda bırakıldığında
    // — ki 180 karakterlik sayfalama bütçesi verildikten sonra görsel çoğu zaman tek
    // başına bir slayta düşüyor — altında büyük bir boşluk kalıyordu: alan değil, hâlâ
    // kutu. `object-fit: cover` oranı bozmadan kırpıyor; `min-height: 0` flex öğesinin
    // içeriğinden küçülebilmesi için şart (varsayılan `auto` taşmayı engelliyor).
    // ── DUOTONE (FAZ-11.7): renk tutarlılığı YAPISAL ────────────────────────
    //
    // ⚠ Fotoğrafın parlaklığı marka eksenine eşleniyor; girdi ne olursa olsun çıktı
    // marka içinde. FAZ-10.7'de mavi/turuncu bir fotoğraf amber alanla çarpıştı ve
    // brief'e "monokrom yaz" diye yalvarmıştım — modelin uymasına bağlı, kırılgan.
    // ⚠ Ürün ekran çekimi HARİÇ: o bir KANITTIR, rengini değiştirmek iddiayı bozar.
    `  .icerik img.yuva-alan, .icerik img.yuva-maske { filter: url(#${DUOTONE_ID}); }`,
    dokuCss(),
    vinyetCss(doc.aile?.vinyetGucu),
    // ── YUVA: alan (FAZ-11.4) — bugünkü davranışın adı konmuş hâli ─────────
    `  .icerik img.yuva-alan { width: calc(100% + ${pay}px); border-radius: 0; display: block;`,
    `                margin-${sagda ? 'left' : 'right'}: -${pay}px;`,
    `                flex: 1 1 auto; min-height: 0; object-fit: cover; }`,
    // ── YUVA: maske — daire kırpma, referans örnek 2'nin dili ──────────────
    //
    // ⚠ **`aspect-ratio: 1` ŞART.** `clip-path: circle(50%)` dikdörtgen bir kutuda
    // ELİPS değil, kutunun kısa kenarına göre daire çizer ve fotoğrafın kenarlarını
    // keser — ama kutu kare değilse daire kutunun ortasında durmaz, `object-fit`
    // olmadan da özne kaymış görünür. Üçü birlikte: kare kutu, cover, merkez daire.
    // ⚠ Genişlik %78: sütunun tamamını kaplayan bir daire, çevresinde nefes bırakmıyor
    // ve maske olmaktan çıkıp yine bir alan oluyor.
    // ⚠ **`flex: none` + `height: auto` ŞART, `aspect-ratio` tek başına YETMİYOR.**
    // İlk sürüm `flex: 0 0 auto` ile bırakıyordu ve daire SOL KENARINDAN DÜZ KESİLMİŞ
    // çıktı: flex öğesi görüntünün intrinsic boyutunu (1080×1350) taban alıyor,
    // `aspect-ratio` devreye girmiyor ve kutu kare olmuyordu. `clip-path: circle(50%)`
    // kare olmayan bir kutuda yarıçapı köşegenden hesaplar; yarıçap yarım genişliği
    // aşınca daire kutunun kenarlarında kesiliyor. Bakmadan görülmezdi.
    // ⚠ **ÇAP PİKSEL, yüzde DEĞİL — iki deneme sonra öncül sorgulandı.** Önce
    // `aspect-ratio: 1`, sonra `flex: none; height: auto` denendi; ikisinde de daire
    // kenarından DÜZ KESİLDİ. Sebep: kutu kare olmuyordu ve `clip-path: circle(50%)`
    // kare olmayan bir kutuda yarıçapı KÖŞEGENDEN hesaplıyor — yarıçap yarım genişliği
    // aşınca daire kutunun kenarlarında kesiliyor. Yüzde tabanlı bir kare, flex
    // bağlamında güvenilir değil; çap doğrudan hesaplanıyor.
    //
    // Çap mevcut ölçülerden TÜRETİLİYOR, yeni bir sayı değil: güvenli sütunun içerik
    // genişliği (`guvenliMetinYuzdesi` × tuval − kenar payı), onun %62'si. Çevresinde
    // nefes kalıyor — sütunu tamamen kaplayan bir daire maske olmaktan çıkıp alan olur.
    `  .icerik img.yuva-maske { width: ${capPx}px; height: ${capPx}px;`,
    `                flex: none; align-self: center; margin: 24px auto;`,
    `                object-fit: cover; clip-path: circle(50%);`,
    `                border-radius: 0; display: block; }`,
  ].join('\n')
}

/** Katmanların HTML'i — sıra z-index'i izliyor. */
const sablonKatmanlari = (doc: DocumentModel): string => {
  const k = doc.slayt
  if (k === undefined) return ''
  const r = alanRolleri(k)
  const sagda = egriSagda(k)
  const d = akanEgri(k)
  // Eğrinin bir TARAFI dolduruluyor: path'i kutunun kenarlarıyla kapatıp alan yapıyoruz.
  const kapali = sagda ? `${d} L 100 100 L 100 0 Z` : `${d} L 0 100 L 0 0 Z`
  const rakam = hayaletRakam(k)
  const sayac = sayacEtiketi(k)
  const nav = navIsareti(k)
  // Süslemeler AYRI bir SVG katmanında ve `preserveAspectRatio` YOK: alan katmanı
  // `none` ile geriliyor (dolgu tuvali kaplamalı), ama gerilmiş bir daire elips olur.
  // Aynı viewBox'a koymak, beş ögenin de ezilmesi demekti.
  const sus = suslemeler(k, sagda, doc.aile?.suslemeYogunlugu, doc.aile?.panorama)
  return [
    `<div class="alan"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">`,
    `<path d="${kapali}" fill="${r.karsiAlan}"/></svg></div>`,
    ...(sus.length === 0
      ? []
      : [
          `<div class="susleme"><svg viewBox="0 0 100 ${Math.round((doc.height / doc.width) * 100)}" aria-hidden="true">`,
          ...sus.map((x) => suslemeSvg(x, r.motif)),
          `</svg></div>`,
        ]),
    ...(rakam === null ? [] : [`<div class="hayalet" aria-hidden="true">${kacir(rakam)}</div>`]),
    ...(sayac === null ? [] : [`<div class="sayac">${kacir(sayac)}</div>`]),
    ...(k.kulp === undefined ? [] : [`<div class="kulp">${kacir(k.kulp)}</div>`]),
    ...(nav === null ? [] : [`<div class="nav">${kacir(nav)}</div>`]),
  ].join('\n')
}

/**
 * PNG üretir. Çıktı **yola yazılır**, byte döndürülmez: bir varlığın byte'ları
 * bellekte dolaşırsa nereye yazıldığı manifestte kaybolur (§13).
 */
/**
 * Sayfayı NEREDEN alacağını seçen tek nokta.
 *
 * Oturum verilirse onun sayfası kullanılıyor (tarayıcı zaten açık), verilmezse
 * `withPage` tek kullanımlık bir tarayıcı açıyor. İki dal AYNI işi yapıyor; ayrı
 * yazılsalardı biri font beklemesini unutur ve o slayt sessizce sistem fontuyla
 * çıkardı — tam da D-252'nin kapattığı hata modu, arka kapıdan geri gelirdi.
 */
const sayfaCalistir = <T>(
  oturum: Oturum | undefined,
  fn: (page: Page) => Promise<T>
): Promise<BrowserResult<T>> => (oturum === undefined ? withPage(fn) : oturum.sayfaIle(fn))

export const renderStatic = async (
  doc: DocumentModel,
  outPath: string,
  oturum?: Oturum
): Promise<
  BrowserResult<{ readonly path: string; readonly width: number; readonly height: number }>
> => {
  const dogrulama = validateDocument(doc)
  if (!dogrulama.ok) {
    return {
      ok: false,
      error: {
        kind: 'render_failed',
        message: `belge geçersiz: ${JSON.stringify(dogrulama.errors)}`,
      },
    }
  }

  return sayfaCalistir(oturum, async (page) => {
    await page.setViewportSize({ width: doc.width, height: doc.height })
    await page.setContent(toHtml(doc), { waitUntil: 'load' })
    // Font yüklemesi TAMAMLANMADAN ekran görüntüsü almak, glif fallback'iyle
    // üretilmiş sessizce bozuk bir varlık demektir (§7.2).
    //
    // `document.fonts.ready` bir `FontFaceSet`e çözülür ve Playwright onu SERİLEŞTİREMEZ —
    // doğrudan döndürmek çağrıyı hata ile düşürürdü. Beklenen şey promise, taşınan bayrak.
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    await page.screenshot({ path: outPath, type: 'png' })
    return { path: outPath, width: doc.width, height: doc.height }
  })
}

// ── kalite merdiveni GERÇEKTEN uygulanır (§9.1 · D-139) ──────────────────────
//
// **İlk sürüm hiçbir şey yapmıyordu.** `climbLadder` uydurma bir formülle
// (`boyut × kalite/200 × ölçek²`) bir basamak "seçiyor", sonra o basamak hiçbir yere
// gitmiyordu: dosya orijinal PNG olarak kalıyor ve 53KB'lık bir varlık 30KB limitine
// karşı **sessizce yayınlanıyordu**. Doğrulama agent'ı 2026-08-15'te yakaladı.
//
// Artık merdiven her basamağı GERÇEKTEN render ediyor ve dosya boyutunu ÖLÇÜYOR.
// Tahmin yok: sıkıştırılmış boyut içeriğe bağlıdır ve hiçbir formül onu bilemez.

import { QUALITY_LADDER, type QualityRung } from './specs/placements.js'

export interface LadderRender {
  readonly path: string
  readonly bytes: number
  readonly rung: QualityRung
  readonly rungIndex: number
  readonly width: number
  readonly height: number
}

/**
 * Belgeyi boyut sınırına SIĞANA KADAR render eder.
 *
 * Her basamak gerçek bir render ve gerçek bir ölçüm. Merdiven tükenirse **hata döner** —
 * son basamağı "en iyisi buydu" diye kabul etmek, sınırı aşan bir varlığı yayına
 * göndermektir (§9.1).
 *
 * Uzantı basamağa göre değişir: PNG basamağı `.png`, JPEG basamakları `.jpg`. Aynı
 * dosyayı üzerine yazmak, "hangi format çıktı" sorusunu dosya adından silerdi.
 */
export const renderWithinLimit = async (
  doc: DocumentModel,
  outPathBase: string,
  maxBytes: number,
  oturum?: Oturum
): Promise<BrowserResult<LadderRender>> => {
  const dogrulama = validateDocument(doc)
  if (!dogrulama.ok) {
    return {
      ok: false,
      error: {
        kind: 'render_failed',
        message: `belge geçersiz: ${JSON.stringify(dogrulama.errors)}`,
      },
    }
  }

  const taban = outPathBase.replace(/\.(png|jpe?g)$/i, '')
  let sonBoyut = 0
  let sonYol = ''

  for (const [i, rung] of QUALITY_LADDER.entries()) {
    const w = Math.round(doc.width * rung.scale)
    const h = Math.round(doc.height * rung.scale)
    const uzanti = rung.jpegQuality === null ? '.png' : '.jpg'
    const yol = `${taban}${uzanti}`

    const r = await sayfaCalistir(oturum, async (page) => {
      await page.setViewportSize({ width: w, height: h })
      // Ölçek düşerken tuval küçülür ama BELGE aynı kalır: tipografi oransal olarak
      // korunur. Belgeyi yeniden düzenlemek (daha az blok) başka bir varlık üretmek olurdu.
      await page.setContent(toHtml({ ...doc, width: w, height: h }), { waitUntil: 'load' })
      await page.evaluate('(async () => { await document.fonts.ready; return true })()')
      if (rung.jpegQuality === null) await page.screenshot({ path: yol, type: 'png' })
      else await page.screenshot({ path: yol, type: 'jpeg', quality: rung.jpegQuality })
      return statSync(yol).size
    })
    if (!r.ok) return r

    sonBoyut = r.value
    sonYol = yol
    if (r.value <= maxBytes) {
      return {
        ok: true,
        value: { path: yol, bytes: r.value, rung, rungIndex: i, width: w, height: h },
      }
    }
  }

  return {
    ok: false,
    error: {
      kind: 'render_failed',
      message:
        `kalite merdiveni tükendi: ${Math.round(sonBoyut / 1024)}KB > ` +
        `${Math.round(maxBytes / 1024)}KB (${sonYol}) — içerik azaltılmalı, sessizce yayınlanmaz`,
    },
  }
}
