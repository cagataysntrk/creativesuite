// HEDEF: packages/kernel/src/doc/model.ts
//
// Belge modeli — `RENDER`ın gördüğü TEK şey (§7.1 · §3.2).
//
// **`RENDER` `RecordEnvelope` GÖRMEZ** ve bu grep'le değil İMZAYLA zorlanır:
// `renderStatic(doc: DocumentModel)` imzası, zarfı geçirmeyi derleme hatası yapar.
// Varlığa özgü veriye yasal yol: `SELECT` → `unsealAttributes` (yalnız Ring 1) →
// `COMPOSE` (saf) → belge modeli → `RENDER`.
//
// Belge modeli kasten FAKİR: yalnız blok listesi, boyut ve token CSS'i. Zengin olsaydı
// (koşullu yerleşim, hesaplanan alanlar) `RENDER` bir şablon motoruna dönerdi ve
// "tek render motoru" yasası şablon diline kaçardı.

import type { LayoutName } from '@suite/contracts'
import type { AssetStamp } from '../era.js'

export type BlockType = 'heading' | 'body' | 'image' | 'spacer' | 'chart' | 'diagram'

/**
 * Görsel blok. `alt` ZORUNLU: R-34 yayında alt-text'siz görseli bloklar ve alanı
 * isteğe bağlı bırakmak, "sonra ekleriz"i bugünden mümkün kılardı. Dekoratif görsel
 * için `alt: ''` DEĞİL, `decorative: true` yazılır — boş dize bir iddiadır ve
 * yanlış iddiadır.
 */
export interface ImageBlock {
  readonly type: 'image'
  readonly src: string
  readonly alt: string
  readonly decorative: boolean
  /**
   * Görüntünün NE İDDİA ETTİĞİ (FAZ-6.8).
   *
   * `product_screenshot` bir iddiadır: "ürün gerçekten böyle görünüyor". O yüzden
   * gerçek çekime bağlanmak zorunda — `inspectManifest` bunu yayın yükleminde denetler.
   * Verilmezse görüntü hiçbir şey iddia etmez ve serbesttir.
   */
  readonly role?: 'product_screenshot'
  /**
   * Fotoğrafın YUVASI — dikdörtgen serbest fotoğraf ARTIK YOK (FAZ-11.4 · D-261).
   *
   * `alan`  — metin sütununu uçtan uca doldurur, dış çerçeve kenarına taşar. Bir KUTU
   *           değil bir ALAN: kompozisyon çerçeveyi kendine güvenerek kullanır.
   * `maske` — daire kırpma. Referans örnek 2'nin dili: özne beyaz bir dairenin üstünde
   *           durur. Kesik özne (11.5) geldiğinde asıl yerini bulur.
   *
   * ⚠ `product_screenshot` yuvasız kalabilir: o bir tasarım ögesi değil, bir KANITTIR
   * ve kırpılması iddiayı bozar.
   */
  readonly yuva?: 'alan' | 'maske'
}

/**
 * Serinin ANLAMI — rengi değil (R-35 · §12.1). Rol token'ına render katmanında çözülür.
 *
 * Belge modeli renk TAŞIMAZ: bir hex burada olsaydı marka değiştiğinde grafik eski
 * markanın renginde kalırdı ve bunu ancak PDF'e bakan bir insan fark ederdi.
 */
export type SeriesTone = 'neutral' | 'ok' | 'warn' | 'error'

export interface ChartPoint {
  readonly label: string
  readonly value: number
  readonly tone?: SeriesTone
}

/**
 * Grafik bloğu — **veri**, çizim değil.
 *
 * Alternatif, `COMPOSE`un grafiği HTML'e çevirip belgeye gömmesiydi. O yol belge
 * modeline serbest işaretleme sokardı ve "tek render motoru" yasası (R-30) bir şablon
 * diline kaçardı — bu dosyanın başındaki uyarının tam olarak tarif ettiği şey.
 */
export interface ChartBlock {
  readonly type: 'chart'
  readonly chartKind: 'bar' | 'line'
  readonly title: string
  /** Birim (`%`, `adet`). Birimsiz sayı iddia değil, süstür (R-32). */
  readonly unit?: string
  readonly points: readonly ChartPoint[]
  /** Verinin anlık görüntü tarihi (§7.6). Zorunlu ve sayfada görünür. */
  readonly asOf: string
}

/**
 * Akış diyagramı bloğu (FAZ-6.2 · FAZ-6.10).
 *
 * ⚠ `diagramHtml` 6.2'de yazıldı ve test edildi ama **belge modelinde karşılığı yoktu** —
 * yani hiçbir deck diyagram taşıyamıyordu (FAZ 6 denetimi, bulgu 11). Çizen kod vardı,
 * çizilecek veri yoktu.
 *
 * Yatay akış tavanı `MAX_DUGUM` (render katmanında): fazlası deck'te okunamaz ve
 * sessizce daraltmak yerine reddedilir.
 */
/**
 * Karşılaştırma bloğu — ÖNCE ve SONRA (FAZ-12.5).
 *
 * ⚠ **Sayı İSTEMEYEN tek veri ögesi ve varlık sebebi bu.** Halka, KPI karosu ve ilerleme
 * göstergesi hepsi bir orana ya da bir sayıya dayanıyor; R-32 kaynaksız sayısal iddiayı
 * yasaklıyor ve `icerikPromptu` zaten *"hiçbir sayısal iddia yazma"* diyor. Onları yazmak,
 * üretim yolu kapalı bir makine kurmak olurdu — bu projede yedi kez tekrarlayan hata
 * (D-261). Karşılaştırma ise yapısal: iki durum, sayı yok.
 *
 * ⚠ Akış diyagramından FARKLI: akış bir SIRA anlatır (adım → adım), karşılaştırma bir
 * KARŞITLIK kurar (şimdi → olması gereken). Aynı şekli iki kez çizmek olmuyor.
 */
/**
 * Belgeye eşlik eden AİLE parametreleri (FAZ-12.7).
 *
 * ⚠ **Render bunları PLANDAN almak zorunda, kendi sabitinden değil.** Süsleme yoğunluğu
 * bugüne kadar `sablon-susleme.ts`te sabitti ve plan da 0.25 diyordu: ikisi TESADÜFEN
 * aynıydı. Kelime tavanının prompt ile ölçümde ayrı ayrı yazılmasıyla aynı hata — biri
 * değişse öbürü sessizce eski kalırdı.
 *
 * ⚠ Yalnız ESTETİK alanlar: güvenli alan, kontrast eşiği ve chroma tavanı burada YOK.
 */
/** Normalize dikdörtgen — tuval yüzdesi (0–100). */
export interface Bolge {
  readonly x: number
  readonly y: number
  readonly genislik: number
  readonly yukseklik: number
}

export interface AileParametreleri {
  readonly suslemeYogunlugu: number
  readonly vinyetGucu: number
  readonly degrade: boolean
  /** Panoramik süreklilik açık mı (FAZ-12.4). */
  readonly panorama: boolean
  /**
   * Fotoğraf yuvasına uygulanan raster işlemler — KAPALI dağarcık (FAZ-12.2).
   *
   * ⚠ Serbest CSS dizesi DEĞİL: sağlayıcı çıktısının stile sızmasının önü tip düzeyinde
   * kapalı. Sıra bu listeden okunmuyor, dağarcıktan geliyor (`islemZinciri`).
   */
  // ⚠ ⚠ **BU LİSTENİN ÜÇÜNCÜ KOPYASI ve ilk ikisi bir DERLEME SINAVIYLA bağlıydı.**
  // `gorsel-islem.ts` (render) ile `aile.ts` (contracts) arasında `_kumelerAyni` sınavı
  // var; bu üçüncüsü hiçbir sınava bağlı değildi ve iki yeni işlem eklenince SESSİZCE
  // ayrıştı — derleme onu ancak `bodies.ts` üstünden, dolaylı olarak yakaladı.
  // ⚠ Ring 0 render'ı göremiyor, o yüzden liste burada yaşamak zorunda; ama ayrışması
  // bir sınava bağlanmalı. Borç kaydı: `docs/BORCLAR.md` C6.
  readonly gorselIslemleri?: readonly (
    'matlama' | 'keskinlik' | 'tema-uyum' | 'duotone' | 'temas-golgesi'
  )[]
  /**
   * Açık tipografi efektleri — kapalı dağarcıktan alt küme (FAZ-12.1).
   *
   * ⚠ Alan FAZ-13.4'te eklendi ve sebebi bir ölçüm boşluğuydu: aile bu listeyi
   * TAŞIYORDU ama render'a hiç ulaşmıyordu, vurgu şeridi koşulsuz basılıyordu.
   * Parmak izi ölçülemeyen bir alanı sabit yazmak zorunda kalınca zincir görüldü.
   */
  readonly tipoEfektleri?: readonly ('vurgu' | 'kontur' | 'degrade' | 'golge' | 'knockout')[]
  /**
   * Kimlik parametreleri (FAZ-13 şablon genelleştirme).
   *
   * ⚠ ⚠ **Bunlar `sablon.ts`te SABİTTİ ve o yüzden `akici` `temel`in süslü hâliydi.**
   * Aile ancak süsleme yoğunluğu ve vinyet diyebiliyordu; renk şeması, sınır biçimi,
   * hayalet rakam ve tipografi ölçeği gramerin içine gömülüydü. Yedi ayrı tasarım
   * üretmek istendiğinde satırın **yeterince şey söyleyemediği** görüldü.
   * ⚠ Garanti katmanı yine YOK: kontrast eşiği, güvenli alan, chroma tavanı, kelime
   * bütçesi burada da bulunmuyor. Aile zemin SEÇER; metin rengi zeminden TÜRETİLİR.
   */
  readonly alan?: {
    readonly zeminler: readonly string[]
    readonly kapanisZemini: string | null
    readonly ikiAlan: boolean
  }
  readonly sinir?: 'egri' | 'kosegen' | 'yok'
  readonly hayalet?: { readonly bicim: 'kontur' | 'yok'; readonly olcekYuzde: number }
  readonly tipoPayi?: number
  readonly suslemeTipleri?: readonly (
    'blob' | 'nokta' | 'tarama' | 'halka' | 'kare' | 'yay' | 'cizgi'
  )[]
  /**
   * Kompozisyon iskeleti — bölgeler, çizgi dili, tipografi ilişkisi.
   *
   * ⚠ Şekil `@suite/contracts`taki `Iskelet` ile aynı; kernel ring 0 ve contracts'tan
   * TİP import edemediği için burada yeniden yazılı. İki şeklin ayrışması derleme
   * hatası vermez — `bodies.ts` ikisini birden gördüğü için orada yakalanır.
   */
  readonly iskelet?: {
    readonly metin: Bolge
    readonly rakam: Bolge | null
    readonly gorsel: Bolge | null
    readonly susleme: Bolge
    readonly cizgi:
      | { readonly tip: 'egri'; readonly merkez: number; readonly genlik: number }
      | { readonly tip: 'kosegen'; readonly merkez: number; readonly egim: number }
      | {
          readonly tip: 'izgara'
          readonly yatay: readonly number[]
          readonly dikey: readonly number[]
        }
      | { readonly tip: 'yok' }
    readonly tipo: {
      readonly baslikPayi: number
      readonly govdeOrani: number
      readonly satirAraligi: number
    }
  }
  /** Yerleşim — metin sütununun yeri, payı ve dikey hizası. */
  readonly yerlesim?: {
    readonly kolon: 'sinir' | 'orta' | 'kenar'
    readonly payPayi: number
    readonly dikey: 'orta' | 'alt' | 'ust'
  }
}

export interface CompareBlock {
  readonly type: 'compare'
  readonly title: string
  readonly once: { readonly label: string; readonly items: readonly string[] }
  readonly sonra: { readonly label: string; readonly items: readonly string[] }
}

export interface DiagramNodeBlock {
  readonly label: string
  /** Alt satır: adımın çıktısı ya da ölçüsü. */
  readonly detail?: string
  readonly tone?: SeriesTone
}

export interface DiagramBlock {
  readonly type: 'diagram'
  readonly title: string
  readonly nodes: readonly DiagramNodeBlock[]
}

/**
 * Metin bloğunun HİKÂYE İŞLEVİ — kanca · gerilim · kanıt · dönüş · davet (FAZ-14.1).
 *
 * ⚠ **Bloğun üstünde duruyor, slaydın değil — ve bu bir birim düzeltmesi.** Yay satır
 * sırasına göre atanıyor ama ölçüm SLAYT sırasına bakıyordu; sayfalayıcı 6 satırı 5
 * slayda bölünce üçüncü satır (bir `kanit`, 22 kelime) ikinci slaytta ölçüldü ve
 * `gerilim`in 21 kelimelik bütçesine çarptı. Altı satırın **hepsi** bütçe içindeydi;
 * hatalı olan ölçendi. Bu, aynı metrikteki DÖRDÜNCÜ birim uyuşmazlığı (D-260) ve
 * kökü hep aynı: bir özelliği taşıyıcısından ayırıp konumdan yeniden türetmek.
 */
export type Islev = 'kanca' | 'gerilim' | 'kanit' | 'donus' | 'davet'

export type Block =
  | {
      readonly type: 'heading'
      readonly text: string
      readonly level: 1 | 2
      readonly islev?: Islev
    }
  | { readonly type: 'body'; readonly text: string; readonly islev?: Islev }
  | ImageBlock
  | { readonly type: 'spacer'; readonly size: 'sm' | 'md' | 'lg' }
  | ChartBlock
  | CompareBlock
  | DiagramBlock

export type DocumentKind = 'post' | 'carousel-slide' | 'deck-page'

export interface DocumentModel {
  readonly kind: DocumentKind
  /** Piksel. Platform spec'i belirler (§9.1); belge modeli yalnız taşır. */
  readonly width: number
  readonly height: number
  readonly blocks: readonly Block[]
  /** `brand/<id>/derived-tokens/tokens.css` içeriği (FAZ-2.10). Marka BURADAN gelir. */
  readonly tokenCss: string
  /**
   * Marka fontları — `@font-face` blokları, base64 GÖMÜLÜ (D-252).
   *
   * Boş bırakılırsa sistem fontuna düşülür ve `ĞÜŞİÖÇ` sessizce bozulabilir. Alan
   * isteğe bağlı çünkü eski belgeler ve testler onsuz kuruluyor; üretim yolunda
   * `golden` metrikleri `notdef = 0` arıyor ve boş font orada yakalanır.
   */
  readonly fontCss?: string
  /**
   * Slayt kimliği — **rol taşır, çizim taşımaz** (§7.1 · D-254).
   *
   * ⚠ Modelde `ornament: '<svg>…'` gibi bir alan YOK ve olmayacak: belge modeline
   * işaretleme sokmak "tek render motoru" yasasını (R-30) bir şablon diline çevirir
   * ve o dil ikinci bir CSS alt kümesi doğurur — D-24'ün tam olarak reddettiği şey.
   *
   * Model **hangi slayt olduğunu** söyler; hayalet rakamı, akan eğriyi, sayacı ve
   * renk rotasyonunu `static.ts` bundan TÜRETİR. Aynı kimlik her koşuda aynı
   * kompozisyonu verir (deterministik) ama slayttan slayta değişir (generative).
   */
  readonly slayt?: SlaytKimligi
  /** Ailenin estetik parametreleri (FAZ-12.7). Yoksa render varsayılanı kullanır. */
  readonly aile?: AileParametreleri
  /** Üretim damgası (R-11). Çıktı meta'sına basılır; retrofit imkânsız. */
  readonly stamp: AssetStamp
}

/** Slaytın teslimat içindeki yeri. `derived/blobs` sidecar'ındaki `deliverable` ile aynı dil. */
export interface SlaytKimligi {
  readonly role: 'kapak' | 'govde' | 'kapanis' | 'tek'
  /** 0 tabanlı. Hayalet rakam `index + 1` olarak basılır. */
  readonly index: number
  readonly total: number
  /**
   * Kulp — profil adı şeridi. Referanslarda her slaytta var ve **süreklilik
   * ögesidir**: ızgaraya bakan göz onu tanır ve postu markaya bağlar.
   */
  readonly kulp?: string
  /**
   * Seçilen düzen (FAZ-10.4b). **Rol taşır, çizim taşımaz** — `quote` yazması slaytın
   * NE OLDUĞUNU söylüyor, nasıl çizileceğini değil; tırnak işaretini `sablon.ts`
   * çiziyor. `ornament: '<svg>…'` gibi bir alan burada YOK ve olmayacak (D-254).
   *
   * Sayfalayıcı seçiyor (`duzenSec`), çünkü kaç bloğun sığdığını bilen tek yer orası.
   * Verilmezse kompozisyon `statement` gibi davranıyor — eski belgeler kırılmıyor.
   */
  readonly duzen?: LayoutName
}

export type DocError =
  | { readonly kind: 'empty_document' }
  | { readonly kind: 'missing_alt'; readonly index: number }
  | { readonly kind: 'invalid_size'; readonly width: number; readonly height: number }
  | { readonly kind: 'empty_text'; readonly index: number }
  | { readonly kind: 'image_without_slot'; readonly index: number }
  /** Noktasız ya da sonlu olmayan değerli grafik. Boş kutu, verinin yokluğunu DEĞİL
   *  render'ın bozulduğunu düşündürür — sessizce basılmaz. */
  | { readonly kind: 'invalid_chart'; readonly index: number }
  /** İki kutudan az diyagram — okuyucuya hiçbir şey anlatmaz. */
  | { readonly kind: 'invalid_diagram'; readonly index: number }
  | { readonly kind: 'invalid_compare'; readonly index: number }

export type DocResult =
  | { readonly ok: true; readonly value: DocumentModel }
  | { readonly ok: false; readonly errors: readonly DocError[] }

/**
 * Belge modelini doğrular. **Boş belge geçerli DEĞİLDİR**: boş bir PNG üretmek,
 * üretilmemiş bir varlığı üretilmiş saymanın en sessiz yolu.
 */
export const validateDocument = (doc: DocumentModel): DocResult => {
  const errors: DocError[] = []
  if (doc.blocks.length === 0) errors.push({ kind: 'empty_document' })
  if (doc.width <= 0 || doc.height <= 0) {
    errors.push({ kind: 'invalid_size', width: doc.width, height: doc.height })
  }
  doc.blocks.forEach((b, i) => {
    // ⚠ **YUVASIZ FOTOĞRAF REDDEDİLİYOR** (FAZ-11.4). FAZ-10.7'de dört kez yamadığım
    // kusur sınıfının kökü, fotoğrafın serbest bir dikdörtgen olarak konabilmesiydi:
    // her yanında eşit boşlukla duran bir kutu, kompozisyonun parçası değil üstüne
    // yapıştırılmış bir nesne. Yuva zorunlu olunca o hâl temsil EDİLEMEZ hâle geliyor.
    // Ürün ekran çekimi hariç: o bir kanıttır, kırpılması iddiayı bozar.
    if (b.type === 'image' && b.role !== 'product_screenshot' && b.yuva === undefined) {
      errors.push({ kind: 'image_without_slot', index: i })
    }
    if (b.type === 'image' && !b.decorative && b.alt.trim() === '') {
      errors.push({ kind: 'missing_alt', index: i })
    }
    if ((b.type === 'heading' || b.type === 'body') && b.text.trim() === '') {
      errors.push({ kind: 'empty_text', index: i })
    }
    // Grafik doğrulaması BURADA, render'da değil: `isPublishable` bu listeyi okuyor
    // ve bozuk bir grafik yayına gitmemeli. Render katmanı da ayrıca reddediyor —
    // ama orada reddedilen bir şey zaten üretim zamanına kalmış demektir.
    if (
      b.type === 'chart' &&
      (b.points.length === 0 || b.points.some((p) => !Number.isFinite(p.value)))
    ) {
      errors.push({ kind: 'invalid_chart', index: i })
    }
    // Tek kutuluk "akış" akış değildir; boş diyagram da sessizce boş bir kutu basar.
    if (b.type === 'diagram' && b.nodes.length < 2) {
      errors.push({ kind: 'invalid_diagram', index: i })
    }
    // İki taraf da EN AZ bir madde taşımalı: tek taraflı bir karşılaştırma, karşılaştırma
    // değil bir listedir ve zaten `list` düzeni onu daha iyi çiziyor.
    if (
      b.type === 'compare' &&
      (b.title.trim() === '' || b.once.items.length === 0 || b.sonra.items.length === 0)
    ) {
      errors.push({ kind: 'invalid_compare', index: i })
    }
  })
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: doc }
}
