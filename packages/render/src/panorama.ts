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
import { FILTRE_TANIM_CSS, type GorselIslem, islemTanimi, islemZinciri } from './gorsel-islem.js'
import { kacir } from './html.js'
import { OPENTYPE_CSS, vurguyuIsaretle } from './sablon-tipo.js'
import { ikonSec, ikonSvg, type IkonAdi } from './sablon-ikon.js'
import {
  grenKatmani,
  grenKipi,
  grenOpakligi,
  yuzeyKatmanlari,
  zeminCss,
  zeminKarisimi,
  type Yuzey,
  type ZeminResetesi,
} from './zemin.js'
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
      /**
       * **Ritmi BOZAN tek kemer** — indeks ve tepe çarpanı.
       *
       * ⚠ ⚠ **GEOMETRİ İDDİANIN KANITI OLMAK ZORUNDA (R-107).** `kavis`in üçüncü karesi
       * *"Sapma görünür olmalı"* diyor ve *"görünmeyen sapma, ortalamanın içinde
       * kaybolur"* diye açıyor — ama on üç kemerin on üçü BİREBİR aynı yüksekteydi.
       * Tipografi sapmadan söz ederken geometri kusursuz bir ritim çiziyordu, yani
       * kartın kendi cümlesini yalanlıyordu. Aynı sınıf kusur `veri-hikayesi`nin
       * eğrisinde ölçülmüştü: başlık "iki kat" derken eğri 3,2× çiziyordu.
       * ⚠ Sapan kemer o kartın ölü bandını da dolduruyor — süs değil, ARGÜMAN.
       */
      readonly sapma?: { readonly indeks: number; readonly carpan: number }
      /**
       * Bandın yüksekliği — 1080 tabanında px, verilmezse ortak varsayılan (560).
       *
       * ⚠ ⚠ **ÖLÜ ORTA BİR TASARIM KUSURUDUR.** Ortak 560 px'lik band tuvalin altına
       * yapışıyor; `kavis`te gövde ~y700'de bitiyor, kemerler ~y930'da başlıyordu ve
       * arada şekillenmemiş bir kuşak kalıyordu. Tasarım denetimi bunu *"nizami boşluk,
       * gerilimli boşluk değil"* diye yazdı: üst blok ile alt süs birbirinden habersiz.
       * ⚠ Band yüksekliği ŞABLONA ait bir karardır: mimari bir kolonad tuvalin üçte
       * birine sıkışamaz. Ortak sabit, ortak bir tasarım dayatıyordu.
       */
      readonly yukseklik?: number
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
  | {
      /**
       * **ÖLÇEK ÇİZGİSİ** — panoramayı kat eden hairline ve tırtıkları (D-319).
       *
       * ⚠ ⚠ **DEGRADE VE IŞIK HAVUZU YERİNE GELDİ.** Zemin dokusu sürekliliği bir ışık
       * geçişiyle ima ediyordu; markanın dizayn sistemi degrade meshi, glow'u ve
       * "atmosferik renk"i açıkça yasaklıyor ve ayrımı YÜZEY ADIMI + 1px HAIRLINE ile
       * kuruyor. Bu bant o dilin karoseldeki karşılığı: bir enstrüman skalası.
       *
       * ⚠ **Süs değil, ÖLÇÜ.** Tırtıklar eşit aralıklı; etiketli duraklar içerikten
       * geliyor (bir kilometre taşı, bir slayt eşiği). Silinirse kaybolan şey bir
       * dekor değil, okuyucunun nerede olduğu bilgisi — sürekliliğin ta kendisi.
       */
      readonly tip: 'olcek'
      /** Çizginin y'si — 0–100, panorama yüksekliğine göre. */
      readonly y: number
      /** Tırtık aralığı — panorama x'inde yüzde. 0 ise tırtık yok. */
      readonly aralik: number
      /** Etiketli duraklar — gerçek bir eşik, uydurma bir işaret değil. */
      readonly duraklar: readonly { readonly x: number; readonly etiket: string }[]
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
      /**
       * ⚠ ⚠ **`aktif` EKLENDİ ve sebebi bir ANLATI kusuruydu.** Denetim: *"dört adımlık
       * dizin her karede TEK satır gösteriyor — dizin hiçbir yerde bir arada görünmüyor."*
       * Bir dizin, yalnız o anki maddeyi gösteriyorsa dizin değildir; **bütünü gösterip
       * içinde nerede olduğunu söyleyen şeydir.** Her kart artık dört maddenin dördünü
       * taşıyor: üçü sönük, biri yanık.
       */
      readonly ogeler: readonly {
        readonly no: string
        readonly ad: string
        readonly aktif?: boolean
      }[]
      /**
       * ⚠ ⚠ **`yayik` EKLENDİ — ÖLÇÜLDÜ: `dizin`in alt %43'ü BOŞTU.** Yeni alet
       * (`olu-bant`) her slaytta en uzun içeriksiz yatay bandı buluyor; `dizin`in üç
       * kartında bant y%51'de başlayıp %94'e kadar iniyordu — kadrajın neredeyse yarısı.
       * Sebep tek satırdı: `gorseller: []`. On şablonun tek görselsiz olanı ve kapsamı
       * %42 — ailenin ortalaması %70.
       *
       * **Bir dizin sıkışık bir pencere ögesi değil, sayfadan aşağı inen bir GÜZERGÂHTIR.**
       * `yayik` maddeleri kadrajın boyuna dağıtıyor: soldaki dikey çizgi bir omurgaya,
       * numaralar duraklara dönüşüyor ve kartlar arası oklar o inişin devamı oluyor.
       */
      readonly yayik?: boolean
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
   * Alan başına elle ince ayar. Anahtar: `ustBaslik` · `baslik` · `govde` · `panel`.
   * Verilmezse şablonun ızgarası aynen geçerli.
   */
  readonly ayar?: Readonly<Record<string, MetinAyari>>
  /** Küçük büyük harf üst başlık — bölüm adı. */
  readonly ustBaslik: string
  /** Başlık; `**vurgu**` işareti aksan rengine dönüşüyor. */
  readonly baslik: string
  readonly govde: string
  readonly panel: Panel | null
  /** Arkadaki dev soluk metin — kesim çizgilerini KASTEN aşıyor. */
  readonly hayalet: string
  /** Alt ray: sol (dönem/bölüm) ve orta (kaynak). */
  /**
   * Kapanış kartı — karoseli BİTİREN kare.
   *
   * ⚠ ⚠ **KAPANIŞ, KAROSELİN EN BOŞ KARESİYDİ ve bu ÖLÇÜLDÜ.** Dört şablonda son kare
   * kendi destesinin en az mürekkepli karesi: `sahne-04` %2,1 · `donen-04` %3,3 ·
   * `memphis-06` %3,5 · `dizin-04` %4,7. Tasarım denetimi bunu *"içerik bitti diyor,
   * VARDIK demiyor"* diye yazdı. Karoselin tepe yapması gereken yerde sistem düz çiziyordu.
   * ⚠ Çözüm süs EKLEMEK değil: kapanış marka kilidini GERÇEK BOYDA taşıyor (bugün
   * markalama işini 20 px'lik künye şeridi yapıyor — o bir altbilgi, imza değil) ve tek
   * satırlık tek çağrı. İkisi de tipografi ve marka VARLIĞI; CSS'le çizilmiş şekil değil.
   */
  readonly kapanis?: {
    /**
     * ⚠ ⚠ **VARIŞ RAKAMI — ve İMZADAN ÖNCE GELİYOR, sıra bir tercih değil ÖLÇÜM.**
     * İmza tek başına eklendiğinde son karenin mürekkebi %2,1'den yalnız %2,8'e çıktı:
     * doğru müdahale, yanlış sırada. Kapanışı taşıyan şey imza değil, VARILAN SAYIdır.
     * Kapak yüksekliği 300-360 px hedefleniyor (tuval 1440) — kadrajın dörtte biri.
     */
    readonly rakam?: string
    /** Rakamın altındaki tek satırlık okuma — rakam kaynaksız kalmasın (R-32). */
    readonly rakamAlt?: string
    readonly cagri: string
  }
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
  /** Başlık ağırlığı 400–900. */
  readonly baslikAgirlik: number
  /** Satır aralığı çarpanı — sıkı 0,98 · havadar 1,3. */
  readonly satirAraligi: number
  /** Harf arası, em. Negatif = sıkı poster; pozitif = seyrek editoryal. */
  readonly harfArasi: number
  /** Gövde/başlık punto oranı. Küçük = sert hiyerarşi. */
  readonly govdeOrani: number
  /** Başlık sütununun kart genişliğine oranı (0–1]. */
  readonly baslikSutunu: number
  /**
   * Gövde sütununun oranı — verilmezse `baslikSutunu` (R-86).
   *
   * ⚠ ⚠ **İKİSİ AYRI OLMAK ZORUNDA ve bunu bir ölçüm gösterdi.** Gövde başlığın
   * sütununa hapsedilmişti; bir şablonun dar başlık tercihi (poster sesi) gövdeyi de
   * daraltıyordu. Tarayıcıda sayıldı: `donen` **19**, `editoryal` 27 karakter — Butterick
   * bandının (45–90) çok altı. Gövde daha küçük puntoda ve aynı genişlikte çok daha
   * fazla karakter taşır; iki sütun aynı sayıdan türeyemez.
   *
   * ⚠ Ama gövde sütunu KEYFÎ de genişleyemez: görselli şablonlarda fotoğraf kolonuna
   * girer. Sınır şablonun kendi kararı — ölçü bandı bir DİLEK değil, şablonun ilan
   * ettiği geometri içinde sağlanacak bir hedef.
   */
  readonly govdeSutunu?: number
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
  baslikAgirlik: 800,
  satirAraligi: 1.18,
  harfArasi: -0.02,
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
  /**
   * Yayık — başlık öbeği üstte, gövde dibe itilmiş.
   *
   * ⚠ ⚠ **`space-between` DEĞİL ve sebebi ÖLÇÜLDÜ.** Eşit dağılım ögeleri TEK TEK
   * dağıtıyordu: `donen`de üst etiket kadrajın tepesinde yapayalnız kalıyor, başlığıyla
   * arasında **369 px** açıklık oluşuyordu. Ailenin öteki sekiz şablonunda bu açıklık
   * her kartta tam **14 px** — yani varyasyon değil, bambaşka bir ilişki. Etiket
   * başlığın ADIDIR; yakınlık onları bağlayan tek şey ve dörtte bir kadraj o bağı koparır.
   * ⚠ Yayılma KALDIRILMADI, öbek-farkında yapıldı: başlık öbeği üstte kalıyor, gövde
   * `margin-top: auto` ile dibe iniyor. Ayrım hâlâ yerleşimden geliyor (R-107). → R-112
   */
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
  // ⚠ `space-between` başlık öbeğini parçalıyordu — gerekçe `Yerlesim` tipinde.
  // ⚠ ⚠ **YÜKÜ TAŞIYAN BU SATIR DEĞİL, `.govde`nin `margin-top: auto`SU — ve bunu
  // kasten ihlal denemesi söyledi.** Önce burası `space-between`e geri çevrildi ve test
  // YEŞİL kaldı: otomatik pay boş alanın tamamını yuttuğu için `justify-content`e
  // dağıtacak bir şey kalmıyor. Satır yine de `flex-start`: niyeti doğru söylüyor ve
  // güvenliği başka bir kuralın yan etkisine bırakmıyor.
  yayik: 'flex-start',
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

/**
 * Kaynak satırı boşken basılan metin (R-104 · §8).
 *
 * ⚠ ⚠ **SESSİZ BOŞLUK YASAK.** Sistemin tek imzası *"imza renk değil, KAYNAK
 * SATIRIDIR"*; eksikliği gizlenirse imzasız bir çıktı imzalı sanılır ve insan kapısı
 * onaylar. Yer tutucu görselle birebir aynı gerekçe: eksik olan şey GÖRÜLMELİ.
 */
export const KAYNAK_YOK_METNI = 'KAYNAK YOK'

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
   * YÜZEY AİLESİ — şablonun dokusal kimliği (FAZ-19.4).
   *
   * ⚠ ⚠ **DENETİMİN EN SERT BULGUSU: "on şablon, üç zemin".** İsimler farklıydı, yüzey
   * aynıydı; katalog *"editoryal — sıcak kâğıt"*, *"kavis — beton"* yazıyordu ve render
   * ikisini de aynı düz mürekkeple çiziyordu. Bu alan o farkı ÇİZİLEBİLİR kılıyor.
   *
   * ⚠ Verilmezse yüzey yok, yalnız gren — yani bugünkü davranış. Sessiz bir varsayılan
   * seçmiyoruz: bir şablonun hangi malzemeden yapıldığı yazılı olmalı.
   */
  readonly yuzey?: Yuzey
  /**
   * ŞABLONUN AKSANI — palet kimliği (FAZ-19.6).
   *
   * ⚠ ⚠ **AKSAN ZEMİNİN KUTBUNDAN TÜRÜYORDU ve bu TEK renk dünyası demekti.**
   * `kartRenkleri` koyu zeminde marka mavisini, açık zeminde kâğıt mavisini veriyor:
   * doğru bir kural ama tek palet varsayıyor. On şablonun on ayrı malzemesi varsa on
   * ayrı renk dünyası da olmalı — `alinti`nin açık taşı ile `kavis`in betonu ölçümde
   * de gözde de ayrılmıyordu (σ 5,10 / 5,00). Palet farkı o boşluğu kapatıyor.
   *
   * ⚠ Verilmezse eski davranış: aksan zeminden türer. Palet vermeyen şablon marka
   * paletinde kalır — sessiz bir varsayılan değil, açık bir geri dönüş.
   */
  readonly aksan?: string
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
     * ⚠ ⚠ **`blob` EMEKLİ (D-342).** Gerekçesi *"hacim için gereken şey DEGRADE + GÖLGE"*
     * idi ve **D-318 tam olarak onları emekli etti** — degrade, glow, atmosferik renk.
     * Karar verildi, dal kaldı; üstelik kataloğun hiçbir şablonu onu kullanmıyordu.
     * D-306'nın madalyonuyla aynı gerekçe: kullanılmayan, sonraki bir kararla çelişen
     * ve R-81'in tam hedefinde duran bir süs.
     */
    readonly tip: 'daire' | 'halka' | 'kare' | 'nokta' | 'tarama'
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
// ⚠ ⚠ **KOYU ZEMİN METNİ ARTIK KENDİ TOKEN'I (D-318).** Eskiden kâğıt rengiydi
// (`--role-surface`) — yani "açık olan neyse metin odur". Markanın dizayn sistemi ikisini
// AYIRIYOR: kâğıt #fafafa, koyu zemin metni #eeeeee. Fark küçük ama kasıtlı; saf beyaza
// yakın bir metin OLED'de halasyon yapıyor ve sistem bunu ölçerek 0.950'de durduruyor.
const METIN = 'var(--role-metin-koyu, var(--role-surface))'

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
/**
 * Bir zemin ifadesinin ÇÖZÜLMÜŞ açıklığı (oklch L, 0–1) — bulunamazsa `null`.
 *
 * ⚠ ⚠ **AYRI BİR ÇÖZÜCÜ YAZILMADI ve sebebi bu dosyada YAZILI bir hata.** `koyuMu`
 * kaskadın doğru bloğunu (`[data-surface='kreatif']`) okumayı öğrenmişti; ikinci bir
 * çözücü o dersi bilmez ve `--role-surface` için KONSOL değerini okurdu. Gren opaklığı
 * da açıklığa bağlı (FAZ-19.4), yani ikinci bir kullanıcı doğdu — çözüm ikinci bir
 * üretici değil, var olanı DIŞARI ÇIKARMAK (R-05).
 */
const tokenAcikligi = (zemin: string, tokenCss = ''): number | null => {
  const ad = /var\(\s*(--[\w-]+)/.exec(zemin)?.[1]
  if (ad === undefined || tokenCss === '') return null
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
  return l === undefined || l === null ? null : Number.parseFloat(l)
}

/**
 * Vinyet gücü yüzey açıklığına göre — reçetenin üç durağı (FAZ-19.4).
 *
 * ⚠ Kâğıt zeminde 34'lük bir vinyet kirli bir hale bırakıyor; mürekkep zeminde 18'lik
 * bir vinyet hiç görünmüyor. Tek sayı ikisinden birinde yanlış.
 */
/**
 * **Z-SIRASI SÖZLEŞMESİ — tek yer, tek sıra (FAZ-19.7).**
 *
 * ⚠ ⚠ **DAĞINIK SAYILAR BİR SÖZLEŞME DEĞİLDİR.** `z-index` on iki ayrı CSS satırında
 * elle yazılıydı ve sıra hiçbir yerde bir arada görünmüyordu. Sonuç ölçüldü:
 * `.bant-ok` **5**'teydi, `.gorsel` **4** — yani akış taşıyıcısı kesik öznenin
 * ÜSTÜNDEN geçiyordu. Denetçinin sözleriyle: *"üstten geçen çizgi bağlantı değil
 * fosforlu kalem lekesi okunuyor."* Doğru olan tersi: **özne şeridi KESSİN** — kesilen
 * çizgi derinlik kurar.
 *
 * ⚠ `#sahne` TEK yığın bağlamı: `.kart` kendi bağlamını kurmuyor (`z-index` yok), bu
 * yüzden kart çocukları doğrudan panorama ögeleriyle yarışıyor. Tek ölçek yeterli.
 *
 * ⚠ ⚠ **GREN VE VİNYET AYRI SEVİYE — ve ayrımı bir ÖLÇÜM dayattı, simetri değil.**
 * İkisi tek "film" seviyesinde toplanıp görselin ALTINA alındığında R-96 kırmızı döndü:
 * `memphis`te siluetin p90 luma farkı **119**, eşik 120. Ayrılıp vinyet görselin
 * ÜSTÜNE çıkarılınca on kapak sıfır kusur.
 * ⚠ **İlk teşhisim YANLIŞTI ve kayda öyle geçmesin:** sebebin `normal` kipli grenin
 * kontrastı %90'a çarpması olduğunu sandım; greni tek başına altta bırakınca kusur
 * DEVAM ETTİ. Sebep vinyetti — kesik özneyi de karartan bir vinyet, özne ile zemini
 * BİRLİKTE kaydırıyor ve aradaki farkı korurken; yalnız zemini karartan bir vinyet
 * farkı yiyor. **Vinyet mercek etkisidir: sahneye değil FİLME ait, yani öznenin de
 * üstünde.** Gren ise kart zemininin üstünde, görselin altında kalıyor — kesik öznenin
 * sahneye oturması zaten `temas-golgesi` · `tema-uyum` · `matlama` zincirinin işi.
 */
const Z = {
  /** zemin, hayalet, lekeler, alan sınırı */
  zemin: 0,
  /** AKIŞ TAŞIYICISI — bant, kemer, ok, ölçek çizgisi */
  tasiyici: 1,
  /** kart renginin üstünde, öznenin altında duran leke */
  lekeUst: 2,
  /** taşıyıcının okunur parçaları: durak, etiket, kilometre */
  durak: 3,
  /** GREN — kart zemininin üstünde, görselin ALTINDA (aşağıdaki ölçüme bak) */
  gren: 4,
  /** kesik özne + temas gölgesi */
  gorsel: 5,
  /** VİNYET — kadrajın tamamına, görselin ÜSTÜNDE: mercek etkisi sahneye değil FİLME ait */
  vinyet: 6,
  /** başlık, gövde, etiket, künye şeridi */
  metin: 7,
  /** okunurluk yastığı — metnin KENDİ bağlamında `-1`, yani metninin hemen altında */
  yastik: 7,
} as const

/**
 * Optik hizalama — yuvarlak glif ve tırnak satır başında İÇERİ KAÇMIŞ görünür.
 *
 * ⚠ ⚠ **BU BİR GÖZ YANILSAMASI, ÖLÇÜM HATASI DEĞİL.** `O Ö C Ç G S Ş 0` gibi yuvarlak
 * formlar taban çizgisinde matematiksel olarak hizalıdır ama göz onları içeride görür:
 * eğri, düz bir gövdenin aksine kenara yalnız bir noktada değiyor. Tırnak daha beter —
 * altı boş bir işaret, satır başında bir delik açıyor.
 *
 * ⚠ Kaydırma `text-indent` ile YAPILMIYOR: o yalnız İLK satırı kaydırır ve başlık üç
 * satıra sarınca ikinci satır hizasız kalır. `margin-left` kutunun tamamını kaydırıyor;
 * blok zaten sola yaslı (`align-items: flex-start`), yani kayan şey optik kenardır.
 *
 * ⚠ Değerler em cinsinden: 84 px'lik bir kapakta 1,5 px, 240 px'lik bir alıntıda 4,3 px.
 * Sabit piksel yazmak, ölçek değişince yanlış olurdu (R-99 ailesi).
 */
const OPTIK_KACIK = 0.018
const OPTIK_TIRNAK = 0.055
const YUVARLAK = new Set([...'OÖCÇGQS\u015E0'])
const TIRNAKLAR = new Set([...'"\u201C\u00AB\u2018\u2019\u201D'])

/** Bir metnin optik sola kaçırma payı (em). Gerekmiyorsa 0. */
const optikPay = (metin: string): number => {
  const ilk = metin.replace(/^\*\*/, '').trimStart()[0]
  if (ilk === undefined) return 0
  if (TIRNAKLAR.has(ilk)) return OPTIK_TIRNAK
  return YUVARLAK.has(ilk) ? OPTIK_KACIK : 0
}

const vinyetGucu = (acikklik: number): number => (acikklik > 0.62 ? 18 : acikklik > 0.35 ? 26 : 34)

const koyuMu = (zemin: string, tokenCss = ''): boolean => {
  const l = tokenAcikligi(zemin, tokenCss)
  // ⚠ Eşik 0,55: oklch açıklığı algısal, yani orta gri gerçekten 0,5 civarında.
  // ⚠ Bulunamazsa ESKİ ada dayalı sezgiye düşülüyor — tahmin olduğu YAZILI.
  return l === null ? zemin.includes('line-edge') || zemin.includes('ink') : l < 0.55
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
 * Yüzey adımı — zeminden AYRIŞAN bir düzlem rengi (FAZ-19.4).
 *
 * ⚠ ⚠ **SABİT BİR TOKEN SEÇMEK İKİ KUTUPTA BİRDEN DOĞRU OLAMAZ.** Taşıyıcı alanların
 * rengi `--ramp-marka-ink-850` sabitiydi: koyu şablonda zeminden ayrışıyor, kâğıt
 * şablonda zeminin ÜSTÜNDE koyu bir leke bırakıyordu. Adım, zeminin kendi metin
 * renginden türetiliyor: koyu zeminde metin AÇIK olduğu için adım yukarı, kâğıt zeminde
 * metin KOYU olduğu için aşağı gidiyor. Tek ifade, iki kutup.
 *
 * ⚠ ⚠ **YÜZDE ÖLÇÜLDÜ.** `ink-850` (%100 opak) `#040404` zemininde `#2b2b2b` veriyor:
 * kontrast **1,32:1**, R-87'nin algısal eşiği 1,6:1'in altında. Nötr rampanın gölgede
 * yeterince ince adımı YOK — bu bir eksiklik ve FAZ-19.6'nın (palet) işi. O gelene
 * kadar adım karışımla kuruluyor.
 */
const yuzeyAdimi = (yuzde: number): string =>
  `color-mix(in oklab, var(--pano-metin) ${yuzde}%, var(--pano-zemin))`

/** Kartın renk seti — zeminden türetiliyor, seçilmiyor. */
const kartRenkleri = (
  zemin: string,
  tokenCss = '',
  paletAksani?: string
): {
  readonly metin: string
  readonly aksan: string
  readonly soluk: string
} =>
  koyuMu(zemin, tokenCss)
    ? {
        metin: METIN,
        aksan: paletAksani ?? AKSAN,
        // ⚠ Soluk metin ALFA HARMANI DEĞİL, ölçülmüş bir adım: #989898, koyu kanvasta
        // 7.12:1. Alfa ile yaklaşmak "aşağı yukarı soluk" demektir; sistem "şu kadar
        // soluk, şu kadar kontrast" diyor.
        soluk: 'var(--role-soluk-koyu, var(--role-surface))',
      }
    : // ⚠ Açık zeminde aksan MÜREKKEP: amber üstüne amber görünmez, kâğıt üstüne amber
      // ise 1,9:1 kontrast veriyor (FAZ-12.6'da ölçüldü) — WCAG AA'nın yarısı.
      {
        metin: MUREKKEP_T,
        // ⚠ ⚠ **KÂĞITTA AKSAN ARTIK MAVİ (D-318).** Eskiden mürekkepti ve gerekçesi
        // ölçülmüştü: bakır/amber aksan kâğıtta 1,9:1 veriyordu. Sistemin mavisi kâğıt
        // için AYRI bir adım taşıyor (#0b5bf0, 5.34:1) — yani artık marka rengi açık
        // zeminli slaytta da görünebiliyor ve karosel tek bir aksanla konuşuyor.
        aksan: paletAksani ?? 'var(--role-vurgu-acik, var(--role-line-edge))',
        soluk: 'var(--role-soluk-acik, var(--role-line-edge))',
      }

const MUREKKEP_T = 'var(--role-line-edge)'

/**
 * Gövde puntosunun MUTLAK TABANI, 1080 px genişlikte (R-83 · D-321).
 *
 * ⚠ Sayı bizim çıktımızdan değil GÖRME BİLİMİNDEN geliyor: kritik punto 0,20° açısal
 * x-yüksekliği (Legge & Bigelow 2011, *Journal of Vision*); 32,2 cm telefon mesafesinde
 * (Bababekova 2011) 1080 px tuvalde 36 px. Gazete kalitesi 0,23° = 40 px.
 *
 * ⚠ **Bu bir tercih değil bir EŞİK.** Altında okuma hızı çöküyor ve akışta okuma hızının
 * düşmesi kaydırıp geçmek demektir. `govdeOrani` şablonun sesidir; taban okunabilirliğin
 * şartı ve oran onu EZEMEZ.
 */
export const GOVDE_TABANI_1080 = 36

/**
 * Gövde satırının KARAKTER bandı — Butterick'in ölçüsü (R-86).
 *
 * ⚠ ⚠ **ALT SINIR ÜST SINIR KADAR ÖNEMLİ ve bu depoda eksik olan oydu.** Uzun satır
 * gözün satır başını kaybetmesine yol açıyor; ÇOK KISA satır ise gözü her satırda geri
 * döndürüp ritmi kırıyor. Ölçüldü: `donen` 19, `editoryal` 27, `sahne` 30 karakter —
 * üçü de bandın altında ve hiçbir ölçüm görmüyordu, çünkü kusur "taşma" gibi
 * görünmüyor.
 *
 * ⚠ Butterick 45–90 diyor; üst sınır 75'e çekildi: 1080 px'lik bir tuvalde 90 karakter
 * kart dolgusunu zaten aşıyor ve pratikte erişilemez.
 */
/**
 * **Dikiş dışlama bandı** — bir kimlik ögesi kesime ya UZAKTIR ya da onu EZER (R-94).
 *
 * ⚠ ⚠ **ARADA KALAN YOK ve "biraz taşsın" en kötü seçenek:** ne devamlılık kuruyor ne
 * bütünlük. Göz yarım bir ürünü ne tanıyor ne de "devamı var" diye okuyor.
 *
 * ⚠ `93` ölçülerek türetildi, seçilmedi: tek fiksasyonun net bölgesi ≈2° görsel açı;
 * bu tuvalde 2° = 186 px ve yarısı 93. Yani öge kesime 93 px'ten yakınsa okuyucunun
 * TEK bakışında kesimle birlikte düşüyor.
 *
 * ⚠ `0,40` ezme eşiği: öge kesimin İKİ yakasında da slayt genişliğinin en az %40'ını
 * kaplamalı. Tek yakada büyük olmak yetmiyor — devamlılığı kuran şey, gözün ikinci
 * slaytta AYNI kütleyi bulması.
 *
 * ⚠ Kural GÖRSELLERE bakıyor, metne değil: metnin kesimi aşması zaten ayrı ve mutlak
 * bir kusur (`kesim-uzeri-metin`), kesime yaklaşması ise güvenli alanın işi (R-88) —
 * kart dolgusu 64 px ve bu bilinçli, 93 değil.
 *
 * Kaynak: `docs/referans/arastirma-2026-08.md` böl. 1.3.
 */
/**
 * Gövde kartı başlığının kapağa oranı (R-88).
 *
 * ⚠ ⚠ **SABİT OLARAK ÇIKARILDI ÇÜNKÜ OTURMA ÖLÇÜMÜ ONU BİLMEK ZORUNDA.** CSS'te
 * gömülü kaldığı sürece `puntoOlcumu` kapağın gövdeden BÜYÜK olduğunu göremiyordu:
 * arama "hepsine sığan" tek bir punto buluyor, sonra kapak `baslikPayi` ile
 * büyütülüyordu. `editoryal`de sonuç 108'de sığan başlığın 127,4'te çizilmesiydi —
 * kapak başlığı 21 px taşıyordu ve bu, çıktının EN büyük ögesiydi.
 */
export const GOVDE_BASLIK_CARPANI = 0.82

/**
 * Kesik öznenin zeminden AYRILMA eşiği — silüetin p90 luma farkı (R-96).
 *
 * ⚠ ⚠ **SAYI SEÇİLMEDİ, OKUNDU.** Altı şablonun on iki görseli ölçüldü: çalışan
 * dokuzunda p90 **226–249**, `memphis`in üç hayaletinde **48–81**. 120, 145 birimlik
 * bir boşluğun ortasında duruyor — eşik bir tercih değil, iki kümenin arası.
 *
 * ⚠ **p90, ortalama ya da medyan DEĞİL** ve ilk iki deneme tam onları kullandı. Ortalama
 * temas gölgesini görünürlük sanıyor: hayalet figür yalnız gölgesinden seçiliyordu ve
 * ortalama "görünür" diyordu. Medyan ise ince bir özneyi (ölçüm sehpası) görünmez
 * sanıyor. Soru "ne kadar mürekkep var" değil, **"olan mürekkep ayırt ediliyor mu"**.
 */
export const ZEMINDEN_AYRISMA = 120

export const DIKIS_BANDI = 93
export const EZICI_PAY = 0.4

export const OLCU_ALT = 45
export const OLCU_HEDEF = 62
export const OLCU_UST = 75

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
      `<div class="panel${p.yayik === true ? ' yayik' : ''}"${stil}>` +
      `<div class="panel-baslik">${kacir(p.baslik)}</div>` +
      p.ogeler
        .map((o, i) => {
          const ikon = hepsiVar
            ? `<span class="liste-ikon">${ikonSvg(ikonlar[i] as IkonAdi, 'var(--kart-aksan)', 21)}</span>`
            : ''
          return (
            `<div class="liste-satir${o.aktif === true ? ' yanik' : ' sonuk'}">${ikon}` +
            `<span class="liste-no">${kacir(o.no)}</span>` +
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
// ⚠ `slaytGenisligi` EKLENDİ: kilometre durakları eğrinin y'sine oturuyor ve o hesap
// ölçekli piksel istiyor (R-99: her sayı tek tabandan). Bant fonksiyonu ölçeği
// bilmiyordu; tuval değişince duraklar eğriden kayardı.
const bantSvg = (
  b: Bant,
  toplamGenislik: number,
  yukseklik: number,
  slaytGenisligi: number
): string => {
  const olc = (px1080: number): number => Math.round((px1080 * slaytGenisligi) / 1080)
  if (b.tip === 'yok') return ''
  if (b.tip === 'olcek') {
    // ⚠ ⚠ **SVG DEĞİL CSS — ve bunu R-81 KAPISI SÖYLEDİ.** İlk sürüm çizgiyi ve
    // tırtıkları `<line>` ögeleriyle çiziyordu; `kodlanmis-oge` kapısı haklı olarak
    // kırmızıya döndü: *"jenerik öge kodlanmaz"*. Bir cetvel ÇİZİLMİŞ bir şekil değil,
    // TEKRAR EDEN bir ölçüdür — ve tekrarın dili CSS'te zaten var. `repeating-linear-gradient`
    // tırtıkları tek bildirimle veriyor, çizgi bir kenarlık: kodlanmış öge sıfır.
    //
    // ⚠ Tırtık aralığı YÜZDE: panorama ne kadar genişlerse tırtıklar da o kadar; sabit
    // piksel yazmak dört slaytta doğru, altı slaytta yanlış olurdu.
    const y = b.y
    const tirtik =
      b.aralik <= 0
        ? ''
        : `<div class="olcek-tirtik" style="top:${String(y)}%;` +
          `background-size:${String(b.aralik)}% 100%"></div>`
    return (
      `<div class="olcek-cizgi" style="top:${String(y)}%"></div>` +
      tirtik +
      b.duraklar
        .map(
          (d) =>
            `<div class="olcek-durak" style="left:${String(d.x)}%;top:${String(y)}%"></div>` +
            `<div class="olcek-etiket" style="left:${String(d.x)}%;` +
            `top:calc(${String(y)}% + 14px)">${kacir(d.etiket)}</div>`
        )
        .join('')
    )
  }
  if (b.tip === 'egri') {
    const d = b.noktalar.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')
    const dolgu = `${d} L 100 100 L 0 100 Z`
    // ⚠ ⚠ **ÇİZGİ GÖRÜNMÜYORDU: `stroke-width="0.22"` CİHAZ PİKSELİNDE.**
    // `vector-effect="non-scaling-stroke"` genişliği ölçekten kurtarıyor ama birim artık
    // cihaz pikseli — 0,22 alt piksele düşüyor ve çizgi kayboluyor. Bu, D-319'da ölçek
    // çizgisinde yaşanan hatanın BİREBİR aynısı (orada 0,12'ydi) ve araştırmanın **ikinci
    // en güçlü** taşıyıcısı (*"tek sürekli çizgi"*) bir sis olarak çiziliyordu.
    //
    // ⚠ ⚠ **DOLGU DEGRADE DEĞİL, YÜZEY ADIMI.** D-318 degradeyi, glow'u ve atmosferik
    // rengi açıkça emekli etti; bu bant o karardan sonra da bir `linearGradient` taşıyordu.
    // Eğrinin altı artık düz bir yüzey — `akan-alan`ın alan sınırıyla aynı dil.
    return (
      `<svg class="bant" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">` +
      // ⚠ ⚠ **ÖLÇÜLDÜ: `ink-950` @0,75 zeminden AYRIŞMIYOR** — `#151515` / `#151515`,
      // yani **1,00:1**. Taşıyıcı teknik olarak var, algısal olarak yok.
      // ⚠ ⚠ **YÜZEY ADIMINA ÇEVRİLDİ, ÖLÇÜLDÜ (1,74:1) ve GERİ ALINDI.** Görünür olur
      // olmaz `sus-metni-kesiyor` kırmızı döndü: eğri, `ustBaslik` kutusunun **%99,3'ünün**
      // arkasından geçiyormuş — görünmezken kimse fark etmiyordu. Çipe gerçek yüzey
      // verilince %9'a indi ama kapının eşiği %2.
      // **REÇETENİN KENDİ SIRASI YANLIŞ:** görünür taşıyıcı, z-sırası sözleşmesi ve metin
      // kutusu maskesi (`C.5`, beşinci iş) KURULMADAN çizilemez. Kapanış imzasının
      // `--punto-rakam`dan önce eklenmesiyle aynı sınıf: doğru müdahale, yanlış sırada.
      // Beşinci iş bitince bu satır `yuzeyAdimi(26)` olacak.
      `<path d="${dolgu}" fill="var(--ramp-marka-ink-950)" fill-opacity="0.75"/>` +
      // ⚠ ⚠ **6 px DENENDİ ve KAPI HAKLI OLARAK REDDETTİ.** Reçete çizgiyi 2 → 6 px
      // istiyor (*"ölçülen eğri kendi kütlesini kazansın"*) ve denendiğinde
      // `sus-metni-kesiyor` kırmızı döndü: kalın çizgi kilometre etiketinin **%96,6'sının
      // arkasından** geçiyor. **REÇETENİN KENDİ SIRASI YANLIŞ:** kalın taşıyıcı, z-sırası
      // sözleşmesi ve metin kutusu maskesi (`C.5`, beşinci iş) KURULMADAN çizilemez.
      // Bu, kapanış imzasının `--punto-rakam`dan önce eklenmesiyle aynı sınıf hata:
      // doğru müdahale, yanlış sırada, yarım sonuç. 2 px kalıyor; 6 px beşinci işte.
      // ⚠ ⚠ **RENK ARTIK ŞABLONUN PALETİNDEN, SABİT `AKSAN`DAN DEĞİL.** Reçetenin
      // ikinci işi *"köşegeni magenta yap"*tı ve gerekçesi estetik değil AYIRT
      // EDİLEBİLİRLİK: `veri-hikayesi`nin taşıyıcısı marka mavisiyle çiziliyor, yani
      // markanın geri kalanıyla karışıyordu — göz onu bir TAŞIYICI değil bir SÜS
      // olarak okuyordu. `--pano-aksan` şablonun paletinden geliyor (P5 → magenta).
      `<path d="${d}" fill="none" stroke="var(--pano-aksan)" stroke-width="2" ` +
      `vector-effect="non-scaling-stroke"/></svg>` +
      b.kilometre
        .map((k) => {
          // ⚠ ⚠ **ETİKET EĞRİNİN ÜSTÜNE OTURUYOR — eskiden SABİT bir hatta duruyordu.**
          // `.kilometre` yalnız `left` alıyordu; `bottom` CSS'te sabit 120 px'ti, yani
          // yıl pulları eğriyle HİÇ TEMAS ETMİYORDU. Denetimin sözleriyle: *"kilometre
          // etiketleri eğriye DEĞMİYOR — eksen değil LEJANT."* Bir lejant süstür;
          // eğrinin üstünde duran bir durak İDDİANIN KANITIDIR (R-107 · 19.7).
          // ⚠ y, noktalar arasında DOĞRUSAL ara değerle bulunuyor: eğri zaten düz
          // parçalardan oluşuyor (`M/L`), yani ara değer eğrinin KENDİSİ — yaklaşık değil.
          // ⚠ Ara değer ORTAK: aynı hesap panolar için de gerekiyor (`egriDibi`).
          // İki kopya, bir gün birinin unutulması demek.
          const dip = egriDibi(b.noktalar, k.x, olc)
          return (
            `<div class="kilometre" style="left:${(k.x / 100) * toplamGenislik}px;` +
            `bottom:${dip}px">` +
            `<span class="kilometre-nokta"></span>` +
            `<span class="kilometre-etiket">${kacir(k.etiket)}</span></div>`
          )
        })
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
          // ⚠ ⚠ **BASINÇ TEK YÖNLÜ AZALIYOR — ve eskiden SİMETRİKTİ.** `0,18 + 0,82·sin(tπ)`
          // iki ucu da inceltiyordu: ortası kalın, uçları sivri bir MERCEK. Dosyanın kendi
          // yorumu *"yön kıvrımdan okunuyor"* diyordu ama simetrik bir daralma yön
          // TAŞIMAZ — çizildi ve bakıldı, oklar mavi yapraklar gibi duruyordu.
          // Araştırma bu taşıyıcıyı *"YÖN VEREN ok / akış"* diye sıralıyor; yönü olmayan
          // bir ok, sıralamadaki yerini hak etmiyor.
          // ⚠ Uçta 0,20 — sıfır değil: sıfır basınç konturu kapatmıyor ve şerit ucunda
          // sivri bir artefakt bırakıyor.
          return [x, y, 0.95 - 0.75 * t]
        })
        const kontur = getStroke(nokta, {
          // ⚠ ⚠ **34 → 14: OK ARTIK BİR ŞEYE BAĞLI, kalınlık da ona göre.** Uçlar
          // boşluktayken kalın bir leke "bir şey var" diyordu; şimdi ok bir maddeden
          // çıkıp sonraki maddenin numarasına iniyor ve kalın gövde o numarayı EZİYOR.
          // Çizildi ve BAKILDI: 34'te üç şişman leke, 14'te üç kalem izi. Reçetenin
          // verdiği sayı da 14 ve gerekçesi buymuş — ok bağlandıktan sonra anlaşıldı.
          size: 14,
          thinning: 0.6,
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
        // ⚠ Ok BAŞI ayrı bir üçgen DEĞİL: şerit KALINDAN İNCEYE gidiyor ve yön o
        // azalmadan okunuyor. Üçgen bir uç, fırça şeridine yapıştırılmış bir diyagram
        // parçası olurdu — kaçtığımız şeyin ta kendisi (R-81).
        return `<path d="${d}" fill="var(--pano-aksan)" fill-rule="nonzero"/>`
      })
      .join('')
    return (
      `<svg class="bant-ok" viewBox="0 0 ${toplamGenislik} ${yukseklik}" ` +
      `preserveAspectRatio="none" aria-hidden="true">${oklar}</svg>`
    )
  }
  // ── Kemer dizisi: yatayda tekrarlayan yay, aralar eşit ──────────────────
  //
  // ⚠ ⚠ **BU BANT MODELDE VARDI, HİÇBİR ŞABLON KULLANMIYORDU — ve sebebi ÖLÇÜLDÜ.**
  // Geometri MUTLAK PİKSELLE yazılmıştı (52 ve 132 px), oysa `viewBox` tüm panorama
  // boyutunda ve `preserveAspectRatio="none"` ile 560 px'lik bir banda sıkıştırılıyor:
  // dikey **%41'e** iniyor. 132 px'lik tepe ekranda ~55 px oluyordu — dipte ince bir
  // kıvrım. Araştırmanın *"büyük geometrik form"* taşıyıcısı, bir saç çizgisi olarak
  // çiziliyordu. Kullanılmamasının sebebi tercih değil, KOORDİNAT UZAYIYDI.
  //
  // ⚠ Ölçüler artık bandın kendi yüksekliğinin PAYI: taban %10, tepe %86. Sıkışma da
  // dahil, ekranda yayın gerçek yüksekliği bandın yüksekliğine oranlı kalıyor.
  //
  // ⚠ **DOLU, ÇİZGİ DEĞİL.** Araştırma sıralamasında dolu bir form (*"silueti
  // tanınabilir, yarısı formu belirler"*) ince bir yaydan güçlü. Üst kenarda ince bir
  // kontur formu tanımlıyor; gövde çok düşük opaklıkta bir alan.
  const adim = toplamGenislik / b.sayi
  const taban = yukseklik * 0.1
  const tepe = yukseklik * 0.86
  const kemerler = Array.from({ length: b.sayi }, (_, i) => {
    const x = i * adim
    // ⚠ Sapma TEK kemerde: ikisi olsa "ritim değişti" okunur, sapma okunmaz.
    const t = b.sapma !== undefined && b.sapma.indeks === i ? tepe * b.sapma.carpan : tepe
    const yol =
      `M ${x} ${yukseklik} L ${x} ${yukseklik - taban} ` +
      `Q ${x + adim / 2} ${yukseklik - t} ${x + adim} ${yukseklik - taban} ` +
      `L ${x + adim} ${yukseklik}`
    // ⚠ TEK `<path>`, iki değil: aynı yol hem dolgu hem kontur taşıyabiliyor. İkinci bir
    // yol yazmak `kodlanmis-oge` tavanını deliyordu (R-81) ve kapı haklıydı — aynı
    // geometriyi iki kez yazmak, bir gün birini güncellemeyi unutmak demek.
    //
    // ⚠ ⚠ **DOLGU AKSAN TİNTİ DEĞİL, YÜZEY ADIMI — ve bunu ÇİZİP BAKARAK öğrendim.**
    // İlk sürüm `AKSAN` rengini %10 opaklıkla döküyordu: neredeyse siyah bir zeminde
    // mavi bir sis, kadrajda hiçbir kütle kurmuyordu. `akan-alan`ın alan sınırında aynı
    // hata ölçülmüştü (ΔL 0,03) ve çözüm oradan geliyor: dizayn sisteminin aygıtı
    // **yüzey adımı + hairline**, atmosferik bir tint değil (D-318 degradeyi ve glow'u
    // açıkça yasaklıyor).
    // ⚠ Kontur `--pano-metin`den türüyor, aksandan değil: kemer bir VURGU değil bir
    // ZEMİN formu. Aksanı forma dökmek, tek karneli aksan kuralını (D-318) deler.
    return (
      // ⚠ ⚠ **ÖLÇÜLDÜ: `ink-850` @0,55 → `#202020`, kontrast 1,16:1.** R-87 kapısı
      // yeşildi ve kemer YİNE görünmüyordu — kapı VARLIK ölçüyor, GÖRÜNÜRLÜK değil.
      // *"Teknik yeşil, algısal kırmızı."* Adım artık zeminin kendi metin renginden.
      `<path d="${yol}" fill="${yuzeyAdimi(26)}" ` +
      `stroke="${sol('--pano-metin', 30)}" stroke-width="1.5"/>`
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

/**
 * Eğrinin verilen x'teki KART DİBİNDEN yüksekliği (piksel).
 *
 * ⚠ y, noktalar arasında DOĞRUSAL ara değerle bulunuyor: eğri zaten düz parçalardan
 * oluşuyor (`M/L`), yani ara değer eğrinin KENDİSİ — yaklaşık değil.
 * ⚠ Bant dibi 120 px yukarıda ve 560 px yüksekliğinde; `y%0` bandın TEPESİ.
 */
const araDeger = (
  noktalar: readonly { readonly x: number; readonly y: number }[],
  x: number
): number => {
  const oncekiler = noktalar.filter((q) => q.x <= x)
  const onceki = oncekiler[oncekiler.length - 1] ?? noktalar[0]
  const sonraki = noktalar.find((q) => q.x >= x) ?? noktalar[noktalar.length - 1]
  const xON = onceki?.x ?? 0
  const xSON = sonraki?.x ?? 0
  const t = xSON === xON ? 0 : (x - xON) / (xSON - xON)
  return (onceki?.y ?? 0) + ((sonraki?.y ?? 0) - (onceki?.y ?? 0)) * t
}

const egriDibi = (
  noktalar: readonly { readonly x: number; readonly y: number }[],
  x: number,
  olc: (px1080: number) => number
): number => Math.round(olc(120) + ((100 - araDeger(noktalar, x)) / 100) * olc(560))

/** Panoramanın tam HTML'i — tek sayfa, `slaytSayisi × slaytGenisligi` genişlikte. */
export const panoramaHtml = (doc: PanoramaBelgesi): string => {
  const n = doc.kartlar.length
  const G = doc.slaytGenisligi
  // ⚠ Taban AÇIYA sabit, piksele değil: tuval genişledikçe piksel karşılığı büyüyor.
  const govdeTabani = Math.round((GOVDE_TABANI_1080 * G) / 1080)
  /**
   * **1080 px'lik tuvalde ölçülmüş bir sayıyı BU tuvale çevirir (R-99).**
   *
   * ⚠ ⚠ **RAY VE KİLOMETRE ÖGELERİ HİÇBİR TUVALE BAĞLI DEĞİLDİ.** Başlık ikili aramayla,
   * gövde `GOVDE_TABANI_1080` ile, panel `--panel-olcek` ile ölçekleniyordu; ama
   * `.ray-logo{24/104px}`, `.kilometre-nokta{13px}`, `.kilometre-etiket{16px}` ve rayın
   * kendi `font-size: 18px`i çıplak piksel olarak duruyordu. Tuval genişliği değişince
   * tipografi büyüyor, KROM olduğu yerde kalıyordu — 1080'de doğru görünen oran
   * 1350'de bozuluyor ve bunu ancak iki tuvali yan yana koyan biri görebilirdi.
   *
   * ⚠ Ölçek tek tabandan: `G / 1080`. İkinci bir çarpan, bir gün birinin unutulması.
   */
  const olc = (px1080: number): number => Math.round((px1080 * G) / 1080)
  const toplam = n * G
  const t = doc.tipografi ?? VARSAYILAN_TIPO
  // ── ölçü bandı (R-86): satır 45–75 karakter ────────────────────────────────
  //
  // ⚠ Ortalama karakter genişliği ≈ 0,5 em — sans yüzler için kabul gören yaklaşım ve
  // ölçümle uyuşuyor: 36 px puntoda 45 karakter ≈ 810 px çıkıyor ve tarayıcıda sayılan
  // satırlar bu civarda kırılıyor.
  // Gövde sütunu şablonun kendi kararı; verilmezse başlıkla aynı.
  const govdeSinir = Math.round(G * (t.govdeSutunu ?? t.baslikSutunu)) - 128
  /**
   * **Varış rakamının puntosu kolonundan HESAPLANIYOR — sabit yazılınca KESİLDİ.**
   *
   * ⚠ ⚠ İlk sürüm sabit 458 px yazdı ve `sahne`nin kapanışında rakam kadrajın sağ
   * kenarından TAŞTI — yani tam da bu fazın kapatmaya çalıştığı *"çizgiler yazıyı
   * kesiyor"* kusurunu kendi elimle ürettim.
   * ⚠ Sayılar TAHMİN değil ÖLÇÜM (`rakam-en.mjs`): Archivo 700 + `-0.045em` aralıkta
   * hane ilerlemesi **0,552 em**, kapak yüksekliği **0,705 em**. İki hane 458 px'te
   * 506 px yer istiyor; `sahne`nin sağ kolonu 454 px. Kolonun suçu, rakamın değil.
   */
  const sutunGenisligi = Math.max(Math.round(G * t.baslikSutunu) - 128, govdeSinir)
  /**
   * Panonun kart dibinden yüksekliği — taşıyıcı bir EĞRİ ise onun altına oturuyor.
   *
   * ⚠ Kural taşıyıcı TÜRÜNE bağlı, şablon ADINA değil: eğri taşıyıcılı her şablon aynı
   * davranıyor. Bugün tek üye var; kuralı isme bağlamak onu tek seferlik bir yama yapardı.
   */
  const panoDibi = (k: Kart, i: number): number | null => {
    // ⚠ ⚠ **KURAL YALNIZ DİPTEN KONUMLANAN YERLEŞİMLERE — ÖLÇÜM sınırı çizdi.**
    // `yerlesim: 'ust'`ta pano zaten gövdenin hemen ALTINDA; taşıyıcıya bindirmek onu
    // aşağı çekiyor ve gövdeyle arasında YENİ bir bant açıyor. `karsilastirma`da
    // denendi ve ölçüldü: kart 1 %73+8 → **%48+19**, kart 2 %51+17 → **%31+29**,
    // kapsam %76 → %73. Kural doğruydu, KAPSAMI yanlıştı.
    if (doc.yerlesim !== undefined && doc.yerlesim !== 'ayrik') return null
    if (k.panel === null || k.panel === undefined) return null
    if (k.kapanis !== undefined) return null
    const merkez = (100 * (i + 0.5)) / n
    const b = doc.bant
    const dip =
      b !== undefined && b.tip === 'egri'
        ? egriDibi(b.noktalar, merkez, olc)
        : // ⚠ `alanSiniri` KADRAJ uzayında (viewBox 0 0 100 100, `preserveAspectRatio:
          // none`), `egri` ise dibe yaslı 560 px'lik bandın içinde. İki taşıyıcı, iki
          // birim — birini ötekinin hesabıyla okumak sessizce yanlış yere koyardı.
          doc.alanSiniri === undefined
          ? null
          : Math.round(((100 - araDeger(doc.alanSiniri.noktalar, merkez)) / 100) * doc.yukseklik)
    if (dip === null) return null
    return Math.max(0, dip + olc(26) - olc(190))
  }
  const rakamPuntosu = (rakam: string): number =>
    Math.min(
      olc(458),
      Math.floor(sutunGenisligi / (0.552 * Math.max(1, rakam.replace(/\s/g, '').length)))
    )
  const olcuAlt = Math.min(govdeSinir, Math.round(govdeTabani * 0.5 * OLCU_ALT))
  const olcuHedef = Math.min(govdeSinir, Math.round(govdeTabani * 0.5 * OLCU_HEDEF))
  // ⚠ Kart dışı ögeler (kesim ayracı, kilometre etiketi, madalyon) belgenin ZEMİNİNDEN
  // türüyor; kartın kendi zemininden değil — onlar hiçbir kartın içinde durmuyor.
  const panoRenkleri = kartRenkleri(doc.alanSiniri?.alt ?? doc.zemin, doc.tokenCss, doc.aksan)
  // Künye şeridi panorama zemininin üstünde duruyor — rengi ORADAN türüyor.
  const rayRenkleri = kartRenkleri(doc.zemin, doc.tokenCss, doc.aksan)
  // ⚠ İki alanlı zeminde metin ÜST alanın üstünde duruyor (kartlar üste yaslı), o yüzden
  // renkler üst alandan türüyor. Alt alan bandın ve rakamın bölgesi.
  // ⚠ ⚠ **IIFE'DEN DIŞARI ALINDI:** `<section>` etiketini kuran IIFE kapanınca `kartZemini`
  // kapsam dışında kalıyordu ve alt raydaki marka imzası hangi logo sürümünü seçeceğini
  // soramıyordu. Değer aynı, kapsamı geniş — hesap kartın tamamına ait, açılış etiketine değil.
  const kartinZemini = (k: Kart): string =>
    doc.alanSiniri === undefined ? (k.zemin ?? doc.zemin) : doc.alanSiniri.ust
  /**
   * **İmzanın GERÇEKTEN üstünde durduğu zemin.**
   *
   * ⚠ ⚠ **YUKARIDAKİ VARSAYIM İMZA İÇİN GEÇERSİZ.** `kartinZemini` *"kartlar üste yaslı,
   * metin ÜST alanın üstünde"* diyor; kapanış bloğu ise `margin-top: auto` ile DİBE yaslı
   * ve ölçüldü: üç şablonun üçünde de dibi **y%86,8**. `alinti`de sınır o yüksekliğin
   * ÜSTÜNDEN geçiyor, yani imza ALT alanda duruyor — ve koyu logo koyu alanın üstünde
   * **ΔL 0,000** ile kayboluyordu. Kapı adıyla söyledi: `alan-siniri.test.ts`.
   * ⚠ Sınırın y'si kartın MERKEZİNDEN okunuyor; imza kartın ortasında, dibe yakın.
   */
  /**
   * ⚠ ⚠ **HER ÖGE SINIRI KENDİ YÜKSEKLİĞİNDE SORAR.** Tek bir blok değişkeni KABA kaldı
   * ve ölçüldü: kapanış bloğu iki alanı birden kaplıyor — rakam y%45-72, işaret %77-81,
   * çağrı %83-87. Bloğun tamamına alt alanın rengini vermek çağrıyı kurtarırken dev
   * rakamı AÇIK alanda AÇIK bıraktı (ΔL 0,035) ve bunu ilk kapı göremedi çünkü yalnız
   * sınırın KESTİĞİ ögeleri denetliyordu. Kapı genişletildi, kural inceltildi.
   * ⚠ Yükseklikler ÖLÇÜLDÜ (`kutu.mjs`), tahmin edilmedi.
   */
  const RAKAM_Y = 58
  const IMZA_Y = 84
  const bloktaZemin = (k: Kart, i: number, y: number): string => {
    const a = doc.alanSiniri
    if (a === undefined) return kartinZemini(k)
    return araDeger(a.noktalar, (100 * (i + 0.5)) / n) < y ? a.alt : a.ust
  }
  const imzaninZemini = (k: Kart, i: number): string => bloktaZemin(k, i, IMZA_Y)
  const kartlar = doc.kartlar
    .map(
      (k, i) =>
        ((): string => {
          const kartZemini = kartinZemini(k)
          const r = kartRenkleri(kartZemini, doc.tokenCss, doc.aksan)
          // ⚠ ⚠ **YÜZEY DÖNÜŞÜ KESİMDE DEĞİL, KARTIN SON %30'UNDA (FAZ-19.7).**
          // `donen`in kimliği kart renklerinin dönmesi; ama dönüş TAM KESİM ÇİZGİSİNDE
          // oluyordu ve bu seamless'ın TERSİ: kaydıran göz iki ayrı kare görüyor,
          // devam eden bir yüzey değil. Denetim bunu ölçtü — `donen` ve `memphis`
          // sürekliliği aktif olarak KIRIYOR.
          //
          // ⚠ Reçete dönüşü slayt MERKEZİNE öneriyor. Merkez olamaz: metin kartın sol
          // %60'ında ve metin kutbu (`kartRenkleri`) kart zemininden türüyor — geçiş
          // metnin altından geçerse aynı başlık yarısı açık yarısı koyu zeminde kalır
          // ve hiçbir tek kutup onu okunur yapamaz. Dönüş metnin BİTTİĞİ yerde başlıyor.
          //
          // ⚠ Kesimde iki taraf AYNI renkte buluşuyor: kart N %100'de sonrakinin
          // rengine varıyor, kart N+1 o renkten başlıyor. Dikiş yok; değişim kartın
          // İÇİNDE, yani kaydırırken bir vaat olarak okunuyor.
          const sonraki = doc.kartlar[i + 1]
          const sonrakiZemin = sonraki === undefined ? null : kartinZemini(sonraki)
          const kartDolgusu =
            sonrakiZemin === null || sonrakiZemin === kartZemini
              ? kartZemini
              : `linear-gradient(90deg, ${kartZemini} 0%, ${kartZemini} 70%,` +
                ` ${sonrakiZemin} 100%)`
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
          const hr = kartRenkleri(hayaletZemini, doc.tokenCss, doc.aksan)
          return (
            // ⚠ ⚠ **KAPAK AYRI BİR SINIF ALIYOR (`ilk`) ve sebebi tipografik.** Markanın
            // dizayn sistemi Source Serif 4'e TEK bir iş veriyor: pazarlama sayfasının
            // H1'i — "başka hiçbir yer". Karoselde o H1 kapak başlığıdır; gövde
            // slaytlarının başlıkları BÖLÜM başlığıdır ve Montserrat'ın işidir.
            // Sınıf olmadan bu ayrım kurulamıyordu.
            `<section class="kart${koyuMu(kartZemini, doc.tokenCss) ? '' : ' acik'}` +
            `${i === 0 ? ' ilk' : ''}` +
            `${k.kolon === 'sag' ? ' sag' : ''}` +
            // ⚠ ⚠ **PAY BLOĞA DEĞİL KARTA veriliyor ve sebebi bir TESTİN kırılması.**
            // İlk sürüm `margin-left: -0.018em`i yalnız `.baslik`e koydu; `aile-tutarliligi`
            // *"metin blokları TEK sol kenarı paylaşıyor"* diyerek kırmızı döndü ve HAKLIYDI.
            // Optik hizalama bir blok değil bir YIĞIN işidir: yığının algılanan sol kenarını
            // en büyük öge — başlık — belirler, ötekiler ona uyar. Kaydırma `em` de olamaz;
            // her bloğun puntosu farklı, aynı `em` farklı piksel demek. `--baslik-punto`
            // üstünden PİKSEL: üç blok da birebir aynı kadar kayıyor, kenar tek kalıyor.
            `${optikPay(k.baslik) === 0 ? '' : optikPay(k.baslik) > 0.03 ? ' optik-tirnak' : ' optik-yuvarlak'}" ` +
            `style="left:${i * G}px;width:${G}px;` +
            // ⚠ Lekeler ya da alan sınırı varsa kart ŞEFFAF: opak bir kart arkasındaki
            // desen katmanını tamamen örtüyordu ve `memphis`in kimliği görünmüyordu.
            `background:${
              k.zemin !== undefined ||
              (doc.alanSiniri === undefined &&
                (doc.lekeler ?? []).length === 0 &&
                doc.zeminDokusu === undefined)
                ? kartDolgusu
                : 'transparent'
            };` +
            // ⚠ Kartın zemini CSS DEĞİŞKENİ olarak da yazılıyor: dip vinyeti onu
            // referans alıyor ve sabit bir renge bağlanmıyor (açık zeminli şablonda
            // siyah bir vinyet tasarımı bozardı).
            `--kart-zemin:${kartZemini};` +
            // ⚠ ⚠ **PANOLAR EĞRİYİ BİNİYOR — denetimin "sürekli ögeye DEĞSİN" şartı.**
            // Ölçüldü: `veri-hikayesi`nin altı karesinin BEŞİNDE ölü bant %26-%35 ve hepsi
            // aynı yerde (y%31-34). Sebep kompozisyonun kendi mantığına aykırıydı: eğri
            // panorama boyunca YÜKSELİYOR, panolar ise dipte DÜZ duruyordu. Boşluk tam
            // olarak eğrinin OLMADIĞI yerdi.
            // ⚠ Pano artık kendi kartının merkezinde eğrinin altına oturuyor: kart kart
            // yükseliyor, taşıyıcıya değiyor ve boşluk her karede BAŞKA yere düşüyor —
            // "art arda iki slaytta bant aynı yerde başlayamaz" kuralı da bundan çıkıyor.
            // ⚠ Kapanış kartı MUAF: orada pano varış rakamıyla yer paylaşıyor (o kartın
            // ölü bandı zaten %6) ve ikisini birden yükseltmek çakışma üretirdi.
            // ⚠ ⚠ **`--pano-ust: auto` ZORUNLU ve eksikliği ÖLÇÜMLE görüldü.** `yerlesim:
            // 'ust'` panoyu ÜSTTEN konumluyor; orada `margin-bottom` hiçbir şeyi
            // yukarı taşımıyor — `karsilastirma`da pano gövdenin hemen altında kaldı ve
            // altında %17'lik yeni bir bant açıldı. Taşıyıcıyı binmek, panonun DİPTEN
            // ölçülmesini gerektiriyor.
            `${panoDibi(k, i) === null ? '' : `--pano-ust:auto;--pano-dip:${String(panoDibi(k, i))}px;`}` +
            // ⚠ ⚠ **KAPANIŞ KARTINDA METİN KOLONU GÖRSELE KADAR DARALIYOR.** Kapanış
            // gövdeyi YUKARI itiyor (varış rakamına yer açmak için) ve `donen`de gövde
            // tam o yükseklikte duran görselin ÜSTÜNE bindi: `metin-gorsel-cakisiyor`
            // *"gövdenin %47'si görselin üstünde"* dedi. Gövde kartların altında dururken
            // görselin ALTINDA kaldığı için sorun görünmüyordu; yer değişince çıktı.
            // ⚠ Görselin sol kenarı ÖLÇÜLEREK bulunuyor (panorama % → kart pikseli), bir
            // sabit yazılmıyor: dört görsel dört ayrı x'te ve her şablonda başka.

            `--kart-metin:${r.metin};` +
            `--kart-aksan:${r.aksan};--kart-soluk:${r.soluk};` +
            // ⚠ ⚠ **KAPANIŞ BLOĞU KENDİ ALANININ RENGİNİ SORUYOR.** `imzaninZemini` marka
            // işareti için kurulmuştu; kapı sınırı yükseltince bir sonraki ögeyi adıyla
            // söyledi: dev varış rakamı da ΔL 0,000 ile alt alanda kayboluyordu. Kural
            // ögeye değil BLOĞA ait — kapanış bloğunun tamamı dibe yaslı ve sınır onun
            // üstünden geçtiğinde hepsi alt alanda duruyor.
            // ⚠ Alan sınırı yoksa değerler kartın kendi renkleriyle AYNI: kural yalnız
            // iki alanlı zeminde bir şey değiştiriyor.
            ((): string => {
              const rz = kartRenkleri(bloktaZemin(k, i, RAKAM_Y), doc.tokenCss, doc.aksan)
              const iz = kartRenkleri(imzaninZemini(k, i), doc.tokenCss, doc.aksan)
              return `--kapanis-rakam-metin:${rz.metin};--kapanis-metin:${iz.metin};`
            })() +
            `--hayalet-renk:${hr.metin}">`
          )
        })() +
        `<div class="hayalet" aria-hidden="true" ` +
        `style="--hayalet-punto:${Math.round(hayaletPuntosu(k.hayalet, doc.hayaletKonumu?.olcek ?? 1))}">` +
        `${kacir(k.hayalet)}</div>` +
        // ⚠ ⚠ **EL YAZISI SATIRI EMEKLİ (D-317).** Markanın dizayn sistemi dört aile
        // tanımlıyor ve hiçbiri el yazısı değil; "tipografik süs yok" anti-desenler
        // listesinin ilk maddesi. Kapağın hiyerarşisi artık YÜZ FARKINDAN değil,
        // sistemin kendi merdiveninden geliyor: mono eyebrow → serif H1 → sans gövde
        // → mono künye. Alan belge modelinden de kalktı; yarım bırakılan bir alan
        // bir gün yeniden çizilirdi.
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
        // ⚠ Kapanış bloğu panelin ARDINDAN, rayın ÖNÜNDEN giriyor: imza içeriğin sonudur,
        // künyenin parçası değil. Marka kilidi kart zeminine göre renk alıyor.
        (k.kapanis === undefined
          ? ''
          : `<div class="kapanis">` +
            // ⚠ SIRA: rakam → okuma → imza + çağrı. Ölçüm bu sırayı dayattı (yukarıda).
            (k.kapanis.rakam === undefined
              ? ''
              : `<div class="kapanis-varis"><div class="kapanis-rakam" ` +
                `style="font-size:${String(rakamPuntosu(k.kapanis.rakam))}px">` +
                `${kacir(k.kapanis.rakam)}</div>` +
                (k.kapanis.rakamAlt === undefined
                  ? ''
                  : `<div class="kapanis-rakam-alt">${kacir(k.kapanis.rakamAlt)}</div>`) +
                `</div>`) +
            // ⚠ ⚠ **GERÇEK LOGO, ELLE ÇİZİLMİŞ "U" DEĞİL.** İlk sürüm `markaKilidi()`
            // çağırıyordu — o, SVG ile çizilmiş bir harf ve altına küçük bir ad yazıyor.
            // Depo sahibi çıktıya bakıp *"orantısız ve çirkin, ayrıca kendi logolarımız
            // zaten var, onlar nerede?"* dedi ve haklıydı: `brand/brd_upcytech/logo/`
            // altında gerçek marka işareti duruyor ve künye şeridi onu ZATEN kullanıyor.
            // Marka varlığı dururken harf çizmek, tam olarak bu fazın yasakladığı şey.
            (doc.logo === undefined
              ? ''
              : `<img class="kapanis-isaret" src="${kacir(
                  koyuMu(imzaninZemini(k, i), doc.tokenCss) ? doc.logo.koyu : doc.logo.acik
                )}" alt="Upcytech">`) +
            `<p class="kapanis-cagri">${vurguyuIsaretle(kacir(k.kapanis.cagri))}</p>` +
            `</div>`) +
        `<div class="ray">` +
        (doc.logo === undefined
          ? ''
          : `<img class="ray-logo" src="${kacir(
              koyuMu(kartinZemini(k), doc.tokenCss) ? doc.logo.koyu : doc.logo.acik
            )}" alt="Upcytech">`) +
        // ⚠ Sınıflar AÇIK: küçülme hakkı yalnız ORTA metne ait. `nth-child` ile
        // hedeflemek, logo varken/yokken farklı öğeyi kırpardı.
        // ⚠ ⚠ **KÜNYE SADELEŞTİ — depo sahibinin isteği.** Alt rayda dört şey birden
        // vardı: kategori etiketi (İDDİA), virgüllü kaynak listesi
        // (`upcyman.com, api.upcyman.com`), ifşa ve sayaç. Depo sahibi: *"tek konuyla
        // alakalı mesele upcyman.com yazsın yeter"*. Kategori etiketi zaten kartın
        // üst başlığında duruyor; aynı bilgiyi iki kez basmak künyeyi gürültüye çevirir.
        //
        // ⚠ Alan MODELDE kalıyor: boş değilse yine çiziliyor. Şablonu olan bir kayıt
        // onu kullanmak isteyebilir; varsayılan olarak boş geliyor.
        (k.rayaSol.trim() === '' ? '' : `<span class="ray-sol">${kacir(k.rayaSol)}</span>`) +
        // ⚠ ⚠ **BOŞ KAYNAK SESSİZ OLAMAZ (R-104).** Önceki sürüm boş bir `<span>`
        // basıyordu: hiçbir şey çizilmiyor, slayt kusursuz GÖRÜNÜYOR ve kaynağını
        // kaybetmiş oluyordu. Sistemin tek imzası kaynak satırıdır (§8); eksikliği
        // gizlenirse imzasız bir çıktı imzalı sanılır. Kesikli kutu, insan kapısının
        // GÖRECEĞİ bir boşluk bırakıyor — yer tutucu görselle aynı gerekçe.
        (k.rayaOrta.trim() === ''
          ? `<span class="ray-orta ray-orta-bos">${kacir(KAYNAK_YOK_METNI)}</span>`
          : `<span class="ray-orta">${kacir(k.rayaOrta)}</span>`) +
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
      // ⚠ ⚠ **ZİNCİR GÖRSEL BAŞINA SEÇİLİYOR — belge başına DEĞİL.** Görseller kartların
      // DIŞINDA, ayrı bir katmanda yaşıyor ve hiçbir kartın rengini miras almıyorlar.
      // Yani "bu özne açık bir kâğıdın mı yoksa koyu bir mürekkebin mi üstünde duruyor"
      // sorusunun cevabı yalnız KONUMDAN gelir. Sormayan bir tema uyumu, adı uyum olsa
      // bile uyum değildir (R-96).
      const merkez = ((g.x + g.genislik / 2) / 100) * toplam
      const kartIndeks = Math.min(
        doc.kartlar.length - 1,
        Math.max(0, Math.floor(merkez / doc.slaytGenisligi))
      )
      const altKart = doc.kartlar[kartIndeks]
      const acikKart = altKart !== undefined && !koyuMu(kartinZemini(altKart), doc.tokenCss)
      const zincir = islemZinciri(doc.gorselIslemleri ?? [], acikKart)
      return (
        `<img class="gorsel ${g.kirpma}" style="${stil}${zincir === '' ? '' : `;filter:${zincir}`}" ` +
        `src="${kacir(g.src)}" alt="${kacir(g.alt)}">`
      )
    })
    .join('')

  // Bitiş dokusu: kartların ÜSTÜNDE, tıklamayı ve metni ETKİLEMEDEN.
  // ⚠ ⚠ **KOŞULSUZ (FAZ-19.4).** Eskiden `doc.ustDoku` verilirse çiziliyordu ve
  // **hiçbir yerde verilmiyordu** — alan yazılmış, üretim yolunda üreticisi yoktu.
  // Ölçüldü: on kapağın %67,7–%92,3'ü tek bir RGB değeri. Grenin ÜSTTE olması bir
  // tercih değil zorunluluk: `zeminDokusu` opak kartın altında kalıyor, `donen`in
  // kart renkleri panorama zeminini tamamen örtüyor. Film greni sahnenin değil
  // FİLMİN özelliğidir. `ustDoku` alanı artık yalnız ŞİDDET AYARI.
  // ⚠ ⚠ **İKİ AYRI KARDEŞ, İÇ İÇE DEĞİL — ve bunu ÖLÇÜM öğretti.** İlk sürüm greni
  // `.ust-doku::before`e koydu: `.ust-doku` `position:absolute` + `z-index` taşıdığı
  // için KENDİ yığın bağlamını kuruyor ve çocuğun `mix-blend-mode`u kartlarla değil
  // ŞEFFAF EBEVEYNİYLE karışıyor — yani hiç karışmıyor. Sonuç ölçüldü: `#040404`
  // zemin `#5c5c5c`ye çıktı, on kapakta R-105 (metin zemine karışıyor) patladı.
  // **Gren kaybolmamıştı; GRİ PERDE olmuştu.** Kardeş olarak `#sahne`in bağlamında
  // duruyorlar ve altlarındaki her şeyle karışıyorlar.
  const ustDoku =
    `<div class="ust-gren" aria-hidden="true"></div>` +
    `<div class="ust-vinyet" aria-hidden="true"></div>`

  // Geometrik lekeler: tek SVG, panorama koordinatında. Kartların ALTINDA (z-index 0)
  // duruyorlar — metnin üstüne çıkan bir leke okunabilirliği düşürür.
  // ⚠ ⚠ **HACİM İÇİN GEREKEN ŞEY DEGRADE + GÖLGE, ÜÇÜNCÜ BİR BOYUT DEĞİL.** Bu
  // karosellerde "3D element" denen şeyin görsel imzası: yumuşak bir degrade, tek yönlü
  // bir ışık ve zemine düşen bir gölge. Üçü de SVG'de var; bir 3B motor (three.js +
  // GLB) ikinci bir render motoru demek olurdu (Yasa 4) ve tek bir öge için orantısız.
  // ⚠ ⚠ **BLOB LEKESİ EMEKLİ (D-342).** Yorumu *"hacim için gereken şey DEGRADE +
  // GÖLGE"* diyordu ve D-318 tam olarak onları emekli etti: degrade, glow ve atmosferik
  // renk. Karar verildi, bu dal kaldı — ve kataloğun HİÇBİR şablonu onu kullanmıyordu.
  // D-306'nın madalyonuyla aynı gerekçe: kullanılmayan, sonraki bir kararla çelişen ve
  // R-81'in tam hedefinde duran bir süs.
  // ⚠ Kaldırılması `kodlanmis-oge` tavanını da rahatlattı: alan sınırının hairline'ı
  // yedinci yolu getiriyordu ve yer açan şey bir gevşetme değil, ÖLÜ KODUN gitmesi oldu.

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
          // ⚠ ⚠ **SINIRDA HAIRLINE VAR ve eskiden YOKTU.** Dizayn sisteminin kendi aygıtı
          // *"yüzey adımı + 1 px hairline"* (D-319'da alıntılı); burada yalnız adım vardı.
          // Yakın-monokrom bir palette (D-318) adım kaçınılmaz olarak sessiz kalıyor ve
          // `akan-alan`ın iki alanı arasında **ΔL 0,03** ölçüldü — kimliği "iki renk alanı"
          // olan bir şablonun iki alanı ayırt edilemiyordu. Çizilmiş bir kenar, sessiz bir
          // adımı OKUNUR yapıyor: kâğıdın katlandığı yer gibi.
          //
          // ⚠ `vector-effect="non-scaling-stroke"` ZORUNLU: `viewBox` 100×100 ve
          // `preserveAspectRatio="none"` ile 6480×1350'ye geriliyor; ölçeklenen bir kontur
          // yatayda kalın dikeyde saç teli olurdu. Genişlik CİHAZ pikselinde okunuyor —
          // 0,12 gibi bir değer alt piksele düşüp KAYBOLUYOR (D-319'un dersi).
          const kenar = `${sol('--pano-metin', 22)}`
          return (
            `<svg class="alan-siniri" viewBox="0 0 100 100" preserveAspectRatio="none" ` +
            `aria-hidden="true"><rect x="0" y="0" width="100" height="100" fill="${a.ust}"/>` +
            `<path d="${d} L 100 100 L 0 100 Z" fill="${a.alt}"/>` +
            `<path d="${d}" fill="none" stroke="${kenar}" stroke-width="1" ` +
            `vector-effect="non-scaling-stroke"/></svg>`
          )
        })()

  // Panoramanın taban açıklığı — gren opaklığı ve vinyet gücü buradan (FAZ-19.4).
  // ⚠ Bulunamazsa 0,12: on şablonun altısında taban zaten mürekkep, ve yanlış tarafa
  // düşmek greni GÖRÜNÜR yapar, YOK etmez. Sessiz kayıp, görünür fazlalıktan kötüdür.
  const zeminAcikligi = tokenAcikligi(doc.zemin, doc.tokenCss) ?? 0.12

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
    FILTRE_TANIM_CSS,
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
    // ⚠ ⚠ **GREN OPAKLIĞI YÜZEY LUMİNANSINDAN — ve luminans TOKEN'IN DEĞERİNDEN
    // okunuyor, ADINDAN değil.** `--ramp-marka-ink-900` `oklch(0.205)`, `-880` ise
    // `oklch(0.190)`: numara büyüdükçe koyulaşmıyor. Belgede token yoksa (`null`)
    // koyu taban varsayılıyor — bu şablonların dokuzunda taban zaten mürekkep, ve
    // yanlış tarafa düşmek greni GÖRÜNÜR yapar, YOK etmez.
    ...(doc.zeminDokusu === undefined
      ? []
      : [
          `           background: ${zeminCss(doc.zeminDokusu, tokenAcikligi(`var(${doc.zeminDokusu.taban})`, doc.tokenCss) ?? 0.12)};`,
          `           background-blend-mode: ${zeminKarisimi(doc.zeminDokusu)};`,
        ]),
    `           --pano-metin: ${panoRenkleri.metin}; --pano-aksan: ${panoRenkleri.aksan};`,
    // ⚠ Zemin de DEĞİŞKEN: yüzey adımı (`yuzeyAdimi`) onu metin rengiyle karıştırıyor.
    // Sabit bir token kullanılsaydı adım kâğıt şablonda ters yöne giderdi.
    // ⚠ ⚠ **KÜNYE ŞERİDİ KARTIN DEĞİL PANORAMANIN ÖGESİ (FAZ-19.7).** Şerit rengini
    // kart zemininden alıyordu ve `donen`de kart zemini dönüyor: kesim çizgisinde
    // ÖLÇÜLEN fark **636/765** — yüzeyin kendisi kesimde 3–24'e inmişken şerit hâlâ
    // siyahtan beyaza atlıyordu. Bir seamless karoselde her kesimde renk değiştiren bir
    // altbilgi, kesimin KENDİSİNİ çiziyor. Şerit artık panorama boyunca TEK yüzey:
    // kaydırırken yerinde duran bir ray, altında akan bir tuval.
    `           --pano-zemin: ${doc.zemin};`,
    // ⚠ ⚠ **RAY METNİ RAYIN KENDİ ZEMİNİNDEN TÜRÜYOR, `panoRenkleri`NDEN DEĞİL.**
    // İlk sürüm `panoRenkleri`ni kullandı ve `alinti` altı kusur döktü (R-95): o
    // renkler `alanSiniri.alt`tan, yani KOYU kamadan türüyor — ray zemini ise kâğıt.
    // Açık üstüne açık. Kural her yerde aynı: **renk, ögenin oturduğu yüzeyden türer.**
    `           --ray-zemin: ${doc.zemin}; --ray-metin: ${rayRenkleri.metin};`,
    `           --ray-aksan: ${rayRenkleri.aksan}; }`,
    // ── tipografi reçetesi: değişkenler ÖNCE, kullanımlar sonra ───────────────
    // ⚠ ⚠ **GENİŞLİK EKSENİ KALKTI (D-317).** Sistemin dört ailesinin hiçbirinde `wdth`
    // yok; olmayan bir ekseni CSS'e yazmak sessiz bir yalan olurdu — tarayıcı
    // `font-stretch`i kırpar, reçete "78" der, çıktı 100'dür. Türkçe'de punto satın
    // alan mekanizma artık yalnız ÖLÇÜLEN tavan (`puntoTavani`) ve kısa başlık disiplini.
    `  #sahne { --baslik-wght: ${t.baslikAgirlik};`,
    `           --baslik-lh: ${t.satirAraligi}; --baslik-ls: ${t.harfArasi}em;`,
    `           --govde-orani: ${t.govdeOrani};`,
    // ⚠ Başlangıç değeri; gerçek punto render sonrası ÖLÇÜLEREK yazılıyor (`puntoTavani`).
    `           --baslik-punto: ${Math.round(96 * t.baslikPayi)}px;`,
    `           --panel-kok: ${t.panelPayi ?? 1};`,
    // ⚠ ⚠ **`--panel-olcek` KÖKTEN TÜREYEN bir çarpım oldu.** Eskiden doğrudan
    // şablonun payıydı; elle ayar onu EZECEKti ve şablonun kendi payı kaybolurdu.
    // Şimdi taban `--panel-kok`ta duruyor, elle ayar `--ayar-olcek` ile ÇARPIYOR.
    `           --panel-olcek: var(--panel-kok); }`,
    // ⚠ Kart bir FLEX SÜTUNU: panel `margin-top:auto` ile aşağı itiliyor ve kartın alt
    // yarısı boş kalmıyor. İlk render'da her şey üste yığılmış, alt %60 bomboştu.
    // ⚠ ⚠ **ÜST DOLGU 68 → 80 px (R-88).** 4:5 güvenli alanı üst/alt 80, yan 60 istiyor
    // ve 68 eşiğin 12 px altındaydı. Sayı ızgara kırpmasıyla da uyumlu: profil
    // ızgarası 4:5'i her yandan **34 px** kırpıyor (1080 → 1012, iki bağımsız kaynak),
    // yani 80 hem güvenli alanı hem kırpmayı karşılıyor.
    // ⚠ Yan 64 zaten 60'ın üstünde; alt 190 rayı ve sayacı taşıyor.
    `  .kart { position: absolute; top: 0; height: ${doc.yukseklik}px;`,
    `          padding: ${olc(80)}px ${olc(64)}px ${olc(190)}px;`,
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
    // ⚠ ⚠ **SAĞ KART "SAĞA İTİLMİŞ KUTULAR" DEĞİL, BİR SÜTUNDUR — ve fark ÖLÇÜLDÜ.**
    // `align-items: flex-end` her bloğu AYRI AYRI sağa itiyordu; kutular içeriklerine
    // göre daralınca üç bloğun üç ayrı sol kenarı oluyordu. Ölçüm: sol yaslı kartların
    // hepsinde etiket ve gövde başlıkla aynı sol kenarda (0 · 0); sağ yaslı DÖRT kartın
    // dördünde de kaymış — `sahne` 2/4 (+343), `kavis` 3 (+538, gövde −64),
    // `karsilastirma` 2 (+597, gövde +108). Üç şablon, tek sebep.
    // ⚠ Çözüm hizalamayı değiştirmek değil, SÜTUNU kurmak: kart sola yaslı kalıyor,
    // sol dolgu sütunu sağ yakaya taşıyor. Böylece üç blok tek sol kenarı paylaşıyor ve
    // metin kendi kutusunda solda kalıyor — `text-align` dokunulmadan duruyor.
    // ⚠ Sütun İKİSİNİN BÜYÜĞÜ: başlık kolonu ile gövde ölçü sınırı farklı olabiliyor
    // (`govdeSutunu`); küçüğünü almak geniş olanı sağdan taşırırdı. → R-113
    `  .kart.sag { align-items: flex-start;`,
    `              padding-left: ${String(Math.max(0, G - olc(64) - Math.max(Math.round(G * t.baslikSutunu) - 128, govdeSinir)))}px }`,
    `  .kart.sag > * { text-align: left }`,
    // ⚠ ⚠ **KAPANIŞ İMZASI — ölçülerek eklendi.** Dört şablonda son kare destenin en boş
    // karesiydi (%2,1 … %4,7). Marka kilidi burada GERÇEK boyda duruyor; künye şeridinin
    // 20 px'lik logosu bir altbilgidir, imza değil.
    // ⚠ `margin-top: auto` imzayı içeriğin ALTINA itiyor ama rayın üstünde tutuyor.
    `  .kapanis { margin-top: auto; display: flex; flex-direction: column;`,
    `             gap: ${olc(26)}px; align-items: flex-start }`,
    // ⚠ İşaret gerçek logo dosyası; yüksekliği sabit, genişliği oranından geliyor.
    // ⚠ ⚠ **RAKAM PUNTOSU KAPAK YÜKSEKLİĞİNDEN GERİYE HESAPLANIYOR.** Archivo'nun kapak
    // oranı ~0,72 em; 330 px kapak için punto ≈ 458 px. "Punto 330" yazmak kadrajda
    // 238 px'lik bir rakam üretirdi — hedefin üçte ikisi. Ölçülen şey harfin BOYU.
    `  .kapanis-varis { display: flex; flex-direction: column; gap: ${olc(14)}px }`,
    // ⚠ Punto işaretlemede satır içinde veriliyor (kolondan hesaplanıyor); buradaki
    // değer yalnız yedek — kesilmiş bir rakam, küçük bir rakamdan kötüdür.
    `  .kapanis-rakam { font-family: 'Marka Baslik', sans-serif; font-size: ${olc(458)}px;`,
    `                   line-height: 0.84; font-weight: 700; letter-spacing: -0.045em;`,
    `                   color: var(--kapanis-rakam-metin, var(--kart-metin));`,
    `                   font-feature-settings: 'tnum' 1, 'locl' 1 }`,
    `  .kapanis-rakam-alt { font-family: 'Marka Mono', ui-monospace, monospace;`,
    `                       font-size: ${olc(24)}px; letter-spacing: 0.14em;`,
    `                       color: color-mix(in oklab, var(--kapanis-rakam-metin, var(--kart-metin)) 62%, transparent) }`,
    `  .kapanis-isaret { height: ${olc(64)}px; width: auto; display: block }`,
    `  .kapanis-cagri { margin: 0; font-family: 'Marka Baslik', sans-serif;`,
    `                   font-size: ${olc(44)}px; line-height: 1.24; font-weight: 500;`,
    `                   letter-spacing: -0.012em; color: var(--kapanis-metin, var(--kart-metin));`,
    `                   max-width: ${olc(760)}px }`,
    // ⚠ `margin-top: auto` YALNIZ `ust` yerleşiminde: diğer üçünde panel'i dibe iten bu
    // kural `justify-content`i ezip yerleşimi anlamsız kılıyordu (yazıldı, bakıldı, görüldü).
    ...(doc.yerlesim === undefined || doc.yerlesim === 'ayrik'
      ? [
          `  .panel, .sayilar, .etiketler { margin-top: var(--pano-ust, auto); margin-bottom: var(--pano-dip, 0px) }`,
        ]
      : [
          `  .panel, .sayilar, .etiketler { margin-top: var(--pano-ust, calc(var(--taban, ${olc(54)}px) * 2)); margin-bottom: var(--pano-dip, 0px) }`,
        ]),
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
    // ⚠ ⚠ **GREN PANORAMANIN TAMAMINA TEK KATMAN.** `.ust-doku` `#sahne`in çocuğu ve
    // `inset: 0` panorama genişliğini kaplıyor — slayt başına verilseydi doku FAZI her
    // kesimde sıfırlanır ve dilimler ayrı ayrı çekilmiş gibi görünürdü. Vinyet için de
    // aynısı geçerli: slayt başına vinyet, her kesimde bir karartma halkası demektir.
    // ⚠ Opaklık yüzey açıklığının FONKSİYONU (`grenOpakligi`): sabit opaklık mürekkep
    // zeminde σ≈0,70 üretiyor ve σ<1,0 gren JPEG tarafından SİLİNİYOR.
    // ⚠ Vinyet gücü zemine göre: kâğıt 18 · orta 26 · mürekkep 34 — koyu yüzey daha çok
    // kaldırıyor. `doc.ustDoku` verilirse o kazanır (şablon kendi şiddetini seçebilir).
    // ⚠ ⚠ **GREN VE VİNYET AYRI KATMAN — tek elemanda birleştirilemezler.** Gren
    // `soft-light` ister (yüzeyi kırar, karartmaz), vinyet `normal` ister (kenarı
    // GERÇEKTEN karartır). İkisi tek `mix-blend-mode` altında toplansaydı vinyet de
    // soft-light'a düşer ve kenar toplama işini yapmazdı — ölçülmeden fark edilmez.
    // Vinyet: kenarları toplayan tek radyal. Merkez ŞEFFAF — ortadaki içeriği
    // karartmayan bir vinyet, kadrajı daraltır ama okunurluğu düşürmez.
    `  .ust-gren, .ust-vinyet { position: absolute; inset: 0; pointer-events: none }`,
    // ⚠ ⚠ **YÜZEY VARSA GREN DEĞİL O ÇİZİLİYOR.** Gren her yüzeyin ortak tabanı; yüzey
    // ailesi onun ÜSTÜNE malzemenin kendi imzasını koyuyor (kâğıt lifi, taş damarı,
    // beton tanesi, fırça izi, tram noktası). İkisi birden çizilseydi doku iki kez
    // toplanır ve `beton` ile `kagit` yine birbirine benzerdi.
    ...(doc.yuzey === undefined
      ? [
          `  .ust-gren { z-index: ${Z.gren}; mix-blend-mode: ${grenKipi(zeminAcikligi)};`,
          `              background: ${grenKatmani(doc.ustDoku?.gren ?? grenOpakligi(zeminAcikligi) * 100)} }`,
        ]
      : (() => {
          const y = yuzeyKatmanlari(
            doc.yuzey,
            doc.ustDoku?.gren ?? grenOpakligi(zeminAcikligi) * 100
          )
          return [
            `  .ust-gren { z-index: ${Z.gren}; mix-blend-mode: ${grenKipi(zeminAcikligi)};`,
            `              background-image: ${y.katmanlar.join(', ')};`,
            `              background-size: ${y.boyutlar.join(', ')};`,
            `              background-blend-mode: ${y.kipler.join(', ')};`,
            `              filter: ${doc.yuzey === 'halftone' ? 'contrast(8) grayscale(1)' : 'none'} }`,
          ]
        })()),
    `  .ust-vinyet { z-index: ${Z.vinyet};`,
    `              background: radial-gradient(120% 80% at 50% 45%, transparent 52%,` +
      ` rgba(0,0,0,${((doc.ustDoku?.vinyet ?? vinyetGucu(zeminAcikligi)) / 100).toFixed(2)}) 100%) }`,
    // ⚠ ⚠ **KAYNAK PNG'LER 500x500'DÜ ve işaret onun yalnız %2,4'ünü kaplıyordu.** Rayda
    // 26px yüksekliğe sığdırılınca işaret ~4px kalıyor ve okunmuyordu — render'a bakınca
    // görüldü. Dosyalar ALFA KUTUSUNDAN kırpıldı (338x78, oran 4,33); kaynaklar
    // `*-kaynak.png` olarak duruyor. ⚠ İki sürüm ORTAK kutuyla kırpıldı: ayrı kutular
    // farklı oranlar verir ve zemin değişince logo bir slayttan ötekine ZIPLAR.
    `  .ray-logo { height: ${olc(24)}px; width: ${olc(104)}px; object-fit: contain;`,
    `              object-position: left;`,
    `              flex: none; opacity: 0.92 }`,
    // ⚠ ⚠ **KESİM AYRACI KALDIRILDI — ÜRETİM DİLİMLERİNE SIZIYORDU (D-300).** Ayraç
    // panoramayı bütün hâlde incelerken kesim yerini göstersin diye vardı. Ama dilimleme
    // `translateX(-i × G)` ile yapılıyor ve `left: i × G` konumundaki 1 px'lik çizgi
    // TAM OLARAK (i+1). slaydın SIFIRINCI sütununa düşüyor. Ölçüldü: `derived/blobs`
    // altındaki gerçek bir üretim slaydında sütun 0, sütun 2'den **+11,3** daha parlak —
    // her slaydın sol kenarında hayalet bir hairline yayınlanmış.
    // **Görüntüleme yardımcısı çıktıya sızarsa yardımcı değil, kusurdur.**
    // ── EYEBROW: mono, BÜYÜK HARF, +0.08em (dizayn sistemi §7 · D-317) ────────
    //
    // ⚠ ⚠ **BU SATIR SİSTEMİN İMZASININ YARISI.** Sistem `eyebrow` ve `micro` için tek
    // bir kural yazıyor: "mono only and uppercase only". Bir cümle, bir başlık ya da
    // bir isim tamlaması buraya GİREMEZ — o zaman en az 12px Plus Jakarta olur.
    // ⚠ Renk SOLUK, aksan DEĞİL: aksan karoselde karneli (kapak vurgusu + süreklilik
    // ögesi + sayaç). Eyebrow'u da aksana boyamak, karneyi üçe katlardı.
    `  .ust-baslik { font-family: "Marka Mono", ui-monospace, monospace;`,
    `                font-size: calc(20px * var(--ayar-olcek, 1));`,
    `                letter-spacing: 0.08em; text-transform: uppercase;`,
    `                font-feature-settings: ${OPENTYPE_CSS};`,
    // ⚠ ⚠ **BOŞLUK RİTMİ 1:3 — eşit boşluk, boşluk YOKLUĞUDUR (tasarım rehberi §2).**
    // Önceki değerler 26 / 24 / 34 px idi: üçü de birbirine denk ve göz hiçbir grup
    // göremiyordu. Bu, çıktının "web sayfası gibi" durmasının en büyük tek sebebiydi —
    // renk eklemek çözmüyor çünkü sorun renkte değil ritimde. Üst başlık başlığa YAPIŞIK
    // (14 px, aynı grup), başlık gövdeden AYRIK (44 px), panel çok daha uzak (§2).
    // ⚠ Ust baslik ile baslik TEK BIRIM: aralarindaki 14 px bir blok araligi degil, bir
    // etiket baglantisi. Tabana cevirmek ikisini birbirinden KOPARIRDI (R-100 istisnasi).
    `                color: var(--kart-soluk); font-weight: 500; margin-bottom: ${olc(14)}px;`,
    `                display: flex; align-items: center; gap: 14px }`,
    `  .ust-baslik::before { content: ""; width: 30px; height: 2px; background: var(--kart-aksan) }`,
    // ⚠ Başlık SIKIŞIK ve İRİ; `line-height` 1,04 — 0,90'da Türkçe `Ş` kuyruğu alt satıra
    // giriyor ve "HEB" gibi okunuyor. Aksan kırpılması bu ailenin bilinen tuzağı.
    // ⚠ Punto artık sabit 82 px DEĞİL: reçetenin payı × render anında ölçülen tavan.
    // ── BAŞLIK: bölüm başlığı Montserrat, KAPAK H1'i Source Serif (D-317) ─────
    //
    // ⚠ ⚠ Sistem iki yüze iki AYRI iş veriyor ve sınırı sert çiziyor: Source Serif 4
    // "pazarlama sayfasının tek H1'i, başka hiçbir yer"; Montserrat "bölüm başlıkları
    // ve alt başlıklar, gövde metni asla". Karosel bir pazarlama yüzeyi: kapak o tek
    // H1, gövde slaytları bölüm başlığı. Aynı yüzü her slayda vermek, sistemin en açık
    // kuralını sessizce silmek olurdu.
    `  .baslik { font-family: "Marka Baslik", "Marka Metin", sans-serif;`,
    `            font-size: calc(var(--baslik-punto) * var(--ayar-olcek, 1));`,
    `            line-height: var(--baslik-lh);`,
    `            font-weight: var(--baslik-wght);`,
    `            font-feature-settings: ${OPENTYPE_CSS};`,
    `            letter-spacing: var(--baslik-ls);`,
    `            max-width: ${Math.round(G * t.baslikSutunu) - 128}px }`,
    // ⚠ ⚠ **KAPAK H1'İ SERİF — ve YALNIZ kapak.** Sistem Source Serif 4'e tek bir iş
    // veriyor. Ağırlık 500: serif bir display'de 700+ "kalın" değil "kaba" okunuyor ve
    // sistemin ölçeği de 500 diyor. Tracking negatif ama Montserrat'tan DAHA AZ: serif
    // formlar yan yana geldiğinde zaten sıkı görünür, aynı değer onları çakıştırır.
    // ⚠ `opsz` ekseni puntoya bağlı çalışıyor (`font-optical-sizing` varsayılan `auto`):
    // display puntoda daha ince tırnaklar ve daha yüksek kontrast, ikinci bir kesim
    // gerekmeden.
    // ── gövde slaytları kapaktan DAHA SESSİZ (R-88) ────────────────────────
    //
    // ⚠ ⚠ **ÖLÇÜLDÜ: gövde kartlarında metin kadrajın %36–38'ini kaplıyordu.** Sebep
    // tipografikti: her slayt kapakla AYNI punto payını kullanıyordu. Sistemin kendi
    // merdiveni bunu zaten reddediyor — Source Serif 4 "pazarlama sayfasının TEK H1'i",
    // Montserrat "bölüm başlığı". İki rol aynı büyüklükte olamaz; kapak kahraman,
    // gövde enstrüman.
    // ⚠ 0,82: kapak %42 tavanındayken gövde %30'un altına iniyor ve hiyerarşi tek
    // bakışta okunuyor. Daha sert bir düşüş (0,7) gövdeyi alt başlığa çeviriyordu.
    `  .kart:not(.ilk) .baslik { font-size: calc(var(--baslik-punto) * ${String(GOVDE_BASLIK_CARPANI)}`,
    `                              * var(--ayar-olcek, 1)) }`,
    // ⚠ ⚠ **AĞIRLIK 500 → 400 ve bu bir GENİŞLİK kararı.** Editoryal serifin 500'ü bir
    // medium: aynı kelimeyi belirgin biçimde genişletiyor ve dar başlık sütununda
    // puntoyu satın alıyor. Ölçüldü — `sahne` kapağı 500'de **81 px**'de sıkışıyor,
    // gövde kartları 134'e çıkıyor ve denetim hiyerarşiyi "çökmüş" sayıyor.
    // Reçete de zaten 400 diyor (`sahne` Literata opsz 60 **wght 400**).
    `  .kart.ilk .baslik { font-family: "Marka Display", "Marka Baslik", serif;`,
    `                      font-weight: 400; letter-spacing: -0.025em }`,
    `  .baslik strong { color: var(--kart-aksan); font-weight: inherit }`,
    // ⚠ ⚠ **VURGU ÇİPİ EMEKLİ (D-318).** Açık zeminde vurgulanan kelime DOLU bir kutuya
    // alınıyordu; gerekçesi ölçülmüştü (kâğıt üstüne eski amber aksan 1,9:1 veriyordu ve
    // renkle vurgulanamıyordu). Markanın dizayn sistemi o gerekçeyi ortadan kaldırdı:
    // kâğıt için AYRI bir aksan adımı var (#0b5bf0, 5.34:1). Ve sistemin anti-desen
    // listesi açık — **aksan asla bir zemin ya da büyük yüzey değildir**. Bir kelimenin
    // arkasındaki dolu kutu, karoselin en çok bakılan yerinde tam olarak o.
    // Vurgu artık iki yüzeyde de aynı şekilde çalışıyor: RENK, kutu değil.
    // ── gövde puntosu: ÖLÇÜLMÜŞ okuma eşiği (R-83) ──────────────────────────
    //
    // ⚠ ⚠ **TABAN 34 → 36 px ve bu sefer bir KAYNAĞI var.** Eski 34 "ölçüldü"
    // diyordu ama ölçülen şey bizim çıktımızdı, okuma eşiği değil. Okunabilirliğin ölçüsü
    // nominal punto değil harfin gözde kapladığı AÇIDIR: kritik punto 0,20° açısal
    // x-yüksekliği (Legge & Bigelow 2011, JOV), altında okuma hızı çöküyor. 32 cm telefon
    // mesafesinde 1080 px tuvalde bu **36 px** eder; gazete 0,23° = 40 px.
    //
    // ⚠ ⚠ **TABAN TUVAL GENİŞLİĞİNE ORANTILI, SABİT PİKSEL DEĞİL.** Sabit 34 px yazmak
    // 1080'i sözleşme sanmaktı; tuval 1440'a çıkarsa aynı sayı daha KÜÇÜK bir açı verir
    // ve taban sessizce eşik altına iner. Açı sabit, piksel türev.
    // ⚠ Blok ARASI bosluk tabandan (R-100); yedek deger tuvale cevrilmis 54 px, cunku
    // `panoramaHtml` tek basina cagrilirsa (editor onizlemesi) punto olcumu kosmamis olur.
    `  .govde { margin-top: calc(var(--taban, ${olc(54)}px) * 1);`,
    `           font-size: calc(max(${String(govdeTabani)}px, calc(var(--baslik-punto) * var(--govde-orani)))`,
    `                       * var(--ayar-olcek, 1));`,
    // ⚠ ⚠ **BU KURAL `.govde` BLOĞU KAPANDIKTAN SONRA gelmek ZORUNDA ve iki kez yanlış
    // yere kondu.** Önce ritim kuralından önce yazıldı — aynı özgüllükte sonra gelen
    // kazandığı için hiçbir şey değişmedi. Sonra "sonrasına" konduğu sanıldı; oysa
    // `.govde` kuralı ÇOK SATIRLI ve orada henüz kapanmamıştı, yani kural bir bildirim
    // bloğunun İÇİNE düşüp geçersiz oldu. İkisinde de `margin-top` hesaplanan değeri
    // `54px` kaldı ve yayık yerleşim sessizce `ust`a dönüştü — bir yerleşim değeri ölmüş,
    // hiçbir kapı bunu söylememişti.
    // ⚠ Başlık öbeği (etiket + başlık) üstte tek parça kalıyor, boşluğun TAMAMI başlıkla
    // gövde arasına gidiyor. `space-between` bunu dört ögeye bölüyordu ve ilk kurban
    // etiketti: `donen`de etiket→başlık 369 px, ailenin sekizinde 14 px. → R-112
    // ⚠ ⚠ **GENİŞLİK KOLONDAN BAĞIMSIZDI ve gövde büyüyünce TAŞTI.** `34ch` sabitti;
    // 34 px puntoda ~580 px eder, `editoryal`in metin kolonu ise 0,46 × 1080 − 128 = 369 px.
    // Gövde kolonu 200 px aşıp fotoğrafın altına giriyordu — punto tabanı (34 px) bunu
    // görünür yaptı, sebep olmadı; hata baştan oradaydı ve küçük puntoda saklanıyordu.
    // ⚠ `min()`: satır uzunluğu okunabilirlik için 34ch'i AŞMAMALI, kolonu da aşmamalı.
    `           line-height: 1.5; color: var(--kart-soluk);`,
    // ── ölçü BANDI: 45–75 karakter (R-86) ──────────────────────────────────
    //
    // ⚠ ⚠ **ÖLÇÜLDÜ: SATIR ÇOK DARDI, ÇOK GENİŞ DEĞİL.** Gövde başlığın sütununa
    // hapsedilmişti (`baslikSutunu`) ve gerçek satırlar tarayıcıda sayıldı:
    // `donen` **19**, `editoryal` 27, `sahne` 30 karakter. Butterick'in alt sınırı 45 —
    // yani üç şablon bandın çok altındaydı. Aşırı dar satır da okumayı bozar: göz her
    // satırda geri dönüyor ve ritim kırılıyor; kusur "taşma" gibi görünmediği için
    // hiçbir ölçüm onu görmüyordu.
    //
    // ⚠ **Gövde sütunu BAŞLIK sütunundan ayrıldı.** İkisi aynı sayıdan türerken bir
    // şablonun dar başlık tercihi (poster sesi) gövdeyi de daraltıyordu — oysa gövde
    // daha küçük puntoda ve aynı genişlikte çok daha fazla karakter taşır.
    // ⚠ Kart dolgusu (64+64) düşülüyor: `max-width` kartın kullanılabilir genişliğini
    // aşarsa taşma olur ve `tasma` kusuru doğar.
    `           max-width: clamp(${String(olcuAlt)}px, ${String(olcuHedef)}px, ${String(govdeSinir)}px) }`,
    ...(doc.yerlesim === 'yayik' ? [`  .govde { margin-top: auto }`] : []),
    // ⚠ ⚠ **İKİ `auto` PAY BOŞ ALANI PAYLAŞIR — ve bu bir GERİLEME üretti.** Kapanış
    // bloğu eklenince `yayik` yerleşimde hem `.govde` hem `.kapanis` `margin-top: auto`
    // aldı; ikisi boşluğu böldü ve gövde YUKARI çıkıp görselin üstüne oturdu
    // (`donen`: gövdenin %49'u görselin üstünde). Dibe itme hakkı TEK ögeye ait olmalı.
    // ⚠ Kapanış kartında o hak kapanışındır: imza içeriğin sonudur, gövde değil.
    `  .kart:has(.kapanis) .govde { margin-top: calc(var(--taban, ${olc(54)}px) * 1) }`,
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
    `             font-family: "Marka Mono", ui-monospace, monospace; font-weight: 700;`,
    `             letter-spacing: -0.055em;`,
    `             color: ${sol('--hayalet-renk', doc.hayaletKonumu?.guc ?? 7)}; letter-spacing: -0.05em;`,
    // ⚠ ⚠ **`line-height: 0.76` KEYFİ DEĞİL, `ust`U ANLAMLI KILAN ŞEY.** Varsayılan satır
    // yüksekliğinde kutunun tepesi ile glifin tepesi arasında ~0,25em boşluk var; 893 px'lik
    // bir rakamda bu 223 px demek. `akan-alan`da `ust: 56` verildiğinde rakam tuvalin ALTINA
    // taşıp tamamen kayboldu ve "hayalet yok" sanıldı. Satır yüksekliği sabitlenince `ust`
    // yaklaşık olarak GLİFİN tepesini gösteriyor — yani şablon yazarının kastettiği şeyi.
    `             line-height: ${HAYALET_SATIRI};`,
    `             pointer-events: none; white-space: nowrap; z-index: ${Z.zemin} }`,
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
    `  .kart > *:not(.hayalet):not(.ray) { position: relative; z-index: ${Z.metin} }`,
    `  .kart.optik-yuvarlak .ust-baslik, .kart.optik-yuvarlak .baslik,`,
    `  .kart.optik-yuvarlak .govde {`,
    `      margin-left: calc(var(--baslik-punto, 0px) * -${String(OPTIK_KACIK)}) }`,
    `  .kart.optik-tirnak .ust-baslik, .kart.optik-tirnak .baslik,`,
    `  .kart.optik-tirnak .govde {`,
    `      margin-left: calc(var(--baslik-punto, 0px) * -${String(OPTIK_TIRNAK)}) }`,
    // ── OKUNURLUK YASTIĞI DENENDİ ve ÜÇ SEBEPLE GERİ ALINDI (FAZ-19.7) ────────
    //
    // Reçetenin `C.5`b maddesi *"metnin arkasına yumuşak yerel karartma"* öneriyor ve
    // amacı `sus-metni-kesiyor`u karşılanabilir kılmak. Yazıldı, çizildi, ölçüldü:
    //
    // 1. **İŞE YARAMIYOR.** `veri-hikayesi` kart 1'de fark oranı %9,2. Yastık eklendi:
    //    **%9,2** — hiç kıpırdamadı. Yastık kırmızıya boyanıp %100 opak yapıldığında
    //    bile yalnız %7,3'e indi. Sebep `blur(26px)`: 69 px yüksekliğindeki bir kutuya
    //    26 px'lik bulanıklık uygulanınca kutunun TAMAMI yarı saydam oluyor. **Yumuşak
    //    bir yastık, tanımı gereği örtemez.** Ölçülen fark tam olarak çiplerin
    //    ARASINDAKİ boşluklardı (3 boşluk × ~14 px × 69 px ≈ %9).
    // 2. **HALE BIRAKIYOR.** Düz koyu kartta başlığın etrafında hafif ama görülebilir
    //    bir dikdörtgen — bu fazın yasakladığı *"html css gibi duruyor"*un ta kendisi.
    // 3. **R-81 zaten yasaklıyor:** `panorama.ts`te `sozde-oge` tavanı 0. Kural haklı.
    //
    // **Doğru çözüm taşıyıcıyı MASKELEMEK** ve maske kutuları ancak düzen ÖLÇÜLDÜKTEN
    // sonra bilinebilir (`duzenProvasi`, D-347). Yani bu, CSS'e yazılacak bir kural
    // değil, provanın ölçümünü render'a taşıyan bir ADIM. `veri-hikayesi` köşegeni o
    // adım gelene kadar görünmez kalıyor — kanıtı `docs/kurallar/OLCUMLER.md`'de.
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
    // ⚠ ⚠ **`width: 100%` EKLENDİ ve sebebi ÖLÇÜLDÜ: ÇUBUK GRAFİĞİ VERİ TAŞIMIYORDU.**
    // Kart bir flex sütunu ve `align-items: flex-start`; panelin eni içeriğine kilitleniyor,
    // yani `.cubuk-yuva { flex: 1 }` büyüyecek boşluk BULAMIYOR. Ölçüldü — `veri-hikayesi`
    // kartlarında yuva **10 px**, `karsilastirma`da 42 px. Üç ayrı değerin (62 · 71 · 58)
    // üçü de aynı minik kare olarak çiziliyordu: bir çubuk grafiği, çubuksuz.
    // ⚠ `max-width` bunu ÇÖZMÜYOR — max bir tavan, taban değil. Panel bugüne kadar
    // görünüyordu, o yüzden kimse bakmadı; hata küçük panelde saklanıyordu.
    `  .panel { width: 100%; padding: calc(4px * var(--panel-olcek)) 0 calc(4px * var(--panel-olcek)) calc(26px * var(--panel-olcek)); max-width: calc(640px * var(--panel-olcek));`,
    `           border-left: 3px solid var(--kart-aksan) }`,
    `  .panel-baslik { font-size: calc(16px * var(--panel-olcek)); letter-spacing: 0.16em; color: ${sol('--kart-metin', 50)};`,
    `                  margin-bottom: calc(18px * var(--panel-olcek)); font-weight: 600 }`,
    `  .cubuk-satir { display: flex; align-items: center; gap: calc(12px * var(--panel-olcek)); margin-bottom: calc(11px * var(--panel-olcek)) }`,
    // ⚠ ⚠ **SABİT GENİŞLİK DEĞİL, TABAN GENİŞLİK (R-23).** `width` sabitti ve Türkçe
    // etiket ("A vardiyası") sığmadan TAŞIYORDU — çizildi ve bakıldı, "vardiyası"
    // sağdan kesiliyordu. Ama tamamen içerik boyuna bırakmak da yanlış: çubukların
    // hizası bir eksen ve eksen kayarsa grafik grafik olmaktan çıkar.
    // ⚠ `flex: none` + `min-width` ikisini uzlaştırıyor: sütun en az tabanı kadar geniş,
    // gerekirse Türkçe kelimeye açılıyor, çubuklar kalan yeri paylaşıyor.
    `  .cubuk-etiket { flex: none; min-width: calc(64px * var(--panel-olcek));`,
    `                  font-size: calc(18px * var(--panel-olcek)); color: ${sol('--kart-metin', 60)};`,
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
    // ⚠ ⚠ **RAKAM MONO (D-317).** Sistem "tabular numerals everywhere a figure appears"
    // diyor ve rakamları JetBrains Mono'ya veriyor: bir sayı bir kelime değildir, bir
    // ÖLÇÜMDÜR ve iki slayt arasında sütunu kaymamalı.
    `  .sayi { font-family: "Marka Mono", ui-monospace, monospace;`,
    `          font-size: calc(74px * var(--panel-olcek)); font-weight: 700;`,
    `          letter-spacing: -0.03em;`,
    `          font-variant-numeric: tabular-nums;`,
    `          color: var(--kart-aksan); line-height: 1 }`,
    `  .birim { font-size: calc(26px * var(--panel-olcek)); margin-left: calc(8px * var(--panel-olcek)); color: ${sol('--kart-metin', 70)} }`,
    `  .sayi-alt { font-size: calc(18px * var(--panel-olcek)); color: ${sol('--kart-metin', 60)}; margin-top: calc(8px * var(--panel-olcek)) }`,
    `  .vafel { display: grid; grid-template-columns: repeat(10, 1fr); gap: calc(5px * var(--panel-olcek)); width: calc(300px * var(--panel-olcek)) }`,
    `  .vafel-kare { width: 100%; aspect-ratio: 1; background: ${sol('--kart-metin', 9)};`,
    `                border-radius: 2px }`,
    `  .vafel-kare.dolu { background: var(--kart-aksan) }`,
    `  .liste-satir { display: flex; gap: calc(14px * var(--panel-olcek)); align-items: baseline; margin-bottom: calc(10px * var(--panel-olcek)) }`,
    // ⚠ ⚠ **SÖNÜK SATIR SİLİNMİŞ DEĞİL, GERİ ÇEKİLMİŞTİR.** Opaklık 0,38: okunuyor ama
    // yarışmıyor. Daha düşüğü listeyi "gri bir leke" yapar ve bütünü göstermenin anlamı
    // kalmaz; daha yükseği yanık satırı öldürür. Yanık satır ayrıca AKSAN taşıyor —
    // aksan disiplini (vurgu ≤2) metin içindir, bir dizinin ŞU AN işaretini kapsamaz.
    `  .liste-satir.sonuk { opacity: 0.38 }`,
    // ⚠ ⚠ **YAYIK LİSTE — ölü bandı DOLDURAN şey, eklenen bir kutu DEĞİL.** Boşluğa bir
    // öge koymak R-81'in saydığı "kodlanmış öge"yi artırırdı ve tam da şikâyet edilen
    // HTML-CSS görüntüsünü üretirdi. Burada eklenen hiçbir şey yok: var olan dört madde
    // kadrajın boyuna dağılıyor. Soldaki `border-left` — zaten çizili — bir omurga
    // uzunluğuna kavuşuyor.
    // ⚠ `flex: 1` kartın kalan yüksekliğini panele veriyor; `min-height: 0` olmadan
    // flex çocuğu içeriğinden küçülemez ve rayı aşağı iter.
    `  .panel.yayik { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;`,
    `                 justify-content: space-between; padding-bottom: calc(30px * var(--panel-olcek)) }`,
    `  .panel.yayik .liste-satir { margin-bottom: 0 }`,
    `  .liste-satir.yanik .liste-ad { color: var(--kart-metin); font-weight: 600 }`,
    `  .liste-no { font-family: "Marka Mono", ui-monospace, monospace; font-size: calc(22px * var(--panel-olcek));`,
    `              color: var(--kart-aksan); font-variant-numeric: tabular-nums;`,
    `              font-weight: 800; min-width: calc(32px * var(--panel-olcek)) }`,
    `  .liste-ad { font-size: calc(22px * var(--panel-olcek)) }`,
    `  .liste-ikon { display: flex; align-items: center; width: calc(21px * var(--panel-olcek)); flex: none }`,
    `  .etiketler { display: flex; flex-wrap: wrap; gap: calc(10px * var(--panel-olcek)); max-width: calc(620px * var(--panel-olcek)) }`,
    // ⚠ ⚠ **ÇİP SAYDAMDI ve iki ayrı kusuru aynı anda üretiyordu.** (1) Denetim
    // *"süs ögesi etiket metninin %99,3'ünün arkasından geçiyor"* dedi — taşıyıcı
    // görünür olur olmaz çipin İÇİNDEN geçmeye başladı; süs değil ÇİP kusurluydu.
    // (2) `999px` yarıçap + 1 px kontur, denetçinin *"haplar UI filtre çipi gibi"*
    // dediği görünümün ta kendisi: bir yazılım arayüzü ögesi, basılmış bir etiket değil.
    // ⚠ ⚠ **YARIÇAP 0** — reçetenin `C.4` kuralı: ya 0 ya ≥28 px; arası "bootstrap
    // kartı" bandı. Basılı bir künye etiketi keskin köşelidir.
    // ⚠ Zemin saf renk DEĞİL: yüzey adımı + 1 px iç ışık. Çip artık gerçek bir yüzey,
    // yani arkasından geçen hiçbir şey içinden görünmüyor — `C.5`in z-sırası
    // sözleşmesini kutu kutu kurmanın en ucuz yolu.
    `  .etiket { background: color-mix(in oklab, var(--kart-metin) 9%, var(--kart-zemin));`,
    `            border: 0; border-radius: 0; box-shadow: inset 0 1px 0 ${sol('--kart-metin', 10)};`,
    `            padding: calc(8px * var(--panel-olcek)) calc(16px * var(--panel-olcek)); font-size: calc(18px * var(--panel-olcek)); color: ${sol('--kart-metin', 88)} }`,
    // ── bant ────────────────────────────────────────────────────────────────
    // ⚠ Bant 560 px: 300 px'te eğri dibe yapışıyor ve "hikâye" okunmuyordu. Yükseklik
    // eğrinin anlatabileceği fark kadar olmalı.
    // ⚠ `.bant-ok` İLK SÜRÜMDE LİSTEDE YOKTU: SVG basılıyor ama boyutsuz kalıyor ve
    // hiç çizilmiyordu. Oklar `sahne` şablonunun iki süreklilik ögesinden biri — yokluğu
    // şablonu yarıya indiriyordu ve ancak render'a bakınca görüldü.
    `  .lekeler { position: absolute; left: 0; top: 0; width: ${toplam}px;`,
    `             height: ${doc.yukseklik}px; z-index: ${Z.zemin}; pointer-events: none }`,
    // ⚠ Kart zemini z-index 1'de; `ust` lekeler 2'de, görseller 3'te. Sıra tesadüf değil:
    // daire kart renginin ÜSTÜNDE, ürünün ALTINDA durmalı (referans: `image copy 3`).
    `  .lekeler.ust { z-index: ${Z.lekeUst} }`,
    `  .alan-siniri { position: absolute; left: 0; top: 0; width: ${toplam}px;`,
    `                 height: ${doc.yukseklik}px; z-index: ${Z.zemin} }`,
    `  .bant-ok { position: absolute; left: 0; top: 0; width: ${toplam}px;`,
    `             height: ${doc.yukseklik}px; z-index: ${Z.tasiyici}; pointer-events: none }`,
    // ⚠ Band yüksekliği şablondan gelebiliyor (`bant.yukseklik`); verilmezse ortak 560.
    `  .bant, .bant-kemer { position: absolute; left: 0; bottom: ${olc(120)}px;`,
    `                       width: ${toplam}px;`,
    `                       height: ${olc(doc.bant?.tip === 'kemer' ? (doc.bant.yukseklik ?? 560) : 560)}px;`,
    `                       z-index: ${Z.tasiyici} }`,
    `  .kilometre { position: absolute; bottom: ${olc(120)}px; z-index: ${Z.durak};`,
    `               transform: translateX(-50%);`,
    `               text-align: center }`,
    `  .kilometre-nokta { display: block; width: ${olc(13)}px; height: ${olc(13)}px;`,
    `                     border-radius: 50%;`,
    `                     background: var(--pano-aksan); margin: 0 auto ${olc(8)}px }`,
    `  .kilometre-etiket { font-size: ${olc(16)}px; letter-spacing: 0.1em;`,
    `                      color: var(--pano-metin);`,
    `                      white-space: nowrap; font-weight: 600;`,
    `                      font-variant-numeric: tabular-nums }`,
    // ── ölçek çizgisi: enstrüman skalası, panoramayı kat ediyor (D-319) ─────
    //
    // ⚠ Çizgi bir KENARLIK, tırtıklar bir TEKRAR: ikisi de CSS'in kendi dili. Kodlanmış
    // SVG ögesi yok (R-81).
    `  .olcek-cizgi { position: absolute; left: 0; width: ${toplam}px; height: 0;`,
    `                 border-top: 1px solid ${sol('--pano-metin', 34)}; z-index: ${Z.tasiyici};`,
    `                 pointer-events: none }`,
    `  .olcek-tirtik { position: absolute; left: 0; width: ${toplam}px; height: 9px;`,
    `                  transform: translateY(-9px); z-index: ${Z.tasiyici}; pointer-events: none;`,
    `                  background-image: linear-gradient(to right,`,
    `                    ${sol('--pano-metin', 30)} 1px, transparent 1px);`,
    `                  background-repeat: repeat-x }`,
    // ⚠ Durak tırtığı AKSAN ve daha uzun: eşit aralıklı tırtıklar ölçeği, durak ise
    // içeriğin nerede olduğunu söylüyor. İkisi aynı renkte olsaydı ölçek bir desene,
    // durak da bir tekrara dönerdi.
    `  .olcek-durak { position: absolute; width: 2px; height: 26px; z-index: ${Z.lekeUst};`,
    `                 transform: translate(-1px, -26px); background: var(--pano-aksan);`,
    `                 pointer-events: none }`,
    // Etiket MONO ve BUYUK HARF: sistemin `micro` kurali — bir olcek etiketi duzyazi
    // degil, bir OKUMADIR.
    `  .olcek-etiket { position: absolute; transform: translateX(-50%);`,
    `                  font-family: "Marka Mono", ui-monospace, monospace; font-size: 15px;`,
    `                  letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500;`,
    `                  color: ${sol('--pano-metin', 62)}; white-space: nowrap; z-index: ${Z.durak};`,
    `                  font-variant-numeric: tabular-nums }`,
    // ── alt ray: her slaytta aynı yerde, ritmi taşıyan tekrar ────────────────
    // ⚠ Ray `.gorsel`in (z-index 4) ÜSTÜNDE: alt kenardan taşan kesik özne rayı örtüyordu
    // ve marka imzası ile kaynak satırı görünmez oluyordu. Ölçüldü, D-300.
    `  .ray { position: absolute; left: ${olc(64)}px; right: ${olc(64)}px;`,
    `         bottom: ${olc(46)}px; z-index: ${Z.metin};`,
    `         display: flex; gap: ${olc(40)}px; align-items: center;`,
    `         border-top: 1px solid ${sol('--ray-metin', 10)}; padding-top: ${olc(20)}px;`,
    `         font-size: ${olc(18)}px; letter-spacing: 0.13em;`,
    `         color: ${sol('--ray-metin', 48)} }`,
    `  .ray-sayac { margin-left: auto; color: var(--ray-aksan); font-weight: 700;`,
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
    `  .ray { padding-bottom: ${olc(30)}px; margin-bottom: ${olc(-30)}px;`,
    `         margin-left: ${olc(-64)}px; margin-right: ${olc(-64)}px;`,
    `         padding-left: ${olc(64)}px; padding-right: ${olc(64)}px;`,
    `         background: linear-gradient(to top,`,
    // ⚠ ⚠ **DOLGU %62'DE BİTİYORDU ve şerit panoramanın ögesi olunca bu YETMEDİ.** Kart
    // zeminine bağlıyken şeridin altındaki yüzey zaten aynı renkti; artık `donen`de kart
    // AÇIK, ray KOYU. Sayacın üst kısmı solan bölgeye düşünce R-95 kırmızı döndü
    // (`ray-sayac` yüzeyinin %8'i metin lumasına 44'ten yakın). Dolgu kendi rayını
    // taşımak zorunda: %86'ya kadar tam, üstünde yumuşak bir çıkış.
    `                     color-mix(in srgb, var(--ray-zemin) 96%, transparent) 0%,`,
    `                     color-mix(in srgb, var(--ray-zemin) 94%, transparent) 86%,`,
    `                     color-mix(in srgb, var(--ray-zemin) 0%, transparent) 100%) }`,
    `  .ray-sol { flex: none; white-space: nowrap }`,
    `  .ray-orta { min-width: 0; overflow: hidden; text-overflow: ellipsis;`,
    `         white-space: nowrap }`,
    // ⚠ Kesikli çerçeve + uyarı rengi: eksiklik GÖRÜLSÜN diye. Rengi zeminden türüyor —
    // sabit kırmızı, kâğıt kartta da koyu kartta da aynı görünmez (R-95 ailesi).
    `  .ray-orta-bos { border: 1px dashed ${sol('--ray-metin', 38)};`,
    `         padding: ${olc(2)}px ${olc(10)}px; color: ${sol('--ray-metin', 70)};`,
    `         border-radius: ${olc(3)}px }`,
    `  .ray-ifsa { margin-left: auto; opacity: 0.85; flex: none; white-space: nowrap }`,
    `  .ray-ifsa + .ray-sayac { margin-left: ${olc(40)}px }`,
    // ── görsel katmanı ──────────────────────────────────────────────────────
    `  .gorsel, .gorsel-yer { position: absolute; z-index: ${Z.gorsel}; object-fit: cover }`,
    `  .gorsel.kesik, .gorsel-yer.kesik { object-fit: contain; object-position: bottom }`,
    `  .gorsel.daire, .gorsel-yer.daire { border-radius: 50%; object-fit: cover }`,
    // ⚠ ⚠ **YER TUTUCU HER ZEMİNDE GÖRÜNMEK ZORUNDA.** İlk sürüm beyaz-şeffaf çizgi
    // kullanıyordu ve açık zeminli şablonlarda (`memphis`, `editoryal`) tamamen
    // kayboluyordu — kimliği görsel olan iki şablon BOŞ görünüyordu. Eksik bir taşıyıcı,
    // görünmezse eksik sayılmaz ve tasarım tam sanılır.
    // Yer tutucu bir uyarıdır, bir süs değil — ama uyarı da AKSANI harcamamalı (D-318):
    // aksan karneli ve karoselde kapağın vurgusuna, süreklilik ögesine ve sayaca ait.
    // Kart başına hesaplanan SOLUK renk iki zeminde de okunuyor (#989898 / #696969) ve
    // yer tutucu artık "eksik" gibi duruyor, "tasarım" gibi değil.
    // ⚠ ⚠ **RENK PANORAMA DÜZEYİNDEN — kart değişkeni burada TANIMSIZ.** Yer tutucu
    // kartların dışında yaşıyor (z-index 4, panorama koordinatı); `--kart-soluk` ona
    // miras kalmıyor ve kenarlık sessizce görünmez oluyordu. Çizildi, bakıldı, yoktu.
    `  .gorsel-yer { border: 1px dashed ${sol('--pano-metin', 45)}; display: flex;`,
    `                align-items: center; justify-content: center; text-align: center;`,
    `                color: ${sol('--pano-metin', 62)}; font-size: 18px; letter-spacing: 0.08em;`,
    `                text-transform: uppercase; font-weight: 500; padding: 20px;`,
    `                font-family: "Marka Mono", ui-monospace, monospace }`,
    `  .gorsel-yer.daire { border-radius: 50% }`,
    '</style>',
    `<body data-surface="kreatif">`,
    // ⚠ Yalnız KULLANILAN işlemin tanımı basılıyor: kullanılmayan bir `<filter>` ölü
    // biçimlendirme (FAZ-12.2 ile aynı gerekçe).
    (doc.gorselIslemleri ?? []).map((i) => islemTanimi(i)).join(''),
    `<div id="sahne">`,
    alanKatmani,
    lekeKatmani,
    bantSvg(doc.bant, toplam, doc.yukseklik, G),
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
    // ⚠ ⚠ **KENDİ ÇARPANINI BİLMEYEN OTURMA ÖLÇÜMÜ HİÇBİR ŞEY KANITLAMAZ.** Arama
    // "hepsine sığan" bir punto buluyordu; sonra kapak \`baslikPayi\` ile çarpılıyor,
    // gövde kartları ise \`GOVDE_BASLIK_CARPANI\` ile küçülüyordu. Yani ölçülen sayı
    // ile ÇİZİLEN sayı farklıydı ve fark kapakta 1,18 kat: sığan 108, çizilen 127,4.
    // Artık her başlık KENDİ çarpanıyla sınırlanıyor ve tavan ikisinin küçüğü.
    let sinirPunto = 1e9
    for (const b of basliklar) {
      const sinir = ${sutunSiniri}
      const carpan = b.closest('.kart') && b.closest('.kart').classList.contains('ilk')
        ? 1 : ${String(GOVDE_BASLIK_CARPANI)}
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
      if (alt / carpan < sinirPunto) sinirPunto = alt / carpan
    }
    const punto = Math.min(tavan * ${t.baslikPayi}, sinirPunto)
    // AŞAĞI yuvarlaniyor, en yakina DEGIL: toFixed(1) sigdirilan sayiyi 0,05 px
    // BUYUTEBILIYOR ve o kadari editoryal kapaginda 2 px tasma olarak geri geldi.
    // Bir oturma olcumunun yazdigi sayi, olctugu sayidan buyuk olamaz.
    sahne.style.setProperty('--baslik-punto', (Math.floor(punto * 10) / 10).toFixed(1) + 'px')
    // -- taban cizgisi izgarasi: RITIM METINDEN TURUYOR (R-100) ---------------
    //
    // ⚠ ⚠ TABAN SABIT BIR SAYI DEGIL ve faz plani oyle varsayiyordu (40 x 1,35 = 54).
    // Olculdu: gercek satir araligi 1,50 ve govde puntosu sablondan sablona degisiyor —
    // 54 · 54,9 · 59,1 · 60,6 · 61,2. Sabit 54, ALTIDAN BESINDE yanlis olurdu.
    // Govde puntosu baslik puntosuna bagli, o da bu aramanin sonucu: taban ancak
    // BURADA, punto belli olduktan SONRA bilinebilir.
    const govde = document.querySelector('.govde')
    if (govde) {
      const aralik = parseFloat(getComputedStyle(govde).lineHeight)
      if (aralik > 0) sahne.style.setProperty('--taban', aralik.toFixed(1) + 'px')
    }
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
      // ── biçim UZANTIDAN türüyor (R-90) ──────────────────────────────────
      //
      // ⚠ ⚠ **API YALNIZ JPEG KABUL EDİYOR** (*"JPEG is the only image format
      // supported"*, Meta Content Publishing) ve burası sabit `png` yazıyordu. Yani
      // hattın ürettiği her slayt yayın anında reddedilecekti — dört görsel ve bir
      // insan onayı harcandıktan SONRA.
      //
      // ⚠ Biçim çağıranın verdiği YOLDAN okunuyor, bir parametreden değil: dosya adı
      // `.jpg` derken içeriğin PNG olması, defterin kendi kendine yalan söylemesidir.
      // Arşiv/denetim yolu PNG istemeye devam edebilir; yayın yolu `.jpg` ister.
      const jpeg = /\.jpe?g$/i.test(yol)
      await page.screenshot({
        path: yol,
        ...(jpeg ? { type: 'jpeg' as const, quality: 92 } : { type: 'png' as const }),
      })
    }
    return { yollar: ciktiYollari, genislik: doc.slaytGenisligi }
  })
}
