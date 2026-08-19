// HEDEF: packages/render/src/panorama.ts
//
// Kesintisiz karosel — TEK GENİŞ TUVAL, sonra dilimleme (§7.1 · R-30).
//
// ⚠ ⚠ **BU DOSYA BİR MİMARİ DÜZELTMEDEN DOĞDU.** Mevcut render her slaydı AYRI çiziyor ve
// sürekliliği *ima etmeye* çalışıyordu: eğrinin çıkış açısı sonrakinin giriş açısıyla
// uyumlu olsun, yarım bir şekil kenardan taşsın… Hiçbiri gerçekten sürekli görünmedi ve
// görünemezdi — **süreklilik bir efekt değil, tuvalin kendisidir.**
//
// Doğru yöntem (Photoshop eğitimlerinde *seamless carousel*): 6 slaytlık bir karosel için
// 6480×1350'lik TEK bir tuval tasarlanır, öğeler kesim çizgilerini serbestçe aşar, sonra
// tuval dilimlenir. Kaydıran göz bölünmüş bir tasarım değil, DEVAM EDEN bir tasarım görür.
//
// ⚠ ⚠ **KESİMİ AŞAN ÖĞE İÇERİKTEN TÜRER, SÜSTEN DEĞİL.** Referansta akan şey pandomimcinin
// koluydu; nüfus karoselinde 1800→2100 nüfus EĞRİSİ, beş şart karoselinde kemer dizisi.
// Üçü de dekoratif değil anlatının parçası: kaydırma hareketi hikâyeyi anlatıyor.
// Bant bir süsleme olsaydı silinebilirdi; içerikten türediği için silinemez.
//
// ⚠ **Dilimleme ImageMagick'siz:** sahne `translateX(-i × genislik)` ile kaydırılıp her
// slayt ayrı ekran görüntüsü olarak alınıyor. Görüntü kütüphanesi bir bağımlılık olurdu
// (R-75) ve tarayıcı zaten elimizde — kırpma işini yapan şey viewport'un kendisi.
//
// ⚠ **Tipografi CANLI kalıyor** (R-20): metin hiçbir aşamada rasterleşmiyor, glif ölçümü
// ve `notdef` sayımı panorama çıktısında da çalışıyor.

import type { AssetStamp } from '@suite/kernel'
import { withPage, type BrowserResult, type Oturum, type Page } from './browser.js'
import { type GorselIslem, islemTanimi, islemZinciri } from './gorsel-islem.js'
import { kacir } from './html.js'
import { OPENTYPE_CSS, vurguyuIsaretle } from './sablon-tipo.js'
import { ikonSec, ikonSvg, type IkonAdi } from './sablon-ikon.js'
import { grenKatmani, zeminCss, zeminKarisimi, type ZeminResetesi } from './zemin.js'
import { getStroke } from 'perfect-freehand'

/** Kesimi aşan sürekli bant — kimliğin taşıyıcısı. */
export type Bant =
  | {
      /**
       * Veriden çizilen eğri. `noktalar` 0–100 arası normalize; x tüm panoramaya,
       * y tuval yüksekliğine göre.
       *
       * ⚠ Nokta sayısı içeriğin kendi çözünürlüğü: 27 yıllık nüfus verisi 27 nokta.
       * Yumuşatmak için nokta EKLENMİYOR — eğri veri noktalarının üstünden geçiyor.
       */
      readonly tip: 'egri'
      readonly noktalar: readonly { readonly x: number; readonly y: number }[]
      /** Kilometre taşları: eğrinin üstünde etiketli noktalar. */
      readonly kilometre: readonly { readonly x: number; readonly etiket: string }[]
    }
  | {
      /** Kemer dizisi — mimari/ritmik konularda eğrinin karşılığı. */
      readonly tip: 'kemer'
      readonly sayi: number
      // ⚠ `madalyon` KALDIRILDI (D-306): numaralı daire bir ROZETti — elle çizilmiş
      // jenerik öge, R-81'in tam hedefi — ve altı şablonun HİÇBİRİ kullanmıyordu.
      // Kemerin kendisi kompozisyon (yay), rozet süstü.
    }
  | {
      /**
       * El çizimi akış okları — bir kartta başlayıp SONRAKİNDE biten yaylar.
       *
       * ⚠ ⚠ **Referansın (`ornek-1`) ikinci süreklilik ögesi.** Kesik özne kesimi
       * aşıyor, oklar da kesimi aşıyor: göz devamı iki ayrı kanaldan kuruyor.
       * ⚠ Oklar KART ARALARINDA duruyor, kartların içinde değil: metnin üstünden geçen
       * bir ok okunabilirliği düşürür (nüfus karoselinde tam bu oldu ve oklar silindi).
       * Burada kalmalarının sebebi, kartların metin bloklarının dar olması.
       */
      readonly tip: 'ok'
      /** Her ok: başlangıç ve bitiş kartı arasında, 0–100 panorama x'i. */
      readonly oklar: readonly {
        readonly x1: number
        readonly y1: number
        readonly x2: number
        readonly y2: number
        readonly bukum: number
      }[]
    }
  | { readonly tip: 'yok' }

/**
 * Panoramaya yerleşen görsel — kesim çizgilerini AŞABİLİR.
 *
 * ⚠ ⚠ **Bu tipin varlık sebebi katalogdaki üç şablon.** Kesik özne (`ornek-1`, `ornek-3`),
 * daire maskeli ürün (`ornek-2`) ve tam kaplama fotoğraf (`ornek-4`) — üçünde de görsel
 * dekor değil, kompozisyonun taşıyıcısı. Konum PANORAMA koordinatında (0–100), slayt
 * koordinatında değil: bir öznenin kolu ancak böyle bir sonraki slayda uzanabilir.
 *
 * ⚠ `src` boşsa YER TUTUCU çiziliyor — görsel sağlayıcısı yokken şablonun kompozisyonu
 * yine de görülebilsin. Sessizce boş bırakmak, eksik bir tasarımı tam sanmaya yol açardı.
 */
export interface PanoramaGorseli {
  readonly src: string
  readonly alt: string
  readonly x: number
  readonly y: number
  readonly genislik: number
  readonly yukseklik: number
  readonly kirpma: 'kesik' | 'daire' | 'tam'
}

/** Bir kartın veri paneli — slayda özgü görsel biçim. */
export type Panel =
  | {
      readonly tip: 'cubuklar'
      readonly baslik: string
      readonly satirlar: readonly {
        readonly etiket: string
        readonly deger: number
        readonly not: string
        readonly tahmin: boolean
      }[]
    }
  | {
      readonly tip: 'sayilar'
      readonly ogeler: readonly {
        readonly deger: string
        readonly birim: string
        readonly alt: string
      }[]
    }
  | {
      readonly tip: 'vafel'
      readonly baslik: string
      readonly toplam: number
      readonly dolu: number
    }
  | {
      readonly tip: 'liste'
      readonly baslik: string
      readonly ogeler: readonly { readonly no: string; readonly ad: string }[]
    }
  | { readonly tip: 'etiketler'; readonly ogeler: readonly string[] }

/**
 * Bir metin alanının ELLE ince ayarı — kaydırma ve punto çarpanı.
 *
 * ⚠ ⚠ **SERBEST KONUM DEĞİL, KAYDIRMA.** Depo sahibi yazıyı da görsel gibi taşımak
 * istedi. Metne mutlak `x/y` vermek kompozisyonu yok ederdi: hat düzen icat etmez
 * (Yasa 13), kartın ızgarası şablonun kimliğidir. Verilen şey o ızgaranın ÜSTÜNDE
 * sınırlı bir pay — ince ayar yapılabilir, düzen bozulamaz.
 *
 * ⚠ Birim PİKSEL, yüzde değil: tuval sabit (N × 1080 × 1350), yani piksel kesin ve
 * editörün sürükleme deltası zaten o uzayda. Yüzde, ögenin KENDİ boyuna göre
 * çözüleceği için küçük ögede küçük, büyükte büyük kayma verirdi.
 */
export interface MetinAyari {
  /** Yatay kaydırma, px. Sınır ±260. */
  readonly dx?: number
  /** Dikey kaydırma, px. */
  readonly dy?: number
  /** Punto çarpanı. Sınır 0,5–2. */
  readonly olcek?: number
  /**
   * Katman — `z-index`. Verilmezse şablonun sırası geçerli (metin 6, görsel 4).
   *
   * ⚠ ⚠ **KATMAN BİR TASARIM KARARI, bir kaza düzeltmesi değil.** Metin görsellerin
   * ÜSTÜNE alındı (D-304) çünkü altta kalınca okunmuyordu; ama referans tasarımlarda
   * bir figürün kolu bazen başlığın ÖNÜNDEN geçer. Sabit bir sıra, o kararı elden
   * alıyordu. Sınır 0–9: dokuzdan büyüğü kartın kendi zeminini aşar ve öge komşu
   * slayta taşar.
   */
  readonly z?: number
}

/** Bir slaydın içeriği. */
export interface Kart {
  /**
   * Alan başına elle ince ayar. Anahtar: `elYazisi` · `ustBaslik` · `baslik` ·
   * `govde` · `panel`. Verilmezse şablonun ızgarası aynen geçerli.
   */
  readonly ayar?: Readonly<Record<string, MetinAyari>>
  /**
   * El yazısı vurgu satırı — başlığın ÜSTÜNDE, kısa.
   *
   * ⚠ Referansta kapak başlığının ilk kelimesi el yazısı, kalanı ağır condensed;
   * kontrastı kuran şey punto değil YÜZ FARKI (D-282 · D-285).
   * ⚠ Kısa tutuluyor: el yazısı satır uzadıkça okunurluğu düşüyor.
   */
  readonly elYazisi?: string
  /** Küçük büyük harf üst başlık — bölüm adı. */
  readonly ustBaslik: string
  /** Başlık; `**vurgu**` işareti aksan rengine dönüşüyor. */
  readonly baslik: string
  readonly govde: string
  readonly panel: Panel | null
  /** Arkadaki dev soluk metin — kesim çizgilerini KASTEN aşıyor. */
  readonly hayalet: string
  /** Alt ray: sol (dönem/bölüm) ve orta (kaynak). */
  readonly rayaSol: string
  readonly rayaOrta: string
  /**
   * Metin bloğunun YATAY yeri — `sol` (varsayılan) ya da `sag`.
   *
   * ⚠ ⚠ **BU, "WEB GİBİ DURUYOR"UN ÖLÇÜLEN SEBEBİYDİ.** Referans (`image copy 2`)
   * kompozisyonu YAN YANA kuruyor: özne kadrajın bir yanını doldururken metin ötekinde
   * yaşıyor. Bizim sistemde her kart `align-items: flex-start` ile SOLA yapışıktı, yani
   * tek kurulabilen düzen ÜST ÜSTE BANTLAMAKtı — metin bandı, ok bandı, özne bandı.
   * Ölçüldü: dört slayttan üçünde alt yarı doluluğu %0,3–%1,2 idi. Bant düzeni bir
   * tasarım tercihi değil, ifade edememenin sonucuydu.
   *
   * ⚠ **`sag` blok SAĞA konumlanır ama metin SOLA hizalı kalır.** Referansta da böyle:
   * sağdaki "use this size for square images" bloğu sağda duruyor, satırları solda
   * başlıyor. `text-align: right` Türkçe gövde metninde tırtıklı bir sol kenar üretir
   * ve okunurluğu düşürür — hizalama ile KONUMLANDIRMA ayrı kararlardır.
   */
  readonly kolon?: 'sol' | 'sag'
  /**
   * Bu kartın kendi zemini — verilmezse belgenin zemini.
   *
   * ⚠ `ornek-2`'nin kimliği tam olarak bu: aynı düzen, her slaytta başka zemin. Kartın
   * kendi zemini olmadan o şablon ifade edilemiyor ve "renk rotasyonu" bir tema değil
   * bir kart özelliği.
   */
  readonly zemin?: string
}

/**
 * İki renk alanı, aralarında panoramayı kat eden eğri sınır.
 *
 * ⚠ ⚠ **REFERANSTA SINIR DİKEY, BURADA YATAY — ve bu bir öncül düzeltmesi.** `ornek-5`te
 * her slaydın kendi dikey eğri sınırı var ve taraf slayttan slayta dönüyor: yani o tasarım
 * SEAMLESS DEĞİL, slayt başına kurulmuş. Dikey sınırı panoramaya taşımak beş ayrı eğri
 * demek olurdu ve kesim çizgisinde yine kırılırdı — "sürekliliği ima etme" hatasının aynısı.
 * Sınır yataya çevrilince eğri gerçekten tek bir yol oluyor ve altı slaydı kat ediyor.
 * Kimlik korunuyor (iki renk alanı + akan eğri), taşıyıcı geometri değişiyor.
 */
export interface AlanSiniri {
  readonly ust: string
  readonly alt: string
  /** Sınır noktaları; x panorama yüzdesi, y tuval yüzdesi. */
  readonly noktalar: readonly { readonly x: number; readonly y: number }[]
}

/**
 * Tipografi reçetesi — şablonun SESİ (FAZ-15.2 · §12.3).
 *
 * ⚠ ⚠ **BU TİP BİR ZİNCİR KOPUKLUĞUNDAN DOĞDU.** `Archivo` depoda DEĞİŞKEN GENİŞLİK
 * ekseniyle duruyor (`fonts.ts`: `font-stretch: 62% 125%`) ve ölçüldü: aynı kelime
 * `wdth 62`'de 580 px, `wdth 125`'te 1001 px — **1,73 kat.** Panorama bu ekseni hiç
 * kullanmıyordu; altı şablonun altısı `font-stretch: 88%` ile çiziliyordu. Yani elimizde
 * duran en güçlü tipografik ayrım aracı kullanılmıyordu. "Ne kurmalı" sorusunun cevabı
 * yeni bir font değil, **açılmamış eksen**.
 *
 * ⚠ ⚠ **PUNTO BURADA PİKSEL DEĞİL, PAY.** Mutlak punto yazılabilseydi bir şablon R-23'ü
 * delerdi: `taşıyabileceğimizin` gibi 19 harfli bir kelime sütuna sığmadan taşardı ve
 * bunu ancak render'a bakınca görürdük. Pay, **ölçülen** tavanın oranı; tavan render
 * anında gerçek kelimeyle, gerçek genişlik ekseniyle hesaplanıyor (`puntoTavani`).
 * Aşmak temsil edilemiyor — garanti yoklukla zorlanıyor.
 */
export interface TipoResetesi {
  /** Başlık puntosunun ÖLÇÜLEN tavana oranı (0–1]. */
  readonly baslikPayi: number
  /** Başlık genişlik ekseni — `Archivo` `wdth`, 62–125. */
  readonly baslikGenislik: number
  /** Başlık ağırlığı 400–900. */
  readonly baslikAgirlik: number
  /** Satır aralığı çarpanı — sıkı 0,98 · havadar 1,3. */
  readonly satirAraligi: number
  /** Harf arası, em. Negatif = sıkı poster; pozitif = seyrek editoryal. */
  readonly harfArasi: number
  /** Üst başlık genişlik ekseni — başlıkla ZIT olması ayrımı keskinleştiriyor. */
  readonly ustGenislik: number
  /** Gövde/başlık punto oranı. Küçük = sert hiyerarşi. */
  readonly govdeOrani: number
  /** Başlık sütununun kart genişliğine oranı (0–1]. */
  readonly baslikSutunu: number
  /**
   * Panel ögelerinin ölçek çarpanı — 1 = eski web ölçüsü.
   *
   * ⚠ ⚠ **VERİ ŞABLONUNDA VERİ KADRAJIN %2'SİYDİ.** Ölçüldü: `veri-hikayesi` kartlarında
   * panel %0,9–4,9, hayalet %22–26. Süs, verinin beş ilâ yirmi beş katı. Panel sabitleri
   * (22px liste, 18px etiket, 300px vafel) WEB ölçüsünden geliyordu; bir gönderi tuvali
   * ekran değil ve ekran ölçüsü orada "bilgisayar işi" gibi duruyor.
   * ⚠ `panorama-denetim` bunu artık `sus-baskin` diye ÖLÇÜYOR: süs içerikten büyükse kusur.
   */
  readonly panelPayi?: number
}

/**
 * ⚠ ⚠ **GENİŞLİK EKSENİ SÜS DEĞİL, PUNTO SATIN ALIYOR — Türkçe'de özellikle.** Ölçüm:
 * `Taşıyabileceğimizin` `wdth 100`'de 800 px'lik sütuna ancak 88 px puntoyla sığıyor;
 * `wdth 62`'de aynı kelime %67 genişlikte, yani tavan **1,49 kat** yükseliyor ve aynı
 * sütuna 131 px puntoyla giriyor. Eklemeli bir dilde poster tipografisinin yolu daraltmak.
 * ⚠ Başlığı HECELEMEK bir seçenek değil: `static.ts` bunu gerekçesiyle reddediyor
 * (bölünmüş başlık kompozisyonu bozar) ve o karar burada sessizce delinmiyor.
 */
export const VARSAYILAN_TIPO: TipoResetesi = {
  baslikPayi: 0.92,
  baslikGenislik: 78,
  baslikAgirlik: 800,
  satirAraligi: 1.02,
  harfArasi: -0.02,
  ustGenislik: 96,
  govdeOrani: 0.3,
  baslikSutunu: 0.86,
}

/**
 * Kartın dikey yerleşimi — **boşluğun nerede duracağı bir tasarım kararıdır.**
 *
 * ⚠ ⚠ **BU TİP BİR RENDER'A BAKMADAN DOĞDU.** Kart sabit olarak "başlık üstte, panel
 * `margin-top:auto` ile altta" çiziliyordu ve aradaki %55 boşluk hiçbir şablonun tercihi
 * değildi — tek düzenin artığıydı. Referanslarda boşluk KASITLI: editoryal olanda üstte
 * toplanıyor, poster olanda alta. Boşluğun yerini seçemeyen bir şablon dili, altı şablonu
 * aynı iskeletin boyaları hâline getirir — kullanıcının "rezalet" dediği tam bu.
 */
export type Yerlesim =
  /** Her şey üste yığılı — panel gövdenin hemen altında. */
  | 'ust'
  /**
   * Başlık üstte, panel DİBE yaslı — arada kasıtlı boşluk.
   *
   * ⚠ ⚠ **`ust`TAN AYRILDI, çünkü tek isim İKİ KARARI birden veriyordu.** "İçerik üstte"
   * ile "panel dibe" bağımsız tercihler; birleşik oldukları sürece `memphis` üstte
   * hizalanmak isteyip panelini de dibe göndermek zorunda kalıyor ve panel, kesimi aşan
   * öznenin arkasına düşüyordu. Bir enum değeri iki şey söylüyorsa, ikisinden birini
   * isteyen şablon ifade edilemez hâle gelir.
   */
  | 'ayrik'
  /** Blok dikey ortada — boşluk üstte ve altta eşit; sakin, editoryal. */
  | 'orta'
  /** Her şey dibe yaslı — boşluk ÜSTTE; poster/afiş dili. */
  | 'alt'
  /** Eşit dağılım — üst başlık, başlık, gövde, panel arası boşluk eşitlenir. */
  | 'yayik'

/**
 * Hayalet rakamın puntosu — UZUNLUĞA göre.
 *
 * ⚠ ⚠ **SABİT 470px, model kelime yazdığında ÜÇ SLAYDI kat ediyordu.** Sözleşme hayaleti
 * "kısa: rakam/sembol" diye tarif ediyor; gerçek koşuda model "Hafıza", "Kopukluk",
 * "Tekrar" yazdı ve dev harfler başlıkla yarıştı. Üç karaktere kadar tam punto (bir
 * rakam DEV kalmalı, kompozisyonun parçası o), sonrası orantılı: uzun bir kelime bir
 * slayda sığıyor. Taban 0,34 — altında hayalet "soluk metin" olmaktan çıkıp süse dönüyor.
 */
/**
 * Elle ayar → satır içi stil. SINIRLI: kayma ±260 px, punto çarpanı 0,5–2.
 *
 * ⚠ ⚠ **SINIR KOZMETİK DEĞİL, SÖZLEŞME.** Sınırsız kayma metni karttan çıkarır ve
 * kesim çizgisini geçirir; o an şablon şablon olmaktan çıkar. Denetim (`kart-disi`,
 * `kesim-uzeri-metin`) taşmayı zaten yakalıyor ama YAKALAMAK ÖNLEMEK DEĞİLDİR —
 * kusur raporlanmış bir karosel yine de yanlış karoseldir.
 *
 * ⚠ Punto CSS değişkeniyle çarpılıyor, satır içi `font-size` yazılmıyor: her alanın
 * kendi formülü var (gövde `max()` taşıyor, panel `--panel-olcek` ile ölçekleniyor).
 * Sabit bir punto yazmak o formülleri ezerdi.
 */
const kis = (v: number, alt: number, ust: number): number => Math.min(ust, Math.max(alt, v))

export const ayarStili = (ayar: MetinAyari | undefined): string => {
  if (ayar === undefined) return ''
  const dx = kis(ayar.dx ?? 0, -260, 260)
  const dy = kis(ayar.dy ?? 0, -260, 260)
  const olcek = kis(ayar.olcek ?? 1, 0.5, 2)
  const parcalar: string[] = []
  if (dx !== 0 || dy !== 0) parcalar.push(`transform:translate(${dx}px,${dy}px)`)
  if (olcek !== 1) parcalar.push(`--ayar-olcek:${olcek}`)
  if (ayar.z !== undefined) parcalar.push(`z-index:${kis(ayar.z, 0, 9)}`)
  return parcalar.length === 0 ? '' : ` style="${parcalar.join(';')}"`
}

export const hayaletPuntosu = (metin: string, olcek: number, slaytGenisligi = 1080): number => {
  const t = metin.trim()
  if (t === '') return 0
  // ⚠ ⚠ **KARAKTER SAYISI YANLIŞ ÖLÇÜYDÜ ve gerçek koşu bunu gösterdi.** Kural "üç
  // karaktere kadar tam punto" diyordu ve `01` için doğruydu; ama model hayalete KELİME
  // yazınca `TEK` de üç karakter oldu ve 729 px'e çıktı — bir slaydın tamamını kaplayıp
  // başlığın üstüne bindi. Bu turda eklenen `sus-baskin` denetimi onu üretimde yakaladı
  // (kart 4: süs %41, içerik %27) ve `kalite` haklı olarak geçirmedi.
  //
  // ⚠ SayılmaSı gereken şey ADET değil GENİŞLİK: rakamlar dar, büyük harfler geniş.
  // Yaklaşık em genişlikleri condensed display yüzü için ölçüldü; kesin metrik gerekmiyor,
  // gereken tek şey rakam ile harfi AYIRMAK.
  const em = [...t].reduce((toplam, ch) => {
    if (/[0-9×+%.,]/.test(ch)) return toplam + 0.58
    if (ch === ' ') return toplam + 0.3
    // ⚠ ⚠ **BÜYÜK HARF SINAMASI CASE DÖNÜŞÜMÜYLE YAPILMAZ (R-21).** İlk sürüm
    // `ch.toLocaleUpperCase('tr')` yazdı ve `turkish-case` kapısı haklı olarak reddetti:
    // case dönüştüren tek yetkili yer `kernel/src/text/case.ts`. Zaten dönüşüme ihtiyaç
    // YOK — sorulan şey "bu harf büyük mü", Unicode özelliği onu doğrudan söylüyor ve
    // Türkçe'nin `i/İ` tuzağına hiç girmiyor.
    return toplam + (/\p{Lu}/u.test(ch) ? 0.72 : 0.6)
  }, 0)
  // Hayalet bir slaydın en çok %86'sını kaplasın: daha genişi kesimi aşıp komşu slaydın
  // metnine giriyor, daha darı arka plan olmaktan çıkıp bir etikete dönüyor.
  const tavan = (slaytGenisligi * 0.86) / Math.max(em, 0.1)
  return Math.min(470 * olcek, tavan)
}

const YERLESIM_CSS: Record<Yerlesim, string> = {
  ust: 'flex-start',
  ayrik: 'flex-start',
  orta: 'center',
  alt: 'flex-end',
  yayik: 'space-between',
}

/**
 * Görünür AI ifşası metni — **tek yerde**.
 *
 * ⚠ Kısa ve iddiasız: "yapay zekâ görseli" bir uyarı değil bir künye. Uzun bir cümle
 * şeritte kırılır, kırıldığında tasarım bozulur ve bozulan bir ifşayı kimse koymak
 * istemez — yani uzunluk, uyumun düşmanıdır.
 *
 * ⚠ Türkçe ve küçük harf: `text-transform` YOK (R-22). "İ" sorununun render
 * tarafındaki kardeşi bu satırda başlardı.
 */
export const AI_IFSA_METNI = 'yapay zekâ görseli'

export interface PanoramaBelgesi {
  readonly slaytGenisligi: number
  readonly yukseklik: number
  readonly kartlar: readonly Kart[]
  readonly bant: Bant
  /** Panoramaya serpilen görseller — kesimleri aşabilirler. */
  readonly gorseller: readonly PanoramaGorseli[]
  /**
   * Görsellere uygulanan işlem zinciri (FAZ-12.2 dağarcığı).
   *
   * ⚠ ⚠ **`matlama` OLMADAN kesik özne YOK.** Model şeffaflık üretmiyor; brief düz siyah
   * zemin istiyor ve alfa o zeminin parlaklığından türetiliyor. Zincirde matlama yoksa
   * ekrana siyah bir DİKDÖRTGEN yapışıyor ve tasarım bozuluyor — yani bu alan bir süs
   * ayarı değil, `kesik` kırpmanın ön şartı.
   */
  readonly gorselIslemleri?: readonly GorselIslem[]
  /**
   * Görünür AI ifşası — **yayının ön şartı, bir süs değil** (§11.3 · Md. 50).
   *
   * ⚠ ⚠ **BU KATMAN HİÇ YOKTU ve 130 varlığın 130'u bu yüzden YAYINLANAMAZ durumdaydı.**
   * `publish.ts` ifşa gerektiren bir varlıkta iki şey arıyor: makine-okunur damga
   * (`stamped`, PNG'ye basılıyor) ve kreatifin üstünde GÖRÜNÜR ifşa
   * (`visibleDisclosure`). İkincisini üreten hiçbir kod yoktu; kapı doğru çalışıyor,
   * üretim eksik davranıyordu — ve panel bunu "130 yayınlanamaz" diye sessizce
   * gösteriyordu.
   *
   * ⚠ **Her slaytta.** Bir karoselin tek slaytı paylaşılabiliyor ve izleyici hangi
   * slaytta model görseli olduğunu bilemez; ifşayı yalnız kapağa koymak, paylaşılan
   * slaytı ifşasız bırakırdı. → D-311
   */
  readonly aiIfsasi?: boolean
  /** Belgenin varsayılan zemini — kart kendi zeminini vermezse bu geçerli. */
  readonly zemin: string
  /**
   * Zemin DOKUSU — degrade, ışık odağı, tarama, vinyet, gren (FAZ-15.3).
   *
   * ⚠ ⚠ **`zemin` ALANI KALIYOR ve iki alan aynı şeyi söylemiyor.** `zemin` semantik
   * bir token: metin ve aksan rengi ondan türüyor (`koyuMu`). `zeminDokusu` görsel
   * katman: nasıl BOYANDIĞI. Dokuyu tek alana sıkıştırsaydık `koyuMu` bir degrade
   * dizesini okumak zorunda kalır ve `linear-gradient(...ink-950...)` içinde `ink`
   * geçtiği için "koyu" derdi — doğru cevabı yanlış sebeple. Ayrı tutmak, renk
   * türetimini dokudan bağımsız bırakıyor.
   */
  readonly zeminDokusu?: ZeminResetesi
  /**
   * Kartların ÜSTÜNDE duran bitiş dokusu — gren + vinyet.
   *
   * ⚠ ⚠ **`zeminDokusu` OPAK KARTIN ALTINDA KALIYOR ve `donen` bu yüzden tek katmanlıydı.**
   * `donen`in kimliği kart renklerinin DÖNMESİ; kartlar opak olmak zorunda ve panorama
   * zemini onların altında görünmüyor. Sonuç: her kart düz bir renk, yani rehber §10
   * ölçüt 5'in tarif ettiği "web arka planı". Ölçüldü ve kabul testi kırmızı verdi.
   *
   * ⚠ Gren FİZİKSEL OLARAK da üstte olmalı: film greni sahnenin değil, filmin özelliği.
   * Altta duran bir gren, üstünü kapatan her opak yüzeyde yok oluyor.
   *
   * ⚠ Varsayılan KAPALI: açık olsaydı beş şablonun görünümü tek satırla değişirdi ve
   * hiçbiri bunu istememişti. Kimin istediği açıkça yazılı olmalı.
   */
  readonly ustDoku?: { readonly gren: number; readonly vinyet: number }
  /**
   * Marka işareti — alt rayın SOLUNDA, `rayaSol` metninden önce.
   *
   * ⚠ ⚠ **SÜRÜMÜ ZEMİN SEÇİYOR, ŞABLON DEĞİL.** Mavi sürüm beyaz kelime taşıyor ve açık
   * zeminde kayboluyor; siyah sürüm koyu zeminde kayboluyor. `koyuMu()` zaten kartın
   * zeminini ölçüyor — ikinci bir karar noktası açmak, o ölçümü yok saymak olurdu.
   * ⚠ Verilmezse imza BASILMIYOR: logosuz üretim mümkün, sahte logo değil.
   */
  readonly logo?: { readonly koyu: string; readonly acik: string }
  /** İki alanlı zemin — verilirse kartlar kendi zeminlerini BOYAMIYOR. */
  readonly alanSiniri?: AlanSiniri
  /**
   * Panoramaya serpilen geometrik lekeler — `memphis` şablonunun KİMLİĞİ.
   *
   * ⚠ ⚠ **Slayt render'ındaki süsleme dağarcığı buraya taşınamadı ve sebebi yapısal:**
   * orada konum "dolgu tarafının ortası"na göre hesaplanıyor ve panoramada dolgu tarafı
   * diye bir şey yok. Burada konum doğrudan PANORAMA yüzdesi — bir leke kesim çizgisinin
   * üstüne oturabiliyor, ki `ornek-3`ün ritmini kuran şey tam olarak bu serpilme.
   */
  readonly lekeler?: readonly {
    /**
     * ⚠ ⚠ **`blob` HACİMLİ: düz dolgu değil, DEGRADE + gölge.** Kullanıcının istediği
     * "3D element" görünümünün büyük kısmı bu: uzatılmış/hacimli organik bir şekil.
     * Hazır bir kütüphane arandı ve REDDEDİLDİ — `blobshape` (MIT) `Math.random`
     * kullanıyor ve R-06 determinizmi yasaklıyor; üç boyutlu varlık kütüphaneleri ise
     * Chromium'da render için ikinci bir motor ister (Yasa 4). Şekil burada ÜRETİLİYOR
     * ve tohumu içerikten geliyor: aynı belge her koşuda aynı blob'u veriyor.
     */
    readonly tip: 'daire' | 'halka' | 'kare' | 'nokta' | 'tarama' | 'blob'
    /**
     * Kartların ÜSTÜNDE mi çizilsin — varsayılan HAYIR.
     *
     * ⚠ ⚠ **OPAK KART, ALTINDAKİ HER ŞEYİ ÖRTÜYOR.** Lekeler z-index 0'da, yani kart
     * zemininin ALTINDA; `memphis` gibi kartı şeffaf olan şablonlarda bu doğru (leke
     * metnin altında kalmalı). Ama `donen`in kimliği kart renklerinin DÖNMESİ, kartlar
     * opak olmak zorunda ve leke hiç görünmüyor. Referansta (`image copy 3`) ürünün
     * ARKASINDA duran beyaz daire tam olarak böyle bir öge: kart renginin üstünde,
     * ürünün altında.
     * ⚠ Metnin ÜSTÜNE çıkmıyor: katman kartlarla görseller ARASINDA.
     */
    readonly ust?: boolean
    readonly x: number
    readonly y: number
    readonly boyut: number
    readonly renk: string
  }[]
  /** Tipografi reçetesi — verilmezse `VARSAYILAN_TIPO`. */
  readonly tipografi?: TipoResetesi
  /** Kartın dikey yerleşimi — verilmezse `'ust'`. */
  readonly yerlesim?: Yerlesim
  /**
   * Dev soluk rakamın yeri ve ölçüsü — **kompozisyonun parçası, süs değil.**
   *
   * ⚠ ⚠ **BU ALAN `akan-alan`IN BOŞ ALT ALANINDAN DOĞDU.** Hayalet sabit `top: 300px` ile
   * çiziliyordu; iki alanlı şablonda bu, rakamı ÜST (amber) alanda tutuyor ve tuvalin alt
   * %40'ı bomboş siyah kalıyordu. Referansta (`ornek-5`) dev rakam tam olarak alt alanda
   * duruyor ve sınırı aşıyor — yani boşluğu dolduran şey o. Sabit konum, bir şablonun
   * kimliğini onun elinden alıyordu.
   * ⚠ Ölçü de parametre: `editoryal` fısıldayan bir şablon, 470 px'lik bir rakam orada
   * bağırmak olurdu.
   */
  readonly hayaletKonumu?: {
    readonly ust: number
    readonly olcek: number
    /**
     * Opaklık yüzdesi. Varsayılan 7.
     *
     * ⚠ ⚠ **TEK BİR DEĞER İKİ FARKLI İŞE YETMİYOR.** Hayalet METNİN ARKASINDAYSA (çoğu
     * şablon) %7 doğru: daha fazlası başlığı okunmaz yapıyor. Ama `akan-alan`da rakam
     * kendi BOŞ alanında duruyor ve orada %7 hiç görünmüyor — referansta o rakam
     * kompozisyonun yarısı. Aynı sabit, bir yerde fazla bir yerde az. Güç de parametre.
     */
    readonly guc?: number
  }
  readonly tokenCss: string
  readonly fontCss?: string
  readonly stamp: AssetStamp
}

// ⚠ ⚠ **VURGU ARTIK ZEMİNİN KENDİSİ DEĞİL (D-296).** `AKSAN` `--role-bg`ti; zemin
// eskitmeli lacivere inince (D-295) vurgu da onunla indi ve mürekkep zemin üstünde
// GRİYE kaçtı — render'a bakınca "iki katına", "sorun", "koyu" okunmuyordu.
// **Zemin büyük alan içindir, vurgu okunmak içindir.**
const AKSAN = 'var(--role-vurgu, var(--role-bg))'
const METIN = 'var(--role-surface)'

/**
 * Bir zeminin KOYU olup olmadığı — metin ve aksan rengi buradan türüyor.
 *
 * ⚠ ⚠ **İlk sürümde metin ve aksan SABİTTİ ve `akan-alan` şablonu okunmaz çıktı:**
 * kart zemini amber olduğunda başlığın aksan kelimesi amber-üstüne-amber düşüyordu,
 * yani vurgulanan kelime GÖRÜNMÜYORDU. Kart kendi zeminini seçebiliyorsa metin rengi
 * o zeminden TÜREMEK zorunda — aksi hâlde şablon kendi kimliğini okunmaz yapıyor.
 * Bu, `sablon.ts`te bir kez öğrenilen dersin panorama yolunda tekrarı.
 */
/**
 * Zemin KOYU mu — token'ın ADINDAN değil, ÇÖZÜLMÜŞ AÇIKLIĞINDAN.
 *
 * ⚠ ⚠ **ÖNCEKİ SÜRÜM ADA BAKIYORDU** (`zemin.includes('ink') || includes('line-edge')`)
 * ve `memphis`e lacivert bir kart zemini (`--ramp-marka-mavi-700`) eklendiğinde sessizce
 * "açık" dedi: koyu mavi üstüne koyu mürekkep metin çizildi ve slayt okunmaz oldu.
 * **Adı ölçmek, şeyi ölçmek değildir** — bu depoda tekrar eden sınıf.
 *
 * ⚠ Açıklık `tokenCss`ten okunuyor: belge zaten onu taşıyor, ikinci bir kaynak yok.
 * Tek düzey `var()` dolaylaması izleniyor (`--role-bg: var(--ramp-...)`); daha derini
 * gerekmedi ve gerekirse burada patlamalı, sessizce yanlış cevap vermemeli.
 * ⚠ Eşik 0,55: oklch açıklığı algısal, yani orta gri gerçekten 0,5 civarında.
 * ⚠ Bulunamazsa ESKİ ada dayalı sezgiye düşülüyor — bilinmeyen bir değerde metni
 * beyaz yapmak, siyah yapmaktan daha sık doğru ama tahmin olduğu YAZILI.
 */
const koyuMu = (zemin: string, tokenCss = ''): boolean => {
  const ad = /var\(\s*(--[\w-]+)/.exec(zemin)?.[1]
  if (ad !== undefined && tokenCss !== '') {
    // ⚠ ⚠ **KASKAT OKUNMALI, DOSYA DEĞİL.** `tokens.css` dört yüzey bloğu taşıyor
    // (`:root`, `console`, `kreatif`, `studio`) ve aynı değişken hepsinde YENİDEN
    // tanımlı. İlk sürüm ilk eşleşmeyi alıyordu: `--role-surface` için KONSOL değerini
    // (oklch 0.21, koyu) okuyup `donen`in kâğıt kartını "koyu" sandı, metni beyaz yaptı
    // ve başlık beyaz zeminde KAYBOLDU. Render `data-surface="kreatif"` ile çiziliyor;
    // ölçüm de o bloğu okumak zorunda. **Doğru dosyayı okumak, doğru yeri okumak değildir.**
    const kreatif = /\[data-surface='kreatif'\]\s*\{([^}]*)\}/.exec(tokenCss)?.[1] ?? ''
    const cozum = (isim: string, derinlik = 0): string | null => {
      if (derinlik > 2) return null
      const kural = new RegExp(`${isim}\\s*:\\s*([^;]+);`)
      const m = kural.exec(kreatif) ?? kural.exec(tokenCss)
      if (m === null) return null
      const deger = (m[1] ?? '').trim()
      const ic = /var\(\s*(--[\w-]+)/.exec(deger)?.[1]
      return ic === undefined ? deger : cozum(ic, derinlik + 1)
    }
    const deger = cozum(ad)
    const l = deger === null ? null : /oklch\(\s*([\d.]+)/.exec(deger)?.[1]
    if (l !== undefined && l !== null) return Number.parseFloat(l) < 0.55
  }
  return zemin.includes('line-edge') || zemin.includes('ink')
}

/**
 * Soluk bir ton — bir CSS değişkeninin `yuzde` kadarı, gerisi şeffaf.
 *
 * ⚠ ⚠ **`rgba(255,255,255,x)` YERİNE BUNUN GELMESİNİN SEBEBİ ÖLÇÜLEBİLİR BİR KUSURDU.**
 * Sabit beyaz koyu zeminde doğru görünüyor, kâğıt zeminde HİÇ görünmüyor. Panel gövdesi,
 * çubuk etiketi, alt ray ve etiket çipi bu yüzden `memphis` ve `editoryal` şablonlarında
 * yok gibiydi. `color-mix` opaklığı zeminin kendi metin renginden türetiyor: koyu zeminde
 * çıktı birebir aynı, açık zeminde ilk kez görünüyor.
 * ⚠ `oklab` karışım uzayı: `srgb`de %50 gri gözle %50 değil, koyulaşıyor.
 */
const sol = (degisken: string, yuzde: number): string =>
  `color-mix(in oklab, var(${degisken}) ${yuzde}%, transparent)`

/**
 * Zemin AKSANIN KENDİSİ mi — vurgu çipinin rengi buna bağlı.
 *
 * ⚠ ⚠ **BU AYRIM BİR RENDER'A BAKMADAN ÇIKMADI.** Açık zeminde vurgu bir ÇİP: amber
 * zemin, mürekkep metin (FAZ-12.6'da bulunmuştu). Ama `akan-alan` ve `donen`in ilk
 * kartında kartın KENDİ zemini zaten amber — yani çip amber-üstüne-amber düşüyor ve
 * **vurgulanan kelime tamamen kayboluyor.** "Açık zemin" tek bir şey değil: kâğıt açık,
 * amber de açık, ama çip ikisinde aynı renk olamaz. Kâğıtta çip amber, amberde çip
 * mürekkep. Kural tek cümle: **çip zeminle aynı renk olamaz.**
 */
const aksanZeminiMi = (zemin: string): boolean =>
  zemin.includes('role-bg') || zemin.includes('amber') || zemin.includes('role-accent')

/** Kartın renk seti — zeminden türetiliyor, seçilmiyor. */
const kartRenkleri = (
  zemin: string,
  tokenCss = ''
): {
  readonly metin: string
  readonly aksan: string
  readonly soluk: string
  readonly cip: string
  readonly cipMetin: string
} =>
  koyuMu(zemin, tokenCss)
    ? {
        metin: METIN,
        aksan: AKSAN,
        soluk: sol('--role-surface', 72),
        // Koyu zeminde çip kullanılmıyor; aksan rengi zaten ayrışıyor. Yine de tanımlı:
        // tanımsız bir değişken CSS'te sessizce miras alınır ve yanlış renk verir.
        cip: AKSAN,
        cipMetin: MUREKKEP_T,
      }
    : // ⚠ Açık zeminde aksan MÜREKKEP: amber üstüne amber görünmez, kâğıt üstüne amber
      // ise 1,9:1 kontrast veriyor (FAZ-12.6'da ölçüldü) — WCAG AA'nın yarısı.
      {
        metin: MUREKKEP_T,
        aksan: MUREKKEP_T,
        soluk: sol('--role-line-edge', 62),
        cip: aksanZeminiMi(zemin) ? MUREKKEP_T : AKSAN,
        cipMetin: aksanZeminiMi(zemin) ? METIN : MUREKKEP_T,
      }

const MUREKKEP_T = 'var(--role-line-edge)'

/** Hayaletin satır yüksekliği — `ust` alanını glif tepesine yaklaştırıyor. Ölçüm bu
 * sabiti PAYLAŞMAK zorunda: CSS'te başka, hesapta başka bir değer olsaydı rakamın hangi
 * alanda olduğu yanlış bulunurdu. */
const HAYALET_SATIRI = 0.76

/**
 * Panelin HTML'i.
 *
 * ⚠ Her panel TEK renkte (aksan): tek seri veride ikinci bir renk ayrım değil gürültü
 * üretir. Ayrım gerektiğinde opaklık ve kesikli kenarla yapılıyor — tahmin edilen değer
 * kesikli çerçeve alıyor, ölçülen değer dolu.
 */
// ⚠ `stil` DIŞARIDAN geliyor: panelin kök ögesi beş ayrı dalda kuruluyor (çubuk,
// sayı, vafel, liste, etiket) ve ayarın hepsine tek noktadan girmesi gerekiyor.
const panelHtml = (p: Panel, stil = ''): string => {
  if (p.tip === 'cubuklar') {
    const enBuyuk = Math.max(...p.satirlar.map((s) => s.deger), 1)
    return (
      `<div class="panel"${stil}><div class="panel-baslik">${kacir(p.baslik)}</div>` +
      p.satirlar
        .map(
          (s) =>
            // ⚠ ⚠ **ÇUBUK BİR YUVANIN İÇİNDE — yoksa yüzde hiçbir şeye oranlanmıyordu.**
            // İlk sürümde `.cubuk` doğrudan flex ögesiydi ve `width: %` esnek kapsayıcıda
            // çözülemiyordu: `flex-shrink` devreye girip çubuğu birkaç piksellik bir kareye
            // indiriyordu. Render'a bakınca görüldü — üç satırın üçü de aynı boyda küçük
            // kare çiziyordu, yani GRAFİK HİÇBİR ŞEY ANLATMIYORDU. Yuva sabit bir raydır;
            // çubuk onun yüzdesidir ve ray boş kalan kısmı da göstererek oranı okutur.
            `<div class="cubuk-satir"><span class="cubuk-etiket">${kacir(s.etiket)}</span>` +
            `<span class="cubuk-yuva"><span class="cubuk${s.tahmin ? ' tahmin' : ''}" ` +
            `style="width:${Math.round((s.deger / enBuyuk) * 100)}%"></span></span>` +
            `<span class="cubuk-not">${kacir(s.not)}</span></div>`
        )
        .join('') +
      `</div>`
    )
  }
  if (p.tip === 'sayilar')
    return (
      `<div class="sayilar"${stil}>` +
      p.ogeler
        .map(
          (o) =>
            `<div class="sayi-kart"><div class="sayi">${kacir(o.deger)}` +
            `<span class="birim">${kacir(o.birim)}</span></div>` +
            `<div class="sayi-alt">${kacir(o.alt)}</div></div>`
        )
        .join('') +
      `</div>`
    )
  if (p.tip === 'vafel') {
    const kareler = Array.from(
      { length: p.toplam },
      (_, i) => `<span class="vafel-kare${i < p.dolu ? ' dolu' : ''}"></span>`
    ).join('')
    return (
      `<div class="panel"${stil}><div class="panel-baslik">${kacir(p.baslik)}</div>` +
      `<div class="vafel">${kareler}</div></div>`
    )
  }
  if (p.tip === 'liste') {
    // ⚠ ⚠ **İKON DAĞARCIĞI YAZILMIŞTI ve panorama onu HİÇ ÇAĞIRMIYORDU.** Yirmi ikon
    // `sablon-ikon.ts`te çizili, testli ve `static.ts` yolunda kullanılıyor; panorama
    // yolunda sıfır çağıran vardı (FAZ-15.1 envanterinde bulundu, D-269'da kayıtlı).
    // Yeni bir yol açıldığında eski yolun bağladığı zincirler otomatik gelmiyor.
    //
    // ⚠ ⚠ **YA HEPSİ YA HİÇBİRİ — ve bu bir tasarım kararı, bir kolaylık değil.** İkon
    // metinden türüyor (`ikonSec` Türkçe köke bakıyor) ve bazı satırlar eşleşmiyor.
    // Eşleşenlere ikon, eşleşmeyenlere boşluk koymak listeyi KIRIK gösterir: göz eksik
    // olanı arar. Bir satır bile eşleşmiyorsa ikon katmanı hiç açılmıyor ve liste
    // numarasıyla kalıyor — ritim bozulmuyor.
    // ⚠ İkon SÜS DEĞİL: satırın kendi metninden türüyor. Türemeseydi silinebilirdi.
    const ikonlar = p.ogeler.map((o) => ikonSec(o.ad))
    const hepsiVar = ikonlar.length > 0 && ikonlar.every((i) => i !== null)
    return (
      `<div class="panel"${stil}><div class="panel-baslik">${kacir(p.baslik)}</div>` +
      p.ogeler
        .map((o, i) => {
          const ikon = hepsiVar
            ? `<span class="liste-ikon">${ikonSvg(ikonlar[i] as IkonAdi, 'var(--kart-aksan)', 21)}</span>`
            : ''
          return (
            `<div class="liste-satir">${ikon}<span class="liste-no">${kacir(o.no)}</span>` +
            `<span class="liste-ad">${kacir(o.ad)}</span></div>`
          )
        })
        .join('') +
      `</div>`
    )
  }
  return (
    `<div class="etiketler"${stil}>` +
    p.ogeler.map((o) => `<span class="etiket">${kacir(o)}</span>`).join('') +
    `</div>`
  )
}

/**
 * Sürekli bandın SVG'si — TÜM panorama genişliğinde tek bir çizim.
 *
 * ⚠ ⚠ **Tek SVG, slayt başına bir tane DEĞİL.** Slayt başına çizilseydi her parçanın
 * kendi koordinat sistemi olurdu ve kesim çizgisinde eğri kırılırdı; tam olarak
 * "sürekliliği ima etme" hatasının kaynağı bu.
 * ⚠ `preserveAspectRatio="none"`: bant yatayda 6× gerilirken dikey oranı korumamalı —
 * gerilen bir eğri hâlâ aynı eğridir, gerilen bir daire elips olur (o yüzden madalyonlar
 * ayrı katmanda, gerilmemiş bir SVG'de).
 */
const bantSvg = (b: Bant, toplamGenislik: number, yukseklik: number): string => {
  if (b.tip === 'yok') return ''
  if (b.tip === 'egri') {
    const d = b.noktalar.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')
    const dolgu = `${d} L 100 100 L 0 100 Z`
    return (
      `<svg class="bant" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">` +
      `<defs><linearGradient id="bant-dolgu" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${AKSAN}" stop-opacity="0.22"/>` +
      `<stop offset="1" stop-color="${AKSAN}" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${dolgu}" fill="url(#bant-dolgu)"/>` +
      `<path d="${d}" fill="none" stroke="${AKSAN}" stroke-width="0.22" ` +
      `vector-effect="non-scaling-stroke"/></svg>` +
      b.kilometre
        .map(
          (k) =>
            `<div class="kilometre" style="left:${(k.x / 100) * toplamGenislik}px">` +
            `<span class="kilometre-nokta"></span>` +
            `<span class="kilometre-etiket">${kacir(k.etiket)}</span></div>`
        )
        .join('')
    )
  }
  if (b.tip === 'ok') {
    // ⚠ ⚠ **JENERİK OK GİTTİ, FIRÇA ŞERİDİ GELDİ — depo sahibinin en sert kuralı.**
    // Önceki hâl sabit kalınlıkta bir `<path>` + üçgen `marker-end`ti: yani bir DİYAGRAM
    // oku. Referansta (`examples/image copy 2.png`) o oklar el çizimi fırça şeritleri —
    // uçlarda incelen, ortada kalınlaşan, kıvrılan. Fark "biraz daha güzel" değil:
    // sabit kalınlıklı bir çizgi göze BİLGİSAYAR İŞİ diye okunuyor ve karoselin
    // tamamını aşağı çekiyor.
    //
    // ⚠ **Kütüphane KULLANILDI, kontur elle yazılmadı.** `perfect-freehand` (MIT, 31 KB,
    // sıfır bağımlılık) basınca göre değişen genişlikte bir kontur poligonu üretiyor —
    // tldraw'ın kalemi bu. Doğru birleşimler, uç kapakları ve incelme eğrisi ~40 satır
    // DEĞİL; R-75'in "kendin yaz" eşiğinin açıkça üstünde.
    //
    // ⚠ **DETERMİNİST (R-06):** `simulatePressure: false` ve basınç her noktaya AÇIKÇA
    // veriliyor. Kütüphanenin rastgelelik kullandığı tek yol simülasyon; o kapalı.
    // Ölçüldü: aynı girdi iki çağrıda birebir aynı 82 noktalı konturu verdi.
    const oklar = b.oklar
      .map((o) => {
        const x1 = (o.x1 / 100) * toplamGenislik
        const x2 = (o.x2 / 100) * toplamGenislik
        const y1 = (o.y1 / 100) * yukseklik
        const y2 = (o.y2 / 100) * yukseklik
        // Yay örnekleniyor: kuadratik Bézier üstünde 28 nokta. Basınç uçlarda düşük,
        // ortada yüksek — fırçanın kâğıda basma eğrisi.
        const N = 28
        const nokta: [number, number, number][] = Array.from({ length: N + 1 }, (_, i) => {
          const t = i / N
          const kx = (x1 + x2) / 2
          const ky = (y1 + y2) / 2 - o.bukum
          const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * kx + t * t * x2
          const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * ky + t * t * y2
          // ⚠ Uçta 0,18 — sıfır değil: sıfır basınç konturu kapatmıyor ve şerit
          // ucunda sivri bir artefakt bırakıyor.
          return [x, y, 0.18 + 0.82 * Math.sin(t * Math.PI)]
        })
        const kontur = getStroke(nokta, {
          size: 34,
          thinning: 0.78,
          smoothing: 0.62,
          streamline: 0.42,
          simulatePressure: false,
          last: true,
        })
        if (kontur.length === 0) return ''
        const d =
          kontur
            .map(
              (p, i) =>
                `${i === 0 ? 'M' : 'L'} ${(p[0] as number).toFixed(1)} ${(p[1] as number).toFixed(1)}`
            )
            .join(' ') + ' Z'
        // ⚠ Ok BAŞI ayrı bir üçgen DEĞİL: şeridin kendisi uçta inceliyor ve yön
        // kıvrımdan okunuyor. Üçgen bir uç, fırça şeridine yapıştırılmış bir diyagram
        // parçası olurdu — kaçtığımız şeyin ta kendisi.
        return `<path d="${d}" fill="${AKSAN}" fill-rule="nonzero"/>`
      })
      .join('')
    return (
      `<svg class="bant-ok" viewBox="0 0 ${toplamGenislik} ${yukseklik}" ` +
      `preserveAspectRatio="none" aria-hidden="true">${oklar}</svg>`
    )
  }
  // Kemer dizisi: yatayda tekrarlayan yay, aralar eşit.
  const adim = toplamGenislik / b.sayi
  const kemerler = Array.from({ length: b.sayi }, (_, i) => {
    const x = i * adim
    return (
      `<path d="M ${x} ${yukseklik} L ${x} ${yukseklik - 52} ` +
      `Q ${x + adim / 2} ${yukseklik - 132} ${x + adim} ${yukseklik - 52} ` +
      `L ${x + adim} ${yukseklik}" fill="none" stroke="${AKSAN}" stroke-width="1.6" opacity="0.5"/>`
    )
  }).join('')
  return (
    `<svg class="bant-kemer" viewBox="0 0 ${toplamGenislik} ${yukseklik}" ` +
    `preserveAspectRatio="none" aria-hidden="true">${kemerler}</svg>`
  )
}

/**
 * Noktalardan yumuşak yol — kuadratik zincir.
 *
 * ⚠ Eğri veri noktalarının TAM ÜSTÜNDEN geçmiyor; komşu orta noktalardan geçiyor ve veri
 * noktaları kontrol noktası oluyor. Bu, uydurma yapmadan yumuşatmanın standart yolu:
 * şekil noktaların tarif ettiği yönü izliyor, aralarına nokta EKLENMİYOR.
 */
const yumusakYol = (n: readonly { readonly x: number; readonly y: number }[]): string => {
  if (n.length < 2) return ''
  const ilk = n[0] as { x: number; y: number }
  let d = `M ${ilk.x} ${ilk.y}`
  for (let i = 1; i < n.length - 1; i += 1) {
    const p = n[i] as { x: number; y: number }
    const s2 = n[i + 1] as { x: number; y: number }
    d += ` Q ${p.x} ${p.y} ${(p.x + s2.x) / 2} ${(p.y + s2.y) / 2}`
  }
  const son = n[n.length - 1] as { x: number; y: number }
  return `${d} T ${son.x} ${son.y}`
}

/** Panoramanın tam HTML'i — tek sayfa, `slaytSayisi × slaytGenisligi` genişlikte. */
export const panoramaHtml = (doc: PanoramaBelgesi): string => {
  const n = doc.kartlar.length
  const G = doc.slaytGenisligi
  const toplam = n * G
  const t = doc.tipografi ?? VARSAYILAN_TIPO
  // ⚠ Kart dışı ögeler (kesim ayracı, kilometre etiketi, madalyon) belgenin ZEMİNİNDEN
  // türüyor; kartın kendi zemininden değil — onlar hiçbir kartın içinde durmuyor.
  const panoRenkleri = kartRenkleri(doc.alanSiniri?.alt ?? doc.zemin, doc.tokenCss)
  // ⚠ İki alanlı zeminde metin ÜST alanın üstünde duruyor (kartlar üste yaslı), o yüzden
  // renkler üst alandan türüyor. Alt alan bandın ve rakamın bölgesi.
  // ⚠ ⚠ **IIFE'DEN DIŞARI ALINDI:** `<section>` etiketini kuran IIFE kapanınca `kartZemini`
  // kapsam dışında kalıyordu ve alt raydaki marka imzası hangi logo sürümünü seçeceğini
  // soramıyordu. Değer aynı, kapsamı geniş — hesap kartın tamamına ait, açılış etiketine değil.
  const kartinZemini = (k: Kart): string =>
    doc.alanSiniri === undefined ? (k.zemin ?? doc.zemin) : doc.alanSiniri.ust
  const kartlar = doc.kartlar
    .map(
      (k, i) =>
        ((): string => {
          const kartZemini = kartinZemini(k)
          const r = kartRenkleri(kartZemini, doc.tokenCss)
          // ⚠ ⚠ **HAYALET RENGİNİ DURDUĞU ALAN BELİRLER, KARTIN METNİ DEĞİL.** İki alanlı
          // şablonda kart amber alanın üstünde (metni mürekkep) ama dev rakam sınırın
          // ALTINDA, mürekkep alanda duruyor. Kart renginden türetilince mürekkep-üstüne-
          // mürekkep düşüyor ve rakam GÖRÜNMÜYOR — hayalet konumu parametre olur olmaz
          // ortaya çıkan ikinci kusur. Kural, `sol()`ünkiyle aynı: renk, ögenin oturduğu
          // yüzeyden türer; başka bir ögenin yüzeyinden değil.
          // ⚠ ⚠ **KARŞILAŞTIRMA ORTA NOKTAYLA, TEPEYLE DEĞİL — ilk sürüm tepeyi kullandı
          // ve rakam GÖRÜNMEDİ.** `akan-alan`da hayalet %48'den başlıyor, sınır ortalama
          // %61'de: tepe sınırın ÜSTÜNDE kalıyor ve renk amber alandan (mürekkep)
          // türüyordu — 578 px'lik gövdesinin neredeyse tamamı mürekkep alanda olmasına
          // rağmen. Mürekkep üstüne mürekkep, yani hiçbir şey. Ögenin hangi yüzeye ait
          // olduğunu tepesi değil KÜTLESİ söyler.
          // ⚠ Aynı formül iki yerde: burada kutunun yüksekliği, CSS'te punto. Ayrışırlarsa
          // hayaletin durduğu alan yanlış hesaplanır ve rengi yanlış alandan türer.
          const hayaletPunto = hayaletPuntosu(k.hayalet, doc.hayaletKonumu?.olcek ?? 1)
          const hayaletYuksekligi = hayaletPunto * HAYALET_SATIRI
          const hayaletOrtasi =
            (doc.hayaletKonumu?.ust ?? 22) + (hayaletYuksekligi / 2 / doc.yukseklik) * 100
          const hayaletZemini =
            doc.alanSiniri === undefined
              ? kartZemini
              : hayaletOrtasi >=
                  doc.alanSiniri.noktalar.reduce((a, n) => a + n.y, 0) /
                    Math.max(1, doc.alanSiniri.noktalar.length)
                ? doc.alanSiniri.alt
                : doc.alanSiniri.ust
          const hr = kartRenkleri(hayaletZemini, doc.tokenCss)
          return (
            `<section class="kart${koyuMu(kartZemini, doc.tokenCss) ? '' : ' acik'}` +
            `${k.kolon === 'sag' ? ' sag' : ''}" ` +
            `style="left:${i * G}px;width:${G}px;` +
            // ⚠ Lekeler ya da alan sınırı varsa kart ŞEFFAF: opak bir kart arkasındaki
            // desen katmanını tamamen örtüyordu ve `memphis`in kimliği görünmüyordu.
            `background:${
              k.zemin !== undefined ||
              (doc.alanSiniri === undefined &&
                (doc.lekeler ?? []).length === 0 &&
                doc.zeminDokusu === undefined)
                ? kartZemini
                : 'transparent'
            };` +
            // ⚠ Kartın zemini CSS DEĞİŞKENİ olarak da yazılıyor: dip vinyeti onu
            // referans alıyor ve sabit bir renge bağlanmıyor (açık zeminli şablonda
            // siyah bir vinyet tasarımı bozardı).
            `--kart-zemin:${kartZemini};` +
            `--kart-metin:${r.metin};` +
            `--kart-aksan:${r.aksan};--kart-soluk:${r.soluk};` +
            `--kart-cip:${r.cip};--kart-cip-metin:${r.cipMetin};` +
            `--hayalet-renk:${hr.metin}">`
          )
        })() +
        `<div class="hayalet" aria-hidden="true" ` +
        `style="--hayalet-punto:${Math.round(hayaletPuntosu(k.hayalet, doc.hayaletKonumu?.olcek ?? 1))}">` +
        `${kacir(k.hayalet)}</div>` +
        // ⚠ El yazısı satırı üst başlığın ÜSTÜNDE: göz önce onu, sonra bölüm etiketini,
        // sonra başlığı okuyor — referanstaki sıra.
        (k.elYazisi === undefined || k.elYazisi.trim() === ''
          ? ''
          : `<div class="el-yazisi"${ayarStili(k.ayar?.['elYazisi'])}>${kacir(k.elYazisi)}</div>`) +
        // ⚠ Üst başlık BOŞSA hiç çizilmiyor: editörde öge SİLİNEBİLMELİ ve silmenin
        // karşılığı boş bir etiket değil, ögenin yokluğudur. Boş bir `.ust-baslik`
        // 14 px alt boşluk ve 2 px'lik bir çizgi bırakıyordu — silinmiş görünmüyordu.
        (k.ustBaslik.trim() === ''
          ? ''
          : `<div class="ust-baslik"${ayarStili(k.ayar?.['ustBaslik'])}>${kacir(k.ustBaslik)}</div>`) +
        `<h2 class="baslik"${ayarStili(k.ayar?.['baslik'])}>` +
        `${vurguyuIsaretle(kacir(k.baslik))}</h2>` +
        (k.govde === ''
          ? ''
          : `<p class="govde"${ayarStili(k.ayar?.['govde'])}>` +
            `${vurguyuIsaretle(kacir(k.govde))}</p>`) +
        (k.panel === null ? '' : panelHtml(k.panel, ayarStili(k.ayar?.['panel']))) +
        `<div class="ray">` +
        (doc.logo === undefined
          ? ''
          : `<img class="ray-logo" src="${kacir(
              koyuMu(kartinZemini(k), doc.tokenCss) ? doc.logo.koyu : doc.logo.acik
            )}" alt="Upcytech">`) +
        // ⚠ Sınıflar AÇIK: küçülme hakkı yalnız ORTA metne ait. `nth-child` ile
        // hedeflemek, logo varken/yokken farklı öğeyi kırpardı.
        `<span class="ray-sol">${kacir(k.rayaSol)}</span>` +
        `<span class="ray-orta">${kacir(k.rayaOrta)}</span>` +
        (doc.aiIfsasi === true ? `<span class="ray-ifsa">${kacir(AI_IFSA_METNI)}</span>` : '') +
        `<span class="ray-sayac">${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span></div>` +
        `</section>`
    )
    .join('')

  // ⚠ ⚠ **GÖRSELLER KARTLARIN ÜSTÜNDE, AYRI BİR KATMANDA.** Kartın içine konsaydı
  // `overflow` ve `left` kart koordinatına bağlanır, öznenin kolu bir sonraki slayda
  // UZANAMAZDI — kesintisizliğin taşıyıcısı tam olarak o uzanma.
  // ⚠ `src` boşsa yer tutucu: görsel sağlayıcısı yokken kompozisyon yine görülebilir
  // olmalı, yoksa eksik bir tasarım tam sanılır.
  const gorseller = doc.gorseller
    .map((g) => {
      // ⚠ ⚠ **KATMAN GÖRSELDE DE AYARLANABİLİR.** Metin görsellerin üstüne alındı
      // (D-304) çünkü altta kalınca okunmuyordu; ama referans tasarımlarda bir figürün
      // kolu bazen başlığın ÖNÜNDEN geçer. Sabit bir sıra o kararı elden alıyordu.
      // Varsayılan yine 4 (CSS'te); `z` verilmişse o kazanıyor.
      const kat = (g as { readonly z?: number }).z
      const stil =
        `left:${(g.x / 100) * toplam}px;top:${g.y}%;` +
        `width:${(g.genislik / 100) * toplam}px;height:${g.yukseklik}%` +
        (kat === undefined ? '' : `;z-index:${Math.min(9, Math.max(0, kat))}`)
      if (g.src === '')
        return (
          `<div class="gorsel-yer ${g.kirpma}" style="${stil}" aria-hidden="true">` +
          `<span>${kacir(g.alt)}</span></div>`
        )
      const zincir = islemZinciri(doc.gorselIslemleri ?? [])
      return (
        `<img class="gorsel ${g.kirpma}" style="${stil}${zincir === '' ? '' : `;filter:${zincir}`}" ` +
        `src="${kacir(g.src)}" alt="${kacir(g.alt)}">`
      )
    })
    .join('')

  // Bitiş dokusu: kartların ÜSTÜNDE, tıklamayı ve metni ETKİLEMEDEN.
  const ustDoku = doc.ustDoku === undefined ? '' : `<div class="ust-doku" aria-hidden="true"></div>`

  // Geometrik lekeler: tek SVG, panorama koordinatında. Kartların ALTINDA (z-index 0)
  // duruyorlar — metnin üstüne çıkan bir leke okunabilirliği düşürür.
  // ⚠ ⚠ **HACİM İÇİN GEREKEN ŞEY DEGRADE + GÖLGE, ÜÇÜNCÜ BİR BOYUT DEĞİL.** Bu
  // karosellerde "3D element" denen şeyin görsel imzası: yumuşak bir degrade, tek yönlü
  // bir ışık ve zemine düşen bir gölge. Üçü de SVG'de var; bir 3B motor (three.js +
  // GLB) ikinci bir render motoru demek olurdu (Yasa 4) ve tek bir öge için orantısız.
  const blobDegradeleri =
    doc.lekeler === undefined
      ? ''
      : doc.lekeler
          .map((l, i) =>
            l.tip !== 'blob'
              ? ''
              : `<radialGradient id="blob-${i}" cx="34%" cy="28%" r="78%">` +
                `<stop offset="0" stop-color="${l.renk}" stop-opacity="1"/>` +
                `<stop offset="1" stop-color="${l.renk}" stop-opacity="0.55"/>` +
                `</radialGradient>`
          )
          .join('')

  // ⚠ Lekeler İKİ katmana ayrılıyor: `ust` olanlar kartların üstünde, ötekiler altında.
  // Tek bir SVG'de z-index ile ayrılamazlar; kartlar araya giren DOM düğümleri.
  // ⚠ ⚠ **HER ŞEKLE `leke` SINIFI — denetim onu ARIYORDU ama kimse YAZMIYORDU.**
  // `panorama-denetim.ts` kesintisizlik ölçümünde `.hayalet, .gorsel, .gorsel-yer, .leke`
  // seçicisini kullanıyor; `.leke` hiçbir zaman eşleşmedi, yani ölçümün o kolu ölüydü.
  // `donen`in kesimi aşan daireleri sayılmayınca kusur haklı görünen bir yanlış verdi.
  const lekeSvg = (secilen: NonNullable<typeof doc.lekeler>, sinif: string): string =>
    secilen.length === 0
      ? ''
      : `<svg class="${sinif}" viewBox="0 0 ${toplam} ${doc.yukseklik}" aria-hidden="true">` +
        `<defs>${blobDegradeleri}` +
        // ⚠ Gölge tek tanım, her blob onu paylaşıyor: filtre başına bir SVG filtresi
        // kurmak aynı görüntüyü N kez tarif etmek olurdu.
        `<filter id="blob-golge" x="-30%" y="-30%" width="170%" height="170%">` +
        `<feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.28"/>` +
        `</filter></defs>` +
        secilen
          .map((l) => {
            const cx = (l.x / 100) * toplam
            const cy = (l.y / 100) * doc.yukseklik
            const r = l.boyut / 2
            if (l.tip === 'daire')
              return `<circle class="leke" cx="${cx}" cy="${cy}" r="${r}" fill="${l.renk}"/>`
            if (l.tip === 'halka')
              return `<circle class="leke" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${l.renk}" stroke-width="7"/>`
            if (l.tip === 'kare')
              return `<rect class="leke" x="${cx - r}" y="${cy - r}" width="${l.boyut}" height="${l.boyut}" fill="${l.renk}" transform="rotate(12 ${cx} ${cy})"/>`
            if (l.tip === 'blob') {
              // ⚠ ⚠ **TOHUM KONUMDAN, RASTGELELİKTEN DEĞİL (R-06).** Yarıçaplar `l.x`
              // ve `l.y`den türeyen deterministik bir diziyle salınıyor: aynı belge her
              // koşuda AYNI blob'u veriyor ve golden test kurulabiliyor. `Math.random`
              // burada bir satırla girebilirdi ve replay'i sessizce bozardı.
              const n = 7
              const tohum = Math.round(l.x * 37 + l.y * 11 + l.boyut)
              const nokta = Array.from({ length: n }, (_, k) => {
                const aci = (k / n) * Math.PI * 2 - Math.PI / 2
                // Salınım ±%18: daha azı daireye benziyor, daha fazlası yıldıza.
                const sapma = 1 + 0.18 * Math.sin(tohum * 0.37 + k * 2.399)
                return [cx + Math.cos(aci) * r * sapma, cy + Math.sin(aci) * r * sapma] as const
              })
              // Kuadratik zincir: eğri komşu orta noktalardan geçiyor, köşe kalmıyor.
              const orta = (a: readonly number[], b: readonly number[]): string =>
                `${((a[0] as number) + (b[0] as number)) / 2} ${((a[1] as number) + (b[1] as number)) / 2}`
              let d = `M ${orta(nokta[n - 1] as readonly number[], nokta[0] as readonly number[])}`
              for (let k = 0; k < n; k += 1) {
                const p = nokta[k] as readonly number[]
                const q = nokta[(k + 1) % n] as readonly number[]
                d += ` Q ${p[0]} ${p[1]} ${orta(p, q)}`
              }
              return `<path d="${d} Z" fill="url(#blob-${doc.lekeler?.indexOf(l) ?? 0})" filter="url(#blob-golge)"/>`
            }
            if (l.tip === 'nokta') {
              const n = 5
              const adim = l.boyut / (n - 1)
              return Array.from({ length: n * n }, (_, i) => {
                const px = cx - r + (i % n) * adim
                const py = cy - r + Math.floor(i / n) * adim
                return `<circle cx="${px}" cy="${py}" r="4.5" fill="${l.renk}"/>`
              }).join('')
            }
            const cizgi = 7
            return Array.from({ length: Math.floor(l.boyut / cizgi) }, (_, i) => {
              const o = i * cizgi
              return `<line x1="${cx - r + o}" y1="${cy + r}" x2="${cx - r + o + r}" y2="${cy - r}" stroke="${l.renk}" stroke-width="3"/>`
            }).join('')
          })
          .join('') +
        `</svg>`

  // ⚠ `ust` olanlar kartların ÜSTÜNDE, ötekiler ALTINDA çiziliyor: tek SVG'de z-index
  // ile ayrılamazlar, çünkü kartlar araya giren DOM düğümleri.
  const lekeKatmani = lekeSvg(
    (doc.lekeler ?? []).filter((l) => l.ust !== true),
    'lekeler'
  )
  const ustLekeKatmani = lekeSvg(
    (doc.lekeler ?? []).filter((l) => l.ust === true),
    'lekeler ust'
  )

  // İki alanlı zemin: tek SVG, tüm panorama. Kartlar bunun üstünde şeffaf duruyor.
  const alanKatmani =
    doc.alanSiniri === undefined
      ? ''
      : ((): string => {
          const a = doc.alanSiniri
          // ⚠ ⚠ **DÜZ PARÇALAR ZİKZAK ÜRETTİ.** `L` ile birleştirilen noktalar keskin
          // köşeler veriyordu ve "akan eğri" kimliği kayboluyordu — referansın sınırı
          // YUMUŞAK. Kuadratik zincir: kontrol noktası veri noktası, eğri komşu orta
          // noktalardan geçiyor. Veri noktaları KORUNUYOR, aralar yumuşuyor.
          const d = yumusakYol(a.noktalar)
          return (
            `<svg class="alan-siniri" viewBox="0 0 100 100" preserveAspectRatio="none" ` +
            `aria-hidden="true"><rect x="0" y="0" width="100" height="100" fill="${a.ust}"/>` +
            `<path d="${d} L 100 100 L 0 100 Z" fill="${a.alt}"/></svg>`
          )
        })()

  return [
    // ⚠ ⚠ **YÜZEY BEYAN EDİLMEK ZORUNDA.** `kreatif` rolleri `[data-surface='kreatif']`
    // altında tanımlı; beyan edilmezse tarayıcı KONSOL yüzeyine düşüyor ve koyu zeminli
    // bir şablon BEYAZ çıkıyor. İlk render'da tam bu oldu — `static.ts` bunu zaten
    // yapıyordu, panorama yolu onu tekrarlamadı.
    '<!doctype html><html lang="tr" data-surface="kreatif"><meta charset="utf-8">',
    `<meta name="generator" content="${kacir(doc.stamp.brandId)}/${kacir(doc.stamp.eraId)}">`,
    '<style>',
    doc.tokenCss,
    doc.fontCss ?? '',
    `  * { margin: 0; padding: 0; box-sizing: border-box }`,
    `  body { width: ${toplam}px; height: ${doc.yukseklik}px; overflow: hidden;`,
    `         background: ${doc.zemin}; color: ${METIN};`,
    `         font-family: "Marka Metin", system-ui, sans-serif; }`,
    // ⚠ Sahne kaydırılıyor, gövde değil: `translateX` bileşik katmanda çalışıyor ve
    // ekran görüntüsü her karede tutarlı çıkıyor.
    // ⚠ ⚠ **`--pano-metin` KART DIŞI ÖGELERİN RENK KÖKÜ.** Kilometre etiketi, madalyon adı
    // ve kesim ayracı kartların DIŞINDA duruyor; `--kart-metin`i miras alamıyorlar. İlk
    // sürümde bunlar `rgba(255,255,255,…)` yazıyordu ve `memphis`/`editoryal` gibi KÂĞIT
    // zeminli şablonlarda beyaz-üstüne-beyaz düşüyordu — yani görünmüyorlardı. Bir öge
    // görünmezse eksikliği fark edilmez ve tasarım tam sanılır.
    // ⚠ ⚠ **DOKU `body`DE DEĞİL `#sahne`DE — yoksa zemin KAYMAZDI.** Dilimleme sahneyi
    // `translateX` ile kaydırıyor; `body` yerinde duruyor. Doku gövdeye yazılsaydı altı
    // slaydın altısı degradenin AYNI parçasını gösterir, panoramayı kat eden bir ışık
    // odağı diye bir şey olmazdı — yani kesintisizliğin zemin ayağı sessizce çökerdi.
    // Doku kayan katmana ait: panorama koordinatında tek bir yüzey.
    `  #sahne { position: relative; width: ${toplam}px; height: ${doc.yukseklik}px;`,
    `           transform: translateX(0px);`,
    ...(doc.zeminDokusu === undefined
      ? []
      : [
          `           background: ${zeminCss(doc.zeminDokusu)};`,
          `           background-blend-mode: ${zeminKarisimi(doc.zeminDokusu)};`,
        ]),
    `           --pano-metin: ${panoRenkleri.metin}; --pano-aksan: ${panoRenkleri.aksan}; }`,
    // ── tipografi reçetesi: değişkenler ÖNCE, kullanımlar sonra ───────────────
    `  #sahne { --baslik-wdth: ${t.baslikGenislik}; --baslik-wght: ${t.baslikAgirlik};`,
    `           --baslik-lh: ${t.satirAraligi}; --baslik-ls: ${t.harfArasi}em;`,
    `           --ust-wdth: ${t.ustGenislik}; --govde-orani: ${t.govdeOrani};`,
    // ⚠ Başlangıç değeri; gerçek punto render sonrası ÖLÇÜLEREK yazılıyor (`puntoTavani`).
    `           --baslik-punto: ${Math.round(96 * t.baslikPayi)}px;`,
    `           --panel-kok: ${t.panelPayi ?? 1};`,
    // ⚠ ⚠ **`--panel-olcek` KÖKTEN TÜREYEN bir çarpım oldu.** Eskiden doğrudan
    // şablonun payıydı; elle ayar onu EZECEKti ve şablonun kendi payı kaybolurdu.
    // Şimdi taban `--panel-kok`ta duruyor, elle ayar `--ayar-olcek` ile ÇARPIYOR.
    `           --panel-olcek: var(--panel-kok); }`,
    // ⚠ Kart bir FLEX SÜTUNU: panel `margin-top:auto` ile aşağı itiliyor ve kartın alt
    // yarısı boş kalmıyor. İlk render'da her şey üste yığılmış, alt %60 bomboştu.
    `  .kart { position: absolute; top: 0; height: ${doc.yukseklik}px; padding: 68px 64px 190px;`,
    `          color: var(--kart-metin);`,
    `          display: flex; flex-direction: column; align-items: flex-start;`,
    `          justify-content: ${YERLESIM_CSS[doc.yerlesim ?? 'ust']} }`,
    // ⚠ Yalnız KONUM değişiyor: `align-items` bloğu sağa iter, `text-align` dokunulmadan
    // sola kalır. Kartın alt rayı bundan etkilenmemeli — o mutlak konumlu.
    // ⚠ ⚠ **INSET IŞIK (T8).** Kartın üst kenarında 1 px ışık, altında ince bir koyu
    // ayrım. Photoshop'ta elle konan bu iki çizgi, düz bir alanı YÜZEYE çeviriyor: göz
    // kenarda bir ışık görünce yüzeyin bir kalınlığı olduğunu varsayıyor. Renkler karttan
    // TÜRÜYOR (`--kart-metin`), sabit beyaz değil — kâğıt zeminde beyaz ışık görünmez.
    `  .kart { box-shadow: inset 0 1px 0 ${sol('--kart-metin', 9)},`,
    `          inset 0 -1px 0 ${sol('--kart-metin', 5)} }`,
    `  .kart.sag { align-items: flex-end }`,
    `  .kart.sag > * { text-align: left }`,
    // ⚠ `margin-top: auto` YALNIZ `ust` yerleşiminde: diğer üçünde panel'i dibe iten bu
    // kural `justify-content`i ezip yerleşimi anlamsız kılıyordu (yazıldı, bakıldı, görüldü).
    ...(doc.yerlesim === undefined || doc.yerlesim === 'ayrik'
      ? [`  .panel, .sayilar, .etiketler { margin-top: auto }`]
      : [`  .panel, .sayilar, .etiketler { margin-top: 132px }`]),
    // ── kesim çizgisi: hiçbir ögeyi kırpmıyor, yalnız ince bir ayraç ─────────
    // ⚠ ⚠ **SINIF ADI `kesim`, `kesik` DEĞİL — ve bu bir ÇAKIŞMA DÜZELTMESİ.** Kesim
    // ayracı `.kesik` sınıfını kullanıyordu; kırpma biçimi de `kirpma: 'kesik'` üzerinden
    // görsele `class="gorsel kesik"` yazıyor. İkisi AYNI seçiciye düşüyordu ve ayracın
    // `background`'ı (%6 beyaz) görselin TÜM KUTUSUNA uygulanıyordu: çıktıda kesik
    // öznenin arkasında dev bir açık dikdörtgen duruyordu.
    // ⚠ Teşhis üç yanlış hipotez sonrası geldi: önce `temas-golgesi` sanıldı (izole test
    // temiz çıktı), sonra zemin ışık havuzu (görselsiz render temiz çıktı), sonra
    // tarayıcıya `getComputedStyle` soruldu ve `backgroundColor: oklab(0.97 … / 0.06)`
    // göründü. **Ölçüm üç kez hipotezi çürüttü; dördüncüde DOM cevabı verdi.**
    ...(doc.ustDoku === undefined
      ? []
      : [
          `  .ust-doku { position: absolute; inset: 0; pointer-events: none; z-index: 3;`,
          `              background: ${grenKatmani(doc.ustDoku.gren)},`,
          // Vinyet: kenarları toplayan tek radyal. Merkez ŞEFFAF — ortadaki içeriği
          // karartmayan bir vinyet, kadrajı daraltır ama okunurluğu düşürmez.
          `                radial-gradient(120% 80% at 50% 45%, transparent 52%,` +
            ` rgba(0,0,0,${(doc.ustDoku.vinyet / 100).toFixed(2)}) 100%) }`,
        ]),
    // ⚠ ⚠ **KAYNAK PNG'LER 500x500'DÜ ve işaret onun yalnız %2,4'ünü kaplıyordu.** Rayda
    // 26px yüksekliğe sığdırılınca işaret ~4px kalıyor ve okunmuyordu — render'a bakınca
    // görüldü. Dosyalar ALFA KUTUSUNDAN kırpıldı (338x78, oran 4,33); kaynaklar
    // `*-kaynak.png` olarak duruyor. ⚠ İki sürüm ORTAK kutuyla kırpıldı: ayrı kutular
    // farklı oranlar verir ve zemin değişince logo bir slayttan ötekine ZIPLAR.
    `  .ray-logo { height: 24px; width: 104px; object-fit: contain; object-position: left;`,
    `              flex: none; opacity: 0.92 }`,
    // ⚠ ⚠ **KESİM AYRACI KALDIRILDI — ÜRETİM DİLİMLERİNE SIZIYORDU (D-300).** Ayraç
    // panoramayı bütün hâlde incelerken kesim yerini göstersin diye vardı. Ama dilimleme
    // `translateX(-i × G)` ile yapılıyor ve `left: i × G` konumundaki 1 px'lik çizgi
    // TAM OLARAK (i+1). slaydın SIFIRINCI sütununa düşüyor. Ölçüldü: `derived/blobs`
    // altındaki gerçek bir üretim slaydında sütun 0, sütun 2'den **+11,3** daha parlak —
    // her slaydın sol kenarında hayalet bir hairline yayınlanmış.
    // **Görüntüleme yardımcısı çıktıya sızarsa yardımcı değil, kusurdur.**
    // ⚠ Üst başlık başlıkla ZIT eksende: başlık genişse üst başlık dar, tersi de doğru.
    // Aynı genişlikte iki tipografik ses, bir hiyerarşi değil bir yankı üretiyor.
    // ⚠ ⚠ **PUNTO BAŞLIĞA GÖRE, SABİT DEĞİL.** El yazısı başlıktan çok küçük kalırsa
    // "dipnot" gibi okunuyor; büyük kalırsa başlığı ezip iki ana ses üretiyor. Referansta
    // oran ~0,52. Hafif SOLA taşıyor: ilk harfin süslemesi metin kolonunun dışına çıkınca
    // blok "yazılmış" gibi duruyor, "yerleştirilmiş" gibi değil.
    `  .el-yazisi { font-family: "Marka El Yazisi", cursive; font-weight: 600;`,
    `               font-size: calc(var(--baslik-punto) * 0.52 * var(--ayar-olcek, 1));`,
    `               line-height: 0.92;`,
    `               color: var(--kart-aksan); margin: 0 0 6px -0.06em }`,
    `  .ust-baslik { font-size: calc(24px * var(--ayar-olcek, 1));`,
    `                letter-spacing: 0.2em; text-transform: none;`,
    `                font-stretch: calc(var(--ust-wdth) * 1%);`,
    `                font-feature-settings: ${OPENTYPE_CSS};`,
    // ⚠ ⚠ **BOŞLUK RİTMİ 1:3 — eşit boşluk, boşluk YOKLUĞUDUR (tasarım rehberi §2).**
    // Önceki değerler 26 / 24 / 34 px idi: üçü de birbirine denk ve göz hiçbir grup
    // göremiyordu. Bu, çıktının "web sayfası gibi" durmasının en büyük tek sebebiydi —
    // renk eklemek çözmüyor çünkü sorun renkte değil ritimde. Üst başlık başlığa YAPIŞIK
    // (14 px, aynı grup), başlık gövdeden AYRIK (44 px), panel çok daha uzak (§2).
    `                color: var(--kart-aksan); font-weight: 700; margin-bottom: 14px;`,
    `                display: flex; align-items: center; gap: 14px }`,
    `  .ust-baslik::before { content: ""; width: 30px; height: 2px; background: var(--kart-aksan) }`,
    // ⚠ Başlık SIKIŞIK ve İRİ; `line-height` 1,04 — 0,90'da Türkçe `Ş` kuyruğu alt satıra
    // giriyor ve "HEB" gibi okunuyor. Aksan kırpılması bu ailenin bilinen tuzağı.
    // ⚠ Punto artık sabit 82 px DEĞİL: reçetenin payı × render anında ölçülen tavan.
    `  .baslik { font-family: "Marka Display", "Marka Metin", sans-serif;`,
    `            font-size: calc(var(--baslik-punto) * var(--ayar-olcek, 1));`,
    `            line-height: var(--baslik-lh);`,
    `            font-weight: var(--baslik-wght);`,
    `            font-stretch: calc(var(--baslik-wdth) * 1%);`,
    `            font-feature-settings: ${OPENTYPE_CSS};`,
    `            letter-spacing: var(--baslik-ls);`,
    // ⚠ ⚠ **DARALTMANIN BEDELİ: BOŞLUK DA DARALIYOR.** `wdth` ekseni glifleri yatayda
    // sıkıştırırken BOŞLUK glifini de sıkıştırıyor. `wdth 66`'da `sahne` şablonunun
    // başlıkları `Sonraelle tutulurbir ölçü` gibi okundu — kelimeler birbirine yapıştı ve
    // bu ancak render'a bakınca görüldü. Telafi genişlikle TERS orantılı: dar yüzde çok,
    // geniş yüzde hiç. Sabit bir `word-spacing` yazmak `editoryal`in geniş yüzünde
    // kelimeleri dağıtırdı — telafi de bir parametre, bir sabit değil.
    `            word-spacing: calc((100 - var(--baslik-wdth)) * 0.0030em);`,
    `            max-width: ${Math.round(G * t.baslikSutunu) - 128}px }`,
    `  .baslik strong { color: var(--kart-aksan); font-weight: inherit }`,
    // ⚠ ⚠ **AÇIK ZEMİNDE VURGU BİR ÇİP, RENK DEĞİL.** Aksanı mürekkebe çevirmek kontrastı
    // kurtardı ama vurguyu ÖLDÜRDÜ: başlıklar düzleşti, vurgulanan kelime gövdeden
    // ayrışmaz oldu. Amber üstüne amber görünmüyordu, kâğıt üstüne amber 1,9:1 veriyordu
    // (ölçüldü) — üçüncü yol: amber ZEMİN, mürekkep metin. Hem kontrast hem vurgu.
    // Aynı çözüm slayt render'ında da bulunmuştu; iki yol aynı dersi ayrı ayrı öğrendi.
    `  .kart.acik .baslik strong { background: var(--kart-cip); color: var(--kart-cip-metin);`,
    `                              padding: 0.02em 0.14em; box-decoration-break: clone;`,
    `                              -webkit-box-decoration-break: clone }`,
    // ⚠ Taban 34 px: ölçüldü, gövde 23–27 px'e düşüyordu ve 1080 px telefonda ~390 pt'ye
    // indiği için 25 px ≈ 9 pt oluyordu. Oran şablonun sesi, taban okunabilirlik şartı.
    `  .govde { margin-top: 44px;`,
    `           font-size: calc(max(34px, calc(var(--baslik-punto) * var(--govde-orani)))`,
    `                       * var(--ayar-olcek, 1));`,
    // ⚠ ⚠ **GENİŞLİK KOLONDAN BAĞIMSIZDI ve gövde büyüyünce TAŞTI.** `34ch` sabitti;
    // 34 px puntoda ~580 px eder, `editoryal`in metin kolonu ise 0,46 × 1080 − 128 = 369 px.
    // Gövde kolonu 200 px aşıp fotoğrafın altına giriyordu — punto tabanı (34 px) bunu
    // görünür yaptı, sebep olmadı; hata baştan oradaydı ve küçük puntoda saklanıyordu.
    // ⚠ `min()`: satır uzunluğu okunabilirlik için 34ch'i AŞMAMALI, kolonu da aşmamalı.
    `           line-height: 1.5; color: var(--kart-soluk);`,
    `           max-width: min(34ch, ${Math.round(G * t.baslikSutunu) - 128}px) }`,
    `  .govde strong { color: var(--kart-metin); font-weight: 700 }`,
    // ⚠ Dev soluk metin kesim çizgilerini KASTEN aşıyor: kesintisizliğin en görünür işareti.
    // ⚠ Dev soluk metin: BÜYÜK ve kesim çizgilerini aşacak kadar aşağıda. İlk sürümde
    // 300 px ve %4,5 opaklıkla başlığın arkasında kalıyor, hiç okunmuyordu — referansta
    // ghost'lar kesintisizliğin en görünür işareti.
    // ⚠ Hayalet rengi de zeminden türüyor: kâğıt zeminde beyaz bir hayalet YOK demektir.
    `  .hayalet { position: absolute; left: 30px;`,
    `             top: ${Math.round((doc.hayaletKonumu?.ust ?? 22) * 0.01 * doc.yukseklik)}px;`,
    // ⚠ ⚠ **PUNTO UZUNLUĞA GÖRE — ve bunu GERÇEK KOŞU dayattı.** Sözleşme hayaleti
    // "kısa: rakam/sembol" diye tarif ediyor ama model kelimeler yazdı ("Hafıza",
    // "Kopukluk") ve 470px'te tek kelime ÜÇ SLAYDI kat edip başlıkla yarıştı. Reddetmek
    // yanlış olurdu (D-273: yazar bir model, ret koşunun tamamına mal olur); ölçek
    // uyarlanıyor. Üç karaktere kadar tam punto, sonrası orantılı küçülüyor — yani bir
    // rakam DEV kalıyor, bir kelime bir slayda sığıyor.
    `             font-size: calc(var(--hayalet-punto) * 1px);`,
    `             font-family: "Marka Display", sans-serif; font-weight: 900;`,
    `             letter-spacing: -0.055em;`,
    `             font-stretch: calc(var(--baslik-wdth) * 1%);`,
    `             color: ${sol('--hayalet-renk', doc.hayaletKonumu?.guc ?? 7)}; letter-spacing: -0.05em;`,
    // ⚠ ⚠ **`line-height: 0.76` KEYFİ DEĞİL, `ust`U ANLAMLI KILAN ŞEY.** Varsayılan satır
    // yüksekliğinde kutunun tepesi ile glifin tepesi arasında ~0,25em boşluk var; 893 px'lik
    // bir rakamda bu 223 px demek. `akan-alan`da `ust: 56` verildiğinde rakam tuvalin ALTINA
    // taşıp tamamen kayboldu ve "hayalet yok" sanıldı. Satır yüksekliği sabitlenince `ust`
    // yaklaşık olarak GLİFİN tepesini gösteriyor — yani şablon yazarının kastettiği şeyi.
    `             line-height: ${HAYALET_SATIRI};`,
    `             pointer-events: none; white-space: nowrap; z-index: 0 }`,
    // ⚠ ⚠ **`.ray` HARİÇ.** İlk sürüm `:not(.hayalet)` diyordu ve `.ray`in
    // `position: absolute`ını EZİYORDU: alt ray akışa girip gövde metninin hemen altına
    // düşüyor, künye kartın ortasında duruyordu. Bakınca görüldü.
    // ⚠ ⚠ **z-index 2 DEĞİL 6: metin görselin ÜSTÜNDE.** Eskiden 2'ydi, görseller ise
    // 4'te — yani kesik özne metnin üstüne biniyordu ve gerçek üretimde iki kartın
    // gövdesi okunmaz hâle geliyordu. Ölçüldü (`metin-ortuluyor`): altı şablonun ÜÇÜNDE
    // ve iki gerçek koşunun İKİSİNDE de gövdenin %6–20'si örtülüydü.
    // ⚠ Kart YIĞIN BAĞLAMI KURMUYOR (`position: absolute`, z-index yok), bu yüzden
    // çocukların z-index'i doğrudan görsellerle yarışıyor — düzeltme tek sayı.
    // ⚠ Sıra şimdi: kart zemini → lekeler(2) → GÖRSEL(4) → oklar(5) → METİN(6).
    // Referans tasarımlarda da başlık figürün önünden geçiyor; istenen katmanlanma bu.
    `  .kart > *:not(.hayalet):not(.ray) { position: relative; z-index: 6 }`,
    `  .panel, .sayilar, .etiketler { --panel-olcek: calc(var(--panel-kok) * var(--ayar-olcek, 1)) }`,
    // ── paneller ────────────────────────────────────────────────────────────
    // ⚠ ⚠ **PANEL RENKLERİ ZEMİNDEN TÜRÜYOR — ONALTI SABİT BEYAZ SİLİNDİ.** Panel gövdesi,
    // panel başlığı, çubuk etiketi, sayı birimi, vafel karesi, etiket çipi ve alt ray
    // `rgba(255,255,255,…)` yazıyordu. Koyu zeminde doğru, KÂĞIT zeminde görünmez: iki
    // şablonun (`memphis`, `editoryal`) tüm veri panelleri beyaz-üstüne-beyazdı ve metrik
    // yeşildi — çünkü ölçülen şey varlıktı, görünürlük değil. `color-mix` ile aynı oranlar
    // kartın KENDİ metin renginden türetiliyor; koyu zeminde çıktı birebir aynı kalıyor.
    // ⚠ ⚠ **TEK AYIRAÇ, ÜÇ DEĞİL (tasarım rehberi §6).** Panel aynı anda zemin farkı +
    // çerçeve + köşe yarıçapı taşıyordu; üçü birden kullanılınca ortaya çıkan şey bir
    // HTML tablosudur. Ayrım için biri seçiliyor: sol kenarda tek bir AKSAN çizgisi.
    // Çizgi bir anlam taşıyor (panel buradan başlıyor), süs değil.
    // ⚠ Zemin farkı da kaldırıldı: panel artık kartın zemininde YÜZÜYOR, kendi kutusunda
    // oturmuyor — katmanlanma rehber §3'ün istediği şey.
    // ⚠ ⚠ **PANEL ÖLÇEĞİ REÇETEYE BAĞLANDI (D-292) — ve sebebi bir ÖLÇÜM.** Buradaki
    // sabitler WEB ölçüsündeydi: `.liste-ad` 22px, `.etiket` 18px, vafel 300px. 1350px'lik
    // bir tuvalde 22px, yüksekliğin %1,6'sı. Ölçüldü: `veri-hikayesi` — adı üstünde VERİ
    // şablonu — kartlarında panel kadrajın %0,9–4,9'unu tutuyordu, hayalet ise %22–26'sını.
    // **Ekrandaki en büyük şey dekoratif bir rakamdı, şablonun tüm amacı olan veri bir
    // kırıntıydı.** Depo sahibinin "web tasarımı gibi duruyor" tespitinin sayısal karşılığı.
    //
    // ⚠ Tek çarpan, tüm panel: ayrı ayrı büyütmek oranları bozardı ve panelin kendi iç
    // ritmi (rehber §3, 1:3 boşluk) referansın değil bizim tercihimiz olurdu.
    `  .panel { padding: calc(4px * var(--panel-olcek)) 0 calc(4px * var(--panel-olcek)) calc(26px * var(--panel-olcek)); max-width: calc(640px * var(--panel-olcek));`,
    `           border-left: 3px solid var(--kart-aksan) }`,
    `  .panel-baslik { font-size: calc(16px * var(--panel-olcek)); letter-spacing: 0.16em; color: ${sol('--kart-metin', 50)};`,
    `                  margin-bottom: calc(18px * var(--panel-olcek)); font-weight: 600 }`,
    `  .cubuk-satir { display: flex; align-items: center; gap: calc(12px * var(--panel-olcek)); margin-bottom: calc(11px * var(--panel-olcek)) }`,
    `  .cubuk-etiket { width: calc(64px * var(--panel-olcek)); font-size: calc(18px * var(--panel-olcek)); color: ${sol('--kart-metin', 60)};`,
    `                  font-variant-numeric: tabular-nums }`,
    `  .cubuk-yuva { flex: 1; height: calc(22px * var(--panel-olcek)); background: ${sol('--kart-metin', 8)};`,
    `                border-radius: 3px; overflow: hidden; display: block }`,
    `  .cubuk { display: block; height: 100%; background: var(--kart-aksan);`,
    `           border-radius: 3px; min-width: calc(6px * var(--panel-olcek)) }`,
    `  .cubuk.tahmin { background: repeating-linear-gradient(115deg,`,
    `                  var(--kart-aksan) 0 7px, transparent 7px 14px);`,
    `                  box-shadow: inset 0 0 0 2px var(--kart-aksan) }`,
    `  .cubuk-not { font-size: calc(17px * var(--panel-olcek)); color: ${sol('--kart-metin', 75)}; white-space: nowrap;`,
    // ⚠ `tnum` ölçüldü: `1111 8888` orantılıda 464 px, tabularda 543 px. Sayı sütunu ancak
    // tabularda hizalanıyor — orantılı rakamla çubuk notları birbirini tutmuyordu.
    `                font-variant-numeric: tabular-nums }`,
    `  .sayilar { display: flex; gap: calc(18px * var(--panel-olcek)); flex-wrap: wrap }`,
    // ⚠ Sayı kartı da kutusundan çıktı: dev rakam ZATEN kendi ağırlığıyla ayrışıyor,
    // etrafına çerçeve çizmek onu küçültüyordu (rehber §6, §7).
    `  .sayi-kart { padding: 0 calc(44px * var(--panel-olcek)) 0 0 }`,
    // ⚠ ⚠ **DEV SAYIDA TRACKING AGRESİF NEGATİF (T6).** Varsayılan harf aralığı gövde
    // metni için ayarlıdır; 150 px'lik bir rakamda aynı aralık ögeleri BİRBİRİNDEN KOPARIR
    // ve sayı tek bir kütle olmaktan çıkar. Photoshop'ta bu elle sıkıştırılır.
    `  .sayi { font-family: "Marka Display", sans-serif; font-size: calc(74px * var(--panel-olcek)); font-weight: 900;`,
    `          letter-spacing: -0.045em;`,
    `          font-stretch: calc(var(--baslik-wdth) * 1%); font-variant-numeric: tabular-nums;`,
    `          color: var(--kart-aksan); line-height: 1 }`,
    `  .birim { font-size: calc(26px * var(--panel-olcek)); margin-left: calc(8px * var(--panel-olcek)); color: ${sol('--kart-metin', 70)} }`,
    `  .sayi-alt { font-size: calc(18px * var(--panel-olcek)); color: ${sol('--kart-metin', 60)}; margin-top: calc(8px * var(--panel-olcek)) }`,
    `  .vafel { display: grid; grid-template-columns: repeat(10, 1fr); gap: calc(5px * var(--panel-olcek)); width: calc(300px * var(--panel-olcek)) }`,
    `  .vafel-kare { width: 100%; aspect-ratio: 1; background: ${sol('--kart-metin', 9)};`,
    `                border-radius: 2px }`,
    `  .vafel-kare.dolu { background: var(--kart-aksan) }`,
    `  .liste-satir { display: flex; gap: calc(14px * var(--panel-olcek)); align-items: baseline; margin-bottom: calc(10px * var(--panel-olcek)) }`,
    `  .liste-no { font-family: "Marka Display", sans-serif; font-size: calc(22px * var(--panel-olcek));`,
    `              color: var(--kart-aksan); font-variant-numeric: tabular-nums;`,
    `              font-weight: 800; min-width: calc(32px * var(--panel-olcek)) }`,
    `  .liste-ad { font-size: calc(22px * var(--panel-olcek)) }`,
    `  .liste-ikon { display: flex; align-items: center; width: calc(21px * var(--panel-olcek)); flex: none }`,
    `  .etiketler { display: flex; flex-wrap: wrap; gap: calc(10px * var(--panel-olcek)); max-width: calc(620px * var(--panel-olcek)) }`,
    `  .etiket { border: 1px solid ${sol('--kart-metin', 16)}; border-radius: 999px;`,
    `            padding: calc(8px * var(--panel-olcek)) calc(16px * var(--panel-olcek)); font-size: calc(18px * var(--panel-olcek)); color: ${sol('--kart-metin', 80)} }`,
    // ── bant ────────────────────────────────────────────────────────────────
    // ⚠ Bant 560 px: 300 px'te eğri dibe yapışıyor ve "hikâye" okunmuyordu. Yükseklik
    // eğrinin anlatabileceği fark kadar olmalı.
    // ⚠ `.bant-ok` İLK SÜRÜMDE LİSTEDE YOKTU: SVG basılıyor ama boyutsuz kalıyor ve
    // hiç çizilmiyordu. Oklar `sahne` şablonunun iki süreklilik ögesinden biri — yokluğu
    // şablonu yarıya indiriyordu ve ancak render'a bakınca görüldü.
    `  .lekeler { position: absolute; left: 0; top: 0; width: ${toplam}px;`,
    `             height: ${doc.yukseklik}px; z-index: 0; pointer-events: none }`,
    // ⚠ Kart zemini z-index 1'de; `ust` lekeler 2'de, görseller 3'te. Sıra tesadüf değil:
    // daire kart renginin ÜSTÜNDE, ürünün ALTINDA durmalı (referans: `image copy 3`).
    `  .lekeler.ust { z-index: 2 }`,
    `  .alan-siniri { position: absolute; left: 0; top: 0; width: ${toplam}px;`,
    `                 height: ${doc.yukseklik}px; z-index: 0 }`,
    `  .bant-ok { position: absolute; left: 0; top: 0; width: ${toplam}px;`,
    `             height: ${doc.yukseklik}px; z-index: 5; pointer-events: none }`,
    `  .bant, .bant-kemer { position: absolute; left: 0; bottom: 120px;`,
    `                       width: ${toplam}px; height: 560px; z-index: 1 }`,
    `  .kilometre { position: absolute; bottom: 120px; z-index: 3; transform: translateX(-50%);`,
    `               text-align: center }`,
    `  .kilometre-nokta { display: block; width: 13px; height: 13px; border-radius: 50%;`,
    `                     background: var(--pano-aksan); margin: 0 auto 8px }`,
    `  .kilometre-etiket { font-size: 16px; letter-spacing: 0.1em; color: var(--pano-metin);`,
    `                      white-space: nowrap; font-weight: 600;`,
    `                      font-variant-numeric: tabular-nums }`,
    // ── alt ray: her slaytta aynı yerde, ritmi taşıyan tekrar ────────────────
    // ⚠ Ray `.gorsel`in (z-index 4) ÜSTÜNDE: alt kenardan taşan kesik özne rayı örtüyordu
    // ve marka imzası ile kaynak satırı görünmez oluyordu. Ölçüldü, D-300.
    `  .ray { position: absolute; left: 64px; right: 64px; bottom: 46px; z-index: 6;`,
    `         display: flex; gap: 40px; align-items: center;`,
    `         border-top: 1px solid ${sol('--kart-metin', 10)}; padding-top: 20px;`,
    `         font-size: 18px; letter-spacing: 0.13em; color: ${sol('--kart-metin', 48)} }`,
    `  .ray-sayac { margin-left: auto; color: var(--kart-aksan); font-weight: 700;`,
    `         flex: none; white-space: nowrap }`,
    // ⚠ İfşa şeritte, künyenin yanında: bir uyarı kutusu değil bir KÜNYE satırı —
    // fotoğraf kredisi gibi okunur. Görünür olmak zorunda ama tasarımı bozmak
    // zorunda değil; `ray-sayac`tan ÖNCE, sağa yaslanmadan duruyor.
    //
    // ⚠ ⚠ **KAYNAK METNİ KISALIR, İFŞA KISALMAZ.** Gerçek çıktıda uzun bir `rayaOrta`
    // ifşanın ALTINDAN geçip okunmaz bir karışıklık üretti: flex öğeleri `min-width`
    // olmadan içeriklerinin altına inmiyor. Küçülme hakkı kaynak metnine veriliyor
    // (zaten uzun nesir ve kırpılınca anlamı kaybolmaz), ifşa ve sayaç sabit —
    // ifşanın kırpılması Md. 50 açısından kabul edilemez.
    // ⚠ ⚠ **KÜNYE ŞERİDİ GÖRSELİN ÜSTÜNE DÜŞÜNCE OKUNMUYORDU — ve AI ifşası tam
    // orada.** Ölçüldü: kesik özne kadrajın dibine iniyor, şerit açık bir kâğıt
    // yığınının üstüne geliyor, metin zemine karışıyor (medyan 209, metin 245 —
    // fark 36). Md. 50 GÖRÜNÜR ifşa istiyor; okunamayan bir ifşa, ifşa değildir.
    //
    // ⚠ ⚠ **ÇÖZÜM YENİ BİR ÖGE DEĞİL.** İlk deneme `::before` ile bir perde koydu ve
    // `kodlanmis-oge` kapısı onu haklı olarak reddetti (R-81, tavan 0). Kural bu turda
    // gevşetilemez (R-76) — ve gevşetilmesi de gerekmiyor: şeridin KENDİ zemini bir
    // ZEMİN reçetesidir, yeni bir öge değil. Var olan elemana degrade veriliyor.
    // ⚠ Degrade KENARDAN KENARA: kutu 64 px içeride kalınca dip kararması bir
    // dikdörtgen gibi görünüyor ve kenarı fark ediliyordu (bakıldı, görüldü).
    // Negatif yan boşluk + eşit iç boşluk: zemin tuvali kaplıyor, metin içeride.
    `  .ray { padding-bottom: 30px; margin-bottom: -30px;`,
    `         margin-left: -64px; margin-right: -64px;`,
    `         padding-left: 64px; padding-right: 64px;`,
    `         background: linear-gradient(to top,`,
    `                     color-mix(in srgb, var(--kart-zemin) 90%, transparent) 0%,`,
    `                     color-mix(in srgb, var(--kart-zemin) 82%, transparent) 62%,`,
    `                     color-mix(in srgb, var(--kart-zemin) 0%, transparent) 100%) }`,
    `  .ray-sol { flex: none; white-space: nowrap }`,
    `  .ray-orta { min-width: 0; overflow: hidden; text-overflow: ellipsis;`,
    `         white-space: nowrap }`,
    `  .ray-ifsa { margin-left: auto; opacity: 0.85; flex: none; white-space: nowrap }`,
    `  .ray-ifsa + .ray-sayac { margin-left: 40px }`,
    // ── görsel katmanı ──────────────────────────────────────────────────────
    `  .gorsel, .gorsel-yer { position: absolute; z-index: 4; object-fit: cover }`,
    `  .gorsel.kesik, .gorsel-yer.kesik { object-fit: contain; object-position: bottom }`,
    `  .gorsel.daire, .gorsel-yer.daire { border-radius: 50%; object-fit: cover }`,
    // ⚠ ⚠ **YER TUTUCU HER ZEMİNDE GÖRÜNMEK ZORUNDA.** İlk sürüm beyaz-şeffaf çizgi
    // kullanıyordu ve açık zeminli şablonlarda (`memphis`, `editoryal`) tamamen
    // kayboluyordu — kimliği görsel olan iki şablon BOŞ görünüyordu. Eksik bir taşıyıcı,
    // görünmezse eksik sayılmaz ve tasarım tam sanılır.
    // Aksan rengi iki zeminde de okunuyor; yer tutucu bir uyarıdır, bir süs değil.
    `  .gorsel-yer { border: 3px dashed ${AKSAN}; display: flex;`,
    `                align-items: center; justify-content: center; text-align: center;`,
    `                color: ${AKSAN}; font-size: 22px; letter-spacing: 0.14em;`,
    `                font-weight: 700; padding: 20px; background: rgba(127,127,127,0.14) }`,
    `  .gorsel-yer.daire { border-radius: 50% }`,
    '</style>',
    `<body data-surface="kreatif">`,
    // ⚠ Yalnız KULLANILAN işlemin tanımı basılıyor: kullanılmayan bir `<filter>` ölü
    // biçimlendirme (FAZ-12.2 ile aynı gerekçe).
    (doc.gorselIslemleri ?? []).map((i) => islemTanimi(i)).join(''),
    `<div id="sahne">`,
    alanKatmani,
    lekeKatmani,
    bantSvg(doc.bant, toplam, doc.yukseklik),
    kartlar,
    // ⚠ Kartlardan SONRA, görsellerden ÖNCE: `donen`in beyaz dairesi kart renginin
    // üstünde ama ürünün ALTINDA duruyor — referansın (`image copy 3`) katman sırası.
    ustLekeKatmani,
    gorseller,
    // ⚠ Görsellerden SONRA, kesim ayracından ÖNCE: doku fotoğrafı da kapsıyor (yoksa
    // kesik özne tasarımın üstünde ayrı bir dünya gibi durur), ayraç ise en üstte kalıyor.
    ustDoku,
    `</div></body></html>`,
  ].join('\n')
}

/**
 * Başlık puntosunun ÖLÇÜLEN tavanı — R-23'ün panorama karşılığı.
 *
 * ⚠ ⚠ **BU BİR TAHMİN DEĞİL, İKİLİ ARAMA.** Önceki sürüm `font-size: 82px` yazıyordu ve
 * bu sayı hiçbir şeyden türemiyordu. Türkçe eklemeli: `taşıyabileceğimizin` 19 harf ve
 * 64 px'te 582 px yer istiyor — bir sütuna sığıp sığmadığı ancak ÖLÇÜLEBİLİR. Burada
 * her kart için en büyük "sığan" punto aranıyor: kelime sütunu taşmayacak (`scrollWidth`)
 * ve başlık bloğu kendine ayrılan yüksekliği aşmayacak (`scrollHeight`).
 *
 * ⚠ ⚠ **TAVAN EN DAR KARTTAN GELİYOR ve bu bir tasarım kararı.** Kart başına punto
 * hesaplansaydı uzun başlıklı slayt küçük, kısa başlıklı slayt dev olurdu; kaydıran göz
 * altı ayrı poster görürdü. Karosel TEK tasarım — ölçek ritmi slaytlar arasında sabit.
 *
 * ⚠ `baslikPayi` bu tavanın oranı: bir şablon (`editoryal`, payı 0,38) kasten fısıldar.
 * Tavanı AŞMAK temsil edilemiyor — çarpan 0–1 arası, garanti yapıdan geliyor.
 */
export const puntoOlcumu = (doc: PanoramaBelgesi): string => {
  const t = doc.tipografi ?? VARSAYILAN_TIPO
  // Kart iç yüksekliği: üst/alt dolgu (68 + 190) düşülüyor. Başlık bloğunun payı %44 —
  // gerisi üst başlık, gövde ve panel için. Aşarsa punto düşüyor, panel ezilmiyor.
  const blokYuksekligi = Math.round((doc.yukseklik - 258) * 0.44)
  // ⚠ ⚠ **SÜTUN SINIRI ÖLÇÜLMÜYOR, VERİLİYOR — yoksa ölçüm KENDİNİ ölçerdi.** `.baslik`
  // bir flex sütununda `align-items: flex-start` ile duruyor: genişliği İÇERİĞİNE göre
  // daralıyor. `getBoundingClientRect().width` o yüzden sütun sınırını değil, o anki
  // punto ile oluşan metin genişliğini verirdi ve "sığıyor mu" sorusu her puntoda evet
  // cevabı alırdı. Bu oturumda aynı sınıf hata (`column_in_band`, `ghost_overlap`,
  // `spacing_offscale`) üç ayrı yerde çıktı: **iki tarafı aynı kaynaktan gelen bir ölçüm
  // asla kırmızıya dönmez.** Sınır CSS'e yazılan sayının ta kendisi.
  const sutunSiniri =
    Math.round(doc.slaytGenisligi * (doc.tipografi ?? VARSAYILAN_TIPO).baslikSutunu) - 128
  return `(() => {
    const sahne = document.getElementById('sahne')
    const basliklar = Array.from(document.querySelectorAll('.baslik'))
    if (basliklar.length === 0) return 0
    let tavan = 168
    for (const b of basliklar) {
      const sinir = ${sutunSiniri}
      let alt = 20, ust = 168
      // 18 tur ikili arama: 148 px aralıkta 0,001 px çözünürlük — fazlası gereksiz.
      for (let k = 0; k < 18; k += 1) {
        const orta = (alt + ust) / 2
        b.style.fontSize = orta + 'px'
        const sigiyor = b.scrollWidth <= sinir + 1 &&
                        b.scrollHeight <= ${blokYuksekligi}
        if (sigiyor) alt = orta; else ust = orta
      }
      b.style.fontSize = ''
      if (alt < tavan) tavan = alt
    }
    const punto = tavan * ${t.baslikPayi}
    sahne.style.setProperty('--baslik-punto', punto.toFixed(1) + 'px')
    return punto
  })()`
}

/**
 * Panoramayı render eder ve dilimler.
 *
 * ⚠ ⚠ **TEK SAYFA, N EKRAN GÖRÜNTÜSÜ.** Sayfa bir kez kuruluyor ve fontlar bir kez
 * yükleniyor; sahne her karede `translateX(-i × G)` ile kaydırılıyor. Alternatif —
 * geniş tuvali tek seferde çekip PNG'yi dilimlemek — bir görüntü kütüphanesi bağımlılığı
 * isterdi (R-75) ve kırpma işini viewport zaten bedava yapıyor.
 *
 * ⚠ **Font beklemesi bir kez ve BAŞTA.** `document.fonts.ready` her kare için beklenseydi
 * ilk karede yüklü olan zaten sonrakilerde de yüklü olurdu — ama beklememek, ilk karenin
 * fallback glifle çıkması demekti (§7.2).
 */
export const renderPanorama = async (
  doc: PanoramaBelgesi,
  ciktiYollari: readonly string[],
  oturum?: Oturum
): Promise<BrowserResult<{ readonly yollar: readonly string[]; readonly genislik: number }>> => {
  if (ciktiYollari.length !== doc.kartlar.length)
    return {
      ok: false,
      error: {
        kind: 'render_failed',
        message: `yol sayısı kart sayısıyla uyuşmuyor: ${ciktiYollari.length} ≠ ${doc.kartlar.length}`,
      },
    }
  // ⚠ Oturum verilirse onun sayfası: tarayıcı zaten açıksa ikinciyi açmak, aynı koşuda
  // iki font yüklemesi ve iki kez bekleme demek (`static.ts` ile aynı gerekçe).
  const calistir = <T>(fn: (page: Page) => Promise<T>): Promise<BrowserResult<T>> =>
    oturum === undefined ? withPage(fn) : oturum.sayfaIle(fn)
  return calistir(async (page) => {
    await page.setViewportSize({ width: doc.slaytGenisligi, height: doc.yukseklik })
    await page.setContent(panoramaHtml(doc), { waitUntil: 'load' })
    await page.evaluate('(async () => { await document.fonts.ready; return true })()')
    // ⚠ ⚠ **PUNTO FONTLAR YÜKLENDİKTEN SONRA ÖLÇÜLÜYOR — ÖNCE DEĞİL.** Yedek fontla
    // ölçülen bir tavan yanlış olurdu ve `Ğ Ş İ` gliflerinin gerçek genişliğini hiç
    // görmezdi. Tavan tüm kartların EN DARINDAN geliyor: karosel tek bir tasarım,
    // slayttan slayda değişen bir başlık puntosu ritmi kırar.
    await page.evaluate(puntoOlcumu(doc))
    for (const [i, yol] of ciktiYollari.entries()) {
      await page.evaluate(
        `document.getElementById('sahne').style.transform = 'translateX(${-i * doc.slaytGenisligi}px)'`
      )
      await page.screenshot({ path: yol, type: 'png' })
    }
    return { yollar: ciktiYollari, genislik: doc.slaytGenisligi }
  })
}
